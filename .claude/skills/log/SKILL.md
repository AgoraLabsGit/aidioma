---
name: log
description: Park a non-phase work item in Docs/WORK.yaml with auto-classified kind. Use when the operator says /log or asks to remember/park something for later.
---

# /log

0. **Docs home (D-020):** If `.worktrees/docs` exists, append `WORK.yaml` / activity only there.
1. Classify kind: fix | task | proposal | research | question | audit | design (`S-nnn`).
2. Append `WORK.yaml` row `status: open` (new ids by kind prefix).
3. Do **not** implement.
4. Activity. Report id + kind + summary.

**May invoke:** none. (Promotion later via `/plan` / `/triage`.)
