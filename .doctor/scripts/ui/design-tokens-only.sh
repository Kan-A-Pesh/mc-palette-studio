#!/usr/bin/env bash
# Flags hex color codes or rgb() function calls inside JSX className strings.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

should_include() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/.next/*) return 1 ;;
    *packages/ui/src/icons/*) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    packages/ui/src/*|*/packages/ui/src/*) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_include "$file" || continue

  # Match className="..." or className='...' containing #hex or rgb(/rgba(
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    if echo "$content" | grep -qE 'className=["'\''][^"'\'']*#[0-9a-fA-F]{3,8}\b[^"'\'']*["'\'']'; then
      echo "FAIL: $file:$line_no — hex color in className; use design tokens (text-text-strong-950, bg-primary-base, etc.) — no hex/rgb in className"
      ERRORS=$((ERRORS + 1))
    elif echo "$content" | grep -qE 'className=["'\''][^"'\'']*rgba?\('; then
      echo "FAIL: $file:$line_no — rgb()/rgba() in className; use design tokens (text-text-strong-950, bg-primary-base, etc.) — no hex/rgb in className"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -nE 'className=' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no hex/rgb colors found in className — design tokens only"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
