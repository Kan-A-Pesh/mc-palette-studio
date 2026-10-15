#!/usr/bin/env bash
# Enforce handler folder layout: server handlers under handlers/server/, no server/server/ nesting.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

HANDLERS_DIR="$SRC_DIR/apps/realtime/src/handlers"

while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  case "$file" in
    */handlers/server/server/*)
      echo "FAIL: $file — remove redundant server/server/ nesting (use handlers/server/<name>.ts)"
      ERRORS=$((ERRORS + 1))
      ;;
    */handlers/*/server/*)
      echo "FAIL: $file — server handlers must live under handlers/server/ (not handlers/<feature>/server/)"
      ERRORS=$((ERRORS + 1))
      ;;
    */handlers/client/client/*)
      echo "FAIL: $file — remove redundant client/client/ nesting"
      ERRORS=$((ERRORS + 1))
      ;;
    */handlers/register-handlers.ts) continue ;;
    */handlers/server/*)
      continue
      ;;
    */handlers/*/client/*) continue ;;
    */handlers/client/*) continue ;;
    */handlers/*/*.ts)
      parent_feature="$(basename "$(dirname "$file")")"
      if [[ "$parent_feature" != "client" && "$parent_feature" != "server" ]]; then
        continue
      fi
      ;;
  esac

  basename_file="$(basename "$file")"
  if [[ "$basename_file" != "register-handlers.ts" && "$file" == *"/handlers/"* ]]; then
    rel="${file#*handlers/}"
    if [[ "$rel" == *.ts && "$rel" != register-handlers.ts && "$rel" != server/* && "$rel" != */client/* ]]; then
      if [[ "$rel" != */* ]]; then
        echo "FAIL: $file — top-level handler files must live under handlers/server/ or handlers/<feature>/client/"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi

done < <(doctor_list_files "$HANDLERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: handler files follow folder structure"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
