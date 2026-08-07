#!/usr/bin/env bash
# D-020 — ensure permanent Docs home worktree at .worktrees/docs (branch docs/ssot).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
WT="$ROOT/.worktrees/docs"
if [[ -d "$WT/.git" || -f "$WT/.git" ]]; then
  echo "Docs home already present: $WT"
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
