// L4 单杀剪辑
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', heroName: '', videos: [] },
  onLoad(opt) { this.setData({ id: opt.id }); this.load(); },
  load() {
    api.listVideos({ heroId: this.data.id, type: 'highlight', limit: 30 }).then(d => {
      this.setData({ heroName: d.heroName || '英雄', videos: d.list || [] });
    }).catch(() => {
      const list = [];
      for (let i = 1; i <= 12; i++) {
        list.push({ id: 'h' + i, title: `澜极限单杀名场面 #${i}`, cover: '', duration: '0' + (Math.floor(Math.random()*4)+1) + ':' + (10+Math.floor(Math.random()*49)), viewsText: (Math.floor(Math.random()*80)+10) + '万' });
      }
      this.setData({ heroName: '澜', videos: list });
    });
  },
  goVideo(e) { util.nav(`/pages/streamer/player/player?id=${e.currentTarget.dataset.id}`); }
});
