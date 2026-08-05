---
id: LESSONS-001
title: Lessons and curriculum progression
area: lessons
status: draft
implementation: partial
founder_review: required
updated: 2026-08-03
---

# Lessons and curriculum progression

This migration dossier preserves the finite-lesson model, content evidence, and unresolved
progression decisions. It is a founder-approved temporary exception to normal spec creation timing,
remains `status: draft`, and does not approve the intermediate fixture as launch curriculum.
`legacy-accepted` preserves a prior decision pending migration disposition; `accepted` is reserved
for current founder approval.

## Outcome

Teach one bounded, useful capability through a clear progression from explanation to guided and less-
supported use, then mark the teaching arc honestly and help the learner reuse it in later practice.

## Non-goals

- Treating a collection as a lesson or collection practice as automatic lesson completion.
- Requiring every lesson to contain every possible activity or modality.
- Calling same-day fluency durable mastery without an approved evidence policy.
- Shipping the intermediate prototype or operator-generated prompts as canonical curriculum.
- Reopening a CMS, runtime sentence generation, or copied third-party content pipeline.

## Claim status

### Implemented

- `/lessons` renders a hard-coded twelve-row A1 catalog plus five intermediate prototype promises.
  The catalog does not load the five canonical lesson JSON files.
- `/lessons/1` is a hard-coded preview that reveals one model answer after any non-empty submission;
  it is not a canonical lesson runner or evaluator integration.
- `Tell what happened` has a three-step finite arc: explanation/support, typed application, feedback,
  and an explicit completion screen.
- The intermediate pilot alone compares answers locally against prototype accepted variants.
- Current completion, progress, and capability evidence are not persisted.

### Legacy-accepted in earlier records, pending migration disposition

- A lesson makes a finite teaching promise; Practice collections make an ongoing practice promise.
- Teach before expecting performance and move from explanation toward meaningful use.
- Lessons and Practice should reuse prompt, answer, evaluation, feedback, and support patterns.
- Launch authoring guidance aims for 12–15 new vocabulary items and 18–20 practice sentences.
- Content identity is immutable/versioned; authored material passes deterministic and human review gates.
- Canonical content is repository-validated data; the database is a serving copy rather than authoring authority.
- Launch is A1-first with twelve A1 lessons after content and application gates pass; A2/B1 authoring
  follows proof of that loop.
- Reference cards are an optional MVP study capability surfaced outside the graded lesson Mix arc.

### Candidate

- Complete unlocks the next lesson the same day; Mastered requires approved later-day evidence.
- A lesson owns a reviewed teaching arc; its exact required explanation, example, guided-practice,
  and checkpoint components require planning rather than inheritance from a historical Mix recipe.
- Collections may offer a relevant lesson when unfamiliar language appears without ejecting the learner's visit.
- Shared capability identity may connect Lesson and Practice evidence without merging their containers.

### Research

- Leaner new-material load with more retrieval opportunities is preferable to vocabulary dumps.
- Same-day success can be an illusion of fluency; delayed varied retrieval is stronger retention evidence.
- Reference cards can provide non-graded support outside the graded practice arc.
- One shared grammar/error taxonomy can connect authored goals and evaluation findings without defining mastery.

### Conflicting or unresolved

- ADRs accept Completed/Mastered, but the later learner-journey reset reopened their learner meaning.
- The legacy-accepted A1-first launch strategy coexists with an intermediate design pilot; the latter is not launch scope.
- The current intermediate prototype always exposes a model answer and has simpler feedback than Practice.
- P-007 exposed a conflict between conceptual vocabulary load and raw schema rows for number-heavy lessons.
- Historical Mix recipes prescribe fixed activity sequences that have not received the new founder review.
- The static A1 catalog, hard-coded Lesson 1 preview, canonical JSON, database serving copy, and
  production lesson evaluator are separate executable paths rather than one implemented learner journey.

## Lesson promise and anatomy

A planned lesson should define:

- one learner-facing outcome and a bounded set of capabilities;
- prerequisites and what the lesson assumes versus teaches;
- concise instruction, examples, contrasts, and appropriate support;
- a deliberate progression from guided recognition toward less-supported use;
- explicit completion conditions and what completion does and does not mean;
- durable source IDs, accepted answers, tags, provenance, and content version;
- a return path to Practice or review without conflating container progress.

The exact required components remain a founder decision; placeholders are not acceptable.

## Content boundary

- Author and review learner-visible scored prompts before they become canonical.
- Use typed schema validation, stable IDs, deprecation rather than destructive identity changes, and provenance.
- Keep canonical lesson JSON in the repository and seed a versioned serving copy idempotently.
- Treat external sources according to license and attribution policy; do not ingest copyrighted syllabus text.
- Distinguish prototype, draft, founder-reviewed, native-reviewed, and launch-ready content states.

## Reuse boundaries

- Lessons may reuse source-neutral evaluation, feedback, prompt, composer, and accessibility patterns
  after a canonical Lesson slice becomes the real second consumer.
- Lessons own teaching sequence, prerequisites, completion, and curriculum progression.
- Practice owns collection discovery, continuous optional drilling, and collection-specific scope.
- Do not require Lessons to reuse Practice selection/interleaving policy; extract only a proven shared
  primitive after both consumers demonstrate the same job.
- A shared capability/evidence layer, if approved, must not let optional collection work bypass lesson proof.

## Migrated evidence

| Evidence | Use in this draft |
|---|---|
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Features/core-product-criteria.md` | Teach-first and reusable-interaction principles |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Prototypes/intermediate-learning-pilot.md` | Current finite-lesson prototype and boundaries |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0003-lesson-load-lean-vocab-more-practice.md` | Legacy-accepted authoring load |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0004-completed-vs-mastered.md` | Prior completion/mastery decision, pending disposition |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0008-a1-first-then-expand.md` | Legacy-accepted A1-first launch scope |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0012-reference-cards-mvp.md` | Legacy-accepted reference-card scope |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Design/MVP-DESIGN-2026-07/LESSON-INFRASTRUCTURE.md` | Content pipeline and source research |
| `apps/web/src/components/intermediate-lesson-pilot.tsx` | Implemented three-step prototype |

## Draft acceptance criteria

- Founder approves the learner-visible lesson journey from entry through completion and return.
- Each lesson states what it teaches, assumes, practices, and proves without hidden requirements.
- Completion and any later mastery state use approved terminology and executable evidence rules.
- Prototype, draft, reviewed, and launch-ready content cannot be mistaken for each other.
- Lesson UI reuses approved interaction components while preserving teaching-specific sequence.
- Tests cover correct, imperfect, ungraded, support, exit, restart, completion, and locked/unlocked states.
- Content validation proves schema, IDs, references, accepted answers, provenance, and review status.

## Open questions

1. What exact teaching arc and activity set completes the first canonical lesson?
2. Retain, revise, or remove Completed/Mastered terminology and the later-day rule?
3. What evidence unlocks the next lesson without making progression feel blocked?
4. Retain reference cards as an optional MVP study surface outside the graded lesson arc?
5. How should a collection link to a relevant lesson without interrupting continuous practice?
6. How should conceptual vocabulary load differ from raw schema representation?
7. Does the intermediate pilot inform post-A1 design only, or also the canonical component model?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision | Migration disposition |
|---|---|---|---|
| LESSONS-D001 | legacy-accepted | Lessons retain a finite teaching promise distinct from collections. | pending founder disposition |
| LESSONS-D002 | implemented | Canonical content is reviewed repository data with a database serving copy. | retain current truth |
| LESSONS-D003 | legacy-accepted | Launch is A1-first with twelve gated A1 lessons. | pending founder disposition |
| LESSONS-D004 | legacy-accepted | Reference cards are optional MVP study material outside the graded Mix. | pending founder disposition |
| LESSONS-D005 | legacy-accepted | Reassess Completed/Mastered before treating the prior ADR as current truth. | reopened pending founder disposition |

### Canonical work references

- `LESSONS-001` — plan the canonical Lesson learner journey and progression semantics.
- `LESSON-REVIEW-SURFACE-001` — connect canonical content, evaluation, feedback, and review evidence in the learner surface.
- `SCHEMA-P007-001` — decide conceptual-load versus raw-row modeling.
- `EVALUATION-001` and `UI-SYSTEM-001` — prove reusable contracts/patterns before Lesson adoption.
