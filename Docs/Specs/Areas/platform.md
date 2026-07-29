---
title: Platform — web, native, and SDK boundaries
type: area-spec
status: active
updated: 2026-07-29
---

# Platform — web, native, and SDK boundaries

> Current platform truth for client runtimes and third-party SDK roles. Provider/model choice stays
> in ADR-0007; evaluation security stays in `evaluation.md`. Decision record: ADR-0014.

## MVP production stack

- **Web client:** responsive Next.js on Vercel for phone and desktop. Do not replace it with Expo
  Web or a generated ML interface.
- **AI:** Vercel AI SDK 7 + AI Gateway, server-side, behind `EvaluationService`. Plain
  `provider/model` IDs route through Gateway; grading uses non-streaming `generateText` with
  `Output.object` validation, minimal reasoning, zero SDK retries, an 800-token output ceiling, and
  a 12-second total timeout. Vercel OIDC is the deployed default; `AI_GATEWAY_API_KEY` is the
  local/CI alternative. A direct provider SDK is only a fallback adapter when Gateway lacks a
  required model/capability; it must not bypass the service contract.
- **Auth:** Clerk's Next.js SDK. **Data:** Neon Postgres through the server-only Neon serverless
  driver + Drizzle ORM boundary frozen in A1-1. Connection construction is lazy so builds and
  zero-data public shell routes do not require credentials.
- **Deployment baseline:** Vercel project `agoralabs/aidioma` tracks `AgoraLabsGit/aidioma`, uses
  `apps/web` as its Next.js root on Node 22.x, and has the free `aidioma-db` Neon resource connected.
  Production is public at `https://aidioma-agoralabs.vercel.app`; Vercel Authentication protects
  Preview deployments only. The generated production deployment and six app/auth routes passed
  browser proof on 2026-07-29.
  Production, Preview, and Development use distinct databases and owners (`neondb` /
  `neondb_owner`, `aidioma_preview` / `aidioma_preview_owner`, and `aidioma_development` /
  `aidioma_development_owner`). Vercel scopes use their corresponding dedicated credentials.
  Credential tests prove both non-production roles are denied Production and each other; the
  Neon-managed production owner retains one-way administrative reach. Only Production receives user
  data. Branch-per-preview may replace the shared Preview database later.
- All six documented Clerk names are configured locally and in all three Vercel environments;
  values stay untracked. The current matching pair is test-class for prelaunch verification and must
  be promoted to live-class before real users (OI-034).
- AI calls, database credentials, reviewed answer sets, thresholds, and `correctIndex` remain on the
  authenticated server. Web and future native clients consume learner-safe APIs only.

## Shared application boundary

- `@aidioma/lesson-schema` remains the authored-content contract and is now a direct web-workspace
  dependency built before app typecheck, lint, tests, and production builds.
- Add shared pure-TypeScript packages only when used: domain logic (comparison/session/proficiency)
  and API request/result schemas. Clients may share contracts and logic, not secrets or server data.
- Keep client UI platform-appropriate; do not force web and native screens into one component tree.

## Native mobile, when promoted

- Native-store apps are post-MVP. When a roadmap feature promotes them, use **Expo / React Native**
  with Expo Router and Clerk's Expo SDK in a separate `apps/mobile` client.
- The Expo client calls the same authenticated AIdioma server API and may use AI SDK client helpers
  for streaming features. It never connects directly to Neon or performs authoritative grading.
- Offline queues, auth restoration, audio, notifications, haptics, and store delivery belong to that
  native feature; do not add Expo/EAS dependencies to the web MVP in anticipation.

## Specialized SDKs

- **OpenAI Agents SDK / Realtime:** candidate only for promoted constrained-conversation or live
  voice work. Keep it behind an AIdioma service boundary; it does not replace comparison-first
  evaluation or the provider-neutral MVP path.
- **Gradio:** not a production AIdioma web/mobile runtime. It may be used as an isolated internal
  Python model/pronunciation lab when a real Python or Hugging Face workload exists. A Gradio PWA,
  embed, share link, or auto-generated API must not become the learner app or grading authority
  without a new architecture decision and the normal auth/security gates.
- Do not add agent/RAG frameworks for the single-call MVP evaluator. Adopt another SDK only for a
  concrete capability that the current service contract cannot provide more simply.

## Related authorities

- Web baseline: ADR-0002. Provider/model: ADR-0007. SDK decision: ADR-0014.
- Trust/failure contract: `evaluation.md`. Native/offline/voice triggers: `Registers/post-mvp.md`.
