import express from 'express'
import { pool } from '../database/db.js'
import { checkAuth } from '../middlewares/auth.js'
import crypto from 'crypto'

const router = express.Router()

// 获取用户所在的所有小组
router.get('/getUserGroups', checkAuth, async (req, res) => {
  const userId = req.userId
  
  try {
    const [groups] = await pool.execute(`
      SELECT 
        g.*,
        gm.role,
        gm.joinedTime,
        (SELECT COUNT(*) FROM group_members WHERE groupId = g.groupId AND isActive = 1) as memberCount
      FROM groups g
      INNER JOIN group_members gm ON g.groupId = gm.groupId
      WHERE gm.userId = ? AND gm.isActive = 1 AND g.isActive = 1
      ORDER BY gm.joinedTime DESC
    `, [userId])
    
    res.json({ status: 'success', data: groups })
  } catch (error) {
    console.error('获取用户小组失败:', error)
    res.status(500).json({ status: 'fail', message: '服务器错误' })
  }
})

// 创建新小组
router.post('/createGroup', checkAuth, async (req, res) => {
  const userId = req.userId
  const { groupName, maxMembers = 5 } = req.body
  
  if (!groupName || !groupName.trim()) {
    return res.status(400).json({ status: 'fail', message: '小组名称不能为空' })
  }
  
  if (maxMembers < 2 || maxMembers > 15) {
    return res.status(400).json({ status: 'fail', message: '小组人数必须在2-15人之间' })
  }
  
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    // 创建小组
    const [result] = await connection.execute(
      'INSERT INTO groups (groupName, creatorId, maxMembers) VALUES (?, ?, ?)',
      [groupName.trim(), userId, maxMembers]
    )
    
    const groupId = result.insertId
    
    // 将创建者添加为小组成员（角色为owner）
    await connection.execute(
      'INSERT INTO group_members (groupId, userId, role) VALUES (?, ?, ?)',
      [groupId, userId, 'owner']
    )
    
    // 记录活动日志
    await connection.execute(
      'INSERT INTO group_activities (groupId, userId, activityType, activityDetail) VALUES (?, ?, ?, ?)',
      [groupId, userId, 'join', JSON.stringify({ action: 'create_and_join', groupName })]
    )
    
    await connection.commit()
    
    res.json({ 
      status: 'success', 
      message: '创建小组成功',
      data: { groupId, groupName, maxMembers, role: 'owner' }
    })
  } catch (error) {
    await connection.rollback()
    console.error('创建小组失败:', error)
    res.status(500).json({ status: 'fail', message: '创建失败' })
  } finally {
    connection.release()
  }
})

// 搜索小组
router.get('/searchGroups', checkAuth, async (req, res) => {
  const userId = req.userId
  const { keyword } = req.query
  
  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ status: 'fail', message: '搜索关键词不能为空' })
  }
  
  try {
    const [groups] = await pool.execute(`
      SELECT 
        g.*,
        u.username as creatorName,
        (SELECT COUNT(*) FROM group_members WHERE groupId = g.groupId AND isActive = 1) as memberCount,
        EXISTS(SELECT 1 FROM group_members WHERE groupId = g.groupId AND userId = ? AND isActive = 1) as isMember,
        ((SELECT COUNT(*) FROM group_members WHERE groupId = g.groupId AND isActive = 1) >= g.maxMembers) as isFull
      FROM groups g
      INNER JOIN users u ON g.creatorId = u.id
      WHERE g.isActive = 1 
        AND (g.groupName LIKE ? OR g.groupId = ?)
      ORDER BY g.createdTime DESC
      LIMIT 20
    `, [userId, `%${keyword}%`, keyword])
    
    res.json({ status: 'success', data: groups })
  } catch (error) {
    console.error('搜索小组失败:', error)
    res.status(500).json({ status: 'fail', message: '搜索失败' })
  }
})

// 获取小组成员
router.get('/getGroupMembers', checkAuth, async (req, res) => {
  const userId = req.userId
  const { groupId } = req.query
  
  if (!groupId) {
    return res.status(400).json({ status: 'fail', message: '缺少小组ID' })
  }
  
  try {
    // 检查用户是否是小组成员
    const [membership] = await pool.execute(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ? AND isActive = 1',
      [groupId, userId]
    )
    
    if (membership.length === 0) {
      return res.status(403).json({ status: 'fail', message: '无权限查看' })
    }
    
    // 获取小组成员
    const [members] = await pool.execute(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.avatarpath,
        gm.role,
        gm.joinedTime
      FROM group_members gm
      INNER JOIN users u ON gm.userId = u.id
      WHERE gm.groupId = ? AND gm.isActive = 1
      ORDER BY 
        CASE gm.role 
          WHEN 'owner' THEN 1 
          WHEN 'admin' THEN 2 
          WHEN 'member' THEN 3 
        END,
        gm.joinedTime ASC
    `, [groupId])
    
    res.json({ status: 'success', data: members })
  } catch (error) {
    console.error('获取小组成员失败:', error)
    res.status(500).json({ status: 'fail', message: '服务器错误' })
  }
})

// 加入小组
router.post('/joinGroup', checkAuth, async (req, res) => {
  const userId = req.userId
  const { groupId } = req.body
  
  if (!groupId) {
    return res.status(400).json({ status: 'fail', message: '缺少小组ID' })
  }
  
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    // 检查小组是否存在
    const [groups] = await connection.execute(
      'SELECT * FROM groups WHERE groupId = ? AND isActive = 1',
      [groupId]
    )
    
    if (groups.length === 0) {
      await connection.rollback()
      return res.status(404).json({ status: 'fail', message: '小组不存在' })
    }
    
    const group = groups[0]
    
    // 检查是否已经是成员
    const [existing] = await connection.execute(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ?',
      [groupId, userId]
    )
    
    if (existing.length > 0 && existing[0].isActive === 1) {
      await connection.rollback()
      return res.status(400).json({ status: 'fail', message: '已经是小组成员' })
    }
    
    // 检查小组是否已满
    const [memberCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE groupId = ? AND isActive = 1',
      [groupId]
    )
    
    if (memberCount[0].count >= group.maxMembers) {
      await connection.rollback()
      return res.status(400).json({ status: 'fail', message: '小组已满' })
    }
    
    // 加入小组
    if (existing.length > 0) {
      // 重新激活
      await connection.execute(
        'UPDATE group_members SET isActive = 1, joinedTime = NOW() WHERE groupId = ? AND userId = ?',
        [groupId, userId]
      )
    } else {
      // 新增成员
      await connection.execute(
        'INSERT INTO group_members (groupId, userId, role) VALUES (?, ?, ?)',
        [groupId, userId, 'member']
      )
    }
    
    // 记录活动日志
    await connection.execute(
      'INSERT INTO group_activities (groupId, userId, activityType, activityDetail) VALUES (?, ?, ?, ?)',
      [groupId, userId, 'join', JSON.stringify({ action: 'join', groupName: group.groupName })]
    )
    
    await connection.commit()
    
    res.json({ status: 'success', message: '加入小组成功' })
  } catch (error) {
    await connection.rollback()
    console.error('加入小组失败:', error)
    res.status(500).json({ status: 'fail', message: '加入失败' })
  } finally {
    connection.release()
  }
})

// 退出小组
router.post('/leaveGroup', checkAuth, async (req, res) => {
  const userId = req.userId
  const { groupId } = req.body
  
  if (!groupId) {
    return res.status(400).json({ status: 'fail', message: '缺少小组ID' })
  }
  
  const connection = await pool.getConnection()
  
  try {
    await connection.beginTransaction()
    
    // 检查用户角色
    const [membership] = await connection.execute(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ? AND isActive = 1',
      [groupId, userId]
    )
    
    if (membership.length === 0) {
      await connection.rollback()
      return res.status(400).json({ status: 'fail', message: '不是小组成员' })
    }
    
    if (membership[0].role === 'owner') {
      await connection.rollback()
      return res.status(400).json({ status: 'fail', message: '所有者不能退出小组，请先转让所有权或解散小组' })
    }
    
    // 退出小组（软删除）
    await connection.execute(
      'UPDATE group_members SET isActive = 0 WHERE groupId = ? AND userId = ?',
      [groupId, userId]
    )
    
    // 记录活动日志
    await connection.execute(
      'INSERT INTO group_activities (groupId, userId, activityType, activityDetail) VALUES (?, ?, ?, ?)',
      [groupId, userId, 'leave', JSON.stringify({ action: 'leave' })]
    )
    
    await connection.commit()
    
    res.json({ status: 'success', message: '已退出小组' })
  } catch (error) {
    await connection.rollback()
    console.error('退出小组失败:', error)
    res.status(500).json({ status: 'fail', message: '退出失败' })
  } finally {
    connection.release()
  }
})

// 获取小组的笔记列表（所有成员的笔记）
router.get('/getGroupNotes', checkAuth, async (req, res) => {
  const userId = req.userId
  const { groupId } = req.query
  
  if (!groupId) {
    return res.status(400).json({ status: 'fail', message: '缺少小组ID' })
  }
  
  try {
    // 检查用户是否是小组成员
    const [membership] = await pool.execute(
      'SELECT * FROM group_members WHERE groupId = ? AND userId = ? AND isActive = 1',
      [groupId, userId]
    )
    
    if (membership.length === 0) {
      return res.status(403).json({ status: 'fail', message: '无权限查看' })
    }
    
    // 获取小组所有成员的笔记
    const [notes] = await pool.execute(`
      SELECT f.*, u.username as publisherName
      FROM files f
      INNER JOIN group_members gm ON f.publisherId = gm.userId
      INNER JOIN users u ON f.publisherId = u.id
      WHERE gm.groupId = ? AND gm.isActive = 1
      ORDER BY f.createdTime DESC
    `, [groupId])
    
    res.json({ status: 'success', data: notes })
  } catch (error) {
    console.error('获取小组笔记失败:', error)
    res.status(500).json({ status: 'fail', message: '服务器错误' })
  }
})

export default router

