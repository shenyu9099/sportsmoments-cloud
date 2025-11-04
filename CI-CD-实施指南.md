# CI/CD 实施指南

## 📋 项目概述

本项目使用 **GitHub Actions** + **Azure Static Web Apps** 实现完整的 CI/CD 流程，实现代码的自动化构建和部署。

---

## 🏗️ CI/CD 架构

```
开发者本地修改代码
      ↓
   git push 到 GitHub
      ↓
GitHub Actions 自动触发
      ↓
   构建和部署
      ↓
Azure Static Web Apps 自动更新
      ↓
   用户访问最新版本
```

---

## 🚀 实施步骤

### **步骤1：创建 GitHub 仓库**

1. **登录 GitHub**：https://github.com
2. **创建新仓库**：
   - 点击右上角的 "+" → "New repository"
   - 仓库名称：`sportsmoments-cloud` 或任意名称
   - 选择 **Public**（公开）或 **Private**（私有）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

---

### **步骤2：初始化本地 Git 仓库**

在项目根目录（`E:\11.9`）打开 PowerShell 或命令提示符，执行：

```bash
# 初始化 Git 仓库
git init

# 配置用户信息（替换为你的 GitHub 用户名和邮箱）
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Sports Moments Cloud Native Application"

# 关联远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

**注意**：替换 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 为你的实际 GitHub 用户名和仓库名称。

---

### **步骤3：创建 Azure Static Web Apps 资源**

#### **方法A：在 Azure 门户创建（推荐）**

1. **登录 Azure 门户**：https://portal.azure.com
2. **创建资源**：
   - 点击 "创建资源"
   - 搜索 "Static Web Apps"
   - 点击 "创建"

3. **配置基本信息**：
   - **订阅**：Azure for Students
   - **资源组**：选择 `sportsmoments-france-rg`（或创建新的）
   - **名称**：`sportsmoments-frontend`
   - **区域**：France Central（或离你最近的区域）
   - **SKU**：Free（免费层）

4. **配置部署详细信息**：
   - **源**：GitHub
   - **组织**：你的 GitHub 用户名
   - **存储库**：选择你刚创建的仓库
   - **分支**：main 或 master

5. **配置生成详细信息**：
   - **生成预设**：Custom（自定义）
   - **应用位置**：`/frontend`
   - **API 位置**：留空
   - **输出位置**：留空

6. **查看 + 创建**：
   - 点击 "查看 + 创建"
   - 点击 "创建"

7. **等待部署完成**（约 2-3 分钟）

#### **Azure 会自动做什么？**

✅ 在你的 GitHub 仓库中创建 GitHub Actions workflow 文件  
✅ 配置部署密钥（secrets）  
✅ 自动触发第一次部署  
✅ 提供一个公开的 URL（如 `https://xxx.azurestaticapps.net`）

---

### **步骤4：验证部署**

1. **查看 GitHub Actions**：
   - 在 GitHub 仓库中，点击 "Actions" 标签
   - 查看部署工作流的运行状态
   - 等待绿色的 ✅ 表示部署成功

2. **访问网站**：
   - 在 Azure Static Web Apps 资源的 "概览" 页面
   - 找到 "URL" 字段
   - 点击链接访问你的前端应用

3. **测试功能**：
   - 登录、浏览比赛、上传等功能应该正常工作
   - 所有 API 调用仍然使用 Logic Apps

---

### **步骤5：演示 CI/CD 流程**

1. **修改代码**：
   ```bash
   # 例如：修改 index.html 的标题
   # 然后提交并推送
   git add .
   git commit -m "Update: 修改页面标题"
   git push
   ```

2. **观察自动部署**：
   - 在 GitHub Actions 中查看新的工作流运行
   - 等待部署完成
   - 刷新网站，查看更新

---

## 📊 CI/CD 配置文件说明

### **1. `.github/workflows/azure-static-web-apps.yml`**

GitHub Actions 工作流文件，定义了：
- **触发条件**：push 到 main 分支时自动运行
- **部署步骤**：
  1. 检出代码
  2. 构建应用
  3. 部署到 Azure Static Web Apps

### **2. `frontend/staticwebapp.config.json`**

Azure Static Web Apps 配置文件，定义了：
- **路由规则**：哪些路径可以访问
- **回退规则**：404 错误重定向到 index.html
- **响应头**：安全相关的 HTTP 头
- **MIME 类型**：文件类型映射

### **3. `.gitignore`**

Git 忽略文件，指定哪些文件不应该提交到版本控制：
- 系统文件（Windows, macOS）
- 编辑器配置
- 临时文件
- 敏感信息

---

## 🎯 演示时的重点

在视频演示中，你可以：

1. **展示 GitHub 仓库**：
   - 显示代码结构
   - 显示 `.github/workflows` 目录
   - 显示提交历史

2. **展示 GitHub Actions**：
   - 打开 "Actions" 标签
   - 展示工作流运行历史
   - 展示最近一次成功的部署

3. **展示 Azure Static Web Apps**：
   - 在 Azure 门户中打开资源
   - 显示部署历史
   - 显示公开的 URL

4. **演示 CI/CD 流程**：
   - "现在我修改一下代码..."
   - 提交并推送
   - "可以看到 GitHub Actions 自动触发了..."
   - "几分钟后，网站就自动更新了"

---

## ✅ CI/CD 的优势

在你的项目说明或 PPT 中，强调：

- 🚀 **自动化部署**：每次推送代码后自动部署，无需手动操作
- 🔄 **持续集成**：确保代码始终处于可部署状态
- 🛡️ **版本控制**：Git 提供完整的代码历史和回滚能力
- ⚡ **快速迭代**：从开发到生产只需几分钟
- 📊 **可追踪性**：每次部署都有完整的日志和记录

---

## 🔧 故障排除

### **问题1：GitHub Actions 失败**
- 检查工作流日志中的错误信息
- 确认 `app_location` 设置正确（`/frontend`）
- 确认 GitHub 仓库有正确的 secrets

### **问题2：部署成功但网站无法访问**
- 检查 Azure Static Web Apps 的 URL 是否正确
- 检查浏览器控制台是否有 CORS 错误
- 确认 `config.js` 中的 API 端点 URL 正确

### **问题3：Git 推送失败**
- 检查网络连接
- 确认 GitHub 用户名和密码/令牌正确
- 如果使用 HTTPS，可能需要生成 Personal Access Token

---

## 📚 相关资源

- **GitHub Actions 文档**：https://docs.github.com/en/actions
- **Azure Static Web Apps 文档**：https://learn.microsoft.com/en-us/azure/static-web-apps/
- **Git 教程**：https://git-scm.com/book/zh/v2

---

## 🎓 满足作业要求

✅ **"实现 CI/CD 使用 Git"**  
- Git 版本控制：✅  
- GitHub 托管代码：✅  
- GitHub Actions 自动构建：✅  
- Azure Static Web Apps 自动部署：✅  
- 完整的 DevOps 流程：✅

---

**恭喜！你已经实现了完整的云原生 CI/CD 解决方案！** 🎉

