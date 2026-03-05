<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { groupSearchGroupsServer, groupJoinGroupServer } from '@/api/group'
import LoadingOverlay from './LoadingOverlay.vue'

const dialogVisible = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])
const isSearching = ref(false)

const emit = defineEmits(['group-joined'])

// 打开对话框
const turnonJoinGroup = () => {
  dialogVisible.value = true
  searchKeyword.value = ''
  searchResults.value = []
}

// 搜索小组
const searchGroups = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    isSearching.value = true
    const res = await groupSearchGroupsServer(searchKeyword.value)
    if (res.status === 'success') {
      searchResults.value = res.data
      if (res.data.length === 0) {
        ElMessage.info('未找到相关小组')
      }
    }
  } catch (error) {
    console.error('搜索小组失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    isSearching.value = false
  }
}

// 加入小组
const joinGroup = async (groupId) => {
  try {
    const res = await groupJoinGroupServer({ groupId })
    if (res.status === 'success') {
      ElMessage.success('加入小组成功')
      dialogVisible.value = false
      emit('group-joined')
    } else {
      ElMessage.error(res.message || '加入失败')
    }
  } catch (error) {
    console.error('加入小组失败:', error)
    ElMessage.error(error.response?.data?.message || '加入失败，请重试')
  }
}

// 暴露方法给父组件
defineExpose({
  turnonJoinGroup
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="加入小组"
    width="500px"
    :close-on-click-modal="false"
    align-center
  >
    <div class="join-group-container">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="输入小组名称或ID搜索"
          :prefix-icon="Search"
          clearable
          @keyup.enter="searchGroups"
        >
          <template #append>
            <el-button
              :icon="Search"
              @click="searchGroups"
              :loading="isSearching"
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results-container">
        <LoadingOverlay v-if="isSearching" message="搜索中..." />
        
        <div class="search-results" v-if="searchResults.length > 0">
        <div
          class="group-item"
          v-for="group in searchResults"
          :key="group.groupId"
        >
          <div class="group-info">
            <div class="group-name">{{ group.groupName }}</div>
            <div class="group-meta">
              <span>创建者: {{ group.creatorName }}</span>
              <span>成员: {{ group.memberCount }}/{{ group.maxMembers }}</span>
            </div>
          </div>
          <el-button
            type="primary"
            size="small"
            @click="joinGroup(group.groupId)"
            :disabled="group.isMember || group.isFull"
          >
            {{ group.isMember ? '已加入' : group.isFull ? '已满' : '加入' }}
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else-if="searchKeyword && !isSearching">
        <el-empty description="暂无搜索结果" />
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
.join-group-container {
  .search-box {
    margin-bottom: 20px;

    :deep(.el-input__wrapper) {
      background-color: rgb(8, 15, 32);
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

    :deep(.el-input__prefix) {
      color: rgb(68, 78, 97);
    }

    :deep(.el-input-group__append) {
      background-color: rgb(8, 15, 32);
      border-color: rgb(25, 35, 53);
      box-shadow: 0 0 0 1px rgb(25, 35, 53);

      .el-button {
        background-color: transparent;
        color: rgb(54, 211, 153);
        border: none;

        &:hover {
          background-color: rgba(54, 211, 153, 0.1);
        }
      }
    }
  }

  .search-results-container {
    position: relative;
    min-height: 200px;
  }

  .search-results {
    max-height: 400px;
    overflow-y: auto;

    .group-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      background-color: rgb(13, 24, 50);
      border-radius: 8px;
      border: 1px solid rgb(20, 31, 48);
      transition: all 0.3s;

      &:hover {
        background-color: rgb(15, 28, 56);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(54, 211, 153, 0.2);
        border-color: rgb(54, 211, 153);
      }

      .group-info {
        flex: 1;

        .group-name {
          font-size: 16px;
          font-weight: bold;
          color: rgb(255, 255, 255);
          margin-bottom: 5px;
        }

        .group-meta {
          font-size: 13px;
          color: rgb(107, 114, 128);

          span {
            margin-right: 15px;
          }
        }
      }

      .el-button {
        background-color: rgba(54, 211, 153, 0.2);
        border: 1px solid rgb(54, 211, 153);
        color: rgb(54, 211, 153);

        &:hover {
          background-color: rgb(54, 211, 153);
          color: rgb(3, 6, 23);
        }

        &:disabled {
          background-color: rgba(68, 78, 97, 0.2);
          border-color: rgb(68, 78, 97);
          color: rgb(68, 78, 97);
        }
      }
    }
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
    color: rgb(107, 114, 128);
  }
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-thumb {
  background-color: rgba(54, 211, 153, 0.3);
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-track {
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
  color: rgb(255, 255, 255);
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

// 手机端适配
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95vw !important;
    margin: 0 auto !important;
  }

  .join-group-container {
    .search-box {
      margin-bottom: 15px;

      :deep(.el-input__inner) {
        font-size: 14px;
      }

      :deep(.el-input-group__append) {
        .el-button {
          padding: 0 15px;
        }
      }
    }

    .search-results-container {
      min-height: 150px;
    }

    .search-results {
      max-height: 350px;

      .group-item {
        padding: 12px;
        margin-bottom: 8px;

        .group-info {
          .group-name {
            font-size: 14px;
          }

          .group-meta {
            font-size: 12px;

            span {
              margin-right: 10px;
            }
          }
        }

        .el-button {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog__header) {
    padding: 15px;

    .el-dialog__title {
      font-size: 15px;
    }
  }

  :deep(.el-dialog__body) {
    padding: 15px;
  }

  .join-group-container {
    .search-results {
      .group-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;

        .group-info {
          width: 100%;
        }

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>

