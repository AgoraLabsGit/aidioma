# MVP implementation sequence

Status: authored learner-product sequence.
Authority: `Docs/NOW.md` plus the phase files under `Docs/Roadmap/Phases/`.

The sequence is organized by learner-visible proof, not by pages or speculative services.
Each phase must retain the candidate-pinned checks and independent audits required by
`Docs/CLOSE.md` before the next one expands scope.

## Phase 1 — Product contract and adversarial audit

**Outcome:** Approve the marketable MVP, MCOO cuts, minimal authorities, dialect contract, and
launch risks.
**Proof:** `Docs/PRODUCT.md`, D-016 through D-023, projected core specs, and R-003 agree.
**Non-goal:** Product implementation.

## Phase 2 — Dialect-aware learning contract

**Outcome:** One vertical content unit has stable concept/meaning IDs, A1–C1 placement fields,
structured `es-AR`/`es-419`/`es-ES` renderings, answer policy, validation fixtures, review
results, and a promotion receipt.
**Learner proof:** The same promoted unit renders and grades correctly in all three profiles.
**Non-goal:** Bulk lesson generation or new UI.

Why second: every later surface would otherwise create incompatible words, concepts, answers,
and regional variants.

## Phase 3 — Shared adaptive chat loop

**Outcome:** The live Practice interaction becomes a reusable session contract for lesson,
collection, and saved sources. The deterministic policy serves eligible weak/due/new material,
and evaluation records retained evidence without directional mastery.
**Learner proof:** A learner completes, misses, retries, pauses, resumes, saves, and receives an
explainable next item in one collection using promoted content.
**Infra:** Clerk user identity, Neon `aidioma_development` session/attempt/item/save writes, and
AI Gateway for ambiguous grading. Synthetic learner and keyless auth are opt-in, not proof.
**Non-goal:** More modalities or a learned recommendation model.

## Phase 4 — Complete lesson and collection journeys

**Outcome:** Lessons are finite teaching arcs in the shared workspace; completion unlocks
review. Concept and topical collections use the same content and serving contracts. The
shared workspace uses the SPEC-F-LEARNING-LOOP feedback card, may reveal authored hints, and
implements SPEC-F-CONTEXTUAL-QUESTIONS so learners can ask bounded open-ended questions about
the current topic without giving runtime AI grading or curriculum authority.
**Learner proof:** One representative level supports lesson → collection → recommended review
with consistent dialect and progress, including a contextual question that survives resume.
**Infra:** Same Clerk + Neon + Gateway surfaces; persist lesson position on Neon.
**Non-goal:** Generating every A1–C1 unit before the vertical journey is proven.

## Phase 5 — Reusable lesson pipeline and representative course proof

**Outcome:** One reviewed rich lesson artifact can enter the promoted catalog and run as a durable
multi-step lesson without lesson-specific app code. The real A1 introduction and five reviewed
A2/B1 proof lessons use the same teaching, authored-hint, typed-check, contextual-help, feedback,
resume, completion, and review-handoff contracts.
**Learner proof:** A signed-in learner completes all six full lessons; adding a fixture lesson
changes content and placement data but no lesson-specific component, route, session service, or
grader. The catalog has one promoted source of truth and identifies exact CEFR levels honestly.
**Infra:** Existing Clerk + Neon + Gateway surfaces; generalize the durable checkpoint for ordered
lesson steps and content versions, and write the profile-neutral item evidence the existing
adaptive Practice policy can consume.
**Non-goal:** Bulk A1–C1 generation or claiming that the five representative A2/B1 lessons are the
final intermediate sequence. Generalizing the Practice collection catalog is Phase 6.

## Phase 6 — Reusable Practice collection pipeline and representative proof

**Outcome:** One reviewed concept/topic collection enters the promoted Practice catalog and runs
through the existing adaptive workspace without collection-specific JSX, resolver, session,
grading, or persistence branches. Five A1–B1 collections reuse Phase 5 items and evidence.
**Learner proof:** A signed-in learner opens and completes five data-driven collections, receives
explainable weak/due/new serving, uses an authored hint and bounded contextual question, pauses and
resumes, saves an item, and sees prior lesson evidence affect collection ordering. Adding a fixture
collection changes content/promotion data only.
**Infra:** Existing Clerk + Neon + Gateway, Practice session/evidence tables, evaluator, and shared
learning turns; add only the minimum promoted collection definition/registry.
**Non-goal:** A second content pipeline, Saved/Translate, new modalities, learned ranking, or the
complete A1–C1 collection matrix.

## Phase 7 — Saved library and Translate

**Outcome:** Save works from lessons, practice, and bidirectional Translate; All saved and one
optional named-list assignment persist; saved practice uses the shared loop; lookups grant no
mastery.
**Learner proof:** Translate an ambiguous item, swap direction, save it, organize it, practice
it in Spanish production, and retain the correct dialect/source history.
**Infra:** DeepL for Translate; named-list assignment on Neon. Ask founder for the DeepL key.
**Non-goal:** Multi-list tagging, folders, sharing, or curriculum promotion from personal data.

## Phase 8 — Curriculum factory and coverage

**Outcome:** The proven pipeline generates, reviews, versions, and promotes the complete A1–C1
lesson and collection matrix for the promised profiles with bounded human sampling.
**Learner proof:** Coverage, duplication, level-fit, dialect, answer, and correction dashboards
meet the launch threshold; every marketed level has a coherent learner path.
**Non-goal:** Lowering review thresholds to increase volume.

## Phase 9 — Market readiness

**Outcome:** Onboarding/placement, resume, instrumentation, accessibility, mobile behavior,
latency, privacy, failure states, content reporting, and launch messaging meet the MVP bar.
**Learner proof:** A new account reaches first value, returns, and completes the full core loop
on mobile without hidden operator intervention.
**Infra:** Production Clerk, least-privilege Neon roles, Preview isolation, CSP/headers,
instrumentation, privacy. This hardens the already-wired providers; it is not first integration.
**Non-goal:** Payments, social mechanics, streak pressure, or additional practice modes unless
retention evidence justifies them.

## Infrastructure contract

Home: `SPEC-A-PLATFORM` and D-024. Do not open a separate infra phase.

| When | Must be real | Still later |
|---|---|---|
| Phase 3 (now) | Clerk identity, Neon development DB, AI Gateway | Least-privilege roles, CSP, onboarding telemetry |
| Phase 7 | DeepL | Multi-list tagging |
| Phase 9 | Production credentials, isolated Preview/Production DBs, launch privacy | Payments, native, offline |

Agents use `npx neonctl` and the Vercel CLI. Ask the founder only for secrets those tools cannot
supply. Never commit or print secret values.

## Sequence rule

Do not parallelize a downstream feature across an unsettled contract. Content identity and
dialect behavior precede the shared loop; the shared loop precedes one reusable full-lesson
pipeline; shared lesson items and evidence precede the reusable collection pipeline; both proven
pipelines precede personal surface expansion and bulk generation. Wire Clerk, Neon, and Gateway at
first consumer so the hard infrastructure is not rebuilt after content volume arrives.
