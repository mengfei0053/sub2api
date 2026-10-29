#!/usr/bin/env bash
# Compare frontend/ (upstream-aligned) with frontend_self/ (local customization fork).
# Run after syncing upstream to see whether frontend_self needs an update.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
FRONTEND_SELF="$ROOT/frontend_self"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

EXCLUDES=(
  --exclude node_modules
  --exclude dist
  --exclude .vite
  --exclude coverage
  --exclude '*.local'
  --exclude '*.tsbuildinfo'
  --exclude tmp
)

if [[ ! -d "$FRONTEND" ]]; then
  echo "Error: frontend/ not found at $FRONTEND" >&2
  exit 1
fi

if [[ ! -d "$FRONTEND_SELF" ]]; then
  echo "Error: frontend_self/ not found at $FRONTEND_SELF" >&2
  exit 1
fi

section() {
  printf '\n%s%s%s\n' "$BOLD" "$1" "$NC"
}

count_rsync_diff() {
  local from="$1"
  local to="$2"
  rsync -rcn "${EXCLUDES[@]}" "$from/" "$to/" 2>/dev/null | wc -l | tr -d ' '
}

list_rsync_diff() {
  local from="$1"
  local to="$2"
  rsync -rcn "${EXCLUDES[@]}" "$from/" "$to/" 2>/dev/null | sed 's/^/  /'
}

echo ""
section "frontend / frontend_self 同步检查"
echo "  frontend      → 上游对齐的标准前端"
echo "  frontend_self → 本地定制前端（需手动跟进 upstream 变更）"

# --- Git: frontend changes since upstream (if remote exists) ---
if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  section "1. 本次相对 upstream 的 frontend/ 变更"

  UPSTREAM_REF=""
  for ref in upstream/main upstream/master origin/upstream/main; do
    if git -C "$ROOT" rev-parse --verify "$ref" >/dev/null 2>&1; then
      UPSTREAM_REF="$ref"
      break
    fi
  done

  if [[ -n "$UPSTREAM_REF" ]]; then
    MERGE_BASE="$(git -C "$ROOT" merge-base HEAD "$UPSTREAM_REF" 2>/dev/null || true)"
    if [[ -n "$MERGE_BASE" ]]; then
      FE_CHANGED="$(git -C "$ROOT" diff --name-only "$MERGE_BASE"..HEAD -- frontend/ 2>/dev/null | wc -l | tr -d ' ')"
      if [[ "$FE_CHANGED" -gt 0 ]]; then
        printf "${YELLOW}  ⚠ frontend/ 有 %s 个文件相对 %s 有变更${NC}\n" "$FE_CHANGED" "$UPSTREAM_REF"
        git -C "$ROOT" diff --stat "$MERGE_BASE"..HEAD -- frontend/ | sed 's/^/  /'
        echo ""
        git -C "$ROOT" diff --name-only "$MERGE_BASE"..HEAD -- frontend/ | sed 's/^/  /'
      else
        printf "${GREEN}  ✓ 当前分支相对 %s，frontend/ 无新增变更${NC}\n" "$UPSTREAM_REF"
      fi
    fi
  else
    echo "  （未配置 upstream remote，跳过 git 对比）"
    echo "  提示: git remote add upstream https://github.com/Wei-Shaw/sub2api.git"
  fi

  section "2. 工作区未提交的 frontend/ 变更"
  UNCOMMITTED="$(git -C "$ROOT" status --porcelain -- frontend/ 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$UNCOMMITTED" -gt 0 ]]; then
    printf "${YELLOW}  ⚠ frontend/ 有 %s 项未提交变更${NC}\n" "$UNCOMMITTED"
    git -C "$ROOT" status --short -- frontend/ | sed 's/^/  /'
  else
    printf "${GREEN}  ✓ frontend/ 工作区干净${NC}\n"
  fi
fi

# --- Directory diff: frontend vs frontend_self ---
section "3. frontend → frontend_self 目录差异"
TO_SELF="$(count_rsync_diff "$FRONTEND" "$FRONTEND_SELF")"
if [[ "$TO_SELF" -gt 0 ]]; then
  printf "${YELLOW}  ⚠ frontend 有 %s 个文件/目录与 frontend_self 不同（可能需要同步到 frontend_self）${NC}\n" "$TO_SELF"
  list_rsync_diff "$FRONTEND" "$FRONTEND_SELF"
else
  printf "${GREEN}  ✓ frontend 与 frontend_self 内容一致${NC}\n"
fi

section "4. frontend_self 独有定制（相对 frontend）"
SELF_ONLY="$(count_rsync_diff "$FRONTEND_SELF" "$FRONTEND")"
if [[ "$SELF_ONLY" -gt 0 ]]; then
  printf "${CYAN}  ℹ frontend_self 有 %s 项与 frontend 不同（含本地定制，合并时需人工处理）${NC}\n" "$SELF_ONLY"
  list_rsync_diff "$FRONTEND_SELF" "$FRONTEND"
else
  echo "  （无独有差异）"
fi

# --- Lockfile ---
section "5. 依赖锁文件"
if ! cmp -s "$FRONTEND/pnpm-lock.yaml" "$FRONTEND_SELF/pnpm-lock.yaml" 2>/dev/null; then
  printf "${YELLOW}  ⚠ pnpm-lock.yaml 不一致，若同步代码后请在 frontend_self/ 执行 pnpm install${NC}\n"
else
  printf "${GREEN}  ✓ pnpm-lock.yaml 一致${NC}\n"
fi

# --- Recommendation ---
section "建议操作"
if [[ "$TO_SELF" -gt 0 ]] || [[ "${FE_CHANGED:-0}" -gt 0 ]]; then
  cat <<'EOF'
  上游 frontend/ 有变更时，请评估是否同步到 frontend_self/：

  # 预览差异（不写入）
  rsync -rcn --exclude node_modules --exclude dist --exclude .vite --exclude coverage \
    frontend/ frontend_self/

  # 仅同步上游文件（保留 frontend_self 独有文件，合并冲突需人工处理）
  rsync -av --exclude node_modules --exclude dist --exclude .vite --exclude coverage \
    frontend/ frontend_self/

  # 同步后重装依赖并验证
  cd frontend_self && pnpm install && pnpm run typecheck && pnpm run lint:check

  若 frontend_self 有大量本地 UI 定制，建议逐目录 cherry-pick，不要整目录覆盖。
EOF
else
  printf "${GREEN}  当前无需同步 frontend → frontend_self。${NC}\n"
fi
echo ""
