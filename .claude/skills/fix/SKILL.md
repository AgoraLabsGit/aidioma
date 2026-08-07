---
name: fix
description: Reproduce and correct a bounded defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

1. Upsert `WORK.yaml` `kind: fix`, `status: active` (ids: `F-nnn`; leave legacy `W-*`).
2. Reproduce on a real path; load owning specs before edits.
3. Clarifications → `open_questions` on **this** row; pause.
4. Patch + regression/proof when practical.
5. Before standalone publish → `/check` (path-aware). Then `Docs/System/protocols/reduced-close.md` (Proof/Scope/Publish mini).
6. `status: done` + `done_summary`. Activity. Report id.
7. If design/multi-session → `/log` `proposal` or confirm `/plan`.

**May invoke:** `/check` before publish; optional `/audit` if high-risk; `/log` / `/plan` if stretches.  
Prefer a sub-agent for bounded fixes.
