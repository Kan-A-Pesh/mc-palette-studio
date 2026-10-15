#!/usr/bin/env bash
# Detects .tsx files using React hooks without a 'use client' directive

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

in_scope() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*) return 1 ;;
    *.test.tsx|*.spec.tsx) return 1 ;;
    # Vendored shadcn/AlignUI primitives — emitted verbatim by the design-system
    # CLI. Their hook usage (e.g. React.useId / React.useContext for rendering
    # helpers) does not require a 'use client' directive, and they are kept as
    # upstream source. Consistent with the same exemption in
    # ui/no-arbitrary-tailwind and react/component-format.
    packages/ui/src/ui/*|*/packages/ui/src/ui/*) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    packages/ui/src/*|*/packages/ui/src/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Built-in React/Next hooks pattern
BUILTIN_HOOKS='\b(useState|useEffect|useCallback|useMemo|useRef|useContext|useReducer|useTransition|useOptimistic|useLayoutEffect|useFormStatus|useFormState|useActionState|useRouter|usePathname|useSearchParams|useParams|useId)[[:space:]]*\('
# Any custom hook (use[A-Z]...)
CUSTOM_HOOK='\buse[A-Z][[:alnum:]_]*[[:space:]]*\('

has_use_client() {
  local file="$1"
  # First non-empty, non-comment line
  awk '
    /^[[:space:]]*$/ { next }
    /^[[:space:]]*\/\// { next }
    /^[[:space:]]*\/\*/ { in_block=1 }
    in_block {
      if (/\*\//) { in_block=0 }
      next
    }
    {
      print
      exit
    }
  ' "$file" | grep -qE "^[[:space:]]*['\"]use client['\"]"
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    apps/realtime/*) continue ;;
    */apps/realtime/*) continue ;;
  esac
  in_scope "$file" || continue

  # Find first hook usage
  hook_line=$(grep -nE "$BUILTIN_HOOKS" "$file" 2>/dev/null | head -1 || true)
  if [[ -z "$hook_line" ]]; then
    hook_line=$(grep -nE "$CUSTOM_HOOK" "$file" 2>/dev/null \
      | grep -vE '\b(use server|use client|use strict)\b' \
      | head -1 || true)
  fi

  [[ -z "$hook_line" ]] && continue

  if ! has_use_client "$file"; then
    line_no="${hook_line%%:*}"
    rest="${hook_line#*:}"
    hook_name=$(echo "$rest" | grep -oE '\buse[A-Za-z][[:alnum:]_]*' | head -1)
    echo "FAIL: $file:$line_no — uses hook '$hook_name' but missing 'use client' directive"
    ERRORS=$((ERRORS + 1))
  fi

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: all hook-using .tsx files have 'use client'"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
