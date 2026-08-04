---
name: feat
description: Implement one approved AIdioma feature slice from WORK.yaml and its reviewed spec. Use when the operator says /feat or asks to advance a planned feature by ID.
---

# /feat

1. Read `AGENTS.md`, current memory files, and the planned/active work entry. Require an approved
   spec for product/system behavior; an approved process item may use `spec: null`. Refuse to
   implement from an unreviewed draft; route it through `/plan`.
2. Select one coherent `next_slice`, state its visible outcome and proof, and keep unrelated work in
   the registry.
3. Reuse or establish honest boundaries between contracts, pure domain engines, application
   services, API/AI/DB adapters, reusable UI patterns, and page composition. Make Practice work
   reusable by Lessons where the contract is already real.
4. Implement the vertical slice on a short-lived branch with deterministic tests and failure states.
5. Run focused checks, full affected gates, accessibility/responsive proof, and the real user path.
6. Update only proven spec behavior, WORK evidence/status/next slice, and current continuity. Use
   `/close` for publication and cleanup.
