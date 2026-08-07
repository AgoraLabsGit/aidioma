# WORK.yaml — entry format

Validated against `System/schemas/work.schema.json`. YAML array.

```yaml
- id: T-001                 # New: F|T|P|R|Q|A-nnn by kind. Legacy W-nnn still valid.
  kind: task                 # fix | task | proposal | research | question | audit
  summary: "Practice page crashes on empty input"
  status: open               # open | active | done | promoted | dropped
  feature: null              # SPEC-F-* or null
  area: null                 # SPEC-A-* or null
  phase: null                # PHASE-nnn or null
  promoted_to: null
  blocked_by: null           # work id or null
  note: null
  open_questions: null
  done_summary: null
  opened: 2026-08-07
```

| Kind | New id prefix |
|---|---|
| fix | `F-` |
| task | `T-` |
| proposal | `P-` |
| research | `R-` |
| question | `Q-` |
| audit | `A-` |

- Next id: `nextWorkId(kind, existingIds)` — max for that prefix + 1. Do **not** rename legacy `W-*`.
- `/log` → `open`
- `/fix` / `/task` / `/audit` → `active` then `done` (+ `done_summary`)
- Clarifications → `open_questions` on **that** row
- `/plan` on a proposal → `promoted` + `promoted_to: PHASE-nnn`
