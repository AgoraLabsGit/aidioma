# Current handoff — Lexicon learner proof implemented and ready for close

**Date:** 2026-08-04

**Branch:** `plan/lexicon-foundation`

**Status:** `EVALUATION-FIX-002`/`SECURITY-FIX-001` are complete; the approved
`LEXICON-001` learner journey is implemented, proven, and uncommitted; next command is `/close`

## Fresh-agent startup

1. Work from `/Users/mike/Documents/Coding/Projects/AIdioma`; read `AGENTS.md`, the complete AIdioma
   development skill, and only the canonical `Docs/` root.
2. Read `INDEX.md`, `WORK.yaml`, `FIXES.yaml`, this handoff, `ARCHITECTURE.md`, and
   `Specs/lexicon.md` completely. Inspect Git status and preserve every unrelated/uncommitted change.
3. Review the exact `LEXICON-001` implementation and evidence. Do not broaden `/close` into learner
   persistence, target ranking, global lookup, broad Lesson annotation, evaluator redesign, or
   production configuration.
4. No commit, PR, merge, database mutation, secret change, Preview deployment, or Production
   deployment has been performed in this session.

## Learner outcome now implemented

- The reviewed Restaurant prompt “We ordered the vegetarian dish, but it is no longer available”
  remains plain by default. A quiet `Word help` action exposes only `ordered`, the grouped phrase
  `no longer`, `available`, and one reviewed structural explanation.
- `I don't know` neutrally reveals the reviewed answer and language help, makes no evaluation/AI
  call, creates no graded count or score, and continues through the existing whole-prompt serving
  policy as reinforcement.
- A submitted answer after revealed help still gets ordinary immediate feedback, is labeled
  Assisted, is excluded from independent accuracy/strengthened-capability claims, and is routed to
  reinforcement. Opening and closing help without revealing a target remains unassisted.
- Assistance is visit-local, source/map/direction/offer/version specific, checkpointed, and
  revalidated on resume. Missing, invalid, or drifting maps silently preserve ordinary Practice.
- The default Practice page, collections, Saved Restaurant, feedback, pause/resume, recap, and
  existing serving behavior remain intact.

## Infrastructure now implemented

- `@aidioma/lexicon-schema` owns strict word/phrase, sense, contextual-map, lifecycle, replacement,
  collision, deterministic reader, and canonical schema-v1 hash contracts.
- `content/lexicon/` owns three reviewed entries (`pedir`, `ya no`, `disponible`) and one exact
  source-bound contextual map. Existing Lesson and Restaurant source payloads are unchanged.
- One server-only adapter validates the real source and sends only the active prompt's learner-safe
  projection to the client. Accepted answers, the full Lexicon, and global lookup stay off the wire.
- Lexicon/map version changes compare with immutable `origin/main` history and fail closed if the Git
  base is unavailable. Canonical hashing has one implementation owner.
- Content and app CI now cover Lexicon schema, tooling, validation, the real server adapter, and the
  focused production-browser learner journey with full Git history available.
- Stable word/phrase kind, entry/sense identity, versions, and contextual source references can later
  support generated Lesson/Collection associations, saved word/phrase relations, a Knowledge
  Profile, and target-aware selection. Those consumers and reverse indexes are intentionally not
  implemented or claimed here.

## Environment promotion ledger

| Concern | Local development | Vercel Preview | Vercel Production |
|---|---|---|---|
| Fixture Practice grading switch | Injected only by `npm run app:dev`; loopback only | Forbidden | Forbidden |
| `EVALUATION_AI_GATEWAY_API_KEY` | Dedicated ignored local value | Dedicated sensitive Preview value | Dedicated sensitive Production value |
| `EVALUATION_AI_MODEL` | Reviewed default or allowlisted server override | Same contract | Same contract |
| `VERCEL` / `VERCEL_ENV` | Never set manually | Supplied by Vercel; fixture route must return empty 404 | Supplied by Vercel; fixture route must return empty 404 |
| Deployed Practice grading | Local fixture source only | Must use future authenticated server-authoritative source | Must use future authenticated server-authoritative source |

- Live `vercel env ls` on 2026-08-04 confirmed the encrypted evaluation variable name exists in
  Development, Preview, and Production without exposing values. Presence does not prove separate
  credentials, budgets, databases, or auth instances.
- Before Preview/Production promotion, verify names and scopes without values, prove dedicated
  credential/budget isolation, and run authenticated same-origin auth/API/data/provider evidence
  against the exact deployment. Record dated receipts here; never enable the local fixture switch.
- Normal Clerk-enabled localhost emitted a claimed-key redirect warning while both local Clerk
  variable names were present and `apps/web/.clerk/.tmp/keyless.json` still existed. Credential-free
  production-browser proof passed. Treat this as separate local auth/cache follow-up: verify the
  publishable/secret pair belongs to one development instance and clear/renew stale keyless state
  before relying on authenticated localhost. It does not change the Gateway diagnosis or prove a
  Preview/Production problem.
- The current shell used Node `22.18.0`, below the app/CI minimum `22.22.2`; npm emitted engine
  warnings although every gate passed. CI is pinned to `22.22.2`. Upgrade the local runtime before
  treating local dependency behavior as exact Preview/Production parity.

## Proof at this head

- Lexicon package: 4 files, 25 tests; typecheck and schema smoke passed.
- Lexicon repository tooling: 14 tests and canonical validator passed; approved parsed-prompt hash
  is `5f49af359a78aaed139a3098d5363a961fd332fb8af4eadb3a4a222773467ff5`.
- Application: 35 files, 290 tests; typecheck, lint, and production build passed.
- Focused production-browser Lexicon proof passed eight screenshots: 320px and desktop, both themes,
  axe, 200% text, no overflow, 44px controls, intentional focus/Escape recovery, grouped phrase,
  neutral reveal, learner-visible continuation, and no help-triggered grading.
- Existing Practice production-browser proof passed all 54 screenshots and its Lesson/collection,
  Saved Restaurant, reinforcement, pause/resume, evaluator recovery, feedback, recap, keyboard,
  reduced-motion, responsive, and 200% journeys.
- A fresh independent composition audit returned PASS after requiring the immutable version baseline,
  sole hash owner, direct adapter test, post-commit focus restoration, expanded browser matrix, and
  CI wiring.

## Explicitly unfinished

- No durable learner word/phrase history, saved-word relation, knowledge state, mastery model, target
  observation, database projection, or learner-specific selection exists.
- No global/reverse lookup, public Lexicon UI, broad content annotation, Lesson consumer, external
  lexical runtime API, arbitrary translation fallback, or AI-generated help exists.
- Deployed Practice grading still awaits the authenticated server-authoritative source migration in
  `EVALUATION-001`. Knowledge Profile/saved material belongs to `PROGRESS-SAVED-001`; later target
  selection belongs to `ADAPTIVE-SERVING-001`; broader help belongs to `PRACTICE-ASSISTANCE-001`.

## Next command

`/close`

Review and publish this exact proven scope. Re-run required close gates, reconcile any final receipts,
and do not merge feature expansion into the close.
