// L4 选手详情
const api = require('../../../utils/api.js');
Page({
  data: { id: '', name: '', info: null, heroes: [], highlights: [] },
  onLoad(opt) {
    this.setData({ id: opt.id || '', name: opt.name || '' });
    this.load();
  },
  load() {
    const key = this.data.id || this.data.name;
    api.getPlayer(key).then(d => {
      this.setData({ info: d.info, heroes: d.heroes || [], highlights: d.highlights || [] });
    }).catch(() => {
      this.setData({
        info: { name: this.data.name || '清融', team: 'AG超玩会', role: '打野', kda: '5.8', mvp: 7, championships: 3, age: 22 },
        heroes: [
          { name: '澜', winRate: 78, count: 24 },
          { name: '云中君', winRate: 72, count: 18 },
          { name: '裴擒虎', winRate: 65, count: 15 }
        ],
        highlights: [
          { id: 'hl1', title: '清融澜五杀名场面', cover: '', duration: '01:24' },
          { id: 'hl2', title: '清融云中君上演极限反杀', cover: '', duration: '00:48' }
        ]
      });
    });
  },
  goVideo(e) {
    wx.navigateTo({ url: '/pages/streamer/player/player?id=' + e.currentTarget.dataset.id });
  }
});
