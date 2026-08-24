# MVP implementation sequence

Status: product-design input for Praxis phase seeding; this file is not the Work authority.  
Authority: `.praxis/state.sqlite`

The sequence is organized by learner-visible proof, not by pages or speculative services.
Each phase must retain its own adversarial checks before the next one expands scope.

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
**Non-goal:** More modalities or a learned recommendation model.

## Phase 4 — Complete lesson and collection journeys

**Outcome:** Lessons are finite teaching arcs in the shared workspace; completion unlocks
review. Concept and topical collections use the same content and serving contracts.  
**Learner proof:** One representative level supports lesson → collection → recommended review
with consistent dialect and progress.  
**Non-goal:** Generating every A1–C1 unit before the vertical journey is proven.

## Phase 5 — Saved library and Translate

**Outcome:** Save works from lessons, practice, and bidirectional Translate; All saved and one
optional named-list assignment persist; saved practice uses the shared loop; lookups grant no
mastery.  
**Learner proof:** Translate an ambiguous item, swap direction, save it, organize it, practice
it in Spanish production, and retain the correct dialect/source history.  
**Non-goal:** Multi-list tagging, folders, sharing, or curriculum promotion from personal data.

## Phase 6 — Curriculum factory and coverage

**Outcome:** The proven pipeline generates, reviews, versions, and promotes the complete A1–C1
lesson and collection matrix for the promised profiles with bounded human sampling.  
**Learner proof:** Coverage, duplication, level-fit, dialect, answer, and correction dashboards
meet the launch threshold; every marketed level has a coherent learner path.  
**Non-goal:** Lowering review thresholds to increase volume.

## Phase 7 — Market readiness

**Outcome:** Onboarding/placement, resume, instrumentation, accessibility, mobile behavior,
latency, privacy, failure states, content reporting, and launch messaging meet the MVP bar.  
**Learner proof:** A new account reaches first value, returns, and completes the full core loop
on mobile without hidden operator intervention.  
**Non-goal:** Payments, social mechanics, streak pressure, or additional practice modes unless
retention evidence justifies them.

## Sequence rule

Do not parallelize a downstream feature across an unsettled contract. Content identity and
dialect behavior precede the shared loop; the shared loop precedes surface expansion; one
vertical journey precedes bulk generation. This is the shortest path that avoids rebuilding
the hard infrastructure after content volume arrives.
