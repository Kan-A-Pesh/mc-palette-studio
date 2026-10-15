#!/usr/bin/env bash
# Verify pgEnum() declarations: var ends with Enum, name snake_case, values lowercase_snake_case

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
      # Match `const <ident> = pgEnum(` with an OPTIONAL leading "export" so that
      # non-exported pgEnum() declarations are validated too. The enum name need
      # not be on the same line — multi-line declarations are handled below.
      decl_re = "(export[ \t]+)?const[ \t]+[a-zA-Z_][a-zA-Z0-9_]*[ \t]*=[ \t]*pgEnum\\("
      ident_re = "[a-zA-Z_][a-zA-Z0-9_]*"
      name_re = "[\"\047][^\"\047]+[\"\047]"
      snake_re = "^[a-z][a-z0-9]*(_[a-z0-9]+)*$"
    }
    { lines[NR] = $0; nlines = NR }
    END {
      for (n = 1; n <= nlines; n++) {
        if (match(lines[n], decl_re)) {
          frag = substr(lines[n], RSTART, RLENGTH)
          # Extract variable name: skip "const " then take next identifier.
          sub_str = frag
          if (match(sub_str, "const[ \t]+" ident_re)) {
            ident_part = substr(sub_str, RSTART, RLENGTH)
            sub("const[ \t]+", "", ident_part)
            varname = ident_part
          } else {
            varname = "?"
          }
          # Extract enum name (first quoted string after pgEnum(); may live on a
          # following line for multi-line declarations).
          enumname = "?"
          after = substr(lines[n], RSTART + RLENGTH - 1)   # from the "(" onward
          if (match(after, name_re)) {
            enumname = substr(after, RSTART + 1, RLENGTH - 2)
          } else {
            for (q = n + 1; q <= nlines && q <= n + 3; q++) {
              if (match(lines[q], name_re)) {
                enumname = substr(lines[q], RSTART + 1, RLENGTH - 2)
                break
              }
            }
          }

          if (varname !~ /Enum$/) {
            print "FAIL: " f ":" n " — pgEnum variable \047" varname "\047 must end with \047Enum\047"
          }
          if (enumname !~ snake_re) {
            print "FAIL: " f ":" n " — pgEnum name \047" enumname "\047 is not snake_case"
          }

          # Collect lines until closing ]) to scan values
          collected = ""
          for (i = n; i <= nlines; i++) {
            collected = collected " " lines[i]
            if (lines[i] ~ /\]\)/) break
          }
          # Extract part between [ and ]
          if (match(collected, /\[[^]]*\]/)) {
            arr = substr(collected, RSTART, RLENGTH)
            rest = arr
            while (match(rest, name_re)) {
              val = substr(rest, RSTART + 1, RLENGTH - 2)
              if (val !~ snake_re) {
                print "FAIL: " f ":" n " — pgEnum \047" varname "\047 value \047" val "\047 is not lowercase snake_case"
              }
              rest = substr(rest, RSTART + RLENGTH)
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
  echo "OK: All pgEnum declarations follow naming conventions"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
