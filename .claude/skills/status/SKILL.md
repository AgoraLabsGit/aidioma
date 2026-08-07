---
name: status
description: Report Roadmap, phase, Git, PR, runtime, and next command without making changes. Use when the operator says /status.
---

# /status

1. Read Roadmap, active phase, HANDOFF, git/worktree/runtime (include Docs home tip if present).
2. Refresh `context.json` via `derive()` (prefer Docs home as derive root when present).
3. Report: active/next, branch cleanliness, Docs home path/branch, next command.
4. Make **no** authored-file edits.

**May invoke:** none (derive only).
