# Ent Schemas Agent Guide

## Scope
- Applies to `backend/ent/schema` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Source-of-truth Ent schema definitions and mixins.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.
- Keep tests deterministic; prefer focused fixtures and avoid depending on live external services.

## Local Guidance
- Format Go edits with `gofmt`; keep imports organized with the standard Go toolchain.
- Run backend checks from `backend/` when touching Go: `go test ./...` for broad checks, or `go test -tags=unit ./...` / `go test -tags=integration ./...` when matching CI scope.
- Use `golangci-lint run ./...` for lint-sensitive backend changes when available.
- After schema or mixin changes, run `go generate ./ent` from `backend/` and keep generated Ent output in sync.
- Treat schema field names, indexes, edges, and annotations as database/API contracts; check migrations and repository assumptions before changing them.

## Local Notes
- Child directories in scope include: `mixins`.

## Validation
- `cd backend && go generate ./ent && go test ./ent/...`
- `cd backend && golangci-lint run ./...` when lint risk is non-trivial
