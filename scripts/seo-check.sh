#!/usr/bin/env bash
set -euo pipefail
URL=${1:-http://localhost:3000}
echo "Starting dev server to run simple SEO checks on $URL..."
if [ -f package.json ]; then
  if jq -e '.scripts["build"]' package.json >/dev/null 2>&1; then
    npm run build --silent || true
  fi
  if jq -e '.scripts["start"]' package.json >/dev/null 2>&1; then
    (npm run start --silent & echo $! > .seo-dev.pid) || true
    # wait for server
    for i in {1..60}; do
      if curl -sSf "$URL" >/dev/null; then break; fi; sleep 1; done
  fi
fi
# Basic checks: title, meta description, canonical, h1 count
TMP=$(mktemp)
curl -sS "$URL" > "$TMP"
TITLE=$(grep -oP '(?<=<title>).*?(?=</title>)' "$TMP" | head -n1 || true)
DESC=$(grep -oP '<meta[^>]+name=["\']description["\'][^>]+content=["\'].*?["\']' "$TMP" | sed -E 's/.*content=["\'](.*?)["\'].*/\1/' | head -n1 || true)
CANON=$(grep -oP '<link[^>]+rel=["\']canonical["\'][^>]+href=["\'].*?["\']' "$TMP" | sed -E 's/.*href=["\'](.*?)["\'].*/\1/' | head -n1 || true)
H1C=$(grep -o "<h1" "$TMP" | wc -l | tr -d ' ')
cat <<EOF
SEO QUICKCHECK for $URL
- title: ${TITLE:-MISSING}
- meta description: ${DESC:-MISSING}
- canonical: ${CANON:-MISSING}
- h1 count: ${H1C:-0}
EOF
rm -f "$TMP"
if [ -f .seo-dev.pid ]; then kill $(cat .seo-dev.pid) 2>/dev/null || true; rm -f .seo-dev.pid; fi
