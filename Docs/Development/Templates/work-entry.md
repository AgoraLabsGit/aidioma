# Work entry

`Docs/WORK.yaml` is a YAML array. Use `/log` or `npm run docs:work -- log ...` so IDs remain unique.

```yaml
- id: T-014
  kind: task                 # task | fix | proposal | research | question | audit | design
  summary: Short observable need
  status: open               # open | active | done | promoted | dropped
  target: null               # required repository path when status is active
  feature: null              # SPEC-F-* or null
  area: null                 # SPEC-A-* or null
  phase: null                # PHASE-nnn or null
  promoted_to: null
  blocked_by: null           # work ID, phase ID, or null
  note: null
  context_paths: null
  open_questions: null
  done_summary: null
  opened: YYYY-MM-DD
```

Prefixes are `F` fix, `T` task, `P` proposal, `R` research, `Q` question, `A` audit, and `S`
design. Never reuse an ID removed from the current register; choose the next number visible in Git
history or the current file.

Promoted work also requires a concrete `promoted_to` owner. Do not use a promoted or umbrella row
as a substitute for the smaller active learner journeys it created.
