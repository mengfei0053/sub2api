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

## 标准流程：从 main_self rebase 到上游 tag 创建 release 分支

`main_self` 是 EbeeAI 自定义提交的长期维护分支。每次发布时，将 `main_self` 上的自定义提交 rebase 到最新上游 tag，再从结果创建 release 分支。上游提交在前，EbeeAI 提交在后。

### 前置条件

`main` 已与上游同步（见同步上游分支流程）。

### 步骤

1. 确认版本号并设置变量：

```sh
export VERSION=0.1.130
export EBEEAI_VERSION=0.0.1
```

2. 将 `main_self` 上的 EbeeAI 提交 rebase 到上游 tag：

```sh
git checkout main_self
git rebase --onto upstream/v${VERSION} main
```

`--onto upstream/v${VERSION}` 是新的 base；`main` 是旧 base（只有在 main_self 上而不在 main 上的提交会被 replay）。

3. 如果出现冲突，手动解决：

```sh
git diff --name-only --diff-filter=U
# 编辑冲突文件
git add <resolved-files>
git rebase --continue
```

4. 强推更新后的 `main_self`（rebase 改写了历史）：

```sh
git push origin main_self --force-with-lease
```

5. 从当前 `main_self` 创建 release 分支：

```sh
git switch -c release/v${VERSION}
```

6. 验证：

```sh
docker compose --env-file deploy_ebeeai/.env.example -f deploy_ebeeai/docker-compose.yml config --quiet
docker buildx build --check -f deploy_ebeeai/Dockerfile .
```

7. 推送 release 分支：

```sh
git push -u origin release/v${VERSION}
```

8. 推送发布 tag，触发 GHCR 镜像发布：

```sh
git tag v${VERSION}_${EBEEAI_VERSION}
git push origin v${VERSION}_${EBEEAI_VERSION}
```

这个 tag 会触发 `.github/workflows/ebeeai-image.yml`，并发布：

```text
ghcr.io/<github-owner>/sub2api-ebeeai:${VERSION}_${EBEEAI_VERSION}
ghcr.io/<github-owner>/sub2api-ebeeai:sha-<commit>
ghcr.io/<github-owner>/sub2api-ebeeai:latest
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
