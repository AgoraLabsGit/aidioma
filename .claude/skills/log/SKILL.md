---
name: log
description: Add unscheduled work to the live AIdioma work register.
---

# /log

Add one `open` entry to `Docs/WORK.yaml`. Choose the correct kind and next kind-specific ID; do not
put backlog prose in `Docs/NOW.md`.

Preferred terminal form:

```bash
npm run docs:work -- log <task|fix|proposal|research|question|audit|design> "<summary>"
```

Add `feature`, `area`, `phase`, `note`, or blockers when known. Run `npm run docs:check`.
