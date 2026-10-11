STATUS: 11/10 06:5x. 🟢 **Forkert oplysning om boligsikring på `/boligstoette` rettet**
(ceo/boligsikring-oplysning). Siden og FAQ'en kaldte boligsikring en
«obligatorisk opsparingsordning hos Realkredit Danmark». Boligsikring er en
skattefri huslejestøtte, som Udbetaling Danmark fastsætter og udbetaler (lov om
individuel boligstøtte, LBK 229, § 9 b, § 22, § 8 a — formlen er 60 % af den
årlige boligudgift minus 18 % af husstandsindkomsten over indkomstgrænsen).
Datagrund: `/boligstoette` har 494 besøgende/28d (+45 %) og 7.465 GSC-visninger
(CTR 2,4 %, pos. 8,7), så den forkerte sætning stod i Google. Testen låste fejlen
fast (den krævede netop «Realkredit Danmark»); den er skrevet om til at fejle på
gammel tekst.
**Næste opgave i dette spor: `/boligsikring`** — «beregn boligsikring» har seks
selvstændige autocomplete-forslag (bl.a. «til pensionister», «som
førtidspensionist»), og GSC har «boligsikring beregner» 208 visninger pos. 10 på
`/boligstoette`. ⛔ mangler de 2026-regulerede satser (indkomstgrænse, mindste-
tilskud) fra bekendtgørelsen — kræver verification før beregneren bygges (❓).

**Gate:** `npm run typecheck && npm run lint && npm run test` (+ `npm run build` på kodeændringer). Seneste: 11/10 06:5x: typecheck 0, lint 0 (1035 filer), **5.766 tests i 347 filer grønne**, build grøn, `locale-leak.mjs --gate` exit 0 (0 ureviewet). Ældre: 11/10 06:3x: 5.766 tests i 347 filer.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9 + 8/10, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` (titel rettet 10/10 05:1x) | ikke i top-15 | **141.167** | **0,1 %** | **7,5** |
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
omkreds, rumfang, ugedag, dage-mellem-datoer, dage-tilbage-i-aaret) er alle **0** — de måles ~14 dage
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

**[x] FÆRDIG 10/10 23:5x — `/dage-til/*` viser også timer og minutter**
(ceo/dage-til-timer). «hvor mange timer er der til jul» og «…til juleaften» er
begge top-10 i dansk autocomplete, og sitet besvarede kun dage. Ny
`DageTilTimer`-klientkomponent tæller ned på den besøgendes eget ur og viser
«Det er 1.824 timer og 15 minutter til juledagen»; ren funktion
`dageTilTimerOgMinutter` i `dage-til.ts`. Klient-side fordi tallet skifter hvert
minut — `renderToString` giver tom streng, så serveren aldrig leverer et froget tal.
Brødteksten («Sådan er tallet beregnet») nævner timetallet, så søgemaskiner også
finder det. da + se. 12 nye tests, mutation målt (fjernes `Math.max(0, …)`: 3 røde).
**MÅL: /dage-til/* baseline: ikke i Plausibles top-15; GSC-spørgsmålet «hvor mange
dage er der til den 24 december» har 1.086 visninger pos. 5 — måles ~24/10.**

**[x] FÆRDIG 11/10 00:4x — `/nedtaelling` viser også timer og minutter**
(ceo/nedtaelling-timer). Samme datagrund som dage-til-timer: «hvor mange timer er
der til jul» er top-10 i dansk autocomplete. Ren funktion `nedtaellingTimer` i
`nedtaelling.ts` (hele timer + minutter frem til datoens lokale midnat på den
besøgendes ur), vises klient-side og opdateres hvert 30. s. — et tal i HTML'en
ville være forkert for den næste besøgende. 7 nye tests, da + se. Retter to
testforventninger der var frosset til 10/10 og gik røde ved midnat 11/10 (siden
var aldrig gatøj): udleder forventningerne af kilden i stedet for en dato.
**MÅL: /nedtaelling baseline — ikke i Plausibles top-15; måles ~24/10.**

**[x] FÆRDIG 11/10 01:1x — `/dage-til/paaskeferien` tilføjet** (ceo/paaskeferien).
Datagrund: dansk autocomplete har «påskeferien» og «påskeferien 2026» som
selvstændige forslag under «hvor mange dage er der til», men `DAGE_TIL_EVENTS`
havde kun `sommerferien`, `efteraarsferien` og `skolestart`. Ny event med
`easterOffset: -6` (mandag før påskedag) som anker, dansk-only. Brødteksten
forklarer at datoen ikke er fastlagt i loven — hver kommune fastsætter selv.
9 nye tests, da. **MÅL: /dage-til/paaskeferien baseline 0 — måles ~24/10.**

**[x] FÆRDIG 11/10 06:1x — `/dage-til/1-november` (da) + `/dagar-till/1-november` (se)**
(ceo/dage-til-1-november). Datagrund: GSC 11/10 — beraknare.se «hur många dagar
är det kvar till 1 november» 45 visninger pos. 5, minberegner.dk «hvor mange dage
er der til 1 december» 928 visninger. Fast dato i begge sprog med eget copy (53
dage til juleaften). Svensk FAQ rettet til den korrekte regel: alla helgons dag
er lördagen mellan 31 oktober och 6 november. 1 ny test + mutation-kontrol (uden
eventet går testen rød). **MÅL: /dage-til/1-november + /dagar-till/1-november
baseline 0 — måles ~25/10.**

**[x] FÆRDIG 11/10 06:3x — `/dage-til/valentinsdag` (da) + `/dagar-till/alla-hjartans-dag` (se)**
(ceo/dage-til-valentinsdag). Datagrund: Google-autocomplete (suggestqueries.google.com
11/10, hl=da/gl=dk og hl=sv/gl=se) har begge spørgsmål som selvstændige forslag.
Fast dato 14. februar, eget copy pr. sprog, svensk titel forkortet til ≤60 tegn.
To porte var grønne og fandt to rigtige fejl: svensk vardag-påstand uden
weekend-forbehold, og at 14/2 2027→2028 giver 365 dage (skuddagen 29/2 2028
ligger efter anden dato). 1 ny test + mutation-kontrol. **MÅL: baseline 0 — måles ~25/10.**

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

**F6. [x] FÆRDIG 10/10 01:3x** — fakta og FAQ på /dage-til og /dagar-till
renderer nu `<strong>` i stedet for `**`, og FAQPage-JSON-LD'en er ren tekst.
Beslutning på det åbne spørgsmål: den delte `FAQ` blev rettet for alle (en
no-op uden for dage-til, hvor ingen FAQ-svar har `**`). Ny
`src/components/inline-markdown.tsx` bruges af `DageTilPage`, `FAQ` og
`FAQSchema`. Detaljer i `docs/plan-arkiv.md`.

**F5j. [x] FÆRDIG 9/10 02:1x — `/fiber-i-madvarer`** (ceo/fiber-i-madvarer). 53
fibertal fra USDA næringsstof 1079, WHO 25 g/dag som eneste ydre tal. Detaljer i
`docs/plan-arkiv.md`. *Accept (opfyldt 9/10 02:1x):* 200 med «Fiber i madvarer:
10,6 g i havregryn, 5,8 g i rugbrød» i titlen.

## Feature-kø

- **[x] FÆRDIG 10/10 17:1x — `/kalium-i-madvarer` — hvor meget kalium er der i banan, kartoffel og avocado?** (ceo/kalium-i-madvarer). 53 tal fra USDA næringsstof 1092, NNR2023 AI 3.500 mg, foreløbigt AR 2.800, ingen UL læst direkte af kilden. 13 tests, daOnly. Detaljer i STATUS øverst.
- **[x] FÆRDIG 10/10 13:1x — `/calcium-i-madvarer` — hvor meget calcium er der i mælk, ost og yoghurt?** (ceo/calcium-i-madvarer). 53 tal fra USDA næringsstof 1087, NNR2023 RI 950/AR 750/UL 2.500 læst direkte af kilden. 13 tests, daOnly. Detaljer i STATUS øverst.
- **[x] FÆRDIG 10/10 14:4x — `/magnesium-i-madvarer` — hvor meget magnesium er der i havregryn, spinat og banan?** (ceo/magnesium-i-madvarer). 53 tal fra USDA næringsstof 1090, NNR2023 AI 300/350, foreløbigt AR 240/280, UL 250 (kun tilskud) læst direkte af kilden. 13 tests, daOnly. Detaljer i STATUS øverst.
- **[x] FÆRDIG 10/10 15:1x — `/zink-i-madvarer` — hvor meget zink er der i oksekød, havregryn og gouda?** (ceo/zink-i-madvarer). 53 tal fra USDA næringsstof 1095, NNR2023 RI 10/13, AR 8/11, UL 25 mg læst direkte af kilden. 13 tests, daOnly. Detaljer i STATUS øverst.
- **[x] FÆRDIG 10/10 11:0x — `/vitamin-b12` — hvor meget B12-vitamin skal man have om dagen?** (ceo/vitamin-b12-anbefaling). NNR2023 AI 4 µg, provisorisk AR 3,2 µg, ingen UL; 27 madkilder fra USDA SR Legacy 2018-04 næringsstof 1178 med fdcId pr. række, herunder havregryn og rugbrød på 0 (B12 findes kun i animalske fødevarer). 11 tests, daOnly. Detaljer i STATUS øverst.
- **[x] FÆRDIG 11/10 02:5x — `hvor meget kolesterol er der i` → `/kolesterol-i-madvarer`** (ceo/kolesterol-i-madvarer). 58 madvarer fra USDA SR Legacy 2018-04 næringsstof 1253, hver med fdcId. Der findes ingen dansk anbefaling for kostkolesterol (NNR2023 har intet kolesterolafsnit, og kost.dk-rammeplanen siger det direkte), så siden omregner til ét råt æg (223,2 mg) og viser mættet-fedt-loftet (10 E %) i stedet for en opdigtet andel af anbefalingen. Alle tal i brødtekst, tabeller og FAQ læses fra tabellen gennem `kolesterol100gForNavn`, der kaster på ukendt navn. 14 tests, daOnly, top-10-sektion. **MÅL: /kolesterol-i-madvarer baseline 0 — måles ~25/10.**
- **[x] FÆRDIG 10/10 21:5x — `/jod-i-madvarer`** (ceo/jod-i-madvarer). USDA Foundation Foods 2026-04-30, næringsstof 1100 (µg), 21 varer, NNR2023 AI 150/AR 120/UL 600. 11 tests, daOnly. Detaljer i STATUS øverst. ⚠️ **Kilden er IKKE SR Legacy**: SR Legacy 2018-04 har ingen jodrækker overhovedet — brug Foundation Foods (sampakke uden nøgle), hvis der skal mere joddata.
- **[x] FÆRDIG 10/10 19:4x — `/tidsberegner` linker til alle dage-til-sider** (ceo/tidsberegner-dage-til-links). Fælles `DageTilLinks`-komponent, 4 nye tests, da/se/no. **MÅL: udgående klik fra 0 — måles ~24/10.**
- **[ ] `/kaloriebehov` — hvor mange kalorier skal jeg have for at tabe/holde/bygge?** (9/10: spørgsmålet er beskrevet i blogindlægget `hvor-mange-kalorier-skal-jeg-have`; en egen side afventer stadig en kilde til behov pr. mål.) Dansk autocomplete (8/10): «hvor mange kalorier skal jeg have for at tabe mig / holde vægten / bygge muskler» 10/10. Sitet har `/kalorier` med kaloriebehov. ⛔ kræver en kilde til kaloriebehov pr. mål (❓).
- **[ ] BMI-percentil for børn.** «bmi for børn», «bmi skala børn» (da), «bmi barn tabell» (se). WHO's BMI-for-alder-tabeller er ~150 tal pr. køn. ⛔ ét skærmbillede af WHO's tabel (fejltransskription værre end ingen side).
- **[ ] Kogetider** — GSCs 2. største søgning på `/tidsberegner` er «hvor lang tid» (824 visninger, pos. 6,8), og 10/10 danske completioner er madvarer med koge-/bagetid. ⛔ `frbs.foodsearch.lex.dk` og `sst.dk` er uafgængelige (❓).
- **[ ] Svensk dækning af manglende kalkulatorer** (porto, dagpenge, børnepenge) — beraknare.se har 89 sitemap-URL mod 158 på minberegner.dk; svenske frimærkspriser er allerede læst 9/10. ⛔ Opgave 187, 13/10.
- **[ ] «kvadratmeterpris» pr. by.** «kvadratmeterpris københavn/odense» er 3 af 10 træffere under «kvadratmeter»; 98 kommuner i `kommuner.ts`, men ingen salgsdata. ⛔ kun de 5-10 største byer er realistiske (❓).

## VERIFICÉR DEPLOY-noter
**VERIFICÉR DEPLOY: /boligstoette ceo/boligsikring-oplysning 11/10 06:5x** —
`https://minberegner.dk/boligstoette` skal servere afsnittet «Boligstøtte og
boligsikring er to ord for huslejestøtte», sætningen «en ydelse, du søger om hos
Udbetaling Danmark via borger.dk» og ikke længere «obligatorisk opsparingsordning»
eller «Realkredit Danmark». FAQ'en i JSON-LD skal indeholde «LBK 229» og «Udbetaling
Danmark». Svensk udgave skal være uændret (daOnly-indhold).
De lukkede noter (DEPLOY OK) står i `docs/plan-arkiv.md` under
"Lukkede VERIFICÉR DEPLOY-noter".
**VERIFICÉR DEPLOY: /jod-i-madvarer ceo/jod-i-madvarer 10/10 21:5x** — siden skal servere 200 med tabellen «Joderet salt … 5.080 µg», «Torsk … 113,7 µg» og dags-eksemplet «I alt 313,5 µg». DaOnly: `https://beraknare.se/jod-i-madvarer` skal give 404.
 **VERIFICÉR DEPLOY: /kolesterol-i-madvarer ceo/kolesterol-i-madvarer 11/10 02:5x** — siden skal servere 200 med tabellen «Kolesterol i madvarer: 223,2 mg i ét æg» i titlen, «Ingen» som anbefalet dagsmængde, rækken `Æggeblomme, rå 1.085 mg` og dags-eksemplet «I alt». DaOnly: `https://beraknare.se/kolesterol-i-madvarer` skal give 404.
**VERIFICÉR DEPLOY: /dage-til/1-november + /dagar-till/1-november ceo/dage-til-1-november 11/10 06:1x** — begge skal servere 200. DA: `<title>` «Hvor mange dage er der til 1. november? 21 dage», faktalinjen «1. november er ikke en helligdag i Danmark» og «53 dage til juleaftensdagen». SE: `<title>` «Hur många dagar är det till 1 november? 21 dagar» og faktalinjen «lördagen mellan 31 oktober och 6 november». `https://beraknare.se/dage-til/1-november` skal give 301 til `/dagar-till/1-november`. Begge slugs i sitemap.xml på deres domæne.
**VERIFICÉR DEPLOY: /nedtaelling nedtaelling-timer ceo/nedtaelling-timer 11/10 00:4x** — SSR-HTML'en må IKKE indeholde «timer og … minutter til den valgte dato» (timetallet er klient-side og tælles ned på den besøgendes ur); klient-bundlen skal indeholde `nedtaellingTimer` og «til den valgte dato». Svensk: «till det valda datumet».
**VERIFICÉR DEPLOY: /dage-til/* dage-til-links ceo/dage-til-timer 10/10 23:5x** — `/dage-til/24-december` skal servere 200 med «Der er 75 dage til juleaften», «Det svarer til 10 uger og 5 dage» og brødteksten «står antal timer og minutter lige under»; server-HTML'en må IKKE indeholde «Det er <tal> timer» (timetallet er klient-side), men klient-bundlene skal indeholde «minutter til».
**VERIFICÉR DEPLOY: /tidsberegner dage-til-links ceo/tidsberegner-dage-til-links 10/10 19:4x** — /tidsberegner skal servere DageTilLinks-blokken med `href="/dage-til/…"`-links og dagens antal dage; svensk udgave linker til /dagar-till/*.
**✅ DEPLOY OK 10/10 18:0x — alle fire næringsstof-sider er live og har de rigtige tal.**
Målt på strippet HTML (ikke rå markup) fordi Next leverer én linje med et tag mellem tal og enhed:
- `/kalium-i-madvarer` 200, `<title>` «Kalium i madvarer: 535 mg i kartoffel, 358 mg i banan», anbefalingsafsnit «3.500 mg om dagen», dags-eksempel «I alt 3.534 mg», tabelrækken `Banan 358 mg 358 mg 978 g 10 %` (978 g = 3500/358·100, altså kolonnen «gram for 3.500 mg» er rigtig), «Viser alle 53 madvarer».
- `/zink-i-madvarer` 200, `<title>` «Zink i madvarer: 3,97 mg i havregryn, 3,32 mg i oksekød», «13 mg om dagen for voksne mænd og 10 mg for kvinder», «I alt 11,08 mg».
- `/magnesium-i-madvarer` 200, `<title>` «Magnesium i madvarer: 177 mg i havregryn, 79 mg i spinat», «I alt 357,6 mg».
- `/calcium-i-madvarer` 200, `<title>` «Calcium i madvarer: 700 mg i gouda, 125 mg i letmælk», «I alt 1.046,8 mg».
Alle fire står i `sitemap.xml`. **daOnly bekræftet mod beraknare.se direkte** (ikke `Host:`-header — den giver nu 403 på alle sider, så header-metoden er holdt op at virke som daOnly-port): `https://beraknare.se/kalium-i-madvarer` → 404, samme for de tre andre.
**Åben 5/10 17:5x (Sentry):** MINBEREGNER-2 «useLocale must be used within a LocaleProvider» på POST / er rettet ved at wrappe NotFoundSearch i LocaleProvider (ceo/sentry-uselocale-fix 5/10 17:5x). Kun Sentrys hændelsestæller afgør, om den er væk (2 hændelser / 0 brugere på 14 dage) — læs den 14/10.
**RETTELSE 10/9 16:0x — DEPLOY-MISSING 10/9 15:1x var for tidlig.** En ændring kan endnu ikke være live, hvis den ikke har haft et deploy-vindue efter merge-tidspunktet. DEPLOY-MISSING skrives først, når et vindue EFTER merge-tidspunktet er gået uden at ændringen er live.
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
