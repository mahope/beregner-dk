import { beregnRaaTidsdifference, beregnTidsinterval } from "./tidsberegner";

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
  /** Tal, ikke streng: decimaltegnet formatteres på det domæne, siden viser på. */
  decimalTimer: number;
  /**
   * Hele døgn som decimaltal (0,34375 for 8 t 15 min). Det er præcis det tal
   * Excel's `=B1-A1` giver, når cellen står som **Tal** i stedet for Tid —
   * den fælde Excel-afsnittet på /tidsberegner beskriver.
   */
  heleDoegn: number;
  overMidnat: boolean;
  /** Hvorfor eksemplet er med, kort og konkret. */
  bemaerkning: string;
}

const raws: Array<
  Omit<TidsEksempel, "svar" | "decimalTimer" | "heleDoegn" | "overMidnat" | "timer" | "minutter">
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
    heleDoegn: resultat.heleDoegn,
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
 * De tre eksempler, brødteksten om Excel bruger. De er fundet i
 * TIDS_EKSEEMPLER, så de er de *samme tal* som tabellen og værktøjet viser —
 * en ny tekst kan derfor ikke lægge et tal ved siden af, logikken modsiger.
 *
 * Hver har sit eget formål: det første er det eksempel, metaDescription
 * allerede lovede, det næste krydser midnat (hvor en naiv `=B1-A1` i Excel
 * giver et negativt tal), og det tredje har den pause, som Excel-formlen
 * trækker fra med det samme argument som værktøjet har.
 */
function findEksempel(start: string, slut: string, pause: number): TidsEksempel {
  const fundet = TIDS_EKSEEMPLER.find(
    (eksempel) =>
      eksempel.start === start &&
      eksempel.slut === slut &&
      eksempel.pause === pause &&
      eksempel.startDato === undefined
  );
  if (!fundet) {
    throw new Error(
      `TIDS_EKSEEMPLER skal indeholde eksemplet ${start}–${slut} med pause ${pause} — Excel-afsnittet på /tidsberegner bruger det`
    );
  }
  return fundet;
}

/** 08:30–16:45 uden pause: 8 t 15 min = 8,25 decimaltimer. */
export const TIDS_EKSEMPEL_DAG: TidsEksempel = findEksempel("08:30", "16:45", 0);

/** 22:00–06:00: 8 t 0 min, og `overMidnat` er sand. */
export const TIDS_EKSEMPEL_MIDNAT: TidsEksempel = findEksempel("22:00", "06:00", 0);

/** 09:00–17:00 med 30 minutters pause: 7 t 30 min = 7,50 decimaltimer. */
export const TIDS_EKSEMPEL_PAUSE: TidsEksempel = findEksempel("09:00", "17:00", 30);

/**
 * Hele intervallet i minutter — det tal Excel's `=B1-A1` giver, når cellerne
 * er formateret som klokkeslæt og svaret formateres som `[t]:mm`.
 * Beregnet af modulet, så det ikke er et håndskrevet tal ved siden af
 * `decimalTimer`.
 */
export function totalMinutter(eksempel: Pick<TidsEksempel, "timer" | "minutter">): number {
  return eksempel.timer * 60 + eksempel.minutter;
}

/**
 * Præcis det tal Excel's `=B1-A1` giver i en celle formateret som **Tal**:
 * en brøkdel af et døgn, **signeret**. Den er negativ for et interval der
 * krydser midnat (22:00 → 06:00), fordi Excel trækker sluttiden fra
 * starttiden uden at vide at dagen er en senere. Det er den fælde
 * Excel-afsnittet på /tidsberegner beskriver, så tallet skal komme herfra
 * og ikke fra brødteksten.
 *
 * Den er **brutto**: formlen kender ikke til en pause, fordi pausen ikke står
 * i de to celler — den trækkes fra i et separat argument, præcis som
 * `=(B1-A1)*24-0,5` gør på siden. Derfor regnes den uden `fratraekPause`.
 */
export function excelDifferens(eksempel: TidsEksempel): number {
  const raat = beregnRaaTidsdifference(eksempel.start, eksempel.slut);
  if (raat === null) {
    throw new Error(
      `Eksemplet ${eksempel.start}–${eksempel.slut} kan ikke parses — Excel-afsnittet på /tidsberegner bruger det`
    );
  }
  return raat / (24 * 60);
}

export interface MinutterRaekke {
  minutter: number;
  timer: number;
  restMinutter: number;
  decimalTimer: number;
}

/**
 * Minutter → timer, timmar och decimaltimmar. Timer och restminutter är
 * **udregnet** (div/mod 60), altså samma to regler som `beregnTidsinterval`
 * bruger, så tabellen ikke kan modsige værktøjet.
 *
 * Rækkerne er valgt efter de to søgeklynger, der findes i hvert sprog:
 * SE-autocomplete under "räkna ut timmar och minuter" har "räkna ut timmar
 * från minuter" (nr. 7) och "räkna timmar till minuter" (nr. 10), mens
 * DA-autocomplete under "minutter til timer" er **7 af 10 numeriske
 * variationer** — 300, 1000, 150, 2000, 120, 1500 og 2500 minutter.
 * 480 og 495 er de to tal værktøjet selv producerer (otte timer uden pause
 * og 08:30–16:45), så de kan efterprøves mod `TIDS_EKSEMPLER`.
 */
export const MINUTTER_TILL_TIMMAR: MinutterRaekke[] = [
  15, 30, 45, 60, 90, 120, 150, 300, 480, 495, 1000, 1500, 2000, 2500,
].map((minutter) => ({
  minutter,
  timer: Math.floor(minutter / 60),
  restMinutter: minutter % 60,
  decimalTimer: minutter / 60,
}));

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
