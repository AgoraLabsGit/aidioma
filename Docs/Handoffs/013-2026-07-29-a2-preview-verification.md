---
title: Handoff — verify reconciled A2 release candidate
type: handoff
status: superseded
updated: 2026-07-29
---

# Handoff — verify reconciled A2 release candidate

> Superseded by Handoff 014 after branch reconciliation and the unified `/close` workflow.

**Role:** Mike completes the human Preview gate; agent records evidence and waits for VERIFIED
**Hard rule:** the release-candidate branch may be pushed for PR/Preview proof. Never merge/push
`main`, publish a Production Firewall rule, or promote Production before explicit `VERIFIED` and GO.

## Position

- PR #1's current head is the canonical release candidate. Read its SHA and immutable deployment URL
  from the GitHub/Vercel checks at verification time; do not copy an earlier CLI or PR deployment.
  It reconciles the revised Practice IA, A2 hardening, responsive auth/settings, and current Docs.
- The candidate adds opaque user-keyed Vercel Firewall SDK admission before the preserved local
  guard and requires a dedicated evaluation-only Gateway key plus opaque attribution before AI.
- Firewall fixed-window counters are per-region, not globally atomic. The key has one aggregate $1
  monthly budget across Development/Preview/Production with 50/75/100% alerts. Gateway checks at
  request start, so crossing/in-flight calls may overshoot; the budget is not an absolute cap.
- The account exposes Gateway user attribution but no enforceable per-user budget. No stronger
  per-user claim is allowed.
- App CI, Content CI, and Vercel deployment checks must pass on PR #1's current head. Its exact
  commit deployment must return the expected signed-out 401 with `no-store` and `nosniff`. The
  Preview-only rule `aidioma-evaluate-user` is staged but unpublished; Production is unchanged.

## Evidence

- Final candidate gates: typecheck, zero-warning lint, 19 files / 137 tests, build, 16-state smoke.
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
3. Keep OI-036/A2 active until that evidence passes. Then Mike may say `VERIFIED` and separately
   `GO`. Fast-forward local and remote `main` to the exact verified candidate, verify its Production
   deployment, then close OI-036/OI-037 and remove the candidate branch.

## Scope stays fixed

- A2 remains stateless evaluation only. A3 owns persistence, A4 owns real session UI, and A6 owns
  Production Practice Sets. Root, Practice prototype worktrees, C2, and their branches remain untouched.
