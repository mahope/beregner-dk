STATUS: 5/10 21:4x. ✅ 5/10 21:4x: **efterlønnens deltidstal rettet**
            (`ceo/efterloen-deltid-andel`). `EfterloensBeregner.tsx` gangede
            deltid-andelen ind som **`0.67`** på begge beregningslinjer, men
            0,67 er ikke 2/3 = 0,6667 — værktøjet viste **13.438 kr.** mod de
            **13.372 kr.** som 91 % af deltidens egen dagpengesats er (66 kr. for
            højt pr. måned). Grund: efterløn er en procentdel af *egen* max
            dagpenge, og ministeriets «Satser for 2026» siger 22.041 kr. fuldtid
            mod 14.694 kr. deltid = netop 2/3. Nu ligger deltidgrunden i
            `EFTERLOEN_MAX_SATS_DELTID` i `efterloen.ts` og læses af
            `DAGPENGE_2026`, så de to steder kan ikke glide fra hinanden igen —
            præmieportionen i samme fil (15.870 → 10.580) var allerede 2/3.
            To nye porte, begge dømmer på **renderede** tal og begge døde mod
            den gamle kode (mutation til `* 0.67` gav 1 rød i hver fil).
            ❓ «2/3 eller 0,67» er dermed lukket som *intern modsigelse* uden
            lovkilde, fordi det kun er det interne der var forkert.
            ✅ **Alle fem åbne VERIFICÉR-noter er lukket på indhold** (curl mod
            live, 5/10 21:3x): `/bil` har «15-20 %» ×3, «8-12 %» ×3, «op til
            50 %» og «op til 20 %», 0 rå procenter; `/tidszone` har Sydney
            22:00/20:00 og Nuuk 09:00/09:00 i tabellen, «09:00 i Nuuk» og
            «22:00 i Sydney» i brødteksten, «3 timer bagefter» / «3 timmar
            bakåt»; `/klokken-i` (og `/klockan-i`) siger «14 lande» i titel og
            h1, 0 × «tolv»; `/tidszone`-ankeret siger «klokken i 14 lande»;
            `/dato`s keywords har nu **«helligdage 2026»** (ikke «helligdager»);
            sidebarlen på `/bmi` starter med `/dato` (minus siden selv) og
            `/moms` har `href="/promille"`.
            ⚠️ Fire af de lukkede noters **egne grep-krav var forkerte**, ikke
            koden: React sætter `<!-- -->` mellem tekst og expression, så
            «09:00 i Nuuk» findes som «09:00<!-- --> i Nuuk» (0 matches på det
            rå krav), og svensk retning er «bakåt», ikke «efter». Det er samme
            slags fejl som de tre fra 4/10 — de er rettet i teksten nedenfor, så
            næste iteration ikke leder efter en fejl der ikke findes.
            ⚠️ Den 5. note (Sentry MINBEREGNER-2) er **kun delvist** lukket:
            404-siden svarer 404 og renderer søgefeltet (`placeholder="Søg efter
            en beregner..."`), altså `NotFoundSearch` har provideren i live.
            At fejlen er væk afgør kun Sentry-eventvolumen 14/10.
            ✅ 5/10 17:4x `/tidszone`: sydhalvkloden + Nuuk · ✅ 5/10 16:4x
            `/tidszone`-hub læser `KLOKKEN_LANDE.length` · ✅ 5/10 15:0x fire rå
            procenter i `BilBeregner.tsx` · ✅ 5/10 14:1x sidebarlens liste i
            målt trafikrækkefølge · ✅ 5/10 13:1x to review-fund fra 4/10 ·
            ✅ 4/10: promille på forsiden, Norge+Tyskland, fire review-fund,
            `/dato`-titel, brændstoftabel, `/idealvaegt`, lånebeløb,
            folkepensionsalder. ✅ **CEO-køens punkt 0 er rettet**. Alt ældre:
            `docs/plan-arkiv.md`.
            PR-TJEK: 5/10 21:2x (ingen åbne). BRANCH-TJEK: 4/10 04:1x — fire
            fuldt landede remote branches kan ikke slettes fra maskinen (lokale
            tilladelsesregler nægter `git push origin --delete`).
            `auto/union-night` har unikt arbejde i tre dokumenter — se ❓.
            **Gate:** `npm run typecheck && npm run lint && npm test` (CI kører
            også `next build`). 5/10 21:2x: typecheck 0, lint 0, **4298 tests i
            269 filer** grønne.
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

**F6. [x] Efterlønnens deltidstal: 0,67 → 2/3** — rettet 5/10 21:4x.
`EfterloensBeregner.tsx` skrev `* 0.67` på begge beregningslinjer og viste
13.438 kr. i stedet for 13.372 kr. Grunden er nu `EFTERLOEN_MAX_SATS_DELTID` i
`efterloen.ts`, læst af `DAGPENGE_2026.deltid`. *Hvorfor:* 66 kr. for højt på
hver måned for alle deltidsforsikrede, i et værktøj der ellers henter alle sine
satser fra modulet. *Accept:* de to nye porte dømmer på renderede tal og døde
mod den gamle kode. ⛔ Lovgrund for 2/3 er ikke læst — kun den interne
modsigelse var dokumenteret, og den er lukket uden lovkilde.

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

**Én note er åben** (den nye fra denne iteration). **Alle ni fra 3/10–5/10 17:4x
er lukket på indhold** — målt med `curl` mod begge domæner 5/10 21:3x, ikke på
HTTP-koden. De lukkede noters fulde krav og målinger ligger i
`docs/plan-arkiv.md` (5/10 21:4x).

**Åben note 5/10 21:4x:** `VERIFICÉR DEPLOY: efterlønsberegnerens deltid-gren
viser 13.372 kr. og 14.694 kr., ikke 13.438 kr. og 14.768 kr. ceo/efterloen-deltid-andel
5/10 21:4x`. Mål på indhold: `curl -s https://minberegner.dk/efterloen` skal have
**0** matches på `13.438`, `13.372` og `14.694` (siden er en klient-komponent,
der først renderer tallet ved JS — brug et headless kald eller læs
`EFTERLOEN_MAX_SATS_DELTID` i koden indtil da), og ingen FAQ- eller
metadatastreng skal nævne et deltidstal.

**Åben note 5/10 17:5x (Sentry, delvist lukket):** `VERIFICÉR DEPLOY: Sentry
  MINBEREGNER-2 "useLocale must be used within a LocaleProvider" på POST / er
  rettet ved at wrappe NotFoundSearch i LocaleProvider i not-found.tsx
  ceo/sentry-uselocale-fix 5/10 17:5x`. **Lukket 5/10 21:3x for det, der kan
  måles udefra:** 404-siden svarer 404 og renderer søgefeltet
  (`placeholder="Søg efter en beregner..."`), altså komponenten har provideren i
  live. **Åben:** at fejlen er væk afgør kun Sentrys egen hændelsestæller
  (2 hændelser / 0 brugere på 14 dage) — læs den 14/10, ellers er den lukket på
  et ufuldstændigt grundlag.

⚠️ **Syv noter har nu afveget fra deres krav, ikke fra koden.** De er lukkede,
  men påstandene i dem var forkerte og er rettet her + i arkivet, fordi en
  fremtidig iteration ellers ville lede efter en fejl der ikke findes:

1. **`/moms` → `/promille` gav 0**, fordi sidebarlens liste ikke havde
   `/promille` — rigtige årsag, rettet 5/10 14:1x.
2. **BMI-label mangler «(år)»**: `BmiBeregner.tsx` har `alderLabel: "Alder"` og
   `alderUnit: "år"` som to felt, så markup'en er «Alder» + «år». Ikke en fejl.
3. **`/dagpenge` siger 90 %, ikke 80 %**: `dagpenge.ts` bruger 90 % af løn efter
   AM-bidrag. Portens krav fra 3/10 22:2x havde det ældre tal.
4. **`/dato` skulle have «helligdager 2026»** (5/10 13:1x). Rettelsen *fjerner*
   netop det ord og sætter «helligdage 2026» — live har den nu «helligdage
   2026», så kravet ville slået fejl på den rigtige kode.
5. **«09:00 i Nuuk» gav 0 matches** (5/10 17:4x). React skriver `<!-- -->` mellem
   tekst og expression, så siden har «09:00<!-- --> i Nuuk». Råt grep-streng på
   JSX-tekst er et dårligt krav — brug et tal der står alene i en celle.
6. **Svensk retning er «bakåt», ikke «efter»** (5/10 17:4x). `beraknare.se`
   skriver «3 timmar bakåt».
7. **Sidebarlen på `/bmi` kan ikke starte med `/bmi`** (5/10 14:1x) —
   `Sidebar.tsx` filtrerer `currentHref` væk. På `/bmi` er rækken derfor
   `/dato` → `/boligstoette` → `/rentefradrag` → `/kvadratmeter` → `/kalorier` →
   `/tidsberegner` → `/braendstof`, som er målt rækkefølge minus siden selv.

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
- ❓ **Efterlønnens deltidandel: 2/3 eller 0,67?** — **lukket 5/10 21:4x uden
  lovkilde.** `EfterloensBeregner.tsx` skrev `0.67`, og 0,67 er ikke 2/3 = 0,6667:
  værktøjet viste 13.438 kr. mod de 13.372 kr., deltidens egen dagpengesats
  (14.694 kr.) × 91 % er, altså 66 kr. for højt pr. måned. Rettet til
  `EFTERLOEN_MAX_SATS_DELTID`. Det, der gjorde det til en *fejl* og ikke et
  valg, var modsigelsen: præmieportionen i samme fil (15.870 → 10.580 kr.) var
  allerede præcis 2/3, og `DAGPENGE_2026` siger 22.041 → 14.694 = netop 2/3.
  **Dobbeltreglen er dog stadig ulæst** — hvis loven faktisk siger 67 %, er det
  *dagpenge*-delen der skal rettes, ikke efterløn.
- ❓ **Et skanner-fund uden fejl i koden** (5/10 21:2x). `npm test` melder «FEJL:
  1 ureviewet(e) danske streng(e) i komponenter der monteres på beraknare.se» med
  `src/app/procent/page.tsx:621` — men linjen er svensk («Vår procenträknare kan
  hjälpa dig med fyra olika typer av beräkningar:») og hele blokket er svensk
  fra `locale === "se"` og ned. Scanneren matcher et dansk stopord i svensk
  tekst. **⛔ Ikke en opgave at fjerne ordet for** — det ville slå dansk ødelagt
  for at tilfredsstille en port. Kræver enten en stopordsliste der skelner
  mellem sprog, eller en allowlist-fil.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)»; `skat.dk` svarer 500. Teksten siger nu kun hvad beregneren
  regner med, og tallet ligger i `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **Fitnessfradrag, sommerhusudlejning, grundskyld for Varde og Playwright.**
  Fire mindre kilder, noteret med detaljer i `docs/plan-arkiv.md` 2/10 14:20.