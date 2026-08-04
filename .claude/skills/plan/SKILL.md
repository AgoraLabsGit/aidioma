---
name: plan
description: Plan an AIdioma feature through founder discussion, independent design panel, draft spec, adversarial audit, revision, and approval. Use when the operator says /plan or asks to design a systemic feature before implementation.
---

# /plan

1. Read `AGENTS.md`, `Docs/INDEX.md`, `Docs/WORK.yaml`, and `Docs/HANDOFF.md` (use `Docs.next/`
   during migration). Inspect the relevant app, contracts, schemas, tests, and source research.
2. Discuss the user problem, outcome, non-goals, constraints, and consequential choices with Mike.
   Create/update one work ID and set it to `planning`.
3. Run an independent 2-4-agent panel sized to the feature: product/learning, architecture/data/API,
   UI/accessibility/reuse, and security/operations as relevant. Synthesize; do not vote.
4. Write one draft spec that labels implemented, current accepted, legacy-accepted, candidate,
   research, deferred, rejected, and conflicting claims. Include reuse boundaries, failure states,
   data/API/schema impact, proof, open questions, sources, and delivery slices.
5. Give the raw draft to a fresh adversarial auditor that did not author it. Audit contradictions,
   missing states, scope, security/data risk, composability, migration, and falsifiable acceptance.
6. Revise. End the spec with decision and discovered-issue tables containing stable IDs and links to
   `WORK.yaml` or `FIXES.yaml`; do not duplicate full records.
7. Present material decisions to Mike. Only approval moves status to `planned`. Do not implement
   product code during `/plan`; use `/close` to publish a planning-only change.
