# PROCESS KIT — portable dev-process bootstrap (exported from Praxis, 2026-07-21)

> **Operator: how to use this file.** Copy it into the ROOT of the new project's repo. Then tell
> the agent there: *"Read PROCESS-KIT.md and set up the dev process it describes."* The agent
> builds everything below, interviews you once to seed the roadmap, and from then on the whole
> dev loop runs on three commands: **`/feature`** (idea → spec → roadmap), **`/run`** (build the
> next roadmap item), **`/fix`** (bug or small product update). A fourth, **`/close`**, ends a
> wave with the full audit/test/review pass and your GO.

---

## PART 1 — What you are building (read this first, agent)

You are installing a **docs-as-memory dev process**. The repo's `Docs/` tree IS the project's
long-term memory — no agent session ever relies on chat history to know where the project is.
The system has five load-bearing ideas:

1. **One question → one home.** Every kind of fact has exactly one file that owns it. Status
   lives in STATE.md, the plan lives in ROADMAP.yaml, decisions live in ADRs, defects live in
   the bugs register. Never duplicate a fact across two files — link instead.
2. **The roadmap is the single source of truth (SSOT).** When any doc disagrees with
   `Docs/ROADMAP.yaml`, the roadmap wins. Work is organized as **waves** (a coherent batch of
   work, sized to fit one agent session) made of **slices** (one unit of work with its own
   record, gates, and audit).
3. **Every slice runs the same lifecycle** — spec → build → gate → audit → review → merge →
   prove → clean → record. "Done" means **real data on a real screen** (or a real passing
   run for backend work), never "the code is written."
4. **Registers own follow-ups.** Every bug, deferred task, and piece of dying code gets a
   register row with an owner or trigger — never a promise in prose. A wave cannot close with
   fired triggers unexecuted.
5. **The operator is a non-technical solo founder.** Plain language, always. They touch a wave
   exactly three times: approve the plan · verify the result on screen · GO the push. Everything
   else is yours. Triage findings yourself; surface at most ONE strategic call at a time as a
   plain yes/no; never pass raw sub-agent output through.

### Setup checklist (do these in order)

1. Create the folder tree in Part 2.
2. Write every file in Parts 3–5 exactly as given (fill `<project>` placeholders).
3. **Detect the project's real quality-gate commands** (typecheck, lint, test, build, dev-server)
   from `package.json`/config — or ask the operator if the repo is empty — and write them into
   the GATE table in `Docs/PROCESS.md` and the `verify:` block in `Docs/ROADMAP.yaml`.
4. Interview the operator in plain language (5–10 questions max): what the product is, the 3–5
   big outcomes wanted, what "MVP done" looks like. Seed `Docs/ROADMAP.yaml` with waves and
   `Docs/STATE.md` with the starting position. Confirm the wave plan with them.
5. Commit everything on a branch (`process-bootstrap`), show the operator, merge on their OK.
   **Never push without an explicit GO.**

---

## PART 2 — Folder structure

```
<repo-root>/
├── CLAUDE.md                  # the agent's memory file (Part 4) — auto-loads every session
├── README.md                  # humans + agents: what this repo is and how work runs (Part 3)
├── .claude/
│   └── skills/
│       ├── run/SKILL.md       # /run     — build the next roadmap item (Part 5)
│       ├── fix/SKILL.md       # /fix     — fix a bug or make a small product update
│       ├── feature/SKILL.md   # /feature — research → spec → plan → add to roadmap
│       ├── close/SKILL.md     # /close   — wave close: audits, full gates, recap, GO push
│       └── status/SKILL.md    # /status  — cheap "where are we" readout, no work
└── Docs/
    ├── STATE.md               # ≤60 lines. Where the project is RIGHT NOW. Rewritten, never appended.
    ├── ROADMAP.yaml           # the plan SSOT — waves, slices, statuses. Wins every conflict.
    ├── PROCESS.md             # the machine — how every slice and wave runs. ≤150 lines.
    ├── CONVENTIONS.md         # how things get written down. ≤60 lines.
    ├── INDEX.md               # the map — one question, one home. Read 2nd every session.
    ├── Specs/
    │   ├── Areas/             # one spec per subsystem (≤120 lines each) — living documents
    │   ├── Features/          # one spec per user-facing capability (≤120 lines each)
    │   └── ADRs/              # numbered decision records — append-only, superseded never deleted
    ├── Waves/
    │   └── TEMPLATE.md        # one record per slice: brief + gates + audit + proof, ONE file
    ├── Registers/
    │   ├── bugs.md            # defects. Every fix requires a regression test that fails without it.
    │   ├── open-items.md      # follow-ups, deferred work, ideas captured mid-wave
    │   └── deprecations.md    # dying code, each row with a named deletion trigger
    ├── Audits/                # cross-wave audit reports (slice-local audit proof lives in the wave file)
    ├── Lessons/               # durable distilled wisdom — one atomic file per lesson
    ├── Handoffs/              # session-continuity notes when a session ends mid-wave
    └── Archive/               # superseded docs, never deleted; CATALOG.md = one greppable line each
```

---

## PART 3 — Core docs (write these verbatim, filling placeholders)

### `README.md`

```markdown
# <Project name>

<One-paragraph plain-language description of the product.>

## How development runs here

This repo uses a docs-as-memory dev process (imported from the Praxis project). The agent's
operating rules live in `CLAUDE.md`; the full machine is `Docs/PROCESS.md`. The short version:

- **`Docs/ROADMAP.yaml`** is the plan. Work runs in **waves** made of **slices**.
- Four commands drive everything:
  - **`/feature <idea>`** — researches (if needed), writes a spec, plans it into the roadmap.
  - **`/run`** — builds the next runnable roadmap slice through the full lifecycle
    (build → deterministic gates → isolated audit → code review → prove-on-screen → record).
  - **`/fix <bug or tweak>`** — small corrective loop with a regression test and a register row.
  - **`/close`** — ends a wave: residue scan, fired deprecations executed, full test suite,
    code review of the wave diff, plain-language recap + a written click-by-click testing
    script for the operator, then push on the operator's GO.
- **`Docs/STATE.md`** always says where the project is (≤60 lines, rewritten in place).
- Defects, follow-ups, and dying code live as rows in `Docs/Registers/` — never in prose.
- Nothing is "done" until it's proven with real data on a real screen, and nothing is ever
  pushed without the operator's explicit GO.

New session? The agent reads `Docs/STATE.md`, then `Docs/INDEX.md`, and is fully caught up.
```

### `Docs/STATE.md`

```markdown
# STATE — where <project> is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** <date> (<one-line what just happened>)

## Position
- <Wave X ACTIVE — which slices are done / in flight / next, one bullet each.>

## Next
1. <The single next action.>
2. <Then this.>

## Standing decisions in force
<One line per binding operator decision, e.g. "no push without GO · done = real data on screen".>
```

### `Docs/ROADMAP.yaml`

```yaml
# ROADMAP — the single plan SSOT. Status here wins over every other document.
# status: pending | active | built | proven | closed | parked
# Every wave: sized to ONE agent session; ≥1 slice the operator can SEE working (operator_sees).
# Wave OPEN = ≤5-bullet plain-language briefing + operator approval.
# Wave CLOSE = /close only (full gates + audit + recap + testing script + operator GO).
version: 1
updated: <date>
mvp_finish_line: <plain-language definition of "the MVP is done" — a lookup, not a debate>

verify:   # the deterministic gate commands for THIS repo — /run and /close execute these
  typecheck: "<e.g. npm run typecheck>"
  lint: "<e.g. npm run lint>"
  test: "<e.g. npm test>"
  build: "<e.g. npm run build>"
  smoke: "<headless end-to-end script printing PASS/FAIL, once one exists>"

waves:
  - id: W1
    title: <plain-language wave title>
    status: pending
    operator_sees: <what the operator will literally see working when this wave closes>
    slices:
      - id: W1-1
        title: <slice title>
        status: pending
        summary: <2–3 lines: what this slice builds and why>
      - id: W1-H
        title: Hygiene slice (mandatory, every wave)
        status: pending
        summary: residue scan · execute fired deprecation triggers · reconcile registers/specs
```

### `Docs/PROCESS.md`

```markdown
# PROCESS — the machine

> How every unit of work runs. Four commands drive it; everything between is automatic.
> The operator touches a wave exactly three times: approve the plan · VERIFIED pass · GO the push.
> Hard cap 150 lines. Any process change is an edit to THIS file, never a new convention doc.

## The commands
- **/run** — pick the next runnable slice from ROADMAP.yaml and drive it through the lifecycle.
- **/fix** — corrective loop: register row → failing regression test → fix → gates → record.
- **/feature** — idea → (research) → spec → operator approval → slices added to ROADMAP.yaml.
- **/close** — wave close: hygiene + full suite + review + recap + runsheet + GO push.
- **/status** — read-only position report. Never does work.

## The slice lifecycle (🧑 = operator; everything else is automatic)

| # | Stage | What happens | Pass rule |
|---|---|---|---|
| 0 | SPEC | Draft `Waves/<id>.md` from TEMPLATE: goal, touched files/areas, verify plan | 🧑 approves only if scope is new/changed |
| 1 | BUILD | Work on a branch (`slice/<id>`), never directly on main. Follow existing patterns. Delegate heavy implementation to sub-agents; keep the main thread for triage + decisions | code complete on the branch |
| 2 | GATE | Deterministic checks BEFORE any judgment, from ROADMAP `verify:`: typecheck 0 · lint 0-new · tests green vs the recorded baseline · build 0 · smoke | all green or back to 1 |
| 3 | AUDIT | Isolated read-only audit sub-agent(s), sized to risk — additive/read-only change → 1 light auditor · mutating/schema/security-touching → fuller audit (2–3). The auditor gets ONLY the diff + the criteria, no history. Triage findings yourself; fix criticals; then a **delta re-audit** of just the fixes | 0 critical; every warning fixed or dispositioned in the wave file |
| 4 | REVIEW | `/code-review` on the slice diff (medium effort). Findings triaged like audit findings | criticals fixed; rest → register rows |
| 5 | MERGE | Merge the slice branch to main locally. **Never push** — pushing happens only at /close on 🧑 GO | — |
| 6 | PROVE | Real data through the user's actual path: UI slices = a headless browser script printing compact PASS/FAIL + a screenshot saved to the wave record (never interactive browser-driving through the agent); backend slices = a real end-to-end run/smoke. **Not proven = not done** | proof artifact recorded in the wave file |
| 7 | CLEAN | Code this slice replaced is DELETED in-slice, **or** gets a deprecations-register row with a named trigger. No third option | register or diff shows it |
| 8 | RECORD | Wave file closed · ROADMAP status flipped · STATE rewritten · every touched Spec updated to the new truth. **A slice that changed structure or behavior cannot close on stale specs** | all four done |

## The wave lifecycle
PLAN (operator approves a ≤5-bullet briefing) → slices run the lifecycle above →
**HYGIENE SLICE** (mandatory, below) → **/close** → 🧑 VERIFIED pass → push on 🧑 GO.
- Every wave has ≥1 slice the operator can SEE working (`operator_sees` in ROADMAP).
- Mid-wave ideas NEVER join the active wave — they become `Registers/open-items.md` rows
  (feature freeze). /feature turns them into future roadmap slices later.
- A session ending mid-wave writes `Handoffs/NNN-<date>-<slug>.md`: in-flight work, exact next
  actions, anything owed. At a wave boundary, STATE + the wave records ARE the handoff.

## The hygiene slice (every wave ends with one, no exceptions)
1. **Residue scan:** dead code nothing imports · one concept stored in two places · docs whose
   subject no longer exists · specs contradicting merged code · register rows gone stale.
   Output = a one-page report.
2. **Execute every deprecations row whose trigger fired this wave** — archive first where
   auditability requires it, then delete; the gate suite verifies nothing still imports it.
   Anything archived gets a one-line row in `Archive/CATALOG.md` in the same act.
3. Anything the scan found with no register row is a process failure — file it AND note how it
   escaped stage 7.
4. A wave **cannot close** with a fired trigger unexecuted or a scan finding unowned.

## Wave close (/close) — the full quality pass
1. Hygiene slice complete (above).
2. **Full gate suite, cache-free** — a gate that didn't RUN counts as FAILED. Record the new
   test-count baselines in the wave record.
3. **/code-review at high effort on the whole wave diff** (main vs the last pushed state).
4. Docs reconcile: ROADMAP statuses · STATE rewritten · specs current · registers clean.
5. **Operator deliverables, in plain language:** (a) a "what got done" recap mirroring the
   wave-open briefing, and (b) a **written human-testing script** — exact clicks, expected
   results — for every finished user-visible slice. That script IS the 🧑 VERIFIED pass.
6. Push ONLY on the operator's explicit GO after their VERIFIED pass.

## Standing rules
- Deterministic checks always run before agent judgment (cheaper, and they don't lie).
- Every /fix REQUIRES a regression test proven to fail without the fix.
- An audit/review finding is owned by a register row, never by memory. A recurring bug gets its
  `↻` count bumped — recurrence is a visible signal.
- Browser verification = headless scripts printing compact PASS/FAIL; screenshots to files.
  Never drive a browser interactively through agent context (token discipline).
- Sub-agent tiering: strongest model for coordination and audits/judgment; mid-tier for
  building; small models for mechanical scans and scripted sweeps.
- After 3 consecutive failures on the same step, stop and ask the operator rather than looping.
```

### `Docs/CONVENTIONS.md`

```markdown
# CONVENTIONS — how we write things down

> Hard cap 60 lines. Process questions belong in PROCESS.md, not here.

## Frontmatter (required on every Specs/, Waves/, Lessons/ file — four keys, no more)
---
title: <plain title>
type: area-spec | feature-spec | adr | wave-slice | lesson
status: draft | active | superseded | closed
updated: YYYY-MM-DD
---
ADRs add `supersedes:` / `superseded_by:` when applicable (lifecycle: draft → accepted → superseded).

## Naming
- Files: kebab-case; no dates in canonical spec filenames.
- ADRs: `ADR-NNNN-<slug>.md`, numbered, append-only.
- Wave records: `<wave>-<slice>-<slug>.md` (e.g. `W1-1-user-auth.md`).
- Handoffs: `NNN-YYYY-MM-DD-<slug>.md`; highest NNN is latest.
- Register IDs: `BUG-nnn` · `OI-nnn` · `DEP-nnn`, never reused.

## Write rules
1. STATE.md is rewritten, never appended. History lives in Handoffs and git.
2. One home per fact — check INDEX.md before writing; the second location gets a link, not a copy.
3. Supersede, don't delete: canonical docs get `status: superseded` + `superseded_by:` and move
   to `Archive/` with a CATALOG.md row. (Lessons that are simply wrong are deleted.)
4. Hard caps are edit triggers — a file over cap gets tightened, split, or archived in the same
   slice that overflowed it.
5. Registers own follow-ups — a finding, defect, or deferred deletion is a register row with an
   owner/trigger, never only prose.

## Caps
STATE 60 · PROCESS 150 · CONVENTIONS 60 · specs 120 each · wave records 150 · lessons one page.
```

### `Docs/INDEX.md`

```markdown
# Docs — the map

> One question → one home. Hard caps are binding.

| Question | The ONLY answer | Cap |
|---|---|---|
| Where are we right now? | [STATE.md](STATE.md) — rewritten in place, never appended | 60 lines |
| What's the plan and status? | [ROADMAP.yaml](ROADMAP.yaml) — wins every conflict | — |
| How does work run? | [PROCESS.md](PROCESS.md) — the machine | 150 lines |
| How do we write things down? | [CONVENTIONS.md](CONVENTIONS.md) | 60 lines |
| What is true about subsystem X? | `Specs/Areas/<area>.md` | 120 each |
| What is true about capability Y? | `Specs/Features/<feature>.md` | 120 each |
| Why did we decide Z? | `Specs/ADRs/` — numbered, append-only | — |
| What happened in a unit of work? | `Waves/<wave>-<slice>.md` — brief + gates + audit + proof, ONE file | 150 each |
| What's broken / owed / dying? | `Registers/` — bugs · open-items · deprecations | — |
| What did a cross-wave audit find? | `Audits/` — dated reports; follow-ups → register rows | — |
| What did we learn (durable)? | `Lessons/` — one atomic file per lesson | — |
| Session continuity mid-wave | `Handoffs/` — dated; highest number = latest | — |
| Superseded anything | `Archive/` + one-line row in `Archive/CATALOG.md` | — |

## Boot ritual (every session)
1. Read `STATE.md`. 2. Read `ROADMAP.yaml` for the active wave. 3. Open only what those point
at; grep `Docs/**` for anything else. Never front-load the tree.
```

### `Docs/Registers/bugs.md`

```markdown
# Bugs — the defect register

> Observed defects. Every fix REQUIRES a regression test proven to fail without it.
> `↻` = recurrence count; a bug that comes back is a visible signal, not a memory.

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|

## Closed
(move rows here when fixed — keep the full row as the audit trail)
```

### `Docs/Registers/open-items.md`

```markdown
# Open items — follow-ups, deferred work, captured ideas

> Every row has an owner (a wave/slice) or a trigger. Mid-wave ideas land HERE, never in the
> active wave. /feature promotes rows into roadmap slices.

| ID | Item | Why deferred / context | Owner or trigger | Status |
|---|---|---|---|---|
```

### `Docs/Registers/deprecations.md`

```markdown
# Deprecations — dying code and data

> Anything superseded-but-not-yet-deleted. Each row names a TRIGGER (an event, not a date).
> The wave-close hygiene slice EXECUTES every row whose trigger has fired — a wave cannot
> close with a fired trigger unexecuted.

| ID | What dies | Replaced by | Deletion trigger | Status |
|---|---|---|---|---|
```

### `Docs/Waves/TEMPLATE.md`

```markdown
---
title: <Wave-Slice — plain title>
type: wave-slice
status: draft
updated: YYYY-MM-DD
---

# <ID> — <title>

## Brief
- **Goal:** <what exists when this is done, in one sentence>
- **Touches:** <files/areas this slice may modify — its declared territory>
- **Out of scope:** <explicitly not this slice>
- **Verify plan:** <which gates + what the PROVE will show on screen>

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | | |
| lint | | |
| tests (baseline: <n> passing) | | |
| build | | |
| smoke | | |

## Audit (stage 3)
- Auditors: <1 light / 2–3 full — why this sizing>
- Findings: <critical: … / warnings: … / dispositions>
- Delta re-audit: <result after fixes>

## Review (stage 4)
- /code-review findings + dispositions.

## Proof (stage 6)
- <PASS/FAIL script output line + screenshot path or run transcript reference>

## Clean (stage 7)
- <what was deleted, or the DEP-row filed>

## Decisions
- <any decision made inside this slice worth remembering; big ones become ADRs>
```

### `Docs/Specs/ADRs/ADR-0001-dev-process-adopted.md`

```markdown
---
title: ADR-0001 — Docs-as-memory dev process adopted
type: adr
status: accepted
updated: <date>
---

# ADR-0001 — Docs-as-memory dev process adopted

**Decision:** This project runs the wave/slice dev process defined in `Docs/PROCESS.md`
(imported from the Praxis project's process kit). ROADMAP.yaml is the plan SSOT; no work is
"done" without gates + audit + on-screen proof; nothing is pushed without operator GO.

**Context:** Solo non-technical operator + AI agent build. The process externalizes all project
memory into `Docs/` so any fresh session is fully operational after reading STATE + INDEX.
```

### `Docs/Archive/CATALOG.md`

```markdown
# Archive catalog — one line per archived item. Grep here, never re-scan the tree.
# Format: `path` — what/why archived — keywords — superseded-by
```

---

## PART 4 — `CLAUDE.md` (the agent's memory file, repo root)

```markdown
# <Project> — agent core

> Always-on memory. Keep ≤100 lines. Detail lives in `Docs/` and loads on demand.

## Operator
Non-technical solo founder. **Plain language, every response** — lead with outcomes and
scenarios, no jargon; frame trade-offs by outcome, not implementation. Protect against decision
fatigue: triage findings yourself, surface ONE strategic call at a time as a flat numbered
yes/no list with one-line context; give a recommendation, not a survey. MVP budget discipline:
defer material spend; separate free-now from paid-later.

## RULE — find before you load (every session)
1. Read `Docs/STATE.md` — where the project is. Never trust memory for status.
2. Read `Docs/INDEX.md` — the map. Open only what it points at; grep for the rest.
3. `Docs/ROADMAP.yaml` is the SSOT on any conflict.

## How work runs
- The machine is `Docs/PROCESS.md`. Commands: /run · /fix · /feature · /close · /status.
- Work on branches (`slice/<id>`), merge locally at slice close. **NEVER push without the
  operator's explicit GO** (given only at /close after their VERIFIED pass).
- Deterministic gates (typecheck/lint/test/build from ROADMAP `verify:`) run BEFORE any agent
  judgment, every slice. A gate that didn't run counts as failed.
- Every slice ends with an isolated read-only audit sized to risk (additive → 1 light check;
  mutating/schema/security → 2–3 auditors) plus /code-review on the diff. You triage findings;
  fix criticals + warnings; delta re-audit the fixes. "I reviewed it myself" never substitutes.
- Done = real data on a real screen (or a real passing end-to-end run), proof recorded in the
  wave file. Browser checks = headless scripts printing compact PASS/FAIL, screenshots to
  files — never interactive browser-driving through agent context.
- Eliminate-old-as-you-build: superseded code is deleted in-slice or gets a deprecations row
  with a named trigger. Never delete-first, never leave residue untracked.
- Feature freeze: mid-wave ideas → `Docs/Registers/open-items.md`, never the active wave.

## Write discipline
- STATE.md: REWRITE in place (≤60 lines), never append. Status lives nowhere else.
- One file per slice in `Docs/Waves/` (brief + gates + audit + proof together).
- Follow-ups/defects/dying code → a `Docs/Registers/` row, never prose-only.
- Specs are living: a slice changing structure/behavior updates the touched spec INSIDE the
  slice — it cannot close on stale specs. Superseded docs → `Archive/` + CATALOG row.
- New durable lesson → one atomic file in `Docs/Lessons/`.

## Sub-agent discipline
- Delegate heavy implementation/diagnosis to sub-agents; keep the main thread for triage +
  decisions. Model-tier every spawn: top tier = coordination/audit judgment · mid = builders ·
  small = mechanical scans. Sub-agents return compact structured reports, never transcripts.
- Hand off EARLY at a clean boundary (write a Handoff file) rather than riding context to the
  ceiling. After 3 consecutive failures on one step, stop and ask.
```

---

## PART 5 — The command skills (`.claude/skills/<name>/SKILL.md`)

### `.claude/skills/run/SKILL.md`

```markdown
---
name: run
description: Build the next runnable roadmap slice through the full lifecycle (gates, audit, review, prove, record). Use when the operator says /run or asks to continue the roadmap.
---

# /run — advance the roadmap

1. **Boot:** read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, and `Docs/Registers/*.md`. Identify the
   active wave and the next runnable slice (first `pending`/`active` slice with no unmet
   dependency). If a Handoff newer than STATE exists, honor it.
2. **Wave open (if no wave is active):** give the operator a ≤5-bullet plain-language briefing
   of the next wave and get approval before any code. Sweep the registers: every row naming
   this wave is claimed by a slice or explicitly re-homed.
3. **Slice spec (stage 0):** draft `Docs/Waves/<id>-<slug>.md` from TEMPLATE. Ask the operator
   only if scope is new or changed from the roadmap entry; otherwise proceed.
4. **Build (stage 1):** branch `slice/<id>`. Follow existing project patterns. Delegate heavy
   implementation to sub-agents with compact briefs; you triage and integrate.
5. **Gates (stage 2):** run every command in ROADMAP `verify:` — typecheck 0, lint 0-new, tests
   green vs the recorded baseline, build 0, smoke. All green or return to stage 1. Record
   results in the wave file.
6. **Audit (stage 3):** spawn isolated read-only auditor(s) sized to risk with ONLY the diff +
   criteria. Triage; fix criticals + warnings; delta re-audit the fixes. Record in the wave file.
7. **Review (stage 4):** run /code-review (medium) on the slice diff; triage the same way.
8. **Merge (stage 5):** merge to main locally. NEVER push.
9. **Prove (stage 6):** exercise the real user path — headless PASS/FAIL script + screenshot
   for UI; real end-to-end run for backend. Record the proof. Not proven = not done.
10. **Clean + record (stages 7–8):** delete superseded code or file a DEP row; flip ROADMAP
    status to `proven`; rewrite STATE; update touched specs; close the wave file.
11. **Report** in plain language: what got built, what the operator can see, what's next. If
    this was the wave's last content slice, say the wave is ready for `/close`.
```

### `.claude/skills/fix/SKILL.md`

```markdown
---
name: fix
description: Fix a bug or make a small product update through a corrective loop with a regression test and register row. Use when the operator says /fix or reports something broken or wanted-changed.
---

# /fix — bug fix or small product update

1. Read `Docs/STATE.md` + `Docs/Registers/bugs.md`. If the report matches an existing row,
   bump its `↻` count (recurrence is a signal). Otherwise file a new BUG row (or an OI row if
   it's an update, not a defect) BEFORE touching code.
2. **Scope check:** if this is really a feature in disguise (new capability, schema change,
   >~1 session of work), stop and tell the operator it should go through /feature instead.
3. Reproduce and diagnose. State the root cause in the register row, not just the symptom.
4. **Regression test first:** write a test that FAILS without the fix. No fix merges without one.
5. Fix on branch `fix/<id>`, minimal blast radius, following existing patterns.
6. Run the full ROADMAP `verify:` gate set. For risky/mutating fixes add 1 light audit pass.
7. Prove the fix at the user level (the same path the operator saw it break on) — PASS/FAIL
   script or screenshot evidence.
8. Merge locally; move the register row to Closed with the proof reference; rewrite STATE if
   position changed. NEVER push — fixes ride the next /close.
9. Report plainly: what was broken, why, what proves it's fixed.
```

### `.claude/skills/feature/SKILL.md`

```markdown
---
name: feature
description: Take a new feature idea through research (if needed), a written spec, operator approval, and planning into the roadmap. Use when the operator says /feature or proposes new capability.
---

# /feature — idea → spec → roadmap

1. Read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/Registers/open-items.md` (the idea may
   already be a row), and any touched `Docs/Specs/` files.
2. **Clarify with the operator in plain language** (max 3–5 questions): what problem, for whom,
   what does success look like on screen. No jargon.
3. **Research only if genuinely unfamiliar** (new subsystem, external API, architecture
   question): spawn a read-only research sub-agent, findings only. If findings contradict the
   idea's assumptions, surface that FIRST — one plain-language call.
4. **Spec:** write/update `Docs/Specs/Features/<feature>.md` (≤120 lines, CONVENTIONS
   frontmatter): what it does, how it behaves at the edges, what it explicitly does NOT do,
   which Areas it touches. Architecture-shaping choices become an ADR.
5. **Plan:** break into slices sized ≤1 session each, every wave keeping ≥1 operator-visible
   slice. Present the operator a briefing: what they'll see, rough effort, where it slots
   (this wave never — feature freeze; next wave or later), any ONE strategic trade-off as a
   flat yes/no.
6. On approval: add slices to `Docs/ROADMAP.yaml` (status `pending`), close/link the OI row,
   set spec `status: active`. Do NOT start building — /run picks it up in its wave.
7. Report: the spec path, where it landed in the roadmap, what /run will do first.
```

### `.claude/skills/close/SKILL.md`

```markdown
---
name: close
description: Close the active wave — hygiene slice, full cache-free gate suite, high-effort code review of the wave diff, docs reconcile, plain-language recap + human-testing script, then push on operator GO.
---

# /close — wave close (the full quality pass)

0. Preconditions: every content slice of the wave is `proven` in ROADMAP.yaml. If not, list
   what's unfinished and stop.
1. **Hygiene slice** (a real slice with its own wave file):
   - Residue scan: dead code nothing imports · duplicated concepts · docs/specs contradicting
     merged code · stale register rows. One-page report.
   - Execute every `Registers/deprecations.md` row whose trigger fired this wave (archive
     first where auditability requires, then delete; CATALOG row in the same act).
   - File any scan finding that has no register row + note how it escaped stage 7.
   - A wave CANNOT close with a fired trigger unexecuted or a finding unowned.
2. **Full gate suite, cache-free** — every ROADMAP `verify:` command actually runs; a gate that
   didn't run counts as failed. Record new test-count baselines in the hygiene record.
3. **/code-review at high effort** on the whole wave diff (main vs last pushed state). Triage;
   criticals fixed now + delta re-audit; the rest become register rows.
4. **Docs reconcile:** ROADMAP statuses true · STATE rewritten · touched specs current ·
   registers clean · wave files closed.
5. **Operator deliverables (plain language):**
   - "What got done" recap mirroring the wave-open briefing.
   - A **written human-testing script** — exact clicks and expected results for every finished
     user-visible slice. This IS their VERIFIED pass; walk them through it.
6. On the operator's VERIFIED + explicit **GO**: push. Flip the wave to `closed`, rewrite
   STATE with the next wave's position. Without GO, everything stays local.
```

### `.claude/skills/status/SKILL.md`

```markdown
---
name: status
description: Read-only position report — where the project is, what's in flight, what's next. Never does work. Use when the operator says /status or asks where things stand.
---

# /status — where are we

Read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/Registers/*.md`, and the newest Handoff if
one postdates STATE. Report in plain language, ≤10 lines: current wave + done/in-flight/next
slices · open bugs worth knowing · anything owed to or from the operator · the exact next
command to run. Make NO changes.
```

---

## PART 6 — Suggested extra workflows (adopt when the project grows into them)

- **/handoff** — when a session must end mid-wave: write `Docs/Handoffs/NNN-<date>-<slug>.md`
  (in-flight work, exact next actions, anything owed) so the next session resumes cold. Until
  then, ending at slice boundaries + STATE covers it.
- **Parallel lanes** — Praxis runs 2–3 concurrent worktree lanes with a lane board register and
  a coordinator that never lets lanes self-merge. Skip this until slices are reliably
  independent and single-lane throughput actually hurts; then import `Registers/lanes.md` +
  worktree discipline from Praxis.
- **Periodic deep audit** — every few waves, a read-only cross-wave audit (report →
  `Docs/Audits/`, follow-ups → register rows) checking that claimed-done components still hold
  up in code. Praxis also runs a **readiness gate** at wave open: verify in code everything the
  new wave BUILDS ON before spawning work — cheap insurance against building on sand.
- **Dashboard** — once the roadmap has >3 waves, a small script rendering ROADMAP.yaml to an
  HTML dashboard gives the operator a glanceable picture (Praxis: `scripts/roadmap-dashboard.mjs`).

*End of kit.*
