---
name: plan
description: Onboard a new AIdioma phase onto the Roadmap with a draft phase spec. Use when the operator says /plan or asks to schedule new phase work.
---

# /plan

Onboard only. This is not the old multi-document design ritual.

1. Read `AGENTS.md`, `Docs/System/development-system-v2.md`, `Docs/Roadmap/Roadmap.md`, and
   `Docs/Handoffs/HANDOFF.md`.
2. With Mike, name one bounded outcome, type (`design`|`implementation`), optional subtype,
   non-goals, and MCOO complexity cut list. Do **not** preload `Docs.2/` yet.
3. Only after step 2: optionally deploy a bounded sub-agent to mine relevant `Docs.2/` evidence and
   return keep / defer / reject / conflict items. Legacy is evidence only—never approved design.
4. Draft one phase spec from `Docs/System/Templates/phase-spec.md`. Show wording before writing.
5. Add/update the Roadmap row as `proposed` or `ready`. Optionally index in `Backlog.md` until
   scheduled.
6. Do not implement product code. Design conversation happens later via `/run` on a design phase.
7. Stop for founder approval before marking `ready` when approval is required.
