# AIdioma documentation

This is the small map for current work. The tested application in `apps/web/` is the product source
of truth. Active documents record decisions accepted from that experience; technical references
preserve useful contracts and rationale, but neither speculation nor archived history may override
what the live product has proved.

## Active spine

| Purpose | Source |
|---|---|
| Product-wide learner criteria | [Core product criteria](Specs/Features/core-product-criteria.md) |
| Accepted Practice decisions and prototype boundaries | [Intermediate learning pilot](Prototypes/intermediate-learning-pilot.md) |
| Current work and continuity | [Handoff 026](Handoffs/026-2026-08-03-clean-main-practice-next.md) |
| This map | `Docs/INDEX.md` |

The Practice Page UI/UX and Practice-serving engine specs do not exist yet. Create them only after
their behavior has been exercised and accepted in the live application. New specs should state what
the learner sees, what must be true, what must not happen, and how the prototype proves it.

## Technical-reference shelf

- [ADRs](Specs/ADRs/) preserve decision history. A newer accepted active decision may supersede
  their product implications without erasing the record.
- [Area references](Specs/Areas/) cover content, persistence, evaluation, platform, proficiency,
  and session-engine boundaries.
- Retained feature references:
  [accessibility](Specs/Features/accessibility.md),
  [Practice Sets](Specs/Features/practice-sets.md),
  [progress](Specs/Features/progress.md), and
  [voice practice](Specs/Features/voice-practice.md).
- Dated implementation references:
  [Eve and Workflow fit](Audits/2026-07-30-eve-workflow-fit.md) and
  [voice readiness](Audits/2026-07-30-voice-implementation-readiness.md).
- Repository documentation reference:
  [process](PROCESS.md), [conventions](CONVENTIONS.md), and
  [deferred decisions](References/deferred-decisions.md).
- Content contract rulings: [schema proposals](Registers/schema-proposals.md).

Executable contracts and authored material remain outside Docs:

- `packages/lesson-schema/` — executable lesson-content contract.
- `content/` — curriculum, authored content, research, style, and review evidence.
- `tooling/content/` — content validation and fixtures.
- `apps/web/` — application behavior and validation source.

## History

[Archive/CATALOG.md](Archive/CATALOG.md) maps superseded plans, handoffs, reviews, registers, and
other historical evidence. Archive material is searchable context, never current authority.
