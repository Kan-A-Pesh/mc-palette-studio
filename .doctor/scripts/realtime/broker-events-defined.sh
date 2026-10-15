#!/usr/bin/env bash
# Broker .emit("event") strings in handlers must exist in broker-events.ts.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

BROKER_EVENTS="$SRC_DIR/packages/realtime/src/events/broker-events.ts"
HANDLERS_DIR="$SRC_DIR/apps/realtime/src/handlers"
SERVER_FACTORY="$SRC_DIR/packages/realtime/src/server/create-server.ts"

if [[ ! -f "$BROKER_EVENTS" ]]; then
  echo "FAIL: $BROKER_EVENTS — missing broker event definitions"
  exit 1
fi

defined_events=$(grep -E '^[[:space:]]*"[^"]+":[[:space:]]*\{' "$BROKER_EVENTS" | sed -E 's/^[[:space:]]*"([^"]+)".*/\1/' | sort -u)

scan_file_for_emits() {
  local file="$1"
  # Literal string emits: verify the event name exists in broker-events.ts.
  # The trailing `|| true` keeps a no-match grep (exit 1) from tripping
  # `set -euo pipefail` and aborting the function before the dynamic-emit scan.
  { grep -nE '\.emit\([[:space:]]*"[^"]+"' "$file" 2>/dev/null || true; } | while IFS=: read -r line_no content; do
    event_name=$(echo "$content" | sed -nE 's/.*\.emit\([[:space:]]*"([^"]+)".*/\1/p')
    [[ -z "$event_name" ]] && continue
    if ! echo "$defined_events" | grep -qxF "$event_name"; then
      echo "FAIL: $file:$line_no — broker emit \"$event_name\" is not defined in broker-events.ts"
    fi
  done
  # Dynamic emits: the event name is a variable / template literal / member
  # expression rather than a static string literal, so it cannot be checked
  # against broker-events.ts. Surface a WARN so the gap is visible rather than
  # silently passing (e.g. `.emit(data.event, ...)`, `.emit(`user:${id}`)`).
  { grep -nE '\.emit\([[:space:]]*[^"[:space:])]' "$file" 2>/dev/null || true; } | while IFS=: read -r line_no content; do
    echo "$content" | grep -qE '\.emit\([[:space:]]*"' && continue
    echo "WARN: $file:$line_no — dynamic broker emit (non-literal event name) cannot be verified against broker-events.ts"
  done
}

WARNINGS=0

emit_findings() {
  local finding
  while IFS= read -r finding; do
    [[ -z "$finding" ]] && continue
    echo "$finding"
    case "$finding" in
      WARN:*) WARNINGS=$((WARNINGS + 1)) ;;
      *) ERRORS=$((ERRORS + 1)) ;;
    esac
  done
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  emit_findings < <(scan_file_for_emits "$file")
done < <(doctor_list_files "$HANDLERS_DIR" ts)

if [[ -f "$SERVER_FACTORY" ]]; then
  emit_findings < <(scan_file_for_emits "$SERVER_FACTORY")
fi

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: all literal broker emits reference defined broker events ($WARNINGS dynamic-emit warning(s))"
  else
    echo "OK: all broker emits reference defined broker events"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
