# 云数据库设计文档

## 1. 用户表 (users)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| _id | string | 自动生成，openId | 主键 |
| _openid | string | 微信openid | 索引 |
| nickName | string | 用户昵称 | - |
| avatarUrl | string | 用户头像 | - |
| createdAt | Date | 创建时间 | - |
| updatedAt | Date | 更新时间 | - |

## 2. 历史记录表 (history)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| _id | string | 自动生成 | - |
| _openid | string | 用户openid | 索引 |
| keyword | string | 关键词 | - |
| colorName | string | 颜色名称 | - |
| colorCode | string | 颜色代码 | - |
| message | string | 治愈短句 | - |
| date | string | 日期字符串 (YYYY.MM.DD) | - |
| createdAt | Date | 创建时间 | - |

## 3. 收藏表 (favorites)

| 字段名 | 类型 | 说明 | 索引 |
|--------|------|------|------|
| _id | string | 自动生成 | - |
| _openid | string | 用户openid | 索引 |
| keyword | string | 关键词 | - |
| colorName | string | 颜色名称 | - |
| colorCode | string | 颜色代码 | - |
| message | string | 治愈短句 | - |
| date | string | 日期字符串 (YYYY.MM.DD) | - |
| createdAt | Date | 收藏时间 | - |

---

## 索引说明

**users**：
- 主键索引：`_id`

**history**：
- 索引字段：`_openid` (按用户查询历史)

**favorites**：
- 索引字段：`_openid` (按用户查询收藏)
