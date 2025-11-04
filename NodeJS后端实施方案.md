# Node.js后端实施方案 - 云原生多媒体平台

## ✅ 为什么用Node.js很合适？

1. **Azure官方支持** - Functions、App Service都原生支持Node.js
2. **JavaScript全栈** - 前后端用同一种语言
3. **丰富的Azure SDK** - 官方提供完整的npm包
4. **简单易学** - 代码量少，上手快
5. **异步处理** - 天然适合处理文件上传

---

## 🎯 技术栈选择（Node.js版）

### 方案A：Azure Functions + Node.js（推荐⭐）
```
优点：
✅ 无服务器，自动扩展
✅ 按调用次数付费，便宜
✅ 每个功能独立，易维护
✅ 符合云原生理念

缺点：
❌ 冷启动可能有延迟
```

### 方案B：Azure App Service + Express.js
```
优点：
✅ 传统REST API架构
✅ 更灵活，适合复杂逻辑
✅ 可以用Express框架

缺点：
❌ 需要一直运行，费用稍高
❌ 需要手动配置扩展
```

**建议**：用 **Azure Functions**，更云原生！

---

## 📦 第一步：环境准备

### 1. 安装必要工具

```bash
# 1. 安装Node.js（LTS版本）
# 下载：https://nodejs.org/

# 2. 验证安装
node --version  # 应该显示 v18.x 或更高
npm --version   # 应该显示 9.x 或更高

# 3. 安装Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# 4. 安装Azure CLI（可选，但推荐）
# Windows: 下载安装包
# https://aka.ms/installazurecliwindows

# 5. 登录Azure
az login
```

### 2. 安装VS Code扩展

在VS Code中安装：
- **Azure Functions** 扩展
- **Azure Account** 扩展
- **Azure Resources** 扩展

---

## 🚀 第二步：创建Functions项目

### 创建本地项目

```bash
# 1. 创建项目目录
mkdir multimedia-backend
cd multimedia-backend

# 2. 初始化Functions项目
func init --javascript

# 3. 创建第一个函数（上传）
func new --name UploadMedia --template "HTTP trigger" --authlevel "anonymous"

# 4. 创建其他函数
func new --name GetMedia --template "HTTP trigger" --authlevel "anonymous"
func new --name UpdateMedia --template "HTTP trigger" --authlevel "anonymous"
func new --name DeleteMedia --template "HTTP trigger" --authlevel "anonymous"
```

项目结构：
```
multimedia-backend/
├── UploadMedia/
│   ├── index.js          # 上传逻辑
│   └── function.json     # 配置
├── GetMedia/
│   ├── index.js          # 获取逻辑
│   └── function.json
├── UpdateMedia/
│   ├── index.js          # 更新逻辑
│   └── function.json
├── DeleteMedia/
│   ├── index.js          # 删除逻辑
│   └── function.json
├── host.json             # 全局配置
├── local.settings.json   # 本地环境变量
└── package.json          # 依赖管理
```

---

## 📦 第三步：安装Azure SDK

```bash
# 安装必要的npm包
npm install @azure/storage-blob      # Blob Storage操作
npm install @azure/cosmos            # Cosmos DB操作
npm install @azure/identity          # Azure认证
npm install multer                   # 文件上传处理
npm install uuid                     # 生成唯一ID
```

**package.json** 示例：
```json
{
  "name": "multimedia-backend",
  "version": "1.0.0",
  "description": "Cloud Native Multimedia Platform API",
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests yet\""
  },
  "dependencies": {
    "@azure/cosmos": "^4.0.0",
    "@azure/storage-blob": "^12.17.0",
    "@azure/identity": "^4.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "azure-functions-core-tools": "^4.0.5455"
  }
}
```

---

## 🔧 第四步：配置连接字符串

### 编辑 `local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    
    "STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=你的存储账户;AccountKey=你的密钥;EndpointSuffix=core.windows.net",
    
    "COSMOS_ENDPOINT": "https://你的cosmosdb账户.documents.azure.com:443/",
    "COSMOS_KEY": "你的Cosmos DB密钥",
    "COSMOS_DATABASE": "MediaDB",
    "COSMOS_CONTAINER": "MediaItems",
    
    "BLOB_CONTAINER_NAME": "media-files"
  },
  "Host": {
    "CORS": "*"
  }
}
```

**如何获取连接字符串？**
```
Azure门户 → 你的Storage Account → 访问密钥 → 复制 Connection String
Azure门户 → 你的Cosmos DB → 密钥 → 复制 URI 和主密钥
```

---

## 💻 第五步：实现CRUD功能

### 1️⃣ UploadMedia - 上传媒体文件

**UploadMedia/index.js**:
```javascript
const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

module.exports = async function (context, req) {
    context.log('Processing file upload request');

    try {
        // 1. 获取请求数据
        const { fileName, fileType, userId, tags, fileBase64 } = req.body;

        if (!fileName || !fileBase64) {
            context.res = {
                status: 400,
                body: { error: 'fileName and fileBase64 are required' }
            };
            return;
        }

        // 2. 上传文件到Blob Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient(
            process.env.BLOB_CONTAINER_NAME
        );

        // 生成唯一文件名
        const fileId = uuidv4();
        const blobName = `${fileId}-${fileName}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // 将Base64转换为Buffer
        const fileBuffer = Buffer.from(fileBase64, 'base64');

        // 上传文件
        await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
            blobHTTPHeaders: { blobContentType: fileType }
        });

        const blobUrl = blockBlobClient.url;

        // 3. 保存元数据到Cosmos DB
        const cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);

        const mediaItem = {
            id: fileId,
            userId: userId || 'anonymous',
            fileName: fileName,
            blobName: blobName,
            fileUrl: blobUrl,
            fileType: fileType || 'application/octet-stream',
            fileSize: fileBuffer.length,
            tags: tags || [],
            uploadDate: new Date().toISOString(),
            isDeleted: false
        };

        await container.items.create(mediaItem);

        // 4. 返回成功响应
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: true,
                message: 'File uploaded successfully',
                data: {
                    id: fileId,
                    fileName: fileName,
                    fileUrl: blobUrl,
                    uploadDate: mediaItem.uploadDate
                }
            }
        };

    } catch (error) {
        context.log.error('Error uploading file:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                error: 'Failed to upload file',
                details: error.message
            }
        };
    }
};
```

**UploadMedia/function.json**:
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "media"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### 2️⃣ GetMedia - 获取媒体列表

**GetMedia/index.js**:
```javascript
const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
    context.log('Getting media list');

    try {
        const userId = req.query.userId || req.body?.userId;
        const fileId = req.query.id;

        const cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);

        let querySpec;

        if (fileId) {
            // 获取单个文件
            querySpec = {
                query: 'SELECT * FROM c WHERE c.id = @id AND c.isDeleted = false',
                parameters: [{ name: '@id', value: fileId }]
            };
        } else if (userId) {
            // 获取用户的所有文件
            querySpec = {
                query: 'SELECT * FROM c WHERE c.userId = @userId AND c.isDeleted = false ORDER BY c.uploadDate DESC',
                parameters: [{ name: '@userId', value: userId }]
            };
        } else {
            // 获取所有文件
            querySpec = {
                query: 'SELECT * FROM c WHERE c.isDeleted = false ORDER BY c.uploadDate DESC'
            };
        }

        const { resources: items } = await container.items
            .query(querySpec)
            .fetchAll();

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: {
                success: true,
                count: items.length,
                data: items
            }
        };

    } catch (error) {
        context.log.error('Error getting media:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                error: 'Failed to retrieve media',
                details: error.message
            }
        };
    }
};
```

**GetMedia/function.json**:
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get"],
      "route": "media"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### 3️⃣ UpdateMedia - 更新媒体信息

**UpdateMedia/index.js**:
```javascript
const { CosmosClient } = require('@azure/cosmos');

module.exports = async function (context, req) {
    context.log('Updating media item');

    try {
        const fileId = req.query.id || req.body?.id;
        const { fileName, tags } = req.body;

        if (!fileId) {
            context.res = {
                status: 400,
                body: { error: 'File ID is required' }
            };
            return;
        }

        const cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);

        // 读取现有项目
        const { resource: existingItem } = await container.item(fileId, fileId).read();

        if (!existingItem) {
            context.res = {
                status: 404,
                body: { error: 'Media item not found' }
            };
            return;
        }

        // 更新字段
        if (fileName) existingItem.fileName = fileName;
        if (tags) existingItem.tags = tags;
        existingItem.lastModified = new Date().toISOString();

        // 保存更新
        const { resource: updatedItem } = await container
            .item(fileId, fileId)
            .replace(existingItem);

        context.res = {
            status: 200,
            body: {
                success: true,
                message: 'Media updated successfully',
                data: updatedItem
            }
        };

    } catch (error) {
        context.log.error('Error updating media:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                error: 'Failed to update media',
                details: error.message
            }
        };
    }
};
```

**UpdateMedia/function.json**:
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["put", "patch"],
      "route": "media/{id?}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

### 4️⃣ DeleteMedia - 删除媒体

**DeleteMedia/index.js**:
```javascript
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    context.log('Deleting media item');

    try {
        const fileId = req.query.id || req.params.id;

        if (!fileId) {
            context.res = {
                status: 400,
                body: { error: 'File ID is required' }
            };
            return;
        }

        const cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_ENDPOINT,
            key: process.env.COSMOS_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE);
        const container = database.container(process.env.COSMOS_CONTAINER);

        // 获取文件信息
        const { resource: item } = await container.item(fileId, fileId).read();

        if (!item) {
            context.res = {
                status: 404,
                body: { error: 'Media item not found' }
            };
            return;
        }

        // 方式1：软删除（推荐）- 只标记为已删除
        item.isDeleted = true;
        item.deletedDate = new Date().toISOString();
        await container.item(fileId, fileId).replace(item);

        // 方式2：硬删除（可选）- 真正删除
        // await container.item(fileId, fileId).delete();
        
        // 从Blob Storage删除实际文件（可选）
        // const blobServiceClient = BlobServiceClient.fromConnectionString(
        //     process.env.STORAGE_CONNECTION_STRING
        // );
        // const containerClient = blobServiceClient.getContainerClient(
        //     process.env.BLOB_CONTAINER_NAME
        // );
        // await containerClient.deleteBlob(item.blobName);

        context.res = {
            status: 200,
            body: {
                success: true,
                message: 'Media deleted successfully',
                id: fileId
            }
        };

    } catch (error) {
        context.log.error('Error deleting media:', error);
        context.res = {
            status: 500,
            body: {
                success: false,
                error: 'Failed to delete media',
                details: error.message
            }
        };
    }
};
```

**DeleteMedia/function.json**:
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["delete"],
      "route": "media/{id}"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

---

## 🧪 第六步：本地测试

### 启动本地开发服务器

```bash
# 在项目根目录运行
npm start

# 或者
func start
```

你会看到类似输出：
```
Functions:
    DeleteMedia: [DELETE] http://localhost:7071/api/media/{id}
    GetMedia: [GET] http://localhost:7071/api/media
    UpdateMedia: [PUT,PATCH] http://localhost:7071/api/media/{id}
    UploadMedia: [POST] http://localhost:7071/api/media
```

### 使用Postman或curl测试

**测试上传**：
```bash
curl -X POST http://localhost:7071/api/media \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.jpg",
    "fileType": "image/jpeg",
    "userId": "user123",
    "tags": ["test", "demo"],
    "fileBase64": "你的Base64编码的文件内容"
  }'
```

**测试获取**：
```bash
curl http://localhost:7071/api/media?userId=user123
```

**测试更新**：
```bash
curl -X PUT http://localhost:7071/api/media/文件ID \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "updated-name.jpg",
    "tags": ["updated"]
  }'
```

**测试删除**：
```bash
curl -X DELETE http://localhost:7071/api/media/文件ID
```

---

## ☁️ 第七步：部署到Azure

### 方法1：使用VS Code（推荐）

1. 在VS Code中打开Azure扩展
2. 右键点击 "Function App"
3. 选择 "Create Function App in Azure"
4. 填写信息：
   - 名称：`multimedia-api-20XX`（全局唯一）
   - 运行时：Node.js 18 LTS
   - 区域：选择离你近的
5. 创建完成后，右键点击你的Function App
6. 选择 "Deploy to Function App"

### 方法2：使用Azure CLI

```bash
# 1. 创建资源组（如果还没有）
az group create --name multimedia-rg --location eastus

# 2. 创建存储账户（Functions需要）
az storage account create \
  --name multimediafunc20XX \
  --resource-group multimedia-rg \
  --location eastus \
  --sku Standard_LRS

# 3. 创建Function App
az functionapp create \
  --resource-group multimedia-rg \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --name multimedia-api-20XX \
  --storage-account multimediafunc20XX

# 4. 部署代码
func azure functionapp publish multimedia-api-20XX
```

### 配置环境变量

部署后，需要在Azure门户设置环境变量：

```
Azure门户 → 你的Function App → 配置 → 应用程序设置 → 新建应用程序设置
```

添加这些设置（从local.settings.json复制）：
- `STORAGE_CONNECTION_STRING`
- `COSMOS_ENDPOINT`
- `COSMOS_KEY`
- `COSMOS_DATABASE`
- `COSMOS_CONTAINER`
- `BLOB_CONTAINER_NAME`

---

## 🌐 第八步：前端调用示例

**frontend/index.html**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>多媒体分享平台</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial; 
            max-width: 900px; 
            margin: 50px auto; 
            padding: 20px;
        }
        .upload-section { 
            background: #f5f5f5; 
            padding: 30px; 
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .file-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        .file-card { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 8px;
            background: white;
        }
        .file-card img { 
            width: 100%; 
            height: 200px; 
            object-fit: cover;
            border-radius: 4px;
        }
        button { 
            background: #0078d4; 
            color: white; 
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #106ebe; }
        .delete-btn { background: #d13438; }
        .delete-btn:hover { background: #a4262c; }
    </style>
</head>
<body>
    <h1>📸 云原生多媒体分享平台</h1>
    
    <div class="upload-section">
        <h2>上传新文件</h2>
        <input type="file" id="fileInput" accept="image/*,video/*">
        <input type="text" id="tagsInput" placeholder="标签 (逗号分隔)">
        <button onclick="uploadFile()">📤 上传</button>
        <div id="uploadStatus"></div>
    </div>
    
    <h2>我的文件</h2>
    <div class="file-grid" id="fileList"></div>
    
    <script>
        // Azure Functions API地址
        const API_BASE = 'https://multimedia-api-20XX.azurewebsites.net/api';
        // 本地测试用这个：
        // const API_BASE = 'http://localhost:7071/api';
        
        const USER_ID = 'user123'; // 实际应用中应该从登录获取
        
        // 页面加载时获取文件列表
        window.onload = () => {
            loadFiles();
        };
        
        // 上传文件
        async function uploadFile() {
            const fileInput = document.getElementById('fileInput');
            const tagsInput = document.getElementById('tagsInput');
            const statusDiv = document.getElementById('uploadStatus');
            
            if (!fileInput.files[0]) {
                alert('请选择文件！');
                return;
            }
            
            const file = fileInput.files[0];
            
            // 显示上传中状态
            statusDiv.innerHTML = '⏳ 上传中...';
            
            try {
                // 将文件转换为Base64
                const base64 = await fileToBase64(file);
                
                // 准备请求数据
                const uploadData = {
                    fileName: file.name,
                    fileType: file.type,
                    userId: USER_ID,
                    tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t),
                    fileBase64: base64.split(',')[1] // 去掉 "data:image/jpeg;base64," 前缀
                };
                
                // 调用API
                const response = await fetch(`${API_BASE}/media`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(uploadData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    statusDiv.innerHTML = '✅ 上传成功！';
                    fileInput.value = '';
                    tagsInput.value = '';
                    loadFiles(); // 刷新列表
                } else {
                    statusDiv.innerHTML = `❌ 上传失败: ${result.error}`;
                }
                
            } catch (error) {
                console.error('Upload error:', error);
                statusDiv.innerHTML = `❌ 上传失败: ${error.message}`;
            }
        }
        
        // 加载文件列表
        async function loadFiles() {
            try {
                const response = await fetch(`${API_BASE}/media?userId=${USER_ID}`);
                const result = await response.json();
                
                const fileListDiv = document.getElementById('fileList');
                
                if (result.success && result.data.length > 0) {
                    fileListDiv.innerHTML = result.data.map(file => `
                        <div class="file-card">
                            ${file.fileType.startsWith('image/') ? 
                                `<img src="${file.fileUrl}" alt="${file.fileName}">` :
                                `<div style="height:200px;background:#eee;display:flex;align-items:center;justify-content:center;">
                                    🎥 ${file.fileType}
                                </div>`
                            }
                            <h3>${file.fileName}</h3>
                            <p>上传时间: ${new Date(file.uploadDate).toLocaleString()}</p>
                            <p>标签: ${file.tags.join(', ') || '无'}</p>
                            <button onclick="editFile('${file.id}')">✏️ 编辑</button>
                            <button class="delete-btn" onclick="deleteFile('${file.id}')">🗑️ 删除</button>
                        </div>
                    `).join('');
                } else {
                    fileListDiv.innerHTML = '<p>还没有上传任何文件</p>';
                }
                
            } catch (error) {
                console.error('Load error:', error);
            }
        }
        
        // 编辑文件
        async function editFile(fileId) {
            const newName = prompt('输入新文件名：');
            const newTags = prompt('输入新标签（逗号分隔）：');
            
            if (!newName && !newTags) return;
            
            try {
                const updateData = {};
                if (newName) updateData.fileName = newName;
                if (newTags) updateData.tags = newTags.split(',').map(t => t.trim());
                
                const response = await fetch(`${API_BASE}/media/${fileId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('更新成功！');
                    loadFiles();
                } else {
                    alert(`更新失败: ${result.error}`);
                }
                
            } catch (error) {
                console.error('Update error:', error);
                alert(`更新失败: ${error.message}`);
            }
        }
        
        // 删除文件
        async function deleteFile(fileId) {
            if (!confirm('确定要删除这个文件吗？')) return;
            
            try {
                const response = await fetch(`${API_BASE}/media/${fileId}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('删除成功！');
                    loadFiles();
                } else {
                    alert(`删除失败: ${result.error}`);
                }
                
            } catch (error) {
                console.error('Delete error:', error);
                alert(`删除失败: ${error.message}`);
            }
        }
        
        // 辅助函数：文件转Base64
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

## 🔒 第九步：添加高级功能

### 1. CORS配置

**host.json**:
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "extensions": {
    "http": {
      "routePrefix": "api",
      "maxConcurrentRequests": 100,
      "maxOutstandingRequests": 200
    }
  }
}
```

在Azure门户配置CORS：
```
Function App → CORS → 添加允许的源
- 添加你的前端域名
- 或添加 * (仅开发用)
```

### 2. Application Insights监控

```bash
# 启用Application Insights
az monitor app-insights component create \
  --app multimedia-insights \
  --location eastus \
  --resource-group multimedia-rg

# 获取Instrumentation Key
az monitor app-insights component show \
  --app multimedia-insights \
  --resource-group multimedia-rg \
  --query instrumentationKey
```

在Function App配置中添加：
```
APPINSIGHTS_INSTRUMENTATIONKEY = <你的Key>
```

### 3. 添加图片缩略图生成

创建新函数 **GenerateThumbnail**:
```javascript
const sharp = require('sharp'); // 需要安装: npm install sharp
const { BlobServiceClient } = require('@azure/storage-blob');

module.exports = async function (context, myBlob) {
    context.log('Generating thumbnail for:', context.bindingData.name);
    
    try {
        // 生成缩略图
        const thumbnail = await sharp(myBlob)
            .resize(200, 200, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();
        
        // 上传缩略图
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient('thumbnails');
        await containerClient.createIfNotExists();
        
        const thumbnailName = `thumb-${context.bindingData.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(thumbnailName);
        await blockBlobClient.upload(thumbnail, thumbnail.length);
        
        context.log('Thumbnail generated:', thumbnailName);
        
    } catch (error) {
        context.log.error('Error generating thumbnail:', error);
    }
};
```

---

## 📊 第十步：性能优化

### 1. 使用SAS Token代替直接上传

让前端直接上传到Blob Storage，不经过Functions：

```javascript
// 新建函数：GenerateSASToken
const { BlobServiceClient, generateBlobSASQueryParameters, 
        BlobSASPermissions } = require('@azure/storage-blob');

module.exports = async function (context, req) {
    const fileName = req.query.fileName || req.body?.fileName;
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.STORAGE_CONNECTION_STRING
    );
    
    const containerClient = blobServiceClient.getContainerClient(
        process.env.BLOB_CONTAINER_NAME
    );
    
    const blobClient = containerClient.getBlobClient(fileName);
    
    // 生成1小时有效的上传token
    const sasToken = generateBlobSASQueryParameters({
        containerName: process.env.BLOB_CONTAINER_NAME,
        blobName: fileName,
        permissions: BlobSASPermissions.parse('w'), // 写权限
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000)
    }, blobServiceClient.credential).toString();
    
    context.res = {
        body: {
            uploadUrl: `${blobClient.url}?${sasToken}`,
            fileUrl: blobClient.url
        }
    };
};
```

### 2. 添加缓存

使用Cosmos DB的变更源（Change Feed）实现实时更新。

---

## ✅ 总结：Node.js的优势

| 特性 | Node.js方案 | Logic Apps方案 |
|------|------------|---------------|
| 编码灵活性 | ⭐⭐⭐⭐⭐ 完全自由 | ⭐⭐⭐ 有限制 |
| 学习曲线 | ⭐⭐⭐⭐ 如果会JS很简单 | ⭐⭐⭐⭐⭐ 可视化更简单 |
| 性能 | ⭐⭐⭐⭐⭐ 更快 | ⭐⭐⭐⭐ 稍慢 |
| 调试 | ⭐⭐⭐⭐⭐ 本地完全调试 | ⭐⭐⭐ 需要连Azure |
| 成本 | ⭐⭐⭐⭐ 很便宜 | ⭐⭐⭐⭐⭐ 非常便宜 |
| 云原生程度 | ⭐⭐⭐⭐⭐ 无服务器 | ⭐⭐⭐⭐⭐ 无服务器 |

---

## 🎯 快速开始步骤

```bash
# 1. 创建项目
func init multimedia-backend --javascript
cd multimedia-backend

# 2. 安装依赖
npm install @azure/storage-blob @azure/cosmos uuid

# 3. 创建函数
func new --name UploadMedia --template "HTTP trigger"

# 4. 复制上面的代码到对应文件

# 5. 配置local.settings.json

# 6. 本地测试
npm start

# 7. 部署到Azure
func azure functionapp publish <你的function-app名称>
```

---

有任何问题随时问我！比如：
- "怎么处理大文件上传？"
- "怎么添加用户认证？"
- "怎么实现图片压缩？"
- "部署遇到问题怎么办？"

祝你开发顺利！🚀

