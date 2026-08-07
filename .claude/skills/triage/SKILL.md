---
name: triage
description: Classify and execute open Docs/WORK.yaml rows by phase/area/feature — auto-do clear fixes/tasks via sub-agents; confirm drop/plan. Use when the operator says /triage.
---

# /triage

Utility that **does work**. Prefer a **sub-agent** for the batch (preserve coordinator context).

## Mode (implicit)

| Context | Scope |
|---|---|
| Inside `/run` / phase active | That phase’s Work only — no typed PHASE id required |
| Explicit `/triage PHASE-nnn` | That phase only |
| No active phase | Unassigned (`phase: null`) ± area/feature filter |

## Steps

1. Resolve mode → load matching open/active rows.
2. Classify: **do** | **blocked** | **plan** | **drop** | **leave**. Cite `W-nnn — summary`.
3. Auto-execute clear `/fix`/`/task` via sub-agents; `done_summary`.
4. Confirm drop / `/plan` / lifecycle. Clarifications → `open_questions` on that row.
5. **Unassigned batch finished with material changes** → `/check`; `/audit` if big/risky.
6. Activity event. Report ids.

**May invoke:** `/fix`, `/task`; after unassigned batch → `/check`, optional `/audit`.  
**Must not:** mix other phases or `phase: null` into a phase-scoped pass.
