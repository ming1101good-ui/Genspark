// 同步 KPL 赛事数据
// 数据源：
//   1) 王者电竞官网 https://www.wzczzb.com/match/list  （主源）
//   2) 王者营地公开赛事页 https://camp.qq.com/ 接口
//   3) 备用：腾讯电竞 esports.qq.com kpl 接口
const cloud = require('wx-server-sdk');
const axios = require('axios');
const iconv = require('iconv-lite');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const SCHEDULE_SOURCES = [
  'https://prod.comp.tga.qq.com/v1/comp/getCompMatch?compId=1029&seasonId=&pageNo=1&pageSize=50',
  'https://www.wzczzb.com/api/match/schedule'
];

const RANK_SOURCES = [
  'https://prod.comp.tga.qq.com/v1/comp/getCompRank?compId=1029&seasonId='
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJson(urls) {
  for (const url of urls) {
    for (let i = 0; i < 3; i++) {
      try {
        const res = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; XiaguHelper/1.0)',
            'Referer': 'https://www.wzczzb.com/'
          }
        });
        return res.data;
      } catch (e) {
        console.warn(`[kpl fetch fail] ${url} attempt ${i + 1}: ${e.message}`);
        await sleep(800 * (i + 1));
      }
    }
  }
  throw new Error('all kpl sources failed');
}

function normalizeMatch(m) {
  return {
    _id: 'match_' + (m.matchId || m.id || `${m.teamA || ''}-${m.teamB || ''}-${m.startTime || ''}`).replace(/[^\w]/g, '_'),
    matchId: m.matchId || m.id,
    stage: m.stageName || m.stage || 'KPL常规赛',
    season: m.seasonName || '2026春季赛',
    date: m.startTime || m.date || '',
    dateText: m.startTimeText || '',
    teamA: m.team1Name || m.teamA || '',
    teamB: m.team2Name || m.teamB || '',
    logoA: m.team1Logo || '',
    logoB: m.team2Logo || '',
    score: (m.team1Score != null && m.team2Score != null) ? `${m.team1Score}-${m.team2Score}` : '',
    status: m.matchStatusName || m.status || '即将开赛',
    win: m.winnerName || '',
    rawSource: 'tga'
  };
}

exports.main = async () => {
  const startAt = Date.now();
  let success = 0, failed = 0;
  const errors = [];

  // 1) 赛程
  try {
    const data = await fetchJson(SCHEDULE_SOURCES);
    let matches = [];
    // 不同接口结构兼容
    if (data && data.data && Array.isArray(data.data.matchList)) matches = data.data.matchList;
    else if (Array.isArray(data && data.list)) matches = data.list;
    else if (Array.isArray(data)) matches = data;

    for (const m of matches) {
      try {
        const doc = normalizeMatch(m);
        if (!doc.teamA && !doc.teamB) { failed++; continue; }
        doc.updatedAt = new Date();
        await db.collection('kpl_matches').doc(doc._id).set({ data: doc }).catch(async () => {
          await db.collection('kpl_matches').add({ data: doc });
        });
        success++;
      } catch (e) { failed++; errors.push({ err: e.message }); }
    }
  } catch (e) {
    errors.push({ stage: 'schedule', err: e.message });
  }

  // 2) 积分榜
  try {
    const data = await fetchJson(RANK_SOURCES);
    const ranks = (data && data.data && data.data.rankList) || [];
    for (let i = 0; i < ranks.length; i++) {
      const r = ranks[i];
      const doc = {
        _id: 'rank_' + (r.teamId || i),
        rank: r.rank || i + 1,
        team: r.teamName,
        teamId: r.teamId,
        score: r.score || 0,
        win: r.winCount || 0,
        lose: r.loseCount || 0,
        updatedAt: new Date()
      };
      await db.collection('kpl_rank').doc(doc._id).set({ data: doc }).catch(async () => {
        await db.collection('kpl_rank').add({ data: doc });
      });
    }
  } catch (e) {
    errors.push({ stage: 'rank', err: e.message });
  }

  // 3) 写入同步状态
  await db.collection('sync_status').doc('kpl').set({
    data: {
      module: 'kpl', lastSync: new Date(), success, failed,
      elapsedMs: Date.now() - startAt,
      ok: errors.length === 0 || success > 0
    }
  }).catch(async () => {
    await db.collection('sync_status').add({
      data: { _id: 'kpl', module: 'kpl', lastSync: new Date(), success, failed, elapsedMs: Date.now() - startAt, ok: errors.length === 0 || success > 0 }
    });
  });

  return { code: 0, success, failed, errors: errors.slice(0, 20) };
};
