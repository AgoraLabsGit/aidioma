---
id: R-000
question: "<the decision this exists to unblock>"
verdict: <chosen option | none>
status: fresh                 # fresh | stale | superseded
informed: []                  # [D-012] — decision this produced
affects: []                   # [SPEC-A-AI]
phase: null                   # PHASE-007, or null if standalone
date: YYYY-MM-DD
---

<!-- Validated against System/schemas/research.schema.json in CI.
     verdict is required and must be non-empty — use "none" if no option was acceptable.
     phase is null for standalone research.
     No extra frontmatter keys — additionalProperties is false. -->

# <Question>

## Question

What is being decided, and what makes it a real choice rather than a preference.

## Options

| Option | Strengths | Costs | Notes |
|---|---|---|---|
| A | | | |
| B | | | |

Keep this table tight. The comparison is fuel, not the output.

## Verdict

The choice and the one or two reasons that actually decided it. If no option is acceptable, set
`verdict: none` — a negative result is still a result.

## Adv

`ADV: PASS | WARN | FAIL` — per `System/protocols/adv-protocol.md`. Blockers or none.

## Revisit if

The condition that would change this answer. Concrete and checkable — a price, a latency, a
volume, a vendor change.

---

**Cap: ~800 words.**

**What survives:** the verdict becomes a `DECISIONS.md` entry. This file holds the working; the
decision log holds the conclusion. Research older than 90 days is flagged `stale`.
