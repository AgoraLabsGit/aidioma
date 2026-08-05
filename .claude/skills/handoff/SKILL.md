---
name: handoff
description: End an AIdioma session inside an active phase by writing continuity for the next agent. Use when the operator says /handoff.
---

# /handoff

1. Read the active phase spec and current Git/runtime state.
2. Overwrite `Docs/Handoffs/HANDOFF.md` with a lean current note: phase, done, not done, branch,
   blockers, exact next command. Keep it short.
3. **Do not** commit, push, open a PR, merge, or delete branches/worktrees.
4. Reminder: mid-phase commits belong to `/run`; phase completion belongs to `/close`.
