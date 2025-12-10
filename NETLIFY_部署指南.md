# Netlify 部署指南

## 问题说明

您的应用最初是为 Vercel 平台设计的，但您在 Netlify 上部署。这两个平台使用不同的 serverless 函数结构：

- **Vercel**: 使用 `/api` 文件夹
- **Netlify**: 使用 `/netlify/functions` 文件夹

这就是为什么 GEMINI API 无法连接的原因。

## 解决方案

我已经为您创建了以下文件来支持 Netlify 部署：

1. **netlify.toml** - Netlify 配置文件
2. **netlify/functions/gemini.js** - Netlify serverless 函数
3. **NETLIFY_DEPLOYMENT.md** - 英文部署说明

## 部署步骤

### 1. 设置环境变量

在 Netlify 后台设置 GEMINI API 密钥：

1. 登录 [Netlify](https://app.netlify.com/)
2. 选择您的网站
3. 进入 "Site configuration" → "Environment variables"
4. 点击 "Add a variable"
5. 添加以下变量：
   - **Key (键)**: `GEMINI_API_KEY`
   - **Value (值)**: 您的 Gemini API 密钥（从 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取）

### 2. 重新部署

有两种方式重新部署：

**方法 A: 自动部署**
- 如果您的 Netlify 网站连接了 GitHub 仓库，推送这些更改后会自动部署

**方法 B: 手动触发**
- 在 Netlify 后台，点击 "Deploys" → "Trigger deploy" → "Deploy site"

### 3. 验证部署

部署完成后：
1. 打开您的网站
2. 尝试使用 IELTS 练习功能
3. 如果能生成示例答案，说明 API 已成功连接

## 工作原理

```
用户请求: https://your-site.netlify.app/api/gemini
    ↓
netlify.toml 重定向规则
    ↓
Netlify Functions: /.netlify/functions/gemini
    ↓
调用 GEMINI API (使用服务器端环境变量)
    ↓
返回结果给用户
```

这样可以确保您的 API 密钥安全地保存在服务器端，不会暴露给客户端。

## 本地测试（可选）

如果您想在本地测试 Netlify 函数：

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 创建 .env 文件并添加 API 密钥
echo "GEMINI_API_KEY=你的密钥" > .env

# 运行本地开发服务器
netlify dev
```

## 常见问题

### Q: 如何获取 Gemini API 密钥？
A: 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)，登录后点击 "Create API Key" 创建密钥。

### Q: 环境变量设置后还是不工作？
A: 确保：
1. 变量名是 `GEMINI_API_KEY`（注意大小写）
2. 设置完环境变量后重新部署了网站
3. API 密钥有效且有足够的配额

### Q: 如何查看错误日志？
A: 在 Netlify 后台，进入 "Functions" → 点击 "gemini" 函数 → 查看 "Function log"

## 需要帮助？

如果遇到问题，请检查：
1. Netlify 函数日志
2. 浏览器控制台的错误信息
3. 确认 GEMINI_API_KEY 已正确设置
