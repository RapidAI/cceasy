# FAQ - Frequently Asked Questions

## 1. Why is the system tray icon unresponsive?
In earlier versions, if background operations (such as file I/O) blocked the main thread, the tray icon might temporarily become unresponsive. The current version has optimized this issue through asynchronous processing and OS thread locking. If you still encounter this, please try restarting the program.

## 2. How to use a Custom Model?
1. Select the AI tool (e.g., Claude) in the sidebar.
2. Click "Model Settings".
3. Select the "Custom" tab.
4. Enter your model name (e.g., `claude-3-5-sonnet-20241022`).
5. Enter an API Endpoint compatible with the protocol.
6. Enter your API Key and save.

## 3. My API Key is not working?
The preset shortcuts in AICoder **may only support specific "Coding Plan" API Keys** provided by each vendor.
If you are using a general-purpose API Key, please use the **"Custom"** mode and manually enter the corresponding model name and API endpoint.

## 4. Where is the configuration file saved?
AICoder's configuration is saved in your user home directory with the filename `.aicoder_config.json`.
Native settings for various AI tools (like Claude's `~/.claude/settings.json`) are also automatically synced based on your configuration.

## 5. How to update AI CLI tools?
Each time AICoder starts, it automatically checks the versions of supported tools (like `claude-code`, `codex`, `gemini-cli`). If a new version is available, it will attempt to update it for you. You can see the specific status in the startup progress window.

## 6. What if the environment check fails?
If Node.js or tool installation fails, please check your internet connection. In mainland China, the program automatically attempts to use domestic mirrors to speed up downloads. If automatic installation continues to fail, it is recommended to manually install the environment as prompted.

## 8. What is "Recover CC" and when should I use it?
The "Recover CC" feature is primarily for the Claude Code environment, designed to reset its execution environment to factory defaults.
*   **Use Case**: Use this if you have manually modified Claude's official configuration, cannot log in due to API Key conflicts, or encounter persistent environment errors.
*   **Impact**: It will permanently delete all local configurations and authentication tokens in the `~/.claude/` directory.
*   **Follow-up**: After recovery, manually open a new terminal (CMD or PowerShell), run `claude`, and follow the official prompts to complete the initial setup once.

---
*For more issues, please visit GitHub Issues: [RapidAI/cceasy/issues](https://github.com/RapidAI/cceasy/issues)*