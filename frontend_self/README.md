# frontend_self

`frontend_self/` 是 [`frontend/`](../frontend/) 的本地定制副本，用于独立 UI 改造（例如 Stitch 设计稿落地），同时保持 `frontend/` 与上游 **Wei-Shaw/sub2api** 对齐。

## 目录关系

| 目录 | 用途 |
|------|------|
| `frontend/` | 跟踪上游的标准前端；合并 upstream 时以这里为准 |
| `frontend_self/` | 本地定制前端；按需从 `frontend/` 同步上游变更 |

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
