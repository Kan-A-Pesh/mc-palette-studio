#!/usr/bin/env bash
# Detects console.log / console.debug calls in production code (warn/error/info allowed)

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

should_skip() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*) return 0 ;;
    *packages/database/migrations/*) return 0 ;;
    *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx) return 0 ;;
    */scripts/*) return 0 ;;
    apps/realtime/*|*/apps/realtime/*) return 0 ;;
    packages/database/migrate.ts|*/packages/database/migrate.ts) return 0 ;;
    packages/realtime/*|*/packages/realtime/*) return 0 ;;
  esac
  # Scope: apps/web/** or packages/**
  case "$f" in
    apps/web/*|*/apps/web/*) return 1 ;;
    packages/*|*/packages/*) return 1 ;;
    *) return 0 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue
  [[ ! -f "$file" ]] && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    if echo "$content" | grep -qE 'console\.log[[:space:]]*\('; then
      echo "FAIL: $file:$line_no — console.log() in production code"
      ERRORS=$((ERRORS + 1))
    fi
    if echo "$content" | grep -qE 'console\.debug[[:space:]]*\('; then
      echo "FAIL: $file:$line_no — console.debug() in production code"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -nE 'console\.(log|debug)[[:space:]]*\(' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no console.log / console.debug in production code"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
