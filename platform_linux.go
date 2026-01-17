//go:build linux
// +build linux

package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	wails_runtime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) platformStartup() {
}

// platformInitConsole is a no-op on Linux (console is already available)
func (a *App) platformInitConsole() {
	// No-op on Linux
}

// RunEnvironmentCheckCLI runs environment check in command-line mode
func (a *App) RunEnvironmentCheckCLI() {
	fmt.Println("Init mode not fully implemented for Linux yet.")
	// TODO: Port logic from CheckEnvironment
}

func (a *App) CheckEnvironment(force bool) {
	go func() {
		// If in init mode, always force
		if a.IsInitMode {
			force = true
			a.log(a.tr("Init mode: Forcing environment check (ignoring configuration)."))
		}

		// If .cceasy directory doesn't exist, force environment check
		home := a.GetUserHomeDir()
		ccDir := filepath.Join(home, ".cceasy")
		if _, err := os.Stat(ccDir); os.IsNotExist(err) {
			force = true
			a.log(a.tr("Detected missing .cceasy directory. Forcing environment check..."))
		}

		if force {
			a.log(a.tr("Forced environment check triggered (ignoring configuration)."))
		} else {
			// Check config first
			config, err := a.LoadConfig()
			if err == nil && config.PauseEnvCheck {
				a.log(a.tr("Skipping environment check and installation."))
				a.emitEvent("env-check-done")
				return
			}
		}

		a.log(a.tr("Checking Node.js installation..."))

		home, _ := os.UserHomeDir()
		localNodeDir := filepath.Join(home, ".cceasy", "tools")
		localBinDir := filepath.Join(localNodeDir, "bin")

		// 1. Setup PATH
	envPath := os.Getenv("PATH")
		commonPaths := []string{"/usr/local/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"}

		// Add local node bin to PATH
		commonPaths = append([]string{localBinDir}, commonPaths...)

		newPathParts := strings.Split(envPath, ":")
		pathChanged := false
		for _, p := range commonPaths {
			if !contains(newPathParts, p) {
				newPathParts = append([]string{p}, newPathParts...) // Prepend for priority
				pathChanged = true
			}
		}

		if pathChanged {
			envPath = strings.Join(newPathParts, ":")
			os.Setenv("PATH", envPath)
			a.log(a.tr("Updated PATH: ") + envPath)
		}

		// 2. Search for Node.js
		nodePath, err := exec.LookPath("node")
		if err != nil {
			for _, p := range commonPaths {
				fullPath := filepath.Join(p, "node")
				if _, err := os.Stat(fullPath); err == nil {
					nodePath = fullPath
					break
				}
			}
		}

		// 3. If still not found, try to install
		if nodePath == "" {
			a.log(a.tr("Node.js not found. Attempting manual installation..."))
			if err := a.installNodeJSManually(localNodeDir); err != nil {
				a.log(a.tr("Manual installation failed: ") + err.Error())
				wails_runtime.EventsEmit(a.ctx, "env-check-done")
				return
			}
			a.log(a.tr("Node.js manually installed to ") + localNodeDir)

			// Re-check for node
			localNodePath := filepath.Join(localBinDir, "node")
			if _, err := os.Stat(localNodePath); err == nil {
				nodePath = localNodePath
			}

			if nodePath == "" {
				a.log(a.tr("Node.js installation completed but binary not found."))
				wails_runtime.EventsEmit(a.ctx, "env-check-done")
				return
			}
		}

		a.log(a.tr("Node.js found at: ") + nodePath)

		// 4. Check for npm
		npmPath, err := exec.LookPath("npm")
		if err != nil {
			localNpmPath := filepath.Join(localBinDir, "npm")
			if _, err := os.Stat(localNpmPath); err == nil {
				npmPath = localNpmPath
			}
		}

		if npmPath == "" {
			a.log(a.tr("npm not found. Check Node.js installation."))
			wails_runtime.EventsEmit(a.ctx, "env-check-done")
			return
		}

		// 5. Check AI Tools
		tm := NewToolManager(a)
		tools := []string{"claude", "gemini", "codex", "opencode", "codebuddy", "qoder", "iflow", "kiro"}

		for _, tool := range tools {
			a.log(a.tr("Checking %s...", tool))
			status := tm.GetToolStatus(tool)

			if !status.Installed {
				a.log(a.tr("%s not found. Installing...", tool))
				if err := tm.InstallTool(tool); err != nil {
					a.log(a.tr("ERROR: Failed to install %s: %v", tool, err))
				} else {
					a.log(a.tr("%s installed successfully.", tool))
				}
			} else {
				a.log(a.tr("%s found at %s (version: %s).", tool, status.Path, status.Version))
				
				// Update check
				if tool == "codex" || tool == "opencode" || tool == "codebuddy" || tool == "qoder" || tool == "iflow" || tool == "gemini" || tool == "claude" || tool == "kiro" {
					a.log(a.tr("Checking for %s updates...", tool))
					latest, err := a.getLatestNpmVersion(npmPath, tm.GetPackageName(tool))
					if err == nil && latest != "" && latest != status.Version {
						a.log(a.tr("New version available for %s: %s (current: %s). Updating...", tool, latest, status.Version))
						if err := tm.UpdateTool(tool); err != nil {
							a.log(a.tr("ERROR: Failed to update %s: %v", tool, err))
						} else {
							a.log(a.tr("%s updated successfully to %s.", tool, latest))
						}
					}
				}
			}
		}

		a.log(a.tr("Environment check complete."))
		a.emitEvent("env-check-done")
	}()
}

func (a *App) installNodeJSManually(targetDir string) error {
	// Simple download and unpack for Linux (assuming x64 for now, or detect)
	nodeVersion := RequiredNodeVersion
	arch := "x64"
	if runtime.GOARCH == "arm64" {
		arch = "arm64"
	}
	
	fileName := fmt.Sprintf("node-v%s-linux-%s.tar.gz", nodeVersion, arch)
	url := fmt.Sprintf("https://nodejs.org/dist/v%s/%s", nodeVersion, fileName)
	if strings.HasPrefix(strings.ToLower(a.CurrentLanguage), "zh") {
		url = fmt.Sprintf("https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v%s/%s", nodeVersion, fileName)
	}

	a.log(a.tr("Downloading Node.js from %s...", url))

	tempDir := os.TempDir()
	tarPath := filepath.Join(tempDir, fileName)

	// Download
	if err := a.downloadFile(tarPath, url); err != nil {
		return err
	}
	defer os.Remove(tarPath)

	a.log(a.tr("Extracting Node.js..."))
	
	// Ensure target dir exists
	os.MkdirAll(targetDir, 0755)

	// Use tar command to extract
	cmd := exec.Command("tar", "-xzf", tarPath, "--strip-components=1", "-C", targetDir)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("tar failed: %s\n%s", err, string(output))
	}

	return nil
}

func (a *App) downloadFile(filepath string, url string) error {
	// Reusing same logic as windows, assuming it works cross-platform
	// Or define it in app.go and remove from platform_*.go?
	// For now, duplicate or keep local if slightly different
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")
	client := &http.Client{Timeout: 300 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, resp.Body)
	return err
}

func (a *App) restartApp() {
	// Basic restart for linux
	executable, err := os.Executable()
	if err != nil {
		return
	}
	exec.Command(executable).Start()
	wails_runtime.Quit(a.ctx)
}

func (a *App) GetDownloadsFolder() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, "Downloads"), nil
}

func (a *App) platformLaunch(binaryName string, yoloMode bool, adminMode bool, pythonEnv string, projectDir string, env map[string]string, modelId string) {
	// Linux launch implementation
	tm := NewToolManager(a)
	status := tm.GetToolStatus(binaryName)
	if !status.Installed {
		a.ShowMessage("Error", "Tool not installed")
		return
	}
	
	cmdArgs := []string{}
	if binaryName == "codebuddy" && modelId != "" {
		cmdArgs = append(cmdArgs, "--model", modelId)
	}

	if yoloMode {
		switch binaryName {
		case "claude":
			cmdArgs = append(cmdArgs, "--dangerously-skip-permissions")
		case "gemini":
			cmdArgs = append(cmdArgs, "--yolo")
		case "codex":
			cmdArgs = append(cmdArgs, "--full-auto")
		case "codebuddy":
			cmdArgs = append(cmdArgs, "-y")
		case "iflow":
			cmdArgs = append(cmdArgs, "-y")
		case "qodercli", "qoder":
			cmdArgs = append(cmdArgs, "--yolo")
		}
	}
	
	// Simple terminal launch (x-terminal-emulator or similar)
	// For now just background process or basic attempt
	// A robust solution needs to handle various terminal emulators
	
	// Create shell script wrapper
	scriptPath := filepath.Join(os.TempDir(), fmt.Sprintf("aicoder_launch_%d.sh", time.Now().UnixNano()))
	scriptContent := "#!/bin/bash\n"
	scriptContent += fmt.Sprintf("cd \"%s\"\n", projectDir)
	for k, v := range env {
		scriptContent += fmt.Sprintf("export %s=\"%s\"\n", k, v)
	}
	
	// Add local node to PATH
	home, _ := os.UserHomeDir()
	localBin := filepath.Join(home, ".cceasy", "tools", "bin")
	scriptContent += fmt.Sprintf("export PATH=\"%s:$PATH\"\n", localBin)
	
	scriptContent += fmt.Sprintf("\"%s\" %s\n", status.Path, strings.Join(cmdArgs, " "))
	scriptContent += "echo 'Press Enter to close...\nread\n"
	
os.WriteFile(scriptPath, []byte(scriptContent), 0755)
	
	// Try to open terminal
	terminals := []string{"x-terminal-emulator", "gnome-terminal", "konsole", "xterm"}
	var cmd *exec.Cmd
	for _, t := range terminals {
		if _, err := exec.LookPath(t); err == nil {
			if t == "gnome-terminal" {
				cmd = exec.Command(t, "--", scriptPath)
			} else {
				cmd = exec.Command(t, "-e", scriptPath)
			}
			break
		}
	}
	
	if cmd != nil {
		cmd.Start()
	} else {
		a.log("No supported terminal emulator found.")
	}
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func createVersionCmd(path string) *exec.Cmd {
	return exec.Command(path, "--version")
}

func createHiddenCmd(name string, args ...string) *exec.Cmd {
	return exec.Command(name, args...)
}

func createNpmInstallCmd(npmPath string, args []string) *exec.Cmd {