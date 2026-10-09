STATUS: 10/9 16:0x. ✅ **`/hjerterytme` — hjerterytmeberegner: max puls og fem træningszoner.** Datagrund: dansk autocomplete (10/9) har «hjerterytme beregner», «puls beregner», «hvor høj puls skal være», «træningszoner puls». Sitet har `/motion-kalorier` og `/pace` men intet sted der siger, hvilken puls man skal have i hver zone. Formler: max puls = 208 − 0,7 × alder (Tanaka et al. 2001), zoner 50-60/60-70/70-80/80-90/90-100 % af max. Valgfri hvilepuls aktiverer Karvonen-formlen (HRR). 10 tests i `hjerterytme.test.ts`. DaOnly (`daOnly: true` i calculator-list). **Merges til master ceo/hjerterytme 9/10 16:0x — første deploy-vindue 17:30, se VERIFICÉR-note nedenfor.** **MÅL: /hjerterytme baseline 0 Plausible/GSC pr. 10/9** — måles igen ~23/10. Gate: typecheck 0, lint 0 (973 filer), 5470 tests grønne, build grøn. SSR (lokal prod-build): 200 med «Hjerterytme beregner: Max puls og 5 træningszoner», «Tanaka», «Karvonen», zone-tabellen 90–108 / 108–126 / 126–144 / 144–162 / 162–180 (maks 180, zone 5 fra 162) og de fem FAQ'er.
STATUS: 10/9 14:5x. ✅ **`/blog/rentefradrag-2026-satser-og-regler` — blogindlæg om rentefradrag 2026, der fører til beregneren.** Datagrund: `/rentefradrag` er en af sitets stærkste kilder — Plausible 465 besøgende/28d (+172 %), GSC 6.435 visninger, 5,6 % CTR på pos. 5,4, og søgningen «rentefradrag 2026» har 512 visninger på pos. 2. Indlægget svarer på spørgsmålet om satsen: 33,6 % af de første 50.000 kr. (100.000 kr. for par med fælles økonomi) og 25,6 % af beløbet derover, med eksemplet 80.000 kr. (enlig 24.480 kr., par 26.880 kr. — forskellen på at fordele er 2.400 kr.), en liste over hvilke lån der gælder (realkredit, banklån, forbrugslån, studielån, sommerhus) og hvordan fradraget kommer med via bankens automatiske indberetning. Alle tal læses af `beregnRentefradrag` og `RENTEFRADRAG_2026`, så ingen beløb kan stå i modstrid med beregneren. Kilde: skat.dk og borgerhaandbog.dk (verificeret 9/10 som `verifiedAt 2026-09-25`). Koblet til `/rentefradrag` begge veje via `blog-kobling.ts` og `RelateredeArtikler`. DaOnly. **MÅL: /blog/rentefradrag-2026-satser-og-regler baseline 0 Plausible/GSC pr. 10/9** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 14:2x. ✅ **`/pensionsalder` — beregn din folkepensionsalder ud fra din fødselsdato.** Datagrund: Google-autocomplete (hl=da, 9/10) har «pensionsalder beregner», «pensionsalder danmark beregner» og «pensionsalder født 1964/1966/1967/1968» — søgninger formuleret pr. fødselsårgang, som kun en kohort-tabel svarer på; sitet havde `/pension` (satser) og `/efterloen` (ydelse), men intet sted der siger *hvornår* man kan gå på. Skemaet er Udbetaling Danmarks eget fra borger.dk «Se din folkepensionsalder» (verificeret 9/10 13:5x): otte kohorter fra 31. dec. 1953 (65 år) til 1. jan. 1971 (70 år), med 65 ½ og 66 ½ som halvårskohorter i 1954 og 1955. Udover alderen regner værktøjet den første udbetalingsdag: folkepension udbetales fra **1. i den måned, du fylder alderen** (borger.dk, «Når du er på folkepension»). Tidlig pensions anciennitetskrav (42-44 år, op til 3 år før) står i brødtekst og FAQ efter borger.dk — men beregnes ikke. Skuddage regnes som 28. februar, halve år som seks måneder. 21 nye tests i `pensionsalder.test.ts`; muteret mod brudt aritmetik (6-måneders-reglen og 29. februar-regningen) giver 2 røde, så testene holder. DaOnly. **MÅL: /pensionsalder baseline 0 Plausible/GSC pr. 9/10** — måles igen ca. 23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 11:2x. ✅ **`/blog/boernebidrag-2026-satser-og-regler` — blogindlæg om børnebidrag 2026, der fører til den nye beregner.** Datagrund: dansk autocomplete (hl=da, 9/10) har 10/10 træffere under «børnebidrag sats 2026», «børnebidrag 2026» og «hvor meget skal man betale i børnebidrag 2026», og søsterartiklen `/blog/boernepenge-2026-satser-og-regler` har 4.940 GSC-visninger pr. 28 dage. Indlægget svarer på de tre største søgninger: normalbidraget (1.675 kr./md), regnestykket bag forhøjet bidrag (procenttillægget regnes af grundbeløbet på 1.483 kr. — ikke af 1.675 kr.) og skattefradraget (1.483 kr./md, ca. 27 % værdi). Alle tal læses af `boernebidrag.ts`, så indlæg, tabeller, FAQ og metadata ikke kan stå med andre beløb end beregneren på `/boernebidrag` (som fik sin «Guides om emnet»-blok og link tilbage i samme commit). Kilde: familieretshuset.dk, retsinformation.dk (indkomstoversigten) og skat.dk, alle med `verifiedAt 2026-10-09`. **MÅL: /blog/boernebidrag-2026-satser-og-regler baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 9/10 09:4x. ✅ **`/kvadratmeter` — gamle danske arealenheder: tønde land og kvadratalen.** Datagrund: dansk autocomplete (hl=da, 9/10) har «tønder land til hektar», «tønder land til m2», «hektar til tønder» og «kvadratalen til kvadratmeter», og sitet havde enhederne slet ikke — arealomregneren kunne kun m², cm², km², hektar, kvadratfod og acre. Enhederne blev afskaffet ved metersystemet i 1907 og regnes fra alen: foden er 0,3138535 m i loven af 4. maj 1907, så én alen er 0,627707 m og én kvadratalen 0,3940 m²; en tønde land er 14.000 kvadratalen = 5.516,23 m². Kilde: Teknisk Kulturarvs metertabeller, Wikipedia «Tønde land», jomark.dk (verificeret 9/10). De to enheder vises kun på dansk (`danskKun`), så beraknare.se beholder sine seks. Ny tabel, tre FAQ-svar og `areal-omregner`-konstanter. **MÅL: /kvadratmeter baseline 359 besøgende/28d pr. 9/10 (Plausible), GSC 21.607 visninger, 1,4 % CTR, pos. 4,9** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
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
**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build` på kodeændringer). Seneste: 9/10 02:5x: typecheck 0, lint 0 (954 filer), **5.391 tests i 323 filer grønne**, `next build` grøn med både `/fiber-i-madvarer` og `/beton` i ruteoversigten; `/beton` svarede 200 lokalt med «Betonberegner: 4 × 4 m i 10 cm = 1,76 m³ (176 poser à 20 kg)», «1,32 m³», «132 poser», «3,08 m³» og «308» i SSR, og sitemap.xml indeholder `/beton`; `Host: beraknare.se` gav 404 på `/beton` (daOnly). Mutation målt: `fiber100g` for havregryn 10,6→0 giver 4 røde i `fiber-i-madvarer.test.ts`, og `poser20kg` uden `Math.ceil` giver 1 rød i `beton.test.ts`. 9/10 06:3x: `isolation.ts`' `rIsolering` sat til `0` giver 12 røde i `isolation.test.ts`, og `RSI` for «opad» sat til 0,20 giver 2 røde. Ældre målinger i `docs/plan-arkiv.md`. 9/10 09:4x: typecheck 0, lint 0 (962 filer), **5.437 tests i 325 filer grønne**, `next build` grøn; `/kvadratmeter` SSR indeholder «5.516,23», «0,394», «Tønde land» og «14.000», og `Host: beraknare.se` indeholder hverken tønde-land-sektionen eller «Tønde land». Nye tests fejler uden ændringen (enhederne fandtes ikke, og `synligeArealEnheder` findes ikke). 9/10 11:2x: typecheck 0, lint 0 (963 filer), **5.438 tests i 325 filer grønne**, `next build` grøn med `/blog/boernebidrag-2026-satser-og-regler` i ruteoversigten; SSR på lokal prod-build: 200 med titlen «Børnebidrag 2026: 1.675 kr. pr. måned og forhøjet bidrag», rækkerne «1.483», «192», «3.158», «600.000», «1.600.000», «400 kr.», «4.800», «3.350» og «192 kr. mere», samt «Skattestyrelsen» (ikke SKAT); `/boernebidrag` viser «Guides om emnet» med indlægget, og `/sitemap.xml` indeholder den nye URL. Build-warnings er de syv forudeksisterende CSS-Parsing-advarsler i `globals.css`. 9/10 14:0x: typecheck 0, lint 0 (968 filer), **5.457 tests i 326 filer grønne**, `next build` grøn; `/pensionsalder` SSR indeholder «Beregn din folkepensionsalder», «68 år», «1967», «1. januar 1971» og «15. marts 2037», WebApplication- + FAQPage-JSON-LD, kohort-tabellen og blog-linket fra pension-indlægget; `Host: beraknare.se` giver 404 (daOnly), `/sitemap.xml` indeholder URL'en, og forsiden viser kortet. Nye tests fejler uden ændringen: mutation i halvårs- og skuddagsregningen giver 2 røde i `pensionsalder.test.ts`.

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

**BÖRNEINDLÆG [x] FÆRDIG 9/10 11:2x** — `/blog/boernebidrag-2026-satser-og-regler` (ceo/boernebidrag-indlaeg), koblet til `/boernebidrag` begge veje. Detaljer i `docs/plan-arkiv.md`.

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

- **[ ] `/kaloriebehov` — hvor mange kalorier skal jeg have for at tabe/holde/bygge?** (9/10: spørgsmålet er beskrevet i blogindlægget `hvor-mange-kalorier-skal-jeg-have`; en egen side afventer stadig en kilde til behov pr. mål.) Dansk autocomplete (8/10): «hvor mange kalorier skal jeg have for at tabe mig / holde vægten / bygge muskler» 10/10. Sitet har `/kalorier` med kaloriebehov. ⛔ kræver en kilde til kaloriebehov pr. mål (❓).
- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» (da), «bmi barn tabell» (se). WHO's BMI-for-alder-tabeller er ~150 tal pr. køn. ⛔ ét skærmbillede af WHO's tabel (fejltransskription værre end ingen side).
- **[ ] Kogetider** — GSCs 2. største søgning på `/tidsberegner` er «hvor lang tid» (824 visninger, pos. 6,8), og 10/10 danske completioner er madvarer med koge-/bagetid. ⛔ `frbs.foodsearch.lex.dk` og `sst.dk` er uafgængelige (❓).
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89 sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af 10 træffere under «kvadratmeter»; 98 kommuner i `kommuner.ts`, men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).
- **[x] FÆRDIG 9/10 16:0x — `/hjerterytme` — hjerterytmezoner: max puls og 5 træningszoner** (ceo/hjerterytme). Tanaka 208 − 0,7 × alder, zoner 50-100 %, valgfri Karvonen (HRR). 10 tests, DaOnly. Detaljer i STATUS øverst.

## VERIFICÉR DEPLOY-noter

**Åben 9/10 16:0x:** `VERIFICÉR DEPLOY: /hjerterytme svarer 200 og viser titlen «Hjerterytme beregner: Max puls og 5 træningszoner», «Tanaka», «Karvonen», zone-tabellen (90–108, 108–126, 126–144, 144–162, 162–180 slag/min) og de fem FAQ-svar; /hjerterytme skal stå i sitemap.xml, og beraknare.se skal IKKE have siden (daOnly, 404). ceo/hjerterytme 9/10 16:0x`. Mål på indhold med strip-grep: skal indeholde «Hjerterytme beregner», «Tanaka» og «Karvonen». Første vindue efter mergen: **9/10 17:30**.

**RETTELSE 10/9 16:0x — DEPLOY-MISSING 10/9 15:1x var for tidlig.** `/blog/hvor-mange-kalorier-skal-jeg-have` (merged 12:51) og `/pensionsalder` (merged 14:11) har ALDRIG haft et deploy-vindue: 12:30-vinduet kørte FØR begge merges (det bragte børnebidrag-indlægget fra 11:26 live). Begge afventer dagens 17:30-vindue — noterne nedenfor holder. DEPLOY-MISSING skrives først, når et vindue EFTER merge-tidspunktet er gået uden at ændringen er live.

**Lukket 9/10 13:0x med DEPLOY OK 9/10** — 12:30-vinduet bragte fire ændringer live, målt på indhold:
- `/boernebidrag` (7adb3d7) svarer 200 og `/sitemap.xml` har 214 URL'er.
- `/blog/boernebidrag-2026-satser-og-regler` (ceo/boernebidrag-indlaeg 9/10 11:2x) svarer 200.
- `/kvadratmeter` (17a3dd3) viser «Tønde land», «5.516», «Kvadratalen» og «0,394».
- beraknare.se `/helgdagar` (a6980bf) viser «19 juni» og «Rörligt datum» og ikke længere «27 juni».

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/isolation` (ceo/isolation 9/10 06:5x) er live (200) med «Stenuld», «17,98» og «BR18» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/beton` (ceo/betonberegner 9/10 02:5x) er live (200) with «Betonberegner», «1,76» og «308» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/fiber-i-madvarer` (ceo/fiber-i-madvarer 9/10 02:1x) er live (200) med «Havregryn», «10,6» og «Bulgur» i indholdet.

**Lukket 10/10 10:1x with DEPLOY OK 10/10** — `/salt-i-madvarer` (ceo/salt-i-madvarer 9/10 01:4x) er live (200) med «Rugbrød», «603» og «1,5 g» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/kalorier-i-alkohol` (ceo/kalorier-i-alkohol 9/10 00:3x) er live (200) med «143 kcal», «37,6 g» og «3,21 genstande» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/helligdage` (ceo/helligdage 8/10 23:5x) er live (200) med «Nytårsdag», «1. januar 2026» og «13 helligdage» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/sand-og-grus` (ceo/sand-og-grus 8/10 22:3x) er live (200) med «Sådan regner du mængden ud», «0,55» og «Afretningssand» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/kalorier-i-opskrift` (ceo/kalorier-i-opskrift 8/10 18:3x) er live (200) med «Kalorier i opskrift», «carbonara» og «Pr. portion» i indholdet.

**Lukket 10/10 10:1x med DEPLOY OK 10/10** — `/helgdagar` på beraknare.se (ceo/helgdagar-midsommar 9/10 09:0x) er live med «Nyårsdagen» og «16 helgdagar» i indholdet.

**Lukket 9/10 13:0x med DEPLOY OK 9/10** — `/blog/boernebidrag-2026-satser-og-regler` (ceo/boernebidrag-indlaeg 9/10 11:2x) er live (200) med titlen «Børnebidrag 2026…», rækkerne «1.483», «3.158» og «1.675» i indholdet; `/boernebidrag` viser «Guides om emnet» med linket til indlægget, og begge URL'er står i sitemap.xml (214 URL'er). beraknare.se har intet af dem (404, daOnly).









**Lukket 9/10 02:1x med DEPLOY OK 9/10** — `/kalorier-i-opskrift` (ceo/kalorier-i-opskrift 8/10 18:3x) er live (200) med titlen «Kalorier i opskrift: carbonara til 4 = 504 kcal pr. portion», «Sådan beregner du kalorier i en opskrift», «Nudler, tørrede» og «Pr. portion». Målt efter 8/10 21:30-vinduet.

**Åben 5/10 17:5x (Sentry):** MINBEREGNER-2 «useLocale must be used within a LocaleProvider» på POST / er rettet ved at wrappe NotFoundSearch i LocaleProvider (ceo/sentry-uselocale-fix 5/10 17:5x). Kun Sentrys hændelsestæller afgør, om den er væk (2 hændelser / 0 brugere på 14 dage) — læs den 14/10.

⚠️ **Læs tal på strippet HTML, ikke rå markup.** Next leverer HTML'en som én linje, og der står et tag mellem tal og enhed. Strip med `curl -s URL | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` og grep på teksten. Interpolerede tal skrives som `1.515<!-- --> skridt` — tjek tal og enhed hver for sig.

**Åben 9/10 12:5x:** `VERIFICÉR DEPLOY: /blog/hvor-mange-kalorier-skal-jeg-have svarer 200 og viser titlen «Hvor mange kalorier skal jeg have? 2.759 kcal om dagen», overskrifterne «Kort svar», «De to tal, der bestemmer dit behov», «Sådan regner du ud, hvad du skal spise for at tabe dig», «Hvor langt ned må du gå?» og «Protein, når kalorierne falder», aktivitetstabellen med 1,2/1,375/1,55/1,725/1,9, regnestykket «10 × 80 + 6,25 × 180 − 5 × 30 + 5 = 1.780 kcal», målet «2.759 − 500 = 2.259 kcal», kgPrUgeRegnet «0,45», vægtabseksemplet «46.200 kcal» «550 kcal» «2.209 kcal», protein «96-128 g», FAQ'en og knappen «Beregn dit kaloriebehov»; /kalorier skal vise «Guides om emnet» med linket til indlægget; begge nye URL'er skal stå i sitemap.xml, og beraknare.se skal IKKE have indlægget (daOnly). ceo/kalorieblog 9/10 12:5x`. Mål på indhold med strip-grep: skal indeholde «Hvor mange kalorier», «2.759» og «2.259». Første reelle vindue efter mergen: **9/10 17:30**.

**Åben 9/10 14:2x:** `VERIFICÉR DEPLOY: /pensionsalder svarer 200 og viser titlen «Pensionsalder beregner: født i 1968 giver 69 år», h1 «Beregn din folkepensionsalder», kohort-tabellen med «1. januar 1971 eller senere»/«70 år» og «1. juli 1955 – 31. december 1962»/«67 år», udbetalingsafsnittet med «15. marts 2037», de seks FAQ-svar, kildelinket til borger.dk, kortet på forsiden og URL'en i sitemap.xml; beraknare.se skal IKKE have siden (daOnly, 404). ceo/pensionsalder 9/10 14:2x`. Mål på indhold med strip-grep: skal indeholde «Beregn din folkepensionsalder», «15. marts 2037» og «70 år». Første vindue efter mergen: **9/10 17:30**.

**Åben 10/9 14:5x:** `VERIFICÉR DEPLOY: /blog/rentefradrag-2026-satser-og-regler svarer 200 og viser titlen «Rentefradrag 2026: 33,6 % af renterne op til 50.000 kr.», sats-tabellen med «33,6 %»/«25,6 %» og grænsen «100.000 kr.» for par, eksempeltabellen med «24.480» (enlig) og «26.880» (par), afsnittet om hvilke lån der gælder, de seks FAQ-svar, knappen «Beregn dit rentefradrag» og URL'en i sitemap.xml; beraknare.se skal IKKE have indlægget (daOnly, 404). ceo/rentefradrag-blog 10/9 14:5x`. Mål på indhold med strip-grep: skal indeholde «33,6 %», «24.480» og «26.880». Første vindue efter mergen: **10/9 17:30**.

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
