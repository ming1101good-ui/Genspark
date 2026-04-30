// L2 商城列表（装备/铭文/搭配 三 Tab）
const api = require('../../../utils/api.js');
const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    tab: 'item', // item | rune | combo
    itemCat: '全部',
    itemCats: ['全部', '攻击', '法术', '防御', '移动', '打野', '辅助'],
    runeColor: '全部',
    runeColors: ['全部', '红色', '蓝色', '绿色'],
    items: [], filteredItems: [],
    runes: [], filteredRunes: [],
    combos: [],
    loading: true
  },
  onLoad() { this.load(); },
  onPullDownRefresh() { this.load(); },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },

  load() {
    Promise.all([api.listItems({}), api.listRunes({}), api.listCombos({})]).then(([i, r, c]) => {
      const items = (i && i.list) || this._mockItems();
      const runes = (r && r.list) || this._mockRunes();
      this.setData({
        items, filteredItems: items,
        runes, filteredRunes: runes,
        combos: (c && c.list) || mock.combos,
        loading: false
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      const items = this._mockItems();
      const runes = this._mockRunes();
      this.setData({
        items, filteredItems: items,
        runes, filteredRunes: runes,
        combos: mock.combos,
        loading: false
      });
      wx.stopPullDownRefresh();
    });
  },

  _mockItems() {
    return [
      { id: 'it-pofu', name: '破甲弓', cat: '攻击', price: 1860, icon: '', desc: '物理穿透+45' },
      { id: 'it-zhongming', name: '宗师之力', cat: '攻击', price: 2140, icon: '', desc: '物攻+65 CD-15%' },
      { id: 'it-msss', name: '末世', cat: '攻击', price: 2080, icon: '', desc: '攻速+15%' },
      { id: 'it-mingdao', name: '名刀·司命', cat: '攻击', price: 2080, icon: '', desc: '低血量护盾' },
      { id: 'it-anying', name: '暗影战斧', cat: '攻击', price: 1990, icon: '', desc: 'CD缩减+15%' },
      { id: 'it-shuying', name: '书页', cat: '法术', price: 2120, icon: '', desc: '法术暴击核心' },
      { id: 'it-huizhi', name: '辉月', cat: '法术', price: 1950, icon: '', desc: '短暂无敌' },
      { id: 'it-mage', name: '炽热支配者', cat: '法术', price: 2180, icon: '', desc: '法穿+10%' },
      { id: 'it-buxiu', name: '不死鸟之眼', cat: '防御', price: 2800, icon: '', desc: '战士神装' },
      { id: 'it-bayan', name: '霸者重装', cat: '防御', price: 2080, icon: '', desc: '回血+1.5%' },
      { id: 'it-fanshang', name: '反伤刺甲', cat: '防御', price: 2140, icon: '', desc: '反弹物理伤害' },
      { id: 'it-shu', name: '抵抗之靴', cat: '移动', price: 710, icon: '', desc: '韧性+30%' },
      { id: 'it-jiaxie', name: '极影', cat: '打野', price: 2180, icon: '', desc: '打野核心，附带位移' },
      { id: 'it-tianyin', name: '近卫荣耀', cat: '辅助', price: 1320, icon: '', desc: '辅助光环' }
    ];
  },
  _mockRunes() {
    return [
      { id: 'rn-hong-jingce', name: '惊鸷', color: '红色', desc: '物攻+1.6 物穿+0.6%', icon: '' },
      { id: 'rn-hong-yiying', name: '异变', color: '红色', desc: '法穿+3.6', icon: '' },
      { id: 'rn-hong-mengying', name: '梦魇', color: '红色', desc: '法术攻击+9', icon: '' },
      { id: 'rn-lan-shou', name: '狩猎', color: '蓝色', desc: '攻速+1% 移速+1%', icon: '' },
      { id: 'rn-lan-badun', name: '霸断', color: '蓝色', desc: 'CD-0.6% 攻击+1.6', icon: '' },
      { id: 'rn-lan-hongyuan', name: '宏源', color: '蓝色', desc: '回蓝/CD', icon: '' },
      { id: 'rn-lv-yingyan', name: '鹰眼', color: '绿色', desc: '物攻+0.9 物穿+6.4', icon: '' },
      { id: 'rn-lv-panshe', name: '盘蛇', color: '绿色', desc: '生命+33.75', icon: '' },
      { id: 'rn-lv-xinyan', name: '心眼', color: '绿色', desc: '法穿+3.2', icon: '' }
    ];
  },

  selectItemCat(e) {
    const cat = e.currentTarget.dataset.cat;
    const filteredItems = cat === '全部' ? this.data.items : this.data.items.filter(i => i.cat === cat);
    this.setData({ itemCat: cat, filteredItems });
  },
  selectRuneColor(e) {
    const color = e.currentTarget.dataset.color;
    const filteredRunes = color === '全部' ? this.data.runes : this.data.runes.filter(r => r.color === color);
    this.setData({ runeColor: color, filteredRunes });
  },
  goItem(e) { util.nav(`/pages/shop/item/item?id=${e.currentTarget.dataset.id}`); },
  goRune(e) { util.nav(`/pages/shop/rune/rune?id=${e.currentTarget.dataset.id}`); },
  goCombo(e) { util.nav(`/pages/shop/combo/combo?id=${e.currentTarget.dataset.id}`); }
});
