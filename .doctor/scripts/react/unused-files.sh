#!/usr/bin/env bash
# Detect unused source files in the Somnium pnpm monorepo.
#
# Delegates to the Node helper `utils/find-unused.mjs` which walks the import
# graph from configured entry points and Next.js convention files.
#
# Resolution rules (see utils/find-unused.mjs for full details):
#   @/foo          → apps/web/foo                 (Next.js alias)
#   @repo/<pkg>    → packages/<pkg>/package.json exports
#   @repo/ui/<x>   → packages/ui/src/ui/<x>{.tsx,/index.ts}
#   ./relative     → resolved from source file directory
#   bare imports   → ignored (external npm packages)
#
# Entry points (always considered "used"):
#   - Globs listed in .doctor/config/entry-points
#   - Next.js conventions: apps/web/app/**/{page,layout,error,loading,not-found,template,default}.tsx, route.ts
#   - Package barrels: packages/*/src/index.ts, packages/*/index.ts
#   - Schema barrels: packages/database/schema/**/index.ts
#   - apps/web/middleware.ts, *.config.{ts,js,mjs,cjs}
#
# Exclusions (never flagged): .d.ts, *.test.{ts,tsx}, *.spec.{ts,tsx}, *.stories.tsx,
#   packages/database/migrations/, packages/database/schema/auth.ts (generated),
#   anything under node_modules/, .next/, dist/, build/.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-.}"

exec node "$SCRIPT_DIR/utils/find-unused.mjs" "$ROOT"
