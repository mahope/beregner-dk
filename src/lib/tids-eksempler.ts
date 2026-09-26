import { beregnTidsinterval } from "./tidsberegner";

export interface TidsEksempel {
  start: string;
  slut: string;
  /** Udelades, når eksemplet ligger inden for samme døgn. */
  startDato?: string;
  slutDato?: string;
  pause: number;
  timer: number;
  minutter: number;
  /** "8 t 15 min" — samme notationsform som CopyResultButton bruger. */
  svar: string;
  decimalTimer: string;
  overMidnat: boolean;
  /** Hvorfor eksemplet er med, kort og konkret. */
  bemaerkning: string;
}

const raws: Array<
  Omit<TidsEksempel, "svar" | "decimalTimer" | "overMidnat" | "timer" | "minutter">
> = [
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
  {
    start: "16:00",
    slut: "09:00",
    startDato: "2026-09-25",
    slutDato: "2026-09-28",
    pause: 0,
    bemaerkning:
      "Fredag kl. 16 til mandag kl. 09. Uden de to datofelter ville beregneren tro, det var otte timer.",
  },
  {
    start: "08:00",
    slut: "17:00",
    startDato: "2026-09-25",
    slutDato: "2026-09-28",
    pause: 60,
    bemaerkning:
      "Tre dage på arbejde med to frokostpauser, der begge trækkes fra.",
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
    startDato: rå.startDato,
    slutDato: rå.slutDato,
    fratraekPause: rå.pause,
  });
  if (!resultat) {
    throw new Error(
      `Tids-eksemplet ${rå.start}–${rå.slut} kan ikke beregnes af beregnTidsinterval`
    );
  }
  return {
    ...rå,
    timer: resultat.timer,
    minutter: resultat.minutter,
    svar: `${resultat.timer} t ${resultat.minutter} min`,
    decimalTimer: resultat.decimalTimer,
    overMidnat: resultat.overMidnat,
  };
});

/**
 * Det første eksempel med datofelter. Brødteksten på /tidsberegner bruger det
 * til at forklare, hvad de to valgfrie datofelter gør, så tallene i teksten er
 * de samme som dem i tabellen — og som dem værktøjet regner.
 */
const flereDageEksempel = TIDS_EKSEEMPLER.find(
  (eksempel) => eksempel.startDato !== undefined
);

if (!flereDageEksempel) {
  throw new Error(
    "TIDS_EKSEEMPLER skal indeholde et eksempel med datofelter — brødteksten på /tidsberegner bruger det"
  );
}

export const TIDS_EKSEMPEL_FLERE_DAGE: TidsEksempel = flereDageEksempel;

/**
 * Samme klokkeslæt som TIDS_EKSEMPEL_FLERE_DAGE, men uden datoer. Det er det
 * resultat, læseren får ved at springe datofelterne over, og brødteksten bruger
 * det som kontrast. Beregnet af modulet, så de to tal ikke kan glide fra hinanden.
 */
export const TIDS_UDEN_DATOER: Record<"da" | "se", string> = (() => {
  const resultat = beregnTidsinterval({
    startTid: TIDS_EKSEMPEL_FLERE_DAGE.start,
    slutTid: TIDS_EKSEMPEL_FLERE_DAGE.slut,
  });
  if (!resultat) {
    throw new Error(
      "Klokkeslæt fra TIDS_EKSEMPEL_FLERE_DAGE kan ikke beregnes uden datoer"
    );
  }
  return {
    da: `${resultat.timer} t ${resultat.minutter} min`,
    se: `${resultat.timer} h ${resultat.minutter} min`,
  };
})();

/**
 * "65 t 0 min" på dansk og "65 h 0 min" på svensk — samme notationsform som
 * TidsBeregner bruger på hvert domæne, så et tal læst på beraknare.se ikke
 * får danske forkortelser.
 */
export function formatTidsvar(
  eksempel: Pick<TidsEksempel, "timer" | "minutter">,
  locale: "da" | "se"
): string {
  return locale === "se"
    ? `${eksempel.timer} h ${eksempel.minutter} min`
    : `${eksempel.timer} t ${eksempel.minutter} min`;
}
