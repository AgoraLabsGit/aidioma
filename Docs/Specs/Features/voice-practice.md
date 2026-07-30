---
title: Voice practice — staged speaking and live conversation
type: feature-spec
status: active
updated: 2026-07-30
---

# Voice practice — staged speaking and live conversation

> Capability authority for voice UX, scope, quality gates, and rollout. Platform/provider boundaries
> live in `Areas/platform.md`; grading authority stays in `Areas/evaluation.md`. Decision: ADR-0016.

## Product outcome

Learners can answer aloud, hear natural Spanish, receive the same trustworthy correction as typed
practice, and later hold a low-latency guided conversation. Voice enhances the existing Practice
feed; it is not a second learning engine, route hierarchy, progress model, or native client.

## Complexity budget

- Stage 1 adds two narrow server ports: `TranscriptionPort` and `SpeechPort`. The microphone fills
  the existing composer; Send uses the existing evaluator. A play action speaks existing feed text.
- `LiveVoicePort` does not exist until Stage 3. Exactly one implementation per port and one live
  provider ship at a time; there is no runtime provider switchboard.
- No raw audio retention, pronunciation score, voice cloning, open-ended chat, runtime provider
  selector, or automatic multi-provider fallback in the core.
- Typed input and visible text remain available throughout. Voice failure never blocks a lesson.

## Staged delivery

| Stage / wave | Learner-visible scope | Deliberately excluded |
|---|---|---|
| **1 · A10 Core** | Tap/hold to record one answer; bounded audio is transcribed into the existing editable composer; Send grades the transcript normally; play/slow-play authored prompts, model answers, and feedback | Auto-send, continuous listening, interruption, conversation memory, pronunciation grading |
| **2 · A11 Bake-off** | Internal test harness only; compare the Gateway/OpenAI baseline with ElevenLabs using the same Spanish corpus, devices, regions, and rubric; record one production configuration in a new ADR | Duplicate production paths, user-facing provider choice |
| **3 · A12 Live beta** | One winning provider; hands-free constrained conversations from authored scenario/persona/goals; transcript; interruption; 10-minute cap; Flow and Coach correction modes; end recap | Free-form companion chat, multi-provider fallback, multiple dialect packs |
| **4 · A13 Quality** | Only measured improvements: device hardening, PM-005-approved regional voices, retry/fallback if justified, richer reports and vocabulary capture | Phoneme-level pronunciation scoring and native mobile audio unless separately promoted |

Stages are independently releasable. A later stage may not delay or destabilize the prior one.

## Stage 1 interaction contract

1. A user gesture requests microphone permission and starts a visibly timed recording.
2. Stop sends bounded audio to the authenticated transcription route; the provider key stays server-side.
3. The transcript appears in the normal composer. The learner can edit, retry from the same
   in-memory recording, type instead, or press Send. Release audio after send/cancel/navigation;
   transcription alone never creates an evaluation.
4. Send submits `userInput=transcript` plus `inputMode=voice` to the normal evaluation path.
5. Play controls synthesize only learner-safe displayed text. Cache repeated authored audio where
   licensing/provider terms permit; do not pre-generate the full curriculum before usage warrants it.

Initial baseline: AI SDK/Gateway `transcribe` + `generateSpeech`, with current Gateway-supported
OpenAI speech models behind the two ports. Model IDs are configuration, not feature contracts.

The recorder state is `idle -> requesting -> recording -> stopped -> transcribing -> ready|error`.
Keep one local `Blob`, choose a supported MediaRecorder MIME type at runtime, revoke every object URL,
and cap the initial turn at 30 seconds / 4 MiB. The authenticated server verifies media type, bytes,
decoded duration, and Spanish locale before a provider call. TTS requests identify server-resolved
displayed content; they do not accept arbitrary client-supplied synthesis text.

At A10 opening, verify the live Gateway catalog and installed SDK contract. If Gateway lacks the
required current model/capability, ADR-0007 permits one direct server adapter behind the same port.
Pin the proven provider/model/package configuration in wave evidence; do not use streaming STT in A10.

## A11 bake-off protocol

Use anonymized, consented recordings plus scripted samples covering A1/A2 pace, English-accented
Spanish, neutral LatAm/Spain/Rioplatense voices, pauses, background noise, grammatical mistakes,
and interruption. Compare:

- **Turn-based track:** compare STT and TTS independently while holding displayed text, evaluator,
  and lesson state constant: Gateway/OpenAI baseline versus ElevenLabs Scribe/Flash.
- **Live track:** compare `gpt-realtime-2.1` end-to-end with ElevenLabs Speech Engine using the same
  AIdioma dialogue instructions, tools, evaluator, and scenarios wherever the architectures permit.
- For the OpenAI track, compare direct browser WebRTC/Agents SDK with any current Gateway realtime
  transport. Select provider, transport, SDK version, voice, and VAD settings as one configuration.

Freeze the corpus, network profiles, region, prompts, voice settings, and thresholds before running.
Measure transcript intent and preservation of learner errors; blind native-speaker authenticity and
intelligibility; p50/p95 end-of-turn-to-first-audio latency; premature cuts/interruption recovery;
correction agreement on the human-labeled set; failure rate; and projected cost per 10-minute session.
Release targets: >=95% intent-preserving transcripts, native review >=4/5, <2% turn-boundary failures,
and p95 first audio <=1.5 seconds on supported paths. Select one active implementation per port and
one live provider. A quality tie goes to Gateway/OpenAI because it is already in production; a mixed
turn-based stack is allowed only when each non-Gateway port shows a material gate-level advantage.

## Live conversation and correction

- Every conversation has an authored scenario, level, register, opener, target vocabulary, and
  bounded goals. The dialogue model may generate replies but may not award lesson credit.
- **Flow** keeps conversation moving and surfaces structured feedback in the recap. **Coach** pauses
  only for material errors and asks for one corrected repetition. More correction styles wait on data.
- Final learner transcripts go to a separate structured feedback pass. Authored target turns may use
  `EvaluationService`; open dialogue turns use non-credit `ConversationFeedbackService`.
- The spoken reply and displayed transcript must derive from the same accepted text. If correction
  and dialogue generation disagree, structured feedback wins and the discrepancy is logged.
- `LiveVoicePort` connects directly to the selected realtime provider. Workflow and Eve do not
  enter the audio path; a later asynchronous recap would require its own bounded decision.

## Privacy, cost, and accessibility gates

- Raw audio is transient and not stored by default; transcripts are user-visible and deletable.
- Never log multipart bodies, audio bytes/object URLs, ephemeral tokens, or transcript text. Record
  only bounded request IDs, opaque user IDs, media/duration buckets, latency, cost, and failure class.
- Short-lived client tokens only; server-authenticated sessions, duration/payload/concurrency limits,
  spend telemetry, feature flag, kill switch, and per-user daily allowance are release gates.
- Captions/transcripts, keyboard controls, permission/error status, mute/stop, reduced motion, and a
  typed fallback are mandatory. No learning information may exist only in audio.
- Label synthesized playback and live voices as AI-generated; playback must never imply a human tutor.
- STT-backed grammar feedback is not pronunciation assessment. Pronunciation scoring stays PM-026.

## Promotion gates

- A10 opens after the persisted Practice composer/session loop is proven; it does not change MVP scope.
- After A7, A8/A9/A10 are independent post-MVP choices; voice does not secretly depend on reading
  or custom-set generation despite its later numeric ID.
- A12 opens only after A11 records one production configuration and A10 usage/retry data is acceptable.
- A13 opens only for a measured reliability, dialect, retention, or feedback-quality need.
## Sources
- Dated capability, repository, corpus, contract, and test research: [implementation-readiness audit](../../Audits/2026-07-30-voice-implementation-readiness.md).
