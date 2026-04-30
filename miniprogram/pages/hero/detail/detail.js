// L3 英雄详情
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
Page({
  data: { id: '', info: null, tab: 'skill' /* skill | story */ },
  onLoad(opt) { this.setData({ id: opt.id || '' }); this.load(); },
  load() {
    api.getHero(this.data.id).then(d => {
      this.setData({ info: d.info });
    }).catch(() => {
      this.setData({
        info: {
          id: this.data.id, name: '澜', title: '潮汐之灵', role: '刺客',
          avatar: '', cover: '',
          stats: { hp: 90, attack: 85, skill: 70, difficulty: 88 },
          price: 13888,
          tags: ['位移', '突进', '收割'],
          intro: '澜是一名拥有高机动性的刺客英雄，凭借影分身和位移技能在战场上来去自如，是当前版本顶尖打野之一。',
          skills: [
            { idx: '被动', name: '潮·共鸣', desc: '澜的技能命中敌人会积累共鸣，4层后下次攻击造成额外伤害。' },
            { idx: '一技能', name: '潮·汐', desc: '澜向指定方向快速突进，对路径上敌人造成物理伤害。' },
            { idx: '二技能', name: '潮·影', desc: '澜召唤分身协同攻击，分身持续追击敌人。' },
            { idx: '大招', name: '潮·灭', desc: '澜进入潜行状态并大幅度位移，再次施放对敌人造成爆发伤害。' }
          ],
          story: '在波涛汹涌的稷下海域深处，潜藏着一位古老的潮汐之灵...',
          recBuilds: 3, recSkins: 6, highlightCount: 18
        }
      });
    });
  },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },
  goBuild() { util.nav(`/pages/hero/build/build?id=${this.data.id}`); },
  goSkin() { util.nav(`/pages/hero/skin/skin?id=${this.data.id}`); },
  goHighlight() { util.nav(`/pages/hero/highlight/highlight?id=${this.data.id}`); }
});
