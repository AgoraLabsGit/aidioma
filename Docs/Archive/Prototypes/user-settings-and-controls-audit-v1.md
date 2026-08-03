---
title: User settings and learning controls — UI/design audit V1
type: design-audit
status: review-candidate
updated: 2026-07-31
related-design: adaptive-learning-system-proposal-v4.md
---

# User settings and learning controls — UI/design audit V1

> **Read-only audit.** This document does not change current Specs, ADRs, UI, persistence, lessons,
> or V4. It inventories the rendered application and distinguishes actual preferences from session
> choices, adaptive policy, capability constraints, organization, and account/data actions.

## 1. Scope and evidence

The audit inspected the rendered Next.js application at phone and desktop widths, including:

- Settings page;
- Practice catalog, filters, Saved affordances, and direct start;
- Essential Verbs options, including disabled combinations;
- Everyday Phrases options;
- lesson preview controls;
- the current persistence behavior of preview controls.

It cross-checked the rendered UI against:

- `Docs/Specs/Features/module-spec.md`;
- `Docs/Specs/Features/practice-sets.md`;
- `Docs/Specs/Areas/session-engine.md`;
- ADR-0005, ADR-0010, and ADR-0015;
- `apps/web/src/components/settings-panel.tsx`;
- `apps/web/src/components/practice-set-options-panel.tsx`;
- `apps/web/src/components/practice-workspace.tsx`;
- Adaptive learning proposal V4.

No sign-in, destructive action, data submission, or application change was performed. The interactive
fixture states explicitly create no real session, evaluation, proficiency, or lesson-progress data.

## 2. Executive finding

The current UI exposes useful controls, but the word **settings** hides five different concepts:

1. **Global preference** — durable display/habit preference such as theme or daily goal.
2. **Session request** — the learner's requested scope such as activity, direction, and block size.
3. **Engine policy** — item selection, due/new priority, difficulty/support, and ordering.
4. **Content capability/filter** — tense, person, and drill choices only valid for some reviewed pools.
5. **Account/data action** — sign in, reset, export, or deletion; not a learning preference.

These require different storage, authority, UX, and evidence rules. AIdioma should not create one
large user-preferences object or allow a convenience setting to silently redefine curriculum proof,
accepted answers, target identity, or mastery.

## 3. Rendered Settings page

| Visible control | Current rendered behavior | Current authority/status | V4 implication | Audit ruling |
|---|---|---|---|---|
| Daily Practice Goal | Slider: 5–150, step 5, default 50; displays exercises; resets to 50 after leaving the page | One slider is settled; preview persistence not implemented | Habit/agency diagnostic only; never learning ground truth or adaptive difficulty | Retain concept; decide unit/default/range and persist only after the user-preference authority exists |
| Theme | Auto / Light / Dark; device-local value persists | Settled and accessibility-governed | Pure presentation preference; no learning authority | Retain exactly |
| Learner profile | Sign in / Start learning actions while signed out | Authentication/navigation, not a preference | Account identity owns cross-device preferences and data actions | Keep appropriate account actions, but do not count them as settings |
| Reset learning data | Visible but disabled | Destructive behavior not implemented | Must resolve observation/progress/content/private-artifact deletion and rollback semantics | Do not enable until scope, authentication, confirmation, retention, and recovery are explicit; consider hiding until functional |
| Reminders | Not present | Explicitly excluded from MVP by ADR-0010 | V4 rejects engagement as learning success | Do not add at MVP; later opt-in only after evidence and a separate notification/privacy decision |

### Daily-goal concern

Exercise count can motivate a habit, but it can also reward shallow volume and conflict with V4's
learning-validity hierarchy. The goal may influence progress presentation, never target confirmation,
item difficulty, lesson completion, or efficacy KPIs. Before persistence, decide:

- exercises, completed blocks, or active study time;
- what counts when a learner reveals, retries, or abandons;
- whether the default 50 and range 5–150 are realistic;
- local versus account-synced storage;
- timezone/day-boundary behavior;
- whether the UI celebrates the threshold without pressuring the learner to continue.

This is a product packet, not a V5 architecture issue.

## 4. Rendered Practice options

### Common collection controls

| Control | Rendered choices/default | Design analysis | Audit ruling |
|---|---|---|---|
| Activity | Type / Flashcards; unavailable activities are explained | Correct capability-driven pattern; specialized activity results remain distinct | Retain. Never show a selectable activity without reviewed required assets |
| Direction | EN→ES / ES→EN / Both; Both default | Current authority retains direction. V4 later needs an optional override around a due/weak policy | Retain for MVP. If an adaptive default ships later, label it Recommended/Adaptive; never silently reinterpret Both |
| Session size | 5 / 10 / 15; 10 default; choices disable when the pool is too small | V4 validation needs one Standard block, then Short/Standard; Keep practicing removes the need for a long block | Use 10 in Steps 0–3. Retain 5/10 for later learner control; defer 15 until fatigue, completion, and pool evidence justify it |
| Difficulty | Guided / Standard / Challenge; Standard default | The prototype changes the label/summary, not an executable support or item policy. V4 separates content complexity, authored challenge, and empirical difficulty | Remove or keep prototype-only until semantics are executable. Later expose support/challenge within the visible promise, not a vague global difficulty knob |
| Shuffle | Boolean, on by default | The engine already owns interleaving/order and V4 persists the exact resolved plan. Turning shuffle off may reduce evidence quality | Remove from the learner surface initially; keep ordering as a versioned engine policy |

### Verb-only controls

| Control | Rendered choices | Design analysis | Audit ruling |
|---|---|---|---|
| Tense / form | All, Present, Preterite, Imperative | Useful focused scope only when the visible collection promise and reviewed pool support it | Retain only for capability-declared reviewed targets; do not use it to introduce grammar outside the promise/level |
| Person | All, I, you, he/she, we, they | Useful but capacity-sensitive; current 10-item default disables narrow persons | Retain as an advanced focus filter after usability testing; disabled reasons must be visible on touch/keyboard, not only in a `title` tooltip |
| Drill type | Meaning, Recognize form, Produce form, Mixed context | Overlaps direction: form recognition requires ES→EN and production requires EN→ES | Simplify. Prefer a single learning-goal choice that derives direction, or hide irrelevant direction choices after a form drill is chosen |

The rendered invalid-combination behavior is conceptually correct: a 10-item pool may disable narrow
person/tense choices; imperative + first-person singular remains unavailable; recognition/production
drills disable under incompatible directions. The UI should explain these dependencies inline and
avoid forcing users to solve a configuration puzzle.

### Collection-specific capability disclosure

Essential Verbs explains that Quiz needs reviewed distractors and Sentences need reviewed contexts.
Everyday Phrases explains that Conversation needs a reviewed branching scenario. This is honest and
aligned with V4. An unavailable capability may be disclosed as future context, but it must not look
like a broken selectable setting or simulate unsupported content.

### Session snapshot rule

Current authority correctly says configuration is snapshotted at session start. Reconfigure starts a
new session; it does not mutate scoring scope, direction, or item eligibility mid-session. Retain this
invariant and show the consequence before the new session starts.

## 5. Related controls that are not settings

| Control | Correct classification | Audit ruling |
|---|---|---|
| Catalog All/Saved/facet filters | discovery/query state | Retain; no learning authority |
| Save collection/item | learner-owned reference/organization | Retain; production persistence belongs to Saved authority, not session configuration |
| Start practice | action using remembered/default configuration | Retain direct start; Options must not become a required interstitial |
| Reconfigure | creates a new configuration snapshot/session | Retain with explicit new-session language |
| Hint / Reveal / Ask tutor | per-item support action | Retain mode-smart support; record support fact without making it a global strictness setting |
| Keep practicing | starts another bounded session | Add with V4's honest in-promise/exhaustion rules; not a session-size setting |
| Too easy / Too hard | learner feedback/override | Defer until one adaptive rule is validated; it must not silently change the target or grammar promise |
| Why this recommendation? | transparency action | Add when recommendations become real; show reason without exposing grading secrets |

## 6. Recommended minimum control surface

### Steps 0–3 validation

No new learner-facing settings are needed. Use:

- one Standard 10-item block;
- fixed reviewed activity/direction eligibility;
- one collection fixture;
- shadow-only profile state;
- no new difficulty, recommendation, or personalization UI.

### MVP learning surface after the core proof

Retain:

- Type / Flashcards when supported;
- EN→ES / ES→EN / Both, default Both under current authority;
- Short 5 / Standard 10;
- capability-declared grammatical focus where it is genuinely useful;
- Save, direct start, and Options;
- configuration snapshot and explicit new-session reconfigure.

Engine-owned rather than user-configured:

- due/new/miss priority;
- item ordering and interleaving;
- exact difficulty/support interpretation;
- candidate eligibility and pool capacity;
- confirmation/proof rules;
- evaluator tolerances and accepted answers.

### Small additions with strong design value

1. **Flashcard self-report after reveal:** Missed / Recalled. It changes item scheduling only; it
   cannot confirm a target, complete a lesson, or award curriculum credit.
2. **Keep practicing:** another bounded in-promise block with honest fallback/exhaustion behavior.
3. **Recommendation reason:** plain-language “why this” when real recommendation serving begins.
4. **Explicit support choice:** hints/reveal per item rather than a global easy/strict mode.

### Defer until the owning feature exists

- personalized-practice on/off or an Adaptive/Recommended direction;
- regional Spanish teaching preference;
- voice, playback speed, voice/register, microphone, captions, and correction mode;
- accessibility overrides already governed safely by browser/OS unless a measured app gap exists;
- reminder notifications;
- named user-created collection defaults;
- global correction strictness;
- content-generation preferences;
- Reinforce/Balanced/Expand and learned recommendation controls.

Regional forms should be accepted according to the binding evaluation/dialect policy even before a
regional teaching preference exists. A preference must not be offered until content, labels,
accepted-answer coverage, and reviewers can honor it consistently.

## 7. Proposed storage and authority boundaries

| Category | Example | Storage owner | May affect learning evidence? |
|---|---|---|---|
| Device presentation | theme | device local storage | No |
| Account preference | daily goal, later teaching variety | authenticated user preference with version | No direct evidence effect |
| Remembered session request | collection activity/direction/size/focus | per user + collection, capability/version validated | Only through the resulting snapshotted session, never retroactively |
| Session snapshot | resolved scope/items/direction/purpose | canonical practice session | Yes; exact observation context |
| Per-item support/action | hint, reveal, flashcard self-report | observation/event | Result-specific authority only |
| Adaptive engine policy | due/weak ranking, item order | versioned policy + resolved plan | Determines exposure; cannot redefine evaluator/proof authority |
| Saved organization | source item/collection reference | learner-owned durable reference | Scheduling boost only unless a separate proof policy says otherwise |
| Account/data action | reset/export/delete | authenticated governed workflow/audit | May invalidate/delete/rebuild state under explicit policy |

Avoid one nullable `user_settings` JSON blob with hidden semantics. Stable global preferences may use
a small typed user-preference record; remembered collection requests and canonical session snapshots
remain separate because their versioning, validation, and audit jobs differ.

## 8. Open founder decisions

1. Should Daily Practice Goal count exercises, blocks, or active minutes, and is 50 the right default?
2. Should the first real session-size surface be 5/10 only, or does 15 have observed value?
3. Remove Difficulty until executable, or redefine it as visible support/challenge behavior?
4. Merge verb Direction + Drill type into one simpler learning-goal control?
5. Which tense/person filters are truly MVP, level-safe, and worth the configuration cost?
6. Which preferences are device-local versus account-synced?
7. Should Reset mean reset progress, delete learning history, delete private content, or delete the
   account—and should Export precede it?
8. When can a regional Spanish teaching preference be honored end to end?
9. If adaptation later ships, should the user receive a global opt-out, session override, or both?
10. When should unavailable future activities be shown versus hidden?

## 9. Design-process ruling

This audit does not reopen V5. It should feed:

- Gate 0-C: executable activity/evidence and grammatical-filter semantics;
- Gate 0-A: preference/session/observation storage and reset/deletion authority;
- the MVP product packet: minimum control surface, Daily Goal, and Save/Options behavior;
- Pilot B: the first adaptive override and recommendation explanation;
- later voice/dialect/content-generation packets for their own settings.

The next review should walk through these controls one decision at a time with the founder, beginning
with the taxonomy and the five highest-impact choices: Daily Goal, session size, difficulty, verb
Direction + Drill, and reset/data semantics.
