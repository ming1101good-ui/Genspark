// L3 比赛详情
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    id: '',
    info: null,
    tab: 'overview', // overview | bp | data
    games: [],
    bp: [],
    loading: true
  },
  onLoad(opt) {
    this.setData({ id: opt.id || '' });
    this.load();
  },
  load() {
    api.getMatch(this.data.id).then(d => {
      this.setData({ info: d.info, games: d.games || [], bp: d.bp || [], loading: false });
    }).catch(() => {
      this.setData({
        info: {
          stage: 'KPL春季赛常规赛 W3D2',
          date: '2026-04-30 19:00',
          teamA: 'AG超玩会', teamB: 'eStarPro',
          score: '3-1', status: '已结束',
          mvp: '清融', mvpHero: '澜'
        },
        games: [
          { idx: 1, win: 'AG超玩会', duration: '23:45', kills: '21-12', mvp: '清融' },
          { idx: 2, win: 'eStarPro', duration: '28:10', kills: '18-22', mvp: '诺言' },
          { idx: 3, win: 'AG超玩会', duration: '19:32', kills: '24-9', mvp: '一诺' },
          { idx: 4, win: 'AG超玩会', duration: '26:18', kills: '20-14', mvp: '清融' }
        ],
        bp: [
          { team: 'AG超玩会', ban: ['马超', '蒙犽', '不知火舞'], pick: ['澜', '王昭君', '虞姬', '关羽', '蔡文姬'] },
          { team: 'eStarPro', ban: ['澜', '盾山', '吕布'], pick: ['镜', '诸葛亮', '伽罗', '夏洛特', '太乙真人'] }
        ],
        loading: false
      });
    });
  },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  goReplay(e) { util.nav(`/pages/kpl/replay/replay?id=${this.data.id}&game=${e.currentTarget.dataset.idx}`); },
  goPlayer() { util.nav(`/pages/kpl/player/player?name=${this.data.info.mvp}`); }
});
