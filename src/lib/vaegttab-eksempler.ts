/**
 * The worked example /vaegttab quotes in its own metadata: an 80 kg man,
 * 180 cm, 30 years, moderately active, who wants to lose 6 kg in 12 weeks.
 *
 * Every figure in the page's `description`, `metaDescription`, `ogDescription`,
 * `schemaDescription` and title used to be typed into the sentence. That is
 * the drift the quality rules call out: the tool and the page are two
 * implementations of one calculation, and a change to the activity factor or
 * to the kcal-per-kilo constant silently leaves the search result promising
 * numbers the calculator no longer produces.
 *
 * So the sentences are built from the tool's own formula
 * ({@link beregnBmr} + {@link beregnTdee}, the same functions
 * `KalorieBeregner` and now `VaegttabBeregner` call) and the page cannot
 * disagree with the calculator. Danish is byte-identical to what it said
 * before; Swedish and Norwegian now separate thousands with a space, which is
 * what `Intl` and both languages' orthography want — they used a Danish dot.
 */

import { formatBelob } from "./format";
import { beregnBmr, beregnTdee, type AktivitetsNiveau } from "./makroer";
import type { Locale } from "./i18n";

/** Energy in one kilo of body fat, the figure every weight-loss plan rests on. */
export const VAEGTTAB_KCAL_PR_KG = 7700;

/** The assumptions the page's example states, kept in one place. */
export interface VaegttabEksempel {
  vaegtKg: number;
  hoejdeCm: number;
  alder: number;
  aktivitet: AktivitetsNiveau;
  tabKg: number;
  uger: number;
}

export const VAEGTTAB_EKSEMPEL: VaegttabEksempel = {
  vaegtKg: 80,
  hoejdeCm: 180,
  alder: 30,
  aktivitet: "moderat" as AktivitetsNiveau,
  tabKg: 6,
  uger: 12,
};

export interface VaegttabEksempelTal {
  /** Basal metabolic rate, Mifflin-St Jeor. */
  bmr: number;
  /** Daily energy expenditure at the example's activity level. */
  tdee: number;
  /** The whole weight loss expressed in kcal: 6 kg × 7.700. */
  samletUnderskud: number;
  /** Deficit per day, spread over the example's weeks: 46.200 / 84. */
  dagligtDeficit: number;
  /** Calories per day to hit the goal: TDEE − the daily deficit. */
  dagligtMaal: number;
}

/**
 * The example's five numbers, computed the way `VaegttabBeregner` computes
 * them: the same BMR formula, the same activity factors, the same kcal per kilo
 * spread evenly over the days in the chosen timeframe.
 */
export function vaegttabEksempelTal(
  eksempel: VaegttabEksempel = VAEGTTAB_EKSEMPEL,
): VaegttabEksempelTal {
  const bmr = beregnBmr("mand", eksempel.vaegtKg, eksempel.hoejdeCm, eksempel.alder);
  const tdee = beregnTdee(bmr, eksempel.aktivitet);
  const samletUnderskud = eksempel.tabKg * VAEGTTAB_KCAL_PR_KG;
  const dagligtDeficit = samletUnderskud / (eksempel.uger * 7);
  return {
    bmr,
    tdee,
    samletUnderskud,
    dagligtDeficit,
    dagligtMaal: tdee - dagligtDeficit,
  };
}

/** The four strings the page shows to a visitor and to Google, per language. */
export interface VaegttabOverskrifter {
  metaTitle: string;
  description: string;
  metaDescription: string;
  schemaDescription: string;
}

/**
 * The page's answer-first metadata, in one of the site's three languages.
 *
 * Every number is `formatBelob` over {@link vaegttabEksempelTal} or over
 * {@link VAEGTTAB_EKSEMPEL}, so the search result and the calculator are the
 * same calculation. Danish keeps "2.209"; Swedish and Norwegian write
 * "2 209", which is `Intl`'s own separator and the only one a reader of those
 * languages sees on a receipt.
 */
export function vaegttabOverskrifter(
  locale: Locale,
  eksempel: VaegttabEksempel = VAEGTTAB_EKSEMPEL,
): VaegttabOverskrifter {
  const { dagligtDeficit, dagligtMaal, tdee } = vaegttabEksempelTal(eksempel);
  const n = (vaerdi: number) => formatBelob(vaerdi, locale);
  const vaegt = n(eksempel.vaegtKg);
  const hoejde = n(eksempel.hoejdeCm);
  const aar = n(eksempel.alder);
  const tab = n(eksempel.tabKg);
  const uger = n(eksempel.uger);
  const underskud = n(dagligtDeficit);
  const maal = n(dagligtMaal);
  const forbrug = n(tdee);

  if (locale === "se") {
    return {
      metaTitle: `Viktminskning: ${tab} kg på ${uger} veckor = ${underskud} kcal/dag`,
      description: `Man på ${vaegt} kg, ${hoejde} cm och ${aar} år med måttlig aktivitet: ${tab} kg på ${uger} veckor kräver ${underskud} kcal i underskott, så du behöver äta ${maal} kcal per dag.`,
      metaDescription: `${tab} kg på ${uger} veckor kräver ${underskud} kcal i dagligt underskott. Man på ${vaegt} kg, ${hoejde} cm och ${aar} år: ät ${maal} kcal per dag (TDEE ${forbrug} kcal).`,
      schemaDescription: `Beräkna dagligt kaloriunderskott: ${tab} kg på ${uger} veckor är ${underskud} kcal/dag, så en man på ${vaegt} kg äter ${maal} kcal/dag.`,
    };
  }

  if (locale === "no") {
    return {
      metaTitle: `Vekttap: ${tab} kg på ${uger} uker = ${underskud} kcal/dag`,
      description: `Mann på ${vaegt} kg, ${hoejde} cm og ${aar} år med moderat aktivitet: ${tab} kg på ${uger} uker krever ${underskud} kcal i underskudd, så du må spise ${maal} kcal per dag.`,
      metaDescription: `${tab} kg på ${uger} uker krever ${underskud} kcal i daglig underskudd. Mann på ${vaegt} kg, ${hoejde} cm og ${aar} år: spis ${maal} kcal per dag (TDEE ${forbrug} kcal).`,
      schemaDescription: `Beregn daglig underskudd: ${tab} kg på ${uger} uker er ${underskud} kcal/dag, så en mann på ${vaegt} kg spiser ${maal} kcal/dag.`,
    };
  }

  return {
    metaTitle: `Vægttab: ${tab} kg på ${uger} uger = ${underskud} kcal/dag`,
    description: `Mand på ${vaegt} kg, ${hoejde} cm og ${aar} år med moderat aktivitet: ${tab} kg på ${uger} uger kræver ${underskud} kcal i underskud, så du skal spise ${maal} kcal om dagen.`,
    metaDescription: `${tab} kg på ${uger} uger kræver ${underskud} kcal i dagligt underskud. Mand på ${vaegt} kg, ${hoejde} cm og ${aar} år: spis ${maal} kcal om dagen (TDEE ${forbrug} kcal).`,
    schemaDescription: `Beregn dagligt kalorieunderskud: ${tab} kg på ${uger} uger er ${underskud} kcal/dag, så en mand på ${vaegt} kg spiser ${maal} kcal/dag.`,
  };
}
