STATUS: 3/10 23:0x. ✅ **Begge procent-klasser er lukket — `}%` (35 fund) og de rå
       `\d%` i `<td>`/brødtekst (30 fund).** `ceo/procent-mellemrum-bilsider`.
       Målt, ikke troet: planens opgave talte 21 linjer i syv filer; egen måling
       fandt **30 noder i fire filer**, og to af planens filer var **allerede
       rene i `HEAD`** — `/billaan` skriver rentesatsen gennem `sats()` (`:30`,
       `${formatNumber(...)} %`) og `/kalorier` gennom `${usikkerMin}-${usikkerMaks} %`.
       De 6 + 3 træffere i live-målingen 3/10 21:5x var derfor **gammel kode fra
       før fixen**, altså et deploy-vindue og ikke en fejl i koden — den fejltype
       planen havde mistet tiden på at lede efter. Rettet: `/bil` (8 noder —
       tabellen med værdiforringelsen står to gange, da+se), `blog/boligsalg` (11),
       `blog/biloekonomi` (9), `/topskat` (2) og `BoligsalgBeregner`s disclaimer
       (1, var ikke med i planens liste). Én dansk fejl i samme sætning:
       «(total 297.000 kr)» → «totalt». Loftet **261 → 231**, målt ved at sætte
       det til 0 og læse den faktiske længde i fejlmeldingen.
       `boligsalg/page.test.tsx:77` så på «3-6%» i en *forbudt*-liste og ville
       ikke have kunnet fange den igen — opdateret til «3-6 %».
       ⚠️ *Målt, ikke gættet:* «30% reglen» og «4%-reglen» er **regelnavne**, ikke
       procenter, og står uændret; de tre svenske momssatser på `/moms` er ⛔ ❓.
       Verify: typecheck, lint (757 filer), **4141 tests / 262 filer**, build.
       Næste iteration skal være en **feature** — de tre sidste var tekstporte.
       PR-TJEK: 3/10 23:0x (ingen åbne). BRANCH-TJEK: 3/10 15:3x. CI grøn ved
       start (`f973a06`), ingen uløste Sentry-fejl, Sentry er kodet.

## Arkiveret i denne blok

- 3/10 22:2x — `ceo/procent-interpolation-til-nul`: `INTERPOLATION_LOFT` **0**,
  35 fund i 14 filer (`/blog/arveafgift` 13, `page-data.ts` 4,
  `kalorier-eksempler.ts` 3, …). Bivirkning: `/dagpenge`s metaDescription blev
  161 tegn, så «ud fra din løn» → «fra din løn» (157); 7 testfiler dømte den
  gamle lim. → `docs/plan-arkiv.md`
- 3/10 23:0x — `ceo/procent-mellemrum-bilsider`: de 30 rå `\d%` → `docs/plan-arkiv.md`

## Afsluttet: de rå procenttal i `<td>` og brødtekst (ikke `}%`)

[x] ✅ 3/10 23:0x — se F5c og `docs/plan-arkiv.md`. Loftet 261 → 231; de fem
navne-undtagelser («30% reglen» ×2, «4%-reglen») står uændret. **MÅL:** /bil 24,
/billaan 24, /kalorier 273 besøgende/28d; øvrige ikke i top-15.


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
| `/alder` | under top-15 | 10.029 | **0,4 %** | 7,2 |
| `/tidszone` | under top-15 | 23.351 | **0,4 %** | 7,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | 218, bounce 38 % | under top-15 | — | — |
| `/dage-til` + se `/dagar-till` | **0 — nye URL'er 2/10** (hubben) | — | — | — |
| `/dage-mellem-datoer` + se `/dagar-mellan-datum` | **0 — nye URL'er 3/10** | — | — | — |
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

### Prioriterede opgaver
**F0. [x] ✅ hreflang-skråstreg på `/dato` — modbevist, lukket.** 0 af 15 sider
   har skråstreg i `rel="alternate"`; `page-helpers.ts` bygger `${baseUrl}/${slug}`.
   Målinger og ræsonnement: `docs/plan-arkiv.md`. *MÅL:* `/dato` 131.320/863/
   0,7 %/5,6 (da), 102.316/97/0,1 %/8,1 (se).

**F0b/F0c/F0f. [x] ✅ Regnet eksempel i `metaTitle` + port.** `/alder`,
   `/tidszone` (F0b), titelsporten dømmer **resultatet** pr. sprog og ikke «der
   står et tal» (F0c, rettet efter review-fund), og alle sprogslagte stier dømmes
   mod både ruten og sitemap (F0f). Se `docs/plan-arkiv.md`.

**F0d. [~] Regnet eksempel i de tre titler, der kun har et årstal.**
   *Udført 3/10 16:3x for to af dem (`renteberegner`, `arveafgift`).* De tre herunder
   er **danske-only** og blev bevidst lagt tilbage: `/rentefradrag` (5,8 %) og
   `/boligstoette` (2,5 %) er de to højeste CTR i GSC-uddraget, så deres titel
   skal måles i 14 dage — og `/rentefradrag` er sitets bedst rangerende side
   («rentefradrag 2026», 63.000 søgninger, pos. 2), hvor «2026» ikke må forsvinde.
   Målt 3/10 15:3x: `rentefradrag`/«… 2026 - Se din skattebesparelse»,
   `boligstoette`/«Beregn boligstøtte 2026: …», `dagpenge`/«Dagpengeberegner
   2026 - …» — alle tre taget **ud af** titelsporten, så porten og tabellen siger
   det samme. **MÅL:** `/rentefradrag` 5.082/296/5,8 %/5,6,
   `/boligstoette` 7.370/181/2,5 %/8,6 → GSC 17/10.

**F0e. [~] Fire `no`-titler på de fire største sider har intet regnestykke.**
   `/procent|no`, `/dato|no`, `/tidsberegner|no`, `/tidszone|no` mod samme fire
   sider i `da`/`se`, der alle har et. `beregner.no` er lukket i `hiddenDomains`
   og ❓ nedenfor er ubesvaret, så det er 0 bruger-effekt nu.

**F0h. [x] ✅ Regnet svar i titlen på de 24 `/klokken-i`-landesider** —
   `ceo/klokken-titler` 3/10 19:2x. Se STATUS og `docs/plan-arkiv.md`. *Hvem:*
   alle der googler «hvad er klokken i <land>» — dansk autocomplete har 10 af 10
   land/by under «hvad er klokken i» (målt 3/10 19:0x), og GSC har «hvad er
   klokken i usa når den er 12 i danmark» 169v pos. 6 + «hvad er klokken i de
   forskellige tidszoner» 89v pos. 5 på `/tidszone` (23.351 visninger, 0,4 %
   CTR). *Accept (opfyldt):* hver titel har byens **regnede** klokkeslæt fra
   `tidsforskelMinutter`, er `absolute`, og har ingen port på sig — men to nye
   tests dømmer pr. sprog og pr. sæson. **MÅL:** de 24 URL'er har 0 GSC-ækker
   endnu (nye 2/10) → GSC 17/10 mod `/tidszone` 23.351/101/0,4 %/7,6.

**F1. [ ] Søgeniveau-data for `/procent`** — 150.470 visninger, 0,1 %, pos 7,4.
GSC's tre søgninger summerer 364 visninger af 150.470. **Accept:** GSC-eksport
for `/procent` (eller de 20 største søgninger site-wide) ligger i planen. **❓.**

**F2 + F2b. [x] ✅** rabat-spørgsmål + svensk rabatt-FAQ — `docs/plan-arkiv.md`.
**MÅL:** `/procent` 150.470 / 97 / 0,1 % / 7,4 (da), 26.933 / 2 / 0,0 % / 9,9 (se).

**F3. [ ] Beraknare.se: position, ikke titel.** 190.447 visninger på pos. 8-10.
Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes før de
svenske titelændringer fra C195/C196 er målt. **Accept:** se opgave 187.

**F4. [x] ✅** dobbelerede stribe væk — `docs/plan-arkiv.md`. **MÅL:** `/` 218
besøgende/28d, bounce 38 % → mod 2-7 %.

**F5. [~]** IndexNow er kodet (`src/lib/indexnow.ts`), og krogen efter deploy
findes: `src/instrumentation.ts` `register()` kalder `submitDeploymentIndexNow()`
ved serverstart. Nøglefilen lå på `/api/indexnow-key/…` og er rettet 2/10
(`ceo/indexnow-noeglefil`). **Mangler:** `INDEXNOW_ENABLED=true` og
`INDEXNOW_API_KEY` i Dokploys env (❓) — uden dem logger hver boot
`[indexnow] … skipped (disabled)`.

**F6. [x] ✅** norske tal uden dansk separator. **F7. [x] ✅** tidsforskellens
dage læst fra `afvigendeDage()`. **F8. [x] ✅** svenske helgdagslove kildeført.

**F5c. [~] Procentnotationen «8 %» — 319 noder målt 3/10 12:3x.**
*Hvad:* de største resterende er `blog/30-procent-reglen-husleje` 25 (⛔ de er
regelnavnet — de **skal** have en undtagelse, nogen må tage stilling til om
sitets eget navn «30% reglen» skal skrives «30 %-reglen»), `/moms` 18 (⛔ de 3
lovgrænser, ❓ nedenfor), `billaan` 17, `blog/koeb-af-bolig-…` 15,
`arveafgift` 14, `blog/guide-feriepenge-…` 13.
*Accept:* loftet i `regnestykker.test.ts` (`PROCENT_UDEN_MELLEMRUM_LOFT`) må
kun falde, og hver slice tager de tre største filer. *Målt:* 598 → 570 → 509 →
436 → 371 → 361 → 356 → **319** noder (scanneren tæller noder, så en linje med
to procenter tælles én gang). Fem navne-undtagelser: «30% reglen» i
`husleje/page.tsx`, `page-data.ts` og de to blogindlægs sidelinks, plus
«4%-reglen» i pensionsindlægget — de er **regelnavne**, ikke procenter.
**Interpolationer er lukket som fejltype.** `regnestykker.test.ts` kan kun se
`JsxText` og strengliteraler, så `{tal}%` er usynlig for den; derfor renderer
`procent-i-synlig-tekst.test.tsx` de berørte komponenter i da/se/no og dømmer
den **synlige** markup. Slice 10:5x (boliglån), 11:2x (fem beregnere) og
12:3x (**tretten** beregnere: `/1rm`, `/moms`, `/dagpenge`, `/budget`,
`/husleje`, `/billaan`, `/forbrugslaan`, `/aktieskat`, `/del-regning`,
`/lon-efter-skatt`, `/arveafgift`, `/brutto-netto`). To af dem skrev **punktum**
(`/lon-efter-skatt` 20.2 %, `/brutto-netto` 33.3 %), og de to
resultattilstande kan hverken scanneren eller markup-porten se, så de har fire
egne tests i `decimal-komma.test.tsx`. Detaljer og målinger: `docs/plan-arkiv.md`.
*Næste slice (målt på ny 3/10 23:0x):* de tre største filer er nu
`blog/30-procent-reglen-husleje` (25, ⛔ de er regelnavnet), `/moms` (16, ⛔ de 3
lovgrænser, ❓ nedenfor), `blog/koeb-af-bolig-2026-omkostninger` (15) og
`AlkoholenhederBeregner.tsx` (10). Mål med `grep -cE '[0-9]%' <fil>`.

**F5g. [~] Slice 3/10 18:4x: 45 noder i `/billaan` (da+se), `/arveafgift`,
`/brutto-netto`, `/kalorier` og `/flyttebudget`.** Alle boede i `page.tsx` (brødtekst og
tabeller), altså synlige for `regnestykker.test.ts`; kun `{EFFEKTIV_PCT}%` på
`/arveafgift` var en interpolation. Resterne efter denne slice, målt i den
synlige tekst: `/dagpenge` 1 (`90%`), `/konfirmation` 0 — sidstnævnte er
**allerede ren**, planens gamle «7» var fra en måling før `c398f43`.
*Målt:* loftet **319 → 274**. *Accept:* hver side har 0 `\d%` i den synlige
tekst i da/se/no, og de fem navne-undtagelser («30% reglen» ×2 pr. `/husleje`,
«4%-reglen») står uændret.
*MÅL:* `/billaan` 24 besøgende/28d, `/arveafgift` ikke i top-15 → samme som
F5c. **Port:** `regnestykker.test.ts` (loft pr. korpus) +
`arveafgift/page.test.tsx` på regnestykket.
**[x] ✅ 3/10 23:0x — den anden kodebane er også lukket:** de rå `\d%` i `<td>` og
brødtekst lå i `/bil`, `/topskat`, `blog/biloekonomi`, `blog/boligsalg` og
`BoligsalgBeregner` (30 noder, loftet 261 → **231**). `/billaan` og `/kalorier`
var **allerede rene** i `HEAD` — planens måling 3/10 21:5x så gammel kode fra
før fixen, ikke en fejl. Se `docs/plan-arkiv.md`.

- **[x] ✅ `/su` får et fribeløbs-værktøj** — se `docs/plan-arkiv.md`.
  *Hvem:* studerende på 1. års SU og deres forældre, hver august–december.
  *Datagrund:* dansk autocomplete **nr. 1** under «hvor meget» målt 3/10, og
  `/su` **falder** (201 → 127 besøgende/28d) selv om spørgsmålet er helt
  sæsonbetonet. `grep -rn "fælleshold" src/` gav **0 træffere**: indtægtsgrænsen
  var en tabel, ikke et svar. *Accept:* uddannelse + SU-måneder + status i de
  øvrige måneder + børn under 18 + handicaptillæg → **årsfribeløb**, pr. måned
  og før AM-bidrag, alle tal fra `SU_2026.freeAllowance`, med su.dk's egen
  præcisering om at året måles som helhed. **MÅL:** `/su` 127 besøgende/28d
  (3/10) → Plausible 17/10.
- **⛔ Lukket og modbevist 3/10 10:0x — «SU-fælleshold».** Der findes ingen
  fællesholdsgrænse: su.dk's fribeløbs- og indkomstsider har **0** fund af
  «fællesøkonomi»/«partner», og reglen er «Din egenindkomst må ikke være
  større end dit årsfribeløb». Uden den var opgaven ubyggelig, så den er
  erstattet af værktøjet ovenfor i stedet for at blive gættet.

**F5e. [x] ✅ Målte decimaler med punktum i dansk tekst (3/10 11:2x — fundet af
den nye port; lukket 12:3x med kommune-listen).** *Hvad:* den renderede `/brutto-netto`
skrev «Kommuneskat (**24.94** %)» med **punktum** i den danske markup, fordi
`LoenBeregner.tsx:426` interpolerer kommunesatsprocenten råt fra
input-feltet; `Kirkeskat (0,64 %)` bruger derimod komma.
*Hvorfor:* dansk decimalkomma er en del af Retskrivningsordbogen, og det er den
samme fejltype som F5b. *Accept:* den interpolerede kommunesatsprocent går
gennem `formatNumber(kommuneSkat, "da")`, så «Kommuneskat (24,94 %)» — og
`decimal-komma.test.tsx` har **en** assert på kommunesatslinjen, ikke kun på
aop-annuiteten. **Målt:** mutation med den gamle interpolation giver rød med
hele den synlige tekst som bevis («Kommuneskat (24.94 %)» lige under
«Kirkeskat (0,64 %)»). **⛔ Resten er den samme fejl ét sted længere ned på
siden:** kommune-listen skriver stadig «Gentofte (22.8 %)» med punktum — den
går gennem `KOMMUNER`-dataene og ikke gennem `LoenBeregner`. Tages først
når en port dømmer den.

**F9. [ ] `locale === "se" ? "se" : "da"` — 13 steder med dansk på
norske domæner.** *Hvad:* mønstret er målt med grep efter `ceo/norsk-pace-side`
(2/10): 18 træffere i 15 filer, hvoraf **13 er bruger-synlige** —
`dato/page.tsx` (3), `tidsberegner/page.tsx`, `alder/page.tsx`,
`opsparing/page.tsx`, `bil/page.tsx` og `DatoBeregner`, `MomsBeregner`,
`EnhederBeregner`, `PlanetVaegtBeregner` (+ `lokal-dato.ts`,
`bil-omkostninger.ts`). Det er præcis fejlen i review-fundet: norsk/brødtekst
over danske labels. *Hvorfor:* `/dato` (1.135 besøgende/28d) og
`/tidsberegner` (291) er sitets to største sider, så en halv oversættelse
af dem er dyrere end slet ingen. *Accept:* hvert sted får en rigtig `no`-gren
eller en `Record<Locale, …>`, og en port (samme som `DANSKE_ORD`-listen i
`PaceBeregner.test.tsx`) dømmer `da`/`no`/`se` hver for sig. ⛔ ❓ nedenfor:
`beregner.no` serverer et andet site, så rettelsen har 0 bruger-effekt indtil
den er besvaret — og norsk trafik er 0 i Plausible.

**F5d. [x] ✅ `procent-forside-feriepenge` — de 9 sidste synlige procenter.**
*Accept:* **0** `\d%` i markupken på forsiden og /feriepenge — nået, målt i
den renderede komponent i da/se/no. Se `docs/plan-arkiv.md`.

## Feature-kø

Fire kandidater, i rækkefølge efter hvor ren intentionen er. Alt med ⛔
er blokeret af en ❓ og må ikke gættes.

- **[x] ✅ «Så mange dage har du levet som 10-årig?» på `/alder`** —
  `ceo/dage-levet-pr-alder` 3/10. *Hvem:* alle der googler «hur många dagar har
  man levat om man är 12 år» — otte af de ti svenske autocomplete-træffere under
  «hur många dagar har man levat», målt 3/10 16:4x. *Accept:* to tabeller (1-18
  år, 20-80 år) med dage/uger/måneder i da og se, hver celle fra `levetVedAlder`
  → `beregnAlder`, og en tekst der siger at rækkerne er den, der *fylder*
  alderen på tabellens dag. **MÅL:** `/alder` 10.029 visninger / 43 klik / 0,4 %
  / pos. 7,2 (da) og 3.689 / 14 / 0,4 % / 7,6 (se) → Plausible 17/10.

- **[x] ✅ Ironman-total i `/pace`** — tre tidsfelter → samlet tid + tempo pr. ben,
  bygget på `beregnTriatlon`, da+se+no (`3720dea`). MÅL: `/pace` 2 af 10
  danske completioner under «tid beregner» (27k visninger, pos. 5) konverterer
  nu til et værktøj. Måles ved næste Plausible-snapshot.
- **[x] ✅ `/leasing` sammenligner på det rigtige tal** — `leasing-restvaerdi-`
  sammenlign` 2/10. Se `docs/plan-arkiv.md`. MÅL: `beraknare.se/leasing`
  2.923 visninger / 33 klik / 1,1 % / pos. 12,2 → mod 14 dage; de fire
  søgninger «fåretagsleasing bil kalkyl» (169v), «beräkna leasing bil företag»
  (160v), «leasing kalkylator» (112v) og «leasingkostnad bil» (109v) ligger på
  pos. 9-15, og svaret på «blir leasing billigere eller dyrere» lå før uden
  ét tal.
- **[x] ✅ `/dage-til`-hub** — se `docs/plan-arkiv.md`. *Hvem:* alle 23 danske og
  20 svenske countdown-sider var kun linket fra `/dato` og `/nedtaelling`, og
  sektionen havde ingen side af sin egen. *Accept:* `/dage-til` + `/dagar-till`
  lister hver dato med dagens tal, sorteret efter hvad der kommer først, med
  canonical/hreflang, daglig sitemap-entry og 301 mellem domænerne.
  **MÅL:** `/dage-til` 0 (ny URL 2/10) → Plausible 16/10; GSC 14 dage:
  «hvor mange dage er der til 1. december» (1.254v, pos. 5) og «… til den 24.
  december» (1.025v, pos. 5).
- **[x] ✅ `/klokken-i`-hub** — se `docs/plan-arkiv.md`. *Hvem:* de 12
  landesider var kun linket fra `/tidszone` og bloggen, så «hvad er klokken i
  de forskellige tidszoner» (89v, pos. 5) havde intet sted at lande.
  *Accept:* `/klokken-i` + `/klockan-i` lister hvert land med klokken lige nu
  og tidsforskellen, sorteret efter hvor tæt landet ligger på dansk/svensk tid,
  med canonical/hreflang, daglig sitemap-entry og 301 mellem domænerne.
  **MÅL:** `/klokken-i` 0 (ny URL 2/10) → Plausible 16/10; GSC: «hvad er
  klokken i usa når den er 12 i danmark» (178v) og «hvad er klokken i de
  forskellige tidszoner» (89v), begge på pos. 5-6.
- **[x] ✅ `/afstand-mellem-adresser`** — se `docs/plan-arkiv.md`. *Hvem:* alle
  danske pendlere, sommerhusrejsende og bilister. *Datagrund:* «beregn afstand
  mellem to adresser» er **nr. 3** i googles danske autocomplete under «beregn»,
  og ruten (`RuteAfstand` + `/api/rute`) lå kun som skjult optrulle i
  `BefordringsfradragBeregner`. *Accept:* egen dansk side med korteste bilrute,
  færge/betalingsbro, tur/retur og årlig kørsel på `aarstal(2026).arbejdsdage`,
  tre spørgsmål, forside-kort og interne links. **MÅL:** `/afstand-mellem-adresser`
  0 (ny URL 3/10) → Plausible 17/10; GSC 14 dage: «beregn afstand mellem to
  adresser» og «afstand mellem to adresser».
- **[x] ✅ `/dage-mellem-datoer` + `/dagar-mellan-datum`** — se
  `docs/plan-arkiv.md`. *Hvem:* alle der
  spørger «dage mellem datoer» / «dagar mellan datum». *Datagrund:* GSC
  2/10–30/30 lister «dage mellem datoer» (438v, **9.000 søgninger**, pos. 4) på
  `/dato`, og tre svenske varianter — «dagar mellan datum» (888v, 2k, pos. 8),
  «antal dagar mellan datum» (424v, 2k, pos. 8) og «räkna dagar mellan datum»
  (399v, 1k, pos. 9) — på `beraknare.se/dato`, der har **105.188 visninger og
  0,1 % CTR på pos. 8,1**. Værktøjet ligger i dag som ét `<h3>` dybt i `/dato`s
  brødtekst, altså på en side der konkurrerer om 20 andre spørgsmål.
  *Accept:* egen dansk og svensk side med eget slugsprog, egen `<h1>`/titel,
  de tre spørgsmål som `FAQPage`, tovejs-links med `/dato` og `/ugenummer`,
  canonical/hreflang, 301 mellem domænerne og daglig sitemap-entry.
  **MÅL:** 0 (ny URL) → Plausible 18/10; GSC 14 dage: de fire søgninger ovenfor.
- **[x] ✅ `/dage-i-aaret` + `/dagar-i-aret`** — se `docs/plan-arkiv.md`.
  *Hvem:* alle der spørger «hvor mange dage er der på et år» — dansk
  autocomplete **nr. 1** under «hvor mange dage er der», målt 3/10 — plus de to
  spørgsmål uden egen adresse, «… i augusti» (nr. 7) og «… i juli» (nr. 8).
  *Accept:* dansk og svensk side med de tolv måneders længde (dage, hverdage,
  weekenddage), summeringsrække, «dage tilbage af året» og de tre målte
  spørgsmål som `FAQPage`; **alle tal** læst fra `dato-eksempler.ts`s
  `aarstal()`/`maanederITaar()`; canonical/hreflang, 301 mellem domænerne,
  daglig sitemap-entry og tovejs-links med `/dato` og `/ugenummer`.
  **MÅL:** 0 (nye URL'er 3/10) → Plausible 17/10; GSC 14 dage mod
  `/dato` 136.071 visninger / 0,7 % / pos. 5,6 (da) og 105.188 / 0,1 % / 8,1 (se).
- **[x] ✅ `/timer-i-aret` + `/timmar-i-aret`** — se `docs/plan-arkiv.md`.
  *Hvem:* alle der spørger «hvor mange timer er der på et år / en uge / en
  måned». *Datagrund:* Googles egen autocomplete 3/10 har «hvor mange timer er
  der på et år» som **nr. 1** under «hvor mange timer er der» og «hur många
  timmar är det på ett år» som **nr. 1** under «hur många timmar är det»;
  `timer-periode.ts` (2/10) målte det samme og lagde tabellen ind på
  `/tidsberegner` som ét afsnit blandt 24. *Accept:* egen dansk og svensk side
  med periode-tabel (døgn, uge, to uger, tre kalendermåneder, år), tolv-måneders-
  tabel i timer, «timer tilbage af året», de tre målte spørgsmål som `FAQPage`,
  canonical/hreflang, 301 mellem domænerne, daglig sitemap-entry og
  tovejs-link fra `/tidsberegner`. **MÅL:** 0 (nye URL'er 3/10) → Plausible
  17/10; GSC 14 dage mod `/tidsberegner` 72.471 visninger / 0,3 % / pos. 6,8.
- **⛔ Målt og lagt på hylden 3/10 08:1x — `/minutter-i-aret`.** Googles egen
  autocomplete har tre søskende-familier til `/timer-i-aret`: «hvor mange
  minutter er der» (døgn/år/dag/uge/måned/n timer), «hvor mange sekunder er
  der» (dag/år/time/døgn/minut/måned/uge) og «hvor mange uger er der»
  (år/måned/i 2026/tilbage i år). En tredje enheds-side er `/timer-i-aret` med
  «60» i stedet for «1» — tynd, og tynde sider kan skade hele domænet. Bygges
  kun som **én** samlet sekund→minut→time-side der erstatter `/timer-i-aret`, og
  den skal måles mod den side først.
- **Feriesider: vinterferie og påskeferie** — *Hvem:* «skoleferie 2026» og
  «efterårsferien» (10. af 10 completioner under «hvor mange dage er der til»).
  *Accept:* to sider i `/dage-til` med samme mønster som efterårsferien.
  ⛔ Ferielovens startdato (❓ opgave 201) — må ikke gættes.
- **⛔ Målt og modbevist 3/10 08:1x — «bloggen mangler CTA».** Hypotesen bag
  85 % bounce på `/blog/barsel-2026-regler-og-satser` er modbevist: alle 30
  indlæg har et `NaesteSkridt`-kort med et konkret verb, og barsel-indlægget
  linker desuden til `/barselsdagpenge`, `/barselsplanlaegger` og
  `/boernepenge`. Bounce skal findes et andet sted (formular-længde? intet i
  topfolden? planlæggeren er ny?) — målt før der bygges.
- **Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske autocomplete-
  træffere under «kalorier» er madvarer. ⛔ `sst.dk` svarer 429 (❓ opgave 119).
- **Svensk dækning af de manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Oppgave 187, 13/10 — må ikke flyttes.

- **[x] ✅ `/renteberegner` og `/arveafgift` har et regnet eksempel i titlen** —
   se `docs/plan-arkiv.md`. *Hvem:* «renteberegner» (6.000 søgninger, pos. 8)
   og «arveafgift beregner». *Datagrund:* målt 3/10 — de var de **eneste to**
   af GSC-top-15 med en spørgsmålstitel; `/renteberegner` har 12.610 visninger og
   **0,8 %** CTR på pos. 7,4. *Accept:* begge titler har et regnet eksempel fra
   `hovedEksempel()` / `EKSEMPEL_BARN` — de samme funktioner beregneren bruger —
   og de ligger i `REGNETE_EKSEMPLER` i `meta-title-tal.test.ts`, der dømmer med
   `toContain` pr. sprog. **MÅL:** `/renteberegner` 12.610 visninger / 107 klik /
   0,8 % / pos. 7,4 → GSC 17/10.

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. ✅ betyder lukket; detaljerne står i `docs/plan-arkiv.md`.

**Åben række (strenglisten):** næste fil skal måles på ny. Loftene og de
lukkede filers målinger står i `docs/plan-arkiv.md`.
**Åbne F5b-slice: ingen — `/flyttebudget` er lukket 3/10 18:4x.**
`/moms` er ⛔ (de 3 lovgrænser, ❓ nedenfor).

## VERIFICÉR DEPLOY-noter

**Åben note 3/10 23:0x:** `VERIFICÉR DEPLOY: <mellemrum i 30 rå procenttal på /bil (da+se), /topskat, blog/biloekonomi, blog/boligsalg + BoligsalgBeregner + «totalt 297.000 kr»> ceo/procent-mellemrum-bilsider 3/10 23:0x`.
Døm på indhold: `curl -s https://minberegner.dk/bil | sed -e 's/="[^"]*"/=""/g' | grep -oE '[0-9]+([.,][0-9]+)?%' | wc -l` skal give **0** (var 12), samme måling på `/topskat` (var 4) og på `minberegner.dk/blog/boligsalg-2026-guide-til-omkostninger-og-provenu` + `…/biloekonomi-2026-hvad-koster-det-at-eje-bil` (hver 1-2). `beraknare.se/bil` skal have «20-25 %» i tabellen. Næste deploy-vindue 4/10 07:30.

**Åben note 3/10 22:2x:** `VERIFICÉR DEPLOY: <mellemrum i alle interpolerede procenttal (35 steder) + loftet INTERPOLATION_LOFT 40 → 0> ceo/procent-interpolation-til-nul 3/10 22:2x`.
Døm på indhold: `curl -s https://minberegner.dk/blog/arveafgift-regler-og-satser | grep -c 'Boafgift (15 %)'` skal give **≥1** og `grep -c 'Boafgift (15%)'` **0**; `/dagpenge` skal have «Dagpenge = 80 % af løn efter 8 % AM-bidrag»; `/kalorier` FAQ «10-15 %»; `/ejendomsvaerdiskat` «80 % × 5,1‰»; `/billaan` skal have «5,95 %» i rentetabellen *og* «kontantinsats på minst 20 %» på beraknare.se (sidste er raw, fra før). Næste deploy-vindue 3/11 07:30.

**Åben note 3/10 21:5x:** `VERIFICÉR DEPLOY: <29. februar-dagen i /alders tekst + fem danske ord i svensk FAQ + ny se-tekst-port> ceo/review-fund-alder-tabel-og-sprog 3/10 21:5x`.
Døm på indhold: `curl -s https://beraknare.se/promille | grep -c '— og efter ytterligare'` skal give **0** (og «— och efter ytterligare» = 1); `https://beraknare.se/procent` skal have «och inte heller», `beraknare.se/alder` «Timmarna är dagarna gånger 24 och aldrig» og «dagar-talet», `beraknare.se/dato` «Antalet dagar räknas». `/alder`-teksten er daglig præcis den 29. februar, så den kan ikke dømmes før 2028-02-29 — døm da på «28. februar» i stedet for «i dag». Næste deploy-vindue 3/11 07:30.

**Åben note 3/10 22:0x:** `VERIFICÉR DEPLOY: <mellemrum i procenttal i interpoleret tekst på /rentefradrag, /renteberegner, /pension, /moms + ny port der fanger }% i kilder> ceo/procent-mellemrum-rentefradrag-skattefradrag-topskat 3/10 22:0x`.
Døm på indhold: `curl -s https://minberegner.dk/rentefradrag | grep -c '33,6%'` skal give **0**, og tabellen skal vise `<td>33,6 %</td>`. Samme på `/renteberegner` (`<strong>22 %</strong>`), `/pension` (`<td>11,3 %</td>`) og `/moms`. Næste deploy-vindue 3/11 07:30.

**Åben note 3/10 17:4x (delvis live — se målingen 21:5x):** `VERIFICÉR DEPLOY: <mellemrum i procenttal på /billaan, /arveafgift, /brutto-netto, /kalorier, /flyttebudget> ceo/procent-mellemrum-billaan-arveafgift 3/10 17:4x`.
Døm på indhold: `curl -s https://minberegner.dk/billaan | sed -e 's/="[^"]*"/=""/g' | grep -oE '[0-9]+([.,][0-9]+)?%'` skal give **0** træffere, og «5,95 %» skal stå i rentetabellen. Samme måling på `beraknare.se/billaan` («kontantinsats på minst 20 %») og på `/arveafgift`, `/brutto-netto`, `/kalorier`, `/flyttebudget`. ⚠️ Målt 3/10 21:5x: **deltvist** — /arveafgift, /brutto-netto og /flyttebudget er 0, /billaan **6** (alle «6%» i alderstabellen), /kalorier **3** («10-15%»). De 9 er rå procenttal i `<td>`/brødtekst — en anden kodebane end `}%`, så committen dækkede dem ikke; de er **ikke** et deploy-problem. Tidligere måling 3/10 18:0x: **12 træffere** («0%» ×2, «10%» ×6, «15%» ×2, «5,49%», «5,95%», «6,0%», «6,25%», «6,5%», «6,50%», «6%» ×6), altså endnu det gamle indhold. ⚠️ **3/10 23:0x — de 9 var aldrig fejl i `HEAD`.** Egen måling: `/billaan` har 0 rå procenter (rentesatsen går gennem `sats()`, `${formatNumber(...)} %`) og `/kalorier` har 0 (`${usikkerMin}-${usikkerMaks} %` i `kalorier-eksempler.ts:220,259,279`). Træfferne i live var **gammel kode fra før fixen**. Noten er derfor ikke længere en deploy-måling: de to strenge dømmes igen 4/10 07:30, og resten af klassen er rettet i `ceo/procent-mellemrum-bilsider`.

**Dømt 3/10 21:5x på indhold (curl) — to noter lukket.**

- ✅ `ceo/svensk-promille-grænse` 19:5x — beraknare.se/promille giver «nås alltså
  efter **1** öl», `grep -c 'efter två öl'` = **0**. Dansk-ord-fejlen «og efter» er
  rettet i samme note (**6ca2260**) og dømmes efter 3/11 07:30.
- ✅ `ceo/klokken-titler` 19:2x — `<title>` på /klokken-i/japan = «Hvad er klokken
  i Japan? 12 i Danmark = 19:00 i Tokyo», /klokken-i/usa = «… 12 i Danmark =
  06:00 i New York», beraknare.se/klockan-i/japan = «Vad är klockan i Japan?
  12 i Sverige = 19:00 i Tokyo». Ingen har rodlayoutets `| MinBeregner.dk`.

**Dømt 3/10 18:0x–18:1x på indhold (curl) — tre noter lukket.**

- ✅ `ceo/titler-renteberegner-arveafgift` 16:3x — `<title>` på `/renteberegner`
  = «Renteberegner: 100.000 kr. i 5 år = 1.887 kr./md.» og på `/arveafgift` =
  «Arveafgift beregner: 1.000.000 kr. arv = 91.155 kr. boafgift».
- ✅ `ceo/dage-levet-pr-alder` 17:0x — `<h2>Så mange dage har du levet som
  10-årig?</h2>` findes, og rækkerne er `<td>10 år</td><td><strong>3.652</strong>`
  og `<td>50 år</td><td><strong>18.262</strong>` på måledagen. Den svenske
  tvilling har «Hur många dagar har du levat som 10-åring?».
- ✅ `ceo/su-indtaegtsgraense-maaned` 13:4x — **kun på de nye labels.** Notens
  streng «skriver den gamle “Du må højst tjene …”-sætning» kan ikke bruges:
  den sætning står i den nuværende kode (`SuIndtaegtsgraense.tsx:174`) og er
  ikke det, `0554456` ændrede. Dømt i stedet på «Før AM-bidrag pr. måned»,
  «Før AM-bidrag for hele året» og «Fribeløb i de øvrige måneder», som er de
  rækker `maanedBrutto`-rettelsen satte ind. Alle tre er live.

**Ingen ny deploy-note 3/10 15:5x:** F0c rører kun `*.test.ts` og planen, så
der er intet at verificere i produktion. Sidste åbne noter er dømt nedenfor.

**Dømt 3/10 15:1x–15:2x på indhold (curl).** Fuldtekst og målinger står i
`docs/plan-arkiv.md` (afsnit «3/10 15:2x»).

- ✅ `ceo/procent-punkt-sweeps` 08:00 — 0 `\d%` på /procent (da+se) og 0 i den
  synlige tekst på /boliglaan; de 22 træffere dér er `style="width:…%"`.
- ✅ `ceo/boliglaan-procent` 10:5x — samme måling. Notens «95,0 %»/«5,05 %» er
  interpolationer og kan ikke dømmes ordret (⛔ ❓ lukket hermed).
- ✅ `ceo/procent-forside-feriepenge` 09:4x — 0 `\d%` på forsiden (da+se) og
  /feriepenge; «Feriepenge (12,5 %)», «- AM-bidrag (8 %)», «100 % Gratis» ×2.
- ✅ `ceo/kommunesat-komma` 12:1x — ⛔ kan ikke dømmes på notens URL
  (`beraknare.se/lon-efter-skatt` svarer 200, men linjen ligger ikke dér med
  den form noten kræver). Målt i stedet på `/brutto-netto`: «Kommuneskat
  (ca. 25 %)» med komma. Noten er for snævt formuleret.
- ✅ `ceo/procent-punkt-sweep-side-data` 08:20 — kan ikke lukkes på sit eget
  indhold (svinget skede aldrig), men de strenge den krævede er nu rettet:
  `/billaan`, `/arveafgift`, `/brutto-netto`, `/kalorier` og `/flyttebudget`
  har 0 `\d%` i den synlige tekst, og `/konfirmation` har været ren siden
  `c398f43`.

**Åbne, med grunden:**

- `ceo/procent-sweep-pension-boliglaan` 10:1x · `ceo/procent-interpolationer`
  11:2x · `ceo/procent-interpolationer-2` 12:35 · `ceo/hoelligdag-cache` 11:5x
  · `ceo/kommune-decimal-komma` 12:3x — fra commits **før** 12:30, men de
  strenge de kræver mangler i `HEAD`: `/brutto-netto` skrev «AM-bidrag (8%):»
  og er rettet 18:4x; `guide-feriepenge-…/page.tsx:148` er rettet i `af0297a`.
  Ikke et deploy-problem — **F5c/F5g**.
- `ceo/dato-dage-til-rækker` 13:0x · `ceo/su-indtaegtsgraense-maaned` 13:4x ·
  `ceo/titler-med-regnet-eksempel` 14:4x — fra commits **efter** 12:30
  (ca1b4b3, 0554456, 228e1ff); næste vindue er 17:30. Målt 15:2x: `/dato` har
  endnu ikke «Hvor mange dage er der til …?»-overskriften, `/su` skriver den
  gamle «Du må højst tjene …»-sætning.
- ⛔ `ceo/timer-i-aret` 07:55 — **3/10 18:2x: noten var selv forkert, ikke
  siden.** Den kræver `/timer-i-aaret` **med to `a`**, og den URL har aldrig
  eksisteret: kode, sitemap og route-mappe siger alle `/timer-i-aret`, som
  svarer **200** med rigtig titel og canonical. `0c54b02` («Stop med at merge:
  den danske /timer-i-aret er 404») og noten selv lå begge en håndlavet
  `a` for meget i sig. Bevis: `gh api …/contents/src/app/timer-i-aret` giver
  `page.tsx`, `TIMER_I_ARET_PATH.da = "/timer-i-aret"`
  (`src/lib/timer-i-aret.ts:52`), og sitemap skriver
  `https://minberegner.dk/timer-i-aret`. **Lukket som fejl-målt** — og
  F0f-porten dømmer nu den slags fremover.
- `ceo/klokken-i`, `ceo/afstand-mellem-adresser`, `ceo/dage-mellem-datoer`,
  `ceo/dage-i-aaret` (2/10–3/10) — målt OK 3/10 15:1x: `/dage-til`,
  `/klokken-i`, `/dage-i-aaret`, `/dage-mellem-datoer` og deres svenske
  tvillinger svarer 200 med korrekt canonical + 3 hreflang uden skråstreg.

⛔ DEPLOY-MISSING for `/timer-i-aret` er **lukket 3/10 17:4x** — se målingen
ovenfor.

## ❓ Til Mads

- ❓ **Hvor deployes den norske udgave? (ny, 2/10 14:15, højst prioriteret.)**
  Målt i live: `beregner.no` serverer et **helt andet site** — norsk «100+ gratis
  norske kalkulatorer» med `/kalkulator/<slug>`-ruter og 115 URL'er i sin egen
  sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains` («not yet launched»). Al norsk tekst, også den norske
  dagpenge-linje fra `1174169`, er derfor usynlig for brugere. Skal `beregner.no`
  servere denne app, eller er den norske udgave ikke i drift?
- ❓ **Ferieåret er ikke længere 1. september – 31. december (ny, målt
  12:3x).** `page-data.ts:1822` siger «Med den nye ferielov (fra 2020) er
  optjeningsperioden 1. september til 31. august, og ferieåret løber fra
  1. september til 31. december året efter», `/feriepenge/page.tsx:59-62`
  siger det samme, og bloggen `guide-feriepenge-hvornaar-og-hvor-meget`
  har det i to tabeller og i brødteksten. **Det er reglerne fra FØR
  ferielovsændringen.** retsinformation.dk er en SPA (`/api/eli/…` og
  `/api/search` giver begge HTML), `lex.dk/ferieloven` og `da.dk` 404'er,
  så **intet** kan verificeres herfra. Ét skærmbillede af ferielovens § 7
  (ferieår og optjening) låser det, og rettelsen får sin egen test i
  `page-data`-porten, fordi den er brødtekst på tre sider og i FAQ- og
  JSON-LD-output. Koden er bevidst urørt — punkt 11.
- ❓ **Søgningseksport fra Search Console (30/9).** GSC's opsummering viser kun
  3-4 søgninger pr. side; for `/procent` (150.470 visninger, sitets største side)
  er de tre tilsammen **364 visninger**. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største søgninger
  for hele domænet, låser F1-F3.** GSC-data kan ikke hentes fra en agent.
- ❓ **Feriedatoer uden lovkilde (ny, 3/10 05:30 — lukker ferie-feature-køen
  midlertidigt).** Feature-køens «Feriesider: vinterferie og påskeferie» er
  **ikke bygbar uden en menneskekilde**, og det er målt, ikke antaget:
  da.wikipedia `Ferie` siger «Vinterferie (**typisk** i uge 7 eller 8)» og
  «Efterårsferie (typisk uge 42)» — altså ingen fast uge for vinterferien, kun
  en tommelse, og intet om påskeferiens startdato. `efteraarsferien` på sitet er
  skrevet til uge 42 som en fast regel, så samme kildegrund mangler også der.
  **Ét skærmbillede fra en kommunes ferieplan 2026/2027 (helst to kommuner)
  låser vinterferie, påskeferie og efterårsferie på én gang**, og er derfor
  mere værd end ❓ 201 alene. Uden det bygges ingen ferieside.
- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201).**
  `/dage-til/summerferien` siger «sommerferien begynder altid den **sidste lørdag
  i juni**», og hævder det står i folkeskoleloven (2024). retsinformation.dk er en
  SPA (også på `.xml`), ministeriet/ferieinfo/ferieloven svarer transportfejl,
  `lovguiden.dk` 429. **Ét skærmbillede af bestemmelsen låser det** — er reglen
  «den lørdag i den kalenderuge, hvori 20. juni ligger», står siden 7 dage
  forkert i de fleste år. Koden er bevidst urørt.
- ❓ **`ceo/boliglaan-procent`-noten er for snævert formuleret (3/10 12:47).** Den
  kræver «95,0 % belåning» og «5,05 % p.a.», men det er interpolationer fra
  brugerens felter og flytter sig med standardværdierne. Live står «Typisk
  0,5-1,5 %», «Over 80 % belåning» og «ca. 5,0-7,0 %», og siden har 0 `\d%`.
  Skal dømmes på 0 `\d%` og de statiske strenge, ikke på to tal der flytter sig.
- ❓ **Momslovgrænserne på `/moms`.** Dansk registrering «over 50.000 kr»,
  svensk «högst 120 000 kr per år» og «told ved import over 1.150 kr» (en
  EUR-grænse fra forordning 1186/2009, som ikke må stå som et fast dansk beløb).
  **Ét skærmbillede af ML § 48 og ét af den svenske grænse** låser de to første.
- ❓ **IndexNow mangler to env-værdier.** `INDEXNOW_ENABLED=true` og
  `INDEXNOW_API_KEY=<8-128 teg af A-Z, a-z, 0-9, - >` skal sættes i Dokploys
  miljøvariabler — nøglen må ikke i en commit. Uden dem returnerer modulet
  `skipped: disabled` ved hver boot.
- ❓ **Kilde til svenske og norske frilanstimepriser.** Ét skærmbillede af et
  markedstal for Danmark, Sverige og Norge låser `/timepris` pr. `Locale` og den
  manglende norske brødtekst.
- ❓ **Efterløn til deltidsforsikrede: 2/3 eller 0,67?** Målt 3/10 02:38 i
  `EfterloensBeregner.tsx`: deltid regnes som `MAX × 0,67`, altså 20.057 × 0,67
  = **13.438 kr.**, mens `DAGPENGE_2026.deltid` er 22.041 × 2/3 = **14.694 kr.**
  for præcis samme deltidsforsikring — så efterlønsdelen er **67 kr. for høj**.
  Beregnerens egen præmieportion bruger modsat `portion.part = 10.580`, som er
  2/3 af 15.870, altså 2/3-reglen. Koden er bevidst urørt, fordi det er en
  **beregningsændring** og ikke en tekstfejl (punkt 11): hvad dagpengeloven
  siger om deltidsforsikret efterløn, skal stå i en kilde, ikke gættes. Ét
  skærmbillede fra borger.dk eller dagpengeloven låser den, og rettelsen får
  sin egen test i `EfterloensBeregner.test.tsx`.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)» og «Afgifter kommer (2026+)»; `skat.dk` svarer 500. Teksten
  siger nu kun hvad beregneren regner med, og tallet ligger i
  `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **Fitnessfradrag, sommerhusudlejning, madvaretabel, grundskyld for Varde og
  Playwright.** Fem mindre kilder, alle noteret med detaljer i
  `docs/plan-arkiv.md` 2/10 14:20. Uden dem bygges intet, jf. punkt 11.

