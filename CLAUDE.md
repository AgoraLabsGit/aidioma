# AIdioma agent entry point

Read and follow `AGENTS.md`. This repo is the AIdioma Praxis project. Praxis product
development is the sibling `Praxis.v2` project — separate Docs/Work/dashboard.

<!-- praxis:canonical-commands:start -->
## Praxis canonical commands (registry v6)

Load Praxis skills from `.claude/skills/`. These files are generated from the typed Praxis command registry; do not copy or redefine their command semantics.
Claude Code loads `/task` and the other verbs below from `.claude/skills/`.
If you are already in this host session, do the work here after creating the Work item. Do not start the Cursor agent runner.
Before a governed mutation, run `praxis status --json` and follow the returned next action. Mutation-hook health is authoritative only through `praxis hooks status --json`.

- `/plan` → `/plan` — Work placed as a task, phase, or active-phase work
- `/run` → `/run` — The one active phase is prepared for its governed runner
- `/task` → `/task` — Work item created and claimed
- `/fix` → `/fix` — Fix Work item created and claimed
- `/log` → `/log` — Work item parked for later
- `/check` → `/check` — Check receipt recorded
- `/handoff` → `/handoff` — Handoff stored and projected
- `/close` → `/close` — Local Work close recorded with proof
- `/publish` → `praxis publish execute` — A confirmed exact-head publication enters the canonical receipt chain
<!-- praxis:canonical-commands:end -->
