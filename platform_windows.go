//go:build windows

package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
	"unsafe"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// compareVersions compares two semantic version strings
// Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
func (a *App) compareVersions(v1, v2 string) int {
	// Clean version strings (remove 'v' prefix, extra text, etc.)
	cleanVersion := func(v string) string {
		v = strings.TrimSpace(v)
		v = strings.TrimPrefix(v, "v")
		v = strings.TrimPrefix(v, "V")
		// Extract version number from strings like "2.1.14 (Claude Code)" or "codex-cli 0.87.0"
		if idx := strings.Index(v, " "); idx > 0 {
			v = v[:idx]
		}
		return v
	}

	v1 = cleanVersion(v1)
	v2 = cleanVersion(v2)

	// Split by dots
	parts1 := strings.Split(v1, ".")
	parts2 := strings.Split(v2, ".")

	// Compare each part
	maxLen := len(parts1)
	if len(parts2) > maxLen {
		maxLen = len(parts2)
	}

	for i := 0; i < maxLen; i++ {
		var n1, n2 int

		if i < len(parts1) {
			// Parse number, ignore non-numeric suffixes
			numStr := parts1[i]
			for j, c := range numStr {
				if c < '0' || c > '9' {
					numStr = numStr[:j]
					break
				}
			}
			if numStr != "" {
				n1, _ = strconv.Atoi(numStr)
			}
		}

		if i < len(parts2) {
			numStr := parts2[i]
			for j, c := range numStr {
				if c < '0' || c > '9' {
					numStr = numStr[:j]
					break
				}
			}
			if numStr != "" {
				n2, _ = strconv.Atoi(numStr)
			}
		}

		if n1 < n2 {
			return -1
		}
		if n1 > n2 {
			return 1
		}
	}

	return 0
}

func (a *App) platformStartup() {
	// No console to hide if built with -H windowsgui
}

// platformInitConsole allocates a console window for init mode (Windows only)
func (a *App) platformInitConsole() {
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	allocConsole := kernel32.NewProc("AllocConsole")
	allocConsole.Call()

	// Set console title
	setConsoleTitle := kernel32.NewProc("SetConsoleTitleW")
	title, _ := syscall.UTF16PtrFromString("AICoder - Environment Setup")
	setConsoleTitle.Call(uintptr(unsafe.Pointer(title)))
}

// RunEnvironmentCheckCLI runs environment check in command-line mode (synchronous, no GUI events)
// Installation order: Node.js → Git → AI Tools
func (a *App) RunEnvironmentCheckCLI() {
	fmt.Println("\n========================================")
	fmt.Println("Environment Setup - Step by Step")
	fmt.Println("========================================")

	// ===== STEP 1: Node.js Installation and Verification =====
	fmt.Println("\n[1/4] Step 1: Node.js Installation")
	fmt.Println("--------------------------------------")

	nodeVersion := ""

	// Check if Node.js is already installed
	nodeCmd := exec.Command("node", "--version")
	nodeCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false}
	if out, err := nodeCmd.Output(); err == nil {
		nodeVersion = strings.TrimSpace(string(out))
		fmt.Printf("✓ Node.js is already installed: %s\n", nodeVersion)
	} else {
		fmt.Println("Node.js not found. Installing...")
		if err := a.installNodeJSCLI(); err != nil {
			fmt.Printf("✗ ERROR: Failed to install Node.js: %v\n", err)
			fmt.Println("\nEnvironment setup failed. Please install Node.js manually.")
			return
		}

		// Verify Node.js installation
		fmt.Println("Verifying Node.js installation...")
		a.updatePathForNode()
		time.Sleep(2 * time.Second) // Wait for installation to complete

		nodeCmd = exec.Command("node", "--version")
		nodeCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false}
		if out, err := nodeCmd.Output(); err == nil {
			nodeVersion = strings.TrimSpace(string(out))
			fmt.Printf("✓ Node.js installed and verified successfully: %s\n", nodeVersion)
		} else {
			fmt.Printf("✗ ERROR: Node.js installation verification failed: %v\n", err)
			fmt.Println("\nEnvironment setup failed. Please restart and try again.")
			return
		}
	}

	// Verify npm is working
	fmt.Println("Verifying npm availability...")
	a.updatePathForNode()

	var npmExec string
	var npmVersion string
	maxRetries := 10
	npmReady := false

	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			fmt.Printf("  Retry %d/%d...\n", i+1, maxRetries)
			time.Sleep(2 * time.Second)
		}

		var err error
		npmExec, err = exec.LookPath("npm")
		if err != nil {
			npmExec, err = exec.LookPath("npm.cmd")
		}

		if err == nil && npmExec != "" {
			npmTestCmd := exec.Command(npmExec, "--version")
			npmTestCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false}
			if out, err := npmTestCmd.Output(); err == nil {
				npmVersion = strings.TrimSpace(string(out))
				fmt.Printf("✓ npm verified successfully: %s (version: %s)\n", npmExec, npmVersion)
				npmReady = true
				break
			}
		}

		a.updatePathForNode()
	}

	if !npmReady {
		fmt.Printf("✗ ERROR: npm not available after %d attempts\n", maxRetries)
		fmt.Println("\nEnvironment setup failed. Please check Node.js installation.")
		return
	}

	// ===== STEP 2: Git Installation and Verification =====
	fmt.Println("\n[2/4] Step 2: Git Installation")
	fmt.Println("--------------------------------------")

	gitInstalled := false
	gitVersion := ""

	// Check if Git is already installed
	if gitPath, err := exec.LookPath("git"); err == nil {
		gitCmd := exec.Command(gitPath, "--version")
		gitCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false}
		if out, err := gitCmd.Output(); err == nil {
			gitVersion = strings.TrimSpace(string(out))
			fmt.Printf("✓ Git is already installed: %s\n", gitVersion)
			gitInstalled = true
		}
	} else {
		// Check standard installation path
		if _, err := os.Stat(`C:\Program Files\Git\cmd\git.exe`); err == nil {
			a.updatePathForGit()
			fmt.Println("✓ Git found in standard location.")
			gitInstalled = true
		}
	}

	if !gitInstalled {
		fmt.Println("Git not found. Installing...")
		if err := a.installGitBashCLI(); err != nil {
			fmt.Printf("✗ ERROR: Failed to install Git: %v\n", err)
			fmt.Println("\nGit installation failed. AI tools will be installed, but some features may not work.")
			fmt.Println("You can install Git manually later from: https://git-scm.com/download/win")
		} else {
			// Verify Git installation
			fmt.Println("Verifying Git installation...")
			a.updatePathForGit()
			time.Sleep(2 * time.Second) // Wait for installation to complete

			if gitPath, err := exec.LookPath("git"); err == nil {
				gitCmd := exec.Command(gitPath, "--version")
				gitCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false}
				if out, err := gitCmd.Output(); err == nil {
					gitVersion = strings.TrimSpace(string(out))
					fmt.Printf("✓ Git installed and verified successfully: %s\n", gitVersion)
					gitInstalled = true
				}
			}

			if !gitInstalled {
				fmt.Println("✗ WARNING: Git installation verification failed.")
				fmt.Println("  Some AI tools may not work properly without Git.")
			}
		}
	}

	// ===== STEP 3: Visual C++ Redistributable Installation =====
	fmt.Println("\n[3/5] Step 3: Visual C++ Redistributable")
	fmt.Println("--------------------------------------")
	fmt.Println("Checking Visual C++ Redistributable (required for codex)...")

	// Add detailed architecture info
	arch := os.Getenv("PROCESSOR_ARCHITECTURE")
	fmt.Printf("System Architecture: %s\n", arch)

	isInstalled := a.isVCRedistInstalled()
	fmt.Printf("Registry Check Result: %v\n", isInstalled)

	if isInstalled {
		fmt.Println("✓ Visual C++ Redistributable is already installed")
	} else {
		fmt.Println("Visual C++ Redistributable not found. Installing...")
		fmt.Println("  → This will download and install VC++ Redistributable")
		fmt.Println("  → You may see a UAC prompt - please accept it")
		if err := a.installVCRedist(); err != nil {
			fmt.Printf("✗ WARNING: Failed to install VC Redistributable: %v\n", err)
			fmt.Println("  Some tools like codex may not work properly without it.")
			fmt.Println("  You can install it manually from: https://aka.ms/vs/17/release/vc_redist.x64.exe")
		} else {
			fmt.Println("✓ Visual C++ Redistributable installed successfully")
		}
	}

	// ===== STEP 4: Local Node Environment Setup =====
	fmt.Println("\n[4/5] Step 4: Local Node.js Environment Setup")
	fmt.Println("--------------------------------------")
	a.ensureLocalNodeBinary()
	fmt.Println("✓ Local Node.js environment configured")

	// ===== STEP 5: AI Tools Installation to Private Directory =====
	fmt.Println("\n[5/5] Step 5: AI Tools Installation")
	fmt.Println("--------------------------------------")
	fmt.Println("Installing AI coding tools to private directory (~/.cceasy/tools)")

	tm := NewToolManager(a)
	// Install kilo first, then other tools
	tools := []string{"kilo", "claude", "gemini", "codex", "opencode", "codebuddy", "qoder", "iflow"}

	installedCount := 0
	updatedCount := 0
	failedCount := 0
	skippedCount := 0

	for idx, tool := range tools {
		fmt.Printf("\n[%d/%d] Processing %s...\n", idx+1, len(tools), tool)

		status := tm.GetToolStatus(tool)

		if !status.Installed {
			// Tool not installed, install it
			fmt.Printf("  → Installing %s to private directory...\n", tool)
			if err := tm.InstallTool(tool); err != nil {
				fmt.Printf("  ✗ Failed to install %s: %v\n", tool, err)
				failedCount++
			} else {
				// Verify installation succeeded
				status = tm.GetToolStatus(tool)
				if status.Installed {
					fmt.Printf("  ✓ %s installed successfully (version: %s)\n", tool, status.Version)
					installedCount++
				} else {
					fmt.Printf("  ✗ Installation completed but verification failed for %s\n", tool)
					failedCount++
				}
			}
		} else {
			// Tool already installed, check if it's in private directory
			home, _ := os.UserHomeDir()
			expectedPrefix := filepath.Join(home, ".cceasy", "tools")

			if !strings.HasPrefix(status.Path, expectedPrefix) {
				fmt.Printf("  ⊘ %s found at: %s\n", tool, status.Path)
				fmt.Printf("    (System installation, not in private directory - skipping)\n")
				skippedCount++
				continue
			}

			fmt.Printf("  ✓ %s is already installed (version: %s)\n", tool, status.Version)

			// Check for updates
			fmt.Printf("    Checking for updates...\n")
			latest, err := a.getLatestNpmVersion(npmExec, tm.GetPackageName(tool))
			if err != nil {
				fmt.Printf("    ⊘ Could not check for updates: %v\n", err)
			} else if latest == "" {
				fmt.Printf("    ⊘ Could not determine latest version\n")
			} else if latest == status.Version {
				fmt.Printf("    ✓ Already at latest version (%s)\n", latest)
			} else {
				fmt.Printf("    → New version available: %s (current: %s)\n", latest, status.Version)
				fmt.Printf("    → Updating %s...\n", tool)
				if err := tm.UpdateTool(tool); err != nil {
					fmt.Printf("    ✗ Failed to update: %v\n", err)
					failedCount++
				} else {
					// Verify update succeeded
					newStatus := tm.GetToolStatus(tool)
					fmt.Printf("    ✓ Updated successfully (version: %s)\n", newStatus.Version)
					updatedCount++
				}
			}
		}
	}

	// Summary
	fmt.Println("\n========================================")
	fmt.Println("Environment Setup Summary")
	fmt.Println("========================================")
	fmt.Printf("Node.js: %s\n", nodeVersion)
	if gitInstalled {
		fmt.Printf("Git: %s\n", gitVersion)
	} else {
		fmt.Println("Git: Not installed (optional)")
	}
	fmt.Println("\nAI Tools:")
	fmt.Printf("  Newly installed: %d\n", installedCount)
	fmt.Printf("  Updated: %d\n", updatedCount)
	fmt.Printf("  Failed: %d\n", failedCount)
	fmt.Printf("  Skipped (system): %d\n", skippedCount)
	fmt.Println("========================================")

	if failedCount > 0 {
		fmt.Println("\n⚠ Some tools failed to install or update.")
		fmt.Println("You can try installing them manually later from the application.")
	} else {
		fmt.Println("\n✓ Environment setup completed successfully!")
	}

	// Update config
	if cfg, err := a.LoadConfig(); err == nil {
		cfg.EnvCheckDone = true
		cfg.PauseEnvCheck = true
		a.SaveConfig(cfg)
	}
}

func (a *App) installNodeJSCLI() error {
	arch := os.Getenv("PROCESSOR_ARCHITECTURE")
	nodeArch := "x64"
	if arch == "ARM64" || os.Getenv("PROCESSOR_ARCHITEW6432") == "ARM64" {
		nodeArch = "arm64"
	}

	nodeVersion := RequiredNodeVersion
	fileName := fmt.Sprintf("node-v%s-%s.msi", nodeVersion, nodeArch)

	downloadURL := fmt.Sprintf("https://nodejs.org/dist/v%s/%s", nodeVersion, fileName)
	fmt.Printf("  Downloading from: %s\n", downloadURL)

	// Pre-check
	client := &http.Client{Timeout: 10 * time.Second}
	headReq, _ := http.NewRequest("HEAD", downloadURL, nil)
	headReq.Header.Set("User-Agent", "Mozilla/5.0")
	headResp, err := client.Do(headReq)
	if err != nil || headResp.StatusCode != http.StatusOK {
		return fmt.Errorf("installer not accessible")
	}
	headResp.Body.Close()

	tempDir := os.TempDir()
	msiPath := filepath.Join(tempDir, fileName)

	// Download
	fmt.Println("  Downloading Node.js installer...")
	if err := a.downloadFileCLI(msiPath, downloadURL); err != nil {
		return err
	}

	// Wait a moment to ensure file is fully written and not locked
	time.Sleep(500 * time.Millisecond)

	// Install
	fmt.Println("  Installing Node.js (this may take a few minutes)...")
	fmt.Println("  You will be prompted for administrator permission. Please accept to continue.")

	// Use ShellExecute with "runas" verb to request admin privileges
	shell32 := syscall.NewLazyDLL("shell32.dll")
	shellExecute := shell32.NewProc("ShellExecuteW")

	verb := syscall.StringToUTF16Ptr("runas")
	file := syscall.StringToUTF16Ptr("msiexec.exe")
	// Use /qb for basic UI with progress bar (visible in CLI mode)
	params := syscall.StringToUTF16Ptr(fmt.Sprintf("/i \"%s\" /qb ALLUSERS=1", msiPath))
	dir := syscall.StringToUTF16Ptr("")

	ret, _, _ := shellExecute.Call(
		0,
		uintptr(unsafe.Pointer(verb)),
		uintptr(unsafe.Pointer(file)),
		uintptr(unsafe.Pointer(params)),
		uintptr(unsafe.Pointer(dir)),
		uintptr(syscall.SW_SHOW),
	)

	if ret <= 32 {
		return fmt.Errorf("failed to launch installer with admin privileges (error code: %d)", ret)
	}

	// Wait for installation to complete by checking if node.exe exists
	fmt.Println("  Waiting for installation to complete...")
	nodePath := `C:\Program Files\nodejs\node.exe`
	maxWaitTime := 5 * time.Minute
	checkInterval := 2 * time.Second
	elapsed := time.Duration(0)

	for elapsed < maxWaitTime {
		if _, err := os.Stat(nodePath); err == nil {
			fmt.Println("  Installation completed successfully.")

			// Wait for npm to be available as well
			fmt.Println("  Verifying npm availability...")
			npmReady := false
			npmWaitTime := 30 * time.Second
			npmCheckInterval := 1 * time.Second
			npmElapsed := time.Duration(0)

			for npmElapsed < npmWaitTime {
				npmCmd := exec.Command("npm", "--version")
				npmCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: false}
				if err := npmCmd.Run(); err == nil {
					fmt.Println("  npm is ready.")
					npmReady = true
					break
				}
				time.Sleep(npmCheckInterval)
				npmElapsed += npmCheckInterval
			}

			if !npmReady {
				fmt.Println("  Warning: npm verification timed out, but continuing anyway...")
			}

			time.Sleep(2 * time.Second) // Additional wait for finalization

			// Clean up installer file after successful installation
			go func() {
				time.Sleep(5 * time.Second)
				os.Remove(msiPath)
			}()

			return nil
		}
		time.Sleep(checkInterval)
		elapsed += checkInterval
	}

	fmt.Println("  Warning: Installation verification timed out.")

	// Try to clean up installer file
	os.Remove(msiPath)

	return nil
}

func (a *App) installGitBashCLI() error {
	gitVersion := "2.52.0"
	fullVersion := "v2.52.0.windows.1"
	fileName := fmt.Sprintf("Git-%s-64-bit.exe", gitVersion)

	downloadURL := fmt.Sprintf("https://github.com/git-for-windows/git/releases/download/%s/%s", fullVersion, fileName)
	fmt.Printf("  Downloading from: %s\n", downloadURL)

	tempDir := os.TempDir()
	exePath := filepath.Join(tempDir, fileName)

	if err := a.downloadFileCLI(exePath, downloadURL); err != nil {
		return err
	}

	// Wait a moment to ensure file is fully written and not locked
	time.Sleep(500 * time.Millisecond)

	fmt.Println("  Installing Git (this may take a few minutes)...")
	fmt.Println("  You will be prompted for administrator permission. Please accept to continue.")

	// Use ShellExecute with "runas" verb to request admin privileges
	shell32 := syscall.NewLazyDLL("shell32.dll")
	shellExecute := shell32.NewProc("ShellExecuteW")

	verb := syscall.StringToUTF16Ptr("runas")
	file := syscall.StringToUTF16Ptr(exePath)
	params := syscall.StringToUTF16Ptr("/VERYSILENT /NORESTART /NOCANCEL /SP-")
	dir := syscall.StringToUTF16Ptr("")

	ret, _, _ := shellExecute.Call(
		0,
		uintptr(unsafe.Pointer(verb)),
		uintptr(unsafe.Pointer(file)),
		uintptr(unsafe.Pointer(params)),
		uintptr(unsafe.Pointer(dir)),
		uintptr(syscall.SW_SHOW),
	)

	if ret <= 32 {
		return fmt.Errorf("failed to launch installer with admin privileges (error code: %d)", ret)
	}

	// Wait for installation to complete by checking if git.exe exists
	fmt.Println("  Waiting for installation to complete...")
	gitPath := `C:\Program Files\Git\cmd\git.exe`
	maxWaitTime := 5 * time.Minute
	checkInterval := 2 * time.Second
	elapsed := time.Duration(0)

	for elapsed < maxWaitTime {
		if _, err := os.Stat(gitPath); err == nil {
			fmt.Println("  Installation completed successfully.")
			time.Sleep(2 * time.Second) // Additional wait for finalization

			// Clean up installer file after successful installation
			go func() {
				time.Sleep(5 * time.Second)
				os.Remove(exePath)
			}()

			return nil
		}
		time.Sleep(checkInterval)
		elapsed += checkInterval
	}

	fmt.Println("  Warning: Installation verification timed out.")

	// Try to clean up installer file
	os.Remove(exePath)

	return nil
}

func (a *App) downloadFileCLI(filepath string, url string) error {
	fmt.Printf("  Requesting URL: %s\n", url)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	// Create transport with reasonable timeouts
	transport := &http.Transport{
		TLSHandshakeTimeout:   30 * time.Second,
		ResponseHeaderTimeout: 30 * time.Second,
		DisableKeepAlives:     true,
	}

	// Client with no overall timeout to allow large file downloads
	client := &http.Client{
		Transport: transport,
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("download failed: %v", err)
	}
	defer resp.Body.Close()

	// Log final URL after redirects
	if resp.Request.URL.String() != url {
		fmt.Printf("  Redirected to: %s\n", resp.Request.URL.String())
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %s", resp.Status)
	}

	size := resp.ContentLength
	out, err := os.Create(filepath)
	if err != nil {
		return err
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
			if size > 0 && time.Since(lastReport) > 1*time.Second {
				percent := float64(downloaded) / float64(size) * 100
				fmt.Printf("  Progress: %.1f%% (%d/%d bytes)\n", percent, downloaded, size)
				lastReport = time.Now()
			}
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
	}

	// Ensure file is synced to disk before closing
	out.Sync()

	fmt.Println("  Download complete.")
	return nil
}

func (a *App) updatePathForNode() {
	nodePath := `C:\Program Files\nodejs`
	npmPath := filepath.Join(os.Getenv("AppData"), "npm")
	home, _ := os.UserHomeDir()
	localToolPath := filepath.Join(home, ".cceasy", "tools")
	oldToolPath := filepath.Join(home, ".cceasy", "node")

	currentPath := os.Getenv("PATH")
	// Remove old path if present to prevent conflicts
	if strings.Contains(strings.ToLower(currentPath), strings.ToLower(oldToolPath)) {
		// Simple removal - split by separator, filter, join
		parts := strings.Split(currentPath, string(os.PathListSeparator))
		var newParts []string
		for _, part := range parts {
			if !strings.EqualFold(part, oldToolPath) {
				newParts = append(newParts, part)
			}
		}
		currentPath = strings.Join(newParts, string(os.PathListSeparator))
	}

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
		a.log(a.tr("Updated PATH environment variable: ") + newPath)
	}
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
			if err == nil {
				// Skip if:
				// 1. Not a forced check AND
				// 2. PauseEnvCheck is true AND
				// 3. EnvCheckDone is true (meaning it's not the first run)
				if config.PauseEnvCheck && config.EnvCheckDone {
					a.log(a.tr("Skipping environment check and installation."))
					a.emitEvent("env-check-done")
					return
				}
			}
		}

		// ===== Check and Install Visual C++ Redistributable (needed by some tools like codex) =====
		a.log(a.tr("Checking Visual C++ Redistributable installation..."))
		if !a.isVCRedistInstalled() {
			a.log(a.tr("Visual C++ Redistributable not found. Installing..."))
			if err := a.installVCRedist(); err != nil {
				a.log(a.tr("WARNING: Failed to install VC Redistributable: %v", err))
				a.log(a.tr("Some tools like codex may not work properly without it."))
				a.log(a.tr("You can install it manually from: https://aka.ms/vs/17/release/vc_redist.x64.exe"))
			} else {
				a.log(a.tr("Visual C++ Redistributable installed successfully."))
			}
		} else {
			a.log(a.tr("Visual C++ Redistributable is already installed."))
		}

		a.log(a.tr("Checking Node.js installation..."))

		// Check for node
		nodeCmd := exec.Command("node", "--version")
		nodeCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		nodeInstalled := nodeCmd.Run() == nil

		if !nodeInstalled {
			// Check if installation is already in progress
			a.installMutex.Lock()
			if a.installingNode {
				a.log(a.tr("Node.js installation already in progress, waiting for completion..."))
				a.installMutex.Unlock()
				// Wait for installation to complete (with timeout)
				select {
				case <-a.nodeInstallDone:
					a.log(a.tr("Node.js installation completed by another process."))
					nodeInstalled = true
				case <-time.After(10 * time.Minute):
					a.log(a.tr("ERROR: Timeout waiting for Node.js installation to complete."))
					a.emitEvent("env-check-done")
					return
				}
			} else {
				a.installingNode = true
				a.installMutex.Unlock()

				a.log(a.tr("Node.js not found. Downloading and installing..."))
				if err := a.installNodeJS(); err != nil {
					a.log(a.tr("Failed to install Node.js: ") + err.Error())
					a.installMutex.Lock()
					a.installingNode = false
					a.installMutex.Unlock()
					a.emitEvent("env-check-done")
					return
				}
				a.log(a.tr("Node.js installed successfully."))

				a.installMutex.Lock()
				a.installingNode = false
				a.installMutex.Unlock()

				// Signal that Node.js installation is complete
				select {
				case a.nodeInstallDone <- true:
				default:
					// Channel already has a value, skip
				}

				nodeInstalled = true
			}
		} else {
			a.log(a.tr("Node.js is already installed."))
			nodeInstalled = true
		}

		// Only proceed if Node.js is successfully installed
		if !nodeInstalled {
			a.log(a.tr("ERROR: Node.js is not available. Cannot proceed with AI tools installation."))
			a.emitEvent("env-check-done")
			return
		}

		// Update path for the current process anyway to ensure npm is found
		a.updatePathForNode()

		// Check for Git
		a.log(a.tr("Checking Git installation..."))
		if _, err := exec.LookPath("git"); err != nil {
			// Check common locations before giving up
			gitFound := false
			if _, err := os.Stat(`C:\Program Files\Git\cmd\git.exe`); err == nil {
				gitFound = true
			}

			if gitFound {
				a.updatePathForGit()
				a.log(a.tr("Git found in standard location."))
			} else {
				// Check if installation is already in progress
				a.installMutex.Lock()
				if a.installingGit {
					a.log(a.tr("Git installation already in progress, skipping..."))
					a.installMutex.Unlock()
					time.Sleep(5 * time.Second)
				} else {
					a.installingGit = true
					a.installMutex.Unlock()

					a.log(a.tr("Git not found. Downloading and installing..."))
					if err := a.installGitBash(); err != nil {
						a.log("Failed to install Git: " + err.Error())
						a.installMutex.Lock()
						a.installingGit = false
						a.installMutex.Unlock()
					} else {
						a.log(a.tr("Git installed successfully."))
						a.updatePathForGit()
						a.installMutex.Lock()
						a.installingGit = false
						a.installMutex.Unlock()
					}
				}
			}
		} else {
			a.log(a.tr("Git is installed."))
		}

		// Ensure node.exe is in local tool path for npm wrappers
		a.ensureLocalNodeBinary()

		// 5. Check and Install AI Tools in private ~/.cceasy directory ONLY
		tm := NewToolManager(a)

		// IMPORTANT: Verify npm is available before installing tools
		a.log(a.tr("Verifying npm is available before installing AI tools..."))

		// Try multiple times to find and verify npm
		var npmExec string
		var npmReady bool
		maxRetries := 10
		retryDelay := 3 * time.Second

		for i := 0; i < maxRetries; i++ {
			if i > 0 {
				a.log(a.tr("Retrying npm verification (attempt %d/%d)...", i+1, maxRetries))
				time.Sleep(retryDelay)
			}

			// Try to find npm
			var err error
			npmExec, err = exec.LookPath("npm")
			if err != nil {
				npmExec, err = exec.LookPath("npm.cmd")
			}

			if err != nil || npmExec == "" {
				a.log(a.tr("npm not found in PATH, updating environment..."))
				a.updatePathForNode()
				continue
			}

			// Test npm command
			npmTestCmd := exec.Command(npmExec, "--version")
			npmTestCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
			if err := npmTestCmd.Run(); err != nil {
				a.log(a.tr("npm command test failed: %v", err))
				continue
			}

			// npm is ready
			npmReady = true
			break
		}

		if !npmReady || npmExec == "" {
			a.log(a.tr("ERROR: npm not found after %d attempts. Cannot install AI tools. Please ensure Node.js is properly installed.", maxRetries))
			a.emitEvent("env-check-done")
			return
		}

		a.log(a.tr("npm verified successfully: %s", npmExec))

		// Install kilo first, then other tools
		tools := []string{"kilo", "claude", "gemini", "codex", "opencode", "codebuddy", "qoder", "iflow"}

		for _, tool := range tools {
			a.log(a.tr("Checking %s in private directory...", tool))
			status := tm.GetToolStatus(tool)

			if !status.Installed {
				a.log(a.tr("%s not found in private directory. Attempting automatic installation...", tool))
				if err := tm.InstallTool(tool); err != nil {
					a.log(a.tr("ERROR: Failed to install %s: %v", tool, err))
					// We continue to other tools even if one fails, allowing manual intervention later
				} else {
					a.log(a.tr("%s installed successfully to private directory.", tool))
					a.updatePathForNode() // Refresh path after install
				}
			} else {
				// Tool is installed - verify it's in our private directory
				home, _ := os.UserHomeDir()
				expectedPrefix := filepath.Join(home, ".cceasy", "tools")
				if !strings.HasPrefix(status.Path, expectedPrefix) {
					a.log(a.tr("WARNING: %s found at %s (not in private directory, skipping)", tool, status.Path))
					continue
				}

				a.log(a.tr("%s found in private directory at %s (version: %s).", tool, status.Path, status.Version))
				// Check for updates ONLY for tools in private directory
				if tool == "codex" || tool == "opencode" || tool == "codebuddy" || tool == "qoder" || tool == "iflow" || tool == "gemini" || tool == "claude" || tool == "kilo" {
					a.log(a.tr("Checking for %s updates in private directory...", tool))
					latest, err := a.getLatestNpmVersion(npmExec, tm.GetPackageName(tool))
					if err == nil && latest != "" {
						// Use semantic version comparison
						needsUpdate := a.compareVersions(status.Version, latest) < 0
						if needsUpdate {
							a.log(a.tr("New version available for %s: %s (current: %s). Updating private version...", tool, latest, status.Version))
							if err := tm.UpdateTool(tool); err != nil {
								// Check if it's a non-critical error
								errStr := err.Error()
								if strings.Contains(errStr, "ripgrep") && strings.Contains(errStr, "403") {
									a.log(a.tr("Warning: %s update completed with ripgrep download issue (GitHub API limit). Tool should still work.", tool))
								} else if strings.Contains(errStr, "EPERM") || strings.Contains(errStr, "EBUSY") {
									a.log(a.tr("Warning: %s update failed due to file lock. Please close any running instances and try again later.", tool))
								} else {
									a.log(a.tr("ERROR: Failed to update %s: %v", tool, err))
								}
							} else {
								a.log(a.tr("%s updated successfully to %s in private directory.", tool, latest))
							}
						} else {
							a.log(a.tr("%s is already up to date (version: %s).", tool, status.Version))
						}
					}
				}
			}
		}

		a.log(a.tr("Environment check complete."))

		// Update config to skip check next time if this was the first run
		if cfg, err := a.LoadConfig(); err == nil {
			needsSave := false
			if !cfg.EnvCheckDone {
				cfg.EnvCheckDone = true
				cfg.PauseEnvCheck = true
				needsSave = true
			}
			if needsSave {
				a.SaveConfig(cfg)
			}
		}

		a.emitEvent("env-check-done")
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

	// Official URL
	officialURL := fmt.Sprintf("https://nodejs.org/dist/v%s/%s", nodeVersion, fileName)
	downloadURL := officialURL

	// Try China mirror first for Chinese users (only for x64 as arm64 might not be synced)
	if strings.HasPrefix(strings.ToLower(a.CurrentLanguage), "zh") && nodeArch != "arm64" {
		mirrorURL := fmt.Sprintf("https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v%s/%s", nodeVersion, fileName)
		a.log(a.tr("Trying China mirror for faster download..."))

		// Check if mirror has this version
		client := &http.Client{Timeout: 10 * time.Second}
		headReq, _ := http.NewRequest("HEAD", mirrorURL, nil)
		headReq.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
		headResp, err := client.Do(headReq)
		if err == nil && headResp.StatusCode == http.StatusOK {
			downloadURL = mirrorURL
			a.log(a.tr("Using China mirror: %s", mirrorURL))
		} else {
			a.log(a.tr("China mirror not available for this version, falling back to official source"))
		}
		if headResp != nil {
			headResp.Body.Close()
		}
	}

	a.log(a.tr("Downloading Node.js %s for %s...", nodeVersion, nodeArch))

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
		return fmt.Errorf("%s", a.tr("Node.js installer is not accessible (Status: %s). Please check your internet connection or mirror availability.", status))
	}
	headResp.Body.Close()

	tempDir := os.TempDir()
	msiPath := filepath.Join(tempDir, fileName)

	if err := a.downloadFile(msiPath, downloadURL); err != nil {
		return fmt.Errorf("error downloading Node.js installer: %w", err)
	}

	// Wait a moment to ensure file is fully written and not locked
	time.Sleep(500 * time.Millisecond)

	a.log(a.tr("Installing Node.js (this may take a moment, please grant administrator permission if prompted)..."))

	// Use ShellExecute with "runas" verb to request admin privileges
	shell32 := syscall.NewLazyDLL("shell32.dll")
	shellExecute := shell32.NewProc("ShellExecuteW")

	verb := syscall.StringToUTF16Ptr("runas")
	file := syscall.StringToUTF16Ptr("msiexec.exe")
	// Use /qb for basic UI with progress bar, or /qn for silent
	params := syscall.StringToUTF16Ptr(fmt.Sprintf("/i \"%s\" /qb ALLUSERS=1", msiPath))
	dir := syscall.StringToUTF16Ptr("")

	ret, _, _ := shellExecute.Call(
		0,
		uintptr(unsafe.Pointer(verb)),
		uintptr(unsafe.Pointer(file)),
		uintptr(unsafe.Pointer(params)),
		uintptr(unsafe.Pointer(dir)),
		uintptr(syscall.SW_HIDE),
	)

	if ret <= 32 {
		return fmt.Errorf("failed to launch Node.js installer with admin privileges (error code: %d). Please run the application as administrator.", ret)
	}

	// Wait for installation to complete by checking if node.exe exists
	a.log(a.tr("Waiting for Node.js installation to complete..."))
	nodePath := `C:\Program Files\nodejs\node.exe`
	maxWaitTime := 5 * time.Minute
	checkInterval := 2 * time.Second
	elapsed := time.Duration(0)

	for elapsed < maxWaitTime {
		if _, err := os.Stat(nodePath); err == nil {
			a.log(a.tr("Node.js installation completed successfully."))

			// Wait for npm to be available as well
			a.log(a.tr("Verifying npm availability..."))
			npmReady := false
			npmWaitTime := 30 * time.Second
			npmCheckInterval := 1 * time.Second
			npmElapsed := time.Duration(0)

			for npmElapsed < npmWaitTime {
				npmCmd := exec.Command("npm", "--version")
				npmCmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
				if err := npmCmd.Run(); err == nil {
					a.log(a.tr("npm is ready."))
					npmReady = true
					break
				}
				time.Sleep(npmCheckInterval)
				npmElapsed += npmCheckInterval
			}

			if !npmReady {
				a.log(a.tr("Warning: npm verification timed out, but continuing anyway..."))
			}

			time.Sleep(2 * time.Second) // Additional wait for finalization

			// Clean up installer file after successful installation
			go func() {
				time.Sleep(5 * time.Second) // Wait a bit more before cleanup
				os.Remove(msiPath)
			}()

			return nil
		}
		time.Sleep(checkInterval)
		elapsed += checkInterval
	}

	// If we reach here, installation might have failed or taken too long
	a.log(a.tr("Warning: Node.js installation verification timed out. Please check if Node.js was installed correctly."))

	// Try to clean up installer file
	os.Remove(msiPath)

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
		a.log(a.tr("Updated PATH environment variable for Git."))
	}
}

// isVCRedistInstalled checks if Visual C++ Redistributable is already installed
func (a *App) isVCRedistInstalled() bool {
	// Check registry for VC++ Redistributable installation
	// HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64 or arm64
	arch := os.Getenv("PROCESSOR_ARCHITECTURE")
	var regPath string

	if arch == "ARM64" || os.Getenv("PROCESSOR_ARCHITEW6432") == "ARM64" {
		regPath = `SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\ARM64`
	} else {
		regPath = `SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64`
	}

	a.log(fmt.Sprintf("VC Redist check: Checking registry path: HKLM\\%s", regPath))

	// Use reg query to check if the key exists
	cmd := exec.Command("reg", "query", fmt.Sprintf("HKLM\\%s", regPath), "/v", "Installed")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	output, err := cmd.Output()

	if err != nil {
		a.log(fmt.Sprintf("VC Redist check: Registry key not found or error: %v", err))
		return false
	}

	outputStr := string(output)
	a.log(fmt.Sprintf("VC Redist check: Registry output: %s", outputStr))

	if strings.Contains(outputStr, "0x1") {
		// Extract version if available
		if strings.Contains(outputStr, "Version") {
			lines := strings.Split(outputStr, "\n")
			for _, line := range lines {
				if strings.Contains(line, "Version") && strings.Contains(line, "REG_SZ") {
					parts := strings.Fields(line)
					if len(parts) >= 3 {
						version := parts[len(parts)-1]
						a.log(fmt.Sprintf("VC Redist check: Found installed version: %s", version))
					}
				}
			}
		}
		a.log("VC Redist check: Found installed (0x1)")
		return true
	}

	a.log("VC Redist check: Not installed or value not 0x1")
	return false
}

// installVCRedist installs Visual C++ Redistributable for tools like codex
func (a *App) installVCRedist() error {
	arch := os.Getenv("PROCESSOR_ARCHITECTURE")
	var downloadURL string
	var fileName string

	if arch == "ARM64" || os.Getenv("PROCESSOR_ARCHITEW6432") == "ARM64" {
		downloadURL = "https://aka.ms/vc14/vc_redist.arm64.exe"
		fileName = "vc_redist.arm64.exe"
	} else {
		downloadURL = "https://aka.ms/vc14/vc_redist.x64.exe"
		fileName = "vc_redist.x64.exe"
	}

	fmt.Printf("  → Downloading from: %s\n", downloadURL)
	a.log(a.tr("Downloading Visual C++ Redistributable..."))

	tempDir := os.TempDir()
	exePath := filepath.Join(tempDir, fileName)
	fmt.Printf("  → Download path: %s\n", exePath)

	// Download
	if err := a.downloadFile(exePath, downloadURL); err != nil {
		errMsg := fmt.Sprintf("failed to download VC Redist: %v", err)
		fmt.Printf("  ✗ %s\n", errMsg)
		return fmt.Errorf(errMsg)
	}

	fmt.Println("  ✓ Download completed")

	// Wait for file to be fully written
	time.Sleep(500 * time.Millisecond)

	// Verify file exists
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		errMsg := "downloaded file not found"
		fmt.Printf("  ✗ %s\n", errMsg)
		return fmt.Errorf(errMsg)
	}

	fmt.Println("  → Starting installation (requires admin privileges)...")
	a.log(a.tr("Installing Visual C++ Redistributable..."))
	a.log(a.tr("You may be prompted for administrator permission. Please accept to continue."))

	// Use ShellExecute with "runas" verb to request admin privileges
	shell32 := syscall.NewLazyDLL("shell32.dll")
	shellExecute := shell32.NewProc("ShellExecuteW")

	verb := syscall.StringToUTF16Ptr("runas")
	file := syscall.StringToUTF16Ptr(exePath)
	// /install for install, /quiet for no UI, /norestart to not restart
	params := syscall.StringToUTF16Ptr("/install /quiet /norestart")
	dir := syscall.StringToUTF16Ptr("")

	fmt.Printf("  → Installer command: %s /install /quiet /norestart\n", exePath)

	ret, _, _ := shellExecute.Call(
		0,
		uintptr(unsafe.Pointer(verb)),
		uintptr(unsafe.Pointer(file)),
		uintptr(unsafe.Pointer(params)),
		uintptr(unsafe.Pointer(dir)),
		uintptr(syscall.SW_SHOW),
	)

	if ret <= 32 {
		errMsg := fmt.Sprintf("failed to launch VC Redist installer with admin privileges (error code: %d)", ret)
		fmt.Printf("  ✗ %s\n", errMsg)
		return fmt.Errorf(errMsg)
	}

	fmt.Println("  ✓ Installer launched successfully")

	// Wait for installation to complete and verify
	fmt.Println("  → Waiting for installation to complete...")
	a.log(a.tr("Waiting for installation to complete..."))

	// Wait and verify installation with retries
	maxRetries := 10
	installed := false
	for i := 0; i < maxRetries; i++ {
		time.Sleep(5 * time.Second) // Wait 5 seconds between checks

		if a.isVCRedistInstalled() {
			installed = true
			fmt.Println("  ✓ Installation verified successfully")
			a.log(a.tr("✓ Visual C++ Redistributable installed and verified successfully."))
			break
		}

		if i < maxRetries-1 {
			fmt.Printf("  → Still waiting... (%d/%d)\n", i+2, maxRetries)
			a.log(a.tr("Waiting for installation to complete... (%d/%d)", i+2, maxRetries))
		}
	}

	// Clean up installer file
	go func() {
		time.Sleep(5 * time.Second)
		os.Remove(exePath)
	}()

	if !installed {
		errMsg := fmt.Sprintf("VC Redistributable installation verification failed after %d attempts", maxRetries)
		fmt.Printf("  ✗ %s\n", errMsg)
		return fmt.Errorf(errMsg)
	}

	return nil
}

func (a *App) installGitBash() error {
	gitVersion := "2.52.0"
	// git-for-windows versioning can be tricky. v2.52.0.windows.1
	fullVersion := "v2.52.0.windows.1"
	fileName := fmt.Sprintf("Git-%s-64-bit.exe", gitVersion)
	
	downloadURL := fmt.Sprintf("https://github.com/git-for-windows/git/releases/download/%s/%s", fullVersion, fileName)
	if strings.HasPrefix(strings.ToLower(a.CurrentLanguage), "zh") {
		downloadURL = fmt.Sprintf("https://npmmirror.com/mirrors/git-for-windows/%s/%s", fullVersion, fileName)
	}
	
	a.log(a.tr("Downloading Git %s...", gitVersion))

	tempDir := os.TempDir()
	exePath := filepath.Join(tempDir, fileName)

	if err := a.downloadFile(exePath, downloadURL); err != nil {
		return fmt.Errorf("error downloading Git installer: %w", err)
	}

	// Wait a moment to ensure file is fully written and not locked
	time.Sleep(500 * time.Millisecond)

	a.log(a.tr("Installing Git (this may take a moment, please grant administrator permission if prompted)..."))

	// Use ShellExecute with "runas" verb to request admin privileges
	shell32 := syscall.NewLazyDLL("shell32.dll")
	shellExecute := shell32.NewProc("ShellExecuteW")

	verb := syscall.StringToUTF16Ptr("runas")
	file := syscall.StringToUTF16Ptr(exePath)
	// IMPORTANT: Use /DIR parameter to specify install directory explicitly
	// This helps avoid permission issues with default directory
	params := syscall.StringToUTF16Ptr(`/VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /DIR="C:\Program Files\Git"`)
	dir := syscall.StringToUTF16Ptr("")

	ret, _, _ := shellExecute.Call(
		0,
		uintptr(unsafe.Pointer(verb)),
		uintptr(unsafe.Pointer(file)),
		uintptr(unsafe.Pointer(params)),
		uintptr(unsafe.Pointer(dir)),
		uintptr(syscall.SW_HIDE),
	)

	if ret <= 32 {
		// Provide detailed error message based on return code
		var errMsg string
		switch ret {
		case 5:
			errMsg = "Access denied. Please ensure you have administrator privileges."
		case 8:
			errMsg = "Insufficient memory to complete the operation."
		case 31:
			errMsg = "No file association for installer executable."
		default:
			errMsg = fmt.Sprintf("Unknown error (code: %d). Please try installing Git manually from https://git-scm.com/", ret)
		}
		return fmt.Errorf("failed to launch Git installer: %s", errMsg)
	}

	// Wait for installation to complete by checking if git.exe exists
	a.log(a.tr("Waiting for Git installation to complete..."))
	gitPath := `C:\Program Files\Git\cmd\git.exe`
	maxWaitTime := 5 * time.Minute
	checkInterval := 2 * time.Second
	elapsed := time.Duration(0)

	for elapsed < maxWaitTime {
		if _, err := os.Stat(gitPath); err == nil {
			a.log(a.tr("Git installation completed successfully."))
			time.Sleep(2 * time.Second) // Additional wait for finalization

			// Clean up installer file after successful installation
			go func() {
				time.Sleep(5 * time.Second) // Wait a bit more before cleanup
				os.Remove(exePath)
			}()

			return nil
		}
		time.Sleep(checkInterval)
		elapsed += checkInterval
	}

	// If we reach here, installation might have failed or taken too long
	a.log(a.tr("Warning: Git installation verification timed out. Please check if Git was installed correctly."))

	// Try to clean up installer file
	os.Remove(exePath)

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

	// Create transport with reasonable timeouts
	transport := &http.Transport{
		TLSHandshakeTimeout:   30 * time.Second,
		ResponseHeaderTimeout: 30 * time.Second,
		DisableKeepAlives:     true,
	}

	// Client with no overall timeout (handled by transport timeouts)
	// This allows large file downloads to complete
	client := &http.Client{
		Transport: transport,
		// CheckRedirect follows redirects automatically (default behavior)
		// aka.ms URLs redirect to the actual download location
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("network error during download: %v. Please check your internet connection or firewall settings.", err)
	}
	defer resp.Body.Close()

	// Log final URL after redirects
	if resp.Request.URL.String() != url {
		a.log(fmt.Sprintf("Redirected to: %s", resp.Request.URL.String()))
	}

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
				a.log(a.tr("Downloading (%.1f%%): %d/%d bytes", percent, downloaded, size))
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

	// Ensure file is synced to disk before closing
	out.Sync()

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

func (a *App) GetDownloadsFolder() (string, error) {
	// For testing and override purposes, check USERPROFILE first
	if home := os.Getenv("USERPROFILE"); home != "" {
		downloads := filepath.Join(home, "Downloads")
		if _, err := os.Stat(downloads); err == nil {
			return downloads, nil
		}
	}

	// Try using the shell32.dll to get the Downloads folder (FOLDERID_Downloads)
	// GUID: {374DE290-123F-4565-9164-39C4925E467B}
	shell32 := syscall.NewLazyDLL("shell32.dll")
	shGetKnownFolderPath := shell32.NewProc("SHGetKnownFolderPath")

	// FOLDERID_Downloads GUID
	folderID := syscall.GUID{
		Data1: 0x374DE290,
		Data2: 0x123F,
		Data3: 0x4565,
		Data4: [8]byte{0x91, 0x64, 0x39, 0xC4, 0x92, 0x5E, 0x46, 0x7B},
	}

	var path *uint16
	// KF_FLAG_DEFAULT = 0
	res, _, _ := shGetKnownFolderPath.Call(
		uintptr(unsafe.Pointer(&folderID)),
		0,
		0,
		uintptr(unsafe.Pointer(&path)),
	)

	if res == 0 {
		defer syscall.NewLazyDLL("ole32.dll").NewProc("CoTaskMemFree").Call(uintptr(unsafe.Pointer(path)))
		return syscall.UTF16ToString((*[1 << 16]uint16)(unsafe.Pointer(path))[:]), nil
	}

	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, "Downloads"), nil
}

func (a *App) findSh() string {
	// Try standard path lookup
	path, err := exec.LookPath("sh")
	if err == nil {
		return path
	}

	// Try common locations for Git Bash
	commonPaths := []string{
		`C:\Program Files\Git\bin\sh.exe`,
		`C:\Program Files\Git\usr\bin\sh.exe`,
		`C:\Program Files (x86)\Git\bin\sh.exe`,
		`C:\Program Files (x86)\Git\usr\bin\sh.exe`,
	}
	for _, p := range commonPaths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return "sh" // Fallback
}

func (a *App) platformLaunch(binaryName string, yoloMode bool, adminMode bool, pythonEnv string, projectDir string, env map[string]string, modelId string) {
	tm := NewToolManager(a)
	a.log(fmt.Sprintf("platformLaunch: Looking for tool '%s'", binaryName))
	status := tm.GetToolStatus(binaryName)

	a.log(fmt.Sprintf("Tool status - Installed: %v, Path: %s, Version: %s", status.Installed, status.Path, status.Version))

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
		case "iflow":
			flag = "-y"
		case "kilo":
			// kilo does not support yolo mode, no flag needed
			flag = ""
		case "kode":
			flag = "--dangerously-skip-permissions"
		case "qodercli", "qoder":
			flag = "--yolo"
		}
		if flag != "" {
			cmdArgs += " " + flag
		}
	}

	// Create a unified batch file for launching
	batchContent := "@echo off\r\n"
	batchContent += "chcp 65001 > nul\r\n" // Use UTF-8
	batchContent += fmt.Sprintf("cd /d \"%s\"\r\n", projectDir)

	// Set environment variables in the batch file
	for k, v := range env {
		batchContent += fmt.Sprintf("set %s=%s\r\n", k, v)
	}

	// Add Node.js paths to PATH (same as updatePathForNode)
	home, _ := os.UserHomeDir()
	localToolPath := filepath.Join(home, ".cceasy", "tools")
	nodePath := `C:\Program Files\nodejs`
	npmPath := filepath.Join(os.Getenv("AppData"), "npm")

	// Add Git paths to PATH for tools that need sh (like codex)
	gitCmdPath := `C:\Program Files\Git\cmd`
	gitBinPath := `C:\Program Files\Git\bin`
	gitUsrBinPath := `C:\Program Files\Git\usr\bin`

	// Set PATH with all necessary directories
	// Git paths are added to ensure sh, bash, and other Git utilities are available
	batchContent += fmt.Sprintf("set PATH=%s;%s;%s;%s;%s;%s;%%PATH%%\r\n",
		localToolPath, npmPath, nodePath, gitCmdPath, gitBinPath, gitUsrBinPath)

	// Activate Python environment if specified
	if pythonEnv != "" && pythonEnv != "None (Default)" {
		// Find conda root directory
		condaRoot := a.getCondaRoot()
		if condaRoot != "" {
			// Initialize conda first by calling activate.bat
			activateScript := filepath.Join(condaRoot, "Scripts", "activate.bat")
			batchContent += fmt.Sprintf("echo Initializing Conda from: %s\r\n", condaRoot)
			batchContent += fmt.Sprintf("call \"%s\"\r\n", activateScript)

			// Now activate the specific environment
			batchContent += fmt.Sprintf("echo Activating Python environment: %s\r\n", pythonEnv)
			batchContent += fmt.Sprintf("call conda activate \"%s\"\r\n", pythonEnv)
			batchContent += "if errorlevel 1 (\r\n"
			batchContent += fmt.Sprintf("  echo Warning: Failed to activate conda environment '%s'. Continuing with base environment.\r\n", pythonEnv)
			batchContent += ")\r\n"
		} else {
			batchContent += "echo Warning: Conda installation not found. Cannot activate environment.\r\n"
		}
	}

	// Launch the tool
	batchContent += fmt.Sprintf("echo Launching %s...\r\n", binaryName)
	batchContent += "echo.\r\n"

	ext := strings.ToLower(filepath.Ext(binaryPath))

	// Special handling: For npm-installed tools, bypass wrappers and call node directly
	// This avoids wrapper script issues and DLL loading problems
	if ext == ".cmd" || ext == ".bat" {
		// Check if this is an npm package wrapper in .cceasy/tools
		if strings.Contains(binaryPath, filepath.Join(home, ".cceasy", "tools")) {
			// Try to find the actual JavaScript entry point
			var jsEntryPoint string
			tm := NewToolManager(a)
			packageName := tm.GetPackageName(binaryName)
			if packageName != "" {
				// Construct path to the package's main entry point
				pkgDir := filepath.Join(home, ".cceasy", "tools", "node_modules", packageName)

				// Common entry points for CLI tools
				// Check common patterns in priority order
				possibleEntries := []string{
					filepath.Join(pkgDir, "index.js"),
					filepath.Join(pkgDir, "cli.js"),           // claude-code uses this
					filepath.Join(pkgDir, "dist", "index.js"), // gemini-cli uses this
					filepath.Join(pkgDir, "bin", "index.js"),
					filepath.Join(pkgDir, "bin", binaryName+".js"), // codex.js, etc.
					filepath.Join(pkgDir, "lib", "index.js"),
					filepath.Join(pkgDir, "src", "index.js"),
				}

				for _, entry := range possibleEntries {
					if _, err := os.Stat(entry); err == nil {
						jsEntryPoint = entry
						break
					}
				}
			}

			// If we found the JS entry point, call node directly
			if jsEntryPoint != "" {
				a.log(fmt.Sprintf("Using direct node invocation with entry point: %s", jsEntryPoint))
				batchContent += fmt.Sprintf("node \"%s\"%s\r\n", jsEntryPoint, cmdArgs)
			} else {
				// Fallback to calling the wrapper with 'call'
				a.log(fmt.Sprintf("No JS entry point found, using wrapper script with 'call': %s", binaryPath))
				batchContent += fmt.Sprintf("call \"%s\"%s\r\n", binaryPath, cmdArgs)
			}
		} else {
			// External .cmd/.bat file, use 'call'
			batchContent += fmt.Sprintf("call \"%s\"%s\r\n", binaryPath, cmdArgs)
		}
	} else if ext == ".ps1" {
		batchContent += fmt.Sprintf("powershell -ExecutionPolicy Bypass -File \"%s\"%s\r\n", binaryPath, cmdArgs)
	} else if ext == ".js" {
		batchContent += fmt.Sprintf("node \"%s\"%s\r\n", binaryPath, cmdArgs)
	} else if ext == "" {
		// Assume shell script (extensionless). Try to run with sh (Git Bash)
		// Find sh executable explicitly
		shPath := a.findSh()
		batchContent += fmt.Sprintf("\"%s\" \"%s\"%s\r\n", shPath, binaryPath, cmdArgs)
	} else {
		batchContent += fmt.Sprintf("\"%s\"%s\r\n", binaryPath, cmdArgs)
	}

	// Capture exit code and show status
	batchContent += "set TOOL_EXIT_CODE=%errorlevel%\r\n"
	batchContent += "echo.\r\n"
	batchContent += "if %TOOL_EXIT_CODE% neq 0 (\r\n"
	batchContent += "  echo ========================================\r\n"
	batchContent += fmt.Sprintf("  echo %s exited with error code %%TOOL_EXIT_CODE%%\r\n", binaryName)
	batchContent += "  echo ========================================\r\n"
	batchContent += "  echo.\r\n"
	batchContent += "  echo Press any key to close this window...\r\n"
	batchContent += "  pause >nul\r\n"
	batchContent += ") else (\r\n"
	batchContent += "  echo ========================================\r\n"
	batchContent += fmt.Sprintf("  echo %s completed successfully\r\n", binaryName)
	batchContent += "  echo ========================================\r\n"
	batchContent += "  REM Keep window open for TUI applications\r\n"
	batchContent += "  REM Window will stay open due to cmd /k\r\n"
	batchContent += ")\r\n"

	// Create a temporary batch file
	tempBatchPath := filepath.Join(os.TempDir(), fmt.Sprintf("aicoder_launch_%d.bat", time.Now().UnixNano()))
	err := os.WriteFile(tempBatchPath, []byte(batchContent), 0644)
	if err != nil {
		a.log("Error creating batch file: " + err.Error())
		a.ShowMessage("Launch Error", "Failed to create temporary batch file")
		return
	}

	a.log(fmt.Sprintf("Created launch script: %s", tempBatchPath))

	// Clean up the batch file after a delay
	go func() {
		time.Sleep(10 * time.Second)
		os.Remove(tempBatchPath)
	}()

	if adminMode {
		// Launch with administrator privileges
		shell32 := syscall.NewLazyDLL("shell32.dll")
		shellExecute := shell32.NewProc("ShellExecuteW")

		verb := syscall.StringToUTF16Ptr("runas")
		file := syscall.StringToUTF16Ptr("cmd.exe")
		params := syscall.StringToUTF16Ptr(fmt.Sprintf("/c \"%s\"", tempBatchPath))
		dir := syscall.StringToUTF16Ptr(projectDir)

		ret, _, _ := shellExecute.Call(
			0,
			uintptr(unsafe.Pointer(verb)),
			uintptr(unsafe.Pointer(file)),
			uintptr(unsafe.Pointer(params)),
			uintptr(unsafe.Pointer(dir)),
			uintptr(syscall.SW_SHOW),
		)

		if ret <= 32 {
			a.log(fmt.Sprintf("ShellExecute failed with return value: %d", ret))
			a.ShowMessage("Launch Error", "Failed to launch with admin privileges.")
		}
	} else {
		// Normal launch
		// For tools like codex that require TTY, create special batch file
		if binaryName == "codex" || binaryName == "openai" {
			// Create a specialized batch file for codex with proper TTY handling
			codexBatchContent := "@echo off\r\n"
			codexBatchContent += "chcp 65001 > nul\r\n"
			codexBatchContent += fmt.Sprintf("cd /d \"%s\"\r\n", projectDir)

			// Set environment variables
			for k, v := range env {
				codexBatchContent += fmt.Sprintf("set %s=%s\r\n", k, v)
			}
			codexBatchContent += fmt.Sprintf("set PATH=%s;%%PATH%%\r\n", localToolPath)

			// Launch codex directly without extra quoting
			codexBatchContent += fmt.Sprintf("echo Launching %s...\r\n", binaryName)
			codexBatchContent += "echo.\r\n"
			codexBatchContent += fmt.Sprintf("call \"%s\"%s\r\n", binaryPath, cmdArgs)

			// Capture exit code and show status
			codexBatchContent += "set TOOL_EXIT_CODE=%errorlevel%\r\n"
			codexBatchContent += "echo.\r\n"
			codexBatchContent += "if %TOOL_EXIT_CODE% neq 0 (\r\n"
			codexBatchContent += "  echo ========================================\r\n"
			codexBatchContent += fmt.Sprintf("  echo %s exited with error code %%TOOL_EXIT_CODE%%\r\n", binaryName)
			codexBatchContent += "  echo ========================================\r\n"
			codexBatchContent += "  echo.\r\n"
			codexBatchContent += "  echo Press any key to close this window...\r\n"
			codexBatchContent += "  pause >nul\r\n"
			codexBatchContent += ") else (\r\n"
			codexBatchContent += "  echo ========================================\r\n"
			codexBatchContent += fmt.Sprintf("  echo %s completed successfully\r\n", binaryName)
			codexBatchContent += "  echo ========================================\r\n"
			codexBatchContent += "  REM Keep window open for interactive use\r\n"
			codexBatchContent += ")\r\n"

			// Create temporary batch file for codex
			codexBatchPath := filepath.Join(os.TempDir(), fmt.Sprintf("aicoder_codex_%d.bat", time.Now().UnixNano()))
			if err := os.WriteFile(codexBatchPath, []byte(codexBatchContent), 0644); err != nil {
				a.log("Error creating codex batch file: " + err.Error())
				a.ShowMessage("Launch Error", "Failed to create temporary batch file")
				return
			}

			a.log(fmt.Sprintf("Launching %s with TTY batch mode", binaryName))

			// Clean up batch file after delay
			go func() {
				time.Sleep(10 * time.Second)
				os.Remove(codexBatchPath)
			}()

			// Launch using the batch file
			cmdLine := fmt.Sprintf(`cmd /c start "AICoder - %s" /d "%s" cmd /k "%s"`,
				binaryName, projectDir, codexBatchPath)

			cmd := exec.Command("cmd")
			cmd.SysProcAttr = &syscall.SysProcAttr{
				CmdLine:    cmdLine,
				HideWindow: true,
			}

			if err := cmd.Start(); err != nil {
				a.log("Error launching tool: " + err.Error())
				a.ShowMessage("Launch Error", "Failed to start process: "+err.Error())
			}
		} else {
			// Use batch file for other tools
			cmdLine := fmt.Sprintf(`cmd /c start "AICoder - %s" /d "%s" cmd /k "%s"`, binaryName, projectDir, tempBatchPath)

			cmd := exec.Command("cmd")
			cmd.SysProcAttr = &syscall.SysProcAttr{
				CmdLine:    cmdLine,
				HideWindow: true,
			}

			if err := cmd.Start(); err != nil {
				a.log("Error launching tool: " + err.Error())
				a.ShowMessage("Launch Error", "Failed to start process: "+err.Error())
			}
		}
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
	cmd := exec.Command(path, "--version")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd
}



func createNpmInstallCmd(npmPath string, args []string) *exec.Cmd {
	// Use exec.Command directly with npm path and arguments
	// This is more reliable than manually constructing CmdLine
	cmd := exec.Command(npmPath, args...)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd
}

func createCondaEnvListCmd(condaCmd string) *exec.Cmd {
	cmd := exec.Command("cmd", "/c", condaCmd, "env", "list")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd
}

func (a *App) ensureLocalNodeBinary() {
	home, _ := os.UserHomeDir()
	localNodeDir := filepath.Join(home, ".cceasy", "tools")
	
	// Create directory if it doesn't exist
	if err := os.MkdirAll(localNodeDir, 0755); err != nil {
		a.log("Failed to create local tools dir: " + err.Error())
		return
	}

	localNodeExe := filepath.Join(localNodeDir, "node.exe")

	if _, err := os.Stat(localNodeExe); err == nil {
		// node.exe already exists
		return
	}

	// Find system node.exe
	systemNode, err := exec.LookPath("node")
	if err != nil {
		// Try common paths
		commonPaths := []string{
			`C:\Program Files\nodejs\node.exe`,
			filepath.Join(os.Getenv("AppData"), "npm", "node.exe"),
		}
		for _, p := range commonPaths {
			if _, err := os.Stat(p); err == nil {
				systemNode = p
				break
			}
		}
	}

	if systemNode == "" {
		a.log("Warning: Could not find system node.exe to copy to local tool dir.")
		return
	}

	a.log(fmt.Sprintf("Copying node.exe from %s to %s to ensure wrapper compatibility...", systemNode, localNodeExe))

	// Copy the file
	input, err := os.ReadFile(systemNode)
	if err != nil {
		a.log("Failed to read system node.exe: " + err.Error())
		return
	}

	if err := os.WriteFile(localNodeExe, input, 0755); err != nil {
		a.log("Failed to write local node.exe: " + err.Error())
		return
	}
	
	a.log("Successfully copied node.exe to local directory.")
}

func (a *App) LaunchInstallerAndExit(installerPath string) error {
	a.log(fmt.Sprintf("Launching installer: %s", installerPath))
	
	// Use cmd /c start to launch the installer and return immediately
	cmd := exec.Command("cmd", "/c", "start", "", installerPath)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	
	err := cmd.Start()
	if err != nil {
		return fmt.Errorf("failed to launch installer: %w", err)
	}
	
	// Wait a tiny bit and then quit
	go func() {
		time.Sleep(500 * time.Millisecond)
		runtime.Quit(a.ctx)
	}()

	return nil
}

func getWindowsVersionHidden() string {
	cmd := exec.Command("cmd")
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CmdLine:    `cmd /c ver`,
		HideWindow: true,
	}
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	// Sanitize output to ASCII only
	verStr := string(out)
	safeVer := ""
	for _, r := range verStr {
		if r >= 32 && r <= 126 {
			safeVer += string(r)
		}
	}
	return strings.TrimSpace(safeVer)
}

func createUpdateCmd(path string) *exec.Cmd {
	cmd := exec.Command(path, "update")
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd
}

func createHiddenCmd(name string, args ...string) *exec.Cmd {
	cmd := exec.Command(name, args...)
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
	return cmd
}

