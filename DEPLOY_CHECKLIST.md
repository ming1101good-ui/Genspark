# 部署清单（按顺序执行）

## ✅ Step 1 — 用微信开发者工具打开项目（5 分钟）

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目：选择本目录，AppID 填 `wx0537c638f83f3275`
3. 编译 → 应能在模拟器看到首页（数据是 mock 占位）

## ✅ Step 2 — 开通云开发（5 分钟）

1. 工具栏点击「云开发」→ 开通免费版
2. 复制环境 ID（如 `xiagu-kaihei-helper-2gXXXX`）
3. 修改 `miniprogram/app.js` 第 4 行：
   ```js
   envId: 'xiagu-kaihei-helper-2gXXXX',  // 改成你的真实 envId
   ```
4. 保存并重新编译

## ✅ Step 3 — 创建数据库集合（5 分钟）

云开发控制台 → 数据库 → 「+ 新建集合」，创建以下 14 个集合（权限：仅创建者可读写）：

```
heroes  hero_builds  items  runes  combos
kpl_matches  kpl_teams  kpl_players  kpl_rank
streamers  videos  squads
sync_status  sync_log
```

## ✅ Step 4 — 部署 9 个云函数（10 分钟）

在工具中右键 `cloudfunctions/` 下每个文件夹，选「**上传并部署：云端安装依赖**」：

- [ ] sync-heroes
- [ ] sync-items
- [ ] sync-kpl
- [ ] sync-bilibili
- [ ] sync-squad
- [ ] sync-master
- [ ] api-list
- [ ] api-detail
- [ ] api-search

## ✅ Step 5 — 首次手动触发同步（10 分钟）

云开发控制台 → 云函数 → `sync-master` → 「云端测试」→ 触发  
等待 5-10 分钟，期间会自动拉取所有数据。

## ✅ Step 6 — 配置告警（可选，5 分钟）

云开发控制台 → 云函数 → `sync-master` → 配置 → 环境变量，三选一即可：

- `FEISHU_WEBHOOK` = 飞书机器人 webhook 完整 URL
- `SERVERCHAN_KEY` = Server酱 SendKey（https://sct.ftqq.com 注册）
- `TG_BOT_TOKEN` + `TG_CHAT_ID` = Telegram

## ✅ Step 7 — 上传发布

### 选 A：直接在工具里上传（最简单）

1. 工具右上角「上传」按钮 → 填版本号 → 确定
2. 浏览器登录 mp.weixin.qq.com → 版本管理 → 「提交审核」

### 选 B：用 CI 脚本

```bash
# 1. 在 mp.weixin.qq.com 下载上传密钥
# 2. 重命名为 private.key 放入 scripts/
cd scripts
npm install
node upload.js
```

## ✅ Step 8 — 提交审核（10 秒）

1. 浏览器打开 mp.weixin.qq.com 扫码登录
2. 版本管理 → 开发版 → 点击「提交审核」
3. **类目建议选**：工具 → 效率工具
4. 等待 1-3 个工作日审核通过

---

## 🔥 部署后定时任务清单

每个 sync-* 云函数都已配置定时器，部署后会**自动按时执行**：

| 云函数 | 触发时间 | Cron |
|---|---|---|
| sync-master | 每天 04:00 | `0 0 4 * * *` |
| sync-master | 每天 22:00（赛事日） | `0 0 22 * * *` |
| sync-heroes | 每天 04:00 | `0 0 4 * * *` |
| sync-kpl | 每天 04:30 + 22:00 | — |
| sync-bilibili | 每天 05:00 | `0 0 5 * * *` |
| sync-items | 每周一 04:00 | `0 0 4 * * 1` |
| sync-squad | 每天 06:00 | `0 0 6 * * *` |

无需人工干预，每天自动更新。
