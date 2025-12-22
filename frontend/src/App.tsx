import {useEffect, useState} from 'react';
import './App.css';
import {LoadConfig, SaveConfig, CheckEnvironment, ResizeWindow, LaunchClaude, SelectProjectDir} from "../wailsjs/go/main/App";
import {WindowHide, EventsOn, EventsOff, BrowserOpenURL} from "../wailsjs/runtime";
import {main} from "../wailsjs/go/models";

const subscriptionUrls: {[key: string]: string} = {
    "glm": "https://bigmodel.cn/glm-coding",
    "kimi": "https://www.kimi.com/membership/pricing?from=upgrade_plan&track_id=1d2446f5-f45f-4ae5-961e-c0afe936a115",
    "doubao": "https://www.volcengine.com/activity/codingplan"
};

function App() {
    const [config, setConfig] = useState<main.AppConfig | null>(null);
    const [status, setStatus] = useState("");
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [envLog, setEnvLog] = useState("Initializing...");
    const [yoloMode, setYoloMode] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        // Environment Check Logic
        const logHandler = (msg: string) => setEnvLog(msg);
        const doneHandler = () => {
            ResizeWindow(1024, 768);
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

    const handleApiKeyChange = (newKey: string) => {
        if (!config) return;
        const newModels = [...config.models];
        newModels[activeTab].api_key = newKey;
        setConfig(new main.AppConfig({...config, models: newModels}));
    };

    const handleModelSwitch = (modelName: string) => {
        if (!config) return;
        const newConfig = new main.AppConfig({...config, current_model: modelName});
        setConfig(newConfig);
        setStatus("Syncing to Claude Code...");
        SaveConfig(newConfig).then(() => {
            setStatus("Model switched & synced!");
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

    const save = () => {
        if (!config) return;
        setStatus("Saving...");
        SaveConfig(config).then(() => {
            setStatus("Saved successfully!");
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

    if (!config) return <div className="main-content" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>Loading config...</div>;

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
                    <h2>Claude Code Easy Suite</h2>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center', '--wails-draggable': 'no-drag', zIndex: 1000, position: 'relative'} as any}>
                        <button 
                            className="btn-link" 
                            onClick={() => setShowAbout(true)}
                        >
                            About
                        </button>
                        <button 
                            className="btn-link" 
                            onClick={() => BrowserOpenURL("https://github.com/BIT-ENGD/cs146s_cn")}
                        >
                            CS146s 中文版
                        </button>
                        <button 
                            onClick={WindowHide} 
                            className="btn-hide"
                        >
                            Hide
                        </button>
                    </div>
                 </div>
            </div>

            <div className="main-content">
                <div style={{padding: '0 20px 20px 20px'}}>
                    <h3 style={{fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Launch</h3>
                    
                    <div className="form-group">
                        <label className="form-label">Project Directory</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input 
                                type="text" 
                                className="form-input"
                                value={config.project_dir} 
                                readOnly
                                style={{backgroundColor: '#f9fafb', color: '#6b7280'}}
                            />
                            <button className="btn-primary" style={{padding: '10px 15px', whiteSpace: 'nowrap'}} onClick={handleSelectDir}>Change</button>
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
                            <span style={{fontWeight: 600}}>Yolo Mode</span> 
                            <span style={{marginLeft:'8px', color:'#ef4444', fontSize:'0.85em'}}>(Dangerously Skip Permissions)</span>
                        </label>
                    </div>
                    <button className="btn-launch" onClick={() => LaunchClaude(yoloMode, config?.project_dir || "")}>
                        Launch Claude Code
                    </button>
                </div>
                
                <div style={{margin: '0 20px 20px', borderTop: '1px solid #e5e7eb'}}></div>

                <div style={{padding: '0 20px'}}>
                    <h3 style={{fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Active Model</h3>
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

                <div style={{margin: '25px 20px', borderTop: '2px solid #3b82f6', opacity: 0.6}}></div>

                <div style={{padding: '0 20px'}}>
                    <h3 style={{fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px'}}>Model Settings</h3>
                </div>

                <div className="tabs">
                    {config.models.map((model, index) => (
                        <button
                            key={model.model_name}
                            className={`tab-button ${activeTab === index ? 'active' : ''}`}
                            onClick={() => setActiveTab(index)}
                        >
                            {model.model_name}
                        </button>
                    ))}
                </div>

                <div className="form-group">
                    <label className="form-label">API Key</label>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <input 
                            type="password" 
                            className="form-input"
                            value={currentModelConfig.api_key} 
                            onChange={(e) => handleApiKeyChange(e.target.value)}
                            placeholder={`Enter ${currentModelConfig.model_name} API Key`}
                        />
                        <button 
                            className="btn-subscribe" 
                            onClick={() => handleOpenSubscribe(currentModelConfig.model_name)}
                        >
                            Get Key
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">API Endpoint</label>
                    <input 
                        type="text" 
                        className="form-input"
                        value={currentModelConfig.model_url} 
                        readOnly
                        style={{backgroundColor: '#f9fafb', color: '#6b7280'}}
                    />
                </div>

            </div>

            <div style={{padding: '20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff', textAlign: 'right'}}>
                <span style={{marginRight: '15px', fontSize: '0.9rem', color: status.includes("Error") ? 'red' : 'green'}}>{status}</span>
                <button className="btn-primary" onClick={save}>Save Changes</button>
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
