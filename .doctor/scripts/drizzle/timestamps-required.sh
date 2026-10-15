#!/usr/bin/env bash
# Verify every pgTable() has both created_at and updated_at timestamp columns

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

SCHEMA_DIR="$SRC_DIR/packages/database/schema"
[[ ! -d "$SCHEMA_DIR" ]] && SCHEMA_DIR="packages/database/schema"

TMP=$(mktemp)

while IFS= read -r file; do
  base=$(basename "$file")
  [[ "$base" == "index.ts" || "$base" == "relations.ts" || "$base" == "types.ts" ]] && continue

  case "$file" in
    *packages/database/schema/auth.ts) continue ;;
  esac

  awk -v f="$file" '
    BEGIN {
      # Match pgTable( regardless of the table name placement. The name may be
      # on the SAME line (pgTable("users", {) or on a following line when the
      # call is split across lines (pgTable(\n  "users",\n  { ... ).
      pgt_re = "pgTable\\("
      name_re = "[\"\047][^\"\047]+[\"\047]"
    }
    { lines[NR] = $0; nlines = NR }
    END {
      for (n = 1; n <= nlines; n++) {
        if (match(lines[n], pgt_re)) {
          # Extract the table name: first quoted string at/after the pgTable(
          # token, scanning forward across lines if needed.
          tname = "?"
          name_from = substr(lines[n], RSTART)
          if (match(name_from, name_re)) {
            tname = substr(name_from, RSTART + 1, RLENGTH - 2)
          } else {
            for (q = n + 1; q <= nlines && q <= n + 3; q++) {
              if (match(lines[q], name_re)) {
                tname = substr(lines[q], RSTART + 1, RLENGTH - 2)
                break
              }
            }
          }
          tstart = n
          # Find columns object: first { after pgTable(, balanced to its matching }
          depth = 0
          first_brace = 0
          col_start = 0
          col_end = 0
          for (i = n; i <= nlines; i++) {
            line = lines[i]
            L = length(line)
            for (j = 1; j <= L; j++) {
              c = substr(line, j, 1)
              if (c == "{") {
                depth++
                if (!first_brace) { first_brace = 1; col_start = i }
              } else if (c == "}") {
                depth--
                if (depth == 0 && first_brace) { col_end = i; break }
              }
            }
            if (col_end) break
          }
          if (!col_end) continue

          has_created = 0
          has_updated = 0
          for (i = col_start; i <= col_end; i++) {
            if (lines[i] ~ /timestamp\([ \t]*[\"\047]created_at[\"\047]/) has_created = 1
            if (lines[i] ~ /timestamp\([ \t]*[\"\047]updated_at[\"\047]/) has_updated = 1
          }

          if (!has_created && !has_updated) {
            print "FAIL: " f ":" tstart " — table \047" tname "\047 missing created_at and updated_at timestamps"
          } else if (!has_created) {
            print "FAIL: " f ":" tstart " — table \047" tname "\047 missing created_at timestamp"
          } else if (!has_updated) {
            print "FAIL: " f ":" tstart " — table \047" tname "\047 missing updated_at timestamp"
          }
        }
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
  echo "OK: All tables have created_at and updated_at timestamps"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
