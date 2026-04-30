// 生成预览二维码（无需提交审核，扫码即可查看）
const ci = require('miniprogram-ci');
const path = require('path');

const APPID = 'wx0537c638f83f3275';

(async () => {
  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '..'),
    privateKeyPath: path.resolve(__dirname, '../private.key'),
    ignores: ['node_modules/**/*', 'scripts/**/*', 'private.key', '.git/**/*']
  });

  const previewResult = await ci.preview({
    project,
    desc: '峡谷开黑助手 预览',
    setting: { es6: true, es7: true, minify: true },
    qrcodeFormat: 'image',
    qrcodeOutputDest: path.resolve(__dirname, '../preview-qr.jpg'),
    pagePath: 'pages/index/index'
  });

  console.log('✅ 预览二维码已生成：preview-qr.jpg');
  console.log('用微信扫描即可在手机上预览（无需安装小程序）');
})().catch(e => { console.error(e); process.exit(1); });
