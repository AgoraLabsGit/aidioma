---
name: dashboard
description: Launch the local AIdioma work dashboard after clearing stale dashboard servers. Use when the operator says /dashboard.
---

# /dashboard

1. Find stale `npm run work:dashboard` / `tooling/work-dashboard` servers. Stop only those known
   dashboard processes.
2. Start `npm run work:dashboard` from the repo root.
3. Report the loopback URL. Dashboard is local-only developer tooling—not part of `apps/web`.
4. Until PHASE-001 lands, the dashboard may still read legacy `Docs.2` registry shapes; say so if
   validation fails against living `Docs/`.
