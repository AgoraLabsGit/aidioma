---
schema_version: 3
id: DEV-SYSTEM-V3
title: Development System V3
status: approved
founder_approval: approved
approved: 2026-08-05
owner: founder
supersedes: DEV-SYSTEM-V2
---

# Development System V3

The rules for how work moves from idea to production, and the data contract that lets a
dashboard show it.

Two planes:

- **State** — what is true now. Files. Overwritten.
- **Activity** — what happened. `activity.jsonl`. Append-only, never edited.

Files are the source of truth. Events are the journal. State is never derived from events.

**New here? Run `/status`.**

---

## 1. Principles

- **MCOO** — Minimal complexity for optimal output. Never onboard more complexity than the
  outcome requires. Cut, defer, or drop is always a valid result.
- **Proof-first** — A phase closes on demonstrated behavior, not description.
- **One active phase** — Exactly one. One branch. One worktree.
- **Write it down or it didn't happen** — Behavior change requires a spec change.
- **Audited main** — nothing reaches `origin/main` without passing the three close checks (§10).
  `/close` runs them for a phase; a standalone `/fix` runs them in reduced form. No other path
  merges.
- **Cheap to add utility, expensive to add lifecycle** — new verbs default to the utility class.

MCOO is enforced at two points, one cheap and one binding:

- **`/plan`** — name the complexity cost. Cut, simplify, or defer is a valid outcome. No
  unconsumed foundations. Cheap, and it prevents work rather than rejecting it later.
- **`/close`** — binding. Unjustified abstractions FAIL or require a cut before merge.

It is not restated elsewhere.

---

## 2. Units of work

Two axes. Every durable capability is one or the other.

| | Feature | Area |
|---|---|---|
| Answers | What can a user do? | What does everything stand on? |
| Example | Translation practice, learner session | Database (Neon), Auth (Clerk), AI (Vercel AI Gateway), API |
| Changes when | Product changes | Vendor or scale changes |
| Depends on | Areas | Rarely, other areas |
| Test | A user would name it | A user never sees it |

**Adding an area requires that at least one feature declares `depends_on` it.** If nothing
depends on it, it is a system concern (`System/`) or a decision (`DECISIONS.md`) — not an area.

Do not pre-create empty area specs. An area is written when the first feature needs it, not in
anticipation.

---

## 3. Artifacts

| Artifact | Answers | Home | Lifetime |
|---|---|---|---|
| Product | What are we building, for whom, and never | `PRODUCT.md` | Permanent |
| Spec | How does this behave | `Specs/Features/`, `Specs/Areas/` | Until the capability dies |
| Decision | Why did we choose this | `DECISIONS.md` | Permanent, append-only |
| Research | What are the options | `Research/` | Until stale or superseded |
| Phase | What are we doing now | `Roadmap/Phases/` | Dies at close |
| Work item | Parked or do-now non-phase work | `WORK.yaml` | Until done / promoted / dropped |
| Release | What went live | `RELEASES.md` | Permanent, append-only |
| Handoff | Where did I leave off | `Handoffs/HANDOFF.md` | Overwritten each session |

`Roadmap/Backlog.md` and `FIXES.yaml` are **retired** (PHASE-005). Their contents live in `WORK.yaml`.

Every question has exactly one home. If a new artifact type is proposed, it must displace one
of these or be rejected.

### Preserve

`PRESERVE.md` holds work-in-progress that exists outside the artifact model — stashes, parked
branches, uncommitted experiments — with one line each: what it is, why it is kept, and what
would release it.

Handoffs are overwritten, so anything recorded only there is lost at the next session. This is the
one place that state survives. `/close` and `/status --repair` never clean anything listed here.

### Work rows

`WORK.yaml` is a YAML array. One row per item.

| Field | Meaning |
|---|---|
| `id` | Kind-prefixed `F/T/P/R/Q/A-nnn` for new rows; legacy `W-nnn` still valid |
| `kind` | `fix` \| `task` \| `proposal` \| `research` \| `question` \| `audit` |
| `status` | `open` \| `active` \| `done` \| `promoted` \| `dropped` |
| `feature` / `area` | Nullable org tags (`SPEC-F-*` / `SPEC-A-*`) — not amend intent |
| `phase` | Nullable phase id if tied mid-flight |
| `promoted_to` | Phase or research id when promoted |
| `blocked_by` | Another work id, if any |
| `note` | Optional short misc line |
| `open_questions` | Clarifications for **this** row (`[{q, answer, asked}]`); not a new Work row |
| `done_summary` | What shipped + evidence when `done` |

`/log` parks (`open`). `/fix` `/task` `/audit` do-now (`active`→`done` + `done_summary`).
`/triage [PHASE|area|feature]` classifies and **executes** clear do-now work; confirms drop/plan/lifecycle.
When a phase is active or named, triage **must** spawn a sub-agent limited to Work with
`phase: <that id>` only. `/close` runs that phase-scoped triage **before** audits/reviews/tests.
`/plan` may promote a `proposal` (`promoted` + `from_backlog: <work-id>` on the phase).
New Work ids use kind prefixes (`F-` fix, `T-` task, `P-` proposal, `R-` research, `Q-`
question, `A-` audit). Existing `W-*` rows are never renamed.

**Kind classifier (for `/log`):** `fix` = broken behavior; `task` = small intentional chore that
fits one session; `proposal` = phase-sized or needs `/plan`; `research` = options choice;
`question` = parked standalone uncertainty with no target row; `audit` = scheduled/fired review.
When executing a row needs clarification → ask the founder and append `open_questions` on that
row — never spawn a sibling `question` row for the same item.

### Where practices and principles go

There is no best-practices document. Unenforceable guidance is never read again. Every such item
routes to a home where something checks it:

| Kind | Home |
|---|---|
| "Always validate AI output" | A rule in the area spec's Behavior |
| "We prefer X over Y" | A decision — dated, revisitable |
| "Never use `any`" | A lint rule |
| Product principles | `PRODUCT.md` |
| Process rules | `System/` |
| Why a killed phase was wrong | `lessons:` on the canceled phase |

If a practice cannot become a spec rule, a decision, a lint, or a product principle, it is a
preference — writing it down will not change behavior.

---

## 4. Folder layout

```
Docs/
  START.md                    entry point
  PRODUCT.md                  PRD — who, what, never
  DECISIONS.md                append-only decision log
  RELEASES.md                 append-only release log
  WORK.yaml                   work ledger (fix/task/proposal/research/question/audit)
  PRESERVE.md                 stashes, branches, and WIP that must never be deleted
  Specs/
    INDEX.md                  generated
    Features/                 SPEC-F-*.md
    Areas/                    SPEC-A-*.md
  Research/                   R-*.md
  Roadmap/
    Roadmap.md                generated view
    Backlog.md                retired stub → WORK.yaml
    Phases/                   PHASE-*.md
  Handoffs/
    HANDOFF.md
  System/                     THE FRAMEWORK ONLY
    system.md                 this document
    COMMANDS.md               command key
    ci-policy.md
    CHANGELOG.md              /system append log
    Templates/
    adapters/cursor.md
.work/
  activity/                   committed — YYYY-MM.jsonl, append-only
  context.json                generated by /status — agent boot manifest
  state.json                  gitignored — running server PIDs and ports, for runtime hygiene
```

`System/` holds framework information only. Development artifacts never go there.

Allowlist enforced by CI. Any other directory under `Docs/` fails the merge gate. Do not create
`Architecture/`, `ADRs/`, `Archives/`, or a second work registry.

---

## 5. Schemas

Frontmatter is the machine-readable contract. Prose below it is for humans.

**Projection rule:** `derive()` / `index.json` read **frontmatter only** (plus tiny derived
fields). The dashboard UI may fetch and render **named body sections on demand** (detail pane,
Active phase card, Knowledge viewer). Bodies are never embedded in the index. See D-006.

### Formats

Three, chosen by access pattern. Not one.

| Layer | Format | Why |
|---|---|---|
| Specs, phases, product, decisions, research | Markdown + YAML frontmatter | Read in the IDE by humans and agents; meaningful git diffs. The SSOT. |
| Activity log | JSONL | Append-only, one line per event, conflict-free merges |
| Work ledger | YAML | Small, order-independent, edited by hand and by agents |
| Agent manifest | JSON (`.work/context.json`) | Boot scope. Rebuilt, never authored. Gitignored. |
| Schemas | JSON Schema | Validate frontmatter in CI |

- Authored data is markdown or YAML — reviewable in a PR.
- Streamed data is JSONL — append-only.
- Derived data is JSON — disposable, rebuilt by the indexer.

**Not SQLite.** A binary SSOT cannot be diffed in review, edited by an agent in the IDE, or read
without tooling. Enforcement does not require a database — JSON Schema in CI gives the same
determinism against text. If derived state ever outgrows JSON, the *derived* layer becomes
SQLite. The source files never do.

When `DECISIONS.md` passes roughly 150 entries, split it to `Decisions/D-0XX.md` with the same
schema and links. Do not pre-solve this.

### Schema validation

Frontmatter is YAML, so it validates against JSON Schema. Schemas live in
`System/schemas/*.schema.json` and run in CI on every file.

| Enforced | Example failure |
|---|---|
| Required fields | Spec missing `paths` |
| Enum values | `status: draft` on a spec |
| Types | `order` not a number |
| Id format | `SPEC-TRANSLATION` missing the kind segment |

A schema violation fails the merge gate. This gives markdown the determinism of a database
schema, checked at commit rather than at write. Link resolution (`depends_on`, `decisions`,
`affects`) is checked by `derive()` and surfaces as Issues rows.

### Size caps

Enforced in CI. An artifact nobody finishes reading is an artifact that stops being true.

| Artifact | Cap |
|---|---|
| Spec | ~1500 words |
| Research | ~800 words |
| Phase file | ~600 words |

### Phase

```yaml
id: PHASE-007
title: Translation provider integration
type: design | build
proof_kind: test | visual | terminal | state | spec
state: proposed | ready | active | closed | blocked | canceled
order: 7
depends_on: []                # [PHASE-005] — what must close first
owner: founder
outcome: "Learner sees Spanish translation from DeepL on the practice page"
proof: "Screenshot of practice page + passing integration test"
non_goals: [caching, offline mode]
amends_specs: [SPEC-F-TRANSLATION, SPEC-A-AI]
opened: 2026-08-05
closed: null
lessons: null          # required when state: canceled
```

Sections: Context · Inputs · Plan · Proof · Close record · Kickoff

`type` is a **scheduling** concept. Design phases produce specs and decisions; build
phases produce running behavior. Either may be scheduled at any point — `order` follows
dependency, not category. A design phase commonly follows a build phase when it needs evidence
from real behavior, and commonly precedes it when behavior must be defined first.

`proof_kind` is separate: it declares what evidence closes this phase. A design phase normally
uses `proof_kind: spec` — and then app code changing is a Scope FAIL.

**States:**

| State | Meaning |
|---|---|
| `proposed` | On the Roadmap, not yet specified enough to start |
| `ready` | Owner has acknowledged the contract. Eligible to become active |
| `active` | The one phase in flight |
| `closed` / `canceled` / `blocked` | Terminal or paused |

`ready` is the approval signal. Scheduling and approval are different acts — being on the Roadmap
does not mean the contract has been read.

`depends_on` is the real constraint; `order` is a hint for presenting equals. `derive()`
(`sortPhasesForRoadmap`) sorts by dependency depth first, then `order` within a tier, then id —
inserting a phase must **never** renumber peers. `/plan` assigns the next free `PHASE-nnn` id and
sets `depends_on` + a local `order` tie-break only. A `ready` phase whose dependency is not
`closed` is flagged **blocked by dependency** rather than offered as next.

**Sizing — a guideline, not a gate.** The hard rule is *one outcome*. Aiming for a closeable
session-sized slice is advice that prevents the most common failure, but a phase is a container
(§7) and may legitimately run longer. The dashboard flags phases active beyond a threshold; it
does not block them.

### Spec

```yaml
id: SPEC-F-TRANSLATION
kind: feature | area
title: Translation
status: active | superseded | contested
superseded_by: null
depends_on: [SPEC-A-AI, SPEC-A-API]     # features only
vendor: null                             # areas only
decisions: [D-012]
built_by: [PHASE-007]
last_amended: PHASE-007
research: [R-004]
paths:
  - apps/web/app/practice/**
  - packages/translation/**
```

**`paths` is the key field.** It connects a spec to the code that implements it, which makes four
things computable instead of judgment calls:

| Derived | How |
|---|---|
| Spec coverage at close | changed paths → owning specs → were they amended? |
| Unspecified code | files matched by no spec |
| Dead specs | specs whose paths match nothing |
| Blast radius | real, not declared |
| `amends_specs` pre-fill | `/plan` and `/run` read it from the diff |

Without `paths`, "was a spec needed?" is answered by the agent that just wrote the code. With it,
it is a set operation.

Sections: Purpose · Behavior · Boundaries · Dependencies

Areas do not list the features that depend on them. That edge is derived by the dashboard.

**Specs are not versioned.** A spec describes how something behaves *now*. History is carried by
`built_by`, `decisions`, `superseded_by`, and git — chase any pointer for the diff. Do not embed
changelogs or decision records in specs; decisions live once in `DECISIONS.md` and are referenced
by id, because one decision often affects several specs.

`last_amended` exists so the dashboard can flag specs untouched while their code kept changing.
That is the drift signal.

### Frozen legacy

Frozen pre-V3 evidence stays in a single frozen root with a `FROZEN.md` at its top and sits
permanently in `do_not_load`. It is never preloaded into planning context.

After a phase's outcome, non-goals, and cut list are set with the owner, a bounded agent may mine
**relevant slices only** and return keep / defer / reject / conflict items for the Backlog or the
phase's Inputs. Legacy never authorizes implementation and is not approved design. Delete the
frozen root once mined.

### Deprecation

Deprecation is a **status, not a location**. There is no archive folder — git is the archive, and
a second one gets read as current and loaded into agent context.

- Superseded: set `status: superseded` and `superseded_by`. The file does not move. Links stay
  intact. The dashboard greys it out and hides it by default.
- Genuinely dead: delete it. Git has it. If the reason matters, append a decision.

### Research

```yaml
id: R-004
question: "Best EN→ES translation API"
verdict: DeepL
status: fresh | stale | superseded
informed: [D-012]
affects: [SPEC-A-AI]
phase: null
date: 2026-08-05
```

Sections: Question · Options · Verdict · Revisit if

Research older than 90 days is flagged `stale` by the dashboard. `verdict` is required — a
finding with no verdict is reading, not research.

### Decision

Append-only. One entry, four lines.

```
## D-012 — Translation provider: DeepL
Date: 2026-08-05 · Phase: PHASE-007 · From: R-004 · Affects: [SPEC-A-AI]
Chose: DeepL over Google Translate, GPT-4o
Why: Spanish quality, per-character pricing, no PII retention
Revisit if: cost exceeds budget or p95 latency > 400ms
```

Never edited. Superseding creates a new entry with `Supersedes: D-012`.

### Fix

```yaml
- id: FIX-031
  summary: "Practice page crashes on empty input"
  status: open | fixed
  spec: SPEC-F-TRANSLATION
  opened: 2026-08-05
```

---

## 6. Linking model

Four declared edges. Links are written, never inferred.

| Edge | Direction |
|---|---|
| `informed` | Research → Decision |
| `affects` | Decision → Spec |
| `depends_on` | Feature → Area |
| `amends_specs` | Phase → Spec |

**Research ahead of a spec** — `phase: null`, `informed: []`. Dashboard shows it under
*Unassigned findings*. `/plan` fills in the link when a phase adopts it.

**Research behind a spec** — new research sets `affects: [SPEC-X]`; the superseded decision gets
`Supersedes`. The spec flips to `status: contested` until a phase resolves it.

`contested` is a feature, not an error state. It makes visible the gap between what the docs say
and what you now know.

---

## 7. Commands

Four classes. The class determines what a command is allowed to do.

| Class | Commands | Phase state | Git | Logged |
|---|---|---|---|---|
| **Lifecycle** | `/plan` `/run` `/close` `/ship` | Mutates | Yes | Full |
| **Action** | `/research` `/design` `/fix` `/task` `/audit` | No | Commits; `/fix`/`/task`/`/audit` may publish via reduced checks | Full |
| **Utility** | `/log` `/triage` `/status` `/check` `/launch` `/dashboard` `/handoff` | No | Triage may commit via delegated `/fix`/`/task` | Light |
| **Meta** | `/system` | No | Yes | Full |

Utility commands are safe to run at any time and cannot damage state. Lifecycle commands are
gated.

### Intent routing

The user never has to know the command surface. Agents map plain language to commands and act.
Slash commands remain available for anyone who wants them.

| The user says | Agent fires | Because |
|---|---|---|
| "button x is too large" | `/fix` | Bounded defect, do now |
| "the API isn't working" | `/fix` | Something is broken |
| "rename this label" | `/task` | Small intentional work |
| "park this for later" | `/log` | Capture without doing |
| "triage the work list" / "triage Devsystem" | `/triage` | Classify + execute clear Work |
| "audit the command files" | `/audit` | Review a scope; Work `kind: audit` |
| "which translation API should we use?" | `/research` | Choice between external options |
| "how should the practice page behave?" | `/design` | Behavior undefined |
| "someday add offline mode" | `/log` `proposal` | Or confirm `/plan` if scheduling now |
| "where are we?" | `/status` | Read-only |
| "is it green?" | `/check` | Tests |
| "push it live" | `/ship` | Production |
| "I'm done for now" | `/handoff` | Session end |

**Routing rules:**

1. **Act, don't ask, when confident.** "Button x is too large" is unambiguous. Fire `/fix`,
   report what was logged. Asking "would you like me to open a fix?" is friction with no value.
2. **Ask once when the class is ambiguous.** "The API is slow" could be a fix (regression) or
   research (wrong provider). One question, then act.
3. **Say which command ran.** Every routed action reports the command and artifact id: *"Logged
   FIX-031."* The user learns the surface by watching it, never by studying it.
4. **Never route to a lifecycle command silently.** `/plan`, `/run`, `/close`, and `/ship` change
   phase state or reach users. Confirm before firing any of them. Action and utility commands need no
   confirmation.
5. **Three decisions per checkpoint.** When work surfaces more than three consequential decisions
   at once, stop and present three. Agents advise on bounded questions; the owner decides.
6. **Symptom, not diagnosis.** Log what the user said. Investigation happens after the artifact
   exists, so nothing is lost if the session ends.

Rule 4 is the safety line: cheap, reversible things happen automatically; consequential things
ask.

### A phase holds many activities

A phase is a **container**, not a single task. One active phase routinely absorbs research,
design, several builds, and fixes along the way.

```
PHASE-007 (active)
  ├─ /research  → R-004    which translation API
  ├─ /design    → D-012, SPEC-F-TRANSLATION
  ├─ /run       → build
  ├─ /fix       → FIX-031  button size, spotted mid-build
  ├─ /research  → R-005    rate limit handling
  ├─ /run       → build
  └─ /close     → merge
```

All of it is one phase, one branch, one close. Every activity emits its own event, so the
dashboard shows the full texture of the work — while the Roadmap still shows one clean line.

**Do not open a new phase for:** research, a spec update, a bug found mid-build, or a decision
that arises during work. Those are activities *inside* the active phase.

**Do open a new phase when:** the outcome itself changes, or the work no longer fits one working
session. That is the only ballooning worth avoiding.

If no phase is active, action commands still work — they simply carry `phase: null` and appear
under *Unassigned* on the dashboard.

### Lifecycle

| Cmd | When | Does | Must not |
|---|---|---|---|
| `/plan` | New work not on the Roadmap | Create a phase file; name the complexity cost; cut/defer is a valid outcome | Write product code; build unconsumed foundations |
| `/run` | Start or resume the one active phase | Execute the phase outcome; commit on the phase branch | Merge; expand scope horizontally; continue past a broken contract |
| `/close` | Phase complete | Phase-scoped `/triage` first, then three checks → commit/PR → merge exact head → clean `main`; stop phase-owned servers | Merge on FAIL; skip phase triage; expand scope silently; delete anything in `PRESERVE.md` |
| `/ship` | Promote to production | Deploy production; append to `RELEASES.md` | Ship on a red check, an open FAIL, or a contested spec |

`/ship` preconditions — all four, or it refuses:

- Last `/check` green on current `main`
- No open high-severity Work `fix` that blocks ship (founder judgment)
- Preview deploy verified
- No `contested` spec among the features being shipped

`/close --cancel` — records why, deletes the branch, sets `state: canceled`, no merge. The
honest exit. Without it, bad work gets finished out of sunk cost.

Abandon **requires a one-sentence `lessons:` field** in the phase frontmatter. Abandoned phases
are the only source of expensive information the system doesn't otherwise capture — everything
learned from work that shipped is already encoded in a spec, decision, or test. Captured at the
moment of maximum honesty, it costs one line.

`/close --dry-run` — runs the three close checks (Proof / Scope / Publish), changes nothing,
writes findings to `WORK.yaml`. `/audit` is the general action for scoped reviews (including
agent-context and specs); close checks remain the merge gate.

### Action

One unit of real work, one durable artifact, one event. Actions do not advance the phase — only
`/run` does.

| Cmd | Produces | Agent fires when | User fires when |
|---|---|---|---|
| `/research` | `Research/R-*.md` + optional decision | A choice between ≥2 external options blocks progress | Anytime, phase or no phase |
| `/design` | Decisions and/or a spec | Behavior is undefined, or ≥3 decisions are open | Anytime |
| `/fix` | Patch + proof + `WORK.yaml` `kind: fix` + `done_summary` | Defect is bounded and needs no design | Anytime |
| `/task` | Patch/docs + proof + `WORK.yaml` `kind: task` + `done_summary` | Intentional small work, not a defect | Anytime |
| `/audit` | Findings + `WORK.yaml` `kind: audit` + `done_summary` | Scoped review of feature/area/spec/agent-context/process | Anytime |

**`/fix`, `/task`, and `/audit` are deliberately unconstrained** for bounded do-now work. They
never need an active phase. `/log` parks; `/triage` classifies and executes clear do-now rows.

| Situation | Behavior |
|---|---|
| Phase active, fix touches phase scope | Commits to the phase branch, noted in the phase |
| Phase active, fix is unrelated | Own short-lived branch, publishes independently |
| No active phase | Own short-lived branch, publishes independently |

**Standalone publish** runs the three checks in reduced form: Proof (the fix is demonstrated),
Scope (path→spec coverage still applies), Publish (clean branch, no orphans). It is a close-class
action, so the audited-main invariant holds. Requiring a full phase for a one-line CSS fix would
balloon exactly what the phase container is meant to prevent.

`/research` never commits code — it writes to `Research/` on whatever branch is checked out.

Agents must be told when to reach for these. Users may fire any of them directly. There are no
hidden sub-commands.

If `/fix` or `/task` needs design or multi-session scope, `/log` as `proposal` (or confirm
`/plan`). One-way door for promotion.

### Utility

| Cmd | Does | Must not |
|---|---|---|
| `/log` | Append `WORK.yaml` row (`open`); auto-classify kind | Implement the work |
| `/triage` | Optional `[PHASE\|area\|feature]`; active/named phase → **sub-agent on `phase:` rows only**; classify; auto-run clear `/fix`/`/task`; confirm drop/plan; ask→`open_questions` | Mix other phases or `phase: null` into a phase pass; expand into unplanned phases |
| `/status` | Print a brief: active phase, git, runtime, suggested next command; refresh `context.json` | Change any authored file |
| `/check` | Run tests and lint | Fix what it finds |
| `/launch` | Stop stale app servers, start the app | Touch production |
| `/dashboard` | Stop stale dashboard servers, start the dashboard | Run in production |
| `/handoff` | Overwrite `Handoffs/HANDOFF.md` | Commit, PR, or merge |

**Handoffs are not archived.** They hold ephemeral mental state — valuable for six hours,
misleading after six weeks, and dangerous when an agent loads an abandoned plan as current. The
durable journal already exists in `.work/activity/`.

- `/close` extracts one journal line from the handoff into the phase's close record. That is the
  record that ages well, indexed by phase.
- If a handoff is written because the work is *blocked*, that is not ephemeral — append it to the
  phase file's Context instead.
- Git holds every prior version if you need one.

`/status --repair` — reconciles phase state against git, offers to clean orphan branches and stop
stray servers. Everyone eventually ends a session with dirty `main`, a stale branch, and a phase
whose state no longer matters. Reporting the mess is not enough; there must be one command that
fixes it.

### `derive()` — the shared module

All generated state comes from one function. `/status` is a caller, not the owner.

```
derive()  →  { phase, specs, decisions, research, work, releases,
               activity, issues (signals), git, next_command }
```

| Caller | Uses it for |
|---|---|
| `/status` | Prints a readable brief in the terminal |
| Every other command | Refreshes `context.json` after it runs |
| Dashboard | Renders its tables — calls `derive()` itself, on load and on file change |

| Output | Consumer |
|---|---|
| `.work/context.json` | Agents — the scoped subset |
| `Roadmap/Roadmap.md` | Humans reading the repo |
| `Specs/INDEX.md` | Humans reading the repo |

The dashboard never waits on a command. Nothing is user-triggered. One function means one truth;
two derivation engines would be two drift surfaces.

### Meta

`/system` edits the framework — this document, `System/` files, templates, command definitions.

- Writes only to `Docs/System/`.
- Bumps `schema_version`, appends to `System/CHANGELOG.md`.
- Shows proposed wording before writing.
- **Blocked while a phase is `active`.** Changing the rules mid-phase invalidates the close audit.
  (An **active phase** may still amend System files when that is the phase outcome.)
- **Generates** `COMMANDS.md`, `AGENTS.md`, and Cursor skill files from this document. Command
  definitions living in four hand-maintained places is guaranteed drift.
  **Staging:** hand-edit these until the generator ships, then they become build artifacts and
  are locked. The contract holds now; the mechanism follows.
- **Context budget:** Prefer one SSOT (`system.md`) + thin views. Caps: `AGENTS.md` ≤~120 lines;
  each skill ≤~60 lines; `COMMANDS.md` = tables only. Cut examples before rules. Do not duplicate
  full rituals — point at `system.md`. Growing past a cap requires a cut in the same change.

---

Implementation work never happens without a phase.

---

## 8. The loop

```
Capture → Plan → [Research → Decide → Spec] → Build → Prove → Close → Ship → Observe
   ↑                                                                            │
   └────────────────────────────────────────────────────────────────────────────┘
```

| Stage | Command | Output |
|---|---|---|
| Capture | `/log` → `WORK.yaml` | Work item |
| Plan | `/plan` | Phase file |
| Research | `/research` | R-file + decision |
| Decide / Spec | `/design` | Decisions + spec |
| Build | `/run` | Code on the phase branch |
| Prove | `/run` | Evidence in the phase file |
| Close | `/close` | Merge to `main` |
| Ship | `/ship` | Production + release entry |
| Observe | errors, feedback | `WORK.yaml` (`/fix` or `/log`) |

Maintenance work — dependency upgrades, migrations, refactors — is a build phase that
amends an area spec, with `proof: "behavior unchanged, tests pass"`.

---

## 9. Proof

"It works" means one of these. The phase declares which before `/run` starts.

| Kind | Evidence |
|---|---|
| Test | Named passing test, output captured |
| Visual | Screenshot of the running UI on the real path |
| Terminal | Command + output |
| State | Migration applied, record present, endpoint responds |
| Spec | A spec created or amended, with no app-code change. Design phases only |

Anything else is not proof. A description of behavior is not proof.

---

## 10. Close: three checks

| Check | Question | Fail means |
|---|---|---|
| **Proof** | Does the declared outcome demonstrably run on a real path? | Blocks merge |
| **Scope** | Did anything ship outside the contract? Was a spec written or amended for every behavior change? | Blocks merge |
| **Publish** | Clean `main`, PR contained, servers stopped, no orphan branches? | Blocks merge |

Conditional concerns — accessibility, security, privacy, AI tokens, performance, data migration —
are a checklist inside **Proof**, triggered by which paths changed. They are not additional roles.

| Result | Rule |
|---|---|
| FAIL | Blocks merge |
| WARN | Needs owner acknowledgment |
| PASS | All three green |

**The spec rule:** if the phase changed observable behavior and no spec was created or amended,
Scope fails.

This is **computed, not judged.** `/close` diffs the branch, maps changed files to owning specs
via each spec's `paths`, and checks whether those specs were amended. An agent auditing its own
work will always answer "no behavior changed"; a set operation will not.

Files matched by no spec produce a WARN and land on the dashboard's *unspecified code* list.

Design phases additionally fail if product behavior changed without a build phase.

---

## 11. Activity log

Every command emits one event to `.work/activity/YYYY-MM.jsonl`. Append-only, **committed**,
partitioned by month.

Committed because a gitignored journal is not memory — it dies with the machine, is invisible in
review, and splits across worktrees. Monthly partitions keep conflicts rare, and when two
append-only files do conflict the resolution is always "keep both lines."

```json
{"ts":"2026-08-05T14:22:00Z","type":"research","actor":"agent","cmd":"/research",
 "phase":"PHASE-007","ref":"R-004","status":"complete","duration_s":94,
 "summary":"Best EN→ES translation API → DeepL"}
```

| Field | Meaning |
|---|---|
| `ts` | ISO timestamp |
| `type` | Event type (below) |
| `actor` | `user` or `agent` |
| `cmd` | Command that emitted it |
| `phase` | Phase id, nullable |
| `ref` | Artifact produced — R-id, D-id, SPEC-id, PHASE-id, FIX-id, RELEASE-id |
| `status` | `complete` / `failed` / `blocked` |
| `summary` | One line, human-readable |

### Event types

| Type | Emitted by |
|---|---|
| `capture` | `/plan`, manual backlog append |
| `research` | `/research` |
| `decide` | `/design` |
| `spec` | `/design` |
| `plan` | `/plan` |
| `build` | `/run` |
| `fix` | `/fix` |
| `audit` | `/audit` or `/close` (carries verdict) |
| `ship` | `/ship` |

Low-noise: `check`, `handoff`, `system`.

`actor` answers the question you will actually ask: what did the agent do while I was away.

**Staging.** Event append is a contract now and takes effect as each command is wired. Do not
hand-write events for prose-only sessions — an unwired command logs nothing, and that is correct.

---

## 12. Dashboard contract

**The dashboard is a projection.** `Docs/` and `.work/` are written only by commands running in
the IDE or terminal. The dashboard never writes. Two-way control is a separate product, not a
later dashboard version.

Every command shown in the UI is copy-to-clipboard. That is the bridge.

### Liveness

```
Docs/ + .work/ → chokidar (300ms debounce) → full reindex → index.json → SSE → browser
```

- **Full rebuild on any change.** Under 100ms at this scale. Do not build incremental
  invalidation — it is where tools of this kind usually go wrong.
- **Debounce is required.** A branch switch changes hundreds of files; without it you fire
  hundreds of rebuilds.
- **Per-file try/catch.** One malformed frontmatter block must not kill the index. Surface it as
  a parse error on Signals.
- **Validate on index.** Unresolvable `depends_on` and `decisions` ids surface as broken links.
  The indexer is the integrity checker; no separate lint needed.
- **Heartbeat.** Display `indexed_at` plus a manual reindex button. File watchers die silently;
  without a visible timestamp you cannot tell a live dashboard from a dead one.

All derived values — reversed area→feature edges, blast radius, drift, unspecified code,
per-feature timelines, Roadmap ordering — are computed once by the indexer. Pages render
`index.json` and hold no logic of their own.

Six pages. Each reads a defined source. Every page is a table — one row per artifact — with a
detail pane on row click.

| Page | Reads | Answers |
|---|---|---|
| **Now** | Active phase, `HANDOFF.md`, git, last `/check` | What am I doing, what do I type next? |
| **Work** | `WORK.yaml` | What's parked, in flight, or done outside/alongside phases? |
| **Roadmap** | `Phases/*.md` frontmatter (incl. feature/area), ordered by `order` | What's scheduled, done, canceled? |
| **Activity** | `.work/activity/*.jsonl` | What happened, and what did the agent do? |
| **Knowledge** | Specs, `DECISIONS.md`, `Research/` | What exists, how does it behave, why? |
| **Signals** | Derived health only | What's drifting, broken-linked, or parse-failing? |

Handoffs is a card on **Now**, not a page — it is one overwritten file.

**Work** is authored. **Signals** are derived (drift, unspecified code, dead specs, stale
research, contested specs, parse errors, blocked phases). Do not mix them — triage is not the
same as health alarms. Most signals exist only because specs carry `paths`.

**Derived, not stored:**

- `Roadmap.md` — generated from phase frontmatter. Phase files are the only schedule SSOT.
- `Specs/INDEX.md` — generated.
- Area → feature edges — reversed from `depends_on`.
- Blast radius — count of features depending on an area.
- Per-feature timeline — activity events filtered by `ref` chain: research → decision → spec →
  build → ship.

The per-feature timeline is the view that justifies the event log. Everything else could be
rendered markdown.

---

## 13. CI and deploy

| Stage | Trigger | Logged as |
|---|---|---|
| Preview | PR opened by `/close` | automatic — Vercel preview |
| Production | `/ship` | `ship` event + `RELEASES.md` entry |

Primary proof is local `/close`. GitHub Actions are a thin merge gate: always-on `merge-gate`
(including the `Docs/` allowlist lint), plus path-filtered suites. Details:
`System/ci-policy.md`.

Production deploys are never a side effect of merging. `/ship` is explicit because it is the only
action that reaches users.

---

## 14. Worked example

Adding Spanish translation, start to finish.

1. Idea arrives mid-phase → `/log` as `proposal` in `WORK.yaml`. *Event: `log`.*
2. `/plan "translation"` → creates `PHASE-007`, promotes the Work row. *Event: `plan`.*
3. `/research "best EN→ES translation API"` → writes `R-004`, verdict DeepL. *Event: `research`.*
4. `/design` → appends `D-012` (provider choice, lives on the area spec), amends `SPEC-A-AI`,
   creates `SPEC-F-TRANSLATION` with `depends_on: [SPEC-A-AI, SPEC-A-API]`. *Events: `decide`,
   `spec`.*
5. `/run` → builds on branch `phase-007`, commits, captures screenshot + test output into the
   phase file. *Event: `build`.*
6. `/close` → Proof green, Scope green (two specs amended), Publish green. Merges to `main`,
   Vercel builds preview. *Event: `audit`.*
7. `/ship` → production, `RELEASES.md` entry. *Event: `ship`.*
8. A user hits an empty-input crash → `FIX-031` opened → `/fix`. *Event: `fix`.*

Dashboard now renders the full chain for Translation: R-004 → D-012 → SPEC-F-TRANSLATION →
PHASE-007 → RELEASE-004 → FIX-031.

---

## 15. Agent memory

The failure mode this prevents: an agent boots with no idea what is happening, reads everything,
burns its context on irrelevant history, and invents a plan. The fix is a context budget with a
generated manifest — not more documents.

### Context tiers

| Tier | Contains | Loaded |
|---|---|---|
| **Boot** | System rules, active phase, `HANDOFF.md` | Always |
| **Scoped** | Specs owning the paths in scope + their decisions | On file touch |
| **Retrieved** | Research, closed phases, decision history | Only on explicit request |
| **Never** | Frozen legacy, closed phase bodies, full decision log, unrelated specs | — |

The Never tier matters most. Agent failure is usually over-retrieval, not under-retrieval.

### The boot manifest

`/status` regenerates `.work/context.json`. Agents read this first, always. It is the only file
an agent loads without being asked.

```json
{
  "phase": {"id":"PHASE-007","state":"active","type":"build",
            "outcome":"...","proof":"...","proof_kind":"visual",
            "non_goals":["caching"],"amends_specs":["SPEC-F-TRANSLATION"]},
  "specs_in_scope": [
    {"id":"SPEC-F-TRANSLATION","file":"Docs/Specs/Features/SPEC-F-TRANSLATION.md",
     "paths":["apps/web/app/practice/**"],"decisions":["D-012"],"status":"active"}
  ],
  "open_fixes": [{"id":"FIX-031","summary":"..."}],
  "git": {"branch":"phase-007","clean":false,"ahead":3},
  "last_check": {"status":"pass","ts":"..."},
  "next_command": "/run",
  "do_not_load": ["Docs.2/**","Docs/Roadmap/Phases/PHASE-00*.md"]
}
```

`specs_in_scope` is computable only because specs carry `paths`. That field is what turns "figure
out what's relevant" from a guess into a lookup.

### Agent contract

Generated into `AGENTS.md`. Five rules.

1. **Boot** — read `.work/context.json`. Nothing else unprompted.
2. **Before editing a file** — load the spec owning its path. If no spec owns it, say so. Never
   invent one.
3. **Before deciding anything with two or more options** — fire `/research`. Never decide
   silently.
4. **After any command** — append one event. Never edit a past event.
5. **Route plain language to commands** — the user should never need the command surface. Act
   without asking on action and utility commands; confirm before lifecycle commands. Always
   report which command ran and what id it produced.

Rule 3 is what makes knowledge accumulate instead of evaporating into chat logs.

### What memory means here

| Memory | Lives in | Survives |
|---|---|---|
| What we built | Specs | Forever |
| Why | `DECISIONS.md` | Forever |
| What we rejected | `Research/`, `lessons:` | Forever |
| What happened when | `.work/activity/` | Forever |
| Where I left off | `HANDOFF.md` | One session |
| What matters now | `.work/context.json` | Regenerated |

No new artifacts. The memory was already in the system — it needed an index and a budget.

---

## 16. Cost discipline

The system adds files. If an agent reads them all at boot, it has made things worse. Six rules
keep boot cost flat as the project grows.

| | Boot tokens |
|---|---|
| Agent reads `Docs/` broadly | 30–80k, growing every month |
| `context.json` + system rules | 3–5k, flat at month 24 |

1. **`context.json` is the only unprompted read.** Everything else is pulled on demand. This is
   the rule to enforce hardest — if it breaks, the system becomes net-negative immediately.
2. **`paths:` scopes retrieval automatically.** Touching a file loads the spec owning it, not a
   search.
3. **`do_not_load` is enforced, not advisory.** Over-retrieval is the dominant agent failure.
4. **Size caps hold** (§5). Long artifacts are read partially and cited wrongly.
5. **Agents never read the activity log.** It grows unbounded and contains nothing an agent
   needs. `.work/activity/**` is always in `do_not_load`.
6. **Generated summary indexes.** `DECISIONS.md` gets a one-line-per-entry index so an agent can
   scan 40 decisions for ~400 tokens and load only the relevant one.

Utility commands cost no tokens — they are filesystem and shell only. That is why the class
exists, and why `/status` regenerating `context.json` is free.

`/research` is the expensive command by design. Fire it deliberately, not reflexively.

Net: a 2k spec read once replaces roughly 15k of code archaeology. The system is token-negative
as long as rule 1 holds.

---

## 17. Changes from V2

| Change | Reason |
|---|---|
| Phase frontmatter is the only schedule SSOT | Removed the reconcile chore caused by two SSOTs |
| Close audits: 5 roles → 3 checks | MCOO |
| Phase subtypes removed | Nothing branched on them |
| `canceled` state (was `abandoned`) | Wrong work needed an honest exit |
| `/spec` merged into `/design` | Deciding and writing behavior down are one act |
| Added `/research`, `/ship`, `/check` | Real lifecycle gaps: no research home, no deploy stage, no safe test run |
| Added `Research/`, `DECISIONS.md`, `RELEASES.md`, `START.md` | Homeless artifacts |
| Specs split into Features and Areas | Areas carry vendor decisions and give blast radius |
| Added `activity.jsonl` | The dashboard needs activity, not just state |
| Cursor skills → `System/adapters/` | Vendor coupling out of the core contract |
| Migration and changelog content → separate files | Temporary content does not belong in the contract |
| Directory prohibitions → CI allowlist lint | Negative-space rules rot; lints do not |
| Deprecation is a status, no archive folder | A second archive gets read as current |
| Specs unversioned; `last_amended` added | History lives in pointers and git; `last_amended` gives the drift signal |
| `lessons:` required on cancel | The only expensive information the system wouldn't otherwise keep |
| No best-practices document | Guidance nothing checks is never followed |
| `paths:` on every spec | Makes spec coverage, blast radius, and drift computable instead of judged |
| `proof_kind` added; `type` kept | Design phases stay a scheduling concept; evidence is a separate axis |
| `/fix` branch behavior defined, stays unconstrained | Bugs surface anytime; the phase model must not block them |
| `/ship` preconditions | The only command reaching users was the only ungated one |
| `/status --repair` | Reporting a broken state is not the same as fixing it |
| Activity committed, monthly partitions | A gitignored journal is not memory |
| `system.md` generates COMMANDS/AGENTS/skills | Four hand-maintained copies guarantee drift |
| `.work/context.json` + agent contract | Agents were re-reading everything to find what mattered |
| Intent routing table + rules | The user should describe problems, not learn a command surface |
| Phase stated as a container of many activities | Prevents phase-per-activity ballooning |
| Format rules: markdown/YAML authored, JSONL streamed, JSON derived | Binary SSOT would break IDE editing and PR review |
| Size caps in CI | Artifacts nobody finishes reading stop being true |
| Handoffs stay current-only; journal line extracted at close | Stale handoffs mislead agents; activity log is the real journal |
| Dashboard declared a read-only projection | One writer, one reader |
| Liveness contract: debounce, full rebuild, heartbeat | Watchers die silently |
| Cost discipline section | The system must be token-negative, not additive |

### Review fixes (pre-approval)

| Issue | Resolution |
|---|---|
| `/fix` merging vs "only `/close` merges" | Invariant restated as *audited main* — three checks gate the merge, not one command |
| `ready` dropped with no approval signal | Restored. Scheduling and approval are different acts |
| Generated Roadmap with no ordering | `order` added to phase frontmatter |
| Session sizing vs container model | Sizing is a guideline; the hard rule is one outcome |
| MCOO enforced only at `/close` | Cheap cut/defer gate restored at `/plan` |
| "Never hand-edit generated files" before generators exist | Staged — hand-edit until the generator ships, then locked |
| Design phases "after implementation" | Reworded: `order` follows dependency, not category |
| Event logging as prose busywork | Staged — takes effect as each command is wired |
| Empty area specs pre-created | Explicitly prohibited |
| Count errors in ship checks, agent rules, dashboard views | Corrected |
| `proof_kind: spec` absent from the proof table | Added |
| Action-class Git column contradicted standalone `/fix` | Column now reflects reduced-check publish |
| Intent routing rule 4 omitted `/run` | Added — all four lifecycle commands confirm |
| Three-decision founder checkpoint dropped from V2 | Restored as routing rule 5 |
| Frozen legacy had no farm rule | Restored: bounded mining after outcome is set |
| `state.json` unspecified | Defined as server PIDs and ports |
| Generated Roadmap and spec index had no author | One shared `derive()` module |
| Derivation duplicated between agents and dashboard | Single `derive()`; dashboard calls it directly, never user-triggered |
| Schemas were prose tables with no enforcement | JSON Schema files validated in CI |
| Phases had `order` but no dependency | `depends_on` added; `order` is now a hint within a tier |
| No home for stashes and parked WIP | `PRESERVE.md` added |
| Backlog rows undefined | Table format, own id namespace, `from_backlog` on promotion |
| Command prohibitions buried in prose | "Must not" column on every command table |
| No paste-ready session kickoff | Kickoff block added to the phase template |
