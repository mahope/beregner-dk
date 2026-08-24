/**
 * Estimate daily protein needs based on body weight and activity level.
 *
 * Guidelines from the Nordic Nutrition Recommendations 2023 and
 * the International Society of Sports Nutrition (ISSN):
 * - Sedentary: 0.8 g/kg (minimum adult RDA)
 * - Lightly active: 1.0 g/kg
 * - Moderately active: 1.3 g/kg
 * - Very active: 1.6 g/kg
 * - Elite/extreme: 2.0 g/kg
 *
 * These are general guidelines. Individual needs vary.
 */

export type Aktivitetsniveau =
  | "stillesiddende"
  | "let-aktiv"
  | "moderat-aktiv"
  | "meget-aktiv"
  | "ekstrem-aktiv";

export interface ProteinResultat {
  gram: number;
  min: number;
  max: number;
  faktor: number;
}

const aktivitetsFaktorer: Record<Aktivitetsniveau, number> = {
  stillesiddende: 0.8,
  "let-aktiv": 1.0,
  "moderat-aktiv": 1.3,
  "meget-aktiv": 1.6,
  "ekstrem-aktiv": 2.0,
};

export function beregnProteinbehov(
  vaegtKg: number,
  niveau: Aktivitetsniveau
): ProteinResultat | null {
  if (!vaegtKg || vaegtKg <= 0 || vaegtKg > 500) return null;

  const faktor = aktivitetsFaktorer[niveau];
  const gram = Math.round(vaegtKg * faktor);

  const min = Math.round(vaegtKg * 0.8);
  const max = Math.round(vaegtKg * 2.0);

  return { gram, min, max, faktor };
}