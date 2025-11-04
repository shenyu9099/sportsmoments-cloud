# 🏀 赛场瞬间 - 云原生战术分析平台

[![Azure](https://img.shields.io/badge/Azure-Cloud%20Native-0078D4?logo=microsoft-azure)](https://azure.microsoft.com)
[![Logic Apps](https://img.shields.io/badge/Logic%20Apps-REST%20API-00BCF2)](https://azure.microsoft.com/services/logic-apps/)
[![Cosmos DB](https://img.shields.io/badge/Cosmos%20DB-NoSQL-00A3E0)](https://azure.microsoft.com/services/cosmos-db/)

面向校园体育社团的比赛录像与战术分析云协作平台

---

## 📖 项目简介

**赛场瞬间**解决了校园体育社团在比赛分析中的痛点：
- ✅ **云端存储**：替代本地存储，节省空间
- ✅ **在线协作**：教练和队员随时随地访问
- ✅ **战术标注**：在视频关键时刻添加战术分析
- ✅ **讨论互动**：团队成员在线讨论和学习

### 技术架构

```
前端 (HTML/CSS/JS)
    ↓
Azure Logic Apps (REST API)
    ↓
├─ Azure Blob Storage (视频/图片)
├─ Azure Cosmos DB (元数据/标注/评论)
└─ Application Insights (监控)
```

---

## 🚀 快速开始

### 前置要求

- Azure账号（[免费注册](https://azure.microsoft.com/free/)）
- PowerShell（Windows自带）
- Azure CLI（可选，自动安装）

### 一键部署

```powershell
# 1. 克隆项目（如果有Git）或下载文件

# 2. 运行部署脚本
.\deploy-azure.ps1

# 3. 等待5-10分钟，所有资源自动创建完成！
```

部署完成后会生成：
- ✅ Azure Storage Account (视频存储)
- ✅ Cosmos DB (数据库)
- ✅ Blob容器 (match-videos, thumbnails, tactics)
- ✅ Cosmos DB集合 (Matches, TacticAnnotations, Comments, Teams)
- ✅ 配置文件 (azure-config.json, frontend/config.js)

---

## 📋 创建Logic Apps

部署完基础资源后，需要在Azure门户手动创建Logic Apps：

```powershell
# 查看详细步骤
cat logic-apps-guide.md
```

### Logic Apps列表（共9个）

| 编号 | 名称 | 功能 | 方法 |
|------|------|------|------|
| 1 | upload-match | 上传比赛录像 | POST |
| 2 | get-matches | 获取比赛列表 | GET |
| 3 | get-match-by-id | 获取单个比赛 | GET |
| 4 | update-match | 更新比赛信息 | PUT |
| 5 | delete-match | 删除比赛 | DELETE |
| 6 | create-annotation | 创建战术标注 | POST |
| 7 | get-annotations | 获取标注列表 | GET |
| 8 | add-comment | 添加评论 | POST |
| 9 | get-comments | 获取评论列表 | GET |

### 更新配置

创建完Logic Apps后：

1. 复制每个Logic App的HTTP URL
2. 更新 `frontend/config.js` 中的API端点
3. 保存文件

---

## 🌐 本地测试

### 方法1：Python HTTP Server

```bash
cd frontend
python -m http.server 8000

# 访问: http://localhost:8000
```

### 方法2：Node.js HTTP Server

```bash
cd frontend
npx http-server -p 8000

# 访问: http://localhost:8000
```

### 方法3：VS Code Live Server

1. 安装 Live Server 扩展
2. 右键 `index.html`
3. 选择 "Open with Live Server"

---

## 📂 项目结构

```
赛场瞬间/
├── frontend/                    # 前端文件
│   ├── index.html              # 主页（比赛列表）
│   ├── match-detail.html       # 比赛详情页
│   ├── styles.css              # 样式文件
│   ├── script.js               # 主页脚本
│   ├── match-detail.js         # 详情页脚本
│   └── config.js               # 配置文件（自动生成）
│
├── deploy-azure.ps1            # 一键部署脚本
├── logic-apps-guide.md         # Logic Apps创建指南
├── azure-config.json           # Azure配置（自动生成）
├── deployment-summary.txt      # 部署摘要（自动生成）
└── README.md                   # 本文件
```

---

## 🎯 功能特性

### ✨ 核心功能

#### 1. 比赛管理
- 📤 上传比赛录像（支持MP4, WebM, OGG）
- 🖼️ 自定义缩略图
- 📊 比赛结果记录（比分、胜负）
- 🏷️ 标签分类（主场、客场、季后赛等）
- 🔍 搜索和筛选

#### 2. 视频播放
- ▶️ HTML5视频播放器
- ⏱️ 时间轴标记
- 🎯 关键时刻快速跳转
- ⛶ 全屏播放

#### 3. 战术标注
- 🖌️ 在线绘制战术图
  - 箭头工具（球员移动）
  - 圆圈工具（标记位置）
  - 直线工具
  - 文字标注
- 📸 截图保存
- ⏰ 时间戳关联
- 🏷️ 标签分类

#### 4. 协作讨论
- 💬 评论系统
- 👍 点赞功能
- 👥 团队成员互动
- 📱 实时更新

### 🚀 高级功能（可扩展）

- 📊 统计数据可视化
- 🔔 实时通知（SignalR）
- 👤 用户权限管理
- 📱 PWA移动应用
- 🎥 视频转码（Media Services）
- 🤖 AI战术分析

---

## 💻 开发指南

### 前端开发

项目使用纯HTML/CSS/JavaScript，无需构建工具：

```javascript
// 修改配置文件
frontend/config.js

// 主要文件
- index.html       // 比赛列表页面
- match-detail.html // 比赛详情页面
- script.js        // 主页逻辑
- match-detail.js  // 详情页逻辑
```

### API调用示例

```javascript
// 上传比赛
const uploadData = {
    teamId: 'basketball-club-001',
    matchTitle: '友谊赛 vs 计算机学院',
    matchDate: '2025-11-15T14:00:00Z',
    videoContent: base64String,
    // ... 其他字段
};

const response = await fetch(AZURE_CONFIG.apiEndpoints.uploadMatch, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(uploadData)
});

const result = await response.json();
```

### 数据库结构

#### Matches（比赛集合）
```json
{
  "id": "match-guid-123",
  "teamId": "basketball-club-001",
  "matchTitle": "友谊赛 vs 计算机学院",
  "matchDate": "2025-11-15T14:30:00Z",
  "result": {
    "ourScore": 78,
    "opponentScore": 72,
    "outcome": "win"
  },
  "videoUrl": "https://...",
  "tags": ["主场", "胜利"]
}
```

#### TacticAnnotations（战术标注）
```json
{
  "id": "annotation-guid-456",
  "matchId": "match-guid-123",
  "timestamp": 1250,
  "title": "快攻战术-第3节",
  "description": "张三抢断后快速推进",
  "imageUrl": "https://...",
  "tags": ["快攻", "成功"]
}
```

#### Comments（评论）
```json
{
  "id": "comment-guid-789",
  "matchId": "match-guid-123",
  "userId": "user-player-005",
  "userName": "队员李四",
  "content": "这个战术很精彩！",
  "createdDate": "2025-11-16T10:30:00Z"
}
```

---

## 🔧 故障排除

### 问题1：部署脚本报错

**错误**：`未安装Azure CLI`

**解决**：
```powershell
# 下载并安装
https://aka.ms/installazurecliwindows

# 或使用 winget
winget install Microsoft.AzureCLI
```

---

### 问题2：Logic App连接失败

**检查清单**：
1. ✅ Cosmos DB是否创建成功？
2. ✅ 连接字符串是否正确？
3. ✅ 分区键配置是否正确？
4. ✅ 数据库和容器名称是否匹配？

**查看错误**：
```
Azure门户 → Logic App → 运行历史记录 → 点击失败的运行 → 查看详情
```

---

### 问题3：前端无法上传文件

**检查**：
1. ✅ `frontend/config.js` 中的API URL是否已更新？
2. ✅ 浏览器控制台是否有CORS错误？
3. ✅ 文件大小是否超过限制（100MB）？

**解决CORS**：
```
Logic App → 设置 → CORS → 添加允许的源
输入: * (开发时) 或 你的域名
```

---

### 问题4：视频无法播放

**检查**：
1. ✅ Blob容器的公共访问级别是否设置为"Blob"？
2. ✅ 视频URL是否正确？
3. ✅ 视频格式是否支持（MP4最佳）？

**设置公共访问**：
```
Azure门户 → Storage Account → 容器 → 更改访问级别 → Blob
```

---

## 📊 成本估算

### 开发/测试阶段（每月）

| 服务 | 用量 | 费用（USD） |
|------|------|------------|
| Storage Account | 50GB + 1000次操作 | $1-2 |
| Cosmos DB | 无服务器模式 | $0.25-1 |
| Logic Apps | 1000次运行 | 免费 |
| **总计** | | **$2-4** |

### 生产环境（每月，100用户）

| 服务 | 用量 | 费用（USD） |
|------|------|------------|
| Storage Account | 500GB + 100K操作 | $10-15 |
| Cosmos DB | 10K RU/s | $25-40 |
| Logic Apps | 10K次运行 | $10-15 |
| **总计** | | **$45-70** |

💡 **省钱技巧**：
- 使用冷存储归档旧比赛
- 压缩视频文件
- 使用Azure学生账号（$100免费额度）

---

## 🎓 适用场景

### 校园体育社团
- 🏀 篮球队
- ⚽ 足球队
- 🏐 排球队
- 🏓 其他球类运动

### 培训机构
- 📚 体育培训班
- 🎯 战术研讨会
- 👨‍🏫 教练培训

### 业余运动队
- 👥 社区运动队
- 🏆 业余联赛球队
- 🎮 电竞战队（游戏录像分析）

---

## 📄 许可证

本项目为课程作业项目，仅供学习使用。

**作者**：[你的名字]
**学号**：[你的学号]
**课程**：COM682 - Cloud Native Development
**时间**：2025年11月

---

## 🙏 致谢

- Microsoft Azure 云平台
- Ulster University
- 所有参考资料和文档

---

## 📞 支持

遇到问题？

1. 📖 查看 `logic-apps-guide.md`
2. 🔍 查看 Azure门户运行日志
3. 💬 联系课程助教
4. 📧 发送邮件至 [你的邮箱]

---

## 🗺️ 路线图

### ✅ 已完成
- 比赛上传和管理
- 视频播放
- 战术标注
- 评论系统

### 🚧 计划中
- [ ] 移动端优化
- [ ] 视频自动转码
- [ ] AI战术识别
- [ ] 数据统计图表
- [ ] 导出分析报告

---

**⭐ 如果这个项目对你有帮助，请给个Star！**

🏀 让我们一起用云技术改变体育训练方式！

