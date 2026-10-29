---
name: rebase-upstream-to-new-release
description: Use when upgrading EbeeAI to a newer upstream Sub2API version — e.g. moving release/v0.1.131 to release/v0.1.132, or when the user says "同步上游并出新 release", "rebase 到新上游 tag", or "升级到 vX.Y.Z". Use at the start of such an upgrade. NOT for a plain main-only mirror sync (use sync-upstream for that).
---

# Rebase Upstream to New Release

## Overview

EbeeAI tracks upstream `Wei-Shaw/sub2api` by version. `main` is a pure upstream mirror; EbeeAI custom commits live on the **current release branch** (there is no `main_self`). Upgrading to a new upstream version means: sync upstream → cut a NEW release branch from the current one → rebase EbeeAI commits onto the new upstream tag → reconcile `frontend_self/` with upstream `frontend/` → hard-gate verify (upstream features + theme + lockfile) → publish tag → **wait for GitHub Actions success**.

Authoritative manual notes also live in `deploy_ebeeai/RELEASE_PROCESS.md`; this skill is the **end-to-end agent runbook** with hard gates.

**REQUIRED SUB-SKILL / SCRIPTS:**

- `.agents/skills/sub2api-rebase-check/scripts/merge-frontend-self-delta.sh` — bulk 3-way merge
- `.agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh` — strict audit (coverage/integrity/locale/theme/lockfile/brand/routes)
- `.agents/skills/sub2api-rebase-check/scripts/audit-frontend-self-sync.py` — audit implementation

## Hard guarantees (do not publish if any fail)

| Guarantee | How enforced |
|---|---|
| **Upstream new features not missing** | coverage missing=0; new files present; router paths missing=[]; integrity gaps=0 |
| **Upstream functions still work in self** | 3-way integrity on every themed differ; `pnpm typecheck`; focused vitest |
| **EbeeAI custom theme intact** | theme markers gate; logo protected; local-only artifacts present; residual differs allowed only as theme layer |
| **GitHub Action release succeeds** | lockfile overrides == package.json; pnpm 9 refresh; tag only after local gates; wait for `EbeeAI Release` workflow |

**Never chase all-MATCH vs upstream.** Theme files MUST differ. Exact-match FAIL on themed files is expected; **integrity + theme markers** are the real gates.

## Variables

- `PREV` — upstream version the current release is based on (e.g. `0.1.151`)
- `VERSION` — new upstream version to upgrade to (e.g. `0.1.161`)
- `EBEEAI` — EbeeAI service version; **start at `0.0.1` for each new upstream version**; bump patch (`0.0.2`…) only when re-publishing after a failed/partial release on the same upstream

Detect PREV from the current branch when possible:

```sh
git branch --show-current   # e.g. release/v0.1.151
cat backend/cmd/server/VERSION
```

## Steps

### 0. Preflight

```sh
git status --short --branch
git remote -v   # need origin + upstream
git fetch upstream && git fetch upstream --tags && git fetch origin --tags
git rev-parse --verify v${VERSION}   # must exist after fetch
```

- Stash or discard **unrelated** local dirty files (do not commit formatter-only noise into the release).
- Leave untracked dirs alone (`reports/`, `db_backup/`, `frontend_docs/` build output, etc.).
- Confirm `v${VERSION}` tag exists on upstream.

### 1. Sync `main` to upstream (pure mirror)

```sh
git switch main
git log --oneline upstream/main..main   # MUST be empty; if not, investigate before resetting
git reset --hard upstream/main
git push origin main --force-with-lease
git push origin --tags
```

`main` must have **NO** custom commits.

### 2. Cut new release branch + rebase onto the new tag

```sh
git switch release/v${PREV}
git switch -c release/v${VERSION}
git rebase --onto v${VERSION} v${PREV}
```

Original `release/v${PREV}` stays untouched.

On conflict:

1. Resolve carefully (prefer keeping **both** upstream logic and EbeeAI behavior).
2. Common hotspots: `backend/go.sum` (keep both sides / `go mod tidy`), `backend/cmd/server/VERSION` (set to `${VERSION}`), deploy Dockerfiles.
3. `git add` → `GIT_EDITOR=true git rebase --continue`.
4. Empty duplicate commits: `git rebase --skip`.
5. Stale `.git/index.lock` with no live git process: remove lock and continue.

Do **not** finish this step until `git status` shows a clean rebase on `release/v${VERSION}`.

### 3. Reconcile `frontend_self` with upstream frontend delta

Rebase only replays OUR commits; it does **NOT** pull upstream's new `frontend/` into `frontend_self/`.

```sh
.agents/skills/sub2api-rebase-check/scripts/merge-frontend-self-delta.sh v${PREV} v${VERSION}
```

Then **manually resolve**:

- any `<<<<<<<` conflict markers under `frontend_self/`
- any `FALLBACK-UPSTREAM` / `CONFLICT` lines in `/tmp/frontend_self_merge.log` — re-apply EbeeAI theme if a customized file was force-taken from upstream

**Protected:** never overwrite `frontend_self/public/logo.png` with upstream.

**Locales:** modular under `frontend_self/src/i18n/locales/{en,zh}/` (not monolithic `en.ts`/`zh.ts`). Prefer 3-way merge of modular files; ensure EbeeAI keys in `landing.ts` / `common.ts` (`home.seo`, `home.ebeeai`, `auth.seo`) remain.

**package.json / lockfile (CI-critical):**

- merge script unions upstream `dependencies` / `devDependencies` keys and `pnpm.overrides`
- **must** refresh lockfile with **pnpm 9** (CI image uses pnpm@9), never commit a pnpm 11 rewrite that drops overrides:

```sh
corepack prepare pnpm@9 --activate   # or ensure pnpm -v is 9.x
cd frontend_self && CI=true pnpm install --no-frozen-lockfile && cd ..
# verify overrides block exists in both files and matches
```

If `package.json` has `form-data@<4.0.6` (or any override) but `pnpm-lock.yaml` `overrides:` does not, **Docker `pnpm install --frozen-lockfile` will fail** (`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`).

### 4. Strict audit (hard gate — do not proceed on FAIL)

```sh
.agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh \
  v${PREV} v${VERSION} \
  --old-self-ref release/v${PREV} \
  --json /tmp/frontend_self_audit.json
```

**Required PASS gates:** coverage, integrity, locale, theme, lockfile, brand, features/routes.

If FAIL: fix merge / theme / lockfile, re-run audit until PASS. Do not tag.

### 5. Bump VERSION + local functional verify

```sh
echo "${VERSION}" > backend/cmd/server/VERSION
cd frontend_self
pnpm run typecheck
CI=true pnpm exec vitest run \
  src/components/home/__tests__/EbeeaiHomePage.spec.ts \
  src/router/__tests__/seo.spec.ts \
  src/components/admin/user/__tests__/UserPlatformQuotaModal.spec.ts \
  src/components/user/__tests__/UserPlatformQuotaCell.spec.ts \
  src/components/common/__tests__/DataTable.spec.ts \
  src/components/keys/__tests__/UseKeyModal.spec.ts
cd ..
```

Optional but recommended when deploy/Dockerfile changed:

```sh
docker compose --env-file deploy_ebeeai/.env.example -f deploy_ebeeai/docker-compose.yml config --quiet
```

Commit release work on the branch (sync + VERSION + lockfile fixes) with clear messages, e.g.:

- `chore: sync frontend_self for upstream v${VERSION}`
- `fix(release): sync frontend_self lockfile overrides for pnpm frozen install`

### 6. Push branch, confirm, then tag

```sh
git push -u origin release/v${VERSION}
```

**Confirm with the user before pushing the publish tag** (real GHCR images + GitHub Release).

```sh
git tag -a v${VERSION}_${EBEEAI} -m "EbeeAI release v${VERSION}_${EBEEAI}"
git push origin v${VERSION}_${EBEEAI}
```

Tag format: `v<upstream>_<ebeeai>`. New upstream version → start `EBEEAI=0.0.1`. Re-release after fix on same upstream → bump to `0.0.2`, etc. Prefer a new patch tag over force-moving a published tag.

### 7. Wait for GitHub Actions (hard gate)

```sh
# Use the fork repo explicitly
gh run list -R mengfei0053/sub2api --workflow=ebeeai-release.yml --limit 3
# Watch the run for this tag
gh run watch -R mengfei0053/sub2api <run-id>
# Or poll:
gh run list -R mengfei0053/sub2api --workflow=ebeeai-release.yml --limit 1
gh release view v${VERSION}_${EBEEAI} -R mengfei0053/sub2api
```

Workflow: `.github/workflows/ebeeai-release.yml` (`EbeeAI Release`).

Must succeed end-to-end:

- Build and push **backend**, **app**, **docs**, **gateway**
- Create GitHub Release

If **app** fails on `pnpm install --frozen-lockfile` → lockfile/overrides mismatch; fix on branch, bump `EBEEAI` patch, retag, re-watch.

Do **not** report overall success until the workflow conclusion is `success` and `gh release view` works.

## Judgment calls / gotchas

- **rebase-check exact-match DIFFERS are EXPECTED** for theme-customized files (account modals, admin views, `UseKeyModal.vue`, `DataTable.vue`, `AppSidebar.vue`, `main.ts`, `style.css`, etc.). Correctness = integrity + theme markers + typecheck/tests — not all-MATCH.
- **Modular i18n:** do not look for `frontend/src/i18n/locales/en.ts`; use `en/index.ts` tree. Old docs mentioning monolithic files are stale.
- **Pre-existing test failures** unrelated to the rebase may exist. Compare against pre-rebase branch in a worktree before blocking.
- **Lockfile drift:** local pnpm 11 may rewrite `frontend_self/pnpm-lock.yaml` and drop `overrides`. Always refresh with **pnpm 9** + `CI=true` before commit.
- `check-sub2api-rebase.sh` lists files alphabetically in the quick section — read full audit summary; do not `tail` alone.
- Partial image from a failed tag may leave backend tags on GHCR; still publish a new `_<patch>` tag for a complete stack.
- Formatter-only dirt (quotes/semicolons on `main.ts`) → `git restore`, do not commit.

## Final report template (required output)

After finishing (or stopping on a gate), always print:

```markdown
## 更新结果
- PREV → VERSION: `0.x.y` → `0.x.z`
- Branch: `release/v…` (pushed: yes/no)
- Tag: `v…_…` (pushed: yes/no)
- EBEEAI: `0.0.x`
- Commits: (short list)
- GHCR / Release URL: …

## 检查结果
| Gate | Result | Notes |
|---|---|---|
| main mirror clean | PASS/FAIL | |
| rebase completed | PASS/FAIL | conflicts resolved? |
| frontend_self coverage missing=0 | PASS/FAIL | N upstream files |
| integrity gaps=0 | PASS/FAIL | |
| locale missing=0 (en/zh) | PASS/FAIL | key counts |
| theme markers | PASS/FAIL | logo, light lock, SEO keys… |
| lockfile overrides match | PASS/FAIL | |
| typecheck | PASS/FAIL | |
| focused vitest | PASS/FAIL | n tests |
| EbeeAI Release workflow | PASS/FAIL | run URL |
| GitHub Release published | PASS/FAIL | URL |

## 主题残留差异 (expected)
- list of differs files (theme only)

## 阻断项 / 后续
- none | …
```

## Quick reference

| Step | Command |
|---|---|
| sync main | `git reset --hard upstream/main && git push origin main --force-with-lease && git push origin --tags` |
| cut + rebase | `git switch -c release/v${VERSION} && git rebase --onto v${VERSION} v${PREV}` |
| merge self | `.agents/skills/sub2api-rebase-check/scripts/merge-frontend-self-delta.sh v${PREV} v${VERSION}` |
| lockfile | `(cd frontend_self && CI=true pnpm install --no-frozen-lockfile)` with pnpm 9 |
| audit | `.agents/skills/sub2api-rebase-check/scripts/check-sub2api-rebase.sh v${PREV} v${VERSION} --old-self-ref release/v${PREV}` |
| bump + check | `echo ${VERSION} > backend/cmd/server/VERSION; (cd frontend_self && pnpm run typecheck && CI=true pnpm exec vitest run …)` |
| publish | `git push -u origin release/v${VERSION}; git tag -a v${VERSION}_${EBEEAI} -m …; git push origin v${VERSION}_${EBEEAI}` |
| watch CI | `gh run list -R mengfei0053/sub2api --workflow=ebeeai-release.yml` + `gh run watch` |
