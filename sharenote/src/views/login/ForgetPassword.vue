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
  <div class="forget-page">
    <!-- 左侧表单卡片 -->
    <div class="form-card">
      <div class="card-content">
        <!-- 标题 -->
        <div class="brand-header">
          <h1 class="brand-name">ShareNote</h1>
          <p class="welcome-text">找回密码</p>
          <p class="subtitle">通过邮箱验证找回您的账号密码</p>
        </div>

        <!-- 步骤指示器 -->
        <div class="steps-indicator">
          <div :class="['step', { active: step >= 1 }]">
            <div class="step-number">1</div>
            <div class="step-label">验证邮箱</div>
          </div>
          <div class="step-line" :class="{ active: step >= 2 }"></div>
          <div :class="['step', { active: step >= 2 }]">
            <div class="step-number">2</div>
            <div class="step-label">验证码</div>
          </div>
          <div class="step-line" :class="{ active: step >= 3 }"></div>
          <div :class="['step', { active: step >= 3 }]">
            <div class="step-number">3</div>
            <div class="step-label">重置密码</div>
          </div>
        </div>

        <!-- 表单 -->
        <el-form
          ref="form"
          :model="formModel"
          :rules="rules"
          autocomplete="off"
          class="forget-form"
        >
          <!-- 步骤1: 输入邮箱 -->
          <div v-if="step === 1" class="step-content">
            <el-form-item prop="email">
              <el-input
                v-model="formModel.email"
                placeholder="请输入注册邮箱"
                size="large"
              />
            </el-form-item>
          </div>

          <!-- 步骤2: 输入验证码 -->
          <div v-if="step === 2" class="step-content">
            <div class="username-hint">
              <span class="username">{{ usernameFound }}</span> 您好！
            </div>
            <el-form-item prop="code">
              <el-input
                v-model="formModel.code"
                placeholder="请输入邮箱验证码"
                size="large"
              />
            </el-form-item>
          </div>

          <!-- 步骤3: 重置密码 -->
          <div v-if="step === 3" class="step-content">
            <div class="username-hint">
              <span class="username">{{ usernameFound }}</span> 您好！
            </div>
            <el-form-item prop="password">
              <el-input
                v-model="formModel.password"
                type="password"
                placeholder="请输入新密码"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="repassword">
              <el-input
                v-model="formModel.repassword"
                type="password"
                placeholder="请再次输入新密码"
                size="large"
                show-password
              />
            </el-form-item>
          </div>

          <!-- 操作按钮 -->
          <el-form-item>
            <el-button
              @click="nextStep"
              type="primary"
              size="large"
              class="submit-btn"
            >
              {{ step === 3 ? '完成重置' : '下一步' }}
            </el-button>
          </el-form-item>

          <!-- 返回登录 -->
          <div class="back-to-login">
            <a href="/login">返回登录</a>
          </div>
        </el-form>

        <!-- 底部版权 -->
        <div class="footer-text">© 2025 ShareNote. All rights reserved.</div>
      </div>
    </div>

    <!-- 右侧背景 -->
    <div class="fluid-background">
      <div class="fluid-shape shape-1"></div>
      <div class="fluid-shape shape-2"></div>
      <div class="fluid-shape shape-3"></div>
      <div class="fluid-shape shape-4"></div>
      <div class="gradient-overlay"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forget-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: rgb(3, 6, 23);
  overflow: hidden;
}

// 左侧表单卡片
.form-card {
  flex: 0 0 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgb(8, 15, 32);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  z-index: 10;

  .card-content {
    width: 100%;
    max-width: 400px;
  }

  .brand-header {
    text-align: center;
    margin-bottom: 32px;

    .brand-name {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #36d399 0%, #16bb82 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 12px 0;
    }

    .welcome-text {
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }
  }

  // 步骤指示器
  .steps-indicator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding: 0 20px;

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .step-number {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .step-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        transition: all 0.3s ease;
      }

      &.active {
        .step-number {
          background: rgba(54, 211, 153, 0.2);
          border-color: #36d399;
          color: #36d399;
        }

        .step-label {
          color: #36d399;
        }
      }
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 8px;
      margin-bottom: 24px;
      transition: all 0.3s ease;

      &.active {
        background: #36d399;
      }
    }
  }

  .forget-form {
    .step-content {
      min-height: 120px;
    }

    .username-hint {
      text-align: center;
      margin-bottom: 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;

      .username {
        color: #36d399;
        font-weight: 600;
      }
    }

    .el-form-item {
      margin-bottom: 16px;
    }

    :deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      box-shadow: none;
      padding: 12px 16px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(54, 211, 153, 0.3);
      }

      &.is-focus {
        background: rgba(255, 255, 255, 0.1);
        border-color: #36d399;
        box-shadow: 0 0 0 3px rgba(54, 211, 153, 0.1);
      }

      .el-input__inner {
        color: #ffffff;
        font-size: 14px;

        &::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      }

      .el-input__prefix,
      .el-input__suffix {
        color: rgba(54, 211, 153, 0.7);
      }
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #36d399 0%, #16bb82 100%);
      border: none;
      color: rgb(3, 6, 23);
      font-size: 16px;
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(54, 211, 153, 0.3);
      margin-top: 8px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(54, 211, 153, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .back-to-login {
      text-align: center;
      margin-top: 16px;

      a {
        color: #36d399;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s ease;

        &:hover {
          color: #16bb82;
        }
      }
    }
  }

  .footer-text {
    text-align: center;
    margin-top: 24px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
  }
}

// 右侧背景
.fluid-background {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%);
  overflow: hidden;

  // 动态网格背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba(54, 211, 153, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(54, 211, 153, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 20s linear infinite;
  }

  // 发光球体
  .fluid-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
    animation: float 15s ease-in-out infinite;
  }

  .shape-1 {
    width: 500px;
    height: 500px;
    top: -15%;
    right: -10%;
    background: radial-gradient(
      circle,
      rgba(54, 211, 153, 0.4),
      rgba(54, 211, 153, 0.1)
    );
    animation-delay: 0s;
  }

  .shape-2 {
    width: 400px;
    height: 400px;
    bottom: -10%;
    left: 5%;
    background: radial-gradient(
      circle,
      rgba(99, 102, 241, 0.3),
      rgba(99, 102, 241, 0.1)
    );
    animation-delay: 5s;
  }

  .shape-3 {
    width: 350px;
    height: 350px;
    top: 50%;
    right: 15%;
    background: radial-gradient(
      circle,
      rgba(236, 72, 153, 0.25),
      rgba(236, 72, 153, 0.05)
    );
    animation-delay: 10s;
  }

  .shape-4 {
    width: 300px;
    height: 300px;
    top: 20%;
    left: 20%;
    background: radial-gradient(
      circle,
      rgba(251, 191, 36, 0.2),
      rgba(251, 191, 36, 0.05)
    );
    animation-delay: 7s;
  }

  .gradient-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;

    &::before,
    &::after {
      content: '';
      position: absolute;
      border: 2px solid rgba(54, 211, 153, 0.1);
      border-radius: 50%;
      animation: pulse 8s ease-in-out infinite;
    }

    &::before {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    &::after {
      width: 70%;
      height: 70%;
      top: 15%;
      left: 15%;
      animation-delay: 4s;
    }
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

// 移动端适配
@media (max-width: 1024px) {
  .forget-page {
    flex-direction: column;
  }

  .form-card {
    flex: none;
    width: auto;
    height: 100vh;
    overflow-y: auto;
    box-shadow: none;
    border-bottom: 2px solid rgb(20, 31, 48);
  }

  .fluid-background {
    flex: 1;
    height: 0vh;

    .fluid-shape {
      width: 300px !important;
      height: 300px !important;
    }
  }
}

@media (max-width: 768px) {
  .form-card {
    padding: 30px 20px;

    .card-content {
      max-width: 100%;
    }

    .brand-header {
      .brand-name {
        font-size: 28px;
      }

      .welcome-text {
        font-size: 18px;
      }

      .subtitle {
        font-size: 12px;
      }
    }

    .steps-indicator {
      padding: 0 10px;

      .step {
        .step-number {
          width: 32px;
          height: 32px;
          font-size: 14px;
        }

        .step-label {
          font-size: 11px;
        }
      }
    }
  }

  .fluid-background {
    display: none;
  }
}
</style>
