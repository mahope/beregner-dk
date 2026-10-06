/**
 * Convert steps to distance, walking time and calories.
 *
 * Step length and cadence use the classic gait-laboratory references:
 * women average 66 cm/step and men 79 cm/step, both at a cadence of
 * ~117 steps/min (Murray, Drought & Kory 1964; Murray, Kory & Sepic
 * 1970, as tabulated in standard gait-analysis references). Calories
 * use MET 3.5 for normal walking from the Compendium of Physical
 * Activities — the same value as `motion-kalorier.ts`:
 * kcal = MET · weight(kg) · hours.
 *
 * All results are estimates: real step length varies with height, age,
 * terrain and pace, so the page presents them as "ca." values.
 */

export const SKRIDTLAENGDE_M = { kvinde: 0.66, mand: 0.79 } as const;
export const KADENCE_SKRIDT_PR_MIN = 117;
export const GANG_MET = 3.5;

export type SkridtKoen = keyof typeof SKRIDTLAENGDE_M;

export interface SkridtResultat {
  km: number;
  minutter: number;
  /** null when no body weight is given, because calories need it. */
  kcal: number | null;
}

export function beregnSkridt(
  skridt: number,
  koen: SkridtKoen,
  vaegtKg?: number,
): SkridtResultat | null {
  if (!Number.isFinite(skridt) || skridt <= 0) return null;
  const km = (skridt * SKRIDTLAENGDE_M[koen]) / 1000;
  const minutter = skridt / KADENCE_SKRIDT_PR_MIN;
  const kcal =
    vaegtKg !== undefined && vaegtKg > 0
      ? Math.round(GANG_MET * vaegtKg * (minutter / 60))
      : null;
  return {
    km: Math.round(km * 100) / 100,
    minutter: Math.round(minutter),
    kcal,
  };
}

/** The reverse question: how many steps make up a given distance. */
export function skridtFraKm(km: number, koen: SkridtKoen): number | null {
  if (!Number.isFinite(km) || km <= 0) return null;
  return Math.round((km * 1000) / SKRIDTLAENGDE_M[koen]);
}
