# Annoncer på MinBeregner.dk

AdSense er begrænset til én manuel annonce på 250 × 250 px under
beregnerresultatet på `/dato`, `/afstand-mellem-adresser`, `/tidsberegner` og
`/kvadratmeter`. På tidsberegneren og kvadratmetersiden ligger annoncen efter
sidens sidste værktøj. De fire sider har Google-trafik og ingen affiliatebokse.
Placeringerne godkendes via `ADSENSE_PAGES` i `src/lib/ads.ts`. Kun det danske
site bruger annonceenheden.

Scriptet indlæses først efter accept i det danske cookiebanner. Banneret og
annonceenheden følger samtykkeændringer på tværs af åbne faner. Tidligere
afslag gælder stadig. Tidligere accept før teksten om Googles annoncecookies
kræver et nyt valg. Annonceenheden beder om ikke-personaliserede annoncer.
Google kan levere et begrænset udvalg afhængigt af trafikken og kontoens
indstillinger. [Googles krav til samtykkeplatforme](https://support.google.com/adsense/answer/13554116).

## Aktivering og slukning

1. Opret én manuel displayannonce på 250 × 250 px i AdSense, når sitet er
   godkendt. Hold Auto ads slået fra for sitet i AdSense, inklusive
   ankerannoncer og vignetter. Den indstilling styres i AdSense-kontoen.
2. Sæt `NEXT_PUBLIC_ADSENSE_ENABLED` til `1` eller `true`, og sæt
   `NEXT_PUBLIC_ADSENSE_SLOT_RESULT` til annoncens numeriske slot-id.
   Dockerfile tager begge værdier som build-args. Next.js indlejrer dem ved
   build, så en ændring af runtime-miljøet alene ændrer ikke annoncerne.
3. Sæt `NEXT_PUBLIC_ADSENSE_ENABLED=0` ved næste build for at slå alle
   AdSense-enheder og scriptet fra. Uden et gyldigt slot-id forbliver
   annoncerne også slået fra.
