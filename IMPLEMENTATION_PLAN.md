STATUS: 6/10 05:1x. ✅ **`/laantype` — brugerne kan nu sammenligne de tre
lånetyper på samme tal.** `/renteberegner` svarer på «annuitetslån beregner»
(348 v, pos. 8) men regner **én** type ad gangen, og dansk autocomplete målt i
dag har 10 af 10 træffere under «annuitetslån», «serielån» og «stående lån» som
**valget mellem dem** («annuitetslån serielån og stående lån», «annuitetslån vs
serielån», «serielån vs annuitetslån», «stående lån hvad er det»). Svensk
autocomplete er samme klynge («serielån vs annuitetslån kalkulator»), så det var
et spørgsmål, to domæner får trafik på og ingen besvarede samlet. Værktøjet
regner første og sidste ydelse, månedsafdrag, samlet rente og renteandel for
alle tre **og krydsmåneden** — den måned serielånet bliver billigere end
annuitetslånet, måned 146 i eksemplet.
⚠️ **Fandtes i min egen diff, rettet før commit:** `daKr` bevarer decimaler, så
FAQ'en og metaDescription skrev «2.673,916 kr.» — tal i **Googles svar** via
FAQSchema. Ny `daKr0` runder til hele kroner. Porten fangede det.
⚠️ **Repoets egne gates fangede fire ting jeg ikke så:** `metaTitle` var 65
tegn (grænse 60), `metaDescription` 163 (grænse 160), titlens første ord endte i
komma så hovedord-porten ikke genkendte det, og `LaantypeBeregner` havde en dansk
streng i JSX uden for `labels`-objektet — fund af locale-leak-scanneren, som
jeg flyttede ind i objektet. `regnestykker`-porten fangede desuden et
håndskrevet «2.000.000 kr.» i en streng; den skrives nu fra konstanterne.
✅ 6/10 tidligere: ugenummeret på `/ugedag`+`/veckodag` (MIDDEL-fund fra
`b474763`, rettet i `779ed5a`), «Dage til dato» på `/dato`, `/klokken-i/*` i 21
lande, `/rumfang`, `/braendstof`, ArealOmregner, ferie-FAQ, sæsonbadge.
✅ 5/10: svensk landetabel, landetabellens tidsforskel, efterlønnens deltidstal,
«Populær nu». ✅ 4/10: hele CEO-køens punkt 0 (verificeret på ny i dag: Valborg
30. april, svensk påskafton lørdag, fast dansk sankthans 23. juni, dansk
påskeaften-FAQ væk, `maneder: 12`, tidszone-daterede nedtællinger, nettoprisindeks
på `/husleje`).
**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build`,
som CI også kører). 6/10 05:1x: typecheck 0, lint 0 (794 filer), **4576 tests i
279 filer** grønne, build ok (`/laantype` på route-listen). Portene kan fejle:
mutation til `return k + 1` i krydsløkken giver 2 røde, restgælden `* k` i stedet
for `* (k - 1)` giver 2 røde, stående lånets rentesum til ét beløb giver 4 røde,
serielånets månedlige afdrag til årligt 2 røde. **Målt mod uafhængig
fremmedkilde:** BONOVO (29/9) siger for 2.400.000 kr/4 %/30 år «3.209 kr. mere
den første måned» og «ca. 280.000 kr. mindre i rente»; modulet giver 3.208,70 og
280.868. **Realkreditlovens § 4 er læst i lovens egen tekst** (retsinformation.dk,
6/10) og står med paragraffen i FAQ'en. ⚠️ **11 VERIFICÉR-noter er stadig åbne** —
alle merges er efter 21:30-vinduet 5/10, så intet kan måles endnu. Første
reelle deploy-vindue er **6/10 07:30**. PR-TJEK 6/10 04:3x. BRANCH-TJEK 4/10 04:1x.

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
| `/kvadratmeter` før arealværktøjet (6/10) | **393 (+96 %)** | 21.403 | 1,5 % | 4,9 |
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/braendstof` før Forbrugsomregneren (6/10) | **252 (+56 %)** | 16.898 | 1,0 % | 6,0 |
| `/alder` | under top-15 | 10.029 | 0,4 % | 7,2 |
| `/renteberegner` | under top-15 | 12.610 | 0,8 % | 7,4 |
| `/rentefradrag` | under top-15 | 5.082 | 5,8 % | 5,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | **213, bounce 40 %** | under top-15 | — | — |
| `/klokken-i/*` (6/10, 7 nye landesider pr. domæne) | **0** | — | — | — |
| `/tidszone` | under top-15 | 24.829 | 0,4 % | 7,7 |
| `/ugedag` + `/veckodag` (6/10, nye URL'er) | **0** | — | — | — |
| `/rumfang` (6/10, ny) | **0** | — | — | — |
| `/laantype` (6/10, ny) | **0** | — | — | — |
| `/idealvaegt` (4/10, ny) | **0** | — | — | — |
| `/dage-til/*` (2/10, nye) | **0** | — | — | — |
| `/dage-mellem-datoer` + se (3/10, nye) | **0** | — | — | — |
| `/klokken-i/*` (4/10, nye) | **0** | — | — | — |
| se `/dato` | 133 | 101.580 | 0,1 % | 8,2 |
| se `/tidsberegner` | 167 | 61.934 | 0,2 % | 8,0 |
| se `/procent` | under top-15 | 26.933 | 0,0 % | 9,9 |

Site: minberegner.dk 7.421 besøgende/28d (+42 %), ~600.000 GSC-visninger pr.
måned. Kilder: Google 4.170, Bing 1.319, DDG 378, Yahoo 274 — **1.971 af 7.319
(27 %) kommer fra søgemaskiner der ikke er Google**.

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

**F5d. [x] FÆRDIG 6/10 — `/laantype`, se `docs/plan-arkiv.md`.**

**F0d. [~] To sider måler deres nye titel i 14 dage, før der røres ved den.**
`/rentefradrag` (5,8 %) og `/boligstoette` (2,5 %) er GSC-uddragtets to højeste
CTR, så deres **danske** titler får ikke et regnet eksempel, før målingen er
læst. **Accept:** tallene fra GSC 17/10 står i tabellen; bagefter enten regnet
eksempel eller en skriftlig begrundelse for at lade være. De svenske
pendanttitler er rettet 3/10. Lukket herfra: `/arveafgift`, `/renteberegner`,
`/alder`, `/tidszone`, `/boernepenge`, `/dato` — alle med regnet eksempel i
porten.

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
sitets eget navn) og `/moms` (de 3 lovgrænser).

**F9. [ ] `locale === "se" ? "se" : "da"` — 13 bruger-synlige steder med dansk på
norske domæner.** Målt 2/10 med grep: `dato/page.tsx` (3),
`tidsberegner/page`, `alder/page`, `opsparing/page`, `bil/page` +
`DatoBeregner`, `MomsBeregner`, `EnhederBeregner`, `PlanetVaegtBeregner`,
`lokal-dato.ts`, `bil-omkostninger.ts`. *Hvorfor:* `/dato` og `/tidsberegner` er
sitets to største sider. *Accept:* hvert sted får en `no`-gren eller en
`Record<Locale, …>`, og en port (som `DANSKE_ORD`-listen i `PaceBeregner.test.tsx`)
dømmer da/no/se hver for sig. ⛔ `beregner.no` serverer et andet site — se ❓.

## Feature-kø

Alt med ⛔ er blokeret af en ❓ og må ikke gættes. Den hurtigste målemetode uden
en menneskekilde er dansk autocomplete (`suggestqueries.google.com`); den er
brugt på de seneste features. Syv lukkede punkter står i `docs/plan-arkiv.md`.

- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» er danske
  autocomplete-træffere, på svensk «bmi barn tabell». WHO's BMI-for-alder-tabeller
  er ~150 tal pr. køn — for mange at transskribere uden uafhængig kontrol, og en
  fejltransskription er værre end manglende side (punkt 11). ⛔ ét skærmbillede
  af WHO's tabel.
- **[ ] Kogetider** — GSCs **2. største søgning** på `/tidsberegner` (824
  visninger, pos. 6,8) er «hvor lang tid», og **10 af 10** danske completioner er
  madvarer med en koge- eller bagetid. *Accept:* kogetid pr. vare pr.
  tilberedningsmåde, kun med kildeførte tider. ⛔ `frbs.foodsearch.lex.dk` og
  `sst.dk` er begge uafgåengelige fra maskinen (❓).
- **[ ] Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske træffere under
  «kalorier» er madvarer. ⛔ samme fødevarekilde som kogetider (❓), derfor én ❓
  dækker begge.
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[ ] «promillegrænse» i udlandet.** 5 af 10 danske træffere under «promille»
  er danmark/sverige/tyskland/italien/norge; vi har dansk og svensk grænse og
  ingen sammenligning. ⛔ tre landes love skal leveres (❓).
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af
  10 træffere under «kvadratmeter», og vi har 98 kommuner i `kommuner.ts` —
  men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).

## VERIFICÉR DEPLOY-noter

**Åben 6/10 05:1x:** `VERIFICÉR DEPLOY: /laantype svarer 200 på begge domæner,
hver sides sitemap indeholder pr. domæne stien, titlen er «Annuitetslån: serielån
eller stående lån?», værktøjet viser de tre rækker med 9.548 kr., 12.222 kr. og
6.667 kr. i måned 1, brødteksten skriver «Serielånet koster 2.674 kr. mere i måned
1, men sparer 234.057 kr. i rente», og **intet sted står decimaler i kroner** —
«2.673,916» skal være **0** ceo/laantype 6/10 05:1x`. Mål på **indhold**:
`curl -s https://minberegner.dk/laantype | grep -o 'Annuitetslån: serielån' | wc -l`
→ **1**, `grep -o '2.673,916' | wc -l` → **0**, `grep -o 'Serielånet koster 2.674
kr. mere i måned 1' | wc -l` → **> 0**, `grep -o '9.548 kr.' | wc -l` → **> 0**,
`curl -s https://minberegner.dk/sitemap.xml | grep -o '/laantype<' | wc -l` → **1**.
Samme tre greb på beraknare.se med «2 674 kr.» og «Annuitetslån: serielån».
⚠️ Første reelle deploy-vindue efter mergen er 6/10 07:30.

**Åben 6/10 04:4x:** `VERIFICÉR DEPLOY: uge og ugedag på /ugedag og
/veckodag er de samme tal for alle læsere, så 5. april 2027 skriver «Uge 14» i
markuppen og ikke «Uge 15», på begge domæner og i alle tidszoner
ceo/ugedag-iso-uge-tidszone 6/10 04:4x`. Mål på **indhold**:
`curl -s https://minberegner.dk/ugedag | grep -o 'Uge 14' | wc -l` skal være
**0** (værktøjet er klient-side og forudindstillet på dagens dato, så 5. april
2027 kan ikke nås med et GET) — brug derfor **brødteksten**, som kalder den
samme `ugedagResultat`: `grep -o 'juleaften' | wc -l` → **> 0** og
`grep -o 'ligger i uge' | wc -l` → **> 0** med tallet fra samme funktion.
Samme to greb på beraknare.se med «ligger i vecka». ⚠️ Første reelle
deploy-vindue efter mergen er 6/10 07:30.

**Åben 6/10 04:2x:** `VERIFICÉR DEPLOY: /dato har en femte værktøjtilstand
«Dage til dato» med feltet «Hvilken dato» forudvalgt til næste juleaften, der
viser antal dage, hele uger og restdage samt datoens ugedag, og listen under
«Hvor mange dage er der til …?» linker til den i da og se
ceo/dage-til-dato 6/10 04:2x`. Mål på **indhold**: `curl -s
https://minberegner.dk/dato | grep -o 'Hvor mange dage er der til …' | wc -l` →
**> 0**, `grep -o 'Vilket datum\|Hvilken dato' | wc -l` → **1** (begge domæner:
beraknare.se med «Vilket datum»). Resultatkortets tekst skal være «Dage til
datoen» og, i januar, «Dage siden». ⚠️ Første reelle deploy-vindue efter mergen
er 6/10 07:30.

**Åben 6/10 04:4x:** `VERIFICÉR DEPLOY: de svy nye landesider
/klokken-i/{frankrig,italien,nederlandene,graekenland,schweiz,marokko,emiraterne}
svarer 200 på minberegner.dk og /klockan-i/{frankrike,italien,nederlanden,
grekland,schweiz,marokko,emiraten} 200 på beraknare.se, Spanien viser både
Madrid og Barcelona, og /tidszone skriver «klokken i 21 land» (ikke «lande»)
ceo/klokken-i-flere-lande 6/10 04:4x`. Mål: `curl -s
https://minberegner.dk/klokken-i/emiraterne | grep -o 'Hvad er klokken i
Emiraterne' | wc -l` → **1** for hver af de svy, `grep -o 'Barcelona' | wc -l`
på `/klokken-i/spanien` → **> 0**, og `curl -s https://minberegner.dk/tidszone
| grep -o 'klokken i 21 land<' | wc -l` → **1**. Samme syv greb på beraknare.se
med `/klockan-i/…`. Første reelle deploy-vindue efter mergen er 6/10 07:30.

⚠️ **Brug `grep -o … | wc -l`, ikke `grep -c`, på rå markup** (målt 6/10
00:1x): Next leverer HTML'en som én linje, så `grep -c` tæller linjer og svarer
1 for alt. Værktøjer der er klient-komponenter skal læses i koden, indtil
facit kan hentes headless.

**Elleve noter er åbne.** Alle er merges efter 21:30-vinduet 5/10, så de bliver
målbare i 07:30-kørslen **6/10**. Næste iteration skal måle dem alle på indhold
i én kørsel (`grep -o … | wc -l` mod begge domæner) og lukke dem med
`DEPLOY OK 6/10`; en note der stadig ikke er live efter to vinduer bliver
`DEPLOY-MISSING`. De lukkede noters fulde krav og målinger ligger i
`docs/plan-arkiv.md`.

**Åben 6/10 03:2x:** `VERIFICÉR DEPLOY: /ugedag på minberegner.dk og
/veckodag på beraknare.se svarer 200 med hver sin titel og beskrivelse,
brødteksten skriver «1. januar 2026 var en torsdag» (da) og «1 januari 2026
var en torsdag» (se), og `/veckodag` på minberegner.dk svarer 301 mod `/ugedag`
ceo/ugedagsberegner 6/10 03:2x`. Mål på indhold: `curl -s
https://minberegner.dk/ugedag | grep -o 'var en torsdag' | wc -l` → **> 0**,
`grep -o 'Ugedagsberegner' | wc -l` → **> 0**;
`curl -s https://beraknare.se/veckodag | grep -o 'var en torsdag' | wc -l` →
**> 0** med «Veckodagskalkylator»; `curl -sI https://minberegner.dk/veckodag`
skal vise **301** med `location: /veckodag`-familien, og begge sitemaper skal
indeholge hver sin sti. ⚠️ Første reelle deploy-vindue efter mergen er 6/10
07:30.

**Åben 6/10 02:4x:** `VERIFICÉR DEPLOY: /braendstof har en Forbrugsomregner med
indtast og enhedsvalg, der viser km/l, l/100 km, mpg (USA) og mpg
(Storbritannien), og brødteksten skriver «6,70 l/100 km = 14,93 km/l» og «15,00
km/l = 35,3 mpg (USA)» i da og se ceo/forbrugsomregner 6/10 02:4x`. Mål:
`curl -s https://minberegner.dk/braendstof | grep -o 'Omregn bilens forbrug' |
wc -l` → **1**, `grep -o '14,93 km/l' | wc -l` → **> 0**. Samme greb på
beraknare.se med «Omvandla bilens förbrukning».

**Åben 6/10 02:3x:** `VERIFICÉR DEPLOY: /kvadratmeter har et ArealOmregner med
indtast og enhedsvalg, der viser alle seks enheder, og brødteksten skriver «500
kvadratfod = 46,45 m²» og «1 acre = 4.046,86 m²» i da og se med «4 046,86» på
beraknare.se ceo/areal-omregner 6/10 02:3x`. Mål: `curl -s
https://minberegner.dk/kvadratmeter | grep -o 'Omregn kvadratmeter til andre
enheter' | wc -l` → **1**, `grep -o '46,45 m²' | wc -l` → **> 0**.

**Åben 6/10 02:0x:** `VERIFICÉR DEPLOY: forsiden har et link til /procent,
/tidszone og /moms i rækken mellem /pension og /loen-efter-skat, og sidebarlen
på /dato har de tre ceo-populaere-sogesider 6/10 02:0x`. Mål: `curl -s
https://minberegner.dk | grep -o 'href="/procent"' | wc -l` → **> 0**, samme
greb for `/tidszone` og `/moms`, og `curl -s
https://minberegner.dk/dato | grep -o 'href="/procent"' | wc -l` → **> 0**.

**Åben 6/10 01:5x:** `VERIFICÉR DEPLOY: /dage-til/sommerferien spørger «Kan
sommerferien begynde senere end den sidste lørdag i juni?» (ikke «…i 2026?»),
og facts' citerer folkeskoleloven § 14 a stk. 2 — samme måling på
/dage-til/efteraarsferien, /dage-til/skolestart og
/dage-til/grundlovsdagen ceo/dage-til-faaarstal 6/10 01:5x`. Mål: `curl -s
https://minberegner.dk/dage-til/sommerferien | grep -o 'senere end 27. juni' |
wc -l` → **0** og `grep -o 'folkeskoleloven § 14 a stk. 2' | wc -l` → **> 0**.

**Åben 6/10 01:2x:** `VERIFICÉR DEPLOY: forsidens sæsonbadge sidder i oktober på
præcis /pension, /opsparing og /arveafgift (kalendermåneden i
Europe/Copenhagen, ikke UTC), og /dato linker til /dage-til/31-december uden
301-hop ceo/trending-lokale-datoer 6/10 01:2x`. Mål: `curl -s
https://minberegner.dk/dato | grep -o 'href="/dage-til/31-december"' | wc -l` →
**1**, `grep -o 'nytaarsaften' | wc -l` → **0**, og på forsiden `grep -o
'>Populær nu<' | wc -l` → **3**.

**Åben 6/10 00:4x:** `VERIFICÉR DEPLOY: /rumfang svarer 200 på begge domæner,
hver sides sitemap indeholder pr. domæne /rumfang, og værktøjet renderer «1 m³»
og «1.000 liter» for den forudindstillede kasse på 2 × 1 × 0,5 m
ceo/rumfang-beregner 6/10 00:4x`. Mål: `curl -s
https://minberegner.dk/rumfang | grep -o 'Rumfangsberegner' | wc -l` → **> 0**,
`curl -s https://minberegner.dk/sitemap.xml | grep -o '/rumfang<' | wc -l` →
**1**, samme to greb på beraknare.se med `Volymberäknare`.

**Åben 6/10 00:2x:** `VERIFICÉR DEPLOY: beraknare.se/tidszone skriver «Nya
Zealand» i landetabellen, «Turkiet» i landelisten og intet dansk «og» i
markuppen ceo/tidszone-svenska-lander 6/10 00:2x`. Mål på **indhold**: `curl -s
https://beraknare.se/tidszone | grep -o 'Türkiet' | wc -l` → **0**, `grep -o
'>Nya Zealand<' | wc -l` → **1**, og `grep -oE ' og ' | wc -l` på sidens råe
HTML skal være **0**.

**Åben 6/10 00:0x:** `VERIFICÉR DEPLOY: landetabellen på /tidszone viser
Australien 10 frem / 8 frem og New Zealand 12 frem / 10 frem i begge spalter på
begge domæner ceo/tidszone-lande-dagsafhaengig 6/10 00:0x`. Mål: `curl -s
https://minberegner.dk/tidszone | grep -c '9 timer frem\|11 timer frem'` skal
være **0**, og `grep -o '10 timer frem' | wc -l` skal være **> 0**.

**Åben 5/10 23:1x:** `VERIFICÉR DEPLOY: forsidens sæsonbadge hedder «Populær
nu» / «Populär nu» / «Populær nå», aldrig «Trending»
ceo/populaer-badge-sprog 5/10 23:1x`. Målt 6/10 00:1x: minberegner.dk har **3**
`>Trending<` og **0** `>Populær nu<` — forventet, mergen kom efter
21:30-vinduet.

**Åben 5/10 22:5x:** `VERIFICÉR DEPLOY: /tidsberegner renderer tidsværktøjet
før svar-først-tabellen på begge domæner ceo/tidsberegner-vaerktoej-foerst
5/10 22:5x`. Mål på indhold: klokkeslæts-feltene skal have et **lavere
tegnindeks** end "Svar på de oftest søgte tidsrum" i markup'en (samme på
beraknare.se med "Svar på de vanligaste tidsintervallen").

**Åben 5/10 22:1x:** `VERIFICÉR DEPLOY: /dage-til/juleaften og
/dage-til/nytaarsaften 301'er til /dage-til/24-december og /dage-til/31-december
(og julafton/nyarsafton på beraknare.se), de fire nye URL'er svarer 200 med
canonical på sig selv, og ingen side i live siger «præcis 30 dage»
ceo/december-dato-i-url 5/10 22:1x`. Mål: `curl -sI` på de fire gamle URL'er skal
vise `301`, og `curl -s …/dage-til/1-december | grep -o '30 dage' | wc -l` skal
være **0**.

**Åben 5/10 21:4x:** `VERIFICÉR DEPLOY: efterlønsberegnerens deltid-gren viser
13.372 kr. og 14.694 kr., ikke 13.438 kr. og 14.768 kr. ceo/efterloen-deltid-andel
5/10 21:4x`. Mål på indhold: 0 matches på `13.438`, `13.372` og `14.694` på
`https://minberegner.dk/efterloen` (siden er en klient-komponent — brug et
headless kald eller læs `EFTERLOEN_MAX_SATS_DELTID` i koden).

**Åben 5/10 17:5x (Sentry, delvist lukket):** `VERIFICÉR DEPLOY: Sentry
MINBEREGNER-2 "useLocale must be used within a LocaleProvider" på POST / er
rettet ved at wrappe NotFoundSearch i LocaleProvider i not-found.tsx
ceo/sentry-uselocale-fix 5/10 17:5x`. **Lukket 5/10 21:3x** for det der kan
måles udefra. **Åben:** at fejlen er væk afgør kun Sentrys egen hændelsestæller
(2 hændelser / 0 brugere på 14 dage) — læs den 14/10.

## ❓ Til Mads

- ⛔ **GitHub Actions kunne ikke starte job på minberegner.dk** (5/10 19:35–20:37,
  lukket 6/10 00:0x). Tre kørsler blev `cancelled` efter præcis 15 min med nul
  steps. Kørslen 5/10 21:26 og 6/10 00:40 var grønne, så det var en time med kø.
  Ingen handling: tjek én gang ved iterations start med `gh run list -L 1`.
- ❓ **`auto/union-night` har unikt arbejde, der aldrig er landet** (4/10 04:1x).
  Branchen er fra 17/9 og skiller sig fra `master` i `BACKLOG.md`,
  `docs/kommercielt-inventar.md` og `docs/timepris-nichetest.md`. Sidste fil er et
  markedstal — samme slags kilde, der låser ❓ «Kilde til svenske og norske
  frilanstimepriser». Skal de merges, eller er de forældede? Må ikke slettes
  uden svar.
- ❓ **Sentry MINBEREGNER-2 — `useLocale must be used within a LocaleProvider` på
  `POST /`** (5/10 13:0x, undersøgt og ikke reproduceret). Den kendte årsag er
  rettet (2/10) og dækket af `error.test.tsx`. **Ét skærmbillede af
  Sentry-hændelsen** (transactions + request headers + de to ssr-chunks) ville
  sige hvilken komponent der mangler kontekst.
- ❓ **Kogetider og fødevaredata — den 2. største søgning på `/tidsberegner`**
  (4/10 03:1x, højst prioriteret). «hvor lang tid» har **824 visninger** på
  pos. 6,8, og **10 af 10** danske completioner er madvarer med et koge- eller
  bagetid. `frbs.foodsearch.lex.dk` (Fødevarestyrelsen) og `www.sst.dk` er begge
  uafgåengelige fra maskinen. **Ét skærmbillede fra en fødevaredatabase-tabel**
  låser både kogetider **og** kalorieportioner.
- ❓ **Promillegrænser i Tyskland, Norge og Italien** (4/10 03:2x). 5 af 10 danske
  træffere under «promille» er udenlandske grænser. Vi svarer rigtigt på
  Danmark, men Sverige, Tyskland og Norge giver tre forkerte svar på ét domæne.
- ❓ **Kvadratmeterpris pr. kommune** (4/10 03:4x). «kvadratmeterpris
  københavn/odense» er 3 af 10 træffere under «kvadratmeter», og vi har 98
  kommuner til boligstøtten. **Én kilde pr. kommune er for mange** — kun de 5-10
  største byer er realistiske.
- ❓ **Hvor deployes den norske udgave?** (2/10 14:15.) Målt i live: `beregner.no`
  serverer et **helt andet site** med `/kalkulator/<slug>`-ruter og 115 URL'er i
  sin egen sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains`. Al norsk tekst er derfor usynlig. Skal `beregner.no` servere
  denne app, eller er den norske udgave ikke i drift?
- ❓ **Ferieåret er ikke længere 1. september – 31. december** (målt 12:3x).
  `page-data.ts` og `/feriepenge/page.tsx` siger «optjeningsperioden 1. september
  til 31. august, og ferieåret løber fra 1. september til 31. december året
  efter» — det er reglerne fra FØR ferielovsændringen. Ét skærmbillede af
  ferielovens § 7 låser det. Koden er bevidst urørt — punkt 11.
- ❓ **Ferieåret — otte kilder er uafgåengelige** (4/10 04:1x). Efter
  `retsinformation.dk/api/eli/lta/2020/1146/pdf`, `arbejdsmarkedetsparad.dk`,
  `besk.ft.dk/love/eli/2020/1146`, `lex.dk/ferieloven` og `da.dk` er seks kilder
  prøvet. Koden urørt.
- ❓ **Søgningseksport fra Search Console** (30/9). GSCs opsummering viser kun
  3-4 søgninger pr. side; for `/procent` er de tre tilsammen **364 visninger**.
  **Et skærmbillede af Search Console → Effektivitet → Søgninger, filtreret på
  `/procent`, plus de 20 største søgninger for hele domænet, låser F1-F3.**
  Målt 5/10 22:0x: dansk autocomplete er *ikke* en erstatning — den kan finde
  emner, men ikke rangere dem eller give en visningstælling.
- ❓ **Feriedatoer uden lovkilde** (3/10 05:30). da.wikipedia `Ferie` siger «Vinterferie
  (**typisk** i uge 7 eller 8)» — altså ingen fast uge for vinterferien. **Ét
  skærmbillede fra en kommunes ferieplan 2026/2027 (helst to kommuner) låser
  vinterferie, påskeferie og efterårsferie på én gang.**
- ✅ **Ferielovens regel for sommerferiens startdato** (opgave 201) — **lukket 6/10
  01:5x.** Folkeskoleloven § 14 a stk. 2 siger ordret «Elevernes sommerferie
  begynder den sidste lørdag i juni», læst på retsinformation.dk 6/10 2026.
- ❓ **`ceo/boliglaan-procent`-noten er for snævt formuleret** (3/10 12:47). Den
  kræver «95,0 % belåning» og «5,05 % p.a.», men det er interpolationer fra
  brugerens felter. Skal dømmes på 0 `\d%` og de statiske strenge.
- ❓ **Momslovgrænserne på `/moms`.** Dansk registrering «over 50.000 kr»,
  svensk «högst 120 000 kr per år» og «told ved import over 1.150 kr» (en
  EUR-grænse fra forordning 1186/2009, som ikke må stå som et fast dansk
  beløb). **Ét skærmbillede af ML § 48 og ét af den svenske grænse.**
- ❓ **IndexNow mangler to env-værdier.** `INDEXNOW_ENABLED=true` og
  `INDEXNOW_API_KEY=<8-128 teg af A-Z, a-z, 0-9, - >` skal sættes i Dokploys
  miljøvariabler — nøglen må ikke i en commit. Uden dem returnerer modulet
  `skipped: disabled` ved hver boot.
- ❓ **Kilde til svenske og norske frilanstimepriser.** Ét skærmbillede af et
  markedstal for Danmark, Sverige og Norge låser `/timepris` pr. `Locale`.
- ❓ **Efterlønnens deltidandel: 2/3 eller 0,67?** — lukket 5/10 21:4x uden
  lovkilde. **Dobbeltreglen er dog stadig ulæst** — hvis loven faktisk siger
  67 %, er det *dagpenge*-delen der skal rettes, ikke efterløn.
- ❓ **To skanner-rækker uden fejl i koden** (5/10 21:2x). `npm test` skriver
  «FEJL: 1 ureviewet(e) danske streng(e) …» med `src/app/procent/page.tsx:621` og
  «FEJL: 34 …» med 20 linjer i `src/app/promille/page.tsx`, der er ren dansk i en
  komponent der monteres på beraknare.se. **⛔ Ikke opgaver at fjerne ord for** —
  kræver en stopordsliste der skelner mellem sprog, eller en allowlist-fil.
- ❓ **Et tidligere suitekørsel gav 1 rød i `locale-leak-gate.test.ts`**, som
  scanneren kører i en udspawnet proces og som er grøn i isolation og i to
  senere fulde kørsler. Ikke reproduceret; urørt.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)»; `skat.dk` svarer 500. Teksten siger nu kun hvad beregneren
  regner med.
- ❓ **Fitnessfradrag, sommerhusudlejning, grundskyld for Varde og Playwright.**
  Fire mindre kilder, noteret i `docs/plan-arkiv.md` 2/10 14:20. Repoet har
  stadig intet Playwright, så UI-opgaver kan ikke få skærmbilleder.
