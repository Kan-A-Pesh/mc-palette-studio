#!/usr/bin/env bash
# Verify relations() declarations only live in relations.ts files

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
  [[ "$base" == "relations.ts" || "$base" == "index.ts" || "$base" == "types.ts" ]] && continue
  case "$file" in
    *packages/database/schema/auth.ts) continue ;;
  esac

  awk -v f="$file" '
    BEGIN {
      import_re = "import[ \t]*\\{[^}]*[^a-zA-Z_]relations[^a-zA-Z_][^}]*\\}[ \t]*from[ \t]*[\"\047]drizzle-orm[\"\047]"
      import_re_first = "import[ \t]*\\{[ \t]*relations[^}]*\\}[ \t]*from[ \t]*[\"\047]drizzle-orm[\"\047]"
      call_re = "[^a-zA-Z_.]relations\\("
    }
    {
      if ($0 ~ import_re || $0 ~ import_re_first) {
        print "FAIL: " f ":" NR " — imports { relations } outside of relations.ts"
        next
      }
      # Strip comments before scanning for a real relations() call so that
      # documentation/examples in comments cannot trigger false positives:
      #   - inline block comments on the line
      #   - trailing line comments
      # Full multi-line block comment bodies remain covered by the leading-star
      # continuation-line skip below.
      code = $0
      gsub(/\/\*.*\*\//, "", code)   # inline /* ... */ block(s) on this line
      sub(/\/\/.*/, "", code)        # trailing // comment
      if (code ~ call_re || code ~ /^relations\(/) {
        if (code !~ /^[ \t]*\/\// && code !~ /^[ \t]*\*/ && code !~ /import/) {
          print "FAIL: " f ":" NR " — relations() invocation outside of relations.ts"
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
  echo "OK: relations() declarations only in relations.ts files"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
