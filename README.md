# Claude Code Easy Suite

[📖 使用说明书](UserManual_CN.md) | [English](README_EN.md) | [中文](README.md)

Claude Code Easy Suite 是一款基于 Wails + Go + React 开发的桌面 GUI 工具，旨在为 Anthropic 的命令行工具 `claude-code` 提供便捷的配置管理、模型切换以及一键启动功能。

本程序特别针对国内常用的编程模型（GLM, Kimi, 豆包）进行了深度集成，支持 API Key 的快速配置与自动同步。

## 核心功能

*   **🚀 环境自动准备**：启动时自动检测 Node.js 环境及 Claude Code 安装状态，支持自动安装与版本更新。
*   **🖼️ 现代清新 UI**：采用淡雅的蓝色系设计，无边框窗口，支持顶部拖动及右上角快速隐藏。
*   **📂 项目目录管理**：支持自定义并记忆 Claude Code 的工作目录，启动时自动进入指定文件夹。
*   **🔄 模型一键切换**：
    *   集成 **GLM (智谱)**、**Kimi (月之暗面)**、**豆包 (字节跳动)** 三大模型。
    *   支持独立保存每个模型的 API Key。
    *   **即时同步**：切换模型时，自动更新 `~/.claude/settings.json`、`~/.claude.json` 及系统环境变量 (`ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`)。
*   **🌍 多语言支持**：界面支持英文、简体中文、繁体中文、韩文、日文、德文及法文，支持根据操作系统语言自动切换。
*   **🖱️ 系统托盘支持**：
    *   支持双击托盘图标显示主窗口。
    *   右键菜单支持快速切换模型、一键启动 Claude Code 及退出程序。
*   **⚡ 一键启动**：
    *   主界面提供“启动 Claude Code”大按钮。
    *   支持 **Yolo 模式**（添加 `--dangerously-skip-permissions` 参数）。
    *   自动处理认证：通过修改 `.claude.json` 自动批准自定义 API Key，跳过交互式询问。
*   **🔒 单实例锁**：防止程序重复运行，再次启动时自动唤醒并置顶已有实例。

## 快速开始

### 1. 运行程序
直接运行 `Claude Code Easy Suite.exe`。

### 2. 环境检测
程序首次启动会进行环境自检。如果您的电脑未安装 Node.js，程序会尝试通过 Winget 进行安装（请确保网络畅通）。随后会自动安装/更新最新版的 `@anthropic-ai/claude-code`。

### 3. 配置 API Key
在主界面的 "Model Settings" 标签页中，为 GLM、Kimi 或 豆包输入您的 API Key。
*   如果您还没有 Key，可以点击输入框旁的 **"Get Key"** 按钮跳转到对应厂商的申请页面。

### 4. 切换与启动
*   在顶部的 "Active Model" 区域选择您想要使用的模型。选择后，系统环境和 Claude 配置文件会立即同步。
*   （可选）在 "Launch" 区域点击 **"Change"** 修改您的项目工作目录。
*   点击 **"Launch Claude Code"**，程序会弹出一个预配置好环境的 CMD 窗口并自动运行 Claude。

## 关于

*   **版本**：V1.0.001 Beta
*   **作者**：Dr. Daniel
*   **GitHub**：[RapidAI/cceasy](https://github.com/RapidAI/cceasy)
*   **资源**：[CS146s 中文版](https://github.com/BIT-ENGD/cs146s_cn)

---
*本工具仅作为配置管理辅助，请确保遵守各模型厂商的服务条款。*