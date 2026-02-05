import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 导入pinia持久化存储插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 自动把 px 转 rem

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia()

// 使用pinia持久化存储插件
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
