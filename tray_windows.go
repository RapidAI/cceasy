//go:build windows

package main

import (
	"context"
	stdruntime "runtime"
	"time"

	"github.com/energye/systray"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func setupTray(app *App, appOptions *options.App) {
	appOptions.OnStartup = func(ctx context.Context) {
		app.startup(ctx)

		go func() {
			// Lock the OS thread for the systray message loop on Windows
			stdruntime.LockOSThread()
			
			systray.Run(func() {
				systray.SetIcon(icon)
				systray.SetTitle("AICoder")
				systray.SetTooltip("AICoder Dashboard")
				systray.SetOnDClick(func(menu systray.IMenu) {
					go func() {
						runtime.WindowShow(app.ctx)
						runtime.WindowSetAlwaysOnTop(app.ctx, true)
						runtime.WindowSetAlwaysOnTop(app.ctx, false)
					}()
				})

			mShow := systray.AddMenuItem("Show", "Show Main Window")
			mLaunch := systray.AddMenuItem("开始编程", "Start Coding")
			systray.AddSeparator()

			// Tool menu items map
			toolItems := make(map[string]*systray.MenuItem)

			// Load config to populate tray
			config, _ := app.LoadConfig()

			// 1. Claude Code Submenu
			mClaude := systray.AddMenuItem("Claude Code", "Claude Code Models")
			for _, model := range config.Claude.Models {
				m := mClaude.AddSubMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.Claude.CurrentModel && config.ActiveTool == "claude")
				toolItems["claude-"+model.ModelName] = m

				modelName := model.ModelName
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						currentConfig.Claude.CurrentModel = modelName
						currentConfig.ActiveTool = "claude"
						app.SaveConfig(currentConfig)

						for _, m := range currentConfig.Claude.Models {
							if m.ModelName == modelName && m.ApiKey == "" {
								runtime.WindowShow(app.ctx)
								break
							}
						}
					}()
				})
			}

			// 2. Gemini CLI Submenu
			mGemini := systray.AddMenuItem("Gemini CLI", "Gemini CLI Models")
			for _, model := range config.Gemini.Models {
				m := mGemini.AddSubMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.Gemini.CurrentModel && config.ActiveTool == "gemini")
				toolItems["gemini-"+model.ModelName] = m

				modelName := model.ModelName
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						currentConfig.Gemini.CurrentModel = modelName
						currentConfig.ActiveTool = "gemini"
						app.SaveConfig(currentConfig)

						for _, m := range currentConfig.Gemini.Models {
							if m.ModelName == modelName && m.ApiKey == "" {
								runtime.WindowShow(app.ctx)
								break
							}
						}
					}()
				})
			}

			// 3. Codex Submenu
			mCodex := systray.AddMenuItem("OpenAI Codex", "Codex Models")
			for _, model := range config.Codex.Models {
				m := mCodex.AddSubMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.Codex.CurrentModel && config.ActiveTool == "codex")
				toolItems["codex-"+model.ModelName] = m

				modelName := model.ModelName
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						currentConfig.Codex.CurrentModel = modelName
						currentConfig.ActiveTool = "codex"
						app.SaveConfig(currentConfig)

						for _, m := range currentConfig.Codex.Models {
							if m.ModelName == modelName && m.ApiKey == "" {
								runtime.WindowShow(app.ctx)
								break
							}
						}
					}()
				})
			}

			// 4. OpenCode Submenu
			mOpenCode := systray.AddMenuItem("OpenCode AI", "OpenCode Models")
			for _, model := range config.Opencode.Models {
				m := mOpenCode.AddSubMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.Opencode.CurrentModel && config.ActiveTool == "opencode")
				toolItems["opencode-"+model.ModelName] = m

				modelName := model.ModelName
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						currentConfig.Opencode.CurrentModel = modelName
						currentConfig.ActiveTool = "opencode"
						app.SaveConfig(currentConfig)

						for _, m := range currentConfig.Opencode.Models {
							if m.ModelName == modelName && m.ApiKey == "" {
								runtime.WindowShow(app.ctx)
								break
							}
						}
					}()
				})
			}

			// 5. CodeBuddy Submenu
			mCodeBuddy := systray.AddMenuItem("CodeBuddy AI", "CodeBuddy Models")
			for _, model := range config.CodeBuddy.Models {
				m := mCodeBuddy.AddSubMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.CodeBuddy.CurrentModel && config.ActiveTool == "codebuddy")
				toolItems["codebuddy-"+model.ModelName] = m

				modelName := model.ModelName
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						currentConfig.CodeBuddy.CurrentModel = modelName
						currentConfig.ActiveTool = "codebuddy"
						app.SaveConfig(currentConfig)

						for _, m := range currentConfig.CodeBuddy.Models {
							if m.ModelName == modelName && m.ApiKey == "" {
								runtime.WindowShow(app.ctx)
								break
							}
						}
					}()
				})
			}

			// 6. Qoder CLI Submenu
			mQoder := systray.AddMenuItem("Qoder CLI", "Qoder Models")
			for _, model := range config.Qoder.Models {
				m := mQoder.AddSubMenuItemCheckbox(model.ModelName, "Switch to "+model.ModelName, model.ModelName == config.Qoder.CurrentModel && config.ActiveTool == "qoder")
				toolItems["qoder-"+model.ModelName] = m

				modelName := model.ModelName
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						currentConfig.Qoder.CurrentModel = modelName
						currentConfig.ActiveTool = "qoder"
						app.SaveConfig(currentConfig)

						for _, m := range currentConfig.Qoder.Models {
							if m.ModelName == modelName && m.ApiKey == "" {
								runtime.WindowShow(app.ctx)
								break
							}
						}
					}()
				})
			}

			systray.AddSeparator()
			mQuit := systray.AddMenuItem("Quit", "Quit Application")

			// Register update function
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

			// Register config change listener
			OnConfigChanged = func(cfg AppConfig) {
				if toolItems == nil {
					return
				}
				for key, item := range toolItems {
					// Only check the currently active tool's current model
					if (cfg.ActiveTool == "claude" && key == "claude-"+cfg.Claude.CurrentModel) ||
						(cfg.ActiveTool == "gemini" && key == "gemini-"+cfg.Gemini.CurrentModel) ||
						(cfg.ActiveTool == "codex" && key == "codex-"+cfg.Codex.CurrentModel) ||
						(cfg.ActiveTool == "opencode" && key == "opencode-"+cfg.Opencode.CurrentModel) ||
						(cfg.ActiveTool == "codebuddy" && key == "codebuddy-"+cfg.CodeBuddy.CurrentModel) ||
						(cfg.ActiveTool == "qoder" && key == "qoder-"+cfg.Qoder.CurrentModel) {
						item.Check()
					} else {
						item.Uncheck()
					}
				}
				runtime.EventsEmit(app.ctx, "config-changed", cfg)
			}

			// Handle menu clicks
			mShow.Click(func() {
				go runtime.WindowShow(app.ctx)
			})

			mLaunch.Click(func() {
				go func() {
					currentConfig, _ := app.LoadConfig()
					path := app.GetCurrentProjectPath()
					app.LaunchTool(currentConfig.ActiveTool, false, path)
				}()
			})

			mQuit.Click(func() {
				go func() {
					systray.Quit()
					runtime.Quit(app.ctx)
				}()
			})

			if app.CurrentLanguage != "" {
				go func() {
					time.Sleep(500 * time.Millisecond)
					UpdateTrayMenu(app.CurrentLanguage)
				}()
			}
		}, func() {
			// Cleanup logic on exit
		})
		}()
	}
}
