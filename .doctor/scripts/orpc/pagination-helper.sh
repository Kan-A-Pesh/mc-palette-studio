#!/usr/bin/env bash
# WARN when a handler with limit + cursor/offset input doesn't call paginate(...).

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
    */services/*) return 0 ;;
    */routers/*) return 1 ;;
    *) return 0 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue

  output=$(awk '
    { lines[NR] = $0 }
    END {
      for (i = 1; i <= NR; i++) {
        if (lines[i] !~ /\.handler\(async/) continue

        # Look back up to 25 lines for the matching .input(z.object({ ... })
        in_start = (i - 25 < 1) ? 1 : i - 25
        input_block = ""
        for (j = in_start; j <= i; j++) input_block = input_block "\n" lines[j]

        # NOTE: awk regex has no \b word boundary (\b is a literal backspace),
        # so we emulate it with (^|[^a-zA-Z]) ... ([^a-zA-Z]|$).
        has_limit  = (input_block ~ /(^|[^a-zA-Z])limit([^a-zA-Z]|$)/)
        has_cursor = (input_block ~ /(^|[^a-zA-Z])cursor([^a-zA-Z]|$)/) || (input_block ~ /(^|[^a-zA-Z])offset([^a-zA-Z]|$)/)
        if (!(has_limit && has_cursor)) continue

        # Find matching closing of handler — naive: count braces/parens from line i.
        depth = 0
        started = 0
        end_i = NR
        for (k = i; k <= NR; k++) {
          n = length(lines[k])
          for (p = 1; p <= n; p++) {
            c = substr(lines[k], p, 1)
            if (c == "(") { depth++; started = 1 }
            else if (c == ")") { depth--; if (started && depth <= 0) { end_i = k; k = NR + 1; break } }
          }
        }

        body = ""
        for (k = i; k <= end_i; k++) body = body "\n" lines[k]

        if (body !~ /(^|[^a-zA-Z])paginate\(/) print i
      }
    }
  ' "$file")

  if [[ -n "$output" ]]; then
    while IFS= read -r line_no; do
      [[ -z "$line_no" ]] && continue
      echo "WARN: $file:$line_no — handler accepts limit + cursor/offset but does not call paginate(); consider using the helper"
      WARNINGS=$((WARNINGS + 1))
    done <<< "$output"
  fi

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: no hard violations ($WARNINGS warning(s))"
  else
    echo "OK: all paginated handlers use paginate() helper"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
