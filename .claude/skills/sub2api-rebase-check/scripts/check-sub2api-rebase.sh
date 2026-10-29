#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <upstream-from-ref> <upstream-to-ref>" >&2
  echo "Example: $0 v0.1.130 v0.1.131" >&2
  exit 2
fi

from_ref="$1"
to_ref="$2"

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [[ ! -d frontend/src || ! -d frontend_self/src ]]; then
  echo "FAIL: expected frontend/src and frontend_self/src under $repo_root" >&2
  exit 1
fi

echo "Sub2API rebase check"
echo "repo: $repo_root"
echo "upstream range: $from_ref..$to_ref"
echo

failed=0

echo "1. Upstream frontend file sync"
while IFS=$'\t' read -r status path; do
  [[ -z "${status:-}" || -z "${path:-}" ]] && continue
  rel="${path#frontend/src/}"
  target="frontend_self/src/$rel"

  case "$status" in
    D)
      if [[ -e "$target" ]]; then
        echo "FAIL still exists after upstream deletion: $target"
        failed=1
      else
        echo "OK deleted in frontend_self: $target"
      fi
      ;;
    A|M)
      if [[ ! -e "$target" ]]; then
        echo "FAIL missing: $target"
        failed=1
        continue
      fi

      case "$rel" in
        i18n/locales/en.ts|i18n/locales/zh.ts)
          echo "CUSTOM locale merge expected: $target"
          ;;
        *)
          if cmp -s "frontend/src/$rel" "$target"; then
            echo "MATCH $target"
          else
            echo "FAIL differs from frontend: $target"
            failed=1
          fi
          ;;
      esac
      ;;
    *)
      echo "WARN unhandled git status $status for $path"
      ;;
  esac
done < <(git diff --name-status "$from_ref..$to_ref" -- frontend/src)

echo
echo "2. Locale key coverage"
node <<'NODE' || failed=1
const fs = require('fs')
const vm = require('vm')

function load(path) {
  const src = fs.readFileSync(path, 'utf8').replace(/^export default\s*/, 'module.exports = ')
  const context = { module: { exports: {} }, exports: {} }
  vm.runInNewContext(src, context, { filename: path })
  return context.module.exports
}

function flattenKeys(obj, prefix = '') {
  const out = []
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    out.push(path)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...flattenKeys(value, path))
    }
  }
  return out
}

const requiredLocalKeys = [
  'home.seo.title',
  'home.seo.description',
  'home.seo.defaultDescription',
  'home.ebeeai.nav.menu',
  'home.ebeeai.hero.title',
  'home.ebeeai.hero.titleLine2',
  'home.ebeeai.features.items.performance.title',
  'home.ebeeai.stats.logTitle',
  'home.ebeeai.faq.items.whatIsEbeeai.question',
  'home.ebeeai.faq.items.apiGateway.answer',
  'home.ebeeai.cta.button',
  'home.ebeeai.footer.privacy',
  'auth.seo.loginDescription',
  'auth.seo.registerDescription'
]

const requiredUpstreamKeys = [
  'dashboard.platformQuota.title',
  'admin.users.columns.balancePlatformQuota',
  'admin.users.platformQuota.title',
  'admin.users.platformQuota.cellNotConfigured',
  'admin.settings.defaults.defaultPlatformQuotas',
  'admin.settings.defaults.defaultPlatformQuotasHint',
  'admin.settings.platformQuota.platform',
  'admin.settings.authSourceDefaults.platformQuotasOverride',
  'admin.settings.authSourceDefaults.platformQuotasOverrideHint'
]

let failed = false

for (const lang of ['en', 'zh']) {
  const upstream = load(`frontend/src/i18n/locales/${lang}.ts`)
  const self = load(`frontend_self/src/i18n/locales/${lang}.ts`)
  const upstreamKeys = flattenKeys(upstream)
  const selfKeys = new Set(flattenKeys(self))
  const missingUpstream = upstreamKeys.filter((key) => !selfKeys.has(key))

  console.log(`${lang}: upstream keys=${upstreamKeys.length}, frontend_self keys=${selfKeys.size}, missing upstream keys=${missingUpstream.length}`)

  for (const key of missingUpstream.slice(0, 50)) {
    console.log(`FAIL missing upstream key ${lang}: ${key}`)
  }

  const missingRequired = [...requiredLocalKeys, ...requiredUpstreamKeys].filter((key) => !selfKeys.has(key))
  for (const key of missingRequired) {
    console.log(`FAIL missing required key ${lang}: ${key}`)
  }

  if (missingUpstream.length || missingRequired.length) failed = true
}

process.exit(failed ? 1 : 0)
NODE

echo
echo "3. Protected local brand assets"
protected_assets=(
  "public/logo.png"
)
for rel in "${protected_assets[@]}"; do
  self="frontend_self/$rel"
  upstream="frontend/$rel"
  if [[ ! -e "$self" ]]; then
    echo "FAIL protected asset missing: $self"
    failed=1
    continue
  fi
  if [[ -e "$upstream" ]] && cmp -s "$upstream" "$self"; then
    echo "FAIL protected asset matches upstream (ours may have been overwritten): $self"
    failed=1
  else
    echo "OK local brand asset preserved: $self"
  fi
done

echo
if [[ "$failed" -ne 0 ]]; then
  echo "FAIL: Sub2API rebase check found issues"
  exit 1
fi

echo "PASS: Sub2API rebase check completed"
