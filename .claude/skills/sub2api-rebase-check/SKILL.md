---
name: sub2api-rebase-check
description: Check the Sub2API repository after rebasing or syncing onto an upstream Wei-Shaw/sub2api branch or tag. Use when working in this project after commands such as git rebase upstream/main, git rebase --onto vX.Y.Z, syncing main, cutting a new release branch from the current one, or updating release branches, especially to verify frontend_self keeps EbeeAI custom homepage/i18n changes while also including all upstream frontend changes.
---

# Sub2API Rebase Check

## Purpose

After every upstream rebase or tag sync, verify these things together:

- `frontend_self/` includes all relevant upstream `frontend/` changes.
- EbeeAI local customizations in `frontend_self/` were not overwritten, especially homepage SEO/i18n.
- EbeeAI brand assets in `frontend_self/` were not replaced by upstream copies, especially `frontend_self/public/logo.png`.

Use this skill from the Sub2API repository root.

## Protected Local Brand Assets

These files are intentionally EbeeAI-specific and must always keep our version — never overwrite them with the upstream `frontend/` copy during a rebase or sync:

- `frontend_self/public/logo.png` — EbeeAI brand logo. The upstream `frontend/public/logo.png` is a different image; if a rebase pulls it in, restore ours.

If upstream changes one of these paths, ignore the upstream change for `frontend_self/` and keep our asset.

## Required Workflow

1. Check branch and worktree:

```bash
git status --short --branch
git log --oneline -5 --decorate
```

Do not discard unrelated local or untracked files. In this repo, `reports/` may exist as untracked output and should be left alone unless the user asks.

2. Identify the upstream range that was just synced.

Examples:

```bash
# Rebased from v0.1.130 onto v0.1.131
UPSTREAM_FROM=v0.1.130
UPSTREAM_TO=v0.1.131

# Synced from an upstream branch tip
UPSTREAM_FROM=<old-upstream-ref>
UPSTREAM_TO=upstream/main
```

3. Run the bundled deterministic check:

```bash
.claude/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh "$UPSTREAM_FROM" "$UPSTREAM_TO"
```

The script checks:

- every `frontend/src` file changed by upstream has a corresponding `frontend_self/src` file;
- non-locale files changed by upstream match exactly between `frontend/` and `frontend_self/`;
- `frontend_self` locale files contain every key present in upstream `frontend` locale files;
- EbeeAI required local keys exist: `home.seo.*`, `home.ebeeai.*`, `auth.seo.*`;
- upstream platform quota keys exist, including `dashboard.platformQuota`, `admin.users.platformQuota`, `admin.settings.defaults.defaultPlatformQuotas`, and auth-source quota override keys.
- protected local brand assets exist and still differ from the upstream `frontend/` copy (i.e. `frontend_self/public/logo.png` was not overwritten by upstream).

4. Run repository checks:

```bash
make check-frontend-self-sync
cd frontend_self && pnpm run typecheck
```

For homepage/i18n/quota changes, also run focused tests:

```bash
cd frontend_self && pnpm exec vitest run \
  src/components/home/__tests__/EbeeaiHomePage.spec.ts \
  src/router/__tests__/seo.spec.ts \
  src/components/admin/user/__tests__/UserPlatformQuotaModal.spec.ts \
  src/components/user/__tests__/UserPlatformQuotaCell.spec.ts
```

Run broader `pnpm run lint:check`, `pnpm run build`, `make test`, or `make build` when the rebase touches shared behavior, release code, backend contracts, or build configuration.

## If Checks Fail

- Missing or different non-locale files: copy or merge the upstream `frontend/src/...` change into the matching `frontend_self/src/...` path, then re-run the script.
- Missing locale keys from upstream: merge only the missing keys into `frontend_self/src/i18n/locales/en.ts` and `zh.ts`.
- Missing EbeeAI homepage keys: restore local `home.seo`, `home.ebeeai`, and `auth.seo` blocks in `frontend_self` without removing upstream quota keys.
- Protected asset matches upstream (our logo was overwritten): restore our EbeeAI `frontend_self/public/logo.png` from a pre-rebase commit (do not take upstream's copy), then re-run.
- `make check-frontend-self-sync` may warn that `frontend/` has AGENTS.md differences from upstream or that `pnpm-lock.yaml` metadata differs. Treat script failures and missing keys as blockers; treat lockfile metadata warnings as follow-up only after inspecting the diff.

## Completion Standard

Before reporting success, provide:

- upstream range checked;
- whether non-locale upstream frontend files matched;
- locale key counts and missing count;
- validation commands run and their pass/fail status;
- current branch/ahead/behind status and any untracked files left untouched.
