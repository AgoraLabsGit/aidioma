---
schema_version: 3
generated_from: System/system.md
updated: 2026-08-06
---

# Commands

Command key for agents and the dashboard. Process detail lives in `System/system.md`.

**Staging:** hand-edited until the `/system` generator ships, then locked as a build artifact.

## Lifecycle — mutates phase state, touches git, gated

| Cmd | When | Does | Must not |
|---|---|---|---|
| `/plan` | New work not on the Roadmap | Create a phase file; name the complexity cost; cut/defer is a valid outcome; may promote a `WORK.yaml` proposal | Write product code; build unconsumed foundations |
| `/run` | Start or resume the one active phase | Execute the phase outcome; commit on the phase branch | Merge; expand scope horizontally; continue past a broken contract |
| `/close` | Phase complete | Three checks → commit/PR → merge exact head → clean `main`; stop phase-owned servers | Merge on FAIL; expand scope silently; delete anything in `PRESERVE.md` |
| `/ship` | Promote to production | Deploy production; append to `RELEASES.md` | Ship on a red check, an open FAIL, or a contested spec |

`/close --cancel` records `lessons:`, deletes the branch, no merge.
`/close --dry-run` runs the three checks, changes nothing, writes findings to `WORK.yaml`.

## Action — one unit of work, one artifact, no phase advance

| Cmd | Produces | Fires when | Must not |
|---|---|---|---|
| `/research` | `Research/R-*.md` + optional decision; may upsert Work `kind: research` | A choice between ≥2 external options blocks progress | Commit code; end without a verdict |
| `/design` | Decisions and/or a spec | Behavior is undefined, or ≥3 decisions are open | Change app behavior; decide more than three things at once |
| `/fix` | Patch + proof + `WORK.yaml` `kind: fix` (`active`→`done`) | Defect is bounded and needs no design | Stretch into design — `/log` as `proposal` or `/plan` |
| `/task` | Patch/docs + proof + `WORK.yaml` `kind: task` (`active`→`done`) | Intentional small work, not a defect, not phase-sized | Stretch into a proposal/phase |

## Utility — safe anytime, cannot damage state

| Cmd | Does | Must not |
|---|---|---|
| `/log` | Park an item in `WORK.yaml` (auto-classify kind; ask once if ambiguous) | Implement the work |
| `/triage` | Sort open Work: do / plan / drop / leave — updates statuses only | Implement product changes |
| `/status` | Print a brief: active phase, git, runtime, suggested next command; refresh `context.json` | Change any authored file |
| `/check` | Run tests and lint | Fix what it finds |
| `/launch` | Stop stale app servers, start the app | Touch production |
| `/dashboard` | Stop stale dashboard servers, start the dashboard | Run in production |
| `/handoff` | Overwrite `Handoffs/HANDOFF.md` | Commit, PR, or merge |

`/status --repair` reconciles phase state against git and cleans orphans.

## Meta

| Cmd | Does | Must not |
|---|---|---|
| `/system` | Edit the framework: `System/` files, templates, schemas, command definitions | Run while a phase is active; write outside `System/`; touch product code |

## Intent routing (plain language)

The user should never need slash commands. Map and act; report the command + id.

| User says / implies | Fire |
|---|---|
| Broken / wrong behavior, do now | `/fix` |
| Small intentional chore, do now | `/task` |
| Later / park / remember this | `/log` |
| Sort the Work pile | `/triage` |
| Which option? | `/research` |
| How should X behave? | `/design` |
| Big idea / needs a phase | `/log` `proposal` or confirm `/plan` |
| Unclear what we want | `/log` `question` |
| Where are we? | `/status` |
| Push live | `/ship` |

**One coordinator** owns the phase thread and Work routing. Prefer sub-agents for bounded noisy jobs (implement one fix/task, execute `/log`/`/triage` batches, farm evidence) — not for every micro-edit.

## Rules

- **Audited main** — nothing merges without the three close checks. `/close` runs them for a phase; standalone `/fix`/`/task` run them in reduced form.
- **One active phase** — one branch, one worktree.
- **Implementation work** needs a phase, except bounded `/fix`/`/task`.
- Utility commands are cheap to add. Lifecycle commands are not. New verbs default to utility.
- **Work ≠ Signals** — `WORK.yaml` is authored; dashboard Signals are derived health only.
