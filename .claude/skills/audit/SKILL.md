---
name: audit
description: Run a scoped review of a feature, area, spec, agent-context, or process; record Work kind audit + done_summary. Use when the operator says /audit.
---

# /audit

Scoped review — **not** the `/close` merge gate.

0. **Docs home (D-020):** If `.worktrees/docs` exists, write `Docs/**`, `.work/**`,
   `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` only there — never on `phase/*` / `task/*`.
1. Upsert `WORK.yaml` `kind: audit`, `status: active` (ids: `A-nnn`) with `opened: <UTC ISO now>`
   **before** the review so Work Open shows the row immediately (Docs home + `/dashboard`).
   Never batch-write `done` without an earlier `active` flush.
2. Ask once if needed: best lens? Offer: Proof · Scope · Publish · Adv claims · MCOO · seams · security · agent-context · classifier/routing · schema drift.
3. Clarifications → `open_questions` on this row.
4. Run review via **sub-agent** (fresh context). Coordinator only if scope is already fully
   loaded and trivial. Findings → `done_summary`.
5. `status: done`. Activity `type: audit`. Report id.

**May invoke:** review sub-agent (default).  
**Must not:** merge to main; replace `/close`; write application code unless founder asked for fixes (then `/fix`/`/task`).
