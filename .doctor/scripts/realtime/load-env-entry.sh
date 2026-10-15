#!/usr/bin/env bash
# apps/realtime entry must import @repo/env/load-env before other app modules.

set -euo pipefail

SRC_DIR="${1:-.}"
ENTRY="$SRC_DIR/apps/realtime/src/index.ts"

if [[ ! -f "$ENTRY" ]]; then
  echo "FAIL: $ENTRY — missing realtime entry file"
  exit 1
fi

first_import=$(grep -nE '^import ' "$ENTRY" | head -1 || true)

if [[ -z "$first_import" ]]; then
  echo "FAIL: $ENTRY — no import statements found"
  exit 1
fi

if ! echo "$first_import" | grep -q '@repo/env/load-env'; then
  line_no="${first_import%%:*}"
  echo "FAIL: $ENTRY:$line_no — first import must be @repo/env/load-env"
  exit 1
fi

echo "OK: apps/realtime loads env before bootstrap"
