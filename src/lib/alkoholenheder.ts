/**
 * Calculate Danish alcohol units ("genstande") from volume and ABV.
 *
 * 1 Danish alcohol unit = 12 g pure ethanol (Sundhedsstyrelsen).
 * Ethanol density at 20 °C = 0.789 g/ml.
 *
 * Formula: units = volume_cl × (abv_pct / 100) × 0.789 × 10 / 12
 * Simplified: units = volume_cl × abv_pct × 0.006575
 */

export interface AlkoholenhederInput {
  volumeCl: number;
  abvPct: number;
  antal: number;
}

export interface AlkoholenhederResultat {
  enhederPrDrink: number;
  enhederTotal: number;
  alkoholGramPrDrink: number;
  alkoholGramTotal: number;
}

const GRAM_PR_ENHED = 12;
const DENSITY = 0.789; // g/ml ethanol
const CL_TO_ML = 10;

export function beregnAlkoholenheder(
  volumeCl: number,
  abvPct: number,
  antal: number
): AlkoholenhederResultat | null {
  if (
    !volumeCl || volumeCl <= 0 || volumeCl > 500 ||
    !abvPct || abvPct <= 0 || abvPct > 100 ||
    !Number.isFinite(antal) || antal <= 0 || antal > 100
  ) return null;

  const alkoholGramPrDrink = volumeCl * CL_TO_ML * (abvPct / 100) * DENSITY;
  const enhederPrDrink = alkoholGramPrDrink / GRAM_PR_ENHED;

  return {
    enhederPrDrink,
    enhederTotal: enhederPrDrink * antal,
    alkoholGramPrDrink,
    alkoholGramTotal: alkoholGramPrDrink * antal,
  };
}