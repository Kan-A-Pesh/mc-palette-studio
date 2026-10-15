#!/usr/bin/env bash
# Hint: warn when a table has more .references() columns than index()/uniqueIndex() declarations

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

  awk -v f="$file" '
    BEGIN {
      # Match pgTable( regardless of name placement (same line or split across
      # following lines for multi-line declarations).
      pgt_re = "pgTable\\("
      name_re = "[\"\047][^\"\047]+[\"\047]"
    }
    { lines[NR] = $0; nlines = NR }
    END {
      for (n = 1; n <= nlines; n++) {
        if (match(lines[n], pgt_re)) {
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

          # Walk balanced parens starting from pgTable(
          depth = 0
          started = 0
          tend = 0
          # Locate the "(" of pgTable( first
          pgt_at = index(lines[n], "pgTable(")
          for (i = n; i <= nlines; i++) {
            line = lines[i]
            start_j = (i == n ? pgt_at + 8 - 1 : 1)
            L = length(line)
            for (j = start_j; j <= L; j++) {
              c = substr(line, j, 1)
              if (c == "(") { depth++; started = 1 }
              else if (c == ")") {
                depth--
                if (started && depth == 0) { tend = i; break }
              }
            }
            if (tend) break
            # Count the opening paren of pgTable on first line
            if (i == n && !started) {
              # opening was inside pgTable( token, ensure depth=1
              depth = 1; started = 1
            }
          }
          if (!tend) tend = nlines

          refs = 0
          idxs = 0
          for (i = tstart; i <= tend; i++) {
            tmp = lines[i]
            while (match(tmp, /\.references\(/)) {
              refs++
              tmp = substr(tmp, RSTART + RLENGTH)
            }
            # Count index( and uniqueIndex( occurrences
            tmp = lines[i]
            while (match(tmp, /(^|[^a-zA-Z_])(index|uniqueIndex)\(/)) {
              idxs++
              tmp = substr(tmp, RSTART + RLENGTH)
            }
          }

          if (refs > idxs) {
            print "WARN: " f ":" tstart " — table \047" tname "\047 has " refs " .references() but only " idxs " index() declarations (consider adding indexes on FKs)"
          }
        }
      }
    }
  ' "$file" >> "$TMP"
done < <(doctor_list_files "$SCHEMA_DIR" ts)

if [[ -s "$TMP" ]]; then
  cat "$TMP"
fi
rm -f "$TMP"

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: Index hints emitted as WARN (non-failing)"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
