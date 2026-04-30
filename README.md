# 峡谷开黑助手 · 王者攻略社区微信小程序

> 状态：v1.0.0 · 完整工程已就绪，等待用户在微信开发者工具中导入并完成云开发首次部署
>
> 一站式王者荣耀玩家社区：KPL 赛事 + 主播精彩剪辑 + 英雄百科 + 五排上分套路 + 装备铭文搭配  
> 数据每日凌晨自动同步，多源容灾 + 自动修复 + 多渠道告警

- **AppID**：`wx0537c638f83f3275`
- **架构**：微信小程序原生 + 微信云开发（CloudBase 云函数 + 云数据库）
- **托管**：100% 微信官方免费渠道
- **小程序名称**：峡谷开黑助手

---

## 一、目录结构

```
.
├── miniprogram/             小程序前端（共 23 个页面）
│   ├── app.js / app.json / app.wxss
│   ├── pages/
│   │   ├── index/           L1 首页（搜索 + 轮播 + 5 频道入口 + 推荐）
│   │   ├── kpl/             L2-L5 KPL：list / match / team / player / replay
│   │   ├── streamer/        L2-L5 主播：list / detail / video / player
│   │   ├── hero/            L2-L5 英雄：list / detail / build / skin / highlight
│   │   ├── squad/           L2-L4 五排：list / detail / lineup / tutorial
│   │   └── shop/            L2-L4 商城：list / item / rune / combo
│   ├── components/          通用组件
│   ├── images/              tabBar 图标 + 占位图
│   └── utils/               util.js / api.js / mock.js
├── cloudfunctions/          云函数（共 9 个）
│   ├── sync-heroes/         拉取英雄/技能/皮肤
│   ├── sync-kpl/            拉取 KPL 赛事/积分榜
│   ├── sync-bilibili/       拉取 B 站精彩视频
│   ├── sync-items/          拉取装备 + 铭文 + 模板搭配
│   ├── sync-squad/          AI 解析五排套路
│   ├── sync-master/         总调度 + 自动修复 + 告警
│   ├── api-list/            列表接口
│   ├── api-detail/          详情接口
│   └── api-search/          全局搜索
├── scripts/                 自动上传脚本（miniprogram-ci）
├── project.config.json      微信开发者工具项目配置
└── README.md
```

页面深度均达到 **3-5 级**，每个频道都有完整的下钻路径。

---

## 二、首次部署步骤（只做一次）

### 步骤 1️⃣ 开通微信云开发环境

1. 用微信开发者工具打开本项目
2. 顶部点击「云开发」按钮 → 同意并开通（免费版即可）
3. 创建环境，**记下环境 ID**（形如 `xiagu-kaihei-helper-2g3xxxxx`）
4. 把环境 ID 填入两处：
   - `miniprogram/app.js` 的 `globalData.envId`
   - 此 README 备忘

### 步骤 2️⃣ 创建云数据库集合

打开云开发控制台 → 数据库 → 新建以下集合（权限均设为「仅创建者可读写」）：

| 集合名 | 用途 |
|---|---|
| `heroes` | 英雄/技能/皮肤 |
| `hero_builds` | 英雄出装方案 |
| `items` | 装备 |
| `runes` | 铭文 |
| `combos` | 铭文搭配 |
| `kpl_matches` | KPL 比赛 |
| `kpl_teams` | KPL 战队 |
| `kpl_players` | KPL 选手 |
| `kpl_rank` | KPL 积分榜 |
| `streamers` | 主播 |
| `videos` | 视频 |
| `squads` | 五排套路 |
| `sync_status` | 同步状态 |
| `sync_log` | 同步日志 |

> 也可以用云开发控制台导入 `scripts/db-init.json`（首次启动云函数时会自动创建文档）。

### 步骤 3️⃣ 部署云函数

在微信开发者工具中：

1. 右键 `cloudfunctions/sync-heroes` → 选择"上传并部署：云端安装依赖（不上传 node_modules）"
2. 对剩余 8 个云函数依次执行同样操作：
   - `sync-items` `sync-kpl` `sync-bilibili` `sync-squad` `sync-master`
   - `api-list` `api-detail` `api-search`
3. 在云开发控制台 → 云函数 → 找到每个 `sync-*` → 「触发器」会自动按 `config.json` 创建定时任务

### 步骤 4️⃣ 首次执行数据同步

部署完成后，在云开发控制台手动测试一次：

1. 点击 `sync-master` → 测试 → 触发
2. 等待约 5-10 分钟（首次会拉取约 100+ 英雄、上千件装备/铭文/视频）
3. 数据库中应能看到 heroes/items/videos/squads 等表中的内容

### 步骤 5️⃣ 配置告警 Webhook（可选）

在云开发控制台 → 云函数 → `sync-master` → 配置 → 环境变量，添加：

| 变量名 | 说明 | 来源 |
|---|---|---|
| `FEISHU_WEBHOOK` | 飞书机器人 Webhook 完整 URL | 飞书群「设置 → 群机器人 → 添加自定义机器人」 |
| `SERVERCHAN_KEY` | Server酱 SendKey（推送到微信） | https://sct.ftqq.com/ |
| `TG_BOT_TOKEN` | Telegram Bot Token | 找 @BotFather 创建机器人 |
| `TG_CHAT_ID` | Telegram chat_id | 给 @userinfobot 发条消息即可获得 |

只需配置 **任意一个**即可。三个都不配则告警走云函数日志（仍会记录）。

---

## 三、本地开发与发布

### 本地开发

1. 用微信开发者工具打开本项目根目录
2. 顶部填入 AppID `wx0537c638f83f3275`
3. 点击「编译」即可在模拟器中预览
4. 真机调试：点击「真机调试」→ 用微信扫码

### 自动上传到微信审核

#### 方式 A：用微信开发者工具（最简单）
1. 顶部点击「上传」→ 填入版本号和描述
2. 浏览器登录 mp.weixin.qq.com → 版本管理 → 开发版 → 找到刚上传的版本 → 点击「提交审核」

#### 方式 B：用 miniprogram-ci 命令行（适合 CI/CD）

**第一步：准备上传密钥**
1. 浏览器登录 https://mp.weixin.qq.com/
2. 开发管理 → 开发设置 → 滚动到「小程序代码上传」
3. 点击「生成」获取私钥（每个微信账号每个 IP 只能下载一次）
4. 把下载的 `private.MP_xxxxx.key` 重命名为 `private.key`，放入 `scripts/private.key`
5. 同页面添加 IP 白名单（添加运行 CI 的机器 IP）

**第二步：执行上传**
```bash
cd scripts
npm install
node upload.js
```

输出最后会提示：
```
✅ 上传完成
==========================================
  下一步（约 10 秒）：
  1. 用微信扫码登录 mp.weixin.qq.com
  2. 点击 [版本管理] → [开发版] → 找到刚上传的版本
  3. 点击「提交审核」按钮
==========================================
```

**第三步：你只需 10 秒即可提交审核** —— 进入微信公众平台扫码点击"提交审核"按钮即可。

---

## 四、数据自动同步机制

### 同步流程

```
每日 04:00 凌晨触发 sync-master
  │
  ├─ 1. sync-items     拉取 装备 + 铭文 + 经典搭配
  ├─ 2. sync-heroes    拉取 英雄 + 技能 + 皮肤（约 110 个英雄）
  ├─ 3. sync-kpl       拉取 KPL 赛程 + 积分榜
  ├─ 4. sync-bilibili  拉取 B站搜索的精彩视频（按主播+关键词）
  └─ 5. sync-squad     基于英雄+视频AI解析五排套路
```

KPL 在比赛日（22:00）会再拉取一次以更新当晚战报。

### 数据源

| 模块 | 主源 | 备源 |
|---|---|---|
| 英雄 | pvp.qq.com 官网 herolist.json | gtimg 镜像 |
| 装备/铭文 | pvp.qq.com item.json / mingwen.json | gtimg 镜像 |
| KPL | tga.qq.com 接口 | 王者电竞官网 |
| 视频 | bilibili.com 搜索 API | （单源，失败降级展示历史数据） |
| 五排套路 | 视频标题 AI 解析 + 模板兜底 | — |

### 自动修复机制

- ✅ **多源容灾**：每个数据源最多 2-3 个备份，单源失败自动切换
- ✅ **失败重试**：每个 URL 重试 3 次，指数退避 (1s/2s/3s)
- ✅ **降级容错**：详情失败保留列表数据；当天失败明天再试
- ✅ **数据校验**：失败超过 20% 视为同步异常，记录到 `sync_status`
- ✅ **告警机制**：连续 3 天失败自动推送到飞书 / 微信(Server酱) / Telegram
- ✅ **前端兜底**：即使云函数完全失败，前端会用 `mock.js` 数据降级展示，不会白屏

### 查看同步状态

云开发控制台 → 数据库 → `sync_status` 表，可见每个模块的 `lastSync / success / failed / ok` 字段。

`sync_log` 表保留每次执行的完整日志（用于追查问题）。

---

## 五、关于审核

### 个人主体审核策略

由于王者荣耀属于腾讯版权产品，本项目做了以下规避：

- ✅ 名称用 **峡谷开黑助手**（不含敏感商标）
- ✅ 类目建议选 **工具 → 效率工具** 或 **教育 → 兴趣学习**
- ✅ 内容标注 "玩家自发交流，与官方无关"
- ⚠️ 个人主体仍然有一定被驳回风险，若被拒可改用「企业主体」重新提交

### 如果审核被拒

常见原因和对策：

| 拒绝理由 | 对策 |
|---|---|
| 涉嫌侵犯腾讯商标 | 把 `app.json` 中的 `navigationBarTitleText` 去掉「王者」字样 |
| 服务类目与内容不符 | 在 mp.weixin.qq.com 重新选择类目 |
| 涉及游戏类目需企业主体 | 升级为企业认证 |

---

## 六、技术亮点

- **23 个页面 / 5 级深度**：每个频道都有完整的列表→详情→子页面的下钻路径
- **9 个云函数**：数据同步 + 业务接口完全解耦
- **多源容灾**：每个数据源最多 3 个 URL 备份
- **自动告警**：飞书 / Server酱(微信) / Telegram 三选一
- **前端兜底**：mock 数据 + 重试 + 优雅降级，从不白屏
- **零成本**：100% 走微信官方免费配额
  - 云函数 40 万 GBs/月免费
  - 数据库 2 GB 免费
  - 存储 5 GB 免费

---

## 七、常见问题

**Q: 为什么有的数据看起来是假的？**  
A: 第一次部署后，需要先手动触发一次 `sync-master` 完成数据同步。在数据同步完成前，前端会展示 `mock.js` 中的占位数据。

**Q: B 站视频为什么不能直接播放？**  
A: B 站视频版权保护严格，本小程序只展示 BV 号 + 封面 + 标题。点击后用户可一键复制 BV 号到 B 站观看完整视频。这是合规做法，避免侵权风险。

**Q: 五排套路准确率为什么不是 100%？**  
A: 王者荣耀没有公开的"阵容数据库"，五排套路通过两种方式生成：1) 内置 5 个 T0/T1 模板套路（人工挑选）；2) AI 解析 B 站视频标题中提到的英雄名识别阵容（准确率约 70-80%）。我们用模板兜底确保即使 AI 解析全失败也有数据可看。

**Q: 想增加更多主播 / 关键词怎么办？**  
A: 编辑 `cloudfunctions/sync-bilibili/index.js` 的 `STREAMERS` 和 `HOT_KEYWORDS` 数组，重新部署即可。

---

## License

仅供学习交流，不得用于商业用途。版权相关内容归腾讯所有。
