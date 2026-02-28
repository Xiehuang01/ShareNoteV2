<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Cpu, Key, Connection, Link } from '@element-plus/icons-vue'

const userStore = useUserStore()

// AI 配置表单
const aiForm = ref({
  platform: '硅基流动',
  apiKey: '',
  model: 'deepseek-ai/DeepSeek-V3'
})

// 模型选项
const modelOptions = [
  { label: 'DeepSeek V3', value: 'deepseek-ai/DeepSeek-V3' },
  { label: 'Qwen2.5 72B', value: 'Qwen/Qwen2.5-72B-Instruct' },
  { label: 'Qwen2.5 7B', value: 'Qwen/Qwen2.5-7B-Instruct' },
  { label: 'GLM-4 9B', value: 'THUDM/glm-4-9b-chat' }
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

  // 去除首尾空格
  const config = {
    platform: aiForm.value.platform,
    apiKey: aiForm.value.apiKey.trim(),
    model: aiForm.value.model
  }

  userStore.setAiConfig(config)
  aiForm.value.apiKey = config.apiKey // 更新表单显示
  ElMessage.success('AI 配置已保存')
}

// 测试连接
const testConnection = async () => {
  if (!aiForm.value.apiKey) {
    ElMessage.warning('请先输入 API Key')
    return
  }

  const loading = ElMessage.info('正在测试连接...')
  
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${aiForm.value.apiKey.trim()}`
      }
    })

    loading.close()

    if (response.ok) {
      ElMessage.success('连接成功！API Key 有效')
    } else if (response.status === 401) {
      ElMessage.error('API Key 无效，请检查是否正确')
    } else {
      ElMessage.error(`连接失败，状态码: ${response.status}`)
    }
  } catch (error) {
    loading.close()
    console.error('测试连接失败:', error)
    ElMessage.error('网络错误，请检查网络连接')
  }
}
</script>

<template>
  <div class="settings-wrapper">
    <!-- 左侧：AI 配置卡片 -->
    <div class="settings-left">
      <div class="config-card">
        <div class="card-header">
          <div class="header-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="header-content">
            <h2 class="title">AI 配置</h2>
            <p class="subtitle">配置您的 AI 服务以启用智能辅助功能</p>
          </div>
        </div>

        <div class="config-form">
          <div class="form-item">
            <div class="form-label">
              <el-icon><Connection /></el-icon>
              <span>平台</span>
            </div>
            <div class="form-input-wrapper disabled">
              <input
                v-model="aiForm.platform"
                type="text"
                disabled
                class="form-input"
              />
              <span class="platform-badge">默认</span>
            </div>
          </div>

          <div class="form-item">
            <div class="form-label">
              <el-icon><Key /></el-icon>
              <span>API Key</span>
            </div>
            <div class="form-input-wrapper">
              <input
                v-model="aiForm.apiKey"
                type="password"
                placeholder="请输入硅基流动 API Key"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-item">
            <div class="form-label">
              <el-icon><Cpu /></el-icon>
              <span>模型</span>
            </div>
            <div class="form-input-wrapper">
              <select v-model="aiForm.model" class="form-select">
                <option
                  v-for="item in modelOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="config-actions">
          <button class="btn-save" @click="saveConfig">
            保存配置
          </button>
          <button class="btn-test" @click="testConnection">
            测试连接
          </button>
        </div>
      </div>
    </div>

    <!-- 右侧：说明和提示 -->
    <div class="settings-right">
      <!-- 使用说明卡片 -->
      <div class="info-card">
        <div class="card-header-small">
          <el-icon><Link /></el-icon>
          <h3>使用说明</h3>
        </div>
        <div class="info-content">
          <div class="info-item">
            <div class="info-number">1</div>
            <div class="info-text">
              <span class="info-title">获取 API Key</span>
              <span class="info-desc">
                前往 <a href="https://cloud.siliconflow.cn" target="_blank">硅基流动官网</a> 注册并获取 API Key
              </span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-number">2</div>
            <div class="info-text">
              <span class="info-title">配置密钥</span>
              <span class="info-desc">将获取的 API Key 填入左侧表单中</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-number">3</div>
            <div class="info-text">
              <span class="info-title">选择模型</span>
              <span class="info-desc">根据需求选择合适的 AI 模型</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-number">4</div>
            <div class="info-text">
              <span class="info-title">开始使用</span>
              <span class="info-desc">保存配置后即可在编辑模式中使用 AI 辅助写作</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示卡片 -->
      <div class="tips-card">
        <div class="card-header-small">
          <el-icon><Cpu /></el-icon>
          <h3>功能说明</h3>
        </div>
        <div class="tips-list">
          <div class="tip-item">
            <div class="tip-dot"></div>
            <span>AI 辅助写作可帮助您快速生成、优化和润色文本内容</span>
          </div>
          <div class="tip-item">
            <div class="tip-dot"></div>
            <span>配置信息将安全保存在您的本地浏览器中</span>
          </div>
          <div class="tip-item">
            <div class="tip-dot"></div>
            <span>不同模型具有不同的特点和适用场景</span>
          </div>
          <div class="tip-item">
            <div class="tip-dot"></div>
            <span>请妥善保管您的 API Key，不要泄露给他人</span>
          </div>
        </div>
      </div>

      <!-- 模型对比卡片 -->
      <div class="models-card">
        <div class="card-header-small">
          <el-icon><Cpu /></el-icon>
          <h3>模型对比</h3>
        </div>
        <div class="models-table">
          <div class="table-header">
            <span>模型</span>
            <span>特点</span>
          </div>
          <div class="table-row">
            <span class="model-name">DeepSeek V3</span>
            <span class="model-desc">强大的推理能力，适合复杂写作任务</span>
          </div>
          <div class="table-row">
            <span class="model-name">Qwen2.5 72B</span>
            <span class="model-desc">中文理解能力强，适合中文创作</span>
          </div>
          <div class="table-row">
            <span class="model-name">Qwen2.5 7B</span>
            <span class="model-desc">响应速度快，适合简单任务</span>
          </div>
          <div class="table-row">
            <span class="model-name">GLM-4 9B</span>
            <span class="model-desc">平衡性能与速度，性价比高</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.settings-wrapper {
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
.settings-left {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.config-card {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 30px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgb(20, 31, 48);

    .header-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background-color: rgba(21, 187, 129, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;

      .el-icon {
        font-size: 24px;
        color: rgb(21, 187, 129);
      }
    }

    .header-content {
      .title {
        color: white;
        font-size: 20px;
        font-weight: bold;
        margin: 0 0 6px 0;
      }

      .subtitle {
        color: rgb(84, 99, 121);
        font-size: 14px;
        margin: 0;
      }
    }
  }
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgb(148, 163, 184);
      font-size: 14px;
      font-weight: 500;

      .el-icon {
        color: rgb(21, 187, 129);
        font-size: 16px;
      }
    }

    .form-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      &.disabled {
        .form-input {
          background-color: rgb(15, 20, 35);
          color: rgb(120, 130, 150);
          cursor: not-allowed;
        }
      }

      .form-input {
        width: 100%;
        padding: 12px 15px;
        background-color: rgb(3, 6, 23);
        border: 1px solid rgb(25, 35, 53);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        transition: all 0.3s;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: rgb(21, 187, 129);
          box-shadow: 0 0 0 3px rgba(21, 187, 129, 0.1);
        }

        &::placeholder {
          color: rgb(100, 110, 130);
        }
      }

      .form-select {
        width: 100%;
        padding: 12px 15px;
        background-color: rgb(3, 6, 23);
        border: 1px solid rgb(25, 35, 53);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        box-sizing: border-box;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 15px center;
        padding-right: 40px;

        &:focus {
          outline: none;
          border-color: rgb(21, 187, 129);
          box-shadow: 0 0 0 3px rgba(21, 187, 129, 0.1);
        }

        option {
          background-color: rgb(8, 15, 32);
          color: white;
          padding: 10px;
        }
      }

      .platform-badge {
        position: absolute;
        right: 12px;
        padding: 4px 10px;
        background-color: rgba(21, 187, 129, 0.1);
        color: rgb(21, 187, 129);
        font-size: 12px;
        border-radius: 4px;
        border: 1px solid rgba(21, 187, 129, 0.2);
      }
    }
  }
}

.config-actions {
  display: flex;
  gap: 12px;

  .btn-save {
    flex: 1;
    padding: 12px 24px;
    background-color: rgb(21, 187, 129);
    border: none;
    border-radius: 8px;
    color: rgb(3, 6, 23);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: rgb(51, 196, 144);
      box-shadow: 0 0 15px -3px rgba(21, 187, 129, 0.5);
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .btn-test {
    padding: 12px 24px;
    background-color: rgba(77, 170, 253, 0.1);
    border: 1px solid rgba(77, 170, 253, 0.3);
    border-radius: 8px;
    color: rgb(77, 170, 253);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(77, 170, 253, 0.2);
      border-color: rgba(77, 170, 253, 0.5);
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

/* 右侧区域 */
.settings-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.info-card,
.tips-card,
.models-card {
  background-color: rgb(8, 15, 32);
  border: 2px solid rgb(20, 31, 48);
  border-radius: 12px;
  padding: 20px;
}

.card-header-small {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgb(20, 31, 48);

  .el-icon {
    color: rgb(21, 187, 129);
    font-size: 20px;
  }

  h3 {
    color: white;
    font-size: 16px;
    margin: 0;
    font-weight: 600;
  }
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 12px;
    background-color: rgba(30, 41, 59, 0.5);
    border-radius: 10px;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(30, 41, 59, 0.8);
    }

    .info-number {
      width: 28px;
      height: 28px;
      min-width: 28px;
      border-radius: 50%;
      background-color: rgba(21, 187, 129, 0.1);
      color: rgb(21, 187, 129);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .info-title {
        color: white;
        font-size: 14px;
        font-weight: 500;
      }

      .info-desc {
        color: rgb(84, 99, 121);
        font-size: 13px;
        line-height: 1.5;

        a {
          color: rgb(21, 187, 129);
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .tip-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background-color: rgba(30, 41, 59, 0.3);
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background-color: rgba(30, 41, 59, 0.6);
    }

    .tip-dot {
      width: 6px;
      height: 6px;
      min-width: 6px;
      border-radius: 50%;
      background-color: rgb(21, 187, 129);
    }

    span {
      color: rgb(148, 163, 184);
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

.models-table {
  display: flex;
  flex-direction: column;

  .table-header {
    display: flex;
    padding: 10px 12px;
    background-color: rgba(30, 41, 59, 0.8);
    border-radius: 8px 8px 0 0;
    margin-bottom: 1px;

    span {
      color: rgb(148, 163, 184);
      font-size: 13px;
      font-weight: 500;

      &:first-child {
        width: 120px;
      }
    }
  }

  .table-row {
    display: flex;
    padding: 12px;
    background-color: rgba(30, 41, 59, 0.3);
    border-bottom: 1px solid rgba(20, 31, 48, 0.5);
    transition: all 0.3s;

    &:last-child {
      border-bottom: none;
      border-radius: 0 0 8px 8px;
    }

    &:hover {
      background-color: rgba(30, 41, 59, 0.6);
    }

    .model-name {
      width: 120px;
      color: rgb(21, 187, 129);
      font-size: 14px;
      font-weight: 500;
    }

    .model-desc {
      flex: 1;
      color: rgb(148, 163, 184);
      font-size: 14px;
    }
  }
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .settings-wrapper {
    flex-direction: column;
  }

  .settings-left {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .settings-wrapper {
    padding: 10px;
  }

  .config-card {
    padding: 20px;
  }

  .config-actions {
    flex-direction: column;
  }
}
</style>
