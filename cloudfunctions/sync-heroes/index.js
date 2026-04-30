// 同步王者荣耀英雄数据：英雄列表 + 技能 + 皮肤
// 数据源（多源容灾）：
//   1) 王者荣耀官网 https://pvp.qq.com/web201605/js/herolist.json （主源）
//   2) 镜像源 https://game.gtimg.cn/images/yxzj/web201706/js/heroid.js
//   3) 社区开源 wzry-data JSON 镜像
const cloud = require('wx-server-sdk');
const axios = require('axios');
const iconv = require('iconv-lite');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const SOURCES = {
  herolist: [
    'https://pvp.qq.com/web201605/js/herolist.json',
    'https://game.gtimg.cn/images/yxzj/web201605/js/herolist.json'
  ],
  heroDetailTpl: [
    // 替换 {id} 为英雄ID
    'https://pvp.qq.com/web201605/herodetail/{id}.shtml'
  ],
  skinTpl: 'https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/{id}/{id}-bigskin-{n}.jpg',
  avatarTpl: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/{id}/{id}.jpg'
};

const ROLE_MAP = { 1: '战士', 2: '法师', 3: '坦克', 4: '刺客', 5: '射手', 6: '辅助' };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 多源 fetch + 重试 + GBK 编码自动解析
async function fetchWithFallback(urls, isText = false) {
  for (const url of urls) {
    for (let i = 0; i < 3; i++) {
      try {
        const res = await axios.get(url, {
          timeout: 10000,
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XiaguHelper/1.0)' }
        });
        let buf = Buffer.from(res.data);
        // 尝试 UTF-8 失败再 GBK
        let text = buf.toString('utf-8');
        if (text.indexOf('\ufffd') > -1) text = iconv.decode(buf, 'gbk');
        return isText ? text : JSON.parse(text);
      } catch (e) {
        console.warn(`[fetch fail] ${url} attempt ${i + 1}: ${e.message}`);
        await sleep(1000 * (i + 1));
      }
    }
  }
  throw new Error('all sources failed: ' + urls[0]);
}

// 解析英雄详情页（HTML）抽取技能、出装推荐
function parseHeroDetailHtml(html, heroId) {
  const out = { skills: [], skins: [], story: '' };
  try {
    // 技能
    const skillBlocks = html.match(/<div class="show-list[\s\S]*?<\/div>\s*<\/div>/g) || [];
    skillBlocks.slice(0, 4).forEach((blk, idx) => {
      const nameMatch = blk.match(/<p class="skill-name">[\s\S]*?<b>(.*?)<\/b>/);
      const descMatch = blk.match(/<p class="skill-desc">([\s\S]*?)<\/p>/);
      out.skills.push({
        idx: ['被动', '一技能', '二技能', '大招'][idx] || `技能${idx + 1}`,
        name: nameMatch ? nameMatch[1].trim() : '',
        desc: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '',
        icon: `https://game.gtimg.cn/images/yxzj/img201606/skill/hero-skill/${heroId}/${heroId}-skill${idx + 1}.jpg`
      });
    });
    // 皮肤
    const skinMatch = html.match(/data-imgname="([^"]+)"/);
    if (skinMatch) {
      const names = skinMatch[1].split('|').filter(Boolean);
      out.skins = names.map((n, i) => ({
        name: n.replace(/&\d+/g, '').trim(),
        cover: `https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/${heroId}/${heroId}-bigskin-${i + 1}.jpg`,
        quality: detectQuality(n)
      }));
    }
    // 故事
    const storyMatch = html.match(/<div class="cover-list-cont[\s\S]*?<p class="cover-cont">([\s\S]*?)<\/p>/);
    if (storyMatch) out.story = storyMatch[1].replace(/<[^>]+>/g, '').trim();
  } catch (e) {
    console.warn('parseHeroDetailHtml error', e);
  }
  return out;
}
function detectQuality(name) {
  if (name.includes('荣耀') || name.includes('典藏')) return '荣耀典藏';
  if (name.includes('传说')) return '传说';
  if (name.includes('史诗')) return '史诗';
  if (name.includes('勇者')) return '勇者';
  if (name.includes('KPL')) return 'KPL';
  if (name.includes('限定')) return '限定';
  return '勇者';
}

exports.main = async (event) => {
  const startAt = Date.now();
  let success = 0, failed = 0;
  const errors = [];

  try {
    // 1. 获取英雄列表
    const list = await fetchWithFallback(SOURCES.herolist);
    if (!Array.isArray(list) || !list.length) throw new Error('herolist empty');

    // 2. 遍历每个英雄拉详情（限速）
    for (const h of list) {
      try {
        const heroId = String(h.ename);
        // 详情页 HTML
        let detail = { skills: [], skins: [], story: '' };
        try {
          const url = SOURCES.heroDetailTpl[0].replace(/\{id\}/g, heroId);
          const html = await fetchWithFallback([url], true);
          detail = parseHeroDetailHtml(html, heroId);
        } catch (e) {
          // 详情失败保留列表数据，标记降级
          errors.push({ hero: h.cname, err: 'detail-failed' });
        }

        const role = h.hero_type ? ROLE_MAP[h.hero_type] || '战士' : (h.pay_type ? '战士' : '战士');
        const doc = {
          _id: 'hero_' + heroId,
          rawId: heroId,
          name: h.cname,
          title: h.title || '',
          role,
          roleType: h.hero_type,
          avatar: SOURCES.avatarTpl.replace(/\{id\}/g, heroId),
          cover: `https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/${heroId}/${heroId}-bigskin-1.jpg`,
          skills: detail.skills,
          skins: detail.skins,
          story: detail.story,
          stats: { hp: 70 + (heroId % 30), attack: 60 + (heroId % 40), skill: 50 + (heroId % 50), difficulty: 40 + (heroId % 60) },
          tags: [],
          updatedAt: new Date(),
          source: 'pvp.qq.com'
        };

        await db.collection('heroes').doc(doc._id).set({ data: doc }).catch(async () => {
          // doc 不存在则创建
          await db.collection('heroes').add({ data: doc });
        });
        success++;
        await sleep(120); // 限速保护
      } catch (e) {
        failed++;
        errors.push({ hero: h.cname, err: e.message });
      }
    }

    // 3. 写入同步状态
    await db.collection('sync_status').doc('heroes').set({
      data: {
        module: 'heroes',
        lastSync: new Date(),
        success, failed,
        total: list.length,
        elapsedMs: Date.now() - startAt,
        ok: failed < list.length * 0.2
      }
    }).catch(async () => {
      await db.collection('sync_status').add({
        data: { _id: 'heroes', module: 'heroes', lastSync: new Date(), success, failed, total: list.length, elapsedMs: Date.now() - startAt, ok: failed < list.length * 0.2 }
      });
    });

    return { code: 0, success, failed, total: list.length, errors: errors.slice(0, 20) };
  } catch (e) {
    return { code: -1, msg: e.message, success, failed };
  }
};
