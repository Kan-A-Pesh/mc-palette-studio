#!/usr/bin/env bash
# apps/realtime must use @repo/env/apps-realtime (not web env or raw process.env).

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

REALTIME_APP="$SRC_DIR/apps/realtime/src"

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    apps/realtime/*|*/apps/realtime/*) ;;
    *) continue ;;
  esac
  [[ "$file" == "apps/realtime/src/index.ts" ]] && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    if echo "$content" | grep -q '@repo/env/apps-web'; then
      echo "FAIL: $file:$line_no — use @repo/env/apps-realtime in apps/realtime"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -n '@repo/env/' "$file" 2>/dev/null || true)

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — direct process.env access (use @repo/env/apps-realtime)"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'process\.env(\.[A-Za-z_][A-Za-z0-9_]*|\[)' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$REALTIME_APP" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: realtime env imports valid ($WARNINGS warning(s))"
  else
    echo "OK: apps/realtime uses validated env imports"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
