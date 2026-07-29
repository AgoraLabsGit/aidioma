---
title: ADR-0007 — AI Gateway + GPT-5 mini (Haiku bake-off)
type: adr
status: accepted
updated: 2026-07-29
---

# ADR-0007 — AI Gateway + GPT-5 mini (Haiku bake-off)

## Decision
- Route grading AI through **Vercel AI Gateway** (Vercel AI SDK; BYOK-capable).
- Default evaluation model: **`openai/gpt-5-mini`** (or Gateway’s current string for that tier).
- Bake-off runner-up: **Anthropic `anthropic/claude-haiku-4.5`** — swap is a model-string change behind one EvaluationService.
- Retired: hardcoded `claude-3-haiku-20240307` (do not port).

Comparison-first path stays free; AI runs only on poor or meaning-uncertain matches. A missing
authored answer set is a source-integrity failure and never grants AI grading authority.

## Why
Gateway = one integration, easy model swap, no markup on pass-through. Mini is cheap enough that quality (error tags + feedback) matters more than price at MVP volume. Haiku kept for a short A/B when A2 lands.

## Verify at A2 start
Confirmed in A2: `openai/gpt-5-mini` and `anthropic/claude-haiku-4.5` are routable through Gateway.
If either later disappears, the same EvaluationService interface preserves adapter portability.

## Closes
OI-009. Unblocks wave A2.
