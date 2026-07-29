---
title: A2-H — Evaluation hygiene and close readiness
type: wave-slice
status: proven
updated: 2026-07-29
---

# A2-H — Evaluation hygiene and close readiness

## Brief
- **Lane:** App
- **Goal:** Leave one owned evaluator, current specs/registers, reproducible proof, and no hidden A2 residue before the operator close.
- **Touches:** A2 records, evaluation/platform specs, registers, dependency and residue evidence; no product-scope expansion.
- **Out of scope:** persistence (A3), real session UI (A4), production Practice Sets (A6), either parallel worktree, deployment, production configuration, and push.
- **Verify plan:** run the cache-free App suite on integrated `main`; scan live source/docs/dependencies; verify real Development DB + Gateway proof and actual unauthenticated Next route; audit the whole A2 diff.

## Gates (stage 2)
| Gate | Command | Result |
|---|---|---|
| typecheck | cache-free `npm run app:typecheck` | PASS |
| lint | cache-free `npm run app:lint` | PASS — zero warnings |
| tests | cache-free `npm run app:test` | PASS — 18 files / 116 tests on integrated main |
| build | cache-free `npm run app:build` | PASS — `/api/evaluate` dynamic route |
| smoke | cache-free `npm run app:smoke` | PASS — 16 screen states + accessibility/reflow |

## Audit and review
- Three isolated A2 auditors covered deterministic grading, endpoint security/trust boundaries, and Gateway/failure/cost behavior. Their successive delta audits ended with no code criticals or warnings.
- A fresh high-effort whole-A2 review found fuzzy false-positive `correct` results and missing handler failure telemetry; both were regression-tested, fixed, and passed delta review.
- Two external blockers are owned: OI-036 records the missing distributed serverless perimeter;
  OI-037 records the concurrent push that exposed A2 before approval. Mike asked whether to harden and
  redeploy instead of rolling back; that is the inferred working path, not GO. Neither item is a code defect.
- Authenticated actual-route proof remains the human `/close` step. Automation does not create, extract, or repurpose Clerk user credentials.

## Proof
- Real Development DB + live Gateway: `PASS evaluate-proof development-db=verified comparison=graded gateway=graded persistence=none` (540 input / 218 output / 758 total tokens on the final run).
- Built Next `/api/evaluate`: signed-out Clerk request returned 401 learner-safe JSON with `no-store` and `nosniff`.
- Unit/handler coverage owns invalid JSON/size, answer/model/session spoofing, unsupported source/modality, inactive/deprecated/malformed source, admission, abort/timeout/provider/rate/schema failure, exact/near/semantic-risk comparison, strict output, and safe telemetry.

## Residue report
- Live source has exactly one API evaluator route, one `EvaluationService`, and one Gateway adapter. Searches found no live `claude-service`, `universal-ai-learning`, `claude-mvp`, or superseded sentence-evaluation route; references survive only in archived evidence and the roadmap history.
- A2 added no persistence/session or production-set implementation. Request schemas explicitly
  reject `sessionId`/`evaluationId`; A3 owns them. The independently merged fixture-backed Practice
  Sets prototype remains non-production, and the parallel Practice/C2 worktrees were not touched.
- AI SDK/Gateway/Zod resolve coherently (`ai@7.0.41`, `@ai-sdk/gateway@4.0.31`, `zod@3.25.76`). Production audit remains the already-owned OI-026 baseline: 1 moderate + 3 high, zero critical, with no compatible fix.
- Environment values remain untracked; only documented variable names changed. No obsolete A2 dependency, duplicate contract, fired deprecation trigger, or unowned scan finding exists.
- Handoff 011 is superseded by STATE plus the A2 wave records. DEP-001 remains correctly pending for A4-2; OI-034 and OI-035 are unrelated and unchanged.

## Concurrent publication incident
- After A2-1 was merged locally, another process pushed shared `main` at `0eaa286` without this
  agent invoking push. The remote-tracking reflog records `update by push` at 15:25:33 -0300;
  `git ls-remote` confirms the commit, and Vercel created a Ready Production deployment.
- The deployed endpoint returns the expected safe signed-out 401, but OI-036's distributed control
  is not proven. No rollback, force-push, firewall change, or further main merge was attempted.
  OI-037 owns the cross-agent publication race; retain/harden-forward is the next handoff's working path.

## Decisions
- Normalized exact authored matches are the only deterministic `correct`; safe character-near substitutions are `close`; structural, numeric, negation, and other meaning-uncertain matches reach AI once.
- A2 remains stateless. This agent made no push or production-config mutation; all further remote
  action still requires Mike's direction, and normal publication requires VERIFIED plus separate GO.
