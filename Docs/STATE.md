# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-29 (A1 CLOSED; A2 ACTIVE; Preview AI fix in progress)

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
- Production is live at `https://aidioma-agoralabs.vercel.app`; all routes, Clerk test auth, and phone overflow proof pass.
- Vercel protects Preview only; Production is public. No Production seed or learner-data write ran.
- A2-1 is proven locally: one authenticated, server-owned `/api/evaluate`; normalized exact answers
  grade free, safe character-near answers grade `close`, and meaning-uncertain/poor answers make one
  strict Gateway call. It is stateless; A3 still owns sessions, persistence, and derived stats.
- The isolated A2 close rerun passes App typecheck, zero-warning lint, 19 files / 138 tests, build,
  16-state smoke, signed-out route proof, dependency/residue checks, and independent audits.
- OI-036 adds opaque user-keyed regional Firewall admission before the preserved local guard, plus a
  mandatory evaluation-only key with an aggregate $1 monthly request-start budget. Reporting and
  quota lookup share the opaque ID; account policy and rejection proof remain external close gates.
- PR #2 deployed close SHA `9ef2f5e`; CI/Vercel passed. Preview Firewall is active at 30/60; Production is unchanged.
- Authenticated comparison/spoof passed, but AI returned `503` before a Gateway event. BUG-001 owns it;
  the active key is nearly unused, excluding budget exhaustion.
- Diagnostic candidate logs bounded HTTP status; full gates pass at 19 files / 140 tests and audit is clean.
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
1. Resume from Handoff 016; review BUG-001 and request PREVIEW GO for the replacement candidate.
2. Re-run authenticated AI proof first; only after it passes run the Firewall burst and remaining
   receipts. After VERIFIED/GO, publish and prove the Production rule and main.
3. After A2 closes, run A2R's application audit and founder UI review before A3; continue C2 with a1-05.
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
- P-004 dialect shape only · Practice Sets are MVP (ADR-0015/A6) · wordfreq informs original selection only.
