# GitHub Workflows Agent Guide

## Scope
- Applies to `.github/workflows` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: GitHub Actions workflow definitions for CI, security scanning, CLA checks, and releases.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Keep workflow commands aligned with `Makefile`, `backend/Makefile`, and frontend package scripts.

## Local Notes
- YAML files are configuration surfaces; preserve comments and ordering when possible.

## Validation
- Review workflow syntax and keep referenced commands runnable locally where possible
