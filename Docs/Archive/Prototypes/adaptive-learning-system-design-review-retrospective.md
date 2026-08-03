---
title: Adaptive learning system — design-review retrospective
type: design-retrospective
status: closed
updated: 2026-08-01
---

# Adaptive learning system — design-review retrospective

> **Deferred reading for the learner-journey reset.** Do not give this document to a fresh reviewer
> until that reviewer has independently walked through the first concrete learner journey. This is a
> process record, not a replacement product design.

Reset handoff: [Handoff 023](../Handoffs/023-2026-08-01-learner-journey-design-reset.md)

## Conclusion

The V1–V4 reviews produced useful technical guardrails but insufficient product validation. Reviewers
tested whether a document was coherent inside its own frame more rigorously than whether the frame
described the right learner experience. The resulting consensus was assigned too much authority.

## What the reviews usefully surfaced

- lessons and collections need distinct progression semantics;
- shared knowledge identity can connect practice across content containers;
- recognition and production evidence should remain separate;
- observations and derived state need correction, invalidation, replay, and versioning;
- learner-visible generated content needs independent model review plus qualified human review;
- source authority, licensing, dialect, privacy, and accepted answers are real publication concerns;
- Workflow, generation, ML ranking, universal storage, and ontology infrastructure should be deferred;
- current completion, self-report, same-session retries, and engagement are not durable learning proof.

These remain candidates to re-evaluate after the learner journey; none is adopted merely because a
panel retained it.

## Failures found

1. **Document-first framing.** The process began with system nouns and contracts instead of learner
   goals, journeys, and concrete moments of use.
2. **Session/block conflation.** A small planner batch was treated as the learner's study session,
   producing artificial 5/10/15-item endings despite the no-cap goal.
3. **Collection/scope conflation.** The grammatical scope of one practice block was made part of
   collection identity, encouraging duplicate topical collections by tense.
4. **Inherited-premise consensus.** Reviewers received the same proposal, vocabulary, and assumptions;
   agreement therefore did not establish independent product validity.
5. **Simplification inside the wrong frame.** MCOO review reduced sizes and surfaces but did not ask
   whether the underlying concepts were correct; its single Standard block reinforced the session bug.
6. **Insufficient scenario gates.** The review never required ordinary stories such as forty-five
   minutes of continuous practice or revisiting Restaurant Spanish after progressing from A1 to A2.
7. **Prototype leakage.** Existing UI controls were sometimes treated as requirements even when they
   were explicitly fixture-only, did not affect selection, or had no persistence.
8. **Architecture before experience.** Event authority, planner contracts, measurement, and runtime
   received detailed treatment before the end-to-end learning interaction was understandable.
9. **Overstated stopping authority.** “Panel approved” and “stop revising” implied product confidence
   that the evidence did not support.

## Root causes

- Reviewer mandates emphasized coherence, safety, feasibility, optimization, and omissions more than
  alternative product models.
- The same source document anchored every reviewer; different specialties did not create different
  first principles.
- Abstract terms such as session, collection, target, confirmation, and mastery were not grounded in
  a single persistent learner story.
- Review output was consolidated into increasingly comprehensive proposals, making completeness look
  like correctness and increasing founder cognitive load.
- There was no mandatory founder checkpoint after each learner-facing product decision.

## Process corrections

1. Begin with one concrete learner journey and plain-language vocabulary.
2. Record each decision as learner goal, visible behavior, automatic behavior, control, required fact,
   and consequence.
3. Mark every statement Confirmed, Provisional, Open, Withdrawn, or Technical Constraint.
4. Derive data and architecture only after the relevant behavior is agreed.
5. Require scenario tests that cross time, level, session length, weak/strong knowledge, content
   exhaustion, correction, and learner overrides.
6. Give later adversarial reviewers the agreed journey and ask them to propose competing simpler
   models, not merely audit one inherited design.
7. Keep product, learning-science, data, and infrastructure approvals separate.
8. Treat multi-agent consensus as evidence about reviewed criteria, never as founder product approval.
9. Build one thin interactive vertical slice before expanding the blueprint or convening another panel.

## Artifact disposition

- V1–V4 and their panel reports remain historical research and technical-risk records.
- V4's product-design approval and stopping ruling are withdrawn as of 2026-08-01.
- Current Specs/ADRs remain binding until explicit replacement decisions are approved.
- The screenshot-based settings audit is invalid evidence. The later code audit describes only the
  controls currently present in `apps/web` and their persistence, not their product desirability.
- The next design authority, if adopted, must emerge from the founder-approved learner journey and
  then follow the repository's normal authority-changing process.

## Success condition for the reset

Before schema or implementation planning, the founder can explain—in simple terms—how one learner
moves through a lesson, practices one topic continuously, returns at a higher level, receives suitable
material, understands why it was selected, and stops or continues without artificial product limits.
