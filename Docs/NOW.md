# NOW — session handoff

**Date:** 2026-08-26
**Repo:** AIdioma learner product (`/Users/mike/Documents/Projects/AIdioma`)
**HEAD:** `50e53da` (PHASE-002 dialect contract is on `main`)
**Working tree:** dirty — closed PHASE-003/004 work, files-first agent docs, and **active PHASE-005** implementation are **uncommitted**.

Read `AGENTS.md`, then this file. Stay in this session. For a phase, coordinate and delegate; do not start another runner.

---

## Operating model (do not regress)

Praxis is **parked**. Founder is done with sqlite Work, hooks, workbench, and Praxis close/publish gates.

| Do | Do not |
|---|---|
| Track work here | `npx praxis`, hooks on/repair, workbench |
| Edit `Docs/PRODUCT.md`, specs, phase markdown | Treat `.praxis/state.sqlite` or `Docs/WORK.yaml` as live |
| Implement in `apps/web/`, `packages/`, `content/` | Mix Praxis.v2 product work into this repo |
| Prove with tests / browser / `prove-session.ts` | Claim, gate, or `/close` sqlite Work |

If Cursor Write fails with `praxis-gate` / `node` exit 127: `.cursor/hooks.json` should be `{ "version": 1, "hooks": {} }`. Restore that. Do **not** `praxis hooks repair`.

Commands (`/task`, `/fix`, `/handoff`, …) update authored files, then implement. `/plan` and `/run`
on a phase stay in this session as coordinator and delegate coding by area. `/close` and
`/phase-close` additionally follow `Docs/CLOSE.md`; they run independent audit sub-agents but never
publish unless the founder separately asks.

---

## Doing next

- **T-PHASE-COORDINATOR** — phase `/run` agents coordinate and delegate coding by area of concern.
  Authority: `Docs/Evidence/t-phase-coordinator/target.json`.
- **F-CLOSE-REPLAY-EFFICIENCY — stop replaying superseded proofs** is done. Close receipts retain
  and hash full history without executing it again; explicit verification replays only the final
  PASS attempt in one checkout with one dependency install.
  Authority: `Docs/Evidence/f-close-replay-efficiency/target.json`.
- **PHASE-004 — Complete lesson and collection journeys** is closed. The representative lesson,
  bounded Ask AIdioma capability, durable completion, collection unlocks, and recommended-review
  handoff are implemented in the current working tree.
- Phase authority: `Docs/Roadmap/Phases/PHASE-004.md`.
- Target and close-proof contract: `Docs/Evidence/phase-004/target.json`.
- `/close PHASE-004` passed on immutable candidate
  `edb6ca0e42eee87bafaaf0683be8640d08398639ca01c5c66da61eefe316b8b7`. All eight final checks and
  all seven terminal audit lenses passed with no accepted warnings. Receipt:
  `refs/aidioma/close-receipts/edb6ca0e42eee87bafaaf0683be8640d08398639ca01c5c66da61eefe316b8b7/2be1ad30422794c5839a3c9b02e7877bf6a749f98d098a64df31c454c5b3e5af`.
- Implementation report: `Docs/Evidence/phase-004/implementation.md`.
- Signed-in browser journey: passed and retained in `Docs/Evidence/phase-004/browser-journey.md`
  with six identity-free captures covering start through recommended review.
- Founder review established an important limit: PHASE-004 proves the real vertical runtime with
  one teaching card and one scored cue, but it does **not** prove a full lesson onboarding pipeline,
  and “Living here” is not the authored A1 course opener. Do not describe it as either.
- **PHASE-005 — Reusable lesson pipeline and six-lesson proof** is **active**. Authority:
  `Docs/Roadmap/Phases/PHASE-005.md`. Target: `Docs/Evidence/phase-005/target.json`.
- Architecture lock (do not invent a second player or parallel lesson format):
  - Keep the existing rich `Lesson` schema as content authority; add only ordered placement.
  - Optional additive `renderings` on scored sentences; absent ⇒ all three profiles share `es`.
  - New `RichLessonPlacement` + files-first `LessonPromotionReceipt` (no Praxis authority).
  - Keep `DialectContentUnit` + old `PromotedLessonPlacement` for Practice collections.
  - Catalog Lesson 1 is `a1-01-hola-me-llamo`. “Living here” is not the course opener.
  - Promoted lesson/collection unique typed-prompt floors: A1 ≥25, A2 ≥35, B1 ≥50. Finite lesson flow stays short. Practice visit cap is 100 offers, by re-serving the pool — not 100 unique authored items.
  - Remove intermediate prototype and static A1 list. Do not start PHASE-006.
- **PHASE-006 — Reusable Practice collection pipeline and five-collection proof** is proposed at
  `Docs/Roadmap/Phases/PHASE-006.md`, with its close contract at
  `Docs/Evidence/phase-006/target.json`. It consumes Phase 5 items/evidence, removes hard-coded
  collection catalog/resolver branches, and proves five concept/topic collections in the existing
  adaptive Practice workspace.
- Sequence rule: PHASE-005 depends on the now-closed PHASE-004. PHASE-006 starts only after
  PHASE-005 closes.
- **Tutor contract:** keep the SPEC-F-LEARNING-LOOP feedback card, authored hints, and bounded
  Ask AIdioma. Do not add a free tutor, generated hints, speech, or skip/defer. Practice
  collections still lack Hint, Ask AIdioma, and the equivalent-match label; PHASE-006 owns that.
- Do not resume close-gate infrastructure unless the founder explicitly asks.

## Done this session

### PHASE-004 signed-in learner journey

- Real browser proof passed with the dedicated development Clerk user, development Neon, and AI
  Gateway: start → authored hint → scripted Ask AIdioma explanation → reload/resume → miss and
  correction → corrected completion → two newly available collections → recommended review.
- The recommended **Present -ir forms** collection opened in the existing Practice workspace with
  the same promoted cue and active profile.
- Six identity-free screenshots and their SHA-256 hashes are retained in
  `Docs/Evidence/phase-004/browser-journey.md`.
- PHASE-004 remains active because candidate-bound `/check` and `/close` were not requested or run.

### PHASE-004 implementation — finite lesson to recommended review

- Replaced the static Lesson 1 preview with the real **Living here** journey while preserving the
  current app shell, chat feed, cards, composer, and responsive styling.
- Added promoted lesson placement validation, authored dialect-aware hints, bounded contextual
  explanations, resume-safe Neon lesson state, assisted-attempt handling, idempotent completion,
  completion-gated concept/topic collections, and an explainable recommended review.
- Applied development migration `0003_lesson_journey.sql`.
- Latest candidate proof passed: full app typecheck and lint; 38 test files / 268 tests; promoted content validation;
  real Clerk/Neon/AI Gateway journey with two attempts, one contextual exchange, two unlocked
  collections, and reload-retained position.
- Signed-in browser evidence is retained in `Docs/Evidence/phase-004/browser-journey.md` with six
  identity-free captures.

### T-CLOSE-GATES — adversarial files-first close

- Closed on immutable candidate `41648cb7d…`; exact scope excludes this handoff and all
  Practice/product work.
- Final candidate proof passed 26/26 contract regressions plus scoped diff hygiene.
- Independent final Claims, Standards, MCOO, Seams, Security, and provider-usage gates all passed;
  no warnings were accepted.
- Report: `Docs/Evidence/close-gates/close-audits.md`.
- Bundle: `Docs/Evidence/close-gates/close-bundle.json` (`a68d53d3…`).
- Authenticated replay verified receipt ref
  `refs/aidioma/close-receipts/41648cb7d478cbab3b01a098a70b46a365cb1e16b8ad48bef19c385de34d6358/a68d53d3cc8de27e69ec86d9d71034d1748fadfc411b4eab8992772ab137bab3`.
- No branch history advanced and nothing was published, merged, or deployed.

### Tutor-contract review (2026-08-26)

Living PRODUCT/specs/phases still match the production loop: feedback card, authored hints,
canonical vs accepted alternatives, bounded Ask AIdioma (D-025), no free tutor. Replaced the
stale `SPEC-F-PRACTICE` stub, pinned remaining Practice Hint/Ask/equivalent-match work to
PHASE-006, and added a do-not-regress table to `MVP-SEQUENCE.md`.

### Specs — practice feedback card (no new phase)

Wrote the LanguaTalk-like card into the living contract without changing MVP sequence:

- `Docs/PRODUCT.md` — feedback card, authored hints, canonical vs accepted alternative.
- `SPEC-F-LEARNING-LOOP` — card, alternatives, hint, explicit non-goals (no generated hints,
  skip/defer, speech, tap-translate).
- `SPEC-A-LEARNER`, `SPEC-A-CONTENT`, `SPEC-F-CONTENT-PIPELINE` — matching rules.
- `Docs/Roadmap/MVP-SEQUENCE.md` Phase 4 — uses that card; sequence unchanged.

### PHASE-003 — shared adaptive Practice chat loop

- Signed-in Clerk browser proof passed on the promoted **Everyday location** collection.
- Learner journey proved: start → miss → expected repeated cue → correct retry → save → pause → reload → resume → explainable next item → completed-session recap.
- The repeated “You live here.” cue after the miss was correctly explained as the most recent miss; after the correct retry it changed to “Needs strengthening — recent evidence is still uncertain.”
- Save persisted: the correction changed to “Saved in All saved,” and the catalog enabled the **All saved** collection after session completion.
- Unsigned `/practice` failed closed before authentication.
- Browser screenshots are retained in `Docs/Evidence/phase-003/`.

Automated proof passed:

```bash
cd apps/web && npx vitest run src/lib/practice-serving src/components/practice-sets-prototype.test.tsx
cd apps/web && node --conditions=react-server --env-file-if-exists=.env.local --import tsx src/lib/practice-serving/prove-session.ts
```

Results: 9 test files / 48 tests passed. Durable Neon proof passed with 2 attempts, `saved=true`, and reasons `new_in_scope,retry_after_miss,strengthen_weak_item`.

Dev app: `apps/web` (last local URL was `http://localhost:3217/practice`). Needs Clerk + `DATABASE_URL` + Gateway in `.env.local`.

---

## Later (not this loop)

- Sanitize unexpected Practice exception logging before production hardening; the terminal Phase 4
  Security audit classified this as backlog, not a Phase 4 promise blocker.
- Node **22.22.2** + production `npm audit` (old T-004).
- More promoted units / bulk content.
- Practice Hint, Ask AIdioma, and equivalent-match card copy — PHASE-006, after the lesson
  pipeline closes. Do not add a LanguaTalk-style free-tutor phase.
- Saved library expansion and Translate — PHASE-007. Unrestricted off-topic chat and a
  standalone tutor remain out.

---

## Already in the working tree (do not redo)

**Practice session**

- `apps/web/src/lib/practice-serving/` — policy, service, Neon repo, evaluator, API contract, `prove-session.ts`
- `apps/web/src/app/api/practice/session/route.ts`
- `apps/web/src/components/practice-workspace.tsx`
- Highlights: attempts keep `correction`; UI uses `correction-segments.ts` (spelling vs changed). Tests passed 2026-08-25.

**Content / dialect (already on main via PHASE-002)**

- Promoted A1 unit, es-AR / es-419 / es-ES, answer policy, fixtures.

**Agent docs**

- `AGENTS.md`, `Docs/AGENTS.md`, `Docs/START.md`, `.cursor/rules/aidoma-files-first.mdc`
- `.claude/skills/*` rewritten to files-first (`.agents/skills/praxis-*` are symlinks to those)

---

## Next session

- Read `AGENTS.md`, then this file.
- Phase 5 is active. Schema/pipeline and six-lesson content are delegated; runtime, proof, and
  browser journey follow once those land. Do not start PHASE-006.
- Preserve the closed PHASE-003 proof as the shared-loop foundation; do not rebuild it as a second
  lesson player. Keep the feedback card, authored hints, and D-025 Ask AIdioma bounds.
- Leave T-CLOSE-GATES parked unless the founder explicitly requests more infrastructure work.
- Commit or open a PR only when the founder asks via `/publish`.
