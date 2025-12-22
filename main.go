package main

import (
	"context"
	"embed"

	"github.com/energye/systray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var icon []byte

var modelMenuItems = make(map[string]*systray.MenuItem)

var trayTranslations = map[string]map[string]string{
	"en": {
		"title":  "Claude Config Manager",
		"show":   "Show Main Window",
		"launch": "Launch Claude Code",
		"quit":   "Quit Application",
	},
	"zh-Hans": {
		"title":  "Claude 配置管理器",
		"show":   "显示主窗口",
		"launch": "启动 Claude Code",
		"quit":   "退出程序",
	},
	"zh-Hant": {
		"title":  "Claude 配置管理器",
		"show":   "顯示主視窗",
		"launch": "啟動 Claude Code",
		"quit":   "退出程式",
	},
	"ko": {
		"title":  "Claude 구성 관리자",
		"show":   "메인 창 표시",
		"launch": "Claude Code 시작",
		"quit":   "프로그램 종료",
	},
	"ja": {
		"title":  "Claude 設定マネージャー",
		"show":   "メインウィンドウを表示",
		"launch": "Claude Code を起動",
		"quit":   "終了",
	},
	"de": {
		"title":  "Claude Konfigurationsmanager",
		"show":   "Hauptfenster anzeigen",
		"launch": "Claude Code starten",
		"quit":   "Beenden",
	},
	"fr": {
		"title":  "Gestionnaire de configuration Claude",
		"show":   "Afficher la fenêtre principale",
		"launch": "Lancer Claude Code",
		"quit":   "Quitter",
	},
}

func updateTrayItems(config AppConfig) {
	for name, item := range modelMenuItems {
		if name == config.CurrentModel {
			item.Check()
		} else {
			item.Uncheck()
		}
	}
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	OnConfigChanged = func(cfg AppConfig) {
		updateTrayItems(cfg)
		// Emit event to frontend to ensure sync
		runtime.EventsEmit(app.ctx, "config-changed", cfg)
	}

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "Claude Code Easy Suite",
		Frameless: true,
		Width:     396,
		Height:    250,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "claude-code-easy-suite-lock",
			OnSecondInstanceLaunch: func(secondInstanceData options.SecondInstanceData) {
				runtime.WindowUnminimise(app.ctx)
				runtime.WindowShow(app.ctx)
				runtime.WindowSetAlwaysOnTop(app.ctx, true)
				runtime.WindowSetAlwaysOnTop(app.ctx, false)
			},
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)

			go systray.Run(func() {
				systray.SetIcon(icon)
				systray.SetTitle("Claude Config Manager")
				systray.SetTooltip("Claude Config Manager")

				mShow := systray.AddMenuItem("Show", "Show Main Window")
				mLaunch := systray.AddMenuItem("Launch Claude Code", "Launch Claude Code in Terminal")
				systray.AddSeparator()

				// Load config to populate tray
				config, _ := app.LoadConfig()
				for _, model := range config.Models {
					m := systray.AddMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.CurrentModel)
					modelMenuItems[model.ModelName] = m
					
					// Capture variable for closure
					modelName := model.ModelName
					m.Click(func() {
						// Reload config to ensure we have latest
						currentConfig, _ := app.LoadConfig()
						currentConfig.CurrentModel = modelName
						app.SaveConfig(currentConfig)
					})
				}

				systray.AddSeparator()
				mQuit := systray.AddMenuItem("Quit", "Quit Application")

				// Implement tray update function
				UpdateTrayMenu = func(lang string) {
					t, ok := trayTranslations[lang]
					if !ok {
						t = trayTranslations["en"]
					}

					systray.SetTitle(t["title"])
					systray.SetTooltip(t["title"])
					
					mShow.SetTitle(t["show"])
					mLaunch.SetTitle(t["launch"])
					mQuit.SetTitle(t["quit"])
				}

				// Handle menu clicks
				mShow.Click(func() {
					runtime.WindowShow(app.ctx)
				})

				mLaunch.Click(func() {
					cfg, _ := app.LoadConfig()
					app.LaunchClaude(false, cfg.ProjectDir)
				})

				mQuit.Click(func() {
					systray.Quit()
					runtime.Quit(app.ctx)
				})

				// Handle tray icon click
				systray.SetOnClick(func(menu systray.IMenu) {
					runtime.WindowShow(app.ctx)
				})

				systray.SetOnRClick(func(menu systray.IMenu) {
					menu.ShowMenu()
				})

				systray.SetOnDClick(func(menu systray.IMenu) {
					runtime.WindowShow(app.ctx)
				})
			}, func() {
				// Cleanup if needed
			})
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
