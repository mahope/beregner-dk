# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — 30/9 15:10. Elleve af tolv deploy-noter er lukket på indhold;
`/alders` venter stadig på vinduet 17:30, og blog-noten fra i går venter
med på samme vindue.

**Nyt i denne iteration:** `/boligstoette` er sitets bedst rangerende side i
forhold til sit CTR (2,4 %), men lå på position 10-13 for *sine egne* ord,
fordi hverken titel eller `<h1>` brugte "beregn" — dens største søgning. Se
opgave 203. De elleve lukkede noter er verificeret på indhold, ikke på
HTTP 200; målingerne står i `docs/plan-arkiv.md`.

**⚠️ 12:30-batchen kørte UDEN de otte dengang ventende ændringer.** Alle otte var
merged før 12:18. Kl. 14:12 er **elleve af dem live** — 12:30-batchen må altså
have dækket dem alligevel, så ingen `DEPLOY-MISSING`. Kun `/alders`-noten
(merged 13:43, efter batchen) venter stadig på **17:30**.

**⚠️ Målerfælde fra denne iteration (samme klasse som C70's).** Under
`npm run test` skriver `locale-leak-gate.test.ts` med vilje en dansk streng ind
i `src/app/procent/page.tsx`, kører scanneren og hævter at den **bliver**
fundet (`page.test.tsx`-scenen "flags Danish copy that ends in a {…}
interpolation"). Rækkefølgen `npm run test` → `locale-leak --gate` giver derfor
en `FEJL: 1 ureviewet(e)`-linje med `procent/page.tsx:339`, der ser ud som et
fund i denne iterations diff. Det er den **gamle kode**, og filen er
restoreret bagefter (`git status` ren). Kør gaten separat.

**Generelt om gaten:** `REVIEWED`-poster i `scripts/locale-leak.mjs` er
nøglet på **fil + linjenummer**, så enhver redigering i `page-data.ts` kan
fjerne en godkendt post. Ikke opdaget i denne iteration (6 linjer for 6 linjer),
men en reel fælde for næste agent der tilføjer linjer i den fil.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 623 filer
npm run test     # vitest run            — 3172 tests / 193 filer
npm run build    # next build            — 142 sider
node scripts/locale-leak.mjs --gate       # exit 0
```

Sidens tekst kan regnes pr. request: `getPageData` løser `/alders
{ALDER}`-pladsholdere ved hvert kald (se `src/lib/alder-side-tekst.ts`), så
et alders-tal i et snippet følger dagen. Dagens dato læses i sidens egen
tidszone via `iDagISidensTidszone` — `tilIsoDato(new Date())` læser
*serverens* tidszone og er et døgn bag mellem 00:00 og 02:00 dansk tid.

`tsc --noEmit` er **ikke** del af gaten: 72 kendte forhåndsfejl, alle i
`*.test.ts(x)` (målt 30/9; 33 i `dage-til.test.ts`, 14 i
`dage-til-routes.test.tsx`, resten spredt) og **0 i ikke-test-filer**. Opgave
202 fjernede de 2 her: `scannedPages` og `candidatesFromPages` blev brugt i
`locale-leak-gate.test.ts` uden at stå i returtypen (74 → 72).
Alle fire var grønne før merge 2026-09-30 07:45.

## Åbne VERIFICÉR DEPLOY-noter

**Én note åben.** HTTP 200 beviser intet: noterne rører `<title>`, `<h1>`,
JSON-LD eller nye URL'er, og tidszone-noten forventer et **uændret** tal.
Fulde tekster med alle målinger og kontroller står i `docs/plan-arkiv.md`.

De elleve lukkede noter er verificeret 30/9 14:12 på indhold (se arkivet for
hver sides måling). `/alders`-noten er den eneste der stadig er åben, fordi
den blev merged 13:43 — efter 12:30-batchen.

- ⏳ **`/alder`s snippet skal vise dagens alder, ikke 25. september.**
  `ceo/alder-levende-snippet`. Skal have "pr. 30. september 2026" og
  "36 år, 6 måneder og 15 dage" (da) / "per 30 september 2026" + "36 år, 6
   månader och 15 dagar" (se). Ingen `{ALDER}`-pladsholdere i HTML'en.
   Målt 14:12: beskrivelsen siger stadig "pr. 25. september 2026" — korrekt,
   fordi den ikke er live endnu. Vindue **17:30**.

### Ny note fra denne iteration

- ⏳ **Syv blogindlæg skal slutte med deres beregner.** `ceo/blog-naeste-handling`.
  `/blog/arveafgift-regler-og-satser` → `/arveafgift`, `hvordan-beregner-man-moms`
  → `/moms`, `hvad-er-klokken-i-usa-naar-den-er-12-i-danmark` → `/tidszone`,
  `30-procent-reglen-husleje` → `/husleje`, `bmi-for-boern-saadan-tjekker-du` →
  `/bmi`, `guide-feriepenge-hvornaar-og-hvor-meget` → `/dato`,
  `pension-hvor-meget-skal-du-spare-op` → `/pension`. Kontrol på indhold:
  hver side skal have "Regn det ud" **før** "Relaterede artikler", og
  `/moms` skal have **0** forekomster af den gamle CTA-løsning. Målt 15:00:
  de fire kontrollerede sider har `regn=0`, altså endnu ikke live. Vindue
  **17:30**.

### Ny note fra denne iteration

- ⏳ **`/boligstoette` skal ramme sin egen største søgning i titlen.**
  `ceo/boligstoette-titel`. Titlen skal være **"Beregn boligstøtte 2026:
  standardmaksima og formue"** i `<title>`, `<h1>`, `og:title` og
  `description`, og beskrivelsen skal stadig sige "Vejledende — fortsæt hos
  Udbetaling Danmark". Siden skal **stadig** have **0** forekomster på
  "Boligstøtteberegner" — det er en korrekthedslås, ikke en fejl.


## Åbne opgaver

#### 203. [x] ✅ 2026-09-30 — `/boligstoette` lå på position 10-13 for sine egne ord

- **Lukket 30/9** på `ceo/boligstoette-titel`. Målinger, klassen af fund og
  portteksten ligger i `docs/plan-arkiv.md`.
- **Datagrund:** GSC 2026-08-31 → 2026-09-28: `/boligstoette` 7.465
  visninger / 176 klik / **CTR 2,4 %** / pos. **8,7** — sitets *bedste* CTR.
  Plausible 529 besøgende/28d (+78 %). Dens egne søgninger: "beregn
  boligstøtte" **900 v, pos 10**, "boligstøtte beregner" 282 v, pos 13.
- **Fundet:** titel, `<h1>`, `og:title` og `description` sagde
  "Boligstøtte 2026: Standardmaksima, formue og beregning". Ordet **"beregn"
  stod ingen steder på siden** (0 forekomster, målt på den renderede HTML),
  selv om det er hovedordet i sidens største søgning. Nu: "Beregn boligstøtte
  2026: standardmaksima og formue".
- **Datagrænsen, og hvorfor hypotesen ikke er stærkere end den er:** de elleve
  andre top-sider har *alle* "beregner"/"beregn" i `<h1>`, så mønstret så
  stærkt ud. Men `/kalorier` har "Kalorieberegner" i h1 *og* titel og ligger
  stadig på **pos 18**, så "<h1> med hovedord → god placering" er **kun en
  hypotese, ikke en lov**. Rettelsen er derfor begrænset til det
  ubestridelige: siden skal kunne svare på sin egen største søgning. Om det
  flytter positionen, måles efter 14 dage — det er ikke påstandt her.
- **MÅL:** `/boligstoette` 7.465 visninger / 176 klik / CTR 2,4 % / pos. 8,7;
  "beregn boligstøtte" 900 v pos 10 (GSC 2026-08-31 → 2026-09-28).
  Genmål 14 dage efter at den er live.

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

#### 201. [x] ✅ 2026-09-30 — `/alder`s snippet havde et frosset alders-tal, der blev dagsvis forkert

- **Lukket 30/9** på `ceo/alder-levende-snippet`. Målinger, de to ting
  rettelsen afslørede (tabellens billedtekst løj om at være "eksemplet i
  beskrivelsen"; Excel-eksemplet blandede DATEDIF's `M` med resten af
  årene) og hele portteksten ligger i `docs/plan-arkiv.md`.
- **Kort fortalt:** `{ALDER}`/`{DATO}`-pladsholdere i `page-data.ts` løses nu
  i `getPageData` ved hvert kald af `alderLevet` og `foedselsaarRaekker` —
  samme moduler som værktøjet bruger. Datoen læses i sidens egen tidszone.
  Før: "10 dage … 13.343 dage pr. 25. september 2026". Nu: "15 dage …
  13.348 dage pr. 30. september 2026".
- **MÅL:** `/alder` 7.909 visninger / 39 klik / CTR 0,5 % / pos. 7,5
  (GSC 2026-08-31 → 2026-09-28). Genmål 14 dage efter at den er live.

#### 202. [x] ✅ 2026-09-30 — de otte mest besøgte blogindlæg sluttede på en artikel, ikke på værktøjet

- **Lukket 30/9** på `ceo/blog-naeste-handling`. Otte artikler havde
  `NaesteSkridt` (barsel, børnepenge, fradrag, su, boligstøtte, kvadratmeter,
  brændstof, dagpenge); **19 af 27 gjorde ikke**. De syv mest besøgte uden
  er rettet nu.
- **Datagrund:** `/blog/arveafgift-regler-og-satser` faldt 100 → 84
  besøgende/28d — det største fald på sitets blogliste, og artiklen linkede
  til `/arveafgift` i løbende tekst uden at næste handling pegede derhen.
  Blog-bounce er desuden målt til 84-85 % på de største artikler mod 2-7 %
  på selve beregnerne.
- **De syv:** `arveafgift` → `/arveafgift`, `hvordan-beregner-man-moms` →
  `/moms`, `hvad-er-klokken-i-usa…` → `/tidszone`, `30-procent-reglen-husleje`
  → `/husleje`, `bmi-for-boern…` → `/bmi`, `guide-feriepenge…` → `/dato`,
  `pension-hvor-meget…` → `/pension`. Hver CTA peger på den beregner artiklen
  allerede nævner i teksten, så intet er opfundet.
- **Endnu 12 artikler mangler** samme behandling (biloekonomi, boliglaan,
  boligsalg, elpriser, guide-til-laan-og-renter, koeb-af-bolig, leasing,
  maanedsbudget, privatoekonomi, reelle-timeloen, timepris, skat-2026,
  hvordan-beregner-man-moms er gjort). Næste iteration tager de otte mest
  besøgte; samme mønster, samme komponent.
- **MÅL:** `/blog/arveafgift-regler-og-satser` 84 besøgende/28d (fald fra
  100), `/blog/boligstoette-2026-nye-regler` 67, `/blog/boernepenge-2026-satser-
  og-regler` 36 klik (GSC 2026-08-31 → 2026-09-28). Genmål 14 dage efter at
  den er live. Effekten ses som **flere sidevisninger pr. artikel** (bloggen
  skal sende trafik videre) og lavere bounce, ikke som nye klik på artiklen.

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
