---
title: Handoff — A2 Preview AI 503 diagnostic candidate
type: handoff
status: active
updated: 2026-07-29
---

# Handoff — A2 Preview AI 503 diagnostic candidate

**Role:** sole A2 release coordinator; do not advance A3 or Production Practice Sets
**Next command:** review BUG-001 and ask Mike for replacement `PREVIEW GO`
**Fresh-session prompt:** `Continue AIdioma from Handoff 016 as sole A2 release coordinator; finish /fix BUG-001.`

## Exact position

- Isolated worktree `.worktrees/a2-preview-ai-503`, branch `fix/BUG-001-preview-ai-503`, based on
  release SHA `9ef2f5e`. Resolve the committed candidate dynamically with `git rev-parse HEAD`.
- PR #2 and canonical Preview still point to `9ef2f5e`; no corrective commit has been pushed or
  deployed. The Preview-only 30/60 Firewall rule is active. Production is unchanged.
- BUG-001, A2, and OI-036 remain open. The rate-limit burst and remaining external receipts stopped
  at the first unexpected AI result.

## Failure and diagnostic correction

- Authenticated Preview returned comparison `200`/`200`, AI `503`, and spoof `400`. Request
  `f3965a82-1813-4b75-9af7-aa9da37e15db` logged `ai_provider` after 681 ms, with no Gateway event.
- Gateway key `AIdioma Evaluation (A2)` is active at `$0.001528/$1` monthly spend, so its budget is
  not exhausted. Evidence narrows the fault to pre-generation authentication or request rejection,
  but the deployed logger discarded the upstream HTTP status.
- The regression-first patch preserves only an integer provider status from 400–599, bounds/cycle-
  protects traversal, omits provider messages and codes, and treats deterministic 4xx as
  non-retryable except 408/429. Learner response shape is unchanged.
- Full App gates pass: typecheck, zero-warning lint, 19 files / 140 tests, build with dynamic
  `/api/evaluate`, and 16-state smoke. Required audit found three warnings; all were fixed and the
  focused delta audit is clean.

## Next gated actions

1. On replacement PREVIEW GO, integrate the exact fix commit into `release/A2-2026-07-29`, rerun
   preflight, push the release branch, and wait for all checks on the new immutable Git Preview.
2. Run only the authenticated AI case first. If it still returns `503`, read `providerStatus` from
   the matching safe `evaluation.completed` log and correct the proven configuration/request fault.
3. Only after AI returns `200` run comparison/spoof, 30/60 Firewall burst, Gateway/budget, and
   read-only DB receipts. Any mismatch leaves Production unchanged and BUG-001 open.
4. Mike's `VERIFIED` and a separate Production GO are still required. Do not modify Production
   configuration or merge `main` before both gates.
