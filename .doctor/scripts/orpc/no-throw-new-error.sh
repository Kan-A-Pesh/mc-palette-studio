#!/usr/bin/env bash
# Flag `throw new Error(` in oRPC router files — must use ORPCError or custom error classes.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

ROUTERS_DIR="$SRC_DIR/packages/server/src/routers"
[[ -d "$ROUTERS_DIR" ]] || ROUTERS_DIR="$SRC_DIR"

should_skip() {
  local f="$1"
  case "$f" in
    *_app.ts) return 0 ;;
    */context.ts) return 0 ;;
    */services/*) return 0 ;;
    */routers/*) return 1 ;;
    *) return 0 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — throw new Error() not allowed in routers; use ORPCError or custom error class"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'throw[[:space:]]+new[[:space:]]+Error\(' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no throw new Error() in routers"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
