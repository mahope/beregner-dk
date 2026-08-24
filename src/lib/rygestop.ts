/**
 * Calculate the money saved by quitting smoking ("rygestop").
 *
 * The daily tobacco cost is cigarettes per day × pack price ÷ pack size.
 * Savings are annualised over 365 days; a month is 365/12 days so that
 * day × 12 months = year exactly. Five years = 5 × 365 days.
 *
 * Prices are user-supplied, so results are indicative estimates only —
 * actual retail prices vary by brand and retailer, and Danish cigarette
 * prices are subject to scheduled tax increases through 2026-2028
 * (Aftale om sundere liv, regeringen 2025).
 */

export interface RygestopInput {
  cigaretterPrDag: number;
  pakkeprisKr: number;
  cigaretterPrPakke: number;
}

export interface RygestopResultat {
  /** Kr saved per day */
  dag: number;
  /** Kr saved per month (365/12 days) */
  maaned: number;
  /** Kr saved per year (365 days) */
  aar: number;
  /** Kr saved over five years (1825 days) */
  femAar: number;
  /** Packs consumed per day at current smoking rate */
  pakkerPrDag: number;
  /** Packs consumed per year (365 days) */
  pakkerPrAar: number;
}

const DAGE_PR_AAR = 365;

export function beregnRygestopBesparelse(
  cigaretterPrDag: number,
  pakkeprisKr: number,
  cigaretterPrPakke: number
): RygestopResultat | null {
  if (
    !cigaretterPrDag || cigaretterPrDag <= 0 || cigaretterPrDag > 100 ||
    !pakkeprisKr || pakkeprisKr <= 0 || pakkeprisKr > 500 ||
    !cigaretterPrPakke || cigaretterPrPakke <= 0 || cigaretterPrPakke > 100
  ) return null;

  const prisPrCigaret = pakkeprisKr / cigaretterPrPakke;
  const dag = cigaretterPrDag * prisPrCigaret;
  const aar = dag * DAGE_PR_AAR;

  return {
    dag,
    maaned: (aar / 12),
    aar,
    femAar: aar * 5,
    pakkerPrDag: cigaretterPrDag / cigaretterPrPakke,
    pakkerPrAar: (cigaretterPrDag / cigaretterPrPakke) * DAGE_PR_AAR,
  };
}
