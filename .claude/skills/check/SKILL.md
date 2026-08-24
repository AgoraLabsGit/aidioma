---
name: check
description: Record a governed Praxis check receipt.
---

# /check

This is the native-chat adapter for canonical action `check.record` (registry version 6).

1. Gather the required action input.
2. Invoke the canonical Praxis action `/check`.
3. If this session is already Claude Code or Codex, do the work here. Do not start the Cursor agent runner. In Codex, type $task — never /task.
4. Show the returned receipt and recovery action if denied.
5. Never edit generated Work, Activity, or handoff projections directly.
