---
name: task
description: Do intentional small work that is not a defect and not phase-sized; record in WORK.yaml. Use when the operator says /task or implies a small chore now.
---

# /task

1. Upsert `WORK.yaml` `kind: task`, `status: active` (ids: `T-nnn`; leave legacy `W-*`).
2. Load path-owning specs before edits; never invent specs.
3. Blocked on a decision → `open_questions` on **this** row; pause.
4. Smallest coherent change + proof when practical.
5. Before standalone publish → `/check`. Then `Docs/System/protocols/reduced-close.md` if publishing.
6. `status: done` + `done_summary`. Activity. Report id.
7. Needs design/multi-session → `/log` `proposal` or confirm `/plan`.

**May invoke:** `/check` before publish; optional `/audit`; `/log` / `/plan` if stretches.  
Prefer a sub-agent when the coordinator should stay on phase outcome.
