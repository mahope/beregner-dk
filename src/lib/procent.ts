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

/**
 * The whole numbers people ask "10 procent af" about, in both languages.
 *
 * Measured, not guessed: GSC lists "10 procent af" as the third largest query
 * on /procent (53 visninger, pos. 6, 2026-08-30 → 2026-09-27), and Danish
 * autocomplete (hl=da&gl=dk, 2026-09-30) answers it with nine numbers out of
 * ten — 100, 200, 75, 1 600, 25 000, 500, 300, 600, 400. Swedish autocomplete
 * (hl=se&gl=se, same date) answers "10 procent av" with 10 000, 500, 1 000,
 * 2 000 and four round million figures. The two lists are kept in one constant
 * so both domains answer the same cluster from a single source, the way
 * MINUTTER_TILL_TIMMAR does for /tidsberegner.
 *
 * The answers are *computed* by {@link procentAf}, never written out by hand:
 * 10 % is the number divided by ten, and a table that drifts from that rule
 * would be a wrong answer rather than a stale one. 75 is in the list on
 * purpose — it is the only measured number whose answer has a decimal
 * (7,5), so the table has to format a fraction correctly.
 */
export const PROCENT_10_AF_TAL = [75, 100, 200, 300, 400, 500, 600, 1000, 1600, 2000, 10000, 25000, 1000000, 2000000, 3000000, 4000000, 5000000];

/**
 * A given percent of a number: (tal × procent) / 100.
 *
 * The single rule behind every example on the page — the 10 % table, the
 * "Hurtige procent-tricks" rows and the calculator itself. Written once so the
 * table cannot disagree with the tool that produced the query.
 */
export function procentAf(tal: number, procent: number): number {
  return (tal * procent) / 100;
}

