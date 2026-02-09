import { pool } from './db.js'

// 检查并添加 fileCustomName 字段到 files 表
export const migrateDatabase = async () => {
  try {
    // 查询表的结构
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'files' 
      AND TABLE_SCHEMA = 'sharenotev2'
    `)

    // 检查是否存在 fileCustomName 字段
    const hasFileCustomName = columns.some(col => col.COLUMN_NAME === 'fileCustomName')
    
    if (!hasFileCustomName) {
      console.log('正在添加 fileCustomName 字段...')
      await pool.execute(`
        ALTER TABLE files 
        ADD COLUMN fileCustomName VARCHAR(255) COMMENT '文件自定义名称'
      `)
      console.log('✓ fileCustomName 字段添加成功')
    } else {
      console.log('✓ fileCustomName 字段已存在')
    }

  } catch (error) {
    console.error('数据库迁移失败:', error)
    throw error
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase().then(() => {
    console.log('迁移完成')
    process.exit(0)
  }).catch(() => {
    process.exit(1)
  })
}
