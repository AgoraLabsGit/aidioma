---
name: dashboard
description: Launch the local work dashboard after clearing stale dashboard servers. Use when the operator says /dashboard.
---

# /dashboard

1. Stop stale `npm run work:dashboard` / dashboard server processes only.
2. Ensure + refresh Docs home: `npm run work:docs-home` (`.worktrees/docs` on `docs/ssot` — D-020;
   script ff-merges onto `origin/main` when the home is clean).
3. Start dashboard via `npm run work:dashboard` (or `bash tooling/run-dashboard.sh` from
   primary — runs Docs-home `server.ts` when `.worktrees/docs` exists so UI+data match).
4. Report `http://127.0.0.1:4317` and confirm footer branch is `docs/ssot` (not a phase/task branch).
5. Read-only projection via `derive()`. Never writes authored docs.

**May invoke:** none.  
**Writers:** `Docs/`, `.work/`, `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` → Docs home only.  
Stale Work counts or wrong footer branch ⇒ kill servers, re-run this skill — do not trust an old tab.
