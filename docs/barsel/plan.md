# Barselsplanlægger — plan

Mål: Danmarks bedste gratis barselsplanlægger på `/barselsplanlaegger` (kun dansk locale).
Regler og satser: se [`regler-2026.md`](./regler-2026.md). Alt regelindhold i koden henviser dertil.

## Principper

- **Ren TS-regelmotor** i `src/lib/barsel/` uden React. UI'et er et tyndt lag ovenpå.
- **Uger som enhed.** Uge 0 starter på fødsels-/termins-/modtagelsesdatoen, uge −4 er første
  uge af graviditetsorloven. Datoer er ISO-strenge regnet i UTC (ingen sommertidsfejl).
- **Perioder som runs.** Hver forælder har en liste af perioder `{start, slut, type, arbejdsProcent?}`
  med typerne `orlov`, `deltid` og `ferie`. Arbejde er standard. Redigering udvider til et
  ugekort, ændrer og komprimerer igen (`perioder.ts`).
- **Kategorier beregnes, vælges ikke.** Brugeren siger "orlov"; motoren fordeler ugerne på
  graviditet → øremærket → egne delbare → overført fra den anden forælder → uden ret. Det giver
  farverne i kalenderen og tællerne i valideringen.
- **Intet forlader browseren.** localStorage (versioneret) + valgfrit del-link i URL-hash.
- **Ingen nye afhængigheder.** Kalender, graf og komprimering er håndbygget / native.

## Datamodel (`types.ts`)

```
BarselsPlan {
  konstellation: mor-far | mor-medmor | to-foraeldre | solo | adoption-par | adoption-solo
  datoType: termin | foedsel
  dato: YYYY-MM-DD
  antalBoern: 1..4
  indlaeggelsesUger: number
  kommuneskatPct: number
  foraeldre: Foraelder[1..2]
}
Foraelder {
  id: a | b, navn, beskaeftigelse: loenmodtager | selvstaendig | ledig | studerende,
  maanedsloen, ugentligeTimer, loenUnderBarsel: {uger, procent}[],
  ydelseMaaned (a-dagpenge/SU), udskudteUger, perioder: Periode[]
}
```

Lagring: `{ v: 1, gemt: ISO-tid, plan }` under nøglen `minberegner:barselsplan`.

## Moduler

| Fil | Ansvar |
|---|---|
| `regler.ts` | Konstanter med kilde (fra regler-2026.md) + `rettigheder(plan)` pr. forælder og konstellation |
| `motor.ts` | `analyserPlan(plan)`: uge-for-uge-klassifikation, forbrug pr. kategori, overførsler, valideringsbeskeder (fejl/advarsel/info) og varslingsfrister |
| `oekonomi.ts` | Indkomst pr. uge → pr. måned pr. forælder (løn / løn under barsel / barselsdagpenge / ydelse), normal løn, tab |
| `netto.ts` | Vejledende netto (AM-bidrag på løn, gennemsnitlig kommuneskat, bundskat, mellem-/topskat) |
| `skabeloner.ts` | Standardplaner: Klassisk, Lige deling, Maksimal tid sammen, Solo-standard |
| `arbejdsgiver.ts` | Høflig besked pr. forælder med præcise datoer og typer + varslingsnote |
| `ics.ts` | RFC 5545-eksport (heldagsbegivenheder, foldning, escaping) |
| `storage.ts` | Versioneret localStorage med migrering/sanering og try/catch |
| `del-link.ts` | Komprimeret del-link (CompressionStream deflate-raw + base64url) |
| `dato.ts` | Dato-hjælpere og dansk datoformat |

## Komponenter (`src/components/barsel/`)

- `BarselPlanlaegger.tsx` — klient-rod. `useReducer` over `BarselsPlan`; hydrerer fra hash eller
  localStorage efter mount (skeleton med fast højde indtil da → ingen layout-shift); autosave
  debounced.
- `Opsaetning.tsx` — konstellation (kort-knapper), dato, antal børn, indlæggelse; forældrekort
  med navn, beskæftigelse, løn, timer, løn under barsel (segmenter), udskudte uger.
- `Skabeloner.tsx` — start fra standardplan.
- `UgeKalender.tsx` — uge-for-uge-gitter: ét kort pr. uge med en række pr. forælder side om side.
  Pensel-værktøj (Orlov / Deltid x % / Ferie / Arbejde). Klik eller Enter/mellemrum maler;
  piletaster flytter fokus (roving tabindex). Shift+klik maler et interval.
- `MaanedKalender.tsx` — månedsvisning med dage farvet pr. forælder.
- `PeriodeEditor.tsx` — dato-/ugebaseret formular + liste over perioder med slet. Fuldt
  brugbar på mobil og med tastatur uden gitteret.
- `Validering.tsx` — tællere pr. kategori og beskeder.
- `Oekonomi.tsx` — SVG-søjlediagram (husstand pr. måned, stablet pr. forælder) + tabel + tab.
- `Arbejdsgiver.tsx` — kopiér / del / .ics pr. forælder + varslingsfrister.
- `PrintOversigt.tsx` — print-only A4-oversigt; print-CSS i `barsel-print.css`.

## Trin

1. Research → `regler-2026.md` (commit).
2. Plan (denne fil) + lib-kerne med tests: dato, perioder, regler/motor, økonomi, netto,
   arbejdsgiver, ics, storage, del-link (commit pr. delkomponent).
3. UI-komponenter + side `/barselsplanlaegger` + page-data + registreringer (commit).
4. Links fra `/barselsdagpenge` og blogindlæg (commit).
5. Gate: `npm test`, `npm run lint`, `npm run build`, `next start` + browsertjek ved 360/1280 px,
   print-emulering, screenshots, egen kritik → rettelser (commit), push.

## Tests (vitest)

- `regler.test.ts` / `motor.test.ts`: rettigheder for hver konstellation; overførsler og loft;
  flerfødsel; indlæggelse; tabte øremærkede uger; far/medmors 2 uger i de første 10 uger;
  mors 2 obligatoriske uger; overlap; orlov efter 1 år; varslingsfrister.
- `oekonomi.test.ts`: dagpengeloft, løn under barsel-segmenter, deltid, månedsfordeling, tab.
- `netto.test.ts`: AM-bidrag kun på løn, 0 kr → 0 kr, monotoni.
- `storage.test.ts`: gem/indlæs, korrupt JSON, fremtidig version, migrering af ældre/ufuldstændig data,
  localStorage der kaster.
- `arbejdsgiver.test.ts`: datoformat ("mandag den 4. januar 2027"), perioder og typer.
- `ics.test.ts`: CRLF, DTEND eksklusiv, escaping, foldning.
- `del-link.test.ts`: rundtur.
