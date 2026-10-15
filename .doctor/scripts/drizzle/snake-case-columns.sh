#!/usr/bin/env bash
# Verify Drizzle column names (string passed to text/integer/timestamp/etc) are snake_case

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

SCHEMA_DIR="$SRC_DIR/packages/database/schema"
[[ ! -d "$SCHEMA_DIR" ]] && SCHEMA_DIR="packages/database/schema"

TMP=$(mktemp)

# Regex for column-typed calls. POSIX awk: no array capture; use match + substr.
# Type group: text|integer|timestamp|boolean|jsonb|json|varchar|decimal|numeric|uuid|bigint|smallint|real|doublePrecision|date|time|serial|bigserial|char|bytea|inet|cidr|macaddr|interval

while IFS= read -r file; do
  base=$(basename "$file")
  [[ "$base" == "index.ts" || "$base" == "relations.ts" || "$base" == "types.ts" ]] && continue

  awk -v f="$file" '
    BEGIN {
      types = "(text|integer|timestamp|boolean|jsonb|json|varchar|decimal|numeric|uuid|bigint|smallint|real|doublePrecision|date|time|serial|bigserial|char|bytea|inet|cidr|macaddr|interval)"
      col_re = "[a-zA-Z_][a-zA-Z0-9_]*:[ \t]*" types "\\([\"\047][^\"\047]+[\"\047]"
      name_re = "[\"\047][^\"\047]+[\"\047]"
      snake_re = "^[a-z][a-z0-9]*(_[a-z0-9]+)*$"
    }
    {
      line = $0
      while (match(line, col_re)) {
        m = substr(line, RSTART, RLENGTH)
        # Extract first quoted string in m
        if (match(m, name_re)) {
          name = substr(m, RSTART + 1, RLENGTH - 2)
          if (name !~ snake_re) {
            print "FAIL: " f ":" NR " — column name \047" name "\047 is not snake_case"
          }
        }
        line = substr(line, RSTART + RLENGTH)
      }
    }
  ' "$file" >> "$TMP"
done < <(doctor_list_files "$SCHEMA_DIR" ts)

if [[ -s "$TMP" ]]; then
  cat "$TMP"
  ERRORS=$(wc -l < "$TMP" | tr -d ' ')
fi
rm -f "$TMP"

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: All Drizzle column names are snake_case"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
