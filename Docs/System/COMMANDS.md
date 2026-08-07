---
schema_version: 3
generated_from: System/system.md
updated: 2026-08-07
---

# Commands

Thin key. Detail: `System/system.md`. Staging: hand-edited until `/system` generator ships.

## Lifecycle — gated

| Cmd | When | Does | Audit / proof | May invoke |
|---|---|---|---|---|
| `/plan` | New work not on Roadmap | Phase file; MCOO; may promote Work proposal | Contract named; Adv optional if contested | `/research` (if options open); `/log` |
| `/run` | Start/resume the one active phase | Execute outcome; commit on phase branch | Start phase `/triage`; proof + seams; Adv at `/close` | `/triage`, `/research`, `/design`, `/fix`, `/task`, `/audit`, `/check`, `/log`, `/status`, `/handoff`, `/launch`, `/dashboard` |
| `/close` | Phase complete | Triage → `/check` → Proof/Scope/Publish → PR → merge | Nested lenses + Adv claims; `/check` required | `/triage`, `/check`, `/audit`, Bugbot/security/code-review helpers |
| `/ship` | Promote to production | Deploy + `RELEASES.md` | Preconditions incl. last `/check` green | `/check` |

`/close --cancel` → `canceled`, no merge. `/close --dry-run` → triage + `/check` + three checks, findings → `WORK.yaml`.

**Must precede:** `/plan` and `/design` review relevant `Research/R-*` (run `/research` first if options are open) before locking a phase or decisions.

## Action — one unit, one artifact

| Cmd | Produces | Audit / proof | May invoke |
|---|---|---|---|
| `/research` | `Research/R-*.md` + optional decision | **Required Adv** + verdict | Adv sub-agent; optional `/design` if behavior locks |
| `/design` | Decisions and/or a spec | Review Research first; **Required Adv** | `/research` if missing; Adv sub-agent |
| `/fix` | Patch + proof + Work `fix` + `done_summary` | Required proof; [reduced-close.md](reduced-close.md) if publishing | `/check` before publish; optional `/audit`; `/log`/`/plan` if stretches |
| `/task` | Patch/docs + proof + Work `task` + `done_summary` | Required proof (light); [reduced-close.md](reduced-close.md) if publishing | `/check` before publish; optional `/audit`; `/log`/`/plan` if stretches |
| `/audit` | Findings + Work `audit` + `done_summary` | Is the audit (not merge gate) | Review sub-agent |

## Utility

| Cmd | Does | Audit / proof | May invoke |
|---|---|---|---|
| `/log` | Park Work row (`open`); classify kind | none | — |
| `/triage` | Sub-agent batch; auto `/fix`/`/task`; confirm drop/plan | none as gate | `/fix`, `/task`; unassigned batch → `/check`, optional `/audit` |
| `/status` | Brief + refresh `context.json` | none | — |
| `/check` | Path-aware tests/lint; record `last_check` | Is the test run; must not fix | — |
| `/launch` | App dev server | none | — |
| `/dashboard` | Ensure Docs home (`.worktrees/docs`); project that tree (else D-018 primary+overlay) | none | — |
| `/handoff` | Overwrite `Handoffs/HANDOFF.md` | none | — |

**Triage mode:** Inside `/run` / active phase → that phase’s Work only (implicit). No active phase → unassigned (`phase: null`) batch.

## Meta

| Cmd | Does | Audit / proof | May invoke |
|---|---|---|---|
| `/system` | Edit `Docs/System/`; context-budget caps | Adv when amending audit/close/merge rules | `/check` (work lane) |

## Protocols (executable)

| Protocol | When | Home |
|---|---|---|
| **Required Adv** | `/research`, `/design`, `/close` claims | [`adv-protocol.md`](adv-protocol.md) |
| **MCOO** | `/plan` (cheap) · `/close` Scope (binding FAIL list) | [`mcoo-checklist.md`](mcoo-checklist.md) |
| **Path → lens** | `/close` Proof (conditional) | [`path-lens-map.md`](path-lens-map.md) |
| **Reduced close** | Standalone `/fix` `/task` publish | [`reduced-close.md`](reduced-close.md) |

## Close lenses (nested under Proof / Scope / Publish)

| Lens | Gate | When |
|---|---|---|
| Outcome evidence | Proof | always |
| Adversarial phase claims | Proof | always |
| Security / privacy / a11y / AI tokens / perf / migration | Proof | path-triggered — [`path-lens-map.md`](path-lens-map.md) |
| path→spec | Scope | always (computed) |
| MCOO | Scope | always |
| Seams / composability | Scope | build with code; broader every ~2–3 caps |
| Code quality | Scope | code in diff |
| Publish hygiene + started CI | Publish | always |

## `/check` lanes

| Lane | Paths | Scripts |
|---|---|---|
| work | `Docs/**`, skills, derive, dashboard | `work:typecheck` → `work:test` → `work:validate` |
| app | `apps/web/**`, packages | `app:typecheck` → `app:lint` → `app:test` |
| content | `content/**`, tooling/content | `content:typecheck` → `content:validate` (+ fixtures/smoke as needed) |

Select from diff vs `origin/main` ∪ dirty tree. `--all` / `--lane` overrides. Activity `type: check` → `last_check`.

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

Report command + id. Ask once if class ambiguous. Cite Work/phase as `id — summary` (example: `W-015 — Parallel active phases`).

**Coordinator** owns phase + Work routing. Delegate bounded `/fix`/`/task`/`/audit`/`/triage` batches to sub-agents. Use **May invoke** — do not invent silent chains; do not skip required precedes.
