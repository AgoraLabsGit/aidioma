---
id: SPEC-A-PLATFORM
kind: area
title: "Runtime platform"
status: active
superseded_by: null
vendor: null
decisions:
  - D-024
  - D-025
built_by: []
last_amended: 2026-08-25
research: []
paths:
  - "apps/web/src/lib/auth/**"
  - "apps/web/src/lib/db/**"
  - "apps/web/drizzle/**"
  - "apps/web/.env.example"
  - "apps/web/vercel.json"
  - "apps/web/src/lib/evaluation/gateway-evaluator.ts"
  - "apps/web/src/lib/evaluation/firewall-admission.ts"
  - "apps/web/src/lib/contextual-help/**"
  - "apps/web/src/app/api/practice/session/**"
---

# Runtime platform

## Purpose

Own authentication, durable Postgres, evaluation and contextual-explanation AI transport, and
deployment identity so learner features persist and fail closed on real providers instead of
parallel fakes.

## Behavior

- Rule: Clerk authenticates learner writes. Neon stores sessions, contextual question exchanges
  needed for resume, attempts, item evidence, and saves. AI Gateway grades only after deterministic
  comparison and answers contextual questions only from a bounded promoted-content package.
  Contextual questions cannot call grading or progress mutations. In-memory, keyless, and
  synthetic learner paths are tests or explicit local opt-in, not product proof.
- Rule: Raw contextual questions and generated answers stay out of application logs, analytics
  text, error reports, and curriculum promotion. Gateway requests are authenticated, length- and
  rate-bounded, time-limited, and canceled when the learner leaves the request.
- Rule: Operator access uses `npx neonctl` and the Vercel CLI. Agents ask the founder only when a
  required secret cannot be obtained that way. Secrets are never committed or printed.
- Failure mode: Missing auth, database, or Gateway credentials fail closed. The app does not
  fabricate identity, progress, grades, or contextual explanations.

## Boundaries

- "Lesson copy, dialect renderings, and promotion receipts belong to SPEC-A-CONTENT"
- "Chat UI, serving policy, and learner-visible progress belong to SPEC-A-LEARNER"
- "Production hardening (least-privilege roles, CSP, onboarding telemetry) waits for market readiness; first wiring does not"

## Vendor

Replaceable providers. `vendor` stays unset because no single vendor owns the area.

| Job | Provider | Agent access |
|---|---|---|
| Auth | Clerk | `user-clerk` MCP for SDK; keys in `apps/web/.env.local` |
| Postgres | Neon | `npx neonctl`; `DATABASE_URL`; default `AIDIOMA_DB_TARGET=development` |
| Evaluation and contextual explanation models | Vercel AI Gateway | Vercel CLI `env`; `EVALUATION_AI_GATEWAY_API_KEY` |
| Hosting | Vercel | `vercel` CLI; Preview/Production isolation |
| Translation MT | DeepL | Founder key when Phase 7 has a consumer |
