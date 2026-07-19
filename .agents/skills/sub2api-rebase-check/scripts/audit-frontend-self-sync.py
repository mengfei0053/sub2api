#!/usr/bin/env python3
"""Strict frontend_self sync audit after an upstream Sub2API rebase.

Gates (any hard failure => exit 1):
  1. Coverage   — every upstream frontend/src change exists in frontend_self
                  (adds/modifies present; deletes absent unless intentionally kept)
  2. Integrity  — upstream functional delta (base→to) is present in frontend_self
                  for every differing file (3-way integrity)
  3. Locales    — modular en/zh key coverage missing=0 + required EbeeAI/upstream keys
  4. Theme      — EbeeAI customization markers still present
  5. Lockfile   — package.json pnpm.overrides match pnpm-lock.yaml overrides
  6. Brand      — protected assets differ from upstream

Differs-from-upstream alone is NOT a failure when the residual is the EbeeAI
theme/custom layer (exact-match FAIL is expected for themed files).

Usage:
  audit-frontend-self-sync.py <from-ref> <to-ref> [--json report.json] [--old-self-ref REF]
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any


REPO = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())

THEME_RE = re.compile(
    r"enterprise|ebeeai|EbeeAI|DEFAULT_SITE_NAME|config/seo|applyRouteSeo|"
    r"Geist|table-action-btn|use-key-code-block|bg-enterprise|text-enterprise|"
    r"#eae7e7|#1c1b1b|classList\.remove\(['\"]dark|"
    r"localStorage\.setItem\(['\"]theme['\"],\s*['\"]light|"
    r"to=\"/\"|path:\s*'/'",
    re.I,
)

REQUIRED_LOCAL_PREFIXES = [
    "home.seo",
    "home.ebeeai",
    "auth.seo",
]

REQUIRED_UPSTREAM_PREFIXES = [
    "dashboard.platformQuota",
    "admin.users.platformQuota",
    "admin.settings.defaults.defaultPlatformQuotas",
]

PROTECTED_ASSETS = [
    "public/logo.png",
]

LOCAL_ONLY_ARTIFACTS = [
    "frontend_self/src/components/home/EbeeaiHomePage.vue",
    "frontend_self/src/config/seo.ts",
    "frontend_self/src/router/seo.ts",
    "frontend_self/src/i18n/locales/en/landing.ts",
    "frontend_self/src/i18n/locales/zh/landing.ts",
    "frontend_self/public/logo.png",
]

THEME_MARKERS = {
    "main_light_lock": (
        "frontend_self/src/main.ts",
        lambda t: ("classList.remove('dark')" in t or 'classList.remove("dark")' in t)
        and ("theme" in t and "light" in t),
    ),
    "main_DEFAULT_SITE_NAME": (
        "frontend_self/src/main.ts",
        lambda t: "DEFAULT_SITE_NAME" in t,
    ),
    "main_updateFavicon": (
        "frontend_self/src/main.ts",
        lambda t: "updateFavicon" in t,
    ),
    "sidebar_no_theme_toggle": (
        "frontend_self/src/components/layout/AppSidebar.vue",
        lambda t: "toggleTheme" not in t,
    ),
    "router_home_slash": (
        "frontend_self/src/router/index.ts",
        lambda t: bool(re.search(r"path:\s*'/'", t) or re.search(r'path:\s*"/"', t)),
    ),
    "router_applyRouteSeo": (
        "frontend_self/src/router/index.ts",
        lambda t: "applyRouteSeo" in t,
    ),
    "legal_home_slash": (
        "frontend_self/src/views/public/LegalDocumentView.vue",
        lambda t: 'to="/"' in t and 'to="/home"' not in t,
    ),
    "legal_DEFAULT_SITE_NAME": (
        "frontend_self/src/views/public/LegalDocumentView.vue",
        lambda t: "DEFAULT_SITE_NAME" in t,
    ),
    "datatable_enterprise_header": (
        "frontend_self/src/components/common/DataTable.vue",
        lambda t: "bg-enterprise-surface-container-high" in t
        or "enterprise-surface-container-high" in t,
    ),
    "style_geist": (
        "frontend_self/src/style.css",
        lambda t: "Geist" in t,
    ),
    "ebeeai_homepage_component": (
        "frontend_self/src/components/home/EbeeaiHomePage.vue",
        lambda t: bool(t.strip()),
    ),
}


def run(cmd: list[str], check: bool = True) -> str:
    r = subprocess.run(cmd, cwd=REPO, text=True, capture_output=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"cmd failed ({r.returncode}): {' '.join(cmd)}\n{r.stderr}")
    return r.stdout


def git_show(spec: str) -> str | None:
    r = subprocess.run(["git", "show", spec], cwd=REPO, text=True, capture_output=True)
    if r.returncode != 0:
        return None
    return r.stdout


def file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_theme_line(s: str) -> bool:
    return bool(THEME_RE.search(s))


def is_styleish(s: str) -> bool:
    if "class=" in s or "class:[" in s or s.strip().startswith("@apply") or "dark:" in s:
        return True
    return bool(re.match(r"^[\'\"][^\'\"]*[\'\"],?$", s.strip()))


def nontrivial_added_lines(base: str, new: str) -> list[str]:
    added: list[str] = []
    for line in difflib.unified_diff(base.splitlines(), new.splitlines(), lineterm=""):
        if not line.startswith("+") or line.startswith("+++"):
            continue
        s = line[1:].strip()
        if not s or s.startswith(("//", "/*", "*")):
            continue
        if s in {
            "{",
            "}",
            "};",
            ")",
            ");",
            "]",
            "],",
            ">,",
            "/>",
            "</template>",
            "</script>",
            "</style>",
        }:
            continue
        added.append(s)
    return added


def line_in_text(line: str, text: str) -> bool:
    variants = [line, line.replace("'", '"'), line.replace('"', "'")]
    if any(v in text for v in variants):
        return True
    fp = re.sub(r"""(?::)?class(?:Name)?=["'][^"']*["']""", "", line)
    fp = re.sub(r"\s+", " ", fp).strip()
    return len(fp) > 20 and fp in re.sub(r"\s+", " ", text)


def parse_diff_name_status(from_ref: str, to_ref: str) -> list[tuple[str, str]]:
    out = run(["git", "diff", "--name-status", f"{from_ref}..{to_ref}", "--", "frontend/src"])
    rows: list[tuple[str, str]] = []
    for line in out.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        status = parts[0]
        # renames: R100\told\tnew — take new path
        path = parts[-1]
        rows.append((status[0], path))
    return rows


def load_locale_tree(lang: str, root: str) -> dict[str, Any]:
    """Load modular locale index via node+typescript transpile."""
    index = REPO / root / "src/i18n/locales" / lang / "index.ts"
    if not index.exists():
        # legacy monolithic
        mono = REPO / root / "src/i18n/locales" / f"{lang}.ts"
        if mono.exists():
            return load_locale_monolith(mono)
        raise FileNotFoundError(f"locale missing: {index}")

    script = r"""
const fs = require('fs');
const path = require('path');
let ts;
const candidates = [
  path.resolve('frontend_self/node_modules/typescript'),
  path.resolve('frontend/node_modules/typescript'),
  'typescript',
];
for (const c of candidates) {
  try { ts = require(c); break; } catch {}
}
if (!ts) { console.error('typescript module not found'); process.exit(2); }

function loadTs(file) {
  const src = fs.readFileSync(file, 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const module = { exports: {} };
  const dirname = path.dirname(file);
  const requireRel = (p) => {
    if (p.startsWith('.')) {
      let full = path.resolve(dirname, p);
      if (fs.existsSync(full + '.ts')) return loadTs(full + '.ts');
      if (fs.existsSync(path.join(full, 'index.ts'))) return loadTs(path.join(full, 'index.ts'));
    }
    return require(p);
  };
  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', outputText);
  fn(module.exports, requireRel, module, file, dirname);
  return module.exports.default || module.exports;
}

const lang = process.argv[1];
const root = process.argv[2];
const data = loadTs(path.resolve(root, 'src/i18n/locales', lang, 'index.ts'));
process.stdout.write(JSON.stringify(data));
"""
    r = subprocess.run(
        ["node", "-e", script, lang, root],
        cwd=REPO,
        text=True,
        capture_output=True,
    )
    if r.returncode != 0:
        raise RuntimeError(f"locale load failed for {root} {lang}: {r.stderr}")
    return json.loads(r.stdout)


def load_locale_monolith(path: Path) -> dict[str, Any]:
    # Prefer node for consistency
    script = r"""
const fs = require('fs');
const vm = require('vm');
const p = process.argv[1];
const src = fs.readFileSync(p, 'utf8').replace(/^export default\s*/, 'module.exports = ');
const context = { module: { exports: {} }, exports: {} };
vm.runInNewContext(src, context, { filename: p });
process.stdout.write(JSON.stringify(context.module.exports));
"""
    r = subprocess.run(["node", "-e", script, str(path)], cwd=REPO, text=True, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f"monolith locale load failed: {path}: {r.stderr}")
    return json.loads(r.stdout)


def flatten_keys(obj: Any, prefix: str = "") -> set[str]:
    out: set[str] = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f"{prefix}.{k}" if prefix else str(k)
            out.add(p)
            out |= flatten_keys(v, p)
    return out


def has_prefix(keys: set[str], pref: str) -> bool:
    return any(k == pref or k.startswith(pref + ".") for k in keys)


def parse_package_overrides(pkg_path: Path) -> dict[str, str]:
    data = json.loads(pkg_path.read_text())
    return dict(data.get("pnpm", {}).get("overrides") or {})


def parse_lockfile_overrides(lock_path: Path) -> dict[str, str]:
    if not lock_path.exists():
        return {}
    lines = lock_path.read_text().splitlines()
    overrides: dict[str, str] = {}
    i = 0
    while i < len(lines):
        if lines[i].strip() == "overrides:":
            i += 1
            while i < len(lines):
                line = lines[i]
                if not line.startswith("  ") or line.startswith("    "):
                    # top-level next key (no indent) or deeper — stop on no indent
                    if not line.startswith(" "):
                        break
                    if line.startswith("    "):
                        i += 1
                        continue
                m = re.match(r"^  (.+?):\s*(.*)$", line)
                if not m:
                    if line.startswith("  "):
                        i += 1
                        continue
                    break
                key = m.group(1).strip().strip("'\"")
                val = m.group(2).strip().strip("'\"")
                overrides[key] = val
                i += 1
            break
        i += 1
    return overrides


def audit(from_ref: str, to_ref: str, old_self_ref: str | None) -> dict[str, Any]:
    report: dict[str, Any] = {
        "from_ref": from_ref,
        "to_ref": to_ref,
        "old_self_ref": old_self_ref,
        "gates": {},
        "summary": {},
        "failures": [],
        "warnings": [],
        "differs": [],
        "features": {},
    }
    failures: list[str] = []
    warnings: list[str] = []

    # ---------- 1. Coverage ----------
    rows = parse_diff_name_status(from_ref, to_ref)
    missing: list[str] = []
    deleted_still: list[str] = []
    exact = 0
    differs: list[str] = []
    added_files: list[str] = []

    for status, path in rows:
        if not path.startswith("frontend/src/"):
            continue
        rel = path[len("frontend/") :]  # src/...
        self_path = REPO / "frontend_self" / rel
        up_path = REPO / "frontend" / rel

        if status == "D":
            if self_path.exists():
                # Keep only if it still differs from old base (custom). Soft-warn.
                deleted_still.append(rel)
            continue

        if status == "A":
            added_files.append(rel)

        if not self_path.exists():
            missing.append(rel)
            continue

        if up_path.exists() and file_sha(self_path) == file_sha(up_path):
            exact += 1
        else:
            differs.append(rel)

    if missing:
        failures.append(f"coverage: missing {len(missing)} upstream-changed files in frontend_self")
    if deleted_still:
        # Not always wrong (custom file), but report
        warnings.append(
            f"coverage: {len(deleted_still)} files deleted upstream still present in frontend_self"
        )

    report["gates"]["coverage"] = {
        "total_upstream_src_changes": len(rows),
        "missing": missing,
        "exact_match": exact,
        "differs_count": len(differs),
        "differs": differs,
        "added_files": added_files,
        "deleted_still_present": deleted_still,
        "pass": not missing,
    }
    report["differs"] = differs

    # ---------- 2. 3-way integrity on differs ----------
    integrity_gaps: list[dict[str, Any]] = []
    integrity_ok = 0
    for rel in differs:
        base = git_show(f"{from_ref}:frontend/{rel}")
        new = git_show(f"{to_ref}:frontend/{rel}")
        self_text = (REPO / "frontend_self" / rel).read_text(errors="replace")
        if new is None:
            continue
        if base is None:
            # pure add that differs — should be rare; treat as gap if self missing distinctive new lines
            added = nontrivial_added_lines("", new)[:50]
        else:
            added = nontrivial_added_lines(base, new)

        missing_up: list[str] = []
        for line in added:
            if is_theme_line(line):
                continue
            if line_in_text(line, self_text):
                continue
            if is_styleish(line) and not re.search(
                r"\b(function|const |let |import |export |await |emit\(|define\w+|router\.|api\.|fetch\()",
                line,
            ):
                continue
            missing_up.append(line[:160])

        if missing_up:
            integrity_gaps.append({"file": rel, "missing_samples": missing_up[:15], "count": len(missing_up)})
        else:
            integrity_ok += 1

    if integrity_gaps:
        failures.append(
            f"integrity: {len(integrity_gaps)} differing files missing upstream functional lines"
        )

    report["gates"]["integrity"] = {
        "checked_differs": len(differs),
        "ok": integrity_ok,
        "gaps": integrity_gaps,
        "pass": not integrity_gaps,
    }

    # ---------- 3. Locales ----------
    locale_report: dict[str, Any] = {}
    locale_failed = False
    for lang in ("en", "zh"):
        try:
            up = load_locale_tree(lang, "frontend")
            self = load_locale_tree(lang, "frontend_self")
        except Exception as e:
            locale_failed = True
            locale_report[lang] = {"error": str(e)}
            failures.append(f"locale: failed to load {lang}: {e}")
            continue
        uk = flatten_keys(up)
        sk = flatten_keys(self)
        missing_keys = sorted(k for k in uk if k not in sk)
        req = REQUIRED_LOCAL_PREFIXES + REQUIRED_UPSTREAM_PREFIXES
        req_missing = [p for p in req if not has_prefix(sk, p)]
        locale_report[lang] = {
            "upstream_keys": len(uk),
            "self_keys": len(sk),
            "missing_upstream": len(missing_keys),
            "missing_sample": missing_keys[:30],
            "required_missing": req_missing,
        }
        if missing_keys or req_missing:
            locale_failed = True
            failures.append(
                f"locale[{lang}]: missing_upstream={len(missing_keys)} required_missing={req_missing}"
            )

    report["gates"]["locale"] = {"pass": not locale_failed, "langs": locale_report}

    # ---------- 4. Theme / custom markers ----------
    theme_results: dict[str, bool] = {}
    for name, (path, pred) in THEME_MARKERS.items():
        p = REPO / path
        if not p.exists():
            theme_results[name] = False
            failures.append(f"theme: missing file for marker {name}: {path}")
            continue
        ok = bool(pred(p.read_text(errors="replace")))
        theme_results[name] = ok
        if not ok:
            failures.append(f"theme: marker failed: {name}")

    for art in LOCAL_ONLY_ARTIFACTS:
        if not (REPO / art).exists():
            theme_results[f"artifact:{art}"] = False
            failures.append(f"theme: local-only artifact missing: {art}")
        else:
            theme_results[f"artifact:{art}"] = True

    # Optional: compare custom surface vs old_self_ref
    theme_surface: dict[str, Any] = {}
    if old_self_ref:
        for rel in differs:
            old_self = git_show(f"{old_self_ref}:frontend_self/{rel}")
            old_up = git_show(f"{from_ref}:frontend/{rel}")
            new_up = git_show(f"{to_ref}:frontend/{rel}")
            new_self_p = REPO / "frontend_self" / rel
            if not all([old_self, old_up, new_up]) or not new_self_p.exists():
                continue
            new_self = new_self_p.read_text(errors="replace")
            old_custom = set(old_self.splitlines()) - set(old_up.splitlines())
            lost = [
                line
                for line in old_custom
                if line.strip()
                and len(line.strip()) > 8
                and line not in new_self.splitlines()
                and is_theme_line(line)
                and not line_in_text(line.strip(), new_self)
            ]
            theme_surface[rel] = {"old_custom_lines": len(old_custom), "lost_theme_lines": len(lost)}
            if lost:
                warnings.append(f"theme surface: {rel} lost ~{len(lost)} theme lines vs {old_self_ref}")

    report["gates"]["theme"] = {
        "markers": theme_results,
        "surface": theme_surface,
        "pass": all(theme_results.values()),
    }

    # ---------- 5. Lockfile overrides ----------
    pkg_ov = parse_package_overrides(REPO / "frontend_self/package.json")
    lock_ov = parse_lockfile_overrides(REPO / "frontend_self/pnpm-lock.yaml")
    # also ensure deps keys present in both if package has them
    lock_mismatch = {k: (pkg_ov.get(k), lock_ov.get(k)) for k in set(pkg_ov) | set(lock_ov) if pkg_ov.get(k) != lock_ov.get(k)}
    # form-data and js-cookie must match when present in package
    if lock_mismatch:
        failures.append(
            "lockfile: package.json pnpm.overrides != pnpm-lock.yaml overrides: "
            + json.dumps(lock_mismatch, ensure_ascii=False)
        )
    # message-compiler if in package should be installable (presence check only)
    pkg = json.loads((REPO / "frontend_self/package.json").read_text())
    has_mc = "@intlify/message-compiler" in (pkg.get("devDependencies") or {})
    report["gates"]["lockfile"] = {
        "package_overrides": pkg_ov,
        "lockfile_overrides": lock_ov,
        "mismatch": lock_mismatch,
        "has_message_compiler": has_mc,
        "pass": not lock_mismatch,
    }

    # ---------- 6. Brand assets ----------
    brand_ok = True
    brand: dict[str, Any] = {}
    for rel in PROTECTED_ASSETS:
        self_p = REPO / "frontend_self" / rel
        up_p = REPO / "frontend" / rel
        if not self_p.exists():
            brand_ok = False
            brand[rel] = "missing"
            failures.append(f"brand: protected asset missing: frontend_self/{rel}")
        elif up_p.exists() and file_sha(self_p) == file_sha(up_p):
            brand_ok = False
            brand[rel] = "matches_upstream"
            failures.append(f"brand: protected asset matches upstream: frontend_self/{rel}")
        else:
            brand[rel] = "preserved"
    report["gates"]["brand"] = {"assets": brand, "pass": brand_ok}

    # ---------- Feature inventory (new upstream files + route paths) ----------
    feature_bad: list[str] = []
    for rel in added_files:
        self_p = REPO / "frontend_self" / rel
        up_p = REPO / "frontend" / rel
        if not self_p.exists():
            feature_bad.append(f"missing add: {rel}")
        elif up_p.exists() and file_sha(self_p) != file_sha(up_p):
            # new files should usually be exact; theme rarely applies
            warnings.append(f"feature: new file differs from upstream: {rel}")

    up_router = git_show(f"{to_ref}:frontend/src/router/index.ts") or ""
    self_router = (REPO / "frontend_self/src/router/index.ts").read_text(errors="replace")
    up_paths = set(re.findall(r"path:\s*['\"]([^'\"]+)['\"]", up_router))
    self_paths = set(re.findall(r"path:\s*['\"]([^'\"]+)['\"]", self_router))
    missing_paths = sorted(up_paths - self_paths)
    extra_paths = sorted(self_paths - up_paths)
    if missing_paths:
        failures.append(f"routes: missing upstream paths in frontend_self: {missing_paths}")
        feature_bad.extend(missing_paths)

    report["features"] = {
        "upstream_added_files": len(added_files),
        "added_problems": feature_bad,
        "router_upstream_paths": len(up_paths),
        "router_self_paths": len(self_paths),
        "router_missing": missing_paths,
        "router_extra": extra_paths,
        "pass": not missing_paths and not any(x.startswith("missing add") for x in feature_bad),
    }
    if not report["features"]["pass"]:
        # already in failures
        pass

    # ---------- Summary ----------
    gates_pass = {
        "coverage": report["gates"]["coverage"]["pass"],
        "integrity": report["gates"]["integrity"]["pass"],
        "locale": report["gates"]["locale"]["pass"],
        "theme": report["gates"]["theme"]["pass"],
        "lockfile": report["gates"]["lockfile"]["pass"],
        "brand": report["gates"]["brand"]["pass"],
        "features": report["features"]["pass"],
    }
    report["summary"] = {
        "all_pass": all(gates_pass.values()) and not failures,
        "gates": gates_pass,
        "differs_expected_theme": len(differs),
        "exact_match": exact,
        "failure_count": len(failures),
        "warning_count": len(warnings),
    }
    report["failures"] = failures
    report["warnings"] = warnings
    return report


def print_human(report: dict[str, Any]) -> None:
    s = report["summary"]
    print("=== frontend_self sync audit ===")
    print(f"range: {report['from_ref']} .. {report['to_ref']}")
    if report.get("old_self_ref"):
        print(f"old_self_ref: {report['old_self_ref']}")
    print()
    for name, ok in s["gates"].items():
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
    print()
    g = report["gates"]
    print(
        f"coverage: upstream_changes={g['coverage']['total_upstream_src_changes']} "
        f"exact={g['coverage']['exact_match']} differs={g['coverage']['differs_count']} "
        f"missing={len(g['coverage']['missing'])}"
    )
    if g["coverage"]["missing"]:
        for m in g["coverage"]["missing"][:40]:
            print(f"  MISSING {m}")
    print(
        f"integrity: ok={g['integrity']['ok']} gaps={len(g['integrity']['gaps'])}"
    )
    for gap in g["integrity"]["gaps"][:10]:
        print(f"  GAP {gap['file']} missing≈{gap['count']}")
        for sample in gap["missing_samples"][:5]:
            print(f"    - {sample}")
    for lang, info in g["locale"]["langs"].items():
        if "error" in info:
            print(f"locale[{lang}]: ERROR {info['error']}")
        else:
            print(
                f"locale[{lang}]: up={info['upstream_keys']} self={info['self_keys']} "
                f"missing={info['missing_upstream']} req_missing={info['required_missing']}"
            )
    print(f"theme markers: {Counter(report['gates']['theme']['markers'].values())}")
    print(
        f"lockfile overrides package={g['lockfile']['package_overrides']} "
        f"lock={g['lockfile']['lockfile_overrides']}"
    )
    print(f"brand: {g['brand']['assets']}")
    print(
        f"routes: up={report['features']['router_upstream_paths']} "
        f"self={report['features']['router_self_paths']} "
        f"missing={report['features']['router_missing']}"
    )
    if report["differs"]:
        print(f"\nexpected theme/custom differs ({len(report['differs'])}):")
        for d in report["differs"]:
            print(f"  - {d}")
    if report["warnings"]:
        print("\nWARNINGS:")
        for w in report["warnings"]:
            print(f"  - {w}")
    if report["failures"]:
        print("\nFAILURES:")
        for f in report["failures"]:
            print(f"  - {f}")
    print()
    if s["all_pass"]:
        print("PASS: frontend_self sync audit")
    else:
        print("FAIL: frontend_self sync audit")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("from_ref")
    ap.add_argument("to_ref")
    ap.add_argument("--json", dest="json_path", default="")
    ap.add_argument(
        "--old-self-ref",
        default="",
        help="Previous EbeeAI release ref for theme surface compare, e.g. release/v0.1.151",
    )
    args = ap.parse_args()
    report = audit(args.from_ref, args.to_ref, args.old_self_ref or None)
    print_human(report)
    if args.json_path:
        Path(args.json_path).write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote {args.json_path}")
    return 0 if report["summary"]["all_pass"] else 1


if __name__ == "__main__":
    sys.exit(main())
