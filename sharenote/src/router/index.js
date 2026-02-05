import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录页
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') },
    {
      path: '/',
      component: () => import('@/views/layout/LayoutPage.vue'),
      redirect: '/main/notespage',
      // 二级路由
      children: [
        // 首页
        {
          path: '/main/notespage',
          component: () => import('@/views/main/NotesPage.vue')
        },
        {
          path: '/main/settings',
          component: () => import('@/views/main/SettingsPage.vue')
        },
        {
          path: '/main/profile',
          component: () => import('@/views/main/ProfilesPage.vue')
        }
      ]
    },
    {
      path: '/forgetpassword',
      component: () => import('@/views/login/ForgetPassword.vue')
    }
  ]
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token && to.path !== '/login' && to.path !== '/forgetpassword')
    return '/login'
})
export default router
