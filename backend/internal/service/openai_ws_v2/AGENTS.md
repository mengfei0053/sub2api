# Openai Ws V2 Agent Guide

## Scope
- Applies to `backend/internal/service/openai_ws_v2` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: OpenAI-compatible websocket v2 service implementation.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.
- Keep tests deterministic; prefer focused fixtures and avoid depending on live external services.

## Local Guidance
- Format Go edits with `gofmt`; keep imports organized with the standard Go toolchain.
- Run backend checks from `backend/` when touching Go: `go test ./...` for broad checks, or `go test -tags=unit ./...` / `go test -tags=integration ./...` when matching CI scope.
- Use `golangci-lint run ./...` for lint-sensitive backend changes when available.
- Keep business rules here; avoid leaking HTTP handler concerns into service code.
- When changing interfaces, update all test stubs and mocks in the same pass.

## Validation
- `cd backend && go test ./...`
- `cd backend && golangci-lint run ./...` when lint risk is non-trivial
