// 详情类接口
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const ok = (data) => ({ code: 0, data });
const err = (msg) => ({ code: -1, msg: String(msg) });

async function getById(coll, id) {
  try {
    const r = await db.collection(coll).doc(id).get();
    return r.data;
  } catch (e) { return null; }
}

async function getOne(coll, where) {
  try {
    const r = await db.collection(coll).where(where).limit(1).get();
    return r.data && r.data[0];
  } catch (e) { return null; }
}

exports.main = async (event) => {
  try {
    const m = event.module;
    const id = event.id;

    if (m === 'kpl-match') {
      const info = await getById('kpl_matches', id);
      if (!info) return err('match not found');
      return ok({
        info,
        games: info.games || [],
        bp: info.bp || []
      });
    }

    if (m === 'kpl-team') {
      const info = await getById('kpl_teams', id);
      if (!info) return err('team not found');
      const recentMatches = await db.collection('kpl_matches')
        .where(_.or([{ teamA: info.name }, { teamB: info.name }]))
        .orderBy('date', 'desc').limit(10).get().catch(() => ({ data: [] }));
      return ok({ info, players: info.players || [], recentMatches: recentMatches.data });
    }

    if (m === 'kpl-player') {
      let info = await getById('kpl_players', id);
      if (!info && event.id) info = await getOne('kpl_players', { name: id });
      return ok({ info, heroes: (info && info.heroes) || [], highlights: [] });
    }

    if (m === 'streamer') {
      const info = await getById('streamers', id);
      if (!info) return err('streamer not found');
      const videos = await db.collection('videos').where({ streamerId: id })
        .orderBy('views', 'desc').limit(20).get().catch(() => ({ data: [] }));
      return ok({ info, videos: videos.data });
    }

    if (m === 'video') {
      const info = await getById('videos', id);
      if (!info) return err('video not found');
      // 相关推荐：同 author 或 同 heroId
      let related = [];
      if (info.heroId) {
        const r = await db.collection('videos').where({ heroId: info.heroId, _id: _.neq(id) })
          .orderBy('views', 'desc').limit(6).get().catch(() => ({ data: [] }));
        related = r.data;
      }
      return ok({ info, related });
    }

    if (m === 'hero') {
      const info = await getById('heroes', id);
      if (!info) return err('hero not found');
      // 关联：出装、皮肤、单杀
      const builds = await db.collection('hero_builds').where({ heroId: id })
        .limit(5).get().catch(() => ({ data: [] }));
      const highlights = await db.collection('videos')
        .where({ heroId: id, type: '单杀' }).limit(3).get().catch(() => ({ data: [] }));
      return ok({
        info: {
          ...info,
          recBuilds: builds.data ? builds.data.length : 3,
          recSkins: (info.skins || []).length || 6,
          highlightCount: (highlights.data || []).length || 12
        }
      });
    }

    if (m === 'hero-build') {
      const builds = await db.collection('hero_builds').where({ heroId: id })
        .limit(5).get().catch(() => ({ data: [] }));
      let heroName = '';
      const hero = await getById('heroes', id);
      if (hero) heroName = hero.name;
      return ok({ heroName, builds: builds.data || [] });
    }

    if (m === 'squad') {
      const sq = await getById('squads', id);
      if (!sq) return err('squad not found');
      // 把 heroes 拓展成 {name, role}
      const heroes = (sq.heroes || []).map((name, i) => ({
        name,
        role: ['上单', '中单', '射手', '辅助', '打野'][i] || ''
      }));
      return ok({ ...sq, heroes });
    }

    if (m === 'item') {
      const info = await getById('items', id) || await getOne('items', { name: id });
      if (!info) return err('item not found');
      return ok({
        ...info,
        attrs: info.attrs || [{ k: '物理攻击', v: '+65' }, { k: '冷却缩减', v: '+15%' }],
        passive: info.passive ? { name: '被动', desc: info.passive } : null,
        syntheticTree: info.syntheticTree || [],
        recHeroes: info.recHeroes || [],
        tips: info.tips || ''
      });
    }

    if (m === 'rune') {
      const info = await getById('runes', id);
      if (!info) return err('rune not found');
      return ok({
        ...info,
        attrs: info.attrs || [],
        set2: info.set2 || '',
        set5: info.set5 || '',
        set10: info.set10 || info.desc,
        recHeroes: info.recHeroes || [],
        analysis: info.analysis || info.desc
      });
    }

    if (m === 'combo') {
      const info = await getById('combos', id);
      if (!info) return err('combo not found');
      return ok(info);
    }

    return err('unknown module: ' + m);
  } catch (e) {
    return err(e.message);
  }
};
