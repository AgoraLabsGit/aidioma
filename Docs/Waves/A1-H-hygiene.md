---
title: A1-H — Foundation hygiene and deployment isolation
type: wave-slice
status: active
updated: 2026-07-29
---

# A1-H — Foundation hygiene and deployment isolation

## Brief
- **Lane:** App
- **Goal:** Close A1 with isolated deployment databases, complete Clerk configuration, drift-safe serialized migrations, clean local environment ownership, and no unowned foundation residue.
- **Touches:** A1 database/migration code and tests; local/Vercel environment configuration; app dependency evidence; platform/data/content specs; A1 records and registers.
- **Out of scope:** user-data writes, automated deployment migrations, lesson authoring, A2 evaluation work, dependency force-upgrades, deployment, and pushing.
- **Verify plan:** run all cache-free App and Content gates; prove secret names/scopes without values, isolated Neon branch identities, migration lock/drift assertions, repeat zero-change seed, and a high-effort review of the full A1 diff.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| app typecheck | `npm run app:typecheck` | pending |
| app lint | `npm run app:lint` | pending |
| app tests (baseline: 20 passing) | `npm run app:test` | pending |
| app build | cache-free credential-free `npm run app:build` | pending |
| app smoke | cache-free `npm run app:smoke` | pending |
| content typecheck | `npm run content:typecheck` | pending |
| content validate | `npm run content:validate` | pending |
| content smoke | `npm run contract:smoke && npm run content:fixtures && npm run prototype:check` | pending |

## Audit (stage 3)
- Auditors: three isolated read-only reviews because this slice touches secrets, live environment isolation, database integrity, and wave-close state.
- Findings: pending.
- Delta re-audit: pending.

## Review (stage 4)
- High-effort whole-A1 review: pending.

## Proof (stage 6)
- pending.

## Clean (stage 7)
- pending.

## Decisions
- The superseded remote-live handoff does not reopen Lane C work in this App-lane session.
- No push or production/preview deployment occurs before Mike's VERIFIED + GO.
