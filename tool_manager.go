package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"
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

	var path string
	var err error

	for _, bn := range binaryNames {
		path, err = exec.LookPath(bn)
		if err == nil {
			break
		}
		
		// Fallback: Check local node bin directly
		home, _ := os.UserHomeDir()
		
		if runtime.GOOS == "windows" {
			// Check prefix root and bin folder
			possiblePaths := []string{
				filepath.Join(home, ".cceasy", "node", bn+".cmd"),
				filepath.Join(home, ".cceasy", "node", bn),
				filepath.Join(home, ".cceasy", "node", "bin", bn+".cmd"),
				filepath.Join(home, ".cceasy", "node", "bin", bn),
			}
			for _, p := range possiblePaths {
				if _, err := os.Stat(p); err == nil {
					path = p
					break
				}
			}
		} else {
			localBin := filepath.Join(home, ".cceasy", "node", "bin", bn)
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
	
	if runtime.GOOS == "windows" {
		// Use cmd /c for Windows to ensure .cmd files are handled and paths are quoted correctly
		cmd = exec.Command("cmd")
		cmd.SysProcAttr = &syscall.SysProcAttr{
			CmdLine:    fmt.Sprintf(`cmd /c ""%s" --version"`, path),
			HideWindow: true,
		}
	} else {
		cmd = exec.Command(path, "--version")
	}

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
	localNodeDir := filepath.Join(home, ".cceasy", "node")
	
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
	default:
		return fmt.Errorf("unknown tool: %s", name)
	}

	// Use --prefix to install to our local folder, avoiding sudo/permission issues
	// This works with both system npm and local npm.
	args := []string{"install", "-g", packageName, "--prefix", localNodeDir, "--loglevel", "info"}
	
	if strings.HasPrefix(strings.ToLower(tm.app.CurrentLanguage), "zh") {
		args = append(args, "--registry=https://registry.npmmirror.com")
	}
	
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		// Prepare quoted arguments for the command line
		quotedArgs := make([]string, len(args))
		for i, arg := range args {
			if strings.ContainsAny(arg, " &^") {
				quotedArgs[i] = fmt.Sprintf(`"%s"`, arg)
			} else {
				quotedArgs[i] = arg
			}
		}

		// Use cmd /c with CmdLine for raw control over quoting on Windows.
		// We wrap the entire command in another set of quotes to ensure cmd /c
		// handles the internal quotes correctly.
		cmdLine := fmt.Sprintf(`cmd /c ""%s" %s"`, npmPath, strings.Join(quotedArgs, " "))
		cmd = exec.Command("cmd")
		cmd.SysProcAttr = &syscall.SysProcAttr{
			CmdLine:    cmdLine,
			HideWindow: true,
		}
	} else {
		cmd = exec.Command(npmPath, args...)
	}

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

	tm.app.log(fmt.Sprintf("Running installation: %s %s", cmd.Path, strings.Join(cmd.Args[1:], " ")))

	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to install %s: %v\nOutput: %s", name, err, string(out))
	}
	return nil
}

func (tm *ToolManager) getNpmPath() string {
	// 1. Check local node environment first
	home, _ := os.UserHomeDir()
	var localNpm string
	if runtime.GOOS == "windows" {
		localNpm = filepath.Join(home, ".cceasy", "node", "npm.cmd")
	} else {
		localNpm = filepath.Join(home, ".cceasy", "node", "bin", "npm")
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

func (a *App) CheckToolsStatus() []ToolStatus {
	tm := NewToolManager(a)
	tools := []string{"claude", "gemini", "codex"}
	statuses := make([]ToolStatus, len(tools))
	for i, name := range tools {
		statuses[i] = tm.GetToolStatus(name)
	}
	return statuses
}
