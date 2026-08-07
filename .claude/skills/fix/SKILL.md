---
name: fix
description: Reproduce and correct a bounded defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

0. **Docs home (D-020):** If `.worktrees/docs` exists, write `Docs/**`, `.work/**`,
   `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` only there — never on `phase/*` / `task/*`.
1. Upsert `WORK.yaml` `kind: fix`, `status: active` (ids: `F-nnn`; leave legacy `W-*`)
   with `opened: <UTC ISO now>` **before** other edits so Work Open shows the row immediately
   (Docs home + `/dashboard`). Never batch-write `done` without an earlier `active` flush.
2. Reproduce on a real path; load owning specs before edits.
3. Clarifications → `open_questions` on **this** row; pause.
4. Patch + regression/proof when practical.
5. `status: done` + `done_summary`. Activity. Report id.
6. To publish → operator `/close` (no phase ⇒ reduced close). Do not invent a separate publish ritual.
7. If design/multi-session → `/log` `proposal` or confirm `/plan`.

**May invoke:** `/check` before publish; optional `/audit` if high-risk; `/log` / `/plan` if stretches.  
Prefer a sub-agent for bounded fixes. **Keep on coordinator** when the repro/context is already
loaded and the change is tiny.
