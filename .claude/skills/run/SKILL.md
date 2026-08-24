---
name: run
description: Run the one active governed phase.
---

# /run

This is the native-chat adapter for canonical action `run.phase` (registry version 6).

1. Gather the required action input.
2. Invoke the canonical Praxis action `/run`.
3. If this session is already Claude Code or Codex, do the work here. Do not start the Cursor agent runner. In Codex, type $task — never /task.
4. Show the returned receipt and recovery action if denied.
5. Never edit generated Work, Activity, or handoff projections directly.
