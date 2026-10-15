#!/usr/bin/env bash
# Detects hardcoded page-route string literals — use PAGES.* from @/constants/pages instead.
# Flags href / router.push / redirect / redirectTo / <Link href> with a literal "/..." page route.
# Ignores API routes (/api/...), external URLs (https://), assets (.png/.svg/...), and bare "/".

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

in_scope() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*) return 1 ;;
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) return 1 ;;
  esac
  case "$f" in
    # The PAGES constant itself is the single allowed home of route literals.
    apps/web/constants/pages.ts|*/apps/web/constants/pages.ts) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    *) return 1 ;;
  esac
}

# A "page route" literal: starts with "/", at least one path segment of
# letters/digits/dashes, NOT an API route, NOT an asset path. Bare "/" is ignored.
# The first segment char may be a digit so routes like /404, /2fa, /3d-view are
# caught (not only letter-initial routes).
ROUTE_RE='(href=|router\.push\(|router\.replace\(|redirect\(|redirectTo:[[:space:]]*|<Link[[:space:]][^>]*href=)[[:space:]]*\{?[[:space:]]*["'\'']/[A-Za-z0-9][A-Za-z0-9/_-]*["'\'']'

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  in_scope "$file" || continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue

    # Extract the offending route literal from the matched line.
    route="$(printf '%s' "$content" \
      | grep -oE '["'\'']/[A-Za-z0-9][A-Za-z0-9/_-]*["'\'']' \
      | head -n1 | tr -d '"'\''')"
    [[ -z "$route" ]] && continue

    # Skip API routes and asset-looking paths (defensive; regex already excludes most).
    case "$route" in
      /api|/api/*) continue ;;
      */fonts*|*/icon*|*/images/*|*/img/*|*/assets/*) continue ;;
      *.png|*.jpg|*.jpeg|*.svg|*.ico|*.webp|*.gif) continue ;;
    esac

    echo "FAIL: $file:$line_no — hardcoded route \"$route\", use PAGES.* from @/constants/pages"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE "$ROUTE_RE" "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no hardcoded page routes (PAGES.* used)"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
