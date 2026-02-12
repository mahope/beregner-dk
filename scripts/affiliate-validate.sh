#!/usr/bin/env bash
set -euo pipefail
PARAM=${1:-aff}
shopt -s globstar nullglob
TMP=$(mktemp)
for f in **/*.md **/*.mdx; do
  grep -Eo '(https?://[^\) >]+' "$f" || true
  grep -Eo 'href=["\']https?://[^"\']+' "$f" | sed -E 's/^href=["\']//; s/["\']$//' || true
done | sort -u > "$TMP"
MISS=0
while IFS= read -r url; do
  if [[ "$url" =~ ^https?://(localhost|127\.0\.0\.1) ]]; then continue; fi
  if [[ "$url" == *.png || "$url" == *.jpg || "$url" == *.jpeg || "$url" == *.svg ]]; then continue; fi
  if [[ "$url" == *"?"* || "$url" == *"&"* ]]; then
    if [[ "$url" != *"$PARAM="* ]]; then
      echo "MISSING PARAM: $url"; ((MISS++)) || true
    fi
  else
    echo "NO QUERY: $url"; ((MISS++)) || true
  fi

done < "$TMP"
rm -f "$TMP"
if [ "$MISS" -gt 0 ]; then
  echo "Found $MISS potential non-affiliate links"; exit 2
else
  echo "All links include $PARAM parameter"; exit 0
fi
