---
name: ship
description: Promote verified main to production and append RELEASES.md. Use when the operator says /ship.
---

# /ship

1. Confirm all four preconditions or refuse:
   - Last `/check` green on current `main` (run `/check` if stale)
   - No open high-severity blocking Work `fix` (founder judgment)
   - Preview deploy verified
   - No `contested` spec among features shipping
2. Deploy production.
3. Append `Docs/RELEASES.md`.
4. Activity `type: ship`. Report release id.

**May invoke:** `/check`.  
**Must not:** ship on red check / open FAIL / contested spec.
