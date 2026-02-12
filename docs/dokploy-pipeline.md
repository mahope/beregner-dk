# Dokploy pipeline (scaffold)

Forslag til opsætning af 1-click deploy + preview builds.

```yaml
# dokploy.yml (template)
app: beregner-dk
image: node:20
run:
  - npm ci
  - npm run build
start: node .next/standalone/server.js
preview:
  enabled: true
  baseUrl: preview.beregner.dk
  ttlDays: 7
```

Noter: Kræver miljøvariabler samt Next.js standalone build.
