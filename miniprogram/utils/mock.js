// Mock 数据：在云函数尚未部署时，前端可降级使用
// 真实数据由云函数 sync-* 抓取写入云数据库后由 api-* 返回
const heroes = [
  { id: 'hk-luna', name: '露娜', role: '刺客', avatar: '', tags: ['上分', '连招'] },
  { id: 'hk-houyi', name: '后羿', role: '射手', avatar: '', tags: ['新手', '稳定'] },
  { id: 'hk-zhuangzhou', name: '庄周', role: '辅助', avatar: '', tags: ['团队', '解控'] },
  { id: 'hk-libai', name: '李白', role: '刺客', avatar: '', tags: ['秀操作'] },
  { id: 'hk-hanxin', name: '韩信', role: '打野', avatar: '', tags: ['节奏'] },
  { id: 'hk-zhugeliang', name: '诸葛亮', role: '法师', avatar: '', tags: ['控线'] },
  { id: 'hk-baiqi', name: '白起', role: '坦克', avatar: '', tags: ['团控'] },
  { id: 'hk-mozi', name: '墨子', role: '法师', avatar: '', tags: ['消耗'] }
];

const kplMatches = [
  { id: 'kpl-001', date: '今晚 19:00', stage: 'KPL春季赛常规赛', teamA: 'AG超玩会', teamB: 'eStarPro', logoA: '', logoB: '', status: '即将开赛' },
  { id: 'kpl-002', date: '今晚 21:30', stage: 'KPL春季赛常规赛', teamA: '武汉eStar', teamB: '佛山DRG', logoA: '', logoB: '', status: '即将开赛' },
  { id: 'kpl-003', date: '昨日', stage: 'KPL春季赛常规赛', teamA: '重庆狼队', teamB: 'TES', logoA: '', logoB: '', status: '3-1', score: '3-1' }
];

const streamers = [
  { id: 'st-zhang', name: '张大仙', platform: '虎牙', avatar: '', desc: '老仙的快乐峡谷' },
  { id: 'st-mengmeng', name: '梦泪', platform: '虎牙', avatar: '', desc: 'KPL名将带你飞' },
  { id: 'st-jiumiao', name: '九命猫', platform: '抖音', avatar: '', desc: '射手大佬' },
  { id: 'st-xiaocang', name: '小苍', platform: 'B站', avatar: '', desc: 'MOBA女神' }
];

const squads = [
  { id: 'sq-001', name: '速推流四保一', heroes: ['孙策', '诸葛亮', '虞姬', '蔡文姬', '东皇太一'], winRate: 62, level: 'T0' },
  { id: 'sq-002', name: '强开团野核体系', heroes: ['关羽', '王昭君', '后羿', '盾山', '云中君'], winRate: 58, level: 'T1' },
  { id: 'sq-003', name: '消耗压制流', heroes: ['鲁班大师', '貂蝉', '伽罗', '瑶', '韩信'], winRate: 55, level: 'T1' },
  { id: 'sq-004', name: '边野联动滚雪球', heroes: ['夏侯惇', '安琪拉', '马可波罗', '大乔', '澜'], winRate: 60, level: 'T0' }
];

const items = [
  { id: 'it-pofu', name: '破甲弓', type: '攻击', price: 1860, desc: '提供物理穿透' },
  { id: 'it-zhongming', name: '宗师之力', type: '攻击', price: 2140, desc: '提供物理攻击与冷却' },
  { id: 'it-shuying', name: '书页', type: '法术', price: 2120, desc: '法术暴击核心装备' },
  { id: 'it-buxiu', name: '不死鸟之眼', type: '防御', price: 2800, desc: '战士前期超模装备' }
];

const runes = [
  { id: 'rn-hong-jingce', name: '红·惊鸷', color: 'red', desc: '物攻+1.6 物穿+0.6%' },
  { id: 'rn-lan-shou', name: '蓝·狩猎', color: 'blue', desc: '攻速+1% 移速+1%' },
  { id: 'rn-lv-ying', name: '绿·鹰眼', color: 'green', desc: '物攻+0.9 物穿+6.4' },
  { id: 'rn-hong-yiying', name: '红·异变', color: 'red', desc: '法穿+3.6' }
];

const combos = [
  { id: 'cb-001', name: '射手通用穿透铭文', runes: ['红惊鸷×10', '绿鹰眼×10', '蓝狩猎×10'], applyTo: '后羿/伽罗/虞姬' },
  { id: 'cb-002', name: '战士前期压制', runes: ['红异变×10', '绿盘蛇×10', '蓝霸断×10'], applyTo: '关羽/夏侯惇' },
  { id: 'cb-003', name: '法刺爆发', runes: ['红梦魇×10', '绿心眼×10', '蓝狩猎×10'], applyTo: '不知火舞/上官婉儿' }
];

const banners = [
  { id: 'bn1', title: 'KPL春季赛今日开战', img: '', linkType: 'kpl', linkId: 'kpl-001' },
  { id: 'bn2', title: '梦泪最新精彩剪辑', img: '', linkType: 'video', linkId: 'vd-001' },
  { id: 'bn3', title: 'T0五排速推流推荐', img: '', linkType: 'squad', linkId: 'sq-001' }
];

module.exports = { heroes, kplMatches, streamers, squads, items, runes, combos, banners };
