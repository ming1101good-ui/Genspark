const https = require('https');
module.exports = (url, retry = 3) => new Promise((resolve, reject) => {
  const exec = (left) => {
    const req = https.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Cookie': 'buvid3=' + Math.random().toString(36).slice(2),
        'Referer': 'https://search.bilibili.com/'
      }
    }, res => {
      if (res.statusCode !== 200) {
        if (left > 0) return setTimeout(() => exec(left - 1), (4 - left) * 1500);
        return reject(new Error('HTTP ' + res.statusCode));
      }
      let buf = [];
      res.on('data', c => buf.push(c));
      res.on('end', () => resolve(Buffer.concat(buf).toString('utf8')));
    });
    req.on('error', err => left > 0 ? setTimeout(() => exec(left - 1), (4 - left) * 1500) : reject(err));
    req.on('timeout', () => req.destroy());
  };
  exec(retry);
});
