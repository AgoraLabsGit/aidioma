---
id: SPEC-A-DEVSYSTEM
kind: area
title: Development system
status: active
superseded_by: null
vendor: null
decisions:
  - D-013
built_by:
  - PHASE-005
last_amended: PHASE-007
research: []
paths:
  - Docs/System/**
  - Docs/WORK.yaml
  - Docs/Roadmap/**
  - .work/**
---

# Development system

## Purpose

Process substrate: Docs/System, Work ledger, dashboard, Roadmap, and agent commands.

## Behavior

- Rule: Living process SSOT is `Docs/System/system.md`
- Rule: Authored non-phase work lives in `Docs/WORK.yaml`
- Failure mode: If derive/dashboard is down, agents still read Docs/ in the IDE

## Boundaries

Learner product behavior is not this area. Dashboard-spec stays under System/ (D-009).

## Vendor

null
