---
title: Handoff — Neon audited; A1-H kickoff
type: handoff
status: superseded
updated: 2026-07-29
---

# Handoff — Neon audited; A1-H kickoff

**Role:** primary App-lane coordinator; Content lane remains independently active
**Operator:** Mike; continue autonomously and ask only for genuine blockers
**Rule:** never push without Mike's explicit GO after `/close`

## Position

- Local `main` is three commits ahead of `origin/main`: A1-2 feature + merge, followed by
  `ad0add2 fix(auth): use Clerk proxy matcher syntax`. No push is authorized yet.
- A1-2 remains proven against real Neon: 2 checksum-matched migrations, 4 unique lesson slugs,
  134 unique item rows, 4 deprecated items, and repeat seed runs changing zero rows.
- Independent read-only wiring audit found no criticals and re-confirmed project/GitHub linkage,
  pooled SSL connectivity, live constraints/indexes/trigger, migration journal, and 6/6 focused tests.
- Five follow-ups are registered for A1-H: OI-028 Neon environment isolation; OI-029 Drizzle/DDL
  drift guard; OI-030 migration serialization; OI-031 duplicate local env cleanup; OI-032 complete
  local/Vercel Clerk configuration.
- The Clerk publishable/secret key pair is present and non-empty in `apps/web/.env.local`. The four
  route variables are missing locally, and Vercel currently exposes no Clerk variables. Never print
  or commit their values. Both ignored local env files are now mode `0600`; the root duplicate remains.
- Two operator/tool-owned unstaged files remain: `apps/web/.gitignore` adds `/.clerk/`, and generated
  `apps/web/next-env.d.ts` points at dev route types. Preserve them.

## Latest verification

- Neon audit: live counts/constraints/journal PASS; seed + migration unit tests 6/6 PASS.
- Auth matcher follow-up: auth config tests 6/6 PASS; app lint PASS.
- Local Node remains 22.18.0 below the declared 22.22.2 floor; Vercel uses Node 22.x and Content CI
  pins 22.22.2.

## Next actions

1. Read `.claude/skills/run/SKILL.md`, then run A1-H as the next App slice.
2. Claim and disposition OI-026 plus OI-028…OI-032. Highest priority before any preview/user writes:
   isolate Neon Preview/Development from Production and complete Vercel Clerk variables.
3. Reconcile the Drizzle declaration with authoritative deferred SQL, add a drift assertion, and
   serialize migrations before wiring them into deployments.
4. Run the cache-free full app/content suites and high-effort whole-wave review for `/close`.
5. Give Mike the A1 recap and exact human test. Push only after VERIFIED + explicit GO.
6. Content lane remains on a1-05; require validator zero errors and independent L2 PASS before a1-06.
