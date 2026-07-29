---
title: A2-1 — Secure comparison-first evaluation endpoint
type: wave-slice
status: proven
updated: 2026-07-29
---

# A2-1 — Secure comparison-first evaluation endpoint

## Brief
- **Lane:** App
- **Goal:** Deliver one authenticated `/api/evaluate` endpoint that resolves server-owned answers, grades deterministic matches locally, and calls Gateway AI once only for poor matches.
- **Touches:** `apps/web` evaluation domain/service/API code and tests; AI SDK dependency metadata; evaluation/platform specs; A2 roadmap/state records.
- **Out of scope:** evaluation/session persistence (A3), SessionEngine and real practice UI (A4), production Practice Sets (A6), content authoring, live-key promotion, and either parallel worktree.
- **Verify plan:** Run every App gate; prove exact, near, poor/AI, provider-failure, invalid-input, answer-spoofing, unauthenticated, inactive/deprecated, and unsupported-source paths through the real route; record compact evidence without secrets or private text.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | cache-free `npm run app:typecheck` | PASS |
| lint | cache-free `npm run app:lint` | PASS — zero warnings |
| tests (baseline: 11 files / 39 tests) | cache-free `npm run app:test` | PASS — 17 files / 109 tests |
| build | cache-free `npm run app:build` | PASS — `/api/evaluate` is a dynamic route |
| smoke | cache-free `npm run app:smoke` | PASS — 16 screen states + accessibility/reflow |

## Audit (stage 3)
- Auditors: three isolated read-only passes: endpoint security/trust boundary, comparison correctness, and Gateway/failure/observability behavior.
- Initial findings exposed deterministic false positives for changed negation/numbers and edits
  hidden beyond response caps; UTF-16/schema mismatches; missing prompt/output/call budgets;
  incomplete failure telemetry; and per-instance-only abuse control. Regression tests and fixes now
  cover numeric order/units/0–100 words, long/Unicode answers, changed-step-first diffs, exact-only
  `correct`, bounded prompts/output, safe handler events, and admission before database/AI work.
- Delta re-audits: PASS — comparison, provider, and endpoint-security auditors report no remaining
  code criticals or warnings. Distributed production control is intentionally owned by OI-036.

## Review (stage 4)
- High-effort whole-diff review: no criticals. Fuzzy `correct` results and swallowed handler
  failures were fixed and the delta review passed. The per-instance limit is not misrepresented as
  distributed; OI-036 blocks production promotion. An authenticated real-route call remains in the
  human A2 `/close` test because automated proof does not create or repurpose Clerk credentials.

## Proof (stage 6)
- Real Development DB + live Gateway proof PASS:
  `PASS evaluate-proof development-db=verified comparison=graded gateway=graded persistence=none`.
  The final AI call used `openai/gpt-5-mini`, 540 input / 218 output / 758 total tokens, under the
  800-token ceiling. A built Next server on port 3100 returned real Clerk-signed-out `401` JSON with
  `no-store` and `nosniff` for `POST /api/evaluate`. Unit/handler tests prove spoofing, invalid,
  unsupported, inactive/deprecated, provider/schema/timeout, and admission paths without secrets.

## Clean (stage 7)
- A2 creates the only live evaluator in the greenfield app; archived V1/V2 services remain read-only
  evidence and were not ported. No live superseded evaluator was found. A2-H owns the final residue,
  register, spec, and dependency reconciliation; OI-036 is a named pre-promotion control, not residue.

## Decisions
- A2 stops at grading. A3 owns all `practice_sessions`/`evaluations` persistence and derived stats.
- A2 accepts authenticated lesson translation only. It does not accept an unverifiable practice-session ID; A3 adds that reference and ownership check with the real session table.
- Default Gateway model remains `openai/gpt-5-mini`; `anthropic/claude-haiku-4.5` remains the same-interface bake-off alternative. Both IDs were present in the live Gateway catalog at wave open.
