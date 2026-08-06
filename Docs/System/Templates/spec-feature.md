---
id: SPEC-F-XXX
kind: feature
title: <what a user would call it>
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
     No extra frontmatter keys — additionalProperties is false. -->

# <Title>

## Purpose

What this lets a person do, and why it exists. Two or three sentences.

## Behavior

How it actually works, in the present tense. This is the section someone reads in six months to
answer "what does this do." Describe observable behavior, not implementation.

- Rule: <a checkable statement — this is where enforceable practices live>
- Rule: <e.g. "AI output is validated before display; invalid output falls back to the
  deterministic path">

## Boundaries

What this deliberately does not do, and why. Non-goals that survived from the phases that built
it.

## Dependencies

Which areas this rests on and what it needs from each.

---

**Cap: ~1500 words.** A spec nobody finishes reading stops being true.

**`paths` is required.** It is what makes spec coverage, blast radius, and drift computable
instead of judged. Globs should match the files that implement this feature and nothing else.
