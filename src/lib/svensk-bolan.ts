/**
 * Swedish mortgage (bolån) model for 2026.
 *
 * Implements the amortisation requirement in force from 1 April 2026
 * (lag 2026:226): the requirement depends only on the loan-to-value ratio
 * (belåningsgrad), capped at 2 % per year. The older skuldkvot rule
 * (+1 % for loans over 4.5× income) and the 85 % cap were removed; the
 * mortgage cap (bolånetak) is now 90 % of the home's value.
 *
 * Also applies the Swedish interest deduction (ränteavdrag): 30 % of the
 * annual interest up to a 100 000 kr deficit, 21 % above it.
 */

export const SVENSK_BOLAN_2026 = {
  bolanetak: 0.9, // max 90 % belåningsgrad vid köp (min 10 % kontantinsats)
  amorteringHog: 0.02, // ≥ 2 % per år vid belåningsgrad över 70 %
  amorteringLag: 0.01, // ≥ 1 % per år vid belåningsgrad 50–70 %
  amorteringGransHog: 0.7,
  amorteringGransLag: 0.5,
  ranteavdrag: 0.3, // 30 % upp till 100 000 kr underskott
  ranteavdragHog: 0.21, // 21 % på underskott över 100 000 kr
  ranteavdragBrytpunkt: 100000,
} as const;

export interface SvenskBolanResultat {
  bostadsvarde: number;
  lanebelopp: number;
  kontantinsats: number;
  belaningsgrad: number; // 0–1
  amorteringstakt: number; // 0, 0.01 eller 0.02
  arligAmortering: number;
  manadsAmortering: number;
  arligRanta: number;
  manadsRanta: number;
  ranteavdragArligt: number;
  manadskostnadBrutto: number; // ränta + amortering
  manadskostnadEfterAvdrag: number; // efter ränteavdrag
  overBolanetak: boolean;
  maxLan: number; // 90 % av bostadsvärdet
}

/** Required annual amortisation rate from the 2026 LTV-based rules. */
export function amorteringstaktForBelaningsgrad(belaningsgrad: number): number {
  if (belaningsgrad > SVENSK_BOLAN_2026.amorteringGransHog) return SVENSK_BOLAN_2026.amorteringHog;
  if (belaningsgrad > SVENSK_BOLAN_2026.amorteringGransLag) return SVENSK_BOLAN_2026.amorteringLag;
  return 0;
}

/** Swedish interest deduction on a given annual interest cost. */
export function beregnRanteavdrag(arligRanta: number): number {
  const b = SVENSK_BOLAN_2026;
  const lag = Math.min(arligRanta, b.ranteavdragBrytpunkt) * b.ranteavdrag;
  const hog = Math.max(0, arligRanta - b.ranteavdragBrytpunkt) * b.ranteavdragHog;
  return lag + hog;
}

export function beregnSvenskBolan(
  bostadsvarde: number,
  lanebelopp: number,
  rantaProcent: number
): SvenskBolanResultat | null {
  if (!bostadsvarde || bostadsvarde <= 0 || !lanebelopp || lanebelopp <= 0) return null;

  const lan = Math.min(lanebelopp, bostadsvarde); // kan inte låna mer än värdet
  const belaningsgrad = lan / bostadsvarde;
  const amorteringstakt = amorteringstaktForBelaningsgrad(belaningsgrad);

  const arligAmortering = lan * amorteringstakt;
  const arligRanta = lan * (rantaProcent / 100);
  const ranteavdragArligt = beregnRanteavdrag(arligRanta);
  const arligRantaEfterAvdrag = arligRanta - ranteavdragArligt;

  return {
    bostadsvarde,
    lanebelopp: lan,
    kontantinsats: bostadsvarde - lan,
    belaningsgrad,
    amorteringstakt,
    arligAmortering: Math.round(arligAmortering),
    manadsAmortering: Math.round(arligAmortering / 12),
    arligRanta: Math.round(arligRanta),
    manadsRanta: Math.round(arligRanta / 12),
    ranteavdragArligt: Math.round(ranteavdragArligt),
    manadskostnadBrutto: Math.round((arligRanta + arligAmortering) / 12),
    manadskostnadEfterAvdrag: Math.round((arligRantaEfterAvdrag + arligAmortering) / 12),
    overBolanetak: lanebelopp > bostadsvarde * SVENSK_BOLAN_2026.bolanetak,
    maxLan: Math.round(bostadsvarde * SVENSK_BOLAN_2026.bolanetak),
  };
}
