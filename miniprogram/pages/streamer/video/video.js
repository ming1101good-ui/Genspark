// L4 主播视频列表
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', videos: [], loading: true },
  onLoad(opt) { this.setData({ id: opt.id }); this.load(); },
  load() {
    api.listVideos({ streamerId: this.data.id, limit: 50 }).then(d => {
      this.setData({ videos: d.list || [], loading: false });
    }).catch(() => {
      const list = [];
      for (let i = 1; i <= 16; i++) list.push({ id: 'v' + i, title: `精彩视频 #${i} - 关键团战秀操作`, cover: '', duration: '0' + Math.floor(Math.random()*9) + ':' + (10 + Math.floor(Math.random()*49)), viewsText: (Math.floor(Math.random()*150)+10) + '万' });
      this.setData({ videos: list, loading: false });
    });
  },
  goVideo(e) { util.nav(`/pages/streamer/player/player?id=${e.currentTarget.dataset.id}`); }
});
