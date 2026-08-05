---
id: PHASE-000
title: <short outcome-shaped title>
type: implementation          # design | implementation
proof_kind: visual            # test | visual | terminal | state | spec
state: proposed               # proposed | ready | active | closed | blocked | abandoned
order: 0
depends_on: []                # [PHASE-005] — phases that must close first
from_backlog: null            # backlog id, if promoted
owner: founder
outcome: "<one sentence. Observable. A person could confirm it is true.>"
proof: "<the specific artifact that will demonstrate it>"
non_goals: []
amends_specs: []
opened: YYYY-MM-DD
closed: null
lessons: null                 # required when state: abandoned
---

<!-- Validated against System/schemas/phase.schema.json in CI.
     No extra frontmatter keys — additionalProperties is false.
     type: design forces proof_kind: spec.
     state: abandoned requires lessons. state: closed requires closed date.
     ids: PHASE-000, SPEC-F-*/SPEC-A-*, D-000, R-000 -->

# PHASE-000 — <title>

## Context

Why now, in two or three sentences. What makes this the next thing.

## Inputs

- Decisions this depends on: D-XXX
- Research consulted: R-XXX
- Specs this touches: SPEC-F-XXX

Leave empty if none. Do not preload frozen legacy — mine it only after outcome and non-goals are
set, and only relevant slices.

## Plan

The approach at gist level. Not a task list — the shape of the work.

**Complexity cost:** what this adds that did not exist before. If nothing consumes it yet, cut it.

## Proof

What will be captured, and where it will live.

- [ ] <evidence item>
- [ ] <evidence item>

## Close record

Filled at `/close`. Leave empty until then.

- Result: PASS / WARN / FAIL
- Specs amended:
- Journal line: <one sentence from the handoff — what this phase was actually like>

## Kickoff

Paste-ready for a fresh session. Keep it to what an agent needs and nothing more.

```text
/run PHASE-000

Read .work/context.json. <one line of orientation specific to this phase.>
```
