#!/usr/bin/env bash
# Flags direct imports from raw shadcn/radix sources in apps/web — must use @repo/ui.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

should_include() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/.next/*) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_include "$file" || continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    if echo "$content" | grep -qE "from ['\"]@radix-ui/"; then
      echo "FAIL: $file:$line_no — direct @radix-ui/* import; use @repo/ui primitives instead"
      ERRORS=$((ERRORS + 1))
    elif echo "$content" | grep -qE "from ['\"]@shadcn"; then
      echo "FAIL: $file:$line_no — direct @shadcn import; use @repo/ui primitives instead"
      ERRORS=$((ERRORS + 1))
    elif echo "$content" | grep -qE "from ['\"]cmdk['\"]"; then
      echo "FAIL: $file:$line_no — direct cmdk import; use @repo/ui primitives instead"
      ERRORS=$((ERRORS + 1))
    elif echo "$content" | grep -qE "from ['\"]vaul['\"]"; then
      echo "FAIL: $file:$line_no — direct vaul import; use @repo/ui primitives instead"
      ERRORS=$((ERRORS + 1))
    elif echo "$content" | grep -qE "from ['\"]sonner['\"]"; then
      echo "FAIL: $file:$line_no — direct sonner import; use @repo/ui toast wrapper instead"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -nE "^[[:space:]]*import .* from ['\"]" "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: all UI primitives imported via @repo/ui"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
