# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-28 (A1-2 proven; C2 a1-04 L2-passed)

## Position

**Lane A — App (ACTIVE: A1-H next)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- A1-1R is proven: the four responsive screens now use the approved prototype shell, tokens, density, and navigation with truthful zero states.
- Proof covers 16 route/theme/viewport states, axe, keyboard focus, reduced motion, 200% text, exact route state, and no horizontal overflow.
- A1-2 is proven: the web app imports the shared contract; Content CI is live; checksum-journaled
  SQL and the idempotent seed loaded 4 canonical lessons / 134 items into real Neon with zero-change reruns.
- Vercel `agoralabs/aidioma` tracks the public GitHub repo at `apps/web` on Node 22.x; free Neon is
  attached across environments. Production Clerk keys and an initial deployment remain operator setup.
- OI-026 tracks unpatched upstream Next/ESLint dependency advisories before deployment.
- Fresh public remote `AgoraLabsGit/aidioma` is live; proven `main` was pushed on 2026-07-28 for Vercel/Neon setup.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Run A1-H residue/dependency/spec reconciliation, then prepare A1 for `/close`.
2. Continue C2 with a1-05 through validator zero errors and independent L2 PASS.
3. Add both Clerk keys plus the four route variables before production auth/deployment verification.
4. Keep both lanes isolated; never push without wave-close GO.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · **frequency decks = post-MVP (PM-015)**; wordfreq stays the lesson vocab check.
