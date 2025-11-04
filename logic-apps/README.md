# Logic Apps 部署指南

## 📋 文件清单

所有 Logic Apps JSON 定义文件：

1. ✅ `upload-match` - 已在 Azure 门户手动创建
2. 📄 `get-matches.json` - 获取比赛列表（GET）
3. 📄 `get-match-by-id.json` - 获取单个比赛（GET）
4. 📄 `delete-match.json` - 删除比赛（DELETE）
5. 📄 `create-annotation.json` - 创建战术标注（POST）
6. 📄 `get-annotations.json` - 获取标注列表（GET）
7. 📄 `add-comment.json` - 添加评论（POST）
8. 📄 `get-comments.json` - 获取评论列表（GET）

---

## 🚀 方法1：使用 PowerShell 脚本自动部署（推荐）

### 步骤1：运行部署脚本

在 PowerShell 中运行：

```powershell
cd E:\11.9
.\logic-apps\deploy-all-logic-apps.ps1
```

### 步骤2：等待部署完成

脚本会自动：
- 创建所有 Logic Apps
- 获取每个 Logic App 的 HTTP URL
- 保存 URLs 到 `logic-apps-urls.txt`

### 步骤3：更新前端配置

1. 打开 `logic-apps-urls.txt`
2. 复制所有 URLs
3. 更新 `frontend/config.js` 中的 `apiEndpoints`

---

## 🔧 方法2：在 Azure 门户手动创建

### 对于每个 Logic App：

1. **创建新的 Logic App**：
   - 资源组：`sportsmoments-france-rg`
   - 名称：如 `get-matches`
   - 区域：`France Central`
   - 计划类型：`消耗`

2. **配置工作流**：
   - 进入 Logic App
   - 点击 "代码视图" 或 "Logic app code view"
   - 复制对应的 JSON 文件内容
   - 粘贴并保存

3. **获取 HTTP URL**：
   - 保存后，进入 "概述"
   - 点击 "When an HTTP request is received" 触发器
   - 复制 "HTTP POST URL"

4. **更新 `frontend/config.js`**

---

## 📝 Logic Apps 说明

### 1. get-matches
- **方法**: GET
- **功能**: 获取比赛列表
- **参数**: `?teamId=basketball-club-001`
- **返回**: 比赛数组

### 2. get-match-by-id
- **方法**: GET
- **功能**: 获取单个比赛详情
- **参数**: `?id=xxx&teamId=xxx`
- **返回**: 单个比赛对象

### 3. delete-match
- **方法**: DELETE
- **功能**: 删除比赛
- **参数**: `?id=xxx&teamId=xxx`
- **返回**: 成功消息

### 4. create-annotation
- **方法**: POST
- **功能**: 创建战术标注
- **请求体**:
```json
{
  "matchId": "xxx",
  "timestamp": "00:05:23",
  "annotationType": "offense",
  "description": "快攻战术",
  "coordinates": {"x": 100, "y": 200},
  "createdBy": "user-coach-001"
}
```

### 5. get-annotations
- **方法**: GET
- **功能**: 获取标注列表
- **参数**: `?matchId=xxx`
- **返回**: 标注数组

### 6. add-comment
- **方法**: POST
- **功能**: 添加评论
- **请求体**:
```json
{
  "matchId": "xxx",
  "userId": "user-001",
  "userName": "张三",
  "content": "这个战术很好",
  "timestamp": "00:05:23"
}
```

### 7. get-comments
- **方法**: GET
- **功能**: 获取评论列表
- **参数**: `?matchId=xxx`
- **返回**: 评论数组

---

## ⚠️ 注意事项

1. **Cosmos DB 连接**：
   - 所有 Logic Apps 使用相同的连接 `documentdb-1`
   - 确保连接配置正确（Account ID 和 Access Key）

2. **分区键**：
   - Matches: 使用 `teamId`
   - TacticAnnotations: 使用 `matchId`
   - Comments: 使用 `matchId`

3. **CORS 配置**（如果前端遇到跨域问题）：
   - 在每个 Logic App 的"设置"中
   - 添加允许的源（如 `*` 或具体的前端 URL）

---

## 🔍 故障排查

### 如果脚本失败：

1. **检查 Azure CLI 登录**：
   ```powershell
   az login
   az account show
   ```

2. **手动创建单个 Logic App**：
   ```powershell
   az logicapp create --resource-group sportsmoments-france-rg --name get-matches --location francecentral --definition "@logic-apps/get-matches.json"
   ```

3. **在 Azure 门户中手动创建**（参见方法2）

---

## 📸 完成后

所有 Logic Apps 创建完成后：

1. ✅ 在 Azure 门户中验证所有 Logic Apps 都已创建
2. ✅ 测试每个 Logic App 的 HTTP URL
3. ✅ 更新 `frontend/config.js`
4. ✅ 测试前端功能

---

**祝部署顺利！** 🚀

