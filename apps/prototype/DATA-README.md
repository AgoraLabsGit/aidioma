# Prototype lesson data (`lesson-data.js`)

`lesson-data.js` is **auto-generated real lesson content** — the CI-validated lessons from
`content/lessons/**/*.json`, mapped into the shape the prototype's `LESSONS` object
uses. It assigns `window.AIDIOMA_LESSONS` and is loaded via a `<script src>` before the main
inline script in `index.html`. It is `file://`-safe (no `fetch`); do not edit it by hand.

## Regenerate (one command)

```sh
npm run prototype:export
```

The converter (`tooling/prototype/export-lessons.ts`) reads every lesson, parses it through
`@aidioma/lesson-schema` (fails loud on drift), and rewrites this file. It is
idempotent/re-runnable — the remaining 11 lessons will regenerate it in the same scheme.

## Key scheme & mock lessons

- Each lesson maps to key `l<ordinal>` (a1-01 → `l1`).
- `index.html` merges real data **over** the mock lessons:
  `const LESSONS = Object.assign({}, MOCK_LESSONS, window.AIDIOMA_LESSONS || {})`.
- So `l1` is now real content; **mock `l2`/`l3`/`l4` remain** so the multi-lesson /
  blend / preview UI states still demo. If `lesson-data.js` is absent, the app falls back
  to mock-only. `npm run prototype:check` is the deterministic freshness gate.

## Shape mapping (schema → prototype phase item)

| Schema             | Prototype phase | Shape |
|--------------------|-----------------|-------|
| `vocab`            | `words`         | `{ type:'flash', es, en, pos, accEs, accEn, hint }` |
| `sentences`        | `sentences`     | `{ type:'tr', es, en, accEs, accEn, hint }` |
| `passage.segments` | `story`         | `{ type:'seg', context, es, accept, show, hint }` |
| `quickChecks`      | `quiz`          | `{ type:'mc', label, prompt, options, correct, why, hint }` |
| `conversation`     | (lesson metadata) | attached as `lesson.conversation`; no UI consumer yet |

**Synthesized** (prototype wants it, schema has no source): `lesson.prof` (demo-only bar, `92`);
`vocab.hint` (built from the example pair); `passage-seg.hint` and `quiz.hint` (generic nudges).
**Dropped** (no prototype slot): `sentence.difficulty`. `openingLineGloss` is included when present.

## The app track owns `index.html`

Our integration is **2 surgical, additive changes** to `index.html`:

1. Added one line loading the data before the main script:
   `<script src="lesson-data.js"></script>` (with a comment).
2. Renamed the mock object `const LESSONS = {…}` → `const MOCK_LESSONS = {…}` and, right
   after it, added `const LESSONS = Object.assign({}, MOCK_LESSONS, window.AIDIOMA_LESSONS || {});`.

Nothing else was restructured, restyled, or refactored. The lesson-selector button label
("Lesson 1 · Greetings") is static HTML owned by the app track and was left untouched; the
catalog/path rows show a1-01's real title automatically because `lessonRow` reads `LESSONS[sel].title`.
