# ShareNote 项目开发文档

## 📊 项目概览

**项目名称**: ShareNote - 在线笔记分享平台  
**项目类型**: 前后端分离的全栈应用  
**开发阶段**: 核心功能已实现，处于功能完善阶段  
**总体完成度**: ~70%

---

## 🏗️ 技术架构

### 整体架构
- **前后端分离**: Vue 3 SPA + Express REST API
- **数据库**: MySQL 8 (主数据存储) + Redis 5 (缓存/验证码)
- **认证方式**: JWT Token + 邮箱验证码
- **文件存储**: 本地文件系统 + Multer 上传管理

### 前端技术栈
```
Vue 3 (Composition API)     # 前端框架
├── Vite 7                  # 构建工具
├── Pinia                   # 状态管理 + 持久化
├── Vue Router 4            # 路由管理
├── Element Plus            # UI组件库
├── Marked + Highlight.js   # Markdown渲染 + 代码高亮
├── Axios                   # HTTP客户端
└── ESLint + Prettier       # 代码规范
```

### 后端技术栈
```
Express 5                   # Web框架
├── MySQL 2                 # 数据库驱动 (连接池)
├── Redis                   # 缓存服务
├── JWT                     # 身份认证
├── bcryptjs                # 密码加密
├── Multer                  # 文件上传
├── Nodemailer              # 邮件服务
└── 极验验证码               # 人机验证
```

---

## 📁 项目结构

### 前端结构 (sharenote/)
```
src/
├── api/                    # API 接口层
│   ├── user.js            # 用户相关接口
│   ├── files.js           # 文件相关接口
│   └── email.js           # 邮件相关接口
├── components/             # 可复用组件
│   ├── AddNotes.vue       # 笔记上传组件 ✅
│   └── ChangeGroup.vue    # 分组切换组件 ⚠️
├── router/                 # 路由配置
│   └── index.js           # 路由定义 + 路由守卫 ✅
├── stores/                 # Pinia 状态管理
│   └── user.js            # 用户状态 ✅
├── utils/                  # 工具函数
│   └── request.js         # Axios 实例 + 拦截器 ✅
├── views/                  # 页面组件
│   ├── login/
│   │   ├── LoginPage.vue      # 登录/注册页 ✅
│   │   └── ForgetPassword.vue # 忘记密码页 ✅
│   ├── layout/
│   │   └── LayoutPage.vue     # 主布局页 ✅
│   └── main/
│       ├── NotesPage.vue      # 笔记展示页 ⚠️ (有Bug)
│       ├── ProfilesPage.vue   # 个人资料页 ✅
│       └── SettingsPage.vue   # 设置页 ❌ (空页面)
├── App.vue                 # 根组件 (主题切换) ✅
└── main.js                 # 应用入口 ✅
```

### 后端结构 (Server/)
```
Server/
├── database/               # 数据库配置
│   └── db.js              # MySQL 连接池 ✅
├── middlewares/            # 中间件
│   └── auth.js            # JWT 认证中间件 ✅
├── routers/                # 路由模块
│   ├── login.js           # 登录/注册/密码重置 ✅
│   ├── user.js            # 用户信息管理 ✅
│   ├── file.js            # 文件上传/笔记管理 ✅
│   ├── email.js           # 邮件服务 ✅
│   └── geetest.js         # 极验验证码 ✅
├── utils/                  # 工具函数
│   ├── redis.js           # Redis 连接 ✅
│   └── nodemailer.js      # 邮件配置 ✅
├── upload/                 # 文件上传目录
│   └── files/             # 笔记文件存储
└── server.js              # 应用入口 ✅
```

---

## ✨ 功能实现状态

### 用户系统 ✅ (95% 完成)
- [x] 用户注册 (邮箱验证)
- [x] 用户登录 (JWT Token)
- [x] 忘记密码 (三步流程重置)
- [x] 获取用户信息
- [x] 极验验证码防护
- [x] 密码加密存储 (bcryptjs)
- [x] 路由守卫 (未登录重定向)

### 笔记管理 ⚠️ (70% 完成)
- [x] 笔记上传 (Markdown/PDF/图片)
- [x] 笔记列表展示
- [x] Markdown 渲染 (Marked)
- [x] 代码语法高亮 (Highlight.js)
- [x] 目录自动生成 + 平滑滚动
- [ ] 笔记搜索 (UI已实现，功能未实现)
- [ ] 笔记编辑 (仅支持查看)
- [ ] 笔记删除 (UI已实现，功能未实现)
- [ ] 分组管理 (UI已实现，功能未实现)

### 文件管理 ✅ (80% 完成)
- [x] 文件上传 (Multer)
- [x] 文件存储管理
- [x] 文件元数据记录
- [x] 文件类型校验
- [ ] 文件大小限制检查
- [ ] 文件压缩

### 其他功能 ✅ (85% 完成)
- [x] 邮件服务 (Nodemailer + 163邮箱)
- [x] Redis 缓存 (验证码存储)
- [x] 请求/响应拦截器
- [x] 响应式设计
- [x] 主题切换 (亮色/暗色)
- [x] 代码规范 (ESLint + Prettier + Husky)

---

## 🔧 核心功能详解

### 1. 用户认证流程

**注册流程**:
1. 用户填写用户名、密码、邮箱
2. 极验验证码验证
3. 发送邮箱验证码 (6位数字，5分钟有效)
4. 验证邮箱验证码
5. 密码加密存储 (bcryptjs, salt=10)
6. 返回 JWT Token

**登录流程**:
1. 用户名/密码验证
2. 密码比对 (bcryptjs.compareSync)
3. 生成 JWT Token (无过期时间 ⚠️)
4. 前端存储 Token (localStorage)

**忘记密码流程**:
1. 输入邮箱 → 查找用户名
2. 发送重置验证码 → 验证邮箱验证码
3. 设置新密码 → 更新数据库

### 2. 笔记管理系统

**文件上传**:
- 支持格式: Markdown (.md), PDF (.pdf), 图片 (.jpg, .png, .gif)
- 存储路径: `Server/upload/files/`
- 文件命名: `时间戳_原文件名`
- 数据库记录: 文件元数据 (ID, 发布者, 自定义名称, 原始名称, 存储名称, 类型, 路径, 创建时间)

**Markdown 渲染**:
- 使用 Marked 库解析 Markdown
- Highlight.js 提供代码高亮
- 自动生成目录 (H1-H6 标题)
- 目录点击平滑滚动到对应位置

### 3. 邮件服务

**SMTP 配置**:
- 服务商: 163邮箱
- 发件人: xiehuang_top@163.com
- 加密: SSL (端口 465)

**邮件模板**:
- HTML 格式
- 包含验证码和有效期提示
- 响应式设计

---

## ⚠️ 存在的问题

### 🚨 紧急问题 (需立即修复)

**1. NotesPage.vue 语法错误** (第28行)
```javascript
// 错误代码
if (token.type === 'heading') {fo  // ❌ 'fo' 是多余的
```
- 影响: 页面无法正常渲染
- 修复: 删除 'fo'

**2. 安全隐患**
```javascript
// 硬编码敏感信息
host: '103.194.106.239',
password: 'serveruser12138',     // ❌ 数据库密码暴露
pass: 'XBc7EcqjQvXDqRCJ',       // ❌ 邮箱密码暴露
SECRET_KEY: 'aqgy1213812138',    // ❌ JWT密钥暴露
key: 'b925e84653f29440fcbbd7bd5b039086'  // ❌ 极验密钥暴露
```

**3. JWT 无过期时间**
```javascript
const newToken = jwt.sign({id}, SECRET_KEY)  // ❌ 无过期时间
```

### ⚠️ 功能问题

**1. 未完成的功能**
- 笔记搜索 (UI完成，功能未实现)
- 分组管理 (UI完成，功能未实现)
- 设置页面 (空页面)
- 笔记编辑/删除 (仅支持查看)
- 用户头像上传

**2. 性能问题**
- 笔记列表无分页
- 无缓存策略
- 文件上传无大小限制
- 无请求去重

**3. 用户体验问题**
- 加载状态提示不完善
- 错误提示不够友好
- 无操作确认对话框

### 📝 代码质量问题

**1. 命名不规范**
- 变量命名不一致 (isloading vs isLoading)
- 拼写错误 (eamilVerifyCode vs emailVerifyCode)

**2. 错误处理不完善**
- 后端缺少全局错误处理中间件
- 前端缺少错误边界
- 网络错误处理不充分

**3. 缺少测试**
- 无单元测试
- 无集成测试
- 无 E2E 测试

---

## 📊 数据库设计

### 推断的表结构

**users 表**:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- bcrypt 加密
  email VARCHAR(100) UNIQUE NOT NULL,
  avatarpath VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**files 表**:
```sql
CREATE TABLE files (
  fileId INT PRIMARY KEY AUTO_INCREMENT,
  publisherId INT NOT NULL,              -- 外键关联 users.id
  fileCustomName VARCHAR(255),           -- 用户自定义文件名
  fileOriginalName VARCHAR(255),         -- 原始文件名
  fileName VARCHAR(255),                 -- 存储文件名 (时间戳_原文件名)
  fileType VARCHAR(50),                  -- 文件类型 (md, pdf, jpg, etc.)
  filePath VARCHAR(500),                 -- 文件存储路径
  createdTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publisherId) REFERENCES users(id)
);
```

---

## 🎯 优化建议

### 高优先级 (立即修复)
1. ❌ **修复 NotesPage.vue 语法错误**
2. ❌ **配置环境变量管理敏感信息**
3. ❌ **添加 JWT 过期时间**
4. ❌ **完善错误处理机制**

### 中优先级 (近期完成)
1. ⚠️ **实现笔记搜索功能**
2. ⚠️ **实现笔记编辑/删除功能**
3. ⚠️ **实现分组管理功能**
4. ⚠️ **添加分页功能**
5. ⚠️ **完善设置页面**

### 低优先级 (后续优化)
1. 📝 添加单元测试
2. 📝 编写 API 文档 (Swagger)
3. 📝 性能优化 (缓存、压缩)
4. 📝 Docker 容器化部署

---

## 🚀 部署配置

### 开发环境
```bash
# 前端 (端口 5173)
cd sharenote
pnpm dev

# 后端 (端口 3000)
cd Server
node server.js
```

### 生产环境
```bash
# 构建前端
cd sharenote
pnpm build

# 启动后端
cd Server
pnpm start
```

### 环境要求
- Node.js >= 20.19.0
- MySQL >= 8.0
- Redis >= 5.0
- pnpm (推荐)

---

## 📈 开发进度统计

| 模块 | 完成度 | 状态 | 备注 |
|------|--------|------|------|
| 用户认证系统 | 95% | ✅ | 基本完成，需修复安全隐患 |
| 笔记管理系统 | 70% | ⚠️ | 查看功能完成，编辑删除待实现 |
| 文件管理系统 | 80% | ✅ | 上传完成，需添加限制检查 |
| 邮件服务 | 100% | ✅ | 完全实现 |
| 前端 UI | 85% | ✅ | 主要页面完成，设置页待开发 |
| 后端 API | 90% | ✅ | 核心接口完成 |
| 代码质量 | 60% | ❌ | 存在语法错误和安全隐患 |
| 测试覆盖 | 0% | ❌ | 未开始 |
| 文档完善 | 20% | ❌ | 仅有基础 README |

**总体评估**: 项目具有良好的架构基础，核心功能已实现，但需要修复现有问题并完善功能细节。

---

## 💡 技术亮点

1. **现代化技术栈**: Vue 3 + Vite + Pinia + Express 5
2. **完整的认证体系**: JWT + 邮箱验证 + 极验验证码
3. **Markdown 支持**: 实时渲染 + 代码高亮 + 目录导航
4. **工程化配置**: ESLint + Prettier + Husky 代码规范
5. **响应式设计**: 支持多设备适配
6. **主题切换**: 亮色/暗色模式

---

## 📝 总结

ShareNote 是一个功能相对完整的笔记分享平台，采用现代化的前后端分离架构。项目已完成核心功能开发，包括用户认证、笔记管理、文件上传等模块。

**优势**:
- 技术栈主流且现代化
- 功能设计合理完整
- 代码结构清晰
- 工程化配置完善

**不足**:
- 存在代码质量问题需要修复
- 部分功能未完全实现
- 缺少测试和完整文档
- 安全性需要加强

**建议**: 优先修复现有问题，完善核心功能，然后进行代码优化和测试补充。项目具有良好的发展潜力，适合作为全栈开发的展示项目。

---

*最后更新: 2026-01-26*