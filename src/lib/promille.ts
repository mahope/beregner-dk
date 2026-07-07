/**
 * Blood alcohol concentration (promille / BAC) using the Widmark formula.
 *
 * BAC(‰) = A / (r · m) − β · t
 *   A = grams of pure alcohol
 *   r = Widmark distribution factor (0.68 men, 0.55 women)
 *   m = body weight in kg
 *   β = elimination rate (~0.15 ‰ per hour)
 *   t = hours since drinking started
 *
 * One standard drink ("genstand" / "standardglas") = 12 g pure alcohol in
 * both Denmark and Sweden. This is an estimate — actual BAC varies with food,
 * metabolism and other factors.
 */

export const GRAM_PR_GENSTAND = 12;
export const ELIMINATION_PR_TIME = 0.15; // ‰/hour
const R_MAND = 0.68;
const R_KVINDE = 0.55;

export type Koen = "mand" | "kvinde";

export interface PromilleResultat {
  promille: number;
  gramAlkohol: number;
  timerTilNul: number; // hours until BAC reaches 0
  maaKoere: boolean; // below the 0.5 ‰ driving limit
}

export function beregnPromille(
  antalGenstande: number,
  vaegtKg: number,
  koen: Koen,
  timerSiden: number
): PromilleResultat | null {
  if (!antalGenstande || antalGenstande <= 0 || !vaegtKg || vaegtKg <= 0) return null;

  const gramAlkohol = antalGenstande * GRAM_PR_GENSTAND;
  const r = koen === "mand" ? R_MAND : R_KVINDE;
  const peak = gramAlkohol / (r * vaegtKg);
  const promille = Math.max(0, peak - ELIMINATION_PR_TIME * Math.max(0, timerSiden));

  return {
    promille: Math.round(promille * 100) / 100,
    gramAlkohol,
    timerTilNul: Math.ceil((promille / ELIMINATION_PR_TIME) * 10) / 10,
    maaKoere: promille < 0.5,
  };
}
