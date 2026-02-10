import request from '@/utils/request'

// 登录接口
export const userLoginServer = ({ username, password }) =>
  request.post('/loginin', { username, password })

// 注册接口
export const userRegisterServer = ({ username, password, email }) =>
  request.post('/loginup', { username, password, email })

// 通过邮箱找用户名
export const userFindUsernameByEmailServer = ({ email }) =>
  request.post('/findusername', { email })

// 修改密码
export const userChangePasswordServer = ({ email, password }) =>
  request.post('/changepassword', { email, password })

// 获取用户信息
export const userGetUserInfoServer = () => request.get('/getUserInfo')

// 更新用户信息
export const userUpdateUserInfoServer = ({ username, email }) =>
  request.post('/updateUserInfo', { username, email })
