<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import ChangeGroup from '@/components/ChangeGroup.vue'
import AddNotes from '@/components/AddNotes.vue'
import { userGetUserInfoServer } from '@/api/user'
import { filesGetNotesListServer, filesDeleteNoteServer } from '@/api/files'
import { baseURL } from '@/utils/request'
// import { Hide, View } from '@element-plus/icons-vue'
import {
  Expand,
  Fold,
  Setting,
  House,
  Plus,
  Switch,
  Search,
  Clock,
  CollectionTag,
  Delete,
  FolderChecked,
  Edit,
  Memo
} from '@element-plus/icons-vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
const uploadloading = ref(false)

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const ChangeGroupRef = ref(null)
const AddNotesRef = ref(null)
const menu = ref(null)
const menuSearchUpload = ref(null)

// 抽屉是否显示
const isExpand = ref(true)
// 抽屉是否被禁用（在设置和个人简介页面时禁用）
const isMenuDisabled = ref(false)
// btn是否点击
const isActivedClick = ref('Home')
// 小组成员avatar是否选择
const isActivedChoice = ref(true)
// note是否被点击
// const isClickedNote = ref(true)

// 折叠还是收起列表栏
const toggleFoldStatus = () => {
  // 如果菜单被禁用，不执行任何操作
  if (isMenuDisabled.value) {
    return
  }

  if (isExpand.value) {
    // 如果此时状态是展开的--点击则是要收缩
    menu.value.style.width = '0px'
    menuSearchUpload.value.style.display = 'none'
    menu.value.style.borderRight = 'none'
  } else {
    // 如果此时状态是折叠的--点击则是要展开
    menu.value.style.width = '220px'
    menuSearchUpload.value.style.display = 'flex'
    menu.value.style.borderRight = '1px solid rgb(20, 31, 48)'
  }
  isExpand.value = !isExpand.value
}

// 是否点击了目录
const isExpandDirectory = ref(true)

// 跳转到首页
const goHomePage = () => {
  isActivedClick.value = 'Home'
  // 恢复菜单功能
  isMenuDisabled.value = false
  // 如果菜单是收起状态，展开它
  if (!isExpand.value) {
    toggleFoldStatus()
  }
  router.push('/')
}

// 跳转到设置页
const goSettingsPage = () => {
  isActivedClick.value = 'Settings'
  // 禁用菜单展开功能
  isMenuDisabled.value = true
  // 收起菜单
  if (isExpand.value) {
    menu.value.style.width = '0px'
    menuSearchUpload.value.style.display = 'none'
    menu.value.style.borderRight = 'none'
    isExpand.value = false
  }
  router.push('/main/settings')
}

// 跳转到个人简介页
const goProfilesPage = () => {
  isActivedClick.value = 'Profile'
  // 禁用菜单展开功能
  isMenuDisabled.value = true
  // 收起菜单
  if (isExpand.value) {
    menu.value.style.width = '0px'
    menuSearchUpload.value.style.display = 'none'
    menu.value.style.borderRight = 'none'
    isExpand.value = false
  }
  router.push('/main/profile')
}

// 获取用户的个人信息
const getAndInitUserInfo = async () => {
  try {
    const { data } = await userGetUserInfoServer()
    console.log(data)
    userStore.userInfo.userid = data.id
    userStore.userInfo.username = data.username
    userStore.userInfo.userEmail = data.email
    userStore.userInfo.useravatarPath = data.avatarpath
    console.log(userStore.userInfo)
  } catch (err) {
    ElMessage.error(err.response.data.message)
  }
}
getAndInitUserInfo()

// 获取用户的笔记列表
const getUserNotesList = async () => {
  try {
    const res = await filesGetNotesListServer()
    userStore.userNotesList = res.data
  } catch (err) {
    console.error(err.response.data.message)
  }
}
getUserNotesList()

// 文件上传完成后的处理函数
const handleUploadComplete = async () => {
  console.log('开始刷新笔记列表...')
  await getUserNotesList()
  console.log('笔记列表已更新')
}

// 监听路由变化，自动恢复对应页面的菜单状态（不用 immediate，以避免 DOM 未挂载时的问题）
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/main/settings') {
      isActivedClick.value = 'Settings'
      isMenuDisabled.value = true
      // 收起菜单（只在 DOM 元素存在时）
      if (menu.value && menuSearchUpload.value && isExpand.value) {
        menu.value.style.width = '0px'
        menuSearchUpload.value.style.display = 'none'
        menu.value.style.borderRight = 'none'
        isExpand.value = false
      }
    } else if (newPath === '/main/profile') {
      isActivedClick.value = 'Profile'
      isMenuDisabled.value = true
      // 收起菜单（只在 DOM 元素存在时）
      if (menu.value && menuSearchUpload.value && isExpand.value) {
        menu.value.style.width = '0px'
        menuSearchUpload.value.style.display = 'none'
        menu.value.style.borderRight = 'none'
        isExpand.value = false
      }
    } else if (newPath === '/') {
      isActivedClick.value = 'Home'
      isMenuDisabled.value = false
      // 展开菜单（只在 DOM 元素存在时）
      if (menu.value && menuSearchUpload.value && !isExpand.value) {
        menu.value.style.width = '220px'
        menuSearchUpload.value.style.display = 'flex'
        menu.value.style.borderRight = '1px solid rgb(20, 31, 48)'
        isExpand.value = true
      }
    }
  }
)

// 组件挂载时初始化菜单状态
onMounted(() => {
  const currentPath = route.path
  if (currentPath === '/main/settings') {
    isActivedClick.value = 'Settings'
    isMenuDisabled.value = true
    isExpand.value = false
    if (menu.value) {
      menu.value.style.width = '0px'
      menuSearchUpload.value.style.display = 'none'
      menu.value.style.borderRight = 'none'
    }
  } else if (currentPath === '/main/profile') {
    isActivedClick.value = 'Profile'
    isMenuDisabled.value = true
    isExpand.value = false
    if (menu.value) {
      menu.value.style.width = '0px'
      menuSearchUpload.value.style.display = 'none'
      menu.value.style.borderRight = 'none'
    }
  } else {
    // 默认状态（主页或其他页面）- 展开菜单
    isActivedClick.value = 'Home'
    isMenuDisabled.value = false
    isExpand.value = true
    if (menu.value) {
      menu.value.style.width = '220px'
      menuSearchUpload.value.style.display = 'flex'
      menu.value.style.borderRight = '1px solid rgb(20, 31, 48)'
    }
  }
})

// 规定笔记时间的显示格式
const formatDate = (isoString) => {
  if (!isoString) return ''
  return isoString.split('T')[0]
}

// 规定笔记文件类型的显示格式
const formatFileType = (fileType) => {
  if (!fileType) return ''
  if (fileType.split('/')[1] === 'octet-stream') return 'Markdown'
  else return fileType.split('/')[1]
}
// 文件标签显示的颜色
const TagColor = (fileType) => {
  const resType = formatFileType(fileType)
  if (resType === 'Markdown') return '97, 46, 201'
  if (resType === 'png' || resType === 'jpeg' || resType === 'jpg')
    return '21, 128, 255'
  if (resType == 'pdf') return '249, 77, 105'
}

// 点击笔记时
const clickNotesActivedId = ref(null)
const selectedFileName = ref('welcome.md')
const selectedFileType = ref('')
const selectedFileCustomName = ref(' ')

// 判断是否为 Markdown 文件
const isMarkdownFile = (fileType) => {
  const type = fileType.split('/')[1]
  console.log('文件类型判断:', fileType, '分割后:', type)
  return type === 'octet-stream' || type === 'markdown'
}

// 按钮禁用状态
const isEditDisabled = ref(false)
const isDirectoryDisabled = ref(false)

// 搜索输入框
const input2 = ref('')

// 计算属性：搜索过滤后的笔记列表
const filteredNotesList = computed(() => {
  if (!input2.value) {
    return userStore.userNotesList
  }

  const searchQuery = input2.value.toLowerCase()
  return userStore.userNotesList.filter((item) => {
    // 按笔记名称搜索
    return item.fileCustomName.toLowerCase().includes(searchQuery)
  })
})

// 点击对应的笔记
const clickNotes = (fileId, fileName, fileType, fileCustomName) => {
  clickNotesActivedId.value = fileId
  selectedFileName.value = fileName
  selectedFileType.value = fileType
  selectedFileCustomName.value = fileCustomName

  // 检查是否为非 Markdown 文件
  const isMarkdown = isMarkdownFile(fileType)

  console.log(
    '点击文件:',
    fileName,
    '类型:',
    fileType,
    '是否为Markdown:',
    isMarkdown
  )

  if (!isMarkdown) {
    // 非 Markdown 文件：禁用编辑和目录按钮，强制关闭目录
    isEditDisabled.value = true
    isDirectoryDisabled.value = true
    // 强制关闭目录，不管当前状态如何
    console.log('强制关闭目录 - 非Markdown文件')
    isExpandDirectory.value = false
  } else {
    // Markdown 文件：启用所有按钮，恢复目录显示
    isEditDisabled.value = false
    isDirectoryDisabled.value = false
    // 如果目录是关闭状态，重新打开它
    if (!isExpandDirectory.value) {
      console.log('打开目录 - Markdown文件')
      isExpandDirectory.value = true
    }
  }
}

// 删除文件的函数
const deleteFile = async () => {
  // 检查是否选中了笔记
  if (!clickNotesActivedId.value) {
    ElMessage.warning('请先选中一个笔记')
    return
  }

  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要删除 "${selectedFileCustomName.value}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    uploadloading.value = true
    // 调用删除 API
    const res = await filesDeleteNoteServer(clickNotesActivedId.value)

    if (res && res.status === 'success') {
      uploadloading.value = false
      ElMessage.success('笔记删除成功')

      // 清空当前选中的笔记信息
      clickNotesActivedId.value = null
      selectedFileName.value = 'welcome.md'
      selectedFileType.value = ''

      // 清空 store 中的选中笔记
      userStore.clearSelectedNote()

      // 清空搜索框
      input2.value = ''

      // 重新加载笔记列表
      await getUserNotesList()
    } else {
      ElMessage.error('删除笔记失败，请重试')
    }
  } catch (error) {
    uploadloading.value = false
    // 用户点击了取消按钮
    if (error === 'cancel') {
      return
    }
    console.error('删除笔记出错:', error)
    ElMessage.error(error.message || '删除笔记出错，请重试')
  }
}
</script>

<template>
  <div class="wrapper">
    <!-- 菜单 -->
    <div class="left-nav">
      <div class="nav">
        <!-- 一级路由出口--LayoutPage -->
        <!-- 按钮 -->
        <div class="btn">
          <div
            class="btn-base btn-flod"
            :class="{ isClicked: true, disabled: isMenuDisabled }"
            @click="toggleFoldStatus"
          >
            <el-icon v-if="isExpand === true"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
          </div>
          <div
            class="btn-base btn-home"
            :class="{ isClicked: isActivedClick === 'Home' }"
            @click="goHomePage"
          >
            <el-icon><House /></el-icon>
          </div>
          <div
            class="btn-base btn-setting"
            :class="{ isClicked: isActivedClick === 'Settings' }"
            @click="goSettingsPage"
          >
            <el-icon><Setting /></el-icon>
          </div>
        </div>
        <!-- <div class="toggleTheme">
          <el-switch
            v-model="value1"
            :active-action-icon="View"
            :inactive-action-icon="Hide"
          />
        </div> -->
        <!-- 小组部分 -->
        <div class="group">
          <div class="group-avatars">
            <ul>
              <li :class="{ isChoose: isActivedChoice }">
                <p class="name">name</p>
                <img
                  src="../../../assets/d1a5429ead3d892513c3180e2aebb940.png"
                  alt=""
                />
              </li>
              <li v-for="n in 9" :key="n">
                <p class="name">name</p>
                <img
                  src="../../../assets/d1a5429ead3d892513c3180e2aebb940.png"
                  alt=""
                />
              </li>
            </ul>
          </div>
          <div class="group-change">
            <div class="add btn-base">
              <el-icon><Plus /></el-icon>
            </div>
            <div
              class="change btn-base"
              @click="ChangeGroupRef.turnonChangeGroup()"
            >
              <el-icon><Switch /></el-icon>
            </div>
          </div>
        </div>
        <!-- 个人资料 -->
        <div class="profile">
          <div class="avatar" @click="goProfilesPage">
            <img
              src="../../../assets/d1a5429ead3d892513c3180e2aebb940.png"
              alt=""
            />
          </div>
          <div class="name">{{ userStore.userInfo.username }}</div>
        </div>
      </div>
      <!-- 抽屉 -->
      <div class="menu" ref="menu">
        <!-- 笔记列表 -->
        <div class="list">
          <div class="user-title">
            <p>{{ userStore.userInfo.username }}'s notes</p>
            <p>
              · 共发布{{
                userStore.userNotesList.length > 0
                  ? userStore.userNotesList.length
                  : 0
              }}篇笔记
            </p>
          </div>
          <div class="list-main">
            <!-- 搜索和上传按钮 -->
            <div class="list-search" ref="menuSearchUpload">
              <el-input
                v-model="input2"
                class="responsive-input"
                placeholder="搜索笔记"
                :prefix-icon="Search"
                clearable
                @clear="input2 = ''"
              />
              <div v-if="input2" class="search-result-count">
                找到 {{ filteredNotesList.length }} 条结果
              </div>
              <el-button
                :icon="Plus"
                color="#13ba81"
                style="
                  letter-spacing: 3px;
                  font-weight: bold;
                  width: 100%;
                  margin-top: 10px;
                "
                @click="AddNotesRef.turnonAddNote()"
                >上传笔记</el-button
              >
            </div>
            <!-- 笔记列表 -->
            <div class="list-contents">
              <ul v-if="filteredNotesList.length > 0">
                <li
                  v-for="item in filteredNotesList"
                  :key="item.fileId"
                  :class="{
                    isClickedNote: item.fileId === clickNotesActivedId
                  }"
                  @click="
                    clickNotes(
                      item.fileId,
                      item.fileName,
                      item.fileType,
                      item.fileCustomName
                    )
                  "
                >
                  <p class="p-title">{{ item.fileCustomName }}</p>
                  <div class="timeAndTag-wrapper">
                    <div class="time">
                      <el-icon class="Clock"> <Clock /> </el-icon
                      >{{ formatDate(item.createdTime) }}
                    </div>
                    <div class="tag">
                      <el-icon
                        class="CollectionTag"
                        :color="`rgb(${TagColor(item.fileType)})`"
                        ><CollectionTag
                      /></el-icon>
                      <div
                        :style="{
                          color: `rgb(${TagColor(item.fileType)})`
                        }"
                      >
                        {{ formatFileType(item.fileType) }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <!-- 搜索结果为空的提示 -->
              <div v-else class="empty-state">
                <el-empty description="未找到匹配的笔记" />
              </div>
            </div>
          </div>
        </div>
        <!-- md目录 -->
      </div>
    </div>
    <!-- 右边内容 -->
    <div class="right-content">
      <!-- 标题 -->
      <div class="title-wrapper">
        <div class="title">
          <p class="left">Hello World!11231221312312231221312312</p>
          <div class="right">
            <!-- 打开和关闭目录 -->
            <el-button
              :icon="Memo"
              class="btn-directory"
              circle
              :disabled="isDirectoryDisabled"
              style="
                width: 40px;
                background-color: rgba(22, 187, 130, 0.2);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: none;
                color: rgb(22, 187, 130);
                height: 100%;
              "
              @click="isExpandDirectory = !isExpandDirectory"
            ></el-button>
            <!-- 删除 -->
            <el-button
              :icon="Delete"
              class="btn-delete"
              circle
              style="
                width: 40px;
                background-color: rgba(255, 14, 35, 0.2);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: none;
                color: rgb(255, 14, 35);
                height: 100%;
                transition: 0.5s;
              "
              @click="deleteFile"
            ></el-button>
            <!-- 编辑 -->
            <el-button
              :icon="Edit"
              class="btn-edit"
              circle
              :disabled="isEditDisabled"
              style="
                width: 40px;
                background-color: rgba(77, 170, 253, 0.2);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: none;
                color: rgb(77, 170, 253);
                height: 100%;
              "
            ></el-button>
            <!-- 保存 -->
            <a
              :href="`${baseURL}/download?path=/upload/files/${selectedFileName}`"
              download
              style="color: inherit; text-decoration: none; margin-left: 12px"
            >
              <el-button
                :icon="FolderChecked"
                color="#16bb82"
                style="
                  color: rgb(3, 6, 21);
                  border: none;
                  height: 100%;
                  width: 80px;
                "
                >保存</el-button
              ></a
            >
          </div>
        </div>
      </div>

      <!-- 二级路由 -->
      <div class="router2">
        <!-- 二级路由出口 -->
        <keep-alive :include="['NotesPage']">
          <router-view
            class="routerView"
            :isExpandDirectory="isExpandDirectory"
            :fileName="selectedFileName"
            :fileType="selectedFileType"
          ></router-view>
        </keep-alive>
      </div>
    </div>
    <!--加入分组 -->
    <AddNotes
      ref="AddNotesRef"
      @upload-complete="handleUploadComplete"
    ></AddNotes>

    <!-- 切换分组 -->
    <ChangeGroup ref="ChangeGroupRef"></ChangeGroup>
  </div>

  <LoadingOverlay v-if="uploadloading" />
</template>

<!-- 主要页面的导航栏和抽屉 -->
<style lang="scss" scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
  // background-color: var(--bg-color);
  // background-color: pink;
  color: var(--text-color);
  box-sizing: border-box;
  // padding: 10px 20px;
  // border-bottom: 1px solid var(--text-color);
  display: flex;
  overflow: hidden;
  z-index: 0;

  // 左侧任务栏
  .left-nav {
    height: 100%;
    // background-color: rgb(255, 169, 183);
    display: flex;

    // 导航栏
    .nav {
      height: 100%;
      width: 85px;
      box-sizing: border-box;
      padding: 10px;
      padding-bottom: 100px;
      // padding: 10px 10px 110px 10px;
      background-color: rgb(3, 6, 23);
      border-right: 2px solid rgb(20, 31, 48);
      position: relative;
      display: flex;
      align-items: center;
      flex-direction: column;

      // 按钮模块
      .btn {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-bottom: 2px solid rgb(20, 31, 48);
        margin-bottom: 15px;
        .btn-base {
          height: 50px;
          width: 85%;
          border-radius: 10px;
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: rgb(51, 196, 144);
          font-size: 26px;
          transition: 0.1s;
        }
        .btn-base:hover {
          // color: rgb(51, 196, 144);
          // background-color: rgb(15, 23, 44);
          box-shadow: 0 0 35px -5px rgba(51, 196, 144, 0.3);
          transform: scale(1.05);
        }

        .isClicked {
          color: rgb(3, 6, 23);
          background-color: rgb(51, 196, 144);
          box-shadow: 0 0 35px -5px rgba(51, 196, 144, 0.5);
        }

        .disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
      }

      // 小组成员
      .group {
        width: 90%;
        // background-color: pink;
        box-sizing: border-box;
        overflow-y: auto;
        /* 🔥 关键：预留滚动条空间，避免挤压 */
        scrollbar-gutter: stable;
        /* 🔥 隐藏滚动条但保留滚动功能 */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE */
        // margin-top: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .group-avatars {
          width: 95%;
          ul {
            width: 100%;
            padding: 0;
            margin: 0;
            li {
              width: 100%;
              height: 55px;
              border-radius: 50%;
              box-sizing: border-box;
              margin-bottom: 20px;
              border: 3px solid rgb(42, 53, 74);
              list-style: none;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              transition: 0.2s;
              position: relative;
              perspective: 600px;
              .name {
                margin: 0;
                padding: 0;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                transition: 0.5s;
                opacity: 0;
                z-index: 999;
                font-size: 12px;
                color: rgba(201, 201, 201, 0.8);
              }
              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                box-sizing: border-box;
                border: 0.5px solid rgb(42, 53, 74);
              }
            }
            li::after {
              content: ''; /* 必须生成元素 */
              display: block; /* 关键，生成 box */
              width: 100%;
              height: 30px;
              background-color: rgba(161, 161, 161, 0.1);
              border: 1px solid rgba(196, 196, 196, 0.5);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              border-radius: 10px;
              // transform: rotate(20deg);
              // transform: rotate3d(0, 0, 10);
              position: absolute;
              top: 50%;
              opacity: 0;
              transition: 0.5s;
            }
            .isChoose {
              border: 3px solid rgb(54, 211, 153);
              box-shadow: 0 0 30px 1px rgba(54, 211, 153, 0.3);
            }
            li:hover {
              transform: scale(1.05);
              border: 3px solid rgb(54, 211, 153);
              box-shadow: 0 0 30px 1px rgba(54, 211, 153, 0.3);
            }
            li:hover .name {
              opacity: 1;
              transform: translate3d(0, 4px, 50px) scale(1.2);
              // box-shadow: 0 0 20px ;
            }
            li:hover::after {
              opacity: 1;
              transform: rotateX(-45deg);
              box-shadow: 0 10px 20px -5px rgba(51, 196, 144, 0.5);
            }
          }
        }
        .group-change {
          width: 100%;
          height: 130px;
          // background-color: rgb(255, 130, 151);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: rgb(57, 70, 94);

          .btn-base {
            height: 50px;
            width: 85%;
            font-size: 26px;
            border-radius: 10px;
            box-sizing: border-box;
            border: 2.5px dashed rgb(57, 70, 94);
            margin-bottom: 10px;
            // background-color: rgb(255, 167, 181);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition:
              border 0.2s,
              color 0.2s,
              transform 0.2s;
          }
          .add:hover {
            border: 2.5px dashed rgb(54, 211, 153);
            color: rgb(54, 211, 153);
            transform: scale(1.05);
          }
          .change:hover {
            border: 2.5px dashed rgb(54, 211, 153);
            color: rgb(54, 211, 153);
            transform: scale(1.05);
          }
        }
      }

      // 个人简介
      .profile {
        width: 100%;
        height: 100px;
        // background-color: pink;
        position: absolute;
        box-sizing: border-box;
        bottom: 0px;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 10px 15px;
        border-top: 2px solid rgb(20, 31, 48);
        background-color: rgb(3, 6, 23);
        img {
          width: 100%;
          height: 53px;
          border-radius: 50%;
          box-sizing: border-box;
          border: 2px solid rgb(237, 219, 255);
          transition: 0.3s;
        }
        img:hover {
          transform: scale(1.2);
          border: 2px solid rgb(54, 211, 153);
          box-shadow: 0px 0px 15px -5px rgb(54, 211, 153);
        }
        .name {
          display: inline-block;
          width: 3em;
          line-height: 100%;
          font-size: 13px;
          margin-left: 3px;
          overflow: hidden;
          white-space: nowrap; /* 不换行 */
          text-overflow: ellipsis; /* 让被隐藏的部分显示为 …（省略号） */
        }
      }
    }

    // 抽屉
    .menu {
      height: 100vh;
      width: 229px;
      background-color: rgb(8, 15, 32);
      border-right: 2px solid rgb(20, 31, 48);
      box-sizing: border-box;
      transition: 0.5s;
      .list {
        // flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        // 标题
        .user-title {
          box-sizing: border-box;
          height: 100px;
          width: 100%;
          // background-color: pink;
          border-bottom: 2px solid rgb(20, 31, 48);
          padding: 20px 10px;
          // background-color: rgb(254, 123, 145);
          p {
            margin: 0;
            padding: 0;
          }
          p:nth-child(1) {
            color: var(--text-color);
            font-size: 20px;
            font-weight: bold;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-bottom: 10px;
          }
          p:nth-child(2) {
            color: rgb(54, 211, 153);
            font-size: 12.5px;
            font-weight: bold;
          }
        }

        // 搜索框和上传按钮和内容卡片
        .list-main {
          width: 100%;
          height: 0;
          flex: 1;
          box-sizing: border-box;
          padding: 15px 10px;
          display: flex;
          flex-direction: column;
          // background-color: pink;
          // 搜索框和上传按钮
          .list-search {
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            // background-color: pink;
            margin-bottom: 15px;

            .search-result-count {
              font-size: 12px;
              color: rgb(68, 78, 97);
              padding: 10px 10px 0px 10px;
              text-align: center;
            }

            :deep(.el-input__wrapper) {
              background-color: rgb(3, 6, 23);
              box-shadow: 0 0 0 1px rgb(25, 35, 53);
            }
            :deep(.el-input__wrapper.is-focus) {
              box-shadow: 0 0 0 1px rgb(55, 69, 96);
            }
            :deep(.el-input__wrapper .el-input__inner::placeholder) {
              color: rgb(68, 78, 97);
            }
            :deep(.el-input__prefix-inner) {
              color: rgb(68, 78, 97);
            }
          }

          // 内容卡片
          .list-contents {
            height: 75%; // 关键：在 flex column 中，配合 flex: 1 需要明确的高度限制
            flex: 1;
            // background-color: pink;
            // 滚动设置
            overflow-y: auto;
            /* 🔥 关键：预留滚动条空间，避免挤压 */
            scrollbar-gutter: stable;

            /* 🔥 隐藏滚动条但保留滚动功能 */
            // scrollbar-width: none; /* Firefox */
            // -ms-overflow-style: none; /* IE */
            ul {
              margin: 0;
              padding: 0;
              li {
                list-style: none;
                width: 100%;
                // height: 80px;
                background-color: transparent;
                border-radius: 10px;
                margin-bottom: 12px;
                box-sizing: border-box;
                padding: 10px;
                padding-right: 10px;
                // border-bottom: 1.5px solid rgb(20, 31, 48);
                transition: 0.3s;
                background-color: rgba(30, 30, 54, 0.5);

                p {
                  margin: 0;
                }
                .p-title {
                  width: 95%;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  font-size: 16px;
                }
                .timeAndTag-wrapper {
                  display: flex;
                  justify-content: space-between;
                  .time {
                    color: rgb(84, 99, 121);
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                  }
                  .tag {
                    color: rgb(84, 99, 121);
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                  }
                }
              }
              li:hover {
                background-color: rgb(13, 24, 50);
              }
              .isClickedNote {
                background-color: rgb(12, 32, 43);
                border: 1px dotted rgb(26, 61, 80);
                .p-title {
                  color: rgb(22, 187, 130);
                }
              }
            }

            .empty-state {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100%;
              width: 100%;
            }
          }
        }
        .list-contents::-webkit-scrollbar {
          width: 0px;
        }

        .list-contents:hover::-webkit-scrollbar {
          width: 6px;
        }

        .list-contents::-webkit-scrollbar-track {
          background: transparent;
        }

        .list-contents::-webkit-scrollbar-thumb {
          background-color: rgba(42, 43, 44, 0.5);
          border-radius: 4px;
        }
      }
    }
  }

  // 内容区
  .right-content {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    // background-color: rgb(255, 202, 213);
    .title-wrapper {
      height: 60px;
      width: 100%;
      background-color: rgb(3, 6, 23);
      border-bottom: 2px solid rgb(20, 31, 48);
      box-sizing: border-box;
      padding: 10px;
      .title {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        // background-color: pink;
        .left {
          color: rgb(255, 255, 255);
          margin: 0;
          height: 100%;
          width: 450px;
          font-size: 30px;
          font-weight: bold;
          // background-color: rgb(255, 160, 176);
          // display: flex;
          // justify-content: flex-start;
          // align-items: center;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .right {
          height: 100%;
          width: 250px;
          // background-color: rgb(255, 139, 158);
          display: flex;
          justify-content: flex-end;
          .btn-directory:hover {
            color: rgb(3, 5, 20) !important;
            background-color: rgb(22, 187, 130) !important;
          }
          .btn-directory:disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
            background-color: rgba(22, 187, 130, 0.35) !important;
            color: rgba(22, 187, 130, 0.5) !important;
          }
          .btn-directory:disabled:hover {
            color: rgba(22, 187, 130, 0.5) !important;
            background-color: rgba(22, 187, 130, 0.1) !important;
          }
          .btn-delete:hover {
            color: rgb(3, 5, 20) !important;
            background-color: rgb(255, 14, 35) !important;
          }
          .btn-edit:hover {
            color: rgb(3, 5, 20) !important;
            background-color: rgb(23, 129, 255) !important;
          }
          .btn-edit:disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
            background-color: rgba(77, 170, 253, 0.35) !important;
            color: rgba(77, 170, 253, 0.5) !important;
          }
          .btn-edit:disabled:hover {
            color: rgba(77, 170, 253, 0.5) !important;
            background-color: rgba(77, 170, 253, 0.1) !important;
          }
        }
      }
    }
    .router2 {
      height: 0;
      flex: 1;
      width: 100%;
      // background-color: rgb(3, 6, 23);
      .routerView {
        width: 100%;
        height: 100%;
        flex-grow: 0;
      }
    }
  }
}

// 手机端的适配
@media (max-width: 768px) {
  .wrapper .left-nav {
    display: none;
  }
}
</style>

<!-- 窗口1--加入分组 -->
