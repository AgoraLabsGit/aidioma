# Decisions

Append only. Never edit a past entry. Superseding creates a new entry naming the old one.

---

## D-001 — Work unit: bounded phase outcome
Date: 2026-08-05 · Phase: PHASE-000 · From: — · Affects: []
Chose: Phase = bounded testable outcome over component-only work units
Why: Process, product map, and builds all need the same container
Revisit if: Phases routinely cannot name one observable outcome

## D-002 — Schedule SSOT: phase files
Date: 2026-08-05 · Phase: PHASE-000 · From: — · Affects: []
Chose: Phase frontmatter (generated Roadmap view) over WORK.yaml as living registry
Why: One schedule home; WORK.yaml dual-wrote and drifted
Revisit if: Generated Roadmap cannot answer order/status in three seconds
Supersedes: V2 claim that Roadmap.md prose alone was SSOT

## D-003 — Merge path: audited main
Date: 2026-08-05 · Phase: PHASE-000 · From: — · Affects: []
Chose: Three close checks gate every merge; `/close` for phases, reduced checks for standalone `/fix`
Why: Clean main without blocking tiny unrelated fixes behind a full phase
Revisit if: Standalone fix publishes routinely skip Scope/Proof

## D-004 — Development System V3 approved
Date: 2026-08-05 · Phase: — · From: — · Affects: []
Chose: `Docs/System/system.md` (V3) over V2 process contract
Why: Features/Areas, research/decisions homes, activity journal, dashboard contract, MCOO gates
Revisit if: Boot cost becomes net-negative or derive() splits into two engines
Supersedes: DEV-SYSTEM-V2 / development-system-v2.md as living process SSOT

## D-005 — Next scheduled work: Dev System Dashboard
Date: 2026-08-05 · Phase: PHASE-001 · From: — · Affects: []
Chose: PHASE-001 dashboard after process install, before target product design
Why: Founder needs a readable control surface before more product design sprawl
Revisit if: Dashboard V1 cannot project phase state without a second registry
