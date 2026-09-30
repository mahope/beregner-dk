# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — **fjerde artikelbølge med "Regn det ud"** på `ceo/blog-naste-handling-2`:
`boligstoette-2026-nye-regler` → `/boligstoette` (535 besøgende/28d),
`kvadratmeter-saadan-regner-du-ud` → `/kvadratmeter` (388),
`spar-penge-paa-braendstof` → `/braendstof` (265) og
`dagpenge-saadan-finder-du-din-sats` → `/barselsdagpenge` (212). Dagpenge-artiklen
linkede slet ikke til værktøjet. **Opgave 179 lukket:** C55/C56/C60 er dækket af
komponenttests, der sætter præcis de felter noterne krævede. **Opgave 185 lukket:**
undersøgelsen er færdig, svaret er "ja, slugs er en medvirkende årsag".

**Beslutning om opgave 187 (svenske slugs):** ikke før **2026-10-13**. C195/C196's
svenske titler deployer 30/9 07:30, og 185's egen beskeds var at slugs først er
hypotesen *hvis* titlerne ikke flytter CTR. Derudover fandt denne iteration en
teknisk forudsætning migrationen SKAL løse: en rewrite i middleware giver
canonical fra den interne rute (`/tidsberegner`), som så peger på en URL der
301'er tilbage — en redirect-loop for crawlere. Kræver per-domæne-canonical
eller ægte ruter.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 616 filer
npm run test     # vitest run            — 2992 tests / 189 filer
npm run build    # next build            — 142 sider
node scripts/locale-leak.mjs --gate       # exit 0
```

`tsc --noEmit` har 7 kendte forhåndsfejl i testfiler og er **ikke** del af gaten.
Alle fire var grønne før merge 2026-09-29 22:45.

## Åbne VERIFICÉR DEPLOY-noter

Fire noter. HTTP 200 beviser intet: ingen rører en URL, kun `<title>`- og
`og:title`-strenge, artiklernes **slutning** og rene visuelle elementer.

- ⏳ **VERIFICÉR DEPLOY: fire artikler skal slutte med "Regn det ud" — anden
  bølge.** Kode + plan i ét squash-commit på `ceo/blog-naste-handling-2`.
  Første kandidatvindue **2026-09-30 07:30**. Rørte filer: fire artikler
  (`boligstoette-2026-nye-regler`, `kvadratmeter-saadan-regner-du-ud`,
  `spar-penge-paa-braendstof`, `dagpenge-saadan-finder-du-din-sats`) — kun
  import + ét element efter `</article>`, samme `NaesteSkridt` som første bølge,
  ingen ny komponent, ingen ny URL, ingen sitemap, ingen `<h1>`. Verificér ved
  **indhold**: på hver af de fire skal det være **sidste element før
  "Relaterede artikler"** (hhv. "Relaterede beregnere" på boligstøttestykket,
  og på brændstofstykket det eneste element efter `</article>`) — en boks med
  overskriften "Regn det ud" og knapperne "Beregn din boligstøtte" / "Beregn dit
  areal" / "Beregn din brændstofpris" / "Beregn din dagpenge". **Kontrol:** de
  fire artiklers `<title>` og `<h1>` skal være uændrede, og `/boligstoette`,
  `/kvadratmeter`, `/braendstof` og `/barselsdagpenge` skal stadig svare 200.
  Renderet er verificeret i `BlogNaesteSkridt.test.tsx` (+4 sidetests, der
  fejler mod master — checket med `git stash`); 390/1280 px kan **ikke** tjekkes
  i denne iteration, repoet har ingen Playwright, og komponenten er uændret
  fra første bølge.

- ⏳ **VERIFICÉR DEPLOY: fire blogartikler skal slutte med "Regn det ud" og en
  beregnerknap.** Kode + plan i ét squash-commit på `ceo/blog-naste-handling`.
  Første kandidatvindue **2026-09-30 07:30**. Rørte filer: ny
  `src/components/BlogNaesteSkridt.tsx`, dens test, og fire artikler
  (`barsel-2026-regler-og-satser`, `boernepenge-2026-satser-og-regler`,
  `fradrag-2026-komplet-guide`, `su-2026-satser-og-regler`) — kun import +
  ét element efter `</article>`. Ingen `<h1>`, ingen beregningslogik, ingen ny
  URL, ingen sitemap. Verificér ved **indhold**: på hver af de fire artikler skal
  det være **sidste element før "Relaterede artikler"** (hhv. "Relaterede
  beregnere" på børnepengestykket) — en boks med overskriften "Regn det ud" og
  knappen "Beregn din barselsdagpenge" / "Beregn børnepengen" / "Beregn dit
  rentefradrag" / "Beregn din SU". **Kontrol:** artiklernes `<title>` og
  `<h1>` skal være uændrede, og de fire beregnere skal stadig svare 200.

- ⏳ **VERIFICÉR DEPLOY: seks titler med et udregnet eksempel (`/bmi`, `/fart`,
  `/kalorier`).** Kode + plan i ét squash-commit på `ceo/eksempel-titler-fall`.
  Første kandidatvindue **2026-09-30 07:30**. Rørte filer: `src/lib/page-data.ts`
  (**12 strenge**, kun `metaTitle` og `ogTitle` — `git diff` verificerer at
  intet andet er rørt), `src/lib/title-eksempel.test.ts` (+3 sider, +3
  talverificeringer) og `src/lib/page-data.test.ts` (to låste titler
  opdateret). Ingen `<h1>`, ingen beregningslogik, ingen ny URL, ingen
  sitemap. Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `<title>` på dansk: `/bmi` "BMI-beregner for voksne: 75 kg / 1,75² = 24,5" ·
     `/fart` "Fartberegner: 100 km/t i 2 timer = 200 km" · `/kalorier`
     "Kalorieberegner: mand 80 kg, 180 cm = 2.759 kcal/dag".
  3. Samme på beraknare.se: "BMI-kalkylator för vuxna: 75 kg / 1,75² = 24,5" ·
     "Hastighetsberäknare: 100 km/h i 2 timmar = 200 km" · "Kalorikalkylator:
     man 80 kg, 180 cm = 2 759 kcal/dag".
  4. **Kontrol:** de tre `meta description` skal være byte-for-byte uændrede,
     og de tre `<h1>` skal stadig være "BMI Beregner for voksne",
     "Fartberegner - beregn fart, distance og tid" og "Kalorieberegner".
  **Målt på rigtig server før merge** (`next start` :3987, porten verificeret
  fri *inden* start): alle seks titler er korrekte i begge sprog, de tre
  beskrivelser og de tre `<h1>` er uændrede. **Gate grøn:** lint (**616
  filer**), **3001 tests / 189 filer**, build (**142 sider**), `locale-leak.mjs
  --gate` exit 0. De ni nye titeltests **fejler mod master's `page-data.ts`**
  (verificeret med `git stash`), så de låser den gamle fejl fast.


## Åbne opgaver

#### 97. [BLOCKED: afventer Mads' svar på ejerskabsspørgsmålet — spørgsmålet står i ❓ Til Mads, ingen kode uden svar] 2026-09-27 — C69 — afklar hvad `beregner.no` egentlig er: et domæne der skal lanceres, et reserveret navn — eller en helt anden udgivelse

- **Datagrund:** målt under C66. `https://beregner.no/` svarer **200**, men
  `/moms`, `/procent`, `/dato`, `/tidszone` og `/elberegner` svarer alle **404**.
  Kodeporten siger imidlertid ja: `isCalculatorAvailable("/moms", "no")` er
  `true`, fordi `/moms` hverken har `daOnly` eller `seOnly` i
  `calculator-list.ts:79`.
- **⚠️ PRÆMIS KORRIGERET under C68 — `beregner.no` er ikke dette repo.** Begge
  beviser i den gamle formulering er modsagt af målingen, så opgaven er skrevet
  om fra "hvilken beslutning mangler i porten" til "hvilket domæne er det
  egentlig". 1. **Forsiden er ikke vores.** `https://beregner.no/` er en 12,7 KB
  norsk side med `<title>beregner.no – 100+ gratis norske kalkulatorer</title>`,
  `<h2>Kategorier</h2>` og `<h2>Mest brukte</h2>`, og **uden ét eneste
  `/_next/static`-chunk** — vores forside vejer 192 KB og renderer
  `HomeContent`. `git log -S "Mest brukte"` giver **ingen træffere**: siden har
  aldrig eksisteret i dette repo. 2. **404'en er ikke vores heller.**
  `https://beregner.no/moms` svarer med `<h1 class="text-7xl font-bold
  text-foreground">404`, og `text-foreground` står i **nul** filer i repoet
  (biome linter 551) — den danske "Siden finnes ikke"-side, C66 antog, har ingen
  `text-foreground`. Konklusion: **beregner.no peger på en anden udgivelse end
  den, C65-C68 har arbejdet på.**
- **Følgen for resten af planen:** (a) Denne opgave er ikke længere en
  kodebeslutning, den er et **spørgsmål om ejerskab** — se `❓ Til Mads`.
  (b) Opgave 98 (`TidszoneBeregner` mangler et `no`-sprog) er, hvis det er den
  *anden* udgivelse der mangler norsk, ikke en opgave overhovedet. (c) Scannerens
  overskrift "70 komponenter monteres på beraknare.se/beregner.no" er i praksis
  "på beraknare.se". (d) Alle `no`-fund fra C65/C66 (`navnNo`, `Hårtørrer`,
  `labels` uden `no`) er **uopnåelige** lige nu: ingen kan se dem, og de er
  derfor heller ikke målbare. De er bevaret, fordi de er korrekte og bliver
  nødvendige den dag `no` lanceres fra *dette* repo.
- **Hvorfor det ikke er en refaktor men en beslutning:** det er **forventeligt** ud fra
  `domain-config.ts:91`, `hiddenDomains = new Set(["localhost", "beregner.no"])` —
  kommentaren siger eksplicit "domains not yet launched". Det er altså en
  beslutning, der mangler, ikke en fejl. Men beslutningen er uafskrevet i koden,
  og **den gør C65's og C66's arbejde uverificerbart for `no`**: de oversatte
  `no`-strenge kan ikke ses af nogen, og ingen test kan se dem live.
- **Scope (kræver Mads' svar, ikke en iteration):** er `beregner.no` et domæne
  der skal lanceres snart, eller et reserveret navn? Der er tre mulige svar, og
  de er **ikke** ens:
  1. **Lanceres snart** → så er `no`-klassen (opgave 98) rigtig prioritet, og
     alle `no`-fund fra C65/C66 skal måles live i stedet for i tests.
  2. **Lanceres ikke** → `no` skal lukkes eksplicit i `calculator-list.ts` (alle
     ikke-`daOnly`/`seOnly`-defs skal få `no`-porte, eller `isCalculatorAvailable`
     skal kræve et eksplicit `no`-flag), så koden siger hvad der sker, og 404'en
     er en *beslutning* i stedet for en *bivirkning*.
  3. **Uafklaret** → skriv det i planen som et `❓ Til Mads`-spørgsmål og lad
     porten være som den er, men noter at `no` er ubevidst ubeskyttet.
- **Acceptkriterier:** 1. `❓ Til Mads` har spørgsmålet. 2. Uanset svar står der
  en linje i `IMPLEMENTATION_PLAN.md` om hvad `no` er: lanceret, lukket eller
  uafklaret. 3. Gaten grøn. **Ingen kodeændring uden Mads' svar** — lukning af
  et domæne er en domænebeslutning, ikke en refaktor.

#### 98. [ ] 2026-09-27 — C70 — `TidszoneBeregner` har intet `no`-sprog (afhænger af opgave 97)

- **Datagrund:** målt under C66. `labels` i `TidszoneBeregner.tsx` har kun `da`
  og `se`, og `const l = labels[locale] || labels.da` giver derfor **dansk** på
  beregner.no — hele værktøjet, inklusive dropdown, huskeliste, klokkeslæt og
  sommertidsnote. Usynligt i dag, fordi beregner.no 404'er på alt ud over `/`
  (opgave 97), men det er 24 timers advarsel om et dansk domæne.
- **Afhængighed:** opgave 97. Hvis svaret er "lanceres ikke", er denne opgave
  **gratuleringens fallenhed** — så er det nok at slå `no` fra i porten. Hvis
  svaret er "lanceres snart", skal `TidszoneBeregner` have et rigtigt `no`-sprog:
  `Tidssone`, `Fra tidssone`, `Timeforskjell`, `timer`, `(dagen før)`,
  `(neste dag)`, `Tidsforskjell fra Norge`, `hjemmetidssonen er Norge` — samme
  mønster som C65 gjorde for `STANDARD_APPARATER` (`navnNo` pr. post), altså
  **ikke** en `labels.no`-nøgle, fordi `by`/`navn` nu ligger i rækkerne.
- **Acceptkriterier:** hvis domænet er lukket: `isCalculatorAvailable("/tidszone", "no")`
  er `false` med en test på det. Hvis domænet er live: `TidszoneBeregner.test.tsx`
  kører i **da, se og no**, og `no`-renderet indeholder ingen danske
  `navn`/`by`-former. Gaten grøn i begge tilfælde.
- **MÅL:** ingen brugerdata endnu — beregner.no har ingen trafikmåling. Mål først
  14 dage efter en eventuel lancering.

#### 119. [BLOCKED: anden kildejerngang — Sundhedsstyrelsen svarer HTTP 429 på alle sider, så de officielle portionsværdier kan ikke citeres, og de må ikke gættes] 2026-09-29 — Kø — madvare-klyngen på "kalorier" (kræver en kilde, før den bygges)

- **Datagrund:** DA-autocomplete under "kalorier" → **9 af 10** er madvarer
  (æg, banan, vandmelon, jordbær, avocado, kirsebær, kartofler, vindruer,
  havregryn); under "kalorie indhold" → **10 af 10**; under "kalorier i æg" →
  æggehvide, æggeblomme, æggekage, æggekage med bacon, æg uden blomme,
  æggesalat, æggemad. Det er den næststørste danske klynge på ordet, og
  `/kalorier` har **0** tabeller over madvarer.
- **Hvorfor den ligger og ikke er bygget nu:** den kræver en *kildefølt*
  værdi pr. vare, og den eneste citable danske tabel kunne ikke hentes.
  Gættede kalorietal ville være præcis den fejlklasse planen fører.
- **⚠️ Kildejerngang nr. 2 (C92, 2026-09-27 15:05) — spild ikke en tredje
  iteration på de samme kilder.** Prøvet i denne rækkefølge, alle med curl
  *og* webfetch:
  | Kilde | Resultat |
  |---|---|
  | `frasco.dk` | HTTP 000, ingen forbindelse (domænet er dødt) |
  | `francofooddata.dk` + `www.` | HTTP 000 |
  | `kostviddatabase.kk.dk` (København Kommune) | HTTP 000 |
  | `kostviddatabase.dk`, `fdev.dk` | HTTP 000 |
  | Open Food Facts API (`/api/v2/search`, danske produkter) | **HTTP 503** — serveren svarer "temporarily unavailable … not available to anonymous users" |
  | da.wikipedia.org API, `Infoboks næringsindhold` | **Virker**, men kun 2 af 24 fødevarer har den: `Havregryn` (368 kcal) og `Banan`. `Kartoffel`, `Gulerod`, `Æg`, `Vindrue`, `Jordbær`, `Kirsebær`, `Avocado`, `Vandmelon`, `Kylling`, `Laks`, `Ost`, `Mælk`, `Hvedebrød`, `Smør`, `Broccoli` har **ikke** infoboksen. Kilden er desuden *Wikipedia*, ikke DTU. |
  **Konklusion:** der er ingen citable dansk tabel tilgængelig fra en agent i
  denne iteration. Wikipedia-vejen er lukket som hovedkilde (2/24) — brug den
  kun til at *krydschecke* to-tre tal, aldrig som grundlag for en tabel.
  **Ny præmis for den næste agent:** byg den **ikke** som en færdig
  madvare-tabel. (a) Få Mads til at give adgang til en kilde
  (`❓ Til Mads`), eller (b) byg i stedet det, der *kan* dokumenteres i dag:
  de danske ** portionsværdier for de fire-fem hovedgrupper** i
  Sundhedsstyrelsens kostanbefalinger (Find flere oplysninger i
  `Mål hver dag` → tallerkken og 400/600 kcal) — citable, danske, og de
  svarrer på "hvor mange kalorier skal jeg have om dagen", som er GSC's
  søgning på `/kalorier` (1 v, pos. 1).
- **⚠️ Kildejerngang nr. 3 (2026-09-29 21:35) — både (a) og (b) er lukket i denne
  iteration.** Både `webfetch` og `curl` på `sst.dk` giver **HTTP 429** (rate
  limited) på `/forbruger/kost-og-motion/tallerkenmodellen` og
  `/viden-og-raadgivning/kost-og-motion/kostanbefalinger`; `…/maaltider` er 404.
  Uden kilden kan hverken tallerkenmodellens andele eller 400/600 kcal skrives
  ned som fakta, så opgaven er `BLOCKED` indtil Mads enten giver adgang eller
  en kildefil. **C92's tabel er ikke en invitationsliste til at prøve de samme
  kilder igen.**

#### 183. [ ] 2026-09-29 — Kø — **diagnosér `/bmi`s og `/su`s fald, og find ud af hvor stor en del der er overhovedet Googles**

- **Datagrund:** Plausible 28 dage: `/bmi` 1.271 → 938 (−26 %), `/su` 220 →
  116 (−47 %). Samtidig voksede sitet **+42 %**, så faldet er relativt værre end
  26 %. Til sammenligning: `/dato` 1.110 (+77 %), `/boligstoette` 535 (+86 %),
  `/kvadratmeter` 388 (+94 %), `/rentefradrag` 331 (+145 %).
- **Den måling, der låser diagnosen:** GSC's top-15 over *visninger* ender på
  `/brok` med 4.920. **Hverken `/bmi` eller `/su` står på listen**, så begge
  har **under 4.920 Google-visninger** pr. 28 dage — mens `/bmi` har 938
  Plausible-besøgende. Det kan ikke være en ren CTR-fejl: en visning der ikke
  klikkes, ville give en *høj* CTR på den lille visningsmængde. Enten kommer
  `/bmi`s trafik i overvejende grad fra Bing/DuckDuckGo/Yahoo/direkte
  (Plausible: Bing 1.308, DDG 371, Yahoo 281, Direct 1.041 mod Google 4.089),
  eller GSC's eksport er ældre end Plausible's 28 dage.
- **Hvorfor det ikke er løst i C196:** en diagnose uden tal er gætteri, og en
  titelændring er ikke en diagnose. Det kræver ét svar fra Mads eller en
  Plausible-udtræk: **hvilke kilder kommer `/bmi` og `/su` fra, delt på
 søgemaskiner?** Uden det kan ingen af os vide om faldet er ranking, sæson
  (bmi-søgninger topper i januar) eller noget tredje.
- **Acceptkriterier:** (1) kildefordelingen for `/bmi` og `/su` står i planen,
  (2) faldet er klassificeret som ranking / sæson / CTR med et tal til hver
  mulighed, (3) hvis det er ranking, navngives konkurrenten der har taget
  pladsen. **Ingen ny kode før diagnosen står** — en tredje titelændring på
  samme side uden en diagnose er prøvet to gange.
- **MÅL:** `/bmi` 938 besøgende/28d, `/su` 116 (Plausible 2026-09-29).


#### 187. [ ] **IKKE FØR 2026-10-13** 2026-09-30 — Kø — **migrér beraknare.se til svenske URL-slugs med 301**

- **Datagrund:** opgave 185 (lukket 30/9, se `docs/plan-arkiv.md`). 82 sider har
  danske slugs (`/dato`, `/tidsberegner`, `/nedtaelling`, `/renteberegner`) men
  svenske titler. 160.000+ GSC-visninger på 0,1–0,2 % CTR. Alle svenske
  konkurrenter bruger svenske slugs: `kalkylverket.se/dagar-mellan-datum`,
  `kalkylator.info/tidskalkylator`, `timraknare.com/tidskalkylator`. Svenske
  brugere søger "dagar mellan datum" (850 v, pos 8) og ser URL'en `/dato`.
  **Svar på 185s spørgsmål: slugs er en medvirkende årsag, ikke eneste.**
- **Hvorfor den venter til 13/10:** C195/C196's svenske titler deployer 30/9
  07:30, og 185 skrev selv at slugs først er hypotesen *hvis* titlerne ikke flytter
  CTR. At migrere 82 URL'er *før* den måling ville både tage risikoen ved en
  unødigvis migration og ødelægge attributionen på titelændringerne. **Derfor:
  ingen nye title/description-ændringer på beraknare.se før 13/10.**
- **Teknisk forudsætning, fundet 30/9 (ikke løst i opgaven):** en ren
  middleware-rewrite er **ikke** nok. `beraknare.se/tidskalkylator` rewrite'et
  til den interne `/tidsberegner`, men canonical dannes af den interne rute, så
  siden ville servere `canonical: …/tidsberegner` — en URL der 301'er tilbage
  til `/tidskalkylator`. Det er en redirect-loop for crawlere, ikke en migrering.
  Løsningen er enten ægte ruter pr. domæne (nye `page.tsx` pr. slug) eller
  canonical, der læser domænet fra et request-header. Begge kræver at alle 142
  sider er statiske i dag — en header-læsning gør dem dynamiske, så vælg den
  ægte rute.
- **Prisliste:** `calculator-list.ts` (tilføj `seHref`), `routing.ts`, `sitemap.ts`,
  `middleware.ts`, `page-data.ts`, `internal-links.test.ts`, IndexNow. 2–3
  iterationer.
- **Acceptkriterier:** (1) svenske slugs med 301 fra de danske, kun på
  beraknare.se, (2) canonical + hreflang peger på den svenske URL, (3) sitemap
  og IndexNow sender nye URLs, (4) gaten grøn, (5) ingen trafiktab målt før mod
  efter 14 dage.
- **MÅL:** beraknare.se 537 besøgende/28d; `/dato` 95 klik, `/tidsberegner` 127
  klik, `/procent` 2 klik (GSC 2026-08-30 → 2026-09-27). Genmål 2026-10-13.

## ❓ Til Mads

- ❓ **IndexNow mangler en krog efter deploy (ny, 30/9).** Bing, DuckDuckGo og
  Yahoo står for ~1.960 af 7.319 besøgende/28d, og IndexNow får ændringer ind
  på minutter i stedet for dage. Koden kan skrives i dag, men **noget skal
  kalde den efter et vellykket deploy** — og det er batch-deployeren, ikke mig:
  Jeg må ikke trigge deploys og kan ikke se, hvordan den er sat op. Skal jeg
  skrive `npm run indexnow` ind i `.dokploy/preview.template.json`, eller kører
  du kommandoen manuelt efter en batch?
- ❓ **Fulde browsermålinger kræver Playwright (ny, 30/9).** Deploy-noter der
  kræver en rigtig browser kan ikke lukkes maskinelt: repoet har ingen
  Playwright, og `CLAUDE.md` forbyder nye afhængigheder uden dit ja. Uden det
  bruger jeg jsdom-render (som med C55/C56/C60), der dækker logikken men ikke
  layout, breakpoints eller mørk tilstand.
- ❓ **Kilde til madvaretabellen (opgave 119, `BLOCKED`).** `sst.dk` svarer HTTP 429
  for både browser og curl, og de fire andre danske kilder døde i C92. Enten en
  PDF af *De officielle kostanbefalinger* lagt i repoet, eller en API-nøgle til en
  dansk næringsindholdstabel, så kan `/kalorier` få pr. 100 g **og** pr. portion.
  Uden det bliver madvare-klyngen (9 af 10 danske autocomplete-træffere under
  "kalorier") liggende, selv om `/kalorier` har 289 besøgende/28d og +50 %.
- ❓ **Hvilke søgemaskiner kommer `/bmi` og `/su`s trafik fra?** (opgave 183.)
  Eneste måde til at diagnosticere de to sides fald. `/bmi` har 938 besøgende/28d
  men under 4.920 Google-visninger, så mindst halvdelen er ikke Googles — et
  skærmbillede af Plausible's kilder filtreret på de to sider (eller et
  råudtræk) låser diagnosen. Uden det bliver faldet uforklarligt, og C196's
  titelændring kan heller ikke måles.
- ❓ **`AFHAENGIGHEDER.md`'s række for `beregner-dk` er delvis forældet.** Den
  siger "kritiske sårbarheder" og "mangler engines-erklæring". Sikkerhedsdelen er
  nu lukket (C197, `npm audit` 1 høj → 0), og runtime-kravet *er* erklæret:
  `engines.node ">=22 <23"`, `.nvmrc` = 22, `Dockerfile` på `node:22-alpine`.
  Jeg har kun verificeret denne ene række og ikke rørt filen, fordi den er fælles
  for otte projekter — en opdatering skal laves med vilje, ikke ved en
  sideeffekt.
- ❓ **21:30-batchen 2026-09-29 kørte og lagde alt efter `c6c0079` live** — alle
  seks åbne noter er lukket på indhold (se `docs/plan-arkiv.md`). Ingen
  `DEPLOY-MISSING`. Kun C194/C195/C196 venter på 2026-09-30 07:30.
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
