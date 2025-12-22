import {useEffect, useState} from 'react';
import './App.css';
import {LoadConfig, SaveConfig, CheckEnvironment, ResizeWindow, LaunchClaude, SelectProjectDir, SetLanguage} from "../wailsjs/go/main/App";
import {WindowHide, EventsOn, EventsOff, BrowserOpenURL} from "../wailsjs/runtime";
import {main} from "../wailsjs/go/models";

const subscriptionUrls: {[key: string]: string} = {
    "glm": "https://bigmodel.cn/glm-coding",
    "kimi": "https://www.kimi.com/membership/pricing?from=upgrade_plan&track_id=1d2446f5-f45f-4ae5-961e-c0afe936a115",
    "doubao": "https://www.volcengine.com/activity/codingplan"
};

const translations: any = {
    "en": {
        "title": "Claude Code Easy Suite",
        "about": "About",
        "manual": "Manual",
        "cs146s": "CS146s CN",
        "hide": "Hide",
        "launch": "LAUNCH",
        "projectDir": "Project Directory",
        "change": "Change",
        "yoloMode": "Yolo Mode",
        "dangerouslySkip": "(Dangerously Skip Permissions)",
        "launchBtn": "Launch Claude Code",
        "activeModel": "ACTIVE MODEL",
        "modelSettings": "MODEL SETTINGS",
        "modelName": "Model Name",
        "apiKey": "API Key",
        "getKey": "Get Key",
        "enterKey": "Enter API Key",
        "apiEndpoint": "API Endpoint",
        "saveChanges": "Save Changes",
        "saving": "Saving...",
        "saved": "Saved successfully!",
        "initializing": "Initializing...",
        "loadingConfig": "Loading config...",
        "syncing": "Syncing to Claude Code...",
        "switched": "Model switched & synced!",
        "langName": "English",
        "custom": "Custom"
    },
    "zh-Hans": {
        "title": "Claude Code 简易套件",
        "about": "关于",
        "manual": "使用说明",
        "cs146s": "CS146s 中文版",
        "hide": "隐藏",
        "launch": "启动",
        "projectDir": "项目目录",
        "change": "更改",
        "yoloMode": "Yolo 模式",
        "dangerouslySkip": "(危险：跳过权限检查)",
        "launchBtn": "启动 Claude Code",
        "activeModel": "当前模型",
        "modelSettings": "模型设置",
        "modelName": "模型名称",
        "apiKey": "API 密钥",
        "getKey": "获取 Key",
        "enterKey": "输入 API Key",
        "apiEndpoint": "API 端点",
        "saveChanges": "保存更改",
        "saving": "保存中...",
        "saved": "保存成功！",
        "initializing": "初始化中...",
        "loadingConfig": "加载配置中...",
        "syncing": "正在同步到 Claude Code...",
        "switched": "模型已切换并同步！",
        "langName": "简体中文",
        "custom": "自定义"
    },
    "zh-Hant": {
        "title": "Claude Code 簡易套件",
        "about": "關於",
        "manual": "使用說明",
        "cs146s": "CS146s 中文版",
        "hide": "隱藏",
        "launch": "啟動",
        "projectDir": "專案目錄",
        "change": "變更",
        "yoloMode": "Yolo 模式",
        "dangerouslySkip": "(危險：跳過權限檢查)",
        "launchBtn": "啟動 Claude Code",
        "activeModel": "當前模型",
        "modelSettings": "模型設定",
        "modelName": "模型名稱",
        "apiKey": "API 金鑰",
        "getKey": "獲獲 Key",
        "enterKey": "輸入 API Key",
        "apiEndpoint": "API 端點",
        "saveChanges": "儲存變更",
        "saving": "儲存中...",
        "saved": "儲存成功！",
        "initializing": "初始化中...",
        "loadingConfig": "載入設定中...",
        "syncing": "正在同步到 Claude Code...",
        "switched": "模型已切換並同步！",
        "langName": "繁體中文",
        "custom": "自定義"
    },
    "ko": {
        "title": "Claude Code 이지 스위트",
        "about": "정보",
        "manual": "매뉴얼",
        "cs146s": "CS146s CN",
        "hide": "숨기기",
        "launch": "시작",
        "projectDir": "프로젝트 디렉토리",
        "change": "변경",
        "yoloMode": "Yolo 모드",
        "dangerouslySkip": "(위험: 권한 확인 건너뛰기)",
        "launchBtn": "Claude Code 시작",
        "activeModel": "활성 모델",
        "modelSettings": "모델 설정",
        "modelName": "모델 이름",
        "apiKey": "API 키",
        "getKey": "키 발급",
        "enterKey": "API 키 입력",
        "apiEndpoint": "API 엔드포인트",
        "saveChanges": "변경 사항 저장",
        "saving": "저장 중...",
        "saved": "저장 성공!",
        "initializing": "초기화 중...",
        "loadingConfig": "설정 불러오는 중...",
        "syncing": "Claude Code와 동기화 중...",
        "switched": "모델 전환 및 동기화 완료!",
        "langName": "한국어",
        "custom": "사용자 정의"
    },
    "ja": {
        "title": "Claude Code イージー・スイート",
        "about": "バージョン情報",
        "manual": "マニュアル",
        "cs146s": "CS146s CN",
        "hide": "隠す",
        "launch": "起動",
        "projectDir": "プロジェクト・ディレクトリ",
        "change": "変更",
        "yoloMode": "Yolo モード",
        "dangerouslySkip": "(危険：権限チェックをスキップ)",
        "launchBtn": "Claude Code を起動",
        "activeModel": "アクティブなモデル",
        "modelSettings": "モデル設定",
        "modelName": "モデル名",
        "apiKey": "API キー",
        "getKey": "キーを取得",
        "enterKey": "API キーを入力",
        "apiEndpoint": "API エンドポイント",
        "saveChanges": "変更を保存",
        "saving": "保存中...",
        "saved": "保存しました！",
        "initializing": "初期化中...",
        "loadingConfig": "設定を読み込み中...",
        "syncing": "Claude Code に同期中...",
        "switched": "モデルの切り替えと同期が完了しました！",
        "langName": "日本語",
        "custom": "カスタム"
    },
    "de": {
        "title": "Claude Code Easy Suite",
        "about": "Über",
        "manual": "Handbuch",
        "cs146s": "CS146s CN",
        "hide": "Verbergen",
        "launch": "Starten",
        "projectDir": "Projektverzeichnis",
        "change": "Ändern",
        "yoloMode": "Yolo-Modus",
        "dangerouslySkip": "(Gefahr: Berechtigungen überspringen)",
        "launchBtn": "Claude Code starten",
        "activeModel": "Aktives Modell",
        "modelSettings": "Modell-Einstellungen",
        "modelName": "Modellname",
        "apiKey": "API-Schlüssel",
        "getKey": "Schlüssel erhalten",
        "enterKey": "API-Schlüssel eingeben",
        "apiEndpoint": "API-Endpunkt",
        "saveChanges": "Änderungen speichern",
        "saving": "Speichern...",
        "saved": "Erfolgreich gespeichert!",
        "initializing": "Initialisiere...",
        "loadingConfig": "Lade Konfiguration...",
        "syncing": "Synchronisiere mit Claude Code...",
        "switched": "Modell gewechselt & synchronisiert!",
        "langName": "Deutsch",
        "custom": "Benutzerdefiniert"
    },
    "fr": {
        "title": "Suite Facile Claude Code",
        "about": "À propos",
        "manual": "Manuel",
        "cs146s": "CS146s CN",
        "hide": "Masquer",
        "launch": "Lancer",
        "projectDir": "Répertoire du projet",
        "change": "Changer",
        "yoloMode": "Mode Yolo",
        "dangerouslySkip": "(Danger : Ignorer les permissions)",
        "launchBtn": "Lancer Claude Code",
        "activeModel": "Modèle actif",
        "modelSettings": "Paramètres du modèle",
        "modelName": "Nom du modèle",
        "apiKey": "Clé API",
        "getKey": "Obtenir une clé",
        "enterKey": "Entrer la clé API",
        "apiEndpoint": "Point de terminaison API",
        "saveChanges": "Enregistrer",
        "saving": "Enregistrement...",
        "saved": "Enregistré avec succès !",
        "initializing": "Initialisation...",
        "loadingConfig": "Chargement de la configuration...",
        "syncing": "Synchronisation avec Claude Code...",
        "switched": "Modèle changé et synchronisé !",
        "langName": "Français",
        "custom": "Personnalisé"
    }
};

function App() {
    const [config, setConfig] = useState<main.AppConfig | null>(null);
    const [status, setStatus] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [envLog, setEnvLog] = useState("Initializing...");
    const [yoloMode, setYoloMode] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [lang, setLang] = useState("en");

    useEffect(() => {
        // Language detection
        const userLang = navigator.language;
        let initialLang = "en";
        if (userLang.startsWith("zh-TW") || userLang.startsWith("zh-HK")) {
            initialLang = "zh-Hant";
        } else if (userLang.startsWith("zh")) {
            initialLang = "zh-Hans";
        } else if (userLang.startsWith("ko")) {
            initialLang = "ko";
        } else if (userLang.startsWith("ja")) {
            initialLang = "ja";
        } else if (userLang.startsWith("de")) {
            initialLang = "de";
        } else if (userLang.startsWith("fr")) {
            initialLang = "fr";
        }
        setLang(initialLang);
        SetLanguage(initialLang);

        // Environment Check Logic
        const logHandler = (msg: string) => setEnvLog(msg);
        const doneHandler = () => {
            ResizeWindow(792, 676);
            setIsLoading(false);
        };

        EventsOn("env-log", logHandler);
        EventsOn("env-check-done", doneHandler);

        CheckEnvironment(); // Start checks

        // Config Logic
        LoadConfig().then((cfg) => {
            setConfig(cfg);
            if (cfg && cfg.models) {
                const idx = cfg.models.findIndex(m => m.model_name === cfg.current_model);
                if (idx !== -1) setActiveTab(idx);
            }
        }).catch(err => {
            setStatus("Error loading config: " + err);
        });

        // Listen for external config changes (e.g. from Tray)
        // Only update the config state (Active Model UI), do NOT switch the editing Tab.
        const handleConfigChange = (cfg: main.AppConfig) => {
            setConfig(cfg);
        };
        EventsOn("config-changed", handleConfigChange);

        return () => {
            EventsOff("config-changed");
            EventsOff("env-log");
            EventsOff("env-check-done");
        };
    }, []);

    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLang(e.target.value);
        SetLanguage(e.target.value);
    };

    const t = (key: string) => {
        return translations[lang][key] || key;
    };

    const handleApiKeyChange = (newKey: string) => {
        if (!config) return;
        const newModels = [...config.models];
        newModels[activeTab] = { ...newModels[activeTab], api_key: newKey };
        setConfig(new main.AppConfig({...config, models: newModels}));
    };

    const handleModelUrlChange = (newUrl: string) => {
        if (!config) return;
        const newModels = [...config.models];
        newModels[activeTab] = { ...newModels[activeTab], model_url: newUrl };
        setConfig(new main.AppConfig({...config, models: newModels}));
    };

    const handleModelNameChange = (newName: string) => {
        if (!config) return;
        const newModels = [...config.models];
        // If we rename the currently active model, we need to update current_model ID too
        const isRenamingActive = config.current_model === newModels[activeTab].model_name;
        newModels[activeTab] = { ...newModels[activeTab], model_name: newName };
        
        const newConfig = new main.AppConfig({
            ...config, 
            models: newModels,
            current_model: isRenamingActive ? newName : config.current_model
        });
        setConfig(newConfig);
    };

    const handleModelSwitch = (modelName: string) => {
        if (!config) return;
        const newConfig = new main.AppConfig({...config, current_model: modelName});
        setConfig(newConfig);
        setStatus(t("syncing"));
        SaveConfig(newConfig).then(() => {
            setStatus(t("switched"));
            setTimeout(() => setStatus(""), 1500);
        }).catch(err => {
            setStatus("Error syncing: " + err);
        });
    };

    const handleSelectDir = () => {
        if (!config) return;
        SelectProjectDir().then((dir) => {
            if (dir && dir.length > 0) {
                const newConfig = new main.AppConfig({...config, project_dir: dir});
                setConfig(newConfig);
                SaveConfig(newConfig); // Auto save project dir change
            }
        });
    };

    const handleOpenSubscribe = (modelName: string) => {
        const url = subscriptionUrls[modelName.toLowerCase()];
        if (url) {
            BrowserOpenURL(url);
        }
    };

    const handleOpenManual = () => {
        const isChinese = lang === "zh-Hans" || lang === "zh-Hant";
        const url = isChinese 
            ? "https://github.com/RapidAI/cceasy/blob/main/UserManual_CN.md" 
            : "https://github.com/RapidAI/cceasy/blob/main/UserManual_EN.md";
        BrowserOpenURL(url);
    };

    const save = () => {
        if (!config) return;
        setStatus(t("saving"));
        SaveConfig(config).then(() => {
            setStatus(t("saved"));
            setTimeout(() => setStatus(""), 2000);
        }).catch(err => {
            setStatus("Error saving: " + err);
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
                <h2 style={{color: '#3b82f6', marginBottom: '20px'}}>Claude Code Easy Suite</h2>
                <div style={{width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px'}}>
                    <div style={{
                        width: '50%', 
                        height: '100%', 
                        backgroundColor: '#3b82f6', 
                        borderRadius: '2px', 
                        animation: 'indeterminate 1.5s infinite linear'
                    }}></div>
                </div>
                <div style={{fontSize: '0.9rem', color: '#6b7280'}}>{envLog}</div>
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

    const currentModelConfig = config.models[activeTab];

    return (
        <div id="App">
            {/* Drag Handle */}
            <div style={{
                height: '30px', 
                width: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: 999, 
                '--wails-draggable': 'drag'
            } as any}></div>

            <div className="header">
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>{t("title")}</h2>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center', '--wails-draggable': 'no-drag', zIndex: 1000, position: 'relative'} as any}>
                        <select
                            value={lang}
                            onChange={handleLangChange}
                            className="btn-link"
                            style={{
                                appearance: 'none', 
                                border: 'none', 
                                background: 'transparent', 
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="en">English</option>
                            <option value="zh-Hans">简体中文</option>
                            <option value="zh-Hant">繁體中文</option>
                            <option value="ko">한국어</option>
                            <option value="ja">日本語</option>
                            <option value="de">Deutsch</option>
                            <option value="fr">Français</option>
                        </select>
                        <button 
                            className="btn-link" 
                            onClick={() => setShowAbout(true)}
                        >
                            {t("about")}
                        </button>
                        <button 
                            className="btn-link" 
                            onClick={handleOpenManual}
                        >
                            {t("manual")}
                        </button>
                        <button 
                            className="btn-link" 
                            onClick={() => BrowserOpenURL("https://github.com/BIT-ENGD/cs146s_cn")}
                        >
                            {t("cs146s")}
                        </button>
                        <button 
                            onClick={WindowHide} 
                            className="btn-hide"
                        >
                            {t("hide")}
                        </button>
                    </div>
                 </div>
            </div>

            <div className="main-content" style={{overflowY: currentModelConfig.is_custom ? 'auto' : 'hidden'}}>
                <div style={{padding: '0 20px'}}>
                    <h3 style={{fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>{t("activeModel")}</h3>
                </div>
                <div className="model-switcher">
                    {config.models.map((model) => (
                        <button
                            key={model.model_name}
                            className={`model-btn ${config.current_model === model.model_name ? 'selected' : ''}`}
                            onClick={() => handleModelSwitch(model.model_name)}
                        >
                            {model.model_name}
                        </button>
                    ))}
                </div>

                <div style={{margin: '20px 20px', borderTop: '1px solid #e5e7eb'}}></div>

                <div style={{padding: '0 20px 20px 20px'}}>
                    <div className="form-group">
                        <label className="form-label">{t("projectDir")}</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input 
                                type="text" 
                                className="form-input"
                                value={config.project_dir} 
                                readOnly
                                style={{backgroundColor: '#f9fafb', color: '#6b7280'}}
                            />
                            <button className="btn-primary" style={{padding: '10px 15px', whiteSpace: 'nowrap'}} onClick={handleSelectDir}>{t("change")}</button>
                        </div>
                    </div>

                    <div style={{marginBottom: '10px'}}>
                        <label className="form-label" style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                            <input 
                                type="checkbox" 
                                checked={yoloMode}
                                onChange={(e) => setYoloMode(e.target.checked)}
                                style={{marginRight: '8px', transform: 'scale(1.2)'}}
                            />
                            <span style={{fontWeight: 600}}>{t("yoloMode")}</span> 
                            <span style={{marginLeft:'8px', color:'#ef4444', fontSize:'0.85em'}}>{t("dangerouslySkip")}</span>
                        </label>
                    </div>
                    <button className="btn-launch" onClick={() => LaunchClaude(yoloMode, config?.project_dir || "")}>
                        {t("launchBtn")}
                    </button>
                </div>

                <div style={{margin: '25px 20px', borderTop: '2px solid #3b82f6', opacity: 0.6}}></div>

                <div style={{padding: '0 20px'}}>
                    <h3 style={{fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>{t("modelSettings")}</h3>
                </div>

                <div className="tabs">
                    {config.models.map((model, index) => (
                        <button
                            key={model.is_custom ? "custom-tab" : model.model_name}
                            className={`tab-button ${activeTab === index ? 'active' : ''}`}
                            onClick={() => setActiveTab(index)}
                        >
                            {model.is_custom ? t("custom") || "Custom" : model.model_name}
                        </button>
                    ))}
                </div>

                {currentModelConfig.is_custom && (
                <div className="form-group">
                    <label className="form-label">{t("modelName")}</label>
                    <input 
                        type="text" 
                        className="form-input"
                        value={currentModelConfig.model_name} 
                        onChange={(e) => handleModelNameChange(e.target.value)}
                        placeholder="e.g. claude-3-5-sonnet-20241022"
                    />
                </div>
                )}

                <div className="form-group">
                    <label className="form-label">{t("apiKey")}</label>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <input 
                            type="password" 
                            className="form-input"
                            value={currentModelConfig.api_key} 
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            placeholder={`${t("enterKey")} (${currentModelConfig.model_name})`}
                        />
                        {!currentModelConfig.is_custom && (
                        <button 
                            className="btn-subscribe" 
                            onClick={() => handleOpenSubscribe(currentModelConfig.model_name)}
                        >
                            {t("getKey")}
                        </button>
                        )}
                    </div>
                </div>

                {currentModelConfig.is_custom && (
                <div className="form-group">
                    <label className="form-label">{t("apiEndpoint")}</label>
                    <input 
                        type="text" 
                        className="form-input"
                        value={currentModelConfig.model_url} 
                        onChange={(e) => handleModelUrlChange(e.target.value)}
                        placeholder="https://api.example.com/v1"
                    />
                </div>
                )}

            </div>

            <div style={{padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff', textAlign: 'right'}}>
                <span style={{marginRight: '15px', fontSize: '0.9rem', color: status.includes("Error") ? 'red' : 'green'}}>{status}</span>
                <button className="btn-primary" onClick={save}>{t("saveChanges")}</button>
            </div>

            {showAbout && (
                <div className="modal-overlay" onClick={() => setShowAbout(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAbout(false)}>&times;</button>
                        <h3 style={{marginTop: 0, color: '#3b82f6'}}>Claude Code Easy Suite</h3>
                        <p style={{color: '#6b7280', margin: '5px 0'}}>Version V1.0.001 Beta</p>
                        <p style={{color: '#6b7280', margin: '5px 0'}}>Author: Dr. Daniel</p>
                        <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                            <button 
                                className="btn-primary" 
                                onClick={() => BrowserOpenURL("https://github.com/RapidAI/cceasy")}
                                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                            >
                                <span style={{fontSize: '1.2em'}}>GitHub</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
