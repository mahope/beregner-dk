# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: AKTIV (iteration 1 = research-iteration, backlog oprettet)

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint    # biome lint ./src
npm run test    # vitest run (baseline: 279 tests / 35 filer — SKAL alle bestå)
npm run build   # next build (inkluderer TypeScript-typecheck)
```

Gate = alle tre grønne før merge til `master`.

## Research-fund (iteration 1)

### Skabelon for NY beregner — ALLE registreringssteder:
1. `src/lib/<slug>.ts` — ren logik, JSDoc med formel/kilde
2. `src/lib/<slug>.test.ts` — vitest inkl. kanttilfælde (null/0/negative input)
3. `src/components/<Slug>Beregner.tsx` — "use client"; locale-labels da/se;
   ShareCalculation/CopyResultButton/ResetButton fra ui; calculation-state URL-state;
   analytics trackCalculation(slug); useLocale()
4. `src/app/<slug>/page.tsx` — generatePageMetadata, CalculatorSchema + FAQSchema,
   Breadcrumbs, FAQ, RelatedCalculators, Sidebar; dansk prose-sektion
5. `src/lib/page-data.ts` — entry i `daPages` (+ evt. se/no); slug tilføjes
   `daOnlySlugs` eller `allLocalesSlugs`
6. `src/lib/calculator-list.ts` — `calculatorDefs` (titles/descriptions da/no/se,
   evt. daOnly/seOnly) + `relatedMap` (5 relaterede)
7. `src/lib/categories.ts` — entry i `beregnere[]` med korrekt kategori
8. Sitemap genereres automatisk fra `page-data.getAvailableSlugs()` — ingen manuel redigering
9. Intern linking: relatedMap fra relevante eksisterende sider peger mod den nye side +
   ny side linkes fra relevante blog-artikler hvis der findes en matchende

Kategorier i brug: Økonomi, Bolig, Lån, Sundhed, Familie, Uddannelse, Erhverv,
Hverdag, Praktisk, Matematik (`kategori/<slug>` sider findes for da).

Satser: `src/lib/satser-2026.ts` er single source of truth for danske 2026-satser
(kildeangivet pr. felt). Nye satser tilfælles HER, ikke lokalt i beregnere.

Fundet under research: `relatedMap["/enhedspris"]` refererer til `/rabat`, som IKKE
findes (filtreres væk i runtime). Bygges Rabatberegner (#1) løses referencen naturligt.

## Backlog (prioriteret — byg ÉN ad gangen, helt færdig)

### 1. [ ] Rabatberegner (`/rabat`) — Hverdag
   - Logik: pris efter rabat %, "X for Y"-pris pr. stk., spar-beloeb; tests incl. 0%/100%/negative
   - SEO: "rabat beregner", "procent rabat udregning"; fixer dangling `/rabat`-ref i relatedMap
   - Links: procent, enhedspris, del-regning, moms

### 2. [ ] Befordringsfradrag-beregner (`/befordringsfradrag`) — Økonomi, daOnly
   - Logik: bruger eksisterende `SATSER_2026.koersel*` (24 km bundgrænse, 2,28/1,14 kr/km);
     årlig skattebesparelse; markér satsene med kilde (skat.dk)
   - Research først: verificér 2026-sats + kilometergodtgørelse-sats via webfetch (skat.dk);
     notér fund her
   - SEO: "befordringsfradrag 2026 beregner" — højt sæsonvolumen; links: skattefradrag,
     topskat, loen-efter-skat, rentefradrag

### 3. [ ] Proteinbehov-beregner (`/proteinbehov`) — Sundhed
   - Logik: g/kg efter aktivitetsniveau (0,8 hvile – 1,2–2,0 sport, vejledende);
     tests på kanttilfælde
   - UI/prose markér VEJLEDENDE (ikke medicinsk rådgivning)
   - Links: kalorier, bmi, vaegttab, motion-kalorier

### 4. [ ] Rygestop-besparelse (`/rygestop`) — Sundhed/Hverdag
   - Logik: cig/day × pakkepris ÷ 19 × dage → besparelse dag/maaned/aar/5-aar; trivielt men evergreen
   - Links: budget, sparemaal, opsparing

### 5. [ ] Ugenummer-beregner (`/ugenummer`) — Praktisk
   - Logik: ISO-8601 ugenummer for vilkårlig dato + "nuværende uge"; kant: årsskifte (53 uger)
   - SEO: "hvad uge er det", "ugenummer 2026"
   - Links: dato, alder, nedtaelling, tidsberegner

### 6. [ ] Alkoholenheder-beregner (`/alkoholenheder`) — Sundhed
   - Logik: enheder = cl × pct/100 × 0,789 / 12 (dansk enhed = 12 g); VEJLEDENDE-markering
   - Research: dobbelttjek enhedsdefinition (borger.dk)
   - Links: promille, kalorier, bmi

### 7. [ ] Flyttebudget (`/flyttebudget`) — Hverdag
   - Følger bryllup/rejsebudget-skabelonen; checklist-budget (mægler, flyttemand, depositum osv.)
   - Links: husleje, budget, boliglaan

### 8. [ ] Boligsalgsberegner (`/boligssalg`) — Bolig, daOnly
   - Logik: salgspris − (mæglerhonorar % + fast gebyr + tinglysningsafgift ved ny bolig);
     research kræves: aktuelle satser (tinglysning.dk/skat.dk) — markér usikkerhed hvis tvivl
   - Links: boliglaan, ejendomsvaerdiskat, andelsbolig, kvadratmeter

### 9. [ ] Vedligehold: verificér SATSER_2026 mod officielle kilder
   - Webfetch skat.dk/skm.dk (personskattereform 2026): bund/mellem/topskat-grænser,
     personfradrag, beskæftigelsesfradrag; ret i satser-2026.ts hvis afvigelser;
     notér verifikationsdato + kilde her i planen
   - Kan køres parallelt når en beregner-iteration venter på noget andet

## Beslutninger & noter
- Iteration 1: research-iteration (ingen kodeændringer). Baseline verificeret:
  279/279 tests grønne, lint ok, build ok.
- Gate-definition noteret øverst (lint + test + build).
- Deploy: batch-deployer ~07:30/12:30/17:30. Efter hvert merge: VERIFICÉR-note herunder.

## VERIFICÉR DEPLOY-log
- VERIFICÉR DEPLOY: implementationsplan tilføjet <sha> <tidspunkt>
