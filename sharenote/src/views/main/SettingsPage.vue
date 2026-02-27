<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

// AI 配置表单
const aiForm = ref({
  platform: '硅基流动',
  apiKey: '',
  model: 'deepseek-chat'
})

// 模型选项
const modelOptions = [
  { label: 'DeepSeek V3', value: 'deepseek-chat' },
  { label: '千问', value: 'qwen-plus' },
  { label: 'Mini', value: 'qwen-turbo' },
  { label: '混元', value: 'hunyuan-lite' }
]

// 加载已保存的配置
onMounted(() => {
  if (userStore.aiConfig) {
    aiForm.value = { ...userStore.aiConfig }
  }
})

// 保存配置
const saveConfig = () => {
  if (!aiForm.value.apiKey) {
    ElMessage.warning('请输入 API Key')
    return
  }
  
  userStore.setAiConfig(aiForm.value)
  ElMessage.success('AI 配置已保存')
}

// 测试连接
const testConnection = async () => {
  if (!aiForm.value.apiKey) {
    ElMessage.warning('请先输入 API Key')
    return
  }
  
  ElMessage.info('测试连接功能开发中...')
}
</script>

<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>设置</h1>
    </div>
    
    <div class="settings-content">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>AI 配置</span>
          </div>
        </template>
        
        <el-form :model="aiForm" label-width="100px" label-position="left">
          <el-form-item label="平台">
            <el-input v-model="aiForm.platform" disabled />
          </el-form-item>
          
          <el-form-item label="API Key">
            <el-input 
              v-model="aiForm.apiKey" 
              type="password" 
              placeholder="请输入硅基流动 API Key"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="模型">
            <el-select v-model="aiForm.model" placeholder="请选择模型" style="width: 100%">
              <el-option
                v-for="item in modelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
            <el-button @click="testConnection">测试连接</el-button>
          </el-form-item>
        </el-form>
        
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <p>请前往 <a href="https://cloud.siliconflow.cn" target="_blank">硅基流动官网</a> 获取 API Key</p>
          <p style="margin-top: 8px;">配置后可在编辑模式中使用 AI 辅助写作功能</p>
        </el-alert>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-container {
  width: 100%;
  height: 100%;
  background: rgb(3, 6, 23);
  overflow-y: auto;
  
  .settings-header {
    padding: 30px 40px 20px;
    border-bottom: 2px solid rgb(20, 31, 48);
    
    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      color: rgb(255, 255, 255);
    }
  }
  
  .settings-content {
    padding: 30px 40px;
    
    .settings-card {
      max-width: 800px;
      background-color: rgb(8, 15, 32);
      border: 1px solid rgb(20, 31, 48);
      
      :deep(.el-card__header) {
        background-color: rgb(10, 18, 36);
        border-bottom: 1px solid rgb(20, 31, 48);
      }
      
      .card-header {
        font-size: 18px;
        font-weight: bold;
        color: rgb(255, 255, 255);
      }
      
      :deep(.el-form-item__label) {
        font-weight: 500;
        color: rgb(200, 200, 200);
      }
      
      :deep(.el-input__wrapper) {
        background-color: rgb(3, 6, 23);
        box-shadow: 0 0 0 1px rgb(25, 35, 53);
        
        &.is-focus {
          box-shadow: 0 0 0 1px rgb(22, 187, 130);
        }
      }
      
      :deep(.el-input__inner) {
        color: rgb(255, 255, 255);
        
        &::placeholder {
          color: rgb(100, 110, 130);
        }
      }
      
      :deep(.el-input.is-disabled .el-input__wrapper) {
        background-color: rgb(15, 20, 35);
        box-shadow: 0 0 0 1px rgb(25, 35, 53);
      }
      
      :deep(.el-input.is-disabled .el-input__inner) {
        color: rgb(120, 130, 150);
      }
      
      :deep(.el-select) {
        .el-input__wrapper {
          background-color: rgb(3, 6, 23);
          box-shadow: 0 0 0 1px rgb(25, 35, 53);
        }
        
        .el-input__inner {
          color: rgb(255, 255, 255);
        }
      }
      
      :deep(.el-button--primary) {
        background-color: rgb(22, 187, 130);
        border-color: rgb(22, 187, 130);
        color: rgb(3, 6, 23);
        font-weight: 600;
        
        &:hover {
          background-color: rgb(19, 168, 117);
          border-color: rgb(19, 168, 117);
          box-shadow: 0 0 15px rgba(22, 187, 130, 0.4);
        }
      }
      
      :deep(.el-button--default) {
        background-color: rgba(77, 170, 253, 0.15);
        border: 1px solid rgba(77, 170, 253, 0.3);
        color: rgb(77, 170, 253);
        
        &:hover {
          background-color: rgba(77, 170, 253, 0.25);
          border-color: rgba(77, 170, 253, 0.5);
        }
      }
      
      :deep(.el-alert) {
        margin-top: 20px;
        background-color: rgba(22, 187, 130, 0.1);
        border: 1px solid rgba(22, 187, 130, 0.2);
        
        .el-alert__title {
          color: rgb(22, 187, 130);
        }
        
        .el-alert__content {
          color: rgb(200, 200, 200);
        }
        
        .el-alert__icon {
          color: rgb(22, 187, 130);
        }
        
        p {
          margin: 0;
          line-height: 1.6;
        }
        
        a {
          color: rgb(22, 187, 130);
          text-decoration: none;
          font-weight: 500;
          
          &:hover {
            text-decoration: underline;
            color: rgb(19, 168, 117);
          }
        }
      }
    }
  }
}

.settings-container::-webkit-scrollbar {
  width: 8px;
}

.settings-container::-webkit-scrollbar-track {
  background: transparent;
}

.settings-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
