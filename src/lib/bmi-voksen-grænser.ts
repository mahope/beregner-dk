/**
 * WHO's grænser for voksne BMI, som *data* med kilde — ikke som tal skrevet i
 * brødteksten (opgave 191, `/blog/bmi-voksen-saadan-tolk-er-du-tallet`).
 *
 * Hvorfor denne fil findes: `/bmi`'s side, `BMIBeregner` og det nye indlæg
 * skal alle sige det samme om, hvornår noget er undervægt, overvægt og fedme.
 * Skrevet i hver fil kunne de glide fra hinanden — og grænsen er netop den slags
 * tal, der ændrer sig, når en myndighed reviderer.
 *
 * **Kilden er hentet, ikke husket.** WHO's factsheet "Obesity and overweight",
 * opdateret 8. december 2025, hentet 1/10 2026. Den siger ordret:
 * "For adults: overweight is a BMI greater than or equal to 25; and obesity is
 * a BMI greater than or equal to 30." Undervægtsgrænsen (BMI < 18,5) står i
 * samme WHO-skala, som `/bmi`-siden og værktøjet allerede brugte, og WHO's
 * egen BMI-tabel (who.int/data/gho/.../body-mass-index) angiver under 18,5
 * som undervægt.
 *
 * WHO bruger **ikke** decimal-komma, og det gør vi heller ikke i koden:
 * tærsklerne er `number`, og det er formatteringen der sætter komma. Så en
 * fremtidig sats på 18,4 kan ikke få to forskellige stavemåder.
 */

/** Hvilken kilde tallene stammer fra, så en efterfølger kan genhente dem. */
export const BMI_KILDE = {
  organisation: "Verdenssundhedsorganisationen (WHO)",
  dokument: "Obesity and overweight (factsheet)",
  opdateret: "2025-12-08",
  url: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
  /** Tilstand, så indlægget kan sige hvor kilden er fra, uden at lyde som et juridisk dokument. */
  hentet: "1. oktober 2026",
} as const;

export interface BmiBaand {
  /** Nedre grænse, inklusive. */
  min: number;
  /** Øvre grænse, eksklusive. `null` = ingen øvre grænse. */
  max: number | null;
  /** Dansk navn på båndet. */
  dansk: string;
  /** Hvad WHO's egen factsheet bruger om båndet. */
  who: string;
}

/**
 * WHO's skala for voksne, i den rækkefølge læseren møder den.
 * `min` er inklusive og `max` er eksklusive, så båndene er disjunkte og
 * dækker hele linjen fra 0 — en læser kan ikke falde imellem to kategorier.
 */
export const BMI_BAAND: BmiBaand[] = [
  { min: 0, max: 18.5, dansk: "Undervægt", who: "underweight" },
  { min: 18.5, max: 25, dansk: "Normalvægt", who: "normal weight" },
  { min: 25, max: 30, dansk: "Overvægt", who: "overweight (BMI ≥ 25)" },
  { min: 30, max: 35, dansk: "Fedme, klasse I", who: "obesity class I" },
  { min: 35, max: 40, dansk: "Fedme, klasse II", who: "obesity class II" },
  { min: 40, max: null, dansk: "Fedme, klasse III", who: "obesity class III" },
];

/**
 * Hvilket bånd et BMI-tal ligger i.
 *
 * Kaster i stedet for at returnere `undefined`: et `undefined` her ville blive
 * vist som tom tekst i brødteksten, og det er præcis den stille fejl, der
 * gjorde `/promille`-s brødtekst ond at vedligeholde.
 */
export function bmiBaand(bmi: number): BmiBaand {
  if (!Number.isFinite(bmi)) throw new Error(`BMI skal være et tal: ${bmi}`);
  // `find` returnerer det *første* match, og grænsen skal give båndet ovenover.
  // Derfor får kun den nedre grænse en epsilon: BMI 25,0 skal være overvægt,
  // ikke normalvægt. Uden epsilon kunne et BMI på 24,999999999 (et
  // rasterfejl fra vægt/højde²) falde ned i båndet under, og læseren ville se
  // "Normalvægt" for et tal, der er over 25.
  const EPS = 1e-9;
  const fundet = BMI_BAAND.find((b) => bmi + EPS >= b.min && (b.max === null || bmi < b.max));
  if (!fundet) throw new Error(`BMI ${bmi} ligger uden for WHO's skala`);
  return fundet;
}

/**
 * Vægtintervallet for en given højde, i kilo. Frøder af BMI_BAAND, så det
 * ikke kan glide fra skalaen.
 *
 * Den øvre ende er **sidste decimal under båndets `max`**, altså 24,9 og ikke
 * 25,0 — 25,0 hører til næste bånd. Det er samme tal som `/bmi`'s egen
 * vægtinterval-mærkating ("BMI 18,5-24,9") og som FAQ'en, så indlægget og
 * værktøjet viser samme interval.
 */
export function vaegtInterval(
  hoejdeMeter: number,
  baand: BmiBaand,
): { min: number; max: number | null } {
  const h2 = hoejdeMeter * hoejdeMeter;
  const rund = (v: number) => Math.round(v * 10) / 10;
  return {
    min: rund(baand.min * h2),
    max: baand.max === null ? null : rund((baand.max - 0.1) * h2),
  };
}