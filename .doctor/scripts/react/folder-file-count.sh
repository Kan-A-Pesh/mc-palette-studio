#!/usr/bin/env bash
# Verify folders contain at most 7 files (WARN) / 9 files (FAIL).
# Encourages splitting oversized folders into themed subfolders.
# Scope: apps/web/** ONLY (packages/ui is an AlignUI design system — many sibling primitives by design).
# Skips:
#   - node_modules/, .next/, .git/, dist/, build/, .cache/
#   - .doctor/ (config-only)
#   - apps/web/app/ root (App Router conventions accumulate top-level files)

set -uo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
WARNS=0

WARN_THRESHOLD=7
FAIL_THRESHOLD=9

# Collect every tracked .ts/.tsx file once, then derive both the directory list
# and the per-directory file counts from the SAME source. Using `find` to count
# would include .gitignore'd files (generated output, local artifacts) that the
# directory discovery — driven by `doctor_list_files` — never sees, inflating
# counts. Counting tracked files keeps discovery and counting aligned.
ALL_FILES=$(doctor_list_files "$SRC_DIR" ts tsx)
folders=$(printf '%s\n' "$ALL_FILES" | while IFS= read -r f; do [[ -n "$f" ]] && dirname "$f"; done | sort -u)

# count_in_dir <dir> — number of tracked .ts/.tsx files DIRECTLY in <dir>.
count_in_dir() {
  local target="$1"
  printf '%s\n' "$ALL_FILES" | while IFS= read -r f; do
    [[ -n "$f" ]] && [[ "$(dirname "$f")" == "$target" ]] && printf '.\n'
  done | wc -l | tr -d ' '
}

while IFS= read -r dir; do
  [[ -z "$dir" ]] && continue

  # Exclude common build/output dirs and config-only paths.
  case "$dir" in
    *node_modules*|*.next*|*.git/*|*/dist/*|*/build/*|*.cache*) continue ;;
    .doctor*|*/.doctor*) continue ;;
  esac

  # Limit scope to apps/web/** ONLY.
  case "$dir" in
    apps/web|apps/web/*) ;;
    ./apps/web|./apps/web/*) ;;
    *) continue ;;
  esac

  # Skip the App Router root itself — top-level page.tsx/layout.tsx/etc. cluster naturally.
  case "$dir" in
    apps/web/app|./apps/web/app) continue ;;
  esac

  # Count tracked .ts/.tsx files DIRECTLY in this folder (not subfolders).
  count=$(count_in_dir "$dir")

  if (( count > FAIL_THRESHOLD )); then
    echo "FAIL: $dir — $count files (max $FAIL_THRESHOLD); split into themed subfolders"
    ERRORS=$((ERRORS + 1))
  elif (( count > WARN_THRESHOLD )); then
    echo "WARN: $dir — $count files (warn $WARN_THRESHOLD); consider themed subfolders"
    WARNS=$((WARNS + 1))
  fi
done <<< "$folders"

if [[ $ERRORS -eq 0 ]]; then
  if [[ $WARNS -eq 0 ]]; then
    echo "OK: all folders within file count limits"
  else
    echo "OK: $WARNS warning(s), no failures"
  fi
else
  echo ""
  echo "TOTAL: $ERRORS folder violation(s) ($WARNS warning(s))"
  exit 1
fi
