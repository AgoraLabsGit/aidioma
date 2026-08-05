---
schema_version: 1
id: PHASE-XXX
title: Short title
phase_type: design # or implementation
subtype: process # optional: process | product-map | architecture | feature | component
status: proposed # proposed | ready | active | blocked | closed
depends_on: []
founder_approval: required
updated: YYYY-MM-DD
---

# PHASE-XXX — Title

## Outcome

One bounded, testable outcome.

## Why now

Why this phase is the right next unit of work.

## Inputs

Evidence and dependencies the phase may read.

## In scope

- …

## Out of scope

- …

## Founder checkpoints

- ≤3 consequential decisions at a time; stop for Mike; silence is not approval.
- Show proposed wording before writing shared files.

## Strategic review

Sub-agents only for bounded questions after founder discussion. Coordinator synthesizes; Mike decides.

## Deliverables

- …

## Proof and exit criteria

- Design: approved deliverables + validation; no product code unless this is an implementation phase.
- Implementation: real-path proof + close audits + human UI review when testable.
- `/close` ends on clean `origin/main`.

## Close audits

List always and conditional audits for this phase (see `Docs/System/development-system-v2.md`).

## Decisions

| ID | Decision | Date |
|---|---|---|

## Fresh-session kickoff

```text
Paste-ready kickoff for the next agent.
```
