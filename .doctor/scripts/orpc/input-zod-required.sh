#!/usr/bin/env bash
# WARN when a split-file procedure definition (mutations/<name>.ts or
# queries/<name>.ts) declares an xxxBase = somethingProcedure chain but has
# no `.input(z.` anywhere in the file.
# WARN (not FAIL) because some procedures legitimately take no input.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

ROUTERS_DIR="$SRC_DIR/packages/server/src/routers"
[[ -d "$ROUTERS_DIR" ]] || ROUTERS_DIR="$SRC_DIR"

should_skip() {
  local f="$1"
  case "$f" in
    *_app.ts) return 0 ;;
    */context.ts) return 0 ;;
    */middleware*.ts) return 0 ;;
    */utils/*) return 0 ;;
    */services/*) return 0 ;;
  esac
  # Only scan split-file definition files
  case "$f" in
    */mutations/*.ts|*/queries/*.ts) ;;
    *) return 0 ;;
  esac
  # Skip aggregator index.ts inside mutations/queries
  if [[ "$(basename "$f")" == "index.ts" ]]; then
    return 0
  fi
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue

  # Need at least one Base declaration to consider this a procedure file.
  has_base=0
  base_line=0
  if line=$(grep -nE '^[[:space:]]*export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*Base[[:space:]]*=[[:space:]]*[A-Za-z_][A-Za-z0-9_]*Procedure\b' "$file" 2>/dev/null | head -1); then
    if [[ -n "$line" ]]; then
      has_base=1
      base_line="${line%%:*}"
    fi
  fi

  [[ $has_base -eq 0 ]] && continue

  # Accept `.input(z.…)` (inline Zod) OR `.input(<somethingSchema>…)`
  # (a schema identifier — Zod schemas are imported from validators.ts).
  if ! grep -qE '\.input\((z\.|[A-Za-z_][A-Za-z0-9_]*Schema\b)' "$file" 2>/dev/null; then
    echo "WARN: $file:$base_line — Base declared but no .input(z.… or …Schema) in file; confirm procedure takes no params"
    WARNINGS=$((WARNINGS + 1))
  fi

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: no hard violations ($WARNINGS warning(s))"
  else
    echo "OK: all split-file procedures have .input(z.) declarations"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
