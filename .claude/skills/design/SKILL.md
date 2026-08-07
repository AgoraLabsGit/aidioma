---
name: design
description: Lock behavior via decisions and/or specs. Use when the operator says /design or behavior is undefined.
---

# /design

0. **Docs home (D-020):** Specs/decisions → `.worktrees/docs` when present (not phase/task trees).
1. **Must precede:** review relevant `Research/R-*`. If options are still open → **`/research` first**.
2. Show decision/spec wording before writing. ≤3 consequential founder decisions per checkpoint.
3. Write `DECISIONS.md` and/or amend/create specs. Never change app behavior silently.
4. **Required Adv:** always via fresh sub-agent (`adv-protocol.md`) before treating the design as
   locked. Founder-facing wording stays on the coordinator.
5. Activity `decide` / `spec`. Report D-id / SPEC-id.

**May invoke:** `/research` (if missing); Adv sub-agent (required for Adv).  
**Must not:** skip Research; silent product code changes (that is `/run` / `/fix`).
