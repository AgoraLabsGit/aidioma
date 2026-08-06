---
id: PHASE-005
title: Work Ledger and Routing
type: build
proof_kind: terminal
state: active
order: 3
depends_on:
  - PHASE-004
from_backlog: null
owner: founder
outcome: "Non-phase work is parked, done-now, and visible via Docs/WORK.yaml + a Work dashboard page; phases carry nullable feature/area; agents auto-route plain language to /log /triage /fix /task /research and use sub-agents without slash-only UX."
proof: "Terminal checklist: WORK.yaml schema + migrated FIXES/Backlog; /log /triage /fix /task update ledger and activity; Work page (ledger only); Issues renamed Signals (derived only); Roadmap shows phase feature/area; COMMANDS/AGENTS/skills encode routing + sub-agent playbook."
non_goals:
  - Auto-assign Work rows into the active phase
  - Feature/area neighborhood derive or read-set intelligence beyond tags + Roadmap columns
  - Session lanes, collision framework, or dual-coordinator product
  - Auto /triage at every /run
  - Learner-app / product design (PHASE-002+)
  - Promoting Dashboard-spec to SPEC-*
amends_specs: []
feature: SPEC-F-DEV-DASHBOARD
area: SPEC-A-DEVSYSTEM
opened: 2026-08-06
closed: null
lessons: null
---

# PHASE-005 — Work Ledger and Routing

## Context

Phases get full process. Interrupts (bugs, chores, ideas, research, questions) need a durable
home without a second Roadmap. Design session locked: one Work ledger, one coordinator chat,
slash commands as API / plain language as UX, sub-agents for bounded jobs. Feature/area are
org tags first; deeper spine intelligence later.

## Inputs

- Decisions this depends on: D-002 (phase schedule SSOT), D-003 (standalone /fix), D-007 (Issues naming — superseded for UI split Work vs Signals)
- Founder calls (this plan): next before PHASE-002; file `WORK.yaml`; Work page ≠ Signals page
- Docs: `system.md`, `COMMANDS.md`, `AGENTS.md`, `Dashboard-spec.md`, `FIXES.yaml`, `Backlog.md`
- Code: `Docs/System/dashboard`, `Docs/System/derive`, `.claude/skills/*`
- Frozen evidence only if needed: `Docs.2/WORK.yaml` (do not revive as schedule registry)

## Plan

1. **Ledger** — `Docs/WORK.yaml` + JSON Schema. Kinds: `fix` | `task` | `proposal` | `research` | `question`. Statuses: `open` | `active` | `done` | `promoted` | `dropped`. Nullable `feature` / `area` (`SPEC-F-*` / `SPEC-A-*`). Migrate `FIXES.yaml` + `Backlog.md`; retire those homes in `system.md`.
2. **Commands** — `/log` (park + auto-classify), `/triage` (sort only), `/task` (do-now); extend `/fix` to the ledger. Activity events for each.
3. **Phase tags** — schema + template: nullable `feature` / `area` on phases; Roadmap columns.
4. **Dashboard** — **Work** page projects the ledger. Rename **Issues** → **Signals** (derived health only). No mixing triage queue with indexer alarms.
5. **Agent memory** — Update `COMMANDS.md`, `AGENTS.md`, Cursor/Claude skills: intent routing for all Work verbs; one coordinator owns phase + Work; sub-agent playbook (delegate bounded fix/task/log/triage when it protects context — not every micro-edit).
6. **Proof** — runbook checks on the list in frontmatter `proof`.

**Complexity cost:** One authored ledger, three command surfaces, dashboard split, instruction updates. Cut: auto-absorb, session lanes, derive neighborhoods.

## Proof

- [x] `WORK.yaml` validates; FIXES + Backlog migrated; old homes removed or redirected in system docs
- [x] `/log` creates open row (any kind) visible on Work page (W-016)
- [x] `/fix` or `/task` moves a row to `done` (+ activity event) — skills + COMMANDS encode path; migrated done fixes prove status
- [x] `/triage` can drop / leave / mark for `/plan` (proposal → promoted path documented in COMMANDS/system)
- [x] Work page = ledger only; Signals = derived kinds only
- [x] Phase `feature`/`area` nullable; Roadmap shows columns
- [x] Intent routing + sub-agent playbook present in agent-facing docs/skills
- [x] Dashboard/derive tests green for new projection (`npm run work:test` + `work:validate`)

## Close record

Filled at `/close`. Leave empty until then.

- Result:
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-005

Read .work/context.json. Work ledger (WORK.yaml) + /log /triage /task + Work vs Signals pages + phase feature/area tags + agent routing/sub-agent playbook. No auto-absorb, no session lanes.
```
