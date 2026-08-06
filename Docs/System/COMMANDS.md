---
schema_version: 3
generated_from: System/system.md
updated: 2026-08-05
---

# Commands

Command key for agents and the dashboard. Process detail lives in `System/system.md`.

**Staging:** hand-edited until the `/system` generator ships, then locked as a build artifact.

## Lifecycle — mutates phase state, touches git, gated

| Cmd | When | Does | Must not |
|---|---|---|---|
| `/plan` | New work not on the Roadmap | Create a phase file; name the complexity cost; cut/defer is a valid outcome | Write product code; build unconsumed foundations |
| `/run` | Start or resume the one active phase | Execute the phase outcome; commit on the phase branch | Merge; expand scope horizontally; continue past a broken contract |
| `/close` | Phase complete | Three checks → commit/PR → merge exact head → clean `main`; stop phase-owned servers | Merge on FAIL; expand scope silently; delete anything in `PRESERVE.md` |
| `/ship` | Promote to production | Deploy production; append to `RELEASES.md` | Ship on a red check, an open FAIL, or a contested spec |

`/close --abandon` records `lessons:`, deletes the branch, no merge.
`/close --dry-run` runs the three checks, changes nothing, writes findings to `FIXES.yaml` and `Backlog.md`.

## Action — one unit of work, one artifact, no phase advance

| Cmd | Produces | Fires when | Must not |
|---|---|---|---|
| `/research` | `Research/R-*.md` + optional decision | A choice between ≥2 external options blocks progress | Commit code; end without a verdict |
| `/design` | Decisions and/or a spec | Behavior is undefined, or ≥3 decisions are open | Change app behavior; decide more than three things at once |
| `/fix` | Patch + proof + `FIXES.yaml` entry | Defect is bounded and needs no design | Stretch into design work — that goes to `Backlog.md` |

## Utility — safe anytime, cannot damage state

| Cmd | Does | Must not |
|---|---|---|
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

## Rules

- **Audited main** — nothing merges without the three close checks. `/close` runs them for a phase; a standalone `/fix` runs them in reduced form.
- **One active phase** — one branch, one worktree.
- **Implementation work never happens without a phase.**
- Utility commands are cheap to add. Lifecycle commands are not. New verbs default to utility.
