---
name: handoff
description: End a session inside an active phase by writing continuity for the next agent. Use when the operator says /handoff.
---

# /handoff

0. **Docs home (D-020):** If `.worktrees/docs` exists, overwrite `HANDOFF.md` only there.
1. Resolve **required `ref`:** exactly one of
   - an in-flight phase (`state: active` or `blocked`), or
   - a Work row with `status: active`.
   Prefer the founder-named target; else the sole in-flight phase; else the sole active Work.
   If ambiguous → ask once. Do not write an unscoped handoff.
2. Overwrite `Docs/Handoffs/HANDOFF.md` with YAML frontmatter `ref: <id>` then the body
   (branch/worktree, done, open, preserve, next command).
3. Do **not** commit, PR, merge, or delete branches/worktrees.
4. Activity `type: handoff` (low-noise); include `ref` matching the frontmatter.

**May invoke:** none.
