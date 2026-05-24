# frontend_self

`frontend_self/` 是 [`frontend/`](../frontend/) 的本地定制副本，用于 EbeeAI 独立 UI 改造（例如 Stitch 设计稿落地），同时保持 `frontend/` 与上游 **Wei-Shaw/sub2api** 对齐。

## 日常开发规则（必读）

| 目录 | 何时修改 |
|------|----------|
| **`frontend_self/`** | **所有本地功能、UI、行为定制**（EbeeAI 控制台、主题、样式等）只改这里 |
| **`frontend/`** | **仅在上游同步时**修改（`git merge upstream/main` 等），使内容与上游分支一致；**不要**为本地需求直接改此目录 |

本地运行与 Docker 发布（EbeeAI）均使用 `frontend_self/` 构建，改错目录会导致线上看不到改动，或下次同步 upstream 时产生多余 diff。

## 目录关系

| 目录 | 用途 |
|------|------|
| `frontend/` | 跟踪上游的标准前端；**仅在上游同步时**更新，与 upstream 保持一致 |
| `frontend_self/` | **日常开发目录**；本地定制前端；按需从 `frontend/` 同步上游变更 |

## 同步上游后必做

每次 `git fetch upstream && git merge upstream/main`（或 rebase）之后：

```bash
# 从仓库根目录运行
make check-frontend-self-sync
# 或
bash tools/check_frontend_self_sync.sh
```

脚本会提示：

1. 本次 merge 中 `frontend/` 相对 upstream 改了哪些文件
2. `frontend/` 与 `frontend_self/` 的差异
3. `frontend_self/` 有哪些本地独有改动（合并时需保留）
4. `pnpm-lock.yaml` 是否一致

## 何时需要同步到 frontend_self

| 上游变更类型 | 建议 |
|-------------|------|
| API 类型、路由、i18n key、stores | **通常需要同步**，否则运行时可能报错 |
| 共享组件 bug 修复 | **建议同步** |
| 仅 admin/ops 等功能页 | 视你是否改动了同一文件而定 |
| 全新页面/功能 | 若 `frontend_self` 不需要该功能可跳过 |
| 本地 UI 已重写的页面 | **不要整文件覆盖**；手动合并或 cherry-pick |

## 同步命令示例

```bash
# 1. 预览（不写入）
rsync -rcn \
  --exclude node_modules --exclude dist --exclude .vite --exclude coverage \
  frontend/ frontend_self/

# 2. 同步（会覆盖同名文件，请先确认 diff）
rsync -av \
  --exclude node_modules --exclude dist --exclude .vite --exclude coverage \
  frontend/ frontend_self/

# 3. 依赖与校验
cd frontend_self
pnpm install
pnpm run typecheck
pnpm run lint:check
```

## 开发与构建

```bash
cd frontend_self
pnpm install
pnpm run dev      # 开发服务器
pnpm run build    # 生产构建
```

根目录 `Makefile` 的 `make test` / `make build` 仍针对 `frontend/`。验证 `frontend_self` 请在上述目录单独执行命令。

## 详细说明

见 [DEV_GUIDE.md](../DEV_GUIDE.md) 中的「同步上游与 frontend_self」章节。
