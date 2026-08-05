---
name: launch
description: Launch the local AIdioma learner app after clearing stale app dev servers. Use when the operator says /launch.
---

# /launch

1. Find stale AIdioma learner dev servers (`npm run app:dev` / `next dev` for `apps/web` on
   localhost). Stop only those known app processes—not unrelated user programs.
2. Start `npm run app:dev` from the repo root.
3. Report the local URL and confirm the server is healthy.
4. Do not deploy, change env secrets, or touch production.
