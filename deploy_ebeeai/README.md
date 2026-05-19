# EbeeAI Docker Deployment

This directory contains the EbeeAI-specific Docker deployment. It does not
modify the repository's original Dockerfile or compose files.

## First Run

Run commands from this directory:

```sh
cp .env.example .env
```

Edit `.env` and copy the existing production values from
`/opt/sub2api/config.yaml`, especially:

- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `TOTP_ENCRYPTION_KEY` if production 2FA/payment resume tokens depend on it

The default timezone in this deployment is `America/New_York`.

Build the image:

```sh
docker compose --env-file .env build sub2api
```

Before the first Docker cutover, stop the old systemd service on the server:

```sh
systemctl stop sub2api
systemctl disable sub2api
```

Start the container:

```sh
docker compose --env-file .env up -d sub2api
```

Verify:

```sh
docker compose --env-file .env ps
docker inspect sub2api --format '{{.State.Health.Status}}'
curl -fsS http://127.0.0.1:8080/health
curl -fsS https://ebeeai.net/health
docker logs --tail=100 sub2api
```

## Upgrade

The GitHub Actions workflow `.github/workflows/ebeeai-image.yml` builds and
pushes `linux/amd64` images to GHCR only when a `v*` Git tag is pushed:

```sh
git tag v0.1.127
git push origin v0.1.127
```

The pushed tags are:

```text
ghcr.io/<github-owner>/sub2api-ebeeai:<version>
ghcr.io/<github-owner>/sub2api-ebeeai:sha-<commit>
ghcr.io/<github-owner>/sub2api-ebeeai:latest
```

Set these values in `.env`:

```sh
SUB2API_IMAGE=ghcr.io/<github-owner>/sub2api-ebeeai
SUB2API_VERSION=<version>
```

Then:

```sh
docker compose --env-file .env pull sub2api
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:8080/health
```

## Rollback

Set `SUB2API_VERSION` back to the previous tag and run:

```sh
docker compose --env-file .env up -d sub2api
curl -fsS http://127.0.0.1:8080/health
```

If a failed release applied forward-only database migrations, restore the
PostgreSQL backup taken before the release before relying on an older image.
