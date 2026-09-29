# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — **C190, C191, C192, C193, C194 og CEO-punkt 0 er alle lukket på
indhold** (målt 2026-09-29 22:05 mod produktion, ikke på HTTP-status). Se
`docs/plan-arkiv.md`. Kort: valborg siger 30. april, sankthans 23./24. juni,
svensk påskafton 27. marts, `/husleje` har Lejeloven § 5, alle 16 sider i
C193 har description ≤ 160, C194s syv har 115–158, SE-promille har 8 `Question`,
SE-renteberegner har Excel-tabellen med `=200000*4/100`, og `/dato` + `/nedtaelling`
viser dagens dagstal.

STATUS: **Denne iteration: otte side-titler er skrevet om til at regne et
eksempel** (procent, dato, tidsberegner, moms — i da og se), branch
`ceo/eksempel-titler`. Datagrund: GSC's egne tal deler sitet i eksempel-titler
(median 0,9 %, 67.643 visninger) og kategorititler (median 0,3 %, 385.817
visninger). `/procent` har 150.148 visninger og 98 klik. **MÅL (baseline
2026-09-29):** `/procent` 98 klik/28d, `/dato` 822, `/tidsberegner` 195,
`/moms` 41 — mål igen 14 dage efter deploy.

STATUS: KØ — `/bmi` (938 besøgende/28d, −26 %) og `/su` (220 → 116) falder
stadig; ingen ny måling siden 23/9. Ingen diagnose endnu.

## Kvalitetsgate (repoets egne scripts fra package.json)

```
npm run lint     # biome lint ./src      — 616 filer
npm run test     # vitest run            — 2992 tests / 189 filer
npm run build    # next build            — 142 sider
node scripts/locale-leak.mjs --gate       # exit 0
```

`tsc --noEmit` har 7 kendte forhåndsfejl i testfiler og er **ikke** del af gaten.
Alle fire var grønne før merge 2026-09-29 22:45.

## Åbne VERIFICÉR DEPLOY-noter

Én note. HTTP 200 beviser intet: intet her rører en URL, kun otte `<title>`- og
`og:title`-strenge.

- ⏳ **VERIFICÉR DEPLOY: otte titler med et udregnet eksempel.** Kode + plan i ét
  squash-commit på `ceo/eksempel-titler`. Første kandidatvindue **2026-09-30
  07:30**. Rørte filer: `src/lib/page-data.ts` (**16 strenge**, kun `metaTitle`
  og `ogTitle` — `git diff` verificerer at intet andet er rørt),
  `src/lib/page-data.test.ts`, `src/lib/page-helpers.test.ts` (følger de nye
  titler) og `src/lib/title-eksempel.test.ts` (**ny**, 12 tests). **Ingen
  `<h1>`, ingen beregningslogik, ingen ny URL, ingen sitemap, ingen dansk
  `<title>` uden for de fire.** Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `<title>` på dansk skal være: `/procent` "Procentberegner: 10 % af 250 kr. =
     25 kr." · `/dato` "Beregn dage mellem datoer og dage til en dato = 365
     dage" · `/tidsberegner` "Tidsberegner: 08:30 til 16:45 = 8 t 15 min." ·
     `/moms` "Momsberegner: 1.000 kr. ekskl. moms = 1.250 kr."
  3. Samme på beraknare.se: "Procenträknare: 10 % av 250 kr = 25 kr" ·
     "Beräkna dagar mellan datum och dagar kvar till datum = 365" ·
     "Tidskalkylator: 08:30 till 16:45 = 8 t 15 min" · "Momskalkylator:
     1 000 kr. exkl. moms = 1 250 kr."
  4. **Kontrol:** `/procent` 115, `/dato` 118, `/tidsberegner` 141, `/moms` 128
     skal være uændrede i `meta description`, og **0** sider i begge
     sitemapmer må have en description over 160.

## Åbne opgaver

#### 97. [BLOCKED: afventer Mads' svar på ejerskabsspørgsmålet — spørgsmålet står i ❓ Til Mads, ingen kode uden svar] 2026-09-27 — C69 — afklar hvad `beregner.no` egentlig er: et domæne der skal lanceres, et reserveret navn — eller en helt anden udgivelse

- **Datagrund:** målt under C66. `https://beregner.no/` svarer **200**, men
  `/moms`, `/procent`, `/dato`, `/tidszone` og `/elberegner` svarer alle **404**.
  Kodeporten siger imidlertid ja: `isCalculatorAvailable("/moms", "no")` er
  `true`, fordi `/moms` hverken har `daOnly` eller `seOnly` i
  `calculator-list.ts:79`.
- **⚠️ PRÆMIS KORRIGERET under C68 — `beregner.no` er ikke dette repo.** Begge
  beviser i den gamle formulering er modsagt af målingen, så opgaven er skrevet
  om fra "hvilken beslutning mangler i porten" til "hvilket domæne er det
  egentlig". 1. **Forsiden er ikke vores.** `https://beregner.no/` er en 12,7 KB
  norsk side med `<title>beregner.no – 100+ gratis norske kalkulatorer</title>`,
  `<h2>Kategorier</h2>` og `<h2>Mest brukte</h2>`, og **uden ét eneste
  `/_next/static`-chunk** — vores forside vejer 192 KB og renderer
  `HomeContent`. `git log -S "Mest brukte"` giver **ingen træffere**: siden har
  aldrig eksisteret i dette repo. 2. **404'en er ikke vores heller.**
  `https://beregner.no/moms` svarer med `<h1 class="text-7xl font-bold
  text-foreground">404`, og `text-foreground` står i **nul** filer i repoet
  (biome linter 551) — den danske "Siden finnes ikke"-side, C66 antog, har ingen
  `text-foreground`. Konklusion: **beregner.no peger på en anden udgivelse end
  den, C65-C68 har arbejdet på.**
- **Følgen for resten af planen:** (a) Denne opgave er ikke længere en
  kodebeslutning, den er et **spørgsmål om ejerskab** — se `❓ Til Mads`.
  (b) Opgave 98 (`TidszoneBeregner` mangler et `no`-sprog) er, hvis det er den
  *anden* udgivelse der mangler norsk, ikke en opgave overhovedet. (c) Scannerens
  overskrift "70 komponenter monteres på beraknare.se/beregner.no" er i praksis
  "på beraknare.se". (d) Alle `no`-fund fra C65/C66 (`navnNo`, `Hårtørrer`,
  `labels` uden `no`) er **uopnåelige** lige nu: ingen kan se dem, og de er
  derfor heller ikke målbare. De er bevaret, fordi de er korrekte og bliver
  nødvendige den dag `no` lanceres fra *dette* repo.
- **Hvorfor det ikke er en refaktor men en beslutning:** det er **forventeligt** ud fra
  `domain-config.ts:91`, `hiddenDomains = new Set(["localhost", "beregner.no"])` —
  kommentaren siger eksplicit "domains not yet launched". Det er altså en
  beslutning, der mangler, ikke en fejl. Men beslutningen er uafskrevet i koden,
  og **den gør C65's og C66's arbejde uverificerbart for `no`**: de oversatte
  `no`-strenge kan ikke ses af nogen, og ingen test kan se dem live.
- **Scope (kræver Mads' svar, ikke en iteration):** er `beregner.no` et domæne
  der skal lanceres snart, eller et reserveret navn? Der er tre mulige svar, og
  de er **ikke** ens:
  1. **Lanceres snart** → så er `no`-klassen (opgave 98) rigtig prioritet, og
     alle `no`-fund fra C65/C66 skal måles live i stedet for i tests.
  2. **Lanceres ikke** → `no` skal lukkes eksplicit i `calculator-list.ts` (alle
     ikke-`daOnly`/`seOnly`-defs skal få `no`-porte, eller `isCalculatorAvailable`
     skal kræve et eksplicit `no`-flag), så koden siger hvad der sker, og 404'en
     er en *beslutning* i stedet for en *bivirkning*.
  3. **Uafklaret** → skriv det i planen som et `❓ Til Mads`-spørgsmål og lad
     porten være som den er, men noter at `no` er ubevidst ubeskyttet.
- **Acceptkriterier:** 1. `❓ Til Mads` har spørgsmålet. 2. Uanset svar står der
  en linje i `IMPLEMENTATION_PLAN.md` om hvad `no` er: lanceret, lukket eller
  uafklaret. 3. Gaten grøn. **Ingen kodeændring uden Mads' svar** — lukning af
  et domæne er en domænebeslutning, ikke en refaktor.

#### 98. [ ] 2026-09-27 — C70 — `TidszoneBeregner` har intet `no`-sprog (afhænger af opgave 97)

- **Datagrund:** målt under C66. `labels` i `TidszoneBeregner.tsx` har kun `da`
  og `se`, og `const l = labels[locale] || labels.da` giver derfor **dansk** på
  beregner.no — hele værktøjet, inklusive dropdown, huskeliste, klokkeslæt og
  sommertidsnote. Usynligt i dag, fordi beregner.no 404'er på alt ud over `/`
  (opgave 97), men det er 24 timers advarsel om et dansk domæne.
- **Afhængighed:** opgave 97. Hvis svaret er "lanceres ikke", er denne opgave
  **gratuleringens fallenhed** — så er det nok at slå `no` fra i porten. Hvis
  svaret er "lanceres snart", skal `TidszoneBeregner` have et rigtigt `no`-sprog:
  `Tidssone`, `Fra tidssone`, `Timeforskjell`, `timer`, `(dagen før)`,
  `(neste dag)`, `Tidsforskjell fra Norge`, `hjemmetidssonen er Norge` — samme
  mønster som C65 gjorde for `STANDARD_APPARATER` (`navnNo` pr. post), altså
  **ikke** en `labels.no`-nøgle, fordi `by`/`navn` nu ligger i rækkerne.
- **Acceptkriterier:** hvis domænet er lukket: `isCalculatorAvailable("/tidszone", "no")`
  er `false` med en test på det. Hvis domænet er live: `TidszoneBeregner.test.tsx`
  kører i **da, se og no**, og `no`-renderet indeholder ingen danske
  `navn`/`by`-former. Gaten grøn i begge tilfælde.
- **MÅL:** ingen brugerdata endnu — beregner.no har ingen trafikmåling. Mål først
  14 dage efter en eventuel lancering.

#### 119. [BLOCKED: anden kildejerngang — Sundhedsstyrelsen svarer HTTP 429 på alle sider, så de officielle portionsværdier kan ikke citeres, og de må ikke gættes] 2026-09-29 — Kø — madvare-klyngen på "kalorier" (kræver en kilde, før den bygges)

- **Datagrund:** DA-autocomplete under "kalorier" → **9 af 10** er madvarer
  (æg, banan, vandmelon, jordbær, avocado, kirsebær, kartofler, vindruer,
  havregryn); under "kalorie indhold" → **10 af 10**; under "kalorier i æg" →
  æggehvide, æggeblomme, æggekage, æggekage med bacon, æg uden blomme,
  æggesalat, æggemad. Det er den næststørste danske klynge på ordet, og
  `/kalorier` har **0** tabeller over madvarer.
- **Hvorfor den ligger og ikke er bygget nu:** den kræver en *kildefølt*
  værdi pr. vare, og den eneste citable danske tabel kunne ikke hentes.
  Gættede kalorietal ville være præcis den fejlklasse planen fører.
- **⚠️ Kildejerngang nr. 2 (C92, 2026-09-27 15:05) — spild ikke en tredje
  iteration på de samme kilder.** Prøvet i denne rækkefølge, alle med curl
  *og* webfetch:
  | Kilde | Resultat |
  |---|---|
  | `frasco.dk` | HTTP 000, ingen forbindelse (domænet er dødt) |
  | `francofooddata.dk` + `www.` | HTTP 000 |
  | `kostviddatabase.kk.dk` (København Kommune) | HTTP 000 |
  | `kostviddatabase.dk`, `fdev.dk` | HTTP 000 |
  | Open Food Facts API (`/api/v2/search`, danske produkter) | **HTTP 503** — serveren svarer "temporarily unavailable … not available to anonymous users" |
  | da.wikipedia.org API, `Infoboks næringsindhold` | **Virker**, men kun 2 af 24 fødevarer har den: `Havregryn` (368 kcal) og `Banan`. `Kartoffel`, `Gulerod`, `Æg`, `Vindrue`, `Jordbær`, `Kirsebær`, `Avocado`, `Vandmelon`, `Kylling`, `Laks`, `Ost`, `Mælk`, `Hvedebrød`, `Smør`, `Broccoli` har **ikke** infoboksen. Kilden er desuden *Wikipedia*, ikke DTU. |
  **Konklusion:** der er ingen citable dansk tabel tilgængelig fra en agent i
  denne iteration. Wikipedia-vejen er lukket som hovedkilde (2/24) — brug den
  kun til at *krydschecke* to-tre tal, aldrig som grundlag for en tabel.
  **Ny præmis for den næste agent:** byg den **ikke** som en færdig
  madvare-tabel. (a) Få Mads til at give adgang til en kilde
  (`❓ Til Mads`), eller (b) byg i stedet det, der *kan* dokumenteres i dag:
  de danske ** portionsværdier for de fire-fem hovedgrupper** i
  Sundhedsstyrelsens kostanbefalinger (Find flere oplysninger i
  `Mål hver dag` → tallerkken og 400/600 kcal) — citable, danske, og de
  svarrer på "hvor mange kalorier skal jeg have om dagen", som er GSC's
  søgning på `/kalorier` (1 v, pos. 1).
- **⚠️ Kildejerngang nr. 3 (2026-09-29 21:35) — både (a) og (b) er lukket i denne
  iteration.** Både `webfetch` og `curl` på `sst.dk` giver **HTTP 429** (rate
  limited) på `/forbruger/kost-og-motion/tallerkenmodellen` og
  `/viden-og-raadgivning/kost-og-motion/kostanbefalinger`; `…/maaltider` er 404.
  Uden kilden kan hverken tallerkenmodellens andele eller 400/600 kcal skrives
  ned som fakta, så opgaven er `BLOCKED` indtil Mads enten giver adgang eller
  en kildefil. **C92's tabel er ikke en invitationsliste til at prøve de samme
  kilder igen.**

#### 179. [ ] ÅBEN — **C55, C56 og C60 er deploy-noter, der kræver interaktivitet, og har stået åbne siden 2026-09-27 07:30**

- **Datagrund:** planen. Alle tre noter er skrevet på at man *sætter felter* og
  læser klient-renderede tal og Kopier/Del-strenge:
  - **C60 `/promille`** (vindue 2026-09-27 07:30, merge `aded200`): markér
    "Antal genstande" og slet feltet — kortet må ikke blive grønt med "Du er
    under …"; "præcis på grænsen" skal have erstattet "over grænsen".
  - **C56 `/tidszone`** (merge `67d4cb1`): "Til tidszone = Indien (IST)" skal
    give **"+3,5 timer"** og **"Mumbai er 3,5 timer foran København"**, huskelisten
    **"+3,5t (+4,5t om vinteren)"**.
  - **C55 `/dato`** (merge `122535d`): "Dage mellem", 25.→26. oktober 2026 skal
    give **1** dag (før 2, som følge af et sommertidsskifte).
- **Hvorfor de ikke er lukket i denne iteration:** de er de eneste noter i
  planen, hvis fund ligger i klient-renderede kort. `curl` kan ikke sætte et
  felt, og det er *ikke* løst ved at tælle strenge i HTML'en — det ville være
  samme fejl som C158's port-analyse gjorde, bare i modsat retning. At lukke
  dem på en teksttælling ville være vakuum-grønt.
- **Acceptkriterier:** de tre fund verificeret i en rigtig browser med
  noterne ved hånden, og **hver note markeret med HVILKET felt der blev sat og
  HVAD der stod** — ikke "ser ud til at virke". Findes et afvigende fund, er
  det en ny opgave, ikke en note der lukkes.
- **Note:** de er **gamle** (to dage, ~14 deploy-vinduer). Hvis koden siden er
  rørt igen på de tre sider, skal noterne skrives om mod den nuværende kode
  før de verificeres — ellers verificerer man en gammel kravspecifikation.
#### 181. [x] 2026-09-29 — C195 — **otte side-titler regner nu et eksempel i stedet for at navngive en kategori**

- **Datagrund:** GSC's egne tal (28 dage) deler sitet i to grupper efter
  titelform. Eksempel-titler (`/kvadratmeter` "5 x 4 m = 20 m²", `/braendstof`
  "500 km benzin koster 450 kr.", `/renteberegner`, `/promille`, `/brok`) har
  **median 0,9 % CTR på 67.643 visninger**. Kategorititler (`/procent`,
  `/dato`, `/tidsberegner`, `/moms`, `/boligstoette`) har **median 0,3 % på
  385.817 visninger** — fire gange så mange visninger, halvt så mange klik.
  `/procent` er det tydeligste: **150.148 visninger, 98 klik, 0,1 %, pos. 7,4.**
  Ved medianen for eksempel-titler ville de fire alene give ~3.400 klik.
- **Hvorfor det ikke var en skønsmalssag:** planen havde tidligere konkluderet
  at `/procent` "kan ikke diagnosticeres i en agent-iteration", fordi de tre
  viste GSC-søgninger kun er 0,24 % af visningerne. Det er rigtigt for den
  *konkrete søgning*, men det overså et mønster i **sidernes egne data**: det
  kræver ingen query-eksport at se, at de sider der allerede regner et eksempel
  konverterer tre gange bedre. Det er den her retning bygger på.
- **Rettet:** `procent`, `dato`, `tidsberegner` og `moms` i **da og se** — otte
  `metaTitle` + otte `ogTitle`. Hvert tal er verificeret mod repoets egne
  beregningsfunktioner, ikke regnet i hovedet: `beregnTidsinterval("08:30",
  "16:45")` → 8 t 15 min, `beregnMoms(1000, "tillaegMoms", 25)` → 1.250 kr,
  10 % af 250 → 25, 1 år → 365 dage.
- **Fund undervejs:** 1. **En copy-paste slettede et svensk keyword**
  (`"procentuell ökning"`) — fanget i min egen diff-review og rettet, så
  diffen er rent `metaTitle`/`ogTitle`. 2. **C164's binding blev brudt og
  rettet:** `page-data.test.ts` kræver at `/dato`'s titel stadig nævner
  *begge* hensigter, fordi countdown-søgerne er de næststørste på siden. Den
  første nye titel ("Dage mellem datoer: 1. jan. 2026 → 1. jan. 2027 = 365
  dage") droppede "dage til en dato" og faldt i den eksisterende test. Den
  endelige titel bevarer begge hensigter *og* regner et eksempel. 3. Den
  svenske titel måtte ikke over 60 tegn, så den blev "Beräkna dagar mellan
  datum och dagar kvar till datum = 365".
- **Ny test `src/lib/title-eksempel.test.ts` (12 tests):** kræver et tal og et
  `=` i hver af de otte titler, og verificerer de fire konkrete regnestykker
  mod beregningsfunktionerne. Den fejlede med de otte fund ovenfor og er grøn
  efter rettelsen. De eksisterende "answer-first"-tests i `page-data.test.ts`
  og `page-helpers.test.ts` blev opdateret til de nye titler i stedet for
  slettet — de dækker description, `og:` og schema-description, som er
  urørte.
- **MÅL:** `/procent` baseline **98 klik/28d** · `/dato` **822** ·
  `/tidsberegner` **195** · `/moms` **41** (GSC 2026-08-30 → 2026-09-27).
  Mål igen 14 dage efter `DEPLOY OK`. Forventning ved median 0,9 %: de fire
  giver ~3.400 klik mod 1.156 nu. **Dette er en forventning, ikke en
  garanti** — en titelændring kan også sænke CTR'en, og GSC's
  gennemsnitsposition kan flytte sig, så effekten skal måles i klik og ikke i
 CTR alene.

## ❓ Til Mads

- ❓ **Tre deploy-noter kan ikke lukkes uden en browser** (C55 `/dato`, C56 `/tidszone`,
  C60 `/promille`) — de kræver Kopier eller et knap-klik. Kliksekvenserne står ordret i
  notesektionen ovenfor. ~10 minutter for et menneske; ellers står de åbne for evigt.
- ❓ **Hvad er `beregner.no`?** (opgave 97, `BLOCKED`.) Forsiden er en 12,7 KB norsk side
  uden ét `/_next/static`-chunk, og 404'en bruger en Tailwind-klasse (`text-foreground`)
  der står i nul filer i repoet — domænet peger på en **anden udgivelse**. Skal `no`
  lanceres fra dette repo, eller er navnet reserveret? Svaret afgør, om opgave 98 er
  reel eller overflødig.
- ❓ **Kilde til madvaretabellen (opgave 119, `BLOCKED`).** `sst.dk` svarer HTTP 429
  for både browser og curl, og de fire andre danske kilder døde i C92. Enten en
  PDF af *De officielle kostanbefalinger* lagt i repoet, eller en API-nøgle til en
  dansk næringsindholdstabel, så kan `/kalorier` få pr. 100 g **og** pr. portion.
  Uden det bliver madvare-klyngen (9 af 10 danske autocomplete-træffere under
  "kalorier") liggende, selv om `/kalorier` har 289 besøgende/28d og +50 %.
- ❓ **21:30-batchen 2026-09-29 kørte og lagde alt efter `c6c0079` live** — alle
  seks åbne noter er lukket på indhold (se `docs/plan-arkiv.md`). Ingen
  `DEPLOY-MISSING`. Kun C194/C195 venter på 2026-09-30 07:30.
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
