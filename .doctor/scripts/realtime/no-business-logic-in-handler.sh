#!/usr/bin/env bash
# WARN when broker handlers grow large or import database directly (keep routing thin).

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0
MAX_LINES=50

HANDLERS_DIR="$SRC_DIR/apps/realtime/src/handlers"

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  [[ "$file" == *register-handlers.ts ]] && continue

  if grep -q '@repo/database' "$file" 2>/dev/null; then
    echo "WARN: $file — handler imports @repo/database; prefer packages/server for persistence and keep broker handlers as routers"
    WARNINGS=$((WARNINGS + 1))
  fi

  line_count=$(wc -l < "$file" | tr -d ' ')
  if [[ "$line_count" -gt "$MAX_LINES" ]]; then
    echo "WARN: $file — handler file is $line_count lines (>$MAX_LINES); extract logic to apps/realtime/src/lib/<feature>/"
    WARNINGS=$((WARNINGS + 1))
  fi

done < <(doctor_list_files "$HANDLERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: no hard violations ($WARNINGS warning(s))"
  else
    echo "OK: broker handlers stay thin"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
