---
id: PRACTICE-SERVING-001
title: Practice serving and reinforced scheduling
area: practice-serving
status: active
implementation: partial
founder_review: approved
updated: 2026-08-03
---

# Practice serving and reinforced scheduling

This specification is the founder-approved planning contract for `PRACTICE-SERVING-001`. The
approved policy is implementation authority for future `/feat` slices; the implemented baseline
continues to describe current application behavior until those slices prove and replace it.

## Outcome

A learner can practice one reviewed collection for as long as they choose. When they miss a typed
prompt, AIdioma gives immediate feedback, serves genuinely different material, and returns the exact
missed direction soon enough to reinforce it. Correctly resolved items leave a small internal working
set and are replaced without creating a learner-visible batch ending.

The concrete journey is Restaurant Spanish: a learner may practice for forty-five minutes, end when
they choose, and return later at a different stage. The collection remains Restaurant Spanish while
the resolved eligible scope and internal order may change. AIdioma never silently broadens a chosen
focus, invents reviewed novelty, or calls same-visit correction durable learning.

## Learner-visible contract

- A **Practice visit** begins when the learner starts a collection or Saved practice and ends only
  when the learner explicitly ends it. Internal working-set cycles never create a completion screen,
  forced stop, progress meter, or mastery claim.
- Feedback remains immediate. A missed item may be described as returning after other practice, but
  working-set size, weights, seeds, policy versions, weakness scores, and internal cycle boundaries
  stay hidden.
- The visible scope is the snapshotted collection, learner stage, activity, direction, and focus.
  Adjacent collections, a broader focus, another direction, or generated content require an explicit
  learner choice; they are never silent fallback.
- When matching reviewed material is limited or all matching material has been seen, the experience
  says so plainly and offers reviewed repetition, an explicit scope change, or End and recap.
- A recap may describe attempts and same-visit corrections. It must not label an internal release,
  one correct response, or a corrected retry as learned, mastered, confirmed, or lesson completion.

## Non-goals

- Durable mastery, due dates, weak-item inference, progress, lesson completion, persistence, streaks,
  or cross-visit adaptation. Those require `PROGRESS-SAVED-001`, `DATA-PERSISTENCE-001`, and
  `PLATFORM-SECURITY-001` authority.
- Redesigning the Practice catalog, Settings, composer, feedback, or recap. This contract defines
  capabilities those surfaces must support; `PRACTICE-PAGE-001` and `PRACTICE-SETTINGS-001` own the
  target journey and controls.
- Changing answer authority or the evaluator. `EVALUATION-001` owns verdict semantics and feedback;
  the serving adapter consumes only a normalized scheduling outcome.
- Reinforced Flashcard scheduling before the learner can honestly report Missed/Recalled. Reveal or
  Next alone cannot count as successful retrieval.
- ML ranking, a target ontology, inferred semantic similarity, numeric learner-facing engine controls,
  automatic content generation, or a universal Lesson/Practice session engine.
- Extracting Lesson reuse. Practice proves this engine first; a later concrete Lesson consumer may
  justify extracting a smaller shared primitive without importing collection progression semantics.

## Implemented behavior

The first Restaurant typed vertical slice is implemented:

- A browser-safe pure `practice-policy-v1` transition engine owns deterministic five-item working
  sets, independent Both directions, miss return, third-miss parking, refill, reviewed repetition,
  small-pool shortfalls, recovery tokens, stale-offer rejection, and exact-version resume checks.
- The Restaurant resolver pins the exact 50-prompt reviewed-prototype payload to a versioned SHA-256
  manifest. It validates the 46 promoted review bindings plus the four reviewed original prototype
  identities, active lifecycle, 50-prompt collection depth, and the 10-prompt advertised-scope gate.
  An empty requested focus is explicit unavailability and never falls back to the stage pool.
- The typed adapter maps only `correct` to `retrieved` and `close`/`wrong` to
  `needs_reinforcement`. Learner text, accepted answers, feedback, scores, and provider data do not
  enter engine input or state. Ungraded responses do not advance; a non-retryable failure offers an
  explicit continue-without-evidence action.
- `PracticeWorkspace` preserves the immutable visit snapshot and learner-controlled End. Restaurant
  typed offers come from the engine instead of numeric modulo advancement; blocked narrow-pool states
  require an explicit single-use Repeat now choice, settings change, or End.
- Deterministic tests prove the policy traces and application mapping. The production-route smoke
  proves `A miss -> B -> C -> D -> A retry`, rendering, keyboard flow, axe checks, reduced motion,
  200% text, and no horizontal overflow at 320px, phone, and desktop viewports in both themes.

Personal Saved practice, non-Restaurant prototype collections, and Flashcards remain explicitly on
the legacy exhaustive modulo path. They do not claim policy-v1 reinforcement. The application still
uses an in-memory prototype snapshot, a hard-coded intermediate learner stage, and no durable learner
history; production checkpoint ownership and durable resume remain deferred to their owning work.

## Approved policy v1

### Scope and evidence boundary

Policy v1 is deterministic **current-visit reinforcement for evaluated typed Practice**. It does not
claim durable adaptation because the application has no durable learner history. Every eligible item
therefore begins as history-unknown; v1 does not fabricate due, weak, saved-boost, or mastery lanes.

The source resolver freezes an exact eligible reviewed pool before the engine starts. Eligibility is
the intersection of the explicit collection promise, learner stage supplied by the application,
activity, direction, focus, active lifecycle, and valid content version. An empty intersection is an
explicit unavailable result, never permission to broaden scope.

The product-owned content-depth rule and serving-specific scope gate prevent this from being a normal
learner experience:

- `PRODUCT.md` requires at least **50 distinct reviewed underlying prompts** for a shipping collection,
  with 100 as the target. Direction variants do not inflate this count.
- Every learner-selectable stage + activity + focus scope must resolve at publication time to at
  least **10 distinct reviewed underlying prompts** for every advertised direction. Ten supports two
  complete five-item working-set fills before repetition. A shallower focus is not published or
  exposed as available merely because the parent collection passes the overall minimum.
- Saved practice is an explicit learner-curated exception and may contain fewer than ten prompts.
- Runtime shortfall behavior remains mandatory because Saved scopes can be small and previously
  valid content can become deprecated, withdrawn, stale, or temporarily unavailable.

The implemented Restaurant resolver proves these gates from executable source metadata. Its pinned
manifest binds all 50 underlying reviewed-prototype prompt identities to collection/item versions,
active lifecycle, and reviewed-prototype publication authority. This is application-serving
authority for the prototype slice, not canonical curriculum or launch approval.

### Identity and working set

- The source identity is collection ID and version plus item ID and version. The scheduling identity
  adds activity and direction. Prompt text, accepted answers, learner text, and evaluator payloads do
  not enter serving state.
- The working set contains **five distinct underlying item identities**, or all available identities
  when the exact pool contains fewer than five.
- In Both, one item slot owns two independent directional requirements. The first directions are
  seeded and balanced; when feasible, the difference between EN -> ES and ES -> EN offers is at most
  one. The two directions never satisfy or update each other.
- A direction is resolved for the current working-set cycle after one normalized `retrieved` outcome.
  If it previously missed, the later retrieval is recorded only as a same-visit correction.
- An item leaves its working-set slot only when every direction required by the visit configuration
  is resolved. This internal action is called **release**, not learner-visible graduation.

### Normalized commands

The application adapter sends only these policy commands for the current offer:

| Command | Typed adapter | Serving effect |
|---|---|---|
| `retrieved` | Current `correct` verdict | Resolve this exact direction for the current cycle. |
| `needs_reinforcement` | Current `close` or `wrong` verdict | Keep the direction unresolved and schedule a delayed retry. |
| `defer_without_evidence` | Explicit recovery when evaluation cannot complete | Park the whole underlying item without positive/negative evidence or loss of already-resolved directions. |
| `repeat_now` | Explicit learner choice from a blocked small-pool/all-parked state | Use the separate blocked-state recovery transition to re-enter one deterministic unresolved direction without success credit or a spacing claim. |

`ungraded` by itself makes no engine transition. The prompt, answer, and current offer stay in place.
The recovery UI may retry evaluation, explicitly defer without evidence, or end the visit. Mapping
future evaluator results remains an `EVALUATION-001` adapter decision rather than engine logic.

A **completed other-item transition** is an accepted `retrieved`, `needs_reinforcement`, or
`defer_without_evidence` command for a different underlying item. Creating or displaying an offer,
receiving an ungraded response, and invoking `repeat_now` do not satisfy miss lag. Retry due ordinals
advance from accepted transitions rather than wall time.

### Miss return, parking, and refill

1. A miss returns in the **same direction after three completed transitions of other underlying items**
   when the exact pool permits: `A miss -> B -> C -> D -> A retry`.
2. The opposite direction of A does not count as an intervening item and stays locked until the
   failed direction is retrieved or A is parked. This avoids treating feedback exposure as practice
   in the opposite direction.
3. A due same-visit retry has priority once its lag is satisfied, subject to the same-item spacing
   rule. Before that point, unresolved never-offered active items continue in deterministic order.
4. After a third `needs_reinforcement` outcome for the same directional unit in one occupancy, the
   engine parks the underlying item without releasing it as successful. Parking frees the slot so
   reserve inventory cannot starve. The item goes behind never-active reserve items and becomes
   eligible again after five other-item transitions, or the maximum honest lag the pool can provide.
5. Releasing or parking an item immediately refills its slot from the deterministic reserve. After
   all eligible identities are successfully released, a new internal cycle begins in a new
   deterministic order and is labeled reviewed repetition. The learner's visit continues unchanged.

Parking is an underlying-item scheduling state, never an outcome. In Both, directions already
resolved during the current cycle stay resolved while parked; unresolved directions stay unresolved.
The direction that triggered parking is the first eligible direction when the item returns. Normal
cooldown re-entry starts a new occupancy and resets its per-occupancy miss counter, while cumulative
visit trace facts remain available for recap/debugging. Parking never converts either direction to
success. A cycle cannot finish while any identity remains parked or unresolved.

`defer_without_evidence` uses the same whole-item parked queue, preserves partial Both resolution,
does not increment any miss counter, and starts the normal cooldown behind never-active reserve. It
does count as a completed transition for spacing a different underlying item because the learner was
presented and attempted a distinct prompt, but it creates no learning evidence for the deferred item.

When automatic scheduling cannot proceed, `repeat_now` is accepted only from
`no_spaced_retry_available` or `all_active_items_parked`. It deterministically selects the oldest
unresolved blocked/parked item, restores the direction that caused the block, preserves partial Both
resolution, and resets the new occupancy miss counter. It does not claim spacing or success. Further
immediate repetition requires a fresh learner choice each time; scope change and End remain available,
so the engine never creates an automatic singleton loop.

The values five, three, three misses, and five-transition parking cooldown are conservative product
hypotheses for a simple baseline. They are versioned constants, not learner settings and not claimed
scientific optima.

### Interleaving and ordering

- Never offer the same underlying item consecutively when another legal item exists.
- Enforce the same-item lag across both directions. Do not infer conceptual similarity from broad
  prototype grammar tags.
- A future source may provide a reviewed interleave key; v1 does not require or invent one.
- The current varied-order preference may select a seeded versus authored reserve baseline while it
  remains implemented. Neither mode disables reinforcement, parking, or anti-clumping. Its target
  learner-facing disposition belongs to `PRACTICE-SETTINGS-001`.
- All tie-breaking is deterministic from canonical candidate identity, seed, policy version, and
  cycle index. Caller array order cannot change the result.

### Small pools, repetition, and exhaustion

| Condition | Required behavior |
|---|---|
| Empty exact pool | Return `no_eligible_reviewed_items`; do not start, crash, or widen scope. |
| Published collection scope below ten items | Treat as a publication/configuration defect; do not advertise it as available. |
| Saved or degraded runtime scope below five items | Use every available identity and report `working_set_shortfall`. |
| Pool cannot meet miss lag | Use the maximum spacing available and report `spacing_shortfall`; never claim the requested lag occurred. |
| Singleton after a miss | Return `no_spaced_retry_available`; require `repeat_now`, scope change, or End. No automatic repeat occurs. |
| All matching items seen but safe repeats remain | Continue only as `reviewed_repeat` and make loss of novelty explainable. |
| Every active item parked | Refill unused reserve; if none exists, return `all_active_items_parked`. `repeat_now` re-enters only the oldest unresolved item by explicit choice. |
| Frozen source item unavailable | Return `source_version_unavailable`; never substitute a different item under the same offer. |
| Unsupported checkpoint policy/schema | Return `resume_incompatible`; require an explicit updated restart or End. |

True exhaustion means no safe reviewed item inside the frozen promise can be served. Novelty
exhaustion means matching items remain safe to repeat. The engine and UI must not conflate them.

## Pure engine contract

The engine is an incremental state transition, not a precomputed queue:

```text
start(input) -> ready(state, nextOffer, availability) | unavailable(reason)

advance(state, currentOfferOrdinal, command)
  -> ready(nextState, nextOffer, effect, availability) | unavailable(nextState, reason)

recover(unavailableState, singleUseRecoveryToken, repeat_now)
  -> ready(nextState, nextOffer, effect, availability) | unavailable(nextState, reason)
```

Start input contains:

```text
stateSchemaVersion, policyVersion, seed
frozen scope identity and visible configuration
requested direction and ordering compatibility mode
canonical eligible source identities, versions, allowed directions, and authored ordinals
```

Serializable state contains only what is necessary to reproduce the next decision:

```text
frozen scope and candidate identities/versions
seed, policy version, state schema version, cycle index, offer ordinal
active, reserve, parked, and resolved-per-direction state
retry due ordinals, miss counts, and recent underlying-item window
```

An offer returns identity, direction, ordinal, learner-safe reason, policy version, and availability
metadata. Learner-safe reasons may include `new_in_scope`, `worth_another_try`, `other_direction`,
`reviewed_repeat`, and shortfall codes. It never returns answers, learner text, raw verdict/score,
error tags, evaluator metadata, mastery state, or internal ranking weights.

Outcome/defer commands require the current offer ordinal. `repeat_now` is never accepted through that
path because a blocked state has no current offer. An unavailable result instead returns an opaque,
single-use recovery token bound to the exact state revision and unavailable reason. `recover` accepts
it only for `no_spaced_retry_available` or `all_active_items_parked`, then invalidates it.

The engine rejects a stale, duplicate, or non-current offer ordinal and a stale, reused, mismatched,
or client-invented recovery token. Application service and future persistence own authenticated
learner/session binding, idempotency, timestamps, atomic writes, and opaque server-side storage; a
pure engine does not make client state trustworthy.

## Determinism and resume

- Canonical inputs plus the same policy version, seed, and normalized command trace must produce a
  structurally equivalent canonical decision trace regardless of caller candidate order. If persisted
  or hashed later, one versioned canonical serialization must define property order and numeric form.
- A checkpoint resumes only with its exact supported state-schema and policy implementation and its
  frozen source versions. A policy change applies to a new visit and never silently replans an active
  visit.
- V1 must prove serialization and uninterrupted-versus-restored equivalence in deterministic tests.
  Durable refresh/device resume remains deferred to the persistence and platform work items.
- Production resume state must be server-owned or integrity-protected. No client may claim arbitrary
  outcomes, item identities, or policy state.

## Responsibility boundaries

| Owner | Responsibility |
|---|---|
| Practice source resolver | Exact reviewed eligibility, collection/stage/focus promise, content identity/version, allowed activity/directions. |
| Serving engine | Deterministic working set, retry lag, release, park, refill, interleaving, repetition, and availability reasons. |
| Evaluation | Answer authority, verdict, feedback, retryability, and mapping approval for the serving adapter. |
| Practice application service | Bind current offer to evaluation, apply one command once, coordinate failure recovery, and expose learner-safe state. |
| Persistence/platform | Session/event identity, authentication, idempotency, atomic storage, resume, deletion, and trust boundaries. |
| Practice UI | Immediate feedback, continuous learner-ended visit, shortfall/exhaustion/restart communication, accessible focus and announcements. |
| Lessons | Finite teaching and progression. No dependency on this Practice engine until a concrete Lesson slice proves the same lower-level job. |

## First implementation slice after approval

Implement one Restaurant Spanish typed vertical slice:

1. Add the pure versioned transition engine and golden trace tests.
2. Add an exact prototype source resolver that rejects an empty requested focus instead of silently
   broadening it, enforces the overall and exposed-scope content-depth gates, and provides explicit
   collection/item version, lifecycle, and reviewed-publication authority to the engine. The current
   Restaurant count is a prototype depth fact until that executable authority passes.
3. Integrate graded typed outcomes without moving learner text, answer authority, or evaluator
   payloads into the engine. Preserve ungraded no-advance behavior and add an explicit no-evidence
   escape for a non-recoverable evaluation state.
4. Preserve the immutable visit snapshot and learner-controlled End while replacing numeric modulo
   advancement for the integrated typed path.
5. Prove broad Both, one miss/retry, repeated miss/parking, reviewed repetition, narrow pools, empty
   focus, evaluation failure, and explicit End in the real Practice route with keyboard, screen-reader
   announcements, reduced motion, and a 320px viewport.

This slice adds no learner-history tables, durable learner writes, Flashcard inference, Settings
redesign, Lesson extraction, or generated fallback.

The 50/10 publication gate initially applies to Restaurant typed Practice and later integrated
advertised scopes. Other non-integrated prototype collections and legacy Flashcard paths remain
explicitly on existing behavior until migrated or hidden; they must not claim v1 reinforcement or
shipping readiness merely because they still render.

## Acceptance and proof criteria

- Golden traces prove cold start, all-correct release/refill/repetition, exact miss lag, repeated-miss
  parking/refill, Both independence, and explicit defer-without-evidence.
- Cold-start Both uses five distinct identities when available, balances first directions, and never
  places the same underlying item adjacently.
- `A miss -> B -> C -> D -> A retry` holds when enough distinct alternatives exist. Retrieval resolves
  only A's exact direction; the other direction remains independent.
- Third miss parks without successful release, admits reserve inventory, and cannot starve every
  other eligible identity.
- Golden traces cover one Both direction resolved before the opposite direction parks and re-enters;
  no-evidence deferral after partial Both resolution; all five items parked with and without reserve;
  singleton `repeat_now`; and deterministic selection from an all-parked state.
- Empty, singleton, two-item, underfilled, exact-focus-empty, all-parked, and repeat-only pools return
  explicit reasons without crashes, hidden scope changes, or false spacing claims.
- Publication validation rejects a collection below 50 distinct reviewed prompts and rejects or hides
  an advertised stage + activity + focus + direction scope below 10 distinct underlying prompts.
  Counting direction variants never satisfies either minimum.
- `correct` maps to `retrieved`; `close` and `wrong` map to `needs_reinforcement`; ungraded produces no
  transition; explicit evaluation recovery produces no positive or negative learning evidence.
- Same canonical input/seed/policy/commands is structurally equivalent; permuting candidate input
  changes nothing; different seeds vary only choices allowed by the same invariants.
- Duplicate, stale, late-after-End, and late-after-restart results cannot advance twice or mutate a new
  visit.
- A stale outcome ordinal remains invalid while a recovery token for the matching blocked state
  succeeds exactly once; token reuse or use against another unavailable reason fails closed.
- End while evaluation is in flight ignores the late result. Resume incompatibility can only produce
  an explicit updated restart or End, both covered by integration proof.
- Serialized/restored state produces the same next offer as uninterrupted state. Unsupported policy
  or missing frozen content fails explicitly rather than replanning.
- Internal cycles never end the visit. The learner can End at any turn and current-cycle release never
  appears as mastery, lesson completion, or durable weakness.
- Saved practice contains only its frozen valid references; stale or zero-valid Saved scopes are
  explicit and never substitute collection content.
- The engine output/state contains no answers, learner text, provider payloads, raw scoring internals,
  hidden work registry data, or Lesson progression state.
- Focused unit/integration tests, repository typecheck/lint/tests/build, and real-route accessibility
  proof pass for the approved slice.

## Research disposition

- Retrieval practice generally improves later retention compared with restudy, but this does not
  validate one exact queue rule ([Rowland 2014](https://doi.org/10.1037/a0037559)).
- Equal spacing can match or outperform expanding intervals at longer retention horizons; a fixed
  within-visit lag is therefore a reasonable simple baseline, not an optimum
  ([Karpicke and Roediger 2007](https://doi.org/10.1037/0278-7393.33.4.704)).
- L2 interleaving results depend on the practiced construct and outcome. Interleaving may support
  accuracy for similar demands while blocked work may support fluency; v1 therefore guarantees only
  item spacing and direction balance, not semantic optimization
  ([Zhang 2023](https://doi.org/10.1017/S0272263123000062)).
- Successive relearning research emphasizes correct retrieval across spaced sessions. Same-visit
  correction remains scheduling evidence, not durable retention proof
  ([Rawson and Dunlosky 2022](https://doi.org/10.1177/09637214221100484)).

Working-set size five, miss lag three, third-miss parking, and the parking cooldown require product
validation. The first implementation should instrument deterministic trace facts without presenting
them as learning KPIs or durable learner state.

## Founder-approved decisions

1. Use a current-visit-only v1 instead of claiming due/weak adaptation before durable history.
2. Use five underlying prompts as the invisible working-set target.
3. Require one successful retrieval per required direction for internal release, with directions
   independent and Both retaining its current default pending Settings review.
4. Use a fixed three-other-item miss lag and parking after the third miss, with explicit degraded
   spacing for narrow pools.
5. Use reviewed repetition as the continuous-visit fallback and explicit reasons rather than
   silent scope broadening or invented novelty.
6. Limit reinforced v1 integration to evaluated typed Practice; Flashcards remain outside
   success-based release until they gain an honest outcome action.
7. Use a pure Practice-owned engine with serializable state and no durable writes or Lesson
   extraction in the first slice.
8. Use the product-owned 50-prompt shipping minimum and 100 target, plus 10 distinct prompts as the
   minimum for each advertised stage + activity + focus scope and direction.

## Decisions and discovered issues

### Accepted decisions

| ID | Classification | Decision | Registry link |
|---|---|---|---|
| PRACTICE-SERVING-D001 | accepted | Internal working sets and cycles never end the learner's continuous Practice visit. | `PRACTICE-SERVING-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D002 | accepted | Retire full-inventory exhaustion as the primary repeat rule for evaluated typed Practice. | `PRACTICE-SERVING-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D003 | accepted | Use policy v1 constants: five item slots, three other-item miss lag, third-miss parking, and five-transition park cooldown. | `PRACTICE-SERVING-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D004 | accepted | Treat directions as independent scheduling facets and require one retrieval per requested direction for current-cycle release. | `PRACTICE-SERVING-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D005 | accepted | Same-visit correction schedules and explains the visit but never proves durable learning or Lesson progress. | `PROGRESS-SAVED-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D006 | accepted | V1 uses reviewed repetition and explicit shortfalls; it never silently widens scope or generates fallback. | `PRACTICE-SERVING-001` and `CONTENT-GENERATION-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D007 | accepted | Keep the engine Practice-owned until a real Lesson consumer proves a smaller reusable job. | `LESSONS-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-D008 | accepted | Apply the product-owned 50-prompt minimum/100 target and expose only exact selectable scopes with at least 10 distinct underlying prompts per advertised direction. | `PRODUCT-001`, `PRACTICE-SERVING-001`, and `CONTENT-GENERATION-001` in [PRODUCT.md](../PRODUCT.md) and [WORK.yaml](../WORK.yaml) |

### Discovered issues and follow-ups

| ID | Classification | Finding and disposition | Registry link |
|---|---|---|---|
| PRACTICE-SERVING-I001 | implemented | Before this slice, an empty requested focus silently fell back to the whole stage pool. The integrated Restaurant typed source now returns explicit unavailability without widening scope; non-Restaurant paths remain outside policy v1 until migrated or hidden. | `PRACTICE-SERVING-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-I002 | implemented | Before this slice, the modulo selection path could dereference an empty unit array. The integrated Restaurant typed source and serving engine now return explicit unavailable or recovery states instead of crashing; remaining legacy paths do not claim this protection until migrated or hidden. | `PRACTICE-SERVING-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-I003 | implementation limitation | Learner stage is hard-coded and no durable history exists. V1 accepts an explicit resolved stage and treats history as unknown; durable adaptation remains deferred. | `PROGRESS-SAVED-001` and `DATA-PERSISTENCE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-I004 | implemented | Before this slice, a non-retryable ungraded result had no continue-without-evidence escape. The typed serving path now preserves the answer and requires an explicit learner choice to continue without learning evidence; evaluator copy and semantics remain owned separately. | `EVALUATION-001` and `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-SERVING-I005 | deferred activity gap | Flashcard Next records no honest retrieval outcome, so it cannot participate in success-based reinforcement. Do not infer success; resolve its interaction before adaptation. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
