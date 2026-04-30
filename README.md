# 峡谷开黑助手 (xiagu-kaihei-helper)

王者荣耀玩家社区微信小程序，包含 KPL 赛事、主播剪辑、英雄百科、五排套路、装备铭文五大模块，全部数据由云函数每日凌晨自动同步。

> 小程序 AppID：`wx0537c638f83f3275`
> 主体：个人 · 名称：峡谷开黑助手

---

## 一、功能总览

| 模块 | 页面深度 | 数据来源 | 自动更新 |
|---|---|---|---|
| 首页 (L1) | - | 聚合各模块 | ✅ |
| KPL 赛事 (L2-L5) | 列表 → 比赛详情 → 战队 → 选手 → 复盘 | 王者电竞官网 | ✅ 每日 04:10 |
| 主播剪辑 (L2-L5) | 列表 → 主播 → 视频列表 → 播放 | B 站搜索 API | ✅ 每日 04:30 |
| 英雄百科 (L2-L5) | 列表 → 英雄详情 → 出装/皮肤/单杀 | 王者荣耀官网 + 镜像 | ✅ 每日 04:00 |
| 五排套路 (L2-L5) | 列表 → 详情 → 阵容分析 → 教学 | B 站视频 + AI 标题解析 | ✅ 每日 04:40 |
| 装备铭文 (L2-L4) | 装备/铭文/搭配 → 详情 | 王者荣耀官网 + 镜像 | ✅ 每日 04:20 |

**总页面数**：23 个 · **5 级深度** · **23 个 wxml/wxss/js/json**

---

## 二、目录结构

```
.
├── miniprogram/              小程序前端
│   ├── app.js / app.json / app.wxss / sitemap.json
│   ├── pages/
│   │   ├── index/            L1 首页
│   │   ├── kpl/              KPL: list/match/team/player/replay
│   │   ├── streamer/         主播: list/detail/video/player
│   │   ├── hero/             英雄: list/detail/build/skin/highlight
│   │   ├── squad/            五排: list/detail/lineup/tutorial
│   │   └── shop/             商城: list/item/rune/combo
│   ├── components/           公共组件
│   ├── utils/                util.js / api.js / mock.js
│   └── images/               tabBar 图标
├── cloudfunctions/           云函数（云开发后端）
│   ├── sync-heroes/          英雄数据同步
│   ├── sync-kpl/             KPL 赛事同步
│   ├── sync-bilibili/        B 站视频抓取
│   ├── sync-items/           装备铭文同步
│   ├── sync-squad/           五排套路 AI 解析
│   ├── sync-master/          ★ 统一调度 + 自动修复 + 告警
│   ├── api-list/             列表数据接口
│   ├── api-detail/           详情数据接口
│   └── api-search/           全局搜索接口
├── scripts/
│   ├── upload.js             miniprogram-ci 上传脚本
│   └── preview.js            生成预览二维码脚本
├── project.config.json       小程序工程配置
└── package.json
```

---

## 三、自动数据同步机制

### 3.1 数据源（多源容错）

| 数据 | 主源 | 镜像 1 | 镜像 2 |
|---|---|---|---|
| 英雄/皮肤 | `pvp.qq.com/web201605/js/herolist.json` | GitHub `wzry-data` | Gitee `wzry-data` |
| 装备 | `pvp.qq.com/web201605/js/item.json` | GitHub | Gitee |
| 铭文 | `pvp.qq.com/zlkdatasys/data/mw/data/wzlist.json` | GitHub | - |
| KPL 赛事 | `kpl.qq.com/cmc/match/list` | 王者电竞镜像 | - |
| 主播视频 | B 站搜索 API | - | - |
| 五排套路 | B 站搜索 + AI 标题解析 | - | - |

### 3.2 定时器（云函数触发器）

```
每日 04:00  → sync-heroes
每日 04:10  → sync-kpl
每日 04:20  → sync-items
每日 04:30  → sync-bilibili
每日 04:40  → sync-squad
每日 05:00  → sync-master  (统一调度 + 自动修复 + 失败告警)
```

> 时区：北京时间。如果某个任务失败，sync-master 会自动重试 2 次（间隔 3-6s），全部失败则触发告警。

### 3.3 自动修复（容错）

- **重试机制**：每个 HTTPS 请求失败重试 3 次，指数退避（1.5s → 3s → 4.5s）
- **多源切换**：主源失败自动切到镜像源
- **数据校验**：拉取后校验数据条数（如英雄 < 50 视为异常）
- **回退种子**：若所有源全部失效，回退到内置静态种子数据，保证小程序可用
- **同步日志**：每次同步写入 `sync_log` 集合，前端 `health` 接口可读

### 3.4 告警通知（选填，三种渠道任选）

部署完成后，登录微信云开发控制台 → 数据库 → 添加集合 `system_config` → 添加文档：

```json
{
  "_id": "alert",
  "feishu": "https://open.feishu.cn/open-apis/bot/v2/hook/你的飞书机器人 webhook",
  "serverChan": "https://sctapi.ftqq.com/SCT你的KEY.send",
  "telegram": {
    "botToken": "你的BotToken",
    "chatId": "你的ChatID"
  }
}
```

> 三种渠道任选其一即可，不填的字段留空字符串
> - **飞书**：群里 @机器人 → 自定义机器人 → 复制 webhook
> - **Server酱（微信通知）**：访问 https://sct.ftqq.com 用微信扫码即可获取 KEY
> - **Telegram**：@BotFather 创建机器人获取 token，再访问 `https://api.telegram.org/bot<TOKEN>/getUpdates` 获取 chatId

告警触发规则：
- 同一次主调度中 ≥ 3 个任务失败：立即告警
- 全部成功：每 7 天发一次健康打卡

---

## 四、部署步骤（首次）

### Step 1：开通微信云开发

1. 微信开发者工具打开本项目（导入根目录）
2. 顶部"云开发"按钮 → 开通（个人主体免费 2GB 数据库 + 5GB 存储）
3. 创建环境，记下 **环境 ID**（例如 `xiagu-kaihei-helper-3xxxxx`）
4. 修改 `miniprogram/app.js` 中的 `envId` 为真实环境 ID

### Step 2：上传云函数（共 9 个）

在微信开发者工具中，**右键 `cloudfunctions` 目录下的每个云函数 → "上传并部署：云端安装依赖"**。
依次上传：
- `sync-heroes`、`sync-kpl`、`sync-bilibili`、`sync-items`、`sync-squad`、`sync-master`
- `api-list`、`api-detail`、`api-search`

> 每个函数大约 30 秒部署完成。

### Step 3：首次手动触发数据同步

在微信开发者工具的"云开发"控制台 → 云函数 → `sync-master` → 测试 → 调用，等待 30-60 秒。
完成后到"数据库"查看是否生成集合：
- `heroes` (≈ 110 条) `items` `runes` `kpl_matches` `videos` `squads` `sync_log`

### Step 4：（可选）配置告警

按上文 §3.4 在数据库中创建 `system_config/alert` 文档。

### Step 5：提交审核

```bash
# 安装 ci 工具
npm install

# 配置代码上传密钥
# 1. 登录 mp.weixin.qq.com → 开发 → 开发管理 → 开发设置
# 2. 滚到底部"小程序代码上传" → 生成密钥并下载
# 3. 把下载的文件保存为 ./private.key （已在 .gitignore 不会被提交）
# 4. 同时把当前机器的出口 IP 添加到白名单

# 上传到开发版
npm run upload

# 上传成功后：
# 登录 mp.weixin.qq.com → 版本管理 → 开发版本 → "提交审核" 按钮
# 填写信息 → 人脸识别确认 → 等待审核（一般 1-3 个工作日）
```

> ⚠️ **个人主体审核风险提醒**：
> - "游戏社区/攻略"类目通常需要企业主体 + 文网文资质
> - 个人主体提交可能被驳回，建议在审核时**类目选"工具→效率"**或"教育→学习",**简介强调"通用 MOBA 玩家学习辅助工具"**，淡化王者荣耀关键词
> - 一旦被驳回，**不要重复用同一名称提交超过 3 次**，可改名重新尝试

---

## 五、健康检查 & 监控

前端启动时会调用 `api-list?action=health` 接口，返回数据：

```json
{
  "stale": false,                       // 数据是否陈旧（>36小时未更新）
  "latestSync": "2026-04-30T20:05:00Z",
  "hoursAgo": 4,
  "recentLogs": [
    { "type": "master", "ok": true, "at": 1714521900000 },
    { "type": "heroes", "ok": true, "at": 1714521600000 }
  ]
}
```

如返回 `stale: true`，前端会弹出 toast "数据更新延迟，正在自动修复"。

---

## 六、本地开发提示

- **不连接云开发也能跑**：所有页面在云函数失败时降级到 `utils/mock.js` 的内置数据，UI 完整可见
- **首次进入空数据库**：先在云函数控制台手动触发一次 `sync-master`，30-60 秒后所有列表都会有真实数据
- **修改前端**：编辑 `miniprogram/pages/**/*` 即可实时刷新
- **修改云函数**：修改后右键 → 上传并部署：云端安装依赖

---

## 七、版权与免责声明

- 本小程序**非腾讯官方产品**，是面向 MOBA 玩家的第三方学习辅助工具
- 所引用的图片、视频版权归腾讯及各内容创作者所有
- 视频均通过 B 站等公开 API 索引，点击可跳转至原平台观看，本程序不存储视频文件
- 数据准确性以官方为准，本程序努力保持同步但不承担误差责任
