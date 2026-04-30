// L2 KPL 赛事列表
const api = require('../../../utils/api.js');
const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tab: 'schedule', // schedule | team | rank | news
    schedule: [],
    teams: [],
    rank: [],
    news: [],
    loading: true,
    season: '2026春季赛'
  },

  onLoad() {
    this.loadAll();
  },

  onPullDownRefresh() { this.loadAll(true); },

  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },

  loadAll() {
    api.listKpl({}).then(res => {
      this.setData({
        schedule: res.schedule || mock.kplMatches,
        teams: res.teams || this._mockTeams(),
        rank: res.rank || this._mockRank(),
        news: res.news || this._mockNews(),
        loading: false
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({
        schedule: mock.kplMatches,
        teams: this._mockTeams(),
        rank: this._mockRank(),
        news: this._mockNews(),
        loading: false
      });
      wx.stopPullDownRefresh();
    });
  },

  _mockTeams() {
    return [
      { id: 'tm-ag', name: 'AG超玩会', area: '成都', win: 12, lose: 3 },
      { id: 'tm-estar', name: 'eStarPro', area: '武汉', win: 11, lose: 4 },
      { id: 'tm-tes', name: 'TES.A', area: '上海', win: 10, lose: 5 },
      { id: 'tm-drg', name: '佛山DRG', area: '佛山', win: 9, lose: 6 },
      { id: 'tm-wolf', name: '重庆狼队', area: '重庆', win: 9, lose: 6 }
    ];
  },
  _mockRank() {
    return [
      { rank: 1, team: 'AG超玩会', score: 24, win: 12, lose: 3 },
      { rank: 2, team: 'eStarPro', score: 22, win: 11, lose: 4 },
      { rank: 3, team: 'TES.A', score: 20, win: 10, lose: 5 },
      { rank: 4, team: '佛山DRG', score: 18, win: 9, lose: 6 },
      { rank: 5, team: '重庆狼队', score: 18, win: 9, lose: 6 }
    ];
  },
  _mockNews() {
    return [
      { id: 'nw1', title: 'AG超玩会三连胜稳居榜首，新援表现亮眼', date: '今日 10:30' },
      { id: 'nw2', title: '春季赛MVP榜更新：清融连续两周登顶', date: '昨日 18:00' },
      { id: 'nw3', title: 'KPL转会期收官：八支战队完成调整', date: '3天前' }
    ];
  },

  goMatch(e) { util.nav(`/pages/kpl/match/match?id=${e.currentTarget.dataset.id}`); },
  goTeam(e) { util.nav(`/pages/kpl/team/team?id=${e.currentTarget.dataset.id}`); }
});
