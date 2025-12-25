//go:build darwin

package main

import (
	"context"
	"time"

	"github.com/energye/systray"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func setupTray(app *App, appOptions *options.App) {
	// We still use a basic Application Menu for macOS to support standard shortcuts (Copy/Paste)
	appMenu := menu.NewMenu()
	appMenu.Append(menu.AppMenu())
	appMenu.Append(menu.EditMenu())
	appOptions.Menu = appMenu

	appOptions.OnStartup = func(ctx context.Context) {
		app.startup(ctx)

		// Start energye/systray in a goroutine
		go systray.Run(func() {
			systray.SetIcon(icon)
			// Do not set title for macOS as requested
			systray.SetTooltip("Claude Config Manager")
			
			// Ensure clicking the icon shows the menu immediately on macOS
			systray.CreateMenu()

			mShow := systray.AddMenuItem("Show Main Window", "Show Main Window")
			mLaunch := systray.AddMenuItem("Launch Claude Code", "Launch Claude Code in Terminal")
			systray.AddSeparator()

			// Model menu items map
			modelItems := make(map[string]*systray.MenuItem)

			// Load config to populate tray
			config, _ := app.LoadConfig()
			for _, model := range config.Models {
				modelName := model.ModelName
				m := systray.AddMenuItemCheckbox(modelName, "Switch to "+modelName, modelName == config.CurrentModel)
				modelItems[modelName] = m
				
				m.Click(func() {
					go func() {
						currentConfig, _ := app.LoadConfig()
						// Check if target model has API key
						for _, m := range currentConfig.Models {
							if m.ModelName == modelName {
								if m.ApiKey == "" {
									runtime.WindowShow(app.ctx)
									return
								}
								break
							}
						}
						currentConfig.CurrentModel = modelName
						app.SaveConfig(currentConfig)
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
				systray.SetTooltip(t["title"])
				mShow.SetTitle(t["show"])
				mLaunch.SetTitle(t["launch"])
				mQuit.SetTitle(t["quit"])
			}

			// Register config change listener
			OnConfigChanged = func(cfg AppConfig) {
				for name, item := range modelItems {
					if name == cfg.CurrentModel {
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
					cfg, _ := app.LoadConfig()
					app.LaunchClaude(false, cfg.ProjectDir)
				}()
			})

			mQuit.Click(func() {
				go func() {
					systray.Quit()
					runtime.Quit(app.ctx)
				}()
			})

			// Initial language sync
			if app.CurrentLanguage != "" {
				go func() {
					time.Sleep(500 * time.Millisecond)
					UpdateTrayMenu(app.CurrentLanguage)
				}()
			}
		}, func() {})
	}
}
