---
title: C2-1 — Draft and gate the remaining A1 launch lessons
type: wave-slice
status: active
updated: 2026-07-30
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

## a1-05 checkpoint — L1 proven; L2 blocked 2026-07-30
- Drafted `a1-05-ser-y-estar` at `contentVersion: 2`: 15 raw vocab rows (eight conceptual
  groups after the number set), 18 sentences, six passage segments, four quick checks, and one
  complete 0–30 reference card. The five-lesson corpus validates and exports deterministically.
- L2 r1 found 4 major and 4 minor issues. All seven locally fixable findings and 13 missing English
  alternates were corrected; the read-only r2 delta audit is clean for those fixes.
- L2 remains FAIL on one major contract blocker: 23 number members are study-only, because the
  binding one-ID-per-number rule needs 38 raw vocab rows while `Lesson.vocab.max(15)` allows 15.
  P-007 proposes widening only the raw ceiling while CI retains the 8–15 conceptual-load limit.
- Whole-diff review found the validator omitted reference-card IDs/refs and the prototype exporter
  dropped vocab accept sets. Both were fixed; three regression checks raise fixtures to 21/21, the
  missing reference-card ID is snapshotted, generated vocab answers are complete, and delta review is clean.
  First PR CI then exposed the App seed test's hard-coded four-lesson corpus; its expected list now
  includes a1-05 and the full App test suite passes 140/140.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run content:typecheck` | PASS at blocked a1-05 checkpoint |
| validate | `npm run content:validate` | PASS — 0 errors across five lessons; five documented a1-01 warnings; a1-05 0/0/0 |
| smoke | `npm run contract:smoke && npm run content:fixtures && npm run prototype:check` | PASS — 13/13, 21/21, current five-lesson export |

## Audit (stage 3)
- Auditors: independent linguistic QA per new lesson plus a tooling/contract audit for OI-025.
- Findings: OI-025 and a1-04 are closed. a1-05's seven local findings plus two integration-review
  findings are closed; P-007 owns the sole remaining major.
- Delta re-audits: a1-04 r3 PASS; a1-05 r2 clean for local fixes; tooling review CLEAN.

## Review (stage 4)
- a1-04 L2-PASS (r3). a1-05 remains L2-FAIL (r2, P-007); a1-06 has not started.

## Proof (stage 6)
- Five-lesson corpus validates with zero errors and exports deterministically to the prototype.
  Full 12-lesson proof remains pending.

## Clean (stage 7)
- Pending.

## Decisions
- Operator approved un-pausing C2 on 2026-07-28, with OI-025 completed before new lesson drafting.
- P-007 is proposed, not approved; no schema change or claim of complete 0–30 typed coverage was made.
