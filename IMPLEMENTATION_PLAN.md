STATUS: 3/10 09:5x. CI grøn ved start (`37104447259`), ingen åbne PR'er.
       **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` ·
       `npm run build` — **grøn 3/10 09:4x** (alle exit 0, **4015** tests i 254
       filer, +3).
       **Denne iteration:** **F5d lukket** — de 9 sidste synlige «25%», «15%»,
       «12,5%», «8%» og «38%» er væk fra forsidens brødtekst (da + se) og
       feriepengetabellen. De lå i **`HomeContent.tsx` og
       `FeriepengeBeregner.tsx`**, ikke i `footer-data.ts` som F5d-noten
       antog, og planen havde heller ikke set de **to svenske** strenge. Ny
       port `procent-i-synlig-tekst.test.tsx` renderer de to komponenter
       direkte og dømmer markupken med samme regex som F5c's scanner; den er
       målt rød 3/3 ved mutation. De to gamle porte kunne ikke se fejlen:
       `forside.test.tsx` mockerer `HomeContent` med vilje, og
       `regnestykker.test.ts`s loft på 436 nåede længe før de to filer.
       **Næste iteration:** en **feature** (senest `/timer-i-aaret`), og
       først de åbne VERIFICÉR-noter efter 12:30-vinduet.
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

**F5c. [~] Procentnotationen «8 %» — 598 fund målt, 436 tilbage 3/10 08:10.**
*Hvad:* de største resterende er `blog/30-procent-reglen-husleje` 25 (⛔ de er
regelnavnet, se portens undtagelse), `/moms` 18, `blog/pension-…` 20 og
`blog/boliglaan-2026-renter-og-afdrag` 19. `page-data.ts` 73 er **lukket**
3/10 08:10.
*Accept:* loftet i `regnestykker.test.ts` (`PROCENT_UDEN_MELLEMRUM_LOFT`) må
kun falde, og hver slice tager de tre største filer. *Målt:* 598 → 570 → 509 →
**436** noder (3/10 08:10; scanneren tæller noder, så en linje med to procenter
tælles én gang).
**Målt 3/10 07:47 — den blinde plet er fundet:** scanneren læser kun
`JsxText` og strengliteraler, så **en procent fra en interpolation er kode** og
er usynlig for den. `/procent` havde 11 til i sin *renderede* HTML. To nye
renderede porte dømmer markupken i da + se (`procent-formler.test.tsx` og
`src/app/boliglaan/page.test.tsx`); **den næste slice skal greppe på `}%` og
`}%»` i den fil den rører** — det er den fund, der ikke står i `/\d%/`.
Se `docs/plan-arkiv.md`.

- **SU-fælleshold: «hvor meget må man tjene ved siden af SU»** — *Hvem:*
  studerende på 1. års SU og deres forældre, hver august–december. *Datagrund:*
  dansk autocomplete **nr. 1** under «hvor meget» målt 3/10 09:2x, og
  `/su` **falder** (201 → 127 besøgende/28d) selv om spørgsmålet er helt
  sæsonbetonet. `grep -rn "fælleshold" src/` giver **0 træffere**, så
  indkomstgrænsen for fællesøkonomi findes ikke på sitet i dag, selv om
  `su.ts` allerede regner på månedsløn. *Accept:* fællesholdsgrænse læst fra
  ét modul med kilde, værktøj der finder «din indtægt kan højst være X kr.»
  for dig + din partner, og tal fra samme modul i brødteksten.
  ⛔ **`su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/satser-for-fribeloeb`
  svarer 404 (målt 3/10 09:24)** — find den rigtige fællesholdsside før der
  skrives ét tal. Gæt ikke grænsen.

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

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. ✅ betyder lukket; detaljerne står i `docs/plan-arkiv.md`.

**Åben række (strenglisten):** næste fil skal måles på ny. **Tretten filer er
lukket** (se listen nedenfor og `docs/plan-arkiv.md`). Strenglistens loft er
**70 → 57**, JSX-listen **360 → 347 → 338 → 333 → 332 → 320 → 315 → 313**
(`/boernepenge` 3/10 05:05).

**Tretten filer er lukket** (`su`, `arveafgift`, `/boligsalg`, `/procent`,
`/renteberegner`, `/procentpoint`, `/kvadratmeter`, `/konfirmation`,
`/efterloen`, `/aktieskat`, `/loen-efter-skat`, `/topskat`, `/boernepenge`) —
målinger, mutationer og reelle fejl står i `docs/plan-arkiv.md`.

**Åbne F5b-slice: `/flyttebudget` (3 fund), mål listen på ny først.**
`/moms` er ⛔ (de 3 lovgrænser, ❓ nedenfor).

`VERIFICÉR DEPLOY: de tre review-fund fra 3/10 09:1x (`minberegner.dk/topskat` skal have **1** «Med AM-bidrag er din marginalskat dér 55,9 %» i værktøjets skatteloft-boks og **0** «så højt din marginalskat kan blive», og samme sætning i `FAQPage`-JSON-LD'en skal være «… (ekskl. AM-bidrag og kirkeskat). Med AM-bidrag (8 %) er din marginalskat dér 55,9 %, og over top-topskat-grænsen lægges yderligere 5 % oveni.»; `beraknare.se/timmar-i-aret` skal have «Ett dygn», «En vecka», «Två veckor», «En månad (februari)», «En månad (april)», «En månad (januari)» og «Ett år» i hovedtabellens `<th scope="row">` — altså **0** «Et døgn», **0** «To uger» og **0** «En måned (»; `minberegner.dk/procent` skal have `>? %<` i begge resultatfelter — altså **0** `> ? %<`; **intet** `NaN`) ceo/rettelse-tre-reviewfund 3/10 08:35`

## Research 3/10 05:30

De tre målinger (Googles egen autocomplete for «hvor mange dage er der» og
«hvor mange timer er der», og den AST-målte procenttelling på 598 fund i 73
filer) ligger i `docs/plan-arkiv.md`. Alle tre er brugt: to førte til
`/dage-i-aaret` og `/timer-i-aret`, den tredje til F5c.

`VERIFICÉR DEPLOY: procentnotationen «8 %» på /procent og /boliglaan (hele HTML'en på `minberegner.dk/procent` skal have **0** `\d%` — altså **0** «10%», «25%», «5%», «50%», «1%» — og opslagstabellen skal have «10 % af 250 = 25» og «5 % af 250 = 12,5», tipboksen «50 % af 40 er det samme som 40 % af 50», listen «25 % moms på 1.000 kr = 250 kr i moms», og FAQ-svarene «Eksempel: 25 % af 200 = 50.» og «Læg 20 % til 150»; `beraknare.se/procent` skal have «25 % av 250 = 25», «50 % av 40 är samma sak som 40 % av 50» og **0** «10%»/«25%»/«5%»; værktøjets egen resultatlinje skal skrive «25 %» og forklaringen «25 er 25,00 % af 100» (dvs. den interpolerede procent er rettet, ikke kun brødteksten); `minberegner.dk/boliglaan` skal have «Minimum 5 % af boligens pris (anbefalet: 10-20 %)», «Op til 80 % af boligens værdi», tabellen «0-40 %»/«0,45-0,65 %»/«1,05-1,55 %», «ca. 25,6 % fradrag» og **0** `\d%`; `beraknare.se/boliglaan` skal have «Minst 10 % av bostadens pris», «90 % av bostadens värde (bolånetaket, höjt från 85 % 2026)», «30 % avdrag» og **0** `\d%`; **intet** `NaN`) ceo/procent-punkt-sweeps 3/10 08:00`

`DEPLOY OK 3/10 08:5x` — VERIFICÉR DEPLOY: /dage-i-aaret + /dagar-i-aret (nye sider med tolv-måneders-tabel: `minberegner.dk/dage-i-aaret` skal have `<title>` «Hvor mange dage er der på et år? Dage i alle 12 måneder», **1** `<h1>`, **12** månedsrækker + **1** summeringsrække i tabellen, og **3** spørgsmål i `FAQPage`-JSON-LD med præcis «Hvor mange dage er der på et år?», «Hvor mange dage er der i augusti?» og «Hvor mange dage er der i juli?» — svaret på augusti skal være «31 dage … 21 hverdage og 10 weekenddage» og på juli «31 dage … 23 hverdage og 8 weekenddage»; summeringen skal være 365 dage / 251 hverdage / 104 weekend; `beraknare.se/dagar-i-aret` skal have «Augusti har 31 dagar, och det är 21 vardagar och 10 helgdagar» og månedsnavnet «augusti», altså **0** «august»; `minberegner.dk/dagar-i-aret` + `beraknare.se/dage-i-aaret` skal 301'e til hver sin egen sti; begge URL'er skal ligge i hvert sit eget sitemap med `daily`; **intet** `NaN`) ceo/dage-i-aaret 3/10 06:20`

`VERIFICÉR DEPLOY: /timer-i-aret + /timmar-i-aret (nye sider med periode- og måneds-tabel i time: `minberegner.dk/timer-i-aret` skal have `<title>` «Hvor mange timer er der på et år? Timer i alle perioder», **1** `<h1>`, perioderækkerne «Et døgn» 1/24/1.440, «En uge» 7/168/10.080, «To uger» 14/336/20.160, «En måned (februar)» 28/672/40.320, «En måned (april)» 30/720/43.200, «En måned (januar)» 31/744/44.640 og «Et år» 365/8.760/525.600, **12** månedsrækker + **1** summeringsrække i den anden tabel, eksempelrækken «2026 har 365 dage, som er 8.760 timer.», **3** spørgsmål i `FAQPage`-JSON-LD med præcis «Hvor mange timer er der på et år?», «Hvor mange timer er der på en uge?» og «Hvor mange timer er der på en måned?»; `beraknare.se/timmar-i-aret` skal have «8 760 timmar» og **0** «8.760», og **0** «hur mange»; `minberegner.dk/timmar-i-aret` + `beraknare.se/timer-i-aret` skal 301'e til hver sin egen sti; begge URL'er skal ligge i hvert sit eget sitemap med `daily`; `minberegner.dk/tidsberegner` skal have «timer i hvert tidsrum» med link til siden og `beraknare.se/tidsberegner» «timmar i varje tidsperiod»; **intet** `NaN`) ceo/timer-i-aret 3/10 07:55`

**MÅLT 3/10 09:0x: 8 af 9 krav er live** (forsiden 0 × «100%» og 2 × «100 % Gratis», navigation «25 % moms», /feriepenge «12,5 % af din ferieberettigede løn», /laaneberegner «5-25 %»/«4-12 %»/«(1-5 %)», /husleje «30 %» + «33 %, men 30 %» og «30% reglen» stadig) — og den 9. var F5d-arbejde, ikke en deploy-fejl: `ceo/procent-med-mellemrum`.

`VERIFICÉR DEPLOY: procentnotationen «8 %» på forside, navigation og tre sider (hele HTML'en på `minberegner.dk/` skal have **1** «100 % Gratis» og **1** «100 % gratis» og **0** «100%», og navigationens momskort skal sige «25 % moms» med **0** «25%»; `minberegner.dk/feriepenge` skal have «12,5 % af din ferieberettigede løn», «AM-bidrag (8 %)» og «(35.000 × 12 × 12,5 %)» med **0** «8%»/«12,5%»; `minberegner.dk/laaneberegner` skal have «5-25 %», «4-12 %», «(1-5 %)» og «(100 %+)»; `minberegner.dk/husleje` skal have «30 % af din nettoindkomst» og «Nogle kilder siger 33 %, men 30 %» — og «30% reglen forklaret» skal ** stadig stå, fordi det er regelnavnet; `beraknare.se/laaneberegner` skal have «5-15 %», «3-8 %» og «(2-5 %)»; **intet** `NaN`) ceo/procent-med-mellemrum 3/10 06:45`

`VERIFICÉR DEPLOY: procenttal i forsidens brødtekst og feriepengetabellen (hele HTML'en på `minberegner.dk/` skal have **0** `\d%` — altså **0** «25%», «15%» — og stadig **2** × «100 % Gratis»; `minberegner.dk/feriepenge` skal have «Feriepenge (12,5 %)», «- AM-bidrag (8 %)» og «- Skat (estimat ~38 %)» med **0** `\d%`; `beraknare.se/` skal have «lägg till eller dra av 25 % moms», «legg til eller trekk fra 25 % MVA», «tillæg eller fratræk 25 % moms» og «boafgift (15 %) og tillægsafgift (25 %)»; **intet** `NaN`) ceo/procent-forside-feriepenge 3/10 09:4x`

## VERIFICÉR DEPLOY-noter — lukket 3/10 08:0x på indhold

**12 af 12 lukket.** Alle noter fra merges før 07:30-vinduet er hentet med curl
og dømt på **indhold**, aldrig på HTTP 200. Måleresultatet pr. slug står i
`docs/plan-arkiv.md` under «3/10 08:15». Kort fortalt: de 12 viste den nye kode
på indhold, og de to afvigelser (`/aktieskat`s «27/42%» og `/loen-efter-skat`s
«8%») findes også i `git grep HEAD` — de er F5c-rester, ikke deploy-fejl, fordi
de er brødtekst og ikke de tal, noternehandlede om.

**Åbne (merges efter 07:30-vinduet, venter på batch-deployeren 12:30):**
`ceo/procent-med-mellemrum` 06:45 · `ceo/dage-i-aaret` 06:20 ·
`ceo/timer-i-aret` 07:55 · `ceo/procent-punkt-sweeps` 08:00.

`VERIFICÉR DEPLOY: procentnotationen «8 %» i metadata og FAQ på tværs af alle slugs (helt korpuset i `page-data.ts` er skrevet om, så **hele HTML'en** på de berørte sider skal have **0** `\d%` — altså **0** «25%», «12,5%», «8%», «5%», «100%» — undtagen **1** «30% reglen» pr. `/husleje` (regelnavnet). Prøv især `minberegner.dk/boernepenge` («12,5 %», «2 %», «AM-bidrag (8 %)», 0 × «kr.,»), `minberegner.dk/feriepenge` («12,5 %»), `minberegner.dk/rentefradrag` («33,6 %», «25,6 %»), `minberegner.dk/su` («100 %», «80 %»), `minberegner.dk/arveafgift` («15 %», «25 %»), `minberegner.dk/husleje` («30 %», «33 %», **1** «30% reglen»), `minberegner.dk/opsparing` («5 %», «10-20 %», «~7 %», «2-4 %», «under 1 %»), `minberegner.dk/konfirmation` («40-50 %», «20-30 %», «20-25 %»), `minberegner.dk/arvestigning` («20 %», «80 %», «0,51 %», «5,1‰» — promillen skal **beholde** sin skrivemåde), `minberegner.dk/dagpenge` («90 %», «100 %», «80 %»), `minberegner.dk/brutto-netto` («25,049 %», «AM-bidrag (8 %)»), `minberegner.dk/promille` og `minberegner.dk/procent`; `beraknare.se/procent` («25 %», «20 %», «2 %», «3 %»), `beraknare.se/leasing` («85 %», «15 %», «30 %», «21 %», «20 %»), `beraknare.se/moms` («25 %», «15 %», «12 %», «20 %»), `beraknare.se/boernepenge` («100 %», «80 %») og `beraknare.se/dagpenge` («5 %»); **intet** `NaN`) ceo/procent-punkt-sweep-side-data 3/10 08:20`

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
