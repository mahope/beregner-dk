/**
 * Simplify a fraction and express it as a decimal and a percentage.
 *
 * The fraction is reduced by its greatest common divisor; a negative sign is
 * normalised onto the numerator. Division by zero is rejected.
 */

export interface BrokResultat {
  taeller: number;
  naevner: number;
  decimal: number;
  procent: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

export function forkortBrok(taeller: number, naevner: number): BrokResultat | null {
  if (!Number.isInteger(taeller) || !Number.isInteger(naevner) || naevner === 0) {
    return null;
  }

  // Normalise sign so the denominator is always positive.
  let t = taeller;
  let n = naevner;
  if (n < 0) {
    t = -t;
    n = -n;
  }

  const d = gcd(t, n);
  const st = t / d;
  const sn = n / d;

  return {
    taeller: st,
    naevner: sn,
    decimal: t / n,
    procent: (t / n) * 100,
  };
}
