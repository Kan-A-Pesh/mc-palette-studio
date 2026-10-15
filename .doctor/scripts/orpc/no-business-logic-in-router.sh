#!/usr/bin/env bash
# WARN when a .handler(async ({ ... }) => { ... }) body exceeds 50 lines.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0
MAX_LINES=50

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

  output=$(awk -v MAX="$MAX_LINES" '
    # Strip string/template literals and line comments so that braces appearing
    # inside them (e.g. `const s = "a { b }"`) are not counted as code braces.
    function strip_code(s,   out, i, c, q, esc) {
      out = ""
      q = ""        # current quote char ("" when not in a string)
      esc = 0
      i = 1
      while (i <= length(s)) {
        c = substr(s, i, 1)
        if (q != "") {
          # inside a string/template literal
          if (esc) { esc = 0 }
          else if (c == "\\") { esc = 1 }
          else if (c == q) { q = "" }
          i++
          continue
        }
        # not in a string
        if (c == "/" && substr(s, i + 1, 1) == "/") break          # // comment to EOL
        if (c == "\"" || c == "\047" || c == "`") { q = c; i++; continue }
        out = out c
        i++
      }
      return out
    }
    { lines[NR] = $0 }
    END {
      for (i = 1; i <= NR; i++) {
        if (lines[i] !~ /\.handler\(async/) continue
        # Find the opening "{" of the arrow function body. The destructured
        # handler signature can span many lines, so scan forward until the
        # "=> {" appears — bounded by the next handler or 30 lines, not 5.
        body_start = 0
        for (k = i; k <= NR && k <= i + 30; k++) {
          if (k > i && lines[k] ~ /\.handler\(async/) break
          if (lines[k] ~ /=>[[:space:]]*\{/) { body_start = k; break }
        }
        if (body_start == 0) continue

        # Walk forward counting braces in the body (over stripped code only).
        depth = 0
        started = 0
        end_i = NR
        for (k = body_start; k <= NR; k++) {
          code = strip_code(lines[k])
          n = length(code)
          for (p = 1; p <= n; p++) {
            c = substr(code, p, 1)
            if (c == "{") { depth++; started = 1 }
            else if (c == "}") { depth--; if (started && depth <= 0) { end_i = k; k = NR + 1; break } }
          }
        }

        body_len = end_i - body_start + 1
        if (body_len > MAX) print i ":" body_len
      }
    }
  ' "$file")

  if [[ -n "$output" ]]; then
    while IFS=: read -r line_no body_len; do
      [[ -z "$line_no" ]] && continue
      echo "WARN: $file:$line_no — handler body is $body_len lines (>$MAX_LINES); extract to packages/server/src/services/"
      WARNINGS=$((WARNINGS + 1))
    done <<< "$output"
  fi

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: no hard violations ($WARNINGS warning(s))"
  else
    echo "OK: no handler exceeds $MAX_LINES lines"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
