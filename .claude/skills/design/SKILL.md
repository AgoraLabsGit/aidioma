---
name: design
description: Lock behavior via decisions and/or specs; record Work kind design + done_summary. Use when the operator says /design or behavior is undefined.
---

# /design

0. **Docs home (D-020):** Specs/decisions/Work → `.worktrees/docs` when present (not phase/task trees).
1. Upsert `WORK.yaml` `kind: design`, `status: active` (ids: `S-nnn`; **not** `D-*` — decisions
   keep `D-nnn`) with `opened: <UTC ISO now>` **before** other edits so Work Open shows the row.
   Also append activity `type: design`, `status: active`, `ref: S-nnn`. Never batch-write `done`
   without an earlier `active` flush.
2. **Must precede:** review relevant `Research/R-*`. If options are still open → **`/research` first**.
3. Show decision/spec wording before writing. ≤3 consequential founder decisions per checkpoint.
4. Write `DECISIONS.md` and/or amend/create specs. Never change app behavior silently.
5. **Required Adv:** always via fresh sub-agent (`adv-protocol.md`) before treating the design as
   locked. Founder-facing wording stays on the coordinator.
6. Work → `done` + `done_summary` (+ `context_paths` material paths when known; `null` ok)
   or leave `active` + `open_questions` if Adv-blocked. Activity close: `decide`/`spec` complete
   with `ref: D-/SPEC-` when locked; else `design` complete/blocked with `ref: S-nnn`.
   Report S-id + D-id / SPEC-id.

**May invoke:** `/research` (if missing); Adv sub-agent (required for Adv).  
**Must not:** skip Research; silent product code changes (that is `/run` / `/fix`); skip Work/activity
active flush; use `D-nnn` as a Work id.
