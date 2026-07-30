---
title: A2R application baseline audit
type: audit
status: active
updated: 2026-07-30
---

# A2R application baseline audit

## Verdict

**Overall: B− / conditional.** The shipped A2 read-only evaluation foundation is well-factored and
defensive, but A3 must not make its first learner-data write until runtime database privilege and
environment binding (OI-041) plus atomic/idempotent persistence (OI-045) are settled. A2R-1 itself
remains active until a fresh authenticated immutable-Preview browser → API → Neon receipt satisfies
OI-044. No A3 or A6 behavior and no UI change was implemented by this audit.

| Area | Grade | Evidence-backed position |
|---|---|---|
| Architecture | B | Clear server-only DB/evaluation ports and shared content contract; fixture and hardcoded UI seams remain intentionally owned by A3/A4 and DEP-001. |
| Security | B− | Strong auth-first, bounded, source-authoritative evaluation path; owner runtime DB credentials, one cross-environment Gateway key, and missing browser-header policy lower the baseline. |
| Integration | B | All deterministic gates and public deployed routes pass; real Development Neon comparison passes; fresh authenticated Preview evidence is still owed. |
| Reliability | C+ | Fail-closed evaluation behavior is good, but A3 lacks an idempotent/atomic write contract, real recovery UI, and persistence observability. |
| Delivery | C+ | CI is pinned and comprehensive for current gates; route smoke is incomplete and a docs-only merge created an unapproved Production rebuild. |

## Evidence

- Source/integration SHA audited: `3da1ae7` (post-SHIP `origin/main`); deployable app tree equals the
  shipped `c3f50be` tree.
- App gates: typecheck PASS; lint PASS with zero warnings; tests PASS at 19 files / 140 tests;
  production build PASS; browser smoke PASS at 16 states including axe, keyboard, reduced motion,
  200% text, responsive overflow, theme, and keyless auth.
- The first isolated build attempt failed only because the new worktree lacked a local dependency
  tree; after `npm ci`, build and smoke passed. This is worktree setup evidence, not a product defect.
- Read-only Development flow: `PASS a2r-readonly-development-flow db-identity=verified
  source=neon handler=graded comparison=200 ai=0 persistence=none`.
- Production HTTP: `/`, `/lessons`, `/practice`, and `/settings` returned 200; an unknown lesson
  returned 404; signed-out `/api/evaluate` returned 401 with `no-store`, `nosniff`, a safe error code,
  and request ID. The immutable A2 Preview remained Vercel-protected (302 to `vercel.com`).
- Live header receipt: HSTS present; CSP, frame protection, Referrer-Policy, Permissions-Policy, and
  page-level `nosniff` absent (OI-043).
- `npm audit --omit=dev`: four known Production findings (one moderate, three high) through
  Next/PostCSS/optional Sharp, no compatible fix; already owned by OI-026.
- Vercel CLI confirmed project Node 22.x, but deployed Function metadata reports `nodejs24.x`
  (OI-049). It also confirmed PR #3 created a new Production deployment and aliases (BUG-002).
- Three isolated read-only subaudits covered code/trust seams, platform/integrations, and
  quality/operability. No critical finding was reported.

## Findings and ownership

### High

1. **Runtime DB privilege and environment binding — OI-041.** `db/index.ts:19-31` trusts any URL,
   while `platform.md:35-39` documents database-owner runtime credentials. Script guards do not
   protect runtime. Split owner/runtime roles and attest database plus role before A3 writes.
2. **Cross-environment Gateway credential and budget — OI-042.** `platform.md:41-43` records the
   shared key; split and re-prove all scopes before real users.
3. **Fresh deployed auth/data proof — OI-044.** `smoke.mjs:328-337` blanks Clerk/Neon and
   `prove-evaluate.ts:38,73` injects auth. A current same-origin Preview session is required before A2R-1 can
   be proven.
4. **A3 retry and transaction contract — OI-045.** `contracts.ts:17`/`data-model.md:41` omit a stable submission key. Add database uniqueness,
   and one atomic evaluation+rollup transaction before learner persistence begins.

### Moderate

5. **Browser containment headers — OI-043.** `next.config.ts:7-13` has no policy; add and live-prove a Clerk-compatible one.
6. **Route/API smoke coverage — OI-046.** `smoke.mjs:26-32` omits lesson detail, sign-up, 404, and route-level API
   behavior, then extend with real A3/A4 states.
7. **Data-route recovery — OI-047.** Add App Router error boundaries in A3-1.
8. **Grading recovery UX — OI-052.** Prove retry/cancel/input preservation and focus in A4-1.
9. **Application observability — OI-048.** Add safe deployment, cost, transaction, and rollback signals in A3-1.
10. **Operational alerts — OI-051.** Define dashboard ownership and thresholds for A7-2/prelaunch.
11. **Unbounded dependency waits — OI-050.** `evaluate-handler.ts:175,252,298` awaits Clerk, Firewall,
   and Neon without route deadlines; only `gateway-evaluator.ts:26` is bounded.
12. **Unapproved docs-only Production rebuild — BUG-002.** PR #3 reassigned aliases without `SHIP`;
   the app tree was unchanged, which bounded impact but does not satisfy the release contract.

13. **Node-major drift — OI-049.** `package.json:6-8`
    permits future majors while live Function metadata reported Node 24; align and prove before A3 Preview.

### Already owned

14. **Dependency advisories — OI-026.** Current disposition remains valid; recheck patched releases.
15. **Clerk live-key promotion — OI-034.** Still blocks invitations to real users.
16. **Fixture/hardcoded UI data.** Existing owners are A3-1, A4-2, and DEP-001; no duplicate row.

## Verified strengths

- Auth executes before request parsing; strict schemas reject client answer/model/session authority,
  and declared plus streamed bodies are bounded.
- Stored source resolution stays server-side, validates payloads, excludes inactive/deprecated rows,
  and bounds every AI prompt field.
- Firewall admission and the local concurrency/burst guard precede source/AI work and fail closed;
  local admission always releases in `finally`.
- Gateway calls are allowlisted, dedicated-key-only, structured-output validated, zero-retry,
  12-second bounded, 800-token capped, and learner-safe on failure.
- Responses are request-correlated, `no-store`, and `nosniff`; logs omit learner text, answers,
  raw user IDs, credentials, and provider bodies.
- Migration/seed tooling is identity-checked, checksum-journaled, transactionally locked,
  rollback-safe, drift-asserted, and explicitly gated for Production writes.
- CI actions are SHA-pinned with read-only permissions, exact Node setup, `npm ci`, timeouts, and the
  full App gate suite; tracked secret scanning found no credential candidate.

## Required remaining proof

Using an existing signed-in immutable Preview session, record only safe status/headers/request-ID
presence/verdict source plus redacted platform receipts—never cookies, tokens, user IDs, prompts,
authored answers, or provider bodies:

| Case | Expected |
|---|---|
| Exact and character-near authored answers | 200 comparison; no Gateway generation |
| One poor match | 200 AI; one bounded allowlisted Gateway generation |
| Spoofed field and missing item | 400 / 404; no AI work; learner-safe body |
| Signed out | 401, `no-store`, `nosniff`; no Neon/Gateway work |
| Comparison-only burst | 30 successes, then 429 with `Retry-After: 60`; no AI spend |

Read-only database identity, lesson/item counts, and deterministic hashes must match before/after.
Until this passes, A2R-1 stays active and A3 remains blocked by the A2R wave dependency.
