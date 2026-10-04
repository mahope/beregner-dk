STATUS: 4/10 05:5x. ✅ 4/10 05:5x: **promilleberegneren står nu på forsiden blandt
          de populære beregnere** (`ceo/promille-pa-forsiden`) — den var den
          hurtigst voksende danske side (+1327 %, 157 besøgende/28d, ottende mest
          besøgt) og alligevel i den ikke-populære halvdel, så forsiden linkede
          den ikke. Rækken er nu målt i trafikrækkefølge (Plausible 4/10) i stedet
          for 28/9, og porten `home-data.test.ts` dømmer hele rækkefølgen, så den
          ikke kan glide tilbage. Sidebarlen er **ikke** rørt: den har sin egen,
          håndskrevet liste i `calculator-list.ts` (skærer til 6). **MÅL:** `/promille`
          157 besøgende/28d pr. 4/10 og `/` 210 besøgende med 38 % bounce →
          Plausible 1/11; GSC `/promille` 6.003 visninger, 1,6 % CTR, pos. 7,8.
 ✅ 4/10 05:1x: **«Hvad er klokken i Norge» og «… i
          Tyskland» har nu hver sin side** (`ceo/klokken-i-norge-og-tyskland`) —
          hubben havde 12 lande, og Danmarks to nærmeste naboer uden for
          Sverige manglede. Målt på dansk autocomplete 05:1x: begge har to
          completioner, den anden med «lige nu». Undtagelsen for Danmark og
          Sverige gælder ikke her — en dansk læser kan ikke se svaret på sin egen
          telefon. `/tidszone`s «klokken i tolv lande» → «**fjorten**» (og
          «tolva» → «fjorton»), fordi en forkert påstand i brødteksten er det
          værste. **MÅL:** `/tidszone` 23.351 visninger / 101 klik / 0,4 % /
          pos. 7,6 og hubbens to egne søgninger (178v pos. 6, 89v pos. 5) pr.
          4/10 → GSC 18/10; nye URL'er: 0 besøgende.
          ✅ 4/10 05:0x: **fire review-fund fra 4/10 04:2x rettet**
          (`ceo/review-fund-idealvaegt-og-sprog`) — (1) `/idealvaegt`' titel og
          `og:title` sagde «72 kg ved **175 cm 175 cm**»; nu én gang, og
          `/idealvaegt` er lagt i meta-title-tal-tabellen **med en ny
          bigram-port**, fordi `toContain` ikke kan se en dobbeltgæng
          (muteret tilbage → rød med «gentager 175 cm»). (2) Svensk
          brændstof-caption: «Pris **på** bensin» → «Pris **för** bensin».
          (3) `idealvaegt.ts`-docblocken regnede 90 cm til 6,8 kg — det er 104 cm
          (kørt i Node: 6,8/-4,8 kg, null-krydsning 96,5-108,4 cm).
          (4) «**Det** første brøk» → «**Den** første brøk» (fælleskøn) i
          komponent **og** test. Planen skåret 39,3 KB → under 40 KB ved at
          flytte 18 lukkede blokke til `docs/plan-arkiv.md`.
          ✅ 4/10 04:3x: **titlen på `/dato` regner nedtællingen til næste
          1. december** (`ceo/dato-titel`) — «Beregn dage til 1. december: 58
          dage tilbage» / «Beräkna dagar till 1 december: 58 dagar kvar».
          Skrev før «1. jan. 2026→2027 = 365»: et interval på en
          nedtællingsside, håndskrevet (365 også i 2028, hvor det er 366) og på
          svensk ulæseligt som «365 dage kvar». **MÅL:** `/dato` 131.320
          visninger / 863 klik / **0,7 %** / pos. 5,6 (da) og 102.316 / 97 /
          **0,1 %** / 8,1 (se) → GSC 18/10.
          ✅ 4/10 03:5x: brændstoffpris-tabel for **50 → 2.000 km** på
          `/braendstof`; ✅ 03:1x: idealvægt-værktøjet på `/idealvaegt`;
          ✅ 02:3x: lånebeløb-tabel på `/renteberegner`; ✅ 01:5x:
          folkepensionsalder-værktøjet på `/pension`. Alt ældre: `docs/plan-arkiv.md`.
          ⚠️ Scanner-portene er flakiness (ingen `testTimeout` i
          `vitest.config.ts`): 4/10 03:54 gav 10 røde i én køring, samme kode
          var grøn i de to køringer på hver side.
          ⚠️ `locale-leak`-scanneren melder **1 ureviewet dansk streng** i
          `src/app/procent/page.tsx:621` («En lønsprocent kan du se:»).
          Før denne iteration, exit 0, ikke rørt — men den bør mærkes
          `reviewet` i scannerens liste, ellers står den som en fejl.
          PR-TJEK: 4/10 04:1x (ingen åbne). BRANCH-TJEK: 4/10 04:1x — **fire
          fuldt landede remote branches kan ikke slettes fra maskinen**
          (`adsense-review`, `upgrade-frameworks-269`,
          `feat/adtraction-loan-links`, `claude/repo-deep-dive-improvements-76uz7o`:
          0 filer anderledes end `master`, men en lokal tilladelsesregel nægter
          `git push origin --delete`). `auto/union-night` har **unikt** arbejde i
          tre dokumenter — må ikke slettes, se ❓.
          ⏱️ Resten af `## Feature-kø` er **alle ⛔** på en ❓ (kogetider,
          promille i udlandet, kvadratmeterpris, feriedatoer, GSC-eksport), så
          næste iteration skal enten svare på en ❓ eller bygge F0d/F0e.
          CI grøn ved start (`5ad44bd`), ingen uløste Sentry-fejl, Sentry-SDK'en
          er sat op. Gate: `npm run typecheck && npm run lint && npm test`
          (samme som CI's build → lint → test; CI kører også `next build`).
          Målt 05:1x: `/moms`-titel har allerede regnet eksempel, blogindlæggene
          har 3-16 interne links hver, `/dato` linker til alle 22 dage-til-sider,
          og alle 22 står i sitemap'en — de fire åbne Feature-kø-punkter er altså
          lukkede, og `/klokken-i` var det femte hull.

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
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/alder` | under top-15 | 10.029 | 0,4 % | 7,2 |
| `/rentefradrag` | under top-15 | 5.082 | 5,8 % | 5,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/renteberegner` | under top-15 | 12.610 | 0,8 % | 7,4 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | 218, bounce 38 % | under top-15 | — | — |
| `/dage-til` + se `/dagar-till` | **0 — nye URL'er 2/10** | — | — | — |
| `/dage-mellem-datoer` + se `/dagar-mellan-datum` | **0 — nye URL'er 3/10** | — | — | — |
| `/idealvaegt` + se | **0 — nye URL'er 4/10** | — | — | — |
| `/klokken-i/norge` + `tyskland` (+ se) | **0 — nye URL'er 4/10 05:1x** | — | — | — |
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

### Prioriterede opgaver — åbne

**F0d. [~] To sider måler deres nye titel i 14 dage, før der røres ved den.**
`/rentefradrag` (5,8 %) og `/boligstoette` (2,5 %) er GSC-uddragtets to højeste
CTR, så deres **danske** titler får ikke et regnet eksempel, før målingen er
læst. **Accept:** tallene fra GSC 17/10 står i tabellen; bagefter enten regnet
eksempel eller en skriftlig begrundelse for at lade være. De svenske pendanttitler
er rettet 3/10. Lukket herfra: `/arveafgift`, `/renteberegner`, `/alder`,
`/tidszone`, `/boernepenge`, `/dato` — alle med regnet eksempel i porten.

**F0e. [~] Fire `no`-titler uden regnestykke** (`/procent`, `/dato`,
`/tidsberegner`, `/tidszone` mod samme sider i da/se). ⛔ 0 bruger-effekt:
`beregner.no` er i `hiddenDomains` og ❓ nedenfor er ubesvaret.

**F1. [ ] Søgeniveau-data for `/procent`** — 150.470 visninger, 0,1 %, pos 7,4.
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
sitets eget navn) og `/moms` (de 3 lovgrænser). Scanneren tæller noder, så en
linje med to procenter tælles én gang.

**F9. [ ] `locale === "se" ? "se" : "da"` — 13 bruger-synlige steder med dansk på
norske domæner.** Målt 2/10 med grep: `dato/page.tsx` (3), `tidsberegner/page`,
`alder/page`, `opsparing/page`, `bil/page` + `DatoBeregner`, `MomsBeregner`,
`EnhederBeregner`, `PlanetVaegtBeregner`, `lokal-dato.ts`, `bil-omkostninger.ts`.
*Hvorfor:* `/dato` og `/tidsberegner` er sitets to største sider. *Accept:* hvert
sted får en `no`-gren eller en `Record<Locale, …>`, og en port (som
`DANSKE_ORD`-listen i `PaceBeregner.test.tsx`) dømmer da/no/se hver for sig. ⛔
`beregner.no` serverer et andet site — se ❓.

## Feature-kø

Alt med ⛔ er blokeret af en ❓ og må ikke gættes. Den hurtigste målemetode uden
en menneskekilde er dansk autocomplete (`suggestqueries.google.com`); den er
brugt på de seneste features. Syv lukkede punkter (bl.a. `/dage-til`,
`/klokken-i`-hubben, `/brok`'s fire regneregler, `/idealvaegt`, lånebeløb- og
brændstofstabellen, pensionstidslinjen) står i `docs/plan-arkiv.md`.

- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» er danske
  autocomplete-træffere, på svensk «bmi barn tabell». WHO's BMI-for-alder-tabeller
  er ~150 tal pr. køn — for mange at transkribere uden uafhængig kontrol, og en
  fejltransskription er værre end manglende side (punkt 11). ⛔ ét skærmbillede af
  WHO's tabel.
- **[ ] Kogetider** — GSCs **2. største søgning** på `/tidsberegner` (824
  visninger, pos. 6,8) er «hvor lang tid», og **10 af 10** danske completioner er
  madvarer med en koge- eller bagetid. *Accept:* kogetid pr. vare pr.
  tilberedningsmåde, kun med kildeførte tider. ⛔ `frbs.foodsearch.lex.dk` og
  `sst.dk` er begge uafgåengelige fra maskinen (❓).
- **[ ] Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske træffere under
  «kalorier» er madvarer. ⛔ samme fødevarekilde som kogetider (❓), derfor
  én ❓ dækker begge.
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[ ] Målt 4/10 03:3x — «promillegrænse» i udlandet.** 5 af 10 danske træffere
  under «promille» er danmark/sverige/tyskland/italien/norge; vi har dansk og
  svensk grænse og ingen sammenligning. ⛔ tre landes love skal leveres (❓).
- **[ ] Målt 4/10 03:3x — «kvadratmeterpris» pr. by.** «kvadratmeterpris
  københavn/odense» er 3 af 10 træffere under «kvadratmeter», og vi har 98
  kommuner i `kommuner.ts` — men ingen salgsdata. ⛔ én kilde pr. kommune er for
  mange; kun de 5-10 største byer er realistiske (❓).

## VERIFICÉR DEPLOY-noter

**Fjorten noter er åbne og alle er nyere end det seneste deploy-vindue**, så
  ingen af dem skal verificeres før 4/10 07:30. De fælles **regler**: døm på
  indhold med `curl -s <url> | grep …`, HTTP 200 beviser intet, og en kodet ændring
  kan ligge i docker i dagevis. Deploy-vinduer: 4/10 07:30, 12:30, 17:30, 21:30.

**Åben note 4/10 05:5x:** `VERIFICÉR DEPLOY: <promilleberegneren i forsidens
  populære række, målt i trafikrækkefølge> ceo/promille-pa-forsiden 4/10 05:5x`.
  `curl -s https://minberegner.dk | grep -c 'href="/promille"'` skal give **≥1**
  i **den populære sektion** — altså stående *før* den sektion, der rummer
  `/moms`, altså før den ikke-populære liste, og helst tjekket med
  `curl -s https://minberegner.dk | grep -oE 'href="/(dato|bmi|boligstoette|kvadratmeter|rentefradrag|tidsberegner|kalorier|braendstof|barselsdagpenge|husleje|promille|renteberegner)"'`
  som skal ramme **12** sider i den rækkefølge. `curl -s
  https://minberegner.dk/moms | grep -c 'href="/promille"'` skal give **≥1**, så
  den også er nået fra en kalkulatorside.


**Åben note 4/10 05:1x:** `VERIFICÉR DEPLOY: <Norge og Tyskland i /klokken-i,
14 lande i hub-rækkerne og «klokken i fjorten lande» på /tidszone>
ceo/klokken-i-norge-og-tyskland 4/10 05:1x`. `curl -s
https://minberegner.dk/klokken-i/norge | grep -oE '<title>[^<]*</title>'` skal
give «Hvad er klokken i Norge? 12 i Danmark = HH:MM i Oslo» med **HH:MM** =
12 + forskellen til `Europe/Oslo` (13:00 om sommeren, 13:00 om vinteren — Oslo
er samme sæsonzone som Danmark), og `beraknare.se/klockan-i/tyskland` skal have
«Vad är klockan i Tyskland? 12 i Sverige = HH:MM i Berlin» (13:00). `curl -s
https://minberegner.dk/tidszone | grep -c 'klokken i fjorten lande'` **≥1** og
`grep -c 'klokken i tolv lande'` **0**; `beraknare.se/tidszone` «klockan i
fjorton länder». `/klokken-i` skal have **14** links til `/klokken-i/*`, og
begge sitemap'er hhv. `…/klokken-i/norge` og `…/klockan-i/tyskland`.

**Åben note 4/10 05:0x:** `VERIFICÉR DEPLOY: <titlen på /idealvaegt uden dobbelt
175 cm, svensk brændstof-caption på "för", "Den første brøk" som legend> ceo/review-fund-idealvaegt-og-sprog
4/10 05:0x`. `curl -s https://minberegner.dk/idealvaegt | grep -oE '<title>[^<]*</title>'`
skal give **«Idealvægt beregner: 72 kg ved 175 cm»** og
`grep -c '175 cm 175 cm'` skal give **0**. `https://beraknare.se/braendstof |
grep -c 'Pris för bensin, diesel och el för sträckor från 50 till 2 000 km'` **≥1**
og `grep -c 'Pris på bensin'` **0**. `https://minberegner.dk/brok |
grep -oE '<legend[^>]*>[^<]*</legend>'` skal have **«Den første brøk»** og
`grep -c 'Det første brøk'` **0**.

**Åben note 4/10 04:2x:** `VERIFICÉR DEPLOY: <titlen på /dato regner dagene til
næste 1. december i da+se> ceo/dato-titel 4/10 04:2x`. `curl -s
https://minberegner.dk/dato | grep -oE '<title>[^<]*</title>'` skal give «Beregn
dage til 1. december: **NN** dage tilbage», hvor NN er præcis antallet af
kalenderdage til 1. december samme år (58 hvis det er 4/10), og `grep -c '→'`
**0**. `beraknare.se/dato` skal give «Beräkna dagar till 1 december: **NN** dagar
kvar». Begge tal skal være **identiske på to sider med forskellige klokkeslæt**
(hent igen efter 22:00 dansk tid); forskel er en fejl i `heleDageMellem`.

**Åben note 4/10 03:5x:** `VERIFICÉR DEPLOY: <afstandstabel 50 → 2.000 km på
/braendstof med hele kroner, caption, scope på alle th> ceo/braendstof-afstandstabel
4/10 03:5x`. `curl -s https://minberegner.dk/braendstof | grep -oE '<th scope="row"[^>]*>[^<]*</th>'`
skal give **7** rækker i rækkefølgen **50, 100, 200, 500, 1.000, 1.500, 2.000
km** (var 5, og de to nye stod som `1500 km`/`2000 km` uden separator).
`grep -c '450,00 kr'` **≥1** og `grep -c '355,56 kr'` **0** — 500 km benzin er
**450,00 kr.** i både tabel og titel. `beraknare.se/braendstof` skal have
captionen «… från 50 **till** 2 000 km» (**till**, ikke «til»), og
`grep -c 'från 50 til 2 000 km'` **0**.

**Åben note 4/10 03:1x:** `VERIFICÉR DEPLOY: <idealvægt-værktøj på /idealvaegt:
Devines og Hamwis formel, gennemsnit, spredning og WHO's BMI-interval, da+se>
ceo/idealvaegt-beregner 4/10 03:1x`. `curl -s https://minberegner.dk/idealvaegt |
grep -c 'Devine (1974)'` **≥1**, `grep -c 'Hamwi (1964)'` **≥1**;
`grep -c '<title>Idealvægt beregner: 72 kg ved 175 cm'` **1**. Tallet **72 kg** er
gennemsnippet af 70,7 og 73,3 for 175 cm mand. BMI-intervallet skal stå som
`56,7`–`76,3` kg. `beraknare.se/idealvaegt` skal have «Idealvikt för vuxna»,
«Devines formel (1974)», «WHO:s normalviktsband» og **ikke** danske ord i
brødteksten («längd», «vikt» — ikke «højde», «vægt»).

**Åben note 4/10 02:3x:** `VERIFICÉR DEPLOY: <lånebeløb-tabel med otte beløb
(100.000 → 5 mio.) på /renteberegner, regnet med læserens egen rente og løbetid>
ceo/laanebeloeb-tabel 4/10 02:3x`. `curl -s https://minberegner.dk/renteberegner |
grep -c 'Hvor meget koster det at låne?'` **1**, `grep -oE '5\.368 kr\.'` **≥2**
(én i resultatkortet, én i tabellen for 1.000.000), `grep -c '1\.500\.000 kr\.'`
**≥1**. `beraknare.se/renteberegner` skal have «Vad kostar det att låna?» og
«5 368 kr» **uden** punktum efter kr.

**Åben note 4/10 01:5x:** `VERIFICÉR DEPLOY: <folkepensionsalder-værktøj på
/pension: fødselsdato → alder, dato, søgdato og tid til> ceo/folkepensionsalder-vaerktoj
4/10 01:5x`. `curl -s https://minberegner.dk/pension |
grep -c 'folkepensionsalder-foedselsdato'` **1** (feltet er i den statiske
markup) og `grep -c 'Indtast din fødselsdato for at se, hvornår du kan gå på
folkepension'` **1**. Brødteksten skal stadig have rækkerne «31. december 1953
eller tidligere / 65 år». `beraknare.se/pension` skal **ikke** have værktøjet —
alderskalaen er dansk lov.

**Åben note 4/10 01:3x:** `VERIFICÉR DEPLOY: <mellemrum i de 25 rå procenter i
boligkøbsguiden og i de ti drikke-knapper på /alkoholenheder>
ceo/procent-koeb-af-bolig-alkohol 4/10 01:3x`. `curl -s
https://minberegner.dk/blog/koeb-af-bolig-2026-omkostninger | sed -e 's/="[^"]*"/=""/g'
| grep -oE '[0-9]+([.,][0-9]+)?%' | wc -l` skal give **0** (var 18), og
«Udbetaling (5 %)», «Tinglysning skøde (0,6 % + 1.850 kr)», «forsigtighedsfradrag
på 20 %» skal stå i markup. `curl -s https://minberegner.dk/alkoholenheder |
grep -c '4,6 %'` **≥1** og `grep -c '4,6%'` **0**; samme for «0,5 %», «40 %»,
«24 %» (brødteksten har allerede «4,6 %» i `HEAD`, så den er intet bevis).

**Åben note 4/10 00:5x:** `VERIFICÉR DEPLOY: <alderfelt på BMI-værktøjet med
enhed, børnevarsel under 18 og alder i delelinken> ceo/bmi-alder 4/10 00:5x`.
`curl -s https://minberegner.dk/bmi | grep -oE '<label[^>]*>Alder[^<]*</label>'`
skal give **1** med `Alder (år)`, og feltets `<input` skal have den værdi kilden
har. `grep -c 'Delelinken indeholder en alder under 18'` skal give **0** i den
statiske markup (den vises kun efter valg). `beraknare.se/bmi` skal have «Ålder
(år)».

**Åben note 4/10 00:1x:** `VERIFICÉR DEPLOY: <regelknapperne med egen legend +
hver brøk i sit eget feltset + decimaler rundet ind i feltet + «fællesnævner» i
ét ord på /brok> ceo/brok-grouper-og-runding 4/10 00:1x`. `curl -s
https://minberegner.dk/brok | grep -oE '<legend[^>]*>[^<]*</legend>'` skal give
**3** i rækkefølgen **«Vælg regel», «Den første brøk», «Den anden brøk»** (den
første legend er rettet 4/10 05:0x fra «Det første brøk» — brøk er fælleskøn), og
`grep -c 'role="group"'` **0**. `grep -c 'Fællesnævner'` **≥1** og `grep -c 'Fælles
nævner'` **0**. `beraknare.se/brok` skal have «Välj regel», «Det första
bråket», «Det andra bråket». Svarene skal være regnet: 1/2 + 1/3 = **5/6**,
2/3 ÷ 4/9 = **3/2**.

**Åben note 3/10 23:4x:** `VERIFICÉR DEPLOY: <regnet eksempel i titlen på
/boernepenge: 2 børn (5 og 9 år) = 7.590 kr./kvartal> ceo/boernepenge-titel
3/10 23:4x`. `curl -s https://minberegner.dk/boernepenge | grep -c '<title>Børnepenge
2026: 2 børn (5 og 9 år) = 7.590 kr./kvartal</title>'` skal give **1** og
`grep -c 'og:title" content="Børnepenge 2026: 2 børn'` **1**. `<h1>` skal fortsat
være «Børnepenge Beregner 2026 - Børne- og ungeydelse».

**Åben note 3/10 23:2x:** `VERIFICÉR DEPLOY: <de fire regneregler som værktøj på
/brok + unike feltnavne> ceo/brok-fire-regneregler 3/10 23:2x`. `curl -s
https://minberegner.dk/brok | grep -c 'Regn med de fire regler'` **1**,
`grep -c 'Anden nævner'` **1**, `grep -oE 'id="brok-t[12]"|id="brok-n[12]"' | wc -l`
**4** med hvert id kun én gang. `beraknare.se/brok` skal have «Räkna med de fyra
reglerna», «Andra nämnare», «Gemensam nämnare». Svarene skal være regnet: 1/2 +
1/3 = **5/6**, 2/3 ÷ 4/9 = **3/2**.

**Åben note 3/10 23:0x:** `VERIFICÉR DEPLOY: <mellemrum i 30 rå procenttal på
/bil (da+se), /topskat, blog/biloekonomi, blog/boligsalg + BoligsalgBeregner>
ceo/procent-mellemrum-bilsider 3/10 23:0x`. `curl -s https://minberegner.dk/bil |
sed -e 's/="[^"]*"/=""/g' | grep -oE '[0-9]+([.,][0-9]+)?%' | wc -l` skal give
**0** (var 12), samme på `/topskat` (var 4) og på de to blogindlæg (hver 1-2).
`beraknare.se/bil` skal have «20-25 %».

**Åben note 3/10 22:2x:** `VERIFICÉR DEPLOY: <mellemrum i alle interpolerede
procenttal (35 steder) + loftet INTERPOLATION_LOFT 40 → 0>
ceo/procent-interpolation-til-nul 3/10 22:2x`. `curl -s
https://minberegner.dk/blog/arveafgift-regler-og-satser | grep -c 'Boafgift (15 %)'`
**≥1** og `grep -c 'Boafgift (15%)'` **0**; `/dagpenge` skal have «Dagpenge = 80 %
af løn efter 8 % AM-bidrag»; `/kalorier` FAQ «10-15 %»; `/ejendomsvaerdiskat`
«80 % × 5,1‰»; `/billaan` skal have «5,95 %» i rentetabellen *og* «kontantinsats
på minst 20 %» på beraknare.se (sidste er raw, fra før).

**Åben note 3/10 21:5x:** `VERIFICÉR DEPLOY: <29. februar-dagen i /alders tekst
+ fem danske ord i svensk FAQ + ny se-tekst-port> ceo/review-fund-alder-tabel-og-sprog
3/10 21:5x`. `curl -s https://beraknare.se/promille | grep -c '— og efter
ytterligare'` **0** (og «— och efter ytterligare» = 1); `beraknare.se/procent` skal
have «och inte heller», `beraknare.se/alder` «Timmarna är dagarna gånger 24 och
aldrig» og «dagar-talet», `beraknare.se/dato` «Antalet dagar räknas».
`/alder`-teksten er daglig præcis den 29. februar, så den kan ikke dømmes før
2028-02-29 — døm da på «28. februar» i stedet for «i dag».

## ❓ Til Mads

- ❓ **`auto/union-night` har unikt arbejde, der aldrig er landet** (4/10 04:1x).
  Branchen er fra 17/9 og skiller sig fra `master` i `BACKLOG.md`,
  `docs/kommercielt-inventar.md` og `docs/timepris-nichetest.md`. Sidste fil er et
  niche-test-markedstal — samme slags kilde, der låser ❓ «Kilde til svenske og
  norske frilanstimepriser». Skal de tre dokumenter merges, eller er de
  forældede? De må ikke slettes uden svar.
- ❓ **Kogetider og fødevaredata — den 2. største søgning på `/tidsberegner`
  (4/10 03:1x, højst prioriteret, fordi den er helt målt).** «hvor lang tid» har
  **824 visninger** på pos. 6,8, og **10 af 10** danske completioner er madvarer
  med et koge- eller bagetid. Vi har ingen fødevaredatabase, og
  `frbs.foodsearch.lex.dk` (Fødevarestyrelsen) og `www.sst.dk` er **begge
  uafgåengelige fra denne maskine** (webfetch: transport error og 404).
  **Én skærmbillede fra en fødevaredatabase-tabel** — eller en kilde vi kan
  læse — låser både kogetider **og** kalorieportioner («hvor mange kalorier er
  der i et æg / en banan / et æble» er 5 af 10 under «hvor mange kalorier»).
- ❓ **Promillegrænser i Tyskland, Norge og Italien** (4/10 03:2x). 5 af 10
  danske træffere under «promille» er udenlandske grænser, og vi har kun dansk
  (0,5 ‰) og svensk i koden. Vi svarer rigtigt på Danmark, men Tyskland, Sverige
  og Norge giver **tre forkerte svar på ét domæne**. Ét skærmbillede af de tre
  landes love låser en sammenligningstabel pr. land.
- ❓ **Kvadratmeterpris pr. kommune** (4/10 03:4x). «kvadratmeterpris
  københavn/odense» er 3 af 10 danske træffere under «kvadratmeter», og vi har
  98 kommuner i `kommuner.ts` til boligstøtten. Salgsdata findes på boliga og i
  kommuners salgsundersøgelser — **én kilde pr. kommune er for mange**, så kun
  de 5-10 største byer er realistiske.
- ❓ **Hvor deployes den norske udgave?** (2/10 14:15.) Målt i live:
  `beregner.no` serverer et **helt andet site** — norsk «100+ gratis norske
  kalkulatorer» med `/kalkulator/<slug>`-ruter og 115 URL'er i sin egen
  sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains`. Al norsk tekst er derfor usynlig for brugere. Skal
  `beregner.no` servere denne app, eller er den norske udgave ikke i drift?
- ❓ **Ferieåret — otte kilder er uafgåengelige** (4/10 04:1x). Efter
  `retsinformation.dk/api/eli/lta/2020/1146/pdf`, `arbejdsmarkedetsparad.dk`,
  `besk.ft.dk/love/eli/2020/1146`, `lex.dk/ferieloven` og `da.dk` (alle transport
  error eller 404) er **seks** kilder prøvet. Koden er bevidst urørt.
- ❓ **Ferieåret er ikke længere 1. september – 31. december** (målt 12:3x).
  `page-data.ts` og `/feriepenge/page.tsx` siger «optjeningsperioden 1. september
  til 31. august, og ferieåret løber fra 1. september til 31. december året
  efter», og bloggen `guide-feriepenge-hvornaar-og-hvor-meget` har det i to
  tabeller. **Det er reglerne fra FØR ferielovsændringen.** Ét skærmbillede af
  ferielovens § 7 låser det; rettelsen får sin egen test i `page-data`-porten,
  fordi det er brødtekst på tre sider og i FAQ- og JSON-LD-output. Koden er
  bevidst urørt — punkt 11.
- ❓ **Søgningseksport fra Search Console** (30/9). GSC's opsummering viser kun
  3-4 søgninger pr. side; for `/procent` (150.470 visninger, sitets største side)
  er de tre tilsammen **364 visninger**. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største søgninger
  for hele domænet, låser F1-F3.**
- ❓ **Feriedatoer uden lovkilde** (3/10 05:30 — lukker ferie-feature-køen
  midlertidigt). da.wikipedia `Ferie` siger «Vinterferie (**typisk** i uge 7
  eller 8)» og «Efterårsferie (typisk uge 42)» — altså ingen fast uge for
  vinterferien, kun en tommelse, og intet om påskeferiens startdato.
  `efteraarsferien` på sitet er skrevet til uge 42 som en fast regel, så samme
  kildegrund mangler også der. **Ét skærmbillede fra en kommunes ferieplan
  2026/2027 (helst to kommuner) låser vinterferie, påskeferie og efterårsferie
  på én gang.**
- ❓ **Ferielovens regel for sommerferiens startdato** (opgave 201).
  `/dage-til/summerferien` siger «sommerferien begynder altid den **sidste lørdag
  i juni**», og hævder det står i folkeskoleloven (2024). Er reglen «den lørdag i
  den kalenderuge, hvori 20. juni ligger», står den siden 7 dage forkert i de
  fleste år. Koden er bevidst urørt.
- ❓ **`ceo/boliglaan-procent`-noten er for snævert formuleret** (3/10 12:47).
  Den kræver «95,0 % belåning» og «5,05 % p.a.», men det er interpolationer fra
  brugerens felter og flytter sig med standardværdierne. Skal dømmes på 0 `\d%`
  og de statiske strenge, ikke på to tal der flytter sig.
- ❓ **Momslovgrænserne på `/moms`.** Dansk registrering «over 50.000 kr»,
  svensk «högst 120 000 kr per år» og «told ved import over 1.150 kr» (en
  EUR-grænse fra forordning 1186/2009, som ikke må stå som et fast dansk
  beløb). **Ét skærmbillede af ML § 48 og ét af den svenske grænse** låser de to
  første.
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
  Beregnerens egen præmieportion bruger modsat 2/3-reglen. Koden er bevidst
  urørt, fordi det er en **beregningsændring** (punkt 11).
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)»; `skat.dk` svarer 500. Teksten siger nu kun hvad beregneren
  regner med, og tallet ligger i `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **Fitnessfradrag, sommerhusudlejning, grundskyld for Varde og Playwright.**
  Fire mindre kilder, noteret med detaljer i `docs/plan-arkiv.md` 2/10 14:20.