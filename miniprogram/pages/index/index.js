// L1 首页
const app = getApp();
const api = require('../../utils/api.js');
const mock = require('../../utils/mock.js');
const util = require('../../utils/util.js');

Page({
  data: {
    banners: [],
    kplMatches: [],
    hotVideos: [],
    hotHeroes: [],
    hotSquads: [],
    hotCombos: [],
    loading: true,
    keyword: '',
    lastSync: ''
  },

  onLoad() {
    this.loadFeed();
  },

  onPullDownRefresh() {
    this.loadFeed(true);
  },

  loadFeed(force) {
    this.setData({ loading: true });
    api.homeFeed().then(data => {
      this.setData({
        banners: data.banners || mock.banners,
        kplMatches: data.kplMatches || mock.kplMatches,
        hotVideos: data.hotVideos || [],
        hotHeroes: data.hotHeroes || mock.heroes.slice(0, 6),
        hotSquads: data.hotSquads || mock.squads.slice(0, 4),
        hotCombos: data.hotCombos || mock.combos,
        lastSync: data.lastSync || '',
        loading: false
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      // 云函数未就绪降级到 mock
      this.setData({
        banners: mock.banners,
        kplMatches: mock.kplMatches,
        hotVideos: [],
        hotHeroes: mock.heroes.slice(0, 6),
        hotSquads: mock.squads.slice(0, 4),
        hotCombos: mock.combos,
        loading: false
      });
      wx.stopPullDownRefresh();
    });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },
  onSearchConfirm() {
    if (!this.data.keyword.trim()) return;
    util.toast('搜索功能即将上线');
  },

  // 跳转
  goKplList() { util.nav('/pages/kpl/list/list'); },
  goStreamerList() { util.nav('/pages/streamer/list/list'); },
  goHeroList() { wx.switchTab({ url: '/pages/hero/list/list' }); },
  goSquadList() { wx.switchTab({ url: '/pages/squad/list/list' }); },
  goShopList() { wx.switchTab({ url: '/pages/shop/list/list' }); },

  goMatch(e) {
    const id = e.currentTarget.dataset.id;
    util.nav(`/pages/kpl/match/match?id=${id}`);
  },
  goVideo(e) {
    const id = e.currentTarget.dataset.id;
    util.nav(`/pages/streamer/player/player?id=${id}`);
  },
  goHero(e) {
    const id = e.currentTarget.dataset.id;
    util.nav(`/pages/hero/detail/detail?id=${id}`);
  },
  goSquad(e) {
    const id = e.currentTarget.dataset.id;
    util.nav(`/pages/squad/detail/detail?id=${id}`);
  },
  goCombo(e) {
    const id = e.currentTarget.dataset.id;
    util.nav(`/pages/shop/combo/combo?id=${id}`);
  },
  goBanner(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    if (item.linkType === 'kpl') return util.nav(`/pages/kpl/match/match?id=${item.linkId}`);
    if (item.linkType === 'video') return util.nav(`/pages/streamer/player/player?id=${item.linkId}`);
    if (item.linkType === 'squad') return util.nav(`/pages/squad/detail/detail?id=${item.linkId}`);
    if (item.linkType === 'hero') return util.nav(`/pages/hero/detail/detail?id=${item.linkId}`);
  },

  onShareAppMessage() {
    return { title: '峡谷开黑助手 - 一站式王者攻略', path: '/pages/index/index' };
  }
});
