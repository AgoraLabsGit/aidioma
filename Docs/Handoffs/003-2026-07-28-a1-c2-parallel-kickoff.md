---
title: Handoff — Parallel A1 app and C2 content kickoff
type: handoff
status: active
updated: 2026-07-28
---

# Handoff — Parallel A1 app and C2 content kickoff

**Role:** primary coordinator for parallel sub-agent development  
**Operator:** Mike; plain language, one decision at a time  
**Rule:** never push without Mike's explicit GO at wave close

## Boot

1. `Docs/STATE.md` → `Docs/ROADMAP.yaml` → `Docs/INDEX.md`
2. This handoff
3. `Docs/Registers/open-items.md` (OI-023, OI-025) + `Docs/Registers/deprecations.md`
4. `Docs/Specs/Features/module-spec.md`
5. `Docs/Specs/Areas/platform.md` + `Docs/Specs/Areas/content-pipeline.md` +
   `Docs/Specs/Areas/evaluation.md` + `Docs/Specs/Areas/data-model.md`
6. `.claude/skills/run/SKILL.md` before opening/running a slice

## Position

- A0 is CLOSED and design VERIFIED. Do not reopen settled product choices.
- A1 is pending; `apps/web/` contains only its boundary README.
- C1 is proven; C2 is parked pending the formal OI-023 operator call.
- OI-025 is mandatory content preparation before lessons a1-04…a1-12 are drafted.
- The repository has no first commit and no remote. `Archive/Legacy-Apps/` is ignored and
  sensitive; never stage, inspect secrets, or push it.

## Recommendation: run both lanes together

App A1 and Content C2 should overlap. Content is the longer lead and otherwise becomes an A6
bottleneck. They meet at the shared schema/content-seed boundary, so coordinate through committed
contracts and gates rather than letting agents edit the same files.

```text
App:      A1 scaffold/seed → A2 → A3 → A4 → A5 ─────→ A6
Content:  OI-025 → C2 lessons 4–12 → C3 native pass ─→ A6
```

## Operator calls at kickoff

Ask separately, in this order:

1. Create the first **local baseline commit** for the closed A0 artifact set? Recommend YES.
   This is needed for branches, diffs, audits, and safe rollback. It does not authorize a push.
2. **OI-023:** un-pause C2, with OI-025 first? Recommend YES. On yes: close OI-023 and change
   C2/C2-1 from `parked` to `active` only when its wave brief is approved.
3. Present the <=5-bullet A1 briefing and ask approval to open A1/A1-1.

Do not combine these into a broad permission grant and do not configure a remote without a
separate explicit request.

## Parallel execution map

### Coordinator owns

- `Docs/ROADMAP.yaml`, `Docs/STATE.md`, registers, wave records, handoffs.
- Root `package.json`/lockfile/workspace integration and all cross-lane merge decisions.
- Operator briefings, triage, gate evidence, audit dispatch, and wave-close GO.

### Content sub-agent: OI-025 → C2

- Owns `content/` and `tooling/content/` for the approved slice.
- First: backfill P-003 accept sets in lessons 1–3; make validator check 5 understand `setId`;
  reconcile curriculum/style/prompts/tooling with Both-direction default; run all content gates.
- Only after OI-025 proof: draft lessons 4–12, one lesson agent each, then independent L2 QA and
  fix loops. Update `content/review/REVIEW-LOG.md`; never edit Docs status directly.

### App sub-agent: A1

- Owns `apps/web/` and app-local configuration for the approved slice.
- A1-1: greenfield Next.js, responsive shell, Clerk, Neon, Vercel, and real app gate commands.
- A1-2: import `@aidioma/lesson-schema`; build idempotent content seed from canonical JSON.
- Never redeclare schema/tags, port V1/V2 code, or use archived docs as authority.

### Auditor(s)

- Read-only and isolated after deterministic gates. A1 auth/database/schema boundaries merit a
  fuller audit; content lessons use independent linguistic QA. Coordinator owns fixes/re-audit.

## Collision rules

- Do not let lane agents edit root workspace files, ROADMAP, STATE, registers, or the same spec.
- Coordinator integrates root scripts/dependencies after receiving each agent's requirements.
- OI-025 may run beside A1-1. Complete it before mass drafting and before treating seeded lesson
  assumptions as final in A1-2.
- One active wave per lane. Every slice follows `/run`; every wave ends with hygiene + `/close`.

## Definition of a good next session

- Local Git baseline decision resolved without pushing.
- C2 formally un-paused and OI-025 either proven or actively bounded.
- A1 approved and its first runnable slice opened with real verify commands planned.
- Parallel agents have non-overlapping ownership and the coordinator retains integration control.
