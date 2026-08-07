---
name: design
description: Lock behavior via decisions and/or specs. Use when the operator says /design or behavior is undefined.
---

# /design

0. **Docs home (D-020):** Specs/decisions → `.worktrees/docs` when present (not phase/task trees).
1. **Activity flush first:** append `.work/activity/YYYY-MM.jsonl` immediately —
   `type: design`, `cmd: /design`, `status: active`, ISO `ts`, short summary of intent
   (`ref` null until a D-/SPEC- id exists). Dashboard Activity must show in-flight design.
   Never wait for a written decision/spec. No Work ledger row (decisions/specs are the home).
2. **Must precede:** review relevant `Research/R-*`. If options are still open → **`/research` first**.
3. Show decision/spec wording before writing. ≤3 consequential founder decisions per checkpoint.
4. Write `DECISIONS.md` and/or amend/create specs. Never change app behavior silently.
5. **Required Adv:** always via fresh sub-agent (`adv-protocol.md`) before treating the design as
   locked. Founder-facing wording stays on the coordinator.
6. **Activity close:** on lock append `decide` and/or `spec` (`status: complete`, `ref: D-/SPEC-`);
   on abandon / Adv-blocked stop append `type: design`, `status: complete` (or `blocked`) with
   why — so the start event is not the only trail. Report D-id / SPEC-id when locked.

**May invoke:** `/research` (if missing); Adv sub-agent (required for Adv).  
**Must not:** skip Research; silent product code changes (that is `/run` / `/fix`); skip the
activity active flush.
