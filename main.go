package main

import (
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Check for command line arguments
	args := os.Args
	if len(args) > 1 {
		for _, arg := range args[1:] {
			if arg == "init" {
				app.IsInitMode = true
				break
			}
		}
	}

	// Platform specific early initialization (like hiding console on Windows)
	app.platformStartup()

	// Create application with options
	appOptions := &options.App{
		Title:     "AICoder",
		Frameless: true,
		Width:     510,
		Height:    259,
		OnStartup: app.startup,
		OnDomReady: app.domReady,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "aicoder-lock",
			OnSecondInstanceLaunch: func(secondInstanceData options.SecondInstanceData) {
				if app.ctx == nil {
					return
				}
				
				// Check if init argument was passed to the second instance
				for _, arg := range secondInstanceData.Args {
					if arg == "init" {
						go app.CheckEnvironment(true)
						break
					}
				}

				go func() {
					runtime.WindowUnminimise(app.ctx)
					runtime.WindowShow(app.ctx)
					runtime.WindowSetAlwaysOnTop(app.ctx, true)
					runtime.WindowSetAlwaysOnTop(app.ctx, false)
				}()
			},
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 0},
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			BackdropType:         windows.Auto,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHidden(),
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
		},
		Linux: &linux.Options{
			Icon: icon,
		},
	}

	// Platform specific tray/menu setup
	setupTray(app, appOptions)

	err := wails.Run(appOptions)

	if err != nil {
		println("Error:", err.Error())
	}
}