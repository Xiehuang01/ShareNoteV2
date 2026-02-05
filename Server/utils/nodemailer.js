import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.163.com',
  port: 465,
  secure: true,
  auth: {
    user: 'xiehuang_top@163.com',
    pass: 'XBc7EcqjQvXDqRCJ'
  }
})

export default transporter
