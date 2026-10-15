#!/usr/bin/env bash
# Verify import depth (max 2 levels of ../) and no cross-feature imports
# Features = direct children of src/ (excluding "shared")
# "shared" imports are always allowed from any feature

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-src}"
ERRORS=0

# Auto-detect feature directories: the FIRST path segment under src/ of any
# tracked directory, excluding "shared". Deriving features from the first
# segment (rather than only directories that are themselves direct children of
# src/) means a feature whose files all live in subfolders — e.g. src/billing
# containing only src/billing/components/* — is still detected as a feature.
FEATURE_DIRS=()
while IFS= read -r feat; do
  [[ -z "$feat" ]] && continue
  [[ "$feat" == "shared" ]] && continue
  FEATURE_DIRS+=("$feat")
done < <(doctor_list_dirs "$SRC_DIR" | grep -v "^${SRC_DIR}$" | while IFS= read -r d; do
  rel="${d#"$SRC_DIR"/}"
  # First path segment under src/.
  echo "${rel%%/*}"
done | sort -u)

while IFS= read -r file; do
  # Extract all import paths
  while IFS= read -r imp; do
    [[ -z "$imp" ]] && continue

    # Skip non-relative imports (node_modules, aliases)
    [[ "$imp" != ./* && "$imp" != ../* ]] && continue

    # Count OCCURRENCES of "../" in the specifier (not matching lines — grep -c
    # returns 1 for any single-line specifier regardless of how many "../" it
    # contains). The `|| true` guards a no-match grep (exit 1) from tripping
    # `set -euo pipefail`.
    depth=$( { echo "$imp" | grep -oE '\.\./' || true; } | wc -l | tr -d ' ')

    # Resolve import path using Node.js (needed for both the depth-exemption and
    # the cross-feature check below).
    file_dir=$(dirname "$file")
    resolved=$(node -e "const p=require('path');process.stdout.write(p.normalize(p.join('$file_dir','$imp')))" 2>/dev/null || echo "")

    # Depth rule: a deep relative reach (>=3 levels of "../") is a violation
    # UNLESS it stays inside the importing file's own package and merely climbs
    # to that package's own `src/` root to reach a shared layer (e.g. an oRPC
    # split-file `routers/<domain>/queries/x.ts` importing
    # `../../../procedure/...` reaches `packages/<pkg>/src/procedure/`). Reaching
    # your own package's src/ root is structurally legitimate, not a fragile
    # cross-tree escape — the same way the `shared/` layer is exempt below.
    if [[ "$depth" -ge 3 ]]; then
      within_pkg_root=0
      if [[ -n "$resolved" ]]; then
        # The package src root of the importing file: the "<...>/src" prefix.
        if [[ "$file" == *"/src/"* ]]; then
          pkg_src="${file%%/src/*}/src"
          # If the resolved target lives directly under that same src/ root
          # (i.e. <pkg>/src/<dir>/...), it is a within-package reach-to-root.
          case "$resolved" in
            "$pkg_src"/*) within_pkg_root=1 ;;
          esac
        fi
      fi
      if [[ "$within_pkg_root" -eq 0 ]]; then
        echo "FAIL: $file — import depth $depth (max 2): from \"$imp\""
        ERRORS=$((ERRORS + 1))
        continue
      fi
    fi

    # Check for cross-feature imports
    rel_path="${file#"$SRC_DIR"/}"
    file_feature=$(echo "$rel_path" | cut -d/ -f1)

    [[ -z "$resolved" ]] && continue

    # Must be under src/
    case "$resolved" in
      "$SRC_DIR"/*) ;;
      *) continue ;;
    esac

    target_rel="${resolved#"$SRC_DIR"/}"
    target_feature=$(echo "$target_rel" | cut -d/ -f1)

    # Allow: shared, same feature
    [[ "$target_feature" == "shared" ]] && continue
    [[ "$target_feature" == "$file_feature" ]] && continue

    # Check if both source and target are feature dirs
    source_is_feature=false
    target_is_feature=false
    for fd in "${FEATURE_DIRS[@]}"; do
      [[ "$file_feature" == "$fd" ]] && source_is_feature=true
      [[ "$target_feature" == "$fd" ]] && target_is_feature=true
    done

    if $source_is_feature && $target_is_feature; then
      echo "FAIL: $file — cross-feature import from '$file_feature' to '$target_feature': from \"$imp\""
      ERRORS=$((ERRORS + 1))
    fi

  done < <(grep -oE "(from|import) [\"'][^\"']+[\"']" "$file" 2>/dev/null \
    | sed -E "s/(from|import) [\"']([^\"']+)[\"']/\2/" || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx | grep -v '\.d\.ts$')

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: All imports within depth limit and no cross-feature imports"
else
  echo ""
  echo "TOTAL: $ERRORS import violation(s)"
  exit 1
fi
