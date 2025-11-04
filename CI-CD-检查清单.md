# CI/CD 实施检查清单

## ✅ 实施前检查

### **准备工作**
- [ ] 已注册 GitHub 账号
- [ ] 已安装 Git（执行 `git --version` 检查）
- [ ] 已有 Azure 账号（Azure for Students）
- [ ] 项目代码已准备好

---

## 📝 实施步骤检查

### **步骤1：创建 GitHub 仓库**
- [ ] 登录 GitHub
- [ ] 创建新仓库（记录仓库名称：________________）
- [ ] 仓库已创建成功
- [ ] 复制仓库 URL

### **步骤2：本地 Git 初始化**
```bash
cd E:\11.9
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

- [ ] Git 初始化完成
- [ ] 用户信息配置完成
- [ ] 检查 `.gitignore` 文件存在

### **步骤3：提交代码到 GitHub**
```bash
git add .
git commit -m "Initial commit: Sports Moments Cloud Native App"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

- [ ] 代码已添加到暂存区
- [ ] 代码已提交
- [ ] 远程仓库已关联
- [ ] 代码已推送到 GitHub
- [ ] 在 GitHub 网站上能看到代码

### **步骤4：创建 Azure Static Web Apps**

**在 Azure 门户**：
- [ ] 打开 Azure 门户（https://portal.azure.com）
- [ ] 点击"创建资源"
- [ ] 搜索"Static Web Apps"
- [ ] 点击"创建"

**配置**：
- [ ] 订阅：Azure for Students
- [ ] 资源组：sportsmoments-france-rg
- [ ] 名称：sportsmoments-frontend（或其他）
- [ ] 区域：France Central（或最近的）
- [ ] SKU：Free

**GitHub 集成**：
- [ ] 源：GitHub
- [ ] 组织：你的 GitHub 用户名
- [ ] 存储库：选择你的仓库
- [ ] 分支：main

**构建详细信息**：
- [ ] 生成预设：Custom
- [ ] 应用位置：`/frontend`
- [ ] API 位置：（留空）
- [ ] 输出位置：（留空）

**部署**：
- [ ] 点击"查看 + 创建"
- [ ] 点击"创建"
- [ ] 等待部署完成（2-3 分钟）

### **步骤5：验证部署**

**检查 GitHub**：
- [ ] 打开 GitHub 仓库
- [ ] 点击"Actions"标签
- [ ] 查看工作流运行状态
- [ ] 确认显示绿色 ✅

**检查 Azure**：
- [ ] 在 Azure Static Web Apps 资源页面
- [ ] 复制 URL（记录：________________）
- [ ] 在浏览器中打开 URL
- [ ] 网站正常显示

**功能测试**：
- [ ] 登录功能正常
- [ ] 比赛列表正常显示
- [ ] 比赛详情可以访问
- [ ] API 调用正常（检查浏览器控制台）

---

## 🧪 CI/CD 流程测试

### **测试自动部署**

1. **修改代码**：
```bash
# 例如：修改 frontend/index.html 的标题
# 然后提交
git add .
git commit -m "Test: 测试 CI/CD 自动部署"
git push
```

- [ ] 代码已修改
- [ ] 代码已提交并推送
- [ ] GitHub Actions 自动触发
- [ ] 工作流运行成功
- [ ] 网站自动更新

---

## 📊 验证清单

### **GitHub 检查**
- [ ] 代码已推送到 GitHub
- [ ] `.github/workflows/azure-static-web-apps.yml` 文件存在
- [ ] Actions 标签显示工作流
- [ ] 最近的部署显示成功 ✅

### **Azure 检查**
- [ ] Static Web Apps 资源已创建
- [ ] 部署历史显示成功部署
- [ ] URL 可以访问
- [ ] 网站功能正常

### **配置文件检查**
- [ ] `.gitignore` 文件存在
- [ ] `.github/workflows/azure-static-web-apps.yml` 文件存在
- [ ] `frontend/staticwebapp.config.json` 文件存在
- [ ] `frontend/config.js` 中的 API 端点正确

---

## 🎬 演示准备检查

### **GitHub 演示**
- [ ] 可以展示代码仓库
- [ ] 可以展示 `.github/workflows` 目录
- [ ] 可以展示 Actions 运行历史
- [ ] 可以展示提交历史

### **Azure 演示**
- [ ] 可以展示 Static Web Apps 资源
- [ ] 可以展示部署历史
- [ ] 可以展示网站 URL
- [ ] 可以展示监控数据（Application Insights）

### **CI/CD 流程演示**
- [ ] 准备好要修改的代码示例
- [ ] 知道如何推送代码
- [ ] 知道如何查看 GitHub Actions
- [ ] 知道如何验证部署结果

---

## 📚 文档检查

- [ ] `CI-CD-实施指南.md` 已创建
- [ ] `README-CICD.md` 已创建
- [ ] `项目说明文档.md` 已更新（包含 CI/CD 部分）
- [ ] 所有文档已提交到 Git

---

## 🎯 作业要求检查

### **技术要求**
- [ ] ✅ 云原生存储（Blob Storage）
- [ ] ✅ NoSQL 数据库（Cosmos DB）
- [ ] ✅ REST API（Logic Apps）
- [ ] ✅ 端点 URI（HTTP 触发器）
- [ ] ✅ CI/CD（GitHub Actions）
- [ ] ✅ Git（GitHub）
- [ ] ✅ 高级服务（Application Insights）

### **文档要求**
- [ ] 项目说明文档完整
- [ ] 部署步骤清晰
- [ ] 架构图准备好
- [ ] 演示脚本准备好

---

## ⚠️ 常见问题

### **问题1：Git 推送失败**
- 检查网络连接
- 检查 GitHub 用户名和密码
- 可能需要生成 Personal Access Token

### **问题2：GitHub Actions 失败**
- 查看工作流日志
- 检查 `app_location` 设置
- 检查 Azure Static Web Apps API Token

### **问题3：网站无法访问**
- 检查 URL 是否正确
- 检查 Azure 资源是否正常运行
- 检查浏览器控制台错误

### **问题4：API 调用失败**
- 检查 `config.js` 中的 API 端点
- 检查 Logic Apps 是否正常运行
- 检查 CORS 配置

---

## ✅ 最终确认

- [ ] 所有功能已实现
- [ ] CI/CD 流程已测试
- [ ] 文档已完成
- [ ] 演示已准备好
- [ ] 视频录制设备已准备
- [ ] 了解如何展示 CI/CD 流程

---

**完成日期**：________________  
**检查人**：________________

---

**恭喜！你已经完成了所有实施步骤！** 🎉

现在可以：
1. 录制演示视频
2. 准备 PPT 演讲
3. 提交作业

**祝你成功！** 🚀

