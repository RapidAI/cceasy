# Track Plan: Maintenance & Refinement

## Phase 1: Environment & CLI Synchronization [checkpoint: 2477075]
Goal: Ensure the application correctly detects and configures the latest `claude-code` environment.

- [x] Task: Audit environment detection logic for Node.js and `@anthropic-ai/claude-code`. 61b61e4
- [x] Task: Refactor: Unify Node.js version constant across platforms (Target: 22.14.0). 0e8012f
- [x] Task: Implement Feature: Add version check and auto-update logic for `claude-code`. 7681e94
- [x] Task: Update model synchronization to support any new parameters in `claude-code` v0.x. dc32cc6
- [x] Task: Write Tests: Verification of `~/.claude/settings.json` and `.claude.json` updates. 40dce9d
- [x] Task: Implement Feature: Robust file system watchers for configuration changes. c022fe7
- [x] Task: Conductor - User Manual Verification 'Environment & CLI Synchronization' (Protocol in workflow.md)

## Phase 2: UI/UX Refinement (Vibe Coding) [checkpoint: b6ca54b]
Goal: Polishing the multi-project tabbed interface.

- [x] Task: Refine Tabbed Interface CSS/Layout for better visibility and responsiveness. 39ac855
- [ ] Task: Write Tests: Unit tests for project switching logic in `App.tsx`. (Skipped per user request)
- [x] Task: Implement Feature: Improved visual feedback when switching projects or changing working directories. e0fe6b9
- [x] Task: Conductor - User Manual Verification 'UI/UX Refinement (Vibe Coding)' (Protocol in workflow.md)

## Phase 3: Stability & Bug Fixes [checkpoint: 39f35ba]
Goal: Address known issues and improve overall robustness.

- [x] Task: Fix Single Instance Lock issues on Darwin (macOS). 8d343fd
- [x] Task: Improve Tray Menu reliability and responsiveness. eea70c6
- [x] Task: Write Tests: Integration tests for the "Launch Claude Code" trigger. 68af8ba
- [x] Task: Conductor - User Manual Verification 'Stability & Bug Fixes' (Protocol in workflow.md)
