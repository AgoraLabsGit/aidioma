---
name: fix
description: Reproduce and correct a bounded AIdioma defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

Action. Bounded defect → Work `kind: fix`.

1. Upsert `WORK.yaml` `kind: fix`, `status: active` (new ids: `F-nnn`; leave legacy `W-*`).
2. Reproduce on a real path; load owning specs before edits.
3. If clarification needed — ask; append `open_questions` on **this** row; pause.
4. Patch + regression/proof when practical.
5. `status: done` + `done_summary`. Activity event. Report W-id.
6. If design/multi-session — stop; `/log` `proposal` or confirm `/plan`.

Standalone publish uses reduced Proof/Scope/Publish checks. Prefer a sub-agent for bounded fixes.
