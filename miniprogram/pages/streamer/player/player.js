// L5 视频播放
const api = require('../../../utils/api.js');
Page({
  data: { id: '', info: null, related: [] },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getVideo(this.data.id).then(d => {
      this.setData({ info: d.info, related: d.related || [] });
    }).catch(() => {
      this.setData({
        info: {
          title: '张大仙鲁班七号极限1v5五杀',
          author: '张大仙',
          platform: 'B站',
          duration: '02:34',
          views: '128万',
          likes: '12.8万',
          publishDate: '2026-04-29',
          desc: '老仙这局鲁班七号面对1v5的绝境，凭借精准走位和大招连环扫射完成史诗级翻盘五杀，堪称今年最佳鲁班操作。',
          videoUrl: '',  // 真实数据由 sync-bilibili 提供 BV号 或 直链
          bvid: 'BV1xxxxxxxxx',
          embedUrl: ''
        },
        related: [
          { id: 'r1', title: '老仙鲁班连续3场五杀合集', duration: '06:12' },
          { id: 'r2', title: '鲁班七号上分核心技巧', duration: '08:30' },
          { id: 'r3', title: '射手位置选择详解', duration: '04:22' }
        ]
      });
    });
  },
  goRelated(e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({ url: '/pages/streamer/player/player?id=' + id });
  },
  copyBV() {
    const bv = this.data.info && this.data.info.bvid;
    if (bv) {
      wx.setClipboardData({ data: bv });
    }
  }
});
