---
description: Place governed work as a task, new phase, or into the active phase.
---

# /plan

This is the native-chat adapter for canonical action `plan.place` (registry version 6).

1. Gather the required action input.
2. Invoke the canonical Praxis action `/plan`.
3. If this session is already Claude Code or Codex, do the work here. Do not start the Cursor agent runner. In Codex, type $task — never /task.
4. Show the returned receipt and recovery action if denied.
5. Never edit generated Work, Activity, or handoff projections directly.
