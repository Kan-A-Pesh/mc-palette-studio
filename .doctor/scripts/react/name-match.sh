#!/usr/bin/env bash
# Verify that file names match their default export names
# kebab-case filename → PascalCase component (for .tsx)
# kebab-case filename → camelCase constant/function (for .ts)
# Also verify props interface naming: ComponentNameProps only
#
# Next.js App Router support:
#   For convention files (page.tsx, layout.tsx, error.tsx, loading.tsx,
#   not-found.tsx, template.tsx, default.tsx) the component must be named
#   <FolderName><Suffix> where FolderName is the PascalCase of the closest
#   parent folder that is NOT a route group `(xxx)`, dynamic segment `[xxx]`,
#   or private folder `_xxx`. Root `app/page.tsx` → `HomePage`,
#   root `app/layout.tsx` → `RootLayout`.
#
# macOS compatible (no grep -P, no bash 4+ features)

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-src}"
ERRORS=0

kebab_to_pascal() {
  echo "$1" | awk -F'-' '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1' OFS=''
}

kebab_to_camel() {
  local pascal
  pascal=$(kebab_to_pascal "$1")
  echo "$pascal" | awk '{print tolower(substr($0,1,1)) substr($0,2)}'
}

# Returns "yes" if the given folder basename should be skipped when walking
# parents to compute the FolderName for a Next.js convention file.
is_skipped_segment() {
  local seg="$1"
  case "$seg" in
    \(*\)) return 0 ;;   # route group, e.g. (auth)
    \[*\]) return 0 ;;   # dynamic segment, e.g. [slug] or [...rest]
    _*)    return 0 ;;   # private folder, e.g. _components
  esac
  return 1
}

# Walk up from $1 (the directory containing a convention file), skipping
# route groups, dynamic segments, and private folders. Echoes either:
#   - the basename of the first non-skipped folder, or
#   - "__ROOT__" if we reached the app/ root without finding one.
walk_to_folder_name() {
  local dir="$1"
  # Stop when dir's basename is "app" (Next.js app router root)
  while :; do
    local base
    base=$(basename "$dir")
    if [ "$base" = "app" ]; then
      echo "__ROOT__"
      return
    fi
    if is_skipped_segment "$base"; then
      dir=$(dirname "$dir")
      continue
    fi
    echo "$base"
    return
  done
}

# Maps a convention filename to its expected suffix.
# Empty string if not a convention file.
convention_suffix() {
  case "$1" in
    page.tsx)       echo "Page" ;;
    layout.tsx)     echo "Layout" ;;
    error.tsx)      echo "Error" ;;
    loading.tsx)    echo "Loading" ;;
    not-found.tsx)  echo "NotFound" ;;
    template.tsx)   echo "Template" ;;
    default.tsx)    echo "Default" ;;
    *)              echo "" ;;
  esac
}

# Files that are not React components — always skip.
is_skip_ts_file() {
  case "$1" in
    route.ts|route.tsx) return 0 ;;
    middleware.ts) return 0 ;;
    instrumentation.ts) return 0 ;;
    manifest.ts|sitemap.ts|robots.ts) return 0 ;;
    *.d.ts) return 0 ;;
  esac
  return 1
}

# Extract first "export default [async] function <Name>" from a file.
extract_default_fn_name() {
  grep -E "^export default (async )?function " "$1" 2>/dev/null \
    | head -1 \
    | sed -E 's/^export default (async )?function ([A-Za-z0-9_]+).*/\2/' \
    || true
}

# --- Check .tsx files ---
while IFS= read -r file; do
  basename_f=$(basename "$file")

  # Skip non-component .tsx files (rare but possible)
  if is_skip_ts_file "$basename_f"; then
    continue
  fi

  # Pre-existing legacy skips
  [[ "$basename_f" == "main.tsx" ]] && continue
  [[ "$basename_f" == "widget-app.tsx" ]] && continue
  [[ "$basename_f" == "index.tsx" ]] && continue

  # Namespace / named-exports module pattern (shadcn / AlignUI / icon barrels):
  #   kebab-case filename + NO `export default function` + at least one named export
  #   (either an `export {` block, or `export function/const/class/...`).
  #   These modules expose one or more named exports for either:
  #     - namespace import:  import * as Accordion from "@repo/ui/accordion"
  #     - named import:      import { FormInput } from "@repo/ui/form/form-input"
  #   The filename-to-default-export name-match rule does not apply here.
  #
  #   Also matches semantic suffix files: `<name>.provider.tsx`, `<name>.context.tsx`,
  #   `<name>.hook.tsx` — expected component name is `<KebabPart>Provider/Context/Hook`.
  if [[ "$basename_f" =~ ^[a-z][a-z0-9-]*(\.provider|\.context|\.hook)?\.tsx$ ]]; then
    # Pure re-export module: only `export * from` / `export type * from` (and no
    # default/function/const/class/etc). Skip — these are barrel-style re-exports
    # (e.g. dialog-primitives.tsx → export * from "@radix-ui/react-dialog").
    if grep -qE "^export (type )?\* from " "$file" 2>/dev/null \
       && ! grep -qE "^export default " "$file" 2>/dev/null \
       && ! grep -qE "^export (\{|(async )?function |const |class |interface |type [A-Za-z]|let |var |enum )" "$file" 2>/dev/null; then
      continue
    fi

    if ! grep -qE "^export default (async )?function " "$file" 2>/dev/null \
       && grep -qE "^export (\{|(async )?function |const |class |interface |type |let |var |enum )" "$file" 2>/dev/null; then
      # Semantic-suffix files (.provider.tsx / .context.tsx / .hook.tsx) require a
      # named export matching `<KebabPart>Provider/Context/Hook` — but accept any
      # name ending with that suffix to allow library re-wraps (e.g.
      # ORPCQueryClientProvider in query-client.provider.tsx).
      case "$basename_f" in
        *.provider.tsx)
          if grep -qE "^export (async )?function [A-Za-z0-9_]+Provider\b" "$file" 2>/dev/null \
             || grep -qE "^export const [A-Za-z0-9_]+Provider\b" "$file" 2>/dev/null; then
            continue
          fi
          ;;
        *.context.tsx)
          if grep -qE "^export (async )?function [A-Za-z0-9_]+Context\b" "$file" 2>/dev/null \
             || grep -qE "^export const [A-Za-z0-9_]+Context\b" "$file" 2>/dev/null; then
            continue
          fi
          ;;
        *.hook.tsx)
          if grep -qE "^export (async )?function [A-Za-z0-9_]+Hook\b" "$file" 2>/dev/null \
             || grep -qE "^export const [A-Za-z0-9_]+Hook\b" "$file" 2>/dev/null; then
            continue
          fi
          ;;
        *)
          continue
          ;;
      esac
    fi
  fi

  suffix=$(convention_suffix "$basename_f")

  if [[ -n "$suffix" ]]; then
    # Next.js convention file — compute expected as <FolderName><Suffix>
    dir=$(dirname "$file")
    folder=$(walk_to_folder_name "$dir")

    if [[ "$folder" == "__ROOT__" ]]; then
      # Root-level conventions
      if [[ "$suffix" == "Layout" ]]; then
        expected_pascal="RootLayout"
      elif [[ "$suffix" == "Page" ]]; then
        expected_pascal="HomePage"
      else
        expected_pascal="Root${suffix}"
      fi
    else
      base_pascal=$(kebab_to_pascal "$folder")
      expected_pascal="${base_pascal}${suffix}"
    fi
  else
    # Regular component file — original kebab→Pascal rule
    name="${basename_f%.tsx}"
    expected_pascal=$(kebab_to_pascal "$name")
  fi

  actual=$(extract_default_fn_name "$file")

  # Email templates: accept `<expected>Template` as a valid alternative.
  # Convention in packages/email/src/ is to suffix React Email components with
  # `Template` (ChangeEmailTemplate, ResetPasswordTemplate, ...).
  if [[ "$file" == *"packages/email/src/"* ]] && [[ -n "$actual" ]] \
     && [[ "$actual" == "${expected_pascal}Template" ]]; then
    expected_pascal="${expected_pascal}Template"
  fi

  if [[ -z "$actual" ]]; then
    echo "FAIL: $file — no 'export default [async] function' found"
    ERRORS=$((ERRORS + 1))
  elif [[ "$actual" != "$expected_pascal" ]]; then
    echo "FAIL: $file — export is '$actual', expected '$expected_pascal'"
    ERRORS=$((ERRORS + 1))
  fi

  # Check props interface naming: only *Props interfaces must match ComponentNameProps
  while IFS= read -r iface; do
    [[ -z "$iface" ]] && continue
    [[ "$iface" != *Props ]] && continue
    if [[ "$iface" != "${expected_pascal}Props" ]]; then
      echo "FAIL: $file — props interface '$iface' should be '${expected_pascal}Props'"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep "^interface " "$file" 2>/dev/null | sed -E 's/^interface ([A-Za-z0-9]+).*/\1/' || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

# --- Check .ts utility files ---
while IFS= read -r file; do
  basename_f=$(basename "$file")
  [[ "$basename_f" == "vite-env.d.ts" ]] && continue

  # Skip Next.js framework files and type declarations
  if is_skip_ts_file "$basename_f"; then
    continue
  fi

  # Skip standard config files (drizzle.config.ts, next.config.ts, tailwind.config.ts, ...)
  case "$basename_f" in
    *.config.ts) continue ;;
  esac

  # Skip type files, stores, API layers, events
  [[ "$file" == *"/types/"* ]] && continue
  [[ "$file" == *"/stores/"* ]] && continue
  [[ "$basename_f" == "tauri-commands.ts" ]] && continue
  [[ "$basename_f" == "tauri-events.ts" ]] && continue

  name="${basename_f%.ts}"
  expected_camel=$(kebab_to_camel "$name")
  expected_pascal=$(kebab_to_pascal "$name")

  # Check for export default [async] function
  actual_fn=$(grep -E "^export default (async )?function " "$file" 2>/dev/null | head -1 | sed -E 's/^export default (async )?function ([a-zA-Z0-9]+).*/\2/' || true)

  # Check for "export default <identifier>" (not function)
  actual_default=$(grep "^export default " "$file" 2>/dev/null | grep -v "function" | head -1 | sed -E 's/^export default ([a-zA-Z][a-zA-Z0-9]*).*/\1/' || true)

  if [[ -n "$actual_fn" ]]; then
    if [[ "$actual_fn" != "$expected_camel" && "$actual_fn" != "$expected_pascal" ]]; then
      echo "FAIL: $file — function '$actual_fn', expected '$expected_camel'"
      ERRORS=$((ERRORS + 1))
    fi
  elif [[ -n "$actual_default" ]]; then
    if [[ "$actual_default" != "$expected_camel" && "$actual_default" != "$expected_pascal" ]]; then
      echo "FAIL: $file — export default '$actual_default', expected '$expected_camel'"
      ERRORS=$((ERRORS + 1))
    fi
  fi

done < <(doctor_list_files "$SRC_DIR" ts | grep -v '\.d\.ts$')

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: All file names match their exports"
else
  echo ""
  echo "TOTAL: $ERRORS name mismatch(es)"
  exit 1
fi
