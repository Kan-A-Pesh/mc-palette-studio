#!/usr/bin/env bash
# Checks API route handlers perform auth/session validation

set -euo pipefail

DOCTOR_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
source "$DOCTOR_DIR/utils/list-files.sh"

SRC_DIR="${1:-.}"
ERRORS=0

in_scope() {
  local f="$1"
  case "$f" in
    *node_modules/*|*/dist/*|*/.next/*) return 1 ;;
  esac
  # Must match apps/web/app/api/**/route.ts
  case "$f" in
    apps/web/app/api/*/route.ts|*/apps/web/app/api/*/route.ts) return 0 ;;
    *) return 1 ;;
  esac
}

is_exempt() {
  local f="$1"
  case "$f" in
    apps/web/app/api/webhook*/*|*/apps/web/app/api/webhook*/*) return 0 ;;
    # GitHub App webhook: authenticated by its x-hub-signature-256 HMAC
    # (verified in handleGithubWebhook), not by a user session.
    apps/web/app/api/github/webhook/*|*/apps/web/app/api/github/webhook/*) return 0 ;;
    # GitHub OAuth *callback* only: a PURE RELAY authenticated by our HMAC-signed
    # `state`, not a user session. It runs on the fixed canonical domain while the
    # user's session lives on the (possibly preview) origin, so a session check is
    # impossible by design — it merely verifies the signed, short-TTL state and
    # relays to the origin's `/complete` (see the route's SECURITY comment). NOTE:
    # `/complete` is deliberately NOT exempted — it DOES check the session
    # (`getServerSession`) + a double-submit cookie, which is what actually closes
    # the linking hijack, so it must pass this rule legitimately.
    apps/web/app/api/github/oauth/callback/*|*/apps/web/app/api/github/oauth/callback/*) return 0 ;;
    apps/web/app/api/public/*|*/apps/web/app/api/public/*) return 0 ;;
    apps/web/app/api/auth/*|*/apps/web/app/api/auth/*) return 0 ;;
    # MCP route uses its own bearer-token auth via `authenticateMcpToken`
    # rather than the standard session — exempt it from the session check.
    apps/web/app/api/mcp/*|*/apps/web/app/api/mcp/*) return 0 ;;
  esac
  return 1
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  case "$file" in
    apps/realtime/*) continue ;;
    */apps/realtime/*) continue ;;
  esac
  in_scope "$file" || continue
  is_exempt "$file" && continue

  if grep -qE '(auth\.api\.getSession|\bgetSession[[:space:]]*\(|\bgetServerSession[[:space:]]*\(|\brequireAuth[[:space:]]*\(|\bgetCurrentUser[[:space:]]*\(|\bauthenticateMcpToken[[:space:]]*\(|\bcreateAtelierUploadHandler[[:space:]]*\(|\bcreateOnBeforeGenerateToken[[:space:]]*\(|await[[:space:]]+auth[[:space:]]*\()' "$file" 2>/dev/null; then
    continue
  fi

  echo "FAIL: $file:1 — API route missing auth/session check (need getSession/getServerSession/requireAuth/getCurrentUser/auth())"
  ERRORS=$((ERRORS + 1))

done < <(doctor_list_files "$SRC_DIR" ts)

if [[ $ERRORS -eq 0 ]]; then
  echo "OK: all API routes perform auth/session check"
else
  echo ""
  echo "TOTAL: $ERRORS violation(s)"
  exit 1
fi
