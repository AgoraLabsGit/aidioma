---
name: run
description: Coordinate the current Docs/NOW.md or phase outcome in this session.
---

# /run

Read `Docs/Development/DELIVERY.md`, `Docs/WORK.yaml`, and `Docs/NOW.md` when present, then the target
pointer or phase file plus its target JSON. Stay in this session. Close-gate audit sub-agents may be
required by `Docs/CLOSE.md`.

## Phase role

For a roadmap phase, you are the **coordinator**. Preserve your context window. Delegate coding
work to in-session sub-agents by area of concern. Do not implement the phase yourself.

Do not run a `proposed`, `canceled`, `blocked`, or `closed` phase. A new phase starts only from
`ready`, then becomes `active`. Confirm it owns one primary learner journey, names its
failure/recovery behavior and code owners, and declares the exact browser/deterministic acceptance
that must pass before close. A build phase has no unresolved learner-visible alternative; a design
phase may compare only the explicit alternatives its outcome exists to settle.

Before decomposition, triage every open `Docs/WORK.yaml` entry against the phase outcome, feature,
area, context paths, dependencies, and non-goals. Set relevant entries to `active` and assign the
phase. Leave unrelated entries open. If a relevant entry is intentionally deferred, name its future
phase and concrete reason in the entry. Do not let a phase close with a relevant untriaged or
still-active entry.

A small non-phase NOW item may be done directly when it is one area and a handful of files.
Otherwise use the same coordinator split.

## Keep (coordinator)

- Outcome, proof, non-goals, audit table, and scope contract
- Decomposition, sequencing, and dispatch
- Seam integration and conflict resolution
- Founder questions and missing-secret stops
- Integration checks after slices land
- NOW / evidence summaries
- Close-auditor dispatch when `/close` or `/phase-close` is requested

Read authorities and sub-agent summaries. Do not ingest whole trees, test dumps, or other
sub-agents' transcripts.

## Delegate (by area)

One sub-agent per area. Bound its paths. Parallelize only when file scopes do not overlap.
Serialize shared seams.

| Area | Typical paths |
|---|---|
| Contract | `Docs/PRODUCT.md`, specs, the phase file |
| Content | `content/`, `packages/lesson-schema`, `tooling/content` |
| App UI | `apps/web` components, routes, CSS |
| Runtime | `apps/web/src/lib`, API routes, evaluation |
| Persistence | `apps/web/drizzle`, db repos |
| Providers | Clerk, Neon, AI Gateway wiring |
| Proof | tests, `prove-*`, browser journey evidence |

Do not give one sub-agent the whole phase. Do not mix implementers with close auditors.

## Brief

Each sub-agent gets:

- Area of concern and allowed paths
- Forbidden paths and non-goals
- Acceptance criteria from the phase proof
- Contracts it must obey
- What to return: files changed, proof run, leftover risks, open questions

Keep briefs short. Pass only the slice that agent needs.

## Do yourself only

- Tiny glue after a slice lands (imports, one-line wiring)
- Reading summaries and dispatching the next slice
- Asking the founder
- Writing the NOW / evidence summary

If a delegated slice fails, retry with a tighter brief. Take the coding over only when the
remainder is already tiny glue.

## After slices land

1. Complete the walking learner proof through its real entry and observable ending.
2. Verify failure/retry behavior and integration across the boundaries those agents touched.
3. Enforce the declared code ownership; remove duplicate/dead/prototype paths exposed by the work.
4. Dispatch the exact acceptance proof; do not treat a sub-agent's local green as phase proof.
5. Update the local NOW pointer.
6. Stop for founder-facing blockers. Do not invent secrets or expand non-goals.

Do not request close until acceptance passes. New adjacent improvements go to `Docs/WORK.yaml` with
a named owner; they do not expand the active phase.
