//go:build windows

package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func init() {
	hideConsole()
}

func hideConsole() {
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	user32 := syscall.NewLazyDLL("user32.dll")

	getConsoleWindow := kernel32.NewProc("GetConsoleWindow")
	showWindow := user32.NewProc("ShowWindow")

	if getConsoleWindow.Find() == nil && showWindow.Find() == nil {
		hwnd, _, _ := getConsoleWindow.Call()
		if hwnd != 0 {
			showWindow.Call(hwnd, 0) // SW_HIDE = 0
		}
	}
}

func (a *App) platformStartup() {
	hideConsole()
}

func (a *App) CheckEnvironment() {
	go func() {
		a.log("Checking Node.js installation...")

		npmPath := "npm"
		// Check for node
		nodeCmd := exec.Command("node", "--version")
		nodeCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := nodeCmd.Run(); err != nil {
			a.log("Node.js not found. Downloading and installing...")
			if err := a.installNodeJS(); err != nil {
				a.log("Failed to install Node.js: " + err.Error())
			} else {
				a.log("Node.js installed successfully.")
				npmPath = `C:\Program Files\nodejs\npm.cmd`
			}
		} else {
			a.log("Node.js is installed.")
		}

		a.log("Checking Claude Code...")

		claudeCheckCmd := exec.Command("claude", "--version")
		claudeCheckCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		claudeExists := claudeCheckCmd.Run() == nil

		if !claudeExists {
			a.log("Claude Code not found. Installing...")
			installCmd := exec.Command(npmPath, "install", "-g", "@anthropic-ai/claude-code")
			installCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}

			if out, err := installCmd.CombinedOutput(); err != nil {
				if npmPath == "npm" {
					installCmd = exec.Command(`C:\Program Files\nodejs\npm.cmd`, "install", "-g", "@anthropic-ai/claude-code")
					installCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
					if out2, err2 := installCmd.CombinedOutput(); err2 != nil {
						a.log("Failed to install Claude Code: " + string(out) + " / " + string(out2))
					} else {
						a.log("Claude Code installed successfully. Restarting app to apply changes...")
						a.restartApp()
						return
					}
				} else {
					a.log("Failed to install Claude Code: " + string(out))
				}
			} else {
				a.log("Claude Code installed successfully. Restarting app to apply changes...")
				a.restartApp()
return
			}
		} else {
			a.log("Claude Code found. Checking for updates (npm install -g @anthropic-ai/claude-code)...")

			installCmd := exec.Command(npmPath, "install", "-g", "@anthropic-ai/claude-code")
			installCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			if out, err := installCmd.CombinedOutput(); err != nil {
				if npmPath == "npm" {
					installCmd = exec.Command(`C:\Program Files\nodejs\npm.cmd`, "install", "-g", "@anthropic-ai/claude-code")
					installCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
					if out2, err2 := installCmd.CombinedOutput(); err2 != nil {
						a.log("Failed to update Claude Code: " + string(out) + " / " + string(out2))
					} else {
						a.log("Claude Code updated successfully.")
					}
				} else {
					a.log("Failed to update Claude Code: " + string(out))
				}
			} else {
				a.log("Claude Code updated successfully.")
			}
		}

		a.log("Environment check complete.")
		runtime.EventsEmit(a.ctx, "env-check-done")
	}()
}

func (a *App) installNodeJS() error {
	arch := os.Getenv("PROCESSOR_ARCHITECTURE")
	nodeArch := ""
	switch arch {
	case "AMD64":
		nodeArch = "x64"
	case "ARM64":
		nodeArch = "arm64"
	default:
		return fmt.Errorf("unsupported architecture: %s", arch)
	}

	// It's better to fetch the latest LTS version dynamically
	// For this example, we are hardcoding the version
	nodeVersion := "20.12.2"
	fileName := fmt.Sprintf("node-v%s-%s.msi", nodeVersion, nodeArch)
	downloadURL := fmt.Sprintf("https://nodejs.org/dist/v%s/%s", nodeVersion, fileName)

	a.log(fmt.Sprintf("Downloading Node.js %s for %s...", nodeVersion, nodeArch))

	tempDir := os.TempDir()
	msiPath := filepath.Join(tempDir, fileName)

	if err := downloadFile(msiPath, downloadURL); err != nil {
		return fmt.Errorf("error downloading Node.js installer: %w", err)
	}
	defer os.Remove(msiPath)

	a.log("Installing Node.js (this may take a moment)...")
	cmd := exec.Command("msiexec", "/i", msiPath, "/qn")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("error installing Node.js: %s\n%s", err, string(output))
	}

	return nil
}

func downloadFile(filepath string, url string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func (a *App) restartApp() {
	executable, err := os.Executable()
	if err != nil {
		a.log("Failed to get executable path: " + err.Error())
		return
	}

	cmd := exec.Command("cmd", "/c", "start", "", executable)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	if err := cmd.Start(); err != nil {
		a.log("Failed to restart: " + err.Error())
	} else {
		runtime.Quit(a.ctx)
	}
}

func (a *App) LaunchClaude(yoloMode bool, projectDir string) {
	args := []string{"/c", "start", "cmd.exe", "/k", "claude"}
	if yoloMode {
		args = append(args, "--dangerously-skip-permissions")
	}
	
	cmd := exec.Command("cmd.exe", args...)
	if projectDir != "" {
		cmd.Dir = projectDir
	}
	
	cmd.Env = os.Environ()
	
	if err := cmd.Start(); err != nil {
		a.log("Failed to launch Claude: " + err.Error())
	}
}

func (a *App) syncToSystemEnv(config AppConfig) {
	var selectedModel *ModelConfig
	for _, m := range config.Models {
		if m.ModelName == config.CurrentModel {
			selectedModel = &m
			break
		}
	}

	if selectedModel == nil {
		return
	}

	baseUrl := getBaseUrl(selectedModel)

	// Set environment variables for the current process immediately
	os.Setenv("ANTHROPIC_AUTH_TOKEN", selectedModel.ApiKey)
	os.Setenv("ANTHROPIC_BASE_URL", baseUrl)

	// Set persistent environment variables on Windows in a goroutine because setx is slow
	go func() {
		cmd1 := exec.Command("setx", "ANTHROPIC_AUTH_TOKEN", selectedModel.ApiKey)
		cmd1.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		cmd1.Run()

		cmd2 := exec.Command("setx", "ANTHROPIC_BASE_URL", baseUrl)
		cmd2.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		cmd2.Run()
	}()
}
