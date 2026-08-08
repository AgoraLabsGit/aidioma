---
id: SPEC-F-XXX
kind: feature
title: <short name ≤60 chars>
status: active                # active | superseded | contested
superseded_by: null
depends_on: []                # [SPEC-A-AUTH, SPEC-A-API]
decisions: []                 # [D-012]
built_by: []                  # [PHASE-007]
last_amended: null            # PHASE-007
research: []                  # [R-004]
paths:
  - <glob>/**            # at least one required — CI rejects an empty list
---

<!-- Validated against System/schemas/spec.schema.json in CI.
     kind: feature requires depends_on and forbids vendor.
     status: superseded requires superseded_by.
     No extra frontmatter keys — additionalProperties is false.
     Mold guidance: D-028 (Rule grammar + stub bar). -->

# <Title>

## Purpose

What this lets a person do, and why it exists. Two or three sentences.

## Behavior

How it actually works, in the present tense. Observable behavior, not implementation.

**Rule grammar (D-028):** each Rule is present tense, observable (UI / API / file / CI), and
fail-visible — a stranger could check it without asking the author. Rules are **rule-oriented
checklists** (peer alternative to Given/When/Then); GWT is optional when a scenario needs it.

- Rule: <checkable — e.g. "POST /checkout rejects carts with no line items (4xx)">
- Rule: <checkable — e.g. "Invalid provider output is discarded; the deterministic path renders">

Bad: "is the primary surface." Good: names the route, gate, or artifact someone can verify.

## Boundaries

What this deliberately does not do, and why. Non-goals that survived from the phases that built it.

## Dependencies

Which areas this rests on and what it needs from each. Name the `SPEC-A-*` ids.

---

**Stub bar (D-028):** Purpose ≤3 sentences; ≥1 Rule meeting the grammar; Boundaries non-empty;
Dependencies names areas. MOCK fixtures may stay thinner.

**Cap: ~1500 words.** A spec nobody finishes reading stops being true.

**`paths` is required.** It makes spec coverage, blast radius, and drift computable. Globs should
match the files that implement this feature and nothing else.
