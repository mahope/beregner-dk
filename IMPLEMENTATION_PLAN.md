# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — 30/9 17:58. **Alle otte forrige deploy-noter er lukket** på
live-indhold 17:46-17:53 (17:30-batchen var 16 min gammel ved 17:37-målingen,
så de var ikke live da). Målingerne står i `docs/plan-arkiv.md`. **F6 er færdig**
(`ceo/no-locale-tag`): de seks steder der valgte `Intl`-sprog med den toarmede
kæde `locale === "se" ? "sv-SE" : "da-DK"` bruger nu `getIntlLocale`, og en port
scanner hele `src/` så klassen ikke kan komme tilbage. Dansk og svensk output er
målt uændret på 12 tal i begge sprog, så intet på de live domæner flytter sig.
Alle fem review-fund er rettet (`74e7861`, `d563ba2`), CEO-køens punkt 0 er
færdigt (`aca17e5`).

**Én ny VERIFICÉR-note** (denne iteration). F4 kræver Playwright (❓),
F1/F3/F5 og opgaverne 97/98/119/183 er blokeret af svar fra Mads.
**Opgave 187 må ikke røres før 13/10.**

**⚠️ Målerfælde (30/9 15:40, samme klasse som C70's).** `npm run test` kører
`locale-leak-gate.test.ts`, som med vilje planterer **to** danske lækager og
hævder at scanneren finder dem. Derfor kommer der **to** `FEJL: n ureviewet(e)`-
blokke i output: én med 34 strenge fra `promille/page.tsx` (testen fjerner
`{locale === "da" && (`-porten, så landestabelens danske rækker bliver
læsbare) og én med 1 fra `procent/page.tsx` (plantet JSX-lækage). Begge
gendannes i en `finally`. Det er **ikke** fund i din diff. Kør gaten separat:
`node scripts/locale-leak.mjs --gate` (exit 0).

**Generelt om gaten:** `REVIEWED`-poster i `scripts/locale-leak.mjs` matches på
`file` + `key` + `string`, **ikke** linjenummer — så en indsats i en fil flytter
ikke godkendt-fund. Det er rettet mod den tidligere notat i planen.

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

### Resultatet af målingen 30/9 (fulde tal i `docs/plan-arkiv.md`)

Målt på det *live* site 30/9 kl. 15:45-16:10. **Tre ting er IKKE flaskehalsen**,
så brug ikke en iteration på dem igen:

1. **Teknisk SEO er ren.** `/procent`, `/dato`, `/tidsberegner`, `/moms`,
   `/tidszone`, `/alder` på begge domæner: `hreflang` (da + sv + x-default),
   canonical til sig selv, `og:locale`, `<html lang>`, `robots index,follow`.
   Sitemap 140 `<loc>` på minberegner.dk, 73 på beraknare.se.
2. **Ingen forældede sider.** `/dage-til/1-december` har dynamisk title,
   canonical til sig selv, 18 af 19 søskend i linkene. Ingen orphaner.
3. **Ordantal forudsiger IKKE position.** Sidets *mindst* tekst (`/kvadratmeter`,
   741 ord) har sitets bedste rangering (pos. 4,9); sidet med *mest* tekst
   (`/tidszone`, 1.756 ord) ligger på 7,5. "Skriv mere tekst på de store sider"
   er altså en dyr fejlretning.

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

**F2. [x] ✅ `ceo/procent-rabat-spørgsmal` — `/procent` svarar nu på frågan.**
Overskrift, formel (`Rabatprocent = (Prisnedsættelse ÷ Normalpris) × 100`),
gennemregnet eksempel på läsarens egna tal (9.000 → 7.875 kr = 1.125 kr ned =
**12,5 %**), fällan med den nye prisen (14,3 %) og en sats-tabell med det man
*sparar* og det man *betalar*. Alt tal udledt af `RABAT_EKSEMPEL`/`RABAT_SATS`,
9 nye tests hvor 8 fejler mod gammel kode. Se arkivet. **MÅL:** `/procent`
150.470 visninger / 97 klik / CTR 0,1 % (GSC 2026-08-31 → 2026-09-28). Genmål
14 dage efter at den er live.
**F2b. [x] ✅ `ceo/procent-svensk-rabatt-faq` — FAQ'en rammer de fire
formuleringer, svensk autocomplete har.** Fire nye svenske rækker ("Hur stor är
rabatten i procent?", "Hur mycket rabatt i procent får jag på en vara?", "Hur
räknar man ut rabatt i procent i Excel?", "Vad är procentuell rabatt?") plus
den danske "Hvordan regner man rabat i procent?" (metoden i tre trin + fælden
med 14,3 mod 12,5). **Alle tal er regnet** af `RABAT_EKSEMPEL`/`RABAT_BELOEB`/
`RABAT_SATS` gennem et tal-bundt pr. sprog, så de ikke kan glide fra afsnittet
lige oven i dem; 33 % fik navnet `RABAT_SATS_UDLAET` i `procent.ts`, fordi to
sætninger og to FAQ-svar regner med den. 10 nye tests, heraf fire mutations-
kontrollerede (hardkodet forkert tal, manglende U+00A0-normalisering, rækkerne
fjernet) — alle faldt i den mutatede kode. Se arkivet.
**MÅL:** se `/procent` 26.933 visninger / 2 klik / CTR 0,0 % / pos. 9,9 (GSC
2026-08-31 → 2026-09-28). Genmål 14 dage efter at den er live.

**F3. [ ] Beraknare.se: position, ikke titel.** 190.447 visninger på pos.
8-10. Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes
før de svenske titelændringer fra C195/C196 er målt. Efter den dato er
dette den største enkeltpost i trafikplanen. **Accept:** se opgave 187.

**F4. [ ] Forsiden som indgangspunkt.** `/` har 465 indgangssider og 38 %
bounce mod 2-7 % på beregnerne; beraknare.se `/` har 80 % bounce på 20
besøgende. Direct-trafikken er 1.050 besøgende/28d. **Accept:** de otte
mest brugte beregnere ligger i det første skærmbillede på 390 px, målt med
skærmbilleder (kræver Playwright — se ❓).

**F5. [ ] Søg på de 27 % ikke-Google-trafik.** Bing 1.319 + DDG 378 +
Yahoo 274 besøgende/28d. IndexNow er kodet og instrumenteret
(`src/lib/indexnow.ts`, `src/app/api/internal/indexnow/route.ts`), men
`❓ Til Mads` spørger om krogen efter deploy er sat op — uden svar er
Bing/DDG/Yahoo indeksering uafhængig af vores deploys.

**F6. [x] ✅ `ceo/no-locale-tag` — de seks Intl-tag der sendte norsk til dansk
formatering.** Den håndskrevne kæde `locale === "se" ? "sv-SE" : "da-DK"` har
kun to arme, så `no` faldt igennem til dansk. Retter alle **seks** steder:
`ProteinbehovBeregner` (den eneste med synlig fejl — 500 kg på højeste niveau er
præcis 1.000 g, som `da-DK` skriver "1.000" med punktum og `nb-NO` "1 000" med
U+00A0), `TerminBeregner`, `KalorieBeregner`, `AlderLevetSvar`, `/dato` og
`/tidsberegner`. De fire andre har ingen *observerbar* fejl i dag — se målingen
nedenfor, den er ærlig om hvorfor de alligevel er rettet. Ny port
`src/lib/intl-locale-tag.test.ts` scanner hele `src/` og fejler på **formen**
(kæde med svensk/dansk tag og ingen `nb-NO` indeni), så klassen kan ikke komme
tilbage. 8 nye tests, 3 mutationer kontrolleret. Se arkivet.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 626 filer
npm run test     # vitest run            — 3231 tests / 196 filer
npm run build    # next build            — 142 sider
node scripts/locale-leak.mjs --gate       # exit 0
```

Sidens tekst kan regnes pr. request: `getPageData` løser `/alders
{ALDER}`-pladsholdere ved hvert kald (se `src/lib/alder-side-tekst.ts`), så
et alders-tal i et snippet følger dagen. Dagens dato læses i sidens egen
tidszone via `iDagISidensTidszone` — `tilIsoDato(new Date())` læser
*serverens* tidszone og er et døgn bag mellem 00:00 og 02:00 dansk tid.

`tsc --noEmit` er **ikke** del af gaten: **80** kendte forhåndsfejl, alle i
`*.test.ts(x)` og **0 i ikke-test-filer**. Genmålt 30/9 17:53 på `master` og på
`ceo/no-locale-tag` — tallene er ens, så ingen af denne ændringer har tilføjet en.
Planen sagde 72; de otte ekstra kom fra commits efter sidste måling. Verificér
fremover med `git stash -u` før og efter, som gjort her.

## Åbne VERIFICÉR DEPLOY-noter

**Én note åben.** HTTP 200 beviser intet: noten rører Intl-formatering, og
en fejl i den er usynlig i en dansk browser. De otte lukkede noter er verificeret
30/9 17:46-17:53 på indhold; alle målinger står i `docs/plan-arkiv.md`.

- ⏳ **Norske tal skal ikke få dansk tusindtalsseparator.** `ceo/no-locale-tag`.
  Kontrollér **indhold** på `https://beregner.no/proteinbehov` (latent — domænet
  404’er i dag, så læg på dansk og svensk at dansk/svensk output er uændret):
  `ProteinbehovBeregner` skal bruge `getIntlLocale`, og ingen fil må stå med
  den toarmede kæde `locale === "se" ? "sv-SE" : "da-DK"`. Den praktiske prøve på
  dansk er, at `npm run test` fortsat er grøn på
  `src/lib/intl-locale-tag.test.ts` efter deploy. Vindue **30/10 07:30** (denne
  merge sker efter 17:30).

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
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
