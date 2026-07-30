# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-30 (A2 closed into cumulative Preview batch)

## Position

**Lane A — App (A2 CLOSED/QUEUED; A2R NEXT)**
- A1-2 is proven: the web app imports the shared contract; Content CI is live; checksum-journaled
  SQL and the idempotent seed loaded 4 canonical lessons / 134 items into real Neon with zero-change reruns.
- Neon Production, Preview, and Development now have distinct databases, owners, and Vercel
  credentials. Both non-production roles are denied Production and each other; all copies passed
  schema/journal/content integrity proof. Local writes default to the Development identity.
- All six Clerk variables exist locally/all scopes without tracked values; live-key promotion is OI-034.
- SQL is the sole DDL authority; the runner enforces exact journal history, serializes migrations,
  and asserts deferred-ordinal drift. OI-028…OI-032 are closed; OI-026 remains deferred upstream.
- Production is live at `https://aidioma-agoralabs.vercel.app`; all routes, Clerk test auth, and phone overflow proof pass.
- Vercel protects Preview only; Production is public. No Production seed or learner-data write ran.
- A2-1 is proven locally: one authenticated, server-owned `/api/evaluate`; normalized exact answers
  grade free, safe character-near answers grade `close`, and meaning-uncertain/poor answers make one
  strict Gateway call. It is stateless; A3 still owns sessions, persistence, and derived stats.
- OI-036 adds opaque user-keyed regional Firewall admission before the local guard, plus a dedicated
  $1-budgeted Gateway key and opaque reporting `user`; no unproven per-user Gateway denial is claimed.
- PR #2 candidate `9cdca85` passed App/Content CI and Vercel at immutable Preview
  `https://aidioma-bcfc7v6t4-agoralabs.vercel.app`.
- Authenticated exact/close comparison, answer-spoof rejection, AI grading, and a 30-success/one-429
  burst passed. The Gateway generation, opaque reporting IDs/tags, and active $1 evaluation-key
  budget were evidenced; unsupported `quotaEntityId` was the fixed BUG-001 root cause.
- A2 is closed and queued, not shipped. OI-036 remains open only for the Production-conditioned
  Firewall proof at `SHIP`; no per-user Gateway denial is claimed without an account policy.
- `/close` builds a cumulative Preview; `SHIP` releases it. A1 is the last formal ship; Handoff 018/OI-037 own cleanup.
- The revised fixture-backed Practice IA keeps lesson entry under Lessons and opens Practice on
  Collections with Saved as a local filter. Real sessions remain A4/A5; Production Sets remain A6.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Resume from Handoff 018. Run `/run` to open A2R's application audit/founder UI review, or `SHIP`
   if Mike wants to publish A2 and consolidate to one clean `main` first.
2. Retire clean release-contained worker worktrees; retain branch/PR refs until `SHIP` reaches `origin/main`.
3. Continue C2 with a1-05 independently.
4. Promote OI-034 before real users and recheck OI-026 on patched upstream releases.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; staged web voice is approved for A10–A13 (ADR-0016).
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP. Worker branches are local/CI-only;
  `release/**` alone creates Preview deployments and `main` alone creates Production deployments.
- `/close` publishes the cumulative Preview; `SHIP` alone authorizes that exact tested batch to Production.
- P-004 dialect shape only · Practice Sets are MVP (ADR-0015/A6) · wordfreq informs original selection only.
