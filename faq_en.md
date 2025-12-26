# FAQ - Frequently Asked Questions

## 1. Why is the system tray icon unresponsive?
In earlier versions, if background operations (such as file I/O) blocked the main thread, the tray icon might temporarily become unresponsive. The current version has optimized this issue through asynchronous processing and OS thread locking. If you still encounter this, please try restarting the program.

## 2. How to use a Custom Model?
1. Click "Model Settings".
2. Select the "Custom" tab.
3. Enter your model name (e.g., `claude-3-5-sonnet-20241022`).
4. Enter an API Endpoint compatible with the Anthropic protocol.
5. Enter your API Key and save.

## 3. My API Key is not working?
The preset shortcuts for GLM, Kimi, Doubao, and MiniMax in the application **only support the "Coding Plan" specific API Keys** provided by each vendor.
If you are using a general-purpose API Key, please use the **"Custom"** mode and manually enter the corresponding model name and API endpoint.

## 4. Where is the configuration file saved?
The application configuration is saved in your user home directory with the filename `.claude_model_config.json`.
Claude Code's native settings are saved in `~/.claude/settings.json`.

## 5. How to update Claude Code?
Each time the program starts, it automatically checks the version of `@anthropic-ai/claude-code`. If a new version is available, it will automatically run `npm install -g @anthropic-ai/claude-code` for you. You can see the specific execution commands in the installation progress logs.

## 6. What if the environment check fails?
If Node.js installation fails, please check your internet connection. In mainland China, the program automatically attempts to use the Tsinghua University mirror to speed up downloads. If automatic installation continues to fail, it is recommended to manually download and install v22.14.0 or higher from [nodejs.org](https://nodejs.org/).

## 7. Why do I need to restart the app for changes to take effect?
Normally, after environment changes (like installing Node.js), the program automatically tries to refresh the environment variables for the current process. However, in some extreme cases, Windows system environment changes may require an application restart to be fully recognized.

---
*For more issues, please visit GitHub Issues: [RapidAI/cceasy/issues](https://github.com/RapidAI/cceasy/issues)*
