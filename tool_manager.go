package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
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

	binaryNames := []string{name}
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
	if name == "kiro" {
		binaryNames = []string{"kilocode"}
	}

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
			}
		}

		if path != "" {
			break
		}
	}

	if path == "" {
		return status
	}

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

	var packageName string
	switch name {
	case "claude":
		packageName = "@anthropic-ai/claude-code"
	case "gemini":
		packageName = "@google/gemini-cli"
	case "codex":
		packageName = "@openai/codex"
	case "opencode":
		if runtime.GOOS == "windows" {
			packageName = "opencode-windows-x64"
		} else {
			packageName = "opencode-ai"
		}
	case "codebuddy":
		packageName = "@tencent-ai/codebuddy-code"
	case "qoder":
		packageName = "@qoder-ai/qodercli"
	case "iflow":
		packageName = "@iflow-ai/iflow-cli"
	case "kiro":
		packageName = "kilocode"
	default:
		return fmt.Errorf("unknown tool: %s", name)
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
		// Check for cache permission issues
		if strings.Contains(outputStr, "EACCES") || strings.Contains(outputStr, "EEXIST") {
			tm.app.log(tm.app.tr("Detected npm cache permission issue. Attempting to clear cache..."))

			// Try to clean cache
			cleanArgs := []string{"cache", "clean", "--force", "--cache", localCacheDir}
			if strings.HasPrefix(strings.ToLower(tm.app.CurrentLanguage), "zh") {
				cleanArgs = append(cleanArgs, "--registry=https://registry.npmmirror.com")
			}

			cleanCmd := createNpmInstallCmd(npmPath, cleanArgs)
			cleanCmd.Env = env
			cleanCmd.CombinedOutput() // Ignore error on clean

			tm.app.log(tm.app.tr("Retrying installation after cache clean..."))
			// Retry installation
			cmd = createNpmInstallCmd(npmPath, args)
			cmd.Env = env
			out, err = cmd.CombinedOutput()
			if err != nil {
				return fmt.Errorf("failed to install %s (retry): %v\nOutput: %s", name, err, string(out))
			}
			return nil
		}

		return fmt.Errorf("failed to install %s: %v\nOutput: %s", name, err, string(out))
	}
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
	args := []string{"install", "-g", "--prefix", localToolsDir, packageName + "@latest"}

	cmd := createNpmInstallCmd(npmExec, args)

	tm.app.log(tm.app.tr("Running: npm %s", strings.Join(args, " ")))
	out, err := cmd.CombinedOutput()
	if err != nil {
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
	case "kiro":
		return "kilocode"
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
	tools := []string{"claude", "gemini", "codex", "opencode", "codebuddy", "qoder", "iflow", "kiro"}
	statuses := make([]ToolStatus, len(tools))
	for i, name := range tools {
		statuses[i] = tm.GetToolStatus(name)
	}
	return statuses
}
