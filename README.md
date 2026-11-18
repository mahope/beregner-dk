# Beregner.dk

Next.js-beregnere til minberegner.dk, beraknare.se og beregner.no.

## AdSense

Annoncer er slået fra som standard. Ved build tænder
`NEXT_PUBLIC_ADSENSE_ENABLED=1` eller `true` for den manuelle annonceenhed,
hvis `NEXT_PUBLIC_ADSENSE_SLOT_RESULT` indeholder dens numeriske slot-id.
Sæt flaget til `0` og byg igen for at slå annoncerne fra. Brugere kan ændre
deres gemte valg under Cookieindstillinger i footeren.

Se [.env.example](.env.example) og [annonceopsætningen](docs/annoncer.md)
for placering, samtykke og Docker-build.

## Kreditbokse og repræsentative eksempler

Kreditbokse (`AffiliateBox` med `credit`) viser advarslen "Advarsel! Det
koster penge at låne penge." Rente, ÅOP og beløb for en navngiven långiver må
kun vises som långiverens eget offentliggjorte repræsentative eksempel
(markedsføringsloven § 18 fra 20. november 2026). Eksemplerne ligger i
[`src/lib/kredit-eksempler.ts`](src/lib/kredit-eksempler.ts) med kilde-URL og
`hentet`-dato og vises med "Eksemplet er hentet fra [långiver] den [dato]".
Har en långiver intet offentliggjort eksempel, står `eksempel: null`, og siden
viser kun navn og link.

`kredit-eksempler.test.ts` fejler, når et eksempel er mere end 90 dage
gammelt. Hent da tallene igen fra kildesiden og opdatér `hentet`, eller sæt
`eksempel: null`. Det svenske site viser ingen kreditbokse eller långivertal.
