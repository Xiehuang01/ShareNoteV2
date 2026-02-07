<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  User,
  Message,
  Calendar,
  Document,
  SwitchButton,
  EditPen,
  Avatar
} from '@element-plus/icons-vue'
import { baseURL } from '@/utils/request'

const userStore = useUserStore()
const router = useRouter()

// 编辑模式
const isEditing = ref(false)
const editForm = ref({
  username: userStore.userInfo.username || '',
  email: userStore.userInfo.userEmail || ''
})

// 计算属性：格式化用户信息
const userStats = computed(() => [
  {
    label: '用户ID',
    value: userStore.userInfo.userid || '-',
    icon: User
  },
  {
    label: '用户名',
    value: userStore.userInfo.username || '-',
    icon: Avatar
  },
  {
    label: '邮箱',
    value: userStore.userInfo.userEmail || '-',
    icon: Message
  },
  {
    label: '笔记数量',
    value: userStore.userNotesList?.length || 0,
    icon: Document
  }
])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 进入编辑模式
const startEditing = () => {
  editForm.value = {
    username: userStore.userInfo.username || '',
    email: userStore.userInfo.userEmail || ''
  }
  isEditing.value = true
}

// 保存编辑
const saveEdit = () => {
  // 这里可以添加保存到服务器的逻辑
  userStore.userInfo.username = editForm.value.username
  userStore.userInfo.userEmail = editForm.value.email
  isEditing.value = false
  ElMessage.success('个人信息更新成功')
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
}

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      userStore.removeToken()
      userStore.removeUserInfo()
      userStore.removeUserNotesList()
      router.push('/login')
      ElMessage.success('已退出登录')
    })
    .catch(() => {})
}

// 获取头像URL
const getAvatarUrl = () => {
  if (userStore.userInfo.useravatarPath) {
    return `${baseURL}${userStore.userInfo.useravatarPath}`
  }
  return '/src/assets/d1a5429ead3d892513c3180e2aebb940.png'
}

// 修改密码
const changePassword = () => {
  router.push('/forgetpassword')
}
</script>

<template>
  <div class="profile-wrapper">
    <!-- 左侧：用户头像卡片 -->
    <div class="profile-left">
      <div class="avatar-card">
        <div class="avatar-wrapper">
          <img :src="getAvatarUrl()" alt="用户头像" class="avatar-img" />
          <div class="avatar-overlay" @click="startEditing">
            <el-icon><EditPen /></el-icon>
            <span>修改资料</span>
          </div>
        </div>
        <h2 class="username">{{ userStore.userInfo.username || '用户' }}</h2>
        <p class="user-email">
          {{ userStore.userInfo.userEmail || '暂无邮箱' }}
        </p>
        <div class="user-role">
          <el-tag type="success" effect="dark" size="small">普通用户</el-tag>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <h3>快捷操作</h3>
        <div class="action-list">
          <div class="action-item" @click="startEditing">
            <el-icon><EditPen /></el-icon>
            <span>编辑资料</span>
          </div>
          <div class="action-item logout" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：详细信息 -->
    <div class="profile-right">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h3>
            <el-icon><User /></el-icon>
            基本信息
          </h3>
          <el-button
            v-if="!isEditing"
            class="btn-edit-profile"
            size="small"
            :icon="EditPen"
            @click="startEditing"
          >
            编辑
          </el-button>
          <div v-else class="edit-actions">
            <el-button class="btn-save" size="small" @click="saveEdit"
              >保存</el-button
            >
            <el-button class="btn-cancel" size="small" @click="cancelEdit"
              >取消</el-button
            >
          </div>
        </div>

        <div v-if="!isEditing" class="info-list">
          <div
            v-for="(item, index) in userStats"
            :key="index"
            class="info-item"
          >
            <div class="info-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="info-content">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- 编辑表单 -->
        <div v-else class="edit-form">
          <el-form :model="editForm" label-position="top">
            <el-form-item label="用户名">
              <el-input
                v-model="editForm.username"
                placeholder="请输入用户名"
              />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="editForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 统计信息卡片 -->
      <div class="stats-card">
        <h3>
          <el-icon><Calendar /></el-icon>
          账户统计
        </h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">
              {{ userStore.userNotesList?.length || 0 }}
            </div>
            <div class="stat-label">笔记数量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatDate(new Date()) }}</div>
            <div class="stat-label">最后活跃</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">100%</div>
            <div class="stat-label">账户状态</div>
          </div>
        </div>
      </div>

      <!-- 安全设置卡片 -->
      <div class="security-card">
        <h3>
          <el-icon><SwitchButton /></el-icon>
          安全设置
        </h3>
        <div class="security-list">
          <div class="security-item">
            <div class="security-info">
              <span class="security-title">账户密码</span>
              <span class="security-desc">定期更换密码可以保护账户安全</span>
            </div>
            <el-button
              class="btn-change-password"
              size="small"
              @click="changePassword"
              >修改密码</el-button
            >
          </div>
          <div class="security-item">
            <div class="security-info">
              <span class="security-title">退出登录</span>
              <span class="security-desc">退出当前账户，需要重新登录</span>
            </div>
            <el-button class="btn-logout" size="small" @click="logout"
              >退出登录</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-wrapper {
  width: 100%;
  height: 100%;
  background-color: rgb(3, 6, 23);
  display: flex;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
  overflow-y: auto;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(3, 6, 23);
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgb(42, 53, 74);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgb(54, 70, 96);
  }
}

/* 左侧区域 */
.profile-left {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.avatar-card {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .avatar-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid rgb(20, 31, 48);
    margin-bottom: 20px;
    cursor: pointer;

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(21, 187, 129, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
      color: white;

      .el-icon {
        font-size: 24px;
        margin-bottom: 5px;
      }

      span {
        font-size: 12px;
      }
    }

    &:hover .avatar-overlay {
      opacity: 1;
    }
  }

  .username {
    color: white;
    font-size: 20px;
    font-weight: bold;
    margin: 0 0 8px 0;
  }

  .user-email {
    color: rgb(84, 99, 121);
    font-size: 14px;
    margin: 0 0 15px 0;
  }

  .user-role {
    :deep(.el-tag) {
      background-color: rgba(21, 187, 129, 0.2);
      border-color: rgba(21, 187, 129, 0.3);
      color: rgb(21, 187, 129);
    }
  }
}

.quick-actions {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 20px;

  h3 {
    color: white;
    font-size: 16px;
    margin: 0 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid rgb(20, 31, 48);
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 15px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    color: rgb(148, 163, 184);

    .el-icon {
      font-size: 18px;
    }

    span {
      font-size: 14px;
    }

    &:hover {
      background-color: rgba(21, 187, 129, 0.1);
      color: rgb(21, 187, 129);
    }

    &.logout:hover {
      background-color: rgba(250, 76, 100, 0.1);
      color: rgb(250, 76, 100);
    }
  }
}

/* 右侧区域 */
.profile-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.info-card {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgb(20, 31, 48);

    h3 {
      color: white;
      font-size: 18px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: rgb(21, 187, 129);
      }
    }

    .edit-actions {
      display: flex;
      gap: 10px;
    }
  }

  .info-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background-color: rgba(30, 41, 59, 0.5);
    border-radius: 10px;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(30, 41, 59, 0.8);
    }

    .info-icon {
      width: 45px;
      height: 45px;
      border-radius: 10px;
      background-color: rgba(21, 187, 129, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;

      .el-icon {
        font-size: 22px;
        color: rgb(21, 187, 129);
      }
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .info-label {
        color: rgb(84, 99, 121);
        font-size: 13px;
      }

      .info-value {
        color: white;
        font-size: 15px;
        font-weight: 500;
      }
    }
  }

  .edit-form {
    :deep(.el-form-item__label) {
      color: rgb(148, 163, 184);
    }

    :deep(.el-input__wrapper) {
      background-color: rgb(3, 6, 23);
      box-shadow: 0 0 0 1px rgb(25, 35, 53);
    }

    :deep(.el-input__inner) {
      color: white;
    }

    :deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px rgb(21, 187, 129);
    }
  }
}

.stats-card {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 20px;

  h3 {
    color: white;
    font-size: 18px;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: rgb(21, 187, 129);
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .stat-item {
    background-color: rgba(30, 41, 59, 0.5);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(30, 41, 59, 0.8);
      transform: translateY(-2px);
    }

    .stat-value {
      color: rgb(21, 187, 129);
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .stat-label {
      color: rgb(84, 99, 121);
      font-size: 14px;
    }
  }
}

.security-card {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 20px;

  h3 {
    color: white;
    font-size: 18px;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      color: rgb(21, 187, 129);
    }
  }

  .security-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: rgba(30, 41, 59, 0.5);
    border-radius: 10px;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(30, 41, 59, 0.8);
    }

    .security-info {
      display: flex;
      flex-direction: column;
      gap: 5px;

      .security-title {
        color: white;
        font-size: 15px;
        font-weight: 500;
      }

      .security-desc {
        color: rgb(84, 99, 121);
        font-size: 13px;
      }
    }
  }
}

/* 按钮样式 - 融入网站设计 */
.btn-edit-profile {
  background-color: rgb(21, 187, 129) !important;
  border-color: rgb(21, 187, 129) !important;
  color: rgb(3, 6, 23) !important;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background-color: rgb(51, 196, 144) !important;
    border-color: rgb(51, 196, 144) !important;
    box-shadow: 0 0 15px -3px rgba(21, 187, 129, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }
}

.btn-save {
  background-color: rgb(21, 187, 129) !important;
  border-color: rgb(21, 187, 129) !important;
  color: rgb(3, 6, 23) !important;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background-color: rgb(51, 196, 144) !important;
    border-color: rgb(51, 196, 144) !important;
    box-shadow: 0 0 15px -3px rgba(21, 187, 129, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }
}

.btn-cancel {
  background-color: transparent !important;
  border-color: rgb(57, 70, 94) !important;
  color: rgb(148, 163, 184) !important;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    border-color: rgb(84, 99, 121) !important;
    color: rgb(255, 255, 255) !important;
    background-color: rgba(30, 41, 59, 0.5) !important;
  }

  &:active {
    transform: scale(0.98);
  }
}

.btn-change-password {
  background-color: rgba(21, 187, 129, 0.1) !important;
  border-color: rgb(21, 187, 129) !important;
  color: rgb(21, 187, 129) !important;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background-color: rgb(21, 187, 129) !important;
    color: rgb(3, 6, 23) !important;
    box-shadow: 0 0 15px -3px rgba(21, 187, 129, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }
}

.btn-logout {
  background-color: rgba(250, 76, 100, 0.1) !important;
  border-color: rgb(250, 76, 100) !important;
  color: rgb(250, 76, 100) !important;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background-color: rgb(250, 76, 100) !important;
    color: rgb(3, 6, 23) !important;
    box-shadow: 0 0 15px -3px rgba(250, 76, 100, 0.5);
  }

  &:active {
    transform: scale(0.98);
  }
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .profile-wrapper {
    flex-direction: column;
  }

  .profile-left {
    width: 100%;
  }

  .info-card .info-list {
    grid-template-columns: 1fr;
  }

  .stats-card .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-wrapper {
    padding: 10px;
  }

  .security-item {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start !important;
  }
}
</style>
