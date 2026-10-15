#!/usr/bin/env bash
# Flags className={...} using string concat or template literals without cn()/clsx().

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

should_include() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/.next/*) return 1 ;;
    *packages/ui/src/icons/*) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    packages/ui/src/*|*/packages/ui/src/*) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_include "$file" || continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue

    # Only consider className={ ... }
    echo "$content" | grep -qE 'className=\{' || continue

    # If line uses cn( or clsx(, accept
    if echo "$content" | grep -qE '\b(cn|clsx)[[:space:]]*\('; then
      continue
    fi

    # Detect string concat with + inside className={...}
    # Extract the className={...} payload via a coarse match
    payload=$(echo "$content" | grep -oE 'className=\{[^}]*' || true)
    [[ -z "$payload" ]] && continue

    has_plus=0
    has_template=0

    # template literal with interpolation (check on the raw payload first, before
    # we strip backtick contents below).
    if echo "$payload" | grep -qE '`[^`]*\$\{'; then
      has_template=1
    fi

    # plus sign (concat) — but only REAL concatenation, not a literal '+' that
    # lives inside a string/template literal or a comment. Strip the contents of
    # "..." , '...' and `...` and any // trailing comment, then look for '+'.
    stripped=$(printf '%s' "$payload" \
      | sed -E "s/\"[^\"]*\"//g; s/'[^']*'//g" \
      | sed -E 's/`[^`]*`//g' \
      | sed -E 's@//.*@@')
    if echo "$stripped" | grep -qE '\+'; then
      has_plus=1
    fi

    if [[ "$has_plus" -eq 1 ]]; then
      echo "FAIL: $file:$line_no — className uses string concat ('+'); use cn() from @repo/ui/lib/utils"
      ERRORS=$((ERRORS + 1))
    elif [[ "$has_template" -eq 1 ]]; then
      echo "FAIL: $file:$line_no — className uses template literal with interpolation without cn(); use cn() from @repo/ui/lib/utils"
      ERRORS=$((ERRORS + 1))
    fi

  done < <(grep -nE 'className=\{' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: dynamic className values use cn() utility"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
