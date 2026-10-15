#!/usr/bin/env bash
# Detects TODO/FIXME/HACK comments without a tracking ref (URL, [JAB-123], or @username)

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

should_skip() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*|*packages/database/migrations/*) return 0 ;;
  esac
  case "$f" in
    apps/*|packages/*) return 1 ;;
    */apps/*|*/packages/*) return 1 ;;
    *) return 0 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_skip "$file" && continue
  [[ ! -f "$file" ]] && continue

  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    # Has a tracking reference?
    if echo "$content" | grep -qE '(https?://|\([A-Z]+-[0-9]+\)|\[[A-Z]+-[0-9]+\]|@[a-zA-Z][a-zA-Z0-9_-]+)'; then
      continue
    fi
    # Identify which tag matched
    tag=$(echo "$content" | grep -oE '(TODO|FIXME|HACK)' | head -1)
    echo "FAIL: $file:$line_no — $tag without tracking ref (URL, [JAB-123], or @user)"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE '(//[[:space:]]*(TODO|FIXME|HACK)|/\*[[:space:]]*(TODO|FIXME|HACK))' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: all TODO/FIXME/HACK comments have tracking refs"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
