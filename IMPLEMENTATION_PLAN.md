STATUS: 4/10 03:5x. ✅ 4/10 03:5x: brændstoffpris-tabel for **50 → 2.000 km** på
          `/braendstof` (`ceo/braendstof-afstandstabel`) — hver celle er
          `prisPrKm × km` i hele kroner, så den kan læses mod «Sådan regner
          du»-tabellen; nye tests dømmer rækkerne, `scope`, caption og
          kæden titel → tabel på 450 kr.
          ✅ 4/10 03:1x: idealvægt-værktøjet på `/idealvaegt`
          (`ceo/idealvaegt-beregner`, Devine + Hamwi, WHO-interval fra sitets
          egen tabel, alle tal regnet fra `idealvaegt.ts`).
          ✅ 4/10 02:3x: lånebeløb-tabel på `/renteberegner`
          (`ceo/laanebeloeb-tabel`, otte beløb med læserens rente og løbetid).
          ✅ 4/10 01:5x: folkepensionsalder-værktøjet på `/pension`.
          ✅ 4/10 01:3x: mellemrum i 25 procenter i boligkøbsguiden + 10
          drikkeknapper. ✅ 4/10 01:0x / 00:5x / 00:1x: se `docs/plan-arkiv.md`.
          ⚠️ Scanner-portene er flakiness (ingen `testTimeout` i
          `vitest.config.ts`): 4/10 03:54 gav 10 røde i én køring, samme kode
          var grøn i de to køringer på hver side.
          PR-TJEK: 4/10 04:1x (ingen åbne). BRANCH-TJEK: 4/10 04:1x — **fire
          fuldt landede remote branches kunne ikke slettes**: `adsense-review`
          (6/2), `upgrade-frameworks-269` (7/3), `feat/adtraction-loan-links`
          (27/6) og `claude/repo-deep-dive-improvements-76uz7o` (8/7) har alle
          0 filer anderledes end `master`, men en lokal tilladelsesregel
          nægter `git push origin --delete`. De skal slettes med
          `git push origin --delete <branch>` af et menneske.
          `auto/union-night` (17/9) har **unikt** arbejde i tre dokumenter
          (`BACKLOG.md`, `docs/kommercielt-inventar.md`,
          `docs/timepris-nichetest.md`) — må ikke slettes, se ❓.
          ⏱️ Resten af `## Feature-kø` er **alle ⛔** på en ❓ (kogetider,
          promille i udlandet, kvadratmeterpris, feriedatoer, GSC-eksport), så
          næste iteration skal enten svare på en ❓ eller bygge F1/F0e.
          CI grøn ved start (`100b4b2`), ingen uløste Sentry-fejl, Sentry-SDK'en
          er sat op.
          Gate: `npm run typecheck && npm run lint && npm test` (samme som CI's
          build → lint → test; CI kører også `next build`).

## CEO-kø punkt 0 — [x] ✅ alle otte lukket (verificeret i koden 4/10 01:0x)

Målt i `HEAD`, punkt for punkt: `docs/plan-arkiv.md`.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` | under top-15 | 150.470 | 0,1 % | 7,4 |
| `/dato` | 1.133 | 133.054 | 0,6 % | 5,7 |
| `/tidsberegner` | 290 | 73.666 | 0,3 % | 6,9 |
| `/tidszone` | under top-15 | 24.324 | 0,4 % | 7,5 |
| `/moms` | under top-15 | 22.464 | 0,2 % | 7,0 |
| `/kvadratmeter` | 391 | 20.768 | 1,5 % | 4,9 |
| `/alder` | under top-15 | 10.029 | **0,4 %** | 7,2 |
| `/tidszone` | under top-15 | 23.351 | **0,4 %** | 7,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | 218, bounce 38 % | under top-15 | — | — |
| `/dage-til` + se `/dagar-till` | **0 — nye URL'er 2/10** (hubben) | — | — | — |
| `/dage-mellem-datoer` + se `/dagar-mellan-datum` | **0 — nye URL'er 3/10** | — | — | — |
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
**F0/F0b/F0c/F0f. [x] ✅ Fire lukkede titelpunkter samlet** (se
   `docs/plan-arkiv.md`): hreflang-skråstreg på `/dato` (modbevist: 0 af 15
   sider har skråstreg, `page-helpers.ts` bygger `${baseUrl}/${slug}`); regnet
   eksempel i `metaTitle` for `/alder` og `/tidszone`; titelsporten rettet til at
   dømme **resultatet** pr. sprog i stedet for «der står et tal» (rettet efter
   review-fund); alle sprogslagte stier dømmes mod både ruten og sitemap.

**F0d. [~] Regnet eksempel i de tre titler, der kun har et årstal.**
   *Udført 3/10 16:3x for to af dem (`renteberegner`, `arveafgift`).* De tre herunder
   er **danske-only** og blev bevidst lagt tilbage: `/rentefradrag` (5,8 %) og
   `/boligstoette` (2,5 %) er de to højeste CTR i GSC-uddraget, så deres titel
   skal måles i 14 dage — og `/rentefradrag` er sitets bedst rangerende side
   («rentefradrag 2026», 63.000 søgninger, pos. 2), hvor «2026» ikke må forsvinde.
   ✅ 3/10 23:4x: **`/boernepenge` er fjerde titel med regnet eksempel**
   (`ceo/boernepenge-titel`) — den stod som «Børnepenge Beregner 2026 -
   Børne- og ungeydelse», mens de fire familiesøgninger lå på bloggen.
   Målt 3/10 15:3x: `rentefradrag`/«… 2026 - Se din skattebesparelse»,
   `boligstoette`/«Beregn boligstøtte 2026: …», `dagpenge`/«Dagpengeberegner
   2026 - …» — alle tre taget **ud af** titelsporten, så porten og tabellen siger
   det samme. **MÅL:** `/rentefradrag` 5.082/296/5,8 %/5,6,
   `/boligstoette` 7.370/181/2,5 %/8,6 → GSC 17/10.

**F0e. [~] Fire `no`-titler på de fire største sider har intet regnestykke.**
   `/procent|no`, `/dato|no`, `/tidsberegner|no`, `/tidszone|no` mod samme fire
   sider i `da`/`se`, der alle har et. `beregner.no` er lukket i `hiddenDomains`
   og ❓ nedenfor er ubesvaret, så det er 0 bruger-effekt nu.

**F0h. [x] ✅ Regnet svar i titlen på de 24 `/klokken-i`-landesider** —
   `ceo/klokken-titler` 3/10 19:2x. Hver titel har byens **regnede** klokkeslæt
   fra `tidsforskelMinutter` og er `absolute`; to nye tests dømmer pr. sprog og
   pr. sæson. Dansk autocomplete har 10 af 10 land/by under «hvad er klokken i»
   (målt 3/10 19:0x). **MÅL:** de 24 URL'er har 0 GSC-ækker endnu (nye 2/10) →
   GSC 17/10 mod `/tidszone` 23.351/101/0,4 %/7,6.

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

**F5c. [~] Procentnotationen «8 %» — kun filer under 15 noder.**
*Accept:* loftet i `regnestykker.test.ts` (`PROCENT_UDEN_MELLEMRUM_LOFT`, nu
**206**) må kun falde, og hver slice tager de tre største filer. Næste slice
**skal måles på ny** — resten af F5c er kun filer under 15 noder. De to største
er begge ⛔: `blog/30-procent-reglen-husleje` (25 noder, de er **regelnavnet** —
«30% reglen» er sitets eget navn, og det er en undtagelse nogen skal tage
stilling til) og `/moms` (16, de 3 lovgrænser, ❓ nedenfor). Scanneren tæller
noder, så en linje med to procenter tælles én gang. Se `docs/plan-arkiv.md`.

**F5g. [x] ✅ Lukket 3/10 23:0x** (loft 319 → 274 → 261 → 231). De fem
navne-undtagelser («30% reglen» ×2, «4%-reglen») står uændret. Se arkivet.

- **[x] ✅ `/su` får et fribeløbs-værktøj** — se `docs/plan-arkiv.md`.
  *Hvem:* studerende på 1. års SU og deres forældre, hver august–december.
  *Datagrund:* dansk autocomplete **nr. 1** under «hvor meget» målt 3/10, og
  `/su` **falder** (201 → 127 besøgende/28d) selv om spørgsmålet er helt
  sæsonbetonet. `grep -rn "fælleshold" src/` gav **0 træffere**: indtægtsgrænsen
  var en tabel, ikke et svar. *Accept:* uddannelse + SU-måneder + status i de
  øvrige måneder + børn under 18 + handicaptillæg → **årsfribeløb**, pr. måned
  og før AM-bidrag, alle tal fra `SU_2026.freeAllowance`, med su.dk's egen
  præcisering om at året måles som helhed. **MÅL:** `/su` 127 besøgende/28d
  (3/10) → Plausible 17/10.
- **⛔ Lukket og modbevist 3/10 10:0x — «SU-fælleshold».** Der findes ingen
  fællesholdsgrænse: su.dk's fribeløbs- og indkomstsider har **0** fund af
  «fællesøkonomi»/«partner», og reglen er «Din egenindkomst må ikke være
  større end dit årsfribeløb». Uden den var opgaven ubyggelig, så den er
  erstattet af værktøjet ovenfor i stedet for at blive gættet.

**F5e. [x] ✅ Målte decimaler med punktum i dansk tekst** — lukket 3/10 12:3x
med kommune-listen. ⛔ Resten er den samme fejl ét sted længere ned på siden:
kommune-listen skriver stadig «Gentofte (22.8 %)» med punktum, fordi den går
gennem `KOMMUNER`-dataene. Tages først når en port dømmer den.

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

**F5d. [x] ✅ `procent-forside-feriepenge`** — 0 `\d%` i markupken på
forsiden og `/feriepenge`, målt i den renderede komponent i da/se/no.

## Feature-kø

Fire kandidater, i rækkefølge efter hvor ren intentionen er. Alt med ⛔
er blokeret af en ❓ og må ikke gættes. Den hurtigste målemetode uden en
menneskekilde er dansk autocomplete (`suggestqueries.google.com`), og den
er brugt på de to seneste features.

- **[x] ✅ Syv lukkede feature-punkter samlet** (se `docs/plan-arkiv.md`):
  `/leasing`'s restværdi-sammenligning (2/10), `/dage-til` + `/dagar-till`-hubben
  (2/10), `/klokken-i` + `/klockan-i`-hubben (2/10), `/afstand-mellem-adresser`
  (3/10), `/dage-mellem-datoer` + `/dagar-mellan-datum` (3/10), `/dage-i-aaret` +
  `/dagar-i-aret` (3/10) og `/timer-i-aret` + `/timmar-i-aret` (3/10). Alle otte
  måler på 0 i dag — de er nye URL'er — og deres MÅL-tall står i arkivet.

- **[ ] `/bmi` for børn (percentil) — målt, men ⛔ datakilde.** «bmi for børn»,
  «bmi beregner børn», «beregn bmi børn» og «bmi skala børn» er danske
  autocomplete-træffere, på svensk «bmi barn tabell», «bmi barn räkna ut» og
  «beräkna bmi tonåring». WHO's BMI-for-alder-percentiler er **~150 tal pr. køn**
  — for mange til at transkribere uden en uafhængig kontrol, og en fejltransskription
  ville være en dårligere fejl end manglende side (punkt 11). Kræver en kilde Mads
  kan hente (⛔ se ❓ Feriedatoer-mønstret: ét skærmbillede af WHO's tabel).
- **Feriesider: vinterferie og påskeferie** — *Hvem:* «skoleferie 2026» og
  «efterårsferien» (10. af 10 completioner under «hvor mange dage er der til»).
  *Accept:* to sider i `/dage-til` med samme mønster som efterårsferien.
  ⛔ Ferielovens startdato (❓ opgave 201) — må ikke gættes.
- **⛔ Målt og modbevist 3/10 08:1x — «bloggen mangler CTA».** Hypotesen bag
  85 % bounce på `/blog/barsel-2026-regler-og-satser` er modbevist: alle 30
  indlæg har et `NaesteSkridt`-kort med et konkret verb, og barsel-indlægget
  linker desuden til `/barselsdagpenge`, `/barselsplanlaegger` og
  `/boernepenge`. Bounce skal findes et andet sted (formular-længde? intet i
  topfolden? planlæggeren er ny?) — målt før der bygges.
- **Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske autocomplete-
  træffere under «kalorier» er madvarer. ⛔ `sst.dk` svarer 429 (❓ opgave 119).
- **Svensk dækning af de manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Oppgave 187, 13/10 — må ikke flyttes.

- **[x] ✅ Fire lukkede feature-punkter samlet** (se `docs/plan-arkiv.md`):
  de fire regneregler på `/brok` (3/10, MÅL 4.865/34/0,7 %/5,1 → GSC 17/10),
  folkepensionsalder-værktøjet på `/pension` (4/10, MÅL 142 besøgende/28d →
  Plausible 18/10), regnet eksempel i titlen på `/renteberegner` og
  `/arveafgift` (3/10, MÅL 12.610/107/0,8 %/7,4 → GSC 17/10) og Ironman-total i
  `/pace` (`3720dea`).

- **[x] ✅ Idealvægt-værktøjet på `/idealvaegt`** — `ceo/idealvaegt-beregner`
  4/10. *Hvem:* alle der googler «idealvægt kvinde 175 cm», «idealvægt mænd
  alder», «idealvægt mand 175 cm» — 10 af 10 danske completioner under
  «idealvægt» er et højde- og kønsspecifikt tal (målt 4/10 03:0x), og der var
  ingen beregner på sitet. *Datagrund:* `/bmi` er næststørste side (950
  besøgende/28d, **−21 %**) og svarer på det andet spørgsmål; `/vaegttab`
  og `/kropsfedt` ligger i samme klynge. *Accept:* Devine (1974) **og** Hamwi
  (1964) ved siden af hinanden med gennemsnit og spredning, BMI-interval fra
  `bmi-voksen-grænser.ts`, kildetekst med begge dokumenter, alle tal i
  title/description/FAQ regnet fra `idealvaegt.ts`, da+se, kort på begge
   forsider og i kategorien Sundhed, `/bmi` peger på den. **MÅL:** nye URL'er
  har 0 GSC-ækker → GSC 17/10; `/bmi` 950 besøgende/28d → Plausible 18/10.

- **[x] ✅ Lånebeløb-tabel på `/renteberegner`** — `ceo/laanebeloeb-tabel` 4/10.
  *Hvem:* alle der googler «hvor meget koster det at låne 1 million» — seks af ti
  danske completioner under «hvor meget koster det at låne» er konkrete beløb
  (målt 4/10 02:2x). *Datagrund:* `/renteberegner` 12.610 visninger / 107 klik /
  **0,8 % CTR** / pos. 7,4, og værktøjet svarer kun når beløbet er tastet ind.
  *Accept:* otte beløb (100.000 → 5 mio.) som rækker med månedsydelse, samlet
  rente, at betale i alt og renteandel, regnet med **læserens egen** rente og
  løbetid, da+se, `overflow-x-auto`, `sr-only`-caption, `scope` på alle `th`,
  «48 %» med mellemrum. **MÅL:** `/renteberegner` 12.610/107/0,8 %/7,4 →
  GSC 17/10.

- **[x] ✅ Brændstoffpris pr. afstand 50 → 2.000 km på `/braendstof`** —
  `ceo/braendstof-afstandstabel` 4/10 03:5x. *Hvem:* alle der googler «hvad
  koster benzin i dag» — dansk autocomplete-træffer **4 af 10** under «hvad
  koster» (målt 4/10 03:3x). *Datagrund:* `/braendstof` 16.518 GSC-visninger,
  **256 besøgende/28d (+58 %)**, CTR 1,1 %, pos. 5,9, «benzin beregner»
  130 visninger **pos. 2**. *Accept:* rækkerne 1.500 og 2.000 km tilføjet, så
  både ferietur og pendling (sidens eget årstal er 15.000 km) er dækket; hver
  celle `heleKroner(prisPrKm × km)`, altså **samme enhed** som «Sådan regner
  du»-tabellen, så de to kan læses mod hinanden; `sr-only`-caption bygget af
  tabellens **egne** afstande (regnestykker-porten tæller håndskrevne
  tusindtal), `scope="col"`/`scope="row"`, `tabular-nums`; 6 nye tests i
  `BraendstofBeregner.test.tsx` i da+se. **MÅL:** `/braendstof` 256
  besøgende/28d → Plausible 18/10; GSC 17/10 mod 16.518/174/1,1 %/5,9.
- **[ ] Målt 4/10 03:3x — «promillegrænse» i udlandet** ⛔ se ❓ nedenfor.
  *Datagrund:* **5 af 10** danske træffere under «promille» er
  «promillegrænse danmark/sverige/tyskland/italien/norge» (målt 4/10 03:2x).
  Vi har dansk og svensk grænse i koden og ingen sammenligning. Bygbart kun med
  en menneskekilde til de øvrige landes love.
- **[ ] Målt 4/10 03:3x — «kvadratmeterpris» pr. by** ⛔ datakilde. *Hvem:*
  «kvadratmeterpris københavn», «kvadratmeterpris odense» og «odense c» er
  **3 af 10** danske træffere under «kvadratmeter» (målt 4/10 03:4x), og vi har
  98 kommuner i `kommuner.ts` til boligstøtten — men ingen salgsdata.
  *Accept:* kr/m² pr. kommune med kilde pr. kommune og et årstal. Uden data er
  det en gættet kurve, og punkt 11 forbyder det.
- **[ ] Målt 4/10 03:2x — «hvor lang tid» er kogetider** ⛔ se ❓ nedenfor.
  *Hvem:* GSCs **2. største søgning** på `/tidsberegner` (72.471 visninger,
  0,3 % CTR, pos. 6,8) er «hvor lang tid» med **824 visninger**, og **10 af 10**
  danske completioner er konkrete madvarer: blødkogt æg, majskolber, kartofler,
  majs, hårdkogt æg, lasagne, kyllingelår i ovnen (målt 4/10 03:1x). Vi svarer på
  *hvor lang tid* med tal, men ikke på *hvor lang tid skal kartofler koge*.
  *Accept:* kogetid pr. vare pr. tilberedningsmåde, regnet af vægt og
  tilberedningstid — kun med kildeførte tider.

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. ✅ betyder lukket; detaljerne står i `docs/plan-arkiv.md`.

**Åben række (strenglisten):** næste fil skal måles på ny. Loftene og de
lukkede filers målinger står i `docs/plan-arkiv.md`.
**Åbne F5b-slice: ingen — `/flyttebudget` er lukket 3/10 18:4x**, og F5c's
sidste uundtagede slice er lukket 4/10 01:3x. `/moms` er ⛔ (de 3 lovgrænser,
❓ nedenfor), og de to største F5c-filer er ⛔ regelnavne.

## VERIFICÉR DEPLOY-noter

**Dømt på indhold 4/10 04:1x: ingen af de tolv nedenstående noter er live
endnu.** Alt efter 3/10 17:30-vinduet ligger stadig i docker: `/bil` har 12 rå
procenter, `/topskat` 4, `/brok` 0 `legend`, `beraknare.se/promille` har stadig
det danske «— og efter ytterligare», `beraknare.se/procent` 0 «och inte heller»,
og bloggen har titlen «Børnepenge 2026: 5.370 kr./kvartal (0-2 år)». Det er
**0** deploy-vinduer siden de merges, ikke to — de er korrekt ventende på
**4/10 07:30**, og alle tolv deler det. (De fem ældste noter stod med «næste
vindue 3/11 07:30»; det var en bogføringsfejl, rettet her.)

**Åben note 4/10 03:5x:** `VERIFICÉR DEPLOY: <afstandstabel 50 → 2.000 km på /braendstof med hele kroner, caption, scope på alle th> ceo/braendstof-afstandstabel 4/10 03:5x`.
Døm på **indhold**: `curl -s https://minberegner.dk/braendstof | grep -oE '<th scope="row"[^>]*>[^<]*</th>'` skal give **7** rækker i rækkefølgen **50, 100, 200, 500, 1.000, 1.500 og 2.000 km** (var 5, og de to nye rækker stod som `1500 km`/`2000 km` uden tusindtalsseparator). Captionen skal stå som «Pris på benzin, diesel og el for afstande fra 50 til 2.000 km», og `grep -c '2.000 km'` skal give **≥1**. Priserne skal være **hele kroner**: 500 km benzin er **450,00 kr.** — samme tal som «Sådan regner du»-tabellen og som titlen lover — så `grep -c '450,00 kr'` **≥1** og `grep -c '355,56 kr'` **0**. `beraknare.se/braendstof` skal have captionen «… från 50 **till** 2 000 km» (**till**, ikke dansk «til»), og `grep -c 'från 50 til 2 000 km'` **0** på grund af bindestregen. Næste deploy-vindue 4/10 07:30.

**Åben note 4/10 03:1x:** `VERIFICÉR DEPLOY: <idealvægt-værktøj på /idealvaegt: Devines og Hamwis formel, gennemsnit, spredning og WHO's BMI-interval, da+se> ceo/idealvaegt-beregner 4/10 03:1x`.
Døm på **indhold**: `curl -s https://minberegner.dk/idealvaegt | grep -c 'Devine (1974)'` skal give **≥1** og `grep -c 'Hamwi (1964)'` **≥1**; `<title>` skal være `Idealvægt beregner: 72 kg ved 175 cm` (`grep -c '<title>Idealvægt beregner: 72 kg ved 175 cm'` **1**). Tallet **72 kg** er gennemsnippet af 70,7 og 73,3 for 175 cm mand — et forkert gennemsnit eller en byttet grundværdi falder med det samme. BMI-intervallet skal stå som `56,7`–`76,3` kg. `beraknare.se/idealvaegt` skal have «Idealvikt för vuxna», «Devines formel (1974)», «WHO:s normalviktsband» og `<title>Idealvikt: 72 kg vid 175 cm`, og **ikke** danske ord i brødteksten («højde», «vægt» skal stå som «längd», «vikt»). Næste deploy-vindue 4/10 07:30.

**Åben note 4/10 02:3x:** `VERIFICÉR DEPLOY: <lånebeløb-tabel med otte beløb (100.000 → 5 mio.) på /renteberegner, regnet med læserens egen rente og løbetid> ceo/laanebeloeb-tabel 4/10 02:3x`.
Døm på indhold: `curl -s https://minberegner.dk/renteberegner | grep -c 'Hvor meget koster det at låne?'` skal give **1**, og `grep -oE '5\.368 kr\.'` skal give **≥2** — een i resultatkortet og een i tabellens række for 1.000.000 kr. Tabellens otte beløb skal alle stå: `grep -c '1\.500\.000 kr\.'` **≥1**. `beraknare.se/renteberegner` skal have «Vad kostar det att låna?» og «5 368 kr» **uden** punktum efter kr. Næste deploy-vindue 4/10 07:30.

**Åben note 4/10 01:5x:** `VERIFICÉR DEPLOY: <folkepensionsalder-værktøj på /pension: fødselsdato → alder, dato, søgdato og tid til> ceo/folkepensionsalder-vaerktoj 4/10 01:5x`.
Døm på indhold: `curl -s https://minberegner.dk/pension | grep -c 'folkepensionsalder-foedselsdato'` skal give **1** (værktøjet er klient-komponeret, så feltet findes i den statiske markup), og `grep -c 'Indtast din fødselsdato for at se, hvornår du kan gå på folkepension'` **1**. Brødteksten skal stadig have tabellen med rækkerne «31. december 1953 eller tidligere / 65 år», så værktøjet ikke har spiset den. `beraknare.se/pension` skal **ikke** have værktøjet — alderskalaen er dansk lov. Næste deploy-vindue 4/10 07:30.

**Åben note 4/10 01:3x:** `VERIFICÉR DEPLOY: <mellemrum i de 25 rå procenter i boligkøbsguiden (FAQ, tabeller, brødtekst) og i de ti drikke-knapper på /alkoholenheder> ceo/procent-koeb-af-bolig-alkohol 4/10 01:3x`.
Døm på **indhold**: `curl -s https://minberegner.dk/blog/koeb-af-bolig-2026-omkostninger | sed -e 's/="[^"]*"/=""/g' | grep -oE '[0-9]+([.,][0-9]+)?%' | wc -l` skal give **0** (var 18), og «Udbetaling (5 %)», «Tinglysning skøde (0,6 % + 1.850 kr)», «forsigtighedsfradrag på 20 %» skal stå i markup. `curl -s https://minberegner.dk/alkoholenheder | grep -c '4,6 %'` skal give **≥1** for «Almindelig øl (33 cl, 4,6 %)» og `grep -c '4,6%'` **0**; samme for «0,5 %», «40 %», «24 %». Sidens brødtekst har allerede «4,6 %» i `HEAD`, så den skal ikke bruges som bevis. Næste deploy-vindue 4/10 07:30.

**Åben note 4/10 00:5x:** `VERIFICÉR DEPLOY: <alderfelt på BMI-værktøjet med enhed, børnevarsel under 18 og alder i delelinken> ceo/bmi-alder 4/10 00:5x`.
Døm på indhold: `curl -s https://minberegner.dk/bmi | grep -oE '<label[^>]*>Alder[^<]*</label>'` skal give **1** med `Alder (år)`, og `<input` for feltet skal have `value="40"` (eller den værdi kilden har). `grep -c 'Delelinken indeholder en alder under 18'` skal give **0** i den statiske markup (den vises kun efter valg) — døm i stedet på at feltet findes. `beraknare.se/bmi` skal have «Ålder (år)». Næste deploy-vindue 4/10 07:30.

**Åben note 4/10 00:1x:** `VERIFICÉR DEPLOY: <regelknapperne med egen legend + hver brøk i sit eget feltset + decimaler rundet ind i feltet + «fællesnævner» i ét ord på /brok> ceo/brok-grupper-og-runding 4/10 00:1x`.
Døm på indhold: `curl -s https://minberegner.dk/brok | grep -oE '<legend[^>]*>[^<]*</legend>'` skal give **3** i rækkefølgen **«Vælg regel», «Det første brøk», «Den anden brøk»**, og `grep -c 'role="group"'` skal give **0** (den overflødige aria-label på knapperne er væk). `grep -c 'Fællesnævner'` **≥1** og `grep -c 'Fælles nævner'` **0**; samme i brødteksten: `grep -c 'fællesnævner'` ≥1. `beraknare.se/brok` skal have «Välj regel», «Det första bråket» og «Det andra bråket». Svarene skal være regnet: 1/2 + 1/3 = **5/6**, 2/3 ÷ 4/9 = **3/2**. Næste deploy-vindue 4/10 07:30.

**Åben note 3/10 23:4x:** `VERIFICÉR DEPLOY: <regnet eksempel i titlen på /boernepenge: 2 børn (5 og 9 år) = 7.590 kr./kvartal> ceo/boernepenge-titel 3/10 23:4x`.
Døm på indhold: `curl -s https://minberegner.dk/boernepenge | grep -c '<title>Børnepenge 2026: 2 børn (5 og 9 år) = 7.590 kr./kvartal</title>'` skal give **1**, og `grep -c 'og:title" content="Børnepenge 2026: 2 børn' **1**. `<h1>` skal fortsat være «Børnepenge Beregner 2026 - Børne- og ungeydelse» (kun Googles linje er ændret). Næste deploy-vindue 4/10 07:30.

**Åben note 3/10 23:2x:** `VERIFICÉR DEPLOY: <de fire regneregler som værktøj på /brok + unike feltnavne> ceo/brok-fire-regneregler 3/10 23:2x`.
Døm på indhold: `curl -s https://minberegner.dk/brok | grep -c 'Regn med de fire regler'` skal give **1**, `grep -c 'Anden nævner'` **1**, `grep -c 'Fælles nævner'` **≥1**, og `grep -oE 'id="brok-t[12]"|id="brok-n[12]"' | wc -l` skal give **4** med hvert id kun én gang. `beraknare.se/brok` skal have «Räkna med de fyra reglerna», «Andra nämnare» og «Gemensam nämnare». Svarene skal være regnet, ikke hardkodet: 1/2 + 1/3 skal vise **5/6**, 2/3 ÷ 4/9 **3/2**. Næste deploy-vindue 4/10 07:30.

**Åben note 3/10 23:0x:** `VERIFICÉR DEPLOY: <mellemrum i 30 rå procenttal på /bil (da+se), /topskat, blog/biloekonomi, blog/boligsalg + BoligsalgBeregner + «totalt 297.000 kr»> ceo/procent-mellemrum-bilsider 3/10 23:0x`.
Døm på indhold: `curl -s https://minberegner.dk/bil | sed -e 's/="[^"]*"/=""/g' | grep -oE '[0-9]+([.,][0-9]+)?%' | wc -l` skal give **0** (var 12), samme måling på `/topskat` (var 4) og på `minberegner.dk/blog/boligsalg-2026-guide-til-omkostninger-og-provenu` + `…/biloekonomi-2026-hvad-koster-det-at-eje-bil` (hver 1-2). `beraknare.se/bil` skal have «20-25 %» i tabellen. Næste deploy-vindue 4/10 07:30.

**Åben note 3/10 22:2x:** `VERIFICÉR DEPLOY: <mellemrum i alle interpolerede procenttal (35 steder) + loftet INTERPOLATION_LOFT 40 → 0> ceo/procent-interpolation-til-nul 3/10 22:2x`.
Døm på indhold: `curl -s https://minberegner.dk/blog/arveafgift-regler-og-satser | grep -c 'Boafgift (15 %)'` skal give **≥1** og `grep -c 'Boafgift (15%)'` **0**; `/dagpenge` skal have «Dagpenge = 80 % af løn efter 8 % AM-bidrag»; `/kalorier` FAQ «10-15 %»; `/ejendomsvaerdiskat` «80 % × 5,1‰»; `/billaan` skal have «5,95 %» i rentetabellen *og* «kontantinsats på minst 20 %» på beraknare.se (sidste er raw, fra før). Næste deploy-vindue 4/10 07:30.

**Åben note 3/10 21:5x:** `VERIFICÉR DEPLOY: <29. februar-dagen i /alders tekst + fem danske ord i svensk FAQ + ny se-tekst-port> ceo/review-fund-alder-tabel-og-sprog 3/10 21:5x`.
Døm på indhold: `curl -s https://beraknare.se/promille | grep -c '— og efter ytterligare'` skal give **0** (og «— och efter ytterligare» = 1); `https://beraknare.se/procent` skal have «och inte heller», `beraknare.se/alder` «Timmarna är dagarna gånger 24 och aldrig» og «dagar-talet», `beraknare.se/dato` «Antalet dagar räknas». `/alder`-teksten er daglig præcis den 29. februar, så den kan ikke dømmes før 2028-02-29 — døm da på «28. februar» i stedet for «i dag». Næste deploy-vindue 4/10 07:30.

## ❓ Til Mads

- ❓ **`auto/union-night` har unikt arbejde, der aldrig er landet** (ny, 4/10
  04:1x). Branchen er fra 17/9 og skiller sig fra `master` i tre dokumenter:
  `BACKLOG.md`, `docs/kommercielt-inventar.md` og `docs/timepris-nichetest.md`.
  Sidste fil er et niche-test-markedstal — samme slags kilde, der låser
  ❓ «Kilde til svenske og norske frilanstimepriser». Skal de tre dokumenter
  merges til `master`, eller er de forældede? De må ikke slettes uden svar.
- ❓ **Kogetider — den 2. største søgning på `/tidsberegner` (ny, 4/10 03:1x,
  højst prioriteret, fordi den er helt målt).** «hvor lang tid» har **824
  visninger** på pos. 6,8 og **10 af 10** danske completioner under den er
  madvarer med et koge- eller bagetid. Vi har ingen fødevaredatabase, og
  `frbs.foodsearch.lex.dk` (Fødevarestyrelsen) og `www.sst.dk` er **begge
  uafgåengelige fra denne maskine** (webfetch: transport error og 404), så
  tiderne kan ikke hentes. **Én skærmbillede fra en fødevaredatabase-tabellen**
  — eller rettere: en kilde, vi kan læse — låser både kogetider **og** den
  fjerde kalorie-feature («hvor mange kalorier er der i et æg / en banan / et
  æble» er 5 af 10 under «hvor mange kalorier»). Uden den bygges ingen madvareside.
- ❓ **Promillegrænser i Tyskland, Norge og Italien (ny, 4/10 03:2x).** 5 af 10
  danske træffere under «promille» er udenlandske grænser, og vi har kun dansk
  (0,5 ‰) og svensk i koden. Vi svarer rigtigt på Danmark, men Tyskland,
  Sverige og Norge giver **tre forkerte svar på ét domæne**. Ét skærmbillede
  af de tre landes love låser en sammenligningstabel med pr. land.
- ❓ **Kvadratmeterpris pr. kommune (ny, 4/10 03:4x).** «kvadratmeterpris
  københavn/odense» er 3 af 10 danske træffere under «kvadratmeter», og vi har
  98 kommuner i `kommuner.ts` til boligstøtten. Salgsdata pr. kommune findes
  på boliga og i kommunes salgsundersøgelser — **én kilde pr. kommune er for
  mange**, så det er kun bygbart for de 5-10 største byer.

- ❓ **Hvor deployes den norske udgave? (ny, 2/10 14:15, højst prioriteret.)**
  Målt i live: `beregner.no` serverer et **helt andet site** — norsk «100+ gratis
  norske kalkulatorer» med `/kalkulator/<slug>`-ruter og 115 URL'er i sin egen
  sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains` («not yet launched»). Al norsk tekst, også den norske
  dagpenge-linje fra `1174169`, er derfor usynlig for brugere. Skal `beregner.no`
  servere denne app, eller er den norske udgave ikke i drift?
- ❓ **Ferieåret er ikke længere 1. september – 31. december (ny, målt
  12:3x).** `page-data.ts:1822` siger «Med den nye ferielov (fra 2020) er
  optjeningsperioden 1. september til 31. august, og ferieåret løber fra
  1. september til 31. december året efter», `/feriepenge/page.tsx:59-62`
  siger det samme, og bloggen `guide-feriepenge-hvornaar-og-hvor-meget`
  har det i to tabeller og i brødteksten. **Det er reglerne fra FØR
  ferielovsændringen.** retsinformation.dk er en SPA (`/api/eli/…` og
  `/api/search` giver begge HTML), `lex.dk/ferieloven` og `da.dk` 404'er,
  så **intet** kan verificeres herfra. Ét skærmbillede af ferielovens § 7
  (ferieår og optjening) låser det, og rettelsen får sin egen test i
  `page-data`-porten, fordi den er brødtekst på tre sider og i FAQ- og
  JSON-LD-output. Koden er bevidst urørt — punkt 11.
- ❓ **Søgningseksport fra Search Console (30/9).** GSC's opsummering viser kun
  3-4 søgninger pr. side; for `/procent` (150.470 visninger, sitets største side)
  er de tre tilsammen **364 visninger**. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største søgninger
  for hele domænet, låser F1-F3.** GSC-data kan ikke hentes fra en agent.
- ❓ **Feriedatoer uden lovkilde (ny, 3/10 05:30 — lukker ferie-feature-køen
  midlertidigt).** Feature-køens «Feriesider: vinterferie og påskeferie» er
  **ikke bygbar uden en menneskekilde**, og det er målt, ikke antaget:
  da.wikipedia `Ferie` siger «Vinterferie (**typisk** i uge 7 eller 8)» og
  «Efterårsferie (typisk uge 42)» — altså ingen fast uge for vinterferien, kun
  en tommelse, og intet om påskeferiens startdato. `efteraarsferien` på sitet er
  skrevet til uge 42 som en fast regel, så samme kildegrund mangler også der.
  **Ét skærmbillede fra en kommunes ferieplan 2026/2027 (helst to kommuner)
  låser vinterferie, påskeferie og efterårsferie på én gang**, og er derfor
  mere værd end ❓ 201 alene. Uden det bygges ingen ferieside.
- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201).**
  `/dage-til/summerferien` siger «sommerferien begynder altid den **sidste lørdag
  i juni**», og hævder det står i folkeskoleloven (2024). retsinformation.dk er en
  SPA (også på `.xml`), ministeriet/ferieinfo/ferieloven svarer transportfejl,
  `lovguiden.dk` 429. **Ét skærmbillede af bestemmelsen låser det** — er reglen
  «den lørdag i den kalenderuge, hvori 20. juni ligger», står siden 7 dage
  forkert i de fleste år. Koden er bevidst urørt.
- ❓ **`ceo/boliglaan-procent`-noten er for snævert formuleret (3/10 12:47).** Den
  kræver «95,0 % belåning» og «5,05 % p.a.», men det er interpolationer fra
  brugerens felter og flytter sig med standardværdierne. Live står «Typisk
  0,5-1,5 %», «Over 80 % belåning» og «ca. 5,0-7,0 %», og siden har 0 `\d%`.
  Skal dømmes på 0 `\d%` og de statiske strenge, ikke på to tal der flytter sig.
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
- ❓ **Efterløn til deltidsforsikrede: 2/3 eller 0,67?** Målt 3/10 02:38 i
  `EfterloensBeregner.tsx`: deltid regnes som `MAX × 0,67`, altså 20.057 × 0,67
  = **13.438 kr.**, mens `DAGPENGE_2026.deltid` er 22.041 × 2/3 = **14.694 kr.**
  for præcis samme deltidsforsikring — så efterlønsdelen er **67 kr. for høj**.
  Beregnerens egen præmieportion bruger modsat `portion.part = 10.580`, som er
  2/3 af 15.870, altså 2/3-reglen. Koden er bevidst urørt, fordi det er en
  **beregningsændring** og ikke en tekstfejl (punkt 11): hvad dagpengeloven
  siger om deltidsforsikret efterløn, skal stå i en kilde, ikke gættes. Ét
  skærmbillede fra borger.dk eller dagpengeloven låser den, og rettelsen får
  sin egen test i `EfterloensBeregner.test.tsx`.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)» og «Afgifter kommer (2026+)»; `skat.dk` svarer 500. Teksten
  siger nu kun hvad beregneren regner med, og tallet ligger i
  `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **Fitnessfradrag, sommerhusudlejning, madvaretabel, grundskyld for Varde og
  Playwright.** Fem mindre kilder, alle noteret med detaljer i
  `docs/plan-arkiv.md` 2/10 14:20. Uden dem bygges intet, jf. punkt 11.

