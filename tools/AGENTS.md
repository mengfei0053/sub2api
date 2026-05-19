# Tools Agent Guide

## Scope
- Applies to `tools` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Small repository maintenance scripts run from the project root.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Tool scripts should be idempotent, runnable from the repository root, and explicit about required arguments.

## Validation
- Run the changed script with a harmless sample input or dry-run path when possible
