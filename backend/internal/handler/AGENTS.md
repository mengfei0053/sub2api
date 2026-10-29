# HTTP Handlers Agent Guide

## Scope
- Applies to `backend/internal/handler` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Gin HTTP handlers, request binding, response shaping, and admin/user API endpoints.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.
- Keep tests deterministic; prefer focused fixtures and avoid depending on live external services.

## Local Guidance
- Format Go edits with `gofmt`; keep imports organized with the standard Go toolchain.
- Run backend checks from `backend/` when touching Go: `go test ./...` for broad checks, or `go test -tags=unit ./...` / `go test -tags=integration ./...` when matching CI scope.
- Use `golangci-lint run ./...` for lint-sensitive backend changes when available.
- Keep handlers thin: validate/bind requests, call services, and return normalized responses.
- Put reusable request/response shapes in `dto` when they cross handler files.

## Local Notes
- Child directories in scope include: `admin`, `dto`.

## Validation
- `cd backend && go test ./...`
- `cd backend && golangci-lint run ./...` when lint risk is non-trivial
