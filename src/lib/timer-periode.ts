import type { Locale } from "@/lib/i18n";

/**
 * Hvor mange timer, minutter og sekunder en periode indeholder.
 *
 * Dansk og svensk autocomplete (målt 2/10 på `suggestqueries`, hl=da gl=dk og
 * hl=sv gl=se) har hele klyngen som sit eget spørgsmål: «hvor mange timer er
 * der på et år» er nummer 1 under «hvor mange timer», «hvor mange timer i en
 * uge» er nummer 1 under «timer i en uge», og svensk har «hur många timmar
 * är det på ett år» og «hur många timmar är det på en vecka». `/tidsberegner`
 * er siteets tredjestørste side (75.622 visninger, 0,3 % CTR, pos. 6,8) og
 * svaret på spørgsmålet stod ingen steder — kun «minutter ÷ 60».
 *
 * Regnestykket er ét tal: `dage × 24`. Måneden og kvartalet er **snit** af et
 * år på 365 dage, så de er ikke 30 og 91 dage, men 30,4167 og 91,25 — ellers
 * ville en vintermåned med 31 dage være «forkert». Derfor kommer alle tal
 * herfra og ikke fra brødteksten, så en periode og dens timer ikke kan glide
 * fra hinanden.
 */

export type TimerPeriodeId = "doegn" | "uge" | "maaned" | "kvartal" | "aar";

export interface TimerPeriode {
  id: TimerPeriodeId;
  /** Dage i perioden. Måned og kvartal er et snit af 365 dage. */
  dage: number;
  timer: number;
  minutter: number;
  sekunder: number;
  naevn: Record<Locale, string>;
}

/** Timer i ét døgn. Alt andet i modulet er dette tal × antallet af dage. */
export const TIMER_I_DAGT = 24;

/** Dage i et normalt år. Et skudår har 366, og det står i teksten. */
export const DAGE_I_AAR = 365;

/** Dage i et skudår. Kun forskellen på ét døgn bruges i teksten. */
export const DAGE_I_SKUDAAR = DAGE_I_AAR + 1;

function periode(
  id: TimerPeriodeId,
  dage: number,
  naevn: Record<Locale, string>
): TimerPeriode {
  const timer = dage * TIMER_I_DAGT;
  return {
    id,
    dage,
    timer,
    minutter: timer * 60,
    sekunder: timer * 3600,
    naevn,
  };
}

export const TIMER_PERIODER: TimerPeriode[] = [
  periode("doegn", 1, {
    da: "Et døgn",
    se: "Ett dygn",
    no: "Ett døgn",
  }),
  periode("uge", 7, {
    da: "En uge",
    se: "En vecka",
    no: "En uke",
  }),
  periode("maaned", DAGE_I_AAR / 12, {
    da: "En måned (snit af 12 måneder)",
    se: "En månad (snitt av 12 månader)",
    no: "En måned (gjennomsnitt av 12 måneder)",
  }),
  periode("kvartal", DAGE_I_AAR / 4, {
    da: "Et kvartal (snit af 4 kvartaler)",
    se: "Ett kvartal (snitt av 4 kvartaler)",
    no: "Et kvartal (gjennomsnitt av 4 kvartaler)",
  }),
  periode("aar", DAGE_I_AAR, {
    da: "Et år",
    se: "Ett år",
    no: "Ett år",
  }),
];

/**
 * Slå én periode op på id. Kaster i stedet for at returnere `undefined`, for
 * at en ny periode uden navn ikke kan komme ud som tom tekst i tabellen.
 */
export function timerIPeriode(id: TimerPeriodeId): TimerPeriode {
  const fundet = TIMER_PERIODER.find((p) => p.id === id);
  if (!fundet) {
    throw new Error(`Ukendt periode: ${id}`);
  }
  return fundet;
}

/**
 * Skudåret og det normale år i timer. Kun bruges til at sige, at forskellen er
 * ét døgn — tallene står ikke i en tabel, men i teksten.
 */
export const TIMER_I_SKUDAAR = DAGE_I_SKUDAAR * TIMER_I_DAGT;