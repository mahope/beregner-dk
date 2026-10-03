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

/** The four operations the school rules for fractions cover. */
export type BrokOperation = "plus" | "minus" | "gange" | "dele";

export const BROK_OPERATIONER: BrokOperation[] = ["plus", "minus", "gange", "dele"];

export interface BrokRegning extends BrokResultat {
  /** The common denominator the result was built on, so the rule is visible. */
  fællesNaevner: number;
  /**
   * True when the two input denominators had to be made equal before the
   * arithmetic — the rule the page says is the one that catches people out.
   */
  brugteFællesNaevner: boolean;
}

/**
 * Apply one of the four fraction rules to two fractions, always reduced.
 *
 * `plus` and `minus` need equal denominators, so the least common multiple of
 * the two becomes the common denominator; `gange` and `dele` do not, and
 * `dele` flips the second fraction. A zero denominator anywhere, or division
 * by a zero numerator, is rejected rather than silently returned as infinity.
 */
export function regnMedBroker(
  taeller1: number,
  naevner1: number,
  taeller2: number,
  naevner2: number,
  operation: BrokOperation
): BrokRegning | null {
  if (
    ![taeller1, naevner1, taeller2, naevner2].every(Number.isInteger) ||
    naevner1 === 0 ||
    naevner2 === 0
  ) {
    return null;
  }
  if (operation === "dele" && taeller2 === 0) return null;

  let faellesNaevner: number;
  let taeller: number;
  let naevner: number;
  if (operation === "plus" || operation === "minus") {
    faellesNaevner = (Math.abs(naevner1 * naevner2) / gcd(naevner1, naevner2)) || 1;
    const foerste = taeller1 * (faellesNaevner / naevner1);
    const anden = taeller2 * (faellesNaevner / naevner2);
    taeller = operation === "plus" ? foerste + anden : foerste - anden;
    naevner = faellesNaevner;
  } else if (operation === "gange") {
    faellesNaevner = naevner1 * naevner2;
    taeller = taeller1 * taeller2;
    naevner = faellesNaevner;
  } else {
    // Flip the second fraction: a over b divided by c over d is a·d over b·c.
    faellesNaevner = naevner1 * taeller2;
    taeller = taeller1 * naevner2;
    naevner = naevner1 * taeller2;
  }

  const reduceret = forkortBrok(taeller, naevner);
  if (!reduceret) return null;
  return {
    ...reduceret,
    fællesNaevner: Math.abs(faellesNaevner),
    brugteFællesNaevner:
      (operation === "plus" || operation === "minus") && naevner1 !== naevner2,
  };
}
