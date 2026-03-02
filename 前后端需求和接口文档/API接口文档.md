# ShareNote V2 - API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **认证方式**: JWT Token (放在请求头 `Authorization` 字段)
- **响应格式**: JSON

## 通用响应格式

### 成功响应
```json
{
  "status": "success",
  "message": "操作成功",
  "data": { ... }
}
```

### 失败响应
```json
{
  "status": "fail",
  "message": "错误信息"
}
```

## 1. 认证接口

### 1.1 用户注册

**接口**: `POST /loginup`

**请求参数**:
```json
{
  "username": "string",    // 用户名，必填
  "password": "string",    // 密码，必填
  "email": "string"        // 邮箱，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "注册成功!"
}
```

**错误码**:
- 401: 用户名已存在 / 邮箱已存在
- 500: 服务器错误

---

### 1.2 用户登录

**接口**: `POST /loginin`

**请求参数**:
```json
{
  "username": "string",    // 用户名，必填
  "password": "string"     // 密码，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**错误码**:
- 401: 用户名不存在 / 密码不一致
- 500: 服务器错误

---

### 1.3 找回用户名

**接口**: `POST /findusername`

**请求参数**:
```json
{
  "email": "string"        // 邮箱，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "用户名已找到",
  "data": [
    {
      "username": "testuser"
    }
  ]
}
```

**错误码**:
- 401: 邮箱不存在

---

### 1.4 修改密码

**接口**: `POST /changepassword`

**请求参数**:
```json
{
  "email": "string",       // 邮箱，必填
  "password": "string"     // 新密码，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "修改密码成功!"
}
```

**错误码**:
- 401: 邮箱不存在 / 服务器未响应
- 500: 服务器错误

---

## 2. 邮件接口

### 2.1 发送注册验证码

**接口**: `POST /sendemailcode`

**请求参数**:
```json
{
  "username": "string",    // 用户名，必填
  "email": "string"        // 邮箱，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "验证码发送成功!"
}
```

**说明**:
- 验证码有效期：5分钟
- 验证码存储在 Redis 中，键名：`email:{email}`

**错误码**:
- 400: 邮箱不能为空
- 401: 用户名已存在 / 邮箱已存在
- 500: 发送失败，请稍后重试

---

### 2.2 发送密码重置验证码

**接口**: `POST /sendchangepasswordcode`

**请求参数**:
```json
{
  "email": "string",           // 邮箱，必填
  "usernameFound": "string"    // 用户名，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "验证码已发送"
}
```

**说明**:
- 验证码有效期：5分钟
- 验证码存储在 Redis 中，键名：`emailChangePassword:{email}`

**错误码**:
- 500: 发送验证码失败，服务器未响应

---

### 2.3 验证验证码

**接口**: `POST /verifycode`

**请求参数**:
```json
{
  "email": "string",       // 邮箱，必填
  "code": "string",        // 验证码，必填
  "option": 1              // 选项：1-注册验证码，2-密码重置验证码
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "验证码通过！"
}
```

**错误码**:
- 400: 验证码已失效 / 验证码错误
- 500: 服务器错误

---

## 3. 用户信息接口

### 3.1 获取用户信息

**接口**: `GET /getUserInfo`

**请求头**:
```
Authorization: {token}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "查询成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatarpath": "/upload/avatar/avatar_1_1234567890.png"
  }
}
```

**错误码**:
- 401: 未提供 token / token无效或已过期
- 500: 服务器错误

---

### 3.2 更新用户信息

**接口**: `POST /updateUserInfo`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "username": "string",    // 用户名，必填
  "email": "string"        // 邮箱，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "用户信息更新成功"
}
```

**错误码**:
- 400: 用户名或邮箱已存在
- 401: 未授权
- 500: 服务器错误

---

### 3.3 上传头像

**接口**: `POST /uploadAvatar`

**请求头**:
```
Authorization: {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
avatar: File              // 头像文件，必填
```

**响应示例**:
```json
{
  "status": "success",
  "message": "头像上传成功",
  "data": {
    "avatarPath": "/upload/avatar/avatar_1_1234567890.png"
  }
}
```

**说明**:
- 支持格式：jpeg, jpg, png, gif, webp
- 文件大小限制：10MB
- 自动裁剪为圆形
- 自动删除旧头像

**错误码**:
- 400: 未收到头像文件
- 401: 未授权
- 500: 服务器错误

---

## 4. 文件管理接口

### 4.1 上传笔记

**接口**: `POST /uploadnotes`

**请求头**:
```
Authorization: {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
file: File[]              // 文件数组，必填（支持多文件）
fileCustomName: string    // 自定义文件名，可选
```

**响应示例**:
```json
{
  "status": "success",
  "message": "文件上传成功",
  "data": [
    {
      "fileCustomName": "我的笔记",
      "filename": "1234567890_note.md",
      "originalname": "note.md",
      "filesize": 1024,
      "path": "/upload/files/1234567890_note.md"
    }
  ]
}
```

**说明**:
- 支持多文件上传（最多500个）
- Markdown 文件会自动处理图片路径
- 图片会自动关联到 markdownFiles 表
- 文件名格式：`时间戳_原文件名`

**错误码**:
- 400: 未收到文件
- 401: 未授权
- 500: 服务器错误

---

### 4.2 获取笔记列表

**接口**: `GET /getNotesList`

**请求头**:
```
Authorization: {token}
```

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "fileId": 1,
      "publisherId": 1,
      "fileCustomName": "我的笔记",
      "fileOriginalName": "note.md",
      "fileName": "1234567890_note.md",
      "fileType": "text/markdown",
      "filePath": "/upload/files/1234567890_note.md",
      "createdTime": "2026-03-02 10:00:00"
    }
  ]
}
```

**错误码**:
- 401: 未授权
- 500: 服务器未响应

---

### 4.3 下载文件

**接口**: `GET /download`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```
path: string              // 文件相对路径，必填
```

**响应**:
- 文件流（浏览器自动下载）

**错误码**:
- 400: 缺少文件路径参数
- 404: 数据库无该文件记录 / 文件不存在
- 500: 下载失败

---

### 4.4 删除文件

**接口**: `DELETE /deleteFile/:fileId`

**请求头**:
```
Authorization: {token}
```

**路径参数**:
```
fileId: number            // 文件ID，必填
```

**响应示例**:
```json
{
  "status": "success",
  "message": "文件删除成功"
}
```

**说明**:
- 删除 Markdown 文件会级联删除关联的图片
- 同时删除数据库记录和物理文件

**错误码**:
- 400: 缺少文件ID参数
- 404: 文件不存在或无权限删除
- 500: 服务器错误

---

### 4.5 删除图片

**接口**: `DELETE /deleteImage/:imageName`

**请求头**:
```
Authorization: {token}
```

**路径参数**:
```
imageName: string         // 图片名称，必填
```

**响应示例**:
```json
{
  "status": "success",
  "message": "图片删除成功"
}
```

**说明**:
- 用于删除 Markdown 中未使用的图片
- 同时删除数据库记录和物理文件

**错误码**:
- 400: 缺少图片名称参数
- 404: 图片不存在或无权限删除
- 500: 服务器错误

---

### 4.6 更新文件内容

**接口**: `POST /updateFile`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "fileName": "string",    // 文件名，必填
  "content": "string"      // 文件内容，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "文件更新成功"
}
```

**错误码**:
- 400: 缺少文件名或内容参数
- 404: 文件不存在或无权限修改
- 500: 服务器错误

---

## 5. 小组管理接口

### 5.1 获取用户小组列表

**接口**: `GET /getUserGroups`

**请求头**:
```
Authorization: {token}
```

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "groupId": 1,
      "groupName": "学习小组",
      "creatorId": 1,
      "createdTime": "2026-03-02 10:00:00",
      "isActive": 1,
      "maxMembers": 10,
      "role": "owner",
      "joinedTime": "2026-03-02 10:00:00",
      "memberCount": 5
    }
  ]
}
```

**错误码**:
- 401: 未授权
- 500: 服务器错误

---

### 5.2 创建小组

**接口**: `POST /createGroup`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupName": "string",   // 小组名称，必填
  "maxMembers": 5          // 最大成员数，可选，默认5，范围2-15
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "创建小组成功",
  "data": {
    "groupId": 1,
    "groupName": "学习小组",
    "maxMembers": 10,
    "role": "owner"
  }
}
```

**错误码**:
- 400: 小组名称不能为空 / 小组人数必须在2-15人之间
- 401: 未授权
- 500: 创建失败

---

### 5.3 搜索小组

**接口**: `GET /searchGroups`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```
keyword: string           // 搜索关键词，必填
```

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "groupId": 1,
      "groupName": "学习小组",
      "creatorId": 1,
      "creatorName": "admin",
      "createdTime": "2026-03-02 10:00:00",
      "maxMembers": 10,
      "memberCount": 5,
      "isMember": 0,
      "isFull": 0
    }
  ]
}
```

**错误码**:
- 400: 搜索关键词不能为空
- 401: 未授权
- 500: 搜索失败

---

### 5.4 获取小组成员

**接口**: `GET /getGroupMembers`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```
groupId: number           // 小组ID，必填
```

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "avatarpath": "/upload/avatar/avatar_1.png",
      "role": "owner",
      "joinedTime": "2026-03-02 10:00:00"
    }
  ]
}
```

**错误码**:
- 400: 缺少小组ID
- 403: 无权限查看
- 500: 服务器错误

---

### 5.5 加入小组

**接口**: `POST /joinGroup`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1             // 小组ID，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "加入小组成功"
}
```

**错误码**:
- 400: 缺少小组ID / 已经是小组成员 / 小组已满
- 404: 小组不存在
- 500: 加入失败

---

### 5.6 退出小组

**接口**: `POST /leaveGroup`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1             // 小组ID，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "已退出小组"
}
```

**说明**:
- 创建者不能直接退出，需要先转移所有权

**错误码**:
- 400: 缺少小组ID / 不是小组成员 / 所有者不能直接退出
- 500: 退出失败

---

### 5.7 解散小组

**接口**: `POST /disbandGroup`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1             // 小组ID，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "小组已解散"
}
```

**说明**:
- 只有创建者可以解散小组
- 解散后所有成员被移除
- 软删除（isActive = 0）

**错误码**:
- 400: 缺少小组ID
- 403: 只有所有者可以解散小组
- 500: 解散失败

---

### 5.8 更新小组名称

**接口**: `POST /updateGroupName`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1,            // 小组ID，必填
  "groupName": "string"    // 新小组名称，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "修改成功"
}
```

**说明**:
- 只有创建者和管理员可以修改

**错误码**:
- 400: 参数错误
- 403: 无权限修改
- 500: 修改失败

---

### 5.9 更新成员角色

**接口**: `POST /updateMemberRole`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1,            // 小组ID，必填
  "userId": 2,             // 目标用户ID，必填
  "role": "admin"          // 新角色，必填（admin/member）
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "修改成功"
}
```

**说明**:
- 只有创建者可以修改成员角色
- 不能修改所有者的角色

**错误码**:
- 400: 参数错误 / 目标用户不是小组成员 / 不能修改所有者的角色
- 403: 只有所有者可以修改成员角色
- 500: 修改失败

---

### 5.10 移除成员

**接口**: `POST /removeMember`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1,            // 小组ID，必填
  "userId": 2              // 目标用户ID，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "移除成功"
}
```

**说明**:
- 创建者和管理员可以移除成员
- 不能移除所有者
- 管理员不能移除其他管理员

**错误码**:
- 400: 参数错误 / 目标用户不是小组成员 / 不能移除所有者
- 403: 无权限移除成员 / 管理员不能移除其他管理员
- 500: 移除失败

---

### 5.11 转移所有权

**接口**: `POST /transferOwnership`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```json
{
  "groupId": 1,            // 小组ID，必填
  "newOwnerId": 2          // 新所有者ID，必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "message": "转移成功"
}
```

**说明**:
- 只有创建者可以转移所有权
- 新所有者必须是小组成员
- 原所有者变为普通成员

**错误码**:
- 400: 参数错误 / 新所有者不是小组成员
- 403: 只有所有者可以转移所有权
- 500: 转移失败

---

### 5.12 获取小组笔记

**接口**: `GET /getGroupNotes`

**请求头**:
```
Authorization: {token}
```

**请求参数**:
```
groupId: number           // 小组ID，必填
```

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "fileId": 1,
      "publisherId": 1,
      "publisherName": "admin",
      "fileCustomName": "我的笔记",
      "fileOriginalName": "note.md",
      "fileName": "1234567890_note.md",
      "fileType": "text/markdown",
      "filePath": "/upload/files/1234567890_note.md",
      "createdTime": "2026-03-02 10:00:00"
    }
  ]
}
```

**错误码**:
- 400: 缺少小组ID
- 403: 无权限查看
- 500: 服务器错误

---

## 附录

### A. 角色权限表

| 操作 | 创建者 (owner) | 管理员 (admin) | 普通成员 (member) |
|------|---------------|---------------|------------------|
| 修改组名 | ✅ | ✅ | ❌ |
| 设置成员角色 | ✅ | ❌ | ❌ |
| 转移群主 | ✅ | ❌ | ❌ |
| 移除普通成员 | ✅ | ✅ | ❌ |
| 移除管理员 | ✅ | ❌ | ❌ |
| 直接退出 | ❌ | ✅ | ✅ |
| 解散小组 | ✅ | ❌ | ❌ |

### B. 文件类型支持

| 类型 | MIME Type | 说明 |
|------|-----------|------|
| Markdown | text/markdown | 支持图片自动关联 |
| 图片 | image/png, image/jpeg, image/gif | 自动关联到 Markdown |
| PDF | application/pdf | 独立文件 |
| 其他 | * | 作为附件存储 |

### C. 错误码汇总

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

**文档版本**: v2.0  
**最后更新**: 2026-03-02  
**维护者**: ShareNote Team

