import express from 'express'
import { pool } from '../database/db.js'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'
import { checkAuth } from '../middlewares/auth.js'

// 创建路由
const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadPath = path.join(__dirname, '../upload/files')
// 如果文件路径不存在--直接创建该文件
if (!fs.existsSync(uploadPath)) {
fs.mkdirSync(uploadPath, { recursive: true });
// { recursive: true }--自动创建多级文件夹，父级不存在也没事
}

// 配置multer文件上传
const storage = multer.diskStorage({
    // 目的地
    destination: (req, file, cbFunc) => {
        cbFunc(null, uploadPath)
    },
    // 文件名
    filename: (req, file, cbFunc) => {
    // 文件名：时间戳 + 原文件名
    // 用时间戳 + 原文件名（解码后）来命名，保证中文正常
   // file.originalname 是浏览器上传的原始文件名，可能乱码
    // 先用 Buffer 转 UTF-8
    const nameBuffer = Buffer.from(file.originalname, 'latin1') // 浏览器发送的文件名可能被当成 latin1
    const safeName = nameBuffer.toString('utf8') // 转成 utf8
    cbFunc(null, `${Date.now()}_${safeName}`)
}
})

// 创建multer实例，并配置规则为storage
const upload = multer({ storage })

// 文件上传接口
router.post('/uploadnotes', checkAuth, upload.array('file', 500), async (req, res) => {
    console.log('========== 收到上传请求 ==========')
    const files = req.files
    const userid = req.userId
    const { fileCustomName } = req.body
    console.log('getUploadFilesFormFrontend:', files)
    // 判断是否上传文件
    if(!files || files.length === 0){
        return res.status(400).json({status:'fail', message:'未收到文件'})
    }
    
    try{
        // 找出 Markdown 文件
        const markdownFile = files.find(item => item.originalname.toLowerCase().endsWith('.md'))
        let markdownId = null
        
        console.log('=== 开始处理文件上传 ===')
        console.log('总文件数:', files.length)
        console.log('是否有 Markdown 文件:', !!markdownFile)
        
        // 如果有 Markdown 文件，先处理图片路径替换
        if (markdownFile) {
            // 创建图片原始名到新文件名的映射
            const imageMap = {}
            files.forEach(file => {
                const isImage = /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(file.originalname)
                if (isImage) {
                    imageMap[file.originalname] = file.filename
                }
            })
            
            // 读取 Markdown 文件内容
            const markdownPath = path.join(uploadPath, markdownFile.filename)
            let markdownContent = fs.readFileSync(markdownPath, 'utf8')
            
            // 替换图片路径
            Object.keys(imageMap).forEach(originalName => {
                const newName = imageMap[originalName]
                // 匹配 ![alt](图片名) 格式
                const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g')
                markdownContent = markdownContent.replace(regex, `![$1](${newName})`)
            })
            
            // 写回文件
            fs.writeFileSync(markdownPath, markdownContent, 'utf8')
            console.log('✓ Markdown 文件图片路径已更新')
            
            // 插入到 files 表并获取 ID
            const createdTimeWithoutFormat = Number(markdownFile.filename.split('_')[0])
            const createdTime = dayjs(createdTimeWithoutFormat).format('YYYY-MM-DD HH:mm:ss')
            const [result] = await pool.execute(
                'insert into files(publisherId, fileCustomName, fileOriginalName, fileName, fileType, filePath, createdTime) values(?, ?, ?, ?, ?, ?, ?);',
                [userid, fileCustomName, markdownFile.originalname, markdownFile.filename, markdownFile.mimetype, `/upload/files/${markdownFile.filename}`, createdTime]
            )
            markdownId = result.insertId
            console.log('✓ Markdown 文件已插入 files 表，ID:', markdownId, '文件名:', markdownFile.originalname)
        }
        
        // 处理其他文件
        for(const item of files){
            console.log('处理文件:', item.originalname)
            // 跳过已处理的 Markdown 文件
            if (markdownFile && item.filename === markdownFile.filename) {
                console.log('  → 跳过（已处理的 Markdown 文件）')
                continue
            }
            
            const createdTimeWithoutFormat = Number(item.filename.split('_')[0])
            const createdTime = dayjs(createdTimeWithoutFormat).format('YYYY-MM-DD HH:mm:ss')
            
            // 判断是否为图片文件
            const isImage = /\.(png|jpg|jpeg)$/i.test(item.originalname)
            console.log('  → 是否为图片:', isImage, '| 是否有 markdownId:', !!markdownId)
            
            if (isImage && markdownId) {
                // 图片文件且有关联的 Markdown，存入 markdownFiles 表
                await pool.execute(
                    'insert into markdownFiles(markdownId, uploadUserId, imgName, imgPath) values(?, ?, ?, ?);',
                    [markdownId, userid, item.originalname, `/upload/files/${item.filename}`]
                )
                console.log('  ✓ 图片已插入 markdownFiles 表')
            } else {
                // 其他文件（如 PDF 或单独上传的图片）存入 files 表
                await pool.execute(
                    'insert into files(publisherId, fileCustomName, fileOriginalName, fileName, fileType, filePath, createdTime) values(?, ?, ?, ?, ?, ?, ?);',
                    [userid, fileCustomName, item.originalname, item.filename, item.mimetype, `/upload/files/${item.filename}`, createdTime]
                )
                console.log('  ✓ 文件已插入 files 表')
            }
        }
        console.log('=== 文件上传处理完成 ===')

        // 返回数据给前端
        const returnFilesArray = files.map(item => ({
            fileCustomName: fileCustomName,
            filename: item.filename,
            originalname: item.originalname,
            filesize: item.size,
            path: `/upload/files/${item.filename}`
        }))
        res.json({
            status: 'success',
            message: '文件上传成功',
            data: returnFilesArray
        })

    }catch(err){
        console.error('upload error:', err)
        res.status(500).json({status: 'fail', message: '服务器错误'})
    }
})

// 根据用户的id获取用户的全部笔记
router.get('/getNotesList', checkAuth, async (req, res) =>  {
    const userid = req.userId
    try{
        const [rows] = await pool.execute(
            'select * from files where publisherId = ?;',
            [userid]
        )
        if(rows.length > 0){
            res.json({status:'success', data:rows})
        }else{
            res.json({status:'success', data:rows})
        }
    }catch(err){
        console.error(err);
        res.status(500).json({status:'fail', message: '服务器未响应'})
    }
})

// 文件下载接口
router.get('/download', checkAuth, async (req, res) => {
  const { path: relativePath } = req.query
  
  if (!relativePath) {
    return res.status(400).json({ status: 'fail', message: '缺少文件路径参数' })
  }

  // 从相对路径中提取文件名
  const filename = path.basename(relativePath)
  const filePath = path.join(uploadPath, filename)

  // 从数据库中拉取fileCustomName
  const [rows] = await pool.execute(
    'select fileCustomName, fileType from files where fileName = ?',
    [filename]
  )

  // 这里必须先判断 rows 是否有数据
  if (!rows?.length) {
    return res.status(404).json({ status: 'fail', message: '数据库无该文件记录' })
  }

  const fileType = rows[0]?.fileType.split('/')[1] || ''
  const extName = fileType === 'octet-stream' ? 'md' : fileType

  const downloadFileNameBase = rows[0]?.fileCustomName || filename

const downloadFileName = downloadFileNameBase.includes('.')
  ? downloadFileNameBase
  : `${downloadFileNameBase}.${extName}`
  
  
  // 文件不存在
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ status: 'fail', message: '文件不存在' })
  }

  // 强制下载
  res.download(filePath, downloadFileName, (err) => {
    if (err) {
      console.error(err)
      res.status(500).json({ status: 'fail', message: '下载失败' })
    }
  })
})

router.delete('/deleteFile/:fileId', checkAuth, async (req, res) => {
    const { fileId } = req.params
    const userid = req.userId

    if (!fileId) {
        return res.status(400).json({ status: 'fail', message: '缺少文件ID参数' })
    }

    try {
        // 先查询文件信息，确保文件属于当前用户
        const [fileRows] = await pool.execute(
            'SELECT * FROM files WHERE fileId = ? AND publisherId = ?',
            [fileId, userid]
        )

        if (fileRows.length === 0) {
            return res.status(404).json({ status: 'fail', message: '文件不存在或无权限删除' })
        }

        const fileInfo = fileRows[0]
        const filePath = path.join(uploadPath, fileInfo.fileName)
        
        // 判断是否为 Markdown 文件
        const isMarkdown = fileInfo.fileOriginalName.toLowerCase().endsWith('.md')
        
        if (isMarkdown) {
            console.log('删除 Markdown 文件及其关联图片，fileId:', fileId)
            
            // 查询关联的图片
            const [imageRows] = await pool.execute(
                'SELECT * FROM markdownFiles WHERE markdownId = ?',
                [fileId]
            )
            
            console.log('找到关联图片数量:', imageRows.length)
            
            // 删除关联图片的物理文件
            for (const img of imageRows) {
                const imgFileName = path.basename(img.imgPath)
                const imgFilePath = path.join(uploadPath, imgFileName)
                if (fs.existsSync(imgFilePath)) {
                    fs.unlinkSync(imgFilePath)
                    console.log('已删除图片文件:', imgFileName)
                }
            }
            
            // 从数据库删除关联图片记录
            await pool.execute(
                'DELETE FROM markdownFiles WHERE markdownId = ?',
                [fileId]
            )
            console.log('已删除 markdownFiles 表中的关联记录')
        }

        // 从数据库删除文件记录
        const [deleteResult] = await pool.execute(
            'DELETE FROM files WHERE fileId = ? AND publisherId = ?',
            [fileId, userid]
        )

        if (deleteResult.affectedRows === 0) {
            return res.status(500).json({ status: 'fail', message: '删除失败' })
        }

        // 删除主文件的物理文件
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            console.log('已删除主文件:', fileInfo.fileName)
        }

        res.json({
            status: 'success',
            message: '文件删除成功'
        })

    } catch (err) {
        console.error('删除文件错误:', err)
        res.status(500).json({ status: 'fail', message: '服务器错误' })
    }
})

// 更新文件内容接口
router.post('/updateFile', checkAuth, async (req, res) => {
  const { fileName, content } = req.body
  const userId = req.userId

  if (!fileName || content === undefined) {
    return res.status(400).json({ status: 'fail', message: '缺少文件名或内容参数' })
  }

  try {
    // 先验证文件属于当前用户
    const [fileRows] = await pool.execute(
      'SELECT * FROM files WHERE fileName = ? AND publisherId = ?',
      [fileName, userId]
    )

    if (fileRows.length === 0) {
      return res.status(404).json({ status: 'fail', message: '文件不存在或无权限修改' })
    }

    const filePath = path.join(uploadPath, fileName)

    // 写入新内容到文件
    fs.writeFileSync(filePath, content, 'utf8')

    res.json({
      status: 'success',
      message: '文件更新成功'
    })
  } catch (err) {
    console.error('更新文件错误:', err)
    res.status(500).json({ status: 'fail', message: '服务器错误' })
  }
})

// 导出路由
export default router