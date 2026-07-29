# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-29 (A1-H proven/merged; operator reports local test looks good)

## Position

**Lane A — App (ACTIVE: A1 `/close` verification)**
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
- Fresh public remote `AgoraLabsGit/aidioma` is live; proven `main` was pushed on 2026-07-28 for Vercel/Neon setup.
- No Vercel deployment exists. This session has not pushed or deployed.
- Mike reported the local `/close` test "Looks good". Explicit `VERIFIED` and publication `GO`
  have not been recorded, so A1 remains active and unpublished.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Record Mike's explicit `VERIFIED`; recheck OI-026, then request the separate publication `GO`.
2. Continue C2 with a1-05 through validator zero errors and independent L2 PASS.
3. On explicit GO only: push `main`, wait for Vercel, then run public route + Clerk smoke and close A1.
4. Recheck OI-026 and promote OI-034 before real users; keep both lanes isolated.
5. Curated Practice Sets are MVP wave A6; fixture-backed UI prototyping may precede A6, while the
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
