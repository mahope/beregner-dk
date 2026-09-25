/**
 * Rough, clearly "vejledende" net-income estimate for one month.
 *
 * The month is annualised (x12) so personfradrag, beskæftigelsesfradrag and
 * the mellem-/topskat thresholds apply at a realistic level. It uses the
 * site-wide 2026 rates from satser-2026.ts and the average municipal tax.
 *
 * - Salary (also salary paid by the employer during leave) carries AM-bidrag
 *   and earns beskæftigelsesfradrag.
 * - Public benefits (barselsdagpenge, a-dagpenge, SU) carry no AM-bidrag and
 *   earn no beskæftigelsesfradrag, but are taxed as personal income.
 */

import { SATSER_2026 } from "../satser-2026";

export interface NettoInput {
  /** Salary for the month (AM-bidrag applies). */
  loen: number;
  /** Public benefits for the month (no AM-bidrag). */
  ydelse: number;
  /** Municipal tax rate as a decimal; defaults to the 2026 average. */
  kommuneskat?: number;
  /** Include average church tax. */
  kirkeskat?: boolean;
}

export interface NettoResult {
  brutto: number;
  amBidrag: number;
  skat: number;
  netto: number;
}

export function estimerNettoMaaned(input: NettoInput): NettoResult {
  const loen = Math.max(0, input.loen || 0);
  const ydelse = Math.max(0, input.ydelse || 0);
  const kommune = input.kommuneskat ?? SATSER_2026.kommuneskatSnit;
  const kirke = input.kirkeskat ? SATSER_2026.kirkeskatSnit : 0;

  const aarLoen = loen * 12;
  const aarYdelse = ydelse * 12;
  const am = aarLoen * SATSER_2026.amBidrag;
  const loenEfterAm = aarLoen - am;
  const personligIndkomst = loenEfterAm + aarYdelse;

  const beskaeftigelsesfradrag = Math.min(
    loenEfterAm * SATSER_2026.beskaeftigelsesfradragPct,
    SATSER_2026.beskaeftigelsesfradragMax
  );

  const bundGrundlag = Math.max(0, personligIndkomst - SATSER_2026.personfradrag);
  const skattepligtig = Math.max(
    0,
    personligIndkomst - SATSER_2026.personfradrag - beskaeftigelsesfradrag
  );

  const bundskat = bundGrundlag * SATSER_2026.bundskat;
  const kommuneOgKirke = skattepligtig * (kommune + kirke);
  const mellemskat =
    Math.max(0, personligIndkomst - SATSER_2026.mellemskatGraense) * SATSER_2026.mellemskat;
  const topskat =
    Math.max(0, personligIndkomst - SATSER_2026.topskatGraense) * SATSER_2026.topskat;
  const topTopskat =
    Math.max(0, personligIndkomst - SATSER_2026.topTopskatGraense) * SATSER_2026.topTopskat;

  const aarSkat = bundskat + kommuneOgKirke + mellemskat + topskat + topTopskat;
  const brutto = loen + ydelse;
  const amMaaned = am / 12;
  const skatMaaned = aarSkat / 12;

  return {
    brutto,
    amBidrag: amMaaned,
    skat: skatMaaned,
    netto: Math.max(0, brutto - amMaaned - skatMaaned),
  };
}
