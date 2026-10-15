#!/usr/bin/env bash
# Verify every .references() call has an { onDelete: ... } option within ~3 lines

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
    { lines[NR] = $0; nlines = NR }
    END {
      for (n = 1; n <= nlines; n++) {
        if (lines[n] ~ /\.references\(/) {
          hi = n + 3
          if (hi > nlines) hi = nlines
          found = 0
          for (i = n; i <= hi; i++) {
            if (lines[i] ~ /onDelete[[:space:]]*:/) { found = 1; break }
          }
          if (!found) {
            print "FAIL: " f ":" n " — .references() missing { onDelete: ... } option"
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
  echo "OK: All .references() calls specify onDelete"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
