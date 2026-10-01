/**
 * Procentpoint ( Danish "procentpoint", Swedish "procentenhet" ) is the unit
 * newspapers and politicians use when two *percentages* move, as opposed to
 * a percent change of some underlying amount.
 *
 * The distinction is not academic: 2 % to 3 % is 1 percentage point but a 50 %
 * rise, and a party polling 4,8 % to 6,4 % gained 1,6 points and 33 %. Both
 * statements are true and answer different questions. Danish autocomplete
 * (hl=da&gl=dk, measured 2026-10-01) answers "hvad er procent" with
 * "hvad er procentpoint" as number one, and every one of the eight
 * completions under "procent point" is a question about this unit, so the
 * cluster is real and the page only had a single FAQ sentence for it.
 */

/**
 * The change between two percentages expressed in percentage points.
 *
 * Plain subtraction, and that is the whole rule. The first percentage is the
 * "before" figure: a vote share, a key rate, a tax rate. No division happens,
 * which is what makes it a different question from {@link procentpointRelativ}.
 */
export function procentpointForskel(gammel: number, ny: number): number {
  return ny - gammel;
}

/**
 * The same move expressed as a relative percent change.
 *
 * This is the number a headline often gets wrong: 2 % to 3 % is 1 point but
 * 50 %, and 4,8 % to 6,4 % is 1,6 points and 33,3 %. The old percentage is
 * the whole, exactly as in {@link procentForskel} — the difference is only
 * that the underlying amount is itself a percentage.
 */
export function procentpointRelativ(gammel: number, ny: number): number {
  if (gammel === 0) return 0;
  return ((ny - gammel) / gammel) * 100;
}

/** One "before" and one "after" percentage. */
export interface ProcentpointPar {
  /** The percentage before the change. */
  gammel: number;
  /** The percentage after the change. */
  ny: number;
}

/**
 * The worked pairs the page and the tool use, in the order a Danish reader
 * meets the two ideas.
 *
 * Every pair is a *regneeksempel*, not a claim about what happened: a key rate
 * that rises, a poll that moves, a tax rate that changes. Nationalbanken's own
 * rate path was left out on purpose — `nationalbanken.dk/den-rabende-rente`
 * answered HTTP 404 for both the plain and the `/penningpolitik/` URL on
 * 2026-10-01, and a rate history written from memory would be exactly the
 * unsourced number the quality rules forbid. A reader who wants the real path
 * gets the link to Danmarks Nationalbank from the page text instead.
 *
 * Both series live here so the tool's defaults, the tables and the prose all
 * read the same numbers, and a sentence cannot disagree with the table beside
 * it.
 */
export const PROCENTPOINT_EKSEMPEL: {
  rente: ProcentpointPar[];
  valg: ProcentpointPar[];
  skat: ProcentpointPar[];
} = {
  /** A key rate moving up a point at a time. */
  rente: [
    { gammel: 1, ny: 2 },
    { gammel: 2, ny: 3 },
    { gammel: 3, ny: 4 },
  ],
  /** A poll where one party gains and another loses. */
  valg: [
    { gammel: 22.1, ny: 19.7 },
    { gammel: 4.8, ny: 6.4 },
  ],
  /** A tax rate, where the two numbers are the rates on two incomes. */
  skat: [
    { gammel: 22, ny: 25 },
    { gammel: 50, ny: 57 },
  ],
};

/** The pair the tool opens with: a one-point rate rise, the clearest case. */
export const PROCENTPOINT_START: ProcentpointPar = PROCENTPOINT_EKSEMPEL.rente[1];

/**
 * How a percentage change should be read in a sentence.
 *
 * The helper exists so the component and the page prose cannot disagree about
 * whether a negative point change is a loss or a gain, and so the Danish and
 * Swedish word for the same move is chosen in one place.
 */
export function procentpointRetning(
  gammel: number,
  ny: number,
  ord: { stigning: string; fald: string; uændret: string }
): string {
  const forskel = procentpointForskel(gammel, ny);
  if (forskel > 0) return ord.stigning;
  if (forskel < 0) return ord.fald;
  return ord.uændret;
}
