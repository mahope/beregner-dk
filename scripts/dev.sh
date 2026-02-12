#!/usr/bin/env bash
set -euo pipefail
RUNNER=${1:-}
if command -v pnpm >/dev/null 2>&1; then RUNNER=pnpm; elif command -v bun >/dev/null 2>&1; then RUNNER=bun; else RUNNER=npm; fi
echo "Using $RUNNER"
[ -f package.json ] && $RUNNER install
$RUNNER run dev
