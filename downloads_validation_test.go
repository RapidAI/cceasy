package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	goruntime "runtime"
	"strings"
	"testing"
)

func TestDownloadValidation(t *testing.T) {
	// Create a temporary directory for testing
	tmpHome, err := os.MkdirTemp("", "download-validation-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpHome)

	// Mock UserHomeDir
	os.Setenv("HOME", tmpHome)
	os.Setenv("USERPROFILE", tmpHome)

	// Create a mock Downloads folder
	mockDownloads := filepath.Join(tmpHome, "Downloads")
	err = os.MkdirAll(mockDownloads, 0755)
	if err != nil {
		t.Fatalf("Failed to create mock downloads dir: %v", err)
	}

	app := NewApp()

	// 1. Test Small File (should fail)
	t.Run("SmallFile", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Length", "100") // Small file
			w.Header().Set("Content-Type", "application/octet-stream")
			w.WriteHeader(http.StatusOK)
			w.Write(make([]byte, 100))
		}))
		defer server.Close()

		// Determine correct filename based on platform
		fileName := "AICoder-Setup.exe"
		if goruntime.GOOS == "darwin" {
			fileName = "AICoder-Universal.pkg"
		}

		_, err := app.DownloadUpdate(server.URL+"/"+fileName, fileName)
		if err == nil {
			t.Error("Expected error for small file, got nil")
		} else if !strings.Contains(err.Error(), "file too small") {
			t.Errorf("Expected 'file too small' error, got: %v", err)
		}
	})

	// 2. Test Invalid Extension (should fail)
	t.Run("InvalidExtension", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			size := 6 * 1024 * 1024 // 6MB
			w.Header().Set("Content-Length", fmt.Sprintf("%d", size))
			w.Header().Set("Content-Type", "application/octet-stream")
			w.WriteHeader(http.StatusOK)
		}))
		defer server.Close()
		
		_, err := app.DownloadUpdate(server.URL+"/readme.txt", "readme.txt")
		if err == nil {
			t.Error("Expected error for invalid extension, got nil")
		} else if !strings.Contains(err.Error(), "invalid file extension") {
			t.Errorf("Expected 'invalid file extension' error, got: %v", err)
		}
	})

	// 3. Test Valid File (should pass)
	t.Run("ValidFile", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			size := 6 * 1024 * 1024 // 6MB
			w.Header().Set("Content-Length", fmt.Sprintf("%d", size))
			w.Header().Set("Content-Type", "application/octet-stream")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("valid executable content simulation"))
		}))
		defer server.Close()

		fileName := "AICoder-Setup.exe"
		if goruntime.GOOS == "darwin" {
			fileName = "AICoder-Universal.pkg"
		}

		_, err := app.DownloadUpdate(server.URL+"/"+fileName, fileName)
		
		if err != nil && strings.Contains(err.Error(), "file too small") {
			t.Errorf("Validation failed unexpectedly: %v", err)
		}
		if err != nil && strings.Contains(err.Error(), "invalid file extension") {
			t.Errorf("Validation failed unexpectedly: %v", err)
		}
	})
}
