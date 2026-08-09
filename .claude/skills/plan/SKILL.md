---
name: plan
description: Onboard a new phase onto the Roadmap with a draft phase spec. Use when the operator says /plan or asks to schedule new phase work.
---

# /plan

Onboard only — not the old multi-document design ritual.

0. **Docs home (D-020):** Phase/Roadmap/Research writes → `.worktrees/docs` when present.
1. Read `AGENTS.md`, `system.md` (schedule), Roadmap, `HANDOFF.md`.
2. **Must precede:** review relevant `Research/R-*`. If ≥2 external options are open and no fresh R-* → **`/research` first**.
3. With the founder: one bounded outcome, type (`design`|`build`), non-goals, MCOO cut list (`Docs/System/protocols/mcoo-checklist.md`). Do not preload frozen legacy docs yet.
4. After outcome set: optional bounded sub-agent to farm frozen legacy docs keep/defer/reject (evidence only).
5. Draft one phase from `Templates/phase.md`. Show wording before writing.
6. Schedule: next free `PHASE-nnn`; `depends_on` = sequence; `order` = tier tie-break only — never renumber peers.
7. Update Roadmap row; state `proposed` or `ready`. No product code.
8. Founder approval before `ready` when required.

**May invoke:** `/research`, `/log`.  
**Must not:** skip Research review; implement product code.
