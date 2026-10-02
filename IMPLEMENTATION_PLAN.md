STATUS: 2/10 12:35. CI grøn. Sentry MINBEREGNER-1 er Next-router-støj (filtreret
   siden 3e67ed3), MINBEREGNER-2 rettet i `4d48370`+`def070c`. Alle tre
   review-fund fra 2/10 lukket (`3875b83`, `73c7e64`, `def070c`), CEO-kø punkt 0
   lukket (`04ca30a`). PR-TJEK 2026-10-02: ingen åbne PR'er. BRANCH-TJEK 2/10:
   ingen forældede.
   **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` · `npm run build`
   — målt grøn 2/10 12:30 (3713 tests i 228 filer, +5 fra `ceo/boernepenge-indlaeg`).
   **Denne iteration: `ceo/boernepenge-indlaeg`.** VERIFICÉR DEPLOY-noten står i
   tabellen nederst. ceo/boernepenge-indlaeg 2/10 12:35
   **Næste iteration skal være en feature** (Fase 3-reglen: mindst hver tredje
   opgave), ikke endnu en fil i F5b-kæden.

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. Rækkefølgen er trafikrækkefølge. ✅ betyder lukket; detaljerne
står i `docs/plan-arkiv.md` under hvert slug.

**Åben række (strenglisten, 70 fund):** næste fil er
`src/app/blog/su-2026-satser-og-regler/page.tsx` (6 fund — `/su` er samtidig en
faldende side, 203 → 129), derefter `arveafgift-regler-og-satser` (7 + 15).

**Åben:** `/boligsalg` — 9 fund, hvor 8 er redaktionelle prisintervaller (mægler,
tinglysning, avance, byggeskade …) uden kilde i repoet, og den niende er
«opdateret august 2025». Formelbeløb kan læses fra `src/lib/boligsalg.ts`
(findes, har tests); prisintervallerne kræver en kilde.

**Åben:** `/moms` har 3 fund tilbage, som er lovgrænser — dansk registrering
over 50.000 kr, svensk over 120.000 kr og «told ved import over 1.150 kr» (en
EUR-grænse, der ikke må stå som fast tal). De kræver en kilde, se ❓ nedenfor.

**Åben:** `/timepris` mangler **norsk brødtekst** på siden (kun `da` og `se`
har et afsnit) — ❓ kilde til norske timepriser låser både brødteksten og
tabellen.

**Åben:** blogindlæg generelt (19 filer, 273 fund). Redaktionelle beløb i et
indlæg er ikke samme fejlklasse som et beløb på en beregnerside. Beslut først,
om de skal med; ellers skal de stå i portens undtagelsesliste som *blog*.

**Åben:** IndexNow — nøglefil serveres, krogen efter deploy virker
(`src/instrumentation.ts` → `submitDeploymentIndexNow()`). ❓ om
`INDEXNOW_ENABLED=true` og `INDEXNOW_API_KEY` i Dokploys env.

**Åben:** opgave 187 (svenske slugs + 301-redirects) — **13/10**, må ikke flyttes
før de svenske titelændringer er målt.

**Åben:** F1 — søgeniveau-data for `/procent` (150.470 visninger, 0,1 % CTR,
pos. 7,4). GSC's tre søgninger summerer 364 visninger af 150.470. ❓ se
nedenfor.

## ❓ Uafklaret — ferielov (rammer `/dage-til/summerferien` **og** skolestart)

  ❓ ferielov (se nedenfor) er **stadig åbent**. Denne iteration rørte hverken
  skolestart eller sommerferien — de to nye påske-ankrede sider er fastelavn
  og palmesøndag, fordi de er påskedagen minus et fast antal dage og derfor
  ikke kan være forkerte af ferieloven. 1/10 17:55 er retsinformation.dk stadig
  en SPA-skal på `eli/lsa/2024/1072`, `data.xml` og `para/3` (200 men kun
  2,8-4,5 kB HTML), `uv.dk/emner/folkeskoler` er 404, og ft.dk ligger bag
  Cloudflare.

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

**F5. [~] ✅ nøglefilen — delvis. Søg på de 27 % ikke-Google-trafik.** Bing 1.334
  + DDG 383 + Yahoo 265 + Ecosia 119 + Qwant 52 = **2.153 af 7.490** besøgende/28d
  (Plausible 2026-10-02). IndexNow er kodet (`src/lib/indexnow.ts`), og **krogen
  findes**: `src/instrumentation.ts` `register()` kalder
  `submitDeploymentIndexNow()` ved serverstart, altså efter hvert batch-deploy.
  ❓ om krogen er dermed besvaret. **Men den kunne aldrig have virket:** payload'en
  erklærede `{host}/{key}.txt`, og nøglen blev serveret på `/api/indexnow-key/…`.
  Rettet 2/10 (`ceo/indexnow-noeglefil`) — se den nye VERIFICÉR-note. *Hvad der
  stadig mangler:* `INDEXNOW_ENABLED=true` og `INDEXNOW_API_KEY` i Dokploys env
  (❓ nedenfor). Uden dem returnerer `submitIndexNow` `skipped: disabled`, og
  loggen siger `[indexnow] … skipped (disabled)` ved hver boot.


**F6. [x] ✅** norske tal uden dansk separator — port `intl-locale-tag.test.ts`.**

**F7. [x] ✅** tidsforskellers dage læst fra `afvigendeDage()`. **MÅL:**
`/tidszone` 24.324 / 104 / 0,4 % / 7,5.

**F8. [x] ✅** svenske helgdagslove kildeført. **MÅL:** se `/nedtaelling`
5.726 / 12 / 0,2 % / 9,2.

## Feature-kø

Prioriteret efter forventet effekt på **trafik**. Datagrund fra GSC 1/10
(2026-09-01 → 2026-09-29) og dansk autocomplete målt 1/10 13:05.

- **Procentpoint på `/procent`** — ✅ 1/10, `ceo/procentpoint-vaerktoej`.
  *Hvem:* alle der googler «hvad er procentpoint» (autocomplete #1 under
  «hvad er procent», 8 af 8 completions under «procent point»).
  *Accept:* værktøj + afsnit + 3 FAQ i begge sprog — leveret.
  *Datagrund:* GSC + autocomplete 1/10. **MÅL:** `/procent` 151.005 / 92 /
  0,1 % / 7,4 (da) · 27.778 / 2 / 0,0 % / 9,9 (se). Genmål 15/10.
  *Næste skridt hvis det virker:* de samme tal på sig selv — point leder
  videre til opinionsmålinger og rentetrin.
- **Procentfald på `/procent`** — ✅ 2/10, `ceo/procent-fald`. *Hvem:* alle der
  googler «procent fald beregner» (5. af 10 under «procent beregner») og «procent
  besparelse beregner» (6. af 10); svensk «procent fald» og «procent minskning» er
  10 af 10 hver. *Accept:* afsnit med formel, Excel-formel, faldtabel og
  besparelse i kroner i begge sprog — leveret. *Datagrund:* autocomplete 2/10 11:15
  + `/procent` 152.615 visninger / 0,1 % CTR / pos 7,4 (da), se 28.674 / 0,0 % / 9,8.
  **MÅL:** se STATUS. Genmål 16/10.
- **Renteprognose** — ✅ 1/10, `ceo/renteprognose`. *Hvem:* alle der
  googler «renteprognose» (10 af 10 danske completions under ordet selv, 3 af 10
  under «rente»). *Accept:* ny beregner med renteomlægning, afdragsform og
  rentesvingning — leveret. *Datagrund:* autocomplete 1/10.
  **MÅL:** ny side, ingen baseline. Genmål 15/10 på Plausible og GSC.
  *Næste skridt:* de samme completions peger på banknavnene — overvej en
  `/renteprognose`-tilføjelse der viser forskellen på 3-årig og 5-årig.
- **Autocomplete: 28 seeds målt 1/10.** *Accept (delvis):* seeds målt og
  klyngerne skrevet herunder — det stærkeste klynge er bygget. Resten er
  prioriteret. *Datagrund:* `suggestqueries.google.com`, hl=da gl=dk.
  **Målt igen 1/10 22:20 på fire nye seeds — alle fire er dækket eller
  kildeblokerede:** `annuitetslån` (10/10, men «serielån vs» og «formel bevis»
  er allerede et `<h2>` på `/renteberegner` + FAQ), `promille` («promille på 2»
  svarer siden med «Hvor mange promille er 2 øl?»), `rentefradrag` (loft/sats/
  begrænsning er hele siden), `boligstøtte` (2 af 10 er **udbetaling** —
  «hvornår kommer pengene» — og det findes ingen overskrift om; kræver
  betalingsdato fra en kilde, `borger.dk` svarer 200 men ikke fundet endnu).
  `fradrag børnebidrag` er det eneste **nye** fradrag-emne i klyngen.
  **Klynger vi ikke dækker, i rækkefølge efter hvor ren intentionen er:**
  (1) *dagpenge* — «dagpengesats 2026», «dagpenge nyuddannet», «dagpengekort»,
  «dagpengetæller», «dagpengesats 2026 efter skat»: 6 af 10 er konkrete satser
  på to underemner (nyuddannet, efter skat). Vi *har* `/dagpenge` — spørg om
  satsen i stedet for at bygge en ny side. (2) *børnepenge 2026* — ✅ 2/10,
  `ceo/boernepenge-udbetalingsdatoer`. «børnepenge hvornår» (10 af 10) og «børnepenge
  juli» (10 af 10) besvares nu på kalkulatoren selv med dagens dato, ikke kun i
  blogindlægget. Datoerne læses fra samme modul som satsen. **MÅL:** ingen baseline
  endnu; blogindlægget er reference med 6.126 visninger / 41 klik / 0,7 % / pos. 8,4.
  (3) *fradrag 2026* — «fradrag for fitness», «fradrag for rengøring»,
  «fradrag havearbejde», «fradrag sommerhusudlejning». **Delvis lukket 1/10:**
  rengøring og havearbejde er servicefradraget (18.300 kr.), og de to felter hedder
  nu «Rengøring, have m.fl.» — men boligjob-lofterne var 2025-tal og er rettet,
  se `ceo/boligjob-lofter-2026`. Fitness og sommerhusudlejning mangler stadig og
  kræver en sats, der kan læses i en kilde (skat.dk er 500). (4) *skoleferie/skolestart 2026* — «skoleferie 2026»,
  «skolestart 2026»: matcher `/dage-til`-mønstret, men ❓ opgave 201 (ferielovens
  startdato) blokerer det. (5) *renteprognose 2026/2027/2030* — årstal-varianter
  af den side vi lige byggede; de er samme intention, så de skal **ikke** blive
  egne sider.

- **Emoji ud, rigtige ikoner ind — ✅ ALLEREDE FÆRDIG, lukket 2/10.**
  *Målt 2/10 med `rg --pcre2 '[\p{Extended_Pictographic}]' src/`:* **13 filer,
  4 forekomster i alt** — `dage-til.test.ts` (2), `sentry-config.ts` (1),
  `satser-2026.ts` (1). `home-data.ts`, `navigation.ts`, `categories.ts` og
  `calculator-list.ts` har **0**, og har ikke haft det siden `bd832b2`,
  `de373f4`, `9e50974` og `54b07fd` (alle på master). `src/lib/icons.ts`
  findes og bruges af `src/components/ui/`. **Den gamle plantekst sagde «~154
  emoji i home-data.ts» — det er ikke længere sandt og må ikke bruges som
  datagrund.** De 4 resterende er i test- og konfigurationsfiler, ikke i UI'et.
- **Landing-side pr. konkrete countdown-spørgsmål** (`/dage-til/<slug>`).
  *Hvem:* «hvor mange dage er der til 1 december» 1.209 visninger, 3 klik,
  pos. 5. *Accept:* de fire sider findes allerede (jul, nytår, sommerferie,
  skolestart) med svaret i `<title>` og i sitemap — **mål om de ranker, før
  der bygges flere.** *Datagrund:* GSC 1/10. ✅ **Udbygget 1/10** med fastelavn,
  palmesøndag og 2. juledag (`ceo/dage-til-fastelavn-palmesondag-2juledag`) —
  seks sider, autocomplete 1/10, ingen ny kilde. Nu er der 22 da + 19 se
  `/dage-til`-sider (målt med `getDageTilSlugs`), og hver af dem linker til de
  øvrige. **MÅL:** nye sider, ingen baseline. Genmål 15/10.
- **Pristalsregulering på `/husleje`** — ✅ 1/10. *MÅL:* `/husleje` 161
  besøgende/28d, bounce 4 % (Plausible 2026-10-01). GSC har ingen
  `/husleje`-visning i top-15, så CTR-baseline er **ikke** kendt — trafikken
  er overvejende ikke-Google. Genmål 15/10.
- **Forskelsside til `/dato` og `/tidsberegner` på beraknare.se.** *Hvem:*
  190.447 svenske visninger på 0,12 % CTR. *Accept:* CTR over 0,3 % på 14
  dage. *Datagrund:* GSC se, 1/10. **Kan ikke før 13/10** (opgave 187).
- **Pace/lap-beregner til løb og cykel** — ✅ 2/10, `ceo/pace-tidsberegner`.
  *Hvem:* «marathon tid beregner», «km tid beregner», «pace tid beregner» og de
  fem øvrige sport-completions under «tid beregner». *Accept:* tempo fra
  løbetid **og** løbetid fra tempo, holdtider pr. kilometer der summerer til
  totalen, tests, da+se side og interne links — leveret. *Datagrund:* GSC 1/10
  (`/tidsberegner` 74.546/203/0,3 %/6,9) + `suggestqueries` 2/10 02:45.
  **MÅL:** `/pace` er ny, ingen baseline; `/tidsberegner` 290 besøgende/28d
  (bounce 8 %) er gruppen den skal flytte. Genmål **16/10**.
  *Næste skridt ✅ 2/10:* de syv distancer under «tid beregner» er nu **svar på
  siden**, ikke kun et værktøj — `ceo/pace-marathon-faq` tilføjede marathon-, 10 km-
  og halvmarathonspørgsmål i begge sprog, beregnet af `beregnPace`, plus otte
  distancetermer i `keywords` (autocomplete målt 2/10 04:40, 7 af 10 completions).
  Cykel-udgaven er stadig samme værktøj, så det er et spørgsmål om svensk/dansk
  rækkefølge i autocomplete, ikke om en ny side.
- **«Hvad er klokken i …»-clusteret — ✅ 2/10, `ceo/klokken-i-land`.**
  *Hvem:* **10 af 10** danske completioner under «hvad er klokken i» er et land
  eller en by (usa, danmark, thailand, new york, australien, japan, tyrkiet,
  canada, usa nu, kina) — målt 2/10 04:05 på `suggestqueries`, hl=da gl=dk.
  *Accept:* `/klokken-i/<land>` + `/klockan-i/<land>` med 12 lande, svaret i
  `<h1>` og i `<title>`, USA's fire tidszoner som egne rækker, tidsforskel
  **regnet** fra kalenderen, 15 tests, `daily` i begge sitemap — leveret.
  *Datagrund:* autocomplete 2/10 + `/tidszone` 24.358 visninger / 0,4 % CTR /
  pos. 7,6 (GSC 1/10), `beraknare.se/tidszone` 3.527.
  **MÅL:** `/klokken-i/*` er nye sider, ingen baseline. `/tidszone` 24.324 /
  104 / 0,4 % / 7,5 er gruppen de skal flytte. Genmål **16/10**.
  *Tre valg der lå i koden, ikke i vilje:* (1) **Ingen** `/klokken-i/danmark`
  og ingen `/klockan-i/sverige` — en læser der spørger om sit eget land kan se
  svaret på telefonen, og siden ville være tynd fyld. (2) Ingen
  `/klokken-i/new-york`: byen er en række på USA-siden, så en egen side er den
  samme side igen. (3) `force-dynamic` på begge ruter — ellers frosser `next
  build` klokkeslættet på livstid, og alle 24 sider ville stå med det samme
  tidspunkt.
  *Næste skridt ✅ 2/10:* blogindlægget `/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`
  linker nu til `/klokken-i/usa`, og `/tidszone` har en sektion med alle 12
  links i begge sprog (`ceo/tidszone-links-til-lande`) — de 24 sider havde
  ingen indgang *fra* den side, der har flest visninger.
- **Dagpenge-sats efter skat på `/dagpenge`** — ✅ 2/10, `ceo/dagpenge-efter-skat`.
  *Hvem:* «dagpenge nyuddannet» har **10 af 10** danske autocomplete-træffere, og
  «dagpenge sats 2026 efter skat» er nr. 2 under «dagpenge sats 2026» og nr. 4
  under «dagpenge sats» (målt 2/10 11:25) — mens siden lovede «dagpenge efter
  skat» i sin egen `keywords` og FAQ og viste **nul** beløb efter skat.
  *Accept:* beløb efter skat for alle syv satser, tre nye FAQ-spørgsmål, syv
  beløb læst fra ét modul i stedet for at stå i fem strenge — leveret.
  *Datagrund:* autocomplete 2/10 11:25 + `/dagpenge` har ingen GSC-top-15-plads,
  så CTR-baseline er **ikke kendt**; trafikken måles i Plausible og genmåles ved
  næste snapshot.
- **Kalorieguide på `/kalorier`.** *Hvem:* 9 af 10 danske autocomplete-træffere
  under «kalorier» er madvarer. **Blokeret på kilde** (opgave 119, ❓) — må
  ikke gættes tal.

- **Timer pr. periode på `/tidsberegner`** — ✅ 2/10, `ceo/timer-periode`.
  *Hvem:* alle der googler «hvor mange timer er der på et år» (autocomplete
  **nr. 1** under «hvor mange timer» 2/10) og «hvor mange timer i en uge»
  (nr. 1 under «timer i en uge»); svensk «hur många timmar är det på ett år».
  *Accept:* fem perioder (døgn, uge, måned, kvartal, år) med dage, timer,
  minutter og sekunder i begge sprog, måned og kvartal som **snit** af 365
  dage, skudåret nævnt, to nye FAQ-spørgsmål pr. sprog, 8 nye
  enhedstests + 1 renderport — leveret. *Datagrund:* autocomplete 2/10 +
  GSC `/tidsberegner` 75.622 / 194 / 0,3 % / 6,8.
  **MÅL:** `/tidsberegner` 291 besøgende/28d, bounce 8 % (Plausible 2/10);
  GSC 75.622 / 194 / 0,3 % / 6,8 (1/10). Genmål **16/10**.
  *Næste skridt:* det samme spørgsmål findes i beraknare.se-versionen, men
  `/tid` har ingen `/timer-i-…`-rute; overvej at samme tabel får en svensk
  `<title>`-frase, når opgave 187 (svenske slugs) sætter gang 13/10.

## Åbne VERIFICÉR DEPLOY-noter

Batch-deployeren kører 07:30/12:30/17:30/21:30. Prøverne er på **indhold**,
aldrig på HTTP 200: en 200 beviser at svaret serveres, ikke at det er den nye
kode. Hver note er én linje; den fulde kommando står i `docs/plan-arkiv.md`
under sit slug. Noterne med vindue **2/10 12:30** måles efter kl. 12:30.

| Slug | Prøv på indhold |
|---|---|
| `boernepenge-indlaeg` (**ny**, vindue 2/10 17:30) | `minberegner.dk/blog/boernepenge-2026-satser-og-regler`: `<title>` skal være **byte-uændret** «Børnepenge 2026: 5.370 kr./kvartal (0-2 år)» og `<meta name="description">» «Børnepenge 2026: 5.370 kr./kvartal (0-2 år), 4.248 (3-6 år), 3.342 (7-14 år) og 1.114 kr./måned (15-17 år). Sådan deles ydelsen mellem jer.» — de er nu bygget af `BOERNE_SATSER_2026`, så tallene er de samme, kun kilden er ændret. Aftrapningseksemplet skal sige «Dit indtægtsgrundlag er 1.100.000 kr. i 2026. Beløbet over grænsen er 138.900 kr. Nedsættelsen bliver 2 % × 138.900 kr. = 2.778 kr. årligt. Har du to børn på 0-2 år (21.480 kr × 2 = 42.960 kr.), får du udbetalt 40.182 kr.» — **intet** «16.110 kr» eller «32.220 kr». FAQ'en skal have **ti** spørgsmål, og «Hvornår skifter børnepengen sats, når barnet bliver ældre?» skal svare «… Ungeydelsen er 1.114 kr. pr. måned, altså 13.368 kr. om året.» og «Hvad er forskellen på børnepenge og barnetilskud?» «… 1.741 kr. pr. kvartal pr. barn, 1.774 kr. i ekstra børnetilskud … 5.025 kr. i særligt børnetilskud ved adoption.». Familietabellen skal have `10.740`, `9.618`, `11.838` og `6.684` i kolonnen «Pr. kvartal» |
| `dagpenge-efter-skat` (**ny**, vindue 2/10 12:30) | `minberegner.dk/dagpenge`: sats-tabellen skal have **syv** rækker med to tal pr. række — `Med beskæftigelsestillæg / 26.198 kr / ca. 18.160 kr efter skat`, `Max dagpengesats, fuldtidsforsikret / 22.041 kr / ca. 15.544 kr efter skat`, `Dimittend, fuldtid med forsørgelsespligt / 18.074 kr / ca. 13.047 kr efter skat`, `Dimittend, fuldtid uden forsørgelsespligt / 15.759 kr / ca. 11.590 kr efter skat`, `Max dagpengesats, deltidsforsikret / 14.694 kr / ca. 10.919 kr efter skat`, `Dimittend, deltid med forsørgelsespligt / 12.049 kr / ca. 9.255 kr efter skat`, `Dimittend, deltid uden forsørgelsespligt / 10.506 kr / ca. 8.283 kr efter skat` — med **hele kroner**, ingen decimaler («18.160,026» er den fejl porten fangede). Indledningen skal sige «25,049 % i kommunaleskat». FAQ'en skal have **otte** spørgsmål, og de tre nye skal starte med «Hvad er dagpengesatsen for nyuddannet i 2026?» → «… 15.759 kr pr. måned før skat uden forsørgelsespligt, og 18.074 kr hvis du har forsørgelsespligt. Det er 71,5 % hhv. 82 % af maxsatsen på 22.041 kr.», «Hvor længe har nyuddannede ret til dagpenge?» → «… normalt 2 år, svarende til 3.848 timer fuldtid, inden for 3 år.» og «Skal jeg betale skat af dagpenge?» → «… ca. 15.544 kr om måneden tilbage på kontoen.». **Intet** «1.924 kr timer» nogen steder — det stod på den live side 2/10. `minberegner.dk/dagpenge`s `<meta name="description">` skal være uændret i ordlyd: «Beregn dagpenge 2026. Max sats: 22.041 kr/md (90% af løn efter AM-bidrag). Med beskæftigelsestillæg op til 26.198 kr/md. Beregn din dagpengesats ud fra din løn.» |
| `blog-indlaeg-belob-fra-modul` (**ny**) | `minberegner.dk/blog/saadan-finder-du-din-timepris-som-freelancer`: tabellen «Typiske timepriser i Danmark (2026)» skal have fire grupperækker (`IT & Udvikling`, `Kreativ & Marketing`, `Rådgivning`, `Håndværk & Service`) med de 12 poster, hver som `<postnavn> <interval> kr` — altså `Senior udvikler 800-1.200 kr` (ikke 1.400), `Grafisk designer 500-800 kr`, `Konsulent 800-1.500 kr`, `Fotograf 500-1.500 kr`. **Intet** «Junior»/«Senior»-hoved, intet «800-1.400», intet «600-900 kr», intet «1.000-2.000 kr». FAQ'en «Hvad er en normal timepris for en freelancer?» skal svare «… seniorudviklere 800-1.200 kr, tekstforfattere 600-1.000 kr, konsulenter 800-1.500 kr …» i både JSON-LD'en og den synlige tekst, og noten «Priserne er vejledende og ekskl. moms.» skal stå under tabellen. `/timepris` skal være **byte-uændret** |
| `pace-marathon-faq` (**ny**) | `minberegner.dk/pace`: FAQ'en skal have «Hvad er et godt tempo for en marathon?» → «På 42,195 km er 3:30:00 et tempo på 4:59 pr. kilometer.», «Hvad er et godt tempo for en halvmaraton?» → «På 21,0975 km er 1:45:00 et tempo på 4:59 pr. kilometer.» og «Hvad er et godt tempo på 10 km?» → «På 10 km er 50:00 et tempo på 5:00 pr. kilometer.» — hver med «… Hvad der er godt for dig, afhænger af din træning og din målsætning.» **Intet** «halvmarahton» nogen steder på siden eller i JSON-LD'en. `beraknare.se/pace` skal have de samme tre spørgsmål med «per kilometer» og **ikke** «pr. kilometer». |
| `tidsberegner-faq-fra-modul` (**ny**) | `minberegner.dk/tidsberegner`: FAQ'en skal have «Hvor mange timer er der i et år?» → «Et år har 365 dage, og 365 × 24 = 8.760 timer, altså 525.600 minutter. Måned og kvartal er gennemsnit af året, så en måned er 730 timer.» og «Hvor mange timer er der i en uge?» → «En uge har 7 dage, og 7 × 24 = 168 timer, altså 10.080 minutter. Et døgn har 24 timer, så en måned er 730 timer og et skudår 8.784 timer.». `beraknare.se/tidsberegner`: «Ett år har 365 dagar, och 365 × 24 = 8 760 timmar, alltså 525 600 minuter.» og «En vecka har 7 dagar, och 7 × 24 = 168 timmar, alltså 10 080 minuter. Ett dygn har 24 timmar, så en månad är 730 timmar och ett skottår 8 784 timmar.». Begge steder **skal** have præcis disse tal; de svenske nu med U+00A0 som `Intl` skriver tusindtalsseparatoren (ligesom resten af sitets svenske tal). De norske `faqItems` på `/tidsberegner` er **uændrede** — de har ikke de to spørgsmål |
| `timepris-lokale-tal` (**ny**) | `beraknare.se/timepris` og `beregnerno/timepris`: de ni rækker med tusindtalsskiller skal have **mellemrum**, ikke dansk punktum — `Senior utvecklare: 800–1 200 DKK`, `IT-konsult: 900–1 500 DKK`, `Konsult: 800–1 500 DKK`, `Advokat: 1 500–3 500 DKK`, `Revisor: 900–1 800 DKK`, `Copywriter: 600–1 000 DKK`, `Marknadsföringskonsult: 700–1 200 DKK`, `Fotograf: 500–1 500 DKK`, `Lärare: 500–1 000 DKK`. **Intet** «1.500»/«3.500»/«1.800» på de to domæner (der er «.» decimaltegn, så «1.500» læses som 1,5). FAQ'en skal sige «Dansk nivå: IT 900–1 500 DKK/timme, hantverkare 400–600 DKK/timme.». `minberegner.dk/timepris` skal være **byte-uændret**: «Advokat: 1.500-3.500 kr», «IT-konsulent: 900-1.500 kr», FAQ «IT: 900-1.500 kr/time. Håndværkere: 400-600 kr/time.» Målt 2/10 07:20 før rettelsen: de svenske og norske sider skrev dansk punktum |
| `timepris-markedspriser` (**ny**) | `minberegner.dk/timepris`: overskriften skal være «Typiske timepriser i Danmark (2026)», de 12 rækker skal være `Junior udvikler: 500-700 kr`, `Senior udvikler: 800-1.200 kr`, `IT-konsulent: 900-1.500 kr`, `Grafisk designer: 500-800 kr`, `Tekstforfatter: 600-1.000 kr`, `Marketing konsulent: 700-1.200 kr`, `Konsulent: 800-1.500 kr`, `Advokat: 1.500-3.500 kr`, `Revisor: 900-1.800 kr`, `Håndværkere: 400-600 kr`, `Fotograf: 500-1.500 kr`, `Underviser: 500-1.000 kr`; **intet** «i Sverige» eller «i Norge». FAQ'en skal sige «IT: 900-1.500 kr/time. Håndværkere: 400-600 kr/time.» på minberegner.dk og på de to andre domæner «Dansk nivå: IT 900–1 500 DKK/timme, hantverkare 400–600 DKK/timme.» (rettet 2/10 10:05: «900–1 500», se `timepris-lokale-tal`) — **intet** «1.800 SEK» eller «1.800 NOK». `beraknare.se/timepris` overskrift «Danska typiska timpriser (2026)» + noten «Nivåerna nedan är danska…», `beregnerno/timepris` «Danske typiske timepriser (2026)» + «Nivåene nedenfor er danske…». Kopierknappen skal på beraknare.se sige «Rekommenderad timpris: …» og på beregnerno «Anbefalt timepris: … ekskl. mva» |
| `timer-periode` (**ny**) | `minberegner.dk/tidsberegner`: «Hvor mange timer er der i et døgn, en uge, en måned og et år?» med fem rækker `Et døgn 1 24 1.440 86.400` · `En uge 7 168 10.080 604.800` · `En måned (snit af 12 måneder) 30,42 730 43.800 2.628.000` · `Et kvartal (snit af 4 kvartaler) 91,25 2.190 131.400 7.884.000` · `Et år 365 8.760 525.600 31.536.000`, og «Et skudår har 366 dage, altså 8.784 timer». `beraknare.se/tidsberegner`: samme fem rækker med **mellemrum** i separatoren (`8 760`, `525 600`, `31 536 000`) og «Ett skottår har 366 dagar, alltså 8 784 timmar»; **intet** «Hvor mange timer», **intet** «En vecka» på minberegner.dk |
| `moms-eksempler-fra-modul` (**ny**) | `minberegner.dk/moms`: introens tre listeregler skal være `Læg moms til: … 1.000 kr. × 1,25 = 1.250 kr. inkl. moms`, `Træk moms fra: … 1.250 kr. ÷ 1,25 = 1.000 kr. ekskl. moms` og `Find momsandelen: … 1.250 kr. × 0,20 = 250 kr. i moms`; «er 2,4414, så 1.000 kr. bliver 2.441,41 kr.» og «bliver prisen 0,4096 af den oprindelige — altså 409,60 kr. i alt»; **intet** «kun 410 kr. oveni». `beraknare.se/moms`: de samme tre linjer med **mellemrum** i separatoren (`1 000 kr × 1,25 = 1 250 kr inkl. moms`), «2,4414»/«0,4096», «10,71 %»/«5,66 %», og Excel-rækkerne `1 000 kr exkl. → 1 250 kr inkl.`, `1 250 kr inkl. → 1 000 kr exkl.`, to gange `1 250 kr inkl. → 250 kr i moms`. Uændret: de tre lovgrænser og alle tabeller |
| `error-side-locale` (**opdateret 2/10 10:35**) | Samme note som før — rodens fejlside kan ikke udløses uden en kastende fejl, så der er ingen HTML-prøve. Verificér at `minberegner.dk/api/health` svarer `status: ok`, og at der i 14 dage **ikke** dukker en Sentry-hændelse med `useLocale must be used within a LocaleProvider` op. **Den nye del af rettelsen** er dækket af `error.test.tsx` alene: `renderToStaticMarkup` med `LocaleProvider locale="se"/"no"` skal give «Något gick fel» og «Noe gikk galt» og **ikke** «Noget gik galt» |
| `fejlside-locale` (**ny**) | Samme som `error-side-locale` — ingen HTML-prøve findes, fordi fejlsiden ikke kan udløses uden en kastende fejl. Den er kodetestet i stedet: `error.test.tsx` skal være **3 tests** grønne, og de to nye skal være røde mod den gamle kode |

## ❓ Til Mads

- ❓ **Kilde til svenske og norske frilanstimepriser (ny, 2/10).**
  `/timepris` viste «Typiske timepriser i Norge (2026)» og «Typiska timpriser
  i Sverige (2026)» over **danske** niveauer, og FAQ'en påstod samtidig
  «IT: 900-1.800 SEK/timme» og «900-1.800 NOK/time» — tal der stod ingen
  steder i koden. 2/10 står tabellen derfor som **dansk** på alle tre domæner,
  og overskriften og noten siger det. **Ét skærmbillede af et niveau (f.eks.
  en fagforening eller etmarkedstal for Danmark, Sverige og Norge) låser
  den rigtige version**, som kan lægges i
  `src/lib/timepris-markedspriser.ts` pr. `Locale` og få hvert domæne sine
  egne tal. Samme kilde ville kunne give `/timepris` sin manglende norske
  brødtekst.
- ❓ **Ser du events fra minberegner.dk i Sentry-projektet?** Transporten er
  **bevist** (`sentry-send.test.ts` får en rigtig envelope gennem den rigtige
  `initSentryServer()`), men det beviser ikke at **dit projekt** modtager. Ét
  skærmbillede af projektet — eller en bevidst fejl i et prod-build med et
  `[Sentry]`-flag — låser det. Jeg kan ikke se det: API'en kræver din konto.

- ❓ **Hvilken vægtafgift har en elbil i Danmark i 2026?** (ny, 2/10.)
  `/bil` skrev «Elbil: 0 kr (til 2026)» og «Afgifter kommer (2026+)» — to
  påstande om en afgiftsperiode, som ingen kilde i repoet underbygger, og
  `skat.dk` svarer HTTP 500 (forsøgt 2/10 05:00). Teksten siger nu kun, hvad
  beregneren regner med, og tallet ligger i `bil-omkostninger.ts` som
  `DRIFT.da.vaegt.el`. **Ét skærmbillede af afgiftssatsen (eller teksten
  kopieret herind) låser det**, og så kan både beregneren og artiklen få det
  rigtige tal. Samme spørgsmål for Sveriges fordonsskatt på elbiler: siden
  sagde 360 kr, beregneren sagde 0, og begge tal er uverificerede.
- ❓ **Kilder til de tre momslovgrænser på `/moms` (ny, 2/10).** De er de tre
  eneste fund porten stadig ser i `src/app/moms/page.tsx`: dansk
  momsregistrering «over 50.000 kr», svensk «högst 120 000 kr per år» og
  «eventuel told ved import over 1.150 kr». Den første er ML § 48 stk. 1's
  registreringstærskel, den anden er Sveriges momsfri omsætningsgrænse, og den
  tredje er **en EUR-grænse** (150 EUR) — den må ikke stå som et fast dansk
  beløb, fordi den så bliver forkert, hver gang kursen flytter sig.
  `info.skat.dk` svarer 200 (D.A.14 Registrering findes i oversigten), men
  afsnittene ligger bag lange id'er jeg ikke kan gætte; `eur-lex.europa.eu`
  svarede tomt, og `skat.dk` er 500. **Ét skærmbillede af ML § 48 og ét af den
  svenske grænse låser de to første; EUR-Lex' bilag til forordning 1186/2009
  låser den tredje.** Indtil da står de, som de har stået.
- ❓ **Ingen læsbar kilde til fitnessfradraget og sommerhusudlejningsfradraget
  (1/10).** De to er de sidste af «fradrag 2026»-klyngen; 1/10 21:25 svarade
  hverken `dagpenge.dk` eller `star.dk`, og `skat.dk` har været 500 siden C19.
  Et skærmbillede af de to linjer i SKAT's fradragsvejledning låser dem. Uden
  det bygges de ikke, jf. punkt 11.
- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201, højst
  prioriteret).** `/dage-til/sommerferien` siger «sommerferien begynder altid
  den **sidste lørdag i juni**» og hævder, det står i folkeskoleloven (2024).
  1/10 17:55 kunne jeg ikke hente loven: retsinformation.dk er en SPA (også på
  `.xml`), `undervisningsministeriet.dk`/`ferieinfo.dk`/`ferieloven.dk` svarer
  transportfejl, `lovguiden.dk` 429, `danskelove.dk/ferieloven` handler om
  ferieloven for *ansatte*. **Ét skærmbillede af bestemmelsen låser det** —
  er reglen «den lørdag i den kalenderuge, hvori 20. juni ligger», står siden
  7 dage forkert i de fleste år. Koden er bevidst urørt: en lovpåstand uden
  kilde er præcis den fejl, CEO-køens punkt 0 handler om.
- ❓ **Kan Cloudflare cache HTML'en på trods af Next's `Vary: RSC`?** (opgave 200.)
  Next svarer `no-cache, no-store`, så alt er dynamisk: 280-433 ms TTFB på alle
  600.000 månedlige visninger. `s-maxage` på HTML'en **bryder Next's egen
  rute-navigation** (klienten genanmoder samme URL med `RSC: 1`). Løsningen er
  en Cloudflare-regel eller Worker, der springer RSC-anmodninger over — din infra,
  ikke repoet.
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
- ❓ **IndexNow mangler to env-værdier (opdateret 2/10 — krogen er ikke problemet).**
  Krogen efter deploy findes og er kodet: `src/instrumentation.ts` `register()`
  kalder `submitDeploymentIndexNow()` ved serverstart, og `.dokploy/preview.template.json`
  indeholder kun `NODE_ENV`. Så det eneste, der mangler, er at **`INDEXNOW_ENABLED=true`**
  og **`INDEXNOW_API_KEY=<8-128 teg af A-Z, a-z, 0-9, - >`** er sat i Dokploys
  miljøvariabler — det kan jeg ikke gøre selv, og nøglen skal ikke i en commit.
  Skal jeg skrive dem i `preview.template.json` som pladsholdere, eller sætter du
  dem i Dokploy? Uden dem returnerer modulet `skipped: disabled` ved hver boot,
  og du vil se `[indexnow] … skipped (disabled)` i deploy-loggen — den linje er
  det hurtigste tegn på om det virker.
- ❓ **Fulde browsermålinger kræver Playwright (ny, 30/9).** Deploy-noter der
  kræver en rigtig browser kan ikke lukkes maskinelt: repoet har ingen Playwright,
  og `CLAUDE.md` forbyder nye afhængigheder uden dit ja. Én konkret måling
  mangler: hvor højt populærgitterets første kort ligger på 390 px.
- ❓ **Kilde til madvaretabellen (opgave 119, `BLOCKED`).** `sst.dk` svarer HTTP 429
  for både browser og curl, og de fire andre danske kilder døde i C92. Enten en
  PDF af *De officielle kostanbefalinger* lagt i repoet, eller en API-nøgle til en
  dansk næringsindholdstabel, så kan `/kalorier` få pr. 100 g **og** pr. portion.
  Uden det bliver madvare-klyngen (9 af 10 danske autocomplete-træffere under
  "kalorier") liggende, selv om `/kalorier` har 289 besøgende/28d og +50 %.
- ❓ **Hvilke søgemaskiner kommer `/bmi` og `/su`s trafik fra?** (opgave 183.)
  `/bmi` har 933 besøgende/28d (-25 %) men under 4.920 Google-visninger, så
  mindst halvdelen er ikke Googles. Et skærmbillede af Plausible's kilder
  filtreret på de to sider låser diagnosen; uden den bliver faldet
  uforklarligt, og C196's titelændring kan heller ikke måles.
- ❓ **`AFHAENGIGHEDER.md`'s række for `beregner-dk` er delvis forældet.** Den
  siger "kritiske sårbarheder" og "mangler engines-erklæring". Sikkerhedsdelen er
  nu lukket (C197, `npm audit` 1 høj → 0), og runtime-kravet *er* erklæret:
  `engines.node ">=22 <23"`, `.nvmrc` = 22, `Dockerfile` på `node:22-alpine`.
  Jeg har kun verificeret denne ene række og ikke rørt filen, fordi den er fælles
  for otte projekter — en opdatering skal laves med vilje, ikke ved en
  sideeffekt.
- ❓ **Er 17,7‰ virkelig den højeste grundskyldspromille i Danmark?**
  `/ejendomsvaerdiskat`s tabel siger «Varde (højest)», og Varde står ikke i
  modulets kommune-liste, så tallet er håndskrevet og uden kilde i koden. Jeg
  har bevidst ikke ændret det — det er en påstand om kommunesatser, ikke en
  formel. Hvis du kender en kilde (bolig.guide, KL eller kommunens
  beskatningsvedtægt), lægges Varde bare ind i `GRUNDSKYLD_KOMMUNER`, og
  tabellen og dropdown'en får den samme post.
