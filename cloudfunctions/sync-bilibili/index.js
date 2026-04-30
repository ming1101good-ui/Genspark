// 从 B 站搜索接口拉取王者荣耀相关精彩视频
// API: https://api.bilibili.com/x/web-interface/search/type
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const STREAMERS = [
  { id: 'st-zhang', name: '张大仙', keywords: ['张大仙'], platform: '虎牙' },
  { id: 'st-mengmeng', name: '梦泪', keywords: ['梦泪'], platform: '虎牙' },
  { id: 'st-jiumiao', name: '九命猫', keywords: ['九命猫233'], platform: '抖音' },
  { id: 'st-xiaocang', name: '小苍', keywords: ['小苍解说', 'Miss小苍'], platform: 'B站' },
  { id: 'st-laotie', name: '老叔', keywords: ['老叔王者'], platform: '抖音' },
  { id: 'st-guguzhuang', name: '估估', keywords: ['估估老师'], platform: 'B站' }
];

const HOT_KEYWORDS = [
  '王者荣耀 五杀',
  '王者荣耀 单杀',
  '王者荣耀 精彩集锦',
  '王者荣耀 教学',
  '王者荣耀 上分',
  '王者荣耀 五排套路'
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function bilibiliSearch(keyword, page = 1) {
  const url = 'https://api.bilibili.com/x/web-interface/search/type';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://search.bilibili.com/',
    'Cookie': 'buvid3=xxx'  // B站游客cookie，无敏感信息，运行时可不设
  };
  const params = {
    search_type: 'video',
    keyword,
    order: 'click',  // 按播放量排序
    duration: 0,
    page,
    page_size: 30
  };
  for (let i = 0; i < 3; i++) {
    try {
      const res = await axios.get(url, { params, headers, timeout: 10000 });
      if (res.data && res.data.code === 0) {
        return (res.data.data && res.data.data.result) || [];
      }
      throw new Error('bilibili code=' + (res.data && res.data.code));
    } catch (e) {
      console.warn(`[bili fail] ${keyword} attempt ${i + 1}: ${e.message}`);
      await sleep(1500 * (i + 1));
    }
  }
  return [];
}

function formatViews(n) {
  n = Number(n) || 0;
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n + '';
}
function formatDuration(s) {
  // bilibili duration 形如 "5:12" 或 "1:05:30"
  return s || '';
}

function classifyVideo(title) {
  // 简单 AI 标签解析
  const tags = [];
  if (/五杀|超神|秒杀/.test(title)) tags.push('五杀');
  if (/单杀|秀操作|名场面/.test(title)) tags.push('单杀');
  if (/教学|教程|攻略/.test(title)) tags.push('教学');
  if (/连招|出装|铭文/.test(title)) tags.push('技巧');
  if (/上分|登顶|王者/.test(title)) tags.push('上分');
  if (/五排|开黑|双排/.test(title)) tags.push('五排');
  return tags;
}

// 从标题里识别英雄名（基于已入库的英雄）
async function detectHero(title) {
  try {
    const heroes = await db.collection('heroes').field({ name: true, _id: true }).limit(200).get();
    for (const h of heroes.data) {
      if (h.name && title.includes(h.name)) return { id: h._id, name: h.name };
    }
  } catch (e) {}
  return null;
}

exports.main = async () => {
  const startAt = Date.now();
  let success = 0, failed = 0;
  const errors = [];

  // 1) 主播专属视频
  for (const st of STREAMERS) {
    try {
      // 写入主播
      await db.collection('streamers').doc(st.id).set({
        data: {
          _id: st.id, name: st.name, platform: st.platform,
          updatedAt: new Date()
        }
      }).catch(async () => {
        await db.collection('streamers').add({ data: { _id: st.id, name: st.name, platform: st.platform, updatedAt: new Date() } });
      });

      for (const kw of st.keywords) {
        const list = await bilibiliSearch(kw);
        for (const v of list) {
          try {
            const bvid = v.bvid;
            if (!bvid) continue;
            const title = (v.title || '').replace(/<[^>]+>/g, '');
            const hero = await detectHero(title);
            const doc = {
              _id: 'video_' + bvid,
              bvid,
              title,
              cover: v.pic && (v.pic.startsWith('//') ? 'https:' + v.pic : v.pic),
              duration: formatDuration(v.duration),
              author: v.author || st.name,
              authorId: v.mid,
              streamerId: st.id,
              views: v.play || 0,
              viewsText: formatViews(v.play),
              likes: v.like || 0,
              danmaku: v.video_review || 0,
              publishDate: v.pubdate ? new Date(v.pubdate * 1000).toISOString().slice(0, 10) : '',
              platform: 'B站',
              videoUrl: '',  // B站视频不能直接拿到流，引导用户复制 BV 号
              tags: classifyVideo(title),
              heroId: hero ? hero.id : '',
              heroName: hero ? hero.name : '',
              type: classifyVideo(title)[0] || 'highlight',
              updatedAt: new Date()
            };
            await db.collection('videos').doc(doc._id).set({ data: doc }).catch(async () => {
              await db.collection('videos').add({ data: doc });
            });
            success++;
          } catch (e) { failed++; }
        }
        await sleep(1500);
      }
    } catch (e) {
      errors.push({ streamer: st.name, err: e.message });
    }
  }

  // 2) 热门关键词视频
  for (const kw of HOT_KEYWORDS) {
    try {
      const list = await bilibiliSearch(kw);
      for (const v of list.slice(0, 15)) {
        try {
          const bvid = v.bvid;
          if (!bvid) continue;
          const title = (v.title || '').replace(/<[^>]+>/g, '');
          const hero = await detectHero(title);
          const doc = {
            _id: 'video_' + bvid,
            bvid,
            title,
            cover: v.pic && (v.pic.startsWith('//') ? 'https:' + v.pic : v.pic),
            duration: formatDuration(v.duration),
            author: v.author || '',
            authorId: v.mid,
            views: v.play || 0,
            viewsText: formatViews(v.play),
            publishDate: v.pubdate ? new Date(v.pubdate * 1000).toISOString().slice(0, 10) : '',
            platform: 'B站',
            tags: classifyVideo(title),
            heroId: hero ? hero.id : '',
            heroName: hero ? hero.name : '',
            type: classifyVideo(title)[0] || 'highlight',
            keyword: kw,
            updatedAt: new Date()
          };
          await db.collection('videos').doc(doc._id).set({ data: doc }).catch(async () => {
            await db.collection('videos').add({ data: doc });
          });
          success++;
        } catch (e) { failed++; }
      }
      await sleep(1500);
    } catch (e) {
      errors.push({ keyword: kw, err: e.message });
    }
  }

  await db.collection('sync_status').doc('bilibili').set({
    data: { module: 'bilibili', lastSync: new Date(), success, failed, elapsedMs: Date.now() - startAt, ok: success > 0 }
  }).catch(async () => {
    await db.collection('sync_status').add({ data: { _id: 'bilibili', module: 'bilibili', lastSync: new Date(), success, failed, elapsedMs: Date.now() - startAt, ok: success > 0 } });
  });

  return { code: 0, success, failed, errors: errors.slice(0, 20) };
};
