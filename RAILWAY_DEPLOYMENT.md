# Railway 部署指南

你的 Knowledge Base Agent V14 已准备好部署到 Railway！

## ✅ 已完成的步骤

- [x] 项目结构已创建
- [x] 配置文件已配置（package.json, vite.config.js, tailwind.config.js 等）
- [x] 代码已提交到 Git
- [x] 代码已推送到 GitHub：https://github.com/tommyhuang77/kb-agent

## 📝 接下来需要做的（在 Railway 上）

### 步骤 1：访问 Railway
1. 打开 https://railway.app
2. 使用你的账户登入（如果没有账户，先注册一个免费账户）

### 步骤 2：创建新项目
1. 点击 "New Project" 或 "Create Project"
2. 在弹出的菜单中，选择 "Deploy from GitHub repo"

### 步骤 3：连接 GitHub 账户
1. 如果是第一次，Railway 会要求你授予 GitHub 访问权限
2. 点击 "Connect GitHub Account"
3. 授予权限后，选择 `kb-agent` 仓库

### 步骤 4：开始部署
1. 选择 `kb-agent` 仓库
2. 点击 "Deploy Now"
3. Railway 会自动：
   - 检测这是一个 Vite 项目
   - 安装依赖（npm install）
   - 构建项目（npm run build）
   - 部署到 Railway

### 步骤 5：获取公开网址
1. 部署完成后，点击你的项目卡片
2. 进入 "Settings" 页面
3. 找到 "Networking" 部分
4. 点击 "Generate Domain"
5. 你会获得一个形如 `xxx.up.railway.app` 的 URL

### 步骤 6：访问你的应用
在浏览器中打开生成的 URL，你就能看到你的智能知识库 Agent 在线运行！

## 📊 项目信息

- **应用名称**：Knowledge Base Agent V14
- **框架**：React 18.2 + Vite 4.4
- **样式**：Tailwind CSS 3.3
- **部署类型**：静态前端应用
- **Node 版本**：18.x

## 🔗 重要链接

- GitHub 仓库：https://github.com/tommyhuang77/kb-agent
- Railway：https://railway.app

## 💡 提示

- 首次部署可能需要 5-10 分钟
- 如果部署失败，检查 Railway 的 "Build Logs" 查看错误信息
- 最常见的问题是 package.json 或项目结构不正确（但我们已经正确配置）
- 部署后，每次 push 到 main 分支都会自动重新部署

## ❓ 常见问题

**Q: 部署需要多长时间？**
A: 通常需要 5-10 分钟，首次构建可能稍长

**Q: 可以自定义域名吗？**
A: 是的，Railway 支持自定义域名（付费功能）

**Q: 我的数据会被保存吗？**
A: 当前应用是纯前端，数据存储在浏览器内存中。刷新页面后数据会重置。如需持久化，需要对接后端数据库。

**Q: 如何更新部署？**
A: 只需 push 新代码到 GitHub 的 main 分支，Railway 会自动重新部署

祝部署顺利！🚀
