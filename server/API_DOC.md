# 搭哒小程序后端 API 文档

## 基本信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 统一响应格式

### 成功响应
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {}
}
```

### 分页响应
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "list": [],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "totalPages": 10
    }
  }
}
```

### 错误响应
```json
{
  "code": -1,
  "message": "错误描述",
  "data": null
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 通用业务错误 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 1. 用户认证模块

### 1.1 微信登录

**POST** `/auth/login`

使用微信登录code进行用户认证，返回JWT token和用户信息。

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录凭证 |

**请求示例**:
```json
{
  "code": "0a1B2c3D4e5F"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userInfo": {
      "id": "u_1776975262898_6aq83r",
      "nickname": "新用户",
      "avatarUrl": "",
      "phone": "",
      "isAuthenticated": false
    }
  }
}
```

> 开发模式下（未配置WX_APPID/WX_SECRET），会自动使用模拟openid

---

### 1.2 获取用户信息

**GET** `/auth/userinfo`

获取当前登录用户的详细信息。

**请求头**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": "u_1776975262898_6aq83r",
    "nickname": "新用户",
    "avatarUrl": "",
    "phone": "",
    "gender": 0,
    "isAuthenticated": false,
    "createdAt": "2026-04-24 12:00:00",
    "stats": {
      "createdActivities": 5,
      "joinedActivities": 3
    }
  }
}
```

---

### 1.3 更新用户信息

**PUT** `/auth/userinfo`

更新当前用户的基本信息。

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称（最长20字符） |
| avatarUrl | string | 否 | 头像URL |
| gender | number | 否 | 性别（0未知/1男/2女） |

**请求示例**:
```json
{
  "nickname": "搭哒达人",
  "avatarUrl": "https://example.com/avatar.jpg",
  "gender": 1
}
```

---

### 1.4 绑定手机号

**POST** `/auth/bind-phone`

绑定用户手机号。

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号（11位） |

---

### 1.5 实名认证

**POST** `/auth/authenticate`

提交实名认证信息。

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| realName | string | 是 | 真实姓名 |
| idCard | string | 是 | 身份证号（18位） |

---

## 2. 活动管理模块

### 2.1 创建活动

**POST** `/activities`

创建一个新活动。

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 活动标题（最长50字符） |
| description | string | 是 | 活动描述 |
| categoryId | number | 否 | 分类ID |
| categoryName | string | 否 | 分类名称 |
| images | string[] | 否 | 图片URL列表 |
| startTime | string | 是 | 开始时间 |
| endTime | string | 否 | 结束时间 |
| signupDeadline | string | 否 | 报名截止时间 |
| address | string | 是 | 活动地址 |
| latitude | number | 否 | 纬度 |
| longitude | number | 否 | 经度 |
| maxMembers | number | 是 | 最大参与人数（≥2） |
| tags | string[] | 否 | 标签列表 |
| cover | string | 否 | 封面图URL |
| requirements | string | 否 | 参与要求 |
| status | string | 否 | 状态：draft/published（默认draft） |

**请求示例**:
```json
{
  "title": "周末羽毛球局",
  "description": "周末一起打羽毛球，新手友好",
  "categoryName": "运动搭子",
  "startTime": "2026-04-26 14:00",
  "address": "朝阳体育中心",
  "latitude": 39.9219,
  "longitude": 116.4435,
  "maxMembers": 6,
  "tags": ["羽毛球", "运动"],
  "status": "published"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "活动发布成功",
  "data": {
    "id": "act_1776975277046_rhsgc1",
    "creatorId": "u_1776975262898_6aq83r",
    "title": "周末羽毛球局",
    "description": "周末一起打羽毛球，新手友好",
    "categoryName": "运动搭子",
    "images": [],
    "startTime": "2026-04-26 14:00",
    "endTime": null,
    "signupDeadline": null,
    "address": "朝阳体育中心",
    "latitude": 39.9219,
    "longitude": 116.4435,
    "maxMembers": 6,
    "currentMembers": 1,
    "tags": ["羽毛球", "运动"],
    "status": "published",
    "cover": "",
    "requirements": "",
    "viewCount": 0,
    "createdAt": "2026-04-24 12:14:37",
    "updatedAt": "2026-04-24 12:14:37",
    "creator": {
      "id": "u_1776975262898_6aq83r",
      "nickname": "新用户",
      "avatarUrl": ""
    }
  }
}
```

---

### 2.2 编辑活动

**PUT** `/activities/:id`

编辑指定活动（仅创建者可操作）。

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
| 参数 | 说明 |
|------|------|
| id | 活动ID |

**请求参数**: 与创建活动相同，所有字段均为可选。

---

### 2.3 发布活动

**PUT** `/activities/:id/publish`

将草稿活动发布（仅创建者可操作）。

**请求头**:
```
Authorization: Bearer <token>
```

---

### 2.4 结束活动

**PUT** `/activities/:id/end`

结束指定活动（仅创建者可操作）。

**请求头**:
```
Authorization: Bearer <token>
```

---

### 2.5 删除活动

**DELETE** `/activities/:id`

删除指定活动（仅创建者可操作，有成员加入时不可删除）。

**请求头**:
```
Authorization: Bearer <token>
```

---

### 2.6 获取活动详情

**GET** `/activities/:id`

获取指定活动的详细信息。

**请求头**（可选）:
```
Authorization: Bearer <token>
```

> 登录用户可额外获取是否已申请的状态信息

**响应示例**:
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "id": "act_xxx",
    "title": "周末羽毛球局",
    "hasApplied": false,
    "applicationStatus": null,
    ...
  }
}
```

---

### 2.7 获取活动列表

**GET** `/activities/list`

获取已发布的活动列表，支持分页、筛选、搜索和排序。

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码（默认1） |
| pageSize | number | 否 | 每页条数（默认10） |
| category | string | 否 | 分类名称筛选 |
| status | string | 否 | 状态筛选 |
| keyword | string | 否 | 关键词搜索（标题/描述/地址） |
| location | string | 否 | 地点筛选 |
| timeRange | string | 否 | 时间范围：today/tomorrow/thisWeek |
| sortBy | string | 否 | 排序字段：created_at/start_time/view_count/current_members |
| sortOrder | string | 否 | 排序方向：DESC/ASC |

**请求示例**:
```
GET /activities/list?page=1&pageSize=10&category=运动搭子&sortBy=created_at&sortOrder=DESC
```

---

### 2.8 获取热门活动

**GET** `/activities/hot`

获取热门活动推荐列表（基于参与率和浏览量排序）。

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量（默认10） |

---

### 2.9 获取我创建的活动

**GET** `/activities/my`

获取当前用户创建的活动列表。

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| status | string | 否 | 状态筛选 |

---

## 3. 活动参与模块

### 3.1 申请加入活动

**POST** `/applications/:activityId/apply`

申请加入指定活动。

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
| 参数 | 说明 |
|------|------|
| activityId | 活动ID |

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | 是 | 申请理由 |

**业务规则**:
- 不能申请自己创建的活动
- 不能重复申请
- 活动人数已满时不可申请
- 报名截止后不可申请
- 被拒绝后不可再次申请

---

### 3.2 获取活动的申请列表

**GET** `/applications/:activityId/applications`

获取指定活动的申请列表（仅创建者可查看）。

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| status | string | 否 | 状态筛选：pending/approved/rejected |

---

### 3.3 处理申请

**PUT** `/applications/:id/handle`

通过或拒绝申请（仅活动创建者可操作）。

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 操作：approve/reject |
| remark | string | 否 | 处理备注 |

**请求示例**:
```json
{
  "action": "approve",
  "remark": "欢迎加入！"
}
```

---

### 3.4 获取我的申请记录

**GET** `/applications/my`

获取当前用户的申请记录列表。

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |
| status | string | 否 | 状态筛选 |

---

### 3.5 退出活动

**POST** `/applications/:activityId/quit`

退出已加入的活动。

**请求头**:
```
Authorization: Bearer <token>
```

**业务规则**:
- 只有已通过审核的申请才能退出
- 已结束的活动不可退出

---

### 3.6 获取我参与的活动

**GET** `/applications/joined`

获取当前用户已加入的活动列表。

**请求头**:
```
Authorization: Bearer <token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页条数 |

---

## 4. 分类模块

### 4.1 获取分类列表

**GET** `/categories`

获取所有活动分类。

**响应示例**:
```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "饭搭子",
      "code": "food",
      "icon": "🍜",
      "sortOrder": 1
    },
    {
      "id": 2,
      "name": "运动搭子",
      "code": "sports",
      "icon": "🏃",
      "sortOrder": 2
    }
  ]
}
```

---

## 5. 图片上传模块

### 5.1 上传图片

**POST** `/upload/images`

上传活动图片（最多9张）。

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| images | file[] | 是 | 图片文件（支持JPG/PNG/GIF/WebP，单张最大5MB） |

**响应示例**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "urls": [
      "http://localhost:3000/uploads/2026-04-24/1776975277046_abc123.jpg"
    ]
  }
}
```

---

## 6. 数据库设计

### 6.1 用户表 (users)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| openid | TEXT | 微信openid（唯一） |
| session_key | TEXT | 微信session_key |
| nickname | TEXT | 昵称 |
| avatar_url | TEXT | 头像URL |
| phone | TEXT | 手机号 |
| gender | INTEGER | 性别 |
| is_authenticated | INTEGER | 是否实名认证 |
| real_name | TEXT | 真实姓名 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| last_login_at | TEXT | 最后登录时间 |

### 6.2 活动表 (activities)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| creator_id | TEXT | 创建者ID（外键） |
| title | TEXT | 活动标题 |
| description | TEXT | 活动描述 |
| category_id | INTEGER | 分类ID（外键） |
| category_name | TEXT | 分类名称 |
| images | TEXT | 图片URL列表（JSON） |
| start_time | TEXT | 开始时间 |
| end_time | TEXT | 结束时间 |
| signup_deadline | TEXT | 报名截止时间 |
| address | TEXT | 活动地址 |
| latitude | REAL | 纬度 |
| longitude | REAL | 经度 |
| max_members | INTEGER | 最大参与人数 |
| current_members | INTEGER | 当前参与人数 |
| tags | TEXT | 标签列表（JSON） |
| status | TEXT | 状态：draft/published/ongoing/ended |
| cover | TEXT | 封面图URL |
| requirements | TEXT | 参与要求 |
| view_count | INTEGER | 浏览次数 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### 6.3 申请表 (applications)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键 |
| activity_id | TEXT | 活动ID（外键） |
| applicant_id | TEXT | 申请者ID（外键） |
| reason | TEXT | 申请理由 |
| status | TEXT | 状态：pending/approved/rejected/quit |
| handler_id | TEXT | 处理者ID（外键） |
| handler_remark | TEXT | 处理备注 |
| handled_at | TEXT | 处理时间 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

### 6.4 分类表 (categories)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键（自增） |
| name | TEXT | 分类名称（唯一） |
| code | TEXT | 分类编码（唯一） |
| icon | TEXT | 图标 |
| sort_order | INTEGER | 排序 |
| status | INTEGER | 状态 |
| created_at | TEXT | 创建时间 |

### 6.5 操作日志表 (operation_logs)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键（自增） |
| user_id | TEXT | 操作用户ID |
| action | TEXT | 操作类型 |
| target_type | TEXT | 目标类型 |
| target_id | TEXT | 目标ID |
| detail | TEXT | 操作详情 |
| ip | TEXT | IP地址 |
| created_at | TEXT | 创建时间 |

---

## 7. 安全与性能

### 7.1 请求频率限制

| 接口类型 | 限制 |
|----------|------|
| 全局 | 100次/分钟 |
| 登录 | 10次/15分钟 |
| 创建活动 | 20次/小时 |
| 申请活动 | 30次/小时 |

### 7.2 缓存策略

| 数据类型 | 缓存时间 |
|----------|----------|
| 活动列表 | 60秒 |
| 活动详情 | 120秒 |
| 热门活动 | 300秒 |

### 7.3 权限控制

- 所有写操作需要JWT认证
- 活动编辑/删除/结束仅创建者可操作
- 申请处理仅活动创建者可操作
- 防止重复申请、超员申请

---

## 8. 部署说明

### 8.1 环境变量

在 `.env` 文件中配置以下变量：

```env
WX_APPID=          # 微信小程序AppID（开发模式留空）
WX_SECRET=         # 微信小程序Secret（开发模式留空）
JWT_SECRET=        # JWT密钥
JWT_EXPIRES_IN=7d  # Token过期时间
PORT=3000          # 服务端口
DB_PATH=./database/dada.db  # 数据库路径
UPLOAD_DIR=./uploads        # 上传目录
MAX_FILE_SIZE=5242880       # 最大文件大小
```

### 8.2 启动命令

```bash
# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 开发模式启动
npm run dev

# 生产模式启动
npm start
```
