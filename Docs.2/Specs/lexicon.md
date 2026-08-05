---
id: LEXICON-001
title: Reviewed word and phrase directory
area: lexicon
status: active
implementation: implemented
founder_review: approved
updated: 2026-08-04
---

# Reviewed word and phrase directory

This is the implemented contract for the first `LEXICON-001` learner proof. On 2026-08-04
the founder delegated the final product judgment to the reviewing agent, with the explicit goals of
preserving the current Practice experience and establishing word/phrase infrastructure that can
later support a learner Knowledge Profile and target-aware Practice selection. Approval followed a
complete cross-spec, executable-path, UI-preservation, and adversarial review. This plan authorizes
the bounded `/feat LEXICON-001` implementation. It does not authorize corpus ingestion, durable
learner tracking, target-aware selection, or a public dictionary page.

## Outcome

AIdioma can reuse one reviewed identity for a Spanish word or phrase meaning and prove that identity
through one real, deliberately requested contextual-help interaction in Restaurant Practice. A
source-owned contextual map connects exact English and Spanish spans, the reviewed lexical meaning
where one exists, and the surface form used in that prompt. The current prompt card, composer,
answer, feedback, scheduling, and recap behavior remain the default experience. The map does not
change the prompt's teaching, answer, grading, or progression authority.

In learner terms:

```text
reviewed Spanish word or phrase
        ↓
the intended meaning and reviewed English expressions
        ↓
exact contextual use in a reviewed Restaurant prompt
        ↓
one quiet help entry point in the existing one-prompt-at-a-time Practice journey
        ↓
later: target-specific evidence and a Knowledge Profile identify a review need
        ↓
later: reviewed target-to-source lookup finds suitable prompts for Practice
        ↓
the existing serving policy sequences and reinforces those complete prompts
```

The first proof uses the actual reviewed-prototype prompt “We ordered the vegetarian dish, but it is
no longer available.” It must demonstrate `no longer → ya no`, `available → disponible`,
`ordered → pedimos` as a contextual form linked to a reviewed meaning, and one structural case
without a direct one-to-one translation. Only these reviewed targets are help-capable in the first
proof; all other text stays ordinary, answerable prompt text. The Lexicon makes those facts
consistent and avoids AI for reviewed help. It does not itself decide what a learner knows or what
Practice should serve next.

## MCOO boundary

MCOO means **minimal complexity for optimal output**. For this work it requires every stored concept
to change a real learner or editorial behavior.

The first implementation is one small vertical proof:

- a small repository-authored catalog of reviewed Spanish words and phrases;
- stable meaning identity;
- a versioned contextual sidecar for the actual Restaurant prompt, with exact bilingual spans,
  reviewed surface forms, phrase grouping, and structural help where no direct equivalent exists;
- a pure reader consumed through the real Practice path;
- a quiet help entry point that reveals only the proof's reviewed target words/phrases, plus a
  first-class `I don't know` action, without turning every prompt word into a control; and
- visit-local assistance attribution and complete-prompt reinforcement without a learner database.

It does not include a universal language ontology, a full English dictionary, a synonym graph, a
learner-by-word matrix, automatic CEFR assignment, broad corpus annotation, durable saving, a public
Lexicon page, or automatic publication from an external source. “Click any word” across arbitrary
unreviewed content and AI fallback remain separate later decisions. The first proof exposes only its
named, reviewed targets after the learner deliberately opens help and makes no AI call.

Earlier adaptive-system reviews are useful risk research, but their own retrospective found that
document completeness had been mistaken for learner proof. This revision requires the consumer
before the foundation may be considered implemented.

## Current implementation truth

- `@aidioma/lexicon-schema` now owns strict word, phrase, sense, contextual-map, source-reference,
  lifecycle, replacement, collision, deterministic-reader, and schema-v1 canonical-hash contracts.
- `content/lexicon/` owns the three reviewed entries and one exact Restaurant contextual map required
  by this proof. The original Lesson and 50-prompt Restaurant source payloads remain unchanged.
- Repository validation checks the real parsed Restaurant source, exact spans, annotation overlap,
  target versions, source hash, deterministic order, and Git-baselined content-version progression.
  CI runs the package, tooling, validation, app, build, and focused browser gates.
- The real Practice page receives one server-built learner-safe projection. The mapped active prompt
  stays plain until the learner opens quiet Word help or selects I don't know. Missing or invalid
  mappings fail silently back to ordinary Practice.
- Revealed help is visit-local, versioned, checkpointed, and assistance-aware. It makes no help-time
  evaluator or AI call, never fabricates a graded turn, and routes assisted work to reinforcement
  without adding it to independent accuracy or strengthened-capability claims.
- There is still no lexicon database, learner word history, durable saved word/phrase relation,
  mastery state, global/reverse lookup, target-aware selector, broad Lesson mapping, external lexical
  runtime API, or public directory page. Those remain owned by later approved consumers.

## Ownership: one home per fact

| Owner | Owns | Does not own |
|---|---|---|
| Lexicon | Shared Spanish word/phrase identity, local meanings, and reviewed English expressions | Accepted answers for a whole prompt, Lesson order, Collection scope, learner state |
| Contextual language map | Exact source/version, bilingual spans, reviewed surface form, phrase grouping, and structural help for that occurrence | Shared lexical publication, UI state, grading, practice eligibility, or learner evidence |
| Lesson | Teaching context, objective, local vocabulary occurrence, examples, accepted answers, progression | A second copy of shared lexical facts |
| Collection/Practice prompt | Scenario, capability, reviewed prompt/answers, level/scope, difficulty | Lesson progression or universal word meaning |
| Practice interaction | Click/select behavior, help presentation, `I don't know`, and visit-local assistance state | Canonical word meaning, response grading, or durable proficiency |
| Evaluation | What one learner response demonstrated or missed and which reviewed repairs are justified | Lexical publication or mastery |
| Knowledge Profile | Learner observations and derived review state by approved lexical target and skill | Dictionary truth or grading |
| Translation | Search, translation interaction, and later saving behavior | Canonical lexical authoring |

The Lexicon never stores `lessonIds`, `collectionIds`, examples copied from those sources, or learner
statistics. The contextual sidecar owns source references because context is its job; reverse
associations are generated from those records rather than copied into lexical entries.

## Proposed type-safe contract

The contract should live in an independent package such as `@aidioma/lexicon-schema`. Repository
tooling and later consumers import it; existing Lesson and Practice content-source schemas do not
change in the first delivery. The lexicon package must not import application, route, Lesson, or
Practice types.

The following is the approved semantic shape, not implementation code:

```ts
const NonBlankText = z.string().trim().min(1).max(200);
const EntryId = z.string().regex(/^lex-[a-z0-9]+(?:-[a-z0-9]+)*$/u);
const SenseId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

const PartOfSpeech = z.enum([
  "noun", "proper-noun", "verb", "adjective", "adverb", "pronoun",
  "determiner", "preposition", "conjunction", "numeral", "interjection", "expression",
]);

const Sense = z.object({
  id: SenseId,
  contentVersion: z.number().int().positive(),
  englishGlosses: z.array(NonBlankText).min(1).max(6),
  deprecated: z.boolean().default(false),
  replacedBy: z.object({ entryId: EntryId, senseId: SenseId }).strict().optional(),
}).strict();

const LexicalEntry = z.object({
  schemaVersion: z.literal(1),
  id: EntryId,
  contentVersion: z.number().int().positive(),
  kind: z.enum(["word", "phrase"]),
  spanish: NonBlankText,
  partOfSpeech: PartOfSpeech,
  gender: z.enum(["masculine", "feminine", "common", "variable"]).optional(),
  senses: z.array(Sense).min(1).max(12),
  deprecated: z.boolean().default(false),
  replacedByEntryId: EntryId.optional(),
}).strict();

const LexicalTargetRef = z.object({
  entryId: EntryId,
  senseId: SenseId,
  entryVersion: z.number().int().positive(),
  senseVersion: z.number().int().positive(),
}).strict();

const SourceRef = z.object({
  type: z.literal("restaurant-prompt"),
  hashSchemaVersion: z.literal(1),
  collectionId: NonBlankText,
  collectionVersion: NonBlankText,
  itemId: NonBlankText,
  itemVersion: NonBlankText,
  sourceItemPayloadSha256: z.string().regex(/^[a-f0-9]{64}$/u),
}).strict();

const TextSpan = z.object({
  field: z.enum(["english", "spanish"]),
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
  exactText: NonBlankText,
}).strict();

const LexicalContext = z.object({
  kind: z.literal("lexical"),
  id: z.string().regex(/^ctx-[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  englishSpan: TextSpan,
  spanishSpan: TextSpan,
  target: LexicalTargetRef,
  note: NonBlankText.optional(),
}).strict();

const StructuralContext = z.object({
  kind: z.literal("structural"),
  id: z.string().regex(/^ctx-[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  englishSpan: TextSpan.optional(),
  spanishSpan: TextSpan.optional(),
  explanation: NonBlankText,
}).strict().refine(
  (value) => value.englishSpan !== undefined || value.spanishSpan !== undefined,
  { message: "A structural annotation must identify at least one reviewed source span" },
);

const ContextualAnnotation = z.discriminatedUnion("kind", [
  LexicalContext,
  StructuralContext,
]);

const ContextualMapRecord = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^map-[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  contentVersion: z.number().int().positive(),
  source: SourceRef,
  annotations: z.array(ContextualAnnotation).min(1),
  deprecated: z.boolean().default(false),
}).strict();
```

### Why this is the minimum

- `word | phrase` exactly matches the requested directory. A memorized chunk remains a phrase;
  “chunk” is how a Lesson teaches it, not a second lexical identity.
- A stable entry plus local sense ID distinguishes `estar` for location from `estar` for current
  state. Recognition and production are later observation facets, not duplicate lexical entries.
- English remains a reviewed list attached to a Spanish meaning. A full English identity system is
  unnecessary for the approved contextual help and would roughly double editorial complexity.
- Exact spans plus a dedicated hash of the parsed source item replace the historical brittle
  single-word `wordIndex`.
  `exactText` must match the indexed source substring, so offsets cannot silently drift. The adapter
  emits reviewed help targets; React never infers phrase boundaries by tokenizing learner-visible text.
- A lexical annotation joins the contextual English expression, the reviewed Spanish surface form,
  and one stable lexical meaning. This supports `no longer ↔ ya no` and `ordered ↔ pedimos` without
  pretending that `pedimos` is a separate meaning or that knowing it proves the entire verb.
- A structural annotation explains a reviewed mismatch such as an English subject that Spanish
  leaves implicit. It has no fabricated lexical target and therefore can create no word-level claim.
- Entry, sense, and mapping versions preserve the exact reviewed interpretation without forcing a
  runtime database. A sense version changes only when that sense changes; adding a different sense
  does not rewrite the earlier sense's version.
- Zod refinements require gender for common nouns, reject gender on other parts of speech, require a
  multi-token `spanish` value for phrases, and allow replacement fields only on deprecated records.
  Span refinements require `start < end`, the correct field for each language, exact source-text
  agreement, unique annotation IDs, and non-overlapping selectable segments in the first proof.

`SourceRef` v1 admits only the Restaurant source used by this proof. A Lesson source variant is added
only when a real Lesson interaction consumes it. `sourceItemPayloadSha256` is a dedicated per-item
hash computed after `PracticePromptSchema.parse`; it is intentionally separate from the existing
Restaurant manifest's whole-collection `promptPayloadSha256`, which remains byte-stable.

`LexicalTargetRef` is deliberately not named `LearningTargetRef`. A lexical sense is one future
learning-target kind, not the universal identity for an inflected form, grammar concept, contrast,
Lesson, or capability. Before durable learner evidence begins, its owning plan may introduce a small
typed union containing lexical senses, reviewed forms, and existing grammar references. This work
does not build that union or persist learner evidence under a lexical sense as if it covered all
language knowledge.

### Why conjugation and phrase templates are separate later contracts

The user-facing Word Profile may eventually show conjugation tables, and that data should be type
safe. It should not be represented as an optional, usually incomplete `forms` array on every lexical
entry before the actual table journey is designed.

When a real consumer is approved, add a separate versioned `VerbParadigm` enrichment keyed to one
verb entry. Its Zod contract should use discriminated finite and nonfinite forms with closed mood,
tense, person, and number enums, an explicit completeness claim, and pinned offline morphology
validation. The UI renders the table from those facts; AI prose is never the table authority.

Likewise, `tengo … años` may begin as one reviewed phrase. A typed slot/template contract is added
only when a real templating, matching, or generation consumer needs to understand the slot. This
avoids pretending an ellipsis string is a deterministic pattern engine.

The first proof does not need to publish that template phrase. Fixed phrases `por favor` and `ya no`
already prove shared phrase identity without claiming pattern matching that the core contract cannot
perform.

### Initial content integration

Contextual maps live in a canonical versioned sidecar under `content/lexicon/`; they are not added to
the Restaurant payload in the first proof. A record pins the exact source item and its dedicated
per-item payload hash, then annotates the reviewed English and Spanish fields. Both directions
consume the same reviewed map.

The first record covers only `restaurant-vegetarian-dish-unavailable-v1` and exactly this inventory:

| Reviewed source segment | Reviewed help | Contract job |
|---|---|---|
| `ordered` / `pedimos` | the reviewed meaning of `pedir` plus the displayed contextual form | Prove a form can point to a meaning without becoming form mastery. |
| `no longer` / `ya no` | `ya no` / `no longer` | Prove phrase precedence and one phrase-level target. |
| `available` / `disponible` | `disponible` / `available` | Prove a word-level target. |
| one explicitly spanned subject-omission case | a short reviewed structural explanation | Explain non-equivalence without inventing a word target. |

All other prompt text remains ordinary readable and answerable text. The help region presents
`no longer` as one touch-sized phrase control rather than separate word guesses. Structural
annotations handle incorporated or omitted material honestly instead of inventing word-for-word
correspondences.

Other Restaurant prompts, Lessons, passages, quick checks, conversations, reference cards, and
Flashcards remain unchanged and unavailable for this assistance feature. Existing source files,
strict schemas, content versions, reviewed hashes, serving manifest, accepted answers, and
`vocabRefs` remain byte-stable. Later Lesson reuse must add reviewed contextual records through its
own proven learner consumer rather than bulk-annotating the current corpus.

### Identity and correction rules

- Entry and sense IDs are never repurposed. Correcting wording without changing the assessed meaning
  keeps the ID and increases that sense's version plus the containing entry version.
- Splitting, merging, or materially changing a meaning creates a new sense ID and deprecates the old
  one. An optional replacement points to a reviewed successor but never moves or merges learner
  evidence automatically. Historical references remain resolvable; new active mapping records cannot
  bind a deprecated target.
- `spanish` is a word lemma or fixed reviewed phrase. It is not an accepted-answer list, generated
  definition, display string with slash-separated alternatives, or learner spelling alias.
- Any later generated reverse projection must include the contextual-map ID/version, source
  owner/item/version/hash, annotation ID, spans, lexical entry/version, and sense/version so later
  edits cannot silently rewrite what was shown.
- A contextual-map version increases whenever its source hash, spans, explanation, or target
  changes. Git preserves the first-proof history. Before learner writes begin, the persistence plan
  must keep the exact map and sense versions or an equivalent immutable snapshot; a current
  repository file alone is not sufficient historical learner-data authority.

### Reconciliation with existing Lesson vocabulary

The directory and a Lesson occurrence intentionally overlap, but they have different jobs:

- the lexicon wins only for shared directory identity, meaning, headword, part of speech, and gender;
- the Lesson wins for its card text, contextual gloss, accepted answers, example, hints, and grading;
- the sidecar never copies or changes either source.

For a bound VocabItem, deterministic validation requires compatible Spanish, part of speech, and noun
gender. A differing English card gloss is allowed only as a reviewed contextual presentation of the
bound sense; it is never imported automatically into `englishGlosses`. Unexplained conflicts fail
publication. A future directory surface reads the lexicon value, while the existing Lesson continues
to display its own reviewed value.

### First-proof assistance and evidence boundary

Practice may keep visit-local interaction facts such as:

```text
contextual help opened for annotation ctx-no-longer
contextual help opened for annotation ctx-available
learner selected I don't know
complete answer submitted after assistance
```

Those facts let the current visit label the attempt assisted and deliberately return the complete
prompt. They are not durable proficiency records. Asking for help does not subtract from prior
knowledge.

The interaction contract is explicit:

- The default active prompt remains the current plain prompt card. One quiet `Word help` action opens
  a compact help region containing only the mapped proof targets as full-size controls. Historical
  prompt cards stay static. Opening and closing the region alone is not assistance; revealing an
  annotation records its exact ID and versions.
- `I don't know` reveals the reviewed complete answer and the proof annotations in a neutral help
  state on the current card. It makes no request to evaluation or any other AI, creates no answer
  bubble or fabricated graded turn, and does not change evaluated-turn count, visit accuracy,
  collection `latest`, or recap `What went well`. A learner-visible Continue then sends the existing
  `needs_reinforcement` command and advances to intervening material.
- When a learner reveals answer-relevant help and then submits a complete answer, evaluation still
  receives exactly the current `itemRef`, `direction`, and `userInput` request and returns ordinary
  same-turn communication feedback labeled as assisted. The response remains in the transcript and
  completed-prompt count, but it is excluded from the visit-accuracy numerator and denominator and
  cannot strengthen recap capabilities. If a visit has no unassisted evaluated responses, omit the
  percentage and say plainly that there are no unassisted answers yet. An assistance-aware
  application adapter sends `needs_reinforcement` regardless of the whole-answer verdict so the
  complete prompt returns later. An unassisted correct answer keeps the current `retrieved` mapping.
- Assistance state is keyed by exact source identity, offer ordinal, direction, contextual-map
  version, and revealed annotation IDs. It clears on a new offer, settings restart, End, or stale
  result, and is added to the versioned current-page checkpoint so pause/resume cannot turn an
  assisted attempt into an unassisted one.

No encounter, help opening, annotation reveal, `I don't know`, same-turn repair, save, requeue,
contextual-map presence, or overall prompt verdict creates positive or negative word-level evidence.
Later evaluation must return a server-allowlisted target-specific finding for the exact occurrence
and requested skill before the Knowledge Profile may create an observation candidate. Revealed
targets receive no independent-production finding; unrevealed targets receive none merely because
the complete answer was correct. Delayed unassisted performance may provide stronger evidence under
the future Profile policy.

Entry, sense, map, and source versions pin provenance; they do not create separate knowledge buckets.
Correction, supersession, and deterministic summary rebuild belong to `PROGRESS-SAVED-001` and
`DATA-PERSISTENCE-001`. Replacement references never migrate learner evidence automatically.

### What this foundation enables and defers

The first delivery implements only:

- versioned semantic identity for one reviewed Spanish word or phrase meaning;
- exact occurrence identity through source, map, annotation, entry, and sense versions;
- bilingual reviewed spans and the surface form displayed in this prompt;
- source-to-context resolution for the active Restaurant prompt; and
- exact visit-local attribution of which reviewed help was revealed.

It deliberately defers observation and attempt schemas, recognition/production weighting, stable
form-target identity, paradigms, learner states, due dates, urgency, persistence, ranking, global
lookup, target-to-source indexes, and next-item policy. `pedimos` proves contextual assistance only;
neither the Knowledge Profile nor adaptive Practice may claim or schedule form mastery until a real
form consumer approves stable form identity.

## Deterministic versus reviewed behavior

### Zod validates one record

- exact field shape, strict objects, bounded nonblank text, enums, and positive versions;
- unique sense IDs and conservatively normalized glosses inside one entry;
- noun/gender compatibility through refinements;
- at least one active sense for every active entry; and
- well-formed exact spans, unique annotation IDs, and valid lexical versus structural annotations.

### Repository validation checks relationships

- globally unique, immutable entry IDs;
- no removed entry or sense ID without explicit deprecation/replacement policy;
- every active mapping resolves its pinned source hash and an active entry/sense;
- replacements resolve to active targets and contain no entry/sense cycles;
- normalized Spanish headword/phrase and English-expression collisions are reported as ambiguity,
  never silently merged;
- exact spans match the pinned English or Spanish source field and the named proof inventory is
  deterministic and non-overlapping;
- duplicate annotations, dangling targets, free-floating structural notes, and invalid content
  combinations fail publication; and
- changed lexicon or mapping payloads require their own intentional version increases.

### Mechanical normalization is intentionally narrow

- Unicode normalization, whitespace collapse, lookup casing, and deterministic sorting are allowed.
- Accents remain meaning-bearing data. Fuzzy distance, AI similarity, and token splitting never merge
  identities or publish aliases.
- Slash-separated lesson glosses and accepted-answer arrays are review inputs, not safe automatic
  sense records. An editor must decide whether they are translations, variants, forms, or different
  meanings.

### Pure reader and Practice adapter

The first domain consumer is a pure typed reader; a server/build-side Restaurant assistance adapter
uses it and supplies only the active prompt's learner-safe projection to the existing page:

```text
buildLexiconReader(entries, contextualMaps)
contextForSource(sourceRef) -> reviewed annotations or unavailable
helpForAnnotation(sourceRef, direction, annotationId) -> lexical | structural | unavailable
```

The schema package owns record types and pure validation. Repository validation owns source hashes,
relationships, and lifecycle. The server/build-side adapter may load the full reviewed files; the
client receives only current-prompt source identity, target labels, reviewed help, annotation/map
versions, and availability. The Practice page never imports repository files, the whole Lexicon, or
answer authority and never infers alignment. Unmapped content returns `unavailable`; absence renders
the exact existing plain prompt and never triggers token inference, an automatic AI call, or a
failure in the underlying Practice journey.

Global Spanish/English lookup and a generated `sourcesForTarget` projection are intentionally not
implemented in this first delivery because neither is consumed by the approved Restaurant
interaction. The canonical contextual records preserve the target-to-source relationship so a later
Translation or adaptive-serving consumer can earn those deterministic projections without changing
lexical identity.

The broad eligible-source coverage report is removed from this first delivery because it would
measure annotation volume rather than learner value. Hash schema v1 remains canonical sorted-key JSON
of the complete individual source item after `PracticePromptSchema.parse`, then SHA-256. Any future
hash algorithm is a new explicit schema version. The separate Restaurant serving-manifest hash keeps
its current whole-collection meaning and value.

### Future Knowledge Profile and target-aware Practice boundary

This plan preserves, but does not implement, the future composition requested by the founder:

```text
compact Knowledge Profile summary
  -> priority word/phrase meaning and requested skill
  -> reviewed eligible occurrence in an active prompt
  -> frozen Practice candidate pool
  -> existing practice-policy-v1 sequences and requeues complete prompts
```

The Lexicon will supply identity and reviewed occurrence facts. The Knowledge Profile will own the
learner's observations, assistance history, performance interpretation, and cautious review needs.
`ADAPTIVE-SERVING-001` must define a separate reviewed practice-opportunity contract covering the
exact target, occurrence/source, skill, modality, direction, assessment requirement, level/scope,
and availability before any target-aware selection ships. Contextual-map presence alone does not
mean a target is assessed, required by accepted answers, or eligible for adaptive service.

An upstream adaptive selector may later choose and freeze eligible complete prompts. The implemented
Practice engine remains unchanged: it receives only whole-prompt identity, direction, and normalized
overall commands, then owns within-visit interleaving and requeue. It never reads word meanings,
learner history, due weights, help copy, or target findings and never silently changes an explicitly
chosen collection scope.

## Assisted Restaurant proof

The first proof uses the existing prompt and reviewed answer exactly as authored:

```text
English: We ordered the vegetarian dish, but it is no longer available.
Spanish: Pedimos el plato vegetariano, pero ya no está disponible.
```

The proof must include:

- `no longer` as one selectable phrase mapped to `ya no`;
- `available` mapped to `disponible`;
- one contextual form such as `ordered ↔ pedimos` linked to its lexical meaning without a durable
  form-knowledge claim;
- one reviewed structural explanation where the languages do not align word for word;
- deterministic help in the active direction without an AI call;
- a first-class `I don't know` reveal -> Continue -> delayed complete-prompt return with no
  evaluator call or fabricated graded turn;
- exact visit-local attribution of revealed annotations; and
- an assisted complete answer that can still receive ordinary same-turn communication feedback while
  earning no claim of independent production for the revealed target and returning later through
  the assistance-aware application adapter.

Required isolation proof:

- existing Vocab and Sentence Flashcards render, source, and grade exactly as before;
- the lexicon generates no Flashcards and changes no accepted answers;
- unassisted Restaurant serving and reinforced scheduling remain unchanged;
- non-Restaurant collections remain unannotated and unchanged;
- missing contextual maps mean assistance is unavailable for that item, not a runtime error;
- invalid maps fail content validation before publication;
- `I don't know` makes no evaluator or other AI request;
- the closed/default state preserves the current prompt typography and wrapping, cue/direction,
  composer and Send action, feedback order, header actions, Pause/End behavior, and focus path;
- historical turns never become interactive retroactively, and the help interaction creates no
  permanent annotation clutter or tab stop for every sentence token;
- closing help or its neutral reveal state restores focus intentionally, and missing maps render the
  exact current plain prompt;
- the page remains keyboard accessible, touch usable, responsive, and understandable without color;
  and
- a lookup failure can never block the underlying Lesson or Practice journey.

This proves reusable lexical identity, exact contextual assistance, and honest assistance attribution
for one real prompt. It does not prove arbitrary text translation, a general morphology engine,
CEFR placement, durable learner evidence, saved vocabulary, broad synonym handling, or Lessons reuse.

## Source and API posture

Tracked sources can reduce editorial work, but none should serve learners directly:

| Source | Candidate use | Explicit limit |
|---|---|---|
| Kaikki/Wiktextract | Pinned offline POS, gender, lemma/form, and conjugation fact checks | Do not copy glosses/examples or use as runtime answer authority |
| wordfreq + FrequencyWords | Offline frequency signal and editorial ordering cross-check | Not CEFR, mastery, or an automatic difficulty truth |
| MCR Spanish WordNet | Later synonym/antonym/relation candidates | Never auto-publish a relation or widen accepted answers |
| Tatoeba | Later sentence/alternate candidate reserve with required attribution | Not the initial word directory and never unreviewed curriculum |
| PCIC + CEFR | Human-reviewed scope, sequence, and objective guidance | Not bulk ingestion or one absolute level per spelling string |
| FSI + COERLL | Later pattern/register candidates after source-specific review | Not lexical truth or direct modernization without review |
| Lexicala or another paid API | Possible internal editorial QA after a measured bottleneck | No default runtime dependency |

All archived license, size, availability, and API claims must be reverified before an import. External
records enter a quarantine/candidate area, pass deterministic checks, receive an explicit reviewer
decision, and only then become repository-authored canonical entries. A separate minimal import/review
receipt should accompany the first real external enrichment; its exact schema belongs to that
measured import, not this no-import first delivery.

The first implementation can use current AIdioma-authored material and make zero AI calls. Later AI
may suggest candidates but never bypass review.

## Relationship to level and learner knowledge

- No word spelling receives one universal CEFR level. Level and difficulty belong to the reviewed
  content occurrence and intended meaning/form.
- The later Knowledge Profile may record observations only with an exact semantic target,
  occurrence/source/version, recognition or production skill, direction/modality, assistance facts,
  target-specific evaluation finding, time, and session.
- An encounter, an assessed attempt, a same-turn repair, and delayed retrieval are different facts.
  This directory defines none of their weights or learner-facing states.
- Misspellings never become shared entries. A later evaluator may privately connect learner text to
  an intended target and classify spelling, accent, morphology, lexical substitution, or meaning
  change.
- A searchable wordbook/list is a plausible first Knowledge Profile view. A visual knowledge graph
  waits until reviewed relationships help a learner choose an action better than a list does.

## Delivery sequence

### Implemented first `/feat LEXICON-001`

1. Add the independent Zod contract and pure validators.
2. Author only the reviewed entries and senses required by the actual Restaurant proof under
   `content/lexicon/`, including `ya no`, `disponible`, and the lexical identities required for the
   contextual-form example.
3. Author one versioned contextual sidecar for
   `restaurant-vegetarian-dish-unavailable-v1`, with exact bilingual spans and a reviewed structural
   annotation, without changing the prompt payload.
4. Add the minimum pure typed reader and a server/build-side Restaurant assistance adapter that
   projects only active-prompt reviewed help; do not build global lookup or reverse indexes yet.
5. Add one quiet active-prompt `Word help` entry point and a compact target-help region while
   preserving the default prompt card, composer, answer submission, feedback, transcript, and
   historical turns.
6. Add versioned visit-local assistance state, assistance-aware verdict adaptation, and checkpoint
   compatibility. Revealed help plus any evaluated verdict sends `needs_reinforcement`; unassisted
   verdict mapping remains unchanged.
7. Add the `I don't know` neutral reveal and Continue path. It sends no fabricated response to
   evaluation, changes no evaluated summary, and returns the complete prompt through the existing
   serving command.
8. Prove contract/lifecycle behavior, real browser interaction, failure/recovery, AI-call avoidance,
   accessibility, responsive behavior, and all isolation scenarios.

No database migration, durable learner write, saved vocabulary, external import, broad corpus
annotation, public Lexicon surface, or automatic AI translation belongs in this delivery. If the
current evaluator cannot handle a chosen synonym case reliably, record that evidence under
`EVALUATION-001`; do not expand this work into evaluator redesign.

### Following work

1. A bounded Practice-assistance owner may expand from this proven interaction to arbitrary reviewed
   prompts, AI fallback, save actions, and richer help presentation without moving those concerns into
   LexicalEntry.
2. `EVALUATION-001` may use reviewed lexical targets for structured repairs and must decide
   spelling-versus-meaning treatment, synonym/paraphrase cases, and target-specific findings.
3. `PROGRESS-SAVED-001` defines the Knowledge Profile, contextual saved vocabulary, durable
   observations, review states, and correction/deletion semantics.
4. `PLATFORM-SECURITY-001` and `DATA-PERSISTENCE-001` implement only proven learner-owned writes,
   including exact map/sense versions or immutable snapshots.
5. `TRANSLATION-001` may plan broader lookup and bounded AI fallback after this reviewed interaction;
   durable history and saving wait for the Knowledge Profile and persistence contracts.
6. `ADAPTIVE-SERVING-001` may use lexical evidence only after it beats a simple item/recency baseline.
7. Lessons reuse begins with a second learner consumer, not a bulk migration of existing Lesson
   vocabulary into the directory.

The lexicon/mapping validator owns its version history independently. `CONTENT-FIX-001` should still
close before durable learner evidence relies on general Lesson content-version changes.

## Acceptance criteria

- The shared schema rejects malformed word, phrase, sense, span, lexical annotation, and structural
  annotation examples and publishes inferred TypeScript types from the same contract.
- Cross-file validation rejects dangling or removed IDs, invalid sense refs, and unversioned lexicon
  or mapping changes.
- The actual Restaurant prompt resolves the four-item proof inventory deterministically in both
  language directions; the help region exposes `no longer` as one phrase mapped to `ya no`.
- The contextual-form proof shows the reviewed Spanish surface form while preserving lemma/sense
  identity and making no form-mastery claim.
- The structural proof explains one no-direct-equivalent case without inventing a lexical target.
- Normalized lexical collisions fail as explicit ambiguity instead of silently merging a sense;
  no global lookup API ships in this delivery.
- Lesson and Restaurant source files, strict parse results, content versions, whole-collection
  manifest hash, reviewed/promotion hashes, and serving manifest remain byte-for-byte unchanged; the
  sidecar uses its separately named per-item hash.
- Regression tests prove identical Restaurant candidate identities/order and resume compatibility,
  unchanged Lesson Vocab/Sentence Flashcards, and unchanged non-Restaurant paths.
- Contextual help makes no external-provider or AI call. `I don't know` reveals neutral reviewed
  help, creates no graded turn/count/score/capability claim, and sends `needs reinforcement` only
  when the learner continues.
- Visit-local assistance state names exact source, offer, direction, map version, and annotation IDs;
  pause/resume retains and revalidates it. It creates no database write, durable learner history,
  visible proficiency deduction, or mastery claim.
- An assisted response receives ordinary immediate evaluation feedback using the unchanged
  three-field browser request, but the application sends `needs_reinforcement`, excludes the turn
  from visit accuracy and strengthened-capability claims, labels its feedback as assisted, and
  creates no independent target finding. It remains a visible completed response. Unassisted correct
  keeps `retrieved`; a visit with no unassisted evaluated responses shows no percentage.
- Repository tests prove source-to-context and annotation-help resolution; target-to-source and
  global lookup projections remain deferred until a real consumer exists.
- Existing Lesson and Restaurant records parse unchanged; the package graph has no import cycle.
- Default-state DOM/screenshots prove unchanged prompt text/classes, typography/wrapping,
  cue/direction, composer/Send, feedback ordering, header heights/actions, Pause/End, and historical
  turns. Open-help proof covers pointer, keyboard, touch-sized controls, phrase grouping, intentional
  focus entry/return, screen-reader names/order, Escape, reduced motion, 200% text, 320px through
  desktop widths, both themes, and no overflow.
- Fixtures cover invalid entry/sense pairs, malformed or drifting spans, normalized ambiguity,
  duplicate/conflicting annotations, free-floating structural notes, active mappings to deprecated targets, replacement without
  evidence migration, source-hash drift, missing/deprecated/cyclic replacements, mapping-version
  drift, input-order determinism, and reader rebuild equivalence.

## Implementation evidence

- The package contract passes 25 tests; repository validation passes 14 tests plus typecheck, smoke,
  and the real canonical validator. The approved parsed prompt hash is
  `5f49af359a78aaed139a3098d5363a961fd332fb8af4eadb3a4a222773467ff5`.
- The application passes 290 tests, typecheck, lint, and production build. A direct server-adapter
  regression test proves the real source produces the approved projection in both directions.
- The focused production-browser gate proves quiet default help, the grouped `no longer` phrase,
  pointer and keyboard behavior, Escape/focus restoration, I-don't-know reveal, no help-triggered
  grading, reinforcement continuation, axe, 200% text, no overflow, 320px and desktop, and both
  themes across eight screenshots.
- The pre-existing Practice production-browser gate still passes 54 screenshots covering Lesson and
  collection catalogs, Saved Restaurant, miss return, pause/resume, evaluator recovery, feedback,
  recap, keyboard, reduced motion, responsive widths, and 200% text.
- A fresh independent composition audit required and then accepted the single hash owner, immutable
  Git baseline for version changes, real-adapter proof, recovery focus, responsive matrix, and CI
  wiring. No database, production configuration, external AI help, or original source payload changed.

## Delegated approval decisions

On 2026-08-04 the founder asked the reviewing agent to consider all current drafts, protect the
Practice experience, and approve `LEXICON-001` only after its own review. The review rejected the
earlier broad click-every-segment proposal and accepted these three narrower learner-facing choices:

1. **Help and phrase behavior.** Keep the prompt plain by default. One quiet `Word help` action opens
   a compact help region with only the named reviewed targets as full-size controls; `no longer` is
   one phrase. No token-by-token tab stops, arbitrary text lookup, or AI fallback ship in this proof.
2. **`I don't know`.** Reveal the complete reviewed answer/help on the current card, make no
   evaluation call or graded summary entry, then require Continue before the existing serving policy
   returns the complete prompt after intervening material.
3. **Assisted-attempt semantics.** Preserve normal same-turn communication feedback, but route any
   response after revealed help to `needs_reinforcement`, exclude it from strengthened-capability
   and visit-accuracy claims, subtract nothing from prior knowledge, and grant no
   independent-production evidence for any target. Public points and durable proficiency remain out
   of scope.

## Decisions and discovered issues

### Accepted decisions

| ID | Proposal | Status |
|---|---|---|
| LEX-D001 | Repository-authored Spanish word/phrase records are canonical; later generated indexes and any DB rows are projections. | accepted by delegated review 2026-08-04 |
| LEX-D002 | Shared identity begins as entry + versioned local sense; lexical senses remain only one future learning-target kind, while recognition/production and form-specific evidence stay outside the Lexicon. | accepted by delegated review 2026-08-04 |
| LEX-D003 | A separate versioned contextual sidecar owns exact bilingual spans, reviewed surface forms, and structural help; source content retains accepted-answer, grading, hashes, and progression authority. | accepted by delegated review 2026-08-04 |
| LEX-D004 | English begins as reviewed expressions on Spanish senses; full English identity is deferred. | accepted by delegated review 2026-08-04 |
| LEX-D005 | External sources are offline candidate/validation inputs and can never publish or serve answers automatically. | accepted by delegated review 2026-08-04 |
| LEX-D006 | Misspellings are evaluation/private learner evidence, never shared lexical entries. | accepted by delegated review 2026-08-04 |
| LEX-D007 | The first implementation is accepted only through the real assisted Restaurant journey; the former standalone five-entry/no-UI proof is superseded. | accepted by delegated review 2026-08-04 |
| LEX-D008 | The first proof uses reviewed annotations and zero translation AI calls; arbitrary-text fallback is deferred to separately owned Practice/Translation work. | accepted by delegated review 2026-08-04 |
| LEX-D009 | The Lexicon supplies identity and occurrences; the Knowledge Profile owns learner memory; a future adaptive selector chooses reviewed prompt opportunities; the existing engine continues whole-prompt within-visit scheduling. | accepted by delegated review 2026-08-04 |
| LEX-D010 | The default Practice prompt and composer remain unchanged; assistance is an explicit, quiet, active-prompt-only interaction with exact visit-local attribution. | accepted by delegated review 2026-08-04 |

### Discovered issues and routed work

| ID | Issue | Owner |
|---|---|---|
| LEX-I001 | Canonical lesson vocabulary IDs are lesson occurrences, and Restaurant prompts have no shared lexical references. | `LEXICON-001` |
| LEX-I002 | Lexicon/map hashes now require a `contentVersion` increase against immutable `origin/main` history; the equivalent general Lesson-content gap remains. | resolved here for Lexicon; `CONTENT-FIX-001` for Lessons |
| LEX-I003 | Current source research links point to removed working-tree archive paths rather than durable Git-history references. | `CONTENT-SOURCES-FIX-001` |
| LEX-I004 | Kaikki morphology and wordfreq validation remain documented TODOs, not implemented integrations. | `CONTENT-GENERATION-001` after measured need |
| LEX-I005 | There are no canonical A2/B1 Lessons. This delivery proves only intermediate reviewed-prototype Restaurant use; Lesson reuse waits for its real second consumer. | future content planning |
| LEX-I006 | Whole-item target lists cannot power exact phrase help, displayed forms, structural non-equivalence, saved context, or assistance attribution. | resolved by the contextual-map contract in `LEXICON-001` |
| LEX-I007 | Expansion beyond this one assisted proof needs a permanent Practice-interaction owner. | `PRACTICE-ASSISTANCE-001` |
| LEX-I008 | Stable identity for reviewed inflected forms is intentionally unresolved; lexical sense IDs must not become a universal learner-knowledge key. | `PROGRESS-SAVED-001` with a later form consumer |
| LEX-I009 | The existing Restaurant manifest hash covers the full 50-prompt payload, while contextual maps need one source-item hash. | resolved by the separately named `sourceItemPayloadSha256` contract in `LEXICON-001` |

## Evidence reviewed

- Current executable contracts: `packages/lesson-schema/src/index.ts`, Practice prompt and evaluation
  contracts, content validator, lesson seed, SQL migrations, Restaurant resolver, and tests.
- Current canonical resources: `content/curriculum/SOURCES.md`, five lesson JSON files, and the pinned
  Restaurant reviewed-prototype content/review artifacts.
- Every current capability specification: content generation, data/persistence, evaluation/feedback,
  Lessons, platform/security, Practice page, implemented Practice serving, progress/saved material,
  and UI/accessibility.
- Archived research at `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a`, especially the adaptive
  V4 proposal/panel, its withdrawn-design retrospective, the former content-pipeline/data/proficiency
  specs, lesson-schema notes/audits, and the structured content-source survey.
- A read-only historical knowledge-design audit, independent learner-feature coverage audit, and
  fresh adversarial synthesis on 2026-08-04. A second independent cross-spec audit, Practice UI
  non-regression audit, and Knowledge Profile/serving audit then required the narrower named-target
  inventory, assistance-aware requeue, per-item hash, checkpointed assistance, runtime projection
  boundary, and future target-to-prompt selection boundary now recorded here.
- Founder direction on 2026-08-04 to design just ahead of implementation, prove complete learner
  journeys, and review composition after each capability rather than approve the full architecture
  up front.
- Founder direction on 2026-08-04 to preserve the current Practice UI/UX and delegate approval only
  after the agent had reviewed all drafts and confirmed that Lexicon identity can later support the
  Knowledge Profile and target-aware Practice without becoming their policy owner.
