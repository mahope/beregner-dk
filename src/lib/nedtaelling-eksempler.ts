/**
 * Worked example for the Excel section on /nedtaelling.
 *
 * Every number the page prints is derived from `beregnNedtaelling` — the same
 * module the countdown tool itself uses — plus the clock time of the target
 * date. Nothing is typed in twice, so the page cannot drift away from the
 * calculator.
 */

import { beregnNedtaelling } from "./nedtaelling";

/** "Idag" in the example: 29 september 2026 kl. 00:00. */
export const EKSEMPEL_IDAG = "2026-09-29";

/** The target: julafton, 24 december 2026 kl. 09:30. */
export const EKSEMPEL_MAL_DAG = "2026-12-24";

/** "09:30" — the time of day on the target date. */
export const EKSEMPEL_MAL_TID = "09:30";

export interface NedtaellingExcelEksempel {
  /** Dagar from today to the target, from `beregnNedtaelling`. */
  dage: number;
  /** Hela veckor + restdage, straight from `beregnNedtaelling`. */
  helaVeckor: number;
  restDage: number;
  /** Klockslaget på måldagen, som minuter siden midnatt. */
  malMinuter: number;
  /** `=DATEDIF(IDAG();A1;"d")*24` — hela dagar i timmar, resten af dagen går tabt. */
  helaDagarTimmar: number;
  /** `=(A1-IDAG())*24` — timmar inklusive minutter og sekunder. */
  timmerMedRest: number;
  /** `=MOD(A1-IDAG();1)*1440` — minuter inklusive resten. */
  minuter: number;
  /** `=MOD(A1-IDAG();1)*86400` — sekunder inklusive resten. */
  sekunder: number;
}

function tidTilMinuter(tid: string): number {
  const [tim, min] = tid.split(":").map(Number);
  return tim * 60 + min;
}

export function excelEksempel(): NedtaellingExcelEksempel {
  const resultat = beregnNedtaelling(EKSEMPEL_IDAG, EKSEMPEL_MAL_DAG);
  if (!resultat) {
    throw new Error(`Ugyldigt eksempel: ${EKSEMPEL_IDAG} → ${EKSEMPEL_MAL_DAG}`);
  }
  const { dage, uger, restDage } = resultat;
  const malMinuter = tidTilMinuter(EKSEMPEL_MAL_TID);
  return {
    dage,
    helaVeckor: uger,
    restDage,
    malMinuter,
    helaDagarTimmar: dage * 24,
    timmerMedRest: dage * 24 + malMinuter / 60,
    minuter: dage * 24 * 60 + malMinuter,
    sekunder: dage * 24 * 60 * 60 + malMinuter * 60,
  };
}
