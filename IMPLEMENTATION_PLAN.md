STATUS: 3/10 03:25. CI grøn ved start (`37084248300`). Sentry: ingen uløste
      fejl 14 dage, og SDK'en **er** sat op, så Sentry-punktet er lukket.
      **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` ·
      `npm run build` — **grøn 3/10 03:22** (alle exit 0, **3920** tests i 246
      filer). PR-TJEK: 2026-10-03 — ingen åbne PR'er.
      **Denne iteration: F5b `/aktieskat`** (`aktieskat-faq-tal-fra-modul`).
      Grænsen, de to satser, ASK-satsen og ASK-loftet lå håndskrevet i
      metadata, i schema, i 4 af 6 FAQ-svar og i 5 beløb i brødteksten, mens
      `AktieskatBeregner` læste `SATSER_2026` — søgeresultat og værktøj var to
      uafhængige tal. Ny `aktieskat-eksempler.ts` læser samme modul.
      **Deploy-diagnose: deploys er sunde, intet er faldet til.** Målt på
      *indhold*: alt merged til og med 2/10 21:01 er live (`/su`, `/pension` har
      0 × «kr. kr.»), alt fra 2/10 21:51 (`c4f376d`) er ikke. Sitemap
      bekræfter samme snit: `/dage-til` (21:30) står i den, `/klokken-i`-hubben
      (22:07) gør ikke, kun dens 12 landsider. Næste batch-vindue er
      **3/10 07:30**, så de åbne VERIFICÉR-noter måles dér — og **0**
      forgåede vinduer, altså ingen DEPLOY-MISSING. Den forrige notes «MÅLT
      3/10 23:13 … ét vindue forgået» var en fejltagelse: klokken var 03:11,
      og 23:13 kan ikke være sket endnu.
      BRANCH-TJEK: ikke kørt (sidste 2/10 — ikke en uge siden).
      **Næste iteration:** mål de 13 VERIFICÉR-noter i vinduet 3/10 07:30,
      derefter F5b: næste slug er `/loen-efter-skat` (4).

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv til næste måling)

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
| `/dage-til` + se `/dagar-till` | **0 — nye URL'er 2/10** (hubben) | — | — | — |
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

## Feature-kø

Fire kandidater, i rækkefølge efter hvor ren intentionen er. Alt med ⛔
er blokeret af en ❓ og må ikke gættes.

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
- **Feriesider: vinterferie og påskeferie** — *Hvem:* «skoleferie 2026» og
  «efterårsferien» (10. af 10 completioner under «hvor mange dage er der til»).
  *Accept:* to sider i `/dage-til` med samme mønster som efterårsferien.
  ⛔ Ferielovens startdato (❓ opgave 201) — må ikke gættes.
- **Kalorieguide pr. portion på `/kalorier`** — 9 af 10 danske autocomplete-
  træffere under «kalorier» er madvarer. ⛔ `sst.dk` svarer 429 (❓ opgave 119).
- **Svensk dækning af de manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Oppgave 187, 13/10 — må ikke flyttes.

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. ✅ betyder lukket; detaljerne står i `docs/plan-arkiv.md`.

**Lukket 2/10 23:29 — `kalorier-faq-tal-fra-modul`.** Se `docs/plan-arkiv.md`.
*Målt:* **17** fund væk fra `page-data.ts` (7 da, 3 no, 7 se), listen
**131 → 114**. `/kalorier` er sitets syvende mest besøgte side (276/28d) og
havde **samme synlige fejl som `/vaegttab`**: svenske strenge med «1.780» /
«2.759» / «2.259» / «7.700» i metadata **og** i to FAQ-svar, som
`FAQSchema` læser. Ny `kalorier-eksempler.ts` bygger 19 svar i tre sprog fra
`makroer.ts`' egne `beregnBmr`/`beregnTdee`/`kalorierForMaal` plus
`KALORIE_UNDERSKUD`, `PROTEIN_G_PER_KG` og `VAEGTTAB_KCAL_PR_KG` (genbrugt fra
`vaegttab-eksempler`, ikke kopieret). Proteinintervallerne læses fra
`PROTEIN_G_PER_KG`; «0,5 kg pr. uge» og «10-15 %» er deklareret i modulet med
begrundelse, for de er allerede rundede tal. Porten låste fejlen fast på to
steder og er rettet begge: `page-data.test.ts` krævede «1.780»/«2.259» med
dansk punktum for alle tre sprog, `kalorier/page.test.tsx` «2.502 kcal» og
«TDEE 2.759 kcal vid måttlig aktivitet» — de dømmer nu `formatBelob(…, locale)`
og forbyder `\d\.\d{3}` i hvert svensk og norsk felt. **12 nye tests**
(3856 mod 3844); dansk låst med `toEqual` mod de syv gamle strenge.

**Lukket 3/10 23:20 23:58 — `pension-belob-fra-modul`.** Se
`docs/plan-arkiv.md`. *Målt:* **12** håndskrevne talgrupper væk fra
`page-data.ts` (metadata + 11 FAQ-svar, alle publiceret som `FAQSchema`-JSON-LD),
så listen er **131 → 119**. Ny `pension-eksempler.ts` læser `FOLKEPENSION_2026`
og `SATSER_2026` gennem `formatBelob`. **Én reel fejl fundet og rettet:**
«Hvornår kan jeg gå på folkepension?» sagde «65 år hvis du er født i 1953 eller
før» og sprang så til 1956 — det modsiger `alderSkala` (65 fra 1/1 1954, 65 ½
og 66/66 ½ i 1954-55) og lod 1954-55 stå uden svar. Svaret bygges nu trin for
trin af skalaen. Dansk ellers byte-uændret (målt: kun de to linjer af
aldersvaret adskiller sig fra `HEAD`). Porten er ny og **adfærdsbaseret**:
den dømmer *hvert* beløb i metadata og svar mod de tal modulerne må skrive, så et
håndskrevet beløb er rødt; mutation (8.500 i et svar + den gamle 1953-påstand)
→ **2 røde** af 6. `gang`-reglen tabte ét fund 7 → 6 (Excel-svarets
«40.000 × 0,15 = 6.000» er nu interpolationer), portens sum 26 → 25.

**Lukket 3/10 00:45 — `kvadratmeter-faq-tal-fra-modul`.** Se
`docs/plan-arkiv.md`. *Målt:* **9** håndskrevne talgrupper væk fra
`page-data.ts` (6 svar + 6 metadatafelter i hvert sprog), så listen er
**95 → 86**. **To reelle fejl fundet:** (1) svensk og norsk skrev «10.000 cm²»,
«10.000 m²» og «3.000 kr» med dansk punktum, mens den svenske brødtekst i
`page.tsx` stod med «3 000 kr» — modsagde altså sig selv, og `FAQSchema`
publicerer svaret; (2) «Laminat 80-200 **SEK**/m²» / «**NOK**/m²» lovede svensk
og norsk marked om de **samme danske tal**, uden kilde. Ny
`kvadratmeter-eksempler.ts` bygger alle 18 strenge af `AREAL_EKSEAMPLER` (nu med
regnestykkets led) + `PRIS_EKSEMPEL` + fire nye konstanter (`CM2_PR_M2`,
`M2_PR_HAKTAR`, `SQ_FT_PR_M2`, `VAERELSE_EKSEMPLER`) gennem `formatBelob`;
`SPILD_PCT` og `MATERIALEPRISER` er deklareret her med `omraade: "danmark"`, så
de to andre svar siger det i sætningen. **Porten låste fejlen fast:**
`page-data.test.ts` krævede «3.000 kr» for alle tre sprog; den kræver nu «3 000
kr» for `se`/`no`, og `page.test.tsx` forbyder tre-cifre-punktum i hele den
svævede sværde. **11 nye tests** (3870 → 3881); tre mutationer målt røde (1, 1
og 3 røde). `HAARDKODEDE_BELOB` for `kvadratmeter/page.tsx` **1 → 0** og listens
sum **333 → 332**.

**Lukket 3/10 00:24 — `rentefradrag-faq-tal-fra-modul`.** Se
`docs/plan-arkiv.md`. *Målt:* **7** håndskrevne talgrupper væk fra `page-data.ts`
(`description` + `metaDescription` + 5 FAQ-svar), så listen er **102 → 95**.
**Én reel fejl fundet:** «Skal par fordele rentefradraget mellem sig?» lød «et par
med 80.000 kr. i renter får præcis samme besparelse» — men `hojFradragsgraense`
giver parret 100.000 kr., så hele beløbet får 33,6 %: **26.880 kr. mod 24.480**,
altså **2.400 kr. mere**, og de to tal stod i samme sætning. `page.tsx:189-191`
havde hele tiden sagt det rigtige, så brødtekst og FAQ modsagde hinanden, og
`FAQSchema` publicerer FAQ'en. Ny `rentefradrag-eksempler.ts` bygger de syv
strenge af `RENTEFRADRAG_2026` + `beregnRentefradrag` gennem `formatBelob`;
«uændret i en årrække» er erstattet af modulets egen kilde og `verifiedAt`, fordi
den påstand ikke kan efterprøves. Dansk ellers uændret på nær «33,6%» → «33,6 %»
(ét mellemrum før procent, som de øvrige svar allerede skrev). **6 nye tests**
(3864 → 3870); mutation mod `page-data.ts` fra før rettelsen giver **1 rød** af 6
(bindingsprøven), resten låser modulet.

**Lukket 3/10 01:50 + 01:40 — `konfirmation-faq-tal-fra-modul` (halve 1 og 2).**
Se `docs/plan-arkiv.md`. *Målt:* halve 1 fandt den danske fejl (FAQ'en lovede
«8.000-25.000 **DKK**» som *samlet* beløb mod beregnerens 38.700 kr.);
**halve 2 fandt den samme fejl to gange til, i de to andre sprog** — svensk
«10.000-30.000 **SEK** beroende på antal gäster», norsk «10.000-30.000 **NOK**
avhengig av antall gjester»: samme forveksling, dansk punktum i svensk og
norsk sætning, og en valutaenhed ingen anden sted på siderne bruger. Norsk
lovede desuden 3.000-8.000 kr. til forældre mod dansks 2.000-5.000, for én
beregner der bruger 3.000 på alle domæner. Ny `konfirmation-eksempler.ts`
bygger **alle otte** brødtekstbeløb og **alle seks** FAQ-beløb i tre sprog
gennem `formatBelob`; `HAARDKODEDE_BELOB` for `konfirmation/page.tsx` **6 → 0**
og listens målte sum **332 → 320**. Dansk byte-uændret.

**Lukket 3/10 03:22 — `aktieskat-faq-tal-fra-modul`.** Se
`docs/plan-arkiv.md`. *Målt:* **13** håndskrevne talgrupper væk — 4 metadata-
/schemafelter + 4 af 6 FAQ-svar i `page-data.ts` og 5 beløb i `page.tsx` — så
JSX-listens målte sum er **320 → 315** og `/aktieskat` står med **0**. **Ingen
fejltal fundet, og det skal siges rent:** 79.400 = `SATSER_2026.
aktieProgressionsgraense`, 27/42/17 % = `aktieSatsLav`/`Hoej`/`askSats`, 174.200
= `askLoft`, og 158.800 er nøjagtigt 2 × 79.400. Slicen er et **lås mod
2027-drift** — ændres en sats i `satser-2026.ts`, følger søgeresultat,
`FAQPage`-JSON-LD og brødtekst med nu. Den eneste tekstændring er
mellemrummet før procenttegnet («27%» → «27 %»), som er husets skrivemåde i
`efterloen-eksempler`/`pension-eksempler`; beløbene er byte-uændret, og «kr.»
kommer fra `getCurrencySuffix` som før. **Portens første udkast var cirkulær** —
den læste modulets eget output og kunne derfor aldrig fange en håndskreven
streng; den læser nu den publicerede `getPageData("aktieskat","da")`. Mutation
(håndskrevet «79.500 kr.» + «27%» i `page-data.ts`) giver **2 røde** af 7.
Dobbeltgrænsen for ægtepar fandtes kun i teksten — beregneren regner kun det
enkelte depot — så den er nu **afledt** (`× 2`) med en docblock, der siger at
reglen selv har ingen kilde i repoet og er bevaret uændret. **7 nye tests**
(3913 → 3920).

**Åben række (strenglisten):** næste fil skal måles på ny — de punkt der stod
åbne er alle ❓-blokerede. **Ni filer er lukket**, se listen nedenfor.
Strenglistens loft er **70 → 57**, JSX-listen **360 → 347 → 338 → 333 → 332 →
320**.

**Ny målt fejlklasse — `page-data.ts` ligger uden for begge beløbs-porte.**
`strengBelob`/`jsxBelob` måler kun `.tsx`, så de usourcede intervaller i
`/boligsalg`s `faqItems` blev **publiceret som JSON-LD** (`FAQSchema` læser
præcis `faqItems`). Det er den samme fejl som JSX-teksten, bare usynlig for
porten.

**Lukket 3/10 22:33 — `vaegttab-faq-fra-modul` (halve 2).** Se
`docs/plan-arkiv.md`. *Målt:* **21** håndskrevne talgrupper væk fra
`page-data.ts` (7 pr. sprog: 1.000, 7.700, 1.500, 1.200, 2.759, 1.780, 2.209),
så listen er **152 → 131**. Fundet ved deploy-målingen: `beraknare.se/vaegttab`
havde stadig 3 × «2.209» i synlig FAQ-tekst, i `FAQSchema`-JSON-LD **og** i
RSC-payloaden, fordi halve 1 kun flyttede metadata-felterne. Ny
`vaegttabFaqItems(locale)` bygger alle fem svar i alle tre sprog fra
`vaegttabEksempelTal()` + `VAEGTTAB_KCAL_PR_KG` + `KALORIE_UNDERSKUD` +
`AKTIVITETS_FAKTORER`; de to nye konstanter `VAEGTTAB_MIN_MAEND`/`_KVINDER` er
flyttet fra brødteksten, ikke opdigtet. **Porten låste fejlen fast:**
`page-data.test.ts` krævede «2.759»/«2.209» med dansk punktum for *alle tre*
sprog; den dømmer nu `formatBelob(…, locale)` og forbyder `\d\.\d{3}` i hvert
svar for `se`/`no`. Mutation: regexen rammer **4 af 4** gamle svenske svar, så
prøven er rød mod den gamle kode. Dansk byte-uændret (`toEqual` mod de fem
gamle strenge). `/vaegttab` se: 1.277 visninger.

**Åben: beløbs-porten scanner kun `*.tsx`.** *Accept:* `strengBelob` kører på
`src/lib/*.ts` også, og listen opdateres i samme commit.

**Lukket 3/10 03:00 — `rettelse-lofter-i-privatlivs`** (review-fund 29/9, punkt 0,
ikke en F5b-slice). Se `docs/plan-arkiv.md`. *Målt:* begge fund var **ægte** —
`/afstand-mellem-adresser` lovede om lagring to gange (brødtekst + `FAQSchema`),
mens `rute.ts` skriver ruten i hukommelsen i 7 dage under koordinatnøglen, og
`5m x 4m` stod i `/kvadratmeter`s korte FAQ-svar i tre sprog. Ny `rute-cache.ts`
er det ene sted for både TTL'en og sætningen om den, så koden, brødteksten,
FAQ'en og privatlivspolitikken ikke kan glide fra hinanden; nye
`lagrings-paastand-gate.test.ts` (4 tests) forbyder løftet i hele `src/`, og
`rute.test.ts` **måler** TTL'en i stedet for at læse den. **+8 tests**
(3905 → 3913). Mutationer målt: 3 røde af 4 (sætningen), 1 rød (TTL'en),
2 røde (målnotationen).

**Lukket 3/10 02:40 — `efterloen-faq-tal-fra-modul`.** Se
`docs/plan-arkiv.md`. *Målt:* **5** håndskrevne talgrupper væk fra
`page-data.ts` (`description` + `metaDescription` + 3 af 8 FAQ-svar), så listen
er **83 → 78** og `da/efterloen` er væk fra køen. **Ingen reel fejl fundet** —
det skal siges rent: 20.057 = `Math.round(22.041 × 0,91)`, 5.772 = 481 × 12,
15.870/10.580 = `SKATTEFRI_PRAEMIE_2026.portion`. Slicen er derfor et **lås mod
2027-drift**, ikke en rettelse. **Den reelle fejl var et tredje sted:** satsen
lå hårdkodet i `EfterloensBeregner.tsx` (`MAX_EFTERLOEN_91 = 20057`) *udenfor*
portens rækkeevidde, så beregneren og søgeresultatet var to uafhængige tal.
Ny `EFTERLOEN_SATS_PROCENT` + `EFTERLOEN_MAX_SATS` i `efterloen.ts` regner den
af `DAGPENGE_2026.fuldtid`, og både komponenten og `efterloen-eksempler.ts`
læser den. Aldersvaret («Hvornår kan jeg gå på efterløn?») havde ingen
beløb, så porten dømmer det ikke — men det nævner alle fødselsår og aldre, så
det er nu genereret række for række af `EFTERLOEN_ALDER_2026` **og** låst
byte-uændret med `toBe`. Dansk ellers uændret, dog «91%» → «91 %» i to af
fire sætninger, fordi `metaDescription` på samme side skrev «91 %» og de to
beskrivelser modsagde hinanden. **Porten er adfærdsbaseret:** den dømmer
*hvert* beløb i metadata og svar mod de tal modulerne må skrive. Mutation
(«20.057» → håndskrevet «19.500» i satssvaret) → **2 røde** af 6. **7 nye
tests** (3898 → 3905). ⛔ Se nyt ❓ om deltidsfaktoren 0,67 nedenfor.

**Otte filer er lukket:** SU (`su-indlaeg-belob-fra-modul`), arveafgift
(`arveafgift-belob-fra-modul`), `/boligsalg` (`boligsalg-belob-fra-modul`),
`/procent` (`procent-faq-tal-fra-modul`), `/renteberegner`
(`renteberegner-belob-fra-modul`), `/procent`s procentpoint-svar
(`procentpoint-faq-tal-fra-modul`), `/kvadratmeter`
(`kvadratmeter-faq-tal-fra-modul`) og `/konfirmation`
(`konfirmation-faq-tal-fra-modul`) — alle i `docs/plan-arkiv.md`.
**`/efterloen` (`efterloen-faq-tal-fra-modul`) er den niende, og
`/aktieskat` (`aktieskat-faq-tal-fra-modul`) den tiende.**

**Målt 2/10 18:35 (egen AST-probe, samme mønster som portens `strengBelob`):
alle fund lå i `page-data.ts` alene** — ikke fordelt i `src/lib/*.ts` som
portens docblock siger. Efter `/renteberegner` var de **176** (var 195 ved
iterationens start); efter `/vaegttab` halve 2 er de **131** målt 3/10 22:33.
Køen pr. slug (**78** målt 3/10 02:38 med egen AST-probe efter `/efterloen`):
`moms` 15 (⛔) · `konfirmation` 6 → **0** · `efterloen` 5 → **0** ·
`aktieskat` 5 → **0** · `loen-efter-skat` 4 · `topskat` 4 · `boernepenge` 4 ·
`flyttebudget` 3 · resten ≤2. De øvrige tal er fra målingen 3/10 00:45 og kan
være faldet siden — mål den slug, du tager, på ny. **Anbefalet rækkefølge:**
`/loen-efter-skat` (4) → `/topskat` (4) → `/boernepenge` (4). `/moms` er ⛔ (de
3 lovgrænser).
*Accept pr. slice:* ét slug pr. opgave, 12 fund eller færre, de læses fra sit
eget modul, og en mutation i porten. `/vaegttab` blev delt i to halvdele
(12 + 12), fordi den er 24 fund. **Hvis porten udvides til `.ts` med det samme,
bliver listen 152 lang og de 152 tal bliver en tilladelsesliste** — det er
måske nok det, men en tilladelsesliste over fejl er dyrere end porten er bred.
Derfor: fix slugs først, portudvidelsen som sidste skridt når de er nede mod 0.

**Åben:** `/moms` har 3 fund tilbage, som er lovgrænser (dansk registrering over
50.000 kr, svensk over 120.000 kr, told ved import over 1.150 kr). ❓ nedenfor.

**Delvis lukket 2/10 20:53 — `pension-dobbelt-valuta`.** Se
`docs/plan-arkiv.md`. *Målt:* «8.729 kr. kr.» er væk fra den rene HTML på
`minberegner.dk/pension`. **De fire øvrige påstande i den gamle note var
forkerte:** `GaeldsfriBeregner`, `BruttoNettoBeregner`, `TopskatBeregner` og
`AktieskatBeregner` bruger `toLocaleString` (ingen valutaenhed) og har aldrig
skrevet dobbelt enhed. `formatNumber` + `getCurrencySuffix` er rigtigere for
de to, men det er en anden opgave.

**Lukket 2/10 20:57 — `leasing-dobbelt-valuta`.** *Målt:* alle **20**
`formatKr(…)} kr.` i `LeasingBeregner` er væk, så hele resultatblokken for
leasing, billån og kontant koster «4.121 kr.», «178.350 kr.», «28.350 kr.» —
og på beraknare.se «4 121 kr» (én enhed, Intls «kr» for sv-SE). Ny
`LeasingBeregner.test.tsx` (3 tests) dømmer den **rendrede** side i begge
sprog og låser månedsydelsen til `beregnLeasingSammenlign`-værdien med én enhed.
Mutation: « kr.» tilbage i alle 20 kald giver **2 røde** af 3.
`/leasing` se: 2.923 visninger / 33 klik / 1,1 % / pos. 12,2.

**Lukket 2/10 21:01 — `su-dobbelt-valuta` (sidste i klassen).** Alle **7**
`formatKr(…)} kr.` i `SUBeregner` er væk, så «Inkl. 3.799 kr. forældrelån» og
de fire grænsetal i brødteksten har én enhed. Den nye test dømmer den
**rendrede** side (ingen «kr. kr.») **og** læser kilden, så de sætninger der
kun vises i legacy- og ungdomsordningen heller ikke kan få den dobbelte enhed
tilbage. Mutation: « kr.» tilbage i alle 7 kald → **1 rød** af 15.
**Hele dobbelt-enheds-fejlen er nu lukket** i de tre komponenter der havde den
(3 målt, ikke 7 som den gamle note sagde).

⚠️ **Flake målt 2/10 21:00:** én fuld kørsel gav «1 failed | 3806 passed» uden
at loggen fangede filnavnet; de to næste fulde kørsler er grønne (3807/3807).
Hvis den dukker op igen, er det ikke denne opgave — ingen af de tre berørte
filer blev ændret i den kørsel.

**Åben: norske tusindtalsseparatorer.** `/renteberegner` skriver nu «1 887»
med mellemrum, mens resten af `noPages` skriver «2.500» med punktum («BMR
1.780 kcal» på `/kalorier»). Mellemrum er den rigtige bokmålsskrivemåde, så
fejlen er den anden slags. *Accept:* hele `noPages`-blokken går gennem
`formatBelob(…, "no", …)`, så der kun er én skrivemåde. ⛔ Lav prioritet:
`beregner.no` serverer et andet site (❓ nedenfor), så brugerpåvirkningen er
0 indtil den er besvaret.

**Åben:** `/timepris` mangler **norsk brødtekst** (kun `da` og `se` har et
afsnit) — ❓ kilde til norske timepriser låser både brødteksten og tabellen.

**Åben:** blogindlæg generelt (19 filer, 273 fund). Redaktionelle beløb i et
indlæg er ikke samme fejlklasse som et beløb på en beregnerside. Beslut først,
om de skal med; ellers skal de stå i portens undtagelsesliste som *blog*.

## Åbne VERIFICÉR DEPLOY-noter

Batch-deployeren kører 07:30/12:30/17:30/21:30. Prøverne er på **indhold**,
aldrig på HTTP 200: en 200 beviser at svaret serveres, ikke at det er den nye
kode. Hver note er én linje; den fulde kommando står i `docs/plan-arkiv.md` under
sit slug. Strip `<!-- -->`-kommentarmarkørerne fra HTML'en, ellers matcher
ingen regex på tal og tekst.

`VERIFICÉR DEPLOY: ruten gemmes i 7 dage, ikke slet ikke (`minberegner.dk/afstand-mellem-adresser`: hele HTML'en skal have **0** `hverken dine adresser eller din rute` og **0** `hverken adresse eller rute`, og **1** `Ruten og de to koordinater gemmes i serverens hukommelse i 7 dage, så samme opslag ikke skal beregnes to gange.` i både den synlige brødtekst og `FAQPage`-JSON-LD; `minberegner.dk/privatlivspolitik`: samme sætning skal stå, overskriften skal være «Ingen adresser gemmes:», **0** `kortvarigt i serverens hukommelse` og **0** `hverken adresser, koordinater`. `/kvadratmeter`: FAQ-svaret på «Gang længde med bredde» skal være «Gang længde med bredde. **5 m × 4 m** = 20 m².» i alle tre sprog, altså **0** `5m x 4m` på alle tre domæner. **Intet** `NaN`) ceo/rettelse-lofter-i-privatlivs 3/10 03:00`

`VERIFICÉR DEPLOY: /afstand-mellem-adresser (dansk side med afstandsværktøj: `<title>` «Afstandsberegner: beregn kørselsafstand mellem to adresser», `<h1>` én gang, 3 FAQ-spørgsmål i `FAQPage`-JSON-LD med «Hvordan beregnes afstanden?», og «Adressevælger fra Klimadatastyrelsen» i brødteksten; `minberegner.dk/befordringsfradrag` skal linke til siden via «Relaterede beregnere»; `minberegner.dk/afstand-mellem-adresser` skal ligge i sitemap.xml. `beraknare.se/afstand-mellem-adresser` skal 404/e-redirecte, fordi siden er daOnly) ceo/afstand-mellem-adresser 3/10 02:55`

`VERIFICÉR DEPLOY: /efterloen FAQ og metadata (procenten skal være «91 %» med mellemrum i BÅDE `description` og `metaDescription` og i FAQ-svaret «Hvad er efterlønssatsen i 2026?» — altså **0** × «91%»; satsen skal stå «20.057» i alle tre steder; «Hvad er efterlønspræmien?» skal have «15.870 kr.» og «10.580 kr.»; «Hvornår kan jeg gå på efterløn?» skal være byte-uændret med «63½-64 år for født i 1959» og «66 år for født 1967-1970»; **intet** `NaN`) ceo/efterloen-faq-tal-fra-modul 3/10 02:40`

`VERIFICÉR DEPLOY: /konfirmation FAQ i alle tre sprog (beraknare.se skal have «mellan 10 000 och 25 000 kr», 0 × «10.000», 0 × «SEK», og fotografintervallet «1 000-3 000 kr») ceo/konfirmation-se-no-tal-fra-modul 3/10 01:40`

`VERIFICÉR DEPLOY: /konfirmation FAQ (svaret på «Hvad koster en konfirmation?» skal være gaveintervallet 10.000-25.000 kr. + henvisning til beregneren, ikke «8.000-25.000 DKK») ceo/konfirmation-faq-tal-fra-modul 3/10 01:50`

`VERIFICÉR DEPLOY: /kvadratmeter FAQ (svensk og norsk «10 000 cm²» og «3 000 kr», materialerne «Nivåerna är danska») ceo/kvadratmeter-faq-tal-fra-modul 3/10 00:45`

`VERIFICÉR DEPLOY: /rentefradrag FAQ (parret får 26.880 kr., ikke «præcis samme besparelse») ceo/rentefradrag-faq-tal-fra-modul 3/10 00:30`

`VERIFICÉR DEPLOY: svensk «Första maj» + «använda» på /dato og /nedtaelling ceo/svenska-tekstfejl 3/10 23:20`

`VERIFICÉR DEPLOY: /leasing FAQ'ens retning (svensk skal sige 9 210 kr mindre) ceo/leasing-faq-retning 2/10 21:51 — MÅLT 3/10 23:13: IKKE live, ét vindue forgået, måles igen 3/10 07:30`

`VERIFICÉR DEPLOY: /klokken-i + /klockan-i (hub med klokken i 12 lande) ceo/klokken-i-hub 2/10 22:07`

`VERIFICÉR DEPLOY: /vaegttab FAQ tal fra modulet (svensk 2 209, ikke 2.209) ceo/vaegttab-faq-fra-modul 2/10 22:33`

`VERIFICÉR DEPLOY: /kalorier eksempel fra modulet (svensk 1 780, ikke 1.780) ceo/kalorier-faq-tal-fra-modul 2/10 22:56`

Lukket 3/10 23:13 på indhold: `pension-dobbelt-valuta`, `leasing-dobbelt-valuta`,
`su-dobbelt-valuta` og `dage-til-hub` — målingerne står i
`docs/plan-arkiv.md`. Bemærk at planens «23 danske / 20 svenske» datoer var et
skøn: `getDageTilSlugs()` giver **22 / 19**, og live har 22 / 19.

De **fulde** prøvekommandoer til de åbne noter ovenfor ligger i
`docs/plan-arkiv.md` under overskriften «VERIFICÉR DEPLOY-prøver», slug for slug
— de blev 3/10 03:00 flyttet ud herfra, fordi de alene skubbede planen over
40 KB.

`VERIFICÉR DEPLOY: /aktieskat henter grænse og satser fra sit eget modul (metadata, schema og FAQ skal have «79.400 kr.», «158.800 kr.» og «174.200 kr.», og procenttallene skal stå med mellemrum foran: **0** × «27%», «42%», «17%», mens «27 %» står i både `<title>`-beskrivelsen og FAQ-svaret «Hvad er progressionsgrænsen for aktieskat i 2026?» i `FAQPage`-JSON-LD; brødteksten skal skrive «27 % af de første 79.400 kr.» og «158.800 kr.» for ægtepar; **intet** `NaN`, ingen «kr. kr.» og ingen dobbelt-enhed) ceo/aktieskat-faq-tal-fra-modul 3/10 03:22`

## ❓ Til Mads

- ❓ **Hvor deployes den norske udgave? (ny, 2/10 14:15, højst prioriteret.)**
  Målt i live: `beregner.no` serverer et **helt andet site** — norsk «100+ gratis
  norske kalkulatorer» med `/kalkulator/<slug>`-ruter og 115 URL'er i sin egen
  sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains` («not yet launched»). Al norsk tekst, også den norske
  dagpenge-linje fra `1174169`, er derfor usynlig for brugere. Skal `beregner.no`
  servere denne app, eller er den norske udgave ikke i drift?
- ❓ **Søgningseksport fra Search Console (30/9).** GSC's opsummering viser kun
  3-4 søgninger pr. side; for `/procent` (150.470 visninger, sitets største side)
  er de tre tilsammen **364 visninger**. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største søgninger
  for hele domænet, låser F1-F3.** GSC-data kan ikke hentes fra en agent.
- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201).**
  `/dage-til/summerferien` siger «sommerferien begynder altid den **sidste lørdag
  i juni**», og hævder det står i folkeskoleloven (2024). retsinformation.dk er en
  SPA (også på `.xml`), ministeriet/ferieinfo/ferieloven svarer transportfejl,
  `lovguiden.dk` 429. **Ét skærmbillede af bestemmelsen låser det** — er reglen
  «den lørdag i den kalenderuge, hvori 20. juni ligger», står siden 7 dage
  forkert i de fleste år. Koden er bevidst urørt.
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
## Arkiv-notat 3/10 02:40

Sidste måling før commit: se `docs/plan-arkiv.md` (append, kun grep).
