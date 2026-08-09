#!/usr/bin/env bash
# D-020 — ensure permanent Docs home worktree at .worktrees/docs (branch docs/ssot).
# When already present and clean: fast-forward onto origin/main (or local main) so the
# dashboard/SSOT tip does not lag after merges.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
WT="$ROOT/.worktrees/docs"

refresh_docs_home() {
  local target=""
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    target="origin/main"
  elif git rev-parse --verify main >/dev/null 2>&1; then
    target="main"
  else
    echo "Docs home present: $WT (no main tip to refresh against)"
    return 0
  fi
  if [[ -n "$(git -C "$WT" status --porcelain)" ]]; then
    echo "Docs home present (dirty, skip refresh): $WT @ $(git -C "$WT" rev-parse --short HEAD) ($(git -C "$WT" branch --show-current 2>/dev/null || echo '?'))"
    return 0
  fi
  git -C "$WT" fetch origin --prune >/dev/null 2>&1 || true
  if git -C "$WT" merge --ff-only "$target" >/dev/null 2>&1; then
    echo "Docs home refreshed: $WT @ $(git -C "$WT" rev-parse --short HEAD) (ff → $target)"
  else
    echo "Docs home present (not ff-able onto $target): $WT @ $(git -C "$WT" rev-parse --short HEAD)"
  fi
}

if [[ -d "$WT/.git" || -f "$WT/.git" ]]; then
  refresh_docs_home
  exit 0
fi
mkdir -p "$ROOT/.worktrees"
if git show-ref --verify --quiet refs/heads/docs/ssot; then
  git worktree add "$WT" docs/ssot
else
  git worktree add -b docs/ssot "$WT" main
fi
echo "Docs home ready: $WT (branch docs/ssot)"
echo "Write Docs/, .work/, AGENTS.md, CLAUDE.md, .claude/skills/ here only."
refresh_docs_home
