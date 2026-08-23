# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: AKTIV

## Prioriteter (opdateret pr. missions-brev 2026-08-22)
1. **Emojis ud → lucide-react ikoner ind** (ca. 666 forekomster i 45 filer) — i etaper, grøn gate mellem hver
2. Flere blogindlæg (20 findes; ét ad gangen med ægte substans + kilder + interne links)
3. Flere beregnere (backlog nedenfor) + løbende korrekthed (2026-satser), UX, CWV

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

### Emoji-udskiftning (Prio 1) — i etaper

**Beslutning (iteration 3):** ét centralt ikonsystem i `src/lib/icons.ts`:
- `calculatorIcons: Record<href, LucideIcon>` — én definition pr. beregner (fjerner duplikering
  på tværs af home-data/categories/calculator-list/footer, som i dag gentager samme emoji pr. locale)
- `getCategoryVisual(name)` → `{ icon, color }` pr. kategori (da/no/se-navnevarianter mappet til
  samme visuel; farve = fulde Tailwind-literal-strenge m. dark-variant, så v4-purge ikke rammer)
- Wrapper-komponenter `src/components/ui/icons.tsx` (`CalcIcon`, `CategoryIcon`): ensartet
  strokeWidth 1,75, dekorativ `aria-hidden`, størrelse via className pr. kontekst
- Data-filernes `emoji: string`/`icon: string`-felter FJERNES (ikke omdøbt) — forbrugere slår op
  centralt. Betydningsbærende ikoner får label (ingen kendte i denne etape; alle er dekorative)

Etaper:
1. [x] FÆRDIG (iteration 3): `icons.ts` + `ui/icons.tsx`; data: `categories.ts`,
   `home-data.ts`; forbrugere: `app/page.tsx`, `kategori/[slug]/page.tsx`, `SearchBar.tsx`.
   Features-sektion 🆓/🔒 → Gift/ShieldCheck.
   Gate grøn: lint ok, 279/279 tests, build ok. Verificeret lokalt mod build-output:
   0 emojis fra home-data/categories på forsiden+kategori (75/44 inline-SVG'er);
   resterende 🧮 i Footer tælles i etape 4.
2. [x] FÆRDIG (iteration 4): `navigation.ts` (alle 120 navne da/no/se strippet for
   emojis, ingen strukturendring) + `Header.tsx`: `CalcIcon` (h-4 w-4, grå, dekorativ)
   renderes foran child-links i både desktop-dropdown og mobilmenu. Ny regressionstest:
   nav-navne må ikke indeholde emojis eller whitespace (`navigation.test.ts`, 280 tests).
   Gate grøn: lint ok, 280/280 tests, build ok. SSR-verificeret: 0 emojis i header-region,
   ikoner via samme centrale href-opslag som SearchBar.
3. [x] FÆRDIG (iteration: 2026-08-23): `calculator-list.ts` — fjernet `icon`-felt
    fra interface + alle 78 entries. Forbrugere: `Sidebar`, `RelatedCalculators`,
    `NotFoundSearch`, `not-found.tsx`, `BeregnerAssistent` — alle skiftet til
    `<CalcIcon href={b.href}>` med konsistent `h-5 w-5`/`h-7 w-7`/`h-8 w-8`,
    grå farve, aria-hidden. Gate: lint ok, 280/280 tests, build ok (124 pages).
    Ikon-valg centralt i icons.ts (fallback Calculator-icon).
4. [x] FÆRDIG (iteration: 2026-08-23): `footer-data.ts` — fjernet `emoji`-felt
    fra FooterCategory + alle entries (da/no/se). `Footer.tsx` — trust-signaler
    🧮📅🔒 → Calculator/CalendarDays/ShieldCheck; kategori-headere → CategoryIcon
    (h-4 w-4, colored). Forbrugere: 1 test grøn. Lokal build: 0 footer-emojis.
    Nye kategorivisualer tilføjet i icons.ts: "Lån & Rente", "Lån & Ränta",
    "Familie & Sundhed", "Familie & Helse", "Familj & Hälsa", "Verktøy", "Verktyg".
5. [ ] Komponent-emojis: `AlderBeregner`, `PlanetVaegtBeregner`, `BraendstofBeregner`,
   `TidsBeregner`, `RentefradragBeregner`, `HuslejeBudgetBeregner`, `BarselBeregner`,
   `ArveafgiftBeregner`, `EfterloensBeregner`, `ElbilBenzinBeregner`, + småforekomster
6. [ ] `app/billaan/page.tsx` (28 forekomster)
7. [ ] Blog-prose-emojis (lav prio; kun hvis de ligner UI, ellers ok i løbende tekst? VURDÉR)
8. [ ] `opengraph-image.tsx` (9 emojis — vurder om lucide kan rendres i OG-image eller drop)

Ikon-valg pr. href er dokumenteret i `src/lib/icons.ts` (meningsfulde valg: hus=bolig,
landmark=lån, piggybank=opsparing osv.).

### Beregnere (Prio 3 — efter blog iflg. missions-brev, men beholdes her som klar backlog)

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
- VERIFICÉR DEPLOY: implementationsplan tilføjet f7633f6 16:20 (2026-08-22)
  → kun repo-filer (IMPLEMENTATION_PLAN.md), intet site-indhold at verificere; health ok.
- DEPLOY OK 2026-08-22: PR #19 (titel-fix, f9dd358/9329b79) verificeret live —
  https://minberegner.dk/moms viser `<title>Momsberegner | MinBeregner.dk</title>` (ikke dobbelt).
- DEPLOY OK 2026-08-23 (iteration 4): etape 1-ikoner (eed982b) verificeret live —
  forside viser 75 lucide-SVG'er og 0 emojis fra home-data/categories; /kategori/bolig
  viser 29 SVG'er og kun Footer-emojis (🧮, tæller i etape 4); /api/health = status ok.
- DEPLOY OK 2026-08-23: navigation-ikoner i header (etape 2) b6b10a3 08:25 —
  verificeret live 13:22: 9 lucide-SVG'er (h-4 w-4, stroke-width=1.75, categoria-ikoner)
  i desktop-dropdown på /kategori/oekonomi.
- VERIFICÉR DEPLOY: calculator-list-ikoner (etape 3) a932b07 13:22
- VERIFICÉR DEPLOY: footer-ikoner (etape 4) 9e50974 13:32
