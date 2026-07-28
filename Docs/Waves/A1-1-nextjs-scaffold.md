---
title: A1-1 — Fresh Next.js application scaffold
type: wave-slice
status: active
updated: 2026-07-28
---

# A1-1 — Fresh Next.js application scaffold

## Brief
- **Lane:** App
- **Goal:** Deliver a runnable responsive Next.js app shell with production-safe Clerk and Neon boundaries plus real app gate commands.
- **Touches:** `apps/web/` and app-local configuration; coordinator owns root workspace/lockfile, ROADMAP, STATE, registers, and this record.
- **Out of scope:** Content seed/import (A1-2), grading/session/progress features, remote provisioning, deployment mutation, legacy porting, and push.
- **Verify plan:** `npm run app:typecheck`, `npm run app:lint`, `npm run app:test`, `npm run app:build`, and `npm run app:smoke`; proof is the responsive shell exercised headlessly with a saved screenshot.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run app:typecheck` | pending |
| lint | `npm run app:lint` | pending |
| tests | `npm run app:test` | pending |
| build | `npm run app:build` | pending |
| smoke | `npm run app:smoke` | pending |

## Audit (stage 3)
- Auditors: full boundary audit because the slice touches authentication, database access, framework configuration, and responsive UI.
- Findings: pending.
- Delta re-audit: pending.

## Review (stage 4)
- Pending.

## Proof (stage 6)
- Pending.

## Clean (stage 7)
- Pending.

## Decisions
- Operator approved the five-bullet A1 scope on 2026-07-28.
- Use current Next.js App Router conventions (`proxy.ts` for Next.js 16+) and lazy server-only Neon initialization so builds do not require credentials.
