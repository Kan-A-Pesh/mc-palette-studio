#!/usr/bin/env bash
# Ensures apps/realtime handler registry keys match event definitions in packages/realtime.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="${1:-.}"

ERRORS=0

EVENTS_DIR="$SRC_DIR/packages/realtime/src/events"
REGISTRY="$SRC_DIR/apps/realtime/src/handlers/register-handlers.ts"

extract_registry_keys() {
  local section="$1"
  node "$DOCTOR_DIR/scripts/realtime/utils/extract-registry-keys.mjs" "$REGISTRY" "$section"
}

extract_event_keys() {
  local file="$1"
  { grep -E '^[[:space:]]*"[^"]+":[[:space:]]*\{' "$file" || true; } \
    | sed -E 's/^[[:space:]]*"([^"]+)".*/\1/' \
    | sort -u
}

if [[ ! -f "$REGISTRY" ]]; then
  echo "FAIL: $REGISTRY — missing handler registry"
  exit 1
fi

CLIENT_EVENTS="$EVENTS_DIR/client-events.ts"
SERVER_EVENTS="$EVENTS_DIR/server-events.ts"

if [[ ! -f "$CLIENT_EVENTS" ]]; then
  echo "FAIL: $CLIENT_EVENTS — missing client event definitions"
  exit 1
fi

if [[ ! -f "$SERVER_EVENTS" ]]; then
  echo "FAIL: $SERVER_EVENTS — missing server event definitions"
  exit 1
fi

defined_client="$(extract_event_keys "$CLIENT_EVENTS")"
defined_server="$(extract_event_keys "$SERVER_EVENTS")"
registered_client="$(extract_registry_keys "client")"
registered_server="$(extract_registry_keys "server")"

while IFS= read -r event_name; do
  [[ -z "$event_name" ]] && continue
  if ! echo "$registered_client" | grep -qxF "$event_name"; then
    echo "FAIL: $REGISTRY — client event \"$event_name\" has no handler (add to realtimeHandlers.client)"
    ERRORS=$((ERRORS + 1))
  fi
done <<< "$defined_client"

while IFS= read -r event_name; do
  [[ -z "$event_name" ]] && continue
  if ! echo "$registered_server" | grep -qxF "$event_name"; then
    echo "FAIL: $REGISTRY — server event \"$event_name\" has no handler (add to realtimeHandlers.server)"
    ERRORS=$((ERRORS + 1))
  fi
done <<< "$defined_server"

while IFS= read -r event_name; do
  [[ -z "$event_name" ]] && continue
  if ! echo "$defined_client" | grep -qxF "$event_name"; then
    echo "FAIL: $REGISTRY — registered client handler \"$event_name\" is not defined in client-events.ts"
    ERRORS=$((ERRORS + 1))
  fi
done <<< "$registered_client"

while IFS= read -r event_name; do
  [[ -z "$event_name" ]] && continue
  if ! echo "$defined_server" | grep -qxF "$event_name"; then
    echo "FAIL: $REGISTRY — registered server handler \"$event_name\" is not defined in server-events.ts"
    ERRORS=$((ERRORS + 1))
  fi
done <<< "$registered_server"

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: handler registry matches event definitions"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
