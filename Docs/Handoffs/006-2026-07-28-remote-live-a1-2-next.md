---
title: Handoff — Remote live; A1-2 and a1-05 next
type: handoff
status: active
updated: 2026-07-28
---

# Handoff — Remote live; A1-2 and a1-05 next

**Role:** primary coordinator for parallel app/data and lesson-content work  
**Operator:** Mike; continue autonomously and ask only for genuine blockers  
**Rule:** push only when Mike explicitly authorizes the completed scope

## Boot

1. `Docs/STATE.md` → `Docs/ROADMAP.yaml` → `Docs/PROCESS.md` → this handoff.
2. App lane: `Docs/Specs/Areas/platform.md`, `data-model.md`, `content-pipeline.md`, then
   `Docs/Handoffs/004-2026-07-28-a1-2-c2-continue.md` for the retained A1-2 detail.
3. Content lane: `Docs/Waves/C2-1-draft-launch-lessons.md`, curriculum/style guidance, and the
   latest a1-04 QA evidence before drafting a1-05.
4. Read `.claude/skills/run/SKILL.md` before opening either slice.

## Session close position

- Public remote is live: `https://github.com/AgoraLabsGit/aidioma`; local `main` tracks
  `origin/main`. The approved responsive Next.js prototype-alignment slice A1-1R is proven and
  published with all app gates, 16-state visual/accessibility smoke, and clean delta audits.
- The product target is responsive web on phone and desktop. Native Expo remains later; do not
  split current UI work into a native client.
- Two pre-existing local unstaged files remain operator/tool-owned: `apps/web/.gitignore` adds
  `/.clerk/`, and generated `apps/web/next-env.d.ts` points at dev route types. Do not silently
  stage, revert, or overwrite them.
- `OI-026` remains open for upstream Next/PostCSS/sharp and ESLint advisories with no compatible
  fix. Never use `npm audit fix --force` to make the report disappear.

## Deployment setup now

1. Import `AgoraLabsGit/aidioma` into Vercel and select `apps/web` as the application root; keep
   the detected Next.js build settings and Node 22.22.2 or newer.
2. Create or select the Neon project and use its serverless/pooled connection string as
   `DATABASE_URL` in Vercel. The app boundary is already lazy and server-only, so keyless builds
   remain valid; A1-2 owns schema/seed execution and real database proof.
3. To enable production auth, set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`,
   plus the four Clerk route/redirect variables shown in `apps/web/.env.example`. Never configure
   only one Clerk key.
4. A deployment now should show the truthful zero-state shell. It will not yet contain database
   lessons or playable activities; that is expected, not a deployment failure.

## Next execution order

1. **App A1-2 — start immediately:** import `@aidioma/lesson-schema` without redeclaration; add
   content CI; create deterministic migration/DDL and an idempotent Neon seed keyed by lesson slug;
   migrate/prove Lesson 0/first canonical lessons against a real Neon branch.
2. **Content C2-1 — already active in parallel:** draft a1-05 next, then a1-06…a1-12 one lesson at
   a time through validation, independent adversarial L2 QA, fixes, and re-QA. Four canonical
   lessons (a1-01…a1-04) already exist; lesson creation does not need to wait for app plumbing.
3. **A1-H:** residue/dependency/spec reconciliation closes the foundation wave after A1-2.
4. **A2:** implement the single comparison-first `/api/evaluate` service behind Vercel AI Gateway.
5. **A3:** persist Clerk users, evaluations, item stats, and lesson progress in Neon.
6. **A4:** connect the SessionEngine and real Practice/Home/lesson-detail UI. This is when a learner
   can run the full Learn → Quiz → Words → Sentences → Story flow on real data.
7. **C3 after C2:** paid native-speaker review makes all 12 launch lessons launch-grade.

## Practical answer to “when?”

- **Lesson authoring:** now; resume with a1-05 in the next content slice.
- **Lesson database infrastructure:** next app slice, A1-2; begin as soon as the session resumes.
- **Real grading endpoint:** A2, immediately after A1 closes.
- **Saved learner progress:** A3.
- **End-to-end playable practice:** A4. Do not fake it earlier by bypassing those data and trust
  boundaries.

## First proof owed next session

- A1-2 must prove a clean/keyless build plus a real Neon branch run where seeding twice produces
  the same lesson/item state with no duplicates.
- C2 must prove a1-05 at validator zero errors and independent L2 PASS before starting a1-06.
