---
title: C2-1 — Draft and gate the remaining A1 launch lessons
type: wave-slice
status: active
updated: 2026-07-28
---

# C2-1 — Draft and gate the remaining A1 launch lessons

## Brief
- **Lane:** Content
- **Goal:** Complete OI-025, then deliver a1-04…a1-12 through validator and independent L2 QA so all 12 launch lessons are app-ready.
- **Touches:** `content/` and `tooling/content/`; coordinator-only status updates in this wave record, ROADMAP, STATE, and registers.
- **Out of scope:** App code, root workspace integration, dialect content, frequency/custom decks, native-speaker L4 review, remote configuration, and push.
- **Verify plan:** `npm run content:typecheck`; `npm run content:validate`; `npm run contract:smoke && npm run content:fixtures && npm run prototype:check`; proof includes OI-025 regression fixtures followed by a 12-lesson corpus validation and prototype export check.

## Ordered execution
1. OI-025: backfill P-003 vocab accept sets in a1-01…a1-03; partition validator check 5 by `setId`; reconcile curriculum, style, prompts, and tooling guidance to Both-direction default.
2. Prove OI-025 with the full content gate and record the evidence before drafting new lessons.
3. Draft a1-04…a1-12 from the approved curriculum/style/contracts, with cumulative-vocabulary discipline.
4. For each lesson: validator zero errors → independent adversarial L2 QA → fix loop → revalidation → `content/review/REVIEW-LOG.md`.

## OI-025 checkpoint — proven 2026-07-28
- All 30 vocab items in a1-01…a1-03 now have explicit reviewed Both-direction accept arrays; lesson versions are 3 and immutable IDs are unchanged.
- Validator check 5 partitions closed sets by `setId`; paired regressions prove represented-set PASS and unrepresented-set single-error behavior.
- Gates: typecheck PASS; validate PASS with 0 errors; contract smoke 13/13; fixtures 18/18; prototype freshness PASS.
- Independent audit: 0 critical, 2 warnings, 1 note. All were fixed; two focused delta re-audits passed clean.
- Local integration: merged to `main` at `891c1c5`; no remote or push.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run content:typecheck` | pending |
| validate | `npm run content:validate` | pending |
| smoke | `npm run contract:smoke && npm run content:fixtures && npm run prototype:check` | pending |

## Audit (stage 3)
- Auditors: independent linguistic QA per new lesson plus a tooling/contract audit for OI-025.
- Findings: pending.
- Delta re-audit: pending.

## Review (stage 4)
- Pending.

## Proof (stage 6)
- Pending.

## Clean (stage 7)
- Pending.

## Decisions
- Operator approved un-pausing C2 on 2026-07-28, with OI-025 completed before new lesson drafting.
