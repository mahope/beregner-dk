# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — 30/9 21:50. **Opgave 189 er fændig** (`ceo/promille-lovkilde`):
de to første love-påstande er hentet i lovens *egne* ord og lagt i en port, og
porten fandt en rigtig fejl første gang den kørte. Se listen nedenfor.

**Fundet.** `/promille`s landstabel skrev at Danmark har **"Ingen særregel"** —
på dansk *og* svensk side. Rådet for Sikker Trafik, læst 30/9 21:20, siger det
modsatte: "For nye bilister er promillegrænsen 0,2 de første 3 år med kørekort",
sænket i 2025. En dansk læser fik dermed den forkerte besked at kun de
svenske og norske læsere har en lavere grænse. Rettet i begge tabeller.

**Fandt også en løgnemesis.** `PROMILLEGRANSE_UDLAND`'s docblock sagde at
kilden var WHO's landoversigt, og at siden "stater den lavere grænse for nye
og professionelle bilister" — den gjorde den *ikke*, for Danmark. Docblocken er
nu rigtig for de to lande der har en hentet kilde, og siger ærligt at de otte
andre stadig er Springvand.

**⚠️ Målerfældens sjette udløber.** En port der scanner "alle decimaler i
FAQ'en" mod lovens tal gav **29 fund i dansk og 31 i svensk, og alle var
rigtige**: beregnede promiller ("2 øl ger 0,44 promille"), Tysklands 0,0,
Storbritanniens 0,8 og et hypotetisk "må jeg køre med 0,4". En syvende fejl
var min egen formatter: `String(2.0)` er `"2"`, ikke `"2,0"`, så to tests fejlede
på sig selv. **Porten skal kræve kildens tal frem for at søge efter forkerte.**

**Næste opgave: 189b** — de fire love-påstande der stadig mangler en hentet
kilde. Retsinformation.dk svarer **kun en SPA-skal** til en agent (alle
`/api/document/*`-stier: HTTP 200, `text/html`, ~4,5 KB index.html), så danske
love skal læses gennem RST, borger.dk eller en kommunal vedtægt.

**⚠️ Målerfælder fra 190, fortsat gældende.** `\b` før `är` matcher aldrig i JS
(`\w` er ASCII). En bred ugedags-port gav 15 fund hvor 13 var om andre dage. Et
egenscript til at tjekke påstande fik tre fejl i træk — kryds altid mod lovens
egen tekst.

**⚠️ Målerfælde (30/9 15:40).** `npm run test` kører `locale-leak-gate.test.ts`,
der med vilje planterer **to** danske lækager. Derfor kommer to
`FEJL: n ureviewet(e)`-blokke i output. Det er **ikke** fund i din diff. Kør
gaten separat: `node scripts/locale-leak.mjs --gate` (exit 0).

**Seks VERIFICÉR-noter åbne** (fra 190, 188, F8, F7, F6 og F4). F1/F3/F5 og
opgaver 97/98/119/183 er blokeret af svar fra Mads. **Opgave 187 må ikke røres
før 13/10.** **CEO-køen er tom** — alle otte punkter blev rettet i `aca17e5`.
Review-fund 29/9 er begge mærket `RETTET d563ba2` og lukket.

## Love- og kalenderpåstande mod en hentet kilde (opgave 189)

Prioriteret liste. **Fem er hentet og kontrolleret 30/9**, fire mangler en
hentet kilde. `✔` = lagt i en port, `·` = kilde fundet, endnu ikke port.

| # | Påstand | Kilde (hentet 30/9 30 min) | Port |
|---|---|---|---|
| 1 | SE 0,2 ‰ rattfylleri · 1,0 ‰ grovt | trafikbrottslagen (1951:649) 4 § og 4 a §, riksdagen.se | ✔ |
| 2 | DK 0,5 ‰ · nye bilister 0,2 ‰ i 3 år · over 2,0 kørekort ubetinget | færdselsloven § 53, ordret gengivet af Rådet for Sikker Trafik | ✔ |
| 3 | SE helgdagar (1 §) | lag (1989:253) 1 §, riksdagen.se — F8's port | ✔ |
| 4 | UK 0,8 / Skotland 0,5 | WHO's landoversigt via Wikipedia — **ikke hentet lov** | · |
| 5 | DE 0,0 under 21 og 2 år · 0,3 ved anden forseelse | samme som 4 | · |
| 6 | DK Store bededag afskaffet 2024 | loven er ikke fundet — retsinformation uutilgængelig | ❓ |
| 7 | DK grundlovsdag 5. juni | ikke hentet | · |
| 8 | DK palmesøndag, juleaftensdag | ikke hentet | · |

**Hvorfor kun to blev lagt i port nu:** de otte øvrige rækker i samme tabel
kommer alle fra én Wikipedia-tabel. At låse dem ville låse netop de ord porten
så (F8's målerfælde) uden at have læst en eneste lov. **189b** er den
fortsatte opgave, og den skal hente lovene — ikke flere regler.

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

**F4. [x] ✅ `ceo/forsiden-snabb-indgang` — forsiden er et indgangspunkt, ikke
en tekstside.** Kompakt stribe med links til de otte mest brugte beregnere,
lige under helten og før tillidsrækken; `grid-cols-2 sm:grid-cols-3
lg:grid-cols-4`, `min-h-11` pr. flade, mørk tilstand på de tokens siden
allerede bruger. Listen er **de otte første `popular: true`**, ikke en ny liste,
så den ikke kan rådne væk fra trafikken. Otte nye tests, fire mutationer
faldt. Se arkivet.
**MÅL:** `/` 218 besøgende/28d, bounce 38 % → mod 2-7 % (Plausible 2026-09-30);
se `/` 20 besøgende, bounce 80 %. Genmål 14 dage efter at den er live.

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

**F7. [x] ✅ `ceo/tidszone-tidsforskelle` — Sydney lå på 9-10 timer, kalenderen
giver 8-10.** `/tidszone`s "Populære tidsforskelle" var fem håndskrevne
`<li>`-linjer i begge sprog. Sydney stod som "9-10 timer foran", men Sydney er
AEST (UTC+10) / AEDT (UTC+11) mod Danmarks CET/CEST (UTC+1/+2), og dens
sommertid løber **modsat** Danmarks — så den laveste forskel er **8** timer, ikke
9. `sommertid.test.ts:62-63` regnede allerede 8 og 10, så brødteksten modsatte
repoets egen test. Nu regnes alle fem forskelle af `tidsforskelsRækker`, som
går **hver dag i et helt år** igennem `erSommertid` med byens egen `dst`-regel
(nyt felt i `TIDSZONER`, samme regler som `TidszoneBeregner.tsx`), så tallene
kommer fra samme kilde som tabellen ovenfor. **Målet blev fire fund undervejs,
alle rettet før commit:** New York er 5-6 (ikke 6) og LA 8-9, fordi USA skifter
2. søndag i marts mod Danmarks sidste søndag; Tokyo er 7-8 i stedet for den
gamle sætning om "8 om vinteren, 7 om sommeren"; Madrid deler CET/CEST med
Danmark og skrives "samme tid som Danmark" frem for "0 timer foran"; og et
interval skrives stigende ("5-6") og altid med to tal. 10 nye tests, 3
mutationer kontrolleret (interval baglæns, enhed efter bredde, London på
USA-datoer) + én der fanger en regression i JSX'en alene. Se arkivet.
**MÅL:** `/tidszone` under top-15 i Plausible, 24.324 GSC-visninger / 104 klik /
CTR 0,4 % / pos. 7,5 (GSC 2026-08-31 → 2026-09-28). Genmål 14 dage efter at
den er live.

**F8. [x] ✅ `ceo/svensk-helgdagslove` — tre svenske sider modsagde
`lag (1989:253)`.** Den 29/9 byggede `/dage-til/`-klyngen med ca. 140
håndskrevne faktasætninger. De er ikke målt af nogen, og de er præcis den
fejlklasse de otte CEO-fund og de to review-fund er: et tal eller en lov i
brødteksten, ingen test. Audit af alle 19 hændelsers facts + FAQ gav tre
fejl, alle svenske, alle i **den samme love**:

| Side | Skrev | Loven siger |
|---|---|---|
| se `/julafton` | "Både julafton og nyårsafton räknas som helgdagar i den svenska kalendern" | 1 § räknar **juldagen och annandag jul** — inte julafton. Och **nyårsafton står inte alls**, bara nyårsdagen. |
| se `/skartorsdagen` | "Skärtorsdag, långfredag, påskdagen och annandag påsk är alla officiella svenska helgdagar" | 1 § har långfredagen och annandag påsk, **inte skärtorsdagen**. Siden modsagde også sig selv: F3 på samme side siger at man *ikke* har automatisk ret til dagpenning. |
| se `/nationaldagen` | "Den är inte en laglig helgdag" (F2 **og** FAQ) | 1 § tager uttryckligen upp nationaldagen, 2 § fastställer "den 6 juni". |

Kilden er hentet fra riksdagen.se (SFS 1989:253 t.o.m. SFS 2004:1320). Alle
tre er rettet til at pege på loven ved *dens* navn. Dansk side var korrekt
igennem hele vejen — `grundlovsdag` siger "ikke en helligdag, men lovens
fridag", og det er præcis den skelnen de svenske sider havde mistet.

**Ny port:** `lag (1989:253) 1 §` ligger i `dage-til.test.ts` som data
(`LOEN_SIGER_HELGDAG`, pr. hændelses egen svenske slug), og brødteksten
tjekkes mod den i begge retninger — en dag loven ikke tæller må ikke kaldes
helgdag, og en dag loven tæller må ikke kaldes *ikke*-helgdag. 2 nye tests,
begge kontrolleret mod den gamle kode (begge faldt). Se arkivet.
**MÅL:** se `/nedtaelling` 5.726 GSC-visninger / 12 klik / CTR 0,2 % / pos. 9,2
og 0 visninger i GSC's top-15 for de 16 `/dagar-till/*`-sider (GSC
2026-08-31 → 2026-09-28). Genmål 14 dage efter at den er live.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 627 filer
npm run test     # vitest run            — 3249 tests / 197 filer
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

**Syv noter åbne.** HTTP 200 beviser intet: 189's note rører to *tabelceller* med
lovtal, der er usynlige for `curl` uden at man læser dem. De otte lukkede noter
er verificeret 30/9 17:46-17:53 på indhold; alle målinger står i
`docs/plan-arkiv.md`.

- ⏳ **Danmarks række skal sige 0,2 ‰ de første 3 år, ikke "Ingen særregel".**
  `ceo/promille-lovkilde`. På `https://minberegner.dk/promille` skal
  Danmarks række i landstabellen lyde **"0,2 ‰ de første 3 år med kørekort
  (sænket i 2025)"**, og på `https://beraknare.se/promille` den svenske
  **"0,2 ‰ de första 3 åren med körkort (sänkt 2025)"**. Strengen **"Ingen
  særregel" / "Ingen särregel" må ikke forekomme på Danmarks række** i nogen af
  de to tabeller — den er lovstridigt modsat RST. HTTP 200 beviser intet, det er
  en cellecelle. Prøven på dansk er `src/lib/promille-loenkilde.test.tsx` efter
  deploy. Vindue **1/10 07:30** (denne merge sker efter 30/9 21:30).

- ⏳ **Skærtorsdagen må ikke kaldes helgdag, og 1. advent må ikke kaldes
  ikke-helgdag.** `ceo/helgdag-uden-allman`. På
  `https://beraknare.se/dagar-till/skartorsdagen` må **"en torsdag och en
  helgdag"** og **"Båda är helgdagar"** ikke forekomme nogen steder; siden skal
  forklare forskellen mellem *röd dag* og *allmän helgdag*. På
  `https://beraknare.se/dagar-till/paskdagen` må **"Båda är officiella
  helgdagar"** ikke forekomme. På `https://beraknare.se/dagar-till/1-advent` må
  **"Första advent är inte en allmän helgdag"** ikke forekomme — lovens 1 §
  tæller alle søndagar. HTTP 200 beviser intet, det er brødtekst. Prøven på
  dansk er `src/lib/dage-til.test.ts` efter deploy. Vindue **30/10 07:30**.

- ⏳ **Ingen side må kalde en skiftende dato en hverdag, og skærtorsdag er en
  torsdag.** `ceo/sidste-hverdag-paastand`. På
  `https://minberegner.dk/nyaarsaften` og `https://beraknare.se/nyarsafton`
  må "Sidste hverdag i december" og "Sista vardagen i december" **ikke**
  forekomme nogen steder — teksten skal sige månedens sidste dag uanset
  ugedag. På `https://minberegner.dk/sankthansaftensdag` må "en almindelig
  hverdag" **ikke** forekomme (23. juni er weekend i 2029, 2030, 2035, 2040).
  På `https://minberegner.dk/skaertorsdag` skal spørgsmålet "Er skærtorsdag en
  fridag?" have svaret **"Nej"** med "altid en torsdag" i svaret. HTTP 200
  beviser intet — det er brødtekst på statiske sider. Prøven på dansk er
  `src/lib/dage-til.test.ts` efter deploy. Vindue **1/10 07:30**.

- ⏳ **De tre svenske helgdagspåstande skal være rettet i lovens ord.**

  `ceo/svensk-helgdagslove`. På `https://beraknare.se/dagar-till/julafton`,
  `/dagar-till/skartorsdagen` og `/dagar-till/nationaldagen`: **"9-10", "räknas
  som helgdagar", "officiella svenska helgdagar" for skärtorsdagen og "är inte
  en laglig helgdag" må ikke forekomme nogen steder.** Siden skal i stedet sige
  at julafton och skärtorsdagen *ikke* er allmän helgdag enligt
  lagen (1989:253), og at nationaldagen *er* det. HTTP 200 beviser intet — det
  er brødtekst. Prøven på dansk er `src/lib/dage-til.test.ts` efter deploy.
  Vindue **1/10 07:30**.

- ⏳ **Sydney skal stå med 8-10 timer foran, ikke 9-10.** `ceo/tidszone-tidsforskelle`.
  På `https://minberegner.dk/tidszone` og `https://beraknare.se/tidszone`: under
  "Populære tidsforskelle fra Danmark" skal linjerne være læst
  `London: 1 time bagud`, `New York: 5-6 timer bagud`, `Los Angeles: 8-9 timer
  bagud`, `Tokyo: 7-8 timer foran`, `Sydney: 8-10 timer foran` — og på svensk
  `1 timme efter` / `5-6 timmar efter` / `8-9 timmar efter` / `7-8 timmar före` /
  `8-10 timmar före`. Tallet **9-10 må ikke forekomme nogen steder** på siden.
  Den praktiske prøve er `src/app/tidszone/page.test.tsx` efter deploy. Vindue
  **1/10 07:30** (denne merge sker efter 30/9 17:30).

- ⏳ **Norske tal skal ikke få dansk tusindtalsseparator.** `ceo/no-locale-tag`.
  Kontrollér **indhold** på `https://beregner.no/proteinbehov` (latent — domænet
  404’er i dag, så læg på dansk og svensk at dansk/svensk output er uændret):
  `ProteinbehovBeregner` skal bruge `getIntlLocale`, og ingen fil må stå med
  den toarmede kæde `locale === "se" ? "sv-SE" : "da-DK"`. Den praktiske prøve på
  dansk er, at `npm run test` fortsat er grøn på
  `src/lib/intl-locale-tag.test.ts` efter deploy. Vindue **30/10 07:30** (denne
  merge sker efter 17:30).
- ⏳ **Striben på forsiden skal ligge før tillidsrækken.** `ceo/forsiden-snabb-indgang`.
  På `https://minberegner.dk/` og `https://beraknare.se/`: de otte links skal
  komme **før** tillidsrækken ("Gratis beregnere"/"100+ gratis") og før
  overskriften "Populære beregnere"/"Populära kalkylatorer" i markupken, og på
  beraknare.se skal de otte hrefs have svenske titler. Prøven på dansk er
  `src/app/forside.test.tsx` efter deploy. **En pixelmåling på 390 px er ikke
  lavet** — repoet har intet Playwright (❓); højden over fold er beregnet, ikke
  målt. Vindue **30/10 07:30**.

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

#### 188. [x] ✅ `ceo/sidste-hverdag-paastand` — tre ugedags-påstande rettet, og de måles nu mod ankeret (30/9)

- **Datagrund:** fundet under F8's audit, samme klasse som review-fund 2 om
  docblockens årstal. Se `nytaarsaften` (da: "Sidste hverdag i december er 31.
  december") og `nyarsafton` (se: "Sista vardagen i december är 31 december").
  Begge er sande **kun** når 31. december falder på en hverdag. Målt: 31.12 er
  weekend i **2028 (søn), 2033 (lør), 2034 (søn) og 2039 (lør)** — på de år er
  påstanden bogstaveligt forkert, og siden viser den alle dage.
- **Hvorfor det ikke blev rettet samme commit:** F8's gate er bygget om
  lovens liste, og denne påstand er ikke en lov- men en kalenderpåstand. At
  blande den ind i samme diff ville gøre de to svært forskellige rettelser
  umulige at rulle tilbage hver for sig — og opgaven siger, at en
  rettelsesfejl der dækker to ting er værre end to dage.
- **Acceptkriterier:** påstandene er skrevet så de er sande i alle år (fx
  "31. december er sidste dag i december, uanset hvilken ugedag den falder
  på"), og en test låser at ingen `da`/`se`-sætning på den slags dato
  kalder den en hverdag/vardag uden at nævne forbeholdet. Gaten grøn.
- **MÅL:** ingen trafikvirkning i sig selv — `/nytaarsaften` er ikke i
  GSC's top-15. Men den ligger på to svenske og to danske svar-først-sider,
  og klassen (påstand om et fast tal, der ikke er fast) er den samme som
  CEO-køens otte fund.
- **⚠️ 30/9: opgaven fandt to fejl den ikke navngavde.** Porten regner de
  faktiske datoer over 61 år, så den fandt to *mere* end de to i
  opgaveteksten, begge i samme klasse: (1) `sankthansaftensdag`'s FAQ svarede
  at 23. juni er "en almindelig aften på en **almindelig hverdag**" — 23. juni
  er weekend i **2029, 2030, 2035 og 2040**; (2) dansk `skaertorsdag`
  svarede på spørgsmålet "er skærtorsdag en fridag?" med **"ja, den er en
  fridag"** — på en side der to linjer ovenfor siger at skærtorsdag *altid*
  er en **torsdag**. Begge er rettet i samme commit, fordi de er samme
  fejlklasse og samme fil, og de deler port.
- **⚠️ Målerfældens anden udløber — dokumenteret i testens docblock.** En
  *bredere* port ("enhver nævnt ugedag skal være blandt ankerets dage") gav 15
  fund, hvor **13 var om andre dage**: "Fredagen efter Kristi himmelfartsdag er
  en hverdag", "Påskeaften er torsdag" (siden handler om langfredag),
  "sommerferien starter den **sidste lørdag i juni**" på efterårsferiens side.
  Alle 13 var rigtig tekst, som porten ville have tvunget til ødelæggelse.
  Porten er derfor snæver: den tester de to påstande der faktisk var forkerte,
  ikke alle ord i brødteksten. Samme lektion som F8's målerfælde.
- **Port:** `muligeUgedage` regner `getNextAnchorDate` for hvert år 2020-2080 og
  kræver (a) at "hverdag/vardag" på en dato der kan ligge i en weekend har et
  forbehold i samme sætning eller en ledsætning ("når … holdes på en
  hverdag" tæller), (b) at et "er X en \<ugedag\>-spørgsmål" med *ja*-svar
  rammer en dag ankeret faktisk kan falde på, og (c) at skærtorsdagen svarer
  *nej* på fridags-spørgsmålet og kun falder på uge 4 (torsdag). Alle tre
  mutation-kontrollerede mod den gamle kode — alle tre faldt.

#### 190. [x] ✅ `ceo/helgdag-uden-allman` — det bløde "helgdag" på en dag loven ikke tæller (30/9)

- **Datagrund:** F8's fejlsøgning. `kalderDetHelgdag` matchede kun "allmän
  helgdag", "allmänna helgdagar", "helgdag i den svenska kalendern",
  "officiell svensk helgdag" og "officiella svenska helgdagar" — det bløde
  "helgdag" var ikke på listen. Den fandt tre sætninger, der modsagde deres
  egen faktaboks: `skartorsdagen:525` ("Ja, den är en torsdag och en helgdag"),
  `skartorsdagen:530` ("Båda är helgdagar") og `paskdagen:460` ("Båda är
  officiella helgdagar") — sidstnævnte på en helt anden side, fordi porten
  målte på *sidens* slug og ikke på den dag sætningen omtaler.
- **Den fjerde fejl fandt loven, ikke porten.** 1 § första stycket: "Med allmän
  helgdag avses … **söndagar**, däribland påskdagen och pingstdagen". Advent står
  ikke i nogen liste, men 1. advent er *altid* en søndag, så loven tæller den —
  og tabellen sagde `false`. Siden skrev derfor "Första advent är ikke en allmän
  helgdag enligt lag (1989:253)", modsat loven med lovens eget navn, to linjer
  under at alle søndagar er røde dage. **Mål ikke kun mod egne data:** loven
  blev hentet fra riksdagen.se 30/9 20:45.
- **Port:** `kalderDetBlødeHelgdag` arbejder på **klausul**-niveau (skel på
  punktum *og* komma) og skelner *predikat* fra *omtale*: kun klausler der
  navngiver en lovfri dag, eller der `PRAEDIKERER_HELGDAG` rammer
  ("den är en torsdag och en helgdag", "Båda är helgdagar"), tjekkes. Uden den
  skelnen ville porten afvise halloween-siden ("Det är allhelgonadagen 1
  november och alla helgons dag som är helgdagar" — korrekt, og *allhelgons
  dag* er netop i loven). To tests mere: tabellen skal sige `true` for enhver
  hændelse der **beregnes** at være en søndag over 61 år (påskedagen,
  påskedagen+49, 1. advent — alle tre regnet, ingen håndplukket), og siden skal
  sige *positivt* at søndagen er grunden.
- **Fire mutationer kontrolleret:** gammel skärtorsdagen-tekst (2 fund), gammel
  paskdagen-svar (1 fund), `1-advent: false` i tabellen (3 fejl), begge gamle
  1-advent-tekster (1 fejl). Alle faldt; ingen af dem lod porten være grøn.
- **⚠️ Målerfældens tredje udløber — skrevet i testens docblock.** JavaScripts
  `\w` er ASCII, så `\b` før `är` **aldrig** matcher: `kalderDetHelgdag`-formen
  `\b(?:er|är)\b` så rigtig ud og fangede intet, fordi den kun virkede for
  svenske *helgdag* — altså et mønster der låser præcis de ord porten så.
- **MÅL:** ingen trafikvirkning — se `/skartorsdagen` og se `/paskdagen` er ikke
  i GSC's top-15 (0 visninger for de 16 `/dagar-till/*`-sider, målt 30/9). Værdi
  som 188: en svensk læser skal ikke møde to sider der siger modsatte ting om
  loven på 200 ord. VERIFICÉR: nedenfor.

#### 189. [x] ✅ `ceo/promille-lovkilde` — de to første love-påstande er hentet i lovens egne ord

- **Datagrund:** `PROMILLEGRANSE_UDLAND`'s docblock sagde at kilden var WHO's
  landoversigt, og at siden "stater den lavere grænse for nye og professionelle
  bilister" — den gjorde den ikke, for Danmark. Særreglerne var frie håndskrevne
  strenge over for tabellens tal.
- **Port:** `src/lib/promille-loenkilde.test.tsx`. `LOVKILDE` er *data fra
  kilden* med afsnit og hentningsdato, og porten læser tallene derfra — så et
  tal der ændrer sig i loven, ændrer hvad porten kræver af brødteksten.
  8 tests, **2 mutationer kontrolleret**: gammel kode med "Ingen særregel" (1
  fejl) og svensk kilde ændret til 0,3 (5 fejl).
- **Fund ved første kørsel:** landstabellen skrev "Ingen særregel" for Danmark
  på begge domæner. RST siger 0,2 ‰ de første 3 år med kørekort, sænket i 2025.
- **Målerfældens sjette udløber.** En port der scanner *alle* decimaler mod
  lovens tal gav 29 danske og 31 svenske fund, **alle rigtige** — beregnede
  promiller, Tysklands 0,0, Storbritanniens 0,8 og et hypotetisk "må jeg køre
  med 0,4". En syvende fejl var min egen formatter: `String(2.0)` er `"2"`, så
  to tests fejlede på sig selv. **Løsningen er samme som F8's: porten skal
  kræve kildens tal, ikke søge efter forkerte.** Se listen øverst.
- **189b.** Fire påstande mangler stadig en hentet kilde. Retsinformation.dk
  svarer kun en SPA-skal til en agent — alle `/api/document/*`-stier giver HTTP
  200 `text/html` ~4,5 KB index.html — så danske love skal læses gennem RST,
  borger.dk eller en kommunal vedtægt. Ikke samme fejl tre gange: hent først,
  skriv så porten.
- **MÅL:** `/promille` 133 besøgende/28d, 5.648 GSC-visninger / 84 klik /
  CTR 1,5 % / pos. 7,9 (GSC 2026-08-31 → 2026-09-28). Genmål 14 dage efter at
  den er live. Fuldtekst: `docs/plan-arkiv.md`, "Opgave 189".

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
  F4's højde over fold på 390 px. Jeg har låst rækkefølgen i markupken og
  beregnet højden, men ikke målt den — og layoutet i helten, tillidsrækken og
  striben er det, en skærmdump ville afkræfte.
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
