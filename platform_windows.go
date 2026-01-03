//go:build windows

package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"

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

func (a *App) updatePathForNode() {
	nodePath := `C:\Program Files\nodejs`
	npmPath := filepath.Join(os.Getenv("AppData"), "npm")
	home, _ := os.UserHomeDir()
	localToolPath := filepath.Join(home, ".cceasy", "node")

	currentPath := os.Getenv("PATH")
	newPath := currentPath
	
	// Check and add Node.js path
	if _, err := os.Stat(nodePath); err == nil {
		if !strings.Contains(strings.ToLower(currentPath), strings.ToLower(nodePath)) {
			newPath = nodePath + string(os.PathListSeparator) + newPath
		}
	}
	
	// Check and add npm global bin path
	if _, err := os.Stat(npmPath); err == nil {
		if !strings.Contains(strings.ToLower(currentPath), strings.ToLower(npmPath)) {
			newPath = npmPath + string(os.PathListSeparator) + newPath
		}
	}

	// Check and add local tool path
	if _, err := os.Stat(localToolPath); err == nil {
		if !strings.Contains(strings.ToLower(currentPath), strings.ToLower(localToolPath)) {
			newPath = localToolPath + string(os.PathListSeparator) + newPath
		}
	}

	if newPath != currentPath {
		os.Setenv("PATH", newPath)
		a.log("Updated PATH environment variable: " + newPath)
	}
}

func (a *App) CheckEnvironment() {
	go func() {
		a.log("Checking Node.js installation...")

		// Check for node
		nodeCmd := exec.Command("node", "--version")
		nodeCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		if err := nodeCmd.Run(); err != nil {
			a.log("Node.js not found. Downloading and installing...")
			if err := a.installNodeJS(); err != nil {
				a.log("Failed to install Node.js: " + err.Error())
				return
			}
			a.log("Node.js installed successfully.")
		} else {
			a.log("Node.js is installed.")
		}

		// Update path for the current process anyway to ensure npm is found
		a.updatePathForNode()

		// Check for Git
		a.log("Checking Git installation...")
		if _, err := exec.LookPath("git"); err != nil {
			// Check common locations before giving up
			gitFound := false
			if _, err := os.Stat(`C:\Program Files\Git\cmd\git.exe`); err == nil {
				gitFound = true
			}
			
			if gitFound {
				a.updatePathForGit()
				a.log("Git found in standard location.")
			} else {
				a.log("Git not found. Downloading and installing...")
				if err := a.installGitBash(); err != nil {
					a.log("Failed to install Git: " + err.Error())
				} else {
					a.log("Git installed successfully.")
					a.updatePathForGit()
				}
			}
		} else {
			a.log("Git is installed.")
		}

		// 5. Check and Install AI Tools
		tm := NewToolManager(a)
		tools := []string{"claude", "gemini", "codex", "opencode", "codebuddy"}
		
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
					a.updatePathForNode() // Refresh path after install
				}
			} else {
				a.log(fmt.Sprintf("%s found (version: %s).", tool, status.Version))
				// Check for updates for opencode and codebuddy
				if tool == "opencode" || tool == "codebuddy" {
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
		runtime.EventsEmit(a.ctx, "env-check-done")
	}()
}

func (a *App) installNodeJS() error {
	arch := os.Getenv("PROCESSOR_ARCHITECTURE")
	nodeArch := "x64"
	if arch == "ARM64" || os.Getenv("PROCESSOR_ARCHITEW6432") == "ARM64" {
		nodeArch = "arm64"
	}

	// Using a more recent version
	nodeVersion := RequiredNodeVersion
	fileName := fmt.Sprintf("node-v%s-%s.msi", nodeVersion, nodeArch)
	
	downloadURL := fmt.Sprintf("https://nodejs.org/dist/v%s/%s", nodeVersion, fileName)
	if strings.HasPrefix(strings.ToLower(a.CurrentLanguage), "zh") && nodeArch != "arm64" {
		// Use a mirror in China for faster download (only for x64 as arm64 might not be synced)
		downloadURL = fmt.Sprintf("https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v%s/%s", nodeVersion, fileName)
	}

	a.log(fmt.Sprintf("Downloading Node.js %s for %s...", nodeVersion, nodeArch))

	// Pre-check if the file exists and is accessible
	client := &http.Client{Timeout: 10 * time.Second}
	headReq, _ := http.NewRequest("HEAD", downloadURL, nil)
	headReq.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	headResp, err := client.Do(headReq)
	if err != nil || headResp.StatusCode != http.StatusOK {
		status := "Unknown"
		if headResp != nil {
			status = headResp.Status
		}
		return fmt.Errorf("Node.js installer is not accessible (Status: %s). Please check your internet connection or mirror availability.", status)
	}
	headResp.Body.Close()

	tempDir := os.TempDir()
	msiPath := filepath.Join(tempDir, fileName)

	if err := a.downloadFile(msiPath, downloadURL); err != nil {
		return fmt.Errorf("error downloading Node.js installer: %w", err)
	}
	defer os.Remove(msiPath)

	a.log("Installing Node.js (this may take a moment, please grant administrator permission if prompted)...")
	// Use /passive for basic UI or /qn for completely silent.
	// Adding ALLUSERS=1 to ensure it's in the standard path.
	cmd := exec.Command("msiexec", "/i", msiPath, "/passive", "ALLUSERS=1")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("error installing Node.js: %s\n%s", err, string(output))
	}

	// Wait a bit for the system to finalize the installation
	time.Sleep(2 * time.Second)

	return nil
}

func (a *App) updatePathForGit() {
	// Common git paths
	gitPaths := []string{
		`C:\Program Files\Git\cmd`,
		`C:\Program Files\Git\bin`,
	}
	
	currentPath := os.Getenv("PATH")
	newPath := currentPath
	
	for _, path := range gitPaths {
		if _, err := os.Stat(path); err == nil {
			if !strings.Contains(strings.ToLower(currentPath), strings.ToLower(path)) {
				newPath = path + string(os.PathListSeparator) + newPath
			}
		}
	}

	if newPath != currentPath {
		os.Setenv("PATH", newPath)
		a.log("Updated PATH environment variable for Git.")
	}
}

func (a *App) installGitBash() error {
	gitVersion := "2.47.1"
	// git-for-windows versioning can be tricky. v2.47.1.windows.1
	fullVersion := "v2.47.1.windows.1"
	fileName := fmt.Sprintf("Git-%s-64-bit.exe", gitVersion)
	
	downloadURL := fmt.Sprintf("https://github.com/git-for-windows/git/releases/download/%s/%s", fullVersion, fileName)
	if strings.HasPrefix(strings.ToLower(a.CurrentLanguage), "zh") {
		downloadURL = fmt.Sprintf("https://npmmirror.com/mirrors/git-for-windows/%s/%s", fullVersion, fileName)
	}
	
	a.log(fmt.Sprintf("Downloading Git %s...", gitVersion))

	tempDir := os.TempDir()
	exePath := filepath.Join(tempDir, fileName)

	if err := a.downloadFile(exePath, downloadURL); err != nil {
		return fmt.Errorf("error downloading Git installer: %w", err)
	}
	defer os.Remove(exePath)

	a.log("Installing Git (this may take a moment, please grant administrator permission if prompted)...")
	// Silent installation
	cmd := exec.Command(exePath, "/VERYSILENT", "/NORESTART", "/NOCANCEL", "/SP-", "/CLOSEAPPLICATIONS", "/RESTARTAPPLICATIONS")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("error installing Git: %s\n%s", err, string(output))
	}

	// Wait a bit for the system to finalize the installation
	time.Sleep(2 * time.Second)

	return nil
}

func (a *App) downloadFile(filepath string, url string) error {
	a.log(fmt.Sprintf("Requesting URL: %s", url))
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create download request: %w", err)
	}
	// Add User-Agent to avoid 403 Forbidden from some mirrors/CDNs
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	// Use a client with timeout for the connection phase
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("network error during download: %v. Please check your internet connection or firewall settings.", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %s. The file might not be available on this server.", resp.Status)
	}

	size := resp.ContentLength
	out, err := os.Create(filepath)
	if err != nil {
		return fmt.Errorf("failed to create local file: %w", err)
	}
	defer out.Close()

	var downloaded int64
	buffer := make([]byte, 32768)
	lastReport := time.Now()

	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			out.Write(buffer[:n])
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
			return fmt.Errorf("interrupted download: %v. The connection was lost during data transfer.", err)
		}
	}

	return nil
}

func (a *App) restartApp() {
	executable, err := os.Executable()
	if err != nil {
		a.log("Failed to get executable path: " + err.Error())
		return
	}

	cmdLine := fmt.Sprintf(`cmd /c start "" "%s"`, executable)
	cmd := exec.Command("cmd")
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CmdLine:    cmdLine,
		HideWindow: true,
	}
	if err := cmd.Start(); err != nil {
		a.log("Failed to restart: " + err.Error())
	} else {
		runtime.Quit(a.ctx)
	}
}

func (a *App) platformLaunch(binaryName string, yoloMode bool, projectDir string, env map[string]string, modelId string) {
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

	for k, v := range env {
		os.Setenv(k, v)
	}

	projectDir = filepath.Clean(projectDir)
	binaryPath = filepath.Clean(binaryPath)

	// Build the command with arguments
	cmdArgs := ""
	if binaryName == "codebuddy" && modelId != "" {
		cmdArgs += fmt.Sprintf(" --model %s", modelId)
	}

	if yoloMode {
		var flag string
		switch binaryName {
		case "claude":
			flag = "--dangerously-skip-permissions"
		case "gemini":
			flag = "--yolo"
		case "codex":
			flag = "--full-auto"
		case "codebuddy":
			flag = "-y"
		case "qodercli":
			flag = "--yolo"
		}
		if flag != "" {
			cmdArgs += " " + flag
		}
	}

	// Use SysProcAttr.CmdLine for raw control over quoting on Windows.
	// This is necessary because paths with special characters like '&'
	// require explicit quoting that Go's default escaping might not handle
	// correctly when passed through 'cmd /c'.
	cmdLine := fmt.Sprintf(`cmd /c start "" /d "%s" cmd /k "%s"%s`, projectDir, binaryPath, cmdArgs)

	cmd := exec.Command("cmd")
	cmd.Dir = projectDir
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CmdLine:    cmdLine,
		HideWindow: true,
	}

	a.log(fmt.Sprintf("Executing: %s (Dir: %s)", cmdLine, projectDir))

	err := cmd.Run()
	if err != nil {
		a.log("Error launching tool: " + err.Error())
	}
}

func (a *App) syncToSystemEnv(config AppConfig) {
	toolName := strings.ToLower(config.ActiveTool)
	var toolCfg ToolConfig
	var envKey, envBaseUrl string

	switch toolName {
	case "claude":
		toolCfg = config.Claude
		envKey = "ANTHROPIC_AUTH_TOKEN"
		envBaseUrl = "ANTHROPIC_BASE_URL"
	case "gemini":
		toolCfg = config.Gemini
		envKey = "GEMINI_API_KEY"
		envBaseUrl = "GOOGLE_GEMINI_BASE_URL"
	case "codex":
		toolCfg = config.Codex
		envKey = "OPENAI_API_KEY"
		envBaseUrl = "OPENAI_BASE_URL"
	default:
		return
	}

	var selectedModel *ModelConfig
	for _, m := range toolCfg.Models {
		if m.ModelName == toolCfg.CurrentModel {
			selectedModel = &m
			break
		}
	}

	if selectedModel == nil {
		return
	}

	if strings.ToLower(selectedModel.ModelName) == "original" {
		// Clear environment variables for the current process
		os.Unsetenv(envKey)
		os.Unsetenv(envBaseUrl)
		if toolName == "codex" {
			os.Unsetenv("WIRE_API")
		}

		// Clear persistent environment variables on Windows
		go func() {
			cmd1 := exec.Command("setx", envKey, "")
			cmd1.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			cmd1.Run()

			cmd2 := exec.Command("setx", envBaseUrl, "")
			cmd2.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			cmd2.Run()

			if toolName == "claude" {
				cmd3 := exec.Command("setx", "ANTHROPIC_API_KEY", "")
				cmd3.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
				cmd3.Run()
			}
			if toolName == "codex" {
				cmd4 := exec.Command("setx", "WIRE_API", "")
				cmd4.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
				cmd4.Run()
			}
		}()
		return
	}

	baseUrl := selectedModel.ModelUrl
	if toolName == "claude" {
		baseUrl = getBaseUrl(selectedModel)
	}

	// Set environment variables for the current process immediately
	os.Setenv(envKey, selectedModel.ApiKey)
	if baseUrl != "" {
		os.Setenv(envBaseUrl, baseUrl)
	}


	if toolName == "codex" {
		os.Setenv("WIRE_API", "responses")
	}

	// Set persistent environment variables on Windows in a goroutine
	go func() {
		cmd1 := exec.Command("setx", envKey, selectedModel.ApiKey)
		cmd1.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		cmd1.Run()

		if baseUrl != "" {
			cmd2 := exec.Command("setx", envBaseUrl, baseUrl)
			cmd2.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			cmd2.Run()
		}
		if toolName == "claude" {
			// Explicitly clear API_KEY in system to avoid conflict with AUTH_TOKEN
			cmd3 := exec.Command("setx", "ANTHROPIC_API_KEY", "")
			cmd3.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			cmd3.Run()
		}
		if toolName == "codex" {
			cmd4 := exec.Command("setx", "WIRE_API", "responses")
			cmd4.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			cmd4.Run()
		}
	}()
}

func createVersionCmd(path string) *exec.Cmd {
	cmd := exec.Command("cmd")
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CmdLine:    fmt.Sprintf(`cmd /c ""%s" --version"`, path),
		HideWindow: true,
	}
	return cmd
}



func createNpmInstallCmd(npmPath string, args []string) *exec.Cmd {
	quotedArgs := make([]string, len(args))
	for i, arg := range args {
		if strings.ContainsAny(arg, " &^") {
			quotedArgs[i] = fmt.Sprintf(`"%s"`, arg)
		} else {
			quotedArgs[i] = arg
		}
	}
	cmdLine := fmt.Sprintf(`cmd /c ""%s" %s"`, npmPath, strings.Join(quotedArgs, " "))
	cmd := exec.Command("cmd")
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CmdLine:    cmdLine,
		HideWindow: true,
	}
	return cmd
}

