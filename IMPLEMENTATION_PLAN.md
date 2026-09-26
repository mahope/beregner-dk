# IMPLEMENTATION PLAN — minberegner.dk (oxloop)

STATUS: KØ — **C51 er landet: `/tidsberegner` havde to datofelter i værktøjet
og nul omtaler på siden.** Komponenten har haft `Startdato (valgfri)` og
`Slutdato (valgfri)` siden sidens begyndelse, og de er det eneste, der gør
siden i stand til at svare på "hvor mange timer er der mellem to datoer" —
men **hverken brødteksten, svar-først-tabellen, FAQ'en eller metadata nævnte
dem**, og ingen af de fem eksempler brugte dem. Google autocomplete (DA,
2026-09-26 23:22) viser efterspørgslen: "hvor mange timer er der mellem to
datoer" er forslag 4 til sitets nr. 2-søgning på siden, og "hvor lang tid er
der fra dato til dato" er forslag 3 til "hvor lang tid er der fra" (GSC:
790 visninger, pos. 6). Nu har tabellen to rækker med datofelter, siden har et
afsnit på begge domæner der forklarer hvornår de skal bruges, og værktøjet
siger det samme under felterne. Ved samme gennemgang fandt auditten to ting
mere: tabellen skrev **"(dagen efter)"** på et interval der slutter *tre*
dage senere, og den fjerde tile i "Detaljeret visning" regnede timer/24 og
**kaldte resultatet "dage"** — 0,33 dage for en otte timers dag. Nu er det
`heleDoegn` i modulet, mærket "hele døgn". Kode + plan i ét commit på
`ceo/tidsberegner-flere-dage`; første kandidatvindue **2026-09-27 07:30**.
Se opgave 79.

STATUS (forrige iteration) — **C50 er landet: `/dato`'s standarddatoer var
UTC-forskudt, og alder-tilstanden duplikerede `/alder`'s modul.** `DatoBeregner` byggede dagens
dato med `toISOString().split("T")[0]`, hvilket skriver i UTC — så en dansk læser
fik **dagen i går som standard** kl. 00-02, og "til dato" var systematisk **én
dag for tidligt** hele døgnet, fordi en lokal dato kl. 00.00 skrives som dagen
før i UTC. Samme komponent havde sin egen alder-beregning med UTC-tolkede
fødselsdatoer, som `src/lib/alder.ts` allerede løste korrekt i C47. Nu læser
`/dato` kalenderdatoer gennem ét nyt modul (`src/lib/lokal-dato.ts`), alder-
tilstanden kalder `beregnAlder`, og et tomt eller umuligt datofelt giver intet
resultat frem for "NaN dage". Kode + plan i ét commit på `ceo/dato-alder-lokaldato`;
første kandidatvindue **2026-09-27 07:30**. Se opgave 78.

**Fire deploynoter står åbne: C37, C49, C50 og nu C51**, alle med første
kandidatvindue 2026-09-27 07:30 (C37: 12:30). 21:30-vinduet den 26/9 er
passeret, så intet kan verificeres før 07:30. `beregner.no`-delen af enhver
note verificeres ikke: den URL er et separat site, ikke dette repo (se ❓).

**Næste iteration: `/moms` er det eneste trafikstærke side i C47's
auditrække, der endnu er urørt** (23.426 visninger, 40 klik, CTR 0,2 %,
pos. 6,9; GSC's største søgning "momsberegner" 1.693 visninger pos. 7).
C51's gennemgang af `/tidsberegner` tog 40 minutter, så det er realistisk
som én iteration. **Pas på den fælde, der kostede C51 25 minutter:** repoets
eksisterende stavemåde er **`TIDS_EKSEEMPLER`** (to E'er: eks-**EEM**-pler),
og den nye kode skrev `TIDS_EKSEAMPLER` med ét E. Typecheck, lint og build
fangede den ikke, fordi et ubrugt navn i et JSX-udtryk er gyldig TypeScript;
den viste sig først som en `ReferenceError` i vitest. Det forvirrende var, at
samme fejlnavn stod **bundet i det første JSX-udtryk og frit i de næste** — så
den første forekomst ville have givet `undefined` i stedet for at fejle. Verifikér
derfor et nyt symbol med `grep` i den fil der bruger det, **før** du skriver det
i flere filer. Øvrige ubearbejdede mål: `/moms`' manglende lib-modul (hele
momsregnestykket ligger inline i komponenten, se ❓), de to øvrige
`toISOString().split("T")`-forekomster (`AlderBeregner` 3, `UgenummerBeregner`
2) og "2026 har 253 arbejdsdage" på `/dato`.

**Bemærk til næste iteration om en fælde, der kostede tid i C49.** Labels i
`TidszoneBeregner` lå i et `as const`-objekt, og en ny nøgle (`vinterWord`)
blev fundet med `Object.keys` og læst korrekt med `Object.entries` på samme
linje, men renderede tom i JSX. Den eneste sikre løsning i tidsnød var at
flytte værdien ud som en lokal `const` i selve map-callback'en. Ved næste
større ændring i den fil bør `l.*`-opslaget testes direkte, ikke via
`textContent`-assertions på hele siden — en fejl i etiketten er usynlig, fordi
resten af siden renderer fint.

**C48 lukkede opgave 75's fund, som var skrevet ud, målt og aldrig landet — og
den afslørede en auditmetode, der er billigere end nogen anden.** Den så,
at opgave 75's fejl ikke lå i teksten, men i en **konstant, der var hardkodet
ét sted og duplikeret et andet**: `maaKoere` i `src/lib/promille.ts` svarede
med den danske grænse 0,5 ‰, mens komponenten havde sit eget
`LIMIT = { da: 0.5, se: 0.2, no: 0.2 }`. Det er præcis C38's locale-leak igen,
bare i logikken, og det fandt man ved at læse biblioteket *mod* komponenten —
ikke ved at læse siden. Den fandt også, at FAQ'en svarede på "Hvornår kan jeg
køre bil igen?" med **5,9 timer**, som er tiden til 0 ‰: læseren kan regne sig
frem til ca. 2,5 time, og **det er ulovligt**. Nu findes `timerTilGraense` i
modulet (rundt **op**, aldrig ned, på den afrundede promille siden viser), de
fire eksempelrækker genereres af `beregnPromille` i `src/lib/promille-eksempler.ts`
præcis som C40 gjorde for `/alder`, tabellen står på begge domæner med den
grænse der gælder i landet, og FAQ'en er skrevet fra eksempelmodulet. Se
opgave 76.

**To negative fund fra C47's audit er skrevet ned, så ingen senere iteration
bruger tid på dem.** `npm audit` er **0 sårbarheder** (135 filer, 1432 tests) —
`AFHAENGIGHEDER.md` siger 1 kritisk + 7 høje for dette projekt, men det er et
scan fra 2026-08-23 og er forældet. Og `engines`/`.nvmrc` mangler stadig, men
`Dockerfile` fastslår `FROM node:22-alpine`, så byggeserveren *kan ikke* vælge
Node 18 som i jordemoderstudy-fallet 23. august; en `engines`-erklæring ville være
dokumentation, ikke en fejl-fiksering, og er derfor bevidst ikke lavet. CSS-
advarslen i `next build` (7 warnings while optimizing generated CSS) er
**forhåndsværende** — verificeret ved at bygge `master` uden ændringer.

**C47's negative fund skal bruges som metode, ikke som emne.** Den viste, at
"værktøjet kan det, siden siger det ikke" er en helt anden og billigere klasse
end "byg et nyt felt". Samme spørgsmål bør stilles til de øvrige
trafikstærke sider, før der bygges nyt: **find feltet i værktøjet, der siden
ikke fortæller om.** Konkret åbne eksempler: `/dato` og `/tidszone` har flere
tilstande end siden nævner. `/braendstof` er lukket med negativt fund;
`/promille` gav et sikkerhedsfund, som nu er rettet.

**C47 gjorde C45's stærkeste åbne kandidat færdig — og fandt en fejl i
koden, ikke i teksten.** C45 skrev, at `/alder` manglede spørgsmålet
"beregn alder mellem to datoer", men at det *krævede en GSC-række før det
blev bygget*. Rækken findes: `/alder` er GSC's nr. 13 på dansk (**6.013
visninger, 35 klik, CTR 0,6 %, pos. 7,8**) og nr. 9 på svensk (**2.895
visninger, 8 klik, CTR 0,3 %, pos. 7,7** med "räkna ut ålder" 169v pos. 8,
"räkna ålder" 137v pos. 8, "beräkna ålder" 71v pos. 5). Så den betingelse var
opfyldt, og det viste sig, at **værktøjet allerede kunne det hele tiden**:
`AlderBeregner` har haft feltet "Beregn alder pr. dato" med vilje, men
siden nævnte det aldrig — "mellem to datoer" stod nul gange i hele
teksten. Det var altså ikke et nyt felt, men en **ubeskrivet
funktion**. Undervejs fandt en reel fejl: `new Date("1990-03-15")` tolkes
som UTC-midnat, mens koden læser `.getDate()` — så en besøgende i Danmark,
Sverige eller Norge fik det rigtige svar, mens enhver bag UTC fik dagen i
går. Datoer læses nu som lokal kalender, hvilket også gør at serverrenderet
eksempeltabel og klientværktøjet er tvunget til at være enige. Se opgave
74.

**C46 lukkede den eneste åbne *datagrund* fra C45's autocomplete-audit, uden at
røre en eneste titel.** "tidszone grønland", "grækenland", "portugal" og
"kreta" lå blandt Googles forslag, men ingen af dem fandtes i `TIDSZONER` — så
C45's egen advarsel holdt: det var et databehov, ikke en tekstændring. Nu ligger
de i modulet med IANA-offsets (Nuuk WGT/WGST = UTC-3/-2 siden marts 2023,
Athen og Kreta EET/EEST, Lissabon WET/WEST, Reykjavik UTC+0 uden sommertid), i
beregnerens zoneliste og i svar-først-brødteksten på begge domæner. Én fælde
var fundet undervejs: byen hedder **Athen** på dansk og **Aten** på svensk, og
tabellen er delt, så `TidszoneInfo` har fået et `bySe`-felt — ellers havde
C38's "ingen locale-leak"-fund være blevet modsagt af C46. Se opgave 73.

**C45 lukkede C23's sidste åbne note og fyldte et hul i `dage-til`-fladen,
som familien selv afslørede.** C23's `/loen-efter-skat` blev verificeret i
17:30-batchen, men `/brutto-netto` og `/topskat` blev ikke kørt — de er
verificeret nu ved indholdskontrol (`25,049` 3 gange + `25.049` på
`/brutto-netto`, `0.639` i kirkeskatfeltet på `/topskat`), så **C23 er helt
lukket**. Det samme audit fandt det største hul i julefladen: familien
indeholder `1-december`, `juledagen` og `nytaarsaften`, men **ikke juleaften** —
`/dage-til/juleaften` svarede 404, selv om juledagens *egen brødtekst* siger
"Juleaften er 24. december, juleaften 25. december…". Google autocomplete i
begge sprog (hentet 2026-09-26 20:31) bekræfter efterspørgslen: DA "hvor mange
dage er der til juleaften" og "…til den 24 december" ligger blandt
forslagene, SE "hur många dagar är det till julafton" og "…till julafton 2026"
ligger i top-5. Begge sprog har nu siden, og da strukturen er genereret fra
`src/lib/dage-til.ts`, kommer de automatisk i sitemap, i `/dato`s og
`/nedtaelling`s lister og i overskriftstesten. Se opgave 72.

**To negative fund, så ingen senere iteration bruger tid på dem.**
`npm audit` er **0 sårbarheder** (133 filer, 1398 tests) — `AFHAENGIGHEDER.md`
siger 1 kritisk + 7 høje for dette projekt, men det er et scan fra 2026-08-23
og er forældet. Og `engines`/`.nvmrc` mangler stadig, men `Dockerfile` fastslår
`FROM node:22-alpine`, så byggeserveren *kan ikke* vælge Node 18 som i
jordemoderstudy-fallet 23. august; en `engines`-erklæring ville være
dokumentation, ikke en fejl-fiksering, og er derfor bevidst ikke lavet.

**C44 lukkede det sidste ubedømte sted i C43's egen testklasse og fandt intet
at rette i indholdet.** C43's cannibaliseringstest læser `page-data.ts` og
blogfiler fra disk, så de 14 `dage-til`-landingssider — genereret fra
`src/lib/dage-til.ts` — var usynlige for den. De er auditet live: ingen blød
404, alle 7 DA-slugs i sitemap med self-canonical og **regnet efter** tal
(2026-09-26 → 1. dec = 66 dage, → juledagen = 90, og live siger 66 og 90), og
ingen af de 14 headlines kolliderer. Testen dækker dem nu, plus en assertion
på at de faktisk bliver fundet — ellers ville den være grøn, hvis modulet
engang returnerede tomt. Tre negative fund er skrevet ned, så ingen senere
iteration bruger tid på dem: **canonical-slash** (jeg så `/moms` med
trailing slash og frygtede en self-canonical der redirecter — alle 11 kontrollerede
sider er slashless, og `/moms/` 308'er korrekt), **manglende `no` i hreflang**
(beregner.no 404'er på `/dato`, `/moms`, `/procent`, `/tidszone`, så der er
intet at annotere) og **`/procent`** (7 forekomster af "rabat" + formler +
hverdag + tricks + FAQ live, så 0,1 % CTR på 149.318 visninger er *placering*,
ikke et indholdshul — kandidat 9 er lukket på indholdssiden). En fjerde er
lukket bagefter: **en crawl af alle 128 sitemap-URL'er** fandt 0 ikke-200, 0
manglende titler, 0 manglende descriptions og præcis ét H1 på hver side, så
site-wide metadata er *ikke* en voksende klasse. Se opgave 71.

**Den største vækstmulighed på sitet ligger fast i en dataanmodning.** De
352.092 visninger på `/procent`, `/dato` og `/tidsberegner` (59 % af sitets
alle visninger) har 1.103 klik, og intet i de data jeg får kan skelne mellem
*placering* (langhale på pos. 20-60 → interne links) og *snit* (pos. 5-8, men
brugerne springer over → ny titel). Begge er billige, men modsatte, rettelser.
Der ligger nu **én konkret anmodning** under ❓ Til Mads om de tre sideres
søgestreng-rækker, med hvad hver kolonne afgør.


**C43 fandt den eneste titelkollision på hele sitet — og den var lavet
dagen før.** C36 gav artiklen `blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`
headline'en **"Hvad er klokken i USA, når den er 12 i Danmark?"**, som er
`/tidszone`'s egen `<title>` (24.723 visninger, pos. 7,5) — samme domæne,
samme headline, to URL'er, og Google skal vælge. Normaliserer man alle 104
danske headlines (alt før første `|`) er der **præcis én** kollision, så
klassen er lille men skarp. Artiklen hedder nu "Hvad er klokken i USA?
Tidsforskel for 16 byer" — den dækker det, den faktisk har stoff til, og
spørgsmålet bliver hos værktøjssiden med de 24.723 visninger. En ny test
læser artiklernes titler direkte fra filerne og fejler på den gamle titel.
Se opgave 70. Samme audit gav tre negative fund, som er skrevet ned, så ingen
senere iteration bruger tid på dem: **alle procent-eksempler er regnet
rigtigt** (0 afvigelser på 124 sider), brand-suffikset er inkonsistent men er
copy, ikke fejl, og `/procent` åbner på et andet eksempel end sin titel
lover — et UX-valg uden måling bag sig.

**C42 lukkede den sidste åbne kandidat og fandt en fejl, der lå i koden, ikke i
indholdet.** Kandidaten "interne kæder, der kun hænger én vej" er nu lukket:
af de 19 sider med dokumenteret trafik har 18 redaktionelle indgående links
(2-30 pr. side), og den eneste undtagelse — **`/brok`, 4.640 visninger på
pos. 5,3 med nul indgående links** — er rettet. Men grafen afslørede en
**stille `slice(0, 5)`** i `getRelatedCalculators`: 13 af 81 sider erklærer 6
eller 7 relaterede beregnere, og den afskaffede hale blev aldrig vist. Så
`/dato` (130.392 visninger) og `/tidsberegner` (72.382) tabte begge
`/ugenummer`, og `/promille` tabte `/procent` — altså de fire mest trafikerede
forældre, der så ud til at linke til `/ugenummer`. Tabellen er nu kontrakten,
og otte tests holder den. Se opgave 69.

**Næste iteration skal ikke genoptage hverken C41's eller C42's interne
linkklasse** — begge er lukket og måles 2026-10-10, og C42's metode-lære
står i opgaven: del grafen i *redaktionelle* og *globale* indgående links,
ellers måler man katalogens navigation. Kandidat 2, 3 og 7 er lukket,
kandidat 5 er delvis lukket i C39, og kandidat 4 er fire beslutninger under ❓
der kræver et ja fra Mads. Se listen under "Næste kandidater efter C34".

**C41 lukkede C40's nye klasse med et negativt fund og fandt en anden.**
C40 fandt på `/tidsberegner` en `metaDescription`, der lovede et eksempel,
brødteksten ikke havde. C41 auditerede de 13 øvrige DA-sider i GSC-top-14
med samme metode: **hvert tal i hver `metaDescription` findes på siden**, så
det var en enkelt fejltype, ikke en mønsterklasse — og det er skrevet ned, så
ingen senere iteration bruger tid på den. Audittens *fugtige* søgestreng gav
imod, at GSC skriver "benzin beregner", hvor siden skriver "benzinberegner":
dansk sammensætning gør exact-match ubrugeligt som fejlsignal. Det fund,
der holdt, var et andet: **`/dato` linkede til nul af de syv `dage-til`-sider**,
hvis egen ankertekst er "Hvor mange dage er der til 1. december?" — GSC's
næststørste søgning på sitets næststørste side (996 visninger, pos. 5).
Kæden hang kun én vej, fordi `/nedtaelling` linkede til alle svy. Se opgave 68.

**C40 fandt en klasse C1-C39 ikke havde set: titlen lovede et eksempel,
brødteksten havde det ikke.** `/tidsberegner` er **tredjestørste CTR-tab på
sitet** (72.382 visninger, 207 klik, **CTR 0,3 %**, pos. 7,0), og både
`metaDescription` og `ogDescription` lovede *"Eksempel: 08:30 til 16:45 er 8
timer og 15 minutter"* — men da live-brødteksten blev trukket ud, forekom
"08:30" og "16:45" **én gang hver og kun i metadat**. H1 var det generiske
"Tidsberegner", og ingen af de fire GSC-søgninger ("hvor lang tid" 790v pos. 6,
"tidsberegner" 969v pos. 4, "time beregner" 119v pos. 8, "beregn tid" 94v pos. 7)
stod som et spørgsmål nogen steder. Det er modsat C38, hvor SE-siden fik
eksemplet i kroppen. H1, en **svar-først-tabel før værktøjet** og en FAQ, der
spørger GSC-strengene, er rettet nu — og alle fem tabelrækker **beregnes af
`beregnTidsinterval`**, så siden og værktøjet ikke kan glide fra hinanden. Se
opgave 67. **Det er den nye klasse: auditér `metaDescription` mod den synlige
brødtekst på de DA-sider, C1-C16 kun rørte i titlen.**

**C39 tog kandidat 5 (svensk placering) og gav den sin første konkrete
indholdsrettelse.** SE `/procent` har **23.294 visninger og 2 klik (pos. 10,2)**
— tredjestørste svenske visningsside, lige under side 1, og nul CTR.
C38 lod den urørt, fordi GSC-listen for siden ikke viser nogen søgning.
Google Autocomplete (`hl=sv`, hentet i dag) siger, hvad de svenske brugere
*spørger om*: "hur räknar man ut procent i excel", "procent av summa" og
"hur räknar man ut procent på lön" — **ingen af dem fandtes på siden**,
mens de fire eksisterende FAQ-par svarer på "beräkna procent" og
"procentuell ökning formel", der ikke løftes. Siden har nu en synlig
Excel-tabel med tre formler, de tre spørgsmål i både synlig FAQ og
JSON-LD, og to interne links til `/lon-efter-skatt` og `/loenstigning`.
Undervejs fandtes en fagfejl: siden skrev **37 % skatt** på en svensk løn —
en *dansk* sats. Skatteverket gav 404, så opgaven opfandt ingen erstatning og
sætningen siger nu, at satsen afhænger af kommun og inkomstnivå. Se opgave 66.

**C38 gik efter den eneste klasse, C1-C16 ikke havde dækket: svensk
spørgsmålsform.** Snapshot 2026-09-26 14:07 + GSC viser, at beraknare.se har
**499 besøgende/28d (+151 %)** med `/dato` 119 (+644 %), `/tidsberegner` 147
(+206 %) og `/leasing` 46 — og at disse tre sider har 88.498 + 55.186 + 3.181
visninger til position 8,4 / 8,2 / 12,5 med 0,1-0,9 % CTR. En audit af alle ti
svenske top-sider mod hver enkelt GSC-søgningsstreng falsificerede først
hypotesen om danske head-ord (alle sider bruger Tidskalkylator,
Momskalkylator, Kalorikalkylator m.fl.) og fandt så det reelle gap:
**søgningerne er spørgsmål, og spørgsmålet stod ikke på siden** — "antal dagar
mellan datum" (384 visninger, pos. 9), "räkna ut timmar och minuter" (121, pos.
10) og "färetagsleasing" (196, pos. 11, nul forekomster på hele siden). Se
opgave 65.

**C37's `/renteberegner` er stadig åben og måles 2026-10-10.** Næste iteration
skal **ikke** optimere CTR på de samme svar-først-sider igen (alle 15 DA-sider
og alle SE-top-15 er dækket af C1-C16 og C38), og den skal **ikke** gentage
C26-C38. **Kandidat 2 er lukket for sidste gang** (C38: de 28 DA-sider uden
svensk metadata er danske ydelsessider, og det nye snapshot tæller dem ikke),
kandidat 3 blev lukket i C37 med et negativt fund, og kandidat 4 er fire
beslutninger under ❓ der kræver et ja fra Mads. Den nye klasse er **kandidat 5:
svensk placering** — SE `/procent` (23.294 visninger, 0,0 % CTR), `/bil` pos.
32,9, `/kalorier` pos. 20,7, `/moms` pos. 23,6 — hvor copy er udelukket og
det mangler svensk substans og intern linkvægt. Mål C38 først (2026-10-10).

**C36 lukkede det sidste ubestyrede emne fra C35's kandidatliste.** `/tidszone`
(24.723 visninger, 0,5 % CTR, pos 7,5) havde fire søgninger, og **autocomplete
(hentet 26/9) bekræfter præcis de formuleringer, artiklen nu svarer på**:
"hvad er klokken i usa når den er 12 i danmark" (183v pos 6) plus
"… når den er 21/16/14 i danmark", "hvad er klokken i usa miami" og
"hvad er klokken i usa est"; desuden "tidszoner kort/usa/verden" (764v pos 10 på
"tidszoner") og "tidsforskel grønland/thailand/bali/japan/tyrkiet/kreta/new york".
Indlægget `src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark` har alle
amerikanske zoner ved 12, 14, 16 og 21 dansk tid, 16 byer i forskelstabel og de
**præcise sommertidsdatoer for 2026**. Se opgave 63.

**C35 gjorde kandidat #0 fra C34 halvt færdig med ét gennemarbejdet indlæg.**
`/kvadratmeter` (20.959 visninger, 1,4 % CTR, pos 5,0) havde fire konkrete
søgninger — "hvordan regner man kvadratmeter ud" (357 visninger, pos 3),
"beregn kvadratmeter" (196, pos 3), "kvadratmeter beregner" (170, pos 4) og
"kvadratmeter" (1.815, pos 5) — og **ingen artikel svarede til emnet**. Det har den
nu: `src/app/blog/kvadratmeter-saadan-regner-du-ud` er svar-først på
"areal = længde × bredde", regner alle fire figurer værktøjet understøtter med tal
læseren kan efterprøve, og skelner mellem maling (10-12 m² pr. liter), spild
(10 %) og BBR-arealet. Kun to kilder, begge hentet i dag: bbr.dk (registrering over
10 m², BBR-meddelelsen ved køb) og hjemmeland.dk (formler, døråbning,
malingsdækning, spild). Returlinken fra beregneren ligger i `blog-kobling.ts`, så
symmetri-testen dækker den. `/tidszone` (24.723 visninger) er det eneste
tilbageværende ubestyrede emne. Se opgave 62.

**C34 lukkede blog → beregner-kandidaten med et negativt fund, og det var
opgaven.** Alle 26 indlæg har allerede et link til den relevante beregner i 1-5 %
af artiklens krop, og 24/26 ender med en relateret-blok — så "hvilke mangler en
næste handling" gav ingenting at rette. Den modsatte retning manglede derimod:
af 138 indlæg → beregner-kanter havde kun **11** en returlink, spredt i ni siders
brødtekst. Koblingen ligger nu ét sted (`src/lib/blog-kobling.ts`), og de fem
beregnere med flest visninger — `/moms` 23.426, `/braendstof` 16.580,
`/renteberegner` 13.623, `/alder` 6.013, `/rentefradrag` 4.556 — renderer de
indlæg, der svarer til deres spørgsmål. Blokken vises kun på de danske domæner, så
der ikke lækker dansk tekst til beraknare.se. Se opgave 61.

**C33 gjorde C28's sidste kandidat til en reel fejl, ikke et kosmetisk problem.**
`/husleje` lovede "25.000 kr netto → max ca. 7.500 kr/md", mens værktøjet startede på
28.000 kr. Men værktøjet havde **intet felt for el, vand og varme** — selv om resultatet
stod som "pr. måned inkl. el, vand og varme", FAQ'en sagde "husk at inkludere el, vand og
varme", og sidens egen liste tæller dem med. En lejer med 1.800 kr. i el og varme læste
et tal 1.800 kr. for højt. Der er nu ét ratested (`src/lib/husleje.ts`), reglen dækker
husleje + boligforbrug som skrevet, og værktøjets standardtilstand **er** det eksempel,
siden citerer. Se opgave 60.

**C32 gjorde C30's advarsel bogstavelig.** `/elbil` havde sine egne forudsætninger
hardkodet (18 kWh/100 km, 16 km/l) ved siden af `src/lib/braendstof.ts` (17 og 15), og
tre steder lovede at el koster "under halvdelen" af benzin — ved værktøjets **egne**
standarder er el 0,45 mod benzins 0,84 kr. pr. km, altså 53 %. Der er nu ét modul, alle
tre løfteafsnit renderer tal fra det, og `biloekonomi`-artiklens regnestykke (13.500 /
5.400 / "over 8.000") er rettet til 12.656 / 6.750 / ca. 5.900. Se opgave 59.

**C31 fjernede et løfte, der var forkert for værktøjets egen standardbruger.**
`/pension`'s hjælpetekst sagde "Folkepensionsalder er 68 år (stigende)", mens siden
ovenfor viser skalaen 65-70 år efter fødselsår. En 30-årig — værktøjets default —
har folkepensionsalder 70 år, så standardværdien på 68 år lå to år for tidligt og
sparetiden var regnet for kort. Alderen udledes nu fra fødselsåret gennem det testede
modul, og resultatet siger eksplicit, om den valgte alder ligger før eller efter
folkepensionsalderen. Se opgave 58.

**C30 fjernede et løfte, som `/braendstof`s eget værktøj modsagde.** FAQ'en lovede i
alle tre sprog, at el er "typisk 50-70 % billigere pr. km", men værktøjets egen
sammenligningstabel giver 52,8 % mod benzin og **40,2 % mod diesel** — diesel er
billigere pr. km end benzin i forvejen. Intervallet holdt altså kun mod den ene af de
to brændstoftyper, og ved offentlig opladning (3-6 kr./kWh) er el dyrere end diesel
over 4,2 kr./kWh. Der er nu ét ratested (`src/lib/braendstof.ts`), sammenligningstabellen
læser det, og FAQ'en **renderer** besparelsen pr. brændstoffype i stedet for at løfte
et interval. Se opgave 57.

**C29 rettede et fejltal i makro-fordelingen på `/kalorier`.** Værktøjet satte
protein til 1,8 g/kg uanset mål, mens siden selv siger 0,8-1,2 / 1,2-1,6 / 1,6-2,2
g/kg for vedligehold, vægttab og muskelopbygning — 144 g for "Vægttab" på 80 kg mod
sidens 96-128 g. Der er nu ét ratested (`src/lib/makroer.ts`), protein-kortet viser
g/kg og interval, og sidens egne lister læser fra samme modul. Samme iteration
lukkede C27's `/flyttebudget`-rest. Se opgave 56.

**C28 fandt to tællefejl på sitets største side.** På `/dato` summerede de tre
dagstyper til **ét mere end "Antal dage"** (systematisk, fordi tællerne var
inklusive og det store tal er en forskel), og en helligdag på en weekend blev
tællet **to gange** (26. december 2026 er både lørdag og 2. juledag). Begge er
rettet, og nytårsaften er den eneste dag, der på dansk hverken er arbejdsdag,
weekenddag eller helligdag — den forklares nu i stedet for at forsvinde fra
summeringen. Se opgave 55.

Næste iteration skal **ikke** optimere CTR på de samme svar-først-sider igen, og
den skal **ikke** gentage C26-C36. **C28's kandidatliste er tom, og C34 lukkede
blog → beregner med et negativt fund** — se afsnittet "Næste kandidater efter C34".
C35 skrev artiklen til `/kvadratmeter`, og **C36 skrev den sidste til `/tidszone`**,
så de otte testdirekte svar-først-sider har nu alle deres artikel. Næste opgave er
derfor kandidater 2-4 i "Næste kandidater efter C34": de 28 DA-sider uden svensk
metadata (springes hvis et nyt snapshot fortsat ikke tæller dem), C32's åbne
spørgsmål om `/elbil`, eller de fire beslutninger under ❓ der kræver et ja fra Mads.
`/kalorier` og `/flyttebudget` er lukket i C29, `/braendstof` i C30, `/pension`s
folkepensionsalder i C31, `/elbil`s forudsætninger i C32, `/husleje` i C33,
bloggens returlinkes symmetri i C34, `/kvadratmeter` i C35 og `/tidszone` i C36.


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

#### 21. [x] FÆRDIG 2026-09-25 — C10 — Ret børnepenge-satserne og gør artiklen svar-først

- **Iteration start:** 2026-09-25 20:33 CEST på `ceo/c10-boernepenge-ctr`. Køen efter C9
  var tom; planens egen næste CTR-kandidat var denne artikel.
- **Datagrund:** Search Console 2026-08-26–2026-09-23: `/blog/boernepenge-2026-satser-og-regler`
  5.145 visninger, 27 klik, **CTR 0,5 %**, position 8,5. Søgningerne er konkrete
  ("børnepenge 2026" 986v/3k pos 9, "børnepenge sats 2026" 339v pos 6, "børnepenge 2026
  udbetaling" 294v pos 10, "børne unge ydelse satser 2026" 136v pos 8). Plausible
  `/boernepenge` 134 besøgende/28d (+185 %, bounce 1 %) pr. 2026-09-25.
- **Fund — tre af fire satser var forkerte.** Borger.dk er verificeret direkte den
  2026-09-25. Vores tal vs. de officielle 2026-satser:
  | Alder | Vores værdi | borger.dk | Konsekvens |
  |---|---|---|---|
  | 0-2 år | 5.370 kr./kvartal | 5.370 kr./kvartal | korrekt |
  | 3-6 år | 4.251 kr./kvartal | **4.248 kr./kvartal** | 12 kr. for lav pr. år |
  | 7-14 år | 3.345 kr./kvartal | **3.342 kr./kvartal** | 12 kr. for lav pr. år |
  | 15-17 år | 1.115 kr./måned | **1.114 kr./måned** | 12 kr. for lav pr. år |
  Afledte årstal var dermed 17.004 (skal 16.992) og 13.380 (skal 13.368).
  Fejlen lå i `page.tsx`, `page-data.ts` **og** `BoernepengBeregner.tsx` — altså også i
  beregnerens beregnede resultat, ikke kun i teksten. Artiklen henviste til
  "Kilde: borger.dk — sidst verificeret februar 2026" uden at nogen sats var verificeret
  mod kilden.
- **Fund — en regel var forklaret baglæns.** Artiklen skrev at "Bor du sammen med barnets
  anden forælder, vurderes jeres indkomster samlet". Borger.dk siger modsat: siden
  1. januar 2022 nedsættes ydelsen **kun ud fra egen indkomst**, også når forældrene
  bor sammen, og den anden forælders indkomst påvirker ikke din halvdel.
- **Beslutning/implementering:** Mønsteret fra O1 (barsel) og C8 (folkepension):
  `src/lib/borneungeydelse.ts` er nu single source med `source`, `nedsættelseSource`,
  `verifiedAt`, de fire aldersgrupper med hel/halv beløb, aftrapningsgrænse og
  udbetalingsdage. Rente afledes i kode (`aarligBelob`, `udbetalingerPrAar`) i stedet for
  at stå som et tal, der kan glide. Beregnerens nedsættelse bruger den testede
  `beregnAftrapning()`. Artiklen, `/boernepenge`-siden og `page-data.ts` (description,
  metaDescription og FAQ) læser alle fra samme fil.
- **CTR:** Svar-først-titel `"Børnepenge 2026: 5.370 kr./kvartal (0-2 år)"` (45 tegn;
  layoutets titel-template tilføjer domænet → 58 tegn i SERP) og description med alle
  fire satser. Ny tabelkolonne "Halvdelen", fordi halvdelen er det søgeren ofte vil
  have. "Ændringer i 2026"-afsnittet skrev om "ca. 3,5 % satsregulering" og en påstand om
  uændret 2025-grænse, som ingen kilde dækker; det er erstattet af den dokumenterede
  2026-regel: Udbetaling Danmark kan fra 1. januar 2026 udbetale ydelsen helt eller
  delvist til barnet/den unge, med følge for supplerende grøn check.
- **Børnetilskud:** De "ca. 6.300/6.600 kr." i artiklen og på siden kunne ikke
  verificeres i denne iteration (borger.dk ligger på en separat side, Børnetilskud), så
  de tal er fjernet og erstattet af en kildehenvisning. Børnetilskud ligger uden for
  børne- og ungeydelsen og hører ikke i denne fil — jf. D2.
- **Acceptkriterier:**
  1. `4.251`, `3.345`, `1.115`, `17.004` og `13.380` findes ikke længere i `src/`. **PASS**
     (`grep` efter merge)
  2. Artikel, `/boernepenge`, `page-data.ts` og `BoernepengBeregner` bruger samme
     konstanter, og intet børnebeløb er hardkodet i komponenten. **PASS** (drik fra
     `BOERNE_SATSER_2026`; 6 filer i diffen)
  3. Ingen påstand om samlet indkomstvurdering for sammenkørende forældre. **PASS**
  4. 13 nye tests i `src/lib/borneungeydelse.test.ts` dækker satser, halvdele,
     aldersgrænser (0/2/3/6/7/14/15/17/18), afledte årstal, aftrapning ved/under/over
     grænsen samt negative og `NaN`-indkomster. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-25 20:45 CEST:** `npm run lint` grøn (483 filer), `npm run test`
  grøn (**1027/1027, 98 filer**), `npm run build` grøn (Compiled successfully; kun de 7
  kendte CSS-advarsler), `tsc --noEmit` ingen nye fejl (den ene `es2018`-regex-advarsel i
  `StructuredData.test.tsx` er pre-existing). Lokal `next start` på port 3222: artiklen
  gav `<title>Børnepenge 2026: 5.370 kr./kvartal (0-2 år) | MinBeregner.dk</title>` med
  korrekte 4.248/3.342/1.114 og 16.992/13.368 synlige, `/boernepenge` viste samme tal,
  `/api/health` svarede `{"status":"ok"}`.
- **To fejl fanget af live-kontrollen, ikke af gaten:** (1) `title` må ikke selv indeholde
  `| MinBeregner.dk`, fordi layoutets titel-template tilfører domænet — første build
  serverede derfor dobbelt suffiks. Rettet. (2) Nyt interval-felt skrev "maaned" i prosa;
  `intervalNavn` er nu dansk læsbar tekst, `interval` er maskin-nøgle.
- **Landet:** kode `31a1a48`, merge `259da41` 2026-09-25 20:47 CEST.
- **Forventet effekt:** 5.145 visninger/28d på position 8,5 med CTR 0,5 %. Løftes CTR til
  2 %, giver det ca. 76 ekstra klik pr. måned på den søgning, der ligger tættest på at
  konvertere. Sekundært: tre forkerede satser i beregneren fjernet — det er et
  tillidsproblem på en ydelse, folk søger på fordi de skal have den rigtige.
- **MÅL:** `/blog/boernepenge-2026-satser-og-regler` baseline 5.145 visninger, 27 klik,
  CTR 0,5 %, position 8,5 pr. 2026-09-23; Plausible `/boernepenge` 134 besøgende/28d
  pr. 2026-09-25. Effekt måles først fra 2026-10-09.

#### D1. [x] FÆRDIG 2026-09-25 — dubbelt domæne-suffiks i blogartiklernes `<title>`

- **Datagrund:** fundet ved C10's live-kontrol 2026-09-25. Layoutets titel-template
  tilføjer `| MinBeregner.dk`, og `/blog/boernepenge-2026-satser-og-satser` havde
  suffikset i sin egen `title` — SERP'en fik
  "Børnepenge 2026: ... | MinBeregner.dk | MinBeregner.dk". Samme mønster findes i
  `/blog/barsel-2026-regler-og-satser` (183 besøgende/28d, 85 % bounce),
  `/blog/boernepenge-2026-satser-og-satser` (før C10) og formodentlig de øvrige
  blogartikler.
- **Scope:** gennemgå alle `title`-felter under `src/app/blog/` og fjern det
  hårdkodede domænesuffiks; kun metadata røres. Ny test der tjekker at ingen
  artikeltitel indeholder domænenavnet.
- **Beslutning/implementering:** 25 blogartikler + blogindekset (`src/app/blog/page.tsx`,
  også i `openGraph.title`) + `/embed` havde suffikset i egen `title`; alle 27 er renset
  for **kun** metadata — ingen brødtekst, beregningslogik eller links er rørt. Ny
  kilde-scannende gate `src/app/metadata-titles.test.ts` fejler på det rensede
  `master`-indhold, så fejlen kan ikke komme tilbage.
- **Undersøgt og befundet korrekt:** de 62 `metaTitle`-værdier i `src/lib/page-data.ts`
  med `| MinBeregner.dk` er **ikke** dobbelt-suffiks. `buildPageMetadata` bruger
  `title: { absolute: … }` (`src/lib/page-helpers.ts:38`), som bevidst omgår layoutets
  template, og `getPageData(slug, locale)` returnerer lokaliserede titler — live-kontrol
  på `Host: beraknare.se` gav svensk titel med `| Beräknare.se` for `/vandbehov`,
  `/proteinbehov`, `/nedtaelling`, `/promille`, `/del-regning` og `/loenstigning`.
  De blev bevidst ikke rørt.
- **Verifikation 2026-09-25:** `npm run build` grøn (139 sider), `npm run test` grøn
  (1030/1030, 99 filer), `npm run lint` grøn (484 filer). Lokal standalone-SSR-kontrol
  mod alle 25 blogartikler + `/blog` + `/embed`: alle 200 og **præcis ét**
  domænesuffiks i `<title>`.
- **Forventet effekt:** 5-10 tegn mindre titel pr. artikel. Lav CTR-effekt i sig selv,
  men det er en ren fejl der koster troværdighed, og den er gratis at rette.
  MÅL: `/blog/barsel-2026-regler-og-satser` baseline 183 besøgende/28d pr. 2026-09-25;
  `/blog/boernepenge-2026-satser-og-regler` Search Console baseline 5.145 visninger,
  27 klik, CTR 0,5 %, position 8,5 pr. 2026-09-23. Genmål 2026-10-09.
- **Landet:** kode `c982651`, merge `76d8ad8` 2026-09-25 21:22 CEST.

#### 22. [x] FÆRDIG 2026-09-25 — C11 — Indkomstfelt, så pensionstillægget regnes ned (åben del af C8)

- **Iteration start:** 2026-09-25 21:23 CEST på `ceo/c11-pensionstillæg-indkomst`.
  Planens egen første opgave efter D1: den åbne del af C8.
- **Datagrund:** `/pension` Search Console baseline 4.001 visninger, 45 klik, CTR 1,1 %,
  **position 12,2** pr. 2026-09-23. Søgningerne ligger langt nede: "pensionsberegner"
  173v/1k pos. 22, "beregn pension" 89v pos. 28, "beregn pensionsopsparing" 78v pos. 24.
  Google autocomplete (da-DK, verificeret i C8 samme dag) for "beregn pension" giver
  *beregn pensionsalder*, *beregn pensionstillæg*, *beregn pensionstillæg 2026* og *beregn
  pension af løn* — søgeintentioner værktøjet ikke kunne besvare, fordi det kørte med
  folkepensionens fulde beløb uanset samliv og indkomst. Autocomplete er et kvalitativt
  søgeintents-signal, ikke et volumenestimat.
- **Problem før ændring:** `PensionBeregner.tsx` kaldte `beregnFolkepension2026` med
  `samliv: "enlig", aarligIndkomst: 0`, så værktøjet altid viste 16.273 kr., selv om de
  indkomstgrænser, 46 %-reglen og tillægget på 4.467 kr. allerede lå i `src/lib/folkepension.ts`
  og var dokumenteret på siden. En bruger med fx ATP og arbejdsmarkedspension fik et tal,
  der var for højt, ud at vide hvorfor.
- **Beslutning/implementering:**
  - `beregnFolkepension2026` får et valgfrit `aarligSamleverIndkomst` og anvender den
    længe ubrugte konstant `samleverAndelMedRegel: 0.46` i selve funktionen. Resultatet
    får `indkomstGrundlag` og `samleverUdeladt`, så UI'en kan forklare reglen.
  - Værktøjet får fire nye felter: samlivsstatus, "er samleveren pensionist" (kun ved
    samlevende), egen årlig indkomst ud over arbejdsindkomst og samleverens. Alle er med i
    delelink-state og nulstilles af Reset.
  - Resultatet får en synlig opdeling: grundbeløb, fuldt tillæg, nedsættelsen som en rød
    linje, tillæg efter nedsættelse og i alt — med den anvendte sats og grænse i ord.
  - `/pension` fortæller nu, at beregneren bruger præcis de grænser, der står i tabellen,
    og den vage "ca. 13.000-15.000 kr/måned" i indledningen er erstattet af de kildeførte
    12.011/16.273 kr.
- **Faglig afgrænsning:** værktøjet regler stadig ikke ATP, arbejdsmarkedspension eller
  privat pension ind i folkepensionen — brugeren skal selv opgive dem som indkomst. Det står
  i note-teksten, og ATP-pension er ikke en del af folkepensionen (Kilde: borger.dk).
- **Verifikation 2026-09-25 21:31 CEST:** `npm run lint` grøn (485 filer), `npm run test`
  grøn (**1043/1043, 100 filer** — 6 nye lib-tests til de 16 eksisterende og 7 nye
  komponenttests), `npm run build` grøn (141 ruter, ingen nye advarsler). Komponenttestene
  dækker enlig uden indkomst (16.273), samlevende (12.011), nedsættelse ved 119.200 kr.
  (10.093), bortfald ved 500.000 kr. (7.544), 46 %-reglen (108.000 kr. holdt ude),
  pensionist-samlever (11.819) og delelink-roundtrip.
- **Acceptkriterier:**
  1. Værktøjet bruger aldrig 16.273 kr. som svar uden at sige hvorfor — grundbeløb, fuldt
     tillæg, nedsættelse og i alt står hver for sig, og tallene kommer fra
     `src/lib/folkepension.ts`. **PASS**
  2. 46 %-reglen anvendes i beregningen, ikke kun i prosa. **PASS** (nye lib-tests)
  3. Delelink og nulstilling bevares de nye felter. **PASS**
  4. Ingen ændring i beregningslogik for opsparingen, URL, canonical, hreflang, sitemap
     eller `/api/v1`; diffen rører kun folkepension-lib, beregner, pension-side og tests.
     **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **MÅL:** `/pension` Search Console baseline 4.001 visninger, 45 klik, CTR 1,1 %, pos. 12,2
  pr. 2026-09-23; Plausible 141 besøgende/28d, bounce 2 % pr. 2026-09-25. Sammenlign igen
  2026-10-09: se om "pensionsberegner" (var pos. 22) og "beregn pension" (var pos. 28) rykker,
  og at CTR'en ikke falder.
- **Landet:** kode og tests `b4f4dfc`, merge til `master` `a5a4c89` 2026-09-25 21:34 CEST.
- **Ikke gjort (bevidst):** ingen ny `/pensionstillæg`-side. Autocomplete-signalet er
  kvalitativt, og en tynd side om et emne, der allerede er fuldt dækket på `/pension`,
  kan skade domænet mere end det hjælper. Instrumentet er nu i stedet en sektion på
  `/pension` med synlige tal.

#### 23. [x] FÆRDIG 2026-09-25 — R1 — Rentefradrag: ét ratested, dokumenteret kilde og rettede modstridelser

- **Iteration start:** 2026-09-25 21:59. Datagrund: `/rentefradrag` 299 besøgende/28d
  (+149 %), Search Console 4.492 visninger, 219 klik, **CTR 4,9 %**, position 6,7 pr. 2026-09-23.
  CTR'en er altså ikke problemet; det var korrekthed og manglende kilde, som planen havde
  peget på.
- **Research 2026-09-25 (skat.dk hentet direkte):** skat.dk/borger/fradrag/fradrag-for-renter
  dokumenterer hvilke renter der kan fradrages, at banken indberetter dem automatisk, og
  hvordan fradraget fordeles mellem meddebitorer — men **ikke** procenttabellen. Den
  dokumenterede struktur (beløbsgrænsen på 50.000 kr. enlig / 100.000 kr. par, højere værdi
  under grænsen) er bekræftet af Borgerhåndbogs rentefradrag-side, som samtidig slår fast,
  at værdien **ikke** afhænger af kommunen og **ikke** stiger ved topskat, fordi
  rentefradraget er et kapitalindkomstfradrag. Bing/DuckDuckGo var blokerede for
  autocomplete, så procenttabellen er ikke fundet i en myndighedskilde (se ❓ Til Mads).
- **Fundne fejl (alle rettet):**
  1. `src/lib/satser-2026.ts` havde ratestedet **omvendt**: 25,6 % "under grænsen" og
     33,6 % "over grænsen", imod beregneren og den dokumenterede regel. Værdierne var
     desuden døde kode — ingen komponent importerede dem.
  2. `SkattefradragBeregner.tsx` havde sin **egen** kopi af satserne med samme omvendte
     betydning plus kommentaren "i visse kommuner", og regnede en flad 25,6 % — så
     `/skattefradrag` og `/rentefradrag` gav to forskellige tal for samme renteudgift.
  3. Prose på tre sider sagde, at fradragsværdien "afhænger af din kommune" (fejl) og
     FAQ'en på `/rentefradrag` kaldte den lave sats på 25,6 % for "høj" og omvendt.
  4. `/renteberegner` skrev "ca. 33 %" og "afhænger af lånetypen og året" og lovede
     3,35 % efter skat.
- **Beslutning/implementering:** Nyt `RENTEFRADRAG_2026` i `src/lib/satser-2026.ts` med
  ratser, beløbsgrænser, `officialRules` (skat.dk), `ratesReference` og `verifiedAt`,
  efter samme mønster som BARSEL_2026/BOLIGSTOETTE_2026. Nyt rent logik-modul
  `src/lib/rentefradrag.ts` med `beregnRentefradrag()` + 6 tests; begge beregnere bruger
  det nu, så de ikke kan glide fra hinanden igen. `SATSER_2026.rentefradragVaerdi*` er
  rettet til samme værdier og låst i `satser-2026.test.ts`. Prose, FAQ'er, tabel og
  metaDescription på `/rentefradrag`, `/renteberegner`, `/boliglaan`, `/skattefradrag` og
  `fradrag-2026-komplet-guide` er rettet til den dokumenterede regel med kilde +
  verificeringsdato. `/rentefradrag` linker nu tilbage til `/renteberegner`.
- **Bruger-facinge tal er uændrede på `/rentefradrag`:** 50.000 kr × 33,6 % + 30.000 kr ×
  25,6 % = 24.480 kr. Det var allerede korrekt; kun "ca."-hedge'en, kommune-påstanden og
  de modstridende steder er væk. `SkattefradragBeregner` giver nu 33,6 % op til 50.000 kr.
  (beregnet som enlig) i stedet for flad 25,6 % — det er en **ændret** besparelse dér.
- **Verifikation 2026-09-25:** `npm run lint` grøn (487 filer), `npm run test` grøn
  (1052/1052 tests, 101 filer), `npm run build` grøn (139 sider + typecheck). Lokal
  standalone-SSR-kontrol af `/rentefradrag` og `/skattefradrag` viser "33,6 %"/"25,6 %"
  med dansk decimalkomma, kilde-links til skat.dk og Borgerhåndbog (2 forekomster) og
  `/api/health` svarer `status: ok`.
- **Acceptkriterier:**
  1. Ét ratested for alle rentefradragstal — ✅ `RENTEFRADRAG_2026` bruges af begge
     beregnere, siden og bloggen; ingen lokale kopier findes (grep-verificeret).
  2. `SATSER_2026.rentefradragVaerdi` er 33,6 % og `...Hoej` 25,6 % — ✅ låst i test.
  3. Ingen "afhænger af din kommune"-påstand om fradragsværdien — ✅ fjernet på
     `/rentefradrag`, `/renteberegner` og bloggen.
  4. Kilde + verificeringsdato står på siden — ✅.
  5. Fuld gate grøn — ✅.
- **Forventet effekt:** Lille direkte trafikvirkning (CTR'en var allerede 4,9 %), men
  fjerner fire dokumenterede modstridelser på tværs af fem sider — tillidsværdi og
  lavere risiko for at nogen regeler efter de forkerte tal.
- **MÅL:** `/rentefradrag` baseline 299 besøgende/28d pr. 2026-09-25; Search Console
  4.492 visninger / 219 klik / CTR 4,9 % / pos. 6,7 pr. 2026-09-23 — genmål 2026-10-09.
- **Kendte huller bevidst ikke lukket:** `SkattefradragBeregner` har stadig egne,
  forældede lokale satser for kørselsfradrag (2,28/1,14 kr./km) og
  `kommuneskatSnit: 25.1`, som afviger fra `satser-2026.ts` (3,17/1,59 kr./km). Ikke rørt
  her, fordi det er en selvstændig matematikændring med tests — ny opgave.

#### 24. [x] FÆRDIG 2026-09-25 — K1 — Materialeberegning på `/kvadratmeter` (lukker C9's åbne del)

- **Iteration start:** 2026-09-25 22:13 CEST. Datagrund: Search Console 20.914
  visninger, 290 klik, **CTR 1,4 %**, position 5,0 pr. 2026-09-23; Plausible 376
  besøgende/28d (+103 %), bounce 6 % pr. 2026-09-25.
- **Problemfund:** Sidens egen tekst sagde "læg altid 5-10 % til for spild", men
  værktøjet kunne prissætte råt areal (`KvadratmeterBeregner.tsx` havde ingen
  materialelogik). Prose lovede altså noget, værktøjet ikke gjorde. Autocomplete
  (gulv, antal ens felter) og konkurrenten peger i samme retning; hjemmeland.dk's
  kvadratmeter-beregner anbefaler 10 % til gulvarbejder.
- **Beslutning/implementering:** Nyt rent logik-modul
  `src/lib/kvadratmeter-materialer.ts` (4 materialetyper: gulv, fliser, maling,
  tapet) med `beregnMaterialbehov()` og `beregnMaterialpris()`. Rækkefølgen er
  areal → antal ens felter → spild → afrunding **op** i hele enheder (liter,
  ruller); materialer, der sælges pr. m², giver areal i stedet for pakker.
  `KILDE` i modulet er kildeangivelse + `verifiedAt: 2026-09-25`.
  **Dækning pr. enhed er en redigerbar standardværdi, ikke en påstand** — den
  står på produktets eget datablad og afhænger af underlag og kvalitet, så den
  må ikke låses som en fast kendsgerning. UI'et siger det samme.
  `KvadratmeterBeregner` fik et "Beregn materialer"-afsnit med materialevalg,
  antal ens felter, spild %, dækning, pris pr. enhed/m² og et synligt svar
  ("Du skal købe 88 m² inkl. spild (8 m² spild)"). Delelink-state, reset og
  alle tre domæner (da/se/no) er følgt med. Sidens DA/SE-materialafsnit er
  opdateret med værktøjet, kilde-link og verificeringsdato, og den gamle
  "8-10 m² pr. liter" er rettet til "8-12" + produktets egen rækkevidde.
- **Verifikation 2026-09-25 22:20:** `npm run lint` grøn (489 filer),
  `npm run test` grøn (1.072 tests, 102 filer), `npm run build` grøn (139 sider +
  typecheck; de 7 kendte pre-existing CSS-advarsler). Lokal standalone-SSR-kontrol:
  DA `/kvadratmeter` viser "Beregn materialer", "Du skal købe 88 m² inkl. spild
  (8 m² spild)" for standard 10 x 8 m, `beraknare.se` viser "Beräkna material",
  "Du behöver köpa", "inkl. spill" og "Materialet säljs per m²", og
  `/api/health` svarede `status: ok`.
- **Acceptkriterier:**
  1. Værktøjet lægger spild på arealet og viser købsareal + spild i m² — ✅.
  2. Maling og tapet rundes op i hele liter/ruller, aldrig ned — ✅ testet.
  3. Antal ens felter ganges ind, før spild beregnes — ✅ testet.
  4. Nye tests med kant-til-fælde: 0/negative/NaN-areal, 0 % spild, decimalt
     antal felter, pris 0/negativ, præcis hel enhed — ✅ 20 tests.
  5. Kilde + verificeringsdato står på siden; dækning pr. enhed er redigerbar og
     ikke forklaret som en myndighedsfakta — ✅.
  6. Fuld gate grøn — ✅.
- **Forventet effekt:** `/kvadratmeter` er siden nr. 4 på DA-trafikken og vokser
  103 %; konkurrenten og autocomplete peger på materialer, som var hullet her.
  Værktøjet gør også siden troværdig, fordi den nu gør, hvad den siger. Direkte
  CTR-virkning er begrænset (C9 har allerede løftet titlen) — effekten er flere
  brugere, der bruger værktøjet længere, og færre, der går videre fordi tallene
  ikke passede til det, de skulle købe.
- **MÅL:** Search Console baseline 20.914 visninger, 290 klik, CTR 1,4 %, pos. 5,0
  pr. 2026-09-23; Plausible 376 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
- **Kendte huller bevidst ikke lukket:** BBR-opslaget på samme side er urørt
  (planens datagrense), og `daekningPrEnhedM2` for gulv er 0 fordi dansk
  parketgulv sælges i pakker pr. 2-6 m² med produktvarierende indhold — pakken
  kræver derfor et produktspecifikt tal, som værktøjet ikke kan gætte.

#### 25. [x] FÆRDIG 2026-09-25 — S1 — Skattefradrag: ét ratested og delt kørselsfradragssats

- **Iteration start:** 2026-09-25 22:44 CEST på `ceo/skattefradrag-rater`. Køen efter
  K1 var tom; næste punkt var ❓ Til Mads' dobbeltdefinition.
- **Problemfund:** `SkattefradragBeregner.tsx` havde sin **egen** `SATSER_2026`-konstant
  med kørselsfradrag på 2,28/1,14 kr./km og `kommuneskatSnit: 25,1` +
  `bundskat: 12,01` som rå procenttal, mens den fælles `satser-2026.ts` (med kilde
  skat.dk og låst test) siger 3,17/1,59 kr./km og 25,049 %/12,01 %. `/skattefradrag`
  og `/befordringsfradrag` har altså serveret to forskellige kørselsfradrag-sigter
  for den samme pendler, og ingen af delene lå i et testede logik-modul.
- **Research 2026-09-25 23:00:** kilderne modsiger hinanden, og ingen primær kilde
  kunne hentes: skat.dk's fradragssider er JS-renderede (webfetch får kun
  navigationen), og DuckDuckGo blokerer automatiske forespørgsler. Den
  sekundære kilde borgerhaandbog.dk angiver for 2026 netop **2,28 kr./km (25-120 km)
  og 1,14 kr./km over 120 km** samt 2,53 kr./km i udkantskommuner — altså tallene fra
  komponentens lokale konstant. Samme side er dog internt modstridende (den siger
  satsen er hævet 89 øre i 2026, hvilket forudsætter 1,39 kr. året før) og er
  desuden automatisk genereret (spansk "Ir al contenido" i navigationen), så den
  kan ikke bruges som grundlag for at ændre en sats. **Derfor er ingen sats ændret
  på baggrund af researchen** — kun dobbeltdefinitionen er fjernet.
- **Beslutning/implementering:** Ny `SKATTEFRADRAG_2026` i `src/lib/satser-2026.ts`
  med `verifiedAt`, kilder, lofterne og den 26 % boligfradragsværdi som navngiven
  konstant — og med en JSDoc, der siger hvilke tal der mangler en primær kilde.
  Nyt rent logik-modul `src/lib/skattefradrag.ts` (`beregnKoerselsfradragAar` +
  `beregnSkattefradrag`) overtager hele komponentens `useMemo`, så kørselsfradraget
  nu læser **samme** `koerselSatsLav/Hoej`, `koerselHoejGraense` og
  `koerselBundgraense` som `/befordringsfradrag`. `kommuneskatSnit`/`bundskat` er
  læst som decider (0,25049 + 0,1201) i stedet for som rå procenttal divideret med
  100. UI'et viser nu satserne og 120-km-grænsen, linker til `/befordringsfradrag`,
  og mærker håndværker-/servicefradragsfelterne som **vejledende**, fordi deres loft
  ikke er verificeret mod en myndighedskilde.
- **Bekræftet uændret adfærd:** 120-km-grænsen går ikke tabt mellem satserne
  (en ekstra km koster præcis den lave sats), arbejdsdage skalerer lineært, loftet på
  216 dage tænkes ikke over, `NaN`/negative/udokumenterede inputs giver 0 frem for
  `NaN`, fagforening klemmes til 7.000, a-kasse har intet loft, rentefradraget
  værdersættes efter sin egen to-trinssats (33,6 %/25,6 %) og ikke ved
  marginalskatten, og boligjob/servicefradrag har egen 26 %-værdi.
- **Resultatvirkning (dokumenteret, ikke skjult):** kørselsfradraget stiger for
  pendlere, fordi den fælles sats er 3,17/1,59 mod de gamle 2,28/1,14. Det er
  samme sats som `/befordringsfradrag` og samme sats som sidens øvrige copy, så
  uoverensstemmelsen forsvinder — men hvis Borgerhåndbogs 2,28/1,14 viser sig at
  være den officielle 2026-sats, er det **ét tal i én fil** (`SATSER_2026`), der
  skal rettes, og alle sider følger automatisk med.
- **Acceptkriterier:**
  1. Ingen `2,28`, `1,14` eller `kommuneskatSnit: 25.1` i `src/` — **PASS** (grep).
  2. `SkattefradragBeregner.tsx` indeholder ingen egne satser — **PASS**.
  3. `/skattefradrag` og `/befordringsfradrag` læser samme kørselssatser fra
     `SATSER_2026` — **PASS** (live-kontrol nedenfor).
  4. 18 nye tests dækker bundgrænse, 120-km-grænsen, lineær skalering, dagsloft,
     `NaN`/negative/udokumenterede input, lofter, fradragsværdier og poster — **PASS**.
  5. Kilde + `verifiedAt` i koden, og de uverificerede tal er mærket vejledende i
     UI og i JSDoc — **PASS**.
  6. `npm run lint`, `npm run test` og `npm run build` er grønne — **PASS**.
- **Kvalitetsgate 2026-09-25 22:53 CEST:** `npm run lint` grøn (491 filer),
  `npm run test` grøn (**1090/1090, 103 filer**), `npm run build` grøn
  ("Compiled successfully", 139 sider + typecheck; kun de 7 kendte CSS-advarsler).
  Lokal `next start` på port 3231: `/skattefradrag` serverede 200 med den nye
  note om manglende myndighedskilde og linket til `/befordringsfradrag` i DOM,
  `/api/health` svarede `{"status":"ok"}`.
- **Ærlighed om et afvigende resultat:** det første `npm run test`-kørsel efter
  ændringen meldte 6 fejl i én fil, som ikke kunne reproduceres i de tre følgende
  kørsler (1090/1090 hver gang), og filnavnet blev ikke fanget, fordi outputtet
  var tail'et. Det er derfor **ikke** dokumenteret som grønt eksisterende output:
  næste iteration bør køre `npm run test` med fuld output og se, om den samme fil
  fejler igen. Min egen nye testfil fejlede kun på grund af to fejlsatte
  forventninger (afrunding), som blev rettet — ikke på grund af kodelogikken.
- **MÅL:** `/skattefradrag` baseline: ingen Search Console-tal for siden i
  snapshotet; `/befordringsfradrag` og `/skattefradrag` skal begge give samme
  kørselsfradrag for samme pendler (kan efterprøves uden trafikdata). Effekten af
  den højere sats kan ikke måles isoleret fra CTR-arbejdet på `/skattefradrag`.
- **Kendte huller bevidst ikke lukket:** de to beløbsloft (12.400/6.200 kr.) og
  26 %-fradragsværdien er ikke verificeret mod en primær kilde; det står i ❓ Til
  Mads. Den forhøjede yderkommunesats (3,51 kr./km) tilbydes ikke i dette
  værktøj, fordi den kræver valg af kommune.



#### 26. [x] FÆRDIG 2026-09-25 — D2 — Børnetilskudssatserne for 2026 er verificeret og genindsat

- **Iteration start:** 2026-09-25 23:00 CEST. Kørte den øverste åbne opgave i køen,
  mens deployverificeringen venter på 07:30-vinduet 2026-09-26.
- **Datagrund:** `/blog/boernepenge-2026-satser-og-regler` (Search Console 5.145
  visninger, 27 klik, CTR 0,5 %, pos. 8,5 pr. 2026-09-23; Plausible 201→ dokumenteret
  af C10) havde tre rækker med "Se borger.dk" og "Særlig vurdering" i stedet for
  beløb. `/boernepenge` havde samme hul. Børnetilskud er en **egen ydelse** med egen
  side hos borger.dk og hører ikke i `borneungeydelse.ts`.
- **Kilde fundet:** https://www.borger.dk/familie-og-boern/Familieydelser-oversigt/boernetilskud
  (bemærk: den URL, artiklen linkede til med `barnetilskud` i stedet for
  `boernetilskud` under `Familieydelser-oversigt`, gav 404 — rettet). Læst
  2026-09-25 23:05 CEST.
- **Verificerede 2026-beløb (pr. kvartal):** ordinært 1.741 kr. pr. barn, ekstra
  1.774 kr. uanset antal børn, særligt børnetilskud ved adoption 5.025 kr.,
  flerlinger 2.874 kr. pr. barn ud over det første (tvillinger ét tilskud,
  trillinger to = 5.748 kr.), pensionist begge 1.741 + 5.025 kr., pensionist én
  4.449 kr. Dertil udbetalingsdatoer 20. jan./20. apr./20. juli/20. okt., fristerne
  31.12./31.3./30.6./30.9., enkeltårende svar senest 5. november (stop fra jan. 2027)
  og optjeningsprincip 6 år i 10.
- **Faglig rettelse:** artiklen påstod, at særligt børnetilskud "kræver en ansøgning og
  vurderes individuelt". Borger.dk siger, at det udbetales **automatisk**, når en enlig
  adopterer et barn. Påstanden er fjernet og erstattet af kildeført tekst.
- **Beslutning/implementering:** egen `src/lib/barnetilskud.ts` med
  `BARNETILSKUD_2026` (beløb, interval, skattefrihed, ansøgningskrav, aldersgrænse),
  `BARNETILSKUD_2026_KILDE` (kilde, `verifiedAt`, udbetalingsdatoer, frister, enkeltårende
  svar, optjening) og funktionerne `barnetilskudSats`, `flerlingBelob`,
  `enligtilskudPrKvartal`, `pensionistNedaettelse` (3 % over
  pensionstillægsgrænsen). Både artiklen og `/boernepenge` læser nu samme fil, så
  de ikke kan glide fra hinanden.
- **Ikke dækket, bevidst:** børnetilskud til forældre i praktik. Beløbet står et andet
  sted på borger.dk end den side, der er verificeret, så det er ikke med her.
- **Verifikation 2026-09-25:** `npm run lint` grøn (493 filer), `npm run test` grøn
  (1.107/1.107, 104 filer — heraf 17 nye i `src/lib/barnetilskud.test.ts`), `npm run build`
  grøn (139 statiske sider; kun de 7 kendte pre-existing CSS-advarsler).
- **Landet:** kode `b8c535e` på `ceo/barnetilskud-satser`, ff-merge til `master`
  2026-09-25 23:09 CEST.
- **Forventet effekt:** lille trafikvirkning (beløbbene er nye oplysninger på to
  eksisterende sider, ikke nye URL'er). Værdien er tillid: en kildeført artikel må
  ikke sende læseren videre med "Se borger.dk", og FAQ'en skal kunne besvare
  spørgsmålet om børnetilskud 2026 direkte.
- **MÅL:** `/blog/boernepenge-2026-satser-og-regler` Search Console baseline 5.145
  visninger, 27 klik, CTR 0,5 %, pos. 8,5 pr. 2026-09-23 — genmål 2026-10-09
  sammen med C10. `/boernepenge` har ingen Search Console-baseline i snapshottet.
- **Acceptkriterier:**
  1. Alle seks beløb står i `src/lib/barnetilskud.ts` med kilde og `verifiedAt`.
  2. Artiklen og `/boernepenge` viser beløbene med ét decimalkomma og kilde-link.
  3. Påstanden om at særligt børnetilskud kræver ansøgning er væk.
  4. 17 nye tests dækker beløb, flerlinger, samlet enligtilskud og nedsættelse.
  5. `npm run lint`, `npm run test` og `npm run build` er grønne.
- **Næste iteration:** live-verificér deploynoterne efter 07:30-vinduet 2026-09-26.

#### D2. Ny kandidat — børnetilskudssatserne er ikke verificeret nogen steder

- **Datagrund:** C10 fjernede de uverificerede "ca. 6.300/6.600 kr." fra artikel og
  side, fordi de ikke kunne verificeres. Børnetilskud er en egen ydelse med egen side
  på borger.dk og hører ikke i `borneungeydelse.ts`.
- **FÆRDIG 2026-09-25 som opgave 26** — børnetilskud 1.741/1.774/5.025/2.874/4.449 kr.
  pr. kvartal er nu verificeret, kildeført og genindsat i `src/lib/barnetilskud.ts`.
- **Scope:** hent borger.dk's Børnetilskud-side, verificér ordinært/ekstra/særligt
  børnetilskud for 2026, og læg dem i en egen `src/lib/barnetilskud.ts` med kilde og
  `verifiedAt`. Skal derefter genindføres i artikel og side.
- **Forventet effekt:** Fjerner et hul i en ellers kildeført artikel, men lille
  trafikvirkning. Lav prioritet — kun hvis en iteration ellers står uden bedre arbejde.

#### 27. [x] FÆRDIG 2026-09-26 — L1 — Ret de tre 404-interne links og vagt mod nye

- **Iteration start:** 2026-09-25 23:33 CEST. Kørte køens næste reelle opgave,
  mens deployverificeringen venter på 07:30-vinduet 2026-09-26.
- **Datagrund:** researchfund 6 fra 2026-09-23 fandt to reelle 404-links i
  blogindhold. Blogindlæg har desuden høj bounce (`/blog/barsel-2026-regler-og-satser`
  85 %), fordi læseren ikke får sendt videre til en beregner — en død link i den
  ende af rejsen er tabt trafik *og* tabt troværdighed.
- **Scope:** find **alle** statiske interne links i `src/`, ret de døde, og tilføj en
  test, så en død `href` ikke kan slippe gennem gaten igen.
- **Fund:** kun tre døde links på hele sitet, alle i blogindhold —
  `saadan-beregner-du-din-reelle-timeloen` linkede til `/bilberegner` (findes ikke)
  og `maanedsbudget-2026-komplet-guide` linkede to gange til `/huslejeberegner`
  (findes ikke). Korrekt rute er `/bil` ("Beregn biludgifter") og `/husleje`
  ("Beregn rimelig husleje"). `calculator-list.ts`' `relatedMap` har 0 døde links.
- **Beslutning/implementering:** `/bilberegner` → `/bil` med linkteksten
  "biludgiftsberegner", fordi `/bil` er den beregner, der viser kørselsomkostninger.
  De to `/huslejeberegner` → `/husleje`; linkteksten "Huslejeberegner" er stadig
  korrekt, fordi siden hedder "Beregn rimelig husleje".
- **Ny test `src/app/internal-links.test.ts` (3 tests):** (1) ingen statisk
  `href`/`src` i `src/` peger på en sti uden page/route, public-fil eller
  App Router-metadatafil; dynamiske segmenter (`[dato]`) tælles som vilde;
  (2) hver beregner i `relatedMap` findes i katalogen for `da`; (3) hver relateret
  beregner findes som rute. Skanner 494 filer på ~0,5 s.
- **Verifikation 2026-09-26 00:10 CEST:** `npm run lint` grøn (494 filer),
  `npm run test` grøn (1.110/1.110, 105 filer — de 3 nye er de eneste ændring),
  `npm run build` grøn (139 statiske sider; kun de 7 kendte pre-existing
  CSS-advarsler). Den nye test fangede de tre links, før de blev rettet.
- **Landet:** kode `4e84395` på `ceo/koerselsfradrag-kilde`.
- **Forventet effekt:** lille direkte trafikvirkning (to artikler linkede til 404),
  men permanent beskyttelse: en død intern link i en konverterende tekst er en
  dokumenteret skade på domænet, og vagten gør den umulig at genindføre.
- **MÅL:** `/blog/maanedsbudget-2026-komplet-guide` og
  `/blog/saadan-beregner-du-din-reelle-timeloen` har ingen Search Console- eller
  Plausible-baseline i snapshotet, så effekten måles ikke på disse to alene;
  den reelle måling er at 404-andelen på `/blog/*` ikke stiger.
- **Acceptkriterier:**
  1. `/bilberegner` og `/huslejeberegner` forekommer ikke længere i `src/`.
  2. Den nye test er grøn og ville have fanget de tre links.
  3. `relatedMap` har ingen døde links.
  4. `npm run lint`, `npm run test` og `npm run build` er grønne.

#### 29. [x] FÆRDIG 2026-09-26 — F1 — Forsidens populærrække følger de målte top-beregnere

- **Iteration start:** 2026-09-25 23:46 CEST. Kørte køens næste reelle opgave, mens
  deployverificeringen venter på 07:30-vinduet 2026-09-26.
- **Datagrund:** `/` er den største enkeltindgang (454 indgangsvisninger pr. 28 dage,
  219 besøgende, **41-44 % bounce** mod 2-7 % på beregnerne), og researchfund 6 fra
  2026-09-23 fandt, at forsiden hævder 44 beregnere, mens den faktiske danske katalog
  har 78. Snapshottet 2026-09-25 18:57 viser, hvad de 454 faktisk søger:
  DA `/dato` 1.029, `/bmi` 973, `/boligstoette` 519, `/kvadratmeter` 376,
  `/rentefradrag` 299, `/tidsberegner` 292, `/kalorier` 277, `/braendstof` 272.
- **Fund:** populærrækken på forsiden var `/loen-efter-skat`, `/bmi`, `/laaneberegner`,
  `/moms`, `/valuta`, `/procent` — altså **seks af de otte mest besøgte danske beregnere
  manglede**, mens løn, låne-, valuta- og procentværktøjet lå forrest. På beraknare.se var
  det værre: populærrækken var `/bmi`, `/moms`, `/laaneberegner`, `/valuta`,
  `/procent`, `/renteberegner`, `/lon-efter-skatt`, mens de faktiske svenske top-sider
  var `/tidsberegner` (141), `/dato` (116), `/leasing` (44), `/nedtaelling` (20) og
  `/tidszone` (15). `/nedtaelling` stod slet ikke på den svenske forside, selvom den er
  den tredjemest besøgte svenske beregner. SE-forsidens bounce var 71 % mod 3-8 % på
  kalkylatorerne.
- **Beslutning/implementering:** DA-populærrækken er nu de otte målte top-sider i
  faldende rækkefølge efterfulgt af `/loen-efter-skat`, der er sidens brandværktøj
  (9 kort = 3 rækker i eksisterende `lg:grid-cols-3`). SE-populærrækken er de fem målte
  svenske top-sider plus `/lon-efter-skatt`, og `/nedtaelling` er tilføjet med svensk
  titel/beskrivelse. `no` er bevidst urørt: der er ingen trafikdata for beregner.no.
  Tælleren er nu **afledt** i stedet for hardkodet: `getHomeCalculatorCount(locale)`
  tæller de filtrede lister (DA 49, NO 28, SE 31), og `{count}` interpoleres i
  `meta.description`, `hero.subtitle`, `trustSignals.calculators` og FAQ-svaret;
  `HomeContent` bruger samme funktion. Forsidens "44 beregnere" var altså ikke bare
  forældet — den var lavere end det, siden selv viste.
- **Ny test i `src/lib/home-data.test.ts` (2 tests):** (1) det synlige tal i
  badge/description/hero/FAQ er præcis `getHomeCalculatorCount(locale)` og der er ingen
  `{count}`-rest tilbage; (2) populærrækken indeholder de målte top-sider for DA og SE.
  Første test ville have fanget den forældede 44, da den nye liste har 49.
- **Verifikation 2026-09-26 00:05 CEST:** `npm run lint` grøn (494 filer),
  `npm run test` grøn (1.112/1.112, 105 filer — de 2 nye er de eneste ændring),
  `npm run build` grøn (139 statiske sider).
- **Forventet effekt:** lavere bounce på den største indgangsside, fordi de værktøjer
  folk faktisk bruger ligger i første skærmbillede i stedet for i kategorierne længere
  nede. På beraknare.se er effekten mindre i antal besøgende (485/28 dage) men
  forholdene er de samme som på den danske forside.
- **MÅL:** `/` DA baseline 219 besøgende/28d, 454 indgangsvisninger, bounce 41 % pr.
  2026-09-25 (og 214/44 % pr. 2026-09-23); `/` SE baseline 18 besøgende, bounce 71 %
  pr. 2026-09-25 — genmål 2026-10-09. Sekundært: bounce på `/` under 30 % DA.
- **Acceptkriterier:**
  1. DA-populærrækken er de otte målte top-sider + `/loen-efter-skat`.
  2. SE-populærrækken er de fem målte top-sider + `/lon-efter-skatt`, og `/nedtaelling`
     findes på den svenske forside.
  3. Det viste beregnerantal på forsiden er afledt af listen, så det ikke kan blive
     forældet igen, og der står ingen `{count}` i den serverede tekst.
  4. De 2 nye tests er grønne; `npm run lint`, `npm run test` og `npm run build` er grønne.

#### 30. [x] FÆRDIG 2026-09-26 — C12 — Svar-først på `/nedtaelling` + interne links til dage-til-siderne

- **Iteration start:** 2026-09-26 00:18 CEST. Deployverificeringen kunne ikke køre
  (07:30-vinduet er ikke passeret), så iterationen gik til den sidste dokumenterede
  lav-CTR-side i stedet for at skrive en plan-only iteration.
- **Datagrund:** Search Console beraknare.se 2026-08-26–2026-09-23: `/nedtaelling`
  4.609 visninger, 9 klik, **CTR 0,2 %, position 9,5**. Søgningerne er præcis den
  konkrete "hvornår"-intention, C7's dage-til-sider er bygget til: "nedräkning dagar"
  152v pos 9, "hur många dagar är det kvar till 1 december" 100v pos 10, "… 1 oktober"
  50v pos 7, "… 11 juni" 30v pos 8. Plausible: 20 besøgende/28d, bounce 4 % pr.
  2026-09-25. DA-siden er ikke i GSC-toplisten (altså under 4.000 visninger).
- **Fund:** siden var den tyndeste i den dokumenterede lav-CTR-klasse — 90 linjer, to
  korte afsnit, ingen eksempel, ingen tal og **ingen link til de syv dage-til-sider**,
  selv om C7 lagde dem i samme temaklynge. Den generiske H1 ("Nedtælling - hvor mange
  dage til?") lovede heller ikke svaret. `/dato` fik heller ingen backlink herfra.
- **Beslutning/implementering:** H1, intro, metaTitle, metaDescription, OG og
  schema er nu svar-først på den konkrete intention ("hvor mange dage er der til en
  dato?" / "hur många dagar är det kvar till ett datum?"). Siden har fået en
  **regeltabel** med 30/45/60/100/365 dage → hele uger + dage; alle tal er ren
  aritmetik (7 dage = 1 uge), så de kan aldrig blive forældede. Til sidst linker den
  til alle syv dage-til-sider med deres eget spørgsmål som linktekst, genereret fra
  `getDageTilEvents(locale)` + `getDageTilPrefix(locale)` — altså samme
  single source som siderne selv, så listen kan ikke glide fra hinanden — og videre til
  `/dato`. `no` får ingen dage-til-links, fordi domænet har ingen sådanne sider.
  Ny FAQ-post i begge sprog svarer på "hvor mange dage er der til jul?" med henvisning
  til den side, der tæller det ud dagligt.
- **Verifikation 2026-09-26 00:56 CEST:** `npm run lint` grøn (495 filer),
  `npm run test` grøn (**1.117/1.117 tests, 106 filer** — de 5 nye i
  `src/app/nedtaelling/page.test.tsx` er de eneste ændring), `npm run build` grøn
  (dynamiske ruter, ingen nye statiske sider).
- **Landet:** kode, tests og plan i commit `0bd5e7d` på `ceo/nedtaelling-svar-fort`.
- **Forventet effekt:** `/nedtaelling` er det naturlige stop for "nedräkning dagar",
  men havde intet indhold at ranke med og ingen interne links. For det første får den
  både svar-i-titlen og et emneanker til de syv dage-til-sider, hvilket også fordeler
  linkjuice den anden vej. Effekten er dokumenteret på ~4.600 visninger/28d, altså
  den mindste af CTR-opgaverne — den blev valgt, fordi den var den **sidste**
  dokumenterede, og fordi diffen er lille nok til at holde gaten grøn.
- **MÅL:** `/nedtaelling` SE Search Console baseline 4.609 visninger, 9 klik, CTR
  0,2 %, position 9,5 pr. 2026-09-23; Plausible 20 besøgende/28d, bounce 4 %
  pr. 2026-09-25 — genmål 2026-10-10. DA-baseline ukendt (ikke i top-15), ikke 0.
- **Acceptkriterier:**
  1. H1 og description lover det konkrete antal dage, ikke "værktøjet".
  2. Uger/dage-tallet står synligt med korrekt aritmetik i begge sprog.
  3. Alle syv dage-til-sider linkes fra siden med spørgsmålet som linktekst, hver med
     sit eget sprog og sin egen slug, og `no` får ingen.
  4. `/dato` backlink er til stede.
  5. 5 nye tests + fuld gate grøn.

#### 32. [x] FÆRDIG 2026-09-26 — C13 — Dobbelt domænesuffiks i `<title>` på kategori- og juridiske sider

- **Iteration start:** 2026-09-26 00:33 CEST. Deployverificering kunne ikke køre
  (07:30-vinduet er ikke passeret), så iterationen startede med den anden mulighed
  fra punkt 31: undersøge **placering og teknik** i stedet for klik.
- **Metode:** fuld crawl af begge live-domæners `sitemap.xml` — 119 DA-URL'er og
  57 SE-URL'er — med statuskode, titel, description-længde, H1-antal og canonical.
- **Resultat af crawlen (00:33-00:41 CEST):** 176/176 svarer **200**; ingen
  canonical afviger fra URL'en; ingen dubletter af titel; alle sider har præcis ét
  H1 og en description. hreflang er korrekt på begge domæner
  (`da`+`sv`+`x-default` med self-canonical), og `/dato/` → `/dato` gav 308 i
  sidste iterations kontrol. Teknikken er altså sund, bortset fra ét fund.
- **Fund:** `<title>` indeholdt **dobbelt domænesuffiks** på alle **ti**
  `/kategori/*`-sider ("… | MinBeregner.dk | MinBeregner.dk", 81-90 tegn) samt på
  `/privatlivspolitik` og `/cookiepolitik`. D1 (2026-09-25) rensede 27 sidetitler,
  men kun blogindlæg, `/blog` og `/embed` — kategorierne blev overset.
- **Årsag:** `src/app/layout.tsx:33` sætter `title.template = "%s | <siteName>"`,
  og de tre sider skrev selv `| siteName` ind i titlen. Den dobbelte tilføjelse
  lå i kilden, ikke i live-konfigurationen, så **fejlen ville være sendt live med
  næste batch** sammen med D1's rettelser.
- **Hvorfor ingen test fangede det:** `src/app/metadata-titles.test.ts` leder efter
  domænenavne i *streng-literaler* (`"… MinBeregner.dk …"`). Kode skrevet som
  `` `${category.title} | ${domainConfig.siteName}` `` er en interpolation og er
  usynlig for det regex. D1's egen regressionstest gælder desuden kun blogfiler.
- **Beslutning/implementering:** De tre sider sætter nu titlen uden domænenavnet, så
  layoutets template tilføjer det præcis én gang. `openGraph.title` er bevaret med
  domænenavnet, da OG-titler ikke gennemgår templaten. Kategorititlerne bliver
  21-24 tegn kortere. Der er **kun** ændret de tre titeludtryk — ingen faglogik, ingen
  sider, ingen URL'er.
- **Regressionstest (ny):** `src/app/title-suffix.test.ts` kalder `generateMetadata()`
  for alle ti kategorislugs og for begge juridiske sider på **alle tre domæner** og
  kræver, at titlen ikke selv indeholder `siteName`. Plus en ny kilde-scan i
  `metadata-titles.test.ts` der fejler på ethvert metadata-niveau-`title` (fire
  mellemrum) der interpolerer `siteName` uden `absolute` — det generelle mønster,
  også for fremtidige sider. **Begge vagter er verificeret til at fejle på den gamle
  kode** (5 fejlende tests) og grønne på den nye.
- **Kvalitetsgate 2026-09-26 01:05 CEST:** `npm run lint` grøn (496 filer),
  `npm run test` grøn (**1.124/1.124 tests, 107 filer** — de 6 nye i de to
  titel-filer er de eneste ændring), `npm run build` grøn (137 sider + typecheck;
  de 7 kendte, pre-existing `print:hidden`/`dark:`-CSS-advarsler er uændrede).
  Lokal production-server på :3111 bekræfter indholdskontrolleret output:
  `/kategori/bolig` → "Boligberegnere — Boliglån, Husleje & Ejendomsskat |
  MinBeregner.dk", `/kategori/sundhed` og `/kategori/matematik` samme mønster,
  `/privatlivspolitik` → "Privatlivspolitik | MinBeregner.dk", `/cookiepolitik` →
  "Cookiepolitik | MinBeregner.dk", `/procent` uændret. `/api/health` svarede
  `status: ok`.
- **Forventet effekt:** Kategorisiderne er landingssider i sitemap med prioritet 0,7.
  At fjerne 21-24 tegn fra en allerede 90 tegn lang titel giver alle ti en
  fuld title i snippet frem for en afkortet, og fjerner et tydeligt
  uprofessionelt dobbeltmærke. Effekten på placeringen er lille og dokumenteres ikke som
  trafikstigning — den er en kvalitets- og troværdighedsrettelse.
- **MÅL:** Ingen CTR-baseline for `/kategori/*` i snapshottet (siderne er ikke i
  GSC-top-15); ukendt, ikke 0. Kvalitetsmål: 0 sider med dobbelt domænesuffiks i
  `<title>` — nået i kilde og verificeret i build-output. Genmål ved næste
  live-kontrol 2026-09-26.
- **Acceptkriterier:**
  1. `<title>` på alle ti `/kategori/*` og begge juridiske sider indeholder
     domænenavnet præcis én gang, verificeret i den serverede HTML.
  2. `openGraph.title` og `siteName` er uændrede.
  3. Ny kilde-scan + ny renderingsvagt fejler på den gamle kode.
  4. `npm run lint`, `npm run test` og `npm run build` er grønne.
- **Sideobservation, ikke rettet:** `/procent` har **intet** domænesuffiks, fordi C1
  bevidst satte en svar-først-titel på 45 tegn. 62 af `page-data.ts`' øvrige
  `metaTitle` har suffikset hardkodet og bruger `title: { absolute: … }`. Det er
  inkonsistent, men ikke en fejl, og `/procent` er den vigtigste CTR-side, så
  den lades urørt. Bør afklares samlet med en senere metadata-opgave.

#### 33. Ny kandidat — `/pension` og `/arveafgift` serverer en forældet titel

- **Fund under C13's live-kontrol:** live `/pension` har titlen "Pensionsberegner -
  Beregn din fremtidige pension | **Beregner.dk**" og `/arveafgift` tilsvarende.
  Kilden siger `| MinBeregner.dk` (`src/lib/page-data.ts:1309,1431`), og ingen
  streng i koden indeholder `"Beregner.dk"` uden `Min`. `git log -S` peger på
  `5910b24`, som for længe siden afløstes af `MinBeregner.dk`.
- **Konklusion:** det er en **forældet build**, ikke en fejl i koden. Den forsvinder
  af sig selv, når næste batch deployer. Ikke en opgave — blot noteret, så en
  fremtidig iteration ikke fejlfinder den.

#### 31. Ny kandidat — de tre sidste tynde sider i CTR-klassen

- Efter C12 er **hele den dokumenterede lav-CTR-klasse dækket** på tværs af begge
  domæner: alle DA-sider i GSC-top-15 med position 5-10 er svar-først (C1-C11), og på
  SE er det samme sand for `/dato`, `/tidsberegner`, `/tidszone`, `/procent`, `/moms`,
  `/alder`, `/kalorier`, `/renteberegner`, `/braendstof` og nu `/nedtaelling`.
- Tilbage er kun to små SE-sider: `/vaegttab` (1.136 visninger, CTR 0,4 %, pos 8,3) og
  `/enhedspris` (1.081, 0,4 %, pos 6,1). Begge har **substans** (hhv. 4 og 2 afsnit med
  tal), så de er copy-arbejde, ikke indholdsarbejde, og effekten er lille.
- ~~den dokumenterede CTR-pool er udtømt~~ **er falsificeret 2026-09-26:** C15 fandt
  `/promille` i GSC-top-15 med position 7,9, som stadig havde den gamle
  produkt-titel. Læs konklusionen nedenfor som "næsten udtømt" — de to SE-sider er
  de eneste dokumenterede, ubearbejdede rest, hvis GSC- og Plausible-baselines
  bekræfter dem.
- **Vigtigere konklusion fra denne iteration:** den dokumenterede CTR-pool er
  næsten udtømt. Det betyder, at næste iteration enten skal (a) skaffe nye efterspørgselsdata
  — nye Search Console-søgninger pr. side, kun de 15 største sider er med i
  snapshottet — eller (b) gå efter **placering** frem for klik. Punkt (b) peger på
  `/procent` (148.882 visninger, position 7,5): siden har allerede formler,
  tricks-tabel og hverdagseksempler, så den mangler hverken copy dybde —
  den mangler sandsynligvis interne links fra beslægtede værktøjer.
  ~~Denne hypotese er falsificeret 2026-09-26: `/procent` har allerede 25+
  interne links, og svensk `/procent` er ikke dansk. Se D4.~~

#### 34. [x] FÆRDIG 2026-09-26 — C14 — Sitemap'en stemplede alle sider som "ændret nu" ved hvert kald

- **Iteration start:** 2026-09-26 01:03 CEST. Køen var tom (alle 33 opgaver
  færdige, intet `I GANG`), så valget var mellem at skaffe nye efterspørgselsdata,
  jeg ikke kan hente, eller et siteomfattende fund. Fund 6 fra researchen var det
  eneste *dokumenterede, urettede* siteomfattende problem, så det blev valgt.
- **Datagrund:** `minberegner.dk` har ca. 600.000 visninger/måned i Google med
  0,6 % CTR, altså et **crawl- og placeringsproblem** før det er et
  klikproblem. Sitemap'en er crawlens primære kort. Live `sitemap.xml` 01:05
  CEST: 119 URL'er, **alle** med `<lastmod>2026-09-25T23:05:26.464Z</lastmod>` —
  ét identisk klokkeslæt for hele sitet.
- **Rodårsag (værre end researchfund 6 beskrev):** `buildSitemap` fik
  `lastModified = new Date()` som **standardværdi**, og ruten er `ƒ (Dynamic)`
  — bekræftet i build-output — fordi `getCurrentDomainConfig()` læser headers.
  `new Date()` blev derfor evalueret **ved hvert request**, ikke ved hvert build.
  Hver eneste Googlebot-hentning af sitemap'en sagde altså "alle 119 sider
  blev netop ændret", uanset at intet var ændret. Det er præcis det signal,
  Google dokumenterer at ignorere, når det ikke kan bekræftes, så det gjorde
  `lastmod` værdiløst for de ~110 sider, der *kun* ændrer sig ved deploy, og
  modarbejdede samtidig `changeFrequency: "monthly"`.
- **Beslutning:** ikke en hårdkodet dato pr. side. En sådan manifest er
  vedligeholdelsesfælden: en ny tekstændring ville ikke opdatere den, og
  `lastmod` ville stå fast for evigt, hvilket er farligere end at springe den
  over. Google anbefaler at `lastmod` **udelades**, når den ikke kan holdes
  præcis. Derfor: `lastmod` udledes kun for den gruppe, der reelt ændrer sig
  uden deploy — `dailyUpdates` (`/valuta`, Nationalbanken-kurser) og
  dage-til-siderne, hvis svar genberegnes pr. request. Alle øvrige entries
  udelader feltet. `changeFrequency` er uændret og dermed stadig sand.
- **Verifikation 2026-09-26:** `npm run build` grøn (137+2 sider; kun de 7 kendte
  pre-existing CSS-advarsler), `npm run test` grøn (1127/1127, 107 filer),
  `npm run lint` grøn (496 filer). 3 nye tests i `src/app/seo-routes.test.ts`:
  stabile sider har intet `lastmod`, dagssiderne har præcis det passede klokkeslæt,
  og to builds med forskellige klokkeslæt er identiske for de stabile entries.
  End-to-end mod rigtig standalone-server: DA 126 URL'er / **8** med `lastmod`
  (`/valuta` + 7 dage-til), SE 64 URL'er / 8, og to hentninger 3 s fra hinanden
  er identiske når `lastmod` fjernes. Før var det 119 af 119.
- **Forventet effekt:** indirekte. Det flytter ingen side i rankingen i sig selv,
  men det genopbygger det eneste ferskhedssignal, Google har til de ~110 sider,
  der ændrer sig ved deploy (C1-C13, O1-O5), og det fjerner et dagligt crawl-
  støjssignal på hele domænet. Målbar via Search Console: "Sidens senest
  gennemskiftede" og crawl-statistikken, ikke via CTR.
- **MÅL:** `/sitemap.xml` DA 119 URL'er med 119 `lastmod` (ét identisk
  klokkeslæt) pr. 2026-09-26 01:05 CEST → mål 126 URL'er med 8 `lastmod` pr.
  2026-10-10. **Ingen sidebaseret baseline**: denne opgave ændrer ingen enkeltside,
  så den skal måles i Search Consoles crawl-rapporter, ikke i Plausible.
- **Acceptkriterier:**
  1. Ingen entry uden for `/valuta` og dage-til-siderne har et `lastmod`-felt.
  2. `/valuta` og alle dage-til-sider har `lastmod` og `changeFrequency: "daily"`.
  3. To sitemap-kald på forskellige tidspunkter er byte-identiske for de
     stabile entries.
  4. Ingen reducering af URL-antal, og hverken `robots.txt` eller
     `/api/v1`-kontrakten er rørt.
  5. `npm run lint`, `npm run test` og `npm run build` er grønne.

#### 35. [x] FÆRDIG 2026-09-26 — D5 — `/dato` tæller helligdage i arbejdsdage

- **Iteration start:** 2026-09-26 04:30 CEST. Denne iteration startede med
  ucommittet arbejde i træet fra en tidligere kørsel (helligdage i
  `DatoBeregner`), som aldrig blev committet eller noteret. Det blev fundet
  ved `git status` og landet på `ceo/dato-helligdage` i stedet for at blive
  smidt væk.
- **Datagrund:** `/dato` er sitets stærkeste side: 1.045 besøgende/28d (+76 %),
  963 indgangssider, bounce 5 %, og 129.188 visninger i Search Console med
  0,6 % CTR på position 5,8. Søgningerne er konkrete: "dage mellem datoer"
  448 visninger/10k pos 5, "antal dage mellem to datoer" 247/5k pos 5 og
  **"hvor mange dage er der tilbage af 2026"** 212/2k pos 5.
- **Det dokumenterede gap, der lå bag betingelsen i køen.** Køen sagde
  "Ingen ændring før et konkret søgeintentionsgap kan dokumenteres". Gapet er
  ikke et CTR-gap men et **korrekthedsgap**: siden skrev selv
  *"Beregneren tager ikke højde for helligdage"*, og `DatoBeregner` sprang
  kun lørdag/søndag over. Ethvert interval med en helligdag gav et **forkert**
  arbejdsdagstal, og det gælder især de helårs- og julesøgninger, der udgør en
  stor del af `/dato`'s søgninger. Konkurrenten iKalender tilbyder
  arbejdsdage *med* helligdager, så vores side var den mindre korrekte.
- **Beslutning:** nyt `src/lib/helligdage.ts` som **én** kilde til
  helligdage med `HelligdagLocale = "da" | "se"`, dækket af 41 tests.
  Påske (og dermed skærtorsdag, langfredag, påskedag, 2. påskedag og kristi
  himmelsfærd) udledes af den eksisterende gregoriske algoritme i
  `src/lib/dage-til.ts`, så de to ikke kan glide fra hinanden. Store bededag
  er bevidst **uden** i listen (afskaffet som helligdag fra 2024, testet
  eksplicit for både 2023 og 2024). Nytårsaften er heller ikke en helligdag,
  men er en arbejdsdag-fritagelse, og det er kodet som en sådan.
- **Rettelse fundet undervejs (væsentlig):** den ucommittede kode regnede
  "Weekenddage" som `dage minus arbejdsdage`, hvilket også tæller helligdage
  og nytårsaften. En løbet over juleugen 2026 ville have vist "3 weekenddage",
  selv om 2. juledag er en lørdag. Derfor er `taellWeekender` tilføjet, så
  weekend, helligdag og arbejdsdag er tre **disjunkte** tal. Ved negativt
  antal arbejdsdage vendes intervallet, før de to tællere kører.
- **Ændrede også svensk `/dato`.** Den svenske FAQ sagde *"Helgdagar är inte
  inkluderade"*, hvilket blev **falsk** af denne ændring, og SE har 84.021
  visninger med 0,1 % CTR på position 8,4. Beskrivelse, meta, OG, keywords og
  to FAQ-svar er nu på linje med den nye adfærd, med Sveriges rödagar
  opregnet og midsommar og alla helgons dag noteret som "den lørdag de
  indtræffer på".
- **Verifikation 2026-09-26 04:35:** `npm run build` grøn (137+2 sider, kun de
  7 kendte pre-existing CSS-advarsler), `npm run test` grøn (**1169/1169**,
  108 filer), `npm run lint` grøn (498 filer). 41 nye tests i
  `src/lib/helligdage.test.ts`, bl.a. at påskedagen er en søndag og
  skærtorsdag en torsdag for hvert år 2024-2045, at 2026 har 253 danske
  arbejdsdage, og at hverdage minus arbejdsdage i december 2026 er præcis
  24./25. december og 31. december.
- **Kendte advarsler, ikke rørt:** `beregner.no` er **ikke live** (404 på både
  `/` og `/api/health`, og den står i `hiddenDomains`), så den norske
  `page-data` er urørt. `helligdagLocale()` mapper alt ikke-`se` til `da`, så
  hvis `beregner.no` nogensinde slås til, skal den have sit eget norsk
  helligdagssæt: skærtorsdag er ikke norsk helligdag, grundlovsdag findes
  ikke, og 17. maj er helligdag. Noteret, ikke løst — se ❓ Til Mads.
- **Forventet effekt:** `/dato` er position 5-6 på fire konkrete søgninger med
  ~129.000 visninger. Værktøjet går fra at være *fejltagende* til at være det
  mest komplette danske datoværktøj på de søgninger, og FAQ'en rammer nu
  eksplicit "helligdage 2026". Effekten er først og fremest korrekthed og
  genbrugssignal, ikke et direkte CTR-løft.
- **MÅL:** `/dato` DA baseline **1.045 besøgende/28d**, 963 indgangssider,
  bounce 5 % pr. 2026-09-26. Search Console baseline 129.188 visninger,
  789 klik, CTR 0,6 %, position 5,8 pr. 2026-08-26 til 2026-09-23.
  `/dato` SE baseline 119 besøgende/28d (+644 %) pr. 2026-09-26; Search
  Console 84.021 visninger, 82 klik, CTR 0,1 %, position 8,4.
  **Genmål 2026-10-10.**
- **Acceptkriterier:**
  1. Arbejdsdage, weekenddage og helligdage er tre disjunkte tal i UI'et.
  2. Dansk liste = de ni officielle 2026-helligdage på de rigtige datoer.
  3. Svensk liste = Sveriges rödagar, med midsommar og alla helgons dag på
     en lørdag.
  4. Ingen FAQ, beskrivelse eller sidetekst siger længere, at helligdage
     ignoreres.
  5. `npm run lint`, `npm run test` og `npm run build` er grønne.

#### 36. [x] FÆRDIG 2026-09-26 — S2 — Ret fire dokumenterede fejl i `/blog/skat-2026-alt-du-skal-vide`

- **Iteration start:** 2026-09-26 05:04 CEST. Køen var tom (alle 35 opgaver `[x]`, intet
  `I GANG`), og 07:30-deployvinduet var ikke passeret, så intet kunne verificeres. Valget
  blev planens **eget** næste CTR-kandidat: "`/blog/skat-2026-alt-du-skal-vide` og de
  øvrige artikler med samme sats-spørgsmålmønster som børnepenge-artiklen".
- **Datagrund:** artiklen er sitets mest generelle skatteemne og matcher konkrete
  sats-intents (`rentefradrag 2026` 327 visninger/54k pos 2,
  `børnepenge 2026` 986 visninger/3k pos 9). **Artiklen har ingen baseline** i
  snapshottet — den ligger ikke i GSC-top-15, så effekten på CTR kan ikke isoleres
  måles; grunden til at gøre den er fejlene, ikke en trafikprognose.
- **Fire fejl, alle dokumenteret i repoets egne ratesteder (ikke gæt):**
  1. **Kirkeskat "ca. 0,88 %"** mod `SATSER_2026.kirkeskatSnit = 0,00639` (SVMN,
     verificeret 2026-08-24) — 0,24 procentpoint for højt, og "ca." dækkede ikke afstanden.
  2. **Håndværkerfradrag "op til 12.900 kr"** mod `SKATTEFRADRAG_2026.haandvaerkerMax = 12.400`
     (borgerhaandbog.dk, verificeret 2026-09-25) — og servicefradragets særskilte loft på
     6.200 kr manglede helt.
  3. **A-kasse "op til 7.000 kr"** — 7.000 kr er loftet for **fagforening**
     (`SKATTEFRADRAG_2026.fagforeningMax`); A-kasse kan trækkes fuldt uden loft, hvilket
     både `page-data.ts` og beregneren allerede siger. Artiklen havde det omvendt.
  4. **Regneeksemplet hang ikke sammen.** Trinnene gav 40.000 − 3.200 − 3.878 − 8.105 −
     1.100 ≈ 23.717 kr, mens konklusionen sagde "ca. 26.000-27.000 kr", og kirkeskat var
     slet ikke med. Med beskæftigelsesfradraget som grundlagsnedsættelse — præcis som
     `LoenBeregner.tsx:101-108` gør — bliver korrekt svar **26.395 kr/md**.
- **Beslutning/implementering:** Alle tal læses nu fra `SATSER_2026` og
  `SKATTEFRADRAG_2026`, som C8/C10/C11/R1/S1 har gjort det mønster for, så artiklen ikke
  kan glide fra `/loen-efter-skat`, `/skattefradrag` og `/rentefradrag`. Eksemplet er
  beregnet i modulen med samme formel som løn-beregneren. Kilder + verificeringsdato står
  under tabellen (skat.dk, skm.dk, SVMN) og under fradragslisten (borgerhaandbog.dk), og
  kørselsfradraget er mærket **vejledende**, fordi primærkilden ikke kan hentes maskinelt
  (jf. S1 og ❓ Til Mads). Titel, description, H1 og indledning er svar-først med
  personfradrag og bundskat. Uden kilde kunne vi ikke dokumentere 2025-tallene, så
  "Hvad ændrede sig fra 2025 til 2026?" er erstattet af "De vigtigste punkter for 2026" med
  en eksplicit note om hvorfor vi ikke sammenligner år. Marginalskatten er rettet fra
  "op til ca. 55 %" til de afledte **57,7 %**. Artiklen linker nu til `/skattefradrag` og
  `/befordringsfradrag` ud over de tre den allerede havde.
- **Acceptkriterier:**
  1. `0,88`, `12.900`, `25,1%`, "op til 7.000 kr for A-kasse", `51.600`,
     `200-500 kr` og `26.000-27.000` forekommer ikke i den serverede HTML. **PASS**
  2. Siden viser 25,049 %, 0,639 %, 12,75 %, 63.300 kr, 12.400 kr, 6.200 kr,
     3,17/1,59 kr./km og A-kasse "uden loft". **PASS**
  3. Nettoudbetalingen i eksemplet er 26.395 kr/md og følger samme formel som
     `LoenBeregner`. **PASS**
  4. Kilder + verificeringsdato er i DOM, og `/skattefradrag` + `/befordringsfradrag`
     linkes. **PASS** (5 nye tests i `page.test.tsx`)
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 05:10 CEST:** `npm run lint` grøn (499 filer),
  `npm run test` grøn (**1175/1175**, 109 filer), `npm run build` grøn (139 sider +
  typecheck; kun de 7 kendte pre-existing CSS-advarsler). Målrettet gate først: 5/5 nye
  tests grønne ved første kørsel.
- **MÅL:** `/blog/skat-2026-alt-du-skal-vide` — **baseline ukendt** (ikke i GSC-top-15,
  ikke i Plausible-top-15). Skal ikke opfindes som 0. Næste snapshot etablerer baseline;
  sammenlign først efter 14 dage.
- **Forventet effekt:** først og fremmest korrekthed på sitets mest generelle
  skatteartikel — fire tal og et regneeksempel var forkerde eller uholdbare. Ingen
  dokumenteret CTR-effekt, fordi der ikke er en baseline.
- **Landet:** kode og tests i `c273317`; merge til `master` `a563e74` 2026-09-26
  05:14 CEST. Begge refs pushet.

#### 38. [x] FÆRDIG 2026-09-26 — S3 — Fradrag-2026-guiden læser satserne fra det delte modul

- **Iteration start:** 2026-09-26 05:20 CEST. Køen var tom (36 opgaver færdige), så
  valget var kandidat 37: de sats-tunge blogartikler med samme fejltype som S2.
  `/blog/fradrag-2026-komplet-guide` var den dokumenterbare: den var den eneste
  sats-artikel, S1/R1 netop havde ændret under sig.
- **Fund (opgaven startede som en baselines-hvis-opgave, blev en fejlopgave):**
  1. **Tre forskellige kørselsfradrag-sæt i repoet.** Artiklen sagde 2,23/1,12 kr./km,
     `SATSER_2026` siger 3,17/1,59 (kilde: skat.dk, ifølge S1) og en dansk
     sekundærkilde siger 2,28/1,14. Artiklens tal fandtes i **ingen** kilde.
  2. **Tredje håndværkerfradrag-tal:** artiklen sagde 12.900 kr., modulet siger
     12.400/6.200 kr. — og artiklen blandede de to ordninger sammen ved at liste
     maling/tapetsering (almindeligt vedligeholdelse) under ét fradrag.
  3. **Faktuel fejl om transportmiddel:** artiklen skrev, at befordringsfradraget
     "gælder uanset transportmiddel (bil, tog, cykel)". Befordringsfradrag kræver
     befordring i motorkøretøj (LL § 9 a) — cykel, bus og tog giver intet fradrag.
     Vores eget `SATSER_2026` har kun lavere bro-satser for tog/Offentlig
     (`koerselBroStorebaeltOff`), altså samme forståelse i koden.
- **Scope holdt small:** kun artiklen + en vagt-test. Ingen ny beregner, ingen
  ændring af `SATSER_2026`' tal (det er ❓-sagen, se nedenfor), ingen ændring af
  `/skattefradrag` eller `/befordringsfradrag`.
- **Beslutning/implementation:** artiklen importerer nu `SATSER_2026`,
  `RENTEFRADRAG_2026` og `SKATTEFRADRAG_2026` og formatterer alle beløb/satser
  gennem `formatNumber`, så den ikke længere kan glide fra værktøjerne. De to
  uverificerede områder (kørselsfradrag-sats, håndværker-/servicefradrag-loft) er
  mærket **vejledende** med kildebegrundning, præcis som S1 gjorde i UI'en.
  Håndværkerfradrag og servicefradrag er nu to separate ordninger med hvert sit loft,
  og artiklen har et nyt link til `/befordringsfradrag`.
- **Harness:** ny `src/app/blog-rates.test.ts` (13 assertions) som fejler, hvis
  artiklen igen indeholder en af de ni forældede tekstliteraler (2,23 / 1,12 /
  12.900 / 33,6 / 25,6 / 68.700 / 63.300 / 54.100 / 7.000) eller hvis den
  slutter at importere satsmodulet. Det er S2-fejltypen som permanent regel.
- **Verifikation:** `npm run lint` grøn (500 filer), `npm run test` grøn
  (1186 tests / 110 filer), `npm run build` grøn (137 sider + typecheck).
- **MÅL:** `/blog/fradrag-2026-komplet-guide` — **baseline ukendt**: artiklen er
  ikke blandt de 15 største i Plausible- eller GSC-snapshottet, så effekten kan
  ikke måles pr. besøgende. Det er skrevet op under ❓ (kræver GSC-side-tal for
  `/blog/*`); indtil da måles effekten kun som færre 404-/modstridelses-risici.
- **Forventet effekt:** artiklen er linked fra tre relevante sider, så en læser
  der rammer den ikke længere får et tal, der modsiger vores eget værktøj. Det er
  en tillids- og korrekthedseffekt; den tælles ikke som trafikvækst.
- **Kilder:** borgerhaandbog.dk/skat-og-personlig-oekonomi/haandvaerkerfradrag
  (sekundær, hentet 2026-09-26), Ligningsloven § 9 a, `SATSER_2026`.

#### 37. Ny kandidat — blogartikler med det samme sats-mønster mangler baseline

- S2 viste, at samme fejltype kan sidde i de øvrige sats-artikler. Bloggen har 27 artikler,
  men GSC-snapshottet viser kun `/blog/boernepenge-2026-satser-og-regler` (C10, færdig)
  og intet for `/blog/skat-2026-alt-du-skal-vide`. **Uden en baseline kan effekten af en
  ny artikels CTR ikke måles**, og det er derfor S2 blev en korrektionsopgave.
- Næste skridt er derfor **ikke** flere artikler blindt, men en baseline for de største
  artikler. GSC-top-15 for artikler mangler i prompt-snapshottet; Mads kan levere det, eller
  vi kan bruge Plausible-artikeltallene ved næste snapshot.
- Kandidater der bør gennemgås med samme metode som C10/S2, når de har en baseline:
  `/blog/arveafgift-regler-og-satser` (92-103 besøgende/28d, faldende),
  `/blog/fradrag-2026-komplet-guide` (den rørte alle fradrag, som S1/R1 netop rettede),
  `/blog/su-2026-satser-og-regler` (**lukket som C20 2026-09-26, se opgave 46** —
  ingen fagfejl fundet, men tre officielle tal manglede) og
  `/blog/pension-hvor-meget-skal-du-spare-op` (**lukket som C18**).
  **Kandidaten er dermed lukket**; se "Næste CTR-kandidat" for hvad der
  kan måles nu.


- **`/procent` mangler interne links** (hypotesen fra kandidat 31) er **forkert**:
  `/procent` har allerede 25+ interne links fra beslægtede værktøjer via
  `RELATED_CALCULATORS` i `src/lib/calculator-list.ts:145-219`, inkl. `/moms`,
  `/rabat`, `/renteberegner`, `/boliglaan`, `/kvadratmeter`, `/valuta` og
  `/brok`. Linkstætheden er ikke det, der holder siden på position 7,5.
- **Svensk `/procent` er dansk tekst** (den locale-leak, researchfund 4
  beskriver generelt) er **forkert for denne side**: `sePages["procent"]`
  (`src/lib/page-data.ts:3042-3062`) er fuldstændig svensk, svar-først med
  "10 procent av 250 är 25", dvs. C1 dækkede begge domæner. SE's 21.843
  visninger / 2 klik / CTR 0,0 % / pos. 10,3 er et **før-C1-baseline** og
  må ikke bruges som dokumentation for et stadig eksisterende problem.
- **"Sitemap-lastmod" som blot et uvigtigt fund** er **undervurderet**: det var
  ikke et build-tidsproblem, men et request-tidsproblem, der træffer Googlebot
  på hvert eneste kald. Se C14.

#### D3. Nyt fund 2026-09-26 — `www.minberegner.dk` og `www.beraknare.se` findes ikke

- Live-kontrol 2026-09-26 00:21: `https://www.minberegner.dk/procent` og
  `https://www.beraknare.se/procent` svarer **404 med `text/plain` og 19 bytes fra
  Cloudflare** — altså uden om Next.js nogensinde ser requesten. `www.beregner.no`
  svarer slet ingen forbindelse. Til sammenligning svarer apex-domænerne 200, og
  `http://` → `https://` giver korrekt 301, og `/dato/` → `/dato` giver 308.
- **Konsekvens:** ethvert eksternt link, bogmærke eller indtastet `www`-adresse er
  dødt og giver ingen linkværdi. Det er en reel, men uvis tabstørrelse — der er ingen
  dokumenteret indgående `www`-trafik, og Direct/None (983/28d) er ikke opdelt på
  vært.
- **Kan ikke rettes herfra:** det kræver en DNS/CNAME for `www` plus en Traefik-router
  i Dokploy. DNS- og domæneændringer er i projektets "Danger Zones" og kræver et
  eksplicit ja. Skrevet under ❓ Til Mads.


- ❓ Til Mads' punkt om kørselsfradraget blev undersøgt igen 2026-09-25 23:33-23:50
  i stedet for at gætte. Resultat: **ingen primærkilde fundet, intet tal ændret.**
- Prøvede kilder: `skat.dk/borger/fradrag/koerselsfradrag` (JS-renderet, ingen
  maskinel tekst), `info.skat.dk`' juridiske vejledning (kun en ASP.NET-side med
  `__VIEWSTATE`-POST-søgning, og `oid`-sweep 1921030-1921125 gav ingen
  kørselsfradrag-side), `retsinformation.dk` (Cloudflare-gate) og
  Bing/DDG/Mojeek (bot-gates). `info.skat.dk`' **juridiske vejledning 2026-2**
  findes og er maskinel læsbar — den skal bruges, når den kan søges i.
- Konklusion: 3,17/1,59 kr./km står uændret, fordi de ikke kan dokumenteres
  lige nu, og 2,28/1,14 forbliver ude. Markeret som "vejledende" i UI, som S1
  allerede gjorde. Næste forsøg bør ramme `info.skat.dk`' søgning med en
  rigtig browser-session eller JV' PDF-udgave, ikke robots-gatede søgemaskiner.

- **Håndværkerfradragets og servicefradragets 2026-loft (S3, nyt fund 2026-09-26) —
  tre kilder, tre tal.** Vores `SKATTEFRADRAG_2026` siger 12.400 kr. (håndværker) og
  6.200 kr. (service) og er mærket vejledende. Den fradragsguide, der allerede står som
  kilde i modulet, siger derimod **9.000 kr. pr. person for håndværkerfradraget — kun
  grønne/energibesparende arbejder** — og **18.300 kr. pr. person for servicefradraget**
  (rengøring, havearbejde, børnepasning), hentet 2026-09-26. Den siger desuden
  udtrykkeligt, at maling/tapetsering/køkkenudskiftning **ikke** er omfattet i 2026.
  Borgerhåndbog er en sekundærkilde (med tydelige oversættelsesrest-fejl på siden),
  så jeg har **ikke** ændret modulet. Er tallene rigtige, er det ét par tal i
  `SKATTEFRADRAG_2026`, og både `/skattefradrag` og artiklen følger automatisk med.
  Bemærk at artiklens gamle "18.300 kr." stod under **velgørenhedsfradrag** — det er
  måske en sammenfaldning med servicefradragets beløb, så det tal er også
  uverificeret og bør efterprøves.
- **GSC-side-tal for `/blog/*` (S3):** snapshottet viser kun
  `/blog/boernepenge-2026-satser-og-satler`, så de øvrige artikler har ingen
  baseline og deres effekt kan ikke måles. En liste over de 15 mest viste
  `/blog/*`-sider med visninger, klik, CTR og position gør kandidat 37 målbar.

#### 39. [x] FÆRDIG 2026-09-26 — C15 — Svar-først på `/promille` (sidste ubearbejdede DA-side i CTR-klassen)

- **Iteration start:** 2026-09-26 07:52 CEST. Først blev alle 21 åbne deploynoter
  lukket ved indholdskontrol efter 07:30-vinduet (se `DEPLOY OK 2026-09-26`), derefter
  blev den næste dokumenterede opgave taget.
- **Datagrund:** Search Console 2026-08-27–2026-09-24: `/promille` 4.159 visninger,
  60 klik, **CTR 1,4 %, position 7,9**. Søgninger: "promille beregner" 1.038 visninger
  (position 9), "promilleberegner" 170 (position 6), "beregn promille" 101
  (position 11), "beregn alkoholpromille" 16 (position 9). Det er den **eneste** side i
  GSC-top-15 for minberegner.dk med position 5-10, som ikke var svar-først — kandidat
  31's påstand om en udtømt pool var derfor forker.
- **Research 2026-09-26 08:05 CEST:** Google Autocomplete for `promille`,
  `promille beregner`, `beregn promille` og `promilleberegner` (dansk klient) gav
  "promillegrænse danmark", "promille beregner fald", "promille beregner hvornår må
  jeg køre", "promille beregner formel", "beregn promille dagen efter" og
  "beregn din promille". Autocomplete er et kvalitativt intents-signal, ikke
  volumen; ingen aktuel Google-placering eller PAA-rangering er udledt af det.
  Løftet er altså ikke bare "beregn", men **hvad bliver promillen for et konkret
  antal øl, og hvornår må jeg køre igen**.
- **Scope:** Kun DA- og SE-side-data, én ny FAQ og tests. Ingen ændring af
  `beregnPromille`, `PromilleBeregner`, URL, canonical, hreflang, sitemap eller
  public API.
- **Beslutning/implementering:** Titel, description, OG og schema er nu svar-først på
  det samme eksempel, som `beregnPromille(4, 80, "mand", 0)` faktisk returnerer:
  0,88 ‰. DA: "Promilleberegner: 4 øl på 80 kg = 0,88 ‰" (40 tegn) med synlig intro
  "4 øl til en mand på 80 kg giver 0,88 ‰."; SE: "Promillekalkylator: 4 öl på 80 kg
  = 0,88 ‰" (42 tegn) med "4 öl till en man på 80 kg ger 0,88 ‰.". Begge
  descriptions er ≤160 tegn, og begge nævner den **locale-specifikke** grænse
  (0,5 ‰ DA / 0,2 ‰ SE), så svensk copy ikke lovede dansk lovgivning. Ny FAQ "Hvornår
  kan jeg køre bil igen?" / "När kan jag köra bil igen?" besvarer
  "dagen efter"-intents og siger, at 0,88 ‰ kræver 5,9 timer — tallet er
  `timerTilNul` fra det testede modul, ikke et håndplukket tal.
- **Tests:** Ny `src/app/promille/page.test.tsx` renderer DA og SE og kræver H1,
  synligt svar, den rigtige grænse og at beregneren stadig er i DOM. To nye
  `page-data`-tests låser titel/description/OG/schema for begge locales og kobler
  eksemplet til `beregnPromille(4, 80, "mand", 0)` = 0,88 ‰ og 5,9 timer, så copy og
  kode ikke kan glide fra hinanden. De nye assertions fejlede først mod den gamle
  copy og var grønne efter ændringen.
- **Kvalitetsgate 2026-09-26 08:16 CEST:** `npm run build` grøn (139 sider +
  typecheck, ingen nye advarsler), `npm run test` grøn (1191/1191 tests, 111 filer),
  `npm run lint` grøn (501 filer), `npm audit --audit-level=high` 0 sårbarheder.
  Diffen er copy + tests, så der var ingen grund til et separat review ud over
  de nye tests; de to runtime-tal er regnet fra modulet, ikke fra hukommelse.
- **Forventet effekt:** `/promille` har allerede position 7,9, så effekten er CTR på
  eksisterende kvalificeret trafik, ikke ny placering. 4.159 visninger/28d er den
  mindste dokumenterede CTR-kandidat på DA, og den var den sidste i klassen.
- **MÅL:** `/promille` Search Console baseline 4.159 visninger, 60 klik, CTR 1,4 %,
  position 7,9 pr. 2026-09-24 (28 dage til 2026-09-24). Plausible-baseline for
  `/promille` er **ukendt** — den står ikke i snapshotet og må ikke erstattes med 0.
  Genmål først 2026-10-10.
- **Kendte, urørte fund i samme fil (til næste iteration, ikke blandet ind her):**
  `beregnPromille` sætter `maaKoere: promille < 0,5` fast i `src/lib/promille.ts:35`,
  selv om grænsen er 0,2 ‰ i Sverige. Komponenten bruger dog selv `limit` fra
  `PromilleBeregner.tsx:56,106`, så **UI'et er korrekt**, og den eksporterede
  `maaKoere`-værdi bruges ingen steder i dag. Den er latente, men dårlig, fordi den
  ligner en dansk regel.

#### 40. [x] FÆRDIG 2026-09-26 — C16 — Svar-først på `/vaegttab` og `/enhedspris` (sidste to dokumenterede lav-CTR-sider)

- **Iteration start:** 2026-09-26 09:45 CEST på `ceo/c16-vaegttab-enhedspris-ctr`.
  C15's deploynote var åben med første kandidatvindue 12:30, så intet kunne
  verificeres; køen var ellers tom, så valget var planens egen dokumenterede
  rest (kandidat 31).
- **Datagrund:** Search Console 2026-08-27–2026-09-24 på **beraknare.se**:
  `/vaegttab` 1.186 visninger, 4 klik, **CTR 0,3 %, position 8,3**;
  `/enhedspris` 1.144 visninger, 4 klik, **CTR 0,3 %, position 6,1** med
  søgningerne "räkna ut kilopris" 126v pos 7, "jämförpris" 66v pos 6, "kilopris"
  43v pos 10 og "räkna ut kg pris" 23v pos 8. Det er de **eneste to sider** i
  GSC-snapshottet på begge domæner med position 5-10, der endnu ikke var
  svar-først efter C1-C15. Plausible: ingen af de to står i top-15 på
  beraknare.se, så **Plausible-baseline er ukendt** (ikke 0).
- **Problem før ændring:** begge titler var brand- og produkttunge med tomme løfter
  ("Vægttab Beregner - Beregn dit kalorieunderskud | MinBeregner.dk",
  "Enhedspris beregner - Sammenlign kilopris og literpris | MinBeregner.dk"), og
  ingen af siderne svaret synligt på sit eget spørgsmål. `/vaegttab`'s synlige
  intro var en enkelt sætning ("Beregn dit daglige kaloriemål for vægttab.")
  uden et eneste tal, selv om siden ellers har to konkrete FAQ'er med tal.
- **Beslutning/implementering:** Samme svar-først-mønster som C1-C9/C15, kun i
  `page-data.ts` — ingen ændring i kalkulationskode, URL, canonical, hreflang,
  sitemap eller `/api/v1`. `metaTitle` ≤ 60 tegn på alle tre domæner,
  `ogTitle` = `metaTitle`, og description/metaDescription/ogDescription/
  schemaDescription + én ny FAQ pr. side bærer **samme tal**:
  - `/vaegttab` (DA/SE/NO): "Vægttab: 6 kg på 12 uger = 550 kcal/dag" (39 tegn) med
    synlig intro om mand 80 kg, 180 cm, 30 år, moderat aktivitet: 550 kcal
    underskud og **2.209 kcal/dag**. Ny FAQ med spørgsmålet "Hvor mange kalorier
    skal jeg spise for at tabe 6 kg på 12 uger?" og BMR 1.780 × 1,55 = TDEE
    2.759.
  - `/enhedspris` (DA/SE): "Enhedspris: 35 kr. for 2 kg = 17,50 kr. pr. kg"
    (46 tegn) med synlig intro om 17,50 kr./kg og **12,5 %** billigere. Ny FAQ med
    spørgsmålet "Hvilken pakke er billigst pr. kilo i praksis?". SE får svensk
    variant på egen slug-inhold; **NO `/enhedspris` har ingen `noPages`-post** og
    falder derfor tilbage på dansk (se ny kandidat 41).
- **Talene er verificeret mod koden, ikke antaget:** `sammenlignEnhedspris(20, 1,
  35, 2)` i `src/lib/enhedspris.ts:19-49` giver 20,00 vs. **17,50** kr/kg,
  `billigst: "B"` og besparelse **12,5 %** — de samme standardværdier som
  `EnhedsprisBeregner.tsx:56-59`, så eksemplet er præcis det, værktøjet viser ved
  indlæsning. Vægttabstallene er regnet med præcis formlerne i
  `VaegttabBeregner.tsx`: Mifflin-St Jeor `10·80 + 6,25·180 − 5·30 + 5 = 1.780`
  (`:25-31`), aktivitetsfaktor `moderat: 1.55` (`:14-19`) → TDEE **2.759**,
  `KCAL_PR_KG = 7700` (`:22-23`) → underskud `6 × 7700 / (12 × 7) = 550` og
  dagligt mål **2.209**. Samme mand/højde/alder som `/kalorier` (C5), så de to
  sundhedsværktøjer ikke modsiger hinanden.
- **Acceptkriterier:**
  1. DA/SE/NO renderer H1, det konkrete svar og værktøjet. **PASS**
     (`src/app/vaegttab/page.test.tsx`, 3 locales; `src/app/enhedspris/page.test.tsx`, 2 locales)
  2. `metaTitle` ≤ 60 tegn, `ogTitle` = `metaTitle`, `metaDescription` ≤ 160 tegn
     og samme tal i description, metaDescription, ogDescription og schema på alle
     domæner. **PASS** (`src/lib/page-data.test.ts`, 6 nye testcases)
  3. Eksemplerne er bundet til koden: `sammenlignEnhedspris(20, 1, 35, 2)` =
     17,50 kr/kg + 12,5 %, og vægttabsformlen = 1.780 / 2.759 / 550 / 2.209, så
     copy og beregning ikke kan glide fra hinanden. **PASS** (2 nye tests)
  4. Ingen ændring i kalkulationskode, URL, canonical, hreflang, sitemap eller
     `/api/v1`; diffen rører kun `page-data.ts`, `page-data.test.ts` og to nye
     routetests. **PASS** — 4 filer i diffen
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 09:57 CEST:** `npm run lint` grøn (503 filer),
  `npm run test` grøn (**1203/1203 tests, 113 filer**), `npm run build` grøn
  (Compiled successfully + typecheck). Målrettet gate først: 56/56 i de tre
  berørte testfiler ved første kørsel.
- **Forventet effekt:** 2.330 visninger/28d samlet på position 6-8 med 0,3 % CTR.
  Løftes CTR til 2 %, giver det ca. 40 ekstra klik pr. måned. Effekten er den
  mindste i CTR-klassen, fordi volumen er det; klassen er nu **udtømt** på de
  dokumenterede data.
- **MÅL:** `/vaegttab` Search Console baseline 1.186 visninger, 4 klik, CTR 0,3 %,
  position 8,3 pr. 2026-09-24 (beraknare.se). `/enhedspris` baseline 1.144
  visninger, 4 klik, CTR 0,3 %, position 6,1 pr. 2026-09-24. Plausible-baseline
  for begge er **ukendt** — de står ikke i top-15. Effekt måles først fra
  **2026-10-10** (14 dage).
- **Landet:** kode og tests i commit `e83f017`; merge til `master` sker i denne
  iteration.

#### 42. [x] FÆRDIG 2026-09-26 — C17 — Arveafgift-artiklen: tre dokumenterede fejl rettet, svar-først + tidlig CTA

- **Iteration start:** 2026-09-26 10:03 CEST på `ceo/c17-arveafgift-article`. C15's og
  C16's deploynoter var åbne med første kandidatvindue 12:30, så intet kunne
  verificeres. Den dokumenterede CTR-klasse er udtømt (C16), og kandidat 37 peger på
  de sats-artikler, der mangler en baseline — det gjorde C17 til den næste opgave med
  både data og reel fejlrisiko.
- **Datagrund:** Plausible 2026-09-26 07:52: `/blog/arveafgift-regler-og-satser`
  **92 besøgende/28d, faldende 103 → 92** — det største dokumenterede fald blandt
  blogartiklerne. GSC har **ingen** baseline for artiklen (snapshottet viser kun
  `/blog/boernepenge-2026-satser-og-regler`), så effekten måles i Plausible.
- **Fund under gennemgangen (tre reelle fejl, ikke copy-typering):**
  1. **Eksemplet modsagde vores egen beregner.** Artiklen tog tillægsafgiften som
     25 % af *afgiftsgrundlaget* (407.700 → 86.636 kr, samlet afgift 147.791 kr,
     modtager 652.209 kr). `ArveafgiftBeregner.tsx:142-147` regner
     `(beloeb - boafgift) * 0,25` = 25 % af arven *efter* boafgift = 184.711 kr, samlet
     245.866 kr, modtager 554.134 kr. Artiklen understod altså søskendes afgift med
     98.075 kr i sit eget gennemgangseksempel.
  2. **Sats-tabellen var vagt forkert.** Rækkerne sagde "15 % + 25 %" og "36,25 %"
     uden at sige, at 36,25 % er 15 % + 25 % *af resten* — den samme forveksling som
     gjorde eksemplet forkert. Rækkerne er nu bundet til konfigurationen og siger det.
  3. **Gaveafgift-påstanden var udokumenteret og formodentlig forkert.** Artiklen
     hævdede, at gaver over grænsen "beskattes med 15 % gaveafgift". Gaveafgift er
     ikke det samme som boafgift, og påstanden kunne ikke dokumenteres i en
     myndighedskilde i denne iteration, så den er **fjernet** i stedet for bekræftet.
- **Regelverket er verificeret, ikke antaget:** Skatteministeriets boafgift-faktaside
  (via da.wikipedia `Boafgift`, hentet 2026-09-26) angiver præcis den model, vores
  beregner bruger: "Nære slægtninge … betaler 15 % i boafgift. Andre betaler en
  tillægsboafgift på 25 %. Dvs. afgiften her i alt bliver (15 % + 25 % af resten =)
  36,25 %." Beregnerens matematik er altså rigtig; det var artiklen, der afveg.
  **Ikke verificeret i denne iteration:** gavegrænserne (74.100 / 26.600 kr) og
  bundfradraget 392.300 kr — sidstnævnte står uændret i `SATSER_2026` med
  skm.dk-citation fra tidligere iterationer, første-grænserne står kun i artiklen og
  er derfor ikke opdateret, blot omformuleret til at pege på SKAT.
- **Beslutning/implementering:** Artiklen er gjort svar-først efter C10/S2-mønsteret:
  title/H1 "Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr." (51 tegn), et
  kort svar-afsnit med 91.155 kr / 392.300 kr / 15 % / 36,25 %, **CTA til
  `/arveafgift` før tredje hovedsektion** og en ny tredje FAQ med præcis samme regnestykke.
  Bundfradrag og satser læses nu fra `SATSER_2026` i stedet for at være hårdkodede i
  artiklen, så de ikke kan glide fra beregneren igen. `/arveafgift` har fået
  tilbage-link til guiden. Ingen ændring i `ArveafgiftBeregner`, beregningslogik,
  URL, canonical, hreflang, sitemap eller `/api/v1`.
- **Acceptkriterier:**
  1. Title og H1 er svar-først med et konkret 2026-tal. **PASS** (ny route-test)
  2. Artiklens bundfradrag/satser kommer fra `SATSER_2026`, og eksemplet er bundet til
     beregnerens formel: 407.700 / 61.155 / 184.711 / 245.866 / 554.134. **PASS**
     (3 nye tests, den tredje udregner beløbene fra konfigurationen)
  3. De tre fund er væk: ingen 86.636 / 147.791 / 652.209, ingen "15% gaveafgift",
     og tillægsafgiftens grundlag står eksplicit i tabellen. **PASS**
  4. CTA'en ligger før tredje hovedsektion, og siden linker tilbage. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 10:36 CEST:** `npm run lint` grøn (504 filer),
  `npm run test` grøn (**1208/1208 tests, 114 filer**), `npm run build` grøn
  (137+2 sider + typecheck). Målrettet kørsel først: 5/5 i den nye testfil.
- **Forventet effekt:** Artiklen er Danmarks næststørste faldende blogside med en
  konkret fejl i sit eget hovedeksempel, så rettelsen fjerner en tillidsfejl først og
  CTR/links bagefter. 92 besøgende/28d er et lille volumengrundlag; effekten på
  `/arveafgift` (ukendt Plausible-baseline) er den vigtigere at måle.
- **MÅL:** `/blog/arveafgift-regler-og-satser` baseline **92 besøgende/28d pr.
  2026-09-26** (forrige 28 dage: 103). `/arveafgift` Plausible-baseline **ukendt** —
  den står ikke i top-15. Effekt måles først fra **2026-10-10** (14 dage).
- **Landet:** kode, tests og plan i én commit på `ceo/c17-arveafgift-article`; merge
  til `master` straks efter den grønne gate.

#### 43. [x] FÆRDIG 2026-09-26 — C18 — Pensionsguiden sagde 63.000 kr for et loft, der er 68.700 kr

- **Iteration start:** 2026-09-26 10:45 CEST på `ceo/c18-pensionssatser`. C15/C16/C17
  havde alle åbne deploynoter med første kandidatvindue 12:30, så intet kunne
  verificeres. Den dokumenterede CTR-klasse er udtømt på de 15 største GSC-sider,
  så valget var et korrekthetsfund i den pension-klynge, som ingen tidligere
  opgave rørte i teksten.
- **Datagrund:** `/pension` 140 besøgende/28d (+31 %, bounce 2 %) pr. 2026-09-26.
  GSC har ingen baseline for `/pension` eller for pensionsguiden i snapshottet, så
  effekten måles i Plausible og i klyngegens indhold, ikke i CTR.
- **Fundet (én reel fejl, plus en mangel):**
  1. `src/app/blog/pension-hvor-meget-skal-du-spare-op/page.tsx` skrev **"max
     ~63.000 kr/år"** for ratepension i to steder ( privat-pensionsafsnittet og
     "5 ting"-kortet), mens **samme artikels egen FAQ**, `/pension` og
     `/blog/fradrag-2026-komplet-guide` sagde 68.700 kr. Artiklen modsagde altså
     både satsmodulet og sig selv. 63.000 kan ikke dokumenteres i nogen kilde.
  2. **Ingen af de fire tal var bundet til `SATSER_2026`.** `ratepensionMax` og
     `aldersopsparingMax` lå i modulet med skat.dk som kilde, mens artiklen og
     siden havde tal som tekstliterals — præcis den fejltype S2 fandt i
     skat-2026-guiden og S3 lukkede i fradrag-2026-guiden.
- **Regelverket er verificeret, ikke antaget:** SKAT's side "Fradrag for
  indbetalinger til pension i 2026" (2026-02-26) siger "op til 68.700 kr. i 2026",
  og info.skat.dk C.A.10.2.2.3.3 bekræfter beløbsgrænsen på 68.700 kr. (2025:
  65.500 kr.). Modulets værdi er altså rigtig; **det var artiklen, der afveg** —
  samme lære som C17. Aldersopsparingens 9.900 kr. er uændret og allerede
  kildeført i modulet.
- **Beslutning/implementering:** Pensionsguiden og `/pension` læser nu begge
  `ratepensionMax`/`aldersopsparingMax` fra `SATSER_2026` gennem
  `formatNumber(…, "da")`, præcis som S3 gjorde i fradrag-guiden. De fire
  hårdkodede tal er væk; 63.000 er ikke tilføjet nogen steder. **Ingen** ændring i
  `PensionBeregner`, `folkepension.ts`, beregningslogik, URL, canonical, hreflang,
  sitemap eller `/api/v1`. Folkepensionsbeløbene i artiklens FAQ (16.273 / 7.544 /
  8.729 / 12.011) er checket mod `FOLKEPENSION_2026` og passer.
- **Acceptkriterier:**
  1. "63.000" findes ikke i pensionsguiden eller på `/pension`. **PASS**
  2. Begge læser begge loft fra `SATSER_2026`; ingen rate er en tekstliteral. **PASS**
  3. Den renderede guide viser "68.700 kr/år" og "9.900 kr/år". **PASS** (ny
     route-rendertest, 7 tests i `src/app/pension-satser.test.tsx`)
  4. Modulets `ratepensionMax` låstes til SKAT's dokumenterede 68.700, så en
     fremtidig ændring kræver en bevidst kode- og kildeændring. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 10:51 CEST:** `npm run lint` grøn (505 filer),
  `npm run test` grøn (**1215/1215 tests, 115 filer**), `npm run build` grøn
  (139 sider + typecheck, kun de 7 kendte pre-existing CSS-advarsler). Målrettet
  kørsel først: 7/7 i den nye testfil.
- **Forventet effekt:** Det er en tillids- og korrekthedsrettelse, ikke en
  trafik-rettelse: en guide der anbefaler "max ratepension først" med et for lavt
  loft undervurderer den fradragsværdi, den selv anbefaler. `/pension` har 140
  besøgende/28d, så den absolutte effekt er lille; det samme gælder
  pensionsguiden, hvis trafik ikke er oplyst.
- **MÅL:** `/pension` baseline **140 besøgende/28d pr. 2026-09-26**. Pensionsguidens
  Plausible-baseline er **ukendt** (ikke i top-15). Effekt måles først fra
  **2026-10-10** (14 dage) og da ved at se, om artiklen og siden stadig viser
  samme tal.
- **Landet:** kode, tests og plan i én commit på `ceo/c18-pensionssatser`; merge
  til `master` straks efter den grønne gate.
- **Bemærk til `src/app/blog-rates.test.ts:21`:** den lister "68.700" under
  `staleLiterals` med kommentaren "gammelt ratepension-loft". Det er **ikke** et
  gammelt loft — 68.700 er 2026-værdien. Assertionen er stadig korrekt (literaler
  må ikke hardcodes), men kommentaren er misvisende og bør rettes ved næste
  gennemgang af den test.

#### 41. Ny kandidat — `noPages` mangler `/enhedspris`, så beregner.no viser dansk

- C16 fandt, at `src/lib/page-data.ts` har `enhedspris` i `daPages` og `sePages`
  men **ikke** i `noPages`, selv om `calculator-list.ts:89` lister slugs for alle
  tre domæner. `/enhedspris` på `beregner.no` falder derfor tilbage på den
  danske tekst via `getPageData(slug, locale) || getPageData(slug, "da")`.
- **Begrænsning:** `beregner.no` er **ikke live** (404 på `/` og `/api/health`,
  domænet står i `hiddenDomains`), så fejlen har nul trafik betydning nu. Den er
  dog den samme locale-leak-type som O4 beskriver, og den bør rettes samlet med
  evt. dansk `page-data` for `/budget`, `/del-regning` og andre
  helbreds-svenske-kunster, når `beregner.no` eventuelt slås til. Skriv en NO-post
  per manglende slug, og fang det i en test der kræver at alle
  `calculator-list`-slugs har en post i hver `*-Pages`.

#### 44. Ny kandidat — C19: de tre næste sats-artikler uden baseline

- Kandidat 37 sagde, at næste skridt **ikke** er flere artikler blindt, men en
  baseline for de største. GSC-snapshottet viser kun børnepenge-artiklen blandt
  blogartiklerne, så baseline for resten skal hentes fra Mads eller fra næste
  Plausible-snapshot.
- C18 har nu lukket det ene navngivne eksempel i kandidat 37
  (`/blog/pension-hvor-meget-skal-du-spare-op`). De to øvrige stadig ubearbejdede
  er `/blog/su-2026-satser-og-regler` (O3 rettede satserne, men bloggens egen
  struktur og baseline mangler) og `/blog/dagpenge-saadan-finder-du-din-sats`
  (bloggen nævner dimittendsats 14.557/13.437 kr., som ingen anden side i repoet
  bruger — skal verificeres mod dagpenge-satsmodulet, før den citeres).
- **Metode:** samme som C10/S2/C18 — verificér hvert tal mod sit satsmodul, bind
  det til modulet, gør artiklen svar-først med en tidlig CTA, og skriv baseline
  ind FØR ændringen. Én artikel pr. iteration.
- **Status 2026-09-26 11:35:** dagpenge-artiklen er færdig som opgave 45 (C19).
- **Status 2026-09-26 11:20:** SU-artiklen er færdig som opgave 46 (C20), og dermed
  er **hele kandidat 37 lukket**. Der er ingen ubearbejdet sats-artikel tilbage.

#### 45. [x] FÆRDIG 2026-09-26 — C19 — Dagpenge-guiden sagde 20.359 kr, ministeriet siger 22.041 kr

- **Iteration start:** 2026-09-26 11:00 CEST på `ceo/c19-dagpenge-satser`. De tre
  åbne deploynoter (C15/C16/C18) har alle første kandidatvindue 12:30, så intet
  kunne verificeres. GSC-snapshottet har ingen baseline for dagpenge-artiklen, og
  C19-kandidaten bad om en baseline FØR ændringen — valget blev derfor et fund,
  ikke en CTR-justering.
- **Datagrund:** `/blog/dagpenge-saadan-finder-du-din-sats` og `/dagpenge` er
  **ikke** blandt top-15-siderne i Plausible-snapshottet 2026-09-26 07:52, og
  GSC-snapshottet (2026-08-27→2026-09-24) har ingen rækker for dem. **Baseline er
  derfor ukendt** — ikke forsømt. Artiklen ligger i samme klynge som
  `/barselsdagpenge` (200 besøgende/28d) og `/efterloen`, så effekten måles i
  Plausible fra næste snapshot, ikke i CTR.
- **Fundet — fire tal, ingen af dem kunne dokumenteres.** Bloggen havde sine egne
  dagpenge-satser, og ingen af dem matchede hverken ministeriet eller værktøjet:

  | Påstand i artiklen | Ministeriets 2026-tal | Konsekvens |
  |---|---|---|
  | Max dagpenge 20.359 kr/md | 22.041 kr/md | **1.682 kr/md for lavt** |
  | Max deltid 13.573 kr/md | 14.694 kr/md | 1.121 kr/md for lavt |
  | Dimittend 14.557 kr/md (71,5 %) | 15.759 kr/md uden forsørgelsespligt | 1.202 kr/md for lavt |
  | Dimittend 13.437 kr/md (66 %) | 18.074 kr/md med / 15.759 kr/md uden | forkert konstruktion |

  Derudover var "952 kr/dag", "ca. 120 kr/time", "første 3 måneder / derefter" og
  "ca. 22.600 kr"-loftet ikke dokumenterede påstande. 952 kr/dag er ikke en
  dagpenge-sats overhovedet (G-dag er 1.017 kr/dag), og 66 % findes ingen steder:
  dimittend er 71,5 % uden og 82 % med forsørgelsespligt.
  **Der var tre uafhængige satser i repoet om de samme tal** — artiklen, siden og
  værktøjet — og ingen af dem havde kilde. Det er samme fejltype som S2/C17/C18.
- **Regelverket er verificeret, ikke antaget:** Beskæftigelsesministeriets
  "Satser for 2026" (bm.dk/satser/satser-for-2026) er hentet direkte 2026-09-26 og
  oplyser præcis de seks satser: fuldtid 22.041, deltid 14.694, dimittend
  fuldtid/deltid med forsørgelsespligt 18.074/12.049 og uden 15.759/10.506, plus
  G-dag 1.017/509 kr. Ministeriet oplyder, at satserne gælder fra 1. januar 2026
  med STAR som primærkilde. **Modulet og siden var altså nogenlunde rigtige på
  max-satsen; artiklen og værktøjets dimittend-estimat var forkerte.**
- **Beslutning/implementering:**
  1. Ny `DAGPENGE_2026` i `src/lib/satser-2026.ts` med kilde, `verifiedAt` og de
     seks satser + G-dag. Kun de otte beløb er fra bm.dk; rettigheds- og
     periodetal (1.924/3.848 timer, 1 års medlemskab, 18 mdr uddannelse, 14 dage,
     30/104 uger) er samlet ét sted, men **ikke** i ministeriets tabel — det står
     sagt eksplicit i modulets docblock.
  2. `DagpengeBeregner.tsx` læser nu max, procent og begge dimittendsatser fra
     modulet. Den gamle `15174` var kommenteret "2026 estimat" og lå 585 kr under
     ministeriets 15.759; `dimittendsatsForsorger` var sat til max-satsen
     22.041 i stedet for 18.074. **Ingen ændring i beregningslogikken** — begge
     dimittendfelter var døde konstanter, så rettelsen er risikofri. `beskaeftigelsesTillaeg`
     (26.198) er bevidst **uændret**, se ❓ Til Mads.
  3. `/dagpenge` læser samme modul i tabellen, i "Hvad påvirker din dagpengesats"
     og i indkomstkravet, og tabellen har nu alle fire satslinjer plus deltid. Den
     angiver verificeringsdato for de fire beløb, der faktisk er verificeret.
  4. Artiklen er svar-først: titel/H1 "Dagpenge 2026: Max sats er 22.041 kr. pr.
     måned" (D1/C13-reglen: ét domænesuffiks, følger af skabelonen), "Kort svar"-afsnit
     med alle fire beløb, tidlig CTA til `/dagpenge` **før** den første tabel, en
     otterækkers sats-tabel med kilde og verificeringsdato, to regneeksempler der
     følger værktøjets formel (20.000 → 16.560 kr under loftet; 30.000 → 24.840 kr
     over loftet), et beregnet lønloft på ca. 26.620 kr, dimittend-afsnittet uden
     den konstruerede 3-månedersforskydning, et nyt G-dag-afsnit og to nye
     FAQ-spørgsmål (hvornår rammer man maxsatsen, hvad er en G-dag).
  5. Uverificerede påstande er **fjernet**, ikke tilpasset: 20.359, 952, 120
     kr/time, 13.573, 14.557, 13.437, 66 % og 22.600 findes ikke lenger.
- **Acceptkriterier:**
  1. Artiklen viser 22.041 / 14.694 / 18.074 / 15.759 / 1.017 kr. **PASS**
  2. Ingen af de otte gamle tal findes i artiklen eller på siden. **PASS**
  3. Værktøjets `dimittendsats` er 15.759 og `dimittendsatsForsorger` 18.074,
     begre fra modulet, og ingen beregningslogik er ændret. **PASS**
  4. Artiklen, siden og værktøjet læser alle fra `DAGPENGE_2026`. **PASS**
  5. Modulets tal er låst til bm.dk, og 2/3- og 71,5 %/82 %-forholdene er
     konsistensvagte mod tastefejl. **PASS** (ny `src/lib/dagpenge.test.ts`, 7 tests)
  6. Renders den, indeholder artiklen 22.041/14.694/18.074/15.759/1.017, og CTA'en
     ligger før første `<table>`. **PASS** (ny route-rendertest, 11 tests)
  7. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 11:26 CEST:** `npm run lint` grøn (508 filer),
  `npm run test` grøn (**1236/1236 tests, 118 filer**), `npm run build` grøn
  (139 sider + typecheck, ingen nye advarsler). Målrettet kørsel først: 21/21 i de
  tre nye/berørte testfiler.
- **Forventet effekt:** Korrekthed og tillid, ikke trafik i sig selv. En guide der
  underoplyser max-satsen med 1.682 kr/md og opgiver en dimittendsats, der ikke
  findes, skader de få læsere der faktisk bruger tallene. Baseline for begge sider
  er ukendt, så effekten kan ikke kvantificeres før næste Plausible-snapshot.
- **MÅL:** `/blog/dagpenge-saadan-finder-du-din-sats` baseline **ukendt** (ikke i
  top-15 pr. 2026-09-26); `/dagpenge` baseline **ukendt** (ikke i top-15).
  Klynge-reference: `/barselsdagpenge` 200 besøgende/28d pr. 2026-09-26.
  Første genmåling 2026-10-10.
- **Landet:** kode, tests og plan i én commit på `ceo/c19-dagpenge-satser`; merge
  til `master` straks efter den grønne gate. Kode `9a9b112`, merge `611607c`
  2026-09-26 11:35 CEST, begge pushet.
- **Åbne dele af C19:** `/blog/su-2026-satser-og-regler` er lukket som C20 den
  2026-09-26 (opgave 46). Den anden del — en primærkilde til
  beskæftigelsestillægget på 26.198 kr, som bm.dk **ikke** oplyser — står åben og
  kan ikke lukkes herfra.

#### 46. [x] FÆRDIG 2026-09-26 — C20 — SU-guiden er svar-først og har tre nye dokumenterede 2026-tal

- **Iteration start:** 2026-09-26 11:16 CEST på `ceo/c20-su-artikel`. Kandidat 37
  og 44 pegede begge på SU-artiklen som det eneste ubearbejdede punkt. De fire
  åbne deploynoter har første kandidatvindue 12:30, så intet kunne verificeres.
- **Datagrund:** `/blog/su-2026-satser-og-regler` er **ikke** blandt top-15 i
  Plausible-snapshottet 2026-09-26 07:52, og GSC-snapshottet har ingen række for
  den. **Baseline er ukendt** — ikke forsømt. `/su` er heller ikke i top-15, men
  lå tidligere i "største fald" (239→119 i 2026-09-23-snapshottet). Klynge-
  reference: `/studielaan` og `/dagpenge` ligger samme sted i trappen. Effekten
  måles i Plausible fra næste snapshot, ikke i CTR.
- **Fund — modsat C17/C18/C19 fandt jeg ingen tredje satssamling.** O3 har bundet
  artiklen, siden og værktøjet til `SU_2026`, så artiklen læser *alle* beløb fra
  modulet. Jeg verificerede dog hvert tal mod su.dk's egne satssider den
  2026-09-26, og **alle ni tal i modulet er korrekte**: udeboende 7.426,
  hjemmeboende 1.154/3.202/2.048, legacy 3.692, forsørgertillæg 7.426,
  handicaptillæg 10.562/6.624, fribeløb 15.297/20.749/23.598/45.420/3.921,
  barn 34.129, SU-lån 3.799/1.900/5.699/9.801. **Der var ingen fagfejl at rette.**
- **Fundet derimod — tre officielle 2026-tal fandtes slet ikke i modulet**, selv
  om de står i de kilder artiklen allerede linker:
  1. **Forældreindkomstgrænserne for hjemmeboende SU.** Artiklen siger, at satsen
     afhænger af forældrenes indkomst i 2024, men nævner aldrig *hvor* grænserne
     går. su.dk: fuldt tillæg ved 419.589 kr. eller lavere, intet tillæg ved
     710.077 kr. eller højere, og 43.086 kr. fradrag pr. søskende under 18 år. Det
     er præcis den konkrete søgning, artiklen lovede at besvare.
  2. **Forsørgertillæg ved delt bolig: 2.966 kr.** — ikke 7.426 — når forsørgeren
     bor med en person på SU eller kontanthjælp efter § 16 st. 1 nr. 1 i LAP.
     Modulet kendte kun den høje sats. Fødselsstøtten (op til 9 måneder, 12 for
     enlige forsørgere, svarende til en måneds SU) manglede også.
  3. **Udlandsstudielån 2026: 129.106 kr. i alt.** står i den same SU-lån-tabel som
     de tre lån, modulet kendte. Artiklen nævnte det slet ikke.
- **Beslutning/implementering:**
  1. `SU_2026` har nu `parentalIncome` (tre tal), `singleParentSupplementSharedHome`,
     `loan.abroadTotal` og `rules.birthGrant*`. `verifiedAt` er opdateret
     2026-09-24 → **2026-09-26**, fordi alle tal er genverificeret i dag. Det
     udløser automatisk opdatering i `/su`, kategoriens FAQ og studielånsiden.
  2. Artiklen er svar-først: titel/H1 er nu **"SU 2026: 7.426 kr. pr. måned
     udeboende"** (fra "Nye satser og regler for studerende"), description
     indeholder alle fire nøgletal, og et **"Kort svar:"**-afsnit besvarer
     udeboende, hjemmeboende, fribeløb og SU-lån i fire linjer. D1/C13-reglen
     holder: ét domænesuffiks, ingen dobbelt.
  3. Nye afsnit: en to-rækkers tabel over forældreindkomstgrænserne med den
     eksplicitte advarsel om at 43.086 kr. (forældreindkomst) og 34.129 kr.
     (årsfribeløb) er to forskellige tal, en sætning om 2.966 kr. og
     fødselsstøtten, og udlandsstudielånet i lånlisten.
  4. Tre nye FAQ-spørgsmål (forældreindkomst, udlandsstudielån, forsørgertillæg),
     så JSON-LD svarer på de konkrete søgninger.
- **Acceptkriterier:**
  1. Alle ni eksisterende modultal er bekræftet mod su.dk's satssider. **PASS**
  2. `parentalIncome.maxSupplementAtOrBelow` (419.589) <
     `noSupplementAtOrAbove` (710.077) låst som konsistensvagt. **PASS**
  3. Artiklen renderer 419.589, 710.077, 43.086, 2.966 og 129.106 kr. **PASS**
  4. Titlen er modulet udeboendesats, og "Kort svar" står før første tabel. **PASS**
  5. CTA'en til `/su` ligger stadig før første `<table>`. **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 11:20 CEST:** `npm run lint` grøn (509 filer),
  `npm run test` grøn (**1243/1243 tests, 119 filer**), `npm run build` grøn
  (139 sider + typecheck, ingen nye advarsler). Målrettet kørsel først: 18/18 i
  `satser-2026.test.ts` og den nye artikel-test.
- **Forventet effekt:** Korrekthed og svar-først skrivning på en artikel uden
  baseline. Den konkrete værdi er de tre nye tal: en studerende, der googler
  "hjemmeboende SU 2026 forældreindkomst", har førhen ikke fundet grænserne
  nogen steder på sitet.
- **MÅL:** `/blog/su-2026-satser-og-regler` baseline **ukendt** (ikke i top-15 pr.
  2026-09-26); `/su` baseline **ukendt** i dette snapshot (faldt 239→119 i
  2026-09-23-snapshottet). Første genmåling 2026-10-10.
- **Landet:** kode `cfb7da0`, merge `84842a1` til `master` 2026-09-26 11:24 CEST,
  begge pushet (branch `ceo/c20-su-artikel` ligger også på origin). `/api/health`
  svarede `status: ok` umiddelbart efter merge; live-artiklen er endnu den gamle,
  fordi auto-deploy er slået fra.
  - **Kandidat 37 er hermed lukket.** Ingen navngiven sats-artikel er længre
  ubearbejdet, og der er ingen baseline til nogen af dem undtagen børnepenge.

#### 47. [x] FÆRDIG 2026-09-26 — C21 — `/su` lovede forældreindkomst, men nævnte ingen af tallene

- **Iteration start:** 2026-09-26 11:29 CEST på `ceo/c21-su-side`. Køen var tom
  (alle 46 opgaver færdige, intet `I GANG`), og de fem åbne deploynoter har første
  kandidatvindue 12:30, så intet kunne verificeres. C20's egen afsluttning pegede
  på dette som det næste: de tal den verificerede, fandtes kun i artiklen.
- **Datagrund:** `/su` **119 besøgende/28d pr. 2026-09-26** (snapshot 07:52) og
  faldt 239→119 i 2026-09-23-snapshottet. Ikke i GSC-top-15, så **der er ingen
  CTR-baseline** — derfor er titel/description **ikke** rørt i denne iteration.
  Klyngereference: `/studielaan` og `/dagpenge` låt samme sted i trappen.
- **Fund — landingssiden lovede indhold, den ikke havde.** `/su`s egen intro
  (`src/app/su/page.tsx:41-48`) linker til guiden "med aldersgrænser,
  **forældreindkomst**, fribeløb og officielle kilder", men siden nævner
  forældreindkomst *ordet* og ingen *grænser*: den gamle sats-tabel sagde bare
  "Den afhænger af forældrenes indkomstgrundlag to år tidligere"
  (`src/lib/page-data.ts:1683`), og hjemmeboende-afsnittet havde ingen tabel. Sådan
  besvarede `/su` præcis den søgning, den lovede at besvare — kun i artiklen.
- **Beslutning/implementering:** intet nyt tal, kun de fire der allerede lå i
  `SU_2026` og var verificeret mod su.dk den 2026-09-26:
  1. Ny `<h2>`-sektion "Hjemmeboende SU: forældrenes indkomst i 2024" med
     tre-rækkers tabel (fuldt tillæg ≤ 419.589 kr. / trinvis nedfald mellem
     grænserne / kun grundsats ≥ 710.077 kr.), søskendefrådraget på 43.086 kr.
     med den eksplicitte advarsel om forveksling med årsfribeløbets 34.129 kr.,
     dobbelt adresse-reglen og kilde-linket til su.dk.
  2. Ny række i sats-tabellen + løbende tekst: forsørgertillægget er
     **2.966 kr.**, når forsørgeren bor med en på SU eller kontanthjælp efter
     sociallovens § 16, st. 1 — ikke 7.426 kr. Fødselsstøtten (9/12 måneder) er
     nævnt samme sted.
  3. **Udlandsstudielån 129.106 kr.** i SU-lån-listen på `/su` (den stod kun i
     artiklen).
  4. `page-data.ts`: to nye FAQ-spørgsmål (forældreindkomst, udlandsstudielån) og
     det eksisterende forsørgertillæg-svar udvidet med delt-bolig-satsen. FAQ'en
     går dermed også ind i JSON-LD, så svarene kan vises i Google.
- **Acceptkriterier:**
  1. `/su` renderer 419.589, 710.077, 43.086, 2.966 og 129.106 kr. **PASS**
  2. `page-data.ts`'s FAQ for `su` indeholder de samme tal. **PASS**
  3. Forældreindkomstafsnittet står før fribeløbsafsnittet. **PASS**
  4. Siden linker til su.dk's forældreindkomstregel. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 11:33 CEST:** `npm run test` grøn (**1249/1249,
  120 filer** — 6 nye i `src/app/su/page.test.tsx`), `npm run lint` grøn
  (510 filer), `npm run build` grøn (139 sider + typecheck, ingen nye advarsler).
- **Forventet effekt:** `/su` kan nu besvare "hjemmeboende SU 2026 forældreindkomst"
  uden at læseren skal ud på artiklen. Det er en konverterings- og
  svar-først-effekt, ikke en CTR-effekt — der er ingen GSC-række at måle imod.
- **MÅL:** `/su` baseline **119 besøgende/28d pr. 2026-09-26** (ikke i GSC-top-15,
  ingen CTR-baseline). Første genmåling 2026-10-10.

#### 48. [x] FÆRDIG 2026-09-26 — C22 — Brødkrummen på alle 60 svenska sider linkede til en 404

- **Iteration start:** 2026-09-26 12:05 CEST på `ceo/c22-svensk-brodkrumme`. Køen var
  tom (alle 47 opgaver færdige, intet `I GANG`), og de seks åbne deploynoter har
  første kandidatvindue 12:30, så intet kunne verificeres. C21's afsluttning sagde,
  at næste iteration skulle gå efter **placering/indhold**; det blev et siteomfattende
  fund på den svenska flade i stedet for endnu en CTR-justering.
- **Datagrund:** hele beraknare.se har **188.000 visninger/28d i Google med 0,2 %
  CTR**, og de to største svenska sider alene er `/dato` (88.498 visninger, 87 klik,
  CTR 0,1 %, pos 8,4) og `/tidsberegner` (55.186 visninger, 114 klik, 0,2 %, pos 8,2).
- **Fund — verificeret på live først, ikke kun i koden.** `curl` 12:10:
  `beraknare.se/kategori/hverdag` → **404**, `minberegner.dk/kategori/hverdag` → 200.
  Og live-HTML for `beraknare.se/dato` indeholdt **5 forekomster af
  `/kategori/hverdag`**, heraf i JSON-LD:
  `{"@type":"ListItem","position":2,"name":"Vardag","item":"https://beraknare.se/kategori/hverdag"}`
  — altså et `BreadcrumbList`, hvor position 2 peger på en 404.
  Rodårsag: `routing.ts:18` erklærer `/blog` og `/kategori` for dansk-only
  (`danishOnlySections`), men `breadcrumbCategoryHref` er skrevet i `page-data.ts`
  for **alle** 53 `sePages` + 7 `/dagar-till/*` (sidstnævnte via
  `DageTilPage.tsx:214`, som endda bruger `/kategori/praktisk`, ikke `hverdag`).
  `Breadcrumbs.tsx` linkede krummerne uden at spørge routen.
  **Bemærk:** den tidligere note i planen (C9, linje 1221-1223) skrev, at dette var
  uændret, fordi "kategorislugs er fælles på tværs af domæner". Den begrundelse er
  **falsificeret**: det er ikke sluggen, der er dansk, det er hele `/kategori`-sektionen.
- **Beslutning/implementering:** breadcrumb-krummer afgøres nu af den route, de
  faktisk peger på. `Breadcrumbs.tsx` kalder `getRouteDecision(domainConfig, href)`
  og renderer krummer som link **kun** når routen er `allow`; ellers er krummer ren
  tekst. Det er domæne-aware ved konstruktion, så en ny dansk-only sektion kan ikke
  genindføre fejlen, og det gælder også en evt. NO-sektion senere. `BreadcrumbSchema`
  har nu valgfrit `url`, så `item` **udelades** i stedet for at pege på en 404.
  Sidstnævnte krumme (den aktuelle side) havde aldrig et `item` før; det er nu
  eksplicit. `dage-til.ts:282` rettet samtidig: den svenska `/dagar-till/1-december`
  sagde "1 december är inte en **dansk** helgdag" → "**svensk** helgdag".
- **Acceptkriterier:**
  1. Dansk `/kategori/*`-krumme er stadig et link på minberegner.dk, og JSON-LD
     har `item`-URL'en. **PASS**
  2. På beraknare.se er ingen krumme et link til `/kategori/*`, og JSON-LD
     position 2 har **intet** `item`. **PASS**
  3. Hjemmelen er stadig et link på begge domæner; den aktuelle side er aldrig et
     link. **PASS**
  4. **Ingen** svensk eller norsk side (alle 53 + 7 + NO-slugs) renderer et
     `/kategori`-link, og **alle** danske sider gør. **PASS** (ny test, 6 assertions
     inkl. to loops over hele kataloget)
  5. Dansk `<title>`/canonical/hreflang, sitemap og `/api/v1` er urørte. **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 12:27 CEST:** `npm run test` grøn (**1255/1255,
  121 filer** — 6 nye i `src/components/Breadcrumbs.test.tsx`), `npm run lint` grøn
  (511 filer), `npm run build` grøn (139 sider + typecheck, ingen nye advarsler).
- **Forventet effekt:** fjerner en 404-linket intern struktur fra 60 svenska sider,
  som Google læser både i DOM og i strukturerede data. Det er et crawl- og
  troværdigheds-fix, ikke et CTR-fix: det retter ikke beraknare.se's lave CTR i sig
  selv, men det fjerner et konkret fejlsignal fra hele domænet og en død kilde fra
  hver enkelt side.
- **MÅL:** ingen enkelt side ændres, så der er **ingen CTR-baseline** at slå op.
  Måles som: **0 anchors med `href="/kategori..."` og 0 `/kategori`-URL'er i
  JSON-LD** på beraknare.se efter næste batch (**mål 2026-10-10**), plus Search
  Console-crawl-rapporter for beraknare.se. Korrigeret 12:33 efter live-kontrol:
  `/kategori/hverdag` står stadig én gang i HTML'en som React-`key` i
  Flight-payloaden, hvilket hverken er et link eller schema — se deploynoten. Plausible-niveau: `/` 18 besøgende/28d med bounce 71 % pr.
  2026-09-26 (forsiden er den eneste side, hvor brødkrummen er synlig på siden
  over folden).
- **Falsificeret i denne iteration (skrevet ned, så det ikke gøres igen):** svensk
  `/dato`-metadata **er** allerede svar-først og spejler DA-mønsteret efter C2
  (`page-data.test.ts:443-447` låser titel, intention og månedstal for begge
  domæner). Forslaget om at sætte et hardkodet "60 dagar" i den svenska titel er
  derfor **forkert**: det ville afvige fra DA-mønsteret og gå stale. SE `/dato`'s
  lavere CTR (0,1 % mod 0,6 %) skyldes **placering** (8,4 mod 5,8), ikke titel.

#### 49. [x] FÆRDIG 2026-09-26 — C22's fire researchfund (alle fire lukket som C23, C24 og C25)

**Del 1 og 2 er lukket som opgave 50 (C23), del 3 som opgave 51 (C24) og del 4
som opgave 52 (C25) 2026-09-26. Alle fire fund er lukket.**

Fundene er verificeret i koden med fil/linje, men **ikke** rettet i denne
iteration (tidsbudget). Rangordnet efter trafik × tillid:

1. **`/loen-efter-skat`'s FAQ siger den afskaffede 15 % topskat som gældende
   lov** (`page-data.ts:1203`: "Tjener du over topskattegrænsen, betales også
   15% topskat") — to linjer længere nede i **samme array** står modsætningen
   ("Den gamle topskat på 15% er afskaffet", `:1205`), som sidens egen prosa og
   `SATSER_2026` (7,5 % / 7,5 % / 5 %) også siger. Fejlen er dermed synlig **og**
   går ind i `FAQSchema`-JSON-LD på en lønside. Ét linjeskifte.
2. **Kommuneskat 2026 står som tre forskellige tal.** Korrekt er
   `SATSER_2026.kommuneskatSnit = 25,049 %` (verificeret i research-fund 7 og
   håndhævet af `satser-2026.test.ts`). Men: `page-data.ts:1207` siger
   **24,94 %** på `/loen-efter-skat` (hverken gammel eller ny værdi),
   `loen-efter-skat/page.tsx:84` siger **25,07 %** på **samme side**,
   `page-data.ts:1231` siger 25,07 % i `/brutto-netto`'s FAQ, og
   `BruttoNettoBeregner.tsx:16` importerer `KOMMUNE_SNIT` uden at bruge den,
   mens `:195` bruger kirkeskatten fra modulet. Skarpeste tegn på et gammelt tal.
   **Forbehold:** `/api/v1/loen` og `/api/v1`-dokumentationen bruger også 25,07 %
   og 0,68 %, og `/api/v1` er en **frosset ekstern kontrakt** i Danger Zones — så
   rett den kun efter en eksplicit beslutning om API'en (jf. ❓ Til Mads).
3. **SE `/leasing` er uændrede stub-metadata** (`page-data.ts:3406-3422`):
   titel "Leasing Kalkylator", description "Gratis kalkylator", og tre
   placeholder-FAQ-spørgsmål med **norsk** tekst (*jeg*, *kalkylatoren*). Desuden
   viser `LeasingBeregner.tsx:299,304,309,332,336` den danske enhed `kr./md` på
   svensk. Trafik: 46 besøgende, 3.181 visninger, 30 klik, **pos 12,5** — altså
   lige under top-10, hvor svar-først metadata har størst effekt. `no`-varianten
   er en klon af samme stub og bør rettes i samme pas, ellers divergerer de to.
4. **SE `/tidszone` er forankret i Danmark** (`TidszoneBeregner.tsx:88,105,125,129`:
   "Danmark (CET/CEST)", "Köpenhamn", "Tidsskillnad från Danmark"), mens sidens
   egen svenska metadata og prosa svarer på "Vad är klockan i USA när det är 12
   i Sverige?". **Talberøringen er ikke berørt** — Sverige og Danmark deler
   CET/CEST — så det er en mærkning, ikke en regnefejl. 3.189 visninger/28d
   (SE), men ikke i DA-top-15.

**Andre fund fra samme research, lavere prioritet (kun nævnt, ikke verificeret
yderligere):** `/efterloen` bruger en folkepensionsalder-tabel der modsiger den
verificerede `folkepension.ts` (født 1963: 69 år her, 68 år på `/pension`), og
udbetaler derfor ét år for meget; `/billaan`'s eksempeltabel har 7 %-tal i to
7-års-rækker under overskriften "Rente 6 %"; `/husleje` siger 1-3 måneders
depositum mens `/flyttebudget` siger 3-6; `/solceller`'s FAQ siger 25-30 år mod
sidens 15-20; `/gaeldsfri`'s "Effekt af ekstra afdrag"-boks kan aldrig vise noget,
fordi baseline-kaldet `simuler(() => 0)` stadig anvender den lukkede `ekstra`
(`GaeldsfriBeregner.tsx:248`); `EfterloensBeregner.tsx:124` giver én
præmieportion pr. 481 timer, mens UI og FAQ siger 962 timer. **Bemærk:** den
første halvdel af denne liste er fra DA-fladen, anden halvdel fra SE — de er
 fundet af to parallelle research-spor og er **ikke** alle krydsverificerede af
 mig. Den næste iteration skal bekræfte den konkrete linje, før den ændrer noget.

#### 51. [x] FÆRDIG 2026-09-26 — C24 — SE `/leasing` havde autogenereret stub-metadata og norsk FAQ

- **Iteration start:** 2026-09-26 12:20 CEST på `ceo/c24-leasing-se`. Samme
  iteration som C23, efter at den grønne gate var passeret; den tredje og sidste
  lille forbedring inden for budgettet.
- **Datagrund:** `/leasing` på beraknare.se har **46 besøgende/28d** og
  **3.181 visninger, 30 klik, CTR 0,9 %, position 12,5** (GSC 2026-08-27..09-24).
  Det er den **eneste** svenska side tæt på top-10, altså hvor svar-først
  metadata har størst effekt: 30 klik er alt, siden ligger lige under grænsen.
- **Fund.** `page-data.ts:3404-3422` (SE) var en rå stub: titel "Leasing
  Kalkylator", metaDescription "Beräkna leasingbetalning och jämför leasing vs.
  billån. Gratis kalkylator.", keywords med bare "leasing"/"kalkylator"/"gratis",
  og tre placeholder-FAQ-svarmål med **norsk** (*jeg*, *kalkylatoren*).
  `LeasingBeregner.tsx` viste samtidig den **danske** enhed `kr./md` på alle tre
  resultatlinjer og i copy/resultSummary.
- **Beslutning/implementering:** tal fra kalkylatorens **egne** standardværdier, så
  de ikke kan være opdigtede: 300.000 kr bilpris, 150.000 kr restværde, 4,5 %
  rente, 30.000 kr kontantinsats, 36 måneder → afskrivning 120.000/36 = 3.333,33
  + 4,5 %/12 på 210.000 = 787,50 = **4.121 kr/mån**, **178.350 kr** totalt,
  **28.350 kr** rente. Enheden `kr./md` er nu `kr./{l.months}`, som i resten af
  komponenten allerede findes: `mån` (SE), `md` (DA), `mnd` (NO). FAQ'en er
  skrevet om til fem reelle spørgsmål med de samme tal.
  **Rettet i researchen:** C22's rapport sagde, at `no`-varianten var en
  klon af den svenske stub. Den er **ikke** — `noPages["leasing"]`
  (`page-data.ts:2251`) er norsk, så der opstår ingen divergens, og NO er
  bevidst urørt (domænet er ikke live, se ❓).
- **Acceptkriterier:**
  1. SE-titlen er svar-først med kalkylatorens eget standardtal, ≤ 60 tegn. **PASS**
  2. metaDescription/ogDescription/schemaDescription indeholder 4.121 kr og er
     ≤ 160 tegn. **PASS**
  3. FAQ'en er svensk, bruger 4.121/178.350 kr. og har ingen æ/ø. **PASS**
  4. Ingen `kr./md` på svensk (eller norsk/dansk) leasing-uddata. **PASS**
  5. DA og NO er bevidst uændrede; ingen anden side rørt. **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 12:22 CEST:** `npm run test` grøn (**1260/1260,
  121 filer** — 2 nye i `page-data.test.ts`), `npm run lint` grøn (511 filer),
  `npm run build` grøn (139 sider + typecheck, ingen nye advarsler).
- **MÅL:** `/leasing` (SE) Search Console baseline **3.181 visninger, 30 klik,
  CTR 0,9 %, position 12,5 pr. 2026-09-24**; Plausible **46 besøgende/28d
  pr. 2026-09-26**. Genmål 2026-10-10. Det interessante tal er **placeringen**:
  titlen og FAQ'en er nu svar-først, så en bevægelse fra 12,5 mod top-10 er det
  realistiske mål, ikke en CTR-effekt på eksisterende visninger.

#### 53. [x] FÆRDIG 2026-09-26 — C26 — `/efterloen` viste forkert alder og 962 timer for én præmieportion

- **Iteration start:** 2026-09-26 13:07 CEST på `ceo/c26-efterloen-alder`, som
  andre del af samme iteration som C25 (grøn gate, kun ~7 min brugt).
- **Datagrund:** `/efterloen` er en lille side (**9 besøgende/28d**,
  Plausible 2026-09-26) og har ingen GSC-række. Det er bevidst en
  **korrekthedsopgave, ikke en trafikopgave**: C22's research fandt to
  selvmodsigelser, og begge viste sig at ramme den officielle ordning.
- **Fund 1 — alderstabellen modsiger både borger.dk og vores egen
  `folkepension.ts`.** `EfterloensBeregner.tsx:86-104` og tabellen i
  `src/app/efterloen/page.tsx:69-95` sagde 1961 → 63/68, 1963 → 64/69, 1965+ →
  65/69+. borger.dk's skema (STAR) siger **1963-1966 → efterløn 65 / folkepension
  68** og **1967-1970 → 66 / 69**, hvilket er præcis den skala, C8's
  `folkepension.ts` verificerede og som `/efterloen`'s **egen FAQ**
  (`page-data.ts:1326`) allerede sagde. Værktøjet lovede altså efterløn **ét år
  for tidligt** for hele 1963-66-rækken og lovede folkepension et år for sent —
  og lovede dermed ét år for meget på efterløn.
- **Fund 2 — 962 mod 481 timer.** UI'en og FAQ'en sagde "mindst 962 timer/år kan
  du optjene skattefri præmie", mens koden delte på 481 (`// ~481 hours per
  portion`). borger.dk's præmieside er entydig: **481 arbejdstimer pr. portion**,
  12 portioner = 5.772 timer. C22's rapport havde altså fundet den rigtige
  kode-til-tekst-modstridelse, men den pegede den forkerte vej — det er **teksten**
  der var forkert, ikke divideren. Samme side oplyser portionsbeløbet til
  **15.870 kr. (fuldtid) / 10.580 kr. (deltid)**; koden havde 15.500 kr. uafhængigt
  af forsikring. borger.dk oplyser desuden, at optjening **mens man er på
  efterløn** forudsætter 2 års udskydelse + 3.120/2.496 timer i ventetiden —
  det var slet ikke i modellen.
- **Beslutning/implementering:** nyt modul `src/lib/efterloen.ts` med
  kilde + verificeringsdato, de fem rækker fra borger.dk's skema, præmiekonstanterne
  (481/12/15.870/10.580/3.120/2.496) og to funktioner: `efterloenAlder(fødselsår)`
  og `praemiePortioner(timer, harUdskudt)`. Værktøjet og sidetabellen læser begge
  fra modulet, så de ikke kan glide fra hinanden. **Tre konsekvente
  adfærdsændringer, alle kildeført:** (1) fødselsårsfeltet er 1956-1970, fordi
  bordet kun offentliggjør de år; ældre svarer "spørg din a-kasse" i stedet for et
  gjættet tal. (2) 1959 er et interval (63½-64 år), som vises eksplicit.
  (3) præmie kræver den ticked 2-års regel; ellers forklares hvorfor der er 0
  portioner, i stedet for at vise et tal uden dækning. Forudfyldte timer er
  1.560 (= 3.120/2), så feltet ikke længere starter på et tal uden kilde.
- **Acceptkriterier:**
  1. Født 1963-1966 → efterløn 65 år, folkepension 68 år, 3 år på efterløn. **PASS**
  2. Født 1967-1970 → 66/69. Født 1956-1958 → 63/67 og 4 år. **PASS**
  3. `folkepensionAge` er identisk med `folkepension.ts` for **alle** år
     1956-1970 — håndhævet af en krystest mellem de to moduler. **PASS**
  4. 481 timer = 1 portion, 5.772 timer = 12 portions (loft), 15.870/10.580 kr.
     og ingen 962-timers-tærskel i copy. **PASS**
  5. `/efterloen`'s FAQ og tabel er samlet i sync med værktøjet. **PASS**
  6. `npm run test`, `npm run lint` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 13:12 CEST:** `npm run test` grøn (**1278/1278,
  123 filer** — 14 nye i `src/lib/efterloen.test.ts`), `npm run lint` grøn
  (514 filer), `npm run build` grøn (139 sider + typecheck). SSR-kontrol af den
  byggede `/efterloen`: de nye tabelrækker, kilde-linket, 481-timers-teksten og
  15.870 kr. er alle i den server-renderede side.
- **Mål:** ingen CTR-baseline (siden har ingen GSC-række). Den nye krystest mod
  `folkepension.ts` gør en fremtidig glide mellem de to moduler til en
  **byggetids-fejl**, så de forkerte aldre kan ikke komme tilbage ved en senere
  redigering.
- **Forventet effekt:** lille trafikeffekt (9 besøgende/28d). Faglig korrekthed:
  en læser får nu den alder, a-kassen og borger.dk oplyser, i stedet for en der
  er ét år for tidlig. `/pension` og blogindlæggene er **urørte** — de bruger
  `folkepension.ts` og var allerede korrekte.
- **Kilder:** https://www.borger.dk/pension-og-efterloen/Efterloen-fleksydelse-delpension/efterloen/foer-du-gaar-paa-efterloen
  og https://www.borger.dk/pension-og-efterloen/Efterloen-fleksydelse-delpension/efterloen/skattefri-praemie

#### 52. [x] FÆRDIG 2026-09-26 — C25 — SE `/tidszone` var forankret i Danmark

- **Iteration start:** 2026-09-26 13:04 CEST på `ceo/c25-tidszone-locale`. Køen
  havde ingen `I GANG`-opgave, og STATUS pegede på det sidste åbne fund fra C22.
- **Datagrund:** `/tidszone` på beraknare.se har **3.189 visninger, 11 klik,
  CTR 0,3 %, position 7,7** (GSC 2026-08-27..09-24) og 15 besøgende/28d
  (Plausible 2026-09-26). Den danske side har 24.723 visninger, så **værktøjet er
  delt mellem domænerne** — det er derfor en skrivfejl i et klientværktøj træffer
  begge. Svenske søgninger på emnet er dokumenteret i GSC, bl.a. "hvad är det
  för klok hos er" og "tidsskillnad Sverige-USA".
- **Fund.** C22's rapport (`:2826-2831`) var korrekt: `TidszoneBeregner.tsx`
  mærkede hjemtidszonen som "Danmark (CET/CEST)" / "Köpenhamn" på **begge**
  domæner, tabellen hed "Tidsskillnad från Danmark", og sommertidsteksten sagde
  "Danmark byter till sommartid" — mens sidens egen svenska H2, tabel og prosa
  svarer fra Sverige (`src/app/tidszone/page.tsx:83-116`, `page-data.ts:3168-3171`
  med metaTitle "Vad är klockan i USA när det är 12 i Sverige?"). **Talberøringen
  var ikke berørt:** Sverige og Danmark deler CET/CEST (UTC+1/+2), så det var en
  mærkning, ikke en regnefejl. Sidens egen popularitetsrubrik for SE sagde
  desuden "från Centraleuropa", selv om resten af siden bruger Sverige.
- **Beslutning/implementering:** hjemtidszonen beholder sit id `dk` og sit offset
  (UTC+1) — **delt URL-state som `?d=...fraTidszone=dk` forbliver gyldig på begge
  domæner** — men navn og by mærkes nu pr. locale: DA "Danmark (CET/CEST)" /
  "København", SE **"Sverige (CET/CEST)" / "Stockholm"**. Rubrikken blev omdøbt
  fra `diffFromDenmark` til `diffFromHome` ("Tidsforskel fra Danmark" /
  "Tidsskillnad från Sverige"), sommertidsteksten peger på Sverige på svensk, og
  popularitetstabellen bruger den navngivne konstant `HJEM_UTC_FORSKEL` i stedet
  for et hårdkodet 60. SE-sidens rubrik er "Populära tidsskillnader från Sverige".
  Samme gennemgang af de danske forankringer i `TidsBeregner.tsx` og
  `DatoBeregner.tsx` (de to største svenska værktøjer) fandt **ingen** `Danmark`/
  `København`, så fundet var unikt for dette værktøj.
- **Acceptkriterier:**
  1. SE-værktøjet viser "Stockholm", "Sverige (CET/CEST)" og "Tidsskillnad från
     Sverige" og **ikke** "Köpenhamn" eller "från Danmark". **PASS**
  2. DA-værktøjet er uændret: "København", "Tidsforskel fra Danmark", ingen
     "Sverige". **PASS**
  3. Tidsforskel, dag-skift og URL-state er uændrede; `fraTidszone=dk` indlæses
     stadig i begge locales. **PASS** (ny test)
  4. DA-siden er uændret; kun SE-prosas rubrik er præciseret. **PASS**
  5. `npm run test`, `npm run lint` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 13:05 CEST:** `npm run test` grøn (**1264/1264,
  122 filer** — 4 nye i `TidszoneBeregner.test.tsx`), `npm run lint` grøn
  (512 filer), `npm run build` grøn (139 sider + typecheck; kun den ene kendte
  pre-existing CSS-advarselslinje).
- **MÅL:** `/tidszone` (SE) Search Console baseline **3.189 visninger, 11 klik,
  CTR 0,3 %, position 7,7 pr. 2026-09-24**; Plausible **15 besøgende/28d
  pr. 2026-09-26**. Genmål 2026-10-10. DA(`/tidszone`) forventes uændret:
  24.723 visninger, 115 klik, CTR 0,5 %, position 7,5 — det er en kontrol.
- **Forventet effekt:** svensk relevans og tillid på det svenska værktøj, ikke en
  stor CTR-effekt på dansk. Værktøjet på beraknare.se får samme svar-først
  forankring som sidens tekst, hvilket også er det Google læser forpligtigende
  data (FAQ/tabel) på.



#### 50. [x] FÆRDIG 2026-09-26 — C23 — Lønsiderne sagde 15 % topskat og tre forskellige kommuneskatter

- **Iteration start:** 2026-09-26 12:18 CEST på `ceo/c23-loenstal-2026`. Køen var
  tom efter C22, og tidsbudgetten tillod én lille, velafgrænset rigtig forbedring
  mere. C22's researchfund 1 og 2 var de to mindst ambitiøse og mest
  tillidsskadelige, så de blev taget.
- **Datagrund:** ingen ny sidebaseret baseline — `/loen-efter-skat` og
  `/brutto-netto` er ikke i GSC-top-15. Det er bevidst en **korrektheds**-opgave,
  fordi fejlen er synlig for den læser, der lander på siden, og fordi den går
  ind i `FAQSchema`-JSON-LD, som Google kan vise som svar i søgeresultater.
- **Fund 1 — afskaffet topskat som gældende lov.** `page-data.ts:1203` sagde
  "Tjener du over topskattegrænsen, betales også **15% topskat**", mens det
  **samme FAQ-array** to linjer længere nede (`:1205`) siger "Den gamle topskat på
  15% er afskaffet" og oplyser 7,5 % / 7,5 % / 5 %. Sidens egen prosa og
  `SATSER_2026` er enige om de nye brackets, så kilden var den ene række.
- **Fund 2 — kommuneskatten 2026 i tre værdier.** Korrekt og kildeført er
  `SATSER_2026.kommuneskatSnit = 25,049 %` (svmn.dk, jf. research-fund 7 og
  `satser-2026.test.ts`). Men `page-data.ts:1207` sagde **24,94 %** (hverken den
  gamle eller den nye værdi), `loen-efter-skat/page.tsx:84` sagde **25,07 %**
  **på samme side**, `page-data.ts:1231` sagde 25,07 % i `/brutto-netto`'s FAQ,
  og begge beregnere hardcodede `25.07` som forudfyldt værdi —
  `BruttoNettoBeregner.tsx:16` importerede endda `KOMMUNE_SNIT` **uden at bruge
  den**, mens `:195` læste kirkeskatten fra modulet. Kirkeskatten var tilsvarende
  hårdkodet til 0,68 % i `TopskatBeregner.tsx`.
- **Beslutning/implementering:** ét tal, ét sted. Copyen siger nu 25,049 %
  (FAQ) / ca. 25,05 % (prosa) og 0,639 % for kirkeskat, og begge beregnere henter
  forudfyldt værdi **og** fallback fra `SATSER_2026` i stedet for et hårdkodet
  tal. Topskat-svaret er skrevet om til 2026-brackets med den eksplicitte
  afskaffelsesnote. **Helt bevidst ikke rørt:** `/api/v1/loen` og
  `/api/v1`-dokumentationen bruger stadig 25,07 % / 0,68 %, fordi `/api/v1` er en
  frosset ekstern kontrakt i Danger Zones — det kræver Mads' beslutning, ikke en
  iteration (skrevet under ❓).
- **Acceptkriterier:**
  1. Ingen lønside nævner 24,94 %, 25,07 %, 0,68 % eller "15% topskat". **PASS**
  2. `/loen-efter-skat` og `/brutto-netto`'s FAQ nævner 25,049 %. **PASS**
  3. Topskat-svaret indeholder 7,5 % og "afskaffet". **PASS**
  4. Ingen hardkodet 25,07/0,68 tilbage i komponenter eller på lønsiderne. **PASS**
  5. `/api/v1` er byte-for-byte urørt. **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 12:31 CEST:** `npm run test` grøn (**1258/1258,
  121 filer** — 3 nye i `page-data.test.ts`), `npm run lint` grøn (511 filer),
  `npm run build` grøn (139 sider + typecheck; kun de 7 kendte pre-existing
  CSS-advarsler).
- **Mål:** ingen CTR-baseline. Den nye test `2026-skattetall i lønsidernes FAQ`
  gør de fire forældede tal til en **byggetids-fejl**, så de kan ikke komme
  tilbage ved en senere redigering.
- **Forventet effekt:** troværdighed på sitets mest brugte lønværktøj og korrekt
  JSON-LD; effekten er ikke målbar i trafiktal og skal ikke påstås som sådan.

#### 54. [x] FÆRDIG 2026-09-26 — C27 — Solcellernes levetid og depositum stod i tre hver

- **Iteration start:** 2026-09-26 13:18 CEST på `ceo/c27-solceller-og-depositum`.
  Køen var tom (alle 53 opgaver færdige, intet `I GANG`), og STATUS pegede på de tre
  **ubekræftede** fund fra C22's research. Som aftalt blev hvert fund læst på den
  konkrete linje, før det blev ændret — ét af dem viste sig at være **fejlagtigt**.
- **Fund 1 — `/billaan`'s eksempeltabel: FALSIFICERET, ingen kodeændret.** Fundet
  sagde "7 %-tal i to 7-års-rækker under overskriften *Rente 6 %*". Der er ingen
  sådan overskrift: tabellen har en `Ränta`-kolonne, og alle tre rækker står til
  7 %. Regnestykket holder: lånebeløbet er *prisen minus kontantinsatsen*, så
  række 1 er 150.000 − 30.000 = 120.000 kr over 60 måneder → 2.375 kr
  (tabellen siger 2.376) og 2.376 × 60 + 30.000 = 172.560 (tabellen siger
  172.600). Række 2: 200.000 over 84 måneder → 3.019 kr (3.020) og
  3.020 × 84 + 50.000 = 303.680 (303.700). Række 3: 280.000 over 84 måneder →
  4.227 kr (4.228) og 4.228 × 84 + 70.000 = 425.152 (425.200). Alle tre er
  korrekte annuitetsbetalinger ved 7 %. **Dette er C22's lærepoint gentaget:**
  et fund skal læses helt, ikke kun fejlretningen.
- **Fund 2 — solcellernes levetid: BEKRÆFTET, tre forskellige tal i live-kopien.**
  `/solceller`'s indlæg sagde "herefter producerer anlægget gratis strøm i
  yderligere **15-20 år**" (`src/app/solceller/page.tsx:46`, samme fejl i den
  svenska tekst i linje 69), FAQ'en sagde "Herefter gratis strøm i **25-30 år**"
  (`src/lib/page-data.ts:1114` → 7-12 + 25-30 = 32-42 år i alt), og
  `SolcelleBeregner` regnede med `const levetid = 25` (hårdkodet,
  `src/components/SolcelleBeregner.tsx:275`). Tre tal, ingen kilde.
- **Beslutning/implementering:** `SOLCELLE_LEVETID_AAR = 25` +
  `SOLCELLE_LEVETID_AAR_MIN/MAX = 25/30` ligger nu ét sted i
  `src/lib/energi/solceller.ts`, og **alt tre** læser derfra: beregneren, sidens
  danske og svenska indlæg og FAQ'en. Beregningen bruger den **nedre** ende af
  intervallet, fordi panelernes output falder med årene, så den samlede besparelse
  ikke overvurderes. Copy'en siger nu "producerer typisk strøm i 25-30 år i alt —
  altså 13-23 år mere efter tilbagebetalingen", hvilket er entydigt med
  tilbagebetalingen på 7-12 år. Ny test `src/app/fact-consistency.test.ts`
  (6 tests) garderer både at konstanten bruges og at de gamle formuleringer
  ("yderligere 15-20 år", "Herefter gratis strøm i") ikke kan komme tilbage.
- **Fund 3 — depositum på lejebolig: BEKRÆFTET, siderne modsagde værktøjerne.**
  `/husleje`'s FAQ sagde "**1-3** måneders husleje i depositum"
  (`src/lib/page-data.ts:1525`), `/flyttebudget`'s FAQ sagde "**3-6** mdrs.
  husleje" (linje 1799), mens `HuslejeBudgetBeregner` siger "spare op til **3**
  måneders husleje i depositum" på begge domæner
  (`src/components/HuslejeBudgetBeregner.tsx:54,134`). Rettet til ét tal — 3
  måneder — i begge FAQ'er. Depositummet er **typisk** praksis, ikke et lovkrav, så
  formuleringen siger "typisk" og intet om en maksimal grænse. Den samme test
  garderer, at de to intervaller ikke kan komme tilbage.
- **Datagrund:** `/solceller` er ikke blandt de 15 største sider, men er en af
  sitets bedste voksende energiværktøjer, og `/husleje` (166 besøgende/28d) +
  `/flyttebudget` er bolig-sider med købsintention. Målene er derfor **ikke**
  CTR-baselines; effekten er korrekthed og tillid, ikke flere klik.
- **MÅL:** `/husleje` baseline 166 besøgende/28d 2026-09-26 (uændret). Ingen
  baseline for `/solceller` (ikke i Plausible-top-15); næste snapshot bør give
  den, hvis siden er stor nok til at tælle.
- **Acceptkriterier:**
  1. Der er præcis ét sted i repoet, der definerer solcellernes levetid, og
     beregner, dansk indlæg, svensk indlæg og FAQ læser det. **PASS**
  2. "15-20 år" og "Herefter gratis strøm i 25-30 år" findes ikke i solcellernes
     danske eller svenska copy. **PASS**
  3. Depositum står som 3 måneder på `/husleje`, `/flyttebudget` og i
     `HuslejeBudgetBeregner` (DA + SE). **PASS**
  4. Ny test dækker begge fund og kan fange en regression. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Kvalitetsgate 2026-09-26 13:25 CEST:** `npm run test` grøn (**1284/1284, 124
  filer** — 1 ny fil med 6 tests), `npm run lint` grøn (515 filer), `npm run
  build` grøn (**139 sider** + typecheck).
- **Forsøgt og opgivet:** primærkilder blev forsøgt hentet (Energistyrelsen,
  AIDA, retsinformation, Bing/DuckDuckGo) — energistyrelsen og aida.dk's
  søgning gav 404, retsinformation er JS-renderet, og begge søgemaskiner
  bot-blokerer. Levetidsintervallet er derfor skrevet som **branchestyret** med
  eksplicit note i koden, ikke som en kildeført myndighedsfakta. Se ❓.
- **Forventet effekt:** lille og konkret — to sider længere ikke modsige sig
  selv eller deres værktøj. Den strukturelle gevinst er, at intervallet nu er ét
  tal, så den næste redigering ikke kan glide fra hinanden.



#### 55. [x] FÆRDIG 2026-09-26 — C28 — `/dato`: dagstyperne summerede til mere end "Antal dage"

- **Iteration start:** 2026-09-26 13:48 CEST på `ceo/c28-dato-dagstalene`. Køen var
  tom (alle 54 opgaver færdige, intet `I GANG`), og de åbne deploynoter kan først
  verificeres efter 17:30, så valget var en ny faktagrundlæggende opgave. En
  read-only audit af de otte mest trafikrige værktøjer (`TidsBeregner`,
  `BoligstoetteBeregner`, `DatoBeregner`, `HuslejeBudgetBeregner`,
  `BraendstofBeregner`, `KalorierBeregner`) fandt dette og fire mindre fund.
- **Datagrund:** `/dato` er sitets **største side** — 1.045 besøgende/28d (+76 %),
  963 indgangssider, bounce 5 %, og Search Console 130.392 visninger, 801 klik,
  CTR 0,6 %, position 5,8 pr. 2026-08-27→2026-09-24. De største søgninger er
  "hvor mange dage er der til 1 december" (996 visninger, 2 klik, pos 5) og
  "dage mellem datoer" (450 visninger, 11 klik, pos 5). Det er altså netop
  svar-først-siden der gør fejlen særlig dyr.
- **Fund 1 — systematisk +1 (BEKRÆFTET).** `DatoBeregner.tsx:208` beregner
  `diffDays = slut − start` (**eksklusivt**), mens `taellArbejdsdage`,
  `taellWeekender` og `taellHelligdage` er dokumenteret **inklusive** begge ender
  (`src/lib/helligdage.ts:143,159,179` via `eachDay`). 28.→29. september 2026
  viste derfor "Antal dage 1" ved siden af "Arbejdsdage 2, Weekenddage 0,
  Helligdage 0". Standardvisningen på sitets største side summede altså til 31
  dage, når der stod 30.
- **Fund 2 — dobbelt-tælling af weekendhelligdage (BEKRÆFTET, nyt).** 26. december
  2026 er både en lørdag og 2. juledag, så den blev tælt i både "Weekenddage" og
  "Helligdage". Intervalet 20. december 2026 → 5. januar 2027 summerede til 17 mod
  "Antal dage" 16; påskeintervallet 27. marts → 6. april 2026 (påskedag 5. april er
  en søndag) til 11 mod 10. Det var et **selvstændigt** fund og ville ikke være
  løst af en halvdels korrektion af fund 1.
- **Beslutning/implementering:** tællerne kører nu over det halvåbne interval
  `(fra, til]`, så de dækker præcis de `diffDays` dage, "Antal dage" står for.
  Helligdagstælleren i UI'en er den nye `taellHelligdagePaaHverdag`, som springer
  weekendhelligdage over, fordi de allerede tælles som weekenddage; bibliotekets
  `taellHelligdage` er bevaret uændret (inkl. alle officielle helligdage), fordi
  et eksisterende test bevidst forventer overlap på enkeltdagsniveau. Nytårsaften
  er på dansk hverken arbejdsdag, weekenddag eller helligdag, så den kan ikke
  ligge i felterne: komponenten viser nu en note, når den ligger i intervallet,
  med præcis den regel `/dato`'s egen indlæg allerede dokumenterer
  (`src/app/dato/page.tsx:111-115`). Den svenska kalender tæller nytårsaften som
  helgdag, så summeringen er der præcis, og noteren vises kun på dansk.
- **Kvalitetsgate 2026-09-26 14:29 CEST:** `npm run test` grøn (**1292/1292, 125
  filer** — 1 ny fil), `npm run lint` grøn (516 filer), `npm run build` grøn
  (typecheck inkluderet).
- **Tests:** ny `src/components/DatoBeregner.test.tsx` (4 tests) renderer
  komponenten via URL-state og summerer de faktiske felter for 1 dag, for
  nytårsaftens-intervallet (med noter), for den svenska kalender og for samme dag.
  `helligdage.test.ts` fik 12 tests for `taellNytarsaften`,
  `taellHelligdagePaaHverdag` (inkl. påskedag på søndag og 7/5/6 helligdage på
  hverdag i 2026/27/28) og en partitionstest over syv intervaller i begge
  lokaler. Den er lavet som en **generel invariant**, så en fremtidig ændring i
  kalenderen ikke kan bryde summeringen usynligt.
- **MÅL:** `/dato` baseline **1.045 besøgende/28d, 963 indgangssider, bounce 5 %
  pr. 2026-09-26**; Search Console baseline 130.392 visninger, 801 klik, CTR 0,6 %,
  position 5,8 pr. 2026-08-27→2026-09-24 — genmål 2026-10-10.
- **Acceptkriterier:**
  1. Arbejdsdage + weekenddage + helligdage summerer til "Antal dage" for alle
     intervaller i begge lokaler, nytårsaften undtaget. **PASS**
  2. 28.→29. september 2026 viser 1 / 1 / 0 / 0, og samme dato→samme dato viser 0
     i alle felter. **PASS**
  3. 20. december 2026 → 5. januar 2027 summerer til 15 og forklarer den 16. dag
     i en note. **PASS**
  4. Den svenska side summerer til 16 uden note, fordi nytårsaften er helgdag der.
     **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** ingen direkte trafikstigning — det er en **tillids- og
  korrekthedstask** på sitets største og hurtigst voksende side, hvor det store tal
  og felterne nu kan summeres. Den konkrete søgeintention ("hvor mange dage er der
  til X") er urørt, så CTR-baslinen ovenfor er ren.
- **Falsificeret undervejs (C22's lærepoint):** min første hypotese var, at
  halvåbent interval alene løste fund 2. Partitionstesten viste 17 mod 16, fordi
  26. december blev tælt to gange. Fundet blev læst helt, ikke kun rettet.

#### 56. [x] FÆRDIG 2026-09-26 — C29 — `/kalorier`: proteinmængden følger nu dit mål

- **Iteration start:** 2026-09-26 14:08 CEST på `ceo/c29-kalorier-protein`. Køen var
  tom (alle 55 opgaver færdige, intet `I GANG`), og de otte åbne deploynoter kan først
  verificeres efter 17:30, så valget var et nyt faktagrundlæggende fund fra C28's
  kandidatliste. Kandidaterne blev prioriteret efter trafik: `/kalorier` (286
  besøgende/28d) og `/braendstof` (271) ligger over `/flyttebudget`, `/husleje` (166)
  og `/pension` (140).
- **Datagrund:** `/kalorier` 286 besøgende/28d (+46 %), 255 indgangssider, bounce 4 %;
  Search Console 12.332 visninger, 124 klik, CTR 1,0 %, position 8,2 pr.
  2026-08-27→2026-09-24. Største søgning "kalorieberegner" 204 visninger, 1 klik,
  position 17 — positionen er lav, men siden er allerede svar-først (C5), så det
  åbne her var **ikke** titlen, men et konkret fejltal i værktøjet.
- **Fund (BEKRÆFTET, egen kode mod sidens egen tekst):** `KalorieBeregner.tsx:195`
  sat `protein = vaegt * 1.8` **uanset mål**, mens `/kalorier`'s egen tekst i begge
  lokaler lister 0,8-1,2 g/kg for vedligehold, 1,2-1,6 for vægttab og 1,6-2,2 for
  muskelopbygning (`page.tsx:86-96` DA, `:174-184` SE), og FAQ'en gentager det samme
  (`page-data.ts:606` DA, `:1874` SE). Ved sidens eget eksempel på 80 kg viste
  værktøjet **144 g** for "Vægttab" (1,8 g/kg) mod sidens 96-128 g — og 144 g for
  "Vedligehold", som slet ikke er i det dokumenterede interval. Fedt (25 %) og
  kulhydrater (resten) var korrekte, så det var **én** konstant, der slog hele
  makro-fordelingen.
- **Beslutning/implementering:** Ny delt enhedsfil `src/lib/makroer.ts` er
  single source for protein-intervallerne pr. mål, fedtandelen (25 %) og
  kcal-pr.-gram. `beregnMakroer()` bruger **midten** af det valgte interval, så
  værktøjet ikke kan glide fra siden igen. Protein-kortet viser nu g/kg'en og
  intervallet (`1,4 g/kg protein (interval 1,2-1,6)`), så brugeren kan se hvorfor
  tallene ændrer sig. Sidens to lister (DA + SE) renderer nu intervallerne fra
  samme modul i stedet for hardkodede tal, med én ekstra linje om midten. Midterne er
  et estimat, ikke en ordination — samme forbehold som siden.
- **C27-rest, samme systematik som C22's depositumfund:** `flyttebudget/page.tsx:51`
  sagde "3-6 måneders husleje" og "25.000-40.000 kr" hos mægler mod "typisk 3 mdrs."
  og "25.000-50.000 kr" i samme sides FAQ (`page-data.ts:1800`) og mod værktøjets
  egen slider (`FlyttebudgetBeregner.tsx:28`, max 60000). Rettet til 3 måneder og
  25.000-50.000 kr.
- **Tests:** ny `src/lib/makroer.test.ts` (11 tests) — midten af hvert interval,
  protein stiger med målet, intervallerne overlapper ikke, fedt er 25 %, summen af
  makro-kalorier er lig kalorierne (og kulhydrater er aldrig negative) for fem
  kalorieindhold, protein ligger **altid** i det dokumenterede interval for 35-200 kg
  × alle tre mål, og 0 kg giver 0 protein i stedet for negativt. Ny
  `src/components/KalorieBeregner.test.tsx` (5 tests) renderer komponenten via
  URL-state: 80 kg giver 80 / 112 / 152 g for vedligehold / tab / opbyg, g/kg'en og
  intervallet står i proteinfeltet, og den svenska visning bruger decimal-komma. Den
  sidste test låser den konkrete regression ved UI-niveau, ikke kun i modulet.
- **Kvalitetsgate 2026-09-26 14:28 CEST:** `npm run test` grøn (**1308/1308, 127
  filer** — 2 nye filer), `npm run lint` grøn (519 filer), `npm run build` grøn
  (typecheck inkluderet, 137 sider).
- **MÅL:** `/kalorier` baseline **286 besøgende/28d, 255 indgangssider, bounce 4 %
  pr. 2026-09-26**; Search Console baseline 12.332 visninger, 124 klik, CTR 1,0 %,
  position 8,2 pr. 2026-08-27→2026-09-24 — genmål 2026-10-10.
- **Acceptkriterier:**
  1. 80 kg viser 80 g protein ved vedligehold, 112 g ved vægttab og 152 g ved
     muskelopbygning, og hvert resultat ligger i sidens dokumenterede interval.
     **PASS**
  2. Protein-kortet viser g/kg'en og intervallet i begge lokaler, med
     locale-decimal. **PASS**
  3. Sidens proteinlister læder intervallerne fra `src/lib/makroer.ts`, så de ikke
     kan afvige fra værktøjet. **PASS**
  4. Fedt er 25 % af kalorierne, kulhydrater resten, og summen er lig
     kaloriebehovet. **PASS**
  5. `/flyttebudget` siger 3 måneder i depositum og 25.000-50.000 kr hos mægler,
     samme sted som FAQ'en og slideren. **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** ingen direkte CTR-stigning — det er en **tillids- og
  korrekthedstask** på en side, der allerede er svar-først, og hvor værktøjet
  tidligere sagde noget andet end siden. To sider med samme navn, men forskellige
  tal, er præcis den slags fejl der får folk til at gå i googlen i stedet. Den
  konkrete søgeintention er urørt, så CTR-baslinen ovenfor er ren.
- **Utaget bevidst:** proteinbehovet **er ikke** kilt til `/proteinbehov`
  (`src/lib/proteinbehov.ts`, aktivitetsbaseret 0,8-2,0 g/kg). Kalorieberegneren
  kender aktivitetsniveau og mål, proteinbehov-værktøjet kender kun aktivitet, så
  de to svar på "hvad skal jeg spise" giver forskellige tal uden fælles grund.
  Det er et reelt begreb (samme faglige område, to rækkevidder), men det kræver en
  beslutning om, hvilken der er source of truth — noteret, ikke løst i denne
  iteration.

#### 57. [x] FÆRDIG 2026-09-26 — C30 — `/braendstof`: FAQ'en lovede el 50-70 % billigere, værktøjet viser 40 % mod diesel

- **Iteration start:** 2026-09-26 14:37 CEST på `ceo/braendstof-el-sparet`. Køen var
  tom (alle 56 opgaver færdige, intet `I GANG`), og de ni åbne deploynoter (C23-C29)
  kan først verificeres efter 17:30-vinduet, så valget var C28's førstelistede
  kandidat.
- **Datagrund:** `/braendstof` **271 besøgende/28d (+69 %), bounce 3 %** pr.
  2026-09-26; Search Console **16.580 visninger, 180 klik, CTR 1,1 %, position 6,1**
  pr. 2026-08-27→2026-09-24. Søgninger: "benzin beregner" 133v/4k pos 6, "brændstof
  beregner" 97v/1k pos 7, "benzinberegner" 52v/4k pos 7, "hvorfor er diesel dyrere end
  benzin" 48v/1k **pos 1**. Den sidste søgning er allerede nummer ét, så vejen derhen
  virker — siden skal bare svare på den, ikke lokke med et løfte den ikke holder.
- **Fund (BEKRÆFTET, egen kode mod egen kode):** FAQ'en i alle tre lokaler lovede el
  "typisk 50-70 % billigere pr. km" (`page-data.ts:853` DA, `:2119` NO, `:3272` SE).
  Værktøjets egen sammenligningstabel (`BraendstofBeregner.tsx:530-532`) bruger
  benzin 15 km/l à 13,50 kr = 0,900 kr./km, diesel 18 km/l à 12,80 kr = 0,711 kr./km
  og el 17 kWh/100km à 2,50 kr = 0,425 kr./km. Det er **52,8 % mod benzin** — faldt
  heldvis i intervallet — men **40,2 % mod diesel**, under 50 %. Diesel er billigere
  pr. km end benzin i forvejen, så det lave interval er ikke en fejl i tabellen men i
  løftet. Ved værktøjets eget eget hint om offentlig opladning (3-6 kr./kWh) er el
  desuden **dyrere** end diesel over 4,2 kr./kWh. Alle tal stod i samme viewport.
- **Beslutning/implementering:** Ny `src/lib/braendstof.ts` er single source for
  forudsætningerne og priserne pr. km: `BRAENDSTOF_FORUDSETNINGER`, `prisPrKm()`,
  `besparelseProcent()` og `breakEvenKwhPris()`. `BraendstofBeregner.tsx` læser
  nu forudsætningerne i stedet for de seks hardkodede tal (startværdier, reset og
  sammenligningstabellen), og kolonneoverskrifterne + `compareNote` bygges af dem, så
  en prisændring slår igennem alle steder. FAQ'en er ikke længere et håndskrevet
  interval: den renderer `besparelseProcent()` for benzin **og** diesel, siger hvorfor
  de to tal afviger, og nævner break-even ved offentlig opladning. Bevidst valgt: det
  er samme systematik som C27's depositumfund, C28's dagstal og C29's makroer — find
  en tekst, der modsiger værktøjet, og gør tallet **udledt** i stedet for gentaget.
- **Tests:** ny `src/lib/braendstof.test.ts` (**18 tests**) — pr. km for alle tre
  typer, forudsætningerne læses ét sted, besparelsen er 52,8 / 40,2 % med kommatal,
  mod diesel er **mindre** end mod benzin, break-even er 4,18 mod diesel og 5,29 mod
  benzin, og ved break-even er de to pr. km lige dyre. Derudover fire tests der
  læser `page-data.ts`' rigtige FAQ i **alle tre** sprog: at "50-70" er væk, at begge
  udledte grader står, at benzin-graden står før diesel-graden, og at procent skrives
  med komma — det sidste blev fundet i denne iteration, da første kørsel skrev
  "52.8 %" på en dansk side.
- **Kvalitetsgate 2026-09-26 14:52 CEST:** `npm run build` grøn (typecheck
  inkluderet), `npm run test` grøn (**1326/1326, 128 filer** — 1 ny fil),
  `npm run lint` grøn (521 filer), `npm audit --json` 0 sårbarheder.
- **MÅL:** `/braendstof` baseline **271 besøgende/28d, bounce 3 % pr. 2026-09-26**;
  Search Console baseline 16.580 visninger, 180 klik, CTR 1,1 %, position 6,1 pr.
  2026-08-27→2026-09-24 — genmål 2026-10-10. Titlen er **urørt** (C9's svar-først-variant
  står), så dette er ren korrekthedstask, ikke en CTR-eksperiment.
- **Acceptkriterier:**
  1. Ingen af de tre sprogversioner indeholder "50-70" i el-svaret. **PASS**
  2. El-svaret nævner 52,8 % mod benzin og 40,2 % mod diesel, begge udledt af
     `braendstof.ts`. **PASS**
  3. `BraendstofBeregner.tsx` indeholder ingen hardkodede 13,50 / 12,80 / 2,50 / 15 /
     18 / 17 til sammenligningstabellen. **PASS**
  4. Procent og kr./km staves med komma i dansk, svensk og norsk. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** ingen direkte CTR-stigning. Det er en tillidsopgave på en side
  med 271 besøgende og bounce 3 %, hvor løftet og tabellen lå i samme skærmbillede.
  Værdien er, at "hvorfor er diesel dyrere end benzin" (allerede position 1) nu har et
  svar på siden, og at tallene ikke kan glide fra hinanden igen.
- **Utaget bevidst:** `/elbil` sammenligner kun el mod benzin og er derfor ikke i
  konflikt, men den bruger sine egne forudsætninger. At slå `/elbil` sammen med
  `braendstof.ts` er en reel konsolidering og tages som sit egen opgave, når tiden
  er til det — ikke som en sidevirkning her.

#### 58. [x] FÆRDIG 2026-09-26 — C31 — `/pension`: værktøjet lovede folkepensionsalder 68 år for alle

- **Iteration start:** 2026-09-26 14:54 CEST. Køen var tom (alle 57 opgaver færdige,
  intet `I GANG`). Deploy-vinduerne er lukket til 17:30, så de elleve åbne noter kan
  ikke verificeres; intet var gammelt nok til `DEPLOY-MISSING`.
- **Datagrund:** `/pension` 140 besøgende/28d (+31 %, bounce 2 %) pr. 2026-09-26.
  Search Console: 6.013 visninger, 35 klik, CTR 0,6 %, position 7,8 pr. 2026-08-27→
  2026-09-24. Kandidaten var C28's egen fund, ikke et nyt CTR-fund.
- **Fundet:** `PensionBeregner.tsx:224` havde `helpText="Folkepensionsalder er 68 år
  (stigende)"`, mens samme sides egen tabel (renderet fra
  `folkepensionsalderRækker()`) siger 65-70 år efter fødselsår, og det testede modul
  `src/lib/folkepension.ts:38-47` har hele skalaen. **Værktøjets egen standardbruger er
  30 år → født ca. 1996 → folkepensionsalder 70 år**, så hjælpeteksten undervurderer
  den valgte alder med to år. Konsekvensen er reel: en 30-årig, der vælger "Ønsket
  pensionsalder 68" (standardværdien), regner på at spare to år for lidt, og værktøjet
  siger intet om, at folkepensionen først udbetales ved folkepensionsalderen. Samme
  mønster som C26 rettede i `EfterloensBeregner`.
- **Beslutning/implementering:** `folkepensionsalderForAlder(alder, nuAar?)` er ny
  ren funktion i `src/lib/folkepension.ts`. Den estimerer fødselsåret som
  `nuAar - alder`, bruger altid det **højeste** trin i året (aldrig lavere end den
  reelle alder, samme konservative valg som `efterloenAlder`) og sætter `praecis:
  false` for de to fødselsår, der går på tværs af et halvt trin (1954, 1955).
  Værktøjet læser den i stedet for det hardkodede 68, og resultatfeltet siger nu
  eksplicit, om den valgte alder ligger før, på eller efter folkepensionsalderen — med
  "du skal selv søge" i de to sidste tilfælde. Fødselsåret er et estimat, så
  formuleringerne bruger "ca.". Beregningen, URL-state, delelink, reset og alle
  beløb er urørt; ingen ny felt, ingen title- eller description-ændring.
- **Landet:** kode + plan i commit `7a118fe`; merge til `master` er `f5304ec`
  2026-09-26 15:08 CEST. Begge refs pushet. `/api/health` svarer `status: ok`.
- **Kvalitetsgate 2026-09-26 15:00 CEST:** `npm run build` grøn (typecheck
  inkluderet), `npm run test` grøn (**1334/1334, 128 filer** — 8 nye tests: 4 i
  `folkepension.test.ts`, 4 i `PensionBeregner.test.tsx`), `npm run lint` grøn
  (521 filer). De nye komponenttests fejlede ikke undervejs; de låser den udledte alder
  for 30- og 60-årige, at "68 år"-teksten er væk, og alle tre relationer.
- **MÅL:** `/pension` baseline **140 besøgende/28d, bounce 2 % pr. 2026-09-26**;
  Search Console baseline 6.013 visninger, 35 klik, CTR 0,6 %, position 7,8 pr.
  2026-09-24 — genmål 2026-10-10. Titlen er urørt, så dette er ren korrekthedstask.
- **Acceptkriterier:**
  1. `PensionBeregner.tsx` indeholder ingen hardkodet folkepensionsalder. **PASS**
  2. Standardbrugeren (30 år) ser "Din folkepensionsalder er ca. 70 år (født ca. 1996)"
     i stedet for "Folkepensionsalder er 68 år". **PASS**
  3. Resultatfeltet siger, om den valgte alder ligger før/på/efter folkepensionsalderen,
     og nævner at folkepensionen skal søges. **PASS**
  4. `folkepensionsalderForAlder` er testet på skalaens skifteår, på et tværgående år
     (65½ / 66½) og på fødselsår før 1954. **PASS**
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** Ingen direkte CTR-stigning. Det er en tillidsopgave: en læser
  på en side med 2 % bounce får nu det samme svar i værktøjet som i tabellen ovenfor,
  og sparetiden beregnes mod den alder, hvor folkepensionen faktisk begynder.

#### 59. [x] FÆRDIG 2026-09-26 — C32 — `/elbil`: ét ratested, og "under halvdelen" holdt ikke

- **Iteration start:** 2026-09-26 15:30 CEST. Køen var tom (alle 58 opgaver færdige,
  intet `I GANG`), og de elleve åbne deploynoter kan først verificeres i 17:30-vinduet.
  Valget var C30's eget fund, som STATUS pegede på som egen opgave.
- **Datagrund:** `/elbil` står ikke i Plausible-top-15 eller i GSC-snapshottet, så
  den har **ingen målt baseline** — kun 11 interne referencer i koden
  (`calculator-list.ts:76,202`, `categories.ts:83`, to blogindlæg, ikonet). Nærmeste
  målbare slægtning er `/bil` (27 besøgende/28d, faldet 48 → 27) og SE `/bil` (1.719
  visninger, position 32,9). Derfor er opgaven en tillidsopgave, ikke en
  trafikopgave, og det står skrevet i MÅL-linjen.
- **Fundet:** C30's advarsel holdt stik. `/elbil` havde sine egne forudsætninger
  hardkodet i `ElbilBenzinBeregner.tsx` (18 kWh/100 km, 16 km/l, 2,50/13,50 kr. DA og
  2/19 kr. SE), mens `src/lib/braendstof.ts` holder 17 kWh/100 km og 15 km/l. To
  el/benzin-sammenligninger på samme site, ingen fælles kilde. Og tre steder lovede
  "under halvdelen":
  1. `src/lib/page-data.ts:59` (DA FAQ): "Ved normale priser koster el ofte under
     halvdelen af benzin pr. km." Ved værktøjets **egne** standarder er el 0,45 mod
     benzins 0,84375 kr. pr. km — altså **53 % af benzinprisen**. Løftet er falsk,
     præcis som C30's "50-70 %" var.
  2. `src/app/elbil/page.tsx:58` (DA prosa) og `:82` (SE prosa) sagde det samme. SE
     holdt tilfældigt ved 69,7 %, men var heller ikke bundet til værktøjet.
  3. `src/app/blog/spar-penge-paa-braendstof/page.tsx:198`: "Opladning hjemme koster
     under halvdelen af benzin per kilometer" — holdt kun fordi artiklens egen tabel
     bruger 7 l/100 km (0,91 kr. pr. km), altså en **anden benzinbil** end værktøjets.
- **Dertil et regnestykke, der ikke holdt:** `biloekonomi`-artiklens
  brændstofafsnit lovede "ca. 938 liter til ca. 13.500 kr" og "ca. 5.400 kr i strøm"
  og "en besparelse på over 8.000 kr/år". 938 liter × 13,50 = **12.656**, og 5.400 kr
  for 2.700 kWh forudsætter **2,00** kr./kWh — altså den svenska elpris, ikke
  værktøjets danske 2,50. Regnestykket med 2,50 giver 6.750 kr. og en besparelse på
  **5.906** kr., altså under de lovede 8.000. To af tre tal var for høje.
- **Beslutning/implementering:** ét sted — `ELBIL_FORUDSETNINGER` i
  `src/lib/braendstof.ts` med `elbilForudsætninger(locale)` (alt ikke-`se` får dansk)
  og `elbilSammenligning(locale)`, som giver el-pris pr. km, benzin-pris pr. km,
  besparelse i procent, årlig besparelse og break-even-pris pr. kWh. Værktøjet læser
  alle sine standarder (også reset) derfra, så `/elbil` og `/braendstof` ikke længere
  kan glide fra hinanden. De to sæt er bevidst forskellige — tabellen på `/braendstof`
  er et konservativt flådesnit, `/elbil` er én moderne bil — og en test låser
  retningen, så en fremtidig ændring skal være en bevidst beslutning. DA-FAQ, SE-FAQ,
  sidens prosa i begge sprog og **begge blogartikler** renderer nu de udledte tal.
  `/braendstof`'s egne tal (52,8 % / 40,2 %, 0,43/0,90/0,71) er urørt, så C30's åbne
  deploynote kan stadig verificeres mod præcis de tal.
- **Landet:** kode `e0c65d5`, plan samlet i samme commit; merge til `master` er
  `d4a8183` 2026-09-26 16:15 CEST. Begge refs pushet. `/api/health` svarer 200.
- **Kvalitetsgate 2026-09-26 16:12 CEST:** `npm run build` grøn (typecheck
  inkluderet), `npm run test` grøn (**1344/1344, 129 filer** — 10 nye tests: 7 i
  `braendstof.test.ts`, 3 i den nye `ElbilBenzinBeregner.test.tsx`), `npm run lint`
  grøn (522 filer).
- **MÅL:** `/elbil` har **ingen trafikbaseline** i snapshottet (ikke i top-15, ikke i
  GSC) — genmåles først når Plausible/GSC melder den. Titler og description er
  urørte, så dette er ren korrekthedstask. Til gengæld er alle tre løfteafsnit nu
  falsificerbare: tallene 0,45/0,84 kr. pr. km, 46,7 %, 4,7 kr./kWh og 5.900 kr./år
  står på side, FAQ og blog og kommer fra ét modul.
- **Acceptkriterier:**
  1. `ElbilBenzinBeregner.tsx` indeholder ingen hardkodede 18/16/2,5/13,5/2/19 —
     de læses fra `ELBIL_FORUDSETNINGER`. **PASS**
  2. "under halvdelen" er væk fra `/elbil`-siden, FAQ'en og
     `spar-penge-paa-braendstof`. **PASS**
  3. DA-FAQ'en siger 0,45 mod 0,84 kr. pr. km, 46,7 % og 4,7 kr./kWh; SE-FAQ'en siger
     0,36 mod 1,19 kr/km, 69,7 % og 6,6 kr/kWh. **PASS**
  4. `biloekonomi`-afsnittet siger 12.656 kr. benzin, 6.750 kr. el og ca. 5.900 kr. i
     besparelse — ikke 13.500/5.400/"over 8.000". **PASS**
  5. `/braendstof`'s 52,8 % / 40,2 % og tabelværdierne er uændrede. **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** Ingen målbar trafikstigning — `/elbil` har ingen baseline, og
  det er ikke en CTR-klasse. Det er en tillidsopgave: elbil-læseren får samme tal i
  værktøjet, i FAQ'en og i artiklerne, og et løfte, der var konkret forkert, er væk.

#### 60. [x] FÆRDIG 2026-09-26 — C33 — `/husleje`: eksemplet er nået i værktøjet, og el/vand/varme kan trækkes fra

- **Iteration start:** 2026-09-26 15:49 CEST. Køen var tom (alle 59 opgaver færdige,
  intet `I GANG`), de tolv åbne deploynoter kan først verificeres efter 17:30, og
  STATUS pegede på den **eneste** tilbage fra C28's kandidatliste: `/husleje`.
- **Datagrund:** `/husleje` 166 besøgende/28d (+18 %), bounce 5 %, 5 indgangssider
  pr. 2026-09-26. Ingen række i GSC-snapshottet, så **ingen CTR-baseline** findes —
  titel og description er derfor urørt i denne omgang, og opgaven er en
  korrekthedstask.
- **Fund 1 — løfteindholdet var uopnåeligt, som C28 skrev.** Siden og
  meta descriptionen lovede "Tjener du 25.000 kr netto → max ca. 7.500 kr/md", men
  `HuslejeBudgetBeregner.tsx:140` startede på **28.000** kr, så værktøjet viste
  8.400 kr. Regnestykket var korrekt; eksemplet lå bare uden for rækkevidde af den
  standard, enhver læser mød først.
- **Fund 2 — værktøjet lovede et tal, det ikke kunne regne på.** Resultatet stod som
  "pr. måned **inkl. el, vand og varme**", FAQ'en sagde "Husk at inkludere el, vand og
  varme i beregningen", og sidens egen liste nævner a conto varme/vand og el — men
  værktøjet havde **intet felt** for det. En lejer, der betaler 1.800 kr. i el og
  varme, læste altså et tal, der lå 1.800 kr. for højt. Det er samme fejltype som
  C28-C32: siden lovede noget, værktøjet ikke leverede.
- **Fund 3 — død kode og en ubesvaret påstand.** `maxHusleje33Pct` blev beregnet og
  aldrig vist, selv om siden og FAQ'en begge siger "Nogle kilder siger 33 %".
- **Fund 4 (lille) — "God økonomi" ved nul indkomst.** Vurderingen sammenlignede
  `tilHusleje >= maxHusleje30Pct`, så 0 mod 0 gav **"god"**. Nu er vurderingen
  "risikabel", når den samlede indkomst er 0.
- **Beslutning/implementering:** ét sted — `src/lib/husleje.ts` med
  `HUSLEJE_REGNEL_30` / `HUSLEJE_REGNEL_33`, den rene `beregnHusleje(input)` og
  `HUSLEJE_STANDARD`, som er **både** værktøjets starttilstand **og** det eksempel,
  siden og metadataen citerer. Modellen er ændret, så reglen dækker husleje **og**
  boligforbrug, som siden og FAQ'en siger: loftet er 30 % af indkomsten til
  husleje + el + vand + varme, og det nye "El, vand og varme"-felt trækker derfor
  huslejen ned en-for-en. Værktøjet har nul hardkodede tal (kun `HUSLEJE_STANDARD.*`
  i `useState` og reset), 33 %-linjen vises, og DA/SE/NO har alle feltet. Sidens
  brødtekst og FAQ'en renderer de udledte tal; 1.800 kr. i eksemplet er en
  illustration ("har du …"), ikke et gennemsnit, og det ligger i modulet.
- **Landet:** kode `050279c` (med planen), merge til `master` er `e90136e`
  2026-09-26 16:00 CEST. Begge refs pushet; `/api/health` svarer 200.
- **Kvalitetsgate 2026-09-26 16:00 CEST:** `npm run build` grøn (139 sider +
  typecheck, ingen nye advarsler), `npm run test` grøn (**1358/1358, 130 filer** —
  14 nye tests: 10 i `husleje.test.ts`, 4 i `fact-consistency.test.ts`),
  `npm run lint` grøn (524 filer). Lokal standalone-SSR: `/api/health` svarer
  `status: ok`; `/husleje` serverer "Med en nettoløn på 25.000 kr. er dit loft for
  boligudgifter 7.500 kr.", værktøjet SSR'er **7.500 kr.** som sit store tal, og
  33 %-linjen og feltet er med i markup.
- **MÅL:** `/husleje` baseline 166 besøgende/28d pr. 2026-09-26. Ingen CTR-baseline
  (ikke i GSC-top-15), så titler er urørte. Genmål 2026-10-10; hvis indgangssiderne
  (5 → 963 for `/dato` som reference) stiger, skyldes det at læseren nu kan nå
  eksemplet med ét klik.
- **Acceptkriterier:**
  1. Værktøjets starttilstand er `HUSLEJE_STANDARD`, og siden+metadata+FAQ'en
     citerer tal fra samme modul. **PASS**
  2. Værktøjet viser 7.500 kr. i standardtilstanden, som siden lover. **PASS**
  3. "El, vand og varme" findes som felt i DA, SE og NO, trækkes fra huslejen og
     vises i budgetoversigten. **PASS**
  4. 33 %-reglen vises, så sidens påstand er besvaret. **PASS**
  5. Nul indkomst giver "risikabel", ikke "god". **PASS**
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** Ingen målbar trafikstigning i sig selv (ingen CTR-række).
  Det er en tillidsopgave: 166 læsere pr. 28 dage får et værktøj, der regner det
  samme som siden siger, og et tal, der ikke længer er 1.800 kr. for højt for
  lejere med el og varme.

#### C28's øvrige fund — ikke taget, skrevet som næste kandidater

- ~~**`/flyttebudget` (C27-rest, 2 linjer)~~ — lukket i C29 den 2026-09-26.~~ Page-
  afsnittet sagde "3-6 måneders husleje" og "25.000-40.000 kr" hos mægler mod
  "typisk 3 mdrs." / "25.000-50.000 kr" i samme sides FAQ; begge tal er nu rettet,
  så C27's depositumfund er lukket på alle tre steder.
- ~~**`/kalorier` (286 besøgende/28d)~~ — lukket i C29 den 2026-09-26.~~ Protein var
  `vægt * 1.8` uanset mål mod sidens og FAQ'ens 0,8-1,2 / 1,2-1,6 / 1,6-2,2 g/kg.
  Nu er der ét ratested (`src/lib/makroer.ts`), værktøjet bruger midten af det
  valgte interval, og protein-kortet viser g/kg og interval.
- ~~**`/braendstof` (271 besøgende/28d)~~ — lukket i C30 den 2026-09-26.~~ FAQ'en lovede
  el "typisk 50-70 % billigere pr. km" mod 40,2 % mod diesel i værktøjets egen tabel.
  Nu er besparelsen **udledet** af forudsætningerne og nævnt pr. brændstoffype.
- ~~**`/husleje`**~~ — **lukket i C33 den 2026-09-26, se opgave 60.**~~ Sagen var
  større end "eksemplet er uopnåeligt": værktøjet havde intet felt for el, vand og
  varme, selv om resultatet, FAQ'en og sidens egen liste siger at huslejetallet
  inkluderer dem. Nu er der ét ratested (`src/lib/husleje.ts`), standardtilstanden
  **er** eksemplet, og reglen dækker husleje + boligforbrug som skrevet.
  MÅL: 166 besøgende/28d pr. 2026-09-26 — genmål 2026-10-10.
- **`/pension`.** ~~`PensionBeregner.tsx:224` hardkoder "Folkepensionsalder er 68
  år"~~ — **lukket i C31 den 2026-09-26.**~~ Alderen er nu udledt fra fødselsåret
  via `folkepensionsalderForAlder`, og resultatfeltet fortæller, om den valgte alder
  ligger før eller efter folkepensionsalderen. Samme mønster som C26 rettede i
  `EfterloensBeregner`.
- **Rene.** `TidsBeregner` og `BoligstoetteBeregner` har ingen modstridende tal:
  tidssidens 08:30-16:45 = 8 t 15 min, decimal-time-tabellen og frokostpausen
  passer med `src/lib/tidsberegner.ts` og presets; boligstøttes side, komponent og
  FAQ læser alle `BOLIGSTOETTE_2026`.

#### 61. [x] FÆRDIG 2026-09-26 — C34 — Blog → beregner-auditen: CTA'en findes alle steder, og returlinkene manglede

- **Iteration start:** 2026-09-26 16:07 CEST. Tog C33's næste kandidat (blog →
  beregner). De tolv åbne deploynoter kan først verificeres efter 17:30.
- **Datagrund:** `/blog/barsel-2026-regler-og-satser` 183 besøgende/28d (+83 %) på
  **85 % bounce**; bloggen er sitets næststørste trafikklasse. Plus GSC
  2026-08-27→09-24 for de fem beregnere, der blev koblet.
- **Auditens negative resultat — og det er et resultat.** Kandidat #1 bad om at
  finde indlæg, der mangler et link til den relevante beregner, eller som ender på
  en kildeliste uden næste handling. **Alle 26 indlæg har allerede begge dele.**
  Målt på filen, ikke på følelse: første interne beregnerlink ligger i **1-5 % af
  artiklens krop** i alle 26 (median 3 %), og 24/26 ender med en relateret-blok
  (`Relaterede artikler` eller `Relaterede beregnere`). Kun
  `guide-til-laan-og-renter` og `spar-penge-paa-braendstof` ender på FAQ'en i
  stedet — begge har linket til deres beregner i 4-5 %. **Der var intet at rette i
  den retning**, så opgaven lukkes med tallene, ikke med flere links. (De to
  undtagelser får en relateret-blok, når næste iteration har tid — lav prioritet.)
- **Fund 1 — den modsatte retning manglede næsten helt.** 138 kanter
  indlæg → beregner, men kun **11** af dem havde en returlink; de lå spredt i
  ni siders brødtekst som enkeltstående sætninger. Så missionens krav "de
  relevante beregnere skal linke tilbage" var opfyldt for **9 af ~70**
  beregnersider. Det er den dokumenterede mangel, der blev rettet.
- **Fund 2 — de fire største indgangsartikler mangler en forfatter-side at gå
  tilbage til.** `/moms` (23.426 visninger), `/braendstof` (16.580),
  `/renteberegner` (13.623), `/alder` (6.013) og `/rentefradrag` (4.556) er alle
  på position 5-9 med 0,2-5,0 % CTR. De læser, der lander på beregnen for at
  *forstå* emnet, havde ingen vej videre.
- **Beslutning/implementering:** ét centralt sted — `src/lib/blog-kobling.ts` med
  `BEREGNER_ARTIKLER` (beregner-sti → artikler med titel + én linje), så
  koblingen ikke spredes i brødtekst igen. `src/components/RelateredeArtikler.tsx`
  renderer blokken i samme visuelle sprog som `RelatedCalculators`. `locale`
  gives som prop fra siden, der **allerede** har slået den op — så der kommer
  ikke et ekstra `getLocale()`-kald pr. side, og ingen eksisterende side-test
  skulle røres. Blokken vises kun ved `locale === "da"`, fordi indlæggene er
  danske: ellers ville den tilføje dansk tekst på beraknare.se, som er præcis
  researchfund #4's locale-leak.
- **Omfang valgt efter GSC, ikke efter lyst:** de fem beregnere med flest
  visninger blandt dem, der mangler en returlink. `/tidszone` (24.723) og
  `/kvadratmeter` (20.959) har flere, men ingen artikel svarer til deres
  emne — dem må ikke kobles til en tangential guide.
- **Kvalitetsgate 2026-09-26 16:30 CEST:** `npm run build` grøn (139 sider +
  typecheck, ingen nye advarsler), `npm run test` grøn (**1363/1363, 131 filer** —
  5 nye i `blog-kobling.test.ts`), `npm run lint` grøn (527 filer). Lokal
  standalone-SSR: `/api/health` svarer `status: ok`; `/moms` renderer
  "Guides om emnet" + `/blog/hvordan-beregner-man-moms`, `/rentefradrag` renderer
  alle tre af sine artikler, og **`beraknare.se/moms` renderer ingen dansk blok**
  (0 forekomster af "Guides om emnet") — locale-lækken er undgået.
- **MÅL:** de otte indlæg, der nu får en indgangsside med dokumenteret trafik.
  Baseline pr. 2026-09-26 (Plausible 28d, kun to af dem har en række):
  `/blog/barsel-2026-regler-og-satser` 183 besøgende (uændret af denne ændring),
  `/blog/arveafgift-regler-og-satser` 92. De øvrige seks har ingen række. For
  `/rentefradrag` (226 klik/28d, 5,0 % CTR, pos 6,6) er **dobbeltvirkningen** den
  målbare størrelse: beregneren får læsere, der hellere forstår end regner, og
  `fradrag-2026-komplet-guide` + de to boligartikler får indgangslinks fra en
  side med 4.556 visninger. Genmål **2026-10-10**; kig på artiklernes
  visninger/klik i GSC, ikke på beregnernes bounce (den er allerede 2-7 %, så
  den kan ikke bevæge sig mærkbart).
- **Acceptkriterier:**
  1. Koblingen ligger i ét modul, ikke i sidernes brødtekst. **PASS**
  2. De fem beregnere renderer blokken på DA. **PASS**
  3. Blokken renderer **intet** på beraknare.se. **PASS** (verificeret i SSR)
  4. En test fejler, hvis en koblet beregner ikke har returlinket. **PASS**
     (verificeret: `/tidszone` er ukoblet og ville fejle modstandelsen)
  5. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** **lav i denne iteration, og det er ærligt at sige.**
  Beregnerne har allerede 2-7 % bounce, så dette er ikke en bounce-opgave. Det
  er en link-ophold-opgave: syv indlæg får deres første indgangsside fra en side
  med dokumenteret trafik, og de to største (moms, brændstof) får en guide mere
  at læse videre på. Måles i GSC efter 14 dage. Hvis ingenting rører sig, er
  næste skridt at skrive **nye** artikler til `/tidszone` og `/kvadratmeter` — de
  to største ubestyrede emner — frem for flere returlinks.
- **Ikke gjort, bevidst:** de 26 artiklers `date`/`readTime` i
  `src/app/blog/page.tsx` er ikke rørt. At ændre dem ville se ud som friskhed
  uden at være det, og det er en fælde jeg tidligere har undgået.
- **Landet:** kode `684622a` (med planen), merge til `master` er `e9aae5d`
  2026-09-26 16:34 CEST. Begge refs pushet; `/api/health` svarer 200.

#### 62. [x] FÆRDIG 2026-09-26 — C35 — `/kvadratmeter` får sit indlæg: "hvordan regner man kvadratmeter ud"

- **Datagrund:** `/kvadratmeter` 20.959 visninger, 288 klik, 1,4 % CTR, pos 5,0 i
  GSC 2026-08-27→09-24, og 377 besøgende/28d i Plausible (+98 %). Søgningerne er
  alle *informative*, ikke bare værktøjsintention: "kvadratmeter" 1.815v pos 5,
  **"hvordan regner man kvadratmeter ud" 357v pos 3**, "beregn kvadratmeter" 196v
  pos 3, "kvadratmeter beregner" 170v pos 4. Autocomplete (hentet 26/9) giver
  "kvadratmeter udregning" og "kvadratmeter beregner" i top to. Der var **ingen
  artikel** på emnet — kun `/kvadratmeter` selv, som er et værktøj.
- **Hvorfor artiklen ikke bare er flere links:** C34 viste, at blog → beregner er
  lukket (alle 26 har link), og at returlinkene først nu findes. Den her
  manglende kant var **indhold**, ikke link.
- **Beslutning/implementering:** nyt indlæg
  `src/app/blog/kvadratmeter-saadan-regner-du-ud/page.tsx`, svar-først på
  "areal = længde × bredde" i `lead` og som sidste formelboks. Fire figurer
  (rektangel, cirkel, trekant, trapez) med de **samme formler værktøjet bruger**
  og tal læseren kan efterprøve: 4,2 × 3,6 = 15,12 m²; π × 2² = 12,6 m²;
  (6 × 4)/2 = 12 m²; ((3+5)/2) × 4 = 16 m². Vægge regnes som omkreds × højde med
  dør og vindue trukket fra: 2 × (4+5) = 18 m, 18 × 2,40 = 43,2 m², minus 1,89 m²
  dør og 1,56 m² vindue = 39,8 m². Maling: 1 liter til 10-12 m², ét lag 3,3-4,0
  liter, to lag 6,6-8,0 liter. Gulv: 20 m² × 1,10 = 22 m². **Alle tal er
  efterprøvet i node i denne iteration.** Enhedstabellen rummer kun
  definitioner (1 m² = 10.000 cm², 1 ha = 10.000 m², 1 km² = 1.000.000 m²);
  "1 tønde land = ca. 6.017 m²" blev **fjernet**, fordi lex.dk gav 404 og tallet
  derfor stod uden kilde — se ❓.
- **Kilder, kun to, begge hentet 26. september 2026:** [bbr.dk](https://bbr.dk/)
  (alle bygninger over 10 m² skal registreres; køber skal gennemgå
  BBR-meddelelsen og er efter overtagelsen ansvarlig for oplysningerne) og
  [hjemmeland.dk](https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/)
  (1 m² = 10.000 cm², standarddør 1,8-1,9 m², maling 10-12 m² pr. liter, 10 %
  spild ved gulv). Sidens egen 8-12 m² pr. liter er **bredere** end kilden, som
  siger 10-12; den står heller ikke som kildeangivelse, så den blev ikke rørt.
  Autocomplete-bekræftelsen af søgeintentionerne er fra Googles eget
  suggestions-API, samme dato.
- **Kobling:** `BEREGNER_ARTIKLER["/kvadratmeter"]` i `src/lib/blog-kobling.ts` +
  `<RelateredeArtikler current="/kvadratmeter" locale={locale} />` i sidens
  footer. `locale` var allerede slået op, så der kommer ikke et ekstra
  `getLocale()`-kald, og blokken renderer intet på beraknare.se (kun `da`).
  Symmetri-testen i `blog-kobling.test.ts` dækker den nye kant automatisk.
- **Registrering:** `blogPosts` i `src/app/blog/page.tsx` (26 → 27) og
  `getBlogSlugs` i `src/app/sitemap.ts`. Footerens fire curated bloglinks er
  bevidst urørt — de er en fast pladsholder, ikke en liste.
- **Kvalitetsgate 2026-09-26 17:05 CEST:** `npm run test` grøn
  (**1363/1363, 131 filer**), `npm run lint` grøn (528 filer), `npm run build`
  grøn — `/blog/kvadratmeter-saadan-regner-du-ud` 247 B / 106 kB, samme `ƒ`-rute
  som de 26 andre indlæg (domænet læses fra headers). Ingen nye CSS-advarsler.
- **MÅL:** `/kvadratmeter` **baseline 377 besøgende/28d pr. 2026-09-26**
  (Plausible, +98 %, bounce 6 %) og **20.959 visninger / 288 klik / 1,4 % CTR /
  pos 5,0 pr. 2026-09-24** (GSC). Artiklen har baseline **0 visninger** — den
  er ny. Genmål **2026-10-10**: (a) `/kvadratmeter`s CTR mod 1,4 %, hvis
  artiklen overtager queryen; (b) artiklens egne visninger/position for
  "hvordan regner man kvadratmeter ud" (357v pos 3 i dag); (c) `/kvadratmeter`s
  besøgende mod 377. Hvis artiklen ikke ranker efter 14 dage, er emnet lukket
  med et negativt fund, og næste kandidat bliver kandidater 2-4 nedenfor.
- **Acceptkriterier:**
  1. Én gennemarbejdet dansk artikel med konkrete tal og klikbare kilder. **PASS**
  2. Hvert tal i artiklen er enten efterprøvet i denne iteration eller kildeført. **PASS**
  3. Artiklen linker til `/kvadratmeter`, og siden linker tilbage gennem ét
     centralt modul. **PASS**
  4. Artiklen er med i blogindeks og sitemap. **PASS**
  5. Intet dansk lækker til beraknare.se. **PASS** (kun `locale === "da"`)
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** fire *informative* søgninger på pos 3-5 står på en side,
  der er bygget til at regne. En artikel der svarer på "hvordan regner man
  kvadratmeter ud" direkte i titlen har en reel chance for at flytte den query fra
  pos 3 til top 3, og `/kvadratmeter` får samtidig en indgangsside til læsere, der
  først vil forstå. Det er den billigste test af C34's hypotese: hvis
  artiklen-til-beregner-mønstret her ikke flytter noget, skal de næste artikler
  vælges efter noget andet.
- **Ikke gjort, bevidst:** artiklen har ingen `date`-opdatering af de 26 andre
  indlæg, og der er ikke lavet en `/tidszone`-søsterside endnu — det er næste
  opgave, ikke en sidefodnote her.
- **Landet:** kode og plan i `ff86918`, merge til `master` er `1918bb3` 2026-09-26
  17:10 CEST. Begge refs pushet; `/api/health` svarer 200.

#### 63. [x] FÆRDIG 2026-09-26 — C36 — `/tidszone` får sit indlæg: "hvad er klokken i USA, når den er 12 i Danmark"

- **Datagrund:** `/tidszone` 24.723 visninger, 115 klik, **0,5 % CTR, pos 7,5** i
  GSC 2026-08-27→09-24 (fjerdestørste side i Search Console efter `/procent`,
  `/dato` og `/tidsberegner`). Søgningerne er "tidszoner" 764v pos 10, "hvad er
  klokken i usa når den er 12 i danmark" 183v pos 6, "tidszoner beregner" 115v
  pos 3 og "tidsforskel" 86v pos 10. **Autocomplete hentet 26. september 2026**
  bekræfter præcis de længere formuleringer, planen forudså, og mere endnu:
  "hvad er klokken i usa når den er 21 / 16 / 14 i danmark", "… usa miami",
  "… usa est", "… usa los angeles", "tidszoner kort / usa / verden / europa" og
  "tidsforskel grønland / thailand / bali danmark / japan danmark / tyrkiet /
  kreta / new york".
- **Hvorfor artiklen ikke bare er flere links:** samme begrundelse som C35. C34
  viste, at blog → beregner er lukket; den manglende kant var **indhold**.
  Siden svarede på spørgsmålet med tre byer (New York, Chicago, Los Angeles) og
  nævnte ingen af resten: ikke Arizona, ikke Alaska, ikke Hawaii, ikke
  Grønland, ikke de præcise sommertidsdatoer.
- **Beslutning/implementering:** nyt indlæg
  `src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark/page.tsx`.
  **Svar-først i `lead` og i metadata:** "12 i Danmark = 06 i New York, 05 i
  Chicago, 04 i Denver, 03 i Los Angeles". Tre tabeller: (a) alle amerikanske
  zoner ved 12 dansk, vinter og sommer; (b) østkyst, midtvest, bjergbælter,
  stillehav, Alaska og Hawaii ved **14, 16 og 21** dansk — de tre øvrige
  autocomplete-formuleringer; (c) 16 byer/lande med forskel i vinter- og
  sommertid **plus** "kl. 14 dansk → by". Dertil sommertidsdatoer for 2026,
  regneeksemplet (1 + 5 = 6 timer), mødetidspunkter, kilder og FAQ.
- **Et fund undervejs, der gav artiklen sin substans:** **de to kolonner er ens
  for alle amerikanske zoner undtagen Arizona og Hawaii.** Danmark og USA
  skifter begge til sommertid, men på hver sin dato, så forskydningerne
  ophæver hinanden. Det er en regel folk fejler konstant, og den er efterprøvet
  i node. Arizona og Hawaii har afskaffet sommertiden, og derfor står de to tal
  forskelligt. Samme logik gør **Berlin/Paris/Madrid 0 timer** hele året (kun
  opgaven skrev "Berlin: samme som Danmark" uden at sige det til hele året).
- **Kilder, fire, alle hentet 26. september 2026:**
  [15 U.S. Code § 260a](https://www.law.cornell.edu/uscode/text/15/260a) (lovteksten:
  klokken flyttes fra 02:00 den anden søndag i marts til 02:00 den første søndag
  i november, ændret fra 2005 af Energy Policy Act),
  [15 U.S. Code § 263](https://www.law.cornell.edu/uscode/text/15/263)
  (navnene på USA's ni standardzoner),
  [timeanddate.com — tidszoner verden](https://www.timeanddate.com/time/zones/)
  (UTC-forskellene for hver forkortelse: EST −5, EDT −4, AKST −9, HST −10,
  CET +1, CEST +2, JST +9, IST +5:30, ICT +7, TRT +3 m.fl.),
  [timeanddate.com — Danmark 2026](https://www.timeanddate.com/time/change/denmark?year=2026)
  (29. marts 2026 kl. 03:00 frem, 25. oktober 2026 kl. 03:00 tilbage, første
  sommertid 1916) og
  [timeanddate.com — Sydney 2026](https://www.timeanddate.com/time/change/australia/sydney?year=2026)
  (4. oktober 2026 kl. 02:00 frem, 5. april 2026 kl. 03:00 tilbage).
  **Havet uden kilder:** "arbejdstid i USA er typisk kl. 09-17" er skrevet som en
  tommelfingerregel, ikke som et kildeført tal.
- **Kobling:** `BEREGNER_ARTIKLER["/tidszone"]` i `src/lib/blog-kobling.ts` +
  `<RelateredeArtikler current="/tidszone" locale={locale} />` i sidens footer.
  `locale` var allerede slået op, så der kommer ikke et ekstra `getLocale()`-kald,
  og blokken renderer intet på beraknare.se. Symmetri-testen i
  `blog-kobling.test.ts` dækker den nye kant automatisk.
- **Registrering:** `blogPosts` i `src/app/blog/page.tsx` (27 → 28) og
  `getBlogSlugs` i `src/app/sitemap.ts`.
- **Kvalitetsgate 2026-09-26 17:52 CEST:** `npm run test` grøn (**1363/1363, 131
  filer**), `npm run lint` grøn (529 filer), `npm run build` grøn — route
  `/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark` 249 B / 106 kB, samme
  `ƒ`-rute som de 27 andre indlæg. Ingen nye CSS-advarsler.
- **MÅL:** `/tidszone` **baseline 24.723 visninger / 115 klik / 0,5 % CTR /
  pos 7,5 pr. 2026-09-24** (GSC) og **15 besøgende/28d** —Bemærk: GSC's
  `/tidszone` har 24.723 visninger, men Plausible gav den ingen top-15-placering
  i 28-dages snapshotet, så **CTR og artiklens egne visninger er den primære
  måleenhed her, ikke besøgende**. Artiklen har baseline **0 visninger** — den er
  ny. Genmål **2026-10-10**: (a) `/tidszone`s CTR mod 0,5 %; (b) artiklens
  visninger og position for "hvad er klokken i usa når den er 12 i danmark"
  (183v pos 6 i dag) og for "tidszoner" (764v pos 10); (c) om artiklen overhovedet
  ranker for de fire autocomplete-formuleringer om kl. 12/14/16/21.
- **Acceptkriterier:**
  1. Én gennemarbejdet dansk artikel med konkrete tal og klikbare kilder. **PASS**
  2. Hvert tal i tabellerne er enten kildeført (UTC-offsetterne) eller efterprøvet i
     node i denne iteration (alle klokkeslæt). **PASS**
  3. Artiklen linker til `/tidszone` og `/tidsberegner`, og siden linker tilbage
     gennem ét centralt modul. **PASS**
  4. Artiklen er med i blogindeks og sitemap. **PASS**
  5. Intet dansk lækker til beraknare.se. **PASS** (kun `locale === "da"`)
  6. `npm run lint`, `npm run test` og `npm run build` er grønne. **PASS**
- **Forventet effekt:** fire forskellige konkrete klokkeslæt (12, 14, 16, 21) plus
  "miami", "est" og "los angeles" er det, Google autocomplete viser, at folk
  faktisk skriver. `/tidszone` har 0,5 % CTR på pos 7,5, så **trafikken er der
  allerede** — den mangler et svar der får folk til at klikke. Det er den samme
  billige hypotese som C35, og hvis den heller ikke flytter noget her, er
  artikler-til-værktøj mønstret slut som vækstmotor, og næste iteration skal
  bruge et andet middel.
- **Ikke gjort, bevidst:** artiklen er **ikke** svensk, selv om autocomplete på
  beraknare.se viser "dagar mellan datum"-mønstre for `/dato` og `/tidszone`
  har 3.189 visninger der. En svensk søsterside er en reel opgave med egen
  metadata og 301-redirecte, ikke en time. `/tidszone`-værktøjet **dækker kun 15
  byer** og bruger standardforhold, så artiklen siger ærligt, at Arizona og
  Hawaii mangler og at værktøjet bruger standardforskelle. Greenland, Kreta,
  Tyrkiet, Bali og Auckland står i tabellerne som **opslagstabeller**, ikke som
  løfter om at værktøjet kan regne dem.
- **Landet:** kode og plan i `fa5989f` på `ceo/c36-tidszone-artikel`, merge til
  `master` er `f7a1222` 2026-09-26 17:59 CEST. Begge refs pushet; `/api/health`
  svarer 200 med `status: ok` **på den gamle kode** — batch-deployeren kører
  næste gang 2026-09-27 07:30, fordi merge skete efter både 17:30- og
  21:30-vinduet.

#### 64. [x] FÆRDIG 2026-09-26 — C37 — `/renteberegner`: fradragsværdien læses fra modulet, og "3,3 % efter skat" fik sin over-grænse-tal

- **Iteration start:** 2026-09-26 17:36 CEST. Først en færdig **kontekst-kontrol af
  alle fjorten åbne deploynoter** (17:30-batchen), derefter denne kodeændring.
- **Datagrund:** `/renteberegner` har 13.623 visninger/28d, 124 klik, CTR 0,9 %,
  pos. 7,5 pr. 2026-09-24 — tredjestørste lånside. Søgningerne er "annuitetslån
  beregner" (355v/3k pos 8), "renteberegner" (327v/10k pos 7) og "mån edlig rente
  beregning" (49v/1k pos 5). Plausible: 149 besøgende/28d (+35 %, bounce 5 %).
- **Fundet:** R1 (2026-09-25) oprettede `RENTEFRADRAG_2026` som *ét ratested* for
  fradragsværdien, og værktøjet læser den. Men **sidenes brødtekst hardcodede
  begge procenter** (`src/app/renteberegner/page.tsx:137-138`) plus beløbsgrænserne
  — så R1's acceptkriterium var kun halvt indført på den side, der har flest
  lånvisninger. Samme fejlklasse som C30-C33: et tal i copy, der ikke kan komme ud
  af trit med det testede modul, når satsen ændrer sig.
- **Uforventet fund undervejs:** jeg troede først, at "3,3 % efter skat" var en
  løftefejl, fordi siden lige inden nævner både 33,6 % og 25,6 %. **Den er ikke
  det** — siden siger allerede "Så længe du er under grænsen", altså 3,32 % er
  korrekt for det trin, den nævner. Jeg rettede den ikke, fordi den ikke var
  forkert. Til gengæld manglede den modsatte side af reglen: siden siger aldrig,
  hvad et lån **over** grænsen reelt koster (3,72 %), selv om den selv nævner
  25,6 %. Det er nu med.
- **Implementering:** `fradragProcent()` + fem konstanter læst fra
  `RENTEFRADRAG_2026` (33,6 / 25,6 / 50.000 / 100.000 / de to effektive satser).
  Begge tal og begge grænser er nu rendererede, ikke skrevne. Formateringen er
  dansk (komma-decimal, `toLocaleString("da-DK")` på grænserne).
- **Test:** ny test i `src/app/renteberegner/page.test.tsx` renderer siden og
  kræver, at markup'et indeholder præcis modulets værdier — så en
  satsændring i `satser-2026.ts` udløser en rød test i stedet for en stille
  afvigelse. 4/4 i filen er grønne.
- **Forventet effekt:** lille direkte trafikvirkning (0,9 % CTR er ikke årsagen),
  men fjerner en tavs afvigelsesrisiko på en side med 13.623 visninger, og gør
  R1's "ét ratested" sandt for hele lån-klyngen.
- **MÅL:** `/renteberegner` baseline 149 besøgende/28d, 13.623 visninger, CTR 0,9 %,
  pos. 7,5 pr. 2026-09-24 — genmål 2026-10-10.
- **Ikke gjort, bevidst:** de otte andre steder, der stadig hardcoder 33,6/25,6 %
  (`/boliglaan` 2 steder, `/rentefradrag` 3, `page-data.ts` 5), er **ikke** rørt.
  De ligger i beskrivelser og FAQ-svar, der bygges som strenge og ikke kan læse
  modulet uden et formatteringslag; det er en egen, større opgave. Skriv den som
  sådan, hvis næste iteration vil tage den — ikke som en halv løsning her.

#### 65. [x] FÆRDIG 2026-09-26 — C38 — De tre svenske sider med flest visninger svarer på spørgsmålsformen

- **Iteration start:** 2026-09-26 18:05 CEST. Køen var tom (alle 64 opgaver
  færdige, intet `I GANG`), og de tre åbne kandidater var lukket: kandidat 2 er
  stadig betinget af et nyt snapshot, kandidat 3 blev lukket i C37, og kandidat 4
  kræver et ja fra Mads. C37's åbne deploynote kan først verificeres i
  2026-09-27 12:30-vinduet. Så denne iteration blev en audit af den **ene**
  dokumenterede klasse, C1-C16 ikke havde dækket: svensk **spørgsmålsform**.
- **Datagrund (GSC beraknare.se 2026-08-27→09-24):** `/dato` 88.498 visninger,
  87 klik, **CTR 0,1 %, pos. 8,4**; `/tidsberegner` 55.186 visninger, 114 klik,
  **CTR 0,2 %, pos. 8,2**; `/procent` 23.294, 2 klik, **CTR 0,0 %, pos. 10,2**;
  `/leasing` 3.181, 30 klik, **CTR 0,9 %, pos. 12,5**. Sammen 170.000 visninger
  på fire sider, alle på position 8-13, alle under 1 % CTR. Plausible
  2026-09-26 14:07: beraknare.se 499 besøgende/28d (+151 %), `/tidsberegner` 147
  (+206 %, bounce 7 %), `/dato` 119 (+644 %, bounce 4 %), `/leasing` 46 (+84 %,
  bounce 5 %).
- **Auditmetode:** live HTML hentet fra alle ti svenske top-sider, og hver af
  GSC's konkrete søgningsstrenge testet mod titel, H1 og **hele** sidens tekst.
  Resultatet er skrevet ned som en tabel, så næste iteration ikke skal gentage
  auditen.
- **Hypotese der blev falsificeret:** at de svenske sider bruger danske eller
  svenske oversættelses-glider. **Alle fire sider bruger det svenske hovedord**
  — Tidskalkylator, Momskalkylator, Kalorikalkylator, Bränslekalkylator,
  Räntekalkylator, Ålderskalkylator, Leasingkalkylator — i titel, H1 og brødtekst.
  Det er derfor **ikke** en locale-leak, og det er derfor heller ikke det, der
  holder positionerne nede.
- **Det fund, der er gjort:** søgningerne er **spørgsmål**, og spørgsmålet stod
  ikke på siden. På `/dato` fandtes ingen af "antal dagar mellan datum"
  (384 visninger, pos. 9), "hur många dagar mellan två datum" (358, pos. 8) eller
  "dagar till 31 dec" (346, pos. 9) — titlen siger "två datum", aldrig
  "mellan datum". På `/tidsberegner` fandtes heller ikke "räkna ut timmar och
  minuter" (121, pos. 10) eller "räkna timmar" (147, pos. 7). På `/leasing`
  fandtes **"färetagsleasing" nul gange** i hele siden, selv om det står i
  keywords og er den største søgning (196 visninger, pos. 11).
- **Implementering (kun `sePages`, dansk og norsk urørt):** 3 nye
  spørgsmålsformulerede FAQ-par på `/dato`, 2 på `/tidsberegner` og 1 på
  `/leasing` — spørgsmålet er formuleret som søgningen, svaret er
  værktøjets egen adfærd. `/dato`'s "antal dage" er en ren forskel
  (`DatoBeregner.tsx:213`), så svaret siger det udtrykkeligt; månederne er
  fortsat et estimat på 30,44 dage, og det siger svaret ikke noget om.
  `/tidsberegner`'s eksempel (08:30→16:45 = 8:15) er sidens egen
  `metaDescription`, ikke et nyt tal. `/leasing`'s færetagsleasing-svar bruger
  kalkylatorens egne standardtal (4.121 kr) og siger eksplicit, at den **ikke**
  beregner skatten, fordi det afhænger af driftsform — det er det eneste sted,
  hvor en leasingartikel normalt gætter, så det er skrevet som en afvisning.
- **Fire svenske sætningsfejl rettet undervejs** (`page-data.ts:3456-3457`):
  "Låg restvärde" (skal være "Ett lågt"), "mindre går att betala med bilen är
  till salu" (en sætning uden mening), "Med värktiga standardvärden" (**"värktiga"
  findes ikke på svensk** — en dansk læk fra "værktøj") og "som földer" →
  "som fölger". Den tredje er den alvorlige: den stod i et svar, der læses højt.
- **Test:** 4 nye tests i `src/lib/page-data.test.ts` (nu 60 i filen) kræver, at
  de tre svenske sider svarer på de konkrete GSC-strenge, at leasing-svaret
  indeholder færetagsleasing og 4.121 kr, og at de fire brudte formuleringer
  ikke kommer tilbage. Fælden er bevidst hård: en oversættelse eller et
  refaktor-bryd svarformen, går testen rød.
- **Verifikation 2026-09-26:** `npm run test` grøn (**1368/1368, 131 filer**),
  `npm run lint` grøn (529 filer), `npm run build` grøn (137+ sider, kun de 7
  kendte pre-existing CSS-advarsler). `npm audit` urørt — ingen
  afhængigheder ændret.
- **Forventet effekt:** indirekte via placering, da CTR'en ikke er årsagen.
  Hypotesen er, at en side der *besvarer* spørgsmålet ranker bedre på det end
  en der kun har head-ordet; det er en dokumenteret, men **utestet** antagelse,
  så effekten skrives som måling, ikke som løfte. Størst potentiale på
  `/dato` (88.498 visninger) og `/tidsberegner` (55.186).
- **MÅL:** SE `/dato` 88.498 visninger, CTR 0,1 %, pos. 8,4; SE
  `/tidsberegner` 55.186, CTR 0,2 %, pos. 8,2; SE `/leasing` 3.181, CTR 0,9 %,
  pos. 12,5 — alle pr. 2026-09-24. Plausible: beraknare.se 499 besøgende/28d,
  `/dato` 119, `/tidsberegner` 147, `/leasing` 46 pr. 2026-09-26.
  **Genmål 2026-10-10.**
- **Ikke gjort, bevidst:** SE `/procent` (23.294 visninger, **0,0 % CTR**,
  pos. 10,2) er bevidst urørt. Den har dansk-svensk oversættelse, korrekt
  head-ord og ingen spørgsmålsform i GSC-listen — så der er intet dokumenteret
  at rette, og en Titelændring på sitets tredjestørste visningsside uden data
  ville være en ukontrolleret ændring. Samme for SE `/bil` (pos. 32,9),
  `/kalorier` (pos. 20,7), `/moms` (pos. 23,6) og `/renteberegner` (pos. 26,6):
  de har SE-metadata og SE-head-ord, så deres problem er **placering**, og
  det løses med indhold og interne links, ikke med copy.

#### 66. [x] FÆRDIG 2026-09-26 — C39 — SE `/procent`: svar på de tre svenske procent-spørgninger, og en dansk skattesats forsvandt

- **Iteration start:** 2026-09-26 18:20. Kandidat 5 fra C38 (svensk placering).
- **Datagrund:** SE `/procent` **23.294 visninger, 2 klik, CTR 0,0 %, pos. 10,2**
  (GSC 2026-08-27 – 2026-09-24) — sitets **tredjestørste svenske visningsside**
  og den med dærst CTR. Position 10,2 er lige under side 1, altså 23.294
  visninger uden et eneste klik. C38 lod den bevidst urørt, fordi GSC-listen for
  siden ikke viser nogen søgning — så der var intet dokumenteret. Det er
  stadig sandt, så arbejdet tager **ikke** GSC-søgningerne, men den
  dansk-svenske oversættelse: en forespørgelse om, hvad *svenske* brugere
  faktisk skriver, da autocomplete er et offentligt, læsevenligt signal.
- **Research 2026-09-26 18:30 CEST** (`suggestqueries.google.com`, `hl=sv`):
  de svenske søgninger er **spørgsmål om konkrete opgaver**, og tre af dem
  fandtes **ikke på siden**:
  - "hur räknar man ut procent i excel" (+ "procentuell ökning excel",
    "procentuell ökning mellan två tal excel") — Excel-formlen.
  - "procent av summa" / "beräkna procent av summa" / "procent av ett belopp"
    — andel af en summa.
  - "hur räknar man ut procent på lön" / "procenträknare lön"
    — procent på løn.
  Siden svarede i forvejen på "beräkna procent", "procent av", "procent av två
  tal" og "procentuell ökning formel", så de fire eksisterende FAQ-par er
  uangribelige — de er korrekte, de svarer bare på det folk spørger om.
- **Tre ændringer, alle i `locale === "se"` (DA/NO urørt):**
  1. **Synligt afsnit "Hur räknar man ut procent i Excel?"** med en
     tabel på tre formler — `=A1/B1*100` (andel), `=A1*B1/100` (beloppet) og
     `=(B1-A1)/A1*100` (ændring) — hver med et tal en læser kan efterprøve
     (2 500 af 10 000 = 25; 10 procent af 10 000 = 1 000; 10 000 → 12 500 = 25).
     Tabellen siger også, at `=A1/B1` kræver celleformatering som procent,
     hvilket er det fejl de fleste gør i Excel.
  2. **Tre nye svenske FAQ-par** i `sePages["procent"]`, så de samme tre
     søgninger er **også** besvaret i den synlige FAQ **og i JSON-LD**
     (C38's mønster, se opgave 65).
  3. **To interne links** til de svenska værktøj der besvarer næste
     spørgsmål i samme klasse: `/lon-efter-skatt` og `/loenstigning`. Det er
     den interne linkvægt-del af kandidat 5, på to konkrete kanter i stedet
     for på hele siden. (`/rabat` er `daOnly` og findes ikke på
     beraknare.se, så den er bevidst ikke brugt.)
- **Fagfejl fundet undervejs:** den svenske sides "vardagssektion" skrev
  **"Skatt: 37% skatt på 40 000 kr = 14 800 kr i skatt"**. 37 % er en
  *dansk* sats (kommune- + statsskat for en dansk middelindkomst); i Sverige er
  skatten kommunal skatt **plus** statlig skatt, så 37 % er ikke en sats, der
  kan dokumenteres for en svensk løn. Skatteverkets to sider gav **404** ved
  hentning i denne iteration (som C27's solceller), så jeg **opfandt ingen
  erstatningssats**: sætningen siger nu, at satsen afhænger af kommun og
  inkomstnivå, og linker til `/lon-efter-skatt`. Den danske side beholder sit
  eget eksempel — det ændrer sig ikke ved en svensk rettelse.
- **Test:** 4 nye tests. `page-data.test.ts` kræver, at SE `/procent` svarer
  på de tre konkrete autocomplete-strenge (og at `=A1/B1*100` er med), og at
  DA/NO **ikke** har fået Excel-teksten — så et svenskstættet brud på
  locale-adskillelsen fær rødt. `procent/page.test.tsx` kræver, at den
  svenska rendering har Excel-tabellen og begge links, at "37% skatt" er
  væk, og at den **danske** rendering stadig har sit eget skatteksempel.
- **Verifikation 2026-09-26:** `npm run lint` grøn (529 filer),
  `npm run test` grøn (**1372/1372, 131 filer**), `npm run build` grøn
  (137+ sider, kun de 7 kendte pre-existing CSS-advarsler). `npm audit` urørt
  — ingen afhængigheder ændret. Ingen IndexNow-submission kørt.
- **Forventet effekt:** indirekte via **placering**. CTR'en kan ikke måles på
  en side på position 10,2 — síden måles på, om den passerer ind på
  top 10, og sá er det **23.294 visninger** i bevægelse. Det er en
  dokumenteret, men utestet antagelse (samme som C38), så effekten skrives
  som måling, ikke som løfte.
- **MÅL:** SE `/procent` baseline **23.294 visninger, 2 klik, CTR 0,0 %, pos.
  10,2** pr. 2026-09-24. Plausible har ingen `/procent`-række for beraknare.se i
  28-dages-snapshottet (siden ligger på side 2), sé forventningen måles
  **først i Search Console**. **Genmål 2026-10-10.**
- **Ikke gjort, bevidst:** DA `/procent` (149.318 visninger) får **ikke** den
  samme Excel-sektion. Det er bevidst: C1's titel-/description-ændring på
  siden er endnu ikke målt (GSC-vinduet slutter 2026-09-24, C1 merged
  2026-09-25), så en samtidig indholdsændring ville gøre effekten umålbar.
  Samme for NO. Skrives som ny opgave, når C1 er målt.

#### 67. [x] FÆRDIG 2026-09-26 — C40 — `/tidsberegner` lovede et eksempel i meta, der ikke stod på siden

- **Iteration start:** 2026-09-26 18:52 CEST. Køen var tom (alle 66 opgaver
  færdige, intet `I GANG`), de tre åbne deploynoter har første kandidatvindue
  21:30 / 2026-09-27 12:30, så intet kunne verificeres. Kandidaterne 0-5 var
  lukket, så denne iteration er den research, der fandt en **ny** klasse:
  *titlen lover et eksempel, brødteksten ikke har det.*
- **Datagrund:** Search Console 2026-08-27→09-24, `/tidsberegner` **72.382
  visninger, 207 klik, CTR 0,3 %, pos. 7,0** — **tredjestørste CTR-tab på
  sitet** efter `/procent` (149.318) og `/dato` (130.392). Søgningerne er
  spørgsmål: "tidsberegner" 969v/29k pos. 4, **"hvor lang tid" 790v/1k pos. 6**,
  "time beregner" 119v/1k pos. 8, "beregn tid" 94v/1k pos. 7.
- **Fund (live-kontrol af minberegner.dk/tidsberegner):** `metaDescription` og
  `ogDescription` lovede *"Eksempel: 08:30 til 16:45 er 8 timer og 15
  minutter"*, men **"08:30" og "16:45" forekom én gang hver og kun i metadat** —
  udtrukket brødtekst viste **nul** forekomster. H1 var det generiske
  "Tidsberegner". Synlig FAQ var tre korte linjer uden eksempel, og ingen af
  dem matchede en af de fire søgninger. Så title lovede præcis det, siden ikke
  leverede — modsat C38, hvor SE-siden fik eksemplet i kroppen.
- **Beslutning/implementering:** H1 er nu spørgsmålstformen **"Hvor lang tid er
  der mellem to klokkeslæt?"** (DA kun; SE beholder sit eget svar-først-sæt fra
  C38, og tabellen er locale-guarded så intet dansk lækker til beraknare.se).
  **Ny svar-først-tabel** "Svar på de oftest søgte tidsrum" står **før
  værktøjet** med fem gennemgående tidsrum: 08:30→16:45, 08:00→16:00,
  09:00→17:00 m. 30 min pause, 13:15→14:45 og 22:00→06:00 (markeret
  "dagen efter"). Første H2 er nu "Hvordan beregner du tid mellem to
  klokkeslæt?".
- **Ét ratested:** `src/lib/tids-eksempler.ts` bygger alle fem rækker ved at
  kalde `beregnTidsinterval` — det samme modul `TidsBeregner` bruger — og
  **kaster**, hvis et eksempel ikke kan beregnes. Der er ingen håndskrevet
  procent- eller minut-tal tilbage på siden, så siden og værktøjet ikke kan
  glide fra hinanden. FAQ'en er samme kilde som `FAQSchema`, så de nye
  spørgsmål går automatisk ind i JSON-LD.
- **FAQ:** seks spørgsmål i stedet for tre korte, hvoraf de svarer direkte på
  GSC-strengene: "Hvor lang tid er der mellem to klokkeslæt?", "Hvad er 08:30
  til 16:45 i timer og minutter?", "Hvordan beregner jeg arbejdstid?", "Kan jeg
  trække en pause fra?", "Hvad er decimal timer?" og "Tid over midnat?".
- **Test:** 4 nye tests i `tids-eksempler.test.ts` (bl.a. at 08:30→16:45
  faktisk er 8 t 15 min / 8.25, at hver række kan genskabes af modulet, at
  kun 22:00 er over midnat, og at alle klokkeslæt er gyldige HH:MM), 4 nye i
  `page-data.test.ts` (spørgsmålstjek på alle fire GSC-strenge, at pause- og
  midnatstal er med, at ingen FAQ-answer er under 40 tegn) og 2 ændrede/nye i
  `page.test.tsx` (DA's nye H1, tabellen renderer, SE får **ikke** den danske
  tabel). Den eksisterende H1-assertion blev opdateret — H1 ændres
  med vilje, den var assertionsens emne.
- **Verifikation 2026-09-26:** `npm run lint` grøn (531 filer), `npm run test`
  grøn (**1.382/1.382**, 132 filer), `npm run build` grøn. Renderet SSR-markup
  gennemgået: H1, alle fem tabelrækker, "8 t 15 min", "8.25 timer" og
  "(dagen efter)" er alle i output, og JSON-LD har de seks nye spørgsmål.
- **Landet:** kode `d5e0cb5`, plan `a0c0b8d` på branch
  `ceo/tidsberegner-svarforst`, merge `7c42f8e` til `master` 2026-09-26 18:59
  CEST.
- **Forventet effekt:** 72.382 visninger ved 0,3 % CTR er 207 klik. Bare en
  bevægelse til 1 % er **+500 klik/28d** på den største ikke-rettede
  CTR-side. Det er et estimat, ikke en prognose: klassen "tittel lover
  eksemplet, brødteksten har det ikke" er målt på ingen anden side endnu, så
  C40 er også målingen af klassen.
- **MÅL:** `/tidsberegner` baseline **72.382 visninger, 207 klik, CTR 0,3 %,
  pos. 7,0** pr. 2026-09-24 (GSC). Plausible har ingen `/tidsberegner`-række i
  28-dages-snapshottet 2026-09-26 14:07 (siden ligger på side 2) — **ukendt,
  ikke nul**. **Genmål 2026-10-10.**
- **Ikke gjort, bevidst:** `TidsBeregner` viser `decimalTimer` råt med **punkt**
  ("8.25") mens sidens egen prose bruger dansk komma ("8,25 timer") — en
  eksisterende inkonsistens i selve værktøjet. Tabellen gengiver modullets
  rå-streng, så den matcher præcis hvad værktøjet viser; at rette
  decimalformatet i værktøjet er en separat, visuel enhed og rørt ikke her.
  SE `/tidsberegner` er urørt: C38's svar-først-sæt er endnu ikke målt.

#### 68. [x] FÆRDIG 2026-09-26 — C41 — Auditér C40's klasse på 13 DA-sider (negativt fund) og giv `/dato` de interne links, dens egne søgninger kræver

- **Iteration start:** 2026-09-26 19:11 CEST. Køen var tom (67 opgaver færdige,
  intet `I GANG`). De fire åbne deploynoter har første kandidatvindue 21:30 /
  2026-09-27 12:30, så intet kunne verificeres i denne iteration. Kandidat #6
  (C40's `metaDescription`-mod-brødtekst-klasse) var den eneste åbne, så den
  blev auditeret — og auditten førte til et **andre** fund, som blev rettet.
- **Datagrund:** Search Console 2026-08-27→09-24, `/dato` **130.392
  visninger, 801 klik, CTR 0,6 %, pos. 5,8** — sitets **næststørste side** og
  **største indgang** (963 indgangssider, 1.045 besøgende/28d, bounce 5 %).
  To af sidens fire søgninger er spørgsmål om en enkelt fremtidig dato:
  **"hvor mange dage er der til 1 december" 996 visninger/2k pos. 5** og
  **"hvor mange dage er der tilbage af 2026" 223 visninger/2k pos. 5**. Den
  fjerde og tredje er "dage mellem datoer" (450/11k, pos. 5) og "antal dage
  mellem to datoer" (248/5k, pos. 5).
- **Auditmetode:** live HTML hentet fra en dev-server på alle 13 øvrige
  DA-sider i GSC-top-14, og hver sides `metaDescription` holdt op mod sin egen
  udtrukne brødtekst. Kriteriet var C40's: *lover metadatet et tal eller et
  eksempel, som den synlige side ikke viser?*
- **Resultat: negativt.** På alle 13 sider er **hvert tal i `metaDescription`
  at finde i brødteksten** (kun to falske positive: `2026.` og `0,10.` er
  fundet som tal med tilhørende punktum). C40's fund var altså en **enkelt
  fejltype**, ikke en mønsterklasse: titlen på `/tidsberegner` lovede et
  eksempel, der kun fandtes i metadat. **Kandidaten lukkes hermed som klasse.**
  En kontrol på **søgestrengens exact-match** mod brødteksten gav derimod
  mange fund, som auditen **ikke** tæller som fejl: "benzinberegner" står på
  siden som ét ord, GSC skriver "benzin beregner" med mellemrum, og det samme
  gælder "kvadratmeter beregner", "tidszoner beregner" og "boligstøtte
  beregner". Dansk sammensætning gør exact-match ubrugeligt som fejlsignal;
  det er kun **selvmodsigelsen mellem to steder på samme side**, der er
  verificérbar uden trafikdata.
- **Det fund, der blev rettet — en kæde, der kun hang én vej.** `/dato`
  linkede til **nogle** `dage-til`-sider: nul. Verificeret programmatisk på
  den hentede markup (`grep '/dage-til'` → 0 forekomster) og i koden. Men
  `/nedtaelling` linker til alle svy af dem (C7's test), og de sider var lavet
  netop for de to GSC-søgninger ovenfor: `dage-til.ts`'s egen spørgsmålstekst
  for 1. december er **"Hvor mange dage er der til 1. december?"** — GSC's
  søgestreng med komma. Så det største søgetrafik-anker på sitet havde nul
  udgående links til de sider, der svarer på dets største spørgsmål, og de
  sider fik al deres linkvægt fra en side med 20 besøgende.
- **Implementering:** `src/app/dato/page.tsx` har nu samme blok som
  `/nedtaelling` (H2 + svy links med `event.copy.question` som ankertekst +
  en modsætning til `/nedtaelling`), bygget af de samme
  `getDageTilEvents`/`getDageTilPrefix`, så **DA får `/dage-til/*` og SE får
  `/dagar-till/*`** med svensk H2 og svensk ankertekst, og **NO får ingen** —
  `isDageTilLocale` sørger for det, så intet dansk lækker til en tredje
  domæne. Blokken står efter brødteksten og **før** FAQ'en. Returlinken
  `/nedtaelling` → `/dato` er dermed symmetrisk med den nye `/dato` → `/nedtaelling`.
- **Test:** 3 nye tests i `src/app/dato/page.test.tsx` (nu 5) — DA linker til
  **alle** `getDageTilSlugs("da")` og til `/nedtaelling` og har ankerteksten
  "Hvor mange dage er der til 1. december?"; SE linker til alle
  `getDageTilSlugs("se")` under `/dagar-till/`, har den svenske H2, og har
  **ikke** `/dage-til/`; NO har ingen af dem. Fælden er bevidst bred: en
  ny dage-til-side uden link fra `/dato` gør testen rød, fordi den løber over
  `getDageTilSlugs` og ikke en håndskrevet liste.
- **Verifikation 2026-09-26:** `npm run lint` grøn (531 filer), `npm run test`
  grøn (**1.385/1.385**, 132 filer), `npm run build` grøn (**141 sider**).
  Renderet markup gennemgået på alle tre domæner: DA 7 `/dage-til/*`-links
  + H2 "Datoer folk oftest tæller ned til" + `/nedtaelling`, SE 7
  `/dagar-till/*`-links + H2 "Datum folk oftast räknar ner till" +
  "Hur många dagar är det till 1 december?", NO nul af begge dele.
- **Landet:** kode `29b8b9a`, merge `f25bd93` til `master` 2026-09-26 19:20
  CEST på branch `ceo/dato-dage-til-links`.
- **Forventet effekt:** `/dato` har allerede positionen (pos. 5) på begge
  søgninger, så dette er **ikke** et CTR-spil — det er, at læseren på sitets
  største indgang kan gå fra sit spørgsmål direkte til sit svar i ét klik.
  Det kan både øge `/dage-til/*`'es reelle besøg (og dermed deres placering)
  og sænke bounce på indgangen, fordi siden får en tydelig næste handling
  frem for kun et værktøj. Effekten skrives som måling, ikke som løfte: den er
  en **internt-link-klasse**, og den er målt på nul sider endnu.
- **MÅL:** `/dato` baseline **130.392 visninger, 801 klik, CTR 0,6 %, pos. 5,8**
  pr. 2026-09-24 (GSC) og **1.045 besøgende/28d, 963 indgangssider, bounce 5 %**
  pr. 2026-09-26 (Plausible). `/dage-til/1-december` og `/dage-till/*` har
  ingen Plausible-række i 28-dages-snapshottet — **ukendt, ikke nul**.
  **Genmål 2026-10-10.**
- **Ikke gjort, bevidst:** ingen ny `dage-til`-side for "hvor mange dage er der
  tilbage af 2026". Svaret er "dage til 31. december" og `/dage-til/nytaarsaften`
  dækker det, men GSC's søgning er skrevet om **året** ("tilbage af 2026"), og
  en ny `/dage-til/2026`-rute ville være en tynd variant af en side, der
  findes, så længe spørgsmålet ikke har sin egen søgevolumen. Holdt til der er
  dokumenteret behov. Tilføjelse af interne links fra `/dato` er det samme
  spørgsmål i mindre mål, og det er gjort nu for de sider, der findes.

#### 69. [x] FÆRDIG 2026-09-26 — C42 — Kandidaten "interne kæder, der kun hænger én vej" lukket med ét fund: en stille `slice(0, 5)` og `/brok` uden en eneste indgang

- **Iteration start:** 2026-09-26 19:30 CEST. Køen var tom (68 opgaver færdige,
  intet `I GANG`). Kandidat #7 fra C41 var den eneste åbne, og auditten førte
  til **to** fund — ét klassen lukker og ét der rettes.
- **Auditmetode:** C41's egen. Jeg byggede hele sitets interne linkgraf
  programmatisk og delte den i to: **redaktionelle** indgående links
  (sidekroppe, `relatedMap`, `blog-kobling`, artikel→artikel) og **globale**
  (Header, Footer, Sidebar, katalog). Det er opdelingen, der gør fundet
  verificérbart: en tælling af *alle* hrefs ville vist 0 for alt, fordi
  sidens katalog ligger på enhver side.
- **Resultat: klassen er lukket som klasse.** Af de 19 sider med dokumenteret
  trafik har **18** redaktionelle indgående links (2-30 pr. side), spredt på
  artikler, `relatedMap` og to kilder, der var dækket af C34-C41. Der er altså
  ingen anden forældreløs trafikside. Det eneste **negative** resultat er, at
  grebet `href="/slug"` i kilden ikke kan bruges alene: næsten alle links
  kommer fra datatabeller, som et regex i en sides brødtekst ikke ser. Den
  metode, der virker, er linkgrafen.
- **Fund 1, rettet — `getRelatedCalculators` klipped i strid med sin egen
  tabel.** Funktionen sluttede med `.slice(0, 5)`, men **13 af 81** sider
  erklærer 6 eller 7 relaterede beregnere, så den afskaffede hale blev
  **aldrig vist**. Det er ikke en kosmetisk uoverensstemmelse, det er
  internt linkvægt, der aldrig blev sendt: `/dato` (**130.392 visninger**) og
  `/tidsberegner` (**72.382**) tabte begge `/ugenummer`, `/kvadratmeter`
  (20.959) tabte `/flyttebudget`, og `/promille` tabte `/procent` — altså
  netop **149.318-visningers-siden**, den `/promille` burde sende folk videre
  til. `/ugenummer` mistede dermed fire af de fire højestrafikede forældre,
  `/flyttebudget` fire, `/boligsalg` to. `slice(0, 5)` er væk, tabellen er
  kontrakten, og `/boliglaan` er trimmet fra 7 til 6, så gitteret er 3×2 på
  alle sider. Verificeret i den **renderede** markup: `/procent` 6 links
  (`… /bmi /brok`), `/dato` 6 (`… /pension /ugenummer`), `/tidsberegner` 6
  (`… /kalorier /ugenummer`), `/promille` 6 (`… /alder /procent`),
  `/kvadratmeter` 6 (`… /elberegner /flyttebudget`).
- **Fund 2, rettet — `/brok` er den eneste trafikside på sitet med nul
  redaktionelle indgående links.** **4.640 visninger, pos. 5,3, CTR 0,7 %**
  — GSC's 12. største side. Den lå i `relatedMap` som *nøgle* uden at nogen
  side *pegede på* den, og den står hverken i navigation, footer, forside,
  `home-data` eller sidens populærliste (`getPopularCalculators` har 8
  poster, og `/brok` er ikke en af dem). Eneste indgang var
  `/kategori/matematik`. Forældreløs på 4.640 visninger er præcis C41's
  diagnose, bare en halv ø i hver retning, så `/procent` — sitets største
  side med 30 indgående links — linker nu til `/brok`, og parret er
  symmetrisk, fordi `/brok` allerede pegede på `/procent`.
- **Test:** 8 nye tests i `src/lib/calculator-list.test.ts` (nu 20) — alle
  erklærede links *renderes* i da/no/se, ingen side erklærer mere end 6,
  ingen side linker til sig selv eller gentager en link, hvert mål er en
  virkelig beregner, plus tre navngyne regressionsvagter: `/procent` →
  `/brok`, "hver side med dokumenteret GSC-trafik har en indgående link", og
  de ti navngyne links, som `slice(0, 5)` tabte. **Fælden er bevidst præcis:**
  jeg lagde `slice(0, 5)` og `/procent`-fjernels `/brok` tilbage og fik
  **3 røde tests** med de rigtige navne, så vagterne kan ikke være døde.
- **Verifikation 2026-09-26 19:44:** `npm run lint` grøn (531 filer),
  `npm run test` grøn (**1.392/1.392**, 132 filer), `npm run build` grøn
  (**141 sider**). Standalone-server: `/api/health` → `status: ok`, de fem
  sider ovenfor gengivet med 6 links hver, `beraknare.se/procent` med 5
  (lokalefiltreret) og ingen dansk-only `/rabat`.
- **Landet:** kode `2bbc28f`, merge `fa002ce` til `master` 2026-09-26 19:44
  CEST på branch `ceo/relaterede-links-og-brok`.
- **MÅL:** `/brok` baseline **4.640 visninger, 31 klik, CTR 0,7 %, pos. 5,3**
  pr. 2026-09-24 (GSC) — ingen Plausible-række, fordi siden ikke står i
  28-dages-top-15, så **ukendt, ikke nul**. `/ugenummer` og `/flyttebudget`
  har heller ingen række; deres forældres data er ovenfor. `/procent`
  uændret (149.318 visninger, 95 klik) — svaret skal komme på ** `/brok`,
  `/ugenummer` og `/flyttebudget`, ikke på `/procent`. **Genmål 2026-10-10.**
- **Forventet effekt:** lille i absolut tal, dokumenteret i klasse: en forældreløs
  side med 4.640 visninger på pos. 5,3 kan ikke ranke bedre end sider, der
  **modtager** linkvægt, og `/ugenummer` + `/flyttebudget` får nu fire af de
  fire mest trafikerede forældre i stedet for nul. Skrives som måling, ikke
  som løfte — denne klasse er målt på **nul** sider endnu.
- **Ikke gjort, bevidst:** ni nøgler i `relatedMap` er stadig ikke mål i nogen
  andens liste (`/bolan`, `/fart`, `/loenstigning`, `/ohm`, `/planetvaegt`,
  `/aegloesning`, `/1rm`, `/elbil`, `/solceller`). De har ingen dokumenteret
  trafik, og en "alle nøgler skal være mål"-test ville være ren vilje, så den
  er bevidst *ikke* skrevet; listen ligger i stedet som en opgave under
  ❓. `/elbil` er stadig et målespørgsmål, ikke et linkspørgsmål.
- **Metode-lære til næste iteration:** `/brok` blev fundet, fordi jeg
  delte grafen i *redaktionelle* og *globale* indgående links. En ren
  "tæl href"-audit (C41's foreslåede metode) ville have fundet **hele
  sitet** linket til hver side og rapporteret 35 for 0. Del altid op efter
  kilde, ellers måler man katalogens navigation og   kalder det kæder.

#### 70. [x] FÆRDIG 2026-09-26 — C43 — Cannibalisering: `/tidszone` og C36's egen artikel havde **samme headline**

- **Iteration start:** 2026-09-26 19:44 CEST. Køen var tom (alle 69 opgaver
  færdige, intet `I GANG`), de fem åbne deploynoter har første vindue 21:30
  (C38-C41) og 07:30 (C42), så intet var verificerbart. Valget blev en ny
  klasse målt på GSC's største side.
- **Datagrund:** `/tidszone` **24.723 visninger, 115 klik, CTR 0,5 %, pos. 7,5**
  — GSC's 4. største danske side. Dens næststørste egen søgning er **"hvad er
  klokken i usa når den er 12 i danmark" (183 visninger, pos. 6)**, og det er
  præcis den headline C36 i går (2026-09-26 18:xx) gav artiklen
  `src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark` — som H1,
  som `<title>` og som første keywords-streng. **C36 skabte altså selv
  kollisionen, og den var på vej live.** Bevis fra live-HTML:
  `minberegner.dk/tidszone` → `Hvad er klokken i USA, når den er 12 i Danmark? | Tidszone`
  og `minberegner.dk/blog/hvad-er-klokken-…` → `…12 i Danmark? | MinBeregner.dk`
  — **headline'en er byte-identisk på to URL'er i samme domæne.**
- **Klassens størrelse målt først (C41's metode):** alle `metaTitle` i
  `page-data.ts` (79 da / 28 no / 53 se) og alle 26 artiklers `title`,
  normaliseret på headline (alt før første `|`, lowercase): **104 headlines
  på da, 54 på no, 79 på se — og præcis én kollision, den ovenfor.** Ikke en
  voksende klasse, men en ægte fejltype med en skarp regel: *to sider i samme
  domæne må ikke have samme headline*, fordi Google skal vælge.
- **Beslutning:** `/tidszone` beholder spørgsmålet. Den har 24.723 visninger og
  fire egne søgninger ("tidszoner" 764v pos. 10, "tidszone beregner" 115v
  pos. 3, spørgsmålet 183v pos. 6, "tidsforskel" 86v pos. 10), og C4 satte titlen
  bevidst. Artiklen er **én dag gammel, har nul søgehistorik** og dækker et
  **bredere** emne end sin titel (16 byer i forskelstabel, amerikanske zoner
  ved 12/14/16/21 dansk tid, sommertidsdatoer 2026). Artiklen hedder nu
  **"Hvad er klokken i USA? Tidsforskel for 16 byer"** (H1 + `title` +
  `og:title`), som er 58 tegn med suffiks — den dækker de to søgninger
  artiklen faktisk har stoff til ("hvad er klokken i usa" + "tidsforskel") og
  efterlader det præcise spørgsmål til værktøjssiden. **FAQ'en beholder
  spørgsmålet** — to sider må godt svare på samme spørgsmål; det er titlen,
  der skal være forskellig.
- **Test:** ny `src/app/title-collision.test.ts` (4 tests) — ingen delte
  headlines i nogen af de tre locales, og den læser artiklernes `title` direkte
  fra `src/app/blog/*/page.tsx`, fordi blogmetadata ikke ligger i `page-data`.
  **Fælden er bevidst provokeret:** med artiklens gamle titel failer den
  `har ingen delte headlines på da` med præcis
  `hvad er klokken i usa, når den er 12 i danmark? -> /tidszone, /blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`.
- **Verifikation 2026-09-26 19:52:** `npm run build` grøn (141 sider),
  `npm run test` grøn (**1.396/1.396**, 133 filer), `npm run lint` grøn
  (532 filer).
- **MÅL:** `/tidszone` baseline **24.723 visninger / 115 klik / CTR 0,5 % /
  pos. 7,5** pr. 2026-09-24 (GSC); artiklen har ingen række (ny, ulive) —
  **ukendt, ikke nul**. Forventningen er ikke flere visninger, men at
  `/tidszone` beholder positionen på det præcise spørgsmål, fordi domænet
  ikke længere kan vælge mellem to sider med samme titel. **Genmål 2026-10-10.**
- **Tre negative fund fra samme audit (skrevet ned, så ingen senere
  iteration bruger tid på dem):**
  1. **Alle procent-eksempler er regnet rigtigt.** Script over alle 124 sider
     (`X % af Y = Z` og `A x B = C m²`) fandt **0 afvigelser** — C28-C33's
     metode er gennemført på hele sitet, ikke kun på de sider de greb.
  2. **Brand-suffikset i `<title>` er inkonsistent, men det er ikke et
     fejl-fund.** 17 topsider: 5 ender `| MinBeregner.dk`, to ender
     `| Tidszone` og `| Kalorieberegner` (altså *ikke* branden), resten har
     intet suffiks. Suffikset er håndskrevet pr. side i `page-data.ts`, ikke
     genereret. Jeg rørte det ikke: det er copy-arbejde på de samme
     svar-først-sider, der er lukket til 2026-10-10, og en ensretning ville
     være en ren skønhedskure, ikke en målt effekt.
  3. **`/procent` (149.318 visninger, CTR 0,1 %) åbner på et andet eksempel
     end titlen lover** — titlen siger "beregn 10 procent af et tal", men
     værktøjet starter i "Find procent" med `25 er 25.00% af 100`. Tallene
     *står* i brødteksten (C41 lukkede den klasse korrekt), så det er en
     designvalg, ikke en løftebrud. Jeg ændrede ikke default, fordi det er et
      UX-valg uden måling bag sig. **Skrivet op som kandidat, ikke gjort.**

#### 71. [x] FÆRDIG 2026-09-26 — C44 — Auditér den `dage-til`-flade, C43's test så aldrig

- **Hvorfor:** C43's cannibaliseringstest læser `page-data.ts` og blogfiler fra
  disk. De 14 `dage-til`-landingssider genereres fra `src/lib/dage-til.ts` og
  har **ingen** `page-data.ts`-post, så de var usynlige for testen. `/dato` har
  130.392 visninger, og dets næststørste søgning (996 visninger, pos. 5) er præcis
  den, dage-til-siderne skal fange. Det var det sidste ubedømte sted i den klasse.
- **Auditfund (live, mod minberegner.dk 2026-09-26 omkring 20:10 CEST):**
  1. **Ingen blød 404.** `/dage-til/finvis-somhelst` og `/dage-til/1-december2`
     svarer **404** (ikke 200 med forsiden), så der er ikke et uendeligt
     duplikatrum med canonical på roden. Undtagelsen forklaret: slugs er
     `1-december`, ikke `december-1` — jeg testede den intuitive og fik 404.
  2. **Alle 7 DA-slugs står i sitemap.xml** med self-canonical og
     svar-først-titel, fx `Hvor mange dage er der til 1. december? 66 dage |
     MinBeregner.dk`. Tallet er **regnet efter**: 2026-09-26 → 1. dec = 4+31+30+1
     = 66; → juledagen = 4+31+30+25 = 90, og live siger 90. ✓
  3. **Ingen headline-kollision.** De 7 DA- og 7 SE-spørgsmål er alle
     forskellige, og ingen er lig `/dato`s eller `/nedtaelling`s H1.
- **Rettelse:** `src/app/title-collision.test.ts` tager nu `dage-til`-siderne
  med i alle tre locales, plus en assertion på at `getDageTilEvents` faktisk
  finder dem — uden den ville testen stadig være grøn, hvis modulet engang
  returnerede tomt. Det er præcis den stille fejl C43-pulsen havde.
- **Tre negative fund fra samme time (skrevet ned, så ingen senere iteration
  bruger tid på dem):**
  1. **Canonical med slashes: falsk alarm.** Jeg så `/moms` med
     `href="…/moms/"` og frygtede en self-canonical der redirecter — den
     klassens skjulte dræber. En ren kontrol af 11 DA-sider viser **alle**
     slashless, og `/moms/` + `/dato/` 308'er korrekt til slashless. Ikke et
     fund. Gemt, fordi jeg brugte tid på det.
  2. **Manglende `no` i hreflang: falsk alarm.** `/dato` har kun da/sv/x-default,
     men `beregner.no/dato`, `/moms`, `/procent` og `/tidszone` svarer alle
     **404**, så der er ingen NO-side at annotere.
  3. **`/procent` er indholdsmæssigt færdig, så 0,1 % CTR er placering.**
     Live har siden 7 forekomster af "rabat" (GSCs næststørste søgning er
     netop rabatten i procent, 57 visninger) og H2'erne "Formler",
     "Procentregning i hverdagen", "Hurtige procent-tricks" og "Ofte stillede
     spørgsmål". **Kandidat 9 er dermed lukket på indholdssiden:** der er hverken
     et manglende eksempel eller et manglende emne at fylde — kun position.
- **Verifikation:** `npm run lint` grøn (532 filer), `npm run test` grøn
  (1397/1397, 133 filer), `npm run build` grøn (141 sider). Kun 5 minutters
  diff, så ingen ekstra review.
- **Hele sitet gennemgået i samme time (negativt fund, lukker endnu en klasse).**
  Standalone-buildet kørende på `:3111`, alle **128** DA-URL'er fra
  `sitemap.xml` hentet og målt på status, `<title>`, meta description,
  canonical og H1-antal:
  **0** ikke-200, **0** sider mangler titel, **0** mangler description,
  korteste titel 42 tegn, korteste description 55 tegn, og **alle 128 har
  præcis ét `<h1>`**. Den eneste afvigelse var canonical mod `localhost:3000`,
  hvilket er et lokalt artefakt — buildets fallback-baseURL — fordi live er
  kontrolleret og korrekt. **Lukket: site-wide metadata er ikke en voksende
  klasse.** Tilstanden kan genskabes med de tre linjer i `scripts/seo-check.sh`,
  men kun for én URL ad gangen; en crawl af hele sitemap'en er hurtigere.
- **Landet:** kode `d2ec667` på branch `ceo/dage-til-og-c44`.
- **MÅL:** ingen trafikbaseret måling — ændringen er en vagt, ikke en
  indholdsændring. De 14 sider måles først 2026-10-10, fordi de er nye fra C7.


#### 72. [x] FÆRDIG 2026-09-26 — C45 — `dage-til`-familien sprang juleaften over, og C23's sidste to sider blev verificeret

- **Iteration start:** 2026-09-26 20:26 CEST på `ceo/juleaften`. Køen var tom
  (alle 71 opgaver færdige, intet `I GANG`), og de otte åbne deploynoters
  første kandidatvinduer er 21:30 eller senere — dvs. efter denne iterations
  45-minutters grænse. Den eneste note, der *kunne* verificeres nu, var C23's
  `/brutto-netto` + `/topskat`, som 17:30-målingen sprang over.
- **Verifikation af C23's rest (lukket):** målt ved indholdskontrol 20:27.
  `/brutto-netto` har 3 × `25,049` + 1 × `25.049`, `/topskat` har `0.639` i
  kirkeskatfeltet. `/api/health` → `{"status":"ok"}`. **C23 er dermed helt
  lukket.** Se VERIFICÉR DEPLOY-loggen.
- **Datagrund for den nye opgave.** Familien `dage-til` har syv DA-slugs
  (`juledagen`, `nytaarsaften`, `nytaarsdag`, `1-december`, `paskedag`,
  `skaertorsdag`, `grundlovsdag`) og syv SE-slugs. Den dækker **ikke
  juleaften**: `https://minberegner.dk/dage-til/juleaften` svarede **404**,
  mens `/dage-til/juledagen` svarede 200 — og juledagens *egen brødtekst* siger
  "Juleaften er 24. december, juledag 25. december og 2. juledag 26.
  december." Familien springer altså over den dato, den selv nævner, og kun
  dagen *efter* den findes. GSC viser, at familien virker, når datoen findes:
  "hvor mange dage er der til 1 december" er 996 visninger på pos. 5 pr.
  2026-09-24 (sitets næststørste søgning). Autocomplete, hentet 2026-09-26
  20:31, bekræfter efterspørgslen i begge sprog:
  - DA: "hvor mange dage er der til juleaften", "hvor mange dage er der til den
    24 december" og "hvor mange dage er der til jul" ligger alle blandt
    forslagene til "hvor mange dage er der til".
  - SE: "hur många dagar är det till julafton" er første forslag til "hur många
    dagar är det till jul", og "…till julafton 2026" og "…till julafton i
    sverige" ligger i top-5.
- **Ændring:** ét nyt event i `src/lib/dage-til.ts` (id `juleaften`, fast
  anker 24. december i begge sprog, DA-slug `juleaften`, SE-slug `julafton`,
  spørgsmål + tre fakta + tre FAQ på hvert sprog). Fordi hele fladen er
  genereret fra modulet, følger alt uden ekstra kode: to sider, to
  sitemap-URL'er, links fra `/dato` og `/nedtaelling` på begge domæner,
  dækning af `title-collision.test.ts` og `dage-til-routes.test.tsx`.
  Rækkefølgen i listerne er `juledagen`, `juleaften`, `nytaarsaften`,
  `nytaarsdag`, `1-december`, `paskedag`, `skaertorsdag`, `grundlovsdag` —
  de to juledadter står dermed sammen.
- **Fakta er tjekket mod repoets eget ratested, ikke mod hukommelsen.**
  `src/lib/helligdage.ts` tæller 24. december som helligdag på begge sprog
  ("Juleaftensdag" / "Julafton"), og kommentaren i modulet forklarer, at
  nytårsaften 31. december *kun* mangler på den danske side. Derfor står der i
  juleaftens fakta, at juleaften er helligdag "mens nytårsaften 31. december
  ikke gør" (DA) og at begge er helgdagar (SE). Ugedagen er regnet, ikke
  gættet: 24. december 2026 er en **torsdag**, 2027 en **fredag** — begge står
  i FAQ'en, og en test fejler, hvis de fjernes fra hinanden.
- **Ny test:** `juleaften ligger præcis én dag før juledagen i begge sprog`
  i `src/lib/dage-til.test.ts` — den slår op på id'et (så den ikke kan løbe
  på array-position som de ældre tests gør), tjekker at slugs, spørgsmål og
  anker er konsistente, at afstanden til juledagen er 1 dag og at svaret fra
  2026-09-25 er 90 dage mod juledagens 91.
- **En fejl i planen fundet og rettet undervejs.** C41/C42's deploynoter siger,
  at den første `dage-til`-link på `/dato` er `/dage-til/1-december`. Den er
  `/dage-til/juledagen` — `getDageTilEvents` **sorterer ikke**, den returnerer
  `DAGE_TIL_EVENTS` i array-rækkefølge, og `juledagen` står først. Noterne er
  rettet, ellers ville næste iteration have jagtet en fejl, der ikke findes.
- **Verifikation:** `npm run lint` grøn (532 filer), `npm run test` grøn
  (**1398/1398**, 133 filer), `npm run build` grøn. 61 linjers diff, så ingen
  ekstra review.
- **Landet:** kode `a79b6d5` på branch `ceo/juleaften`, merge `71d4a6c`.
- **MÅL:** `/dage-til/juleaften` og `/dagar-till/julafton` er nye sider uden
  baseline. Sammenlign **2026-10-10** (14 dage) mod de søvende søgninger i
  GSC: målet er, at "hvor mange dage er der til juleaften" ranker på egen URL
  frem for at blive besvaret af `/dato`, og at familien samlet set ikke mister
  visninger til `/dato`. Baseline for berørte forældreside: `/dato` 1.045
  besøgende/28d pr. 2026-09-26, 130.392 visninger, CTR 0,6 %, pos. 5,8;
  `/nedtaelling` har ingen række i GSC-top-15.


#### 73. [x] FÆRDIG 2026-09-26 — C46 — `/tidszone`: de fire lande, autocomplete spørger efter, lå i datamodulet

- **Iteration start:** 2026-09-26 20:47 CEST på `ceo/tidszone-nordatlanten`.
  Køen var tom (alle 72 opgaver færdige, intet `I GANG`), de otte åbne
  deploynoters første vinduer er 21:30 eller senere — efter denne iterations
  grænse — så intet var verificerbart. Valget blev den **ene** åbne
  datagrund fra C45's autocomplete-audit, der ikke krævede nye tal.
- **Datagrund:** `/tidszone` er GSC's **4. største danske side: 24.723
  visninger, 115 klik, CTR 0,5 %, pos. 7,5** pr. 2026-09-24, og Plausible
  gav den ikke en række i 28-dages-top-15. Dens største egen søgning er
  **"tidszoner" (764 visninger, pos. 10)** — altså det generiske ord, ikke
  spørgsmålet. C45's autocomplete-audit (hentet 2026-09-26 20:31) fandt
  **fire huller i selve datasættet**: "tidszone grønland", "tidszone grækenland",
  "tidszone portugal" og "tidszone kreta". `TIDSZONER` i
  `src/lib/tidszone-reference.ts` havde **11 byer, ingen af dem de fire**,
  og `TidszoneBeregner.tsx`'s zone-liste (15 zoner) manglede dem også.
- **Beslutning:** bygge det i **datamodulet**, ikke som ekstra tekst — det var
  C45's egen advarsel ("et databehov … må ikke løses med et par flere rækker i
  tabellen"). Fem nye rækker med IANA-offsets, kildeangivet i modulens
  headerkommentar:
  | By | Vinter | Sommer | Kilde |
  |---|---|---|---|
  | Nuuk | 08:00 | 08:00 | America/Nuuk: WGT = UTC-3 siden marts 2023, WGST = UTC-2 |
  | Lissabon | 11:00 | 11:00 | Europe/Lisbon: WET UTC+0 / WEST UTC+1 |
  | Reykjavik | 11:00 | 10:00 | Atlantic/Reykjavik: UTC+0, ingen sommertid |
  | Athen | 13:00 | 13:00 | Europe/Athens: EET UTC+2 / EEST UTC+3 |
  | Heraklion (Kreta) | 13:00 | 13:00 | samme sone som Athen |
  Klokkeslættene er **regnet af modulet ved 12 i Danmark**, ikke skrevet i
  tabellen. Svar-først-afsnittet på begge domæner nævner nu 13 i Athen og 08 i
  Nuuk, så de fire søgninger også findes i brødteksten.
- **Locale-læk undgået bevidst:** byen hedder **Athen** på dansk og **Aten** på
  svensk, og tabellen er delt af DA- og SE-siden. `TidszoneInfo` har derfor
  fået et valgfrit `bySe`, og `tidszoneRækker(zoner, "se")` bruges på
  beraknare.se. De fire øvrige bynavne er identiske på begge sprog. Samme
  læk-hedning i `TidszoneBeregner.tsx`: zone-listen har per-sprog `navn`/`by`
  (`Grækenland`/`Grekland`, `Athen`/`Aten`, `Grønland`/`Grönland`). Beregnerens
  liste fik de to nye zoner, fordi kun de har et offset, værktøjet ikke dækker
  (Lissabon og Reykjavik er 0, som London allerede dækker).
- **Test:** 2 nye i `src/lib/tidszone-reference.test.ts` (nu 7 i filen) —
  de fire landes **vinter- og sommerklokkeslæt** er låst til talene ovenfor,
  og den svenske liste indeholder "Aten", **ikke** "Athen", og ingen bynavn
  forekommer to gange. Fælden er bevidst hård: en fejl-offset eller en
  manglende `bySe` giver rødt.
- **Verifikation:** `npm run test` grøn (**1400/1400**, 133 filer), `npm run
  lint` grøn (532 filer), `npm run build` grøn (~60 linjers diff, så ingen
  ekstra review).
- **Landet:** kode `240c2c5` på branch `ceo/tidszone-nordatlanten`, merge
  `54c8c86` til `master` 2026-09-26 20:52 CEST.
- **MÅL:** `/tidszone` baseline **24.723 visninger / 115 klik / CTR 0,5 % /
  pos. 7,5** pr. 2026-09-24 (GSC). Autocomplete er et **kvalitativt**
  signal, så de fire søgninger har ingen baseline og skriver ingen.
  Forventningen er flere **impressions** på "tidszoner" (764v, pos. 10) fra
  den bredere dækning, ikke et CTR-spring. **Genmål 2026-10-10.**
- **Ikke gjort, bevidst:** ingen ny `/dage-til/*`-lignende underside for
  Grønland (Kalaallit Nunaat har sin egen myndighedsside, og GSC har ingen
  række), og `/tidszone`s `<title>` er urørt — C4 sat den bevidst, og C43
  flyttede for nylig et spørgsmål *hen* til den, så en titelmæssig
  svar-først-revision hører til genmålingen 2026-10-10.


#### 74. [x] FÆRDIG 2026-09-26 — C47 — `/alder`: værktøjet kunne "alder mellem to datoer" hele tiden, men siden sagde det aldrig

- **Iteration start:** 2026-09-26 21:05 CEST på `ceo/alder-mellem-to-datoer`.
  Køen var tom (alle 73 opgaver færdige, intet `I GANG`), og alle otte åbne
  deploynoters første vinduer var 21:30 eller senere — efter denne
  iterations start — så intet var verificerbart. Valget blev **kandidat 11's
  `/alder`**, som C45 selv kaldte "den stærkeste åbne kandidat".
- **Datagrund:** `/alder` er GSC's nr. 13 på dansk — **6.013 visninger, 35
  klik, CTR 0,6 %, pos. 7,8** pr. 2026-09-24 — med "aldersberegner" 315v/26k
  **pos. 5** og "beregn alder" 100v/0k pos. 9. På svensk nr. 9: **2.895
  visninger, 8 klik, CTR 0,3 %, pos. 7,7**, "räkna ut ålder" 169v pos. 8,
  "räkna ålder" 137v pos. 8, "beräkna ålder" 71v **pos. 5**, "ålderskalkylator"
  52v pos. 8. Autocomplete 2026-09-26 20:31 har **"beregn alder mellem to
  datoer" som forslag 3** til "beregn alder". Plausible gav `/alder` ingen
  række i DA-top-15, men SE `/alder` 15 besøgende (+50 %, bounce 0 %).
  **C45's egen betingelse var opfyldt** — den krævede "en række i GSC", og
  `/alder` står i begge lister.
- **Det fund, der gjorde opgaven lille:** C45 skrev, at spørgsmålet
  "mangled helt". Det gjorde det kun i **teksten**. `AlderBeregner.tsx:106`
  har haft et `beregningsDato`-felt siden URL-state blev delt
  (`getStateFromUrl`, `type: 'alder'` med nøglen `beregningsdato`), og
  komponenten har altid vist "Der er N dage til din næste fødselsdag" for den
  valgte dato. Live havde siden **0** forekomster af "mellem to datoer" mod
  19 af "fødselsdato". Så dette var en **ubeskrivet funktion**, ikke et
  manglende værktøj — og derfor en tekstopgave med tal fra værktøjet, nøjagtig
  som C38-C41's mønster.
- **Beslutning:** tabellen skal **regnes, ikke skrives**. Alderlogikken lå
  inde i komponentens `useMemo` og var dermed hverken testbar alene eller
  tilgængelig for en serverrenderet side, så den blev flyttet til
  `src/lib/alder.ts` som `beregnAlder({foedselsdato, beregningsdato})`.
  `src/lib/alder-eksempler.ts` genererer `ALDER_EKSEEMPLER` fra den, så
  siden og værktøjet ikke kan komme i uoverenssættelse. Samme konstruktion
  som `tids-eksempler.ts` efter C40 — det er blevet husets svar-først-mønster.
  Komponenten bruger nu modulet, så der kun findes **én** alderlogik i repoet.
- **Fejl fundet undervejs — en reel, ikke en kosmetisk.** `new
  Date("1990-03-15")` tolkes som **UTC**-midnat, mens koden læser
  `.getFullYear()/.getMonth()/.getDate()`, som er **lokale** getters. I Danmark,
  Sverige og Norge (UTC, +1, +2) er det uden betydning, så ingen besøgende på
  de tre domæner har set en fejl — men **enhver besøgende bag UTC fik dagen
  i går**, og den samme kode kører nu også server-side til eksempeltabelen,
  hvor et container-TZ derfor ville have kunnet ændre tabellen. `parseDato`
  bygger nu datoen af kalenderfelterne selv, så resultatet er
  **tidszoneuafhængigt** — og det er låst i en test.- **Fem rækker, hver med en begrundelse:** det eksempel, siden *allerede*
  lover i sin description (født 15. marts 1990 → 25. sep. 2026 = 36 år, 6
  måneder, 10 dage, 13.342 dage); **det samme fødselsdato tilbage i tiden**
  (→ 1. maj 2010 = 20 år, 1 måned og 16 dage) — det er selve spørgsmålet fra
  autocomplete; hele år (1. jan. 2000 → 1. jan. 2025); **skudårsfødselsdag**
  (29. feb. 2004 → 28. feb. 2026 = 21 år, 11 måneder, 30 dage, og næste
  fødselsdag 1. marts fordi 2026 ikke er skudår); og et barn (15. juli 2015 →
  15. jan. 2026), hvor måneder og dage er hele svaret. Datoformaterne er
  samme kalenderpars som modulet bruger, så de kan heller ikke glide.
- **FAQ:** 2 nye par i `page-data.ts` for **da og se** — "Kan jeg beregne
  alder mellem to datoer?" og "Hvor gammel var jeg den 1. maj 2010?" (SE:
  "Kan jag beräkna ålder mellan två datum?" / "Hur gammal var jag den 1 maj
  2010?"). Svarene er værktøjets egen adfærd, med fødselsdatoen fra
  eksemplet. **`no` er bevidst urørt** — beregner.dk-domænet har ingen
  dokumenteret trafik, så en fast dato-tabel der ville være en ukontrolleret
  tilføjelse. En test fanger det, hvis norsk siden begynder at vise den.
- **Ental og flertal, fundet ved at læse den færdige side.** Den nye tabel
  skrev "**1 måneder**", fordi `AlderBeregner` altid har brugt
  `` `${m} måneder og ${d} dage` `` uden at se efter tallet. Samme
  oversættelsesglider som C38's fire svenske sætningsfejl, bare i **værktøjets
  egen grammatik** — og den ville have stået på en side, hvis hele pointen
  er tillid til tallene. `formatAlder` tager nu ental ved 1 i begge sprog (og
  flertal ved 0, som dansk kræver), og **`AlderBeregner` bruger samme
  formatter**, så der kun findes én grammatik i repoet; de to
  `monthsAndDays`-felter er fjernet fra komponentens labels i stedet. Den
  første negative test var for naiv — `not.toContain("1 måneder")` fejlede på
  "**11** måneder" — så mønsteret bruger en tal-grænse. Den negative test er
  bevaret, fordi et tal-grænse-mønster er præcist, mens substring ikke er.
- **Test:** 16 nye i `src/lib/alder.test.ts` — bl.a. **skudår begge veje**
  (29. feb. 2004 → 28. feb. 2026 *og* → 29. feb. 2028), at dage lånes fra den
  forudgående måned (31. jan. → 30. mar.), at fødselsdagen selv er 0/0/0, at
  næste fødselsdag er næste årsdag også *på* fødselsdagen (365 dage, 37 år),
  at umulige datostrenge og "31. februar" afvises, og at hver række i
  `ALDER_EKSEEMPLER` er identisk med `beregnAlder`'s svar — så tabellen er
  grøn, kun hvis logikken er. 5 nye i `src/app/alder/page.test.tsx` kræver
  H2'en i **begge** sprog, alle fem formaterede rækker i HTML'en, de to nye
  spørgsmål i FAQ'en, og at norsk *ikke* får tabellen.
- **Verifikation 2026-09-26:** `npm run test` grøn (**1421/1421**, 134
  filer), `npm run lint` grøn (535 filer), `npm run build` grøn (exit 0,
  141 statiske sider, kun de 7 kendte pre-existing CSS-advarsler). Første
  build fangede en typefejl i flytningen (`beregningsdato` mod
  `beregningsDato`) — den er rettet, og det er grunden til, at builden er
  med i gaten og ikke kun testen. `npm audit` urørt, ingen afhængigheder
  ændret.
- **Landet:** kode `95c8712` + `f882eac` på branch
  `ceo/alder-mellem-to-datoer`, merge `a0f99a9` (tabel) og `4b0d039` (ental)
  til `master` 2026-09-26 21:11 og 21:15 CEST — **begge før 21:30-batchen**,
  så deploynoten dækker den endelige tekst.
- **MÅL:** DA `/alder` baseline **6.013 visninger / 35 klik / CTR 0,6 % /
  pos. 7,8** pr. 2026-09-24; SE `/alder` **2.895 / 8 / 0,3 % / 7,7**.
  Plausible: SE `/alder` 15 besøgende/28d (+50 %) pr. 2026-09-26, ingen
  DA-række. Autocomplete er kvalitativt og skriver ingen. Forventningen er
  **flere impressions** på "beregn alder" (100v, pos. 9) og
  "aldersberegner" (315v, pos. 5) fra en side der nu svarer på spørgsmålet —
  ikke et CTR-spring, for det er stadig et hovedord. **Genmål 2026-10-10.**
- **Ikke gjort, bevidst:** `<title>`/meta er urørt — C4 sat dem, og en
  titelmæssig svar-først-revision hører til genmålingen 2026-10-10. Ingen ny
  `/alder-mellem-datoer/*`-underside: spørgsmålet er et **felt i et
  eksisterende værktøj**, ikke et emne med eget indhold, så en underside
  ville være tynd SEO-fyld. Og ingen norsk tabel, jf. overfor.


#### 75. [x] Audit 2026-09-26 — C47's metode på `/promille` og `/braendstof`: én reel fejl fundet, og en værktøjsfejl der lå i koden

- **Iteration start:** 2026-09-26 21:59 CEST. Køen var tom (alle 74 opgaver
  færdige, intet `I GANG`), og de fire åbne deploynoters første vinduer er
  **2026-09-27 07:30** (C37: 12:30) — efter denne iterations grænse, så intet
  var verificerbart. Valget var køens punkt 3: kør C47's metode på de
  trafikstærke sider, der endnu ikke er auditet.
- **Resultat: intet landet.** Jeg nåede at finde fejlen og skrive rettelsen,
  men ikke at få den grøn — se "Værktøjsfælde" sidst i denne opgave. Det er
  ærligt, og næste iteration kan tage den som en ren tekstopgave.
- **Auditens metode (C47's):** find feltet i værktøjet, som siden ikke
  fortæller om — og omvendt, om brødteksten lover noget, værktøjet ikke kan.
  Læst blev `PromilleBeregner.tsx` (188 linjer) + `promille/page.tsx` (108) og
  `BraendstofBeregner.tsx` (554) + `braendstof/page.tsx` (139), plus hele
  `page-data.ts`-teksten for begge slugs i DA og SE.
- **`/braendstof` (16.580 visninger, 180 klik, CTR 1,1 %, pos. 6,1) — negativt
  fund.** Værktøjet har tre beregningstyper (`turPris`, `kmPris`, `forbrug`),
  tre brændstoftyper og en sammenligningstabel, og **siden nævner ingen af dem
  i brødteksten** — men siden *beskrivelse* siger "Beregn pris, forbrug og
  årlig omkostning for benzin, diesel og el", og FAQ'en dækker el-mod-benzin
  og el-mod-diesel med tal fra `braendstof.ts`. Det er altså C47's mønster
  *allerede* lukket her. Klassen er lukket for `/braendstof`.
- **`/promille` (4.159 visninger, 60 klik, CTR 1,4 %, pos. 7,9) — et fund, og
  det er et sikkerhedsfund.** Værktøjet viser **to forskellige tidsrum**
  (`PromilleBeregner.tsx:170-174`): "Tid til 0 ‰" (`timerTilNul`) og
  grænsevurderingen i badge'en. Det **`timerTilGraense` — timer til at komme
  under lovens grænse — findes ikke i værktøjet og står ikke i siden.** Den
  går tabt i to steder, og det ene er en reel fejl:
  1. **`maaKoere` er hardkodet til 0,5 ‰ i `promille.ts:47`, uanset domæne.**
     Komponenten regner selv med `LIMIT = { da: 0.5, se: 0.2, no: 0.2 }`
     (`PromilleBeregner.tsx:51`), så UI'en er rigtig, men **biblioteket er
     ikke** — enhver server- eller ny komponent, der bruger `maaKoere`, får det
     danske svar på beraknare.se, hvor grænsen er 0,2 ‰. Samme fejlklasse som
     C38's locale-leak, bare i logikken.
  2. **FAQ'en svarer på "Hvornår kan jeg køre bil igen?" med 5,9 timer, men
     5,9 er tiden til 0 ‰** (`page-data.ts` DA og SE). Sætningen er "promillen
     skal blot regnes ned til under 0,5 ‰. 4 øl på 80 kg = 0,88 ‰, som kræver
     5,9 timer at blive bragt ned". Læseren kan regne sig frem til, at han
     må køre efter ca. 2,5 time — **det er ulovligt** — fordi det tal, der
     svares på, ikke er det tal, der bestemmer lovligheden. Tallene er i sig
     korrekte (0,88 ‰ og 5,9 h er regnet rigtigt af `page-data.test.ts:325`),
     men de to tidsrum er ikke adskilt.
- **Rettelsen er skrevet ud og verificeret i tal, ikke landet.** Alt nedenfor
  er regnet med repoets egen formel, så tallene er ikke gættet:
  | Situation | Promille | Under dansk grænse 0,5 ‰ | Under svensk grænse 0,2 ‰ | Til 0 ‰ |
  |---|---|---|---|---|
  | 4 øl, mand 80 kg, nu | 0,88 | **2,6 t** | 4,6 t | 5,9 t |
  | samme, 2 t efter | 0,58 | 0,6 t | 2,6 t | 3,9 t |
  | 2 genstande, kvinde 60 kg | 0,73 | 1,6 t | 3,6 t | 4,9 t |
  | 6 genstande, mand 70 kg | 1,51 | 6,8 t | 8,8 t | 10,1 t |
  (0,88 / 2,6 / 5,9 er verificeret mod `page-data.test.ts`'s eksisterende
  0,88-assertion; resten er min egen gennemregning af `promille.ts`.)
  **Sådan bør det bygges, i husets mønster fra C40/C47:**
  1. `src/lib/promille.ts`: tilføj `PROMILLEGRANSE = { da: 0.5, se: 0.2, no: 0.2 }`
     (ascii-navn, se fælden nedenfor), flyt `LIMIT` ud af komponenten, og giv
     `beregnPromille` et valgfrit femte argument `graense = 0.5`. Tilføj
     `timerTilGraense(promille, graense) = ceil((promille − graense)/0,15 × 10)/10`
     — **rund op, aldrig ned**, så svaret aldrig er for optimistisk — og lad
     både den og `maaKoere` bruge den afrundede promille, som `timerTilNul`
     gør i dag.
  2. `src/lib/promille-eksempler.ts`: de fire rækker ovenfor genereret fra
     `beregnPromille`, med situationen i `{ da, se }` — præcis som
     `alder-eksempler.ts`. Så siden og værktøjet ikke kan glide fra hinanden.
  3. `src/app/promille/page.tsx`: en tabel "Hvornår er du igen promillefri?"
     (SE "När är du åter nykter?") med kolonnerne *Situation / Promille nu /
     Under 0,5 ‰ / Helt ædru (0 ‰)*, grænsen hentet fra domænet.
  4. `src/components/PromilleBeregner.tsx`: tredje kort i resultatpanelet,
     "Under grænsen om N timer" ved siden af gram og "Helt ædru om".
  5. `page-data.ts`: skriv FAQ-svaret om, så de to tal står adskilt med de
     **danske** tal (2,6 og 5,9) og de **svenske** (4,6 og 5,9), regnet fra
     eksempelmodulet — ikke skrevet i hånden.
  6. Tests: `timerTilGraense ≤ timerTilNul` for alle genstande/vægt/køn/
     grænser, at `maaKoere` følger den grænse den får, at de fire rækker er
     fundet (C44's lektion: en test der er grøn på en tom liste er værd
     ingenting), og at SE-rækkerne ikke kan få dansk tekst.
- **MÅL:** `/promille` baseline **4.159 visninger / 60 klik / CTR 1,4 % /
  pos. 7,9** pr. 2026-09-24 (GSC); Plausible gav den ingen DA-række i
  top-15. Autocomplete 2026-09-26 22:05 (DA): "promille beregner" er
  **forslag 1** til "promille", og GSC har "promille beregner" 1.038v pos. 9
  — så hovedordet er bekræftet, mens spørgsmålsformen er det ikke: DA har ingen
  "hvornår er jeg promillefri"-forslag, **SE har derimod "hur länge sitter
  promille i blodet"** (forslag 2 til "hur länge promille") og "promille
  dagen efter". Forventningen er derfor først **flere impressions på
  spørgsmålsformen på beraknare.se** og et bedre svar på dansk, ikke et
  CTR-spring på hovedordet. **Genmål 2026-10-10.**
- **Værktøjsfælde, som kostede denne iteration — skrevet ned, så næste ikke
  taber den igen.** Jeg ville kalde konstanten `PROMILLEGRÆNSE` med dansk Æ.
  Det gik galt på tre måder, alle med samme årsag: **mit eget output blev
  korrupt på vej til filen.** Først fik importlinjen en `O` erstattet af et `A`
  (`PRAMILLEGRÆNSE`), så fik en perl-replacement et `L` tabt
  (`PROMILEGRÆNSE`), og hele tiden viste `read`, `sed` og `rg` den tekst, de
  skulle have vist — fordi homoglyffer *ligner* det rigtige. Følgen var 20
  minutter på `ReferenceError` på et navn, der så rigtigt ud i tre
  værktøjer. **Regel for fremover: brug ASCII i identifikere i ny kode**
  (`PROMILLEGRANSE`, ikke `PROMILLEGRÆNSE`) — repoet har allerede
  `praemieManglerForudsætning` og `tidszoneRækker`, så ASCII er ikke en
  ny praksis. **Og når et navn slår fejl, skal bytes kundes, ikke øjne:**
  `node -e "console.log([...s].map(c=>c.codePointAt(0).toString(16)))"` på den
  konkrete linje. `grep`/`rg`/`sed` siger intet om homoglyffer.
- **Ingen kode landet.** `git checkout -- src/` ryddede ændringerne, og de to
  nye filer er slettet. `master` er urørt. Iterationen er derfor en
  **research/notat-iteration** med et fuldt udarbejdet, målt og
  implementationsklar fund — ikke en færdig opgave, og det står som sådan.


#### 76. [x] FÆRDIG 2026-09-26 — C48 — `/promille`: værktøjet svarede på "hvornår må jeg køre bil" med tiden til 0 ‰

- **Iteration start:** 2026-09-26 22:17 CEST. Køen var tom (alle 75 opgaver
  færdige, intet `I GANG`), og de fire åbne deploynoters første vinduer er
  **2026-09-27 07:30** (C37: 12:30) — efter denne iterations grænse, så intet
  var verificerbart. Valget var køens punkt 3: opgave 75's fund, som var skrevet
  ud og målt, men aldrig landet.
- **Fundet var et sikkerhedsfund, og det er nu rettet.** To fejl, begge
  bekræftet i live-output før rettelsen:
  1. **Biblioteket svarede med den danske grænse overalt.** `maaKoere` var
     hardkodet til `promille < 0.5` i `src/lib/promille.ts`, mens komponenten
     havde sit eget `LIMIT = { da: 0.5, se: 0.2, no: 0.2 }`. UI'en var
     rigtig, men enhver ny eller server-side bruger af `maaKoere` fik det
     danske svar på beraknare.se, hvor lovens grænse er 0,2 ‰. Samme
     fejlklasse som C38's locale-leak, bare i logikken. Nu ligger grænsen i
     `PROMILLEGRANSE = { da: 0.5, se: 0.2, no: 0.2 }` i modulet, og
     `beregnPromille` tager den som valgfrit femte argument, så komponent,
     tabeller og FAQ ikke kan være uenige om hvilket land der regnes for.
  2. **FAQ'en svarede på det forker spørgsmål.** "Hvornår kan jeg køre bil
     igen?" svarede **5,9 timer**, som er tiden til 0 ‰. Læseren kan regne sig
     frem til ca. 2,5 time — og det er ulovligt, fordi det er tiden til at
     komme **under 0,5 ‰**, der bestemmer lovligheden. Den svenske svar var
     værre: den sagde "ned till under 0,2 ‰ … 5,9 timmar", altså det danske
     tidsrum på den svenske grænse. Begge svar er nu skrevet fra
     eksempelmodulet, ikke i hånden.
- **Tilføjet: `timerTilGraense(promille, graense)`.** Den manglede helt, både i
  værktøjet og på siden. Den **ruller op, aldrig ned** (`ceil((p − g)/0,15 ×
  10)/10`), så et svar aldrig kan være for optimistisk, og den bruger den
  **afrundede** promille, som siden viser — så tallet læseren ser og tallet der
  regnes på ikke kan glide fra hinanden. `timerTilNul` gør nu det samme, så de
  to tidsrum udledes af præcis samme værdi.
- **Rettelsens fire dele, i husets mønster fra C40/C47:**
  1. `src/lib/promille.ts` — `PROMILLEGRANSE`, `graenseForLocale`,
     `timerTilGraense`, valgfrit femte argument. **ASCII i identifikate**, som
     opgave 75's værktøjsfælde kræver.
  2. `src/lib/promille-eksempler.ts` — fire rækker **genereret af
     `beregnPromille`**, præcis som `alder-eksempler.ts`, og hver række bærer
     **begge** lovgrænser, så tabellen kan vise dansk 0,5 ‰ og svensk 0,2 ‰
     uden to opgørelser af samme tal.
  3. `src/app/promille/page.tsx` — tabellen "Hvornår er du igen promillefri?" /
     "När är du åter nykter?" med kolonnerne *Situation / Promille nu / Under
     {grænse} / Helt ædru (0 ‰)*, grænsen hentet fra domænet, plus et nyt afsnit
     "To forskellige tal" i brødteksten på begge sprog.
  4. `src/components/PromilleBeregner.tsx` — tredje kort i resultatpanelet,
     "Under grænsen om 0,5 ‰", så det kortere tal ikke længere findes ét
     sted og det længere et andet. Badge'en læser nu grænsen fra modulet i
     stedet for to hardkodede strenge.
- **Tallene er verificeret i en test, ikke i teksten.** Alle fire rækker er
  hæftet i `promille-eksempler.test.ts`: 0,88/2,6/4,6/5,9 · 0,58/0,6/2,6/3,9 ·
  0,73/1,6/3,6/4,9 · 1,51/6,8/8,8/10,1. Det er præcis opgave 75's tabel, og den
  første kørsel fandt **én fejl i min egen formatter** (`2,60 timer` i stedet for
  `2,6 timer`) — formatteren brugte promillens to decimaler. Rettet, og
  formateringen har nu egen test.
- **Dertil fire nye assertions, der låser fejlklassen:**
  - `timerTilGraense ≤ timerTilNul` for alle rækker, og den svenske grænse
    giver aldrig kortere tid end den danske.
  - Rækkerne er fundet (`length === 4`) — C44's lektion: en test der er grøn på
    en tom liste er værd intet.
  - Hver bemærkning findes på begge sprog, og **en liste på 17 ord** (bl.a.
    "genstande", "højere", "danske", "helt ædru" / "standardglas", "högre",
    "svenska", "helt nykter") sikrer at ingen dansk tekst kan lække til svensk.
    Den liste fandt **én rigtig lækage**: række 2 skrev "Under den danske
    grænsen" i den svenske tekst. Rettet.
  - `page-data.test.ts` kræver nu at FAQ'en indeholder **både** "2,6 timer" og
    "5,9 timer" (DA) og "4,6 timmar" og "5,9 timmar" (SE), så de to tidsrum
    ikke kan glide sammen igen.
- **Verificeret lokalt før merge, på den rigtige server.** `next build` er
  grøn, `next start` + curl på `/promille` med `Host: beraknare.se` giver 200,
  og begge sider renderer tabellen med de rigtige tal og den rigtige grænse pr.
  domæne. Det eneste `0,5 ‰` på den svenske side er den tilsigtede
  sammenligning med Danmark i FAQ'en — kontrolleret, ikke antaget.
- **MÅL:** `/promille` baseline **4.159 visninger / 60 klik / CTR 1,4 % /
  pos. 7,9** pr. 2026-09-24 (GSC). Plausible gav ingen DA-række i top-15, så
  de danske tal er GSC's. Autocomplete 2026-09-26 22:05 (DA): "promille
  beregner" er forslag 1 til "promille", men DA har **ingen**
  "hvornår er jeg promillefri"-forslag, mens SE har "hur länge sitter promille i
  blodet" (forslag 2) og "promille dagen efter". Forventningen er derfor først
  **flere impressions på spørgsmålsformen på beraknare.se** og et bedre svar
  på dansk — ikke et CTR-spring på hovedordet. Et korrekt svar er også et
  hensigtsspørgsmål for Google at vise i sit snippet. **Genmål 2026-10-10.**
- **Bemærk til næste iteration:** opgave 75 skrev, at opgaven krævede "et
  valgfrit femte argument" — det viste sig at være den *eneste* API-ændring.
  `PromilleResultat` fik ét nyt felt, og ingen anden fil i repoet konstruerer
  resultatet direkte, så ingen kaldssted uden for værktøjet og testene skulle
  rettes. Det er værd at huske: de "ubeskrivne funktioner" C47's metode
  ledte til, er ofte små, når man først har fundet dem.


#### 77. [x] FÆRDIG 2026-09-26 — C49 — `/tidszone`: værktøjet regnede med vintertid hele året

**C49 er C47's metode anvendt på de to sider, køen pegede på, og den gav
sitt største fund endnu: ikke en tekst, der lovede for meget, men en
beregning, der var en time forkert i syv måneder.** `TidszoneBeregner` havde
ét `offset`-felt pr. zone, sat til vinterværdien, og brugte det både til
tidsforskellen, til "klokken nu" og til den konverterede klokkeslæt. Noten på
siden sagde det endda ærligt: "Denne beregner bruger standard tidsforskelle" —
altså var fejlen kendt og forklaret i stedet for rettet. Brødteksten i
svar-først-kassen vidste det bedre, fordi den viser en vinter- og en
sommerkolonne fra sit eget modul (`tidszone-reference.ts`), som C46 netop
havde udvidet med Grønland, Lissabon, Athen og Kreta. **Det er C48's mønster
igen: en konstant i komponenten, der duplikerer et modul.**

**Hvilke tal var forkerede.** Forskellen til Danmark er 6 timer hele året for
New York, fordi USA skifter nogenlende samtidig med Danmark — så *den* behøver
ikke at ændre sig for at bevise, at rettelsen virker. Det gør de zoner, der
ikke følger Danmark: **Tokyo +7 om sommeren og +8 om vinteren, Sydney +8 og
+10, Johannesburg 0 og +1, Mumbai +3,5 og +4,5, São Paulo −5 og −4, Beijing,
Bangkok og Singapore.** Det er 8 af de 16 viste zoner, og de ligger i
mekanismen brugeren kopierer videre til et møde.

**Rettelsen.** `src/lib/sommertid.ts` (ny) slår sommerperioden op pr. regel —
`eu`, `us`, `au`, `ingen` — og `utcOffsetMinutter` giver den effektive offset.
`TidszoneBeregner` bruger den i alle tre steder. Overgangsdatoerne er
**verificeret mod systemets egen tz-database** (`zoneinfo`) for 2026 og 2027,
ikke mod en huskelse: EU 29/3→25/10, USA 8/3→1/11, Sydney 5/4→4/10, og **Nuuk
følger EU's datoer** (WGT/WGST siden 2023), hvilket ikke stod i modulet før.
Testene hæfter dagen for skiftet fast, fordi det er præcis der en
ugedagsfejl dukker op — og `sidsteSoendagIMaaned` måtte skrives særskilt, fordi
"femte søndag i oktober 2026" ligger i november.

**Den længere rækkevidde: et kryds-tjek mellem de to datakilder.** Samme by
havde sit offset i komponenten og i `tidszone-reference.ts`, og intet holdt dem
sammen. `TidszoneBeregner.test.tsx` sammenligner nu alle 16 byer, så et brud på
den ene side fanges af den anden. Det er det samme rædselskab, der gjorde
C48's `maaKoere`-fund muligt, nu gjort permanent i stedet for noteret.

**Tre copy-rettelser, fordi løftet skulle være sandt.**
1. Noten siger nu, at beregneren følger sommertiden for dagens dato, og nævner
   de to forskellige skiftedatoer. Det gamle "standardtidsforskelle" var ikke
   længere sandt.
2. Svar-først-brødteksten siger, at tallene er **vinterværdierne** — de er
   præcis kolonnen til venstre i tabellen lige under, som også nævner, at
   Tokyo ligger en time tidligere, når Danmark har somertid.
3. **"Populære tidsforskelle" skrev "Tokyo: 8 timer foran"**, hvilket kun
   holder 29/3–25/10, fordi Tokyo ikke har sommertid. Nu: "8 timer foran om
   vinteren, 7 timer mens Danmark har sommertid" (SE: 8 timmar före på
   vintern, 7 timmar när Sverige har sommartid). Sydney og resten var i forvejn
   skrevet som et interval, fordi de vidste det.

**Et løfte, der ikke kunne holdes, blev fjernet.** Brødteksten sagde "Brug
tidszoneberegneren til et præcist klokkeslæt for en vilkårlig by, tidspunkt og
**dato**". Værktøjet tager **ikke en dato ind** — kun time og minut. Det er
C40's fejltype (en `metaDescription`/brødtekst, der lovede et felt, der ikke
findes), fundet to dage senere i en anden klasse. Teksten siger nu, hvad
værktøjet faktisk gør: følger sommertiden for dagens dato, viser tidsforskel,
klokken nu og et valgt tidspunkt.

**MÅL:** `/tidszone` baseline **24.723 visninger / 115 klik / CTR 0,5 % /
pos. 7,5** pr. 2026-09-24 (GSC). Største søgning: "tidszoner" 764v pos. 10;
"hvad er klokken i usa når den er 12 i danmark" 183v pos. 6. Rettelsen er først
og fremmest en **sandhedsrettelse**, ikke en CTR-indsats: en bruger, der får det
forkerte svar i juli, får ikke et klik, fordi han stoler på det. Effekten
måles som færre forkerte svar, ikke som flere klik. **Genmål 2026-10-10.**

**Beslutning, der lå i vejen, og blev taget eksplicit.** Værktøjet har ingen
datofelt, så DST-perioden er slået op for **dagens dato**. Det er det, et
spørgsmål som "hvad er klokken i USA, når det er 12 i Danmark" handler om, og
et datofelt ville være en ny UI-kontrakt plus en ny tilstand i det delte link.
Skal næste iteration tilføje det, er det en selvstændig opgave — se ❓.

**Tre negative fund, skrevet ned så ingen senere iteration bruger tid på dem.**
- **"2026 har 253 arbejdsdage" på `/dato` er korrekt.** Talt ud fra
  `helligdage.ts`: 261 hverdage minus 7 helligdage på hverdag minus
  nytårsaften (torsdag 2026) = 253. Til gengæld er tallet **hardkodet** på
  siden og bliver forældet i januar; det er en reel, men lille, opgave, fordi
  den samme funktion findes i modulet.
- **`/dato` nævner alle fire tilstande.** C45's åbne eksempel "flere tilstande
  end siden nævner" holder for `/tidszone` (den nævnte ikke konverteringen af
  et bestemt tidspunkt, kun dens tidsforskel) men **ikke** for `/dato`: siden
  har "Sådan bruger du datoberegneren" med alle fire. Den beskriver dog kun
  *dage, uger, måneder, arbejdsdage og weekenddage* i tilstand 1, hvor
  værktøjet viser **også helligdage** og nytårsaftens-noten.
- **Dansk og svensk feriedagstabel er enslydende** med modulet: 9 danske
  helligdage og 15 svenske rødager, og de to lister i de to landes tips er
  korrekte. Den svenske liste nævner "alla helgons dag", som Danmark
  korrekt ikke har, og omvendt nævner den danske ikke de svenske.

#### 78. [x] FÆRDIG 2026-09-26 — C50 — `/dato`: standarddatoerne var UTC-forskudt, og alder-tilstanden duplikerede `alder.ts`

**C50 er C48/C49's metode anvendt på sitets næststørste side.** `/dato` har
1045 besøgende/28d (+76 %) og **130.392 visninger** i GSC (sitet nr. 2), er
**indgangsside nr. 1 (963)**, og lå i køen som den sidste trafikstærke side,
C47's audit ikke havde rørt. Den gav tre fund, hvoraf ét er en reel fejl, der
rammer alle besøgende.

**Fund 1 — standardtilstanden var forskudt en dag ( reel fejl).**
`DatoBeregner` byggede dagens dato med `new Date().toISOString().split("T")[0]`.
`toISOString()` skriver i **UTC**, så:
- kl. 00.00-02.00 dansk tid (hele året, og hele døgnet i UTC+0-vinteren) viste
  **dagen i går** i begge datofelter;
- "Til dato" var **systematisk én dag for tidligt hele døgnet**: standarden er
  `d.setMonth(d.getMonth() + 1)` på en *lokal* dato, som så skrives i UTC — så
  27. september kl. 00.00 lokal (CEST) bliver "2026-10-26", ikke "2026-10-27".
  Det gjorde standardvisningen til **29 dage i stedet for 30** hele døgnet;
- i **januar** sprang "til dato" desuden til **3. marts**, fordi
  `setMonth(+1)` på 31. januar ruller over i næste måned. Nu klemmes den til
  månedens sidste dag (28. februar 2026, 29. februar 2028).

**Fund 2 — alder-tilstanden duplikerede et modul, der allerede var rettet.**
C47 fandt i `/alder` at `new Date("1990-03-15")` tolteres som UTC-midnat, mens
koden læser `.getDate()` — altså dagen i går for enhver læser bag UTC — og
flyttede læsningen ind i `alder.ts`'s `parseDato`. **`DatoBeregner`'s
alder-tilstand stod stadig med hele regnestykket inline**, tolkede
`foedselsdato` på samme måde og lavede selv næste fødselsdag. Den brugte
`Math.ceil` til dage-til-fødselsdag, mens modulet bruger `Math.floor` — to
værktøjer, to svar, ingen test. Nu kalder tilstanden `beregnAlder`, og modulet
leverer `naesteFoedselsdagDato`, så komponenten ikke skal finde datoen igen.
**Dette er præcis C48's og C49's mønster: en konstant i komponenten, der
duplikerer et modul** — og det lå på den side med flest indgangssider.

**Fund 3 — tomme felter gav "NaN".** Alle fire tilstande lavede
`new Date(inputværdi)` uden at tjekke feltet. Rydder man et datofelt, stod der
"NaN dage" / "NaN år" / "Invalid Date" på en side med 963 indgangssider. Nu
går alle tilstande gennem `parseIsoDato`, som afviser tomme, korte og umulige
datoer (31. februar), og et felt uden gyldig dato viser **intet resultat**
frem for et tal, der ikke betyder noget. Det er samme regel som BMI's
barnestate: vis hellere ingenting end noget stille forkert.

**Rettelsen.** Ét nyt modul `src/lib/lokal-dato.ts` med `tilIsoDato` (kalender-
felter → "YYYY-MM-DD"), `parseIsoDato` (lokal læsning, afviser 31. februar) og
`plusIsoMaaneder` (månedsskift med klemning). `alder.ts` bruger nu dets
`parseIsoDato` i stedet for sin private kopi, så der er **én** læsning af
kalenderdatoer i hele `src/lib`. Komponenten bruger modulet til standardværdier,
reset og alle fire tilstande.

**Én intern link, der er dokumenteret af værktøjet selv.** `/dato`'s alder-
tilstand regner alderen **i dag**, mens `/alder` (6.013 visninger, pos. 7,8) kan
finde alderen på en vilkårlig dato. Siden sagde det aldrig, så læseren med
spørgsmålet "hvor gammel var jeg den 1. maj 2010?" skulle finde ud af det selv.
Punkt 4 under "Sådan bruger du datoberegneren" linker nu til `/alder` — samme
fund som C47's på `/alder` i modsat retning.

**MÅL:** `/dato` baseline **1.045 besøgende/28d 2026-09-26** (Plausible),
**130.392 visninger / 801 klik / CTR 0,6 % / pos. 5,8** (GSC 2026-08-27 →
2026-09-24). Rettelsen er først og fremmest en **sandhedsrettelse**: en læser,
der får "29 dage" i standardvisningen, får ikke et klik, fordi han stoler på
den. Effekten måles som færre forkerte standardvisninger, ikke som flere klik.
**Genmål 2026-10-10.**

**To negative fund, skrevet ned så ingen senere iteration bruger tid på dem.**
- **De samme tre filer har flere `toISOString().split("T")`**: `AlderBeregner`
  (3) og `UgenummerBeregner` (2). De er **ikke** rettet her, fordi de ikke er
  nået af en trafikmåling i dette snapshot, og de skal løses i én samlet
  opgave med test — ikke som sidespor.
- **"2026 har 253 arbejdsdage" på `/dato` er stadig hardkodet** (gentaget fra
  C49's negative fund) og bliver forældet i januar. Samme funktion findes i
  `helligdage.ts`; det er en lille, velafgrænset opgave, men den har ingen
  trafikgrund og er derfor ikke blandet ind her.

**Kvalitetsgate 2026-09-26 23:05:** `npm run test` grøn (**1451/1451** i 137
filer), `npm run lint` grøn (541 filer), `npm run build` grøn (141 sider, ingen
advarsler i output). **Ni nye tests**: syv i `lokal-dato.test.ts` og to i
`DatoBeregner.test.tsx`, hvor den ene slår alder-tilstanden mod `beregnAlder` —
så de to værktøjer ikke kan glide fra hinanden igen, og den anden håndterer en
fødselsdato i fremtiden.

#### 79. [x] FÆRDIG 2026-09-26 — C51 — `/tidsberegner`: værktøjet kunne "mellem to datoer" hele tiden, siden sagde det aldrig

**C51 er C47's metode anvendt på sitets nr. 3-side.** `/tidsberegner` har
287 besøgende/28d (+51 %) og **72.382 visninger** i GSC (nr. 3, 207 klik,
CTR 0,3 %, pos. 7,0) og blev udpeget som næste trafikstærke auditmål i C50.
Den gav tre fund, hvoraf ét var en fejl i den synlige tekst.

**Fund 1 — to datofelter i værktøjet, nul omtaler på siden ( reel fejl).**
`TidsBeregner` har haft `startDato`/`slutDato` — mærket "(valgfri)" — siden
sidens begyndelse, og de er **det eneste, der gør siden i stand til at svare
på "hvor mange timer er der mellem to datoer"**. Live-HTML'en på master
havde **0 forekomster** af "dato" i hele `/tidsberegner`'s brødtekst, og ingen
af de fem svar-først-eksempler brugte felterne: læseren med en weekend eller
en ferie fik det forkerte svar, fordi han ikke havde nogen grund til at kigge
på de to felter under klokkeslættene.

**Datagrund.** Autocomplete DA 2026-09-26 23:22: "hvor mange timer er der
mellem to datoer" er **forslag 4** til "hvor mange timer er der mellem", og
"hvor lang tid er der fra dato til dato" er **forslag 3** til "hvor lang tid
er der fra" — og "hvor lang tid" er GSC's nr. 2-søgning på netop denne side
(790 visninger, pos. 6). Det er samme relation, som C45-C47 afslørede på
`/tidszone` og `/alder`: **værktøjet kan det, siden siger det ikke.**

**Rettelsen.** To nye rækker i `TIDS_EKSEEMPLER` (fredag 16:00 → mandag 09:00
= **65 t 0 min**, og tre arbejdsdage med to frokostpauser), beregnet af
`beregnTidsinterval` som alle andre, så tabellen ikke kan glide fra værktøjet.
`formatTidsvar(eksempel, locale)` giver dansk "65 t 0 min" og svensk
"65 h 0 min" — danske forkortelser på beraknare.se er en locale-leak, selv om
C38 kun testede hele sætninger. Et H2-afsnit på **begge domæner** forklarer,
hvornår de to datofelter skal bruges, med kontrasten: *samme* interval er 65
timer med datoer og **17 t 0 min** uden, og begge tal hentes fra modulet.
Værktøjet har nu selv en linje under felterne (DA + SE).

**Fund 2 — tabellen skrev "(dagen efter)" på et interval, der slutter tre
dage senere.** `overMidnat` betyder "sluttidspunktet er tidligere end
starttidspunktet", og siden-først-rækken oversatte det til "(dagen efter)".
Uden datofelter er det sandt; med datofelter er det ikke. Annotationen vises
nu kun på eksempler uden datofelter, og testen siger eksplicit hvad flaget
betyder.

**Fund 3 — "dage" var ikke dage.** Komponentens fjerde tile i "Detaljeret
visning" regnede `parseFloat(totalTimer) / 24` og kaldte resultatet
`l.dageWord` — så otte timers arbejdsdag viste som **"0,33 dage"**. Nu
regner modulet `heleDoegn = totalMinutter / 1440`, og etiketten er
"hele døgn" / "hela dygn". Samme klasse som C48-C50: beregning i komponenten
og et navn, der ikke passer til tallet.

**MÅL:** `/tidsberegner` baseline **287 besøgende/28d 2026-09-26**
(Plausible), **72.382 visninger / 207 klik / CTR 0,3 % / pos. 7,0** (GSC
2026-08-27 → 2026-09-24). Mål igen 2026-10-10.

**Kvalitetsgate 2026-09-26 23:35:** `npm run build` grøn (141 sider),
`npm run test` grøn (**1455/1455** i 137 filer), `npm run lint` grøn
(541 filer). **Fire nye tests**: to i `tids-eksempler.test.ts` (at eksemplerne
med datofelter virker, at brødtekstens tal er 65/17 timer, og at den
svenske notationsform ikke får danske forkortelser), én der forbyder et
eksempel med kun ét datofelt, og én i `tidsberegner.test.ts` for `heleDoegn`.

**To negative fund, skrevet ned så ingen senere iteration bruger tid på dem.**
- **`fratraekPause` større end intervallet giver stille "0 t 0 min"**
  (`Math.max(0, …)` i `tidsberegner.ts:77`). Det er et gulv, ikke en fejl, men
  brugeren får intet at vide hvorfor. Ikke rettet: en nullstilling ville få
  hele resultatpanelet til at forsvinde, hvilket er et dårligere svar end
  0. Kræver en egen beslutning om UX.
- **Revidering af `overMidnat`-flaget i selve modulet** ville være renere end
  betingelsen i siden, men flaget bruges af `TidsBeregner` til en badge, og en
  ændring i flagets betydning rammer også den. Betingelsen i siden er derfor
  den mindste indgreb.

### Næste kandidater efter C34 — lukket med negativt fund




C34 lukkede kandidat #1 (blog → beregner) med et **negativt** resultat: der var
intet at rette i den retning, planen bad om. Returlinkene er gjort symmetriske
for de fem trafikstørste beregnere. Resten af listen er **uændret** og prioriteret
efter datagrund:

0. ~~**Nye artikler til de to største ubestyrede emner.**~~ **Lukket i C35 og
   C36:** `/kvadratmeter` (se opgave 62) og `/tidszone` (se opgave 63) har nu
   hver sit gennemarbejdede indlæg med tabeller, tal med kilde og kobling i
   `blog-kobling.ts`. Autocomplete viste, at de længere formuleringer
   ("hvad er klokken i usa når den er 21 i danmark", "tidsforskel grønland",
   "tidszoner kort") var det rigtige format — artiklerne er skrevet efter dem.
   **Mål begge 2026-10-10, før der skrives en tredje.**
1. ~~**Blog → beregner**~~ — **lukket i C34 med negativt audit-resultat.**~~ Alle 26
   indlæg har allerede et link til den relevante beregner i 1-5 % af kroppen, og
   24/26 ender med en relateret-blok. Der var intet at rette. Returlinkene er gjort
   symmetriske for de fem beregnere med flest visninger. Mål 2026-10-10.
2. ~~**28 DA-sider har ingen svensk metadata.**~~ **Springes endnu en gang,
   2026-09-26 (C38).** Betingelsen var "tag dem kun hvis et nyt snapshot tæller
   dem". Snapshot 2026-09-26 14:07 tæller dem ** ikke**: SE-top-15 er
   `/tidsberegner`, `/dato`, `/leasing`, `/nedtaelling`, `/`, `/alder`,
   `/tidszone`, `/kalorier`, `/elberegner`, `/loenstigning`, `/timepris`, `/moms`,
   `/gaeldsfri`, `/renteberegner`, `/loen-konverter` — og **alle 15 har
   SE-metadata** i `sePages` (verificeret programmatisk mod `page-data.ts`).
   De 28 DA-sider uden SE-metadata er desuden *danske* ydelsessider
   (løn, skat, pension, boligstøtte, barsel, SU, feriepenge …), som ikke kan
   rangere på svenske søgninger. Det er ikke en voksende klasse, det er en
   død klasse. **Lukket.**
3. ~~**C32's åbne spørgsmål om `/elbil`.**~~ **Lukket i C37 med negativt fund.**
   Snapshottet 2026-09-26 tæller `/elbil` hverken på DA eller SE, så spørgsmålet
   blev som planen lovede om de interne links. **Der er ingen mangel:** `/elbil`
   har 20 referencer fordelt på 10 filer — `calculator-list.ts`, `categories.ts`,
   `page-data.ts`, `icons.ts`, `braendstof.ts` (sammenligningstabellen),
   `energi/elpriser.ts` og de to bilartikler. Siden er altså ikke linket fra
   færre steder end nogen anden kalkulator; det er **ikke** et internt-link-
   problem, og C32's indholdsreparation var den rigtige indsats. Uden en
   Plausible- eller GSC-række kan jeg ikke sige hvad der så holder den ude, så
   den står som et åbent **spørgsmål til næste research-iteration**, ikke som en
   opgave: se ❓ Til Mads.
4. **Beslutninger i ❓ der låser arbejde:** `/api/v1/loen`'s kommuneskat (frosset
   ekstern kontrakt), beskæftigelsestillægget på 26.198 kr. uden dækkende kilde,
   depositum på 3 måneder som "typisk" uden lovtekst, og `www`-domænerne. Alle fire
   kræver et ja fra Mads før de røres.
5. **Delvis lukket i C39 (2026-09-26).** SE `/procent` — den største
   ubearbejdede side i klassen — har nu de tre svenske spørgsmål, de to
   interne kanter de svarer på, og ingen dansk skattesats. Se opgave 66.
   **Mål 2026-10-10.** Øvrige SE-sider i klassen er urørte: `/bil` (pos.
   32,9), `/kalorier` (pos. 20,7), `/moms` (pos. 23,6), `/renteberegner` (pos.
   26,6). De har små visningstal (1.414-2.774), så de skal **kun** åbnes, hvis
   et nyt GSC-snapshot giver dem mere.
5b. **Ny klasse fundet i C38: svensk *placering*, ikke CTR.** SE `/bil` pos. 32,9,
   `/kalorier` pos. 20,7, `/moms` pos. 23,6, `/renteberegner` pos. 26,6 og
   `/procent` pos. 10,2 med 23.294 visninger og **0,0 % CTR**. Alle har svensk
   metadata og svenske head-ord, så copy er udelukket som årsag. Det, der mangler,
   er **internt linkvægt på beraknare.se** og/eller svensk substans på de
   svenske *undersider* (ikke hovedsiden). Dataside: SE `/kalorier` har kun
   "kaloribehov" én gang i hele teksten, mens GSC viser fire søgninger på netop
   "kaloribehov" (41/33/27 visninger, pos. 34/49/47) — et reelt emne for næste
   research-iteration, fordi det kræver **substanstjek** (kcal, aktivitet,
   BMR), ikke en titel. **Mål ikke før 2026-10-10**, så C38's effekt er målt
   først.
6. ~~**NY klasse fundet i C40: `metaDescription` mod synlig brødtekst.**~~
   **Lukket i C41 med negativt fund.** Alle 13 øvrige DA-sider i GSC-top-14
   blev auditeret med C40's metode (live-HTML, `metaDescription` holdt op mod
   den udtrukne brødtekst), og **hvert tal i hver meta findes på siden**.
   C40 var en enkelt fejltype, ikke en mønsterklasse. En side kan altså ikke
   vurderes ved, om GSC's søgestreng forekommer *exact* — dansk
   sammensætning ("benzinberegner" vs. "benzin beregner") gør det ubrugeligt
   som fejlsignal. Det eneste verificérbare signal uden trafikdata er en
   **selvmodsigelse mellem to steder på samme side**. Se opgave 68.
7. ~~**Ny klasse fundet i C41: interne kæder, der kun hænger én vej.**~~
   **Lukket i C42 med ét fund og ét negativt resultat.** `/dato` linkede til
   nul af de syv `dage-til`-sider, hvis egen ankertekst ("Hvor mange dage er
   der til 1. december?") matcher sitets næststørste søgning (996 visninger,
   pos. 5). `/nedtaelling` linkede til alle svy. Auditten af de øvrige
   trafikstærke sider fandt **kun `/brok`** (4.640 visninger, pos. 5,3) med
   nul redaktionelle indgående links — rettet, og nu permanent vagtet i
   `calculator-list.test.ts`. Resten af de 19 trafiksider har 2-30
   indgående links hver, så **klassen er lukket**. Se opgave 69.
    **Mål C41 og C42 begge 2026-10-10.**
  8. ~~**Cannibalisering: samme headline på to sider i samme domæne.**~~
    **Lukket i C43 (2026-09-26).** Alle 104 da / 54 no / 79 se-headlines er
    normaliseret og sammenholdt side ↔ artikler: **én** kollision, mellem
    `/tidszone` og C36's egen tidszone-artikel. Rettet ved at give artiklen en
    bredere headline, og vagtet permanent i `src/app/title-collision.test.ts`,
    som bevidst fejler på den gamle titel. Se opgave 70.
  9. ~~**`/procent` (149.318 visninger, CTR 0,1 %, pos. 7,4) åbner
     på et andet eksempel end titlen lover.**~~ **Lukket på indholdssiden i
     C44 (2026-09-26).** Live har siden 7 forekomster af "rabat" — GSCs
     næststørste søgning på siden er netop rabatten i procent (57 visninger,
     pos. 6) — samt H2'erne "Formler", "Procentregning i hverdagen",
     "Hurtige procent-tricks" og "Ofte stillede spørgsmål". Der er altså hverken
     et manglende eksempel eller et manglende emne at fylde; det, der mangler,
     er **placering** på et konkurrencepræget hovedord. `/procent` er den
     største CTR-kandidat på sitet og stadig urørt, så genmål 2026-10-10 før
     næste skridt. Se opgave 71.
  10. **Ny klasse fundet i C45: datoer, der *nævnes* i familien, men ikke har
     en side.** Autocomplete (DA+SE, 2026-09-26) er en billigere kilde end GSC
     til spørgsmålet "hvilke datoer spørger folk efter", fordi den kræver ingen
     impressions-data — den afslørede juleaften. De samme forslag rummer
     fortsat emner, der er **variable** (`sommerferie`, `efterårsferie`,
     `skoleåret`, `måneden`) og derfor bevidst ikke egner sig som statiske
     `/dage-til/*`-sider; de hører hjemme på `/nedtaelling`, som allerede
     løser dem. **Anbefaling:** kør samme autocomplete-audit på de øvrige
     trafikstærke sider (`/tidszone`, `/moms`, `/tidsberegner`, `/alder`) og se,
     om nogen *fast* dato, by eller relation mangler en side. Se opgave 72.
  11. **C45's autocomplete-audit er delvist kørt (samme time, kun fire sider).**
     Metoden virker, men den skal bruges som **kvalitativt signal** — den giver
     formuleringer, ikke volumen, så intet her må ændres uden GSC-tal. Fire fund,
     hver ét klassesvar:
     - **`/tidsberegner` — bekræftet vundet.** "beregn tid mellem klokkeslæt"
       erforslag 7 for "beregn tid", og det er præcis C40's nye H1 og
       eksempeltabel. Autocomplete er altså et tidligt signal endnu C40's
       GSC-rækker viste; det er værd at bruge som **bekræftelse** af en
       svar-først-ændring, ikke som erstatning for den.
     - **`/alder` — et reelt, ubearbejdet hul.** "beregn alder mellem to
       datoer" er forslag 3 for "beregn alder", og live har siden **0**
       forekomster af "mellem to datoer" (mod 19 for "fødselsdato", som den
       altså *er* bygget til). Spørgsmålet — "hvor gammel var jeg den 1. maj
       2010?" — mangler altså helt. **Ikke bygget i C45:** det er et nyt felt
       i værktøjet plus logik, og uden en GSC-række ville det være en
       ukontrolleret tilføjelse. Samlet med `/alder`'s 6.013 visninger / CTR
       0,6 % / pos. 7,8 er det den stærkeste åbne kandidat, men den kræver
       en række i GSC (side 16+ eller en særskilt måling) før den bygges.
       ~~**Lukket i C47 (2026-09-26).**~~ Betingelsen holdt: `/alder` står som
       **nr. 13 i den danske GSC-liste** (6.013 visninger, 35 klik, CTR 0,6 %,
       pos. 7,8) og **nr. 9 på svensk** (2.895, 8 klik, 0,3 %, pos. 7,7). Og
       C45's diagnose var delvis forkert: værktøjet havde **allerede** et
       "Beregn alder pr. dato"-felt — siden nævnte det bare aldrig. Så det
       var en ubeskrevet funktion, ikke et nyt felt. Se opgave 74.
       **Mål 2026-10-10.**
     - **`/moms` — autocomplete peger på et andet produkt.** Topforslagene er
       "moms indberetning", "moms frister 2026" og "moms indberetning 2026",
       altså Skat-afgiftsangivelse og frister, ikke beregning. Værktøjet er
       korrekt for GSCs "momsberegner" (1.693 visninger, pos. 7), men
       **søgeintentionen på selve ordet "moms" er en anden**. Det er et
       indholdsspørgsmål om Skats frister med officielle datoer — et selvstændigt
       emne, ikke en linje i en eksisterende side, og for stort til en
       side-iteration. Noteret, ikke bygget.
     - **`/tidszone` — efterspørgslen er bredere end artiklens 16 amerikanske
       byer.** "tidszone grønland", "grækenland", "portugal" og "kreta" ligger
       blandt forslagene til "tidszone", og C36's artikel dækker kun USA. Det er
       et databehov (byer med korrekt DST-regel), ikke en tekstændring, så det
       må ikke løses med et par flere rækker i tabellen. **Lukket i C46:** de
       fire lande ligger nu i `TIDSZONER` med IANA-offsets, i beregnerens
       zoneliste og i svar-først-brødteksten. Det afsluttede emnet; **åbent for
       den næste autocomplete-audit** er de **variable** datoer fra samme
       liste (`sommerferie`, `efterårsferie`, `skoleåret`), som hører hjemme på
       `/nedtaelling`. Se opgave 73.

### Prioriteret kø efter C47

1. ~~**Verificér de ni åbne deploynoter**~~ — **syv er lukket `DEPLOY OK`**
   (21:45, se konsolideret note). **Fire står åbne: C46, C43, C42 og C37**, alle
   med første kandidatvindue 2026-09-27 07:30 (C37: 12:30). FØR de verificeres:
   **skriv `beregner.no`-delen om**, fordi den URL ikke findes i dette repo — ellers
   er fire af fire noter grønne på en måling, der ikke måler noget.
2. **Mål 2026-10-10** (se Måleprotokol): C1-C16 og C35-C47 måles 14 dage efter
   deres snapshot, og resultatet skrives ved siden af hver opgave.
3. **C47's negative fund skal bruges som metode, ikke som emne.** Den viste,
   at "værktøjet kan det, siden siger det ikke" er en helt anden og billigere
   klasse end "byg et nyt felt". Samme spørgsmål bør stilles til de øvrige
   trafikstærke sider, før der bygges nyt: **find feltet i værktøjet, der
   siden ikke fortæller om.** Konkret åbne eksempler: `/dato` og `/tidszone`
   har flere tilstande end siden nævner; `/promille` (4.159 visninger) og
   `/braendstof` (16.580) har begge sammenligningstabeller, hvis hensigt
   brødteksten ikke siger. Det er en audit, ikke et byggearbejde, så det
   passer i en iteration.
   **Kørt på `/braendstof`, `/promille`, `/tidszone`, `/dato` og
   `/tidsberegner`** (se opgaver 75-79). `braendstof` er lukket med et
   negativt fund; `promille`, `tidszone` og `dato` gav hver en reel fejl;
   `tidsberegner` gav to (ubeskrevne datofelter og en "dage"-etiket på et
   døgnstal). **`/moms` er det eneste tilbage i denne klasse.** Den afviger
   fra de andre ved at **ikke have noget lib-modul**: hele momsregnestykket
   ligger inline i `MomsBeregner.tsx` (410 linjer), inklusive
   `ALLOWED_MOMS_RATES` og faktor-/andelsberegningen til copy'en. Før der
   bygges på den, skal den læses mod `src/lib/` for at se, om nogen anden
   side har en moms-faktor, den duplikerer.
   Det oprindelige fund står her:
   `maaKoere` i `src/lib/promille.ts:47` er hardkodet til den danske grænse
   0,5 ‰, og FAQ'en svarer på "Hvornår kan jeg køre bil igen?" med **5,9
   timer, som er tiden til 0 ‰** og ikke tiden til at komme under 0,5 ‰. Det
   er den næste opgave, og opskriften ligger klar i opgave 75. **Bemærk
   fælden der: brug ASCII i nye identifikere.**
4. **`/moms`-emnet fra C45 (Skats frister) ligger stadig åbent** og er for
   stort til en side-iteration. Det eneste, der kan gøres nu uden nye tal, er
   at finde ud af om **GSC har en række** for frister/indberetning — ellers
   skal det skrives som ❓, fordi det ellers er et emne bygget på autocomplete
   alene, hvilket C38-C41 tre gange har vist ikke er nok.
6. **Til Mads' fire beslutninger** under ❓ — de låser bl.a.
   `/api/v1/loen`'s kommuneskat, domænerne og `www`-redirects.

### ❓ Til Mads
- ❓ **Hvad skal der ske med `beregner.no`? (fund 2026-09-26 21:45, se
  konsolideret note).** Jeg har nu dokumenteret, at beregner.no er **live, men
  ikke ejes af dette repo**: sit eget URL-skema (`/kalkulator/<norsk-slug>`), sin
  egen 404-side, sin egen `vervekoder`-side — og ingen af dem findes i `src/app`.
  Det er et **ejer- og produktspørgsmål, ikke en fejl jeg kan retage**:
  1. **Skal `noPages` og `no`-grenen i `getRouteDecision` væk fra dette repo?** Det
     er 28 sider plus en hel middleware-gren, ingen host kan nå. At slette dem er
     en reel forenkling, men også en beslutning om at opgive den norske version her.
  2. **Eller skal beregner.no migreres ind på denne kodebase**, så den arver de
     100+ værktøjer, de danske og svenske domæner har? Så kræver det norske slugs
     (`/kalkulator/mva` → `/moms`, `/kalkulator/prosent` → `/procent`) med
     301-redirects, så intet i Norges eksisterende索引 går tabt — samme opgave som
     den svenske slug-plan allerede er stillet op i ❓.
  3. **Eller er de to sites helt separate, og beregner.no har sin egen backlog?** Så
     skal jeg stoppe med at skrive `beregner.no` i planen og i deploy-noterne, og
     det er en linje, jeg kan gøre med det samme.
  **Indtil du svarer** verificerer jeg kun mod `minberegner.dk` og `beraknare.se`
  og noterer, at NO-URL'en 404'er. Det er ærligt, men mindre end noterne lover.
  Bemærk desuden: **der er ingen beregner.no-trafik i nogen snapshot** — hverken
  Plausible eller GSC — hvilket er konsistent med et separat site.
- ⏳ **VERIFICÉR DEPLOY: C51 `/tidsberegner` — de to datofelter er
  forklaret, og "dage" var ikke dage — kode + plan i ét commit på branch
  `ceo/tidsberegner-flere-dage`.** Første kandidatvindue **2026-09-27 07:30**.
  Verificér **indhold**, HTTP 200 beviser intet:
  1. `https://minberegner.dk/tidsberegner` skal have H2 **"Beregner tid på tværs
     af datoer"** med en tabel, der indeholder rækkerne **16:00 → 09:00** med
     Dato **"25. sep. – 28. sep."** og svaret **"65 t 0 min"**, og H2-afsnittet
     skal sige **"17 t 0 min"** i kontrasten.
  2. Rækken **22:00 → 06:00** skal stadig stå med **"(dagen efter)"**, og
     rækken 16:00 → 09:00 må **ikke** have den annotation — den slutter tre
     dage senere.
  3. Under værktøjets datofelter skal stå **"Skal intervallet dække mere end
     ét døgn, indtast begge datoer…"**.
  4. "Detaljeret visning"'s sidste tile skal vise **"hele døgn"** (ikke
     "dage") med værdien **2,71** for 16:00 → 09:00 over de tre dage.
  5. `https://beraknare.se/tidsberegner` skal have H2 **"Beräkna tid över flera
     datum"**, svenske labels, **"65 h 0 min"** og **"17 h 0 min"** (ikke "t"),
     og må **ikke** have den danske svar-først-tabel. `/api/health` skal svare
     `status: ok`.
- ⏳ **VERIFICÉR DEPLOY: C50 `/dato` — standarddatoer i lokal tid, alderen fra
  `alder.ts`, ingen "NaN" på tomme felter — kode + plan i ét commit på branch
  `ceo/dato-alder-lokaldato`, kode `a42d87e`, merge `4ec1da3` 2026-09-26 23:04
  CEST.** Første kandidatvindue **2026-09-27 07:30**. Verificér **indhold**,
  HTTP 200 beviser intet:
  1. Hent `https://minberegner.dk/dato` **mellem 00:00 og 02:00 dansk tid**.
     "Fra dato"-feltet skal vise **dagens** dato, ikke dagen i går. Det er det
     eneste af fundene, der er synligt uden at røre ved værktøjet, og det er
     derfor testen er skrevet på kalenderfelterne i stedet.
  2. "Til dato" skal være **præcis én måned efter "Fra dato"** — aldrig 3. marts
     i januar. Tjek både ved hård reload og ved at trykke på Reset.
  3. `/dato`'s punkt 4 ("4. Alder") skal indeholde et link med `href="/alder"`.
  4. `/dato` må **ikke** vise "NaN" nogen steder. Det kræver et tomt felt, så
     det kan kun efterprøves interaktivt; verificér i stedet at kilderne er
     live ved at hente `/_next/static/chunks/`-builden efter `dato` og bekræfte
     at alder-tilstanden findes. **Hvis du vil have den fulde kontrol:** åbn
     `/dato`, vælg "Alder", sæt fødselsdato til **1. maj 2010**, og læs
     "Hvor gammel var jeg …"-svaret; det skal være præcis det samme som på
     `/alder` med samme dato.
  5. `https://beraknare.se/dato` skal have de svenske labels ("Antal dagar",
     "Veckor", "Helgdagar") uændret, og `/api/health` skal svare `status: ok`.
- ⏳ **VERIFICÉR DEPLOY: C49 `/tidszone` følger sommertiden — `fa51af7`, merge
  `20a69f1` 2026-09-26 22:47 CEST** på branch `ceo/tidszone-dato-tilstande`.
  Første kandidatvindue **2026-09-27 07:30**. Verificér **indhold**, HTTP 200
  beviser intet:
  - `https://minberegner.dk/tidszone` og `https://beraknare.se/tidszone` skal have
    en note under værktøjet, der **starter med "Beregneren følger sommertiden
    for dagens dato"** (SE: "Beräknaren följer sommartiden för dagens datum").
    Den gamle sætning "Denne beregner bruger standard tidsforskelle" må **ikke**
    stå noget sted.
  - Begge sider skal i "Tidsforskel fra Danmark"/"Tidsskillnad från Sverige" have
    **Tokyo med to tal** (efter 25/10-2026: `+7t (+8t om vinteren)` /
    `+7h (+8h på vintern)`) og **Sydney med to tal** (`+9t (+10t om vinteren)`
    i vinterperioden, `+8t (+10t ...)` i sommerperioden), mens **London,
    New York, Los Angeles, Berlin, Paris, Athen og Nuuk står med ét tal** — de
    følger Danmarks skift. Tallet afhænger af, hvilken dag siden serveres, så
    tjek at de to tal står samlet på **samme** række, ikke på hver sin.
  - Svar-først-kassen skal sige at tallene er **vinterværdier** ("Tallene ovenfor
    er vinterværdierne" / "Siffrorna ovan är vintervärdena").
  - Brødteksten under "Populære tidsforskelle" skal have **"Tokyo: 8 timer foran
    om vinteren, 7 timer mens Danmark har sommertid"** (SE: "8 timmar före på
    vintern, 7 timmar när Sverige har sommartid").
  - `https://minberegner.dk/tidszone` må **ikke** længere sige "til et præcist
    klokkeslæt for en vilkårlig by, tidspunkt og dato", fordi værktøjet ikke
    tager en dato ind.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C47 — `/alder` svarer på "alder mellem to datoer".**
  Kode `95c8712` + `f882eac`, merge `a0f99a9` + `4b0d039` 2026-09-26 21:11 og
  21:15 CEST på branch `ceo/alder-mellem-to-datoer`. Første kandidatvindue **2026-09-26 21:30**
  (merged før batchen). Verificér **indhold**: `https://minberegner.dk/alder`
  skal have H2 **"Svar på de oftest stillede aldersspørgsmål"** med en tabel
  på **fem** rækker, hvor række 1 er født 15. marts 1990 → 25. september 2026
  → **"36 år, 6 måneder og 10 dage"** → 13.342, og række 2 er samme fødselsdato
  → 1. maj 2010 → **"20 år, 1 måned og 16 dage"**; række 4 skal vise
  **"21 år, 11 måneder og 30 dage"** for 29. februar 2004 → 28. februar 2026,
  og **intet** sted må sige "1 måneder" eller "1 månader".
  FAQ'en skal have **"Kan jeg beregne alder mellem to datoer?"** og **"Hvor
  gammel var jeg den 1. maj 2010?"**. `https://beraknare.se/alder` skal have H2
  **"Svar på de vanligaste åldersfrågorna"** med de svenske svar (**"20 år, 1
  månader och 16 dagar"**) og de svenske spørgsmål, og **ikke** den danske
  H2. `https://beregner.no/alder` skal være uændret og **ikke** have nogen af
  H2'erne. Værktøjets "Beregn alder pr. dato"/"Beräkna ålder per datum" skal
  stadig virke. `/api/health` skal svare `status: ok`. Se VERIFICÉR
  DEPLOY-loggen.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C43 — artiklen og `/tidszone` kan ikke længere have
  samme headline.** Kode `3eb38de`, merge `4d358d9` 2026-09-26 19:50 CEST på
  branch `ceo/procent-konsistens`. Første kandidatvindue **2026-09-27 07:30**
  (merged efter 21:30). Verificér **indhold**:
  `https://minberegner.dk/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`
  skal have H1 og `<title>` **"Hvad er klokken i USA? Tidsforskel for 16 byer"**
  (med `| MinBeregner.dk`), **ikke** "…når den er 12 i Danmark?";
  `https://minberegner.dk/tidszone` skal være **uændret** med
  "Hvad er klokken i USA, når den er 12 i Danmark? | Tidszone"; artiklens FAQ
  skal ** stadig indeholde spørgsmålet "Hvad er klokken i USA, når den er 12 i
  Danmark?". `/api/health` skal svare `status: ok`. Se VERIFICÉR DEPLOY-loggen.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C42 — de relaterede links renderer det, de lover,
  og `/brok` har fået en indgang.** Kode `2bbc28f`, merge `fa002ce`
  2026-09-26 19:44 CEST, første kandidatvindue **2026-09-27 07:30**.
  Verificér **indhold**: `https://minberegner.dk/procent` skal have **seks**
  relaterede links hvoraf det **sidste er `/brok`**; `/dato` skal linke til
  `/ugenummer`; `/promille` skal linke til `/procent`; `/kvadratmeter` skal
  linke til `/flyttebudget`; `https://beraknare.se/procent` skal have **fem**
  links (lokalefiltreret) og ingen dansk-only `/rabat`. `/api/health` skal
  svare `status: ok`. Se VERIFICÉR DEPLOY-loggen.
- **Nye `relatedMap`-nøgler, der ingen side peger på (C42, 2026-09-26).**
  Efter at `/brok` fik sin indgang, er der **ni** beregnere, der er nøgle i
  `relatedMap` — altså de viser en "Relaterede beregnere"-blok — men ikke er
  mål i nogen andens liste: `/bolan`, `/fart`, `/loenstigning`, `/ohm`,
  `/planetvaegt`, `/aegloesning`, `/1rm`, `/elbil`, `/solceller`. De har
  **ingen dokumenteret trafik** i GSC- eller Plausible-snapshottet, så jeg kan
  ikke prioritere dem på data, og jeg ville ikke skrive en test, der bare
  siger "alle nøgler skal være mål" — den ville være ren vilje. **Spørgsmålet
  til dig:** skal de ni enten gives en reel indgang fra de trafikstørste
  forældre (`/procent`, `/dato`, `/kalorier`, `/renteberegner`), eller er de
  bevidst nicheværktøjer, der ikke skal konkurrere om interne links? Det er en
  redaktional beslutning, ikke en måling.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C41 — `/dato` linker til de syv dage-til-sider.**
  Kode `29b8b9a`, merge `f25bd93` 2026-09-26 19:20 CEST på branch
  `ceo/dato-dage-til-links`. Første kandidatvindue er **2026-09-26 21:30**
  (merged efter 17:30). Verificér **indhold**: `https://minberegner.dk/dato` skal
  have H2 **"Datoer folk oftest tæller ned til"** med **syv** links
  `/dage-til/*` i rækkefølgen `juledagen`, `nytaarsaften`, `nytaarsdag`,
  `1-december`, `paskedag`, `skaertorsdag`, `grundlovsdag` — den første er
  altså `/dage-til/juledagen`, **ikke** `/dage-til/1-december`, som denne note
  tidligere sagde (`getDageTilEvents` sorterer ikke) — og `/dage-til/1-december`
  skal være med med ankerteksten **"Hvor mange dage er der til 1. december?"**,
  plus et link til `/nedtaelling`. **C45 gør listen til otte** (juleaften
  indeni som nummer to) — se C45's egen note.
  Blokken skal stå **før** FAQ'en. `https://beraknare.se/dato` skal have H2
  **"Datum folk oftast räknar ner till"** med syv `/dagar-till/*`-links og den
  svenske ankertekst "Hur många dagar är det till 1 december?", og **ikke**
  nogen `/dage-til/`. `https://beregner.no/dato` skal være uændret og have
  **nogen** dage-til-links. `/api/health` skal svare `status: ok`.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C40 — DA `/tidsberegner` svar-først med eksempeltabel.**
  Kode `d5e0cb5`, merge `7c42f8e` 2026-09-26 18:59 CEST på branch
  `ceo/tidsberegner-svarforst`. Første kandidatvindue er **2026-09-26 21:30**
  (merged efter 17:30). Verificér **indhold**: `https://minberegner.dk/tidsberegner`
  skal have H1 **"Hvor lang tid er der mellem to klokkeslæt?"**, H2 **"Svar på
  de oftest søgte tidsrum"** med **fem** rækker, hvoraf række 1 er
  08:30 → 16:45 → **8 t 15 min** → **8.25 timer**, og række 5 er 22:00 → 06:00
  med **"(dagen efter)"** ved svaret, og H2 **"Hvordan beregner du tid mellem to
  klokkeslæt?"**. FAQ'en og JSON-LD skal begge have spørgsmålet **"Hvor lang tid
  er der mellem to klokkeslæt?"** og **"Hvad er 08:30 til 16:45 i timer og
  minutter?"**. `https://beraknare.se/tidsberegner` skal være **uændret** med
  sit eget C38-svar-først-sæt og **ikke** have den danske tabel eller H1.
  `https://beregner.no/tidsberegner` skal være uændret. `/api/health` skal
  svare `status: ok`.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C39 — SE `/procent` svarar på de tre svenske
  procent-frågorna, och 37 % skatt forsvann.** Kode `8796c16`, merge
  `927d213` 2026-09-26 18:27 CEST på branch `ceo/se-procent-sporsmal`.
  Første kandidatvindue er **2026-09-26 21:30** (merged efter 17:30). Verificér **indhold**: `https://beraknare.se/procent` skal ha
  H2 **"Hur räknar man ut procent i Excel?"**, tabellen med `=A1/B1*100`,
  `=A1*B1/100` och `=(B1-A1)/A1*100`, frågorna "Hur räknar man ut procent
  i Excel?" / "Hur räknar man ut hur stor del av en summa som är X?" / "Hur
  räknar man ut procent på lön?" i både synlig FAQ och JSON-LD, länk
  till `/lon-efter-skatt` och `/loenstigning`, och **inte** "37% skatt".
  `https://minberegner.dk/procent` ska væra **uändrat** med sit eget danske
  "37% skat af 40.000 kr"-eksempel, og `https://beregner.no/procent` skal være
  uändret. `/api/health` skal svare `status: ok`.
- ✅ **DEPLOY OK 2026-09-26 21:45, se konsolideret note.** C38 — de tre svenske sider svarer på spørgsmålsformen.**
  Se VERIFICÉR DEPLOY-loggen for merge-refer. Første kandidatvindue er
  **2026-09-26 21:30** (C38 merged efter 17:30). Verificér **indhold**:
  `https://beraknare.se/dato` skal have spørgsmålet "Hur många dagar är det
  mellan två datum?" og "Hur många dagar till 31 december?" i både den synlige
  FAQ og JSON-LD, `https://beraknare.se/tidsberegner` skal have "Hur räknar
  jag ut timmar och minuter mellan två klockslag?" med eksemplet
  "08:30 till 16:45 är 8 timmar och 15 minuter", og `https://beraknare.se/leasing`
  skal have "färetagsleasing" i FAQ'en og **ikke** "värktiga" eller "földer" nogen
  steder. `/api/health` skal svare `status: ok`. De danske og norske sider skal
  være uændrede.
- ⚠️ **ÅBEN, OG `beregner.no`-DELEN ER UBrugELIG — VERIFICÉR DEPLOY: C37 `/renteberegner` — fradragsværdien fra modulet.**
  Kode `b98b90f`, merge `32b74ee` 2026-09-26 17:47 CEST. 17:30- og 21:30-vinduerne
  er begge *før* merge, så første kandidatvindue er **2026-09-27 12:30** (07:30 er
  før merge-tidspunktet på dagen, hvis batcheren tager fat før den er færdig).
  Verificér **indhold**: `https://minberegner.dk/renteberegner` skal sige
  **33,6%** og **25,6%** som `<strong>`, **50.000 kr.** / **100.000 kr.** på
  dansk format, og "over grænsen er det ca. **3,7%**". `/api/health` skal svare
  `status: ok`. 17:30-batchen er allerede kørt, så intet er `DEPLOY-MISSING` og
  intet er frosset.
- **Sveriges kommunalskatt mangler en primærkilde (C39, 2026-09-26).** SE
  `/procent` skrev "37% skatt av 40 000 kr" — en dansk sats. Jeg ville erstatte
  den med den svenska, men skatteverket.se’s to sider gav begge 404 ved
  hentning (samme mønster som C27's solceller), så siden siger nu blot, at
  satsen afhænger af kommun og inkomstnivå, og linker til `/lon-efter-skatt`.
  **Findes primærkilden** (Skatteverkets side om kommunalskatt og det
  årlige bundsnit for 2026), er det **en** bullet + evt. en FAQ, fordi tallet
  så bruges på `/lon-efter-skatt` og i Lønekalkylatoren. Uden en kilde
  medstør jeg ikke et procentsal på en svensk side — det er præcist, hvad
  den her fejl var.
- **Hvorfor tæller `/elbil` ingen trafik? (C37, 2026-09-26).** Siden har 20 interne
  referencer på 10 filer — katalog, kategori, begge bilartikler, sammenlignings-
  tabellen i `/braendstof` og elpris-modulet — og er altså ikke ulinket. Alligevel
  står den hverken i DA- eller SE-top-15 i Plausible 2026-09-26 (28 dage), mens
  `/braendstof` har 271 besøgende og nævner elbil i sin sammenligning. Jeg kan
  ikke se forskellen uden en trafik- eller indexerings-måling, jeg ikke har adgang
  til. **Spørgsmålet til dig:** har du set en Search Console-række for `/elbil`
  nogensinde? Hvis siden aldrig har haft visninger, er spørgsmålet, om Google
  overhovedet har den i indexen; hvis den har haft, er spørgsmålet, hvorfor den
  ikke får klik. Jeg rørte ikke siden i C37, fordi det er et **måle**spørgsmål og
  ikke et kode-spørgsmål.
- **"1 tønde land = ca. 6.017 m²" mangler en kilde (C35, 2026-09-26).**
  Autocomplete viser "kvadratmeter til tønder land" og "kvadratmeter til hektar"
  som efterfulgte søgninger, så det er et emne folk faktisk spørger om — men
  lex.dk's artikel gav 404 i denne iteration, så talrækken i enhedstabellen er
  holdt til definitioner, jeg kan dokumentere (m², cm², ha, km²). Findes
  primærkilden (Den Store Danske eller Retsinformation), er det én række i
  artiklens tabel, og det samme gælder for `/kvadratmeter`s egen side.
- **Malingens dækning står som 8-12 m² pr. liter på siden, 10-12 i kilden
  (C35, 2026-09-26).** `/kvadratmeter` skriver "Ca. 8-12 m² pr. liter (tjek
  produktets egen rækkevidde)", mens hjemmeland.dk — som siden selv henviser til
  for spildreglen — siger 10-12 m². Sidens interval er altså bredere end den
  kilde, den står ved siden af, men det er ikke *forkert*: dækningen afhænger af
  produkt og underlag, og siden siger netop det. Jeg rettede det ikke, fordi det
  er en faglig vurdering af producenternes datablade og ikke en målefejl. Artiklen
  bruger 10-12 med kildeangivelse, så de to steder skal nok ensrettes en dag.
- **To proteinværktøjer, to svar (C29, 2026-09-26).** `/kalorier` regner nu
  protein fra målet (0,8-2,2 g/kg), mens `/proteinbehov` regner det fra
  aktivitetsniveau (0,8-2,0 g/kg, `src/lib/proteinbehov.ts`). Begge er forsvarelige,
  men en læser der spørger "hvor meget protein skal jeg have" kan få to forskellige
  tal for samme person. Skal de slås sammen, eller skal den ene side linke bevidst til
  den anden som "samme grund, andet spørgsmål"? Det er en faglig redaktionel
  beslutning, ikke en teknisk — derfor rørt den ikke i C29.
- **Solcellernes levetid mangler en primærkilde (C27, 2026-09-26).** Vi bruger
  25-30 år, som er det gængse branchestyret (paneler er typisk garanteret 25-30
  år), og beregningen bruger 25 som nedre ende. Jeg kunne ikke hente en
  myndigheds- eller standard-kilde: Energistyrelsen og AIDA's søgesider gav 404,
  retsinformation er JS-renderet, og Bing/DuckDuckGo bot-blokerer webfetch. Findes
  den primærkilde, skal den og kun den citeres i `src/lib/energi/solceller.ts` —
  intervallet er én konstant, så siden, FAQ'en og beregneren følger med. Samme
  mønster som kørselsfradraget (S1) og rentefradraget (R1).
- **Depositum på 3 måneder er praksis, ikke et fundet lovkrav (C27, 2026-09-26).**
  `/husleje` sagde 1-3 måneder, `/flyttebudget` 3-6, og begge værktøjer 3. Alt står
  nu på 3 måneder, formuleret som "typisk". Jeg har ikke fundet en lovtekst eller
  forbrugerombudsmandens vejledning, der siger, at 3 måneder er et loft for privat
  udlejning (almene boliger har en anden ordning). Skal en kilde ind, er det én
  sætning i to FAQ'er plus de to `tipDepositum`-strenge.
- **Beskæftigelsestillægget på 26.198 kr/md (C19, 2026-09-26) — må ikke gættes.**
  Beskæftigelsesministeriets "Satser for 2026" oplyser de seks dagpenge-satser og
  G-dag, men **ikke** beskæftigelsestillægget. Alligevel står 26.198 kr på
  `/dagpenge` (side, taltabel, punktliste og `page-data.ts`-beskrivelsen) og i
  `DagpengeBeregner`, hvor kilden er kommenteret "bm.dk/satser/satser-for-2026" —
  altså en kildeangivelse, der ikke dækker tallet. Beløbet er ikke ændret af C19,
  fordi jeg ikke kan dokumentere det: en primærkilde skal findes (STAR's
  "Satser for dagpenge" eller Folketingets opgørelse af dagpenge- og
  beskæftigelsestillægssatser), og så rettes **ét** tal i modulet, så siden og
  værktøjet følger med automatisk. Indtil da bør tallet ikke pryde af en
  kildeangivelse, det ikke kommer fra.
- **Skal `beregner.no` nogensinde live sættes? (D5, 2026-09-26).** Domænet er
  konfigureret i `src/lib/domain-config.ts`, men står i `hiddenDomains` og svarer
  404 på både `/` og `/api/health`, så det er ikke live. `helligdagLocale()` i
  `src/lib/helligdage.ts` mapper alt ikke-`se` til dansk, fordi der kun er to
  domæner i spil. Får `beregner.no` trafik, skal den have sit eget norsk
  helligdagssæt: skærtorsdag er ikke norsk helligdag, grundlovsdag (5. juni)
  findes ikke i Norge, 17. maj er helligdag, og påske mandag er helligdag. Jeg
  gætter ikke på det uden dig — sig til, hvis domænet skal live, så gør jeg det
  som en selvstændig, kildeført opgave med tests.

- **`www.minberegner.dk` og `www.beraknare.se` findes ikke (D3, 2026-09-26).** Begge
  svarer 404 direkte fra Cloudflare, så `www`-varianter af enhver URL er døde. Det er
  en fæld, hvis nogen deler et `www`-link, og det er gratis at lukke: en CNAME fra
  `www` til apex og en 301/308 i Traefik. Det kræver DNS- og domæneændringer, som er
  i projektets Danger Zones, så det gør jeg ikke uden et ja. Anbefaling: lav det.

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
- **Rentefradragets primære procenttabel (R1):** skat.dk dokumenterer *hvilke* renter der
  fradrages, men ikke værdien i procent. Vi bruger 33,6 % / 25,6 % på hver side af
  50.000/100.000 kr., fordi det er de officielle 2026-marginalsatser, og en
  dansk sekundærkilde (Borgerhåndbog) angiver "ca. 33,7 %" / "ca. 25 %" for samme
  struktur. Er den rigtige myndighedstabel fundet, skal den ind i `RENTEFRADRAG_2026` —
  det er én fil og de to beregnere følger med automatisk.
- **Kørselsfradragets 2026-sats og beløbsloft (S1) — må ikke gættes.** To kilder
  modsiger hinanden om kørselsfradraget for 2026: den fælles `SATSER_2026` siger
  3,17 kr./km (25-120 km) og 1,59 kr./km over 120 km med skat.dk som kilde, mens
  borgerhaandbog.dk siger 2,28/1,14 — de tal, komponenten havde hardkodet.
  skat.dk's fradragssider er JS-renderede og kan ikke hentes maskinelt, så
  primærkilden mangler. Findes den: ret **ét** tal i `SATSER_2026`, så følger
  `/skattefradrag` og `/befordringsfradrag` automatisk med. Det samme gælder
  håndværkerfradragets og servicefradragets beløbsloft (nu 12.400/6.200 kr. i
  `SKATTEFRADRAG_2026`), som ingen kilde dækker, og 26 %-fradragsværdien for
  boligjobordningen — de er derfor mærket vejledende i UI.
- ~~Indhold, der mangler internt link~~ **Løst 2026-09-25 som S1:** `SkattefradragBeregner`
  havde egne, modstridende kørselssatser og kommuneskat; den læser nu
  `SATSER_2026` + `SKATTEFRADRAG_2026` gennem det testede modul
  `src/lib/skattefradrag.ts`.
- Public `/api/v1/bmi` er bevidst uændret, fordi `/api/v1` er en frosset ekstern
  kontrakt. Den returnerer fortsat rå BMI med voksengrænser uden alder. En eventuel
  dokumentations- eller adfærdsændring kræver en eksplicit beslutning.
- **`/api/v1/loen`'s kommuneskat-default er forældet (C23, 2026-09-26).** API'en
  bruger `kommuneskatSnit: 25.07` og `kirkeskat 0.68`
  (`src/app/api/v1/loen/route.ts:6,21`, dokumentationen i `src/app/api/v1/route.ts:33-37`),
  mens den verificerede 2026-værdi er 25,049 % / 0,639 % i `SATSER_2026`. **C23 har
  rettet UI og copy, men ikke API'en**, fordi `/api/v1` er en frosset ekstern
  kontrakt i Danger Zones: en tredjepart, der har integreret standardværdien,
  ville få et andet nettolønstal uden varsel. Skal jeg rette den, så
  `/api/v1/loen` læser `SATSER_2026` (og dokumentationen følger med), eller
   behøver API'en at beholde de afrundede tal for bagward compatibility?
- **Én konkret dataanmodning låser sitets største vækstmulighed (C44,
  2026-09-26).** Jeg kan ikke diagnosticere `/procent` (149.318 visninger,
  **95 klik**, CTR 0,1 %, pos. 7,4) med de tal jeg får. Der er to helt
   forskellige sygdomme, som ser ens ud i de data jeg har:
   1. **Placering:** gennemsnitlig position 7,4 trækkes op af nogle få
      hovedord, mens resten af de 149.318 visninger er langhale, hvor siden
      ligger på 20-60. Så er svaret indhold/linkvægt, ikke titel.
   2. **Snit:** siden vises på position 5-8 og brugerne springer den over. Så
      er svaret titel/description — og det er den billigste rettelse, der
      findes, fordi trafikken allerede er der.
   De to kræver hver deres handling, og intet i `page-data.ts`, GSC's
   side-rækker eller Plausible kan skelne mellem dem. **Anmodning:** én
   Search Console-eksport, samme 28 dage som de andre snapshots
   (2026-08-27 – 2026-09-24), med **søgestreng-rækker** — ikke siderækker — for
   `/procent`, `/dato` og `/tidsberegner`. De tre dækker 352.092 visninger
   og 1.103 klik, altså 59 % af alle visninger på sitet. Gerne som CSV
   (`Search Console → Performance → Søgninger`, kolonnerne Søgning, Visninger,
   Klik, CTR, Position). **Hvad hver kolonne afgør:**
   - *Én søgning med >1.000 visninger på position 8-15* → åben sørgsmåls-side
     til den spørgsmålsform, bygget på samme svar-først-mønster som
     `dage-til` (C7) og artiklerne (C35/C36).
   - *Mange søgninger med position 20+* → åben **placering**; så er næste
     opgave interne links fra de trafikstærke forældre, ikke copy.
   - *Position 5-8 med >1.000 visninger på flere forskellige søgninger* →
   åben **snit**; så skriver jeg ny titel + description pr. side og måler
     14 dage.
   Uden disse rækker går næste iteration enten i stå eller på gæt, og det er
   præcis de to greb, mine seneste otte iterationer har haft brug for.


### Dokumenterede kandidatere efter top-5

- ~~`/alder`~~ og ~~`/brok`~~ er begge færdige som C6 den 2026-09-25.
- ~~`/pension`~~ er diagnosticeret og rettet som C8 den 2026-09-25, se opgave 19.
  Diagnosen viste, at søgeintentionen (hvornår/hvad) ikke var besvaret, at tre
  folkepensionstal var forkerte, og at beregneren brugte to opdigtede faktorer.
  MÅL: baseline 4.001 visninger, 45 klik, CTR 1,1 %, position 12,2 pr. 2026-09-23,
  Plausible 141 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
  **Åben del af C8 er lukket** som C11 den 2026-09-25, se opgave 22: værktøjet har nu
  samlivsstatus og indkomstfelter, så pensionstillægget regnes ned efter de samme
  indkomstgrænser, som siden dokumenterer. Folkepensionsalderen er tilsvarende lukket
  som **C31** den 2026-09-26, se opgave 58: værktøjet hardkodede "68 år" for alle,
  mens skalaen er 65-70 år efter fødselsår. Næste skridt på `/pension` er content, ikke
  flere felter.
- ~~`/dage-til/[dato]`~~ er færdig som C7 den 2026-09-25, se opgave 18.

- ~~`/kvadratmeter`~~ er svar-først siden 2026-09-25 (C9, opgave 20), og dens åbne
  del er lukket som K1 den 2026-09-25, se opgave 24: værktøjet prissætter nu
  materialer med spild, antal ens felter, enheder og pris, kildeført.
  MÅL: Search Console baseline 20.914 visninger, 290 klik, CTR 1,4 %, position 5,0
  pr. 2026-09-23; Plausible 376 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
- ~~`/braendstof`~~ er svar-først siden 2026-09-25 (C9, opgave 20).
  MÅL: Search Console baseline 16.371 visninger, 179 klik, CTR 1,1 %, position 6,1
  pr. 2026-09-23; Plausible 272 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
- ~~`/blog/boernepenge-2026-satser-og-regler`~~ er svar-først siden 2026-09-25
  (C10, opgave 21) med rensede 2026-satser. MÅL: Search Console baseline 5.145
  visninger, 27 klik, CTR 0,5 %, position 8,5 pr. 2026-09-23 — genmål 2026-10-09.
- ~~`/promille`~~ er svar-først siden 2026-09-26 (C15, opgave 39) på **begge**
  domæner med eksemplet 4 øl / 4 öl på 80 kg = 0,88 ‰ plus en FAQ om, hvornår man
  må køre igen. MÅL: Search Console baseline 4.159 visninger, 60 klik, CTR 1,4 %,
  position 7,9 pr. 2026-09-24 — genmål 2026-10-10.
- ~~`/vaegttab`~~ og ~~`/enhedspris`~~ er svar-først siden 2026-09-26 (C16,
  opgave 40) på henholdsvis DA/SE/NO og DA/SE. MÅL: Search Console baseline
  1.186 visninger/4 klik/CTR 0,3 %/pos 8,3 og 1.144/4/0,3 %/6,1 pr. 2026-09-24
  (beraknare.se) — genmål 2026-10-10. **Den dokumenterede CTR-klasse er nu tom på
  de data, der findes** — næste iteration skal enten skaffe nye GSC-søgninger
  (kun de 15 største sider er med i snapshottet) eller gå efter placering/indhold.
- **Næste CTR-kandidat:** `/pension` og `/procent` er allerede svar-først, og de fire
  øvrige top-CTR-sider er dækket. **Alle 15 DA-sider i GSC-top-15 er nu svar-først**
  (C1-C16 dækker `/procent`, `/dato`, `/tidsberegner`, `/tidszone`, `/moms`,
  `/kvadratmeter`, `/braendstof`, `/renteberegner`, `/kalorier`, `/boligstoette`,
  `/alder`, `/brok`, `/rentefradrag`, `/promille`; `/blog/boernepenge-2026-satser-og-regler`
  som C10). **Næste iteration skal derfor ikke optimere CTR på de samme sider igen** —
  den skal skaffe nye efterspørgselsdata (GSC-rækker for `/blog/*` og for de
  næste 15 sider) eller gå efter placering/indhold, som C19/C20 gjorde. Uden nye
  tal er enhver CTR-justering en ukontrolleret ændring.
- ~~**Nye, ubearbejdede kilder i C20 (2026-09-26):**~~ **Lukket som C21 den
  2026-09-26, se opgave 47.** Forældreindkomstgrænserne 419.589/710.077 kr.,
  søskendefrådraget 43.086 kr., forsørgertillægget ved delt bolig 2.966 kr. og
  udlandsstudielånet 129.106 kr. stod kun i artiklen; de står nu **også** på `/su`
  og i sidens FAQ/JSON-LD. `/su` fik derved sit eget svar på den søgning, dens
  egen intro lovede. Næste skridt på `/su` kræver GSC-data — siden har ingen række
  i top-15, så titel/description er bevidst urørt.
- ~~`/rentefradrag`~~ er lukket som R1 den 2026-09-25, se opgave 23: ét ratested med
  kilde, fire rettede modstridelser og ingen "afhænger af din kommune"-påstand. MÅL:
  Search Console baseline 4.492 visninger, 219 klik, CTR 4,9 %, position 6,7 pr.
  2026-09-23; Plausible 299 besøgende/28d pr. 2026-09-25 — genmål 2026-10-09.
  Næste skridt er **ikke** flere felter: `/renteberegner` linkede allerede til siden på
  begge domæner (linket er ikke locale-gated), så den interne forbindelse findes. Det
  åbne er indhold og den primære procenttabel (❓ Til Mads).
- ~~`/dato`~~ er lukket som D5 den 2026-09-26, se opgave 35: værktøjet tæller nu
  de offentlige helligdage (og nytårsaften) med, så et interval med en helligdag
  ikke længere giver et forkert arbejdsdagstal. Betingelsen "ingen ændring før et
  konkret søgeintentionsgap kan dokumenteres" blev opfyldt af et
  **korrektheds**-gap, ikke et CTR-gap: siden skrev selv, at helligdage ignoreres.
  MÅL: baseline 1.045 besøgende/28d pr. 2026-09-26; Search Console 129.188
  visninger, CTR 0,6 %, position 5,8 — genmål 2026-10-10.
- **Interne links fra `/dato` til de nye dage-til-sider er bevidst ikke lavet i
  C7.** De kan gives ved skolestart/jul, hvor spørgsmålet opstår, men bør først
  måles: hvis de nye sider tager trafik fra `/dato`, skal de linkes *fra* `/dato`.
- ~~Forsiden~~ er rettet som F1 den 2026-09-26: populærrækken følger nu de otte mest
  besøgte danske beregnere (ikke løn/låne-/valuta-/procentværktøjet), den svenske
  forside har fået de fire mest besøgte svenske værktøjer + /nedtaelling, og
  beregnerantallet er afledt (49/28/31) i stedet for det forældede 44. MÅL: `/` DA 219
  besøgende/28d, bounce 41 % pr. 2026-09-25 — genmål 2026-10-09. Næste skridt på
  forsiden kræver nye adfærdsdata; hvis bounce ikke falder, er rækken ikke problemet.

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
- ✅ **DEPLOY OK 2026-09-26 21:45 CEST — 21:30-batchen lukker C38, C39, C40,
  C41, C44, C45 og C47.** Syv noter verificeret ved **indholdskontrol**, ikke HTTP
  200. Målt 21:39-21:45 mod live-sitet. `/api/health` svarer `status: ok` på både
  `minberegner.dk` og `beraknare.se`.
  - **C47** (`/alder`): H2 "Svar på de oftest stillede aldersspørgsmål" live med
    **36 år, 6 måneder og 10 dage** (→ 13.343), **20 år, 1 måned og 16 dage** og
    **21 år, 11 måneder og 30 dage**; begge FAQ-spørgsmål live; `beraknare.se/alder`
    har "Svar på de vanligaste åldersfrågorna" + "20 år, 1 månad och 16 dagar" og
    **ingen** dansk H2; værktøjet "Beregn alder pr. dato" virker. Entals-rettelsen
    er altså live.
  - **C45** (`/dage-til/juleaften`): 200, H1 **og** `<title>` "Hvor mange dage er
    der til juleaften?", self-canonical, **89 dage** pr. 2026-09-26 (kontrolleret:
    4+31+30+24 = 89 ✓). `beraknare.se/dagar-till/julafton` har "Hur många dagar
    är det till julafton?" og ingen dansk tekst. Begge `sitemap.xml` har URL'en.
    `/dage-til/finvis-somhelst` er stadig 404. `/dato` har nu **otte** dage-til
    links i rækkefølgen `juledagen`, **`juleaften`**, `nytaarsaften`, `nytaarsdag`,
    `1-december`, `paskedag`, `skaertorsdag`, `grundlovsdag` — præcis som C45's
    note krævede, og dermed en rettelse af C41's note, som sagde `1-december`
    først.
  - **C44** (`/dage-til`-audit): `/dage-til/1-december` har titlen "Hvor mange
    dage er der til 1. december? 66 dage | MinBeregner.dk" (66 er korrekt pr.
    2026-09-26) og self-canonical. Kun en testfil ændrede sig, så intet på sitet
    skal se anderledes ud.
  - **C41** (`/dato`-links): H2 "Datoer folk oftest tæller ned til" live med de
    otte links **plus** `href="/nedtaelling"`. SE har "Datum folk oftast räknar ner
    till" + "Hur många dagar är det till 1 december?" og nul `/dage-til/`.
  - **C40** (DA `/tidsberegner`): H1 "Hvor lang tid er der mellem to klokkeslæt?",
    H2 "Svar på de oftest søgte tidsrum" med **alle fem** rækker som lovet:
    08:30→16:45 = **"8 t 15 min"** / **"8.25 timer"**, 08:00→16:00 = 8 t 0 min,
    09:00→17:00 m. 30 min pause = 7 t 30 min, 13:15→14:45 = 1 t 30 min, og
    22:00→06:00 = "8 t 0 min **(dagen efter)**". H2 "Hvordan beregner du tid
    mellem to klokkeslæt?" + FAQ "Hvad er 08:30 til 16:45 i timer og minutter?"
    live. `beraknare.se/tidsberegner` har **ikke** den danske tabel.
  - **C39** (SE `/procent`): H2 "Hur räknar man ut procent i Excel?" + alle tre
    formler (`=A1/B1*100`, `=A1*B1/100`, `=(B1-A1)/A1*100`) + "Hur räknar man ut
    procent på lön?", og **intet** "37% skatt". `minberegner.dk/procent` er
    uændret (har stadig sit eget 37 %-eksempel).
  - **C38** (SE spørgsmålsform): `beraknare.se/dato` har begge spørgsmål,
    `/tidsberegner` har "Hur räknar jag ut timmar och minuter mellan två
    klockslag?" med "08:30 till 16:45 är 8 timmar och 15 minuter", og `/leasing`
    har "färetagsleasing" og hverken "värktiga" eller "er till salu".
    `minberegner.dk/dato` er uændret.
- ✅ **DEPLOY OK 2026-09-26 21:45 CEST — og en protokolfejl fundet, der gør fire af
  de åbne noter ubrugelige. `beregner.no` er IKKE dette repo.**
  Under verificeringen af C47 holdt jeg fast ved noterne og prøvede
  `https://beregner.no/alder`. Den svarer **404** — ligesom *alle* ni prøvede
  sider, også `/bmi`, der er den **første** nøgle i `noPages`. Undersøgelsen
  lukkede en fejl, der har ligget i planen siden linje 2293:
  - `beregner.no` **er** live: `/` → 200 og `/sitemap.xml` → 200 med **115 URL'er**,
    hvoraf **alle 115 svarer 200**.
  - **Alle 115 ligger under `/kalkulator/*`** (106 stk) — `boliglan`,
    `drivstofforbruk`, `feriepenger`, `kvm-pris`, `mva`, `netto-lonn`, `prosent`,
    `sparekalkulator`, `tips`, `bmi` — plus `om`, `kontakt`, `personvern`,
    `vervekoder` og fire `kategori/*`. Forsiden linker til `href="/kalkulator/bmi"`,
    `href="/kalkulator/mva"` osv. De **danske** slugs (`/alder`, `/dato`,
    `/tidsberegner`) findes **ikke** — de 404'er alle.
  - **Dette repo har hverken en `kalkulator`-route eller en `vervekoder`-route**
    (`src/app` har 112 mapper, ingen hedder `kalkulator`), og den norske 404-side er
    en **helt egen side** ("Få gratis penger med vervekoder – opptil 800 kr i
    bonus"), ikke denne apps 404.
  - **Konklusion:** beregner.no er et **separat site i en separat kodebase**.
    `domain-config.ts`' `beregner.no`-post, `noPages`' 28 sider, `no`-grenen i
    `getRouteDecision` og NO-teksten i `calculator-list.ts` er for denne host
    **død kode**. Ingen ændring i dette repo når beregner.no.
  - **Følgen for verifikationen er konkret:** "«`beregner.no/alder` skal være
    uændret og ikke have nogen af H2'erne»" er sandt, fordi URL'en 404'er, ikke
    fordi siden er uændret. Samme konstruktion i C37, C42, C43 og C46. **De fire
    noter er derfor ikke beviser.** De er markeret ⚠️ ovenfor, og første
    prioritet i næste iteration er at skrive `beregner.no`-delen om, så noterne
    kun tester `minberegner.dk` og `beraknare.se`.
  - **Tre gamle plan-udsagn er dermed forældede:** linje 593 ("`beregner.no` må
    ikke få hreflang før domænet er live"), linje 2293 og linje 2766 (begge
    "`beregner.no` er **ikke live**"). De er ikke bare forældede, de er **modsagt**:
    beregner.no er live, og et andet repo ejer det. Derfor ❓, ikke kodeændring.
- ✅ **To falske alarmer fra min egen verifikation — skrevet ned som metode, så
  ingen senere iteration bruger tid på dem.** Begge kom fra `grep -qF` mod
  serverrenderet HTML, og begge var fejl i nålen, ikke fejl på sitet:
  1. **React indsætter `<!-- -->` mellem to tekstnoder.** "8.25 timer" ligger i
     HTML'en som `8.25<!-- --> timer`, så et fixed-string-søgning på
     "8.25 timer" fejler, selv om siden er helt korrekt. Det gælder enhver
     sætning bygget af flere JSX-strenge. **Brug et regex, der tillader
     `<!-- -->` mellem ordene, eller hent brødteksten og strip tags, før du
     sammenligner.**
  2. **Substring-fælden ved tal.** C47 krævede "intet sted må sige `1 måneder`".
     Siden har `**11** måneder og 30 dage`, som *indeholder* "1 måneder". Samme
     med svensk "1 månader" inde i "11 månader". Og `0 måneder og 0 dage` er
     **korrekt** — 0 tager pluralis på dansk og svensk. **Skriv tal-invarianter
     med en ordgrænse foran** (`(^|[^0-9])1 måneder`), eller test selve
     formatterings-funktionen på værdien 1, som C47's kode allerede gør.
  Resultatet er heldigvis det samme: **C47 er live og korrekt** — værdien 1 står
  som "1 måned" i ental 10 gange på siden, og der er ingen fejlinstans.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C47 — `/alder` svarer på "alder mellem to
  datoer".** Kode `95c8712` + `f882eac`, merge `a0f99a9` + `4b0d039` 2026-09-26
  21:11 og 21:15 CEST på branch `ceo/alder-mellem-to-datoer`. Første
  kandidatvindue er **2026-09-26 21:30**
  (merged før den). Nul deploy-vinduer er gået siden merge, altså slet ikke
  `DEPLOY-MISSING` (kræver to). Verificér **indhold**:
  `https://minberegner.dk/alder` skal have H2 **"Svar på de oftest stillede
  aldersspørgsmål"** med **fem** rækker, hvor række 1 er født 15. marts 1990 →
  25. september 2026 → **"36 år, 6 måneder og 10 dage"** → 13.342, række 2 er
  samme fødselsdato → 1. maj 2010 → **"20 år, 1 måned og 16 dage"**, og
  række 4 er 29. februar 2004 → 28. februar 2026 → **"21 år, 11 måneder og 30
  dage"**; FAQ'en skal have **"Kan jeg beregne alder mellem to datoer?"** og
  **"Hvor gammel var jeg den 1. maj 2010?"**;
  `https://beraknare.se/alder` skal have H2 **"Svar på de vanligaste
  åldersfrågorna"** med **"20 år, 1 månad och 16 dagar"** og de svenske
  spørgsmål, og **ikke** den danske H2; `https://beregner.no/alder` skal være
  uændret og **ikke** have nogen af H2'erne; `/api/health` skal svare
  `status: ok`. Se opgave 74.
- ⚠️ **ÅBEN, OG `beregner.no`-DELEN ER UBrugELIG — VERIFICÉR DEPLOY: C46 — `/tidszone` har Grønland, Grækenland,
  Portugal, Island og Kreta i tabellen.** Kode `240c2c5`, merge `54c8c86`
  2026-09-26 20:52 CEST på branch `ceo/tidszone-nordatlanten`. Første
  kandidatvindue er **2026-09-27 07:30** (merged efter 21:30). Nul
  deploy-vinduer er gået siden merge, altså slet ikke `DEPLOY-MISSING` (kræver
  to). Verificér **indhold**:
  `https://minberegner.dk/tidszone` skal have **16** rækker i tabellen (11 før +
  5 nye) med **Nuuk 08:00/08:00, Lissabon 11:00/11:00, Reykjavik 11:00/10:00,
  Athen 13:00/13:00 og Heraklion (Kreta) 13:00/13:00**, og svar-først-brødteksten
  skal sige "13 i Athen" og "08 i Nuuk";
  `https://beraknare.se/tidszone` skal have **"13 i Aten"** i brødteksten og
  rækken **"Aten"** i tabellen (**ikke** "Athen") — sidste kontrol mod
  locale-lækken; `/api/health` skal svare `status: ok`. Se opgave 73.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C45 — `dage-til`-familien har nu juleaften og
  julafton.** Kode `a79b6d5`, merge `71d4a6c` 2026-09-26 20:32 CEST på branch
  `ceo/juleaften`. Første kandidatvindue er **2026-09-26 21:30** (merged før
  den). Nul deploy-vinduer er gået siden merge, altså slet ikke
  `DEPLOY-MISSING` (kræver to). Verificér **indhold**:
  `https://minberegner.dk/dage-til/juleaften` (200) skal have H1
  **"Hvor mange dage er der til juleaften?"**, `<title>` med samme spørgsmål,
  self-canonical på `/dage-til/juleaften` og **90 dage** pr. 2026-09-26 (den
  ændres dagligt, så tjek at tallet svarer til dagens dato minus 24. december);
  `https://beraknare.se/dagar-till/julafton` (200) skal have **"Hur många dagar
  är det till julafton?"** og **ikke** dansk tekst; `https://minberegner.dk/dato`
  skal have H2 "Datoer folk oftest tæller ned til" med **otte** links, hvor
  den **første** er `/dage-til/juledagen` og den **anden** `/dage-til/juleaften`
  (**ikke** `/dage-til/1-december` først — noteret tidligere i planen var forkert,
  `getDageTilEvents` sorterer ikke); begge `sitemap.xml` skal indeholde de nye
  URL'er; `https://minberegner.dk/dage-til/finvis-somhelst` skal stadig være
  **404**; `/api/health` skal svare `status: ok`. Se opgave 72.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C44 — `dage-til`-fladen er auditet og
  permanent vagtet.** Kode `d2ec667` + `aa6698c`, merge `016f2e7` 2026-09-26
  20:13 CEST på branch `ceo/dage-til-og-c44`. Første kandidatvindue er
  **2026-09-26 21:30** (merged før den). Nul deploy-vinduer er gået siden merge,
  altså slet ikke `DEPLOY-MISSING` (kræver to). **Bemærk: den eneste kodeændring
  er en testfil, så intet på sitet skal se anderledes ud.** Verificér alligevel
  `https://minberegner.dk/dage-til/1-december` (200, self-canonical, titlen
  "Hvor mange dage er der til 1. december? … dage | MinBeregner.dk"),
  `https://minberegner.dk/dage-til/finvis-somhelst` (404) og at
  `/api/health` svarer `status: ok`. Se opgave 71.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C43 — artiklen og `/tidszone` kan ikke længere
  have samme headline.** Kode `3eb38de`, merge `4d358d9` 2026-09-26 19:50
  CEST på branch `ceo/procent-konsistens`. Første kandidatvindue er
  **2026-09-27 07:30** (merged efter 21:30-vinduet er kørt). Nul
  deploy-vinduer er gået siden merge, altså slet ikke `DEPLOY-MISSING`
  (kræver to). Verificér **indhold**:
  `https://minberegner.dk/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`
  skal have H1 **og** `<title>` **"Hvad er klokken i USA? Tidsforskel for 16
  byer | MinBeregner.dk"** og **ikke** "…når den er 12 i Danmark?";
  `https://minberegner.dk/tidszone` skal være **uændret** med
  "Hvad er klokken i USA, når den er 12 i Danmark? | Tidszone"; artiklens FAQ
  skal ** stadig** have spørgsmålet "Hvad er klokken i USA, når den er 12 i
  Danmark?" (med `06 i New York, 05 i Chicago, 04 i Denver og 03 i Los
  Angeles`). `/api/health` skal svare `status: ok`. Se opgave 70.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C42 — de relaterede links renderer det, de
  lover, og `/brok` har fået en indgang.** Kode `2bbc28f`, merge `fa002ce`
  2026-09-26 19:44 CEST på branch `ceo/relaterede-links-og-brok`. Første
  kandidatvindue er **2026-09-27 07:30** (merged efter 21:30-vinduet er
  kørt). Nul deploy-vinduer er gået siden merge, altså slet ikke
  `DEPLOY-MISSING` (kræver to). Verificér **indhold**:
  `https://minberegner.dk/procent` skal have **seks** links i
  "Relaterede beregnere" hvoraf det **sidste** er `/brok`;
  `https://minberegner.dk/dato` skal linke til `/ugenummer` (og stadig have
  C41's dage-til-blok); `https://minberegner.dk/promille` skal linke til
  `/procent`; `https://minberegner.dk/kvadratmeter` skal linke til
  `/flyttebudget`; `https://beraknare.se/procent` skal have **fem** links
  (lokalefiltreret, `/rabat` er dansk-only) og **ikke** `/bolan` på nogen
  side. `/api/health` skal svare `status: ok`.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C41 — `/dato` linker til de syv
  dage-til-sider.** Se ❓ Til Mads for den fulde indholdsliste — note at
  rækkefølgen er `juledagen` først (denne log sagde tidligere fejlagtigt
  `1-december` først), og at C45 gør listen til **otte**. Kode
  `29b8b9a`, merge `f25bd93` 2026-09-26 19:20 CEST, så første
  kandidatvindue er **2026-09-26 21:30**. Nul deploy-vinduer er gået siden
  merge, altså slet ikke `DEPLOY-MISSING` (kræver to).
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C40 — DA `/tidsberegner` svar-først med
  eksempeltabel.** Se ❓ Til Mads for den fulde indholdsliste. Kode `d5e0cb5`,
  merged 2026-09-26 efter 17:30, så første kandidatvindue er **2026-09-26
  21:30**. Kun ét deploy-vindue er gået siden merge, altså endnu ikke
  `DEPLOY-MISSING` (kræver to).
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C39 — SE `/procent` svarar på de
  tre svenske procent-frågorna, och 37 % skatt forsvann.** Kode `8796c16`,
  merge `927d213` 2026-09-26 18:27 CEST. Første kandidatvindue 2026-09-26
  21:30. Verificér indhold på `beraknare.se/procent` (Excel-H2, tre formler,
  tre FAQ-spørgsmål i FAQ **og** JSON-LD, links til /lon-efter-skatt og
  /loenstigning, ingen "37% skatt"), og at `minberegner.dk/procent` +
  `beregner.no/procent` er uændrede.
- ✅ **LUKKET 2026-09-26 21:45 — `DEPLOY OK`, se konsolideret note.** C38 — de tre svenske sider svarer på
  spørgsmålsformen.** Kode `9f37a35`, merge `ce970b0` 2026-09-26 18:11 CEST på
  `master` (branch `ceo/se-svar-paa-spoergsmaal`). Første kandidatvindue er
  **2026-09-26 21:30** — 17:30-vinduet er før merge. Verificér **indhold**, ikke HTTP 200:
  - `beraknare.se/dato`: FAQ har "Hur många dagar är det mellan två datum?" og
    "Hur många dagar till 31 december?" i både synlig tekst og FAQPage-JSON-LD.
  - `beraknare.se/tidsberegner`: FAQ har "Hur räknar jag ut timmar och minuter
    mellan två klockslag?" med "08:30 till 16:45 är 8 timmar och 15 minuter".
  - `beraknare.se/leasing`: FAQ har "färetagsleasing" og 4.121 kr, og siden
    hverken siger "värktiga", "földer" eller "er till salu".
  - `minberegner.dk/dato`, `/tidsberegner`, `/leasing` skal være **uændrede** —
    ændringen er kun i `sePages`.
  - `/api/health` skal svare `status: ok`.
- ✅ **DEPLOY OK 2026-09-26 17:41 CEST — 17:30-batchen lukker C23-C36.**Fjorten noter
  verificeret ved **indholdskontrol på begge domæner**, ikke HTTP 200. Målt
  2026-09-26 17:41–17:47 mod live-sitet:
  - **C36** (`/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark`): H1 "Hvad er
    klokken i USA, når den er 12 i Danmark?" er live, `06:00` står 10 gange i
    tabellen, `/tidszone` har "Guides om emnet" med artiklen (2 forekomster),
    `beraknare.se/tidszone` har **0** dansk blok, og URL'en står i sitemap.xml.
  - **C35** (`/blog/kvadratmeter-saadan-regner-du-ud`): H1 "Hvordan regner man
    kvadratmeter ud? Guide med eksempler" er live, `/kvadratmeter` linker til
    artiklen, `beraknare.se/kvadratmeter` har **0** dansk blok, sitemap OK.
  - **C34** (returlinke): DA `/moms`, `/braendstof`, `/renteberegner`, `/alder` og
    `/rentefradrag` har alle "Guides om emnet" med deres artikler;
    `beraknare.se/moms` har **0** (den vigtigste af fire, fordi en læk dér skader
    svensk SEO).
  - **C33** (`/husleje`): `7.500` (6 forekomster), `8.250` (3) og feltet
    "El, vand og varme" (2) er alle live.
  - **C32** (`/elbil`): DA har `0,45`, `0,84`, `46,7` (4 hver) og `4,7 kr` (3);
    SE har `0,36`, `1,19`, `69,7`, `6,6` (3 hver).
    **Tre falske alarmer i denne måling — læs dem, før du genkører grep:**
    1. "under halvdelen" findes stadig 4 gange på DA `/elbil`, men kun som
       **negationen** "Det er **ikke** under halvdelen" — det er C32's egen
       rettelse, der er live. SE har 0 forekomster.
    2. `/efterloen` har `962` 3 gange, men kun som del af årstallene "1959-1962"
       og "31. december 1962" — ikke "962 timer". `481` (3), `15.870` (3) og
       rækken "1. januar 1963" (2) er live.
    3. C24's note sagde, at SE `/leasing`'s `<title>` skulle være "Leasingkalkylator:
       bil på 300.000 kr = 4.121 kr/mån". Det er **H1'en** i `page-data.ts:3440`;
       `<title>` er `metaTitle` = "Leasingkrystallator: 4.121 kr/mån | Beräknare.se"
       og er live. Noten var forkert, ikke deployet.
  - **C31** (`/pension`): "folkepensionsalder er ca. 70 år" er live (1), den gamle
    "Folkepensionsalder er 68 år" er **væk** (0).
  - **C30** (`/braendstof`): DA og SE har begge `52,8` (3) og `40,2` (3), og den
    gamle "50-70" er **væk** på begge (0).
  - **C29**: `/kalorier` har `0,8-1,2` (4) og `1,6-2,2` (4); `/flyttebudget` siger
    `3 måneder` (2) og den gamle "3-6 måneder" er **væk** (0).
  - **C23** (`/loen-efter-skat`): `25,049` (3) og `0,639` (2) er live, og den gamle
    "15% topskat" er **væk** (0). Bemærk at siden skriver "mellemskat 7,5% og
    topskat 7,5%" **uden mellemrum** — et grep på "7,5 %" giver 0 og er ikke et
    deploy-miss. `/api/v1/loen` svarer stadig `25.07`, så den frosne kontrakt er
    urørt. **`/brutto-netto` og `/topskat` er ikke verificeret i denne måling** —
    kun `/loen-efter-skat` blev kørt. Det er den eneste åbne rest.
  - **C25** (`beraknare.se/tidszone`): `Stockholm` (1), `Köpenhamn` **væk** (0).
  - **C27** (`/solceller`): "25-30 år" (3), den gamle "yderligere 15-20 år" **væk**
    (0); `/husleje` har den gamle "1-3 måneder" **væk** (0).
  - `/api/health` svarede `{"status":"ok"}` ved målingens start.
- ✅ **DEPLOY OK 2026-09-26 20:27 CEST — C23's sidste to sider er verificeret,
  så C23 er helt lukket.** 17:30-batchen verificerede `/loen-efter-skat` men
  sprang de to øvrige sider over. Målt ved indholdskontrol, ikke HTTP 200:
  `https://minberegner.dk/brutto-netto` har **3** forekomster af `25,049` plus
  ét `25.049` i `<title>`-linjen, og `https://minberegner.dk/topskat` har
  **`0.639`** i kirkeskatfeltet (og 2 × `25.049` i samme side). `/api/health`
  svarede `{"status":"ok"}` 200.
- ✅ **DEPLOY OK 2026-09-26 12:33 CEST — 12:30-batchen lukker C15-C22.** Syv noter
  verificeret ved **indholdskontrol på begge domæner**, ikke HTTP 200:
  - `/promille` (C15): `0,88` er live (2 forekomster).
  - `/vaegttab` (C16): `2.209` er live (2 forekomster).
  - `/blog/pension-hvor-meget-skal-du-spare-op` (C18): `63.000` er **væk** (0
    forekomster) — loftet er rettet. Den 12:34-måling i den gamle åbne note,
    som sagde at siden havde både 63.000 og 68.700, var en **falsificeret
    måling på det gamle indhold**: 68.700 var dengang den gamle tekst, ikke et
    andet legitimt tal. Ikke et problem med C18.
  - `/blog/dagpenge-saadan-finder-du-din-sats` (C19): `22.041` er live (2
    forekomster) og det gamle `20.359` er **væk** (0).
  - `/blog/su-2026-satser-og-regler` (C20): "Kort svar:" er live.
  - `/su` (C21): `419.589` er live (2 forekomster).
  - **C22 (SE):** på `beraknare.se/dato` er der **0** anchors med
    `href="/kategori..."` (før: 2), og JSON-LD's `BreadcrumbList` har nu
    `{"position":2,"name":"Vardag"}` **uden `item`** — 404-URL'en er væk fra de
    strukturerede data. `/dagar-till/1-december` siger "inte en **svensk**
    helgdag" (3 forekomster; før "dansk"). Der er **én** tilbageværende
    forekomst af `/kategori/hverdag` i HTML'en, men den ligger i React
    Flight-payloaden som `key`-prop på `<li>` — ikke et link, ikke JSON-LD,
    usynlig for bruger og crawler. Den præcise, målbare accept er derfor
    **0 links og 0 schema-URL'er**, ikke "0 strenge i kildekoden". C22's egen
    MÅL-linje er korrigeret efter denne kontrol.
  - `/api/health` svarer `status: ok`.
  Alle noter fra C15-C22 er dermed lukket. Ingen `DEPLOY-MISSING`.
- ⏱ **LUKKET 2026-09-26 12:33** (se DEPLOY OK 2026-09-26 12:33) — var: C15
  `/promille` svar-først, C16 `/vaegttab` + `/enhedspris`, C18 pensionsloftet,
  C19 dagpenge 22.041 kr., C20 SU-guiden svar-først, C21 `/su`'s forældreindkomst
  og C22's svenska brødkrumme.
- **DEPLOY OK 2026-09-26 07:55 CEST — 07:30-batchen lukker alle 21 åbne noter.**
  Sidste succesfulde batch før denne var 17:30-vinduet 2026-09-25; 21:30-vinduet
  2026-09-25 indeholdt ingen af dagens merges. Kontrollen er **indholdskontrol på
  begge domæner**, ikke HTTP-status alene:
  - **Titler (alle med ét eller nul domænesuffiks):** `/tidszone` "Hvad er klokken i
    USA, når den er 12 i Danmark? | Tidszone" (C4), `/renteberegner` "Renteberegner:
    100.000 kr. i 5 år = 1.887 kr./md." (C5), `/kalorier` "Hvor mange kalorier om
    dagen? | Kalorieberegner" (C5), `/alder` "Aldersberegner: hvor gammel er du i
    år, måneder og dage?" (C6), `/brok` "Brøkberegner: forkort 6/8 til 3/4 = 0,75 =
    75 %" (C6), `/dage-til/juledagen` "Hvor mange dage er der til juledagen? 90
    dage" (C7), `/braendstof` "Brændstofberegner: 500 km benzin koster 450 kr." (C9),
    `/kvadratmeter` "Kvadratmeterberegner: 5 x 4 m = 20 m²" (C9),
    `/nedtaelling` "Nedtælling - hvor mange dage til en dato?" (C12),
    `/kategori/bolig` "Boligberegnere — Boliglån, Husleje & Ejendomsskat |
    MinBeregner.dk" (C13), `/privatlivspolitik` og `/cookiepolitik` med ét suffiks
    (C13), `/blog/barsel-2026-regler-og-satser` "Barsel 2026: Sats, orlov og
    overdragelse | MinBeregner.dk" (D1), `/blog/skat-2026-alt-du-skal-vide` "Skat
    2026: personfradrag 54.100 kr, bundskat 12,01 % | MinBeregner.dk" (S2),
    `/blog/boernepenge-2026-satser-og-regler` "Børnepenge 2026: 5.370 kr./kvartal
    (0-2 år) | MinBeregner.dk" (C10/D2), `/pension` "Pensionsberegner 2026:
    folkepension 16.273 kr/md" (C8/C11). SE: "Beräkna antal dagar mellan två
    datum", "Vad är klockan i USA när det är 12 i Sverige?", "Bränslekalkylator:
    500 km bensin kostar 450 kr", "Kvadratmeterkalkylator: 5 x 4 m = 20 m²",
    "Ålderskalkylator: hur gammal är du i år, månader och dagar?".
  - **Indhold:** `/renteberegner` 13.227 kr., `/kalorier` 2.759 kcal, `/pension`
    "Hvor kommer pensionen fra" + 8.729 + 16.273 kr., `/braendstof` 450 kr.,
    `/kvadratmeter` "Beregn materialer", `/nedtaelling` `href="/dage-til/juledagen"`,
    `/dato` både "helligdage" og "ca. måneder" (D5), børnepenge-artiklen 4.248 og
    1.741 kr. (C10/D2), skat-artiklen 25,049 % og 12.400 kr. (S2),
    fradrag-guiden 3,17 kr. (S3), `/rentefradrag` 33,6 % (R1), `/skattefradrag`
    3,17 (S1), forsiden 49 (F1), timeløn-artiklen `href="/bil"` og
    månedsbudget-artiklen `href="/husleje"` (L1).
  - **sitemap.xml:** DA 126 `<loc>` / **8** `<lastmod>`, SE 64 `<loc>` / **8**
    `<lastmod>` (C14). `/dage-til/juledagen` er 200 på DA, og på beraknare.se er den
    ét 301-hop til `/dagar-till/juldagen` (C7). SE `/nedtaelling` har
    `href="/dagar-till/juldagen"` (C12).
  - `/api/health` svarede `status: ok` under alle kontroller. **Ingen åbne deploynote
    står tilbage.**
- **Kontrol 2026-09-25 22:20 CEST (ingen note lukket endnu):** 21:30-batchen er ikke
  synlig. Live `/tidszone` (C4), `/alder` (C6), `/pension` (C8), `/braendstof` + 
  `/kvadratmeter` (C9) har stadig de gamle titler, og `/dage-til/juledagen` (C7) svarer
  **404**. Det er ét deploy-vindue siden C4's merge 18:40, altså endnu ikke
  `DEPLOY-MISSING` (kræver to), men alle noter C4-C11 + R1 kan først verificeres
  realistisk efter 07:30-vinduet 2026-09-26. `/api/health` svarede `status: ok`.
- **Kontrol 2026-09-25 22:50 CEST (S1):** 21:30-batchen er stadig ikke synlig, så
  den indeholdt ikke dagens merges. Live `/alder` har titlen "Aldersberegner - Beregn
  din præcise alder" (ikke C6's svar-først-titel), `/pension` viser stadig "De tre
  pensionssøjler" (ikke C8/C11's rettelse), `/braendstof` og `/kvadratmeter` har de
  gamle titler, og børnepenge-artiklen har stadig **dobbelt** domænesuffiks. Alle fem
  svar 200, `/api/health` svarede `status: ok`. Det er **ét** deploy-vindue siden
  C4's merge 18:40, altså endnu ikke `DEPLOY-MISSING` (kræver to). Næste
  iteration skal genkontrollere efter 07:30-vinduet 2026-09-26; er indholdet stadig
  gammelt derefter, skrives `DEPLOY-MISSING` og der merges ikke til `master` før et
  menneske har kigget. HTTP 200 er ikke bevis — hele listen er kontrolleret på
  indhold.
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
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C4 svar-først `/tidszone`-tabel, spørgsmålstitel og
  description `c78a7a6` 2026-09-25 18:40 CEST. Verificér efter næste batch-vindue
  med live DA `/tidszone` (synligt svar + tabel) og SE `beraknare.se/tidszone`;
  HTTP 200 alene utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet
  2026-09-26**, fordi merge skete efter 17:30-vinduet 2026-09-25.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C5 svar-først `/renteberegner` og `/kalorier` `200ce4c`
  2026-09-25 19:05 CEST. Verificér efter næste batch-vindue på live DA: title
  "Renteberegner: 100.000 kr. i 5 år = 1.887 kr./md." med synligt
  "Samlet rente: 13.227 kr." + link til `/rentefradrag`, og title
  "Hvor mange kalorier om dagen? | Kalorieberegner" med synligt
  "TDEE 2.759 kcal ved moderat aktivitet". HTTP 200 alene utilstrækkeligt.
  **Kan først verificeres fra 07:30-vinduet 2026-09-26.**
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C7 dage-til-sider `8950593` 2026-09-25 19:50 CEST.
  Verificér efter næste batch-vindue: live DA `/dage-til/juledagen` (og de 6
  øvrige DA-slugs) samt SE `beraknare.se/dagar-till/juldagen` (og de øvrige
  SE-slugs) skal servere det korrekte antal dage i title og synligt i H1, og
  `/dage-til/juledagen` på beraknare.se skal være ét 301-hop til
  `/dagar-till/juldagen`. Tjek desuden at sitemap på begge domæner indeholder
  de 7 sider. HTTP 200 alene utilstrækkeligt — tallet skal være dagens.
  **Kan først verificeres fra 07:30-vinduet 2026-09-26.**
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C6 svar-først `/alder` og `/brok` `aa2c32c` 2026-09-25
  19:20 CEST. Verificér efter næste batch-vindue på live DA `/alder` (title
  "Aldersberegner: hvor gammel er du i år, måneder og dage?" og synligt
  "36 år, 6 måneder og 10 dage pr. 25. september 2026" samt at den gamle
  "35 år, 10 måneder og 28 dage" er væk) og live DA/SE `/brok` (title med
  "forkort 6/8 til 3/4 = 0,75 = 75 %" og samme svar synligt). HTTP 200 alene
  utilstrækkeligt. Bemærk: tallene i `/alder`-teksten er dateret, så et senere
  build-tidspunkt giver en ny dato og nye tal; kontrollér at tekst og tal stadig
  hænger sammen.

- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C8 folkepension-rettelse `42a576e` 2026-09-25 20:26 CEST.
  Verificér efter 07:30-vinduet 2026-09-26: `/pension` skal servere
  folkepensionsalder-tabellen med 65/65½/66/66½/67/68/69/70, pensionstillæg
  8.729/4.467 kr. og overskriften "Hvor kommer pensionen fra" i beregneren
  (ikke "De tre pensionssøjler"). HTTP 200 er ikke nok — tjek indholdet.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C9 svar-først   `/braendstof` og `/kvadratmeter` `d9aa21c`
  2026-09-25 20:35 CEST. Verificér efter 07:30-vinduet 2026-09-26: live DA
  `/braendstof` skal have title "Brændstofberegner: 500 km benzin koster 450 kr." og
  det samlede svar synligt i introafsnittet; live DA `/kvadratmeter` skal have title
  "Kvadratmeterberegner: 5 x 4 m = 20 m²" og "Et rum på 5 x 4 m er 20 m²" synligt.
  Tjek også `beraknare.se/braendstof` og `beraknare.se/kvadratmeter` for de svenske
  titler. HTTP 200 alene utilstrækkeligt.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C10 børnepenge-satser (4.248/3.342/1.114), svar-først-titel og
  kildeført 2026-ændringsafsnit på `/blog/boernepenge-2026-satser-og-regler`, samme
  satskilde i `/boernepenge` og `page-data.ts` `259da41` 2026-09-25 20:47 CEST.
  Ved live-kontrol: titlen skal være "Børnepenge 2026: 5.370 kr./kvartal (0-2 år) |
  MinBeregner.dk" (præcis ét domænesuffiks), og `4.251`, `17.004`, `3.345` og `1.115`
  må ikke forekomme på siden.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: D1 rens dobbelt domæne-suffiks i 27 sidetitler (25 blogartikler,
  `/blog`, `/embed`) `76d8ad8` 2026-09-25 21:22 CEST. Verificér efter næste
  batch-vindue på live: `<title>` på `/blog/barsel-2026-regler-og-satser` skal være
  "Barsel 2026: Sats, orlov og overdragelse | MinBeregner.dk" — altså præcis ét
  domænesuffiks — og det samme for `/blog/skat-2026-alt-du-skal-vide`, `/blog` og
  `/embed`. Tjek desuden at `beraknare.se/blog` stadig 404'er (blog er DA-only) og at
  `/blog/boernepenge-2026-satser-og-regler` fortsat har sin rensede titel fra C10.
  HTTP 200 alene utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet
  2026-09-26.**
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C11 indkomstfelt i `/pension` — samlivsstatus, samlever uden
  pensionist (46 %-reglen), to indkomstfelter og den synlige opdeling
  grundbeløb/tillæg/nedsættelse/i alt — `b4f4dfc`, merge `a5a4c89` 2026-09-25 21:34 CEST. Verificér efter
  næste batch-vindue på live DA `/pension`: der skal stå "Folkepension 2026 — sådan er
  den sat sammen" med rækkerne Grundbeløb 7.544 kr., Pensionstillæg, fuldt (enlig)
  8.729 kr. og I alt pr. måned før skat 16.273 kr. ved standardværdierne, og prosaen skal
  nævne at beregneren bruger grænserne fra tabellen. Tjek også at indledningens liste nu
  siger 12.011 kr. til 16.273 kr. i stedet for "ca. 13.000-15.000 kr/måned".
  HTTP 200 alene utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet 2026-09-26**;
  21:30-batchen 2026-09-25 indeholdt den ikke (se kontrol 22:20 ovenfor).
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: R1 rentefradrag — ét ratested (`RENTEFRADRAG_2026` +
  `src/lib/rentefradrag.ts`), kilde med verificeringsdato på `/rentefradrag` og rettede
  FAQ'er/tabel på `/rentefradrag`, `/renteberegner`, `/boliglaan`, `/skattefradrag` og
  `fradrag-2026-komplet-guide` — commit `4e22336`, merge `9560189` 2026-09-25 22:15 CEST. Verificér efter
  07:30-vinduet 2026-09-26 på live DA `/rentefradrag`: tabellen skal vise 33,6 % /
  25,6 % med **ét** decimalkomma, teksten skal sige at værdien afhænger af
  beløbsgrænsen og ikke af kommunen, og kilde-links til skat.dk + borgerhaandbog skal
  være i DOM. Live `/skattefradrag` skal vise "33,6 % af de første 50.000 kr.".
  HTTP 200 alene utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet 2026-09-26**;
  21:30-batchen 2026-09-25 indeholdt den ikke (se kontrol 22:20 ovenfor).
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: K1 materialeberegning på `/kvadratmeter` — "Beregn
  materialer"-afsnit med spild/antal felter/enheder/pris i værktøjet plus
  kildeført materialafsnit på DA- og SE-siden — commit `792760c` 2026-09-25
  22:20 CEST, merge `47c78bf` 2026-09-25 22:24 CEST til `master`. Verificér efter 07:30-vinduet
  2026-09-26 på live DA `/kvadratmeter`: der skal stå "Beregn materialer" med
  "Du skal købe 88 m² inkl. spild (8 m² spild)" for standard 10 x 8 m, og
  kilde-linket til hjemmeland.dk skal være i DOM. Tjek også
  `beraknare.se/kvadratmeter` for "Beräkna material", "inkl. spill" og
  "Materialet säljs per m²". HTTP 200 alene utilstrækkeligt.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: S1 skattefradrag — delt kørselsfradragssats, ét ratested og
  ny logik i `src/lib/skattefradrag.ts` — kode `972c92f`, merge `f70cd69` 2026-09-25
  22:52 CEST. Verificér efter 07:30-vinduet 2026-09-26 på live DA `/skattefradrag`:
  kørselsfradragsafsnittet skal vise "Bundgrænse: 24 km dagligt (12 km én vej),
  herefter 3,17 kr./km op til 120 km og 1,59 kr./km over", have et link til
  `/befordringsfradrag`, og boligjobafsnittet skal sige at loftet ikke er
  verificeret mod en myndighedskilde. Tjek desuden at de gamle tal `2,28`, `1,14`
  og `25,1` ikke forekommer i den serverede HTML, og at live `/befordringsfradrag`
  bruger de samme satser. HTTP 200 alene utilstrækkeligt.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: D2 børnetilskudssatser — `src/lib/barnetilskud.ts` med de
  verificerede 2026-beløb, kildeført børnetilskudstabel og -liste i
  `/blog/boernepenge-2026-satser-og-regler` og `/boernepenge` — kode `b8c535e`,
  ff-merge til `master` 2026-09-25 23:09 CEST. Verificér efter 07:30-vinduet
  2026-09-26 på live DA `/blog/boernepenge-2026-satser-og-regler`: tabellen skal vise
  1.741 kr., 1.774 kr., 5.025 kr. og 2.874 kr. pr. kvartal, og "Se borger.dk" samt
  "Særlig vurdering" må **ikke** forekomme i den serverede HTML. Tjek desuden at
  kilde-linket peger på
  `https://www.borger.dk/familie-og-boern/Familieydelser-oversigt/boernetilskud`
  (den gamle, døde `/barnetilskud`-variant gav 404) og at live `/boernepenge` viser de
  samme beløb med pensionistlinjen 1.741 + 5.025 / 4.449 kr. HTTP 200 alene
  utilstrækkeligt — de gamle rækker gav også 200.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: L1 ret af tre 404-interne links + ny `internal-links.test.ts`
  `4e84395` 2026-09-26 00:12 CEST. Verificér efter 07:30-vinduet 2026-09-26 på
  live DA: `/blog/saadan-beregner-du-din-reelle-timeloen` skal linke til `/bil`
  (ikke `/bilberegner`) og `/blog/maanedsbudget-2026-komplet-guide` skal linke
  to gange til `/husleje` (ikke `/huslejeberegner`). HTTP 200 er ikke nok — de
  gamle stier gav også 200-sider hos læseren; tjek linkets `href` i DOM.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: F1 forsidens populærrække følger målt trafik (DA `/dato`,
  `/bmi`, `/boligstoette`, `/kvadratmeter`, `/rentefradrag`, `/tidsberegner`,
  `/kalorier`, `/braendstof` + `/loen-efter-skat`; SE `/tidsberegner`, `/dato`,
  `/leasing`, `/nedtaelling`, `/tidszone` + `/lon-efter-skatt`) og det afledte
  beregnerantal 49/28/31 i stedet for 44 — kode `0797b9c`, ff-merge til
  `master` 2026-09-26 00:05 CEST. Verificér efter 07:30-vinduet 2026-09-26 på live DA
  `/`: badge skal sige "49+" og "49 beregnere med 2026-satser" i description, og
  populærrækken skal begynde med "Datoberegner". Tjek også `beraknare.se/`: badge
  "31+", og rækken skal begynde med "Tidskalkylator" og indeholde "Nedräkningskalkylator".
  HTTP 200 alene utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet 2026-09-26**.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C12 `/nedtaelling` svar-først — ny H1 "Hvor mange dage er der
  til en dato?" (SE: "Hur många dagar är det kvar till ett datum?"), synlig
  uger/dage-tabel med rækken "100 dage / 14 uger / 2 dage", og links fra siden til
  alle syv `/dage-til/*` (SE `/dagar-till/*`) — kode `0bd5e7d` 2026-09-26 00:58 CEST.
  Verificér efter 07:30-vinduet 2026-09-26 på live DA `/nedtaelling`: H1'en skal være
  den nye, tabellen skal vise de tre kolonner, og DOM skal indeholde
  `href="/dage-til/juledagen"`. Tjek også `beraknare.se/nedtaelling`: svensk H1,
  `href="/dagar-till/juldagen"` og **ingen** `/dage-til/`. HTTP 200 alene
  utilstrækkeligt. **Kan først verificeres fra 07:30-vinduet 2026-09-26**.
- **Live-kontrol 2026-09-26 00:33 CEST (tredje datapunkt, ingen note lukket):**
  21:30-batchen 2026-09-25 indeholdt **heller ikke** dagens merges. Live
  `minberegner.dk/dage-til/juledagen` svarer stadig **404**, `/nedtaelling` har H1
  "Nedtælling - hvor mange dage til?" (ikke C12's svar-først-H1), og `/procent`
  har titlen "Procentberegner – beregn 10 procent af et tal" — altså den gamle
  variant fra før C1. `/procent` og `/dato` svarer dog 200, og `/api/health`
  svarede `status: ok`. C4 mergerede efter 17:30-vinduet 2026-09-25, så der er
  kun ét deploy-vindue (21:30) siden da — **endnu ikke `DEPLOY-MISSING`**, som
  kræver to. Næste vindue er 07:30 2026-09-26.
- **VERIFICÉR DEPLOY:** C15 `/promille` svar-først — kode `bc17c14`, merge
  `849f131` 2026-09-26 08:24 CEST. Første kandidatvindue er **12:30 2026-09-26**.
  Verificér **indhold** på begge domæner, HTTP 200 er ikke nok:
  1. DA `https://minberegner.dk/promille`: `<title>` skal være "Promilleberegner: 4 øl
     på 80 kg = 0,88 ‰", og introafsnittet under H1 skal begynde "4 øl til en mand
     på 80 kg giver 0,88 ‰". Den gamle titel var "Promilleberegner - Beregn din
     alkoholpromille | MinBeregner.dk" — den må **ikke** forekomme.
  2. DA samme side: `<meta name="description">` skal indeholde både "0,88 ‰" og
     "grænsen på 0,5 ‰".
  3. SE `https://beraknare.se/promille`: `<title>` skal være "Promillekalkylator:
     4 öl på 80 kg = 0,88 ‰", og **ikke** "0,5 ‰" nogen steder i den synlige tekst
     eller i metadata — svensk grænse er 0,2 ‰.
  4. Begge domæner: FAQ'en skal indeholde spørgsmålet "Hvornår kan jeg køre bil igen?"
     hhv. "När kan jag köra bil igen?" med svaret "5,9 timer" hhv. "5,9 timmar".
- **Live-kontrol 2026-09-26 01:05 CEST (fjerde datapunkt) — retter fejllæsningen
  ovenfor:** Sidste succesfulde batch er **17:30-vinduet 2026-09-25**. O1, O2, O3
  **og C1 er live**: `/blog/barsel-2026-regler-og-satser` viser 5.085 og ingen
  4.695, `/bmi` viser "BMI for voksne", `/su` viser 7.426, og `/procent` har
  C1's titel "Procentberegner – beregn 10 procent af et tal". Den 00:33-note
  kaldte denne titel "den gamle variant fra før C1" — **fejl**; C1's gamle titel
  var "Procentberegner - Beregn procent nemt og gratis | MinBeregner.dk".
  `/dage-til/juledagen` er stadig 404 og `/tidszone` har stadig den gamle titel,
  så C4-C13, L1 og F1 ligger uuddejlet. Ét deploy-vindue (21:30) siden C4's
  merge kl. 18:40 → stadig **ikke** `DEPLOY-MISSING`. Næste vindue 07:30.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C14 sitemap-lastmod — kun `/valuta` og de 7 dage-til-sider
  må have `<lastmod>`; de øvrige ~118 entries skal have **intet** `<lastmod>`-felt.
  Kode `0d57e31`, merge `3dcadfe` 2026-09-26 01:09 CEST. Verificér efter
  07:30-vinduet 2026-09-26
  på live `https://minberegner.dk/sitemap.xml`: `<loc>`-antal skal være 126 (119
  + de 7 dage-til-sider) på DA og 64 på SE, og `grep -c '<lastmod>'` skal give
  **8** på begge — ikke 126. HTTP 200 er ikke nok, fordi den gamle sitemap også
  svarer 200 med 119 lastmod. Tjek desuden at `<changefreq>daily</changefreq>`
  kun står på `/valuta` og dage-til-siderne.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: C13 dobbelt domænesuffiks på de ti `/kategori/*`-sider,
  `/privatlivspolitik` og `/cookiepolitik` — kode på `ceo/kategori-dobbelt-titelsuffix`.
  Verificér efter 07:30-vinduet 2026-09-26 på live DA: `<title>` på
  `/kategori/bolig` skal være "Boligberegnere — Boliglån, Husleje & Ejendomsskat |
  MinBeregner.dk" — **præcis ét** domænesuffiks — og det samme for de ni øvrige
  kategorier, `/privatlivspolitik` ("Privatlivspolitik | MinBeregner.dk") og
  `/cookiepolitik` ("Cookiepolitik | MinBeregner.dk"). Tjek desuden at
  `openGraph:title` stadig har domænenavnet, og at `og:site_name` er uændret.
  HTTP 200 er ikke nok: de gamle sider svarer 200 med dobbeltmærke. Tjek på
  `beraknare.se/cookiepolitik` og `beraknare.se/privatlivspolitik` for de svenske
  titler "Integritetspolicy"/"Cookiepolicy" med ét suffiks.
- **Live-kontrol 2026-09-26 04:30 CEST (femte datapunkt, ingen note lukket):**
  uændret billede. `/api/health` svarer `status: ok`, `/procent` har C1's titel,
  `/dage-til/juledagen` svarer stadig **404**, og `/tidszone` har stadig titlen
  "Tidszoneberegner - Omregn tid mellem lande" (C4's svar-først-variant er ikke
  live). Ét deploy-vindue (21:30) siden C4's merge → stadig **ikke**
  `DEPLOY-MISSING`. Næste vindue 07:30 2026-09-26.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: D5 helligdage i arbejdsdage på `/dato` — se opgave 35.
  Kode `9c979f4` på `ceo/dato-helligdage`, merge `68a25f6` 2026-09-26 04:35 CEST,
  efterfølgende fix   `961091e` (se nedenfor). Verificér **først
  efter 07:30-vinduet 2026-09-26**, og verificér **indhold**, ikke HTTP 200:

  1. DA `https://minberegner.dk/dato`: FAQ'en skal indeholde spørgsmålet "Hvilke
     helligdage bruger beregneren?", og svaret skal liste de ni danske
     helligdage. Det gamle svar "Tæller beregneren arbejdsdage korrekt? … Store
     bededag blev afskaffet som helligdag i 2024" må **ikke** stå, fordi det er
     nyt.
  2. DA samme side: `<meta name="description">` skal indeholde både "ca. måneder"
     og "helligdage" — den gamle havde "ca. måneder" men ikke "helligdage", og en
     tidligere kørings variant havde "helligdage" men miste "ca. måneder". Kræver
     begge ord.
  3. DA sidetekst: tipboksen må **ikke** længere sige "Beregneren tager ikke højde
     for helligdage". Søg efter "helligdage" og læs hele afsnittet.
  4. SE `https://beraknare.se/dato`: FAQ'en må **ikke** længere sige "Helgdagar är
     inte inkluderade", og der skal være et svar med Sveriges rödagar.
  5. Valgfrit men stærkest: kør `/dato` med start 1. december 2026 og slut
     31. december 2026. Forventes: 31 kalenderdage, 20 arbejdsdage, 8
     weekenddage, 3 helligdage. Er der kun fire felter, er den gamle kode live.
- **Efterfølgende fix samme iteration (`961091e`).** Efter merge gennemgik jeg
  kanttilfældet slutdato før startdato. Dato-inputsene har ingen `min`/`max`, så
  det kan ske, og `taellWeekender`/`taellHelligdage` returnerer 0 for et omvendt
  interval. Før D5 viste UI'et i så fald *alle* dage som "weekenddage", altså var
  inputtet allerede misvisende; nu viste det tre nuller. Intervallet sorteres derfor
  i "dage mellem"-tilstanden, præcis som i "arbejdsdage"-tilstanden. `dage` beholder
  sin fortegn, så trækning af dage stadig virker. Ny test i `helligdage.test.ts`
  dækker, at de tre tal er identiske uanset rækkefølge, når intervallet sorteres.
  Gate efter fixen: **1170/1170** tests, lint grøn (498 filer), build grøn.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: S2 rettelse af `/blog/skat-2026-alt-du-skal-vide` — kode og
  tests i `c273317`, merge til `master` `a563e74` 2026-09-26 05:14 CEST. Verificér efter
  07:30-vinduet 2026-09-26 på **live DA** `/blog/skat-2026-alt-du-skal-vide`, og
  verificér **indhold**:
  1. `<title>` skal være "Skat 2026: personfradrag 54.100 kr, bundskat 12,01 % | MinBeregner.dk"
     — altså svar-først og med præcis ét domænesuffiks (D1/C13-reglen).
  2. Sats-tabellen skal vise **25,049 %** og **0,639 %** (ikke 25,1 % / 0,88 %), og
     fradragslisten skal vise **12.400 kr** og **6.200 kr** for håndværker-/
     servicefradrag (ikke 12.900 kr).
  3. A-kasse skal stå som "fuldt fra uden loft", og 7.000 kr må kun stå som fagforeningens
     loft.
  4. Regneeksemplet skal vise **26.395 kr** i nettoudbetaling (ikke "26.000-27.000 kr"),
     og kilderne skat.dk, skm.dk, svmn.dk + borgerhaandbog.dk skal være i DOM.
  5. DOM skal indeholde `href="/skattefradrag"` og `href="/befordringsfradrag"`.
  HTTP 200 er ikke nok — de gamle sider svarer 200 med de gamle tal.
- ✅ **LUKKET 2026-09-26 07:55** (se DEPLOY OK 2026-09-26) — var: S3 fradrag-2026-guiden læser satser fra `SATSER_2026` og
  skelner service-/håndværkerfradrag. Verificér **indhold** på
  https://minberegner.dk/blog/fradrag-2026-komplet-guide: DOM skal vise
  `3,17 kr.` (ikke 2,23/1,12), fradragsværdien som "33,6 %"/"25,6 %", servicefradrag
  og håndværkerfradrag som to rækker, og teksten skal sige at befordringsfradraget
  kræver et motorkøretøj.   HTTP 200 beviser intet. Merge 2026-09-26 05:25 CEST —
  første kandidatvindue er 07:30 2026-09-26.
- **VERIFICÉR DEPLOY:** C19 dagpenge-satserne — kode `9a9b112`, merge `611607c`
  2026-09-26 11:35 CEST. Første kandidatvindue er **12:30 2026-09-26**.
  Verificér **indhold** på
  https://minberegner.dk/blog/dagpenge-saadan-finder-du-din-sats og
  https://minberegner.dk/dagpenge, HTTP 200 er ikke nok:
  1. Guidens `<title>` og H1 skal være "Dagpenge 2026: Max sats er 22.041 kr. pr.
     måned", og "Kort svar"-afsnittet skal vise 22.041 kr, 14.694 kr, 15.759 kr
     (71 %) og 18.074 kr (82 %).
  2. Sats-tabellen skal indeholde alle otte rækker med 22.041 / 14.694 / 18.074 /
     12.049 / 15.759 / 10.506 / 1.017 / 509 kr, og ved-byline'en skal læse
     "Satser verificeret 26. september 2026".
  3. Teksten må **ikke** indeholde "20.359", "952", "13.573", "14.557", "13.437",
     "120 kr/time" eller "22.600". De gamle sider svarer 200 med de gamle tal.
  4. Eksemplerne skal vise 16.560 kr (20.000 kr løn, under loftet) og 24.840 kr
     (30.000 kr løn, over loftet → 22.041), og der skal stå "ca. 26.620 kr" som
     lønloft. FAQ'en skal have svar på "Hvornår rammer man maxsatsen?" og
     "Hvad er en G-dag?" med 1.017 kr.
  5. `/dagpenge` skal vise deltidssatsen 14.694 kr og dimittend-rækkerne 15.759 kr
     og 18.074 kr i tabellen, og **ikke** "15.174".
  6. Tidlig CTA: `href="/dagpenge"` skal ligge før artiklens første `<table>`.

- **VERIFICÉR DEPLOY:** C16 svar-først på `/vaegttab` (DA/SE/NO) og `/enhedspris`
  (DA/SE) — kode `e83f017`, merge `bebdaf8` 2026-09-26 09:57 CEST. Første
  kandidatvindue er **12:30 2026-09-26** (07:30 gik forbi merge-tidspunktet).
  Verificér **indhold**, HTTP 200 er ikke nok:
  1. DA `https://minberegner.dk/vaegttab`: `<title>` skal være "Vægttab: 6 kg på
     12 uger = 550 kcal/dag | MinBeregner.dk", og introafsnittet under H1 skal
     indeholde "550 kcal" og "2.209 kcal". Den gamle titel var "Vægttab Beregner -
     Beregn dit kalorieunderskud | MinBeregner.dk".
  2. SE `https://beraknare.se/vaegttab`: `<title>` skal være "Viktminskning: 6 kg
     på 12 veckor = 550 kcal/dag | Beräknare.se" med "2.209 kcal" i introen.
  3. DA `https://minberegner.dk/enhedspris`: `<title>` skal være "Enhedspris:
     35 kr. for 2 kg = 17,50 kr. pr. kg | MinBeregner.dk", og introen skal
     indeholde "17,50 kr. pr. kg" og "12,5 %".
  4. SE `https://beraknare.se/enhedspris`: svensk titel "Jämförpris: 35 kr för 2
     kg = 17,50 kr per kg | Beräknare.se" og samme to tal synligt.
  5. Begge `/vaegttab`-domæner: FAQ'en skal have et svar med "2.759 kcal" (TDEE).
     `beraknare.no` er ikke live og forventes ikke at have ændret tekst.


- **VERIFICÉR DEPLOY:** C17 arveafgift-artiklen — kode `b13e254`, merge `cf56831`
  2026-09-26 10:45 CEST. Første kandidatvindue er **12:30 2026-09-26**.
  Verificér **indhold** på https://minberegner.dk/blog/arveafgift-regler-og-satser:
  `<title>` og H1 skal være "Arveafgift 2026: 1 mio. kr. til børn koster 91.155 kr.",
  introen skal vise 91.155 kr / 392.300 kr / 36,25 %, eksemplet til søskende skal
  vise 184.711 / 245.866 / 554.134 kr, og teksten må **ikke** indeholde "86.636",
  "147.791", "652.209" eller "15% gaveafgift". `/arveafgift` skal linke tilbage til
  guiden. HTTP 200 beviser intet.

- **VERIFICÉR DEPLOY:** C18 pensionssatserne — kode `7dcde36`, merge
  `ddc7bde` 2026-09-26 10:52 CEST. Første kandidatvindue er
  **12:30 2026-09-26**. Verificér **indhold** på
  https://minberegner.dk/blog/pension-hvor-meget-skal-du-spare-op og
  https://minberegner.dk/pension, HTTP 200 er ikke nok:
  1. Guiden skal vise **"max 68.700 kr/år"** for ratepension i både
     "Søjle 3: Privat opsparing" og punkt 3 i "5 ting"-kortet. Den gamle tekst
     "max ~63.000 kr/år" må **ikke** forekomme nogen steder på siden.
  2. Både guide og `/pension` skal vise **"9.900 kr/år"** for aldersopsparing.
  3. `/pension` skal vise "op til 68.700 kr/år i 2026" under "Ratepension".

- **VERIFICÉR DEPLOY:** **C48** — `/promille` svarer på "hvornår må jeg køre bil
  igen" med **tiden til at komme UNDER lovens grænse**, ikke tiden til 0 ‰.
  Kode + plan i én commit på branch `ceo/promille-graensetid`, merge til `master`
  **2026-09-26 22:28 CEST**. Første kandidatvindue **2026-09-27 07:30**.
  Verificér **indhold**, HTTP 200 er ikke nok:
  1. `https://minberegner.dk/promille` skal have H2 **"Hvornår er du igen
     promillefri?"** med fire rækker, hvor række 1 er **0,88 ‰ / 2,6 timer /
     5,9 timer** og række 4 er **1,51 ‰ / 6,8 timer / 10,1 timer**. Kolonnen
     skal hedde **"Under 0,5 ‰"**, og detektøren i værktøjet skal have **tre**
     kort med **"Under grænsen om 0,5 ‰"** mellem gram og "Tid til 0 ‰".
  2. FAQ'en på `/promille` skal **indeholde både "2,6 timer" og "5,9 timer"**.
     Den gamle sætning "skal blot regnes ned til under 0,5 ‰ … kræver 5,9
     timer" må **ikke** forekomme nogen steder på siden — den er den fejl, der
     fik læseren til at regne 3,3 timer for tidligt.
  3. `https://beraknare.se/promille` skal have H2 **"När är du åter nykter?"**,
     kolonnen **"Under 0,2 ‰"**, række 1 **0,88 ‰ / 4,6 timmar / 5,9 timmar**,
     række 4 **1,51 ‰ / 8,8 timmar / 10,1 timmar**, og FAQ'en skal indeholde
     **"4,6 timmar"** og **"5,9 timmar"**. Der må **ikke** stå "0,5 ‰" i
     værktøjet på beraknare.se (kun i den tilsigtede sammenligning med
     Danmark i FAQ'en).
  4. `/api/health` skal svare `status: ok`.
