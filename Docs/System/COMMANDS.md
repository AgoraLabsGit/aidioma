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
| `/close` | End session / publish | **Active phase:** triage → `/check` → full Proof/Scope/Publish → dual-desk merge (code + Docs home). **No phase:** [reduced-close.md](protocols/reduced-close.md) — inventory desks (D-025) → `/check` → publish each (product `task/*`/`fix/*` + meta `close/*`) | Phase: Adv + nested lenses. Standalone: reduced; `/check` always | `/triage` (phase), `/check`, `/audit`, review helpers |
| `/ship` | Promote to production | Deploy + `RELEASES.md` | Preconditions incl. last `/check` green | `/check` |

`/close --cancel` → phase `canceled`, no merge (phase path only).  
`/close --dry-run` → checks only; findings → `WORK.yaml`.  
Never refuse `/close` because no phase is active — run reduced close.

**Must precede:** `/plan` and `/design` review relevant `Research/R-*` (run `/research` first if options are open) before locking a phase or decisions.

## Action — one unit, one artifact

| Cmd | Produces | Audit / proof | May invoke |
|---|---|---|---|
| `/research` | `Research/R-*.md` + optional decision | **Required Adv** + verdict | Adv sub-agent; optional `/design` if behavior locks |
| `/design` | Decisions and/or a spec; Work `kind: design` (`S-nnn`) + activity active flush first | Review Research first; **Required Adv**; close with `decide`/`spec` or blocked trail | `/research` if missing; Adv sub-agent |
| `/fix` | Patch + proof + Work `fix` + `done_summary` | Required proof; publish via `/close` (reduced) | `/check`; `/close` to publish; optional `/audit`; `/log`/`/plan` if stretches |
| `/task` | Patch/docs + proof + Work `task` + `done_summary` | Required proof (light); publish via `/close` (reduced) | `/check`; `/close` to publish; optional `/audit`; `/log`/`/plan` if stretches |

**Desks (D-025):** Product `/task`/`/fix` → `task/*`/`fix/*` worktrees. Meta → Docs home.
Docs-home path leases via active Work `context_paths` (overlap → wait/park).
**`/close` publish:** every dirty session desk — product PR + meta `close/*` when both dirty;
never delete Docs home.
| `/audit` | Findings + Work `audit` + `done_summary` | Is the audit (not merge gate) | Review sub-agent |

## Utility

| Cmd | Does | Audit / proof | May invoke |
|---|---|---|---|
| `/log` | Park Work row (`open`); classify kind | none | — |
| `/triage` | Sub-agent batch; auto `/fix`/`/task`; confirm drop/plan | none as gate | `/fix`, `/task`; unassigned batch → `/check`, optional `/audit` |
| `/status` | Brief + refresh `context.json` | none | — |
| `/check` | Path-aware tests/lint; record `last_check` | Is the test run; must not fix | — |
| `/launch` | App dev server | none | — |
| `/dashboard` | Ensure+refresh Docs home (`.worktrees/docs` / `docs/ssot`); project that tree (else D-018) | none | — |
| `/handoff` | Overwrite `Handoffs/HANDOFF.md` | none | — |

**Triage mode:** Inside `/run` / active phase → that phase’s Work only (implicit). No active phase → unassigned (`phase: null`) batch.

## Meta

| Cmd | Does | Audit / proof | May invoke |
|---|---|---|---|
| `/system` | Edit `Docs/System/`; context-budget caps | Adv when amending audit/close/merge rules | `/check` (work lane) |

## Protocols (executable)

| Protocol | When | Home |
|---|---|---|
| **Required Adv** | `/research`, `/design`, `/close` claims | [`adv-protocol.md`](protocols/adv-protocol.md) |
| **MCOO** | `/plan` (cheap) · `/close` Scope (binding FAIL list) | [`mcoo-checklist.md`](protocols/mcoo-checklist.md) |
| **Path → lens** | `/close` Proof (conditional) | [`path-lens-map.md`](protocols/path-lens-map.md) |
| **Reduced close** | `/close` when no phase active (also end of `/fix`/`/task` publish) | [`reduced-close.md`](protocols/reduced-close.md) |

## Close lenses (nested under Proof / Scope / Publish)

| Lens | Gate | When |
|---|---|---|
| Outcome evidence | Proof | always |
| Adversarial phase claims | Proof | always |
| Security / privacy / a11y / AI tokens / perf / migration | Proof | path-triggered — [`path-lens-map.md`](protocols/path-lens-map.md) |
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
