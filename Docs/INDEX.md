# Docs — the map

> One question → one home. Hard caps are binding.

| Question | The ONLY answer | Cap |
|---|---|---|
| Where are we right now? | [STATE.md](STATE.md) — rewritten in place, never appended | 60 lines |
| What's the plan and status? | [ROADMAP.yaml](ROADMAP.yaml) — two lanes (App / Content); wins every conflict | — |
| How does work run? | [PROCESS.md](PROCESS.md) — the machine | 150 lines |
| How do we write things down? | [CONVENTIONS.md](CONVENTIONS.md) | 60 lines |
| What is true about subsystem X? | `Specs/Areas/<area>.md` | 120 each |
| What is true about capability Y? | `Specs/Features/<feature>.md` | 120 each |
| Why did we decide Z? | `Specs/ADRs/` — numbered, append-only | — |
| What happened in a unit of work? | `Waves/<wave>-<slice>.md` — brief + gates + audit + proof, ONE file | 150 each |
| What's broken / owed / dying? | `Registers/` — bugs · open-items · deprecations | — |
| What's parked for after MVP? | [Registers/post-mvp.md](Registers/post-mvp.md) | — |
| What did a cross-wave audit find? | `Audits/` — dated reports; follow-ups → register rows | — |
| What did we learn (durable)? | `Lessons/` — one atomic file per lesson | — |
| Session continuity mid-wave | `Handoffs/` — dated; highest number = latest | — |
| Superseded anything | `Archive/` + one-line row in `Archive/CATALOG.md` | — |

## Current authorities

`Docs/` is the application-design and process SSOT. Executable contracts and authored content
have one named home outside Docs and are linked here; archived design is evidence, not authority.

| Question | The source of truth |
|---|---|
| App experience and settled UI | [Specs/Features/module-spec.md](Specs/Features/module-spec.md) |
| Practice Set catalog, settings, capabilities, and custom-generation boundary | [Specs/Features/practice-sets.md](Specs/Features/practice-sets.md) |
| Voice stages, UX, quality gates, and provider bake-off | [Specs/Features/voice-practice.md](Specs/Features/voice-practice.md) |
| Production platform and SDK boundaries | [Specs/Areas/platform.md](Specs/Areas/platform.md) |
| Evaluation boundary and result contract | [Specs/Areas/evaluation.md](Specs/Areas/evaluation.md) |
| Persistence model | [Specs/Areas/data-model.md](Specs/Areas/data-model.md) |
| Session recipe and blend formula | [Specs/Areas/session-engine.md](Specs/Areas/session-engine.md) |
| Progress and proficiency | [Specs/Features/progress.md](Specs/Features/progress.md) + [Specs/Areas/proficiency.md](Specs/Areas/proficiency.md) |
| Content-to-app governance | [Specs/Areas/content-pipeline.md](Specs/Areas/content-pipeline.md) |
| Accepted decisions | [Specs/ADRs/](Specs/ADRs/) |
| Lesson schema contract (executable) | [packages/lesson-schema/src/index.ts](../packages/lesson-schema/src/index.ts) |
| Schema proposals and rulings | [Registers/schema-proposals.md](Registers/schema-proposals.md) |
| Curriculum spine (12 A1 + buffer + A2/B1) | [content/curriculum/CURRICULUM-MAP.md](../content/curriculum/CURRICULUM-MAP.md) |
| Content authoring / QA state | [content/SESSION-LOG.md](../content/SESSION-LOG.md) + [content/review/REVIEW-LOG.md](../content/review/REVIEW-LOG.md) |
| Temporary design reference | [apps/prototype/index.html](../apps/prototype/index.html) |
| Superseded design and documentation | [Archive/CATALOG.md](Archive/CATALOG.md) |

## Boot ritual (every session)
1. Read `STATE.md`. 2. Read `ROADMAP.yaml` for the active wave in each lane. 3. Open only what
those point at; grep `Docs/**` (and the linked authorities above) for anything else. Never
front-load the tree.
