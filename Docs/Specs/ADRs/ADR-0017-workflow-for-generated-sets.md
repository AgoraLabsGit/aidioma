---
title: ADR-0017 — Workflow core for private generated Practice Sets
type: adr
status: accepted
updated: 2026-07-30
---

# ADR-0017 — Workflow core for private generated Practice Sets

## Context

A9 adds private AI-generated Practice Sets. A generation request can outlive one HTTP request and
must survive retries, redeploys, validation failures, and learner review. Existing evaluator,
session, and voice contracts do not have this durability need.

The resource review found that stable Workflow core supplies the required durable orchestration.
Eve targets a broader durable-agent problem and is still beta. The stable @workflow/ai adapter
reviewed at this date does not match AIdioma's AI SDK major version.

## Decision

1. A9 will use the current non-beta Workflow SDK core, subject to OI-038's opening validation.
2. Neon remains canonical for generation-job ownership, lifecycle status, provenance, drafts,
   published private versions, retention, and deletion. Workflow history is operational only.
3. The workflow function contains orchestration only. AI calls, database access, and validation
   execute in retryable and idempotent use-step boundaries.
4. Learner review uses a typed hook. Start, status, review, resume, and cancellation operations
   enforce Clerk ownership against the canonical job row.
5. Regeneration and evaluator/optimizer behavior have explicit attempt, time, and spend limits.
6. Workflow does not enter the A2 evaluator, SessionEngine, A10 turn pipeline, or A11-A12 realtime
   media path. A later asynchronous recap may receive a separate decision.
7. A9 will not adopt @workflow/ai or Eve by implication. Each requires a new compatibility and
   architecture decision.
8. Eve is reconsidered only through OI-040 when a concrete durable, tool-using tutor requirement
   exists. It must remain behind a TutorAgentPort and cannot own grades, progress, or transcripts.

## Consequences

- A9 gains resumability and explicit human review without moving product authority out of Neon.
- The application must reconcile workflow runs with canonical job state and expose safe progress.
- Preview evidence must cover duplicate starts, retries, fatal errors, redeploy resume, abandoned
  review, unauthorized hook access, cancellation, deletion, and dependency/runtime compatibility.
- AIdioma accepts Workflow's operational constraints for this asynchronous feature only; they do
  not become platform-wide defaults.

## Evidence

- [Eve and Workflow fit review](../../Audits/2026-07-30-eve-workflow-fit.md)
- [Practice Sets specification](../Features/practice-sets.md)
- [Platform specification](../Areas/platform.md)

