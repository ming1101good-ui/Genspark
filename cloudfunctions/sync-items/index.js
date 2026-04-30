// 同步装备 + 铭文 + 推荐搭配
// 数据源:
//   - https://pvp.qq.com/web201605/js/item.json （装备）
//   - https://pvp.qq.com/web201605/js/mingwen.json （铭文）
const cloud = require('wx-server-sdk');
const axios = require('axios');
const iconv = require('iconv-lite');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const ITEM_SOURCES = [
  'https://pvp.qq.com/web201605/js/item.json',
  'https://game.gtimg.cn/images/yxzj/web201605/js/item.json'
];
const RUNE_SOURCES = [
  'https://pvp.qq.com/web201605/js/mingwen.json',
  'https://game.gtimg.cn/images/yxzj/web201605/js/mingwen.json'
];

const ITEM_CAT_MAP = { 1: '攻击', 2: '法术', 3: '防御', 4: '移动', 5: '打野', 6: '辅助' };
const RUNE_COLOR_MAP = { 1: '红色', 2: '蓝色', 3: '绿色' };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJson(urls) {
  for (const url of urls) {
    for (let i = 0; i < 3; i++) {
      try {
        const res = await axios.get(url, {
          timeout: 10000, responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        let buf = Buffer.from(res.data);
        let text = buf.toString('utf-8');
        if (text.indexOf('\ufffd') > -1) text = iconv.decode(buf, 'gbk');
        return JSON.parse(text);
      } catch (e) {
        console.warn(`[items fetch fail] ${url}: ${e.message}`);
        await sleep(1000 * (i + 1));
      }
    }
  }
  throw new Error('all sources failed');
}

// 经典铭文搭配（这部分用半结构化静态生成 + 推荐英雄关联）
const COMBO_TEMPLATES = [
  {
    id: 'cb-shooter-pen',
    name: '射手通用穿透铭文',
    summary: '红色穿透 + 绿色穿透 + 蓝色攻速移速，最大化输出能力。',
    runes: ['红·惊鸷×10', '绿·鹰眼×10', '蓝·狩猎×10'],
    applyTo: '后羿、伽罗、虞姬、马可波罗、孙尚香',
    buildTips: '前期裸出末世/无尽，配合穿透铭文打肉非常稳定',
    counter: '对面坦克过多时，可换回纯穿透出装。'
  },
  {
    id: 'cb-warrior-pen',
    name: '战士前期压制铭文',
    summary: '红色异变 + 绿色盘蛇 + 蓝色霸断',
    runes: ['红·异变×10', '绿·盘蛇×10', '蓝·霸断×10'],
    applyTo: '关羽、夏侯惇、马超、典韦',
    buildTips: '前期无双之刃 / 抵抗之靴抗压',
    counter: '怕被风筝。'
  },
  {
    id: 'cb-mage-burst',
    name: '法刺爆发铭文',
    summary: '红色梦魇 + 绿色心眼 + 蓝色狩猎',
    runes: ['红·梦魇×10', '绿·心眼×10', '蓝·狩猎×10'],
    applyTo: '不知火舞、上官婉儿、貂蝉、王昭君',
    buildTips: '面具+痛苦+辉月输出三件套',
    counter: '怕被强开。'
  },
  {
    id: 'cb-assassin',
    name: '物理刺客出装铭文',
    summary: '红色惊鸷 + 绿色鹰眼 + 蓝色狩猎',
    runes: ['红·惊鸷×10', '绿·鹰眼×10', '蓝·狩猎×10'],
    applyTo: '李白、韩信、阿珂、澜、云中君',
    buildTips: '影刃 / 极影必出',
    counter: '怕半肉装战士。'
  },
  {
    id: 'cb-tank',
    name: '坦克吃伤害铭文',
    summary: '红色调和 + 绿色虚空 + 蓝色隐匿',
    runes: ['红·调和×10', '绿·虚空×10', '蓝·隐匿×10'],
    applyTo: '张飞、刘邦、东皇太一、廉颇',
    buildTips: '近卫荣耀+抵抗之靴+不死鸟',
    counter: '怕真伤英雄。'
  }
];

exports.main = async () => {
  const startAt = Date.now();
  let success = 0, failed = 0;

  // 1) 装备
  try {
    const items = await fetchJson(ITEM_SOURCES);
    for (const it of items) {
      try {
        const cat = ITEM_CAT_MAP[it.item_type] || '其他';
        const doc = {
          _id: 'item_' + it.item_id,
          rawId: it.item_id,
          name: it.item_name,
          cat,
          rawType: it.item_type,
          price: it.price || 0,
          sell: it.sell || 0,
          icon: 'https://game.gtimg.cn/images/yxzj/img201606/itemicon/' + it.item_id + '.jpg',
          desc: (it.des1 || '').replace(/<[^>]+>/g, ''),
          passive: (it.des2 || '').replace(/<[^>]+>/g, ''),
          updatedAt: new Date()
        };
        await db.collection('items').doc(doc._id).set({ data: doc }).catch(async () => {
          await db.collection('items').add({ data: doc });
        });
        success++;
      } catch (e) { failed++; }
    }
  } catch (e) { console.error('item sync error', e); }

  // 2) 铭文
  try {
    const runes = await fetchJson(RUNE_SOURCES);
    for (const rn of runes) {
      try {
        const color = RUNE_COLOR_MAP[rn.type] || '未知';
        const doc = {
          _id: 'rune_' + rn.id,
          rawId: rn.id,
          name: rn.name,
          color,
          rawType: rn.type,
          icon: 'https://game.gtimg.cn/images/yxzj/img201606/mingwenicon/' + rn.id + '.jpg',
          attrs: rn.attribute || '',
          desc: (rn.des || '').replace(/<[^>]+>/g, ''),
          updatedAt: new Date()
        };
        await db.collection('runes').doc(doc._id).set({ data: doc }).catch(async () => {
          await db.collection('runes').add({ data: doc });
        });
        success++;
      } catch (e) { failed++; }
    }
  } catch (e) { console.error('rune sync error', e); }

  // 3) 经典搭配（基础模板，后续 sync-master 会丰富）
  for (const c of COMBO_TEMPLATES) {
    try {
      await db.collection('combos').doc(c.id).set({
        data: { ...c, updatedAt: new Date() }
      }).catch(async () => {
        await db.collection('combos').add({ data: { _id: c.id, ...c, updatedAt: new Date() } });
      });
      success++;
    } catch (e) { failed++; }
  }

  await db.collection('sync_status').doc('items').set({
    data: { module: 'items', lastSync: new Date(), success, failed, elapsedMs: Date.now() - startAt, ok: success > 0 }
  }).catch(async () => {
    await db.collection('sync_status').add({ data: { _id: 'items', module: 'items', lastSync: new Date(), success, failed, elapsedMs: Date.now() - startAt, ok: success > 0 } });
  });

  return { code: 0, success, failed };
};
