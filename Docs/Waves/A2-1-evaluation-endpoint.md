---
title: A2-1 — Secure comparison-first evaluation endpoint
type: wave-slice
status: active
updated: 2026-07-29
---

# A2-1 — Secure comparison-first evaluation endpoint

## Brief
- **Lane:** App
- **Goal:** Deliver one authenticated `/api/evaluate` endpoint that resolves server-owned answers, grades deterministic matches locally, and calls Gateway AI once only for poor matches.
- **Touches:** `apps/web` evaluation domain/service/API code and tests; AI SDK dependency metadata; evaluation/platform specs; A2 roadmap/state records.
- **Out of scope:** evaluation/session persistence (A3), SessionEngine and real practice UI (A4), production Practice Sets (A6), content authoring, live-key promotion, and either parallel worktree.
- **Verify plan:** Run every App gate; prove exact, near, poor/AI, provider-failure, invalid-input, answer-spoofing, and cross-user/session rejection paths through the real route; record compact evidence without secrets or private text.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run app:typecheck` | pending |
| lint | `npm run app:lint` | pending |
| tests (baseline: 11 files / 39 tests) | `npm run app:test` | pending |
| build | `npm run app:build` | pending |
| smoke | `npm run app:smoke` | pending |

## Audit (stage 3)
- Auditors: three isolated read-only passes: endpoint security/trust boundary, comparison correctness, and Gateway/failure/observability behavior.
- Findings: pending.
- Delta re-audit: pending.

## Review (stage 4)
- High-effort review of the full slice diff: pending.

## Proof (stage 6)
- Real endpoint/service proof: pending.

## Clean (stage 7)
- A2 creates the only live evaluator in the greenfield app; archived V1/V2 services remain read-only evidence and are not ported. Residue scan pending.

## Decisions
- A2 stops at grading. A3 owns all `practice_sessions`/`evaluations` persistence and derived stats.
- Default Gateway model remains `openai/gpt-5-mini`; `anthropic/claude-haiku-4.5` remains the same-interface bake-off alternative. Both IDs were present in the live Gateway catalog at wave open.
