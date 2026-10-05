STATUS: 6/10 02:0x. ✅ 6/10 02:0x: **forsiden linkede sitets tre mest
upassede søgesider slet ikke.** `/procent` (151.008 GSC-visninger, 0,1 % CTR,
pos. 7,5), `/tidszone` (24.829, 0,4 %) og `/moms` (24.000, 0,2 %) lå alle tre
i den ikke-populære halvdel af `home-data.ts`, altså uden link fra forsiden og
uden plads i sidebaren på de ~120 kalkulatorsider — de er ikke i Plausible
top-15, fordi deres få klik tælles som besøgende. 200.000 visninger på
position 5-8 uden et eneste indgangslink. Nu populære i rækkefølge efter
visninger; ny port dømmer princippet (tærskel 20.000 visninger), mutation af
ét flag gav 3 røde.
✅ 6/10 01:5x: **dage-til's FAQ holdt op at være rigtige.**
Fire spørgsmål på ferie-siderne havde et årstal i sig («Hvornår begynder
sommerferien i 2026?», «…senere end 27. juni?»), mens nedtællingen altid peger
på det *næste* år: 6/10 skrev siden «27. juni» over et mål på 26. juni 2027.
Spørgsmålene er nu regler, svarene er eksempler, og porten dømmer alle events i
begge sprog. Samme commit: folkeskoleloven § 14 a stk. 2 står som kilde — ❓
«Ferielovens regel for sommerferiens startdato» er **lukket**: loven siger
«Elevernes sommerferie begynder den sidste lørdag i juni», altså den regel
koden hele tiden havde. Mutation gav 3 røde. Målt: 10 af 10 danske
autocomplete-træffere i sommerferie-klyngen. Se arkivet.
✅ 6/10 01:2x: forsidens sæsonbadge læste serverens UTC-måned — nu
`iDagPaSiden` fra `lokal-dato.ts`; samme commit pegede `/dato` på
`/dage-til/31-december` i stedet for et 301-alias. Mutation 3 røde.
✅ 6/10 00:4x `/rumfang` som beregner (kasse, cylinder, kugle, kegle, pyramide,
diameter, m³ + liter; 31 porte). ✅ 6/10 00:2x svensk `/tidszone` skrev
«New Zealand», «Türkiet» og dansk «og» — `landSe` er nu påkrævet for alle
elleve rækker; 6 røde ved mutation. ✅ 6/10 00:0x landetabellens
dagsafhængige tidsforskil (Australien 10/8, New Zealand 12/10).
✅ 5/10 21:4x efterlønnens deltidstal 2/3. ✅ 5/10 22:1x juleaftens/nytårsaftens
URL er datoen. ✅ 5/10 22:5x `/tidsberegner`: værktøjet før tabellen.
✅ 5/10 23:1x «Populær nu» i stedet for «Trending». ✅ 5/10 17:4x `/tidszone`:
sydhalvkloden + Nuuk. ✅ 5/10 15:0x fire rå procenter. ✅ 5/10 14:1x
sidebarlens liste i målt trafikrækkefølge. ✅ 4/10 CEO-køens punkt 0 (Valborg,
svensk påskafton, fast dansk sankthans, `Europe/Copenhagen` i `toUtcMidnight`).
Alt ældre: `docs/plan-arkiv.md`. ✅ CI grøn 5/10 21:26.
PR-TJEK: 6/10 01:0x (ingen åbne). BRANCH-TJEK: 4/10 04:1x — se ❓.
**Gate:** `npm run typecheck && npm run lint && npm run test` (CI kører også
`next build`). 6/10 02:0x: typecheck 0, lint 0 (775 filer), **4349 tests i 271
filer** grønne. Ét tidligere fuldt suitekørsel gav 1 rød i `locale-leak-gate.test.ts`,
som scanneren kører i en udspawnet proces og som er grøn 3/3 i isolation og i
to senere fulde kørsler — urørt, se ❓ om skanner-rækkerne.
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
| `/` (forside) | **213, bounce 40 %** (5/10 21:25) | under top-15 | — | — |
| `/dage-til` + se `/dagar-till` | **0 — nye URL'er 2/10** | — | — | — |
| `/dage-til/24-december` + `31-december` (+ se) | **0 — nye URL'er 5/10 22:1x** | — | — | — |
| `/tidsberegner` efter flytningen 5/10 22:5x (baseline 268) | 268 | 78.615 | 0,3 % | 6,7 |
| Mål efter 14 dage: `/dage-til/24-december` skal overtage «…til den 24 december» fra `/dato` | — | 1.036 (GSC 5/10, under `/dato`) | 0 % | 5 |
| `/dage-mellem-datoer` + se `/dagar-mellan-datum` | **0 — nye URL'er 3/10** | — | — | — |
| `/idealvaegt` + se | **0 — nye URL'er 4/10** | — | — | — |
| `/rumfang` + se | **0 — nye URL'er 6/10** | — | — | — |
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

**F6c. [x] Juleaftens og nytårsaftens URL er datoen** — 5/10 22:1x.
`/dage-til/juleaften` → `/dage-til/24-december`, `/dage-til/nytaarsaften` →
`/dage-til/31-december` (samme to i `se`). *Datagrund:* GSC 5/10 — «hvor mange
dage er der til den 24 december» 1.036 visninger / 2k volume / pos. 5, vist
**under `/dato`**; dansk autocomplete «…til 24 december» er 1. completion på
«…til 24». *Hvorfor:* `/dato` og nedtællingssiden konkurrerede om den samme
søgning, fordi «24 december» ikke stod i nogen sti. *Accept:* gamle slugs
301'er via `aliases`, sitemap/hub/`/dato` følger med, og fem porte dømmer på
det (mutation tilbage til de gamle slug'er gav 6 røde, mutation af «23» tilbage
til «30» gav 1 rød). Samme commit rettede **en løgn på to sider**: `december-1`
sagde «præcis 30 dage» til 24. december (skal være 23).

**F6e. [x] `/tidsberegner`: værktøjet står før svar-først-tabellen** —
rettet 5/10 22:5x. Ni «ovenfor»/«ovanför»-henvisninger pegede alle på det, der
lå under dem, fordi `<TidsBeregner />` stod efter tabellen og hele
brødteksten. Én flytning gør alle ni rigtige, samme rækkefølge som
`/procent`. Port dømmer på rækkefølgen i markup'en (1 rød ved mutation).

**F6g. [x] Forsidens sæsonbadge læser sit eget sprog** — 5/10 23:1x.
«Trending» lå som et råt literal i `page.tsx` og fulgte ikke `locale`, så det
stod på dansk *og* svensk (6 forekomster målt i live-HTML). Nu er det
`sections.trending` i `home-data.ts` («Populær nu» / «Populär nu» / «Populær nå»).
Mål: ingen `>Trending<` i noget sprog, og badgen hænger på præcis de hrefs
`getTrendingHrefs()` leverer — porten læser linksene og spørger hvilke der
*bærer* badgen, så «ordet står et sted tæt ved» ikke kan få den grøn.
Mutation tilbage gav 2 rød. *Hvorfor:* badgen er en påstand om at netop denne
beregner er aktuel lige nu (punkt 11), og den stod på et sprog sitet ellers ikke
taler. ⛔ *Hvilke* beregnere der badges er en måneds-tabel i `trending.ts`, ikke
målt trafik — urørt.

**F6h. [x] `trending.ts` læser måneden i site-tidszonen** — rettet 6/10 01:2x
i `ceo/trending-lokale-datoer`. Skiftedagene er 1. januar, 1. april, 1. august og
1. oktober kl. 00:00 dansk tid = 23:00Z i CET og 22:00Z i CEST. Fuld tekst og
måling i `docs/plan-arkiv.md`.

**F6d. [ ] Samme logik for de øvrige daterede nedtællinger.** Kun december har
en URL med et datotal i dag, og kun fordi GSC viste den. Øvrige kandidater må
**ikke** få en dato-slug uden en målt søgning — autocomplete 5/10 22:0x gav
«…til 24 september/oktober/juni/maj» som rækker af samme type, altså det er
ikke december, der er særligt, det er **én** søgning. ⛔ Se ❓ GSC-eksport.

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

- **[x] `/rumfang` — rumfang for kasse, cylinder, kugle, kegle og pyramide.**
  Lukket 6/10 00:4x i `ceo/rumfang-beregner`. *Datagrund:* dansk autocomplete
  6/10 00:2x — «hvordan beregner man rumfang» har **10 af 10** træffere, der er en
  figur (kasse, cylinder, kugle, pyramide, prisme, kegle, cirkel), og «beregn
  rumfang» har 10 af 10. To ting står frem i træffene: **diameter** (ikke radius)
  og **liter** (ikke kun m³) — derfor tager værktøjet diameter og viser begge
  enheder. `/kvadratmeter` regner kun areal (m²) og har 21.403 GSC-visninger på
  1,5 % CTR og pos. 4,9, så matematik-siderne her konverterer; rumfang var det
  andet spørgsmål og manglede. *Accept:* 31 nye porte (20 i `rumfang.test.ts`, 11 i
  `rumfang-side.test.tsx`) dømmer formlerne mod håndregnede tal og siden i
  renderet markup; mutér keglens ⅓ til 1/1 → 2 røde, mutér cylindertallet i
  `metaTitle` til grundarealet → 1 rød. `MÅL: /rumfang baseline 0 (ny URL),
  forventer > 300 Plausible-besøgende/28d efter 14 dage`. Titles i da/se, ingen
  `no`-side (⛔ `beregner.no` er et andet site — ❓).
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
- **[x] Landetabellen skriver danske landnavne i den svenske udgave.** Lukket
  6/10 00:2x i `ceo/tidszone-svenska-lander`. `landSe` er nu udbudt for alle
  elleve rækker (New Zealand → «Nya Zealand»), konjunktionen læses af
  `spoergsprog`, og «Türkiet» (tysk) blev «Turkiet». *Accept:* en port dømmer
  da/se hver for sig på alle 11 rækker + på den renderede markup i `se`.
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

**Åben note 6/10 02:0x:** `VERIFICÉR DEPLOY: forsiden har et link til
/procent, /tidszone og /moms i rækken mellem /pension og /loen-efter-skat, og
sidebarlen på /dato har de tre med ceo-populaere-sogesider 6/10 02:0x`. Mål på
indhold: `curl -s https://minberegner.dk | grep -o 'href="/procent"' | wc -l` →
**> 0**, samme greb for `href="/tidszone"` og `href="/moms"`, og
`grep -o 'Procentberegner' | wc -l` → **> 0**. Sidebarlen læser samme
`popular`-flag, så `curl -s https://minberegner.dk/dato | grep -o 'href="/procent"'
| wc -l` skal være **> 0** på en side hvor `/dato` selv ikke står i listen.
⚠️ Mergen er efter 21:30-vinduet, første reelle kør er 6/10 07:30.

**Åben note 6/10 01:5x:** `VERIFICÉR DEPLOY: /dage-til/sommerferien spørger «Kan
sommerferien begynde senere end den sidste lørdag i juni?» og «Hvornår begynder
sommerferien?» (ikke «…i 2026?» / «…end 27. juni?»), og facts' citerer
folkeskoleloven § 14 a stk. 2 — samme måling på /dage-til/efteraarsferien,
/dage-til/skolestart og /dage-til/grundlovsdagen
ceo/dage-til-faaarstal 6/10 01:5x`. Mål på indhold: `curl -s
https://minberegner.dk/dage-til/sommerferien | grep -o 'senere end 27. juni' |
wc -l` → **0** og `grep -o 'folkeskoleloven § 14 a stk. 2' | wc -l` → **> 0**.
⚠️ Mergen er efter 21:30-vinduet, første reelle kør er 6/10 07:30.

**Ti noter er åbne.** Alle ti er merges efter 21:30-vinduet 5/10, så de bliver
målbare i 07:30-kørslen 6/10. **Næste iteration skal måle alle ti på indhold i
én kørsel** (`grep -o … | wc -l` mod begge domæner) og lukke dem med `DEPLOY OK
6/10`; en note der stadig ikke er live efter to vinduer bliver `DEPLOY-MISSING`.
(Den 5/10 17:5x er delvist lukket — se egen linje.) De ti fra 3/10–5/10 er lukket
på indhold — målt med `curl` mod begge domæner, ikke på HTTP-koden. De lukkede
noters fulde krav og målinger ligger i `docs/plan-arkiv.md` (senest 6/10 01:5x).

⚠️ **Brug `grep -o … | wc -l`, ikke `grep -c`, på rå markup** (målt 6/10 00:1x):
Next leverer HTML'en som én linje, så `grep -c` tæller linjer og svarer 1 for
alt. Noterne her bruger `grep -o`.

**Åben note 6/10 01:2x:** `VERIFICÉR DEPLOY: forsidens sæsonbadge sidder i oktober på
præcis `/pension`, `/opsparing` og `/arveafgift` (kalendermåneden i
`Europe/Copenhagen`, ikke UTC), og `/dato` linker til `/dage-til/31-december` uden
301-hop ceo/trending-lokale-datoer 6/10 01:2x`. Mål på indhold: `curl -s
https://minberegner.dk/dato | grep -o 'href="/dage-til/31-december"' | wc -l` → **1**,
`grep -o 'nytaarsaften' | wc -l` → **0**, og på forsiden `curl -s https://minberegner.dk
| grep -o '>Populær nu<' | wc -l` → **3** med de tre hrefs ovenfor bærende badgen (læs
`src/lib/trending.ts` indtil det kan hentes headless). Samme greb på beraknare.se med
«Populär nu» og `/dagar-till/31-december`. ⚠️ Mergen er efter 21:30-vinduet, første
reelle kør er 6/10 07:30.

**Åben note 6/10 00:2x:** `VERIFICÉR DEPLOY: beraknare.se/tidszone skriver
«Nya Zealand» i landetabellen, «Turkiet» i landelisten og «… Grekland och
Spanien följer Sverige» / «… Sydney och Auckland», altså ingen «Türkiet», intet
`<td …>New Zealand</td>` og intet dansk «og» i markupken
ceo/tidszone-svenska-lander 6/10 00:2x`. Mål på **indhold**:
`curl -s https://beraknare.se/tidszone | grep -o 'Türkiet' | wc -l` → **0**,
`grep -o '>Nya Zealand<' | wc -l` → **1**, `grep -oE ' og ' | wc -l` på
sidens råe HTML skal være **0**, og `beraknare.se/klockan-i/turkiet` skal have
«Turkiet» i titel og H1. ⚠️ Mergen er efter 21:30-vinduet, første reelle kør er
6/10 07:30.

**Åben note 6/10 00:0x:** `VERIFICÉR DEPLOY: landetabellen på /tidszone (og
bloggen hvad-er-klokken-i-usa-naar-den-er-12-i-danmark) viser Australien 10 frem /
8 frem og New Zealand 12 frem / 10 frem i begge spalter på minberegner.dk og
beraknare.se, og ingen af siderne siger længere «9 timer frem» eller «11 timer
frem» ceo/tidszone-lande-dagsafhaengig 6/10 00:0x`. Mål på indhold:
`curl -s https://minberegner.dk/tidszone | grep -c '9 timer frem\|11 timer frem'`
skal være **0**, og `grep -o '10 timer frem' | wc -l` skal være **> 0** (samme to
greb på beraknare.se med «10 timmar framåt»). ⚠️ Mergen er efter 21:30-vinduet,
første reelle kør er 6/10 07:30.

**Åben note 5/10 23:1x (badge):** `VERIFICÉR DEPLOY: forsidens sæsonbadge hedder
«Populær nu» / «Populär nu» / «Populær nå», aldrig «Trending»
ceo/populaer-badge-sprog 5/10 23:1x`. Målt på indhold 6/10 00:1x: minberegner.dk
har **3** `>Trending<` og **0** `>Populær nu<`; beraknare.se **1** og **0** — altså
stadig ikke live, og det er forventet, fordi mergen kom efter 21:30-vinduet. Første
reelle kør er 6/10 07:30. Samme måling som arkivet bruger: `grep -o … | wc -l`.

**Åben note 5/10 22:5x:** `VERIFICÉR DEPLOY: /tidsberegner renderer
tidsværktøjet før svar-først-tabellen på både minberegner.dk og beraknare.se
ceo/tidsberegner-vaerktoej-foerst 5/10 22:5x`. Mål på indhold: `curl -s
https://minberegner.dk/tidsberegner` skal have klokkeslæts-feltene **før**
"Svar på de oftest søgte tidsrum" i markup'en (samme på beraknare.se med
"Svar på de vanligaste tidsintervallen") — altså tegnindeks, ikke HTTP-koden.
⚠️ Mergen er efter 21:30-vinduet, første reelle kør er 6/10 07:30.

**Åben note 5/10 22:1x:** `VERIFICÉR DEPLOY: /dage-til/juleaften og
/dage-til/nytaarsaften 301'er til /dage-til/24-december og /dage-til/31-december
(og julafton/nyarsafton på beraknare.se), de fire nye URL'er svarer 200 med
canonical på sig selv, og ingen side i live siger «præcis 30 dage til
juleaftensdagen den 24. december» / «exakt 30 dagar till julafton»
ceo/december-dato-i-url 5/10 22:1x`. Mål på indhold: `curl -sI` på de fire gamle
URL'er skal vise `301`, `curl -s https://minberegner.dk/dage-til/24-december`
skal have `<link rel="canonical" href="…/dage-til/24-december">`, og
`curl -s …/dage-til/1-december | grep -c '30 dage'` skal være **0**.

**Åben note 5/10 21:4x:** `VERIFICÉR DEPLOY: efterlønsberegnerens deltid-gren
viser 13.372 kr. og 14.694 kr., ikke 13.438 kr. og 14.768 kr. ceo/efterloen-deltid-andel
 5/10 21:4x`. Mål på indhold: `curl -s https://minberegner.dk/efterloen` skal have
 **0** matches på `13.438`, `13.372` og `14.694` (siden er en klient-komponent,
 der først renderer tallet ved JS — brug et headless kald eller læs
 `EFTERLOEN_MAX_SATS_DELTID` i koden indtil da), og ingen FAQ- eller
 metadatastreng skal nævne et deltidstal. ⚠️ Mergen var 21:35, altså **efter**
 batch-vinduet 21:30 — første reelle kør er 6/10 07:30.

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

**Åben note 6/10 00:4x:** `VERIFICÉR DEPLOY: /rumfang svarer 200 på
minberegner.dk og beraknare.se, hver sides sitemap indeholder pr. domæne
`/rumfang`, og værktøjet renderer «1 m³» og «1.000 liter» for den
forudindstillede kasse på 2 × 1 × 0,5 m ceo/rumfang-beregner 6/10 00:4x`. Mål på
indhold: `curl -s https://minberegner.dk/rumfang | grep -o 'Rumfangsberegner' |
wc -l` → **> 0**, `curl -s https://minberegner.dk/sitemap.xml | grep -o
'/rumfang<' | wc -l` → **1**, og samme to greb på beraknare.se skal give
`Volymberäknare` og **1**. Værktøjet er en klient-komponent, så læs
`src/lib/rumfang.ts`, indtil tallet kan hentes headless.

## ❓ Til Mads

- ⛔ **GitHub Actions kunne ikke starte job på minberegner.dk** (5/10 19:35–20:37,
  lukket 6/10 00:0x). Tre kørsler blev `cancelled` efter præcis 15 min med **nul**
  steps og tomt `runner_name` — GitHubs egen runner-kø, ikke koden, jobbet startede
  aldrig. Kørslen 5/10 21:26 var grøn på 4 min, så det var en time med kø. Ingen
  handling: tjek én gang ved iterations start med `gh run list -L 1`, og stoler på
  den lokale gate ellers.
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
  for hele domænet, låser F1-F3.** Målt 5/10 22:0x: dansk autocomplete er *ikke*
  en erstatning — den kan ikke give en søgnings *rækkefølge* eller en
  visningstællung, kun at et spørgsmål findes. Den kan altså finde emner
  (kogetider, BMI-børn), men ikke rangere dem.
- ❓ **Feriedatoer uden lovkilde** (3/10 05:30 — lukker ferie-feature-køen
  midlertidigt). da.wikipedia `Ferie` siger «Vinterferie (**typisk** i uge 7
  eller 8)» og «Efterårsferie (typisk uge 42)» — altså ingen fast uge for
  vinterferien, kun en tommelse, og intet om påskeferiens startdato.
  `efteraarsferien` på sitet er skrevet til uge 42 som en fast regel, så samme
  kildegrund mangler også der. **Ét skærmbillede fra en kommunes ferieplan
  2026/2027 (helst to kommuner) låser vinterferie, påskeferie og efterårsferie
  på én gang.**
- ✅ **Ferielovens regel for sommerferiens startdato** (opgave 201) — **lukket
  6/10 01:5x.** Folkeskoleloven § 14 a stk. 2 (LBK 2025/1100) siger ordret
  «Elevernes sommerferie begynder den sidste lørdag i juni», læst på
  retsinformation.dk 6/10 2026. Den regel ❓ frygtede («den lørdag i den
  kalenderuge, hvori 20. juni ligger») står ikke i loven, så koden har haft
  den rigtige regel hele tiden. Paragrafen står nu som kilde i sidens tekst.
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
- ❓ **To skanner-rækker uden fejl i koden** (5/10 21:2x, målt igen 6/10 00:0x).
  `npm test` skriver «FEJL: 1 ureviewet(e) danske streng(e) …» med
  `src/app/procent/page.tsx:621` «En lønsprocent kan du se:» (den 5/10-noterede
  værdi på samme linje var den svenske sætning over den) og «FEJL: 34 …» med 20
  linjer i `src/app/promille/page.tsx` (37–279), der er ren dansk i en komponent
  der monteres på beraknare.se. **⛔ Ikke opgaver at fjerne ord for** — det ville
  slå dansk ødelagt for at tilfredsstille en port. Kræver en stopordsliste der
  skelner mellem sprog, eller en allowlist-fil. Porten får grøn på en af dem.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)»; `skat.dk` svarer 500. Teksten siger nu kun hvad beregneren
  regner med, og tallet ligger i `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **Fitnessfradrag, sommerhusudlejning, grundskyld for Varde og Playwright.**
  Fire mindre kilder, noteret med detaljer i `docs/plan-arkiv.md` 2/10 14:20.