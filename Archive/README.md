# Archive — non-authoritative source vault

Current application design lives only in `Docs/`. This root archive holds source/code artifacts
that are useful for forensic reference but must never drive implementation decisions.

- `Legacy-Apps/` is intentionally Git-ignored. It contains old nested Git history and `.env`
  files; treat it as sensitive local material and never stage or push it.
- The temporary A0 prototype remains under `apps/prototype/` until the production flow replaces
  it. Historical documents live in `Docs/Archive/` and are indexed by its catalog.

Before reusing anything from this vault, re-evaluate it against current ADRs, Specs, security
requirements, and licenses. Legacy “complete” claims are not evidence.
