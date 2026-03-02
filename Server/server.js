import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import dotenv from 'dotenv'
import loginRouter from './routers/login.js'
import geetest from './routers/geetest.js'
import email from './routers/email.js'
import user from './routers/user.js'
import file from './routers/file.js'
import group from './routers/group.js'

// 加载环境变量
dotenv.config()

const app = express();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url) // 在 ES Module（type: module）环境下，手动拿到"当前文件的绝对路径"
const __dirname = path.dirname(__filename)

// 安全响应头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://127.0.0.1:3000"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS 配置 - 使用环境变量配置允许的来源
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173']

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn('CORS 阻止来自以下来源的请求:', origin)
      callback(new Error('不允许的 CORS 来源'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 静态文件服务 - 提供上传文件的访问
const uploadPath = path.join(__dirname, 'upload')
console.log('Static files path:', uploadPath)
app.use('/upload', express.static(uploadPath))

// 路由模块
app.use(loginRouter);
app.use(geetest);
app.use(email);
app.use(user);
app.use(file);
app.use(group);

// 默认路径
app.get('/', (req, res) => {
    res.json({ 
      message: 'ShareNote API Server',
      version: '2.0',
      status: 'running'
    })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    status: 'fail', 
    message: '请求的资源不存在' 
  })
})

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ 
    status: 'fail', 
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误' 
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('=================================')
    console.log(`✓ ShareNote Server 启动成功`)
    console.log(`✓ 运行端口: ${PORT}`)
    console.log(`✓ 环境: ${process.env.NODE_ENV || 'development'}`)
    console.log(`✓ 允许的来源: ${allowedOrigins.join(', ')}`)
    console.log('=================================')
})
