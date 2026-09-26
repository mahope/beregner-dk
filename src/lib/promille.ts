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

/**
 * The legal driving limit is a property of the country, not of the maths:
 * Denmark 0.5 ‰, Sweden and Norway 0.2 ‰. It lives here so the library can
 * never answer with the Danish limit on beraknare.se (see PROMILLEGRANSE).
 */
export const PROMILLEGRANSE: Record<"da" | "se" | "no", number> = {
  da: 0.5,
  se: 0.2,
  no: 0.2,
};

export const PROMILLEGRANSE_DA = PROMILLEGRANSE.da;

export function graenseForLocale(locale: string): number {
  return PROMILLEGRANSE[locale as keyof typeof PROMILLEGRANSE] ?? PROMILLEGRANSE.da;
}

export interface PromilleResultat {
  promille: number;
  gramAlkohol: number;
  timerTilNul: number; // hours until BAC reaches 0
  timerTilGraense: number; // hours until BAC is below the legal limit
  maaKoere: boolean; // below the legal driving limit
}

/**
 * Hours until the promille drops to the legal limit. Rounded up, never down,
 * so the answer can never be more optimistic than the arithmetic. Uses the
 * same rounded promille the page displays, so the number read and the number
 * calculated can never disagree.
 */
export function timerTilGraense(promille: number, graense: number = PROMILLEGRANSE_DA): number {
  const difference = promille - graense;
  if (difference <= 0) return 0;
  return Math.ceil((difference / ELIMINATION_PR_TIME) * 10) / 10;
}

export function beregnPromille(
  antalGenstande: number,
  vaegtKg: number,
  koen: Koen,
  timerSiden: number,
  graense: number = PROMILLEGRANSE_DA
): PromilleResultat | null {
  if (!antalGenstande || antalGenstande <= 0 || !vaegtKg || vaegtKg <= 0) return null;

  const gramAlkohol = antalGenstande * GRAM_PR_GENSTAND;
  const r = koen === "mand" ? R_MAND : R_KVINDE;
  const peak = gramAlkohol / (r * vaegtKg);
  const promille = Math.max(0, peak - ELIMINATION_PR_TIME * Math.max(0, timerSiden));
  const afrundet = Math.round(promille * 100) / 100;

  return {
    promille: afrundet,
    gramAlkohol,
    timerTilNul: Math.ceil((afrundet / ELIMINATION_PR_TIME) * 10) / 10,
    timerTilGraense: timerTilGraense(afrundet, graense),
    maaKoere: afrundet < graense,
  };
}
