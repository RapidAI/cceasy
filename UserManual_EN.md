# Claude Code Easy Suite User Manual

[❓ FAQ](faq_en.md)

Welcome to **Claude Code Easy Suite**! This tool is designed to simplify the configuration, multi-project management, and startup process for the Anthropic `claude-code` command-line tool.

Here is a detailed operation guide:

## 1. Startup and Environment Check
When you run the program for the first time, it will automatically check your system environment:
*   **Node.js**: If not installed, the program will attempt to install it via Winget.
*   **Claude Code**: The program will automatically install or update `@anthropic-ai/claude-code` to the latest version.
*   **Note**: If an automatic installation occurs, the program may restart automatically to apply changes.

## 2. Model Settings
Before use, you need to configure an API Key for at least one model.

1.  Click the **"⚙️ Model Settings"** button to the right of the **"Model Selection"** header.
2.  Select your desired provider in the popup: **GLM**, **Kimi**, **Doubao**, **MiniMax**, or **Custom**.
3.  **API Key**: Paste your API Key. A **blue underline** under the model button indicates a successful configuration.
4.  **Save**: Click **"Save & Close"** to apply changes.

> **Tip**: Settings will open automatically if no keys are found on startup. Models without an API key cannot be activated.

## 3. Multi-Project Management
You can manage multiple coding projects with independent directory paths and mode settings.

### 3.1 Switching Projects
*   View project tabs in the **"Vibe Coding"** area.
*   Click a project name to switch instantly.
*   If you have more than 5 projects, use the **"◀"** or **"▶"** arrows to scroll.

### 3.2 Project Management Modal
Click the **"📂 Manage Projects"** button next to the **"Vibe Coding"** header:
*   **Add Project**: Click "+ Add New Project". New projects default to your User Home directory.
*   **Rename**: Edit names directly. The system ensures each project name is unique.
*   **Delete**: Click the "Delete" button next to a project.
*   **Save**: Click **"Save & Close"** to commit all modifications.

## 4. Setting Project Parameters
After selecting a project tab, configure its specific settings:
1.  **Project Directory**: Displays the folder path for the current project. Click **"Change"** to pick a new one.
2.  **Yolo Mode**:
    *   Check the **"Yolo Mode"** box.
    *   This mode skips all permission prompts. **Use with caution and only if you trust the model's output.**

## 5. Launch Claude Code
1.  Ensure you have selected a valid **Model** (with blue underline) and **Project** (with valid path).
2.  Click the **"Launch Claude Code"** button.
3.  If the project directory is not set, a red error will appear in the status bar, and launch will be blocked.
4.  A new terminal window will open with the Claude Code interactive interface.

## 6. Other Features
*   **Status Bar**: The bottom area shows real-time feedback (e.g., "Saved successfully"). Errors are highlighted in red.
*   **Language Switch**: Change languages in the title bar (supports English, Chinese, Japanese, Korean, German, and French).
*   **System Tray**: Right-click the tray icon for quick access to model switching, launching, or hiding the window.