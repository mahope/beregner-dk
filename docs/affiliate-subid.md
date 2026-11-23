# Sub-id på affiliate-links

Alle affiliate-links får et sub-id, så netværkenes statistik viser klik og salg pr. side og pr. boks, ikke kun pr. site.

## Format

```
<site>.<side-slug>[.<placering>]
```

- `site`: `mb` (MinBeregner).
- `side-slug`: sidens sti med `/` til `-`, æ/ø/å til ae/oe/aa. `/dagpenge` giver `dagpenge`, `/blog/x` giver `blog-x`, forsiden giver `forside`.
- `placering`: boksens id, sat som `placement` på `AffiliateBox` (fx `akasse`, `forsikring`, `bilforsikring`, `sundhed`).
- Kun `[a-z0-9._-]`. Kun side og placering, aldrig bruger-id eller andre persondata.
- Eksempel: `mb.dagpenge.akasse`. Ved for lange værdier forkortes side-sluggen; placeringen bevares.

## Parameter pr. netværk

| Netværk | Parameter | Længdegrænse | Placering i URL | Kilde |
|---|---|---|---|---|
| Adtraction | `epi` (op til fem: `epi`…`epi5`; vi bruger kun `epi`) | 128 tegn | Før `url=` (deeplink skal stå sidst) | https://help.adtraction.com/en/articles/1563109-get-started-with-epi, https://adtraction.com/blog/what-is-epi-and-how-does-it-work |
| Partner-ads | `uid` (og `uid2`, ubrugt) | Ikke dokumenteret; vi holder os til 64 | Efter `bannerid`, men før `htmlurl=`; små bogstaver | https://www.partner-ads.com/dk/affiliate-svar.php?faqid=60 |

Før dette brugte alle Partner-ads-links `uid=minberegner`. Det erstattes af det nye sub-id, så ældre statistik ligger under `minberegner`, og nye data under `mb.…`.

## I koden

- `src/lib/affiliate.ts`: `withSubid(url, pathname, placement)` genkender netværket ud fra URL'en, indsætter parameteren (bevarer øvrige parametre og deeplinkets kodning) og rører ikke et link, der allerede har parameteren.
- `AffiliateBox` kalder `withSubid` på hvert link og sender den færdige URL til `trackAffiliateClick`. `placement` er et påkrævet prop.
- Links bygges med `partnerAdsLink(bannerId)` og `adtractionLink(programId, deeplink)`. Hårdkod ikke netværks-URL'er i komponenter eller indhold.
- `src/lib/affiliate.test.ts` fejler, hvis en netværks-URL står andre steder end i helper-filerne, eller hvis `AffiliateBox` ikke går gennem `withSubid`.
- Nyt netværk: tilføj det til `NETWORKS` og `detectNetwork` i `affiliate.ts`, med kilde til parameteren, og til værtslisten i testen.

## Hente statistik pr. sub-id

### Adtraction (API, token under Account > Settings)

Endpoint-stierne og felterne nedenfor er læst i dokumentationen (https://api.adtraction.com/), men ikke kaldt. Betragt dem som ubekræftede, til et første kald har vist de rigtige felt- og stinavne.

Basis: `https://api.adtraction.net/v2/` (dokumentation: https://api.adtraction.com/). Header `X-Token: <token>` (eller `?token=`).

- `POST /partner/statistics/epi/`: aggregeret pr. EPI. Krævede felter: `fromDate`, `toDate` (ISO 8601), `currency`, `market` (`DK`), `transactionStatus` (1 godkendt, 2 afventer, 3 begge). Valgfri: `programId`, `channelId`, `groupbyEpi` (standard `true`). Svaret indeholder pr. gruppe `clicks`, `clicksUnique`, `leads`, `sales`, `commission`, `orderValue`, `epc`, `aov`, `leadRatio`, `conversionRatio`. EPI-værdien pr. gruppe returneres sammen med tallene; kontrollér feltnavnet ved første kald, for dokumentationens svareksempel viser det ikke.
- `POST /partner/clicks/`: enkeltklik med felterne `epi`…`epi5`, `programId`, `clickDate`. Kan filtreres med `epi`.
- `POST /partner/transactions/`: enkelttransaktioner med `epi`…`epi5`. Kan filtreres med `epi`.
- Kanalen for MinBeregner er `2056156501` (`as=` i tracking-linkene).

### Partner-ads

Partner-ads har ingen offentlig API-dokumentation. Det, vi kan dokumentere:

- `uid` vises i Partner-ads' egne statistikker og salgsspecifikationer (kilde: FAQ ovenfor og https://www.amino.dk/blogs/affiliateguide/archive/2010/08/31/statistik-og-analyser-for-dine-affiliate-sider-s-229-dan-f-248-lger-du-med.aspx).
- Dataudtræk sker via menuen "Dataudtræk / API" i partnerlogin, hvor den personlige API-nøgle står. Tredjepartsværktøjer (fx Strackr, https://strackr.com/docs/partner-ads) henter transaktioner og klik derfra og eksponerer `uid` som sub-id.
- Hverken `programstat` eller et bestemt klikrapport-endpoint er bekræftet i offentlig dokumentation. Nichespejderen skal derfor starte med at åbne "Dataudtræk / API" i Partner-ads, notere endpoint og feltnavn for `uid` her i dokumentet, og først derefter bygge hentningen. Gæt ikke endpoints.

## Lifesum og Solvari på MinBeregner

| Side | Program | Placering | EPI |
|---|---|---|---|
| `/kalorier` | [Lifesum](https://adtraction.com/advertisers/1951492778) | Efter kalorie- og makroresultatet, ved alder fra 18 år | `mb.kalorier.lifesum` |
| `/solceller` | [Solvari DK](https://adtraction.com/dk/annoncorer/1888641530) | Afventer fungerende trackinglink til [tilbud på solceller](https://www.solvari.dk/solceller) efter et gyldigt solcelleoverslag | `mb.solceller.solvari` |

Boksene vises på dansk, når programmets trackinglink findes i `TRACKING_URLS`.
Lifesums basislink er hentet via `POST /v2/public/tracking/link/` i [Adtractions API](https://api.adtraction.com/) for MinBeregner-kanalen `2056156501`, program `1951492778` og annonce `1951492779`. For Lifesum gælder programmets begrænsninger for betalt trafik og søgeoptimering på brandnavnet.

For Solvari skal [partnerportalen](https://help.adtraction.com/en/articles/1563592-how-to-create-tracking-links) eller Adtraction levere et link til solcelletilbud for program `1888641530` og kanal `2056156501`. Når det består redirect-tjekket, gemmes basislinket i `src/lib/adtraction.ts`. Koden tilføjer deeplink og EPI.

### Klikbaseline

Førmåling for **16.–22. november 2026** (begge dage inklusive, Europe/Copenhagen). Rapportstatus registreret 23. november 2026.

| Placering (EPI) | Adtraction, kanal `2056156501` | Siteanalyse, `ad_clicked` |
|---|---|---|
| `mb.kalorier.lifesum` | Rapport utilgængelig fra agent-worker. Samlede og unikke klik ukendte. | Rapport utilgængelig fra agent-worker. Antal hændelser ukendt. |
| `mb.solceller.solvari` | Rapport utilgængelig fra agent-worker. Samlede og unikke klik ukendte. | Rapport utilgængelig fra agent-worker. Antal hændelser ukendt. |

Adtractions EPI-rapport returnerede HTTP 403 uden partnerlogin for begge programmer. Adgang til siteanalysen manglede ved gennemgangen. Ukendt registreres særskilt fra nul klik og fra en rapport uden en række for EPI'en. HTML-tjekket den 23. november viste, at de to produktionssider ikke havde Lifesum- eller Solvari-links i den hentede HTML.

Lige før deploy registreres antal klik (samlede og unikke) for de foregående syv hele dage i Adtraction, filtreret på MinBeregner-kanalen, program og hver af de to EPI'er. Samme periode registreres i Umami eller Plausible for `ad_clicked` på hver side med den tilsvarende EPI i `destination`. Notér periode, tidszone og om rapporten viser nul, mangler en række eller ikke er tilgængelig. Sammenlign med de første syv hele dage efter deploy og behold de to målekilder hver for sig.

### Redirect og live-tjek

QA den 23. november 2026 med GET uden cookies og særskilte QA-EPI'er:

- Lifesum: `ion.lifesum.com/t/t` gav HTTP 200 med en redirect-side, hvis meta-refresh peger til `lifesum.com/` (HTTP 200). Destinationen blev hentet direkte uden at køre redirect-sidens kode.
- Solvari: API'et returnerede annonce `1888641533`. Både kodet og ukodet deeplink til `www.solvari.dk/solceller` gav HTTP 302 fra `go.adt212.net/t/t` til `smartebesparelser.dk/page-adtraction-solceller/`. Det næste HTTP 301-hop sendte til `www.solvari.dk/smartebesparelser` (HTTP 200). Det er en generel overgangsside. Solvari-boksen holdes skjult, indtil et link fører til solcelletilbuddet.

1. Før deploy verificeres de links, der aktiveres. Kopiér de færdige URL'er fra lokale resultater. Erstat kun `epi` med henholdsvis `mb.kalorier.lifesum-qa` og `mb.solceller.solvari-qa`. Bevar Solvaris `url` sidst. Testklik kan blive registreret hos Adtraction. Hold QA-EPI'erne ude af rapporten for brugerklik.
2. Send en GET uden cookies til hvert testlink med `curl --proto '=https' --max-time 15 --silent --show-error --output /dev/null --write-out '%{http_code} %{redirect_url}\n' "$qa_url"`. Følg kun kendte HTTPS-destinationer ét hop ad gangen ud fra `Location`. Ved HTTP 200 med en redirect-side kan du læse sidens meta-refresh i svaret og hente den angivne destination direkte. Registrér statuskoder og slutvært/-sti uden click-ID eller cookies. Forvent Lifesums landingsside og Solvaris side for solceller. Stop ved landingssiden. Ingen formularer, tilmeldinger, køb, konverteringspixels eller JavaScript.
3. Efter en godkendt deploy åbnes `/kalorier` og `/solceller` på MinBeregner i mobil- og desktopbredde. Kontrollér annonceetiket, tastaturfokus og læserækkefølge samt de faktiske `href`- og `rel`-attributter. Tjek at Lifesum skjules under 18 år, også via et delingslink, og at PVGIS fortsat har sit redaktionelle link. Når Solvari er aktiveret, tjekkes også, at annoncen forsvinder ved tomt årligt elforbrug. Kontrollér svensk og norsk visning.
4. Sammenlign produktionssidernes URL'er med de lokale, verificerede URL'er. Hvis redirect skal testes igen, brug QA-EPI og proceduren ovenfor. Efter Adtractions rapportforsinkelse kontrolleres QA-klikkene og dernæst brugerklik på de to normale EPI'er. Lokale komponenttests verificerer `ad_clicked` ved aktivering af linket. Det almindelige produktionslink behøver derfor ikke et manuelt klik til smoke-testen.
