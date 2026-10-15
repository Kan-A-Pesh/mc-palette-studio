#!/usr/bin/env bash
# Flag direct `db` client imports from @repo/database in routers — must use context.db.
#
# Allowed:
#   - import type { ... } from '@repo/database'
#   - import { ateliers, chapters, user } from '@repo/database'   (schema table refs)
# Flagged:
#   - import { db } from '@repo/database'
#   - import { db, ateliers } from '@repo/database'

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

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

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue

    # Skip type-only imports: `import type { ... } from '@repo/database'`
    if echo "$content" | grep -qE '^[[:space:]]*import[[:space:]]+type[[:space:]]'; then
      continue
    fi

    # Extract the brace payload `{ ... }` so we can inspect imported specifiers.
    payload=$(echo "$content" | grep -oE 'import[[:space:]]*\{[^}]*\}' | head -1)
    [[ -z "$payload" ]] && continue

    # Flag ONLY a VALUE `db` import: `import { db ... }` or `import { ..., db, ... }`.
    # Inline type-only specifiers (`{ type db }`, `{ type db, users }`) are allowed —
    # they erase at compile time and don't pull in the runtime client.
    if echo "$payload" | grep -qE '(^|[{,[:space:]])db([,}[:space:]]|$)' \
       && ! echo "$payload" | grep -qE '(^|[{,[:space:]])type[[:space:]]+db([,}[:space:]]|$)'; then
      echo "FAIL: $file:$line_no — direct 'db' client import from @repo/database; use context.db"
      ERRORS=$((ERRORS + 1))
      continue
    fi

    # All other value imports (schema tables like `ateliers`, `users`) are OK.
  done < <(grep -nE "^[[:space:]]*import[[:space:]].*from[[:space:]]+['\"]@repo/database['\"]" "$file" 2>/dev/null || true)

done < <(doctor_list_files "$ROUTERS_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no direct 'db' client imports in routers (schema table imports OK)"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
