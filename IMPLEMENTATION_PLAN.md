# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: AKTIV

## Prioriteter (opdateret pr. missions-brev 2026-08-22)
1. **Emojis ud → lucide-react ikoner ind** (ca. 666 forekomster i 45 filer) — i etaper, grøn gate mellem hver
2. Flere blogindlæg (20 findes; ét ad gangen med ægte substans + kilder + interne links)
3. Flere beregnere (backlog nedenfor) + løbende korrekthed (2026-satser), UX, CWV

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint    # biome lint ./src
npm run test    # vitest run (baseline: 314 tests / 37 filer — SKAL alle bestå)
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
  → DEPLOY OK 2026-08-23 18:20: /moms viser CalcIcon-lucide-SVG'er i sidebar/related
  (percent/landmark/banknote m.fl.), ingen emoji-ikoner.
- VERIFICÉR DEPLOY: footer-ikoner (etape 4) 9e50974 13:32
  → DEPLOY OK 2026-08-23 18:20: /kategori/oekonomi footer = 0 🧮📅🔒;
  lucide-calculator ×3, calendar-days ×2, shield-check ×2 til stede.
- VERIFICÉR DEPLOY: billaan-ikoner (etape 6) e6d009a 13:45
  → DEPLOY OK 2026-08-23 18:20: /billaan = 0 ✅/❌; circle-check ×16, circle-x ×12.
- VERIFICÉR DEPLOY: komponent-ikoner etape 5 bd832b2 18:40
  → PT: commit efter 17:30-batch (18:20), næste vindue 07:30 24. aug.
     PlanetVaegt (☿️♀️🌙♂️🪐🔵🌑☀️) bekræfter endnu ikke live.
- VERIFICÉR DEPLOY: opengraph-image etape 8 6429336 18:45
  → PT: commit efter 17:30-batch, næste vindue 07:30 24. aug.
- VERIFICÉR DEPLOY: biloekonomi blog post 4966fab 23:00
  → PT: commit efter 17:30-batch, næste vindue 07:30 24. aug.
- VERIFICÉR DEPLOY: leasing blog post 1c8a9a6 23:37
  → PT: commit efter 17:30-batch, næste vindue 07:30 24. aug.
- VERIFICÉR DEPLOY: månedsbudget blog post a2ca835 23:58
  → PT: commit efter 17:30-batch, næste vindue 07:30 24. aug.
- VERIFICÉR DEPLOY: børnepenge blog post + footer-data cleanup (3 tidl. blog-posts tilføjet)
  → PT: commit før 07:30-batch 24. aug.
- VERIFICÉR DEPLOY: rabatberegner + boernepenge Link-fix e5b21ae 01:50
  → PT: commit efter 07:30-batch, næste vindue 12:30 24. aug.
- VERIFICÉR DEPLOY: befordringsfradrag-beregner + satser-opdatering + FAQ-fix c57af43/bdaf555 02:13
  → PT: commit efter 12:30-batch, næste vindue 17:30 24. aug.
- VERIFICÉR DEPLOY: proteinbehov-beregner + npm-audit-fix 4bc9f44 02:56
  → PT: commit efter 07:30-batch, næste vindue 12:30 24. aug.
