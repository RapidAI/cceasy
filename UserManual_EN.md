# AICoder User Manual

[❓ FAQ](faq_en.md)

Welcome to **AICoder**! This tool is designed to simplify the configuration, multi-project management, and startup process for various AI programming CLI tools (Claude Code, Codex, and Gemini CLI).

Here is a detailed operation guide:

## 1. Startup and Environment Check
When you run AICoder for the first time, it will automatically check your system environment:
*   **Dependency Check**: Detects Node.js and other required runtimes.
*   **Tool Installation**: The program automatically detects and attempts to install or update `claude-code`, `codex`, `gemini-cli`, `opencode`, `codebuddy`, and `qodercli` to their latest versions.
*   **Startup Window**: A progress window will be displayed on startup to show the environment preparation status.

## 2. Sidebar Navigation
AICoder features a vertical sidebar design, allowing you to easily switch between different AI tools:
*   **Claude**: Configure and launch Anthropic Claude Code.
*   **Codex**: Configure and launch OpenAI Codex related CLI tools.
*   **Gemini**: Configure and launch Google Gemini related CLI tools.
*   **OpenCode**: Configure and launch OpenCode AI assistance tools.
*   **CodeBuddy**: Configure and launch CodeBuddy programming assistant.
*   **Qoder**: Configure and launch Qoder CLI programming assistant.

## 3. Model Settings
Within each tool's panel, you need to configure the corresponding API Key.

1.  Select the desired AI tool from the sidebar.
2.  Locate the **"Model Settings"** area in the main interface.
3.  **Provider Selection**: Supports preset providers including GLM, Kimi, Doubao, MiniMax, DeepSeek, AIgoCode, and AiCodeMirror.
4.  **"Original" Mode**:
    *   Select this mode if you wish to use the tool's official default configuration and authentication method.
    *   **Automatic Cleanup**: When launching a tool in this mode, AICoder automatically clears any custom proxy settings, environment variables, and the official tool's configuration files (e.g., the `~/.claude` directory for Claude) to ensure a pure environment.
5.  **API Key**: Paste your API Key into the input field. Once configured, it will be saved and used for future launches.
6.  **Smart Sync**: If you configure a Key for a provider in Claude, it will automatically sync to the same provider in other tools (e.g., Gemini, Codex), eliminating the need for duplicate entry.

## 4. Multi-Project Management
You can manage multiple coding projects with independent directory paths and settings.

### 4.1 Switching Projects
*   View project tabs in the **"Vibe Coding"** area.
*   Click a project name to switch instantly.

### 4.2 Project Management
Click the **"Manage Projects"** button in the project area:
*   **Add Project**: Create a new project and set its independent path.
*   **Rename/Delete**: Manage your existing list of projects.

## 5. Setting Project Parameters
After selecting a project, configure its specific settings:
1.  **Project Directory**: Click **"Change"** to pick the folder where your code resides.
2.  **Launch Parameters**: For example, **Yolo Mode** for Claude, which skips permission prompts when checked.

## 6. Launching AI Tools
1.  Ensure you have selected a valid **Model** and **Project**.
2.  Click the **"Launch"** button.
3.  A terminal window (CMD/Terminal) will open with the tool's interactive interface.

## 7. Other Features
*   **Status Bar**: Shows real-time feedback and error messages at the bottom of the interface.
*   **Language Switch**: Change the interface language in the title bar or settings.
*   **Check Update**: Get the latest version of AICoder.
*   **System Tray**: Right-click the tray icon for quick access to tool launching and configuration switching.
