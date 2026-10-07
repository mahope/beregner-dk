STATUS: 7/10 13:1x. ✅ **`/areal` — arealet af cirkel, trekant, rektangel, kvadrat, trapez, parallelogram og rombe i m² og cm².** Datagrund: dansk autocomplete (hl=da, 7/10 12:5x) har **10 af 10** træffere under «areal af» (cirkel, trekant, firkant, trapez, rektangel, retvinklet trekant, parallelogram, cirkel med diameter) og **10 af 10** under «arealet af en»; `/kvadratmeter` (21.479 GSC-visninger, 1,5 % CTR) er beviset på at matematik-siderne konverterer, og `/rumfang` er den naturlige søster. Alle syv figurer, formlerne, eksempeltabellen og FAQ'en læser `areal.ts`, så ingen kopi kan glide fra formlen. Dansk og svensk. **MÅL: /areal baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 12:3x. ✅ **`/kirkeskat` — hvor meget betaler du i kirkeskat, og hvad sparer du ved at melde dig ud af folkekirken.** Datagrund: kirkeskat er en fast dansk søgning («kirkeskat», «kirkeskat 2026», «kirkeskat beregner», «melde ud af folkekirken»), og sitet havde ingen kirkeskat-beregner — kun en linje i `/brutto-netto`. Satsen pr. kommune læses fra `kommuner.ts` (98 kommuner, 0,42-1,10 % i 2026) og det vægtede snit fra `SATSER_2026.kirkeskatSnit`; eksempeltabel, FAQ og metadata læser samme modul, så ingen kopi kan glide fra satsen. Dansk-only, som `/gaveafgift`. **MÅL: /kirkeskat baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 12:3x. Review-fundet [HØJ] «`/dato` mangler `export const dynamic = \"force-dynamic\"`» er en **falsk positiv**: `/dato` kalder `getLocale()` → `headers()`, og `.next/prerender-manifest.json` (bygget på denne branch) har kun 3 statiske ruter — `/_global-error`, `/apple-icon`, `/icon.svg`; `/dato` er ikke iblandt. Ingen ændring.
STATUS: 7/10 15:4x. ✅ **Review-fund [MIDDEL] rettet: «10 m² gulv» → «2 m² gulv» på `/areal` og `/rumfang`** (da + se). Kassen 2 × 1 × 0,5 m har gulvet 2 × 1 = **2 m²**, ikke 10 m² (rumfanget 1 m³ var korrekt). Rettet i `areal/page.tsx:127-128`, `rumfang/page.tsx:116-117`, `page-data.ts:1130,1153,4065,4088` (FAQ) og testen `rumfang-side.test.tsx:146` låser nu «2 m²». Gate grøn: 4942 tests, 299 filer.
STATUS: 7/10 08:5x. ✅ **`/elbil-lading` — hvad koster det at lade en elbil fra A til B.** Datagrund: dansk autocomplete (hl=da, 7/10 08:4x) svarer «hvad koster det at lade en elbil», «… op hjemme» og «… på en tankstation» blandt 10 træffere; sitet havde `/elbil` (driftsbesparelse) og `/elberegner` (apparater), men ingen side der svarede på lade-prisen. Værktøjet regner kWh til opladning (batteri × interval), prisen for opladningen, pr. 100 km og pr. måned; elpris og forbrug læses fra `ELBIL_FORUDSETNINGER` (samme kilde som `/elbil`), så de to sider ikke kan glide fra hinanden. Dansk og svensk. **MÅL: /elbil-lading baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 04:3x. ✅ **`/tv-storrelse` — hvor mange cm er et N-tommers tv, og hvor bredt og højt er det.** Datagrund: dansk autocomplete (hl=da, 7/10 04:3x) har 10 af 10 træffere under «hvor mange cm er» (bl.a. «… 55 tommer tv», «… 65 tommer tv») og 10 af 10 under «tv størrelse» (bl.a. «tv størrelser i cm», «tv størrelse afstand»). Sitet havde tommer→cm i `/enheder`, men ingen side med et tv's mål og seerafstand. Værktøjet regner bredde og højde for 16:9/21:9/4:3 fra diagonalen og et seerafstandsinterval (vandret synsvinkel 30-40°); tabellen, FAQ'en og værktøjet læser alle `skaermstorrelse.ts`, så ingen kopi kan glide fra reglerne. **MÅL: /tv-storrelse baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 04:0x. ✅ **`/laanekapacitet` — hvor meget kan du låne til bolig, og hvad kan du købe for.** Datagrund: dansk autocomplete (hl=da, 7/10 03:5x) har 10 af 10 træffere under «hvor meget kan jeg låne», 10 af 10 under «hvor meget kan jeg låne til hus», 10 af 10 under «hvor meget kan jeg købe bolig for» og 10 af 10 under «hvor meget kan jeg købe hus for» — og sitet havde ingen side der svarede (kun en FAQ-linje på `/boliglaan`). Værktøjet regner den **laveste af to grænser**: gældsfaktoren (Finanstilsynets referencepunkt 4, valgbar 3,5/4/5) og 5 %-udbetalingen, og viser fordelingen realkredit 80 % / banklån 15 % / udbetaling 5 %. Alle tal, eksempeltabellen og FAQ-svarene læses fra `laanekapacitet.ts`, så ingen kopi kan glide fra reglerne. Kilder: bekendtgørelse om god skik for boligkredit + Finanstilsynets vejledning + Finansdanmarks lånegrænser. **MÅL: /laanekapacitet baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 02:5x. ✅ **`/maling` — hvor mange liter maling skal du bruge.** Datagrund: dansk autocomplete (hl=da, 7/10 02:4x) har **10 af 10** træffere under «hvor meget maling skal jeg bruge» (bl.a. «… til 10 kvm», «… til 20 kvm», «… til en væg») og 10 af 10 under «hvor mange liter maling». Sitet havde en materialeberegner på `/kvadratmeter`, men ingen side der svarer på malingsspørgsmålet. Værktøjet regner vægareal (`2 × (l+b) × h`), loft og fradrag for døre/vinduer og giver liter pr. strøg; dækkevne og spild læses fra `kvadratmeter-materialer.ts`, så de to værktøjer ikke kan glide fra hinanden. Dansk-only, som `/nutidskroner`. **MÅL: /maling baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 02:1x. ✅ **`/gaveafgift` — hvor meget må du give skattefrit, og hvad bliver afgiften af resten.** Datagrund: dansk autocomplete (hl=da, 7/10 02:0x) svarer «hvor meget må jeg give mine børn» og «gaveafgift»/«gaveafgift 2026», og sitet havde arveafgift men ingen gaveafgift — samme regelsæt (boafgiftsloven). Alle 2026-tal er Skattestyrelsens egne, læst på skat.dk/borger/gaver-gevinster-og-legater/gaver-saa-meget-maa-du-give 7/10: nær familie 80.600 kr afgiftsfrit / 15 %, bedsteforældre og stedforældre 36,25 %, svigerbørn 28.200 kr / 15 %. Værktøjet, eksempeltabellen og FAQ'en læser `GAVE_RELATIONER`, så ingen kopi kan glide fra satsen. **MÅL: /gaveafgift baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 01:2x. ✅ **«Læg til / træk fra procent» er den syvende tilstand på `/procent`** — læseren skriver et beløb og en sats og får svaret direkte («150 kr. + 20 % = 180,00 kr.»), på dansk og svensk, med ændringen i kroner ved siden af. Datagrund: dansk autocomplete (hl=da, 7/10 01:2x) svarer «lægge procent til et tal» og «trække procent fra et tal» med **10 af 10** træffere hver, og alle tre konkurrenter (procent-regner.dk, calcbe, procentregning-online) har tilstanden, som sitets #1-side manglede. Åbningseksemplet 150/20 er sidens egen FAQ («Læg 20 % til 150: 150 × 1,20 = 180»). **MÅL: /procent baseline 149.929 visninger / 85 klik / 0,1 % CTR / pos. 7,5 pr. 6/10** — måles igen 20/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 01:1x. ✅ **`/nutidskroner` — omregn et gammelt beløb til dagens prisniveau med Danmarks Statistiks forbrugerprisindeks.** Datagrund: dansk autocomplete (hl=da, 7/10 01:0x) har **8 af 8** træffere under «nutidskroner», bl.a. «nutidskroner omregner», «nutidskroner beregner», «omregning til nutidskroner 2026/2025/2024/2023» og «10000 i nutidskroner»; sitet havde ingen inflationsberegner. Data: PRIS8 årsgennemsnit 1900–2025 (126 tal, hvert spot-låst i porten) plus august 2026 fra PRIS01 skaleret ind i PRIS8-niveauet (102,58 × 8.343 / 100 = 8.558). Titlen bærer et regnet eksempel fra samme modul. **MÅL: /nutidskroner baseline 0 Plausible/GSC pr. 7/10** — måles igen ~21/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 7/10 00:3x. ✅ **Øresundsbroen er kommet på `/brokost` — 11 køretøjstyper med tre betalingsformer (ØresundGO, onlinebillet, betalingsanlægget) og et årsforbrug, der viser, hvornår GO-aftalens årsafgift på 370 kr. er tjent ind.** Datagrund: dansk autocomplete (hl=da, 7/10 00:2x) har 10 af 10 træffere under «øresundsbroen pris» og 10 af 10 under «hvad koster øresundsbroen». ❓'en om Øresundsbroens prisliste er lukket: `oresundsbron.com/da/priser` svarer 200 fra maskinen (den danske `.dk`-host giver 000), med priser fra 14. september 2026 — hver række bærer kilden. Samme commit retter en dødsdømt test: `ugedag-side.test.tsx` skrev «Tirsdag» som fast tekst, så den dømte sin egen skriveøjeblik (6/10) i stedet for koden og blev rød 7/10. Se VERIFICÉR DEPLOY-note nedenfor.
**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build` på kodeændringer). Seneste målinger (ældre i `docs/plan-arkiv.md`): 7/10 02:1x: typecheck 0, lint 0 (834 filer), **4.841 tests i 293 filer grønne**, `next build` grøn med `/gaveafgift` i ruteoversigten. Mutation målt: `beregnGaveafgift` uden bundfradraget i grundlaget giver **8 røde** i `gaveafgift.test.ts`. 7/10 02:5x: typecheck 0, lint 0 (838 filer), **4.860 tests i 294 filer grønne**, `next build` grøn med `/maling` i ruteoversigten, og `/maling` svarede 200 lokalt med «45 m² væg» og «10 liter» i SSR. Mutation målt: `beregnMalingLiter` uden `× stroeg` giver **4 røde** i `maling.test.ts`. 7/10 04:0x: typecheck 0, lint 0 (843 filer), **4.872 tests i 295 filer grønne**, `next build` grøn med `/laanekapacitet` i ruteoversigten, og `/laanekapacitet` svarede 200 lokalt med «Du kan købe bolig for op til» og «2.105.263 kr.» i SSR. Mutation målt: `maksPrisEfterGaeldsfaktor` uden `÷ (1 − 5 %)` giver **1 rød** i `laanekapacitet.test.ts`. 7/10 04:3x: typecheck 0, lint 0 (847 filer), **4.888 tests i 296 filer grønne**, `next build` grøn med `/tv-storrelse` i ruteoversigten, og `/tv-storrelse` svarede 200 lokalt med «121,8 × 68,5 cm» og «139,7 cm» i SSR. Mutation målt: `beregnSkarmMaal` der altid bruger 16:9 i stedet for det valgte format giver **2 røde** i `skaermstorrelse.test.ts`. 7/10 08:5x: typecheck 0, lint 0 (851 filer), **4.899 tests i 297 filer grønne**, `next build` grøn med `/elbil-lading` i ruteoversigten, og `/elbil-lading` svarede 200 lokalt med «Batterikapacitet (kWh)» og «90 kr.» i SSR (svensk via `Host: beraknare.se`: «Så räknar du ut laddkostnaden» og «72 kr.»). Mutation målt: `beregnElbilLading` uden `× elpris` giver **4 røde** i `elbil-lading.test.ts`. 7/10 12:3x: typecheck 0, lint 0 (855 filer), **4.911 tests i 298 filer grønne**, `next build` grøn med `/kirkeskat` i ruteoversigten, og `/kirkeskat` svarede 200 lokalt med «1.980 kr.», «0,44 %» og «ganget med» i SSR (sitemap indeholder `/kirkeskat`). Mutation målt: `kirkeskatSats` uden `× 100` på snittet giver **1 rød** i `kirkeskat.test.ts` (ukendt kommune får 0,00639 i stedet for 0,639 %). 7/10 13:1x: typecheck 0, lint 0 (859 filer), **4.942 tests i 299 filer grønne**, `next build` grøn med `/areal` i ruteoversigten, og `/areal` svarede 200 lokalt med «Formlerne for de syv figurer», «π × (d ÷ 2)²» og «Samme areal i cm²» i SSR (svensk via `Host: beraknare.se`: «Areaberäknare» og «trapets med sidor 2 och 4 m»). Mutation målt: `areal` der læser diameteren som radius giver **5 røde** i `areal.test.ts`. PR-TJEK 6/10 06:5x (ingen åbne PR'er). BRANCH-TJEK 4/10. Åbne målinger: /procent-rabat 20/10; /fart-titler 20/10; /rentefradrag + /boligstoette titler 17/10; Sentry MINBEREGNER-2-tæller 14/10.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` før Forskel-tilstanden (6/10) | under top-15 | **149.929** | **0,1 %** | **7,5** |
| se `/procent` før Forskel-tilstanden (6/10) | under top-15 | 30.298 | 0,0 % | 9,7 |
| `/procent` | under top-15 | 150.470 | 0,1 % | 7,4 |
| `/dato` | 1.133 | 133.054 | 0,6 % | 5,7 |
| `/tidsberegner` (6/10, før Plus-tidsværktøjet) | **260** | **78.615** | **0,3 %** | **6,7** |
| se `/tidsberegner` | 179 | 75.244 | 0,2 % | 7,7 |
| `/tidszone` | under top-15 | 24.324 | 0,4 % | 7,5 |
| `/moms` | under top-15 | 22.464 | 0,2 % | 7,0 |
| `/moms` før Importmoms-værktøjet (7/10) | under top-15 | **22.464** | **0,2 %** | **7,0** |
| `/kvadratmeter` | 391 | 20.768 | 1,5 % | 4,9 |
| `/kvadratmeter` før arealværktøjet (6/10) | **393 (+96 %)** | 21.403 | 1,5 % | 4,9 |
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/braendstof` før Forbrugsomregneren (6/10) | **252 (+56 %)** | 16.898 | 1,0 % | 6,0 |
| `/alder` | under top-15 | 10.029 | 0,4 % | 7,2 |
| `/renteberegner` | under top-15 | 12.610 | 0,8 % | 7,4 |
| `/procent` før Rabat-tilstanden (6/10) | under top-15 | **149.929** | **0,1 %** | **7,5** |
| `/fart` før Hastighedsomregneren (6/10) | under top-15 | **5.288** | **0,6 %** | **6,9** |
| `/rentefradrag` | under top-15 | 5.082 | 5,8 % | 5,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | **213, bounce 40 %** | under top-15 | — | — |
| `/klokken-i/*` (6/10, 7 nye landesider pr. domæne) | **0** | — | — | — |
| `/tidszone` | under top-15 | 24.829 | 0,4 % | 7,7 |
| `/ugedag` + `/veckodag` (6/10, nye URL'er) | **0** | — | — | — |
| `/rumfang` (6/10, ny) | **0** | — | — | — |
| `/areal` (7/10, ny) | **0** | — | — | — |
| `/laantype` (6/10, ny) | **0** | — | — | — |
| `/brokost` (6/10, ny) | **0** | — | — | — |
| `/nutidskroner` (7/10, ny) | **0** | — | — | — |
| `/gaveafgift` (7/10, ny) | **0** | — | — | — |
| `/laanekapacitet` (7/10, ny) | **0** | — | — | — |
| `/idealvaegt` (4/10, ny) | **0** | — | — | — |
| `/dage-til/*` (2/10, nye) | **0** | — | — | — |
| `/skridt` (6/10, ny) | **0** | — | — | — |
| `/dage-mellem-datoer` + se (3/10, nye) | **0** | — | — | — |
| `/klokken-i/*` (4/10, nye) | **0** | — | — | — |
| se `/dato` | 133 | 101.580 | 0,1 % | 8,2 |
| se `/tidsberegner` | 167 | 61.934 | 0,2 % | 8,0 |
| se `/procent` | under top-15 | 26.933 | 0,0 % | 9,9 |

Site: minberegner.dk 7.421 besøgende/28d (+42 %), ~600.000 GSC-visninger pr.
måned. Kilder: Google 4.170, Bing 1.319, DDG 378, Yahoo 274 — **1.971 af 7.319
(27 %) kommer fra søgemaskiner der ikke er Google**.

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

### Prioriterede opgaver — åbne

**F5f. [x] FÆRDIG 6/10 20:4x — Hastighedsomregner på `/fart`** (DEPLOY OK 6/10 21:31 på begge domæner), og **6/10 21:5x — de tre regnestykker også på svensk**. Datagrund: 10 af 10 danske autocomplete-træffere under «km i timen» er omregning mellem km/t, m/s, mph og knop; sitet havde kun `distance = fart × tid`.

**F5g. [x] FÆRDIG 6/10 21:3x — «Rabat i procent» på `/procent`**, se
`docs/plan-arkiv.md`. Datagrund: GSC-eksporten 6/10 (149.929 visninger, 0,1 %
CTR, pos. 7,5) rummer søgningen «en telefon er sat 1125 kr. ned. normalt koster
den 9000 kr. hvor stor er rabatten i procent?» på pos. 5, og dansk autocomplete
(6/10 21:3x) svarer «rabat procent» med «procentvis rabat» og «procentregning
rabat» blandt ti træffere. Siden havde formlen, tabellen og to FAQ-svar, men
værktøjet havde ingen rabat-tilstand. **MÅL: /procent baseline 149.929
visninger / 85 klik / 0,1 % CTR / pos. 7,5 pr. 6/10** — måles igen 20/10.

**F5d. [x] FÆRDIG 6/10 — `/laantype`, se `docs/plan-arkiv.md`.**

**F5e. [x] FÆRDIG 6/10 07:5x — «Forskel mellem to tal» på `/procent`**,
se `docs/plan-arkiv.md`. Datagrund: `/procent` er sitets #1-side (149.929
GSC-visninger, 0,1 % CTR, pos. 7,5), og dansk autocomplete (hl=da, 6/10)
svarer «procentvis forskel» med ni træffere, otte af dem «… mellem to tal»;
svensk «procent skillnad mellan två tal» har 10 af 10 relaterede. Siden lærer
allerede de to formler, men værktøjet kunne kun den ensidige — nu får
læseren begge tal fra ét talpar.

**F0d. [~] To sider måler deres nye titel i 14 dage, før der røres ved den.**
`/rentefradrag` (5,8 %) og `/boligstoette` (2,5 %) er GSC-uddragtets to højeste
CTR, så deres **danske** titler får ikke et regnet eksempel, før målingen er
læst. **Accept:** tallene fra GSC 17/10 står i tabellen; bagefter enten regnet
eksempel eller en skriftlig begrundelse for at lade være. De svenske
pendanttitler er rettet 3/10. Lukket herfra: `/arveafgift`, `/renteberegner`,
`/alder`, `/tidszone`, `/boernepenge`, `/dato` — alle med regnet eksempel i
porten.

**F1. [x] FÆRDIG 7/10 Søgeniveau-data for `/procent`** — 150.470 visninger, 0,1 %, pos 7,4.
Titel/beskrivelse matcher nu «10 procent af» og rabat-spørgsmålet (1125 kr ned fra 9000 kr).
GSC's tre søgninger summerer 364 visninger af 150.470. ⛔ GSC-eksport er et ❓.

**F3. [ ] beraknare.se: position, ikke titel.** 190.447 visninger på pos. 8-10.
Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes før de
svenske titelændringer er målt.

**F5. [~] IndexNow** er kodet (`src/lib/indexnow.ts`) og krogen findes:
`src/instrumentation.ts` `register()` kalder `submitDeploymentIndexNow()` ved
serverstart. ⛔ Mangler `INDEXNOW_ENABLED=true` + `INDEXNOW_API_KEY` i Dokploy
(❓) — uden dem logger hver boot `[indexnow] … skipped (disabled)`.

**F5c. [~] Procentnotationen «8 %» kun i filer under 15 noder.** Loftet
`PROCENT_UDEN_MELLEMRUM_LOFT` (**206**) må kun falde, og næste slice skal måles på
ny. De to største er begge ⛔: `blog/30-procent-reglen-husleje` («30% reglen» er
sitets eget navn) og `/moms` (de 3 lovgrænser).

**F9. [x] FÆRDIG 7/10 `locale === "se" ? "se" : "da"` — 13 bruger-synlige steder med dansk på norske domæner rettet.** Tilføjet `src/lib/locale-text.ts` med `getTextLocale`, `getDaSeLocale`, `getLocaleText`. Opdateret `lokal-dato.ts`, `bil-omkostninger.ts`, `dato/page.tsx` med `LocaleText`-poster for bruger-synlig tekst og korrekt fallback til dansk for funktioner der kun understøtter da/se. Alle 4860 tests passerer.

## Feature-kø

Leveret 7/10 13:1x: **`/areal` — arealet af cirkel, trekant, rektangel, kvadrat, trapez, parallelogram og rombe i m² og cm²**, med formlerne, et gennemregnet eksempel pr. figur og FAQ der alle læser `areal.ts`. Datagrund: 10 af 10 danske autocomplete-træffere under «areal af» og under «arealet af en».
Leveret 7/10 12:3x: **`/kirkeskat` — hvor meget du betaler i kirkeskat, og hvad du sparer ved at melde dig ud af folkekirken**, med kommunens sats (98 kommuner, 0,42-1,10 %), en eksempeltabel, FAQ og metadata der alle læser `kommuner.ts` og `SATSER_2026.kirkeskatSnit`. Datagrund: «kirkeskat»/«kirkeskat 2026»/«melde ud af folkekirken».
Leveret 7/10 08:5x: **`/elbil-lading` — hvad koster det at lade en elbil fra A til B**, med kWh til opladning, pris pr. opladning, pr. 100 km og pr. måned, dansk og svensk. Datagrund: 10 danske autocomplete-træffere under «hvad koster det at lade …».
Leveret 7/10 04:0x: **`/laanekapacitet` — hvor meget du kan låne til bolig, og hvad du kan købe for**, med den laveste af gældsfaktor og 5 %-udbetaling som svar og fordelingen realkredit/banklån/udbetaling. Datagrund: 10 af 10 danske autocomplete-træffere under «hvor meget kan jeg låne» og tre søsterformuleringer.
Leveret 7/10 02:5x: **`/maling` — hvor mange liter maling skal du bruge til vægge og loft**, med væg-/loftareal, fradrag for døre og vinduer, liter pr. strøg og en dækkevne der læses fra dåsen. Datagrund: 10 af 10 danske autocomplete-træffere under «hvor meget maling skal jeg bruge».
Leveret 7/10 02:1x: **`/gaveafgift` — hvor meget du må give skattefrit i 2026, og
hvad afgiften bliver af resten** (Skattestyrelsens satser: nær familie 80.600 kr /
15 %, svigerbørn 28.200 kr / 15 %, bedsteforældre 36,25 %), med værktøj,
eksempeltabel og FAQ der alle læser samme satser. Datagrund: dansk autocomplete
«hvor meget må jeg give mine børn» og «gaveafgift 2026».
Leveret 7/10 01:1x: **`/nutidskroner` — omregn et beløb fra 1900 og frem til dagens
prisniveau** med Danmarks Statistiks forbrugerprisindeks (PRIS8 + august 2026),
eksempeltabel og en titel med et regnet eksempel (8 af 8 danske autocomplete-træffere).
Leveret 6/10 21:3x: **«Rabat i procent» på `/procent`** — sjette
tilstand, dansk og svensk, med synlige prisfelter og et kort der både siger
«Du sparer 1.125 kr.» og «Rabatten er 12,5 %». Leveret 6/10 15:4x: **`/skridt` — skridt til km, gangtid og kalorier** (7+10 autocomplete-træffere). Leveret 6/10: **`/brokost` med Storebælts prisliste 2026** (26 køretøjstyper,
ekspres-/kortpris, fritidsrabatter, årsforbrug), **«hvad er klokken om N
timer» + summering af tidsrum på `/tidsberegner`** og **«hvornår kan jeg køre
bil igen» på `/promille`** (se `docs/plan-arkiv.md`). De seks punkter nedenfor er alle
⛔ blokeret af en ❓. Den hurtigste målemetode uden
en menneskekilde er dansk autocomplete (`suggestqueries.google.com`); den er
brugt på de seneste features. Syv lukkede punkter står i `docs/plan-arkiv.md`.

- **[x] FÆRDIG 7/10 01:2x — «Læg til / træk fra procent» på `/procent`** (syvende
  tilstand, dansk og svensk). Datagrund: 10 af 10 danske autocomplete-træffere
  under «lægge procent til et tal» og under «trække procent fra et tal»; alle
  konkurrenter har tilstanden. Se `docs/plan-arkiv.md`. **MÅL: /procent baseline
  149.929 visninger / 0,1 % CTR / pos. 7,5 pr. 6/10** — måles igen 20/10.
- **[x] FÆRDIG 7/10 00:3x — Øresundsbroen på `/brokost`**, se `docs/plan-arkiv.md`.
  Datagrund: 10 af 10 danske autocomplete-træffere under «øresundsbroen pris» og
  10 af 10 under «hvad koster øresundsbroen». ❓'en om prislisten er lukket:
  `oresundsbron.com/da/priser` er læsbar fra maskinen (den danske `.dk`-host
  giver curl 000). **MÅL: /brokost under top-15 Plausible/GSC pr. 7/10** — måles
  igen ~21/10.
- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» er danske
  autocomplete-træffere, på svensk «bmi barn tabell». WHO's BMI-for-alder-tabeller
  er ~150 tal pr. køn — for mange at transskribere uden uafhængig kontrol, og en
  fejltransskription er værre end manglende side (punkt 11). ⛔ ét skærmbillede
  af WHO's tabel.
- **[ ] Kogetider** — GSCs **2. største søgning** på `/tidsberegner` (824
  visninger, pos. 6,8) er «hvor lang tid», og **10 af 10** danske completioner er
  madvarer med en koge- eller bagetid. *Accept:* kogetid pr. vare pr.
  tilberedningsmåde, kun med kildeførte tider. ⛔ `frbs.foodsearch.lex.dk` og
  `sst.dk` er begge uafgåengelige fra maskinen (❓).
- **[x] FÆRDIG 6/10 22:2x — «Kalorier i madvarer» på `/kalorier`.** 53 madvarer
  fra USDA FoodData Central (SR Legacy 2018-04), hver med `fdcId`, søgning der
  griber «rugbrod» og «aeg» som «Rugbrød» og «Æg», og et gram-felt pr. række.
  Brødtekstens tal læses fra tabellen, så de ikke kan glide fra den. ⛔'en med
  fødevarekilden er lukket med FDC-CSV'en — **kogetider er stadig ⛔**, de vil
  gerne have den samme kilde til tider, så det næste stykke arbejde kan starte
  dér. Svensk og norsk oversættelse af madvarerne ligger ikke i denne iteration.
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[ ] «promillegrænse» i udlandet.** 5 af 10 danske træffere under «promille»
  er danmark/sverige/tyskland/italien/norge; vi har dansk og svensk grænse og
  ingen sammenligning. ⛔ tre landes love skal leveres (❓).
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af
  10 træffere under «kvadratmeter», og vi har 98 kommuner i `kommuner.ts` —
  men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).

## VERIFICÉR DEPLOY-noter

**Åben 7/10 13:1x:** `VERIFICÉR DEPLOY: /areal svarer 200 på begge domæner og viser figurknaperne «Cirkel», «Trekant», «Rektangel», «Kvadrat», «Trapez», «Parallelogram» og «Rombe», feltet «Diameter», resultatet «Areal» med «0,79 i m²» og «Samme areal i cm²» med «7.854 cm²», overskrifterne «Formlerne for de syv figurer», «Kvadratmeter og kvadratcentimeter» og «Areal og rumfang er ikke det samme», samt formelrækken «π × (d ÷ 2)²»; siden skal også stå i sitemap.xml. På beraknare.se «Areaberäknare» og «trapets med sidor 2 och 4 m». ceo/areal 7/10 13:1x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/areal | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Formlerne for de syv figurer», «Samme areal i cm²» og «π × (d ÷ 2)²». Første reelle deploy-vindue efter mergen er **7/10 17:30**.

**Åben 7/10 12:3x:** `VERIFICÉR DEPLOY: /kirkeskat svarer 200 og viser titlen «Kirkeskat 2026: 450.000 kr. i København = 1.980 kr.», brødteksten «er det 1.980 kr. pr. år», satslisten «København: 0,44 %», den gennemsnitlige sats «0,639 %» og FAQ-svaret «ganget med satsen for din kommune»; siden skal også stå i sitemap.xml. ceo/kirkeskat 7/10 12:3x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/kirkeskat | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Kirkeskat 2026», «1.980 kr.» og «ganget med». Første reelle deploy-vindue efter mergen er **7/10 17:30**.

**Åben 7/10 08:5x:** `VERIFICÉR DEPLOY: /elbil-lading svarer 200 på begge domæner og viser værktøjet med felterne «Batterikapacitet (kWh)», «Ladning nu (%)», «Ladning til (%)», «Elpris (kr/kWh)», «Forbrug (kWh/100 km)» og «Kørsel pr. måned (km)», resultatet «Pris for at lade» med «90 kr.» samt overskrifterne «Sådan regner du ladeomkostningen ud» og «Hvad koster det at køre 100 km?»; på beraknare.se «Så räknar du ut laddkostnaden» og «Vad kostar det att köra 100 km?» ceo/elbil-lading 7/10 08:5x`. Mål på **indhold**: siden er en server-komponent og værktøjet en klient-komponent, men overskrifter, labels og det forudvalgte resultat står i SSR-markup'en. Strip tags og grep: `curl -s https://minberegner.dk/elbil-lading | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Batterikapacitet (kWh)», «Sådan regner du ladeomkostningen ud» og «90 kr.». Første reelle deploy-vindue efter mergen er **7/10 12:30**.

**18 noter lukket 7/10 08:5x med DEPLOY OK 7/10** — alle målt på indhold efter 07:30-vinduet: `/procent` (title + rabat + Læg til/træk fra), `/tv-storrelse`, `/laanekapacitet`, `/maling`, `/gaveafgift`, `/nutidskroner`, `/brokost` (Øresund), `/tidsberegner` (minutter, begge domæner), `/kalorier`, `/moms` (importmoms, begge domæner), `/fart` (begge domæner). Fulde krav og grep står i `docs/plan-arkiv.md`.

⚠️ **`grep -oF «62,1 mph» giver 0 på en side der VISER «100 km/t i mph: 62,1 mph»** (målt 6/10 21:31): der står et tag mellem tallet og enheden, så greb på rå markup kan ikke finde en sætning med et tal og en enhed. Strip HTML'en før du læser tal: `curl -s URL | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"`. Kun tekst, der står bogstaveligt i kilden (labels, overskrifter, FAQ), er grebbar på rå markup.

⚠️ **Brug `grep -o … | wc -l`, ikke `grep -c`, på rå markup** (målt 6/10 00:1x): Next leverer HTML'en som én linje, så `grep -c` tæller linjer og svarer 1 for alt. Værktøjer der er klient-komponenter skal læses i koden, indtil facit kan hentes headless. Interpolerede tal skrives som `1.515<!-- --> skridt` — tjek tal og enhed hver for sig, eller brug FAQ-teksten der står uinterpoleret.

**24 noter lukket 6/10 15:5x med DEPLOY OK 6/10** — alle målt på indhold efter 07:30- og 12:30-vinduerne; fulde krav og målinger i `docs/plan-arkiv.md`.

**Åben 5/10 17:5x (Sentry, delvist lukket):** `VERIFICÉR DEPLOY: Sentry
MINBEREGNER-2 "useLocale must be used within a LocaleProvider" på POST / er
rettet ved at wrappe NotFoundSearch i LocaleProvider i not-found.tsx
ceo/sentry-uselocale-fix 5/10 17:5x`. **Lukket 5/10 21:3x** for det der kan
måles udefra. **Åben:** at fejlen er væk afgør kun Sentrys egen hændelsestæller
(2 hændelser / 0 brugere på 14 dage) — læs den 14/10.

## ❓ Til Mads

- ⛔ **GitHub Actions kunne ikke starte job på minberegner.dk** (5/10 19:35–20:37,
  lukket 6/10 00:0x). Tre kørsler blev `cancelled` efter præcis 15 min med nul
  steps. Kørslen 5/10 21:26 og 6/10 00:40 var grønne, så det var en time med kø.
  Ingen handling: tjek én gang ved iterations start med `gh run list -L 1`.
- ❓ **`auto/union-night` har unikt arbejde, der aldrig er landet** (4/10 04:1x).
  Branchen er fra 17/9 og skiller sig fra `master` i `BACKLOG.md`,
  `docs/kommercielt-inventar.md` og `docs/timepris-nichetest.md`. Sidste fil er et
  markedstal — samme slags kilde, der låser ❓ «Kilde til svenske og norske
  frilanstimepriser». Skal de merges, eller er de forældede? Må ikke slettes
  uden svar.
- ❓ **Sentry MINBEREGNER-2 — `useLocale must be used within a LocaleProvider` på
  `POST /`** (5/10 13:0x, undersøgt og ikke reproduceret). Den kendte årsag er
  rettet (2/10) og dækket af `error.test.tsx`. **Ét skærmbillede af
  Sentry-hændelsen** (transactions + request headers + de to ssr-chunks) ville
  sige hvilken komponent der mangler kontekst.
- ❓ **Kogetider og fødevaredata — den 2. største søgning på `/tidsberegner`**
  (4/10 03:1x, højst prioriteret). «hvor lang tid» har **824 visninger** på
  pos. 6,8, og **10 af 10** danske completioner er madvarer med et koge- eller
  bagetid. `frbs.foodsearch.lex.dk` (Fødevarestyrelsen) og `www.sst.dk` er begge
  uafgåengelige fra maskinen. **Ét skærmbillede fra en fødevaredatabase-tabel**
  låser både kogetider **og** kalorieportioner.
- ❓ **Promillegrænser i Tyskland, Norge og Italien** (4/10 03:2x). 5 af 10 danske
  træffere under «promille» er udenlandske grænser. Vi svarer rigtigt på
  Danmark, men Sverige, Tyskland og Norge giver tre forkerte svar på ét domæne.
- ❓ **Kvadratmeterpris pr. kommune** (4/10 03:4x). «kvadratmeterpris
  københavn/odense» er 3 af 10 træffere under «kvadratmeter», og vi har 98
  kommuner til boligstøtten. **Én kilde pr. kommune er for mange** — kun de 5-10
  største byer er realistiske.
- ❓ **Hvor deployes den norske udgave?** (2/10 14:15.) Målt i live: `beregner.no`
  serverer et **helt andet site** med `/kalkulator/<slug>`-ruter og 115 URL'er i
  sin egen sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains`. Al norsk tekst er derfor usynlig. Skal `beregner.no` servere
  denne app, eller er den norske udgave ikke i drift?
- ❓ **Ferieåret er ikke længere 1. september – 31. december** (målt 12:3x).
  `page-data.ts` og `/feriepenge/page.tsx` siger «optjeningsperioden 1. september
  til 31. august, og ferieåret løber fra 1. september til 31. december året
  efter» — det er reglerne fra FØR ferielovsændringen. Ét skærmbillede af
  ferielovens § 7 låser det. Koden er bevidst urørt — punkt 11.
- ❓ **Ferieåret — otte kilder er uafgåengelige** (4/10 04:1x). Efter
  `retsinformation.dk/api/eli/lta/2020/1146/pdf`, `arbejdsmarkedetsparad.dk`,
  `besk.ft.dk/love/eli/2020/1146`, `lex.dk/ferieloven` og `da.dk` er seks kilder
  prøvet. Koden urørt.
- ❓ **Søgningseksport fra Search Console** (30/9). GSCs opsummering viser kun
  3-4 søgninger pr. side; for `/procent` er de tre tilsammen **364 visninger**.
  **Et skærmbillede af Search Console → Effektivitet → Søgninger, filtreret på
  `/procent`, plus de 20 største søgninger for hele domænet, låser F1-F3.**
  Målt 5/10 22:0x: dansk autocomplete er *ikke* en erstatning — den kan finde
  emner, men ikke rangere dem eller give en visningstælling.
- ❓ **Feriedatoer uden lovkilde** (3/10 05:30). da.wikipedia `Ferie` siger «Vinterferie
  (**typisk** i uge 7 eller 8)» — altså ingen fast uge for vinterferien. **Ét
  skærmbillede fra en kommunes ferieplan 2026/2027 (helst to kommuner) låser
  vinterferie, påskeferie og efterårsferie på én gang.**
- ✅ **Ferielovens regel for sommerferiens startdato** (opgave 201) — **lukket 6/10
  01:5x.** Folkeskoleloven § 14 a stk. 2 siger ordret «Elevernes sommerferie
  begynder den sidste lørdag i juni», læst på retsinformation.dk 6/10 2026.
- ❓ **Øresundsbroens prisliste** (6/10 06:0x, højst prioriteret). `oresundsbroen.dk`
  svarer **ingen forbindelse** fra maskinen — curl giver 000 på domænet og på
  `/priser-och-rabatter/bilpriser`, mens `storebaelt.dk/priser` er læseligt.
  `/brokost` har derfor kun Storebælt. **Ét skærmbillede af Øresundsbroens
  prisliste for 2026** låser den anden store bro på samme side; ØresundPAY har
  egne regler for betaling og rabat.
- ❓ **`ceo/boliglaan-procent`-noten er for snævt formuleret** (3/10 12:47). Den
  kræver «95,0 % belåning» og «5,05 % p.a.», men det er interpolationer fra
  brugerens felter. Skal dømmes på 0 `\d%` og de statiske strenge.
- ❓ **Momslovgrænserne på `/moms`.** Dansk registrering «over 50.000 kr»,
  svensk «högst 120 000 kr per år» og «told ved import over 1.150 kr» (en
  EUR-grænse fra forordning 1186/2009, som ikke må stå som et fast dansk
  beløb). **Ét skærmbillede af ML § 48 og ét af den svenske grænse.**
- ❓ **IndexNow mangler to env-værdier.** `INDEXNOW_ENABLED=true` og
  `INDEXNOW_API_KEY=<8-128 teg af A-Z, a-z, 0-9, - >` skal sættes i Dokploys
  miljøvariabler — nøglen må ikke i en commit. Uden dem returnerer modulet
  `skipped: disabled` ved hver boot.
- ❓ **Kilde til svenske og norske frilanstimepriser.** Ét skærmbillede af et
  markedstal for Danmark, Sverige og Norge låser `/timepris` pr. `Locale`.
- ❓ **Efterlønnens deltidandel: 2/3 eller 0,67?** — lukket 5/10 21:4x uden
  lovkilde. **Dobbeltreglen er dog stadig ulæst** — hvis loven faktisk siger
  67 %, er det *dagpenge*-delen der skal rettes, ikke efterløn.
- ❓ **To skanner-rækker uden fejl i koden** (5/10 21:2x). `npm test` skriver
  «FEJL: 1 ureviewet(e) danske streng(e) …» med `src/app/procent/page.tsx:621` og
  «FEJL: 34 …» med 20 linjer i `src/app/promille/page.tsx`, der er ren dansk i en
  komponent der monteres på beraknare.se. **⛔ Ikke opgaver at fjerne ord for** —
  kræver en stopordsliste der skelner mellem sprog, eller en allowlist-fil.
- ❓ **Et tidligere suitekørsel gav 1 rød i `locale-leak-gate.test.ts`**, som
  scanneren kører i en udspawnet proces og som er grøn i isolation og i to
  senere fulde kørsler. Ikke reproduceret; urørt.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)»; `skat.dk` svarer 500. Teksten siger nu kun hvad beregneren
  regner med.
- ❓ **Fitnessfradrag, sommerhusudlejning, grundskyld for Varde og Playwright.**
  Fire mindre kilder, noteret i `docs/plan-arkiv.md` 2/10 14:20. Repoet har
  stadig intet Playwright, så UI-opgaver kan ikke få skærmbilleder.
