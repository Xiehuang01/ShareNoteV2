import express from 'express'
import { pool } from '../database/db.js'
import jwt from 'jsonwebtoken' // 生成token
import bcrypt from 'bcryptjs' // 自动加密密码
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const router = express.Router()
const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-please-change'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// 登录频率限制
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 最多5次尝试
    message: { status: 'fail', message: '登录尝试次数过多，请15分钟后再试' },
    standardHeaders: true,
    legacyHeaders: false,
})

// 路由测试接口
router.get('/logintry', (req, res) => {
    res.send('logintry');
})

// mysql测试接口
router.get('/mysqltry' , async (req, res) => {
    try {
        const [rows]  = await pool.execute('select 1 + 1 AS solution')
        res.json([rows])    
    } catch (err) {
        // error: err.message
        res.status(500).json({ message: '服务器连接失败' });
    }
    
})

// 登录接口 - 添加频率限制
router.post('/loginin', loginLimiter, async (req, res) => {
    const {username, password} = req.body
    console.log(`/loginin: ${username}`)
    
    // 输入验证
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' })
    }
    
    if (username.length > 50 || password.length > 100) {
        return res.status(400).json({ message: '用户名或密码长度超出限制' })
    }
    
    try{
        const [rows] = await pool.execute(
            'select id, username, password from users where username = ?' ,
            [username]
        )
        // 判断用户是否存在
        if (rows.length === 0) {
            // 401--请求未成功
            return res.status(401).json({ message: '用户名不存在' })
        }
        // 用户存在--判断用户输入的密码是否一致
        // bcrypt.compareSync(明文密码, 哈希密码)
        const isMatch = bcrypt.compareSync(password, rows[0].password)
        if (!isMatch){
            // 401--请求未成功
            return res.status(401).json({message: '密码不一致'})
        }
        // 密码一致
        // 生成token - 添加过期时间
        const id = rows[0].id
        const newToken = jwt.sign(
            {id},
            SECRET_KEY,
            { expiresIn: JWT_EXPIRES_IN }
        )
        // 发送给前端
         res.json({ message: '登录成功', status: 'success', token: newToken})
    }catch(err){
       // 500--服务器内部错误
       console.error('登录错误:', err)
       res.status(500).json({ message: '服务器错误' }) 
    }
})

// 注册接口 - 添加输入验证
router.post('/loginup', async (req, res)=> {
    // 获取用户输入的参数
    const {username, password, email} = req.body
    console.log(`/loginup: ${username}, ${email}`)
    
    // 输入验证
    if (!username || !password || !email) {
        return res.status(400).json({ message: '用户名、密码和邮箱不能为空' })
    }
    
    if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ message: '用户名长度必须在3-50个字符之间' })
    }
    
    if (password.length < 6 || password.length > 100) {
        return res.status(400).json({ message: '密码长度必须在6-100个字符之间' })
    }
    
    if (email.length > 100) {
        return res.status(400).json({ message: '邮箱长度不能超过100个字符' })
    }
    
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' })
    }
    
    // 添加用户
    try {
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
            res.status(401).json({ message: '用户名已存在' })
        }else if(isExistEmail.length > 0){
            // 邮箱已存在
            res.status(401).json({ message: '邮箱已存在' })
        }else{
            // 2. 插入数据
            // 加密密码--10是加盐强度，越大越安全，但是也越慢--参数：需要加密密码，加盐强度
            const hashPassword = bcrypt.hashSync(password, 10)
            const [rows] = await pool.execute(
                'insert into users(username, password, email) values (?, ?, ?)',
                [username, hashPassword, email]
            )
            console.log(rows.affectedRows) // 成功输出1
            if (rows.affectedRows === 1)
                res.json({message: '注册成功!', status: 'success'})
            else
                res.status(401).json({ message: '服务器未响应' })
        } 
    } catch (error) {
        console.error('注册错误:', error)
        res.status(500).json({ message: '服务器错误' })
    }

})

// 通过邮箱找用户名
router.post('/findusername', async (req, res) => {
    const { email } = req.body
    // 判断邮箱是否存在
    const [isExistEmail] = await pool.execute(
        'select 1 from users where email = ?',
        [email]
    )
    if(isExistEmail.length === 0){
        // 邮箱不存在
        res.status(401).json({ message: '邮箱不存在' })
    }else{
        const [findUsername] = await pool.execute(
            'select username from users where email = ?',
            [email]
        )
        console.log(findUsername);
        res.json({message:'用户名已找到',data:findUsername})
    }
    
})

// 修改密码
router.post('/changepassword', async(req, res) => {
    const { email, password } = req.body
    // 判断邮箱是否存在
    const [isExistEmail] = await pool.execute(
        'select 1 from users where email = ?',
        [email]
    )
    if(isExistEmail.length === 0){
        // 邮箱不存在
        res.status(401).json({ message: '邮箱不存在' })
    }else{
        try {
            // 加密密码
            const hashPassword = bcrypt.hashSync(password, 10)
            // 修改密码
            const [changePasswordResult] = await pool.execute(
                'update users set password = ? where email = ?',
                [hashPassword, email]
            )
            if(changePasswordResult.affectedRows === 1)
                res.json({message: '修改密码成功!', status: 'success'})
            else
                res.status(401).json({ message: '服务器未响应' })
        }
         catch (error) {
            res.status(500).json({message: '服务器错误'})
        }  
    }
})

// 导出路由
export default router
