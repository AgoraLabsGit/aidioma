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

## D-006 — Dashboard index vs body
Date: 2026-08-05 · Phase: PHASE-001 · From: — · Affects: []
Chose: `index.json` / derive = frontmatter only; UI may render named markdown bodies on demand via `/api/doc`
Why: Same-day V3 + Dashboard-spec overclaimed “dashboard reads frontmatter only” while detail/Active need Context·Plan·Proof prose; bodies must not bloat the index
Revisit if: On-demand body fetch makes Active slow or duplicates SSOT with frontmatter
Supersedes: Absolute reading of system.md §5 “dashboard reads frontmatter only”

## D-007 — Issues page vs FIXES.yaml
Date: 2026-08-05 · Phase: PHASE-004 · From: — · Affects: []
Chose: UI label **Issues**; file stays `FIXES.yaml` (one of several issue kinds)
Why: Issues projects fixes plus blocked/parse_error/drift signals; renaming the page to Fixes would lie
Revisit if: FIXES.yaml becomes the only issue source and other kinds move elsewhere

## D-008 — Activity page vs .work/activity
Date: 2026-08-05 · Phase: PHASE-004 · From: — · Affects: []
Chose: UI label **Activity**; journal path stays `.work/activity/`
Why: Page name is for humans; path is the projection source — no rename needed
Revisit if: Activity grows a second source that is not the command journal

## D-009 — Dashboard-spec stays under System/
Date: 2026-08-05 · Phase: PHASE-004 · From: — · Affects: []
Chose: Keep `Docs/System/Dashboard-spec.md` over promoting to `SPEC-*` now
Why: Dev-system surface, not learner product behavior; PHASE-004 non-goal defers promotion
Revisit if: Learner app or shared packages need to depend on dashboard contracts

## D-010 — Phase vocabulary: build + canceled
Date: 2026-08-05 · Phase: PHASE-004 · From: — · Affects: []
Chose: Phase `type: build` (was `implementation`); state `canceled` (was `abandoned`); `/close --cancel`
Why: Clearer founder-facing labels; same semantics
Revisit if: External tooling still expects the old enum strings

## D-011 — Work page vs Signals page
Date: 2026-08-06 · Phase: PHASE-005 · From: — · Affects: []
Chose: Separate dashboard pages — **Work** (`WORK.yaml`) and **Signals** (derived health)
Why: Triage authored work is not the same question as indexer alarms; mixing them confused /triage
Revisit if: Nav cost outweighs clarity and a single page with default ledger filter is preferred
Supersedes: D-007 claim that one Issues page should house FIXES plus all derived kinds

## D-012 — Work ledger replaces FIXES + Backlog
Date: 2026-08-06 · Phase: PHASE-005 · From: — · Affects: []
Chose: Single `Docs/WORK.yaml` with kinds fix|task|proposal|research|question over `FIXES.yaml` + `Backlog.md`
Why: One capture/do-now home; phases remain schedule SSOT; no second Roadmap
Revisit if: Ledger becomes a competing schedule (add order fields, dual-write phases)

## D-013 — Thin SPEC stubs for Work feature/area tags
Date: 2026-08-06 · Phase: PHASE-005 · From: W-020 · Affects: [SPEC-A-DEVSYSTEM, SPEC-A-LEARNER, SPEC-A-CONTENT, SPEC-F-DEV-DASHBOARD, SPEC-F-PRACTICE, SPEC-F-LEXICON, SPEC-F-PROGRESS]
Chose: Create thin SPEC-A/SPEC-F stubs now so Work and phases can tag feature/area (option C)
Why: Org spine needs real ids; waiting for PHASE-002 left every Work row null
Revisit if: Stubs drift from approved PRODUCT.md map and need supersede/merge
Supersedes: Strict reading of “do not create empty areas in anticipation” for tagging-only stubs

## D-014 — Spanish dictionary source: Kaikki Wiktextract
Date: 2026-08-07 · Phase: — · From: R-001 · Affects: [SPEC-F-LEXICON, SPEC-A-CONTENT]
Chose: Kaikki eswiktionary Wiktextract JSONL over FreeDict, WordNet, FreeLing, RAE
Why: Only downloadable structured Spanish-first senses; open license; curated extract under content pipelines
Revisit if: CC-BY-SA blocks commercial shipping, or product requires licensed RAE-grade monolingual prose

## D-015 — Kaikki is editorial; DeepL is runtime MT
Date: 2026-08-07 · Phase: — · From: R-002 · Affects: [SPEC-F-LEXICON, SPEC-A-CONTENT]
Chose: Keep frozen Lexicon posture — Kaikki offline QA/seed only; DeepL for later Translation/AI fallback; maps own lesson/collection binding
Why: Different jobs; Kaikki has no stable sense ids or phrase/curriculum authority; Lexicon already uses `lex-*` + contextual maps
Revisit if: A measured import pipeline publishes reviewed Kaikki candidates into `content/lexicon/` with receipt schema
