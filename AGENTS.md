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
- **Frontend split:** EbeeAI and other local UI work happens in `frontend_self/` only. Do **not** change `frontend/` for product customizations. Update `frontend/` only when syncing upstream (`git merge upstream/main`) so it stays aligned with **Wei-Shaw/sub2api**. After each upstream sync, run `make check-frontend-self-sync` and merge needed changes into `frontend_self/` (see `frontend_self/README.md`, `DEV_GUIDE.md`).

## Local Notes
- Check local README files before changing behavior or docs in this subtree.
- YAML files are configuration surfaces; preserve comments and ordering when possible.

## Validation
- `make test` for broad backend/frontend validation when local services and tools are available
- `make build` before release-sensitive changes

## Project Commands
- Backend: `cd backend && go test ./...`, `cd backend && go test -tags=unit ./...`, `cd backend && go test -tags=integration ./...`.
- Frontend: `cd frontend && pnpm install`, `pnpm run typecheck`, `pnpm run lint:check`, `pnpm run test:run`, `pnpm run build` — **upstream mirror only**; not the day-to-day edit target for this fork.
- Frontend (local UI fork): **default edit target** — `frontend_self/` mirrors `frontend/` for EbeeAI and other customized UI; validate with `cd frontend_self && pnpm run typecheck` (etc.). After syncing upstream, run `make check-frontend-self-sync` and update `frontend_self/` when needed (see `frontend_self/README.md`, `DEV_GUIDE.md`).
- Ent generation: `cd backend && go generate ./ent` after editing `backend/ent/schema`.
- Root wrappers: `make test`, `make build`, and focused Makefile targets where available.
