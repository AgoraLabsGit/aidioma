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

## D-018 — Main-rooted dashboard with active worktree overlay
Date: 2026-08-07 · Phase: PHASE-007 · From: R-003 · Affects: [SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM]
Chose: One `/dashboard` always rooted at the primary git worktree; `derive()` overlays the single active-phase worktree’s phases, HANDOFF, Research, WORK.yaml, and activity — over dual-writing `state: active` onto main or a separate live-mirror file
Why: Founder needs live phase/work/activity on one main-rooted dashboard before `/close` merges; phase branch remains schedule SSOT for audited main
Revisit if: Overlay merge rules drift from Docs SSOT, or parallel active phase worktrees become real (W-015)

## D-019 — Command audit bars, /check protocol, and May-invoke links
Date: 2026-08-07 · Phase: PHASE-007 · From: R-003 · Affects: [SPEC-A-DEVSYSTEM, SPEC-F-DEV-DASHBOARD]
Chose: Nest close lenses under Proof/Scope/Publish; required Adv on `/research` `/design` `/close` claims; `/run` starts with implicit phase `/triage` (sub-agent) and no mandatory Adv; path-aware `/check` inside `/close` and standalone; explicit May-invoke / Must-precede links on every command (incl. `/plan`/`/design` review Research first)
Why: Thin optional `/audit` failed founder intent; agents must chain commands from instructions, not invent workflow
Revisit if: Required Adv on every `/run` coding slice becomes the default, or May-invoke tables drift from skills

## D-020 — Docs+System home worktree (multi-agent SSOT)
Date: 2026-08-07 · Phase: PHASE-007 · From: — · Affects: [SPEC-A-DEVSYSTEM, SPEC-F-DEV-DASHBOARD]
Chose: Permanent **Docs home** worktree as the only writable SSOT for `Docs/**` (including `Docs/System/`) and `.work/**`; phase/task worktrees are for product code; `/dashboard` always roots at the Docs home — over D-018 primary+overlay and over dual-writing Docs across agent worktrees
Why: Founder runs parallel agents (phase + tasks/fixes/research). Overlay still assumes one “live” Docs writer and merges trees; separate agent checkouts of `Docs/` diverge (`state: proposed` vs `active`). One Docs home gives one camera and one ledger without inventing multi-root truth.
Revisit if: Docs-home merge lag blocks phase close, or two agents editing the same Docs-home files thrash `WORK.yaml` worse than overlay did
Supersedes: D-018 — Main-rooted dashboard with active worktree overlay

### Shape

| | Docs home | Phase / task worktree |
|---|---|---|
| Branch | `docs/ssot` (merged to `main` via audited path) | `phase/*`, `task/*`, … |
| Worktree path | `.worktrees/docs` (always present) | `.worktrees/phase-NNN`, etc. |
| Writable | `Docs/**` (incl. `Docs/System/**`), `.work/**` | `apps/`, `packages/`, `content/`, product tests — **not** Docs/System/`.work` |
| Dashboard | Always `cwd` / derive root = Docs home | May hold dashboard *code* during a System phase; still serves Docs home data |
| Phase schedule | Phase files + `state:` live only here | Code commits only; do not flip `state:` here |

**Not a new top-level `System/` folder.** System stays `Docs/System/` per layout allowlist.

### Agent rules

1. Before writing `Docs/` or `.work/` — `cd` Docs home (or open that worktree). Never write those paths on `phase/*` / `task/*`.
2. `/dashboard` starts from Docs home only; refuse or stop servers rooted elsewhere.
3. `/run` creates/uses the phase **code** worktree; activation (`state: active`) is committed on Docs home.
4. `/close` = Docs-home schedule/spec/System commits (already on `docs/ssot` → `main`) + phase code PR. No requirement that phase branch carry Docs diffs.
5. Parallel agents OK: phase agent on code tree; task/fix/research agents on Docs home (or code tree for code-only fixes).

### Process surface (skills / AGENTS.md)

**In** Docs home writable set (founder ack 2026-08-07): root `AGENTS.md`, `CLAUDE.md`,
`.claude/skills/**` — same multi-agent drift class as System.

### Non-goals

- Multi-root derive overlay (D-018) as long-term SSOT
- Top-level `System/` outside `Docs/`
- Multiple active phase worktrees (W-015 unchanged)
- File locking inside Docs home (two agents editing `WORK.yaml` still serialize in git)

### Implement via

Shipped (P-001, 2026-08-07): `resolveDocsHomeRoot`, dashboard pin, `npm run work:docs-home`,
skills/AGENTS/COMMANDS. D-018 overlay remains only when Docs home is absent.

## D-021 — `/close` dispatches phase close or reduced close
Date: 2026-08-07 · Phase: — · From: — · Affects: [SPEC-A-DEVSYSTEM]
Chose: `/close` always — active phase → full phase close; no phase → reduced close (`protocols/reduced-close.md`) — over a separate publish verb or refusing `/close` outside phases
Why: Founders end sessions with `/close`; a doc-only reduced-close path was skipped by agents; one verb must publish both phase and standalone work
Revisit if: Reduced path accidentally skips Required Adv on phase claims, or non-phase closes balloon into full phase ritual
