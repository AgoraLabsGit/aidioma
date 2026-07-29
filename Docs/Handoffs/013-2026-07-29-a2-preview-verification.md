---
title: Handoff — verify A2 hardened Preview
type: handoff
status: active
updated: 2026-07-29
---

# Handoff — verify A2 hardened Preview

**Role:** Mike completes the human Preview gate; agent records evidence and waits for VERIFIED
**Hard rule:** no push, Production Firewall publication, or Production promotion before explicit
`VERIFIED` and a later separate `GO`.

## Position

- Retain/harden-forward remains the inferred working direction, not publication GO. During this
  correction another process pushed `main` to `ec0ef9b` and Vercel auto-deployed it at 16:19. It
  includes the fixture-backed Practice prototype UI and the earlier A2, but not this hardening.
- The corrective line exists only in clean `.worktrees/a2-hardening` on `fix/A2-oi-036` at
  `8562991`. It adds
  opaque user-keyed Vercel Firewall SDK admission before the preserved local guard and requires a
  dedicated evaluation-only Gateway key plus opaque user attribution before any AI call.
- Firewall fixed-window counters are per-region, not globally atomic. The key has one aggregate $1
  monthly budget across Development/Preview/Production with 50/75/100% alerts. Gateway checks at
  request start, so crossing/in-flight calls may overshoot; the budget is not an absolute cap.
- The account exposes Gateway user attribution but no enforceable per-user budget. No stronger
  per-user claim is allowed.
- The final Preview is READY at `https://aidioma-9tt8r0ppp-agoralabs.vercel.app`; authenticated CLI
  proof returns the expected signed-out 401 with `no-store` and `nosniff`. The matching Preview-only
  Firewall rule `aidioma-evaluate-user` is staged as a draft, not published. Production Firewall
  remains unchanged.

## Evidence

- Final code gates: typecheck, zero-warning lint, 19 files / 133 tests, build, 16-state smoke.
- Development proof with the budgeted key:
  `PASS evaluate-proof development-db=verified comparison=graded gateway=graded persistence=none`;
  observed final AI generation was 540 input / 206 output / 746 total tokens.
- Security and cost audits plus delta audits are clean after requiring exact
  `usr_[a-f0-9]{32}` attribution, explicit no-legacy/OIDC fallback, and early perimeter ordering.
- Dependency audit is unchanged at 1 moderate / 3 high / 0 critical with no compatible fix (OI-026).
- `vercel ai-gateway budgets list` confirms the API-key-scoped $1 monthly budget at $0.00 rounded
  spend; `api-keys inspect` misleadingly renders `budget none`, so the budget listing is the receipt.

## Remaining close gate

1. Mike publishes only the staged Preview rule, signs in with the existing test-class Clerk account,
   and runs the exact endpoint script in the close recap.
2. Capture learner-safe comparison/correct, comparison/close, one AI result, spoof 400, signed-out
   401, limit 429 + `Retry-After`, Firewall event, Gateway generation/user attribution, and no writes.
3. Keep OI-036/A2 active until that evidence passes. Then Mike may say `VERIFIED`; ask separately
   for `GO`. Because remote `main` moved, build a deliberate resolved publication commit in a clean
   worktree after GO; do not push `8562991` as-is or silently absorb prototype scope.

## Scope stays fixed

- A2 remains stateless evaluation only. A3 owns persistence, A4 owns real session UI, and A6 owns
  Production Practice Sets. Root, Practice prototype worktrees, C2, and their branches remain untouched.
