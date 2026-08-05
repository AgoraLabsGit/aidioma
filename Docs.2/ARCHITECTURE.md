---

## id: ARCHITECTURE-001
title: How AIdioma works together
area: product-architecture
status: review
implementation: mixed
founder_review: required
updated: 2026-08-04

# How AIdioma works together

This is the plain-language map of the learner experiences and decision-making parts that power
AIdioma. It describes durable responsibilities and boundaries, not a delivery plan. [WORK.yaml](WORK.yaml)
is the only roadmap, the capability specs own reviewed behavior, and the tested application proves
what is implemented today.

## The product in one picture

AIdioma should feel like one thoughtful Spanish teacher:

```text
Reviewed learning map
what the content teaches and practices
                +
Learner evidence
what this learner has actually encountered and demonstrated
                ↓
One useful next action
                ↓
Lesson or Practice teaches and tests useful Spanish
                ↓
Evaluation understands the answer and coaching helps now
                ↓
Practice reinforces misses during the visit
                ↓
Precise, cautious evidence improves the next recommendation
```

The learner should experience one coherent loop, not a dashboard of internal systems. AI helps at
specific points of uncertainty or conversation. It does not decide curriculum truth, learner level,
Practice scheduling, or mastery.

## Three kinds of product intelligence

### 1. The reviewed learning map

This is what AIdioma knows about Spanish and its own content:

- Lessons own teaching objectives, sequence, prerequisites, reviewed activities, difficulty, and
accepted answers.
- Collections own a topical practice promise, reviewed prompts, answer authority, and the visible
scope available for one visit.
- The Lexicon owns reusable Spanish word and phrase meanings plus reviewed English expressions.
- Contextual content-to-lexicon maps connect exact bilingual spans, reviewed surface forms, and the
intended word or phrase meaning in one versioned source item. The first approved map supports only
one Restaurant prompt; Lesson source support waits for a real Lesson consumer. Structural notes
may explain honest no-direct-equivalent cases without inventing lexical identity.
- The existing reviewed grammar tags identify grammatical concepts used by content and evaluation.

The Lexicon is not a universal learning ontology. A word meaning, a conjugated form, a grammatical
concept, a communicative capability, a Lesson, and a learner observation remain different facts.
Grammar and capability identity stay content-owned unless a later learner journey earns a separate
reviewed contract.

### 2. Learner evidence

This is what AIdioma may eventually know about one learner:

- an initial chosen or lightly assessed working range;
- current curriculum position;
- precise observations about reviewed words, phrases, grammar concepts, Lessons, and activities;
- recognition and production kept separate;
- whether help, an immediate repair, or an ungraded result affected an attempt; and
- cautious summaries derived from those observations.

Learning observations, the Knowledge Profile, and the level profile are one product responsibility:
**learner evidence**. They do not need three independent engines. Durable observations and derived
summaries may use different storage, but the learner experiences one memory.

AIdioma should never infer a permanent global level from a few answers. It starts with a working
range, says how confident its recommendation is, learns from reliable evidence, and lets the learner
correct or override it.

### 3. The teaching and next-action loop

- Lessons make a finite teaching promise.
- Practice makes a continuous retrieval and reinforcement promise.
- The existing Practice serving policy sequences and requeues whole prompts within the current visit.
- One future deterministic target-aware selector may choose a reviewed word/phrase need and an
eligible reviewed prompt opportunity from a compact Knowledge Profile summary, then freeze that
prompt pool for the existing serving policy.
- The same future policy family may recommend a Lesson, Practice scope, or Saved review across
visits. It may offer a concise reason when useful or requested; individual Practice prompts do not
need repetitive meta-explanations about why they appeared.
- The learner can always choose something else without being penalized or creating evidence.

Recommendation and adaptive serving are one future responsibility, not separate engines. More
sophisticated ranking is justified only if it measurably improves learning over a simple reviewed
baseline.

## The “one-on-one tutor” feeling

The smallest honest version of the magic is not “AIdioma knows everything.” It is that AIdioma
remembers one precise need and responds helpfully at the right time:

1. The learner misses `disponible` in a reviewed Restaurant prompt.
2. AIdioma explains `available → disponible` and may offer a short immediate repair.
3. The complete prompt returns later in the current visit through existing Practice reinforcement.
4. A future precise observation remembers that reviewed meaning and whether the learner was
  producing or recognizing it. The immediate repair is recorded as help, not mastery.
5. On a later visit, a target-aware selector may choose `disponible`, find a separately approved
  reviewed prompt occurrence that really assesses it, and hand the frozen prompt pool to the
   existing whole-prompt serving policy.
6. After delayed, unassisted success, AIdioma can say the evidence improved without claiming permanent
  mastery.

That thin cross-visit recall loop earns the first Lexicon, evaluation, persistence, and recommendation
connections. A full knowledge graph, automatic CEFR engine, ML ranker, vector database, or universal
content ontology does not yet earn its complexity.

The learner-facing behaviors that create trust are:

- one prominent next action, with optional plain-language context rather than repeated explanations;
- accurate memory of specific words, phrases, concepts, and prior help;
- practice in a varied reviewed context rather than endless repetition of one item;
- immediate answers to deliberate follow-up questions;
- honest uncertainty and graceful fallbacks; and
- an easy way to dismiss a recommendation, change the working range, or choose another activity.

## Current implementation truth

- Learners can open the current application without signing in. Authentication exists; sign-in
becomes necessary before AIdioma owns private durable learner history or saved material.
- Five canonical A1 Lessons are authored and validated, but their complete learner journey and
publication review are unfinished.
- The Practice catalog is a prototype. Restaurant alone has reviewed-prototype serving authority and
reinforced typed Practice. Non-Restaurant collections and Flashcards retain their existing paths.
- Production evaluation supports authenticated Lesson translation. Practice uses a separate
fixture-backed local endpoint and is not yet the production learner-data path.
- Current-page Restaurant pause/resume is in memory only. Refresh, another device, or closing the page
loses it.
- The database has authored Lesson serving tables but no learner observations, word/phrase records,
knowledge states, durable Practice sessions, or durable saved vocabulary.
- AIdioma currently uses direct evaluation routes and AI Gateway. Neither Eve nor Workflow SDK is an
application dependency.

## Responsibilities that earn their place

These are logical responsibilities, not proposed microservices.


| Responsibility                         | The learner value                                                                                                                              | Important boundary                                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed content and source resolution | The learner receives the exact active Lesson, collection, prompt, answers, and version promised.                                               | Never silently widen scope or invent authority.                                                                                                                     |
| Lexicon and reviewed content mappings  | The same word or phrase meaning stays consistent across Lessons, Practice, Translation, and later evidence.                                    | Owns word/phrase identity only; missing mappings never block ordinary learning.                                                                                     |
| Evaluation                             | One answer is judged against server-resolved reviewed authority, using deterministic comparison before AI.                                     | Does not own curriculum, scheduling, or long-term knowledge.                                                                                                        |
| Feedback and immediate repair          | The learner understands the material difference and gets one focused next step.                                                                | Same-turn help is not delayed independent retrieval.                                                                                                                |
| Practice serving                       | Missed complete prompts return with useful spacing during the current visit.                                                                   | Receives only a small overall scheduling result, never learner text or model reasoning.                                                                             |
| Learner evidence                       | Reliable observations become cautious summaries across time.                                                                                   | Uncertain/ungraded work creates no knowledge claim; summaries are rebuildable.                                                                                      |
| Target-aware selection and next action | AIdioma may later choose a review target, resolve a genuinely eligible reviewed prompt opportunity, or recommend one suitable reviewed action. | Deterministic first, owns eligibility/ranking rather than the Lexicon or current serving engine, respects explicit choice, and never silently changes a collection. |
| Saved-material organization            | The learner can keep prompts, contextual words/phrases, and translations for later use.                                                        | Saving is an intention, not proof of knowledge.                                                                                                                     |
| Tutor conversation                     | The learner can deliberately ask a Spanish-learning question without leaving the context.                                                      | A question does not grade, advance Practice, or update knowledge by default.                                                                                        |
| Content review and publication         | External research or generated candidates become trustworthy reviewed learning material.                                                       | No external source or AI model publishes directly.                                                                                                                  |
| Authenticated storage and recovery     | Private history, saved material, and sessions can later survive refresh and devices safely.                                                    | Product database records—not workflow runs or browser state—remain authority.                                                                                       |
| Learner-facing surfaces                | Home, Lessons, Practice, Translation, Wordbook, Settings, and Ask AIdioma feel like one accessible product.                                    | Pages compose learner-safe information; they do not own learning policy.                                                                                            |


## How one Practice answer moves through AIdioma

Consider the actual reviewed-prototype prompt “We ordered the vegetarian dish, but it is no longer
available.” This is the intended complete path; planned parts are called out explicitly.

### 1. Resolve the exact visit

The learner chooses Restaurant Practice or valid Saved Restaurant prompts. The Practice source
freezes the exact reviewed items and versions. Invalid saved references stay visible; an empty saved
scope is never filled with unrelated material.

Restaurant remains one topical collection as the learner grows. A visit may freeze a visible
learner-appropriate stage, focus, and direction, but level-aware service must not silently redefine
the collection or create duplicate tense-specific Restaurant collections.

### 2. Choose the next complete prompt

The Practice serving policy chooses the prompt and direction. It deliberately brings a missed prompt
back after other material when the pool permits. It knows prompt identities and overall outcomes,
not accepted answers, individual words, or AI feedback.

### 3. Attach reviewed language context

The approved but unimplemented `LEXICON-001` contextual map can identify:

- `no longer` ↔ `ya no`
- `available` ↔ `disponible`
- the contextual form `ordered` ↔ `pedimos`, linked to its reviewed lexical meaning without claiming
general knowledge of that verb; and
- an honest structural explanation where English and Spanish do not have one selectable one-to-one
equivalent.

It records exact source/version, bilingual spans, reviewed surface form, and reviewed meaning where
one exists. It is canonical reviewed data plus validation, not an independent runtime service. It
does not declare that a mapped meaning is assessed, grade the learner, or create knowledge evidence.

`LEXICON-001` is accepted only after that mapping is consumed by the real Practice path. Stable word
IDs or whole-item target lists alone are insufficient.

### 4. Evaluate the complete answer

The server resolves the prompt, direction, answers, assessment goal, content version, and only the
reviewed lexical or grammatical targets relevant to this source. Predictable answers are compared
without AI. One bounded AI request handles only meaning-uncertain answers.

Future evaluation may return two kinds of information:

```text
Overall answer: correct | close | wrong | ungraded
Specific finding: demonstrated | needs attention | uncertain
```

The overall result concerns the complete prompt. A specific finding concerns only an allowlisted
reviewed target. Evaluation may also distinguish “communicated the meaning” from “demonstrated the
requested form,” but the learner should receive one clear explanation rather than two competing
scores.

AI cannot invent a target. A whole-sentence result cannot automatically mark every mapped word or
phrase right or wrong.

### 5. Coach, then continue

Feedback uses one consistent configured language and names the most useful difference. A miss may
lead to one or two immediate word/phrase repairs. Ordinary spelling is not separately drilled unless
it changes meaning or the reviewed evaluation policy says that form matters.

The Practice turn remains ordered:

```text
answering → evaluating → feedback → optional repair → next prompt
```

The complete prompt still returns later through Practice reinforcement. An immediate repair never
converts the original miss into durable success.

### 6. Pass only the information each part needs

The existing outcome adapter protects serving:

```text
correct                  → retrieved
close or wrong           → needs reinforcement
ungraded or unavailable  → no learning claim
```

Specific findings support feedback and, later, evidence. They never enter the serving policy.

### 7. Remember carefully across visits

A future evidence bridge may create an observation only when the exact source, target, versions,
skill, result, and assistance state are valid. Recognition and production remain separate. Uncertain
or ungraded results produce no observation.

Observations may later be corrected or superseded. Derived learner summaries must rebuild
deterministically so a bad evaluation or withdrawn content does not become permanent learner truth.
Authenticated learners also need explicit correction, deletion, and export behavior before durable
history is considered complete.

## The bridges and adapters

A bridge earns its place only when two responsibilities use different language or authority. It
passes the smallest stable information needed and prevents one side from taking over the other.


| Bridge                             | What crosses it                                                                                               | Position                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Lesson evaluation source adapter   | Exact Lesson identity/version, source text, answer authority, assessment goal, and allowed concept references | Production Lesson path exists; its shared contract is currently Lesson-shaped                                                 |
| Practice evaluation source adapter | Exact Practice collection/item/version, direction, answers, goal, and allowed target references               | Planned production boundary; current Practice route is fixture-backed                                                         |
| Resolved evaluation authority      | One source-neutral, bounded bundle consumed by shared evaluation                                              | Planned; should replace evaluation’s structural dependency on the Lesson source type                                          |
| Contextual language reader         | Source-only exact spans, reviewed lexical mappings, displayed forms, and structural notes                     | Planned first for one Restaurant prompt; server/build-side projection never sends the whole Lexicon to Practice or evaluation |
| AI verdict provider                | One uncertain answer and its compact evaluation bundle; returns validated structured findings                 | Exists for evaluation; remains server-only and capability-specific                                                            |
| Outcome adapter                    | Overall evaluation verdict becomes `retrieved`, `needs reinforcement`, or no evidence                         | Implemented for reinforced Restaurant Practice                                                                                |
| Evidence bridge                    | Validated target finding plus exact source/assistance versions becomes an observation candidate               | Planned; may first run in memory with no durable claim                                                                        |
| Learner-safe presentation          | Internal evaluation or recommendation result becomes concise accessible UI                                    | Partly implemented; each surface owns its visible interaction                                                                 |
| Storage adapters                   | Domain observations, sessions, and saved material are written and read through authenticated ownership checks | Planned for learner data; UI never writes tables directly                                                                     |
| Tutor runtime                      | One deliberate question plus bounded relevant context becomes a streamed answer                               | Planned; may later hide a different agent runtime without changing the learner contract                                       |


Adapter rules:

- Prefer pure functions and strict typed results.
- Resolve source authority on the server; browsers send identities and learner input, not answers.
- Include exact source, content, mapping, and policy versions where history depends on them.
- Map provider or infrastructure failures into learner-safe outcomes.
- Carry authenticated ownership, idempotency, cancellation, and deadlines at learner-write boundaries.
- Use capability-specific provider ports. Evaluation, Translation, tutoring, and content generation do
not share one generic “AI adapter” because their privacy, latency, retry, and authority rules differ.
- Do not create a universal content source, session engine, journey engine, or workflow repository.
- Share Lesson and Practice contracts only after both real paths prove the same lower-level job.

## Learner-facing surfaces


| Surface                               | Its promise                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Home                                  | Offer one honest next action, its reason, and easy access to other choices.                                           |
| Lessons                               | Teach a finite objective before expecting unsupported performance.                                                    |
| Practice                              | Provide continuous reviewed retrieval, feedback, reinforcement, and learner-controlled ending.                        |
| Translation                           | Use reviewed lookup when sufficient and clearly label open-ended AI assistance.                                       |
| Wordbook / Knowledge Profile          | Help the learner find encountered or saved words/phrases and choose useful review without overstating mastery.        |
| Saved material and custom collections | Preserve personal study intentions and reviewed context.                                                              |
| Settings                              | Expose meaningful learner choices such as feedback language, not internal policy controls.                            |
| Ask AIdioma                           | Support explicit contextual questions and open Spanish-learning conversation without confusing tutoring with grading. |
| Voice                                 | Later typed-flow extension requiring its own transcription, pronunciation, privacy, latency, and evidence decisions.  |
| Future native client                  | Consume shared behavior and authenticated APIs without sharing the web component tree.                                |


Detailed implementation status remains in [WORK.yaml](WORK.yaml); the surfaces above do not imply
that unfinished capabilities exist.

## Personalization without pretending

One future deterministic next-action policy should consume a compact learner summary rather than
the full observation history. For example, it may need the learner's working range, curriculum
position, a bounded set of review needs, recent material, explicit choices, and active reviewed
content.

The durable boundaries are:

- respect the learner’s chosen activity and working range;
- use reliable evidence rather than engagement or same-turn repair;
- prefer varied reviewed opportunities over immediate identical repetition;
- fall back to reviewed level-appropriate content when personalized supply is unavailable;
- explain why the recommendation appeared; and
- allow dismissal or override without penalty.

The exact summary fields, ranking rule, novelty balance, delay, confidence language, and result
contract belong to `ADAPTIVE-SERVING-001`; the examples above are not approved algorithms.

Candidate learner words such as `Seen`, `Needs review`, `Practicing`, and `Strong recent evidence`
remain unapproved until `PROGRESS-SAVED-001`. Any future `Mastered` promise must be justified by
varied, delayed, unassisted evidence; its exact confirmation and decay policy belongs to that work.

## LLM use and token discipline

The model should receive the smallest job-specific context, never “everything AIdioma knows.” The
following are architecture boundaries and illustrative flows. Exact request fields, schemas,
budgets, caches, and receipts belong to `EVALUATION-001`, `TRANSLATION-001`, `AI-TUTOR-001`, and
`PLATFORM-SECURITY-001`.

### Evaluation

```text
Resolve exact source and versions
  → load a compact source-only evaluation bundle
  → compare deterministically
  → if uncertain, make one bounded model call
  → validate a small structured result
```

Do not send the whole Lesson, collection, Lexicon, learner history, Saved library, or Knowledge
Profile. The current evaluation result and model budgets are wider than the intended one-material-
issue feedback experience; `EVALUATION-001` should align the structured contract and output budget
with that learner promise.

### Translation

Exact reviewed word/phrase lookup, known reviewed forms, and explicit ambiguity use no AI. Open-ended
phrases or sentences may use one bounded model request. Ambiguous reviewed results should ask the
learner to choose context rather than paying a model to guess. Arbitrary learner translations never
become shared canonical content automatically.

### Ask AIdioma

A tutor request receives the deliberate question, current prompt or feedback when relevant, a few
resolved reviewed meanings or teaching excerpts, feedback language, a compact learner summary, and a
bounded recent conversation window. Older conversation may use a private versioned summary if a real
long conversation requires it. Raw attempt history and the complete Knowledge Profile are never
attached automatically.

### Content work

Use AI offline to propose candidates, then validate and review once so the resulting content can be
reused without runtime generation. Measure which source items reach AI evaluation often—without
logging learner text—to find reviewed answers, mappings, forms, or explanations that can remove
future calls.

### Safe reuse and receipts

- Shared reuse is limited to immutable reviewed material and version-bound derived indexes or bundles.
- Private summaries stay scoped to one learner. Learner answers, evaluation verdicts, tutor replies,
and arbitrary translations are not shared caches.
- Minimal cost and quality receipts may record the job, versions, path, outcome class, latency, model,
and token totals, but never learner text, answers, provider bodies, or raw user identity.
- Retries must not create duplicate model work or duplicate learner evidence.

## Eve and Vercel Workflow posture

Eve and Workflow solve real problems, but neither is a core learning engine.

- [Workflow SDK](https://workflow-sdk.dev/) provides durable, retryable, observable multi-step
execution that can suspend and resume.
- [Eve](https://eve.dev/) is a filesystem-first framework for durable agents with optional tools,
skills, channels, connections, schedules, subagents, sandboxes, approvals, and evaluations.

Neither package is currently installed in AIdioma. They may be selected later behind a
capability-specific boundary; no Lesson, Practice, Lexicon, evaluation, or learner-evidence contract
should depend on either framework.

This is a non-binding fit assessment for later capability planning, not approval to adopt either
framework:


| AIdioma job                                                                    | Simplest appropriate mechanism                                                               | Workflow                                                                               | Eve                                                                            |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Deterministic comparison, Lexicon lookup, Practice serving, next-action policy | Pure rules and direct services                                                               | No                                                                                     | No                                                                             |
| One answer evaluation                                                          | Direct request: comparison first, bounded AI fallback                                        | No                                                                                     | No                                                                             |
| Learner observations, profile, saved material, sessions                        | Authenticated database transaction and rebuildable summaries                                 | No; workflow state is not product authority                                            | No                                                                             |
| Exact Translation                                                              | Lexicon lookup                                                                               | No                                                                                     | No                                                                             |
| Open-ended Translation                                                         | One bounded direct AI request initially                                                      | No                                                                                     | No                                                                             |
| Initial Ask AIdioma chat                                                       | Direct streamed AI request plus database messages only when durable conversation is approved | No initially                                                                           | No initially                                                                   |
| Long tool-using tutor that must survive timeouts or wait for approval          | Runtime hidden behind `TutorRuntime`                                                         | Consider one durable agent approach                                                    | Consider only if the product intentionally needs Eve’s broader agent framework |
| Shared canonical content candidate/review pipeline                             | Repository files, review artifacts, and CI remain authority                                  | Possible execution helper for long-running generation → validation → review → approval | No default need                                                                |
| Future private generated learner material                                      | Database-owned job and content state, if approved                                            | Possible orchestrator for long-running generation and approval                         | No default need                                                                |
| Bulk source ingestion or enrichment                                            | Repository scripts and CI first                                                              | Consider only if work becomes long-running or approval-bound                           | No                                                                             |
| Multi-channel, scheduled, autonomous tutor                                     | Separate future product decision                                                             | Possible internal durability                                                           | Consider only after this explicit expansion is approved                        |
| Practice pause/resume                                                          | Memory now; authenticated database checkpoint later                                          | No                                                                                     | No                                                                             |


Adoption rules:

- Choose Eve or a direct Workflow-based agent for one capability; do not stack two durability systems.
- Keep repository records authoritative for shared canonical content and its publication review.
Keep database records authoritative for approved private learner content, learner history, sessions,
and product job state. Workflow or agent-run state is execution history.
- Use serializable IDs and versions, idempotent steps, bounded retries/cost, cancellation, timeout,
and resume compatibility.
- Pin versions and read the installed package documentation at adoption time; these frameworks and
agent APIs are evolving.
- A normal streamed tutor conversation should be proven before adopting durable agent infrastructure.

## Content and external-source boundary

External dictionaries, corpora, frequency resources, and model output can reduce editorial work, but
they do not serve learners directly by default:

```text
external facts or candidates
  → quarantine and license/provenance review
  → deterministic validation
  → qualified human review
  → repository-authored canonical content
```

Content generation and review may later use Workflow when the process becomes long-running,
retry-heavy, or waits for approval. The database/repository remains publication authority.

## Trust, failure, privacy, and accessibility

- Ungraded or uncertain work changes neither learner evidence nor recommendations.
- If AI evaluation fails, preserve the answer. Offer Retry only for a retryable failure; otherwise
offer Continue without evidence or End.
- Reviewed lookup continues if Translation AI fails.
- Ask AIdioma can fail independently without advancing Practice.
- Personalized selection falls back to active reviewed content and explains the limitation.
- No optional model outage blocks a Lesson or Practice visit.
- Raw learner text is not stored durably unless an approved learner-facing history, correction, or
dispute experience requires it.
- One learner cannot read or change another learner’s profile, sessions, or saved material.
- Recommendation reasons, states, overrides, and recovery actions work without color, by keyboard,
with screen readers, at 200% text, with reduced motion, and on narrow screens.
- Status language describes evidence, not fixed ability or shame.
- Reviewed content declares its teaching variety. Valid reviewed regional forms are treated fairly;
a regional preference is offered only when labels, content, accepted answers, and review support it
end to end.

## Proving real learning value

Personalization must improve later independent retrieval, not merely look intelligent.

One useful future experiment would compare an explained target-aware recommendation with a simple
reviewed level-appropriate ordering and measure later independent retrieval in varied material.

Primary evidence:

- delayed, unassisted retrieval of the same reviewed meaning in a different prompt or direction.

Useful guardrails may include:

- recommendation override and comprehension;
- disputed target findings and ungraded rate;
- abandonment or frustration after correction;
- accessibility completion differences; and
- AI calls, latency, and cost.

Same-turn correction, repetition of the identical prompt, clicks, recommendation acceptance, and
engagement alone are not retention evidence.

Exact hypotheses, content coverage, delays, comparison groups, measures, and stopping rules belong to
`PROGRESS-SAVED-001` and `ADAPTIVE-SERVING-001`; this map does not approve an experiment contract.

## Composability and evolution rules

1. Keep source content authoritative and versioned.
2. Keep pure learning rules outside React, routes, providers, and database code.
3. Let pages compose experiences from learner-safe results; pages do not own learning policy.
4. Keep database, authentication, AI-provider, and future workflow adapters server-only.
5. Share behavior and typed contracts across future clients, not the web component tree.
6. Preserve Lesson and Practice promises even when they reuse evaluation, lexical identity, evidence,
  or UI patterns.
7. Add a shared abstraction only after a second real consumer proves the same job.
8. Missing optional personalization must degrade to ordinary reviewed learning, never a broken page.

## Dependency logic, not a roadmap

The first coherent personalized learning proof depends on this chain:

```text
reviewed lexical identity and source mapping
  → target-aware evaluation
  → in-memory observation and deterministic summary
  → secure durable observation
  → one reviewed practice-opportunity contract
  → target-aware selection freezes eligible complete prompts
  → existing Practice serving sequences and reinforces those prompts
  → delayed varied retrieval validation
```

This dependency does not approve work or set delivery status. [WORK.yaml](WORK.yaml) remains the only
place for sequencing and current next actions.

## Canonical owners


| Product responsibility                                               | Canonical work or specification                                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Product principles                                                   | [PRODUCT.md](PRODUCT.md)                                                                      |
| Reviewed words, phrases, meanings, and mappings                      | `LEXICON-001` / [lexicon.md](Specs/lexicon.md)                                                |
| Practice prompt scheduling and reinforcement                         | `PRACTICE-SERVING-001` / [practice-serving.md](Specs/practice-serving.md)                     |
| Grading, feedback language, and immediate repair                     | `EVALUATION-001` / [evaluation-and-feedback.md](Specs/evaluation-and-feedback.md)             |
| Practice catalog and visible session experience                      | `PRACTICE-PAGE-001` / [practice-page.md](Specs/practice-page.md)                              |
| Lessons and shared capability reuse                                  | `LESSONS-001` / [lessons.md](Specs/lessons.md)                                                |
| Learner evidence, Knowledge Profile, level input, and saved material | `PROGRESS-SAVED-001` / [progress-and-saved-material.md](Specs/progress-and-saved-material.md) |
| Durable learner records and sessions                                 | `DATA-PERSISTENCE-001` / [data-and-persistence.md](Specs/data-and-persistence.md)             |
| Translation and reviewed lookup                                      | `TRANSLATION-001` in [WORK.yaml](WORK.yaml)                                                   |
| Deterministic target-aware selection and next-action recommendations | `ADAPTIVE-SERVING-001` in [WORK.yaml](WORK.yaml)                                              |
| Ask AIdioma and tutor conversation                                   | `AI-TUTOR-001` in [WORK.yaml](WORK.yaml)                                                      |
| Content generation, review, and publication                          | `CONTENT-GENERATION-001` / [content-generation.md](Specs/content-generation.md)               |
| Shared visual and accessibility system                               | `UI-SYSTEM-001` / [ui-system.md](Specs/ui-system.md)                                          |
| Authentication, private data, and provider safety                    | `PLATFORM-SECURITY-001` / [platform-and-security.md](Specs/platform-and-security.md)          |
| Voice and future native client                                       | `VOICE-001` and `NATIVE-CLIENT-001` in [WORK.yaml](WORK.yaml)                                 |


## Deferred founder questions

These questions are routed to their owning work items. They are not one approval checkpoint; each
`/plan` session may bring at most three consequential learner-facing decisions.

1. Approve the simplified core: reviewed source, evaluation, learner evidence, and one deterministic
  next-action policy, with current Practice serving beside it for within-visit reinforcement?
2. Approve a chosen or lightly assessed working range plus confidence and learner override before any
  claim of automatic CEFR placement?
3. Should the first personalized proof be the cross-visit `disponible` recall journey described here?
4. Should “content-to-lexicon map” replace “binding sidecar” in product discussions while code retains
  a concise technical name?
5. Approve keeping Eve and Workflow outside the core, considering Workflow first for long-running
  content review and Eve only for an explicitly autonomous, multi-channel tutor product?
6. Should Practice be allowed to offer a short reviewed explanation or the relevant Lesson when it
  detects unfamiliar language, while preserving the learner’s continuous Practice visit?
7. Which learner-facing evidence labels, if any, should `PROGRESS-SAVED-001` test first?

