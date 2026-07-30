---
title: A2-H — Evaluation hygiene and close readiness
type: wave-slice
status: proven
updated: 2026-07-30
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
- AI grading now requires the evaluation-only Gateway key and exact opaque `usr_` reporting ID.
  Its aggregate $1 monthly budget has request-start soft-cap semantics; per-user denial still needs
  an account policy receipt and rejection proof. The unsupported `quotaEntityId` option is omitted;
  ambient OIDC/legacy fallback is regression-tested off.
- Final gates pass at 19 files / 138 tests, build, smoke, Development DB/Gateway proof, and clean
  independent security/cost delta audits. Earlier diagnostic Preview evidence is not the canonical
  Git acceptance target. OI-036 stays open through authenticated Preview receipts and, when the
  batch is shipped, Production-conditioned WAF publication plus released-environment receipts.

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
- Canonical PR #2 deployed close SHA `9ef2f5e`; CI/Vercel passed. Preview rule
  `rule_a_idioma_evaluate_user_limit_preview_kqNZKH` is active at 30 requests / 60 seconds and
  conditioned on Preview only. Production remains unchanged.
- Authenticated Preview proof returned comparison `200`/`200`, AI `503`, and spoof rejection `400`.
  The burst stopped before rate-limit testing. Request `f3965a82-1813-4b75-9af7-aa9da37e15db`
  reached the AI service path, but no corresponding Gateway event was registered.
- BUG-001 owns the failure. The named Gateway key is active at `$0.001528/$1` monthly spend, so
  budget exhaustion is excluded; the remaining evidence points to pre-generation authentication or
  request configuration, while the old safe log discarded the upstream status.
- Isolated diagnostic candidate `fix/BUG-001-preview-ai-503` retains only bounded HTTP status,
  marks deterministic 4xx non-retryable, and logs no provider body/code. Its full App suite passes
  19 files / 140 tests, build, and 16-state smoke; the required audit and delta audit are clean.
- At that point OI-036 and BUG-001 remained open pending a replacement Git Preview with safe upstream
  status followed by AI, burst, Gateway, budget, and Production receipts. The resolution follows.

## Replacement Preview close receipt
- Candidate `9cdca857f626685bf07129c42e6ddf770d16a5e2` passed App/Content CI and Vercel at
  `https://aidioma-bcfc7v6t4-agoralabs.vercel.app`; signed-out route proof returned learner-safe
  `401` with `no-store` and `nosniff`.
- Authenticated exact/close comparison returned 200, answer spoofing returned 400, and two AI calls
  returned 200. Generation `gen_01KYSRR270STHKRM686R45DHTC` finished through
  `openai/gpt-5-mini` with 535 input / 144 output tokens and `$0.00072175` recorded cost.
- Gateway reporting showed only opaque `usr_` IDs and all three expected evaluation tags. The active
  evaluation-key budget showed `$0.0029955/$1`, monthly refresh, and 50/75/100% alerts.
- A fresh 31-request window returned exactly 30 comparison 200s followed by one admission 429
  (`cf3f6741-0b8f-417b-b98a-cb98bd498dd9`). No account per-user policy receipt is available, so
  no Gateway per-user denial is claimed; the proven Firewall/local layers remain the launch control.
- A1-H already proved the isolated Preview database at 4 lessons / 134 items. Vercel correctly
  prevents decryption of its Sensitive Preview database values outside the deployment; A2's exact
  source path is SELECT-only and contains no persistence table or write path, so no credential was
  extracted merely to repeat hashes. A3 still owns the first evaluation write.
- BUG-001 is closed. A2 is queued in the cumulative Preview batch. OI-036 remains open only for the
  Production-conditioned Firewall and released-environment proof after explicit `SHIP`.

## Human Preview verification runsheet
1. Coordinator `/close` records candidate SHA, release PR, and immutable Git Preview URL; every
   CI/deployment check must name that SHA. `/close` itself authorizes the release Preview update.
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
   evaluation tags, opaque reporting ID, deployed key name/scope, and the same key's $1 monthly
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
6. Any mismatch means stop and leave A2 active and Production unchanged. If all pass, close A2 into
   the cumulative Preview batch. Production rule publication and `main` still require `SHIP`; Mike
   may first close additional waves into the same batch and test the final cumulative Preview once.

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
- A2 remains stateless. Coordinator `/close` may update only the cumulative Preview; Production
  configuration and `main` remain unchanged until Mike says `SHIP` for the exact tested batch.
