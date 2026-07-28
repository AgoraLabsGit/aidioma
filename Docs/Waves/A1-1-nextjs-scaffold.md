---
title: A1-1 — Fresh Next.js application scaffold
type: wave-slice
status: proven
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
| typecheck | `npm run app:typecheck` | PASS — Next route types generated; TypeScript clean |
| lint | `npm run app:lint` | PASS — zero warnings |
| tests | `npm run app:test` | PASS — 2 files, 8 tests, including full-shell accessibility |
| build | `npm run app:build` | PASS — six static routes and Clerk proxy compiled |
| smoke | `npm run app:smoke` | PASS — production server; phone/desktop, light/dark, keyboard, 200% text, keyless auth |

## Audit (stage 3)
- Auditors: full boundary audit because the slice touches authentication, database access, framework configuration, and responsive UI.
- Initial findings: Clerk proxy was outside `src/` and caused configured-auth requests to fail;
  dark-theme contrast and 200% text reflow missed the bar; the first smoke gate only checked a
  subset of axe findings and did not prove shutdown. All were fixed before integration.
- Delta re-audits: boundary and visual auditors both PASS. The root-workspace audit found one Node
  engine-floor mismatch; `935c2b1` aligned package, lockfile, and README at Node 22.22.2+, and the
  targeted re-audit passed.
- Non-blocking disposition: current-page `aria-current` remains owned by the existing A4-2
  navigation/layout cleanup.

## Review (stage 4)
- Coordinator review PASS. The React quality checklist led to whole-shell axe coverage and unique
  navigation landmark labels. Auth and database initialization remain server-only and lazy so a
  credential-free build is truthful and deterministic.

## Proof (stage 6)
- `apps/web/artifacts/a1-shell-mobile.png` — SHA-256
  `e5b91f0129fa81f090c0d1b718af85ca9eacbb6d0dae2b0c14efedcd02f17326`.
- The preferred interactive browser runtime was unavailable in this session; the checked-in
  Playwright production smoke supplied the browser proof and exercised all required states.

## Clean (stage 7)
- App branch merged locally at `8b7d535`; root workspace/lockfile integration committed at
  `7923c94`; audit correction committed at `935c2b1`. Worktree clean after proof; no production
  server remained. No remote or push.

## Decisions
- Operator approved the five-bullet A1 scope on 2026-07-28.
- Use current Next.js App Router conventions (`proxy.ts` for Next.js 16+) and lazy server-only Neon initialization so builds do not require credentials.
