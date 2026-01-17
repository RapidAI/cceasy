# Implementation Plan: Fix Windows Online Update Download URL

## Phase 1: Backend Improvements (Go) [checkpoint: 21f15de]
Refine the update checking and downloading logic to ensure the correct installer asset is targeted and validated.

- [x] **Task 1: Update `UpdateResult` and `CheckUpdate`** (d870d7e)
  - Add `TagName` and `DownloadUrl` fields to the `UpdateResult` struct in `app.go`.
  - In `CheckUpdate`, construct the direct download URL: `https://github.com/RapidAI/aicoder/releases/download/<tag_name>/AICoder-Setup.exe`.
  - Populate the new fields in the return value.
  - *Status:* `[ ]`
- [x] **Task 2: Enhance `DownloadUpdate` with Validation** (787da13)
  - Add logic to check the `Content-Type` header (should be binary/executable, e.g., `application/octet-stream`).
  - Add a minimum file size check (e.g., > 5MB) to ensure it's not an HTML error page.
  - Ensure the file extension is `.exe`.
  - *Status:* `[ ]`
- [x] **Task 3: Update Backend Tests** (21f15de)
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Backend Improvements' (Protocol in workflow.md)** (3307dbf)

## Phase 2: Frontend UI Refinement (React/TS) [checkpoint: 75a443c]
Update the UI to use the direct download URL and provide better error recovery options.

- [x] **Task 1: Update `handleDownload` to use `DownloadUrl`** (bbf56d4)
  - Modify `handleDownload` in `App.tsx` to use `updateResult.download_url` instead of `release_url`.
  - *Status:* `[ ]`
- [x] **Task 2: Improve Error UI and Add Retry Button** (75a443c)
- [x] **Task: Conductor - User Manual Verification 'Phase 2: Frontend UI Refinement' (Protocol in workflow.md)** (75a443c)

## Phase 3: Integration and Final Verification [checkpoint: 0d65aed]
- [x] **Task 1: End-to-End Verification on Windows** (Manual Verification Required)
- [x] **Task: Conductor - User Manual Verification 'Phase 3: Integration' (Protocol in workflow.md)** (Completed)
