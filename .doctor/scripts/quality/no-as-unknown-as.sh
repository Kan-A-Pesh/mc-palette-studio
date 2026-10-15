#!/usr/bin/env bash
# Detects unsafe TypeScript escape hatches (as unknown as, as any, : any, eslint-disable without comment)

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
    packages/realtime/src/client/socket-event-bridge.ts|*/packages/realtime/src/client/socket-event-bridge.ts) return 0 ;;
    packages/realtime/src/lib/helpers.ts|*/packages/realtime/src/lib/helpers.ts) return 0 ;;
    # Imported verbatim from impulse-studio/ultimate-template realtime —
    # provider.tsx uses `as unknown as { … }` to widen a socket.io Socket
    # shape; tcp-server.ts and create-server.ts use `ServerHandler<any>`
    # / `ClientHandler<any>` at the broker boundary where Zod has already
    # parsed inputs. Refactor deferred until the Somnium realtime layer is
    # rewritten to event-name generics end-to-end.
    packages/realtime/src/client/provider.tsx|*/packages/realtime/src/client/provider.tsx) return 0 ;;
    packages/realtime/src/lib/tcp-server.ts|*/packages/realtime/src/lib/tcp-server.ts) return 0 ;;
    packages/realtime/src/server/create-server.ts|*/packages/realtime/src/server/create-server.ts) return 0 ;;
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

  # 1. "as unknown as" — anywhere (skip if biome-ignore with reason within 3 prior lines)
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    start_line=$((line_no - 3))
    [[ $start_line -lt 1 ]] && start_line=1
    end_line=$((line_no - 1))
    context=""
    if [[ $end_line -ge $start_line ]]; then
      context=$(sed -n "${start_line},${end_line}p" "$file")
    fi
    # Recognize: `// biome-ignore lint/<rule>: <reason>` with non-empty reason within a few prior lines
    if echo "$context" | grep -qE 'biome-ignore[[:space:]]+[a-zA-Z@][a-zA-Z0-9/_-]*:[[:space:]]+\S'; then
      continue
    fi
    echo "FAIL: $file:$line_no — unsafe cast 'as unknown as'"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'as[[:space:]]+unknown[[:space:]]+as' "$file" 2>/dev/null || true)

  # 2. "as any" — exclude "keyof any"
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    # skip if it's "keyof any" on this match position
    if echo "$content" | grep -qE 'keyof[[:space:]]+any'; then
      # may still have a separate "as any" on same line; check
      if ! echo "$content" | grep -qE 'as[[:space:]]+any\b'; then
        continue
      fi
    fi
    echo "FAIL: $file:$line_no — unsafe cast 'as any'"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'as[[:space:]]+any\b' "$file" 2>/dev/null || true)

  # 3. ": any" type annotation — exclude generics (T extends any), keyof any
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    # exclude lines where match is only "extends any" or "keyof any"
    if echo "$content" | grep -qE '(extends[[:space:]]+any|keyof[[:space:]]+any)'; then
      if ! echo "$content" | grep -qE ':[[:space:]]*any(\[\])?\b'; then
        continue
      fi
    fi
    echo "FAIL: $file:$line_no — ': any' type annotation"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE ':[[:space:]]*any(\[\])?\b' "$file" 2>/dev/null || true)

  # 4. eslint-disable with rule but no explanatory comment after the rule
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    # Look at the part after eslint-disable*
    after=$(echo "$content" | sed -E 's/.*eslint-disable(-line|-next-line)?[[:space:]]*//')
    # If empty or only whitespace/closing, treat as "no rule" — skip (we want rule but no comment)
    # The line should have a rule (non-whitespace token) and then optionally "--" or "//" with a why
    # If after contains "--" or after contains a second comment marker, OK
    if echo "$after" | grep -qE -- '--[[:space:]]+\S'; then
      continue
    fi
    # If "after" has just rule name(s) without explanation, FAIL
    # rule names look like word/word or word-word-word
    if echo "$after" | grep -qE '^[a-zA-Z@][a-zA-Z0-9/_-]*'; then
      echo "FAIL: $file:$line_no — eslint-disable without explanatory comment (use '-- reason')"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(grep -nE 'eslint-disable(-line|-next-line)?' "$file" 2>/dev/null || true)

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no unsafe TypeScript escape hatches found"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
