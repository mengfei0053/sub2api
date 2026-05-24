# Deploy Ebeeai Agent Guide

## Scope
- Applies to `deploy_ebeeai` and all descendants unless a deeper `AGENTS.md` overrides it.
- Role: Files and subdirectories under deploy_ebeeai.

## Working Rules
- Prefer narrow, local changes that follow the surrounding package/component patterns.
- Preserve existing public APIs, route names, config keys, and i18n keys unless the task explicitly changes them.
- Do not commit secrets, local config, database backups, generated build outputs, or dependency directories.

## Local Notes
- Check local README files before changing behavior or docs in this subtree.
- YAML files are configuration surfaces; preserve comments and ordering when possible.
- EbeeAI Docker builds embed `frontend_self/`, not `frontend/` (`deploy_ebeeai/Dockerfile`, `FRONTEND_DIR=frontend_self`).
- Edit `frontend_self/` for local/EbeeAI UI and behavior; edit `frontend/` only when syncing upstream.
