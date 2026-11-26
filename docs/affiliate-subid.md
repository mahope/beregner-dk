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
