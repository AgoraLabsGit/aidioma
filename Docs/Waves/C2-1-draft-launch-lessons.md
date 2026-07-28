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

## a1-04 checkpoint — L2 proven 2026-07-28
- Drafted `a1-04-donde-esta` with 13 active vocabulary items, 18 active sentences, six passage
  segments, a conversation, and four quick checks; `contentVersion` is 2 and IDs are immutable.
- L2 r1 found 3 critical, 4 major, and 5 minor issues. The fix loop closed all 12; r2 then caught
  the required version bump. Narrow r3 passed with 0 findings. Evidence:
  `content/review/qa/a1-04.qa1.json`, `a1-04.qa2.json`, and `a1-04.qa3.json`.
- Latest merged gates: typecheck PASS; validate PASS with a1-04 at 0/0/0 and 0 corpus errors;
  contract smoke 13/13; fixtures 18/18; prototype freshness PASS.
- Local integration: lesson merged at `b96097e`; generated prototype data refreshed at `38dc0af`.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run content:typecheck` | PASS at a1-04 checkpoint |
| validate | `npm run content:validate` | PASS — 0 errors across four lessons; five documented a1-01 warnings |
| smoke | `npm run contract:smoke && npm run content:fixtures && npm run prototype:check` | PASS — 13/13, 18/18, current export |

## Audit (stage 3)
- Auditors: independent linguistic QA per new lesson plus a tooling/contract audit for OI-025.
- Findings: OI-025 contract audit closed; a1-04 L2 r1 findings and the r2 versioning blocker are
  closed. The slice remains active for a1-05…a1-12.
- Delta re-audit: a1-04 r3 PASS with 0 findings.

## Review (stage 4)
- a1-04 L2-PASS (r3). Remaining lessons pending.

## Proof (stage 6)
- Four-lesson corpus validates with zero errors and exports deterministically to the prototype.
  Full 12-lesson proof remains pending.

## Clean (stage 7)
- Pending.

## Decisions
- Operator approved un-pausing C2 on 2026-07-28, with OI-025 completed before new lesson drafting.
