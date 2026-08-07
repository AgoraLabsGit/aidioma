---
name: dashboard
description: Launch the local work dashboard after clearing stale dashboard servers. Use when the operator says /dashboard.
---

# /dashboard

1. Stop stale `npm run work:dashboard` / dashboard server processes only.
2. Ensure Docs home: `npm run work:docs-home` (`.worktrees/docs` on `docs/ssot` — D-020).
3. Start `npm run work:dashboard`. Server roots at Docs home when present; else D-018 interim.
4. Report `http://127.0.0.1:4317`. Local-only.
5. Read-only projection via `derive()`. Never writes authored docs.

**May invoke:** none.  
**Writers:** `Docs/`, `.work/`, `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` → Docs home only.
