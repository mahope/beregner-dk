const MINUTTER_PER_DAG = 24 * 60;
const MS_PR_DAG = MINUTTER_PER_DAG * 60 * 1000;
function parseKlokkeslaet(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const timer = Number(match[1]);
  const minutter = Number(match[2]);
  if (timer < 0 || timer > 23 || minutter < 0 || minutter > 59) return null;

  return timer * 60 + minutter;
}

export interface TidsintervalInput {
  startTid: string;
  slutTid: string;
  startDato?: string;
  slutDato?: string;
  fratraekPause?: number;
}

/**
 * Resultatet er **tal**, ikke formaterede strenge: decimaltegnet afhænger af
 * sproget, og et beregningsmod må ikke lå sig låse til dansk notation. Skærm,
 * Kopiér- og Del-teksten formatterer derfor med `formatNumber` fra
 * `src/lib/format` — ellers skrev denne side "8.25 timer" på både
 * minberegner.dk og beraknare.se.
 */
export interface TidsintervalResultat {
  timer: number;
  minutter: number;
  totalTimer: number;
  totalMinutter: number;
  sekunder: number;
  arbejdsdage: number;
  decimalTimer: number;
  /** Hele døgn (24 timer), ikke kalenderdage. 65 timer = 2,71 døgn. */
  heleDoegn: number;
  overMidnat: boolean;
}

function parseDato(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const aar = Number(match[1]);
  const maaned = Number(match[2]);
  const dag = Number(match[3]);
  const dato = new Date(0);
  dato.setUTCHours(0, 0, 0, 0);
  dato.setUTCFullYear(aar, maaned - 1, dag);

  if (
    dato.getUTCFullYear() !== aar ||
    dato.getUTCMonth() !== maaned - 1 ||
    dato.getUTCDate() !== dag
  ) {
    return null;
  }

  return dato.getTime();
}

export function beregnTidsinterval(input: TidsintervalInput): TidsintervalResultat | null {
  const startMinutter = parseKlokkeslaet(input.startTid);
  const slutMinutter = parseKlokkeslaet(input.slutTid);
  if (startMinutter === null || slutMinutter === null) return null;

  const startDato = input.startDato ? parseDato(input.startDato) : null;
  const slutDato = input.slutDato ? parseDato(input.slutDato) : null;
  if ((input.startDato && startDato === null) || (input.slutDato && slutDato === null)) return null;

  let heleDage = 0;
  if (startDato !== null && slutDato !== null) {
    heleDage = Math.floor((slutDato - startDato) / MS_PR_DAG);
    if (heleDage < 0) return null;
  }

  const overMidnat = slutMinutter < startMinutter;
  let tidsdifference = slutMinutter - startMinutter;
  if (heleDage === 0 && tidsdifference < 0) tidsdifference += MINUTTER_PER_DAG;
  tidsdifference += heleDage * MINUTTER_PER_DAG;
  const pause = input.fratraekPause ?? 0;
  if (typeof pause !== "number" || !Number.isFinite(pause)) return null;

  const totalMinutter = Math.max(0, tidsdifference - pause);
  const totalTimer = totalMinutter / 60;

  return {
    timer: Math.floor(totalMinutter / 60),
    minutter: totalMinutter % 60,
    totalTimer: totalTimer,
    totalMinutter,
    sekunder: totalMinutter * 60,
    arbejdsdage: totalTimer / 8,
    decimalTimer: totalTimer,
    heleDoegn: totalMinutter / MINUTTER_PER_DAG,
    overMidnat,
  };
}
