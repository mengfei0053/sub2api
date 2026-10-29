# EbeeAI 发布分支流程

这个服务把 EbeeAI 自己的部署改动维护在版本化 release 分支上，每个 release 分支都基于一个上游 Sub2API tag。

## 分支规则

每个上游版本使用一个 release 分支：

```text
release/v<上游版本号>
```

示例：

```text
release/v0.1.127
release/v0.1.128
```

分支名应当和它基于的上游 tag 保持一致。

## Tag 规则

发布 tag 同时包含上游 tag 版本号和 EbeeAI 服务版本号：

```text
v<上游tag版本号>_<EbeeAI版本号>
```

示例：

```text
v0.1.127_0.0.1
```

含义：

```text
上游 Sub2API 版本：0.1.127
EbeeAI 服务版本：0.0.1
```

GitHub Actions 的 EbeeAI 发布 workflow 为 `.github/workflows/ebeeai-release.yml`，只会在推送 `v<上游>_<EbeeAI>` tag 时发布镜像和 GitHub Release。

## 标准流程：在 release 分支上开发，发布新版本时 rebase 到上游 tag

EbeeAI 的自定义提交直接维护在**当前 release 分支**上（不再使用 `main_self`）。日常开发就在当前 release 分支上进行。发布新上游版本时：把当前 release 分支上的 EbeeAI 提交 rebase 到最新上游 tag → 切出对应新版本的新 release 分支 → 之后在新 release 分支上继续开发。上游提交在前，EbeeAI 提交在后。

### 前置条件

- `main` 已与上游同步、并已 fetch 到上游最新 tag（见同步上游分支流程）。
- 当前 release 分支（如 `release/v${PREV_VERSION}`）是最新的 EbeeAI 开发分支。

### 步骤

1. 确认版本号并设置变量（`PREV_VERSION` 是当前 release 基于的上游版本，`VERSION` 是要升到的新上游版本）：

```sh
export PREV_VERSION=0.1.131
export VERSION=0.1.132
export EBEEAI_VERSION=0.0.1
```

2. 从当前 release 分支切出新 release 分支，并把 EbeeAI 提交 rebase 到新上游 tag：

```sh
git switch release/v${PREV_VERSION}
git switch -c release/v${VERSION}
git rebase --onto v${VERSION} v${PREV_VERSION}
```

`--onto v${VERSION}` 是新的 base；`v${PREV_VERSION}` 是旧 base（只有当前 release 上、不在旧上游 tag 上的 EbeeAI 提交会被 replay）。原 `release/v${PREV_VERSION}` 分支保持不动。

3. 如果出现冲突，手动解决：

```sh
git diff --name-only --diff-filter=U
# 编辑冲突文件
git add <resolved-files>
git rebase --continue
```

4. 同步上游 `frontend/` 在 `${PREV_VERSION}→${VERSION}` 之间的变更到 `frontend_self/`（rebase 只 replay 我们的提交，不会自动并入上游新的前端改动）。运行 rebase 检查并按提示补齐：

```sh
.claude/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh v${PREV_VERSION} v${VERSION}
```

对差异/缺失文件做 3-way 合并或补齐，并把上游新增的 i18n key 并入 `frontend_self` 的 `en.ts`/`zh.ts`。注意保留 EbeeAI 定制（企业主题、首页 SEO 等）以及受保护资产 `frontend_self/public/logo.png`。

5. 确认 `backend/cmd/server/VERSION` 等于新上游版本：

```sh
echo "${VERSION}" > backend/cmd/server/VERSION
```

6. 验证：

```sh
cd frontend_self && pnpm run typecheck && cd ..
docker compose --env-file deploy_ebeeai/.env.example -f deploy_ebeeai/docker-compose.yml config --quiet
docker buildx build --check -f deploy_ebeeai/Dockerfile.backend .
docker buildx build --check -f deploy_ebeeai/Dockerfile.frontend_self .
docker buildx build --check -f deploy_ebeeai/Dockerfile.frontend_docs .
docker buildx build --check -f deploy_ebeeai/Dockerfile.gateway .
docker buildx build --check -f deploy_ebeeai/Dockerfile .
```

7. 推送新 release 分支：

```sh
git push -u origin release/v${VERSION}
```

8. 推送发布 tag，触发 GHCR 镜像发布：

```sh
git tag v${VERSION}_${EBEEAI_VERSION}
git push origin v${VERSION}_${EBEEAI_VERSION}
```

这个 tag 会触发 `.github/workflows/ebeeai-release.yml`，为 backend、app、docs、gateway 各发布一组 tag。每个 tag 都是 `linux/amd64` + `linux/arm64` 的 manifest：

```text
ghcr.io/<github-owner>/sub2api-ebeeai-{backend,app,docs,gateway}:<上游版本>_<EbeeAI版本>
ghcr.io/<github-owner>/sub2api-ebeeai-{backend,app,docs,gateway}:<上游版本>
ghcr.io/<github-owner>/sub2api-ebeeai-{backend,app,docs,gateway}:sha-<commit>
ghcr.io/<github-owner>/sub2api-ebeeai-{backend,app,docs,gateway}:latest
```

重量级步骤在 runner 本机架构完成：Go 用 `GOOS`/`GOARCH` 交叉编译，前端只产出静态文件后再拷进对应架构的 nginx。arm64 不再用 QEMU 跑编译、`pnpm install` 或 Docusaurus/Vite。四个镜像并行构建，GitHub Release 仍在四个镜像都推送成功之后创建一次。

同时会创建 GitHub Release，并把 `backend/cmd/server/VERSION` 同步回该 tag 对应的 release 分支（`release/v<上游版本>`）。

9. 之后的开发都在新的 `release/v${VERSION}` 分支上进行，直到下次升级再重复本流程。

## 重新触发一次已取消或过慢的发布

Actions 使用 **tag 指向的那次提交** 里的 workflow 和 Dockerfile。对已经推送的 tag 点 Re-run，或者重跑被取消的 run，构建的仍是旧提交，不会带上后来合并的 Dockerfile 改动。

要让构建改动生效，先把改动合并进对应的 `release/v<上游版本>` 分支，再在那个提交上打一个新的补丁 tag。不要移动、删除或覆盖已经推送过的 tag。

```sh
export VERSION=0.2.17
export EBEEAI_VERSION=0.0.3
git switch release/v${VERSION}
git pull
git tag v${VERSION}_${EBEEAI_VERSION}
git push origin v${VERSION}_${EBEEAI_VERSION}
```

合并之后也可以在 Actions 里手动运行 “EbeeAI Release”（`workflow_dispatch`），`tag` 填上面这个新 tag。这个 tag 必须指向已经包含本次 Dockerfile 改动的提交。推送 tag 是默认路径。

## 运维注意事项

- EbeeAI 部署相关文件统一放在 `deploy_ebeeai/`。
- 这套服务不要改上游原有 `Dockerfile` 或上游 compose 文件。
- 不要提交真实 `.env`、数据库备份、token、密钥或运行时生成的数据。
- 打 tag 前确认 `backend/cmd/server/VERSION` 和上游版本一致。
- 如果某次发布执行了 forward-only 数据库迁移，回滚镜像时可能还需要恢复发布前的 PostgreSQL 备份。

## 1Panel 发布流程

镜像发布完成后，在 1Panel 的“容器编排”里发布，不直接在服务器手写一次性 compose：

1. 打开 `deploy_ebeeai/docker-compose.yml`，把完整内容贴入 1Panel 编排 YAML。
2. 打开 `deploy_ebeeai/.env.example`，把完整内容贴入 1Panel 编排环境变量。
3. 将环境变量里的占位值替换为生产环境旧 `/opt/sub2api/config.yaml` 中的真实值，至少包括：

```text
DATABASE_USER
DATABASE_PASSWORD
REDIS_PASSWORD
JWT_SECRET
JWT_EXPIRE_HOUR
TOTP_ENCRYPTION_KEY
```

也可以先在服务器生成一份真实环境变量文件，再把内容复制到 1Panel：

```sh
cat /opt/sub2api/docker-deploy/1panel.env
```

这份文件应由 `deploy_ebeeai/README.md` 中的生成命令从旧 `/opt/sub2api/config.yaml` 生成，权限保持 `600`，不要提交到 Git。需要脱敏检查时：

```sh
sed -E 's/(PASSWORD|SECRET|KEY)=.*/\1=***MASKED***/I' /opt/sub2api/docker-deploy/1panel.env
```

4. 确认 1Panel 外部网络和已有服务别名：

```text
ONEPANEL_NETWORK=1panel-network
DATABASE_HOST=postgresql
REDIS_HOST=redis
```

如果目标服务器没有 `postgresql` / `redis` 网络别名，改成实际容器名，例如 `1Panel-postgresql-xxxx`。

5. 首次从 systemd 迁移时，先按 `deploy_ebeeai/README.md` 备份 PostgreSQL、Redis 和 `/opt/sub2api/data`，并准备 `/opt/sub2api/docker-data/config.yaml`。
6. 先用临时端口验证：

```text
SUB2API_BIND_HOST=127.0.0.1
SUB2API_HOST_PORT=18080
```

验证 `http://127.0.0.1:18080/health` 正常后，停止旧 systemd 服务，再改为正式端口：

```text
SUB2API_BIND_HOST=0.0.0.0
SUB2API_HOST_PORT=8080
```

7. 后续升级只改 `SUB2API_VERSION`，在 1Panel 里拉取镜像并重新创建容器。
