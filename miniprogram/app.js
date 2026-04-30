// app.js  峡谷开黑助手
App({
  globalData: {
    envId: 'xiagu-kaihei-helper',  // 微信云开发环境 ID（首次部署后填入真实 ID）
    userInfo: null,
    systemInfo: null,
    theme: 'dark',
    version: '1.0.0'
  },

  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.envId,
        traceUser: true
      });
    }

    // 系统信息
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync();
    } catch (e) {
      console.warn('getSystemInfo failed', e);
    }

    // 启动时静默检查数据更新状态
    this.checkDataFreshness();
  },

  // 通过云函数检查数据新鲜度（如有问题端上有提示）
  checkDataFreshness() {
    wx.cloud.callFunction({
      name: 'api-list',
      data: { action: 'health' }
    }).then(res => {
      const data = res.result || {};
      this.globalData.dataFreshness = data;
      if (data.stale) {
        wx.showToast({ title: '数据更新延迟，正在自动修复', icon: 'none', duration: 2000 });
      }
    }).catch(err => {
      console.warn('health check failed', err);
    });
  },

  // 全局调用云函数（带重试）
  callCloud(name, data, retry = 2) {
    return new Promise((resolve, reject) => {
      const exec = (left) => {
        wx.cloud.callFunction({ name, data }).then(res => {
          if (res.result && res.result.code === 0) return resolve(res.result.data);
          if (left > 0) return setTimeout(() => exec(left - 1), 600);
          reject(res.result || new Error('cloud error'));
        }).catch(err => {
          if (left > 0) return setTimeout(() => exec(left - 1), 600);
          reject(err);
        });
      };
      exec(retry);
    });
  }
});
