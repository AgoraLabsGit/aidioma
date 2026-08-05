# AIdioma documentation

This is the canonical documentation root. The tested application and executable contracts remain
authoritative for implemented behavior; draft specifications are reviewed planning inputs.

## Authority

1. `apps/web/`, `packages/lesson-schema/`, `content/`, migrations, and tests prove current behavior.
2. `PRODUCT.md` records approved product principles after founder review.
3. `Specs/*.md` separate implemented truth from accepted, candidate, research, and conflicting claims.
4. `WORK.yaml` is the only roadmap, feature registry, and systemic open-work queue.
5. `FIXES.yaml` is the bounded defect/task queue.
6. `HANDOFF.md` is current continuity and is overwritten by `/close`; Git preserves history.

Draft specs are not implementation authority. `/plan` moves an item from open to planned only after
discussion, a 2-4-agent design panel, draft, independent adversarial audit, revision, and founder
approval. `/feat` implements one approved slice. `/fix` handles bounded defects. `/status` is read
only. `/close` validates, reconciles, publishes, cleans Git, and rewrites the handoff.

## Development cycle

AIdioma designs just ahead of implementation. Each product cycle chooses one learner-visible
outcome, presents at most three consequential founder decisions, designs the minimum supporting
contracts, implements the complete path in the real application, proves success and failure states,
reviews how the new parts compose, and reconciles documentation with the evidence. A foundation must
earn its implementation through a real consumer rather than presumed future reuse. After every two
or three related capabilities, the owning work item receives a broader composition review before a
shared abstraction expands. `AGENTS.md` and the AIdioma development skill own the operational rules.

## Product architecture map

[ARCHITECTURE.md](ARCHITECTURE.md) explains in learner-facing language how AIdioma's surfaces,
learning engines, bridges, memory, and platform foundations are intended to work together. It is a
navigation map with mixed implementation status, not a second roadmap or implementation authority.

## Recommended planning order

1. Product language and authority
2. Practice serving and reinforced scheduling
3. Evaluation and feedback
4. Practice page and Settings
5. Progress, saved material, and persistence
6. Lessons and shared capability reuse
7. Content generation and review
8. UI system, platform, and security

The pre-reset documentation is preserved in Git at
`b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a`. Historical claims retained in draft dossiers remain
deferred until their owning `/plan` session; migration did not approve them as product behavior.
