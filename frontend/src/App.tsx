import {useEffect, useState, useRef} from 'react';
import './App.css';
import {buildNumber} from './version';
import appIcon from './assets/images/appicon.png';
import {CheckToolsStatus, InstallTool, LoadConfig, SaveConfig, CheckEnvironment, ResizeWindow, LaunchTool, SelectProjectDir, SetLanguage, GetUserHomeDir, CheckUpdate, RecoverCC, ShowMessage} from "../wailsjs/go/main/App";
import {WindowHide, EventsOn, EventsOff, BrowserOpenURL, ClipboardGetText, Quit} from "../wailsjs/runtime";
import {main} from "../wailsjs/go/models";

const subscriptionUrls: {[key: string]: string} = {
    "glm": "https://bigmodel.cn/glm-coding",
    "kimi": "https://www.kimi.com/membership/pricing?from=upgrade_plan&track_id=1d2446f5-f45f-4ae5-961e-c0afe936a115",
    "doubao": "https://www.volcengine.com/activity/codingplan",
    "minimax": "https://platform.minimaxi.com/user-center/payment/coding-plan",
    "codex": "https://www.aicodemirror.com/register?invitecode=CZPPWZ",
    "gemini": "https://www.aicodemirror.com/register?invitecode=CZPPWZ",
    "aicodemirror": "https://www.aicodemirror.com/register?invitecode=CZPPWZ"
};

const APP_VERSION = "1.3.2.1";

const translations: any = {
    "en": {
        "title": "AICoder",
        "about": "About",
        "manual": "Manual",
        "cs146s": "Online Course",
        "recoverCC": "Recover CC",
        "hide": "Hide",
        "launch": "LAUNCH",
        "projectDir": "Project Directory",
        "change": "Change",
        "yoloMode": "Yolo Mode",
        "dangerouslySkip": "(Dangerously Skip Permissions)",
        "launchBtn": "Launch Tool",
        "activeModel": "ACTIVE PROVIDER",
        "modelSettings": "PROVIDER SETTINGS",
        "modelName": "Provider Name",
        "apiKey": "API Key",
        "getKey": "Get API Key",
        "enterKey": "Enter API Key",
        "apiEndpoint": "API Endpoint",
        "saveChanges": "Save & Close",
        "saving": "Saving...",
        "saved": "Saved successfully!",
        "recovering": "Recovering...",
        "recoverSuccess": "Recovery successful!",
        "recoverSuccessAlert": "Claude Code has been reset. Please DO NOT click 'Launch' here. Instead, open your terminal manually and run 'claude' to complete the native setup.",
        "confirmRecover": "Are you sure you want to recover Claude Code to its initial state? This will clear all configurations.",
        "recoverTitle": "Recover Claude Code",
        "recoverWarning": "Warning: This will permanently delete your Claude Code configurations and authentication tokens. This action cannot be undone.",
        "startRecover": "Start Recovery",
        "close": "Close",
        "manageProjects": "Manage Projects",
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
        "updateAvailable": "Update available: ",
        "foundNewVersion": "Found new version",
        "downloadNow": "Download Now",
        "paste": "Paste",
        "hideConfig": "Configure",
        "editConfig": "Configure",
        "settings": "Settings",
        "globalSettings": "Global Settings",
        "language": "Language",
        "runnerStatus": "Runner Status",
        "yoloModeLabel": "Yolo Mode",
        "customProviderPlaceholder": "Custom Provider Name",
        "version": "Version",
        "author": "Author",
        "checkingUpdate": "Checking for updates...",
        "bugReport": "Bug Report or Suggestion"
    },
    "zh-Hans": {
        "title": "AICoder",
        "about": "关于",
        "manual": "使用说明",
        "cs146s": "在线课程",
        "recoverCC": "恢复CC",
        "hide": "隐藏",
        "launch": "启动",
        "projectDir": "项目目录",
        "change": "更改",
        "yoloMode": "Yolo 模式",
        "dangerouslySkip": "(危险：跳过权限检查)",
        "launchBtn": "启动工具",
        "activeModel": "服务商选择",
        "modelSettings": "服务商设置",
        "modelName": "服务商名称",
        "apiKey": "API 密钥",
        "getKey": "获取API密钥",
        "enterKey": "输入 API Key",
        "apiEndpoint": "API 端点",
        "saveChanges": "保存并关闭",
        "saving": "保存中...",
        "saved": "保存成功！",
        "recovering": "正在恢复...",
        "recoverSuccess": "恢复成功！",
        "recoverSuccessAlert": "Claude Code 已重置。请注意：不要点击本程序的“启动”按钮。请自行手动打开终端窗口并运行 'claude' 命令以恢复原厂设置。",
        "confirmRecover": "确定要将 Claude Code 恢复到初始状态吗？这将清除所有配置。",
        "recoverTitle": "恢复 Claude Code",
        "recoverWarning": "警告：这将永久删除您的 Claude Code 配置和认证令牌。此操作无法撤销。",
        "startRecover": "开始恢复",
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
        "updateAvailable": "发现新版本: ",
        "foundNewVersion": "发现新版本",
        "downloadNow": "立即下载",
        "paste": "粘贴",
        "hideConfig": "配置",
        "editConfig": "配置",
        "settings": "设置",
        "globalSettings": "全局设置",
        "language": "界面语言",
        "runnerStatus": "运行状态",
        "yoloModeLabel": "Yolo 模式",
        "customProviderPlaceholder": "自定义服务商名称",
        "version": "版本",
        "author": "作者",
        "checkingUpdate": "正在检查更新...",
        "bugReport": "Bug 报告或建议"
    },
    "zh-Hant": {
        "title": "AICoder",
        "about": "關於",
        "manual": "使用說明",
        "cs146s": "線上課程",
        "recoverCC": "恢復CC",
        "hide": "隱藏",
        "launch": "啟動",
        "projectDir": "專案目錄",
        "change": "變更",
        "yoloMode": "Yolo 模式",
        "dangerouslySkip": "(危險：跳過權限檢查)",
        "launchBtn": "啟動工具",
        "activeModel": "服務商選擇",
        "modelSettings": "服務商設定",
        "modelName": "服務商名稱",
        "apiKey": "API 金鑰",
        "getKey": "獲取API密鑰",
        "enterKey": "輸入 API Key",
        "apiEndpoint": "API 端點",
        "saveChanges": "儲存並關閉",
        "saving": "儲存中...",
        "saved": "儲存成功！",
        "recovering": "正在恢復...",
        "recoverSuccess": "恢復成功！",
        "recoverSuccessAlert": "Claude Code 已重置。請注意：不要點擊本程序的“啟動”按鈕。請自行手動打開終端窗口並運行 'claude' 命令以恢復原廠設置。",
        "confirmRecover": "確定要將 Claude Code 恢復到初始狀態嗎？這將清除所有配置。",
        "recoverTitle": "恢復 Claude Code",
        "recoverWarning": "警告：這將永久刪除您的 Claude Code 配置和認證令牌。此操作無法撤銷。",
        "startRecover": "開始恢復",
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
        "runnerStatus": "運行狀態",
        "yoloModeLabel": "Yolo 模式",
        "customProviderPlaceholder": "自定義服務商名稱",
        "version": "版本",
        "author": "作者",
        "checkingUpdate": "正在檢查更新..."
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
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'
            }}>
                <h3 style={{
                    fontSize: '0.9rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0
                }}>{t("activeModel")}</h3>
                <button 
                    className="btn-link" 
                    onClick={() => setShowModelSettings(true)}
                    style={{borderColor: '#60a5fa', color: '#60a5fa'}}
                >
                    {t("editConfig")}
                </button>
            </div>
            <div className="model-switcher" style={{flexWrap: 'wrap'}}>
                {toolCfg.models.map((model: any) => (
                    <button
                        key={model.model_name}
                        className={`model-btn ${toolCfg.current_model === model.model_name ? 'selected' : ''}`}
                        onClick={() => handleModelSwitch(model.model_name)}
                        style={{
                            minWidth: '120px',
                            borderBottom: (model.api_key && model.api_key.trim() !== "") ? '3px solid #60a5fa' : '1px solid var(--border-color)'
                        }}
                    >
                        {model.model_name}
                    </button>
                ))}
            </div>
        </div>
    );
};

function App() {
    const [config, setConfig] = useState<main.AppConfig | null>(null);
    const [navTab, setNavTab] = useState<string>("claude");
    const [activeTool, setActiveTool] = useState<string>("claude");
    const [status, setStatus] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [toolStatuses, setToolStatuses] = useState<any[]>([]);
    const [envLogs, setEnvLogs] = useState<string[]>(["Initializing..."]);
    const [showLogs, setShowLogs] = useState(false);
    const [yoloMode, setYoloMode] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showModelSettings, setShowModelSettings] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateResult, setUpdateResult] = useState<any>(null);
    const [projectOffset, setProjectOffset] = useState(0);
    const [lang, setLang] = useState("en");

    // Recover Modal State
    const [showRecoverModal, setShowRecoverModal] = useState(false);
    const [recoverLogs, setRecoverLogs] = useState<string[]>([]);
    const [recoverStatus, setRecoverStatus] = useState<"idle" | "recovering" | "success" | "error">("idle");
    const recoverLogRef = useRef<HTMLDivElement>(null);

    const logEndRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
        }
    }, [envLogs]);

    useEffect(() => {
        if (recoverLogRef.current) {
            recoverLogRef.current.scrollTop = recoverLogRef.current.scrollHeight;
        }
    }, [recoverLogs]);

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
            ResizeWindow(760, 520);
            setIsLoading(false);
        };

        EventsOn("env-log", logHandler);
        EventsOn("env-check-done", doneHandler);

        CheckEnvironment(); // Start checks
        checkTools();

        // Config Logic
        LoadConfig().then((cfg) => {
            setConfig(cfg);
            if (cfg) {
                const tool = cfg.active_tool || "claude";
                setActiveTool(tool);
                setNavTab(tool);
                
                const toolCfg = (cfg as any)[tool];
                if (toolCfg && toolCfg.models) {
                    const idx = toolCfg.models.findIndex((m: any) => m.model_name === toolCfg.current_model);
                    if (idx !== -1) setActiveTab(idx);

                    // Check if any model has an API key configured for the active tool
                    const hasAnyApiKey = toolCfg.models.some((m: any) => m.api_key && m.api_key.trim() !== "");
                    if (!hasAnyApiKey) {
                        setShowModelSettings(true);
                    }
                }
            }
        }).catch(err => {
            setStatus("Error loading config: " + err);
        });

        // Listen for external config changes (e.g. from Tray)
        const handleConfigChange = (cfg: main.AppConfig) => {
            setConfig(cfg);
        };
        EventsOn("config-changed", handleConfigChange);

        return () => {
            EventsOff("env-log");
            EventsOff("env-check-done");
        };
    }, []);

    const checkTools = async () => {
        try {
            const statuses = await CheckToolsStatus();
            setToolStatuses(statuses);
        } catch (err) {
            console.error("Failed to check tools:", err);
        }
    };

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLang(e.target.value);
        SetLanguage(e.target.value);
    };

    const switchTool = (tool: string) => {
        setNavTab(tool);
        if (tool === 'claude' || tool === 'gemini' || tool === 'codex') {
            setActiveTool(tool);
        }
        
        if (config) {
            const toolCfg = (config as any)[tool];
            if (toolCfg && toolCfg.models) {
                const idx = toolCfg.models.findIndex((m: any) => m.model_name === toolCfg.current_model);
                if (idx !== -1) setActiveTab(idx);
            }
        }
    };

    const t = (key: string) => {
        return translations[lang][key] || translations["en"][key] || key;
    };

    const handleApiKeyChange = (newKey: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        toolCfg.models[activeTab].api_key = newKey;
        const newConfig = new main.AppConfig({...config, [activeTool]: toolCfg});
        setConfig(newConfig);
    };

    const handleModelUrlChange = (newUrl: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        toolCfg.models[activeTab].model_url = newUrl;
        const newConfig = new main.AppConfig({...config, [activeTool]: toolCfg});
        setConfig(newConfig);
    };

    const handleModelNameChange = (newName: string) => {
        if (!config) return;
        const toolCfg = JSON.parse(JSON.stringify((config as any)[activeTool]));
        const isRenamingActive = toolCfg.current_model === toolCfg.models[activeTab].model_name;
        toolCfg.models[activeTab].model_name = newName;
        if (isRenamingActive) toolCfg.current_model = newName;
        
        const newConfig = new main.AppConfig({
            ...config, 
            [activeTool]: toolCfg
        });
        setConfig(newConfig);
    };

    const handleModelSwitch = (modelName: string) => {
        if (!config) return;
        
        const toolCfg = (config as any)[activeTool];
        const targetModel = toolCfg.models.find((m: any) => m.model_name === modelName);
        if (!targetModel || !targetModel.api_key || targetModel.api_key.trim() === "") {
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
        const url = subscriptionUrls[modelName.toLowerCase()];
        if (url) {
            BrowserOpenURL(url);
        }
    };

    const save = () => {
        if (!config) return;
        setStatus(t("saving"));
        SaveConfig(config).then(() => {
            setStatus(t("saved"));
            setTimeout(() => {
                setStatus("");
                setShowModelSettings(false);
            }, 1000);
        }).catch(err => {
            setStatus("Error saving: " + err);
        });
    };

    const handleStartRecover = () => {
        setRecoverStatus("recovering");
        setRecoverLogs([]);
        EventsOn("recover-log", (msg: string) => {
            setRecoverLogs(prev => [...prev, msg]);
        });

        RecoverCC().then(() => {
            setRecoverStatus("success");
            setRecoverLogs(prev => [...prev, "DONE!"]);
            EventsOff("recover-log");
            ShowMessage(t("recoverTitle"), t("recoverSuccessAlert"));
        }).catch((err) => {
            setRecoverStatus("error");
            setRecoverLogs(prev => [...prev, "Error: " + err]);
            EventsOff("recover-log");
        });
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
                boxSizing: 'border-box'
            }}>
                <h2 style={{color: '#60a5fa', marginBottom: '20px'}}>AICoder</h2>
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
                        {envLogs[envLogs.length - 1]}
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
                        <button onClick={Quit} className="btn-hide" style={{borderColor: '#ef4444', color: '#ef4444', padding: '4px 12px'}}>
                            {lang === 'zh-Hans' ? '退出程序' : 'Quit'}
                        </button>
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

    const toolCfg = (config as any)[activeTool] || { models: [], current_model: "" };
    const currentProject = getCurrentProject();

    return (
        <div id="App">
            <div style={{
                height: '30px', 
                width: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: 999, 
                '--wails-draggable': 'drag'
            } as any}></div>

            <div className="sidebar" style={{'--wails-draggable': 'no-drag'} as any}>
                <div className="sidebar-header">
                    <img src={appIcon} alt="Logo" className="sidebar-logo" />
                    <span className="sidebar-title">AICoder</span>
                </div>
                <div className={`sidebar-item ${navTab === 'claude' ? 'active' : ''}`} onClick={() => switchTool('claude')}>
                    <span className="sidebar-icon">🤖</span> Claude
                </div>
                <div className={`sidebar-item ${navTab === 'gemini' ? 'active' : ''}`} onClick={() => switchTool('gemini')}>
                    <span className="sidebar-icon">♊</span> Gemini
                </div>
                <div className={`sidebar-item ${navTab === 'codex' ? 'active' : ''}`} onClick={() => switchTool('codex')}>
                    <span className="sidebar-icon">💻</span> Codex
                </div>
                <div style={{flex: 1}}></div>
                <div className={`sidebar-item ${navTab === 'projects' ? 'active' : ''}`} onClick={() => switchTool('projects')}>
                    <span className="sidebar-icon">📂</span> {t("manageProjects")}
                </div>
                <div className={`sidebar-item ${navTab === 'settings' ? 'active' : ''}`} onClick={() => switchTool('settings')}>
                    <span className="sidebar-icon">⚙️</span> {t("settings")}
                </div>
                <div className={`sidebar-item ${navTab === 'about' ? 'active' : ''}`} onClick={() => switchTool('about')}>
                    <span className="sidebar-icon">ℹ️</span> {t("about")}
                </div>
            </div>

            <div className="main-container">
                <div className="top-header" style={{'--wails-draggable': 'drag'} as any}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <h2 style={{margin: 0, fontSize: '1.1rem', color: '#60a5fa', fontWeight: 'bold', marginLeft: '20px'}}>
                            {navTab === 'claude' ? 'Claude Code' : 
                             navTab === 'gemini' ? 'Gemini CLI' : 
                             navTab === 'codex' ? 'OpenAI Codex' : 
                             navTab === 'projects' ? t("projectManagement") : 
                             navTab === 'settings' ? t("globalSettings") : t("about")}
                        </h2>
                        <div style={{display: 'flex', gap: '10px', '--wails-draggable': 'no-drag', marginRight: '5px'} as any}>
                            <button onClick={WindowHide} className="btn-hide">
                                {t("hide")}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="main-content" style={{overflowY: 'auto', paddingBottom: '20px'}}>
                    {(navTab === 'claude' || navTab === 'gemini' || navTab === 'codex') && (
                        <ToolConfiguration 
                            toolName={navTab === 'claude' ? 'Claude' : navTab === 'gemini' ? 'Gemini' : 'Codex'}
                            toolCfg={toolCfg}
                            showModelSettings={showModelSettings}
                            setShowModelSettings={setShowModelSettings}
                            handleModelSwitch={handleModelSwitch}
                            t={t}
                        />
                    )}

                    {navTab === 'projects' && (
                        <div style={{padding: '10px'}}>
                             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                                <h3 style={{margin: 0}}>{t("projectManagement")}</h3>
                                <button className="btn-primary" onClick={handleAddNewProject}>{t("addNewProject")}</button>
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                {config && config.projects && config.projects.map((proj: any) => (
                                    <div key={proj.id} style={{
                                        padding: '15px', 
                                        backgroundColor: '#fff', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                value={proj.name}
                                                onChange={(e) => {
                                                    const newList = config.projects.map((p: any) => p.id === proj.id ? {...p, name: e.target.value} : p);
                                                    setConfig(new main.AppConfig({...config, projects: newList}));
                                                }}
                                                onBlur={() => {
                                                    if (config) SaveConfig(config);
                                                }}
                                                style={{fontWeight: 'bold', border: 'none', padding: 0, fontSize: '1rem'}}
                                            />
                                            <button 
                                                style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer'}}
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
                                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                            <div style={{flex: 1, fontSize: '0.85rem', color: '#6b7280', backgroundColor: '#f9fafb', padding: '8px', borderRadius: '4px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                {proj.path}
                                            </div>
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {navTab === 'settings' && (
                        <div style={{padding: '10px'}}>
                            <h3>{t("globalSettings")}</h3>
                            <div className="form-group">
                                <label className="form-label">{t("language")}</label>
                                <select value={lang} onChange={handleLangChange} className="form-input">
                                    <option value="en">English</option>
                                    <option value="zh-Hans">简体中文</option>
                                    <option value="zh-Hant">繁體中文</option>
                                </select>
                            </div>
                            
                            <div style={{marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px'}}>
                                <button className="btn-link" style={{marginBottom: '10px', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => setShowRecoverModal(true)}>
                                    {t("recoverCC")}
                                </button>
                            </div>
                        </div>
                    )}

                    {navTab === 'about' && (
                        <div style={{
                            padding: '40px 20px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            textAlign: 'center'
                        }}>
                            <img src={appIcon} alt="Logo" style={{width: '80px', height: '80px', marginBottom: '20px'}} />
                            <h2 style={{color: '#60a5fa', margin: '0 0 10px 0'}}>AICoder</h2>
                            <div style={{fontSize: '1rem', color: '#374151', marginBottom: '5px'}}>{t("version")} {APP_VERSION}</div>
                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '30px'}}>{t("author")}: Dr. Daniel</div>
                            
                            <div style={{display: 'flex', gap: '15px'}}>
                                <button 
                                    className="btn-primary" 
                                    onClick={() => {
                                        setStatus(t("checkingUpdate"));
                                        CheckUpdate(APP_VERSION).then(res => {
                                            setUpdateResult(res);
                                            setShowUpdateModal(true);
                                            setStatus("");
                                        }).catch(err => {
                                            setStatus("Error checking updates: " + err);
                                        });
                                    }}
                                >
                                    {t("checkUpdate")}
                                </button>
                                <button className="btn-link" onClick={() => BrowserOpenURL("https://github.com/RapidAI/cceasy")}>GitHub</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Action Bar (Footer) */}
                {config && (navTab === 'claude' || navTab === 'gemini' || navTab === 'codex') && (
                    <div className="global-action-bar">
                        <div className="action-bar-row">
                            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                <div style={{fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{t("runnerStatus")}</div>
                                <div style={{fontSize: '0.9rem', fontWeight: 600, color: '#374151'}}>
                                    <span style={{color: '#60a5fa', textTransform: 'capitalize'}}>{activeTool}</span>
                                    <span style={{margin: '0 8px', color: '#d1d5db'}}>|</span>
                                    <span>{(config as any)[activeTool].current_model}</span>
                                </div>
                            </div>

                            <label style={{display:'flex', alignItems:'center', cursor:'pointer', fontSize: '0.85rem'}}>
                                <input 
                                    type="checkbox" 
                                    checked={getCurrentProject()?.yolo_mode || false}
                                    onChange={(e) => handleYoloChange(e.target.checked)}
                                    style={{marginRight: '8px'}}
                                />
                                <span>{t("yoloModeLabel")}</span>
                            </label>
                        </div>
                        
                        <div className="action-bar-row">
                            <button 
                                className="btn-launch" 
                                onClick={() => {
                                    const currProj = getCurrentProject();
                                    if (currProj) {
                                        LaunchTool(activeTool, currProj.yolo_mode, currProj.path || "");
                                    } else {
                                        setStatus(t("projectDirError"));
                                    }
                                }}
                            >
                                {t("launchBtn")}
                            </button>
                        </div>
                    </div>
                )}

                <div className="status-message" style={{padding: '0 20px 10px 20px', minHeight: '30px'}}>
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
                        <h3 style={{color: '#60a5fa'}}>AICoder</h3>
                        <p>Version {APP_VERSION}</p>
                        <button className="btn-primary" onClick={() => BrowserOpenURL("https://github.com/RapidAI/cceasy")}>GitHub</button>
                    </div>
                </div>
            )}
            
            {showRecoverModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '400px', textAlign: 'left'}}>
                        <h3>{t("recoverTitle")}</h3>
                        <p style={{color: '#ef4444'}}>{t("recoverWarning")}</p>
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px'}}>
                            <button className="btn-hide" onClick={() => setShowRecoverModal(false)}>{t("close")}</button>
                            <button className="btn-primary" style={{backgroundColor: '#ef4444'}} onClick={handleStartRecover}>{t("startRecover")}</button>
                        </div>
                    </div>
                </div>
            )}

            {showModelSettings && config && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '500px', textAlign: 'left'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h3 style={{margin: 0, color: '#60a5fa'}}>{t("modelSettings")}</h3>
                            <button className="modal-close" onClick={() => setShowModelSettings(false)}>&times;</button>
                        </div>

                        <div className="tabs" style={{marginBottom: '20px'}}>
                            {(config as any)[activeTool].models.map((model: any, index: number) => (
                                <button
                                    key={index}
                                    className={`tab-button ${activeTab === index ? 'active' : ''}`}
                                    onClick={() => setActiveTab(index)}
                                >
                                    {model.model_name}
                                </button>
                            ))}
                        </div>

                        {(config as any)[activeTool].models[activeTab].is_custom && (
                            <div className="form-group">
                                <label className="form-label">{t("modelName")}</label>
                                <input 
                                    type="text" 
                                    className="form-input"
                                    value={(config as any)[activeTool].models[activeTab].model_name} 
                                    onChange={(e) => handleModelNameChange(e.target.value)}
                                    placeholder={t("customProviderPlaceholder")}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                                <label className="form-label" style={{margin: 0}}>{t("apiKey")}</label>
                                {!(config as any)[activeTool].models[activeTab].is_custom && (
                                    <button 
                                        className="btn-link" 
                                        style={{fontSize: '0.75rem', padding: '2px 8px'}}
                                        onClick={() => handleOpenSubscribe((config as any)[activeTool].models[activeTab].model_name)}
                                    >
                                        {t("getKey")}
                                    </button>
                                )}
                            </div>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input 
                                    type="password" 
                                    className="form-input"
                                    value={(config as any)[activeTool].models[activeTab].api_key} 
                                    onChange={(e) => handleApiKeyChange(e.target.value)}
                                    placeholder={t("enterKey")}
                                />
                                <button className="btn-subscribe" onClick={async () => {
                                    const text = await ClipboardGetText();
                                    if (text) handleApiKeyChange(text);
                                }}>{t("paste")}</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t("apiEndpoint")}</label>
                            <input 
                                type="text" 
                                className="form-input"
                                value={(config as any)[activeTool].models[activeTab].model_url} 
                                onChange={(e) => handleModelUrlChange(e.target.value)}
                                placeholder="https://api.example.com/v1"
                            />
                        </div>

                        <div style={{display: 'flex', gap: '10px', marginTop: '30px'}}>
                            <button className="btn-primary" style={{flex: 1}} onClick={save}>{t("saveChanges")}</button>
                            <button className="btn-hide" style={{flex: 1}} onClick={() => setShowModelSettings(false)}>{t("close")}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;