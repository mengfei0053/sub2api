#!/usr/bin/env bash
# Sub2API frontend_self rebase check (strict).
#
# Usage:
#   check-sub2api-rebase.sh <upstream-from-ref> <upstream-to-ref> [--old-self-ref REF] [--json out.json]
#
# Exit 0 only when ALL hard gates pass:
#   coverage, integrity, locale, theme, lockfile, brand, features/routes
#
# Exact-match differs for themed files are EXPECTED and do not fail the audit
# when 3-way integrity + theme markers pass.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <upstream-from-ref> <upstream-to-ref> [--old-self-ref REF] [--json out.json]" >&2
  echo "Example: $0 v0.1.151 v0.1.161 --old-self-ref release/v0.1.151" >&2
  exit 2
fi

from_ref="$1"
to_ref="$2"
shift 2

old_self_ref=""
json_out=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --old-self-ref)
      old_self_ref="${2:-}"
      shift 2
      ;;
    --json)
      json_out="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d frontend/src || ! -d frontend_self/src ]]; then
  echo "FAIL: expected frontend/src and frontend_self/src under $repo_root" >&2
  exit 1
fi

# Default old-self-ref to release/vX.Y.Z derived from from_ref when it is a tag
if [[ -z "$old_self_ref" ]]; then
  if [[ "$from_ref" == v* ]]; then
    candidate="release/${from_ref}"
    if git rev-parse --verify "$candidate" >/dev/null 2>&1; then
      old_self_ref="$candidate"
    fi
  fi
fi

echo "Sub2API rebase check (strict audit)"
echo "repo: $repo_root"
echo "upstream range: $from_ref..$to_ref"
[[ -n "$old_self_ref" ]] && echo "old_self_ref: $old_self_ref"
echo

# Legacy quick listing (non-gating): helps humans scan MATCH vs differs
echo "1. Quick file listing (differs are expected for themed files)"
failed_list=0
while IFS=$'\t' read -r status path; do
  [[ -z "${status:-}" || -z "${path:-}" ]] && continue
  rel="${path#frontend/src/}"
  target="frontend_self/src/$rel"
  case "$status" in
    D)
      if [[ -e "$target" ]]; then
        echo "NOTE still exists after upstream deletion: $target"
      else
        echo "OK deleted in frontend_self: $target"
      fi
      ;;
    A|M|R*)
      # name-status may be R for renames — path is last field already from git when not using -M?
      if [[ ! -e "$target" ]]; then
        echo "FAIL missing: $target"
        failed_list=1
      elif cmp -s "frontend/src/$rel" "$target" 2>/dev/null; then
        echo "MATCH $target"
      else
        echo "DIFFERS (theme/custom ok if audit integrity passes): $target"
      fi
      ;;
    *)
      echo "WARN unhandled git status $status for $path"
      ;;
  esac
done < <(git diff --name-status "$from_ref..$to_ref" -- frontend/src)
echo

args=("$from_ref" "$to_ref")
[[ -n "$old_self_ref" ]] && args+=(--old-self-ref "$old_self_ref")
[[ -n "$json_out" ]] && args+=(--json "$json_out")

set +e
python3 "$script_dir/audit-frontend-self-sync.py" "${args[@]}"
audit_rc=$?
set -e

if [[ "$failed_list" -ne 0 ]]; then
  echo "FAIL: quick listing found missing files"
  exit 1
fi

exit "$audit_rc"
