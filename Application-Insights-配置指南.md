# Application Insights 配置指南

## 📊 什么是 Application Insights？

Application Insights 是 Azure 的**应用程序性能管理**服务，可以监控：
- 📈 页面访问量
- 👤 用户行为分析
- ⚡ 页面加载性能
- 🐛 错误和异常跟踪
- 📊 自定义事件（如上传比赛、添加标注等）

---

## 🚀 快速配置步骤

### 步骤1：在 Azure 创建 Application Insights

1. **打开 Azure 门户**

2. **点击 "+ 创建资源"**

3. **搜索 "Application Insights"** → 点击

4. **配置**：
   - **订阅**：你的订阅
   - **资源组**：`sportsmoments-france-rg`
   - **名称**：`sportsmoments-insights`
   - **区域**：`France Central`
   - **资源模式**：基于工作区（推荐）或经典

5. **点击"审阅 + 创建"** → **创建**

6. **等待部署完成**（约1分钟）

---

### 步骤2：获取连接字符串

1. **部署完成后，点击"转到资源"**

2. **在"概述"页面**，找到右侧的关键信息：

3. **复制"连接字符串"**（Connection String）：
   ```
   InstrumentationKey=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;IngestionEndpoint=https://francecentral-1.in.applicationinsights.azure.com/;LiveEndpoint=https://francecentral.livediagnostics.monitor.azure.com/
   ```

   或者**复制"检测密钥"**（Instrumentation Key）：
   ```
   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

---

### 步骤3：更新前端配置

1. **打开** `frontend/appinsights.js`

2. **找到第12行**：
   ```javascript
   connectionString: 'YOUR_CONNECTION_STRING', // 替换为你的连接字符串
   ```

3. **替换为你复制的连接字符串**：
   ```javascript
   connectionString: 'InstrumentationKey=xxx;IngestionEndpoint=https://...',
   ```

4. **保存文件**

---

### 步骤4：测试监控

1. **刷新你的网站**

2. **执行一些操作**：
   - 登录
   - 上传比赛
   - 添加战术标注
   - 发表评论

3. **回到 Azure 门户 Application Insights**

4. **左侧菜单 → "监视" → "实时指标"**
   - 应该能看到实时的请求数据

5. **左侧菜单 → "调查" → "事件"**
   - 可以看到自定义事件：
     - UserLogin
     - MatchUpload
     - AnnotationCreate
     - CommentAdd

---

## 📊 可以查看的数据

### **实时指标**（Live Metrics）
- 实时请求率
- 实时失败率
- 服务器响应时间

### **用户**（Users）
- 活跃用户数
- 用户会话
- 用户行为流

### **页面视图**（Page Views）
- 访问最多的页面
- 页面加载时间
- 浏览器分布

### **自定义事件**（Custom Events）
- UserLogin - 用户登录次数
- MatchUpload - 比赛上传次数（包含视频大小）
- AnnotationCreate - 战术标注创建次数
- CommentAdd - 评论添加次数

### **性能**（Performance）
- 页面加载时间分析
- 依赖项调用时间
- 慢查询识别

---

## 🎯 在演示视频中展示

### 推荐展示内容：

1. **打开 Application Insights 资源**

2. **展示"实时指标"**：
   - "看，这里实时显示了应用的使用情况"

3. **展示"自定义事件"**：
   - "我添加了自定义事件跟踪，可以看到用户上传了多少比赛，创建了多少战术标注"

4. **展示"用户分析"**：
   - "可以分析用户的使用模式和行为"

---

## ⚠️ 注意事项

### **成本：**
- Application Insights 有**免费层**
- 前 5GB 数据/月 免费
- 学生项目完全够用

### **隐私：**
- 不会收集敏感信息
- 只跟踪匿名的使用数据
- 符合 GDPR 要求

### **性能：**
- 异步加载，不影响页面性能
- 如果 Application Insights 服务不可用，不影响网站功能

---

## 🎉 完成！

配置完成后，你的项目就有了：
- ✅ 用户登录/注册（SQL Database）
- ✅ 比赛管理（Cosmos DB + Blob Storage）
- ✅ 战术标注（Cosmos DB + Blob Storage）
- ✅ 评论功能（Cosmos DB）
- ✅ **应用监控（Application Insights）** ← 新增！

完美符合作业要求的**高级服务**！👍

