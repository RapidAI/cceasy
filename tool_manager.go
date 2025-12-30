package main

import (
	"fmt"
	"os/exec"
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
	path, err := exec.LookPath(name)
	if err != nil {
		// Try common aliases or specific checks if needed
		if name == "claude" {
			// Already handled in app.go, but let's centralize here
		}
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
	var cmd *exec.Command
	switch name {
	case "claude":
		cmd = exec.Command(path, "--version")
	case "gemini":
		cmd = exec.Command(path, "--version")
	case "codex":
		cmd = exec.Command(path, "--version")
	default:
		cmd = exec.Command(path, "--version")
	}

	out, err := cmd.Output()
	if err != nil {
		return "", err
	}

	output := strings.TrimSpace(string(out))
	// Parse version based on tool output format
	if name == "claude" {
		// claude-code/0.2.29 darwin-arm64 node-v22.12.0
		parts := strings.Split(output, " ")
		if len(parts) > 0 {
			verParts := strings.Split(parts[0], "/")
			if len(verParts) == 2 {
				return verParts[1], nil
			}
		}
	}

	// Default fallback: return the first thing that looks like a version
	return output, nil
}

func (tm *ToolManager) InstallTool(name string) error {
	var cmd *exec.Command
	switch name {
	case "claude":
		cmd = exec.Command("npm", "install", "-g", "@anthropic-ai/claude-code")
	case "gemini":
		// Assuming gemini-chat-cli or similar
		cmd = exec.Command("npm", "install", "-g", "gemini-chat-cli")
	case "codex":
		// Assuming an npm package for codex if it exists, or just placeholder
		cmd = exec.Command("npm", "install", "-g", "openai-codex-cli")
	default:
		return fmt.Errorf("unknown tool: %s", name)
	}

	// For Windows, we might need to handle the .cmd extension for npm
	if runtime.GOOS == "windows" {
		cmd.Args = append([]string{"/c", "npm"}, cmd.Args[1:]...)
		cmd.Path = "cmd"
	}

	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to install %s: %v\nOutput: %s", name, err, string(out))
	}
	return nil
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
