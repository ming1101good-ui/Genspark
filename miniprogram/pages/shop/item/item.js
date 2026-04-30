// L3 装备详情
const api = require('../../../utils/api.js');
Page({
  data: { id: '', name: '', info: null },
  onLoad(opt) {
    this.setData({ id: opt.id || '', name: opt.name || '' });
    this.load();
  },
  load() {
    api.getItem(this.data.id || this.data.name).then(d => {
      this.setData({ info: d });
    }).catch(() => {
      this.setData({
        info: {
          id: this.data.id, name: this.data.name || '宗师之力', cat: '攻击', price: 2140, icon: '',
          attrs: [
            { k: '物理攻击', v: '+65' },
            { k: '冷却缩减', v: '+15%' },
            { k: '生命值', v: '+400' }
          ],
          passive: { name: '宗师', desc: '攻击和技能命中敌人后获得吸收伤害的护盾，6秒CD' },
          syntheticTree: ['暗影长矛 (1820)', '+ 复活甲 (1320)'],
          recHeroes: ['马超', '夏侯惇', '吕布', '宫本武藏'],
          tips: '战士前期超模装备，前期出能极大提升对线压制力。'
        }
      });
    });
  }
});
