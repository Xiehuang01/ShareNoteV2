<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { callAIStream } from '@/api/ai'
import { MagicStick, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  selectedText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['insert-text', 'replace-text'])

const userStore = useUserStore()
const dialogVisible = ref(false)
const prompt = ref('')
const isGenerating = ref(false)
const generatedText = ref('')

// 检查是否配置了 AI
const isAIConfigured = computed(() => {
  return userStore.aiConfig && userStore.aiConfig.apiKey
})

// 打开对话框
const open = () => {
  if (!isAIConfigured.value) {
    ElMessage.warning('请先在设置中配置 AI')
    return
  }
  
  generatedText.value = ''
  prompt.value = ''
  dialogVisible.value = true
}

// 生成内容
const generate = async () => {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入提示词')
    return
  }

  isGenerating.value = true
  generatedText.value = ''

  try {
    await callAIStream(
      userStore.aiConfig.apiKey,
      userStore.aiConfig.model,
      prompt.value,
      props.selectedText,
      (chunk) => {
        generatedText.value += chunk
      }
    )
    
    ElMessage.success('生成完成')
  } catch (error) {
    console.error('AI 生成失败:', error)
    ElMessage.error(error.message || 'AI 生成失败，请检查配置')
  } finally {
    isGenerating.value = false
  }
}

// 插入到编辑器
const insertToEditor = () => {
  if (!generatedText.value) {
    ElMessage.warning('没有可插入的内容')
    return
  }

  if (props.selectedText) {
    // 如果有选中文本，替换选中内容
    emit('replace-text', generatedText.value)
  } else {
    // 否则插入到光标位置
    emit('insert-text', generatedText.value)
  }
  
  dialogVisible.value = false
  ElMessage.success('已插入到编辑器')
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI 辅助写作"
    width="70%"
    :close-on-click-modal="false"
  >
    <div class="ai-assistant-container">
      <!-- 提示词输入 -->
      <div class="prompt-section">
        <el-input
          v-model="prompt"
          type="textarea"
          :rows="3"
          :placeholder="selectedText ? '请输入修改要求，AI 将基于选中内容进行修改...' : '请输入你想生成的内容...'"
          :disabled="isGenerating"
        />
        <div class="prompt-actions">
          <el-button
            type="primary"
            :icon="MagicStick"
            :loading="isGenerating"
            @click="generate"
          >
            {{ isGenerating ? '生成中...' : '生成' }}
          </el-button>
        </div>
      </div>

      <!-- 选中的文本 -->
      <div v-if="selectedText" class="selected-text-section">
        <div class="section-title">选中的内容：</div>
        <div class="selected-text">{{ selectedText }}</div>
      </div>

      <!-- 生成的内容 -->
      <div v-if="generatedText || isGenerating" class="generated-section">
        <div class="section-title">AI 生成的内容：</div>
        <div class="generated-text">
          <div v-if="isGenerating" class="generating-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
            正在生成...
          </div>
          <pre>{{ generatedText }}</pre>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!generatedText || isGenerating"
          @click="insertToEditor"
        >
          {{ selectedText ? '替换选中内容' : '插入到编辑器' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.ai-assistant-container {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .prompt-section {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .prompt-actions {
      display: flex;
      justify-content: flex-end;
    }
  }

  .selected-text-section,
  .generated-section {
    .section-title {
      font-weight: bold;
      color: rgb(31, 32, 34);
      margin-bottom: 10px;
      font-size: 14px;
    }

    .selected-text,
    .generated-text {
      padding: 15px;
      background: rgb(246, 248, 250);
      border-radius: 8px;
      border: 1px solid rgb(215, 221, 227);
      max-height: 300px;
      overflow-y: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;

      pre {
        margin: 0;
        font-family: inherit;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .generating-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgb(22, 187, 130);
        font-weight: 500;
      }
    }
  }
}

:deep(.el-button--primary) {
  background-color: rgb(22, 187, 130);
  border-color: rgb(22, 187, 130);

  &:hover {
    background-color: rgb(19, 168, 117);
    border-color: rgb(19, 168, 117);
  }
}
</style>

