/**
 * The two ways to compare two numbers in percent.
 *
 * Swedish searches ask for both: "procent skillnad mellan två tal" is the
 * number 1 completion under "procent skillnad" (autocomplete hl=se, 2026-09-28),
 * while "räkna ut procent mellan två tal" and "räkna ut procent av två tal"
 * are two of ten completions under "räkna ut procent". They are not the same
 * question, so the page has to answer both instead of picking one.
 */

/**
 * Percent change from `gammal` to `ny`: ((ny - gammal) / gammal) × 100.
 *
 * The old figure is always the whole. This is the formula the calculator
 * already teaches, so the examples below use it too.
 */
export function procentForskel(ny: number, gammal: number): number {
  if (gammal === 0) return 0;
  return ((ny - gammal) / gammal) * 100;
}

/**
 * Symmetric percent difference: |a - b| / ((a + b) / 2) × 100.
 *
 * The mean is the whole, so the answer is the same whichever of the two
 * numbers you start from. That is why it is called a difference rather than a
 * change, and why science and statistics use it.
 */
export function procentDifferens(a: number, b: number): number {
  const gennemsnit = (a + b) / 2;
  if (gennemsnit === 0) return 0;
  return (Math.abs(a - b) / gennemsnit) * 100;
}

/**
 * The two figure pairs the Swedish page works with.
 *
 * Both are pairs the page already promises elsewhere — the salary 33 000 mot
 * 30 000 = 10 procent in its FAQ, and 10 000 till 12 500 = 25 in its Excel
 * table — so the new prose cannot drift away from the numbers already indexed.
 */
export const PROCENT_SKILLNAD_EKSEMPEL = [
  { gammal: 30000, ny: 33000 },
  { gammal: 10000, ny: 12500 },
];

