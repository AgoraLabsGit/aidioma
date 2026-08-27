---
name: spec
description: Create or amend an AIdioma feature or area specification.
---

# /spec

1. Decide whether the durable contract is a learner-facing feature (`SPEC-F-*`) or shared area
   (`SPEC-A-*`). Use `Docs/Development/Templates/feature-spec.md` or `area-spec.md`.
2. For a new spec, prefer `npm run docs:work -- spec <feature|area> <SPEC-ID> "<title>" --path
   "<owned/glob>"`. For an amendment, edit the existing canonical file.
3. Write observable present-tense rules, a visible failure mode, boundaries, dependencies, and
   narrow owned paths. Record any alternative-selecting choice in `Docs/DECISIONS.md`.
4. If the change creates implementation work, log it in `Docs/WORK.yaml` or claim it into a phase.
5. Run `npm run docs:check` plus any validator/test that enforces the behavior.
