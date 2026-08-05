---
name: fix
description: Reproduce and correct a bounded AIdioma defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

Read `AGENTS.md` and current Docs memory. Create/update one `Docs/FIXES.yaml` record when that file
exists (otherwise record in handoff + Backlog note). Reproduce expected versus actual, find root
cause, add a failing regression when practical, implement the smallest coherent correction, and
re-prove the path.

If product design, architecture, coordinated scopes, or multiple sessions are required, promote via
`/plan` as a phase—do not stretch `/fix`. Use `/close` only when the fix is the active phase scope
or Mike directs a fix-phase close.
