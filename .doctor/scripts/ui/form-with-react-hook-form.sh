#!/usr/bin/env bash
# Flags <form> JSX in apps/web that is not backed by react-hook-form / @repo/ui form.

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

should_include() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/.next/*) return 1 ;;
  esac
  case "$f" in
    apps/web/*|*/apps/web/*) return 0 ;;
    *) return 1 ;;
  esac
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  should_include "$file" || continue

  # Find first native <form opening tag occurrence.
  form_line=$(grep -nE '<form\b' "$file" 2>/dev/null | head -n1 || true)
  [[ -z "$form_line" ]] && continue

  line_no="${form_line%%:*}"

  # A native <form> is considered RHF-backed only if the file actually WIRES it
  # to react-hook-form, not merely if it imports rhf for some unrelated reason.
  # Accept when ANY of these real-usage signals are present — covering both
  # self-contained forms and presentational sub-forms that receive the rhf
  # handlers from a parent via props:
  #   - handleSubmit / handleSubmitXxx  the rhf submit wrapper (onSubmit={handleSubmit...(...)})
  #   - useForm( / useFormContext(      an rhf form instance is created/consumed
  #   - <Form> / <FormProvider>         the @repo/ui (or rhf) provider wraps fields
  #   - register( / {...register…}      rhf field registration (incl. prefixed names)
  #   - UseFormReturn / UseFormRegister / FieldErrors  rhf prop types (presentational form)
  is_backed=0
  if grep -qE '\bhandleSubmit[A-Za-z0-9_]*\(' "$file" 2>/dev/null; then is_backed=1; fi
  if [[ "$is_backed" -eq 0 ]] && grep -qE '\b(useForm|useFormContext)\b' "$file" 2>/dev/null; then is_backed=1; fi
  if [[ "$is_backed" -eq 0 ]] && grep -qE '<(Form|FormProvider)\b' "$file" 2>/dev/null; then is_backed=1; fi
  if [[ "$is_backed" -eq 0 ]] && grep -qE '\.\.\.register[A-Za-z0-9_]*\(|\bregister[A-Za-z0-9_]*\(' "$file" 2>/dev/null; then is_backed=1; fi
  if [[ "$is_backed" -eq 0 ]] && grep -qE '\b(UseFormReturn|UseFormRegister|FieldErrors)\b' "$file" 2>/dev/null; then is_backed=1; fi

  if [[ "$is_backed" -eq 0 ]]; then
    echo "FAIL: $file:$line_no — native <form> not wired to react-hook-form (no handleSubmit/useForm/<Form>/register/rhf-types in file)"
    ERRORS=$((ERRORS + 1))
  fi

done < <(doctor_list_files "$SRC_DIR" tsx)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: every <form> uses react-hook-form"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
