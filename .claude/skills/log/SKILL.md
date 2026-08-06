---
name: log
description: Park a non-phase work item in Docs/WORK.yaml with auto-classified kind. Use when the operator says /log or asks to remember/park something for later.
---

# /log

Utility. Does not implement work.

1. Read `.work/context.json` and `Docs/WORK.yaml`.
2. Auto-classify `kind`: `fix` | `task` | `proposal` | `research` | `question`. Ask once if ambiguous.
3. Append a row: next `W-nnn`, `status: open`, nullable `feature`/`area` if known, `phase` if spotted mid-phase.
4. Append `.work/activity` event. Report: *"Logged W-0nn (kind)."*
5. Prefer a sub-agent when the coordinator context is heavy; otherwise write directly.

Must not: implement the item, open a phase, or invent a feature/area spec to satisfy tags.
