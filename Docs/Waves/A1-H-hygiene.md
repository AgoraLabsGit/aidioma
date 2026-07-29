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
| app typecheck | `npm run app:typecheck` | PASS |
| app lint | `npm run app:lint` | PASS — zero warnings |
| app tests | `npm run app:test` | PASS — 10 files / 36 tests |
| app build | cache-free `npm run app:build` | PASS — 7 routes + proxy |
| app smoke | cache-free `npm run app:smoke` | PASS — 16 screen states + axe/keyboard/reflow |
| content typecheck | `npm run content:typecheck` | PASS |
| content validate | `npm run content:validate` | PASS — 0 errors / 5 accepted warnings |
| content smoke | contract + fixtures + prototype check | PASS — 13 contract checks / 18 fixtures / current export |

## Audit (stage 3)
- Auditors: three isolated read-only reviews because this slice touches secrets, live environment isolation, database integrity, and wave-close state.
- Initial findings: no criticals. Warnings covered migration history gaps, cleanup masking primary
  errors, missing write-target identity guards, incomplete Content CI app coverage, duplicate seed
  payload fields/projections, test-class Clerk disposition, and stale lifecycle records. All fixed or
  explicitly re-homed; the live two-runner concurrency proof remains the integration evidence.
- Delta re-audit: pending.

## Review (stage 4)
- High-effort whole-A1 review found the same lifecycle, migration-prefix, CI, seed-projection, and
  stale-record warnings plus the still-absent public deployment. Code/doc warnings were corrected;
  deployment remains intentionally blocked on Mike's VERIFIED + GO.

## Proof (stage 6)
- Neon isolation: dedicated database/owner pairs for Production, Preview, and Development. Preview
  and Development credentials each reached only their own database and returned PostgreSQL 42501
  for Production and the other non-production database. Neon-managed production admin reach is
  one-way and is not configured in non-production Vercel scopes.
- Integrity in all three copies: expected owner; 2/2 journal checksums; 4 lessons / 134 items /
  4 deprecated; deferred ordinal constraint; zero table/function owner mismatches.
- Fresh Development concurrency: two simultaneous migration runners exited 0; one applied both
  files and the other waited then reported current. Repeat migrate reports 2 current / 0 applied.
- Development seed after the projection correction changed 81 rows once; immediate rerun changed 0.
- Local/Vercel configuration: all six Clerk names in Production/Preview/Development; local matching
  pair is test-class; route variables complete; `apps/web/.env.local` mode 0600; root env absent.
- Every write command checks the selected database and role. Development is default; Preview is
  explicit; Production requires an exact acknowledgement. Unit tests cover mismatch/fail-closed paths.
- Vercel reports no deployments. No push, deployment, preview/user write, or production seed occurred.

## Clean (stage 7)
- OI-028…OI-033 closed; OI-026 and live-key promotion OI-034 explicitly deferred.
- DEP-001 trigger remains A4-2 and has not fired. The remote-live handoff was already superseded;
  kickoff handoff 008 is superseded by this record.
- Operator-owned unstaged `apps/web/.gitignore` and `apps/web/next-env.d.ts` were preserved.

## Decisions
- The superseded remote-live handoff does not reopen Lane C work in this App-lane session.
- No push or production/preview deployment occurs before Mike's VERIFIED + GO.
