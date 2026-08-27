# Content tooling — checks and developer utilities

This directory contains executable developer tools that operate on `content/`: the validator,
counter-example fixtures, and validator configuration/snapshots.

These files are not lesson material and are not imported by the production app. The application
and tools share the contract from `@aidioma/lesson-schema`; run them through the root
`npm run content:*` commands.

Validator check 5 requires every ordinary vocab item to appear in an own-lesson sentence. Vocab
members sharing a P-003 `setId` are checked as one partition: at least one member must appear, which
represents the closed set without exempting an entirely unused set. Fixtures cover both outcomes.

Typed practice defaults to Both directions. The validator therefore reports an empty sentence
`acceptedEn` array for review as well as enforcing the Spanish alternate-count policy; canonical
`en`/`es` values always join their grading accept sets in the consumer and are not duplicated in
authored alternate arrays.

The Phase 2 dialect proof is a parallel fail-closed gate for reusable semantic units; it does not
change the frozen lesson format or reinterpret legacy country `region` tags. Build the shared
schema, then verify the retained unit, deterministic report, independent review, and promotion
receipt:

```sh
npm run contract:build --silent
npx tsx tooling/content/dialect-contract.ts check
npx tsx tooling/content/dialect-contract.ts verify
npx tsx tooling/content/fixtures/run-dialect-fixtures.ts
```

`check` validates the unit, retained identity snapshot, and deterministic report before promotion.
`verify`, `render`, and
`grade` require the full evidence chain and refuse to return learner content if any evidence is
missing, failed, or stale. Use `--profile es-AR|es-419|es-ES`; grading also requires `--answer`.
Promotion authority is retained as portable JSON and matched to the canonical closed phase file,
so CI depends only on authored repository evidence.
The existing root `npm run content:fixtures` command invokes the dialect counter-examples, keeping
the promotion gate inside the repository's canonical Content CI path.
