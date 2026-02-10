    import express from 'express'
    import { pool } from '../database/db.js'
    // import jwt from 'jsonwebtoken'
    import { checkAuth } from '../middlewares/auth.js'
    const router = express.Router()

    router.get('/getUserInfo', checkAuth, async(req, res) => {
        // const tokenGet  = req.headers.Authorization
        // const tokenGet = req.headers['authorization']
        // // 判断token是否存在--中间件checkAuth去判断
        // if (!tokenGet) {
        //     return res.status(401).json({ message: '未提供 token' ,status: 'fail'})
        // }
        try {
            // const SECRET_KEY = 'aqgy1213812138'
            // token存在--解析出用户的id方便后续获取数据
            // const resJwtVerify = jwt.verify(tokenGet, SECRET_KEY)
            // const userid = resJwtVerify.id
            // 中间件checkAuth已经解析好了userId
            console.log(req.userId)
            const userid = req.userId
            // 查询用户并返回
            const [rows] = await pool.execute('select id, username, email, avatarpath from users where id = ?', [userid])
            const resRows = rows[0]
            return res.json({message:'查询成功',data: resRows , status: 'success'})
        } catch (error) {
            return res.status(500).json({ message: '服务器错误', status: 'fail'})
        }
        
    })

    router.post('/updateUserInfo', checkAuth, async(req, res) => {
        try {
            const userid = req.userId
            const { username, email } = req.body
            // 查询用户用户名和邮箱是否已经存在
            const [rows] = await pool.execute('select id from users where (username = ? or email = ?) and id != ?', [username, email, userid])
            if (rows.length > 0) {
                return res.status(400).json({ message: '用户名或邮箱已存在', status: 'fail' })
            }
            // 更新用户信息
            await pool.execute('update users set username = ?, email = ? where id = ?', [username, email, userid])
            return res.json({ message: '用户信息更新成功', status: 'success' })
        } catch (error) {
            return res.status(500).json({ message: '服务器错误', status: 'fail' })
        }
    })

    // 导出路由
    export default router