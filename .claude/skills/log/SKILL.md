---
name: log
description: Park a non-phase work item in Docs/WORK.yaml with auto-classified kind. Use when the operator says /log or asks to remember/park something for later.
---

# /log

Utility. Does not implement work.

1. Read `Docs/WORK.yaml`.
2. Classify `kind` (ask once if ambiguous):
   - `fix` — broken/wrong behavior
   - `task` — one-session intentional chore (default for small UI/docs polish)
   - `proposal` — phase-sized / needs `/plan`
   - `research` — options choice
   - `question` — standalone uncertainty with **no** target Work row
   - `audit` — prefer `/audit` instead of `/log`
3. Prefer `task` over `proposal` when one session can finish it.
4. Append row with **next kind-prefixed id** (`F/T/P/R/Q/A-nnn` via `nextWorkId` / max+1 for
   that prefix). Do not rename legacy `W-*`. `status: open`, tags if known,
   `phase: <active PHASE-id>` when mid-phase, `open_questions`/`done_summary`: null.
5. Activity event. Report: *"Logged T-001 (task) — summary."*

Must not: implement; open a phase; invent feature/area specs; log clarifications for an existing
row as a new `question` — append `open_questions` on that row instead.
