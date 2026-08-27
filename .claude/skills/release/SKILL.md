---
name: release
description: Record a verified AIdioma production release.
---

# /release

Use only after production publication and smoke proof succeed. Append one entry to
`Docs/RELEASES.md` from `Docs/Development/Templates/release-entry.md`, including the phase, close
receipt, deployment identity, and learner-visible summary. Never turn a local candidate or preview
deployment into a release claim. Run `npm run docs:check`.
