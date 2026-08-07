---
name: task
description: Do intentional small AIdioma work that is not a defect and not phase-sized; record in WORK.yaml. Use when the operator says /task or implies a small chore now.
---

# /task

Action. Intentional small work (not `/fix`, not a proposal).

1. Upsert `WORK.yaml` `kind: task`, `status: active` (new ids: `T-nnn`; leave legacy `W-*`).
2. Load path-owning specs before edits; never invent specs.
3. If blocked on a decision — ask founder; append `open_questions` on **this** row; pause.
4. Smallest coherent change + proof when practical.
5. `status: done` + `done_summary` (what changed + evidence). Activity event. Report W-id.
6. If it needs design or multi-session scope → `/log` as `proposal` or confirm `/plan`.

Unrelated to active phase → short-lived branch + reduced publish checks (same as `/fix`).
Prefer a sub-agent when the job is bounded and the coordinator should stay on phase outcome.
