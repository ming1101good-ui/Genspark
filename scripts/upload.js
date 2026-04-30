// 上传到微信开发版（用 miniprogram-ci）
// 用法：npm run upload [-- --version 1.0.0 --desc 描述]
const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

const APPID = 'wx0537c638f83f3275';

const args = process.argv.slice(2);
const getArg = (k, d) => {
  const i = args.indexOf('--' + k);
  return i >= 0 ? args[i + 1] : d;
};

const version = getArg('version', '1.0.0');
const desc = getArg('desc', '峡谷开黑助手 自动上传 ' + new Date().toISOString().slice(0, 16));

(async () => {
  const keyPath = path.resolve(__dirname, '../private.key');
  if (!fs.existsSync(keyPath)) {
    console.error('❌ 缺少 private.key 文件！');
    console.error('请先去 mp.weixin.qq.com → 开发管理 → 开发设置 → 小程序代码上传');
    console.error('生成密钥并下载，保存到项目根目录命名为 private.key');
    process.exit(1);
  }

  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: path.resolve(__dirname, '..'),
    privateKeyPath: keyPath,
    ignores: ['node_modules/**/*', 'scripts/**/*', 'private.key', '.git/**/*', '*.log', 'README.md']
  });

  console.log(`🚀 开始上传  版本：${version}  描述：${desc}`);

  const uploadResult = await ci.upload({
    project,
    version,
    desc,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      codeProtect: false,
      autoPrefixWXSS: true
    },
    onProgressUpdate: console.log
  });

  console.log('\n✅ 上传成功！');
  console.log(`📊 包大小：${(uploadResult.subPackageInfo[0].size / 1024).toFixed(1)} KB`);
  console.log('\n📱 下一步操作（你需要扫码点 1 下）：');
  console.log('1. 打开 https://mp.weixin.qq.com');
  console.log('2. 进入"管理 → 版本管理 → 开发版本"');
  console.log('3. 找到刚上传的版本 → 点击"提交审核"');
  console.log('4. 填写审核信息（类目建议：工具→效率工具）→ 人脸识别确认');
  console.log('5. 等待 1-3 个工作日审核结果');
})().catch(e => {
  console.error('❌ 上传失败：', e.message || e);
  if (e.errCode === -10008) {
    console.error('提示：请把当前机器的出口 IP 加到 mp.weixin.qq.com → 开发管理 → 开发设置 → "小程序代码上传"白名单');
  }
  process.exit(1);
});
