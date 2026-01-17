# Implementation Plan: Windows Online Update Feature

## Phase 1: Backend Implementation (Go) [checkpoint: 106eb4d]
This phase focuses on adding the necessary logic to handle file downloading with progress and launching the installer on Windows.

- [x] **Task 1: Implement `GetDownloadsFolder`** (c7c63fc)
  - Define a helper function to retrieve the user's "Downloads" folder path using Windows shell APIs or environment variables.
  - *Status:* `[ ]`
- [x] **Task 2: Implement `DownloadUpdate` with Progress Tracking** (106eb4d)
- [x] **Task 3: Implement `LaunchInstallerAndExit`** (106eb4d)
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Backend' (Protocol in workflow.md)** (106eb4d)


## Phase 2: Frontend Implementation (React/TS) [checkpoint: 1ee0b30]
This phase updates the UI to reflect the new update workflow on Windows.

- [x] **Task 1: Update I18n Labels** (e6a4836)
  - Change "检查更新" to "在线更新" for Windows in `frontend/src/App.tsx`.
  - Add new strings for "Downloading...", "Download Cancelled", "Install Now", etc.
  - *Status:* `[ ]`
- [x] **Task 2: Enhance `UpdateModal` with Download State** (1ee0b30)
- [x] **Task 3: Connect Frontend to Backend Update Logic** (1ee0b30)
- [x] **Task: Conductor - User Manual Verification 'Phase 2: Frontend' (Protocol in workflow.md)** (1ee0b30)

## Phase 3: Final Integration and Verification [checkpoint: 91dc5ca]
- [x] **Task 1: End-to-End Test on Windows** (Manual Verification)
- [x] **Task: Conductor - User Manual Verification 'Phase 3: Final Integration' (Protocol in workflow.md)** (Completed)
  - *Status:* `[ ]`
