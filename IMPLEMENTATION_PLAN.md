# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — C2 (CTR på /dato) I GANG.

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

#### 7. [ ] I GANG 2026-09-25 — C2 — Løft `/dato` CTR og svar direkte på dage-spørgsmål

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
- **Forventet effekt:** Stærk CTR på eksisterende høj placering og bedre overførsel fra
  spørgsmål til selve dato-værktøjet.
- **Acceptkriterier:** Baselines skrives før ændring; title/description svarer på
  “antal dage mellem to datoer”; et eventuelt datolink kun hvis forskning dokumenterer
  reel efterspørgsel og dynamisk korrekt dato; fuld gate grøn.
- **MÅL:** `/dato` baseline 1.028 besøgende/28d 2026-09-24; Search Console 128.065
  visninger, 784 klik, CTR 0,6 %, position 5,8 pr. 2026-09-22.

#### 8. [ ] C3 — Løft CTR på `/tidsberegner` og `/moms`

- **Datagrund:** Search Console: `/tidsberegner` 71.966 visninger, 207 klik, CTR 0,3 %,
  position 7,0; `/moms` 23.735 visninger, 39 klik, CTR 0,2 %, position 6,8. Plausible:
  `/tidsberegner` 292 besøgende/28d og `/moms` findes ikke i top-siderlisten pr.
  2026-09-24.
- **Scope:** Research snippets/autosuggest og ret title, description og synligt
  svar-first indhold på de to eksisterende sider. Behandles som én CTR-iteration kun
  hvis diffen forbliver lille; ellers skilles i to opgaver. Ingen matematikændringer.
- **Forventet effekt:** Laver CTR-hængning ved position 6-7 bliver til kvalificeret
  trafik på to eksisterende værktøjer.
- **Acceptkriterier:** Baselines for begge sider skrives før ændring; snippets svarer på
  henholdsvis “beregn tid” og “momsberegner”; fuld gate grøn.
- **MÅL:** `/tidsberegner` baseline 292 besøgende/28d 2026-09-24; `/moms`
  Plausible-baseline **ukendt**. Search Console: 71.966/23.735 visninger,
  207/39 klik, CTR 0,3/0,2 %, position 7,0/6,8 pr. 2026-09-22.

#### 9. [ ] I1 — Integrer IndexNow uden at sende under iterationen

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

#### 10. [ ] M1 — Ret Lighthouse-CI's serverstart

- **Datagrund:** PR #20 og fire seneste tidligere Lighthouse-runs fejlede, før audit
  startede, med `next: command not found`. Den separate build-job er grøn.
- **Scope:** Kør den eksisterende standalone-produktionsserver via et script, der
  får `node_modules/.bin` på PATH (fx `npm run start` eller `npm exec -- next start`),
  og bekræft at workflowen tester den faktiske Next.js-production-build.
- **Forventet effekt:** Gør PR-gate troværdig igen; påvirker ikke brugerindhold eller
  trafik direkte, men fjerner en gentaget CI-fejl.
- **Acceptkriterier:**
  1. Serveren starter efter `npm ci` + build, og LHCI kører faktisk Lighthouse.
  2. Ét grønt PR-run med fejlende Lighthouse-tærskel må kun fejle på den konkrete
     Lighthouse-regel, aldrig `next: command not found` eller manglende production-output.
  3. Repoets lokale build/tests/lint forbliver grønne.
- **Placering:** Efter C1-C3 og I1; kun hvis LHCI begynder at blokere flere PR'er.

#### 11. [ ] M2 — Bevar BMI ved gentaget skift mellem metrisk og imperial enhed

- **Datagrund:** O2 gemmer nu enhed i delelinks, infererer gamle imperiale links og
  afgrænser konverteringen til to decimaler. En fuld kg/cm → lbs/inches → kg/cm
  roundtrip er endnu ikke målt, så gentagne skift kan stadig ændre BMI'en en smule.
- **Acceptkriterier:**
  1. En test måler BMI før og efter mindst tre skift og dokumenterer maksimal afvigelse.
  2. Måleenhedsskift bevarer BMI'en inden for den dokumenterede displaypræcision.
  3. Delelink, enhedsværdier og `InputField`-validering er grønne efter roundtrip.
- **MÅL:** `/bmi` baseline 979 besøgende/28d 2026-09-23; effektmåling først efter
  14 dage hvis der laves en separat produktændring.

#### 12. [ ] M3 — Route børne-BMI-søgninger til guiden

- **Datagrund:** O2 har adskilt sider og metadata, men `SearchBar` og
  `BeregnerAssistent` søger fortsat kun i beregnere. "BMI for mit barn" kan derfor matche
  `/bmi`, selv om værktøjet kun er for voksne.
- **Scope:** Tilføj den danske BMI-for-børn-guide som søgeindhold på forsiden, lad
  børneudtryk vælge guide før voksenværktøjet, og behold voksenquick-suggestionen.
  Tilføj komponenttests; ændr ikke Plausible-events eller -metrikker.
- **Forventet effekt:** Forhindrer en forkert voksen-handling og giver den relevante
  næste handling; effekt på organisk trafik måles ikke isoleret.
- **Acceptkriterier:**
  1. Søgning på "BMI for mit barn" viser guiden og ikke voksenværktøjet som bedste match.
  2. Søgning på "BMI for voksne" viser fortsat `/bmi`.
  3. Tastaturvalg, tomme resultater og eksisterende locale-adfærd er grønne.
- **MÅL:** `/bmi` baseline 979 besøgende/28d 2026-09-23; bloggens baseline er ukendt
  og skal udfyldes fra næste snapshot før en reel effektvurdering.

### ❓ Til Mads

- Public `/api/v1/bmi` er bevidst uændret, fordi `/api/v1` er en frosset ekstern
  kontrakt. Den returner fortsat rå BMI med voksengrænser uden alder. En eventuel
  dokumentations- eller adfærdsændring kræver en eksplicit beslutning.

### Dokumenterede kandidatere efter top-5

- `/kvadratmeter` 370 besøgende/28d (+131 %): autocomplete og konkurrenter peger på
  gulv, cm/mm, antal ens felter og spild; prose nævner allerede 5-10 %, men koden gør
  det ikke. MÅL ved eventuel opgave: baseline 370 2026-09-23.
- `/rentefradrag` 289 besøgende/28d (+160 %): høj vækst, men 33,6/25,6 % er
  upræcise og mangler primær kilde. MÅL ved eventuel opgave: baseline 289 2026-09-23.
- `/dato` 1.008 besøgende/28d (+92 %): stærkeste side og allerede bred funktionstil;
  konkurrenten iKalender tilbyder arbejdsdage uden helligdager, mens vores side
  springer helligdage over. Ingen ændring før et konkret søgeintentionsgap kan dokumenteres.
  MÅL: baseline 1.008 2026-09-23.
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
- **VERIFICÉR DEPLOY:** O5 boligstøtte-screening, konsistent 2026-indhold, sikker
  fragment-delestat, offline/query-cachebeskyttelse og copy-fejlfeedback `0ed3ec3`
  2026-09-25 00:37 CEST. Verificér efter næste batch-vindue med faktisk indhold på
  `/boligstoette` og `/blog/boligstoette-2026-nye-regler`; HTTP 200 alene er utilstrækkeligt.
- **VERIFICÉR DEPLOY:** C1 `/procent` med svar-først DA/SE title, description, synligt
  eksempel og uændret beregner `98306a7` 2026-09-25 00:52 CEST. Verificér efter
  næste batch-vindue med faktisk markup på begge domæner; HTTP 200 alene utilstrækkeligt.
