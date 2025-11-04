# ✅ 赛场瞬间 - 完成进度检查清单

**打印这个清单，完成一项打一个勾！** ✓

---

## 📅 第1天：Azure资源部署

### 环境准备
- [ ] 安装PowerShell（Windows自带）
- [ ] 注册Azure账号（免费试用或学生账号）
- [ ] 下载所有项目文件到本地
- [ ] 阅读 `快速启动指南.md`（20分钟）

### 运行部署脚本
- [ ] 打开PowerShell
- [ ] 进入项目目录 `cd E:\11.9`
- [ ] 运行 `.\deploy-azure.ps1`
- [ ] 输入 Y 确认部署
- [ ] 等待部署完成（5-10分钟）

### 验证部署结果
- [ ] 看到 "部署完成！" 消息
- [ ] 找到生成的文件：
  - [ ] `azure-config.json`
  - [ ] `frontend/config.js`
  - [ ] `deployment-summary.txt`
- [ ] 打开 `deployment-summary.txt` 查看资源信息
- [ ] 访问Azure门户确认资源创建成功：
  - [ ] 资源组存在
  - [ ] Storage Account 存在
  - [ ] Cosmos DB 存在
  - [ ] Blob容器创建（3个）
  - [ ] Cosmos DB集合创建（4个）

**第1天完成时间估计：30分钟**

---

## 📅 第2天：创建Logic Apps

### 准备工作
- [ ] 打开 `logic-apps-guide.md`
- [ ] 准备记事本记录Logic Apps URL
- [ ] 登录Azure门户

### 创建Logic Apps（至少5个）

#### ⭐ 必须创建（核心功能）
- [ ] **Logic App #1: upload-match** （上传比赛）
  - [ ] 创建Logic App资源
  - [ ] 设计工作流（8个步骤）
  - [ ] 配置HTTP触发器
  - [ ] 配置Blob Storage连接
  - [ ] 配置Cosmos DB连接
  - [ ] 保存Logic App
  - [ ] 复制HTTP POST URL
  - [ ] URL保存到记事本

- [ ] **Logic App #2: get-matches** （获取比赛列表）
  - [ ] 创建Logic App资源
  - [ ] 设计工作流（3个步骤）
  - [ ] 配置Cosmos DB查询
  - [ ] 保存Logic App
  - [ ] 复制HTTP GET URL

- [ ] **Logic App #3: get-match-by-id** （获取单个比赛）
  - [ ] 创建Logic App资源
  - [ ] 设计工作流
  - [ ] 保存并复制URL

#### ⭐ 演示用（至少2个）
- [ ] **Logic App #6: create-annotation** （创建战术标注）
  - [ ] 创建Logic App资源
  - [ ] 设计工作流
  - [ ] 保存并复制URL

- [ ] **Logic App #8: add-comment** （添加评论）
  - [ ] 创建Logic App资源
  - [ ] 设计工作流
  - [ ] 保存并复制URL

#### 可选（如果时间充裕）
- [ ] Logic App #4: update-match
- [ ] Logic App #5: delete-match
- [ ] Logic App #7: get-annotations
- [ ] Logic App #9: get-comments

### 更新配置
- [ ] 打开 `frontend/config.js`
- [ ] 更新 `apiEndpoints.uploadMatch` 为实际URL
- [ ] 更新 `apiEndpoints.getMatches` 为实际URL
- [ ] 更新 `apiEndpoints.getMatchById` 为实际URL
- [ ] 更新 `apiEndpoints.createAnnotation` 为实际URL
- [ ] 更新 `apiEndpoints.addComment` 为实际URL
- [ ] 保存文件

**第2天完成时间估计：1-2小时**

---

## 📅 第3天：测试功能

### 本地运行测试
- [ ] 打开PowerShell或终端
- [ ] 进入frontend目录 `cd frontend`
- [ ] 启动HTTP服务器：
  - [ ] `python -m http.server 8000` 或
  - [ ] 使用VS Code Live Server
- [ ] 浏览器访问 `http://localhost:8000`

### 功能测试

#### 测试1：查看比赛列表
- [ ] 页面正常加载
- [ ] 显示"加载中..."或"暂无比赛"
- [ ] 无JavaScript错误（F12查看Console）

#### 测试2：上传比赛
- [ ] 点击"上传新比赛"按钮
- [ ] 模态框正常打开
- [ ] 填写比赛信息：
  - [ ] 比赛名称
  - [ ] 对手队伍
  - [ ] 比赛日期
  - [ ] 比分
- [ ] 选择测试视频（小于10MB）
- [ ] 点击上传
- [ ] 看到上传进度
- [ ] 上传成功提示
- [ ] 比赛出现在列表中

#### 测试3：查看比赛详情
- [ ] 点击某个比赛卡片
- [ ] 跳转到详情页
- [ ] 视频正常加载
- [ ] 视频可以播放
- [ ] 进度条正常工作

#### 测试4：战术标注（可选）
- [ ] 点击"添加战术标注"
- [ ] 画布正常显示
- [ ] 可以绘制箭头/圆圈
- [ ] 保存标注成功

#### 测试5：添加评论（可选）
- [ ] 输入评论内容
- [ ] 点击发表
- [ ] 评论显示在列表中

### Azure验证
- [ ] Azure门户 → Storage Account → 容器
  - [ ] match-videos 中有上传的视频
  - [ ] 可以下载查看
- [ ] Azure门户 → Cosmos DB → 数据资源管理器
  - [ ] Matches 集合中有记录
  - [ ] 数据结构正确
- [ ] Azure门户 → Logic Apps → 运行历史记录
  - [ ] 有成功运行的记录
  - [ ] 每个步骤都成功

**第3天完成时间估计：1小时**

---

## 📅 第4天：准备作业1（PPT设计文档）

### PPT制作
- [ ] 打开 `赛场瞬间-项目设计方案.md`
- [ ] 创建PowerPoint文件
- [ ] 制作15页内容：

#### Slide 1: 标题页
- [ ] 项目名称：赛场瞬间
- [ ] 副标题：云原生战术分析平台
- [ ] 你的名字
- [ ] 你的学号

#### Slide 2-3: 问题定义
- [ ] 传统痛点描述
- [ ] 云原生解决方案
- [ ] 可扩展性问题分析

#### Slide 4: 解决方案架构
- [ ] 绘制架构图（使用draw.io或PowerPoint）
- [ ] 标注各个Azure服务
- [ ] 标注数据流向

#### Slide 5-6: 数据库设计
- [ ] Cosmos DB集合结构
- [ ] JSON数据示例
- [ ] ERD图或表格

#### Slide 7: REST API设计
- [ ] UML序列图
- [ ] API列表表格
- [ ] CRUD操作说明

#### Slide 8-9: 线框图
- [ ] 比赛列表页线框图
- [ ] 比赛详情页线框图

#### Slide 10: 高级功能
- [ ] Application Insights
- [ ] 战术标注系统
- [ ] 协作功能

#### Slide 11: 可扩展性评估
- [ ] 水平扩展说明
- [ ] 垂直扩展说明
- [ ] 成本优化策略

#### Slide 12: 局限性评估
- [ ] 列出3-5个局限性
- [ ] 每个局限性的解决方案

#### Slide 13: 商业价值与伦理
- [ ] 目标用户
- [ ] 商业模式
- [ ] 隐私保护措施

#### Slide 14: 总结
- [ ] 项目优势
- [ ] 改进方向
- [ ] 学习收获

#### Slide 15: 参考文献
- [ ] Azure文档链接
- [ ] 其他参考资料

### PPT检查
- [ ] 每页内容完整
- [ ] 图表清晰
- [ ] 文字简洁
- [ ] 无拼写错误
- [ ] 总页数不超过15页

**第4天完成时间估计：2-3小时**

---

## 📅 第5天：准备作业2（演示视频）

### 录制准备
- [ ] 准备录屏软件：
  - [ ] Panopto Capture（推荐） 或
  - [ ] OBS Studio 或
  - [ ] Windows Xbox Game Bar (Win+G)
- [ ] 准备演示数据：
  - [ ] 至少2个测试比赛
  - [ ] 至少1个战术标注
  - [ ] 至少2个评论
- [ ] 关闭不相关的窗口和通知
- [ ] 准备演讲稿（参考 `快速启动指南.md`）

### 录制视频（5分钟内）

#### 0:00-0:30 开场介绍
- [ ] 自我介绍
- [ ] 项目名称和目的
- [ ] 技术栈说明

#### 0:30-2:00 功能演示
- [ ] 打开网站
- [ ] 展示比赛列表
- [ ] 上传新比赛
- [ ] 查看比赛详情
- [ ] 播放视频
- [ ] 添加战术标注
- [ ] 添加评论

#### 2:00-4:00 Azure资源展示
- [ ] 打开Azure门户
- [ ] 展示资源组
- [ ] 展示Storage Account和视频文件
- [ ] 展示Cosmos DB和数据记录
- [ ] 展示Logic Apps工作流设计
- [ ] 展示运行历史记录
- [ ] 展示Application Insights（如果有）

#### 4:00-4:50 高级功能说明
- [ ] 说明战术标注系统
- [ ] 说明协作功能
- [ ] 说明监控功能

#### 4:50-5:00 总结
- [ ] 总结使用的技术
- [ ] 感谢观看

### 视频检查
- [ ] 时长在5分钟内
- [ ] 音频清晰
- [ ] 画面清晰
- [ ] 功能演示流畅
- [ ] Azure资源展示完整
- [ ] 无敏感信息暴露（密钥等）

### 上传提交
- [ ] 上传到Panopto
- [ ] 获取视频链接
- [ ] 准备提交

**第5天完成时间估计：2小时**

---

## 📅 最终检查（提交前）

### 作业1检查
- [ ] PPT文件命名正确
- [ ] 15页内容完整
- [ ] 包含附录III检查清单
- [ ] 文件格式：.pptx
- [ ] 文件大小合理（<50MB）

### 作业2检查
- [ ] 视频时长5分钟内
- [ ] 视频格式正确
- [ ] 上传到正确平台
- [ ] 视频链接有效

### 提交检查
- [ ] 作业1提交到Blackboard
- [ ] 作业2提交到Panopto
- [ ] 提交截止日期前完成
- [ ] 收到提交确认

---

## 🎉 全部完成！

恭喜你完成了整个云原生项目！

### 学到的技能
- ✅ Azure资源部署
- ✅ Logic Apps设计
- ✅ Cosmos DB使用
- ✅ Blob Storage使用
- ✅ REST API设计
- ✅ 云原生架构
- ✅ 前端开发
- ✅ 项目文档编写
- ✅ 技术演示

### 可以添加到简历的项目
**项目名称**：赛场瞬间 - 云原生战术分析平台

**技术栈**：
- Azure Logic Apps
- Azure Blob Storage
- Azure Cosmos DB
- HTML/CSS/JavaScript
- RESTful API

**项目描述**：
设计并实现了一个云原生的体育赛事分析平台，支持视频上传、在线播放、战术标注和团队协作。采用Azure Logic Apps实现无服务器REST API，使用Cosmos DB存储元数据，Blob Storage存储视频文件，实现了完整的CRUD操作和可扩展架构。

---

## 📞 遇到问题？

如果某个步骤卡住了：

1. **查看文档**：
   - 快速启动指南.md
   - logic-apps-guide.md
   - README.md

2. **查看Azure日志**：
   - Logic App运行历史
   - Storage Account日志
   - Cosmos DB数据资源管理器

3. **查看浏览器控制台**：
   - F12 → Console
   - 查看错误信息

4. **联系帮助**：
   - 课程助教
   - 同学讨论

---

**打印这个清单，边做边勾选，保持进度！** ✓✓✓

祝你顺利完成作业！🚀🎓

