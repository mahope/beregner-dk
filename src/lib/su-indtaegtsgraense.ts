/**
 * "Hvor meget må jeg tjene ved siden af min SU?" — the SU income ceiling.
 *
 * This is the single most searched question about SU in Denmark (Google's
 * own Danish autocomplete ranks «hvor meget må man tjene ved siden af SU»
 * first under "hvor meget", measured 3/10), and it is also what a student
 * actually asks in August when a summer job pays out. The site had the five
 * 2026 monthly rates as a *table* on /su, but no tool that turns them into an
 * answer, and `grep -rn "fælleshold|partner" src/` returned 0 hits: the
 * income limit is individual, per person, and not shared with a partner or
 * household. su.dk says the same in its own words — "Din egenindkomst må
 * ikke være større end dit årsfribeløb" — so nothing here models a household.
 *
 * The rules, in the form su.dk states them
 * (https://www.su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/satser-for-maanedsfribeloeb,
 * fetched 3/10):
 *
 * - The year consists of 12 months, each with its own monthly free allowance,
 *   and årsfribeløbet is the sum of those 12. There is **no** monthly
 *   threshold on the year's income as a whole: one big month and one empty
 *   month can cancel out. That is su.dk's own wording ("det betyder ikke
 *   noget, at du en måned tjener et meget stort beløb og den næste måned
 *   slet ikke tjener noget"), so {@link maanedGrænse} is advisory, not a
 *   rule the student is measured against.
 * - The rates are **before tax, after AM-bidrag**. Every figure here is
 *   therefore an *after-AM* number, and the one conversion this module offers
 *   is back to a gross wage a student can recognise from a payslip.
 * - A child under 18 adds to the year, not to a month.
 * - A month with a handicap supplement uses the reduced rate instead of the
 *   normal one; the remaining months follow the chosen study status.
 *
 * All rates come from {@link SU_2026.freeAllowance} — the same object the
 * existing table, the FAQ and /su's own SU calculator read, so a rate change
 * in one place moves the tool, the prose and the table together.
 */

import { SATSER_2026, SU_2026 } from "./satser-2026";

/** Which of the three published monthly rates a month uses. */
export type FribeloeStatus =
  /** Lavste månedsfribeløb — the months you receive SU (slutlån and dobbelt SU count as SU). */
  | "laveste"
  /** Mellemste månedsfribeløb — enrolled but without SU (orlov, study-inactive, unpaid placement). */
  | "mellemste"
  /** Højeste månedsfribeløb — the months you are not studying at all. */
  | "hoejeste";

export interface IndtaegtsgraenseInput {
  /** Which education the student is on; picks the SU-month rate. */
  education: "videregaaende" | "ungdom";
  /** How many of the 12 months the year contains SU. 0-12. */
  suMonths: number;
  /** The rate the months without SU use. */
  statusUdenSu: Exclude<FribeloeStatus, "laveste">;
  /** Number of children under 18; each adds to the year, not to a month. */
  childUnder18: number;
  /** Whether a month with a handicap supplement uses the reduced rate. */
  handicaptillaeg: boolean;
}

export interface IndtaegtsgraenseResult {
  /** The monthly rate used in the SU months, after AM-bidrag. */
  maanedMedSu: number;
  /** The monthly rate used in the months without SU, after AM-bidrag. */
  maanedUdenSu: number;
  /** The sum of all 12 months plus any children. The hard ceiling. */
  aarsfribeloeb: number;
  /** `aarsfribeloeb` spread over 12 — what an even monthly income may be. */
  aarsGennemsnitPrMaaned: number;
  /**
   * The same year split as the rate each month actually uses. Advisory:
   * su.dk measures the year as a whole, so a month over this is not by itself
   * a problem as long as the year stays under {@link aarsfribeloeb}.
   */
  maanedGrænse: number;
  /**
   * The gross wage that leaves {@link maanedGrænse} after AM-bidrag, so the
   * student can compare it with the figure on a payslip. Rounded down to a
   * whole krone, so the number never promises a krone too much.
   */
  maanedBrutto: number;
  /** {@link maanedBrutto} over 12 months — the gross figure for the year. */
  aarsBrutto: number;
  /** What each child under 18 adds to the year. */
  barnUnder18: number;
  /** Months in the year that do not receive SU. */
  maanederUdenSu: number;
}

/** The 2026 rate for a month in the given status, after AM-bidrag. */
export function maanedssats(status: FribeloeStatus, education: "videregaaende" | "ungdom"): number {
  switch (status) {
    case "laveste":
      return education === "ungdom"
        ? SU_2026.freeAllowance.youthWithSu
        : SU_2026.freeAllowance.videregaaendeWithSu;
    case "mellemste":
      return SU_2026.freeAllowance.enrolledWithoutSu;
    case "hoejeste":
      return SU_2026.freeAllowance.notStudying;
  }
}

/** The reduced rate that a month with a handicap supplement uses. */
export function handicapMaanedsSats(): number {
  return SU_2026.freeAllowance.disabilityMonth;
}

/** What one child under 18 adds to the year. */
export function barnUnder18Tillaeg(): number {
  return SU_2026.freeAllowance.childUnder18Annual;
}

/**
 * The gross wage that leaves `afterAM` when AM-bidrag is deducted, rounded
 * down. Rounding down is the safe direction: the gross figure is what the
 * student must stay *under*, so a rounded-up number could promise a krone
 * that pushes the year over the limit.
 */
export function bruttoForEfterAM(afterAM: number): number {
  return Math.floor(afterAM / (1 - SATSER_2026.amBidrag));
}

const clampMonths = (value: unknown): number => {
  const number = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.min(12, Math.max(0, number));
};

const clampChildren = (value: unknown): number => {
  const number = typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : 0;
  return Math.min(12, Math.max(0, number));
};

/**
 * The year's income ceiling for one student, or `null` when the input names
 * no situation at all (neither education nor months nor children), so a
 * caller cannot render a ceiling for a stranger who answered nothing.
 */
export function beregnIndtaegtsgraense(value: unknown): IndtaegtsgraenseResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Partial<IndtaegtsgraenseInput>;

  const education = input.education === "ungdom" ? "ungdom" : "videregaaende";
  const suMonths = clampMonths(input.suMonths);
  const childUnder18 = clampChildren(input.childUnder18);
  const statusUdenSu: Exclude<FribeloeStatus, "laveste"> =
    input.statusUdenSu === "hoejeste" ? "hoejeste" : "mellemste";
  const handicaptillaeg = input.handicaptillaeg === true;
  const maanederUdenSu = 12 - suMonths;

  // Nothing was answered: no education type, no months, no children. A year
  // of nothing still has a 12 × mellemste ceiling, so returning it would look
  // like an answer to a question nobody asked.
  if (input.education !== "videregaaende" && input.education !== "ungdom" && suMonths === 0 && childUnder18 === 0) {
    return null;
  }

  const maanedMedSu = handicaptillaeg ? handicapMaanedsSats() : maanedssats("laveste", education);
  const maanedUdenSu = maanedssats(statusUdenSu, education);
  const barnTillaeg = barnUnder18Tillaeg();
  const aarsfribeloeb =
    maanedMedSu * suMonths + maanedUdenSu * maanederUdenSu + childUnder18 * barnTillaeg;
  const maanedGrænse = maanederUdenSu > 0 ? aarsfribeloeb / 12 : maanedMedSu;
  const aarsGennemsnitPrMaaned = aarsfribeloeb / 12;

  return {
    maanedMedSu,
    maanedUdenSu,
    aarsfribeloeb,
    aarsGennemsnitPrMaaned,
    maanedGrænse,
    maanedBrutto: bruttoForEfterAM(maanedGrænse),
    aarsBrutto: bruttoForEfterAM(aarsfribeloeb),
    barnUnder18: barnTillaeg,
    maanederUdenSu,
  };
}
