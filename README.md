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

## Affiliate-links og sub-id

Alle affiliate-links går gennem `withSubid` (`src/lib/affiliate.ts`) via `AffiliateBox`, som
tilføjer et sub-id `mb.<side>.<placering>` (Adtraction `epi`, Partner-ads `uid`).
Hver `AffiliateBox` kræver et `placement`-prop. Format, kilder og hentning af
statistik pr. sub-id står i [docs/affiliate-subid.md](docs/affiliate-subid.md).

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

## Titler og direkte svar (GSC-løft, 21/11-2026)

Sider med høj placering og lav CTR har fået en titel, der matcher søgningen, og et
direkte svar øverst (kun minberegner.dk; beraknare.se er urørt):

- `/tidszone`: titel og svarblok "Hvilken tidszone er Danmark i?" (CET/CEST).
- `/dato`: titel dækker "dage mellem to datoer"; sæsonlinket til 1. december står i brødteksten.
- `/ugenummer`: titel "Hvilken uge er vi i?" og dagens ugenummer øverst (regnet pr. kald).
- `/boligstoette` ("uden login") og `/promille` ("promille beregner"): kun titel/beskrivelse.
- `/dage-til/1-advent`: titel med år, ugedag og dato (`buildDageTilMetadata`).

Tests: `src/lib/gsc-titler.test.ts`, `src/app/ugenummer/page.test.tsx`, `src/app/tidszone/page.test.tsx`.
