/**
 * Split a bill between people, with an optional tip percentage.
 *
 *   tip     = total · tipPct / 100
 *   grand   = total + tip
 *   perHead = grand / people
 */

export interface RegningResultat {
  drikkepenge: number;
  totalMedDrikkepenge: number;
  prPerson: number;
}

export function delRegning(
  total: number,
  personer: number,
  drikkepengeProcent: number
): RegningResultat | null {
  if (total < 0 || !personer || personer < 1) return null;

  const pct = drikkepengeProcent > 0 ? drikkepengeProcent : 0;
  const drikkepenge = total * (pct / 100);
  const totalMedDrikkepenge = total + drikkepenge;

  return {
    drikkepenge,
    totalMedDrikkepenge,
    prPerson: totalMedDrikkepenge / personer,
  };
}
