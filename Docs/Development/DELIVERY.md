# Delivering learner journeys

This is AIdioma's development contract. It exists to make learner progress visible while keeping
the codebase coherent. `Docs/PRODUCT.md`, decisions, and feature specs still own product behavior;
this file owns how one piece of that behavior moves from intent to verified implementation.

## The unit of delivery

Every active phase or task names one primary learner journey in this form:

> Given a named starting state, the learner performs a named action, receives a named result, and
> can recover from the most important expected failure.

A delivery unit must include the product layers that journey actually crosses: promoted content,
learner interface, server behavior, durable state, and real providers when the journey writes,
resumes, or grades. A component, schema, service, page, or validator is not a completed feature by
itself.

Split the work before implementation when it contains more than one primary journey, asks the
coding session to settle unrelated product choices, introduces unrelated durable-state models, or
claims reuse that has not been demonstrated by a second current consumer.

## Ready before code

The target is `ready` only when all of the following are written in its phase or target authority:

1. one learner journey and one observable ending;
2. the exact PRODUCT/spec/decision rules it implements;
3. the important loading, unavailable, retry, or recovery behavior;
4. the learner data written and provider calls made;
5. explicit non-goals and named future owners for adjacent work;
6. one browser acceptance path and focused deterministic checks;
7. the code owner for each changed boundary; and
8. the risk review needed before implementation, not a generic maximum audit set.

If a learner-visible alternative is unresolved, stop at design review. Coding does not choose
between alternatives.

## Implement in four passes

1. **Walking proof:** make the smallest real journey work from its actual entry to its observable
   ending. Use Clerk, Neon, and Gateway as soon as that journey needs them.
2. **Failure and retry:** add the named unavailable/retry behavior, idempotency, version handling,
   privacy, and concurrency protection warranted by the journey.
3. **Ownership check:** remove duplicate authority, dead branches, prototype dependencies, and
   feature-to-feature internal imports introduced or exposed by the work.
4. **Acceptance:** run the focused checks and the exact browser journey before asking to close.

Close is not a fifth implementation pass. If acceptance has not already passed, the work stays
active.

## Code ownership guardrails

- Learner components render feature-facing contracts; they do not import database or provider
  implementations.
- Lessons and Practice may share evaluation, evidence, and request protection through explicit
  shared contracts. One feature does not import another feature's session internals.
- Checkpoint, attempt evidence, completion, and retained command results that represent one learner
  action commit atomically or fail together.
- Every learner mutation has one retry-safe command identity and one content/source version.
- Publication validation and runtime resolution enforce the same promoted-content authority.
- Production code does not import prototype fixtures or depend on `prototype-*` components.
- A new shared abstraction requires two current consumers. The first consumer may use a local,
  replaceable implementation.
- Refactor only the ownership boundaries the current learner journey exercises. A broad rewrite
  needs its own proven consumer and target.

Enforce these rules with focused tests or import-boundary checks when a changed path can violate
them. Reviewer prose alone is not enforcement.

## Findings and backlog ownership

Every retained audit finding receives one of four dispositions in `Docs/WORK.yaml` or the owning
phase evidence:

- blocking this journey;
- owned by a named future phase;
- accepted risk with founder reason; or
- not reproduced/superseded with evidence.

Do not place dozens of unrelated findings inside one umbrella fix. Group findings only when the
same learner journey and the same implementation change prove them together.

## Bounded close

`Docs/CLOSE.md` owns the mechanical close protocol. Its operating limits are:

1. pin one candidate after acceptance already passes;
2. run the candidate checks once;
3. run only the reviews selected by the actual risk;
4. classify new findings as blockers or named follow-up work;
5. allow one bounded blocker-repair pass and rerun only affected checks/reviews; and
6. if the repaired candidate exposes another fundamental blocker, return the target to active and
   re-plan it instead of starting another close loop.

A blocker is a contradiction of the promised journey/proof, a failing required check, a material
security/data-integrity defect, or a violation of an enforceable code-ownership rule. Improvements
outside those categories go to the work register and do not expand the close.

Retain the final candidate proof and a concise blocker history. Close evidence exists to make the
result trustworthy, not to preserve every transient command transcript in the main product tree.

## State must have one answer

- `proposed`: shaped but not ready for implementation.
- `ready`: product choices, proof, failure behavior, and ownership are settled.
- `active`: implementation is in progress.
- `blocked`: a named dependency prevents meaningful progress.
- `closed`: the required proof and close record exist.
- `canceled`: the delivery contract was abandoned or replaced; any useful implementation remains
  available but carries no claim that the canceled outcome was completed.

`Docs/NOW.md`, the roadmap index, the phase file, the work register, and close evidence must agree.
Validation should reject contradictions instead of accepting structurally valid but misleading
metadata.
