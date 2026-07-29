# AIdioma — agent core

> Always-on memory. Keep <=100 lines. Detail lives in `Docs/` and loads on demand.
> AIdioma is a Spanish-learning app: a chat-centric practice panel that grades typed answers
> for free (AI only on a miss) and keeps re-serving your weak items until you master them.

## Operator
Non-technical solo founder (Mike). **Plain language, every response** — lead with outcomes and
scenarios, no jargon; frame trade-offs by outcome, not implementation. Protect against decision
fatigue: triage findings yourself, surface ONE strategic call at a time as a flat numbered
yes/no list with one-line context; give a recommendation, not a survey. MVP budget discipline:
defer material spend; separate free-now from paid-later. Mike runs parallel agent sessions —
coordinate through files (this repo's `Docs/` + `content/`), never assume shared chat memory.

## RULE — find before you load (every session)
1. Read `Docs/STATE.md` — where the project is. Never trust memory for status.
2. Read `Docs/INDEX.md` — the map (including current authorities). Open only what it
   points at; grep for the rest.
3. `Docs/ROADMAP.yaml` is the SSOT on any conflict.

## Two lanes (see ROADMAP.yaml)
- **Lane A (App)** — greenfield Next.js (Vercel + Neon + Clerk). V1/V2 are read-only reference.
  A0/A1 are closed; **A2 evaluation** has both slices proven, with an unapproved concurrent
  publication retained under the inferred harden-forward direction; distributed abuse/cost proof blocks close.
- **Lane C (Content)** — lesson authoring; working records in `/content`. **C2 is active**:
  a1-04 is L2-passed and a1-05 is next.
- Only one wave per lane is active at a time. The lanes coordinate via files.
- The **App Design Coordinator role has final approval over the lesson schema** (v1-FROZEN,
  additive-only); rulings are logged in `Docs/Registers/schema-proposals.md`.

## How work runs
- The machine is `Docs/PROCESS.md`. Commands: /run · /fix · /feature · /close · /status.
- Work on branches (`slice/<id>`), merge locally at slice close. **NEVER push without the
  operator's explicit GO** (given only at /close after their VERIFIED pass).
- Deterministic gates (from ROADMAP `verify:` — per lane) run BEFORE any agent judgment, every
  slice. A gate that didn't run counts as failed. Both lanes now have live commands.
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
- STATE.md: REWRITE in place (<=60 lines), never append. Status lives nowhere else.
- One file per slice in `Docs/Waves/` (brief + gates + audit + proof together).
- Follow-ups/defects/dying code → a `Docs/Registers/` row, never prose-only.
- Specs are living: a slice changing structure/behavior updates the touched spec INSIDE the
  slice — it cannot close on stale specs. Superseded docs → `Archive/` + CATALOG row.
- Don't duplicate authorities listed in INDEX: cross-link them, don't copy their facts.
- New durable lesson → one atomic file in `Docs/Lessons/`.

## Sub-agent discipline
- Delegate heavy implementation/diagnosis to sub-agents; keep the main thread for triage +
  decisions. Model-tier every spawn: top tier = coordination/audit judgment · mid = builders ·
  small = mechanical scans. Sub-agents return compact structured reports, never transcripts.
- Content-lane sub-agents use the model/routing policy in the current content handoff, one agent
  per lesson, outputs under `content/`, and return short distilled summaries.
- Hand off EARLY at a clean boundary (write a Handoff file) rather than riding context to the
  ceiling. After 3 consecutive failures on one step, stop and ask.
