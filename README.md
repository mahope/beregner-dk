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

## Barselsdagpenge

`/barselsdagpenge` er sitets eneste barselsberegner (én beregner pr. side).
Den regner for lønmodtagere (fuldtid/deltid), selvstændige og ledige, med løn
under barsel fra arbejdsgiveren, fordeling af ugerne mellem mor og far/medmor
(11 øremærkede uger pr. forælder, op til 13 uger kan overdrages) og et skøn over
beløbet efter skat.

- Beregning og regler: [`src/lib/barselsdagpenge.ts`](src/lib/barselsdagpenge.ts)
  (genbruger `ugesats()` og skatteestimatet fra barselsplanlæggeren).
- Satser og kilder med dato: `BARSEL_2026` i `src/lib/satser-2026.ts`
  (Borger.dk, barselsloven). Regelgrundlag: [docs/barsel/regler-2026.md](docs/barsel/regler-2026.md).
- Tests: `src/lib/barselsdagpenge.test.ts` (kendte eksempler) og `src/app/barselsdagpenge/page.test.tsx`.
- Annoncer: kun godkendte programmer, mærket "Annonce". A-kasse-boksen bruger ASE
  (Adtraction, `src/lib/adtraction.ts`). Det Faglige Hus er ikke godkendt til denne side.
- Skærmbilleder (desktop, mobil, mørk): [docs/screenshots/barselsdagpenge/](docs/screenshots/barselsdagpenge/).
