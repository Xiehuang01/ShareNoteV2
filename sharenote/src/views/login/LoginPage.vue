<script setup>
// Vue3原生
import { ref, watch } from 'vue'
// api接口相关
import { userLoginServer, userRegisterServer } from '@/api/user'
import { emailSendCodeServer, eamilVerifyCodeServer } from '@/api/email'
// 存储
import { useUserStore } from '@/stores/user'
// 路由
import { useRouter } from 'vue-router'
// axios
import request from '@/utils/request'

const form = ref()
const isRegister = ref(false)
const isEnabledClicked = ref(true)
const userStore = useUserStore()
const router = useRouter()
const formModel = ref({
  username: '',
  password: '',
  repassword: '',
  phoneNumber: '',
  email: '',
  code: ''
})

const timer = ref(null) // 计时器
const secondTotal = ref(60)
const second = ref(60)

// 行为验证初始化
const captchaObjGet = ref(null)
// 忽略下一行代码的eslint校验
// eslint-disable-next-line
initGeetest4(
  {
    captchaId: '0646f178d6514fc91a6bc0aa848b5b7d',
    product: 'bind'
  },
  function (captchaObj) {
    // console.log('极验初始化完成', captchaObj)
    captchaObjGet.value = captchaObj // 因为是对象，所以是地址赋值
    // 省略其他方法的调用
    // captchaObj.appendTo('#captcha') // 调用appendTo将验证码插入到页的某一个元素中，这个元素用户可以自定义
    // 这里调用了 onSuccess 方法，该方法介绍见下文
    captchaObj.onSuccess(async function () {
      var result = captchaObj.getValidate()
      // console.log(result)
      // 二次验证
      if (!result) {
        console.error('极验验证结果为空')
        return
      }

      try {
        // 二次验证，把前端返回的参数传给后端
        const response = await request.get('/geetest', {
          params: {
            captcha_id: '0646f178d6514fc91a6bc0aa848b5b7d', // 前端公钥
            lot_number: result.lot_number,
            captcha_output: result.captcha_output,
            pass_token: result.pass_token,
            gen_time: result.gen_time
          }
        })
        console.log('后端二次验证结果:', response)
        // 判断二次验证是否成功
        if (response.result === 'success') {
          // 二次验证成功
          // 防止重复点击
          if (!timer.value && second.value === secondTotal.value) {
            // 禁用注册按钮
            isEnabledClicked.value = !isEnabledClicked.value
            // 发送验证码
            try {
              const sendCodeResult = await emailSendCodeServer(formModel.value)
              ElMessage.success(sendCodeResult.message)
              if (sendCodeResult.status === 'success') {
                // 开始倒计时
                timer.value = setInterval(() => {
                  second.value--
                  if (second.value <= 0) {
                    clearInterval(timer.value) // 暂停计时器
                    timer.value = null // 清空计时器
                    second.value = secondTotal.value // 重置计时器
                    isEnabledClicked.value = !isEnabledClicked.value // 启用注册按钮
                  }
                }, 1000)
              }
            } catch (err) {
              // 发送验证码失败
              isEnabledClicked.value = !isEnabledClicked.value
              ElMessage.error(err.response.data.message)
            }
          }
        }
      } catch (err) {
        console.error('二次验证失败', err)
        alert('验证失败')
      }
    })
  }
)

// 表单输入校验规则
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    {
      pattern: /^[0-9a-zA-Z]{3,10}$/,
      message: '用户名必须是3-10位英文或数字',
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
  ],
  phoneNumber: [
    { required: true, message: '手机号码不能为空', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur'
    }
  ],
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
  ]
}

// 重置formModel参数
const refreshFormModel = () => {
  formModel.value = {
    username: '',
    password: '',
    repassword: '',
    phoneNumber: '',
    email: '',
    code: ''
  }
}

watch(isRegister, () => {
  refreshFormModel()
})

// 登录函数
const login = async () => {
  await form.value.validate()
  try {
    const res = await userLoginServer(formModel.value)
    console.log(res)
    if (res.status === 'success') {
      userStore.setToken(res.token)
      ElMessage.success(res.message)
      router.push('/')
      refreshFormModel()
    }
  } catch (err) {
    ElMessage.error(err.response.data.message)
  }
}

// 注册接口
const register = async () => {
  // 等待校验是否成功
  await form.value.validate()
  try {
    // 调用验证码校验接口
    const verifyResult = await eamilVerifyCodeServer(
      formModel.value.email,
      formModel.value.code,
      1
    )
    if (verifyResult.status === 'success') {
      // 调用数据存储接口
      const res = await userRegisterServer(formModel.value)
      if (res.status === 'success') {
        // 注册成功
        ElMessage.success('注册成功')
        // 返回登录页面--带回显
        isRegister.value = !isRegister.value
      }
    }
  } catch (err) {
    // 注册失败
    ElMessage.error(err.response.data.message)
  }
}

// 发送验证码
const sendCode = async () => {
  if (isEnabledClicked.value) {
    // 表单校验--只是校验表单有没有填写email
    // validateField--只校验指定的表单输入
    await form.value.validateField([
      'username',
      'password',
      'repassword',
      'email'
    ])
    // 行为验证
    if (captchaObjGet.value) {
      captchaObjGet.value.showCaptcha() // 显示验证码
    } else {
      console.error('验证码还没初始化好')
      return
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <!-- 底部样式 -->
    <div class="bottom">
      <h1>XIEHUANG</h1>
      <h1>SHARE NOTE</h1>
    </div>
    <!-- 登录 -->
    <div class="wrapper-login-in" v-if="!isRegister">
      <div class="form">
        <!-- autocomplete="off"--防止自动填充 -->
        <el-form
          class="elform"
          size="large"
          ref="form"
          :model="formModel"
          :rules="rules"
          autocomplete="off"
        >
          <h1>登 录</h1>
          <!-- 用户名 -->
          <el-form-item class="elformitem" prop="username">
            <el-input
              class="inp"
              placeholder="用户名"
              v-model="formModel.username"
            ></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item class="elformitem" prop="password">
            <el-input
              class="inp"
              placeholder="密码"
              type="password"
              v-model="formModel.password"
              show-password
            >
            </el-input>
          </el-form-item>
          <!-- 提交框 -->
          <el-form-item>
            <el-button @click="login" class="button" color="#32f08c"
              >登 录</el-button
            >
          </el-form-item>
          <div class="goLoginUp">
            <div>
              没有账号? <i @click="isRegister = !isRegister">立即注册</i>
            </div>
            <a href="/forgetpassword" style="text-align: center">忘记密码</a>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 注册 -->
    <div class="wrapper-login-up" v-else>
      <div class="form">
        <!-- autocomplete="off"--防止自动填充 -->
        <el-form
          class="elform"
          size="large"
          ref="form"
          :model="formModel"
          :rules="rules"
          autocomplete="off"
        >
          <h1>注 册</h1>
          <!-- 用户名 -->
          <el-form-item class="elformitem" prop="username">
            <el-input
              class="inp"
              placeholder="用户名"
              v-model="formModel.username"
            ></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item class="elformitem" prop="password">
            <el-input
              class="inp"
              placeholder="设置密码"
              type="password"
              v-model="formModel.password"
              show-password
            >
            </el-input>
          </el-form-item>
          <!-- 重复密码 -->
          <el-form-item class="elformitem" prop="repassword">
            <el-input
              class="inp"
              placeholder="再次输入密码"
              type="password"
              v-model="formModel.repassword"
              show-password
            >
            </el-input>
          </el-form-item>
          <!-- 手机号码 -->
          <!-- <el-form-item class="elformitem" prop="phoneNumber">
            <el-input
              class="inp"
              placeholder="手机号码"
              v-model="formModel.phoneNumber"
            ></el-input>
          </el-form-item> -->
          <!-- 邮箱号码 -->
          <el-form-item class="elformitem" prop="email">
            <el-input
              class="inp"
              placeholder="邮箱号码"
              v-model="formModel.email"
            ></el-input>
          </el-form-item>
          <!-- 验证码 -->
          <el-form-item class="elformitem" prop="code">
            <el-input
              class="inp"
              placeholder="验证码"
              v-model="formModel.code"
            ></el-input>
          </el-form-item>
          <!-- 获取验证码 -->
          <el-form-item>
            <el-button @click="sendCode" class="button" color="#edeff2">{{
              second === secondTotal ? '获取验证码' : `${second}s后重新发送`
            }}</el-button>
          </el-form-item>
          <!-- 提交框 -->
          <el-form-item>
            <el-button @click="register" class="button" color="#32f08c"
              >注 册</el-button
            >
          </el-form-item>
          <div class="goLoginUp" style="display: flex; justify-content: center">
            <div>已有账号?</div>
            <a
              href="/login"
              style="
                display: block;
                text-decoration: none;
                color: rgb(50, 241, 141);
              "
              >立即登录</a
            >
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-color);
  position: relative;
  // background: url('https://picsum.photos/1920/1080') no-repeat center;
  background-size: cover;
  color: var(--text-color);
  overflow: hidden;
}

.bottom {
  z-index: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  h1 {
    display: block;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    padding: 0;
    width: 100%;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1:first-child {
    height: 40%;
    color: #ffb200;
    font-size: 200px;
    // text-shadow: 5px 10px 5px #32f18d; /* x偏移 y偏移 模糊半径 颜色 */
  }
  h1:last-child {
    height: 50%;
    color: #32f18d;
    font-size: 250px;
    animation: glow 3s infinite alternate;
  }
}

@keyframes glow {
  0% {
    // text-shadow: 5px 10px 5px #ffffff; /* x偏移 y偏移 模糊半径 颜色 */
    text-shadow:
      0 0 5px #32f18d,
      0 0 10px #32f18d,
      0 0 20px #32f18d;
    // 0 0 40px #32f18d;
  }
  50% {
    text-shadow:
      0 0 10px #32f18d,
      0 0 20px #32f18d,
      0 0 30px #32f18d;
    // 0 0 50px #32f18d;
  }
  100% {
    text-shadow:
      0 0 5px #32f18d,
      0 0 10px #32f18d,
      0 0 20px #32f18d;
    // 0 0 40px #32f18d;
  }
}

.wrapper-login-in,
.wrapper-login-up {
  min-height: 80vh;
  max-height: 85vh; /* 限制最大高度，让两者视觉上更协调 */
  height: auto;
  padding: 30px; /* 增加内边距，优化内容呼吸感 */
  width: 35%;
}

@media (max-width: 768px) {
  .wrapper-login-in,
  .wrapper-login-up {
    min-height: 100vh;
    max-height: 100vh; /* 限制最大高度，让两者视觉上更协调 */
    height: auto;
    padding: 0; /* 增加内边距，优化内容呼吸感 */
    width: 100vw;
    // margin: 0 auto !important;
    // left: 0% !important;
    right: 0% !important;
  }
}

.wrapper-login-in {
  /* 样式调整 */
  border-radius: 15px;
  // width: 35%;
  // height: 90%;
  background-color: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(10px); /* 模糊背景 */
  -webkit-backdrop-filter: blur(10px); /* Safari 支持 */
  border: 1px solid rgba(50, 240, 140, 0.2); /* 可选：内边框/边界效果 */
  box-shadow: 0 0 15px rgba(50, 240, 140, 0.2);
  /* 位置调整 */
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 5%;
  z-index: 1;
  /* 子级元素位置调整 */
  display: flex;
  justify-content: center; /* 可选，水平居中 */
  align-items: center; /* 可选，垂直居中 */

  .form {
    width: 80%;
    height: 80%;
    // background-color: pink;
    h1 {
      font-size: 300%;
      margin-top: 5%;
      margin-bottom: 20%;
    }

    /* Scoped 样式穿透 el-input 内部 input */
    /* Scoped 样式下用 ::v-deep() */
    ::v-deep(.inp) {
      overflow: hidden; /* 防止眼睛图标溢出 */
    }
    ::v-deep(.inp .el-input__inner) {
      box-sizing: border-box; /* 防止 padding 破坏圆角 */
      color: var(--text-color); /* 输入文字颜色 */
      font-size: medium;
    }

    ::v-deep(.el-input__wrapper) {
      height: 8vh;
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

    .button {
      width: 100%;
      font-size: large;
      height: 6vh;
    }

    .goLoginUp {
      color: rgb(166, 170, 181);
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      i {
        color: white;
        font-style: normal;
      }
      i:hover {
        color: rgb(50, 240, 140);
        font-style: normal;
      }
      a {
        color: white;
        font-style: normal;
        text-decoration: none;
        margin-top: 3px;
      }
      a:hover {
        color: rgb(50, 240, 140);
        font-style: normal;
      }
    }
  }
}

.wrapper-login-up {
  /* 样式调整 */
  border-radius: 15px;
  // width: 35%;
  // height: 90%;
  background-color: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(10px); /* 模糊背景 */
  -webkit-backdrop-filter: blur(10px); /* Safari 支持 */
  border: 1px solid rgba(50, 240, 140, 0.2); /* 可选：内边框/边界效果 */
  box-shadow: 0 0 15px rgba(50, 240, 140, 0.2);
  /* 位置调整 */
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 5%;
  z-index: 1;
  /* 子级元素位置调整 */
  display: flex;
  justify-content: center; /* 可选，水平居中 */
  align-items: center; /* 可选，垂直居中 */
  overflow: hidden;

  .form {
    width: 80%;
    height: 80%;
    // background-color: pink;
    h1 {
      font-size: 300%;
    }

    /* Scoped 样式穿透 el-input 内部 input */
    /* Scoped 样式下用 ::v-deep() */
    ::v-deep(.inp) {
      overflow: hidden; /* 防止眼睛图标溢出 */
    }
    ::v-deep(.inp .el-input__inner) {
      box-sizing: border-box; /* 防止 padding 破坏圆角 */
      color: var(--text-color); /* 输入文字颜色 */
      font-size: small;
    }

    ::v-deep(.el-input__wrapper) {
      height: 6vh;
      border-radius: 5px; /* 容器圆角 */
      // border: solid 2px rgb(32, 33, 35);
      background-color: rgb(19, 20, 21);
      // 外边框用box-shadow画出
      box-shadow: 0 0 0 1px #202123 inset;
    }
    // 当用户聚焦于输入框时
    :deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px #4b4c4d inset;
      background-color: rgb(36, 37, 39);
    }

    .button {
      width: 100%;
      font-size: large;
      height: 6vh;
    }
  }
}
</style>
