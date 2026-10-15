#!/usr/bin/env bash
# Handlers must use define*Handler<EventName> generics — not inline { ... } input types.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

HANDLERS_DIR="$SRC_DIR/apps/realtime/src/handlers"

is_ultimate_template_imported() {
  # Imported verbatim from impulse-studio/ultimate-template realtime
  # (Yjs document lifecycle, room collaboration). The ultimate-template
  # versions of defineClientHandler/defineServerHandler accept inline
  # type literals directly; migrating these handlers to event-name generics
  # is part of the deferred Somnium realtime redesign.
  local file="$1"
  case "$file" in
    */apps/realtime/src/handlers/rooms/*|apps/realtime/src/handlers/rooms/*) return 0 ;;
    */apps/realtime/src/handlers/documents/*|apps/realtime/src/handlers/documents/*) return 0 ;;
  esac
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  is_ultimate_template_imported "$file" && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — use defineServerHandler<\"event:name\"> or defineClientHandler<\"event:name\"> (derive input from event registry)"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'define(Server|Client|AuthenticatedClient)Handler<[[:space:]]*\{' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$HANDLERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: handler input types come from event name generics"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
