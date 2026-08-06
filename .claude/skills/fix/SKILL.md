---
name: fix
description: Reproduce and correct a bounded AIdioma defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

1. Upsert `Docs/WORK.yaml` `kind: fix` (`status: active`). Log the symptom, not the diagnosis.
2. Reproduce expected versus actual; load path-owning specs before edits.
3. Smallest coherent correction + failing regression when practical; re-prove.
4. Mark row `status: done`. Activity event. Report W-id.
5. If design / multi-session / phase-sized → `/log` as `proposal` or confirm `/plan`. One-way door.

Phase-scoped fixes commit on the phase branch. Unrelated fixes use a short-lived branch and reduced close checks.

Coordinator may delegate implementation to a sub-agent; keep routing and status on the coordinator.
