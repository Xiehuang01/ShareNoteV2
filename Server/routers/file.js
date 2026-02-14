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
    const files = req.files
    const userid = req.userId
    const { fileCustomName } = req.body
    console.log('getUploadFilesFormFrontend:', files)
    // 判断是否上传文件
    if(!files || files.length === 0){
        return res.status(400).json({status:'fail', message:'未收到文件'})
    }
    
    try{
        // 将文件路径上传到服务器
        for(const item of files){
            const createdTimeWithoutFormat = Number(item.filename.split('_')[0])
            const createdTime = dayjs(createdTimeWithoutFormat).format('YYYY-MM-DD HH:mm:ss')
            const [rows] = await pool.execute(
                'insert into files(publisherId, fileCustomName, fileOriginalName, fileName, fileType, filePath, createdTime) values(?, ?, ?, ?, ?, ?, ?);',
                [userid, fileCustomName, item.originalname, item.filename, item.mimetype, `/upload/files/${item.filename}`, createdTime]
            )
            // 服务器自动抛出错误
        }

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

        // 从数据库删除记录
        const [deleteResult] = await pool.execute(
            'DELETE FROM files WHERE fileId = ? AND publisherId = ?',
            [fileId, userid]
        )

        if (deleteResult.affectedRows === 0) {
            return res.status(500).json({ status: 'fail', message: '删除失败' })
        }

        // 删除物理文件
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
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