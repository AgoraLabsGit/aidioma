---
schema_version: 3
generated_from: System/system.md
updated: 2026-08-06
---

# Commands

Thin key. Detail: `System/system.md`. Staging: hand-edited until `/system` generator ships.

## Lifecycle — gated

| Cmd | When | Does | Must not |
|---|---|---|---|
| `/plan` | New work not on Roadmap | Phase file; MCOO; may promote Work proposal | Product code; unconsumed foundations |
| `/run` | Start/resume the one active phase | Execute outcome; commit on phase branch | Merge; silent scope expand |
| `/close` | Phase complete | Phase `/triage` first, then Proof/Scope/Publish → PR → merge | Merge on FAIL; skip phase triage; delete `PRESERVE.md` items |
| `/ship` | Promote to production | Deploy + `RELEASES.md` | Ship on red check / open FAIL / contested spec |

`/close --cancel` → `canceled`, no merge. `/close --dry-run` → three checks, findings → `WORK.yaml`.

## Action — one unit, one artifact

| Cmd | Produces | Fires when | Must not |
|---|---|---|---|
| `/research` | `Research/R-*.md` + optional decision | ≥2 external options block progress | Commit code; end without verdict |
| `/design` | Decisions and/or a spec | Behavior undefined or ≥3 decisions open | Change app behavior silently |
| `/fix` | Patch + proof + Work `fix` + `done_summary` | Bounded defect | Stretch into design |
| `/task` | Patch/docs + proof + Work `task` + `done_summary` | Small intentional chore | Stretch into phase |
| `/audit` | Findings + Work `audit` + `done_summary` | Scoped review (feature/area/spec/agent-context/process) | Replace `/close` merge gate |

## Utility

| Cmd | Does | Must not |
|---|---|---|
| `/log` | Park Work row (`open`); classify kind | Implement |
| `/triage` | Optional `[PHASE\|area\|feature]`; if phase active/named → **sub-agent, that `phase:` only**; auto-do clear `/fix`/`/task`; confirm drop/plan; ask→`open_questions` | Mix other phases / `phase: null` into a phase pass |
| `/status` | Brief + refresh `context.json` | Edit authored files |
| `/check` | Tests/lint | Fix findings |
| `/launch` | App dev server | Production |
| `/dashboard` | Dashboard server | Production |
| `/handoff` | Overwrite `HANDOFFS/HANDOFF.md` | Commit/PR/merge |

## Meta

| Cmd | Does | Must not |
|---|---|---|
| `/system` | Edit `Docs/System/`; context-budget caps | Run while phase `active` (unless phase outcome); write outside System/; product code |

## Intent routing

| User says | Fire |
|---|---|
| Broken / wrong behavior | `/fix` |
| Small chore now | `/task` |
| Park / later | `/log` |
| Triage Work / "triage Devsystem" | `/triage` |
| Audit X | `/audit` |
| Which option? | `/research` |
| How should X behave? | `/design` |
| Phase-sized idea | `/log` `proposal` or confirm `/plan` |
| Where are we? | `/status` |
| Push live | `/ship` |

Report command + id. Ask once if class ambiguous. Always cite Work/phase as `W-015 — Parallel active phases` (id + summary).

**Classifier:** `fix` broken · `task` one-session chore · `proposal` needs `/plan` · `research` options · `question` standalone uncertainty · `audit` review. Clarifications append `open_questions` on the target row — never a new `question` row for the same item.

**Coordinator** owns phase + Work routing. Delegate bounded `/fix`/`/task`/`/audit`/`/triage` batches to sub-agents.
