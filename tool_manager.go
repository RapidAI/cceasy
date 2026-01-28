package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type ToolStatus struct {
	Name      string `json:"name"`
	Installed bool   `json:"installed"`
	Version   string `json:"version"`
	Path      string `json:"path"`
}

type ToolManager struct {
	app *App
}

func NewToolManager(app *App) *ToolManager {
	return &ToolManager{app: app}
}

func (tm *ToolManager) GetToolStatus(name string) ToolStatus {
	status := ToolStatus{Name: name}

	tm.app.log(fmt.Sprintf("GetToolStatus: Checking tool '%s'", name))

	binaryNames := []string{name}
	if name == "claude" {
		binaryNames = append(binaryNames, "claude-code")
	}
	if name == "codex" {
		binaryNames = append(binaryNames, "openai")
	}
	if name == "opencode" && runtime.GOOS == "windows" {
		binaryNames = append(binaryNames, "opencode-windows-x64")
	}
	if name == "codebuddy" {
		binaryNames = []string{"codebuddy", "codebuddy-code"}
	}
	if name == "qoder" {
		binaryNames = []string{"qodercli", "qoder"}
	}
	if name == "iflow" {
		binaryNames = []string{"iflow"}
	}
	if name == "kilo" {
		binaryNames = []string{"kilo", "kilocode"}
	}
	if name == "kode" {
		binaryNames = []string{"kode"}
	}

	tm.app.log(fmt.Sprintf("GetToolStatus: Looking for binary names: %v", binaryNames))

	var path string

	// ONLY check private ~/.cceasy directory, do NOT check system PATH
	home, _ := os.UserHomeDir()

	for _, bn := range binaryNames {
		if runtime.GOOS == "windows" {
			// Check prefix root and bin folder
			// Prioritize .cmd, .exe, .bat.
			// Also check .ps1 and extensionless (shell scripts) as fallback
			possiblePaths := []string{
				filepath.Join(home, ".cceasy", "tools", bn+".cmd"),
				filepath.Join(home, ".cceasy", "tools", bn+".exe"),
				filepath.Join(home, ".cceasy", "tools", bn+".bat"),
				filepath.Join(home, ".cceasy", "tools", bn+".ps1"),
				filepath.Join(home, ".cceasy", "tools", "bin", bn+".cmd"),
				filepath.Join(home, ".cceasy", "tools", "bin", bn+".exe"),
				filepath.Join(home, ".cceasy", "tools", bn),
				filepath.Join(home, ".cceasy", "tools", "bin", bn),
			}

			// Special case for opencode specific binary path
			if name == "opencode" {
				possiblePaths = append(possiblePaths, filepath.Join(home, ".cceasy", "tools", "node_modules", "opencode-windows-x64", "bin", "opencode.exe"))
			}

			// Generic node_modules check using package name
			if pkgName := tm.GetPackageName(name); pkgName != "" {
				base := filepath.Join(home, ".cceasy", "tools", "node_modules", pkgName, "bin", bn)
				possiblePaths = append(possiblePaths, base)
				possiblePaths = append(possiblePaths, base+".js")
			}

			for _, p := range possiblePaths {
				if info, err := os.Stat(p); err == nil && !info.IsDir() {
					path = p
					break
				}
			}
		} else {
			localBin := filepath.Join(home, ".cceasy", "tools", "bin", bn)
			if _, err := os.Stat(localBin); err == nil {
				path = localBin
			} else {
				// Fallback: Check node_modules bin directly
				if pkgName := tm.GetPackageName(name); pkgName != "" {
					modBin := filepath.Join(home, ".cceasy", "tools", "node_modules", pkgName, "bin", bn)
					if _, err := os.Stat(modBin); err == nil {
						path = modBin
					}
				}
			}
		}

		if path != "" {
			break
		}
	}

	if path == "" {
		tm.app.log(fmt.Sprintf("GetToolStatus: Tool '%s' NOT found", name))
		return status
	}

	tm.app.log(fmt.Sprintf("GetToolStatus: Tool '%s' found at: %s", name, path))
	status.Installed = true
	status.Path = path

	version, err := tm.getToolVersion(name, path)
	if err == nil {
		status.Version = version
	}

	return status
}

func (tm *ToolManager) getToolVersion(name, path string) (string, error) {
	var cmd *exec.Cmd
	cmd = createVersionCmd(path)

	out, err := cmd.Output()
	if err != nil {
		return "", err
	}

	output := strings.TrimSpace(string(out))
	// Parse version based on tool output format
	if strings.Contains(name, "claude") {
		// claude-code/0.2.29 darwin-arm64 node-v22.12.0
		parts := strings.Split(output, " ")
		if len(parts) > 0 {
			verParts := strings.Split(parts[0], "/")
			if len(verParts) == 2 {
				return verParts[1], nil
			}
		}
	}

	return output, nil
}

func (tm *ToolManager) InstallTool(name string) error {
	npmPath := tm.getNpmPath()
	if npmPath == "" {
		return fmt.Errorf("npm not found. Please ensure Node.js is installed.")
	}

	home, _ := os.UserHomeDir()
	localNodeDir := filepath.Join(home, ".cceasy", "tools")

	// Ensure the local node directory exists for prefix usage
	if err := os.MkdirAll(localNodeDir, 0755); err != nil {
		return fmt.Errorf("failed to create local node directory: %w", err)
	}

	// Get package name
	packageName := tm.GetPackageName(name)
	if packageName == "" {
		return fmt.Errorf("unknown tool: %s", name)
	}

	// Pre-clean: Remove existing installation if present to avoid ENOTEMPTY errors on Windows
	pkgDir := filepath.Join(localNodeDir, "node_modules", packageName)
	if _, err := os.Stat(pkgDir); err == nil {
		tm.app.log(tm.app.tr("Removing existing %s installation to ensure clean install...", name))
		// Remove wrapper scripts first
		if runtime.GOOS == "windows" {
			wrappers := []string{
				filepath.Join(localNodeDir, name+".cmd"),
				filepath.Join(localNodeDir, name+".ps1"),
				filepath.Join(localNodeDir, name),
			}
			for _, wrapper := range wrappers {
				os.Remove(wrapper) // Best effort
			}
		}
		// Remove package directory with retry for locked files
		for i := 0; i < 3; i++ {
			err = os.RemoveAll(pkgDir)
			if err == nil {
				break
			}
			if i < 2 {
				tm.app.log(tm.app.tr("Retry removing directory (attempt %d/3)...", i+2))
				time.Sleep(time.Second)
			}
		}
		if err != nil {
			tm.app.log(tm.app.tr("Warning: Failed to completely remove old installation: %v", err))
		}
	}

	// Use --prefix to install to our local folder, avoiding sudo/permission issues
	// This works with both system npm and local npm.

	// Add @latest to ensure latest version is installed
	packages := []string{packageName + "@latest"}
	if name == "opencode" && runtime.GOOS != "windows" {
		var platformPkg string
		if runtime.GOOS == "darwin" {
			if runtime.GOARCH == "arm64" {
				platformPkg = "opencode-darwin-arm64@latest"
			} else {
				platformPkg = "opencode-darwin-x64@latest"
			}
		} else if runtime.GOOS == "linux" {
			if runtime.GOARCH == "arm64" {
				platformPkg = "opencode-linux-arm64@latest"
			} else {
				platformPkg = "opencode-linux-x64@latest"
			}
		}

		if platformPkg != "" {
			packages = append(packages, platformPkg)
		}
	}

	// Use a local cache directory to avoid permission issues with system/user cache
	localCacheDir := tm.app.GetLocalCacheDir()
	if err := os.MkdirAll(localCacheDir, 0755); err != nil {
		tm.app.log(fmt.Sprintf("Warning: Failed to create local npm cache dir: %v", err))
	}

	args := []string{"install", "-g"}
	args = append(args, packages...)
	args = append(args, "--prefix", localNodeDir, "--cache", localCacheDir, "--loglevel", "info")

	// Use --force to avoid ENOTEMPTY and other file lock issues on Windows
	args = append(args, "--force")

	// Skip postinstall scripts for iflow due to missing postinstall-ripgrep.js
	if name == "iflow" {
		args = append(args, "--ignore-scripts")
	}

	if strings.HasPrefix(strings.ToLower(tm.app.CurrentLanguage), "zh") {
		args = append(args, "--registry=https://registry.npmmirror.com")
	}

	var cmd *exec.Cmd
	cmd = createNpmInstallCmd(npmPath, args)

	// Set environment to include local node bin for the installation process
	localBinDir := filepath.Join(localNodeDir, "bin")
	if runtime.GOOS == "windows" {
		localBinDir = localNodeDir
	}

	env := os.Environ()
	pathFound := false
	for i, e := range env {
		if strings.HasPrefix(strings.ToUpper(e), "PATH=") {
			env[i] = fmt.Sprintf("PATH=%s%c%s", localBinDir, os.PathListSeparator, e[5:])
			pathFound = true
			break
		}
	}
	if !pathFound {
		env = append(env, "PATH="+localBinDir)
	}
	cmd.Env = env

	tm.app.log(tm.app.tr("Running installation: %s %s", cmd.Path, strings.Join(cmd.Args[1:], " ")))

	out, err := cmd.CombinedOutput()
	if err != nil {
		outputStr := string(out)
		// Check for specific npm errors
		needsRetry := false
		if strings.Contains(outputStr, "EACCES") || strings.Contains(outputStr, "EEXIST") {
			tm.app.log(tm.app.tr("Detected npm cache permission issue. Attempting to clear cache..."))
			needsRetry = true
		} else if strings.Contains(outputStr, "ENOTEMPTY") {
			tm.app.log(tm.app.tr("Detected ENOTEMPTY error (file lock issue). Will retry with cleanup..."))
			// Clean up the problematic directory more aggressively
			time.Sleep(2 * time.Second) // Wait for file locks to release
			os.RemoveAll(pkgDir) // Try to remove again
			needsRetry = true
		}

		if needsRetry {
			// Try to clean cache
			cleanArgs := []string{"cache", "clean", "--force", "--cache", localCacheDir}
			if strings.HasPrefix(strings.ToLower(tm.app.CurrentLanguage), "zh") {
				cleanArgs = append(cleanArgs, "--registry=https://registry.npmmirror.com")
			}

			cleanCmd := createNpmInstallCmd(npmPath, cleanArgs)
			cleanCmd.Env = env
			cleanCmd.CombinedOutput() // Ignore error on clean

			tm.app.log(tm.app.tr("Retrying installation after cleanup..."))
			// Retry installation
			cmd = createNpmInstallCmd(npmPath, args)
			cmd.Env = env
			out, err = cmd.CombinedOutput()
			if err != nil {
				return fmt.Errorf("failed to install %s (retry): %v\nOutput: %s", name, err, string(out))
			}
		} else {
			return fmt.Errorf("failed to install %s: %v\nOutput: %s", name, err, string(out))
		}
	}

	// Post-installation verification
	tm.app.log(tm.app.tr("Verifying %s installation...", name))
	time.Sleep(500 * time.Millisecond) // Brief wait for file system sync

	status := tm.GetToolStatus(name)
	if !status.Installed {
		return fmt.Errorf("installation completed but tool verification failed - %s not found", name)
	}

	tm.app.log(tm.app.tr("✓ %s installed and verified successfully (version: %s)", name, status.Version))
	return nil
}

func (tm *ToolManager) UpdateTool(name string) error {
	// Verify the tool is installed in our private directory first
	status := tm.GetToolStatus(name)
	if !status.Installed {
		return fmt.Errorf("tool %s is not installed", name)
	}

	home, _ := os.UserHomeDir()
	expectedPrefix := filepath.Join(home, ".cceasy", "tools")
	if !strings.HasPrefix(status.Path, expectedPrefix) {
		return fmt.Errorf("tool %s is not installed in private directory (%s), cannot update. Only private installations can be updated.", name, status.Path)
	}

	// Use npm to update the package in private directory
	// This avoids calling the tool's own update command which might try to update global installations
	packageName := tm.GetPackageName(name)
	if packageName == "" {
		return fmt.Errorf("unknown package name for tool %s", name)
	}

	tm.app.log(tm.app.tr("Updating %s in private directory using npm...", name))

	// Find npm
	npmExec, err := exec.LookPath("npm")
	if err != nil {
		npmExec, err = exec.LookPath("npm.cmd")
		if err != nil {
			return fmt.Errorf("npm not found")
		}
	}

	// Set up npm prefix to private directory
	localToolsDir := filepath.Join(home, ".cceasy", "tools")

	// Use npm install with latest version to update
	args := []string{"install", "-g", "--prefix", localToolsDir, packageName + "@latest", "--force"}

	// Add ignore-scripts for tools that have problematic postinstall scripts
	if name == "iflow" || name == "kilo" {
		args = append(args, "--ignore-scripts")
	}

	// Use local cache directory
	localCacheDir := tm.app.GetLocalCacheDir()
	if localCacheDir != "" {
		args = append(args, "--cache", localCacheDir)
	}

	cmd := createNpmInstallCmd(npmExec, args)

	tm.app.log(tm.app.tr("Running: npm %s", strings.Join(args, " ")))

	// Retry logic for Windows file locking issues
	maxRetries := 3
	var out []byte
	for i := 0; i < maxRetries; i++ {
		if i > 0 {
			tm.app.log(tm.app.tr("Retry attempt %d/%d after waiting...", i+1, maxRetries))
			time.Sleep(time.Duration(i*2) * time.Second) // Progressive backoff
		}

		out, err = cmd.CombinedOutput()
		if err == nil {
			break
		}

		// Check if it's a file locking error
		outputStr := string(out)
		isLockError := strings.Contains(outputStr, "EPERM") ||
					  strings.Contains(outputStr, "EBUSY") ||
					  strings.Contains(outputStr, "ENOTEMPTY") ||
					  strings.Contains(outputStr, "operation not permitted") ||
					  strings.Contains(outputStr, "resource busy or locked")

		if !isLockError || i == maxRetries-1 {
			// Not a lock error or final retry failed
			break
		}

		tm.app.log(tm.app.tr("Detected file lock issue, will retry..."))

		// Recreate command for retry
		cmd = createNpmInstallCmd(npmExec, args)
	}

	if err != nil {
		outputStr := string(out)
		// Check for specific errors that can be ignored
		if strings.Contains(outputStr, "403") && strings.Contains(outputStr, "ripgrep") {
			tm.app.log(tm.app.tr("Warning: ripgrep download failed (GitHub API limit), but %s may still work", name))
			// Don't fail the update for ripgrep download issues
			return nil
		}

		return fmt.Errorf("failed to update %s: %v\nOutput: %s", name, err, string(out))
	}

	tm.app.log(tm.app.tr("Successfully updated %s in private directory", name))
	return nil
}

func (tm *ToolManager) GetPackageName(name string) string {
	switch name {
	case "claude":
		return "@anthropic-ai/claude-code"
	case "gemini":
		return "@google/gemini-cli"
	case "codex":
		return "@openai/codex"
	case "opencode":
		if runtime.GOOS == "windows" {
			return "opencode-windows-x64"
		}
		return "opencode-ai"
	case "codebuddy":
		return "@tencent-ai/codebuddy-code"
	case "qoder":
		return "@qoder-ai/qodercli"
	case "iflow":
		return "@iflow-ai/iflow-cli"
	case "kilo":
		return "@kilocode/cli"
	case "kode":
		return "@shareai-lab/kode"
	default:
		return ""
	}
}

func (tm *ToolManager) getNpmPath() string {
	// 1. Check local node environment first
	home, _ := os.UserHomeDir()
	var localNpm string
	if runtime.GOOS == "windows" {
		localNpm = filepath.Join(home, ".cceasy", "tools", "npm.cmd")
	} else {
		localNpm = filepath.Join(home, ".cceasy", "tools", "bin", "npm")
	}

	if _, err := os.Stat(localNpm); err == nil {
		return localNpm
	}

	// 2. Fallback to system npm
	path, err := exec.LookPath("npm")
	if err == nil {
		return path
	}

	return ""
}

func (a *App) InstallTool(name string) error {
	tm := NewToolManager(a)
	return tm.InstallTool(name)
}

func (a *App) UpdateTool(name string) error {
	tm := NewToolManager(a)
	return tm.UpdateTool(name)
}

func (a *App) CheckToolsStatus() []ToolStatus {
	tm := NewToolManager(a)
	// Check kilo first, then other tools
	tools := []string{"kilo", "claude", "gemini", "codex", "opencode", "codebuddy", "qoder", "kode", "iflow"}
	statuses := make([]ToolStatus, len(tools))
	for i, name := range tools {
		statuses[i] = tm.GetToolStatus(name)
	}
	return statuses
}
