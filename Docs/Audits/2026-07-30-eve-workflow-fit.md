---
title: Eve and Workflow fit review
type: audit
status: closed
updated: 2026-07-30
---

# Eve and Workflow fit review

## Question

Where should Eve, the Workflow SDK, and the Vercel workflow examples influence AIdioma's
architecture, and where would they add risk without useful capability?

## Evidence snapshot

| Resource | Observed on 2026-07-30 | Consequence |
|---|---|---|
| Eve getting started and package | Eve 0.27.13 is beta, requires Node 24+, and targets durable tool-using agents | Do not add it to the current evaluator, session engine, or voice media path |
| Workflow SDK docs and package | Workflow 4.7.0 is the current stable core; 5.x is beta | Stable Workflow core is viable for bounded, durable orchestration |
| @workflow/ai package | Stable 4.2.0 peers with AI SDK 6, while AIdioma uses AI SDK 7 | Do not adopt this adapter without a fresh compatibility decision |
| workflow-examples | Main examples pin older Workflow and AI SDK combinations | Reuse patterns, not dependency pins or production security assumptions |
| ai-sdk-workflow-patterns | Shows fan-out, sequential, routing, evaluator/optimizer, and human review patterns | Human review and bounded evaluator/optimizer are useful for A9 |

Package versions are a dated evidence snapshot, not permanent constraints. OI-038 requires a fresh
compatibility check when A9 opens.

## Fit by AIdioma capability

| Capability | Decision | Reason |
|---|---|---|
| A2 pronunciation evaluation | Keep synchronous service contract | One bounded model call does not need durable orchestration |
| A3-A7 lessons, sessions, and progress | Keep database-backed application logic | Neon already owns canonical learner state and recovery |
| A9 generated Practice Sets | Adopt stable Workflow core | Generation, validation, review, and resume form a durable job |
| A10 turn-based voice | Keep direct turn pipeline | Workflow would add latency without improving the contract |
| A11-A12 realtime conversation | Keep provider-direct LiveVoicePort | Neither Workflow nor Eve is realtime audio transport |
| Future tool-using tutor | Defer Eve | Revisit only when a concrete durable multi-turn agent exists |

## Adopted A9 shape

Authenticated request → canonical generation job → start workflow → normalize/cache → generate
candidate → deterministic validation → independent quality check → persist private draft → typed
owner-checked review hook → approve, edit, or bounded regenerate → finalize private version.

- Neon is authoritative for ownership, status, provenance, drafts, final content, and deletion.
- Workflow run history is operational evidence, not the product's system of record.
- The workflow function orchestrates only. AI calls, database writes, and validators run as
  retryable, idempotent steps with explicit fatal-versus-retryable errors.
- Review, resume, status, and cancellation endpoints enforce Clerk ownership.
- Duplicate starts, redeploy recovery, abandoned review, retry budgets, and learner-safe status
  reporting require Preview-environment evidence before release.

## How examples may be used

- Sequential and routing patterns may shape orchestration.
- Parallel work is allowed only for independent checks with an explicit concurrency bound.
- Evaluator/optimizer loops must have a hard attempt and spend limit.
- Human-in-the-loop maps to a typed review hook backed by canonical application state.
- Example authentication, persistence, dependency versions, and global fetch overrides are not
  copied into production.

## Owned follow-ups

- OI-038: prove the current stable Workflow integration when A9 opens.
- OI-039: implement and test the canonical generation-job lifecycle.
- OI-040: re-evaluate Eve only when a durable tool-using tutor has a real requirement.

## Sources

- [Eve getting started](https://eve.dev/docs/getting-started)
- [Workflow SDK documentation](https://workflow-sdk.dev/)
- [Vercel workflow examples](https://github.com/vercel/workflow-examples)
- [AI SDK workflow patterns](https://github.com/vercel/workflow-examples/tree/main/ai-sdk-workflow-patterns)
- [ADR-0017](../Specs/ADRs/ADR-0017-workflow-for-generated-sets.md)
