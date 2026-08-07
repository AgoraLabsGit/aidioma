---
id: PHASE-007
title: Command & System Audit Matrix
type: design
proof_kind: spec
state: closed
order: 4
depends_on:
  - PHASE-005
from_backlog: W-017
owner: founder
outcome: "Mike approves one audit matrix (every command has an explicit audit/proof path or none), Active Audits/Tests stubs become real check wiring, close hygiene is documented end-to-end, and Commands project into a Dashboard panel opened from a header icon next to reindex."
proof: "Approved decision + COMMANDS/system amendments: per-command audit column; /close sequence; /check path once; Dashboard header icon opens a Commands panel (read-only V1: static COMMAND_MAP aligned to COMMANDS.md)."
non_goals:
  - Learner-app CI or production deploy changes
  - Parallel phases / collision framework
  - Full GitHub Actions redesign
  - Knowledge UI work (PHASE-006)
  - Rewriting product specs
  - Running commands from the panel (projection/read-only first)
amends_specs:
  - SPEC-F-DEV-DASHBOARD
  - SPEC-A-DEVSYSTEM
feature: SPEC-F-DEV-DASHBOARD
area: SPEC-A-DEVSYSTEM
opened: 2026-08-07
closed: 2026-08-07
lessons: "Primary-rooted overlay (D-018) is poisoned by dirty primary Docs until Docs home (D-020/P-001); Required Adv needs claim wording that matches static UI."
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
4. **Commands panel:** header icon beside reindex opens a read-only panel (static `COMMAND_MAP`
   aligned to `COMMANDS.md`). No “run command” buttons unless a later cut-in.
5. Cut anything that duplicates `/close` as a second merge gate.

**Complexity cost:** Matrix + stub wiring + Commands panel shell. Cut: execute-from-UI, merge queue.

## Proof

- [x] Decision: per-command audit matrix approved (D-019 from R-003)
- [x] COMMANDS/system (+ skills) match the matrix + May-invoke links
- [x] Active Audits/Tests no longer dead stubs (real or honest “not run”)
- [x] One dry-run or `/check` path demonstrated (`last_check` from activity)
- [x] Header icon (next to ⟳) opens Commands panel with projected command list
- [x] D-018 primary-rooted worktree overlay (interim until D-020/P-001)

## Close record

- Result: Shipped audit matrix, `/check`, Adv/MCOO protocols, Commands panel, D-018 interim overlay; D-020 approved deferred to P-001.
- Specs amended: SPEC-F-DEV-DASHBOARD, SPEC-A-DEVSYSTEM
- Journal line: Close hygiene = triage → `/check` → Proof/Scope/Publish; Adv+MCOO executable; Docs home next.

## Kickoff

```text
/plan Docs home (P-001 / D-020) or /run PHASE-006

Read .work/context.json. Prefer scheduling Docs+System home before more parallel Docs writers.
```
