# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — 1/10 04:25. **Tre deploy-noter lukket på indhold** — og to af dem
  kun efter at noterne viste sig at pege på URL'er, der **404'er**:
  `/nyaarsaaven`, `/nyarsafton` og `/sankthansaftensdag` findes ikke; de hedder
  `/dage-til/nytaarsaften`, `/dagar-till/nyarsafton` og
  `/dage-til/sankthansaftensdag`. Målt på de rigtige: alle 200, 2.769-2.988 ord,
  ingen forbudt streng. **Målerfælde: en 404-side består også uden de forbudte
  strenge**, så et friteksts-tjek på en forkert URL er grønt ud at prøve
  noget. Tjek HTTP-koden først, altid.

  **Næste opgave: opgave 199 (Next 16).** Køen er ellers tom — se nedenfor.

  **Hvorfor køen er tom, målt 1/10:** 97 og 119 og 183 er `BLOCKED` på svar fra
  Mads, 98 afhænger af 97, 187 må ikke røres før 13/10, og F1/F3/F5 har alle
  brug for enten GSC-søgningsdata (❓) eller 187's dato. 194's to resterende
  sider kan **ikke** løses: `/tidsberegner`s eneste indlæg er koblet til
  `/tidszone`, og `blog-kobling.test.ts` forbyder ét indlæg på to beregnere;
  `/kalorier` er opgave 119. **Den gamle "Næste opgave"-linje var derfor
  forældet** — den pegede på to opgaver, målingen i 194 selv havde lukket.

  **`/dage-til/*` er ikke et ranking-problem.** Alle 19 danske sider er live
  (200), i sitemap, og titlen *svarer* på søgningen med dagens tal: "Hvor mange
  dage er der til 1. december? 61 dage". De kom live 25/9 19:48 (`70e75b9`), og
  GSC-vinduet slutter 28/9 — dagen efter. Deres fravær i GSC's top-16 er
  altså vinduet, ikke siden. **Ingen handling; genmål 9/10.**

  **Blokeret af svar fra Mads:** 97, 119 og 183, samt F1/F3/F5. **Opgave 187 må
  ikke røres før 13/10.** CEO-køens punkt 0 er lukket — alle otte tal er
  verificeret i koden 1/10 02:00.

  **⚠️ Målerfælde: `/tidszone` er dynamisk** (`cache-control: no-store`), så
  `new Date()` i dens JSX er ikke frosset ved build. Kun statiske sider må regne
  på et fast år.

  **⚠️ Målerfælde (30/9 15:40).** `npm run test` kører `locale-leak-gate.test.ts`,
  der med vilje planterer danske lækager. Derfor kommer `FEJL: n ureviewet(e)`-
  blokke i output. Det er **ikke** fund i din diff. Kør gaten separat:
  `node scripts/locale-leak.mjs --gate` (exit 0).

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

CTR følger position, ikke sidekvalitet: pos. 4,9-5,9 giver 0,6-1,4 %, pos.
7,0-8,7 giver 0,1-0,5 %. Vi ligger **på position 5-8 på 600.000 visninger**.
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

**F1. [ ] Få søgeniveau-data for `/procent` — det er 150.470 visninger og
0,1 %.** De tre søgninger GSC viser for `/procent` (`procentberegner` 254 v,
`10 procent af` 54 v, en rabat-spørgsmål 56 v) summerer **364 visninger af
150.470**. Vi ved altså intet om de 150.106. Uden søgningsniveau kan ingen
vælge mellem "ny side", "dybere side" og "nye links". **Accept:** GSC
søgningseksport for `/procent` (eller de 20 største søgninger site-wide) ligger
i planen. **Spørgsmål til Mads: se ❓.**

**F2 + F2b. [x] ✅ `ceo/procent-rabat-spørgsmal`, `ceo/procent-svensk-rabatt-faq`
— `/procent` svarar på rabat-spørgsmålet med en gennemregnet formel, fire svenske
FAQ-rækker der rammer svensk autocomplete, og alle tal udledt af kildetal-bundne
`RABAT_*`-konstanter. 19 nye tests, 12 mutationer faldt.
**MÅL:** `/procent` 150.470 visninger / 97 klik / CTR 0,1 % / pos. 7,4 (da) og
26.933 / 2 / 0,0 % / pos. 9,9 (se), GSC 2026-08-31 → 2026-09-28.

**F3. [ ] Beraknare.se: position, ikke titel.** 190.447 visninger på pos.
8-10. Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes
før de svenske titelændringer fra C195/C196 er målt. Efter den dato er
dette den største enkeltpost i trafikplanen. **Accept:** se opgave 187.

**F4. [x] ✅ `ceo/forsiden-snabb-indgang` → rettet 1/10 af `ceo/forsiden-dublet-liste`** —
striben med de otte mest brugte viste de samme otte som populærgitteret lige
under den (otte af fjorten to gange i da, seks af seks i se). Striben er væk;
populærgitteret ligger nu direkte under helten, så genvejen er der stadig på
første skærm — uden at læseren møder listen to gange.
**MÅL:** `/` 218 besøgende/28d, bounce 38 % (Plausible 2026-09-30) → mod 2-7 %;
se `/` 20 besøgende, bounce 80 %.

**F5. [ ] Søg på de 27 % ikke-Google-trafik.** Bing 1.319 + DDG 378 +
Yahoo 274 besøgende/28d. IndexNow er kodet og instrumenteret
(`src/lib/indexnow.ts`, `src/app/api/internal/indexnow/route.ts`), men
`❓ Til Mads` spørger om krogen efter deploy er sat op — uden svar er
Bing/DDG/Yahoo indeksering uafhængig af vores deploys.

**F6. [x] ✅ `ceo/no-locale-tag`** — de seks Intl-tag der sendte norsk til dansk
formatering (`ProteinbehovBeregner` viste 500 kg som "1.000"). Ny port
`intl-locale-tag.test.ts` scanner hele `src/` på kædens *form*, 8 nye tests.

**F7. [x] ✅ `ceo/tidszone-tidsforskelle`** — Sydney lå på 9-10 timer, kalenderen
giver 8-10. Alle fem forskelle regnes nu af `tidsforskelsRækker` gennem byens
egen `dst`-regel; målet fandt fire fejl mere, alle rettet før commit.
**MÅL:** `/tidszone` 24.324 visninger / 104 klik / CTR 0,4 % / pos. 7,5.

**F8. [x] ✅ `ceo/svensk-helgdagslove`** — tre svenske sider modsagde
`lag (1989:253)` 1 §. Kilden er hentet fra riksdagen.se, lovens liste ligger som
data i `dage-til.test.ts`, og brødteksten tjekkes mod den i begge retninger — en
dag loven ikke tæller må ikke kaldes helgdag, og en dag loven tæller må ikke
kaldes *ikke*-helgdag.
**MÅL:** se `/nedtaelling` 5.726 visninger / 12 klik / CTR 0,2 % / pos. 9,2.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 634 filer
npm run test     # vitest run            — 3304 tests / 201 filer
TZ=UTC npm run test   # CI's ur — se målerfælden 1/10 i STATUS
npm run build    # next build            — 143 sider
node scripts/locale-leak.mjs --gate       # exit 0
```

Sidens tekst kan regnes pr. request: `getPageData` løser `/alders
{ALDER}`-pladsholdere ved hvert kald (se `src/lib/alder-side-tekst.ts`), så
et alders-tal i et snippet følger dagen. Dagens dato læses i sidens egen
tidszone via `iDagISidensTidszone` — `tilIsoDato(new Date())` læser
*serverens* tidszone og er et døgn bag mellem 00:00 og 02:00 dansk tid.

`tsc --noEmit` er **ikke** del af gaten. Genmålt 1/10 02:04 på `master` og på
`ceo/guides-til-store-beregnere` med `git stash -u` før og efter: **83 fejl i 18
filer** begge steder, alle i `*.test.ts(x)`, ingen i de tre rørte filer. Planen
sagde tidligere 82/17 og før det 72 — de ekstra kommer fra commits efter sidste
måling, ikke fra denne ændring.

## Åbne VERIFICÉR DEPLOY-noter

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

**Ni noter åbne.** HTTP 200 beviser intet: 189's og 189b's noter rører
*tabelceller* med lovtal, der er usynlige for `curl` uden at man læser dem. De
otte lukkede noter er verificeret på indhold; senest 30/9 23:10 for tidszone
og forsiden. Alle målinger står i `docs/plan-arkiv.md`.

- ⏳ **`/boligstoette` og `/pension` skal vise "Guides om emnet" under de
  relaterede beregnere.** `ceo/guides-til-store-beregnere`. På
  `https://minberegner.dk/boligstoette` skal `<h2>Guides om emnet</h2>` stå i
  markupken med **ét** `/blog/boligstoette-2026-nye-regler`-href, og **strengen
  "Vil du se den fulde guide?" må ikke forekomme** nogen steder — den blev
  fjernet, fordi læseren ellers mødte artiklen to gange. På
  `https://minberegner.dk/pension` skal samme blok stå med **ét**
  `/blog/pension-hvor-meget-skal-du-spare-op`-href. På `https://beraknare.se/` på
  begge domæner må "Guides om emnet" **ikke** forekomme. HTTP 200 beviser intet —
  det er en blok i markupken. Prøven på dansk er
  `src/lib/store-beregnere-guide.test.tsx` efter deploy. Vindue **1/10 12:30**
  (denne merge sker efter 07:30).

- ⏳ **Tysklands række må ikke love en grænse, StVG ikke har.** `ceo/promille-lovkilde-2`.
  På `https://minberegner.dk/promille` og `https://beraknare.se/promille` skal
  Tysklands række lyde **"0,0 ‰ under 21 år og i kørekortets prøveperiode"** /
  **"0,0 ‰ under 21 år och i körkortets provperiod"**, og strengen **"0,3 ‰" må
  ikke forekomme på Tysklands række** i nogen af de to tabeller — § 24a kender
  0,5 og § 24c et forbud, mens 0,3 er retspraksis. Storbritanniens række skal
  stadig sige 0,8 med Skotland på 0,5. HTTP 200 beviser intet, det er en
  tabelcelle. Prøven på dansk er `src/lib/promille-loenkilde.test.tsx` efter
  deploy. Vindue **1/10 12:30** (denne merge sker efter 30/9 21:30).

- ⏳ **Danmarks række skal sige 0,2 ‰ de første 3 år, ikke "Ingen særregel".**
  `ceo/promille-lovkilde`. På `https://minberegner.dk/promille` skal
  Danmarks række i landstabellen lyde **"0,2 ‰ de første 3 år med kørekort
  (sænket i 2025)"**, og på `https://beraknare.se/promille` den svenske
  **"0,2 ‰ de första 3 åren med körkort (sänkt 2025)"**. Strengen **"Ingen
  særregel" / "Ingen särregel" må ikke forekomme på Danmarks række** i nogen af
  de to tabeller — den er lovstridigt modsat RST. HTTP 200 beviser intet, det er
  en cellecelle. Prøven på dansk er `src/lib/promille-loenkilde.test.tsx` efter
  deploy. Vindue **1/10 07:30** (denne merge sker efter 30/9 21:30).

- ⏳ **Barsel-indlægget skal tilbyde begge værktøjer som næste handling.**
  `ceo/barsel-naeste-handling`. På `https://minberegner.dk/blog/barsel-2026-regler-og-satser`
  skal afsnittet "Regn det ud" rumme **to** links i markupken — knappen
  `href="/barselsdagpenge"` **og** det stille link
  `href="/barselsplanlaegger"` med teksten "Planlæg dine uger med
  barselsplanlæggeren" — og det stille link skal stå *inden* "Relaterede
  artikler". HTTP 200 beviser intet, det er et par linjer i en blok. Prøven på
  dansk er `src/app/blog/naeste-skridt.test.ts` (porten `SKAL_NAAE`) efter
  deploy. Vindue **1/10 12:30** (denne merge sker efter 30/9 21:30).

- ⏳ **Ingen side må kalde en skiftende dato en hverdag, og skærtorsdag er en
  torsdag.** `ceo/sidste-hverdag-paastand`. På
  `https://minberegner.dk/dage-til/nytaarsaften` og
  `https://beraknare.se/dagar-till/nyarsafton` må "Sidste hverdag i december" og
  "Sista vardagen i december" **ikke** forekomme nogen steder — teksten skal sige
  månedens sidste dag uanset ugedag. På
  `https://minberegner.dk/dage-til/sankthansaftensdag` må "en almindelig
  hverdag" **ikke** forekomme (23. juni er weekend i 2029, 2030, 2035, 2040).
  På `https://minberegner.dk/dage-til/skaertorsdag` skal spørgsmålet "Er
  skærtorsdag en fridag?" have svaret **"Nej"** med "altid en torsdag" i svaret.
  HTTP 200 beviser intet — det er brødtekst på statiske sider. Prøven på
  dansk er `src/lib/dage-til.test.ts` efter deploy. Vindue **1/10 07:30**.
  **URL'erne i denne note var alle forkerte** — de tre første 404'ede. Rettet
  ovenfor efter måling 1/10 04:25.

- ⏳ **Bloggen skal sende læseren videre til det værktøj, artiklen handler om.**
  `ceo/blog-naeste-vaerktoej`. På
  `https://minberegner.dk/blog/koeb-af-bolig-2026-omkostninger` skal blokken
  "Regn det ud" have **`/boliglaan` som primær knap** ("Beregn alle dine
  månedlige boligomkostninger") og `/rentefradrag` som stille sekundær — det
  omvendte var den gamle rækkefølge, selv om artiklen selv to gange i
  brødteksten peger på boliglånsberegneren. På
  `https://minberegner.dk/blog/fradrag-2026-komplet-guide` skal samme blok have
  et `/befordringsfradrag`-link. Beraknare.se skal **ikke** have artiklerne
  (de er danske og `/blog/*` 404'er på beraknare.se — målt 1/10). HTTP 200
  beviser intet — det er rækkefølge og to links i én blok. Prøven på dansk er
  `src/app/blog/naeste-skridt.test.ts` efter deploy. Vindue **1/10 07:30**
  (denne merge sker efter 30/9 21:30).

- ✅ **Sydney skal stå med 8-10 timer foran, ikke 9-10.** `ceo/tidszone-tidsforskelle`.
  **DEPLOY OK 30/9 23:10** — hentet fra live og læst i markupken, begge domæner.
  DA: `London : 1 time bagud`, `New York : 5-6 timer bagud`, `Los Angeles : 8-9
  timer bagud`, `Tokyo : 7-8 timer foran`, `Sydney : 8-10 timer foran`. SE:
  `1 timme efter` / `5-6 timmar efter` / `8-9 timmar efter` / `7-8 timmar före` /
  `8-10 timmar före`. **Strengen "9-10" forekommer 0 gange** på begge sider.

- ⏳ **Norske tal skal ikke få dansk tusindtalsseparator.** `ceo/no-locale-tag`.
  Kontrollér **indhold** på `https://beregner.no/proteinbehov` (latent — domænet
  404’er i dag, så læg på dansk og svensk at dansk/svensk output er uændret):
  `ProteinbehovBeregner` skal bruge `getIntlLocale`, og ingen fil må stå med
  den toarmede kæde `locale === "se" ? "sv-SE" : "da-DK"`. Den praktiske prøve på
  dansk er, at `npm run test` fortsat er grøn på
  `src/lib/intl-locale-tag.test.ts` efter deploy. Vindue **30/10 07:30** (denne
  merge sker efter 17:30).
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

- ⏳ **`/tidszone` må ikke sige at USA og Danmark skifter på samme datoer.**
  `ceo/tidszone-usa-forskelsdag`. På `https://minberegner.dk/tidszone` og
  `https://beraknare.se/tidszone` skal blokken "Når det er 21 i Danmark" sige
  **"på 337 af årets 365 dage"** og **"28 dage"** (ikke "hele året" og ikke
  "skifter som Danmark"), og FAQ'en skal have samme tal. På
  `https://minberegner.dk/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`
  skal strengen **"5 eller 7 timer"** være væk, og FAQ'en skal svare **"Nej"**
  (den sagde "Ja"). HTTP 200 beviser intet — det er brødtekst og FAQPage-json.
  Prøven på dansk er `src/lib/tidszone-usa-timer.test.ts` efter deploy.

## Åbne opgaver

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

#### 194. [x] ✅ 1/10 02:05 — `/boligstoette` og `/pension` fik en synlig "Guides om emnet"-blok

  Målt 1/10 med `npx tsx` over alle 29 `page.tsx` i `src/app/blog/`. Fuldtekst
  med målinger, mutationer og de to sider der bevidst *ikke* blev koblet:
  `docs/plan-arkiv.md`, "Opgave 194".

#### 199. [ ] 1/10 — Kø — **opgradér Next.js 15.5.25 → 16.3.8 (én major, egen commit)**

- **Datagrund:** `npm outdated` 1/10: `next` wanted **15.5.27** (patch), latest
  **16.3.8** (major). `npm audit --omit=dev` → **0 sårbarheder**, så dette er
  ikke et sikkerhedshul — det er Mads' løbende krav om nyeste versioner. Runtime
  er allerede erklæret og korrekt: `engines.node ">=22 <23"`, `.nvmrc` = 22,
  `Dockerfile` på `node:22-alpine`. Next 16 kræver Node 20.9+, så **intet
  runtime-ændring er nødvendig** — lad dog `@types/node` blive på 22, så
  byggeserveren ikke får en ny type-kontrakt oveni.
- **Hvorfor en hel iteration:** 3.304 tests + 143 statiske sider er hele
  gaten, og Next 16 er en major. `npm run lint` er biome (ikke `next lint`), så
  den forsvundne `next lint` rammer ikke. Forventede brud: middleware-signatur,
  `generateStaticParams`, `images`-config og `output: "standalone"` i Dockerfile.
- **Acceptkriterier:** (1) patch først i **én commit** (`15.5.25 → 15.5.27`) så
  major kan rulles tilbage præcist, (2) major i sin egen commit, (3) gaten
  grøn i **begge** tidszoner + `locale-leak --gate` exit 0 + build 143/143,
  (4) `curl -fsI https://minberegner.dk/api/health` efter næste batch, (5) hvis
  gaten ikke kan blive grøn: **rulle tilbage**, ikke lade det stå.
- **Mål ikke.** Infrastruktur — effekten er at opgraderingen ikke gør skade.
  Notér i planen hvad der rent faktisk ændrede sig.

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
