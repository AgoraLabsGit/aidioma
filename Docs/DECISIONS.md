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
Clarified by: D-025 — product `/task`/`/fix` desks + Docs-home path leases

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
5. Parallel agents OK: phase agent on code tree; product task/fix on `task/*`/`fix/*` (D-025); meta/research on Docs home.
6. Docs-home path leases via active Work `context_paths` (D-025) — overlap → wait/park.

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

## D-022 — Work is primary visibility; activity.jsonl stays the journal
Date: 2026-08-07 · Phase: — · From: S-001 · Affects: [SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM]
Chose: Durable command work is visible on the **Work** table/detail; `.work/activity/*.jsonl` remains the append-only journal and is **projected** into Work (and Phase) detail by `ref` / `phase` — over turning every activity event into its own Work row, and over keeping Activity as the only place to see command history
Why: Founder wants one place to follow work; Activity page becomes redundant for that job once trails land on Work. Ledger (authored Work rows) and journal (events) stay separate homes — UI primary shifts to Work
Revisit if: Phase-lifecycle events (`/run` `/close` `/check` without Work ref) are invisible after Activity nav removal, or Work Open is drowned by event-like rows

### Non-goals
- Work-row-per-`/check` / `/dashboard` / `/handoff`
- Agents reading `.work/activity/**`
- Deleting the activity.jsonl files

### Implement via
Work detail Activity section; `/fix` `/task` `/audit` `/research` `/design` Work active flush; Activity page optional (nav removal after founder ack on S-001)

## D-023 — Work vs Activity page jobs (process spine)
Date: 2026-08-07 · Phase: — · From: S-002 · Affects: [SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM]
Chose: Keep **both** Work and Activity pages with hard UI separation — over removing Activity (D-022 optional-nav) and over showing the full journal on Activity
Why: Founder treats plan/design/research/audit as outcome work like tasks/fixes; Activity must not duplicate that table. Process/ops still need a home.
Revisit if: Process-only Activity is too sparse to use, or founder wants a full flight-recorder page again
Supersedes: D-022 claim that Activity page is optional / candidate for nav removal
Adv: WARN (ack) — default rows = always-shown process types only; Type chips ⊆ process allowlist (no outcome-type chips)

### Homes (page jobs)
| Outcome | Authoritative home | Work ledger? |
|---|---|---|
| fix / task / proposal / research / question / audit | Work (`WORK.yaml`) | yes |
| design (in-flight `/design`) | Work `kind: design` (`S-nnn`); durable D-*/SPEC-* also in Knowledge | yes while executing |
| plan (phase outcomes) | Roadmap / phase files | no Work kind for `/plan` (may promote proposal) |
| process ops | Activity page ← filtered journal | never Work rows for check/handoff/dashboard |

### Activity page allowlist (table only)
- **Default rows (All):** `handoff`, `close`, `check`, `ship`
- **Optional Type chips** (same allowlist; not in default All): `launch`, `dashboard`, `status`, `triage`, `system`
- **Excluded from Activity page:** outcome types (`fix`, `task`, `log`, `research`, `design`, `decide`, `spec`, `plan`, `build`, `audit`, `capture`, …)
- `activity.jsonl` still appends all wired commands (journal SSOT unchanged)

### Lifecycle visibility (required)
- Phase detail keeps projecting `plan` / `build` / `close` / `check` / other phase-matched events (D-022)
- Work detail keeps projecting events by Work `ref`
- Activity page is **not** the `/run`/`/plan` flight recorder

### Non-goals
- Delete `activity.jsonl`
- Work-row-per-ops-event
- Agents loading `.work/activity/**`

## D-024 — Brief vs Context; declared `context_paths`
Date: 2026-08-07 · Phase: — · From: S-003 · Affects: [SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM]
Chose: Detail **Brief** = authored intent (Work `note`; Phase `## Brief` else `## Context`); **Context** = declared `context_paths`; **Files** = ownership trees — over auto tool-read capture and over keeping prose labeled “Context”
Why: Founder wants Context to mean “what was used,” but session reads are not deterministic without instrumentation; declared paths are honest and durable
Revisit if: A reliable capture hook lands (skills/hooks) that can append reads without false completeness claims
Adv: WARN — dual vocabulary during transition (file `## Context` = UI Brief; UI Context = `context_paths`); soft-fill may leave Context empty until skills write paths

### Detail (locked)
1. Brief = authored intent
2. Context = declared repo-relative `context_paths` (honest empty if none; never invent from tool traces)
3. Files = spec `paths` / phase `amends_specs` / ledger homes — separate from Context
4. Phase Brief body precedence: `## Brief` if present, else `## Context`

### Non-goals
- Claiming Context is a complete set of every file read
- Auto-harvesting Cursor/IDE tool traces into Docs/
- Mass-renaming existing phase `## Context` headings in this decision (UI alias only)

### Implement via
- Work: `context_paths: string[] | null` in schema + template; skills fill material paths on done when known
- Phase: optional frontmatter `context_paths` (same meaning); dashboard Brief ← `## Brief` else `## Context`
- Dashboard Work/Phase detail: sections **Brief**, **Context**, **Files** (in that order where present)

## D-025 — Non-phase trees: product vs Docs home
Date: 2026-08-07 · Phase: — · From: — · Affects: [SPEC-A-DEVSYSTEM]
Chose: Steady-state **product** `/task`/`/fix` run in dedicated `task/*` / `fix/*` worktrees (product code only); **Docs home** remains the only writer for `Docs/**`, `.work/**`, root agent entrypoints, and `.claude/skills/**`. Concurrent Docs-home editors claim overlapping paths via active Work `context_paths` — second agent waits or parks — over every non-phase session coding on `docs/ssot`
Why: System-building temporarily concentrates chores on Docs home; once AIdioma product work dominates, non-phase code should isolate like phases. D-020 already forbids Docs writes on task trees; this locks the converse routing and a light lease for the shared meta tree
Revisit if: Path leases are ignored in practice, or System UI moves out of `Docs/System/` into a product package

### Routing

| Outcome lives in… | Desk |
|---|---|
| `apps/`, `packages/`, `content/`, product tests | `task/t-nnn-*` or `fix/f-nnn-*` worktree (create if missing) |
| `Docs/**`, `.work/**`, `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` | Docs home only (`docs/ssot`) |
| Ledger / activity for any of the above | Always Docs home (flush `active` before other edits) |

### Path lease (Docs home only)

1. On Docs-home edit, set/keep `context_paths` on the **active** Work row to the paths you will touch (before material edits when known).
2. If another `status: active` Work row already lists an overlapping path → **do not edit**; wait, `/handoff`, or `/log` — do not thrash the same file.
3. Product `task/*` / `fix/*` trees do not need leases against each other (git isolation); still do not write Docs there.

### Interim (System-building)

While most work is System/dashboard, Docs-home `/task`/`/fix` for `Docs/System/**` remains valid. Prefer leases; do not invent parallel Docs-home writers on the same CSS/skill file.

### Non-goals

- Multiple active phases (W-015 unchanged)
- File locks / daemon mutexes
- Requiring a worktree for pure ledger parks (`/log`) or read-only `/status`

### Implement via (`/close`)

- Reduced close inventories desks; publishes **each** dirty session desk
- Product → PR `task/*` / `fix/*` → merge → delete that worktree
- Meta → short-lived `close/*` from Docs home → merge → refresh Docs home; **never** delete Docs home
- Dual-desk sessions must not publish only one side
- Phase close unchanged: code PR + Docs-home meta (D-020)

## D-026 — Praxis Docs page (operator guide)
Date: 2026-08-07 · Phase: — · From: — · Affects: [SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM]
Chose: First-class dashboard page **Docs** (`docs`) as the Praxis PM operator guide — foot entry with Signals/Theme; V1 content = living `Docs/START.md` + `Docs/System/COMMANDS.md`; sidebar-foot is one icon-only row (Signals · Docs · Theme) — over main-nav Docs tab, Knowledge reuse, or a separate authored guide file
Why: Founders need an in-product how-to for Praxis without dumping `system.md` or conflating the guide with Knowledge’s artifact browser. Living START/COMMANDS stay SSOT; the page projects them.
Revisit if: Guide needs more than START+COMMANDS (e.g. curated narrative), or Docs belongs in main nav after usage data

### Shape

| | Rule |
|---|---|
| Page | `docs`, title **Docs**; not a main-nav tab |
| Entry | Sidebar-foot Docs control (with Signals + Theme) |
| Content V1 | Project `START.md` + `System/COMMANDS.md` (TOC + full-page reader) |
| Foot chrome | One horizontal icon-only row; labels via `title`/`aria-label` only |
| ≠ Knowledge | Knowledge = artifact browser; Docs = operator guide |

### Non-goals

- Editing Docs from the UI
- Replacing the Commands panel
- Shipping full `system.md` prose in V1
- New authored guide file as a second SSOT

### Implement via

- `SPEC-F-DEV-DASHBOARD` + `Dashboard-spec` Shell/Pages
- UI task: page panel + foot Docs control + icon-only foot row (T-043)

**Superseded content rule:** D-027 — Docs projects beginner guide only (not COMMANDS.md).

## D-027 — Docs page is a beginner Praxis guide
Date: 2026-08-07 · Phase: — · From: A-009 · Affects: [SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM]
Chose: Docs page projects a **customer-facing beginner guide** (`Docs/START.md` rewritten) only — over projecting `COMMANDS.md` / agent SSOT on the Docs page
Why: Founder wants a complete beginner to understand Praxis; COMMANDS.md is the agent command key. D-026 V1 content rule failed that goal (A-009).
Revisit if: A separate `GUIDE.md` home apart from START is clearer than START + COMMANDS-OVERVIEW
Supersedes: D-026 content V1 (START + System/COMMANDS projection). Keeps D-026 page/entry/foot chrome.

### Shape

| | Rule |
|---|---|
| Docs TOC | Titles only (Welcome, Commands) — no file-path sub-lines; no Guide/Praxis chrome |
| Content | `START.md` (incl. multi-session `/handoff`) + customer `COMMANDS-OVERVIEW.md` |
| Not on Docs | `System/COMMANDS.md`, schemas, desks, audit bars — agent/Commands panel / Knowledge |
| Accuracy | “At most one phase in flight **today**”; parallel phases planned (W-015); small work outside phases is first-class |

### Non-goals

- Deleting or diluting `COMMANDS.md` as agent SSOT
- Shipping full `system.md` on the Docs page

