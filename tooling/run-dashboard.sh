#!/usr/bin/env bash
# Serve dashboard from Docs home when present so Docs/System/dashboard/public matches D-020.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NESTED="$ROOT/.worktrees/docs/Docs/System/dashboard/server.ts"
LOCAL="$ROOT/Docs/System/dashboard/server.ts"
if [[ -f "$NESTED" ]]; then
  exec npx tsx "$NESTED"
fi
exec npx tsx "$LOCAL"
