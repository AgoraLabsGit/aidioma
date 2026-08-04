# Archive — non-authoritative source vault

Current application design lives only in `Docs/`. This root archive holds source/code artifacts
that are useful for forensic reference but must never drive implementation decisions.

- `Legacy-Apps/` is intentionally Git-ignored. It contains old nested Git history and `.env`
  files; treat it as sensitive local material and never stage or push it.
- The temporary A0 prototype remains under `apps/prototype/` only as the current runnable founder
  review surface for lessons 2 and 3. Historical documents live in `Docs/Archive/`.

Before reusing anything from this vault, re-evaluate it against current ADRs, Specs, security
requirements, and licenses. Legacy “complete” claims are not evidence.
