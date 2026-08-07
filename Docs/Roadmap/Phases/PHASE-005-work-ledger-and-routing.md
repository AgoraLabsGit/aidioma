---
id: PHASE-005
title: Work Ledger and Routing
type: build
proof_kind: terminal
state: closed
order: 3
depends_on:
  - PHASE-004
from_backlog: W-031
owner: founder
outcome: "Non-phase work is parked, done-now, observable, and triage-executable via Docs/WORK.yaml + Work page; phases carry feature/area; agents route plain language to /log /triage /fix /task /research /audit; /triage [area|feature] auto-does clear work via sub-agents."
proof: "Terminal: WORK.yaml schema (kinds+open_questions+done_summary); /log /triage /fix /task /audit update ledger+activity; Work detail shows questions+done_summary; executing /triage Devsystem proof; COMMANDS/AGENTS/skills encode routing, classifier, context-size; Work≠Signals."
non_goals:
  - Auto-assign Work rows into the active phase
  - Feature/area neighborhood derive or read-set intelligence beyond tags + Roadmap columns
  - Session lanes, collision framework, or dual-coordinator product
  - Auto /triage at every /run
  - Learner-app / product design (PHASE-002+)
  - Promoting Dashboard-spec to SPEC-*
  - Kind-prefixed work ids (W-018) in this phase
amends_specs:
  - SPEC-F-DEV-DASHBOARD
  - SPEC-A-DEVSYSTEM
  - SPEC-F-LEXICON
  - SPEC-A-CONTENT
feature: SPEC-F-DEV-DASHBOARD
area: SPEC-A-DEVSYSTEM
opened: 2026-08-06
closed: 2026-08-07
lessons: "Phase-scoped /triage before close audits; Lexicon research landed with founder Scope WARN ack."
---


# PHASE-005 — Work Ledger and Routing

## Context

Phases get full process. Interrupts need a durable home without a second Roadmap. Founder
expanded mid-flight: Work rows must be observable (questions + done summary), `/triage` must
execute clear work (not only sort), and `/audit` is a first-class action kind.

## Inputs

- Decisions: D-002, D-003, D-007 (superseded for Work vs Signals), D-011
- Founder calls 2026-08-06: expand now; `/audit` = action; triage auto-do clear items; confirm drop/plan/lifecycle only
- Docs: `system.md`, `COMMANDS.md`, `AGENTS.md`, `Dashboard-spec.md`
- Code: `Docs/System/dashboard`, `Docs/System/derive`, `.claude/skills/*`

## Plan

1. **Ledger** — kinds include `audit`; fields `open_questions`, `done_summary`.
2. **Commands** — executing `/triage [area|feature]`; `/audit`; classifier proposal≠task; clarifications on-row.
3. **Dashboard** — Work detail shows open questions + done summary; Activity shows `audit` events.
4. **Agent memory** — COMMANDS/AGENTS/skills; context-size discipline under `/system`.
5. **Proof** — `/triage` Devsystem clears or questions clear do-now items.

**Complexity cost:** Observable Work + executing triage + `/audit`. Cut: id namespace rename (W-018).

## Proof

- [x] `WORK.yaml` validates; FIXES + Backlog migrated
- [x] Work page = ledger only; Signals = derived only
- [x] Phase `feature`/`area`; Roadmap columns
- [x] `open_questions` + `done_summary` on schema/Zod/detail
- [x] `/audit` skill + kind + activity type (W-032)
- [x] `/triage` executes clear `/fix`/`/task`; confirms drop/plan only (W-016, W-019)
- [x] Classifier + id+summary surfacing in AGENTS/skills (W-029)
- [x] Context-size rule under `/system` in system.md
- [x] `npm run work:test` + `work:validate` green

## Close record

- Result: Closed — Work ledger + routing v2 + executing `/triage` + `/audit`; dashboard Work/Activity UX; kind-prefixed ids forward-only; PHASE-006/007/008 proposed; Lexicon R-001/R-002 + D-014/D-015 included (founder Scope WARN ack). Proof: `work:validate` ok; `work:test` 21/21.
- Specs amended: SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM, Dashboard-spec (System), SPEC-F-LEXICON, SPEC-A-CONTENT
- Journal line: Work is the interrupt ledger; next `/run PHASE-007` (Command & System Audit Matrix)


## Kickoff

```text
/run PHASE-005

Read .work/context.json. Work ledger + executing /triage + /audit + open_questions/done_summary + agent routing.
```
