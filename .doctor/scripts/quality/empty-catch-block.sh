#!/usr/bin/env bash
# Detects empty catch blocks or catch blocks containing only console.error/log

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
    packages/realtime/*|*/packages/realtime/*) return 0 ;;
    # Imported verbatim from impulse-studio/ultimate-template realtime
    # (Yjs document lifecycle, room utils); refactor deferred to Somnium
    # realtime redesign. Somnium-native files (notifications, register-handlers,
    # realtime-database, resolve-session-by-token, shutdown-realtime-app) are
    # not exempt — they must pass the same quality bar as the rest of the repo.
    apps/realtime/src/lib/documents/*|*/apps/realtime/src/lib/documents/*) return 0 ;;
    apps/realtime/src/handlers/documents/*|*/apps/realtime/src/handlers/documents/*) return 0 ;;
    apps/realtime/src/handlers/rooms/*|*/apps/realtime/src/handlers/rooms/*) return 0 ;;
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

  # Single-line empty catch: catch (e) {} or catch {}
  while IFS=: read -r line_no content; do
    [[ -z "$line_no" ]] && continue
    echo "FAIL: $file:$line_no — empty catch block (silent error swallow)"
    ERRORS=$((ERRORS + 1))
  done < <(grep -nE 'catch[[:space:]]*(\([^)]*\))?[[:space:]]*\{[[:space:]]*\}' "$file" 2>/dev/null || true)

  # Multi-line empty catch + console-only catch via awk
  output=$(awk '
    {
      lines[NR] = $0
    }
    END {
      for (i = 1; i <= NR; i++) {
        line = lines[i]
        # Match "catch (...) {" or "catch {" at end of line (open brace on this line)
        if (match(line, /catch[[:space:]]*(\([^)]*\))?[[:space:]]*\{[[:space:]]*$/)) {
          # find next non-blank line
          j = i + 1
          while (j <= NR && lines[j] ~ /^[[:space:]]*$/) j++
          if (j > NR) continue
          next_line = lines[j]

          # Empty multi-line: next non-blank is just "}"
          if (next_line ~ /^[[:space:]]*\}/) {
            print i ":empty:multi-line empty catch block"
            continue
          }

          # console.error/log only? next is console.X(...) and following non-blank is "}"
          if (next_line ~ /^[[:space:]]*console\.(error|log)\(/) {
            # Find the end of the console call. The closing line ends with ")"
            # optionally followed by ";" — the trailing semicolon is optional so
            # that `console.error("x")` (no semicolon) is still detected.
            k = j
            while (k <= NR && lines[k] !~ /\);?[[:space:]]*$/) k++
            if (k > NR) continue
            m = k + 1
            while (m <= NR && lines[m] ~ /^[[:space:]]*$/) m++
            if (m <= NR && lines[m] ~ /^[[:space:]]*\}/) {
              print i ":console:catch block only logs (silent swallow)"
            }
          }
        }
      }
    }
  ' "$file")

  if [[ -n "$output" ]]; then
    while IFS=: read -r line_no kind msg; do
      [[ -z "$line_no" ]] && continue
      echo "FAIL: $file:$line_no — $msg"
      ERRORS=$((ERRORS + 1))
    done <<< "$output"
  fi

done < <(doctor_list_files "$SRC_DIR" ts tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: no empty or log-only catch blocks found"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
