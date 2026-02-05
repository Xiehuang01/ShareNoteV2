<script setup>
// import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

// 退出登录
const logout = () => {
  userStore.removeToken()
  userStore.removeUserInfo()
  userStore.removeUserNotesList()
  router.push('/login')
}
</script>

<template>
  <div>ProfilesPage</div>
  <ul>
    <li v-for="(value, key) in userStore.userInfo" :key="key">
      {{ key }}: {{ value === null ? 'default' : value }}
    </li>
  </ul>
  <el-button @click="logout">退出登录</el-button>
</template>

<style scoped></style>
