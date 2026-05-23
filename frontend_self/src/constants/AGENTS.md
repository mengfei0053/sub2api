# Frontend Constants Agent Guide

## Scope
- Applies to `frontend/src/constants` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Typed frontend constants and enum-like configuration.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Use `pnpm`, not npm or yarn; keep `pnpm-lock.yaml` synchronized after dependency changes.
- Validate frontend edits from `frontend/` with `pnpm run typecheck`, `pnpm run lint:check`, and targeted `pnpm exec vitest run ...` as appropriate.
- Follow Vue 3 Composition API and existing Tailwind utility patterns.

## Validation
- `cd frontend && pnpm run typecheck`
- `cd frontend && pnpm run lint:check`
