STATUS: 9/10 09:0x. ✅ **Review-fund (HØJ) rettet: svensk midsommar og alla helgons dag.** `/helgdagar` viste Midsommarafton som lørdag (altid et døgn for sent: 20/6 i 2026) og Midsommardagen 27/6 (uden for vinduet), og kaldte dem + Alla helgons dag «Fast datum» i tabel, brødtekst og FAQ. Nu fredag 19–25 juni (Midsommarafton), lørdag 20–26 juni (Midsommardagen) og lørdag 31/10–6/11 (Alla helgons dag), alle «Rörligt datum»; også de to svenske sætninger på `/dato` og FAQ'en i `page-data.ts` rettet. Nye porte: datoer+`fast` for 2024–2035 i `helligdage.test.ts` og den viste svenske tabel i `helligdage.test.tsx`. Konsekvens: svensk 2026-arbejdsdage 252→251 (midsommarafton er nu en fredag). Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 08:3x. ✅ **`/boernebidrag` — børnebidragsberegner: normalbidrag, forhøjet bidrag og skattefradrag.** Featuren lå halvfærdig på branchen `ceo/boernebidrag` (logik, test og komponent) uden side, page-data eller registrering. Regnestykket er Familieretshusets eget: normalbidrag = grundbeløb 1.483 kr. + tillæg 192 kr. = 1.675 kr./md (2026), og et forhøjet bidrag er normalbidraget + en procentsats af **grundbeløbet** (bekræftet mod familieretshuset.dk 9/10: «Procenttillægget skal kun beregnes af normalbidragets grundbeløb, som i 2026 er 1.483 kr.»). Indkomstgrænserne er de vejledende beløb for 2026 (100 % fra 600.000, 200 % fra 900.000, 300 % fra 1.600.000 for ét barn; kilden er indkomstoversigten). Eksemplet er Familieretshusets eget: 610.000 kr. og ét barn = 100 % = 1.483 + 1.483 + 192 = 3.158 kr./md. Værktøjet (antal børn 1-5, indkomst), niveautabel, skattefradrag (1.483 kr./md, ca. 27 % fradragsværdi), FAQ og metadata læser alle `boernebidrag.ts`. DaOnly (beraknare.se giver 404). **MÅL: /boernebidrag baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 06:5x. ✅ **`/isolation` — isolationsberegner: cm tykkelse pr. materiale.** Datagrund: dansk autocomplete (hl=da, 9/10 02:4x) har 8/10 træffere under «hvor meget isolering i loft/gulv/ydervæg» og «isolering beregner», «rockwool/isover/knauf isolering beregner»; Feature-køen manglede beregneren. Regnestykket er Bygningsreglementets eget: `U = 1 / (Rsi + d/λ + Rse)`, så tykkelsen følger af ønsket U-værdi, materialets λ og luftlagenes modstand (EN ISO 6946: Rsi 0,10 opad, 0,13 vandret, 0,17 nedad, Rse 0,04 — bekræftet mod DTU byg-r086). Otte materialers λ er intervaller fra bygdinbolig.dk (13. juli 2026) og bygzone.dk, beregneren bruger intervallets midtpunkt. Kravstallene er BR18 § 257 bilag 2 tabel 1 (loft/tag 0,20, ydervæg 0,30, terrændæk og kældergulve 0,20 W/m²K) plus § 279 ved ombygning (0,18/0,12/0,10) — begge læst direkte på bygningsreglementet.dk. Værktøjet (bygningsdel, materiale, m², valgfri U), materiale-tabel for hvert brud, de tre bygningsdeles krav, varmetab W pr. grad, m³ materiale, FAQ og metadata læser alle `isolation.ts`. `U ≤ 9` giver 0 cm med en forklarende bemærkning. DaOnly. **MÅL: /isolation baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 02:5x. ✅ **`/beton` — betonberegner: m³, liter, poser støbemix og ton.** Datagrund: dansk autocomplete (hl=da, 9/10) har 10/10 træffere under «hvor meget beton» (hvor meget beton skal jeg bruge / til gulv / går der i en fundablok) og 8/10 under «hvor meget støbemix»; sitet havde fliser, maling og sand men ingen betonmængde. Geometri: plade = l×b×tykkelse, randfundament = 2×(l+b)×tværsnit, søjle = antal×tværsnit×højde, alt × (1+spild). En 20 kg-pose støbemix giver ca. 10 liter (Byggmax-produktside), hærdet beton vejer ca. 2,2–2,4 t/m³ (Calcly + whiz.tools), poser kan betale sig op til ca. 1 m³ og frostfri dybde typisk 90 cm (materialeberegner.dk), min. 3 cm beton over gulvvarmeslanger, typisk 3–9 cm (Uponor projekthåndbog) — alle citet i `BETON_KILDE`. Tabel, brødtekst, FAQ og metadata læser `beton.ts`. DaOnly (bolig-bygningsmateriale er ikke på svensk). **MÅL: /beton baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Søgeord: betonberegner, hvor meget beton, støbemix poser pr m³. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 02:3x. ✅ DEPLOY OK 9/10 02:3x — `/sukker-i-madvarer` (ceo/sukker-i-madvarer 8/10 21:3x) er live (200) med titlen «Sukker i madvarer: banan 12,2 g, chokolade 51,5 g», «Hvor meget sukker er der i», rækken «Banan» 12,2 g og teksten «Kilden opgiver ikke sukker for havregryn»; strippet HTML lest fra minberegner.dk.
STATUS: 9/10 02:1x. ✅ **`/fiber-i-madvarer` — fiber pr. 100 g i 53 madvarer.** Datagrund: dansk autocomplete (hl=da, 9/10) har 10 af 10 træffere under «hvor meget fiber er der i» (havregryn, gulerødder, chiafrø, æble, kartofler, kiwi …); sitets seks «i madvarer»-sider svarede på kalorier, protein, kulhydrat, fedt, sukker og salt, men ikke fiber. Alle 53 fibertal er USDA FoodData Central, *SR Legacy* 2018-04, næringsstof 1079 (Fiber, total dietary), hentet fra datasættets CSV (samme kilde som de øvrige sider), hver med `fdcId`; WHO's anbefaling (mindst 25 g/dag, 15/21/25 g for børn, retningslinje 17. juli 2023) er den eneste ydre værdi. Tabellen, «Sådan får du 25 g om dagen», ranglisten, FAQ og metadata læser alle `fiber-i-madvarer.ts`. Dansk (daOnly). **MÅL: /fiber-i-madvarer baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 01:4x. ✅ `/salt-i-madvarer` — natrium pr. 100 g i 53 madvarer, omregnet til salt (1b83222). Detaljer i `docs/plan-arkiv.md`.
STATUS: 9/10 00:3x. ✅ `/kalorier-i-alkohol` — kcal i øl, vin, cider og sprits (9f65ec3). Detaljer i `docs/plan-arkiv.md`.
STATUS: 8/10 23:5x. ✅ `/helligdage` og `/helgdagar` — alle helligdage med dato, ugedag og nedtælling (9aa7d46). Detaljer i `docs/plan-arkiv.md`.
STATUS: 8/10 22:3x. ✅ `/sand-og-grus` — m³ og ton sand, grus og bundsikring (b070c1c). Detaljer i `docs/plan-arkiv.md`.
STATUS: 8/10 21:3x. ✅ `/sukker-i-madvarer` — sukker pr. 100 g i 52 madvarer (0e5aef2). Detaljer i `docs/plan-arkiv.md`.
STATUS: 8/10 18:3x. ✅ `/kalorier-i-opskrift` (live, DEPLOY OK 9/10 02:1x). Detaljer i `docs/plan-arkiv.md`.
**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build` på kodeændringer). Seneste: 9/10 02:5x: typecheck 0, lint 0 (954 filer), **5.391 tests i 323 filer grønne**, `next build` grøn med både `/fiber-i-madvarer` og `/beton` i ruteoversigten; `/beton` svarede 200 lokalt med «Betonberegner: 4 × 4 m i 10 cm = 1,76 m³ (176 poser à 20 kg)», «1,32 m³», «132 poser», «3,08 m³» og «308» i SSR, og sitemap.xml indeholder `/beton`; `Host: beraknare.se` gav 404 på `/beton` (daOnly). Mutation målt: `fiber100g` for havregryn 10,6→0 giver 4 røde i `fiber-i-madvarer.test.ts`, og `poser20kg` uden `Math.ceil` giver 1 rød i `beton.test.ts`. 9/10 06:3x: `isolation.ts`' `rIsolering` sat til `0` giver 12 røde i `isolation.test.ts`, og `RSI` for «opad» sat til 0,20 giver 2 røde. Ældre målinger i `docs/plan-arkiv.md`.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9 + 8/10, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` (før Forskel/rabat/læg-til, 6/10) | under top-15 | **149.929** | **0,1 %** | **7,5** |
| `/dato` | 1.133 | 133.054 | 0,6 % | 5,7 |
| `/tidsberegner` (før Plus-tid, 6/10) | **260** | **78.615** | **0,3 %** | **6,7** |
| `/tidszone` | under top-15 | 24.324 | 0,4 % | 7,5 |
| `/kvadratmeter` (før arealværktøj, 6/10) | **393** | 21.403 | 1,5 % | 4,9 |
| `/braendstof` (før forbrugsomregner, 6/10) | **252** | 16.898 | 1,0 % | 6,0 |
| `/rentefradrag` | under top-15 | 5.082 | **5,8 %** | 5,6 |
| `/boligstoette` | 529 | 7.465 | **2,4 %** | 8,7 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | **213, bounce 40 %** | under top-15 | — | — |
| se `/dato` | 133 | 101.580 | 0,1 % | 8,2 |
| se `/tidsberegner` | 167 | 61.934 | 0,2 % | 8,0 |

Site: minberegner.dk 7.452 besøgende/28d (+31 %), ~600.000 GSC-visninger pr.
måned. 27 % af besøgene kommer fra søgemaskiner der ikke er Google. Nye sider
(salt, fiber, kalorier-i-alkohol, helligdage, sand-og-grus, sukker, protein-,
kulhydrater-, fedt-i-madvarer, gram-til-dl, portioner, arbejdsdage, uger-i-aret,
fliser, retvinklet-trekant, koffein, skridt, gaveafgift, laanekapacitet,
nutidskroner, brokost, laantype, idealvaegt, dage-til/*, klokken-i/*, areal,
omkreds, rumfang, ugedag, dage-mellem-datoer) er alle **0** — de måles ~14 dage
efter deres deploy-vindue. Fulde baselines i `docs/plan-arkiv.md`.

### Den faktiske flaskehals

CTR følger **ikke** position. `/boligstoette` har 2,4 % CTR på pos. 8,7 mod
`/procent`s 0,1 % på pos. 7,4 — 24x forskel på næsten samme placering. Vi ligger
på position 5-8 på 600.000 visninger, og der er ingen titel-, beskrivelse- eller
intern-link-fejl tilbage at rette på de eksisterende sider: kun **positionen**
er lav, og den afgøres af den danske konkurrence i hvert enkelt ord.

**Den største *målbare* afstand:** beraknare.se har **190.447 visninger**
(`/dato` 101.580 + `/tidsberegner` 61.934 + `/procent` 26.933) og **229 klik** —
0,12 % CTR. Svensk indholdsdybde er målt lig den danske, så det er opgave 187's
slugs og domæneautoritet.

### Prioriterede opgaver — åbne

**F0d. [~] To sider måler deres nye titel i 14 dage, før der røres ved den.**
`/rentefradrag` (5,8 %) og `/boligstoette` (2,4 %) er GSC-uddragtets to højeste
CTR, så deres **danske** titler får ikke et regnet eksempel, før målingen er
læst. **Baseline:** CTR målt 8/10 08:2x: /rentefradrag 5,8 % (pos. 5,4),
/boligstoette 2,4 % (pos. 8,7). Måles igen ~22/10. **Accept:** tallene fra GSC
17/10 står i tabellen; bagefter enten regnet eksempel eller skriftlig
begrundelse for at lade være.

**F3. [ ] beraknare.se: position, ikke titel.** 190.447 visninger på pos. 8-10.
Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes før de
svenske titelændringer er målt.

**F5. [~] IndexNow** er kodet (`src/lib/indexnow.ts`), krogen kaldes fra
`src/instrumentation.ts` `register()`. ⛔ Mangler `INDEXNOW_ENABLED=true` +
`INDEXNOW_API_KEY` i Dokploy (❓) — uden dem logger hver boot `[indexnow] …
skipped (disabled)`.

**F5c. [~] Procentnotationen «8 %» kun i filer under 15 noder.** Loftet
`PROCENT_UDEN_MELLEMRUM_LOFT` (**206**) må kun falde. De to største er ⛔:
`blog/30-procent-reglen-husleje` og `/moms` (lovgrænserne).

**F5j. [x] FÆRDIG 9/10 02:1x — `/fiber-i-madvarer`** (ceo/fiber-i-madvarer). 53
fibertal fra USDA næringsstof 1079, WHO 25 g/dag som eneste ydre tal. Detaljer i
`docs/plan-arkiv.md`. *Accept (opfyldt 9/10 02:1x):* 200 med «Fiber i madvarer:
10,6 g i havregryn, 5,8 g i rugbrød» i titlen.

## Feature-kø

- **[ ] `/kaloriebehov` — hvor mange kalorier skal jeg have for at tabe/holde/bygge?** Dansk autocomplete (8/10): «hvor mange kalorier skal jeg have for at tabe mig / holde vægten / bygge muskler» 10/10. Sitet har `/kalorier` med kaloriebehov. ⛔ kræver en kilde til kaloriebehov pr. mål (❓).
- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» (da), «bmi barn tabell» (se). WHO's BMI-for-alder-tabeller er ~150 tal pr. køn. ⛔ ét skærmbillede af WHO's tabel (fejltransskription værre end ingen side).
- **[ ] Kogetider** — GSCs 2. største søgning på `/tidsberegner` er «hvor lang tid» (824 visninger, pos. 6,8), og 10/10 danske completioner er madvarer med koge-/bagetid. ⛔ `frbs.foodsearch.lex.dk` og `sst.dk` er uafgængelige (❓).
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89 sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af 10 træffere under «kvadratmeter»; 98 kommuner i `kommuner.ts`, men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).

## VERIFICÉR DEPLOY-noter

**Åben 9/10 09:0x:** `VERIFICÉR DEPLOY: /helgdagar viser Midsommarafton «19 juni 2026» (Fredag) og Midsommardagen «20 juni 2026» (Lördag), begge med «Rörligt datum» i tabelkolonnen, og Alla helgons dag «31 oktober 2026»; teksten «Midsommarafton är fredagen 19–25 juni» står under tabellen, og «Följer påsken» findes ikke på siden; ceo/helgdagar-midsommar 9/10 09:0x`. Mål på **indhold**: strip tags og grep: skal indeholde «19 juni 2026», «Midsommarafton» og «Rörligt datum». Første vindue **9/10 12:30**.

**Åben 9/10 08:3x:** `VERIFICÉR DEPLOY: /boernebidrag svarer 200 og viser titlen «Børnebidrag 2026 – normalbidrag 1.675 kr. pr. måned», overskrifterne «Sådan regnes børnebidraget ud», «Hvilke indkomstgrænser udløser et forhøjet bidrag?», «Hvad koster det, og hvad får du i skat?» og «Hvad beregneren ikke tager med», niveautabellen med «100 %»/«ca. 600.000 kr.», teksten «1.483 + 1.483 + 192 = 3.158 kr.» og «3.158 kr. pr. måned», samt at /boernebidrag står i sitemap.xml og har et kort på forsiden; beraknare.se skal IKKE have siden (daOnly, 404). ceo/boernebidrag 9/10 08:3x`. Mål på **indhold**: strip tags og grep: skal indeholde «Børnebidrag», «3.158» og «normalbidraget plus en procentsats». Første vindue **9/10 12:30**.

**Åben 9/10 06:5x:** `VERIFICÉR DEPLOY: /isolation svarer 200 og viser titlen «Isolationsberegner: 18 cm stenuld på loftet», overskrifterne «Sådan regner du tykkelsen ud», «Hvor mange cm skal hvert materiale være?», «Hvor tykt er tykt nok til de tre bygningsdele?» og «Hvad tykkelsen betyder for varmeregningen», rækken «Stenuld (mineraluld) 0,037 17,98 cm 4,86» i materiale-tabellen, loftsrækken «Loft og tag 0,14 0,2 18 11,7» og vægrækken «Ydervæg 0,17 0,3 11,7 7,6» i kravtabellen, brødteksten «Luftlagene tager 0,14» og varmetabet «20 W» ved 20 grader og FAQ-svaret «17,98 cm stenuld (λ 0,037), 17,01 cm glasuld eller 11,66 cm PIR»; kort på forsiden og under Hverdag, og URL i sitemap.xml; et link til /isolation skal stå på /beton. ceo/isolation 9/10 06:5x`. Mål på **indhold**: strip tags og grep: skal indeholde «Stenuld», «17,98» og «BR18». Første vindue **9/10 07:30**.

**Åben 9/10 02:5x:** `VERIFICÉR DEPLOY: /beton svarer 200 og viser titlen «Betonberegner: 4 × 4 m i 10 cm = 1,76 m³ (176 poser à 20 kg)», overskrifterne «Sådan regner du mængden ud», «Fra kubikmeter til poser og vægt», «Hvor meget beton skal du bruge?» og «Skal du bruge poser eller en betonbil?», rækken «1,00 m³ / 1.000 / 100 poser» i kubikmetertabellen, eksemplet «4 × 4 m i 10 cm (terrasse) = 1,76 m³ (1.760 l) / 176» poser, fundamentrækken «8 × 6 m grund, 20 × 50 cm tværsnit» med 3,08 m³ og 308 poser, teksterne «gulvvarmeslangerne … minimum 3 cm», «typisk 2,2–2,4 ton pr. m³» og FAQ-svaret «En 20 kg-pose færdigblandet støbemix giver ca. 10 liter»; link til /beton skal stå på /fliser, /maling, /sand-og-grus og /kvadratmeter og i sitemap.xml. ceo/betonberegner 9/10 02:5x`. Mål på **indhold** med strip-grep (nederst): skal indeholde «Betonberegner», «1,76» og «308». Første vindue **9/10 07:30**.

**Åben 9/10 02:1x:** `VERIFICÉR DEPLOY: /fiber-i-madvarer svarer 200 og viser titlen «Fiber i madvarer: 10,6 g i havregryn, 5,8 g i rugbrød», overskrifterne «Hvor meget fiber er der i …?», «Madvarer med mest fiber pr. 100 g» og «Sådan får du 25 g fiber om dagen», rækkerne «Havregryn, tørrede» (10,6 g) og «Bulgur, tørret» (12,5 g), rækken «Rugbrød» med 5,8 g, teksten «WHO anbefaler voksne mindst 25 g», FAQ-svaret «Havregryn har 10,6 g fiber pr. 100 g», et kort til siden på forsiden og under Sundhed, samt URL i sitemap.xml; beraknare.se skal IKKE have siden (daOnly). ceo/fiber-i-madvarer 9/10 02:1x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/fiber-i-madvarer | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Havregryn», «10,6» og «Bulgur». Første reelle deploy-vindue efter mergen er **9/10 07:30**.

**Åben 9/10 01:4x:** `VERIFICÉR DEPLOY: /salt-i-madvarer svarer 200 og viser titlen «Salt i madvarer: 1,5 g i rugbrød, 1,6 g i smør», rækken «Rugbrød» med 603 mg natrium og 1,5 g salt, «Skinke» (1.500 mg, 3,8 g), «Feta» (1.139 mg, 2,8 g) og formlen «salt i gram = natrium i mg × 2,5 ÷ 1000»; beraknare.se skal IKKE have siden (daOnly). ceo/salt-i-madvarer 9/10 01:4x`. Mål på **indhold** med samme strip-grep: skal indeholde «Rugbrød», «603» og «1,5 g». Første vindue **9/10 07:30**.

**Åben 9/10 00:3x:** `VERIFICÉR DEPLOY: /kalorier-i-alkohol svarer 200 og viser titlen «Kalorier i alkohol: 143 kcal i en øl på 330 ml», rækkerne «Øl, almindelig 330 ml 143 kcal», «Alkoholfri øl 330 ml 122 kcal» og «Spirit, 40 % … 40 ml 87 kcal», teksterne «40 ml sprits er 37,6 g» og «3,21 genstande»; beraknare.se skal IKKE have siden (daOnly). ceo/kalorier-i-alkohol 9/10 00:3x`. Mål på **indhold**: skal indeholde «143 kcal», «37,6 g» og «3,21 genstande». Første vindue **9/10 07:30**.

**Åben 8/10 23:5x:** `VERIFICÉR DEPLOY: /helligdage og /helgdagar svarer begge 200 og viser tabellen for 2026 med «Nytårsdag — 1. januar 2026 — Torsdag», «Grundlovsdag — 5. juni 2026» og summen «I alt 13», teksten «2026 har 13 helligdage. 9 af dem falder på en hverdag», og links til /dage-til/24-december og /dage-til/nytaarsdag. På beraknare.se skal /helgdagar vise «Nyårsdagen — 1 januari 2026» og «16 helgdagar». ceo/helligdage 8/10 23:5x`. Mål på **indhold**: skal indeholde «Nytårsdag», «1. januar 2026» og «13 helligdage». Første vindue **9/10 07:30**.

**Åben 8/10 22:3x:** `VERIFICÉR DEPLOY: /sand-og-grus svarer 200 og viser titlen «Sandberegner: 10 m² i 5 cm = 0,55 m³», rækken «Afretningssand (flisesand)» med «1,6 ton/m³», teksten «Husk komprimeringen»; link til /sand-og-grus skal stå på /fliser, /maling og /kvadratmeter og i sitemap.xml. ceo/sand-og-grus 8/10 22:3x`. Mål på **indhold**: skal indeholde «Sådan regner du mængden ud», «0,55» og «Afretningssand». Første vindue **9/10 07:30**.


**Lukket 9/10 02:1x med DEPLOY OK 9/10** — `/kalorier-i-opskrift` (ceo/kalorier-i-opskrift 8/10 18:3x) er live (200) med titlen «Kalorier i opskrift: carbonara til 4 = 504 kcal pr. portion», «Sådan beregner du kalorier i en opskrift», «Nudler, tørrede» og «Pr. portion». Målt efter 8/10 21:30-vinduet.

**Åben 5/10 17:5x (Sentry):** MINBEREGNER-2 «useLocale must be used within a LocaleProvider» på POST / er rettet ved at wrappe NotFoundSearch i LocaleProvider (ceo/sentry-uselocale-fix 5/10 17:5x). Kun Sentrys hændelsestæller afgør, om den er væk (2 hændelser / 0 brugere på 14 dage) — læs den 14/10.

⚠️ **Læs tal på strippet HTML, ikke rå markup.** Next leverer HTML'en som én linje, og der står et tag mellem tal og enhed. Strip med `curl -s URL | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` og grep på teksten. Interpolerede tal skrives som `1.515<!-- --> skridt` — tjek tal og enhed hver for sig.

## ❓ Til Mads

- ❓ **IndexNow mangler to env-værdier.** `INDEXNOW_ENABLED=true` og `INDEXNOW_API_KEY=<8-128 tegn>` skal sættes i Dokploys miljøvariabler — nøglen må ikke i en commit.
- ❓ **Sentry MINBEREGNER-2 — ét skærmbillede af hændelsen** (transactions + request headers + de to ssr-chunks) ville sige hvilken komponent der mangler kontekst. Undersøgt og ikke reproduceret.
- ❓ **Kogetider og fødevaredata** — den 2. største søgning på `/tidsberegner`. `frbs.foodsearch.lex.dk` og `www.sst.dk` er uafgængelige fra maskinen. Ét skærmbillede af en fødevaredatabase-tabel låser både kogetider og kalorieportioner.
- ❓ **Kvadratmeterpris pr. kommune** — én kilde pr. kommune er for mange; kun de 5-10 største byer er realistiske.
- ❓ **Hvor deployes den norske udgave?** `beregner.no` serverer et helt andet site; dette repos `no`-locale er i `hiddenDomains`. Skal `beregner.no` servere denne app?
- ❓ **Ferieåret er ikke længere 1. september – 31. december.** `page-data.ts` og `/feriepenge` siger de gamle regler. Ét skærmbillede af ferielovens § 7 låser det. Koden bevidst urørt.
- ❓ **Feriedatoer uden lovkilde** — vinterferie/påskeferie/efterårsferie. Ét skærmbillede fra en kommunes ferieplan 2026/2027 (helst to kommuner) låser dem.
- ❓ **Øresundsbroens prisliste** — `oresundsbroen.dk` svarer ingen forbindelse fra maskinen. Ét skærmbillede af prislisten for 2026 låser den anden store bro på `/brokost`.
- ❓ **Søgningseksport fra Search Console** — ét skærmbillede af Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største søgninger for hele domænet.
- ❓ **`auto/union-night` har unikt arbejde, der aldrig er landet** (17/9): `BACKLOG.md`, `docs/kommercielt-inventar.md`, `docs/timepris-nichetest.md`. Skal de merges, eller er de forældede? Må ikke slettes uden svar.
- ❓ **Momslovgrænserne på `/moms`** og **promillegrænser i Tyskland/Norge/Italien** — ét skærmbillede af ML § 48 og ét af de udenlandske grænser.
- ❓ **To skanner-rækker uden fejl i koden** (5/10 21:2x): `src/app/procent/page.tsx:633` og 20 linjer i `src/app/promille/page.tsx`. Kræver en stopordsliste der skelner mellem sprog, eller en allowlist-fil.
- ❓ **Repoet har intet Playwright**, så UI-opgaver kan ikke få skærmbilleder.
