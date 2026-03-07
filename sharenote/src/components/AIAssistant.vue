<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { callAIStream } from '@/api/ai'
import {
  MagicStick,
  Loading,
  Close,
  Position,
  DocumentAdd,
  RefreshRight,
  Check,
  Delete,
  CircleCheck,
  CircleClose,
  View,
  Edit
} from '@element-plus/icons-vue'

const props = defineProps({
  selectedText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['insert-text', 'replace-text', 'clear-selection'])

const userStore = useUserStore()
const dialogVisible = ref(false)
const prompt = ref('')
const isGenerating = ref(false)
const generatedText = ref('')
const originalText = ref('')
const messagesContainer = ref(null)
const activeTab = ref('diff') // 'diff' | 'preview'
const diffBlocks = ref([]) // 存储 diff 结果

// 修改模式：'selection' 选中修改, 'generate' 生成新内容
const editMode = computed(() => props.selectedText ? 'selection' : 'generate')

// 快速操作选项
const quickActions = [
  { icon: '✨', label: '润色', prompt: '请润色以下文本，使其更加流畅、专业，保持原有意思：' },
  { icon: '📝', label: '扩写', prompt: '请基于以下内容进行扩写，增加更多细节和深度：' },
  { icon: '🔍', label: '简化', prompt: '请简化以下文本，使其更易理解，保持核心信息：' },
  { icon: '🔄', label: '改写', prompt: '请改写以下文本，保持原意但用不同的表达方式：' },
  { icon: '🐛', label: '纠错', prompt: '请检查以下文本中的语法和拼写错误，给出修正后的完整版本：' },
  { icon: '🌐', label: '翻译', prompt: '请将以下文本翻译成英文：' }
]

// 检查是否配置了 AI
const isAIConfigured = computed(() => {
  return userStore.aiConfig && userStore.aiConfig.apiKey
})

// 简单的行级 diff 算法
const computeDiff = (oldText, newText) => {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result = []

  // 使用简单的 LCS 算法
  const m = oldLines.length
  const n = newLines.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // 回溯构建 diff
  let i = m, j = n
  const tempResult = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      tempResult.unshift({ type: 'unchanged', content: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempResult.unshift({ type: 'added', content: newLines[j - 1] })
      j--
    } else {
      tempResult.unshift({ type: 'removed', content: oldLines[i - 1] })
      i--
    }
  }

  // 合并连续的相同类型
  for (let k = 0; k < tempResult.length; k++) {
    const item = tempResult[k]
    if (result.length === 0 || result[result.length - 1].type !== item.type) {
      result.push({ type: item.type, lines: [item.content], accepted: item.type !== 'removed' })
    } else {
      result[result.length - 1].lines.push(item.content)
    }
  }

  return result
}

// 统计修改数量
const changeStats = computed(() => {
  if (!diffBlocks.value.length) return { added: 0, removed: 0 }
  let added = 0, removed = 0
  diffBlocks.value.forEach(block => {
    if (block.type === 'added') added += block.lines.length
    if (block.type === 'removed') removed += block.lines.length
  })
  return { added, removed }
})

// 是否全部已接受
const allAccepted = computed(() => {
  if (!diffBlocks.value.length) return false
  return diffBlocks.value.every(block =>
    block.type === 'unchanged' || block.accepted
  )
})

// 打开对话框
const open = () => {
  if (!isAIConfigured.value) {
    ElMessage.warning('请先在设置中配置 AI')
    return
  }

  resetState()
  dialogVisible.value = true
  scrollToBottom()
}

// 打开对话框并传入选中的文本
const openWithSelection = (text) => {
  if (!isAIConfigured.value) {
    ElMessage.warning('请先在设置中配置 AI')
    return
  }

  resetState()
  originalText.value = text
  dialogVisible.value = true
  nextTick(() => scrollToBottom())
}

// 重置状态
const resetState = () => {
  generatedText.value = ''
  originalText.value = ''
  prompt.value = ''
  activeTab.value = 'diff'
  diffBlocks.value = []
}

// 使用快速操作
const useQuickAction = (action) => {
  if (props.selectedText) {
    prompt.value = action.prompt
    originalText.value = props.selectedText
    generate()
  } else {
    prompt.value = action.prompt.replace('以下文本', '我想要')
    nextTick(() => {
      const textarea = document.querySelector('.ai-input-textarea')
      if (textarea) textarea.focus()
    })
  }
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
    const fullPrompt = props.selectedText
      ? `${prompt.value}\n\n原文：\n${props.selectedText}`
      : prompt.value

    await callAIStream(
      userStore.aiConfig.apiKey,
      userStore.aiConfig.model,
      fullPrompt,
      '',
      (chunk) => {
        generatedText.value += chunk
        scrollToBottom()
      }
    )

    // 保存原始文本用于对比
    if (!originalText.value && props.selectedText) {
      originalText.value = props.selectedText
    }

    // 计算 diff 并存储到 ref
    if (originalText.value) {
      diffBlocks.value = computeDiff(originalText.value, generatedText.value)
    }

    ElMessage.success('生成完成')
  } catch (error) {
    console.error('AI 生成失败:', error)
    ElMessage.error(error.message || 'AI 生成失败，请检查配置')
  } finally {
    isGenerating.value = false
  }
}

// 重新生成
const regenerate = () => {
  generatedText.value = ''
  generate()
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 切换单个修改的接受状态
const toggleBlock = (index) => {
  if (diffBlocks.value[index]) {
    diffBlocks.value[index].accepted = !diffBlocks.value[index].accepted
    console.log(`切换块 ${index}:`, diffBlocks.value[index].accepted)
  }
}

// 接受所有修改
const acceptAll = () => {
  diffBlocks.value.forEach(block => {
    if (block.type !== 'unchanged') {
      block.accepted = true
    }
  })
  ElMessage.success('已接受所有修改')
}

// 拒绝所有修改
const rejectAll = () => {
  diffBlocks.value.forEach(block => {
    if (block.type !== 'unchanged') {
      block.accepted = false
    }
  })
  ElMessage.success('已拒绝所有修改')
}

// 应用修改到编辑器
const applyChanges = () => {
  if (!generatedText.value) {
    ElMessage.warning('没有可应用的内容')
    return
  }

  if (editMode.value === 'selection' && props.selectedText) {
    // 如果是选中模式，根据 diff 结果组装最终文本
    let finalText = ''
    diffBlocks.value.forEach(block => {
      if (block.type === 'unchanged') {
        finalText += block.lines.join('\n') + '\n'
      } else if (block.type === 'added' && block.accepted) {
        finalText += block.lines.join('\n') + '\n'
      } else if (block.type === 'removed' && !block.accepted) {
        finalText += block.lines.join('\n') + '\n'
      }
    })
    emit('replace-text', finalText.trim())
  } else {
    // 生成模式，直接插入
    emit('insert-text', generatedText.value)
  }

  dialogVisible.value = false
  emit('clear-selection')
  ElMessage.success('已应用到编辑器')
}

// 拒绝所有并关闭
const rejectAndClose = () => {
  dialogVisible.value = false
  emit('clear-selection')
}

// 清除选中的文本
const clearSelectedText = () => {
  emit('clear-selection')
  originalText.value = ''
}

// 处理键盘事件
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    if (!isGenerating.value && prompt.value.trim()) {
      generate()
    }
  }
}

// 监听对话框关闭
const handleClose = () => {
  emit('clear-selection')
  resetState()
}

// 暴露方法给父组件
defineExpose({
  open,
  openWithSelection
})
</script>

<template>
  <el-dialog v-model="dialogVisible" width="850px" :close-on-click-modal="false" :show-close="false" class="ai-cursor-dialog"
    @close="handleClose">
    <!-- 自定义头部 -->
    <template #header>
      <div class="ai-header">
        <div class="ai-header-left">
          <div class="ai-logo">
            <el-icon :size="22">
              <MagicStick />
            </el-icon>
          </div>
          <div class="ai-title-section">
            <span class="ai-title">AI 助手</span>
            <span class="ai-subtitle">{{ editMode === 'selection' ? '智能改写' : '智能写作' }}</span>
          </div>
        </div>
        <div class="ai-header-actions">
          <button v-if="generatedText" class="ai-icon-btn" @click="resetState()" title="重新开始">
            <el-icon><Delete /></el-icon>
          </button>
          <button class="ai-icon-btn close" @click="dialogVisible = false">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>
    </template>

    <div class="ai-cursor-container">
      <!-- 快速操作栏 - 仅在未生成内容时显示 -->
      <div v-if="!generatedText && !isGenerating" class="quick-actions">
        <div v-for="action in quickActions" :key="action.label" class="quick-action-item"
          @click="useQuickAction(action)">
          <span class="quick-action-icon">{{ action.icon }}</span>
          <span class="quick-action-label">{{ action.label }}</span>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div ref="messagesContainer" class="messages-container">
        <!-- 选中的文本展示 -->
        <div v-if="editMode === 'selection' && originalText && !generatedText" class="original-text-section">
          <div class="section-title">
            <el-icon><Edit /></el-icon>
            待修改的文本
            <button class="clear-btn" @click="clearSelectedText">
              <el-icon><Close /></el-icon>
            </button>
          </div>
          <div class="original-content">
            <pre>{{ originalText }}</pre>
          </div>
        </div>

        <!-- AI 生成中 -->
        <div v-if="isGenerating" class="generating-section">
          <div class="generating-indicator">
            <el-icon class="is-loading" :size="24"><Loading /></el-icon>
            <span>AI 正在生成内容...</span>
          </div>
        </div>

        <!-- Diff 对比视图 -->
        <div v-if="generatedText && !isGenerating && editMode === 'selection'" class="diff-section">
          <!-- 顶部统计和操作栏 -->
          <div class="diff-toolbar">
            <div class="diff-stats">
              <span class="stat added">+{{ changeStats.added }} 行</span>
              <span class="stat removed">-{{ changeStats.removed }} 行</span>
            </div>
            <div class="diff-tabs">
              <button :class="['tab-btn', { active: activeTab === 'diff' }]" @click="activeTab = 'diff'">
                <el-icon><View /></el-icon>
                对比视图
              </button>
              <button :class="['tab-btn', { active: activeTab === 'preview' }]" @click="activeTab = 'preview'">
                <el-icon><Edit /></el-icon>
                预览
              </button>
            </div>
            <div class="diff-actions">
              <button class="action-link accept" @click="acceptAll">
                <el-icon><CircleCheck /></el-icon>
                全部接受
              </button>
              <button class="action-link reject" @click="rejectAll">
                <el-icon><CircleClose /></el-icon>
                全部拒绝
              </button>
            </div>
          </div>

          <!-- Diff 内容 -->
          <div v-if="activeTab === 'diff'" class="diff-content">
            <div
              v-for="(block, index) in diffBlocks"
              :key="index"
              :class="['diff-block', block.type, { 'not-accepted': !block.accepted }]"
              @click="block.type !== 'unchanged' && toggleBlock(index)"
            >
              <div class="diff-line-numbers">
                <template v-if="block.type === 'removed'">
                  <span v-for="(line, i) in block.lines" :key="i" class="line-num">-</span>
                </template>
                <template v-else-if="block.type === 'added'">
                  <span v-for="(line, i) in block.lines" :key="i" class="line-num">+</span>
                </template>
                <template v-else>
                  <span v-for="(line, i) in block.lines" :key="i" class="line-num">·</span>
                </template>
              </div>
              <div class="diff-lines">
                <div
                  v-for="(line, i) in block.lines"
                  :key="i"
                  class="diff-line"
                >
                  {{ line || ' ' }}
                </div>
              </div>
              <div v-if="block.type !== 'unchanged'" class="diff-status">
                <el-icon v-if="block.accepted" class="status-icon accepted"><CircleCheck /></el-icon>
                <el-icon v-else class="status-icon rejected"><CircleClose /></el-icon>
              </div>
            </div>
          </div>

          <!-- 预览视图 -->
          <div v-else class="preview-content">
            <pre>{{ generatedText }}</pre>
          </div>
        </div>

        <!-- 纯生成模式的结果 -->
        <div v-if="generatedText && !isGenerating && editMode === 'generate'" class="generate-result">
          <div class="section-title">
            <el-icon><MagicStick /></el-icon>
            AI 生成的内容
          </div>
          <div class="generated-content">
            <pre>{{ generatedText }}</pre>
          </div>
        </div>
      </div>

      <!-- 输入区域 - 仅在未生成内容时显示 -->
      <div v-if="!generatedText && !isGenerating" class="input-section">
        <div class="input-wrapper">
          <textarea
            v-model="prompt"
            class="ai-input-textarea"
            :rows="2"
            :placeholder="editMode === 'selection'
              ? '描述你想要的修改，或直接点击上方快捷操作...'
              : '输入你想要生成的内容，或描述你的需求...'"
            @keydown="handleKeydown"
          />
          <div class="input-actions">
            <span class="input-hint">Enter 发送 · Shift+Enter 换行</span>
            <button class="send-btn" :disabled="!prompt.trim()" @click="generate">
              <el-icon><Position /></el-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 - 生成完成后显示 -->
      <div v-if="generatedText && !isGenerating" class="bottom-actions">
        <button class="action-btn secondary" @click="rejectAndClose">
          <el-icon><CircleClose /></el-icon>
          放弃
        </button>
        <button v-if="editMode === 'selection'" class="action-btn secondary" @click="regenerate">
          <el-icon><RefreshRight /></el-icon>
          重新生成
        </button>
        <button
          :class="['action-btn', allAccepted ? 'primary' : 'warning']"
          @click="applyChanges"
        >
          <el-icon><Check /></el-icon>
          {{ editMode === 'selection' ? '应用修改' : '插入到编辑器' }}
          <span v-if="editMode === 'selection' && !allAccepted" class="pending-count">
            ({{ changeStats.added + changeStats.removed }} 处待确认)
          </span>
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
// Cursor 风格的颜色变量
$ai-purple: #8B5CF6;
$ai-purple-light: #A78BFA;
$ai-purple-dark: #7C3AED;
$bg-dark: #1E1E2E;
$bg-card: #252536;
$bg-hover: #2D2D44;
$text-primary: #E2E8F0;
$text-secondary: #94A3B8;
$border-color: #3D3D5C;

// Diff 颜色
$diff-added: #22C55E;
$diff-added-bg: rgba(34, 197, 94, 0.15);
$diff-removed: #EF4444;
$diff-removed-bg: rgba(239, 68, 68, 0.15);


:deep(.ai-cursor-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    margin: 0;
    padding: 0;
    border-bottom: 1px solid $border-color;
    background: $bg-dark;
  }

  .el-dialog__body {
    padding: 0;
    background: $bg-dark;
  }

  .el-dialog__headerbtn {
    display: none;
  }
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;

  .ai-header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .ai-logo {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, $ai-purple 0%, $ai-purple-dark 100%);
      border-radius: 10px;
      color: white;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    .ai-title-section {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .ai-title {
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
      }

      .ai-subtitle {
        font-size: 12px;
        color: $text-secondary;
      }
    }
  }

  .ai-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .ai-icon-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid $border-color;
      border-radius: 8px;
      color: $text-secondary;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: $bg-hover;
        color: $text-primary;
        border-color: $ai-purple;
      }

      &.close:hover {
        border-color: $diff-removed;
        color: $diff-removed;
      }
    }
  }
}

.ai-cursor-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

// 快速操作栏
.quick-actions {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid $border-color;
  overflow-x: auto;
  background: $bg-dark;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: 2px;
  }

  .quick-action-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background: $bg-hover;
      border-color: $ai-purple;
      transform: translateY(-1px);
    }

    .quick-action-icon {
      font-size: 14px;
    }

    .quick-action-label {
      font-size: 13px;
      color: $text-primary;
      font-weight: 500;
    }
  }
}

// 消息区域
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: $bg-dark;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: 3px;
  }
}

// 原始文本区域
.original-text-section {
  margin-bottom: 20px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 10px;

    .clear-btn {
      margin-left: auto;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: $text-secondary;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        background: $diff-removed-bg;
        color: $diff-removed;
      }
    }
  }

  .original-content {
    padding: 16px;
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 10px;

    pre {
      margin: 0;
      color: $text-primary;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: inherit;
    }
  }
}

// 生成中
.generating-section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;

  .generating-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    color: $ai-purple;
    font-size: 15px;
  }
}

// Diff 区域
.diff-section {
  .diff-toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: $bg-card;
    border: 1px solid $border-color;
    border-bottom: none;
    border-radius: 10px 10px 0 0;

    .diff-stats {
      display: flex;
      gap: 12px;

      .stat {
        font-size: 13px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 12px;

        &.added {
          background: $diff-added-bg;
          color: $diff-added;
        }

        &.removed {
          background: $diff-removed-bg;
          color: $diff-removed;
        }
      }
    }

    .diff-tabs {
      display: flex;
      gap: 4px;
      margin-left: auto;

      .tab-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        color: $text-secondary;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: $bg-hover;
          color: $text-primary;
        }

        &.active {
          background: $ai-purple;
          color: white;
        }
      }
    }

    .diff-actions {
      display: flex;
      gap: 12px;
      padding-left: 16px;
      border-left: 1px solid $border-color;

      .action-link {
        display: flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: none;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;

        &.accept {
          color: $diff-added;

          &:hover {
            color: lighten($diff-added, 10%);
          }
        }

        &.reject {
          color: $diff-removed;

          &:hover {
            color: lighten($diff-removed, 10%);
          }
        }
      }
    }
  }

  .diff-content {
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 0 0 10px 10px;
    max-height: 350px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color;
      border-radius: 3px;
    }

    .diff-block {
      display: flex;
      cursor: pointer;
      transition: all 0.15s;

      &:hover:not(.unchanged) {
        filter: brightness(1.1);
      }

      &.unchanged {
        .diff-line-numbers {
          background: rgba($text-secondary, 0.1);
        }
      }

      &.added {
        background: $diff-added-bg;

        .diff-line-numbers {
          background: rgba($diff-added, 0.2);
          color: $diff-added;
        }

        .diff-line {
          color: lighten($diff-added, 10%);
        }

        &.not-accepted {
          opacity: 0.4;
          background: transparent;

          .diff-line-numbers {
            background: rgba($diff-added, 0.1);
          }
        }
      }

      &.removed {
        background: $diff-removed-bg;

        .diff-line-numbers {
          background: rgba($diff-removed, 0.2);
          color: $diff-removed;
        }

        .diff-line {
          color: lighten($diff-removed, 10%);
        }

        &.not-accepted {
          opacity: 0.4;
          background: transparent;

          .diff-line-numbers {
            background: rgba($diff-removed, 0.1);
          }
        }
      }

      .diff-line-numbers {
        display: flex;
        flex-direction: column;
        width: 36px;
        padding: 4px 0;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;

        .line-num {
          height: 24px;
          line-height: 24px;
        }
      }

      .diff-lines {
        flex: 1;
        padding: 4px 12px;

        .diff-line {
          min-height: 24px;
          line-height: 24px;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }

      .diff-status {
        display: flex;
        align-items: center;
        padding: 0 12px;

        .status-icon {
          font-size: 18px;

          &.accepted {
            color: $diff-added;
          }

          &.rejected {
            color: $diff-removed;
          }
        }
      }
    }
  }

  .preview-content {
    padding: 20px;
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 0 0 10px 10px;
    max-height: 350px;
    overflow-y: auto;

    pre {
      margin: 0;
      color: $text-primary;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: inherit;
    }
  }
}

// 生成结果
.generate-result {
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 10px;
  }

  .generated-content {
    padding: 16px;
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 10px;

    pre {
      margin: 0;
      color: $text-primary;
      font-size: 14px;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: inherit;
    }
  }
}

// 输入区域
.input-section {
  padding: 16px 20px;
  border-top: 1px solid $border-color;
  background: $bg-dark;

  .input-wrapper {
    background: $bg-card;
    border: 1px solid $border-color;
    border-radius: 12px;
    padding: 12px;
    transition: border-color 0.2s;

    &:focus-within {
      border-color: $ai-purple;
    }

    .ai-input-textarea {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: $text-primary;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      font-family: inherit;

      &::placeholder {
        color: $text-secondary;
      }
    }

    .input-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;

      .input-hint {
        font-size: 11px;
        color: $text-secondary;
      }

      .send-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $ai-purple;
        border: none;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: $ai-purple-dark;
          transform: scale(1.05);
        }

        &:disabled {
          background: $bg-hover;
          color: $text-secondary;
          cursor: not-allowed;
        }
      }
    }
  }
}

// 底部操作栏
.bottom-actions {
  display: flex;
  gap: 10px;
  padding: 12px 20px 20px;
  background: $bg-dark;
  border-top: 1px solid $border-color;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    .el-icon {
      font-size: 14px;
    }

    .pending-count {
      font-size: 11px;
      opacity: 0.8;
    }

    &.primary {
      background: $diff-added;
      color: white;

      &:hover {
        background: darken($diff-added, 8%);
      }
    }

    &.warning {
      background: #F59E0B;
      color: white;

      &:hover {
        background: darken(#F59E0B, 8%);
      }
    }

    &.secondary {
      background: $bg-card;
      color: $text-primary;
      border: 1px solid $border-color;

      &:hover {
        background: $bg-hover;
        border-color: $ai-purple;
      }
    }
  }
}

// 手机端适配
@media (max-width: 768px) {
  :deep(.el-dialog.ai-cursor-dialog) {
    width: 95vw !important;
    max-width: 95vw !important;
    margin: 0 auto !important;
    border-radius: 12px !important;
    overflow: hidden;

    .el-dialog__body {
      padding: 0 !important;
    }
  }

  .ai-cursor-container {
    height: 85vh !important;
    max-height: 85vh !important;
    min-height: unset !important;
  }

  .ai-header {
    padding: 10px 12px;

    .ai-header-left {
      gap: 8px;

      .ai-logo {
        width: 32px;
        height: 32px;

        .el-icon {
          font-size: 18px;
        }
      }

      .ai-title-section {
        .ai-title {
          font-size: 14px;
        }

        .ai-subtitle {
          font-size: 11px;
        }
      }
    }

    .ai-header-actions {
      gap: 6px;

      .ai-icon-btn {
        width: 30px;
        height: 30px;
      }
    }
  }

  .quick-actions {
    padding: 10px 12px;
    gap: 6px;

    .quick-action-item {
      padding: 6px 10px;

      .quick-action-icon {
        font-size: 13px;
      }

      .quick-action-label {
        font-size: 12px;
      }
    }
  }

  .messages-container {
    padding: 12px;
  }

  .original-text-section {
    .original-content {
      padding: 12px;

      pre {
        font-size: 13px;
      }
    }
  }

  .diff-section {
    .diff-toolbar {
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 12px;

      .diff-stats {
        gap: 8px;

        .stat {
          font-size: 12px;
          padding: 3px 8px;
        }
      }

      .diff-tabs {
        margin-left: 0;
        order: 3;
        width: 100%;
        justify-content: center;

        .tab-btn {
          padding: 5px 12px;
          font-size: 12px;
        }
      }

      .diff-actions {
        padding-left: 0;
        border-left: none;
        margin-left: auto;

        .action-link {
          font-size: 12px;

          span {
            display: none;
          }

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }

    .diff-content {
      max-height: 250px;

      .diff-block {
        .diff-line-numbers {
          width: 28px;
          font-size: 11px;

          .line-num {
            height: 22px;
            line-height: 22px;
          }
        }

        .diff-lines {
          padding: 3px 8px;

          .diff-line {
            min-height: 22px;
            line-height: 22px;
            font-size: 13px;
          }
        }

        .diff-status {
          padding: 0 8px;

          .status-icon {
            font-size: 16px;
          }
        }
      }
    }

    .preview-content {
      padding: 16px;
      max-height: 250px;

      pre {
        font-size: 13px;
      }
    }
  }

  .generate-result {
    .generated-content {
      padding: 12px;

      pre {
        font-size: 13px;
      }
    }
  }

  .input-section {
    padding: 10px 12px;

    .input-wrapper {
      padding: 8px;

      .ai-input-textarea {
        font-size: 13px;
      }

      .input-actions {
        margin-top: 6px;

        .input-hint {
          font-size: 10px;
        }

        .send-btn {
          width: 30px;
          height: 30px;
        }
      }
    }
  }

  .bottom-actions {
    padding: 10px 12px;
    gap: 8px;

    .action-btn {
      padding: 8px 14px;
      font-size: 12px;

      .el-icon {
        font-size: 13px;
      }

      .pending-count {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog.ai-cursor-dialog) {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    border-radius: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }

  .ai-cursor-container {
    height: 90vh !important;
    max-height: 90vh !important;
  }

  .ai-header {
    padding: 8px 10px;

    .ai-header-left {
      .ai-logo {
        width: 28px;
        height: 28px;

        .el-icon {
          font-size: 16px;
        }
      }

      .ai-title-section {
        .ai-title {
          font-size: 13px;
        }

        .ai-subtitle {
          font-size: 10px;
        }
      }
    }

    .ai-header-actions {
      .ai-icon-btn {
        width: 28px;
        height: 28px;
      }
    }
  }

  .quick-actions {
    padding: 8px 10px;

    .quick-action-item {
      padding: 5px 8px;

      .quick-action-icon {
        font-size: 12px;
      }

      .quick-action-label {
        font-size: 11px;
      }
    }
  }

  .messages-container {
    padding: 10px;
  }

  .diff-section {
    .diff-toolbar {
      padding: 8px 10px;

      .diff-actions {
        gap: 8px;
      }
    }

    .diff-content {
      max-height: 200px;
    }

    .preview-content {
      max-height: 200px;
      padding: 12px;
    }
  }

  .input-section {
    padding: 8px 10px;

    .input-wrapper {
      padding: 6px;
    }
  }

  .bottom-actions {
    padding: 8px 10px;
    flex-wrap: wrap;

    .action-btn {
      flex: 1;
      min-width: 80px;
      justify-content: center;
      padding: 8px 10px;
    }
  }
}
</style>

<!-- 全局样式，用于覆盖 Element Plus 默认对话框样式 -->
<style lang="scss">
// 手机端适配 - 全局覆盖
@media (max-width: 768px) {
  .el-dialog.ai-cursor-dialog {
    width: 95vw !important;
    max-width: 95vw !important;
    margin: 0 auto !important;
    border-radius: 12px !important;

    .el-dialog__body {
      padding: 0 !important;
    }
  }
}

@media (max-width: 480px) {
  .el-dialog.ai-cursor-dialog {
    width: 100vw !important;
    max-width: 100vw !important;
    margin: 0 !important;
    border-radius: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
}
</style>