---
title: ADR-0007 — AI Gateway + GPT-5 mini (Haiku bake-off)
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0007 — AI Gateway + GPT-5 mini (Haiku bake-off)

## Decision
- Route grading AI through **Vercel AI Gateway** (Vercel AI SDK; BYOK-capable).
- Default evaluation model: **`openai/gpt-5-mini`** (or Gateway’s current string for that tier).
- Bake-off runner-up: **Anthropic `claude-haiku-4-5`** — swap is a model-string change behind one EvaluationService.
- Retired: hardcoded `claude-3-haiku-20240307` (do not port).

Comparison-first path stays free; AI only on poor match / empty accept set.

## Why
Gateway = one integration, easy model swap, no markup on pass-through. Mini is cheap enough that quality (error tags + feedback) matters more than price at MVP volume. Haiku kept for a short A/B when A2 lands.

## Verify at A2 start
Confirm `gpt-5-mini` and `claude-haiku-4-5` are routable via Gateway (or BYOK). If not, same EvaluationService interface → direct SDK — architecture unchanged.

## Closes
OI-009. Unblocks wave A2.
