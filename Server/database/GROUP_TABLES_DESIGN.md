# 小组管理数据库表设计文档

## 概述
本文档描述了 ShareNote 项目中小组管理功能的数据库表结构设计。

## 表结构

### 1. groups（小组信息表）
存储小组的基本信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| groupId | INT | 小组ID | 主键，自增 |
| groupName | VARCHAR(100) | 小组名称 | 非空 |
| creatorId | INT | 创建者ID | 非空，外键关联 users(id) |
| createdTime | DATETIME | 创建时间 | 自动生成 |
| isActive | TINYINT(1) | 是否激活 | 0-已删除，1-正常 |
| maxMembers | INT | 最大成员数 | 默认5，范围2-15人 |

**索引：**
- `idx_creator`: 创建者ID索引
- `idx_created_time`: 创建时间索引

---

### 2. group_members（小组成员表）
存储小组成员关系和角色信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| groupId | INT | 小组ID | 主键，外键关联 groups(groupId) |
| userId | INT | 用户ID | 主键，外键关联 users(id) |
| role | ENUM | 角色 | owner/admin/member |
| joinedTime | DATETIME | 加入时间 | 自动生成 |
| isActive | TINYINT(1) | 是否激活 | 0-已退出，1-正常 |

**角色说明：**
- `owner`: 所有者（创建者），拥有所有权限
- `admin`: 管理员，可以管理成员
- `member`: 普通成员

**索引：**
- 联合主键：(groupId, userId)
- `idx_group`: 小组ID索引
- `idx_user`: 用户ID索引
- `idx_role`: 角色索引

---

### 3. group_invitations（小组邀请表）
存储小组邀请信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| invitationId | INT | 邀请ID | 主键，自增 |
| groupId | INT | 小组ID | 非空，外键关联 groups(groupId) |
| inviterId | INT | 邀请人ID | 非空，外键关联 users(id) |
| inviteeId | INT | 被邀请人ID | 可选，外键关联 users(id) |
| inviteeEmail | VARCHAR(100) | 被邀请人邮箱 | 可选 |
| invitationCode | VARCHAR(50) | 邀请码 | 唯一 |
| status | ENUM | 状态 | pending/accepted/rejected/expired |
| createdTime | DATETIME | 创建时间 | 自动生成 |
| expiresTime | DATETIME | 过期时间 | 可选 |
| respondedTime | DATETIME | 响应时间 | 可选 |
| message | TEXT | 邀请留言 | 可选 |

**状态说明：**
- `pending`: 待处理
- `accepted`: 已接受
- `rejected`: 已拒绝
- `expired`: 已过期

**索引：**
- `idx_group`: 小组ID索引
- `idx_inviter`: 邀请人索引
- `idx_invitee`: 被邀请人索引
- `idx_code`: 邀请码索引
- `idx_status`: 状态索引
- `idx_expires`: 过期时间索引

---

### 4. group_activities（小组活动日志表）
记录小组内的操作日志。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| activityId | INT | 活动ID | 主键，自增 |
| groupId | INT | 小组ID | 非空，外键关联 groups(groupId) |
| userId | INT | 操作用户ID | 非空，外键关联 users(id) |
| activityType | ENUM | 活动类型 | join/leave/role_change/group_update |
| activityDetail | TEXT | 活动详情 | JSON格式 |
| createdTime | DATETIME | 创建时间 | 自动生成 |

**活动类型说明：**
- `join`: 加入小组
- `leave`: 离开小组
- `role_change`: 角色变更
- `group_update`: 小组信息更新

**索引：**
- `idx_group`: 小组ID索引
- `idx_user`: 用户ID索引
- `idx_type`: 活动类型索引
- `idx_time`: 创建时间索引

---

## 使用说明

### 1. 运行迁移脚本
```bash
cd Server
node database/group-migrate.js
```

### 2. 常见查询示例

#### 获取用户所在的所有小组
```sql
SELECT g.*, gm.role, gm.joinedTime
FROM groups g
INNER JOIN group_members gm ON g.groupId = gm.groupId
WHERE gm.userId = ? AND gm.isActive = 1 AND g.isActive = 1
ORDER BY gm.joinedTime DESC;
```

#### 获取小组的所有成员
```sql
SELECT u.id, u.username, u.email, u.avatarpath, gm.role, gm.joinedTime
FROM group_members gm
INNER JOIN users u ON gm.userId = u.id
WHERE gm.groupId = ? AND gm.isActive = 1
ORDER BY 
  CASE gm.role 
    WHEN 'owner' THEN 1 
    WHEN 'admin' THEN 2 
    WHEN 'member' THEN 3 
  END,
  gm.joinedTime ASC;
```

#### 检查小组是否已满员
```sql
SELECT 
  g.maxMembers,
  COUNT(gm.userId) as currentMembers,
  (g.maxMembers - COUNT(gm.userId)) as availableSlots
FROM groups g
LEFT JOIN group_members gm ON g.groupId = gm.groupId AND gm.isActive = 1
WHERE g.groupId = ?
GROUP BY g.groupId;
```

#### 检查用户是否有权限管理小组
```sql
SELECT role
FROM group_members
WHERE groupId = ? 
  AND userId = ? 
  AND isActive = 1
  AND role IN ('owner', 'admin');
```

---

## 功能扩展建议

### 1. 小组标签/分类
可以添加 `group_tags` 表来支持小组分类：
```sql
CREATE TABLE group_tags (
  tagId INT PRIMARY KEY AUTO_INCREMENT,
  groupId INT NOT NULL,
  tagName VARCHAR(50) NOT NULL,
  FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE
);
```

### 2. 小组公告
可以添加 `group_announcements` 表来支持小组公告：
```sql
CREATE TABLE group_announcements (
  announcementId INT PRIMARY KEY AUTO_INCREMENT,
  groupId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  publisherId INT NOT NULL,
  publishedTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  isPinned TINYINT(1) DEFAULT 0,
  FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE,
  FOREIGN KEY (publisherId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 注意事项

1. **权限控制**：在实现 API 时，务必检查用户的角色权限
2. **级联删除**：删除小组时会自动删除相关的成员、邀请等记录
3. **软删除**：使用 `isActive` 字段实现软删除，保留历史数据
4. **性能优化**：已添加必要的索引，但在数据量大时可能需要进一步优化
5. **邀请码**：建议使用 UUID 或随机字符串生成唯一邀请码
6. **过期处理**：需要定期清理过期的邀请记录
7. **成员限制**：创建小组时需要验证 maxMembers 在 2-15 范围内

---

## 版本历史

- v1.1 (2026-02-27): 简化版本
  - 移除小组描述、头像、更新时间
  - 最大成员数限制为2-15人
  - 移除小组成员表的记录ID和昵称字段
  - 移除小组文件表
- v1.0 (2026-02-27): 初始版本，包含基础的小组管理功能

