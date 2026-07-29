#!/usr/bin/env bash
set -euo pipefail

fetch=0
base_ref="origin/main"
target_ref="HEAD"

while (($#)); do
  case "$1" in
    --fetch) fetch=1 ;;
    --base)
      shift
      base_ref="${1:?--base requires a ref}"
      ;;
    --target)
      shift
      target_ref="${1:?--target requires a ref}"
      ;;
    *)
      echo "usage: $0 [--fetch] [--base REF] [--target REF]" >&2
      exit 2
      ;;
  esac
  shift
done

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if ((fetch)); then
  git fetch origin --prune
fi

git rev-parse --verify --quiet "$base_ref^{commit}" >/dev/null || {
  echo "FAIL missing base ref: $base_ref" >&2
  exit 1
}
git rev-parse --verify --quiet "$target_ref^{commit}" >/dev/null || {
  echo "FAIL missing target ref: $target_ref" >&2
  exit 1
}

branch="$(git symbolic-ref --quiet --short HEAD || true)"
[[ -n "$branch" ]] || branch="DETACHED"
head_sha="$(git rev-parse HEAD)"
base_sha="$(git rev-parse "$base_ref^{commit}")"
target_sha="$(git rev-parse "$target_ref^{commit}")"
read -r base_only head_only < <(git rev-list --left-right --count "$base_ref...HEAD")

echo "CLOSE PREFLIGHT"
echo "repo=$repo_root"
echo "branch=$branch"
echo "head=$head_sha"
echo "base=$base_ref $base_sha"
echo "target=$target_ref $target_sha"
echo "divergence base_only=$base_only head_only=$head_only"

for marker in MERGE_HEAD REBASE_HEAD CHERRY_PICK_HEAD REVERT_HEAD; do
  marker_path="$(git rev-parse --git-path "$marker")"
  if [[ -e "$marker_path" ]]; then
    echo "FAIL active_git_operation=$marker"
    exit 1
  fi
done

echo
echo "CURRENT WORKTREE"
git status --short --branch
git diff --check
git diff --cached --check

echo
echo "ALL WORKTREES"
while IFS= read -r worktree_path; do
  worktree_branch="$(git -C "$worktree_path" symbolic-ref --quiet --short HEAD || true)"
  [[ -n "$worktree_branch" ]] || worktree_branch="DETACHED"
  dirty_count="$(git -C "$worktree_path" status --porcelain=v1 | wc -l | tr -d ' ')"
  printf '%s | %s | dirty=%s\n' "$worktree_path" "$worktree_branch" "$dirty_count"
done < <(git worktree list --porcelain | sed -n 's/^worktree //p')

echo
echo "LOCAL BRANCHES VS TARGET"
while IFS= read -r local_branch; do
  local_sha="$(git rev-parse "$local_branch^{commit}")"
  if git merge-base --is-ancestor "$local_branch" "$target_ref"; then
    relation="contained"
  else
    relation="NOT_CONTAINED"
  fi
  printf '%-36s %s %s\n' "$local_branch" "$relation" "$local_sha"
done < <(git for-each-ref --format='%(refname:short)' refs/heads | LC_ALL=C sort)

echo
echo "REMOTE BRANCHES"
git for-each-ref --format='%(refname:short) %(objectname)' refs/remotes/origin | LC_ALL=C sort
