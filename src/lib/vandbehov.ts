/**
 * Estimate a daily water-intake guideline from body weight and exercise.
 *
 * A common rule of thumb is roughly 35 ml of fluid per kilogram of body
 * weight, with extra fluid to replace what is lost during exercise
 * (~0.5 litre per 30 minutes of activity). This is only a guideline — real
 * needs vary with climate, health and diet, and much fluid also comes from
 * food.
 */

export const ML_PR_KG = 35;
export const ML_PR_30_MIN_MOTION = 500;
const ML_PR_GLAS = 250;

export interface VandbehovResultat {
  liter: number;
  glas: number;
}

export function beregnVandbehov(
  vaegtKg: number,
  motionMinutter: number
): VandbehovResultat | null {
  if (!vaegtKg || vaegtKg <= 0) return null;

  const motion = motionMinutter > 0 ? motionMinutter : 0;
  const ml = vaegtKg * ML_PR_KG + (motion / 30) * ML_PR_30_MIN_MOTION;
  const liter = ml / 1000;

  return {
    liter: Math.round(liter * 100) / 100,
    glas: Math.round(ml / ML_PR_GLAS),
  };
}
