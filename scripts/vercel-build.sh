#!/usr/bin/env bash
# Vercel buildCommand entrypoint.
#
# Unified deploy pipeline (production + preview):
#   1. db migrate
#   2. Railway start (detach) — upsert vars, deploy via serviceInstanceDeployV2
#   3. Railway wait (poll SUCCESS)
#   4. Resolve Railway WS/TCP URLs → bake into the web build
#   5. turbo build (Vercel web app)
#
# Local dev uses localhost realtime URLs (no Railway sync).
#
# Environment routing (SOM-22 canonical names — never a raw branch name):
#   VERCEL_ENV=production                                  -> Railway: production
#   VERCEL_ENV=preview  + VERCEL_GIT_COMMIT_REF=dev        -> Railway: dev
#   VERCEL_ENV=preview  + open PR (VERCEL_GIT_PULL_REQUEST_ID / GitHub API) -> Railway: pr-{id}
#   VERCEL_ENV=development / unset                         -> migrate + build only
#
# Optional Vercel project env vars (production + preview). Without them the
# migrate and Railway steps are skipped and only the web app is built:
#   - RAILWAY_TOKEN (account token, railway.com/account/tokens, Workspace = No workspace)
#   - RAILWAY_PROJECT_ID, RAILWAY_SERVICE_ID
#   - REALTIME_SECRET_KEY (Production minimum; Preview optional — sync falls back to Production)
#   - GITHUB_TOKEN (private repo — needed to resolve the PR number for pr-{id})

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

RAILWAY_STATE_FILE="${REPO_ROOT}/.railway-deploy-state.json"
RAILWAY_SYNC_SCRIPT="${REPO_ROOT}/.github/scripts/railway-preview-sync.mjs"


echo "==> Vercel build"
echo "    cwd=$(pwd)"
echo "    VERCEL_ENV=${VERCEL_ENV:-}"
echo "    VERCEL_GIT_COMMIT_REF=${VERCEL_GIT_COMMIT_REF:-}"
echo "    VERCEL_GIT_PULL_REQUEST_ID=${VERCEL_GIT_PULL_REQUEST_ID:-}"

resolve_github_repo() {
  # owner/slug for the GitHub API. Vercel injects the repo owner+slug on every
  # build; fall back to RAILWAY_GITHUB_REPO if those are absent.
  if [ -n "${VERCEL_GIT_REPO_OWNER:-}" ] && [ -n "${VERCEL_GIT_REPO_SLUG:-}" ]; then
    echo "${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}"
    return 0
  fi
  if [ -n "${RAILWAY_GITHUB_REPO:-}" ]; then
    echo "${RAILWAY_GITHUB_REPO}"
    return 0
  fi
  return 1
}

derive_pr_number_from_github() {
  # Resolve the open PR number for ${VERCEL_GIT_COMMIT_REF} via the GitHub API.
  # Needed because Vercel frequently leaves VERCEL_GIT_PULL_REQUEST_ID empty on
  # preview builds. Requires GITHUB_TOKEN (the repo is private). Prints the PR
  # number on success; prints nothing (and returns non-zero) on any failure.
  local branch="${VERCEL_GIT_COMMIT_REF:-}"
  local repo owner
  repo="$(resolve_github_repo)" || return 1
  owner="${repo%%/*}"
  [ -n "${branch}" ] || return 1
  [ -n "${GITHUB_TOKEN:-}" ] || return 1

  local url="https://api.github.com/repos/${repo}/pulls?state=open&head=${owner}:${branch}"
  local body
  body="$(curl -fsS \
    -H "Authorization: Bearer ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github+json" \
    "${url}" 2>/dev/null)" || return 1

  printf '%s' "${body}" | node -e '
    let d = "";
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => {
      try {
        const arr = JSON.parse(d);
        if (Array.isArray(arr) && arr[0] && arr[0].number) {
          process.stdout.write(String(arr[0].number));
        }
      } catch {
        /* leave empty -> caller fails */
      }
    });
  ' 2>/dev/null
}

resolve_railway_environment_name() {
  # Railway environments are ONLY ever production | dev | pr-<N>. A raw branch
  # name is never a valid environment — if we cannot resolve one of these we
  # fail the build instead of silently creating a branch-named environment.
  case "${VERCEL_ENV:-}" in
    production)
      echo "production"
      ;;
    preview)
      if [ "${VERCEL_GIT_COMMIT_REF:-}" = "dev" ]; then
        echo "dev"
        return 0
      fi

      local pr_id="${VERCEL_GIT_PULL_REQUEST_ID:-}"
      if [ -z "${pr_id}" ]; then
        # Vercel frequently omits the PR id on preview builds, and a PR just
        # opened (push the branch FIRST, then create the PR via the API) is
        # often not yet indexed by GitHub's search when the build reaches this
        # point — so a single lookup returns nothing even though a PR exists
        # moments later. Poll with backoff before giving up.
        local attempt
        for attempt in 1 2 3 4 5 6; do
          pr_id="$(derive_pr_number_from_github || true)"
          if [ -n "${pr_id}" ]; then
            break
          fi
          echo "   PR for '${VERCEL_GIT_COMMIT_REF:-?}' not resolvable yet (attempt ${attempt}/6) — retrying in 5s…" >&2
          sleep 5
        done
      fi

      if [ -z "${pr_id}" ]; then
        echo "!! Cannot resolve a Railway environment for preview branch '${VERCEL_GIT_COMMIT_REF:-?}'." >&2
        echo "   Every non-dev preview must map to an open PR (deploy target 'pr-<N>')." >&2
        echo "   VERCEL_GIT_PULL_REQUEST_ID was empty and no open PR was found via the GitHub API after retrying." >&2
        echo "   Ensure the branch has an open PR and GITHUB_TOKEN is set in the Vercel project env." >&2
        exit 1
      fi

      echo "pr-${pr_id}"
      ;;
    *)
      echo ""
      ;;
  esac
}

resolve_vercel_api_url() {
  if [ "${VERCEL_ENV:-}" = "preview" ] && [ -n "${VERCEL_BRANCH_URL:-}" ]; then
    echo "https://${VERCEL_BRANCH_URL}"
    return 0
  fi

  if [ -n "${VERCEL_PROJECT_PRODUCTION_URL:-}" ]; then
    echo "https://${VERCEL_PROJECT_PRODUCTION_URL}"
    return 0
  fi

  if [ -n "${VERCEL_URL:-}" ]; then
    echo "https://${VERCEL_URL}"
    return 0
  fi

  return 1
}

railway_sync_configured() {
  [ -n "${RAILWAY_TOKEN:-}" ] &&
    [ -n "${RAILWAY_PROJECT_ID:-}" ] &&
    [ -n "${RAILWAY_SERVICE_ID:-}" ]
}

require_railway_sync_config() {
  if railway_sync_configured; then
    return 0
  fi

  echo "!! Railway sync requires RAILWAY_TOKEN, RAILWAY_PROJECT_ID, and RAILWAY_SERVICE_ID." >&2
  echo "   Add them to the Vercel project env vars (Production + Preview)." >&2
  exit 1
}

start_railway_deploy() {
  local environment_name="$1"
  local api_url="$2"

  if [ -z "${VERCEL_GIT_COMMIT_SHA:-}" ]; then
    echo "!! VERCEL_GIT_COMMIT_SHA is required for Railway deploy." >&2
    exit 1
  fi

  echo "==> Starting Railway realtime deploy (env=${environment_name}, api=${api_url}, sha=${VERCEL_GIT_COMMIT_SHA:0:7}, branch=${VERCEL_GIT_COMMIT_REF:-unknown})"
  node "${RAILWAY_SYNC_SCRIPT}" \
    --project-id "${RAILWAY_PROJECT_ID}" \
    --service-id "${RAILWAY_SERVICE_ID}" \
    --environment "${environment_name}" \
    --api-url "${api_url}" \
    --commit-sha "${VERCEL_GIT_COMMIT_SHA}" \
    --git-branch "${VERCEL_GIT_COMMIT_REF:-}" \
    --action start \
    --state-file "${RAILWAY_STATE_FILE}"
}

wait_for_railway_deploy() {
  echo "==> Waiting for Railway realtime deploy to succeed"
  node "${RAILWAY_SYNC_SCRIPT}" \
    --project-id "${RAILWAY_PROJECT_ID}" \
    --action wait \
    --state-file "${RAILWAY_STATE_FILE}" \
    --timeout-ms 900000
}

inject_railway_realtime_urls() {
  echo "==> Resolving Railway realtime URLs for web build"
  local resolved_exports
  if ! resolved_exports="$(
    node "${RAILWAY_SYNC_SCRIPT}" \
      --project-id "${RAILWAY_PROJECT_ID}" \
      --service-id "${RAILWAY_SERVICE_ID}" \
      --action resolve-urls \
      --state-file "${RAILWAY_STATE_FILE}"
  )"; then
    echo "ERROR: failed to resolve Railway realtime URLs (resolve-urls action failed)" >&2
    exit 1
  fi
  eval "$(printf '%s\n' "${resolved_exports}" | sed -n '/^export /p')"
  echo "    NEXT_PUBLIC_REALTIME_WS_URL=${NEXT_PUBLIC_REALTIME_WS_URL:-}"
  echo "    REALTIME_TCP_URL=${REALTIME_TCP_URL:-}"
  export NEXT_PUBLIC_REALTIME_WS_URL
  export REALTIME_TCP_URL
  write_railway_realtime_endpoints_file
}

write_railway_realtime_endpoints_file() {
  local endpoints_file="${REPO_ROOT}/packages/env/web/railway-realtime-endpoints.generated.json"

  node -e "
    const fs = require('node:fs');
    const endpointsFile = process.argv[1];
    const payload = {
      wsUrl: process.env.NEXT_PUBLIC_REALTIME_WS_URL || null,
      tcpUrl: process.env.REALTIME_TCP_URL || null,
    };
    fs.writeFileSync(endpointsFile, \`\${JSON.stringify(payload, null, 2)}\\n\`);
  " "${endpoints_file}"

  echo "    wrote ${endpoints_file}"
}

# The studio is client-side: with no DATABASE_URL / Railway credentials the
# deploy is a plain web build (see .cursor/rules/project/env.mdc).
if [ -n "${DATABASE_URL:-}" ]; then
  echo "==> Running database migrations"
  turbo run db:migrate --filter=@repo/database
else
  echo "==> Skipping database migrations (DATABASE_URL not set)"
fi

RAILWAY_ENV_NAME=""
SHOULD_SYNC_RAILWAY=false

if railway_sync_configured; then
  RAILWAY_ENV_NAME="$(resolve_railway_environment_name)"
fi

if [ -n "${RAILWAY_ENV_NAME}" ]; then
  require_railway_sync_config
  API_URL="$(resolve_vercel_api_url)" || {
    echo "!! Could not resolve Vercel API URL for Railway API_URL sync." >&2
    exit 1
  }
  SHOULD_SYNC_RAILWAY=true
  start_railway_deploy "${RAILWAY_ENV_NAME}" "${API_URL}"
elif ! railway_sync_configured || [ -z "${VERCEL_ENV:-}" ] || [ "${VERCEL_ENV:-}" = "development" ]; then
  echo "==> Skipping Railway deploy (local build or Railway not configured)"
else
  echo "!! Unexpected VERCEL_ENV='${VERCEL_ENV:-}' — cannot determine deploy target." >&2
  exit 1
fi

if [ "${SHOULD_SYNC_RAILWAY}" = true ]; then
  wait_for_railway_deploy
  inject_railway_realtime_urls
fi

echo "==> Building web app"
turbo run build

echo "==> Build + Railway deploy complete"
