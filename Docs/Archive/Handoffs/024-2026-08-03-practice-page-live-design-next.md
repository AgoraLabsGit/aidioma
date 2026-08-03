---
title: Handoff — continue live learner-design work on Practice, then Lessons
type: handoff
status: active
updated: 2026-08-03
---

# Handoff — continue live learner-design work on Practice, then Lessons

**Role:** Founder-led product-design and localhost prototyping
**Next action:** Continue reviewing the Practice experience in localhost; move to Lessons only after
the Practice experience is coherent
**Design worktree:**
`/Users/mike/Documents/Coding/Projects/AIdioma/.worktrees/learning-design`
**Branch:** `design/learning-system-proposal`
**Living design document:** `Docs/Prototypes/intermediate-learning-pilot.md`

## Fresh-session kickoff

Start by reading this handoff and `Docs/Prototypes/intermediate-learning-pilot.md`. Do not restart the
design from the historical V1–V4 proposals or their panels. Open `/practice` in localhost and continue
the founder-led review of the real interaction. Update the living design document whenever feedback
produces an accepted decision or materially changes a provisional one. Finish the Practice Page
experience before moving to the Lessons Page.

## Collaboration method

The founder wants to design by seeing and using the application, not by answering an agent-generated
questionnaire. The agent should synthesize the next concrete product decision, implement a small
testable slice when authorized by the ongoing prototype work, and let the founder react to the
experience. Ask a blocking question only when a consequential choice cannot safely be inferred.

Keep explanations in plain learner-facing language. Do not let internal planning blocks, content
contracts, database concepts, or evaluation machinery dictate the visible experience. Do not run a
sub-agent panel.

## What this session accomplished

### Working distinction

- A lesson makes a finite teaching promise around a bounded capability.
- A collection makes an ongoing practice promise around a topic, situation, or skill.
- Lessons and collections remain separate learner-facing concepts while sharing expressions,
  capabilities, activities, evaluation, support material, and eventual knowledge evidence.
- A collection can span levels and tenses. The scope served at a given moment must be appropriate to
  the learner; collections should not be duplicated merely to isolate tenses.
- A study session is the learner's continuous practice visit. Internal prompt-planning blocks must
  not create visible stopping points or caps.

### Intermediate breadth used to pressure-test the design

Lessons:

1. Tell what happened.
2. Place actions in time.
3. Locate things and give directions.
4. Say what exists and what occurred.
5. Connect and qualify ideas.

Collections:

1. Restaurant Spanish.
2. Getting Around.
3. Time, Habits, and Plans.
4. Stories and Explaining Problems.

The current executable slice connects **Tell what happened** to **Restaurant Spanish**, while the
other lessons and collections provide enough variance to expose overfitted design decisions.

## Practice decisions already reflected in the app and design document

- Collections appear as one full-width row each. No row/card preference was added.
- Clicking the main collection row begins practice using its current recommended configuration.
- Save and Practice settings are icon-only actions with accessible names and tooltips.
- The collection row has no separate visible Start button or label.
- The Practice screen does not show `Working prototype`, `Prototype Lens`, a Current Scope card, or
  other learner-visible development explanations.
- Active practice has one compact configuration summary. More detailed focus controls remain in
  Practice settings.
- Prompts retain their learner cue and translation direction but omit redundant labels such as
  `TYPE · PRACTICE ITEM 1`.
- Typed answers remain visible in the conversation.
- Practice is a continuous chat-style feed: prompt, learner answer, feedback, then the next prompt.
- There is no `Next Practice` gate after a typed answer. The composer remains available.
- The learner explicitly ends practice; internal blocks do not end it.
- Feedback is evaluated against the served prompt and explicit capability goal, not every form that
  could theoretically occur in the collection's topic.
- Exact reviewed answers use deterministic comparison. Other answers use the existing live
  server-side AI evaluator.
- Live feedback currently includes a verdict, score, concise coaching, optional word-level
  corrections, and a model answer. Unsupported internal error tags are removed rather than causing
  the entire learner verdict to fail.
- Evaluation, session evidence, Saved state, and knowledge-profile changes are not yet persisted.

These decisions are recorded under **Practice-screen review decisions** in
`Docs/Prototypes/intermediate-learning-pilot.md`.

## Current localhost behavior

- `/practice` contains four intermediate collections and working Practice settings.
- Restaurant Spanish defaults to a mixed intermediate flow.
- `Time, Habits, and Plans` can be used to feel the live evaluator with this first prompt:
  - prompt: `I usually cook on Sundays.`
  - exact response: `Suelo cocinar los domingos.`
  - useful imperfect response: `Suelo cocinar en domingos.`
- The imperfect response has been verified through the live AI path. It returns an `Almost` result,
  explains `los domingos`, appends the next prompt, and leaves the composer visible.
- The verified screenshot is
  `apps/web/artifacts/practice-sets-prototype/live-feedback-desktop-dark.png`.
- `/lessons` contains five intermediate lesson promises plus the preserved A1 path.
- `/lessons/intermediate/tell-what-happened` contains a finite three-step teaching arc, but Lessons
  have not yet received the same detailed founder review as Practice.

## Important implementation boundaries

- This remains a fixture-backed design slice: prompts, reviewed answers, and capability goals are
  local sample records, while non-matching answers are genuinely evaluated by the existing live
  evaluation service.
- The browser sends only prompt identity, direction, and learner input. The server resolves the
  prompt, reviewed answers, and assessment goal.
- The local Practice evaluation route is `apps/web/src/app/api/practice/evaluate/route.ts` and is
  disabled unless `AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION=true`.
- No database schemas, migrations, generated-content workflows, mastery thresholds, or production
  persistence were added.
- The worktree has an ignored `apps/web/.env.local` pulled from Vercel Development. It includes the
  dedicated evaluation-only Gateway credential. Never print or commit its values.
- Clerk and database variables should be blanked when starting this unauthenticated localhost slice;
  otherwise the pulled environment can activate middleware and interfere with local requests.

Start the current production build on port 3217 from the worktree root with:

```sh
CLERK_SECRET_KEY='' \
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='' \
DATABASE_URL='' \
DATABASE_URL_UNPOOLED='' \
VERCEL_OIDC_TOKEN='' \
AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION='true' \
npm run start --workspace @aidioma/web -- --hostname 127.0.0.1 --port 3217
```

If the build is stale, run `npm run build --workspace @aidioma/web` first.

## Practice questions to resolve through use, not as a questionnaire

The next session should open the current experience and review these naturally, one concrete change
at a time:

- Is the remaining configuration summary useful enough to occupy a card-like row?
- Is the prompt/answer/feedback visual hierarchy calm and conversational at desktop and phone sizes?
- Is a numeric score helpful, distracting, or too falsely precise alongside `Correct`, `Almost`, and
  `Keep working`?
- How much feedback should appear immediately? Decide the roles of explanation, word diff, and model
  answer without overwhelming the learner.
- When an answer is close or wrong, should the next prompt still appear immediately, or should the
  learner have an optional in-flow retry without turning Practice into a step gate?
- How should automatic prompt selection vary capability, direction, difficulty, repetition, and
  novelty during genuinely unlimited practice?
- What should happen when the current reviewed pool repeats or is temporarily exhausted?
- Does End practice/back need confirmation, a pause state, or recovery from accidental exit?
- What recap is valuable enough to show without exposing internal evidence bookkeeping?
- What should Saved remember across reloads, and when should user-created organization enter the
  experience?
- Which Practice settings are meaningful learner controls, and which should remain automatic?

Do not try to settle this list abstractly in one response. Use it as a review ledger while the
founder interacts with localhost.

## Then review Lessons

Only after the Practice experience is coherent, review `/lessons` and
`/lessons/intermediate/tell-what-happened` with the same method. The key question is whether Lessons
visibly make a finite teaching promise that is meaningfully different from Collections without
creating two unrelated learning systems. Update the same living design document as those decisions
are accepted.

## Primary files

- `Docs/Prototypes/intermediate-learning-pilot.md`
- `apps/web/src/components/practice-workspace.tsx`
- `apps/web/src/components/practice-set-options-panel.tsx`
- `apps/web/src/lib/practice-sets/prototype-fixtures.ts`
- `apps/web/src/lib/practice-sets/evaluation-contract.ts`
- `apps/web/src/app/api/practice/evaluate/route.ts`
- `apps/web/src/lib/evaluation/evaluation-service.ts`
- `apps/web/src/lib/evaluation/gateway-evaluator.ts`
- `apps/web/src/components/lesson-catalog.tsx`
- `apps/web/src/components/intermediate-lesson-pilot.tsx`
- `apps/web/src/lib/intermediate-pilot.ts`
- `apps/web/scripts/smoke-practice-sets-prototype.mjs`

## Verification completed

- `npm run app:typecheck` — passed.
- `npm run app:lint` — passed.
- `npm run app:test` — 19 files and 144 tests passed.
- `npm run build --workspace @aidioma/web` — passed.
- Live exact-answer and AI-evaluation paths — passed.
- End-to-end Practice smoke — passed with 24 screenshots, axe checks, keyboard checks, visible focus,
  reduced motion, 200% text, and no horizontal overflow.
- `git diff --check` — passed.

## Worktree caution

The worktree is intentionally dirty with the living design work, application changes, tests, and
verification artifacts. Do not reset or discard it. A modification to
`Docs/Prototypes/adaptive-learning-system-proposal.md` predates this learner-design work and has been
deliberately left untouched; do not fold it into this work accidentally.

The localhost server was running at `http://127.0.0.1:3217/practice` when this handoff was written,
but a fresh session should verify it and restart it if necessary.
