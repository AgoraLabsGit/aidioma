---
name: dashboard
description: Launch the local work dashboard after clearing stale dashboard servers for this clone only. Use when the operator says /dashboard.
---

# /dashboard

1. Resolve `primaryWorktreeRoot` (first `git worktree list` entry for this clone).
2. Stop stale dashboard processes whose `server.ts` path is under that primary root
   (including `primary/.worktrees/**`). **Do not** kill other clones’ listeners (D-057).
3. Ensure + refresh Docs home: `npm run work:docs-home` (`.worktrees/docs` on `docs/ssot` — D-020;
   script ff-merges onto `origin/main` when the home is clean).
4. Start dashboard via `npm run work:dashboard` (or `bash tooling/run-dashboard.sh`).
   Launcher resolves **primary** `.worktrees/docs` even from a phase/task cwd — never
   `npx tsx Docs/System/dashboard/server.ts` from a non-Docs-home tree.
   Port selection follows D-057 (SHA-256 preferred in 4317–4336 + bump; `--port` / env pin).
5. Report the **printed** URL from startup logs (`http://127.0.0.1:<port>` — not always 4317)
   and confirm footer branch is `docs/ssot` when Docs home is used (not a phase/task branch).
6. Read-only projection via `derive()`. Never writes authored docs.

**May invoke:** none.  
**Writers:** `Docs/`, `.work/`, `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` → Docs home only.  
Stale Work counts or wrong footer branch ⇒ kill **this clone’s** servers, re-run this skill — do not trust an old tab.
