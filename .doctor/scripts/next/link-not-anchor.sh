#!/usr/bin/env bash
# Detects <a href="/..."> internal anchors — use <Link> from next/link instead

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

in_scope() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*) return 1 ;;
    *.test.tsx|*.spec.tsx) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    packages/ui/*|*/packages/ui/*) return 0 ;;
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
    echo "FAIL: $file:$line_no — internal <a href=\"/...\"> — use <Link> from next/link"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE '<a[[:space:]]+[^>]*href=["'\'']/[^"'\'']*["'\'']' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no internal <a> tags (Link used for internal navigation)"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
