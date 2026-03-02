import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-please-change'

export const checkAuth = (req, res, next) => {
    const token = req.headers['authorization']
    if(!token){
        return res.status(401).json({status: 'fail', message: '未查找到用户的token权限不够，请登录后再次尝试'})
    }
    try{
        const resJwtVerify = jwt.verify(token, SECRET_KEY)
        const userid = resJwtVerify.id
        // 把解析出来的userid存储到req中
        req.userId = userid
        next()
    }catch(error){
        return res.status(401).json({
            status: 'fail',
            message: 'token无效或已过期，请重新登录'
        })
    }
}