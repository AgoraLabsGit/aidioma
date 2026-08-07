---
name: task
description: Do intentional small work that is not a defect and not phase-sized; record in WORK.yaml. Use when the operator says /task or implies a small chore now.
---

# /task

0. **Docs home (D-020):** If `.worktrees/docs` exists, write `Docs/**`, `.work/**`,
   `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` only there — never on `phase/*` / `task/*`.
1. Upsert `WORK.yaml` `kind: task`, `status: active` (ids: `T-nnn`; leave legacy `W-*`)
   with `opened: <UTC ISO now>` **before** other edits so Work Open shows the row immediately
   (Docs home + `/dashboard`). Never batch-write `done` without an earlier `active` flush.
2. Load path-owning specs before edits; never invent specs.
3. Blocked on a decision → `open_questions` on **this** row; pause.
4. Smallest coherent change + proof when practical.
5. `status: done` + `done_summary`. Activity. Report id.
6. To publish → operator `/close` (no phase ⇒ reduced close). Do not invent a separate publish ritual.
7. Needs design/multi-session → `/log` `proposal` or confirm `/plan`.

**May invoke:** `/check` before publish; optional `/audit`; `/log` / `/plan` if stretches.  
Prefer a sub-agent when the coordinator should stay on phase outcome. **Keep on coordinator**
when the chore is tiny and context is already loaded.
