package main

import (
	"archive/zip"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func TestSkillsManagement(t *testing.T) {
	// Setup temp home
	tmpHome, err := os.MkdirTemp("", "skills-test")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpHome)

	os.Setenv("HOME", tmpHome)
	// Windows specific: mock USERPROFILE as well
	if runtime.GOOS == "windows" {
		oldProfile := os.Getenv("USERPROFILE")
		defer os.Setenv("USERPROFILE", oldProfile)
		os.Setenv("USERPROFILE", tmpHome)
	}

	app := &App{testHomeDir: tmpHome}

	// 1. Test ListSkills (Should have 2 default skills)
	skills := app.ListSkills("claude")
	if len(skills) != 2 {
		t.Errorf("Expected 2 default skills, got %d", len(skills))
	}
	if skills[0].Name != "Claude Official Documentation Skill Package" {
		t.Errorf("Expected default skill 1, got %s", skills[0].Name)
	}
	if skills[1].Name != "超能力技能包" {
		t.Errorf("Expected default skill 2, got %s", skills[1].Name)
	}

	// 2. Test AddSkill (Address)
	err = app.AddSkill("TestSkill1", "Description 1", "address", "@test/skill", "claude")
	if err != nil {
		t.Errorf("AddSkill failed: %v", err)
	}

	skills = app.ListSkills("claude")
	if len(skills) != 3 {
		t.Errorf("Expected 3 skills, got %d", len(skills))
	}
	
	// Helper to find skill
	findSkill := func(name string) *Skill {
		for _, s := range skills {
			if s.Name == name {
				return &s
			}
		}
		return nil
	}

	s1 := findSkill("TestSkill1")
	if s1 == nil || s1.Value != "@test/skill" {
		t.Errorf("TestSkill1 not found or wrong value")
	}

	// 3. Test AddSkill (Zip) - requires a dummy zip file
	zipPath := filepath.Join(tmpHome, "test.zip")
	// Create a real zip file
	func() {
		f, _ := os.Create(zipPath)
		defer f.Close()
		w := zip.NewWriter(f)
		defer w.Close()
		
		// Add a directory (required by validation)
		// Validation says: "skill package root must only contain directories"
		// So we add "test-skill/"
		// And it requires SKILL.md inside it
		
		// Create file structure: test-skill/SKILL.md
		file, _ := w.Create("test-skill/SKILL.md")
		file.Write([]byte("Skill Spec"))
	}()

	err = app.AddSkill("TestSkill2", "Description 2", "zip", zipPath, "claude")
	if err != nil {
		t.Errorf("AddSkill (zip) failed: %v", err)
	}

	skills = app.ListSkills("claude")
	if len(skills) != 4 {
		t.Errorf("Expected 4 skills, got %d", len(skills))
	}

	// Verify zip was copied
	skillsDir := app.GetSkillsDir("claude")
	copiedZip := filepath.Join(skillsDir, "test.zip")
	if _, err := os.Stat(copiedZip); os.IsNotExist(err) {
		t.Errorf("Zip file was not copied to %s", copiedZip)
	}

	// 4. Test DeleteSkill
	err = app.DeleteSkill("TestSkill2", "claude")
	if err != nil {
		t.Errorf("DeleteSkill failed: %v", err)
	}

	skills = app.ListSkills("claude")
	if len(skills) != 3 {
		t.Errorf("Expected 3 skills, got %d", len(skills))
	}
	if findSkill("TestSkill2") != nil {
		t.Errorf("TestSkill2 was not deleted")
	}

	// Verify zip was deleted
	if _, err := os.Stat(copiedZip); !os.IsNotExist(err) {
		t.Errorf("Zip file was not deleted")
	}

	// 5. Test Delete Default Skill (Should Fail)
	err = app.DeleteSkill("Claude Official Documentation Skill Package", "claude")
	if err == nil {
		t.Errorf("Expected error when deleting default skill, got nil")
	}
}
