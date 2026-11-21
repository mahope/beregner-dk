# Beregner.dk

Next.js-beregnere til minberegner.dk, beraknare.se og beregner.no.

## Låneplan (annuitetslån og forbrugslån)

`src/components/LaaneplanBeregner.tsx` er den fælles låneberegner på
`/renteberegner` (variant `annuitet`) og `/forbrugslaan` (variant
`forbrugslaan`, kun dansk). Den regner ydelse, samlede renter, gebyrer og ÅOP,
viser annuitetslån og serielån side om side, en restgældsgraf, søjler med rente
og afdrag og en amortiseringsplan pr. år og måned. Matematikken ligger i
`src/lib/laaneplan.ts` (ÅOP løses med bisektion) og bygger på
`laanebeloeb.ts`; testene står i `laaneplan.test.ts`. Del-link bruger læsbare
parametre: `?beloeb=500000&rente=5&aar=30&stiftelse=1500&gebyr=25&type=annuitet`.
Skærmbilleder ligger i `docs/screenshots/annuitetslaan/`.

`/renteberegner` har kun denne ene beregner på dansk (den gamle `RenteBeregner`
bruges stadig på beraknare.se). Siden sætter `foldGebyrer`, så gebyrfelterne
ligger under "Gebyrer og ÅOP" (åbnes af et del-link med gebyr), og
`medBeloebTabel`, så tabellen "Hvor meget koster det at låne?"
(`LaanebeloebTabel`) følger de samme felter. Gamle del-links i formen
`?s=<base64>` (type `rente`) læses af `fraGammeltDelLink` og mappes til de nye
felter. Grafernes akser bruger `kortBeloeb` ("1 mio.", "500 t."), så øverste
tick ikke skæres af, også på mobil.

## AdSense

Annoncer er slået fra som standard. Ved build tænder
`NEXT_PUBLIC_ADSENSE_ENABLED=1` eller `true` for den manuelle annonceenhed,
hvis `NEXT_PUBLIC_ADSENSE_SLOT_RESULT` indeholder dens numeriske slot-id.
Sæt flaget til `0` og byg igen for at slå annoncerne fra. Brugere kan ændre
deres gemte valg under Cookieindstillinger i footeren.

Se [.env.example](.env.example) og [annonceopsætningen](docs/annoncer.md)
for placering, samtykke og Docker-build.
