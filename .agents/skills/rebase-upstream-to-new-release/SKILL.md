---
name: rebase-upstream-to-new-release
description: Use when upgrading EbeeAI to a newer upstream Sub2API version — e.g. moving release/v0.1.131 to release/v0.1.132, or when the user says "同步上游并出新 release", "rebase 到新上游 tag", or "升级到 vX.Y.Z". Use at the start of such an upgrade. NOT for a plain main-only mirror sync (use sync-upstream for that).
---

# Rebase Upstream to New Release

## Overview

EbeeAI tracks upstream `Wei-Shaw/sub2api` by version. `main` is a pure upstream mirror; EbeeAI custom commits live on the **current release branch** (there is no `main_self`). Upgrading to a new upstream version means: sync upstream → cut a NEW release branch from the current one → rebase EbeeAI commits onto the new upstream tag → reconcile `frontend_self/` with upstream `frontend/` → publish.

Authoritative manual steps live in `deploy_ebeeai/RELEASE_PROCESS.md`; this skill is the end-to-end runbook.

**REQUIRED SUB-SKILL:** Use sub2api-rebase-check after the rebase to verify `frontend_self` keeps EbeeAI customizations while including all upstream `frontend` changes.

## Variables

- `PREV` — upstream version the current release is based on (e.g. `0.1.131`)
- `VERSION` — new upstream version to upgrade to (e.g. `0.1.132`)
- `EBEEAI` — EbeeAI service version; **resets to `0.0.1` for each new upstream version**

## Steps

### 1. Sync `main` to upstream (pure mirror)

```sh
git fetch upstream && git fetch upstream --tags
git switch main
git log --oneline upstream/main..main   # MUST be empty; if not, investigate before resetting
git reset --hard upstream/main
git push origin main --force-with-lease
git push origin --tags
```

`main` must have NO custom commits. Leave untracked dirs (`reports/`, `db_backup/`) alone.

### 2. Cut new release branch + rebase onto the new tag

```sh
git switch release/v${PREV}
git switch -c release/v${VERSION}
git rebase --onto v${VERSION} v${PREV}
```

Original `release/v${PREV}` stays untouched. On conflict: resolve, `git add`, `git rebase --continue`.

### 3. Reconcile frontend_self with the upstream frontend delta

Rebase only replays OUR commits; it does NOT pull upstream's new `frontend/` changes into `frontend_self/`. Run the check, then sync every flagged file:

```sh
.agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh v${PREV} v${VERSION}
```

For each upstream-changed `frontend/src/X`, 3-way merge into `frontend_self/src/X` (upstream delta applies, EbeeAI customizations preserved):

```sh
git show v${PREV}:frontend/$f > /tmp/base
git merge-file -p frontend_self/$f /tmp/base frontend/$f > /tmp/merged && cp /tmp/merged frontend_self/$f
```

Copy upstream-added files; merge missing upstream i18n keys into `frontend_self/src/i18n/locales/{en,zh}.ts` (locale files 3-way merge cleanly too). Keep protected asset `frontend_self/public/logo.png`. Re-run the check until only theme-customized files differ and locale `missing=0`.

### 4. Bump VERSION + verify

```sh
echo "${VERSION}" > backend/cmd/server/VERSION
cd frontend_self && pnpm run typecheck && cd ..
```

### 5. Push branch, then tag (the tag publishes the release)

```sh
git push -u origin release/v${VERSION}
git tag -a v${VERSION}_${EBEEAI} -m "EbeeAI release v${VERSION}_${EBEEAI}"
git push origin v${VERSION}_${EBEEAI}
```

The tag triggers `.github/workflows/ebeeai-release.yml`: builds the GHCR image, creates a GitHub Release, and syncs VERSION back to `release/v${VERSION}`.

## Judgment calls / gotchas

- **rebase-check exact-match FAILs are EXPECTED for theme-customized files** (account modals, admin views, `UseKeyModal.vue`, etc.). After a clean 3-way merge they differ from upstream ONLY by the EbeeAI enterprise theme. Confirm correctness via `typecheck` + that the residual diff is customization, not a dropped upstream change — not by chasing an all-MATCH result.
- **Pre-existing test failures** unrelated to the rebase may exist. Before blaming the rebase, run the same tests against the pre-rebase branch (a throwaway `git worktree` sharing `node_modules`, run vitest via `./node_modules/.bin/vitest` with `CI=true`). Don't block the release on unrelated failures.
- **Confirm before pushing the tag** — it publishes a real image + GitHub Release. Tag format is `v<upstream>_<ebeeai>`; a new upstream version starts `EBEEAI` at `0.0.1`.
- **Lockfile drift:** local pnpm (v11) may rewrite `frontend_self/pnpm-lock.yaml` (dropping the `overrides` block); CI builds with pnpm 9. Revert unintended lockfile changes before committing.
- `check-sub2api-rebase.sh` lists files alphabetically — do not `tail` its output or you will miss `api/...` and `Create*` files at the top.

## Quick reference

| Step | Command |
|---|---|
| sync main | `git reset --hard upstream/main && git push origin main --force-with-lease && git push origin --tags` |
| cut + rebase | `git switch -c release/v${VERSION} && git rebase --onto v${VERSION} v${PREV}` |
| verify sync | `.agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh v${PREV} v${VERSION}` |
| bump + check | `echo ${VERSION} > backend/cmd/server/VERSION; (cd frontend_self && pnpm run typecheck)` |
| publish | `git push -u origin release/v${VERSION}; git tag -a v${VERSION}_${EBEEAI} -m ...; git push origin v${VERSION}_${EBEEAI}` |
