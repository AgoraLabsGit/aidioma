# Decisions (AIdioma learner)

Praxis/process decisions moved to **Praxis.v2** `Docs/DECISIONS.md`.
Lexicon decisions retained below.

## D-014 — Spanish dictionary source: Kaikki Wiktextract
Date: 2026-08-07 · Phase: — · From: R-001 · Affects: [SPEC-F-LEXICON, SPEC-A-CONTENT]
Chose: Kaikki eswiktionary Wiktextract JSONL over FreeDict, WordNet, FreeLing, RAE
Why: Only downloadable structured Spanish-first senses; open license; curated extract under content pipelines
Revisit if: CC-BY-SA blocks commercial shipping, or product requires licensed RAE-grade monolingual prose

## D-015 — Kaikki is editorial; DeepL is runtime MT
Date: 2026-08-07 · Phase: — · From: R-002 · Affects: [SPEC-F-LEXICON, SPEC-A-CONTENT]
Chose: Keep frozen Lexicon posture — Kaikki offline QA/seed only; DeepL for later Translation/AI fallback; maps own lesson/collection binding
Why: Different jobs; Kaikki has no stable sense ids or phrase/curriculum authority; Lexicon already uses `lex-*` + contextual maps
Revisit if: A measured import pipeline publishes reviewed Kaikki candidates into `content/lexicon/` with receipt schema

## D-016 — Production-first practice; no direction selector
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER]
Chose: MVP assessed practice always uses English cues and typed Spanish responses. Do not expose EN → ES, ES → EN, or Both settings, and do not maintain separate mastery by direction.
Why: Target-language production is the harder core outcome, removes a setting and duplicate scheduling state, and gives every practice source one evaluation contract. Attempt metadata can retain activity type without fragmenting mastery.
Revisit if: Measured learner outcomes show that a receptive mode is necessary enough to justify a distinct interaction and evidence model.

## D-017 — One scored modality for MVP
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-LEARNING-LOOP]
Chose: Typed word, phrase, and sentence translation is the only scored MVP practice style.
Why: One composer, evaluation contract, feedback loop, accessibility path, and scheduler cover lessons, collections, and saved practice. Prompt depth supplies variety without multiplying product modes.
Revisit if: The production-first loop retains learners but a specific missing skill, such as listening or pronunciation, limits learning outcomes.

## D-018 — All saved plus one optional named list
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER]
Chose: Every saved bilingual item enters All saved and may belong to at most one learner-named list. Save remains one click; organization is optional and happens afterward or from a lightweight destination action.
Why: Learners can organize and practice personal material without folders, nested collections, required tagging, duplicate items, or a many-to-many list model. Source and topic metadata provide automatic views.
Revisit if: Real usage shows that the same item must routinely support multiple learner projects.

## D-019 — One account-wide regional Spanish profile
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-LEARNING-LOOP, SPEC-F-CONTENT-PIPELINE, SPEC-A-LEARNER, SPEC-A-CONTENT]
Chose: One account setting controls Spanish rendering and accepted answers across the product. MVP profiles are `es-AR`, `es-419`, and `es-ES`; concept identity and progress remain profile-neutral.
Why: Learners get consistent Argentine, broad Latin American, or Spain Spanish without repeated choices or duplicated knowledge. A later profile change can re-render material without erasing progress.
Revisit if: Learners demonstrably need simultaneous comparison or per-session switching.

## D-020 — Dialect is required structured content and a publish gate
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-CONTENT-PIPELINE, SPEC-A-CONTENT]
Chose: Store a shared semantic unit and explicit regional renderings where language differs. Every generated lesson, collection, prompt, answer set, and explanation declares supported profiles; missing required coverage blocks promotion.
Why: Regional behavior must be testable and versioned from the first artifact. Duplicating whole curricula would multiply drift, while prompt-only dialect instructions are too inconsistent to grade safely.
Revisit if: A content class cannot be represented safely as shared meaning plus regional rendering.

## D-021 — Deterministic adaptive serving before ML optimization
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER]
Chose: Filter by learner-selected source, current level, unlocked concepts, and dialect; then rank unresolved misses, due items, low confidence, and controlled new material with a versioned deterministic policy.
Why: This directly delivers the value proposition, is explainable and testable, and prevents an AI model from silently changing curriculum scope or mastery.
Revisit if: Retained evidence shows a learned ranking model materially improves outcomes against the deterministic baseline.

## D-022 — Translation is bidirectional; practice is not
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER]
Chose: Translate accepts English or Spanish, auto-detects input, and provides a swap control. A saved result becomes a personal bilingual item but receives no mastery credit until practiced in the production-first loop.
Why: Real lookup needs are bidirectional, while exposing that choice in assessed practice would recreate the complexity removed by D-016. Separating lookup from evidence prevents progress inflation.
Revisit if: Language detection failure creates more friction than a persistent translation direction control.

## D-023 — Complete A1–C1 path is a launch claim, not an unreviewed content dump
Date: 2026-08-24 · Phase: PHASE-001 · Affects: [SPEC-F-CONTENT-PIPELINE, SPEC-A-CONTENT]
Chose: Structure and internally release content level by level, but market the complete beginner-through-advanced path only after A1–C1 coverage, dialect, answer, and review gates pass.
Why: The pipeline should make scale repeatable, but generation volume does not substitute for curriculum coherence or trustworthy grading.
Revisit if: The market proposition intentionally changes to a narrower level-specific product.

## D-024 — Real providers at first consumer
Date: 2026-08-25 · Phase: PHASE-003 · Affects: [SPEC-A-PLATFORM, SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER]
Chose: Wire Clerk identity, Neon development Postgres, and Vercel AI Gateway as soon as a learner journey writes, resumes, or grades. Do not defer first integration to market readiness. In-memory repositories, Clerk keyless mode, and synthetic learner IDs are tests or explicit local opt-in only.
Why: Durable progress, evaluation, and resume are the product; a second fake stack would be rebuilt after content volume. Production hardening (least-privilege roles, CSP, onboarding telemetry) still belongs to Phase 9.
Revisit if: A provider is unavailable and a time-boxed local opt-in is the only way to keep the learner loop moving.

## D-025 — Contextual open questions are core; an unrestricted tutor is not
Date: 2026-08-25 · Phase: PHASE-004 · Affects: [SPEC-F-CONTEXTUAL-QUESTIONS, SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER, SPEC-A-CONTENT, SPEC-A-PLATFORM]
Chose: Let an authenticated learner use Ask AIdioma from the active lesson, cue, or feedback card. AI Gateway receives only bounded promoted context, relevant recent feedback, learner level, and the active Spanish profile. Its visibly generated answer may explain or illustrate the topic but cannot grade, add accepted answers, unlock content, or change serving. A question before a scored answer marks that attempt assisted so it cannot increase mastery; a direct request for the answer reveals only the next authored hint. Retain the exchange with the learner's session for resume while excluding raw question text from logs, proof, analytics, and curriculum promotion. Redirect unrelated questions instead of opening an unrestricted tutor mode.
Why: Immediate questions turn a fixed teaching sequence into responsive learning without giving the model control over curriculum, assessment, or progression. Keeping the feature inside the shared workspace preserves one learner journey and makes its authority, assistance, and privacy boundaries testable.
Revisit if: Learner evidence shows that the context boundary blocks useful language questions, or privacy requirements call for shorter session retention.
