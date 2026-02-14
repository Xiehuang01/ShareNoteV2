    import express from 'express'
    import { pool } from '../database/db.js'
    import multer from 'multer'
    import path from 'path'
    import fs from 'fs'
    import sharp from 'sharp'
    import { fileURLToPath } from 'url'
    // import jwt from 'jsonwebtoken'
    import { checkAuth } from '../middlewares/auth.js'
    const router = express.Router()

    // 获取当前文件路径
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const avatarUploadPath = path.join(__dirname, '../upload/avatar')
    const avatarTempPath = path.join(__dirname, '../upload/avatar/temp')

    // 如果头像文件夹不存在，创建它
    if (!fs.existsSync(avatarUploadPath)) {
        fs.mkdirSync(avatarUploadPath, { recursive: true })
    }
    if (!fs.existsSync(avatarTempPath)) {
        fs.mkdirSync(avatarTempPath, { recursive: true })
    }

    // 配置 multer 头像上传（先上传到临时文件夹）
    const avatarStorage = multer.diskStorage({
        destination: (req, file, cbFunc) => {
            cbFunc(null, avatarTempPath)
        },
        filename: (req, file, cbFunc) => {
            // 获取文件扩展名
            const ext = path.extname(file.originalname)
            // 使用用户ID + 时间戳命名，确保唯一性
            const filename = `avatar_temp_${req.userId}_${Date.now()}${ext}`
            cbFunc(null, filename)
        }
    })

    // 创建 multer 实例，限制文件类型和大小
    const avatarUpload = multer({
        storage: avatarStorage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 限制 10MB
        },
        fileFilter: (req, file, cbFunc) => {
            // 只允许图片格式
            const allowedTypes = /jpeg|jpg|png|gif|webp/
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
            const mimetype = allowedTypes.test(file.mimetype)
            
            if (extname && mimetype) {
                cbFunc(null, true)
            } else {
                cbFunc(new Error('只支持图片格式 (jpeg, jpg, png, gif, webp)'))
            }
        }
    })

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

    // 上传头像接口
    router.post('/uploadAvatar', checkAuth, avatarUpload.single('avatar'), async(req, res) => {
        let tempFilePath = null
        try {
            const userid = req.userId
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: '未收到头像文件', status: 'fail' })
            }

            // 临时文件路径
            tempFilePath = file.path

            // 最终文件名（PNG格式）
            const finalFileName = `avatar_${userid}_${Date.now()}.png`
            const finalFilePath = path.join(avatarUploadPath, finalFileName)

            // 使用 sharp 处理图片：裁剪为正方形并转为圆形
            const metadata = await sharp(tempFilePath).metadata()
            const size = Math.min(metadata.width, metadata.height)

            // 创建圆形遮罩 SVG
            const circleSvg = Buffer.from(
                `<svg width="${size}" height="${size}">
                    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
                </svg>`
            )

            // 处理图片：裁剪为正方形 -> 应用圆形遮罩 -> 转为 PNG
            await sharp(tempFilePath)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center'
                })
                .composite([{
                    input: circleSvg,
                    blend: 'dest-in'
                }])
                .png()
                .toFile(finalFilePath)

            // 删除临时文件
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath)
            }

            // 查询用户旧头像路径
            const [userRows] = await pool.execute('select avatarpath from users where id = ?', [userid])
            const oldAvatarPath = userRows[0]?.avatarpath

            // 如果存在旧头像且不是默认头像，删除旧头像文件
            if (oldAvatarPath && !oldAvatarPath.includes('d1a5429ead3d892513c3180e2aebb940.png')) {
                const oldAvatarFullPath = path.join(__dirname, '..', oldAvatarPath)
                if (fs.existsSync(oldAvatarFullPath)) {
                    fs.unlinkSync(oldAvatarFullPath)
                }
            }

            // 新头像的相对路径
            const avatarPath = `/upload/avatar/${finalFileName}`

            // 更新数据库中的头像路径
            await pool.execute('update users set avatarpath = ? where id = ?', [avatarPath, userid])

            return res.json({
                message: '头像上传成功',
                status: 'success',
                data: {
                    avatarPath: avatarPath
                }
            })
        } catch (error) {
            console.error('上传头像错误:', error)
            
            // 清理临时文件
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                try {
                    fs.unlinkSync(tempFilePath)
                } catch (e) {
                    console.error('删除临时文件失败:', e)
                }
            }
            
            return res.status(500).json({ message: '服务器错误', status: 'fail' })
        }
    })

    // 导出路由
    export default router