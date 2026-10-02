STATUS: 2/10 02:40. Rød CI: ingen (seneste kørsel grøn 2/10 00:19Z). Sentry:
  MINBEREGNER-1 er Next-router-støj, filtreret siden 3e67ed3, kodetestet siden
  5f137d4. PR-TJEK: 2026-10-02 — ingen åbne PR'er. BRANCH-TJEK: ikke kørt.
  CEO-kø punkt 0 er lukket i de otte punkter; de to der ikke stod i forrige
  STATUS er verificeret i kode 2/10: sankthans er fast 23./24. juni på tværs af
  alle tre `/dage-til/*`-sider (`dage-til.ts:822-903`, ingen svensk
  midsommar-logik), og `/husleje` siger at lejeloven justerer efter
  nettoprisindekset og at nævnet **ikke** fastsætter en sats pr. område
  (`page-data.ts:1901`, `HuslejeNettoprisindeks.tsx:236`).
  **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` ·
  `npm run build`. Målt 2/10 02:38: 0 · 0 · **3551 grønne i 218 filer** · 0.
  **Denne iteration: `/ejendomsvaerdiskat` læser sats og eksempel fra et modul.**
  `ceo/ejendomsvaerdiskat-tal-fra-modul`. Satserne lå som et konstant-objekt
  *inde i* `EjendomsvaerdiskatBeregner.tsx`, og beregningen lå i en `useMemo` —
  altså utestet. Siden skrev «5,1‰», «9.007.000 kr» og eksemplet «3.000.000 ×
  80% × 5,1‰ = 12.240 kr/år» med hånden, uden at tallene hang ved satsen.
  Nu ligger satsene, kommune-promillerne og den rene `beregnEjendomsvaerdiskat()`
  i `src/lib/ejendomsvaerdiskat.ts` med **13 nye tests** (grænsen, 5,1‰/14‰
  kun over progressionsgrænsen, nul ind, custom-promille), og eksemplets tre
  regnestykker dannes fra beregningen. Listens `ejendomsvaerdiskat` er fjernet
  (6 fund) og portens sum 448 → 442.
  ⚠️ **Fund under egen diff-review:** min første `grundskyldPromilleFor` lod en
  ukendt kommune arve `customPromille` i stedet for 6,0 — en reel regression,
  fordi `valgtKommune` kommer fra URL-state. Rettet og låst i en test. Samme
  review fandt to håndskrevne **procentsatser** («0,51%», «1,4%») der nu
  dannes af samme sats, og at Aarhus skrev «6,0» før og ville have skrevet «6».
  ⚠️ **Målt i denne iteration:** en isoleret `vitest`-kørsel af den nye fil var
  **grøn**, mens hele suiten var **rød** — `BESKATTET_ANDEL` stod efter sit
  første brug (TDZ), og kun en anden fil, der importerer modulet, ramte den.
  Og et bogstav i en importliste slap igennem både `lint` og `typecheck` og
  blev først fanget af `next build`. Se de to nye opgaver.
  **Åbne VERIFICÉR-noter: 13**, alle med vindue **2/10 07:30**.


## Review-fund 29/9 — lukket (detaljer i `docs/plan-arkiv.md`)

  R1 og R2 er begge rettet i `ceo/review-fund-palmesondag-og-komponenter`; målinger,
  mutationer og den røde liste over følsomme filer står i arkivet.

## Næste opgave (klar til næste iteration)

**F5b. Beløb i JSX-tekst → modulkonstanter, i trafikrækkefølge.** `/procent` ✅ 1/10,
`/arveafgift` ✅ 2/10 og `EfterloensBeregner` ✅ 2/10 (se STATUS), se
`ceo/procent-eksempler-fra-modul`, `ceo/arveafgift-tal-fra-modul` og
`ceo/review-fund-palmesondag-og-komponenter`. Porten fra 1/10 måler beløb med
tusindtalsseparator i JSX-tekst — de kan ikke glide fra satsen, fordi de ikke
hænger ved den. Listerne i `src/app/regnestykker.test.ts` tæller forekomster pr.
fil og må kun blive kortere, så dette er rækkefølgen. *Accept pr. side:* listen
for den side falder, og regnestykkerne er verificeret af `regnestykker-porten`.
- **`/ejendomsvaerdiskat`** — ✅ 2/10 (`ceo/ejendomsvaerdiskat-tal-fra-modul`),
  se STATUS. Bemærk at `Varde (højest) 17,7‰` i kommunetabellen stadig er
  håndskrevet, fordi Varde ikke står i modulets kommune-liste. Den mangler en
  kilde, så den læses ikke fra modulet endnu — ❓ nedenfor hvis den skal.
- **`/moms`** — 21.651 visninger (0,2 % CTR, pos. 7,1), 2 fund tilbage:
  «Virksomheder med en årlig omsætning over **50.000 kr**» (registreringsgrænsen)
  og «told ved import over **1.150 kr**» — sidstnævnte er en EUR-grænse omregnet
  til kroner, så den flytter sig med valutakursen og kan ikke stå som et fast tal.
  **Begge kræver en kilde** (❓ nedenfor), så de må ikke gættes.
- **`/renteberegner`** — ✅ 2/10 for de **otte** håndskrevne tal i eksemplet,
  se STATUS og `ceo/renteberegner-eksempel-fra-modul`. De **6** fund
  `regnestykker`-porten stadig tæller på siden er *ikke* dem: de er
  rentefradrag-sætningen («33,6 %», «50.000 kr.», «100.000 kr.», «3,3 %
  efter skat» …), som står i `RENTEFRADRAG_2026`-nærheden. *Accept:* de 6
  falder, og porten tæller dem ikke, fordi de læses fra modulet.
- **Komponenterne: 0 fund** ✅ 2/10 (`ceo/review-fund-palmesondag-og-komponenter`,
  `ceo/bolan-og-loen-tekstal-fra-modul`). Listen
  `HAARDKODEDE_BELOB_I_KOMPONENTER` er tom, så næste håndskrevne beløb i en
  beregner er rød med det samme. Det næste **ikke** dækkede sted er
  strengliteraler i props — se nedenfor.
- **Beløb i prop-strenge er stadig uden for porten** (ny, 2/10).
  `jsxBelob` ser kun `ts.isJsxText`, så en `disclaimer`-streng i et objekt er
  usynlig: `BoligsalgBeregner.tsx:48` skriver «Tinglysningssatser 0,6% + 1.850 kr
  (skøde) og 1,45% + 1.825 kr (pantebrev)», og ingen port ser de to tal. *Accept:*
  scanneren dækker strengliteraler i `.tsx` med egen liste — målt først, da der
  kan være mange fund.
- **`/bil`** (16), **`/billaan`** (24), **`/opsparing`** (10), **`/boligsalg`**
  (9), **`/topskat`** (8) — ingen GSC-visning i top-15, så laveste prioritet;
  `/bil` er desuden faldet 46 → 21 besøgende.
- **To huller i gaten selv (ny, 2/10 — fund under diff-review).**
  (a) `tsconfig.test.json` medtager kun testfiler og deres import-kæde, så en
  **forkert import i en ikke-testfil** er usynlig for `typecheck` — kun
  `next build` fangede `satsTilPermille`. *Accept:* typecheck-programmet
  medtager `src/**` (minus `*.test.ts` er nødvendigt for at undgå dobbelt),
  eller en ny `tsconfig.app.json` i samme gate.
  (b) **Kør port-tests isoleret aldrig som bevis.** En enkelt fil var grøn,
  mens hele suiten var rød (TDZ-fejl). *Accept:* en note i CLAUDE.md eller en
  `pretest`-regel, og sidste iteration skal have kørt hele suiten efter sidste
  ændring — hvilket den gjorde.
- **Beløb i strengliteraler: målt 2/10 (ny).** Scanneren fandt **531**
  forekomster på tværs af `.ts`/`.tsx`; uden for `page.tsx`, komponenter og test
  ligger de fire i `home-data.ts`, to i `categories.ts` og **16 i
  `TimeprisBeregner.tsx`** — som er håndskrevet **tre gange, på tre sprog, med
  tre forskellige lister** (da har 7 poster, se og no har 6, og skilletegn og
  tusindtalsformatering varierer). *Accept:* ét datasæt + formatter, brugt alle
  tre steder. Lav trafikrækkefølge, men det er den eneste måling i rækken hvor
  indholdet faktisk afviger mellem sprog.
- **Blogindlæg (19 filer, 273 fund).** Redaktionelle beløb i et indlæg er ikke
  samme fejlklasse som et beløb på en beregnerside. Beslut først om de skal med;
  hvis ikke, skal de stå i portens undtagelsesliste som *blog*.

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
- **Pace/lap-beregner til løb og cykel (ny, målt 2/10 — stærkeste
  ubbyggede klynge).** *Hvem:* **8 af 10** danske completions under «tid
  beregner» er sport: «tid beregner løb», «marathon tid beregner»,
  «halvmarathon tid beregner», «km tid beregner», «cykel tid beregner»,
  «ironman tid beregner», «triathlon tid beregner», «pace tid beregner». Og
  `/tidsberegners` **tredjestørste søgning** er «hvor lang tid» (828 visninger,
  pos. 6) på 74.546 visninger med 0,3 % CTR. *Accept:* et pace-værktøj der
  regner holdtider pr. kilometer fra distance + tid (og tid fra pace), med
  tests, dansk side og interne links fra `/tidsberegner` og `/fart`. *Datagrund:*
  GSC 1/10 + `suggestqueries` målt 2/10 02:45. **Ingen ekstern kilde nødvendig**
  — det er ren brøkregning, så den behøver ikke at vente på ferielov eller
  satser. Dette er den næste **feature**.
- **«Hvad er klokken i …»-clusteret (ny, målt 2/10).** *Hvem:* **9 af 10**
  danske completions under «hvad er klokken» er «hvad er klokken i usa /
  danmark / thailand / new york / australien / japan / tyrkiet / bali /
  canada». `/tidszone` svarer via konverteren, men der er ingen side der
  **svarer direkte** på «hvad er klokken i norge lige nu». *Accept:* afklar
  først om det er én `/tidszone`-sektion med klokken nu (billigst, ingen nye
  URL'er) eller `klokken-i/<land>`-sider (flere sider, samme mønster som
  `/dage-til/*`). *Datagrund:* autocomplete 2/10 02:45.
- **Kalorieguide på `/kalorier`.** *Hvem:* 9 af 10 danske autocomplete-træffere
  under «kalorier» er madvarer. **Blokeret på kilde** (opgave 119, ❓) — må
  ikke gættes tal.

## Åbne VERIFICÉR DEPLOY-noter

- ⏳ **IndexNow-nøglefilen ligger nu på den URL, payload'en erklærer.**
  `ceo/indexnow-noeglefil`. Prøven er på indhold: `curl -sI
  https://minberegner.dk/abc12345.txt` skal svare **404** (den nøgle er ikke
  konfigureret — så 404 er det *korrekte* svar her), mens
  `https://beraknare.se/abc12345.txt` også skal være 404. Skal Mads sætte
  `INDEXNOW_API_KEY` i env, bliver den rigtige prøve i stedet
  `curl -s https://{vært}/{nøgle}.txt` → **200** med `content-type: text/plain`
  og nøglen i kroppen. Før rettelsen var begge **404 altid**. Vindue
  **2/10 07:30**. Uden nøglen i env er resten af kæden ubevistelig uden for
  lokal test — sig til når den er sat, så jeg kan lukke den på indhold.
- ⏳ **RSC-støjens filter kan ikke dø af en tekstændring.**
  `ceo/sentry-router-stoej-paa-kode`. Prøven er på indhold, og den skal **ikke**
  slå MINBEREGNER-1 til: efter deploy skal Sentry-projektet fortsat stå på **0**
  nye hændelser for router-state-fejlen. Lokalt er beviset de ni tests i
  `sentry-config.test.ts` + de tre end-to-end i `sentry-send.test.ts`, som alle
  læser Next's egen installerede kaste. Vindue **2/10 07:30**.

- ⏳ **Sverenske satsers og lønetekstens tal læses fra modulerne.**
  `ceo/bolan-og-loen-tekstal-fra-modul`. `curl -s
  https://beraknare.se/bolan` skal vise «max 2%», «30% upp till 100 000 kr,
  sedan 21%» med korrekte mellemrum, og `curl -s https://minberegner.dk/loen`
  skal vise «1.000 kr mere i bruttoløn» (dansk tusindtalsseparator på
  minberegner.dk, svensk «1 000» på beraknare.se). Vindue **2/10 07:30**.

- ⏳ **Palmesøndag står nu i helligdagslisten, og listen siger 13.**
  `ceo/review-fund-palmesondag-og-komponenter`. Prøven er på indhold:
  `curl -s https://minberegner.dk/dato` skal vise «De **13** danske helligdage»
  i FAQ'en og **Palmesøndag** i den kommaseparerede navneliste, og
  `curl -s https://minberegner.dk/dage-til/palmesondag` skal indeholde
  «altid en søndag» og **ikke** «religiøse helligdage». Vindue **2/10 07:30**.
  Tallene på `/dato` skal være uændrede: 9 helligdage på hverdag i 2026.
- ⏳ **Efterlønnens brødtekst læser portion, timer og loft fra modulet.**
  Samme slug. `curl -s https://minberegner.dk/efterloen` skal vise
  «15.870 kr.», «10.580 kr. for deltidsforsikrede» (mellemrum!), «481 timer»,
  «12 portioner» og «3.120 timer» — og **ikke** «10.580kr.». Vindue
  **2/10 07:30**.
- ⏳ **Beløbsscanneren ser `src/components` og `ScriptKind` følger endelsen.**
  Samme slug. **Ingen produktionsændring** i porten — kun
  `src/app/regnestykker.test.ts` — så prøven er lokal: de 152 `.tsx` uden for
  `page.tsx` giver pr. fil de tal i `HAARDKODEDE_BELOB_I_KOMPONENTER`, og
  `EfterloensBeregner.test.tsx` er grøn på den renderede tekst.

- ⏳ **`/renteberegner`'s danske eksempel og Excel-tabel læser modulet.**
  `ceo/renteberegner-eksempel-fra-modul`. Prøven er på indhold: `curl -s
  https://minberegner.dk/renteberegner` skal vise **uændret** «200.000 kr.»,
  «1.211,96 kr. pr. måned», «290.870,56 kr.», «90.870,56 kr.», «0,04 ÷ 12 =
  0,3333 %», «12,68 % om året», «4,07 % effektivt» og formlerne
  `=YDELSE(0,04/12;240;-200000)`, `=RENTENPERIODER(0,04/12;-1211,96;200000)`
  og `=YDELSE(0,04/12;240;-200000)*240-200000`. Tallene skal være **præcis
  de samme som før** — hvis en af dem er ændret, er der gået en fejl i
  koblingsformen. Vindue **2/10 07:30**.

- ⏳ **Regnestykker-porten ser hele kæden og sitets egen notationsform.**
  `ceo/regnestykker-porten-ser-hele-kaden`. **Ingen produktionsændring** — kun
  `src/app/regnestykker.test.ts` — så der er intet at hente på det levende site.
  Beviset er lokalt: de ni kanoniske sætninger i `KANONISKE` (6 grønne rigtige,
  3 røde forkerte, hver rød af den rette regel) og den plantede sætning på
  `/rentefradrag`, der gjorde tre tests røde. Deploy-vindue 2/10 07:30 er
  uden betydning for denne note; de seks nedenfor er dem, der skal efterprøves.
- ⏳ **/arveafgift læser bundfradraget og eksemplerne fra modulet.**
  `ceo/arveafgift-tal-fra-modul`. Prøven er på indhold: `curl -s
  https://minberegner.dk/arveafgift` skal vise `392.300 kr` i **alle** de otte
  steder (tre tabellerceller, «Nærmeste familie …», «Bundfradraget … de første
  …», regnestykket og guideboksens to beløb) og **ikke** «nærmer sig 36,25%».
  Samme prøve på `/blog/arveafgift-regler-og-satser` for de to guidebeløb.
  Vindue **2/10 07:30**.
- ⏳ **/boernepenge svarer på «hvornår udbetales».** `ceo/boernepenge-udbetalingsdatoer`.
  Prøven er på indhold: `curl -s https://minberegner.dk/boernepenge` skal indeholde
  «Hvornår kommer børnepengen ud?», «om N dage» og en `<time dateTime="...">` med den
  næste betalingsdato i **dagens** danske tid. Målt 1/10 22:19 (21:30-vinduet):
  **ikke live** — kun ét fund på «Hvornår», titlen er stadig den gamle, og
  `NaesteUdbetalingsdato` mangler i markupken. Committen er fra 20:08 UTC = 22:08
  dansk tid, altså *efter* 21:30-vinduet. Vindue **2/10 07:30**.
- ⏳ **Nyt afsnit: /rentefradrag'ens «Eksempel» læser fra modulet.**
  `ceo/rentefradrag-tal-fra-kilden`. Prøven er på indhold: `curl -s
  https://minberegner.dk/rentefradrag` skal indeholde `50.000 × 33,6% = 16.800 kr.`
  — og, efter en `satser-2026`-opdatering, de nye tal. Vindue **2/10 07:30**.
- ⏳ **/moms' Excel-tabel viser nu 800, 200 og 200, ikke 1.000 og 250.**
  `ceo/moms-excel-talene`. Prøven er på indhold: `curl -s
  https://minberegner.dk/moms` skal indeholde `800 kr.` og `200 kr.` i Excel-
  tabellens kolonne **og** teksten «De tre sidste regner på 1.000 kr. med moms».
  Vindue **2/10 07:30**.
- ⏳ **Beløb i JSX-tekst er målt på hele sitet (471) og porten er grøn.**
  `ceo/regnestykker-port`. Prøven er på indhold: `curl -s
  https://minberegner.dk/rentefradrag` skal **ikke** længere indeholde
  `Fordel 95.000 kr. og 5.000 kr.` som tekst — og `/toppat` skal fortsat findes
  i sitemap. Vindue **2/10 07:30**.
- ⏳ **`/procent` er helt uden hårdkodede beløb.** `ceo/procent-eksempler-fra-modul`.
  Prøven er på indhold: `curl -s https://minberegner.dk/procent` skal **ikke**
  indeholde `25% moms på 1.000 kr = 250 kr i moms` som sammenhængende tekst, og
  skal derimod vise den i markupken med de fire beløb hver for sig. Samme prøve
  på `Host: beraknare.se` (svensk: `moms på 1 000 kr`). Vindue **2/10 07:30**.

- ⏳ **`/ejendomsvaerdiskat` læser sats, kommune-promille og eksempel fra
  modulet.** `ceo/ejendomsvaerdiskat-tal-fra-modul`. Prøven er på **indhold og
  på uændret tekst**: `curl -s https://minberegner.dk/ejendomsvaerdiskat` skal
  vise «5,1‰ (0,51%)», «14‰ (1,4%)», «Progressionsgrænsen er 9.007.000 kr»,
  tabellen med 3,1 / 5,1 / 5,7 / **6,0** / 7,4 / 17,7 ‰, og eksemplet
  «3.000.000 × 80% × 5,1‰ = 12.240 kr/år», «1.000.000 × 80% × 5,1‰ = 4.080
  kr/år», «16.320 kr/år (1.360 kr/måned)». Vindue **2/10 07:30**.

## ❓ Til Mads

- ❓ **Ser du events fra minberegner.dk i Sentry-projektet?** Det er nu det
  eneste stykke af spørgsmålet fra opgave 204, der ikke er besvaret af kode.
  Afsendelsen er **bevist** — `sentry-send.test.ts` får en rigtig envelope
  gennem den rigtige `initSentryServer()` og modtager den på en collector, så
  SDK'en sender, og `beforeSend` er registreret på begge sider. Men det beviser
  *transporten*, ikke at **dit projekt** modtager: det afhænger af DSN-projektet
  og af at traffic'et rent faktisk rammer en kastende rute. **Ingen fejl i 14
  dage er derfor stadig en svag vished** — den kan betyde "alt er godt" eller
  "intet kaster". Ét skærmbillede af Sentry-projektet, eller en bevidst fejl i
  et prod-build med et `[Sentry]`-flag på init, låser det. Jeg kan ikke se
  projektet: API'en kræver din konto.

- ❓ **Ingen læsbar kilde til fitnessfradraget og sommerhusudlejningsfradraget
  (opgave fra 1/10 21:25, ny blokering).** De to er de sidste af «fradrag 2026»-klyngen,
  og 1/10 21:25 fik hverken `dagpenge.dk` eller `star.dk` til at svare
  (forbindelsesfejl / 404), mens `skat.dk` har været 500 siden C19. **Et skærmbillede
  af de to linjer i SKAT's fradragsvejledning** — eller teksten kopieret herind —
  låser dem. Uden det bygges de ikke, jf. punkt 11 i kvalitetsreglerne.
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
- ❓ **Er 17,7‰ virkelig den højeste grundskyldspromille i Danmark?**
  `/ejendomsvaerdiskat`s tabel siger «Varde (højest)», og Varde står ikke i
  modulets kommune-liste, så tallet er håndskrevet og uden kilde i koden. Jeg
  har bevidst ikke ændret det — det er en påstand om kommunesatser, ikke en
  formel. Hvis du kender en kilde (bolig.guide, KL eller kommunens
  beskatningsvedtægt), lægges Varde bare ind i `GRUNDSKYLD_KOMMUNER`, og
  tabellen og dropdown'en får den samme post.
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
