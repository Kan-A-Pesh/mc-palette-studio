#!/usr/bin/env bash
# TCP/HMAC protocol imports must stay inside packages/realtime (lib, internal, server factory).

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

is_allowed_tcp_file() {
  local file="$1"
  case "$file" in
    packages/realtime/src/lib/*|*/packages/realtime/src/lib/*) return 0 ;;
    packages/realtime/src/internal/*|*/packages/realtime/src/internal/*) return 0 ;;
    packages/realtime/src/server/create-server.ts|*/packages/realtime/src/server/create-server.ts) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  is_allowed_tcp_file "$file" && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — TCP protocol import outside packages/realtime/src/lib (use @repo/realtime/internal or server factory)"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'createTcp(Client|Server)|from ["'\''].*/(tcp-client|tcp-server|protocol)["'\'']|from ["'\'']@repo/realtime/lib' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: TCP protocol confined to packages/realtime"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
