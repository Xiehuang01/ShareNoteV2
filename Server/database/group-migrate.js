import { pool } from './db.js'

/**
 * 小组管理数据库表设计
 * 
 * 表结构说明：
 * 1. groups - 小组基本信息表
 * 2. group_members - 小组成员关系表
 * 3. group_invitations - 小组邀请表
 * 4. group_activities - 小组活动日志表
 */

export const migrateGroupTables = async () => {
  let connection = null
  try {
    console.log('开始创建小组管理相关表...')
    
    // 获取一个连接
    connection = await pool.getConnection()
    console.log('✓ 数据库连接成功')

    // 1. 创建小组表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS groups (
        groupId INT PRIMARY KEY AUTO_INCREMENT COMMENT '小组ID',
        groupName VARCHAR(100) NOT NULL COMMENT '小组名称',
        creatorId INT NOT NULL COMMENT '创建者ID',
        createdTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        isActive TINYINT(1) DEFAULT 1 COMMENT '是否激活（0-已删除，1-正常）',
        maxMembers INT DEFAULT 5 COMMENT '最大成员数（2-15人）',
        INDEX idx_creator (creatorId),
        INDEX idx_created_time (createdTime),
        FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE,
        CHECK (maxMembers >= 2 AND maxMembers <= 15)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小组信息表';
    `)
    console.log('✓ groups 表创建成功')

    // 2. 创建小组成员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS group_members (
        groupId INT NOT NULL COMMENT '小组ID',
        userId INT NOT NULL COMMENT '用户ID',
        role ENUM('owner', 'admin', 'member') DEFAULT 'member' COMMENT '角色（owner-所有者，admin-管理员，member-普通成员）',
        joinedTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
        isActive TINYINT(1) DEFAULT 1 COMMENT '是否激活（0-已退出，1-正常）',
        PRIMARY KEY (groupId, userId),
        INDEX idx_group (groupId),
        INDEX idx_user (userId),
        INDEX idx_role (role),
        FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小组成员表';
    `)
    console.log('✓ group_members 表创建成功')

    // 3. 创建小组邀请表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS group_invitations (
        invitationId INT PRIMARY KEY AUTO_INCREMENT COMMENT '邀请ID',
        groupId INT NOT NULL COMMENT '小组ID',
        inviterId INT NOT NULL COMMENT '邀请人ID',
        inviteeId INT COMMENT '被邀请人ID（如果通过用户ID邀请）',
        inviteeEmail VARCHAR(100) COMMENT '被邀请人邮箱（如果通过邮箱邀请）',
        invitationCode VARCHAR(50) UNIQUE COMMENT '邀请码',
        status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending' COMMENT '状态',
        createdTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        expiresTime DATETIME COMMENT '过期时间',
        respondedTime DATETIME COMMENT '响应时间',
        message TEXT COMMENT '邀请留言',
        INDEX idx_group (groupId),
        INDEX idx_inviter (inviterId),
        INDEX idx_invitee (inviteeId),
        INDEX idx_code (invitationCode),
        INDEX idx_status (status),
        INDEX idx_expires (expiresTime),
        FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE,
        FOREIGN KEY (inviterId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (inviteeId) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小组邀请表';
    `)
    console.log('✓ group_invitations 表创建成功')

    // 4. 创建小组活动日志表（可选，用于记录小组内的操作）
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS group_activities (
        activityId INT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
        groupId INT NOT NULL COMMENT '小组ID',
        userId INT NOT NULL COMMENT '操作用户ID',
        activityType ENUM('join', 'leave', 'role_change', 'group_update') COMMENT '活动类型',
        activityDetail TEXT COMMENT '活动详情（JSON格式）',
        createdTime DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_group (groupId),
        INDEX idx_user (userId),
        INDEX idx_type (activityType),
        INDEX idx_time (createdTime),
        FOREIGN KEY (groupId) REFERENCES groups(groupId) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小组活动日志表';
    `)
    console.log('✓ group_activities 表创建成功')

    console.log('✅ 所有小组管理表创建完成！')

  } catch (error) {
    console.error('❌ 创建小组管理表失败:', error.message)
    throw error
  } finally {
    // 释放连接
    if (connection) {
      connection.release()
      console.log('✓ 数据库连接已释放')
    }
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateGroupTables()
    .then(() => {
      console.log('迁移完成')
      process.exit(0)
    })
    .catch(() => {
      process.exit(1)
    })
}

