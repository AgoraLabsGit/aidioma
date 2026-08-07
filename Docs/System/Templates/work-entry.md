# WORK.yaml — entry format

Validated against `System/schemas/work.schema.json`. YAML array.

```yaml
- id: T-001                 # New: F|T|P|R|Q|A|S-nnn by kind (S=design). Legacy W-nnn still valid.
  kind: task                 # fix | task | proposal | research | question | audit | design
  summary: "Practice page crashes on empty input"
  status: open               # open | active | done | promoted | dropped
  feature: null              # SPEC-F-* or null
  area: null                 # SPEC-A-* or null
  phase: null                # PHASE-nnn or null
  promoted_to: null
  blocked_by: null           # work id or null
  note: null                 # Brief (authored intent)
  context_paths: null        # Context — material paths at done (D-024); not a tool-read log
  open_questions: null
  done_summary: null
  opened: 2026-08-07T20:00:00Z   # prefer UTC ISO; legacy YYYY-MM-DD still ok
```

| Kind | New id prefix |
|---|---|
| fix | `F-` |
| task | `T-` |
| proposal | `P-` |
| research | `R-` |
| question | `Q-` |
| audit | `A-` |
| design | `S-` |

- Next id: `nextWorkId(kind, existingIds)` — max for that prefix + 1. Do **not** rename legacy `W-*`.
- `/log` → `open`
- `/fix` / `/task` / `/audit` / `/design` → `active` then `done` (+ `done_summary`)
- At **done**, set `context_paths` to material repo paths that informed the work (short list; omit/`null` ok)
- Clarifications → `open_questions` on **that** row
- `/plan` on a proposal → `promoted` + `promoted_to: PHASE-nnn`
