STATUS: 1/10 21:40. Rød CI: ingen (seneste kørsel grøn 18:54). Sentry: ingen nye
  hændelser efter router-støj-fixen. CEO-køen er **tom** — punkt 0 verificeret i
  koden igen. **Ingen åbne PR'er** (`PR-TJEK: 2026-10-01`).

  **Nyt: /dagpenge svarede ikke på «dagpenge nyuddannet».** `ceo/dagpenge-nyuddannet`.
  Ordet «nyuddannet» fandtes ikke ét sted på siden — den sagde kun «Dimittend» — og
  de to betingelser for dimittendsatsen (18 måneders uddannelse, tilmelding til
  A-kassen inden for 14 dage) lå kun i et blogindlæg, ikke på den kalkulatorside
  folk faktisk lander på. Nyt afsnit læser alle tal fra `DAGPENGE_2026`.
  *Datagrund:* dansk autocomplete 1/10 — 6 af 10 træffere under «dagpenge» er
  konkrete satser på to underemner (nyuddannet, efter skat). Det er den stærkeste
  uafsluttede klynge i Feature-køen. **MÅL:** /dagpenge har ingen GSC- eller
  Plausible-baseline (ikke i top-15); sæt fra næste snapshot.
  *Port:* 2 nye tests i `/dagpenge/page.test.tsx` læser betingelserne og begge
  satser ud af den **renderede** markup.

  **Kilde-blokeret:** fradrag 2026 (fitness, sommerhusudlejning) kan **ikke** bygges.
  1/10 21:25 forsøgte igen: `dagpenge.dk`, `star.dk` (404), `fristen.dk` og
  `borgerhåndbog.dk` svarer alle med forbindelsesfejl fra denne maskine. Uden
  kilde bygges de ikke — se ❓ nedenfor.

  **Deploy: 21:30-vinduet har ikke hentet 1/10's ændringer.** Målt 21:38:
  `/dage-til/2-juledag`, `/dage-til/fastelavn` og se `/dagar-till/fettisdagen`
  svarer **404**, `/dage-til/1-december` mangler «I dag er det», `/skattefradrag`
  har stadig 12.400/6.200 og ikke 9.000/18.300, og `/dage-til/skolestart` har
  stadig «1. august ligger i uge 31». Det er **ét** vindue, målt 8 min efter det
  åbner, så det er ikke DEPLOY-MISSING endnu — næste iteration måler igen efter
  **07:30**-vinduet.

  **Gaten:** `lint` 0 (652) · `typecheck` 0 · `TZ=UTC npm run test`
  **3459 grønne / 211 filer** · `next build` ok (exit 0).

## Næste opgave (klar til næste iteration)

**Hvornår kommer børnepengen ud? På `/boernepenge`.** Den fjerde og sidste
uafsluttede autocomplete-klynge under «fradrag 2026» er lukket med ❓ (se nedenfor),
så næste klynge er børnepenge: «børnepenge hvornår» og «børnepenge juli 2026» er
træffere, og GSC har **6.126 visninger** på blogindlægget
`/blog/boernepenge-2026-satser-og-satser` med «børnepenge 2026» 1.031 visninger
på pos. 9 — altså **placeringen tabes af et blogindlæg, ikke af kalkulatoren**.
*Accept:* `/boernepenge` svarer synligt på, hvornår udbetalingen sker, i begge
sprog, med tallene læst fra samme modul som satsen, og en test der læser svaret ud
af den renderede markup. **Ingen kilde → ❓, ikke et gæt** (punkt 11).
**MÅL:** `/boernepenge` har ingen baseline endnu — skriv CTR og visninger fra næste
snapshot.

## ❓ Uafklaret — ferielov (rammer `/dage-til/summerferien` **og** skolestart)

  ❓ ferielov (se nedenfor) er **stadig åbent**. Denne iteration rørte hverken
  skolestart eller sommerferien — de to nye påske-ankrede sider er fastelavn
  og palmesøndag, fordi de er påskedagen minus et fast antal dage og derfor
  ikke kan være forkerte af ferieloven. 1/10 17:55 er retsinformation.dk stadig
  en SPA-skal på `eli/lsa/2024/1072`, `data.xml` og `para/3` (200 men kun
  2,8-4,5 kB HTML), `uv.dk/emner/folkeskoler` er 404, og ft.dk ligger bag
  Cloudflare.

## Fase 3 — trafik-drevet

### Baselines (målt 30/9, bliv her til næste måling)

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

CTR følger **ikke** position — se fundet i STATUS 1/10 06:35. `/boligstoette`
har 2,4 % CTR på pos. 8,7 mod `/procent`s 0,1 % på pos. 7,4. Det er 24x
forskel på næsten samme placering, samme site, samme måned. Vi ligger
**på position 5-8 på 600.000 visninger**, men positionen er ikke den eneste
variabel.
Der er ingen titel, beskrivelse- eller intern-link-fejl tilbage at rette på de
eksisterende sider — kun **positionen** er lav, og den afgøres af den danske
konkurrence i hvert enkelt ord.

**Den største *målbare* afstand:** beraknare.se har **190.447 visninger**
(`/dato` 101.580 + `/tidsberegner` 61.934 + `/procent` 26.933) og **229 klik**
— 0,12 % CTR. Det er en tredjedel af sitets samlede visninger og en
halvredsdel af dets klik. Svensk indholdsdybde er målt til at være **lig med
den danske** (`/dato` 1.617 mod 1.723 ord, `/tidszone` 1.706 mod 1.756), så
det er heller ikke et dybde-problem — det er opgave 187's slugs plus den
svenske domæneautoritet.

### Prioriterede opgaver

**F1. [ ] Få søgeniveau-data for `/procent` — 150.470 visninger og 0,1 %.**
GSC's tre søgninger for siden summerer **364 visninger af 150.470**, så vi ved
intet om resten. Uden søgningsniveau kan ingen vælge mellem "ny side", "dybere
side" og "nye links". **Accept:** GSC-eksport for `/procent` (eller de 20
største søgninger site-wide) ligger i planen. **❓ se nedenfor.**

**F2 + F2b. [x] ✅** rabat-spørgsmål + svensk rabatt-FAQ — `docs/plan-arkiv.md`.
**MÅL:** `/procent` 150.470 / 97 / 0,1 % / 7,4 (da), 26.933 / 2 / 0,0 % / 9,9 (se).

**F3. [ ] Beraknare.se: position, ikke titel.** 190.447 visninger på pos. 8-10.
Opgave 187 (svenske slugs, 301) er sat til **13/10** og må ikke flyttes før de
svenske titelændringer fra C195/C196 er målt. Efter den dato er det den største
enkeltpost i trafikplanen. **Accept:** se opgave 187.

**F4. [x] ✅** dobbelerede stribe væk — `docs/plan-arkiv.md`. **MÅL:** `/` 218
besøgende/28d, bounce 38 % → mod 2-7 %; se `/` 20, bounce 80 %.

**F5. [ ] Søg på de 27 % ikke-Google-trafik.** Bing 1.319 + DDG 378 +
Yahoo 274 besøgende/28d. IndexNow er kodet (`src/lib/indexnow.ts`), men ❓
spørger om krogen efter deploy er sat op — uden svar er Bing/DDG/Yahoo
indeksering uafhængig af vores deploys.

**F6. [x] ✅** norske tal uden dansk separator — port `intl-locale-tag.test.ts`.**

**F7. [x] ✅** tidsforskellers dage læst fra `afvigendeDage()`. **MÅL:**
`/tidszone` 24.324 / 104 / 0,4 % / 7,5.

**F8. [x] ✅** svenske helgdagslove kildeført. **MÅL:** se `/nedtaelling`
5.726 / 12 / 0,2 % / 9,2.

## Feature-kø

Prioriteret efter forventet effekt på **trafik**. Datagrund fra GSC 1/10
(2026-09-01 → 2026-09-29) og dansk autocomplete målt 1/10 13:05.

- **Procentpoint på `/procent`** — ✅ 1/10, `ceo/procentpoint-vaerktoej`.
  *Hvem:* alle der googler «hvad er procentpoint» (autocomplete #1 under
  «hvad er procent», 8 af 8 completions under «procent point»).
  *Accept:* værktøj + afsnit + 3 FAQ i begge sprog — leveret.
  *Datagrund:* GSC + autocomplete 1/10. **MÅL:** `/procent` 151.005 / 92 /
  0,1 % / 7,4 (da) · 27.778 / 2 / 0,0 % / 9,9 (se). Genmål 15/10.
  *Næste skridt hvis det virker:* de samme tal på sig selv — point leder
  videre til opinionsmålinger og rentetrin.
- **Renteprognose** — ✅ 1/10, `ceo/renteprognose`. *Hvem:* alle der
  googler «renteprognose» (10 af 10 danske completions under ordet selv, 3 af 10
  under «rente»). *Accept:* ny beregner med renteomlægning, afdragsform og
  rentesvingning — leveret. *Datagrund:* autocomplete 1/10.
  **MÅL:** ny side, ingen baseline. Genmål 15/10 på Plausible og GSC.
  *Næste skridt:* de samme completions peger på banknavnene — overvej en
  `/renteprognose`-tilføjelse der viser forskellen på 3-årig og 5-årig.
- **Autocomplete: 28 seeds målt 1/10.** *Accept (delvis):* seeds målt og
  klyngerne skrevet herunder — det stærkeste klynge er bygget. Resten er
  prioriteret. *Datagrund:* `suggestqueries.google.com`, hl=da gl=dk.
  **Klynger vi ikke dækker, i rækkefølge efter hvor ren intentionen er:**
  (1) *dagpenge* — «dagpengesats 2026», «dagpenge nyuddannet», «dagpengekort»,
  «dagpengetæller», «dagpengesats 2026 efter skat»: 6 af 10 er konkrete satser
  på to underemner (nyuddannet, efter skat). Vi *har* `/dagpenge` — spørg om
  satsen i stedet for at bygge en ny side. (2) *børnepenge 2026* — «børnepenge
  juli 2026», «børnepenge hvornår» ud over de to vi allerede dækker.
  (3) *fradrag 2026* — «fradrag for fitness», «fradrag for rengøring»,
  «fradrag havearbejde», «fradrag sommerhusudlejning». **Delvis lukket 1/10:**
  rengøring og havearbejde er servicefradraget (18.300 kr.), og de to felter hedder
  nu «Rengøring, have m.fl.» — men boligjob-lofterne var 2025-tal og er rettet,
  se `ceo/boligjob-lofter-2026`. Fitness og sommerhusudlejning mangler stadig og
  kræver en sats, der kan læses i en kilde (skat.dk er 500). (4) *skoleferie/skolestart 2026* — «skoleferie 2026»,
  «skolestart 2026»: matcher `/dage-til`-mønstret, men ❓ opgave 201 (ferielovens
  startdato) blokerer det. (5) *renteprognose 2026/2027/2030* — årstal-varianter
  af den side vi lige byggede; de er samme intention, så de skal **ikke** blive
  egne sider.

- **Landing-side pr. konkrete countdown-spørgsmål** (`/dage-til/<slug>`).
  *Hvem:* «hvor mange dage er der til 1 december» 1.209 visninger, 3 klik,
  pos. 5. *Accept:* de fire sider findes allerede (jul, nytår, sommerferie,
  skolestart) med svaret i `<title>` og i sitemap — **mål om de ranker, før
  der bygges flere.** *Datagrund:* GSC 1/10. ✅ **Udbygget 1/10** med fastelavn,
  palmesøndag og 2. juledag (`ceo/dage-til-fastelavn-palmesondag-2juledag`) —
  seks sider, autocomplete 1/10, ingen ny kilde. Nu er der 22 da + 19 se
  `/dage-til`-sider (målt med `getDageTilSlugs`), og hver af dem linker til de
  øvrige. **MÅL:** nye sider, ingen baseline. Genmål 15/10.
- **Pristalsregulering på `/husleje`** — ✅ 1/10. *MÅL:* `/husleje` 161
  besøgende/28d, bounce 4 % (Plausible 2026-10-01). GSC har ingen
  `/husleje`-visning i top-15, så CTR-baseline er **ikke** kendt — trafikken
  er overvejende ikke-Google. Genmål 15/10.
- **Forskelsside til `/dato` og `/tidsberegner` på beraknare.se.** *Hvem:*
  190.447 svenske visninger på 0,12 % CTR. *Accept:* CTR over 0,3 % på 14
  dage. *Datagrund:* GSC se, 1/10. **Kan ikke før 13/10** (opgave 187).
- **Kalorieguide på `/kalorier`.** *Hvem:* 9 af 10 danske autocomplete-træffere
  under «kalorier» er madvarer. **Blokeret på kilde** (opgave 119, ❓) — må
  ikke gættes tal.

## Åbne VERIFICÉR DEPLOY-noter

- ⏳ **Boligjobordningens 2026-lofter: 9.000 kr. og 18.300 kr.**
  `ceo/boligjob-lofter-2026`. Prøven er på indhold: `curl -s
  https://minberegner.dk/skattefradrag` skal indeholde «op til 9.000 kr. pr.
  person i 2026» og «særskilt loft på 18.300 kr.» og **ikke** «12.400» eller
  «6.200»; `https://minberegner.dk/blog/skat-2026-alt-du-skal-vide` skal have
  «18.300 kr» i listen. Målt 1/10 **21:38**: **ikke live** endnu (skattekassen har stadig 12.400/6.200). Genmål efter 07:30.

- ⏳ **Tre nye `/dage-til`-sider: fastelavn, palmesøndag, 2. juledag.**
  `ceo/dage-til-fastelavn-palmesondag-2juledag`. Prøven er på indhold: `curl -s
  https://minberegner.dk/dage-til/2-juledag` skal indeholde «26. december
  2026 er en» og et `<time>` med dagens ISO-dato;
  `https://minberegner.dk/dage-til/fastelavn` skal sige «Fastelavn er påskedagen
  minus 47 dage», og `https://beraknare.se/dagar-till/fettisdagen` skal have
  `<title>` med «fettisdagen». Målt 1/10 **21:38**: **ikke live** endnu (skattekassen har stadig 12.400/6.200). Genmål efter 07:30.

- ⏳ **Dagens dato står i heroen på alle `/dage-til`-sider.**
  `ceo/dage-til-dagens-dato`. Prøven er på indhold: `curl -s
  https://minberegner.dk/dage-til/1-december` skal indeholde «I dag er det» og
  et `<time>` med dagens ISO-dato i Copenhagen-tid. Målt 1/10 **21:38**: **ikke live** endnu (skattekassen har stadig 12.400/6.200). Genmål efter 07:30.

- ⏳ **`/dage-til/skolestart` tæller til den første skoledag.**
  `ceo/skolestart-forste-skoledag` (dae670a). Prøven er på indhold: `curl -s
  https://minberegner.dk/dage-til/skolestart` skal indeholde «mandag 3. august
  2026» **og** «i uge 32 i 2026». Målt 1/10 18:22: «mandag 3. august 2026» er
  **der** (men kun fordi den stod i den gamle tekst), mens «i uge 32 i 2026»
  **mangler** — FAQ'en serverer stadig «1. august ligger i uge 31 i både 2026 og
  2028». Målt igen 1/10 19:10: «mandag 3. august 2026» er der, «i uge 32 i 2026»
  mangler stadig, altså endnu ikke deployet. Målt 1/10 **21:38**: «mandag 3. august
  2026» er der (3 gange), «i uge 32 i 2026» mangler stadig, og den gamle «1. august
  ligger i uge 31» står stadig 6 gange. **Endnu ikke live.** Genmål efter 07:30.

- ✅ **`/renteprognose` er live og virker.** `ceo/renteprognose` (9b283d3).
  Målt 1/10 18:22: `<title>` er «Renteprognose - hvad koster boliglånet om 5, 10
  og 30 år?», siden nævner **renteprognose 41 gange** og har alle tre
  værktøjs-blokke (Renteomlægning, Afdragsform, Rentesvingning), og
  `/rentefradrag` har **1** `href="/renteprognose"`. Vindue 1/10 17:30.
  **DEPLOY OK 1/10.**

- ✅ **Sentry skal sende, og loggen må ikke være slået fra.**
  `ceo/sentry-sendepipeline` (28a2592). Efter deploy: prod-build skal **ikke**
  have `silent: true` i `next.config.ts` (grep efter `silent:`), og
  `GET /api/health` skal svare `ok`.

- ✅ **Sentry-støjen fra Next router state skal forsvinde.**
  `ceo/sentry-router-stoej` (3e67ed3). Målt 1/10 18:22: `grep -c
  'shouldDropSentryEvent' src/lib/sentry-config.ts` = **2** (definition +
  kald i `scrubSentryEvent`, linje 107 og 116), og `GET /api/health` svarer
  **200**. Vindue 1/10 17:30. **DEPLOY OK 1/10** på kode og health.
  *Sidste hændelse med beskeden i snapshottet er 2026-10-01T12:56, altså før
  deployet — det næste Sentry-snapshot bekræfter 0 nye.*

- ⏳ **Nyt afsnit: /dagpenge svarer på «dagpenge nyuddannet».**
  `ceo/dagpenge-nyuddannet`. Prøven er på indhold: `curl -s
  https://minberegner.dk/dagpenge` skal indeholde «Nyuddannet?» og «18 måneder» og
  «14 dage» i samme afsnit, og **ikke** mangle ordet «nyuddannet».
  Vindue 2/10 07:30.

## ❓ Til Mads

- ❓ **Ser du events fra minberegner.dk i Sentry-projektet?** Det er nu det
  eneste stykke af spørgsmålet fra opgave 204, der ikke er besvaret af kode.
  Afsendelsen er **bevist** — `sentry-send.test.ts` får en rigtig envelope
  gennem den rigtige `initSentryServer()` og modtager den på en collector, så
  SDK'en sender, og `beforeSend` er registreret på begge sider. Men det beviser
  *transporten*, ikke at **dit projekt** modtager: det afhænger af DSN-projektet
  og af at traffic'et rent faktisk rammer en kastende rute. **Ingen fejl i 14
  dage er derfor stadig en svag vished** — den kan betyde "alt er godt" eller
  "intet kaster". Ét skærmbillede af Sentry-projektet, eller en bevidst fejl i
  et prod-build med et `[Sentry]`-flag på init, låser det. Jeg kan ikke se
  projektet: API'en kræver din konto.

- ❓ **Ingen læsbar kilde til fitnessfradraget og sommerhusudlejningsfradraget
  (opgave fra 1/10 21:25, ny blokering).** De to er de sidste af «fradrag 2026»-klyngen,
  og 1/10 21:25 fik hverken `dagpenge.dk` eller `star.dk` til at svare
  (forbindelsesfejl / 404), mens `skat.dk` har været 500 siden C19. **Et skærmbillede
  af de to linjer i SKAT's fradragsvejledning** — eller teksten kopieret herind —
  låser dem. Uden det bygges de ikke, jf. punkt 11 i kvalitetsreglerne.
- ❓ **Ferielovens regel for sommerferiens startdato (opgave 201, ny 1/10,
  højst prioriteret).** `/dage-til/sommerferien` siger "sommerferien begynder
  altid den **sidste lørdag i juni**" og hævder, at det står i folkeskoleloven
  (2024) — og hele nedtællingen, titlen og beskrivelsen er regnet ud fra den
  regel. Jeg kunne ikke hente loven: retsinformation.dk er en SPA (også på
  `.xml`), `undervisningsministeriet.dk`, `ferieinfo.dk` og `ferieloven.dk`
  svarer transportfejl, `lovguiden.dk` svarer HTTP 429, og
  `danskelove.dk/ferieloven` handler om ferieloven for *ansatte*, ikke om
  skoleferier. **Ét skærmbillede af den relevante bestemmelse (eller teksten
  kopieret herind) låser det.** Hvis reglen er "den lørdag i den kalenderuge,
  hvori 20. juni ligger", står siden **7 dage forkert** i de fleste år.
  Jeg har bevidst ikke rørt koden, fordi en lovpåstand uden kilde er præcis den
  fejl, CEO-køens punkt 0 handler om.
- ❓ **Kan Cloudflare cache HTML'en på trods af Next's `Vary: RSC`?** (opgave
  200, højst prioriteret.) Der står Cloudflare foran sitet med
  `cf-cache-status: DYNAMIC`, fordi Next svarer `cache-control: private,
  no-cache, no-store`. Sætter vi bare `s-maxage` på HTML'en, **bryder vi
  Next's egen rute-navigation**: klienten genanmoder samme URL med `RSC: 1`, og
  en CDN der cache'r på URL ville give routeren HTML i stedet for sit
  flight-svar. Løsningen er en Cloudflare-regel (spring RSC-anmodninger over)
  eller en Worker — altså din infra, ikke repoet. **Uden det er 280-433 ms TTFB
  på alle 600.000 månedlige visninger den faste pris.** Kan du lave den regel,
  eller skal jeg holde vej 2 (ægte ruter pr. domæne) i beredskab til 13/10?
- ❓ **Søgningseksport fra Search Console (ny, 30/9, højst prioriteret).**
  GSC's opsummering viser kun de 3-4 største søgninger pr. side. For `/procent`
  — **150.470 visninger, 97 klik, pos. 7,4, sitets største side** — er de tre
  søgninger tilsammen **364 visninger**, altså 0,24 % af det vi vil vide noget
  om. Uden de øvrige søgninger kan ingen af os vælge mellem "byg en ny side",
  "gør siden dybere" og "byg flere interne links", og det er præcis de tre
  retninger der er brugt de seneste uger. **Et skærmbillede af Search Console →
  Effektivitet → Søgninger, filtreret på `/procent`, plus de 20 største
  søgninger for hele domænet, låser F1-F4.** GSC-data kan ikke hentes fra en
  agent — API'en kræver din konto.
- ❓ **IndexNow mangler en krog efter deploy (ny, 30/9).** Bing, DuckDuckGo og
  Yahoo står for ~1.960 af 7.319 besøgende/28d, og IndexNow får ændringer ind
  på minutter i stedet for dage. Koden kan skrives i dag, men **noget skal
  kalde den efter et vellykket deploy** — og det er batch-deployeren, ikke mig:
  Jeg må ikke trigge deploys og kan ikke se, hvordan den er sat op. Skal jeg
  skrive `npm run indexnow` ind i `.dokploy/preview.template.json`, eller kører
  du kommandoen manuelt efter en batch?
- ❓ **Fulde browsermålinger kræver Playwright (ny, 30/9).** Deploy-noter der
  kræver en rigtig browser kan ikke lukkes maskinelt: repoet har ingen
  Playwright, og `CLAUDE.md` forbyder nye afhængigheder uden dit ja. Uden det
  bruger jeg jsdom-render (som med C55/C56/C60), der dækker logikken men ikke
  layout, breakpoints eller mørk tilstand. **Én konkret måling mangler nu:**
  hvor højt populærgitterets første kort ligger på 390 px efter F4's rettelse
  1/10 (kortene er ca. 230 px, helten og søgefeltet fylder meget af første
  skærm). Jeg har låst rækkefølgen i markupken, men ikke målt den — og layoutet
  i helten og gitteret er det, en skærmdump ville afkræfte.
- ❓ **Kilde til madvaretabellen (opgave 119, `BLOCKED`).** `sst.dk` svarer HTTP 429
  for både browser og curl, og de fire andre danske kilder døde i C92. Enten en
  PDF af *De officielle kostanbefalinger* lagt i repoet, eller en API-nøgle til en
  dansk næringsindholdstabel, så kan `/kalorier` få pr. 100 g **og** pr. portion.
  Uden det bliver madvare-klyngen (9 af 10 danske autocomplete-træffere under
  "kalorier") liggende, selv om `/kalorier` har 289 besøgende/28d og +50 %.
- ❓ **Hvilke søgemaskiner kommer `/bmi` og `/su`s trafik fra?** (opgave 183.)
  Eneste måde til at diagnosticere de to sides fald. `/bmi` har 938 besøgende/28d
  men under 4.920 Google-visninger, så mindst halvdelen er ikke Googles — et
  skærmbillede af Plausible's kilder filtreret på de to sider (eller et
  råudtræk) låser diagnosen. Uden det bliver faldet uforklarligt, og C196's
  titelændring kan heller ikke måles.
- ❓ **`AFHAENGIGHEDER.md`'s række for `beregner-dk` er delvis forældet.** Den
  siger "kritiske sårbarheder" og "mangler engines-erklæring". Sikkerhedsdelen er
  nu lukket (C197, `npm audit` 1 høj → 0), og runtime-kravet *er* erklæret:
  `engines.node ">=22 <23"`, `.nvmrc` = 22, `Dockerfile` på `node:22-alpine`.
  Jeg har kun verificeret denne ene række og ikke rørt filen, fordi den er fælles
  for otte projekter — en opdatering skal laves med vilje, ikke ved en
  sideeffekt.
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
