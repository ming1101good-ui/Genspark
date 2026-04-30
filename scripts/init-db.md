# 数据库初始化指引

云开发首次部署后，建议在**微信开发者工具 → 云开发 → 数据库**手动创建以下集合（也可由云函数首次写入时自动创建）：

| 集合名 | 说明 | 权限建议 |
|---|---|---|
| `heroes` | 英雄数据 | 仅创建者可读写 → 改为"所有用户可读" |
| `items` | 装备 | 所有用户可读 |
| `runes` | 铭文 | 所有用户可读 |
| `combos` | 铭文搭配 | 所有用户可读 |
| `videos` | B站视频 | 所有用户可读 |
| `kpl_matches` | KPL赛事 | 所有用户可读 |
| `kpl_teams` | KPL战队 | 所有用户可读 |
| `kpl_players` | KPL选手 | 所有用户可读 |
| `kpl_rank` | KPL积分榜 | 所有用户可读 |
| `squads` | 五排套路 | 所有用户可读 |
| `banners` | 首页轮播 | 所有用户可读 |
| `sync_log` | 同步日志 | 仅创建者可读写 |
| `system_config` | 系统配置(告警) | 仅创建者可读写 |

## 推荐索引

为提升查询性能，可在每个集合添加以下索引：

- `videos`: `views`(降序), `publishAt`(降序), `heroId`, `author`
- `heroes`: `role`, `updatedAt`(降序)
- `kpl_matches`: `date`(降序)
- `kpl_rank`: `rank`(升序)
- `squads`: `plays`(降序), `level`
- `sync_log`: `at`(降序)
