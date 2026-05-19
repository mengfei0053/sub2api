# Partner Assets Agent Guide

## Scope
- Applies to `assets/partners` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Partner and sponsor assets referenced from README files.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Optimize binary assets before adding large files; keep README image paths stable.

## Local Notes
- Child directories in scope include: `logos`.
