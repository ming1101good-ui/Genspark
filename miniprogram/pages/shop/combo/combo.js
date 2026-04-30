// L4 铭文搭配玩法详解
const api = require('../../../utils/api.js');
Page({
  data: { id: '', info: null },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getCombo(this.data.id).then(d => { this.setData({ info: d }); }).catch(() => {
      this.setData({
        info: {
          id: this.data.id,
          name: '射手通用穿透铭文',
          summary: '红色穿透 + 绿色穿透 + 蓝色攻速移速，最大化输出能力。',
          runes: [
            { name: '红·惊鸷×10', icon: '', detail: '物攻+16 穿透+6%' },
            { name: '绿·鹰眼×10', icon: '', detail: '物攻+9 穿透+64' },
            { name: '蓝·狩猎×10', icon: '', detail: '攻速+10% 移速+10%' }
          ],
          totalAttrs: [
            { k: '物理攻击', v: '+25' },
            { k: '物理穿透', v: '+64' },
            { k: '物理穿透率', v: '+6%' },
            { k: '攻击速度', v: '+10%' },
            { k: '移动速度', v: '+10%' }
          ],
          applyTo: '后羿、伽罗、虞姬、马可波罗、孙尚香',
          buildTips: '前期裸出末世/无尽，配合穿透铭文打肉非常稳定；伽罗推荐第二件破甲弓再无尽。',
          counter: '对面坦克过多时，可换回纯穿透出装。',
          videoCount: 4
        }
      });
    });
  }
});
