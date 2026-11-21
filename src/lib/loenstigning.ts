/**
 * Salary increase between an old and a new amount.
 *
 *   difference = new − old
 *   percent    = difference / old · 100
 *
 * Works for any amount (hourly, monthly, yearly). A negative result means a
 * pay cut.
 */

export interface LoenstigningResultat {
  forskel: number;
  procent: number;
  erStigning: boolean;
}

export function beregnLoenstigning(
  gammelLoen: number,
  nyLoen: number
): LoenstigningResultat | null {
  if (gammelLoen <= 0 || !Number.isFinite(gammelLoen) || !Number.isFinite(nyLoen)) {
    return null;
  }

  const forskel = nyLoen - gammelLoen;
  return {
    forskel,
    procent: (forskel / gammelLoen) * 100,
    erStigning: forskel >= 0,
  };
}

/**
 * Real (inflation-adjusted) salary change:
 *
 *   realPercent = (1 + percent/100) / (1 + inflation/100) − 1
 *   realDifference = new / (1 + inflation/100) − old   (new salary in the old salary's prices)
 */
export function beregnRealLoenstigning(
  gammelLoen: number,
  nyLoen: number,
  inflationPct: number
): { realProcent: number; realForskel: number } | null {
  const nominel = beregnLoenstigning(gammelLoen, nyLoen);
  if (!nominel || !Number.isFinite(inflationPct) || inflationPct <= -100) return null;
  const faktor = 1 + inflationPct / 100;
  return {
    realProcent: ((1 + nominel.procent / 100) / faktor - 1) * 100,
    realForskel: nyLoen / faktor - gammelLoen,
  };
}
