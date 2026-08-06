---
name: triage
description: Sort open Docs/WORK.yaml rows — propose do/plan/drop/leave and apply after founder confirm. Use when the operator says /triage.
---

# /triage

Utility. Sort the queue; do not implement product changes.

1. Read open/active rows in `Docs/WORK.yaml` (batch top ~5–10).
2. For each, propose: **do** (`/fix`/`/task`/`/research`) | **plan** (proposal → `/plan`) | **drop** | **leave**.
3. Confirm with founder (≤3 consequential calls if many).
4. Apply status updates only (`dropped`, leave `open`, note ready-for-do in summary to founder).
5. Activity event. Report ids touched.

May use a sub-agent to draft the batch; coordinator presents and applies.
