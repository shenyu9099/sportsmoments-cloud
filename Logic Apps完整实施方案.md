# Logic Apps 完整实施方案 - 符合作业要求

## ✅ 为什么用Logic Apps？

1. **作业明确要求** - "using the Logic Apps"
2. **无代码/低代码** - 不需要编程基础
3. **可视化设计** - 拖拽式操作
4. **云原生** - 完全托管，自动扩展
5. **容易演示** - 视频录制时流程清晰

---

## 🎯 技术架构（Logic Apps版）

```
┌─────────────┐
│   前端HTML   │
└──────┬──────┘
       │ HTTP请求
       ▼
┌──────────────────┐
│  Logic App 1:    │ ← POST /upload
│  上传媒体文件     │
└─┬────────────┬───┘
  │            │
  ▼            ▼
┌─────┐    ┌─────────┐
│Blob │    │Cosmos DB│
│Store│    │         │
└─────┘    └─────────┘

┌──────────────────┐
│  Logic App 2:    │ ← GET /media
│  获取媒体列表     │
└─────┬────────────┘
      │
      ▼
┌─────────┐
│Cosmos DB│
└─────────┘

┌──────────────────┐
│  Logic App 3:    │ ← PUT /media/{id}
│  更新媒体信息     │
└─────┬────────────┘
      │
      ▼
┌─────────┐
│Cosmos DB│
└─────────┘

┌──────────────────┐
│  Logic App 4:    │ ← DELETE /media/{id}
│  删除媒体         │
└─┬──────────────┬─┘
  │              │
  ▼              ▼
┌─────┐    ┌─────────┐
│Blob │    │Cosmos DB│
│Store│    │         │
└─────┘    └─────────┘
```

---

## 📦 第一步：创建Azure资源

### 1. 创建资源组
```
Azure门户 → 资源组 → 创建
名称: multimedia-platform-rg
区域: East US (或离你近的)
```

### 2. 创建Storage Account
```
Azure门户 → 存储账户 → 创建
资源组: multimedia-platform-rg
名称: multimedia20XX (全局唯一)
性能: 标准
复制: LRS
```

**创建Blob容器**：
```
存储账户 → 容器 → 新建
名称: media-files
公共访问级别: Blob
```

**获取连接字符串**：
```
存储账户 → 访问密钥 → 显示密钥 → 复制连接字符串
保存到记事本！
```

### 3. 创建Cosmos DB
```
Azure门户 → Azure Cosmos DB → 创建
API: Core (SQL)
资源组: multimedia-platform-rg
账户名: multimedia-cosmosdb-20XX
位置: East US
容量模式: 无服务器 (省钱！)
```

**创建数据库和容器**：
```
Cosmos DB → 数据资源管理器 → 新建数据库
数据库ID: MediaDB

→ 新建容器
容器ID: MediaItems
分区键: /userId
```

---

## 🔧 第二步：创建Logic Apps（CRUD完整实现）

### Logic App 1️⃣: 上传媒体（CREATE）

#### 创建Logic App
```
Azure门户 → Logic Apps → 创建
资源组: multimedia-platform-rg
名称: upload-media-logic
类型: 消耗 (Consumption)
区域: East US
```

#### 设计工作流

**步骤1：添加HTTP触发器**
```
点击 "空白逻辑应用"
搜索: "HTTP request"
选择: "When a HTTP request is received"

配置：
- 方法: POST
- 请求正文JSON架构:
```

```json
{
    "type": "object",
    "properties": {
        "fileName": {
            "type": "string"
        },
        "fileType": {
            "type": "string"
        },
        "userId": {
            "type": "string"
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "fileContent": {
            "type": "string",
            "description": "Base64 encoded file"
        }
    }
}
```

**步骤2：生成唯一ID**
```
新步骤 → 选择 "初始化变量"
名称: fileId
类型: 字符串
值: guid()  (在表达式中输入)
```

**步骤3：生成Blob名称**
```
新步骤 → 初始化变量
名称: blobName
类型: 字符串
值: @{variables('fileId')}-@{triggerBody()?['fileName']}
```

**步骤4：上传到Blob Storage**
```
新步骤 → 搜索 "Azure Blob Storage"
选择: "创建 Blob"

首次使用需要创建连接：
- 连接名称: BlobStorageConnection
- 身份验证类型: 访问密钥
- 存储账户名: 你的存储账户名
- 访问密钥: 从存储账户复制的密钥

配置：
- 存储账户名: (自动填充)
- 文件夹路径: /media-files
- Blob 名称: @{variables('blobName')}
- Blob 内容: @{base64ToBinary(triggerBody()?['fileContent'])}
- 内容类型: @{triggerBody()?['fileType']}
```

**步骤5：获取Blob URL**
```
新步骤 → 初始化变量
名称: blobUrl
类型: 字符串
值: https://<你的存储账户名>.blob.core.windows.net/media-files/@{variables('blobName')}
```

**步骤6：保存到Cosmos DB**
```
新步骤 → 搜索 "Azure Cosmos DB"
选择: "创建或更新文档(V3)"

首次使用需要创建连接：
- 连接名称: CosmosDBConnection
- 身份验证类型: 访问密钥
- 账户ID: 你的Cosmos DB账户名
- 访问密钥: 从Cosmos DB复制的主密钥

配置：
- 数据库ID: MediaDB
- 容器ID: MediaItems
- 文档: 
```

```json
{
  "id": "@{variables('fileId')}",
  "userId": "@{triggerBody()?['userId']}",
  "fileName": "@{triggerBody()?['fileName']}",
  "blobName": "@{variables('blobName')}",
  "fileUrl": "@{variables('blobUrl')}",
  "fileType": "@{triggerBody()?['fileType']}",
  "tags": @{triggerBody()?['tags']},
  "uploadDate": "@{utcNow()}",
  "isDeleted": false
}
```

```
- 分区键值: @{triggerBody()?['userId']}
```

**步骤7：返回成功响应**
```
新步骤 → 选择 "响应"

配置：
- 状态代码: 200
- 正文:
```

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "@{variables('fileId')}",
    "fileName": "@{triggerBody()?['fileName']}",
    "fileUrl": "@{variables('blobUrl')}",
    "uploadDate": "@{utcNow()}"
  }
}
```

**保存Logic App！**

**获取API URL**：
```
保存后 → 返回到HTTP触发器 → 复制 "HTTP POST URL"
这就是你的上传API地址！
示例：https://prod-xx.eastus.logic.azure.com:443/workflows/xxx/triggers/manual/paths/invoke?api-version=xxx&sp=xxx&sv=xxx&sig=xxx
```

---

### Logic App 2️⃣: 获取媒体列表（READ）

#### 创建Logic App
```
名称: get-media-logic
类型: 消耗
```

#### 设计工作流

**步骤1：HTTP触发器**
```
When a HTTP request is received
方法: GET

查询参数架构:
{
    "type": "object",
    "properties": {
        "userId": {
            "type": "string"
        },
        "id": {
            "type": "string"
        }
    }
}
```

**步骤2：条件判断 - 获取单个还是列表**
```
新步骤 → 添加 "条件"

条件表达式:
@empty(triggerOutputs()['queries']?['id'])

如果为True (没有id参数) → 获取列表
如果为False (有id参数) → 获取单个
```

**在"True"分支（获取列表）**：
```
添加操作 → Azure Cosmos DB → "查询文档(V3)"

数据库ID: MediaDB
容器ID: MediaItems
查询:
SELECT * FROM c 
WHERE c.userId = '@{triggerOutputs()['queries']?['userId']}' 
AND c.isDeleted = false 
ORDER BY c.uploadDate DESC

分区键值: @{triggerOutputs()['queries']?['userId']}
```

**在"False"分支（获取单个）**：
```
添加操作 → Azure Cosmos DB → "读取文档(V3)"

数据库ID: MediaDB
容器ID: MediaItems
文档ID: @{triggerOutputs()['queries']?['id']}
分区键值: @{triggerOutputs()['queries']?['userId']}
```

**步骤3：返回响应**

在True分支添加"响应":
```json
{
  "success": true,
  "count": @{length(body('查询文档_(V3)')?['Documents'])},
  "data": @{body('查询文档_(V3)')?['Documents']}
}
```

在False分支添加"响应":
```json
{
  "success": true,
  "data": @{body('读取文档_(V3)')}
}
```

**保存并复制GET API URL**

---

### Logic App 3️⃣: 更新媒体（UPDATE）

#### 创建Logic App
```
名称: update-media-logic
```

#### 设计工作流

**步骤1：HTTP触发器**
```
方法: PUT

请求正文架构:
{
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "userId": {
            "type": "string"
        },
        "fileName": {
            "type": "string"
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
}
```

**步骤2：读取现有文档**
```
Azure Cosmos DB → 读取文档(V3)

数据库ID: MediaDB
容器ID: MediaItems
文档ID: @{triggerBody()?['id']}
分区键值: @{triggerBody()?['userId']}
```

**步骤3：更新文档**
```
Azure Cosmos DB → 创建或更新文档(V3)

数据库ID: MediaDB
容器ID: MediaItems
文档:
```

```json
{
  "id": "@{body('读取文档_(V3)')?['id']}",
  "userId": "@{body('读取文档_(V3)')?['userId']}",
  "fileName": "@{if(empty(triggerBody()?['fileName']), body('读取文档_(V3)')?['fileName'], triggerBody()?['fileName'])}",
  "blobName": "@{body('读取文档_(V3)')?['blobName']}",
  "fileUrl": "@{body('读取文档_(V3)')?['fileUrl']}",
  "fileType": "@{body('读取文档_(V3)')?['fileType']}",
  "tags": "@{if(empty(triggerBody()?['tags']), body('读取文档_(V3)')?['tags'], triggerBody()?['tags'])}",
  "uploadDate": "@{body('读取文档_(V3)')?['uploadDate']}",
  "lastModified": "@{utcNow()}",
  "isDeleted": false
}
```

```
分区键值: @{triggerBody()?['userId']}
```

**步骤4：返回响应**
```json
{
  "success": true,
  "message": "Media updated successfully",
  "data": @{body('创建或更新文档_(V3)')}
}
```

---

### Logic App 4️⃣: 删除媒体（DELETE）

#### 创建Logic App
```
名称: delete-media-logic
```

#### 设计工作流

**步骤1：HTTP触发器**
```
方法: DELETE

请求正文架构:
{
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "userId": {
            "type": "string"
        }
    }
}
```

**步骤2：读取文档**
```
Azure Cosmos DB → 读取文档(V3)

文档ID: @{triggerBody()?['id']}
分区键值: @{triggerBody()?['userId']}
```

**步骤3：软删除（推荐）- 更新isDeleted标志**
```
Azure Cosmos DB → 创建或更新文档(V3)

文档:
```

```json
{
  "id": "@{body('读取文档_(V3)')?['id']}",
  "userId": "@{body('读取文档_(V3)')?['userId']}",
  "fileName": "@{body('读取文档_(V3)')?['fileName']}",
  "blobName": "@{body('读取文档_(V3)')?['blobName']}",
  "fileUrl": "@{body('读取文档_(V3)')?['fileUrl']}",
  "fileType": "@{body('读取文档_(V3)')?['fileType']}",
  "tags": @{body('读取文档_(V3)')?['tags']},
  "uploadDate": "@{body('读取文档_(V3)')?['uploadDate']}",
  "isDeleted": true,
  "deletedDate": "@{utcNow()}"
}
```

**步骤4（可选）：删除Blob文件**
```
Azure Blob Storage → 删除 Blob

Blob: @{body('读取文档_(V3)')?['blobName']}
```

**步骤5：返回响应**
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "id": "@{triggerBody()?['id']}"
}
```

---

## 🌐 第三步：前端集成

### HTML前端代码

**index.html** (简化版):

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>多媒体分享平台</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
        }
        .upload-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        input[type="file"],
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: all 0.3s;
        }
        button:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        .status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 6px;
            display: none;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            display: block;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            display: block;
        }
        .media-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .media-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .media-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .media-preview {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #f0f0f0;
        }
        .media-info {
            padding: 15px;
        }
        .media-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .media-meta {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        .media-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin: 10px 0;
        }
        .tag {
            background: #e0e7ff;
            color: #4c51bf;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
        }
        .media-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .btn-small {
            padding: 6px 12px;
            font-size: 13px;
            flex: 1;
        }
        .btn-delete {
            background: #dc3545;
        }
        .btn-delete:hover {
            background: #c82333;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 云原生多媒体分享平台</h1>
        
        <!-- 上传区域 -->
        <div class="upload-section">
            <h2>上传新文件</h2>
            <div class="form-group">
                <label>选择文件</label>
                <input type="file" id="fileInput" accept="image/*,video/*">
            </div>
            <div class="form-group">
                <label>标签（逗号分隔）</label>
                <input type="text" id="tagsInput" placeholder="例如: 风景, 旅游, 日落">
            </div>
            <button onclick="uploadFile()">📤 上传文件</button>
            <div id="uploadStatus" class="status"></div>
        </div>
        
        <!-- 文件列表 -->
        <h2>我的媒体文件</h2>
        <div id="mediaGrid" class="media-grid">
            <div class="loading">加载中...</div>
        </div>
    </div>
    
    <script>
        // ⚠️ 重要：替换为你的Logic Apps URL
        const API_ENDPOINTS = {
            upload: 'https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...',
            get: 'https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...',
            update: 'https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...',
            delete: 'https://prod-xx.eastus.logic.azure.com:443/workflows/.../triggers/manual/paths/invoke?...'
        };
        
        const USER_ID = 'user123'; // 实际应用应该从登录获取
        
        // 页面加载时获取文件列表
        window.addEventListener('load', () => {
            loadMedia();
        });
        
        // 上传文件
        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const tagsInput = document.getElementById('tagsInput');
            const statusDiv = document.getElementById('uploadStatus');
            
            if (!fileInput.files[0]) {
                showStatus('请选择文件！', 'error');
                return;
            }
            
            const file = fileInput.files[0];
            
            // 文件大小限制（Logic Apps有限制，建议<4MB）
            if (file.size > 4 * 1024 * 1024) {
                showStatus('文件太大！请选择小于4MB的文件', 'error');
                return;
            }
            
            showStatus('上传中...', 'info');
            
            try {
                // 转换为Base64
                const base64 = await fileToBase64(file);
                
                // 准备数据
                const uploadData = {
                    fileName: file.name,
                    fileType: file.type,
                    userId: USER_ID,
                    tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t),
                    fileContent: base64.split(',')[1] // 移除data:image/...;base64,前缀
                };
                
                // 调用Logic App
                const response = await fetch(API_ENDPOINTS.upload, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(uploadData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showStatus('✅ 上传成功！', 'success');
                    fileInput.value = '';
                    tagsInput.value = '';
                    loadMedia(); // 刷新列表
                } else {
                    showStatus('❌ 上传失败：' + (result.error || '未知错误'), 'error');
                }
                
            } catch (error) {
                console.error('Upload error:', error);
                showStatus('❌ 上传失败：' + error.message, 'error');
            }
        }
        
        // 加载媒体列表
        async function loadMedia() {
            const gridDiv = document.getElementById('mediaGrid');
            
            try {
                const response = await fetch(`${API_ENDPOINTS.get}?userId=${USER_ID}`);
                const result = await response.json();
                
                if (result.success && result.data && result.data.length > 0) {
                    gridDiv.innerHTML = result.data.map(media => `
                        <div class="media-card">
                            ${media.fileType.startsWith('image/') ? 
                                `<img src="${media.fileUrl}" alt="${media.fileName}" class="media-preview">` :
                                `<div class="media-preview" style="display:flex;align-items:center;justify-content:center;background:#e0e0e0;">
                                    <span style="font-size:48px;">🎥</span>
                                </div>`
                            }
                            <div class="media-info">
                                <div class="media-title" title="${media.fileName}">${media.fileName}</div>
                                <div class="media-meta">📅 ${new Date(media.uploadDate).toLocaleString('zh-CN')}</div>
                                <div class="media-meta">📦 ${(media.fileSize / 1024).toFixed(1)} KB</div>
                                ${media.tags && media.tags.length > 0 ? `
                                    <div class="media-tags">
                                        ${media.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                ` : ''}
                                <div class="media-actions">
                                    <button class="btn-small" onclick="editMedia('${media.id}', '${media.fileName}', ${JSON.stringify(media.tags).replace(/"/g, '&quot;')})">✏️ 编辑</button>
                                    <button class="btn-small btn-delete" onclick="deleteMedia('${media.id}')">🗑️ 删除</button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    gridDiv.innerHTML = '<div class="loading">还没有上传任何文件</div>';
                }
                
            } catch (error) {
                console.error('Load error:', error);
                gridDiv.innerHTML = '<div class="loading">加载失败</div>';
            }
        }
        
        // 编辑媒体
        async function editMedia(id, currentName, currentTags) {
            const newName = prompt('输入新文件名：', currentName);
            const newTags = prompt('输入新标签（逗号分隔）：', currentTags.join(', '));
            
            if (!newName && !newTags) return;
            
            try {
                const updateData = {
                    id: id,
                    userId: USER_ID
                };
                if (newName) updateData.fileName = newName;
                if (newTags) updateData.tags = newTags.split(',').map(t => t.trim());
                
                const response = await fetch(API_ENDPOINTS.update, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ 更新成功！');
                    loadMedia();
                } else {
                    alert('❌ 更新失败');
                }
                
            } catch (error) {
                console.error('Update error:', error);
                alert('❌ 更新失败：' + error.message);
            }
        }
        
        // 删除媒体
        async function deleteMedia(id) {
            if (!confirm('确定要删除这个文件吗？')) return;
            
            try {
                const response = await fetch(API_ENDPOINTS.delete, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        userId: USER_ID
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ 删除成功！');
                    loadMedia();
                } else {
                    alert('❌ 删除失败');
                }
                
            } catch (error) {
                console.error('Delete error:', error);
                alert('❌ 删除失败：' + error.message);
            }
        }
        
        // 显示状态消息
        function showStatus(message, type) {
            const statusDiv = document.getElementById('uploadStatus');
            statusDiv.textContent = message;
            statusDiv.className = 'status ' + type;
            
            if (type === 'success') {
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
            }
        }
        
        // 文件转Base64
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
    </script>
</body>
</html>
```

---

## 📊 第四步：添加高级功能（加分项）

### 1. Application Insights监控

在每个Logic App中添加：
```
设置 → Application Insights → 启用
创建新的Application Insights资源
```

### 2. 自动缩略图生成（使用Azure Function辅助）

可以创建一个Azure Function，当文件上传到Blob Storage时自动触发生成缩略图。

在Logic App中添加步骤：
```
上传完Blob后 → HTTP操作 → 调用Function生成缩略图
```

### 3. 错误处理

在Logic App中添加"作用域"（Scope）和错误处理：
```
添加 → 作用域
将所有操作放入作用域
→ 配置运行后操作 → 添加并行分支
→ 条件：如果作用域失败
→ 发送错误响应
```

---

## 🎬 第五步：测试和演示

### 本地测试

1. 保存所有Logic Apps
2. 复制每个Logic App的URL
3. 更新前端HTML中的API_ENDPOINTS
4. 在浏览器中打开HTML文件
5. 测试CRUD操作

### 视频演示脚本（5分钟）

**0:00-0:30 介绍**
```
"大家好，这是我的云原生多媒体分享平台。
我使用Azure Logic Apps实现了完整的REST API。"
```

**0:30-2:00 演示应用功能**
```
1. 打开网页
2. 选择图片文件
3. 输入标签
4. 点击上传
5. 等待上传成功
6. 查看文件显示在列表中
7. 点击编辑，修改文件名
8. 点击删除，删除一个文件
```

**2:00-4:00 展示Azure资源**
```
1. 打开Azure门户
2. 展示资源组中的所有资源
3. 打开Storage Account → 容器 → 显示上传的文件
4. 打开Cosmos DB → 数据资源管理器 → 显示数据库记录
5. 打开Logic Apps:
   - 展示4个Logic App
   - 打开upload-media-logic
   - 展示设计器中的工作流
   - 展示运行历史记录
   - 展示成功的运行日志
6. 展示Application Insights监控数据
```

**4:00-4:50 高级功能**
```
"我还添加了以下高级功能：
1. Application Insights监控
2. 软删除功能
3. 错误处理机制
4. CORS配置支持跨域访问"
```

**4:50-5:00 总结**
```
"这就是我的项目演示，完全使用Azure云原生服务，
包括Logic Apps、Blob Storage、Cosmos DB等。谢谢！"
```

---

## 📋 UML图设计（作业1需要）

### REST API序列图

```
用户      前端       Logic App      Blob Storage    Cosmos DB
 │         │             │                │             │
 │ 选择文件 │             │                │             │
 ├────────>│             │                │             │
 │         │ POST /upload│                │             │
 │         ├───────────>│                │             │
 │         │            │ 上传文件         │             │
 │         │            ├───────────────>│             │
 │         │            │ 返回URL         │             │
 │         │            │<───────────────┤             │
 │         │            │ 保存元数据       │             │
 │         │            ├────────────────────────────>│
 │         │            │ 返回文档ID       │             │
 │         │            │<────────────────────────────┤
 │         │ 成功响应     │                │             │
 │         │<───────────┤                │             │
 │ 显示成功  │             │                │             │
 │<────────┤             │                │             │
```

---

## ✅ 总结：为什么Logic Apps符合作业要求

| 要求 | Logic Apps如何满足 |
|------|-------------------|
| REST API CRUD | ✅ 4个Logic Apps分别实现 |
| 云原生 | ✅ 完全托管，无服务器 |
| Blob Storage | ✅ 直接集成 |
| Cosmos DB | ✅ 内置连接器 |
| 可扩展性 | ✅ 自动扩展 |
| 监控 | ✅ Application Insights |
| 易演示 | ✅ 可视化工作流 |

---

## 🎯 快速检查清单

### 作业1（设计）
- [ ] 画出包含Logic Apps的架构图
- [ ] 设计4个Logic Apps的工作流（用流程图）
- [ ] 设计Cosmos DB数据模型（JSON示例）
- [ ] 画UML序列图展示API调用流程
- [ ] 评估可扩展性（Logic Apps自动扩展）

### 作业2（实现）
- [ ] 创建4个Logic Apps
- [ ] 测试所有CRUD操作
- [ ] 部署前端到Static Web App
- [ ] 启用Application Insights
- [ ] 录制5分钟演示视频

---

**重要提示**：
1. Logic Apps完全符合作业要求
2. 无需编程，可视化操作更容易演示
3. 如果需要复杂功能，可以Logic Apps调用Functions
4. 视频演示时重点展示Logic Apps的工作流设计

有问题随时问我！🚀

