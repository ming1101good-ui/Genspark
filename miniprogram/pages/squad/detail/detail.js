// L3 套路详情
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', info: null },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getSquad(this.data.id).then(d => {
      this.setData({ info: d });
    }).catch(() => {
      this.setData({
        info: {
          id: this.data.id,
          name: '速推流四保一', level: 'T0', winRate: 62, useRate: 18,
          heroes: [
            { name: '孙策', role: '上单', icon: '' },
            { name: '诸葛亮', role: '中单', icon: '' },
            { name: '虞姬', role: '射手', icon: '' },
            { name: '蔡文姬', role: '辅助', icon: '' },
            { name: '东皇太一', role: '打野', icon: '' }
          ],
          summary: '一套以快速推塔为核心的阵容，前期通过孙策开团 + 诸葛亮高频消耗压制对方，中后期保护虞姬持续输出。',
          strengths: ['推塔速度极快', '团战阵容稳定', '保护C位强势', '消耗能力高'],
          weaknesses: ['前期野区被压制', '怕被强开团', '需要团队配合'],
          counter: ['关羽', '裴擒虎', '澜', '云中君'],
          videoCount: 6
        }
      });
    });
  },
  goLineup() { util.nav(`/pages/squad/lineup/lineup?id=${this.data.id}`); },
  goTutorial() { util.nav(`/pages/squad/tutorial/tutorial?id=${this.data.id}`); },
  goHero(e) {
    util.nav(`/pages/hero/detail/detail?id=hk-${e.currentTarget.dataset.name}`);
  }
});
