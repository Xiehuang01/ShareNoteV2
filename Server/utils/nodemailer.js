import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.163.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'xiehuang_top@163.com',
    pass: process.env.EMAIL_PASSWORD || 'XBc7EcqjQvXDqRCJ'
  }
})

// 测试邮件连接
transporter.verify((error, success) => {
  if (error) {
    console.error('✗ 邮件服务连接失败:', error.message)
  } else {
    console.log('✓ 邮件服务连接成功')
  }
})

export default transporter
