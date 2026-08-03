---
name: feature
description: Shape a proposed AIdioma capability through a small live-product experiment and write only the specification that tested behavior earns. Use when the operator says /feature or proposes a new capability.
---

# /feature — idea → live test → grounded spec

1. Read `Docs/INDEX.md`, the highest-numbered handoff, and the active product criteria or technical
   references relevant to the idea. Do not add roadmap slices, wave packets, or register rows.
2. Describe the learner problem, the visible success condition, and the smallest live experiment.
   Ask at most one short group of questions when founder input is required.
3. Check the current app first. Reuse its proven Practice/Lessons patterns and identify what genuinely
   needs testing; do not let a historical proposal become product truth by default.
4. Prototype the smallest end-to-end behavior on a short-lived branch. Preserve content authorship and
   the lesson-schema boundary; call out either as a separate decision before changing it.
5. Exercise the behavior through the real user path and run the relevant automated checks. Iterate
   from observed behavior and founder feedback.
6. Once behavior is accepted, create or update one active feature spec with:
   - what the learner sees;
   - what must be true;
   - what it must not do;
   - how the live prototype proves it.
7. Leave unresolved architecture as one small next test, not speculative system truth. Report the
   tested outcome, spec path, evidence, and next implementation step; use `/close` for PR publication.
