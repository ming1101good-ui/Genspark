// 数据同步总调度器 + 自动修复 + 告警
// 流程：依次调用 sync-heroes / sync-items / sync-kpl / sync-bilibili / sync-squad
// 任一失败 -> 重试一次；连续 3 天失败 -> 告警飞书/Server酱/Telegram
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 告警 Webhook 配置（可在云函数环境变量里覆盖）
const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK || '';
const SERVERCHAN_KEY = process.env.SERVERCHAN_KEY || '';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
const TG_CHAT_ID = process.env.TG_CHAT_ID || '';

const PIPELINE = [
  { fn: 'sync-items', label: '装备/铭文', critical: true, deps: [] },
  { fn: 'sync-heroes', label: '英雄/技能/皮肤', critical: true, deps: [] },
  { fn: 'sync-kpl', label: 'KPL赛事', critical: false, deps: [] },
  { fn: 'sync-bilibili', label: '主播/精彩剪辑', critical: false, deps: ['sync-heroes'] },
  { fn: 'sync-squad', label: '五排套路', critical: false, deps: ['sync-heroes', 'sync-bilibili'] }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callOne(name, retry = 1) {
  for (let i = 0; i <= retry; i++) {
    try {
      const r = await cloud.callFunction({ name });
      const result = r.result || {};
      if (result.code === 0) return { ok: true, ...result };
      if (i < retry) await sleep(3000);
    } catch (e) {
      console.warn(`[master] ${name} attempt ${i + 1} failed: ${e.message}`);
      if (i < retry) await sleep(3000);
      else return { ok: false, msg: e.message };
    }
  }
  return { ok: false, msg: 'exhausted retries' };
}

// 多渠道告警
async function alert(title, content) {
  const tasks = [];

  if (FEISHU_WEBHOOK) {
    tasks.push(axios.post(FEISHU_WEBHOOK, {
      msg_type: 'interactive',
      card: {
        header: { title: { tag: 'plain_text', content: '⚠️ ' + title }, template: 'red' },
        elements: [{ tag: 'div', text: { tag: 'lark_md', content } }]
      }
    }, { timeout: 5000 }).catch(e => console.warn('feishu fail', e.message)));
  }

  if (SERVERCHAN_KEY) {
    tasks.push(axios.post(`https://sctapi.ftqq.com/${SERVERCHAN_KEY}.send`, {
      title, desp: content
    }, { timeout: 5000 }).catch(e => console.warn('serverchan fail', e.message)));
  }

  if (TG_BOT_TOKEN && TG_CHAT_ID) {
    tasks.push(axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      chat_id: TG_CHAT_ID,
      text: `⚠️ *${title}*\n\n${content}`,
      parse_mode: 'Markdown'
    }, { timeout: 5000 }).catch(e => console.warn('tg fail', e.message)));
  }

  await Promise.all(tasks);
}

// 检查连续失败次数
async function getConsecutiveFailures(module) {
  try {
    const r = await db.collection('sync_log')
      .where({ module })
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
    let n = 0;
    for (const log of (r.data || [])) {
      if (!log.ok) n++; else break;
    }
    return n;
  } catch (e) { return 0; }
}

exports.main = async (event) => {
  const startAt = Date.now();
  const report = [];
  const failures = [];

  // 拓扑排序（已硬编码顺序）
  for (const step of PIPELINE) {
    const t0 = Date.now();
    const r = await callOne(step.fn, 1);
    const elapsed = Date.now() - t0;
    const item = {
      module: step.fn,
      label: step.label,
      ok: r.ok,
      success: r.success || 0,
      failed: r.failed || 0,
      msg: r.msg || '',
      elapsedMs: elapsed
    };
    report.push(item);

    // 写日志
    await db.collection('sync_log').add({
      data: { ...item, createdAt: new Date() }
    }).catch(() => {});

    if (!r.ok) {
      failures.push(step);
      // 检查连续失败 → 告警
      const n = await getConsecutiveFailures(step.fn);
      if (n >= 3) {
        await alert(
          `数据同步连续 ${n} 天失败：${step.label}`,
          `模块：${step.fn}\n最近失败原因：${r.msg || 'unknown'}\n请检查云函数日志或数据源是否变更。`
        );
      }
    }
  }

  // 总状态
  const ok = failures.length === 0;
  await db.collection('sync_status').doc('master').set({
    data: {
      module: 'master',
      lastSync: new Date(),
      ok,
      elapsedMs: Date.now() - startAt,
      report,
      stale: !ok
    }
  }).catch(async () => {
    await db.collection('sync_status').add({
      data: {
        _id: 'master', module: 'master', lastSync: new Date(),
        ok, elapsedMs: Date.now() - startAt, report, stale: !ok
      }
    });
  });

  return { code: 0, ok, report };
};
