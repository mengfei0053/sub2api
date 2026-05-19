# Frontend App Agent Guide

## Scope
- Applies to `frontend` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Vue 3 + Vite frontend application for admin, user, auth, setup, and public screens.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Use `pnpm`, not npm or yarn; keep `pnpm-lock.yaml` synchronized after dependency changes.
- Validate frontend edits from `frontend/` with `pnpm run typecheck`, `pnpm run lint:check`, and targeted `pnpm exec vitest run ...` as appropriate.
- Follow Vue 3 Composition API and existing Tailwind utility patterns.

## Local Notes
- YAML files are configuration surfaces; preserve comments and ordering when possible.
- JSON files may be consumed by tools; keep formatting stable and avoid comments.
- Child directories in scope include: `public`, `src`.

## Validation
- `cd frontend && pnpm run typecheck`
- `cd frontend && pnpm run lint:check`
- `cd frontend && pnpm run build`
