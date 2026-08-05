---
schema_version: 1
id: DEV-SYSTEM-V2
title: Development System V2
status: approved
founder_approval: approved
approved: 2026-08-05
---

# Development System V2

Founder-approved process for AIdioma after Phase 000. Executable application code remains proof of
product behavior; this document owns the development process only.

## Principles

- **MCOO** — Minimal complexity for optimal output. Never onboard more complexity than the phase
  outcome requires. Excess complexity is a reason to cut, defer, or drop scope.
- **Proof-first** — Implementation phases prove one real path in `apps/web/` (or one concrete
  operational outcome for non-learner work).
- **One active phase** — Exactly one phase may be `active`. One short-lived branch and one worktree.
- **Conversational design** — Design phases advance through founder checkpoints (≤3 consequential
  decisions at a time). Sub-agents advise on bounded questions only; Mike decides.
- **Clean main** — Only `/close` merges to `origin/main`. Every successful phase close ends on one
  clean local `main` matching `origin/main`.

## Phase model

A **phase** is one bounded, testable outcome. It is not limited to a new service component: process,
product map, architecture map, feature, or component build all qualify when bounded.

| Field | Values |
|---|---|
| Main type | `design` \| `implementation` |
| Subtype (optional) | `process` \| `product-map` \| `architecture` \| `feature` \| `component` |
| States | `proposed` → `ready` → `active` → `closed` (+ `blocked`) |

Only Roadmap-scheduled phases are live work. Unscheduled candidates live in the Backlog.

## File ownership (`Docs/`)

| Home | Owns |
|---|---|
| `Roadmap/Roadmap.md` | Schedule SSOT: order, active/next phase, status |
| `Roadmap/Phases/*.md` | One phase contract each |
| `Roadmap/Backlog.md` | Thin index of unscheduled candidates |
| `Roadmap/Backlog/drafts/` | Draft material for backlog items only |
| `Handoffs/HANDOFF.md` | Current session/phase continuity only (overwrite; keep lean) |
| `System/` | Process contracts, command list, templates |
| `System/COMMANDS.md` | Command key for agents and dashboard |
| `System/Templates/` | Standard templates (e.g. phase-spec) |
| `Specs/` | Capability contracts created when a phase earns them |
| `PRODUCT.md` | Durable product principles (migrate/re-approve when earned) |
| `FIXES.yaml` | Bounded open fixes (migrate when earned) |
| `Docs.2/` | Frozen pre-V2 evidence — not a living root |

Do not create Architecture/, ADRs/, Research/, Archives/, numbered handoff histories, or a second
work registry beside the Roadmap.

## Commands

| Cmd | When | Rule |
|---|---|---|
| `/plan` | New work not on Roadmap | Onboard a phase (draft spec, `proposed`/`ready`). No product code. Not the old design ritual. |
| `/run` | Start or resume the one `active` phase | Execute the whole phase outcome. May commit on the phase branch. Stop for founder gates. |
| `/fix` | Bounded defect | Reproduce → patch → prove. Systemic work → `/plan`. |
| `/status` | Anytime | Read-only Roadmap, phase, Git, runtime, next command. |
| `/handoff` | Mid-phase session end | Overwrite `Handoffs/HANDOFF.md`. **No commit/PR/merge.** |
| `/close` | Phase complete | Audits → commit/PR/merge exact head → clean `main`. Human review when UI/testable. Stop stale servers. |
| `/launch` | View the learner app | Stop stale app dev servers, then start `npm run app:dev`. |
| `/dashboard` | View the work dashboard | Stop stale dashboard servers, then start `npm run work:dashboard`. |
| `/feat` | — | **Removed.** Use `/run`. |

`/dashboard` is first-class in V2; PHASE-001 makes the UI read living Roadmap data.

### Mid-phase Git

- `/run` may commit on the single phase branch.
- `/handoff` never commits.
- Only `/close` opens/updates the PR and merges to `origin/main`.

### Runtime hygiene (`/launch`, `/dashboard`, `/close`)

- Before start: detect and stop stale processes for that tool (app: Next on localhost default port;
  dashboard: the work-dashboard server).
- `/close` must verify phase-owned local servers are stopped so the next session does not inherit
  orphans.
- Never kill unrelated user processes outside the known AIdioma app/dashboard launchers.

## Close audits

### Implementation phases — 3 always + ≤2 conditional (max 5)

| Role | When | Owns |
|---|---|---|
| Close Steward | always | MCOO, scope, SSOT reconcile, code-quality smells, next kickoff |
| Evidence Auditor | always | Claims vs executable/real-path proof |
| Publish Guardian | always | Branch/PR containment, gates, clean `main`, server hygiene |
| Learner-Surface Auditor | UI / learner text | a11y, privacy, leakage |
| Contract / Seams Auditor | schemas, APIs, shared pkgs, cross-boundary | ownership, deps, migration, AI-boundary when relevant |

**Conditional when relevant:** security, privacy, AI Gateway/tokens, a11y, performance,
data-migration, code quality (packed into Steward/Contract unless a dedicated conditional slot is
needed).

| Result | Rule |
|---|---|
| FAIL | Blocks merge |
| WARN | Needs Mike acknowledgment |
| PASS | Always-roles green; conditionals N/A or green |

### Design phases

Close Steward + Publish Guardian + Decision Auditor (approvals, non-goals, deliverables, next-phase
readiness). FAIL if product/app/content behavior changed without an implementation phase.

## MCOO hard gates

- `/plan` — name complexity cost; drop/simplify/defer is a valid outcome; no unconsumed foundation.
- Design `/run` — smallest useful design; AI only if the outcome fails without it.
- Implementation `/run` — no horizontal “while we’re here”; stop if the contract breaks.
- `/close` — MCOO audit required; unjustified abstractions FAIL or require cut before merge.

## AI Gateway / token audit (when relevant)

- Cap calls per learner action; prefer deterministic paths first.
- Context is the job bundle only.
- Structured validated output; fail closed with a zero-AI path.
- Receipts without learner text or provider payloads.

## Migration

- `Docs/` is the living documentation root for V2.
- `Docs.2/` is frozen evidence (former living Docs). Farm open items into Backlog; do not dual-write
  `WORK.yaml` as a live registry.
- Capability specs migrate on demand when a phase needs them.
- Agent memory (`AGENTS.md`, command skills, AIdioma development skill) must match this document.
- Lexicon and other unrelated dirty work remain preserved and are not closed by Phase 000.

## Retained from DEV-RHYTHM-001

One demonstrable outcome; ≤3 founder decisions per checkpoint; real-path proof; composition/seams
review; keep/revise/remove before expanding; foundations need a real consumer.

## Removed / demoted

- `/feat` as a command name.
- `/plan` as a multi-document autonomous design ritual.
- `WORK.yaml` as the sole living roadmap.
- Parallel roadmaps, numbered handoffs, panel transcript archives.
