---
name: run
description: Start or resume the single active AIdioma phase and execute its whole outcome. Use when the operator says /run. Replaces /feat.
---

# /run

1. Read `AGENTS.md`, Roadmap, active phase spec, and `Docs/Handoffs/HANDOFF.md`.
2. Confirm exactly one `active` phase (or activate the agreed `ready` phase with Mike).
3. Use one short-lived branch and one worktree. Preserve unrelated dirty work.
4. Execute the **whole** phase outcome (phase = the slice). Apply MCOO; no horizontal extras.
5. Design phases: conversational checkpoints (≤3 decisions); show wording before writing.
6. Implementation phases: complete real path, proof, seams/composition review.
7. May commit on the phase branch. Do not merge to `main` — that is `/close` only.
8. If the contract breaks or an unapproved product choice appears, stop for Mike (revisit via
   `/plan` only if a new phase is required).
