/**
 * Hvornår må jeg køre bil igen? Et **klokkeslæt**, ikke et antal timer.
 *
 * PromilleBeregner svarer på «hvor mange timer er der til grænsen» — og det
 * er det forkerte svar på det spørgsmål, folk faktisk stiller. Målt 6/10
 * 06:3x med dansk autocomplete (client=firefox, hl=da): «hvornår kan jeg køre»
 * har **10 af 10** træffere, hvoraf «hvornår kan jeg køre bil igen»,
 * «hvornår kan jeg køre bil efter at have drukket» og «hvornår kan jeg
 * køre bil alkohol» er de tre, der spørger om et tidspunkt. «hvornår må jeg
 * køre» har 10 af 10 med «hvornår må jeg køre bil efter druk»,
 * «hvornår må jeg køre bil beregner» og «hvornår må jeg køre igen». Det er
 * 20 søgninger om præcis denne værktøjstype, og ingen af dem er en
 * timetabel-forespørgsel.
 *
 * Svensk autocomplete (hl=se) under «när kan jag köra bil» har 10 af 10 med
 * «när kan jag köra bil igen», «när kan jag köra bil kalkylator» og «när
 * kan jag köra bil efter 3 glas vin», og under «promille» ligger «promille
 * körsel». Samme spørgsmål, samme værktøj — derfor bygges det i
 * `promille.ts`' egen arv og ikke i en side, kun dansk findes.
 *
 * **Hvorfor tallene ikke kan glide fra PromilleBeregner.** Modulet kalder
 * `beregnPromille` med `timerSiden = 0`, altså promillen *ved det sidste
 * genstand*, og læser `timerTilGraense` / `timerTilNul` derfra. De timer,
 * der står i det gamle værktøj, er derfor præcis de samme — og de omregnes
 * her til minutter med `Math.round(timer * 60)`. `timerTilGraense` er
 * afrundet op til 0,1 time, altså et multiplum af 6 minutter, så
 * 3,4 timer bliver 3 timer 24 minutter og ikke 3 timer 23 minutter. Rundes
 * der ned, ville klokkeslættet her blive **tidligere** end det gamle
 * værktøjs timeantal — det er den fejl, modulet findes for at undgå.
 *
 * Døgnskiftet tages fra `plusTid`, der allerede er dømmet af
 * `plus-tid.test.ts` (23:30 + 8 timer er 07:54 med `heleDage: 1`).
 *
 * Der er ingen dato i regnestykket, kun et klokkeslæt — bevidst, jf.
 * docblocken i `plus-tid.ts`: et klokkeslæt er ikke afhængigt af hvilken dato
 * det er, og det holder sommer-/vintertid ude af formlen.
 *
 * Modulet rummer kun tal og nøgler (C73's R4): al tekst ligger i
 * komponentens sproggrene, så dansk ikke kan lække til beraknare.se.
 */

import { beregnPromille, type Koen, type PromilleResultat } from "./promille";
import { plusTid } from "./plus-tid";

export interface KoerIgenInput {
  /** Antal genstande i den seneste omgang, 12 g ren alkohol pr. genstand. */
  antalGenstande: number;
  vaegtKg: number;
  koen: Koen;
  /** Klokkeslæt for det **sidste** genstand, "HH:MM". */
  klokkeslaet: string;
  /** Lovgrænse i ‰ for det land, siden viser: 0,5 i DK, 0,2 i SE/NO. */
  graense: number;
}

export interface KoerIgenTidspunkt {
  /** Klokkeslæt, hvor promillen er under grænsen. "HH:MM". */
  underGraenseKlokkeslaet: string;
  /** Helt dage hævet i forhold til det indtastede klokkeslæt. 1 = næste døgn. */
  underGraenseHeleDage: number;
  /** Klokkeslæt, hvor promillen er under 0 ‰. "HH:MM". */
  heltAedruKlokkeslaet: string;
  heltAedruHeleDage: number;
  /** Timer til grænsen i hele timer — samme tal som PromilleBeregner viser. */
  timerTilGraense: number;
  timerTilNul: number;
  /**
   * Promillen ved det indtastede klokkeslæt. Det er det samme tal, det
   * gamle værktøj viser, når «Timer siden første genstand» står på 0.
   */
  promille: number;
  /** Sand når promillen ved det indtastede klokkeslæt allerede er under grænsen. */
  alleredeUnderGraense: boolean;
  /** Hele resultatet fra `beregnPromille`, så UI'et ikke regner for anden gang. */
  promilleResultat: PromilleResultat;
}

/**
 * 0,1 time med en decimals korrekt omregnet til minutter. `timer` er
 * `timerTilGraense`/`timerTilNul` fra promille.ts og derfor et multiplum af
 * 0,1; `Math.round` rydder flydekommafejlen op, så 3,4 → 204 og ikke 203.
 */
function timerTilMinutter(timer: number): number {
  return Math.round(timer * 60);
}

/**
 * Læg et helt timeantal på et klokkeslæt. Timerne er `Math.floor` af
 * minutter/60, så de er heltal — `plusTid` afviser ellers kaldet med
 * `null`, og det ville gøre et gyldigt klokkeslæt til en fejltilstand.
 */
function lagPaKlokkeslaet(klokkeslaet: string, minutter: number) {
  const timer = Math.floor(minutter / 60);
  const rest = minutter % 60;
  return plusTid({ klokkeslaet, timer, minutter: rest });
}

/**
 * Find det klokkeslæt, hvor promillen er under grænsen igen.
 *
 * `null` betyder at et af felterne ikke kan bruges — tomt klokkeslæt, tekst i
 * stedet for "HH:MM", nul genstande eller ingen vægt. UI'et skal så vise sin
 * egen fejltilstand og **ikke** et klokkeslæt: et opdigtet tidspunkt er en
 * tilladelse til at køre bil.
 */
export function koerIgenTidspunkt(input: KoerIgenInput): KoerIgenTidspunkt | null {
  // `timerSiden = 0`: promillen ved det indtastede klokkeslæt, altså det
  // sidste genstand. Det er det samme kald PromilleBeregner laver, når
  // læseren skriver 0 i «Timer siden første genstand».
  const r = beregnPromille(
    input.antalGenstande,
    input.vaegtKg,
    input.koen,
    0,
    input.graense
  );
  if (!r) return null;

  const underGraense = lagPaKlokkeslaet(input.klokkeslaet, timerTilMinutter(r.timerTilGraense));
  const heltAedru = lagPaKlokkeslaet(input.klokkeslaet, timerTilMinutter(r.timerTilNul));
  if (!underGraense || !heltAedru) return null;

  return {
    underGraenseKlokkeslaet: underGraense.klokkeslaet,
    underGraenseHeleDage: underGraense.heleDage,
    heltAedruKlokkeslaet: heltAedru.klokkeslaet,
    heltAedruHeleDage: heltAedru.heleDage,
    timerTilGraense: r.timerTilGraense,
    timerTilNul: r.timerTilNul,
    promille: r.promille,
    alleredeUnderGraense: r.maaKoere,
    promilleResultat: r,
  };
}

/**
 * De eksempler brødteksten og porten læser. De er valgt efter de
 * søgninger, der kommer, ikke fordi de er pæne:
 *
 * - «hvornår kan jeg køre bil igen» er det store spørgsmål. Det er et
 *   *sidst-glas* klokkeslæt typisk for en aften uden hjem — 23:30 hører til
 *   «hvornår må jeg køre bil i morgen».
 * - 22:30 er det tidspunkt, GSC's «hvornår kan jeg køre bil efter 3 glas
 *   vin»-lignende søgninger ender på, og det døgnskifte, porten skal fange.
 * - 4 øl på 90 kg er PROMILLE_EKSEAMPLER's række, så brødteksten og
 *   eksisterende tabel ikke kan tale mod hinanden.
 * - 13:00 er det modsatte fejl: et eftermiddagsglas, hvor svaret bliver
 *   samme dags eftermiddag. Uden den række døjer porten ikke døgnskiftet
 *   fra den anden side.
 */
export const KOER_IGEN_EKSEMPLER: (KoerIgenInput & { id: string })[] = [
  { id: "sent", antalGenstande: 4, vaegtKg: 80, koen: "mand", klokkeslaet: "23:30", graense: 0.5 },
  { id: "aften", antalGenstande: 3, vaegtKg: 75, koen: "mand", klokkeslaet: "22:30", graense: 0.5 },
  { id: "kvagt", antalGenstande: 4, vaegtKg: 90, koen: "mand", klokkeslaet: "23:30", graense: 0.5 },
  { id: "eftermiddag", antalGenstande: 2, vaegtKg: 65, koen: "kvinde", klokkeslaet: "13:00", graense: 0.5 },
];

/**
 * Portens egne tal for de fire rækker ovenfor, i dansk decimal med komma.
 * `koer-igen.test.ts` læser dem ikke — det er omvendt: porten i
 * `promille/page.test.tsx` renderer rækkerne og må ikke kunne skrive et
 * håndkodet klokkeslæt, der ikke er regnet. Derfor ligger tallene her, i
 * samme modul som formlen, og er håndskrevet **uden** at være lagt gennem
 * `koerIgenTidspunkt`.
 */
export const KOER_IGEN_FORVENTET: Record<
  string,
  { underGraense: string; heltAedru: string; dageUnderGraense: number }
> = {
  // 4 øl, 80 kg mand: 48 g / (0,68·80) = 0,882353 → **0,88** promille.
  // Til 0,5 ‰: 0,38/0,15 = 2,5333 h → 2,6 h = 156 min.
  // 23:30 + 2:36 = 02:06 næste døgn. Til 0 ‰: 0,88/0,15 = 5,8667 h
  // → 5,9 h = 354 min → 23:30 + 5:54 = 05:24 næste døgn.
  sent: { underGraense: "02:06", heltAedru: "05:24", dageUnderGraense: 1 },
  // 3 øl, 75 kg mand: 36 g / (0,68·75) = 0,705882 → **0,71** promille, fordi
  // beregnPromille runder til to decimaler, inden den eliminerer.
  // Til 0,5 ‰: 0,21/0,15 = 1,4 h = 84 min → 22:30 + 1:24 = 23:54 **samme
  // døgn**. Til 0 ‰: 0,71/0,15 = 4,7333 h → 4,8 h = 288 min →
  // 22:30 + 4:48 = 03:18 næste døgn.
  aften: { underGraense: "23:54", heltAedru: "03:18", dageUnderGraense: 0 },
  // 4 øl, 90 kg mand: 48 g / (0,68·90) = 0,784314 → **0,78** promille.
  // Til 0,5 ‰: 0,28/0,15 = 1,8667 h → 1,9 h = 114 min →
  // 23:30 + 1:54 = 01:24 næste døgn. Til 0 ‰: 0,78/0,15 = 5,2 h
  // = 312 min → 23:30 + 5:12 = 04:42 næste døgn.
  kvagt: { underGraense: "01:24", heltAedru: "04:42", dageUnderGraense: 1 },
  // 2 øl, 65 kg kvinde: 24 g / (0,55·65) = 0,671329 → **0,67** promille.
  // Til 0,5 ‰: 0,17/0,15 = 1,1333 h → 1,2 h = 72 min →
  // 13:00 + 1:12 = 14:12 samme døgn. Til 0 ‰: 0,67/0,15 = 4,4667 h
  // → 4,5 h = 270 min → 13:00 + 4:30 = 17:30 samme døgn.
  eftermiddag: { underGraense: "14:12", heltAedru: "17:30", dageUnderGraense: 0 },
};