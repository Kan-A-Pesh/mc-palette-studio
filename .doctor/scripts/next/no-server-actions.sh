#!/usr/bin/env bash
# Detects server actions ('use server' directive) — banned in this org, use oRPC

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

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    apps/realtime/*) continue ;;
    */apps/realtime/*) continue ;;
  esac
  in_scope "$file" || continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    # File-level directive: line begins with 'use server' or "use server"
    if echo "$content" | grep -qE "^[[:space:]]*['\"]use server['\"]"; then
      echo "FAIL: $file:$line_no — 'use server' directive (server actions banned, use oRPC)"
      ERRORS=$((ERRORS + 1))
      continue
    fi
    # Inline server action: 'use server'; inside a function body
    if echo "$content" | grep -qE "['\"]use server['\"][[:space:]]*;"; then
      echo "FAIL: $file:$line_no — inline 'use server' (server actions banned, use oRPC)"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -nE "['\"]use server['\"]" "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no server actions ('use server') found"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
