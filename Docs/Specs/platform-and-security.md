---
id: PLATFORM-SECURITY-001
title: Platform and security
area: platform
status: draft
implementation: mixed
founder_review: required
updated: 2026-08-03
---

# Platform and security

This migration dossier records durable runtime and trust boundaries while excluding dated deployment
receipts, provider catalog facts, and the superseded release-wave process. It is a founder-approved temporary exception
to normal spec creation timing, remains `status: draft`, and cannot authorize
implementation. `legacy-accepted` preserves a prior decision pending migration disposition;
`accepted` is reserved for current founder approval.

## Outcome

AIdioma runs as a secure responsive web application whose authenticated server owns data access,
grading authority, provider credentials, admission control, and deployment evidence.

## Non-goals

- Do not store live project aliases, deploy SHAs, credential presence, or firewall receipts here.
- Do not authorize native, voice, durable-agent, or private-generation implementation.
- Do not expose expected answers, provider payloads, secrets, or raw user identity to clients/logs.
- Do not treat localhost as evidence for Preview or Production platform behavior.
- Do not preserve old ROADMAP, wave, release-batch, or `SHIP` terminology.

## Classification

| Class | Meaning |
|---|---|
| `implemented` | Proven by current dependencies, server code, tests, or deployment config. |
| `legacy-accepted` | Previously accepted architecture decision preserved pending disposition. |
| `accepted` | Current founder approval in the new SSOT; none is implied by this draft. |
| `candidate` | Security or platform work requiring `/plan` or a bounded fix. |
| `research` | Dated audits or provider facts that require revalidation before use. |
| `deferred` | Intentionally absent until an owning feature exists. |
| `conflicting` | Current implementation falls short of a stated boundary. |

## Implemented platform

- `apps/web/` is a responsive Next.js App Router application deployed through Vercel config.
- Clerk's Next.js SDK supplies production authentication; keyless behavior exists only for local
  development when both keys are absent (`src/lib/auth/config.ts`).
- Neon Postgres access uses the server-only Neon driver and Drizzle query boundary. Connection
  construction is lazy so public/build paths do not require database credentials.
- Vercel AI SDK and AI Gateway sit behind evaluation service interfaces; browser code does not select
  provider models or receive provider credentials.
- `@aidioma/lesson-schema` is a shared pure-TypeScript content contract built before app checks.
- `.github/workflows/app.yml` and `content.yml` use pinned actions, read-only permissions, exact Node,
  `npm ci`, bounded jobs, and credential-free validation.
- `apps/web/vercel.json` limits automatic deployments to `main` and release-pattern branches. The
  branch naming policy may change under the new command workflow; `main` remains production authority.

## Evaluation trust boundary

The production `POST /api/evaluate` path is implemented in `src/app/api/evaluate/route.ts` and
`src/lib/evaluation/`:

- authenticate before reading or grading request content;
- accept strict, bounded JSON containing source type, item identity, modality, direction, and learner
  input—not authoritative answers, model IDs, scores, or session authority;
- resolve active, non-deprecated authored sources and accepted answers on the server;
- apply Vercel Firewall admission plus local rate, concurrency, and duplicate-work guards before
  database/provider work;
- compare deterministically first, then call an allowlisted Gateway model only when needed;
- use structured output, zero SDK retries, bounded output, and a total model timeout;
- fail closed as ungraded when auth, source integrity, admission, or provider work is unavailable;
- return `no-store` and `nosniff`; correlate failures without logging learner text, authored answers,
  raw user IDs, credentials, or provider bodies.

Current production support is lesson translation. Reading, set grading, and persistence require their
own planned source and data contracts.

## Legacy-accepted boundaries awaiting migration disposition

- Responsive web is the primary application. A future native app should be a separate Expo client
  consuming the same authenticated server APIs and pure contracts, not the same component tree.
- A direct provider adapter may replace Gateway for a required capability but cannot bypass the
  service and trust contracts.
- Workflow-style durability belongs only to asynchronous generation jobs; database state remains
  product authority.
- Realtime/voice providers, if promoted, sit behind capability-specific ports and never become
  grading or learner-progress authority by implication.

## Candidate hardening

- Split owner/operator credentials from least-privilege runtime database roles and attest environment
  identity before learner writes.
- Separate Gateway credentials and budgets per environment; reverify actual account policy before
  claiming per-user cost enforcement.
- Add a Clerk-compatible browser security-header policy: CSP/frame containment, referrer policy,
  permissions policy, and page-level content-type protection as appropriate.
- Add bounded deadlines for Clerk, Firewall, and Neon dependencies, not only model calls.
- Define safe persistence, transaction, deployment, cost, and rollback observability.
- Promote Clerk configuration to production-class credentials before inviting real users.
- Extend route/API smoke coverage as real data states replace fixtures.

The least-privilege runtime role, verified environment/database binding, bounded dependency waits,
safe containment, and authorization proof form a platform-owned prerequisite for the first learner
write. `DATA-PERSISTENCE-001` supplies the approved tables and exact privileges, but
`PLATFORM-SECURITY-001` must establish this pre-write baseline before data implementation mutates
durable learner state.

External environment state must be reverified when work opens. Historical audits are evidence, not a
standing assertion that keys, rules, aliases, budgets, or runtime versions remain unchanged.

## Research retained

The A2R baseline and Workflow/Eve audits identify useful threat, reliability, and orchestration
questions. Their live-environment receipts and dependency versions are dated research, not current
platform guarantees.

## Conflicting local Practice endpoint

`src/app/api/practice/evaluate/route.ts` is fixture-backed and unauthenticated. It is hidden unless
`AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION=true`, but it does not independently assert Development or
localhost and uses a synthetic user ID. It must be removed with prototype cleanup, replaced by the
production authenticated source path, or hardened so it cannot be enabled in deployed environments.
In addition, the client Practice bundle imports fixtures containing accepted-answer groups and the
Practice response contract includes `modelAnswer` and optional `modelUsed`. Prototype labeling does
not satisfy the production rule that answer authority and provider metadata stay server-side.

## Deferred platform capabilities

- Native-store client, offline queues, mobile auth restoration, notifications, and app-store delivery.
- Turn-based voice capture/transcription/speech and live realtime conversation.
- Durable private-set workflows and any tool-using tutor/Eve-style agent.
- Custom staging environment until Preview isolation or external integrations require it.

Deferred capabilities map only to canonical work entries: `NATIVE-CLIENT-001`, `VOICE-001`, and
`AI-TUTOR-001`. Their legacy designs remain evidence, not implementation authorization.

## Reuse boundaries

- Pure request/result schemas and deterministic learning engines may be shared across clients.
- Database, auth, provider, and admission adapters remain server-only.
- Web and future native UI should share product behavior, not force one component runtime.
- Practice and Lessons may reuse evaluation and future persistence services only through
  source-neutral authority/session contracts with separate adapters; current production evaluation
  resolves Lesson sources only.
- Internal/operator tools remain separate and unavailable in production unless explicitly approved.

## Acceptance evidence

A production platform change requires evidence proportional to the boundary affected:

- deterministic typecheck, lint, tests, production build, and browser smoke;
- authenticated same-origin Preview proof for auth/API/data/provider behavior;
- environment and database isolation receipts without secrets or personal data;
- authorization, malformed input, oversize input, spoofing, rate-limit, timeout, and retry cases;
- safe headers and logs on success and failure;
- exact commit/deployment evidence before production release;
- post-release public-route and bounded-error verification.

## Open questions

1. Which branch/Preview policy best fits `/plan`, `/feat`, `/fix`, and `/close`?
2. Must all dependency waits share one route deadline, or use per-adapter budgets?
3. Which browser policies can Clerk support without unsafe broad exceptions?
4. What runtime database privileges are required for the first learner-write slice?
5. Should the local Practice evaluation endpoint be deleted now or temporarily hardened?
6. Which operational receipts belong in `HANDOFF.md` versus automated evidence artifacts?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision or candidate | Status |
|---|---|---|---|
| PS-D001 | implemented | The Next.js web stack and authenticated server boundaries exist; not every prototype path uses them. | retained with limitation |
| PS-D002 | implemented | Production Lesson evaluation resolves secrets and answers server-side and fails closed. | retained with scope |
| PS-D003 | legacy-accepted | Native remains a separate later client behind the same APIs. | pending |
| PS-D004 | legacy-accepted | Voice is staged after typed MVP; realtime and tool-using agents await later evidence. | deferred pending disposition |
| PS-D005 | candidate | Durable specs store invariants; live deployment facts belong in evidence/handoff. | founder review |

### Canonical work and fix references

- `SECURITY-FIX-001` — remove or harden the fixture Practice evaluator and its local-only boundary.
- `PLATFORM-SECURITY-001` — own runtime role, environment binding, headers, dependency deadlines,
  containment, observability, and the pre-write platform gate.
- `DATA-PERSISTENCE-001` — supply feature-owned schema and privilege requirements after semantics are approved.
- `NATIVE-CLIENT-001`, `VOICE-001`, and `AI-TUTOR-001` — own explicitly deferred client/capability work.
