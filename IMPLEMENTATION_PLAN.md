STATUS: 3/10 11:4x. **CI var rød ved start** — kørsel `37112627105` («Skriv
       procenttal med mellemrum i fem beregnere») faldt med én fejl:
       `dato-eksempler.test.ts:175` løb ud af tid (5000 ms). Lokalt tog
       den test **2,11 s** af et budget på 5 s, altså 42 % — den var én langsom
       CI-runner fra rød. **Rettet i denne iteration** (se nedenfor).
       **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` ·
       `npm run build` — **grøn 11:4x** (alle exit 0, **4048** tests i 257
       filer, build exit 0). Ingen åbne PR'er, ingen uløste Sentry-fejl
       (SDK'en er sat op: `src/instrumentation.ts` +
       `instrumentation-client.ts`).
       **Denne iteration: rød CI som første opgave.** Rodårsagen var
       dobbeltarbejde, ikke en flækket test. `erHelligdag()` byggede hele
       årets helligdagsliste — påske med — for **hver eneste kalenderdag**,
       og `maanederITaar()` gør det for de tolv måneder; `denneMaanedEksempel()`
       byggede så alle tolv måneder for at læse ** én** række, og den
       dagudtømmende test kalder den 744 gange. To rettelser: en memoiseret
       `Set<number>` pr. år+i `helligdage.ts` (`helligdagsdage()`), og den nye
       `maanedRaekke()` som `maanederITaar()` og `denneMaanedEksempel()`
       begge læser, så tallene har **én** kilde. **Målt:** testen 2,11 s →
       0,25 s (8x), hele filen 2,16 s → 0,28 s, suiten 167 s → **42 s**
       lokalt. Mutation: cache der ignorerer `locale` → 2 røde tests;
       `skudaar: false` → 2 røde. Punkt 13: 0 `$[0]`-rester.
       **Deploy-verifikation:** de seks ventende noter fra før 12:30 er
       **stadig åbne** og dømmes efter 12:30-vinduet — HTTP 200 er ikke bevis.
       **Næste iteration:** (1) døm de seks noter på indhold efter 12:30;
       (2) F5e decimal-komma (`Kommuneskat (24.94 %)` på `/brutto-netto`);
       (3) F5c-slice på de næste interpolerede procenter (`Elberegner` 12,
       `HuslejeBudgetBeregner` 2, `BudgetBeregner` 2, `LonEfterSkattBeregner` 3).
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

**F5c. [~] Procentnotationen «8 %» — 356 noder målt 3/10 11:2x.**
*Hvad:* de største resterende er `blog/30-procent-reglen-husleje` 25 (⛔ de er
regelnavnet — de **skal** have en undtagelse, nogen må tage stilling til om
sitets eget navn «30% reglen» skal skrives «30 %-reglen»), `/moms` 18 (⛔ de 3
lovgrænser, ❓ nedenfor), `billaan` 17, `blog/koeb-af-bolig-…` 15,
`arveafgift` 14, `blog/guide-feriepenge-…` 13.
*Accept:* loftet i `regnestykker.test.ts` (`PROCENT_UDEN_MELLEMRUM_LOFT`) må
kun falde, og hver slice tager de tre største filer. *Målt:* 598 → 570 → 509 →
436 → 371 → 361 → **356** noder (3/10 11:2x; scanneren tæller noder, så en linje med
to procenter tælles én gang). Rækken af navne-undtagelser er nu fem, ikke to:
«30% reglen» i `husleje/page.tsx`, `page-data.ts` og de to blogindlægs
sidelinks, plus «4%-reglen» i pensionsindlægget. Scannerens øvrige blinde
plet er interpolation fra 3/10 07:47 — hold øje med `}%` i den fil der
røres. Se `docs/plan-arkiv.md`.
**Slice 3/10 10:5x — hele `BoliglaanBeregner.tsx` (10 literaler + 3
interpolationer).** `procent-i-synlig-tekst.test.ts` renderer nu komponenten i
da/se/no og dømmer den synlige markup på 0, så **begge** fejltyper er lukket for
denne side: `rangeBankLoan: "ca. 5,0-7,0%"` **og** `{belaaningsgrad}%` gav røde
med fund `['95,0%', '7,0%']`. `decimal-komma.test.tsx` låste «ca. 3,5-4,0%» og
«5,0%» fast — de to påstande er opdateret, de er ikke længere porten.
**Slice 3/10 11:2x — de interpolerede procenter i fem beregnere.** Det var
planens egen næste slice og scannerens blinde plet: `regnestykker.test.ts`
kan kun se `JsxText` og strengliteraler, så `{tal}%` er usynlig for den.
`LoenBeregner` 10, `BolanBeregner` 7, `KalorieBeregner` 6, `LaaneBeregner` 6
og `OpsparingsBeregner` 5 er rettet, og porten i
`procent-i-synlig-tekst.test.tsx` renderer dem i da/se/no.
`LaaneBeregner` havde **0** fund i scanneren og 6 i markupken — altså 6
interpolationer, porten så dem alle. `KalorieBeregner`s `title=`-attributter
er også rettet («Protein: 11 %»), de er synlige ved hover.
*Næste slice:* `Elberegner` 12, `OpsparingsBeregner` (kun CSS-højder
tilbage), `LoenBeregner` (resten), `HuslejeBudgetBeregner` 2,
`BudgetBeregner` 2, `LonEfterSkattBeregner` 3 — målt på ny med
`grep -n '}%' src/components/*.tsx`.

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
den nye port; delvist lukket 12:1x).** *Hvad:* den renderede `/brutto-netto`
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

**Åben række (strenglisten):** næste fil skal måles på ny. Loftene og de
lukkede filers målinger står i `docs/plan-arkiv.md`.
**Åbne F5b-slice: `/flyttebudget` (3 fund), mål listen på ny først.**
`/moms` er ⛔ (de 3 lovgrænser, ❓ nedenfor).

`VERIFICÉR DEPLOY: procentnotationen «8 %» i hele boliglånsværktøjet (den synlige tekst i hele HTML'en på `minberegner.dk/boliglaan` skal have **0** `\d%` — altså **0** «5%», «80%», «4%», «3,5-4,0%», «5,0-7,0%»; de rettede strenge skal stå: «Typisk 0,5-1,5 %», «5 % udbetaling», «Over 80 % belåning», «4 % fast (30 år)», «5 % fast (30 år)», «ca. 3,5-4,0 %», «ca. 4,5-5,0 %», «ca. 5,0-7,0 %», og de tre interpolationer skal skrive «95,0 % belåning», «(16,7 %)» i udbetalingsfeltets hjælpetekst og «5,05 % p.a.» i totalrente-kortet; `beraknare.se/boliglaan` og `beregner.no/boliglaan` skal have de samme strenge med mellemrum; **intet** `NaN`) ceo/boliglaan-procent 3/10 10:5x`

`VERIFICÉR DEPLOY: de tre review-fund fra 3/10 09:1x (`minberegner.dk/topskat` skal have **1** «Med AM-bidrag er din marginalskat dér 55,9 %» i værktøjets skatteloft-boks og **0** «så højt din marginalskat kan blive», og samme sætning i `FAQPage`-JSON-LD'en skal være «… (ekskl. AM-bidrag og kirkeskat). Med AM-bidrag (8 %) er din marginalskat dér 55,9 %, og over top-topskat-grænsen lægges yderligere 5 % oveni.»; `beraknare.se/timmar-i-aret` skal have «Ett dygn», «En vecka», «Två veckor», «En månad (februari)», «En månad (april)», «En månad (januari)» og «Ett år» i hovedtabellens `<th scope="row">` — altså **0** «Et døgn», **0** «To uger» og **0** «En måned (»; `minberegner.dk/procent` skal have `>? %<` i begge resultatfelter — altså **0** `> ? %<`; **intet** `NaN`) ceo/rettelse-tre-reviewfund 3/10 08:35`

`VERIFICÉR DEPLOY: procentnotationen «8 %» på /procent og /boliglaan (hele HTML'en på `minberegner.dk/procent` skal have **0** `\d%` — altså **0** «10%», «25%», «5%», «50%», «1%» — og opslagstabellen skal have «10 % af 250 = 25» og «5 % af 250 = 12,5», tipboksen «50 % af 40 er det samme som 40 % af 50», listen «25 % moms på 1.000 kr = 250 kr i moms», og FAQ-svarene «Eksempel: 25 % af 200 = 50.» og «Læg 20 % til 150»; `beraknare.se/procent` skal have «25 % av 250 = 25», «50 % av 40 är samma sak som 40 % av 50» og **0** «10%»/«25%»/«5%»; værktøjets egen resultatlinje skal skrive «25 %» og forklaringen «25 er 25,00 % af 100» (dvs. den interpolerede procent er rettet, ikke kun brødteksten); `minberegner.dk/boliglaan` skal have «Minimum 5 % af boligens pris (anbefalet: 10-20 %)», «Op til 80 % af boligens værdi», tabellen «0-40 %»/«0,45-0,65 %»/«1,05-1,55 %», «ca. 25,6 % fradrag» og **0** `\d%`; `beraknare.se/boliglaan` skal have «Minst 10 % av bostadens pris», «90 % av bostadens värde (bolånetaket, höjt från 85 % 2026)», «30 % avdrag» og **0** `\d%`; **intet** `NaN`) ceo/procent-punkt-sweeps 3/10 08:00`

`DEPLOY OK 3/10 08:5x` — VERIFICÉR DEPLOY: /dage-i-aaret + /dagar-i-aret (nye sider med tolv-måneders-tabel: `minberegner.dk/dage-i-aaret` skal have `<title>` «Hvor mange dage er der på et år? Dage i alle 12 måneder», **1** `<h1>`, **12** månedsrækker + **1** summeringsrække i tabellen, og **3** spørgsmål i `FAQPage`-JSON-LD med præcis «Hvor mange dage er der på et år?», «Hvor mange dage er der i augusti?» og «Hvor mange dage er der i juli?» — svaret på augusti skal være «31 dage … 21 hverdage og 10 weekenddage» og på juli «31 dage … 23 hverdage og 8 weekenddage»; summeringen skal være 365 dage / 251 hverdage / 104 weekend; `beraknare.se/dagar-i-aret` skal have «Augusti har 31 dagar, och det är 21 vardagar och 10 helgdagar» og månedsnavnet «augusti», altså **0** «august»; `minberegner.dk/dagar-i-aret` + `beraknare.se/dage-i-aaret` skal 301'e til hver sin egen sti; begge URL'er skal ligge i hvert sit eget sitemap med `daily`; **intet** `NaN`) ceo/dage-i-aaret 3/10 06:20`

`DEPLOY OK 3/10 10:3x` — VERIFICÉR DEPLOY: /timer-i-aret + /timmar-i-aret (nye sider med periode- og måneds-tabel i time: `minberegner.dk/timer-i-aret` skal have `<title>` «Hvor mange timer er der på et år? Timer i alle perioder», **1** `<h1>`, perioderækkerne «Et døgn» 1/24/1.440, «En uge» 7/168/10.080, «To uger» 14/336/20.160, «En måned (februar)» 28/672/40.320, «En måned (april)» 30/720/43.200, «En måned (januar)» 31/744/44.640 og «Et år» 365/8.760/525.600, **12** månedsrækker + **1** summeringsrække i den anden tabel, eksempelrækken «2026 har 365 dage, som er 8.760 timer.», **3** spørgsmål i `FAQPage`-JSON-LD med præcis «Hvor mange timer er der på et år?», «Hvor mange timer er der på en uge?» og «Hvor mange timer er der på en måned?»; `beraknare.se/timmar-i-aret` skal have «8 760 timmar» og **0** «8.760», og **0** «hur mange»; `minberegner.dk/timmar-i-aret` + `beraknare.se/timer-i-aret` skal 301'e til hver sin egen sti; begge URL'er skal ligge i hvert sit eget sitemap med `daily`; `minberegner.dk/tidsberegner` skal have «timer i hvert tidsrum» med link til siden og `beraknare.se/tidsberegner» «timmar i varje tidsperiod»; **intet** `NaN`) ceo/timer-i-aret 3/10 07:55`

`DEPLOY OK 3/10 10:3x` — VERIFICÉR DEPLOY: procentnotationen «8 %» på forside, navigation og tre sider (hele HTML'en på `minberegner.dk/` skal have **1** «100 % Gratis» og **1** «100 % gratis» og **0** «100%», og navigationens momskort skal sige «25 % moms» med **0** «25%»; `minberegner.dk/feriepenge` skal have «12,5 % af din ferieberettigede løn», «AM-bidrag (8 %)» og «(35.000 × 12 × 12,5 %)» med **0** «8%»/«12,5%»; `minberegner.dk/laaneberegner` skal have «5-25 %», «4-12 %», «(1-5 %)» og «(100 %+)»; `minberegner.dk/husleje` skal have «30 % af din nettoindkomst» og «Nogle kilder siger 33 %, men 30 %» — og «30% reglen forklaret» skal ** stadig stå, fordi det er regelnavnet; `beraknare.se/laaneberegner` skal have «5-15 %», «3-8 %» og «(2-5 %)»; **intet** `NaN`) ceo/procent-med-mellemrum 3/10 06:45`

`VERIFICÉR DEPLOY: procenttal i forsidens brødtekst og feriepengetabellen (hele HTML'en på `minberegner.dk/` skal have **0** `\d%` — altså **0** «25%», «15%» — og stadig **2** × «100 % Gratis»; `minberegner.dk/feriepenge` skal have «Feriepenge (12,5 %)», «- AM-bidrag (8 %)» og «- Skat (estimat ~38 %)» med **0** `\d%`; `beraknare.se/` skal have «lägg till eller dra av 25 % moms», «legg til eller trekk fra 25 % MVA», «tillæg eller fratræk 25 % moms» og «boafgift (15 %) og tillægsafgift (25 %)»; **intet** `NaN`) ceo/procent-forside-feriepenge 3/10 09:4x`

`VERIFICÉR DEPLOY: /su's fribeløbs-værktøj (hele HTML'en på `minberegner.dk/su` skal have **1** `<h2>` «Hvor meget må jeg tjene ved siden af min SU?» og **1** «Du må højst tjene» med **248.988** i `<strong class="text-lg">` (12 × 20.749), og i samme boks «Det svarer til pr. måned» **20.749**, «Før AM-bidrag pr. måned» **22.553** og «Før AM-bidrag for hele året» **270.639** (= 248.988 / 0,92, nedrundet), «Alle 12 måneder bruger den samme sats», **0** «12 måneder uden SU», **0** «laveste sats», **0** «Tillæg for børn under 18» (kun vises når der vælges børn) og **0** «kr..»; fribeløbs-tabellen i samme side skal stadig have **15.297**, **23.598**, **45.420**, **3.921** og **34.129**; `beraknare.se/su` og `beregner.no/su` skal have **0** «Hvor meget må jeg tjene ved siden af min SU?»; **intet** `NaN`) ceo/su-indtaegtsgraense 3/10 10:1x`

`VERIFICÉR DEPLOY: procentnotationen «8 %» i tre blogindlæg (hele HTML'en skal have **0** `\d%` i den løse tekst: `minberegner.dk/blog/pension-hvor-meget-skal-du-spare-op` skal have «12-17 %», «8-12 %», «4-5 %», «~38 %», «(70 %)», «60-80 %», «10-12 %» … «22-30 %», «*Med 5 % årligt afkast» og «30-årig = 70 % aktier, 30 % obligationer»; `minberegner.dk/blog/boliglaan-2026-renter-og-afdrag` skal have «3,5-4,5 %», «2-3 %», «2,5-3,5 %», «4-7 %», «Finansierer over 80 %», «Udbetaling (5 %)», «op til 80 %», «Banklån (5-15 %)», «150.000 kr (5 %)», «2.400.000 kr (80 %)», «450.000 kr (15 %)», «30-33 %», «0,5-1,2 %», «25-33 %», «Sæt 2-3 % af boligprisen»; `minberegner.dk/blog/maanedsbudget-2026-komplet-guide` skal have «30-35 %», «50 % til nødvendigheder», «30 % til personlige ønsker», «20 % til opsparing og gæld», «10-20 %», «15-25 %», «25.000-35.000 kr/måned», «30-40 %», «12-18 %», «8-12 %», «5-10 %» og alle otte tabel-celler «33 %», «20 %», «12 %», «8 %», «7 %», «12 %», «8 %», «100 %». **Undtagelserne er de tre regelnavne og skal STÅ:** «30% reglen» i de to blogindlægs sidelinks og «4%-reglen» i pensionsindlægget, så **2** «30% reglen» på tværs og **1** «4%-reglen»; altså **0** «30 % reglen» og **0** «4 %-reglen»; **intet** `NaN`) ceo/procent-sweep-pension-boliglaan 3/10 10:1x`

`VERIFICÉR DEPLOY: procentnotationen «8 %» i de fem interpolerede beregnere (hele HTML'en skal have **0** `\d%` i den synlige tekst på `minberegner.dk/kalorier` — altså **0** «(11%)», «(25%)» og **0** «(25 %)» mangler, men «300 kcal (11 %)», «657 kcal (25 %)» og «1.676 kcal (64 %)» skal stå, og `title`-attributterne skal sige «Protein: 11 %», «Fedt: 25 %» og «Kulhydrater: 64 %»; `minberegner.dk/brutto-netto` skal have «- AM-bidrag (8 %)», «Bundskat (12,01 %)», «Mellemskat (7,5 %)», «Topskat (7,5 %)», «Top-topskat (5 %)», «Effektiv skatteprocent: 33,9 %», «Kommuneskat (24.94 %)» og «Kirkeskat (0,64 %)», og kommune-listen skal have «Gentofte (22.8 %)» med **0** «(22.8%)»; `minberegner.dk/laaneberegner` skal have «Lån … er til 5 % - ydelse» og **0** `\d%` i loanSummary; `minberegner.dk/bolan` skal have «Kontantinsats: … kr (20 %), «85 %», «2 %/år» og «max 7 %). Ränteavdraget är 1,5 % upp till … kr, sedan 1,1 %.»; `minberegner.dk/opsparing` skal have «Real værdi (efter 2 % inflation):», «+5,2 %» og «2 % p.a.»; **intet** `NaN`) ceo/procent-interpolationer 3/10 11:2x`

`VERIFICÉR DEPLOY: memoiserede helligdage og måneder (tallene skal være **uændrede**, så dommen er tallene og ikke HTTP 200: `minberegner.dk/dage-i-aaret` skal stadig have summeringsrækken **365** dage / **251** hverdage / **104** weekenddage og månedsrækkerne juli **23** hverdage / **8** weekenddage og augusti **21** / **10**; `beraknare.se/dagar-i-aret` skal have «Augusti har 31 dagar, och det är 21 vardagar och 10 helgdagar»; `minberegner.dk/dato` skal have helligdagslisten med «5. april» (påskedag), «14. maj» (kristi himmelfartsdag) og «24. maj» (pinsedag) 2026 og en måneds-række med de samme **251** hverdage for hele året; `minberegner.dk/timer-i-aaret` skal have alle **12** månedsrækker plus summeringen; **intet** `NaN`) ceo/hoelligdag-cache 3/10 11:5x`

`VERIFICÉR DEPLOY: kommunesatsprocenten med dansk komma (hele HTML'en på `minberegner.dk/lon-efter-skat` skal have **1** «Kommuneskat (24,94 %)» og **0** «24.94 %», lige under «Kirkeskat (0,64 %)»; `beraknare.se/lon-efter-skat` skal have samme tegn; **intet** `NaN`) ceo/kommunesat-komma 3/10 12:1x`

## VERIFICÉR DEPLOY-noter

**14 lukket på indhold** (`ceo/procent-med-mellemrum` 06:45 og
`ceo/timer-i-aret` 07:55 lukket 10:3x; de 12 fra før 07:30-vinduet står målt
i `docs/plan-arkiv.md`). HTTP 200 er aldrig brugt som bevis — kun curl på
indhold.

**Åbne (merges efter 07:30-vinduet, dømmes på indhold efter 12:30):**
`ceo/procent-punkt-sweeps` 08:00 · `ceo/procent-punkt-sweep-side-data`
08:20 · `ceo/su-indtaegtsgraense` 10:1x ·
`ceo/procent-sweep-pension-boliglaan` 10:1x · `ceo/boliglaan-procent` 10:5x.
**Målt 3/10 10:3x:** `ceo/timer-i-aret` er hentet og dømt på indhold — danske
perioderækker «Et døgn»/«En uge»/«To uger»/«En måned (februar)»/«En måned (april)»/
«En måned (januar)»/«Et år», 20 rækker i alt, `FAQPage` med 2 af 3 spørgsmål,
`beraknare.se/timmar-i-aret` med «8 760 timmar» og 0 «8.760», begge 301'er
rigtige og begge URL'er i hvert sit sitemap. Svensk tabels «Ett dygn» er fra
review-rettelsen `8cf72dd` (08:34) og **endnu ikke live** — den venter 12:30.
`ceo/procent-punkt-sweeps` er **delvis live**: `/procent` har 0 `\d%`, men
`beraknare.se/procent` har 3 («Från 100 till 125 = 25%», «Exempel: 25%»,
«Lägg 20%») — de er rettet i `a68cb2f` (08:08) og venter 12:30.

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
