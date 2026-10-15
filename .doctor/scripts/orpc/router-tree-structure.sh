#!/usr/bin/env bash
# Each domain folder under routers/ that contains mutations/ or queries/ must
# also contain a router.ts file that composes those procedures.
#
# A "domain folder" is any directory under packages/server/src/routers/ that
# itself contains either a mutations/ or queries/ subfolder.
# Top-level group routers (e.g. admin/router.ts, client/router.ts) compose
# sub-domain routers — those are fine without mutations/queries of their own.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

ROUTERS_DIR="$SRC_DIR/packages/server/src/routers"
[[ -d "$ROUTERS_DIR" ]] || ROUTERS_DIR="$SRC_DIR/routers"
[[ -d "$ROUTERS_DIR" ]] || ROUTERS_DIR="$SRC_DIR"

# Find every directory containing a mutations/ or queries/ subfolder.
# Their parent is a "domain folder" — must have a router.ts.
#
# A domain may contain BOTH mutations/ and queries/; report each missing
# router.ts only ONCE per domain (otherwise the same domain is flagged twice).
REPORTED=$'\n'
while IFS= read -r sub; do
  [[ -z "$sub" ]] && continue
  case "$sub" in
    */node_modules/*|*/dist/*|*/.cache/*) continue ;;
  esac
  domain="$(dirname "$sub")"
  base="$(basename "$sub")"
  [[ "$base" == "mutations" || "$base" == "queries" ]] || continue

  if [[ ! -f "$domain/router.ts" ]]; then
    # Skip if this domain was already reported.
    [[ "$REPORTED" == *$'\n'"$domain"$'\n'* ]] && continue
    REPORTED+="$domain"$'\n'
    echo "FAIL: $domain — domain has mutations/ or queries/ but no router.ts to compose procedures"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find "$ROUTERS_DIR" -type d \( -name mutations -o -name queries \) 2>/dev/null | sort -u)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: every domain folder with mutations/ or queries/ has a router.ts"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
