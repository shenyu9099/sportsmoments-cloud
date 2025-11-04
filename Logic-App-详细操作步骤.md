# Logic App 超详细操作步骤 - upload-match

## 🎯 目标

完成 `upload-match` Logic App的工作流设计，实现上传比赛功能。

---

## 📋 当前状态

- ✅ Logic App `upload-match` 已创建
- ✅ HTTP触发器已添加
- ⏳ 需要添加后续步骤

---

## 🚀 详细操作步骤

---

### 步骤1️⃣：配置HTTP触发器的Method

#### 1.1 找到Method字段
在右侧配置面板找到：**Method ***

#### 1.2 点击下拉框
点击 **"Enter method"** 下拉框

#### 1.3 选择POST
在下拉列表中点击：**POST**

#### 1.4 关闭配置面板
点击配置面板右上角的 **X** 关闭

---

### 步骤2️⃣：保存进度

#### 2.1 点击保存按钮
点击页面顶部的蓝色 **"Save"** 按钮 💾

#### 2.2 等待保存完成
会显示"正在保存..."，然后"已保存"

---

### 步骤3️⃣：添加第一个操作（初始化变量 - matchId）

#### 3.1 点击加号
**点击画布中间HTTP方框下面的蓝色圆形 "+" 按钮**

#### 3.2 选择添加操作
点击：**"添加操作"** 或 **"Add an action"**

#### 3.3 搜索变量
在弹出的搜索框中输入：**变量**（或 variable）

#### 3.4 选择"变量"
找到并点击 **"变量"** 操作（图标是一个方框）

#### 3.5 选择"初始化变量"
在操作列表中点击：**"初始化变量"** 或 **"Initialize variable"**

#### 3.6 配置变量 - 名称
右侧配置面板会打开，在 **"名称"** 字段输入：
```
matchId
```

#### 3.7 配置变量 - 类型
点击 **"类型"** 下拉框，选择：**字符串** 或 **String**

#### 3.8 配置变量 - 值（重要！）
1. 点击 **"值"** 输入框
2. 点击输入框右侧的 **⚡闪电图标**（添加动态内容）
3. 会弹出一个面板，看到两个标签：
   - 动态内容
   - **表达式** ← **点击这个标签**
4. 在表达式输入框中输入：
   ```
   guid()
   ```
5. 点击 **"确定"** 或 **"OK"** 按钮

现在"值"字段应该显示：`guid()`

#### 3.9 关闭配置面板
点击右上角的 **X**

---

### 步骤4️⃣：添加第二个变量（videoBlobName）

#### 4.1 点击加号
**点击刚才创建的"初始化变量"方框下面的 "+" 按钮**

#### 4.2 添加操作
点击 **"添加操作"**

#### 4.3 搜索变量
输入：**变量**

#### 4.4 选择"初始化变量"
点击 **"变量"** → **"初始化变量"**

#### 4.5 配置名称
**名称**：输入 `videoBlobName`

#### 4.6 配置类型
**类型**：选择 **字符串**

#### 4.7 配置值
1. 点击 **"值"** 输入框
2. 点击⚡图标
3. 切换到 **表达式** 标签
4. 输入：
   ```
   concat('match-', variables('matchId'), '.mp4')
   ```
5. 点击 **确定**

#### 4.8 关闭面板
点击 X

---

### 步骤5️⃣：保存进度

点击顶部 **"Save"** 按钮 💾

---

### 步骤6️⃣：添加Blob Storage操作（上传视频）

#### 6.1 点击加号
点击第二个"初始化变量"下面的 **"+"**

#### 6.2 添加操作
点击 **"添加操作"**

#### 6.3 搜索Blob
输入：**blob** 或 **azure blob storage**

#### 6.4 选择Azure Blob Storage
找到并点击 **"Azure Blob Storage"** 图标

#### 6.5 选择"创建Blob"
在操作列表中，点击：**"创建 Blob"** 或 **"Create blob"**

#### 6.6 创建连接（第一次使用需要）

会弹出连接配置面板：

**连接名称**：输入 `BlobConnection`

**身份验证类型**：选择 **访问密钥**

**Azure 存储账户名称**：
- 输入你的存储账户名（比如 `sport`）

**Azure 存储账户访问密钥**：
1. **打开新的浏览器标签页**
2. 访问 Azure门户
3. 搜索并进入你的Storage Account（`sport`）
4. 左侧菜单找到 **"安全 + 网络"** → **"访问密钥"**
5. 点击 **"显示"** 按钮
6. 复制 **key1** 的值（一长串字符）
7. **回到Logic Apps标签页**
8. 粘贴到 **"访问密钥"** 字段
9. 点击 **"创建"** 或 **"Create"** 按钮

#### 6.7 配置Blob参数

连接创建后，配置Blob：

**文件夹路径**：
- 输入：`/match-videos`（注意前面有斜杠）

**Blob 名称**：
1. 点击输入框
2. 点击⚡图标
3. 切换到 **动态内容** 标签
4. 找到并点击 **videoBlobName**（就是刚才创建的变量）

**Blob 内容**：
1. 点击输入框
2. 点击⚡图标
3. 切换到 **表达式** 标签
4. 输入：
   ```
   base64ToBinary(triggerBody()?['videoContent'])
   ```
5. 点击 **确定**

#### 6.8 关闭面板
点击 X

---

### 步骤7️⃣：保存进度

点击顶部 **"Save"** 💾

---

### 步骤8️⃣：添加Cosmos DB操作（保存元数据）

#### 8.1 点击加号
点击Blob Storage步骤下面的 **"+"**

#### 8.2 添加操作
点击 **"添加操作"**

#### 8.3 搜索Cosmos
输入：**cosmos** 或 **azure cosmos db**

#### 8.4 选择Azure Cosmos DB
点击 **"Azure Cosmos DB"** 图标

#### 8.5 选择操作
点击：**"创建或更新文档 (V3)"** 或 **"Create or update document (V3)"**

#### 8.6 创建连接（第一次使用）

**连接名称**：输入 `CosmosConnection`

**身份验证类型**：选择 **访问密钥**

**账户 ID**：
- 输入你的Cosmos DB账户名（比如 `sprot-113992`）

**访问密钥**：
1. **新开浏览器标签页**
2. Azure门户 → 你的Cosmos DB账户
3. 左侧菜单 → **"设置"** → **"密钥"**
4. 点击 **"显示密钥"** 按钮（眼睛图标）
5. 复制 **"主密钥"** 的值
6. **回到Logic Apps标签页**
7. 粘贴到 **"访问密钥"** 字段
8. 点击 **"创建"** 按钮

#### 8.7 配置Cosmos DB参数

**数据库 ID**：
- 下拉选择或输入：`MediaDB`

**容器 ID**：
- 下拉选择或输入：`Matches`

**文档**（简化版）：
点击输入框，输入：
```json
{
  "id": "",
  "teamId": "",
  "matchTitle": "",
  "uploadDate": ""
}
```

然后填充动态内容：
1. 光标点击第一个 `""` 之间（id字段）
2. 点击⚡ → 动态内容 → 选择 `matchId`
3. 光标点击第二个 `""` 之间（teamId字段）
4. 点击⚡ → 动态内容 → 向下滚动找到 `teamId`（来自HTTP请求的Body）
5. 依次填充其他字段...

**或者先输入简化版**：
```json
{
  "id": "@{variables('matchId')}",
  "teamId": "test-team",
  "matchTitle": "test match",
  "uploadDate": "@{utcNow()}"
}
```

**分区键值**：
1. 点击输入框
2. 点击⚡ → 动态内容
3. 向下滚动找到 `teamId`
4. 点击选择

#### 8.8 关闭面板
点击 X

---

### 步骤9️⃣：添加响应步骤

#### 9.1 点击加号
点击Cosmos DB步骤下面的 **"+"**

#### 9.2 添加操作
点击 **"添加操作"**

#### 9.3 搜索响应
输入：**响应** 或 **response**

#### 9.4 选择"响应"
点击：**"响应"** 或 **"Response"** 操作

#### 9.5 配置响应
**状态代码**：输入 `200`

**正文**：输入：
```json
{
  "success": true,
  "message": "Upload successful"
}
```

#### 9.6 关闭面板
点击 X

---

### 步骤🔟：保存完整工作流

点击顶部 **"Save"** 按钮 💾

---

### 步骤1️⃣1️⃣：获取API URL

#### 11.1 展开HTTP触发器
在画布中，**点击HTTP方框**，如果它是折叠的会展开

#### 11.2 复制URL
会显示：
```
HTTP POST URL
https://prod-XX.francecentral.logic.azure.com...
```

**点击URL右侧的 📋 复制图标**

#### 11.3 保存URL
打开记事本，粘贴保存：
```
upload-match: https://prod-XX.francecentral.logic.azure.com...
```

---

## ✅ 第一个Logic App完成！🎉

---

## 📝 创建其他Logic Apps

用同样的流程创建其他必需的Logic Apps：

### Logic App #2: get-matches（获取比赛列表）

**创建新的Logic App**：
1. Azure门户 → Logic Apps → 创建
2. 名称：`get-matches`
3. 资源组：`sportsmoments-france-rg`
4. 类型：消耗
5. 区域：France Central

**工作流步骤**：
1. HTTP触发器（Method: **GET**）
2. Cosmos DB → **查询文档 (V3)**
   - 数据库：MediaDB
   - 容器：Matches
   - 查询：`SELECT * FROM c WHERE c.teamId = '@teamId' AND c.isDeleted = false`
3. 响应
   - 状态码：200
   - 正文：`{"success": true, "data": []}`

---

### Logic App #3: get-match-by-id（获取单个比赛）

**创建**：名称 `get-match-by-id`

**工作流**：
1. HTTP触发器（Method: **GET**）
2. Cosmos DB → **读取文档 (V3)**
   - 数据库：MediaDB
   - 容器：Matches
3. 响应

---

### Logic App #4: create-annotation（创建战术标注）

**创建**：名称 `create-annotation`

**工作流**：
1. HTTP触发器（Method: **POST**）
2. 初始化变量 annotationId
3. 创建Blob（上传战术图）
4. Cosmos DB创建文档（TacticAnnotations容器）
5. 响应

---

### Logic App #5: add-comment（添加评论）

**创建**：名称 `add-comment`

**工作流**：
1. HTTP触发器（Method: **POST**）
2. 初始化变量 commentId
3. Cosmos DB创建文档（Comments容器）
4. 响应

---

## 🎯 当前任务

**现在就在 upload-match 的设计器页面操作！**

从步骤1开始：配置HTTP的Method为POST！

**准备好了吗？** 开始操作，每完成一步告诉我，我继续指导下一步！

---

## 💡 操作提示

- ⚡图标 = 添加动态内容/表达式
- 动态内容 = 前面步骤的输出
- 表达式 = 函数（如guid(), utcNow(), concat()等）
- 每添加几个步骤就Save一次
- 不确定就问我！

---

开始吧！🚀

