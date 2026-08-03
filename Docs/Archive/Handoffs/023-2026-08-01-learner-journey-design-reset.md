---
title: Handoff — reset learning design around the learner journey
type: handoff
status: active
updated: 2026-08-01
---

# Handoff — reset learning design around the learner journey

**Role:** Founder-led product-design review
**Next action:** Start a fresh session from this handoff only
**Application source:** `/Users/mike/Documents/Coding/Projects/AIdioma/apps/web`
**Design worktree:** `design/learning-system-proposal` from `50718a9`

## Fresh-session prompt

`Continue AIdioma from Handoff 023. Design from the learner journey first; do not treat V4 or its
panels as an approved product blueprint. Begin with the Restaurant Spanish journey and make one
product decision at a time before deriving data or architecture.`

## Why the design is being reset

The V1–V4 proposal sequence and its review panels tested internal coherence, technical safety,
measurement, content QA, and infrastructure more effectively than they tested the basic learner
experience. Two foundational product mistakes survived repeated review, so V4's product-design
approval and its “stop revising” ruling are withdrawn. V4 remains historical technical-risk input.

Do **not** read the retrospective or V1–V4 before producing the first independent learner-journey
walkthrough. Compare against them only afterward so their framing does not anchor the new design.

## Status ledger

### Confirmed facts

- The learner application is `apps/web`; its code is the UI source of truth.
- Lessons and collections have different product jobs but may practice shared knowledge.
- Current Specs/ADRs remain application authority until explicitly changed through repository process.
- No design proposal or panel changed application behavior, schemas, lessons, P-007, or the roadmap.
- Generated learner-visible content still requires strong independent review and source/rights care.

### Provisional founder agreements to test in the journey

1. A **study session** is the learner's continuous practice visit. Small planning blocks are internal;
   they do not impose a learner-visible stop or cap.
2. A **topical collection** may span levels, vocabulary breadth, and multiple tenses. Each served
   planning block has an explicit, frozen, learner-appropriate scope; do not duplicate a collection
   merely to separate tenses.
3. Agree the learner experience first, then derive content contracts, observations, profile state,
   database shape, and implementation slices.

### Withdrawn conclusions

- V4 is not an approved product-design blueprint.
- The V4 panel's unanimous “stop architecture revisions” conclusion is withdrawn.
- A 5/10/15-item choice does not define a study session.
- Separate tense-bounded collections are not the default solution to safe grammatical progression.
- Multi-agent agreement on a shared framing is not independent validation of that framing.
- The earlier screenshot-based settings audit is void; the later `apps/web` code audit is evidence
  about implemented/prototype controls only, not proof those controls belong in the product.

### Open product questions

- What is the learner's end-to-end lesson journey, and what completes a lesson?
- How do topical collections broaden with level while keeping the current scope understandable?
- What are Saved, user-created collections, and generated collections from the learner's perspective?
- When does a study session start, pause, resume, recap, and end?
- What counts as evaluation evidence, and what should mastery/confirmation mean to the learner?
- Which decisions are automatic, which are explained, and which are genuine learner controls?
- How should unlimited practice behave when reviewed novelty is temporarily exhausted?

## Review method

Use one concrete journey: a learner encounters **Restaurant Spanish** as a beginner, practices for as
long as desired, returns after gaining skill, and later practices past and broader language within
the same topical collection.

For each decision, state in plain language:

1. what the learner is trying to accomplish;
2. what the learner sees and does;
3. what AIdioma decides automatically;
4. what the learner may control;
5. what must be recorded; and
6. how the decision affects lessons, collections, evaluation, and the knowledge profile.

Review in five chunks:

1. lessons and curriculum progression;
2. collections, Saved, and user-created organization;
3. continuous study sessions and internal planning;
4. evaluation, knowledge profile, and mastery; and
5. recommendations, learner controls, and unlimited practice.

Do not introduce schemas, table names, provider choices, Workflow, generation architecture, KPIs,
or another review panel until the relevant learner behavior has been agreed. Ask for founder agreement
one decision at a time. After the journey is coherent, reverse-engineer the minimum data and build one
Restaurant vertical slice before another adversarial technical review.

## Deferred reading

- Process retrospective: `Docs/Prototypes/adaptive-learning-system-design-review-retrospective.md`
- Historical proposal: `Docs/Prototypes/adaptive-learning-system-proposal-v4.md`
- Historical stopping review: `Docs/Prototypes/adaptive-learning-system-panel-review-v4.md`

## Workspace and verification

- This reset changed documentation only; no application, schema, roadmap, lesson, or authority file
  was implemented.
- `git diff --check` passed for the worktree.
- A pre-existing modification to `Docs/Prototypes/adaptive-learning-system-proposal.md` was present
  before this reset and was deliberately left untouched; do not fold it into reset work by accident.
- Reset-owned files are this handoff, the retrospective, and the status notices in V4 and its V4
  panel review.
