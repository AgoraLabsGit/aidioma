---
name: phase-spec
description: Create or amend one canonical AIdioma roadmap phase and its target contract.
---

# /phase-spec

Use this command directly or through `/plan`.

1. Read `Docs/Development/DELIVERY.md`, `Docs/WORK.yaml`, `Docs/PRODUCT.md`,
   `Docs/DECISIONS.md`, owning specs, and current roadmap.
2. Define one primary learner journey and its important failure/recovery state. Triage every
   relevant open work entry to that phase ID or retain a concrete future-phase reason. Keep work
   open while the phase is proposed; activate it only when readiness passes and `/run` begins.
3. Create exactly `Docs/Roadmap/Phases/PHASE-nnn.md` and
   `Docs/Evidence/phase-nnn/target.json`. Start from
   `Docs/Development/Templates/phase-spec.md`, or use `npm run docs:work -- phase ...`.
4. Define one observable outcome, exact proof, explicit non-goals, dependencies, amended specs,
   failure/recovery behavior, changed code owners, risk tier, required audit lenses, check commands,
   environment-name allowlist, timeout, and exact scopes. Replace all scaffold placeholders before
   `/run`. If several primary journeys or unresolved alternatives remain, split the phase.
5. Update the roadmap sequence and a short NOW pointer only when needed. Run `npm run docs:check`.
