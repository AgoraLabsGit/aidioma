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
