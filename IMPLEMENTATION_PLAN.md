STATUS: 9/10 01:4x. ✅ **`/salt-i-madvarer` — natrium pr. 100 g i 53 madvarer, omregnet til salt.** Datagrund: dansk autocomplete (hl=da, 9/10 01:1x) har «hvor meget salt er der i rugbrød», «… i smør» og «… i en bouillonterning» blandt de første ti forslag under «hvor meget salt er der i» (øvrige forslag er hav og søer). Sitets fem «i madvarer»-sider svarede på kalorier, protein, kulhydrat, fedt og sukker, men ikke på saltindholdet. Alle 53 natriumtal er USDA FoodData Central, *SR Legacy* 2018-04, næringsstof 1058 (Sodium, Na), hver med `fdcId`; salt regnes ud med faktoren 2,5 (23 g natrium i et 58,5 g NaCl-molekyle), så 603 mg i rugbrød bliver 1,5 g salt. Kolonnerne «Salt», «Gram for 5 g salt» og «Andel af 5 g» er alle regnet af samme tabel, og FAQ, brødtekst og metadata læser `salt-i-madvarer.ts`, så ingen sætning skriver et tal selv. WHO's anbefaling (under 2.000 mg natrium = under 5 g salt om dagen, faktablad opdateret 11. maj 2026) er den eneste ydre værdi på siden. Dansk (daOnly). **MÅL: /salt-i-madvarer baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor. Fem ældre noter (kalorier-i-alkohol, helligdage, sand-og-grus, sukker-i-madvarer, kalorier-i-opskrift) står stadig åbne — de er merg EFTER 8/10 21:30, så første reelle deploy-vindue er 9/10 07:30.
STATUS: 9/10 00:3x. ✅ **`/kalorier-i-alkohol` — kcal i øl, vin, cider og sprits, med en hel aften der lægges sammen.** Datagrund: dansk autocomplete (hl=da, 9/10) har «hvor mange kalorier er der i en øl», «kalorier i alkoholfri øl/vin/gin/rødvin/hvidvin/rosevin», «kalorier i alkohol tabell», «hvor mange kalorier i 1/3/10 øl», «en flaske øl», «en alm øl» og «et glas vin» — 10 af 10 træffere i tre rødder, og GSC viser 7.743 visninger på `/promille` (1,5 % CTR, pos. 7,8). Sitets promille- og alkoholenhedsberegnere talte om gram og promille, men ingen side svarede på kalorierne. 11 drikke fra **USDA FoodData Central, SR Legacy 2018-04** (csv hentet fra fdc.nal.usda.gov, `fdcId` pr. række): øl almindelig 143 kcal, let øl 95, stærk øl 198, cider 185, alkoholfri øl 122, rødvin 101, hvidvin 98, rosé 102, spirit 87, whisky 94, sødvin 96. Vægten pr. servering er **kildens egen portionvægt** (1 fl oz = 29,5735 ml), så et shot vurderes til 37,6 g og ikke 40 g — uden det ville hvert shot være 6 % for stort. Serveringerne (33 cl øl, 12 cl vin, 4 cl sprits) er de samme `/alkoholenheder` bruger, så de to sider ikke kan blive uenige om, hvad et glas er. Værktøjet lægger kcal, gram alkohol og genstande (12 g pr. genstand) sammen; tabellen, brødteksten, FAQ’en og metadata læser alle `kalorier-i-alkohol.ts`, så ingen sætning skriver et tal selv. Dansk (daOnly). **MÅL: /kalorier-i-alkohol baseline 0 Plausible/GSC pr. 9/10** — måles igen ~23/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 8/10 23:5x. ✅ **`/helligdage` og `/helgdagar` — alle helligdage med dato, ugedag, om de falder på en hverdag, og hvor mange dage der er til de næste.** Datagrund: dansk autocomplete (hl=da, 8/10 23:2x) har «helligdage 2026», «helligdage 2027», «hvilke helligdage er der i 2026», «hvilke dage er helligdage i 2026», «faste helligdage» og «hvor mange helligdage er der i danmark» blandt ti træffere for næsten hvert «helligdage»-forslag; svensk har «helgdagar 2026»/«helgdagar 2027». Sitets egen kalender (`src/lib/helligdage.ts`) regnede allerede hver dato — `/dato`, `/arbejdsdage` og `/dage-til/*` brugte den — men ingen side viste listen. Nye funktioner i `helligdage.ts` (`helligdagRaekker`, `helligdagAntal`, `naesteHelligdage`, `HELLIGDAG_PATH`) samler årets helligdage til tabelrækker med ugedag (af `ugedag.ts`), datoformat (af `formatDatoTekst`), «fast dato» mod «følger påsken», om dagen giver ekstra fri, og link videre til den tilsvarende `/dage-til/<slug>`-side (testen har forpligtet sig til at finde hvert link). To route-filer over én komponent, 301 mellem domænerne, `force-dynamic`, i sitemap som `daily`, og indgående link fra `/arbejdsdage` på begge domæner. Dansk og svensk (daOnly er opgivet her, fordi Sverige har egen helligdagsliste). **MÅL: /helligdage + /helgdagar baseline 0 Plausible/GSC pr. 8/10** — måles igen ~22/10. Se VERIFICÉR DEPLOY-note nedenfor.
STATUS: 8/10 22:3x. ✅ **`/sand-og-grus` — beregn m³ og ton sand, grus eller bundsikring for et areal.** Datagrund: dansk autocomplete (hl=da, 8/10) har 10/10 træffere under «hvor meget sand skal jeg bruge» (til fliser, sandkasse) og «hvor meget grus skal jeg bruge» (til fliser, indkørsel); sitet havde fliser, maling og kvadratmeter, men intet sted selve materialemængden. Værktøjet regner `volumen = areal × lagtykkelse` og `vægt = volumen × densitet`, med materialevalg (afretningssand, stabilgrus, bundsikring), redigerbar lagtykkelse og spild. Lagtykkelser og densiteter er danske leverandørers anbefalinger (sandshoppen.dk, havehandel.dk, materialeberegner.dk, verificeret 8/10); tabel, FAQ, metadata og brødtekst læser alle `sand-og-grus.ts`, så ingen tal står i en sætning uden at stå i beregningen. Dansk (daOnly). **MÅL: /sand-og-grus baseline 0 Plausible/GSC pr. 8/10** — måles igen ~22/10. Se VERIFICÉR DEPLOY-note nedenfor.
**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build` på kodeændringer). Seneste målinger (ældre i `docs/plan-arkiv.md`): 7/10 02:1x: typecheck 0, lint 0 (834 filer), **4.841 tests i 293 filer grønne**, `next build` grøn med `/gaveafgift` i ruteoversigten. Mutation målt: `beregnGaveafgift` uden bundfradraget i grundlaget giver **8 røde** i `gaveafgift.test.ts`. 7/10 02:5x: typecheck 0, lint 0 (838 filer), **4.860 tests i 294 filer grønne**, `next build` grøn med `/maling` i ruteoversigten, og `/maling` svarede 200 lokalt med «45 m² væg» og «10 liter» i SSR. Mutation målt: `beregnMalingLiter` uden `× stroeg` giver **4 røde** i `maling.test.ts`. 7/10 04:0x: typecheck 0, lint 0 (843 filer), **4.872 tests i 295 filer grønne**, `next build` grøn med `/laanekapacitet` i ruteoversigten, og `/laanekapacitet` svarede 200 lokalt med «Du kan købe bolig for op til» og «2.105.263 kr.» i SSR. Mutation målt: `maksPrisEfterGaeldsfaktor` uden `÷ (1 − 5 %)` giver **1 rød** i `laanekapacitet.test.ts`. 7/10 04:3x: typecheck 0, lint 0 (847 filer), **4.888 tests i 296 filer grønne**, `next build` grøn med `/tv-storrelse` i ruteoversigten, og `/tv-storrelse` svarede 200 lokalt med «121,8 × 68,5 cm» og «139,7 cm» i SSR. Mutation målt: `beregnSkarmMaal` der altid bruger 16:9 i stedet for det valgte format giver **2 røde** i `skaermstorrelse.test.ts`. 7/10 08:5x: typecheck 0, lint 0 (851 filer), **4.899 tests i 297 filer grønne**, `next build` grøn med `/elbil-lading` i ruteoversigten, og `/elbil-lading` svarede 200 lokalt med «Batterikapacitet (kWh)» og «90 kr.» i SSR (svensk via `Host: beraknare.se`: «Så räknar du ut laddkostnaden» og «72 kr.»). Mutation målt: `beregnElbilLading` uden `× elpris` giver **4 røde** i `elbil-lading.test.ts`. 7/10 12:3x: typecheck 0, lint 0 (855 filer), **4.911 tests i 298 filer grønne**, `next build` grøn med `/kirkeskat` i ruteoversigten, og `/kirkeskat` svarede 200 lokalt med «1.980 kr.», «0,44 %» og «ganget med» i SSR (sitemap indeholder `/kirkeskat`). Mutation målt: `kirkeskatSats` uden `× 100` på snittet giver **1 rød** i `kirkeskat.test.ts` (ukendt kommune får 0,00639 i stedet for 0,639 %). 7/10 13:1x: typecheck 0, lint 0 (859 filer), **4.942 tests i 299 filer grønne**, `next build` grøn med `/areal` i ruteoversigten, og `/areal` svarede 200 lokalt med «Formlerne for de syv figurer», «π × (d ÷ 2)²» og «Samme areal i cm²» i SSR (svensk via `Host: beraknare.se`: «Areaberäknare» og «trapets med sidor 2 och 4 m»). Mutation målt: `areal` der læser diameteren som radius giver **5 røde** i `areal.test.ts`. 7/10 16:3x: typecheck 0, lint 0 (863 filer), **4.972 tests i 300 filer grønne**, `next build` grøn med `/hundealder` i ruteoversigten, og `/hundealder` svarede 200 lokalt med «Hundeår til menneskeår: 7 år = 49 (mellemstor)», «15 + 9 + 5 × 5 = 49» og «Menneskeår» i SSR (svensk via `Host: beraknare.se`: «Hundår till människoår: 7 år = 49 (mellanstor)» og tabellen «10 år 56 64 72 80»). Mutation målt: `HUNDE_STORRELSER.kaempe.aarEfterTo` 7→6 giver **2 røde** i `hundealder.test.ts`. PR-TJEK 6/10 06:5x (ingen åbne PR'er). BRANCH-TJEK 4/10. Åbne målinger: /procent-rabat 20/10; /fart-titler 20/10; /rentefradrag + /boligstoette titler 17/10; Sentry MINBEREGNER-2-tæller 14/10. 7/10 20:3x: typecheck 0, lint 0 (867 filer), **4.981 tests i 301 filer grønne**, `next build` grøn med `/byggepris` i ruteoversigten, og `/byggepris` svarede 200 lokalt med «2.250.000-3.000.000 kr.» og «Så mange kroner til et givent areal» i SSR. Mutation målt: `beregnByggepris` uden `Number.isFinite`- og `> 0`-værnet giver **2 røde** i `byggepris.test.ts`. 8/10 03:3x: typecheck 0, lint 0 (887 filer), **5.105 tests i 306 filer grønne**, `next build` grøn med `/fliser` i ruteoversigten, og `/fliser` svarede 200 lokalt med «Fliseberegner: 12 m² i 60x60 = 37 fliser» og «10 kasser» i SSR. Mutation målt: `beregnFliser` uden `× (1 + spild/100)` giver **4 røde** i `fliser.test.ts`. 8/10 07:5x: typecheck 0, lint 0 (910 filer), **5.215 tests i 312 filer grønne**, `next build` grøn med `/protein-i-madvarer` i ruteoversigten, og `/protein-i-madvarer` svarede 200 lokalt med «Protein i madvarer: æg 12,6 g, kylling 21,4 g pr. 100 g», «Gram for 20 g» og «12,6 g» i SSR (404 på beraknare.se, daOnly; sitemap indeholder `/protein-i-madvarer`), og `/proteinbehov` viste «21,4 g» og «proteinindholdet i 53 madvarer». Mutation målt: `proteinPer100Kcal` uden `÷ kcal100g` giver **1 rød** i `protein-i-madvarer.test.ts`. 8/10 22:2x: typecheck 0, lint 0 (934 filer), **5.314 tests i 318 filer grønne**, `next build` grøn med `/sand-og-grus` i ruteoversigten, og `/sand-og-grus` svarede 200 lokalt med «Sandberegner: 10 m² i 5 cm = 0,55 m³», «Sådan regner du mængden ud» og «Afretningssand (flisesand)» i SSR. Mutation målt: `beregnGrus` uden `× densitet` giver **2 røde** i `sand-og-grus.test.ts` (vægt- og eksempel-testen). 8/10 23:5x: typecheck 0, lint 0 (938 filer), **5.333 tests i 319 filer grønne**, `next build` grøn med `/helligdage` og `/helgdagar` i ruteoversigten.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` før Forskel-tilstanden (6/10) | under top-15 | **149.929** | **0,1 %** | **7,5** |
| se `/procent` før Forskel-tilstanden (6/10) | under top-15 | 30.298 | 0,0 % | 9,7 |
| `/procent` | under top-15 | 150.470 | 0,1 % | 7,4 |
| `/dato` | 1.133 | 133.054 | 0,6 % | 5,7 |
| `/tidsberegner` (6/10, før Plus-tidsværktøjet) | **260** | **78.615** | **0,3 %** | **6,7** |
| se `/tidsberegner` | 179 | 75.244 | 0,2 % | 7,7 |
| `/tidszone` | under top-15 | 24.324 | 0,4 % | 7,5 |
| `/moms` | under top-15 | 22.464 | 0,2 % | 7,0 |
| `/moms` før Importmoms-værktøjet (7/10) | under top-15 | **22.464** | **0,2 %** | **7,0** |
| `/kvadratmeter` | 391 | 20.768 | 1,5 % | 4,9 |
| `/kvadratmeter` før arealværktøjet (6/10) | **393 (+96 %)** | 21.403 | 1,5 % | 4,9 |
| `/braendstof` | 263 | 17.051 | 1,1 % | 5,9 |
| `/braendstof` før Forbrugsomregneren (6/10) | **252 (+56 %)** | 16.898 | 1,0 % | 6,0 |
| `/alder` | under top-15 | 10.029 | 0,4 % | 7,2 |
| `/renteberegner` | under top-15 | 12.610 | 0,8 % | 7,4 |
| `/procent` før Rabat-tilstanden (6/10) | under top-15 | **149.929** | **0,1 %** | **7,5** |
| `/fart` før Hastighedsomregneren (6/10) | under top-15 | **5.288** | **0,6 %** | **6,9** |
| `/rentefradrag` | under top-15 | 5.082 | 5,8 % | 5,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
| `/boligstoette` | 529 | 7.465 | 2,4 % | 8,7 |
| `/su` | **127 (fald fra 201)** | under top-15 | — | — |
| `/` (forside) | **213, bounce 40 %** | under top-15 | — | — |
| `/klokken-i/*` (6/10, 7 nye landesider pr. domæne) | **0** | — | — | — |
| `/tidszone` | under top-15 | 24.829 | 0,4 % | 7,7 |
| `/ugedag` + `/veckodag` (6/10, nye URL'er) | **0** | — | — | — |
| `/rumfang` (6/10, ny) | **0** | — | — | — |
| `/areal` (7/10, ny) | **0** | — | — | — |
| `/omkreds` (7/10, ny) | **0** | — | — | — |
| `/retvinklet-trekant` (7/10, ny) | **0** | — | — | — |
| `/fliser` (8/10, ny) | **0** | — | — | — |
| `/arbejdsdage` (8/10, ny) | **0** | — | — | — |
| `/uger-i-aret` (8/10, ny) | **0** | — | — | — |
| `/veckor-i-aret` (8/10, ny) | **0** | — | — | — |
| `/gram-til-dl` (8/10, ny) | **0** | — | — | — |
| `/portioner` (8/10, ny) | **0** | — | — | — |
| `/protein-i-madvarer` (8/10, ny) | **0** | — | — | — |
| `/kulhydrater-i-madvarer` (8/10, ny) | **0** | — | — | — |
| `/fedt-i-madvarer` (8/10, ny) | **0** | — | — | — |
| `/sand-og-grus` (8/10, ny) | **0** | — | — | — |
| `/salt-i-madvarer` (9/10, ny) | **0** | — | — | — |
| `/salt-i-madvarer` (9/10, ny) | **0** | — | — | — |
| `/helligdage` + `/helgdagar` (8/10, nye) | **0** | — | — | — |
| `/laantype` (6/10, ny) | **0** | — | — | — |
| `/brokost` (6/10, ny) | **0** | — | — | — |
| `/nutidskroner` (7/10, ny) | **0** | — | — | — |
| `/gaveafgift` (7/10, ny) | **0** | — | — | — |
| `/laanekapacitet` (7/10, ny) | **0** | — | — | — |
| `/idealvaegt` (4/10, ny) | **0** | — | — | — |
| `/dage-til/*` (2/10, nye) | **0** | — | — | — |
| `/skridt` (6/10, ny) | **0** | — | — | — |
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

**F0d. [~I] To sider måler deres nye titel i 14 dage, før der røres ved den.**
`/rentefradrag` (5,8 %) og `/boligstoette` (2,5 %) er GSC-uddragtets to højeste
CTR, så deres **danske** titler får ikke et regnet eksempel, før målingen er
læst. **Ac/tbaseline:** CTR målt 8/10 08:2x: /rentefradrag 5,8 % (pos. 5,4),
/boligstoette 2,5 % (pos. 8,7). GSC-eksport dækker 8/9 → 6/10. Måles igen ~22/10.
Deploy: /kulhydrater-i-madvarer VERIFICÉR DEPLOY note Åben 8/10 08:2x — siden
er endnu ikke live (404), vent på batch-deploy ved 12:30/17:30. Første reelle
deploy-vindue efter mergen var 8/10 12:30.
**Accept:** tallene fra GSC 17/10 står i tabellen; bagefter enten regnet eksempel
eller en skriftlig begrundelse for at lade være. De svenske pendanttitler er
rettet 3/10. Lukket herfra: `/arveafgift`, `/renteberegner`, /alder, /tidszone,
/boernepenge, /dato — alle med regnet eksempel i portalen.

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

**F5h. [x] FÆRDIG 9/10 00:3x — `/kalorier-i-alkohol`** (9f65ec3). Detaljer i `docs/plan-arkiv.md`.

**F5i. [x] FÆRDIG 9/10 01:4x — `/salt-i-madvarer`** (ceo/salt-i-madvarer). 53 natriumtal fra USDA næringsstof 1058, salt = natrium × 2,5 ÷ 1000, WHO 5 g/dag som eneste ydre tal. Detaljer i `docs/plan-arkiv.md`.
  *Accept (opfyldt 9/10 07:30-kontrollen):* 200 med «Kalorier i alkohol: 143 kcal i
  en øl på 330 ml» i titlen. Lands samlet bevis i `docs/plan-arkiv.md`.

## Feature-kø

- **[ ] `/kaloriebehov` — hvor mange kalorier skal jeg have for at tabe/holde/bygge?** Dansk autocomplete (hl=da, 8/10) har «hvor mange kalorier skal jeg have for at tabe mig», «… for at holde vægten» og «… for at bygge muskler» blandt 10/10 træffere. Sitet har `/kalorier` med kaloriebehov, men autocomplete viser at folk søger efter målrettet beregning. *Accept:* kaloriebehov pr. mål (tabe/holde/bygge) med kilde. ⛔ kræver en kilde til kaloriebehov pr. mål (❓).
- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» er danske autocomplete-træffere, på svensk «bmi barn tabell». WHO's BMI-for-alder-tabeller er ~150 tal pr. køn — for mange at transskribere uden uafhængig kontrol, og en fejltransskription er værre end manglende side (punkt 11). ⛔ ét skærmbillede af WHO's tabel.
- **[ ] Kogetider** — GSCs **2. største søgning** på `/tidsberegner` (824 visninger, pos. 6,8) er «hvor lang tid», og **10 af 10** danske completioner er madvarer med en koge- eller bagetid. *Accept:* kogetid pr. vare pr. tilberedningsmåde, kun med kildeførte tider. ⛔ `frbs.foodsearch.lex.dk` og `sst.dk` er begge uafgåengelige fra maskinen (❓).
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89 sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af 10 træffere under «kvadratmeter», og vi har 98 kommuner i `kommuner.ts` — men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).
- **[ ] `/pensionsalder` — hvornår kan jeg gå på pension?** «hvad er min pensionsalder» og «beregn min pensionsalder» er danske autocomplete-træffere; sitet har `/pension` og `/efterloen`, men ingen side der svarer på folkepensionsalderen. ⛔ kræver den officielle fødselsdato→alder-tabel fra borger.dk (❓).

- **[x] FÆRDIG 7/10 01:2x — «Læg til / træk fra procent» på `/procent`** (syvende
  tilstand, dansk og svensk). Datagrund: 10 af 10 danske autocomplete-træffere
  under «lægge procent til et tal» og under «trække procent fra et tal»; alle
  konkurrenter har tilstanden. Se `docs/plan-arkiv.md`. **MÅL: /procent baseline
  149.929 visninger / 0,1 % CTR / pos. 7,5 pr. 6/10** — måles igen 20/10.
- **[x] FÆRDIG 7/10 00:3x — Øresundsbroen på `/brokost`**, se `docs/plan-arkiv.md`.
  Datagrund: 10 af 10 danske autocomplete-træffere under «øresundsbroen pris» og
  10 af 10 under «hvad koster øresundsbroen». ❓'en om prislisten er lukket:
  `oresundsbron.com/da/priser` er læsbar fra maskinen (den danske `.dk`-host
  giver curl 000). **MÅL: /brokost under top-15 Plausible/GSC pr. 7/10** — måles
  igen ~21/10.

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
- **[x] FÆRDIG 6/10 22:2x — «Kalorier i madvarer» på `/kalorier`.** 53 madvarer
  fra USDA FoodData Central (SR Legacy 2018-04), hver med `fdcId`, søgning der
  griber «rugbrod» og «aeg» som «Rugbrød» og «Æg», og et gram-felt pr. række.
  Brødtekstens tal læses fra tabellen, så de ikke kan glide fra den. ⛔'en med
  fødevarekilden er lukket med FDC-CSV'en — **kogetider er stadig ⛔**, de vil
  gerne have den samme kilde til tider, så det næste stykke arbejde kan starte
  dér. Svensk og norsk oversættelse af madvarerne ligger ikke i denne iteration.
- **[ ] Svensk dækning af manglende kalkulatorer** — beraknare.se har 89
  sitemap-URL mod 158 på minberegner.dk, bl.a. uden `/dagpenge` og
  `/boernepenge`. ⛔ Opgave 187, 13/10.
- **[x] FÆRDIG (allerede bygget) — «promillegrænse» i udlandet på `/promille`.**
  `PROMILLEGRANSE_UDLAND` i `src/lib/promille.ts` har 12 lande (Danmark, Sverige,
  Norge, Polen, Tyskland, Frankrig, Spanien, Italien, Grækenland, Holland,
  Østrig, Storbritannien), og `/promille` har tabellen «Promillegrænsen i
  udlandet» med «strengere regel»-kolonnen. Tyskland 0,5 ‰ er ført til StVG
  § 24a. Punkt 0's oprindelige ⛔ er dermed lukket af koden, ikke af en ny kilde.
- **[ ] `/gram-til-dl` — køkkenomregner.** «gram til dl» har **10 af 10** danske
  autocomplete-træffere (mel, sukker, havregryn, hvedemel, brun farin, ris, creme
  fraiche, græsk yoghurt) og svensk «gram till dl». *Accept:* gram↔dl for de
  8-10 mest søgte madvarer, hver med kildeført densitet (punkt 11). ⛔ kræver én
  troværdig densitetstabel pr. vare (❓).
- **[x] FÆRDIG 8/10 06:4x — `km → skridt`-tabel på `/skridt`.** 7 af 10 danske autocomplete-træffere under «hvor mange skridt er» er «… 1/2/3/4/5/6/10 km». Tabellen viser skridt for 1-10 km for kvinder og mænd, regnet af `skridtFraKm`. Test låser værdierne for alle 10 kilometer. Dansk og svensk.
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af
  10 træffere under «kvadratmeter», og vi har 98 kommuner i `kommuner.ts` —
  men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).
- **[ ] `/pensionsalder` — hvornår kan jeg gå på pension?** «hvad er min
  pensionsalder» og «beregn min pensionsalder» er danske autocomplete-træffere;
  sitet har `/pension` og `/efterloen`, men ingen side der svarer på
  folkepensionsalderen. ⛔ kræver den officielle fødselsdato→alder-tabel fra
  borger.dk (❓).

## VERIFICÉR DEPLOY-noter

**Åben 9/10 01:4x:** `VERIFICÉR DEPLOY: /salt-i-madvarer svarer 200 og viser titlen «Salt i madvarer: 1,5 g i rugbrød, 1,6 g i smør», overskrifterne «Hvor meget salt er der i …?», «Madvarer med mest salt pr. 100 g» og «Sådan regner du saltindholdet ud», rækken «Rugbrød» med 603 mg natrium og 1,5 g salt, rækkerne «Skinke» (1.500 mg, 3,8 g) og «Feta» (1.139 mg, 2,8 g), formlen «salt i gram = natrium i mg × 2,5 ÷ 1000», teksterne «under 2.000 mg natrium» og «ca. en teskefuld», FAQ-svaret «Rugbrød har 603 mg natrium pr. 100 g», et kort til siden på forsiden og under Sundhed, samt URL i sitemap.xml; beraknare.se skal IKKE have siden (daOnly). ceo/salt-i-madvarer 9/10 01:4x`. Mål på **indhold**: strip tags og grep — strip HTML med `curl -s https://minberegner.dk/salt-i-madvarer | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Rugbrød», «603» og «1,5 g». Første reelle deploy-vindue efter mergen er **9/10 07:30** (batch-deployeren kører 07:30/12:30/17:30/21:30).

**Åben 9/10 00:3x:** `VERIFICÉR DEPLOY: /kalorier-i-alkohol svarer 200 og viser titlen «Kalorier i alkohol: 143 kcal i en øl på 330 ml», overskrifterne «Sådan regner du kalorier i alkohol ud», «Kalorier i øl, vin og sprits» og «Kilden», rækkerne «Øl, almindelig 330 ml 143 kcal», «Alkoholfri øl 330 ml 122 kcal» og «Spirit, 40 % (vodka, gin, rom) 40 ml 87 kcal», FAQ-svaret «En almindelig øl på 330 ml giver 143 kcal», teksterne «40 ml sprits er 37,6 g, ikke 40 g» og «3,21 genstande», og et kort til siden på forsiden under Sundhed samt URL i sitemap.xml. ceo/kalorier-i-alkohol 9/10 00:3x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/kalorier-i-alkohol | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «143 kcal», «37,6 g» og «3,21 genstande». Beraknare.se skal IKKE have siden (daOnly). Første reelle deploy-vindue efter mergen er **9/10 07:30** (batch-dispenseren kører 07:30/12:30/17:30/21:30).

**Åben 8/10 23:5x:** `VERIFICÉR DEPLOY: /helligdage og /helgdagar svarer begge 200 og viser tabellen for 2026 med rækkerne «Nytårsdag — 1. januar 2026 — Torsdag — Fast dato — Ja», «Palmesøndag — 29. marts 2026 — Søndag — Følger påsken — Nej, i weekenden», «Grundlovsdag — 5. juni 2026» og summen «I alt 13», teksten «2026 har 13 helligdage. 9 af dem falder på en hverdag», overskrifterne «Næste helligdage», «Helligdage 2026» og «Faste og påskeafhængige helligdage», FAQ-svaret «Danmark har 13 helligdage i år», og links til /dage-til/24-december, /dage-til/nytaarsdag og /dage-til/2-pinsedag. På beraknare.se skal /helgdagar vise «Nyårsdagen — 1 januari 2026» og «16 helgdagar»; begge skal stå i sitemap.xml, og /arbejdsdage skal linke til /helligdage. ceo/helligdage 8/10 23:5x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/helligdage | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<script.*?</script>','',t,flags=re.S);t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Nytårsdag», «1. januar 2026», «13 helligdage». Første reelle deploy-vindue efter mergen er **9/10 07:30** (batch-dispenseren kører 07:30/12:30/17:30/21:30). Brug `curl -s -o /dev/null -w "%{http_code}" https://beraknare.se/helgdagar` for den svenske side.

**Åben 8/10 22:3x:** `VERIFICÉR DEPLOY: /sand-og-grus svarer 200 og viser titlen «Sandberegner: 10 m² i 5 cm = 0,55 m³», overskrifterne «Sådan regner du mængden ud», «Lagtykkelse og vægt pr. materiale» og «Hvor meget grus skal du bruge til en indkørsel?», rækken «Afretningssand (flisesand)» med «1,6 ton/m³» og «0,5 m³», samt teksten «Husk komprimeringen»; link til /sand-og-grus skal stå på /fliser, /maling og /kvadratmeter og i sitemap.xml. ceo/sand-og-grus 8/10 22:3x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/sand-og-grus | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Sådan regner du mængden ud», «0,55» og «Afretningssand». Første reelle deploy-vindue efter mergen er **9/10 07:30** (batch-dispenseren kører 07:30/12:30/17:30/21:30).

**Åben 8/10 21:3x:** `VERIFICÉR DEPLOY: /sukker-i-madvarer svarer 200 og viser titlen «Sukker i madvarer – se sukker pr. 100 g», overskrifterne «Hvor meget sukker er der i …?», «Madvarer med mest sukker pr. 100 g» og «Sådan regner du sukkerindholdet ud», rækken «Banan» med «Pr. 100 g»-kolonnen på 12,2 g, rækken «Mælk, sødmælk» i eksemplerne, samt teksten «Kilden opgiver ikke sukker for havregryn» i den vejledende boks; link til /sukker-i-madvarer skal stå på /kalorier-relaterede sider (kategori, forside) og i sitemap.xml. ceo/sukker-i-madvarer 8/10 21:3x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/sukker-i-madvarer | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Hvor meget sukker er der i», «12,2» og «havregryn». Første reelle deploy-vindue efter mergen er **9/10 07:30** (batch-dispenseren kører 07:30/12:30/17:30/21:30).

**Lukket 8/10 18:3x med DEPLOY OK 8/10** — `/fedt-i-madvarer` (ceo/fedt-i-madvarer 8/10 13:1x) er live (200) med «Hvor meget fedt er der i», «Gram for 20 g», «9,5 g» og æg-rækken, og i sitemap.xml. Målt efter 17:30-vinduet.

**Lukket 8/10 18:3x med DEPLOY OK 8/10** — `/portioner` (ceo/portioner 8/10 12:5x) er live (200) med «Hvor meget mad skal der beregnes», «Pasta, tørret» med «300 g–400 g» (intervallet skrives med mellemrum om en-dash, så præcis-strengen «300-400 g» aldrig findes), i alt-kolonnen og linket på /gram-til-dl; siden står i sitemap.xml. Målt efter 17:30-vinduet.

**Åben 8/10 18:3x:** `VERIFICÉR DEPLOY: /kalorier-i-opskrift svarer 200 og viser titlen «Kalorier i opskrift: carbonara til 4 = <n> kcal pr. portion» med det regnede tal, overskrifterne «Sådan beregner du kalorier i en opskrift», «To opskrifter udregnet» og «Hvad betyder protein, fedt og kulhydrat?», rækken «Nudler, tørrede» i carbonara-tabellen med «I alt»- og «Pr. portion (4)»-rækkerne, og på /kalorier linket til beregneren for kalorier i opskrifter; siden skal også stå i sitemap.xml. ceo/kalorier-i-opskrift 8/10 18:3x`. Mål på **indhold**: strip tags og grep: `curl -s https://minberegner.dk/kalorier-i-opskrift | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"` skal indeholde «Sådan beregner du kalorier i en opskrift», «Nudler, tørrede» og «Pr. portion». Første reelle deploy-vindue efter mergen er **8/10 21:30**.

**Lukket 8/10 13:2x med DEPLOY OK 8/10** — `/protein-i-madvarer` og `/kulhydrater-i-madvarer` er live (HTTP 200) med korrekt indhold («Hvor meget protein er der i», «Gram for 20 g», «12,6 g» resp. «Hvor mange kulhydrater er der i», «Gram for 50 g», «22,8 g»). Målt efter 12:30-vinduet.

**6 noter lukket 8/10 00:1x med DEPLOY OK 8/10** — byggepris, omkreds, hundealder, areal, kirkeskat og elbil-lading; alle målt på indhold på begge domæner efter 7/10 21:30-vinduet. Fulde krav og grep står i `docs/plan-arkiv.md`.

**18 noter lukket 7/10 08:5x med DEPLOY OK 7/10** — alle målt på indhold efter 07:30-vinduet: `/procent` (title + rabat + Læg til/træk fra), `/tv-storrelse`, `/laanekapacitet`, `/maling`, `/gaveafgift`, `/nutidskroner`, `/brokost` (Øresund), `/tidsberegner` (minutter, begge domæner), `/kalorier`, `/moms` (importmoms, begge domæner), `/fart` (begge domæner). Fulde krav og grep står i `docs/plan-arkiv.md`.

⚠️ **`grep -oF «62,1 mph» giver 0 på en side der VISER «100 km/t i mph: 62,1 mph»** (målt 6/10 21:31): der står et tag mellem tallet og enheden, så greb på rå markup kan ikke finde en sætning med et tal og en enhed. Strip HTML'en før du læser tal: `curl -s URL | python3 -c "import sys,re,html;t=sys.stdin.read();t=re.sub(r'<[^>]+>',' ',t);print(re.sub(r'\s+',' ',html.unescape(t)))"`. Kun tekst, der står bogstaveligt i kilden (labels, overskrifter, FAQ), er grebbar på rå markup.

⚠️ **Brug `grep -o … | wc -l`, ikke `grep -c`, på rå markup** (målt 6/10 00:1x): Next leverer HTML'en som én linje, så `grep -c` tæller linjer og svarer 1 for alt. Værktøjer der er klient-komponenter skal læses i koden, indtil facit kan hentes headless. Interpolerede tal skrives som `1.515<!-- --> skridt` — tjek tal og enhed hver for sig, eller brug FAQ-teksten der står uinterpoleret.

**24 noter lukket 6/10 15:5x med DEPLOY OK 6/10** — alle målt på indhold efter 07:30- og 12:30-vinduerne; fulde krav og målinger i `docs/plan-arkiv.md`.

**10 noter lukket 8/10 08:2x med DEPLOY OK 8/10** — /koffein, /fliser, /retvinklet-trekant, /soevnbehov, /skridt, /gram-til-dl, /arbejdsdage, /uger-i-aret, de to svenske dage-til-sider og emoji-erstattelsen på blog/404; alle målt på live-indhold efter 07:30-vinduet. Fulde krav og målinger står i `docs/plan-arkiv.md`.

**Lukket 8/10 13:2x med DEPLOY OK 8/10** — se `/protein-i-madvarer`-noten ovenfor.

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
- ❓ **Øresundsbroens prisliste** (6/10 06:0x, højst prioriteret). `oresundsbroen.dk`
  svarer **ingen forbindelse** fra maskinen — curl giver 000 på domænet og på
  `/priser-och-rabatter/bilpriser`, mens `storebaelt.dk/priser` er læseligt.
  `/brokost` har derfor kun Storebælt. **Ét skærmbillede af Øresundsbroens
  prisliste for 2026** låser den anden store bro på samme side; ØresundPAY har
  egne regler for betaling og rabat.
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
- ❓ **To skanner-rækker uden fejl i koden** (5/10 21:2x, linjenumrene opdateret
  8/10 03:5x). `npm test` skriver «FEJL: 1 ureviewet(e) danske streng(e) …» med
  `src/app/procent/page.tsx:633` («En lønsprocent kan du se:») og «FEJL: 34 …»
  med 20 linjer i `src/app/promille/page.tsx`, der er ren dansk i en komponent
  der monteres på beraknare.se. **⛔ Ikke opgaver at fjerne ord for** — kræver en
  stopordsliste der skelner mellem sprog, eller en allowlist-fil.
- ❓ **Et tidligere suitekørsel gav 1 rød i `locale-leak-gate.test.ts`**, som
  scanneren kører i en udspawnet proces og som er grøn i isolation og i to
  senere fulde kørsler. Ikke reproduceret; urørt.
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)»; `skat.dk` svarer 500. Teksten siger nu kun hvad beregneren
  regner med.
- ❓ **Fitnessfradrag, sommerhusudlejning, grundskyld for Varde og Playwright.**
  Fire mindre kilder, noteret i `docs/plan-arkiv.md` 2/10 14:20. Repoet har
  stadig intet Playwright, så UI-opgaver kan ikke få skærmbilleder.
