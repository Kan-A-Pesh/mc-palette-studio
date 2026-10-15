#!/usr/bin/env bash
# Verify .tsx files have exactly one "export default [async] function ComponentName"
# Verify .tsx files have no inline constants (top-level const before export default function)
# Verify .ts files have at most one export (exception: type-only files, stores, API layers)
# Skip: vite-env.d.ts, main.tsx, widget-app.tsx (entry points)

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-src}"
ERRORS=0

# Per-file exemption list — paths skip the "inline constants/functions before
# component" + "multiple named exports" checks. Used for legitimate composite
# files (e.g. sidebar.tsx, user-button.tsx, plans.tsx) where multiple closely
# related sub-components live in one file by design.
EXEMPT_FILE="$DOCTOR_DIR/config/component-format-exempt"
EXEMPT_PATTERNS=()
if [[ -f "$EXEMPT_FILE" ]]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    [[ -z "$line" ]] && continue
    EXEMPT_PATTERNS+=("$line")
  done < "$EXEMPT_FILE"
fi

is_exempt_path() {
  local f="$1"
  for pat in "${EXEMPT_PATTERNS[@]:-}"; do
    [[ -z "$pat" ]] && continue
    if [[ "$f" == *"$pat" ]]; then
      return 0
    fi
  done
  return 1
}

# --- Check .tsx files ---
while IFS= read -r file; do
  basename=$(basename "$file")

  # Skip entry points and index re-export files
  [[ "$basename" == "main.tsx" ]] && continue
  [[ "$basename" == "widget-app.tsx" ]] && continue
  [[ "$basename" == "index.tsx" ]] && continue
  is_exempt_path "$file" && continue

  # Skip namespace / named-exports library primitives (AlignUI / shadcn-style):
  #   no `export default function` + at least one named export form (an
  #   `^export {` re-export block or a top-level `export function/const/class`).
  #   These files expose sub-components either via dot-notation
  #   (`Accordion.Root`, `Accordion.Item`) or as named imports
  #   (`import { CursorLoader }`). Matches the same skip already used by
  #   `react/name-match.sh` so the two checks stay consistent.
  if ! grep -qE "^export default (async )?function " "$file" 2>/dev/null \
     && grep -qE "^export (\{|(async )?function |const |class )" "$file" 2>/dev/null; then
    continue
  fi

  # Skip non-component .tsx files (e.g. ColumnDef factories that use .tsx for
  # type inference). A file is a component only if some top-level function body
  # (return indented at 2 spaces) returns JSX — either `return (<` / `return <`
  # on one line, or `return (` followed by `<` on the next line. Files whose
  # only JSX lives in nested callbacks (e.g. TanStack `cell: ({row}) => ...`)
  # are factories, not components.
  if ! awk '
    /^  return \(?[[:space:]]*</ { found=1; exit }
    /^  return \(?[[:space:]]*$/ { pending=1; next }
    pending && /^[[:space:]]+</ { found=1; exit }
    { pending=0 }
    END { exit !found }
  ' "$file"; then
    continue
  fi

  # Count "export default [async] function" occurrences
  default_count=$(grep -cE "^export default (async )?function " "$file" 2>/dev/null || true)

  if [[ "$default_count" -eq 0 ]]; then
    echo "FAIL: $file — missing 'export default function'"
    ERRORS=$((ERRORS + 1))
  elif [[ "$default_count" -gt 1 ]]; then
    echo "FAIL: $file — multiple 'export default function' ($default_count)"
    ERRORS=$((ERRORS + 1))
  fi

  # Check for non-default exported functions (sub-components) — sub-components
  # in the same file as a default-exported component must live in their own
  # file. Promoted from WARN to FAIL to enforce one-component-per-file.
  named_fn_exports=$(grep -cE "^export (async )?function " "$file" 2>/dev/null || true)
  if [[ "$named_fn_exports" -gt 0 ]]; then
    echo "FAIL: $file — has $named_fn_exports named function export(s) (extract to separate files)"
    ERRORS=$((ERRORS + $named_fn_exports))
  fi

  # Check for inline constants (top-level const declarations before export default function)
  export_line=$(grep -nE "^export default (async )?function " "$file" 2>/dev/null | head -1 | cut -d: -f1)
  if [[ -n "$export_line" && "$export_line" -gt 1 ]]; then
    inline_consts=$(head -n "$((export_line - 1))" "$file" | grep -c "^const " || true)
    if [[ "$inline_consts" -gt 0 ]]; then
      echo "FAIL: $file — has $inline_consts inline constant(s) before component (extract to separate .ts files)"
      ERRORS=$((ERRORS + 1))
    fi

    # Check for top-level helper functions before the component (should be in separate files)
    inline_fns=$(head -n "$((export_line - 1))" "$file" | grep -c "^function " || true)
    if [[ "$inline_fns" -gt 0 ]]; then
      echo "FAIL: $file — has $inline_fns top-level function(s) before component (extract to separate .ts files)"
      ERRORS=$((ERRORS + 1))
    fi
  fi

  # Detect sub-components AFTER the default export — non-exported helper
  # components (function or arrow) declared in the same file as the default
  # component must move to their own file. We count, on the lines after the
  # default export line, top-level `function PascalCase(` declarations and
  # top-level `const PascalCase = (...) =>` arrow assignments that look like
  # they return JSX (have a `<` after the arrow or in a return).
  if [[ -n "$export_line" ]]; then
    sub_fn_components=$(tail -n +"$((export_line + 1))" "$file" | grep -cE '^function [A-Z][A-Za-z0-9_]*\(' || true)
    sub_arrow_components=$(tail -n +"$((export_line + 1))" "$file" | grep -cE '^const [A-Z][A-Za-z0-9_]* = .*=> \(?[[:space:]]*<' || true)
    sub_total=$((sub_fn_components + sub_arrow_components))
    if [[ "$sub_total" -gt 0 ]]; then
      echo "FAIL: $file — has $sub_total inline sub-component(s) after default export (extract to separate files)"
      ERRORS=$((ERRORS + sub_total))
    fi
  fi

done < <(doctor_list_files "$SRC_DIR" tsx)

# --- Check .ts files (non-type files) ---
while IFS= read -r file; do
  basename=$(basename "$file")

  # Skip vite-env.d.ts
  [[ "$basename" == "vite-env.d.ts" ]] && continue

  # Next.js middleware requires named exports for middleware + config
  [[ "$basename" == "middleware.ts" ]] && continue

  # Skip known exceptions: stores, API layers, event definitions
  [[ "$file" == *"/stores/"* ]] && continue
  [[ "$basename" == "tauri-commands.ts" ]] && continue
  [[ "$basename" == "tauri-events.ts" ]] && continue

  # Skip legitimate multi-export categories (path-based):
  #   - Drizzle schemas: multiple pgTable/pgEnum/relations/types per file
  #   - oRPC routers: base + handler + types in one procedure file
  #   - Next.js API routes: GET/POST/DELETE/etc HTTP methods (incl. .well-known
  #     OAuth discovery routes which set `runtime`/`dynamic` exports alongside GET)
  #   - nuqs search-params: multiple parsers per page
  #   - Pure-data files (constants / colors): cohesive data groupings, no logic
  [[ "$file" == *"packages/database/schema/"* ]] && continue
  [[ "$file" == *"packages/database/admin-access/"* ]] && continue
  # Better Auth access-control facades: a permissions module under
  # packages/database/<scope>/ defines `statements`, the `createAccessControl(ac)`
  # instance and the `roles` map as one cohesive unit — they cannot be split
  # across files without breaking the AC graph. Mirrors the admin-access/ skip
  # above and somnium's packages/database/admin-access/permissions.ts. Scoped to
  # the permissions.ts basename so other database modules stay covered.
  [[ "$file" == *"packages/database/"*"/permissions.ts" ]] && continue
  [[ "$file" == *"packages/server/src/routers/"* ]] && continue
  [[ "$file" == *"packages/realtime/"* ]] && continue
  [[ "$file" == *"apps/realtime/"* ]] && continue
  [[ "$file" == *"packages/env/"* ]] && continue
  [[ "$file" == *"/app/api/"*"/route.ts" ]] && continue
  [[ "$file" == *"/.well-known/"*"/route.ts" ]] && continue
  # Public CLI install endpoint: app/install.sh/route.ts sets runtime/dynamic
  # exports alongside GET, same shape as the API/.well-known route handlers.
  [[ "$file" == *"/app/install.sh/route.ts" ]] && continue
  [[ "$basename" == "search-params.ts" ]] && continue
  [[ "$basename" == "constants.ts" ]] && continue
  [[ "$basename" == *"-constants.ts" ]] && continue
  [[ "$basename" == *"-colors.ts" ]] && continue

  # Count all exports (excluding type/interface exports)
  runtime_exports=$(grep -cE "^export (default |default async |const |function |async function )" "$file" 2>/dev/null || true)

  # Deduplicate: `export default <identifier>;` re-exporting a symbol already
  # declared via `export const|function <identifier>` is a single symbol with
  # two export forms (default + named alias) — count it once.
  while IFS= read -r ident; do
    [[ -z "$ident" ]] && continue
    if grep -qE "^export (const|function|async function) ${ident}(\b|[[:space:]]|\(|:|=)" "$file" 2>/dev/null; then
      runtime_exports=$((runtime_exports - 1))
    fi
  done < <(grep -E "^export default [A-Za-z_][A-Za-z0-9_]*;[[:space:]]*$" "$file" 2>/dev/null | sed -E 's/^export default ([A-Za-z_][A-Za-z0-9_]*);.*/\1/')

  if [[ "$runtime_exports" -gt 1 ]]; then
    echo "FAIL: $file — has $runtime_exports runtime exports (should be 1 per file)"
    ERRORS=$((ERRORS + 1))
  fi

done < <(doctor_list_files "$SRC_DIR" ts | grep -v '\.d\.ts$')

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: All components follow the export default function pattern"
else
  echo ""
  echo "TOTAL: $ERRORS format violation(s)"
  exit 1
fi
