# FAQ - 常见问题解答

## 1. 为什么系统托盘图标点击无反应？
在较早版本中，如果后台操作（如文件读写）阻塞了主线程，可能会导致托盘图标暂时失去响应。当前版本已通过异步处理和线程锁定优化了此问题。如果仍遇到此类情况，请尝试重启程序。

## 2. 如何使用自定义模型 (Custom Model)？
1. 点击“模型设置”。
2. 选择“Custom”标签。
3. 输入您的模型名称（例如 `claude-3-5-sonnet-20241022`）。
4. 输入兼容 Anthropic 协议的 API 端点地址（Endpoint）。
5. 输入 API Key 并保存。

## 3. 我的 API Key 无法工作？
程序中预设的 GLM、Kimi、豆包、MiniMax 快捷选择**仅支持各厂商提供的 "Coding Plan" 专用 API Key**。
如果您使用的是通用型 API Key，请使用 **“Custom”** 模式进行配置，并手动输入对应的模型名称和 API 端点地址。

## 4. 配置文件保存在哪里？
程序配置文件保存在您的用户主目录下，文件名为 `.claude_model_config.json`。
Claude Code 的原生设置保存在 `~/.claude/settings.json`。

## 5. 如何更新 Claude Code？
每次启动程序时，工具会自动检查 `@anthropic-ai/claude-code` 的版本。如果有新版本，它会自动为您运行 `npm install -g @anthropic-ai/claude-code`。您也可以在安装进度日志中查看具体的执行命令。

## 6. 环境检查失败怎么办？
如果 Node.js 安装失败，请检查您的网络连接。在中国大陆地区，程序会自动尝试使用清华大学镜像源以加快下载速度。如果自动安装持续失败，建议手动从 [nodejs.org](https://nodejs.org/) 下载并安装 v22.14.0 或更高版本。

## 7. 为什么需要重启程序才能生效？
通常情况下，环境变更（如安装 Node.js）后，程序会自动尝试刷新当前进程的环境变量。但在某些极端情况下，Windows 系统的环境变更可能需要重启应用才能彻底识别。

---
*更多问题请访问 GitHub Issues：[RapidAI/cceasy/issues](https://github.com/RapidAI/cceasy/issues)*
