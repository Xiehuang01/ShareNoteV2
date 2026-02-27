import request from '@/utils/request'

// 获取用户所在的所有小组
export const groupGetUserGroupsServer = () => {
  return request.get('/getUserGroups')
}

// 创建新小组
export const groupCreateGroupServer = (data) => {
  return request.post('/createGroup', data)
}

// 搜索小组
export const groupSearchGroupsServer = (keyword) => {
  return request.get('/searchGroups', { params: { keyword } })
}

// 获取小组成员
export const groupGetMembersServer = (groupId) => {
  return request.get('/getGroupMembers', { params: { groupId } })
}

// 加入小组
export const groupJoinGroupServer = (data) => {
  return request.post('/joinGroup', data)
}

// 退出小组
export const groupLeaveGroupServer = (groupId) => {
  return request.post('/leaveGroup', { groupId })
}

// 获取小组的笔记列表（通过小组成员的笔记）
export const groupGetGroupNotesServer = (groupId) => {
  return request.get('/getGroupNotes', { params: { groupId } })
}

