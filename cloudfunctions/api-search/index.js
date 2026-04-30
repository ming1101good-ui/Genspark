// 全局搜索
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const k = (event.keyword || '').trim();
  if (!k) return { code: 0, data: { heroes: [], items: [], videos: [], squads: [] } };

  const reg = db.RegExp({ regexp: k, options: 'i' });
  const [heroes, items, videos, squads] = await Promise.all([
    db.collection('heroes').where({ name: reg }).limit(10).get().then(r => r.data).catch(() => []),
    db.collection('items').where({ name: reg }).limit(10).get().then(r => r.data).catch(() => []),
    db.collection('videos').where({ title: reg }).limit(10).get().then(r => r.data).catch(() => []),
    db.collection('squads').where({ name: reg }).limit(10).get().then(r => r.data).catch(() => [])
  ]);

  return { code: 0, data: { heroes, items, videos, squads } };
};
