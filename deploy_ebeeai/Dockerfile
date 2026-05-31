# syntax=docker/dockerfile:1

# EbeeAI production image (legacy monolith: backend embeds frontend_self).
# For current production, use the split stack in docker-compose.yml:
#   Dockerfile.backend, Dockerfile.frontend_self, Dockerfile.frontend_docs, Dockerfile.gateway

ARG NODE_IMAGE=node:24-alpine
ARG GOLANG_IMAGE=golang:1.26.3-alpine
ARG ALPINE_IMAGE=alpine:3.21
ARG POSTGRES_IMAGE=postgres:18.3-alpine
ARG GOPROXY=https://goproxy.cn,direct
ARG GOSUMDB=sum.golang.google.cn
# EbeeAI images use the customized UI fork; upstream-aligned frontend/ stays untouched.
ARG FRONTEND_DIR=frontend_self

FROM ${NODE_IMAGE} AS frontend-builder

ARG FRONTEND_DIR=frontend_self

WORKDIR /app/frontend

RUN corepack enable && corepack prepare pnpm@9 --activate

COPY ${FRONTEND_DIR}/package.json ${FRONTEND_DIR}/pnpm-lock.yaml ${FRONTEND_DIR}/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY ${FRONTEND_DIR}/ ./
RUN pnpm run build

FROM ${GOLANG_IMAGE} AS backend-builder

ARG VERSION=
ARG COMMIT=local
ARG DATE=
ARG GOPROXY
ARG GOSUMDB

ENV GOPROXY=${GOPROXY}
ENV GOSUMDB=${GOSUMDB}

RUN apk add --no-cache ca-certificates git tzdata

WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
COPY --from=frontend-builder /app/backend/internal/web/dist ./internal/web/dist

RUN VERSION_VALUE="${VERSION}" && \
    if [ -z "${VERSION_VALUE}" ]; then VERSION_VALUE="$(tr -d '\r\n' < ./cmd/server/VERSION)"; fi && \
    DATE_VALUE="${DATE:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}" && \
    CGO_ENABLED=0 GOOS=linux go build \
      -tags embed \
      -trimpath \
      -ldflags="-s -w -X main.Version=${VERSION_VALUE} -X main.Commit=${COMMIT} -X main.Date=${DATE_VALUE} -X main.BuildType=release" \
      -o /app/sub2api \
      ./cmd/server

FROM ${POSTGRES_IMAGE} AS pg-client

FROM ${ALPINE_IMAGE} AS runtime

LABEL org.opencontainers.image.title="sub2api-ebeeai"
LABEL org.opencontainers.image.description="Sub2API runtime image for the EbeeAI 1Panel deployment"
LABEL org.opencontainers.image.source="https://github.com/Wei-Shaw/sub2api"

RUN apk add --no-cache \
      ca-certificates \
      krb5-libs \
      lz4-libs \
      libedit \
      libldap \
      libpq \
      su-exec \
      tzdata \
      zstd-libs \
    && rm -rf /var/cache/apk/*

# Keep pg_dump/psql version-matched with the production PostgreSQL image.
COPY --from=pg-client /usr/local/bin/pg_dump /usr/local/bin/pg_dump
COPY --from=pg-client /usr/local/bin/psql /usr/local/bin/psql
COPY --from=pg-client /usr/local/lib/libpq.so.5* /usr/local/lib/

RUN addgroup -g 1000 sub2api && \
    adduser -u 1000 -G sub2api -s /bin/sh -D sub2api

WORKDIR /app

COPY --from=backend-builder --chown=sub2api:sub2api /app/sub2api /app/sub2api
COPY --from=backend-builder --chown=sub2api:sub2api /app/backend/resources /app/resources

RUN mkdir -p /app/data && chown sub2api:sub2api /app/data

COPY deploy_ebeeai/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENV DATA_DIR=/app/data
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8080
ENV SERVER_MODE=release
ENV GIN_MODE=release
ENV TZ=Asia/Shanghai

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -q -T 5 -O /dev/null "http://127.0.0.1:${SERVER_PORT:-8080}/health" || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/sub2api"]
