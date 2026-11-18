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
