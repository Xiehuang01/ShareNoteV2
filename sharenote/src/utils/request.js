import axios from 'axios'
import { useUserStore } from '@/stores/user'
const baseURL = 'http://localhost:3000'

// 实例化axios
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 设置请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    console.log('请求拦截器 - Token:', userStore.token)
    if (userStore.token) {
      // 存在token
      config.headers.Authorization = userStore.token
      console.log('请求拦截器 - 已添加 Authorization 头')
    } else {
      console.warn('请求拦截器 - Token 不存在，可能需要重新登录')
    }
    return config
  },
  (err) => {
    console.error(`请求错误${err}`)
    return Promise.reject(err)
  }
)

// 设置响应拦截器
instance.interceptors.response.use(
  (res) => {
    return res.data
  },
  (err) => {
    console.error(`响应错误${err}`)
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
