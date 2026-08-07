---
id: PHASE-007
title: Command & System Audit Matrix
type: design
proof_kind: spec
state: proposed
order: 4
depends_on:
  - PHASE-005
from_backlog: W-017
owner: founder
outcome: "Mike approves one audit matrix (every command has an explicit audit/proof path or none), Active Audits/Tests stubs become real check wiring, close hygiene is documented end-to-end, and Commands project into a Dashboard panel opened from a header icon next to reindex."
proof: "Approved decision + COMMANDS/system amendments: per-command audit column; /close sequence; /check path once; Dashboard header icon opens a Commands panel projecting COMMANDS.md (or derive equivalent)."
non_goals:
  - Learner-app CI or production deploy changes
  - Parallel phases / collision framework
  - Full GitHub Actions redesign
  - Knowledge UI work (PHASE-006)
  - Rewriting product specs
  - Running commands from the panel (projection/read-only first)
amends_specs: []
feature: SPEC-F-DEV-DASHBOARD
area: SPEC-A-DEVSYSTEM
opened: 2026-08-07
closed: null
lessons: null
---

# PHASE-007 — Command & System Audit Matrix

## Context

Commands grew quickly (`/audit`, executing `/triage`, close hygiene). Some paths have Proof/Scope/Publish;
others are stubbed on the Active card. Need one matrix so agents know what “audited” means per command,
plus a Dashboard surface so founders can see the command map without opening markdown.

## Inputs

- `Docs/System/system.md` §§ lifecycle/action/utility + close checks
- `Docs/System/COMMANDS.md`, close/triage/audit skills
- W-017 — Wire audit and test infra into phase workflows
- Dashboard Active Audits/Tests stubs; topbar next to reindex (⟳)

## Plan

1. Inventory every command → required proof, optional `/audit` lens, none.
2. Lock close order: phase-scoped `/triage` → Proof/Scope/Publish → conditional reviews → merge.
3. Wire Active stubs to real `/check` / last-run projection (MCOO: display + one runner path).
4. **Commands panel:** header icon beside reindex opens a panel projecting the command map
   (from `COMMANDS.md` / derive). Read-only V1 — no “run command” buttons unless a later cut-in.
5. Cut anything that duplicates `/close` as a second merge gate.

**Complexity cost:** Matrix + stub wiring + Commands panel shell. Cut: execute-from-UI, merge queue.

## Proof

- [ ] Decision: per-command audit matrix approved
- [ ] COMMANDS/system (+ skills) match the matrix
- [ ] Active Audits/Tests no longer dead stubs (real or honest “not run”)
- [ ] One dry-run or `/check` path demonstrated
- [ ] Header icon (next to ⟳) opens Commands panel with projected command list

## Close record

- Result:
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-007

Read .work/context.json. Design the command audit matrix; wire Active stubs; Commands panel from header icon; do not touch Knowledge UI or product specs.
```
