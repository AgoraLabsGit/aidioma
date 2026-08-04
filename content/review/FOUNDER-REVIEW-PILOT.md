# Founder Review — Pilot Lessons (a1-02, a1-03)

**Date:** 2026-07-21 · **For:** Mike · **Decision needed:** go/no-go on producing a1-04…a1-12.

Both pilot lessons are through layer 1 (validator, 0 errors) and layer 2 (adversarial QA + fix loops).
Layers 3 (your checklist review) and 4 (paid native-speaker pass) remain — layer 4 is batched for all
12 launch lessons, so what's needed from you now is a **taste check**, not a proofread.

## Status

| Lesson | L1 validator | L2 adversarial QA | In prototype | contentVersion |
|--------|--------------|-------------------|--------------|----------------|
| a1-01 Hola (golden) | PASS 0 err (5 exempt warns) | PASS r1, minors fixed | l1 ✓ | 2 |
| a1-02 Soy así | PASS 0 err / 0 warn | FAIL r1 (1 CRIT) → fixed → **PASS r2** | l2 ✓ | 2 |
| a1-03 ¿Qué haces? | PASS 0 err / 0 warn | **PASS r1** (4 minors, fixed) | l3 ✓ | 2 |

## What the gate caught (evidence it works)

- **a1-02 CRITICAL:** the drafter taught "consonant-ending adjectives don't change for gender" — false
  (*trabajador → trabajadora*), and *induced by a validator blind spot* (its leak detector can't derive
  feminine forms of consonant-ending adjectives, so the drafter avoided *trabajadora* and over-generalized).
  Adversarial QA caught it; the rewritten explanation was re-verified claim-by-claim in a targeted r2.
- **a1-03:** zero critical/major on first pass — conjugations, accent traps (*practico* not *práctico*),
  personal-*a*, and register all verified clean by an independent reviewer.

## Where your judgment adds the most (10-minute pass)

1. **Play lessons 2 and 3 in the temporary static review surface** (`apps/prototype/index.html`).
   You're the best judge of whether the sentences feel natural and the difficulty ramp feels right.
2. **a1-02's explanation** (gender agreement) — the pedagogically dense one; is the -o/-e/-or rule
   presentation how you'd teach it?
3. **a1-03 difficulty skew** (QA advisory): sentences cluster at difficulty 2. Fine for an early lesson,
   but if you want a steeper ramp, say so before 9 more lessons bake in the same instinct.

## Process findings feeding P-003 / tooling (no action needed from you)

- Leak-detector gaps (feminine -dor forms, accented plurals, y→e, sentence-initial proper nouns) —
  one already caused the a1-02 CRITICAL; validator hardening is warranted before scale.
- §4 alternates policy: difficulty-1 bare-verb sentences can't honestly reach 3 alternates; propose
  sanctioning the "moveable time adverb" generator.
- `VocabItem.acceptedEn` (typed-recall grading) — strong P-003 candidate from prototype integration.
- Schema P-002 (segment ids) approved + backfilled corpus-wide this session.

## The go/no-go

**Option A — go, in waves (recommended):** a1-04…a1-07 → a1-08…a1-12, each wave's confirmed vocab
feeding the next, same draft→QA→fix gate. Roughly 2 Opus agents + fix loop per lesson.
**Option B — hold:** fix validator gaps and/or the §4 policy first, then produce (cleaner drafts,
slower start).
**Option C — go after your layer-3 pass** on the pilot, folding your feedback into the drafting prompt.
