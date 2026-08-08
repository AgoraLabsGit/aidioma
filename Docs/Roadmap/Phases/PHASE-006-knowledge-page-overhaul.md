---
id: PHASE-006
title: Knowledge Page Overhaul
type: build
proof_kind: visual
state: closed
order: 5
depends_on:
  - PHASE-007
from_backlog: W-039
owner: founder
outcome: "Knowledge is usable like Roadmap detail: fixed search/toolbar, Feature vs Area categories, type filters, mock-spec fixtures prove PRODUCT/Specs/Decisions/Research/Releases connections."
proof: "Visual + terminal: search sized correctly; filter chips; Feature Specs ≠ Area Specs; detail matches Roadmap phase detail (no dropdown chrome); mock fixtures load for each knowledge kind; connection clicks work."
non_goals:
  - Final product copy in PRODUCT.md (layout/projection only)
  - Redesigning spec templates (PHASE-008)
  - Promoting Dashboard-spec to SPEC-*
  - Learner-app Knowledge surfaces
amends_specs:
  - SPEC-F-DEV-DASHBOARD
feature: SPEC-F-DEV-DASHBOARD
area: SPEC-A-DEVSYSTEM
opened: 2026-08-06
closed: 2026-08-08
lessons: "Author display:flex must not override HTML hidden (page panels + detail). Knowledge height must fill main (not 100vh) when sidebar stacks. RELEASES format examples must not match ## RELEASE-nnn or parseReleases treats them as entries."
---

# PHASE-006 — Knowledge Page Overhaul

## Context

Knowledge TOC/search is broken; Feature and Area specs share one list; detail UX does not match
Roadmap. Need UI fixes plus **mock specs/fixtures** so connections are testable before real content
hardens (PHASE-008 / PHASE-002).

## Inputs

- Dashboard-spec Knowledge section; `Docs/System/dashboard/public/*`
- Sources: `PRODUCT.md`, `Specs/**`, `DECISIONS.md`, `Research/`, `RELEASES.md`
- Thin mock fixtures under dashboard test fixtures or Docs fixtures (MCOO)

## Plan

1. Toolbar: search + type filter chips (table-page pattern).
2. Categories: Product · Feature Specs · Area Specs · Decisions · Research · Releases.
3. Detail: Roadmap-detail layout (glance + body), not a dropdown.
4. Add mock Feature/Area/Decision/Research/Release fixtures; prove each loads via `/api/doc`.
5. Update Dashboard-spec Knowledge section.

**Complexity cost:** Knowledge UX + fixture set. Cut: search backend, content rewrite.

## Proof

- [x] Search sizing matches table pages
- [x] Feature Specs and Area Specs are separate categories
- [x] Detail layout matches Roadmap phase detail
- [x] Mock fixtures cover each knowledge kind; connections load
- [x] Dashboard-spec updated; `work:test` green

## Close record

- Result: Closed — Knowledge toolbar + Feature≠Area + phase-view detail + Product glance parity + viewport-locked scroll; MOCK Feature/Area stubs + RELEASE-000 fixture; `/api/doc` Decision/Research/Release slices. Founder visual iteration this session (TOC, glance, titles, scroll). Proof: C-013 work lane green (43/43); `/api/doc?id=RELEASE-000` live.
- Specs amended: SPEC-F-DEV-DASHBOARD
- Journal line: Knowledge usable like Roadmap detail; next `/plan` or `/run PHASE-008` (artifact molds)

## Kickoff

```text
/run PHASE-006

Read .work/context.json. Overhaul Knowledge UI; ship mock fixtures; prove every knowledge kind loads.
```
