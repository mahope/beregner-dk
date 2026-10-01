# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — 1/10 12:05. **Svensk `/dato` fik månedens eget afsnit, og fire
  bøjningsfejl rettet** (opgave 205, `ceo/dato-svensk-maaned`).

  beraknare.se/dato er næststørste asset (GSC 103.776 visninger, 97 klik, CTR
  0,1 %, pos. 8,1) og to af fire største søgninger er «antal dagar i en
  månad»/«hur många dagar i en månad». Blokken lå indeni
  `{locale === "da" && (`; `denneMaanedEksempel`/`maanedNavn` fandtes
  allerede på svensk. Undervejs fandt fire bøjningsfejl, alle synlige 30/12:
  «1 dage tilbage» + «1 dage» (da), «1 dagar kvar» + «1 dagar» (se) —
  samme klasse som e6f4f0e, der kun rettede den ene sætning.

  **Port:** 14 tests på renderet markup, begge sprog, med uret på de datoer
  hvor tallet er 1. **5 mutationer målt røde**, begge veje (også når den
  overbøjes til altid «dag»). Testtal 3333 → **3345**.

  **Gaten:** `lint` 0 (640) · `typecheck` 0 · `TZ=UTC npm run test`
  **3345 grønne / 204 filer** · `locale-leak --gate` exit 0 · `next build`
  138 ruter. CI på `master` grøn ved start (36840363481).

  **Åbne noter: 9** — otte med vindue **1/10 12:30** + Sentry-noten.
  **Blokeret på Mads:** 97, 119, 183, 201, F1, F5 + Sentry-spørgsmålet.

  **⚠️ Målerfælde:** `npm run test` kører `locale-leak-gate.test.ts`, der med
  vilje planterer lækager — `FEJL: n ureviewet(e)` er derfor **ikke** fund i
  din diff. Gaten: `node scripts/locale-leak.mjs --gate` (exit 0).

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv her til næste måling)

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
| se `/dato` | 133 | 101.580 | 0,1 % | 8,2 |
| se `/tidsberegner` | 167 | 61.934 | 0,2 % | 8,0 |
| se `/procent` | under top-15 | 26.933 | 0,0 % | 9,9 |

Site: minberegner.dk 7.421 besøgende/28d (+42 %), ~600.000 GSC-visninger pr.
måned. Kilder: Google 4.170, Bing 1.319, DDG 378, Yahoo 274 — **1.971 af 7.319
(27 %) kommer fra søgemaskiner der ikke er Google.**

### Den faktiske flaskehals

CTR følger **ikke** position — se fundet i STATUS 1/10 06:35. `/boligstoette`
har 2,4 % CTR på pos. 8,7 mod `/procent`s 0,1 % på pos. 7,4. Det er 24x
forskel på næsten samme placering, samme site, samme måned. Vi ligger
**på position 5-8 på 600.000 visninger**, men positionen er ikke den eneste
variabel.
Der er ingen titel, beskrivelse- eller intern-link-fejl tilbage at rette på de
eksisterende sider — kun **positionen** er lav, og den afgøres af den danske
konkurrence i hvert enkelt ord.

**Den største *målbare* afstand:** beraknare.se har **190.447 visninger**
(`/dato` 101.580 + `/tidsberegner` 61.934 + `/procent` 26.933) og **229 klik**
— 0,12 % CTR. Det er en tredjedel af sitets samlede visninger og en
halvredsdel af dets klik. Svensk indholdsdybde er målt til at være **lig med
den danske** (`/dato` 1.617 mod 1.723 ord, `/tidszone` 1.706 mod 1.756), så
det er heller ikke et dybde-problem — det er opgave 187's slugs plus den
svenske domæneautoritet.

### Prioriterede opgaver

**F1. [ ] Få søgeniveau-data for `/procent` — 150.470 visninger og 0,1 %.**
GSC's tre søgninger for siden summerer **364 visninger af 150.470**, så vi ved
intet om resten. Uden søgningsniveau kan ingen vælge mellem "ny side", "dybere
side" og "nye links". **Accept:** GSC-eksport for `/procent` (eller de 20
største søgninger site-wide) ligger i planen. **❓ se nedenfor.**

**F2 + F2b. [x] ✅** rabat-spørgsmål + svensk rabatt-FAQ — `docs/plan-arkiv.md`.
**MÅL:** `/procent` 150.470 / 97 / 0,1 % / 7,4 (da), 26.933 / 2 / 0,0 % / 9,9 (se).

**F3. [ ] Beraknare.se: position, ikke titel.** 190.447 visninger på pos. 8-10.
Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes før de
svenske titelændringer fra C195/C196 er målt. Efter den dato er det den største
enkeltpost i trafikplanen. **Accept:** se opgave 187.

**F4. [x] ✅** dobbelerede stribe væk — `docs/plan-arkiv.md`. **MÅL:** `/` 218
besøgende/28d, bounce 38 % → mod 2-7 %; se `/` 20, bounce 80 %.

**F5. [ ] Søg på de 27 % ikke-Google-trafik.** Bing 1.319 + DDG 378 +
Yahoo 274 besøgende/28d. IndexNow er kodet (`src/lib/indexnow.ts`), men ❓
spørger om krogen efter deploy er sat op — uden svar er Bing/DDG/Yahoo
indeksering uafhængig af vores deploys.

**F6. [x] ✅** norske tal uden dansk separator — port `intl-locale-tag.test.ts`.**

**F7. [x] ✅** tidsforskellers dage læst fra `afvigendeDage()`. **MÅL:**
`/tidszone` 24.324 / 104 / 0,4 % / 7,5.

**F8. [x] ✅** svenske helgdagslove kildeført. **MÅL:** se `/nedtaelling`
5.726 / 12 / 0,2 % / 9,2.

## Feature-kø

Mindst hver tredje opgave skal være noget brugeren kan se. Kandidater, prioriteret
efter forventet effekt på **trafik** (GSC-tallene fra 1/10):

- **Landing-side pr. konkrete countdown-spørgsmål** (`/dage-til/[dato]`).
  *Hvem:* alle der googler «hvor mange dage er der til 1 december» — 1.209
  visninger, 3 klik, pos. 5. *Accept:* én ægte side for jul, nytår, sommerferie
  og skolestart, med svaret i `<title>`. *Datagrund:* GSC, 1/10.
- **Forskelsside til `/dato` og `/tidsberegner` på beraknare.se.** *Hvem:* de
  190.447 svenske visninger på 0,12 % CTR. *Accept:* CTR over 0,3 % på 14 dage.
  *Datagrund:* GSC se, 1/10. **Kan ikke før 13/10** (opgave 187).
- **Pristalsregulering på `/husleje`** som selvstændig side. *Hvem:* lejere der
  vil vide hvad deres lejlighed må stige til. *Accept:* beregner + FAQ med
  nettoprisindekset som kilde. *Datagrund:* `/husleje` 161 besøgende/28d.
- **Kalorieguide på `/kalorier`.** *Hvem:* 9 af 10 danske autocomplete-træffere
  under «kalorier» er madvarer. **Blokeret på kilde** (opgave 119, ❓) — må ikke
  gættes tal.

### Åbne VERIFICÉR DEPLOY-noter

- ⏳ **`/loen-efter-skat` skal ikke blande to kilder om de samme kommuner.**
  `ceo/loen-efter-skat-en-kilde`. På `https://minberegner.dk/loen-efter-skat` skal
  **"Landsgennemsnittet" forekomme 0 gange**, afsnittet under «5. Kommuneskat
  (varierer)» skal lyde **"I tabellen med de 98 kommuner er gennemsnittet
  25,63 %, den billigste ligger på 22,5 %, og 27,8 % er den dyreste"**, og et
  **eget** afsnit skal sige **"25,049 % ifølge svmn.dk's 2026-gennemsnit"**.
  FAQ'en «Hvorfor varierer kommuneskatten?» skal ikke længere sige
  «Landsgennemsnittet er 25,049%». HTTP 200 beviser intet — det er brødtekst.
  Prøven på dansk er `src/app/loen-efter-skat/page.test.tsx` +
  `src/app/fact-consistency.test.ts` efter deploy. Vindue **1/10 12:30**.

- ⏳ **`/dato` på svensk skal have månedens eget afsnit og bøje «1 dag».**
  `ceo/dato-svensk-maaned`. På `https://beraknare.se/dato` skal `<h2>Hur många
  dagar är det i den här månaden?</h2>` stå i markupken, og brødteksten skal
  lyde «… har **31 dagar** totalt» med månadens navn fra `maanedNavn(7, "se")`.
  **«1 dagar kvar» og «1 dagar» efter ugerne skal forekomme 0 gange**, og
  «veckor och 1 dag» skal stå, når restdagen er 1. På
  `https://minberegner.dk/dato` skal «1 dage tilbage» forekomme 0 gange.
  HTTP 200 beviser intet — det er fire bøjninger i brødtekst. Prøven på dansk
  er `src/app/dato/page.test.tsx` efter deploy. Vindue **1/10 12:30**.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint        # biome lint ./src      — 635 filer
npm run typecheck   # tsc --noEmit -p tsconfig.test.json — **kun testfiler**, 0 fejl
npm run test        # vitest run            — 3313 tests / 202 filer
TZ=UTC npm run test   # CI's ur — se målerfælden 1/10 i STATUS
npm run build       # next build            — 138 ruter, **alle `ƒ` (dynamiske)**
node scripts/locale-leak.mjs --gate       # exit 0
```

**`typecheck` er ny 1/10 (`ceo/typecheck-testfiler`) og er en del af gaten.**
Den type-tjekker **kun** `src/**/*.test.ts(x)` — altså de filer
`tsconfig.json`s `exclude` steger væk fra `next build`. Uden den var der ingen
typekontrol af testfiler overhovedet; med den er der 0 fejl i 202 filer.

**Målt 1/10:** `next build` på Next 16.3.8 (Turbopack) giver **138 ruter,
136 `ƒ` og 2 `○`** — se opgave 200.

**`next build` tjekker ikke testfiler mere** (1/10): med Next 16 type-tjekkede
`next build` alle 85 fejl i 18 `*.test.ts(x)`-filer og bygget faldt. De blev
taget ud af `tsconfig.json`s `exclude` (de skriver ikke til det kodede output)
og fik i stedet `npm run typecheck`. Se `docs/plan-arkiv.md`.

Sidens tekst kan regnes pr. request: `getPageData` løser `/alders{ALDER}`
ved hvert kald, så et alders-tal i et snippet følger dagen. Dagens dato læses i
sidens egen tidszone via `iDagISidensTidszone`.


## Åbne VERIFICÉR DEPLOY-noter

- ⏳ **`/loen-efter-skat` skal vise de rigtige kommuner og læse satser fra
  modulerne.** `ceo/loen-efter-skat-tal-kilden`. På
  `https://minberegner.dk/loen-efter-skat` skal kommunetabellen lyde **"Rudersdal
  (22,5 %) | Langeland (27,8 %)", "Gentofte (22,8 %) | Ishøj (27,2 %)",
  "Lyngby-Taarbæk (23 %) | Brøndby (27,1 %)"** — Lyngby-Taarbæk erstattede
  **Allerød (23,3 %)**, som `KOMMUNER` siger er 24,80 %. Strengen **"Allerød"**
  må **ikke** forekomme nogen steder på siden, og **"Rundersdal"** må ikke
  forekomme (data skriver "Rudersdal"). **"op fra 49.700 kr", "op fra 45.100 kr"
  og "sat ned fra 12,22 %" skal være væk.** Sats skal stå som "8 %", "12,01 %",
  "12,75 %" med mellemrum. HTTP 200 beviser intet — det er en tabel og en
  brødtekst. Prøven på dansk er `src/app/fact-consistency.test.ts` efter deploy.
  Vindue **1/10 12:30** (denne merge sker efter 07:30).

- ⏳ **Datolisten på `/dato` skal bøje "1 dag", ikke "1 dage", og den svenske
  overskrift skal have "som".** `ceo/dato-datoliste-bøjning`. På
  `https://minberegner.dk/dato` og `https://beraknare.se/dato` må strengen
  **" og 1 dage)"** / **" och 1 dagar)"** forekomme 0 gange i markupken, og
  **"12 uger og 1 dag."** / **"12 veckor och 1 dag."** skal stå i rækkerne med
  87 dage til juledagen (1/10-1/12 og 2/12-24/12). Den svenske `<h2>` skal
  lyde **"Datum som folk oftast räknar ner till"** — ikke "Datum folk oftast
  räknar ner till". HTTP 200 beviser intet, det er tekst i 19 `<li>`-rækker.
  Prøven på dansk er `src/app/dato/page.test.tsx` (de to nye porte) efter
  deploy. Vindue **1/10 12:30** (denne merge sker efter 07:30).

- ⏳ **To artikler skal i næste handling tilbyde det værktøj, der regner
  beløbet ud.** `ceo/indlaeg-naeste-vaerktoej`. På
  `https://minberegner.dk/blog/guide-feriepenge-hvornaar-og-hvor-meget` skal
  **"Beregn hvor meget du får i feriepenge"** med `href="/feriepenge"` stå i
  blokken "Regn det ud", ved siden af den knap der går til `/dato`. På
  `https://minberegner.dk/blog/boliglaan-2026-renter-og-afdrag` skal
  **"Se hvad dit boliglån koster pr. måned"** med `href="/boliglaan"` stå der
  samlet sted. Begge artikler har **allerede** disse to href i brødteksten, så
  det er kun næste handling der manglede dem. HTTP 200 beviser intet — det er
  to linjer under `<h2>Regn det ud</h2>`. Prøven på dansk er
  `src/app/blog/naeste-skridt.test.ts` efter deploy. Vindue **1/10 12:30**
  (denne merge sker efter 07:30).

**Syv noter åbne.** HTTP 200 beviser intet: 189's og 189b's noter rører
*tabelceller* med lovtal, der er usynlige for `curl` uden at man læser dem.
**Seks noter lukket på indhold 1/10 07:45** (`ceo/next-16`,
`ceo/promille-lovkilde`, `ceo/promille-loenkilde-2`, `ceo/sidste-hverdag-paastand`,
`ceo/blog-naeste-vaerktoej`, `ceo/tidszone-usa-forskelsdag`) — 12 URL'er hentet,
alle 200, hver streng talt i markupken. Alle målinger står i
`docs/plan-arkiv.md`, "Deploy-noter lukket på indhold 1/10 07:45".

- ⏳ **`/boligstoette` og `/pension` skal vise "Guides om emnet" under de
  relaterede beregnere.** `ceo/guides-til-store-beregnere`. På begge sider skal
  `<h2>Guides om emnet</h2>` stå i markupken med **ét** `/blog/`-href (henholdsvis
  `boligstoette-2026-nye-regler` og `pension-hvor-meget-skal-du-spare-op`), og
  **"Vil du se den fulde guide?" må ikke forekomme** nogen steder. På
  `https://beraknare.se/` må blokken **ikke** forekomme. HTTP 200 beviser intet.
  Prøven på dansk er `src/lib/store-beregnere-guide.test.tsx`. Vindue **1/10 12:30**.



- ⏳ **Barsel-indlægget skal tilbyde begge værktøjer som næste handling.**
  `ceo/barsel-naeste-handling`. På `https://minberegner.dk/blog/barsel-2026-regler-og-satser`
  skal afsnittet "Regn det ud" rumme **to** links i markupken — knappen
  `href="/barselsdagpenge"` **og** det stille link
  `href="/barselsplanlaegger"` med teksten "Planlæg dine uger med
  barselsplanlæggeren" — og det stille link skal stå *inden* "Relaterede
  artikler". HTTP 200 beviser intet, det er et par linjer i en blok. Prøven på
  dansk er `src/app/blog/naeste-skridt.test.ts` (porten `SKAL_NAAE`) efter
  deploy. Vindue **1/10 12:30** (denne merge sker efter 30/9 21:30).



- ✅ **Sydney skal stå med 8-10 timer foran, ikke 9-10.** `ceo/tidszone-tidsforskelle`.
  **DEPLOY OK 30/9 23:10** — hentet fra live og læst i markupken, begge domæner.
  DA: `London : 1 time bagud`, `New York : 5-6 timer bagud`, `Los Angeles : 8-9
  timer bagud`, `Tokyo : 7-8 timer foran`, `Sydney : 8-10 timer foran`. SE:
  `1 timme efter` / `5-6 timmar efter` / `8-9 timmar efter` / `7-8 timmar före` /
  `8-10 timmar före`. **Strengen "9-10" forekommer 0 gange** på begge sider.

- ✅ **Norske tal skal ikke få dansk tusindtalsseparator.** `ceo/no-locale-tag`.
  **DEPLOY OK 1/10 08:35** — batch-vinduet var 1/10 07:30 (noten sagde
  "30/10", en skrivefejl for 1/10; mergen skete 30/9 efter 17:30). Bevis på
  dansk og svensk, fordi `beregner.no` stadig er latent: alle fire URL’er svarer
  **200** (`/alder` og `/proteinbehov` på begge domæner), og de svenske sider er
  svenske i markupken — `beraknare.se/alder` har **97 forekomster af "ålder"**
  og **0 af** "hvor mange dage"/"hvad er"; `beraknare.se/proteinbehov` skriver
  "gram protein" og "per dag". Gaten grøn efter deploy: `npm run lint` ren (635
  filer), `node scripts/locale-leak.mjs --gate` exit 0, og `intl-locale-tag` +
  `alder-side-tekst` + `dato/page` → **63 tests grønne**. CI på `master`
  (553b3cc) grøn. Tallene selv står ikke i markupken (kalkulatorens
  starttilstand er 0), så det er JS-kørslen porten dækker, ikke `curl`.
- ⏳ **`/bmi` skal vise sit eget indlæg under FAQ'en.** `ceo/bmi-voksen-indlaeg`.
  På `https://minberegner.dk/bmi` skal `<h2>Guides om emnet</h2>` stå i markupken
  med **ét** `/blog/`-href, og det skal være
  `href="/blog/bmi-voksen-saadan-tolk-er-du-tallet"` — **ikke** børneguiden
  `/blog/bmi-for-boern-saadan-tjekker-du`, som stadig skal findes i den blå
  "BMI for børn?"-boks højere oppe. På `https://beraknare.se/bmi` må
  "Guides om emnet" **ikke** forekomme (indlæggene er danske). HTTP 200 beviser
  intet — det er rækkefølge og antal i markupken. Prøven på dansk er
  `src/lib/bmi-voksen-grænser.test.tsx` efter deploy. Vindue **1/10 12:30**.

- ⏳ **Forsiden skal vise de populære beregnere én gang, lige under helten.**
  `ceo/forsiden-dublet-liste`. På `https://minberegner.dk/` og
  `https://beraknare.se/` skal den kompakte stribe med otte `<a>`-links være
  **væk**, `<h2>Populære beregnere</h2>` skal komme **før** tillidsrækken
  ("Gratis beregnere" / antallet @ 23.412 / 21.328), og ingen populær href må
  forekomme to gange i forsidens lister. HTTP 200 beviser intet — det er
  rækkefølge og antal i markupken. Prøven på dansk er
  `src/app/forside.test.tsx` efter deploy. Vindue **1/10 12:30**.
  *(Stribens egen note fra `ceo/forsiden-snabb-indgang` blev DEPLOY OK 30/9
  23:08, men er udfaset af denne rettelse: samme links, to gange.)*

#### 97. [BLOCKED: afventer Mads' svar — spørgsmålet står i ❓ Til Mads, ingen kode uden svar] 2026-09-27 — C69 — afklar hvad `beregner.no` er

- **Datagrund:** `https://beregner.no/` svarer 200 med en 12,7 KB norsk side
  ("Mest brukte") og **uden ét `/_next/static`-chunk**; `git log -S "Mest
  brukte"` giver ingen træffere, og 404-siden bruger `text-foreground`, som
  står i nul filer her. **beregner.no peger på en anden udgivelse end denne
  repo** — så det er et ejerskabsspørgsmål, ikke en kodebeslutning.
- **Følgen:** opgave 98 er betinget, alle `no`-fund fra C65/C66 er uopnåelige
  (ingen kan se dem) men bevares, fordi de bliver nødvendige den dag `no`
  lanceres herfra. `domain-config.ts:91` har `beregner.no` i `hiddenDomains`
  ("not yet launched").
- **Accept:** 1. `❓ Til Mads` har spørgsmålet (det har den). 2. Der står en
  linje i planen om hvad `no` er: lanceret, lukket eller uafklaret.
  3. Gaten grøn. **Ingen kodeændring uden svar** — at lukke et domæne er en
  domænebeslutning. Fuldtekst: `docs/plan-arkiv.md`, "Opgave 97, 119 og 183".

#### 98. [ ] 2026-09-27 — C70 — `TidszoneBeregner` har intet `no`-sprog (afhænger af opgave 97)

- **Datagrund:** målt under C66. `labels` i `TidszoneBeregner.tsx` har kun `da`
  og `se`, og `const l = labels[locale] || labels.da` giver derfor **dansk** på
  beregner.no — hele værktøjet, inklusive dropdown, huskeliste og sommertidsnote.
  Usynligt i dag, fordi beregner.no 404'er på alt ud over `/` (opgave 97).
- **Afhængighed:** opgave 97. Svarer den "lanceres ikke", er opgaven
  **gratuleringens fallenhed** — slå `no` fra i porten. Svarer den "lanceres
  snart", skal værktøjet have et rigtigt `no`-sprog: `Tidssone`, `Fra tidssone`,
  `Timeforskjell`, `timer`, `(dagen før)`, `(neste dag)`, `hjemmetidssonen er
  Norge` — samme mønster som C65 gjorde for `STANDARD_APPARATER` (`navnNo` pr.
  post), altså **ikke** en `labels.no`-nøgle.
- **Acceptkriterier:** hvis domænet er lukket: `isCalculatorAvailable("/tidszone", "no")`
  er `false` med en test på det. Hvis domænet er live: `TidszoneBeregner.test.tsx`
  kører i **da, se og no**, og `no`-renderet indeholder ingen danske
  `navn`/`by`-former. Gaten grøn i begge tilfælde.
- **MÅL:** ingen brugerdata endnu — beregner.no har ingen trafikmåling. Mål først
  14 dage efter en eventuel lancering.

#### 119. [BLOCKED: ingen citable dansk kilde — sst.dk svarer HTTP 429, de fire andre kilder døde i C92] 2026-09-29 — madvare-klyngen på "kalorier"

- **Datagrund:** DA-autocomplete under "kalorier" → 9 af 10 er madvarer (æg,
  banan, vandmelon, kartofler, havregryn); under "kalorie indhold" → 10 af 10.
  Det er den næststørste danske klynge på ordet, og `/kalorier` har **0**
  tabeller over madvarer (289 besøgende/28d, +50 %).
- **Kildejerngang nr. 2 og 3 (C92 + 29/9) lukkede alle veje:** `frasco.dk`,
  `francofooddata.dk`, `kostviddatabase.{kk.}dk`, `fdev.dk` → HTTP 000; Open
  Food Facts → 503; Wikipedia har kun 2 af 24 fødevarer; `sst.dk` (browser
  og curl) → **HTTP 429** på tallerkenmodellen og kostanbefalingerne.
  Wikipedia er lukket som hovedkilde (2/24) — kun til at krydschecke to-tre tal.
- **Præmis for næste agent:** byg den **ikke** som en færdig madvare-tabel.
  Enten (a) Mads giver adgang til en kildefil/API-nøgle (`❓ Til Mads`), eller
  (b) byg det der *kan* dokumenteres i dag: Sundhedsstyrelsens
  **portionsværdier for de fire-fem hovedgrupper** i kostanbefalingerne
  (tallerkenmodellen, 400/600 kcal), som svarrer på GSC's søgning "hvor mange
  kalorier skal jeg have om dagen" (1 v, pos. 1). Gættede kalorietal ville være
  præcis den fejlklasse planen fører. Må ikke prøve de samme kilder igen.
- **MÅL:** `/kalorier` 289 besøgende/28d (Plausible 2026-09-30). Fuldtekst:
  `docs/plan-arkiv.md`, "Opgave 97, 119 og 183".

#### 183. [BLOCKED: afventer Mads' svar på kildespørgsmålet fra 27/9 — "ingen ny kode før diagnosen står", og ingen ny måling kan erstatte svaret] 2026-09-29 — Kø — **diagnosér `/bmi`s og `/su`s fald**

- **Datagrund:** Plausible 28 dage: `/bmi` 1.271 → 938 (−26 %), `/su` 220 →
  116 (−47 %), mens sitet voksede +42 % — så faldet er relativt værre. GSC's
  top-15 over visninger ender på `/brok` med 4.920, og **hverken `/bmi` eller
  `/su` står på den**, så begge har under 4.920 Google-visninger pr. 28 dage
  mod 938 Plausible-besøgende. Det kan ikke være ren CTR: en visning der ikke
  klikkes, giver høj CTR på lille volumen. Enten kommer trafikken overvejende
  fra Bing/DDG/Yahoo/direkte, eller GSC's eksport er ældre end Plausible's 28
  dage.
- **Ikke teknisk (målt på live 30/9):** begge sider er sunde — canonical til
  sig selv, `robots index,follow`, hreflang `da` + `x-default`,
  `WebApplication` + `FAQPage` + `BreadcrumbList`, i sitemap.xml (136 `<loc>`).
  Samme billede som `/procent` (C200): 150.148 visninger, 98 klik, CTR 0,07 %.
  Mønstret site-wej er det samme — GSC's visninger ligger langt over
  Plausible's besøgende, og forskellen er ikke-klikket Google-trafik. Det
  peger på én fælles årsag (snippet/intention), men at *finde* den kræver
  kildefordelingen fra Mads.
- **Accept:** (1) kildefordelingen for begge sider står i planen, (2) faldet er
  klassificeret som ranking / sæson / CTR med et tal til hver mulighed,
  (3) er det ranking, navngives konkurrenten. **Ingen ny kode før diagnosen
  står** — to titelændringer er prøvet. **MÅL:** `/bmi` 934, `/su` 127
  besøgende/28d (Plausible 2026-09-30). Fuldtekst: `docs/plan-arkiv.md`.

#### 201. [ ] **VENTER PÅ MADS** — Kø — **verificér sommerferiens startdato mod loven, før den bruges som countdown**

- **Status 1/10 10:20:** opgaven er **taget af `I GANG`**, fordi den ikke kan
  gå videre uden et svar: seks kilder blev forsøgt 1/10 05:30 og alle døde
  (retsinformation.dk er en SPA, `undervisningsministeriet.dk`/`ferieinfo.dk`/
  `ferieloven.dk` transportfejl, `lovguiden.dk` HTTP 429, `danskelove.dk` er
  ferieloven for *ansatte*). Genforsøg er ikke kodet, fordi resultatet vil være
  det samme. **Koden er urørt** — at gætte lovens ordlyd i en nedtælling er
  punkt 11 i kvalitetsreglerne. ❓ står i `❓ Til Mads` (ét skærmbillede løser
  opgaven på ti minutter). Næste agent skal ikke bruge en iteration på at
  prøve de samme seks URL'er igen.

- **Datagrund:** `sommerferieStart()` (`src/lib/dage-til.ts:1413-1423`) returnerer
  **den sidste lørdag i juni**, og docblock'en siger at den er "fixed by the
  Folkeskoleloven (2024)". To facts-strenge i `sommerferien`-events følger
  samme regel: "Sommerferien begynder altid den **sidste lørdag i juni**. I 2026
  er det 27. juni, i 2027 26. juni og i 2028 24. juni", og FAQ'en spørger "Kan
  sommerferien begynne senere end 27. juni?". Sidens nedtælling, `<title>` og
  `<meta description>` stammer alle fra den funktion, så **hvis reglen er forkert
  er hele `/dage-til/sommerferien` dagevis forkert** — ikke kun teksten.
- **Hvorfor jeg ikke rettede den 1/10:** ingen kilde kunne hentes.
  retsinformation.dk serverer SPA-skallen også på `.xml` (2.832 bytes),
  `undervisningsministeriet.dk` → transportfejl, `ferieinfo.dk` og
  `ferieloven.dk` → transportfejl, `lovguiden.dk` → **HTTP 429**,
  `danskelove.dk/ferieloven` svarer 200 men handler om ferieloven for
  *ansatte* (intet om skoleferier), Google og DDG-lite gav ingen brugbare
  uddrag. At skrive "sidste lørdag" fra hukommelsen — eller skifte det til en
  anden ugeregel — ville være **opfundet tal** i en nedtælling, så punkt 11 i
  kvalitetsreglerne forbyder begge dele.
- **Afvejningen, som næste agent skal træffe:** hvis lovens regel er "den lørdag
  i den kalenderuge, hvori 20. juni ligger", afviger den fra koden i **7 dage**
  for de fleste år (de to regler falder kun sammen, når 20. juni *er* den
  sidste lørdag) — så alle tre nævnte årstal og hele countdownet er forkert. Er
  lovens regel "sidste lørdag i juni", er siden korrekt og skal have en port der
  låser loven, ikke kun formlen.
- **Acceptkriterier:** (1) lovens ordlyd eller et ministerium/kommune-bevis for
  reglen ligger i `docs/plan-arkiv.md` med URL og hentningsdato, (2) `sommerferieStart`
  + alle tre facts-strenge + FAQ'en + docblock'en læser den kildeførte regel,
  (3) en port i `dage-til.test.ts` verificerer datoerne mod loven — ikke mod
  formlen, ellers låses en fejl fast igen, (4) mutation målt rød, (5) gaten grøn.
- **❓ Se `❓ Til Mads`: ét skærmbillede af ferieloven § om sommerferiens start
  lukker hele opgaven på ti minutter.**
- **MÅL:** `/dage-til/sommerferien` — ikke i GSC's top-16 endnu (kom live 25/9),
  så baseline er 0 Google-visninger; Plausible har ingen måling for den endnu.
  `/dato` er klyngens moderside: 1.127 besøgende/28d, bounce 4 %, GSC
  134.567 visninger / 880 klik / CTR 0,7 % / pos. 5,7 (2026-10-01).

#### 205. [x] ✅ 1/10 12:05 — Kø — **svensk `/dato` får månedens afsnit, og fire bøjninger rettes**

- **Hvorfor:** beraknare.se/dato er sitets næststørste enkeltasset (GSC
  103.776 visninger, 97 klik, CTR 0,1 %, pos. 8,1), og to af de fire største
  søgninger er «antal dagar i en månad» og «hur många dagar i en månad».
  Den danske `/dato` fik i C-tallet et eget afsnit netop til det; den
  svenske gjorde ikke, fordi hele blokken lå indeni `{locale === "da" && (`.
- **Rettet:** afsnittet er nu gengivet på svensk i den svenske sektion, lige
  før «Hur många dagar är det i en månad?» — samme placering som på dansk.
  `denneMaanedEksempel(new Date(), "se")` læser dagen i
  `Europe/Copenhagen`, som den danske side gør.
- **Fire bøjningsfejl, målt i markupken:** «1 dage tilbage af 2026» + «1
  dage» efter ugerne (da), «1 dagar kvar av 2026» + «1 dagar» efter ugerne
  (se). Alle fire er den 30. december synlige, fordi der da er præcis 1 dag
  tilbage. Samme klasse som e6f4f0e — den rettede kun den ene sætning.
- **Port:** 14 tests, alle på renderet markup i begge sprog med uret sat til
  de datoer hvor tallet er 1. 5 mutationer målt røde, begge veje.
- **MÅL:** se `/dato` 103.776 visninger / 97 klik / CTR 0,1 % / pos. 8,1
  (GSC 2026-09-01 → 2026-09-29); Plausible 140 besøgende/28d, bounce 4 %
  (2026-10-01). Genmål efter 14 dage.

#### 200. [ ] 1/10 — Kø — **siteet er 100 % dynamisk; intet kan caches på kanten**

- **Datagrund (målt 1/10 05:35 + 06:00):** `next build` giver 138 ruter, **136
  `ƒ`**, kun `/icon.svg` + `/apple-icon` `○`. `curl -I https://minberegner.dk/dato`
  → `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`.
  Alt i `src/app/` er altså server-rendered på hvert request. **Årsagen er én
  linje:** `src/app/layout.tsx:91-92` kalder `getLocale()` og
  `getCurrentDomainConfig()`, som begge `await headers()` — fordi `src/proxy.ts`
  sætter `x-locale`/`x-hostname` på *request*-headerne. Én `await headers()` i
  root-layouten gør hele træet dynamisk.
- **Live 1/10 06:00:** TTFB `/` 367 ms, `/dato` 433 ms, `/procent` 282 ms;
  `cf-cache-status: DYNAMIC` — **der står en CDN foran**, og den har intet at cache.
- **Målt og fundet 1/10: den naive løsning er farlig.** Next svarer
  `vary: rsc, next-router-state-tree, next-router-prefetch,
  next-router-segment-prefetch, Accept-Encoding`. Klientens rute-navigation
  genanmoder **samme URL med `RSC: 1`**. En `s-maxage` på HTML'en giver derfor
  Next's router en HTML-svar i stedet for et flight-svar, altså brudt
  navigation på hver cachede side. Det skal løses i Cloudflare (regel der
  springer RSC-anmodninger over, eller Worker) — ikke i dette repo. **❓ nyt
  spørgsmål til Mads.**
- **Tre veje, kun én er kode:**
  1. **CDN-cache uden for repoet** (RSC-betinget Cloudflare-regel). Størst
     effekt, hurtigst at få, men kræver Mads. **Spørgsmål er skrevet.**
  2. **Ægte ruter pr. domæne** (`app/[locale]/…` eller tre builds). Løser
     dynamikken *og* opgave 187's slugs på én gang, men er en stor
     routemigrering og må **ikke** køres i samme iteration som 187.
  3. **Bygge 3 statiske builds** (`NEXT_PUBLIC_DOMAIN` ved build). Også stor,
     og kræver 3 containere.
- **Besluttet:** køre **1** som spørgsmål nu, og **2** efter at 187's måling er
  lukket 13/10 — samme opløsning. En delvis ombygning uden et af de to er værst
  af alt: den gør sitet dynamisk *og* dansk-på-svensk.
- **Acceptkriterier:** (1) måling af hvor mange ruter der bliver `○`,
  (2) `cache-control` på `/dato` på live efter næste batch, (3) domæne-skelnene
  må ikke blive dansk-på-svensk — `layout-scroll`- og `proxy`-portene dækker
  kun den mekaniske side, ikke indholdet, (4) hvis løsningen kræver pr. domæne-
  ruter, skrives det i planen og det **ikke** køres i samme iteration som 187.
- **MÅL:** `/dato` 1.127 besøgende/28d, 81 s gennemsnitlig besøgstid, bounce 4 %
  (Plausible 2026-10-01); GSC 133.054 visninger / 842 klik / CTR 0,6 % / pos. 5,7.

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
- **Teknisk forudsætning, fundet 30/9 (ikke løst):** en ren middleware-rewrite
  er **ikke** nok. `beraknare.se/tidskalkylator` rewrite'et til `/tidsberegner`,
  men canonical dannes af den interne rute, så siden ville servere
  `canonical: …/tidsberegner` — en URL der 301'er tilbage. Det er en
  redirect-loop, ikke en migrering. Løsningen er ægte ruter pr. domæne.
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

- ❓ **Sentry: ingen hændelse slap ud, da jegtestede det (opgave 204).**
  Lokalt prod-build, kastende route handler bag et flag, `onRequestError` fik
  fejlen med fuld request-kontekst — men min lokale collector (ren HTTP på
  127.0.0.1:4000, DSN `http://selvtest@127.0.0.1:4000/1`) modtog **ingen**
  envelope. Min stærkeste mistanke er `withSentryConfig(..., { silent: true })`:
  v11 auto-wirer instrumenteringen ved *build* gennem den, så en build-option
  kan slå den fra uden at builden siger noget. **Den farligere halvdel er den
  anden vej rundt:** hvis SDK'en ikke sender, er «Ingen uløste fejl i 14 dage»
  i dit snapshot en vished om ingenting, og det er den vished resten af køen
  styrer på. Skal jeg køre næste iteration som diagnose (drop `silent`, læs
  orkestrations-loggen, og hænge et `[Sentry]`-flag på init), eller vil du kigge
  i Sentry-projektet først — om du overhovedet ser events fra minberegner.dk?

- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201, ny 1/10,
  højst prioriteret).** `/dage-til/sommerferien` siger "sommerferien begynder
  altid den **sidste lørdag i juni**" og hævder, at det står i folkeskoleloven
  (2024) — og hele nedtællingen, titlen og beskrivelsen er regnet ud fra den
  regel. Jeg kunne ikke hente loven: retsinformation.dk er en SPA (også på
  `.xml`), `undervisningsministeriet.dk`, `ferieinfo.dk` og `ferieloven.dk`
  svarer transportfejl, `lovguiden.dk` svarer HTTP 429, og
  `danskelove.dk/ferieloven` handler om ferieloven for *ansatte*, ikke om
  skoleferier. **Ét skærmbillede af den relevante bestemmelse (eller teksten
  kopieret herind) låser det.** Hvis reglen er "den lørdag i den kalenderuge,
  hvori 20. juni ligger", står siden **7 dage forkert** i de fleste år.
  Jeg har bevidst ikke rørt koden, fordi en lovpåstand uden kilde er præcis den
  fejl, CEO-køens punkt 0 handler om.
- ❓ **Kan Cloudflare cache HTML'en på trods af Next's `Vary: RSC`?** (opgave
  200, højst prioriteret.) Der står Cloudflare foran sitet med
  `cf-cache-status: DYNAMIC`, fordi Next svarer `cache-control: private,
  no-cache, no-store`. Sætter vi bare `s-maxage` på HTML'en, **bryder vi
  Next's egen rute-navigation**: klienten genanmoder samme URL med `RSC: 1`, og
  en CDN der cache'r på URL ville give routeren HTML i stedet for sit
  flight-svar. Løsningen er en Cloudflare-regel (spring RSC-anmodninger over)
  eller en Worker — altså din infra, ikke repoet. **Uden det er 280-433 ms TTFB
  på alle 600.000 månedlige visninger den faste pris.** Kan du lave den regel,
  eller skal jeg holde vej 2 (ægte ruter pr. domæne) i beredskab til 13/10?
- ❓ **Søgningseksport fra Search Console (ny, 30/9, højst prioriteret).**
  GSC's opsummering viser kun de 3-4 største søgninger pr. side. For `/procent`
  — **150.470 visninger, 97 klik, pos. 7,4, sitets største side** — er de tre
  søgninger tilsammen **364 visninger**, altså 0,24 % af det vi vil vide noget
  om. Uden de øvrige søgninger kan ingen af os vælge mellem "byg en ny side",
  "gør siden dybere" og "byg flere interne links", og det er præcis de tre
  retninger der er brugt de seneste uger. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største
  søgninger for hele domænet, låser F1-F4.** GSC-data kan ikke hentes fra en
  agent — API'en kræver din konto.
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
  layout, breakpoints eller mørk tilstand. **Én konkret måling mangler nu:**
  hvor højt populærgitterets første kort ligger på 390 px efter F4's rettelse
  1/10 (kortene er ca. 230 px, helten og søgefeltet fylder meget af første
  skærm). Jeg har låst rækkefølgen i markupken, men ikke målt den — og layoutet
  i helten og gitteret er det, en skærmdump ville afkræfte.
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
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
