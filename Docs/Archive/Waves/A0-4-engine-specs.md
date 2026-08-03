---
title: A0-4 — Engine specs (Area specs)
type: wave-slice
status: closed
updated: 2026-07-28
---

# A0-4 — Engine specs

## Brief
- **Lane:** App
- **Goal:** Proficiency, DB, SessionEngine, and leftover panel recs settled into Area specs / register closes — no app code.
- **Touches:** `Docs/Specs/Areas/*`, open-items, STATE, handoff 001
- **Out of scope:** App scaffold; content mass-draft; folder cleanup (A0-H)
- **Verify plan:** Design-only — peer consistency vs ADRs 0003–0012 + Consensus §1.3–1.4

## Gates (design)
| Gate | Result |
|---|---|
| Consistency vs ADR-0004/0011 (proficiency split) | PASS |
| Consistency vs Consensus DB + ADR-0006 (no eval cache) | PASS |
| Consistency vs Consensus blender + OI-002 three recipes | PASS |
| OI-022 panel triage vs ADRs (no reopen superseded) | PASS |

## Audit
- Sizing: 1 light (additive specs only). Main-thread triage.
- Findings: none blocking. P-001 leftover (MC → evaluations modality) surfaced for A0-H lock.

## Proof
- OI-019 → `Specs/Areas/proficiency.md`
- OI-020 → `Specs/Areas/data-model.md`
- OI-021 → `Specs/Areas/session-engine.md`
- OI-022 → open-items Closed (ADR map)

## Decisions
- Live today’s accuracy ≠ next-day confirmed proficiency
- Confirmed = coverage × best-score + recency + later-day gate
- DB model confirmed; SessionEngine Continue=Mix / Blend·Review=size-10
- Panel list closed; vocab 12–15 and Both-direction win over older panel wording
