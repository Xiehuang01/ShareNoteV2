import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore(
  'sharenote-user',
  () => {
    const token = ref('')

    // 设置token
    const setToken = (newToken) => {
      token.value = newToken
    }

    // 清除token
    const removeToken = () => {
      token.value = ''
    }

    // 用户数据
    const userInfo = ref({
      userid: '',
      username: '',
      userEmail: '',
      useravatarPath: ''
    })

    // 清楚用户信息
    const removeUserInfo = () => {
      userInfo.value = {
        userid: '',
        username: '',
        userEmail: '',
        useravatarPath: ''
      }
    }

    // 用户的笔记列表
    const userNotesList = ref([])

    // 清空用户的笔记列表
    const removeUserNotesList = () => {
      userNotesList.value = []
    }

    // 当前选中的笔记
    const selectedNote = ref({
      fileId: null,
      fileName: '',
      fileType: ''
    })

    // 设置当前选中的笔记
    const setSelectedNote = (fileId, fileName, fileType) => {
      selectedNote.value = {
        fileId,
        fileName,
        fileType
      }
    }

    // 清空选中的笔记
    const clearSelectedNote = () => {
      selectedNote.value = {
        fileId: null,
        fileName: '',
        fileType: ''
      }
    }

    // 用户选择的笔记
    const chooseNote = ref(null)

    // 设置新的用户笔记
    const setChooseNote = (file) => {
      console.log('点击笔记')
      chooseNote.value = file
    }

    // 清除用户选中的笔记
    const removetChooseNote = () => {
      chooseNote.value = null
    }

    // 编辑模式状态（不持久化，每次刷新页面重置）
    const isEditMode = ref(false)

    // 切换编辑模式
    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value
    }

    // 设置编辑模式
    const setEditMode = (mode) => {
      isEditMode.value = mode
    }

    // 当前选中的小组
    const currentGroup = ref(null)

    // 设置当前小组
    const setCurrentGroup = (group) => {
      currentGroup.value = group
    }

    // 清除当前小组
    const clearCurrentGroup = () => {
      currentGroup.value = null
    }

    // 当前查看的成员ID
    const currentMemberId = ref(null)

    // 设置当前成员ID
    const setCurrentMemberId = (memberId) => {
      currentMemberId.value = memberId
    }

    // 清除当前成员ID
    const clearCurrentMemberId = () => {
      currentMemberId.value = null
    }

    // 小组成员列表
    const groupMembers = ref([])

    // 设置小组成员列表
    const setGroupMembers = (members) => {
      groupMembers.value = members
    }

    // 清除小组成员列表
    const clearGroupMembers = () => {
      groupMembers.value = []
    }

    // AI 配置
    const aiConfig = ref(null)

    // 设置 AI 配置
    const setAiConfig = (config) => {
      aiConfig.value = config
    }

    // 清除 AI 配置
    const clearAiConfig = () => {
      aiConfig.value = null
    }

    return {
      token,
      setToken,
      removeToken,
      userInfo,
      removeUserInfo,
      userNotesList,
      removeUserNotesList,
      selectedNote,
      setSelectedNote,
      clearSelectedNote,
      chooseNote,
      setChooseNote,
      removetChooseNote,
      isEditMode,
      toggleEditMode,
      setEditMode,
      currentGroup,
      setCurrentGroup,
      clearCurrentGroup,
      currentMemberId,
      setCurrentMemberId,
      clearCurrentMemberId,
      groupMembers,
      setGroupMembers,
      clearGroupMembers,
      aiConfig,
      setAiConfig,
      clearAiConfig
    }
  },
  {
    persist: {
      key: 'sharenote-user',
      storage: localStorage,
      paths: ['token', 'userInfo', 'userNotesList', 'selectedNote', 'chooseNote', 'currentGroup', 'currentMemberId', 'groupMembers', 'aiConfig']
    }
  }
)
