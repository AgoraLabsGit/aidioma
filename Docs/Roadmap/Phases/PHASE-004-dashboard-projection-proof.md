---
id: PHASE-004
title: Dashboard Projection Proof
type: build
proof_kind: terminal
state: active
order: 2
depends_on:
  - PHASE-001
from_backlog: null
owner: founder
outcome: "Mike can trust the dashboard as a pure projection of Docs/ + .work/, with accurate time/sort/filter wiring, Issues (open and closed), and Activity."
proof: "Terminal checklist: projection audit; Issues open+closed; time/sort/filter audit; Activity Ref vs Phase decided; events from .work/activity; PHASE-099 only via its .md; open FIX + parse_error smoke."
non_goals:
  - Learner-app / product design (PHASE-002+)
  - Production hosting; two-way UI commands
  - Promoting Dashboard-spec to SPEC-* (optional later)
  - Parallel active phases (BL-011)
amends_specs: []
opened: 2026-08-05
closed: null
lessons: null
---

# PHASE-004 — Dashboard Projection Proof

## Context

PHASE-001 shipped the dashboard. Before product design, prove the UI is a pure projection of
authored files — and that Issues, Activity, time, and filters work end-to-end.

## Inputs

- Decisions: D-004, D-005, D-006
- Docs: `Dashboard-spec.md`, `system.md`, `FIXES.yaml`, phases, `.work/activity/`
- Code: `Docs/System/dashboard`, `Docs/System/derive`
- Fixture: `PHASE-099-mock-dense-lexicon.md` (MOCK — do not `/run`)

## Plan

1. **Projection audit** — every Active/Roadmap/Detail field from frontmatter, `/api/doc`, or index.
2. **Issues** — `FIXES.yaml` open and fixed; status/kind filters + sorts; keep other issue kinds.
3. **Naming (≤3 founder calls)** — Issues vs `FIXES.yaml`; Activity vs `.work/activity`; System
   `Dashboard-spec` vs `SPEC-*`.
4. **Fixtures** — PHASE-099 only as a real `.md` (or delete); never mock phases in JS.
5. **Activity** — commands append `.work/activity/YYYY-MM.jsonl`; page lists them.
6. **Time** — age/"ago" matches source timestamps on all pages.
7. **Sort/filter** — every chip/sort on Roadmap, Activity, Issues wired correctly.
8. **Ref vs Phase** — keep both when they differ; hide/merge when identical.
9. **Runbook** — Dashboard-spec §8 plus the checks above.

**Complexity cost:** Issues history + filter/time hardening. No DB. No learner coupling.

## Proof

- [x] Projection audit clean (no hardcoded phase payloads in dashboard JS)
- [x] Issues: open + fixed FIX rows; filters/sorts work
- [x] Naming decision recorded; UI matches (D-007..D-009)
- [x] PHASE-099 only via phase `.md` (or removed)
- [x] Activity from `.work/activity/`; new command appends a line
- [x] Open FIX then fixed still visible under closed filter
- [x] parse_error appears then clears
- [x] Time/age accurate on all pages (`formatAge` / `age_days` from source stamps)
- [x] All sort/filter chips verified (Roadmap state/type/sort; Activity actor/type/phase/sort; Issues status/kind/severity/sort) + `filters.test.ts` contracts; gaps: Activity date-range + per-feature timeline (spec later)
- [x] Activity Ref vs Phase decided and implemented (merge when identical)

## Close record

- Result: Pending `/close` — terminal proof green on phase branch
- Specs amended: `Docs/System/Dashboard-spec.md` (projection proof §8; Issues/Activity naming)
- Journal line:

## Kickoff

```text
/run PHASE-004

Read .work/context.json. Pure projection proof; Issues open+closed; Activity; time/sort/filters.
```
