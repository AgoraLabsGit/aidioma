---
schema_version: 3
generated_from: Docs/System/system.md
---

# Agent contract

**Staging:** hand-edited until the `/system` generator ships, then locked.
Detail: `Docs/System/system.md`. Command key: `Docs/System/COMMANDS.md`.

## Boot

1. Read `.work/context.json` first.
2. Know the command map (below). Prefer plain-language routing over asking the user for a slash.
3. Before editing a file — load the owning spec. Never invent one.
4. Before choosing among ≥2 external options — `/research`.
5. Lifecycle (`/plan` `/run` `/close` `/ship`) — confirm first. Action/utility — act.
6. ≤3 consequential decisions per checkpoint.
7. After any command — append one `.work/activity/YYYY-MM.jsonl` event. Never edit past events.
8. Cite Work/phases as **`W-015 — Parallel active phases`** (id + one-line summary). Never bare ids.

## Commands (fit)

| Class | Commands |
|---|---|
| Lifecycle | `/plan` `/run` `/close` `/ship` |
| Action | `/research` `/design` `/fix` `/task` `/audit` |
| Utility | `/log` `/triage` `/status` `/check` `/launch` `/dashboard` `/handoff` |
| Meta | `/system` (blocked while a phase is `active`, unless phase outcome amends System) |

| Intent | Fire |
|---|---|
| Broken behavior | `/fix` |
| Small chore | `/task` |
| Park / later | `/log` |
| Clear the Work queue / "triage Devsystem" | `/triage` |
| Review a scope | `/audit` |
| Which option? | `/research` |
| How should X behave? | `/design` |
| Phase-sized now | confirm `/plan` |
| Where are we? | `/status` |

Report: *"Logged T-001 (task) — summary."* Ask once if kind ambiguous, then act.
New Work ids: `F/T/P/R/Q/A-nnn` by kind; legacy `W-*` kept (never rename).

## Work kinds

| Kind | Id | Use when |
|---|---|---|
| `fix` | `F-` | Broken / wrong behavior |
| `task` | `T-` | One-session intentional chore |
| `proposal` | `P-` | Needs `/plan` (phase-sized) |
| `research` | `R-` | Options choice |
| `question` | `Q-` | Standalone parked uncertainty (no target row) |
| `audit` | `A-` | Scoped review |

**Clarifications** while executing a row → ask founder → append `open_questions` on **that** row.
Do **not** create a new `question` Work item for the same concern.
On `done`, set `done_summary` (what shipped + evidence pointers).

## `/triage`

Filters: phase id · area · feature. Classify: do / blocked / plan / drop / leave.
**Auto-execute** clear `/fix`/`/task` via sub-agents. **Confirm** only drop/`/plan`/lifecycle.
Clarifications → `open_questions` on that row.

**Phase-scoped:** If a phase is active (or `/triage PHASE-nnn`), **spawn a sub-agent** that only
considers open/active Work with `phase: <that id>`. Do not mix in `phase: null` or other phases.

**Close hygiene:** `/close` runs that phase-scoped `/triage` **before** audits, code review, or tests.

## Coordinator + sub-agents

One coordinator owns phase outcome + Work routing. Delegate bounded `/fix` `/task` `/audit` and
**phase-scoped `/triage`** batches to sub-agents. Sub-agents return summary + ids; coordinator
updates `WORK.yaml`.

## Never load

`.work/activity/**` · closed phase bodies · full decision log · unrelated specs · frozen legacy roots

## Homes

Specs = behavior. Decisions = why. Research = options. Phases = temporary. Work = authored ledger.
Signals = derived health only. No folder outside `system.md` layout.
