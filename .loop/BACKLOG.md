# Backlog — Idéer til mennesket

Samlet under nightly review (6 iterationer). Prioritér og vælg.

---

## Kræver beslutning

### [M] GDPR-compliant ad loading
- Problem: AdSense loades ubetinget. Cookie-banneret gemmer `accepted: true/false`, men intet checker værdien.
- Forslag: Client component der checker localStorage consent før AdSense loades.
- Rører: `src/app/layout.tsx`, ny `src/components/AdSenseLoader.tsx`
- Hvorfor: kræver compliance-beslutning + prod-test

### [M] Client-side QR-kode generering
- Problem: QR-koder via ekstern API (api.qrserver.com) sender brugerdata til tredjepart.
- Forslag: `qrcode` npm-pakke til client-side generering.
- Rører: `src/components/ShareCalculation.tsx`, `package.json`
- Hvorfor: ny dependency

### [S] ESLint-konfiguration
- Problem: `next lint` deprecated, ingen `.eslintrc`. Biome.json eksisterer men minimal.
- Forslag: Vælg og konfigurér én linter.
- Rører: config-filer, `package.json`
- Hvorfor: kræver valg (ESLint vs Biome)

### [M] Synkronisér API og UI skattesatser
- Problem: `/api/v1/loen` har andre satser end `LoenBeregner.tsx`. API mangler top-topskat.
- Forslag: Shared `src/lib/tax-rates.ts`.
- Rører: API route, LoenBeregner, ny fil
- Hvorfor: kan bryde API-consumere

### [S] Fjern orphan-filer
- Problem: `.backlog_current_task.txt` og `.echo-backlog-ci` er gamle workflow-filer.
- Forslag: `git rm` begge.
- Rører: repo root
- Hvorfor: kræver ejers bekræftelse

## Større refaktor

### [L] Adopt shared CalculatorPageLayout
- Problem: 48 sider duplicerer layout-logik (breadcrumbs, h1, FAQ, sidebar, ads).
- Forslag: Shared layout → ~5 linjer per side i stedet for ~100.
- Rører: Alle `src/app/*/page.tsx` (48 filer)
- Hvorfor: stor refaktor

### [M] NO locale content for legal/info pages
- Problem: `/om`, `/privatlivspolitik`, `/cookiepolitik` viser DA-indhold for NO-brugere. SE har egne versioner.
- Forslag: Skriv `NoContent` med norske referencer (skatteetaten.no, nav.no, datatilsynet.no).
- Rører: 3 page-filer
- Hvorfor: kræver norsk indholdsskrivning

### [M] PrintResult til alle beregnere
- Problem: Kun 7/47 beregnere har PrintResult.
- Forslag: Tilføj til de resterende 40.
- Rører: 40 filer
- Hvorfor: stort batch-arbejde

### [M] API rate limiting
- Problem: API-endpoints har ingen rate limiting.
- Forslag: In-memory rate limiter (IP-baseret).
- Rører: `src/middleware.ts` eller ny fil
- Hvorfor: ny feature

## Accessibility

### [M] Label-linking for select-elementer
- Problem: 25/47 beregnere har `<select>` uden `id`/`htmlFor`-linking. Screen readers kan ikke associere labels korrekt.
- Forslag: Tilføj `useId()` og `htmlFor`/`id` til alle select-elementer.
- Rører: ~25 beregner-komponenter
- Hvorfor: mekanisk batch-arbejde

### [L] Per-side hreflang for info/blog
- Problem: Info-sider mangler hreflang. Kun homepage og 48 calculators har dem.
- Forslag: Tilføj `alternates.languages` til relevante sider.
- Rører: om, privatlivspolitik, cookiepolitik
- Hvorfor: ikke søgemaskine-kritiske sider

## ~~Afsluttet~~
- ~~RelatedCalculators data-dedup~~ ✅
