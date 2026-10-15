#!/usr/bin/env bash
# Flags Tailwind arbitrary values (e.g. w-[200px], text-[14px]) in className strings.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

# Per-file exemption list — paths listed here (one per line, exact match
# against the path emitted by `doctor_list_files`) skip the check. Used for
# pre-existing boilerplate code (e.g. AlignUI auth/settings/subscription
# templates, internal packages/ui primitives) where arbitrary values reflect
# design specs that don't yet have token equivalents.
EXEMPT_FILE="$DOCTOR_DIR/config/arbitrary-tailwind-exempt"
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

should_include() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/.next/*) return 1 ;;
    *packages/ui/src/icons/*) return 1 ;;
    # Vendored shadcn/Radix primitives — emitted by the shadcn CLI and kept
    # verbatim; arbitrary values come from upstream component source, not app
    # styling. The check still covers the rest of packages/ui/src (utils/,
    # custom/, islands, table helpers, etc.).
    packages/ui/src/ui/*|*/packages/ui/src/ui/*) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    packages/ui/src/*|*/packages/ui/src/*) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_include "$file" || continue
  is_exempt_path "$file" && continue

  # Emit `lineno:content` for every line that lies inside a className={...}
  # expression — including continuation lines of a multi-line className. We track
  # the brace depth opened by `className={` so arbitrary values split across lines
  # (e.g. inside a cn(...) call) are not missed.
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue

    # Extract all arbitrary value tokens: <utility>-[<value>]
    matches=$(echo "$content" | grep -oE '\b[a-zA-Z]+[a-zA-Z0-9-]*-\[[^]]+\]' || true)
    [[ -z "$matches" ]] && continue

    while IFS= read -r token; do
      [[ -z "$token" ]] && continue
      # Whitelist exceptions
      case "$token" in
        mask-\[*|grid-cols-\[*) continue ;;
      esac
      # Data attribute selectors (Radix / state variants): data-[state=...], data-[side=...], data-[disabled]
      if echo "$token" | grep -qE 'data-\['; then
        continue
      fi
      # Group/peer/has/aria compound selectors using & reference: group-has-[&], peer-[&:...], has-[&], aria-[&...]
      if echo "$token" | grep -qE '\[&'; then
        continue
      fi
      # has-[…] / group-has-[…] / peer-has-[…] / not-has-[…] state variants (CSS :has()).
      # These select on descendant state (e.g. `has-[[data-state=checked]]:ring-primary-base`,
      # `group-has-[disabled]:text-text-disabled-300`) — not arbitrary style values.
      if echo "$token" | grep -qE '^(group-|peer-|not-)?has-\['; then
        continue
      fi
      # Arbitrary breakpoint variants: min-[560px]:, max-[768px]:, etc. These define
      # the variant breakpoint, not an arbitrary style value.
      if echo "$token" | grep -qE '^(min|max)-\['; then
        continue
      fi
      # Arbitrary state/feature variants: aria-[…], supports-[…]. These are
      # selector variants (e.g. `aria-[checked=true]:bg-primary`,
      # `supports-[display:grid]:grid`), not arbitrary style values.
      if echo "$token" | grep -qE '^(group-|peer-|not-)?(aria|supports)-\['; then
        continue
      fi
      # CSS calc() expressions are OK: foo-[calc(...)]
      if echo "$token" | grep -qE -- '-\[calc\('; then
        continue
      fi
      # CSS var refs are OK: foo-[var(...)]
      if echo "$token" | grep -qE -- '-\[var\('; then
        continue
      fi
      # Tokens referencing theme `var(--…)` deep inside an arbitrary value
      # (e.g. `bg-[linear-gradient(135deg,var(--color-primary-base)_0%,…)]`)
      # are also OK — they pull through the design tokens, just inline.
      if echo "$token" | grep -qE 'var\(--'; then
        continue
      fi
      echo "FAIL: $file:$line_no — arbitrary Tailwind value '$token'; use design tokens or extend theme"
      ERRORS=$((ERRORS + 1))
    done <<< "$matches"

  done < <(awk '
    BEGIN { depth = 0 }
    {
      emit = 0
      # If we are already inside a className expression, this whole line counts.
      if (depth > 0) emit = 1
      # The string form `className="..."` is always single-line — emit directly.
      if ($0 ~ /className=/) emit = 1

      line = $0
      n = length(line)
      i = 1
      while (i <= n) {
        # Detect the start of a className={ ... } expression (11 chars).
        if (depth == 0 && substr(line, i, 11) == "className={") {
          emit = 1
          depth = 1
          i += 11
          continue
        }
        if (depth > 0) {
          c = substr(line, i, 1)
          if (c == "{") depth++
          else if (c == "}") { depth--; if (depth < 0) depth = 0 }
        }
        i++
      }
      if (emit) print NR ":" line
    }
  ' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no arbitrary Tailwind values in className"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
