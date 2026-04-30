// L4 皮肤展示
Page({
  data: { id: '', heroName: '', skins: [], current: 0 },
  onLoad(opt) {
    this.setData({
      id: opt.id, heroName: '澜',
      skins: [
        { name: '潮汐之灵', quality: '勇者', cover: '', desc: '澜的初始皮肤，简洁风格' },
        { name: '海岛少年', quality: '史诗', cover: '', desc: '清爽夏日海岛主题' },
        { name: '一念神魔', quality: '传说', cover: '', desc: '神魔双形态特效，传说品质' },
        { name: '破云之翼', quality: '荣耀典藏', cover: '', desc: '顶级特效，限定皮肤' },
        { name: 'KPL限定', quality: 'KPL', cover: '', desc: 'KPL赛事限定皮肤' }
      ]
    });
  },
  switchSkin(e) { this.setData({ current: e.currentTarget.dataset.idx }); }
});
