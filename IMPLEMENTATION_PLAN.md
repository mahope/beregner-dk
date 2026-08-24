# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: AKTIV

## Prioriteter (opdateret pr. missions-brev 2026-08-22)
1. **Emojis ud → lucide-react ikoner ind** (ca. 666 forekomster i 45 filer) — i etaper, grøn gate mellem hver
2. Flere blogindlæg (20 findes; ét ad gangen med ægte substans + kilder + interne links)
3. Flere beregnere (backlog nedenfor) + løbende korrekthed (2026-satser), UX, CWV

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint    # biome lint ./src
npm run test    # vitest run (baseline: 372 tests / 42 filer — SKAL alle bestå)
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
5. [x] FÆRDIG (iteration: 2026-08-23): ALLE komponenter emoji-fri — 24 filer.
    Tom-tilstande (11 stk): TrendingUp/House/Banknote/Wallet/Landmark/Baby/Car/
    ChartColumn/TriangleAlert m. h-10 w-10 grå, aria-hidden. Datamaps typet om til
    `LucideIcon`: PlanetVaegt-NAVN (Venus/Mars/Eclipse=Saturn-ring/Droplets=Neptun,
    PlanetIcon-hjælper), Arveafgift-relationer (Heart/Baby/UserRound/Users/UsersRound/
    Contact), AffiliateBox får valgfrit `icon?: LucideIcon`-prop (Landmark/TrendingUp/
    ShieldCheck/Car på 4 kaldssteder — emoji fjernet fra title/analytics-label).
    Labels strippet + ikon ved render-site: Moms (Lightbulb), Tidszone (SunMedium),
    TidsBeregner (MoonStar/ChartColumn/Zap), Braendstof (Car/ChartColumn/TrendingUp +
    Fuel/Droplets/PlugZap i type-knapper). Vurderings-/status-tekster: CircleCheck/
    TriangleAlert/Siren (HuslejeBudget), Barsel User/UserRound-toggle. Zodiac-symboler
    (♈♉…) fjernet fra AlderBeregner — Sparkles i stedet (ingen lucide-zodiac findes);
    navn+periode bærer betydningen. ✕-fjern-knapper → X-icon (Rentefradrag, Boernepeng).
    PrintResult-logo uden 📊. Gate: lint ok, 280/280 tests, build ok. Lokal SSR-
    verificering: /alder /planetvaegt /braendstof /rentefradrag /barselsdagpenge
    /tidsberegner /tidszone /efterloen /arveafgift /elbil /husleje /billaan = 0 synlige
    emojis, 20-33 unikke lucide-SVG'er pr. side.
    FUND: `countryFlag` (🇩🇰🇳🇴🇸🇪) i domain-config er dødt data uden forbrugere men
    shipper 1× pr. side i RSC-payload — lavprio-oprydning, ikke synligt UI.
6. [x] FÆRDIG (iteration: 2026-08-23): `app/billaan/page.tsx` — 28 ✅/❌ i prose-lister
   → CheckCircle (grøn) / XCircle (rød). Gate: lint ok, 280/280 tests, build ok.
7. [x] SKIPPET (iteration: 2026-08-23): Blog-prose-emojis i løbende tekst er lav prioritet
   jf. missions-brev ("Emoji i ren tekst... er lavere prioritet — tag UI'et først").
   Ingen UI-emojis tilbage; prosa-emojis afklares ved senere gennemgang hvis behov.
8. [x] FÆRDIG (iteration: 2026-08-23 20:16): `opengraph-image.tsx` — 8 emoji-ikoner →
   inline lucide SVG (Banknote, Divide, Scale, Receipt, Landmark, ArrowLeftRight,
   ChartColumn, House) + 3 badge-emojis (🆓🔒🇩🇰) → ren tekst (100% Gratis / Privat & Sikkert /
   2026-satser). Gate: lint ok, 280/280 tests, build ok (124 pages).

Ikon-valg pr. href er dokumenteret i `src/lib/icons.ts` (meningsfulde valg: hus=bolig,
landmark=lån, piggybank=opsparing osv.).

### Beregnere (Prio 3 — efter blog iflg. missions-brev, men beholdes her som klar backlog)

### 1. [x] FÆRDIG (iteration: 2026-08-24 01:50): Rabatberegner (`/rabat`) — Hverdag
   - Logik: pris efter rabat %, rabatprocent mellem original- og tilbudspris; tests incl. 0%/100%/negative/null
   - SEO: "rabat beregner", "procent rabat udregning"; fixer dangling `/rabat`-ref i relatedMap
   - Links: procent, enhedspris, del-regning, moms
   - Ikon: Tag (lucide)
   - Fix: src/app/boernepenge/page.tsx manglede `import Link from "next/link"` — build brød på master
   - Gate grøn: lint ok, 295/295 tests (+15 nye rabat-tests, 36 test-filer), build ok (129 pages)
   - Commitsha: e5b21ae

### 2. [x] FÆRDIG (iteration: 2026-08-24 02:13): Befordringsfradrag-beregner (`/befordringsfradrag`) — Økonomi, daOnly
   - Logik: bruger opdaterede `SATSER_2026.koersel*` (24 km bundgrænse, 3,17/1,59 kr/km standard,
     3,51 kr/km yderkommune); brofradrag (Storebælt 110 kr, Øresund 50 kr); ekstra fradrag op til
     30.800 kr ved indkomst under 391.500 kr; årlig skattebesparelse
   - Research: 2026-satser fra skat.dk (3,17/1,59 vs tidligere 2,23/1,12) — markant stigning ~42%
   - SEO: "befordringsfradrag 2026 beregner" — højt sæsonvolumen; links: skattefradrag,
     topskat, loen-efter-skat, rentefradrag, boliglaan
   - SATSER_2026 opdateret: kørselsfradragssatser + nye felter (yderkommune, ekstra, bro)
   - Skattefradrag FAQ opdateret: gamle 2,23/1,12 → 3,17/1,59 kr/km
   - Gate grøn: lint ok, 314/314 tests (+15 nye, 37 test-filer), build ok (130 pages)
   - Commitsha: c57af43 (merge: bdaf555)

### 3. [x] FÆRDIG (iteration: 2026-08-24 02:56): Proteinbehov-beregner (`/proteinbehov`) — Sundhed
   - Logik: g/kg efter aktivitetsniveau (0,8 stillesiddende – 1,0/1,3/1,6/2,0); min/max range
   - Tests: 6 kanttilfælde (null/negative/500+), alle aktivitetsniveauer, range
   - UI: select-dropdown med 5 niveauer, vægt-input, gradient-resultatboks (rose/orange),
     g/kg-visning, range-visning, vejledende-markering i prose
   - SEO-side: da + se locale, FAQ (4 items), CalculatorSchema + FAQSchema,
     Breadcrumbs, RelatedCalculators, Sidebar, 5 interne links
   - Ikon: Egg (lucide)
   - Registreret: calculator-list (Sundhed + relatedMap 5 veje), categories,
     page-data (da + se, allLocalesSlugs), icons.ts
   - Gate grøn: lint ok, 321/321 tests (+7, 38 filer), build ok
   - Commitsha: 4bc9f44 (merge: 2ba658c)

### 4. [x] FÆRDIG (iteration: 2026-08-24 03:15): Rygestop-besparelse (`/rygestop`) — Sundhed, daOnly
   - Logik: `src/lib/rygestop.ts` — cigaretter/dag × pakkepris ÷ pakkestørrelse; besparelse
     dag/måned/år/5 år; måned = 365/12 dage så 12×måned = år præcist; validering incl.
     null/0/negative/ekstreme inputs (10 tests)
   - PAKKESTØRRELSE: backlog sagde "÷19", men standardpakkken i DK er 20 stk — gjort konfigurerbart
     med default 20 og hint i UI (19-pakker findes hos nogle budgetmærker)
   - Research: skat.dk/cancer.dk/Bing-fetches fejlede (404/irrelevante resultater) — beregneren
     afhænger IKKE af officielle satser (pris = brugerinput), default 60 kr/pakke markeret vejledende;
     tobaksaftalen (afgiftsstigninger frem mod 2028) nævnt generisk i prose uden konkrete satser
   - SEO: "rygestop beregner", "hvad sparer jeg på at holde op"; FAQ 4 items; CalculatorSchema +
     FAQSchema + Breadcrumbs + RelatedCalculators + Sidebar; daOnly (svarende til rabat/befordring)
   - Links: side linker ud til /opsparing /sparemaal /budget i prose; relatedMap: /rygestop →
     opsparing/sparemaal/budget/promille/vaegttab; backlinks tilføjet i /promille og /budget maps
   - Ikon: CigaretteOff (lucide) i icons.ts — verificeret renderet på /kategori/sundhed
   - Gate grøn: lint ok, 331/331 tests (+10 nye, 39 filer), build ok (132 pages)
   - Lokal SSR-verificeret: /rygestop = HTTP 200, resultat + interne links renderer, 156 SVG'er
   - Commitsha: 56401f0 (merge: 06a3239)

### 5. [x] FÆRDIG (iteration: 2026-08-24 05:22): Ugenummer-beregner (`/ugenummer`) — Praktisk
   - Logik: ISO-8601 ugenummer, ISO-år, ugedag; antal uger i året (52/53); årsskifte-kanttilfælde
   - Tests: 30 tests (113 linjer) — årsskifte, 53-ugers år, ugedag 1-7, Date-objekt, ugyldige input
   - UI: date-input, gradient-resultatboks, ugedag-navn i locale, årsskifte-advarsel, kort/53-ugers info
   - SEO-side: "Hvilken uge er det?" da + no + se (allLocalesSlugs), FAQ (4 items), CalculatorSchema + FAQSchema, Breadcrumbs, RelatedCalculators, Sidebar; dansk prose-sektion om ISO 8601, 53-ugers år, årsskifte
   - Ikon: CalendarDays (lucide) i icons.ts — matcher dato-relaterede beregnere
   - Registreret: calculator-list (Praktisk + relatedMap til dato/alder/nedtaelling/tidsberegner/termin), categories, page-data (da + allLocales), icons.ts
   - Backlinks tilføjet: /dato /alder /tidsberegner /nedtaelling får ugenummer i relatedMap
   - Fix: TypeScript `as 52 | 53` cast i antalUgerIIsoAar — .uge er number, ikke union (build-fejl opdaget ved gate)
   - Gate grøn: lint ok, 348/348 tests (40 filer), build ok (133 pages)
   - Commitsha: 5a37dda (merge: 5a37dda)

### 6. [x] FÆRDIG (iteration: 2026-08-24 05:45): Alkoholenheder-beregner (`/alkoholenheder`) — Sundhed, daOnly
   - Logik: enheder = volume_cl × abv_pct × 0.006575 (12g/enhed, 0.789 g/ml ethanol)
   - Tests: 10 tests — null på ugyldige inputs, 33cl/4.6%=1 enhed, 50cl/12%=3.9, 4cl/40%=1.05,
     total=pr.drink×antal, gram-alcohol=enheder×12, fractional antal
   - Research: borger.dk/sundhed.dk/cancer.dk alle 404 — definition 12g/enhed er veletableret
     (Sundhedsstyrelsen); note i koden + i prose-sektion
   - UI: select-dropdown med 10 typiske serveringer (øl/vin/shots), antal-drinks input,
     gradient-resultatboks (purple/indigo), enheder-visning + gram-visning, vejledende-markering
   - SEO-side: daOnly (dansk enhedsdefinition); FAQ (4 items), CalculatorSchema + FAQSchema,
     Breadcrumbs, RelatedCalculators, Sidebar, 5 interne links
   - Ikon: Beer (lucide) — allerede importeret i icons.ts
   - Registreret: calculator-list (Sundhed + relatedMap 5 veje + backlink fra /promille),
     categories, page-data (daOnly), icons.ts
   - Gate grøn: lint ok, 358/358 tests (+10 nye, 41 test-filer), build ok (134 pages)
   - Commitsha: 1bcbc1d

### 7. [x] FÆRDIG (iteration: 2026-08-24 06:05): Flyttebudget (`/flyttebudget`) — Hverdag
   - Checklist-budget flytteudgifter (flyttemand 8.000, transport 1.500, kasser 500,
     rengøring 2.500, istandsættelse 10.000, mægler 25.000, tinglysning 3.000,
     advokat 10.000, depositum 30.000, opbevaring 2.000, møbler 15.000, forsikring 1.000,
     andre 0 kr); gradient resultat (yellow/amber); udgiftsfordeling progress bars
   - Registreret: calculator-list (Hverdag, allLocales), categories, page-data (allLocales),
     icons.ts (Truck), backlinks via relatedMap: husleje/budget/boliglaan/boligstoette/kvadratmeter
   - SEO: "flyttebudget beregner", "hvad koster en flytning"; FAQ 4 items;
     CalculatorSchema + FAQSchema, Breadcrumbs, RelatedCalculators, Sidebar
   - Ikon: Truck (lucide)
   - Gate grøn: lint ok, 358/358 tests, build ok (135 pages)
   - Commitsha: c0d44b4

### 8. [x] FÆRDIG (iteration: 2026-08-24 06:27): Boligsalgsberegner (`/boligsalg`) — Bolig, daOnly
   - Logik: salgspris − mæglerhonorar (% eller fast) − markedsføring − energimærke − tilstandsrapport − el-rapport − ejerskifteforsikring − istandsættelse − flytning − advokat − indfrielsesgebyrer − evt. tinglysning af ny bolig = nettoprovenu
   - Research: Boligejer.dk (Erhvervsstyrelsen) for tinglysning/energimærke; markedsbaserede estimater for mægler/istandsættelse/flytning markeret som vejledende
   - Tests: 14 tests — null/negativ/NaN, 4% mægler, fast fee, tinglysning, "andre", fordeling, høj/lav salgspris
   - UI: gradient resultat (emerald/green), radio-knapper for mægler procent/fast, checkbox for tinglysning, progress bars
   - Ikon: DollarSign (lucide)
   - Registreret: calculator-list (daOnly + relatedMap: boliglaan/ejendomsvaerdiskat/andelsbolig/kvadratmeter/flyttebudget + backlinks fra 4 bolig-sider), categories (Bolig), page-data (daOnly), icons.ts
   - SEO: "boligsalg beregner", "salgsprovenu beregner", "omkostninger ved salg af bolig"; FAQ 4 items; CalculatorSchema + FAQSchema, Breadcrumbs, RelatedCalculators, Sidebar
   - Gate grøn: lint ok, 372/372 tests (42 filer), build ok (136 pages)
   - Commitsha: 00dbf4b

### 9. [x] FÆRDIG (iteration: 2026-08-24 06:35): Vedligehold: verificér SATSER_2026 mod officielle kilder
   - Webfetch mod skat.dk/skm.dk: begge JS-renderede (Next.js/Umbraco), satser loades via intern API — ikke tilgængelig via scraping
   - Webfetch mod svmn.dk (SKM's statistikportal): kommuneskat-gennemsnit 2026 = 25,049 % (var 25,07 %), kirkeskat = 0,639 % (var 0,68 %)
   - Opdateret SATSER_2026.kommuneskatSnit: 0,2507 → 0,25049; kirkeskatSnit: 0,0068 → 0,00639
   - Test fix: befordringsfradrag.test.ts hardcodede 0,2507 → nu importerer SATSER_2026.kommuneskatSnit
   - Gate grøn: lint ok, 372/372 tests (42 filer), build ok (136 pages)
   - Status: delvist verificeret — statslige satser (bundskat/mellemskat/topskat/personfradrag/beskæftigelsesfradrag) er vedtaget i personskattereform 2026 men ikke bekræftet via webfetch (kraever manuel tjek på skm.dk). Noteret som "verifikation: delvis (2026-08-24)" i satser-filen.
   - Commitsha: 8f34a8a

## Beslutninger & noter
- Iteration 1: research-iteration (ingen kodeændringer). Baseline verificeret:
  279/279 tests grønne, lint ok, build ok.
- Gate-definition noteret øverst (lint + test + build).
- Deploy: batch-deployer ~07:30/12:30/17:30. Efter hvert merge: VERIFICÉR-note herunder.
- Emoji-udskiftning: ALLE 8 etaper færdige. Alle UI-emojis fjernet (650+ forekomster i 45 filer
  skiftet til lucide-react SVG-ikoner). Kun prosa-emojis (lav prioritet) og dødt data
  (countryFlag i domain-config) resterer.
- Fix: src/app/boernepenge/page.tsx manglede `import Link from "next/link"` — byggefejl opdaget
  under kvalitetsgate for rabatberegner (pre-existing bug, rettet sammen med rabat-iterationen).
- Sikkerhed (2026-08-24 02:46): npm audit fix kørt — 7 non-breaking patches (esbuild, nanoid,
  picomatch, undici, vite, vitest, yaml). 3 høj-alvorlige vuln kræver Next.js 16.3.2 (major) —
  håndteres separat. Commit 57ec92f.

## Blog — næste indlæg

### 3. [x] FÆRDIG (iteration: 2026-08-23 23:58): Månedsbudget 2026 — Komplet guide til privatøkonomi (`/blog/maanedsbudget-2026-komplet-guide`)
   - Topic: komplet guide til at lave et månedsbudget — faste/variable udgifter, 50/30/20-reglen,
     tommelfingerregler for bolig/transport/opsparing, gældsafbetaling, danske 2026-tal
   - Calculators linked: /budget, /sparemaal, /huslejeberegner, /loen-efter-skat, /opsparing, /pension
   - Backlinks added: /budget, /husleje, /opsparing pages
   - Registreret i blog/page.tsx, sitemap.ts
   - Gate grøn: lint ok, 280/280 tests, build ok (127 pages). Commitsha: a2ca835

### 1. [x] FÆRDIG: Biløkonomi 2026 — Hvad koster det at eje bil? (`/blog/biloekonomi-2026`)
   - Topic: samlet guide til biløkonomi (ejeromkostninger: afgifter, forsikring, brændstof/el,
     værditab, finansiering) med danske 2026-tal
   - Calculators linked: /bil, /braendstof, /billaan, /leasing, /elbil, /laaneberegner, /budget, /loen-efter-skat
   - Cross-links til: spar-penge-paa-braendstof, elpriser-2026, boliglaan-2026
   - Registreret i blog/page.tsx, sitemap.ts
   - Research: FDM/skat.dk-sider blokerede (404), brugt generelle danske 2026-estimater noteret "vejledende"
   - Gate grøn: lint ok, 280/280 tests, build ok (125 pages). Commitsha: 4966fab

### 2. [x] FÆRDIG (iteration: 2026-08-23 23:37): Leasing af bil 2026 (`/blog/leasing-af-bil-2026-pris-og-guide`)
    - Topic: "Leasing af bil 2026: Pris, fordele, ulemper og guide" — komplet guide til privatleasing vs. erhvervsleasing, typiske priser pr. bilklasse, leasing vs. billån, elbil-leasing, faldgruber; danske 2026-tal
    - Calculators linked: /leasing, /billaan, /bil, /braendstof, /elbil, /laaneberegner
    - Cross-links til: biloekonomi-2026, spar-penge-paa-braendstof, elpriser-2026, guide-til-laan-og-renter
    - Registreret i blog/page.tsx, sitemap.ts
    - Research: FDM blokeret (404); brugt generelle danske leasingpriser noteret "vejledende"
    - Gate grøn: lint ok, 280/280 tests, build ok (126 pages). Commitsha: 1c8a9a6

### 4. [x] FÆRDIG (iteration: 2026-08-24): Børnepenge 2026 — Satser, regler og udbetaling (`/blog/boernepenge-2026-satser-og-regler`)
    - Topic: komplet guide til børne- og ungeydelse 2026 — satser 0-2/3-6/7-14/15-17 år, aftrapning ved høj indkomst, deling mellem forældre, ekstra tilskud til enlige forsørgere; officielle borger.dk-satser
    - Calculators linked: /boernepenge, /barselsdagpenge, /boligstoette, /budget, /su, /loen-efter-skat
    - Cross-links til: barsel-2026, boligstoette-2026, fradrag-2026, skat-2026
    - Registreret i blog/page.tsx, sitemap.ts
    - Backlink added: /boernepenge page linker til blog
    - Cleanup: 3 tidligere blog-indlæg og dette nye tilføjet til footer-data.ts "Seneste artikler"
    - Gate grøn: lint ok, 280/280 tests, build ok (128 pages).

## VERIFICÉR DEPLOY-log
- DEPLOY OK: billaan-ikoner (etape 6), calculator-list-ikoner (etape 3), footer-ikoner (etape 4) — verificeret 2026-08-23 18:20.
- **Batch 07:30 24. aug.** forventes at inkludere: etape 5 (komponent-ikoner), etape 8 (opengraph), biloekonomi, leasing, maanedsbudget, boernepenge blog, rygestop, rabat, proteinbehov, ugenummer, befordringsfradrag, alkoholenheder, flyttebudget, boligsalg, satser-opdatering.
  → Verificér efter 07:30-batch: /alkoholenheder, /flyttebudget, /boligsalg, /rygestop, /ugenummer
