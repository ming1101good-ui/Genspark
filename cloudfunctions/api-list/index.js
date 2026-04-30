// 列表类接口：英雄/视频/赛事/套路/装备/铭文/搭配/首页feed
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function ok(data) { return { code: 0, data }; }
function err(msg) { return { code: -1, msg: String(msg) }; }

async function safeGet(coll, where = {}, options = {}) {
  try {
    let q = db.collection(coll);
    if (where && Object.keys(where).length) q = q.where(where);
    if (options.orderBy) q = q.orderBy(options.orderBy[0], options.orderBy[1] || 'desc');
    const limit = options.limit || 50;
    const skip = options.skip || 0;
    const r = await q.skip(skip).limit(limit).get();
    return r.data || [];
  } catch (e) {
    console.warn('safeGet fail', coll, e.message);
    return [];
  }
}

async function getHealth() {
  const status = await safeGet('sync_status', {}, { limit: 10 });
  const map = {};
  status.forEach(s => { map[s.module] = s; });
  const master = map.master || {};
  return {
    stale: !!master.stale,
    lastSync: master.lastSync,
    modules: map
  };
}

exports.main = async (event) => {
  try {
    const action = event.action;
    const m = event.module;

    if (action === 'health') {
      return ok(await getHealth());
    }

    if (m === 'home') {
      const [matches, videos, heroes, squads, combos, status] = await Promise.all([
        safeGet('kpl_matches', {}, { orderBy: ['date', 'desc'], limit: 5 }),
        safeGet('videos', {}, { orderBy: ['views', 'desc'], limit: 8 }),
        safeGet('heroes', {}, { limit: 8 }),
        safeGet('squads', { level: 'T0' }, { limit: 4 }),
        safeGet('combos', {}, { limit: 4 }),
        safeGet('sync_status', { _id: 'master' }, { limit: 1 })
      ]);
      return ok({
        banners: [
          { id: 'bn-kpl', title: 'KPL春季赛精彩对决', linkType: 'kpl', linkId: matches[0] && matches[0]._id },
          { id: 'bn-vid', title: '热门主播精彩剪辑', linkType: 'video', linkId: videos[0] && videos[0]._id },
          { id: 'bn-sq', title: 'T0 五排上分套路', linkType: 'squad', linkId: squads[0] && squads[0]._id }
        ],
        kplMatches: matches,
        hotVideos: videos,
        hotHeroes: heroes,
        hotSquads: squads,
        hotCombos: combos,
        lastSync: status[0] ? formatDate(status[0].lastSync) : ''
      });
    }

    if (m === 'kpl') {
      const [schedule, rank] = await Promise.all([
        safeGet('kpl_matches', {}, { orderBy: ['date', 'desc'], limit: 30 }),
        safeGet('kpl_rank', {}, { orderBy: ['rank', 'asc'], limit: 20 })
      ]);
      return ok({ schedule, rank });
    }

    if (m === 'streamer') {
      return ok({ list: await safeGet('streamers', {}, { limit: 30 }) });
    }

    if (m === 'video') {
      const where = {};
      if (event.streamerId) where.streamerId = event.streamerId;
      if (event.heroId) where.heroId = event.heroId;
      if (event.type) where.type = event.type;
      return ok({ list: await safeGet('videos', where, { orderBy: ['views', 'desc'], limit: event.limit || 30 }) });
    }

    if (m === 'hero') {
      const where = {};
      if (event.role) where.role = event.role;
      return ok({ list: await safeGet('heroes', where, { limit: 200 }) });
    }

    if (m === 'squad') {
      const where = {};
      if (event.tab && event.tab !== 'all') {
        if (event.tab === 't0') where.level = 'T0';
        else if (event.tab === 't1') where.level = 'T1';
        else if (event.tab === 'gimmick') where.level = '娱乐';
      }
      return ok({ list: await safeGet('squads', where, { orderBy: ['winRate', 'desc'], limit: 50 }) });
    }

    if (m === 'item') {
      const where = {};
      if (event.cat && event.cat !== '全部') where.cat = event.cat;
      return ok({ list: await safeGet('items', where, { limit: 100 }) });
    }

    if (m === 'rune') {
      const where = {};
      if (event.color && event.color !== '全部') where.color = event.color;
      return ok({ list: await safeGet('runes', where, { limit: 100 }) });
    }

    if (m === 'combo') {
      return ok({ list: await safeGet('combos', {}, { limit: 30 }) });
    }

    return err('unknown module: ' + m);
  } catch (e) {
    return err(e.message);
  }
};

function formatDate(d) {
  if (!d) return '';
  const t = (d instanceof Date) ? d : new Date(d);
  return t.toISOString().slice(0, 16).replace('T', ' ');
}
