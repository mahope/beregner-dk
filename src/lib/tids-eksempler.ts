import { beregnTidsinterval } from "./tidsberegner";

export interface TidsEksempel {
  start: string;
  slut: string;
  pause: number;
  /** "8 t 15 min" — samme notationsform som CopyResultButton bruger. */
  svar: string;
  decimalTimer: string;
  overMidnat: boolean;
  /** Hvorfor eksemplet er med, kort og konkret. */
  bemaerkning: string;
}

const raws: Array<Omit<TidsEksempel, "svar" | "decimalTimer" | "overMidnat">> = [
  {
    start: "08:30",
    slut: "16:45",
    pause: 0,
    bemaerkning:
      "Det eksempel, der står i sidens beskrivelse. Tallet er hentet fra det samme modul som værktøjet bruger.",
  },
  {
    start: "08:00",
    slut: "16:00",
    pause: 0,
    bemaerkning: "Den almindlige arbejdsdag på otte timer, uden pause.",
  },
  {
    start: "09:00",
    slut: "17:00",
    pause: 30,
    bemaerkning:
      "Med frokostpause fratrukket. Pausefeltet trækker fra, før resultatet vises.",
  },
  {
    start: "13:15",
    slut: "14:45",
    pause: 0,
    bemaerkning: "Et møde på halvanden time.",
  },
  {
    start: "22:00",
    slut: "06:00",
    pause: 0,
    bemaerkning:
      "Nattevagt. Sluttidspunktet er tidligere end starttidspunktet, så beregneren tager automatisk datoen dagen efter.",
  },
];

/**
 * De gennemgående eksempler på /tidsberegner. Hvert tal er beregnet af
 * `beregnTidsinterval` — det samme modul som selve værktøjet bruger — så
 * tabellen og værktøjet ikke kan komme i uoverenssættelse, og et krav om et
 * eksempel i en ny tekst ikke kan indholde et tal, der er modsagt af logikken.
 */
export const TIDS_EKSEEMPLER: TidsEksempel[] = raws.map((rå) => {
  const resultat = beregnTidsinterval({
    startTid: rå.start,
    slutTid: rå.slut,
    fratraekPause: rå.pause,
  });
  if (!resultat) {
    throw new Error(
      `Tids-eksemplet ${rå.start}–${rå.slut} kan ikke beregnes af beregnTidsinterval`
    );
  }
  return {
    ...rå,
    svar: `${resultat.timer} t ${resultat.minutter} min`,
    decimalTimer: resultat.decimalTimer,
    overMidnat: resultat.overMidnat,
  };
});
