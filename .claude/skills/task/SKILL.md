---
name: task
description: Do intentional small AIdioma work that is not a defect and not phase-sized; record in WORK.yaml. Use when the operator says /task or implies a small chore now.
---

# /task

Action. Intentional small work (not `/fix`, not a proposal).

1. Upsert `WORK.yaml` `kind: task`, `status: active`.
2. Load path-owning specs before edits; never invent specs.
3. Smallest coherent change + proof when practical.
4. Mark `status: done`. Activity event. Report W-id.
5. If it needs design or multi-session scope → `/log` as `proposal` or confirm `/plan`. Escalate; do not stretch.

Unrelated to active phase → short-lived branch + reduced publish checks (same as `/fix`).
Prefer a sub-agent when the job is bounded and the coordinator should stay on phase outcome.
