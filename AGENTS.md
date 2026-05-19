# Repository Root Agent Guide

## Scope
- Applies to `repository root` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Top-level monorepo guidance for Sub2API, a Go API gateway backend plus Vue 3 admin/user frontend.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Keep English, Chinese, and Japanese docs semantically aligned when changing user-facing setup or behavior.

## Local Notes
- Check local README files before changing behavior or docs in this subtree.
- YAML files are configuration surfaces; preserve comments and ordering when possible.

## Validation
- `make test` for broad backend/frontend validation when local services and tools are available
- `make build` before release-sensitive changes

## Project Commands
- Backend: `cd backend && go test ./...`, `cd backend && go test -tags=unit ./...`, `cd backend && go test -tags=integration ./...`.
- Frontend: `cd frontend && pnpm install`, `pnpm run typecheck`, `pnpm run lint:check`, `pnpm run test:run`, `pnpm run build`.
- Ent generation: `cd backend && go generate ./ent` after editing `backend/ent/schema`.
- Root wrappers: `make test`, `make build`, and focused Makefile targets where available.
