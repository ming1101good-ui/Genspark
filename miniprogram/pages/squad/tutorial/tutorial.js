// L4 实战教学视频列表
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', videos: [] },
  onLoad(opt) { this.setData({ id: opt.id }); this.load(); },
  load() {
    api.listVideos({ squadId: this.data.id, type: 'tutorial', limit: 20 }).then(d => {
      this.setData({ videos: d.list || [] });
    }).catch(() => {
      this.setData({
        videos: [
          { id: 'tt1', title: '速推流五排实战上王者第1期', cover: '', duration: '12:30', viewsText: '52万', author: '小苍' },
          { id: 'tt2', title: '一拖四带飞队友速推流详解', cover: '', duration: '08:45', viewsText: '38万', author: '梦泪' },
          { id: 'tt3', title: '虞姬出装顺序和打团选位', cover: '', duration: '06:12', viewsText: '24万', author: '九命猫' },
          { id: 'tt4', title: '蔡文姬辅助保C位实战', cover: '', duration: '07:30', viewsText: '19万', author: '老叔' },
          { id: 'tt5', title: '速推流被克制时如何应对', cover: '', duration: '09:18', viewsText: '15万', author: '估估' },
          { id: 'tt6', title: '完整套路高分段实战录像', cover: '', duration: '22:00', viewsText: '12万', author: '雪天' }
        ]
      });
    });
  },
  goVideo(e) { util.nav(`/pages/streamer/player/player?id=${e.currentTarget.dataset.id}`); }
});
