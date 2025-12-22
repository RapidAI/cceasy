# Claude Code Easy Suite User Manual

Welcome to **Claude Code Easy Suite**! This tool is designed to simplify the configuration, model switching, and startup process for Anthropic's `claude-code` command-line tool.

Here is a detailed operation guide:

## 1. Startup and Environment Check
When you run the program for the first time, it will automatically check your system environment:
*   **Node.js**: If not installed, the program will attempt to install it via Winget.
*   **Claude Code**: The program will automatically install or update `@anthropic-ai/claude-code` to the latest version.
*   **Note**: If an automatic installation occurs, the program may restart automatically to apply changes.

## 2. Configure Model Parameters (Model Settings)
Before use, you need to configure an API Key for at least one model provider.

1.  Navigate to the **"Model Settings"** area at the bottom of the main interface.
2.  Click the tabs to select your desired model provider:
    *   **GLM** (Zhipu AI)
    *   **Kimi** (Moonshot AI)
    *   **Doubao** (ByteDance)
    *   **Custom** (Other compatible models)

### 2.1 Get and Fill API Key
*   **Fill Key**: Paste your API Key into the **"API Key"** input box.
*   **Don't have a Key?**: Click the **"Get Key"** button to the right of the input box. The program will open the provider's official console page where you can register and apply for an API Key.

### 2.2 Custom Model Configuration
If you use a model other than the three listed above (or via a proxy service), select the **"Custom"** tab:
*   **Model Name**: Enter the target model ID, e.g., `claude-3-5-sonnet-20241022` or `gpt-4o`.
*   **API Key**: Enter your key.
*   **API Endpoint**: Enter the interface URL, e.g., `https://api.example.com/v1`.

> **Tip**: All changes are temporarily cached. Click the **"Save Changes"** button at the bottom right to persist your settings.

## 3. Activate a Model (Active Model)
After configuration, you need to tell the program which model to use.

1.  In the **"Active Model"** area at the top.
2.  Click the button for the model you just configured (e.g., GLM, Kimi...).
3.  The button will highlight, indicating activation. System environment variables are now synced.

## 4. Set Project Directory
Specify the workspace where Claude Code will run (your codebase folder).

1.  In the **"Launch"** area, find the **"Project Directory"** field.
2.  The default path is your User Home directory.
3.  Click the **"Change"** button.
4.  Select your project folder in the dialog box.

## 5. Launch Claude Code
Ready to code!

1.  **Yolo Mode (Optional)**:
    *   Check the **"Yolo Mode"** box.
    *   This adds the `--dangerously-skip-permissions` parameter. Claude will no longer ask for permission for each file read/write or command execution. **Use with caution and only if you trust the model's output.**
2.  Click the **"Launch Claude Code"** button at the bottom.
3.  A new command-line window will pop up and automatically enter the Claude Code interactive interface.

## 6. Other Features
*   **Language Switch**: Click the language selector in the title bar (e.g., "English") to cycle through English, Chinese (Simplified/Traditional), Japanese, Korean, German, and French.
*   **System Tray**: The program stays in the tray when running. Right-click the tray icon to:
    *   Quickly switch models.
    *   One-click launch Claude Code.
    *   Show/Hide the main window.
