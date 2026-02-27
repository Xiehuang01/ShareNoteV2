<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, User, Delete } from '@element-plus/icons-vue'
import { 
  groupGetUserGroupsServer, 
  groupCreateGroupServer,
  groupLeaveGroupServer 
} from '@/api/group'
import LoadingOverlay from './LoadingOverlay.vue'

const dialogVisible = ref(false)
const showCreateForm = ref(false)
const userGroups = ref([])
const isLoading = ref(false)
const selectedGroupId = ref(null) // 当前选中的小组ID

// 创建小组表单
const createForm = ref({
  groupName: '',
  maxMembers: 5
})

const emit = defineEmits(['group-switched', 'group-created'])

// 打开对话框
const turnonChangeGroup = async () => {
  dialogVisible.value = true
  showCreateForm.value = false
  await loadUserGroups()
}

// 加载用户的小组列表
const loadUserGroups = async () => {
  try {
    isLoading.value = true
    const res = await groupGetUserGroupsServer()
    if (res.status === 'success') {
      userGroups.value = res.data
    }
  } catch (error) {
    console.error('加载小组列表失败:', error)
    ElMessage.error('加载失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 切换到创建小组表单
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value
  if (showCreateForm.value) {
    createForm.value = {
      groupName: '',
      maxMembers: 5
    }
  }
}

// 创建小组
const createGroup = async () => {
  if (!createForm.value.groupName.trim()) {
    ElMessage.warning('请输入小组名称')
    return
  }

  if (createForm.value.maxMembers < 2 || createForm.value.maxMembers > 15) {
    ElMessage.warning('小组人数必须在2-15人之间')
    return
  }

  try {
    const res = await groupCreateGroupServer(createForm.value)
    if (res.status === 'success') {
      ElMessage.success('创建小组成功')
      showCreateForm.value = false
      await loadUserGroups()
      emit('group-created', res.data)
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error('创建小组失败:', error)
    ElMessage.error(error.response?.data?.message || '创建失败，请重试')
  }
}

// 切换小组
const switchGroup = (group) => {
  selectedGroupId.value = group.groupId
  emit('group-switched', group)
  dialogVisible.value = false
}

// 退出小组
const leaveGroup = async (groupId, groupName) => {
  try {
    await ElMessageBox.confirm(
      `确定要退出小组 "${groupName}" 吗？`,
      '退出小组',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await groupLeaveGroupServer(groupId)
    if (res.status === 'success') {
      ElMessage.success('已退出小组')
      await loadUserGroups()
    } else {
      ElMessage.error(res.message || '退出失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('退出小组失败:', error)
    ElMessage.error(error.response?.data?.message || '退出失败，请重试')
  }
}

// 暴露方法给父组件
defineExpose({
  turnonChangeGroup
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="我的小组"
    width="600px"
    :close-on-click-modal="false"
    align-center
  >
    <div class="change-group-container">
      <!-- 创建小组按钮 -->
      <div class="header-actions" style="margin-top: 10px;">
        <el-button
          type="primary"
          :icon="Plus"
          @click="toggleCreateForm"
        >
          {{ showCreateForm ? '取消创建' : '创建新小组' }}
        </el-button>
      </div>

      <!-- 创建小组表单 -->
      <div class="create-form" v-if="showCreateForm">
        <el-form :model="createForm" label-width="100px">
          <el-form-item label="小组名称">
            <el-input
              v-model="createForm.groupName"
              placeholder="请输入小组名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="最大人数">
            <div class="slider-container">
              <el-slider
                v-model="createForm.maxMembers"
                :min="2"
                :max="15"
                :step="1"
                show-stops
              />
              <span class="slider-value">{{ createForm.maxMembers }} 人</span>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="createGroup" >
              创建小组
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 小组列表 -->
      <div class="groups-list">
        <LoadingOverlay v-if="isLoading" message="加载中..." />
        
        <div
          class="group-card"
          :class="{ 'is-selected': group.groupId === selectedGroupId }"
          v-for="group in userGroups"
          :key="group.groupId"
          @click="switchGroup(group)"
        >
          <div class="group-header">
            <div class="group-name">
              {{ group.groupName }}
              <el-tag
                v-if="group.role === 'owner'"
                type="warning"
                size="small"
                style="margin-left: 8px"
              >
                所有者
              </el-tag>
              <el-tag
                v-else-if="group.role === 'admin'"
                type="success"
                size="small"
                style="margin-left: 8px"
              >
                管理员
              </el-tag>
            </div>
            <el-button
              v-if="group.role !== 'owner'"
              :icon="Delete"
              type="danger"
              size="small"
              text
              @click.stop="leaveGroup(group.groupId, group.groupName)"
            >
              退出
            </el-button>
          </div>
          <div class="group-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ group.memberCount }}/{{ group.maxMembers }} 人</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span>{{ new Date(group.createdTime).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="!isLoading && userGroups.length === 0">
          <el-empty description="暂无小组，快去创建或加入一个吧！" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss">
// 全局样式，不使用 scoped
.el-overlay {
  background-color: rgba(0, 0, 0, 0.7) !important;
}
</style>

<style lang="scss" scoped>
.change-group-container {
.header-actions {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;

    .el-button {
      background-color: rgba(54, 211, 153, 0.2);
      border: 1px solid rgb(54, 211, 153);
      color: rgb(54, 211, 153);

      &:hover {
        background-color: rgb(54, 211, 153);
        color: rgb(3, 6, 23);
      }
    }
  }

  .create-form {
    padding: 20px;
    background-color: rgb(8, 15, 32);
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid rgb(20, 31, 48);

    :deep(.el-form-item__label) {
      color: rgb(255, 255, 255);
    }

    :deep(.el-input__wrapper) {
      background-color: rgb(3, 6, 23);
      box-shadow: 0 0 0 1px rgb(25, 35, 53);
    }

    :deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px rgb(54, 211, 153);
    }

    :deep(.el-input__inner) {
      color: rgb(255, 255, 255);
    }

    :deep(.el-input__inner::placeholder) {
      color: rgb(68, 78, 97);
    }

    .slider-container {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;

      .el-slider {
        flex: 1;
      }

      .slider-value {
        min-width: 50px;
        color: rgb(54, 211, 153);
        font-weight: bold;
        font-size: 16px;
      }
    }

    :deep(.el-slider) {
      .el-slider__runway {
        background-color: rgb(20, 31, 48);
        height: 6px;
      }

      .el-slider__bar {
        background-color: rgb(54, 211, 153);
        height: 6px;
      }

      .el-slider__button {
        width: 16px;
        height: 16px;
        border: 2px solid rgb(54, 211, 153);
        background-color: rgb(3, 6, 23);
        transition: all 0.3s;

        &:hover {
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(54, 211, 153, 0.5);
        }
      }

      .el-slider__stop {
        background-color: rgb(42, 53, 74);
        width: 4px;
        height: 4px;
      }

      .el-slider__button-wrapper:hover,
      .el-slider__button-wrapper.hover {
        .el-slider__button {
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(54, 211, 153, 0.5);
        }
      }
    }

    .tip {
      margin-left: 10px;
      font-size: 12px;
      color: rgb(107, 114, 128);
    }

    .el-button {
      background-color: rgba(54, 211, 153, 0.2);
      border: 1px solid rgb(54, 211, 153);
      color: rgb(54, 211, 153);

      &:hover {
        background-color: rgb(54, 211, 153);
        color: rgb(3, 6, 23);
      }
    }
  }

  .groups-list {
    max-height: 500px;
    overflow-y: auto;
    position: relative;
    min-height: 200px;

    .group-card {
      padding: 20px;
      margin-bottom: 15px;
      background-color: rgb(13, 24, 50);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid rgb(20, 31, 48);

      &:hover {
        background-color: rgb(15, 28, 56);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(54, 211, 153, 0.3);
        border-color: rgb(54, 211, 153);
      }

      &.is-selected {
        background-color: rgb(15, 28, 56);
        border-color: rgb(54, 211, 153);
        box-shadow: 0 0 20px rgba(54, 211, 153, 0.4);
        
        .group-name {
          color: rgb(54, 211, 153);
        }
      }

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .group-name {
          font-size: 18px;
          font-weight: bold;
          color: rgb(255, 255, 255);
          display: flex;
          align-items: center;
        }

        .el-button {
          background-color: transparent;
          border: 1px solid rgb(255, 14, 35);
          color: rgb(255, 14, 35);

          &:hover {
            background-color: rgb(255, 14, 35);
            color: rgb(255, 255, 255);
          }
        }
      }

      .group-info {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: rgb(107, 114, 128);

        .info-item {
          display: flex;
          align-items: center;
          gap: 5px;

          .el-icon {
            color: rgb(54, 211, 153);
          }

          .label {
            font-weight: 500;
          }
        }
      }
    }

    .empty-state {
      padding: 60px 0;
      text-align: center;
      color: rgb(107, 114, 128);
    }
  }
}

.groups-list::-webkit-scrollbar {
  width: 6px;
}

.groups-list::-webkit-scrollbar-thumb {
  background-color: rgba(54, 211, 153, 0.3);
  border-radius: 3px;
}

.groups-list::-webkit-scrollbar-track {
  background-color: transparent;
}

// 覆盖 Element Plus Dialog 样式
:deep(.el-dialog) {
  background-color: rgb(3, 6, 23);
  border: 1px solid rgb(20, 31, 48);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgb(20, 31, 48);
  padding: 20px;
  background-color: rgb(3, 6, 23);
}

:deep(.el-dialog__title) {
  // color: rgb(255, 255, 255);
  font-weight: bold;
}

:deep(.el-dialog__close) {
color: rgb(107, 114, 128);

  &:hover {
    color: rgb(54, 211, 153);
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
  background-color: rgb(3, 6, 23);
}

// 覆盖遮罩层样式
:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.7);
}

// 覆盖 Empty 组件样式
:deep(.el-empty) {
  .el-empty__description {
    color: rgb(107, 114, 128);
  }

  .el-empty__image svg {
    fill: rgb(68, 78, 97);
  }
}

// 覆盖 Tag 样式
:deep(.el-tag) {
  background-color: rgba(54, 211, 153, 0.2);
  border-color: rgb(54, 211, 153);
  color: rgb(54, 211, 153);

  &.el-tag--warning {
    background-color: rgba(255, 193, 7, 0.2);
    border-color: rgb(255, 193, 7);
    color: rgb(255, 193, 7);
  }

  &.el-tag--success {
    background-color: rgba(54, 211, 153, 0.2);
    border-color: rgb(54, 211, 153);
    color: rgb(54, 211, 153);
  }
}
</style>
