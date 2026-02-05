import request from '@/utils/request'

export const filesGetNotesListServer = () => request.get('/getNotesList')

export const filesDeleteNoteServer = (fileId) =>
  request.delete(`/deleteFile/${fileId}`)
