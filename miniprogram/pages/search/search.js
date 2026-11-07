const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    keyword: '',
    heroes: [],
    items: [],
    videos: [],
    squads: [],
    loading: false
  },

  onLoad(options) {
    if (options.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) });
      this.doSearch();
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {
    if (!this.data.keyword.trim()) return;
    this.doSearch();
  },

  doSearch() {
    this.setData({ loading: true });
    api.search(this.data.keyword).then(data => {
      this.setData({
        heroes: data.heroes || [],
        items: data.items || [],
        videos: data.videos || [],
        squads: data.squads || [],
        loading: false
      });
    }).catch(err => {
      util.toast(err.msg || '搜索失败');
      this.setData({ loading: false });
    });
  },

  goHero(e) {
    util.nav('/pages/hero/detail/detail?id=' + e.currentTarget.dataset.id);
  },

  goItem(e) {
    util.nav('/pages/shop/item/item?id=' + e.currentTarget.dataset.id);
  },

  goVideo(e) {
    util.nav('/pages/streamer/player/player?id=' + e.currentTarget.dataset.id);
  },

  goSquad(e) {
    util.nav('/pages/squad/detail/detail?id=' + e.currentTarget.dataset.id);
  }
});
