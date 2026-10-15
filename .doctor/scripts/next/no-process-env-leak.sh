#!/usr/bin/env bash
# Detects direct process.env.X accesses outside @repo/env (env vars must be validated)

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

in_scope() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*) return 1 ;;
  esac
  case "$f" in
    apps/*|*/apps/*) return 0 ;;
    packages/*|*/packages/*) return 0 ;;
    *) return 1 ;;
  esac
}

is_exempt() {
  local f="$1"
  local base
  base="$(basename "$f")"
  case "$f" in
    packages/env/*|*/packages/env/*) return 0 ;;
    */scripts/*|scripts/*) return 0 ;;
    # Dev-only tools must gate on the raw, statically inlined NEXT_PUBLIC_*
    # literal so the bundler can dead-code-eliminate them from production
    # builds. Routing the gate through the @repo/env wrapper defeats that
    # elimination (the imported constant is no longer foldable in-module), so
    # these files read process.env directly by design.
    */components/dev/*|components/dev/*) return 0 ;;
  esac
  case "$base" in
    env.ts) return 0 ;;
    next.config.js|next.config.ts|next.config.mjs) return 0 ;;
    drizzle.config.ts|drizzle.config.js|drizzle.config.mjs) return 0 ;;
    *.config.js|*.config.ts|*.config.mjs) return 0 ;;
  esac
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  in_scope "$file" || continue
  is_exempt "$file" && continue

  # Match every direct process.env access form:
  #   process.env.FOO          (dot access)
  #   process.env['FOO']       (bracket access, single or double quotes)
  #   const { FOO } = process.env   (destructuring — process.env followed by
  #                                  end / ; / whitespace, not another ident char)
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — direct process.env access (use @repo/env instead)"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'process\.env(\.[A-Za-z_]|\[|[^A-Za-z0-9_.]|$)' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no direct process.env access outside packages/env"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
