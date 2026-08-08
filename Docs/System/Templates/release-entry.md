# RELEASES.md — entry format (SSOT)

Living log: `Docs/RELEASES.md`. This file owns the **entry mold** (D-029).
Append only. One entry per production ship (except disposable MOCK Knowledge fixtures).

```markdown
## RELEASE-nnn — short summary
Date: YYYY-MM-DD
Phase: PHASE-XXX
```

Optional later (not required until first real ship proves the need):

```text
Check: <last green /check ref or commit>
```

| Field | Meaning |
|---|---|
| `RELEASE-nnn` | Monotonic ship id |
| Date | Ship day (UTC date ok) |
| Phase | Phase that produced the shipped outcome, or `—` if none |
| Summary | One line a stranger can skim |

MOCK fixtures may use `RELEASE-000` (or similar) and must say they are disposable.
