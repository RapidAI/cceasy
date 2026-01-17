# AICoder

[📖 使用说明书](UserManual_CN.md) | [❓ FAQ](faq.md) | [English](README_EN.md) | [中文](README.md)

AICoder 是一款基于 Wails + Go + React 开发的桌面 AI 编程辅助工具仪表盘。它旨在为多种 AI 命令行工具（Anthropic Claude Code, OpenAI Codex, Google Gemini CLI, OpenCode, CodeBuddy, Qoder CLI）提供统一的配置管理、环境自动部署以及一键启动功能。

本程序特别针对主流 AI 编程模型进行了深度集成，支持 API Key 的快速配置与自动同步。

<img width="600" height="390" alt="7d567ca7e9df22ab11c955e213fd40cb" src="https://github.com/user-attachments/assets/f644e856-7e8b-45da-a51d-5ebbd0a1d15f" />



## 核心功能

*   **🚀 环境自动准备**：启动时自动检测并准备所需的 AI CLI 环境（Claude Code, Codex, Gemini, OpenCode, CodeBuddy, Qoder CLI），支持自动安装与版本更新。
*   **🖼️ 统一侧边栏 UI**：采用现代化的垂直侧边栏导航，支持在不同的 AI 编程工具间快速切换。
*   **📂 多项目管理 (Vibe Coding)**：
    *   **多标签页切换**：支持同时管理多个项目，通过顶部标签页快速切换工作上下文。
    *   **独立配置**：每个项目可独立设置工作目录和启动参数（如 Yolo 模式）。
    *   **Python 环境支持**：深度集成 Conda/Anaconda，支持为不同项目选择独立的 Python 运行环境。
    *   **管理员权限启动**：支持在 Windows 下以管理员权限启动工具，解决部分项目权限不足的问题。
*   **🔄 多模型 & 跨平台支持**：
    *   集成 **Claude Code**, **OpenAI Codex**, **Google Gemini CLI**, **OpenCode**, **CodeBuddy**, **Qoder CLI** 等主流工具。
    *   **"原厂" (Original) 模式**：支持一键切换回官方原始配置，自动清除自定义代理设置，确保官方工具的纯净运行。
    *   **深度集成服务商**：预设 GLM, Kimi, Doubao, MiniMax, AIgoCode, AiCodeMirror 等多个主流服务商。
    *   **智能同步**：同一服务商的 API Key 可在不同工具间自动同步，无需重复输入。
    *   **Custom (自定义)** 模式：可接入任意兼容协议的 API 端点。
*   **📢 实时公告 (BBS)**：内置消息中心，实时获取最新工具动态与社区公告。
*   **🛠️ 一键修复**：针对 Claude Code 等工具提供配置一键重置与修复功能，解决环境冲突。
*   **🌍 多语言支持**：界面支持英文、简体中文及繁体中文。
*   **🖱️ 系统托盘支持**：快速切换模型、一键启动及退出程序。
*   **⚡ 一键启动**：主界面提供大按钮一键启动对应的 CLI 工具，自动处理认证与环境配置。

## 快速开始

### 1. 运行程序
直接运行 `AICoder.exe` (Windows) 或 `AICoder.app` (macOS)。

### 2. 环境检测
程序首次启动会进行环境自检。如果您的电脑未安装所需的运行环境（如 Node.js），程序会尝试自动安装/更新相关组件。

### 3. 配置 API Key
在各工具的配置面板中选择服务商并输入您的 API Key。
*   **同步特性**：当您在 Claude 中设置了某服务商的 Key，Gemini 和 Codex 中相同的服务商会自动同步该 Key。
*   如果您还没有 Key，可以点击输入框旁的 **"Get Key"** 按钮跳转到对应厂商的申请页面。

### 4. 切换与启动
*   在左侧侧边栏选择您想要使用的 AI 工具（Claude, Codex 或 Gemini）。
*   **选择项目**：在 "Vibe Coding" 区域点击项目标签切换项目。
*   点击 **"Launch"**，程序会弹出一个预配置好环境的终端窗口并自动运行。

## 关于

*   **版本**：V2.6.2.2200
*   **作者**：Dr. Daniel
*   **GitHub**：[RapidAI/aicoder](https://github.com/RapidAI/aicoder)
*   **资源**：[CS146s 中文版](https://github.com/BIT-ENGD/cs146s_cn)

---
*本工具仅作为配置管理辅助，请确保遵守各模型厂商的服务条款。*


 kilo cli : 

 https://github.com/Kilo-Org/kilocode/blob/main/cli/docs/PROVIDER_CONFIGURATION.md