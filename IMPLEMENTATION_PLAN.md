STATUS: 5/10 17:4x. ✅ SENTRY MINBEREGNER-2 rettet i ceo/sentry-uselocale-fix. ✅ 5/10 17:4x: **`/tidszone`s klokkeslæt for
           sydhalvkloden og Grønland rettet** (`ceo/tidszone-sydhalvklodet`).
           `tidszoneRækker` valgte byens *egen* `utcVinter`/`utcSommer` til
           kolonnerne, altså antog at byen skiftede samtidig med Danmark. Det
           holder for nordlige byer, men Sydney og Auckland har somertid, når
           Danmark har vintertid, så tabellen sagde **21:00 i begge kolonner**
           (rigtigt: 22/20) og **23:00 i begge** (rigtigt: 00/22). Nuuk lå på
           UTC-3/-2, mens IANA siger fast UTC-2, så siden sagde «08 i Nuuk»,
           «4 timer bagefter» og værktøjet regnede 6 timer i forvejet. Nu læses
           hver bys offset på 15. januar og 15. juli med byens egen `dst`-regel
           (`byOffsetVedDanmarkSæson`), brødtekstens to tal læses fra samme
           funktion (`vinterTidIBy`), og porten dømmer mod **IANA via `Intl`**
           i stedet for tal skrevet i testen. 3 mutationer (gammel
           kolonneformel, Nuuk i begge lag, Nuuk i værktøjet) gav 3 røde hver.
           Gate: typecheck 0, lint 0, **4295 tests i 269 filer** grønne.
           MÅL: `/tidszone` baseline 24.829 GSC-visninger/28d, 0,4 % CTR,
           pos 7,7 (5/10) — faktiske tal kan ikke flyttes, kun rigtigheden.
           ✅ 5/10 16:4x `/tidszone`-hub læser `KLOKKEN_LANDE.length` ·
           ✅ 5/10 15:0x fire rå procenter i `BilBeregner.tsx` (206→203) ·
           ✅ 5/10 14:1x sidebarlens liste i målt trafikrækkefølge, intet dødt
           slice · ✅ 5/10 13:1x to review-fund fra 4/10 · ✅ 4/10: promille på
           forsiden, Norge+Tyskland, fire review-fund, `/dato`-titel,
           brændstoftabel, `/idealvaegt`, lånebeløb, folkepensionsalder.
           ✅ **CEO-køens punkt 0 er rettet** (målt i koden 5/10 14:0x, alle otte
           linjer OK). Alt ældre: `docs/plan-arkiv.md`.
           PR-TJEK: 5/10 16:3x (ingen åbne). BRANCH-TJEK: 4/10 04:1x — fire fuldt
           landede remote branches kan ikke slettes fra maskinen (lokale
           tilladelsesregler nægter `git push origin --delete`).
           `auto/union-night` har unikt arbejde i tre dokumenter — se ❓.
           Gate: `npm run typecheck && npm run lint && npm test` (CI kører også
           `next build`).
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

**F5c2. [x] Fire rå procenter i `BilBeregner.tsx`'s danske gren** — rettet
5/10 15:0x. «Nye biler: 15-20 %»/«8-12 %», «op til 50 %» og «op til 20 %».
Den svenske og norske gren skrev dem rigtigt hele tiden; kun den danske gren
havde rå procenter. Loftet 206 → **203**.

**F5d. [x] `/tidszone`s hub-anker læser `KLOKKEN_LANDE.length`** — rettet
5/10 16:4x. «fjorten»/«fjorton» var håndskrevet over en liste porten tvinger til
at have præcis 14 links i. Tallet afledes nu, så det 15. land ikke gør
ankeret til en løgn.

**F5e. [x] `/tidszone`: sydhalvkloden og Nuuk rettet** — rettet 5/10 17:4x.
Sydney/Auckland fik samme tal i begge kolonner (skifter modsat Danmark), Nuuk
lå et timepavsagn for lavt i to lag. Porten dømmer nu mod IANA.

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

**Tre noter er åbne.** Den nye (5/10 16:4x) skal først verificeres efter
  5/10 17:30. **De fjorten fra 4/10–3/10 er fejet i ét kørt script 5/10 14:0x
  og er lukket** — målt på indhold med `curl`, ikke på HTTP-koden. Målte
  resultater, de fire der fejlede:

**Åben note 5/10 17:4x:** `VERIFICÉR DEPLOY: /tidszone og /tidszone (se)
skriver «09 i Nuuk» og «22 i Sydney», tabellen har Sydney 22:00/20:00 og
Auckland 00:00/22:00, Grønland er «3 timer bagefter» ceo/tidszone-sydhalvklodet
5/10 17:4x`. Mål på indhold: `curl -s https://minberegner.dk/tidszone` skal
ramme `09:00 i Nuuk` 1, `22:00 i Sydney` 1, `Sydney</td><td...>22:00` 1 og
`Grønland</td>` efterfulgt af `3 timer bagefter` 1 — og **0** matches på
`08 i Nuuk`, `21 i Sydney`, `4 timer bagefter`. Samme tre tal på
`https://beraknare.se/tidszone`: `09:00 i Nuuk`, `22:00 i Sydney`,
`Sydney</td><td...>22:00` og `Grönland</td>` efterfulgt af `3 timmar efter`
(svensk retning er «efter», ikke «bagefter») — og **0** matches på
`08 i Nuuk`, `21 i Sydney`, `4 timmar efter`. Skal verificeres efter
5/10 17:30.

**Åben note 5/10 17:5x:** `VERIFICÉR DEPLOY: Sentry MINBEREGNER-2 fejl "useLocale must be used within a LocaleProvider" på POST / er rettet ved at wrappe NotFoundSearch i LocaleProvider i not-found.tsx ceo/sentry-uselocale-fix 5/10 17:5x`. Mål på at fejlen ikke længere opstår ved at teste med en bevidst fejl i et lokalt prod-build der sender fejlen af sted. Den skal være sat bag et flag, som fjernes igen.

**Åben note 5/10 16:4x:** `VERIFICÉR DEPLOY: /tidszone skriver «klokken i 14
  lande» og «klockan i 14 länder» i hub-ankeret, 0× ordformen «fjorten»/
  «fjorton», begge domæner ceo/tidszone-lande-tal 5/10 16:4x`. Mål på
  indhold: `curl -s https://minberegner.dk/tidszone | grep -c 'klokken i 14
  lande'` = 1, `curl -s https://beraknare.se/tidszone | grep -c 'klockan i 14
  länder'` = 1, og begge sider skal have **0** matches på `klokken i [a-zæøå]+
  lande` / `klockan i [a-zäöå]+ länder`.

| Note | Målt | Resultat |
|---|---|---|
| 5/10 13:1x klokken-hub + `helligdage` | `/klokken-i` skal sige «fjorten lande» (ikke «tolv», 0) og `tidszone` det samme; `/dato` skal have «helligdager 2026» | åben, merge skete 13:1x |
| 5/10 14:1x sidebarlens trafikrækkefølge | se note nedenfor | åben, merge skete 14:1x |
| 5/10 15:0x `BilBeregner` procentmellemrum | `/bil` skal have «15-20 %», «8-12 %», «op til 50 %», «op til 20 %» og **0** rå `15-20%`/`50%` | åben, merge skete 15:0x |
| 4/10 05:5x promille på forsiden | 12 links i rækkefølge, `/promille` nr. 11; men `/moms` → `/promille` = **0** | ⚠️ se nedenfor |
| 4/10 05:1x Norge + Tyskland | titler «12 i Danmark = 12:00 i Oslo» / «12 i Sverige = 12:00 i Berlin», `tidszone` «fjorten», 14 links, begge sitemap'er | ✅ |
| 4/10 05:0x idealvægt-titel + brøk-legend | 0× «175 cm 175 cm», «Pris för bensin» 1/«Pris på» 0, 3 legender i rigtig rækkefølge | ✅ |
| 4/10 04:2x `/dato`-titel | «57 dage tilbage» (da) / «57 dagar kvar» (se), 0× `→` | ✅ |
| 4/10 03:5x brændstoftabel | 7 rækker 50→2.000 km, 500 km benzin = 450,00 kr, 0× «355,56 kr», se «från 50 **till**» | ✅ |
| 4/10 03:1x `/idealvaegt`-værktøj | Devine (1974) 1, Hamwi (1964) 1, BMI-interval 56,7 | ✅ |
| 4/10 02:3x lånebeløb-tabel | «Hvor meget koster det at låne?» 1, «5.368 kr.» 2×, «1.500.000 kr.» 1× | ✅ |
| 4/10 01:5x folkepensionsalder | `folkepensionsalder-foedselsdato` 1 på da, **0 på se** som kravet | ✅ |
| 4/10 01:3x procent-mellemrum | blog 0 rå %, `/alkoholenheder` «4,6 %» 1 / «4,6%» 0 | ✅ |
| 4/10 00:5x BMI-alderfelt | feltet er der, men **uden «(år)»** på label | ⚠️ se nedenfor |
| 4/10 00:1x brøk-grupper | 3 legender, 0× `role="group"`, «Fællesnævner» | ✅ |
| 3/10 23:4x børnepenge-titel | titel + og:title, `<h1>` uændret | ✅ |
| 3/10 23:2x fire regneregler | «Regn med de fire regler» 1, «Anden nævner» 1, 4 unikke id'er | ✅ |
| 3/10 23:0x procent-mellemrum bilsider | `/bil` har **4 rå %** («15-20%», «50%»), `/topskat` 0, blogs 0 | ⚠️ se nedenfor |
| 3/10 22:2x interpolation | `/dagpenge` siger **90 %** (portens krav sagde 80 %), `Boafgift (15 %)` findes, `/kalorier` «10-15 %» | ✅ (portens krav var forældet) |
| 3/10 21:5x alder + svensk tekst | se/promille «— och efter ytterligare», procent/alder/dato alle 3 | ✅ |

⚠️ **Tre noter afviger fra deres krav, ikke fra koden** — de er lukkede, men
  påstandene i dem var forkerte og er rettet her, fordi en fremtidig iteration
  ellers ville lede efter en fejl der ikke findes:

1. **`/moms` → `/promille` gav 0**, fordi sidebarlens liste ikke havde `/promille`
   — det var den rigtige årsag, og den er rettet 5/10 14:1x (samme commit som
   denne plan).
2. **BMI-label mangler «(år)»**: `BmiBeregner.tsx` har `alderLabel: "Alder"` og
   `alderUnit: "år"` som to felter, så markup'en er «Alder» + «år» i en
   `<span>`. Ikke en fejl — enheden vises, bare ikke i label-teksten.
3. **`/dagpenge` siger 90 %, ikke 80 %**: `dagpenge.ts` bruger 90 % af løn efter
   AM-bidrag, hvilket er dagpengereglerne. Portens krav fra 3/10 22:2x havde
   det ældre tal.

✅ `/bil`s fire rå procenter i den danske gren af `BilBeregner.tsx` er rettet
  5/10 15:0x — de var i selve komponentens tekststrenge, som de tre tidligere
  procent-opgaver ikke rørte.

**Åben note 5/10 15:0x:** `VERIFICÉR DEPLOY: BilBeregners danske gren skriver
  «15-20 %», «8-12 %», «op til 50 %» og «op til 20 %», 0 rå procenter i
  /bils tip og værdifald-felt ceo/bil-raa-procenter 5/10 15:0x`. Mål på indhold:
  `curl -s https://minberegner.dk/bil` skal ramme «15-20 %» ≥1, «8-12 %» ≥1,
  «op til 50 %» ≥1, «op til 20 %» ≥1 og **0** matches på `15-20%`, `8-12%`,
  `50%` og `20%`. `beraknare.se/bil` er uændret (de har allerede «15–20 %»).

**Åben note 5/10 14:1x:** `VERIFICÉR DEPLOY: <sidebarlens populære liste følger
  målt trafik, intet dødt slice, /promille med> ceo/sidebar-trafikrækkefølge
  5/10 14:1x`. `curl -s https://minberegner.dk/bmi | grep -oE 'href="/[a-z-]+"'`
  skal ramme `/dato`, `/bmi`, `/boligstoette`, `/rentefradrag`, `/kvadratmeter`,
  `/kalorier`, `/tidsberegner` og `/braendstof` i **den rækkefølge** — de otte
  første på en side uden dem i listen. `/moms` skal have `href="/promille"` **≥1**
  (det var 0 før denne commit). `beraknare.se/bmi` skal have `/tidsberegner`,
  `/dato`, `/leasing` og `/alder` som de fire første.

## ❓ Til Mads

- ❓ **`auto/union-night` har unikt arbejde, der aldrig er landet** (4/10 04:1x).
  Branchen er fra 17/9 og skiller sig fra `master` i `BACKLOG.md`,
  `docs/kommercielt-inventar.md` og `docs/timepris-nichetest.md`. Sidste fil er et
  niche-test-markedstal — samme slags kilde, der låser ❓ «Kilde til svenske og
  norske frilanstimepriser». Skal de tre dokumenter merges, eller er de
  forældede? De må ikke slettes uden svar.
- ❓ **Sentry MINBEREGNER-2 — `useLocale must be used within a LocaleProvider` på
  `POST /`** (5/10 13:0x, undersøgt og ikke reproduceret). 2 hændelser / 0
  brugere på 14 dage. Den kendte årsag er rettet (2/10, `4d48370` + `def070c`)
  og dækket af `error.test.tsx`. Målt denne gang: `not-found.tsx` →
  `NotFoundSearch` har provideren i live, ren `POST /` svarer 200, og der er
  ingen server actions og intet i `src/` der POSTer til `/`. **En screenshot af
  Sentry-hændelsen** (transactions + request headers + de to ssr-chunks) ville
  sige, hvilken komponent der mangler kontekst, og låse den næste iteration.
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