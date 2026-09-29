# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — **CEO-køens punkt 0 (review-fund 29/9) er landet: otte forkerte eller opfundne
fakta er rettet, de ligger i Google lige nu.** Valborg stod som fast 14. februar (den er
30. april), svensk påskafton lå på langfredagens dato (den er lørdag, påskedag minus 1),
dansk sankthans brugte svensk midsummer-logik (den er fast 23./24. juni), den danske
påskeaften-FAQ sagde "ja, samme som langfredag" (den er slettet og erstattet med den
modsatte sandhed), `/husleje` sagde at huslejenævnet fastsætter en sats pr. område og at
pristalsreguleringen følger forbrugerprisindekset (lejeloven § 5 følger nettoprisindekset),
`toUtcMidnight` læste dagens dato i UTC så alle nedtællinger var én dag forkerte kl. 00-02,
den svenske promille-FAQ skrev "6 öl på 70 kg er over 2,0" i **danske ord** (tallet er nu
genereret fra sidens egen formel: 1,51), og `aarstal()` returnerede 13 måneder i skudår.
Køen havde ingen `I GANG`-opgave. **Planen er samtidig skåret fra 1,7 MB til under 40 KB**;
alt historisk er flyttet til `docs/plan-arkiv.md` (append-only) i samme commit.

STATUS: KØ — otte åbne deploy-noter: **C189, C190, C191, C192, C193** har første
kandidatvindue **2026-09-29 21:30** og må ikke røres før da. **C55, C56 og C60** kræver
en rigtig browser (Kopiér/knap-klik) og kan ikke lukkes af en agent.

STATUS: KØ — `/bmi` (938 besøgende/28d, −26 %) og `/su` (220 → 116) falder stadig; ingen
ny måling siden 23/9.

## Kvalitetsgate (repoets egne scripts fra package.json)

Kønt af denne iteration (2026-09-29) og uændret siden:

```
npm run lint     # biome lint ./src      — 614 filer
npm run test     # vitest run            — 2976 tests / 187 filer
npm run build    # next build            — 142 sider
node scripts/locale-leak.mjs --gate       # exit 0, 0 ureviewet
```

`tsc --noEmit` har 7 kendte forhåndsfejl i testfiler og er **ikke** del af gaten.

## Åbne VERIFICÉR DEPLOY-noter

Kun noter med et *uafviklet* vindue står her. Alt lukket er i `docs/plan-arkiv.md`.

- ⏳ **VERIFICÉR DEPLOY: C60 `/promille` — et tomt felt gav en grøn
  tilladelse til at køre bil, "præcis på grænsen" erstattede den falske
  "over grænsen", og den delte tekst har nu de fire input — kode + plan i ét
  commit på branch `ceo/promille-audit`, kode `137936a`, merge `aded200`
  2026-09-27 02:46 CEST. Første kandidatvindue **2026-09-27 07:30**.**
  Verificér **indhold og interaktivitet**; HTTP 200 beviser intet, hele fundet
  er i klient-renderede kort og i strengen på Kopier/Del:
  1. Åbn `/promille`, **markér feltet "Antal genstande" og slet det** (eller
     sæt kropsvægt til 0). Kortet må **ikke** blive grønt med "Du er under
     grænsen på 0,5 ‰" — det skal sige "Indtast antal genstande og kropsvægt —
     uden dem kan promillen ikke beregnes.", og der må ikke stå "0,00 ‰" eller
     nogen ‰-tegn. Før stod der et grønt "under grænsen"-kort, altså en
     tilladelse til at køre bil fra et felt brugeren ikke havde tastet færdig.
  2. Sæt **1 genstand, 44 kg, Kvinde, 0 timer**. Promillen skal være
     **0,50 ‰** og kortet skal sige **"Du er præcis på grænsen (0,5 ‰) — kør
     ikke bil"** i ravn. Før sagde det "Du er over grænsen på 0,5 ‰ — kør ikke
     bil", altså noget sidens egen brødtekst ("ulovligt at køre bil med en
     promille over 0,5 ‰") modsiger. Flisen "Under grænsen om 0,5 ‰" skal stå
     **—**, ikke "0 timer".
  3. Sæt **4 genstande, 80 kg, Mand, 0 timer** og klik **Kopiér**. Klipbordet
     skal give
     **`4 genstande, 80 kg, Mand, 0 timer siden: 0,88 ‰. Du er under grænsen på 0,5 ‰. Du er allerede under grænsen — helt ædru om 5,9 time.`**
     Før stod der kun "Din anslåede promille: 0,88 ‰" — ét tal uden de fire
     tal, det afhænger af.
  4. Åbn **Del beregning** i samme opsætning. Twitter-linkets tekst skal være
     præcis **`Promilleberegner: 4 genstande, 80 kg, Mand, 0 timer siden: 0,88
     ‰. …`** — altså Kopier-strengen bag præfikset, ikke en anden sætning.
  5. Sæt **6 genstande, 70 kg, Mand, 0 timer**: kortet skal stadig sige **"Du
     er over grænsen på 0,5 ‰ — kør ikke bil"**, og flisen skal vise den
     positive tid til grænsen. Den nye tilstand må ikke have sluget den gamle.
  6. `https://beraknare.se/promille` med 3 standardglas, 75 kg, 2 timmar skal
     give **`3 standardglas, 75 kg, Man, 2 timmar sedan: 0,41 ‰. Du är över
     gränsen på 0,2 ‰. …`** — svensk sætning, og 0,2-grænsen fordi den er
     svensk.

- ⏳ **VERIFICÉR DEPLOY: C56 `/tidszone` — brudtal med komma, og en delt tekst
  der siger hvilken dato den gælder — kode + plan i ét commit på branch
  `ceo/tidszone-kopi`, kode `8d77558`, merge `67d4cb1` 2026-09-27 01:29 CEST.
  Første kandidatvindue **2026-09-27 07:30**.** Verificér
  **indhold**; HTTP 200 beviser intet, hele fundet er i klient-renderede tal og
  i strengen på Kopier/Del:
  1. Åbn `/tidszone`, sæt **Til tidszone = Indien (IST)**. Tidsforskellen skal
     stå som **"+3,5 timer"** og sætningen som **"Mumbai er 3,5 timer foran
     København"**, huskelisten som **"+3,5t (+4,5t om vinteren)"**. Før stod der
     `3.5` med punktum på alle tre steder. Det er det tydeligste af fundene.
  2. Klik **Kopiér** med **Til tidszone = Japan (JST)**. Klipbordet skal give
     `12:00 i København = 19:00 i Tokyo. Tokyo er 7 timer foran København.
     Gælder 1. juli 2026 — forskellen følger sommertiden.` Før stod der kun
     `12:00 i København = 19:00 i Tokyo` — uden dato, altså en påstand der var
     forkert i vinterhalvåret.
  3. Samme på `beraknare.se/tidszone`: `Mumbai är 3,5 timmar före Stockholm` og
     svensk delt tekst med "Gäller … — skillnaden följer sommartiden.".

- ⏳ **VERIFICÉR DEPLOY: C55 `/dato` — "antal dage" tæller ikke længere et
  sommertidsskifte som en dag, og Kopier/Del giver datoerne med — kode + plan
  i ét commit på branch `ceo/dato-tekst`, kode `fb89220`, merge `122535d`
  2026-09-27 01:11 CEST. Første kandidatvindue **2026-09-27 07:30**.** Verificér **indhold og beregning**; HTTP 200
  beviser intet, hele fundet er i klient-renderede tal og tekst:
  1. Åbn `/dato`, vælg **Dage mellem**, sæt **Fra dato = 25. oktober 2026**
     og **Til dato = 26. oktober 2026**. **Antal dage** skal være **1**.
     Før rettelsen stod der 2, fordi de 25 timer mellem de to midnat blev
     rullet op til 2 dage. Det er det tydeligste af alle fundene.
  2. Sæt **Fra = 28. september 2026** og **Til = 29. december 2026**:
     **92** dage, ikke 93.
  3. Vælg **Arbejdsdage**, sæt **Udgangsdato = 5. januar 2026** og
     **Antal = 30**. Overskriften skal læse **"30 arbejdsdage fra 5. januar
     2026"** og må **ikke** sige "fra nu" nogen steder i HTML'en.
  4. I samme tilstand: klik **Kopiér** og sæt klipbordet ind i et felt.
     Det skal give **`30 arbejdsdage fra 5. januar 2026`**. Før stod der
     "30 arbejdsdage".
  5. Vælg **Tilføj dage** med Udgangsdato 27. september 2026 og **Antal =
     ‑30**: kopier skal give **`30 dage før 27. september 2026`**, aldrig
     "‑30 dage tilføjet".
  6. Vælg **Dage mellem** med 28. og 29. september 2026: kopier skal give
     **`1 dag mellem 28. september 2026 og 29. september 2026`** — entalform,
     "1 dage" er en fejl.
  7. Samme med **Antal = 1000**: kopier skal give **`1.000 dage fra 27.
     september 2026`** med punktum som tusindtalsseparator.
  8. På `https://beraknare.se/dato` skal samme test med 2. november og 1.
     december 2026 give **`29 dagar mellan 2 november 2026 och 1 december
     2026`**.
  9. `https://minberegner.dk/api/health` skal svare `status: ok`.

- ⏳ **VERIFICÉR DEPLOY: C193 — de 22 `metaDescription`s der brød repoets egen 160-tegns-regel skal alle være under 160 i den server-renderede HTML, på begge domæner. Den længste var `/befordringsfradrag` med 202 tegn (skal være 129).** Kode + plan i ét squash-commit på `ceo/moms-se-paritet` (grenen hedder efter den opgave, der *ikke* blev valgt — opgaven kom ud af en måling af hele sitet). Første kandidatvindue **2026-09-29 21:30** (17:30-batchen kørte før merge). Kun `src/lib/page-data.ts` (**22 `metaDescription`-strenge**, `git diff` verificerer at ingen anden linje er rørt) og `src/lib/page-data.test.ts` (**+34**) — **ingen `<title>`, ingen `<h1>`, ingen FAQ, ingen beregningslogik, ingen ny URL, ingen sitemap**. **HTTP 200 beviser intet:** intet her rører beregningerne, kun 22 indekserede tekststrenge. Verificér ved **indhold, ikke status**:
  1. `curl -s -H "Host: minberegner.dk" https://minberegner.dk/befordringsfradrag | grep -o '<meta name="description" content="[^"]*"'` skal være **129** tegn og indeholde `3,17 kr./km for 25-120 km` **og** `1,59 kr./km over 120 km` — de to satser lå i den afkortede hale før og skal stadig være der.
  2. Samme kommando på `/rentefradrag` skal være **148** tegn med `33,6 % på de første 50.000 kr.` og `16.800 kr i skat`; `/boligsalg` **156**; `/ejendomsvaerdiskat` **154** med `5,1 ‰ / 14 ‰`; `/boernepenge` **151** med alle fire sats-grupper.
  3. `/husleje` skal være **146** og `/barselsdagpenge` **147** — de to er template-literals, så tjek at `25.000 kr netto` hhv. `5.085 kr./uge` stadig står i markupken (tallene er data-afledte, ikke håndskrevet).
  4. På beraknare.se: `/elbil` **148**, `/motion-kalorier` **150**, `/1rm` **159**, `/loenstigning` **133**, `/sparemaal` **141**, `/enheder` **148**, `/fart` **137**, `/afkast` **156**, `/bolan` **136**.
  5. **Kontrol:** `/procent` 115, `/dato` 118, `/tidsberegner` 141, `/moms` 128, `/boligstoette` 111, `/alder` 142 skal være uændrede, og **0** sider i begge sitemapmer må have en `description` over 160.

- ⏳ **VERIFICÉR DEPLOY: C192 — beraknare.se `/promille` skal have **tre** tabeller (dansk 3 / svensk 1 → **3/3**), **1.294 ord** (var 625), **9 `<h2>`** (var 8), og FAQ-JSON-LD'en skal have **8** `Question` (var 5). De tre nye svenska `<h2>` er "Hur många promille är N öl?", "Promillegränsen utomlands" og den eksisterende "Promillegränsen i Sverige".** Kode + plan i ét squash-commit på `ceo/promille-se-paritet`. Første kandidatvindue **2026-09-29 21:30** (17:30-batchen kørte før merge). Kun `src/lib/promille-genstande.ts` (**ny**), `promille-genstande.test.ts` (**ny**), `promille/page.tsx` (**+144**, kun `se`-grenen), `page-data.ts` (**+23**, kun `se`-`faqItems`) og `page.test.tsx` — **`promille.ts` urørt, ingen beregningslogik ændret, ingen ny URL, ingen sitemap, intet `<title>` eller `<meta description>` ændret, ingen dansk side rørt**. **HTTP 200 beviser intet:** intet her rører `src/lib/promille.ts`'s beregning, kun fire nye blokke i den svenska gren. Verificér ved **indhold, ikke status**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `curl -s -H "Host: beraknare.se" https://beraknare.se/promille | sed 's/<!-- -->//g' | grep -o '<h2>Hur många promille är N öl?</h2>' | wc -l` skal være **1** (før: **0**), og `<h2>Promillegränsen utomlands</h2>` **1** (før: **0**).
  3. Den nye N-øl-tabel skal have **5 datarækker × 3 kolonner** med præcis `0,22/0,25/0,36`, `0,44/0,50/0,73`, `0,66/0,76/1,09`, `0,88/1,01/1,45`, `1,32/1,51/2,18` — alle med `‰` i samme celle. Tjek med `grep -oE '[0-9]+,[0-9]{2} ‰' | sort -u`.
  4. Landetabellen skal have **12 `<tr>`** med svenska namn: `Sverige`, `Norge`, `Polen`, `Danmark`, `Tyskland`, `Frankrike`, `Spanien`, `Italien`, `Grekland`, `Nederländerna`, `Österrike`, `Storbritannien`. **`Nederländerna` og `Österrike` må være med** — de danske `Holland`/`Østrig`/`Grækenland` skal have **0** forekomster.
  5. Konklusionen skal sige `2 öl på 80 kg är 0,44 ‰` og `över` den svenska gränsen på 0,2 ‰ — **og `under den svenska gränsen` skal have 0 forekomster** (det er den fejl, der ville fortalt en svensk læser at han må køre).
  6. FAQ-JSON-LD: `grep -o '"@type":"Question"' | wc -l` skal være **8** på beraknare.se (var 5) og **uændret 9** på minberegner.dk.
  7. **Kontrol:** `curl -s https://minberegner.dk/promille` skal have uændret **3** tabeller, **9** `Question` og de oprindelige celler `0,22 ‰`…`2,18 ‰`.

- ⏳ **VERIFICÉR DEPLOY: C190 — beraknare.se `/renteberegner` skal have ét nyt `<h2>Samma tal i Excel</h2>` med tabellen på **tre** rækker, formlerne skal være skrevet i **svensk Excel** (`BETALNING`, semikolon mellem argumenterne, `=200000*4/100` som tredje række — den stod i mit eget udkast som `=200000*4/12`, hvilket gav 66.666,67 i stedet for 8.000), svarene skal være **1 211,96 kr**, **90 870,56 kr** og **8 000 kr**, FAQ-JSON-LD'en skal have **7** `Question` (var 6), og der skal stå **0** `æ`/`ø` på siden.** Kode + plan i ét squash-commit på `ceo/renteberegner-se-excel`. Første kandidatvindue **2026-09-29 21:30** (17:30-batchen kørte mens iterationen var i gang). Kun `renteberegner/page.tsx` (+38 linjer i den **svenska** gren), `page-data.ts` (ét FAQ-par), to nye filer (`rente-excel.ts` + test) og `renteberegner/page.test.tsx` (tælletest 6 → 7) — **ingen beregningslogik, ingen ny URL, ingen sitemap, ingen `<title>`, ingen `<meta description>`, ingen dansk side rørt**. **HTTP 200 beviser intet:** intet her rører `src/lib/`'s beregninger, kun ét nyt afsnit og ét FAQ-par. Verificér ved **indhold, ikke status**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `curl -s -H "Host: beraknare.se" https://beraknare.se/renteberegner | sed 's/<!-- -->//g' | grep -o '<h2>Samma tal i Excel</h2>' | wc -l` skal være **1** (før: 0).
  3. Alle **tre** formler skal findes i markupken: `=BETALNING(4/12;240;-200000)`, `=BETALNING(4/12;240;-200000)*240-200000` og **`=200000*4/100`** — den tredje skal **ikke** være `=200000*4/12`.
  4. Svarene i de tre rækker skal være **1 211,96 kr**, **90 870,56 kr** og **8 000 kr**.
  5. `grep -o '"@type":"Question"' | wc -l` skal være **7** (var 6) på beraknare.se.
  6. `grep -oE '[æø]' | wc -l` skal være **0** på beraknare.se.
  7. **Kontrol:** `https://minberegner.dk/renteberegner` skal have **7** `YDELSE`, **6** `Question` og **0** "Samma tal i Excel" — den danske side skal være urørt. `/laaneberegner` (svensk søskendeside) skal være urørt.

- ⏳ **VERIFICÉR DEPLOY: C189 — alle 27 blogartikler skal sende præcis **én** `BlogPosting` med `datePublished`, og de fire med en "Opdateret"-byline skal også sende `dateModified`. `/blog` skal vise danske datoer i 27 `<time>`-elementer og **0** rå ISO-datoer i sin synlige tekst.** Kode + plan i ét squash-commit på `ceo/blogg-artikel-schema`, merge/push **2026-09-29 17:26 CEST**, kode `c6c0079`. Første kandidatvindue **2026-09-29 21:30** (17:30-batchen kørte mens iterationen var i gang — planen blev skrevet kl. 17:06, før vinduet). 27 `page.tsx` (ét element + én import pr. artikel), `/blog/page.tsx` (27 `date`/`readTime` fjernet), to nye filer (`blog-artikler.ts`, `BlogArticleSchema.tsx`) + test, `ArticleSchema` i `StructuredData.tsx`, 29 mock-filer — **ingen beregningslogik, ingen ny URL, ingen sitemap, ingen `<title>`, ingen `<meta description>`, ingen synlig brødtekst ændret**. **HTTP 200 beviser intet:** intet her rører `src/lib/`'s beregninger, kun metadata og én synlig dato-streng. Verificér ved **indhold, ikke status**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. Tæl `BlogPosting` på **alle 27** artikler — skal være præcis **1** hver (før: **0**):
     `for s in $(curl -s https://minberegner.dk/sitemap.xml | grep -o '/blog/[a-z0-9-]*' ); do echo -n "$s "; curl -s "https://minberegner.dk$s" | grep -o '"@type":"BlogPosting"' | wc -l; done`
  3. `/blog/sk at-2026-alt-du-skal-vide` *(uden mellemrum)* skal have `datePublished` **2026-02-17** *og* `dateModified` **2026-09-26**; `/blog/su-2026-satser-og-regler` **2026-09-24** / **2026-09-26**; `/blog/maanedsbudget-2026-komplet-guide` **2026-08-23** og **ingen** `dateModified` (datoen var 24. august på `/blog` og 23. august på indlægget — de to sagde aldrig det samme).
  4. `/blog` skal have **27** `<time` og **0** `20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]` i den **synlige** tekst (før: 54 ISO-strenge i markup'en).
  5. **Kontrol:** `https://beraknare.se/blog/skat-2026-alt-du-skal-vide` skal fortsat svare **404** (bloggen er dansk-only). `/dato` skal have 11 `<h2>`, `/tidszone` 11 "25 byer" — urørte.

- ⏳ **VERIFICÉR DEPLOY: C191 — `/dato` og `/nedtaelling` skal på begge domæner have dagens antal i dage-til-listen, ikke kun spørgsmålsteksten. `/dato` er GSC's nr. 2 (DA 132.313 v / 822 klik / CTR 0,6 % / pos. 5,7) og nr. 3 (SE 99.136 v / 95 klik / 0,1 % / pos. 8,2), og de to største danske søgninger er "hvor mange dage er der til 1 december" (1.131 v, pos. 5) og "…til den 24 december" (1.013, pos. 5).** Kode + plan i ét squash-commit på `ceo/dato-dage-til-tal`, merge/push **2026-09-29 18:07 CEST** (`38e9599`). Første kandidatvindue **2026-09-29 21:30** (push efter 17:30-batchen). Kun `dato/page.tsx` (**+38** i listen) og `nedtaelling/page.tsx` (**+35**) + to testfiler er rørt — **ingen beregningslogik, ingen ny URL, ingen sitemap, ingen `<title>`, ingen `<meta description>`, ingen FAQ, `dage-til.ts` og `DageTilPage.tsx` urørte**. **HTTP 200 beviser intet:** hele ændringen er nye tal i to lister, og siden svarede 200 hele tiden, også da den ikke svarede. Verificér ved **indhold, ikke status**:
  1. `curl -s https://minberegner.dk/api/health` skal svare `status: ok`.
  2. `curl -s https://minberegner.dk/dato | sed 's/<!-- -->//g' | grep -c "Tallet nedenfor er dagens antal dage"` skal være **1** (før: 0), og det samme på `/nedtaelling`.
  3. Rækken for 1. december skal vælge: `Hvor mange dage er der til 1. december?</a> 1. december: <strong>63 dage</strong> (9 uger).` — **altså dagens tal, ikke et hårdkodet 63.** Pr. 30. september 2026 forventes **62 dage**, og det skal nulstilles når datoen er nået.
  4. **Krydscheck mod undersiden:** `curl -s https://minberegner.dk/dage-til/1-december` skal sige `Der er 63 dage` — samme tal som listen på `/dato` og `/nedtaelling`. Samme for `juleaften` (86), `juledagen` (87) og `halloween` (32).
  5. Svensk: `curl -s -H "Host: beraknare.se" https://beraknare.se/dato | sed 's/<!-- -->//g'` skal have `Talet nedan är dagens antal dagar` og `1 december 63 dagar (9 veckor)`. **Kontrol:** samme side skal have **0** `æ`, **0** `ø` og **0** forekomster af `dage` (den danske enhed) — brug `grep -oE '[0-9]+ dage[^a-zåäö]' | wc -l` → **0**.
  6. `/dato` og `/nedtaelling` skal fortsat have hver sit `Question`-antal uændret (DA 15 / 13 på `/dato`), og `<h2>`-tallet uændret (DA 11 / 10) — rettelsen rører kun listen.

- ⏳ **VERIFICÉR DEPLOY: CEO-punkt 0 — otte forkerte/opfundne fakta rettet, plus planen skåret fra 1,7 MB til 29 KB.** Kode + plan i ét squash-commit på `ceo/dage-til-fakta`, merge/push **2026-09-29 20:50 CEST**. Første kandidatvindue **2026-09-30 07:30** (21:30-batchen kører kl. 21:30, planen var skrevet før det). Rørte filer: `src/lib/dage-til.ts` (valborg 14. februar → **30. april** med ny askonsdags-afstand 51-79 dage; svensk påskafton `offsetDays: -2` → **`-1`**; dansk sankthans fra svensk `midsummer`-logik → **fast 23./24. juni**; dansk påskeaften-FAQ slettet og erstattet; "fri med løn" fjernet; `toUtcMidnight` læser nu kalenderdagen i `Europe/Copenhagen`), `src/lib/dage-til.test.ts` (**93 → 95**), `src/lib/nettoprisindeks.ts` + `.test.ts` (lejeloven § 5), `src/components/HuslejeNettoprisindeks.tsx` + `.test.tsx`, `src/lib/page-data.ts` (to husleje-FAQ'er + én svensk promille-FAQ), `src/lib/dato-eksempler.ts` + `.test.ts` (`maneder: 12` altid), `IMPLEMENTATION_PLAN.md` og `docs/plan-arkiv.md` (**ny**, 1,6 MB append-only historik). **HTTP 200 beviser intet:** intet her rører en URL, og hele virkningen er ny eller ændret brødtekst, fem data-ankre og én tidszone. Verificér ved **indhold**:
   1. `https://minberegner.dk/dage-til/valborg` skal sige **"Valborgsmässoaften er 30. april"** og **0** forekomster på "14. februar". Titlen skal vise dage-tallet til 30. april 2027, ikke til februar.
   2. `https://minberegner.dk/dage-til/sankthansaftensdag` skal sige **23. juni** og **0** forekomster på "19. juni" / "mellem 19. og 25. juni"; `/dage-til/sankthansdag` skal sige **24. juni**.
   3. `https://beraknare.se/dagar-till/paskafton` skal have titlen på **27 mars 2027** (ikke 26. marts) og FAQ'en "Är påskafton samma sak som långfredagen?" skal svare **Nej**. `https://minberegner.dk/dage-til/langfredag` skal have **0** forekomster på "Er påskeaften det samme som langfredag".
   4. `https://minberegner.dk/husleje` skal have **0** forekomster på "fastsætter den endelige sats", **2** på "Lejeloven § 5" og **>=1** på "huslejenævnsvedtægt".
   5. `https://beraknare.se/promille` skal have **0** forekomster på "er over 2,0" og **>=1** på "6 öl på 70 kg ger 1,51 promille", og FAQ-JSON-LD'en skal have **0** `æ`/`ø`.
   6. **Nedtællingerne kl. 00-02:** tjek `/dage-til/1-december` mellem 00:00 og 01:59 dansk tid — den skal tæle til 1. december **2026** og ikke til den 30. november. (Kan kun måles i det vindue; uden for det er den gamle og den nye kode ens.)
   7. `/api/health` skal svare `status: ok` på begge domæner.
   **Målt på rigtig server før merge** (`next start` :3981, porten verificeret fri *inden* start): punkt 1-5 er alle bekræftet med de ovenstående greb, `/api/health` svarede `status: ok`, og `/dato`'s titel var uændret som kontrol. **Gate grøn:** lint (**614 filer**), **2976 tests / 187 filer**, build (**142 sider**), `locale-leak.mjs --gate` exit 0.


## Åbne opgaver

Kun det der endnu ikke er gjort. CEO-køen er i prompten og har forrang.

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


#### 119. [ ] Kø — madvare-klyngen på "kalorier" (kræver en kilde, før den bygges)

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
- **Acceptkriterier:** (1) en citable dansk eller nordisk tabel er hentet og
  kilden er nævnt *på siden*; (2) pr. 100 g **og** pr. typisk portion, fordi
  klyngen spørger begge dele ("kalorier i 2 gulerødder"); (3) rå og tilberedt
  er skelnet, når det betyder noget; (4) hver række i et modul med egen test,
  så tallene ikke kan stå i strengen og afvige fra tabellen; (5) ét afsnit,
  ikke en hel underside, og et link videre til `/kalorier` og `/proteinbehov`.

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
## ❓ Til Mads

- ❓ **Tre deploy-noter kan ikke lukkes uden en browser** (C55 `/dato`, C56 `/tidszone`,
  C60 `/promille`) — de kræver Kopier eller et knap-klik. Kliksekvenserne står ordret i
  notesektionen ovenfor. ~10 minutter for et menneske; ellers står de åbne for evigt.
- ❓ **Hvad er `beregner.no`?** (opgave 97, `BLOCKED`.) Forsiden er en 12,7 KB norsk side
  uden ét `/_next/static`-chunk, og 404'en bruger en Tailwind-klasse (`text-foreground`)
  der står i nul filer i repoet — domænet peger på en **anden udgivelse**. Skal `no`
  lanceres fra dette repo, eller er navnet reserveret? Svaret afgør, om opgave 98 er
  reel eller overflødig.
- ❓ **Nedetid 29/9:** en fuld site-scanning kørte mens produktion svarede 521 på alle
  domæner, og skanningen skrev "ingen fejl" for alle 206 sider. Ingen kode fejl — men
  en måling af et nedbrudt site giver et troværdigt tal om ingenting.
