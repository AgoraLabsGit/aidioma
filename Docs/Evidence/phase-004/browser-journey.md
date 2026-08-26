# PHASE-004 signed-in browser journey

Date: 2026-08-25
Result: pass

## Learner journey retained

The browser ran against the local Next.js application with the repository's dedicated
development-only Clerk proof user, development Neon database, and explicit AI Gateway credential.
The captured main-content region excludes account controls and contains no learner identifier.
The contextual exchange uses the approved scripted, non-personal fixture.

1. `01-signed-in-lesson-start.png` — the signed-in learner starts **Living here** in the active
   Argentine Spanish profile and sees the promoted teaching example.
2. `02-authored-hint-and-contextual-help.png` — the check exposes an authored hint and the bounded
   Ask AIdioma action returns a visibly labeled AI explanation.
3. `03-reload-retains-question.png` — a full page reload restores the same check position,
   contextual exchange, hint, and unanswered composer.
4. `04-miss-and-correction.png` — a deliberately non-profile answer receives retained feedback,
   the canonical correction, and the assisted-attempt notice without advancing the lesson.
5. `05-completion-unlocks-recommendation.png` — the corrected retry completes the lesson, exposes
   one concept and one topic review collection, and explains why **Present -ir forms** is next.
6. `06-recommended-review.png` — **Start recommended review** opens the existing Practice workspace
   on **Present -ir forms** with the same **You live here.** promoted source.

The short-lived Clerk sign-in tokens used by automation were revoked after each browser context.
No token, learner ID, provider secret, raw contextual response, or account control is recorded in
this report.

## Artifact hashes

| Artifact | SHA-256 |
|---|---|
| `01-signed-in-lesson-start.png` | `3951d1914418480b9b257dffcda746780e81a9fff2c1fc7084b5e7e2614a483e` |
| `02-authored-hint-and-contextual-help.png` | `8fa0232fd54de6ac28b462736741fd99cc09d87f12a419634f2ed3c28f974299` |
| `03-reload-retains-question.png` | `7e96ea145de892eb39494f24b4fa037b7b36b98050aa1e27ee086c46dfd649bf` |
| `04-miss-and-correction.png` | `0dc3443f071fa8dd3d4c8ce0ad47ef850d63fc0cfa68e7f1c228574b49b3cb1a` |
| `05-completion-unlocks-recommendation.png` | `307ae03f4cb80e06e11c511bdf542343a583da4f34d037850dc068072a377f38` |
| `06-recommended-review.png` | `970ef8038b8a4fb568c9402900044186570634ce80776cc8e1ed3d4f8ba22660` |

All captures are 798 × 1100 pixels.
