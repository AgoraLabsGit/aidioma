---
id: PRACTICE-PAGE-001
title: Practice page and learner controls
area: practice
status: planned
implementation: mixed
founder_review: approved
updated: 2026-08-04
---

# Practice page and learner controls

This is the founder-approved planning contract for the immediate catalog portion of
`PRACTICE-PAGE-001`. It incorporates the founder's requested changes, an audit of current executable
behavior, an independent three-perspective design panel, and a fresh adversarial audit. Accepted
catalog decisions are implementation authority for a future `/feat`; broader deferred Practice-page
questions remain unapproved.

The founder rejected the Settings design rendered on 2026-08-03 as the target experience. This
catalog plan does not approve that panel or expose additional engine controls.

## Outcome

Give learners a calm place to find a useful collection, understand its intended level and their
relationship to it, start immediately, keep useful material, and return later without turning
Practice into a configuration or analytics surface.

## Learner jobs

- Scan a small catalog and understand what each collection helps me practice.
- Recognize whether a collection is intended for my current level.
- Start from the main card without confusing Save or Settings with the start action.
- Find material I saved and, once durable history exists, return to recent or unfinished practice.
- Understand any progress signal without confusing one visit's accuracy with lasting knowledge.

## Non-goals

- Defining the durable collection-evidence formula, mastery vocabulary, or persistence schema; see
  `PROGRESS-SAVED-001` and `DATA-PERSISTENCE-001`.
- Treating same-visit correction or the current latest-session percentage as mastery.
- Defining scheduling, batching, reinforcement, or collection eligibility; see
  `PRACTICE-SERVING-001`.
- Approving the rejected Practice Settings information architecture.
- Advertising user-created collections, durable Saved, Recent, Not started, or Review suggested
  before those capabilities exist.
- Combining Lessons and Practice into one learner-facing progression model.

## Current executable truth

- `/practice` renders four prototype collections and starts practice from the main card body.
- Only Restaurant Spanish typed Practice currently uses the reviewed, version-pinned serving source.
  The other three collections remain explicitly on unreviewed legacy prototype paths and are not
  publishable merely because they render.
- Restaurant's serving authority is not production readiness. Answer-bearing fixtures still reach
  the browser, and evaluation/platform production boundaries remain owned by `EVALUATION-001` and
  `PLATFORM-SECURITY-001`.
- The catalog uses one flat chip row containing `All`, `Saved`, `Vocabulary`, `Verbs`, `Phrases`,
  `Topics`, and `Situations`.
- `Saved` is learner organization, while the remaining labels are overlapping content facets. A
  collection can match several of them, so the row mixes different concepts and does little useful
  narrowing at the current catalog size.
- Save and Settings are independent sibling buttons, but they are absolutely positioned together at
  the bottom right and use 40px targets. The main Start button reserves a fixed right gutter.
- Learner-facing level strings are unconstrained fixture text: `Foundation–B1`, `A2–B1`, and `B1`.
  Prompt data separately uses internal `foundation` and `intermediate` stages. No approved `B1.1`
  sublevel model exists.
- Practice configuration is remembered in browser local storage. Saved collections, saved prompts,
  and the latest collection-session score are React visit state and disappear on reload.
- Database migrations contain authored lesson serving tables only. No learner session, evaluation,
  collection-progress, or saved-material table exists.

## Catalog organization

The target catalog separates four concepts instead of presenting them as one chip list.

| Concept | Learner job | Target treatment | Availability rule |
|---|---|---|---|
| Catalog view | Browse shared material or return to personal material | Primary `Browse` / `My practice` switch | `My practice` may show only truthful available sections |
| Source | Distinguish AIdioma collections from learner-created collections while browsing | Browse-only `AIdioma` / `Mine` ownership filter group | Hide `Mine` until user-created collections exist |
| Practice state | Narrow by durable relationship to a collection | `Not started`, `In progress`, `Review suggested` | Hide until durable evidence semantics and history exist |
| Content filters | Narrow by what and how I want to practice | Grouped Filter control for level, category, and activity | Show only groups with real choices and reliable metadata |

`Saved`, `Recent`, and `Not started` are not one status set:

- **Saved** is personal organization and belongs in `My practice`.
- **Recent** is a time-based ordering or section, not evidence of progress.
- **Not started** is a progress state and requires successfully loaded durable history.

At the current four-collection size, the default should not show seven always-visible chips. `Browse`
shows all available collections and the result count. `My practice` keeps bookmarked collections and
saved learning material as distinct sections. A compact Filter control appears only when at least one
meaningful group exists; selected values may appear as removable summary chips.

The `Browse` / `My practice` switch uses two ordinary buttons inside a programmatically named group,
with `aria-pressed` conveying the selected view and normal Tab order. It must not claim tab semantics
unless the complete keyboard behavior for tabs is implemented. Browse shows one collection count;
My practice shows separate counts for bookmarked collections and saved learning items rather than a
misleading combined count.

### Filter semantics

- Use OR within one group and AND across different groups.
- `Clear all` restores the unfiltered Browse catalog.
- The live result count updates when filters change.
- The no-match state names the active filters and offers `Clear all`.
- Do not expose an activity when only one honest activity is available.
- Do not use current overlapping fixture facets as the final taxonomy. A future category model must
  distinguish a collection's primary learner intent, such as situation, topic, or language skill,
  from item-level content such as verbs or phrases.

## Collection card contract

The card uses a responsive grid instead of absolute placement and fixed content padding.

| Region | Content and behavior |
|---|---|
| Optional left rail | Reserved for one future durable collection-progress signal; absent until approved data exists |
| Main content | One Start button containing title, description, and learner-facing level |
| Top right | Save collection button |
| Middle right | Settings button opening the current implemented panel as a temporary path pending its separately planned redesign |
| Bottom right of content | Compact level label immediately left of the utility rail |

The title remains the strongest element, description is secondary, and level is tertiary. The card
grows when text wraps. The utility actions never sit inside the Start button, and activating Save or
Settings never starts practice.

Save and Settings form a quiet right-side utility rail with at least 44px targets. Save sits above
Settings. Keyboard order remains Start, Save, Settings even though Save is visually top-right.
Focus indicators must not be clipped by the card or a future progress rail.

The visit-only `% latest` score is removed from catalog cards in the recommended immediate design.
It may remain in the current session or recap where its time horizon is explicit, but it does not
occupy the redesigned card or seed the future progress rail.

The Start button's accessible name remains the action plus collection title, such as
`Start Restaurant Spanish`. Its accessible description references the visible description and any
approved level or future progress text once each. Save and Settings retain their own exact names and
are not repeated in the Start description.

## Learner-facing level language

The visible label describes the collection's approved learner-facing **target level**. It is
stable catalog metadata, not a claim that every prompt has the same CEFR classification. It must not
expose internal stages such as `Foundation` or `Intermediate` and must not be computed from latest
accuracy, prompt difficulty, a fixture string range, or learner performance.

- Show `B1` when B1 is the only approved target metadata.
- Use `B1.1`, `B1.2`, and similar labels only after AIdioma defines a stable typed sublevel taxonomy.
  These would be AIdioma subdivisions anchored to official CEFR B1, not official CEFR levels.
- Give assistive technology an expanded label such as `CEFR level B1`.
- If level metadata is unknown, omit the label rather than guessing.
- If one collection has genuinely different staged editions, each approved edition receives its own
  target-level metadata; the card shows the resolved edition rather than a broad range.

The founder has proposed `B1` as the current visible target instead of `Foundation–B1` or `A2–B1`.
That proposal may authorize `B1` as prototype catalog metadata after approval, but it does not make
an unreviewed collection publishable. `B1.1` or `B1.2` cannot be inferred from current fixtures.

## Durable collection progress and the perimeter rail

There is a roadmap for permanent collection evidence, but no approved formula or implementation:

1. `PRACTICE-SERVING-001` provides stable serving identity and current-visit scheduling behavior.
2. `/plan PROGRESS-SAVED-001` must approve the learner-visible evidence vocabulary, direction and
   scope rules, delayed-evidence horizon, content-version behavior, and the difference between
   progress and review urgency.
3. `/plan PLATFORM-SECURITY-001` must approve authenticated ownership, least-privilege runtime writes,
   environment binding, authorization, timeouts, retention, and deletion boundaries.
4. `EVALUATION-001` and the Practice application service must provide stable idempotent submission
   semantics so retries cannot double-count.
5. `/plan` then `/feat DATA-PERSISTENCE-001` may add the minimum authenticated session, evaluation,
   evidence, and rebuildable rollup storage required by the approved product behavior.

The slim left perimeter rail is an accepted future presentation pattern, but it remains gated on the
dependent progress work. It must represent exactly one durable collection-progress concept, not a
blend of coverage, accuracy, recency, and review urgency. `PROGRESS-SAVED-001` owns its states,
geometry, colors, truthful scale, and scope.

Candidate state vocabulary for `PROGRESS-SAVED-001` review is `Not started`, `In progress`,
`Building confidence`, and `Strong evidence`. `Review suggested` is orthogonal and must not share the
same scale. Practice collection progress never grants Lesson completion or mastery.

The rail belongs on the left because the right edge owns Save, Settings, and level. It is a secondary
cue and must include a non-color equivalent in the card's accessible name or nearby compact status.
Signed-out, unavailable-history, and load-failure states must never silently render as `Not started`.
No rail ships in the immediate catalog slice.

## Saved and personal material boundary

- `My practice` may contain bookmarked collections and saved learning items, but these remain
  separate sections and identities.
- A collection bookmark is not progress and saving does not affect its evidence state.
- A saved learning item should remain a direction-independent reference to a reviewed source
  identity once that source is integrated. Current non-Restaurant prototype references do not gain
  reviewed authority by appearing in Saved.
- Until durable Saved exists, copy must say that material lasts only for the current visit.
- Recent/continue sections appear only after authenticated durable sessions exist.
- Learner-created collections, when real, receive their own section or source filter and must not be
  implied by the word `User`.

## Failure and edge states

- Signed out: do not claim permanent Saved or progress; one page-level explanation may invite sign-in.
- History unavailable: omit durable state or say it is unavailable; never substitute zero progress.
- First run: Browse remains useful without empty analytics or disabled status chips.
- Saved collection but no saved learning items, and the inverse: show independent truthful sections.
- Unknown or unreviewed level: omit the level label.
- Updated, deprecated, or missing collection version: preserve historical evidence under the approved
  version policy and give a useful current-state explanation.
- No matches: name active filters and offer `Clear all`.
- Settings unavailable: omit the action instead of presenting a false choice.

## Deferred Practice-page decisions

This catalog plan does not absorb the bounded active-prompt assistance proof now approved by
`LEXICON-001`; that proof must preserve the default prompt/composer and remains outside the immediate
catalog slice. Expansion to additional prompts or post-feedback help belongs to
`PRACTICE-ASSISTANCE-001`. Visit-only word save and authored verb-form links, the recap's broader
purpose and redesign or removal, a radial session-result treatment, Ask AI versus graded submission,
and the final Settings controls remain unapproved follow-up discussions and must not be absorbed into
the immediate catalog slice.

## Reuse boundaries

- Practice page composition owns catalog views, collection cards, and personal-material sections.
- An answer-free typed catalog summary supplies title, description, target level, category,
  availability, and source identity/version as needed. The page must not import answer authority to
  render collection cards or parse display strings into curriculum meaning.
- Progress supplies a learner-safe collection summary; the card does not derive durable state from
  raw evaluations.
- Saved references point to source identity rather than copying authored content.
- Practice may expose prompt, composer, answer, feedback, recap, and accessibility patterns for
  Lesson reuse only after a canonical Lesson slice proves the same interaction job.
- Keep collection discovery, optional focus, and ongoing-practice semantics specific to Practice.

## Implementation sequence after approval

The immediate catalog slice may use the implemented Restaurant serving authority and current UI
primitives without waiting for all of `PRACTICE-SERVING-001` or `UI-SYSTEM-001` to complete. The
registry dependencies remain because the broader Practice journey and final Settings/pattern work
still depend on them. This exception is limited to card/catalog composition and cannot broaden
serving, certify unreviewed sources, or establish new canonical UI primitives.

### Immediate catalog slice

1. Replace the card's absolute layout with the responsive content/action grid.
2. Put Save at top right, Settings below, and the level at the bottom right of the content region.
3. Replace unconstrained level display strings with typed target-level metadata. If the founder
   approves `B1` for the current prototype cards, encode that value directly; do not infer or add
   decimal sublevels.
4. Replace the mixed chip row with `Browse` and `My practice`, preserving separate visit-only
   bookmarked-collection and saved-material sections and truthful copy.
5. Omit the Filter entry point when no meaningful, executable metadata group exists. Do not add
   durable status filters or the progress rail.
6. Keep any unreviewed legacy collection behind the explicit founder-approved prototype boundary or
   hide/mark it unavailable. Migrating those sources is outside this visual slice.
7. Preserve the current Settings launcher as a temporary implemented path without endorsing the
   panel's information architecture. Its redesign remains `PRACTICE-SETTINGS-001`.
8. Remove `% latest` from the catalog card; do not map it into the future progress rail.

### Dependent progress slice

After `PROGRESS-SAVED-001`, `PLATFORM-SECURITY-001`, and the required persistence contract are
approved and implemented, consume the learner-safe collection summary, add the left discrete rail,
and expose only the approved progress filters and recent ordering.

## Immediate acceptance and proof criteria

- Save is top-right, Settings is below it, and level is bottom-right of the content region on phone,
  desktop, 320px, and 200% text layouts without overlap, clipping, or horizontal page overflow.
- Start, Save, and Settings remain distinct sibling controls with at least 44px utility targets,
  exact accessible names, visible focus, and keyboard order Start, Save, Settings. Save preserves
  `aria-pressed`.
- Closing Settings restores focus to the Settings button that opened it.
- No learner-facing collection label contains `Foundation` or another internal stage. Every displayed
  target level comes from approved typed metadata; unknown values are omitted.
- The Start control is named `Start <collection>` and is described by the visible collection
  description plus approved level text once. Save and Settings have distinct names and Save preserves
  `aria-pressed`.
- The default catalog shows all available collections without the old mixed seven-chip row.
- `My practice` keeps bookmarked collections and saved material separate, and visit-only behavior is
  stated plainly.
- The Filter control is absent when no reliable filter group exists. Recent, Not started, progress,
  review urgency, user-created source filters, and the progress rail are absent.
- Returning from Settings by its close control or Escape restores focus to that card's Settings button.
  Starting from Settings moves focus into the new Practice session's useful first action instead.
- Catalog and Saved card tests cover DOM semantics and axe. Production browser proof covers both
  themes, keyboard focus, reduced motion, 320px, phone, desktop, 200% text, and no overflow.
- Visible collection availability remains aligned with serving authority. Restaurant is described as
  serving-authoritative, not production-ready; production exposure remains gated by
  `EVALUATION-001` and `PLATFORM-SECURITY-001`, and prototype-only cards are never represented as
  shipping-ready.

## Dependent progress/filter acceptance criteria

- Grouped filters have deterministic OR-within/AND-across behavior, live result count, `Clear all`,
  and a useful no-match state.
- Any future rail has a non-color accessible equivalent, adequate theme/forced-color contrast, and
  never says grade or mastery without approved delayed evidence.
- The Start button's accessible description references the visible progress text once; the decorative
  rail itself is hidden from assistive technology.
- Authenticated durable state survives reload and another device; signed-out and load-failure states
  remain distinguishable from `Not started`.
- Duplicate/retried submissions cannot double-count, and same-visit correction cannot alone advance a
  durable confirmation state.

## Founder-approved catalog decisions

1. Use `Browse` / `My practice` as the primary catalog organization.
2. Define the badge as the collection's target level and use `B1` for the current prototype cards.
   Defer `B1.1`/`B1.2` until AIdioma has a real sublevel model.
3. Remove the current content chips now. Introduce grouped filters only when reliable
   category/level/activity metadata makes them useful.
4. Reserve a slim left-side progress rail as a future pattern. Defer its states, geometry, colors,
   and release to `PROGRESS-SAVED-001` and persistence planning.
5. Keep all four cards for prototype review under the explicit prototype boundary. This does not
   confer production readiness; non-Restaurant sources remain unreviewed and unintegrated.
6. Remove the visit-only `% latest` score from catalog cards while retaining truthful
   current-session/recap accuracy.
7. Keep the current Settings launcher temporarily, with its rejected panel explicitly unchanged
   pending `PRACTICE-SETTINGS-001`.

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision | Registry link |
|---|---|---|---|
| PRACTICE-PAGE-D001 | legacy-accepted | Keep Lessons and collections as distinct learner concepts. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D002 | legacy-accepted | Direct start remains the primary collection action. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D003 | implemented | Applying options starts a fresh immutable configuration. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D004 | legacy-accepted | Practice input may support an AI-question interaction distinct from grading. | `EVALUATION-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D005 | accepted | The current rendered Practice Settings design is not the target experience. | `PRACTICE-SETTINGS-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D006 | accepted | Use a responsive card grid with Save above Settings and the level at the bottom-right of the content region. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D007 | accepted | Define level as typed target-level metadata, use `B1` for current prototype cards, and defer AIdioma decimal subdivisions until their meaning exists. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D008 | accepted | Replace the mixed chip row with `Browse` / `My practice` and grouped, capability-gated filters. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D009 | accepted | Reserve a slim left collection-progress rail, with exact states and geometry deferred, and do not ship it before durable evidence and persistence exist. | `PROGRESS-SAVED-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D010 | accepted | Remove visit-only `% latest` from catalog cards; keep transient accuracy in the session/recap. | `PRACTICE-PAGE-001` and `PROGRESS-SAVED-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D011 | accepted | Keep the current Settings launcher as an explicitly temporary path without approving its rejected panel. | `PRACTICE-SETTINGS-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-D012 | accepted | Keep all four cards for prototype review while preserving explicit reviewed-source and production-readiness gates. | `PRACTICE-PAGE-001`, `PRACTICE-SERVING-001`, `EVALUATION-001`, and `PLATFORM-SECURITY-001` in [WORK.yaml](../WORK.yaml) |

### Discovered issues and follow-ups

| ID | Classification | Finding and disposition | Registry link |
|---|---|---|---|
| PRACTICE-PAGE-I001 | owned design gap | The flat chip row mixes personal organization with overlapping content facets. Replace it in the immediate catalog slice. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-I002 | owned data-contract gap | Learner-facing collection levels are unconstrained strings that expose internal or ambiguous ranges. Add typed display metadata in the immediate catalog slice. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-I003 | owned accessibility gap | Catalog utility actions are 40px and the absolute layout lacks catalog-specific 200% text proof. Correct the layout and prove 44px targets in the immediate catalog slice. | `PRACTICE-PAGE-001` in [WORK.yaml](../WORK.yaml) |
| PRACTICE-PAGE-I004 | dependent capability gap | Saved and latest collection score are visit-only; no durable learner tables exist. Keep claims truthful and resolve through progress, platform, evaluation, and persistence work. | `PROGRESS-SAVED-001`, `PLATFORM-SECURITY-001`, `EVALUATION-001`, and `DATA-PERSISTENCE-001` in [WORK.yaml](../WORK.yaml) |

### Canonical work references

- `PRACTICE-PAGE-001` — owns the catalog learner journey and card composition.
- `PRACTICE-SETTINGS-001` — owns the rejected Settings redesign after serving/UI capability review.
- `PROGRESS-SAVED-001` — owns durable evidence vocabulary, Saved ownership, and collection-progress
  semantics.
- `DATA-PERSISTENCE-001` — implements only the learner data approved by feature and platform plans.
- `PRACTICE-SERVING-001` — owns current-visit scheduling and serving identity without mastery claims.
- `UI-SYSTEM-001` — owns reusable tokens/primitives and accessibility evidence standards.
