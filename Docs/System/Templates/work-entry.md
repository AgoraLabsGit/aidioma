# WORK.yaml — entry format

Validated against `System/schemas/work.schema.json`. YAML array.

```yaml
- id: W-031
  kind: fix          # fix | task | proposal | research | question
  summary: "Practice page crashes on empty input"
  status: open       # open | active | done | promoted | dropped
  feature: null      # SPEC-F-* or null
  area: null         # SPEC-A-* or null
  phase: null        # PHASE-nnn or null
  promoted_to: null
  blocked_by: null   # W-nnn or null
  note: null
  opened: 2026-08-06
```

- `/log` → `open`
- `/fix` / `/task` → `active` then `done`
- `/plan` on a proposal → `promoted` + `promoted_to: PHASE-nnn`
