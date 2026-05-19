# Deployment Agent Guide

## Scope
- Applies to `deploy` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Deployment manifests, compose files, and environment examples.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Guidance
- Treat deployment examples as user-facing contracts; document required env/config changes with safe defaults.

## Local Notes
- Check local README files before changing behavior or docs in this subtree.
- YAML files are configuration surfaces; preserve comments and ordering when possible.

## Validation
- Validate YAML/Compose syntax before shipping deployment changes
