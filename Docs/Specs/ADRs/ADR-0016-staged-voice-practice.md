---
title: ADR-0016 — Stage voice from guided turns to live conversation
type: adr
status: accepted
updated: 2026-07-29
---

# ADR-0016 — Stage voice from guided turns to live conversation

## Decision

Voice enters after the typed MVP through four independently releasable waves:

1. Add turn-based recording/transcription and speech playback to the existing Practice composer.
2. Bake off the Gateway/OpenAI baseline against ElevenLabs on one frozen Spanish corpus.
3. Ship one winning provider for constrained, hands-free conversation.
4. Add only quality/reliability work justified by production evidence.

The core is a chained pipeline behind `TranscriptionPort` and `SpeechPort`; it reuses the normal
composer, `EvaluationService`, feed, session, and progress contracts. One active implementation per
port keeps routing deterministic. A `LiveVoicePort` is introduced only when the live beta is built,
with one provider. The dialogue/audio model never becomes grading authority.

## Why

Turn-based speaking reproduces the highest-value beginner loop—speak, inspect transcript, receive a
correction, hear the model—without continuous audio, VAD, interruption, or a second conversation
state machine. It also creates device/latency/retry data and a separate consented corpus-collection
path for a fair decision before AIdioma incurs ElevenLabs coupling or Realtime-specific design.

A single active implementation per port keeps failures observable and testing finite. Provider
fallback is valuable only after measured outages justify the extra integration and QA matrix.
Separating conversation from correction preserves the structured, server-owned trust boundary.

## Consequences

- MVP finish line remains typed translation + flashcards; voice is promoted from PM-008/PM-018 into
  ROADMAP A10–A13 after the shippable MVP.
- A10 uses current Gateway speech/transcription models as replaceable configuration, not a permanent
  vendor commitment.
- A11 must publish its corpus, measurements, cost projection, native review, and a new production-
  configuration ADR. Test turn-based STT/TTS separately and live voice end-to-end. A tie selects
  Gateway/OpenAI; any ElevenLabs port must show a material release-gate advantage.
- A12 is constrained learning practice, not an unstructured AI companion. It has a 10-minute cap,
  one provider, one initial voice/register, and two correction modes.
- Raw audio is transient by default. Voice cloning, pronunciation scoring, native mobile audio,
  regional expansion, and runtime failover require their own evidence/rights/scope gates.

## Extends

ADR-0007 (Gateway/provider routing), ADR-0013 (persisted sessions), and ADR-0014 (web-first SDK
boundaries). Detailed capability truth lives in `Specs/Features/voice-practice.md`.
