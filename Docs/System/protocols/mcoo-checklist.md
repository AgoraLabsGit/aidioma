---
schema_version: 3
id: MCOO-CHECKLIST
title: MCOO enforcement checklist
status: approved
owner: founder
---

# MCOO checklist

**MCOO** = Minimal Complexity for Optimal Output. Kin to YAGNI ([Fowler](https://martinfowler.com/bliki/Yagni.html)):
do not ship complexity for a *presumed* future need; do invest in malleability (tests, clear
seams) that keeps change cheap.

## `/plan` (cheap — prevent)

Name in the phase Plan / complexity-cost line:

- [ ] Outcome is one observable result
- [ ] Cut / defer / drop list exists (even if empty)
- [ ] No foundation without a named consumer in this phase
- [ ] Non-goals list the tempting extras

## `/close` (binding — FAIL blocks merge)

FAIL Scope (MCOO) if any:

| # | FAIL if |
|---|---|
| 1 | New module/package/abstraction with **no consumer** in this diff |
| 2 | Ships work listed in phase **non_goals** |
| 3 | Complexity not named in Plan cost / cut list (and not justified in Close record) |
| 4 | “Future-proof” layer that does not change current proof_kind evidence |
| 5 | Duplicate authority (two owners for the same truth) introduced without migrating the old one |

WARN if simplification was possible but deferred with founder ack.

## Articulation test

An agent can answer in one sentence: *What did we refuse to build, and why is the remainder
necessary for the outcome?* If not, MCOO was not applied.
