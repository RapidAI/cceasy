//go:build darwin

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

	wails_runtime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) platformStartup() {
	// No terminal to hide on macOS
}

func (a *App) CheckEnvironment() {
	go func() {
		a.log("Checking Node.js installation...")
		
		home, _ := os.UserHomeDir()
		localNodeDir := filepath.Join(home, ".cceasy", "node")
		localBinDir := filepath.Join(localNodeDir, "bin")

		// 1. Setup PATH correctly for GUI apps on macOS
		envPath := os.Getenv("PATH")
		commonPaths := []string{"/usr/local/bin", "/opt/homebrew/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"}
		
		commonPaths = append(commonPaths, filepath.Join(home, ".npm-global/bin"))
		
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
			a.log("Updated PATH: " + envPath)
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
			a.log("Node.js not found. Checking for Homebrew...")
			
			brewExec, _ := exec.LookPath("brew")
			if brewExec == "" {
				for _, p := range []string{"/opt/homebrew/bin/brew", "/usr/local/bin/brew"} {
					if _, err := os.Stat(p); err == nil {
						brewExec = p
						break
					}
				}
			}

			if brewExec != "" {
				a.log("Installing Node.js via Homebrew...")
				cmd := exec.Command(brewExec, "install", "node")
				if err := cmd.Run(); err != nil {
					a.log("Homebrew installation failed.")
				} else {
					a.log("Node.js installed via Homebrew.")
				}
			} else {
				a.log("Homebrew not found. Attempting manual installation...")
				if err := a.installNodeJSManually(localNodeDir); err != nil {
					a.log("Manual installation failed: " + err.Error())
					wails_runtime.EventsEmit(a.ctx, "env-check-done")
					return
				}
				a.log("Node.js manually installed to " + localNodeDir)
			}
			
			a.log("Verifying Node.js installation...")
			
			// Re-check for node
			nodePath, err = exec.LookPath("node")
			if err != nil {
				// Check explicitly in local bin if LookPath fails
				localNodePath := filepath.Join(localBinDir, "node")
				if _, err := os.Stat(localNodePath); err == nil {
					nodePath = localNodePath
				}
			}
			
			if nodePath == "" {
				a.log("Node.js installation completed but binary not found.")
				wails_runtime.EventsEmit(a.ctx, "env-check-done")
				return
			}
		}

		a.log("Node.js found at: " + nodePath)

		// 4. Search for npm
		npmExec, err := exec.LookPath("npm")
		if err != nil {
			localNpmPath := filepath.Join(localBinDir, "npm")
			if _, err := os.Stat(localNpmPath); err == nil {
				npmExec = localNpmPath
			}
		}
		
		if npmExec == "" {
			a.log("npm not found.")
			wails_runtime.EventsEmit(a.ctx, "env-check-done")
			return
		}

		// 5. Check and Install AI Tools
		tm := NewToolManager(a)
		tools := []string{"claude", "gemini", "codex", "opencode", "codebuddy", "qoder"}
		
		for _, tool := range tools {
			a.log(fmt.Sprintf("Checking %s...", tool))
			status := tm.GetToolStatus(tool)
			
			if !status.Installed {
				a.log(fmt.Sprintf("%s not found. Attempting automatic installation...", tool))
				if err := tm.InstallTool(tool); err != nil {
					a.log(fmt.Sprintf("ERROR: Failed to install %s: %v", tool, err))
					// We continue to other tools even if one fails, allowing manual intervention later
				} else {
					a.log(fmt.Sprintf("%s installed successfully.", tool))
				}
			} else {
				a.log(fmt.Sprintf("%s found (version: %s).", tool, status.Version))
				// Check for updates for opencode and codebuddy
				if tool == "opencode" || tool == "codebuddy" || tool == "qoder" {
					a.log(fmt.Sprintf("Checking for %s updates...", tool))
					latest, err := a.getLatestNpmVersion(npmExec, tm.GetPackageName(tool))
					if err == nil && latest != "" && latest != status.Version {
						a.log(fmt.Sprintf("New version available for %s: %s (current: %s). Updating...", tool, latest, status.Version))
						if err := tm.InstallTool(tool); err != nil {
							a.log(fmt.Sprintf("ERROR: Failed to update %s: %v", tool, err))
						} else {
							a.log(fmt.Sprintf("%s updated successfully to %s.", tool, latest))
						}
					}
				}
			}
		}

		a.log("Environment check complete.")
		wails_runtime.EventsEmit(a.ctx, "env-check-done")
	}()
}

func (a *App) installNodeJSManually(destDir string) error {
	arch := runtime.GOARCH
	if arch == "amd64" {
		arch = "x64" // Node uses x64 for amd64
	}
	
	version := "v" + RequiredNodeVersion
	fileName := fmt.Sprintf("node-%s-darwin-%s.tar.gz", version, arch)
	url := fmt.Sprintf("https://nodejs.org/dist/%s/%s", version, fileName)
	
	a.log("Downloading Node.js from " + url)
	
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	// Create a temp file for the tarball
	tempFile, err := os.CreateTemp("", "node-*.tar.gz")
	if err != nil {
		return fmt.Errorf("failed to create temp file: %v", err)
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	a.log("Saving download to temp file...")
	if _, err := io.Copy(tempFile, resp.Body); err != nil {
		return fmt.Errorf("failed to save download: %v", err)
	}
	
	// Close file to ensure all data is flushed before tar reads it
	tempFile.Close()

	// Clean destination directory if it exists to avoid conflicts
	if _, err := os.Stat(destDir); err == nil {
		a.log("Cleaning existing Node.js directory...")
		os.RemoveAll(destDir)
	}

	if err := os.MkdirAll(destDir, 0755); err != nil {
		return err
	}
	
	a.log("Extracting Node.js (this should be fast)...")
	
	// Using native tar command on the file
	// -x: extract, -z: gunzip, -f: file, -C: directory, --strip-components 1: remove root folder
	cmd := exec.Command("tar", "-xzf", tempFile.Name(), "-C", destDir, "--strip-components", "1")
	
	var stderr strings.Builder
	cmd.Stderr = &stderr
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("tar extraction failed: %v, stderr: %s", err, stderr.String())
	}

	// Final verification: check if bin/node exists
	if _, err := os.Stat(filepath.Join(destDir, "bin", "node")); err != nil {
		return fmt.Errorf("verification failed: bin/node not found after extraction")
	}
	
	return nil
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func (a *App) restartApp() {
	executable, err := os.Executable()
	if err != nil {
		return
	}
	appBundle := filepath.Dir(filepath.Dir(filepath.Dir(executable)))
	if !strings.HasSuffix(appBundle, ".app") {
		wails_runtime.Quit(a.ctx)
		return
	}
	exec.Command("open", "-n", appBundle).Start()
	wails_runtime.Quit(a.ctx)
}

func (a *App) platformLaunch(binaryName string, yoloMode bool, projectDir string, env map[string]string, modelId string) {
	a.log(fmt.Sprintf("Launching %s...", binaryName))

	tm := NewToolManager(a)
	status := tm.GetToolStatus(binaryName)
	
	binaryPath := ""
	if status.Installed {
		binaryPath = status.Path
	}

	if binaryPath == "" {
		msg := fmt.Sprintf("Tool %s not found. Please ensure it is installed.", binaryName)
		a.log(msg)
		a.ShowMessage("Launch Error", msg)
		return
	}
	a.log("Using binary at: " + binaryPath)

	// Prepare the launch script
	home, _ := os.UserHomeDir()
	localBinDir := filepath.Join(home, ".cceasy", "node", "bin")
	scriptsDir := filepath.Join(home, ".cceasy", "scripts")
	if err := os.MkdirAll(scriptsDir, 0755); err != nil {
		a.log("Failed to create scripts dir: " + err.Error())
		return
	}
	launchScriptPath := filepath.Join(scriptsDir, "launch.sh")

	var sb strings.Builder
	sb.WriteString("#!/bin/bash\n")
	// Export local bin to PATH
	sb.WriteString(fmt.Sprintf("export PATH=\"%s:$PATH\"\n", localBinDir))

	// Export env variables
	for k, v := range env {
		sb.WriteString(fmt.Sprintf("export %s=\"%s\"\n", k, v))
	}

	// Navigate to project directory
	if projectDir != "" {
		safeProjectDir := strings.ReplaceAll(projectDir, "\"", "\\\"")
		sb.WriteString(fmt.Sprintf("echo \"Switching to project directory: %s\"\n", safeProjectDir))
		sb.WriteString(fmt.Sprintf("cd \"%s\" || { echo \"Failed to change directory to %s\"; exit 1; }\n", safeProjectDir, safeProjectDir))
	}

	sb.WriteString("clear\n")
	
	finalCmd := fmt.Sprintf("\"%s\"", binaryPath)
	
	// Add model argument for codebuddy
	if binaryName == "codebuddy" && modelId != "" {
		finalCmd += fmt.Sprintf(" --model %s", modelId)
	}

	if yoloMode {
		switch binaryName {
		case "claude":
			finalCmd += " --dangerously-skip-permissions"
		case "gemini":
			finalCmd += " --yolo"
		case "codex":
			finalCmd += " --full-auto"
		case "codebuddy":
			finalCmd += " -y"
		case "qodercli":
			finalCmd += " --yolo"
		}
	}
	sb.WriteString(fmt.Sprintf("exec %s", finalCmd))
	sb.WriteString("\n")

	if err := os.WriteFile(launchScriptPath, []byte(sb.String()), 0700); err != nil {
		a.log("Failed to write launch script: " + err.Error())
		return
	}

	safeLaunchPath := strings.ReplaceAll(launchScriptPath, "\"", "\\\"")
	var terminalCmd string
	
	if projectDir != "" {
		safeProjectDir := strings.ReplaceAll(projectDir, "\"", "\\\"")
		// Construct command: cd "projectDir" && "launchScriptPath"
		// We use backslash escaping for the AppleScript string context
		terminalCmd = fmt.Sprintf("cd \\\"%s\\\" && \\\"%s\\\"", safeProjectDir, safeLaunchPath)
	} else {
		terminalCmd = fmt.Sprintf("\\\"%s\\\"", safeLaunchPath)
	}

	appleScript := fmt.Sprintf(`try
	tell application "Terminal" to do script "%s"
	tell application "Terminal" to activate
on error errMsg
	display dialog "Failed to launch Terminal: " & errMsg
end try`, terminalCmd)

	a.log("Executing AppleScript...")
	cmd := exec.Command("osascript", "-e", appleScript)
	if err := cmd.Start(); err != nil {
		a.log("Failed to launch Terminal: " + err.Error())
	}
}

func (a *App) syncToSystemEnv(config AppConfig) {
	// On macOS, we do not persist environment variables to system-wide configuration (like .zshrc)
	// to avoid intrusive changes. LaunchTool handles process-level environment setup.
}

func createVersionCmd(path string) *exec.Cmd {
	return exec.Command(path, "--version")
}

func createNpmInstallCmd(npmPath string, args []string) *exec.Cmd {
	return exec.Command(npmPath, args...)
}