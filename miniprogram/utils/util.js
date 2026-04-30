// 工具函数
const formatTime = (date) => {
  if (!date) return '';
  if (typeof date === 'number') date = new Date(date);
  if (typeof date === 'string') date = new Date(date.replace(/-/g, '/'));
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${y}-${m}-${d} ${h}:${mi}`;
};

const pad = (n) => (n < 10 ? '0' + n : '' + n);

// 相对时间
const fromNow = (ts) => {
  if (!ts) return '';
  const d = typeof ts === 'number' ? ts : new Date(ts).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return '刚刚';
  if (diff < 3600_000) return Math.floor(diff / 60_000) + '分钟前';
  if (diff < 86400_000) return Math.floor(diff / 3600_000) + '小时前';
  if (diff < 30 * 86400_000) return Math.floor(diff / 86400_000) + '天前';
  return formatTime(d).slice(0, 10);
};

// 千分位
const thousands = (n) => {
  if (n == null) return '0';
  return (n + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 数字简化
const niceNum = (n) => {
  if (n == null) return '0';
  n = Number(n) || 0;
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n + '';
};

// 安全图片
const safeImg = (url, fallback) => {
  if (!url) return fallback || '/images/placeholder.png';
  if (/^https?:\/\//.test(url)) return url;
  return url;
};

// 路由
const nav = (url) => wx.navigateTo({ url });
const navBack = () => wx.navigateBack({ delta: 1 });
const switchTab = (url) => wx.switchTab({ url });

// toast
const toast = (title, icon = 'none') => wx.showToast({ title, icon, duration: 1800 });

module.exports = {
  formatTime,
  fromNow,
  thousands,
  niceNum,
  safeImg,
  nav,
  navBack,
  switchTab,
  toast
};
