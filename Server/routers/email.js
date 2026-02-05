import express from 'express'
import redisClient from '../utils/redis.js'
import transporter from '../utils/nodemailer.js'
import { pool } from '../database/db.js'

const router = express.Router()

router.post('/sendemailcode', async (req, res) => {
    const { username, email } = req.body
    if(!email)
        return res.status(400).json( { message: '邮箱不能为空'} )
    // 验证用户名和邮箱
    // 1. 判断用户是否存在
    const [isExistUsername] = await pool.execute(
        'select 1 from users where username = ?',
        [username]
    )
    // 2. 判断邮箱是否存在
    const [isExistEmail] = await pool.execute(
        'select 1 from users where email = ?',
        [email]
    )
    if (isExistUsername.length > 0){
        // 用户已存在
        return res.status(401).json({ message: '用户名已存在' })
    }else if(isExistEmail.length > 0){
        // 邮箱已存在
        return res.status(401).json({ message: '邮箱已存在' })
    }else{
      // 生成验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      // 将email和code存入到redis中
      // EX:300--有效时间为5分钟
      await redisClient.set(`email:${email}`, code, { EX: 300 })
      // 发送验证码
      try {
        await transporter.sendMail({
        from: '"ShareNotes" <xiehuang_top@163.com>',
        to: email,
        subject: '欢迎新用户 Welcome new user',
        text: `该验证码用于注册信息`,
        html: `
              <div style="
              font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
              max-width:600px;
              height: 800px;
              margin:0 auto;
              padding:40px 30px;
              background-color: #121212;
              position: relative;"
              >
              <div style="font-size: 80px; font-weight: bold; color: #32f18d; text-align: start; margin-bottom: 20px;">「ShareNotes」</div>
              <hr>
              <h1 style="margin:0 0 25px 0;color:#d1d1d1;font-weight:600;text-align:center; margin-top: 30px;">验证码通知</h1>
              <h2 style="color: #bfbfbf; margin-bottom: 10px;">${email} 您好:</h2>
              <p style="margin:0 0 30px 0;color:#bfbfbf;font-size:16px;line-height:1.6;text-align:center;">您好！为保障您的账户安全，本次操作需要验证身份，您的验证码如下：</p>
              <div style="background:#1a1a1a; border-radius:16px;padding:20px 20px;box-shadow:0 6px 16px rgba(50,241,141,0.2);border:1px solid #32f18d;">
                  <p style="font-size: 40px; font-weight: bold; text-align: center; color: #32f18d; margin: 0; padding: 0;">${code}</p>
              </div>
              <p style="margin-top:30px; font-size: 16px; color:#bfbfbf;font-size:14px;line-height:1.5;text-align:center;opacity:0.9;">
                      验证码有效期5分钟，请勿泄露给他人<br>
                      若不是您本人操作，请忽略此邮件
              </p>
              <p style="position: absolute; left: 50%; bottom: 15px; transform: translateX(-50%); color: #bfbfbf">访问官网: <a href="https://www.xiehuang.top" style="color: #32f18d; font-size: large;">xiehuang.top</a></p>
              </div>
              `
        })
        const codeGet = await redisClient.get(`email:${email}`)
        console.log('读取的 code:', codeGet)
        res.json({ message: '验证码发送成功!', status: 'success'})
      } catch (err) {
        console.error(err)
        res.status(500).json({ message: '发送失败，请稍后重试' })
      }
    }
})

// 验证验证验证码
router.post('/verifycode', async (req, res) => {
  const { email, code, option } = req.body
  try{
    // option--1：验证注册验证码；2：验证更正密码验证码
    let key = (option === 1) ? 'email': 'emailChangePassword'
    const redisCode = await redisClient.get(`${key}:${email}`)
    
    // 判断验证码是否存在
    if(!redisCode)
      return res.status(400).json( { message: '验证码已失效' } )

    // 判断验证码是否一致
    if(redisCode === code){
      // 删除redis中的验证码
      await redisClient.del(`${key}:${email}`)
      return res.json( { message: '验证码通过！', status: 'success' } )
    }
    else
      return res.status(400).json({ message: '验证码错误' })

  }catch(err){
    return res.status(500).json( { message: '服务器错误' } )
  }
})

// 发送更改密码的验证码
router.post('/sendchangepasswordcode', async (req, res) => {
  const {email, usernameFound} = req.body
  // 生成验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  // 将验证码存入redis中
  await redisClient.set(`emailChangePassword:${email}`, code, { EX:300 })
  // 发送验证码
  try{
    await transporter.sendMail({
      from: '"ShareNote" <xiehuang_top@163.com>',
      to: email,
      subject: '更改密码 Change password',
      text: '该验证码用于更改密码',
      html: `
            <div style="
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
            max-width:600px;
            height: 800px;
            margin:0 auto;
            padding:40px 30px;
            background-color: #121212;
            position: relative;"
            >
            <div style="font-size: 80px; font-weight: bold; color: #32f18d; text-align: start; margin-bottom: 20px;">「ShareNotes」</div>
            <hr>
            <h1 style="margin:0 0 25px 0;color:#d1d1d1;font-weight:600;text-align:center; margin-top: 30px;">验证码通知</h1>
            <h2 style="color: #bfbfbf; margin-bottom: 10px;">${usernameFound} 您好:</h2>
            <p style="margin:0 0 30px 0;color:#bfbfbf;font-size:16px;line-height:1.6;text-align:center;">您好！你正在在进行<span style="color: #ffb200; font-weight: bold; border-bottom: 1px solid #ffb200;">更改密码</span>的操作！<br>为保障您的账户安全，本次操作需要验证身份，您的验证码如下：</p>
            <div style="background:#1a1a1a; border-radius:16px;padding:20px 20px;box-shadow:0 6px 16px rgba(50,241,141,0.2);border:1px solid #32f18d;">
                <p style="font-size: 40px; font-weight: bold; text-align: center; color: #32f18d; margin: 0; padding: 0; letter-spacing: 10px;">${code}</p>
            </div>
            <p style="margin-top:30px; font-size: 16px; color:#bfbfbf;font-size:14px;line-height:1.5;text-align:center;opacity:0.9;">
                    验证码有效期5分钟，请勿泄露给他人<br>
                    若不是您本人操作，请忽略此邮件
            </p>
            <p style="position: absolute; left: 50%; bottom: 15px; transform: translateX(-50%); color: #bfbfbf">访问官网: <a href="https://www.xiehuang.top" style="color: #32f18d; font-size: large;">xiehuang.top</a></p>
            </div>
            `
    })
    const codeSend = await redisClient.get(`emailChangePassword:${email}`)
    console.log(`emailChangePassword:${email}: ${codeSend}`)
    return res.json({ message: '验证码已发送', status: 'success' })
  }catch(err){
    return res.status(500).json({ message:'发送验证码失败，服务器未响应' })
  }
})

export default router