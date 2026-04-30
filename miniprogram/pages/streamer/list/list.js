// L2 主播列表
const api = require('../../../utils/api.js');
const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tab: 'hot', // hot | new | follow
    streamers: [],
    videos: [],
    loading: true
  },
  onLoad() { this.load(); },
  onPullDownRefresh() { this.load(); },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  load() {
    Promise.all([api.listStreamers({}), api.listVideos({ limit: 20 })]).then(([s, v]) => {
      this.setData({
        streamers: (s && s.list) || mock.streamers,
        videos: (v && v.list) || this._mockVideos(),
        loading: false
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({
        streamers: mock.streamers,
        videos: this._mockVideos(),
        loading: false
      });
      wx.stopPullDownRefresh();
    });
  },
  _mockVideos() {
    return [
      { id: 'vd1', title: '张大仙鲁班七号极限1v5五杀', cover: '', duration: '02:34', author: '张大仙', viewsText: '128万', platform: 'B站' },
      { id: 'vd2', title: '梦泪澜上分实战教学第3期', cover: '', duration: '08:12', author: '梦泪', viewsText: '85万', platform: '虎牙' },
      { id: 'vd3', title: '九命猫伽罗超远射程秀翻全场', cover: '', duration: '03:45', author: '九命猫', viewsText: '64万', platform: '抖音' },
      { id: 'vd4', title: '小苍解说T0五排阵容', cover: '', duration: '12:20', author: '小苍', viewsText: '42万', platform: 'B站' }
    ];
  },
  goStreamer(e) { util.nav(`/pages/streamer/detail/detail?id=${e.currentTarget.dataset.id}`); },
  goVideo(e) { util.nav(`/pages/streamer/player/player?id=${e.currentTarget.dataset.id}`); }
});
