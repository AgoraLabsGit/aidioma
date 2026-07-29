# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-29 (A1 CLOSED; A2 ACTIVE; Practice IA prototype closed)

## Position

**Lane A — App (A2 ACTIVE: all slices proven; close controls pending)**
- A1-2 is proven: the web app imports the shared contract; Content CI is live; checksum-journaled
  SQL and the idempotent seed loaded 4 canonical lessons / 134 items into real Neon with zero-change reruns.
- Neon Production, Preview, and Development now have distinct databases, owners, and Vercel
  credentials. Both non-production roles are denied Production and each other; all copies passed
  schema/journal/content integrity proof. Local writes default to the Development identity.
- All six Clerk variables exist locally/all scopes without tracked values; live-key promotion is OI-034.
- SQL is the sole DDL authority; the runner enforces exact journal history, serializes migrations,
  and asserts deferred-ordinal drift. OI-028…OI-032 are closed; OI-026 remains deferred upstream.
- Mike gave explicit A1 `VERIFIED + GO` on 2026-07-29. `main` is published to the remote, whose
  only branch is `main`; merged A1 branches/worktrees were removed while active parallel worktrees remain.
- Production is live at `https://aidioma-agoralabs.vercel.app`; all routes, Clerk test auth, and phone overflow proof pass.
- Vercel protects Preview only; Production is public. No Production seed or learner-data write ran.
- OI-026 remains 4 production / 13 total advisories with no compatible fix.
- A2-1 is proven locally: one authenticated, server-owned `/api/evaluate`; normalized exact answers
  grade free, safe character-near answers grade `close`, and meaning-uncertain/poor answers make one
  strict Gateway call. It is stateless; A3 still owns sessions, persistence, and derived stats.
- A2 corrective gates pass: 19 files / 133 tests, lint, build, smoke, DB/Gateway proof, clean audits.
- OI-036 adds opaque user-keyed regional Firewall admission before the preserved local guard, plus a
  mandatory evaluation-only key with an aggregate $1 monthly request-start budget. The account has
  attribution but no enforceable per-user budget.
- A READY hardened Preview exists. OI-036 awaits Mike's Preview-only Firewall publication and
  authenticated comparison/AI/429 plus dashboard receipts.
- OI-037 owns the repeated direct-push race. This reconciliation combines the hardened A2 line with
  the revised Practice IA; publication must use this resolved line, not a divergent tip.
- The revised fixture-backed Practice IA keeps lesson entry under Lessons and opens Practice on
  Collections with Saved as a local filter. Real sessions remain A4/A5; Production Sets remain A6.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Publish only the staged Preview Firewall draft and complete authenticated A2 proof.
2. After VERIFIED/GO, publish the resolved main commit, verify Production, and close OI-036/OI-037.
3. Continue C2 with a1-05; keep A3 persistence, A4 real session UI, and A6 Production Sets separate.
4. Promote OI-034 before real users and recheck OI-026 on patched upstream releases.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · Practice Sets are MVP (ADR-0015/A6) · wordfreq informs original selection only.
