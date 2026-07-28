---
title: ADR-0002 — Greenfield Next.js app; V1/V2 archived as reference
type: adr
status: accepted
updated: 2026-07-23
---

# ADR-0002 — Greenfield Next.js app; V1/V2 archived as reference

**Decision:** The "new version" of AIdioma is built greenfield: a **fresh Next.js repo on
Vercel**, keeping **Neon** (Postgres) and **Clerk** (auth). V1/V2 are preserved only in the
ignored, sensitive `Archive/Legacy-Apps/` vault; their completion claims are not trusted.
Current application design is authoritative only in `Docs/`.

**Context:** Decided in the 2026-07-21 prototyping session (HANDOFF-NEXT-SESSION §2.1). V1
carried heavy nav/layout debt and ~4,900 lines of duplicated evaluation services; a rebuild on
the frozen contracts (lesson schema + evaluation + session types) is cleaner than refactoring in
place. The prototype (`apps/prototype/index.html`) is a temporary design reference, not shippable code.

**Consequences:** the app is scaffolded in wave **A1** (consensus build order W1). App-lane
`verify:` gate commands do not exist until then and count as not-run/FAIL until set. The shared
lesson schema is imported from `@aidioma/lesson-schema` — never redeclared in the app.

**Supersedes:** nothing (first architecture ADR). The greenfield choice itself is not re-opened
by A0 Design Close — A0 settles product/UI/engine decisions on top of this baseline.
