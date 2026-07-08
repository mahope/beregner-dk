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
