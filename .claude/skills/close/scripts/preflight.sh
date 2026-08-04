#!/usr/bin/env bash
set -euo pipefail

fetch=0
cleanup_audit=0
worktree_cleanup_audit=0
base_ref="origin/main"
target_ref="HEAD"

while (($#)); do
  case "$1" in
    --fetch) fetch=1 ;;
    --cleanup-audit) cleanup_audit=1 ;;
    --worktree-cleanup-audit) worktree_cleanup_audit=1 ;;
    --base)
      shift
      base_ref="${1:?--base requires a ref}"
      ;;
    --target)
      shift
      target_ref="${1:?--target requires a ref}"
      ;;
    *)
      echo "usage: $0 [--fetch] [--worktree-cleanup-audit] [--cleanup-audit] [--base REF] [--target REF]" >&2
      exit 2
      ;;
  esac
  shift
done

if ((cleanup_audit || worktree_cleanup_audit)) && [[ "$target_ref" != "origin/main" ]]; then
  echo "FAIL cleanup audits may prove containment only against origin/main" >&2
  exit 2
fi

repo_root="$(git rev-parse --show-toplevel)"
common_git_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
repo_family_root="$(dirname "$common_git_dir")"
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
echo "REPO DEV/PREVIEW SERVERS"
repo_server_processes="$({ ps -axo pid=,ppid=,command= || true; } | awk -v root="$repo_family_root/" '
  index($0, root) && ($0 ~ /node_modules\/[.]bin\/(next|vite)([[:space:]]|$)/ || $0 ~ /next-server([[:space:]]|$)/ || $0 ~ /vercel[[:space:]]+(dev|serve)([[:space:]]|$)/ || $0 ~ /tooling\/work-dashboard\/server[.]ts/) { print }
')"
if [[ -n "$repo_server_processes" ]]; then
  printf '%s\n' "$repo_server_processes"
  echo "FAIL repo_dev_preview_servers_running=1"
  exit 1
fi
echo "none"

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

if ((worktree_cleanup_audit)); then
  echo
  echo "TARGET WORKTREE CLEANUP AUDIT"
  worktree_cleanup_blockers=0
  primary_worktree="$(git worktree list --porcelain | sed -n 's/^worktree //p' | sed -n '1p')"

  while IFS= read -r worktree_path; do
    worktree_branch="$(git -C "$worktree_path" symbolic-ref --quiet --short HEAD || true)"
    [[ -n "$worktree_branch" ]] || worktree_branch="DETACHED"
    worktree_sha="$(git -C "$worktree_path" rev-parse HEAD)"
    dirty_count="$(git -C "$worktree_path" status --porcelain=v1 | wc -l | tr -d ' ')"
    if [[ "$worktree_path" == "$primary_worktree" ]]; then
      verdict="KEEP_PRIMARY"
    elif [[ "$dirty_count" != "0" ]]; then
      verdict="BLOCK_DIRTY"
      worktree_cleanup_blockers=$((worktree_cleanup_blockers + 1))
    elif ! git merge-base --is-ancestor "$worktree_sha" "$target_ref"; then
      verdict="BLOCK_UNCONTAINED"
      worktree_cleanup_blockers=$((worktree_cleanup_blockers + 1))
    else
      verdict="SAFE_REMOVE_AFTER_CLOSE"
    fi
    printf 'worktree %-58s | %-34s | %s\n' "$worktree_path" "$worktree_branch" "$verdict"
  done < <(git worktree list --porcelain | sed -n 's/^worktree //p')

  if ((worktree_cleanup_blockers)); then
    echo "FAIL worktree_cleanup_blockers=$worktree_cleanup_blockers"
    exit 1
  fi
  echo "PASS worktree_cleanup_blockers=0"
fi

if ((cleanup_audit)); then
  echo
  echo "POST-MERGE CLEANUP AUDIT VS TARGET"
  cleanup_blockers=0
  primary_worktree="$(git worktree list --porcelain | sed -n 's/^worktree //p' | sed -n '1p')"

  while IFS= read -r worktree_path; do
    worktree_branch="$(git -C "$worktree_path" symbolic-ref --quiet --short HEAD || true)"
    [[ -n "$worktree_branch" ]] || worktree_branch="DETACHED"
    worktree_sha="$(git -C "$worktree_path" rev-parse HEAD)"
    dirty_count="$(git -C "$worktree_path" status --porcelain=v1 | wc -l | tr -d ' ')"
    if [[ "$dirty_count" != "0" ]]; then
      verdict="BLOCK_DIRTY"
      cleanup_blockers=$((cleanup_blockers + 1))
    elif ! git merge-base --is-ancestor "$worktree_sha" "$target_ref"; then
      verdict="BLOCK_UNCONTAINED"
      cleanup_blockers=$((cleanup_blockers + 1))
    elif [[ "$worktree_path" == "$primary_worktree" ]]; then
      verdict="KEEP_PRIMARY_SWITCH_TO_MAIN"
    else
      verdict="SAFE_REMOVE_AFTER_MERGE"
    fi
    printf 'worktree %-58s | %-34s | %s\n' "$worktree_path" "$worktree_branch" "$verdict"
  done < <(git worktree list --porcelain | sed -n 's/^worktree //p')

  while IFS= read -r local_branch; do
    if [[ "$local_branch" == "main" ]]; then
      if git merge-base --is-ancestor "$local_branch" "$target_ref"; then
        verdict="KEEP_SYNC_TO_ORIGIN_MAIN"
      else
        verdict="BLOCK_MAIN_DIVERGED"
        cleanup_blockers=$((cleanup_blockers + 1))
      fi
    elif git merge-base --is-ancestor "$local_branch" "$target_ref"; then
      verdict="SAFE_DELETE_AFTER_WORKTREE_REMOVAL"
    else
      verdict="BLOCK_UNCONTAINED"
      cleanup_blockers=$((cleanup_blockers + 1))
    fi
    printf 'local    %-58s | %s\n' "$local_branch" "$verdict"
  done < <(git for-each-ref --format='%(refname:short)' refs/heads | LC_ALL=C sort)

  while IFS= read -r remote_branch; do
    [[ "$remote_branch" == "origin/HEAD" || "$remote_branch" == "origin/main" ]] && continue
    if git merge-base --is-ancestor "$remote_branch" "$target_ref"; then
      verdict="SAFE_DELETE_AFTER_PR_CLOSE"
    else
      verdict="BLOCK_UNCONTAINED"
      cleanup_blockers=$((cleanup_blockers + 1))
    fi
    printf 'remote   %-58s | %s\n' "$remote_branch" "$verdict"
  done < <(git for-each-ref --format='%(refname:short)' refs/remotes/origin | LC_ALL=C sort)

  if ((cleanup_blockers)); then
    echo "FAIL cleanup_blockers=$cleanup_blockers"
    exit 1
  fi
  echo "PASS cleanup_blockers=0"
fi
