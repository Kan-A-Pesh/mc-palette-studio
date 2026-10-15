#!/usr/bin/env bash
# WARN when realtime event names do not follow domain:action kebab-case segments.

set -euo pipefail

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

EVENT_FILES=(
  "$SRC_DIR/packages/realtime/src/events/client-events.ts"
  "$SRC_DIR/packages/realtime/src/events/server-events.ts"
  "$SRC_DIR/packages/realtime/src/events/broker-events.ts"
)

for file in "${EVENT_FILES[@]}"; do
  [[ -f "$file" ]] || continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    event_name=$(echo "$content" | sed -nE 's/^[[:space:]]*"([^"]+)".*/\1/p')
    [[ -z "$event_name" ]] && continue
    if [[ ! "$event_name" =~ ^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$ ]]; then
      echo "WARN: $file:$line_no — event \"$event_name\" should use domain:action naming (e.g. notification:send)"
      WARNINGS=$((WARNINGS + 1))
    fi
  done < <(grep -nE '^[[:space:]]*"[^"]+":[[:space:]]*\{' "$file" 2>/dev/null || true)

done

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: no hard violations ($WARNINGS naming warning(s))"
  else
    echo "OK: all event names follow domain:action convention"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
