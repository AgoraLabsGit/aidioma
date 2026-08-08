---
id: PHASE-009
title: Praxis Features and Active chrome
type: build
proof_kind: visual
state: ready
order: 7
depends_on:
  - PHASE-008
from_backlog: A-039
owner: founder
outcome: "Praxis Area + per-page Dashboard Features (Shell, Active, Work, Roadmap, Activity, Knowledge, Signals, Docs) own behavior; Active Work write-gate Feature (SPEC-F-PRAXIS-ACTIVE-FLUSH) ships Cursor hook; Dev System ids renamed to Praxis for later extract; Active leaves main nav for a header badge (active-phase count → Active); Active page contracts multi-phase tabs; system.md stays process SSOT and is updated to match."
proof: "Visual: Active absent from main nav; header badge left of worktrees shows active-phase count and opens Active; Active UI shows tab chrome for N active phases (works with 1 today). Specs: SPEC-A-PRAXIS + SPEC-F-PRAXIS-* (pages + ACTIVE-FLUSH) live; SPEC-A-DEVSYSTEM / SPEC-F-DEV-DASHBOARD superseded; Work/D/R retagged; system.md § dashboard + naming updated. Hook: Adv on shipped .cursor/hooks*."
non_goals:
  - Moving Praxis into a separate git repo/project (label + ids only for later extract)
  - Enabling hard parallel active phases runtime (W-015) — UI/tabs contract only
  - Pasting system.md into Spec bodies (system.md remains SSOT; Specs hold checkable page/area rules)
  - Learner PRODUCT.md / PHASE-002 product map
  - Rewriting closed phase history ids
  - Shell/MCP/Tab write gates (ACTIVE-FLUSH v1 is Agent Write/Delete/StrReplace only)
amends_specs:
  - SPEC-A-DEVSYSTEM
  - SPEC-F-DEV-DASHBOARD
  - SPEC-F-PRAXIS-ACTIVE-FLUSH
feature: null
area: SPEC-A-DEVSYSTEM
opened: 2026-08-08
closed: null
lessons: null
---

# PHASE-009 — Praxis Features and Active chrome

## Context

A-039 showed SPEC-A-DEVSYSTEM is a thin pointer while dashboard behavior lives in one fat
Feature + System/. Founder wants Praxis-named Area/Features (easy to extract later), each
Dashboard page as its own Feature, Active demoted from main nav to a header badge, and Active
ready to tab multiple active phases when W-015 lands. `system.md` stays process SSOT and must
stay accurate.

## Inputs

- Decisions: D-004 (system.md SSOT), D-009 (Dashboard-spec under System/), D-013 (stubs), D-020–D-030
- Research: R-003, R-004, R-005
- Audits: A-038 (Knowledge filters), A-039 (Dev System docs inventory)
- Specs today: SPEC-A-DEVSYSTEM, SPEC-F-DEV-DASHBOARD, Dashboard-spec.md (draft)
- Proposal related: W-015 — Parallel active phases (runtime deferred; UI contract in this phase)

## Plan

1. **Rename / supersede:** `SPEC-A-DEVSYSTEM` → `SPEC-A-PRAXIS` (Area). Split `SPEC-F-DEV-DASHBOARD`
   into Features: `SPEC-F-PRAXIS-SHELL`, `-ACTIVE`, `-WORK`, `-ROADMAP`, `-ACTIVITY`,
   `-KNOWLEDGE`, `-SIGNALS`, `-DOCS`. Keep ninth Feature `SPEC-F-PRAXIS-ACTIVE-FLUSH` (S-008).
   Supersede old ids; retag Work / Decisions / Research `feature`/`area` / `affects`.
2. **Thicken Specs:** Praxis Area gets checkable process invariants (not a full system.md paste).
   Each page Feature owns that page’s Behavior Rules; Shell owns nav/topbar/Filters chrome/detail rail.
3. **Active flush hook:** Ship `.cursor/hooks*` per SPEC-F-PRAXIS-ACTIVE-FLUSH; Required Adv on
   the implementation before that Work is `done`.
4. **Active chrome:** Remove Active from main sidebar nav. Add header badge immediately left of the
   worktrees/GitHub control: shows count of `active`(+`blocked` if product rule says so) phases;
   click opens Active. Spec Active page for **tabs across concurrent active phases** (usable with
   one phase today; no W-015 runtime).
5. **Keep `system.md`:** Update dashboard contract + Praxis naming; do not migrate body into Specs.
6. **Dashboard-spec:** Resolve dual SSOT (approve as architecture note or defer UI to Features).

**Complexity cost:** Many Feature files + nav chrome + hook. Cut: separate-repo move, parallel-phase
runtime, Shell write gate, essay dumps into Specs.

## Proof

- [ ] SPEC-A-PRAXIS + page SPEC-F-PRAXIS-* + SPEC-F-PRAXIS-ACTIVE-FLUSH exist; old DEVSYSTEM / DEV-DASHBOARD superseded
- [ ] Active flush hook shipped; Adv PASS/WARN-ack on hook recorded
- [ ] Active not in main nav; header badge count + navigation works
- [ ] Active page shows multi-phase tab chrome (N≥1)
- [ ] system.md updated (Praxis naming + Active chrome + page→Feature map)
- [ ] `work:test` green; founder visual accept

## Close record

- Result:
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-009

Read .work/context.json. Praxis Features + Active header badge + multi-active tabs contract;
keep system.md SSOT; rename DEVSYSTEM→PRAXIS for later extract.
```
