# Annoncer på MinBeregner.dk

AdSense er begrænset til én manuel annonce på 250 × 250 px under
beregnerresultatet på `/dato`, `/afstand-mellem-adresser`, `/tidsberegner` og
`/kvadratmeter`. På tidsberegneren og kvadratmetersiden ligger annoncen efter
sidens sidste værktøj. De fire sider har Google-trafik og ingen affiliatebokse.
Placeringerne godkendes via `ADSENSE_PAGES` i `src/lib/ads.ts`. Kun det danske
site bruger annonceenheden. Derfor omtaler kun det danske cookiebanner
Googles annoncecookies.

På det danske site indlæses annoncescriptet først efter accept i det danske cookiebanner. Banneret og
annonceenheden følger samtykkeændringer på tværs af åbne faner. Banneret
gemmer valget i `mb_cookie_consent_v2`. Cookieindstillinger i footeren åbner
banneret igen. Afvis gemmer afslaget og fjerner annonceenheden og dens script.
Hvis browseren afviser at gemme afslaget, forsøger siden at fjerne det tidligere
samtykke. Hvis det også fejler, bliver indstillingerne stående med en fejlbesked.
Siden genindlæses ved tilbagetræk, hvis Google-scriptet stadig er ved at indlæse
eller allerede er kørt, også ved tilbagetræk i en anden fane. En afvist
scriptindlæsning kræver ingen genindlæsning. Tidligere valg på v1-nøglen udløser
et nyt spørgsmål. Annonceenheden beder om ikke-personaliserede annoncer.
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
   AdSense-enheder og det danske annoncescript fra. Verifikationsscriptet på
   beraknare.se påvirkes ikke af flaget. Uden et gyldigt slot-id forbliver
   annoncerne også slået fra.

## Verifikation af beraknare.se

`src/app/layout.tsx` lægger publisherscriptet (`adsbygoogle.js?client=ca-pub-1902871361369866`)
i `<head>` på alle sider på beraknare.se, også når `NEXT_PUBLIC_ADSENSE_ENABLED=0`.
Det er kun verifikation: annonceenheder (`ins.adsbygoogle`) kommer stadig kun fra
`AdBanner.tsx` og kræver flag, slot og samtykke. Scriptet indlæses uden samtykke,
fordi AdSense skal kunne finde det. Auto ads (inkl. ankerannoncer og
vignetter) skal være slået fra for beraknare.se i AdSense, og også som
kontostandard for nye sites: ellers kan Google placere annoncer, der omgår både
flaget og samtykket. Fjern `hasAdSenseVerificationScript` i
`src/lib/ads.ts`, hvis sitet ikke skal bære scriptet efter godkendelse.
`public/ads.txt` indeholder publisher-linjen og serveres på alle domæner.

## Samtykkeløsning (CMP)

Begge sites bruger en hjemmebygget banner (`src/components/CookieConsent.tsx`,
`src/lib/cookie-consent.ts`, nøgle `mb_cookie_consent_v2` i localStorage), ikke
en Google-certificeret CMP. Googles krav:
https://support.google.com/adsense/answer/13554116. Overgang til Googles egen
«Privatliv og meddelelser»: opret en EU-samtykkemeddelelse for begge sites i
AdSense, fjern den egne banner og samtykke-gating af annoncescriptet, og lad
Google styre samtykket. Analytics (Plausible, Umami) skal afklares separat.
