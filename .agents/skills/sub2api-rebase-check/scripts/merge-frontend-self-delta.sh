#!/usr/bin/env bash
# 3-way merge upstream frontend/src delta into frontend_self/src.
# Preserves EbeeAI customizations when present; takes upstream when self == base.
#
# Usage:
#   merge-frontend-self-delta.sh <from-ref> <to-ref>
# Example:
#   merge-frontend-self-delta.sh v0.1.151 v0.1.161
#
# Never overwrites: frontend_self/public/logo.png
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <upstream-from-ref> <upstream-to-ref>" >&2
  exit 2
fi

FROM_REF="$1"
TO_REF="$2"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT
LOG="$TMPDIR/merge.log"

echo "merge-frontend-self-delta: $FROM_REF .. $TO_REF"

# Sync package.json deps that CI needs (devDep + overrides) carefully:
# - add any missing dependency keys from upstream package.json
# - union pnpm.overrides (upstream wins on key collision for security pins)
if [[ -f frontend/package.json && -f frontend_self/package.json ]]; then
  python3 - <<'PY'
import json
from pathlib import Path

up = json.loads(Path("frontend/package.json").read_text())
self = json.loads(Path("frontend_self/package.json").read_text())
changed = False
for section in ("dependencies", "devDependencies"):
    u = up.get(section) or {}
    s = self.setdefault(section, {})
    for k, v in u.items():
        if k not in s:
            s[k] = v
            changed = True
            print(f"package.json +{section}.{k}={v}")
        elif s[k] != v:
            print(f"package.json keep {section}.{k}: self={s[k]} upstream={v}")
uov = (up.get("pnpm") or {}).get("overrides") or {}
sov = self.setdefault("pnpm", {}).setdefault("overrides", {})
for k, v in uov.items():
    if sov.get(k) != v:
        sov[k] = v
        changed = True
        print(f"package.json overrides[{k}]={v}")
if changed:
    for section in ("dependencies", "devDependencies"):
        if section in self:
            self[section] = dict(sorted(self[section].items(), key=lambda kv: kv[0].lower()))
    Path("frontend_self/package.json").write_text(json.dumps(self, indent=2) + "\n")
    print("package.json updated")
else:
    print("package.json already aligned on deps/overrides keys")
PY
fi

while IFS=$'\t' read -r status path rest; do
  [[ -z "${status:-}" || -z "${path:-}" ]] && continue

  # renames: R100\told\tnew
  if [[ "$status" == R* ]]; then
    old_path="$path"
    new_path="${rest:-}"
    if [[ -z "$new_path" ]]; then
      echo "WARN bad rename line: $status $path" | tee -a "$LOG"
      continue
    fi
    rel_old="${old_path#frontend/}"
    rel_new="${new_path#frontend/}"
    dest_old="frontend_self/$rel_old"
    dest_new="frontend_self/$rel_new"
    mkdir -p "$(dirname "$dest_new")"
    if [[ -f "$dest_old" ]]; then
      mv "$dest_old" "$dest_new"
      echo "REN $rel_old -> $rel_new" | tee -a "$LOG"
    else
      cp "frontend/$rel_new" "$dest_new"
      echo "REN-COPY $rel_new" | tee -a "$LOG"
    fi
    path="$new_path"
    status="M"
  fi

  rel="${path#frontend/}"
  if [[ "$rel" == "public/logo.png" ]]; then
    echo "SKIP protected $rel" | tee -a "$LOG"
    continue
  fi

  dest="frontend_self/$rel"
  src="frontend/$rel"
  base_file="$TMPDIR/base"

  case "$status" in
    A*)
      mkdir -p "$(dirname "$dest")"
      cp "$src" "$dest"
      echo "ADD $rel" | tee -a "$LOG"
      ;;
    D*)
      if [[ -f "$dest" ]]; then
        if git show "$FROM_REF:frontend/$rel" >"$base_file" 2>/dev/null && cmp -s "$dest" "$base_file"; then
          rm -f "$dest"
          echo "DEL $rel" | tee -a "$LOG"
        else
          echo "KEEP-DEL-CUSTOM $rel" | tee -a "$LOG"
        fi
      else
        echo "DEL-ALREADY-GONE $rel" | tee -a "$LOG"
      fi
      ;;
    M*)
      if [[ ! -f "$dest" ]]; then
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
        echo "COPY-MISSING $rel" | tee -a "$LOG"
        continue
      fi
      if cmp -s "$dest" "$src"; then
        echo "MATCH $rel" | tee -a "$LOG"
        continue
      fi
      if ! git show "$FROM_REF:frontend/$rel" >"$base_file" 2>/dev/null; then
        cp "$src" "$dest"
        echo "NOBASE-UPSTREAM $rel" | tee -a "$LOG"
        continue
      fi
      if cmp -s "$dest" "$base_file"; then
        cp "$src" "$dest"
        echo "TAKE-UPSTREAM $rel" | tee -a "$LOG"
        continue
      fi
      merged="$TMPDIR/merged"
      set +e
      git merge-file -p "$dest" "$base_file" "$src" >"$merged" 2>"$TMPDIR/err"
      rc=$?
      set -e
      if [[ $rc -gt 1 ]]; then
        echo "ERR $rel: $(cat "$TMPDIR/err")" | tee -a "$LOG"
        cp "$src" "$dest"
        echo "FALLBACK-UPSTREAM $rel" | tee -a "$LOG"
        echo "  NOTE: re-apply EbeeAI theme markers manually if this file was customized" | tee -a "$LOG"
      elif [[ $rc -eq 1 ]]; then
        cp "$merged" "$dest"
        echo "CONFLICT $rel" | tee -a "$LOG"
      else
        cp "$merged" "$dest"
        echo "MERGED $rel" | tee -a "$LOG"
      fi
      ;;
    *)
      echo "UNKNOWN status=$status path=$path" | tee -a "$LOG"
      ;;
  esac
done < <(git diff --name-status "$FROM_REF" "$TO_REF" -- frontend/src/)

echo
echo "=== merge summary ==="
if [[ -f "$LOG" ]]; then
  awk '{print $1}' "$LOG" | sort | uniq -c | sort -rn || true
  echo
  if grep -q '^CONFLICT ' "$LOG"; then
    echo "CONFLICTS (resolve markers <<<<<<<):"
    grep '^CONFLICT ' "$LOG" || true
    # list files still containing markers
    if grep -RIl '^<<<<<<<' frontend_self/src 2>/dev/null; then
      echo "Files still containing conflict markers above — resolve before audit."
    fi
  fi
  if grep -q '^FALLBACK-UPSTREAM ' "$LOG"; then
    echo "FALLBACKS (re-check theme):"
    grep '^FALLBACK-UPSTREAM ' "$LOG" || true
  fi
  cp "$LOG" /tmp/frontend_self_merge.log
  echo "Wrote /tmp/frontend_self_merge.log"
fi

echo
echo "NEXT: if package.json overrides/deps changed, refresh lockfile with pnpm 9 (NOT v11):"
echo "  (cd frontend_self && CI=true pnpm install --no-frozen-lockfile)"
echo "Resolve any <<<<<<< conflict markers, re-apply theme on FALLBACK files, then:"
echo "  .agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh $FROM_REF $TO_REF --old-self-ref release/v${FROM_REF#v}"
