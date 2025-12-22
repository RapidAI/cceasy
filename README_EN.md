# Claude Code Easy Suite

[📖 User Manual](UserManual_EN.md) | [English](README_EN.md) | [中文](README.md)

Claude Code Easy Suite is a desktop GUI tool built with Wails, Go, and React. It is designed to provide convenient configuration management, model switching, and one-click launch capabilities for Anthropic's command-line tool, `claude-code`.

This application is specifically integrated with popular programming models (GLM, Kimi, Doubao), supporting rapid API Key configuration and automatic synchronization.

## Core Features

*   **🚀 Automatic Environment Preparation**: Automatically detects Node.js environment and Claude Code installation status upon startup, supporting automatic installation and version updates.
*   **🖼️ Modern & Clean UI**: Features a light blue themed design with a frameless window, supporting top dragging and quick hiding in the upper right corner.
*   **📂 Project Directory Management**: Supports customizing and remembering the working directory for Claude Code, automatically entering the specified folder upon launch.
*   **🔄 One-Click Model Switching**:
    *   Integrated with **GLM**, **Kimi**, and **Doubao** models.
    *   Supports independent storage of API Keys for each model.
    *   **Instant Sync**: Automatically updates `~/.claude/settings.json`, `~/.claude.json`, and system environment variables (`ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`) when switching models.
*   **🌍 Multi-language Support**: Interface supports English, Simplified Chinese, Traditional Chinese, Korean, Japanese, German, and French, with automatic switching based on OS language.
*   **🖱️ System Tray Support**:
    *   Double-click the tray icon to show the main window.
    *   Right-click menu for quick model switching, one-click Claude Code launch, and quitting the application.
*   **⚡ One-Click Launch**:
    *   Main interface provides a large "Launch Claude Code" button.
    *   Supports **Yolo Mode** (adds `--dangerously-skip-permissions` parameter).
    *   Automatic Authentication: Automatically approves custom API Keys by modifying `.claude.json`, skipping interactive prompts.
*   **🔒 Single Instance Lock**: Prevents multiple instances from running; launching again will wake up and bring the existing instance to the top.

## Quick Start

### 1. Run the Program
Run `Claude Code Easy Suite.exe` directly.

### 2. Environment Detection
On the first launch, the program performs an environment self-check. If Node.js is not installed, the program will attempt to install it via Winget (please ensure network connectivity). It will then automatically install/update to the latest version of `@anthropic-ai/claude-code`.

### 3. Configure API Key
In the "Model Settings" tab of the main interface, enter your API Key for GLM, Kimi, or Doubao.
*   If you don't have a Key yet, click the **"Get Key"** button next to the input field to jump to the respective provider's application page.

### 4. Switch and Launch
*   Select your desired model in the "Active Model" area at the top. System environments and Claude configuration files will sync immediately.
*   (Optional) Click **"Change"** in the "Launch" area to modify your project working directory.
*   Click **"Launch Claude Code"**; a CMD window with a pre-configured environment will pop up and run Claude automatically.

## About

*   **Version**: V1.0.001 Beta
*   **Author**: Dr. Daniel
*   **GitHub**: [RapidAI/cceasy](https://github.com/RapidAI/cceasy)
*   **Resources**: [CS146s Chinese Version](https://github.com/BIT-ENGD/cs146s_cn)

---
*This tool is intended as a configuration management aid. Please ensure you comply with the service terms of each model provider.*
