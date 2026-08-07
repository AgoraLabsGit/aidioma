---
name: dashboard
description: Launch the local work dashboard after clearing stale dashboard servers. Use when the operator says /dashboard.
---

# /dashboard

1. Stop stale `npm run work:dashboard` / dashboard server processes only.
2. Start from the **Docs SSOT home** when present (D-020). Until P-001 ships that, primary+overlay (D-018 interim). Prefer the tree with the latest dashboard/derive code during a System phase.
3. Report `http://127.0.0.1:4317`. Local-only.
4. Read-only projection via `derive()`. Never writes authored docs.

**May invoke:** none.
