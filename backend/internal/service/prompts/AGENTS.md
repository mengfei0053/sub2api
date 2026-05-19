# Prompts Agent Guide

## Scope
- Applies to `backend/internal/service/prompts` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Prompt templates and prompt-related service assets.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Format Go edits with `gofmt`; keep imports organized with the standard Go toolchain.
- Run backend checks from `backend/` when touching Go: `go test ./...` for broad checks, or `go test -tags=unit ./...` / `go test -tags=integration ./...` when matching CI scope.
- Use `golangci-lint run ./...` for lint-sensitive backend changes when available.
- Keep business rules here; avoid leaking HTTP handler concerns into service code.
- When changing interfaces, update all test stubs and mocks in the same pass.

## Validation
- `cd backend && go test ./...`
