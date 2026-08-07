---
name: plan
description: Onboard a new AIdioma phase onto the Roadmap with a draft phase spec. Use when the operator says /plan or asks to schedule new phase work.
---

# /plan

Onboard only. This is not the old multi-document design ritual.

1. Read `AGENTS.md`, `Docs/System/system.md` (phase schedule), `Docs/Roadmap/Roadmap.md`, and
   `Docs/Handoffs/HANDOFF.md`.
2. With Mike, name one bounded outcome, type (`design`|`build`), optional subtype,
   non-goals, and MCOO complexity cut list. Do **not** preload `Docs.2/` yet.
3. Only after step 2: optionally deploy a bounded sub-agent to mine relevant `Docs.2/` evidence and
   return keep / defer / reject / conflict items. Legacy is evidence only—never approved design.
4. Draft one phase spec from `Docs/System/Templates/phase.md`. Show wording before writing.
5. **Schedule fields (do not renumber peers):**
   - `id`: next free `PHASE-nnn` = max existing number + 1 (ids are creation labels, not schedule rank).
   - `depends_on`: phases that must be `closed` first — **this is the real sequence**.
   - `order`: tie-break only within the same dependency tier (any non-negative int; duplicates OK across tiers).
   - **Never** rewrite other phases' `order` values to “make room.”
   - Roadmap display order comes from `derive()`: dependency depth → `order` → id.
6. Add/update the Roadmap.md row in dependency order (or regenerate from derive). Leave state
   `proposed` or `ready`.
7. Do not implement product code. Design conversation happens later via `/run` on a design phase.
8. Stop for founder approval before marking `ready` when approval is required.
