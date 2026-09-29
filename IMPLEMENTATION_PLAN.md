# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — **C190–C196 og CEO-punkt 0 er lukket på indhold** (målt 2026-09-29
22:05 mod produktion, ikke på HTTP-status). Se `docs/plan-arkiv.md`.

STATUS: KØ — **den danske titelrække er tømt.** Alle 15 sider i GSC's
visningstop-15 har nu en eksempel- eller spørgsmålstitel, canonical + hreflang er
korrekte på begge domæner, og `/dato` svarer selv på GSC's to største
søgninger (1.131 + 1.013 visninger, pos. 5) og linker videre til
`/dage-til/1-december` og `/dage-til/juleaften`. `/dage-til`-ruten findes, og
IndexNow (I1) er i koden. **Verdens største uberørte flade er nu beraknare.se:**
537 besøgende/28d (+144 %) mod 160.000+ visninger på 0,1–0,2 % CTR — se opgave
185.

STATUS: KØ — **`/su` (220 → 116 besøgende/28d, −47 %) er stadig uden diagnose**
og er bevidst ikke rørt: dens titel skal regne et beløb, og kun ét af de to tal
(ude-boende 7.426 kr. før skat) er citerbart fra `satser-2026.ts` uden at gætte
efter-skattedelen. Se opgave 183.

STATUS: KØ — **dagens iteration (C197) lukkede repoets eneste
sikkerhedsfund**: `undici` 7.29.0 → 7.30.0 bag `jsdom`. Dev-only, så
`npm audit --production` var allerede 0; `npm audit` gik 1 høj → 0.

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

To noter. HTTP 200 beviser intet: ingen rører en URL, kun `<title>`- og
`og:title`-strenge.

- ⏳ **VERIFICÉR DEPLOY: seks titler med et udregnet eksempel (`/bmi`, `/fart`,
  `/kalorier`).** Kode + plan i ét squash-commit på `ceo/eksempel-titler-fall`.
  Første kandidatvindue **2026-09-30 07:30**. Rørte filer: `src/lib/page-data.ts`
  (**12 strenge**, kun `metaTitle` og `ogTitle` — `git diff` verificerer at
  intet andet er rørt), `src/lib/title-eksempel.test.ts` (+3 sider, +3
  talverificeringer) og `src/lib/page-data.test.ts` (to låste titler
  opdateret). Ingen `<h1>`, ingen beregningslogik, ingen ny URL, ingen
  sitemap. Verificér ved **indhold**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `<title>` på dansk: `/bmi` "BMI-beregner for voksne: 75 kg / 1,75² = 24,5" ·
     `/fart` "Fartberegner: 100 km/t i 2 timer = 200 km" · `/kalorier`
     "Kalorieberegner: mand 80 kg, 180 cm = 2.759 kcal/dag".
  3. Samme på beraknare.se: "BMI-kalkylator för vuxna: 75 kg / 1,75² = 24,5" ·
     "Hastighetsberäknare: 100 km/h i 2 timmar = 200 km" · "Kalorikalkylator:
     man 80 kg, 180 cm = 2 759 kcal/dag".
  4. **Kontrol:** de tre `meta description` skal være byte-for-byte uændrede,
     og de tre `<h1>` skal stadig være "BMI Beregner for voksne",
     "Fartberegner - beregn fart, distance og tid" og "Kalorieberegner".
  **Målt på rigtig server før merge** (`next start` :3987, porten verificeret
  fri *inden* start): alle seks titler er korrekte i begge sprog, de tre
  beskrivelser og de tre `<h1>` er uændrede. **Gate grøn:** lint (**616
  filer**), **3001 tests / 189 filer**, build (**142 sider**), `locale-leak.mjs
  --gate` exit 0. De ni nye titeltests **fejler mod master's `page-data.ts`**
  (verificeret med `git stash`), så de låser den gamle fejl fast.


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
#### 182. [x] 2026-09-29 — C196 — **`/bmi`, `/fart` og `/kalorier` regner et eksempel i titlen i da og se**

- **Datagrund:** efter C195 er disse de tre sidste sider i GSC's top-15 med en
  ren kategorititel. `/bmi` (938 besøgende/28d, −26 %), `/fart` (4.645
  visninger, 0,6 %, pos. 7,1) og `/kalorier` (12.631 visninger, 1,0 %, pos. 8,1).
  `/fart` er den **eneste** af de 15, der stadig skrev "Fartberegner - Beregn
  hastighed, distance og tid". De andre er spørgsmålstitler, som GSC's egen
  tabel placerer på 0,5 % — bedre end kategori, dårligere end eksempel.
- **Tal verificeret mod repoets egne funktioner, ikke i hovedet:**
  `75 / 1.75**2 = 24,4898` (BMI 24,5 — samme eksempel som siden allerede havde
  i sin `metaDescription`), `100 km/t × 2 timer = 200 km`, og
  `beregnBmr("mand", 80, 180, 30) = 1780` →
  `beregnTdee(1780, "moderat") = 2759` (Mifflin-St Jeor).
- **Hvorfor kun disse tre:** `/tidszone` (24.117 visninger, 0,4 %) er det største
  eksempel-lignende emne, der **ikke** kan få et eksempel. Ethvert
  Danmark-forankret klokketidspunkt er forkert halvdelen af året, fordi
  Danmark har sommertid og det meste af verden ikke har. Ikke en
  skrivefejl — en structural begrænsning, og derfor skrevet i planen så næste
  iteration ikke prøver igen. `/alder` (6.985 visninger, 0,5 %) har samme
  problem: alderen afhænger af dagens dato.
- **Fund undervejs:** svensk `/fart` hedder i `title` "Hastighetskalkylator",
  og testen *"metaTitle indeholder sidens eget hovedord"* (C194) faldt, da
  skrev "Fartberäknare". Løst ved "Hastighetsberäknare", ikke ved at slå
  testen fra. `/kalorier`'s answer-first-test låste de to gamle titler
  med `toBe` — opdateret, ikke slettet, så `description`, `og:` og
  schema-description stadig er dækket.
- **Test:** `title-eksempel.test.ts` dækker nu syv sider og verificerer de tre
  nye regnestykker. **De ni nye tests fejler mod master's `page-data.ts`**
  (verificeret med `git stash push`), så de kan ikke passes ved en fejl.
- **MÅL:** `/bmi` baseline **938 besøgende/28d** · `/fart` **28 klik/28d**
  (4.645 visninger) · `/kalorier` **132 klik/28d** (12.631 visninger). Mål igen
  14 dage efter `DEPLOY OK`. `/bmi` er kun ca. 4.920 GSC-visninger trods 938
  besøgende, så **mindst halvdelen af `/bmi`s trafik er ikke fra Google** —
  titelændringen kan derfor ikke alene forklare faldet, og det er grunden til at
  opgave 183 findes.

#### 183. [ ] 2026-09-29 — Kø — **diagnosér `/bmi`s og `/su`s fald, og find ud af hvor stor en del der er overhovedet Googles**

- **Datagrund:** Plausible 28 dage: `/bmi` 1.271 → 938 (−26 %), `/su` 220 →
  116 (−47 %). Samtidig voksede sitet **+42 %**, så faldet er relativt værre end
  26 %. Til sammenligning: `/dato` 1.110 (+77 %), `/boligstoette` 535 (+86 %),
  `/kvadratmeter` 388 (+94 %), `/rentefradrag` 331 (+145 %).
- **Den måling, der låser diagnosen:** GSC's top-15 over *visninger* ender på
  `/brok` med 4.920. **Hverken `/bmi` eller `/su` står på listen**, så begge
  har **under 4.920 Google-visninger** pr. 28 dage — mens `/bmi` har 938
  Plausible-besøgende. Det kan ikke være en ren CTR-fejl: en visning der ikke
  klikkes, ville give en *høj* CTR på den lille visningsmængde. Enten kommer
  `/bmi`s trafik i overvejende grad fra Bing/DuckDuckGo/Yahoo/direkte
  (Plausible: Bing 1.308, DDG 371, Yahoo 281, Direct 1.041 mod Google 4.089),
  eller GSC's eksport er ældre end Plausible's 28 dage.
- **Hvorfor det ikke er løst i C196:** en diagnose uden tal er gætteri, og en
  titelændring er ikke en diagnose. Det kræver ét svar fra Mads eller en
  Plausible-udtræk: **hvilke kilder kommer `/bmi` og `/su` fra, delt på
 søgemaskiner?** Uden det kan ingen af os vide om faldet er ranking, sæson
  (bmi-søgninger topper i januar) eller noget tredje.
- **Acceptkriterier:** (1) kildefordelingen for `/bmi` og `/su` står i planen,
  (2) faldet er klassificeret som ranking / sæson / CTR med et tal til hver
  mulighed, (3) hvis det er ranking, navngives konkurrenten der har taget
  pladsen. **Ingen ny kode før diagnosen står** — en tredje titelændring på
  samme side uden en diagnose er prøvet to gange.
- **MÅL:** `/bmi` 938 besøgende/28d, `/su` 116 (Plausible 2026-09-29).


#### 184. [x] 2026-09-29 — C197 — **undici 7.29.0 → 7.30.0: repoets eneste sikkerhedsfund lukket**

- **Datagrund:** `~/.local/oxloop/AFHAENGIGHEDER.md` placerer `beregner-dk` som
  **prioritet 1** med "kritiske sårbarheder". `npm audit` gav 1 høj
  (10 advisories, alle `undici 7.0.0 - 7.29.0`), transitivt via `jsdom@28.1.0`
  → `undici@^7.21.0`. `7.30.0` er patch og opfylder jsdom's range, så rettelsen
  er **én lockfile-linje** — ingen `package.json`-ændring, ingen major.
- **⚠️ AFHAENGIGHEDER.md er STAL for dette repo.** Dens "mangler
  engines-erklæring: NEJ" er forkert: `package.json` har
  `engines.node = ">=22 <23"`, `.nvmrc` er `22`, og `Dockerfile` bruger
  `node:22-alpine`. Runtime-kravet er altså erklæret — jordemoderstudy-fejlen fra
  23/8 kan ikke ramme her. Resten af filens rækker er ikke verificeret i denne
  iteration, så **kun denne rettelse er dokumenteret**; se `❓ Til Mads`.
- **Reelt omfang:** dev-only (`undici` er `"dev": true` i lockfilen), så
  `npm audit --production` var 0 før og efter. Fundet var altså ikke en
  produktionsrisiko — det var det eneste kendte advisory, og det er nu væk.
- **Ingen VERIFICÉR DEPLOY-note:** ændringerne har ingen runtime-effekt
  (`undici` indgår ikke i `next build`), så intet på det live site kan ændre sig.
- **Gate grøn:** lint (**616 filer**), **3001 tests / 189 filer**, build
  (**142 sider**), `locale-leak.mjs --gate` exit 0.

#### 185. [ ] 2026-09-29 — Kø — **undersøg de danske URL-slugs på beraknare.se før nogen migrerer dem**

- **Datagrund:** beraknare.se har **537 besøgende/28d (+144 %)** og **~160.000
  GSC-visninger på 0,1–0,2 % CTR**: `/dato` 99.136 v / 95 k / pos. 8,2,
  `/tidsberegner` 60.399 v / 127 k / pos. 8,1, `/procent` 26.433 v / **2 k** /
  pos. 9,9. `/procent` har sitets **dårligste CTR på nogen side**. Svenske
  søgninger rammer allerede siden: "dagar mellan datum" 850 v pos. 8, "antal
  dagar mellan datum" 425 v pos. 9 — på URL'en `beraknare.se/dato`.
- **Spørgsmålet, der skal besvares først:** er de danske slugs *årsagen*, eller
  er de en følge? C195/C196 har allerede sat svenske eksempeltitler på samme
  sider, og de afventer deploy. **Hvis CTR'en ikke rører sig efter titlerne, er
  sluggen den næste hypotese; hvis den gør, er den ikke.** At migrate 100+
  URL'er uden denne kontrol kan tage den trafik, der holder siderne synlige.
- **Scope denne iteration:** research, ikke migration. (1) Hvad ranker på de
  samme svenske søgninger, og med hvilke slugs? (2) Ét rentesprog: en
  representative side, svensk slug + 301, målt på staging mod den nuværende
  — **kun hvis** (1) viser at slugs betyder noget. (3) Skriv ned hvilke
  berørede filer en fuld migrering ville kræve (`calculator-list.ts`,
  `sitemap.ts`, `page-helpers.ts`, `routing.ts`, IndexNow-konfiguration,
  `internal-links.test.ts`) så prisen er synlig *inden* beslutningen.
- **Acceptkriterier:** et svar på "er slugs årsagen — ja/nej/uklart" med tal fra
  konkurrenterne, en prisliste for en fuld migrering, og **ingen skriveændring i
  `src/`** uden at migrationsopgaven er skrevet op og godkendt. Gaten grøn.
- **MÅL:** beraknare.se 537 besøgende/28d; `/dato` 95 klik, `/tidsberegner` 127
  klik, `/procent` 2 klik (GSC 2026-08-30 → 2026-09-27). Genmål 2026-10-13.


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
- ❓ **21:30-batchen 2026-09-29 kørte og lagde alt efter `c6c0079` live** — alle
  seks åbne noter er lukket på indhold (se `docs/plan-arkiv.md`). Ingen
  `DEPLOY-MISSING`. Kun C194/C195/C196 venter på 2026-09-30 07:30.
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
