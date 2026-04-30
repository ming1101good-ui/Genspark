// L2 英雄列表
const api = require('../../../utils/api.js');
const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

const ROLES = ['全部', '战士', '法师', '坦克', '刺客', '射手', '辅助'];

Page({
  data: {
    role: '全部',
    roles: ROLES,
    keyword: '',
    list: [],
    filtered: [],
    loading: true
  },
  onLoad() { this.load(); },
  onPullDownRefresh() { this.load(); },
  load() {
    api.listHeroes({}).then(d => {
      const list = (d && d.list) || this._mockFull();
      this.setData({ list, filtered: list, loading: false });
      wx.stopPullDownRefresh();
    }).catch(() => {
      const list = this._mockFull();
      this.setData({ list, filtered: list, loading: false });
      wx.stopPullDownRefresh();
    });
  },
  _mockFull() {
    const base = [
      ['hk-luna', '露娜', '刺客'], ['hk-libai', '李白', '刺客'], ['hk-hanxin', '韩信', '打野'],
      ['hk-houyi', '后羿', '射手'], ['hk-yuji', '虞姬', '射手'], ['hk-galuo', '伽罗', '射手'],
      ['hk-mozi', '墨子', '法师'], ['hk-zhugeliang', '诸葛亮', '法师'], ['hk-anqila', '安琪拉', '法师'],
      ['hk-baiqi', '白起', '坦克'], ['hk-dianwei', '典韦', '战士'], ['hk-guanyu', '关羽', '战士'],
      ['hk-zhuangzhou', '庄周', '辅助'], ['hk-yao', '瑶', '辅助'], ['hk-caiwenji', '蔡文姬', '辅助'],
      ['hk-diaochan', '貂蝉', '法师'], ['hk-xishi', '西施', '法师'], ['hk-shangguan', '上官婉儿', '法师'],
      ['hk-yunzhongjun', '云中君', '刺客'], ['hk-lan', '澜', '刺客'], ['hk-jing', '镜', '刺客'],
      ['hk-xiahou', '夏侯惇', '战士'], ['hk-xialuote', '夏洛特', '战士'], ['hk-machao', '马超', '战士'],
      ['hk-makebo', '马可波罗', '射手'], ['hk-mengwa', '蒙犽', '射手'], ['hk-luban', '鲁班七号', '射手'],
      ['hk-dongtaiyi', '东皇太一', '坦克'], ['hk-dunshan', '盾山', '坦克'], ['hk-liubang', '刘邦', '坦克']
    ];
    return base.map(([id, name, role]) => ({ id, name, role, avatar: '', tags: [], price: 13888 }));
  },
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    const k = this.data.keyword.trim();
    const filtered = this.data.list.filter(h =>
      (role === '全部' || h.role === role) &&
      (!k || h.name.includes(k))
    );
    this.setData({ role, filtered });
  },
  onSearch(e) {
    const k = e.detail.value.trim();
    this.setData({ keyword: k });
    const filtered = this.data.list.filter(h =>
      (this.data.role === '全部' || h.role === this.data.role) &&
      (!k || h.name.includes(k))
    );
    this.setData({ filtered });
  },
  goHero(e) { util.nav(`/pages/hero/detail/detail?id=${e.currentTarget.dataset.id}`); }
});
