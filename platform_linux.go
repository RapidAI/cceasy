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

func (a *App) CheckEnvironment() {
	go func() {
		a.log("Checking Node.js installation...")
		
		home, _ := os.UserHomeDir()
		localNodeDir := filepath.Join(home, ".cceasy", "node")
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
			a.log("Node.js not found. Attempting manual installation...")
			if err := a.installNodeJSManually(localNodeDir); err != nil {
				a.log("Manual installation failed: " + err.Error())
				wails_runtime.EventsEmit(a.ctx, "env-check-done")
				return
			}
			a.log("Node.js manually installed to " + localNodeDir)
			
			// Re-check for node
			localNodePath := filepath.Join(localBinDir, "node")
			if _, err := os.Stat(localNodePath); err == nil {
				nodePath = localNodePath
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
		tools := []string{"claude", "gemini", "codex"}
		
		for _, tool := range tools {
			a.log(fmt.Sprintf("Checking %s...", tool))
			status := tm.GetToolStatus(tool)
			
			if !status.Installed {
				a.log(fmt.Sprintf("%s not found. Attempting automatic installation...", tool))
				if err := tm.InstallTool(tool); err != nil {
					a.log(fmt.Sprintf("ERROR: Failed to install %s: %v", tool, err))
				} else {
					a.log(fmt.Sprintf("%s installed successfully.", tool))
				}
			} else {
				a.log(fmt.Sprintf("%s found (version: %s).", tool, status.Version))
			}
		}

		a.log("Environment check complete.")
		wails_runtime.EventsEmit(a.ctx, "env-check-done")
	}()
}

func (a *App) installNodeJSManually(destDir string) error {
	arch := runtime.GOARCH
	if arch == "amd64" {
		arch = "x64"
	}
	
	version := RequiredNodeVersion
	fileName := fmt.Sprintf("node-v%s-linux-%s.tar.xz", version, arch)
	
downloadURL := fmt.Sprintf("https://nodejs.org/dist/v%s/%s", version, fileName)
	if strings.HasPrefix(strings.ToLower(a.CurrentLanguage), "zh") {
		// Use a mirror in China for faster download
		downloadURL = fmt.Sprintf("https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v%s/%s", version, fileName)
	}

	a.log(fmt.Sprintf("Downloading Node.js v%s from %s...", version, downloadURL))
	
	req, err := http.NewRequest("GET", downloadURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create download request: %w", err)
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("network error during download: %v", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %s", resp.Status)
	}

	size := resp.ContentLength
	tempFile, err := os.CreateTemp("", "node-*.tar.xz")
	if err != nil {
		return fmt.Errorf("failed to create temp file: %v", err)
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	var downloaded int64
	buffer := make([]byte, 32768)
	lastReport := time.Now()

	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			tempFile.Write(buffer[:n])
			downloaded += int64(n)
			if size > 0 && time.Since(lastReport) > 500*time.Millisecond {
				percent := float64(downloaded) / float64(size) * 100
				a.log(fmt.Sprintf("Downloading Node.js (%.1f%%): %d/%d bytes", percent, downloaded, size))
				lastReport = time.Now()
			}
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("interrupted download: %v", err)
		}
	}
	tempFile.Close()

	if _, err := os.Stat(destDir); err == nil {
		a.log("Cleaning existing Node.js directory...")
		os.RemoveAll(destDir)
	}

	if err := os.MkdirAll(destDir, 0755); err != nil {
		return err
	}
	
a.log("Extracting Node.js...")
	cmd := exec.Command("tar", "-xJf", tempFile.Name(), "-C", destDir, "--strip-components", "1")
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("tar extraction failed: %v, output: %s", err, string(out))
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

func (a *App) platformLaunch(binaryName string, yoloMode bool, projectDir string, env map[string]string) {
	a.log(fmt.Sprintf("Launching %s...", binaryName))
	
	tm := NewToolManager(a)
	status := tm.GetToolStatus(binaryName)
	
	binaryPath := ""
	if status.Installed {
		binaryPath = status.Path
	}

	if binaryPath == "" {
		a.log(fmt.Sprintf("Tool %s not found. Please ensure it is installed.", binaryName))
		return
	}

	// Try common terminals
	terminals := []string{"gnome-terminal", "konsole", "xterm", "xfce4-terminal"}
	var terminal string
	for _, t := range terminals {
		if path, err := exec.LookPath(t); err == nil {
			terminal = path
			break
		}
	}

	if terminal == "" {
		a.log("No terminal emulator found.")
		return
	}

	exports := ""
	for k, v := range env {
		exports += fmt.Sprintf("export %s=\"%s\"; ", k, v)
	}

	finalCmd := fmt.Sprintf("\"%s\"", binaryPath)
	if yoloMode {
		switch binaryName {
		case "claude":
			finalCmd += " --dangerously-skip-permissions"
		case "gemini":
			finalCmd += " --yolo"
		case "codex":
			finalCmd += " --full-auto"
		}
	}

	cmdStr := fmt.Sprintf("cd \"%s\" && %s%s", projectDir, exports, finalCmd)
	cmdStr += "; echo 'Press any key to exit...'; read -n 1"

	var cmd *exec.Cmd
	if strings.Contains(terminal, "gnome-terminal") {
		cmd = exec.Command(terminal, "--", "bash", "-c", cmdStr)
	} else if strings.Contains(terminal, "konsole") {
		cmd = exec.Command(terminal, "-e", "bash", "-c", cmdStr)
	} else {
		cmd = exec.Command(terminal, "-e", "bash", "-c", cmdStr)
	}

	err := cmd.Start()
	if err != nil {
		a.log("Error launching terminal: " + err.Error())
	}
}

func (a *App) syncToSystemEnv(config AppConfig) {
}