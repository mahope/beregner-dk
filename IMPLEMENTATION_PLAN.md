# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — C9 (svar-først `/braendstof` og `/kvadratmeter`) FÆRDIG og merged 2026-09-25
20:36 CEST (`d9aa21c`). Deploynoter for C4, C5, C6, C7, C8 og C9 er åbne og kan først
verificeres efter 07:30-vinduet 2026-09-26.
Næste iteration: `/blog/boernepenge-2026-satser-og-regler` (5.145 visninger, CTR 0,5 %,
pos. 8,5) er den næste CTR-kandidat; derefter den åbne del af C8 (indkomstfelt til
pensionstillægget) og `/rentefradrag`'s manglende primære kilde.

## Fase 3 — trafik-drevet

### Research-iterationens gate — 2026-09-23

- Første build brugte en stale `node_modules` med Next.js 15.5.23, selvom lockfile og
  `package.json` krævede 15.5.25. Resultatet blev kasseret; `npm ci` genskabte præcis
  lockfilen og rapporterede 0 sårbarheder.
- Endelig gate på Next.js 15.5.25: `npm run build` grøn (137 sider + typecheck),
  `npm run test` grøn (372/372 tests, 42 filer), `npm run lint` grøn (336 filer).
- Builden viser 7 kendte, pre-existing CSS-optimeringsadvarsler om `print:hidden` og
  `dark:`-varianter. Denne iteration ændrer ingen kode/CSS; advarslerne er ikke nye.

### Baseline — Plausible 2026-09-23 21:06 (28 dage)

- **minberegner.dk:** 6.956 besøgende (+48 %), 8.804 sidevisninger, bounce 11 %, besøgstid 77 s.
  Google 3.784, Bing 1.316, Direct 949, DuckDuckGo 369, Yahoo 286. Trafikken er
  altså overvejende søgemaskinetrafik.
- **beraknare.se:** 457 besøgende (+161 %), 579 sidevisninger, bounce 8 %, besøgstid 84 s.
  Google 345. `/tidsberegner` (139) + `/dato` (106) + `/leasing` (41) + `/nedtaelling`
  (15) = 301 besøgende eller ca. 66 % af domænets baseline.
- **Voksende danske søgelandingssider:** `/dato` 1.008 (+92 %), `/boligstoette` 469
  (+72 %), `/kvadratmeter` 370 (+131 %), `/rentefradrag` 289 (+160 %).
- **Fald:** `/bmi` 1.216 → 979 (-19 %), `/su` 252 → 117 (-54 %), `/bil` 50 → 25,
  `/arveafgift` 40 → 24.
- **Højeste bounce uden for forsiden:** `/blog/barsel-2026-regler-og-satser` 85 %
  på 177 besøgende (+77 %). Forsiden har 44 % bounce på 214 besøgende; beregnerne
  ligger typisk på 2-7 %.

### Verificerede researchfund

1. **Barsel-2026 har en verificeret fagfejl og intern modstridelse.** Bloggen viser
   4.695 kr./uge, 11 øremærkede uger og 22 fælles uger
   (`src/app/blog/barsel-2026-regler-og-satser/page.tsx:35-50,85-150`), mens vores egen
   beregner og side bruger 5.085 kr. og 9/13-modellen
   (`src/components/BarselBeregner.tsx:13-15,54-58`;
   `src/app/barselsdagpenge/page.tsx:64-92`). Borger.dk oplyser 5.085 kr./uge før skat,
   137,43 kr./time ved 37 timer og 9 øremærkede + 13 overdragelige uger. Det er en reel
   tillidsfejl, ikke kun en SEO-mulighed.
2. **BMI har en dokumenteret modsætning mellem søgeintention og UI.** Værktøjet spørger om alder
   (`src/components/BMIBeregner.tsx:209-220`), men alderen indgår ikke i BMI-formlen
   (`src/components/BMIBeregner.tsx:261-312`); køn indgår kun i WHR. Børneartiklen
   sender dog læseren til voksenværktøjet og kalder det beregner for "voksne og børn"
   (`src/app/blog/bmi-for-boern-saadan-tjekker-du/page.tsx:184,430-468`). Dette kan
   forklare utilfredsstillende brug, men det er ikke alene en dokumenteret årsag til
   trafikfaldet.
3. **SU har modstridende 2026-tal mellem blog, side og beregner.** Bloggen bruger
   6.397/2.968 kr. og SU-lån 3.234 kr. (`src/app/blog/su-2026-satser-og-regler/page.tsx:35-50,85-115`),
   mens siden og komponenten bruger 7.426/3.692 kr. og 3.799 kr.
   (`src/app/su/page.tsx:46-80,119-130`; `src/components/SUBeregner.tsx:12-38`).
   `/su` svarer 200 og er teknisk tilgængelig, så et tilgængelighedsbrud er ikke
   dokumenteret. Den præcise ranking-årsag må derfor måles, ikke gættes.
4. **Den svenska domeneopsætning har reelle locale-leaks.** Live er
   `beraknare.se/loen-efter-skat` dansk, selvom `/lon-efter-skatt` er den svenska side;
   `/ugenummer`, `/flyttebudget` og `/boligsalg` serverer dansk H1/tekst med svensk canonical.
   `src/lib/page-helpers.ts:21-24` falder generelt tilbage til dansk data, og
   `CalculatorSchema` har dansk siteName/DKK som standard
   (`src/components/StructuredData.tsx:36-64`). De fire trafikstærke svenska sider
   `/tidsberegner`, `/dato`, `/nedtaelling` og `/leasing` har derimod svensk indhold og
   bør bevares som canonicale; det er ikke dokumenteret, at en slug-migrering vil hjælpe.
5. **Tre danske vækstsider har konkrete substansmuligheder.** `/kvadratmeter` nævner
   5-10 % spild i teksten (`src/app/kvadratmeter/page.tsx:77-85`), men værktøjet kan
   kun prissætte råt areal (`src/components/KvadratmeterBeregner.tsx:199-230,450-476`).
   `/rentefradrag` bruger upræcise 33,6/25,6 % uden primære kilder
   (`src/components/RentefradragBeregner.tsx:10-14`;
   `src/app/rentefradrag/page.tsx:61-92`). `/boligstoette` er en hjemmelavet,
   lineær model (`src/components/BoligstoetteBeregner.tsx:80-133`), mens bloggen og
   siden har modstridende grænser på 73.000/113.000 kr. og
   850.000/800.000 kr. henholdsvis 1.700.000/1.600.000 kr.
6. **Teknisk basis er delvis sund.** `/dato` og `/bmi` har self-canonical; trailing-slash-
   varianter `/dato/` og `/bmi/` svarer korrekt 308 til slashless canonical. Robots og
   sitemap peger på det aktive domæne. Sitemap bruger dog `new Date()` som `lastModified`
   for alle sider (`src/app/sitemap.ts:8-17`). To reelle 404-links findes i blogindhold:
   `/bilberegner` og `/huslejeberegner`. Forsiden hævder 44/44+ beregnere, mens det
   filtrerede danske katalog har 78.
7. **Dependency-sikkerhed er aktuelt grøn.** `npm audit --json` 2026-09-23: 0 critical,
   0 high, 0 moderate, 0 low. `master` har Next.js 15.5.25 og postcss-override fra
   commit 99f1e99. Docker bruger Node 22, mens `package.json` stadig mangler `engines`
   og repoet mangler `.nvmrc`; det er ikke en Fase 3-blokering, men skal med ved næste
   framework-opgradering.
8. **Autocomplete og konkurrenter peger på konkrete huller.** Forespørgselsforslag den
   23. september 2026 inkluderede bl.a. barsel far/tvillinger/dagpengesats, BMI med
   alder/køn/børn, boligstøtte pensionist/studerende/formue, kvadratmeter til gulv,
   rentefradragsbegrænsning/loft samt svenska tids-/datum-/leasingudtryk. Synlige
   konkurrenter omfatter HK/IDA/Min barsel for barsel, Sundhed.dk/I FORM/Med24 for BMI,
   Udbetaling Danmark/Online Beregner/Bolius for boligstøtte, Hjemmeland/BeregnLortet
   for materialereal og Skat/Finansberegner for rentefradrag. svenska
   kalkylator.nu/kalkylatoronline.se bruger flere svenska intent-slugs. Dette er
   søgeintents- og indholdssignaler, ikke dokumenterede Google-top-5-placeringer.

### Prioriterede opgaver — kø uden sideløb

#### 1. [x] O1 — Ret barsel-2026 og skab en tydelig næste handling fra blog til beregner — FÆRDIG 2026-09-23

- **Iteration start:** 2026-09-23. Borger.dk er læst og bekræfter 5.085 kr./uge,
  137,43 kr./time ved 37 timer, 9 øremærkede uger og op til 13 overdragelige uger.
- **Datagrund:** 177 besøgende/28d (+77 %), 85 % bounce;
  verificerede modstridende/offentlige 2026-satser.
- **Scope:** Ret sats, fordeling, overdragelse, frister og roller mod Borger.dk. Gør
  artiklen svar-først med en kort, kildeført 2026-tabel. Vis CTA til
  `/barselsdagpenge` efter den korte opsummering og tilføj et tilbage-link fra siden. Flyt
  barselgrunddata til den fælles konfigurerede satsfil, så blog, side og beregner ikke
  kan glide fra hinanden. Fjern kun konkrete påstande, der ikke kan dokumenteres.
- **Beslutning/implementering:** `BARSEL_2026` i `src/lib/satser-2026.ts` er nu
  single source for sats, perioder, frister og kilde. `beregnBarselsdagpenge` bruger
  timepris-cap'en 5.085/37, så deltid følger Borger.dk's timeeksempel; artiklen,
  kategorien, siden, `BarselBeregner` og termin-teksten bruger samme data. Artiklen
  har nu tidlig CTA og `/barselsdagpenge` har backlink.
- **Landet:** commit `98ebc2c`, merge `792d0c0`, PR #20 den 2026-09-23 23:52 CEST.
- **Verifikation 2026-09-23:** `npm run build` grøn (137 sider; 7 kendte CSS-advarsler),
  `npm run test` grøn (381/381, 43 filer), `npm run lint` grøn (338 filer),
  `npm audit --json` 0 sårbarheder. Lokal standalone SSR-check af health, artiklen,
  siden og termin-siden grøn. React Doctor: 84/100; kun én pre-existing
  duplikeret-JSX-advarsel i `termin/page.tsx`. Frisk review førte til locale-specifik
  60-dages svensk terminstart, validering af legacy URL-state og bevarelse af den
  eksisterende `/barselsdagpenge`-adgang; ingen åbne P1/P2-fund.
- **PR-CI:** Build og GitGuardian grønne. Lighthouse-CI fejlede før serverstart med
  `next: command not found`, fordi workflowen kalder bare `next start`; de fire seneste
  tidligere Lighthouse-runs har samme infrastructurefejl. Se M1.
- **Forventet effekt:** Mindre bounce, højere tillid og flere kvalificerede besøg på
  `/barselsdagpenge`; faglig korrekthed prioriteres over en optimistisk trafikprognose.
- **Acceptkriterier:**
  1. Artiklen viser 5.085 kr./uge før skat, 137,43 kr./time ved 37 timer og den
     officielle 9 + 13-fordeling med kilde + verificeringsdato.
  2. `4.695`, "11 uger øremærket" og "22 uger til fri fordeling" findes ikke som
     gældende 2026-fakta.
  3. CTA'en til `/barselsdagpenge` ligger før artiklens tredje hovedsektion, og
     `/barselsdagpenge` linker tilbage til guiden.
  4. Fælles satser bruges af beregner, side og artikel; berørte beregningstests er grønne.
  5. `npm run lint`, `npm run test` og `npm run build` er grønne.
- **MÅL:** `/blog/barsel-2026-regler-og-satser` baseline 177 besøgende/28d 2026-09-23;
  `/barselsdagpenge` baseline 191 besøgende/28d 2026-09-23.
- **Kilde:** https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-loenmodtagere-ny-orlovsmodel

#### 2. [x] O2 — Ret BMI-søgeintentionen og adskil voksenværktøjet fra børneindhold — FÆRDIG 2026-09-24

- **Datagrund:** 979 besøgende/28d (-19 %), 849 indgangssider, bounce 3 %; alder
  indgår ikke i voksnes BMI-formel, men børneartiklen sender brugeren til samme værktøj.
- **Scope:** Fjern alder som voksentinput (men ødelæg ikke gamle delte URL'er), gør
  "BMI for voksne" eksplicit, forklar at køn kun påvirker WHR, og ret børneartiklens
  CTA/relaterede-kort, så de ikke lover en børnepercentilberegner. Tilføj en tydelig
  kontekstuel CTA fra `/bmi` til børneartiklen. Byg ikke et børneværktøj uden
  dokumenterede alders-/percentilgrænser.
- **Forventet effekt:** Bedre søgeintention, færre misvisende resultater og mulig
  stabilisering af den faldende trafik; ranking-årsagen er ikke dokumenteret endnu.
- **Acceptkriterier:**
  1. Samme vægt/højde giver samme BMI uanset køn; alder vises ikke som beregningsinput.
  2. Voksenværktøjet siger eksplicit, at BMI-formlen ikke aldersjusteres; WHR-forklaring
     er korrekt og afgrænset.
  3. Børneartiklen kalder værktøjet voksentiltag og bruger linket til den faktiske
     BMI-beregning, mens percentiltabellerne står som artiklens egen kildebaserede substans.
  4. Gamle BMI-dele-URL'er indlæses stadig uden fejl.
  5. Relevante tests og fuld gate er grønne.
- **Research 2026-09-24:** Sundhed.dk bekræfter BMI = vægt (kg) / højde(m)² og
  voksenkategorierne; WHO oplyser, at BMI for voksne er 18+ og at børns BMI skal være
  alders- og kønsspecifikt. WHO's BMI-for-age-spiller blev hentet direkte fra de to
  officielle drenge-/pige-XLSX-filer; tabellen er derfor kun beholdt for 6-16 år og
  afgerdet til én decimal. Se Sundhed.dk ovenfor, WHO's BMI-for-age-side og
  https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight.
- **Beslutning/implementering:** Alder er fjernet fra BMI-input og nye delestates,
  men gamle URL-states indlæses. Et legacy `alder`-felt under 18 giver efter hydration
  en eksplicit barnestate-advarsel og intet voksent BMI-resultat før eller efter hydration. BMI er eksplicit
  for voksne i komponent, metadata, navigation, hjemmeside, kategori, footer, embed og
  assistent. Nye delelinks gemmer enhed; gamle imperiale links kan infereres sikkert ud fra
  værdierne. Enhedskonvertering er afgrænset til 30-300 kg/100-250 cm og testet i begge
  retninger. WHR er blot et råt, kønsuafhængigt forholdtal; kønvalget og ubekræftede
  risikobånd er fjernet. BMI/WHR formateres med locale-decimal.
- **Børneartikel:** Den skelner nu eksplicit mellem voksenværktøjet og børns BMI-for-age.
  ISO BMI er korrekt afgrænset fra BMI-for-age/percentil, metadata-formlen er rettet til
  `75 / 1,75² = 24,5`, eksemplet matcher WHO-tabellen, og kilder/linket er flyttet til
  familierelaterede værktøjer i stedet for kropsfedt/vægttab, der ikke er børnesikre.
- **Review og rettelser 2026-09-24:** Fresh-context reviews fandt og fik rettet manglende
  imperial enhed, barnestate, SSR-flash, WHO-tabelafvigelse, metadataformel, enhedsgrænser
  og usikre børnelinks. Sidste grænsefund blev lukket med eksplicit imperial clamping og
  blur-regression; der er ingen åbne P0-P2-fund fra O2-reviewene.
- **Verifikation 2026-09-24:** `npm run build` grøn (137 sider; 7 kendte
  CSS-optimeringsadvarsler), `npm run test` grøn (400/400, 44 filer), `npm run lint`
  grøn (339 filer), `npm audit --audit-level=high` 0 sårbarheder. Lokal standalone
  SSR-kontrol: health `status: ok`, voksenvarsel, intet BMI-resultat i SSR for voksne-
  eller barnestate, WHO-tabel og korrigeret ISO-tekst PASS. React Doctor 84/100 med den
  kendte kompleksitetsadvarsel og en tydelig `no-initialize-state`-advarsel; sidstnævnte
  er bevidst valgt for at server-rendere intet barnesystemat voksentresultat før URL-state
  er kontrolleret. Ingen suppressioner.
- **Landet:** commits `cccb5e1` + `f941976`, merge `e3f3dcf` den 2026-09-24 04:03 CEST.
- **Afgrænsning:** BMI-sideens egen `CalculatorSchema` får domænets `siteName`/valuta,
  og `www.*` normaliseres i domain-config. Den bredere locale-/canonicale middleware-
  fejl er O4-gæld; public `/api/v1` er bevidst uændret, fordi kontraten er frosset.
- **MÅL:** `/bmi` baseline 979 besøgende/28d 2026-09-23;
  `/blog/bmi-for-boern-saadan-tjekker-du` baseline ukendt i snapshot — udfyld fra næste
  trafikdata før effekten vurderes.
- **Baseline-undtagelse:** Bloggen manglede baseline i snapshot. Denne iteration er en
  korrektions- og søgeintentionsreparation; næste trafiksnapshot etablerer baseline.

#### 3. [x] FÆRDIG 2026-09-24 — O3 — Diagnosticér og ret SU-faldet samt konsolidér 2026-kilder

- **Iteration start:** 2026-09-24 04:22 CEST. Research, kode, kilder og fuld gate udføres
  serielt; ingen sideløbende O4+ task.
- **Aktuel baseline fra prompt-snapshot 2026-09-24 03:21:** `/su` 116 besøgende/28d mod
  252 i forrige 28 dage (-54 %). Bloggens baseline er ikke oplyst og forbliver ukendt.
- **Dependency-gate:** `npm audit --json` viser 0 sårbarheder i alle niveauer; den gamle
  2026-08-23-status med 1 critical/7 high er derfor ikke længere aktuel.
- **Live-diagnose:** `/su` og SU-guiden er 200 med korrekt self-canonical, `lang="da"`,
  én sitemap-URL og 308 fra trailing slash. Live indeholder de samme modstridende
  repository-beløb som O2-master, så dette er en kilde-/indholdsfejl og ikke en gammel
  build. Search Console-querydata findes hverken i repoet eller i en tilgængelig
  offentlig kilde; ranking-årsagen forbliver **uafklaret**, ikke en gæt.
- **Officiel 2026-model:** Udeboende VU/ungdom 20+ = 7.426 kr.; aktuel
  hjemmeboende ordning = 1.154 kr. grundsats plus indkomstafhængigt tillæg til højst
  3.202 kr.; VU i særlige tilfælde omfattet af ordningen fra før 1. juli 2014 = 3.692 kr.; godkendt 18-19-årig udeboende på
  ungdomsuddannelse = 4.764 kr. grundsats; forsørgertillæg = 7.426 kr.; VU-
  handicaptillæg = 10.562 kr. og er skattepligtigt. SU-lån = 3.799 kr./md, slutlån =
  9.801 kr./md, 4 % under studiet og 2,85 % fra 1. juli 2026 efter uddannelse. Almindelig
  SU-gæld betales typisk hver 2. måned; den officielle løbetid følger oprindelig gæld fra
  7 til 15 år. Værktøjet på /studielaan er derfor eksplicit et hypotetisk månedsscenario,
  ikke Udbetaling Danmarks endelige plan.
- **Fribeløb:** 15.297 kr./md på ungdomsuddannelse, 20.749 kr./md på VU og
  23.598 kr./md i indskrevet studiemåned uden SU. Et hjemmeboende VU-scenarie med kun
  grundsats er 20.749 + 2.048 = 22.797 kr./md efter su.dk's generelle
  forhøjningsregel; det publicerede 17.345-eksempel gælder ungdomsuddannelse. Årsfribeløbet
  er summen pr. måned;
  ved overfribeløb kan SU/slutlån nedsættes eller tilbagebetales, men vores gamle 1:1-
  tilbagebetalingsformel er ikke dokumenteret og fjernes.
- **Beslutning:** Tilføj `SU_2026` som central, kildeført konfiguration. Extract
  `beregnSu` + validering af de seks eksisterende delestatsfelter til ren logik. Beregneren
  viser kun beløb før skat; den faste 38 %-nettoantagelse fjernes, fordi den modvirker
  personfradraget og afhænger af den samlede indkomst. Hjemmeboende beregnes eksplicit som
  et **grundsats-scenarie** med advarsel om det indkomstafhængige tillæg; der interpoleres
  ikke uden dokumenteret officiel formel. Legacy `boligstatus=foraelder` indlæses som
  udeboende + barn under 18, mens det eksisterende `erEnligForsorger`-flag bevares, så
  delelink hverken taber barnets betydning eller opfinder forsørgertillæg. Gamle VU-links
  uden `homewardScheme` bevarer den faste 3.692-ords ordning; gamle ungdomslinks bevarer
  den aktuelle 1.154-grundsats. Kilderne er su.dk's dybe rate-, fribeløb-, forældre-,
  handicaptillæg- og SU-lånsider verificeret 2026-09-24.
- **Implementeringsstatus:** Central `SU_2026` og ren `beregnSu`-logik er implementeret.
  Hjemmeboende er et dokumenteret grundbeløbsscenario, 18-19-åriges godkendte udeboende er
  4.764 kr. + forældreafhængigt tillæg, og den særlige gamle ungdomsordning er skelnet fra
  den faste ordning fra 20 år. Barn under 18, forsørgertillæg og forældrelån er modelleret
  som tre uafhængige forhold. Handicaptillægets nedsatte fribeløb gælder kun valgte
  SU-måneder. Resultater vises før skat; 38 %-nettoantagelsen og den u dokumenterede
  1:1-tilbagebetalingsformel er fjernet. Gamle delelinks er normaliseret uden at opfinde
  forsørgerstate, gamle VU-links bevarer 3.692 kr., og gamle ungdomslinks bevarer 1.154 kr.
  SU-resultatet venter på URL-hydrering for at undgå et forkert resultat-flash. Alle
  synlige 2026-beløb i `/su`, SU-guiden, metadata, kategori, ungdomsguide og Studielån er
  afledt fra den centrale konfiguration; Studielån er mærket som et hypotetisk månedsscenario,
  fordi den officielle plan betales hver 2. måned og afhænger af oprindelig gæld.
- **Review 2026-09-24:** Fresh-context review fandt og fik rettet legacy VU/youth-migration,
  legacy+barn, `foraelder`-state, handicaptillægs-måneder, forældrelån, dødt kilde-link,
  tom rente, ikke-finitt input og manglende statusannoncering. Slutreview fandt ingen
  åbne P0-P2-fund.
- **Kvalitetsgate 2026-09-24 07:09:** `npm run lint` grøn (345 filer), `npm run test`
  grøn (439/439 tests, 48 filer), `npm run build` grøn (137 sider; 7 kendte
  CSS-optimeringsadvarsler) og `npm audit --audit-level=high` 0 sårbarheder. Lokal
  standalone-SSR-kontrol passede health, `/su`, SU-guiden og `/studielaan`; `/su/`
  gav 308. React Doctor: 82/100 med to kendte/intentionelle advarsler om høj
  kontrolflow-kompleksitet og URL-state initialisering.
- **Landet:** O3-kode, tests og planens gate ligger i commit `cc173c5`; merge til
  `master` og deploy-note følger efter denne planopdatering.

- **Datagrund:** 116 besøgende/28d mod 252 tidligere (-54 %). Live er 200, men blog,
  side og beregner har tre forskellige sæt satser. Det er dokumenterede modstridende
  oplysninger, men ikke en dokumenteret ranking-årsag.
- **Scope:** Først verificér hver officiel 2026-sats, aldersgruppe, fribeløb og
  SU-lån på su.dk. Sammenlign canonical, title og live-indhold, og dokumentér
  tilgængelig Search Console-querydata pr. side. Centralisér de officielle konstanter,
  ret den faste 38 % skatteantagelse eller mærk den klart som vejledende, og gør
  blog/side/beregner ens. Bevar URL og eksisterende deletilstand.
- **Forventet effekt:** Bedre tillid og bedre søgeintention; muligvis genopretning af trafik efter
  konsistens og kildeopdatering. Ingen konkrete ranking- eller volumenhæftelser.
- **Acceptkriterier:**
  1. Hvert viste 2026-tal har en primær su.dk-kilde og verificeringsdato.
  2. Ingen modstridende 6.397/7.426-, 2.968/3.692- eller 3.234/3.799-tal findes.
  3. Beregningsregler: tests dækker enkelt/par, uddannelse, fribeløb og gammel URL-state.
  4. Hvis Search Console ikke kan læses, står ranking-årsagen eksplicit som
     "uafklaret"; den opfindes ikke.
  5. Fuld gate er grøn.
- **MÅL:** `/su` baseline 116 besøgende/28d 2026-09-24;
  `/blog/su-2026-satser-og-regler` baseline ukendt i snapshot — udfyld fra næste
  trafikdata før effekten vurderes.
- **Kilde:** https://www.su.dk

#### 4. [x] FÆRDIG 2026-09-24 — O4 — Lås beraknare.se's locale, canonicale og svensk opdagelse

- **Iteration start:** 2026-09-24 07:45 CEST. Tre tidligere deploynoter er
  indholdskontrolleret efter 07:30-vinduet; O4's locale-research, implementation og gate
  fortsætter serielt uden sideløbende opgave.
- **Datagrund:** 457 besøgende/28d (+161 %), 345 besøgende fra Google, 301 besøgende på fire
  nye/eksisterende top-sider. Live viser danske duplikerede/fallback-sider på det
  svenska domæne og dansk JSON-LD-standardværdier.
- **Scope:** Behold eksisterende `/tidsberegner`, `/dato`, `/nedtaelling`, `/leasing`,
  `/lon-efter-skatt` og `/bolan` som canonicale; lav ingen dansk-slug-migrering. Indfør
  én testet locale-/availability-matrix, så DA-only-ruter ikke self-canonicaliserer på
  beraknare.se. Giv `CalculatorSchema`/OG/SearchBar domæne- og valutadata. Etablér
  301-aliaser kun for semantisk identiske kandidater efter kontrol af eksisterende
  ruter/links: `/loen-efter-skat` → `/lon-efter-skatt` er verificeret dublet;
  `/tidskalkylator` → `/tidsberegner`, `/datumkalkylator` → `/dato`,
  `/nedrakning` → `/nedtaelling` og `/leasingkalkylator` → `/leasing` er research-
  kandidater fra svenske søgeintentioner, ikke eksisterende trafik-URL'er. Tilføj manglende
  interne svenska links. `beregner.no` må ikke få hreflang før domænet er live.
- **Research 2026-09-24 07:45-08:20:** `npm audit --audit-level=high` er grøn med
  0 sårbarheder. Katalogen, page-data og den fysiske route-tree har tre forskellige
  tilgængeligheder: 80 ruter findes, men side/beregner har 78 DA-, 53 SE- og 28 NO-sider.
  `/ugenummer` og `/flyttebudget` er kun danske trods manglende flag; `/lon-efter-skatt` og
  `/bolan` er kun svenske. Dansk blog/kategori er skjult fra svensk sitemap/footer, men
  stadig 200 med dansk indhold. Før implementationen satte middleware de afledte headers
  på response, ikke som request-header override. 77/80 `CalculatorSchema`-kald bruger
  hardcoded MinBeregner.dk/DKK, og barnets OG/search-tekst mangler siteName/locale.
- **Aliasresearch:** De fire svenske kandidater er 404 live, mens deres eksisterende
  mål/matchende svenska peers allerede bruger samme H1/intent: tidskalkylator,
  datumkalkylator, nedräkning og leasingkalkylator. De godkendes som domænespecifikke
  301-aliaser. `/loen-efter-skat` → `/lon-efter-skatt` er **ikke** en global dansk→svensk
  modelmigrering: på `beraknare.se` sender den danske slug til den svenske skattemodel,
  mens `/minberegner.dk/loen-efter-skat` forbliver dansk canonical. Aliaset bevarer query.
- **Beslutning:** En central request-time matrix i middleware bruger
  `calculator-list.ts` som locale-kilde, markerer de to reelle DA-only-sider og returnerer
  404 ved DA/SE-mismatch. `/blog` og `/kategori` er DA-only på svensk host. Den eksisterende
  `getPageData(slug, locale) || ...da`-fallback bevares som interne forsvar, men kan ikke
  længere nås gennem en live DA/SE-anmodning. Request headers sættes eksplicit; metadata
  gør canonical/hreflang fail-closed og løn-parret får ægte DA/SE-alternater.
  `CalculatorSchema` afleder siteName/currency fra URL-host, OG og search får samme
  domæne-/locale-kontekst, og sitemap/robots får rene, testede byggefunktioner.
  Next.js' indbyggede trailing-slash-redirect løb før middleware og skabte kæder ved
  svenske aliaser. `skipTrailingSlashRedirect` og eksplicit 308-normalisering i
  `getRouteDecision` bevarer slashless canonicale ruter, ét 301-hop for de fem
  godkendte aliaser og 308-normalisering for API-ruter. 404-rewriten bruger
  domænets HTTPS-base-URL og videresender request-heads, så svenske 404-sider ikke
  falder tilbage til localhost eller dansk metadata. FQDN-trailing-dot normaliseres,
  Domæneopslag bruger own-property lookup, så prototype-værdier ikke kan give 500.
  Schema-provideren bruger samme normaliserede apex-URL som canonical/domæneconfig, så
  `www` ikke kan lække en separat provider-URL.
- **Implementering:** Availability-matrixen er nu centraliseret i
  `src/lib/calculator-list.ts` + `src/lib/routing.ts`; `ugenummer` og `flyttebudget`
  er DA-only, `lon-efter-skatt` og `bolan` SE-only, og blog/kategori er DA-only på
  beraknare.se. Metadata, hreflang, JSON-LD, OG, search, robots og sitemap bruger
  den aktive host; cookiepolitik, informationssider, kategori og blog- OG har egen
  canonical/hostdata. `/api/v1`-responsformer er uændrede; mellembuilden har 0
  kendte sårbarheder.
- **Review og rettelser 2026-09-24:** To friske reviews fandt og fik rettet en
  forudgående 308→301-kæde for trailing-slash-aliaser, localhost/fejlvært 404-rewrite,
  manglende cookiecanonical/OG, child-OG-værdier og 404-header-dækning. Den anden
  review fandt desuden FQDN-trailing-dot og prototype-hostfejl; begge er nu dækket af
  tests. Slutreview fandt ingen åbne P1/P2-fund.
- **Kvalitetsgate 2026-09-24 09:36 CEST:** `npm run build` grøn (137 sider; 7 kendte
  CSS-optimeringsadvarsler), `npm run test` grøn (484/484 tests, 53 filer), `npm run lint`
  grøn (352 filer), `npm audit --audit-level=high` 0 sårbarheder. Lokal production-HTTP-
  matrix passede DA/SE 200/404, alias/trailing-slash, svensk canonical/lang/JSON-LD/OG/
  search, info-canonicaler, sitemap, robots, API-trailing og edge-host cases. React Doctor
  scannede 52 filer med 74/100 og ingen rapporterede issues.
- **Landet:** O4-kode, tests og plan ligger i commit `7ddfa8c`; merge til `master` er
  `1dc1c86`, og begge refs blev pushet 2026-09-24 09:40 CEST.
- **Forventet effekt:** Beskytter den dokumenterede +161 % vækst, fjerner dansk self-
  canonical på svensk domæne og forbedrer svensk opdagelse/CTR uden at migrere de
  fire stærkeste URL'er.
- **Acceptkriterier:**
  1. `/tidsberegner`, `/dato`, `/nedtaelling` og `/leasing` har 200, self-canonical,
     `lang="sv"` og ingen redirect fra sig selv.
  2. DA-only-sider på beraknare.se og SE-only-sider på minberegner.dk har én testet
     404/410/redirect-politik og ingen dansk fallback-tekst.
  3. Godkendte aliases er ét 308/301-hop, bevarer forespørgselsparametre og danner ingen kæder.
  4. Svensk JSON-LD bruger Beräknare.se + SEK; svensk OG/søgetekst er svensk.
  5. Host/locale/canonical/hreflang/robots/sitemap har en automatisk matrix-test.
  6. Fuld gate er grøn, og eksisterende canonicale live-sider er indholdskontrolleret efter deploy.
- **MÅL:** `beraknare.se` baseline 457 besøgende/28d 2026-09-23; `/tidsberegner` 139;
  `/dato` 106; `/leasing` 41; `/` 17; `/nedtaelling` 15 — alle 2026-09-23.
  Før en yderligere konkret svensk side ændres, skal dens `MÅL`-baseline fra
  trafiksnapshotet skrives her; ukendt baseline må ikke erstattes med 0.

#### 5. [x] FÆRDIG 2026-09-25 — O5 — Gør boligstøtte til et troværdigt screeningestimat

- **Iteration start:** 2026-09-24 10:20 CEST; genoptaget og sluttet 2026-09-25 00:34
  CEST efter checkpoint af lokalt review-arbejde.
- **Datagrund:** Seneste snapshot 2026-09-24 23:10: 493 besøgende/28d (+83 %),
  bounce 2 %, 449 indgangssider. Den tidligere baseline var 469 besøgende/28d
  2026-09-23. Den eksisterende model var stærkt forenklet, og side/blog havde
  modstridende 2026-grænser.
- **Scope:** Verificér boligudgift, indkomst, formue, husstands-/arealgrænser og
  minimum mod officielle oplysninger fra Udbetaling Danmark. Udtræk logikken til ren,
  testet funktion. Enten implementér kun dokumenterede regler med 3-5 officielle
  testeksempler, eller mærk værktøjet tydeligt som groft screeningestimat. Fjern ubrugte
  konstanter/input, tilføj tydelig CTA til den officielle beregner uden login, og gør
  blog/side samlet.
- **Research 2026-09-24 10:20:** Borger.dk/Udbetaling Danmarks officielle søgning og
  selvbetjeningssider bekræfter, at resultatet er vejledende, at særlige tilfælde ikke
  indgår, og at husstandsindkomst, formue, antal børn/voksne, husleje og areal påvirker
  resultatet. Officielle 2026-maksima pr. måned er for lejere uden pension 1.194 kr.
  (0 børn), 4.201 kr. (1-3 børn) og 5.251 kr. (4+); nye førtidspensionister har
  4.201 kr. (0-3 børn) og 5.251 kr. (4+), mens folkepensionister og gamle
  førtidspensionister har 4.969 kr. (0-3 børn) og 6.211 kr. (4+). Formuen har ingen
  øvre ret til at få støtte, men 10 % regnes med fra 896.400 kr. hhv. 1.060.300 kr. og
  20 % fra 1.793.000 kr. hhv. 2.120.800 kr.; de viste nedre grænser er inklusive.
  Huslejen skal oplyses uden el, varme, varmt vand, telefon/internet, garage, depositum
  m.fl. Den officielle beregner kan fortsættes uden login. Kilder: Borger.dk
  `soeg-boligstoette` og boligstoette.dk `basisoplysninger`, læst 2026-09-24.
- **Beslutning:** Brug dokumenteret screening, ikke en ny officiel formel. Den lokale
  beregner viser 0 til det officielle 2026-maksimum, men aldrig højere end den faktiske
  husleje, bruger de inklusive formuegrænser til at vise konsekvensen, og siger eksplicit
  at indkomst, areal, særlige ordninger og den endelige ret kræver Udbetaling Danmarks
  beregner. 73.000/113.000 kr., 800.000/1.600.000/850.000/1.700.000 kr. og det gamle
  304 kr-mindstebeløb fjernes fra alle O5-flader, indtil de kan dokumenteres.
- **Implementeringsretning:** Central `BOLIGSTOETTE_2026`-konfiguration, ren
  `beregnBoligstoette`-funktion, URL-normalisering med legacy-stater, komponent- og
  indholdstests samt synlig official-CTA på side og blog. Ingen public API-ændring.
- **Implementeringsstatus 2026-09-25:** Konfigurationen, den rene funktion og
  normalisering er implementeret. UI'en bruger husleje, indkomst, husstandsstørrelse,
  antal børn, pensionstatus, formue og areal; den døde `boligType` og de gamle lokale
  2026-konstanter er fjernet. Resultatet vises som 0–min(husleje, officielt maksimum),
  og formuejusteringen vises udtrykkeligt som et forenklet screening-signal. Side,
  metadata, kategori-, home- og blogdata er aligning til screening-sproget; official-CTA
  er synlig på begge hovedflader. Checkpoint `204043c` samlede de bevarede privacy-,
  legacy-state- og review-ændringer; sluttelsen retter sidste reviewfund.
- **Review og rettelser 2026-09-25:** Tidligere reviews fandt og fik rettet manglende
  enheder, legacy-profile, fuldt state-roundtrip, uvedkommende CTA-copy og manglende
  advarsel om økonomiske data. To uafhængige slutreviews fandt tre reelle P2-fejl:
  formuetabellerne inkluderede trods logikken den lave grænse, et interval tæt på
  100 % af huslejen blev vist som 99 %, og clipboard-fallback meldte succes ved fejl.
  Alle tre har nu failing-test-først-rettelser: intervallet er “over” den lave grænse,
  et capped interval vises som “under 100 %” uden at fordreje funktionen, og
  copy-fejl får et lokaliseret `role="alert"`. Slutreview fandt ingen åbne P0-P2-fund.
  History-state og samme rute-navigation blev bekræftet som tilsigtede, site-wide
  scriptisolering som et separat trusselsmodel-projekt og offline-fallback for
  query-delelinks som et bevidst privacy-tradeoff; norsk juridisk fallback er
  pre-existing og uden for O5.
- **Slutgate 2026-09-25 00:34 CEST:** `npm run build` grøn (137 sider; 7 kendte CSS-
  advarsler), `npm run test` grøn (562/562 tests, 58 filer), `npm run lint` grøn
  (359 filer), `npm audit --audit-level=high` 0 sårbarheder. React Doctor 77/100 med
  otte maintainability-advarsler om duplikeret JSX og komponentstørrelse/-kompleksitet;
  ingen rapporterede correctness- eller security-fejl. Lokal standalone-HTTP-kontrol
  passerede health, `/boligstoette`, artiklen og `Referrer-Policy: no-referrer`.
  Fersk domæne- og React/privacy-slutreview: godkendt, ingen åbne P0-P2-fund.
- **Landet:** O5-kode og plan i commits `f8227f3`, `204043c` og `2ef8082`;
  merge til `master` er `0ed3ec3` den 2026-09-25 00:37 CEST. Både
  `ceo/boligstoette-screening` og `master` blev pushet.
- **Forventet effekt:** Beskytter en stærk vækstside mod fejltillid, øger tillid og
  flytter useren til den officielle næste handling; ikke dokumenteret bounce-reduktion.
- **Acceptkriterier:**
  1. 3-5 officielle testeksempler består, eller den endelige tekst erklærer eksplicit,
     at modellen ikke er en officiel ansøgningsberegning.
  2. Alle viste beløb har primær kilde + verificeringsdato; ingen 73.000/113.000- eller
     800.000/850.000-konflikt.
  3. Ingen deklarerede UI-felter/konstanter er ubrugte; kanttilfælde har tests.
  4. Den officielle beregner er en synlig næste handling på både side og blog.
  5. Fuld gate er grøn.
- **MÅL:** `/boligstoette` baseline 493 besøgende/28d 2026-09-24 (snapshot
  2026-09-24 23:10); `/blog/boligstoette-2026-nye-regler` baseline ukendt i snapshot —
  udfyld fra næste trafikdata før effekten vurderes.
- **Kilde:** https://www.boligstoette.dk/bos-selvbetjening/beregner/basisoplysninger

#### 6. [x] FÆRDIG 2026-09-25 — C1 — Løft CTR på `/procent` med svar-først title og description

- **Datagrund:** Search Console 2026-08-25–2026-09-22: 148.870 visninger,
  96 klik, CTR 0,1 %, gennemsnitlig position 7,5. Største søgninger er
  “procentberegner” (257 visninger, position 8) og “10 procent af” (47, position 6).
  Plausible-besøgsbaseline for `/procent` mangler i det seneste snapshot.
- **Nuværende metadata før ændring (live 2026-09-25 00:41 CEST):** title
  “Procentberegner - Beregn procent nemt og gratis | MinBeregner.dk”; description
  “Beregn procent hurtigt. Eksempel: 15% af 2.500 kr = 375 kr. Find procent af et
  tal, beregn stigning/fald, eller regn baglæns. Gratis procentberegner.” Den synlige
  intro beskriver kun fire beregningstyper og giver ikke et konkret svar på “10 procent af”.
- **Research 2026-09-25 00:42 CEST:** Google Autocomplete foreslår “procentberegner
  stigning”, “procentberegner fald” og “procentberegner formel”; “10 procent af” får
  konkrete efterfølgere som 100, 200, 75, 1.600 og 25.000. Google/DuckDuckGo viste
  bot-/JS-blokering, så kvalitative SERP-signaler blev verificeret hos Brave Search.
  synlige konkurrenter lovede “find procenten af et tal”, “find procent af et tal” og
  konkrete formler/eksempler; bl.a. Procentregning-online, Procentregning.dk,
  Hjemmeland og Proberegner.dk. Googles egen PAA kunne ikke hentes troværdigt, så ingen
  aktuel Google-placering eller PAA-rangering påstås.
- **Scope:** Research først SERP/snippets og autosuggest. Ret kun title, description og
  synligt svar, så siden direkte løser procentberegning og “10 procent af”-type spørgsmål;
  bevar matematik, URL og interne links. Ingen nye afsnit eller tynd SEO-tekst.
- **Beslutning/implementering:** Den eksisterende synlige intro bliver selve det korte
  svar: “10 procent af 250 er 25” efterfulgt af de allerede understøttede hensigter.
  Metadata, OG og schema-description bruger samme konkrete svar. DA og SE får
  lokaliserede varianter; URL, canonical, matematik, beregnerens starttilstand og
  interne links er uændrede. En regressionstest sikrer title ≤60 tegn,
  description ≤160 tegn og det synlige eksempel på begge live-domæner.
- **Review og rettelser 2026-09-25:** Fresh-context review fandt en reel P2-testmangel:
  page-data-testen alene bevægede ikke, at siden rent faktisk viste svaret, og dækkede
  ikke ændret OG/schema-copy. Ny route-render-test for DA/SE plus metadata/OG/schema-
  assertions lukkede fundet. Slutreview godkendte uden åbne P0-P2-fund.
- **Kvalitetsgate 2026-09-25 00:50 CEST:** `npm run build` grøn (137 sider + typecheck;
  7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (568/568 tests, 59 filer),
  `npm run lint` grøn (360 filer) og `npm audit --audit-level=high` 0 sårbarheder.
  Lokal production-SSR-kontrol passede DA/SE title, description, synligt svar og
  bevarede beregner; `/api/health` svarede `status: ok`.
- **Landet:** C1-kode, tests og plan i commit `0be4841`; merge til `master` er
  `98306a7` den 2026-09-25 00:52 CEST.
- **Forventet effekt:** Størst CTR-effekt i den voksende danske trafik: siden har allerede
  7-8 placeringer, men 0,1 % CTR efterlader mange kvalificerede visninger.
- **Acceptkriterier:** Search Console-baseline og nuværende metadata står her; title og
  description matcher søgeintentionerne; spørgsmålstyper besvares synligt uden at skjule
  beregneren; eksisterende logiktests og fuld gate er grønne.
- **MÅL:** `/procent` Search Console baseline 148.870 visninger/28d, 96 klik, CTR 0,1 %,
  position 7,5 pr. 2026-09-22; Plausal baseline **ukendt**, ikke 0. Effekt måles først
  efter mindst 14 dage.
- **Researchkilder:** Google Autocomplete (`procentberegner`, `10 procent af`),
  Brave Search SERP for samme to intentioner, samt de linkede konkurrenters
  publicerede metadata/sideindhold læst 2026-09-25. Ingen ranking eller PAA
  udledes af autocomplete.
  Kilder: https://suggestqueries.google.com/complete/search?client=firefox&hl=da&q=procentberegner;
  https://search.brave.com/search?q=procentberegner&source=web;
  https://www.procentregning-online.dk/; https://procent-regning.dk/;
  https://hjemmeland.dk/beregnere/procentregning/;
  https://www.proberegner.dk/beregnere/procentberegner/.

#### 7. [x] FÆRDIG 2026-09-25 — C2 — Løft `/dato` CTR og svar direkte på dage-spørgsmål

- **Datagrund:** Search Console: 128.065 visninger, 784 klik, CTR 0,6 %, position 5,8.
  “dage mellem datoer” (448, position 5), “antal dage mellem to datoer” (257, position 5),
  “hvor mange dage er der tilbage af 2026” (212, position 5). Plausible:
  1.028 besøgende/28d, bounce 5 %, 949 indgangssider pr. 2026-09-24.
- **Scope:** Ret title/description og svar-først indhold til de eksisterende
  dage-mellem-formål. Researchér først, om konkrete `/dage-til/[dato]`-landingsider har
  dokumenteret efterspørgsel; byg ingen mange variationer, og undgå slugs/date-konflikter.
- **Research 2026-09-25 01:26 CEST:** Fem læsbare danske konkurrenter bruger
  opgaven “dage mellem to datoer” tidligt i title og beskriver konkrete resultater;
  flere forklarer tællereglen, og stærke sider skelner mellem kalenderdage,
  arbejdsdage og inkluderede endepunkter. Google/Brave/DuckDuckGo viste blokering, så
  ingen Google-placering eller PAA-rangering er udledt. Autocomplete dokumenterer
  både generiske to-datoers- og “dage til [begivenhed]”-intents, men ikke volumen.
  Search Console har ingen dokumenteret cluster til en bestemt dato; `/nedtaelling`
  dækker allerede dato-til-intent. Beslutning: **ingen `/dage-til/[dato]`-route i C2**.
  Den eksisterende `/dato` får DA/SE title, description, H1/intro, OG og schema-copy
  centreret om “antal dage mellem to datoer”; URL, canonical, hreflang, sitemap og
  beregnerlogik er uændrede. `npm audit --json` viser 0 sårbarheder.
- **Implementering 2026-09-25:** DA/SE side-data, H1/intro, title, description, keywords,
  OG, schema og FAQ er nu samlet om “antal dage mellem to datoer”. Månedsresultatet er
  korrekt kvalificeret som cirkulært/ungefärligt i metadata, schema og forklaring. En ny
  DA/SE route-rendertest låser H1, synligt svar og bevaret beregner.
- **Review 2026-09-25:** To friske reviews fandt og fik rettet svensk grammatik,
  manglende kvalificering af den approximative månedsberegning og et testhul, hvor den
  dynamiske beregner ikke blev krævet. Slutreview fandt ingen åbne P0-P2-fund.
- **Kvalitetsgate 2026-09-25 01:50 CEST:** `npm run build` grøn (137 sider + typecheck;
  7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (572/572 tests, 60 filer),
  `npm run lint` grøn (361 filer) og `npm audit --json` 0 sårbarheder. Lokal
  production-HTTP-kontrol passede DA/SE title, H1, canonical, schema-copy og
  `/api/health` med `status: ok`.
- **Landet:** C2-kode, tests og plan i commit `80d672c`; merge til `master` er
  `be7d30e` den 2026-09-25 01:54 CEST. Både `ceo/dato-ctr` og `master` blev pushet.
- **Forventet effekt:** Stærk CTR på eksisterende høj placering og bedre overførsel fra
  spørgsmål til selve dato-værktøjet.
- **Acceptkriterier:** Baselines skrives før ændring; title/description svarer på
  “antal dage mellem to datoer”; et eventuelt datolink kun hvis forskning dokumenterer
  reel efterspørgsel og dynamisk korrekt dato; fuld gate grøn.
- **MÅL:** `/dato` baseline 1.028 besøgende/28d 2026-09-24; Search Console 128.065
  visninger, 784 klik, CTR 0,6 %, position 5,8 pr. 2026-09-22.

#### 8. [x] FÆRDIG 2026-09-25 — C3 — Løft CTR på `/tidsberegner` og `/moms`

- **Datagrund:** Search Console: `/tidsberegner` 71.966 visninger, 207 klik, CTR 0,3 %,
  position 7,0; `/moms` 23.735 visninger, 39 klik, CTR 0,2 %, position 6,8. Plausible:
  `/tidsberegner` 292 besøgende/28d og `/moms` findes ikke i top-siderlisten pr.
  2026-09-24.
- **Scope:** Research snippets/autosuggest og ret title, description og synligt
  svar-first indhold på de to eksisterende sider. Behandles som én CTR-iteration kun
  hvis diffen forbliver lille; ellers skilles i to opgaver. Ingen matematikændringer.
- **Dependency-gate:** `npm audit --json` 2026-09-25 viser 0 sårbarheder; den
  eksterne afhængighedsrapport fra 2026-08-23 er stale for dette projekt.
- **Nuværende copy:** Live DA/SE 2026-09-25 har de generiske intros “Beregn tid mellem
  to tidspunkter” og “Beregn dansk moms (25%). Tillæg, fratræk eller find
  momsandelen”. `/tidsberegner` har desuden et 75-tegns title; ingen af siderne
  svarer synligt med et konkret 1.000-kr.-eksempel.
- **Research 2026-09-25:** Google-autosuggest peger på “mellem klokkeslæt”, timer og
  “beregn tid”; for moms på “moms inkl./ekskl.”, “læg moms til” og “træk moms fra”.
  Læsbare konkurrenter (Tidsberegner.dk, Tid & Sted, MomsBeregner.dk,
  MomsBeregning.dk og Momsudregner.dk) gør netop disse opgaver synlige. Google/Brave/
  DuckDuckGo viste delvis bot-blokering, så ingen aktuel rangering eller PAA-
  placering er udledt. Kilder: Google autocomplete, Ecosia/Yahoo/Bing-søgninger og de
  fem offentlige konkurrenters sider læst 2026-09-25.
- **Beslutning/implementering:** Central `PageData` for DA/SE får korte, intent-matchende
  titles og konkrete answer-first intros. Tidssiden får 08:30–16:45-eksemplet; moms
  får 1.000 → 1.250 kr. og inkl./ekskl.-retning. Moms-eksemplet er eksplicit bundet
  til standard-satsen 25 %. URL, canonical, hreflang, beregnerlogik og public API er
  uændrede.
- **Reviewfund 2026-09-25 03:16:** To friske reviews fandt to reelle, men
  pre-existing calculatorfejl: TidsBeregner lægger 24 timer på to gange over midnat
  (`src/components/TidsBeregner.tsx:143-154`), og den svenske moms-UI har 25/12/6 %-
  vælgere, men statiske 1,25-/20 %-formler (`src/components/MomsBeregner.tsx:69-81,344-376`).
  Begge er verificeret i kode og uden for C3's eksplicitte copy-only scope. C3's nye
  copy lover derfor hverken datoforlængelse eller 12/6 %-resultater. Fejlene er
  prioriteret som T4/T5 nedenfor og bliver ikke blandet ind i CTR-committen.
- **Implementering 2026-09-25:** DA/SE `description`, `metaTitle`, `metaDescription`,
  `ogTitle`, `ogDescription` og `schemaDescription` er nu svar-først. Fire routetests
  renderer DA/SE og verificerer H1, intro, rigtig JSON-LD og at beregneren stadig er
  til stede; page-data- og metadata-helperne låser DA/SE title ≤60, description ≤160,
  canonicale og konkret eksempel. Ingen calculator-, URL-, API- eller sitemap-diff.
- **Review og rettelser 2026-09-25:** To friske reviews fandt de to pre-existing fejl i
  T4/T5, upræcis pauseformulering, svensk 1.000 → 1.250-kvalificering og for løst
  schema-sprog. C3-copy blev strammet til understøttede same-clock/pause-formål, og
  moms-eksemplet bundet til 25 %; schema + route-wiring fik exact tests. Slutreview:
  ingen åbne P0-P2-fund i C3.
- **Kvalitetsgate 2026-09-25 03:18 CEST:** `npm run build` grøn (137 sider + typecheck;
  7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (585/585 tests, 62 filer),
  `npm run lint` grøn (363 filer), `npm audit --json` 0 sårbarheder. Fjerne nye
  route-tests fejlede først med 12 forventede copy-fund og var grønne efter fixen.
  Lokal standalone-HTTP-kontrol passede DA/SE `/tidsberegner` og `/moms` med title,
  synlig copy og JSON-LD; `/api/health` svarede 200.
- **Landet:** C3-kode, tests og plan i commit `6451710`; merge til `master` er
  `ef1079e`. Begge refs blev pushet 2026-09-25 03:23 CEST.
- **Forventet effekt:** Laver CTR-hængning ved position 6-7 bliver til kvalificeret
  trafik på to eksisterende værktøjer.
- **Acceptkriterier:** Baselines for begge sider skrives før ændring; snippets svarer på
  henholdsvis “beregn tid” og “momsberegner”; fuld gate grøn.
- **MÅL:** `/tidsberegner` baseline 292 besøgende/28d 2026-09-24; `/moms`
  Plausible-baseline **ukendt**. Search Console: 71.966/23.735 visninger,
  207/39 klik, CTR 0,3/0,2 %, position 7,0/6,8 pr. 2026-09-22.

#### 9. [x] FÆRDIG 2026-09-25 — T4 — Ret TidsBeregnerens dobbelte midnatstælling

- **Iteration start:** 2026-09-25 05:23 CEST. T4 blev fortsat fra et lokalt
  `ceo/tidsberegner-midnat`-checkpoint; ingen sideløbende opgave blev startet.
- **Datagrund:** C3-review 2026-09-25 fandt P1: koden gør både `slutMinutter += 24h`
  og `totalDage = 1`, hvorefter `totalDage` igen lægges til. 22:00–06:00 bliver derfor
  32 timer, selvom FAQ, nattevagt-preset og beregnerens løfte forventer 8 timer.
- **Scope:** Extract ren, testet tidslogik. Bevar URL-state og UI; understøt samme dag,
  over midnat uden datoer og eksplicit næste dato uden dobbelt 24-timers addition.
  Ret FAQ/preset, hvis den korrigerede logik ændrer den dokumenterede forventning.
- **Implementering:** Beregningen ligger nu i `src/lib/tidsberegner.ts`. Heltidsdage
  beregnes som UTC-datoafstand, mens den automatiske 24-timers forlængelse kun tilføjes,
  når der ikke er dage mellem datoerne. 08:30–16:45 er derfor 8:15 uden datoer og
  på samme dato; med næste dato er den korrekte elapsedtid 32:15. 22:00–06:00 er 8:00
  både uden datoer, på samme dato og med næste dato. En 30-minutters pause trækkes fra i
  alle varianter. To-dages dataintervaller om forårs-/efterårsskift,
  ugyldige datoer/tider, omvendt datointerval og ikke-finitt pause er dækket; negative
  og ekstreme pauseværdier bevarer den tidligere beregningsadfærd. DA/SE URL-state
  roundtripper uændret.
- **Acceptkriterier:**
  1. 08:30–16:45 = 8:15 uden/samme dato (32:15 med næste dato), og 22:00–06:00 = 8:00
     uden, samme eller næste dato. **PASS**
  2. 30 minutters pause trækkes fra i hver gyldig variant; negative/ugyldige intervaller
     følger eksisterende UI-adfærd. **PASS**
  3. DA/SE dele-URL-state roundtripper og fuld gate er grøn. **PASS**
- **Review 2026-09-25 05:49 CEST:** Første friske review fandt 1 P1 og 2 P2: ikke-finitt
  pause kunne vise `NaN`, en ugyldig én-sidet dato blev ignoreret, og samme dato/DST manglede
  i tests. De er rettet og dækket. Slutreview efter forårs- og efterårscase fandt
  0 P0-P3.
- **Kvalitetsgate 2026-09-25 05:55 CEST:** `npm run build` grøn (137 sider + typecheck;
  7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (604/604 tests, 64 filer),
  `npm run lint` grøn (366 filer) og `npm audit --json` 0 sårbarheder. React Doctor
  scannede den ændrede React-fil med 81/100 og ingen rapporterede issues. Lokal
  standalone-SSR-kontrol passede `/tidsberegner`; `/api/health` svarede `status: ok`.
- **Forventet effekt:** Genopretter beregningernes troværdighed på en side med høj
  søgetrafik; prioritet er korrekthed, ikke ny trafik.
- **MÅL:** `/tidsberegner` baseline 292 besøgende/28d 2026-09-24; Search Console
  71.966 visninger, 207 klik, CTR 0,3 %, position 7,0 pr. 2026-09-22.
- **Landet:** T4-kode, tests og plan ligger i commit `b12d368`; merge til `master` er
  `e339937` den 2026-09-25 05:57 CEST. Begge refs blev pushet 2026-09-25 05:59 CEST.

#### 10. [x] FÆRDIG 2026-09-25 — T5 — Gør svensk moms-UI og FAQ satsafhængige

- **Datagrund:** C3-review 2026-09-25 fandt, at SE kan vælge 25/12/6 % og beregner
  korrekt, men info-/formelteksten altid viser 1,25 og 20 % moms
  (`src/components/MomsBeregner.tsx:69-81,344-376`). Det modsiger sidecopy, FAQ og
  reducerede satser.
- **Scope:** Udtræk satsafhængig formel- og info-copy til den valgte 25/12/6 %-sats,
  med korrekt multiplikator, divisor og momsandel. Bevar dansk 25 %-adfærd og URL-state.
- **Beslutning/implementering:** DA/NO normaliserer alle URL-states til 25 %; SE
  accepterer kun 25/12/6 %. Resultater, reference, info og formler følger den valgte
  sats. Statisk metadata, synlig FAQ og FAQ-JSON-LD beskriver alle tre svenske satser,
  fordi satsvalget er klientstate. URL-state skjules før hydration, så et 12/6-procent-
  delelink ikke blinker med 25 %, og beregningen samt analytics venter på den kontrollerede
  state. DA/NO-copy, URL, canonical, public API og momslogikkens URL-form er bevaret.
- **Review og rettelser 2026-09-25:** Første fresh review fandt den statiske FAQ/schema
  stadig fastlåst til 25 % og for smalt URL-roundtrip. Failing tests blev tilføjet, FAQ,
  metadata og schema blev gjort satsdækkende, og URL-tests bruger nu ikke-default beløb og
  fratrækningsvalg. Slutreview fand ingen åbne P0-P2-fund.
- **Acceptkriterier:**
  1. 1.000 kr. bliver 1.250/1.120/1.060 kr. ved 25/12/6 % i beregning og copy. **PASS**
  2. Info/formler viser henholdsvis ×1,25/÷1,25/20 %, ×1,12/÷1,12/10,71 % og
     ×1,06/÷1,06/5,66 % uden hardcoded 25 %-tekst. **PASS**
  3. DA forbliver fast 25 %; DA/SE URL-state og fuld gate er grønne. **PASS**
- **Kvalitetsgate 2026-09-25 08:03 CEST:** `npm run build` grøn (137 sider + typecheck),
  `npm run test` grøn (615/615 tests, 65 filer), `npm run lint` grøn (367 filer) og
  `npm audit --audit-level=high` 0 sårbarheder. Lokal production-HTTP-kontrol passede
  health, DA/SE-metadata og alle tre svenske satser. React Doctor scorede 89/100 med kun
  én ikke-korrektnessrelateret advarsel om den eksisterende store komponent.
- **Forventet effekt:** Fjerner en konkret modsigelse på beraknare.se og beskytter
  tilliden til momsresultater.
- **MÅL:** `/moms` på beraknare.se: Search Console baseline 1.298 visninger, 1 klik,
  CTR 0,1 %, position 26,7 pr. 2026-09-22; Plausible-baseline ukendt.
- **Landet:** T5-kode, tests og plan ligger i commit `b685026`; merge til `master` er
  `a889f5e` den 2026-09-25 08:08 CEST.

#### 11. [x] FÆRDIG 2026-09-25 — I1 — Integrer IndexNow uden at sende under iterationen

- **Iteration start:** 2026-09-25 08:31 CEST. `npm audit --audit-level=high` er grøn
  med 0 sårbarheder; den eksterne afhængighedsrapport fra 2026-08-23 er stale.
- **Research/beslutning:** Den officielle protokol bruger nøgle på 8-128 alfanumeriske
  tegn eller bindestreger i roden, POST til `https://api.indexnow.org/indexnow`, og
  accepterer 200/202; 429 skal håndteres uden retry-storm i startup. Nøglen læses kun
  fra runtime via `INDEXNOW_API_KEY`, og aktivering kræver desuden
  `INDEXNOW_ENABLED=true`, så lokale production-starts og previews ikke sender. En
  central, injectable `submitIndexNow`-funktion bygger sitemap + valgfrit canonicalt
  URL, deduplicerer og klassificerer 200/202/429/fejl. En dynamisk key-route med
  `afterFiles`-rewrite giver den offentlige `/<nøgle>.txt`; Next-instrumentering sender
  efter deploy begge live-domæners sitemap og alle canonicale sitemap-URL'er, så en
  eksisterende ændret side altid følger med. En beskyttet intern POST-route bruger
  samme funktion til den konkrete ændrede eller slettede URL efter
  publicering/deploy. Den interne route kræver en uafhængig random
  `INDEXNOW_TRIGGER_TOKEN`, stream-capped body, canonical published-target check og
  lokal cooldown/dedup. Ingen rigtig submission køres under implementation, test, build
  eller lokal verification.
- **Review/rettelser 2026-09-25 10:03 CEST:** Frisk review fandt to P2-fund:
  Next.js instrumentation kunne sende fra både Node og Edge, og trigger-token kunne
  være lig den offentlige IndexNow-nøgle. Edge-registration er nu fail-closed,
  og intern trigger afviser identiske tokens. To P3-fund er også lukket: tomme
  query/fragment-markører kan ikke sendes ved `deleted: true`, og 401 svarer med
  `WWW-Authenticate: Bearer`. Målrettede og fulle tests dækker rettelserne.
- **Kvalitetsgate 2026-09-25 10:02 CEST:** `npm run build` grøn (137 sider +
  typecheck; 7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (674/674 tests,
  71 filer), `npm run lint` grøn (377 filer) og `npm audit --audit-level=high` 0
  sårbarheder. Ingen IndexNow-submission blev kørt under gate eller verification.
- **Lokal HTTP-verifikation 2026-09-25 10:12 CEST:** Lokal production-server med
  `INDEXNOW_ENABLED=false` svarede `status: ok` på `/api/health`, serverede den
  konfigurerede dummy-nøgle på `<nøgle>.txt` og gav 404 på en forkert nøgle. Ingen
  outbound-submission blev foretaget.
- **Datagrund:** Bing, DuckDuckGo og Yahoo bidrager væsentligt til dansk trafik;
  brugerprompten angiver 1.320 Bing-, 381 DuckDuckGo- og 291 Yahoo-besøgende i
  snapshotperioden mod 3.855 Google-besøgende.
- **Scope:** Implementér offentlig IndexNow-protokol med en nøglefil på `/<nøgle>.txt`
  og en central submissions-funktion, der kan sende konkrete URL'er efter publicering
  eller ændring. Læs nøglen fra runtime-miljøet; skriv den aldrig i kode, plan eller
  commit. Kaldet må ikke udføres manuelt under selve iterationen.
- **Forventet effekt:** Kortere opdagelsestid for nye og ændrede sider hos Bing,
  DuckDuckGo og Yahoo uden manuel distribution.
- **Acceptkriterier:** Nøglefil og løsning af hemmelighed er dokumenteret; submissions
  dækker sitemap-URL og den konkrete ændrede URL, håndterer 200/202/429/fejl og
  har mockede tests; ingen outbound-submit køres under iterationen; fuld gate grøn.
- **MÅL:** Ingen isoleret trafikbaseline. Mål før/efter med Search Console-impressions
  for nye URL'er efter mindst 14 dage; adskill samtidige site's changes i noten.
- **Landet:** I1-kode, tests og plan ligger i commit `8e01ff2`; merge til `master` er
  `dd5f4af` den 2026-09-25 10:10 CEST. Begge refs pushes i denne iteration.

#### 12. [x] FÆRDIG 2026-09-25 — M1 — Ret Lighthouse-CI's serverstart

- **Iteration start:** 2026-09-25 10:37 CEST. `npm audit --audit-level=high` var grøn
  med 0 sårbarheder; den eksterne afhængighedsrapport fra 2026-08-23 er stale.
- **Datagrund:** PR #20 og ni tidligere Lighthouse-runs fejlede før audit startede.
  Run `35924638613` loggér i `Start server`: `next: command not found`; den efterfølgende
  wait-step fik derfor 60 connection refusals. Den separate build-job var grøn.
- **Beslutning/implementering:** `.github/workflows/lighthouse.yml:18` bruger nu det
  eksisterende `npm run start`-script, som løser `next` fra `node_modules/.bin`.
  Selve Next.js-productionbuild, URL'en, LHCI-actionen, artifact-upload og øvrige
  workflow-trin er uændrede.
- **Lokal verifikation 2026-09-25 10:38 CEST:** Efter productionbuild startede den
  præcis samme kommando med `INDEXNOW_ENABLED=false` på en midlertidig port. `/` gav
  HTTP 200 med 260.264 bytes, og `/api/health` gav HTTP 200 med `status: ok`.
  Processgruppen blev efterfølgende lukket; ingen IndexNow-submission blev sendt.
- **Review 2026-09-25 10:42 CEST:** Fresh-context review fandt ingen P0-P3-fund.
  Revieweren isolerede desuden PID-opførselen og bekræftede, at stop af npm-procesgruppen
  ikke efterlod en lyttende Next.js-child.
- **Kvalitetsgate 2026-09-25 10:40 CEST:** `npm run build` grøn (137 sider + typecheck;
  7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (674/674 tests, 71 filer),
  `npm run lint` grøn (377 filer), `npm audit --audit-level=high` 0 sårbarheder.
- **Landet:** M1-kode og plan ligger i commit `c84bd7c`; merge til `master` er
  `0ba8f8f` den 2026-09-25 10:42 CEST. Begge refs blev pushet.
- **Acceptkriterier:**
  1. Serveren starter efter `npm ci` + build, og LHCI kører faktisk Lighthouse.
     **LOKALT PASS:** samme `npm run start` + productionbuild gav 200 på forsiden;
     GitHub-LHCI afventer første naturlige PR.
  2. Ét grønt PR-run med fejlende Lighthouse-tærskel må kun fejle på den konkrete
     Lighthouse-regel, aldrig `next: command not found` eller manglende production-output.
     **ÅBEN CI-BEKRÆFTELSE:** workflowen uploader Lighthouse-rapporter til GitHub
     Artifacts og midlertidig offentlig lagring; den blev ikke manuelt trigget under
     iterationen. Første naturlige PR skal bekræfte den endelige LHCI-kørsel.
  3. Repoets lokale build/tests/lint forbliver grønne. **PASS.**
- **Placering:** Efter C1-C3 og I1; kun hvis LHCI begynder at blokere flere PR'er.

#### 13. [x] FÆRDIG 2026-09-25 — M2 — Bevar BMI ved gentaget skift mellem metrisk og imperial enhed

- **Iteration start:** 2026-09-25 12:22 CEST; sluttet 15:27 CEST. M2 fortsættes som
  eneste opgave; de åbne T5/I1/M1-deploynoter er endnu ikke ældre end næste
  batch-vindue.
- **Dependency-gate:** `npm audit --json` viser 0 sårbarheder i alle niveauer; den
  eksterne afhængighedsrapport fra 2026-08-23 er stale for dette projekt.
- **Datagrund:** O2 gemmer nu enhed i delelinks, infererer gamle imperiale links og
  afgrænser konverteringen til to decimaler. En fuld kg/cm → lbs/inches → kg/cm
  roundtrip var ikke målt før denne iteration.
- **Beslutning/implementering:** BMI-beregningen bruger nu separate kanoniske
  `vaegtKg`/`hoejdeCm`-værdier, som bevares gennem display-enhedsskift og gemmes i
  nye delelinks. Værdier normaliseres til 0,01-præcision; legacy numeriske strenge
  og gamle links indlæses, mens canonical/display-konflikter fail-closed. Et delvist
  BMI-delelink bliver ikke blandet med defaults. `InputField` får en synkroniserings-
  nøgle, så fokuserede felter og nulstilling følger programmatic state changes.
  WHR-grænsen er gjort symmetrisk ved 79 inches = 200,66 cm, så gentaget skift ikke
  ændrer forholdet.
- **Måling:** BMI-testen registrerer tre skift (kg/cm → lbs/inches → kg/cm →
  lbs/inches) og måler `maximumDeviation = 0` før/efter alle skift. Delelink med
  40 kg/143,4 cm → 88,18 lbs/56,46 inches → 40 kg/143,4 cm er dækket, sammen med
  canonical-state, legacy-state, grænseværdier og fokuseret felt-sync.
- **Review og rettelser:** Fresh-context review fandt først WHR-drift ved 79 inches
  og en manglende numerisk max-afvigelsestest; begge er rettet og dækket. Den
  afsluttende review fandt desuden et fail-open delelink med kun én af vægt/højde;
  state indlæses nu kun når begge felter findes, med regressionstest. Ingen åbne
  P0-P2-fund.
- **Acceptkriterier:**
  1. Tre enhedsskift måler BMI'en med maksimal afvigelse 0. **PASS.**
  2. BMI'en bevares inden for displaypræcisionen ved gentaget skift. **PASS.**
  3. Delelink, enhedsværdier, legacy-state og `InputField`-validering er grønne. **PASS.**
  4. Fuld gate er grøn. **PASS.**
- **Kvalitetsgate 2026-09-25 15:27 CEST:** `npm run build` grøn (138 sider +
  typecheck; 7 kendte CSS-optimeringsadvarsler), `npm run test` grøn (800/800 tests,
  81 filer), `npm run lint` grøn (433 filer) og `npm audit --audit-level=high` 0
  sårbarheder. `npx tsc --noEmit` har én pre-existing TS1501-fejl i
  `src/components/StructuredData.test.tsx`; Next-buildens typecheck er grøn.
- **MÅL:** `/bmi` baseline 979 besøgende/28d 2026-09-23; effektmåling først efter
  14 dage, da dette er en korrekthedsændring frem for en isoleret SEO-ændring.
- **Landet:** M2-kode, tests og plan ligger i commit `69c5260`; merge til `master` er
  `1745519` den 2026-09-25 15:32 CEST.

#### 14. [x] FÆRDIG 2026-09-25 — M3 — Route børne-BMI-søgninger til guiden

- **Iteration start:** 2026-09-25 15:27 CEST på `ceo/m3-bmi-child-search`.
- **Datagrund:** O2 har adskilt sider og metadata, men `SearchBar` og
  `BeregnerAssistent` søger fortsat kun i beregnere. "BMI for mit barn" kan derfor matche
  `/bmi`, selv om værktøjet kun er for voksne.
- **Beslutning/implementering:** Den danske BMI-for-børn-guide ligger i den nye
  DA-only `src/lib/search-content.ts` som delt søgeindhold mellem forsiden og assistenten;
  den er ikke lagt i `calculator-list` eller `page-data`. `SearchBar` matcher eksplicitte
  keywords og trimmer tomme forespørgsler. Assistenten tilføjer kun guiden, når queryet
  indeholder et børne-/percentiludtryk, så voksensuggestion og voksne BMI-intents ikke
  routes til bloggen. Punctuation tokeniseres, så den eksisterende voksensuggestion med
  spørgsmålstegn fortsat rangerer `/bmi` først. Escape lukker søgelisten og rydder den
  aktive tastaturindstilling. Plausible-events og -metrikker er uændrede.
- **Acceptkriterier:**
  1. Søgning på "BMI for mit barn" viser guiden og ikke voksenværktøjet som bedste match. **PASS**
  2. Søgning på "BMI for voksne" viser fortsat `/bmi`. **PASS**
  3. Tastaturvalg, tomme resultater og eksisterende locale-adfærd er grønne. **PASS**
  4. DA-only søgepost og regressionstests dækker både `SearchBar` og assistenten. **PASS**
- **Kvalitetsgate 2026-09-25 15:58 CEST:** `npm run lint` grøn (464 filer),
  `npm run test` grøn (907/907 tests, 86 filer), `npm run build` grøn (139 sider +
  typecheck; 7 kendte CSS-optimeringsadvarsler), `npm audit --audit-level=high` 0
  sårbarheder. Målrettet gate før fuld gate: 14/14 tests grønne.
- **Landet:** M3-kode og tests ligger i commit `5e9f081`, planstatus i `e546b81`;
  merge til `master` er `89ba868`. Begge refs blev pushet 2026-09-25 15:59 CEST.
- **Forventet effekt:** Forhindrer en forkert voksen-handling og giver den relevante
  næste handling; effekt på organisk trafik måles ikke isoleret.
- **MÅL:** `/bmi` baseline 979 besøgende/28d 2026-09-23; bloggens baseline er ukendt
  og skal udfyldes fra næste snapshot før en reel effektvurdering.

#### 15. [x] FÆRDIG 2026-09-25 — C4 — Svar-først på `/tidszone` (0,5 % CTR på 24.544 visninger)

- **Iteration start:** 2026-09-25 18:05 CEST på `ceo/c4-tidszone-ctr`. Først blev de
  fem åbne deploynoter fra T5/I1/M1/M2/M3 indholdskontrolleret live (17:30-vinduet
  var passeret), se VERIFICÉR DEPLOY-log.
- **Datagrund:** Search Console 2026-08-26–2026-09-23: 24.544 visninger, 116 klik,
  CTR 0,5 %, position 7,5. Søgninger: "tidszoner" 755v pos 10, "hvad er klokken i
  usa når den er 12 i danmark" 183v pos 6, "tidszoner beregner" 111v pos 3,
  "tidsforskel" 85v pos 10. Det er den fjerdestørste visningsside, og ingen CTR-opgave
  havde rørt den.
- **Problem før ændring:** title "Tidszoneberegner - Omregn tid mellem lande |
  MinBeregner.dk" og description med "Danmark til New York: -6 timer" gav ikke svaret
  på det konkrete spørgsmål, og siden viste kun en statisk forskelsliste uden klokkeslæt.
- **Beslutning/implementering:** Ny `src/lib/tidszone-reference.ts` med 11 byers
  UTC-forskelle (JSDoc-kilde: IANA-offset + dansk CET/CEST) og `tidszoneRækker()`,
  der beregner klokkeslæt ved 12 i Danmark i både dansk vinter- og somertid. Siden
  viser nu et synligt, kildeført svarførst-blok med tabel (By | vintertid kl. 12 CET |
  somertid kl. 12 CEST) på DA og SE, pluss en note om at byer uden sommertid ligger
  en time tidligere, og at skiftedagen ikke er identisk i USA/EU/Australien. Title og
  description er spørgsmålsformuleret ("Hvad er klokken i USA, når den er 12 i
  Danmark?"); OG følger samme spørgsmål. Beregnerlogik, URL, canonical, hreflang og
  interne links er uændrede.
- **Fagligt fund undervejs:** Den oprindelige tabel-antagelse "sommertid =
  vintertid + 1 time" viste sig forkert for de fleste byer, fordi de skifter
  sommertid sammen med Danmark: New York er 06:00 hele året, Sydney 21:00 hele
  året, mens byer uden sommertid (Tokyo, Dubai, Shanghai, Mumbai, São Paulo) ligger
  en time tidligere i dansk somertid. Testen dækker begge regler plus dgnskifte
  (UTC+14).
- **Acceptkriterier:**
  1. DA og SE viser det synlige svar (12 i Danmark/Sverige = 06 i New York) og
     tabellen med vinter- og sommertid. **PASS**
  2. Title ≤ 60 tegn, description ≤ 160 tegn på begge domæner. **PASS**
  3. Tidszoneberegneren, dens URL-state og de eksisterende logiktests er urørt. **PASS**
  4. Rækkerne er beregnet fra UTC-forskelle og dækket af unit tests. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-25 18:33 CEST:** `npm run lint` grøn (467 filer),
  `npm run test` grøn (916/916 tests, 88 filer), `npm run build` grøn (139 sider +
  typecheck). Målrettet gate først: 9/9 nye tests grønne.
- **Landet:** kode og tests i commit `4b2fb1c`; merge til `master` er `c78a7a6`.
- **Forventet effekt:** 0,5 % CTR ved position 7,5 med 24.544 visninger er det
  næststørste uudnyttede CTR-udbud efter `/procent` og `/dato`.
- **MÅL:** `/tidszone` Search Console baseline 24.544 visninger/28d, 116 klik,
  CTR 0,5 %, position 7,5 pr. 2026-09-23; Plausible-baseline **ukendt** (siden
  står ikke i top-15), ikke 0. Effekt måles først efter mindst 14 dage.

#### 16. [x] FÆRDIG 2026-09-25 — C5 — Svar-først på `/renteberegner` og `/kalorier`

- **Iteration start:** 2026-09-25 18:58 CEST på `ceo/c5-rente-kalorier-ctr`.
  C4-noten er åben, men 17:30-vinduet var passeret ved merge, så den kan først
  verificeres efter næste batch.
- **Datagrund:** Search Console 2026-08-26–2026-09-23: `/renteberegner` 13.535
  visninger, 126 klik, CTR 0,9 %, position 7,5; `/kalorier` 12.261 visninger,
  123 klik, CTR 1,0 %, position 8,3. Tilsammen ca. 25.800 visninger på position
  7-8 med ~1 % CTR. Søgninger: "annuitetslån beregner" 352v pos 8, "renteberegner"
  330v pos 7, "månedlig rente beregning" 49v pos 6; "kalorieberegner" 208v pos 17,
  "avanceret kalorieberegner" 9v pos 13, "hvor mange kalorier skal jeg have om
  dagen for at tabe mig" 1v pos 1. Plausible: `/renteberegner` 149 besøgende/28d,
  `/kalorier` 277 besøgende/28d.
- **Problem før ændring:** Begge titler var brand-tunge og generiske ("Renteberegner
  - Beregn lån og ydelse gratis | MinBeregner.dk", 61 tegn;
  "Kalorieberegner - Beregn dit daglige kaloriebehov gratis | MinBeregner.dk",
  68 tegn og dermed afkortet i snippet). Ingen af siderne svaret synligt på det
  konkrete spørgsmål, og ingen viste et regnestykke.
- **Beslutning/implementering:** Samme svar-først-mønster som C1/C3/C4, men uden
  nye komponenter: `description` (den synlige intro) er nu selve svaret, og
  title/description/og/schema følger det samme eksempel på DA, SE og NO.
  - `/renteberegner`: 100.000 kr, 5 %, 5 år → 1.887 kr./md. og 13.227 kr. i samlet
    rente. Ny FAQ-spørgsmål med samme regnestykke. Den danske skatteafsnit-links til
    `/rentefradrag`, der ejer den kildeførte 2026-sats, i stedet for at stå alene
    med sit upræcise 33 %-tal.
  - `/kalorier`: spørgsmålet "Hvor mange kalorier skal du have om dagen?" med
    Mifflin-St Jeor-eksemplet mand 80 kg/180 cm/30 år: BMR 1.780 kcal, TDEE
    2.759 kcal, og 2.259 kcal i et 500-kcal-underskud.
- **Talene er verificeret mod koden, ikke antaget:** annuitetsformlen i
  `src/components/RenteBeregner.tsx:131-141` giver 1.887,12 kr. og 13.227 kr. i
  rente for 100.000 kr/5 %/60 terminer; Mifflin-St Jeor med faktor 1,55 i
  `src/components/KalorieBeregner.tsx:15-21,168-201` giver 1.780/2.759/2.259.
  Tallene er beregnet med de samme formler som komponenterne.
- **Acceptkriterier:**
  1. DA og SE renderer H1, det konkrete svar og beregneren. **PASS**
     (`src/app/renteberegner/page.test.tsx`, `src/app/kalorier/page.test.tsx`)
  2. Title ≤ 60 tegn og description ≤ 160 tegn på DA/SE/NO, med title som
     spørgsmål/eksempel og samme tal i description, og synlig intro. **PASS**
     (`src/lib/page-data.test.ts`, 6 nye testcases)
  3. Dansk `/renteberegner` linker til `/rentefradrag` i skatteafsnittet. **PASS**
  4. Ingen ændring i kalkulationskode, URL, canonical, hreflang, sitemap eller
     `/api/v1`. **PASS** — diffen rører kun `page-data.ts`,
     `page-data.test.ts` og de to sider.
- **Kvalitetsgate 2026-09-25 19:02 CEST:** `npm run lint` grøn (469 filer),
  `npm run test` grøn (927/927 tests, 90 filer), `npm run build` grøn (139 sider +
  typecheck). Målrettet gate først: de 6 nye page-data-cases og 5 routetests var
  grønne efter to rettelser (ogTitle lå ikke lig med metaTitle, og summen af
  13.227 var oprindeligt 13.228). Lokal `next start`-kontrol: DA `/renteberegner`
  og `/kalorier` gav 200 med den nye title, description og det synlige svar;
  `/api/health` svarede `status: ok`.
- **Forventet effekt:** De to sider står tilsammen for ca. 25.800 visninger/28d på
  position 7-8. Løftes CTR fra ~1 % til 2,5 %, giver det ca. 390 ekstra klik pr.
  måned på værktøjer, der allerede har kvalificeret trafik.
- **Landet:** kode, tests og plan i commit `64d8062`; merge til `master` er
  `200ce4c`. Begge refs pushet 2026-09-25 19:05 CEST.
- **MÅL:** `/renteberegner` Search Console baseline 13.535 visninger, 126 klik,
  CTR 0,9 %, position 7,5 pr. 2026-09-23; Plausible 149 besøgende/28d pr.
  2026-09-25. `/kalorier` Search Console baseline 12.261 visninger, 123 klik,
  CTR 1,0 %, position 8,3 pr. 2026-09-23; Plausible 277 besøgende/28d pr.
  2026-09-25. Effekt måles først efter mindst 14 dage.

#### 17. [x] FÆRDIG 2026-09-25 — C6 — Svar-først på `/alder` og `/brok`

- **Iteration start:** 2026-09-25 19:05 CEST på `ceo/c6-alder-brok-ctr`. C4- og
  C5-noterne er åbne, men begge blev merget efter 17:30-vinduet, så de kan først
  verificeres efter 07:30-vinduet 2026-09-26.
- **Datagrund:** Search Console 2026-08-26–2026-09-23: `/alder` 5.838 visninger,
  35 klik, CTR 0,6 %, position 7,8; `/brok` 4.387 visninger, 28 klik, CTR 0,6 %,
  position 5,3. `/brok` var det laveste hængende udbud (position 5,3 med 0,6 %).
  `/alder`-søgninger: "aldersberegner" 319v pos 5, "beregn alder" 103v pos 9,
  "hvor gammel er jeg" 37v pos 35, "alder beregner" 34v pos 9. Plausible: ingen af
  de to sider står i top-15, så baseline er ukendt.
- **Fagligt fund før ændring:** `metaDescription` på alle tre domæner hævdede
  "Født 15/3/1990 = 35 år, 10 måneder og 28 dage" — et frosset svar, der var
  korrekt for 2025-12-13 og ikke for i dag. Den samme forældede sum lå i det
  synlige introafsnit på `/alder`. Det er en konkret fejl i den tekst, søgerne
  ser i snippet.
- **Autocomplete-research (25. september 2026, kvalitativt signal):**
  - `forkort brøk` → "forkort brøken 9/12", "forkort brøken 28 35",
    "forkort brøken mest muligt": intensionen er en *konkret brøk*, ikke
    brandudtrykket. `brøk` → "brøk til procent", "brøk til decimaltal".
  - `hvor gammel er jeg` → "hvor gammel er jeg i dage", "hvor gammel er jeg hvis
    jeg er født i 2009": alder i dage er en reel, selvstændig intension.
- **Beslutning/implementering:** Samme svar-først-mønster som C1/C3/C4/C5, kun i
  `page-data.ts` — ingen ny komponent, ingen ændring i kalkulationskode, URL,
  canonical, hreflang, sitemap eller `/api/v1`.
  - `/alder` (DA/SE/NO): `metaTitle` er nu spørgsmålsformuleret
    ("Aldersberegner: hvor gammel er du i år, måneder og dage?", 56 tegn;
    SE 59, NO 59) og `ogTitle` er identisk med `metaTitle`. `description` (det
    synlige introafsnit) er selve svaret med **dato præfiks**, så tallene er
    sporbare og aldrig står som et udateret "faktum". Ny FAQ med spørgsmålet
    "Hvor gammel er jeg præcist?" og "Hvor gammel er jeg i dage?".
  - `/brok` (DA/SE): `metaTitle` "Brøkberegner: forkort 6/8 til 3/4 = 0,75 = 75 %"
    (47 tegn) — head term plus et konkret regnestykke, der matcher
    "forkort brøken 9/12"-intensionen. Ny FAQ med spørgsmålet "Hvad er 6/8 som
    decimaltal og procent?". `/brok` findes kun på DA og SE, så NO er urørt.
- **Talene er verificeret mod koden, ikke antaget:** `forkortBrok(6, 8)` i
  `src/lib/brok.ts:24-43` giver 3/4, 0,75 og 75 (dækket af eksisterende test i
  `src/lib/brok.test.ts`). Alderssummen er beregnet med samme algoritme som
  `AlderBeregner.tsx:160-182` for fødselsdato 1990-03-15 og referencedato
  2026-09-25: 36 år, 6 måneder, 10 dage og 13.342 dage.
- **Acceptkriterier:**
  1. DA/SE/NO viser H1, det konkrete svar og beregneren. **PASS**
     (`src/app/alder/page.test.tsx`, 4 tests)
  2. `metaTitle` ≤ 60 tegn, `metaDescription` ≤ 160 tegn, `ogTitle` = `metaTitle`,
     samme tal i description, metaDescription og ogDescription på alle
     domæner. **PASS** (`src/lib/page-data.test.ts`, 8 nye testcases)
  3. Den frosne "35 år, 10 måneder og 28 dage"-sum findes ikke længere på DA, SE
     eller NO. **PASS** (eksplicit `not.toContain("35 år")`-testcase)
  4. Ingen ændring i kalkulationskode, URL, canonical, hreflang, sitemap eller
     `/api/v1`; diffen rører kun `page-data.ts`, `page-data.test.ts` og de to nye
     routetests. **PASS**
- **Kvalitetsgate 2026-09-25 19:14 CEST:** `npm run lint` grøn (471 filer),
  `npm run test` grøn (941/941 tests, 92 filer), `npm run build` grøn (139 sider +
  typecheck). Målrettet gate først: 41/41 i de tre berørte filer efter to
  rettelser (ogTitle lå ikke lig med metaTitle, og schema-ordet er
  lokalt: "fødselsdato"/"födelsedatum"/"fødselsdatoen"). Lokal `next start`
  på port 3217: DA og SE `/alder` og `/brok` gav 200 med den nye title,
  description og det synlige svar; `/api/health` svarede `status: ok`.
  Bemærk: port 3111 var allerede optaget af en anden lokal app, som svarede
  med et helt andet site — brug en fri port.
- **Landet:** kode og tests i commit `9adbfe6`; plan i `8ed71e9`; endelig merge til
  `master` er `aa2c32c` (en mellemmerge `7140173` blev pusheret ved den første
  merge og er ikke destinationsreferencen). Alle refs pushet 2026-09-25 19:20 CEST.
- **Forventet effekt:** 10.225 visninger/28d samlet på position 5-8 med ~0,6 %
  CTR. Løftes CTR til 2 %, giver det ca. 145 ekstra klik pr. måned. Den konkrete
  forældede fejl i `/alder`s snippet er desuden fjernet, hvilket alene kan give
  CTR på de 5.838 visninger.
- **MÅL:** `/alder` Search Console baseline 5.838 visninger, 35 klik, CTR 0,6 %,
  position 7,8 pr. 2026-09-23; Plausible-baseline ukendt. `/brok` baseline 4.387
  visninger, 28 klik, CTR 0,6 %, position 5,3 pr. 2026-09-23; Plausible-baseline
  ukendt. Effekt måles først efter mindst 14 dage.

#### 18. [x] FÆRDIG 2026-09-25 — C7 — Svar-først-sider for "hvor mange dage er der til X"

- **Iteration start:** 2026-09-25 19:40 CEST. Fortsatte den øverste kandidat
  efter C6 i stedet for at starde en diagnose af `/pension` ved siden af.
- **Datagrund:** `/dato` har 129.188 visninger/28d, 789 klik, CTR 0,6 %, pos. 5,8
  pr. 2026-09-23. Søgningerne er konkrete spørgsmål: "hvor mange dage er der til
  1 december" 959v/2k **pos 5 med 1 klik**, "dage mellem datoer" 448v/10k pos 5,
  "antal dage mellem to datoer" 247v/5k pos 5, "hvor mange dage er der tilbage af
  2026" 212v/2k pos 5. På SE: "dagar till 31 dec" 322v/0k pos 9, "hur många dagar
  är det kvar till 1 oktober" 50v/0k pos 7, "dagar till 11 juni" 30v/0k pos 8.
  Plausible: `/dato` 1.029 besøgende/28d (+77 %, bounce 5 %) pr. 2026-09-25.
  Position 5-10 med 0,1-1 klik er positionen, hvor et svar i titlen er billig vækst.
- **Scope:** Én ægte side pr. spørgsmål, kun kuraterede datoer med fast eller
  computérbar ankerdato, dansk **og** svensk, med intern linking mellem siderne og
  videre til `/dato` og `/nedtaelling`. `/dato` må ikke skades — de nye sider er
  additive og linkes ikke fra `/dato` endnu (se ❓ Til Mads).
- **Beslutning om datasættet:** 7 events pr. sprog — `juledagen`/`juldagen`
  (25/12), `nytaarsaften`/`nyarsafton` (31/12), `nytaarsdag`/`nyarsdagen` (1/1),
  `1-december`/`1-december` (1/12), `paskedag`/`paskdagen` (påskedag),
  `skaertorsdag`/`skartorsdagen` (påskedag − 3) og `grundlovsdag`/`nationaldagen`
  (5/6 juni hhv. 6/6 juni). **Sommerferie og skolestart er bevidst udeladt**:
  de har ingen national ankerdato, og en gæt ville være en tynd side. En
  webfetch til Undervisningsstyrelsen om skolestart fejlede i denne iteration
  (transportfejl), så der er ingen kilde til et "typisk"-datum at cite. De bør
  først bygges som kommunespecifikke sider med dokumenteret grundskole-start.
  Ankeret er **pr. locale**, fordi grundlovsdag (5/6) og Sveriges nationaldag
  (6/6) er to forskellige spørgsmål, ikke oversættelser af hinanden.
- **Faglig korrekthed:** påske beregnes med den anonyme gregorianske algoritme
  (Meeus/Jones/Butcher) og er testet mod 7 kendte år plus "altid en søndag"
  1990-2050. **To fejl blev fundet af testene undervejs og rettet, før commit:**
  1) påskedag + 39 dage er *ikke* grundlovsdag (påskedagen varierer 22/3-25/4,
     så 5/6 ligger 41-75 dage senere) — begge blev ændret til lovens faste dato;
  2) "1. december er månedens længste måned" er forkert (december har 31 dage
     sammen med 6 andre måneder) og en påstand om lønflytning ved nytårsdag blev
     fjernet, da den ikke kunne dokumenteres. Der er ingen kildehenvisning på
     siderne, fordi alle påstande er kalenderfakta eller den angivne algoritme.
- **Canonical/duplikater:** DA og SE har hver sin slug; den anden sprogvariant
  301'er via `getRouteDecision` til sit eget domænes slug, så svaret aldrig
  ligger på to URL'er. Ukendte slug 404'er. `no`-domænet (skjult) får ingen sider,
  hverken i routing eller sitemap.
- **Ferskhed:** begge ruter bygges som `ƒ (Dynamic)` (verificeret i build-output),
  fordi de læser request-headers. Tallet genberegnes derfor ved hvert request og
  kan ikke blive forældet mellem de tre batch-deploys. Sitemap markerer siderne
  `changeFrequency: "daily"`.
- **Verifikation 2026-09-25:** `npm run build` grøn (137+2 sider; kun de 7 kendte
  pre-existing CSS-optimeringsadvarsler), `npm run test` grøn (986/986, 94 filer),
  `npm run lint` grøn (477 filer). 45 nye tests: 33 i `src/lib/dage-til.test.ts`
  (påske mod kendte år, dage-tælling over skudår og DST, nul-dage-på-datoen,
  slug-opløsning begge veje, sitemap, redirects og renderet HTML med frosset tid).
- **Landet:** kode og tests i commit `70e75b9`; merge til `master` er `8950593`
  2026-09-25 19:50 CEST.
- **Forventet effekt:** 7 nye sider pr. domæne, der kan fange de konkrete
  dage-spørgsmål direkte. De fire dokumenterede søgninger (959 + 212 + 322 + 50
  visninger) lå på pos. 5-10 med 1-2 klik i alt; hver især er for lille til at
  flytte `/dato`s samlede CTR, men de er additive trafik, og interne links
  mellem de 7 sider + `/dato` + `/nedtaelling` fordeler linkjuice.
- **MÅL:** nye sider har ingen baseline (de findes ikke endnu). Sammenlign efter
  14 dage mod Search Console-indgangene for "hvor mange dage er der til …" /
  "dagar till …", og hold øje med at `/dato` (baseline 1.029 besøgende/28d
  2026-09-25, CTR 0,6 %, pos. 5,8) ikke taber visninger, fordi de nye sider
  konverterer samme søgning. Hvis `/dato` falder, skal de nye sider linkes fra
  `/dato` i stedet for at stå sideløbs.
- **Acceptkriterier:**
  1. Titel, description og synligt H1 indeholder alle det konkrete antal dage.
  2. Samme spørgsmål findes på begge domæner med hvert sit sprog og sin egen slug.
  3. Det anden sprogs slug 301'er, ukendte slug 404'er, og ingen URL findes i to
     sitemap'er.
  4. Tallet er 0 på selve datoen og tæller ikke dagen i dag med.
  5. Sitemap, interne links til `/dato` og `/nedtaelling` er med.
  6. `npm run lint`, `npm run test` og `npm run build` er grønne.
- **Næste iteration:** se opgave 19. `/pension` er diagnosticeret og rettet; det åbne
  stykke er indkomstfeltet til pensionstillægget. Derefter de øvrige kandidater nedenfor —
  ikke flere copieskrevne sider på række.

#### 19. [x] FÆRDIG 2026-09-25 — C8 — Diagnose af `/pension` + ret de tre folkepensionsfejl

- **Iteration start:** 2026-09-25 19:51 CEST. Planen pegede på `/pension` som næste
  diagnose; CTR var ikke problemet (1,1 %), så det var ranking og indhold.
- **Datagrund:** `/pension` 4.001 visninger, 45 klik, CTR 1,1 %, **pos. 12,2** pr. 2026-09-23.
  Søgningerne ligger alle langt nede: "pensionsberegner" 173v/1k **pos. 22**,
  "beregn pension" 89v pos. 28, "beregn pensionsopsparing" 78v pos. 24,
  "pensions beregner" 33v pos. 23. Plausible: 141 besøgende/28d (+36 %), bounce 2 % pr. 2026-09-25.
- **Diagnose (dokumenteret, ikke gættet):**
  1. **Søgeintentionen er en anden end værktøjets.** Google autocomplete (da-DK, 2026-09-25)
     for "pensionsberegner" giver *pensionsberegner alder*, *pensionsberegner 2026*,
     *pensionsberegner tidlig pension* plus leverandørnavne (pfa, pka, nordnet, velliv);
     for "beregn pension" giver *beregn pensionsalder*, *beregn pensionstillæg*,
     *beregn pensionstillæg 2026*, *beregn pension af løn*, *beregn pension efter skat*.
     Værktøjet svarer på **opsparing** ("hvor meget skal jeg spare"), mens søgerne spørger om
     **hvornår** og **hvad jeg får**. Siden havde ingen tabel med folkepensionsalder pr.
     fødselsår og ingen beregning af pensionstillæg.
  2. **Tre konkrete fagfejl**, alle verificeret mod borger.dk 25. september 2026:
     pensionstillægget for gifte/samlevende stod som **4.367 kr.** (skal være **4.467 kr.**) i
     både siden og FAQ; folkepensionsalder-tabellen sagde "Før 1963: 65-67 år" og
     "Efter 1970: 70+ år (forventes)", mens den officielle skala er 65 / 65½ / 66 / 66½ / 67 /
     68 / 69 / **70 år for født 1971 eller senere**; og beregneren lagde `grundbeløb + 70 % af
     pensionstillæg` samt delte brugerens egen opsparing 70/30 mellem "Arbejdsmarked" og
     "Privat" (`PensionBeregner.tsx:139-150`) — to faktorer uden kilde, der så ud som fakta.
  3. Branding: `/pension` og `/arveafgift` havde `| Beregner.dk` i titel, meta og og-titel,
     mens 75 andre sider bruger `| MinBeregner.dk` — domænet er minberegner.dk.
  4. Bloggen `pension-hvor-meget-skal-du-spare-op` gentog både 4.367-fejlen og
     "ca. 13.000-15.000 kr/måned" (officielt 16.273 kr. for enlige før skat).
- **Beslutning/implementering:** Alle 2026-beløb, indkomstgrænser for pensionstillægget
  (99.200/438.380 kr. 30,9 % enlig; 198.800/533.800 kr. 16 % samlevende m. pensionist;
  198.800/366.400 kr. 32 % samlevende u. pensionist), 54 %-reglen for ikke-pensionist samlever
  og folkepensionsalder-skalaen ligger nu i `src/lib/folkepension.ts` med kilde og
  `verifiedAt`, og bruges af side, FAQ og beregner — samme mønster som barsel i O1.
  `beregnFolkepension2026()` er en ren, testet funktion. Værktøjet bruger nu folkepensionens
  fulde beløb for enlige (16.273 kr.) i stedet for det opdigtede 70 %-tal, og visualiseringen
  er skåret fra tre "søjler" til **folkepension + din opsparing** med en note om, at
  arbejdsmarkedspension ikke medregnes, fordi den afhænger af arbejdsgiveren. Samlet månedlig
  pension stiger dermed 2.619 kr. (13.654 → 16.273 + opsparing), fordi tillægget først var
  undervurderet — opsparingen er uændret. Titlen er gjort svar-først:
  "Pensionsberegner 2026: folkepension 16.273 kr/md". Siden har nu ankrede `#folkepension-2026`
  og `#folkepensionsalder` med tabeller kildeført til borger.dk.
- **Faglig afgrænsning:** værktøjet beregner **ikke** den enkeltes folkepension, fordi den
  afhænger af ATP, arbejdsmarkedspension og samliv. Siden siger det og peger på
  PensionsInfo.dk og Udbetaling Danmarks egen beregner. Der påstås ingen aktuelle
  Google-placeringer — DuckDuckGo, Mojeek og Google gav bot-blokering i denne iteration,
  så kun autocomplete og Search Console er brugt som dokumentation.
- **Verifikation 2026-09-25:** `npm run lint` grøn (479 filer), `npm run test` grøn
  (1002/1002, 95 filer), `npm run build` grøn (137+2 sider, kun de 7 kendte CSS-advarsler),
  `tsc --noEmit` uden nye fejl (den ene `es2018`-regex-advarsel i `StructuredData.test.tsx` er
  pre-existing). 16 nye tests i `src/lib/folkepension.test.ts` dækker beløb, alle skift i
  alder-skalaen, nedsættelsesformlen, nedsættelse ned til 0, bortfald på tværs af grænsen,
  forskellige grænser for samlevende m./u. pensionist samt negativ og ugyldig indkomst.
- **Landet:** kode `ad5970c`, merge `42a576e` 2026-09-25 20:26 CEST.
- **Forventet effekt:** Først og fremmest korrekthed og tillid — tre offentligt tilgængelige
  tal var forkerte, og to udviklede parametre stod som fakta. Sekundært: siden kan nu svare på
  de to mest dokumenterede delintenter (folkepensionsalder, pensionstillæg) i stedet for kun
  at linke videre. CTR på 1,1 % er ikke enestående; titlen er gjort svar-først alligevel,
  fordi den nu kan det uden at lyve.
- **Acceptkriterier:**
  1. `4.367` findes ikke længere som 2026-gældende sats i `src/`.
  2. Folkepensionsalder-tabellen er den officielle skala med 65/65½/66/66½/67/68/69/70.
  3. Der er ingen hardkodede folkepensionsbeløb i `PensionBeregner.tsx`; de kommer fra
     `src/lib/folkepension.ts` med kilde og verificeringsdato.
  4. Beregneren gør ikke længere opdelingen "arbejdsmarked/privat" af egen opsparing.
  5. Alle pensionstal på siden, i FAQ og i bloggen er ens.
  6. `npm run lint`, `npm run test` og `npm run build` er grønne.
- **MÅL:** `/pension` baseline 4.001 visninger, 45 klik, CTR 1,1 %, pos. 12,2 pr. 2026-09-23;
  Plausible 141 besøgende/28d, bounce 2 % pr. 2026-09-25. Sammenlign igen 2026-10-09: se om
  positionen på "pensionsberegner" (var 22) og "beregn pension" (var 28) rykker, og at CTR'en
  på /pension ikke falder, fordi titlen nu er smallet.

#### 20. [x] FÆRDIG 2026-09-25 — C9 — Svar-først på `/braendstof` og `/kvadratmeter`

- **Iteration start:** 2026-09-25 20:10 CEST på `ceo/c9-braendstof-kvadratmeter-ctr`.
  Køen efter C8 var tom; de to største uberørte CTR-sider blev taget.
- **Datagrund:** Search Console 2026-08-26–2026-09-23: `/kvadratmeter` 20.914 visninger,
  290 klik, CTR 1,4 %, position 5,0; `/braendstof` 16.371 visninger, 179 klik, CTR 1,1 %,
  position 6,1. Tilsammen 37.285 visninger på position 5-6 — det største samlede
  CTR-udbud der ikke var behandlet. Søgninger: "kvadratmeter" 1.830v pos 5,
  "hvordan regner man kvadratmeter ud" 372v pos 3, "beregn kvadratmeter" 199v pos 3,
  "kvadratmeter beregner" 172v pos 8; "benzin beregner" 130v/4k pos 6, "brændstof beregner"
  100v pos 7, "benzinberegner" 50v pos 7. Plausible 2026-09-25: `/kvadratmeter` 376
  besøgende/28d (+103 %, bounce 6 %), `/braendstof` 272 (+74 %, bounce 3 %).
- **Problem før ændring:** Begge titler var brand-tunge og lovede intet konkret
  ("Brændstofberegner - Beregn benzin, diesel og el | MinBeregner.dk" 61 tegn,
  "Kvadratmeterberegner - Beregn areal online | MinBeregner.dk" 59 tegn), og ingen af
  siderne svarede synligt på sit eget spørgsmål. `/braendstof` lagde desuden et gammelt
  eksempel i FAQ'en (200 km/13 DKK = 173 DKK), der ikke hang sammen med komponentens
  egne standardværdier.
- **Beslutning/implementering:** Samme svar-først-mønster som C1/C3/C4/C5/C6, kun i
  `page-data.ts` — ingen ændring i kalkulationskode, URL, canonical, hreflang, sitemap
  eller `/api/v1`.
  - `/braendstof` (DA/SE/NO): `metaTitle` "Brændstofberegner: 500 km benzin koster 450 kr."
    (43 tegn, SE 42, NO 44), og `description` er selve regnestykket med 33,3 liter,
    450 kr. og 0,90 kr. pr. km. Ny FAQ med samme tal og 90 kr. pr. 100 km.
  - `/kvadratmeter` (DA/SE/NO): `metaTitle` "Kvadratmeterberegner: 5 x 4 m = 20 m²"
    (36 tegn i alle tre domæner), `description` er svaret på "hvordan regner man
    kvadratmeter ud", og ny FAQ svarer på "hvor meget koster 20 m² gulv" med 150 kr./m²
    → 3.000 kr. plus de 5-10 % spild, som siden allerede nævner i prosaen.
- **Talene er verificeret mod koden, ikke antaget:** `500 / 15 × 13,50 = 450 kr.`,
  `13,50 / 15 = 0,90 kr. pr. km` og `100 / 15 = 6,67 l/100km` er præcis
  `BraendstofBeregner.tsx:173-177` (`literForTur`, `turPris`, `prisPrKm`, `forbrugPr100km`)
  med standardværdierne 13,5 kr./l og 15 km/l. Arealet er `laengde × bredde` og prisen
  `areal × prisPerKvm` (`KvadratmeterBeregner.tsx:206,227`), så 5 × 4 = 20 m² og
  20 × 150 = 3.000 kr. Samme standardværdier gælder alle tre domæner, fordi
  `l.benzin`/tallene er identiske i DA/SE/NO.
- **Acceptkriterier:**
  1. DA/SE/NO renderer H1, det konkrete svar og værktøjet. **PASS**
     (`src/app/braendstof/page.test.tsx` og `src/app/kvadratmeter/page.test.tsx`,
     3 locales × 2 sider = 6 nye routetests)
  2. `metaTitle` ≤ 60 tegn, `metaDescription` ≤ 160 tegn, `ogTitle` = `metaTitle`,
     samme tal i description, metaDescription, ogDescription og schema på alle tre
     domæner. **PASS** (`src/lib/page-data.test.ts`, 6 nye testcases)
  3. Ingen ændring i kalkulationskode, URL, canonical, hreflang, sitemap eller
     `/api/v1`; diffen rører kun `page-data.ts`, `page-data.test.ts` og de to nye
     routetests. **PASS** — 4 filer i diffen.
  4. Kategori-brødkrummen på `/braendstof` (SE) er uændret `/kategori/hverdag`, fordi
     kategorislugs er fælles på tværs af domæner. **PASS** (en kandidatændring til
     `/kategori/vardag` blev taget tilbage, fordi den ville 404'e).
- **Kvalitetsgate 2026-09-25 20:25 CEST:** `npm run lint` grøn (481 filer),
  `npm run test` grøn (1014/1014 tests, 97 filer), `npm run build` grøn (139 sider +
  typecheck, kun de 7 kendte CSS-advarsler). Målrettet gate først: 47/47 i de tre
  berørte testfiler efter to rettelser (ogDescription manglede "20 m²" på alle tre
  domæner, og `next/dynamic` rendrer intet i statisk markup, så
  `/braendstof`-testen mockede også `next/dynamic`). Lokal `next start` på port 3219:
  DA, SE (Host: beraknare.se) og NO (Host: beregner.no) gav 200 med de nye titler og
  det synlige svar; `/api/health` svarede `status: ok`.
- **Forventet effekt:** 37.285 visninger/28d samlet på position 5-6. Løftes CTR fra
  1,1-1,4 % til 2,5 %, giver det ca. 460 ekstra klik pr. måned på to værktøjer, der
  begge vokser over 70 %.
- **MÅL:** `/braendstof` Search Console baseline 16.371 visninger, 179 klik, CTR 1,1 %,
  position 6,1 pr. 2026-09-23; Plausible 272 besøgende/28d pr. 2026-09-25.
  `/kvadratmeter` Search Console baseline 20.914 visninger, 290 klik, CTR 1,4 %,
  position 5,0 pr. 2026-09-23; Plausible 376 besøgende/28d pr. 2026-09-25.
  Effekt måles først efter mindst 14 dage, altså fra 2026-10-09.
- **Landet:** kode og tests i commit `351d881`; merge til `master` sker i denne
  iteration.

### ❓ Til Mads

- **IndexNow runtime-konfiguration:** Sæt kun i Dokploys production-runtime
  `INDEXNOW_ENABLED=true`, en gyldig `INDEXNOW_API_KEY` på 8-128 tegn med
  `[A-Za-z0-9-]`, og — hvis den eksterne batch-deployer skal kalde den konkrete
  trigger — en separat kryptografisk random `INDEXNOW_TRIGGER_TOKEN` på mindst 32
  tegn. Generér/rotér begge nøgler uden for repoet; sæt aldrig værdier i
  `.dokploy`, commits eller denne plan. Startup sender de nuværende sitemap-URL'er,
  så en publiceret/ændret eksisterende side dækkes. Efter batch-deploy og health skal
  deployeren ved sletning eller en præcis enkelt-URL-trigger POST'e
  `/api/internal/indexnow` med `Authorization: Bearer <token>` og
  `{"url":"https://canonical-host/path"}`; tilføj `"deleted":true` kun for en
  bevidst slettet/tidligere redirectet URL. Denne eksterne hook skal ikke køres manuelt
  i denne iteration.
- Public `/api/v1/bmi` er bevidst uændret, fordi `/api/v1` er en frosset ekstern
  kontrakt. Den returner fortsat rå BMI med voksengrænser uden alder. En eventuel
  dokumentations- eller adfærdsændring kræver en eksplicit beslutning.

### Dokumenterede kandidatere efter top-5

- ~~`/alder`~~ og ~~`/brok`~~ er begge færdige som C6 den 2026-09-25.
- ~~`/pension`~~ er diagnosticeret og rettet som C8 den 2026-09-25, se opgave 19.
  Diagnosen viste, at søgeintentionen (hvornår/hvad) ikke var besvaret, at tre
  folkepensionstal var forkerte, og at beregneren brugte to opdigtede faktorer.
  MÅL: baseline 4.001 visninger, 45 klik, CTR 1,1 %, position 12,2 pr. 2026-09-23,
  Plausible 141 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
  **Åben del af C8:** værktøjet bruger stadig folkepensionens fulde beløb, fordi det ikke
  kender ATP, arbejdsmarkedspension eller samliv. Næste naturlige skridt er et
  indkomstfelt ("indkomst ud over arbejdsindkomst") koblet til `beregnFolkepension2026`,
  som også ville ramme de dokumenterede søgninger "beregn pensionstillæg" og
  "beregn pension af løn". Ikke startet — kræver nyt inputfelt, delelink-state og testet UI.
- ~~`/dage-til/[dato]`~~ er færdig som C7 den 2026-09-25, se opgave 18.

- ~~`/kvadratmeter`~~ er svar-først siden 2026-09-25 (C9, opgave 20). Den åbne del er
  indholdet: prose nævner 5-10 % spild, men værktøjet kan kun prissætte råt areal
  (`KvadratmeterBeregner.tsx:199-230`). Autocomplete peger på gulv, cm/mm og antal ens
  felter; konkurrenten Hjemmeland prissætter materialer. Det kræver ny beregningslogik
  med tests og er bevidst ikke blandet ind i C9.
  MÅL: Search Console baseline 20.914 visninger, 290 klik, CTR 1,4 %, position 5,0
  pr. 2026-09-23; Plausible 376 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
- ~~`/braendstof`~~ er svar-først siden 2026-09-25 (C9, opgave 20).
  MÅL: Search Console baseline 16.371 visninger, 179 klik, CTR 1,1 %, position 6,1
  pr. 2026-09-23; Plausible 272 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
- **Næste CTR-kandidat:** `/blog/boernepenge-2026-satser-og-regler` — 5.145 visninger,
  27 klik, **CTR 0,5 %**, position 8,5 pr. 2026-09-23. Søgningerne er konkrete
  ("børnepenge 2026" 986v/3k pos 9, "børnepenge sats 2026" 339v pos 6,
  "børnepenge 2026 udbetaling" 294v pos 10, "børne unge ydelse satser 2026" 136v pos 8),
  så både svar-først-titel og et synligt 2026-talburk burde give effekt. Samme mønster som
  C1-C6/C9, men på en blogartikel:kræver en ny routetest og kildeførte tal.
  MÅL ved eventuel opgave: baseline 5.145 visninger, CTR 0,5 % pr. 2026-09-23.
- `/rentefradrag` 299 besøgende/28d (+149 %): høj vækst og CTR 4,9 % — positionen er
  allerede stærk, så her er **ikke** CTR problemet. Reelt hull: 33,6/25,6 % er
  upræcise og mangler primær kilde, og siden bruges stadig ikke af `/renteberegner` på
  andre domæner. MÅL ved eventuel opgave: baseline 289 2026-09-23.
- `/dato` 1.008 besøgende/28d (+92 %): stærkeste side og allerede bred funktionstil;
  konkurrenten iKalender tilbyder arbejdsdage uden helligdager, mens vores side
  springer helligdage over. Ingen ændring før et konkret søgeintentionsgap kan dokumenteres.
  MÅL: baseline 1.008 2026-09-23.
- **Interne links fra `/dato` til de nye dage-til-sider er bevidst ikke lavet i
  C7.** De kan gives ved skolestart/jul, hvor spørgsmålet opstår, men bør først
  måles: hvis de nye sider tager trafik fra `/dato`, skal de linkes *fra* `/dato`.
- Forsiden 214 besøgende/28d, bounce 44 %: linket til alle prioriterede beregnere,
  men researchen gav endnu et forsvarbart specifikt ændringsforslag. Udskyd til nye
  trafik-/adfærdsdata; MÅL: baseline 214 2026-09-23.

### Måleprotokol

- Baseline er snapshotdatoen ovenfor; tallene er 28-dages rullende besøgende pr. side.
- Efter hvert sideændringsforløb skal resultatet først skrives i planen, når der er
  gået mindst 14 dage; sammenlign da et nyt 28-dages snapshot med baseline og den
  foregående 28 dage. Manglende data skrives som ukendt, ikke som nul.
- Plausible-opsætning, metrikker og events ændres ikke. Eksisterende sidevisninger/bounce
  og interne links måles via de normale trafik- og indgangssider; nye events kræver en
  separat beslutning.
- Google autocomplete/PAA bruges kun som kvalitative søgeintents-signaler, ikke som
  volumen. Denne research fik SERP/PAA via webfetch, men Google viste JS-videresendelser;
  der påstås derfor ingen aktuelle Google-placeringer uden dokumenteret resultat.

### Kilder brugt i første research

- Borger.dk, barsel lønmodtagere: https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-loenmodtagere-ny-orlovsmodel
- Udbetaling Danmark, boligstøtte uden login: https://www.boligstoette.dk/bos-selvbetjening/beregner/basisoplysninger
- Skat, fradrag for renter: https://skat.dk/borger/fradrag/fradrag-for-renter
- SU: https://www.su.dk
- Sundhed.dk BMI: https://www.sundhed.dk/borger/patienthaandbogen/hormoner-og-stofskifte/undersoegelser/bmi-kropsmasseindeks/
- WHO BMI-for-age 5-19 år: https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age
- I FORM, voksne BMI og køn/alder: https://iform.dk/vaegttab/bmi-beregner
- Hjemmeland, kvadratmeter til materialer: https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/
- Live-indhold stikprøver: minberegner.dk `/bmi`, `/su`, `/kvadratmeter`,
  `/rentefradrag`, barsel-guiden; beraknare.se `/tidsberegner`, `/dato`,
  `/loen-efter-skat`, `/lon-efter-skatt`, `/ugenummer`, `/flyttebudget`, `/boligsalg`.

---

## Morgenrapport 2026-08-24 06:45
- ✅ Boligsalgsberegner (`/boligsalg`): logik+tests+UI+SEO-side+registrering — commit 00dbf4b
- ✅ SATSER_2026 verifikation: kommuneskat 25,07→25,049%, kirkeskat 0,68→0,639% (svmn.dk) — commit 8f34a8a
- ✅ Blog: Boligsalg 2026 guide til omkostninger og provenu — commit bdb0d7c
- ✅ Deploy: Batchens beregnere/artikler er indholdskontrolleret live 2026-09-23 (se VERIFICÉR DEPLOY-log).

## Historisk: Prioriteter før Fase 3 (opdateret pr. missions-brev 2026-08-22)
1. **Emojis ud → lucide-react ikoner ind** (ca. 666 forekomster i 45 filer) — i etaper, grøn gate mellem hver
2. Flere blogindlæg (20 findes; ét ad gangen med ægte substans + kilder + interne links)
3. Flere beregnere (backlog nedenfor) + løbende korrekthed (2026-satser), UX, CWV

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint    # biome lint ./src
npm run test    # vitest run (baseline: 372 tests / 42 filer — SKAL alle bestå)
npm run build   # next build (inkluderer TypeScript-typecheck)
```

Gate = alle tre grønne før merge til `master`.

## Research-fund (iteration 1)

### Skabelon for NY beregner — ALLE registreringssteder:
1. `src/lib/<slug>.ts` — ren logik, JSDoc med formel/kilde
2. `src/lib/<slug>.test.ts` — vitest inkl. kanttilfælde (null/0/negative input)
3. `src/components/<Slug>Beregner.tsx` — "use client"; locale-labels da/se;
   ShareCalculation/CopyResultButton/ResetButton fra ui; calculation-state URL-state;
   analytics trackCalculation(slug); useLocale()
4. `src/app/<slug>/page.tsx` — generatePageMetadata, CalculatorSchema + FAQSchema,
   Breadcrumbs, FAQ, RelatedCalculators, Sidebar; dansk prose-sektion
5. `src/lib/page-data.ts` — entry i `daPages` (+ evt. se/no); slug tilføjes
   `daOnlySlugs` eller `allLocalesSlugs`
6. `src/lib/calculator-list.ts` — `calculatorDefs` (titles/descriptions da/no/se,
   evt. daOnly/seOnly) + `relatedMap` (5 relaterede)
7. `src/lib/categories.ts` — entry i `beregnere[]` med korrekt kategori
8. Sitemap genereres automatisk fra `page-data.getAvailableSlugs()` — ingen manuel redigering
9. Intern linking: relatedMap fra relevante eksisterende sider peger mod den nye side +
   ny side linkes fra relevante blog-artikler hvis der findes en matchende

Kategorier i brug: Økonomi, Bolig, Lån, Sundhed, Familie, Uddannelse, Erhverv,
Hverdag, Praktisk, Matematik (`kategori/<slug>` sider findes for da).

Satser: `src/lib/satser-2026.ts` er single source of truth for danske 2026-satser
(kildeangivet pr. felt). Nye satser tilfælles HER, ikke lokalt i beregnere.

Fundet under research: `relatedMap["/enhedspris"]` refererer til `/rabat`, som IKKE
findes (filtreres væk i runtime). Bygges Rabatberegner (#1) løses referencen naturligt.

## Historisk backlog før Fase 3 (alt markeret med [x] er færdigt)

### Emoji-udskiftning (Prio 1) — i etaper

**Beslutning (iteration 3):** ét centralt ikonsystem i `src/lib/icons.ts`:
- `calculatorIcons: Record<href, LucideIcon>` — én definition pr. beregner (fjerner duplikering
  på tværs af home-data/categories/calculator-list/footer, som i dag gentager samme emoji pr. locale)
- `getCategoryVisual(name)` → `{ icon, color }` pr. kategori (da/no/se-navnevarianter mappet til
  samme visuel; farve = fulde Tailwind-literal-strenge m. dark-variant, så v4-purge ikke rammer)
- Wrapper-komponenter `src/components/ui/icons.tsx` (`CalcIcon`, `CategoryIcon`): ensartet
  strokeWidth 1,75, dekorativ `aria-hidden`, størrelse via className pr. kontekst
- Data-filernes `emoji: string`/`icon: string`-felter FJERNES (ikke omdøbt) — forbrugere slår op
  centralt. Betydningsbærende ikoner får label (ingen kendte i denne etape; alle er dekorative)

Etaper:
1. [x] FÆRDIG (iteration 3): `icons.ts` + `ui/icons.tsx`; data: `categories.ts`,
   `home-data.ts`; forbrugere: `app/page.tsx`, `kategori/[slug]/page.tsx`, `SearchBar.tsx`.
   Features-sektion 🆓/🔒 → Gift/ShieldCheck.
   Gate grøn: lint ok, 279/279 tests, build ok. Verificeret lokalt mod build-output:
   0 emojis fra home-data/categories på forsiden+kategori (75/44 inline-SVG'er);
   resterende 🧮 i Footer tælles i etape 4.
2. [x] FÆRDIG (iteration 4): `navigation.ts` (alle 120 navne da/no/se strippet for
   emojis, ingen strukturendring) + `Header.tsx`: `CalcIcon` (h-4 w-4, grå, dekorativ)
   renderes foran child-links i både desktop-dropdown og mobilmenu. Ny regressionstest:
   nav-navne må ikke indeholde emojis eller whitespace (`navigation.test.ts`, 280 tests).
   Gate grøn: lint ok, 280/280 tests, build ok. SSR-verificeret: 0 emojis i header-region,
   ikoner via samme centrale href-opslag som SearchBar.
3. [x] FÆRDIG (iteration: 2026-08-23): `calculator-list.ts` — fjernet `icon`-felt
    fra interface + alle 78 entries. Forbrugere: `Sidebar`, `RelatedCalculators`,
    `NotFoundSearch`, `not-found.tsx`, `BeregnerAssistent` — alle skiftet til
    `<CalcIcon href={b.href}>` med konsistent `h-5 w-5`/`h-7 w-7`/`h-8 w-8`,
    grå farve, aria-hidden. Gate: lint ok, 280/280 tests, build ok (124 pages).
    Ikon-valg centralt i icons.ts (fallback Calculator-icon).
4. [x] FÆRDIG (iteration: 2026-08-23): `footer-data.ts` — fjernet `emoji`-felt
    fra FooterCategory + alle entries (da/no/se). `Footer.tsx` — trust-signaler
    🧮📅🔒 → Calculator/CalendarDays/ShieldCheck; kategori-headere → CategoryIcon
    (h-4 w-4, colored). Forbrugere: 1 test grøn. Lokal build: 0 footer-emojis.
    Nye kategorivisualer tilføjet i icons.ts: "Lån & Rente", "Lån & Ränta",
    "Familie & Sundhed", "Familie & Helse", "Familj & Hälsa", "Verktøy", "Verktyg".
5. [x] FÆRDIG (iteration: 2026-08-23): ALLE komponenter emoji-fri — 24 filer.
    Tom-tilstande (11 stk): TrendingUp/House/Banknote/Wallet/Landmark/Baby/Car/
    ChartColumn/TriangleAlert m. h-10 w-10 grå, aria-hidden. Datamaps typet om til
    `LucideIcon`: PlanetVaegt-NAVN (Venus/Mars/Eclipse=Saturn-ring/Droplets=Neptun,
    PlanetIcon-hjælper), Arveafgift-relationer (Heart/Baby/UserRound/Users/UsersRound/
    Contact), AffiliateBox får valgfrit `icon?: LucideIcon`-prop (Landmark/TrendingUp/
    ShieldCheck/Car på 4 kaldssteder — emoji fjernet fra title/analytics-label).
    Labels strippet + ikon ved render-site: Moms (Lightbulb), Tidszone (SunMedium),
    TidsBeregner (MoonStar/ChartColumn/Zap), Braendstof (Car/ChartColumn/TrendingUp +
    Fuel/Droplets/PlugZap i type-knapper). Vurderings-/status-tekster: CircleCheck/
    TriangleAlert/Siren (HuslejeBudget), Barsel User/UserRound-toggle. Zodiac-symboler
    (♈♉…) fjernet fra AlderBeregner — Sparkles i stedet (ingen lucide-zodiac findes);
    navn+periode bærer betydningen. ✕-fjern-knapper → X-icon (Rentefradrag, Boernepeng).
    PrintResult-logo uden 📊. Gate: lint ok, 280/280 tests, build ok. Lokal SSR-
    verificering: /alder /planetvaegt /braendstof /rentefradrag /barselsdagpenge
    /tidsberegner /tidszone /efterloen /arveafgift /elbil /husleje /billaan = 0 synlige
    emojis, 20-33 unikke lucide-SVG'er pr. side.
    FUND: `countryFlag` (🇩🇰🇳🇴🇸🇪) i domain-config er dødt data uden forbrugere men
    shipper 1× pr. side i RSC-payload — lavprio-oprydning, ikke synligt UI.
6. [x] FÆRDIG (iteration: 2026-08-23): `app/billaan/page.tsx` — 28 ✅/❌ i prose-lister
   → CheckCircle (grøn) / XCircle (rød). Gate: lint ok, 280/280 tests, build ok.
7. [x] SKIPPET (iteration: 2026-08-23): Blog-prose-emojis i løbende tekst er lav prioritet
   jf. missions-brev ("Emoji i ren tekst... er lavere prioritet — tag UI'et først").
   Ingen UI-emojis tilbage; prosa-emojis afklares ved senere gennemgang hvis behov.
8. [x] FÆRDIG (iteration: 2026-08-23 20:16): `opengraph-image.tsx` — 8 emoji-ikoner →
   inline lucide SVG (Banknote, Divide, Scale, Receipt, Landmark, ArrowLeftRight,
   ChartColumn, House) + 3 badge-emojis (🆓🔒🇩🇰) → ren tekst (100% Gratis / Privat & Sikkert /
   2026-satser). Gate: lint ok, 280/280 tests, build ok (124 pages).

Ikon-valg pr. href er dokumenteret i `src/lib/icons.ts` (meningsfulde valg: hus=bolig,
landmark=lån, piggybank=opsparing osv.).

### Beregnere (Prio 3 — efter blog iflg. missions-brev, men beholdes her som klar backlog)

### 1. [x] FÆRDIG (iteration: 2026-08-24 01:50): Rabatberegner (`/rabat`) — Hverdag
   - Logik: pris efter rabat %, rabatprocent mellem original- og tilbudspris; tests incl. 0%/100%/negative/null
   - SEO: "rabat beregner", "procent rabat udregning"; fixer dangling `/rabat`-ref i relatedMap
   - Links: procent, enhedspris, del-regning, moms
   - Ikon: Tag (lucide)
   - Fix: src/app/boernepenge/page.tsx manglede `import Link from "next/link"` — build brød på master
   - Gate grøn: lint ok, 295/295 tests (+15 nye rabat-tests, 36 test-filer), build ok (129 pages)
   - Commitsha: e5b21ae

### 2. [x] FÆRDIG (iteration: 2026-08-24 02:13): Befordringsfradrag-beregner (`/befordringsfradrag`) — Økonomi, daOnly
   - Logik: bruger opdaterede `SATSER_2026.koersel*` (24 km bundgrænse, 3,17/1,59 kr/km standard,
     3,51 kr/km yderkommune); brofradrag (Storebælt 110 kr, Øresund 50 kr); ekstra fradrag op til
     30.800 kr ved indkomst under 391.500 kr; årlig skattebesparelse
   - Research: 2026-satser fra skat.dk (3,17/1,59 vs tidligere 2,23/1,12) — markant stigning ~42%
   - SEO: "befordringsfradrag 2026 beregner" — højt sæsonvolumen; links: skattefradrag,
     topskat, loen-efter-skat, rentefradrag, boliglaan
   - SATSER_2026 opdateret: kørselsfradragssatser + nye felter (yderkommune, ekstra, bro)
   - Skattefradrag FAQ opdateret: gamle 2,23/1,12 → 3,17/1,59 kr/km
   - Gate grøn: lint ok, 314/314 tests (+15 nye, 37 test-filer), build ok (130 pages)
   - Commitsha: c57af43 (merge: bdaf555)

### 3. [x] FÆRDIG (iteration: 2026-08-24 02:56): Proteinbehov-beregner (`/proteinbehov`) — Sundhed
   - Logik: g/kg efter aktivitetsniveau (0,8 stillesiddende – 1,0/1,3/1,6/2,0); min/max range
   - Tests: 6 kanttilfælde (null/negative/500+), alle aktivitetsniveauer, range
   - UI: select-dropdown med 5 niveauer, vægt-input, gradient-resultatboks (rose/orange),
     g/kg-visning, range-visning, vejledende-markering i prose
   - SEO-side: da + se locale, FAQ (4 items), CalculatorSchema + FAQSchema,
     Breadcrumbs, RelatedCalculators, Sidebar, 5 interne links
   - Ikon: Egg (lucide)
   - Registreret: calculator-list (Sundhed + relatedMap 5 veje), categories,
     page-data (da + se, allLocalesSlugs), icons.ts
   - Gate grøn: lint ok, 321/321 tests (+7, 38 filer), build ok
   - Commitsha: 4bc9f44 (merge: 2ba658c)

### 4. [x] FÆRDIG (iteration: 2026-08-24 03:15): Rygestop-besparelse (`/rygestop`) — Sundhed, daOnly
   - Logik: `src/lib/rygestop.ts` — cigaretter/dag × pakkepris ÷ pakkestørrelse; besparelse
     dag/måned/år/5 år; måned = 365/12 dage så 12×måned = år præcist; validering incl.
     null/0/negative/ekstreme inputs (10 tests)
   - PAKKESTØRRELSE: backlog sagde "÷19", men standardpakkken i DK er 20 stk — gjort konfigurerbart
     med default 20 og hint i UI (19-pakker findes hos nogle budgetmærker)
   - Research: skat.dk/cancer.dk/Bing-fetches fejlede (404/irrelevante resultater) — beregneren
     afhænger IKKE af officielle satser (pris = brugerinput), default 60 kr/pakke markeret vejledende;
     tobaksaftalen (afgiftsstigninger frem mod 2028) nævnt generisk i prose uden konkrete satser
   - SEO: "rygestop beregner", "hvad sparer jeg på at holde op"; FAQ 4 items; CalculatorSchema +
     FAQSchema + Breadcrumbs + RelatedCalculators + Sidebar; daOnly (svarende til rabat/befordring)
   - Links: side linker ud til /opsparing /sparemaal /budget i prose; relatedMap: /rygestop →
     opsparing/sparemaal/budget/promille/vaegttab; backlinks tilføjet i /promille og /budget maps
   - Ikon: CigaretteOff (lucide) i icons.ts — verificeret renderet på /kategori/sundhed
   - Gate grøn: lint ok, 331/331 tests (+10 nye, 39 filer), build ok (132 pages)
   - Lokal SSR-verificeret: /rygestop = HTTP 200, resultat + interne links renderer, 156 SVG'er
   - Commitsha: 56401f0 (merge: 06a3239)

### 5. [x] FÆRDIG (iteration: 2026-08-24 05:22): Ugenummer-beregner (`/ugenummer`) — Praktisk
   - Logik: ISO-8601 ugenummer, ISO-år, ugedag; antal uger i året (52/53); årsskifte-kanttilfælde
   - Tests: 30 tests (113 linjer) — årsskifte, 53-ugers år, ugedag 1-7, Date-objekt, ugyldige input
   - UI: date-input, gradient-resultatboks, ugedag-navn i locale, årsskifte-advarsel, kort/53-ugers info
   - SEO-side: "Hvilken uge er det?" da + no + se (allLocalesSlugs), FAQ (4 items), CalculatorSchema + FAQSchema, Breadcrumbs, RelatedCalculators, Sidebar; dansk prose-sektion om ISO 8601, 53-ugers år, årsskifte
   - Ikon: CalendarDays (lucide) i icons.ts — matcher dato-relaterede beregnere
   - Registreret: calculator-list (Praktisk + relatedMap til dato/alder/nedtaelling/tidsberegner/termin), categories, page-data (da + allLocales), icons.ts
   - Backlinks tilføjet: /dato /alder /tidsberegner /nedtaelling får ugenummer i relatedMap
   - Fix: TypeScript `as 52 | 53` cast i antalUgerIIsoAar — .uge er number, ikke union (build-fejl opdaget ved gate)
   - Gate grøn: lint ok, 348/348 tests (40 filer), build ok (133 pages)
   - Commitsha: 5a37dda (merge: 5a37dda)

### 6. [x] FÆRDIG (iteration: 2026-08-24 05:45): Alkoholenheder-beregner (`/alkoholenheder`) — Sundhed, daOnly
   - Logik: enheder = volume_cl × abv_pct × 0.006575 (12g/enhed, 0.789 g/ml ethanol)
   - Tests: 10 tests — null på ugyldige inputs, 33cl/4.6%=1 enhed, 50cl/12%=3.9, 4cl/40%=1.05,
     total=pr.drink×antal, gram-alcohol=enheder×12, fractional antal
   - Research: borger.dk/sundhed.dk/cancer.dk alle 404 — definition 12g/enhed er veletableret
     (Sundhedsstyrelsen); note i koden + i prose-sektion
   - UI: select-dropdown med 10 typiske serveringer (øl/vin/shots), antal-drinks input,
     gradient-resultatboks (purple/indigo), enheder-visning + gram-visning, vejledende-markering
   - SEO-side: daOnly (dansk enhedsdefinition); FAQ (4 items), CalculatorSchema + FAQSchema,
     Breadcrumbs, RelatedCalculators, Sidebar, 5 interne links
   - Ikon: Beer (lucide) — allerede importeret i icons.ts
   - Registreret: calculator-list (Sundhed + relatedMap 5 veje + backlink fra /promille),
     categories, page-data (daOnly), icons.ts
   - Gate grøn: lint ok, 358/358 tests (+10 nye, 41 test-filer), build ok (134 pages)
   - Commitsha: 1bcbc1d

### 7. [x] FÆRDIG (iteration: 2026-08-24 06:05): Flyttebudget (`/flyttebudget`) — Hverdag
   - Checklist-budget flytteudgifter (flyttemand 8.000, transport 1.500, kasser 500,
     rengøring 2.500, istandsættelse 10.000, mægler 25.000, tinglysning 3.000,
     advokat 10.000, depositum 30.000, opbevaring 2.000, møbler 15.000, forsikring 1.000,
     andre 0 kr); gradient resultat (yellow/amber); udgiftsfordeling progress bars
   - Registreret: calculator-list (Hverdag, allLocales), categories, page-data (allLocales),
     icons.ts (Truck), backlinks via relatedMap: husleje/budget/boliglaan/boligstoette/kvadratmeter
   - SEO: "flyttebudget beregner", "hvad koster en flytning"; FAQ 4 items;
     CalculatorSchema + FAQSchema, Breadcrumbs, RelatedCalculators, Sidebar
   - Ikon: Truck (lucide)
   - Gate grøn: lint ok, 358/358 tests, build ok (135 pages)
   - Commitsha: c0d44b4

### 8. [x] FÆRDIG (iteration: 2026-08-24 06:27): Boligsalgsberegner (`/boligsalg`) — Bolig, daOnly
   - Logik: salgspris − mæglerhonorar (% eller fast) − markedsføring − energimærke − tilstandsrapport − el-rapport − ejerskifteforsikring − istandsættelse − flytning − advokat − indfrielsesgebyrer − evt. tinglysning af ny bolig = nettoprovenu
   - Research: Boligejer.dk (Erhvervsstyrelsen) for tinglysning/energimærke; markedsbaserede estimater for mægler/istandsættelse/flytning markeret som vejledende
   - Tests: 14 tests — null/negativ/NaN, 4% mægler, fast fee, tinglysning, "andre", fordeling, høj/lav salgspris
   - UI: gradient resultat (emerald/green), radio-knapper for mægler procent/fast, checkbox for tinglysning, progress bars
   - Ikon: DollarSign (lucide)
   - Registreret: calculator-list (daOnly + relatedMap: boliglaan/ejendomsvaerdiskat/andelsbolig/kvadratmeter/flyttebudget + backlinks fra 4 bolig-sider), categories (Bolig), page-data (daOnly), icons.ts
   - SEO: "boligsalg beregner", "salgsprovenu beregner", "omkostninger ved salg af bolig"; FAQ 4 items; CalculatorSchema + FAQSchema, Breadcrumbs, RelatedCalculators, Sidebar
   - Gate grøn: lint ok, 372/372 tests (42 filer), build ok (136 pages)
   - Commitsha: 00dbf4b

### 9. [x] FÆRDIG (iteration: 2026-08-24 06:35): Vedligehold: verificér SATSER_2026 mod officielle kilder
   - Webfetch mod skat.dk/skm.dk: begge JS-renderede (Next.js/Umbraco), satser loades via intern API — ikke tilgængelig via scraping
   - Webfetch mod svmn.dk (SKM's statistikportal): kommuneskat-gennemsnit 2026 = 25,049 % (var 25,07 %), kirkeskat = 0,639 % (var 0,68 %)
   - Opdateret SATSER_2026.kommuneskatSnit: 0,2507 → 0,25049; kirkeskatSnit: 0,0068 → 0,00639
   - Test fix: befordringsfradrag.test.ts hardcodede 0,2507 → nu importerer SATSER_2026.kommuneskatSnit
   - Gate grøn: lint ok, 372/372 tests (42 filer), build ok (136 pages)
   - Status: delvist verificeret — statslige satser (bundskat/mellemskat/topskat/personfradrag/beskæftigelsesfradrag) er vedtaget i personskattereform 2026 men ikke bekræftet via webfetch (kraever manuel tjek på skm.dk). Noteret som "verifikation: delvis (2026-08-24)" i satser-filen.
   - Commitsha: 8f34a8a

## Beslutninger & noter
- Iteration 1: research-iteration (ingen kodeændringer). Baseline verificeret:
  279/279 tests grønne, lint ok, build ok.
- Gate-definition noteret øverst (lint + test + build).
- Deploy: batch-deployer ~07:30/12:30/17:30. Efter hvert merge: VERIFICÉR-note herunder.
- Emoji-udskiftning: ALLE 8 etaper færdige. Alle UI-emojis fjernet (650+ forekomster i 45 filer
  skiftet til lucide-react SVG-ikoner). Kun prosa-emojis (lav prioritet) og dødt data
  (countryFlag i domain-config) resterer.
- Fix: src/app/boernepenge/page.tsx manglede `import Link from "next/link"` — byggefejl opdaget
  under kvalitetsgate for rabatberegner (pre-existing bug, rettet sammen med rabat-iterationen).
- Sikkerhed (2026-08-24 02:46): npm audit fix kørt — 7 non-breaking patches (esbuild, nanoid,
  picomatch, undici, vite, vitest, yaml). 3 høj-alvorlige vuln kræver Next.js 16.3.2 (major) —
  håndteres separat. Commit 57ec92f.

### 10. [x] FÆRDIG (iteration: 2026-08-24 06:43): Boligsalg 2026 — guide til omkostninger og salgsprovenu (`/blog/boligsalg-2026-guide-til-omkostninger-og-provenu`)
    - Topic: komplet guide til omkostninger ved boligsalg — mæglerhonorar, energimærke, tilstandsrapport, el-rapport, ejerskifteforsikring, istandsættelse, tinglysning, flytning; konkret eksempel (3 mio. kr → 2,79 mio. kr nettoprovenu); optimeringsråd
    - Calculators linked: /boligsalg (primær, 2× CTA), /boliglaan, /ejendomsvaerdiskat, /andelsbolig, /kvadratmeter, /flyttebudget
    - Research: Boligejer.dk (Erhvervsstyrelsen), markedsestimater
    - Registreret: blog/page.tsx, sitemap.ts, footer-data.ts ("Seneste artikler"), backlink i /boligsalg page
    - Gate grøn: lint ok, 372/372 tests, build ok (137 pages)
    - Commitsha: bdb0d7c

## Blog — næste indlæg

### 3. [x] FÆRDIG (iteration: 2026-08-23 23:58): Månedsbudget 2026 — Komplet guide til privatøkonomi (`/blog/maanedsbudget-2026-komplet-guide`)
   - Topic: komplet guide til at lave et månedsbudget — faste/variable udgifter, 50/30/20-reglen,
     tommelfingerregler for bolig/transport/opsparing, gældsafbetaling, danske 2026-tal
   - Calculators linked: /budget, /sparemaal, /huslejeberegner, /loen-efter-skat, /opsparing, /pension
   - Backlinks added: /budget, /husleje, /opsparing pages
   - Registreret i blog/page.tsx, sitemap.ts
   - Gate grøn: lint ok, 280/280 tests, build ok (127 pages). Commitsha: a2ca835

### 1. [x] FÆRDIG: Biløkonomi 2026 — Hvad koster det at eje bil? (`/blog/biloekonomi-2026`)
   - Topic: samlet guide til biløkonomi (ejeromkostninger: afgifter, forsikring, brændstof/el,
     værditab, finansiering) med danske 2026-tal
   - Calculators linked: /bil, /braendstof, /billaan, /leasing, /elbil, /laaneberegner, /budget, /loen-efter-skat
   - Cross-links til: spar-penge-paa-braendstof, elpriser-2026, boliglaan-2026
   - Registreret i blog/page.tsx, sitemap.ts
   - Research: FDM/skat.dk-sider blokerede (404), brugt generelle danske 2026-estimater noteret "vejledende"
   - Gate grøn: lint ok, 280/280 tests, build ok (125 pages). Commitsha: 4966fab

### 2. [x] FÆRDIG (iteration: 2026-08-23 23:37): Leasing af bil 2026 (`/blog/leasing-af-bil-2026-pris-og-guide`)
    - Topic: "Leasing af bil 2026: Pris, fordele, ulemper og guide" — komplet guide til privatleasing vs. erhvervsleasing, typiske priser pr. bilklasse, leasing vs. billån, elbil-leasing, faldgruber; danske 2026-tal
    - Calculators linked: /leasing, /billaan, /bil, /braendstof, /elbil, /laaneberegner
    - Cross-links til: biloekonomi-2026, spar-penge-paa-braendstof, elpriser-2026, guide-til-laan-og-renter
    - Registreret i blog/page.tsx, sitemap.ts
    - Research: FDM blokeret (404); brugt generelle danske leasingpriser noteret "vejledende"
    - Gate grøn: lint ok, 280/280 tests, build ok (126 pages). Commitsha: 1c8a9a6

### 4. [x] FÆRDIG (iteration: 2026-08-24): Børnepenge 2026 — Satser, regler og udbetaling (`/blog/boernepenge-2026-satser-og-regler`)
    - Topic: komplet guide til børne- og ungeydelse 2026 — satser 0-2/3-6/7-14/15-17 år, aftrapning ved høj indkomst, deling mellem forældre, ekstra tilskud til enlige forsørgere; officielle borger.dk-satser
    - Calculators linked: /boernepenge, /barselsdagpenge, /boligstoette, /budget, /su, /loen-efter-skat
    - Cross-links til: barsel-2026, boligstoette-2026, fradrag-2026, skat-2026
    - Registreret i blog/page.tsx, sitemap.ts
    - Backlink added: /boernepenge page linker til blog
    - Cleanup: 3 tidligere blog-indlæg og dette nye tilføjet til footer-data.ts "Seneste artikler"
    - Gate grøn: lint ok, 280/280 tests, build ok (128 pages).

## VERIFICÉR DEPLOY-log
- **Åbne noter:** O5/C1/C2/C3/T4 fra før dette T5-checkpoint er indholdskontrolleret
  efter 07:30-vinduet og lukket nedenfor.
- DEPLOY OK: billaan-ikoner (etape 6), calculator-list-ikoner (etape 3), footer-ikoner (etape 4) — verificeret 2026-08-23 18:20.
- **Batch 07:30 24. aug.** inkluderede: etape 5 (komponent-ikoner), etape 8 (opengraph), biloekonomi, leasing, maanedsbudget, boernepenge blog, rygestop, rabat, proteinbehov, ugenummer, befordringsfradrag, alkoholenheder, flyttebudget, boligsalg, satser-opdatering, boligsalg blog.
  - DEPLOY OK 2026-09-23: `/alkoholenheder`, `/flyttebudget`, `/boligsalg` og `/blog/boligsalg-2026-guide-til-omkostninger-og-provenu` serverede det forventede live-indhold; `/api/health` svarede `status: ok`.
- **DEPLOY OK 2026-09-24 07:46 CEST:** 07:30-batchen indeholder barsel-2026-artiklen,
  `/barselsdagpenge`, BMI-voksenværktøjet, WHO-børnetabel/links, SU-konsolideringen,
  `/su`, SU-guiden og `/studielaan`. Live-indholdet viser henholdsvis 5.085 kr./137,43 kr.
  og 9+13-UGER, "BMI for voksne" + alders-/kønsspecifik børneguide, samt
  7.426/1.154-3.202/3.692/3.799 kr. med fribeløb og hypotetisk studielånsscenario.
  `/api/health` svarede samtidig `status: ok`; alle sider gav 200 via live-hentning.
- Lukkede dermed deploynoterne for `792d0c0`, `e3f3dcf` og `191a431` (med O3-kode i
  `cc173c5`); ingen ældre åbne VERIFICÉR-noter står tilbage.
- **DEPLOY OK 2026-09-25 00:29 CEST:** O4 `1dc1c86` er live. Live-kontrol fandt
  `lang=sv`, self-canonical, `og:site_name=Beräknare.se` og JSON-LD med SEK på
  `/tidsberegner`, `/dato` og `/lon-efter-skatt`; de fem svenske aliases var ét
  redirect-hop og bevarede query-parametre. `/blog` og DA-only `/ugenummer` gav 404,
  sitemap indeholdt de svenske kernesider men ikke blog, og `/api/health` svarede
  `status: ok`. Hermed er O4-noten lukket; ingen ældre åbne deploynoter står tilbage.
- **DEPLOY OK 2026-09-25 08:04 CEST:** 07:30-batchen indeholder O5, C1, C2, C3 og
  T4. Live `/boligstoette` + artikel viser standardinterval-/formue-afgrænsning,
  offline-formue-CTA og den officielle beregner; DA/SE `/procent` viser det konkrete
  10-procent-svar; DA/SE `/dato` viser svar-først "antal dage mellem to datoer";
  DA/SE `/tidsberegner` og `/moms` viser C3-copy. Headless Chromium hydrerede T4-delelinks
  og viste 8t 0 både med og uden næste dato, altså ingen 32 timer.
  `/api/health` svarede samtidig `status: ok`. Dermed er O5/C1/C2/C3/T4-noterne lukket;
  ingen ældre åbne deploynoter står tilbage.
- **DEPLOY OK 2026-09-25 18:20 CEST:** 17:30-batchen lukker T5, M2 og M3 efter
  indholdskontrol i headless Chromium mod de live domæner.
  - **T5 `a889f5e`:** `beraknare.se/moms` viser `Momssats`-gruppen med
    25/12/6 %, "Mat, hotell"/"Böcker, kultur" og reducerad-sats-copy. Hydreret
    indtastning af 1 000 kr. gav 1 250 ved 25 %, **1 120 ved 12 %** og **1 060 ved
    6 %**, og `aria-pressed` fulgte valget. Det er den faktiske 12/6 %-interaktion,
    note lukket.
  - **M2 `1745519`:** `/bmi` med 80 kg/180 cm gav BMI 24,7; skift til imperial
    konverterede til 176,37 lbs/70,87 in med BMI 24,7 bevaret, og skift tilbage
    gav 80 kg/180 cm og BMI 24,7. Roundtrip består, note lukket.
  - **M3 `89ba868`:** Hydreret søgning på DA `/` med "BMI for mit barn" gav
    `/blog/bmi-for-boern-saadan-tjekker-du` som eneste og første resultat, mens
    "BMI for voksne" gav `/bmi`. Note lukket.
  - **M1 `0ba8f8f`:** CI-only ændring. `origin/master:.github/workflows/lighthouse.yml`
    bruger nu `npm run start` med et wait-loop på `localhost:3000` i stedet for
    det bare `next start`, der fejlede med `next: command not found`. Første
    naturlige PR-run er stadig ikke set; det noteres i stedet for at antages.
  - **I1 `dd5f4af`:** Kode er live — `POST /api/internal/indexnow` svarer 503 i stedet
    for 404, også med Bearer-token, fordi runtime-konfigurationen mangler. Nøglefilen
    `/api/indexnow-key/<nøgle>` svarer 404, fordi `INDEXNOW_API_KEY` ikke er sat.
    **Indsendelser er derfor ikke aktive endnu.** Runtime-konfigurationen er
    uændret under ❓ Til Mads; `/indexnow-key.txt` er ikke ruten, så et 404 på den
    sti er ikke et fejlfund.
  - `/api/health` svarede `status: ok` under alle kontroller.
- **VERIFICÉR DEPLOY:** C4 svar-først `/tidszone`-tabel, spørgsmålstitel og
  description `c78a7a6` 2026-09-25 18:40 CEST. Verificér efter næste batch-vindue
  med live DA `/tidszone` (synligt svar + tabel) og SE `beraknare.se/tidszone`;
  HTTP 200 alene utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet
  2026-09-26**, fordi merge skete efter 17:30-vinduet 2026-09-25.
- **VERIFICÉR DEPLOY:** C5 svar-først `/renteberegner` og `/kalorier` `200ce4c`
  2026-09-25 19:05 CEST. Verificér efter næste batch-vindue på live DA: title
  "Renteberegner: 100.000 kr. i 5 år = 1.887 kr./md." med synligt
  "Samlet rente: 13.227 kr." + link til `/rentefradrag`, og title
  "Hvor mange kalorier om dagen? | Kalorieberegner" med synligt
  "TDEE 2.759 kcal ved moderat aktivitet". HTTP 200 alene utilstrækkeligt.
  **Kan først verificeres fra 07:30-vinduet 2026-09-26.**
- **VERIFICÉR DEPLOY:** C7 dage-til-sider `8950593` 2026-09-25 19:50 CEST.
  Verificér efter næste batch-vindue: live DA `/dage-til/juledagen` (og de 6
  øvrige DA-slugs) samt SE `beraknare.se/dagar-till/juldagen` (og de øvrige
  SE-slugs) skal servere det korrekte antal dage i title og synligt i H1, og
  `/dage-til/juledagen` på beraknare.se skal være ét 301-hop til
  `/dagar-till/juldagen`. Tjek desuden at sitemap på begge domæner indeholder
  de 7 sider. HTTP 200 alene utilstrækkeligt — tallet skal være dagens.
  **Kan først verificeres fra 07:30-vinduet 2026-09-26.**
- **VERIFICÉR DEPLOY:** C6 svar-først `/alder` og `/brok` `aa2c32c` 2026-09-25
  19:20 CEST. Verificér efter næste batch-vindue på live DA `/alder` (title
  "Aldersberegner: hvor gammel er du i år, måneder og dage?" og synligt
  "36 år, 6 måneder og 10 dage pr. 25. september 2026" samt at den gamle
  "35 år, 10 måneder og 28 dage" er væk) og live DA/SE `/brok` (title med
  "forkort 6/8 til 3/4 = 0,75 = 75 %" og samme svar synligt). HTTP 200 alene
  utilstrækkeligt. Bemærk: tallene i `/alder`-teksten er dateret, så et senere
  build-tidspunkt giver en ny dato og nye tal; kontrollér at tekst og tal stadig
  hænger sammen.

- **VERIFICÉR DEPLOY:** C8 folkepension-rettelse `42a576e` 2026-09-25 20:26 CEST.
  Verificér efter 07:30-vinduet 2026-09-26: `/pension` skal servere
  folkepensionsalder-tabellen med 65/65½/66/66½/67/68/69/70, pensionstillæg
  8.729/4.467 kr. og overskriften "Hvor kommer pensionen fra" i beregneren
  (ikke "De tre pensionssøjler"). HTTP 200 er ikke nok — tjek indholdet.
- **VERIFICÉR DEPLOY:** C9 svar-først   `/braendstof` og `/kvadratmeter` `d9aa21c`
  2026-09-25 20:35 CEST. Verificér efter 07:30-vinduet 2026-09-26: live DA
  `/braendstof` skal have title "Brændstofberegner: 500 km benzin koster 450 kr." og
  det samlede svar synligt i introafsnittet; live DA `/kvadratmeter` skal have title
  "Kvadratmeterberegner: 5 x 4 m = 20 m²" og "Et rum på 5 x 4 m er 20 m²" synligt.
  Tjek også `beraknare.se/braendstof` og `beraknare.se/kvadratmeter` for de svenske
  titler. HTTP 200 alene utilstrækkeligt.
