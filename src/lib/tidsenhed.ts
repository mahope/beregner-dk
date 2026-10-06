/**
 * Omregn minutter til timer — og timer til minutter.
 *
 * Det er svaret på «omregn minutter til timer», som `/tidsberegner` ikke
 * kunne give: siden havde brødteksten og tabellen `MINUTTER_TILL_TIMMAR`,
 * men intet værktøj, så «omregn 145 minutter til timer» krævede at læseren
 * selv dividere.
 *
 * Målt 6/10 22:5x, dansk autocomplete (hl=da gl=dk) under «omregn minutter
 * til timer»: 8 af 8 træffere er selve opgaven — «omregn 25 minutter til
 * timer», «omregn 145 minutter til timer», «omregn 180 minutter til timer»
 * og «omregn timer og minutter til decimal». GSC har samme billede for
 * siden: «tid beregner» (132 visninger, pos. 6), «time beregner» (90, pos. 8)
 * og «beregn tid» (88, pos. 6) på 79.260 visninger og 0,2 % CTR.
 *
 * **Der er ingen dato** i regnestykket, kun varigheder, så sommer-/
 * vintertid er ude af formlen — samme begrundelse som `plus-tid.ts`.
 *
 * Modulet rummer **kun tal** (C73's R4): al tekst ligger i komponentens
 * sproggrene og i `page.tsx`, så dansk ikke kan lække til beraknare.se.
 */

const MINUTTER_PER_TIME = 60;
const MINUTTER_PER_DOEGN = 24 * 60;

export interface TidsenhedResultat {
  /** Hele timer, fortegnet. `-90` minutter giver `-1` time og `-30` minutter. */
  timer: number;
  /** Resten i minutter, fortegnet, så tallene altid summerer til indgangen. */
  minutter: number;
  /** Hele minutter, fortegnet. */
  totalMinutter: number;
  /** I decimaltimer med to decimaler, 90 minutter = 1,5. */
  decimalTimer: number;
  /** Hele sekunder, fortegnet. */
  sekunder: number;
  /** Hele døgn, 1.500 minutter = 1,04. */
  heleDoegn: number;
}

function byg(totalMinutter: number): TidsenhedResultat {
  // `Math.trunc` mod `Math.floor`, så minustek får sit fortegn på timen og
  // ikke på resten: -90 minutter er -1 time og -30 minutter, ikke
  // -2 timer og +30 minutter. `trunc(-0,75)` er `-0`, og `-0` formatteres
  // som "-0" i nogle miljøer, så nul eksplicit sættes til 0.
  const heleTimer = Math.trunc(totalMinutter / MINUTTER_PER_TIME);
  return {
    timer: heleTimer === 0 ? 0 : heleTimer,
    minutter: totalMinutter - heleTimer * MINUTTER_PER_TIME,
    totalMinutter,
    decimalTimer: totalMinutter / MINUTTER_PER_TIME,
    sekunder: totalMinutter * MINUTTER_PER_TIME,
    heleDoegn: totalMinutter / MINUTTER_PER_DOEGN,
  };
}

function erTal(value: number): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Minutter ind, timer ud. Decimaler er tilladt, så «omregn 7,5 minutter»
 * svarer 7,5 sekunder; `null` betyder at feltet er tomt eller ugyldigt, så
 * UI'et kan vise en fejltilstand i stedet for et 0-tal der ligner et svar.
 */
export function minutterTilTimer(minutter: number): TidsenhedResultat | null {
  if (!erTal(minutter)) return null;
  return byg(minutter);
}

/**
 * Timer (med valgfri minutter) ind, minutter ud. Den anden vej i
 * «omregn timer og minutter», som brødteksten på siden lovede.
 */
export function timerTilMinutter(timer: number, minutter = 0): TidsenhedResultat | null {
  if (!erTal(timer) || !erTal(minutter)) return null;
  return byg(timer * MINUTTER_PER_TIME + minutter);
}

export interface TidsenhedEksempel {
  /** Nøgle, ikke tekst: overskrifterne er sprogafhængige og bor på siden. */
  id: "min25" | "min145" | "min180" | "min90" | "min1000" | "min1500" | "time05" | "time1t30";
  minutter: number;
  /** Timer-feltets startværdi, når læseren regner den anden vej. */
  timer?: number;
}

/**
 * Tal fra autocomplete og fra GSC (se modulens docblock): de tre konkrete
 * «omregn N minutter» er 25, 145 og 180 minutter, og de tal siden allerede
 * tabellerede er 90, 1.000 og 1.500 minutter. De er ikke valgt, fordi de er
 * pæne — de er valgt, fordi de er de søgninger, der kommer.
 */
export const TIDSENHED_EKSEMPLER: TidsenhedEksempel[] = [
  { id: "min25", minutter: 25 },
  { id: "min145", minutter: 145 },
  { id: "min180", minutter: 180 },
  { id: "min90", minutter: 90 },
  { id: "min1000", minutter: 1000 },
  { id: "min1500", minutter: 1500 },
  { id: "time05", minutter: 0, timer: 0.5 },
  { id: "time1t30", minutter: 0, timer: 1.5 },
];