#!/usr/bin/env bash
# Enforce oRPC strict folder/file structure.
#
# For each .ts file in packages/server/src/routers/**/(mutations|queries)/*.ts
# (excluding index.ts):
#   1. Filename ↔ export name match: file `example-name.ts` MUST export
#      `exampleNameBase` AND `exampleNameHandler`.
#   2. No other runtime exports allowed (no inline `const X = ...`, etc.).
#   3. `export type` / `export interface` NOT allowed here — move to types.ts.
#
# Every existing mutations/ or queries/ folder must contain an index.ts barrel.
#
# Note: router.ts presence is covered by orpc/router-tree-structure.

set -uo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck disable=SC1091
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

ROUTERS_DIR="$SRC_DIR/packages/server/src/routers"
[[ -d "$ROUTERS_DIR" ]] || ROUTERS_DIR="$SRC_DIR/routers"
[[ -d "$ROUTERS_DIR" ]] || ROUTERS_DIR="$SRC_DIR"

# kebab-case → camelCase
kebab_to_camel() {
  local kebab="$1"
  awk -v s="$kebab" 'BEGIN {
    n = split(s, parts, "-")
    out = parts[1]
    for (i = 2; i <= n; i++) {
      out = out toupper(substr(parts[i],1,1)) substr(parts[i],2)
    }
    print out
  }'
}

# ─── 1) Each mutations/ or queries/ folder must have an index.ts barrel ────
while IFS= read -r folder; do
  [[ -z "$folder" ]] && continue
  case "$folder" in
    */node_modules/*|*/dist/*|*/.cache/*) continue ;;
  esac
  base="$(basename "$folder")"
  [[ "$base" == "mutations" || "$base" == "queries" ]] || continue
  if [[ ! -f "$folder/index.ts" ]]; then
    echo "FAIL: $folder — missing index.ts barrel"
    ERRORS=$((ERRORS + 1))
  fi
done < <(find "$ROUTERS_DIR" -type d \( -name mutations -o -name queries \) 2>/dev/null | sort -u)

# ─── 2) Per-file rules ─────────────────────────────────────────────────────
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    */node_modules/*|*/dist/*|*/.cache/*) continue ;;
  esac

  # Only process files inside a mutations/ or queries/ folder
  parent="$(basename "$(dirname "$file")")"
  [[ "$parent" == "mutations" || "$parent" == "queries" ]] || continue

  fname="$(basename "$file" .ts)"
  [[ "$fname" == "index" ]] && continue

  expected_camel="$(kebab_to_camel "$fname")"
  expected_base="${expected_camel}Base"
  expected_handler="${expected_camel}Handler"

  # All export statements (named const/function/class/let/var) — runtime exports
  # We capture the exported identifier after `export const|let|var|function|class|async function`
  runtime_exports=$(grep -nE '^[[:space:]]*export[[:space:]]+(const|let|var|function|async[[:space:]]+function|class)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$file" \
    | sed -E 's/^([0-9]+):[[:space:]]*export[[:space:]]+(const|let|var|async[[:space:]]+function|function|class)[[:space:]]+([A-Za-z_][A-Za-z0-9_]*).*/\1|\3/')

  # Type exports (forbidden)
  type_exports=$(grep -nE '^[[:space:]]*export[[:space:]]+(type|interface)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$file" || true)

  has_base=0
  has_handler=0
  extra_runtime=()

  while IFS='|' read -r line_no ident; do
    [[ -z "$ident" ]] && continue
    if [[ "$ident" == "$expected_base" ]]; then
      has_base=1
    elif [[ "$ident" == "$expected_handler" ]]; then
      has_handler=1
    else
      extra_runtime+=("$line_no:$ident")
    fi
  done <<< "$runtime_exports"

  if [[ $has_base -eq 0 ]]; then
    echo "FAIL: $file — missing export const $expected_base (filename → camelCase mismatch)"
    ERRORS=$((ERRORS + 1))
  fi
  if [[ $has_handler -eq 0 ]]; then
    echo "FAIL: $file — missing export const $expected_handler (filename → camelCase mismatch)"
    ERRORS=$((ERRORS + 1))
  fi

  for entry in "${extra_runtime[@]+"${extra_runtime[@]}"}"; do
    ln="${entry%%:*}"
    nm="${entry#*:}"
    echo "FAIL: $file:$ln — unexpected export '$nm' (only ${expected_base} and ${expected_handler} allowed; move helpers to utils/<name>.ts)"
    ERRORS=$((ERRORS + 1))
  done

  if [[ -n "$type_exports" ]]; then
    while IFS= read -r tline; do
      [[ -z "$tline" ]] && continue
      ln="${tline%%:*}"
      rest="${tline#*:}"
      echo "FAIL: $file:$ln — type/interface export not allowed here; move to types.ts (${rest# })"
      ERRORS=$((ERRORS + 1))
    done <<< "$type_exports"
  fi

  # Inline non-exported helpers (top-level const/function/let/var) — these are
  # the "inline helper detected" violations.
  inline_helpers=$(grep -nE '^(const|let|var|function|async[[:space:]]+function|class)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*' "$file" || true)
  if [[ -n "$inline_helpers" ]]; then
    while IFS= read -r hline; do
      [[ -z "$hline" ]] && continue
      ln="${hline%%:*}"
      snippet="${hline#*:}"
      # Trim
      snippet="$(echo "$snippet" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
      echo "FAIL: $file:$ln — inline helper detected — move to utils/<name>.ts (${snippet:0:80})"
      ERRORS=$((ERRORS + 1))
    done <<< "$inline_helpers"
  fi

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: oRPC mutation/query files follow strict structure"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
