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
    if (userStore.token) {
      // 存在token
      config.headers.Authorization = userStore.token
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
