#!/usr/bin/env bash
# createRealtimeEmitter must only be used from packages/server/src/services/realtime.service.ts.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

is_exempt() {
  local file="$1"
  case "$file" in
    packages/realtime/src/internal/create-emitter.ts|*/packages/realtime/src/internal/create-emitter.ts) return 0 ;;
    packages/realtime/src/internal/index.ts|*/packages/realtime/src/internal/index.ts) return 0 ;;
    packages/server/src/services/realtime.service.ts|*/packages/server/src/services/realtime.service.ts) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  is_exempt "$file" && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — import createRealtimeEmitter only via realtime.service.ts"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'createRealtimeEmitter|from ["'\'']@repo/realtime/internal["'\'']' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: realtime emitter access goes through realtime.service.ts"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
