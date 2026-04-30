// 业务接口封装（全部走云函数）
const app = getApp();

const call = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({ name, data })
      .then(res => {
        const r = res.result || {};
        if (r.code === 0) resolve(r.data);
        else reject(r.msg || '接口异常');
      })
      .catch(err => reject(err));
  });
};

module.exports = {
  // 列表类
  listKpl: (params) => call('api-list', { module: 'kpl', ...params }),
  listKplTeams: (params) => call('api-list', { module: 'kpl-team', ...params }),
  listStreamers: (params) => call('api-list', { module: 'streamer', ...params }),
  listVideos: (params) => call('api-list', { module: 'video', ...params }),
  listHeroes: (params) => call('api-list', { module: 'hero', ...params }),
  listSquads: (params) => call('api-list', { module: 'squad', ...params }),
  listItems: (params) => call('api-list', { module: 'item', ...params }),
  listRunes: (params) => call('api-list', { module: 'rune', ...params }),
  listCombos: (params) => call('api-list', { module: 'combo', ...params }),
  homeFeed: () => call('api-list', { module: 'home' }),

  // 详情类
  getMatch: (id) => call('api-detail', { module: 'kpl-match', id }),
  getTeam: (id) => call('api-detail', { module: 'kpl-team', id }),
  getPlayer: (id) => call('api-detail', { module: 'kpl-player', id }),
  getStreamer: (id) => call('api-detail', { module: 'streamer', id }),
  getVideo: (id) => call('api-detail', { module: 'video', id }),
  getHero: (id) => call('api-detail', { module: 'hero', id }),
  getBuild: (id) => call('api-detail', { module: 'hero-build', id }),
  getSquad: (id) => call('api-detail', { module: 'squad', id }),
  getItem: (id) => call('api-detail', { module: 'item', id }),
  getRune: (id) => call('api-detail', { module: 'rune', id }),
  getCombo: (id) => call('api-detail', { module: 'combo', id }),

  // 搜索
  search: (keyword) => call('api-search', { keyword }),

  // 健康检查
  health: () => call('api-list', { action: 'health' })
};
