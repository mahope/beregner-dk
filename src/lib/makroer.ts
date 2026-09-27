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

export type KalorieKoen = "mand" | "kvinde";

export type AktivitetsNiveau =
  | "stillesiddende"
  | "let"
  | "moderat"
  | "aktiv"
  | "meget_aktiv";

/** Numeric activity multipliers — display text lives in the component labels. */
export const AKTIVITETS_FAKTORER: Record<AktivitetsNiveau, number> = {
  stillesiddende: 1.2,
  let: 1.375,
  moderat: 1.55,
  aktiv: 1.725,
  meget_aktiv: 1.9,
};

/** Daily deficit the tool uses for weight loss, and its gain counterpart. */
export const KALORIE_UNDERSKUD = 500;
export const KALORIE_OVERSKUD = 300;

/**
 * Mifflin-St Jeor. Moved out of the component so the page's "kalorier pr dag"
 * table is computed by the same function the calculator uses — the table
 * cannot drift from the tool.
 */
export function beregnBmr(
  koen: KalorieKoen,
  vaegtKg: number,
  hoejdeCm: number,
  alder: number,
): number {
  if (koen === "mand") {
    return 10 * vaegtKg + 6.25 * hoejdeCm - 5 * alder + 5;
  }
  return 10 * vaegtKg + 6.25 * hoejdeCm - 5 * alder - 161;
}

export function beregnTdee(bmr: number, aktivitet: AktivitetsNiveau): number {
  return bmr * AKTIVITETS_FAKTORER[aktivitet];
}

/**
 * Calories for a goal. The weight-loss floor is BMR — the body needs its
 * basal burn just to stay alive — so the recommendation can never promise a
 * deficit that is not physically possible.
 */
export function kalorierForMaal(
  bmr: number,
  tdee: number,
  maal: KalorieMaal,
): number {
  const bmrKcal = Math.round(bmr);
  if (maal === "tab") {
    return Math.max(bmrKcal, Math.round(tdee - KALORIE_UNDERSKUD));
  }
  if (maal === "opbyg") {
    return Math.round(tdee + KALORIE_OVERSKUD);
  }
  return Math.round(tdee);
}

/** The height, age and activity level the "kalorier pr dag" table assumes. */
export const PR_DAG_FORUDSETNINGER = {
  hoejdeCm: 180,
  alder: 30,
  aktivitet: "moderat" as AktivitetsNiveau,
};

export const PR_DAG_VAEGTE = [60, 70, 80, 90];

export interface KaloriePrDagRaekke {
  vaegtKg: number;
  mand: number;
  kvinde: number;
  tabMand: number;
  tabKvinde: number;
}

/**
 * The table answers "kalorier pr dag mand/kvinde" — the search cluster the
 * page had no visible text for. Every number is the tool's own output for the
 * stated assumptions, so the table is a set of examples, not a second truth.
 */
export function kaloriePrDagRaekker(
  vaegte: number[] = PR_DAG_VAEGTE,
): KaloriePrDagRaekke[] {
  const { hoejdeCm, alder, aktivitet } = PR_DAG_FORUDSETNINGER;
  return vaegte.map((vaegtKg) => {
    const mandBmr = beregnBmr("mand", vaegtKg, hoejdeCm, alder);
    const kvindeBmr = beregnBmr("kvinde", vaegtKg, hoejdeCm, alder);
    const mandTdee = beregnTdee(mandBmr, aktivitet);
    const kvindeTdee = beregnTdee(kvindeBmr, aktivitet);
    return {
      vaegtKg,
      mand: kalorierForMaal(mandBmr, mandTdee, "vedligehold"),
      kvinde: kalorierForMaal(kvindeBmr, kvindeTdee, "vedligehold"),
      tabMand: kalorierForMaal(mandBmr, mandTdee, "tab"),
      tabKvinde: kalorierForMaal(kvindeBmr, kvindeTdee, "tab"),
    };
  });
}

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
