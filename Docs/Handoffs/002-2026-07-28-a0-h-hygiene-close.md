---
title: Handoff — A0-H hygiene + close A0
type: handoff
status: superseded
updated: 2026-07-28
---

# Handoff — A0-H hygiene, then close Design Close

> Completed by `Docs/Waves/A0-H-hygiene.md`; retained as session-entry history.

**For:** next app-track / design-coordinator session  
**Operator:** Mike (non-technical; plain language; **one yes/no at a time**)  
**Do not** write app code until A0 closes. **Do not** push without operator GO (only after `/close` VERIFIED).

## Boot (mandatory)
1. `Docs/STATE.md`
2. `Docs/ROADMAP.yaml` (A0 active; A0-1…A0-4 **proven**; A0-H pending/active)
3. `Docs/INDEX.md` → open only what you need
4. This file + `Docs/Registers/open-items.md` + `post-mvp.md` + `deprecations.md`
5. `Docs/Waves/A0-H-hygiene.md` + `.claude/skills/close/SKILL.md`

## Where we left off
A0 decision work is **done**. Quiz/MC persists as `evaluations` with modality
**`multipleChoice`** (no AI); platform/SDK boundaries are settled in ADR-0014.

**This session = A0-H → `/close` → OI-023 (C2 go/no-go).**

## Already settled (do not re-litigate)
| Area | Home |
|---|---|
| UI / module | `Docs/Specs/Features/module-spec.md` |
| Launch ADRs | ADR-0003…0014 |
| Schema P-003…P-006 | `Docs/Registers/schema-proposals.md` |
| Proficiency split + formula | `Docs/Specs/Areas/proficiency.md` (OI-019) |
| DB model (+ MC modality) | `Docs/Specs/Areas/data-model.md` (OI-020) |
| SessionEngine Mix / size-10 | `Docs/Specs/Areas/session-engine.md` (OI-021) |
| Web/native/SDK boundaries | `Docs/Specs/Areas/platform.md`; ADR-0014 |
| Panel recs triage | open-items Closed OI-022 |
| Prior handoff | `Docs/Handoffs/001-2026-07-28-a0-continue-a0-4.md` (superseded by this file for “what’s next”) |

## A0-H checklist
1. **Residue scan:** stale status/authority claims, open-items that should be closed/re-homed, wave files consistent with ROADMAP.
2. **Deprecations:** DEP-001 owns the temporary prototype; its A4 trigger has not fired.
3. **Registers:** only **OI-023** (C2 go) and **OI-025** (P-003 backfill — content, not A0 blocker) should remain open for A0-related work.
4. **Repository cleanup:** operator approved broader SSOT/archive/app-content consolidation; execution and proof live in A0-H.
5. `Docs/Waves/A0-H-hygiene.md` is proven with the full relocated contract/content gate evidence.
6. Run **`/close`** per skill: docs reconcile, plain-language recap, design-wave “testing” = decision/spec sign-off list (no clicks). Push **only** on operator GO.
7. After A0 close ready: **OI-023** — one yes/no: un-pause C2 (mass-draft a1-04…a1-12) or keep parked.

## How to work with Mike
- Plain language; outcomes not jargon.
- One numbered yes/no + recommendation.
- Coordinate via files; no assumed chat memory across sessions.

## First message to Mike (kickoff)
Copy/adapt the kickoff block below.
