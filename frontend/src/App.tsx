import {useEffect, useState, useRef} from 'react';
import './App.css';
import {buildNumber} from './version';
import appIcon from './assets/images/appicon.png';
import claudecodeIcon from './assets/images/claudecode.png';
import codebuddyIcon from './assets/images/Codebuddy.png';
import codexIcon from './assets/images/Codex.png';
import geminiIcon from './assets/images/gemincli.png';
import iflowIcon from './assets/images/iflow.png';
import opencodeIcon from './assets/images/opencode.png';
import qoderIcon from './assets/images/qodercli.png';
import {CheckToolsStatus, InstallTool, LoadConfig, SaveConfig, CheckEnvironment, ResizeWindow, WindowHide, LaunchTool, SelectProjectDir, SetLanguage, GetUserHomeDir, CheckUpdate, ShowMessage, ReadBBS, ReadTutorial, ReadThanks, ClipboardGetText, ListPythonEnvironments, PackLog, ShowItemInFolder, GetSystemInfo, OpenSystemUrl, DownloadUpdate, CancelDownload, LaunchInstallerAndExit, ListSkills, AddSkill, DeleteSkill, SelectSkillFile, GetSkillsDir} from "../wailsjs/go/main/App";
import {EventsOn, EventsOff, BrowserOpenURL, Quit} from "../wailsjs/runtime";
import {main} from "../wailsjs/go/models";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const subscriptionUrls: {[key: string]: string} = {
    "GLM": "https://bigmodel.cn/glm-coding",
    "Kimi": "https://www.kimi.com/membership/pricing?from=upgrade_plan&track_id=1d2446f5-f45f-4ae5-961e-c0afe936a115",
    "Doubao": "https://www.volcengine.com/activity/codingplan",
    "MiniMax": "https://platform.minimaxi.com/user-center/payment/coding-plan",
    "Codex": "https://www.aicodemirror.com/register?invitecode=CZPPWZ",
    "Gemini": "https://www.aicodemirror.com/register?invitecode=CZPPWZ",
    "AiCodeMirror": "https://www.aicodemirror.com/register?invitecode=CZPPWZ",
    "AIgoCode": "https://aigocode.com/invite/TCFQQCCK",
    "GACCode": "https://gaccode.com/signup?ref=FVMCU97H",
    "DeepSeek": "https://platform.deepseek.com/api_keys",
    "CodeRelay": "https://api.code-relay.com/register?aff=0ZtO",
    "ChatFire": "https://api.chatfire.cn/register?aff=jira",
    "XiaoMi": "https://platform.xiaomimimo.com/#/console/api-keys"
};


const APP_VERSION = "3.2.2.3300"

const translations: any = {
    "en": {
        "title": "AICoder",
        "about": "About",
        "cs146s": "Course",
        "introVideo": "Beginner",
        "thanks": "Thanks",
        "hide": "Hide",
        "launch": "Start Coding",
        "project": "Project",
        "projectDir": "Project Directory",
        "change": "Change",
        "yoloMode": "Yolo Mode",
        "dangerouslySkip": "(Dangerously Skip Permissions)",
        "launchBtn": "Launch Tool",
        "modelSettings": "PROVIDER SETTINGS",
        "providerName": "Provider Name",
        "modelName": "Model ID",
        "apiKey": "API Key",
        "personalToken": "Personal Token",
        "getToken": "Get Token",
        "getKey": "Get API Key",
        "enterKey": "Enter API Key",
        "apiEndpoint": "API Endpoint",
        "saveChanges": "Save & Close",
        "saving": "Saving...",
        "saved": "Saved successfully!",
        "close": "Close",
        "manageProjects": "Projects",
        "projectManagement": "Project Management",
        "projectName": "Project Name",
        "delete": "Delete",
        "addNewProject": "+ Add New Project",
        "projectDirError": "Please set a valid Project Directory!",
        "initializing": "Initializing...",
        "loadingConfig": "Loading config...",
        "syncing": "Syncing...",
        "switched": "Provider switched & synced!",
        "projectSwitched": "Project switched!",
        "dirUpdated": "Directory updated!",
        "langName": "English",
        "custom": "Custom",
        "checkUpdate": "Check Update",
        "noUpdate": "No updates available",
        "updateAvailable": "Check for new version: ",
        "foundNewVersion": "Check for new version",
        "downloadNow": "Download Now",
        "paste": "Paste",
        "hideConfig": "Configure",
        "editConfig": "Configure",
        "settings": "Settings",
        "globalSettings": "Global Settings",
        "language": "Language",
        "runnerStatus": "Cur",
        "yoloModeLabel": "Yolo Mode",
        "adminModeLabel": "As Admin",
        "rootModeLabel": "As root",
        "pythonProjectLabel": "Python Project",
        "pythonEnvLabel": "Env",
        "customProviderPlaceholder": "Custom Provider Name",
        "version": "Version",
        "author": "Author",
        "checkingUpdate": "Checking for updates...",
        "downloading": "Downloading...",
        "downloadCancelled": "Download cancelled",
        "downloadError": "Download error: {error}",
        "installNow": "Install Now",
        "downloadAndUpdate": "Download and Update",
        "cancelDownload": "Cancel",
        "downloadComplete": "Download complete",
        "onlineUpdate": "Online Update",
        "retry": "Retry",
        "opencode": "OpenCode",
        "opencodeDesc": "OpenCode AI Programming Assistant",
        "codebuddy": "CodeBuddy",
        "codebuddyDesc": "CodeBuddy AI Assistant",
        "qoder": "Qoder CLI",
        "qoderDesc": "Qoder AI Programming Assistant",
        "iflow": "iFlow CLI",
        "iflowDesc": "iFlow AI Programming Assistant",
        "bugReport": "Problem Feedback",
        "businessCooperation": "Business: WeChat znsoft",
        "original": "Original",
        "message": "Message",
        "tutorial": "Tutorial",
        "danger": "DANGER",
        "selectAll": "Select All",
        "copy": "Copy",
        "cut": "Cut",
        "contextPaste": "Paste",
        "forward": "Relay",
        "customized": "Custom",
        "originalFlag": "Native",
        "monthly": "Monthly",
        "premium": "Paid",
        "quickStart": "Tutorial",
        "manual": "Materials",
        "officialWebsite": "Official Website",
        "dontShowAgain": "Don't show again",
        "showWelcomePage": "Show Welcome Page",
        "refreshMessage": "Refresh",
        "refreshing": "🔄 Fetching latest messages...",
        "refreshSuccess": "✅ Refresh successful!",
        "refreshFailed": "❌ Refresh failed: ",
        "lastUpdate": "Last Update: ",
        "startupTitle": "Welcome to AICoder",
        "showMore": "Show More",
        "showLess": "Show Less",
        "installLog": "View Log",
        "installLogTitle": "Installation Logs",
        "sendLog": "Send Log",
        "sendLogSubject": "AICoder Environment Log",
        "confirmDelete": "Confirm Delete",
        "confirmDeleteMessage": "Are you sure you want to delete provider \"{name}\"?",
        "confirmSendLog": "Confirm Send",
        "confirmSendLogMessage": "No errors detected in logs. Send anyway?",
        "cancel": "Cancel",
        "confirm": "Confirm",
        "slogan": "AI programmers get the job!",
        "proxySettings": "Proxy",
        "proxyHost": "Proxy Host",
        "proxyPort": "Proxy Port",
        "proxyUsername": "Username (Optional)",
        "proxyPassword": "Password (Optional)",
        "proxyMode": "Proxy",
        "proxyNotConfigured": "Proxy not configured. Please configure proxy settings first.",
        "useDefaultProxy": "Use default proxy settings",
        "proxyHostPlaceholder": "e.g., 192.168.1.1 or proxy.company.com",
        "proxyPortPlaceholder": "e.g., 8080",
        "freeload": "Free",
        "skills": "Skills",
        "addSkill": "Add Skill",
        "skillName": "Skill Name",
        "skillDesc": "Description",
        "skillType": "Type",
        "skillAddress": "Address",
        "skillZip": "Zip Package",
        "skillValue": "Value/Path",
        "browse": "Browse",
        "skillAdded": "Skill added successfully",
        "skillDeleted": "Skill deleted successfully",
        "confirmDeleteSkill": "Are you sure you want to delete this skill?",
        "noSkills": "No skills added yet.",
        "installSkills": "Install Skills",
        "selectSkillsToInstall": "Select Skills to Install",
        "install": "Install",
        "installing": "Installing...",
        "installNotImplemented": "Installation functionality is not yet implemented.",
        "pauseEnvCheck": "Skip Env Check",
        "recheckEnv": "Check & Update Environment",
        "skillRequiredError": "Name and Value are required!",
        "skillAddError": "Error adding skill: {error}",
        "skillDeleteError": "Error deleting skill: {error}",
        "copyLog": "Copy Log",
        "logsCopied": "Logs copied to clipboard",
        "currentVersion": "Current Version",
        "latestVersion": "Latest Version",
        "foundNewVersionMsg": "New version found. Download and update now?",
        "isLatestVersion": "Already up to date",
        "placeholderName": "e.g., Frontend Design",
        "placeholderDesc": "Description...",
        "placeholderAddress": "@anthropics/...",
        "placeholderZip": "Select .zip file"
    },
    "zh-Hans": {
        "title": "AICoder",
        "about": "关于",
        "manual": "文档指南",
        "cs146s": "在线课程",
        "introVideo": "入门视频",
        "thanks": "鸣谢",
        "hide": "隐藏",
        "launch": "开始编程",
        "project": "项目",
        "projectDir": "项目目录",
        "change": "更改",
        "yoloMode": "Yolo 模式",
        "dangerouslySkip": "(危险：跳过权限检查)",
        "launchBtn": "启动工具",
        "modelSettings": "服务商配置",
        "providerName": "服务商名称",
        "modelName": "模型名称/ID",
        "apiKey": "API Key",
        "personalToken": "个人令牌",
        "getToken": "获取令牌",
        "getKey": "获取 API Key",
        "enterKey": "输入 API Key",
        "apiEndpoint": "API 端点",
        "saveChanges": "保存并关闭",
        "saving": "保存中...",
        "saved": "保存成功！",
        "close": "关闭",
        "manageProjects": "项目管理",
        "projectManagement": "项目管理",
        "projectName": "项目名称",
        "delete": "删除",
        "addNewProject": "+ 添加新项目",
        "projectDirError": "请设置有效的项目目录！",
        "initializing": "初始化中...",
        "loadingConfig": "加载配置中...",
        "syncing": "正在同步...",
        "switched": "服务商已切换并同步！",
        "projectSwitched": "项目已切换！",
        "dirUpdated": "目录已更新！",
        "langName": "简体中文",
        "custom": "自定义",
        "checkUpdate": "检查更新",
        "noUpdate": "无可用更新",
        "updateAvailable": "检查新版本: ",
        "foundNewVersion": "检查新版本",
        "downloadNow": "立即下载",
        "paste": "粘贴",
        "hideConfig": "配置",
        "editConfig": "配置",
        "settings": "设置",
        "globalSettings": "全局设置",
        "language": "界面语言",
        "runnerStatus": "当前环境",
        "yoloModeLabel": "Yolo 模式",
        "adminModeLabel": "管理员权限",
        "rootModeLabel": "Root 权限",
        "pythonProjectLabel": "Python 项目",
        "pythonEnvLabel": "环境",
        "customProviderPlaceholder": "自定义服务商名称",
        "version": "版本",
        "author": "作者",
        "checkingUpdate": "正在检查更新...",
        "downloading": "正在下载...",
        "downloadCancelled": "下载已取消",
        "downloadError": "下载错误: {error}",
        "installNow": "立即安装",
        "downloadAndUpdate": "下载并更新",
        "cancelDownload": "取消下载",
        "downloadComplete": "下载完成",
        "onlineUpdate": "在线更新",
        "retry": "重试",
        "opencode": "OpenCode",
        "opencodeDesc": "OpenCode AI 辅助编程",
        "codebuddy": "CodeBuddy",
        "codebuddyDesc": "CodeBuddy 编程助手",
        "qoder": "Qoder CLI",
        "qoderDesc": "Qoder AI 辅助编程",
        "iflow": "iFlow CLI",
        "iflowDesc": "iFlow AI 辅助编程",
        "bugReport": "问题反馈",
        "businessCooperation": "商业合作：微信 znsoft",
        "original": "原厂",
        "message": "消息",
        "tutorial": "教程",
        "danger": "危险",
        "selectAll": "全选",
        "copy": "复制",
        "cut": "剪切",
        "contextPaste": "粘贴",
        "refreshMessage": "刷新",
        "refreshing": "🔄 正在从服务器获取最新消息...",
        "refreshSuccess": "✅ 获取新消息成功",
        "refreshFailed": "❌ 刷新失败：",
        "lastUpdate": "最后更新：",
        "forward": "转发服务",
        "customized": "定制",
        "originalFlag": "原生",
        "monthly": "包月",
        "premium": "氪金",
        "quickStart": "新手教学",
        "officialWebsite": "官方网站",
        "dontShowAgain": "下次不再显示",
        "showWelcomePage": "显示欢迎页",
        "startupTitle": "欢迎使用 AICoder",
        "showMore": "更多",
        "showLess": "收起",
        "installLog": "查看日志",
        "installLogTitle": "环境检查与安装日志",
        "sendLog": "发送日志",
        "sendLogSubject": "AICoder环境安装日志",
        "confirmDelete": "确认删除",
        "confirmDeleteMessage": "确定要删除服务商 \"{name}\" 吗？",
        "confirmSendLog": "确认发送",
        "confirmSendLogMessage": "日志中没有检测到错误，是否仍要发送日志？",
        "cancel": "取消",
        "confirm": "确定",
        "slogan": "会AI编程者得工作！",
        "proxySettings": "代理设置",
        "proxyHost": "代理主机",
        "proxyPort": "代理端口",
        "proxyUsername": "用户名 (可选)",
        "proxyPassword": "密码 (可选)",
        "proxyMode": "代理",
        "proxyNotConfigured": "代理未配置。请先配置代理设置。",
        "useDefaultProxy": "使用默认代理设置",
        "proxyHostPlaceholder": "例如：192.168.1.1 或 proxy.company.com",
        "proxyPortPlaceholder": "例如：8080",
        "freeload": "白嫖中",
        "skills": "技能",
        "addSkill": "添加技能",
        "skillName": "技能名称",
        "skillDesc": "描述",
        "skillType": "类型",
        "skillAddress": "Skills包名",
        "skillZip": "Zip包",
        "skillValue": "值/路径",
        "browse": "浏览",
        "skillAdded": "技能添加成功",
        "skillDeleted": "技能删除成功",
        "confirmDeleteSkill": "确定要删除此技能吗？",
        "noSkills": "暂无技能。",
        "installSkills": "安装技能",
        "selectSkillsToInstall": "选择要安装的技能",
        "install": "安装",
        "installing": "正在安装...",
        "installNotImplemented": "安装功能暂未实现。",
        "pauseEnvCheck": "跳过环境检测",
        "recheckEnv": "检测更新运行环境",
        "skillRequiredError": "名称和地址/路径是必填项！",
        "skillAddError": "添加技能出错: {error}",
        "skillDeleteError": "删除技能出错: {error}",
        "copyLog": "复制日志",
        "logsCopied": "日志已复制到剪贴板",
        "currentVersion": "当前版本",
        "latestVersion": "最新版本",
        "foundNewVersionMsg": "检查到新版本，是否立即下载更新？",
        "isLatestVersion": "已是最新版本",
        "placeholderName": "例如：前端设计",
        "placeholderDesc": "描述...",
        "placeholderAddress": "@anthropics/...",
        "placeholderZip": "选择 .zip 文件"
    },
    "zh-Hant": {
        "title": "AICoder",
        "about": "關於",
        "manual": "文檔指南",
        "cs146s": "線上課程",
        "introVideo": "入門視頻",
        "thanks": "鳴謝",
        "hide": "隱藏",
        "launch": "開始編程",
        "project": "專案",
        "projectDir": "專案目錄",
        "change": "變更",
        "yoloMode": "Yolo 模式",
        "dangerouslySkip": "(危險：跳過權限檢查)",
        "launchBtn": "啟動工具",
        "modelSettings": "服務商設定",
        "providerName": "服務商名稱",
        "modelName": "模型名稱/ID",
        "apiKey": "API Key",
        "personalToken": "個人令牌",
        "getToken": "獲取令牌",
        "getKey": "獲取 API Key",
        "enterKey": "輸入 API Key",
        "apiEndpoint": "API 端點",
        "saveChanges": "儲存並關閉",
        "saving": "儲存中...",
        "saved": "儲存成功！",
        "close": "關閉",
        "manageProjects": "專案管理",
        "projectManagement": "專案管理",
        "projectName": "專案名稱",
        "delete": "刪除",
        "addNewProject": "+ 新增專案",
        "projectDirError": "請設置有效的專案目錄！",
        "initializing": "初始化中...",
        "loadingConfig": "載入設定中...",
        "syncing": "正在同步...",
        "switched": "服務商已切換並同步！",
        "langName": "繁體中文",
        "custom": "自定義",
        "checkUpdate": "檢查更新",
        "noUpdate": "無可用更新",
        "updateAvailable": "發現新版本: ",
        "foundNewVersion": "發現新版本",
        "downloadNow": "立即下載",
        "paste": "貼上",
        "hideConfig": "配置",
        "editConfig": "配置",
        "settings": "設置",
        "globalSettings": "全局設置",
        "language": "界面語言",
        "runnerStatus": "目前環境",
        "yoloModeLabel": "Yolo 模式",
        "adminModeLabel": "管理員權限",
        "rootModeLabel": "Root 權限",
        "pythonProjectLabel": "Python 項目",
        "pythonEnvLabel": "環境",
        "customProviderPlaceholder": "自定義服務商名稱",
        "version": "版本",
        "author": "作者",
        "checkingUpdate": "正在檢查更新...",
        "downloading": "正在下載...",
        "downloadCancelled": "下載已取消",
        "downloadError": "下載錯誤: {error}",
        "installNow": "立即安裝",
        "downloadAndUpdate": "下載並更新",
        "cancelDownload": "取消下載",
        "downloadComplete": "下載完成",
        "onlineUpdate": "線上更新",
        "retry": "重試",
        "opencode": "OpenCode",
        "opencodeDesc": "OpenCode AI 輔助編程",
        "codebuddy": "CodeBuddy",
        "codebuddyDesc": "CodeBuddy 編程助手",
        "qoder": "Qoder CLI",
        "qoderDesc": "Qoder AI 輔助編程",
        "iflow": "iFlow CLI",
        "iflowDesc": "iFlow AI 輔助編程",
        "bugReport": "問題反饋",
        "businessCooperation": "商業合作：微信 znsoft",
        "original": "原廠",
        "message": "消息",
        "tutorial": "教程",
        "danger": "危險",
        "selectAll": "全選",
        "copy": "複製",
        "cut": "剪切",
        "contextPaste": "粘貼",
        "refreshMessage": "刷新",
        "refreshing": "🔄 正在从服务器获取最新消息...",
        "refreshSuccess": "✅ 獲取新消息成功",
        "refreshFailed": "❌ 刷新失敗：",
        "lastUpdate": "最後更新：",
        "forward": "轉發服務",
        "customized": "定制",
        "originalFlag": "原生",
        "monthly": "包月",
        "premium": "氪金",
        "quickStart": "新手教學",
        "officialWebsite": "官方網站",
        "dontShowAgain": "下次不再顯示",
        "showWelcomePage": "顯示歡迎頁",
        "startupTitle": "歡迎使用 AICoder",
        "showMore": "更多",
        "showLess": "收起",
        "installLog": "查看日誌",
        "installLogTitle": "環境檢查與安裝日誌",
        "sendLog": "發送日誌",
        "sendLogSubject": "AICoder環境安裝日誌",
        "confirmDelete": "確認刪除",
        "confirmDeleteMessage": "確定要刪除服務商 \"{name}\" 嗎？",
        "confirmSendLog": "確認發送",
        "confirmSendLogMessage": "日誌中沒有檢測到錯誤，是否仍要發送日誌？",
        "cancel": "取消",
        "confirm": "確定",
        "slogan": "會AI編程者得工作！",
        "proxySettings": "代理設置",
        "proxyHost": "代理主機",
        "proxyPort": "代理端口",
        "proxyUsername": "使用者名稱 (可選)",
        "proxyPassword": "密碼 (可選)",
        "proxyMode": "代理",
        "proxyNotConfigured": "代理未配置。請先配置代理設置。",
        "useDefaultProxy": "使用預設代理設置",
        "proxyHostPlaceholder": "例如：192.168.1.1 或 proxy.company.com",
        "proxyPortPlaceholder": "例如：8080",
        "freeload": "白嫖中",
        "skills": "技能",
        "addSkill": "新增技能",
        "skillName": "技能名稱",
        "skillDesc": "描述",
        "skillType": "類型",
        "skillAddress": "Skills包名",
        "skillZip": "Zip包",
        "skillValue": "值/路徑",
        "browse": "瀏覽",
        "skillAdded": "技能新增成功",
        "skillDeleted": "技能刪除成功",
        "confirmDeleteSkill": "確定要刪除此技能嗎？",
        "noSkills": "暫無技能。",
        "installSkills": "安裝技能",
        "selectSkillsToInstall": "選擇要安裝的技能",
        "install": "安裝",
        "installing": "正在安裝...",
        "installNotImplemented": "安裝功能暫未實現。",
        "pauseEnvCheck": "跳過環境檢測",
        "recheckEnv": "檢測更新運行環境",
        "skillRequiredError": "名稱和地址/路徑是必填項！",
        "skillAddError": "新增技能出錯: {error}",
        "skillDeleteError": "刪除技能出錯: {error}",
        "copyLog": "複製日誌",
        "logsCopied": "日誌已複製到剪貼板",
        "currentVersion": "當前版本",
        "latestVersion": "最新版本",
        "foundNewVersionMsg": "檢查到新版本，是否立即下載更新？",
        "isLatestVersion": "已是最新版本",
        "placeholderName": "例如：前端設計",
        "placeholderDesc": "描述...",
        "placeholderAddress": "@anthropics/...",
        "placeholderZip": "選擇 .zip 文件"
    }
};

interface ToolConfigurationProps {
    toolName: string;
    toolCfg: any;
    showModelSettings: boolean;
    setShowModelSettings: (show: boolean) => void;
    handleModelSwitch: (name: string) => void;
    t: (key: string) => string;
}

const ToolConfiguration = ({
    toolName, toolCfg, showModelSettings, setShowModelSettings,
    handleModelSwitch, t
}: ToolConfigurationProps) => {
    return (
        <div style={{
            backgroundColor: '#f8faff', 
            padding: '15px', 
            borderRadius: '12px',
            border: '1px solid rgba(96, 165, 250, 0.1)',
            marginBottom: '15px'
        }}>
            <div className="model-switcher" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                width: '100%',
                paddingTop: '8px',
                overflowY: 'hidden'
            }}>
                {toolCfg.models.map((model: any) => (
                    <button
                        key={model.model_name}
                        className={`model-btn ${toolCfg.current_model === model.model_name ? 'selected' : ''}`}
                        onClick={() => handleModelSwitch(model.model_name)}
                        style={{
                            minWidth: '94px',
                            padding: '4px 4px',
                            fontSize: '0.8rem',
                            borderBottom: (model.api_key && model.api_key.trim() !== "") ? '3px solid #60a5fa' : '1px solid var(--border-color)',
                            position: 'relative',
                            overflow: 'visible'
                        }}
                    >
                        {model.model_name === "Original" ? t("original") : model.model_name}
                        {model.model_name === "Original" && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '0px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transform: 'scale(0.85)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                {t("originalFlag")}
                            </span>
                        )}
                        {(model.model_name.toLowerCase().includes("glm") || 
                          model.model_name.toLowerCase().includes("kimi") ||
                          model.model_name.toLowerCase().includes("doubao") ||
                          model.model_name.toLowerCase().includes("minimax")) && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '0px',
                                backgroundColor: '#ec4899',
                                color: 'white',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transform: 'scale(0.85)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                {t("monthly")}
                            </span>
                        )}
                        {model.model_name.toLowerCase().includes("deepseek") && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '0px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transform: 'scale(0.85)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                {t("premium")}
                            </span>
                        )}
                        {model.model_name.toLowerCase().includes("xiaomi") && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '0px',
                                backgroundColor: '#60a5fa',
                                color: 'white',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transform: 'scale(0.85)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                {t("freeload")}
                            </span>
                        )}
                        {model.is_custom ? (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '0px',
                                backgroundColor: '#9ca3af',
                                color: 'white',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transform: 'scale(0.85)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}>
                                {t("customized")}
                            </span>
                        ) : (
                            (model.model_name.toLowerCase().includes("aicodemirror") || 
                             model.model_name.toLowerCase().includes("aigocode") ||
                             model.model_name.toLowerCase().includes("gaccode") ||
                             model.model_name.toLowerCase().includes("chatfire") ||
                             model.model_name.toLowerCase().includes("coderelay")) && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '0px',
                                    backgroundColor: '#14b8a6',
                                    color: 'white',
                                    fontSize: '10px',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    zIndex: 10,
                                    transform: 'scale(0.85)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                }}>
                                    {t("forward")}
                                </span>
                            )
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

function App() {
    const [config, setConfig] = useState<main.AppConfig | null>(null);
    const [navTab, setNavTab] = useState<string>("claude");
    const [bbsContent, setBbsContent] = useState<string>("");
    const [tutorialContent, setTutorialContent] = useState<string>("");
    const [thanksContent, setThanksContent] = useState<string>(""); // New state for thanks content
    const [showThanksModal, setShowThanksModal] = useState<boolean>(false); // New state for thanks modal
    const [refreshStatus, setRefreshStatus] = useState<string>("");
    const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [activeTool, setActiveTool] = useState<string>("claude");
    const [status, setStatus] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [tabStartIndex, setTabStartIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isManualCheck, setIsManualCheck] = useState(false);
    const [showStartupPopup, setShowStartupPopup] = useState(false);
    const [pythonEnvironments, setPythonEnvironments] = useState<any[]>([]);

    // Ref to prevent multiple hide clicks
    const isHidingRef = useRef(false);

    useEffect(() => {
        // activeTab 0 is Original (hidden), so configurable models start at 1.
        // We map activeTab to a 0-based index for the configurable list.
        const localActiveIndex = activeTab > 0 ? activeTab - 1 : 0;

        if (localActiveIndex < tabStartIndex) {
            setTabStartIndex(localActiveIndex);
        } else if (localActiveIndex >= tabStartIndex + 4) {
            setTabStartIndex(localActiveIndex - 3);
        }
    }, [activeTab]);

    const [showModelSettings, setShowModelSettings] = useState(false);
    const [showProxySettings, setShowProxySettings] = useState(false);
    const [proxyEditMode, setProxyEditMode] = useState<'global' | 'project'>('global');

    useEffect(() => {
        if (showModelSettings && activeTab === 0) {
            setActiveTab(1);
        }
    }, [showModelSettings, activeTab]);

    const [showInstallSkillModal, setShowInstallSkillModal] = useState(false);
    const [selectedSkillsToInstall, setSelectedSkillsToInstall] = useState<string[]>([]);

    const [toolStatuses, setToolStatuses] = useState<any[]>([]);
    const [envLogs, setEnvLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [yoloMode, setYoloMode] = useState(false);
    const [selectedProjectForLaunch, setSelectedProjectForLaunch] = useState<string>("");
    const [showAbout, setShowAbout] = useState(false);
    const [showInstallLog, setShowInstallLog] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateResult, setUpdateResult] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadError, setDownloadError] = useState("");
    const [installerPath, setInstallerPath] = useState("");
    const [isStartupUpdateCheck, setIsStartupUpdateCheck] = useState(false);
    const isWindows = /window/i.test(navigator.userAgent);
    const [projectOffset, setProjectOffset] = useState(0);
    const [lang, setLang] = useState("en");
    const [toastMessage, setToastMessage] = useState<string>("");
    const [showToast, setShowToast] = useState(false);
    
    const [skills, setSkills] = useState<main.Skill[]>([]);
    const [showAddSkillModal, setShowAddSkillModal] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillDesc, setNewSkillDesc] = useState("");
    const [newSkillType, setNewSkillType] = useState("address");
    const [newSkillValue, setNewSkillValue] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [skillContextMenu, setSkillContextMenu] = useState<{x: number, y: number, visible: boolean, skillName: string | null}>({
        x: 0, y: 0, visible: false, skillName: null
    });
    
    const [contextMenu, setContextMenu] = useState<{x: number, y: number, visible: boolean, target: HTMLInputElement | null}>({
        x: 0, y: 0, visible: false, target: null
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        show: false,
        title: "",
        message: "",
        onConfirm: () => {}
    });

    const handleContextMenu = (e: React.MouseEvent, target: HTMLInputElement) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            visible: true,
            target: target
        });
    };

    const closeContextMenu = () => {
        setContextMenu({...contextMenu, visible: false});
    };

    const showToastMessage = (message: string, duration: number = 3000) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, duration);
    };

    const handleShowThanks = async () => {
        try {
            const content = await ReadThanks();
            setThanksContent(content);
            setShowThanksModal(true);
        } catch (err) {
            console.error("Failed to read thanks content:", err);
            showToastMessage(t("refreshFailed") + err, 5000);
        }
    };

    const handleDeleteSkill = async (name: string) => {
        setConfirmDialog({
            show: true,
            title: t("confirmDelete"),
            message: t("confirmDeleteSkill"),
            onConfirm: async () => {
                try {
                    await DeleteSkill(name);
                    const list = await ListSkills();
                    setSkills(list || []);
                    if (selectedSkill === name) setSelectedSkill(null);
                    showToastMessage(t("skillDeleted"));
                    setConfirmDialog(prev => ({...prev, show: false}));
                } catch (err) {
                    showToastMessage(t("skillDeleteError").replace("{error}", err as string));
                }
            }
        });
    };

    const handleDownload = async () => {
        if (!updateResult) return;
        // Use download_url if available (added in backend update), fallback to release_url
        const downloadUrl = updateResult.download_url || updateResult.release_url;
        if (!downloadUrl) return;
        
        setIsDownloading(true);
        setDownloadProgress(0);
        setDownloadError("");
        setInstallerPath("");
        
        const fileName = isWindows ? "AICoder-Setup.exe" : "AICoder-Universal.pkg";

        try {
            const path = await DownloadUpdate(downloadUrl, fileName);
            setInstallerPath(path);
        } catch (err: any) {
            console.error("Download error:", err);
            // Error is handled by the event listener
        }
    };

    const handleCancelDownload = () => {
        const fileName = isWindows ? "AICoder-Setup.exe" : "AICoder-Universal.pkg";
        CancelDownload(fileName);
    };

    const handleInstall = async () => {
        if (installerPath) {
            try {
                await LaunchInstallerAndExit(installerPath);
            } catch (err) {
                console.error("Install launch error:", err);
                showToastMessage(t("downloadError").replace("{error}", err as string));
            }
        }
    };

    const handleWindowHide = (e: React.MouseEvent) => {
        // Prevent event bubbling and default behavior
        e.preventDefault();
        e.stopPropagation();

        console.log("Hide button clicked"); // Debug log

        // Prevent multiple rapid clicks
        if (isHidingRef.current) {
            console.log("Already hiding, ignoring click");
            return;
        }
        isHidingRef.current = true;

        console.log("Calling WindowHide");
        WindowHide();

        // Reset flag after a short delay
        setTimeout(() => {
            isHidingRef.current = false;
        }, 1000);
    };

    useEffect(() => {
        const handleClick = () => {
            closeContextMenu();
            setSkillContextMenu(prev => ({...prev, visible: false}));
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu, skillContextMenu]);

    const getClipboardText = async () => {
        try {
            const text = await ClipboardGetText();
            return text || "";
        } catch (err) {
            console.error("ClipboardGetText failed:", err);
            // Browser API fallback if backend fails
            try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    return await navigator.clipboard.readText();
                }
            } catch (e) {}
            return "";
        }
    };

    const handleContextAction = async (action: string) => {
        const target = contextMenu.target;
        if (!target) return;

        target.focus();
        
        switch (action) {
            case 'selectAll':
                target.select();
                break;
            case 'copy':
                document.execCommand('copy');
                break;
            case 'cut':
                document.execCommand('cut');
                break;
            case 'paste':
                const text = await getClipboardText();
                if (text) {
                    // Modern approach using setRangeText if supported, or manual
                    const start = target.selectionStart || 0;
                    const end = target.selectionEnd || 0;
                    const val = target.value;
                    const newVal = val.substring(0, start) + text + val.substring(end);
                    
                    // Generic React-compatible input update
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                    if (nativeInputValueSetter) {
                        nativeInputValueSetter.call(target, newVal);
                    } else {
                        target.value = newVal;
                    }
                    const event = new Event('input', { bubbles: true });
                    target.dispatchEvent(event);
                }
                break;
        }
        closeContextMenu();
    };

    const logEndRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
        }
    }, [envLogs]);

    useEffect(() => {
        // Language detection
        const userLang = navigator.language;
        let initialLang = "en";
        if (userLang.startsWith("zh-TW") || userLang.startsWith("zh-HK")) {
            initialLang = "zh-Hant";
        } else if (userLang.startsWith("zh")) {
            initialLang = "zh-Hans";
        }
        setLang(initialLang);
        SetLanguage(initialLang);

        // Environment Check Logic
        const logHandler = (msg: string) => {
            setEnvLogs(prev => [...prev, msg]);
            if (msg.toLowerCase().includes("failed") || msg.toLowerCase().includes("error")) {
                setShowLogs(true);
            }
        };
        const doneHandler = () => {
            ResizeWindow(657, 440);
            setIsLoading(false);
            setIsManualCheck(false);
        };

        EventsOn("env-log", logHandler);
        EventsOn("env-check-done", doneHandler);

        EventsOn("download-progress", (data: any) => {
            console.log("Download progress event:", data);
            if (data.status === "downloading") {
                setDownloadProgress(Math.floor(data.percentage));
            } else if (data.status === "completed") {
                setDownloadProgress(100);
                setIsDownloading(false);
            } else if (data.status === "error") {
                setDownloadError(data.error);
                setIsDownloading(false);
            } else if (data.status === "cancelled") {
                setDownloadError(t("downloadCancelled"));
                setIsDownloading(false);
            }
        });

        CheckEnvironment(false); // Start checks

        // Load Python environments
        ListPythonEnvironments().then((envs) => {
            setPythonEnvironments(envs);
        }).catch(err => {
            console.error("Failed to load Python environments:", err);
        });

        // Config Logic
        LoadConfig().then((cfg) => {
            setConfig(cfg);
            
            if (!cfg.pause_env_check) {
                checkTools();
            }

            if (cfg && cfg.language) {
                setLang(cfg.language);
                SetLanguage(cfg.language);
            }

            // Automatic update check on startup disabled - use "Online Update" button instead
            // Show welcome page if needed
            if (cfg && !cfg.hide_startup_popup) {
                setShowStartupPopup(true);
            }
            if (cfg && cfg.current_project) {
                setSelectedProjectForLaunch(cfg.current_project);
            } else if (cfg && cfg.projects && cfg.projects.length > 0) {
                setSelectedProjectForLaunch(cfg.projects[0].id);
            }
            if (cfg) {
                // Default to message tab on startup as requested
                const tool = "message";
                setNavTab(tool);
                
                // Keep track of the last active tool for settings/launch logic
                const lastActiveTool = cfg.active_tool || "claude";
                if (lastActiveTool === 'claude' || lastActiveTool === 'gemini' || lastActiveTool === 'codex' || lastActiveTool === 'opencode' || lastActiveTool === 'codebuddy' || lastActiveTool === 'qoder' || lastActiveTool === 'iflow') {
                    setActiveTool(lastActiveTool);
                }
                
                ReadBBS().then(content => setBbsContent(content)).catch(err => console.error(err));
                
                const toolCfg = (cfg as any)[lastActiveTool];
                if (toolCfg && toolCfg.models) {
                    const idx = toolCfg.models.findIndex((m: any) => m.model_name === toolCfg.current_model);
                    if (idx !== -1) setActiveTab(idx);

                    // Check if any model has an API key configured for the active tool
                    if (lastActiveTool === 'claude' || lastActiveTool === 'gemini' || lastActiveTool === 'codex' || lastActiveTool === 'opencode' || lastActiveTool === 'codebuddy' || lastActiveTool === 'qoder' || lastActiveTool === 'iflow') {
                        const hasAnyApiKey = toolCfg.models.some((m: any) => m.api_key && m.api_key.trim() !== "");
                        if (!hasAnyApiKey) {
                            setShowModelSettings(true);
                        }
                    }
                }
            }
        }).catch(err => {
            setStatus("Error loading config: " + err);
        });

        // Listen for external config changes (e.g. from Tray)
        const handleConfigChange = (cfg: main.AppConfig) => {
            setConfig(cfg);
            // Sync with tray menu changes
            const tool = cfg.active_tool || "message";
            setNavTab(tool);
            if (tool === 'claude' || tool === 'gemini' || tool === 'codex' || tool === 'opencode' || tool === 'codebuddy' || tool === 'iflow') {
                setActiveTool(tool);
                const toolCfg = (cfg as any)[tool];
                if (toolCfg && toolCfg.models) {
                    const idx = toolCfg.models.findIndex((m: any) => m.model_name === toolCfg.current_model);
                    if (idx !== -1) setActiveTab(idx);
                }
            }
        };
        EventsOn("config-changed", handleConfigChange);
        EventsOn("config-updated", handleConfigChange);

        return () => {
            EventsOff("env-log");
            EventsOff("env-check-done");
            EventsOff("download-progress");
            EventsOff("config-changed");
            EventsOff("config-updated");
        };
    }, []);

    const checkTools = async () => {
        try {
            const statuses = await CheckToolsStatus();
            setToolStatuses(statuses);

            // Add opencode check and installation if missing
            const opencodeStatus = statuses?.find((s: any) => s.name === "opencode");
            if (opencodeStatus && !opencodeStatus.installed) {
                setEnvLogs(prev => [...prev, lang === 'zh-Hans' ? "正在安装 Opencode AI..." : 
                                         lang === 'zh-Hant' ? "正在安裝 Opencode AI..." :
                                         "Installing Opencode AI..."]);
                await InstallTool("opencode");
            }

            // Add codebuddy check and installation if missing
            const codebuddyStatus = statuses?.find((s: any) => s.name === "codebuddy");
            if (codebuddyStatus && !codebuddyStatus.installed) {
                setEnvLogs(prev => [...prev, lang === 'zh-Hans' ? "正在安装 CodeBuddy AI..." : 
                                         lang === 'zh-Hant' ? "正在安裝 CodeBuddy AI..." :
                                         "Installing CodeBuddy AI..."]);
                await InstallTool("codebuddy");
            }

            // Add qoder check and installation if missing
            const qoderStatus = statuses?.find((s: any) => s.name === "qoder");
            if (qoderStatus && !qoderStatus.installed) {
                setEnvLogs(prev => [...prev, lang === 'zh-Hans' ? "正在安装 Qoder CLI..." : 
                                         lang === 'zh-Hant' ? "正在安裝 Qoder CLI..." :
                                         "Installing Qoder CLI..."]);
                await InstallTool("qoder");
            }

            // Add iflow check and installation if missing
            const iflowStatus = statuses?.find((s: any) => s.name === "iflow");
            if (iflowStatus && !iflowStatus.installed) {
                setEnvLogs(prev => [...prev, lang === 'zh-Hans' ? "正在安装 iFlow CLI..." : 
                                         lang === 'zh-Hant' ? "正在安裝 iFlow CLI..." :
                                         "Installing iFlow CLI..."]);
                await InstallTool("iflow");
            }

            // Re-check after installation
            const updatedStatuses = await CheckToolsStatus();
            setToolStatuses(updatedStatuses);
        } catch (err) {
            console.error("Failed to check tools:", err);
        }
    };

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLang(newLang);
        SetLanguage(newLang);
        if (config) {
            const newConfig = new main.AppConfig({...config, language: newLang});
            setConfig(newConfig);
            SaveConfig(newConfig);
        }
    };

    const switchTool = (tool: string) => {
        setNavTab(tool);
        if (tool === 'claude' || tool === 'gemini' || tool === 'codex' || tool === 'opencode' || tool === 'codebuddy' || tool === 'qoder' || tool === 'iflow') {
            setActiveTool(tool);
            setActiveTab(0); // Reset to Original when switching tools
        }
        
        if (tool === 'message') {
            setShowModelSettings(false);
            ReadBBS().then(content => setBbsContent(content)).catch(err => console.error(err));
        }

        if (tool === 'tutorial') {
            setShowModelSettings(false);
            ReadTutorial().then(content => setTutorialContent(content)).catch(err => console.error(err));
        }

        if (tool === 'skills') {
             setShowModelSettings(false);
             ListSkills().then(list => setSkills(list || [])).catch(err => console.error(err));
        }

        if (config) {
            const newConfig = new main.AppConfig({...config, active_tool: tool});
            setConfig(newConfig);
            SaveConfig(newConfig);

            const toolCfg = (config as any)[tool];
            if (toolCfg && toolCfg.models) {
                const idx = toolCfg.models.findIndex((m: any) => m.model_name === toolCfg.current_model);
                if (idx !== -1) setActiveTab(idx);
            }
        }
    };

    const handleSkillContext = (e: React.MouseEvent, skillName: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSkill(skillName);
        setSkillContextMenu({
            x: e.clientX,
            y: e.clientY,
            visible: true,
            skillName: skillName
        });
    };

    const t = (key: string) => {
        return translations[lang][key] || translations["en"][key] || key;
    };

    // Extract provider name from model name
    // Examples: "AICodeMirror-Claude" -> "AICodeMirror", "Doubao-Codex" -> "Doubao", "GLM" -> "GLM"
    const getProviderPrefix = (modelName: string): string => {
        // Match pattern like "Provider-Tool" (e.g., "AICodeMirror-Claude", "DeepSeek-Codex")
        const match = modelName.match(/^(.+?)-(Claude|Gemini|Codex)$/i);
        if (match) {
            return match[1];
        }
        // For names without tool suffix, return the full name as provider
        return modelName;
    };

    const handleApiKeyChange = (newKey: string) => {
        if (!config) return;

        // Deep clone the entire config
        const configCopy = JSON.parse(JSON.stringify(config));

        // Get current model info
        const currentModel = configCopy[activeTool].models[activeTab];
        const currentModelName = currentModel.model_name;
        const isCurrentCustom = currentModel.is_custom;

        // Update current model's API key
        configCopy[activeTool].models[activeTab].api_key = newKey;

        const providerPrefix = getProviderPrefix(currentModelName);

        console.log('[API Key Sync] Current tool:', activeTool, 'Model:', currentModelName, 'Provider:', providerPrefix, 'Is custom:', isCurrentCustom);

        // Skip syncing for "Original" model and custom models
        if (providerPrefix !== "Original" && !isCurrentCustom) {
            const tools = ['claude', 'gemini', 'codex', 'opencode', 'codebuddy', 'qoder', 'iflow'];
            let syncCount = 0;

            tools.forEach(tool => {
                if (configCopy[tool] && configCopy[tool].models && Array.isArray(configCopy[tool].models)) {
                    configCopy[tool].models.forEach((model: any, index: number) => {
                        // Skip the current model being edited
                        if (tool === activeTool && index === activeTab) {
                            return;
                        }

                        // Skip custom models
                        if (model.is_custom) {
                            return;
                        }

                        // Check if model belongs to the same provider
                        const modelProvider = getProviderPrefix(model.model_name);
                        if (modelProvider === providerPrefix) {
                            console.log('[API Key Sync] Syncing to:', tool, 'index:', index, 'model:', model.model_name);
                            configCopy[tool].models[index].api_key = newKey;
                            syncCount++;
                        }
                    });
                }
            });

            console.log('[API Key Sync] Total synced models:', syncCount);
        } else {
            console.log('[API Key Sync] Skipped - Original model or custom model');
        }

        const newConfig = new main.AppConfig(configCopy);
        setConfig(newConfig);
    };

    const handleDeleteModel = () => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        const modelToDelete = toolCfg.models[activeTab];
        if (modelToDelete.model_name === "Original") return;

        const message = t("confirmDeleteMessage").replace("{name}", modelToDelete.model_name);

        setConfirmDialog({
            show: true,
            title: t("confirmDelete"),
            message: message,
            onConfirm: () => {
                const newModels = toolCfg.models.filter((_: any, i: number) => i !== activeTab);
                const newConfig = new main.AppConfig({...config, [activeTool]: {...toolCfg, models: newModels}});

                // Adjust active tab if it was the last one
                const newActiveTab = Math.max(0, activeTab - 1);
                setActiveTab(newActiveTab);

                setConfig(newConfig);
                setConfirmDialog({...confirmDialog, show: false});
                // We don't save immediately here to allow user to cancel or make other changes,
                // but the "Save Changes" button will call SaveConfig which triggers sync.
                // Actually, for sync to work, we need to save.
            }
        });
    };

    const handleModelUrlChange = (newUrl: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        toolCfg.models[activeTab].model_url = newUrl;
        const newConfig = new main.AppConfig({...config, [activeTool]: toolCfg});
        setConfig(newConfig);
    };

    const handleModelNameChange = (name: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        toolCfg.models[activeTab].model_name = name;
        const newConfig = new main.AppConfig({...config, [activeTool]: toolCfg});
        setConfig(newConfig);
    };

    const handleModelIdChange = (id: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        toolCfg.models[activeTab].model_id = id;
        const newConfig = new main.AppConfig({...config, [activeTool]: toolCfg});
        setConfig(newConfig);
    };

    const handleWireApiChange = (api: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        toolCfg.models[activeTab].wire_api = api;
        const newConfig = new main.AppConfig({...config, [activeTool]: toolCfg});
        setConfig(newConfig);
    };

    const getDefaultModelId = (tool: string, provider: string) => {
        const p = provider.toLowerCase();
        if (tool === "claude") {
            if (p.includes("glm")) return "glm-4.7";
            if (p.includes("kimi")) return "kimi-k2-thinking";
            if (p.includes("doubao")) return "doubao-seed-code-preview-latest";
            if (p.includes("minimax")) return "MiniMax-M2.1";
            if (p.includes("aigocode")) return "claude-3-5-sonnet-20241022";
            if (p.includes("aicodemirror")) return "Haiku";
            if (p.includes("coderelay")) return "claude-3-5-sonnet-20241022";
        } else if (tool === "gemini") {
            return "gemini-2.0-flash-exp";
        } else if (tool === "codex") {
            if (p.includes("aigocode") || p.includes("aicodemirror") || p.includes("coderelay")) return "gpt-5.2-codex";
            if (p.includes("deepseek")) return "deepseek-chat";
            if (p.includes("glm")) return "glm-4.7";
            if (p.includes("doubao")) return "doubao-seed-code-preview-latest";
            if (p.includes("kimi")) return "kimi-for-coding";
            if (p.includes("minimax")) return "MiniMax-M2.1";
        } else if (tool === "opencode" || tool === "codebuddy" || tool === "qoder" || tool === "iflow") {
            if (p.includes("deepseek")) return "deepseek-chat";
            if (p.includes("glm")) return "glm-4.7";
            if (p.includes("doubao")) return "doubao-seed-code-preview-latest";
            if (p.includes("kimi")) return "kimi-for-coding";
            if (p.includes("minimax")) return "MiniMax-M2.1";
        }
        return "";
    };

    const handleModelSwitch = (modelName: string) => {
        if (!config) return;
        
        const toolCfg = (config as any)[activeTool];
        const targetModel = toolCfg.models.find((m: any) => m.model_name === modelName);
        if (modelName !== "Original" && (!targetModel || !targetModel.api_key || targetModel.api_key.trim() === "")) {
            setStatus("Please configure API Key first!");
            const idx = toolCfg.models.findIndex((m: any) => m.model_name === modelName);
            if (idx !== -1) setActiveTab(idx);
            
            setShowModelSettings(true);
            setTimeout(() => setStatus(""), 2000);
            return;
        }

        const newToolCfg = {...toolCfg, current_model: modelName};
        const newConfig = new main.AppConfig({...config, [activeTool]: newToolCfg});
        setConfig(newConfig);
        setStatus(t("syncing"));
        SaveConfig(newConfig).then(() => {
            setStatus(t("switched"));
            setTimeout(() => setStatus(""), 1500);
        }).catch(err => {
            setStatus("Error syncing: " + err);
        });
    };

    const getCurrentProject = () => {
        if (!config || !config.projects) return null;
        return config.projects.find((p: any) => p.id === config.current_project) || config.projects[0];
    };

    const handleProjectSwitch = (projectId: string) => {
        if (!config) return;
        const newConfig = new main.AppConfig({...config, current_project: projectId});
        setConfig(newConfig);
        setSelectedProjectForLaunch(projectId);
        setStatus(t("projectSwitched"));
        setTimeout(() => setStatus(""), 1500);
        SaveConfig(newConfig);
    };

    const handleSelectDir = () => {
        if (!config) return;
        SelectProjectDir().then((dir) => {
            if (dir && dir.length > 0) {
                const currentProj = getCurrentProject();
                if (!currentProj) return;

                const newProjects = config.projects.map((p: any) => 
                    p.id === currentProj.id ? { ...p, path: dir } : p
                );
                
                const newConfig = new main.AppConfig({...config, projects: newProjects, project_dir: dir});
                setConfig(newConfig);
                setStatus(t("dirUpdated"));
                setTimeout(() => setStatus(""), 1500);
                SaveConfig(newConfig);
            }
        });
    };

    const handleYoloChange = (checked: boolean) => {
        if (!config) return;
        const currentProj = getCurrentProject();
        if (!currentProj) return;

        const newProjects = config.projects.map((p: any) => 
            p.id === currentProj.id ? { ...p, yolo_mode: checked } : p
        );
        
        const newConfig = new main.AppConfig({...config, projects: newProjects});
        setConfig(newConfig);
        setStatus(t("saved"));
        setTimeout(() => setStatus(""), 1500);
        SaveConfig(newConfig);
    };

    const handleAddNewProject = async () => {
        if (!config) return;
        
        let baseName = "Project";
        let newName = "";
        let i = 1;
        while (true) {
            newName = `${baseName} ${i}`;
            if (!config.projects.some((p: any) => p.name === newName)) break;
            i++;
        }

        const homeDir = await GetUserHomeDir();
        const newId = Math.random().toString(36).substr(2, 9);
        const newProject = {
            id: newId,
            name: newName,
            path: homeDir || "",
            yolo_mode: false
        };
        
        const newProjects = [...config.projects, newProject];
        const newConfig = new main.AppConfig({...config, projects: newProjects});
        setConfig(newConfig);
        SaveConfig(newConfig);
        setStatus(t("saved"));
        setTimeout(() => setStatus(""), 1500);
    };

    const handleOpenSubscribe = (modelName: string) => {
        const url = subscriptionUrls[modelName];
        if (url) {
            BrowserOpenURL(url);
        }
    };

    const save = () => {
        if (!config) return;

        // Sanitize: Ensure Custom models have a name (prevent empty tab button)
        const configCopy = JSON.parse(JSON.stringify(config));
        const tools = ['claude', 'gemini', 'codex', 'opencode', 'codebuddy', 'qoder', 'iflow'];
        tools.forEach(tool => {
            if (configCopy[tool] && configCopy[tool].models) {
                configCopy[tool].models.forEach((model: any) => {
                    if (model.is_custom && (!model.model_name || model.model_name.trim() === '')) {
                        model.model_name = 'Custom';
                    }
                });
            }
        });

        const sanitizedConfig = new main.AppConfig(configCopy);
        setConfig(sanitizedConfig);

        setStatus(t("saving"));
        SaveConfig(sanitizedConfig).then(() => {
            setStatus(t("saved"));
            setTimeout(() => {
                setStatus("");
                setShowModelSettings(false);
            }, 1000);
        }).catch(err => {
            setStatus("Error saving: " + err);
        });
    };

    const performSendLog = async () => {
        const subject = t("sendLogSubject");
        const logContent = envLogs.join('\n');

        try {
            // Get correct OS info from backend with fallback
            let sysInfo = { os: "unknown", arch: "unknown", os_version: "unknown" };
            try {
                sysInfo = await GetSystemInfo();
            } catch (e) {
                console.error("GetSystemInfo failed:", e);
                // Fallback if backend call fails
                sysInfo.os = /mac/i.test(navigator.platform) ? "darwin" : navigator.platform;
            }

            // Pack log to zip
            const zipPath = await PackLog(logContent);

            // Show in folder
            await ShowItemInFolder(zipPath);

            // Prepare mailto body
            const instruction = lang === 'zh-Hans'
                ? `请将刚刚打开的文件夹中的压缩包（aicoder_log_....zip）作为附件添加到此邮件中发送。\n\n`
                : lang === 'zh-Hant'
                ? `請將剛剛打開的文件夾中的壓縮包（aicoder_log_....zip）作為附件添加到此郵件中發送。\n\n`
                : `Please attach the zip file (aicoder_log_....zip) from the opened folder to this email.\n\n`;

            const body = `Product: AICoder
Version: ${APP_VERSION}

System Information:
OS: ${sysInfo.os}
OS Version: ${sysInfo.os_version}
Architecture: ${sysInfo.arch}

${instruction}`;

            const mailtoLink = `mailto:znsoft@163.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            await OpenSystemUrl(mailtoLink);
        } catch (e) {
            console.error("Failed to pack/send log:", e);
            alert("Failed to send log: " + e);
        }
    };

    if (isLoading) {
        return (
            <div style={{
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: '#fff',
                padding: '20px',
                textAlign: 'center',
                boxSizing: 'border-box',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '30px', 
                    width: '100%', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    zIndex: 999, 
                    '--wails-draggable': 'drag'
                } as any}></div>
                <h2 style={{
                    background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px',
                    display: 'inline-block',
                    fontWeight: 'bold'
                }}>AICoder</h2>
                <div style={{width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px'}}>
                    <div style={{
                        width: '50%', 
                        height: '100%', 
                        backgroundColor: '#60a5fa', 
                        borderRadius: '2px', 
                        animation: 'indeterminate 1.5s infinite linear'
                    }}></div>
                </div>
                
                {showLogs ? (
                    <textarea 
                        ref={logEndRef}
                        readOnly
                        value={envLogs.join('\n')}
                        style={{
                            width: '100%',
                            height: '240px',
                            padding: '10px',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            color: '#4b5563',
                            backgroundColor: '#fffdfa',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            resize: 'none',
                            outline: 'none',
                            marginBottom: '10px'
                        }}
                    />
                ) : (
                    <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '15px', height: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {envLogs.length > 0 ? envLogs[envLogs.length - 1] : t("initializing")}
                    </div>
                )}

                <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <button 
                        onClick={() => setShowLogs(!showLogs)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#60a5fa',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {showLogs ? (lang === 'zh-Hans' ? '隐藏详情' : 'Hide Details') : (lang === 'zh-Hans' ? '查看详情' : 'Show Details')}
                    </button>

                    {showLogs && (
                        isManualCheck ? (
                            <button onClick={() => {
                                setIsLoading(false);
                                setIsManualCheck(false);
                            }} className="btn-hide" style={{borderColor: '#60a5fa', color: '#60a5fa', padding: '4px 12px'}}>
                                {t("close")}
                            </button>
                        ) : (
                            <button onClick={Quit} className="btn-hide" style={{borderColor: '#ef4444', color: '#ef4444', padding: '4px 12px'}}>
                                {lang === 'zh-Hans' ? '退出程序' : 'Quit'}
                            </button>
                        )
                    )}
                </div>
                
                <style>{`
                    @keyframes indeterminate {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(200%); }
                    }
                `}</style>
            </div>
        );
    }

    if (!config) return <div className="main-content" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>{t("loadingConfig")}</div>;

            const toolCfg = (navTab === 'claude' || navTab === 'gemini' || navTab === 'codex' || navTab === 'opencode' || navTab === 'codebuddy' || navTab === 'qoder' || navTab === 'iflow')
                ? (config as any)[navTab]
                : null;

    const currentProject = getCurrentProject();

    return (
        <div id="App">
            <div style={{
                height: '30px', 
                width: '180px', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: 999, 
                '--wails-draggable': 'drag'
            } as any}></div>

            <div className="sidebar" style={{'--wails-draggable': 'no-drag', flexDirection: 'row', padding: 0, width: '180px'} as any}>
                {/* Left Navigation Strip */}
                <div style={{
                    width: '60px', 
                    borderRight: '1px solid var(--border-color)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '10px 0',
                    backgroundColor: '#f8fafc',
                    flexShrink: 0
                }}>
                    <div className="sidebar-header" style={{padding: '0 0 15px 0', justifyContent: 'center', width: '100%'}}>
                        <img src={appIcon} alt="Logo" className="sidebar-logo" style={{width: '28px', height: '28px'}} />
                    </div>
                    
                    <div 
                        className={`sidebar-item ${navTab === 'message' ? 'active' : ''}`} 
                        onClick={() => switchTool('message')}
                        style={{flexDirection: 'column', padding: '10px 0', width: '100%', gap: '4px', borderLeft: 'none', borderRight: navTab === 'message' ? '3px solid var(--primary-color)' : '3px solid transparent', justifyContent: 'center'}}
                        title={t("message")}
                    >
                        <span className="sidebar-icon" style={{margin: 0, fontSize: '1.2rem'}}>💬</span>
                        <span style={{fontSize: '0.65rem', lineHeight: 1}}>{t("message")}</span>
                    </div>
                    <div 
                        className={`sidebar-item ${navTab === 'tutorial' ? 'active' : ''}`} 
                        onClick={() => switchTool('tutorial')}
                        style={{flexDirection: 'column', padding: '10px 0', width: '100%', gap: '4px', borderLeft: 'none', borderRight: navTab === 'tutorial' ? '3px solid var(--primary-color)' : '3px solid transparent', justifyContent: 'center'}}
                        title={t("tutorial")}
                    >
                        <span className="sidebar-icon" style={{margin: 0, fontSize: '1.2rem'}}>📚</span>
                        <span style={{fontSize: '0.65rem', lineHeight: 1}}>{t("tutorial")}</span>
                    </div>

                    <div style={{flex: 1}}></div>

                    <div 
                        className={`sidebar-item ${navTab === 'skills' ? 'active' : ''}`} 
                        onClick={() => switchTool('skills')}
                        style={{flexDirection: 'column', padding: '10px 0', width: '100%', gap: '4px', borderLeft: 'none', borderRight: navTab === 'skills' ? '3px solid var(--primary-color)' : '3px solid transparent', justifyContent: 'center'}}
                        title={t("skills")}
                    >
                        <span className="sidebar-icon" style={{margin: 0, fontSize: '1.2rem'}}>🛠️</span>
                        <span style={{fontSize: '0.65rem', lineHeight: 1}}>{t("skills")}</span>
                    </div>

                    <div 
                        className={`sidebar-item ${navTab === 'settings' ? 'active' : ''}`} 
                        onClick={() => switchTool('settings')}
                        style={{flexDirection: 'column', padding: '10px 0', width: '100%', gap: '4px', borderLeft: 'none', borderRight: navTab === 'settings' ? '3px solid var(--primary-color)' : '3px solid transparent', justifyContent: 'center'}}
                        title={t("settings")}
                    >
                        <span className="sidebar-icon" style={{margin: 0, fontSize: '1.2rem'}}>⚙️</span>
                        <span style={{fontSize: '0.65rem', lineHeight: 1}}>{t("settings")}</span>
                    </div>
                    <div 
                        className={`sidebar-item ${navTab === 'about' ? 'active' : ''}`} 
                        onClick={() => switchTool('about')}
                        style={{flexDirection: 'column', padding: '10px 0', width: '100%', gap: '4px', borderLeft: 'none', borderRight: navTab === 'about' ? '3px solid var(--primary-color)' : '3px solid transparent', justifyContent: 'center'}}
                        title={t("about")}
                    >
                        <span className="sidebar-icon" style={{margin: 0, fontSize: '1.2rem'}}>ℹ️</span>
                        <span style={{fontSize: '0.65rem', lineHeight: 1}}>{t("about")}</span>
                    </div>
                </div>

                {/* Right Tool List */}
                <div style={{flex: 1, padding: '10px', overflowY: 'auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column'}}>
                    <div style={{marginBottom: '15px', fontSize: '1.1rem', fontWeight: 'bold', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <span style={{
                            background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block'
                        }}>AICoder</span>
                    </div>
                    
                    <div className="tool-grid" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '4px'}}>
                        <div className={`sidebar-item ${navTab === 'claude' ? 'active' : ''}`} onClick={() => switchTool('claude')}>
                            <span className="sidebar-icon">
                                <img src={claudecodeIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="Claude" />
                            </span> <span>Claude Code</span>
                        </div>
                        {config?.show_gemini !== false && (
                        <div className={`sidebar-item ${navTab === 'gemini' ? 'active' : ''}`} onClick={() => switchTool('gemini')}>
                            <span className="sidebar-icon">
                                <img src={geminiIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="Gemini" />
                            </span> <span>Gemini CLI</span>
                        </div>
                        )}
                        {config?.show_codex !== false && (
                        <div className={`sidebar-item ${navTab === 'codex' ? 'active' : ''}`} onClick={() => switchTool('codex')}>
                            <span className="sidebar-icon">
                                <img src={codexIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="Codex" />
                            </span> <span>CodeX</span>
                        </div>
                        )}
                        {config?.show_opencode !== false && (
                        <div className={`sidebar-item ${navTab === 'opencode' ? 'active' : ''}`} onClick={() => switchTool('opencode')}>
                            <span className="sidebar-icon">
                                <img src={opencodeIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="OpenCode" />
                            </span> <span>OpenCode</span>
                        </div>
                        )}
                        {config?.show_codebuddy !== false && (
                        <div className={`sidebar-item ${navTab === 'codebuddy' ? 'active' : ''}`} onClick={() => switchTool('codebuddy')}>
                            <span className="sidebar-icon">
                                <img src={codebuddyIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="CodeBuddy" />
                            </span> <span>CodeBuddy</span>
                        </div>
                        )}
                        {config?.show_iflow !== false && (
                        <div className={`sidebar-item ${navTab === 'iflow' ? 'active' : ''}`} onClick={() => switchTool('iflow')}>
                            <span className="sidebar-icon">
                                <img src={iflowIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="iFlow" />
                            </span> <span>iFlow CLI</span>
                        </div>
                        )}
                        {config?.show_qoder !== false && (
                        <div className={`sidebar-item ${navTab === 'qoder' ? 'active' : ''}`} onClick={() => switchTool('qoder')}>
                            <span className="sidebar-icon">
                                <img src={qoderIcon} style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle'}} alt="Qoder" />
                            </span> <span>Qoder CLI</span>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="main-container">
                <div className="top-header" style={{'--wails-draggable': 'no-drag'} as any}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <h2 style={{margin: 0, fontSize: '1.1rem', color: '#60a5fa', fontWeight: 'bold', marginLeft: '20px', '--wails-draggable': 'drag', flex: 1, display: 'flex', alignItems: 'center'} as any}>
                            <span>
                            {navTab === 'message' ? t("message") :
                             navTab === 'claude' ? 'Claude Code' :
                             navTab === 'gemini' ? 'Gemini CLI' :
                             navTab === 'codex' ? 'OpenAI Codex' :
                             navTab === 'opencode' ? 'OpenCode AI' :
                             navTab === 'codebuddy' ? 'CodeBuddy AI' :
                             navTab === 'qoder' ? 'Qoder CLI' :
                             navTab === 'iflow' ? 'iFlow CLI' :
                             navTab === 'projects' ? t("projectManagement") :
                             navTab === 'skills' ? t("skills") :
                             navTab === 'settings' ? t("globalSettings") : t("about")}
                            </span>
                            {(navTab === 'claude' || navTab === 'gemini' || navTab === 'codex' || navTab === 'opencode' || navTab === 'codebuddy' || navTab === 'qoder' || navTab === 'iflow') && (
                                <>
                                    <button 
                                        className="btn-link" 
                                        onClick={() => setShowModelSettings(true)}
                                        style={{
                                            marginLeft: '10px', 
                                            padding: '2px 8px', 
                                            fontSize: '0.8rem',
                                            borderColor: '#60a5fa', 
                                            color: '#60a5fa',
                                            '--wails-draggable': 'no-drag'
                                        } as any}
                                    >
                                        {lang === 'zh-Hans' || lang === 'zh-Hant' ? '服务商配置' : 'Provider Config'}
                                    </button>
                                    {navTab === 'claude' && (
                                        <button 
                                            className="btn-link" 
                                            onClick={() => {
                                                setSelectedSkillsToInstall([]);
                                                setShowInstallSkillModal(true);
                                            }}
                                            style={{
                                                marginLeft: '10px', 
                                                padding: '2px 8px', 
                                                fontSize: '0.8rem',
                                                borderColor: '#10b981', 
                                                color: '#10b981',
                                                '--wails-draggable': 'no-drag'
                                            } as any}
                                        >
                                            {t("installSkills")}
                                        </button>
                                    )}
                                </>
                            )}
                            {navTab === 'skills' && (
                                <div style={{display: 'flex', gap: '10px', marginLeft: '10px', alignItems: 'center'}}>
                                    <button 
                                        className="btn-link" 
                                        onClick={() => {
                                            setNewSkillName("");
                                            setNewSkillDesc("");
                                            setNewSkillType("address");
                                            setNewSkillValue("");
                                            setShowAddSkillModal(true);
                                        }}
                                        style={{
                                            padding: '2px 8px', 
                                            fontSize: '0.8rem',
                                            borderColor: '#60a5fa', 
                                            color: '#60a5fa',
                                            '--wails-draggable': 'no-drag'
                                        } as any}
                                    >
                                        {t("addSkill")}
                                    </button>
                                    <button 
                                        className="btn-link"
                                        disabled={!selectedSkill}
                                        style={{
                                            padding: '2px 8px', 
                                            fontSize: '0.8rem',
                                            opacity: selectedSkill ? 1 : 0.5, 
                                            cursor: selectedSkill ? 'pointer' : 'not-allowed',
                                            borderColor: '#ef4444',
                                            color: '#ef4444',
                                            '--wails-draggable': 'no-drag'
                                        } as any}
                                        onClick={() => {
                                            if (selectedSkill) handleDeleteSkill(selectedSkill);
                                        }}
                                    >
                                        {t("delete")}
                                    </button>
                                </div>
                            )}
                        </h2>
                        <div style={{display: 'flex', gap: '10px', '--wails-draggable': 'no-drag', marginRight: '5px', pointerEvents: 'auto', position: 'relative', zIndex: 10000} as any}>
                            <button
                                onMouseDown={handleWindowHide}
                                className="btn-hide"
                                style={{'--wails-draggable': 'no-drag', pointerEvents: 'auto', cursor: 'pointer', position: 'relative', zIndex: 10001} as any}
                            >
                                {t("hide")}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`main-content ${navTab === 'tutorial' || navTab === 'message' ? 'elegant-scrollbar' : 'no-scrollbar'} ${navTab === 'settings' || navTab === 'about' ? '' : ''}`} style={{overflowY: 'auto', paddingBottom: '20px'}}>
                                                            {navTab === 'message' && (
                                                                <div style={{
                                                                    width: '100%', 
                                                                    padding: '0 15px', 
                                                                    boxSizing: 'border-box'
                                                                }}>
                                                                    <div style={{
                                                                        display: 'flex', 
                                                                        flexDirection: 'column',
                                                                        gap: '8px',
                                                                        marginBottom: '5px',
                                                                        position: 'relative'
                                                                    }}>                                                                                                                                            <div style={{display: 'flex', gap: '10px', width: '85%', margin: '0 auto', justifyContent: 'space-between'}}>
                                                                                                                                                <button className="btn-link" style={{flex: 1, justifyContent: 'center', height: '20px', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px'}} onClick={async () => {
                                                                                                                                                    try {
                                                                                                                                                        setRefreshStatus(t("refreshing"));
                                                                                                                                                        // Clear content first to ensure re-render
                                                                                                                                                        setBbsContent('');
                                                                                                                                                        const startTime = Date.now();
                                                                                                                                                        const content = await ReadBBS();
                                                                                                                                                        const elapsed = Date.now() - startTime;
                                                                                                            
                                                                                                                                                        // 获取内容前50个字符作为摘要
                                                                                                                                                        const preview = content.substring(0, 50).replace(/\n/g, ' ');
                                                                                                                                                        const now = new Date();
                                                                                                                                                        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                                                                                                            
                                                                                                                                                        setRefreshStatus(t("refreshSuccess"));
                                                                                                                                                        // Set new content and increment key to force re-render
                                                                                                                                                        setBbsContent(content);
                                                                                                                                                        setRefreshKey(prev => prev + 1);
                                                                                                                                                        setLastUpdateTime(timeStr);
                                                                                                                                                        setTimeout(() => setRefreshStatus(''), 5000);
                                                                                                                                                    } catch (err) {
                                                                                                                                                        setRefreshStatus(t("refreshFailed") + err);
                                                                                                                                                        setTimeout(() => setRefreshStatus(''), 5000);
                                                                                                                                                    }
                                                                                                                                                }}>{t("refreshMessage")}</button>
                                                                                                                                                <button className="btn-link" style={{flex: 1, justifyContent: 'center', height: '20px', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px'}} onClick={() => BrowserOpenURL("https://www.bilibili.com/video/BV1wmvoBnEF1")}>{t("introVideo")}</button>
                                                                                                                                                <button className="btn-link" style={{flex: 1, justifyContent: 'center', height: '20px', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px'}} onClick={() => {
                                                                                                                                                    const manualUrl = (lang === 'zh-Hans' || lang === 'zh-Hant')
                                                                                                                                                        ? "https://github.com/RapidAI/aicoder/blob/main/UserManual_CN.md"
                                                                                                                                                        : "https://github.com/RapidAI/aicoder/blob/main/UserManual_EN.md";
                                                                                                                                                    BrowserOpenURL(manualUrl);
                                                                                                                                                }}>{t("manual")}</button>
                                                                                                                                                <button className="btn-link" style={{flex: 1, justifyContent: 'center', height: '20px', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px'}} onClick={() => BrowserOpenURL("https://github.com/BIT-ENGD/cs146s_cn")}>{t("cs146s")}</button>
                                                                                                                                                <button className="btn-link" style={{flex: 1, justifyContent: 'center', height: '20px', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px'}} onClick={handleShowThanks}>{t("thanks")}</button>
                                                                                                                                            </div>                                                                                                            
                                                                                                            {refreshStatus && (
                                                                                                                <div style={{
                                                                                                                    position: 'absolute',
                                                                                                                    top: '35px',
                                                                                                                    right: '0',
                                                                                                                    zIndex: 100,
                                                                                                                    padding: '4px 12px',
                                                                                                                    backgroundColor: 'rgba(224, 242, 254, 0.95)',
                                                                                                                    borderRadius: '16px',
                                                                                                                    color: '#0369a1',
                                                                                                                    fontSize: '0.75rem',
                                                                                                                    fontWeight: 'bold',
                                                                                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                                                                                    backdropFilter: 'blur(4px)',
                                                                                                                    animation: 'fadeIn 0.3s ease-out'
                                                                                                                }}>
                                                                                                                    {refreshStatus}
                                                                                                                </div>
                                                                                                            )}
                                                                            
                                                                                                            {lastUpdateTime && !refreshStatus && (
                                                                                                                <div style={{
                                                                                                                    position: 'absolute',
                                                                                                                    top: '35px',
                                                                                                                    right: '0',
                                                                                                                    zIndex: 90,
                                                                                                                    padding: '4px 10px',
                                                                                                                    backgroundColor: 'rgba(240, 253, 244, 0.9)',
                                                                                                                    borderRadius: '4px',
                                                                                                                    color: '#15803d',
                                                                                                                    fontSize: '0.7rem',
                                                                                                                    backdropFilter: 'blur(2px)'
                                                                                                                }}>
                                                                                                                    {t("lastUpdate")}{lastUpdateTime}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>                    
                                                <div className="markdown-content" style={{
                                                    backgroundColor: '#fff',
                                                    padding: '20px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    fontFamily: 'inherit',
                                                    fontSize: '0.75rem',
                                                    lineHeight: '1.6',
                                                    color: '#374151',
                                                    marginBottom: '20px',
                                                    textAlign: 'left'
                                                }}>
                                                    <ReactMarkdown
                                                        key={refreshKey}
                                                        remarkPlugins={[remarkGfm]}
                                                        // @ts-ignore - rehype-raw type compatibility
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            a: ({node, ...props}) => (
                                                                <a 
                                                                    {...props} 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (props.href) BrowserOpenURL(props.href);
                                                                    }}
                                                                    style={{cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline'}}
                                                                />
                                                            )
                                                        }}
                                                    >
                                                        {bbsContent}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                        {showThanksModal && (
                <div className="modal-backdrop">
                    <div className="modal-content elegant-scrollbar" style={{width: '80%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
                        <div className="modal-header">
                            <h3 style={{margin: 0}}>{t("thanks")}</h3>
                            <button onClick={() => setShowThanksModal(false)} className="btn-close">&times;</button>
                        </div>
                        <div className="modal-body markdown-content" style={{textAlign: 'left', fontSize: '0.8rem'}}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                // @ts-ignore
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    a: ({node, ...props}) => (
                                        <a
                                            {...props}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (props.href) BrowserOpenURL(props.href);
                                            }}
                                            style={{cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline'}}
                                        />
                                    )
                                }}
                            >
                                {thanksContent}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
                                        {navTab === 'tutorial' && (
                                            <div style={{
                                                width: '100%', 
                                                padding: '0 15px', 
                                                boxSizing: 'border-box'
                                            }}>
                                                <div style={{
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    marginBottom: '5px',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{display: 'flex', gap: '10px', width: '70%', margin: '0 auto', justifyContent: 'space-between'}}>
                                                        <button className="btn-link" style={{flex: 1, justifyContent: 'center', height: '20px', fontSize: '0.7rem', padding: '0 5px', borderRadius: '10px'}} onClick={async () => {
                                                            try {
                                                                setRefreshStatus(t("refreshing"));
                                                                setTutorialContent('');
                                                                const content = await ReadTutorial();
                                                                setRefreshStatus(t("refreshSuccess"));
                                                                setTutorialContent(content);
                                                                setRefreshKey(prev => prev + 1);
                                                                setTimeout(() => setRefreshStatus(''), 5000);
                                                            } catch (err) {
                                                                setRefreshStatus(t("refreshFailed") + err);
                                                                setTimeout(() => setRefreshStatus(''), 5000);
                                                            }
                                                        }}>{t("refreshMessage")}</button>
                                                    </div>

                                                    {refreshStatus && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '35px',
                                                            right: '0',
                                                            zIndex: 100,
                                                            padding: '4px 12px',
                                                            backgroundColor: 'rgba(224, 242, 254, 0.95)',
                                                            borderRadius: '16px',
                                                            color: '#0369a1',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                            backdropFilter: 'blur(4px)',
                                                            animation: 'fadeIn 0.3s ease-out'
                                                        }}>
                                                            {refreshStatus}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="markdown-content" style={{
                                                    backgroundColor: '#fff',
                                                    padding: '20px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    fontFamily: 'inherit',
                                                    fontSize: '0.75rem',
                                                    lineHeight: '1.6',
                                                    color: '#374151',
                                                    marginBottom: '20px',
                                                    textAlign: 'left'
                                                }}>
                                                    <ReactMarkdown
                                                        key={refreshKey}
                                                        remarkPlugins={[remarkGfm]}
                                                        // @ts-ignore - rehype-raw type compatibility
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            a: ({node, ...props}) => (
                                                                <a 
                                                                    {...props} 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        if (props.href) BrowserOpenURL(props.href);
                                                                    }}
                                                                    style={{cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline'}}
                                                                />
                                                            )
                                                        }}
                                                    >
                                                        {tutorialContent}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                    {navTab === 'skills' && (
                        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                            <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
                                {skills.length === 0 ? (
                                    <div style={{textAlign: 'center', color: '#6b7280', marginTop: '40px'}}>{t("noSkills")}</div>
                                ) : (
                                    <div className="skills-list" style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                                        {skills.map((skill, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => setSelectedSkill(skill.name)}
                                                onContextMenu={(e) => handleSkillContext(e, skill.name)}
                                                style={{
                                                    border: selectedSkill === skill.name ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    padding: '10px',
                                                    backgroundColor: selectedSkill === skill.name ? '#f0f9ff' : '#fff',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    cursor: 'default',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                    <span style={{fontWeight: 'bold', fontSize: '1.05rem'}}>{skill.name}</span>
                                                </div>
                                                <div 
                                                    style={{
                                                        fontSize: '0.85rem', 
                                                        color: '#6b7280', 
                                                        whiteSpace: 'nowrap', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis'
                                                    }} 
                                                    title={skill.description}
                                                >
                                                    {skill.description}
                                                </div>
                                                <div style={{fontSize: '0.75rem', color: '#9ca3af', display: 'flex', gap: '10px', marginTop: '2px'}}>
                                                    <span style={{backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px'}}>
                                                        {skill.type === 'address' ? t("skillAddress") : t("skillZip")}
                                                    </span>
                                                    <span style={{fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px'}}>
                                                        {skill.value}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {skillContextMenu.visible && (
                                <div style={{
                                    position: 'fixed',
                                    top: skillContextMenu.y,
                                    left: skillContextMenu.x,
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 3000,
                                    padding: '5px 0',
                                    minWidth: '120px'
                                }}>
                                    <div className="context-menu-item" onClick={() => {
                                        if (skillContextMenu.skillName) handleDeleteSkill(skillContextMenu.skillName);
                                        setSkillContextMenu({...skillContextMenu, visible: false});
                                    }}>
                                        {t("delete")}
                                    </div>
                                </div>
                            )}

                            {showAddSkillModal && (
                                <div className="modal-backdrop">
                                    <div className="modal-content" style={{width: '90%', maxWidth: '500px'}}>
                                        <div className="modal-header">
                                            <h3>{t("addSkill")}</h3>
                                            <button onClick={() => setShowAddSkillModal(false)} className="btn-close">&times;</button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="form-group">
                                                <label>{t("skillType")}</label>
                                                <div style={{display: 'flex', gap: '20px', marginTop: '5px'}}>
                                                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                                                        <input 
                                                            type="radio" 
                                                            checked={newSkillType === 'address'} 
                                                            onChange={() => setNewSkillType('address')}
                                                        /> {t("skillAddress")}
                                                    </label>
                                                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                                                        <input 
                                                            type="radio" 
                                                            checked={newSkillType === 'zip'} 
                                                            onChange={() => setNewSkillType('zip')}
                                                        /> {t("skillZip")}
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label>{t("skillName")}</label>
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    value={newSkillName}
                                                    onChange={(e) => setNewSkillName(e.target.value)}
                                                    placeholder={t("placeholderName")}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>{t("skillDesc")}</label>
                                                <textarea 
                                                    className="form-input" 
                                                    value={newSkillDesc}
                                                    onChange={(e) => setNewSkillDesc(e.target.value)}
                                                    rows={3}
                                                    placeholder={t("placeholderDesc")}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>{t("skillValue")}</label>
                                                {newSkillType === 'address' ? (
                                                    <input 
                                                        type="text" 
                                                        className="form-input" 
                                                        value={newSkillValue}
                                                        onChange={(e) => setNewSkillValue(e.target.value)}
                                                        placeholder={t("placeholderAddress")}
                                                    />
                                                ) : (
                                                    <div style={{display: 'flex', gap: '10px'}}>
                                                        <input 
                                                            type="text" 
                                                            className="form-input" 
                                                            value={newSkillValue}
                                                            readOnly
                                                            placeholder={t("placeholderZip")}
                                                        />
                                                        <button 
                                                            className="btn-secondary" 
                                                            onClick={async () => {
                                                                const path = await SelectSkillFile();
                                                                if (path) setNewSkillValue(path);
                                                            }}
                                                        >
                                                            {t("browse")}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn-secondary" onClick={() => setShowAddSkillModal(false)}>{t("cancel")}</button>
                                            <button className="btn-primary" onClick={async () => {
                                                if (!newSkillName || !newSkillValue) {
                                                    showToastMessage(t("skillRequiredError"));
                                                    return;
                                                }
                                                try {
                                                    await AddSkill(newSkillName, newSkillDesc, newSkillType, newSkillValue);
                                                    setShowAddSkillModal(false);
                                                    const list = await ListSkills();
                                                    setSkills(list || []);
                                                    showToastMessage(t("skillAdded"));
                                                } catch (err) {
                                                    showToastMessage(t("skillAddError").replace("{error}", err as string));
                                                }
                                            }}>{t("confirm")}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                        {(navTab === 'claude' || navTab === 'gemini' || navTab === 'codex' || navTab === 'opencode' || navTab === 'codebuddy' || navTab === 'qoder' || navTab === 'iflow') && (
                            <ToolConfiguration 
                                toolName={navTab} 
                                toolCfg={toolCfg} 
                                showModelSettings={showModelSettings}
                                setShowModelSettings={setShowModelSettings}
                                handleModelSwitch={handleModelSwitch}
                                t={t} 
                            />
                        )}
                    {navTab === 'projects' && (
                        <div style={{padding: '5px 10px'}}>
                             <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                                <button
                                    onClick={() => switchTool(activeTool)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        color: 'var(--primary-color)',
                                        padding: '0 4px'
                                    }}
                                    title="Back"
                                >&lt;&lt;</button>
                                <button className="btn-primary" style={{padding: '3px 12px', fontSize: '0.85rem'}} onClick={handleAddNewProject}>{t("addNewProject")}</button>
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {config && config.projects && config.projects.map((proj: any) => (
                                    <div key={proj.id} style={{
                                        padding: '6px 12px', 
                                        backgroundColor: '#fff', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                                                                                                                <input
                                                                                                                                    type="text"
                                                                                                                                    className="form-input"
                                                                                                                                    data-field="project-item-name"
                                                                                                                                    data-id={proj.id}
                                                                                                                                    value={proj.name}
                                                                                                                                    onChange={(e) => {
                                                                                                                                        const newList = config.projects.map((p: any) => p.id === proj.id ? {...p, name: e.target.value} : p);
                                                                                                                                        setConfig(new main.AppConfig({...config, projects: newList}));
                                                                                                                                    }}
                                                                                                                                    onContextMenu={(e) => handleContextMenu(e, e.currentTarget)}
                                                                                                                                    style={{fontWeight: 'bold', border: 'none', padding: 0, fontSize: '1rem', width: '120px', flexShrink: 0}}
                                                                                                                                    spellCheck={false}
                                                                                                                                    autoComplete="off"
                                                                                                                                />                                        <div style={{flex: 1, fontSize: '0.85rem', color: '#6b7280', backgroundColor: '#f9fafb', padding: '6px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                            {proj.path}
                                        </div>

                                        <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0}}>

                                            <button className="btn-link" onClick={() => {
                                                SelectProjectDir().then(dir => {
                                                    if (dir) {
                                                        const newList = config.projects.map((p: any) => p.id === proj.id ? {...p, path: dir} : p);
                                                        const newConfig = new main.AppConfig({...config, projects: newList});
                                                        setConfig(newConfig);
                                                        SaveConfig(newConfig);
                                                    }
                                                });
                                            }}>{t("change")}</button>
                                            
                                            <button 
                                                style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem'}}
                                                onClick={() => {
                                                    if (config.projects.length > 1) {
                                                        const newList = config.projects.filter((p: any) => p.id !== proj.id);
                                                        const newConfig = new main.AppConfig({...config, projects: newList});
                                                        if (config.current_project === proj.id) newConfig.current_project = newList[0].id;
                                                        setConfig(newConfig);
                                                        SaveConfig(newConfig);
                                                    }
                                                }}
                                            >
                                                {t("delete")}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {navTab === 'settings' && (
                        <div style={{padding: '10px'}}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '25px'}}>
                                <div className="form-group" style={{flex: '1', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <label className="form-label" style={{marginBottom: 0, whiteSpace: 'nowrap', fontSize: '0.8rem'}}>{t("language")}</label>
                                    <select value={lang} onChange={handleLangChange} className="form-input" style={{width: 'auto', fontSize: '0.8rem', padding: '2px 8px', height: '28px'}}>
                                        <option value="en">English</option>
                                        <option value="zh-Hans">简体中文</option>
                                        <option value="zh-Hant">繁體中文</option>
                                    </select>
                                </div>
                                <button 
                                    className="btn-link" 
                                    onClick={() => switchTool('projects')}
                                    style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 12px', border: '1px solid var(--border-color)', height: '24px', borderRadius: '12px', fontSize: '0.7rem'}}
                                >
                                    <span>📂</span> {t("manageProjects")}
                                </button>
                                {!isWindows && (
                                    <button
                                        className="btn-link"
                                        onClick={() => {
                                            setProxyEditMode('global');
                                            setShowProxySettings(true);
                                        }}
                                        style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 12px', border: '1px solid var(--border-color)', height: '24px', borderRadius: '12px', fontSize: '0.7rem'}}
                                    >
                                        <span>🌐</span> {t("proxySettings")}
                                    </button>
                                )}
                            </div>

                            <div className="form-group" style={{marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'}}>
                                <h4 style={{fontSize: '0.8rem', color: '#60a5fa', marginBottom: '12px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.025em'}}>{lang === 'zh-Hans' ? '工具显示' : lang === 'zh-Hant' ? '工具顯示' : 'Tool Visibility'}</h4>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px'}}>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={config?.show_gemini !== false}
                                            onChange={(e) => {
                                                if (config) {
                                                    const newConfig = new main.AppConfig({...config, show_gemini: e.target.checked});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                        <span style={{fontSize: '0.8rem', color: '#4b5563'}}>Gemini CLI</span>
                                    </label>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={config?.show_codex !== false}
                                            onChange={(e) => {
                                                if (config) {
                                                    const newConfig = new main.AppConfig({...config, show_codex: e.target.checked});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                        <span style={{fontSize: '0.8rem', color: '#4b5563'}}>OpenAI Codex</span>
                                    </label>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={config?.show_opencode !== false}
                                            onChange={(e) => {
                                                if (config) {
                                                    const newConfig = new main.AppConfig({...config, show_opencode: e.target.checked});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                        <span style={{fontSize: '0.8rem', color: '#4b5563'}}>OpenCode AI</span>
                                    </label>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={config?.show_codebuddy !== false}
                                            onChange={(e) => {
                                                if (config) {
                                                    const newConfig = new main.AppConfig({...config, show_codebuddy: e.target.checked});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                        <span style={{fontSize: '0.8rem', color: '#4b5563'}}>CodeBuddy</span>
                                    </label>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={config?.show_qoder !== false}
                                            onChange={(e) => {
                                                if (config) {
                                                    const newConfig = new main.AppConfig({...config, show_qoder: e.target.checked});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                        <span style={{fontSize: '0.8rem', color: '#4b5563'}}>Qoder CLI</span>
                                    </label>
                                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                        <input 
                                            type="checkbox" 
                                            checked={config?.show_iflow !== false}
                                            onChange={(e) => {
                                                if (config) {
                                                    const newConfig = new main.AppConfig({...config, show_iflow: e.target.checked});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{width: '16px', height: '16px'}}
                                        />
                                        <span style={{fontSize: '0.8rem', color: '#4b5563'}}>iFlow CLI</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group" style={{marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'}}>
                                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={!config?.hide_startup_popup}
                                        onChange={(e) => {
                                            if (config) {
                                                const newConfig = new main.AppConfig({...config, hide_startup_popup: !e.target.checked});
                                                setConfig(newConfig);
                                                SaveConfig(newConfig);
                                            }
                                        }}
                                        style={{width: '16px', height: '16px'}}
                                    />
                                    <span style={{fontSize: '0.8rem', color: '#374151'}}>{t("showWelcomePage")}</span>
                                </label>
                                <p style={{fontSize: '0.75rem', color: '#64748b', marginLeft: '24px', marginTop: '4px'}}>
                                    {lang === 'zh-Hans' ? '开启后，程序启动时将显示新手教学和快速入门链接' :
                                     lang === 'zh-Hant' ? '開啟後，程序啟動時將顯示新手教學和快速入門鏈接' :
                                     'When enabled, a welcome popup with tutorial links will be shown at startup.'}
                                </p>
                            </div>

                            <div className="form-group" style={{marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '20px'}}>
                                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={config?.pause_env_check}
                                        onChange={(e) => {
                                            if (config) {
                                                const newConfig = new main.AppConfig({...config, pause_env_check: e.target.checked});
                                                setConfig(newConfig);
                                                SaveConfig(newConfig);
                                            }
                                        }}
                                        style={{width: '16px', height: '16px'}}
                                    />
                                    <span style={{fontSize: '0.8rem', color: '#374151'}}>{t("pauseEnvCheck")}</span>
                                </label>
                                <button 
                                    className="btn-link" 
                                    onClick={() => {
                                        setEnvLogs([]);
                                        setShowLogs(true);
                                        setIsLoading(true);
                                        setIsManualCheck(true);
                                        CheckEnvironment(true);
                                    }}
                                    style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', border: '1px solid var(--border-color)', height: '28px', borderRadius: '14px', fontSize: '0.8rem'}}
                                >
                                    <span>🔍</span> {t("recheckEnv")}
                                </button>
                            </div>
                        </div>
                    )}

                    {navTab === 'about' && (
                        <div style={{
                            padding: '20px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            textAlign: 'center',
                            height: '100%',
                            justifyContent: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <img src={appIcon} alt="Logo" style={{width: '64px', height: '64px', marginBottom: '15px'}} />
                                                    <h2 style={{
                                                        margin: '0 0 4px 0',
                                                        background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        display: 'inline-block',
                                                        fontWeight: 'bold'
                                                    }}>RapidAI AICoder</h2>
                                                    <div style={{
                                                        fontSize: '1rem', 
                                                        fontWeight: 'bold',
                                                        background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        marginBottom: '4px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {t("slogan")}
                                                    </div>
                                                    <br/>
                                                    <div style={{
                                                        fontSize: '0.9rem', 
                                                        fontWeight: 'bold',
                                                        background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        marginBottom: '12px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {lang === 'zh-Hans' || lang === 'zh-Hant' ? '真正的Vibe Coder只使用命令行。' : 'Real Vibe Coders only use the command line.'}
                                                    </div>
                                                    <div style={{fontSize: '1rem', color: '#374151', marginBottom: '5px'}}>{t("version")} {APP_VERSION}</div>
                                                    <div style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '5px'}}>{t("businessCooperation")}</div>
                                                    <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px'}}>{t("author")}: Dr. Daniel</div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center'}}>
                                <div style={{display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap'}}>
                                    <button className="btn-link" style={{fontSize: '0.75rem', padding: '2px 6px'}} onClick={() => BrowserOpenURL("https://aicoder.rapidai.tech/")}>{t("officialWebsite")}</button>
                                    <button
                                        className="btn-link"
                                        style={{fontSize: '0.75rem', padding: '2px 6px'}}
                                        onClick={() => {
                                            setStatus(t("checkingUpdate"));
                                            CheckUpdate(APP_VERSION).then(res => {
                                                console.log("CheckUpdate result:", res);
                                                setUpdateResult(res);
                                                setIsStartupUpdateCheck(false);
                                                setShowUpdateModal(true);
                                                setStatus("");
                                            }).catch(err => {
                                                console.error("CheckUpdate error:", err);
                                                setStatus("检查更新失败: " + err);
                                                // 显示一个错误结果
                                                setUpdateResult({
                                                    has_update: false,
                                                    latest_version: "获取失败",
                                                    release_url: ""
                                                });
                                                setIsStartupUpdateCheck(false);
                                                setShowUpdateModal(true);
                                            });
                                        }}
                                    >
                                        {t("onlineUpdate")}
                                    </button>
                                    <button className="btn-link" style={{fontSize: '0.75rem', padding: '2px 6px'}} onClick={() => setShowInstallLog(true)}>{t("installLog")}</button>
                                    <button className="btn-link" style={{fontSize: '0.75rem', padding: '2px 6px'}} onClick={() => BrowserOpenURL("https://github.com/RapidAI/aicoder/issues/new")}>{t("bugReport")}</button>
                                    <button className="btn-link" style={{fontSize: '0.75rem', padding: '2px 6px'}} onClick={() => BrowserOpenURL("https://github.com/RapidAI/aicoder")}>GitHub</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Action Bar (Footer) */}
                {config && (navTab === 'claude' || navTab === 'gemini' || navTab === 'codex' || navTab === 'opencode' || navTab === 'codebuddy' || navTab === 'qoder' || navTab === 'iflow') && (
                    <div className="global-action-bar">
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', padding: '2px 0'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'flex-start'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>{t("runnerStatus")}:</span>
                                    <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa', textTransform: 'capitalize'}}>{activeTool}</span>
                                    <span style={{color: '#d1d5db'}}>|</span>
                                    <span 
                                        style={{fontSize: '0.85rem', fontWeight: 600, color: '#374151'}}
                                        title={(config as any)[activeTool].current_model === "Original" ? t("original") : (config as any)[activeTool].current_model}
                                    >
                                        {(() => {
                                            const modelName = (config as any)[activeTool].current_model === "Original" ? t("original") : (config as any)[activeTool].current_model;
                                            return modelName.length > 10 ? `${modelName.slice(0, 4)}...${modelName.slice(-4)}` : modelName;
                                        })()}
                                    </span>
                                </div>
                                                                <label style={{display:'flex', alignItems:'center', cursor:'pointer', fontSize: '0.8rem', color: '#6b7280'}}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.yolo_mode || false}
                                                                        onChange={(e) => {
                                                                            const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                                                            if (proj) {
                                                                                const isWindows = /window/i.test(navigator.userAgent);
                                                                                const newProjects = config.projects.map((p: any) => {
                                                                                    if (p.id === proj.id) {
                                                                                        const updated = { ...p, yolo_mode: e.target.checked };
                                                                                        // On non-Windows, yolo and admin are mutually exclusive
                                                                                        if (!isWindows && e.target.checked) {
                                                                                            updated.admin_mode = false;
                                                                                        }
                                                                                        return updated;
                                                                                    }
                                                                                    return p;
                                                                                });
                                                                                const newConfig = new main.AppConfig({...config, projects: newProjects});
                                                                                setConfig(newConfig);
                                                                                SaveConfig(newConfig);
                                                                            }
                                                                        }}
                                                                        style={{marginRight: '6px'}}
                                                                    />
                                                                    <span>{t("yoloModeLabel")}</span>
                                                                    {config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.yolo_mode && (
                                                                        <span style={{
                                                                            marginLeft: '2px',
                                                                            backgroundColor: '#fee2e2',
                                                                            color: '#ef4444',
                                                                            padding: '0 4px',
                                                                            borderRadius: '3px',
                                                                            fontSize: '0.6rem',
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                            {t("danger")}
                                                                        </span>
                                                                    )}
                                                                </label>
                                                                    {!isWindows && (
                                                                    <label style={{display:'flex', alignItems:'center', cursor:'pointer', fontSize: '0.8rem', color: '#6b7280'}}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.use_proxy || false}
                                                                            onChange={(e) => {
                                                                                const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                                                                if (proj) {
                                                                                    // If checking but not configured, show dialog
                                                                                    if (e.target.checked && !proj.proxy_host && !config?.default_proxy_host) {
                                                                                        setProxyEditMode('project');
                                                                                        setShowProxySettings(true);
                                                                                        return;
                                                                                    }
                                
                                                                                    const newProjects = config.projects.map((p: any) =>
                                                                                        p.id === proj.id ? { ...p, use_proxy: e.target.checked } : p
                                                                                    );
                                                                                    const newConfig = new main.AppConfig({...config, projects: newProjects});
                                                                                    setConfig(newConfig);
                                                                                    SaveConfig(newConfig);
                                                                                }
                                                                            }}
                                                                            style={{marginRight: '6px'}}
                                                                        />
                                                                        <span>{t("proxyMode")}</span>
                                                                        <span 
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                setProxyEditMode('project');
                                                                                setShowProxySettings(true);
                                                                            }}
                                                                            style={{marginLeft: '4px', cursor: 'pointer', opacity: 0.7}}
                                                                            title={t("proxySettings")}
                                                                        >
                                                                            ⚙️
                                                                        </span>
                                                                    </label>
                                                                    )}
                                                            </div>
                                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '15px'}}>
                                                                <label style={{display:'flex', alignItems:'center', cursor:'pointer', fontSize: '0.8rem', color: '#6b7280'}}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.admin_mode || false}
                                                                        onChange={(e) => {
                                                                            const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                                                            if (proj) {
                                                                                const isWindows = /window/i.test(navigator.userAgent);
                                                                                const newProjects = config.projects.map((p: any) => {
                                                                                    if (p.id === proj.id) {
                                                                                        const updated = { ...p, admin_mode: e.target.checked };
                                                                                        // On non-Windows, yolo and admin are mutually exclusive
                                                                                        if (!isWindows && e.target.checked) {
                                                                                            updated.yolo_mode = false;
                                                                                        }
                                                                                        return updated;
                                                                                    }
                                                                                    return p;
                                                                                });
                                                                                const newConfig = new main.AppConfig({...config, projects: newProjects});
                                                                                setConfig(newConfig);
                                                                                SaveConfig(newConfig);
                                                                            }
                                                                        }}
                                                                        style={{marginRight: '6px'}}
                                                                    />
                                                                    <span>{/window/i.test(navigator.userAgent) ? t("adminModeLabel") : t("rootModeLabel")}</span>
                                                                </label>
                                                                <label style={{display:'flex', alignItems:'center', cursor:'pointer', fontSize: '0.8rem', color: '#6b7280'}}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.python_project || false}
                                                                        onChange={(e) => {
                                                                            const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                                                            if (proj) {
                                                                                const newProjects = config.projects.map((p: any) =>
                                                                                    p.id === proj.id ? { ...p, python_project: e.target.checked } : p
                                                                                );
                                                                                const newConfig = new main.AppConfig({...config, projects: newProjects});
                                                                                setConfig(newConfig);
                                                                                SaveConfig(newConfig);
                                                                            }
                                                                        }}
                                                                        style={{marginRight: '6px'}}
                                                                    />
                                                                    <span>{t("pythonProjectLabel")}</span>
                                                                </label>
                                                                {config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.python_project && (
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span style={{fontSize: '0.8rem', color: '#6b7280'}}>{t("pythonEnvLabel")}:</span>
                                        <select
                                            value={config?.projects?.find((p: any) => p.id === selectedProjectForLaunch)?.python_env || ""}
                                            onChange={(e) => {
                                                const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                                if (proj) {
                                                    const newProjects = config.projects.map((p: any) =>
                                                        p.id === proj.id ? { ...p, python_env: e.target.value } : p
                                                    );
                                                    const newConfig = new main.AppConfig({...config, projects: newProjects});
                                                    setConfig(newConfig);
                                                    SaveConfig(newConfig);
                                                }
                                            }}
                                            style={{
                                                padding: '5px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #d1d5db',
                                                backgroundColor: '#ffffff',
                                                fontSize: '0.85rem',
                                                color: '#374151',
                                                cursor: 'pointer',
                                                maxWidth: '200px'
                                            }}
                                        >
                                            {pythonEnvironments.map((env: any, index: number) => (
                                                <option key={index} value={env.name}>
                                                    {env.name} {env.type === 'conda' ? '(Conda)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span style={{fontSize: '0.8rem', color: '#6b7280'}}>{t("project")}:</span>
                                        <select
                                            value={selectedProjectForLaunch}
                                            onChange={(e) => setSelectedProjectForLaunch(e.target.value)}
                                            style={{
                                                padding: '5px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #d1d5db',
                                                backgroundColor: '#ffffff',
                                                fontSize: '0.85rem',
                                                color: '#374151',
                                                cursor: 'pointer',
                                                maxWidth: '200px'
                                            }}
                                        >
                                            {config?.projects?.map((proj: any) => (
                                                <option key={proj.id} value={proj.id}>
                                                    {proj.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => switchTool('projects')}
                                        style={{
                                            padding: '0',
                                            height: '20px',
                                            borderRadius: '6px',
                                            border: '1px solid #d1d5db',
                                            backgroundColor: '#f3f4f6',
                                            color: '#6b7280',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'normal',
                                            textAlign: 'center',
                                            width: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                                            e.currentTarget.style.color = '#4b5563';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            e.currentTarget.style.color = '#6b7280';
                                        }}
                                    >
                                        ...
                                    </button>
                                </div>
                                <button
                                    className="btn-launch"
                                    style={{padding: '8px 24px', textAlign: 'center'}}
                                    onClick={() => {
                                        console.log("Launch button clicked. activeTool:", activeTool);
                                        const selectedProj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        if (selectedProj) {
                                            console.log("Launching tool with project:", selectedProj.name, "path:", selectedProj.path);
                                            setStatus(lang === 'zh-Hans' ? "正在启动..." : "Launching...");
                                            LaunchTool(activeTool, selectedProj.yolo_mode, selectedProj.admin_mode || false, selectedProj.python_project || false, selectedProj.python_env || "", selectedProj.path || "", selectedProj.use_proxy || false)
                                                .then(() => {
                                                    console.log("LaunchTool call returned successfully");
                                                    setTimeout(() => setStatus(""), 2000);
                                                })
                                                .catch(err => {
                                                    console.error("LaunchTool call failed:", err);
                                                    setStatus("Error: " + err);
                                                });
                                            // Update current project if different
                                            if (selectedProjectForLaunch !== config?.current_project) {
                                                handleProjectSwitch(selectedProjectForLaunch);
                                            }
                                        } else {
                                            console.error("No project found for launch ID:", selectedProjectForLaunch);
                                            setStatus(t("projectDirError"));
                                        }
                                    }}
                                >
                                    <span style={{marginRight: '6px'}}>➤</span>{t("launch")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="status-message" style={{padding: '0 20px 4px 20px', minHeight: '20px'}}>
                    <span key={status} style={{color: (status.includes("Error") || status.includes("!") || status.includes("first")) ? '#ef4444' : '#10b981'}}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Modals */}
            {showAbout && (
                <div className="modal-overlay" onClick={() => setShowAbout(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAbout(false)}>&times;</button>
                        <img src={appIcon} alt="Logo" style={{width: '64px', height: '64px', marginBottom: '15px'}} />
                        <h3 style={{
                            background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'inline-block',
                            fontWeight: 'bold',
                            margin: '0 0 10px 0'
                        }}>AICoder</h3>
                        <p>Version {APP_VERSION}</p>
                        <button className="btn-primary" onClick={() => BrowserOpenURL("https://github.com/RapidAI/cceasy")}>GitHub</button>
                    </div>
                </div>
            )}

            {showInstallLog && (
                <div className="modal-overlay" onClick={() => setShowInstallLog(false)}>
                    <div className="modal-content" style={{width: '600px', maxWidth: '90vw'}} onClick={e => e.stopPropagation()}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                            <h3 style={{margin: 0, color: '#60a5fa'}}>{t("installLogTitle")}</h3>
                            <button className="modal-close" onClick={() => setShowInstallLog(false)}>&times;</button>
                        </div>
                        <div 
                            className="elegant-scrollbar"
                            style={{
                            backgroundColor: '#1e293b',
                            color: '#e2e8f0',
                            padding: '15px',
                            borderRadius: '8px',
                            height: '250px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'left',
                            marginBottom: '15px'
                        }}>
                            {envLogs.length === 0 ? (
                                <div style={{color: '#94a3b8', fontStyle: 'italic'}}>
                                    {t("initializing")}
                                </div>
                            ) : (
                                envLogs.map((log, index) => {
                                    const isError = /error|failed/i.test(log);
                                    return (
                                        <div key={index} style={{
                                            color: isError ? '#ef4444' : 'inherit',
                                            marginBottom: '4px'
                                        }}>
                                            {isError ? `** ${log}` : log}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                className="btn-link"
                                onClick={() => {
                                    const logText = envLogs.join('\n');
                                    navigator.clipboard.writeText(logText).then(() => {
                                        showToastMessage(t("logsCopied"));
                                    });
                                }}
                            >
                                {t("copyLog")}
                            </button>
                            <button
                                className="btn-link"
                                onClick={async () => {
                                    console.log('Send log button clicked');
                                    const hasError = envLogs.some(log => /error|failed/i.test(log));

                                    if (hasError) {
                                        // 有错误，直接发送
                                        await performSendLog();
                                    } else {
                                        // 没有错误，询问用户
                                        setConfirmDialog({
                                            show: true,
                                            title: t("confirmSendLog"),
                                            message: t("confirmSendLogMessage"),
                                            onConfirm: async () => {
                                                setConfirmDialog({...confirmDialog, show: false});
                                                await performSendLog();
                                            }
                                        });
                                    }
                                }}
                            >
                                {t("sendLog")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUpdateModal && updateResult && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '400px', textAlign: 'left'}}>
                        <h3>{t("foundNewVersion")}</h3>
                        {updateResult.has_update ? (
                            <>
                                <div style={{backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #e0f2fe'}}>
                                    <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px'}}>{t("currentVersion")}</div>
                                    <div style={{fontSize: '1rem', fontWeight: '600', color: '#1e40af', marginBottom: '12px'}}>v{APP_VERSION}</div>
                                    <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px'}}>{t("latestVersion")}</div>
                                    <div style={{fontSize: '1rem', fontWeight: '600', color: '#059669'}}>{updateResult.latest_version}</div>
                                </div>

                                <div style={{marginTop: '15px'}}>
                                    {isDownloading ? (
                                        <div style={{width: '100%'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem'}}>
                                                <span>{t("downloading")}</span>
                                                <span>{downloadProgress}%</span>
                                            </div>
                                            <div style={{width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden'}}>
                                                <div style={{width: `${downloadProgress}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.2s ease'}}></div>
                                            </div>
                                            <button
                                                className="btn-link"
                                                style={{marginTop: '10px', color: '#ef4444'}}
                                                onClick={handleCancelDownload}
                                            >
                                                {t("cancelDownload")}
                                            </button>
                                        </div>
                                    ) : installerPath ? (
                                        <div style={{textAlign: 'center', padding: '10px'}}>
                                            <p style={{color: '#059669', fontWeight: 'bold', marginBottom: '15px'}}>{t("downloadComplete")}</p>
                                            <button className="btn-primary" style={{width: '100%'}} onClick={handleInstall}>
                                                {t("installNow")}
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            {downloadError && (
                                                <div style={{marginBottom: '10px'}}>
                                                    <p style={{color: '#ef4444', fontSize: '0.85rem', marginBottom: '5px'}}>{t("downloadError").replace("{error}", downloadError)}</p>
                                                    <button className="btn-primary" style={{width: '100%', backgroundColor: '#ef4444'}} onClick={handleDownload}>
                                                        {t("retry")}
                                                    </button>
                                                </div>
                                            )}
                                            {!downloadError && (
                                                <>
                                                    <p style={{margin: '10px 0', fontSize: '0.9rem', color: '#374151'}}>{t("foundNewVersionMsg")}</p>
                                                    <button className="btn-primary" style={{width: '100%'}} onClick={handleDownload}>
                                                        {t("downloadAndUpdate")}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div style={{backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '6px', border: '1px solid #e0f2fe'}}>
                                <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px'}}>{t("currentVersion")}</div>
                                <div style={{fontSize: '1rem', fontWeight: '600', color: '#1e40af', marginBottom: '12px'}}>v{APP_VERSION}</div>
                                <div style={{fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px'}}>{t("latestVersion")}</div>
                                <div style={{fontSize: '1rem', fontWeight: '600', color: '#059669', marginBottom: '12px'}}>{updateResult.latest_version}</div>
                                <p style={{margin: '0', fontSize: '0.9rem', color: '#059669', fontWeight: '500'}}>✓ {t("isLatestVersion")}</p>
                            </div>
                        )}
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button className="btn-primary" disabled={isDownloading} onClick={() => {
                                setShowUpdateModal(false);
                                // After closing update modal, show welcome page only if this was a startup check
                                if (isStartupUpdateCheck && config && !config.hide_startup_popup) {
                                    setShowStartupPopup(true);
                                }
                                // Reset the flag
                                setIsStartupUpdateCheck(false);
                                // Clear error if any
                                setDownloadError("");
                            }}>{t("close")}</button>
                        </div>
                    </div>
                </div>
            )}

            {showModelSettings && config && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '529px', textAlign: 'left'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3 style={{margin: 0, color: '#60a5fa'}}>{t("modelSettings")}</h3>
                            <button className="modal-close" onClick={() => setShowModelSettings(false)}>&times;</button>
                        </div>

                        <div style={{marginBottom: '16px'}}>
                            {(() => {
                                const allModels = (config as any)[activeTool].models;
                                const configurableModels = allModels.filter((m: any) => m.model_name !== "Original");
                                const showArrows = configurableModels.length >= 5;
                                
                                return (
                                    <div className="tabs" style={{alignItems: 'center', minHeight: '40px'}}>
                                        {showArrows && (
                                            <div style={{width: '30px', display: 'flex', justifyContent: 'center', flexShrink: 0}}>
                                                {tabStartIndex > 0 && (
                                                    <button
                                                        onClick={() => setTabStartIndex(Math.max(0, tabStartIndex - 1))}
                                                        style={{
                                                            border: 'none', background: 'transparent', cursor: 'pointer', 
                                                            padding: '6px 4px', color: '#64748b', fontSize: '1rem'
                                                        }}
                                                    >
                                                        ◀
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div style={{flex: 1, display: 'flex', gap: '2px', overflow: 'hidden'}}>
                                            {(showArrows ? configurableModels.slice(tabStartIndex, tabStartIndex + 4) : configurableModels).map((model: any, index: number) => {
                                                const globalIndex = allModels.findIndex((m: any) => m.model_name === model.model_name);
                                                return (
                                                    <button
                                                        key={globalIndex}
                                                        className={`tab-button ${activeTab === globalIndex ? 'active' : ''}`}
                                                        onClick={() => setActiveTab(globalIndex)}
                                                        style={{overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0}}
                                                    >
                                                        {model.model_name}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {showArrows && (
                                            <div style={{width: '30px', display: 'flex', justifyContent: 'center', flexShrink: 0}}>
                                                {tabStartIndex + 4 < configurableModels.length && (
                                                    <button
                                                        onClick={() => setTabStartIndex(Math.min(configurableModels.length - 4, tabStartIndex + 1))}
                                                        style={{
                                                            border: 'none', background: 'transparent', cursor: 'pointer', 
                                                            padding: '6px 4px', color: '#64748b', fontSize: '1rem'
                                                        }}
                                                    >
                                                        ▶
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div style={{display: 'flex', gap: '16px'}}>
                            {(config as any)[activeTool].models[activeTab].is_custom && (
                                <div className="form-group" style={{flex: 1}}>
                                    <label className="form-label">{t("providerName")}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        data-field="model-name"
                                        value={(config as any)[activeTool].models[activeTab].model_name}
                                        onChange={(e) => handleModelNameChange(e.target.value)}
                                        onContextMenu={(e) => handleContextMenu(e, e.currentTarget)}
                                        placeholder={t("customProviderPlaceholder")}
                                        spellCheck={false}
                                        autoComplete="off"
                                    />
                                </div>
                            )}
                                                                
                            {(config as any)[activeTool].models[activeTab].model_name !== "Original" && activeTool !== 'qoder' && (
                                <div className="form-group" style={{flex: 1}}>
                                    <label className="form-label">
                                        {t("modelName")}
                                        {(activeTool === 'codebuddy' || activeTool === 'qoder') && <span style={{fontSize: '0.7rem', color: '#94a3b8', marginLeft: '5px'}}>(Supports multiple, separated by comma)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        data-field="model-id"
                                        value={(config as any)[activeTool].models[activeTab].model_id}
                                        onChange={(e) => handleModelIdChange(e.target.value)}
                                        onContextMenu={(e) => handleContextMenu(e, e.currentTarget)}
                                        placeholder={(activeTool === 'codebuddy' || activeTool === 'qoder') ? "e.g. gpt-4,gpt-3.5-turbo" : (getDefaultModelId(activeTool, (config as any)[activeTool].models[activeTab].model_name) || "e.g. gpt-4")}
                                        spellCheck={false}
                                        autoComplete="off"
                                    />
                                </div>
                            )}
                        </div>

                        {(config as any)[activeTool].models[activeTab].model_name !== "Original" && (
                            <>
                                {activeTool === "codex" && (
                                                                            <div className="form-group">
                                                                                <label className="form-label">Wire API</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-input"
                                                                                    data-field="wire-api"
                                                                                    value={(config as any)[activeTool].models[activeTab].wire_api || ""}
                                                                                    onChange={(e) => handleWireApiChange(e.target.value)}
                                                                                    onContextMenu={(e) => handleContextMenu(e, e.currentTarget)}
                                                                                    placeholder="e.g. chat (default) or responses"
                                                                                    spellCheck={false}
                                                                                    autoComplete="off"
                                                                                />
                                                                            </div>
                                                                        )}
                                    
                                                                        <div className="form-group">
                                                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                        <label className="form-label" style={{margin: 0}}>{activeTool === 'qoder' ? t("personalToken") : t("apiKey")}</label>
                                        {activeTool === 'qoder' ? (
                                            <button 
                                                className="btn-link" 
                                                style={{fontSize: '0.75rem', padding: '2px 8px'}}
                                                onClick={() => BrowserOpenURL("https://qoder.com/account/integrations")}
                                            >
                                                {t("getToken")}
                                            </button>
                                        ) : (
                                            !(config as any)[activeTool].models[activeTab].is_custom && (
                                                <button 
                                                    className="btn-link" 
                                                    style={{fontSize: '0.75rem', padding: '2px 8px'}}
                                                    onClick={() => handleOpenSubscribe((config as any)[activeTool].models[activeTab].model_name)}
                                                >
                                                    {t("getKey")}
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        className="form-input"
                                        data-field="api-key"
                                        value={(config as any)[activeTool].models[activeTab].api_key}
                                        onChange={(e) => handleApiKeyChange(e.target.value)}
                                        onContextMenu={(e) => handleContextMenu(e, e.currentTarget)}
                                        placeholder={activeTool === 'qoder' ? t("personalToken") : t("enterKey")}
                                        spellCheck={false}
                                        autoComplete="off"
                                    />
                                </div>
                                                            
                                {activeTool !== 'qoder' && (
                                <div className="form-group">
                                    <label className="form-label">{t("apiEndpoint")}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        data-field="api-url"
                                        value={(config as any)[activeTool].models[activeTab].model_url}
                                        onChange={(e) => handleModelUrlChange(e.target.value)}
                                        onContextMenu={(e) => handleContextMenu(e, e.currentTarget)}
                                        placeholder="https://api.example.com/v1"
                                        spellCheck={false}
                                        autoComplete="off"
                                        readOnly={!(config as any)[activeTool].models[activeTab].is_custom}
                                        style={!(config as any)[activeTool].models[activeTab].is_custom ? {backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#9ca3af'} : {}}
                                    />
                                </div>
                                )}
                            </>
                        )}

                        <div style={{display: 'flex', gap: '10px', marginTop: '24px'}}>
                            <button className="btn-primary" style={{flex: 1}} onClick={save}>{t("saveChanges")}</button>
                            <button className="btn-hide" style={{flex: 1}} onClick={() => setShowModelSettings(false)}>{t("close")}</button>
                        </div>
                    </div>
                </div>
            )}

            {contextMenu.visible && (
                <div style={{
                    position: 'fixed',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 3000,
                    padding: '5px 0',
                    minWidth: '120px'
                }}>
                    <div className="context-menu-item" onClick={() => handleContextAction('selectAll')}>{t("selectAll")}</div>
                    <div style={{height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0'}}></div>
                    <div className="context-menu-item" onClick={() => handleContextAction('copy')}>{t("copy")}</div>
                    <div className="context-menu-item" onClick={() => handleContextAction('cut')}>{t("cut")}</div>
                    <div className="context-menu-item" onClick={() => handleContextAction('paste')}>{t("contextPaste")}</div>
                </div>
            )}

            {showStartupPopup && (
                <div className="modal-overlay" style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)'}}>
                    <div className="modal-content" style={{
                        width: '320px', 
                        textAlign: 'center', 
                        padding: 0, 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            padding: '25px 20px',
                            color: '#1e293b',
                            position: 'relative',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowStartupPopup(false)}
                                style={{color: '#64748b', opacity: 0.8, top: '10px', right: '15px', zIndex: 10}}
                            >&times;</button>
                            <div style={{
                                fontSize: '2.5rem', 
                                marginBottom: '10px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '900',
                                lineHeight: 1,
                                filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.1))'
                            }}>{`</>`}</div>
                            <h3 style={{margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 'bold'}}>{t("startupTitle")}</h3>
                            <p style={{
                                margin: '6px 0 0 0', 
                                background: 'linear-gradient(to right, #2563eb, #9333ea, #db2777)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '0.95rem',
                                fontWeight: '700'
                            }}>
                                {t("slogan")}
                            </p>
                            <p style={{
                                margin: '4px 0 0 0', 
                                background: 'linear-gradient(to right, #2563eb, #9333ea, #db2777)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '0.85rem',
                                fontWeight: '700'
                            }}>
                                {lang === 'zh-Hans' || lang === 'zh-Hant' ? '真正的Vibe Coder只使用命令行。' : 'Real Vibe Coders only use the command line.'}
                            </p>
                        </div>
                        
                        <div style={{padding: '20px 25px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
                                <button 
                                    style={{
                                        width: '100%', 
                                        padding: '10px', 
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                        color: '#1e40af',
                                        border: '1px solid #bfdbfe',
                                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => {
                                        BrowserOpenURL("https://www.bilibili.com/video/BV1wmvoBnEF1");
                                    }}
                                >
                                    <span>🎬</span> {t("quickStart")}
                                </button>
                                <button 
                                    className="btn-link" 
                                    style={{
                                        padding: '10px', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '10px',
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        color: '#64748b',
                                        backgroundColor: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                    onClick={() => {
                                        const manualUrl = (lang === 'zh-Hans' || lang === 'zh-Hant')
                                            ? "https://github.com/RapidAI/aicoder/blob/main/UserManual_CN.md"
                                            : "https://github.com/RapidAI/aicoder/blob/main/UserManual_EN.md";
                                        BrowserOpenURL(manualUrl);
                                    }}
                                >
                                    <span>📖</span> {t("manual")}
                                </button>
                            </div>

                            <div style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px'
                            }}>
                                <label style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    cursor: 'pointer', 
                                    fontSize: '0.8rem', 
                                    color: '#94a3b8'
                                }}>
                                    <input 
                                        type="checkbox" 
                                        checked={config?.hide_startup_popup || false}
                                        style={{
                                            width: '14px',
                                            height: '14px',
                                            cursor: 'pointer'
                                        }}
                                        onChange={(e) => {
                                            if (config) {
                                                const newConfig = new main.AppConfig({...config, hide_startup_popup: e.target.checked});
                                                setConfig(newConfig);
                                                SaveConfig(newConfig);
                                            }
                                        }}
                                    />
                                    {t("dontShowAgain")}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Thanks Modal */}
            {showThanksModal && (
                <div className="modal-overlay">
                    <div className="modal-content elegant-scrollbar" style={{maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
                        <h3 style={{marginTop: 0, marginBottom: '15px', color: '#60a5fa'}}>{t("thanks")}</h3>
                        <div className="markdown-content" style={{
                            backgroundColor: '#fff',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            fontFamily: 'inherit',
                            fontSize: '0.8rem',
                            lineHeight: '1.6',
                            color: '#374151',
                            textAlign: 'left',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                // @ts-ignore
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    a: ({node, ...props}) => (
                                        <a 
                                            {...props} 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (props.href) BrowserOpenURL(props.href);
                                            }}
                                            style={{cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline'}}
                                        />
                                    )
                                }}
                            >
                                {thanksContent}
                            </ReactMarkdown>
                        </div>
                        <button onClick={() => setShowThanksModal(false)} className="btn-secondary" style={{marginTop: '20px'}}>
                            {t("close")}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Confirm Dialog */}
            {confirmDialog.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div style={{
                        backgroundColor: 'var(--surface-color)',
                        borderRadius: '12px',
                        padding: '24px',
                        minWidth: '400px',
                        maxWidth: '500px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '1.2rem',
                            color: 'var(--text-color)',
                            fontWeight: '600'
                        }}>
                            {confirmDialog.title}
                        </h3>
                        <p style={{
                            margin: '0 0 24px 0',
                            color: 'var(--text-secondary)',
                            fontSize: '0.95rem',
                            lineHeight: '1.5'
                        }}>
                            {confirmDialog.message}
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => setConfirmDialog({...confirmDialog, show: false})}
                                style={{
                                    padding: '8px 20px',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                style={{
                                    padding: '8px 20px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ef4444';
                                }}
                            >
                                {t("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Proxy Settings Dialog */}
            {showProxySettings && config && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '500px', textAlign: 'left'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3 style={{margin: 0, color: '#60a5fa'}}>
                                {proxyEditMode === 'global' ? t("proxySettings") + " - " + (lang === 'zh-Hans' ? '全局默认' : lang === 'zh-Hant' ? '全局預設' : 'Global Default') : t("proxySettings")}
                            </h3>
                            <button className="modal-close" onClick={() => setShowProxySettings(false)}>&times;</button>
                        </div>

                        {proxyEditMode === 'project' && config?.default_proxy_host && (
                            <div style={{marginBottom: '15px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', fontSize: '0.85rem'}}>
                                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                    <input
                                        type="checkbox"
                                        checked={(() => {
                                            const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                            return proj && !proj.proxy_host;
                                        })()}
                                        onChange={(e) => {
                                            const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                            if (proj && e.target.checked) {
                                                const newProjects = config.projects.map((p: any) =>
                                                    p.id === proj.id ? {
                                                        ...p,
                                                        proxy_host: '',
                                                        proxy_port: '',
                                                        proxy_username: '',
                                                        proxy_password: ''
                                                    } : p
                                                );
                                                const newConfig = new main.AppConfig({...config, projects: newProjects});
                                                setConfig(newConfig);
                                                SaveConfig(newConfig);
                                            }
                                        }}
                                        style={{marginRight: '8px'}}
                                    />
                                    <span>{t("useDefaultProxy")} ({config.default_proxy_host}:{config.default_proxy_port})</span>
                                </label>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">{t("proxyHost")}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={(() => {
                                    if (proxyEditMode === 'global') {
                                        return config?.default_proxy_host || '';
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        return proj?.proxy_host || '';
                                    }
                                })()}
                                onChange={(e) => {
                                    if (proxyEditMode === 'global') {
                                        const newConfig = new main.AppConfig({...config, default_proxy_host: e.target.value});
                                        setConfig(newConfig);
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        if (proj) {
                                            const newProjects = config.projects.map((p: any) =>
                                                p.id === proj.id ? { ...p, proxy_host: e.target.value } : p
                                            );
                                            const newConfig = new main.AppConfig({...config, projects: newProjects});
                                            setConfig(newConfig);
                                        }
                                    }
                                }}
                                placeholder={t("proxyHostPlaceholder")}
                                spellCheck={false}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("proxyPort")}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={(() => {
                                    if (proxyEditMode === 'global') {
                                        return config?.default_proxy_port || '';
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        return proj?.proxy_port || '';
                                    }
                                })()}
                                onChange={(e) => {
                                    if (proxyEditMode === 'global') {
                                        const newConfig = new main.AppConfig({...config, default_proxy_port: e.target.value});
                                        setConfig(newConfig);
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        if (proj) {
                                            const newProjects = config.projects.map((p: any) =>
                                                p.id === proj.id ? { ...p, proxy_port: e.target.value } : p
                                            );
                                            const newConfig = new main.AppConfig({...config, projects: newProjects});
                                            setConfig(newConfig);
                                        }
                                    }
                                }}
                                placeholder={t("proxyPortPlaceholder")}
                                spellCheck={false}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("proxyUsername")}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={(() => {
                                    if (proxyEditMode === 'global') {
                                        return config?.default_proxy_username || '';
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        return proj?.proxy_username || '';
                                    }
                                })()}
                                onChange={(e) => {
                                    if (proxyEditMode === 'global') {
                                        const newConfig = new main.AppConfig({...config, default_proxy_username: e.target.value});
                                        setConfig(newConfig);
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        if (proj) {
                                            const newProjects = config.projects.map((p: any) =>
                                                p.id === proj.id ? { ...p, proxy_username: e.target.value } : p
                                            );
                                            const newConfig = new main.AppConfig({...config, projects: newProjects});
                                            setConfig(newConfig);
                                        }
                                    }
                                }}
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("proxyPassword")}</label>
                            <input
                                type="password"
                                className="form-input"
                                value={(() => {
                                    if (proxyEditMode === 'global') {
                                        return config?.default_proxy_password || '';
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        return proj?.proxy_password || '';
                                    }
                                })()}
                                onChange={(e) => {
                                    if (proxyEditMode === 'global') {
                                        const newConfig = new main.AppConfig({...config, default_proxy_password: e.target.value});
                                        setConfig(newConfig);
                                    } else {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        if (proj) {
                                            const newProjects = config.projects.map((p: any) =>
                                                p.id === proj.id ? { ...p, proxy_password: e.target.value } : p
                                            );
                                            const newConfig = new main.AppConfig({...config, projects: newProjects});
                                            setConfig(newConfig);
                                        }
                                    }
                                }}
                                autoComplete="new-password"
                            />
                        </div>

                        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowProxySettings(false)}
                                style={{padding: '8px 16px'}}
                            >
                                {t("cancel")}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    SaveConfig(config);
                                    setShowProxySettings(false);

                                    // Auto-enable use_proxy after configuration (project mode only)
                                    if (proxyEditMode === 'project') {
                                        const proj = config?.projects?.find((p: any) => p.id === selectedProjectForLaunch);
                                        if (proj && !proj.use_proxy) {
                                            const newProjects = config.projects.map((p: any) =>
                                                p.id === proj.id ? { ...p, use_proxy: true } : p
                                            );
                                            const newConfig = new main.AppConfig({...config, projects: newProjects});
                                            setConfig(newConfig);
                                            SaveConfig(newConfig);
                                        }
                                    }
                                }}
                                style={{padding: '8px 16px'}}
                            >
                                {t("saveChanges")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Install Skills Modal */}
            {showInstallSkillModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '500px', maxWidth: '90vw'}}>
                        <div className="modal-header">
                            <h3 style={{margin: 0, color: '#10b981'}}>{t("selectSkillsToInstall")}</h3>
                            <button onClick={() => setShowInstallSkillModal(false)} className="btn-close">&times;</button>
                        </div>
                        <div className="modal-body" style={{maxHeight: '300px', overflowY: 'auto', padding: '10px 0'}}>
                            {skills.length === 0 ? (
                                <div style={{textAlign: 'center', color: '#6b7280', padding: '20px'}}>
                                    {t("noSkills")}
                                </div>
                            ) : (
                                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                    {skills.map((skill, idx) => (
                                        <label key={idx} style={{
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            padding: '8px 12px', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: selectedSkillsToInstall.includes(skill.name) ? '#f0fdf4' : '#fff'
                                        }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedSkillsToInstall.includes(skill.name)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSkillsToInstall([...selectedSkillsToInstall, skill.name]);
                                                    } else {
                                                        setSelectedSkillsToInstall(selectedSkillsToInstall.filter(n => n !== skill.name));
                                                    }
                                                }}
                                                style={{marginRight: '10px'}}
                                            />
                                            <div style={{flex: 1}}>
                                                <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{skill.name}</div>
                                                <div style={{fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '350px'}} title={skill.description}>{skill.description}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{marginTop: '15px'}}>
                            <button className="btn-secondary" onClick={() => setShowInstallSkillModal(false)}>{t("cancel")}</button>
                            <button 
                                className="btn-primary" 
                                style={{backgroundColor: '#10b981', borderColor: '#10b981'}}
                                disabled={selectedSkillsToInstall.length === 0}
                                onClick={() => {
                                    setShowInstallSkillModal(false);
                                    showToastMessage(t("installNotImplemented") + " (" + selectedSkillsToInstall.join(", ") + ")");
                                }}
                            >
                                {t("install")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className="toast">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default App;