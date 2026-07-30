# AUDIT — voice implementation readiness

Date: 2026-07-30  
Scope: ADR-0016, the voice feature spec, ROADMAP A10–A13, the supplied repository shortlist,
`qkral/zingu`, and current OpenAI / Vercel / ElevenLabs capabilities.  
Status: design evidence only; A2 remains active and this audit does not open A10.

## Outcome

The staged plan is sound. Build A10 as a small browser-recorder plus two server ports, not as a
realtime subsystem. Use the installed AI SDK request APIs first, while treating Gateway as a
preferred route rather than a capability assumption. Run A11 before adding any live SDK: it must
select provider **and transport** because direct OpenAI browser WebRTC and Vercel Gateway's current
realtime WebSocket helper have different operational shapes. None of the reviewed demo/self-hosted
repositories should enter the production dependency graph.

## Capability snapshot and implications

| Evidence on 2026-07-30 | Planning implication |
|---|---|
| Installed `ai@7.0.41` exports stable `transcribe` and `generateSpeech`; streaming transcription remains experimental | Use the stable request APIs for A10; no partial transcript or VAD |
| Installed `@ai-sdk/gateway@4.0.31` and the live catalog expose OpenAI transcription/TTS models, but not the current direct-API recommendations `gpt-transcribe` / `gpt-4o-mini-tts` | Discover capabilities at wave open; model strings cannot be architectural truth |
| Gateway realtime/audio support and its React hook shipped as beta/experimental in June 2026 | Spike and pin it in A11; do not make its API a feature contract |
| OpenAI recommends chained voice for predictable workflows and browser WebRTC for speech-to-speech; Agents JS wraps WebRTC, VAD, interruptions, and history | A10 stays chained; direct Agents/WebRTC is the leading A12 OpenAI candidate |
| OpenAI file transcription supports common browser formats and a provider maximum of 25 MB | AIdioma keeps its much lower 30-second / 4-MiB product limit |
| OpenAI requires disclosure that TTS is AI-generated; Spanish is supported, while voices are currently optimized for English | Disclosure is an A10 gate; native Spanish review is mandatory before selection |
| ElevenLabs offers batch/realtime Scribe, streaming TTS, short-lived client tokens, and conversational WebSockets | It remains a real A11 comparison, using official APIs/SDKs rather than clones |

Gateway-first means: use Gateway when its current supported path meets the port and device gates.
If it does not, ADR-0007 permits one direct server adapter without changing client or domain contracts.
A10 must use a voice-specific key/budget; it must not widen or reuse the grading-only credential.

## A10 development contract

### Request flow

```text
getUserMedia -> MediaRecorder -> one local Blob -> POST /api/voice/transcribe
  -> auth/admission/media validation -> TranscriptionPort -> editable composer
  -> explicit Send -> existing /api/evaluate with inputMode=voice

play action -> POST /api/voice/speech with a server-resolvable content reference
  -> auth/admission/text resolution -> SpeechPort -> transient audio response -> accessible player
```

The transcript route never evaluates or auto-sends. The speech route never accepts arbitrary text:
it resolves an authored item/evaluation/feed reference, verifies learner access, and synthesizes the
same learner-safe text currently displayed. Start without persistent TTS caching; add an authored-
audio cache only after terms, invalidation, cost, and deletion behavior are recorded.

### Ports and route results

```ts
type TranscriptionPort = {
  transcribe(input: {
    audio: Uint8Array;
    mediaType: string;
    locale: "es";
    requestId: string;
    opaqueUserId: string;
    abortSignal: AbortSignal;
  }): Promise<{ text: string; durationSeconds: number; language?: string }>;
};

type SpeechPort = {
  synthesize(input: {
    text: string;
    locale: "es";
    voiceConfigId: string;
    speed: "normal" | "slow";
    requestId: string;
    opaqueUserId: string;
    abortSignal: AbortSignal;
  }): Promise<{ audio: Uint8Array; mediaType: string }>;
};
```

Keep provider/model/request metadata in server telemetry, not learner responses. Route failures use
one normalized union: `unauthorized`, `permission_denied`, `unsupported_media`, `too_large`,
`too_long`, `empty_audio`, `rate_limited`, `provider_timeout`, `provider_rejected`, `aborted`, or
`unavailable`, plus `retryable` and a safe learner message. Provider text never passes through.

### Recorder and playback state

- State: `idle -> requesting -> recording -> stopped -> transcribing -> ready|error`; retry reuses
  the stopped Blob, while re-record replaces it. Only `ready` may populate the composer.
- Pick the first supported allowlisted MIME using `MediaRecorder.isTypeSupported`; do not assume
  WebM on Safari. Enforce 30 seconds client-side and validate content signature, allowlisted media,
  byte size, and decoded duration server-side before provider spend.
- Stop media tracks immediately after recording. Revoke object URLs and abort in-flight requests on
  replace, send, cancel, sign-out, and navigation. Never create a second microphone stream for retry.
- Provide explicit record/stop, elapsed/remaining status, play/slow-play, pause, restart, volume,
  and visible transcript controls. Announce state/errors through a polite live region without timers
  chattering to screen readers. Typed input remains operable at every state.

### Security, privacy, cost, and observability

- Authenticate before parsing the multipart body; allow one active transcription and one synthesis
  per user; add local and distributed admission controls, timeout/abort, daily allowance, feature
  flag, and kill switch. A provider call cannot begin after any gate fails.
- Do not log audio, multipart bodies, transcript/text, object URLs, provider keys, or ephemeral
  tokens. Log request ID, opaque user ID, route, configured provider/model, duration/size buckets,
  p50/p95 latency inputs, retry/failure class, billable units, and estimated/receipt cost.
- Raw learner audio stays browser/transient server memory only. Provider retention/training terms,
  regional processing, deletion, subprocessors, and abuse policy need a dated receipt at A10 open.
- Show a concise AI-voice disclosure before first playback/live use and keep it reachable thereafter.

### Proposed A10 file seams

```text
apps/web/src/lib/voice/contracts.ts
apps/web/src/lib/voice/transcription-service.ts
apps/web/src/lib/voice/speech-service.ts
apps/web/src/lib/voice/gateway-transcription-adapter.ts
apps/web/src/lib/voice/gateway-speech-adapter.ts
apps/web/src/lib/voice/voice-admission.ts
apps/web/src/app/api/voice/transcribe/route.ts
apps/web/src/app/api/voice/speech/route.ts
apps/web/src/components/voice/turn-recorder.tsx
apps/web/src/components/voice/speech-player.tsx
```

Mirror the existing evaluation route pattern: injectable handler/service ports, deterministic unit
tests, server-only adapter construction, and route-level auth/admission tests. Do not make a shared
`voice-provider` switchboard or add `LiveVoicePort` files during A10.

## A11 frozen evidence pack

Freeze a versioned manifest before provider runs. It records clip ID, source/consent/license,
speaker/accent bucket, reference transcript, intended meaning, deliberate learner errors, noise/pause
tags, duration, permitted use, and content hash. Proposed minimum:

- **STT:** 120 short clips balanced across English-L1 learner Spanish, neutral LatAm, Spain, and
  Rioplatense speech. At least 30 contain deliberate grammatical errors; at least 24 each cover
  noise and long/false pauses (tags may overlap).
- **TTS:** 48 fixed Spanish texts balanced across authored prompts, model answers, feedback, and
  dialogue replies, including numbers, questions, punctuation, corrections, and slow playback.
- **Live:** 24 three-minute scripted sessions crossing clean/constrained networks, Flow/Coach,
  interruption/repair, and the supported Chrome/Safari desktop/mobile matrix. Ten-minute cost is
  then measured separately using the frozen winning-shape configuration.
- **Review:** randomize provider labels and loudness-normalize samples; use at least three native
  reviewers for intelligibility, naturalness, register, dialect fit, and correction-tone safety.

Mozilla Common Voice Spanish 25.0 is a useful CC0 native-speech supplement, not a learner-error
corpus. Store dataset/version/clip IDs and a retrieval script, not redistributed dataset audio;
English-accented learner speech and deliberate mistakes require separate informed consent or scripted
recordings. Publish aggregates only, and keep consent withdrawal mapping outside the public fixture.

Primary measurements are intent preservation, deliberate-error preservation, native ratings,
end-of-turn-to-first-audio p50/p95, premature-cut rate, interruption recovery, request/session failure
rate, and actual billed cost. WER is diagnostic because punctuation/orthography can overstate learning
impact. Freeze pass thresholds before running and bootstrap confidence intervals for close results.

The resulting production ADR must pin provider, model, transport, SDK/package version, voice,
locale, VAD/turn settings, output format, limits, region, cost budget, rollback/kill-switch procedure,
evidence artifact, and an expiry/revalidation trigger. Delete losing prototype code and credentials.

## A12 transport and event contract

Do not assume Gateway's current realtime hook wins merely because A10 uses Gateway. A11 must compare:

| Candidate | Strength | Required proof / risk |
|---|---|---|
| Direct OpenAI + Agents JS WebRTC | Official browser-first path; automatic capture/playback and interruption | Direct-provider auth/observability; ephemeral token scope; client-side tool safety |
| Gateway realtime WebSocket/helper | Unified spend/observability and short-lived token flow | Beta API volatility; browser audio plumbing; Safari/mobile latency and interruption behavior |
| ElevenLabs conversational WebSocket/SDK | Integrated voice stack and short-lived client authorization | Separate dialogue behavior, transcript authority, pricing, event mapping, and vendor coupling |

`LiveVoicePort` normalizes `connecting`, `ready`, `listening`, `learner_speech_started`,
`learner_turn_final`, `agent_turn_started`, `agent_audio_started`, `interrupted`, `reconnecting`,
`ended`, and safe `error` events. Provider events, partial transcripts, and audio are operational;
only final accepted text enters AIdioma transcript/feedback boundaries. Interrupted agent output is
marked incomplete and never reconstructed as if heard.

The session-token endpoint authenticates and authorizes the scenario, mints only a short-lived
session credential, binds an opaque safety/user identifier, limits tools to server-owned scenario
actions, and never returns provider secrets. A session has explicit mute, stop, timeout, reconnect,
typed escape, transcript deletion, feature flag, and kill switch behavior.

## Repository and SDK disposition

| Resource | Verified signal | Decision for AIdioma |
|---|---|---|
| [`qkral/zingu`](https://github.com/qkral/zingu) | Small Python/React demo; seven commits; no detected license file; no dependable test/lock/build baseline in inspection | UX research only: transcript/audio turn cards, local retry Blob, topic scenarios, replay/weak-word drill. Copy no code/assets |
| [`KoljaB/RealtimeSTT`](https://github.com/KoljaB/RealtimeSTT) | Active MIT Python library; local models, PortAudio/CUDA options, VAD, continuous callbacks, FastAPI browser server | Do not add to A10. Revisit only for a promoted self-hosted/VAD lab; event and buffering ideas are reference material |
| [`openai/openai-agents-js`](https://github.com/openai/openai-agents-js) | Official, active MIT TypeScript SDK; browser WebRTC, session lifecycle, VAD, interruption, transport abstraction | Strong A11/A12 direct-OpenAI spike candidate. Use only realtime package/patterns; no need for multi-agent handoffs |
| [`microsoft/VibeVoice`](https://github.com/microsoft/VibeVoice) | Active MIT research code; Python/self-hosted models; Spanish realtime voice is experimental; README cautions against commercial/real-world use without more testing | Research/listening benchmark only. Do not expand the two-family A11 production bake-off unless a new deployment/rights/cost case is approved |
| [`BernieTv/ElevenLabs-Clone`](https://github.com/BernieTv/ElevenLabs-Clone) | MIT but one-commit Python/CUDA/FastAPI/Next demo centered on cloning, history, credits, and queues | No code reuse or dependency. Voice cloning is explicitly out; UI history/queue concepts are non-authoritative inspiration |
| [`gradio-app/fastrtc`](https://github.com/gradio-app/fastrtc) | MIT Python/Gradio/FastAPI WebRTC/WebSocket framework with VAD and streaming demos | Isolated Python lab reference only under ADR-0014; not the learner app, A10 route, or A12 production transport |
| [Vercel AI SDK audio APIs](https://ai-sdk.dev/docs/reference/ai-sdk-core/transcribe) | Installed stable request functions; provider-neutral ports fit existing TypeScript architecture | Adopt for A10 after installed-source and live-model revalidation |
| [Vercel AI Gateway realtime beta](https://vercel.com/changelog/realtime-voice-speech-and-transcription-now-supported-on-ai-gateway) | Current unified audio/realtime routing, tokens, spend and observability; beta/experimental client surface | A10 routing candidate and A11 live transport candidate, not a frozen A12 choice |
| [OpenAI Voice Agents guidance](https://developers.openai.com/api/docs/guides/voice-agents) | Official chained-vs-speech-to-speech boundary | Architecture authority; chained A10, speech-to-speech only after A11 |
| [ElevenLabs speech capabilities](https://elevenlabs.io/docs/overview/capabilities/speech-to-text) | Official batch/realtime STT and streaming/live voice APIs | A11 comparison through official APIs/SDKs only |

## Verification matrix before development closes

| Layer | Required evidence |
|---|---|
| Deterministic | Port contract tests; route auth/admission/media/text-resolution tests; recorder reducer and Blob/object-URL cleanup tests; no transcript means no evaluation |
| Browser | Permission grant/deny/dismiss; unsupported MIME; record/stop/retry/edit/send/cancel/navigation; play/pause/slow; keyboard/screen reader; typed fallback |
| Adversarial | Spoofed MIME, oversized/overlong/empty/corrupt/polyglot media; parallel calls; arbitrary TTS reference; cross-user evaluation/content ID; aborted request; provider error leakage |
| Real integration | One real Spanish transcription and TTS response in Git Preview with bounded logs, correct credential/budget, no persistence, and spend receipt |
| Devices | Current supported Chrome desktop/Android and Safari desktop/iOS with wired/Bluetooth mic where available; document exact OS/browser versions |
| Operations | Feature flag off/on, kill switch during use, quota exhaustion, timeout, provider 429/5xx, sign-out, route deploy/runtime limit, telemetry redaction |

## Sources checked

- OpenAI: [voice architectures](https://developers.openai.com/api/docs/guides/voice-agents),
  [browser Realtime/WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc),
  [VAD](https://developers.openai.com/api/docs/guides/realtime-vad),
  [speech-to-text](https://developers.openai.com/api/docs/guides/speech-to-text),
  [text-to-speech](https://developers.openai.com/api/docs/guides/text-to-speech), and
  [`gpt-realtime-2.1`](https://developers.openai.com/api/docs/models/gpt-realtime-2.1).
- OpenAI Agents JS: [voice overview](https://openai.github.io/openai-agents-js/guides/voice-agents/),
  [build/session behavior](https://openai.github.io/openai-agents-js/guides/voice-agents/build/), and
  [transport selection](https://openai.github.io/openai-agents-js/guides/voice-agents/transport/).
- Vercel: [Gateway audio announcement](https://vercel.com/changelog/realtime-voice-speech-and-transcription-now-supported-on-ai-gateway),
  [realtime voice architecture](https://vercel.com/blog/realtime-voice-agents-on-ai-gateway), and
  [live model catalog](https://ai-gateway.vercel.sh/v1/models); installed package source was checked
  because the public `transcribe` reference still showed an older experimental alias.
- ElevenLabs: [STT](https://elevenlabs.io/docs/overview/capabilities/speech-to-text),
  [client realtime STT](https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/realtime/client-side-streaming), and
  [realtime TTS](https://elevenlabs.io/docs/eleven-api/guides/how-to/websockets/realtime-tts).
- Web/corpus: [MediaRecorder capability detection](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static),
  [Common Voice datasets](https://commonvoice.mozilla.org/en/datasets), and
  [Common Voice terms](https://commonvoice.mozilla.org/terms).
