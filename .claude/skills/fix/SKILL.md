---
name: fix
description: Reproduce and correct a bounded defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

0. **Docs home (D-020):** If `.worktrees/docs` exists, write `Docs/**`, `.work/**`,
   `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` only there — never on `phase/*` /
   `task/*` / `fix/*`.
1. **Desk (D-025):**
   - **Product code** (`apps/`, `packages/`, `content/`, product tests) → dedicated
     `fix/f-nnn-*` worktree (create under `.worktrees/` if missing). Do product edits there.
   - **Meta** (Docs/System/Work/decisions/skills/AGENTS) → Docs home only.
   - Ledger + activity always on Docs home.
2. Upsert `WORK.yaml` `kind: fix`, `status: active` (ids: `F-nnn`; leave legacy `W-*`)
   with `opened: <UTC ISO now>` **before** other edits so Work Open shows the row immediately
   (Docs home + `/dashboard`). Never batch-write `done` without an earlier `active` flush.
3. **Path lease (Docs home):** set `context_paths` to paths you will touch. If another
   `status: active` Work row already lists an overlap → wait, `/handoff`, or `/log` — do not edit.
4. Reproduce on a real path; load owning specs before edits.
5. Clarifications → `open_questions` on **this** row; pause.
6. Patch + regression/proof when practical.
7. `status: done` + `done_summary`. Set `context_paths` to material repo paths that informed
   the fix (short list; `null` ok). Activity. Report id.
8. To publish → operator `/close` (no phase ⇒ reduced close). Do not invent a separate publish ritual.
9. If design/multi-session → `/log` `proposal` or confirm `/plan`.

**Interim:** While System-building dominates, Docs-home fixes for `Docs/System/**` remain valid;
still use path leases.

**May invoke:** `/check` before publish; optional `/audit` if high-risk; `/log` / `/plan` if stretches.  
Prefer a sub-agent for bounded fixes. **Keep on coordinator** when the repro/context is already
loaded and the change is tiny.
