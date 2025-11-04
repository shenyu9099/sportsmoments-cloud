# 赛场瞬间 - CI/CD 快速开始

## 🚀 一分钟快速部署

### **前提条件**
- ✅ GitHub 账号
- ✅ Azure 账号（Azure for Students）
- ✅ Git 已安装在本地

---

## 📝 快速步骤

### **1️⃣ 创建 GitHub 仓库（2分钟）**

```bash
# 在 GitHub 网站上创建新仓库
# 仓库名称：sportsmoments-cloud（或任意名称）
# 类型：Public 或 Private
```

---

### **2️⃣ 推送代码到 GitHub（3分钟）**

在项目根目录打开终端，执行：

```bash
# 初始化 Git
git init

# 配置用户信息（替换为你的信息）
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Sports Moments Cloud Native App"

# 关联远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

### **3️⃣ 创建 Azure Static Web Apps（5分钟）**

1. **登录 Azure 门户**：https://portal.azure.com

2. **创建资源**：
   - 搜索 "Static Web Apps"
   - 点击 "创建"

3. **配置**：
   - **订阅**：Azure for Students
   - **资源组**：`sportsmoments-france-rg`
   - **名称**：`sportsmoments-frontend`
   - **区域**：France Central
   - **源**：GitHub
   - **仓库**：选择你的仓库
   - **分支**：main
   - **应用位置**：`/frontend`
   - **API 位置**：留空
   - **输出位置**：留空

4. **创建并等待部署**

---

### **4️⃣ 验证部署（1分钟）**

1. **查看 GitHub Actions**：
   - GitHub 仓库 → Actions 标签
   - 等待绿色 ✅

2. **访问网站**：
   - Azure Static Web Apps → 复制 URL
   - 在浏览器中打开

---

## ✅ 完成！

现在你有了：
- 📦 **代码托管**：GitHub
- 🔄 **自动部署**：GitHub Actions
- 🌐 **前端托管**：Azure Static Web Apps
- 🔌 **后端 API**：Azure Logic Apps
- 📊 **监控**：Application Insights

---

## 🎬 演示 CI/CD

修改代码并推送：

```bash
# 修改任意文件
# 例如：修改 frontend/index.html

git add .
git commit -m "Update: 修改页面内容"
git push

# 然后：
# 1. 在 GitHub Actions 查看自动部署
# 2. 等待 2-3 分钟
# 3. 刷新网站查看更新
```

---

## 📁 项目结构

```
E:\11.9\
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # GitHub Actions 工作流
├── frontend/                          # 前端代码
│   ├── index.html
│   ├── login.html
│   ├── match-detail.html
│   ├── config.js
│   ├── appinsights.js
│   └── staticwebapp.config.json       # Azure Static Web Apps 配置
├── logic-apps/                        # Logic Apps 定义文件
├── .gitignore                         # Git 忽略文件
├── CI-CD-实施指南.md                  # 详细实施指南
└── README-CICD.md                     # 本文件
```

---

## 🔗 相关资源

- **CI/CD 详细指南**：`CI-CD-实施指南.md`
- **项目说明文档**：`项目说明文档.md`
- **演示脚本**：`演示脚本.md`
- **Application Insights 配置**：`Application-Insights-配置指南.md`

---

**祝你演示成功！** 🎉

