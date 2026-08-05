---
id: PROGRESS-SAVED-001
title: Progress, learner evidence, and saved material
area: progress
status: draft
implementation: partial
founder_review: required
updated: 2026-08-03
---

# Progress, learner evidence, and saved material

This migration dossier separates immediate session feedback, durable learning claims, curriculum
state, and learner organization. It is a founder-approved temporary exception to normal spec
creation timing, remains `status: draft`, and does not authorize a mastery formula or persistence
schema. `legacy-accepted` preserves a prior decision pending migration disposition; `accepted` is
reserved for current founder approval.

## Outcome

Help learners understand what they did, what is worth returning to, and what is genuinely established
without fabricating proficiency, while letting them keep useful reviewed material under clear ownership.

## Non-goals

- Fabricating first-run analytics, mastery, recommendation confidence, or lifetime grades.
- Treating a visit-local score or saved array as durable learner history.
- Letting Practice collection evidence silently complete or master a lesson.
- Shipping XP, badges, leaderboards, hearts, punitive streak mechanics, or hint-dependency grades.
- Choosing a full knowledge-profile ontology before the learner-facing evidence model is approved.

## Claim status

### Implemented

- Home displays truthful zero states for streak, completed work, and review due.
- Active Practice shows visit-local completed-card count and correctness rate.
- Ending Practice shows a recap derived from the current turns.
- The catalog may show a visit-local latest correctness rate.
- Saved separates visit-only collection bookmarks from direction-independent saved prompt references.
- Saved prompt references can form their own visit-only both-direction practice queue.

### Legacy-accepted in earlier records, pending migration disposition

- Immediate accuracy and durable proficiency are different numbers and must never be merged.
- Longer-term progress must derive from real sessions/evaluations, not fabricated or temporary state.
- Collection progress remains separate from lesson completion/mastery.
- Same-day lesson completion may unlock progression; a prior ADR requires later-day confirmation for Mastered.
- A calendar-day streak counts completed sessions, with no reminder notifications at MVP.
- Learners should be able to save useful words and phrases; personal material differs from shared content.

### Candidate

- Persist one authoritative learner interaction history from which summaries and derived state can rebuild.
- Represent a word/phrase observation only with an exact semantic target, contextual occurrence and
  source versions, requested skill, direction/modality, assistance facts, target-specific evaluation
  finding, time, and session. Overall prompt verdicts never fan out across mapped words.
- Let collection evidence inform review scheduling while withholding lesson-progression credit.
- Start durable Saved as source references rather than content copies; add naming/organization only if needed.
- Explain recommendation reasons from approved evidence without exposing grading secrets.
- Define study-visit completion separately from internal serving-batch completion.

### Research

- Same-session requeued success, self-report, hints, completion, streak, and engagement are useful facts
  but are not durable learning ground truth.
- Delayed, varied, unassisted retrieval is stronger confirmation evidence than immediate correction.
- Recognition and production evidence should remain distinguishable.
- Derived learning state needs correction, invalidation, replay, and policy/content versioning.

### Conflicting or unresolved

- Progress/proficiency specs describe persistent session and learner tables that are not implemented.
- ADR-0013 says every started engine run is a session; the later learner journey distinguishes continuous
  study visits from internal batches, so completion/streak authority must be redefined.
- Completed/Mastered was legacy-accepted but explicitly reopened by the learner-journey reset.
- Current `Latest` and Saved states disappear on reload and cannot support durable claims.

## Evidence boundaries

Keep these concepts separate:

| Concept | Intended job | Current authority |
|---|---|---|
| Attempt verdict | Explain one evaluated response | Implemented |
| Visit accuracy/count | Summarize current Practice turns | Implemented, transient |
| Lesson Completed | Curriculum progression | Legacy-accepted decision; disposition required |
| Mastered/Confirmed | Durable learning claim | Unimplemented; review required |
| Collection coverage/performance | Describe work in one reviewed set/version | Unimplemented |
| Review due/weak | Schedule useful retrieval | Candidate serving state |
| Streak | Habit summary from completed study visits | Legacy-accepted decision; lifecycle unresolved |

No derived state should become more authoritative than its source observations and approved policy.

## Saved-material boundary

- A saved prompt is a learner-owned reference to immutable source type and source ID.
- A saved word or phrase is a learner-owned lexical target reference plus the exact contextual-map,
  source, surface, direction, and version snapshot that made it useful. It is not reducible to an
  isolated spelling or to the source prompt alone.
- Saving does not copy content, change content ownership, or alter source progress identity.
- Direction is presentation/evidence context, not a second saved item identity.
- Collection bookmarks and saved learning items are distinct jobs even if one page contains both.
- Durable save/remove must be authenticated, owner-checked, version-aware, and reversible.
- User-created or generated collections remain separate future capabilities, not implied by Saved.

## Reuse boundaries

- Practice and Lessons produce typed observations through shared evaluation contracts.
- `LEXICON-001` supplies reviewed semantic and occurrence identity only; it does not own learner
  observations, weights, states, or review urgency.
- Progress reads persisted observations and approved derived state; it does not regrade answers.
- Serving reads scheduling facts but cannot redefine completion or mastery.
- Saved references are reusable across Practice, Lessons, and future reviewed sources.
- Page components consume learner-safe summaries, not raw evaluator/provider metadata.

## Migrated evidence

| Evidence | Use in this draft |
|---|---|
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Features/core-product-criteria.md` | Honest progress and saved-material principles |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Features/progress.md` | Prior presentation scope and explicit gamification cuts |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Areas/proficiency.md` | Accuracy/proficiency separation and prior formula research |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0004-completed-vs-mastered.md` | Prior spacing decision, pending founder disposition |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0010-streak-no-notifications.md` | Prior habit decision, lifecycle unresolved |
| `apps/web/src/components/practice-workspace.tsx` | Current transient summaries and Saved behavior |

## Draft acceptance criteria

- Every learner-visible number names its source, scope, horizon, and persistence status.
- Reloading or changing devices cannot silently turn transient data into apparent durable history.
- Completion, mastery/confirmation, collection progress, review state, and streak have separate rules.
- Corrected or invalidated observations rebuild affected derived state deterministically.
- Saved identity remains stable across direction and content presentation while preserving source ownership.
- Empty, first-run, offline/unavailable, deleted-source, version-changed, and account-deletion states are specified.
- No optional Practice work bypasses approved Lesson progression.

## Open questions

1. Which progress concepts should learners see in the first durable release?
2. Retain Completed/Mastered, rename them, or use a different evidence story?
3. What counts as a completed continuous study visit for streak purposes?
4. Can collection evidence affect shared review scheduling without granting lesson credit?
5. What delayed evidence and horizon justify a durable learning claim?
6. Is Saved initially one automatic list, or may learners name and organize personal lists?
7. How should deleted/deprecated source content affect saved references and historical evidence?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision | Migration disposition |
|---|---|---|---|
| PROGRESS-SAVED-D001 | legacy-accepted | Keep immediate accuracy separate from durable proficiency. | pending founder disposition |
| PROGRESS-SAVED-D002 | candidate | Durable Saved stores source references, not copied content. | pending founder disposition |
| PROGRESS-SAVED-D003 | legacy-accepted | Revisit completion/mastery/streak lifecycle after continuous-session approval. | reopened pending disposition |

### Canonical work references

- `PROGRESS-SAVED-001` — own learner-visible evidence, completion, streak, and durable Saved semantics.
- `DATA-PERSISTENCE-001` — implement only the observations and state approved by that product work.
- `PRACTICE-SERVING-001` — define internal batch facts without redefining durable progress authority.
