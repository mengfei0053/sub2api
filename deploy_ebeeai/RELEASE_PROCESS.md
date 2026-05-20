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

GitHub Actions 镜像 workflow 只会在推送 `v*` tag 时发布镜像，所以这个 tag 格式会触发镜像构建和推送。

## 推荐流程：基于上游 Tag 新建分支

升级到新的上游版本时，推荐使用这个流程。它能保证新 release 分支的 base 精确等于上游 tag。

1. 拉取两个远程仓库和 tag：

```sh
git fetch upstream --tags
git fetch origin
```

2. 基于上游 tag 创建新的 release 分支：

```sh
export VERSION=0.1.128
git switch -c release/v${VERSION} upstream/v${VERSION}
```

3. 从上一个 release 分支 cherry-pick EbeeAI 自己的提交：

```sh
git log --oneline upstream/v0.1.127..origin/release/v0.1.127
git cherry-pick <commit-1> <commit-2> <commit-3>
```

当前 Docker/GHCR 部署层至少需要包含新增或修改这些路径的提交：

```text
.github/workflows/ebeeai-image.yml
deploy_ebeeai/**
```

4. 如果出现冲突，手动解决：

```sh
git status
git diff --name-only --diff-filter=U
# 编辑冲突文件
git add <resolved-files>
git cherry-pick --continue
```

5. 验证：

```sh
docker compose --env-file deploy_ebeeai/.env.example -f deploy_ebeeai/docker-compose.yml config --quiet
docker buildx build --check -f deploy_ebeeai/Dockerfile .
```

6. 推送 release 分支：

```sh
git push -u origin release/v${VERSION}
```

7. 推送发布 tag，触发 GHCR 镜像发布：

```sh
export EBEEAI_VERSION=0.0.1
git tag v${VERSION}_${EBEEAI_VERSION}
git push origin v${VERSION}_${EBEEAI_VERSION}
```

这个 tag 会触发 `.github/workflows/ebeeai-image.yml`，并发布：

```text
ghcr.io/<github-owner>/sub2api-ebeeai:${VERSION}_${EBEEAI_VERSION}
ghcr.io/<github-owner>/sub2api-ebeeai:sha-<commit>
ghcr.io/<github-owner>/sub2api-ebeeai:latest
```

## 替代流程：把上一个 Release Rebase 到新的上游 Tag

如果上一个 release 分支上只包含 EbeeAI 自己的提交，可以用这个流程把这些提交迁移到新的上游 tag 上。

1. 拉取两个远程仓库和 tag：

```sh
git fetch upstream --tags
git fetch origin
```

2. 从上一个 release 分支创建新分支：

```sh
export OLD_VERSION=0.1.127
export NEW_VERSION=0.1.128
git switch -c release/v${NEW_VERSION} origin/release/v${OLD_VERSION}
```

3. 只把 EbeeAI 增量从旧上游 tag rebase 到新上游 tag：

```sh
git rebase --onto upstream/v${NEW_VERSION} upstream/v${OLD_VERSION}
```

这个命令会保留你的 EbeeAI 提交，同时替换它们下面的上游 base。

4. 如果出现冲突，停下来手动解决：

```sh
git diff --name-only --diff-filter=U
# 编辑冲突文件
git add <resolved-files>
git rebase --continue
```

除非确认某个提交已经过时，否则不要随意 skip 冲突提交。

5. 验证、推送分支，然后推送发布 tag：

```sh
docker compose --env-file deploy_ebeeai/.env.example -f deploy_ebeeai/docker-compose.yml config --quiet
docker buildx build --check -f deploy_ebeeai/Dockerfile .

export EBEEAI_VERSION=0.0.1
git push -u origin release/v${NEW_VERSION}
git tag v${NEW_VERSION}_${EBEEAI_VERSION}
git push origin v${NEW_VERSION}_${EBEEAI_VERSION}
```

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
