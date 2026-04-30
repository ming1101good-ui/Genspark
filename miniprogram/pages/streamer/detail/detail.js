// L3 主播详情
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', info: null, videos: [] },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getStreamer(this.data.id).then(d => {
      this.setData({ info: d.info, videos: d.videos || [] });
    }).catch(() => {
      this.setData({
        info: { name: '张大仙', platform: '虎牙', avatar: '', desc: '老仙的快乐峡谷，全网最幽默王者主播', fans: '3200万', tags: ['娱乐', '射手', '搞笑'] },
        videos: [
          { id: 'vd1', title: '张大仙鲁班七号极限1v5五杀', cover: '', duration: '02:34', viewsText: '128万' },
          { id: 'vd2', title: '老仙带你冲分白银到王者第1期', cover: '', duration: '15:30', viewsText: '95万' },
          { id: 'vd3', title: '后羿连续7杀超神瞬间', cover: '', duration: '03:08', viewsText: '78万' },
          { id: 'vd4', title: '张大仙苏烈反伤教学', cover: '', duration: '06:42', viewsText: '52万' }
        ]
      });
    });
  },
  goVideoList() { util.nav(`/pages/streamer/video/video?id=${this.data.id}`); },
  goVideo(e) { util.nav(`/pages/streamer/player/player?id=${e.currentTarget.dataset.id}`); }
});
