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
| tests | cache-free `npm run app:test` | PASS — 19 files / 138 tests on isolated close tree |
| build | cache-free `npm run app:build` | PASS — `/api/evaluate` dynamic route |
| smoke | cache-free `npm run app:smoke` | PASS — 16 screen states + accessibility/reflow |

## Audit and review
- Three isolated A2 auditors covered deterministic grading, endpoint security/trust boundaries, and Gateway/failure/cost behavior. Their successive delta audits ended with no code criticals or warnings.
- A fresh high-effort whole-A2 review found fuzzy false-positive `correct` results and missing handler failure telemetry; both were regression-tested, fixed, and passed delta review.
- Close re-audit found a missing Production WAF promotion gate, stale ADR model/empty-answer text,
  missing quota-entity emission, generic/retryable HTTP 402 handling, and a provider 429 without
  `Retry-After`. Regression tests were proven failing first, then code/docs were corrected.
- Two external blockers are owned: OI-036 records the missing distributed serverless perimeter;
  OI-037 records the concurrent push that exposed A2 before approval. Mike asked whether to harden and
  redeploy instead of rolling back; that is the inferred working path, not GO. Neither item is a code defect.
- Authenticated actual-route proof remains the human `/close` step. Automation does not create, extract, or repurpose Clerk user credentials.

## OI-036 corrective pass
- Clean isolated branch `fix/A2-oi-036` adds the user-keyed Firewall SDK layer before the preserved
  local guard. Missing, blocked, malformed, or thrown Firewall checks fail closed before source/AI;
  regional counters are not represented as global or atomic.
- AI grading now requires the evaluation-only Gateway key and exact opaque `usr_` reporting/quota ID.
  Its aggregate $1 monthly budget has request-start soft-cap semantics; per-user denial still needs
  an account policy receipt and rejection proof. Ambient OIDC/legacy fallback is regression-tested off.
- Final gates pass at 19 files / 138 tests, build, smoke, Development DB/Gateway proof, and clean
  independent security/cost delta audits. Earlier diagnostic Preview evidence is not the canonical
  Git acceptance target. OI-036 stays open through authenticated Preview receipts, VERIFIED +
  Production GO, Production-conditioned WAF publication, and released-environment receipts.

## Proof
- Real Development DB + live Gateway: `PASS evaluate-proof development-db=verified comparison=graded gateway=graded persistence=none` (540 input / 218 output / 758 total tokens on the final run).
- Built Next `/api/evaluate`: signed-out Clerk request returned 401 learner-safe JSON with `no-store` and `nosniff`.
- Unit/handler coverage owns invalid JSON/size, answer/model/session spoofing, unsupported source/modality, inactive/deprecated/malformed source, admission, abort/timeout/provider/rate/schema failure, exact/near/semantic-risk comparison, strict output, and safe telemetry.
- The isolated close tree passed App typecheck, zero-warning lint, 19 files / 138 tests, build,
  16-state smoke, and built-route signed-out 401; all Content gates previously passed. Its unified `/close`
  serializes integration and Vercel deploys only `release/**`/`main`, directly addressing OI-037.

## Residue report
- Live source has exactly one API evaluator route, one `EvaluationService`, and one Gateway adapter.
  Old implementations remain only in ignored, catalogued `Archive/Legacy-Apps/` forensic vaults and
  archived design evidence; they are outside workspaces/imports/builds/deployments and stay untouched.
- A2 added no persistence/session or production-set implementation. Request schemas explicitly
  reject `sessionId`/`evaluationId`; A3 owns them. The independently merged fixture-backed Practice
  Sets prototype remains non-production, and the parallel Practice/C2 worktrees were not touched.
- AI SDK/Gateway/Firewall/Zod resolve coherently (`ai@7.0.41`, `@ai-sdk/gateway@4.0.31`,
  `@vercel/firewall@1.2.2`, `zod@3.25.76`). Production audit remains OI-026: 1 moderate + 3 high,
  zero critical, with no compatible fix.
- Environment values remain untracked; only documented variable names changed. No obsolete A2 dependency, duplicate contract, fired deprecation trigger, or unowned scan finding exists.
- Handoff 011 is superseded by STATE plus the A2 wave records. DEP-001 remains correctly pending for A4-2; OI-034 and OI-035 are unrelated and unchanged.

## Local close evidence and external boundary
- Fresh isolated install plus every App gate passed. Built Next with Development auth returned
  signed-out `401`, `no-store`, and `nosniff` from the actual route. The read-only persistence
  receipt query passed against Development with six named columns and both future tables absent.
- Read-only Vercel inspection found no active custom rule and one valid unpublished draft:
  `aidioma-evaluate-user`, Preview only, fixed window 30 requests / 60 seconds. Production is unchanged.
- Preview SDK proof requires Automation Protection Bypass and automatic System Environment Variables.
  The current CLI cannot re-list Gateway budgets, so Mike must bind the deployed env name/scope to
  the same safe key ID in the $1 monthly budget receipt and record quota-policy availability.
- OI-036 remains open. Preview proof is necessary but insufficient: after VERIFIED + Production GO,
  Mike must publish and prove a Production-conditioned equivalent.

## Human Preview verification runsheet
1. Coordinator records candidate SHA, release PR, and immutable Git Preview URL; every CI/deployment
   check must name that SHA. Mike gives PREVIEW GO before the release push.
2. Confirm the SDK Preview prerequisites above. Mike reviews and publishes only the staged Preview
   rule, then records its active rule ID, 30/60 configuration, and Preview condition.
3. Open the immutable Preview, sign in with the test Clerk account, open DevTools Console, and run:
```js
const base={sourceType:'lesson',itemRef:'a1-01.s.01',modality:'translate',direction:'en-es'};
const post=async(userInput,extra={})=>{const r=await fetch('/api/evaluate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...base,userInput,...extra})});return {status:r.status,retryAfter:r.headers.get('retry-after'),cacheControl:r.headers.get('cache-control'),contentTypeOptions:r.headers.get('x-content-type-options'),body:await r.json()}};
await post('Hola, soy Ana.');       // 200, comparison, correct
await post('Hola, soi Ana.');       // 200, comparison, close
await post('Esto no responde.');    // 200, ai, one bounded generation
await post('Hola, soy Ana.',{expectedAnswers:['spoof']}); // 400 invalid_request
await new Promise(r=>setTimeout(r,65000));
const burst=[]; for(let i=0;i<31;i++) burst.push(await post('Hola, soy Ana.'));
burst.map(x=>[x.status,x.retryAfter]); // final request includes 429 and "60"
```
4. Sign out of Clerk while retaining Preview access; repeat one request and expect learner-safe `401`,
   `no-store`, and `nosniff`. Never run the burst or an AI request against current Production.
5. Coordinator records before/after read-only Preview DB receipts: `to_regclass` confirms future
   `practice_sessions`/`evaluations` tables remain absent, and row counts/checksums for `lessons` and
   `lesson_items` remain identical. Mike captures the Firewall event and one Gateway generation with
   evaluation tags, opaque reporting/quota ID, deployed key name/scope, and the same key's $1 monthly
   budget. Record whether this account exposes a per-user quota policy; without a separately approved,
   bounded over-quota rejection proof, make no per-user Gateway denial claim.
```sql
SELECT to_regclass('public.practice_sessions') AS practice_sessions_table,
 to_regclass('public.evaluations') AS evaluations_table,
 (SELECT count(*) FROM lessons) AS lesson_count,
 (SELECT md5(string_agg(row_to_json(l)::text, '|' ORDER BY l.id)) FROM lessons l) AS lesson_hash,
 (SELECT count(*) FROM lesson_items) AS lesson_item_count,
 (SELECT md5(string_agg(row_to_json(i)::text, '|' ORDER BY i.id)) FROM lesson_items i) AS lesson_item_hash;
```
6. Any mismatch means stop and leave Production unchanged. If all pass, Mike says `VERIFIED`;
   Production rule publication and the `main` push still require a separate explicit GO.

## Concurrent publication incident
- After A2-1 was merged locally, another process pushed shared `main` at `0eaa286` without this
  agent invoking push. The remote-tracking reflog records `update by push` at 15:25:33 -0300;
  `git ls-remote` confirms the commit, and Vercel created a Ready Production deployment.
- The deployed endpoint returns the expected safe signed-out 401, but OI-036's distributed control
  is not proven. No rollback, force-push, firewall change, or further main merge was attempted.
  OI-037 owns the cross-agent publication race; retain/harden-forward is the next handoff's working path.
- The race recurred at 16:19: `main` moved to `ec0ef9b` through another process and Vercel
  auto-deployed the fixture-backed Practice prototype UI. The isolated A2 corrective commit is not in
  that deployment; no merge, push, rollback, or Production promotion was attempted here.

## Decisions
- Normalized exact authored matches are the only deterministic `correct`; safe character-near substitutions are `close`; structural, numeric, negation, and other meaning-uncertain matches reach AI once.
- A2 remains stateless. This agent made no push or production-config mutation; all further remote
  action still requires Mike's direction, and normal publication requires VERIFIED plus separate GO.
