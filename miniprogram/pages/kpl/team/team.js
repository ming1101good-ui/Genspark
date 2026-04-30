// L3 战队详情
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    id: '', info: null, players: [], recentMatches: [], tab: 'players'
  },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getTeam(this.data.id).then(d => {
      this.setData({ info: d.info, players: d.players || [], recentMatches: d.recentMatches || [] });
    }).catch(() => {
      this.setData({
        info: { name: 'AG超玩会', area: '成都', coach: '阿泽', win: 12, lose: 3, rank: 1, championships: 5 },
        players: [
          { id: 'p1', name: '清融', role: '打野', avatar: '', kda: '5.8', mvp: 7 },
          { id: 'p2', name: '一诺', role: '中单', avatar: '', kda: '4.6', mvp: 5 },
          { id: 'p3', name: '小义', role: '射手', avatar: '', kda: '5.2', mvp: 3 },
          { id: 'p4', name: 'Fly', role: '上单', avatar: '', kda: '3.4', mvp: 2 },
          { id: 'p5', name: '七年', role: '辅助', avatar: '', kda: '3.8', mvp: 1 }
        ],
        recentMatches: [
          { id: 'm1', date: '04-29', vs: 'eStarPro', result: '3-1', win: true },
          { id: 'm2', date: '04-26', vs: '佛山DRG', result: '3-0', win: true },
          { id: 'm3', date: '04-23', vs: 'TES.A', result: '2-3', win: false }
        ]
      });
    });
  },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  goPlayer(e) { util.nav(`/pages/kpl/player/player?id=${e.currentTarget.dataset.id}`); },
  goMatch(e) { util.nav(`/pages/kpl/match/match?id=${e.currentTarget.dataset.id}`); }
});
