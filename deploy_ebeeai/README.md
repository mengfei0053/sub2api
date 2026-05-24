# EbeeAI Docker 部署

这个目录存放 EbeeAI 专用的 Docker 部署文件。这里的文件不会改动仓库原有的
`Dockerfile` 或 `deploy/docker-compose*.yml`。

EbeeAI 镜像的前端构建源为 `frontend_self/`（本地 UI 定制副本），不是上游对齐的
`frontend/`。

- **日常 UI/功能改动**：只修改 `frontend_self/`，不要改 `frontend/`。
- **`frontend/`**：仅在上游同步（`git merge upstream/main`）时更新，与 upstream 保持一致。

发布前若刚同步 upstream，请先运行 `make check-frontend-self-sync` 确认
`frontend_self/` 已跟进必要的 API/路由/i18n 变更。

## 发布到 1Panel 容器编排

推荐把本目录的两份文件作为 1Panel 容器编排的来源：

```text
deploy_ebeeai/docker-compose.yml
deploy_ebeeai/.env.example
```

在 1Panel 中新建或编辑容器编排：

1. 将 `docker-compose.yml` 的完整内容粘贴到编排 YAML。
2. 将 `.env.example` 的完整内容粘贴到编排环境变量。
3. 把环境变量中的占位值替换成生产环境旧配置的真实值。
4. 保存后先拉取镜像，再启动编排。

不要保留 `replace-with-*` 或 `change-me` 这类占位值。Compose 环境变量会覆盖 `/app/data/config.yaml`，如果 `DATABASE_PASSWORD` 填错，即使挂载的旧配置文件里密码正确，应用也会因为 PostgreSQL 密码错误而启动失败。

需要从生产环境 `/opt/sub2api/config.yaml` 复制或确认的值：

- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRE_HOUR`
- `TOTP_ENCRYPTION_KEY`，如果生产环境的 2FA 或支付恢复 token 依赖它
- `SUB2API_IMAGE` 和 `SUB2API_VERSION`，指向 GitHub Actions 推送到 GHCR 的镜像

这套部署默认复用 1Panel 的外部 PostgreSQL/Redis，不会创建新的数据库容器。默认网络和主机名如下：

```text
ONEPANEL_NETWORK=1panel-network
DATABASE_HOST=postgresql
REDIS_HOST=redis
```

如果旧 1Panel 容器没有 `postgresql` / `redis` 网络别名，也可以把 `DATABASE_HOST` / `REDIS_HOST` 改成实际容器名，例如 `1Panel-postgresql-xxxx`。

这套部署默认使用 `Asia/Shanghai`，和旧 `/opt/sub2api/config.yaml` 保持一致。

## 从 systemd 迁移到 Docker

第一次切换前，先在服务器备份旧数据：

```sh
stamp=$(date +%Y%m%d-%H%M%S)
backup_dir=/opt/sub2api/backups/pre-docker-$stamp
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"

cp -a /opt/sub2api/config.yaml "$backup_dir/config.yaml"
tar -C /opt/sub2api -czf "$backup_dir/sub2api-data.tgz" data

docker exec <postgres-container> pg_dump -U <database-user> -d sub2api -Fc \
  > "$backup_dir/sub2api-postgres.dump"

tar -C /opt/1panel/apps/redis/redis -czf "$backup_dir/redis-data.tgz" data conf
```

准备 Docker 使用的数据目录。不要直接挂载旧 `config.yaml`，因为旧配置里的 `database.host: localhost` 和 `redis.host: localhost` 在容器内会指向容器自己：

```sh
mkdir -p /opt/sub2api/docker-data
cp -a /opt/sub2api/data/. /opt/sub2api/docker-data/
cp -a /opt/sub2api/config.yaml /opt/sub2api/docker-data/config.yaml
cp -a /opt/sub2api/.installed /opt/sub2api/docker-data/.installed 2>/dev/null || true

# 手动编辑 /opt/sub2api/docker-data/config.yaml：
# database.host 改成 postgresql
# redis.host 改成 redis
```

如果旧配置中 `redis.password` 有值，`.env` 中的 `REDIS_PASSWORD` 必须填同一个值。若旧库里已有启用 2FA 的用户，建议同时固定 `TOTP_ENCRYPTION_KEY`，避免重启后 TOTP 密钥无法解密。

可以在服务器上用下面的命令生成一份用于 1Panel 的真实环境变量文件；命令只读取旧配置，不修改数据：

```sh
mkdir -p /opt/sub2api/docker-deploy
python3 - <<'PY' > /opt/sub2api/docker-deploy/1panel.env
from pathlib import Path
import re

src = Path("/opt/sub2api/config.yaml").read_text()
vals = {}
section = None
for line in src.splitlines():
    if not line.strip() or line.lstrip().startswith("#"):
        continue
    if not line.startswith((" ", "\t")) and line.rstrip().endswith(":"):
        section = line.strip()[:-1]
        continue
    m = re.match(r"\s*([A-Za-z0-9_.-]+):\s*(.*?)\s*$", line)
    if section and m:
        vals[f"{section}.{m.group(1)}"] = m.group(2).strip().strip('"').strip("'")

print("SUB2API_IMAGE=ghcr.io/mengfei0053/sub2api-ebeeai")
print("SUB2API_VERSION=0.1.127_0.0.2")
print("SUB2API_CONTAINER_NAME=sub2api")
print("SUB2API_BIND_HOST=0.0.0.0")
print("SUB2API_HOST_PORT=8080")
print("SUB2API_DATA_DIR=/opt/sub2api/docker-data")
print("ONEPANEL_NETWORK=1panel-network")
print("DATABASE_HOST=postgresql")
print("DATABASE_PORT=5432")
print(f"DATABASE_USER={vals.get('database.user', '')}")
print(f"DATABASE_PASSWORD={vals.get('database.password', '')}")
print(f"DATABASE_DBNAME={vals.get('database.dbname', 'sub2api')}")
print(f"DATABASE_SSLMODE={vals.get('database.sslmode', 'disable')}")
print("REDIS_HOST=redis")
print("REDIS_PORT=6379")
print(f"REDIS_PASSWORD={vals.get('redis.password', '')}")
print(f"REDIS_DB={vals.get('redis.db', '0')}")
print(f"REDIS_ENABLE_TLS={vals.get('redis.enable_tls', 'false')}")
print(f"JWT_SECRET={vals.get('jwt.secret', '')}")
print(f"JWT_EXPIRE_HOUR={vals.get('jwt.expire_hour', '24')}")
print("TOTP_ENCRYPTION_KEY=")
print("RUN_MODE=standard")
print(f"TZ={vals.get('timezone', 'Asia/Shanghai')}")
print("SECURITY_URL_ALLOWLIST_ENABLED=false")
print("SECURITY_URL_ALLOWLIST_ALLOW_INSECURE_HTTP=false")
print("SECURITY_URL_ALLOWLIST_ALLOW_PRIVATE_HOSTS=false")
PY
chmod 600 /opt/sub2api/docker-deploy/1panel.env
```

查看并复制真实环境变量到 1Panel：

```sh
cat /opt/sub2api/docker-deploy/1panel.env
```

如果只想确认字段是否齐全，避免在终端里显示密钥，可以用脱敏查看：

```sh
sed -E 's/(PASSWORD|SECRET|KEY)=.*/\1=***MASKED***/I' /opt/sub2api/docker-deploy/1panel.env
```

### 临时端口验证

在 1Panel 编排环境变量中先设置临时端口，不影响旧 systemd 服务：

```text
SUB2API_BIND_HOST=127.0.0.1
SUB2API_HOST_PORT=18080
```

启动编排后验证：

```sh
curl -fsS http://127.0.0.1:18080/health
docker logs --tail=100 sub2api
```

验证通过后，在 1Panel 停止这套临时编排。

如果使用命令行，也可以这样验证：

```sh
SUB2API_BIND_HOST=127.0.0.1
SUB2API_HOST_PORT=18080
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:18080/health
docker compose --env-file .env down
```

### 正式接管 8080

验证成功后，再停掉旧 systemd 服务：

```sh
systemctl stop sub2api
systemctl disable sub2api
```

然后在 1Panel 编排环境变量中改回正式端口：

```text
SUB2API_BIND_HOST=0.0.0.0
SUB2API_HOST_PORT=8080
```

重新启动编排。命令行等价操作如下：

```sh
SUB2API_BIND_HOST=0.0.0.0
SUB2API_HOST_PORT=8080
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

如果使用 1Panel 容器编排，在环境变量中更新 `SUB2API_VERSION`，保存后执行“拉取镜像/重新创建”。命令行等价操作如下：

```sh
docker compose --env-file .env pull sub2api
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:8080/health
```

## 回滚

把 1Panel 编排环境变量里的 `SUB2API_VERSION` 改回上一个可用版本，保存后重新创建容器。命令行等价操作如下：

```sh
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:8080/health
```

如果失败版本已经执行过 forward-only 数据库迁移，只回滚镜像可能不够，需要先恢复发布前的 PostgreSQL 备份。
