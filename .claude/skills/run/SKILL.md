---
name: run
description: Start or resume the single active phase and execute its whole outcome. Use when the operator says /run. Replaces /feat.
---

# /run

1. Read `AGENTS.md`, Roadmap, active phase, `HANDOFF.md`. Confirm one `active` phase (or activate agreed `ready` with the founder).
2. One short-lived **code** worktree. **Docs home (D-020):** schedule/spec/System/`WORK.yaml`/`.work` writes go to
   `.worktrees/docs` (`docs/ssot`) when present — not the phase tree. Phase tree = product code.
3. **Start:** phase-scoped `/triage` via **sub-agent** (phase id implicit from this `/run` — do not require `/triage PHASE-nnn`).
4. Execute the **whole** phase outcome. MCOO; no horizontal extras.
5. Design phases: ≤3 decisions; show wording before writing. Review `Research/R-*` first; `/research` if options open; `/design` for behavior locks.
6. Build phases: real path, proof, seams/composition. Optional `/audit` or code-review helper — full Adv waits for `/close`.
7. May commit on the phase branch. **Do not merge** — `/close` only.
8. Stop for the founder if the contract breaks.

**Delegate by default:** bounded `/fix` `/task` `/audit`, mid-phase `/triage`, and Required Adv →
sub-agents. **Keep on coordinator:** founder decision/spec wording, MCOO cuts, contract breaks,
and tiny same-context `/fix`/`/task`.

**May invoke:** `/triage`, `/research`, `/design`, `/fix`, `/task`, `/audit`, `/check`, `/log`, `/status`, `/handoff`, `/launch`, `/dashboard`.  
**Must not:** `/close` merge; mix unassigned Work into phase triage.
