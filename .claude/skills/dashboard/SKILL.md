---
name: dashboard
description: Launch the local AIdioma work dashboard after clearing stale dashboard servers. Use when the operator says /dashboard.
---

# /dashboard

1. Find stale `npm run work:dashboard` / `tooling/work-dashboard` servers. Stop only those known
   dashboard processes.
2. Start `npm run work:dashboard` from the repo root (or the active phase worktree root).
3. Report the loopback URL (`http://127.0.0.1:4317`). Local-only — not part of `apps/web`.
4. The dashboard is a read-only projection of live `Docs/` via shared `derive()` (V3). It never
   writes authored docs.
