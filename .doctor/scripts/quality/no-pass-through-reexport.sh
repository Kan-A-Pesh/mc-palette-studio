#!/usr/bin/env bash
# Fail pass-through re-export shims and invalid barrel exports.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0
EXEMPT_FILE="$DOCTOR_DIR/config/no-pass-through-reexport-exempt"

is_allowed_barrel_index() {
  local file="$1"
  if [[ "$file" == */index.ts ]]; then
    return 0
  fi
  if [[ "$file" == */index.tsx && "$file" == *"_components/"* ]]; then
    return 0
  fi
  return 1
}

is_orpc_router_barrel() {
  local file="$1"
  [[ "$file" == *"/routers/"*"/queries/index.ts" || "$file" == *"/routers/"*"/mutations/index.ts" ]]
}

# A package-export facade is a file that the owning package registers as a
# public `exports` entry in its package.json AND that only re-exports an
# external (non-relative) module — e.g. `packages/ui/src/icon.ts` exposing
# `@repo/ui/icon -> @remixicon/react`. This is the sanctioned way to publish a
# stable, swappable entry point for a third-party module to the rest of the
# monorepo; it is not a redundant in-package shim. Files re-exporting a relative
# (`./` or `../`) sibling are NOT facades and remain caught.
is_package_export_facade() {
  local file="$1"
  # Walk up to the nearest package.json.
  local dir
  dir="$(cd "$(dirname "$file")" 2>/dev/null && pwd)" || return 1
  local pkg=""
  while [[ -n "$dir" && "$dir" != "/" ]]; do
    if [[ -f "$dir/package.json" ]]; then
      pkg="$dir/package.json"
      break
    fi
    dir="$(dirname "$dir")"
  done
  [[ -z "$pkg" ]] && return 1

  # Path of the source file relative to its package root (e.g. src/icon.ts).
  local pkg_root rel
  pkg_root="$(dirname "$pkg")"
  rel="${file#"$pkg_root"/}"
  # `exports` values can point at either the source (./src/icon.ts) or the
  # built artifact (./dist/icon.js / .d.ts). Match on the basename stem so a
  # source facade is recognised regardless of the build-output mapping.
  local stem
  stem="$(basename "$rel")"
  stem="${stem%.ts}"
  stem="${stem%.tsx}"

  # Confirm the package.json `exports` block references this file's stem.
  grep -qE "\"\\./(src/)?(dist/)?${stem}\.(ts|tsx|js|d\.ts)\"" "$pkg" 2>/dev/null \
    || grep -qE "/${stem}\.(ts|tsx|js)\"" "$pkg" 2>/dev/null
}

while IFS= read -r file; do
  if [[ -f "$EXEMPT_FILE" ]] && grep -qxF "$file" "$EXEMPT_FILE" 2>/dev/null; then
    continue
  fi

  export_from_lines=()
  other_lines=0

  while IFS= read -r line; do
    trimmed=$(echo "$line" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    [[ -z "$trimmed" ]] && continue
    [[ "$trimmed" == //* ]] && continue
    [[ "$trimmed" == "/*"* || "$trimmed" == *"*/" ]] && continue

    if echo "$trimmed" | grep -qE '^export[[:space:]]+(type[[:space:]]+)?\{.*\}[[:space:]]+from[[:space:]]+'; then
      export_from_lines+=("$trimmed")
      continue
    fi

    if echo "$trimmed" | grep -qE '^export[[:space:]]+(type[[:space:]]+)?[^;]+[[:space:]]+from[[:space:]]+'; then
      export_from_lines+=("$trimmed")
      continue
    fi

    other_lines=$((other_lines + 1))
  done < "$file"

  if [[ ${#export_from_lines[@]} -eq 0 ]]; then
    continue
  fi

  if [[ $other_lines -gt 0 ]]; then
    continue
  fi

  if is_allowed_barrel_index "$file" || is_orpc_router_barrel "$file"; then
    for export_line in "${export_from_lines[@]}"; do
      from_path=$(echo "$export_line" | sed -nE "s/.*from[[:space:]]+[\"']([^\"']+)[\"'].*/\1/p")
      if [[ -z "$from_path" ]]; then
        continue
      fi
      if [[ "$from_path" == ../* || "$from_path" == .. ]]; then
        echo "FAIL: $file — barrel must not re-export from parent path \"$from_path\""
        ERRORS=$((ERRORS + 1))
      fi
      if [[ "$from_path" != ./* ]]; then
        echo "FAIL: $file — barrel must not re-export external module \"$from_path\""
        ERRORS=$((ERRORS + 1))
      fi
    done
    continue
  fi

  unique_sources=()
  for export_line in "${export_from_lines[@]}"; do
    from_path=$(echo "$export_line" | sed -nE "s/.*from[[:space:]]+['\"]([^'\"]+)['\"].*/\1/p")
    [[ -z "$from_path" ]] && continue
    already=false
    for existing in "${unique_sources[@]:-}"; do
      if [[ "$existing" == "$from_path" ]]; then
        already=true
        break
      fi
    done
    if [[ "$already" == false ]]; then
      unique_sources+=("$from_path")
    fi
  done

  # Legitimate package-export facade: a public exports entry that only re-exports
  # an external (non-relative) module. Skip it; in-package relative shims are not
  # exempted and still fail below.
  all_external=true
  for from_path in "${unique_sources[@]:-}"; do
    [[ -z "$from_path" ]] && continue
    if [[ "$from_path" == ./* || "$from_path" == ../* || "$from_path" == .. ]]; then
      all_external=false
      break
    fi
  done
  if [[ "$all_external" == true ]] && is_package_export_facade "$file"; then
    continue
  fi

  if [[ ${#export_from_lines[@]} -eq 1 || ${#unique_sources[@]} -le 1 ]]; then
    echo "FAIL: $file — pass-through re-export shim (delete file and import from source)"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  invalid_local=false
  for from_path in "${unique_sources[@]}"; do
    if [[ "$from_path" != ./* ]]; then
      invalid_local=true
      echo "FAIL: $file — non-index aggregator must only re-export from ./ siblings, not \"$from_path\""
      ERRORS=$((ERRORS + 1))
    fi
    if [[ "$from_path" == ../* || "$from_path" == .. ]]; then
      invalid_local=true
      echo "FAIL: $file — non-index aggregator must not re-export from parent \"$from_path\""
      ERRORS=$((ERRORS + 1))
    fi
  done

  if [[ "$invalid_local" == false && ${#unique_sources[@]} -ge 2 ]]; then
    echo "WARN: $file — prefer renaming to index.ts for local multi-export barrels"
  fi
done < <(doctor_list_files "$SRC_DIR" ts tsx | sort)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no pass-through re-export shims or invalid barrel exports"
else
  echo ""
  echo "TOTAL: $ERRORS re-export violation(s)"
  exit 1
fi
