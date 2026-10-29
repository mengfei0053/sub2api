---
name: sub2api-rebase-check
description: Check the Sub2API repository after rebasing or syncing onto an upstream Wei-Shaw/sub2api branch or tag. Use when working in this project after commands such as git rebase upstream/main, git rebase --onto vX.Y.Z, syncing main, cutting a new release branch from the current one, or updating release branches, especially to verify frontend_self keeps EbeeAI custom homepage/i18n changes while also including all upstream frontend changes.
---

# Sub2API Rebase Check

## Purpose

After every upstream rebase or tag sync, verify **together**:

1. `frontend_self/` includes **all** relevant upstream `frontend/` changes (no missing features).
2. Upstream functional deltas are present even in themed files (**3-way integrity**).
3. EbeeAI customizations were not wiped (theme markers, SEO/i18n, light lock, logo).
4. CI will accept the tree (`pnpm.overrides` lockfile match).

Use from the Sub2API repository root.

## Scripts

| Script | Role |
|---|---|
| `scripts/merge-frontend-self-delta.sh <from> <to>` | Bulk 3-way merge `frontend/src` → `frontend_self/src`; unions package overrides |
| `scripts/check-sub2api-rebase.sh <from> <to> [--old-self-ref REF] [--json out.json]` | Human listing + **strict audit** (exit 0 only if all gates pass) |
| `scripts/audit-frontend-self-sync.py` | Gate implementation (coverage / integrity / locale / theme / lockfile / brand / routes) |

## Protected local brand assets

Never overwrite with upstream `frontend/` copies:

- `frontend_self/public/logo.png`

If a merge replaces it, restore from `release/v${PREV}` (or last good EbeeAI commit).

## Required workflow

1. Branch / worktree:

```bash
git status --short --branch
git log --oneline -5 --decorate
```

Do not discard unrelated untracked trees (`reports/`, etc.) unless the user asks.

1. Identify upstream range:

```bash
UPSTREAM_FROM=v0.1.151
UPSTREAM_TO=v0.1.161
OLD_SELF_REF=release/v0.1.151
```

1. If files are still missing / stale, merge first:

```bash
.agents/skills/sub2api-rebase-check/scripts/merge-frontend-self-delta.sh \
  "$UPSTREAM_FROM" "$UPSTREAM_TO"
# resolve <<<<<<< markers; re-theme FALLBACK-UPSTREAM files
# if package.json overrides changed:
(cd frontend_self && CI=true pnpm install --no-frozen-lockfile)  # pnpm 9.x only
```

1. Strict audit:

```bash
.agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh \
  "$UPSTREAM_FROM" "$UPSTREAM_TO" \
  --old-self-ref "$OLD_SELF_REF" \
  --json /tmp/frontend_self_audit.json
```

### Hard gates (FAIL = exit 1)

| Gate | Pass criteria |
|---|---|
| **coverage** | every upstream-changed `frontend/src` file exists in `frontend_self` (adds/modifies); missing=0 |
| **integrity** | for every file that differs from upstream, upstream functional lines from `from→to` are present in self (style/theme-only lines exempt) |
| **locale** | modular `en`/`zh` trees: missing upstream keys = 0; required prefixes present (`home.seo`, `home.ebeeai`, `auth.seo`, `dashboard.platformQuota`, `admin.users.platformQuota`, `admin.settings.defaults.defaultPlatformQuotas`) |
| **theme** | markers: light lock + `DEFAULT_SITE_NAME` + `updateFavicon` in `main.ts`; no `toggleTheme` in AppSidebar; home `/` + `applyRouteSeo`; legal `/` + `DEFAULT_SITE_NAME`; DataTable enterprise header; Geist; `EbeeaiHomePage` + seo helpers + landing locales + logo file |
| **lockfile** | `frontend_self/package.json` `pnpm.overrides` **exactly matches** `pnpm-lock.yaml` `overrides:` (prevents CI frozen-lockfile failure) |
| **brand** | protected assets exist and **differ** from upstream |
| **features/routes** | all upstream router `path:` values exist in `frontend_self` router |

### Soft / expected

- **DIFFERS from upstream** on ~theme files is **OK** when integrity + theme pass. Do **not** force all-MATCH.
- Theme surface warnings vs `--old-self-ref` are warnings; investigate if many theme lines vanished.

### Locales note

Upstream and `frontend_self` use **modular** locales:

```text
frontend/src/i18n/locales/{en,zh}/index.ts
frontend_self/src/i18n/locales/{en,zh}/index.ts
```

There is **no** `en.ts` / `zh.ts` monolith. Audit loads the modular tree via TypeScript transpile (needs `typescript` in `frontend_self/node_modules` or `frontend/node_modules`).

1. Functional checks:

```bash
cd frontend_self && pnpm run typecheck
CI=true pnpm exec vitest run \
  src/components/home/__tests__/EbeeaiHomePage.spec.ts \
  src/router/__tests__/seo.spec.ts \
  src/components/admin/user/__tests__/UserPlatformQuotaModal.spec.ts \
  src/components/user/__tests__/UserPlatformQuotaCell.spec.ts \
  src/components/common/__tests__/DataTable.spec.ts \
  src/components/keys/__tests__/UseKeyModal.spec.ts
```

`make check-frontend-self-sync` is optional and **coarse** (may under-report custom diffs). Prefer the strict audit above for release gates.

## If checks fail

| Failure | Action |
|---|---|
| missing files | re-run merge script; copy upstream-added paths |
| integrity gaps | re-merge that file; ensure upstream logic kept beside enterprise classes |
| locale missing keys | merge modular locale files; never drop EbeeAI `home.*` / `auth.seo` |
| theme marker fail | restore from `OLD_SELF_REF` and re-apply on top of new upstream |
| lockfile mismatch | `CI=true pnpm install --no-frozen-lockfile` with **pnpm 9**; commit lockfile |
| logo matches upstream | restore EbeeAI `frontend_self/public/logo.png` from previous release |
| router paths missing | merge `router/index.ts` carefully; keep EbeeAI home/SEO meta |

## Completion standard

Report:

- upstream range + old_self_ref
- gate table (pass/fail) from audit JSON/summary
- exact vs differs counts; list differs (expected theme)
- locale key counts / missing
- typecheck + vitest results
- branch ahead/behind; untracked left untouched
- if used during release: whether GH Actions was/will be watched (see rebase-upstream-to-new-release)

**PASS** means all hard gates green. Do not call a release “verified” on quick MATCH listing alone.
