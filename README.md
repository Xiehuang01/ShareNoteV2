<div align="center">
  <img src="./sharenote/public/icon.png" alt="ShareNote Logo" width="120" height="120">
  
  # 📝 ShareNote
  
  <p>一个现代化的智能笔记协作平台</p>
  
  ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
  ![Redis](https://img.shields.io/badge/Redis-5.0-DC382D?logo=redis&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-blue.svg)
</div>

---

## 🌟 项目简介

ShareNote 是一个功能完整的现代化在线笔记协作平台，支持 Markdown 编辑、AI 智能助手、实时协作、文件管理等功能。采用前后端分离架构，提供流畅的用户体验和安全的数据管理。

### ✨ 核心特性

#### 📝 笔记管理
- **Markdown 编辑器** - 实时预览、代码高亮、语法支持
- **AI 智能助手** - 集成 SiliconFlow AI，支持内容优化、续写、总结
- **Diff 对比** - AI 修改建议可视化，支持逐条接受/拒绝
- **图片管理** - 自动上传、引用追踪、删除清理
- **版本控制** - 笔记历史记录（规划中）

#### 👥 协作功能
- **群组管理** - 创建/加入群组，多人协作
- **权限控制** - 所有者/管理员/成员三级权限
- **成员管理** - 添加/移除成员、角色分配、权限转移
- **群组操作** - 退出群组、解散群组、转让所有权

#### 🔐 用户系统
- **注册登录** - 邮箱验证、极验验证码防护
- **密码管理** - 加密存储、邮箱找回、安全重置
- **JWT 认证** - Token 自动刷新、权限验证
- **个人中心** - 资料编辑、头像上传、AI 配置

#### 🎨 界面设计
- **现代 UI** - 深色主题、流体背景、3D 粒子效果
- **响应式** - 完美适配桌面端和移动端
- **动画效果** - 流畅的过渡动画、交互反馈
- **可访问性** - 符合 WCAG 标准

---

## 🛠️ 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5.x | 渐进式 JavaScript 框架 |
| Vite | 7.x | 下一代前端构建工具 |
| Element Plus | 最新 | Vue 3 UI 组件库 |
| Pinia | 最新 | Vue 状态管理 |
| Vue Router | 4.x | 官方路由管理器 |
| Axios | 最新 | HTTP 客户端 |
| Marked | 最新 | Markdown 解析器 |
| Highlight.js | 最新 | 代码语法高亮 |
| diff-match-patch | 最新 | 文本差异对比 |
| Three.js | 最新 | 3D 图形库 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20+ | JavaScript 运行环境 |
| Express | 5.1.x | Web 应用框架 |
| MySQL | 8.0 | 关系型数据库 |
| Redis | 5.0 | 内存数据库/缓存 |
| JWT | 最新 | 身份认证 |
| bcryptjs | 最新 | 密码加密 |
| Multer | 最新 | 文件上传中间件 |
| Nodemailer | 最新 | 邮件发送服务 |

---

## 📦 功能模块

### 1. 用户认证模块
- ✅ 用户注册（邮箱验证码）
- ✅ 用户登录（JWT Token）
- ✅ 密码加密存储（bcryptjs）
- ✅ 忘记密码（邮箱找回）
- ✅ 极验验证码防护
- ✅ Token 自动刷新

### 2. 笔记管理模块
- ✅ 创建/编辑/删除笔记
- ✅ Markdown 实时预览
- ✅ 代码语法高亮
- ✅ 图片上传与管理
- ✅ 图片引用追踪
- ✅ 自动删除未引用图片
- ✅ 权限控制（所有者/管理员）

### 3. AI 助手模块
- ✅ SiliconFlow AI 集成
- ✅ 流式响应支持
- ✅ 多模型选择（DeepSeek-V3、Qwen 等）
- ✅ Diff 对比显示
- ✅ 逐条接受/拒绝修改
- ✅ AI 配置持久化

### 4. 群组协作模块
- ✅ 创建/加入群组
- ✅ 群组成员管理
- ✅ 三级权限控制（所有者/管理员/成员）
- ✅ 角色分配与变更
- ✅ 成员添加/移除
- ✅ 群组转让/解散
- ✅ 退出群组

### 5. 文件管理模块
- ✅ 文件上传（Multer）
- ✅ 文件存储管理
- ✅ 图片引用追踪
- ✅ 自动清理未使用文件
- ✅ 文件权限控制

---

## 🚀 快速开始

### 环境要求

```
Node.js >= 20.19.0
MySQL >= 8.0
Redis >= 5.0
pnpm >= 8.0 (推荐)
```

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd ShareNoteV2
```

#### 2. 安装依赖

**前端：**
```bash
cd sharenote
pnpm install
```

**后端：**
```bash
cd Server
pnpm install
```

#### 3. 配置数据库

创建 MySQL 数据库：
```sql
CREATE DATABASE sharenotev2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

导入数据库结构（如果有 SQL 文件）：
```bash
mysql -u root -p sharenotev2 < database.sql
```

修改 `Server/database/db.js`：
```javascript
export const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'your-username',
    password: 'your-password',
    database: 'sharenotev2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})
```

#### 4. 配置 Redis

确保 Redis 服务已启动：
```bash
# Windows
redis-server

# Linux/Mac
sudo service redis-server start
```

修改 `Server/utils/redis.js`（如需要）：
```javascript
const client = redis.createClient({
    host: 'localhost',
    port: 6379
})
```

#### 5. 配置邮件服务

修改 `Server/utils/email.js`：
```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail', // 或其他邮件服务
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
})
```

#### 6. 配置 AI 服务（可选）

在前端设置页面配置 SiliconFlow API：
- API Key: 从 [SiliconFlow](https://siliconflow.cn) 获取
- Base URL: `https://api.siliconflow.cn/v1`
- 模型选择: DeepSeek-V3、Qwen 等

#### 7. 启动项目

**开发环境：**

```bash
# 终端 1 - 启动后端
cd Server
node server.js

# 终端 2 - 启动前端
cd sharenote
pnpm dev
```

**生产环境：**

```bash
# 构建前端
cd sharenote
pnpm build

# 启动后端
cd Server
NODE_ENV=production node server.js
```

#### 8. 访问应用

- **前端地址**: http://localhost:5173
- **后端地址**: http://localhost:3000

---

## 📁 项目结构

```
ShareNoteV2/
├── Server/                          # 后端服务
│   ├── database/                    # 数据库配置
│   │   └── db.js                   # MySQL 连接池
│   ├── middlewares/                 # 中间件
│   │   └── auth.js                 # JWT 认证中间件
│   ├── routers/                     # 路由模块
│   │   ├── user.js                 # 用户管理
│   │   ├── email.js                # 邮件服务
│   │   ├── files.js                # 文件上传
│   │   ├── notes.js                # 笔记管理
│   │   ├── group.js                # 群组管理
│   │   ├── geetest.js              # 验证码
│   │   └── ai.js                   # AI 服务
│   ├── utils/                       # 工具函数
│   │   ├── redis.js                # Redis 客户端
│   │   └── email.js                # 邮件配置
│   ├── upload/                      # 文件上传目录
│   │   └── images/                 # 图片存储
│   └── server.js                    # 服务入口
│
└── sharenote/                       # 前端应用
    ├── src/
    │   ├── api/                     # API 接口
    │   │   ├── user.js             # 用户接口
    │   │   ├── email.js            # 邮件接口
    │   │   ├── files.js            # 文件接口
    │   │   ├── notes.js            # 笔记接口
    │   │   ├── group.js            # 群组接口
    │   │   └── ai.js               # AI 接口
    │   ├── assets/                  # 静态资源
    │   ├── components/              # 公共组件
    │   │   ├── AIAssistant.vue     # AI 助手
    │   │   ├── ChangeGroup.vue     # 群组管理
    │   │   └── ...
    │   ├── router/                  # 路由配置
    │   │   └── index.js            # 路由定义
    │   ├── stores/                  # Pinia 状态管理
    │   │   └── user.js             # 用户状态
    │   ├── utils/                   # 工具函数
    │   │   └── request.js          # Axios 封装
    │   ├── views/                   # 页面组件
    │   │   ├── login/              # 登录注册
    │   │   │   ├── LoginPage.vue   # 登录页（3D 粒子效果）
    │   │   │   └── ForgetPassword.vue # 找回密码
    │   │   ├── layout/             # 布局页
    │   │   │   └── LayoutPage.vue  # 主布局
    │   │   ├── notes/              # 笔记页面
    │   │   │   └── NotesPage.vue   # 笔记编辑
    │   │   └── settings/           # 设置页面
    │   │       └── SettingsPage.vue # 用户设置
    │   ├── App.vue                  # 根组件
    │   └── main.js                  # 入口文件
    ├── public/                      # 公共资源
    │   ├── icon.png                # 应用图标
    │   └── ...
    ├── index.html                   # HTML 模板
    ├── vite.config.js              # Vite 配置
    ├── package.json                # 依赖配置
    └── README.md                   # 前端说明
```

---

## 🔧 开发指南

### 代码规范

项目使用 ESLint + Prettier 进行代码规范检查：

```bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint --fix
```

Git 提交前会自动运行 lint-staged 检查（通过 Husky）。

### API 接口文档

#### 基础信息
- **Base URL**: `http://localhost:3000`
- **认证方式**: JWT Token (Header: `Authorization: Bearer <token>`)

#### 主要接口

**用户模块** (`/api/user`)
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `GET /profile` - 获取用户信息
- `PUT /profile` - 更新用户信息
- `POST /changePassword` - 修改密码

**笔记模块** (`/api/notes`)
- `GET /` - 获取笔记列表
- `POST /` - 创建笔记
- `GET /:id` - 获取笔记详情
- `PUT /:id` - 更新笔记
- `DELETE /:id` - 删除笔记

**群组模块** (`/api/group`)
- `POST /create` - 创建群组
- `POST /join` - 加入群组
- `GET /list` - 获取群组列表
- `POST /updateGroupName` - 更新群组名称
- `POST /updateMemberRole` - 更新成员角色
- `POST /removeMember` - 移除成员
- `POST /transferOwnership` - 转让所有权
- `POST /disbandGroup` - 解散群组
- `POST /leaveGroup` - 退出群组

**文件模块** (`/api/files`)
- `POST /upload` - 上传文件
- `DELETE /deleteImage/:imageName` - 删除图片

**AI 模块** (`/api/ai`)
- `POST /chat` - AI 对话（流式响应）

### 环境变量

建议在生产环境使用环境变量管理敏感信息：

```bash
# .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=sharenotev2

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-jwt-secret

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

SILICONFLOW_API_KEY=your-api-key
```

---

## 🔐 安全说明

### 已实施的安全措施

1. **密码安全**
   - 使用 bcryptjs 加密存储
   - 加密强度：10 轮 salt

2. **身份认证**
   - JWT Token 认证
   - Token 过期时间：7 天
   - 自动刷新机制

3. **验证码防护**
   - 极验验证码（GeeTest）
   - 防止暴力破解和机器人攻击

4. **权限控制**
   - 基于角色的访问控制（RBAC）
   - 三级权限：所有者/管理员/成员
   - 接口级权限验证

5. **数据验证**
   - 前端表单验证
   - 后端参数校验
   - SQL 注入防护（参数化查询）

6. **文件安全**
   - 文件类型限制
   - 文件大小限制
   - 文件名随机化

### 安全建议

- ✅ 生产环境使用 HTTPS
- ✅ 定期更新依赖包
- ✅ 使用环境变量管理敏感信息
- ✅ 启用 CORS 白名单
- ✅ 实施 Rate Limiting
- ✅ 定期备份数据库
- ✅ 监控异常登录行为

---

## 🎯 功能演示

### 登录页面
- 现代化 UI 设计
- 3D 粒子文字效果（Three.js）
- 流体背景动画
- 响应式布局

### 笔记编辑
- Markdown 实时预览
- 代码语法高亮
- 图片拖拽上传
- AI 智能助手

### AI 助手
- 流式响应
- Diff 对比显示
- 逐条接受/拒绝
- 多模型支持

### 群组协作
- 成员管理
- 权限控制
- 角色分配
- 群组操作

---

## 📝 待优化项

### 功能优化
- [ ] 笔记分类和标签系统
- [ ] 笔记搜索功能（全文搜索）
- [ ] 笔记分享链接（公开/私密）
- [ ] 笔记导出（PDF/Word）
- [ ] 笔记模板功能
- [ ] 笔记回收站
- [ ] 笔记版本历史

### 协作优化
- [ ] 实时协作编辑（WebSocket）
- [ ] 评论和讨论功能
- [ ] @提及成员
- [ ] 活动日志
- [ ] 通知系统

### 性能优化
- [ ] 笔记列表分页
- [ ] 图片懒加载
- [ ] 虚拟滚动
- [ ] CDN 加速
- [ ] 缓存优化

### 技术优化
- [ ] 单元测试（Jest/Vitest）
- [ ] E2E 测试（Playwright）
- [ ] API 文档（Swagger）
- [ ] Docker 容器化
- [ ] CI/CD 自动化部署
- [ ] 日志系统（Winston）
- [ ] 监控告警（Prometheus）

---

## 🐛 已知问题

目前暂无已知严重问题。如发现 Bug，请提交 Issue。

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码提交规范

使用 Conventional Commits 规范：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 👨‍💻 作者

如有问题或建议，欢迎：
- 提交 Issue
- 发起 Pull Request
- 联系作者

---

## 🙏 致谢

感谢以下开源项目：
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Express](https://expressjs.com/)
- [Three.js](https://threejs.org/)
- [SiliconFlow](https://siliconflow.cn/)

---

<div align="center">
  <sub>Built with ❤️ using Vue 3, Express, and Three.js</sub>
  <br>
  <sub>© 2025 ShareNote. All rights reserved.</sub>
</div>
