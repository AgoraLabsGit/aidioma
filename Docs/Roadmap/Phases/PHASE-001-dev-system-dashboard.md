---
schema_version: 1
id: PHASE-001
title: Dev System Dashboard
phase_type: implementation
subtype: process
status: ready
depends_on:
  - PHASE-000
founder_approval: approved
updated: 2026-08-05
---

# PHASE-001 — Dev System Dashboard

## Outcome

Mike can see Roadmap phases, backlog, fixes, command key, and active-phase status in a local web UI
without parsing markdown/YAML by hand—by adapting `tooling/work-dashboard` and `tooling/work-registry`
to Development System V2.

## Why now

Disconnection from hard-to-read or ballooning docs was a founder failure mode. The process is
approved; the readable control surface is the next proof that the system is usable.

## Inputs

- `Docs/System/development-system-v2.md`
- `Docs/Roadmap/**`
- Existing `tooling/work-dashboard` and `tooling/work-registry` (currently WORK.yaml-oriented)
- Frozen `Docs.2/` as migration evidence only

## In scope

- Registry/parser/validation for Roadmap + phase specs + backlog (+ fixes when present)
- Dashboard UI: phase schedule, active phase, backlog, command key/legend, validation issues
- `/dashboard` launch path and stale-server hygiene alignment
- Keep the dashboard local-only (loopback), not part of the learner app

## Out of scope

- Target product decisions
- Component architecture
- Lexicon product changes or publishing the Lexicon branch
- Production hosting of the dashboard

## Founder checkpoints

- ≤3 UI/information-architecture decisions per checkpoint
- Show proposed dashboard information architecture before large UI rewrites

## Strategic review

Bounded sub-agents for schema/validation and UI clarity only after founder direction.

## Deliverables

- Updated work-registry schemas/loaders for V2 docs
- Dashboard showing Roadmap truth + command key
- `npm run work:dashboard` / `/dashboard` working against `Docs/`
- Validation command green for the V2 root

## Proof and exit criteria

- Mike can open the dashboard and see active/next phase, backlog, and commands without opening raw files
- Validation fails closed on invalid Roadmap/phase metadata
- Stale dashboard servers are cleared by `/dashboard` and `/close` hygiene
- Learner app unchanged except unrelated preserved work
- `/close` → clean `origin/main` for this phase scope only

## Close audits

Always: Close Steward (incl. MCOO), Evidence, Publish Guardian.  
Conditional: Learner-Surface if any shared UI patterns; Contract/Seams for registry schema changes.

## Decisions

| ID | Decision | Date |
|---|---|---|
| D-001 | Dashboard is the next phase after Dev System V2 approval | 2026-08-05 |

## Fresh-session kickoff

```text
Start PHASE-001 — Dev System Dashboard with /run.

Read Docs/System/development-system-v2.md, Docs/Roadmap/Roadmap.md, and this phase spec.
Preserve the dirty Lexicon worktree; do not publish or expand Lexicon.
Adapt tooling/work-registry and tooling/work-dashboard to Roadmap/phases/backlog/command key.
Prove with npm run work:dashboard and validation. Use /dashboard to launch; clear stale servers.
```
