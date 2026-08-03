---
title: Handoff — A2 kickoff with parallel Practice Sets prototype
type: handoff
status: superseded
updated: 2026-07-29
---

# Handoff — A2 kickoff with parallel Practice Sets prototype

**Role:** primary App-lane coordinator opening the next roadmap wave
**Operator:** Mike; plain language and one strategic call at a time
**Hard rule:** never push without Mike's explicit `VERIFIED` plus a separate explicit `GO`

## Position

- A1 is closed, published, and proven. Production is public at `https://aidioma.io` and
  `https://aidioma-agoralabs.vercel.app`; Preview alone retains Vercel Authentication.
- `main` and `origin/main` match at `f451d30` before this handoff commit. GitHub has only remote
  `main`. Production routes and Clerk test-mode sign-in/up passed browser verification.
- A2 is the next App wave and is still `pending`. Follow the wave-open rule: give Mike a <=5-bullet
  A2 briefing and get his plan approval before creating implementation code.
- A2's visible result is one `/api/evaluate` endpoint that returns a real verdict on typed input:
  deterministic comparison first, one AI call only after a poor match.
- The accepted provider boundary is Vercel AI Gateway through the AI SDK, defaulting to
  `openai/gpt-5-mini`; `claude-haiku-4-5` is a bake-off alternative behind the same interface.
- OI-026 remains deferred (4 production / 13 total upstream advisories, no compatible fix).
  OI-034 requires live Clerk keys before real users; OI-035 owns immutable GitHub Action SHAs.

## Parallel sessions — do not collide

- Mike has another agent session actively prototyping the Practice Sets UI in
  `.worktrees/practice-sets` on `prototype/practice-sets-ui` under Handoff 010.
- That work is fixture-backed design proof for future A6: catalog, filters, detail, configuration,
  and session-preview interactions. It is not production A6 implementation and must not add DB,
  evaluator, persistence, generated content, or proficiency behavior.
- Do not switch, clean, delete, merge, rebase, stage, or push the Practice Sets worktree/branch.
  Read its durable specs only when A2 must preserve the `sourceType: lesson | set` trust boundary.
- Lane C is also active in `.worktrees/c2` on `slice/C2-1`, drafting a1-05 next. Do not edit its
  lesson/review files or advance its status from the App session.
- Coordinate through committed Docs. Re-read `git status`, worktrees, STATE, ROADMAP, and the newest
  handoffs before acting because either parallel session may advance between turns.

## A2 contract and boundaries

- Browser input contains only session/source/item references, modality, direction, and learner
  text. The server owns expected answers, accept sets, thresholds, tags, and `correctIndex`.
- Order: normalize -> exact match -> deterministic near-match/diff -> AI only on poor/no authored
  match -> schema-validate -> learner-safe result. Multiple choice and flashcards never call AI.
- Provider timeout, missing key, or invalid structured output returns a retryable ungraded result;
  comparison success must remain available when AI is unavailable. Never fabricate a verdict.
- Log path, latency, provider/model, failure class, and token/cost metadata without secrets or full
  private text. Keep model selection behind one `EvaluationService` boundary.
- A3 persistence, A4 SessionEngine/UI, A6 production Practice Sets, content authoring, and live-key
  promotion are out of A2. Do not create evaluation/session rows in this wave.
- V1/V2 evaluation services are archived reference, not live code to port. A2-H proves the new app
  has one endpoint/service and no duplicate live implementation; never edit archived trees.

## Exact next actions

1. Read `CLAUDE.md`, `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/PROCESS.md`, this handoff,
   `Docs/Specs/Areas/evaluation.md`, ADR-0007, the data model, and the shared lesson contract.
2. Read `.claude/skills/run/SKILL.md`; use current official Vercel AI SDK/Gateway guidance to verify
   model strings, structured-output APIs, authentication, and local/hosted failure behavior.
3. Inspect root status/worktrees and the current Next.js app patterns. Do not touch either parallel
   worktree. Sweep registers for A2 ownership; DEP-001 does not fire until A4-2.
4. Give Mike the <=5-bullet A2 wave-open briefing: outcome, comparison/AI behavior, failure safety,
   what is intentionally deferred, and how he will test it. Wait for approval.
5. After approval, create `slice/A2-1` plus `Docs/Waves/A2-1-*.md`; implement through full App gates,
   security/provider audits, high-effort review, real endpoint proof, hygiene, and local merge.
6. Never push or mutate Production configuration/data without the normal explicit verification and
   GO sequence. Keep values out of output and tracked files.

## Copy/paste kickoff message

> Continue AIdioma's primary App roadmap from Handoff 011. A1 is closed and public; open A2, whose
> outcome is one secure `/api/evaluate` endpoint with deterministic comparison first and Gateway AI
> only on poor matches. Read the required Docs and `.claude/skills/run/SKILL.md`, inspect current
> worktrees, then give Mike the <=5-bullet A2 wave-open briefing and wait for approval before coding.
> Another agent is actively prototyping fixture-backed Practice Sets UI in
> `.worktrees/practice-sets` on `prototype/practice-sets-ui`; do not touch, merge, clean, rebase, or
> push that work. Lane C is separately active in `.worktrees/c2`. Keep A2 limited to the evaluation
> boundary—persistence is A3, real session UI is A4, and production Practice Sets are A6. Never push
> without Mike's explicit `VERIFIED` plus separate `GO`.
