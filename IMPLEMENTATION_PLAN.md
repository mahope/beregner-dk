STATUS: 2/10 23:31. CI grøn ved start (`37061387270`). PR-TJEK 2/10 19:47: ingen
    åbne PR'er (næste tjek 4/10). Sentry: ingen uløste fejl 14 dage — et rigtigt
    signal, SDK'en er sat op med fallback-DSN, kun i produktion, intet replay.
    **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` ·
    `npm run build` — grøn 2/10 23:29 (**3856** tests i 238 filer), plus
    `locale-leak --gate` (exit 0).
    **Denne iteration: `/kalorier` henter sit eksempel fra modulet.** 17 fund
    væk fra `page-data.ts` (**131 → 114**). Syv af dem var svenske strenge med
    dansk tusindtalsseparator — «BMR 1.780 kcal», «TDEE 2.759 kcal», «2 259»,
    «7.700 kcal» — i `description`, `metaDescription` og to FAQ-svar, altså
    præcis de tal Google citerer på beraknare.se (2.825 visninger). Ny
    `src/lib/kalorier-eksempler.ts` bygger alle 19 svar i alle tre sprog fra
    `beregnBmr`/`beregnTdee`/`kalorierForMaal` + `KALORIE_UNDERSKUD` +
    `PROTEIN_G_PER_KG` + `VAEGTTAB_KCAL_PR_KG`. Dansk er byte-uændret (`toEqual`
    mod de syv gamle strenge). **Porten låste fejlen fast:** `page-data.test.ts`
    og `kalorier/page.test.tsx` krævede «1.780»/«2.502» på *alle* sprog;
    begge dømmer nu `formatBelob` og forbyder `\d\.\d{3}` for se/no.
    **MÅL:** `beraknare.se/kalorier` 2.825 GSC-visninger / 7 klik / 0,2 % /
    pos. 15,4 → 0 visninger med dansk separator; `minberegner.dk/kalorier`
    11.827 visninger, 276 besøgende/28d, ingen tal ændret.
    **Næste iteration:** (1) de to små tekstfejl nederst i ❓ («Første maj» →
    «Första maj», «använna» → «använda»), (2) `/moms`-slaget er ⛔ (lovgrænser),
    så næste frie slug er `/pension` (12 fund). De syv VERIFICÉR-noter er ikke
    due før vinduet 3/10 07:30.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` | under top-15 | 150.470 | 0,1 % | 7,4 |
| `/dato` | 1.133 | 133.054 | 0,6 % | 5,7 |
| `/tidsberegner` | 290 | 73.666 | 0,3 % | 6,9 |
| `/tidszone` | under top-15 | 24.324 | 0,4 % | 7,5 |
| `/moms` | under top-15 | 22.464 | 0,2 % | 7,0 |
| `/kvadratmeter` | 390 | 21.344 | 1,4 % | 4,9 |
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/` (forside) | 218, bounce 38 % | under top-15 | — | — |
| `/dage-til` + se `/dagar-till` | **0 — nye URL'er 2/10** (hubben) | — | — | — |
| se `/dato` | 133 | 101.580 | 0,1 % | 8,2 |
| se `/tidsberegner` | 167 | 61.934 | 0,2 % | 8,0 |
| se `/procent` | under top-15 | 26.933 | 0,0 % | 9,9 |

Site: minberegner.dk 7.421 besøgende/28d (+42 %), ~600.000 GSC-visninger pr.
måned. Kilder: Google 4.170, Bing 1.319, DDG 378, Yahoo 274 — **1.971 af 7.319
(27 %) kommer fra søgemaskiner der ikke er Google.**

### Den faktiske flaskehals

CTR følger **ikke** position. `/boligstoette` har 2,4 % CTR på pos. 8,7 mod
`/procent`s 0,1 % på pos. 7,4 — 24x forskel på næsten samme placering. Vi ligger
på position 5-8 på 600.000 visninger, og der er ingen titel-, beskrivelse- eller
intern-link-fejl tilbage at rette på de eksisterende sider: kun **positionen**
er lav, og den afgøres af den danske konkurrence i hvert enkelt ord.

**Den største *målbare* afstand:** beraknare.se har **190.447 visninger**
(`/dato` 101.580 + `/tidsberegner` 61.934 + `/procent` 26.933) og **229 klik** —
0,12 % CTR. Svensk indholdsdybde er målt til at være lig med den danske
(`/dato` 1.617 mod 1.723 ord), så det er opgave 187's slugs og domæneautoritet.

### Prioriterede opgaver

**F1. [ ] Søgeniveau-data for `/procent`** — 150.470 visninger, 0,1 %, pos 7,4.
GSC's tre søgninger summerer 364 visninger af 150.470. **Accept:** GSC-eksport
for `/procent` (eller de 20 største søgninger site-wide) ligger i planen. **❓.**

**F2 + F2b. [x] ✅** rabat-spørgsmål + svensk rabatt-FAQ — `docs/plan-arkiv.md`.
**MÅL:** `/procent` 150.470 / 97 / 0,1 % / 7,4 (da), 26.933 / 2 / 0,0 % / 9,9 (se).

**F3. [ ] Beraknare.se: position, ikke titel.** 190.447 visninger på pos. 8-10.
Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes før de
svenske titelændringer fra C195/C196 er målt. **Accept:** se opgave 187.

**F4. [x] ✅** dobbelerede stribe væk — `docs/plan-arkiv.md`. **MÅL:** `/` 218
besøgende/28d, bounce 38 % → mod 2-7 %.

**F5. [~]** IndexNow er kodet (`src/lib/indexnow.ts`), og krogen efter deploy
findes: `src/instrumentation.ts` `register()` kalder `submitDeploymentIndexNow()`
ved serverstart. Nøglefilen lå på `/api/indexnow-key/…` og er rettet 2/10
(`ceo/indexnow-noeglefil`). **Mangler:** `INDEXNOW_ENABLED=true` og
`INDEXNOW_API_KEY` i Dokploys env (❓) — uden dem logger hver boot
`[indexnow] … skipped (disabled)`.

**F6. [x] ✅** norske tal uden dansk separator. **F7. [x] ✅** tidsforskellens
dage læst fra `afvigendeDage()`. **F8. [x] ✅** svenske helgdagslove kildeført.

**F9. [ ] `locale === "se" ? "se" : "da"` — 13 steder med dansk på
norske domæner.** *Hvad:* mønstret er målt med grep efter `ceo/norsk-pace-side`
(2/10): 18 træffere i 15 filer, hvoraf **13 er bruger-synlige** —
`dato/page.tsx` (3), `tidsberegner/page.tsx`, `alder/page.tsx`,
`opsparing/page.tsx`, `bil/page.tsx` og `DatoBeregner`, `MomsBeregner`,
`EnhederBeregner`, `PlanetVaegtBeregner` (+ `lokal-dato.ts`,
`bil-omkostninger.ts`). Det er præcis fejlen i review-fundet: norsk/brødtekst
over danske labels. *Hvorfor:* `/dato` (1.135 besøgende/28d) og
`/tidsberegner` (291) er sitets to største sider, så en halv oversættelse
af dem er dyrere end slet ingen. *Accept:* hvert sted får en rigtig `no`-gren
eller en `Record<Locale, …>`, og en port (samme som `DANSKE_ORD`-listen i
`PaceBeregner.test.tsx`) dømmer `da`/`no`/`se` hver for sig. ⛔ ❓ nedenfor:
`beregner.no` serverer et andet site, så rettelsen har 0 bruger-effekt indtil
den er besvaret — og norsk trafik er 0 i Plausible.

## Feature-kø

Fire kandidater, i rækkefølge efter hvor ren intentionen er. Alt med ⛔
er blokeret af en ❓ og må ikke gættes.

- **[x] ✅ Ironman-total i `/pace`** — tre tidsfelter → samlet tid + tempo pr. ben,
  bygget på `beregnTriatlon`, da+se+no (`3720dea`). MÅL: `/pace` 2 af 10
  danske completioner under «tid beregner» (27k visninger, pos. 5) konverterer
  nu til et værktøj. Måles ved næste Plausible-snapshot.
- **[x] ✅ `/leasing` sammenligner på det rigtige tal** — `leasing-restvaerdi-`
  sammenlign` 2/10. Se `docs/plan-arkiv.md`. MÅL: `beraknare.se/leasing`
  2.923 visninger / 33 klik / 1,1 % / pos. 12,2 → mod 14 dage; de fire
  søgninger «fåretagsleasing bil kalkyl» (169v), «beräkna leasing bil företag»
  (160v), «leasing kalkylator» (112v) og «leasingkostnad bil» (109v) ligger på
  pos. 9-15, og svaret på «blir leasing billigere eller dyrere» lå før uden
  ét tal.
- **[x] ✅ `/dage-til`-hub** — se `docs/plan-arkiv.md`. *Hvem:* alle 23 danske og
  20 svenske countdown-sider var kun linket fra `/dato` og `/nedtaelling`, og
  sektionen havde ingen side af sin egen. *Accept:* `/dage-til` + `/dagar-till`
  lister hver dato med dagens tal, sorteret efter hvad der kommer først, med
  canonical/hreflang, daglig sitemap-entry og 301 mellem domænerne.
  **MÅL:** `/dage-til` 0 (ny URL 2/10) → Plausible 16/10; GSC 14 dage:
  «hvor mange dage er der til 1. december» (1.254v, pos. 5) og «… til den 24.
  december» (1.025v, pos. 5).
- **[x] ✅ `/klokken-i`-hub** — se `docs/plan-arkiv.md`. *Hvem:* de 12
  landesider var kun linket fra `/tidszone` og bloggen, så «hvad er klokken i
  de forskellige tidszoner» (89v, pos. 5) havde intet sted at lande.
  *Accept:* `/klokken-i` + `/klockan-i` lister hvert land med klokken lige nu
  og tidsforskellen, sorteret efter hvor tæt landet ligger på dansk/svensk tid,
  med canonical/hreflang, daglig sitemap-entry og 301 mellem domænerne.
  **MÅL:** `/klokken-i` 0 (ny URL 2/10) → Plausible 16/10; GSC: «hvad er
  klokken i usa når den er 12 i danmark» (178v) og «hvad er klokken i de
  forskellige tidszoner» (89v), begge på pos. 5-6.
- **Feriesider: vinterferie og påskeferie** — *Hvem:* «skoleferie 2026» og
  «efterårsferien» (10. af 10 completioner under «hvor mange dage er der til»).
  *Accept:* to sider i `/dage-til` med samme mønster som efterårsferien.
  ⛔ Ferielovens startdato (❓ opgave 201) — må ikke gættes.
- **Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske autocomplete-
  træffere under «kalorier» er madvarer. ⛔ `sst.dk` svarer 429 (❓ opgave 119).
- **Svensk dækning af de manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Oppgave 187, 13/10 — må ikke flyttes.

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. ✅ betyder lukket; detaljerne står i `docs/plan-arkiv.md`.

**Lukket 2/10 23:29 — `kalorier-faq-tal-fra-modul`.** Se `docs/plan-arkiv.md`.
*Målt:* **17** fund væk fra `page-data.ts` (7 da, 3 no, 7 se), listen
**131 → 114**. `/kalorier` er sitets syvende mest besøgte side (276/28d) og
havde **samme synlige fejl som `/vaegttab`**: svenske strenge med «1.780» /
«2.759» / «2.259» / «7.700» i metadata **og** i to FAQ-svar, som
`FAQSchema` læser. Ny `kalorier-eksempler.ts` bygger 19 svar i tre sprog fra
`makroer.ts`' egne `beregnBmr`/`beregnTdee`/`kalorierForMaal` plus
`KALORIE_UNDERSKUD`, `PROTEIN_G_PER_KG` og `VAEGTTAB_KCAL_PR_KG` (genbrugt fra
`vaegttab-eksempler`, ikke kopieret). Proteinintervallerne læses fra
`PROTEIN_G_PER_KG`; «0,5 kg pr. uge» og «10-15 %» er deklareret i modulet med
begrundelse, for de er allerede rundede tal. Porten låste fejlen fast på to
steder og er rettet begge: `page-data.test.ts` krævede «1.780»/«2.259» med
dansk punktum for alle tre sprog, `kalorier/page.test.tsx` «2.502 kcal» og
«TDEE 2.759 kcal vid måttlig aktivitet» — de dømmer nu `formatBelob(…, locale)`
og forbyder `\d\.\d{3}` i hvert svensk og norsk felt. **12 nye tests**
(3856 mod 3844); dansk låst med `toEqual` mod de syv gamle strenge.

**Åben række (strenglisten):** næste fil skal måles på ny — de punkt der stod
åbne er alle ❓-blokerede. **Fem filer er lukket 2/10**, se listen nedenfor.
Strenglistens loft er **70 → 57**, JSX-listen **360 → 347 → 338 → 333**.

**Ny målt fejlklasse — `page-data.ts` ligger uden for begge beløbs-porte.**
`strengBelob`/`jsxBelob` måler kun `.tsx`, så de usourcede intervaller i
`/boligsalg`s `faqItems` blev **publiceret som JSON-LD** (`FAQSchema` læser
præcis `faqItems`). Det er den samme fejl som JSX-teksten, bare usynlig for
porten.

**Lukket 3/10 22:33 — `vaegttab-faq-fra-modul` (halve 2).** Se
`docs/plan-arkiv.md`. *Målt:* **21** håndskrevne talgrupper væk fra
`page-data.ts` (7 pr. sprog: 1.000, 7.700, 1.500, 1.200, 2.759, 1.780, 2.209),
så listen er **152 → 131**. Fundet ved deploy-målingen: `beraknare.se/vaegttab`
havde stadig 3 × «2.209» i synlig FAQ-tekst, i `FAQSchema`-JSON-LD **og** i
RSC-payloaden, fordi halve 1 kun flyttede metadata-felterne. Ny
`vaegttabFaqItems(locale)` bygger alle fem svar i alle tre sprog fra
`vaegttabEksempelTal()` + `VAEGTTAB_KCAL_PR_KG` + `KALORIE_UNDERSKUD` +
`AKTIVITETS_FAKTORER`; de to nye konstanter `VAEGTTAB_MIN_MAEND`/`_KVINDER` er
flyttet fra brødteksten, ikke opdigtet. **Porten låste fejlen fast:**
`page-data.test.ts` krævede «2.759»/«2.209» med dansk punktum for *alle tre*
sprog; den dømmer nu `formatBelob(…, locale)` og forbyder `\d\.\d{3}` i hvert
svar for `se`/`no`. Mutation: regexen rammer **4 af 4** gamle svenske svar, så
prøven er rød mod den gamle kode. Dansk byte-uændret (`toEqual` mod de fem
gamle strenge). `/vaegttab` se: 1.277 visninger.

**Åben: beløbs-porten scanner kun `*.tsx`.** *Accept:* `strengBelob` kører på
`src/lib/*.ts` også, og listen opdateres i samme commit.

**Seks filer er lukket:** SU (`su-indlaeg-belob-fra-modul`), arveafgift
(`arveafgift-belob-fra-modul`), `/boligsalg` (`boligsalg-belob-fra-modul`),
`/procent` (`procent-faq-tal-fra-modul`), `/renteberegner`
(`renteberegner-belob-fra-modul`) og `/procent`s procentpoint-svar
(`procentpoint-faq-tal-fra-modul`) — alle i `docs/plan-arkiv.md`.

**Målt 2/10 18:35 (egen AST-probe, samme mønster som portens `strengBelob`):
alle fund lå i `page-data.ts` alene** — ikke fordelt i `src/lib/*.ts` som
portens docblock siger. Efter `/renteberegner` var de **176** (var 195 ved
iterationens start); efter `/vaegttab` halve 2 er de **131** målt 3/10 22:33.
Køen pr. slug nu: `kalorier` 17 · `moms` 15 · `pension` 12 · `leasing` 9 ·
`rentefradrag` 7 · `kvadratmeter` 6 · `konfirmation` 6 · `efterloen` 5 ·
`aktieskat` 5 · `loen-efter-skatt` 4 · `topskat` 4 · `boernepenge` 4 · resten ≤3.
**Anbefalet rækkefølge:** `/kalorier` (17, se 2.825) → `/moms` (men ⛔ de 3
lovgrænser) → `/pension` (12) → `/leasing` (se 2.923) →
`/kvadratmeter` (6, se 3.705).
*Accept pr. slice:* ét slug pr. opgave, 12 fund eller færre, de læses fra sit
eget modul, og en mutation i porten. `/vaegttab` blev delt i to halvdele
(12 + 12), fordi den er 24 fund. **Hvis porten udvides til `.ts` med det samme,
bliver listen 152 lang og de 152 tal bliver en tilladelsesliste** — det er
måske nok det, men en tilladelsesliste over fejl er dyrere end porten er bred.
Derfor: fix slugs først, portudvidelsen som sidste skridt når de er nede mod 0.

**Åben:** `/moms` har 3 fund tilbage, som er lovgrænser (dansk registrering over
50.000 kr, svensk over 120.000 kr, told ved import over 1.150 kr). ❓ nedenfor.

**Delvis lukket 2/10 20:53 — `pension-dobbelt-valuta`.** Se
`docs/plan-arkiv.md`. *Målt:* «8.729 kr. kr.» er væk fra den rene HTML på
`minberegner.dk/pension`. **De fire øvrige påstande i den gamle note var
forkerte:** `GaeldsfriBeregner`, `BruttoNettoBeregner`, `TopskatBeregner` og
`AktieskatBeregner` bruger `toLocaleString` (ingen valutaenhed) og har aldrig
skrevet dobbelt enhed. `formatNumber` + `getCurrencySuffix` er rigtigere for
de to, men det er en anden opgave.

**Lukket 2/10 20:57 — `leasing-dobbelt-valuta`.** *Målt:* alle **20**
`formatKr(…)} kr.` i `LeasingBeregner` er væk, så hele resultatblokken for
leasing, billån og kontant koster «4.121 kr.», «178.350 kr.», «28.350 kr.» —
og på beraknare.se «4 121 kr» (én enhed, Intls «kr» for sv-SE). Ny
`LeasingBeregner.test.tsx` (3 tests) dømmer den **rendrede** side i begge
sprog og låser månedsydelsen til `beregnLeasingSammenlign`-værdien med én enhed.
Mutation: « kr.» tilbage i alle 20 kald giver **2 røde** af 3.
`/leasing` se: 2.923 visninger / 33 klik / 1,1 % / pos. 12,2.

**Lukket 2/10 21:01 — `su-dobbelt-valuta` (sidste i klassen).** Alle **7**
`formatKr(…)} kr.` i `SUBeregner` er væk, så «Inkl. 3.799 kr. forældrelån» og
de fire grænsetal i brødteksten har én enhed. Den nye test dømmer den
**rendrede** side (ingen «kr. kr.») **og** læser kilden, så de sætninger der
kun vises i legacy- og ungdomsordningen heller ikke kan få den dobbelte enhed
tilbage. Mutation: « kr.» tilbage i alle 7 kald → **1 rød** af 15.
**Hele dobbelt-enheds-fejlen er nu lukket** i de tre komponenter der havde den
(3 målt, ikke 7 som den gamle note sagde).

⚠️ **Flake målt 2/10 21:00:** én fuld kørsel gav «1 failed | 3806 passed» uden
at loggen fangede filnavnet; de to næste fulde kørsler er grønne (3807/3807).
Hvis den dukker op igen, er det ikke denne opgave — ingen af de tre berørte
filer blev ændret i den kørsel.

**Åben: norske tusindtalsseparatorer.** `/renteberegner` skriver nu «1 887»
med mellemrum, mens resten af `noPages` skriver «2.500» med punktum («BMR
1.780 kcal» på `/kalorier»). Mellemrum er den rigtige bokmålsskrivemåde, så
fejlen er den anden slags. *Accept:* hele `noPages`-blokken går gennem
`formatBelob(…, "no", …)`, så der kun er én skrivemåde. ⛔ Lav prioritet:
`beregner.no` serverer et andet site (❓ nedenfor), så brugerpåvirkningen er
0 indtil den er besvaret.

**Åben:** `/timepris` mangler **norsk brødtekst** (kun `da` og `se` har et
afsnit) — ❓ kilde til norske timepriser låser både brødteksten og tabellen.

**Åben:** blogindlæg generelt (19 filer, 273 fund). Redaktionelle beløb i et
indlæg er ikke samme fejlklasse som et beløb på en beregnerside. Beslut først,
om de skal med; ellers skal de stå i portens undtagelsesliste som *blog*.

## Åbne VERIFICÉR DEPLOY-noter

Batch-deployeren kører 07:30/12:30/17:30/21:30. Prøverne er på **indhold**,
aldrig på HTTP 200: en 200 beviser at svaret serveres, ikke at det er den nye
kode. Hver note er én linje; den fulde kommando står i `docs/plan-arkiv.md` under
sit slug. Strip `<!-- -->`-kommentarmarkørerne fra HTML'en, ellers matcher
ingen regex på tal og tekst.

`VERIFICÉR DEPLOY: /klokken-i + /klockan-i (hub med klokken i 12 lande) ceo/klokken-i-hub 2/10 22:30`

`VERIFICÉR DEPLOY: /dage-til + /dagar-till (hub med alle datoer) ceo/dage-til-hub 2/10 21:30`

`VERIFICÉR DEPLOY: /vaegttab FAQ tal fra modulet (svensk 2 209, ikke 2.209) ceo/vaegttab-faq-fra-modul 3/10 22:33`

`VERIFICÉR DEPLOY: /kalorier eksempel fra modulet (svensk 1 780, ikke 1.780) ceo/kalorier-faq-tal-fra-modul 2/10 23:31`

`VERIFICÉR DEPLOY: /leasing FAQ'ens retning + kr.. i dansk ceo/leasing-faq-retning 2/10 19:55`

| Slug | Prøv på indhold |
|---|---|
| `vaegttab-faq-fra-modul` (**ny**, vindue 3/10 21:30) | `beraknare.se/vaegttab`: **0** `2\.209` i hele HTML'en — synlig FAQ-tekst, `FAQSchema`-JSON-LD og RSC-payloaden skal alle skrive «2 209», «1 780», «2 759», «7 700», «1 000», «1 500», «1 200» med **mellemrum**. FAQ'en skal stadig have **fem** spørgsmål, hvor «Hur många kalorier ska jag äta för att gå ner 6 kg på 12 veckor?» svarer «… förbrukar **2 759** kcal per dag (BMR **1 780** kcal × aktivitetsfaktor **1,55**) … så du behöver äta **2 209** kcal per dag.». `minberegner.dk/vaegttab`: FAQ'en skal have de **samme fem** spørgsmål **byte-uændret** med dansk punktum («2.759», «1.780», «550 kcal», «2.209»), og `0` `2 209`. **Intet** `NaN`. |
| `kalorier-faq-tal-fra-modul` (**ny**, vindue 3/10 07:30) | `beraknare.se/kalorier`: hele HTML'en skal have **0** `\d\.\d{3}` på tal — altså **intet** «1.780» / «2.759» / «2.259» / «7.700». `<meta name="description">` skal være «Hur många kalorier behöver du per dag? Man, 80 kg, 180 cm och 30 år: BMR **1 780** kcal och TDEE **2 759** kcal vid måttlig aktivitet.», `metaDescription` «… BMR **1 780** kcal, TDEE **2 759** kcal. Beräkna BMR, TDEE och makrofördelning.», `metaTitle`/`ogTitle` uændret «Kalorikalkylator: man 80 kg, 180 cm = **2 759** kcal/dag». FAQ'en skal have de **otte** svenske spørgsmål, hvor «Hur många kalorier behöver jag?» svarer «… dagligt behov på **2 759** kcal. En kvinna med samma mått har **2 502** kcal.» og «Hur många kalorier behöver jag för att gå ner 1 kg?» svarer «… cirka **7 700** kcal per kilo fatt … underskott på **7 700** kcal …». Brødteksten skal have «2 259 kcal» og «2 759 kcal» i tabellerne (allerede sådan). **Intet** `NaN`. `minberegner.dk/kalorier`: FAQ'en skal have de **syv** danske spørgsmål **byte-uændret** med dansk punktum («1.780», «2.759», «2.259», «7.700»), og `0` `1 780`. |
| `leasing-faq-retning` (**ny**, vindue 3/10 07:30 — måles på ny, den forrige note forventede den modsatte retning) | Som skrevet. Bemærk: **6** spørgsmål i live, ikke 7 som noten siger — `FAQPage`-JSON-LD'en er målt til 6. |
| `dage-til-hub` (**ny**, vindue 3/10 07:30) | Som skrevet. |
| `klokken-i-hub` (**ny**, vindue 3/10 07:30**) | `minberegner.dk/klokken-i`: `<title>` skal være «Hvad er klokken i …? Klokken i 12 lande lige nu», `<meta name="description">` skal starte med «Det er HH:MM i <første land på siden>» og slutte med «Se klokken i alle 12 lande og tidsforskellen til Danmark.». `<h1>` «Hvad er klokken i …?» **én** gang. Siden skal have **12** links til `/klokken-i/*` plus ét til `/tidszone`. Rækkerne er sorteret på \|minutter\|, så rækkefølgen skifter med sommer-/vintertid: **første** række skal være det land der ligger tættest på Danmark (0 eller 60 minutter) og **sidste** det fjerneste (Australien/New York, 8-9 timer) — mål det på de to yderste, ikke på hele rækkefølgen. `beraknare.se/klockan-i`: samme **12** links med svenske slugs (`/klockan-i/spanien` …) og **intet** dansk: hverken «Tyrkiet» eller bogstaverne æ/ø. `minberegner.dk/klockan-i` skal **301** til `/klokken-i`, og `beraknare.se/klokken-i` 301 til `/klockan-i`. Sitemap på begge domæner skal have `…/klokken-i` og `…/klockan-i` som `daily`. `minberegner.dk/tidszone` skal have teksten «klokken i tolv lande» med link til hubben, `beraknare.se/tidszone` «klockan i tolv länder». **Intet** `NaN` |
| `su-dobbelt-valuta` (**ny**, vindue 3/10 07:30**) | `minberegner.dk/su`: hele HTML'en skal have **0** `kr. kr.` og **0** `kr kr`. Brødteksten skal have «Inkl. **3.799** kr. forældrelån», «… ligger mellem **7.426** kr. og **20.749** kr. pr. måned», «Det separate forsørgertillæg er **1.114** kr. pr. måned før skat» og «… ungdomsuddannelse er 18-19-åriges grundsats **6.043** kr., mens den faste sats fra 20 år er **6.043** kr.». `beraknare.se/su` (dansk fallback): samme tal, 0 dobbelt enheder. `Intet** `NaN` |
| `leasing-dobbelt-valuta` (**ny**, vindue 3/10 07:30**) | `minberegner.dk/leasing`: hele HTML'en skal have **0** `kr. kr.` og **0** `kr kr`. Resultatblokken skal have «**4.121** kr.», «**178.350** kr.», «**28.350** kr.», «**150.000** kr.» (værdi på biler), «**169.140** kr.» (billån i alt), «**9.210** kr.» (forskel) og «**30.000** kr.» pr. måned med `/mån` på de to månedstal. `beraknare.se/leasing`: de samme tal med **mellemrum** («4 121 kr») og **én** enhed, 0 dobbelt. `Intet** `NaN` |
| `pension-dobbelt-valuta` (**ny**, vindue 3/10 07:30**) | `minberegner.dk/pension`: sætningen under resultatlisten skal være «Du har ikke opgivet andre indkomster, så du får det fulde pensionstillæg på **8.729 kr.**» — og **hele HTML'en skal have 0** `kr. kr.` og **0** `kr kr`. Rækkerne skal stadig være «16.273 kr.», «7.544 kr.» og «8.729 kr.». `beraknare.se/pension`: samme sætning med **én** enhed («8.729 kr», Intl skriver «kr» for sv-SE) og 0 dobbelt enheder. |
| `leasing-svenske-tal-fra-modul` (**ny**, vindue 3/10 07:30**) | `beraknare.se/leasing`: `<title>` skal være «Leasingkalkylator: bil på **300 000** kr = **4 121** kr/mån» og `metaDescription` «Bil på **300 000** kr med **150 000** kr i restvärde, **4,5** % ränta, **30 000** kr i kontantinsats och **36** mån: **4 121** kr i leasingkostnad per månad.». `schemaDescription` skal have «**4 121** kr per månad över **36** månader». FAQ'en skal have **syv** spørgsmål, hvor «Vad kostar leasing av en bil på **300 000** kr?» svarer «… blir månadskostnaden **4 121** kr, vilket är **178 350** kr totalt inklusive **28 350** kr i ränta.», «Vad är värdetabet på en leasingbil?» svarer «… är det **150 000** kr. Det är det belopp du betalar …» (~~belöp~~ → **belopp**, svensk stavemåde) og «Vad är fåretagsleasing och vad kostar det?» svarer «… ger **4 121** kr i leasingkostnad per månad.». **Hele HTML'en skal have 0** `\d\.\d{3}` på beløb — altså **intet** «4.121» / «300.000» / «178.350» / «28.350». **Intet** `NaN`. `minberegner.dk/leasing`: uændret (dansk og norsk blok har ingen beløb) |
## ❓ Til Mads

- ❓ **Hvor deployes den norske udgave? (ny, 2/10 14:15, højst prioriteret.)**
  Målt i live: `beregner.no` serverer et **helt andet site** — norsk «100+ gratis
  norske kalkulatorer» med `/kalkulator/<slug>`-ruter og 115 URL'er i sin egen
  sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains` («not yet launched»). Al norsk tekst, også den norske
  dagpenge-linje fra `1174169`, er derfor usynlig for brugere. Skal `beregner.no`
  servere denne app, eller er den norske udgave ikke i drift?
- ❓ **Søgningseksport fra Search Console (30/9).** GSC's opsummering viser kun
  3-4 søgninger pr. side; for `/procent` (150.470 visninger, sitets største side)
  er de tre tilsammen **364 visninger**. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største søgninger
  for hele domænet, låser F1-F3.** GSC-data kan ikke hentes fra en agent.
- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201).**
  `/dage-til/summerferien` siger «sommerferien begynder altid den **sidste lørdag
  i juni**», og hævder det står i folkeskoleloven (2024). retsinformation.dk er en
  SPA (også på `.xml`), ministeriet/ferieinfo/ferieloven svarer transportfejl,
  `lovguiden.dk` 429. **Ét skærmbillede af bestemmelsen låser det** — er reglen
  «den lørdag i den kalenderuge, hvori 20. juni ligger», står siden 7 dage
  forkert i de fleste år. Koden er bevidst urørt.
- ❓ **Momslovgrænserne på `/moms`.** Dansk registrering «over 50.000 kr»,
  svensk «högst 120 000 kr per år» og «told ved import over 1.150 kr» (en
  EUR-grænse fra forordning 1186/2009, som ikke må stå som et fast dansk beløb).
  **Ét skærmbillede af ML § 48 og ét af den svenske grænse** låser de to første.
- ❓ **IndexNow mangler to env-værdier.** `INDEXNOW_ENABLED=true` og
  `INDEXNOW_API_KEY=<8-128 teg af A-Z, a-z, 0-9, - >` skal sættes i Dokploys
  miljøvariabler — nøglen må ikke i en commit. Uden dem returnerer modulet
  `skipped: disabled` ved hver boot.
- ❓ **Kilde til svenske og norske frilanstimepriser.** Ét skærmbillede af et
  markedstal for Danmark, Sverige og Norge låser `/timepris` pr. `Locale` og den
  manglende norske brødtekst.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)» og «Afgifter kommer (2026+)»; `skat.dk` svarer 500. Teksten
  siger nu kun hvad beregneren regner med, og tallet ligger i
  `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **To synlige tekstfejl, målt 2/10 (10 min, ingen kilde nødvendig).**
  1. `rendered-leak-scan` peger på **én** dansk rest på beraknare.se: `/dato`
     skriver «Første maj» i den svenske helligdagsliste (`helligdage.ts:54`,
     forhårslig, fundet 2/10). Svensk er «Första maj».
  2. `/nedtaelling` har «kan du **använna**» i den svenske blok (pre-existing
     stavemåde-fejl på en live svensk side; bemærket under diff-review 2/10).
  Begge er copy rettelser uden ny logik — én lille opgave, ikke to.
- ❓ **Fitnessfradrag, sommerhusudlejning, madvaretabel, grundskyld for Varde og
  Playwright.** Fem mindre kilder, alle noteret med detaljer i
  `docs/plan-arkiv.md` 2/10 14:20. Uden dem bygges intet, jf. punkt 11.