import { createClient } from 'redis'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`
})

redisClient.on('error', err => console.error('✗ Redis 连接错误:', err.message))
redisClient.on('connect', () => console.log('✓ Redis 连接成功'))

await redisClient.connect()

export default redisClient
