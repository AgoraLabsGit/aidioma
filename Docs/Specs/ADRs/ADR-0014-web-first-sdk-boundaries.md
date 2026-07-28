---
title: ADR-0014 — Web-first SDK boundaries; Expo later; Gradio internal-only
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0014 — Web-first SDK boundaries; Expo later; Gradio internal-only

## Decision

1. Keep the MVP as the accepted responsive **Next.js web app**. Use Vercel AI SDK/Gateway for the
   server-side AI path; add Clerk's Next.js SDK and a Neon TypeScript driver/ORM during A1.
2. Do not build a second client for launch. If native-store apps are later promoted, build a
   separate **Expo / React Native** client that consumes the same authenticated server API and
   shares contracts/pure domain logic with web.
3. Do not use **Gradio** as the learner-facing web or mobile application. It is permitted only as
   an isolated internal experiment when a concrete Python/model workload makes it useful.
4. Reconsider **OpenAI Agents SDK / Realtime** only for promoted conversation or live-voice scope,
   behind an AIdioma service boundary. It does not replace the provider-neutral evaluator.

## Why

AIdioma is a stateful learning product with bespoke session UX, Clerk identity, Neon progress,
offline-sensitive future behavior, and a strict rule that clients never receive grading secrets.
Gradio optimizes rapid Python model demos and installable web interfaces, not that product boundary.
Expo is the appropriate native framework when store/device needs become real, but adding it before
native scope is funded would create a second client and delivery pipeline without launch value.

Sharing schemas and pure TypeScript learning logic gives web/native consistency without forcing
one UI runtime. Keeping AI behind `EvaluationService` preserves model/provider portability and lets
a direct SDK or Realtime implementation be introduced for one capability without reshaping the app.

## Consequences

- A1 scaffolds only the web production stack; no Expo, EAS, Gradio, or Agents SDK dependency.
- Future `apps/mobile` uses the server API; it never connects directly to Neon or grades locally.
- A Gradio lab cannot become production infrastructure by accident; promotion needs a new ADR plus
  auth, privacy, rate-limit, deployment, and trust-boundary review.
- The live platform contract is `Specs/Areas/platform.md`.

**Extends:** ADR-0002 (greenfield Next.js) and ADR-0007 (Gateway/provider choice).
