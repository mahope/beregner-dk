/**
 * Estimate one-rep max (1RM) from a weight lifted for a number of reps.
 *
 * Two established formulas are averaged:
 *   Epley:   1RM = w · (1 + reps/30)
 *   Brzycki: 1RM = w · 36 / (37 − reps)
 *
 * Brzycki is only valid below 37 reps; above that only Epley is used. At a
 * single rep both formulas return the lifted weight.
 */

export interface EnRepMaxResultat {
  epley: number;
  brzycki: number | null;
  oneRM: number;
}

export function beregn1RM(vaegt: number, reps: number): EnRepMaxResultat | null {
  if (vaegt <= 0 || !Number.isFinite(vaegt) || reps < 1 || !Number.isFinite(reps)) return null;

  if (reps === 1) {
    return { epley: vaegt, brzycki: vaegt, oneRM: vaegt };
  }

  const epley = vaegt * (1 + reps / 30);
  const brzycki = reps < 37 ? (vaegt * 36) / (37 - reps) : null;
  const oneRM = brzycki !== null ? (epley + brzycki) / 2 : epley;

  return { epley, brzycki, oneRM };
}

/**
 * Given a 1RM, estimate the weight you could lift at a training percentage.
 */
export function vaegtVedProcent(oneRM: number, procent: number): number {
  return oneRM * (procent / 100);
}
