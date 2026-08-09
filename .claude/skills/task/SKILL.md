---
name: task
description: Do intentional small work that is not a defect and not phase-sized; record in WORK.yaml. Use when the operator says /task or implies a small chore now.
---

# /task

0. **Docs home (D-020):** If `.worktrees/docs` exists, write `Docs/**`, `.work/**`,
   `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` only there — never on `phase/*` /
   `task/*` / `fix/*`.
1. **Desk (D-025):**
   - **Product code** (`apps/`, `packages/`, `content/`, product tests) → dedicated
     `task/t-nnn-*` worktree (create under `.worktrees/` if missing). Do product edits there.
   - **Meta** (Docs/System/Work/decisions/skills/AGENTS) → Docs home only.
   - Ledger + activity always on Docs home.
2. Upsert `WORK.yaml` `kind: task`, `status: active` (ids: `T-nnn`; leave legacy `W-*`)
   with `opened: <UTC ISO now>` **before** other edits so Work Open shows the row immediately
   (Docs home + `/dashboard`). Never batch-write `done` without an earlier `active` flush.
   **Same task vs fresh id:** stay on the current `status: active` task for follow-ups that
   finish or polish *that* outcome (icon tweak, copy, small fix in the same change). Open a
   new `T-nnn` only for a **new outcome** / different intent, or when the prior task is already
   `done`. Do not log implementation steps as separate Work rows.
3. **Path lease (Docs home):** set `context_paths` to paths you will touch. If another
   `status: active` Work row already lists an overlap → wait, `/handoff`, or `/log` — do not edit.
4. Load path-owning specs before edits; never invent specs.
5. Blocked on a decision → `open_questions` on **this** row; pause.
6. Smallest coherent change + proof when practical.
7. `status: done` + `done_summary`. Set `context_paths` to material repo paths that informed
   the task (short list; `null` ok). Activity. Report id.
8. To publish → operator `/close` (no phase ⇒ reduced close). Do not invent a separate publish ritual.
9. Needs design/multi-session → `/log` `proposal` or confirm `/plan`.

**Interim:** While System-building dominates, Docs-home tasks for `Docs/System/**` remain valid;
still use path leases.

**May invoke:** `/check` before publish; optional `/audit`; `/log` / `/plan` if stretches.  
Prefer a sub-agent when the coordinator should stay on phase outcome. **Keep on coordinator**
when the chore is tiny and context is already loaded.
