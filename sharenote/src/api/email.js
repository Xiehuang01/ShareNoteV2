import request from '@/utils/request'

// 发送注册验证码
export const emailSendCodeServer = ({ username, email }) =>
  request.post('/sendemailcode', { username, email })

// 发送更正密码验证码
export const emailSendChangePasswordCodeServer = (email, usernameFound) =>
  request.post('/sendchangepasswordcode', { email, usernameFound })

// 验证验证码
export const eamilVerifyCodeServer = (email, code, option) =>
  request.post('/verifycode', { email, code, option })
