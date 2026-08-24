---
name: log
description: Park one governed Praxis task for later.
---

# /log

This is the native-chat adapter for canonical action `log.create` (registry version 6).

1. Gather the required action input.
2. Invoke the canonical Praxis action `/log`.
3. If this session is already Claude Code or Codex, do the work here. Do not start the Cursor agent runner. In Codex, type $task — never /task.
4. Show the returned receipt and recovery action if denied.
5. Never edit generated Work, Activity, or handoff projections directly.
