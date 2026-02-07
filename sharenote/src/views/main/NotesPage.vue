<script setup>
import {
  ref,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
  onActivated,
  onDeactivated
} from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css' // 高亮主题
import { Management } from '@element-plus/icons-vue'
import { baseURL } from '@/utils/request'
import Panzoom from '@panzoom/panzoom'
import VuePdfEmbed from 'vue-pdf-embed'

// 接收父组件传递的 props
const props = defineProps({
  isExpandDirectory: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  }
})

// const emit = defineEmits(['disabledDirectory'])

const isloading = ref(null)

const isImageType = ref(false)

// 图片类型列表（支持常见图片格式）
const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'ico']

const html = ref(null) // Markdown HTML
const toc = ref([]) // 目录

// 使用传递过来的 fileName，如果没有则使用默认值
const getFileName = ref(props.fileName || 'welcome.md')
const getFileType = ref(props.fileType.split('/')[1])
let headingCount = 0
// 用于保存所有创建的定时器 id，便于在停用/卸载时清理
const pendingTimeouts = []

// 触发disabledDirectory
// const triggerDisabledDirectory = () => {
//   emit('disabledDirectory')
// }

// 监听 fileName 的变化，当用户点击不同笔记时重新加载
watch(
  [() => props.fileName, () => props.fileType],
  ([newFileName, newFileType]) => {
    if (newFileName) {
      getFileName.value = newFileName
      // 处理 fileType，可能是 'image/png' 格式或直接的 'png' 格式
      const typeStr = newFileType || ''
      getFileType.value = typeStr.includes('/')
        ? typeStr.split('/')[1]
        : typeStr

      // 使用更完善的图片类型判断
      isImageType.value = imageTypes.includes(getFileType.value.toLowerCase())

      // 关键：清空 html 和 toc，重置状态
      html.value = null
      toc.value = []
      imageUrl.value = ''
      pdfUrl.value = ''
      destroyPanzoom()

      console.log(
        '文件名: ' +
          getFileName.value +
          '\n文件类型: ' +
          getFileType.value +
          '\n是否为图片: ' +
          isImageType.value
      )

      // 根据文件类型决定如何处理
      if (
        getFileType.value === 'octet-stream' ||
        getFileType.value === 'markdown'
      ) {
        // Markdown 文件
        loadMarkdownFile()
      } else if (getFileType.value === 'pdf') {
        // PDF 文件
        console.log('这是PDF文件，立即关闭目录')
        loadPdfFile()
        // 立即关闭目录
        const _pdfTid = setTimeout(() => {
          console.log('PDF文件：强制执行 toggleDirectoryStatus(false)')
          toggleDirectoryStatus(false)
        }, 200)
        pendingTimeouts.push(_pdfTid)
      } else if (isImageType.value) {
        // 图片文件
        console.log('这是图片文件，立即关闭目录')
        loadImageFile()
        // 立即关闭目录
        const _imgTid = setTimeout(() => {
          console.log('图片文件：强制执行 toggleDirectoryStatus(false)')
          toggleDirectoryStatus(false)
        }, 200)
        pendingTimeouts.push(_imgTid)
      } else {
        // 未知文件类型，显示空状态
        console.log('未知文件类型:', getFileType.value)
        isloading.value = false
      }
    }
  }
)

// 加载 Markdown 文件的函数
const loadMarkdownFile = async () => {
  try {
    isloading.value = true
    const res = await fetch(`${baseURL}/upload/files/${getFileName.value}`)

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const markdownText = await res.text()

    // 清空目录数组，重置计数器
    toc.value = []
    headingCount = 0

    // 1. 用 lexer 拿到 token 列表
    const tokens = marked.lexer(markdownText)

    // 2. 遍历 tokens，生成 HTML
    const htmlArr = tokens.map((token) => {
      if (token.type === 'heading') {
        const id = `heading-${headingCount++}`
        toc.value.push({
          level: token.depth,
          text: token.text,
          id
        })
        return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>`
      } else {
        // 其他 token 用 parser 渲染
        return marked.parser([token])
      }
    })

    html.value = htmlArr.join('')

    // 3. 高亮代码块（延迟以确保 DOM 就绪），并记录定时器以便清理
    const _hlTid = setTimeout(() => {
      document.querySelectorAll('.markdown-body pre code').forEach((block) => {
        block.classList.add('hljs')
        hljs.highlightElement(block)
      })
    })
    pendingTimeouts.push(_hlTid)
  } catch (error) {
    console.error('加载文件失败:', error)
    html.value = '<p>文件加载失败，请检查文件是否存在。</p>'
    // 加载失败时也要清空目录
    toc.value = []
  } finally {
    isloading.value = false
  }
}

const imageUrl = ref('')
const panzoomInstance = ref(null)
const wheelHandler = ref(null)

// 初始化 Panzoom 的独立函数（供加载和 keep-alive 恢复时使用）
const initPanzoomForImage = () => {
  const imgEl = document.querySelector('#panzoomImg')
  if (!imgEl) return

  // 销毁旧实例
  if (panzoomInstance.value) {
    try {
      panzoomInstance.value.destroy()
    } catch {
      // ignore
    }
    panzoomInstance.value = null
  }

  // 移除旧的事件监听
  if (wheelHandler.value && imgEl.parentElement) {
    imgEl.parentElement.removeEventListener('wheel', wheelHandler.value)
    wheelHandler.value = null
  }

  // 初始化 Panzoom
  panzoomInstance.value = Panzoom(imgEl, {
    maxScale: 5,
    minScale: 0.1
  })

  // 使用绑定后的 handler，便于移除
  wheelHandler.value = panzoomInstance.value.zoomWithWheel.bind(
    panzoomInstance.value
  )
  imgEl.parentElement.addEventListener('wheel', wheelHandler.value)
}

// 加载图片的函数
const loadImageFile = async () => {
  try {
    isloading.value = true
    imageUrl.value = `${baseURL}/upload/files/${getFileName.value}`

    await nextTick()

    const imgEl = document.querySelector('#panzoomImg')
    if (!imgEl) {
      isloading.value = false
      return
    }

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      initPanzoomForImage()
      isloading.value = false
    } else {
      imgEl.onload = () => {
        initPanzoomForImage()
        isloading.value = false
      }
      imgEl.onerror = () => {
        console.error('图片加载失败:', imageUrl.value)
        isloading.value = false
      }
    }
  } catch (error) {
    console.error('加载图片失败:', error)
    isloading.value = false
  }
}

// 在组件被激活时（keep-alive 恢复）重新初始化 DOM 相关行为
onActivated(() => {
  nextTick(() => {
    try {
      // 恢复目录状态（如果需要）
      if (props.isExpandDirectory !== undefined) {
        toggleDirectoryStatus(props.isExpandDirectory)
      }

      // 重新初始化图片的 panzoom（因为 keep-alive 恢复后 DOM 需要重新绑定）
      if (isImageType.value && imageUrl.value) {
        // 延迟一点等待 DOM 完全恢复
        const _reactivateTid = setTimeout(() => {
          initPanzoomForImage()
        }, 100)
        pendingTimeouts.push(_reactivateTid)
      }
    } catch (e) {
      console.error('onActivated 恢复失败', e)
    }
  })
})

// 在组件停用或卸载时清理定时器和事件，防止累积导致卡死
const clearAllTimeouts = () => {
  while (pendingTimeouts.length) {
    const id = pendingTimeouts.pop()
    clearTimeout(id)
  }
}

const destroyPanzoom = () => {
  try {
    const imgEl = document.querySelector('#panzoomImg')
    if (imgEl && wheelHandler.value) {
      imgEl.parentElement.removeEventListener('wheel', wheelHandler.value)
      wheelHandler.value = null
    }
  } catch {
    // ignore
  }
  if (panzoomInstance.value) {
    try {
      panzoomInstance.value.destroy()
    } catch {
      // ignore
    }
    panzoomInstance.value = null
  }
}

onDeactivated(() => {
  clearAllTimeouts()
  destroyPanzoom()
})

onBeforeUnmount(() => {
  clearAllTimeouts()
  destroyPanzoom()
})

const pdfUrl = ref('')
const loadPdfFile = () => {
  pdfUrl.value = `${baseURL}/upload/files/${getFileName.value}`
}

onMounted(() => {
  // 初始化文件类型
  if (props.fileType) {
    const typeStr = props.fileType
    getFileType.value = typeStr.includes('/')
      ? typeStr.split('/')[1]
      : typeStr
    isImageType.value = imageTypes.includes(getFileType.value.toLowerCase())
  }

  // 如果有传入的文件名，使用传入的；否则使用默认的
  if (props.fileName) {
    console.log('初始化文件:', props.fileName, '类型:', getFileType.value)
    getFileName.value = props.fileName

    // 根据文件类型加载对应内容
    if (
      getFileType.value === 'octet-stream' ||
      getFileType.value === 'markdown'
    ) {
      loadMarkdownFile()
    } else if (getFileType.value === 'pdf') {
      loadPdfFile()
      const _pdfTid = setTimeout(() => {
        toggleDirectoryStatus(false)
      }, 200)
      pendingTimeouts.push(_pdfTid)
    } else if (isImageType.value) {
      loadImageFile()
      const _imgTid = setTimeout(() => {
        toggleDirectoryStatus(false)
      }, 200)
      pendingTimeouts.push(_imgTid)
    } else {
      // 默认加载 markdown
      loadMarkdownFile()
    }
  } else {
    // 没有文件名时加载默认 markdown
    loadMarkdownFile()
  }

  // 确保目录初始状态正确
  nextTick(() => {
    if (props.isExpandDirectory !== undefined) {
      toggleDirectoryStatus(props.isExpandDirectory)
    }
  })
})
// 点击目录平滑滚动
const scrollTo = (id) => {
  const el = document.getElementById(id) // 用户点击的元素
  const container = document.querySelector('.markdown-body') // 滚动的视窗
  // 如果元素不存在则返回
  if (!el || !container) return

  // 顶部预留（如果有固定 header，改成实际高度，比如 60）
  const topOffset = 20

  // 计算 el 和 container 的相对于页面的位置
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  // el 相对于 container 的 top + 当前滚动 - offset
  // .top当于是按照容器展开时的样子计算
  // 那么elRect.top - containerRect.top得到的是elRect.top到容器可视区域的顶部
  // 但是说不定现在前面还有被卷起的元素，所以要加上contain.scrollTop
  // 然后不想这么贴近容器顶部，所以就往下滚动一点topOffset
  const target =
    elRect.top - containerRect.top + container.scrollTop - topOffset

  container.scrollTo({
    top: target,
    behavior: 'smooth'
  })
}

// 点击对应标签的id
const activeId = ref(null)

const markdownBodyRef = ref(null)
const directoryRef = ref(null)
// 目录的收起和展开
const toggleDirectoryStatus = (isExpandValue) => {
  console.log('toggleDirectoryStatus 被调用，参数:', isExpandValue)

  // 检查 DOM 元素是否已经渲染
  if (!markdownBodyRef.value || !directoryRef.value) {
    console.log('DOM 元素未渲染，跳过目录状态切换')
    return
  }

  console.log('切换目录状态:', isExpandValue)

  markdownBodyRef.value.style.width = isExpandValue ? '70%' : '100%'
  directoryRef.value.style.width = isExpandValue ? '30%' : '0%'
  directoryRef.value.style.padding = isExpandValue ? '15px 20px' : '0px'
  directoryRef.value.style.borderLeft = isExpandValue
    ? '2px solid rgb(215, 221, 227)'
    : 'none'

  console.log('目录宽度设置为:', directoryRef.value.style.width)
  console.log('内容区宽度设置为:', markdownBodyRef.value.style.width)
}

// 监听isExpandDirectory的变化
watch(
  () => props.isExpandDirectory,
  (newValue, oldValue) => {
    console.log('子组件监听到目录状态变化:', oldValue, '->', newValue)
    console.log('当前文件类型:', props.fileType)

    // 如果当前文件是 PDF，强制不显示目录
    if (props.fileType && props.fileType.includes('pdf')) {
      console.log('PDF文件，强制关闭目录')
      const _pdfTid2 = setTimeout(() => {
        console.log('执行 toggleDirectoryStatus(false)')
        toggleDirectoryStatus(false)
      }, 100)
      pendingTimeouts.push(_pdfTid2)
      return
    }

    // 使用 setTimeout 确保 DOM 完全渲染
    const _tid = setTimeout(() => {
      console.log('执行 toggleDirectoryStatus(' + newValue + ')')
      toggleDirectoryStatus(newValue)
    }, 100)
    pendingTimeouts.push(_tid)
  },
  { immediate: true }
)
</script>

<template>
  <div class="wrapper">
    <!-- Markdown主内容 -->
    <div
      class="markdown-body"
      v-html="html"
      v-if="html !== null"
      ref="markdownBodyRef"
      v-loading="isloading"
    ></div>

    <!-- 图片内容 -->
    <div
      class="markdown-body"
      v-else-if="isImageType"
      ref="markdownBodyRef"
      v-loading="isloading"
    >
      <div class="panzoom-wrapper">
        <img id="panzoomImg" :src="imageUrl" alt="image" />
      </div>
    </div>

    <!-- PDF -->
    <div
      class="markdown-body"
      v-else-if="getFileType === 'pdf'"
      ref="markdownBodyRef"
      v-loading="isloading"
    >
      <div class="vue-pdf-embed-wrapper">
        <VuePdfEmbed
          :source="pdfUrl"
          class="pdf-component"
          style="width: 100%"
        />
      </div>
    </div>
    <!-- 没有内容时的markdown-body -->
    <div
      class="markdown-body"
      v-else
      style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "
      v-loading="isloading"
    >
      <el-icon :size="50" color="rgba(31, 32, 34, 0.5)"><Management /></el-icon>
      <p style="margin: 0; padding: 0; color: rgba(31, 32, 34, 0.5)">
        空空如也~
      </p>
      <p style="color: rgba(31, 32, 34, 0.5)">快去上传内容吧</p>
    </div>
    <!-- 目录 -->
    <div class="directory" ref="directoryRef">
      <ul v-if="toc.length > 0">
        <!-- 遍历 toc 中的每一项 -->
        <li
          v-for="item in toc"
          :key="item.id"
          :style="{ paddingLeft: (item.level - 1) * 16 + 'px' }"
          @click="
            () => {
              activeId = item.id
              scrollTo(item.id)
            }
          "
        >
          <!-- :style="{ marginLeft: (item.level - 1) * 16 + 'px' }": 根据标题层级缩进 -->
          <!-- 点击跳转到对应标题 -->
          <!-- 显示标题文字 -->
          <p :class="{ active: item.id === activeId }">{{ item.text }}</p>
        </li>
      </ul>
      <p v-else style="color: rgba(31, 32, 34, 0.5); text-align: center">
        空空如也
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css';
.wrapper {
  color: white;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  // background: rgb(3, 6, 23);
  background: rgb(255, 255, 255);
  // background-color: pink;
  flex-grow: 0;
  .markdown-body {
    height: 100%;
    width: 70%; /* 与 JavaScript 中的 70% 保持一致 */
    overflow-y: auto;
    box-sizing: border-box;
    flex-grow: 0;
    padding: 25px;
    background: rgb(255, 255, 255);
    border-radius: 0px;
    overscroll-behavior: contain;
    // position: absolute;
    transition: 0.5s;
  }

  /* 整个滚动条 */
  .markdown-body::-webkit-scrollbar:hover {
    width: 10px; /* 垂直滚动条宽度 */
    height: 10px; /* 横向滚动条高度 */
  }

  /* 滚动条滑块（可拖动部分） */
  .markdown-body::-webkit-scrollbar-thumb:hover {
    background-color: rgb(127, 127, 127);
    border-radius: 6px;
  }

  /* 滚动条轨道 */
  .markdown-body::-webkit-scrollbar-track:hover {
    background-color: transparent;
    border: none;
    border-radius: 6px;
  }

  .directory {
    height: 100%;
    width: 25%; /* 这是默认展开状态的宽度 */
    overflow-y: auto;
    background-color: rgb(255, 255, 255);
    border-left: 2px solid rgb(215, 221, 227);
    box-sizing: border-box;
    padding: 15px 20px;
    transition: 0.5s;
    display: flex;
    /* 确保初始状态正确 */
    min-width: 0; /* 允许宽度缩小到0 */
    ul {
      width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      // flex-shrink: 0;
      li {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        // max-width: 150px;
        width: 100%;
        list-style: none;
        color: rgba(31, 32, 34, 0.5);
        font-size: 15px;
        box-sizing: border-box;
        p {
          margin: 5px 0;
          box-sizing: border-box;
          overflow-wrap: break-word;
          word-break: break-all;
          transition: background-color 0.2s; // 加个过渡动画体验更好
          width: 100%;
        }

        p:hover {
          background-color: rgba(21, 187, 129, 0.1);
          border-radius: 5px;
        }

        .active {
          color: rgb(0, 107, 75);
          background-color: rgba(21, 187, 129, 0.2);
          border-radius: 5px;
          border-left: 3px solid rgba(21, 187, 129, 1);
        }
      }
    }
  }
}

.panzoom-wrapper {
  // background-color: pink; // 调试完成后可以去掉背景色
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center; // 水平居中
  align-items: center; // 垂直居中
  box-sizing: border-box;
}

.panzoom-wrapper img {
  max-width: 100%;
  max-height: 100%;
  user-select: none;
  cursor: grab;

  /* 新增/修改如下属性 */
  display: block; // 防止 inline 元素底部的留白
  margin: auto; // 配合 flex 使用
  object-fit: contain; // 保持比例
  box-sizing: border-box; // 防止 padding 计算错误
}
.markdown-body {
  .vue-pdf-embed-wrapper {
    :deep(.vue-pdf-embed__page) {
      box-sizing: border-box;
      width: 100%;
      // height: 100%;
      display: flex;
      // padding: 0 50px;
      justify-content: center;
      canvas {
        max-width: 100%;
        height: auto !important;
      }
    }
  }
}

// 手机端的适配
@media (max-width: 768px) {
  .wrapper {
    .markdown-body {
      width: 0px;
    }
    .directory {
      width: 100%;
    }
  }
}
</style>
