---
name: triage
description: Classify and execute open Docs/WORK.yaml rows by phase/area/feature — auto-do clear fixes/tasks via sub-agents; confirm drop/plan. Use when the operator says /triage.
---

# /triage

Utility that **does work**. Filters: `PHASE-nnn` · area · feature (e.g. `/triage PHASE-005`, `/triage Devsystem`).

## Phase-scoped default

If a phase is **active** in this chat (or `/triage` names a phase id):

1. **Spawn a sub-agent** whose sole job is open/active Work with `phase: <that PHASE-id>` — nothing else.
2. Coordinator does **not** scan the whole ledger in-process for that pass.
3. Sub-agent returns: do / blocked / plan / drop / leave per row (`W-nnn — summary`), then executes clear `/fix`/`/task` (or reports blockers).
4. Coordinator applies ledger updates, asks founder only for drop/plan/lifecycle.

Unscoped `/triage` with **no** active phase → filter optional area/feature, else top open batch (still prefer a sub-agent for the batch).

## Steps

1. Resolve filter: explicit arg → else active phase id → else area/feature if given → else general batch.
2. Load matching open/active rows from `Docs/WORK.yaml`.
3. Classify: **do** | **blocked** | **plan** | **drop** | **leave**. Cite `W-nnn — summary`.
4. Auto-execute clear `/fix`/`/task` via sub-agents; set `done_summary`.
5. Confirm drop / `/plan` / lifecycle. ≤3 consequential calls.
6. Clarifications → `open_questions` on **that** row (never a new `question` row).
7. Activity event. Report ids done / blocked / left / empty.

Must not: pull in Work with a different `phase` (or `phase: null`) during a phase-scoped pass; expand into unplanned phases; skip confirm on drop/plan.
