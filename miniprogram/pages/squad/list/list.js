// L2 五排套路列表
const api = require('../../../utils/api.js');
const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tab: 'all', // all | t0 | t1 | gimmick
    squads: [],
    loading: true
  },
  onLoad() { this.load(); },
  onPullDownRefresh() { this.load(); },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); this.load(); },
  load() {
    api.listSquads({ tab: this.data.tab }).then(d => {
      this.setData({ squads: (d && d.list) || mock.squads, loading: false });
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({ squads: mock.squads.concat([
        { id: 'sq-005', name: '双控双发育流', heroes: ['张飞', '貂蝉', '伽罗', '鬼谷子', '澜'], winRate: 57, level: 'T1' },
        { id: 'sq-006', name: '抓边野上分套路', heroes: ['典韦', '小乔', '马可波罗', '太乙真人', '钟馗'], winRate: 56, level: 'T1' },
        { id: 'sq-007', name: '搞笑娱乐五辅助', heroes: ['瑶', '蔡文姬', '太乙真人', '大乔', '盾山'], winRate: 38, level: '娱乐' }
      ]), loading: false });
      wx.stopPullDownRefresh();
    });
  },
  goSquad(e) { util.nav(`/pages/squad/detail/detail?id=${e.currentTarget.dataset.id}`); }
});
