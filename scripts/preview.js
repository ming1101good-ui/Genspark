// 生成体验版二维码（不上传，仅预览）
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const APPID = 'wx0537c638f83f3275';
const PROJECT_PATH = path.resolve(__dirname, '..');
const KEY_PATH = path.resolve(__dirname, 'private.key');

(async () => {
  if (!fs.existsSync(KEY_PATH)) {
    console.error('❌ 未找到 scripts/private.key，请先准备密钥');
    process.exit(1);
  }
  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: PROJECT_PATH,
    privateKeyPath: KEY_PATH,
    ignores: ['node_modules/**/*', 'scripts/**/*', '.git/**/*']
  });

  const qrPath = path.resolve(__dirname, 'preview.jpg');
  await ci.preview({
    project,
    desc: 'preview',
    setting: { es6: true, minify: true },
    qrcodeFormat: 'image',
    qrcodeOutputDest: qrPath,
    onProgressUpdate: (info) => info && info.message && console.log(' ›', info.message)
  });

  console.log('✅ 体验版二维码已生成：', qrPath);
  console.log('用微信扫码即可在手机上预览');
})().catch(e => { console.error(e); process.exit(1); });
