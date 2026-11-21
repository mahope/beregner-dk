import { SATSER_2026 } from "./satser-2026";

/**
 * Fælles skatteberegning for dansk indkomstskat 2026.
 *
 * Bruges af både BruttoNettoBeregner (netto → brutto) og
 * SkatteprocentBeregner (brutto → skatteopgørelse), så de to aldrig kan glide
 * fra hinanden. Satserne læses fra `SATSER_2026` — samme kilde som
 * KirkeskatBeregner og TopskatBeregner bruger.
 *
 * Modellen følger skm.dk's opgørelse: AM-bidrag af brutto, beskæftigelsesfradrag
 * af indkomst efter AM, personfradrag trukket fra, og grænserne for mellemskat
 * og topskat måles efter AM-bidrag.
 */

const AM = SATSER_2026.amBidrag;
const BUNDSKAT = SATSER_2026.bundskat;
const MELLEMSKAT_GRAENSE = SATSER_2026.mellemskatGraense;
const MELLEMSKAT = SATSER_2026.mellemskat;
const TOPSKAT_GRAENSE = SATSER_2026.topskatGraense;
const TOPSKAT_SATS = SATSER_2026.topskat;
const TOP_TOPSKAT_GRAENSE = SATSER_2026.topTopskatGraense;
const TOP_TOPSKAT = SATSER_2026.topTopskat;
const PERSONFRADRAG = SATSER_2026.personfradrag;
const BESK_FRADRAG_PCT = SATSER_2026.beskaeftigelsesfradragPct;
const BESK_FRADRAG_MAX = SATSER_2026.beskaeftigelsesfradragMax;

export interface Skattebrutto {
  bruttoAar: number;
  amBidrag: number;
  indkomstEfterAm: number;
  beskFradrag: number;
  skattepligtig: number;
  bundSkat: number;
  kommuneSkat: number;
  kirkeSkat: number;
  mellemSkat: number;
  topSkat: number;
  topTopSkat: number;
  samletSkat: number;
  /** Effektiv skattesats i procent (samlet skat / brutto). */
  effektivSkat: number;
  nettoAar: number;
  betalerMellemskat: boolean;
  betalerTopskat: boolean;
}

/**
 * Regner hele skatteopgørelsen for en given bruttoløn.
 * `komPct` og `kirPct` er kommuneskat og kirkeskat som brøkdel (0,25 = 25 %).
 * `null` for en indkomst der ikke er et positivt tal.
 */
export function beregnSkat(
  bruttoAar: number,
  komPct: number,
  kirPct: number
): Skattebrutto | null {
  if (typeof bruttoAar !== "number" || !Number.isFinite(bruttoAar) || bruttoAar <= 0) {
    return null;
  }
  const amBidrag = bruttoAar * AM;
  const indkomstEfterAm = bruttoAar - amBidrag;
  const beskFradrag = Math.min(indkomstEfterAm * BESK_FRADRAG_PCT, BESK_FRADRAG_MAX);
  const skattepligtig = Math.max(0, indkomstEfterAm - PERSONFRADRAG - beskFradrag);
  const bundSkat = skattepligtig * BUNDSKAT;
  const kommuneSkat = skattepligtig * komPct;
  const kirkeSkat = skattepligtig * kirPct;
  const mellemSkat = Math.max(0, indkomstEfterAm - MELLEMSKAT_GRAENSE) * MELLEMSKAT;
  const topSkat = Math.max(0, indkomstEfterAm - TOPSKAT_GRAENSE) * TOPSKAT_SATS;
  const topTopSkat = Math.max(0, indkomstEfterAm - TOP_TOPSKAT_GRAENSE) * TOP_TOPSKAT;
  const samletSkat = amBidrag + bundSkat + kommuneSkat + kirkeSkat + mellemSkat + topSkat + topTopSkat;
  return {
    bruttoAar,
    amBidrag,
    indkomstEfterAm,
    beskFradrag,
    skattepligtig,
    bundSkat,
    kommuneSkat,
    kirkeSkat,
    mellemSkat,
    topSkat,
    topTopSkat,
    samletSkat,
    effektivSkat: bruttoAar > 0 ? (samletSkat / bruttoAar) * 100 : 0,
    nettoAar: bruttoAar - samletSkat,
    betalerMellemskat: indkomstEfterAm > MELLEMSKAT_GRAENSE,
    betalerTopskat: indkomstEfterAm > TOPSKAT_GRAENSE,
  };
}

/**
 * Finder den bruttoløn der giver en ønsket nettoløn, via binær søgning.
 * Bruges af BruttoNettoBeregner (netto → brutto).
 */
export function findBruttoFraNetto(
  oensketNettoAar: number,
  komPct: number,
  kirPct: number
): number {
  let low = oensketNettoAar;
  let high = oensketNettoAar * 3;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const svar = beregnSkat(mid, komPct, kirPct);
    if (svar === null) return oensketNettoAar;
    const netto = svar.nettoAar;
    if (Math.abs(netto - oensketNettoAar) < 1) return mid;
    if (netto < oensketNettoAar) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
