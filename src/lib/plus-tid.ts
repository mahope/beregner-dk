/**
 * Læg tid til et klokkeslæt — og træk tid fra det.
 *
 * Det er det svar på «hvad er klokken om 8 timer» og «räkna timmar
 * framåt», som hverken /tidsberegner eller /tidszone kan give i dag:
 * TidsBeregner regner *imellem* to klokkeslæt, og ingen side i repoet
 * lægger en varighed *på* et klokkeslæt.
 *
 * Målt 6/10 05:1x, dansk autocomplete (hl=da gl=dk): «hvad er klokken om»
 * har **10 af 10** træffere i formen «hvad er klokken om N timer» med N =
 * 8, 12, 16, 9, 17, 18, 14, 15, 8, 19 — altså én spørgsmålstype, ikke
 * tilfældige varianter. Svensk autocomplete (hl=sv gl=se) under «räkna
 * timmar» har «räkna timmar framåt» og «plus tid sammen». Og GSC for
 * beraknare.se har «räkna timmar och minuter» (141 visninger) på pos. 10
 * plus «räkna tid» (121) på pos. 10, altså præcis de to søgninger, siden
 * ikke svarer på.
 *
 * Der er **ingen dato** i regnestykket, kun et klokkeslæt. Det er
 * bevidst: en varighed lagt på et klokkeslæt er uden betydning for hvilken
 * dato det er, og det holder sommer-/vintertid ude af formlen. Skal der
 * regnes på en bestemt dato, er det /dato's «dage mellem datoer» eller
 * TidsBeregner's datofelter.
 *
 * Modulet rummer **kun tal** (C73's R4): al tekst ligger i komponentens
 * sproggrene og i `page.tsx`, så dansk ikke kan lække til beraknare.se.
 */

import { beregnTidsinterval } from "./tidsberegner";

const MINUTTER_PER_DAG = 24 * 60;

export interface PlusTidInput {
  /** Klokkeslæt som det skrives i feltet, dvs. "HH:MM". */
  klokkeslaet: string;
  /** Hele timer. Kan være negativ (se `retning`). */
  timer: number;
  /** ekstra minutter, 0-59. Kan være negativ (se `retning`). */
  minutter?: number;
}

export interface PlusTidResultat {
  /** Klokkeslættet efter sammenlægningen, altid "HH:MM" i 00-23. */
  klokkeslaet: string;
  timer: number;
  minutter: number;
  /**
   * Helt dage hævet eller sænket. +1 når resultatet lander næste dag,
   * −1 når det lander dagen før, 0 når det bliver samme dags klokkeslæt.
   */
  heleDage: number;
  /** Den tilsatte (eller trukne) tid i decimaltimer. */
  decimalTimer: number;
  /** Den tilsatte (eller trukne) tid i minutter, fortegnet. */
  totalMinutter: number;
  /** Sand når klokkeslættet ikke er det samme døgn som starten. */
  overMidnat: boolean;
}

/**
 * Modulo, der altid giver et tal i 0-1439. En ren `%` giver negativ
 * resultat, og det er den fejl klassen af fund fra tidszone-tabellen
 * (8/10) kommer af: et negativt klokkeslæt er ikke et klokkeslæt.
 */
function normaliserModDag(totalMinutter: number): number {
  return ((totalMinutter % MINUTTER_PER_DAG) + MINUTTER_PER_DAG) % MINUTTER_PER_DAG;
}

/** 615 → "10:15". Uden for [0, 1439] er resultatet ikke et klokkeslæt. */
export function formatKlokkeslaet(minutter: number): string {
  const timer = Math.floor(minutter / 60);
  const rest = minutter % 60;
  return `${String(timer).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function parseKlokkeslaet(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const timer = Number(match[1]);
  const minutter = Number(match[2]);
  if (timer < 0 || timer > 23 || minutter < 0 || minutter > 59) return null;

  return timer * 60 + minutter;
}

/**
 * Læg `timer` timer og `minutter` minutter på `klokkeslaet`. Negativt tal
 * trækker fra, så «klokken 23:30 minus 8 timer» er det samme kald som
 * plus 8.
 *
 * Resultatet mod 1440 og hele dage tælles med `Math.floor`, så
 * 23:30 + 8 timer er 07:30 med `heleDage: 1`, og 06:00 − 8 timer er 22:00
 * med `heleDage: -1` — det er dagen før, ikke en ugyldig klokkeslæt.
 */
export function plusTid(input: PlusTidInput): PlusTidResultat | null {
  const startMinutter = parseKlokkeslaet(input.klokkeslaet);
  if (startMinutter === null) return null;

  const minutter = input.minutter ?? 0;
  if (!Number.isFinite(input.timer) || !Number.isFinite(minutter)) return null;
  if (!Number.isInteger(input.timer) || !Number.isInteger(minutter)) return null;

  const delta = input.timer * 60 + minutter;
  const total = startMinutter + delta;
  const heleDage = Math.floor(total / MINUTTER_PER_DAG);
  const modDag = normaliserModDag(total);

  return {
    klokkeslaet: formatKlokkeslaet(modDag),
    timer: Math.floor(modDag / 60),
    minutter: modDag % 60,
    heleDage,
    decimalTimer: delta / 60,
    totalMinutter: delta,
    overMidnat: heleDage !== 0,
  };
}

export interface PlusTidEksempel {
  /** Nøgle, ikke tekst: overskrifterne er sprogafhængige og bor på siden. */
  id: "plus8" | "plus12" | "plus16" | "plus2t45" | "minus8" | "minus8natt" | "plus50";
  klokkeslaet: string;
  timer: number;
  minutter: number;
}

/**
 * Timerne er målt fra autocomplete (se modulens docblock): de otte timer,
 * Google spørger om, er 8, 12, 16 og 2 t 45, og de to fælder er
 * træk-tid og minutter-under-en-time. Derfor er de ikke valgt, fordi de er
 * pæne — de er valgt, fordi de er de søgninger, der kommer.
 */
export const PLUS_TID_EKSEMPLER: PlusTidEksempel[] = [
  { id: "plus8", klokkeslaet: "09:00", timer: 8, minutter: 0 },
  { id: "plus12", klokkeslaet: "12:00", timer: 12, minutter: 0 },
  { id: "plus16", klokkeslaet: "16:00", timer: 16, minutter: 0 },
  { id: "plus2t45", klokkeslaet: "22:30", timer: 2, minutter: 45 },
  { id: "minus8", klokkeslaet: "23:30", timer: -8, minutter: 0 },
  { id: "minus8natt", klokkeslaet: "02:30", timer: -8, minutter: 0 },
  { id: "plus50", klokkeslaet: "07:15", timer: 0, minutter: 50 },
];

export interface Tidsrum {
  startTid: string;
  slutTid: string;
  /** Pause i minutter, trækkes fra *inden* rummet tælles med. */
  fratraekPause?: number;
}

export interface SummerTidsrumResultat {
  timer: number;
  minutter: number;
  totalMinutter: number;
  decimalTimer: number;
  /** Helt døgn, når summen passerer 24 timer. */
  heleDoegn: number;
  /** Hvor mange rum der blev regnet på. */
  gyldige: number;
  /** Hvor mange rum der var ugyldige (tomt eller ugyldigt klokkeslæt). */
  springteOver: number;
}

/**
 * Læg flere tidsrum sammen. Det er den anden halvdel af samme spørgsmål:
 * «plus tid sammen» og «räkna timmar framåt» er begge summering, men kun
 * den ene halvdel kan løses i dag, fordi TidsBeregner tager ét rum ad gangen.
 *
 * Hvert rum går gennem `beregnTidsinterval` — altså det samme modul
 * TidsBeregner bruger, så et rum der støder op mod næste døgn (22:00-06:00)
 * tælles som 8 timer her som det gør der. Pauser trækkes fra inde i
 * kaldet, så en pause på 90 minutter ikke kan give et negativt rum.
 *
 * `null` betyder at intet af rummene var gyldigt, så UI'et kan vise en
 * fejltilstand i stedet for en nulsum.
 */
export function summerTidsrum(rum: Tidsrum[]): SummerTidsrumResultat | null {
  if (rum.length === 0) return null;

  let sumMinutter = 0;
  let gyldige = 0;
  let springteOver = 0;

  for (const r of rum) {
    const resultat = beregnTidsinterval({
      startTid: r.startTid,
      slutTid: r.slutTid,
      fratraekPause: r.fratraekPause ?? 0,
    });
    if (resultat === null) {
      springteOver += 1;
      continue;
    }
    sumMinutter += resultat.totalMinutter;
    gyldige += 1;
  }

  if (gyldige === 0) return null;

  const heleTimer = Math.floor(sumMinutter / 60);
  const restMinutter = sumMinutter % 60;

  return {
    timer: heleTimer,
    minutter: restMinutter,
    totalMinutter: sumMinutter,
    decimalTimer: sumMinutter / 60,
    heleDoegn: sumMinutter / MINUTTER_PER_DAG,
    gyldige,
    springteOver,
  };
}