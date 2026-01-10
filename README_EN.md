# AICoder

[📖 User Manual](UserManual_EN.md) | [❓ FAQ](faq_en.md) | [English](README_EN.md) | [中文](README.md)

AICoder is a desktop AI programming assistant dashboard built with Wails, Go, and React. It is designed to provide unified configuration management, automated environment deployment, and one-click launch capabilities for multiple AI CLI tools (Anthropic Claude Code, OpenAI Codex, Google Gemini CLI, OpenCode, CodeBuddy, and Qoder CLI).

This application is deeply integrated with popular AI programming models, supporting rapid API Key configuration and automatic synchronization.


<img width="806" height="486" alt="image" src="https://github.com/user-attachments/assets/c5f1d640-3bed-49af-bd2c-532d1f039a1a" />

## Core Features

*   **🚀 Automatic Environment Preparation**: Automatically detects and prepares the required AI CLI environments (Claude Code, Codex, Gemini, OpenCode, CodeBuddy, Qoder CLI) upon startup, supporting automatic installation and version updates.
*   **🖼️ Unified Sidebar UI**: Features a modern vertical sidebar navigation for quick switching between different AI programming tools.
*   **📂 Multi-Project Management (Vibe Coding)**：
    *   **Tabbed Interface**: Manage multiple projects simultaneously and switch contexts quickly using tabs.
    *   **Independent Configuration**: Each project can have its own working directory and launch parameters (e.g., Yolo Mode).
    *   **Python Environment Support**: Deeply integrated with Conda/Anaconda, allowing independent Python environments for different projects.
    *   **Admin Launch**: Supports launching tools with admin privileges on Windows to resolve permission issues.
*   **🔄 Multi-Model & Cross-Platform Support**:
    *   Integrated with **Claude Code**, **OpenAI Codex**, **Google Gemini CLI**, **OpenCode**, **CodeBuddy**, and **Qoder CLI**.
    *   **"Original" Provider Mode**: One-click switch back to official configurations. Automatically clears custom proxy settings to ensure a pure official tool experience.
    *   **Deep Provider Integration**: Pre-configured support for mainstream providers including GLM, Kimi, Doubao, MiniMax, AIgoCode, and AiCodeMirror.
    *   **Smart Sync**: API Keys for the same provider are automatically synchronized across different tools.
    *   **Custom Mode**: Connect to any compatible API endpoint.
*   **📢 Real-time Announcements (BBS)**: Built-in message center to stay updated with the latest tool news and community announcements.
*   **🛠️ One-Click Repair**: Provides configuration reset and repair functionality for tools like Claude Code to resolve environment conflicts.
*   **🌍 Multi-language Support**: Interface supports English, Simplified Chinese, and Traditional Chinese.
*   **🖱️ System Tray Support**: Quick model switching, one-click launch, and quitting the application.
*   **⚡ One-Click Launch**: Large buttons to launch the respective CLI tool with pre-configured environments and authentication.

## Quick Start

### 1. Run the Program
Run `AICoder.exe` (Windows) or `AICoder.app` (macOS) directly.

### 2. Environment Detection
On the first launch, the program performs an environment self-check. If required runtimes (e.g., Node.js) are missing, AICoder will attempt to install them automatically.

### 3. Configure API Key
Select a provider and enter your API Key in the configuration panel for each tool.
*   **Sync Feature**: When you set a Key for a provider in Claude, it will automatically sync to the same provider in Gemini and Codex.
*   If you don't have a Key yet, click the **"Get Key"** button next to the input field to jump to the respective provider's application page.

### 4. Switch and Launch
*   Select your desired AI tool (Claude, Codex, or Gemini) in the left sidebar.
*   **Select Project**: Click a project tab in the "Vibe Coding" area to switch projects.
*   Click **"Launch"**; a terminal window with a pre-configured environment will pop up and run the tool automatically.

## About

*   **Version**: V2.6.2.2200
*   **Author**: Dr. Daniel
*   **GitHub**: [RapidAI/aicoder](https://github.com/RapidAI/aicoder)
*   **Resources**: [CS146s Chinese Version](https://github.com/BIT-ENGD/cs146s_cn)

---
*This tool is intended as a configuration management aid. Please ensure you comply with the service terms of each model provider.*
