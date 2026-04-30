// 自动上传到微信小程序「开发版」
// 用法：
//   1. 登录 mp.weixin.qq.com → 开发管理 → 开发设置 → 小程序代码上传 → 下载并保存「上传密钥（私钥）」到 scripts/private.key
//   2. 在 mp.weixin.qq.com 添加 IP 白名单（运行此脚本的 IP）
//   3. 运行 node scripts/upload.js
//
// 注意：private.key 不要提交到 git（已加到 .gitignore）
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const APPID = 'wx0537c638f83f3275';
const PROJECT_PATH = path.resolve(__dirname, '..');
const KEY_PATH = path.resolve(__dirname, 'private.key');

(async () => {
  if (!fs.existsSync(KEY_PATH)) {
    console.error('❌ 未找到 scripts/private.key');
    console.error('请在 mp.weixin.qq.com → 开发管理 → 开发设置 → 「小程序代码上传」生成并下载密钥到此路径');
    process.exit(1);
  }

  const pkg = require(path.resolve(PROJECT_PATH, 'miniprogram/app.json'));
  const version = process.env.VERSION || readVersion();
  const desc = process.env.DESC || `自动上传 ${new Date().toISOString().slice(0, 16)}`;

  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: PROJECT_PATH,
    privateKeyPath: KEY_PATH,
    ignores: ['node_modules/**/*', 'scripts/**/*', '.git/**/*']
  });

  console.log('开始上传到微信...');
  console.log('版本号:', version);
  console.log('备注:', desc);

  const result = await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      autoPrefixWXSS: true
    },
    onProgressUpdate: (info) => {
      if (info && info.message) console.log(' ›', info.message);
    }
  });

  console.log('✅ 上传完成');
  console.log(JSON.stringify(result, null, 2));
  console.log('');
  console.log('==========================================');
  console.log('  下一步（约 10 秒）：');
  console.log('  1. 用微信扫码登录 mp.weixin.qq.com');
  console.log('  2. 点击 [版本管理] → [开发版] → 找到刚上传的版本');
  console.log('  3. 点击「提交审核」按钮');
  console.log('==========================================');
})().catch(e => {
  console.error('❌ 上传失败:', e);
  process.exit(1);
});

function readVersion() {
  // 自动版本号：1.0.YYYYMMDDHHmm
  const d = new Date();
  const pad = n => (n < 10 ? '0' + n : '' + n);
  return `1.0.${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}
