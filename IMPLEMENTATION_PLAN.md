# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — **`/dage-til/2-pinsedag` og `/dagar-till/pingstdagen`.**
"Pinse" er den næste målte klynge efter kristi himmelfart, og den låste sig
på en **forskelsdag**: dansk tæller til 2. pinsedag (mandagen), svensk til
pingstdagen (søndagen), fordi hver lovens liste peger på en anden dag.

**Mål:** 0 klik i dag, begge URL'er nye. Genmål **2027-05-20** (sæsonen er
maj–juni; en nedtælling er mest værd at klikke i måneden før).

**Alle ti tidligere deploy-noter er lukket `DEPLOY OK 2026-09-30`.** Fire nye
noter åbne, vindue 30/9 12:30.

**Færdige i dag:** 209 + 210 + 211 + de otte CEO-fund fra 29/9 (verificeret
i koden i denne iteration, ikke kun noteret: valborg 30. april, svensk
påskafton lørdag, dansk sankthans fast 23./24. juni, `toUtcMidnight` i
`Europe/Copenhagen`, påskeaften-FAQ'en erstattet af langfredag-siden,
svensk promille-FAQ genereret fra egen formel, `maneder: 12`, 1. advent
27/11–3/12, husleje → nettoprisindeks).

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 618 filer
npm run test     # vitest run            — 3106 tests / 190 filer
npm run build    # next build            — 142 sider
node scripts/locale-leak.mjs --gate       # exit 0
```

`tsc --noEmit` er **ikke** del af gaten: 72 kendte forhåndsfejl, alle i
`*.test.ts(x)` (målt 30/9; 33 i `dage-til.test.ts`, 14 i
`dage-til-routes.test.tsx`, resten spredt) og **0 i ikke-test-filer**. Opgave
202 fjernede de 2 her: `scannedPages` og `candidatesFromPages` blev brugt i
`locale-leak-gate.test.ts` uden at stå i returtypen (74 → 72).
Alle fire var grønne før merge 2026-09-30 07:45.

## Åbne VERIFICÉR DEPLOY-noter

Fem noter. HTTP 200 beviser intet: fire rører `<title>` og `<h1>` på én side,
og pinse-noten opretter to URL'er.

- ⏳ **VERIFICÉR DEPLOY: `/dage-til/2-pinsedag` og `/dagar-till/pingstdagen`
  skal begge svare med hver sin dag — dansk +50, svensk +49 efter påskedag.**
  Kode + plan i ét squash-commit på `ceo/pinse`. Første kandidatvindue
  **2026-09-30 12:30**. Rørte filer: `src/lib/dage-til.ts` (**ét event**
  `pinse` med 5 fakta + 5 FAQ pr. sprog, **begge** arme) og
  `src/lib/dage-til.test.ts` (**+16 tests**). Ingen eksisterende beregning
  rørt, ingen UI, ingen ny `kind` (ankeret er den eksisterende
  `easterOffset`), ingen ny afhængighed; sitemap, lister og breadcrumb kommer
  fra de eksisterende lister. Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `https://minberegner.dk/dage-til/2-pinsedag` skal have **"Hvor mange dage
     er der til 2. pinsedag?"** i `<h1>` og `<title>` med dage-tal, og
     brødteksten skal sige **"25. maj"** og **"12. maj (2008)"**.
  3. `https://beraknare.se/dagar-till/pingstdagen` skal have **"Hur många dagar
     är det till pingstdagen?"** og brødteksten **"24 maj"**.
  4. **Kontrol — forskelsdagen:** de to sider skal give **forskellige** datoer
     på samme dag. `/dato` liste skal have `/dage-til/2-pinsedag` blandt de 19
     rækker.
  **Kontrol:** de 18 andre dage-til-siders titler uændrede, og ingen danske
  strenge lækker til beraknare.se (porten kører `locale-leak.mjs --gate`).
  **Målt før merge:** titlerne 48 (da) og 49 (se) tegn @ 365 dage mod grænsen
  60. **Gate grøn:** lint (**618 filer**), **3106 tests / 190 filer** (fra
  3088), build (**142 sider**), `locale-leak.mjs --gate` exit 0. De 16 nye
  tests **falder mod master's `dage-til.ts`** (verificeret med
  `git checkout master --`: **16 fejl**).
  **⚠️ Falsk påstand fanget i egen diff (fejltype 11):** første udkast sagde
  "mellem 30. maj (2050) og 4. juni (1990)". Målingen havde sammenlignet
  **hele datoer**, så den fandt bare det første år i løkken; portens
  måned-dag-sammenligning (`slice(5)`) fandt de rigtige kanter **12. maj (2008)
  og 14. juni (2038)**. Rettet i begge sprog og låst i testen — samme
  fælde som C81's titelport, bare på datoer.

- ⏳ **VERIFICÉR DEPLOY: juleaftens spørgsmål skal have både ordet og datoen
  uden at overskride Googles 60-tegns-grænse ved tre-cifrede dag-tal.** Kode +
  plan i ét squash-commit på `ceo/juleaften-titellaengde`. Første
  kandidatvindue **2026-09-30 12:30**. Rørte filer: `src/lib/dage-til.ts`
  (**én streng** + kommentar) og `src/app/dage-til-routes.test.tsx` (**+31**).
  Ingen `<h1>`-ændring ud over `copy.question` (samme felt bruges begge steder),
  ingen ny URL, ingen sitemap, ingen beregningslogik, ingen `se`-ændring. Det
  var et **review-fund** (HØJ, 30/9): `cf0a355` satte spørgsmålet til 52 tegn, så
  titlen blev 60 ved to-cifrede dage men **61 ved tre-cifrede** — og 24. december
  er fast, så det er 61 fra 15/9 til 31/12 hvert år, altså lige i julehandlen.
  Google klipper da dage-tallet af, som er den del der adskiller siden fra de
  andre. Nye streng: "Hvor mange dage er der til juleaften 24. december?" (50
  tegn → 58/59 med dage-tal). Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `https://minberegner.dk/dage-til/juleaften` skal have **"Hvor mange dage er
     der til juleaften 24. december?"** i `<title>`, `<h1>` og `og:title`.
  3. Samme sides `<h1>` skal være læselig (den er spørgsmålet, ikke bare datoen).
  4. `/datos` ankertekst "…til juleaften 24. december?" skal være med.
  **Kontrol:** de 16 andre dage-til-siders titler uændrede, og
  `https://beraknare.se/dato` uændret. Målt før merge: 58 tegn @ 88 dage, 59 @
  357 og 366 (grænsen 60). **Gate grøn:** lint (**618 filer**), **3039 tests /
  190 filer** (fra 3038), build (**142 sider**), `locale-leak.mjs --gate`
  exit 0. De tre nye assertions **falder mod master's `dage-til.ts`**
  (verificeret med `git stash`: 3 fejl, bl.a. "expected 61 to be less than or
  equal to 60"), og porten kører nu hele året (8 datoer) i stedet for én valgt,
  så den kan ikke være grøn med fejlen i igen.

- ⏳ **VERIFICÉR DEPLOY: `/dage-til/efteraarsferien` skal svare med uge 42 og
  tælle til den første skoledag.** Kode + plan i ét squash-commit på
  `ceo/efteraarsferien-uge42`. Første kandidatvindue **2026-09-30 12:30**.
  Rørte filer: `src/lib/dage-til.ts` (**ny `kind: "efteraarsferie"`**,
  `isoUgeMandag()`, ét event med 4 fakta + 5 FAQ) og `src/lib/dage-til.test.ts`
  (**+141**). Ingen eksisterende beregning rørt, ingen UI, ingen `<h1>`-ændring,
  ingen ny afhængighed; sitemap, interne kryslink og breadcrumb kommer fra de
  eksisterende lister. Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `https://minberegner.dk/dage-til/efteraarsferien` skal have
     **"Hvor mange dage er der til efterårsferien?"** i `<h1>` og
     `<title> = "Hvor mange dage er der til efterårsferien? 12 dage"**.
  3. Samme sides brødtekst skal sige **"12. oktober 2026"** og **"uge 42"**.
  4. `/datos` (ikke `/dato`) liste skal have `/dage-til/efteraarsferien` blandt
     de 16 rækker — den kommer fra `getDageTilEvents`, samme liste som resten.
  **Kontrol:** `https://beraknare.se/dagar-till/efteraarsferien` skal svare
  **404** — den svenska lagen har ingen national ferieuge, så siden er dansk
  alene, ligesom `/dage-til/sommerferien` allerede er det.
  **Gate grøn:** lint (**618 filer**), **3054 tests / 190 filer** (fra 3039),
  build (**142 sider**), `locale-leak.mjs --gate` exit 0. De nye tests
  **falder mod master's `dage-til.ts`** (verificeret med `git stash`:
  **14 fejl**). ISO-ugereglen er verificeret over **61 år** (1990-2050), ikke på
  tre valgte år, og `fakta`-teksten er låst til de tal koden selv regner.

- ⏳ **VERIFICÉR DEPLOY: `/dage-til/skolestart` skal svare med 1. august og
  tælle til næste års skolestart.** Kode + plan i ét squash-commit på
  `ceo/skolestart`. Første kandidatvindue **2026-09-30 12:30**. Rørte filer:
  `src/lib/dage-til.ts` (**ét event** med 4 fakta + 5 FAQ) og
  `src/lib/dage-til.test.ts` (**+192**). Ingen eksisterende beregning rørt, ingen
  UI, ingen `<h1>`-ændring, ingen ny `kind` (ankeret er den eksisterende
  `fixed` 1. august), ingen ny afhængighed; sitemap, `/datos`-liste og
  breadcrumb kommer fra de eksisterende lister. Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `https://minberegner.dk/dage-til/skolestart` skal have
     **"Hvor mange dage er der til skolestart?"** i `<h1>` og
     `<title> = "Hvor mange dage er der til skolestart? 305 dage"`.
  3. Samme sides brødtekst skal sige **"1. august"** og **"uge 31"** (2026) /
     **"uge 30"** (2027).
  4. `/datos` liste skal have `/dage-til/skolestart` blandt de 17 rækker.
  **Kontrol:** `https://beraknare.se/dagar-till/skolestart` skal svare **404** —
  det svenska skolåret har ingen national dato, så siden er dansk alene,
  ligesom `/dage-til/sommerferien` og `/dage-til/efteraarsferien`.
  **Gate grøn:** lint (**618 filer**), **3070 tests / 190 filer** (fra 3054),
  build (**142 sider**), `locale-leak.mjs --gate` exit 0. De 16 nye tests
  **falder mod master's `dage-til.ts`** (verificeret med `git checkout master
  --`: **14 fejl**). Ugedage, ISO-uger og ferieafstande er verificeret over
  **61 år** (1990-2050), ikke på tre valgte år.
  **⚠️ Falsk påstand fanget i egen diff (fejltype 11):** første udkast sagde
  "5 til 6 uger fra sommerferiens start til 1. august". Målt over 1990-2050 er
  spændvidden **32 til 38 dage** (sidste lørdag i juni falder så sent som
  30. juni), altså 4,6-5,4 uger — teksten var **for lang** på den lave ende.
  Rettet til "32 til 38 dage" og porten dækker nu hele året.

- ⏳ **VERIFICÉR DEPLOY: `/dage-til/kristi-himmelfartsdag` og
  `/dagar-till/kristi-himmelsfardsdag` skal begge svare med påskedag + 39
  dage.** Kode + plan i ét squash-commit på `ceo/kristi-himmelfartsdag`. Første
  kandidatvindue **2026-09-30 12:30**. Rørte filer: `src/lib/dage-til.ts`
  (**ét event** med 4 fakta + 5 FAQ pr. sprog, **begge** arme) og
  `src/lib/dage-til.test.ts` (**+236**). Ingen eksisterende beregning rørt, ingen
  UI, ingen ny `kind` (ankeret er den eksisterende `easterOffset`), ingen ny
  afhængighed; sitemap, `/dato`-liste og breadcrumb kommer fra de eksisterende
  lister. Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `https://minberegner.dk/dage-til/kristi-himmelfartsdag` skal have
     **"Hvor mange dage er der til kristi himmelfart?"** i `<h1>` og
     `<title> = "Hvor mange dage er der til kristi himmelfart? 218 dage"**.
  3. Samme sides brødtekst skal sige **"6. maj"** og **"14. maj"** (2026) /
     **"25. maj"** (2028).
  4. `https://beraknare.se/dagar-till/kristi-himmelsfardsdag` skal have
     **"Hur många dagar är det till kristi himmelsfärd?"** og det samme svar.
  5. `/dato` liste skal have `/dage-til/kristi-himmelfartsdag` blandt de 18
     rækker.
  **Kontrol:** de 17 andre dage-til-siders titler uændrede.
  **Gate grøn:** lint (**618 filer**), **3088 tests / 190 filer** (fra 3070),
  build (**142 sider**), `locale-leak.mjs --gate` exit 0. De nye tests
  **falder mod master's `dage-til.ts`** (verificeret med `git checkout master
  --`: **16 fejl**).


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

#### 183. [BLOCKED: afventer Mads' svar på kildespørgsmålet fra 27/9 — spørgsmålet står i ❓ Til Mads, og opgaven siger selv "ingen ny kode før diagnosen står". Ikke prøvet igen: ingen ny måling i denne iteration kan erstatte svaret] 2026-09-29 — Kø — **diagnosér `/bmi`s og `/su`s fald, og find ud af hvor stor en del der er overhovedet Googles**

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
- **⚠️ 30/9: fundet i side-konteksten, uden ny kode.** Målt på det *live* site:
  `/bmi` og `/su` er begge sunde — canonical til sig selv, `robots
  index,follow`, hreflang `da` + `x-default`, `WebApplication` + `FAQPage` +
  `BreadcrumbList`, og begge står i sitemap.xml (136 `<loc>`). Så faldet er
  **ikke** teknik. Samme billede som `/procent` (C200, lukket): 150.148 GSC-
  visninger, **98 klik**, altså CTR 0,07 % på 150.148 visninger — langt under
  det niveau hvor en rankingeringsfejl forklares. Mønstret på hele sitet er
  det samme: **GSC's visninger ligger langt over Plausible's besøgende, og
  forskellen er ikke-klikket Google-trafik.** Det peger på én fælles årsag
  (snippet/intention), ikke på to separate sidefejl — men at *finde* den kræver
  stadig kildefordelingen fra Mads, så opgaven står.

#### 211. [x] 2026-09-30 — trafik — **"hvor mange dage er der til pinse" er den næste målte klynge** — løst på `ceo/pinse`

- **Datagrund:** dansk autocomplete under "hvor mange dage er der til pinse"
  (30/9 09:0x) giver fire træffere: "hvor mange dage er der til pinse",
  "hvor mange dage er der fra påske til pinse", "hvor mange dage er der i
  pinsen" og "hvor mange dage er pinse efter påske". **Ingen af dem er dækket.**
  Svensk autocomplete under "när är pingstdagen" har årstal-varianter
  ("…2026", "…2025", "…2027"), så den arm er bygget på målt efterspørgsel.
- **⚠️ PRÆMIS KORRIGERET — planen troede, at "pinse" er målbart som
  pinsedag-mod-2.-pinsedag. Det er den ikke, og autocomplete kan ikke løse
  det:** "hvor mange dage er der til pinsedag" og "…til 2 pinsedag" giver
  **nul** træffere, kun den nøgne "pinse" har søgning. To målinger låste den
  i stedet:
  1. **Helligdagsstatus kan ikke skelne.** da.wikipedia (hentet 30/9): "Såvel
     pinsedag som den følgende dag, anden pinsedag er i Danmark helligdage."
     Begge er altså helligdage — planens antagelse, at kun mandagen er det,
     var **forkert**.
  2. **Autocomplete-klyngen gør det.** Under "2. pinsedag 2026" er alle ti
     træffere **praktiske** (`fri`, `fridag`, `dato`, `helligdag`,
     `royal run`, `danmark`), mens den nøgne "pinsedag"-klynge er
     **sammenlignende** (`… i sverige`, `… i tyskland`, `… i spanien`,
     `… i norge`). Folk der tæller dage vil have mandagen.
- **Resultatet er derfor en forskelsdag, ikke to oversættelser:** dansk
  `/dage-til/2-pinsedag` tæller til **påskedag + 50** (mandagen), svensk
  `/dagar-till/pingstdagen` til **+ 49** (søndagen). Det er ikke en
  oversættelsesfejl: riksdagens lagtext **1989:253** §1 räknar `pingstdagen`
  som allmän helgdag, §2 definerar den som "sjunde söndagen efter påskdagen",
  og listen har `annandag påsk` men **ingen** allmän helgdag för måndagen
  efter pingstdagen. Sverige fejrer søndagen, Danmark fejrer mandagen.
- **Acceptkriterier, alle opfyldt:** 1. begge sider svarer i `<title>` og
  `<h1>`, brødteksten låst til de tal koden regner. 2. Verificeret over **61
  år** (1990-2050): 2. pinsedag er mandag 61/61 gange, pingstdagen er
   søndag 61/61 gange, afstande 11/10 til kristi himmelfart hvert år, ISO-uge
   20-24 (da) og 19-23 (se). 3. Titlerne 48/49 tegn @ 365 dage. 4. Gaten
   grøn (3106 tests fra 3088).
- **MÅL:** 0 klik i dag. Genmål **2027-05-20**.

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

#### 212. [ ] 2026-09-30 — trafik — **de to *interval*-spørgsmål i pinse-klyngen er stadig ubesvarede**

- **Datagrund:** samme måling som 211. Dansk autocomplete under "hvor mange
  dage er der til pinse" har fire træffere, og 211 dækker den nøgne "pinse".
  De to **øvrige** er interval-spørgsmål, ikke nedtællinger, og ingen side
  svarer på dem: "hvor mange dage er der **fra påske til pinse**" og "hvor
  mange dage er der **i pinsen**".
- **Hvorfor de ikke er dage-til-sider:** de spørger om et *interval* (påske →
  pinse = 49 dage til pinsedagen, 50 til 2. pinsedag; pinsen som periode er
  den 50. dag efter påskedagen), og en nedtælling til et tal der altid er
  det samme, er det forkerte værktøj. `/dato` er den rigtige flade — den
  har allerede fritekst til intervaller mellem to datoer.
- **⚠️ Ikke bygge som endnu en dage-til-side.** At lave `/dage-til/fra-paske-
  til-pinse` ville svare "49 dage" hele året og se ud som nedtælling. Det er
  den fejlklasse 210/211 netop undgik.
- **Mulig løsning (kun efter et måltal):** et kort, ægte afsnit på `/dato`
  der besvarer begge med tal koden regner, plus intern link til
  `/dage-til/2-pinsedag` og `/dagar-till/pingstdagen`. **Ingen ny URL.**
- **Acceptkriterier:** (1) begge spørgsmål besvaret synligt på `/dato` med tal
  fra samme kilde som beregningen, (2) link til begge pinse-sider, (3) ingen
  tekst der kan glide fra regnestykket, (4) gaten grøn.
- **MÅL:** `/dato` 1133 besøgende/28d, bounce 4 % (Plausible 2026-09-30), og
  GSC 133.054 visninger / 842 klik / CTR 0,6 % / pos. 5,7 (2026-08-31 →
  2026-09-28). Genmål 14 dage efter merge.

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
