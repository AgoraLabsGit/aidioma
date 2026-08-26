---
name: run
description: Coordinate the current Docs/NOW.md or phase outcome in this session.
---

# /run

Read `Docs/NOW.md` when present, then the target pointer or phase file plus its target JSON.
Do not start a Praxis or external Cursor/Codex/Claude runner. Close-gate audit sub-agents inside
this session remain allowed and may be required by `Docs/CLOSE.md`.

## Phase role

For a roadmap phase, you are the **coordinator**. Preserve your context window. Delegate coding
work to in-session sub-agents by area of concern. Do not implement the phase yourself.

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

1. Verify integration across the seams those agents touched.
2. Dispatch proof; do not treat a sub-agent's local green as phase proof.
3. Update the local NOW pointer.
4. Stop for founder-facing blockers. Do not invent secrets or expand non-goals.
