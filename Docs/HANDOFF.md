# Current handoff — Practice serving is next

**Date:** 2026-08-03
**Branch:** `main`
**Status:** command-driven SSOT migration complete; product dossiers remain draft planning inputs

## Current truth

- `Docs/` is the sole canonical documentation root. Historical documentation remains recoverable
  from Git at `b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a`; do not recreate a parallel archive.
- `apps/web/` is the real learner application. Practice is available locally at
  `http://127.0.0.1:3217/practice`.
- The local read-only work dashboard is available at `http://127.0.0.1:4317`. It reparses
  `WORK.yaml`, `FIXES.yaml`, and spec frontmatter on each API refresh; it has no separate database.
- The five commands are `/plan`, `/feat`, `/fix`, `/status`, and `/close`. Repository and global
  Codex memory route all future AIdioma development through them.
- Historical claims preserved in draft specs were deferred for their owning `/plan` sessions. The
  migration did not freshly approve them as product behavior.
- The current rendered Practice Settings design is rejected as the target experience. Its redesign
  remains blocked by Practice serving and UI-system planning.
- `apps/prototype/` remains temporarily because it is still the only runnable founder-review surface
  for Lessons 2 and 3. Replace that job before removing it.

## Completed

- Replaced the documentation process with one product file, one work registry, one bounded-fix
  registry, reviewed specs, and this overwrite-only handoff.
- Harvested prior product, learning, technical, design, and research evidence into nine draft
  dossiers without treating prior prose as current implementation or approval.
- Added strict YAML/frontmatter and dependency validation, CI, a migration-readiness gate, and a
  loopback-only dashboard outside the learner deployment.
- Ran independent harvest and adversarial audit passes and reconciled material findings.
- Validated registry/tooling, application, contracts, content fixtures, prototype freshness, and the
  persistent Codex skill before publication.
- Verified the dashboard in a clean browser profile against canonical `Docs/`: 29 rows, 0 registry
  issues, and source root `Docs`. The unaffected Practice route's automated browser check was blocked
  by the existing local Clerk key/session redirect condition; application build and 229 tests passed.

## Next action

Run `/plan PRACTICE-SERVING-001`. Decide reinforced scheduling as a coherent system: working-set
size, incorrect-answer return lag, interleaving, refill, direction coupling, graduation, session
continuity, and the evidence boundary. Do not redesign Settings or extract Lessons abstractions until
that serving contract is founder-approved.

## Kickoff message

> Work as the AIdioma coordinator and run `/plan PRACTICE-SERVING-001`. Read `AGENTS.md`, then the
> complete canonical `Docs/INDEX.md`, `Docs/WORK.yaml`, `Docs/FIXES.yaml`, `Docs/HANDOFF.md`, and
> `Docs/Specs/practice-serving.md`. Inspect the implemented Practice engine and tests before relying
> on prose. Discuss outcome and consequential choices with me, run a 2–4-agent design panel, draft
> the revised serving spec, send it to a fresh adversarial auditor, revise it, and present decisions
> for founder approval. Do not implement product code during `/plan`; preserve the current Settings
> rejection and design for explicit Lessons reuse without premature extraction.
