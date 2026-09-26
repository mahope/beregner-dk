/**
 * Macronutrient split for the calorie calculator (/kalorier).
 *
 * Protein per kg body weight follows the ranges the page itself documents:
 * 0,8-1,2 g/kg for maintenance, 1,2-1,6 g/kg for weight loss (to protect
 * muscle) and 1,6-2,2 g/kg for muscle gain. The calculator uses the middle
 * of the selected range, so the tool and the page cannot drift apart.
 *
 * The midpoints are an estimate, not a prescription — the same disclaimer as
 * the page applies. Fat is 25 % of the calories, in the middle of the 20-25 %
 * band the page documents; carbohydrates take the remainder.
 */

export type KalorieMaal = "vedligehold" | "tab" | "opbyg";

export const MAAL_ORDRE: KalorieMaal[] = ["vedligehold", "tab", "opbyg"];

export const PROTEIN_G_PER_KG: Record<
  KalorieMaal,
  { min: number; max: number }
> = {
  vedligehold: { min: 0.8, max: 1.2 },
  tab: { min: 1.2, max: 1.6 },
  opbyg: { min: 1.6, max: 2.2 },
};

/** Fat as a share of total calories. */
export const FEDT_ANDEL = 0.25;

export const KCAL_PER_G = { protein: 4, fedt: 9, kulhydrater: 4 } as const;

export interface MakroInput {
  vaegtKg: number;
  kalorier: number;
  maal: KalorieMaal;
}

export interface MakroResultat {
  protein: number;
  fedt: number;
  kulhydrater: number;
  proteinGPerKg: number;
  proteinGPerKgMin: number;
  proteinGPerKgMax: number;
}

/** Midpoint of the documented protein range for the chosen goal, in g/kg. */
export function proteinGPerKg(maal: KalorieMaal): number {
  const { min, max } = PROTEIN_G_PER_KG[maal];
  return (min + max) / 2;
}

export function beregnMakroer({
  vaegtKg,
  kalorier,
  maal,
}: MakroInput): MakroResultat {
  const gPerKg = proteinGPerKg(maal);
  const protein = vaegtKg > 0 ? vaegtKg * gPerKg : 0;
  const fedt = (kalorier * FEDT_ANDEL) / KCAL_PER_G.fedt;
  const kulhydrater = Math.max(
    0,
    (kalorier - protein * KCAL_PER_G.protein - fedt * KCAL_PER_G.fedt) /
      KCAL_PER_G.kulhydrater
  );

  return {
    protein,
    fedt,
    kulhydrater,
    proteinGPerKg: gPerKg,
    proteinGPerKgMin: PROTEIN_G_PER_KG[maal].min,
    proteinGPerKgMax: PROTEIN_G_PER_KG[maal].max,
  };
}
