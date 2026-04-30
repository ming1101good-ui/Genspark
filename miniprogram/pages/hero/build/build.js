// L4 出装推荐
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', heroName: '', builds: [] },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getBuild(this.data.id).then(d => {
      this.setData({ heroName: d.heroName, builds: d.builds || [] });
    }).catch(() => {
      this.setData({
        heroName: '澜',
        builds: [
          { id: 'b1', name: '标准打野穿透流（推荐）', winRate: 62, useRate: 48, level: 'T0',
            items: [
              { name: '极影', desc: '打野装核心', icon: '' },
              { name: '抵抗之靴', desc: '硬控免疫', icon: '' },
              { name: '宗师之力', desc: '盾+输出', icon: '' },
              { name: '破甲弓', desc: '高额穿透', icon: '' },
              { name: '暗影战斧', desc: 'CD与穿透', icon: '' },
              { name: '名刀·司命', desc: '保命神器', icon: '' }
            ],
            skillOrder: '主一副二，有大点大',
            summoner: '闪现',
            tips: '前期通过抓边路建立节奏，14分钟前必须打出经济差，后期靠极影位移收割后排。'
          },
          { id: 'b2', name: '半肉容错出装', winRate: 58, useRate: 22, level: 'T1',
            items: [
              { name: '极影', desc: '打野核心', icon: '' },
              { name: '抵抗之靴', desc: '减控', icon: '' },
              { name: '红莲斗篷', desc: '范围伤害+生存', icon: '' },
              { name: '暗影战斧', desc: 'CD缩减', icon: '' },
              { name: '不祥征兆', desc: '团战神器', icon: '' },
              { name: '反伤刺甲', desc: '反爆射手', icon: '' }
            ],
            skillOrder: '主一副二',
            summoner: '闪现',
            tips: '适合打消耗局，团战靠红莲范围伤害。'
          },
          { id: 'b3', name: '极限输出连招套路', winRate: 55, useRate: 18, level: 'T2',
            items: [
              { name: '极影', desc: '打野', icon: '' },
              { name: '影忍之足', desc: '攻速移速', icon: '' },
              { name: '宗师之力', desc: '爆发盾', icon: '' },
              { name: '末世', desc: '打肉神器', icon: '' },
              { name: '破甲弓', desc: '穿透', icon: '' },
              { name: '泣血之刃', desc: '吸血续航', icon: '' }
            ],
            skillOrder: '主大副一',
            summoner: '闪现',
            tips: '高风险高收益，吃操作。'
          }
        ]
      });
    });
  },
  goItem(e) { util.nav(`/pages/shop/item/item?name=${e.currentTarget.dataset.name}`); }
});
