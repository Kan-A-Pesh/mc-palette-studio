#!/usr/bin/env bash
# Verify migration journal/snapshots are append-only (no deletions/mutations to existing entries)

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

META_DIR="$SRC_DIR/packages/database/migrations/meta"
[[ ! -d "$META_DIR" ]] && META_DIR="packages/database/migrations/meta"

if ! command -v git >/dev/null 2>&1; then
  echo "OK: skipped (no git available)"
  exit 0
fi

if ! git -C "$SRC_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "OK: skipped (no git history)"
  exit 0
fi

if [[ ! -d "$META_DIR" ]]; then
  echo "OK: skipped (no migrations/meta directory)"
  exit 0
fi

JOURNAL="$META_DIR/_journal.json"

# Determine commit range (last 10 commits or all if fewer)
if ! git -C "$SRC_DIR" rev-parse HEAD~10 >/dev/null 2>&1; then
  RANGE=""
else
  RANGE="HEAD~10..HEAD"
fi

# Check _journal.json for deletions
if [[ -f "$JOURNAL" ]]; then
  if [[ -n "$RANGE" ]]; then
    DIFF=$(git -C "$SRC_DIR" diff --unified=0 "$RANGE" -- "$JOURNAL" 2>/dev/null || true)
  else
    DIFF=$(git -C "$SRC_DIR" log -p -- "$JOURNAL" 2>/dev/null || true)
  fi

  # Count removed lines (lines starting with single '-' that aren't '---')
  DELETIONS=$(echo "$DIFF" | grep -E "^-[^-]" | grep -v '^---' | wc -l | tr -d ' ' || true)
  DELETIONS=${DELETIONS:-0}

  if [[ "$DELETIONS" -gt 0 ]]; then
    echo "FAIL: $JOURNAL — $DELETIONS line(s) deleted/modified in journal history (must be append-only)"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Check snapshots: existing snapshots should never be modified
for snap in "$META_DIR"/*_snapshot.json; do
  [[ ! -f "$snap" ]] && continue
  if [[ -n "$RANGE" ]]; then
    DIFF=$(git -C "$SRC_DIR" diff --unified=0 "$RANGE" -- "$snap" 2>/dev/null || true)
  else
    DIFF=""
  fi
  # If snapshot existed before HEAD~10, any '-' line is a mutation
  if git -C "$SRC_DIR" cat-file -e "HEAD~10:$snap" >/dev/null 2>&1; then
    DELETIONS=$(echo "$DIFF" | grep -E "^-[^-]" | grep -v '^---' | wc -l | tr -d ' ' || true)
    DELETIONS=${DELETIONS:-0}
    if [[ "$DELETIONS" -gt 0 ]]; then
      echo "FAIL: $snap — existing snapshot was modified ($DELETIONS line(s) removed)"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: Migration journal/snapshots are append-only"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
