#!/usr/bin/env bash
# apps/web must use @repo/realtime/client — never import socket.io directly.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

WEB_DIR="$SRC_DIR/apps/web"

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — use @repo/realtime/client instead of socket.io in apps/web"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'from ["'\'']socket\.io(-client)?["'\'']|require\(["'\'']socket\.io' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$WEB_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: apps/web uses @repo/realtime/client for WebSocket access"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
