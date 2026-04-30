// L3 铭文详情
const api = require('../../../utils/api.js');
Page({
  data: { id: '', info: null },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getRune(this.data.id).then(d => { this.setData({ info: d }); }).catch(() => {
      this.setData({
        info: {
          id: this.data.id, name: '惊鸷', color: '红色', icon: '',
          attrs: [{ k: '物理攻击', v: '+1.6' }, { k: '物理穿透', v: '+0.6%' }],
          set2: '物理穿透+1.6%',
          set5: '物理攻击+8',
          set10: '物理穿透+6.4%',
          recHeroes: ['李白', '韩信', '阿珂', '马可波罗', '后羿'],
          analysis: '惊鸷是物理刺客和射手的核心红色铭文，前期穿透能让单杀概率显著上升，10件套后形成完整穿透曲线。'
        }
      });
    });
  }
});
