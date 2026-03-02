import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 连接池配置 - 使用环境变量
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sharenotev2',
    waitForConnections: true,  // 等待空闲连接
    connectionLimit: 10,       // 最大连接数
    queueLimit: 0              // 队列大小，0 表示无限
})

// 测试数据库连接
pool.getConnection()
    .then(connection => {
        console.log('✓ 数据库连接成功')
        connection.release()
    })
    .catch(err => {
        console.error('✗ 数据库连接失败:', err.message)
    })