STATUS: 2/10 18:15. CI grøn ved start (seneste kørsel `37025234613`). PR-TJEK
   2/10 15:12 og 17:30: ingen åbne PR'er. Sentry: ingen opgave med reel
   effekt — MINBEREGNER-2 (`useLocale must be used within a LocaleProvider`,
   `POST /`) var **allerede rettet** i `def070c` 09:26, før hændelsen 02:24,
   altså lukket af en tidligere iteration. MINBEREGNER-1 (router state header,
   `GET /barselsdagpenge`) er 15 hændelser / **0 brugere** = bot-trafik, ikke
   en fejl nogen har set. CEO-kø punkt 0: verificeret lukket 2/10 14:48.
   Review-fund 2/10 15:10: rettet (`0b841f2`).
   **Gate:** `npm run lint` · `npm run typecheck` · `TZ=UTC npm run test` ·
   `npm run build` — grøn 2/10 18:12 (**3758** tests i 231 filer, **+6**).
   **Denne iteration:** `/procent`s tolv FAQ-beløb (da 4, no 1, se 7) lå som
   rå tekst, og `FAQSchema` læser præcis `faqItems` — altså synlige for
   Google. De læses nu fra de konstanter modulet allerede bruger resten af
   siden med (`RABAT_EKSEMPEL`, `EXCEL_ANDEL`, `PROCENT_SKILLNAD_EKSEMPEL`).
   `page-data.ts` 196 → **186** fund, `/procent` på **0**.
   **Målt:** alle tolv svar er **byte-identiske** før/efter (dump fra
   `getPageData` i da/se/no), så det er en ren lægningsopgave uden
   SEO-regression. Porten i `page-data.test.ts` fanges mod to mutationer
   (`RABAT_EKSEMPEL.nedsatPris` 7875→8000, `PROCENT_10_AF_FAQ` 1600→1500).
   **Fase 3's tekniske check gjort:** `/procent` `/moms` `/dato`
   `/tidsberegner` har alle korrekt `canonical`, `hreflang` (da/se/x-default)
   og title; sitemap har 158 unikke URL, 0 dubletter, 0 trailing-slash. Der er
   altså ingen titel-/teknik-fejl tilbage — kun positionen, som planen siger.
   **Næste iteration:** `.ts`-beløbs-køen nederst, `/renteberegner` først.

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

**Åben række (strenglisten):** næste fil skal måles på ny — de punkt der stod
åbne er alle ❓-blokerede. **Fire filer er lukket 2/10:** SU
(`su-indlaeg-belob-fra-modul`), arveafgift (`arveafgift-belob-fra-modul`),
`/boligsalg` (`boligsalg-belob-fra-modul`) og `/procent`
(`procent-faq-tal-fra-modul`) — alle i `docs/plan-arkiv.md`. Strenglistens
loft er **70 → 57**, JSX-listen **360 → 347 → 338 → 333**.

**Ny målt fejlklasse — `page-data.ts` ligger uden for begge beløbs-porte.**
`strengBelob`/`jsxBelob` måler kun `.tsx`, så de usourcede intervaller i
`/boligsalg`s `faqItems` blev **publiceret som JSON-LD** (`FAQSchema` læser
præcis `faqItems`). Det er den samme fejl som JSX-teksten, bare usynlig for
porten.

**Åben: beløbs-porten scanner kun `*.tsx`.** *Accept:* `strengBelob` kører på
`src/lib/*.ts` også, og listen opdateres i samme commit.

**Målt 2/10 18:12 (egen AST-probe, samme mønster som portens `strengBelob`):**
**alle 196 fund lå i `page-data.ts` alene** — ikke fordelt i `src/lib/*.ts`
som portens docblock siger. Efter `/procent` er de **186**. Det er næsten
alle **FAQ-svar**, altså JSON-LD Google har. Køen pr. slug:
`vaegttab` 24 · `renteberegner` 22 · `kalorier` 17 · `moms` 15 · `pension` 12 ·
`leasing` 9 · `rentefradrag` 7 · `kvadratmeter` 6 · `konfirmation` 6 ·
`efterloen` 5 · `aktieskat` 5 · `loen-efter-skat` 4 · `topskat` 4 ·
`boernepenge` 4 · resten ≤3. **Anbefalet rækkefølge:** `/renteberegner`
(svensk 3.123 visninger) → `/moms` (men ⛔ de 3 lovgrænser) → `/kvadratmeter`
(3.705) → `/leasing` (2.923) → `/vaegttab` (1.277). *Accept pr. slice:* ét
slug pr. opgave, 12 fund eller færre, de læses fra sit eget modul, og en
mutation i porten. **Hvis porten udvides til `.ts` med det samme, bliver
listen 186 lang og de 186 tal bliver en tilladelsesliste** — det er
måske nok det, men en tilladelsesliste over fejl er dyrere end porten er
bred. Derfor: fix slugs først, portudvidelsen som sidste skridt når de er
nede mod 0.

**Åben:** `/moms` har 3 fund tilbage, som er lovgrænser (dansk registrering over
50.000 kr, svensk over 120.000 kr, told ved import over 1.150 kr). ❓ nedenfor.

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

| Slug | Prøv på indhold |
|---|---|
| `procent-faq-tal-fra-modul` (**ny**, vindue 2/10 21:30) | `minberegner.dk/procent`: FAQ'en skal have de to svar «Skriv =A1/B1\*100 … Et fald fra **9.000** kr til **7.875** kr er =(B1-A1)/A1\*100 = **-12,5 %**.» og «Går en pris fra **9.000** kr til **7.875** kr, er faldet (7.875 - 9.000) / 9.000 = **-12,5 %**.», plus «10 procent af **1.600** er **160**». `beraknare.se/procent`: «**2 500** kr av **10 000** kr ger **0,25**, alltså **25** procent», «**2 500** / **10 000** = **0,25** = **25** procent», «**33 000** kr mot **30 000** kr ger **3 000** / 30 000 = **10** procent», «**10 000** till **12 500** ger … = **25** procent … **2 500** / **11 250** = **22,2** procent», «**10 000** i A1 och **12 500** i B1 ger **25** procent … **22,2** procent», «10 procent av **1 600** är **160**». **Hele teksten skal være byte-uændret** — det er pointen ved opgaven. **Intet** `1.600` på beraknare.se og intet `1 600` på minberegner.dk |
| `lon-efter-skat-en-kilde` (**åben**, vindue 2/10 17:30) | `beraknare.se/lon-efter-skatt` og `minberegner.dk/lon-efter-skatt`: brødteksten skal sige **«mellan cirka 17 400 och 45 600 kr per år 2026»**, **«prisbasbeloppet 59 200 kr»**, **«Snittet i Sverige 2026 är 32,38 %»**, **«skiktgränsen 643 000 kr 2026»**, **«brytpunkt cirka 660 400 kr i bruttolön»**, **«upp till cirka 4 400 kr per månad»**, **«högst 1 184 kr per år»** og **«Allmän pensionsavgift (7 %)»**. Den nye sætning skal være **«På en månadslön på 35 000 kr blir skillnaden 1 277 kr i nettolön per månad»**. **Intet** «flera hundra kronor». FAQ'en skal have **fem** spørgsmål, hvor intet svar afviger fra de samme tal. `minberegner.dk/lon-efter-skatt` er dansk med svensk fallback — de svenske domæner er de to ovenfor |
| `boligsalg-belob-fra-modul` (**ny**, vindue 2/10 17:30) | `minberegner.dk/boligsalg`: introen skal sige **«195.105»**, **«2.804.895»**, **«Ejendomsmægler med 120.000»** og **«77 % af omkostningerne»**; listen skal sige **«7.500»**, **«6.500»**, **«4.000»**, **«4.000»** og **«20.000»**. Kilder-afsnittet skal have **«0,6 % af købesummen plus 1.850»** og **«1,45 % af 80 % af vurderingssummen plus 1.825»** og overskriften «Kilder og forbehold». FAQ'en skal have **fire** spørgsmål, hvor **intet** svar indeholder et beløb. **Intet** «150.000-250.000», «3-6%», «25.000-60.000», «6.900-8.700», «5.000-15.000», «Boligejer.dk» eller «august 2025» i hele HTML'en. **Intet** «NaN» nogen steder. `beraknare.se/boligsalg`: **intet** dansk beløb i JSON-LD'en (den har ingen `se`-data, så FAQ'en er dansk — det er en kendt, separat fejl) |
| `norsk-pace-side` (**ny**, vindue 2/10 17:30) | **De norske rettelser er ikke live og kan ikke være det:** `beregner.no` serverer et andet site (❓ 2/10 14:15). Prøven er derfor at de to **live** domæner er uændrede. `minberegner.dk/pace`: FAQ'en skal have **ni** spørgsmål, «Hvor lang tid tager et Ironman?» skal svare «… 1:00:00 + 5:00:00 + 3:30:00 = 9:30:00 i alt …», og beregneren skal vise «**Holdtider pr. kilometer**» (dansk label). **Intet** «Deltider pr. kilometer» og intet «Løpetidsberegner - beregn fart» på den danske side. `beraknare.se/pace`: skal vise «**Deltider per kilometer**» (svensk label) og de samme ni spørgsmål, **intet** «Deltider pr. kilometer» (norsk) |
| `arveafgift-belob-fra-modul` (**ny**, vindue 2/10 17:30) | `minberegner.dk/blog/arveafgift-regler-og-satser`: `<title>` byte-uændret «Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.» og `<meta name="description">«Arveafgift (boafgift) 2026: Et barn arver 1 mio. kr. og betaler 91.155 kr. Se bundfradrag på 392.300 kr, 15 % for nære arvinger og 36,25 % for søskende.»», `og:description` «Arveafgift 2026: 91.155 kr for et barn der arver 1 mio. kr. Bundfradrag, satser og to regneeksempler.» — **intet** dobbelt punktum. Sats-tabellen skal have **«36,25%»** i to celler, «Kort svar» **«36,25 %»**, og **intet** «36.25» i hele HTML'en. Begge regnestykker byte-uændrede: `1.107.700 / 166.155 / 1.333.845 / 666.923` og `407.700 / 61.155 / 738.845 / 184.711 / 245.866 / 554.134`. FAQ'en skal have **fire** spørgsmål, hvor «Hvad koster arveafgiften, hvis et barn arver 1.000.000 kr?» svarer «… afgiftsgrundlaget er 607.700 kr … modtager 908.845 kr.». Gavegrænserne (74.100 / 26.600 kr) er bevaret med vilje |
| `su-indlaeg-belob-fra-modul` (**ny**, vindue 2/10 17:30) | `minberegner.dk/blog/su-2026-satser-og-regler`: `<title>` skal være «SU 2026: 7.426 kr. pr. måned udeboende» (byte-uændret) og `<meta name="description">` skal være «SU 2026: udeboende får 7.426 kr. pr. måned, hjemmeboende 1.154-3.202 kr. **Videregående fribeløb fra 20.749 kr.**, SU-lån op til 3.799 kr. Alle tal fra su.dk.». **`Intet` «Fribeløb fra 15.297 kr.»** — det var ungdomsuddansatte sats på en side om videregående uddannelse. Artiklens JSON-LD-`description` skal have den samme nye sætning, og `og:description` skal have «fribeløb fra 20.749 kr. på videregående uddannelse». Resten af siden (tabel, otte FAQ, brødtekst) skal være byte-uændret |
| `triatlon-ironman-tid` (**åben**, vindue 2/10 17:30) | `minberegner.dk/pace`: en `<h2>` «Triatlon og Ironman: tiden for alle tre ben» med en tabel på fire rækker (Svømning 3,8 km 1:00:00 15:47 · Cykel 180 km 5:00:00 1:40 · Løb 42,195 km 3:30:00 4:59 · I alt 225,995 km 9:30:00) og FAQ'en skal have **ni** spørgsmål, hvor «Hvor lang tid tager et Ironman?» svarer «… 1:00:00 + 5:00:00 + 3:30:00 = 9:30:00 i alt …» og «Hvor stor en del af et Ironman er cyklen?» «… 52,6 % af tiden … 79,6 % af distancen». `beraknare.se/pace` skal have «Triathlon och Ironman» + «Löpning» + «Totalt» og de samme ni spørgsmål. **Intet** «9:30:00» på `/pace` uden for tabellen og de to svar |
| `ugenummer-uge-datoer` (**åben**, vindue 2/10 17:30) | `minberegner.dk/ugenummer`: resultatboksen skal vise de **syv** datoer i den valgte uge — `Mandag 12. oktober` … `Søndag 18. oktober` for uge 42 — i kort under «Uge 42 / 2026». FAQ'en skal have **fem** spørgsmål, og «Hvilke datoer er der i uge 42?» skal svare «… går fra **mandag den 12. oktober 2026** til **søndag den 18. oktober 2026** …». `keywords` skal have «datoer i uge» og «datoer i uge 42». **Intet** dansk i `beraknare.se/ugenummer` ændret |
| `boernepenge-aarstal` (**ny**, vindue 2/10 17:30) | `minberegner.dk/blog/boernepenge-2026-satser-og-regler`: aftrapningseksemplets parentes skal være **byte-uændret** «Har du to børn på 0-2 år (21.480 kr × 2 = 42.960 kr.), får du udbetalt 40.182 kr.» — det er **årstal** (5.370 × 4), ikke kvartal. **Intet** «10.740 kr × 2 = 21.480 kr» og intet «18.702 kr» |
| `boernepenge-indlaeg` (**åben**, vindue 2/10 17:30) | Samme side: `<title>` byte-uændret «Børnepenge 2026: 5.370 kr./kvartal (0-2 år)» (målt OK 12:47). FAQ'en skal have **ti** spørgsmål med svarene «… Ungeydelsen er 1.114 kr. pr. måned, altså 13.368 kr. om året.» og «… 1.741 kr. pr. kvartal pr. barn, 1.774 kr. i ekstra børnetilskud … 5.025 kr. i særligt børnetilskud ved adoption.». Familietabellen skal have `10.740`, `9.618`, `11.838` og `6.684` i kolonnen «Pr. kvartal» |
| `moms-eksempler-fra-modul` (**åben**, vindue 2/10 17:30) | `minberegner.dk/moms`: introens tre listeregler skal være `Læg moms til: … 1.000 kr. × 1,25 = 1.250 kr. inkl. moms`, `Træk moms fra: … 1.250 kr. ÷ 1,25 = 1.000 kr. ekskl. moms` og `Find momsandelen: … 1.250 kr. × 0,20 = 250 kr. i moms»; «er 2,4414, så 1.000 kr. bliver 2.441,41 kr.» og «bliver prisen 0,4096 af den oprindelige — altså 409,60 kr. i alt»; **intet** «kun 410 kr. oveni». `beraknare.se/moms`: de samme tre linjer med **mellemrum** (`1 000 kr exkl. → 1 250 kr inkl.`), «2,4414»/«0,4096», «10,71 %»/«5,66 %» |

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
- ❓ **Elbilens vægtafgift 2026 (og Sveriges fordonsskatt).** `/bil` skrev «Elbil:
  0 kr (til 2026)» og «Afgifter kommer (2026+)»; `skat.dk` svarer 500. Teksten
  siger nu kun hvad beregneren regner med, og tallet ligger i
  `bil-omkostninger.ts` som `DRIFT.da.vaegt.el`.
- ❓ **Fitnessfradrag, sommerhusudlejning, madvaretabel, grundskyld for Varde og
  Playwright.** Fem mindre kilder, alle noteret med detaljer i
  `docs/plan-arkiv.md` 2/10 14:20. Uden dem bygges intet, jf. punkt 11.