# Kommercielt inventar — MinBeregner.dk

Dato: 2026-09-17. Opgave: **[P1] [S] Lav et kommercielt inventar**.
Grundlag: lokal kode ved `be8e4bd`; ingen produktionsopslag, kundekontakt eller adgang til eksterne dashboards.

## Konklusion

Der findes **78 beregnere i det danske katalog**, ikke blot de 33 i den ældre backlog. Alle katalogets danske ruter har en lokal `src/app/<slug>/page.tsx`. Der findes allerede en timeprisberegner og en tilhørende freelancerguide. Det er derfor ikke nødvendigt at bygge et nyt værktøj for at have noget at validere.

**Efterspørgsel er ikke dokumenteret i det undersøgte lokale materiale.** Der blev ikke fundet aggregerede søgeklik eller leadtal for perioden **2026-06-19 til 2026-09-16**, begge dage inklusive (90 afsluttede kalenderdage før inventardatoen). Det betyder ukendt, ikke nul trafik eller nul leads. Ingen beregner kan udpeges som dokumenteret kommerciel vinder på dette grundlag.

Udviklingspausen i `BACKLOG.md:11` fastholdes. Inventaret er afsluttet som lokal kortlægning; det er hverken en gennemført markedstest, dokumentation for betalingsvilje eller en beslutning om, at 90-dages parkeringen er startet. Stopreglens teststart og frist er fortsat ikke fastlagt.

## Kilder og afgrænsning

- `src/lib/calculator-list.ts:17`: 80 katalogposter, hvoraf to er svenske specialberegnere. Dansk filtrering følger `getCalculatorsByLocale` på linje 116; 78 poster resterer.
- `src/lib/domain-config.ts:17`: dansk basisadresse er `https://minberegner.dk`. Adresserne nedenfor er afledt af denne konfiguration og eksisterende ruter; HTTP-status, indeksering og aktuel publicering er **ikke kontrolleret**.
- `src/app/sitemap.ts:16`: sitemap bruger `getAvailableSlugs`, ikke en måling af besøg. Prioriteter og `lastModified` er ikke efterspørgselsdata.
- `src/lib/calculator-list.ts:238`: listen over populære beregnere er hardkodet og kan ikke bruges som trafikrangering.
- Søgning i repoets Markdown efter Search Console, Plausible, søgeklik, leads og besøgende gav plan-/implementeringsnoter, ikke historiske målerapporter. Filnavnesøgning efter trafik/analytics/eksporter og CSV/XLSX fandt ingen trafikeksport; `planning/sitemap.csv:1` indeholder kun slug, titel og noter.
- `BACKLOG.md:724`: Search Console-opsætning står som en åben opgave. Det beviser ikke, at der mangler en ekstern konto, men repoet dokumenterer ikke resultaterne.
- `docs/analytics/events.md:1` er en kort eventbeskrivelse, ikke en eksport.

Blogs, kategori- og informationssider, API-endpoints og indlejrede kopier tælles ikke som ekstra beregnere. Svenske `/lon-efter-skatt` og `/bolan` er uden for det danske inventar. Norske adresser medtages ikke; domænet er skjult i `src/lib/domain-config.ts:78`.

## Inventar

**U = ukendt: ingen lokal dokumentation fundet for perioden 2026-06-19–2026-09-16.** Begge talkolonner gælder denne periode. Ingen af U-værdierne må indlæses som 0 i en senere rapport. Hver URL svarer til `src/app/<slug>/page.tsx`.

| Beregner | Offentlig adresse ifølge kode, ikke live-verificeret | Google-søgeklik | Bekræftede leads |
|---|---|---|---|
| Løn efter skat | https://minberegner.dk/loen-efter-skat | U | U |
| Dagpenge | https://minberegner.dk/dagpenge | U | U |
| Feriepenge | https://minberegner.dk/feriepenge | U | U |
| SU Beregner | https://minberegner.dk/su | U | U |
| Pension | https://minberegner.dk/pension | U | U |
| Efterløn | https://minberegner.dk/efterloen | U | U |
| Sygedagpenge | https://minberegner.dk/sygedagpenge | U | U |
| Barselsdagpenge | https://minberegner.dk/barselsdagpenge | U | U |
| Børnepenge | https://minberegner.dk/boernepenge | U | U |
| Timepris | https://minberegner.dk/timepris | U | U |
| Lønberegner | https://minberegner.dk/loen-konverter | U | U |
| Boliglån | https://minberegner.dk/boliglaan | U | U |
| Renteberegner | https://minberegner.dk/renteberegner | U | U |
| Husleje | https://minberegner.dk/husleje | U | U |
| Boligstøtte | https://minberegner.dk/boligstoette | U | U |
| Låneberegner | https://minberegner.dk/laaneberegner | U | U |
| Opsparing | https://minberegner.dk/opsparing | U | U |
| Rådighedsbeløb | https://minberegner.dk/budget | U | U |
| Afkastberegner | https://minberegner.dk/afkast | U | U |
| Sparemål | https://minberegner.dk/sparemaal | U | U |
| Lønstigning | https://minberegner.dk/loenstigning | U | U |
| Rentefradrag | https://minberegner.dk/rentefradrag | U | U |
| Billån | https://minberegner.dk/billaan | U | U |
| Forbrugslån | https://minberegner.dk/forbrugslaan | U | U |
| Ejendomsværdiskat | https://minberegner.dk/ejendomsvaerdiskat | U | U |
| Arveafgift | https://minberegner.dk/arveafgift | U | U |
| Topskat | https://minberegner.dk/topskat | U | U |
| Skattefradrag | https://minberegner.dk/skattefradrag | U | U |
| Aktieskat | https://minberegner.dk/aktieskat | U | U |
| Andelsbolig | https://minberegner.dk/andelsbolig | U | U |
| Studielån | https://minberegner.dk/studielaan | U | U |
| Moms | https://minberegner.dk/moms | U | U |
| Procent | https://minberegner.dk/procent | U | U |
| BMI Beregner | https://minberegner.dk/bmi | U | U |
| Kalorieberegner | https://minberegner.dk/kalorier | U | U |
| Promilleberegner | https://minberegner.dk/promille | U | U |
| Kropsfedtprocent | https://minberegner.dk/kropsfedt | U | U |
| 1RM beregner | https://minberegner.dk/1rm | U | U |
| Vandbehov | https://minberegner.dk/vandbehov | U | U |
| Kalorieforbrænding | https://minberegner.dk/motion-kalorier | U | U |
| Proteinbehov | https://minberegner.dk/proteinbehov | U | U |
| Rygestop | https://minberegner.dk/rygestop | U | U |
| Alkoholenheder | https://minberegner.dk/alkoholenheder | U | U |
| Datoberegner | https://minberegner.dk/dato | U | U |
| Tidsberegner | https://minberegner.dk/tidsberegner | U | U |
| Tidszone | https://minberegner.dk/tidszone | U | U |
| Alder | https://minberegner.dk/alder | U | U |
| Bil | https://minberegner.dk/bil | U | U |
| Brændstof | https://minberegner.dk/braendstof | U | U |
| Elbil vs. benzin | https://minberegner.dk/elbil | U | U |
| Elberegner | https://minberegner.dk/elberegner | U | U |
| Kvadratmeter | https://minberegner.dk/kvadratmeter | U | U |
| Temperatur | https://minberegner.dk/temperatur | U | U |
| Gennemsnit | https://minberegner.dk/gennemsnit | U | U |
| Brøkberegner | https://minberegner.dk/brok | U | U |
| Nedtælling | https://minberegner.dk/nedtaelling | U | U |
| Ohms lov | https://minberegner.dk/ohm | U | U |
| Vægt på planeterne | https://minberegner.dk/planetvaegt | U | U |
| Fartberegner | https://minberegner.dk/fart | U | U |
| Enhedsberegner | https://minberegner.dk/enheder | U | U |
| Del regningen | https://minberegner.dk/del-regning | U | U |
| Enhedspris | https://minberegner.dk/enhedspris | U | U |
| Rabatberegner | https://minberegner.dk/rabat | U | U |
| Valuta | https://minberegner.dk/valuta | U | U |
| Befordringsfradrag | https://minberegner.dk/befordringsfradrag | U | U |
| Solceller | https://minberegner.dk/solceller | U | U |
| Leasing | https://minberegner.dk/leasing | U | U |
| Gældsfri | https://minberegner.dk/gaeldsfri | U | U |
| Brutto/Netto | https://minberegner.dk/brutto-netto | U | U |
| Konfirmation | https://minberegner.dk/konfirmation | U | U |
| Bryllup | https://minberegner.dk/bryllup | U | U |
| Rejsebudget | https://minberegner.dk/rejsebudget | U | U |
| Vægttab | https://minberegner.dk/vaegttab | U | U |
| Terminsdato | https://minberegner.dk/termin | U | U |
| Ægløsning | https://minberegner.dk/aegloesning | U | U |
| Ugenummer | https://minberegner.dk/ugenummer | U | U |
| Flyttebudget | https://minberegner.dk/flyttebudget | U | U |
| Boligsalg | https://minberegner.dk/boligsalg | U | U |

## Kommerciel vurdering af eksisterende materiale

| Aktiv | Relevans for den foreslåede test | Begrænsning |
|---|---|---|
| Timeprisberegner | Eksisterende demonstrationsmateriale for bogholdere med freelancerkunder. Ferie, administration, sygdomsbuffer, transport, driftsudgifter og fakturerbare timer indgår allerede. | Betalingsvilje er ukendt. Beregneren tager udgangspunkt i nettoløn med fast 45 % skatteantagelse, ikke backloggens ønskede overskud før personlig skat. Den må ikke præsenteres som en præcis skatteberegning eller en færdig valideret pilotleverance. |
| Freelancerguide | `src/app/blog/saadan-finder-du-din-timepris-som-freelancer/page.tsx` findes allerede og indgår i sitemap på `src/app/sitemap.ts:94`. | Ingen dokumenterede søgeklik. En ny næsten identisk landingsside er ikke begrundet af inventaret. |
| Momsberegner | Nært beslægtet med selvstændiges bogføring; mulig supplerende demo eller senere partnerhenvisning. | Relevans er en hypotese, ikke en dokumenteret partneraftale eller provision. |
| Lån, bolig og energi | Kataloget har flere værktøjer med mulig rådgivnings- eller sammenligningsintention. | Ingen belæg for at skifte niche eller prioritere dem over timepris ud fra faktisk trafik. |
| Øvrige gratis værktøjer | Eksisterende indhold kan undersøges i en samlet trafikrapport uden ny udvikling. | Mange sider er ikke i sig selv dokumentation for volumen, annonceindtægt eller efterspørgsel. |

Beregningsgrundlaget for timepris er læst i `src/components/TimeprisBeregner.tsx:269–308`; det er ikke ændret eller fuldt korrekthedsrevideret i denne opgave.

## Hvad den eksisterende måling kan og ikke kan vise

- `src/lib/analytics.ts:30–45` sender kun events, hvis `window.plausible` findes. Implementeret tracking beviser hverken indsamling eller antal besøgende.
- `src/components/TimeprisBeregner.tsx:231–239` sender `beregning_udført` efter to sekunder på siden, uden at kræve brugerinput. Eventet kan derfor ikke alene fortolkes som aktiv beregning, lead eller køb.
- `src/lib/analytics.ts:69` beskriver affiliateklik. Et klik er ikke en godkendt provision.
- `src/components/NewsletterSignup.tsx:29–45` viser tilmeldingsintegration og fallback til en ekstern side. UI-status bliver også sat til success efter åbning af fallback. Det dokumenterer ikke en bekræftet abonnent eller en B2B-forespørgsel. Ingen formular er indsendt, og ingen abonnentdata er læst.

## Manglende dokumentation, før efterspørgsel kan afgøres

Dette er en overdragelse af databehov, ikke en ekstra udført backlogopgave:

1. Search Console: aggregeret sideeksport for det danske domæne, søgetype Web, perioden 2026-06-19–2026-09-16. Gem klik pr. præcis sideadresse og eksportdato. For `/timepris` suppleres med aggregeret intention: freelancer/selvstændig kontra lønmodtager. Begrænsede eller anonymiserede forespørgsler skal noteres; de synlige forespørgsler summerer ikke nødvendigvis til alle klik.
2. Plausible: samme periode og dansk domæne, side og kilde samt relevante events. Sidevisninger og timerbaserede events holdes adskilt fra bekræftede leads.
3. Leads: kun aggregerede, bekræftede virksomhedsforespørgsler pr. beregnerside, hvis attribution faktisk findes. Ukendt attribution markeres særskilt; nyhedsbrevstilmeldinger og affiliateklik tælles ikke som B2B-leads.
4. Ingen rå brugerinput, e-mails, kundelister, betalingsbilag eller adgangsnøgler i repoet. Senere kontrol af betalt pilot foretages efter stopreglens regler, ikke via eksport af persondata.

Stopreglens grænse på 100 relevante organiske Google-søgeklik til `/timepris` er ikke verificeret. Hvis markedstesten starter en anden dag, skal dens 90-dagesperiode genberegnes i stedet for ukritisk at genbruge inventarets datoer.

## Kontrol af denne kørsel

Kun denne dokumentationsfil tilføjes; programkode, konfiguration og den eksisterende stopregel ændres ikke.

- Kataloget er sammenholdt med lokale `src/app/*/page.tsx`-ruter. Der er 80 katalogposter inklusive to svenske specialberegnere.
- `npm run lint`: bestået, 336 filer, ingen rettelser.
- `npm run test`: nåede `RUN v4.1.11`, men timeout efter 90 sekunder uden testresultat. Ikke verificeret som bestået.
- `./node_modules/.bin/tsc --noEmit --incremental false`: timeout efter 90 sekunder uden output. Ikke verificeret som bestået.
- Fuldt build er fravalgt efter kørselsinstruksens mulighed for hurtigere kontrol og de tidligere dokumenterede build-timeouts i `BACKLOG.md:56`.
- Ingen push, deploy, mails, nye afhængigheder eller adgang til hemmeligheder.
