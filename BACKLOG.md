# MinBeregner.dk — Backlog

> **Produkt:** Gratis online beregnere til danskere
> **Revenue model:** Ads (AdSense), Affiliate (finans, forsikring)
> **Target:** Danskere der soeger paa "beregn X", "X beregner"
> **Maal:** 50.000 maanedlige besoegende inden Q4 2026
> **Tech stack:** Next.js 15, TypeScript, Tailwind CSS v4, Dokploy

---

## UI/UX Princip

**Alle features SKAL vaere synlige og tilgaengelige for brugeren!**
- Backend-funktionalitet → tilfoej ogsaa UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv

---

## Completed

<details>
<summary>Klik for at se afsluttede opgaver</summary>

### Core Site
- [x] 33+ beregnere implementeret og live
- [x] Blog med 8 how-to guides
- [x] SEO skabelon (src/lib/seo.ts)
- [x] InternalLinks component
- [x] Cookie consent + GDPR
- [x] Responsive design
- [x] Sitemap generering (API route + static)
- [x] FAQ og RelatedCalculators components
- [x] Dark mode (system/lys/moerk)
- [x] Keyboard navigation + SkipLink
- [x] Print-venligt resultat layout
- [x] Loading states paa tunge beregninger
- [x] Input validation med venlige fejlbeskeder
- [x] URL state encoding for deling (?s= parameter)
- [x] Social share + QR kode
- [x] Plausible analytics integreret
- [x] Event tracking (beregning_udfoert, resultat_kopieret)
- [x] Affiliate boxes (boliglaan, forsikring, opsparing)
- [x] AdSense placeholder-ads klar
- [x] JSON-LD schema paa alle beregnere
- [x] FAQ schema paa populaere sider
- [x] Deploy til Dokploy med HTTPS
- [x] Security headers (HSTS, X-Frame-Options, etc.)
- [x] 8 blog posts med 1000+ ord og FAQ schema
- [x] Billaan, Forbrugslaan, Ejendomsvaerdiskat, Arveafgift beregnere

### Eksisterende Beregnere (33 stk)
Loen efter skat, Dagpenge, Moms, BMI, Procent, Boliglaan, Husleje, Boligstoette,
Rente, Pension, SU, Efterloen, Barselsdagpenge, Boernepenge, Rentefradrag,
Feriepenge, Valuta, Tidszone, Alder, Opsparing, Bil (vaerdtab), Braendstof,
Kalorier, Kvadratmeter, Timepris, Dato, Tidsberegner, Elberegner, Laaneberegner,
Billaan, Forbrugslaan, Ejendomsvaerdiskat, Arveafgift

</details>

---

## A. Design & Visuelt Loefte (15 opgaver)

### A1. Nyt hero-design paa forsiden
- [ ] Redesign forsiden med et stoerre, mere indbydende hero-sektion
- Tilfoej en soegebar med autocomplete der soeger paa tvaers af alle beregnere
- Vis de 6 mest populaere beregnere som store, klikbare kort med ikoner
- Tilfoej "trending" badge paa saesonrelevante beregnere (fx feriepenge om sommeren)
- Erstatt nuvaerende grid med kategoriserede sektioner med visuelt hierarki
- **Inspiration:** Finansielle portaler som Nordea.dk, Mybanker.dk

### A2. Konsistent komponent-designsystem
- [ ] Opret et samlet designsystem med genanvendelige UI-komponenter
- Standardiser alle knapper (primaer, sekundaer, ghost) med ens stoerrelse og padding
- Lav et konsistent kort-design (shadow, border-radius, padding) til alle beregnere
- Definer farvepalette som CSS custom properties i stedet for spredte Tailwind-klasser
- Standardiser alle input-felter (hoejde, font-stoerrelse, border-stil, fokus-ring)
- Dokumenter komponenterne i en /design-system side (intern reference)

### A3. Forbedret resultat-visning paa alle beregnere
- [ ] Redesign resultat-sektionen saa den er mere visuel og engagerende
- Tilfoej farvekodede resultat-kort (groen = godt, gul = ok, roed = advarsel) hvor relevant
- Vis noegletal i store, fremhaevede tal med labels (fx "Din maanedlige ydelse: **4.250 kr**")
- Tilfoej grafiske elementer: progress bars for BMI, donut charts for budget-beregnere
- Animer tallene naar de beregnes (count-up animation)
- Alle resultater skal have en "Kopier resultat" knap

### A4. Mobil-optimeret navigation og layout
- [ ] Gennemgaa og forbedre mobiloplevelsen paa alle 33 beregnere
- Test og fix touch-targets (minimum 44x44px paa alle klikbare elementer)
- Forbedre mobile dropdown-menuer (kategorier skal vaere nemmere at navigere)
- Tilfoej en sticky "Beregn" knap i bunden paa mobil naar formularen er udfyldt
- Optimer tabeller til mobil (horizontal scroll eller stack-layout)
- Test paa iPhone SE (375px), iPhone 14 (390px) og Samsung Galaxy (360px)

### A5. Typografi og laesbarhed
- [ ] Forbedre typografi paa tvaers af hele sitet
- Oeg body font-size fra 16px til 17-18px for bedre laesekomfort
- Tilfoej ordentlig linjehojde (1.6-1.75) paa alle tekst-sektioner
- Brug heading-hierarki konsekvent (h1 → h2 → h3, aldrig spring niveauer over)
- Tilfoej max-width paa tekst-afsnit (65-75 tegn per linje for optimal laesbarhed)
- Forbedre kontrast paa sekundaer tekst i dark mode (gray-400 er for lav kontrast)

### A6. Favicon og branding
- [ ] Design et professionelt favicon-set og OG-image
- Lav favicon i alle stoerrelse (16x16, 32x32, 180x180 apple-touch-icon, 512x512)
- Design et unikt OG-image (1200x630) med logo og tagline
- Lav side-specifikke OG-images for de 10 mest populaere beregnere
- Tilfoej manifest.json for PWA-klar branding (navn, farver, ikoner)

### A7. Footer redesign
- [ ] Redesign footer med bedre struktur og flere links
- Vis alle 33 beregnere organiseret i kategorier (Oekonomi, Bolig, Laan, Sundhed, Vaerktoej)
- Tilfoej "Seneste blog posts" sektion med de 3 nyeste artikler
- Tilfoej trust-signaler (antal beregnere, "Opdateret 2026", "Gratis og uden login")
- Forbedre cross-linking sektionen til soestersider
- Tilfoej nyhedsbrev-signup formular (email capture til remarketing)

### A8. Breadcrumbs paa alle sider
- [ ] Implementer synlige breadcrumbs paa alle undersider
- Forside → Kategori → Beregner (fx "Forside > Bolig > Boliglaan Beregner")
- Brug eksisterende BreadcrumbSchema men tilfoej ogsaa synlig UI-komponent
- Style breadcrumbs konsistent med resten af designet
- Test at breadcrumbs virker korrekt i dark mode

### A9. Forbedrede input-formularer
- [ ] Opgrader alle beregner-formularer med bedre UX
- Tilfoej enheds-labels inde i input-felter (fx "kr", "%", "aar", "kg")
- Implementer slider/range inputs som alternativ til talfelter paa relevante beregnere
- Tilfoej tooltip/info-ikoner med forklaringer ved komplekse felter
- Vis real-time beregning mens brugeren skriver (debounced, 300ms)
- Tilfoej "Nulstil" knap paa alle formularer

### A10. Animations og micro-interactions
- [ ] Tilfoej subtile animationer for bedre brugeroplevelse
- Fade-in animation paa resultat-sektionen naar beregning er faerdig
- Smooth scroll til resultater efter "Beregn" klik paa mobil
- Hover-effekter paa alle kort og klikbare elementer
- Skeleton loading state i stedet for spinner paa tunge beregninger
- Brug Framer Motion eller CSS transitions (vaelg en tilgang og vaer konsistent)

### A11. Dark mode gennemgang
- [ ] Gennemgaa dark mode paa ALLE 33 beregnere og fix inkonsistenser
- Mange beregnere har ikke faaet dark mode styling (kun BMI, Loen, Moms, Procent er testet)
- Fix kontrast-problemer paa sekundaer tekst, borders og baggrunde
- Sorg for at alle grafer/charts ogsaa virker i dark mode
- Test alle affiliate boxes og ad-bannere i dark mode
- Verificer at print stadig virker korrekt fra dark mode

### A12. Kategorisider
- [ ] Opret dedikerede kategorisider for hver beregner-kategori
- /kategori/oekonomi — alle oekonomiske beregnere med beskrivelse
- /kategori/bolig — alle bolig-beregnere med beskrivelse
- /kategori/laan — alle laan-beregnere med beskrivelse
- /kategori/sundhed — alle sundheds-beregnere med beskrivelse
- /kategori/vaerktoej — alle vaerktoejs-beregnere med beskrivelse
- Hver kategoriside faar eget SEO content, FAQ og schema markup

### A13. 404-side med soegefunktion
- [ ] Design en custom 404-side der hjaelper brugeren videre
- Tilfoej soegefelt til at finde beregnere
- Vis de mest populaere beregnere som forslag
- Tilfoej "Mente du...?" med fuzzy matching paa URL'en
- Log 404-hits til analytics saa vi kan finde broken links

### A14. Forside-testimonials og trust-sektion
- [ ] Tilfoej social proof og trust-elementer paa forsiden
- "Brugt af X danskere" taeller (kan vaere estimat baseret paa Plausible data)
- Vis antal beregnere: "33+ gratis beregnere"
- "Opdateret med 2026-satser" badge
- Eventuelt: bruger-testimonials eller ratings (kan implementeres senere)

### A15. Forbedret sidebar-design
- [ ] Redesign sidebar-sektionen paa beregner-sider
- Giv sidebar et konsistent layout: relaterede beregnere, tips, affiliate
- Tilfoej "Populaere beregnere" widget i sidebar
- Giv sidebar sticky scroll paa desktop (foelger med ned paa siden)
- Skjul sidebar paa mobil og vis indhold under beregner-resultatet i stedet

---

## B. SEO-Tekster & Indhold (12 opgaver)

### B1. SEO-tekst paa forsiden
- [x] Skriv en grundig SEO-tekst paa forsiden (500-800 ord)
- Forklar hvad MinBeregner.dk er, og hvilke beregnere der findes
- Inkluder keywords: "gratis beregner", "online beregner Danmark", "beregn loen", "beregn moms" osv.
- Strukturer med h2-overskrifter for hver kategori
- Tilfoej intern linking til de vigtigste beregnere
- Skriv naturligt og informativt — ikke keyword-stuffing

### B2. Unik SEO-tekst paa alle 33 beregner-sider
- [x] Skriv eller forbedr SEO-teksten paa hver enkelt beregner-side (minimum 300-500 ord per side)
- Hver side skal forklare: hvad beregneren goer, hvordan den virker, hvilke tal der bruges, og hvornaar man har brug for den
- Inkluder aktuelle 2026-tal og satser i teksten (fx "I 2026 er boernepenge-satsen X kr per kvartal")
- Teksten skal vaere informativ og hjaelpe brugeren — ikke bare vaere der for SEO
- Prioriter de 10 vigtigste sider foerst:
  1. /loen-efter-skat — Skattetryk, AM-bidrag, personfradrag 2026
  2. /boernepenge — Satser per aldersgruppe 2026
  3. /su — SU-satser hjemmeboende/udeboende 2026
  4. /dagpenge — Max dagpengesats 2026, krav til optjening
  5. /feriepenge — Feriepengesats, ferieaar, udbetaling
  6. /boligstoette — Nye regler, indkomstgraenser 2026
  7. /pension — Folkepensionsalder, ATP, ratepension
  8. /moms — Momssats 25%, hvornaar man beregner moms
  9. /barselsdagpenge — Barselssatser, varighed, deling mellem foraeldrene
  10. /efterloen — Efterloenssatser, efterloensalder, krav

### B3. FAQ-sektioner paa alle beregnere
- [x] Tilfoej eller forbedr FAQ-sektioner paa alle 33 beregnere
- Hver FAQ skal have 5-8 relevante spoergsmaal med grundige svar
- Brug FAQSchema markup saa spoergsmaalene kan vises i Google
- Spoergsmaalene skal matche reelle soegninger (brug Google autocomplete for inspiration)
- Eksempler: "Hvad er boernepenge-satsen i 2026?", "Hvor meget faar man i SU som udeboende?"
- Svarene skal vaere praecise med aktuelle tal, ikke generiske

### B4. Meta descriptions paa alle sider
- [x] Gennemgaa og optimere meta descriptions paa alle 33 beregnere + blog + indholdssider
- Hver description skal vaere 150-160 tegn og indeholde et call-to-action
- Inkluder aktuelle tal/satser for at oege CTR (fx "Beregn din loen efter skat med 2026-satser. Indtast din bruttolon og se hvad du faar udbetalt.")
- Test at descriptions ikke bliver afskaret i Google-resultater
- Tilfoej descriptions paa sider der mangler det (kategorisider, Om-siden)

### B5. Blog-udvidelse med 10 nye artikler
- [x] Skriv 10 nye, soege-optimerede blog posts (1000-1500 ord hver)
- Aemner med hoejt soegevolumen:
  1. "Skat 2026: Alt du skal vide om skatteaendringer"
  2. "SU 2026: Nye satser og regler for studerende"
  3. "Dagpenge beregner: Saadan finder du din dagpengesats"
  4. "Boliglaan 2026: Renter, afdrag og hvad du har raad til"
  5. "Fradrag 2026: Komplet guide til skattefradrag i Danmark"
  6. "Barsel 2026: Nye regler for barselsdagpenge og orlov"
  7. "Arveafgift i Danmark: Regler, satser og eksempler"
  8. "Elpriser 2026: Saadan beregner du dit elforbrug"
  9. "Privatoekonomi for unge: 5 beregnere du skal kende"
  10. "Koeb af bolig 2026: Alle omkostninger du skal kende"
- Hver artikel linker til minimum 3 relevante beregnere
- Tilfoej FAQ-schema paa alle nye artikler

### B6. Fix manglende blog posts (404-links)
- [x] To blog posts linker til sider der ikke eksisterer:
  - /blog/guide-til-laan-og-renter → lav denne side eller fjern linket
  - /blog/spar-penge-paa-braendstof → lav denne side eller fjern linket
- Blog-indekset viser 10 posts men kun 8 har pages — fix mismatch

### B7. MDX-indhold aktivering
- [x] Der ligger 10 ubrugte .mdx-filer i /content/how-to/ — aktiver dem
- Opret en dynamisk route der renderer MDX-filer (fx /guide/[slug])
- Tilfoej MDX-renderer med support for Tailwind prose styling
- Link til guiderne fra relevante beregnere
- Tilfoej siderne til sitemap og navigation

### B8. Om-siden opdatering
- [x] Opdater /om-siden som kun naevner 6 beregnere men der er 33+
- Opdater beregnertaeller og liste over alle beregnere
- Tilfoej information om opdateringsfrekvens og kildeangivelser
- Tilfoej kontaktinformation eller kontaktformular
- Goer siden mere trovaerdig med "Saadan sikrer vi korrekte tal"-sektion

### B9. Privatlivspolitik-opdatering
- [x] Opdater privatlivspolitikken — den siger "ingen cookies" og "ingen analytics" men sitet bruger Plausible analytics og cookie consent
- Tilfoej sektion om Plausible analytics (privacy-fokuseret, ingen persondata)
- Opdater cookie-sektionen til at afspejle faktisk brug
- Tilfoej info om AdSense cookies (naar det aktiveres)
- Tilfoej info om localStorage-brug (theme, cookie consent)

### B10. Struktureret indhold med tabeller
- [x] Tilfoej informative tabeller paa relevante beregnersider
- /boernepenge: Tabel med satser per aldersgruppe og kvartal
- /su: Tabel med SU-satser (hjemmeboende, udeboende, med/uden fribeloeb)
- /dagpenge: Tabel med dagpengesatser og krav
- /efterloen: Tabel med efterloenssatser og aldre
- /ejendomsvaerdiskat: Tabel med kommunale grundskyldspromiller
- Tabellerne skal vaere responsive og se godt ud paa mobil

### B11. Interne links-strategi
- [x] Styrk den interne linking paa tvaers af hele sitet
- Hver beregner skal linke til 5-8 relaterede beregnere (ikke kun 3-4)
- Blog posts skal linke til beregnere med kontekstuelle anchor-tekster
- Tilfoej "Se ogsaa" sektioner i SEO-teksten paa hver side
- Forsiden skal linke til ALLE beregnere (ikke kun de 6 i footeren)
- Opret et link-map og sikr at ingen sider er "orphans" (uden indgaaende links)

### B12. Sitemap og teknisk SEO fix
- [x] Fix sitemap-problemer og teknisk SEO
- Synkroniser src/app/sitemap.ts med /api/sitemap route (de er ude af sync)
- Tilfoej blog posts til sitemap (mangler: /blog/pension-..., /blog/boligstoette-... osv.)
- Tilfoej lastmod dato paa alle sitemap-entries
- Fjern ubrugt src/lib/seo.ts (den refererer til gammel domaene "beregner.dk")
- Tilfoej hreflang tags naar lokalisering implementeres

---

## C. Opdatering af Tal & Satser 2026 (10 opgaver)

### C1. Boernepenge-satser 2026
- [x] Verificer og opdater boernepenge-satser til 2026-niveau
- Tjek satser paa borger.dk for 0-2 aar, 3-6 aar, 7-14 aar, 15-17 aar
- Opdater kvartalsvise og maanedlige beloeb
- Tjek indkomstafhaengig reduktion og graenser
- Opdater tekst og FAQ med nye satser
- Kilde: borger.dk/familie-og-boern/boernefamilieydelse

### C2. SU-satser 2026
- [x] Verificer og opdater SU-satser til 2026-niveau
- Tjek grundsats for hjemmeboende og udeboende
- Opdater fribeloeb (lavt og hoejt fribeloeb)
- Tjek SU-laan satser og rentesats
- Opdater eventuelle nye regler om udeboende-kontrol
- Kilde: su.dk/satser

### C3. Dagpenge-satser 2026
- [x] Verificer og opdater dagpenge-satser til 2026-niveau
- Tjek max dagpengesats (timesat og maanedlig)
- Opdater beregningsgrundlag (90% af tidl. loen, max XX kr)
- Tjek dimittendsats og unge-sats
- Opdater supplerende dagpenge-regler
- Kilde: borger.dk/arbejde-dagpenge-ferie/dagpenge

### C4. Loen-efter-skat 2026 skattesatser
- [x] Verificer og opdater alle skattesatser til 2026
- Personfradrag (bundfradrag)
- AM-bidrag (8%)
- Kommuneskat (gennemsnit og mulighed for at vaelge kommune)
- Bundskat og topskat-graense
- Beskaeftigelsesfradrag
- Kilde: skm.dk, skat.dk/satser-og-beloeb

### C5. Boligstoette-satser 2026
- [x] Verificer og opdater boligstoette-satser til 2026-niveau
- Indkomstgraenser for enlige og par
- Max boligudgift der gives stoette til
- Formuegrundlag og fradrag
- Arealkrav (max m2 per person)
- Kilde: borger.dk/bolig-og-flytning/boligstoette

### C6. Pension og efterloen 2026
- [x] Verificer og opdater pension og efterloen-satser
- Folkepensionsalder (nuvaerende og kommende)
- Folkepension grundbeloeb og pensionstillaeg
- Efterloenssats (91% af max dagpenge)
- ATP-bidrag og udbetalingssatser
- Kilde: borger.dk/pension-og-efterloen

### C7. Barselsdagpenge 2026
- [x] Verificer og opdater barsels-satser
- Max barselsdagpengesats
- Barselsorlov-perioder (mor, far/medmor, faelles)
- Nye regler om oeremaerket barsel (11 uger til hver)
- Beregningsgrundlag for selvstaendige
- Kilde: borger.dk/familie-og-boern/barsel-og-orlov

### C8. Feriepenge-satser 2026
- [x] Verificer og opdater feriepenge-regler
- Feriepengesats (12,5% af ferieberettiget loen)
- Ferieaar og optjeningsperiode
- Samtidighedsferie-regler
- Udbetaling af feriepenge ved fratræden
- Kilde: borger.dk/arbejde-dagpenge-ferie/ferie

### C9. Ejendomsvaerdiskat og grundskyld 2026
- [x] Verificer og opdater ejendomsskat-satser
- Ejendomsvaerdiskattesatser (0,92% / 3%)
- Bundfradragsgraense
- Opdater kommunale grundskyldspromiller (alle 98 kommuner)
- Tjek overgangsordning for nye ejendomsvurderinger
- Kilde: skm.dk/ejendomsskat

### C10. Arveafgift-satser 2026
- [x] Verificer og opdater arveafgift-satser
- Bundfradrag (322.000 kr eller opdateret?)
- Boafgift-sats (15%)
- Tillaegafgift (25% for fjerne slaegtninge)
- Gavetillaegsafgift-satser
- Kilde: skat.dk/arv-og-gave

---

## D. Gennemgang & Forbedring af Alle Beregnere (11 opgaver)

### D1. Loen-efter-skat beregner forbedring
- [x] Udvid med kommune-vaelger (alle 98 kommuner med korrekt kommuneskat)
- Tilfoej kirkeskat-toggle
- Vis detaljeret beregning: AM-bidrag → Bundskat → Kommuneskat → Topskat → Nettoloen
- Tilfoej beregning for forskellige ansaettelsestyper (maanedsloen, timeloen, freelance)
- Tilfoej sammenligning: "Hvad faar du ekstra ved 1.000 kr mere i loen?"

### D2. BMI beregner forbedring
- [x] Grafisk BMI skala med farvezoner og markør
- [x] Enhedsvalg: kg/cm eller lbs/inches med konvertering
- [x] Talje-hofte ratio beregner som supplement med WHO-grænser
- Link til kalorier-beregner allerede via RelatedCalculators

### D3. Boliglaan beregner forbedring
- [x] Låntype allerede implementeret (fast, variabel, afdragsfrit)
- [x] Amortiseringsplan (år for år) med toggle
- [x] Samlede boligomkostninger (ydelse + ejendomsskat + forsikring + ejerforening)
- [x] Afdrag vs. rente visualisering over tid
- [x] "Hvad har jeg råd til?" omvendt beregning
- [x] Dark mode og InputField migration

### D4. Opsparingsberegner forbedring
- [x] Vækstgraf med indskud/rente-fordeling
- [x] Scenarie-sammenligning (aktuelt + 2 højere rentesatser)
- [x] Inflations-justering med toggle og realt afkast
- [x] "Nå et mål" omvendt beregner
- [x] Dark mode og InputField migration

### D5. Pensionsberegner forbedring
- [x] Tre pensionssøjler visualiseret (folkepension + arbejdsmarked + privat)
- [x] Estimeret månedlig pension fra opsparing
- [x] Folkepension automatisk beregnet (2026-satser)
- [x] Pension gap med "ønsket månedlig pension" input
- [x] Pensionsformue graf over tid
- [x] Dark mode og InputField migration

### D6. Valuta beregner forbedring
- [x] Live valutakurser via Frankfurter API (ECB data, gratis)
- [x] Fallback til statiske kurser ved fejl
- [x] Populære valutapar hurtigknapper (DKK/EUR, USD, GBP, SEK, NOK)
- [x] Klikbar kursliste der skifter valutapar
- [x] Opdateringstidspunkt og live/vejledende indikator
- [x] Dark mode

### D7. Elberegner forbedring
- [x] Per-apparat forbrug-opdeling med visuel bar
- [x] Sammenligning med gennemsnitligt dansk elforbrug (4 husstandstyper)
- [x] Elpris-sammensætning (spot, transport, elafgift, moms)
- [x] Månedlig og årlig omkostning per apparat
- [x] Dark mode

### D8. Kalorieberegner forbedring
- [x] Makronæringsstoffer med visuel bar (protein, kulhydrat, fedt)
- [x] 5 aktivitetsniveauer allerede implementeret
- [x] Alle tre mål side om side (vægttab, vedligehold, opbygning)
- [x] Dark mode og InputField migration
- Tilfoej BMR (Basal Metabolic Rate) separat
- Link til BMI-beregner med forudfyldte data

### D9. Timepris beregner forbedring
- [ ] Tilfoej beregning for freelancere (inkl. moms, skat, ferie, sygedage)
- Vis breakdown: bruttotimepris → skat → nettotimepris
- Tilfoej branche-sammenligning (hvad tjener andre i din branche?)
- Tilfoej beregning af effektiv timepris inkl. transport og forberedelse
- Tilfoej "Hvad skal jeg tage i timepris for at tjene X om maaneden?"

### D10. Share/Del feature paa alle beregnere
- [ ] URL state encoding mangler paa 29 beregnere (kun implementeret paa 4)
- Implementer useCalculationState hook paa alle 33 beregnere
- Tilfoej "Del beregning" knap paa alle beregnere
- Test at delte links preudfylder korrekt paa alle beregnere
- Sorg for at URL-state er bagudkompatibel

### D11. Analytics tracking paa alle beregnere
- [ ] Plausible event tracking er kun paa 4 beregnere — udvid til alle 33
- Track "beregning_udfoert" med calculator-navn paa alle beregnere
- Track "resultat_kopieret" paa alle beregnere med kopier-knap
- Tilfoej scroll-depth tracking paa beregner-sider
- Track affiliate-klik med destination-URL

---

## E. Nye Beregnere (15 opgaver)

### E1. Aktieskat beregner
- [ ] Beregn skat paa aktieindkomst (27% under progressionsgraensen, 42% over)
- Input: realiseret gevinst, tab til modregning, aktiesparekonto vs frit depot
- Vis forskel paa beskatning i aktiesparekonto vs frit depot
- Tilfoej info om lagerbeskatning vs realisationsbeskatning
- Hoej affiliate-potential: link til Nordnet, Saxo Bank
- **Route:** /aktieskat

### E2. Leasing beregner
- [ ] Beregn maanedlig leasingydelse for bil
- Input: bilpris, restvaerdi, loebetid, rente, udbetaling
- Vis total leasingomkostning vs koeb
- Tilfoej sammenligning: leasing vs laan vs kontantkob
- Tilfoej info om privat vs erhvervsleasing
- **Route:** /leasing

### E3. Topskat beregner
- [ ] Beregn om man betaler topskat og hvor meget
- Input: aarsindkomst, kommune, kirkeskat
- Vis topskat-graense og hvor meget der betales over
- Vis effektiv skatteprocent (marginal vs gennemsnit)
- Tilfoej "Hvad skal du tjene foer topskat?"
- **Route:** /topskat

### E4. Graviditetsberegner / terminsdato
- [ ] Beregn terminsdato ud fra sidste menstruations foerste dag
- Vis uge-for-uge kalender med milepale
- Tilfoej info om barselsorlov-perioder
- Link til barselsdagpenge-beregner
- Meget hoejt soegevolumen: "terminsdato beregner", "graviditetsberegner"
- **Route:** /termin

### E5. Brutto/netto loen beregner
- [ ] Omvendt beregning: fra oensket nettoloen til noedvendig bruttoloen
- Input: oensket maanedlig udbetaling, kommune, kirkeskat
- Nyttigt til loenforhandling
- Vis detaljeret skatteberegning
- Link til loen-efter-skat beregner
- **Route:** /brutto-netto

### E6. Gaeldsfri beregner (gaeldsafvikling)
- [ ] Beregn hvor lang tid det tager at blive gaeldsfri
- Input: samlet gaeld, rente, maanedlig afdrag
- Vis amortiseringsplan og total renteomkostning
- Tilfoej "snebold" vs "lavine" metode sammenligning
- Tilfoej mulighed for ekstra indbetalinger
- **Route:** /gaeldsfri

### E7. Sygdom / sygedagpenge beregner
- [ ] Beregn sygedagpenge for loenmodtagere og selvstaendige
- Max sygedagpengesats, beregningsgrundlag
- Vis arbejdsgiverperiode (30 dage) vs kommunal udbetaling
- Tilfoej info om mulighedserklearing og varighedsbegraensning
- **Route:** /sygedagpenge

### E8. Konfirmationsbudget beregner
- [ ] Beregn budget for konfirmation (populaert saesonemne)
- Input: antal gaester, fest-type, gaver
- Vis breakdown: lokale, mad, gaver, toej, kirke
- Tilfoej gennemsnitlige konfirmationsgave-beloeb
- Hoejt soegevolumen i foraar/sommer
- **Route:** /konfirmation

### E9. Vaegttabs beregner
- [ ] Beregn kalorieunderskud nødvendigt for oensket vaegttab
- Input: nuvaerende vaegt, maalvaegt, tidsramme, aktivitetsniveau
- Vis dagligt kaloriemaal og ugenligt vaegttab
- Tilfoej advarsel ved for hurtigt vaegttab (< 0,5 kg/uge)
- Link til kalorier og BMI beregnere
- **Route:** /vaegttab

### E10. Huslaan / andelsbolig beregner
- [ ] Beregn oekonomien ved koeb af andelsbolig
- Input: andelpris, boligafgift, forbedringer, laan
- Vis maanedlige omkostninger vs leje
- Tilfoej beregning af andelskrone
- Info om haefte for faelleslaen
- **Route:** /andelsbolig

### E11. Rejsebudget beregner
- [ ] Beregn rejsebudget baseret paa destination
- Input: destination, antal dage, antal personer, rejsetype
- Vis estimeret budget: fly, hotel, mad, transport, oplevelser
- Tilfoej valutaomregning til destination
- Populaer soegning: "hvad koster en ferie til X"
- **Route:** /rejsebudget

### E12. Studielaan tilbagebetaling beregner
- [ ] Beregn maanedlig tilbagebetaling af SU-laan
- Input: samlet SU-gaeld, rente (1% under uddannelse, 4% efter)
- Vis tilbagebetalingsplan over 7-15 aar
- Tilfoej indkomstafhaengig tilbagebetaling
- Link til SU-beregner
- **Route:** /studielaan

### E13. Solcelle beregner
- [ ] Beregn besparelse og tilbagebetalingstid for solceller
- Input: tagfladeretning, stoerrelse, elforbrug, elpris
- Vis aarlig produktion, besparelse og tilbagebetalingstid
- Tilfoej info om nettomaalerordning og afgifter
- Hoej interest med stigende elpriser
- **Route:** /solceller

### E14. Bryllupsbudget beregner
- [ ] Beregn komplet bryllupsbudget
- Input: antal gaester, lokation-type, madniveau
- Vis breakdown: venue, catering, fotograf, musik, kjole/jakkesaet, ringe, dekoration
- Tilfoej gennemsnitlige danske bryllupspriser
- Populaer saesonsoeging
- **Route:** /bryllup

### E15. Skattefradrag beregner (samlet)
- [ ] Samlet beregner for alle skattefradrag
- Haandvaerkerfradrag, koerselsfradrag, rentefradrag, fagforening, a-kasse
- Vis samlet fradrag og skattebesparelse
- Tilfoej info om hvad der kan fradrages og graenser
- Meget hoejtsoegt emne
- **Route:** /skattefradrag

---

## F. Teknisk Gaeld & Bugfixes (8 opgaver)

### F1. Test-setup og test-daekning
- [ ] Konfigurer Vitest som test-runner (der er en test-fil men ingen konfiguration)
- Tilfoej unit tests paa beregningslogik for alle 33 beregnere
- Sorg for at hvert beregnerens matematiske logik er testet isoleret
- Tilfoej integration tests for de mest populaere beregnere
- Tilfoej test til CI/CD pipeline (GitHub Actions)
- Maal: 80% test-daekning paa beregningslogik

### F2. Fjern duplikeret og ubrugt kode
- [ ] Fjern gammel AdBanner.tsx i rod (erstattet af ads/AdBanner.tsx)
- Fjern ubrugt src/lib/seo.ts (refererer til "beregner.dk", erstattet af StructuredData.tsx)
- Fjern eller opdater SharedFooter.tsx (erstattet af inline footer i layout.tsx)
- Fjern duplikerede UI/UX Princip-sektioner i BACKLOG.md (var 5 kopier)
- Ryd op i "February 2026" sektionen i bunden af backlog (duplikerer eksisterende beregnere)

### F3. Performance optimering
- [ ] Implementer dynamisk import / lazy loading paa beregner-komponenter
- Tilfoej Image optimering (next/image) paa alle billeder
- Implementer route-baseret code splitting
- Reducer bundle size ved at analysere med next-bundle-analyzer
- Tilfoej caching headers paa statiske assets
- Maal: Lighthouse performance score > 95

### F4. Tilgaengelighed (a11y) audit
- [ ] Koer fuld tilgaengelighedsaudit med axe-core eller Lighthouse
- Fix alle ARIA-problemer og manglende labels
- Test med skraemlaeser (VoiceOver/NVDA)
- Sorg for at alle formularer har tilknyttede labels
- Alle interaktive elementer skal have synlig fokus-indikator
- Test tab-raekkefoelge paa alle sider

### F5. Error handling og edge cases
- [ ] Gennemgaa alle beregnere for edge cases
- Hvad sker der ved 0-input, negative tal, ekstremt store tal?
- Tilfoej venlige fejlbeskeder paa alle beregnere (kun 3 har InputField validering)
- Tilfoej error boundaries saa en fejl i en beregner ikke crasher hele siden
- Test alle beregnere med ugyldig URL state (?s= parameter med ugyldige data)

### F6. Cookiepolitik og GDPR compliance
- [ ] Opdater cookiepolitik-siden med faktisk brug
- Cookie consent gemmer i localStorage — er det tilstraekkeligt eller skal det vaere en cookie?
- Tilfoej granuleret samtykke (nødvendige, analytics, marketing) naar AdSense aktiveres
- Sorg for at Plausible foerst loades efter samtykke (eller dokumenter at det er cookiefrit)
- Test at cookie consent virker korrekt paa alle sider

### F7. Sitemap og robots.txt sync
- [ ] Der er to sitemap-implementeringer der er ude af sync:
  - src/app/sitemap.ts (statisk, mangler nye beregnere)
  - src/app/api/sitemap/route.ts (dynamisk, mere komplet)
- Vaelg een implementering og fjern den anden
- Tilfoej alle blog posts til sitemap
- Tilfoej lastmod datoer baseret paa sidst opdateret
- Tilfoej changefreq og priority korrekt

### F8. Linting og kode-kvalitet
- [ ] Koer fuld Biome lint og fix alle warnings
- Standardiser imports (absolut @/ prefix overalt)
- Sorg for konsistent navngivning (nogle filer bruger PascalCase, andre camelCase)
- Tilfoej stricter TypeScript (no-any, strict null checks)
- Tilfoej pre-commit hook der koerer lint paa staged files (husky er sat op men tjek det virker)

---

## G. Monetisering & Vaekst (7 opgaver)

### G1. AdSense aktivering og optimering
- [ ] Naar AdSense er godkendt: aktiver script i layout.tsx (nu kommenteret ud)
- Placer annoncer strategisk: sidebar, mellem FAQ og beregner, footer
- Test ad performance med Plausible events (ad_clicked, ad_impression)
- Implementer ad-free oplevelse paa foerste visit (vis ads foerst ved genbrug)
- Respekter max 3 ads per side for UX

### G2. Affiliate-links udvidelse
- [ ] Tilfoej affiliate-links paa flere beregnere:
  - /aktieskat → Nordnet, Saxo Bank, Lunar Invest
  - /leasing → LeasePlan, ALD Automotive
  - /solceller → Viasol, GreenMatch
  - /studielaan → banker med gode studielaansbetingelser
  - /forsikring (ny) → Samlino, TopDanmark, Tryg
- Alle affiliate boxes skal have "Annonce" label (dansk markedsfoeringslov)

### G3. Email-capture og nyhedsbrev
- [ ] Implementer email-signup paa forsiden og beregner-sider
- "Faa besked naar satser aendres" — vaerdifuldt value proposition
- Tilfoej popup/slide-in efter 30 sekunder paa siden
- Integrer med simpel email-service (fx Buttondown, Mailchimp)
- Send maanedligt nyhedsbrev med opdaterede satser og nye beregnere

### G4. Social media tilstedevaerelse
- [ ] Opret og link til social media profiler
- Facebook-side med beregner-tips og satsaendringer
- LinkedIn-profil for B2B synlighed
- Tilfoej social media links i footer
- Del nye beregnere og blog posts paa social media

### G5. Google Search Console opsaetning
- [ ] Submit sitemap.xml til Google Search Console
- Verificer ejerskab af minberegner.dk
- Monitor keyword rankings for vigtigste soegetermer
- Identificer soegetermer med hoejt impression-count men lav CTR
- Optimer meta descriptions baseret paa Search Console data

### G6. Konkurrentanalyse og keyword research
- [ ] Analyser konkurrenter: dinero.dk, skm.dk, borger.dk, mybanker.dk
- Identificer keywords de ranker paa som vi ikke daekker
- Find "low competition, high volume" keywords til nye beregnere
- Analyser deres indholdsstruktur og laer af hvad der virker
- Lav prioriteret liste over nye beregnere baseret paa soegevolumen

### G7. Backlink-strategi
- [ ] Byg backlinks til sitet for bedre domain authority
- Kontakt danske finansblogs og tilbyd gratis embeddable beregner-widgets
- Skriv gaeste-indlaeg paa relevante danske blogs
- Submit til danske webkataloger og beregner-oversigter
- Tilfoej "Powered by MinBeregner.dk" link paa widget-embeds

---

## H. Fremtidige Muligheder (laengere sigt)

### H1. API for beregnere (B2B monetisering)
- [ ] Byg et REST API der eksponerer beregnerlogik
- Freemium model: 100 gratis kald/dag, derefter betaling
- API dokumentation med OpenAPI/Swagger
- Interessant for banker, raadgivere, fintech startups

### H2. Widget embed kode
- [ ] Tilbyd embeddable beregner-widgets til andre websites
- Gratis med "Powered by MinBeregner.dk" backlink
- Betalt version uden branding
- Tilpasselig farver og stoerrelse

### H3. PWA (Progressive Web App)
- [ ] Goer sitet til en fuld PWA
- Offline support for beregninger (service worker)
- "Tilfoej til startskraerm" prompt
- Push notifikationer ved satsaendringer

### H4. Internationalisering
- [ ] Norsk version (minberegner.no) med norske satser og regler
- Svensk version (minberegner.se) med svenske satser og regler
- Brug eksisterende locales/ JSON-filer som fundament
- Lokaliser skatteregler, satser og sprog per land

### H5. AI-assistent
- [ ] Tilfoej en AI chatbot der kan besvare spoergsmaal om beregnere
- "Sporg mig om din oekonomi" — router til den rette beregner
- Kan besvare simple spoergsmaal direkte (fx "Hvad er momsen paa 500 kr?")
- Brug OpenAI/Anthropic API med context om alle beregnere

---

## Prioriteringsoversigt

| Prioritet | Omraade | Antal | Forventet effekt |
|-----------|---------|-------|-----------------|
| 1 (nu) | C. Satser 2026 | 10 | Korrekthed og trovaerdighed |
| 2 (nu) | B. SEO-tekster | 12 | Organisk trafik |
| 3 (snart) | D. Forbedre beregnere | 11 | Engagement og tid-paa-side |
| 4 (snart) | A. Design | 15 | Brugeroplevelse og konvertering |
| 5 (loebende) | F. Teknisk gaeld | 8 | Stabilitet og hastighed |
| 6 (loebende) | E. Nye beregnere | 15 | Nye keywords og trafik |
| 7 (loebende) | G. Monetisering | 7 | Revenue |
| 8 (senere) | H. Fremtid | 5 | Scale |

**Total: 83 opgaver**

---

> Sidst opdateret: 2026-02-17
