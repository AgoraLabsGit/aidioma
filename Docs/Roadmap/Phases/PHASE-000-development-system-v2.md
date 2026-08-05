---
schema_version: 1
id: PHASE-000
title: Development System V2
phase_type: design
subtype: process
status: closed
depends_on: []
founder_approval: approved
updated: 2026-08-05
---

# PHASE-000 — Development System V2

## Outcome

Design and install a phase-based Development System V2: Roadmap SSOT, commands, audits, handoffs,
MCOO, migration from frozen `Docs.2/`, and Phase 001 (Dev System Dashboard) readiness.

## Status

Closed on 2026-08-05. Founder approved and authorized process-only publish. Lexicon product work was
explicitly excluded from this close and remains preserved on a dirty follow-up branch.

## Deliverables

- [x] `Docs/System/development-system-v2.md`
- [x] Phase template at `Docs/System/Templates/phase-spec.md`
- [x] `Docs/System/COMMANDS.md`
- [x] Roadmap + Backlog + reordered phases (Dashboard → Product → Components)
- [x] `Docs/Handoffs/HANDOFF.md` + `Docs/INDEX.md`
- [x] `AGENTS.md` + command skills + AIdioma development skill aligned to V2
- [x] Process-only `/close` with design audits + Docs.2 registry fallback for legacy validate

## Decisions

| ID | Decision | Date |
|---|---|---|
| D-001 | Phase = bounded testable outcome (not only software components) | 2026-08-05 |
| D-002 | Types: design \| implementation; subtypes optional | 2026-08-05 |
| D-003 | Roadmap.md is schedule SSOT; WORK.yaml deprecated as living registry | 2026-08-05 |
| D-004 | Commands: /plan /run /fix /status /handoff /close /launch /dashboard; /feat removed | 2026-08-05 |
| D-005 | /run may commit on phase branch; only /close merges to main | 2026-08-05 |
| D-006 | /handoff updates Docs/Handoffs/HANDOFF.md; no commit | 2026-08-05 |
| D-007 | One active phase; one branch; one worktree | 2026-08-05 |
| D-008 | Close audits: 3 always + ≤2 conditional; MCOO required | 2026-08-05 |
| D-009 | Docs/ living; Docs.2/ frozen evidence; thin Backlog index | 2026-08-05 |
| D-010 | Next phase = Dev System Dashboard; then Target Product; then Components | 2026-08-05 |
| D-011 | /launch and /dashboard clear stale servers; /close includes server hygiene | 2026-08-05 |

## Out of scope (still)

- Lexicon product publish/merge
- Target product or component architecture decisions
- Production/env changes

## Proof and exit criteria

- System spec + templates + agent memory installed
- Phase 001 marked `ready` with kickoff
- Mike runs `/close` for process-only scope → clean main (Lexicon preserved or explicitly handled)
- No learner product behavior changes in this phase’s close diff

## Fresh-session kickoff (until closed)

```text
Continue PHASE-000. V2 is approved and written under Docs/.
Read Docs/System/development-system-v2.md, Roadmap.md, and Handoffs/HANDOFF.md.
Preserve Lexicon dirty work. Next: /close for process-only publish, or /run PHASE-001 after close.
```
