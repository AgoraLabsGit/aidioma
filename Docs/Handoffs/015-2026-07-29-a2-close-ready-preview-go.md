---
title: Handoff — A2 close ready for Preview GO
type: handoff
status: active
updated: 2026-07-29
---

# Handoff — A2 close ready for Preview GO

**Role:** sole A2 release coordinator; do not advance A3 or Production Practice Sets
**Next command:** ask Mike for explicit `PREVIEW GO`

## Exact local position

- Work is isolated at `.worktrees/a2-h-close` on `work/A2-H-close-2026-07-29`, based on release
  candidate `1a1e088`. Resolve its current HEAD dynamically with `git rev-parse HEAD`.
- Nothing from this close session was pushed, deployed, published, or merged. The original
  `release/A2-2026-07-29` worktree remains separate and was not edited.
- A2 and OI-036/OI-037 remain open. A2-H stays proven; external proof and publication gates are
  intentionally not represented as complete.

## Completed close work

- Fresh App suite PASS: typecheck, zero-warning lint, 19 files / 138 tests, production build with
  dynamic `/api/evaluate`, and 16-state smoke. Built-route signed-out proof returned `401` with
  `no-store` and `nosniff`; production dependency audit remains OI-026 at 1 moderate / 3 high.
- Residue is dispositioned: one live route/service/Gateway adapter. Old V1/V2 evaluators remain only
  in ignored, catalogued forensic vaults outside the workspace/build/deployment graph. DEP-001 has
  not fired; no A3 persistence or Production A6 work was added.
- Security close fixes emit the opaque Gateway `quotaEntityId`, classify budget HTTP 402 as
  non-retryable, add `Retry-After` to provider 429, and explicitly test no legacy/OIDC fallback.
- Docs now require a Production-conditioned WAF rule after VERIFIED + Production GO. The valid
  unpublished draft is Preview-only at 30 requests / 60 seconds; Production remains unchanged.
- Independent residue, security/cost, and whole-release reviews were triaged. The exact human
  script and receipts checklist live in `Docs/Waves/A2-H-hygiene.md`.

## Next gated actions

1. On explicit PREVIEW GO, integrate this exact close commit into `release/A2-2026-07-29`, rerun
   preflight, push the release branch once, and open the canonical release PR/immutable Preview.
2. Mike publishes only the reviewed Preview WAF draft. Run the A2-H human runsheet and capture CI,
   auth, comparison/AI/spoof/429, Firewall/Gateway/budget, account quota availability, and read-only
   DB receipts. Do not claim per-user Gateway denial without a separately approved rejection proof.
3. Keep A2/OI-036/OI-037 open on any mismatch. After Mike says `VERIFIED`, ask separately for
   Production GO. On GO, Mike publishes the Production-conditioned WAF equivalent before the exact
   verified tree is released; then prove Production and close the owned rows.
4. Only after A2 is closed may a new `/run` select A3-1.
