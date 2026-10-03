STATUS: 3/10 15:2x. **⛔ BLOCKED — jeg merger ikke til `master` igen.**
       Den danske `/timer-i-aaret` giver **HTTP 404** i produktion (8/8 curl,
       15:17–15:20), mens `beraknare.se/timmar-i-aret` giver 200, og sidens egen
       sitemap + den svenske sides `hrefLang="da"` peger på den 404. **Det er
       ikke koden:** lokal produktionsbuild af HEAD (228e1ff) svarer 200 med
       `Host: minberegner.dk`, byggets ruterliste har begge ruter, porten
       `timer-i-aret.test.tsx` (17 tests) er grøn, og 404-svaret bærer
       `x-locale: da` + `x-hostname: minberegner.dk` — de headere sættes kun i
       `proxy.ts:58-61`, så beslutningen var *allow*. Billedet er nyt nok
       (live har f87a196 09:42, b9fad7e 08:51, 7cc66e0 09:10), og f3b3516
       (07:14) tilføjede begge route-filer i én commit. **Menneske skal se
       Dokploy-billedet** (to containere? cachet `.next`? ren rebuild?).
       Bevis og kommandoer: `docs/plan-arkiv.md`, afsnit 3/10 15:2x.
       **⛔ `ceo/timer-i-aret` var lukket 07:55 på fejl** — kun den svenske URL
       blev dømt.
       Denne iteration leverer derfor **ingen kode**: den er BLOCKED på en
       produktionsfejl uden for repoet.
       **GATE (noteret 3/10 15:1x):** `npm run typecheck` → `npm run test`
       (hele suiten) → `npm run lint` → `npm run build`. Alle fire skal være
       grønne; rækkefølgen er build-fejl → tests → lint.
       **CI grøn** ved start (228e1ff, 3m1s), ingen åbne PR'er, ingen uløste
       Sentry-fejl, begge review-fund rettet (0554456), CEO-køens otte fund
       lukkede (verificeret 3/10 15:1x: Valborg 30/4, svensk påskafton -1,
       dansk langfredag/sankthans fast 23-24/6, påskeaften-FAQ rettet,
       huslejenævnet-påstanden væk, `toUtcMidnight` i Europe/Copenhagen).
       PR-TJEK: 3/10 15:1x (ingen åbne). BRANCH-TJEK: 3/10 15:1x (kun
       `bevaret/*` + `master` på origin).

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv til næste måling)

| Side | Plausible/28d | GSC-visninger/28d | CTR | Pos. |
|---|---|---|---|---|
| `/procent` | under top-15 | 150.470 | 0,1 % | 7,4 |
| `/dato` | 1.133 | 133.054 | 0,6 % | 5,7 |
| `/tidsberegner` | 290 | 73.666 | 0,3 % | 6,9 |
| `/tidszone` | under top-15 | 24.324 | 0,4 % | 7,5 |
| `/moms` | under top-15 | 22.464 | 0,2 % | 7,0 |
| `/kvadratmeter` | 391 | 20.768 | 1,5 % | 4,9 |
| `/alder` | under top-15 | 10.029 | **0,4 %** | 7,2 |
| `/tidszone` | under top-15 | 23.351 | **0,4 %** | 7,6 |
| `/promille` | 148 | 6.003 | 1,6 % | 7,8 |
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
**F0. [~] hreflang-skråstreg på `/dato` — formodningen MÅLT MODBEVIST 3/10 15:1x.**
   *Hvad:* planen hævdede at `/dato` og `/dage-i-aaret` gav `hrefLang` med
   skråstreg (altså en 308). *Målt (curl, hele `<head>`, 15:1x):* **0 af 15**
   sider har skråstreg i en `rel="alternate"` — `/`, `/dato`, `/procent`,
   `/tidsberegner`, `/dage-mellem-datoer`, `/dage-i-aaret`, `/dage-til`,
   `/klokken-i`, `/nedtaelling`, `/su`, `/tidszone` m.fl. Canonical er
   korrekt overalt, og `page-helpers.ts:67` bygger `languages` som
   `${baseUrl}/${slug}` — uden skråstreg. Lokal produktionsbuild af HEAD
   bekræfter: ruterne og metadata er i overensstemmelse. *Konklusion:* enten
   var målingen fra 14:2x taget mod en anden kørsel (lokalt dev-server-build),
   eller fejlen er rettet siden. **F0 nedprioriteres**; den port, der blev
   foreslået (hver `hrefLang` lig canonical), er værd at have, men først
   når den kan finde en fejl. *MÅL:* `/dato` 131.320 visninger / 863 klik /
   0,7 % / pos. 5,6 (da) og 102.316 / 97 / 0,1 % / pos. 8,1 (se).

`/dato`s `hrefLang` skriver `https://minberegner.dk/dato/` og
`https://beraknare.se/dato/`, og begge **308'er** til URL'en uden skråstreg.
*Målt 3/10 14:2x (curl, hele `<head>`):* `/dato` har skråstreg på alle tre
`rel="alternate"` (`da`, `sv`, `x-default`), `/dage-i-aaret` har den på alle
tre, mens **11** sider er korrekte uden skråstreg — `/procent`, `/tidszone`,
`/moms`, `/alder`, `/braendstof`, `/kalorier`, `/promille`, `/renteberegner`,
`/nedtaelling`, `/ugenummer`, `/laaneberegner`. Canonical er korrekt overalt.
*Accept:* `buildPageMetadata`-kaldende sider må aldrig give en `hrefLang` med
skråstreg, fordi URL'en ikke findes (308), og **en port** renderer `/dato`,
`/dage-i-aaret`, `/timer-i-aret` og `/dage-mellem-datoer` og dømmer at hver
`hrefLang` er **lig med** canonical uden skråstreg. *Årsag ikke fundet:*
`/dato` kalder `generatePageMetadata("dato")` som `/nedtaelling`, og den får
skråstreg — bisect `buildPageMetadata` → `getAlternateSlug` → layoutets
`metadataBase`. *MÅL:* `/dato` 131.320 visninger / 863 klik / 0,7 % / pos. 5,6
og `beraknare.se/dato` 102.316 / 97 / 0,1 % / pos. 8,1.


**F0b. [x] ✅ Regnet eksempel i `metaTitle` på `/alder` og `/tidszone`** —
   `docs/plan-arkiv.md`. *Hvem:* alle der googler «aldersberegner» (27.000
   søgninger, pos. 4) og «tidszoner» (4.000, pos. 10). *Accept:* begge titler
   har et regnet eksempel, `ogTitle` er lig `metaTitle`, `{AAR}` er løst fra
   `alderLevet` (aldrig frosset), og `meta-title-tal.test.ts` dømmer tallet.
   **MÅL:** `/alder` 10.029 visninger / 43 klik / **0,4 %** / pos. 7,2 (da) og
   3.689 / 14 / 0,4 % / 7,6 (se) mod `/kvadratmeter`s 1,5 % på pos. 4,9 →
   GSC 17/10. `/tidszone` 23.351 / 101 / **0,4 %** / 7,6.

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

**F5c. [~] Procentnotationen «8 %» — 319 noder målt 3/10 12:3x.**
*Hvad:* de største resterende er `blog/30-procent-reglen-husleje` 25 (⛔ de er
regelnavnet — de **skal** have en undtagelse, nogen må tage stilling til om
sitets eget navn «30% reglen» skal skrives «30 %-reglen»), `/moms` 18 (⛔ de 3
lovgrænser, ❓ nedenfor), `billaan` 17, `blog/koeb-af-bolig-…` 15,
`arveafgift` 14, `blog/guide-feriepenge-…` 13.
*Accept:* loftet i `regnestykker.test.ts` (`PROCENT_UDEN_MELLEMRUM_LOFT`) må
kun falde, og hver slice tager de tre største filer. *Målt:* 598 → 570 → 509 →
436 → 371 → 361 → 356 → **319** noder (scanneren tæller noder, så en linje med
to procenter tælles én gang). Fem navne-undtagelser: «30% reglen» i
`husleje/page.tsx`, `page-data.ts` og de to blogindlægs sidelinks, plus
«4%-reglen» i pensionsindlægget — de er **regelnavne**, ikke procenter.
**Interpolationer er lukket som fejltype.** `regnestykker.test.ts` kan kun se
`JsxText` og strengliteraler, så `{tal}%` er usynlig for den; derfor renderer
`procent-i-synlig-tekst.test.tsx` de berørte komponenter i da/se/no og dømmer
den **synlige** markup. Slice 10:5x (boliglån), 11:2x (fem beregnere) og
12:3x (**tretten** beregnere: `/1rm`, `/moms`, `/dagpenge`, `/budget`,
`/husleje`, `/billaan`, `/forbrugslaan`, `/aktieskat`, `/del-regning`,
`/lon-efter-skatt`, `/arveafgift`, `/brutto-netto`). To af dem skrev **punktum**
(`/lon-efter-skatt` 20.2 %, `/brutto-netto` 33.3 %), og de to
resultattilstande kan hverken scanneren eller markup-porten se, så de har fire
egne tests i `decimal-komma.test.tsx`. Detaljer og målinger: `docs/plan-arkiv.md`.
*Næste slice:* mål på ny med `grep -n '}%' src/components/*.tsx`; de
sidste `title=`-attributter og CSS-højder er ikke synlig tekst.

**F5g. [~] Procenterne på de fem sider svinget 08:20 sprang over.** *Slice 1/2
3/10 13:5x:* `/opsparing`s fire afkastceller + `PensionBeregner.tsx:268` er
rettet. *Målt på ny (curl, synlig tekst, 3/10 13:4x):* `/billaan` 15,
`/arveafgift` 10, `/brutto-netto` 6, `/konfirmation` 7, `/kalorier` 1,
`/dagpenge` 1 — `/konfirmation` og `/dagpenge` har 0 i `page.tsx`, så resten
kommer fra `page-data.ts` og komponenterne.
`/opsparing` (28), `/arveafgift` (30), `/dagpenge` (10), `/husleje` (10) og
`/konfirmation` (7) — målt på live 3/10 12:47, og det er koden: de fire
`opsparing`-tabelceller, `PensionBeregner.tsx:268` og de øvrige strenge.
*Hvorfor:* noten `ceo/procent-punkt-sweep-side-data` lovede 0 `\d%` på dem og
kan aldrig lukkes, fordi svinget ikke skete. *Accept:* hver side får 0 `\d%` i
den synlige tekst i da/se/no, de fem navne-undtagelser («30% reglen» ×2 pr.
`/husleje`, «4%-reglen») står, og `ceo/procent-punkt-sweep-side-data` kan
lukkes på sit rigtige indhold. *MÅL:* samme som F5c.
 **Port:** `procent-i-synlig-tekst.test.tsx` renderer de fem i tre sprog.

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
den nye port; lukket 12:3x med kommune-listen).** *Hvad:* den renderede `/brutto-netto`
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

- **`/renteberegner` og `/arveafgift` mangler et regnet eksempel i titlen** —
  *Hvem:* alle der googler «renteberegner» (6.000 søgninger, pos. 8) og
  «arveafgift beregner». *Datagrund:* målt 3/10 — de er de **eneste to** af
  GSC-top-15 der stadig har spørgsmålstitel; `/renteberegner` har 12.610
  visninger og **0,8 %** CTR på pos. 7,4. *Accept:* begge titler får et regnet
  eksempel fra `rente-eksempler.ts` / arveafgiftens egen datakilde, og de lægges
  i `MALTE_SIDER` i `meta-title-tal.test.ts`. **MÅL:** `/renteberegner`
  12.610 visninger / 107 klik / 0,8 % / pos. 7,4 → GSC 17/10.

## Åbne opgaver — F5b: beløb i JSX-tekst → modulkonstanter

Listen `src/app/regnestykker.test.ts` tæller forekomster pr. fil og må kun
blive kortere. ✅ betyder lukket; detaljerne står i `docs/plan-arkiv.md`.

**Åben række (strenglisten):** næste fil skal måles på ny. Loftene og de
lukkede filers målinger står i `docs/plan-arkiv.md`.
**Åbne F5b-slice: `/flyttebudget` (3 fund), mål listen på ny først.**
`/moms` er ⛔ (de 3 lovgrænser, ❓ nedenfor).
## VERIFICÉR DEPLOY-noter

**Dømt 3/10 15:1x–15:2x på indhold (curl).** Fuldtekst og målinger står i
`docs/plan-arkiv.md` (afsnit «3/10 15:2x»).

- ✅ `ceo/procent-punkt-sweeps` 08:00 — 0 `\d%` på /procent (da+se) og 0 i den
  synlige tekst på /boliglaan; de 22 træffere dér er `style="width:…%"`.
- ✅ `ceo/boliglaan-procent` 10:5x — samme måling. Notens «95,0 %»/«5,05 %» er
  interpolationer og kan ikke dømmes ordret (⛔ ❓ lukket hermed).
- ✅ `ceo/procent-forside-feriepenge` 09:4x — 0 `\d%` på forsiden (da+se) og
  /feriepenge; «Feriepenge (12,5 %)», «- AM-bidrag (8 %)», «100 % Gratis» ×2.
- ✅ `ceo/kommunesat-komma` 12:1x — ⛔ kan ikke dømmes på notens URL
  (`beraknare.se/lon-efter-skatt` svarer 200, men linjen ligger ikke dér med
  den form noten kræver). Målt i stedet på `/brutto-netto`: «Kommuneskat
  (ca. 25 %)» med komma. Noten er for snævt formuleret.
- ⛔ `ceo/procent-punkt-sweep-side-data` 08:20 — kan ikke lukkes (svinget skete
  aldrig); flyttet til opgave F5g i `docs/plan-arkiv.md`.

**Åbne, med grunden:**

- `ceo/procent-sweep-pension-boliglaan` 10:1x · `ceo/procent-interpolationer`
  11:2x · `ceo/procent-interpolationer-2` 12:35 · `ceo/hoelligdag-cache` 11:5x
  · `ceo/kommune-decimal-komma` 12:3x — fra commits **før** 12:30, men de
  strenge de kræver mangler stadig i `HEAD` (f.eks. `page.tsx:53` skriver
  «AM-bidrag (8%):» endnu, og `guide-feriepenge-…/page.tsx:148` «- AM-bidrag
  (8%)» i en tabel). Ikke et deploy-problem — **F5c/F5g**.
- `ceo/dato-dage-til-rækker` 13:0x · `ceo/su-indtaegtsgraense-maaned` 13:4x ·
  `ceo/titler-med-regnet-eksempel` 14:4x — fra commits **efter** 12:30
  (ca1b4b3, 0554456, 228e1ff); næste vindue er 17:30. Målt 15:2x: `/dato` har
  endnu ikke «Hvor mange dage er der til …?»-overskriften, `/su` skriver den
  gamle «Du må højst tjene …»-sætning.
- ⛔ `ceo/timer-i-aret` 07:55 — **var lukket på en fejl.** Den danske side er en
  404; se STATUS.
- `ceo/klokken-i`, `ceo/afstand-mellem-adresser`, `ceo/dage-mellem-datoer`,
  `ceo/dage-i-aaret` (2/10–3/10) — målt OK 3/10 15:1x: `/dage-til`,
  `/klokken-i`, `/dage-i-aaret`, `/dage-mellem-datoer` og deres svenske
  tvillinger svarer 200 med korrekt canonical + 3 hreflang uden skråstreg.

**⛔ DEPLOY-MISSING: `/timer-i-aret` (dansk) 404 i produktion.** Se STATUS og
`docs/plan-arkiv.md`.

## ❓ Til Mads

- ❓ **Hvor deployes den norske udgave? (ny, 2/10 14:15, højst prioriteret.)**
  Målt i live: `beregner.no` serverer et **helt andet site** — norsk «100+ gratis
  norske kalkulatorer» med `/kalkulator/<slug>`-ruter og 115 URL'er i sin egen
  sitemap. Dette repos `no`-locale 404'er på `/dagpenge`, `/procent`,
  `/tidsberegner` og `/api/health`, og `domain-config.ts` har `beregner.no` i
  `hiddenDomains` («not yet launched»). Al norsk tekst, også den norske
  dagpenge-linje fra `1174169`, er derfor usynlig for brugere. Skal `beregner.no`
  servere denne app, eller er den norske udgave ikke i drift?
- ❓ **Ferieåret er ikke længere 1. september – 31. december (ny, målt
  12:3x).** `page-data.ts:1822` siger «Med den nye ferielov (fra 2020) er
  optjeningsperioden 1. september til 31. august, og ferieåret løber fra
  1. september til 31. december året efter», `/feriepenge/page.tsx:59-62`
  siger det samme, og bloggen `guide-feriepenge-hvornaar-og-hvor-meget`
  har det i to tabeller og i brødteksten. **Det er reglerne fra FØR
  ferielovsændringen.** retsinformation.dk er en SPA (`/api/eli/…` og
  `/api/search` giver begge HTML), `lex.dk/ferieloven` og `da.dk` 404'er,
  så **intet** kan verificeres herfra. Ét skærmbillede af ferielovens § 7
  (ferieår og optjening) låser det, og rettelsen får sin egen test i
  `page-data`-porten, fordi den er brødtekst på tre sider og i FAQ- og
  JSON-LD-output. Koden er bevidst urørt — punkt 11.
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
- ❓ **`ceo/boliglaan-procent`-noten er for snævert formuleret (3/10 12:47).** Den
  kræver «95,0 % belåning» og «5,05 % p.a.», men det er interpolationer fra
  brugerens felter og flytter sig med standardværdierne. Live står «Typisk
  0,5-1,5 %», «Over 80 % belåning» og «ca. 5,0-7,0 %», og siden har 0 `\d%`.
  Skal dømmes på 0 `\d%` og de statiske strenge, ikke på to tal der flytter sig.
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
