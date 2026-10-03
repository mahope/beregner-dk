STATUS: 3/10 05:45. CI grøn ved start (`37091789272`). Sentry: ingen uløste fejl
      14 dage, og SDK'en **er** sat op, så Sentry-punktet er lukket. **Gate:**
      `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` · `npm run
      build` — **grøn 3/10 05:05** (alle exit 0, **3966** tests i 250 filer).
      PR-TJEK: 2026-10-03 — ingen åbne PR'er. CEO-kø punkt 0 er færdigt
      (`aca17e5`), og review-fundet fra 02:52 har ingen åbne fund (begge fund er
      `RETTET 4ec1f2f`). Alle åbne VERIFICÉR-noter er fra 3/10 00:30-05:05 og
      ligger **før** næste batch-vindue (07:30), så intet at hente endnu.
      **Denne iteration: research, ingen kode** (den 45-min-grænse nåede, før en
      feature kunne landes grønt). Målt: **Googles danske autocomplete** under
      «hvor mange dage er der» og «dage til» + svensk under «hur många dagar är
      det» / «dagar till». Se `docs/plan-arkiv.md`.
      **Næste iteration: FEATURE `dage-i-aaret`** — målt datagrund, klar.
      BRANCH-TJEK: ikke kørt (sidste 2/10 — ikke en uge siden).

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

**Åben række (strenglisten):** næste fil skal måles på ny. **Tretten filer er
lukket** (se listen nedenfor og `docs/plan-arkiv.md`). Strenglistens loft er
**70 → 57**, JSX-listen **360 → 347 → 338 → 333 → 332 → 320 → 315 → 313**
(`/boernepenge` 3/10 05:05).

**Lukket 3/10 04:37 — `topskat-faq-tal-fra-modul` (den tolvte fil).** Se
`docs/plan-arkiv.md`. *Målt:* **4** håndskrevne strenge væk fra `page-data.ts`
(`description` + `metaDescription` + 2 af 5 FAQ-svar), så `topskat` er **4 → 0**
målt med egen AST-probe. Ny `topskat-eksempler.ts` læser `SATSER_2026`.
**Reel fejl:** «58.000 kr./md» mod sidens egen formel (58.100). **13 nye tests**
(3939 → 3952), **syv mutationer målt røde** (se arkivet for hver).

**Lukket 3/10 04:52 — `loen-efter-skat-faq-tal-fra-modul`.** Se
`docs/plan-arkiv.md`. *Målt:* **4** håndskrevne talgrupper væk fra
`page-data.ts` (`description` + `metaDescription` + `ogDescription` + 4 af 8
FAQ-svar), så `loen-efter-skat` er **4 → 0** målt med portens egen
`strengBelob`. Ny `loen-efter-skat-eksempler.ts` læser `SATSER_2026` og
`KOMMUNER`. **Den reelle fejl lå i den nye hjælper, målt før commit:**
`formatBelob` har nul decimaler som standard, så mellemskattens `0.075 × 100`
skrev «8 %» — samme tal som AM-bidraget — og `getCurrencySuffix("da")` er «kr.»
*med* punktum, så `${kr(belob)}.` gav «54.100 kr..». Derfor har modulet nu
`loenBelob` (til sidens) og `loenBelobI` (til løbende tekst) og to decimaler i
`pct`. Kommuneskattens «22,5 % (Rundersdal)»/«27,8 % (Langeland)» er **afledt**
af `KOMMUNER` i stedet for håndskrevet — målt til de samme tal. En eksisterende
test låste den gamle notation fast (`page-data.test.ts` krævede «7,5%») og er
rettet til «7,5 %» med et `not.toContain("7,5%")`. **7 nye tests**
(3920 → 3927). Mutationer målt: 2 røde af 7 (nul decimaler), 1 rød af 7
(håndskrevet beløb + «8%» i `description`).

**Lukket 3/10 05:05 — `boernepenge-faq-tal-fra-modul` (den trettende fil).** Se
`docs/plan-arkiv.md`. *Målt:* **4** håndskrevne talgrupper væk fra
`page-data.ts` (`description` + `metaDescription` + 2 af 8 FAQ-svar), så
`boernepenge` er **4 → 0** målt med portens egen `strengBelob`. Ny
`boernepenge-eksempler.ts` læser `BOERNE_SATSER_2026` +
`BOERNEUNGEYDELSE_2026` og regner begge aftrappingseksempler med
`beregnAftrapning`. **Ingen reel satsfejl:** 5.370 × 4 = 21.480, 4.248 × 4 =
16.992, 3.342 × 4 = 13.368, 1.114 × 12 = 13.368 og 2 % af 38.900 = 778 — alle
rigtige. **Den reelle fejl lå i brødteksten, målet ved at gennemgå min egen
diff:** «Tjener du 1.100.000 **kr.,**» — punktum foran kommaet, den dobbelte
sætningstegning som `pension-dobbelt-valuta` 2/10 fjernede i `formatKr(…)} kr.`
-kaldene, og «**2%**» mod «2 %» i FAQ-svaret på samme side. Begge steder lå i
JSX-tekst, som hverken `regnestykker`-porten eller `page-data`-målingen så.
JSX-listen **315 → 313** (`boernepenge/page.tsx` 2 → **0**), og `procentAf`
dækning 13 → 12 + summen 25 → 24, fordi eksemplet nu er interpolationer.
**14 nye tests** (3952 → 3966), **seks mutationer målt røde** (arkivet har hver).

**Målt fejl — min egen port havde et blindt spot, som jeg lukkede samme
commit.** `kr.,`-løkken dømte kun metadata og FAQ-svar, fordi beløbet i
brødteksten står i en interpolation, så «kr.,» findes aldrig i kilden. Prøven
binder derfor beløbet foran kommaet til `boerneBelobI` i stedet for at søge
på en streng, der ikke kan rammes.

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
**`/efterloen` (`efterloen-faq-tal-fra-modul`) er den niende,
`/aktieskat` (`aktieskat-faq-tal-fra-modul`) den tiende, `/loen-efter-skat`
(`loen-efter-skat-faq-tal-fra-modul`) den **ellevte**, `/topskat`
(`topskat-faq-tal-fra-modul`) den **tolvte** og `/boernepenge`
(`boernepenge-faq-tal-fra-modul`) den **trettende** — den sidste målte i
rækken, så næste iteration bør være en feature.**

**Målt 2/10 18:35 (egen AST-probe, samme mønster som portens `strengBelob`):
alle fund lå i `page-data.ts` alene** — ikke fordelt i `src/lib/*.ts` som
portens docblock siger. Efter `/renteberegner` var de **176** (var 195 ved
iterationens start); efter `/vaegttab` halve 2 er de **131** målt 3/10 22:33.
Køen pr. slug (**74** målt 3/10 05:05 med egen AST-probe efter `/boernepenge`):
`moms` 15 (⛔) · `flyttebudget` 3 · resten ≤2. De øvrige tal er fra målingen 3/10 00:45 og kan
være faldet siden — mål den slug, du tager, på ny. **Anbefalet rækkefølge:**
`/flyttebudget` (3) → derefter måles listen på ny. De otte lukkede før denne var
`/moms` slet ikke rørt (⛔ de 3 lovgrænser), så **næste F5b-slice er
`/flyttebudget`**, medmindre en feature prioriteres højere.
`/moms` er ⛔ (de 3 lovgrænser).
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

## Målt 3/10 05:30 — research (ingen kode)

Tre fund fra **Googles egen autocomplete** (`suggestqueries.google.com`,
`hl=da&gl=dk` / `hl=sv&gl=se`), altså søgninger folk faktisk begynder at
skrive. Rækkefølgen herunder er **målt voksende**, ikke gættet.

1. **`/dage-i-aaret` + `/dagar-i-aret`** — **NÆSTE ITERATION.** Dansk #1 under
   «hvor mange dage er der» er «**hvor mange dage er der på et år**», og der er
   to sider mere i samme klub uden egen URL: «**hvor mange dage er der i
   augusti**» (#7) og «… i juli» (nr. 8); svensk har «**hur många dagar är det
   på ett år**» (#3), «… i augusti» og «… i juli». *Accept:* egen side pr. sprog
   med de tolv måneders længde (dage/hverdage/weekenddage) og «dage tilbage af
   2026», tallene læst fra `dato-eksempler.ts`s `aarstal()`/`maanedEksempel()`
   (de findes allerede — `/dato` bruger dem i brødteksten), canonical/hreflang,
   301 mellem domænerne, daglig sitemap-entry, `FAQPage` med de tre målte
   spørgsmål og tovejs-links med `/dato`, `/ugenummer` og `/dage-til`.
   **MÅL:** 0 (ny URL) → Plausible 17/10; GSC 14 dage: de fem målte søgninger.
   Datagrund: autocomplete 3/10 + `/dato` 1.119 besøgende/28d og 136.071
   GSC-visninger. ⛔ ikke: feriedatoer (❓ nedenfor).
2. **Dansk procentnotation i JSX-tekst — 7 steder.** Målt med grep efter
   `\d+%`: `feriepenge/page.tsx` «8%» ×2, «12,5%», «1%»; `laaneberegner/page.tsx`
   «1-5%», «100%+»; `husleje/page.tsx` «33%». Dansk skriver «8 %» med mellemrum,
   og `/pension` 2/10 + `/boernepenge` 3/10 netop fik den samme rettelse — så
   siderne modsiger nu hinanden. *Accept:* de 7 steder bliver «8 %» / «12,5 %» /
   «1 %» / «1-5 %» / «100 %+» / «33 %», og `regnestykker.test.ts`s
   `procentAf`-port dømmer dem (den ser dem ikke nu — portens blinde spot er
   præcis den her: JSX-tekst). Svensknotationen **uden** mellemrum er korrekt og
   skal ikke røres (`/bolan`, `/laaneberegner`s svenske linjer).
3. **F5b-køen er tom i praksis.** De 3 fund på `/flyttebudget` er
   **markedsanslag uden kilde** (15.000-50.000 kr, 25.000-50.000 kr,
   5.000-15.000 kr for flyttemand) — at flytte dem til et modul ville gøre en
   opfundet sats *ligne* kildeført, så punkt 11 forbyder det. `/moms` er ⛔
   (lovgrænser). *Accept:* F5b lukkes og næste opgave er altid en feature.

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

`VERIFICÉR DEPLOY: /leasing FAQ'ens retning (svensk skal sige 9 210 kr mindre) ceo/leasing-faq-retning 2/10 21:51 — måles 3/10 07:30 (den gamle note «MÅLT 3/10 23:13» var en fejltagelse: klokken var 03:11)`

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

`VERIFICÉR DEPLOY: /loen-efter-skat henter satser og grænser fra sit eget modul (metadata og FAQ skal have «54.100 kr.», «641.200 kr,» og «777.900 kr,» med **kr** *uden* punktum midt i sætningen; procenttallene skal stå med mellemrum foran: **0** × «8%», «7,5%», «15%», mens «8 %», «7,5 %», «5 %» og «15 %» står i `description`, `metaDescription`, `ogDescription` og i FAQ-svaret «Hvornår skal jeg betale mellemskat eller topskat i 2026?» i `FAQPage`-JSON-LD; kommuneskats-svaret skal have «ca. 22,5 % (Rundersdal) til 27,8 % (Langeland)»; **intet** `NaN` og ingen «kr..» eller «kr. kr.») ceo/loen-efter-skat-faq-tal-fra-modul 3/10 04:52`

`VERIFICÉR DEPLOY: /dage-mellem-datoer + /dagar-mellan-datum (nye sider med eget slugsprog: `minberegner.dk/dage-mellem-datoer` skal have `<title>` «Dage mellem datoer: beregn antal dage mellem to datoer», **1** `<h1>`, **3** spørgsmål i `FAQPage`-JSON-LD («Hvor mange dage er der mellem to datoer?», «Er 2028 et skudår, og hvor mange dage er der i det?», «Hvorfor står der både dage og hele uger?»), eksempel-sætningen «Fra 1. januar 2026 til 1. januar 2027 går der 365 dage: 52 hele uger og 1 dag til.», og **0** «aldrig kan bli negativt»; `beraknare.se/dagar-mellan-datum` skal have `<title>` «Dagar mellan datum: räkna ut antal dagar mellan två datum» og eksemplet «… går det 365 dagar: 52 hela veckor och 1 dag till.», altså **0** «aldrig kan bli negativt»; **0** `NaN` på begge; begge URL'er skal ligge i hvert sit eget sitemap med `daily`, og `minberegner.dk/dagar-mellan-datum` + `beraknare.se/dage-mellem-datoer` skal 301'e til hver sin egen sti) ceo/dage-mellem-datoer 3/10 04:15`

`VERIFICÉR DEPLOY: /topskat henter grænser, satser og bruttoindkomster fra sit eget modul (metadata og FAQ skal have «mellemskat fra 641.200 kr,» — **kr uden punktum** foran kommaet — og «topskat fra 777.900 kr.», altså **0** × «641.200 kr.,»; FAQ-svaret «Hvornår betaler man topskat i 2026?» skal have «(7,5 %)», «(yderligere 7,5 %)» og «ca. 697.000 kr./år (ca. 58.100 kr./md)» og «845.500 kr./år (ca. 70.500 kr./md)» — altså **0** × «58.000», **0** × «7,5%», **0** × «5%»; FAQ-svaret «Hvad er skatteloftet?» skal have «overstiger ca. 52,07 %» og «Med AM-bidrag (8 %)», altså **0** × «52,07%»; FAQ-svaret «Hvad er den nye top-topskat?» skal have «på 5 % for indkomster over 2.592.700 kr (efter AM-bidrag)», altså **0** × «2.592.700 kr.»; brødtekstens punktliste skal skrive «Mellemskat (7,5 %):» med mellemrum, altså **0** × «(7,5%):»; værktøjets «Grænser 2026» skal vise «Mellemskat fra 697.000 kr./år brutto. Topskat fra 845.500 kr./år brutto.» — altså **0** × «845.544»; **intet** `NaN`) ceo/topskat-faq-tal-fra-modul 3/10 04:37`

`VERIFICÉR DEPLOY: /boernepenge henter satser, årstal og aftrapping fra sit eget modul (`minberegner.dk/boernepenge`: `description` skal have «0-2 år: 5.370 kr/kvartal, 3-6 år: 4.248 kr/kvartal, 7-14 år: 3.342 kr/kvartal, 15-17 år: 1.114 kr/md»; `metaDescription` skal have «0-2 år 5.370, 3-6 år 4.248 og 7-14 år 3.342 kr/kvartal, 15-17 år 1.114 kr/md» — altså **0** × «kr.,» på hele siden og **0** × «2%»; brødteksten skal skrive «Hvis din indkomst overstiger 961.100 kr. i 2026, nedsættes ydelsen med 2 % af beløbet over grænsen.» og «Tjener du 1.100.000 kr, er du 138.900 kr. over grænsen.» med **kr uden punktum** foran kommaet; FAQ-svaret «Hvor meget får jeg i børnepenge 2026?» skal have «5.370 kr/kvartal (21.480 kr/år)», «4.248 kr/kvartal (16.992 kr/år)», «3.342 kr/kvartal (13.368 kr/år)» og «1.114 kr/måned (13.368 kr/år)»; FAQ-svaret «Bliver børnepenge modregnet ved høj indkomst?» skal have «overstiger 961.100 kr. i 2026», «1.000.000 kr. giver 2 % af 38.900 kr. = 778 kr. årligt»; **intet** `NaN`) ceo/boernepenge-faq-tal-fra-modul 3/10 05:05`

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
