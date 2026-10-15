#!/usr/bin/env bash
# Verify all .ts/.tsx/.css files use kebab-case naming
# Folders must also be kebab-case
# Exceptions:
#   - Vite: vite-env.d.ts
#   - Next.js App Router folders: (route-group), [slug], [...rest], [[...optional]], _private
#   - Next.js convention files: page, layout, error, loading, not-found, template,
#     default, route, middleware, global-error, instrumentation, manifest, sitemap,
#     robots, icon, apple-icon, opengraph-image, twitter-image, favicon

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-src}"
ERRORS=0

# Path-based skips. Realtime workspaces were imported verbatim from
# impulse-studio/ultimate-template (different naming conventions); refactor
# deferred to Somnium realtime redesign.
should_skip_path() {
  local f="$1"
  case "$f" in
    apps/realtime/*|*/apps/realtime/*) return 0 ;;
    packages/realtime/*|*/packages/realtime/*) return 0 ;;
    packages/env/realtime/*|*/packages/env/realtime/*) return 0 ;;
    # cli-python is a Python package; PEP 8 import packages must be snake_case
    # (hyphens are illegal in module names), so kebab-case cannot apply here.
    packages/cli-python/*|*/packages/cli-python/*) return 0 ;;
  esac
  return 1
}

# Check file names
while IFS= read -r file; do
  should_skip_path "$file" && continue
  basename=$(basename "$file")

  # Skip vite-env.d.ts (Vite convention)
  [[ "$basename" == "vite-env.d.ts" ]] && continue

  # Skip the oRPC root router entry. `_app.ts` is the framework-conventional
  # root router file (mirrors Next.js' `_app`), underscore-prefixed to mark it
  # as the aggregation entry. Scoped to the routers root only — arbitrary
  # underscore-prefixed filenames elsewhere still fail kebab-case.
  case "$file" in
    packages/server/src/routers/_app.ts|*/packages/server/src/routers/_app.ts)
      continue
      ;;
  esac

  # Skip Next.js App Router convention files
  case "$basename" in
    page.tsx|page.ts|\
    layout.tsx|layout.ts|\
    error.tsx|\
    loading.tsx|\
    not-found.tsx|not-found.ts|\
    template.tsx|\
    default.tsx|\
    route.ts|route.tsx|\
    middleware.ts|\
    global-error.tsx|\
    instrumentation.ts|\
    manifest.ts|\
    sitemap.ts|\
    robots.ts|\
    icon.tsx|\
    apple-icon.tsx|\
    opengraph-image.tsx|\
    twitter-image.tsx|\
    favicon.ico)
      continue
      ;;
  esac

  # Remove extension for checking
  name="${basename%%.*}"

  # Check: must be lowercase, only a-z, 0-9, hyphens
  if [[ ! "$name" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
    echo "FAIL: $file — filename '$basename' is not kebab-case"
    ERRORS=$((ERRORS + 1))
  fi
done < <(doctor_list_files "$SRC_DIR" ts tsx css)

# Check folder names (only src/ subdirectories)
while IFS= read -r dir; do
  should_skip_path "$dir" && continue
  dirname=$(basename "$dir")

  # Skip root src/ and node_modules
  [[ "$dirname" == "src" ]] && continue
  [[ "$dirname" == "node_modules" ]] && continue

  # Skip repo root and dotfile folders (.git, .husky, .vscode, .doctor, etc.)
  [[ "$dirname" == "." ]] && continue
  [[ "$dirname" == .* ]] && continue

  # Skip Next.js App Router folder conventions
  case "$dirname" in
    # Route groups: (parentheses)
    \(*\))
      continue
      ;;
    # Dynamic segments: [slug], [id], [...rest], [[...optional]]
    \[*\])
      continue
      ;;
    # Private folders: _components, _utils, _lib, etc.
    _*)
      continue
      ;;
    # Public CLI install endpoint: a literal App Router segment named
    # `install.sh` so the route handler resolves at `/install.sh`.
    install.sh)
      continue
      ;;
  esac

  if [[ ! "$dirname" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]; then
    echo "FAIL: $dir/ — folder name '$dirname' is not kebab-case"
    ERRORS=$((ERRORS + 1))
  fi
done < <(doctor_list_dirs "$SRC_DIR")

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: All file and folder names are kebab-case"
else
  echo ""
  echo "TOTAL: $ERRORS naming violation(s)"
  exit 1
fi
