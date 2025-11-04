# GitHub Pages 部署指南（替代 Azure Static Web Apps）

## 📋 背景

由于 Azure for Students 订阅的策略限制，Static Web Apps 无法创建。因此我们使用 **GitHub Pages** 作为替代方案。

**GitHub Pages 同样满足作业要求**：
- ✅ 使用 Git 版本控制
- ✅ 实现 CI/CD（GitHub Actions）
- ✅ 自动部署
- ✅ 免费托管

---

## 🚀 部署步骤

### **步骤1：提交新的 Workflow 文件**

在项目根目录执行：

```bash
cd E:\11.9

# 添加新的 workflow 文件
git add .github/workflows/github-pages.yml
git add GitHub-Pages-部署指南.md

# 提交
git commit -m "Add: GitHub Pages deployment workflow"

# 推送到 GitHub
git push
```

---

### **步骤2：在 GitHub 启用 Pages**

1. **打开浏览器**，访问你的 GitHub 仓库：
   ```
   https://github.com/shenyu9099/sportsmoments-cloud
   ```

2. **点击仓库的 Settings（设置）标签**

3. **在左侧菜单找到 "Pages"**

4. **配置 Pages**：
   - **Source（源）**：选择 **"GitHub Actions"**
   - 不需要选择分支（使用 Actions 自动部署）

5. **保存设置**

---

### **步骤3：触发部署**

有两种方式触发部署：

#### **方式1：自动触发（推荐）**
- 刚才推送代码时，GitHub Actions 会自动运行
- 等待 2-3 分钟

#### **方式2：手动触发**
1. 在 GitHub 仓库点击 **"Actions"** 标签
2. 点击左侧的 **"Deploy to GitHub Pages"**
3. 点击右侧的 **"Run workflow"** 按钮
4. 点击绿色的 **"Run workflow"** 确认

---

### **步骤4：查看部署状态**

1. **在 GitHub 仓库点击 "Actions" 标签**

2. **查看最新的 workflow 运行**：
   - 等待显示绿色 ✅（成功）
   - 如果是黄色 🟡，说明正在运行
   - 如果是红色 ❌，点击查看错误日志

3. **部署成功后，获取网站 URL**：
   - 回到 **Settings → Pages**
   - 在顶部会显示：**"Your site is live at https://shenyu9099.github.io/sportsmoments-cloud/"**

---

## 🌐 访问你的网站

部署成功后，你的前端应用会发布在：

```
https://shenyu9099.github.io/sportsmoments-cloud/
```

或者自定义域名（如果配置了）。

---

## ✅ 验证功能

访问网站后，测试以下功能：

1. **登录功能**：
   - 能否正常登录？
   - API 调用是否正常？

2. **比赛列表**：
   - 能否显示比赛列表？
   - 能否点击查看详情？

3. **浏览器控制台**（F12）：
   - 检查是否有错误
   - 检查 API 调用（Network 标签）

---

## 🔧 故障排除

### **问题1：Pages 设置中没有 "GitHub Actions" 选项**

**解决方案**：
- 确保你的仓库是 **Public**（公开）
- 或者你的 GitHub 账户有 **GitHub Pro**（学生免费）

**如果仓库是 Private**：
1. 去仓库 Settings → General
2. 拉到最下方 "Danger Zone"
3. 点击 "Change visibility" → "Make public"

---

### **问题2：GitHub Actions 运行失败**

**解决方案**：
1. 点击失败的 workflow 查看日志
2. 检查 `.github/workflows/github-pages.yml` 文件格式
3. 确保 `frontend` 目录存在且有文件

---

### **问题3：网站显示 404**

**解决方案**：
1. 检查 Pages 是否已启用
2. 检查 workflow 是否成功运行
3. 等待 5-10 分钟（DNS 传播需要时间）

---

### **问题4：网站显示但 API 调用失败**

**原因**：
- GitHub Pages 使用 HTTPS
- 可能有 CORS 问题

**解决方案**：
- 检查 Logic Apps 的 CORS 设置
- 确保允许来自 `https://shenyu9099.github.io` 的请求

---

## 🎬 演示时的重点

在视频演示中，你可以：

### **1. 展示 GitHub 仓库**
- 显示代码结构
- 显示 `.github/workflows/github-pages.yml` 文件

### **2. 展示 GitHub Actions**
- 打开 "Actions" 标签
- 显示 workflow 运行历史
- 显示最近一次成功的部署（绿色 ✅）

### **3. 展示 GitHub Pages 设置**
- Settings → Pages
- 显示部署的 URL

### **4. 访问网站**
- 打开部署的网站
- 演示登录、浏览、上传等功能

### **5. 演示 CI/CD 流程**
```
"现在我修改一下代码，比如改个标题..."
git add .
git commit -m "Update: 测试 CI/CD"
git push

"可以看到 GitHub Actions 自动触发了..."
（展示 Actions 页面）

"几分钟后，网站就自动更新了"
（刷新网站，显示更新）
```

---

## 📊 对比：GitHub Pages vs Azure Static Web Apps

| 特性 | GitHub Pages | Azure Static Web Apps |
|------|--------------|----------------------|
| **价格** | 完全免费 | 免费层（有限制） |
| **CI/CD** | GitHub Actions ✅ | GitHub Actions ✅ |
| **部署速度** | 2-3 分钟 | 2-3 分钟 |
| **自定义域名** | 支持 ✅ | 支持 ✅ |
| **HTTPS** | 自动 ✅ | 自动 ✅ |
| **限制** | 仓库需公开* | 区域策略限制 ❌ |

*学生账户可以用 Private 仓库

---

## ✅ 作业要求对照

| 要求 | GitHub Pages 方案 | 状态 |
|------|------------------|------|
| Git 版本控制 | GitHub | ✅ |
| CI/CD | GitHub Actions | ✅ |
| 自动部署 | 推送即部署 | ✅ |
| 云托管 | GitHub Pages | ✅ |
| 后端 API | Logic Apps | ✅ |
| 数据库 | Cosmos DB + SQL | ✅ |
| 存储 | Blob Storage | ✅ |
| 监控 | Application Insights | ✅ |

**所有要求都满足！** ✅

---

## 🎯 总结

虽然 Azure Static Web Apps 因策略限制无法使用，但 **GitHub Pages + GitHub Actions** 提供了：
- ✅ 完整的 CI/CD 流程
- ✅ 自动化部署
- ✅ 免费可靠的托管
- ✅ 满足所有作业要求

在演示时，你可以解释：
> "由于 Azure for Students 订阅的策略限制，我改用 GitHub Pages 进行前端托管。这同样实现了完整的 CI/CD 流程，使用 GitHub Actions 自动构建和部署。每次推送代码到 GitHub，前端就会自动更新。"

---

**现在开始部署吧！** 🚀

