# Nichetest: timepris for nye freelancere

Dato: 2026-09-17. Opgave: [P1] [S] Vælg én testniche.

## Beslutningskriterier fastlagt før kildevurdering

Målgruppen er nye danske freelancere og soloselvstændige; en mulig betalende kunde er bogholderen eller rådgiveren.

Et konkret hul kræver, at de undersøgte løsninger ikke samlet hjælper brugeren med at:

1. Trække ferie fra årets disponible arbejdstid.
2. Trække administration og anden ikke-fakturerbar tid fra.
3. Beregne realistiske fakturerbare timer og omsætte dem til nødvendig timepris med et synligt beregningsgrundlag.

Hvis en eksisterende tilgængelig løsning allerede dækker alle tre punkter forståeligt, droppes den brede vinkel om ferie, administration og fakturerbare timer som differentiering. En pænere brugerflade er ikke et dokumenteret hul. Manglende oplysninger i et tekstudtræk markeres ukendt, ikke som en manglende funktion. Et eventuelt smallere hul er kun en hypotese og giver ikke tilladelse til udvikling uden stopreglens signal A eller B.

Undersøg fem relevante danske søgeresultater og læs deres destinationssider. Ingen påstand om Google-topplaceringer, søgevolumen, trafik eller betalingsvilje uden dokumentation.

## Resultat: drop den brede differentieringsvinkel

**Ferie, administration og fakturerbare timer er allerede dækket. Byg ikke en ny timeprisberegner med disse som eneste salgsargument.** Hverdagstal forklarer alle tre led og viser formlerne; Factofly kombinerer feriedage med fakturerbare ugentlige timer og forklarer administration. Der er ikke dokumenteret et tilstrækkeligt hul til at genåbne udviklingen.

## Fem undersøgte danske søgeresultater

Søgning: `timepris beregner freelancer` i Brave Search, 2026-09-17. Fem forskellige destinationssider blev læst som tekstudtræk. MinBeregner blev udeladt som eget produkt; TimeTrack blev udeladt fra konkurrentudvalget, da det indgår i Mads' værktøjskontekst. Udvalget er ikke en Google-top-5 eller en rangliste. Ingen formularer blev indsendt, og beregnernes JavaScript blev ikke funktionstestet.

| Resultat | Ferie | Administration | Fakturerbare timer og beregningsgrundlag |
|---|---|---|---|
| Factofly | Felt til årlige feriedage | Forklarer, at administration, netværk og salg skal finansieres af fakturerbar tid | Ugentligt timeinput, årligt timeresultat, udgifter, pension og buffer. Brugeren skal selv anslå den fakturerbare uge. |
| Proberegner | Nævnt i FAQ | Nævnt i FAQ | Årlige fakturerbare timer indtastes direkte. Synlig formel og eksempel: (500.000 + 100.000) / 1.200 = 500 kr./time. Ingen separat nedbrydning af timer observeret. |
| Kontolink | Guide med feriepenge og årlig arbejdstid | Særskilt afsnit om skjulte arbejdstimer | Forklarer 60–70 % fakturerbar tid og viser et timepriseksempel. Excel-download findes, men arket er ikke undersøgt. |
| Calcly | Input til arbejdsuger pr. år og omtale af ferie | Forklarer ikke-fakturerbar tid | Ugentlige fakturerbare timer, månedsløn og overhead. Beskriver årsbehov divideret med fakturerbare årstimer; brugeren anslår selv timerne. |
| Hverdagstal | Vejleder i at fratrække feriedage fra arbejdsdage | Forklarer salg, administration og transport ved timeinput | Viser arbejdsdage × fakturerbare timer pr. dag × (1 − buffer), derefter indkomstbehov og omkostninger divideret med timerne. Dækker den afprøvede vinkel samlet i felter og forklaring. |

Kilder, alle læst 2026-09-17:

- [Factofly: Beregn din freelance timepris](https://www.factofly.com/beregn-timepris/).
- [Proberegner: Timepris-beregner](https://www.proberegner.dk/beregnere/timepris-beregner/).
- [Kontolink: Hvad skal jeg tage i timen?](https://kontolink.com/blog/tage-i-timen-selvstaendig-freelancer/).
- [Calcly: Freelancer Prisberegner](https://calcly.dk/da/arbejde-freelance/freelancer-pris).
- [Hverdagstal: Timepris-beregner](https://hverdagstal.dk/beregner/timepris-freelancer.html).

Google gav kun en JavaScript-omdirigering, DuckDuckGo en botudfordring og Bing irrelevante resultater. Brave gav relevante links; automatiske svarbokse blev ikke brugt som faktagrundlag. Defuddle ramte 45 sekunders timeout på destinationssiderne; WebFetch leverede derefter læsbare udtræk.

## Kommerciel konsekvens og begrænsninger

Den brede nichevinkel droppes som begrundelse for ny udvikling, ikke som bevis for at ingen freelancer har behovet. En brandet beregner hos en bogholder kan stadig være et serviceprodukt, men denne undersøgelse dokumenterer hverken en køber, en partner eller betalingsvilje. Der fastsættes ingen markedspris eller forventet indtjening ud fra konkurrenternes vejledende timepriser.

Hverdagstals synlige formler opfylder kriteriet om en forklaret kapacitetsberegning; det er ikke en godkendelse af skatteantagelser, standardsatser eller alle sidens økonomiske udsagn. Calclys brug af netto-begrebet og Kontolinks afrundede eksempler er heller ikke valideret som rådgivning. Konkurrenternes vejledende faktureringsgrader er antagelser, ikke dokumenterede branchedata.

Den lokale beregner har allerede ferie, administration og fakturerbare timer i `src/components/TimeprisBeregner.tsx:269–299`. Dens faste skatteantagelse på 45 % er læst, men ikke ændret. Klarere forklaring af overskud før personlig skat kunne være en kvalitetshypotese, men er ikke i sig selv et dokumenteret markedshul eller en bestilling på en P2-opgave.

Stopreglen i `BACKLOG.md:11–51` er uændret: ny udvikling forbliver på pause. Denne konkurrentundersøgelse er ikke signal A eller B, starter ikke automatisk markedstestens frist og registrerer ikke en 90-dagesparkering. Inventaret gentages ikke; se `docs/kommercielt-inventar.md` for trafikstatus.

## Kontrol

Kun denne dokumentationsfil er tilføjet. Alle fem destinationssider er læst, og vurderingen er holdt op mod de på forhånd fastlagte kriterier. Ingen produktion, mails, installationer eller hemmeligheder er berørt.

- `npm run lint`: bestået, 336 filer, ingen rettelser.
- `npm run test`: nåede Vitest `RUN v4.1.11`, men timeout efter 90 sekunder uden testresultat. Ikke verificeret som bestået.
- `./node_modules/.bin/tsc --noEmit --incremental false`: timeout efter 90 sekunder uden output. Ikke verificeret som bestået.
- Fuldt build fravalgt for denne dokumentationsopgave efter kørselsinstruksens mulighed for hurtigere kontrol. Tidligere build-, test- og typecheck-timeouts er allerede dokumenteret i `BACKLOG.md:56` og `docs/kommercielt-inventar.md:145–150`; programkode og konfiguration er uændret i denne kørsel.
