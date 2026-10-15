#!/usr/bin/env bash
# split-file-procedure-pattern
#
# Verify the Somnium split-file oRPC convention:
#   - Files in mutations/<name>.ts or queries/<name>.ts must export both
#       export const xxxBase    = (something)Procedure[.chain]
#       export const xxxHandler = xxxBase.handler(
#   - Files in router.ts (router composition) — each property of the exported
#     object literal must wire its handler through `call(xxxHandler, ...)`.
#     `.handler(` not going through `call(` → WARN.

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
    */routers/*) return 1 ;;
    *) return 0 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue

  # Skip aggregator index files inside mutations/ or queries/
  base_name="$(basename "$file")"

  case "$file" in
    */mutations/*.ts|*/queries/*.ts)
      # Skip the index.ts aggregator
      if [[ "$base_name" == "index.ts" ]]; then
        continue
      fi

      # Extract the base stem: export const <stem>Base = <name>Procedure[...]
      # (the stem is the part before "Base"). Empty if no valid base decl.
      base_stem="$(grep -oE '^[[:space:]]*export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*Base[[:space:]]*=[[:space:]]*[A-Za-z_][A-Za-z0-9_]*Procedure\b' "$file" 2>/dev/null \
        | sed -E 's/.*const[[:space:]]+([A-Za-z_][A-Za-z0-9_]*)Base[[:space:]]*=.*/\1/' \
        | head -1)"
      has_base=0
      [[ -n "$base_stem" ]] && has_base=1

      # Look for: export const <stem>Handler = <stem>Base.handler(
      # The handler MUST share the SAME stem as the base, and chain off
      # <stem>Base.handler(. The "= <stem>Base.handler(" portion may wrap to the
      # next line, so we match across the first few lines of the decl.
      has_handler=0
      if [[ -n "$base_stem" ]] && awk -v stem="$base_stem" '
        $0 ~ "^[[:space:]]*export[[:space:]]+const[[:space:]]+" stem "Handler[[:space:]]*=" {
          buf = $0
          for (k = 1; k <= 3 && (getline next_line) > 0; k++) buf = buf " " next_line
          if (buf ~ (stem "Base\\.handler\\(")) { print "y"; exit }
        }
      ' "$file" | grep -q y; then
        has_handler=1
      fi

      if [[ $has_base -eq 0 || $has_handler -eq 0 ]]; then
        echo "FAIL: $file:1 — split-file procedure must export both xxxBase = <name>Procedure and a matching xxxHandler = xxxBase.handler( (same stem)"
        ERRORS=$((ERRORS + 1))
      fi
      ;;

    */router.ts)
      # Walk each property: name: <something>.route({...}).handler(...)
      # Simple window scan: collect 12 lines starting at the .handler( line.
      # If `call(` doesn't appear in that window → WARN.
      output=$(awk '
        { lines[NR] = $0 }
        END {
          for (i = 1; i <= NR; i++) {
            if (lines[i] !~ /\.handler\(/) continue
            buf = ""
            end = (i + 12 < NR) ? i + 12 : NR
            for (k = i; k <= end; k++) buf = buf " " lines[k]
            # Require a STANDALONE call( — the sanctioned wrapper. A method call
            # like obj.call( (preceded by ".") must NOT satisfy this, so we
            # exclude a leading "." as well as identifier chars before "call(".
            if (buf !~ /(^|[^A-Za-z_.])call\(/) print i
          }
        }
      ' "$file")

      if [[ -n "$output" ]]; then
        while IFS= read -r line_no; do
          [[ -z "$line_no" ]] && continue
          echo "WARN: $file:$line_no — router .handler( does not go through call(xxxHandler, ...); business logic should live in mutations/queries"
          WARNINGS=$((WARNINGS + 1))
        done <<< "$output"
      fi
      ;;
  esac

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: split-file procedure pattern respected ($WARNINGS warning(s))"
  else
    echo "OK: split-file procedure pattern respected"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
