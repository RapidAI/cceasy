# Specification: Fix Windows Online Update Download URL

## Overview
The current online update feature on Windows fails to download the actual installer because it doesn't correctly resolve the direct download link for `AICoder-Setup.exe`. Instead, it often downloads the HTML release page. This track fixes the download logic to construct and use the correct direct download URL.

## Functional Requirements
1.  **URL Construction Fix:**
    *   Modify the backend download logic to construct the direct download URL for the `AICoder-Setup.exe` asset.
    *   Format: `https://github.com/RapidAI/aicoder/releases/download/<VERSION>/AICoder-Setup.exe`.
    *   Ensure the `<VERSION>` is correctly extracted from the GitHub API response (using the `tag_name` field).
2.  **Download Validation:**
    *   Validate that the downloaded file is an executable (`.exe`).
    *   Check that the file size is greater than 5MB to ensure it's not a small HTML error page.
    *   Verify the `Content-Type` header is `application/octet-stream` or similar binary format.
3.  **Error Handling & Retry:**
    *   If the download fails or validation fails, display a clear error message in the update modal.
    *   Provide a "Retry" button to allow the user to attempt the download again.

## Non-Functional Requirements
*   **Reliability:** The download process must robustly handle URL construction across different versions.
*   **User Feedback:** Maintain the progress bar and status updates implemented in the previous track.

## Acceptance Criteria
*   [ ] Clicking "Download and Update" on Windows correctly constructs the URL: `https://github.com/RapidAI/aicoder/releases/download/<LATEST_TAG>/AICoder-Setup.exe`.
*   [ ] The downloaded file is verified to be the `AICoder-Setup.exe` installer, not an HTML page.
*   [ ] Failed downloads trigger a detailed error state in the UI with a retry option.
*   [ ] Successful downloads can be launched via the "Install Now" button.

## Out of Scope
*   Adding support for non-EXE assets.
*   Automatic background retries without user interaction.
