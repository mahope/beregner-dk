#!/usr/bin/env bash
set -e
URL=${1:-http://localhost:3000}
if ! command -v lighthouse >/dev/null; then
  echo "Install lighthouse (npm i -g lighthouse)" >&2
  exit 1
fi
lighthouse "$URL" --preset=desktop --output=json --output-path=./lighthouse-report.json
if command -v jq >/dev/null; then
  jq '.categories.performance.score' ./lighthouse-report.json || true
fi
