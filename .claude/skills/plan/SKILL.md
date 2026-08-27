---
name: plan
description: Turn registered work into a task target or canonical roadmap phase contract.
---

# /plan

Read `Docs/Development/DELIVERY.md` and `Docs/WORK.yaml` first. When planning learner-visible work,
require one primary learner journey, its important failure/recovery state, code owners, and exact
acceptance proof. Split broader work before implementation.

When planning a roadmap phase, triage all relevant open entries into the phase authority. Keep them
`open` while the phase is `proposed`; mark them `active` only when the complete readiness contract
moves the phase to `ready` and `/run` begins. Record a concrete named-phase reason for every
relevant entry that remains deferred; do not silently omit it.

Create one per-target JSON scope authority under `Docs/Evidence/<target>/target.json`; `Docs/NOW.md`
is only an optional local status pointer. For a task/fix the JSON also owns outcome, proof, and
non-goals. For phase-sized work, the phase file owns those product fields while its target JSON owns
   `version`, id, kind `phase`, evidence directory, phase `authority` path, integer risk tier 1–3,
required lenses, exact ordered check command argv arrays, check environment-name allowlist, bounded
check timeout, and exact scopes. Include
the target JSON and phase file in those scopes.

For a phase, assign risk Tier 1, 2, or 3 (never Tier 0) and fill the `## Audit` table from `Docs/CLOSE.md` before
implementation, using its exact gate-matrix lens names and tier agent bundles. Claims/Proof evidence,
Code quality/Standards, and MCOO always; Tier 2–3 also require Seams/Integration and Product/Learner
journey, while Tier 3 also requires Security/Privacy; remaining path-triggered
lenses selected or given a concrete `n/a` reason. Bundled lenses still receive separate verdicts.
Then follow `/run` as coordinator: preserve your context window and delegate coding by area of
concern to in-session sub-agents. Do not implement the phase in the planning agent. Run `npm run
docs:check` before handoff.
