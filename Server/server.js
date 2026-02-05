import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import loginRouter from './routers/login.js'
import geetest from './routers/geetest.js'
import email from './routers/email.js'
import user from './routers/user.js'
import file from './routers/file.js'

const app = express();

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url) // 在 ES Module（type: module）环境下，手动拿到“当前文件的绝对路径”
const __dirname = path.dirname(__filename)

// 解析 JSON 请求体
app.use(express.json())

// 跨域设置--允许所有来源访问
app.use(cors())
// 或者只允许特定域名
// app.use(cors({ origin: 'http://localhost:5173' }))

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

// 默认路径
app.get('/', (req, res) => {
    res.send('home')
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})