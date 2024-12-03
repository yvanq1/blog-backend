# Blog API 文档

## 基础信息
- 基础URL: `http://localhost:8000`
- 所有请求和响应均使用 JSON 格式
- 所有响应都遵循以下格式：
```json
{
    "success": true/false,
    "message": "响应信息",
    "data": null/object/array
}
```

## 管理员接口

### 1. 管理员登录
```
POST /api/admin/login
Content-Type: application/json

Request Body:
{
    "email": "admin@example.com",
    "password": "admin123456"
}

Response:
{
    "success": true,
    "data": {
        "id": "管理员ID",
        "email": "admin@example.com",
        "username": "admin"
    }
}
```

### 2. 管理员退出登录
```
POST /api/admin/logout

Response:
{
    "success": true,
    "message": "已成功退出登录"
}
```

### 3. 获取当前管理员信息
```
GET /api/admin/me

Response:
{
    "success": true,
    "data": {
        "id": "管理员ID",
        "email": "admin@example.com",
        "username": "admin"
    }
}
```

## 用户接口

### 1. 用户注册
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}

Response:
{
    "success": true,
    "message": "注册成功",
    "data": {
        "id": "用户ID",
        "email": "test@example.com",
        "username": "testuser",
        "avatar": "头像URL"
    }
}
```

### 2. 用户登录
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
    "email": "test@example.com",
    "password": "password123"
}

Response:
{
    "success": true,
    "message": "登录成功",
    "data": {
        "id": "用户ID",
        "email": "test@example.com",
        "username": "testuser",
        "avatar": "头像URL"
    }
}
```

### 3. 用户退出登录
```
POST /api/auth/logout

Response:
{
    "success": true,
    "message": "退出成功"
}
```

### 4. 获取当前用户信息
```
GET /api/auth/me

Response:
{
    "success": true,
    "data": {
        "id": "用户ID",
        "email": "test@example.com",
        "username": "testuser",
        "avatar": "头像URL"
    }
}
```

## 文章管理接口

### 1. 创建文章（需要管理员权限）
```
POST /api/articles
Content-Type: application/json

Request Body:
{
    "title": "文章标题",          // 必填，最大长度100
    "description": "文章描述",    // 必填，最大长度200
    "content": "文章内容",        // 必填
    "category": "技术",          // 必填
    "tags": ["JavaScript", "Node.js"],  // 可选
    "coverImage": "图片URL",      // 可选
    "isPublished": true          // 可选，默认false
}

Response:
{
    "success": true,
    "message": "文章创建成功",
    "data": {
        "id": "文章ID",
        "title": "文章标题",
        "description": "文章描述",
        "content": "文章内容",
        "category": "技术",
        "tags": ["JavaScript", "Node.js"],
        "coverImage": "图片URL",
        "isPublished": true,
        "views": 0,
        "likes": 0,
        "createdAt": "2024-01-20T12:00:00.000Z",
        "updatedAt": "2024-01-20T12:00:00.000Z"
    }
}
```

### 2. 获取文章列表
```
GET /api/articles?page=1&limit=10&category=技术&tag=JavaScript&keyword=搜索关键词

Query Parameters:
- page: 页码（可选，默认1）
- limit: 每页数量（可选，默认10）
- category: 分类筛选（可选）
- tag: 标签筛选（可选）
- keyword: 关键词搜索（可选，搜索标题和描述）

Response:
{
    "success": true,
    "data": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "items": [
            {
                "id": "文章ID",
                "title": "文章标题",
                "description": "文章描述",
                "category": "技术",
                "tags": ["JavaScript", "Node.js"],
                "coverImage": "图片URL",
                "isPublished": true,
                "views": 0,
                "likes": 0,
                "createdAt": "2024-01-20T12:00:00.000Z",
                "updatedAt": "2024-01-20T12:00:00.000Z"
            }
            // ... 更多文章
        ]
    }
}
```

### 3. 获取单篇文章
```
GET /api/articles/:id

Response:
{
    "success": true,
    "data": {
        "id": "文章ID",
        "title": "文章标题",
        "description": "文章描述",
        "content": "文章内容",
        "category": "技术",
        "tags": ["JavaScript", "Node.js"],
        "coverImage": "图片URL",
        "isPublished": true,
        "views": 1,
        "likes": 0,
        "createdAt": "2024-01-20T12:00:00.000Z",
        "updatedAt": "2024-01-20T12:00:00.000Z"
    }
}
```

### 4. 更新文章（需要管理员权限）
```
PUT /api/articles/:id
Content-Type: application/json

Request Body:
{
    "title": "更新后的标题",
    "description": "更新后的描述",
    "content": "更新后的内容",
    "category": "技术",
    "tags": ["JavaScript", "Node.js"],
    "coverImage": "新图片URL",
    "isPublished": true
}

Response:
{
    "success": true,
    "message": "文章更新成功",
    "data": {
        // 更新后的文章完整信息
    }
}
```

### 5. 删除文章（需要管理员权限）
```
DELETE /api/articles/:id

Response:
{
    "success": true,
    "message": "文章删除成功"
}
```

### 6. 获取所有分类
```
GET /api/articles/categories

Response:
{
    "success": true,
    "data": ["技术", "生活", "随笔"]
}
```

### 7. 获取所有标签
```
GET /api/articles/tags

Response:
{
    "success": true,
    "data": ["JavaScript", "Node.js", "React", "Vue"]
}
```

## Banner管理接口

### 1. 上传Banner图片（需要管理员权限）
```
POST /api/banners
Content-Type: multipart/form-data

Request Body:
- image: 图片文件（必填）
- title: Banner标题（必填）
- description: Banner描述（可选）
- link: 点击跳转链接（可选）
- order: 显示顺序（可选，默认0）

Response:
{
    "success": true,
    "message": "Banner上传成功",
    "data": {
        "id": "Banner ID",
        "imageUrl": "图片URL",
        "title": "Banner标题",
        "description": "Banner描述",
        "link": "点击跳转链接",
        "order": 0,
        "createdAt": "2024-01-20T12:00:00.000Z",
        "updatedAt": "2024-01-20T12:00:00.000Z"
    }
}
```

### 2. 获取Banner列表
```
GET /api/banners

Response:
{
    "success": true,
    "data": [
        {
            "id": "Banner ID",
            "imageUrl": "图片URL",
            "title": "Banner标题",
            "description": "Banner描述",
            "link": "点击跳转链接",
            "order": 0,
            "createdAt": "2024-01-20T12:00:00.000Z",
            "updatedAt": "2024-01-20T12:00:00.000Z"
        }
        // ... 更多Banner
    ]
}
```

### 3. 更新Banner信息（需要管理员权限）
```
PUT /api/banners/:id
Content-Type: multipart/form-data

Request Body:
- image: 新图片文件（可选）
- title: 新标题（可选）
- description: 新描述（可选）
- link: 新链接（可选）
- order: 新顺序（可选）

Response:
{
    "success": true,
    "message": "Banner更新成功",
    "data": {
        // 更新后的Banner完整信息
    }
}
```

### 4. 删除Banner（需要管理员权限）
```
DELETE /api/banners/:id

Response:
{
    "success": true,
    "message": "Banner删除成功"
}
```

### 5. 调整Banner顺序（需要管理员权限）
```
PATCH /api/banners/reorder
Content-Type: application/json

Request Body:
{
    "orders": [
        {
            "id": "Banner ID",
            "order": 0
        },
        {
            "id": "Banner ID",
            "order": 1
        }
        // ... 更多Banner顺序
    ]
}

Response:
{
    "success": true,
    "message": "Banner顺序调整成功"
}
```

## 文件上传接口

### 1. 上传图片（需要管理员权限）
```
POST /api/upload
Content-Type: multipart/form-data

Request:
- file: 图片文件（必填，支持jpg、jpeg、png、gif格式，最大5MB）

Response:
{
    "success": true,
    "message": "上传成功",
    "data": {
        "url": "图片访问URL",
        "path": "图片存储路径"
    }
}

错误响应：
{
    "success": false,
    "message": "错误信息",
    "data": null
}

可能的错误：
- 401: 未登录或非管理员
- 400: 没有上传文件
- 400: 文件大小超过限制
- 400: 不支持的文件类型
```

### 2. 上传图片（兼容旧接口，需要管理员权限）
```
POST /api/upload/image
Content-Type: multipart/form-data

Request:
- file: 图片文件（必填，支持jpg、jpeg、png、gif格式，最大5MB）

Response: 同上
```

注意事项：
1. 所有上传接口都需要管理员权限
2. 图片上传成功后会返回可访问的URL，可直接用于图片显示
3. 图片存储使用阿里云OSS，URL有效期为7天
4. 为保证性能，建议在上传前进行图片压缩

## 收藏功能接口

### 1. 添加收藏（需要登录）
```
POST /api/favorites
Content-Type: application/json

Request Body:
{
    "articleId": "文章ID"
}

Response:
{
    "success": true,
    "message": "收藏成功"
}
```

### 2. 取消收藏（需要登录）
```
DELETE /api/favorites/:articleId

Response:
{
    "success": true,
    "message": "取消收藏成功"
}
```

### 3. 获取收藏状态（需要登录）
```
GET /api/favorites/status/:articleId

Response:
{
    "success": true,
    "data": {
        "isFavorited": true/false
    }
}
```

### 4. 获取收藏列表（需要登录）
```
GET /api/favorites?page=1&limit=10

Query Parameters:
- page: 页码（可选，默认1）
- limit: 每页数量（可选，默认10）

Response:
{
    "success": true,
    "data": {
        "favorites": [
            {
                "id": "收藏ID",
                "articleId": "文章ID",
                "article": {
                    "_id": "文章ID",
                    "title": "文章标题",
                    "coverImage": "封面图URL",
                    "category": "分类",
                    "tags": ["标签1", "标签2"],
                    "createdAt": "创建时间"
                },
                "createdAt": "收藏时间"
            }
        ],
        "total": 总数量
    }
}
```

## 注意事项

1. 认证相关：
   - 管理员接口需要管理员权限
   - 文章管理接口（创建、更新、删除）需要管理员权限
   - 使用 session 认证，请确保启用 cookie

2. 错误响应：
   - 401: 未登录或权限不足
   - 404: 资源不存在
   - 500: 服务器错误

3. 文章字段限制：
   - title: 必填，最大长度100字符
   - description: 必填，最大长度200字符
   - content: 必填
   - category: 必填

4. 默认管理员账号：
   - 邮箱：admin@example.com
   - 密码：admin123456
