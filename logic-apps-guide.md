# Logic Apps 创建指南 - 赛场瞬间

## 📋 需要创建的Logic Apps列表

共需要创建 **9个Logic Apps**：

### 比赛管理 (5个)
1. **upload-match** - 上传比赛
2. **get-matches** - 获取比赛列表
3. **get-match-by-id** - 获取单个比赛详情
4. **update-match** - 更新比赛信息
5. **delete-match** - 删除比赛

### 战术标注 (3个)
6. **create-annotation** - 创建战术标注
7. **get-annotations** - 获取战术标注列表
8. **update-annotation** - 更新战术标注

### 评论管理 (2个)
9. **add-comment** - 添加评论
10. **get-comments** - 获取评论列表

---

## 🔧 Logic App #1: 上传比赛

### 创建步骤

```
Azure门户 → Logic Apps → 创建
资源组: sportsmoments-rg
名称: upload-match
类型: 消耗 (Consumption)
区域: East US
```

### 工作流设计

**步骤1: HTTP触发器**
```
触发器: When a HTTP request is received
方法: POST

请求正文JSON架构:
{
    "type": "object",
    "properties": {
        "teamId": {"type": "string"},
        "matchTitle": {"type": "string"},
        "matchDate": {"type": "string"},
        "opponent": {"type": "string"},
        "location": {"type": "string"},
        "result": {
            "type": "object",
            "properties": {
                "ourScore": {"type": "integer"},
                "opponentScore": {"type": "integer"},
                "outcome": {"type": "string"}
            }
        },
        "videoContent": {"type": "string"},
        "videoType": {"type": "string"},
        "videoSize": {"type": "integer"},
        "thumbnailContent": {"type": "string"},
        "tags": {
            "type": "array",
            "items": {"type": "string"}
        },
        "uploadedBy": {"type": "string"}
    }
}
```

**步骤2: 初始化变量 - matchId**
```
操作: 初始化变量
名称: matchId
类型: 字符串
值: guid()  (表达式)
```

**步骤3: 初始化变量 - videoBlobName**
```
操作: 初始化变量
名称: videoBlobName
类型: 字符串
值: @{concat('match-', variables('matchId'), '.mp4')}
```

**步骤4: 条件判断 - 是否有缩略图**
```
操作: 条件
条件: @not(empty(triggerBody()?['thumbnailContent']))
```

**在True分支**:
```
操作: 初始化变量
名称: thumbnailBlobName
类型: 字符串
值: @{concat('thumb-', variables('matchId'), '.jpg')}
```

**步骤5: 上传视频到Blob Storage**
```
操作: 创建 Blob (Azure Blob Storage)
文件夹路径: /match-videos
Blob名称: @{variables('videoBlobName')}
Blob内容: @{base64ToBinary(triggerBody()?['videoContent'])}
内容类型: @{triggerBody()?['videoType']}
```

**步骤6: 上传缩略图 (在True分支)**
```
操作: 创建 Blob (Azure Blob Storage)
文件夹路径: /thumbnails
Blob名称: @{variables('thumbnailBlobName')}
Blob内容: @{base64ToBinary(triggerBody()?['thumbnailContent'])}
内容类型: image/jpeg
```

**步骤7: 创建Cosmos DB文档**
```
操作: 创建或更新文档 (V3) (Azure Cosmos DB)
数据库ID: MediaDB
容器ID: Matches
分区键值: @{triggerBody()?['teamId']}

文档:
{
  "id": "@{variables('matchId')}",
  "teamId": "@{triggerBody()?['teamId']}",
  "matchTitle": "@{triggerBody()?['matchTitle']}",
  "matchDate": "@{triggerBody()?['matchDate']}",
  "opponent": "@{triggerBody()?['opponent']}",
  "location": "@{triggerBody()?['location']}",
  "result": @{triggerBody()?['result']},
  "videoUrl": "@{concat('https://你的存储账户名.blob.core.windows.net/match-videos/', variables('videoBlobName'))}",
  "thumbnailUrl": "@{if(not(empty(triggerBody()?['thumbnailContent'])), concat('https://你的存储账户名.blob.core.windows.net/thumbnails/', variables('thumbnailBlobName')), null)}",
  "videoSize": @{triggerBody()?['videoSize']},
  "uploadedBy": "@{triggerBody()?['uploadedBy']}",
  "uploadDate": "@{utcNow()}",
  "tags": @{triggerBody()?['tags']},
  "viewCount": 0,
  "isDeleted": false
}
```

**步骤8: 响应**
```
操作: 响应
状态代码: 200
正文:
{
  "success": true,
  "message": "Match uploaded successfully",
  "data": {
    "id": "@{variables('matchId')}",
    "matchTitle": "@{triggerBody()?['matchTitle']}",
    "videoUrl": "@{concat('https://你的存储账户名.blob.core.windows.net/match-videos/', variables('videoBlobName'))}",
    "uploadDate": "@{utcNow()}"
  }
}
```

### 保存并获取URL
保存后，复制HTTP POST URL到配置文件！

---

## 🔧 Logic App #2: 获取比赛列表

### 创建
```
名称: get-matches
```

### 工作流

**步骤1: HTTP触发器**
```
方法: GET
```

**步骤2: Cosmos DB查询**
```
操作: 查询文档 (V3)
数据库ID: MediaDB
容器ID: Matches

查询:
SELECT * FROM c 
WHERE c.teamId = '@{triggerOutputs()['queries']?['teamId']}' 
AND c.isDeleted = false 
ORDER BY c.matchDate DESC

分区键值: @{triggerOutputs()['queries']?['teamId']}
```

**步骤3: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "count": @{length(body('查询文档_(V3)')?['Documents'])},
  "data": @{body('查询文档_(V3)')?['Documents']}
}
```

---

## 🔧 Logic App #3: 获取单个比赛

### 创建
```
名称: get-match-by-id
```

### 工作流

**步骤1: HTTP触发器**
```
方法: GET
```

**步骤2: Cosmos DB读取文档**
```
操作: 读取文档 (V3)
数据库ID: MediaDB
容器ID: Matches
文档ID: @{triggerOutputs()['queries']?['id']}
分区键值: @{triggerOutputs()['queries']?['teamId']}
```

**步骤3: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "data": @{body('读取文档_(V3)')}
}
```

---

## 🔧 Logic App #4: 更新比赛

### 创建
```
名称: update-match
```

### 工作流

**步骤1: HTTP触发器**
```
方法: PUT

请求正文架构:
{
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "teamId": {"type": "string"},
        "matchTitle": {"type": "string"},
        "tags": {
            "type": "array",
            "items": {"type": "string"}
        }
    }
}
```

**步骤2: 读取现有文档**
```
操作: 读取文档 (V3)
数据库ID: MediaDB
容器ID: Matches
文档ID: @{triggerBody()?['id']}
分区键值: @{triggerBody()?['teamId']}
```

**步骤3: 更新文档**
```
操作: 创建或更新文档 (V3)
数据库ID: MediaDB
容器ID: Matches
分区键值: @{triggerBody()?['teamId']}

文档: (保留原有字段，更新需要修改的字段)
{
  "id": "@{body('读取文档_(V3)')?['id']}",
  "teamId": "@{body('读取文档_(V3)')?['teamId']}",
  "matchTitle": "@{if(empty(triggerBody()?['matchTitle']), body('读取文档_(V3)')?['matchTitle'], triggerBody()?['matchTitle'])}",
  ... (其他字段保持不变)
  "tags": "@{if(empty(triggerBody()?['tags']), body('读取文档_(V3)')?['tags'], triggerBody()?['tags'])}",
  "lastModified": "@{utcNow()}"
}
```

**步骤4: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "message": "Match updated successfully",
  "data": @{body('创建或更新文档_(V3)')}
}
```

---

## 🔧 Logic App #5: 删除比赛

### 创建
```
名称: delete-match
```

### 工作流

**步骤1: HTTP触发器**
```
方法: DELETE

请求正文架构:
{
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "teamId": {"type": "string"}
    }
}
```

**步骤2: 读取文档**
```
操作: 读取文档 (V3)
文档ID: @{triggerBody()?['id']}
分区键值: @{triggerBody()?['teamId']}
```

**步骤3: 软删除**
```
操作: 创建或更新文档 (V3)
文档:
{
  ... (保留所有字段)
  "isDeleted": true,
  "deletedDate": "@{utcNow()}"
}
```

**步骤4: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "message": "Match deleted successfully",
  "id": "@{triggerBody()?['id']}"
}
```

---

## 🔧 Logic App #6: 创建战术标注

### 创建
```
名称: create-annotation
```

### 工作流

**步骤1: HTTP触发器**
```
方法: POST

请求正文架构:
{
    "type": "object",
    "properties": {
        "matchId": {"type": "string"},
        "teamId": {"type": "string"},
        "timestamp": {"type": "number"},
        "title": {"type": "string"},
        "description": {"type": "string"},
        "imageContent": {"type": "string"},
        "tags": {
            "type": "array",
            "items": {"type": "string"}
        },
        "createdBy": {"type": "string"}
    }
}
```

**步骤2: 生成annotationId**
```
操作: 初始化变量
名称: annotationId
值: guid()
```

**步骤3: 初始化imageBlobName**
```
名称: imageBlobName
值: @{concat('tactic-', variables('annotationId'), '.png')}
```

**步骤4: 上传战术图**
```
操作: 创建 Blob
文件夹路径: /tactics
Blob名称: @{variables('imageBlobName')}
Blob内容: @{base64ToBinary(triggerBody()?['imageContent'])}
内容类型: image/png
```

**步骤5: 创建Cosmos DB文档**
```
操作: 创建或更新文档 (V3)
数据库ID: MediaDB
容器ID: TacticAnnotations
分区键值: @{triggerBody()?['matchId']}

文档:
{
  "id": "@{variables('annotationId')}",
  "matchId": "@{triggerBody()?['matchId']}",
  "teamId": "@{triggerBody()?['teamId']}",
  "timestamp": @{triggerBody()?['timestamp']},
  "title": "@{triggerBody()?['title']}",
  "description": "@{triggerBody()?['description']}",
  "imageUrl": "@{concat('https://你的存储账户名.blob.core.windows.net/tactics/', variables('imageBlobName'))}",
  "tags": @{triggerBody()?['tags']},
  "createdBy": "@{triggerBody()?['createdBy']}",
  "createdDate": "@{utcNow()}",
  "likes": 0
}
```

**步骤6: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "message": "Annotation created successfully",
  "data": {
    "id": "@{variables('annotationId')}",
    "imageUrl": "@{concat('https://你的存储账户名.blob.core.windows.net/tactics/', variables('imageBlobName'))}"
  }
}
```

---

## 🔧 Logic App #7: 获取战术标注列表

### 创建
```
名称: get-annotations
```

### 工作流

**步骤1: HTTP触发器**
```
方法: GET
```

**步骤2: 查询Cosmos DB**
```
操作: 查询文档 (V3)
数据库ID: MediaDB
容器ID: TacticAnnotations

查询:
SELECT * FROM c 
WHERE c.matchId = '@{triggerOutputs()['queries']?['matchId']}' 
ORDER BY c.timestamp ASC

分区键值: @{triggerOutputs()['queries']?['matchId']}
```

**步骤3: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "count": @{length(body('查询文档_(V3)')?['Documents'])},
  "data": @{body('查询文档_(V3)')?['Documents']}
}
```

---

## 🔧 Logic App #8: 添加评论

### 创建
```
名称: add-comment
```

### 工作流

**步骤1: HTTP触发器**
```
方法: POST

请求正文架构:
{
    "type": "object",
    "properties": {
        "matchId": {"type": "string"},
        "userId": {"type": "string"},
        "userName": {"type": "string"},
        "content": {"type": "string"}
    }
}
```

**步骤2: 生成commentId**
```
操作: 初始化变量
名称: commentId
值: guid()
```

**步骤3: 创建Cosmos DB文档**
```
操作: 创建或更新文档 (V3)
数据库ID: MediaDB
容器ID: Comments
分区键值: @{triggerBody()?['matchId']}

文档:
{
  "id": "@{variables('commentId')}",
  "matchId": "@{triggerBody()?['matchId']}",
  "userId": "@{triggerBody()?['userId']}",
  "userName": "@{triggerBody()?['userName']}",
  "content": "@{triggerBody()?['content']}",
  "createdDate": "@{utcNow()}",
  "likes": 0,
  "isDeleted": false
}
```

**步骤4: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": "@{variables('commentId')}",
    "createdDate": "@{utcNow()}"
  }
}
```

---

## 🔧 Logic App #9: 获取评论列表

### 创建
```
名称: get-comments
```

### 工作流

**步骤1: HTTP触发器**
```
方法: GET
```

**步骤2: 查询Cosmos DB**
```
操作: 查询文档 (V3)
数据库ID: MediaDB
容器ID: Comments

查询:
SELECT * FROM c 
WHERE c.matchId = '@{triggerOutputs()['queries']?['matchId']}' 
AND c.isDeleted = false
ORDER BY c.createdDate DESC

分区键值: @{triggerOutputs()['queries']?['matchId']}
```

**步骤3: 响应**
```
状态代码: 200
正文:
{
  "success": true,
  "count": @{length(body('查询文档_(V3)')?['Documents'])},
  "data": @{body('查询文档_(V3)')?['Documents']}
}
```

---

## ✅ 完成后的检查清单

创建完所有Logic Apps后：

1. **获取每个Logic App的URL**
   - 进入Logic App → 概述 → HTTP触发器 → 复制URL

2. **更新frontend/config.js**
   - 将所有API URL替换为实际的Logic App URL

3. **测试每个API**
   - 使用Postman或浏览器测试
   - 确保返回正确的JSON响应

4. **检查Cosmos DB连接**
   - 查看运行历史记录
   - 确认数据成功写入Cosmos DB

5. **检查Blob Storage**
   - 确认文件成功上传
   - URL可以正常访问

---

## 🎯 快速测试脚本

创建完成后，可以用这个PowerShell脚本测试：

```powershell
# 测试上传比赛API
$UploadUrl = "YOUR_UPLOAD_MATCH_URL"

$TestData = @{
    teamId = "basketball-club-001"
    matchTitle = "测试比赛"
    matchDate = "2025-11-15T14:00:00Z"
    opponent = "测试对手"
    location = "体育馆"
    result = @{
        ourScore = 78
        opponentScore = 72
        outcome = "win"
    }
    videoContent = "" # Base64编码的小视频
    videoType = "video/mp4"
    videoSize = 1024
    tags = @("测试", "友谊赛")
    uploadedBy = "user-test-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri $UploadUrl -Method Post -Body $TestData -ContentType "application/json"
```

---

## 💡 提示

1. **存储账户名替换**：在所有URL中替换`你的存储账户名`为实际的存储账户名

2. **分区键很重要**：Cosmos DB操作时必须提供正确的分区键

3. **测试建议**：先测试简单的GET API，再测试复杂的POST API

4. **错误排查**：查看Logic App的运行历史记录，可以看到每个步骤的输入输出

5. **性能优化**：如果视频很大，考虑使用SAS Token让前端直接上传到Blob

---

好运！🚀

