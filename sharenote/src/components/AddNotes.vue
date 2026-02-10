<script setup>
import { ref } from 'vue'
import { UploadFilled, Upload, Delete } from '@element-plus/icons-vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores/user'
// import { ElMessageBox } from 'element-plus'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

const emit = defineEmits(['upload-complete'])

const mask = ref(null)
const addNote = ref(null)
const uploadFileRef = ref(null)
const form = ref(null)
const uploadFilesList = ref([])
const confirmMarkdownUpload = ref(false)
const confirmMarkdownUploadRef = ref(false)
const userStore = useUserStore()
const uploadloading = ref(false) // 加载状态

const formModel = ref({
  filename: '',
  file: null
})
const uploadSuccessCount = ref(0) // 上传成功的文件数
const totalFilesToUpload = ref(0) // 需要上传的总文件数

const clearFormModelcache = () => {
  formModel.value = {
    filename: '',
    file: null
  }
  confirmMarkdownUpload.value = false
  uploadSuccessCount.value = 0
  totalFilesToUpload.value = 0
}

const rules = {
  filename: [
    { required: true, message: '文件名不能为空', trigger: 'blur' },
    // 检验是否为空格
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') callback(new Error('文件名不合规'))
        else callback()
      },
      // trigger: 'blur'--只有当失去焦点的时候才触发
      trigger: 'blur'
    }
  ]
}
// 关闭添加笔记
const turnoffAddNote = () => {
  clearFormModelcache() // 清空数据防止回填
  uploadFileRef.value.clearFiles() // 清空文件列表
  form.value.resetFields() // 清空表单
  addNote.value.style.display = 'none'
  mask.value.style.display = 'none'
  uploadloading.value = false
}
// 开启添加笔记
const turnonAddNote = () => {
  addNote.value.style.display = 'flex'
  mask.value.style.display = 'flex'
}

// 文件上传前的钩子
const beforeUploadFiles = (file) => {
  console.log(file)
}

// 文件上传前的校验
const validateFiles = async (isForce) => {
  // 判断用户是否上传了文件
  if (uploadFilesList.value.length === 0) {
    uploadloading.value = false
    ElMessage.error('没有上传文件')
    return false
  }
  const AllMarkdownFiles = uploadFilesList.value.filter((item) =>
    item.name.endsWith('.md')
  )
  const AllPdfFiles = uploadFilesList.value.filter((item) =>
    item.name.endsWith('.pdf')
  )
  const picFormat = ['.png', '.jpg', '.jpeg']
  const AllPicFiles = uploadFilesList.value.filter((item) =>
    picFormat.some((i) => item.name.toLowerCase().endsWith(i))
  )
  console.log(
    'beforeUpload' + AllMarkdownFiles.length,
    AllPdfFiles.length,
    AllPicFiles.length
  )

  // 判断上传的Markdown文件是否超出数量
  if (AllMarkdownFiles.length > 1) {
    ElMessage.error('只能上传一个Markdown文件')
    uploadloading.value = false
    return false
  }
  // 判断上传的Markdown文件是否超出数量
  if (AllPdfFiles.length > 1) {
    ElMessage.error('只能上传一个pdf文件')
    uploadloading.value = false
    return false
  }
  // 上传了Markdown文件不能上传pdf文件
  if (AllMarkdownFiles.length === 1) {
    if (AllPdfFiles.length !== 0) {
      ElMessage.warning('MarkDown文件和pdf文件不能同时上传')
      uploadloading.value = false
      return false
    }
    // 用户没有上传图片时
    if (AllPicFiles.length === 0) {
      if (isForce === 'noForce') {
        confirmMarkdownUpload.value = !confirmMarkdownUpload.value
        uploadloading.value = false
        return false
        // 这是confirmMarkdownUploadBtn会显示出来，就等待uploadClicked('force')的时候显示
      }
      if (isForce === 'force') return true
    }
    // 符合用户的上传要求
    return true
  }
  //   上传了pdf文件不能上传Markdown和image文件
  else if (AllPdfFiles.length === 1) {
    // 用户上传了pdf以外的文件
    if (uploadFilesList.value.length !== 1) {
      ElMessage.warning('pdf文件不能与其他文件同时上传')
      uploadloading.value = false
      return false
    }
    // 用户只上传了pdf文件
    return true
  } else if (AllPicFiles.length !== 1) {
    ElMessage.warning('暂不支持上传图集')
    uploadloading.value = false
    return false
  } else {
    return true
  }
}

// 文件上传成功的回调
const handleUploadSuccess = (response, file, fileList) => {
  console.log('文件上传成功:', file.name, fileList)
  uploadSuccessCount.value++

  // 当所有文件都上传成功后，发送完成事件
  if (uploadSuccessCount.value === totalFilesToUpload.value) {
    ElMessage.success('所有文件上传成功')
    confirmMarkdownUpload.value = false
    turnoffAddNote()
    emit('upload-complete') // 发送上传完成事件
  }
}

// 文件上传失败的回调
const handleUploadError = (error, file, fileList) => {
  uploadloading.value = false
  console.error('文件上传失败:', file.name, error, fileList)
  ElMessage.error(`文件 ${file.name} 上传失败`)
}

// 上传确认上传
const uploadClicked = async (ifForce) => {
  uploadloading.value = true
  // 文件名表单校验
  try {
    await form.value.validate()
  } catch (err) {
    console.error('表单校验失败:', err)
    // 校验失败，不继续上传，也不关闭弹窗
    uploadloading.value = false
    return
  }
  // 打印已经上传的文件
  console.log(uploadFilesList.value)
  // 文件上传校验
  const validateFilesRes = await validateFiles(ifForce)
  console.log(validateFilesRes)
  if (validateFilesRes) {
    // 重置计数器
    uploadSuccessCount.value = 0
    totalFilesToUpload.value = uploadFilesList.value.length
    console.log('开始上传，总文件数:', totalFilesToUpload.value)
    uploadFileRef.value.submit()
  } else console.log('上传错误:', validateFilesRes)
}

defineExpose({
  turnonAddNote
})
</script>

<template>
  <!-- 切换分组 -->
  <div id="addNote" ref="addNote">
    <el-form
      class="el-form"
      autocomplete="off"
      :model="formModel"
      :rules="rules"
      ref="form"
    >
      <!-- 笔记名 -->
      <div style="font-size: 15px; margin-bottom: 2px">笔记名称</div>
      <el-form-item prop="filename"
        ><el-input class="el-inp" v-model="formModel.filename"></el-input
      ></el-form-item>
      <!-- 文件上传 -->
      <div style="font-size: 15px; margin-bottom: 2px">文件上传</div>
      <el-upload
        ref="uploadFileRef"
        class="upload-demo"
        drag
        :headers="{ Authorization: userStore.token }"
        :data="{ fileCustomName: formModel.filename }"
        :action="`${baseURL}/uploadnotes`"
        multiple
        :auto-upload="false"
        v-model:file-list="uploadFilesList"
        accept=".md, .pdf, .png, .jpg, jpeg"
        :before-upload="beforeUploadFiles"
        @success="handleUploadSuccess"
        @error="handleUploadError"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖拽到这里 或 <em style="color: rgb(21, 187, 129)">点击上传</em>
        </div>
        <div class="el-upload__text">
          <em
            ><el-text
              tag="ins"
              style="
                color: rgb(255, 255, 255);
                /* background-color: rgba(21, 187, 129, 0.3);    */
                border-radius: 10px;
              "
              >Markdown文件需与文档内插入的图片一同上传</el-text
            ></em
          >
        </div>
        <template #tip>
          <div
            class="el-upload__tip"
            style="
              text-align: end;
              display: flex;
              justify-content: space-between;
              transition: 0.3;
            "
          >
            <el-button
              v-if="uploadFilesList.length > 0"
              style="
                height: 20px;
                padding: 5px;
                background-color: rgba(250, 76, 100, 0.3);
                border: none;
                color: rgba(250, 76, 100, 1);
                font-size: 10px;
              "
              :icon="Delete"
              @click="uploadFilesList = []"
              >清空上传文件</el-button
            >
            <div style="transition: 0.3s">md/pdf/png/jpg文件上传</div>
          </div>
        </template>
      </el-upload>
      <el-form-item>
        <el-button
          :icon="Upload"
          color="rgb(21, 187, 129)"
          style="width: 100%; height: 35px"
          @click="uploadClicked('noForce')"
          v-if="!confirmMarkdownUpload"
        >
          上传</el-button
        >
        <div
          v-else
          style="
            display: flex;
            color: rgb(250, 76, 100);
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          "
        >
          <el-button
            :icon="Upload"
            color="rgb(250, 76, 100)"
            style="width: 100%; height: 35px"
            @click="uploadClicked('force')"
            ref="confirmMarkdownUploadRef"
          >
            确认上传</el-button
          >
          <p style="margin: 0">请确保同时上传了Markdown中插入的图片</p>
        </div>
      </el-form-item>
    </el-form>
  </div>

  <!-- 遮罩 -->
  <div id="mask-dialog" ref="mask" @click="turnoffAddNote"></div>

  <!-- 加载中遮罩 -->
  <LoadingOverlay v-if="uploadloading" />
</template>

<!-- 窗口2--切换分组 -->
<style lang="scss" scoped>
#mask-dialog {
  display: none;
  width: 100vw;
  height: 100vh;
  position: absolute;
  background-color: rgba(20, 20, 20, 0.3);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(1px);
  z-index: 9;
}
#addNote {
  width: 500px;
  // height: 300px;
  min-height: 60px;
  max-height: 600px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: rgba(218, 254, 244, 0.15);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 0px;
  box-sizing: border-box;
  padding: 10px 15px;
  border-radius: 15px;
  display: none;
  flex-direction: column;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 0 2px -1px inset #ffffff;
  .el-form {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    // background-color: pink;
    ::v-deep(.el-input__wrapper) {
      height: 35px;
      background-color: rgba(255, 255, 255, 0.3);
      .el-input__inner {
        color: #000000;
      }
    }
    ::v-deep(.el-input__wrapper.is-focus) {
      background-color: rgba(169, 169, 169, 0.3);
      box-shadow: 0 0 0 1px rgb(21, 187, 129) inset;
    }

    ::v-deep(.el-upload-dragger) {
      //   height: 50px;
      background-color: rgba(255, 255, 255, 0.3);
      border: 2px dashed #d4d8e1;
    }
    ::v-deep(.el-upload-dragger:hover) {
      border: 2px dashed rgb(21, 187, 129);
    }
    ::v-deep(.el-upload-list__item-name) {
      color: #5d5d5d;
    }
    ::v-deep(.el-upload-list__item-name .el-icon) {
      color: #5d5d5d;
    }
  }
}
</style>

<!-- <style>
.ElMessageBox {
  z-index: 2000 !important;
}

.maskElMessageBox {
  z-index: 1500 !important;
} -->
<!-- </style> -->
