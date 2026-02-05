import jwt from 'jsonwebtoken'
const SECRET_KEY = 'aqgy1213812138'
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
    }catch{
        return res.status(401).json({
            status: 'fail',
            message: 'token无效或已过期，请重新登录'
        })
    }

    
}