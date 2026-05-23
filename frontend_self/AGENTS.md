# Frontend Self Agent Guide

## Scope
- Applies to `frontend_self` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Local UI customization fork of `frontend/` (Vue 3 + Vite). Upstream-aligned code lives in `frontend/`; apply structural fixes from there after each upstream sync.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.
- After merging upstream into `main`, run `make check-frontend-self-sync` from the repo root and merge needed changes from `frontend/` into `frontend_self/`.

## Local Guidance
- Use `pnpm`, not npm or yarn; keep `pnpm-lock.yaml` synchronized after dependency changes.
- Validate edits from `frontend_self/` with `pnpm run typecheck`, `pnpm run lint:check`, and targeted `pnpm exec vitest run ...` as appropriate.
- Follow Vue 3 Composition API and existing Tailwind utility patterns.
- See `frontend_self/README.md` and `DEV_GUIDE.md` for sync workflow.

## Local Notes
- YAML files are configuration surfaces; preserve comments and ordering when possible.
- JSON files may be consumed by tools; keep formatting stable and avoid comments.
- Child directories in scope include: `public`, `src`.

## Validation
- `cd frontend_self && pnpm run typecheck`
- `cd frontend_self && pnpm run lint:check`
- `cd frontend_self && pnpm run build`
- After upstream sync: `make check-frontend-self-sync`
