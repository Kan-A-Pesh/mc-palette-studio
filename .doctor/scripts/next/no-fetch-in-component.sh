#!/usr/bin/env bash
# Detects bare fetch() calls in component files — use oRPC client instead

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
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    *) return 1 ;;
  esac
}

is_exempt() {
  local f="$1"
  case "$f" in
    apps/web/app/api/*/route.ts|*/apps/web/app/api/*/route.ts) return 0 ;;
    apps/web/lib/api/*|*/apps/web/lib/api/*) return 0 ;;
    apps/web/lib/orpc/*|*/apps/web/lib/orpc/*) return 0 ;;
    */hooks/*) return 0 ;;
    */use-*.tsx) return 0 ;;
  esac
  # Files importing from @repo/server/orpc
  if grep -qE "from[[:space:]]+['\"]@repo/server/orpc['\"]" "$f" 2>/dev/null; then
    return 0
  fi
  # BetterAuth REST endpoints — no oRPC equivalent (consent, OAuth flows, etc.)
  if grep -qE '"/api/auth/[^"]+"' "$f" 2>/dev/null; then
    return 0
  fi
  # Same, via a relative import that resolves to a file containing /api/auth/* URL
  local dir rel imp_path
  dir=$(dirname "$f")
  while IFS= read -r line; do
    if [[ "$line" =~ from[[:space:]]+\"(\.\.?/[^\"]+)\" ]]; then
      rel="${BASH_REMATCH[1]}"
      # Resolve the specifier the way the bundler does: <rel>.ts/.tsx, and the
      # directory-index forms <rel>/index.ts / <rel>/index.tsx (so an import of
      # "./api/auth" matches "./api/auth/index.ts").
      for imp_path in \
        "$dir/$rel.ts" "$dir/$rel.tsx" \
        "$dir/$rel/index.ts" "$dir/$rel/index.tsx"; do
        if [[ -f "$imp_path" ]] && grep -qE '"/api/auth/[^"]+"' "$imp_path"; then
          return 0
        fi
      done
    fi
  done < <(grep -E '^import[[:space:]].*from[[:space:]]+"\.\.?/[^"]+"' "$f" 2>/dev/null || true)
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    apps/realtime/*) continue ;;
    */apps/realtime/*) continue ;;
  esac
  in_scope "$file" || continue
  is_exempt "$file" && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    # Skip globalThis.fetch / window.fetch
    if echo "$content" | grep -qE '\b(globalThis|window|self)\.fetch[[:space:]]*\('; then
      continue
    fi
    # Match bare fetch( but exclude prefetch, refetch, .fetch, etc.
    if echo "$content" | grep -qE '(^|[^a-zA-Z0-9_.])fetch[[:space:]]*\('; then
      echo "FAIL: $file:$line_no — bare fetch() in component (use oRPC client)"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -nE '\bfetch[[:space:]]*\(' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no bare fetch() in component files"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
