---
id: PHASE-001
title: Dev System Dashboard
type: build
proof_kind: visual
state: closed
order: 1
depends_on:
  - PHASE-000
from_backlog: null
owner: founder
outcome: "Mike can see phases, activity, knowledge, and issues in a local dashboard without parsing Docs by hand."
proof: "Running /dashboard against live Docs/ showing Active + Roadmap at minimum; acceptance checks in Dashboard-spec."
non_goals:
  - Target product decisions
  - Component architecture
  - Lexicon product publish
  - Production hosting of the dashboard
  - Two-way command execution from the UI
  - Renaming phase body headings / schema redesign before real data exists
amends_specs: []
opened: 2026-08-05
closed: 2026-08-05
lessons: null
---

# PHASE-001 — Dev System Dashboard

## Context

After Docs.2 sprawl, V3 installed the process contract (`system.md`) but the founder still
could not answer “what am I doing?” without opening many markdown files. That disconnection is
the failure mode this phase closes: a local read-only projection of live `Docs/` + `.work/`.

PHASE-000 closed the process. This phase proves the process is usable. Schema/UI renaming waits
until phases and at least one real spec with `paths` exist — optimize against real data, not stubs.

## Inputs

| Input | Notes |
| --- | --- |
| Decisions | D-004 (V3 approved), D-005 (dashboard before product design), D-006 (index vs body) |
| Specs | none yet — `amends_specs` stays empty until a dashboard/system surface earns a SPEC |
| Docs | `Docs/System/system.md`, `Dashboard-spec.md`, `COMMANDS.md`, schemas, templates |
| Code | `Docs/System/dashboard`, `Docs/System/derive` |
| Frozen | `Docs.2/` only as evidence after outcome/non-goals were set (not preloaded) |

## Plan

1. Shared `derive()` over phase/spec/fix/research frontmatter → `.work/index.json`
2. Local dashboard server: watch Docs, SSE refresh, `/api/doc` for on-demand bodies
3. Shell: sidebar pages Active · Roadmap · Activity · Knowledge · Issues
4. Active + Roadmap detail: one shared phase layout (status, body sections, dependencies, files)
5. Issues from `FIXES.yaml` + broken links / parse errors; slow path signals when specs have `paths`
6. Densify this phase file; correct “dashboard reads frontmatter only” overclaim in `system.md`
7. Visual proof via `/dashboard`; then `/close` (no schema rename in this close)

**Complexity cost:** local projection UI + parsers. No learner-app coupling. No DB. No command
execution from the UI.

## Proof

What closes the phase: founder can operate from the dashboard for morning orientation.

- [x] `/dashboard` launches; stale servers cleared
- [x] Active shows live phase frontmatter (next_command stays in index for agents; not shown in UI)
- [x] Roadmap lists phases ordered by `order`
- [x] Malformed frontmatter → `parse_error`, UI still renders
- [x] Learner app unchanged (except unrelated preserved work)
- [x] Detail pane loads phase body via `/api/doc` without embedding bodies in `index.json`
- [x] Active/Detail shared layout readable against this densified phase (founder visual OK via `/close`)
- [x] `system.md` states: index = frontmatter; UI may render named body sections on demand

## Close record

- Result: PASS (Scope WARN: `Docs/System/dashboard/**` + `derive/**` unmatched by any SPEC `paths` — intentional; no product SPEC yet; System `Dashboard-spec.md` remains the design contract)
- Specs amended: none (`amends_specs: []`)
- Journal line: Local derive()+dashboard under Docs/System; Active/Roadmap/Activity/Knowledge/Issues project live Docs; founder closed on visual proof.

## Kickoff

```text
/run PHASE-001

Read .work/context.json if present, else Docs/System/system.md, Docs/System/Dashboard-spec.md,
and this phase. Work only in .worktrees/phase-001. Densify real phase content before schema
renames. Prove with /dashboard. Preserve lexicon stash (PRESERVE.md). Clear stale servers.
```
