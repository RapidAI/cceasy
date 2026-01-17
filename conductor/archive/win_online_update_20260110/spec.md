# Specification: Windows Online Update Feature

## Overview
Implement a seamless "Online Update" experience for Windows users. This feature replaces the existing "Check Update" link with a process that checks for updates, downloads the latest `AICoder-Setup.exe` to the user's Downloads folder with a progress UI, and facilitates the installation of the new version.

## Functional Requirements
1.  **UI Modification (Windows Only):**
    *   Change the text "检查更新" (Check Update) to "在线更新" (Online Update) in the About section and update-related labels for the Chinese locale on Windows.
2.  **Version Checking:**
    *   Continue using the GitHub API to fetch the latest release information from `RapidAI/aicoder`.
3.  **Download Management:**
    *   If a newer version is available, allow the user to trigger a download of the `AICoder-Setup.exe` asset.
    *   The download should be saved to the user's system "Downloads" folder.
    *   Provide real-time progress feedback in the UI (Progress bar and percentage).
    *   Allow the user to cancel the download at any time.
4.  **Installation & Exit:**
    *   Upon successful download, provide an "Install Now" button.
    *   When "Install Now" is clicked:
        *   Launch the `AICoder-Setup.exe` installer.
        *   The current application must exit immediately to allow the installer to overwrite the application files.

## Non-Functional Requirements
*   **Platform Specificity:** The automated download and install workflow is targeted at Windows.
*   **Stability:** Ensure the download process is robust and handles network interruptions gracefully.
*   **Cleanup:** (Optional) Consider if failed or cancelled downloads should be cleaned up.

## Acceptance Criteria
*   [ ] The label in the About section is changed to "在线更新" on Windows.
*   [ ] Clicking "在线更新" correctly identifies if a new version exists on GitHub.
*   [ ] The update modal shows a "Download and Update" button when an update is found.
*   [ ] The download progress is visible and accurate.
*   [ ] The installer is saved to the Windows Downloads folder.
*   [ ] Clicking "Install Now" launches the installer and closes AICoder.

## Out of Scope
*   Automatic background updates (must be user-initiated).
*   Delta updates (full installer download only).
*   Automatic updates for macOS or Linux (those will retain the current "Download Now" link-based approach).
