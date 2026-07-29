---
title: Handoff — clean release close, then continue the roadmap
type: handoff
status: superseded
updated: 2026-07-29
---

# Handoff — clean release close, then continue the roadmap

**Role:** sole release coordinator; A2 remains active until its external proof and publication gates pass
**Start command:** `/close`

## Read first

Read `CLAUDE.md`, `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/PROCESS.md`, this handoff,
`Docs/Waves/A2-1-evaluation-endpoint.md`, `Docs/Waves/A2-H-hygiene.md`, OI-036/OI-037, and the
evaluation/platform specs. Run `.claude/skills/close/scripts/preflight.sh --fetch` before editing.

## Repository position

- The sole local continuation branch is `release/A2-2026-07-29`; resolve its exact HEAD dynamically
  with `git rev-parse HEAD`. It contains the reconciled A2/Practice/auth/settings tree, CI hardening,
  the unified `/close`, and Vercel branch filtering.
- `origin/main` and Production remain on the pre-candidate commit until VERIFIED plus separate GO.
  Remote PR #1 is the older reconciliation precursor, not proof for the newer local release tree.
- Ordinary branches become local/CI-only after the Vercel configuration is published. Only
  `release/**` creates Preview deployments and only `main` creates Production deployments.
- Local hygiene removed old generated screenshots, a superseded smoke variant, and obsolete A2
  handoff drafts only after comparing them with the candidate. Do not reconstruct those worktrees.
- Final local proof on the release tree passed: skill validation; App typecheck, zero-warning lint,
  19 files / 137 tests, build, and 16-state smoke; Content typecheck/validation, contract smoke,
  18 fixtures, and prototype-current check. Content retains its five already-known authoring warnings.

## Finish A2 safely

1. Confirm the recorded gates are still current; re-run them only if the release tree changes.
2. Ask Mike for explicit **PREVIEW GO** before the first release-branch push. Push once, create the
   canonical release PR, and close/supersede PR #1 only after the new PR exists.
3. Mike publishes only the reviewed Preview-conditioned Firewall draft and signs into the exact
   immutable Preview. Prove comparison/correct, safe typo/close, one AI result, spoof 400,
   signed-out 401, rate-limit 429 + `Retry-After`, Firewall/Gateway receipts, and no DB writes.
4. Keep A2/OI-036/OI-037 open if any proof is absent. After Mike records **VERIFIED**, ask separately
   for **GO**. On GO, Mike first publishes the reviewed Production-conditioned Firewall equivalent;
   then merge/push the verified tree to `main` once and verify Production comparison/AI/429, Firewall
   and Gateway receipts, and no writes. A Preview-only condition is not Production protection.
5. Protect `main`, remove contained remote candidate branches, close OI-036/OI-037, close A2, and
   only then run `/run` for A3-1. Lane C may independently continue a1-05.

## Never infer

`/close` authorizes ordinary worker-branch handoff only. It does not imply PREVIEW GO, VERIFIED,
Production GO, Firewall publication, force push, or permission to delete uncontained work.
