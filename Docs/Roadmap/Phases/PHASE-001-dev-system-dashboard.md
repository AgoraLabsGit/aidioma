---
id: PHASE-001
title: Dev System Dashboard
type: implementation
proof_kind: visual
state: active
order: 1
depends_on:
  - PHASE-000
from_backlog: null
owner: founder
outcome: "Mike can see phases, activity, knowledge, and issues in a local dashboard without parsing Docs by hand."
proof: "Running /dashboard against live Docs/ showing Now + Roadmap at minimum; acceptance checks in Dashboard-spec."
non_goals:
  - Target product decisions
  - Component architecture
  - Lexicon product publish
  - Production hosting of the dashboard
  - Two-way command execution from the UI
amends_specs: []
opened: 2026-08-05
closed: null
lessons: null
---

# PHASE-001 — Dev System Dashboard

## Context

Disconnection from hard-to-read docs was a founder failure mode. V3 is approved; the readable
control surface is the next proof the system is usable.

## Inputs

- `Docs/System/system.md` (approved V3)
- `Docs/System/Dashboard-spec.md`
- `Docs/System/COMMANDS.md`, schemas, templates
- `Docs/System/dashboard` and `Docs/System/derive`
- Frozen `Docs.2/` as evidence only (farm after outcome/non-goals if needed)

## Plan

Adapt the local work dashboard to project V3 Docs via shared `derive()`. Ship build-order steps
1–4 from Dashboard-spec first (indexer/projection, shell, Now, Roadmap). Issues/slow cycle when
specs carry `paths`.

**Complexity cost:** local projection UI + parsers. No learner-app coupling. No DB.

## Proof

- [x] `/dashboard` launches; stale servers cleared
- [x] Now shows next phase / next command from live phase frontmatter
- [x] Roadmap lists phases ordered by `order`
- [x] Malformed frontmatter → parse_error, UI still renders
- [x] Learner app unchanged (except unrelated preserved work)

## Close record

Filled at `/close`.

## Kickoff

```text
/run PHASE-001

Read .work/context.json if present, else Docs/System/system.md, Docs/System/Dashboard-spec.md,
and this phase. Adapt Docs/System/dashboard (+ derive) to V3 Docs. Preserve lexicon stash
(PRESERVE.md). Prove with /dashboard. Clear stale servers.
```
