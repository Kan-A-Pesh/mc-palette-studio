#!/usr/bin/env bash
# .doctor — Project-wide verification runner
# Runs all checks and reports per-check pass/fail.
#
# Usage: bash .doctor/run.sh [--ci] [src-dir]
#        --ci   Emit GitHub Actions annotations (::error / ::warning)
#        Also auto-detected when CI=true (set by GitHub Actions)
# Exit:  0 if all checks pass, 1 if any check fails

set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

# ─── CI mode detection ──────────────────────────────────────
CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
  shift
elif [[ "${CI:-}" == "true" ]]; then
  CI_MODE=true
fi

SRC="${1:-.}"
FAIL=0
RESULTS=()

# All available checks (namespace/name)
ALL_CHECKS=(
  # react/ — upstream component checks
  "react/file-naming"
  "react/component-format"
  "react/name-match"
  "react/unused-files"
  "react/duplicates"
  "react/max-file-size"
  "react/import-depth"
  "react/tailwind-consistency"
  "react/index-reexports"
  "react/folder-file-count"
  # quality/ — cross-cutting code quality
  "quality/no-as-unknown-as"
  "quality/empty-catch-block"
  "quality/no-console-log"
  "quality/no-todo-without-issue"
  "quality/no-pass-through-reexport"
  # drizzle/ — schema + migration conventions
  "drizzle/ulid-defaultfn"
  "drizzle/migration-journal-integrity"
  "drizzle/snake-case-columns"
  "drizzle/relations-separate-file"
  "drizzle/timestamps-required"
  "drizzle/enum-naming"
  "drizzle/foreign-key-on-delete"
  "drizzle/index-on-fk"
  # orpc/ — router conventions
  "orpc/no-throw-new-error"
  "orpc/procedure-naming-v2"
  "orpc/no-direct-db-import"
  "orpc/router-tree-structure"
  "orpc/input-zod-required"
  "orpc/permission-middleware"
  "orpc/pagination-helper"
  "orpc/no-business-logic-in-router"
  "orpc/file-structure"
  # next/ — App Router + API routes
  "next/use-client-missing"
  "next/no-server-actions"
  "next/no-process-env-leak"
  "next/auth-on-api-route"
  "next/link-not-anchor"
  "next/no-fetch-in-component"
  "next/no-hardcoded-route"
  "next/no-use-client-on-page"
  # ui/ — design system + components
  "ui/design-tokens-only"
  "ui/no-arbitrary-tailwind"
  "ui/repo-ui-imports"
  "ui/form-with-react-hook-form"
  "ui/cn-utility-required"
  # realtime/ — broker, events, TCP (see .cursor/rules/project/realtime-doctor.mdc)
  "realtime/handler-registry-sync"
  "realtime/broker-events-defined"
  "realtime/no-tcp-outside-lib"
  "realtime/env-imports"
  "realtime/load-env-entry"
  "realtime/no-direct-emitter"
  "realtime/no-direct-socket-io-in-web"
  "realtime/no-inline-handler-input-type"
  "realtime/handler-folder-structure"
  "realtime/event-naming"
  "realtime/no-business-logic-in-handler"
)

# Load disabled checks from config (if present)
DISABLED=()
CHECKS_CONFIG="$DIR/config/checks"
if [ -f "$CHECKS_CONFIG" ]; then
  while IFS= read -r line; do
    line="${line%%#*}"          # strip comments
    line="$(echo "$line" | tr -d '[:space:]')"  # trim
    [ -z "$line" ] && continue
    DISABLED+=("$line")
  done < "$CHECKS_CONFIG"
fi

is_disabled() {
  local check="$1"
  for d in "${DISABLED[@]+"${DISABLED[@]}"}"; do
    [ "$d" = "$check" ] && return 0
  done
  return 1
}

# ─── CI annotation emitter ──────────────────────────────────
# Parses script output lines and emits GitHub Actions annotations.
# Always prints the original line. In CI mode, also emits ::error / ::warning.
emit_ci_annotations() {
  local line
  while IFS= read -r line; do
    # Always print the original output
    echo "$line"

    [[ "$CI_MODE" != "true" ]] && continue

    local level="" file="" linenum="" msg=""

    case "$line" in
      FAIL:*|UNUSED:*)
        level="error"
        local rest="${line#*: }"
        # Format: "path/file.ts:42 — message" or "path/file.ts — message" or "path/file.ts"
        if [[ "$rest" =~ ^([^[:space:]]+):([0-9]+)[[:space:]]—[[:space:]](.+)$ ]]; then
          file="${BASH_REMATCH[1]}"; linenum="${BASH_REMATCH[2]}"; msg="${BASH_REMATCH[3]}"
        elif [[ "$rest" =~ ^([^[:space:]]+)[[:space:]]—[[:space:]](.+)$ ]]; then
          file="${BASH_REMATCH[1]}"; msg="${BASH_REMATCH[2]}"
        elif [[ "$rest" =~ ^([^[:space:]]+)$ ]]; then
          file="${BASH_REMATCH[1]}"; msg="unused file"
        fi
        ;;
      DUPE:*|BLOCK:*|TYPE:*)
        level="error"
        local rest="${line#*: }"
        # Extract first file:line from "file:1-5 <-> ..."
        if [[ "$rest" =~ ^([^:]+):([0-9]+) ]]; then
          file="${BASH_REMATCH[1]}"; linenum="${BASH_REMATCH[2]}"
        fi
        msg="$line"
        ;;
      WARN:*)
        level="warning"
        local rest="${line#WARN: }"
        if [[ "$rest" =~ ^([^[:space:]]+)[[:space:]]—[[:space:]](.+)$ ]]; then
          file="${BASH_REMATCH[1]}"; msg="${BASH_REMATCH[2]}"
        else
          msg="$rest"
        fi
        ;;
      MAGIC:*|HOOK:*)
        level="warning"
        msg="$line"
        if [[ "$line" =~ ^HOOK:[[:space:]]([^:]+):([0-9]+) ]]; then
          file="${BASH_REMATCH[1]}"; linenum="${BASH_REMATCH[2]}"
        fi
        ;;
      *)
        continue
        ;;
    esac

    if [[ -n "$level" ]]; then
      local annotation="::${level}"
      if [[ -n "$file" ]]; then
        annotation+=" file=${file}"
        if [[ -n "$linenum" ]]; then
          annotation+=",line=${linenum}"
        fi
      fi
      annotation+="::${msg:-$line}"
      echo "$annotation"
    fi
  done
}

doctor_check_slug() {
  echo "$1" | tr '/' '_'
}

RUN_TMP="$(mktemp -d "${TMPDIR:-/tmp}/doctor-run.XXXXXX")"
trap 'rm -rf "$RUN_TMP"' EXIT

run_check_in_background() {
  local check="$1"
  local script="$2"
  local slug out_file exit_file
  slug="$(doctor_check_slug "$check")"
  out_file="$RUN_TMP/${slug}.out"
  exit_file="$RUN_TMP/${slug}.exit"
  (
    set +e
    bash "$script" "$SRC" >"$out_file" 2>&1
    echo $? >"$exit_file"
  ) &
}

for check in "${ALL_CHECKS[@]}"; do
  if is_disabled "$check"; then
    RESULTS+=("  - ${check} (disabled)")
    continue
  fi

  script="$DIR/scripts/${check}.sh"
  run_check_in_background "$check" "$script"
done

wait

for check in "${ALL_CHECKS[@]}"; do
  if is_disabled "$check"; then
    continue
  fi

  slug="$(doctor_check_slug "$check")"
  out_file="$RUN_TMP/${slug}.out"
  exit_file="$RUN_TMP/${slug}.exit"

  echo ""
  echo "── ${check} ─────────────────────────────────────────"

  if [ -f "$out_file" ] && [ -s "$out_file" ]; then
    emit_ci_annotations <"$out_file"
  fi

  script_exit=0
  if [ -f "$exit_file" ]; then
    script_exit="$(cat "$exit_file")"
  else
    script_exit=1
  fi

  if [ "$script_exit" -eq 0 ]; then
    RESULTS+=("  ✓ ${check}")
  else
    RESULTS+=("  ✗ ${check}")
    FAIL=1
  fi
done

echo ""
echo "── Summary ─────────────────────────────────────────"
for r in "${RESULTS[@]}"; do
  echo "$r"
done
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "All checks passed."
else
  echo "Some checks failed."
fi

exit $FAIL
