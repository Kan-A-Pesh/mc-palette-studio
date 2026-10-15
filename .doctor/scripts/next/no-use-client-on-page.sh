#!/usr/bin/env bash
# Detects "use client" on App Router page.tsx / layout.tsx files.
# Pages and layouts must stay Server Components — extract interactive parts into
# a child client component instead.

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
    apps/web/app/*page.tsx|*/apps/web/app/*page.tsx) return 0 ;;
    apps/web/app/*layout.tsx|*/apps/web/app/*layout.tsx) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  in_scope "$file" || continue

  if grep -qE '^[[:space:]]*["'\'']use client["'\''][[:space:]]*;?[[:space:]]*$' "$file" 2>/dev/null; then
    echo "FAIL: $file — \"use client\" forbidden on page/layout; extract the interactive part into a child client component"
    ERRORS=$((ERRORS + 1))
  fi

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no \"use client\" on page/layout files"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
