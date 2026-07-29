---
title: A1-H — Foundation hygiene and deployment isolation
type: wave-slice
status: proven
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
Before the suite, `apps/web/.next` and `apps/web/node_modules/.vite` were deleted. All commands
below then ran sequentially; the operator-owned `next-env.d.ts` was backed up and restored.

| Gate | Command | Result |
|---|---|---|
| app typecheck | `npm run app:typecheck` | PASS |
| app lint | `npm run app:lint` | PASS — zero warnings |
| app tests | `npm run app:test` | PASS — 11 files / 39 tests |
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
- Delta re-audit: PASS — database and security auditors reported no criticals or warnings. The
  whole-wave reviewer’s final evidence findings were corrected: cache cleanup is explicit, the
  operational credential event is classified accurately, write-target wiring has direct tests,
  and new smoke images are isolated from historical A1-1R evidence.

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
  explicit; Production requires an exact acknowledgement. Command-level tests prove a mismatch
  reaches no lock, journal, DDL, seed upsert, or commit.
- Pre-publication proof intentionally made no deployment, preview/user write, or production seed.
- Current Practice smoke screenshots are under `apps/web/artifacts/a1-h/app/`; the historical
  A1-1R images were restored byte-for-byte after the smoke command wrote its default path.

## Clean (stage 7)
- OI-028…OI-033 closed; OI-026 and live-key promotion OI-034 explicitly deferred.
- DEP-001 trigger remains A4-2 and has not fired. The remote-live handoff was already superseded;
  kickoff handoff 008 is superseded by this record.
- The Clerk ignore rule was committed at publication; generated `next-env.d.ts` was restored to its
  tracked production-build form. Merged A1 worktrees/branches were removed; active C2/prototype
  worktrees were preserved.

## Operational incident
- A failed shell-quoted connection-string transform echoed a credential in local tool output. This
  was an operator-session incident, not an application defect: the credential was rotated
  immediately, then superseded by dedicated environment roles. No value entered the repository.
- Prevention is procedural: never pass secret-bearing URLs through commands whose parse errors may
  echo their input; inspect only value-free identity/classification output. The write-target tests
  are separate protection against wrong-database mutation, not claimed as a regression for output.

## A1 `/close` operator test
1. Start the local app with `npm run app:dev`, then open the `Local` URL it prints in a desktop browser.
2. On Home, expect `Hola.`, three zero stats, `Lesson 1 · Hola: greetings and introducing yourself`,
   `Not started`, `Review · 0 due`, and `No weak areas yet`. No invented progress may appear.
3. Click `Lessons`. Expect `A1 · Foundations`, `Lessons 1–12`, `You are here`, Lesson 1 current,
   Lessons 2–12 locked, and A2 locked. Click `Start here` from Home and expect the same Lessons page.
4. Click `Practice`. Expect `Your first activity will appear here.`, the disabled answer field,
   and `Learn → Quiz → Words → Sentences → Story`; no fabricated answer or score appears.
5. Click `Settings`. Move Daily goal and expect the number to change; reload and expect the preview
   change to reset. Choose Dark, Light, then Auto and expect the page theme to follow each choice.
6. Click `Sign in`. Expect Clerk under `Return to your Spanish.` Click `Start learning` separately
   and expect Clerk under `Build Spanish that stays.` Complete a test sign-in/up if desired; expect
   return to `/` and a user avatar replacing the two account buttons. Sign out and expect them back.
7. Resize to a phone-width window. Expect bottom Home/Lessons/Practice/Settings tabs, readable cards,
   no sideways page scroll, and the same active-route highlight. Check both Light and Dark once.
8. Reply `VERIFIED` if every result matches, or report the numbered step and mismatch. `VERIFIED`
   alone does not authorize publishing; pushing still requires a separate explicit `GO`.

## Decisions
- The superseded remote-live handoff does not reopen Lane C work in this App-lane session.
- No push or production/preview deployment occurs before Mike's VERIFIED + GO.

## A1 publication close
- Mike gave explicit `VERIFIED + GO` on 2026-07-29. OI-026 was rechecked unchanged with no
  compatible Production fix; `main` was pushed to the sole remote branch, `origin/main`.
- Vercel deployment `dpl_Azh6Ci6meZ2QEhjwNWeUhUmTW9E9` reached Ready. Production is public at
  `https://aidioma-agoralabs.vercel.app`; Preview alone retains Vercel Authentication.
- Playwright confirmed `/`, `/lessons`, `/practice`, `/settings`, `/sign-in`, and `/sign-up` all
  return 200 with expected headings. Clerk sign-in/up load in test mode, mobile navigation is
  present, horizontal overflow is absent, and no substantive request/page failure occurred.
- Public screenshots: `apps/web/artifacts/a1-public/`. No Production seed or learner-data write ran.
