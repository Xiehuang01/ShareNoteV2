<script setup>
// Vue3原生
import { ref, watch, onMounted, onUnmounted } from 'vue'
// api接口相关
import { userLoginServer, userRegisterServer } from '@/api/user'
import { emailSendCodeServer, eamilVerifyCodeServer } from '@/api/email'
// 存储
import { useUserStore } from '@/stores/user'
// 路由
import { useRouter } from 'vue-router'
// axios
import request from '@/utils/request'
// Three.js
import * as THREE from 'three'

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

const timer = ref(null)
const secondTotal = ref(60)
const second = ref(60)

// 行为验证初始化
const captchaObjGet = ref(null)
// eslint-disable-next-line
initGeetest4(
  {
    captchaId: '0646f178d6514fc91a6bc0aa848b5b7d',
    product: 'bind'
  },
  function (captchaObj) {
    captchaObjGet.value = captchaObj
    captchaObj.onSuccess(async function () {
      var result = captchaObj.getValidate()
      if (!result) {
        console.error('极验验证结果为空')
        return
      }

      try {
        const response = await request.get('/geetest', {
          params: {
            captcha_id: '0646f178d6514fc91a6bc0aa848b5b7d',
            lot_number: result.lot_number,
            captcha_output: result.captcha_output,
            pass_token: result.pass_token,
            gen_time: result.gen_time
          }
        })
        if (response.result === 'success') {
          if (!timer.value && second.value === secondTotal.value) {
            isEnabledClicked.value = false
            try {
              const sendCodeResult = await emailSendCodeServer(formModel.value)
              ElMessage.success(sendCodeResult.message)
              if (sendCodeResult.status === 'success') {
                timer.value = setInterval(() => {
                  second.value--
                  if (second.value <= 0) {
                    clearInterval(timer.value)
                    timer.value = null
                    second.value = secondTotal.value
                    isEnabledClicked.value = true
                  }
                }, 1000)
              } else {
                isEnabledClicked.value = true
              }
            } catch (err) {
              isEnabledClicked.value = true
              ElMessage.error(
                err.response?.data?.message || '发送验证码失败，请重试'
              )
            }
          }
        } else {
          ElMessage.error('验证失败，请重试')
        }
      } catch (err) {
        console.error('二次验证失败', err)
        ElMessage.error('验证失败，请重试')
      }
    })
  }
)

// 表单校验规则
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

// 登录
const login = async () => {
  await form.value.validate()
  try {
    const res = await userLoginServer(formModel.value)
    if (res.status === 'success') {
      userStore.setToken(res.token)
      ElMessage.success(res.message)
      router.push('/')
      refreshFormModel()
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '登录失败，请重试')
  }
}

// 注册
const register = async () => {
  await form.value.validate()
  try {
    const verifyResult = await eamilVerifyCodeServer(
      formModel.value.email,
      formModel.value.code,
      1
    )
    if (verifyResult.status === 'success') {
      const res = await userRegisterServer(formModel.value)
      if (res.status === 'success') {
        ElMessage.success('注册成功')
        isRegister.value = !isRegister.value
      }
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '注册失败，请重试')
  }
}

// 发送验证码
const sendCode = async () => {
  if (isEnabledClicked.value) {
    await form.value.validateField([
      'username',
      'password',
      'repassword',
      'email'
    ])
    if (captchaObjGet.value) {
      captchaObjGet.value.showCaptcha()
    } else {
      console.error('验证码还没初始化好')
    }
  }
}

// Three.js 3D文字效果
let scene, camera, renderer, particles, mouse, raycaster
const canvasRef = ref(null)

const init3DText = () => {
  const container = canvasRef.value
  if (!container) return

  // 场景
  scene = new THREE.Scene()

  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 50) // 确保相机居中

  // 渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // 鼠标位置
  mouse = new THREE.Vector2()
  raycaster = new THREE.Raycaster()

  // 创建粒子文字
  createParticleText()

  // 动画循环
  animate()

  // 监听窗口大小变化
  window.addEventListener('resize', onWindowResize)
}

const createParticleText = () => {
  const text = 'ShareNote'
  const particles_geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []
  const sizes = []
  const originalPositions = []

  // 使用Canvas生成文字像素
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // 设置Canvas大小和字体
  const fontSize = 100
  canvas.width = text.length * fontSize * 0.8
  canvas.height = fontSize * 1.2

  ctx.fillStyle = 'white'
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  // 采样间隔（增大间隔，减少粒子密度）
  const gap = 4
  const particlesPerPixel = 1

  for (let y = 0; y < canvas.height; y += gap) {
    for (let x = 0; x < canvas.width; x += gap) {
      const index = (y * canvas.width + x) * 4
      const alpha = pixels[index + 3]

      // 如果像素不透明，创建粒子
      if (alpha > 128) {
        for (let i = 0; i < particlesPerPixel; i++) {
          // 转换坐标到3D空间（增大缩放比例，让文字更分散）
          const posX =
            (x - canvas.width / 2) * 0.12 + (Math.random() - 0.5) * 0.15
          const posY =
            -(y - canvas.height / 2) * 0.12 + (Math.random() - 0.5) * 0.15
          const posZ = (Math.random() - 0.5) * 0.2

          positions.push(posX, posY, posZ)
          originalPositions.push(posX, posY, posZ)

          // 根据X位置设置渐变色
          const color = new THREE.Color()
          const hue = 0.35 + (x / canvas.width) * 0.15
          color.setHSL(hue, 0.85, 0.65)
          colors.push(color.r, color.g, color.b)

          sizes.push(0.4 + Math.random() * 0.2)
        }
      }
    }
  }

  particles_geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  )
  particles_geometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  )
  particles_geometry.setAttribute(
    'size',
    new THREE.Float32BufferAttribute(sizes, 1)
  )

  // 保存原始位置
  particles_geometry.userData.originalPositions = originalPositions

  const particles_material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  particles = new THREE.Points(particles_geometry, particles_material)
  scene.add(particles)
}

const animate = () => {
  requestAnimationFrame(animate)

  if (particles) {
    const positions = particles.geometry.attributes.position.array
    const originalPositions = particles.geometry.userData.originalPositions
    const time = Date.now() * 0.0005 // 稍微加快晃动速度

    for (let i = 0; i < positions.length; i += 3) {
      const origX = originalPositions[i]
      const origY = originalPositions[i + 1]
      const origZ = originalPositions[i + 2]

      // 增大晃动幅度
      const floatX = Math.sin(time + i * 0.08) * 0.15
      const floatY = Math.cos(time + i * 0.12) * 0.15
      const floatZ = Math.sin(time + i * 0.15) * 0.08

      // 鼠标交互 - 粒子被鼠标推开
      const dx = origX - mouse.x * 25
      const dy = origY - mouse.y * 25
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 8) {
        const force = (8 - distance) / 8
        positions[i] = origX + dx * force * 0.3 + floatX
        positions[i + 1] = origY + dy * force * 0.3 + floatY
        positions[i + 2] = origZ + force * 1.5 + floatZ
      } else {
        // 恢复原位并添加晃动
        positions[i] += (origX + floatX - positions[i]) * 0.1
        positions[i + 1] += (origY + floatY - positions[i + 1]) * 0.1
        positions[i + 2] += (origZ + floatZ - positions[i + 2]) * 0.1
      }
    }

    particles.geometry.attributes.position.needsUpdate = true
  }

  renderer.render(scene, camera)
}

const onWindowResize = () => {
  const container = canvasRef.value
  if (!container) return

  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

const onMouseMove = (event) => {
  const container = canvasRef.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

onMounted(() => {
  init3DText()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<template>
  <div class="login-page">
    <!-- 左侧表单卡片 -->
    <div class="form-card">
      <div class="card-content">
        <!-- 标题 -->
        <div class="brand-header">
          <h1 class="brand-name">ShareNote</h1>
          <p class="welcome-text">
            {{ isRegister ? '创建新账号' : '欢迎回来！' }}
          </p>
          <p class="subtitle">
            {{
              isRegister
                ? '加入我们，开启智能协作之旅'
                : '登录继续使用智能笔记平台'
            }}
          </p>
        </div>

        <!-- 切换按钮 -->
        <div class="tab-buttons">
          <button
            :class="['tab-btn', { active: !isRegister }]"
            @click="isRegister = false"
          >
            登录
          </button>
          <button
            :class="['tab-btn', { active: isRegister }]"
            @click="isRegister = true"
          >
            注册
          </button>
        </div>

        <!-- 表单 -->
        <el-form
          ref="form"
          :model="formModel"
          :rules="rules"
          autocomplete="off"
          class="login-form"
        >
          <transition name="form-fade" mode="out-in">
            <!-- 登录表单 -->
            <div v-if="!isRegister" key="login">
              <el-form-item prop="username">
                <el-input
                  v-model="formModel.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="formModel.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  show-password
                />
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="formModel.remember">记住我</el-checkbox>
                <a href="/forgetpassword" class="forgot-link">忘记密码？</a>
              </div>

              <el-form-item>
                <el-button
                  @click="login"
                  type="primary"
                  size="large"
                  class="submit-btn"
                >
                  登录
                </el-button>
              </el-form-item>
            </div>

            <!-- 注册表单 -->
            <div v-else key="register">
              <el-form-item prop="username">
                <el-input
                  v-model="formModel.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="formModel.password"
                  type="password"
                  placeholder="设置密码"
                  size="large"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="repassword">
                <el-input
                  v-model="formModel.repassword"
                  type="password"
                  placeholder="确认密码"
                  size="large"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="email">
                <el-input
                  v-model="formModel.email"
                  placeholder="请输入邮箱地址"
                  size="large"
                />
              </el-form-item>

              <el-form-item prop="code">
                <div class="code-group">
                  <el-input
                    v-model="formModel.code"
                    placeholder="验证码"
                    size="large"
                    class="code-input"
                  />
                  <el-button
                    @click="sendCode"
                    size="large"
                    class="code-btn"
                    :disabled="!isEnabledClicked"
                  >
                    {{ second === secondTotal ? '获取验证码' : `${second}s` }}
                  </el-button>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button
                  @click="register"
                  type="primary"
                  size="large"
                  class="submit-btn"
                >
                  注册
                </el-button>
              </el-form-item>
            </div>
          </transition>
        </el-form>

        <!-- 底部版权 -->
        <div class="footer-text">© 2025 ShareNote. All rights reserved.</div>
      </div>
    </div>

    <!-- 右侧流体背景 -->
    <div class="fluid-background" @mousemove="onMouseMove">
      <!-- 3D粒子文字画布 -->
      <div ref="canvasRef" class="three-canvas"></div>

      <!-- 发光球体 -->
      <div class="fluid-shape shape-1"></div>
      <div class="fluid-shape shape-2"></div>
      <div class="fluid-shape shape-3"></div>
      <div class="fluid-shape shape-4"></div>

      <!-- 几何装饰圆环 -->
      <div class="gradient-overlay"></div>

      <!-- 漂浮粒子 -->
      <div class="particles">
        <div
          class="particle"
          v-for="i in 20"
          :key="i"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 10 + 's',
            animationDuration: 15 + Math.random() * 10 + 's'
          }"
        ></div>
      </div>

      <!-- 旋转光环 -->
      <div class="rotating-rings">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
      </div>

      <!-- 代码雨效果 -->
      <div class="code-rain">
        <div
          class="code-column"
          v-for="i in 8"
          :key="i"
          :style="{
            left: i * 12 + '%',
            animationDelay: i * 0.5 + 's'
          }"
        >
          <span>{{ '01' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
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

  .tab-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    background: rgba(255, 255, 255, 0.03);
    padding: 4px;
    border-radius: 12px;

    .tab-btn {
      flex: 1;
      padding: 10px 20px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.5);
      font-size: 15px;
      font-weight: 500;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        color: #36d399;
      }

      &.active {
        background: rgba(54, 211, 153, 0.1);
        color: #36d399;
      }
    }
  }

  .login-form {
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

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      :deep(.el-checkbox__inner) {
        background-color: #151b2b;
        border-radius: 50%;
      }

      :deep(.el-checkbox__label) {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
      }

      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #36d399;
        border-color: #36d399;
      }

      .forgot-link {
        color: #36d399;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s ease;

        &:hover {
          color: #16bb82;
        }
      }
    }

    .code-group {
      display: flex;
      gap: 10px;
      width: 100%;

      .code-input {
        flex: 2;
      }

      .code-btn {
        height: auto;
        flex: 1;
        background: rgba(54, 211, 153, 0.1);
        border: 1px solid rgba(54, 211, 153, 0.3);
        color: #36d399;
        font-weight: 500;
        padding: 0 20px;
        border-radius: 10px;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background: rgba(54, 211, 153, 0.2);
          border-color: #36d399;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
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

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(54, 211, 153, 0.4);
      }

      &:active {
        transform: translateY(0);
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

// 表单切换动画
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 0.3s ease;
}

.form-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.form-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 右侧创意背景
.fluid-background {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%);
  overflow: hidden;

  // 3D画布
  .three-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;

    canvas {
      display: block;
    }
  }

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

  // 几何装饰圆环
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

  // 漂浮粒子
  .particles {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(54, 211, 153, 0.6);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(54, 211, 153, 0.8);
      animation: particleFloat 20s linear infinite;
    }
  }

  // 旋转光环
  .rotating-rings {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;

    .ring {
      position: absolute;
      border: 1px solid;
      border-radius: 50%;
      opacity: 0.15;
    }

    .ring-1 {
      width: 100%;
      height: 100%;
      border-color: rgba(54, 211, 153, 0.3);
      animation: rotate 30s linear infinite;
      border-style: dashed;
    }

    .ring-2 {
      width: 70%;
      height: 70%;
      top: 15%;
      left: 15%;
      border-color: rgba(99, 102, 241, 0.3);
      animation: rotate 40s linear infinite reverse;
      border-style: dotted;
    }

    .ring-3 {
      width: 40%;
      height: 40%;
      top: 30%;
      left: 30%;
      border-color: rgba(236, 72, 153, 0.3);
      animation: rotate 25s linear infinite;
    }
  }

  // 代码雨效果
  .code-rain {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    opacity: 0.1;

    .code-column {
      position: absolute;
      top: -100%;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #36d399;
      animation: codeRain 15s linear infinite;
      text-shadow: 0 0 5px rgba(54, 211, 153, 0.8);

      span {
        display: block;
        line-height: 1.5;
      }
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

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px);
    opacity: 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes codeRain {
  0% {
    top: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

// 移动端适配
@media (max-width: 1024px) {
  .login-page {
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
    // display: none;
    flex: 1;
    .fluid-shape {
      width: 300px !important;
      height: 300px !important;
    }
  }
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .form-card {
    padding: 10px 20px;
    flex: none;
    width: auto;
    height: 100vh;
    overflow-y: auto;
    box-shadow: none;
    border-bottom: 2px solid rgb(20, 31, 48);
  }

  .fluid-background {
    // display: none;
    flex: 1;
    .fluid-shape {
      width: 300px !important;
      height: 300px !important;
    }
  }
}
</style>
