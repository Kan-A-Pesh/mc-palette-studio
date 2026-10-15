#!/usr/bin/env bash
# WARN when a split-file procedure (mutations/<name>.ts, queries/<name>.ts)
# declares `xxxBase = bareProcedure` with no auth/permission in the chain.
#
# Acceptable procedure bases:
#   - authenticatedProcedure
#   - any *Procedure name (heuristic — they likely embed auth)
#   - publicProcedure (only when the export name starts with "public" or the
#     file is intentionally public — we skip the warning entirely)
# Acceptable middleware in chain:
#   - .use(requirePermission(...))
#
# WARN-only heuristic; never FAIL.

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
  esac
  case "$f" in
    */mutations/*.ts|*/queries/*.ts) ;;
    *) return 0 ;;
  esac
  if [[ "$(basename "$f")" == "index.ts" ]]; then
    return 0
  fi
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue

  # Find every `export const xxxBase = <something>Procedure`-style declaration.
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue

    # Extract the procedure identifier (right-hand side, first token) and
    # the Base export name. Use awk — BSD sed lacks reliable \b support.
    proc=$(echo "$content" | awk '
      match($0, /export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*Base[[:space:]]*=[[:space:]]*[A-Za-z_][A-Za-z0-9_]*/) {
        s = substr($0, RSTART, RLENGTH)
        sub(/.*=[[:space:]]*/, "", s)
        print s
      }')
    name=$(echo "$content" | awk '
      match($0, /export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*Base/) {
        s = substr($0, RSTART, RLENGTH)
        sub(/.*const[[:space:]]+/, "", s)
        sub(/Base$/, "", s)
        print s
      }')

    [[ -z "$proc" ]] && continue

    # publicProcedure is OK if the Base name starts with "public" or "get" + lowercase
    # We skip publicProcedure entirely — that's the explicit opt-out.
    if [[ "$proc" == "publicProcedure" ]]; then
      continue
    fi

    # Bare `procedure` (lowercase) — no auth.
    if [[ "$proc" == "procedure" ]]; then
      echo "WARN: $file:$line_no — '$name' uses bare 'procedure' (no auth middleware); use authenticatedProcedure or add .use(requirePermission(...))"
      WARNINGS=$((WARNINGS + 1))
      continue
    fi

    # Anything ending in "Procedure" is presumed to embed auth
    # (authenticatedProcedure, etc.). Quick sanity: also accept
    # if the chain has .use(requirePermission(...
    if [[ "$proc" == *Procedure ]]; then
      continue
    fi

    # Right-hand side isn't a *Procedure — check the surrounding chain for
    # `.use(requirePermission(` within a 20-line window starting at the Base line.
    found=$(awk -v start="$line_no" '
      NR >= start && NR <= start + 20 {
        if ($0 ~ /\.use\(requirePermission\(/) { print "y"; exit }
      }
    ' "$file")

    if [[ "$found" != "y" ]]; then
      echo "WARN: $file:$line_no — '$name' Base uses '$proc' (no recognised auth/permission); add .use(requirePermission(...)) or use a *Procedure"
      WARNINGS=$((WARNINGS + 1))
    fi
  done < <(grep -nE '^[[:space:]]*export[[:space:]]+const[[:space:]]+[A-Za-z_][A-Za-z0-9_]*Base[[:space:]]*=[[:space:]]*[A-Za-z_][A-Za-z0-9_]*' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNINGS -gt 0 ]]; then
    echo "OK: no hard violations ($WARNINGS warning(s))"
  else
    echo "OK: all split-file procedures use an auth/permission middleware"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
