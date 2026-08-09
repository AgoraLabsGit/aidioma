#!/usr/bin/env bash
# Serve dashboard from Docs home (D-020) even when invoked from a phase/task worktree.
# Forwards CLI args (e.g. --port) and PRAXIS_DASHBOARD_PORT (D-057).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
START_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

resolve_primary() {
  local start="$1"
  local primary
  primary="$(git -C "$start" worktree list --porcelain 2>/dev/null | awk '/^worktree /{print $2; exit}')"
  if [[ -n "${primary:-}" && -d "$primary" ]]; then
    echo "$primary"
    return 0
  fi
  echo "$start"
}

PRIMARY="$(resolve_primary "$START_ROOT")"
DOCS_HOME="${AIDIOMA_DOCS_HOME:-${PRAXIS_DOCS_HOME:-$PRIMARY/.worktrees/docs}}"

pick_server() {
  local candidate
  for candidate in \
    "$DOCS_HOME/Docs/System/dashboard/server.ts" \
    "$PRIMARY/Docs/System/dashboard/server.ts" \
    "$START_ROOT/Docs/System/dashboard/server.ts"
  do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

SERVER="$(pick_server || true)"
if [[ -z "${SERVER:-}" ]]; then
  echo "error: dashboard server.ts not found (Docs home / primary / local)" >&2
  exit 1
fi

PUBLIC_INDEX="$(dirname "$SERVER")/public/index.html"
if [[ ! -f "$PUBLIC_INDEX" ]]; then
  echo "error: missing $PUBLIC_INDEX" >&2
  echo "hint: npm run work:docs-home && npm run work:dashboard (from primary)" >&2
  exit 1
fi

# Run with the checkout that owns the server (Docs home when present).
cd "$(cd "$(dirname "$SERVER")/../../.." && pwd)"
exec npx tsx "$SERVER" "$@"
