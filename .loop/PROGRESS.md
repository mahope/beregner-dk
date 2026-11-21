# Nightly Review Progress — FINAL

## Baseline (stadig grøn efter 35 commits)
- TypeScript: ✅ clean (0 errors)
- Tests: ✅ 139/139 passed (12 test files, up from 43/1)
- Build: ✅ succeeds (Next.js 15 standalone)
- Branch: `loop/nightly-review`
- PR: https://github.com/mahope/beregner-dk/pull/2 (DRAFT)
- Total commits: 35

## Fase 0–9 — ALL DONE + BACKLOG-arbejde

### Samlet over 9 iterationer:
- **Sikkerhed**: 4 P1 + 3 P2 fixet
- **Tests**: 96 nye tests (139 total, 12 test-filer — ALLE lib-moduler)
- **Dead code**: 5 oprydninger (~400 linjer fjernet)
- **Performance**: useMemo + 9 memory leak fixes
- **i18n**: 10+ komponenter oversat
- **Dark mode**: 5 komponenter fixet
- **SEO**: robots.txt, structured data, hreflang
- **Integrationer**: manifest locale-aware
- **Feature-polish**: share/search/related calc + data-dedup

### Alle 12 test-filer:
1. `calculations.test.ts` — 51 tests
2. `domain-config.test.ts` — 9 tests
3. `format.test.ts` — 11 tests
4. `calculation-state.test.ts` — 5 tests
5. `trending.test.ts` — 6 tests
6. `page-data.test.ts` — 11 tests
7. `i18n.test.ts` — 11 tests
8. `navigation.test.ts` — 4 tests
9. `calculator-list.test.ts` — 10 tests
10. `categories.test.ts` — 9 tests
11. `home-data.test.ts` — 6 tests
12. `footer-data.test.ts` — 6 tests

## DEFERRED (kræver menneske)
- **GDPR/AdSense**: AdSense indlæses ubetinget uanset cookie-consent
- **QR-kode privacy**: ShareCalculation sender data til api.qrserver.com
- **API/UI skat-inkonsistens**: /api/v1/loen mangler top-topskat
- **NO locale fallback**: Info-sider viser DA for NO-locale
