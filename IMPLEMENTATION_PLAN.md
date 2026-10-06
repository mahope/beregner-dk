STATUS: 6/10 21:4x. ✅ **«Rabat i procent» er den sjette tilstand på `/procent`** — læseren kan nu regne sin egen rabat. Datagrund: GSC (6/10) har «en telefon er sat 1125 kr. ned. normalt koster den 9000 kr. hvor stor er rabatten i procent?» med 56 visninger på pos. 5, og dansk autocomplete (hl=da, 6/10 21:3x) svarer «rabat procent» med «procentvis rabat», «procentregning rabat», «10 procent rabat» og «rabat 20 procent». Siden havde alle talene i brødteksten og FAQ'en, men ingen tilstand læseren kunne skrive sin egen pris ind i. Se `docs/plan-arkiv.md`.
⚠️ `/fart` er **stadig ikke deployet** 6/10 21:31 efter 21:30-vinduet (0 forekomster af «27,78 m/s» på begge domæner). Én vindue er ikke nok til `DEPLOY-MISSING` — tælles igen 7/10.
✅ **`locale-leak`-porten kan ikke længere timeoute** — den har gjort gaten rød på *timeout* alene tre gange. Rodårsagen var 13 `execFileSync`-kald pr. fil: de 7 tests der kun spørger om repoet som det ligger, betalte hver for deres egen gennemgang af alle 743 kandidater (38 s for filen). De læser nu ét delt resultat fra én `beforeAll`; de 14 tests der *faktisk* planter en lækage og skal se den tilstand de skabte, har hver `it(…, { timeout: 30 s })`. Det globale 5 s-loft er urørt, så ingen anden test har mistet sit tjek. **Målt: filen 38 s → 25,0 s, 22/22 grønne; fuld suite 4.714 tests i 286 filer grønne.** ❓'en er lukket, se `docs/plan-arkiv.md`.
✅ **Hastighedsomregner på `/fart` — km/t ↔ m/s ↔ mph ↔ knop, begge veje.** Datagrund: dansk autocomplete (hl=da, 6/10 20:3x) har **10 af 10** træffere under «km i timen», der spørger efter omregning, og «knop omregner» svarer «omregner knop til km» på 2 af 4. Faktorerne er eksakte (yard-and-pound-aftalen 1959, sømil = 1852 m). **MÅL: /fart baseline 5.288 visninger / 32 klik / 0,6 % CTR / pos. 6,9 pr. 6/10** — måles igen ~20/10.
✅ **`/skridt` er live på begge domæner — DEPLOY OK 6/10 20:2x.** Målt på indhold: «Skridt til km» 14 forekomster, «1.515 skridt» 3, «6,6 km» 5, «7,9 km» 7, sitemap 1. Samme greb på beraknare.se: «Steg till km» 14, «1 515 steg» 3, «7,9 km» 7, sitemap 1.
✅ CEO-kø punkt 0 (review-fund 29/9) er gennemgået alle otte: Valborg fast 30. april med port på plads, svensk påskafton `offsetDays: -1`, dansk sankthans fast 23./24. juni, påskeaften-FAQ slettet, `/husleje` på nettoprisindekset, `toUtcMidnight` læser `Europe/Copenhagen`/`Stockholm`, svensk promille-FAQ taler fra `promille-genstande`, `maneder: 12` er korrekt og 1. advent har fire søndage. Det fund, der lå åbent i review-filen (`naesteJuleaften` gav 0 dage på juleaften), er rettet i `35c6175` og porten på linje 91 følger nu sin egen titel.
**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build` på kodeændringer). 6/10 21:3x: typecheck 0, lint 0 (813 filer), **4.725 tests i 286 filer grønne** på 44 s, `next build` grøn. Mutation af `procentRabat` til den omvendte nævner giver **5 røde**. PR-TJEK 6/10 06:5x (ingen åbne PR'er). BRANCH-TJEK 4/10. Åbne målinger: /procent-rabat 20/10; /fart-titler 20/10; /rentefradrag + /boligstoette titler 17/10; Sentry MINBEREGNER-2-tæller 14/10.

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
| `/laantype` (6/10, ny) | **0** | — | — | — |
| `/brokost` (6/10, ny) | **0** | — | — | — |
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

**F5f. [x] FÆRDIG 6/10 20:4x — Hastighedsomregner på `/fart`**, se `docs/plan-arkiv.md`. Datagrund: 10 af 10 danske autocomplete-træffere under «km i timen» er omregning mellem km/t, m/s, mph og knop; sitet havde kun `distance = fart × tid`.

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
sitets eget navn) og `/moms` (de 3 lovgrænser).

**F9. [ ] `locale === "se" ? "se" : "da"` — 13 bruger-synlige steder med dansk på
norske domæner.** Målt 2/10 med grep: `dato/page.tsx` (3),
`tidsberegner/page`, `alder/page`, `opsparing/page`, `bil/page` +
`DatoBeregner`, `MomsBeregner`, `EnhederBeregner`, `PlanetVaegtBeregner`,
`lokal-dato.ts`, `bil-omkostninger.ts`. *Hvorfor:* `/dato` og `/tidsberegner` er
sitets to største sider. *Accept:* hvert sted får en `no`-gren eller en
`Record<Locale, …>`, og en port (som `DANSKE_ORD`-listen i `PaceBeregner.test.tsx`)
dømmer da/no/se hver for sig. ⛔ `beregner.no` serverer et andet site — se ❓.

## Feature-kø

Leveret 6/10 21:3x: **«Rabat i procent» på `/procent`** — sjette
tilstand, dansk og svensk, med synlige prisfelter og et kort der både siger
«Du sparer 1.125 kr.» og «Rabatten er 12,5 %». Leveret 6/10 15:4x: **`/skridt` — skridt til km, gangtid og kalorier** (7+10 autocomplete-træffere). Leveret 6/10: **`/brokost` med Storebælts prisliste 2026** (26 køretøjstyper,
ekspres-/kortpris, fritidsrabatter, årsforbrug), **«hvad er klokken om N
timer» + summering af tidsrum på `/tidsberegner`** og **«hvornår kan jeg køre
bil igen» på `/promille`** (se `docs/plan-arkiv.md`). De seks punkter nedenfor er alle
⛔ blokeret af en ❓. Den hurtigste målemetode uden
en menneskekilde er dansk autocomplete (`suggestqueries.google.com`); den er
brugt på de seneste features. Syv lukkede punkter står i `docs/plan-arkiv.md`.

- **[ ] Øresundsbroen på `/brokost`.** Svensk autocomplete og dansk («øresundsbroen
  pris», «hvor meget koster det at krydse øresundsbroen») peger på den anden
  store bro, og `/brokost`-værktøjet har allerede betalingsform, overfarter,
  ture og rabatter. ⛔ `oresundsbroen.dk` svarer **ingen forbindelse** fra
  maskinen (curl 000, alle stier), og ØresundPAY har egne priser — ❓ ét
  skærmbillede af prislisten.
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
- **[ ] Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske træffere under
  «kalorier» er madvarer. ⛔ samme fødevarekilde som kogetider (❓), derfor én ❓
  dækker begge.
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

**Åben 6/10 21:3x:** `VERIFICÉR DEPLOY: /procent svarer 200 på begge domæner og
tilstandene er seks, så radiogruppen har 6 radioer og grid-klassen md:grid-cols-3
på dansk og svensk ceo/procent-rabat 6/10 21:3x`. Mål på **indhold**:
`curl -s https://minberegner.dk/procent | grep -o 'Pris før rabat (kr.)' | wc -l`
→ **1** (Rabat i procent er en klient-tilstand, så kun felternes labels står i
HTML'en; tallene kommer først ved interaktion). Samme greb på beraknare.se med
«Pris före rabatt (kr)». Første reelle deploy-vindue efter mergen er **7/10
07:30**.

**Åben 6/10 20:4x:** `VERIFICÉR DEPLOY: /fart svarer 200 på begge domæner og viser Hastighedsomregneren med «100 km/t i m/s: 27,78 m/s», «100 km/t i mph: 62,1 mph», «100 km/t i knop: 54 knop» og FAQ-spørgsmålet «Hvor mange m/s er 100 km/t?» på dansk og «Hur många m/s är 100 km/h?» på svensk, samt den nye metaDescription med «omregn km/t til m/s, mph og knop» / «omvandla km/h till m/s, mph och knop» ceo/fart-omregner 6/10 20:4x`. Mål på **indhold**: `curl -s https://minberegner.dk/fart | grep -o '27,78 m/s' | wc -l` → **> 0**, `grep -o '62,1 mph' | wc -l` → **> 0**, `grep -o 'Hvor mange m/s er 100 km/t' | wc -l` → **> 0**, og samme tre greb på beraknare.se. Værktøjet er en klient-komponent, så læs den i koden indtil facit kan hentes headless. Første reelle deploy-vindue efter mergen er **6/10 21:30**.

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
