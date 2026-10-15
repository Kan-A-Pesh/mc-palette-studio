#!/usr/bin/env bash
# Verify primary key text() columns use $defaultFn(() => ulid()) — no uuid()/nanoid() in PKs

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
    { lines[NR] = $0; nlines = NR }
    END {
      for (n = 1; n <= nlines; n++) {
        if (lines[n] ~ /\.primaryKey\(\)/) {
          start = n - 3
          if (start < 1) start = 1
          is_text = 0
          for (i = start; i <= n; i++) {
            if (lines[i] ~ /[a-zA-Z_]+:[[:space:]]*text\(/) is_text = 1
            if (lines[i] ~ /[a-zA-Z_]+:[[:space:]]*uuid\(/) {
              print "FAIL: " f ":" i " — primary key uses uuid() — must use ULID via $defaultFn(() => ulid())"
            }
            if (lines[i] ~ /nanoid\(/) {
              print "FAIL: " f ":" i " — primary key uses nanoid() — must use ULID via $defaultFn(() => ulid())"
            }
          }
          if (is_text) {
            has_defaultfn = 0
            has_ulid = 0
            hi = n + 2
            if (hi > nlines) hi = nlines
            for (i = start; i <= hi; i++) {
              if (lines[i] ~ /\$defaultFn\(/) has_defaultfn = 1
              if (lines[i] ~ /ulid\(/) has_ulid = 1
            }
            # The primary key must derive its value from $defaultFn(() => ulid()):
            # a $defaultFn alone is not enough — it must specifically call ulid().
            if (!has_defaultfn || !has_ulid) {
              print "FAIL: " f ":" n " — text() primaryKey missing $defaultFn(() => ulid())"
            }
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
  echo "OK: All primaryKey text() columns use \$defaultFn(() => ulid())"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
