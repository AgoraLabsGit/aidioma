---
id: SPEC-F-LEXICON
kind: feature
title: Lexicon
status: active
superseded_by: null
depends_on:
  - SPEC-A-CONTENT
decisions: [D-014, D-015]
built_by: []
last_amended: PHASE-005
research: [R-001, R-002]
paths:
  - content/**
---

# Lexicon

## Purpose

Reviewed word/phrase directory for learners (and related content structures).

## Behavior

- Rule: Lexicon material is authored under content pipelines
- Rule: Kaikki Wiktextract is editorial seed/QA only (POS/gender/lemma); not runtime gloss or answer authority (D-014, D-015 / R-001, R-002)
- Rule: Stable ids are AIdioma `lex-*` + sense strings; lesson/collection binding lives in contextual maps, not on entries
- Failure mode: RAE scrape, silent full Kaikki dump, or DeepL output must not become canonical Lexicon truth

## Boundaries

Practice evaluation and UI composition are separate. DeepL belongs to Translation/AI fallback, not Lexicon authoring.

## Dependencies

Rests on SPEC-A-CONTENT.
