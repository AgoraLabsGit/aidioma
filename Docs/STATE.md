# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-29 (A1 CLOSED and published; A2 pending wave open)

## Position

**Lane A — App (A1 CLOSED; A2 next)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- A1-1R is proven: the four responsive screens now use the approved prototype shell, tokens, density, and navigation with truthful zero states.
- Proof covers 16 route/theme/viewport states, axe, keyboard focus, reduced motion, 200% text, exact route state, and no horizontal overflow.
- A1-2 is proven: the web app imports the shared contract; Content CI is live; checksum-journaled
  SQL and the idempotent seed loaded 4 canonical lessons / 134 items into real Neon with zero-change reruns.
- Neon Production, Preview, and Development now have distinct databases, owners, and Vercel
  credentials. Both non-production roles are denied Production and each other; all copies passed
  schema/journal/content integrity proof. Local writes default to the Development identity.
- All six Clerk variables exist locally and in all three Vercel scopes without tracked/printed
  values. The pair is test-class for prelaunch; live-key promotion is OI-034.
- SQL is the sole DDL authority; the runner enforces exact journal history, serializes migrations,
  and asserts deferred-ordinal drift. OI-028…OI-032 are closed; OI-026 remains deferred upstream.
- The redundant root env is removed; `apps/web/.env.local` is authoritative at mode 0600.
- A1-H is proven: cache-free App/Content gates pass at 11 files / 39 app tests; three initial
  audits, high-effort review, and all delta re-audits are clean after dispositions.
- Mike gave explicit A1 `VERIFIED + GO` on 2026-07-29. `main` is published to the remote, whose
  only branch is `main`; merged A1 branches/worktrees were removed while active parallel worktrees remain.
- Production is live at `https://aidioma-agoralabs.vercel.app`. All six routes return 200 with
  expected headings; Clerk sign-in/up render in test mode; phone navigation has no horizontal overflow.
- Vercel protects Preview only; Production is public. No Production seed or learner-data write ran.
- OI-026 was rechecked immediately before publication: 4 production / 13 total advisories and no
  compatible production fix. OI-034 still requires live Clerk keys before real users.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Open A2 with the <=5-bullet wave briefing and Mike's plan approval before implementation.
2. Continue C2 with a1-05 through validator zero errors and independent L2 PASS.
3. Promote OI-034 before real users and recheck OI-026 on patched upstream releases.
4. Curated Practice Sets are MVP wave A6; fixture-backed UI prototyping may precede A6, while the
   production path waits for A5 dependencies. Custom-topic generation follows in A9.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · curated Practice Sets are MVP (ADR-0015/A6); wordfreq informs original
  selection rather than becoming a copied shippable table.
