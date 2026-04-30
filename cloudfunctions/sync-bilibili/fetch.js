const https = require('https');
module.exports = (url, extraHeaders = {}, retry = 3) => new Promise((resolve, reject) => {
  const exec = (left) => {
    const req = https.get(url, {
      timeout: 12000,
      headers: Object.assign({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'Accept': 'application/json,text/plain,*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      }, extraHeaders)
    }, res => {
      if (res.statusCode !== 200) {
        if (left > 0) return setTimeout(() => exec(left - 1), (4 - left) * 1500);
        return reject(new Error('HTTP ' + res.statusCode));
      }
      let buf = [];
      res.on('data', c => buf.push(c));
      res.on('end', () => resolve(Buffer.concat(buf).toString('utf8')));
    });
    req.on('error', err => {
      if (left > 0) setTimeout(() => exec(left - 1), (4 - left) * 1500);
      else reject(err);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
  };
  exec(retry);
});
