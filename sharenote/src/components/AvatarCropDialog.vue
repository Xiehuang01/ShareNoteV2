<script setup>
import { ref, watch, nextTick } from 'vue'
import { Upload, ZoomIn, ZoomOut, RefreshLeft } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// 图片变换状态
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

// 重置变换
const resetTransform = () => {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// 监听对话框打开，重置变换
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => {
      resetTransform()
    })
  }
})

// 计算变换样式
const imageStyle = ref({})
watch([scale, translateX, translateY], () => {
  imageStyle.value = {
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
  }
})

// 放大
const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.1, 3)
  }
}

// 缩小
const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(scale.value - 0.1, 0.5)
  }
}

// 重置
const resetZoom = () => {
  resetTransform()
}

// 触摸/鼠标按下
const handleMouseDown = (e) => {
  isDragging.value = true
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  startX.value = clientX - translateX.value
  startY.value = clientY - translateY.value
  e.preventDefault()
}

// 触摸/鼠标移动
const handleMouseMove = (e) => {
  if (isDragging.value) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    translateX.value = clientX - startX.value
    translateY.value = clientY - startY.value
  }
}

// 触摸/鼠标松开
const handleMouseUp = () => {
  isDragging.value = false
}

// 鼠标滚轮缩放
const handleWheel = (e) => {
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 双指缩放相关
const lastDistance = ref(0)

// 触摸开始（双指缩放）
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    // 双指缩放
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    lastDistance.value = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
  } else if (e.touches.length === 1) {
    // 单指拖拽
    handleMouseDown(e)
  }
}

// 触摸移动（双指缩放）
const handleTouchMove = (e) => {
  if (e.touches.length === 2) {
    // 双指缩放
    e.preventDefault()
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    
    if (lastDistance.value > 0) {
      const delta = distance - lastDistance.value
      if (delta > 0) {
        // 放大
        scale.value = Math.min(scale.value + 0.02, 3)
      } else if (delta < 0) {
        // 缩小
        scale.value = Math.max(scale.value - 0.02, 0.5)
      }
    }
    
    lastDistance.value = distance
  } else if (e.touches.length === 1) {
    // 单指拖拽
    handleMouseMove(e)
  }
}

// 触摸结束
const handleTouchEnd = (e) => {
  if (e.touches.length < 2) {
    lastDistance.value = 0
  }
  if (e.touches.length === 0) {
    handleMouseUp()
  }
}

// 关闭对话框
const handleClose = () => {
  if (!props.loading) {
    emit('update:modelValue', false)
    emit('cancel')
  }
}

// 获取裁剪后的图片
const getCroppedImage = () => {
  return new Promise((resolve, reject) => {
    try {
      // 创建 canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置输出尺寸（圆形头像，建议 400x400）
      const outputSize = 400
      canvas.width = outputSize
      canvas.height = outputSize
      
      // 创建图片对象
      const img = new Image()
      img.crossOrigin = 'anonymous' // 处理跨域
      img.src = props.imageUrl
      
      img.onload = () => {
        // 清空画布
        ctx.clearRect(0, 0, outputSize, outputSize)
        
        // 创建圆形裁剪路径
        ctx.save()
        ctx.beginPath()
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        
        // 预览容器的尺寸
        const containerSize = 350
        
        // 计算图片在容器中的实际渲染尺寸（模拟 object-fit: cover）
        const imgAspect = img.width / img.height
        
        let baseWidth, baseHeight
        
        if (imgAspect > 1) {
          // 图片更宽，以容器高度为准
          baseHeight = containerSize
          baseWidth = containerSize * imgAspect
        } else {
          // 图片更高或等比，以容器宽度为准
          baseWidth = containerSize
          baseHeight = containerSize / imgAspect
        }
        
        // 应用用户的缩放（从中心缩放）
        const scaledWidth = baseWidth * scale.value
        const scaledHeight = baseHeight * scale.value
        
        // 计算图片的初始位置（居中）
        const baseX = (containerSize - baseWidth) / 2
        const baseY = (containerSize - baseHeight) / 2
        
        // 缩放后的位置调整（保持中心点不变）
        const scaledX = baseX - (scaledWidth - baseWidth) / 2
        const scaledY = baseY - (scaledHeight - baseHeight) / 2
        
        // 加上用户的平移
        const finalX = scaledX + translateX.value
        const finalY = scaledY + translateY.value
        
        // 映射到输出 canvas
        const ratio = outputSize / containerSize
        const canvasX = finalX * ratio
        const canvasY = finalY * ratio
        const canvasWidth = scaledWidth * ratio
        const canvasHeight = scaledHeight * ratio
        
        // 绘制图片
        ctx.drawImage(img, canvasX, canvasY, canvasWidth, canvasHeight)
        
        ctx.restore()
        
        // 转换为 Blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Canvas to Blob 转换失败'))
          }
        }, 'image/png', 0.95)
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 确认上传
const handleConfirm = async () => {
  emit('confirm', { getCroppedImage })
}
</script>

<template>
  <el-dialog
    class="avatar-crop-dialog"
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    title="上传头像"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="!loading"
    :show-close="!loading"
    @close="handleClose"
  >
    <div class="avatar-crop-container">
      <div class="crop-tip">
        <el-icon><Upload /></el-icon>
        <p>调整图片位置和大小（上传后将自动裁剪为圆形）</p>
      </div>

      <!-- 预览区域 -->
      <div 
        class="preview-wrapper"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @wheel="handleWheel"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div class="preview-container">
          <img 
            :src="imageUrl" 
            alt="预览" 
            class="preview-image"
            :style="imageStyle"
            draggable="false"
          />
          <div class="circle-overlay"></div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <el-button-group>
          <el-button @click="zoomOut" :disabled="scale <= 0.5">
            <el-icon><ZoomOut /></el-icon>
            缩小
          </el-button>
          <el-button @click="resetZoom">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button @click="zoomIn" :disabled="scale >= 3">
            <el-icon><ZoomIn /></el-icon>
            放大
          </el-button>
        </el-button-group>
        <div class="scale-info">缩放: {{ (scale * 100).toFixed(0) }}%</div>
      </div>

      <!-- <div class="usage-tip">
        <p>💡 提示：</p>
        <ul>
          <li>鼠标拖拽可移动图片位置</li>
          <li>鼠标滚轮可缩放图片</li>
          <li>点击按钮也可以控制缩放</li>
        </ul>
      </div> -->
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="loading">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :loading="loading"
        >
          {{ loading ? '上传中...' : '确认上传' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
/* 不使用 scoped，确保样式能覆盖 Element Plus */

/* 遮罩层样式 */
.el-overlay {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

/* 对话框样式 */
.avatar-crop-dialog.el-dialog {
  background-color: rgb(8, 15, 32) !important;
  border: 2px solid rgb(20, 31, 48);
  margin: auto !important;
  top: 50% !important;
  transform: translateY(-50%) !important;

  .el-dialog__header {
    background-color: rgb(8, 15, 32) !important;
    border-bottom: 1px solid rgb(20, 31, 48);
    padding: 20px;

    .el-dialog__title {
      color: white !important;
      font-size: 18px;
      font-weight: bold;
    }

    .el-dialog__headerbtn {
      .el-dialog__close {
        color: rgb(148, 163, 184) !important;
        
        &:hover {
          color: rgb(21, 187, 129) !important;
        }
      }
    }
  }

  .el-dialog__body {
    background-color: rgb(8, 15, 32) !important;
    padding: 30px 20px;
  }

  .el-dialog__footer {
    background-color: rgb(8, 15, 32) !important;
    border-top: 1px solid rgb(20, 31, 48);
    padding: 15px 20px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .avatar-crop-dialog.el-dialog {
    width: 95vw !important;
    margin: 0 !important;

    .el-dialog__header {
      padding: 15px;

      .el-dialog__title {
        font-size: 16px;
      }
    }

    .el-dialog__body {
      padding: 15px 10px;
    }

    .el-dialog__footer {
      padding: 10px 15px;
    }
  }
}
</style>

<style lang="scss" scoped>
/* 组件内部样式使用 scoped */

.avatar-crop-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  .crop-tip {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgb(148, 163, 184);
    font-size: 14px;
    text-align: center;

    .el-icon {
      font-size: 20px;
      color: rgb(21, 187, 129);
    }

    p {
      margin: 0;
    }
  }

  .preview-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    cursor: move;
    user-select: none;
    touch-action: none; // 禁用浏览器默认触摸行为

    .preview-container {
      position: relative;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgb(21, 187, 129);
      box-shadow: 0 0 30px rgba(21, 187, 129, 0.3);
      background-color: rgb(3, 6, 23);

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.1s ease-out;
        pointer-events: none;
      }

      .circle-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        pointer-events: none;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;

    .el-button-group {
      display: flex;
      gap: 0;

      .el-button {
        background-color: rgba(30, 41, 59, 0.5);
        border-color: rgb(57, 70, 94);
        color: rgb(148, 163, 184);
        transition: all 0.3s;

        &:hover:not(:disabled) {
          background-color: rgba(21, 187, 129, 0.1);
          border-color: rgb(21, 187, 129);
          color: rgb(21, 187, 129);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .el-icon {
          margin-right: 5px;
        }
      }
    }

    .scale-info {
      color: rgb(21, 187, 129);
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .el-button {
    &:not(.el-button--primary) {
      background-color: transparent;
      border-color: rgb(57, 70, 94);
      color: rgb(148, 163, 184);

      &:hover:not(:disabled) {
        border-color: rgb(84, 99, 121);
        color: rgb(255, 255, 255);
        background-color: rgba(30, 41, 59, 0.5);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.el-button--primary {
      background-color: rgb(21, 187, 129);
      border-color: rgb(21, 187, 129);
      color: rgb(3, 6, 23);

      &:hover:not(:disabled) {
        background-color: rgb(51, 196, 144);
        border-color: rgb(51, 196, 144);
      }

      &.is-loading {
        opacity: 0.7;
      }
    }
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .avatar-crop-container {
    gap: 15px;

    .crop-tip {
      font-size: 12px;
      flex-direction: column;
      gap: 5px;

      .el-icon {
        font-size: 18px;
      }
    }

    .preview-wrapper {
      padding: 10px;

      .preview-container {
        width: 280px;
        height: 280px;
        border: 3px solid rgb(21, 187, 129);
      }
    }

    .controls {
      .el-button-group {
        width: 100%;

        .el-button {
          flex: 1;
          font-size: 12px;
          padding: 8px 10px;

          .el-icon {
            margin-right: 3px;
          }
        }
      }

      .scale-info {
        font-size: 13px;
      }
    }
  }

  .dialog-footer {
    .el-button {
      flex: 1;
    }
  }
}

@media (max-width: 480px) {
  .avatar-crop-container {
    .preview-wrapper {
      .preview-container {
        width: 240px;
        height: 240px;
      }
    }

    .controls {
      .el-button-group {
        .el-button {
          font-size: 11px;
          padding: 6px 8px;

          span {
            display: none; // 隐藏文字，只显示图标
          }

          .el-icon {
            margin-right: 0;
          }
        }
      }
    }
  }
}
</style>

