import request from '@/utils/request'

export const filesGetNotesListServer = () => request.get('/getNotesList')

export const filesDeleteNoteServer = (fileId) =>
  request.delete(`/deleteFile/${fileId}`)

// 保存/更新 Markdown 文件
export const filesUpdateFileServer = (data) => request.post('/updateFile', data)
