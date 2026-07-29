---
title: Handoff — finish A2 by hardening forward
type: handoff
status: active
updated: 2026-07-29
---

# Handoff — finish A2 by hardening forward

**Role:** primary App-lane coordinator finishing A2 close controls
**Operator:** Mike; plain language and one strategic call at a time
**Hard rule:** never push without Mike's explicit `VERIFIED` plus a separate explicit `GO`

## Position

- Mike asked whether A2 could be hardened and redeployed instead of rolled back. Treat harden-forward
  as the inferred working direction unless Mike changes it. This is not a push, firewall-publish, or
  Production-promotion `GO`.
- Remote/local `main` and current Production contain A2 at `0eaa286`. A concurrent process pushed it
  before VERIFIED/GO. The endpoint is authenticated, stateless, bounded, and returns a safe signed-out
  401; no abuse or production-data incident has been found.
- A2-1 and A2-H are technically `proven`; ROADMAP correctly keeps A2 `active` until OI-036 is proven,
  an authenticated actual-route pass is complete, and Mike performs the normal close.
- A2-H reconciliation is committed only on `slice/A2-H` at `2043290`; the current handoff/docs delta
  is in this isolated worktree. Nothing after `0eaa286` was merged to `main` or pushed.
- Integrated gates passed: typecheck, zero-warning lint, 18 test files / 116 tests, build with the
  dynamic route, and 16-state smoke. Development DB + live Gateway proof passed with no persistence.

## Protected parallel work

- Re-inspect `git worktree list` and every status before acting; the following is only this handoff's snapshot.
- Root is `slice/A2-1` at `91fcabf` with unrelated user docs/voice/UI/image changes. Do not stage,
  clean, switch, reset, merge, or otherwise use it for A2 close work.
- `.worktrees/practice-sets` (`prototype/practice-sets-ui`) and `.worktrees/practice-saved`
  (`prototype/practice-saved`) are prototype lanes. Do not touch, merge, clean, rebase, or push them.
- `.worktrees/c2` (`slice/C2-1`) is the active Content lane. Do not edit its lesson/review files.
- `.worktrees/a2-verify` is detached verification evidence. Preserve it unless Mike later authorizes cleanup.

## Scope and safety boundary

- Finish only evaluation protection and A2 close. Persistence is A3; SessionEngine and real Practice/
  Lessons UI are A4; flashcards/blend/saved are A5; production Practice Sets are A6.
- Keep the existing server-owned source boundary, comparison-first grading, one Gateway call only on
  uncertain/poor matches, timeout/output/retry caps, local per-instance guard, and no-persistence rule.
- The Firewall SDK can key a bucket with the existing opaque Clerk hash, but Vercel documents its
  counters as per-region. Do not call that a strict global limit by itself.
- Minimum acceptable cost defense is layered: user-keyed Firewall SDK control, existing local burst/
  concurrency/duplicate protection, and an enforced budget on an evaluation-only Gateway credential.
  Gateway checks budgets at request start, so crossing/in-flight requests can overshoot; record that
  honestly. Verify and use account-available Gateway per-user spending limits if they are suitable.
- Never expose Clerk IDs, learner text, authored answers, secret values, or raw Gateway keys in output,
  tests, logs, commits, or handoff evidence.

## Exact next actions

1. Read `CLAUDE.md`, `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/PROCESS.md`, this handoff,
   `Docs/Waves/A2-1-evaluation-endpoint.md`, `Docs/Waves/A2-H-hygiene.md`, evaluation/platform specs,
   OI-036/OI-037, and `.claude/skills/run/SKILL.md`. Re-read current official Vercel Firewall,
   AI Gateway budget, and deployment docs; capabilities changed in June/July 2026.
2. Inspect Vercel plan/project/Gateway/firewall state read-only. Confirm exact Rate Limiting SDK plan,
   preview behavior, per-region semantics, Gateway per-user controls, current credential mode, and the
   cost/refresh-period recommendation before any external mutation. Do not invent a dollar cap.
3. Create an isolated clean corrective branch/worktree from `0eaa286`; do not use shared root/main.
   Implement the injectable `@vercel/firewall` check with the server-derived opaque user key, safe 429/
   Retry-After behavior, failure handling that cannot create an uncapped AI path, and regression tests.
   Preserve the local admission guard as defense in depth.
4. Run cache-free App gates, focused real Development proof, dependency/residue checks, and 2–3 isolated
   audits covering security, regional/global-limit claims, failure behavior, cost controls, and the whole diff.
   Re-audit fixes. Stage Vercel configuration as draft/Preview first; Mike publishes firewall changes.
5. Build a Preview without pushing shared main, then give Mike an authenticated click/call script. Prove
   exact -> comparison/correct, a safe typo -> comparison/close, poor meaning -> one AI result, spoof ->
   400, signed-out -> 401, limit -> 429, and no DB writes. Do not run a costly load test in Production.
6. Reconcile OI-036/OI-037, A2 records, ROADMAP/STATE/specs, and the A2-H commit in the isolated line.
   Give the A2 close recap and human test script. Only after Mike says `VERIFIED`, ask separately for `GO`;
   push only the explicitly resolved commit, verify remote ancestry, deploy/promote, and inspect logs.

## Roadmap/testing reality

- Today Mike can review the fixture-backed Practice Sets design, but it intentionally has no grading,
  persistence, reviewed set content, or real set progress.
- A3 makes evaluations and lesson/item stats real in the database; it does not make the current page real.
- A4-1 is the earliest meaningful end-to-end Practice test on real lesson data. A4-2 adds real Home,
  Lessons, and lesson-detail navigation. The first four seeded lessons can support that preview while C2
  continues a1-05..a1-12.
- A5 makes flashcards, save, Review, and Blend real. A6 is when the fixture prototype becomes production
  Practice Sets with reviewed catalog data, capability-aware configuration, evaluation, and separate progress.

## Copy/paste kickoff message

> Continue AIdioma from Handoff 012 in `.worktrees/a2-integration`. Mike asked whether A2 could be
> hardened and redeployed instead of rolled back; treat retain/harden-forward as the inferred working
> direction, not publication GO, unless new evidence or Mike directs otherwise.
> Read the required Docs and `.claude/skills/run/SKILL.md`, inspect every worktree/status, and verify current
> official Vercel Firewall/Gateway behavior before editing. Finish OI-036 with layered protection: preserve
> the local admission guard, add a user-keyed Firewall SDK control without overstating its per-region counter
> as globally atomic, and add an enforced evaluation-only Gateway key budget/per-user control where the
> account supports it, without calling request-start budget enforcement an absolute cap. Work only in a
> new isolated clean A2 corrective worktree; do not touch root,
> `.worktrees/practice-sets`, `.worktrees/practice-saved`, `.worktrees/c2`, or their branches. Keep A2
> evaluation-only—persistence is A3, real session UI is A4, and production Practice Sets are A6. Use
> sub-agents for implementation and independent security/cost audits, run all gates and authenticated Preview
> proof, reconcile OI-036/OI-037 and A2 docs, then give Mike the close recap and exact test script. Never push,
> publish a Production firewall rule, or promote Production without Mike's explicit `VERIFIED` plus separate `GO`.
