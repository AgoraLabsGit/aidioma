---
id: PHASE-000
title: <short outcome-shaped title>
type: build          # design | build
proof_kind: visual            # test | visual | terminal | state | spec
state: proposed               # proposed | ready | active | closed | blocked | canceled
order: 0
depends_on: []                # [PHASE-005] — phases that must close first
from_backlog: null            # historical imported id only; do not read or write frozen WORK.yaml
owner: founder
outcome: "<one sentence. Observable. A person could confirm it is true.>"
proof: "<the specific artifact that will demonstrate it>"
non_goals: []
amends_specs: []              # contracts this phase changes (write intent)
feature: null                 # SPEC-F-* org tag, or null
area: null                    # SPEC-A-* org tag, or null
context_paths: null           # optional — material paths (D-024); not a tool-read log
opened: YYYY-MM-DD
closed: null
lessons: null                 # at close use a non-empty JSON double-quoted string, e.g. "None — <reason>"
---

<!-- Validated against System/schemas/phase.schema.json in CI.
     No extra frontmatter keys — additionalProperties is false.
     type: design forces proof_kind: spec.
     state: canceled requires lessons. state: closed requires closed date.
     ids: PHASE-000, SPEC-F-*/SPEC-A-*, D-000, R-000 -->

# PHASE-000 — <title>

Create `Docs/Evidence/phase-000/target.json` at planning time. It owns `version`, phase id, kind
`phase`, evidence directory, integer risk tier 1–3, this authority path, canonical required lenses,
and exact canonically sorted candidate scopes. The JSON risk tier must match the selection below.
Include both files in those scopes; do not duplicate outcome/proof/non-goals in the target JSON.

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

## Audit

Filled at `/plan` from `Docs/CLOSE.md`. Every skip needs a concrete `n/a` reason. Add focused
path-triggered lenses when relevant. Phases cannot use Tier 0. First set `**Risk tier:** <1 | 2 | 3>`, then copy the exact
agent allocation from that tier. A shared agent name means one auditor may inspect both lenses but
must return a separate verdict for each row.

**Risk tier:** <1 | 2 | 3>

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Claims / Proof evidence | yes | every phase | <tier assignment> |
| Code quality / Standards | yes | every nonzero phase tier | <tier assignment> |
| MCOO | yes | every phase | <tier assignment> |
| Seams / Integration | yes / n/a | Tier 2–3 or changed boundary / Tier 1 with no boundary change | <tier assignment / —> |
| Security / Privacy | yes / n/a | Tier 3 or changed trust/data boundary / Tier 1–2 with no trust or personal-data surface | <separate agent when triggered / —> |
| API / Provider usage | yes / n/a | provider touched or claimed / no external API surface | <separate agent when triggered / —> |
| Product / Learner journey | yes / n/a | Tier 2–3 or learner behavior changed / Tier 1 with no learner-visible change | <tier assignment / —> |

`Docs/Evidence/<phase>/close-audits.md` is the compact index. Complete responses live once under
`audits/`; ordered selection lives in `audit-results.json`; replayable deterministic check proof and
every attempt's retained candidate manifest plus last-attempt selection live under `checks/` and in
`check-results.json`. The target contract declares exact ordered `check_commands`, permitted
`check_environment` names, and `check_timeout_ms`. Do not mutate this
candidate authority after audit.

## Close record

The immutable final decision lives in `Docs/Evidence/<phase>/close-record.json`; publication results
later live in `Docs/Evidence/<phase>/publication.md`. At close, change only frontmatter `state`,
`closed`, and `lessons` in this file.

## Coordination

The `/run` agent is the coordinator for this phase. Delegate coding by area of concern to
in-session sub-agents so you preserve your context window. Follow `.claude/skills/run/SKILL.md`.
Do not implement the phase yourself and do not start another runner.

## Kickoff

Paste-ready for a fresh session. Keep it to what an agent needs and nothing more.

```text
/run PHASE-000

Act as the coordinator for this phase. Delegate coding by area of concern to in-session sub-agents so you preserve your context window. Do not start another runner.

Read AGENTS.md, local Docs/NOW.md when present, this phase file, and its target JSON. <one line of phase-specific orientation.>
```
