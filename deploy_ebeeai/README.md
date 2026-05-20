# EbeeAI Docker 部署

这个目录存放 EbeeAI 专用的 Docker 部署文件。这里的文件不会改动仓库原有的
`Dockerfile` 或 `deploy/docker-compose*.yml`。

## 首次部署

以下命令都在 `deploy_ebeeai` 目录下执行：

```sh
cp .env.example .env
```

编辑 `.env`，把生产环境 `/opt/sub2api/config.yaml` 里的现有配置复制过来，尤其是：

- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `TOTP_ENCRYPTION_KEY`，如果生产环境的 2FA 或支付恢复 token 依赖它
- `SUB2API_IMAGE` 和 `SUB2API_VERSION`，指向 GitHub Actions 推送到 GHCR 的镜像

这套部署默认使用美国东部时区：

```text
America/New_York
```

第一次从 systemd 切换到 Docker 前，先在服务器上停掉旧服务：

```sh
systemctl stop sub2api
systemctl disable sub2api
```

启动容器：

```sh
docker compose --env-file .env pull sub2api
docker compose --env-file .env up -d sub2api
```

验证：

```sh
docker compose --env-file .env ps
docker inspect sub2api --format '{{.State.Health.Status}}'
curl -fsS http://127.0.0.1:8080/health
curl -fsS https://ebeeai.net/health
docker logs --tail=100 sub2api
```

## 升级

GitHub Actions workflow `.github/workflows/ebeeai-image.yml` 只会在推送
`v*` Git tag 时构建并推送 `linux/amd64` 镜像到 GHCR。

发布 tag 命名规则：

```text
v<上游tag版本号>_<EbeeAI版本号>
```

示例：

```sh
git tag v0.1.127_0.0.1
git push origin v0.1.127_0.0.1
```

推送后的镜像 tag：

```text
ghcr.io/<github-owner>/sub2api-ebeeai:<上游版本>_<EbeeAI版本>
ghcr.io/<github-owner>/sub2api-ebeeai:sha-<commit>
ghcr.io/<github-owner>/sub2api-ebeeai:latest
```

在服务器 `.env` 中设置：

```sh
SUB2API_IMAGE=ghcr.io/<github-owner>/sub2api-ebeeai
SUB2API_VERSION=<上游版本>_<EbeeAI版本>
```

然后执行：

```sh
docker compose --env-file .env pull sub2api
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:8080/health
```

## 回滚

把 `.env` 里的 `SUB2API_VERSION` 改回上一个可用版本，然后执行：

```sh
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:8080/health
```

如果失败版本已经执行过 forward-only 数据库迁移，只回滚镜像可能不够，需要先恢复发布前的 PostgreSQL 备份。
