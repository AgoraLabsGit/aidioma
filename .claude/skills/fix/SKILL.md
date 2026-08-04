---
name: fix
description: Reproduce and correct a bounded AIdioma defect with regression and real-path proof. Use when the operator says /fix or reports a small broken behavior.
---

# /fix

Read `AGENTS.md` and current memory files. Create/update one `FIXES.yaml` record, reproduce expected
versus actual behavior, identify root cause, add a failing regression test when practical, implement
the smallest coherent correction, and re-prove the same path. Update a spec only if its accepted
contract changes. If product design, architecture, coordinated scopes, or multiple sessions are
required, promote the issue to `WORK.yaml`, route it through `/plan`, and do not patch around it.
Use `/close` for publication and cleanup.
