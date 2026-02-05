<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRightBold } from '@element-plus/icons-vue'
import {
  userFindUsernameByEmailServer,
  userChangePasswordServer
} from '@/api/user'
import {
  eamilVerifyCodeServer,
  emailSendChangePasswordCodeServer
} from '@/api/email'
const router = useRouter()
const form = ref()
const guideTitle = ref('')
guideTitle.value = '忘记密码 ->'
const usernameFound = ref('')
let step = ref(1)

const formModel = ref({
  username: '',
  email: '',
  password: '',
  repassword: '',
  code: ''
})

const rules = {
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    {
      pattern: /^[0-9a-zA-Z+-_.]+@[0-9a-zA-Z-]+\.[0-9a-zA-Z-.]+$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
    {
      pattern: /^\d{6}$/,
      message: '请输入有效的验证码',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[0-9a-zA-Z]{8,16}$/,
      message: '密码必须由8-16位的英文和数字构成',
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[0-9a-zA-Z]{8,16}$/,
      message: '密码必须由8-16位的英文和数字构成',
      trigger: 'blur'
    },
    // 自定义校验--判断两次输入的密码是否一致 {}
    {
      validator: (rule, value, callback) => {
        if (value != formModel.value.password) {
          callback(new Error('再次输入的密码不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
const nextStep = () => {
  if (step.value === 1) {
    nextStep1()
  } else if (step.value === 2) {
    nextStep2()
  } else {
    nextStep3()
  }
}

// 点击下一步--判断是否发送验证码
const nextStep1 = async () => {
  // 校验表单
  await form.value.validateField(['email'])
  try {
    // 查找是否存在改邮箱
    const res = await userFindUsernameByEmailServer(formModel.value)
    usernameFound.value = res.data[0].username
    // 发送修改密码的验证码
    const sendResult = await emailSendChangePasswordCodeServer(
      formModel.value.email,
      usernameFound.value
    )
    ElMessage.success(sendResult.message)
    step.value++
  } catch (error) {
    ElMessage.error(error.response.data.message)
  }
}

// 验证验证码
const nextStep2 = async () => {
  // 校验表单
  await form.value.validateField(['code'])
  // 验证
  try {
    const res = await eamilVerifyCodeServer(
      formModel.value.email,
      formModel.value.code,
      2
    )
    if (res.status === 'success') {
      step.value++
      ElMessage.success(res.message)
    }
  } catch (error) {
    ElMessage.error(error.response.data.message)
  }
}

// 修改密码
const nextStep3 = async () => {
  // 校验表单
  await form.value.validateField(['password', 'repassword'])
  // 修改密码
  try {
    const res = await userChangePasswordServer(formModel.value)
    if (res.status === 'success') {
      // 修改密码成功
      ElMessage.success(res.message)
      router.push('/login')
      step.value = 0
    }
  } catch (err) {
    ElMessage.error(err.response.data.message)
  }
}
</script>

<template>
  <div class="wrapper">
    <div class="wrapper-findPassword">
      <div class="wrapper-title">
        <div class="title">
          <p>{{ guideTitle }}</p>
        </div>
      </div>

      <div class="wrapper-form">
        <div class="form">
          <el-form
            class="elform"
            size="large"
            ref="form"
            :model="formModel"
            :rules="rules"
            autocomplete="off"
          >
            <el-form-item prop="email" v-if="step === 1">
              <div class="label">邮箱</div>
              <el-input v-model="formModel.email"></el-input>
            </el-form-item>
            <h3
              style="color: #32f18d; margin: 0"
              v-if="step === 2 || step === 3"
            >
              {{ usernameFound }}您好:
            </h3>
            <el-form-item prop="code" v-if="step === 2">
              <div class="label">验证码</div>
              <el-input v-model="formModel.code"></el-input>
            </el-form-item>
            <el-form-item prop="password" v-if="step === 3">
              <div class="label">重设密码</div>
              <el-input
                type="password"
                v-model="formModel.password"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item prop="repassword" v-if="step === 3">
              <div class="label">重复密码</div>
              <el-input
                type="password"
                v-model="formModel.repassword"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item class="item-next">
              <el-button
                @click="nextStep"
                class="button-next"
                color="32f18d"
                :icon="ArrowRightBold"
                circle
              ></el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  // 尺寸调整
  width: 100vw;
  height: 100vh;
  // 位置调整
  position: relative;
  // 样式调整
  background-color: #121212;
  // 子元素位置调整
  display: flex;
  justify-content: center;
  align-items: center;
  .wrapper-findPassword {
    width: 50%;
    height: 55%;
    background-color: rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); /* Safari 支持 */
    border: 1px solid rgba(50, 240, 140, 0.2); /* 可选：内边框/边界效果 */
    box-shadow: 0 0 15px rgba(50, 240, 140, 0.2);
    border-radius: 15px;
    position: absolute;

    // 左边部分--title
    .wrapper-title {
      width: 30%;
      height: 100%;
      // padding: 5px 10px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      // background-color: pink;
      white-space: normal; /* 允许换行 */
      overflow-wrap: break-word; /* 必要时断行 */
      position: absolute;
      left: 0;
      // background-color: pink;
      .title {
        width: 90%;
        height: 90%;
        // background-color: rebeccapurple;
        color: #32f18d;
        line-height: 1;
        font-weight: bold;
        // top: 0;
        border-right: solid 1px gray;
        container-type: size;

        position: absolute;
        p {
          margin: 0;
          padding: 10px;
          display: block;
          position: absolute;
          font-size: 40cqw;
          top: 0;
        }
      }
    }

    // 右边部分--form
    .wrapper-form {
      width: 70%;
      height: 100%;
      // background-color: pink;
      position: absolute;
      right: 0;
      .form {
        width: 100%;
        height: 100%;
        // background-color: rgb(255, 159, 175);
        padding: 30px 20px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;

        .label {
          color: rgb(41, 176, 107);
        }

        /* Scoped 样式穿透 el-input 内部 input */
        /* Scoped 样式下用 ::v-deep() */
        ::v-deep(.inp) {
          overflow: hidden; /* 防止眼睛图标溢出 */
        }
        ::v-deep(.el-input__inner) {
          box-sizing: border-box; /* 防止 padding 破坏圆角 */
          color: var(--text-color); /* 输入文字颜色 */
          font-size: medium;
        }

        ::v-deep(.el-input__wrapper) {
          height: 6vh;
          border-radius: 5px; /* 容器圆角 */
          // border: solid 2px rgb(32, 33, 35);
          background-color: rgb(19, 20, 21);
          // background-color: transparent;
          // 外边框用box-shadow画出
          box-shadow: 0 0 0 1px #202123 inset;
        }
        // 当用户聚焦于输入框时
        :deep(.el-input__wrapper.is-focus) {
          box-shadow: 0 0 0 1px #4b4c4d inset;
          background-color: rgb(36, 37, 39);
        }
        .item-next {
          position: relative;
          .button-next {
            position: absolute;
            margin-top: 2px;
            color: #9d9d9d;
            right: 0;
            bottom: -50px;
          }
          .button-next:hover {
            color: #000000;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .wrapper .wrapper-findPassword {
    width: 100%;
    height: 100%;
    .wrapper-title .title p {
      font-size: 80cqw;
    }
  }
}
</style>
