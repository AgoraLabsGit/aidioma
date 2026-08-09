---
name: research
description: Choose among external options; write Research/R-*.md and optional decision. Use when the operator says /research or options block progress.
---

# /research

0. **Docs home (D-020):** Write `Research/` + decisions + Work only in `.worktrees/docs` when present.
1. Upsert `WORK.yaml` `kind: research`, `status: active` (ids: `R-nnn` Work id; file stays
   `Research/R-nnn.md`) with `opened: <UTC ISO now>` before other research edits.
2. Name the question and ≥2 real options.
3. Write `Docs/Research/R-nnn.md` from the template (verdict required).
4. **Required Adv:** always via fresh sub-agent (`adv-protocol.md`). Drafting/verdict prose may stay
   on the coordinator; revise or record blockers.
5. Optional: append decision to `DECISIONS.md` when the verdict locks a choice.
6. Work → `done` + `done_summary`. Activity `type: research`. Report R-id.

**May invoke:** Adv sub-agent (required for Adv); optional `/design` if the verdict locks behavior.  
**Must not:** commit product/app code; end without a verdict (`none` is valid).
