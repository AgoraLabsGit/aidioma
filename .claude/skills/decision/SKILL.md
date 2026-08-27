---
name: decision
description: Record a durable product or architecture choice in Docs/DECISIONS.md.
---

# /decision

Append one entry using `Docs/Development/Templates/decision-entry.md`. Name the alternatives, why
the selected option won, affected specs, and a concrete revisit condition. Amend the affected
product/spec contracts in the same change. Supersede with a new entry; do not rewrite history.
Run `npm run docs:check`.
