---
title: A1-2 — Shared lesson contract and content seed
type: wave-slice
status: proven
updated: 2026-07-28
---

# A1-2 — Shared lesson contract and content seed

## Brief
- **Lane:** App
- **Goal:** Make the canonical authored lessons load into Neon through one shared schema contract and a deterministic, repeatable seed.
- **Touches:** root workspace scripts and CI; `apps/web` database schema, migrations, seed code, and tests; the platform, data-model, and content-pipeline specs; roadmap/state records.
- **Out of scope:** learner-facing database reads, grading, user/progress persistence, UI changes, new lesson authoring, auth provisioning, and dependency-force upgrades.
- **Verify plan:** run every app gate from `ROADMAP.yaml`; prove migration plus two consecutive seeds against a real Neon branch produce the same lesson/item state without duplicates while a credential-free build remains green.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run app:typecheck` | PASS — shared contract built first; app TypeScript clean |
| lint | `npm run app:lint` | PASS — zero warnings |
| tests (baseline: 14 passing) | `npm run app:test` | PASS — 7 files, 20 tests |
| build | `DATABASE_URL= NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY= CLERK_SECRET_KEY= npm run app:build` | PASS — credential-free production build |
| smoke | `npm run app:smoke` | PASS — production browser smoke exited 0 |

## Audit (stage 3)
- Auditors: two isolated read-only audits because the slice touches database integrity, canonical content ingestion, CI, and workspace builds.
- Findings: no criticals. The database audit found immediate ordinal uniqueness could reject a valid swap; the CI audit found two direct gate inputs missing from path filters. Ordinals now use a deferred unique constraint, and both pull-request/main filters cover every direct input.
- Delta re-audit: both auditors PASS — zero remaining criticals or warnings.

## Review (stage 4)
- Medium whole-diff review found no criticals. Its migration-journal warning was fixed with transactional applied-file records, SHA-256 checksums, missing-file rejection, and pending-only execution; a follow-up CI path warning was also fixed. Final delta review PASS.

## Proof (stage 6)
- Vercel project `agoralabs/aidioma` is connected to `AgoraLabsGit/aidioma`, with `apps/web` as the Next.js root and Node 22.x. Free Neon resource `aidioma-db` is attached to development, preview, and production; Clerk remains intentionally unconfigured.
- Real Neon first seed: `[content:seed] Seeded 4 lessons and 134 items; 138 rows changed.` Second and subsequent runs: `0 rows changed`.
- Live verification: 2 journaled migrations; 4 lessons / 4 unique slugs; 134 items / 134 unique IDs; 4 deprecated items retained. `lessons_ordinal_unique` reports `DEFERRABLE` and `INITIALLY DEFERRED`.
- Content proof also PASS: validator 0 errors (5 accepted a1-01 warnings), contract smoke 13/13, fixtures 18/18, and prototype export current.

## Clean (stage 7)
- No superseded database/seed implementation existed. The prototype deprecation trigger remains A4-2 and has not fired; OI-026 remains open.
- Vercel local metadata and pulled env files are ignored. No secret value was printed or committed. The two pre-existing operator-owned web files remain unstaged and outside this slice.

## Decisions
- Use authored JSON as canonical and Neon as a serving copy, per the existing content-pipeline and data-model specs.
- Passage segments remain nested in passage payloads; their immutable IDs still support evaluation references.
- Deprecation is monotonic, missing rows are retained, and authored item IDs cannot move between lessons.
- SQL migrations are ordered, transactional, journaled, and immutable after application.

## Post-proof wiring audit — 2026-07-29
- Independent read-only audit re-confirmed the Vercel link, pooled SSL URL, two matching migration
  checksums, deferred ordinal constraint, reparent trigger, 4 lessons / 134 unique items, and 6/6
  seed/migration tests.
- No criticals. Environment isolation, Drizzle/DDL drift protection, migration serialization, and
  local env hygiene are owned by OI-028…OI-031; Clerk deployment completion is OI-032.
