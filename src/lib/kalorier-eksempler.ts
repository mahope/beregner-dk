/**
 * The worked example /kalorier quotes in its own metadata: an 80 kg man,
 * 180 cm, 30 years, moderately active.
 *
 * It is the same person /vaegttab uses (`vaegttabEksempelTal`), and it is not
 * the calculator's own default — `KalorieBeregner` starts at 75 kg and 175 cm
 * because those are the inputs a visitor is most likely to change. The example
 * is the round one a search result can quote.
 *
 * Every figure in the page's `description`, `metaTitle`, `metaDescription`,
 * `ogTitle` and its FAQ answers used to be typed into the sentence. That is the
 * drift the quality rules call out: the tool and the page are two
 * implementations of one calculation, and a change to the activity factor or to
 * the kcal-per-kilo constant silently leaves the search result promising
 * numbers the calculator no longer produces.
 *
 * So the sentences are built from the tool's own functions
 * ({@link beregnBmr}, {@link beregnTdee}, {@link kalorierForMaal} — the same
 * ones `KalorieBeregner` calls) and from the same constants the rest of the
 * site reads (`KALORIE_UNDERSKUD`, `PROTEIN_G_PER_KG`, `VAEGTTAB_KCAL_PR_KG`).
 * The page cannot disagree with the calculator, and the three languages cannot
 * disagree with each other. Danish is byte-identical to what it said before;
 * Swedish and Norwegian now separate thousands with a space, which is `Intl`'s
 * own separator and the one a reader of those languages sees on a receipt —
 * they used a Danish dot, so "2.759 kcal" reads as 2,759 kcal in running text.
 */

import { formatBelob } from "./format";
import type { Locale } from "./i18n";
import {
  beregnBmr,
  beregnTdee,
  KALORIE_UNDERSKUD,
  kalorierForMaal,
  PROTEIN_G_PER_KG,
  type AktivitetsNiveau,
  type KalorieMaal,
} from "./makroer";
import { VAEGTTAB_KCAL_PR_KG } from "./vaegttab-eksempler";

/**
 * Weekly weight loss the FAQ answers promise: a 500 kcal daily deficit is
 * 3.500 kcal a week, and 3.500 / 7.700 is 0,45 kg — the page has always
 * rounded that to half a kilo. It is stated rather than computed so the
 * sentence cannot start claiming 0,45 kg in one language and 0,5 in another.
 */
export const KALORIER_KG_PR_UGE = 0.5;

/**
 * How far an individual deviates from Mifflin-St Jeor, as the page states it
 * in all three languages. The formula's own published accuracy band; no source
 * is on file, so it is documented here rather than presented as sourced.
 */
export const KALORIER_USIKKERHED_PCT = { min: 10, maks: 15 } as const;

/** The assumptions the page's example states, kept in one place. */
export interface KalorierEksempel {
  vaegtKg: number;
  hoejdeCm: number;
  alder: number;
  aktivitet: AktivitetsNiveau;
}

export const KALORIER_EKSEMPEL: KalorierEksempel = {
  vaegtKg: 80,
  hoejdeCm: 180,
  alder: 30,
  aktivitet: "moderat" as AktivitetsNiveau,
};

export interface KalorierEksempelTal {
  /** Basal metabolic rate of the example man, Mifflin-St Jeor. */
  mandBmr: number;
  /** His daily energy expenditure at the example's activity level. */
  mandTdee: number;
  /** The same body, TDEE for a woman — the FAQ's comparison figure. */
  kvindeTdee: number;
  /** The tool's own weight-loss target: TDEE − {@link KALORIE_UNDERSKUD}. */
  dagligtMaal: number;
}

/**
 * The example's numbers, computed the way `KalorieBeregner` computes them:
 * the same BMR formula, the same activity factors and the same weight-loss
 * floor, so the goal the page quotes is the goal the tool recommends.
 */
export function kalorierEksempelTal(
  eksempel: KalorierEksempel = KALORIER_EKSEMPEL,
): KalorierEksempelTal {
  const mandBmr = beregnBmr("mand", eksempel.vaegtKg, eksempel.hoejdeCm, eksempel.alder);
  const mandTdee = beregnTdee(mandBmr, eksempel.aktivitet);
  const kvindeBmr = beregnBmr("kvinde", eksempel.vaegtKg, eksempel.hoejdeCm, eksempel.alder);
  return {
    mandBmr,
    mandTdee,
    kvindeTdee: beregnTdee(kvindeBmr, eksempel.aktivitet),
    dagligtMaal: kalorierForMaal(mandBmr, mandTdee, "tab"),
  };
}

/** The strings a visitor and Google both see in the page head, per language. */
export interface KalorierOverskrifter {
  description: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
}

/**
 * The page's answer-first metadata, in one of the site's three languages.
 *
 * Every number is `formatBelob` over {@link kalorierEksempelTal} or over
 * {@link KALORIER_EKSEMPEL}, so the search result and the calculator are the
 * same calculation. Danish keeps "1.780"; Swedish and Norwegian write
 * "1 780", which is `Intl`'s own separator and the only one a reader of those
 * languages sees.
 */
export function kalorierOverskrifter(
  locale: Locale,
  eksempel: KalorierEksempel = KALORIER_EKSEMPEL,
): KalorierOverskrifter {
  const { mandBmr, mandTdee } = kalorierEksempelTal(eksempel);
  const n = (vaerdi: number) => formatBelob(vaerdi, locale);
  const vaegt = n(eksempel.vaegtKg);
  const hoejde = n(eksempel.hoejdeCm);
  const aar = n(eksempel.alder);
  const grund = n(mandBmr);
  const forbrug = n(mandTdee);

  if (locale === "se") {
    return {
      description: `Hur många kalorier behöver du per dag? Man, ${vaegt} kg, ${hoejde} cm och ${aar} år: BMR ${grund} kcal och TDEE ${forbrug} kcal vid måttlig aktivitet.`,
      metaTitle: `Kalorikalkylator: man ${vaegt} kg, ${hoejde} cm = ${forbrug} kcal/dag`,
      metaDescription: `Ditt kaloribehov = BMR × aktivitetsfaktor. Man, ${vaegt} kg, ${hoejde} cm, ${aar} år: BMR ${grund} kcal, TDEE ${forbrug} kcal. Beräkna BMR, TDEE och makrofördelning.`,
      ogTitle: `Kalorikalkylator: man ${vaegt} kg, ${hoejde} cm = ${forbrug} kcal/dag`,
    };
  }

  if (locale === "no") {
    return {
      description: `Hvor mange kalorier trenger du per dag? Mann, ${vaegt} kg, ${hoejde} cm og ${aar} år: BMR ${grund} kcal og TDEE ${forbrug} kcal ved moderat aktivitet.`,
      metaTitle: "Hvor mange kalorier per dag? | Kalorikalkulator",
      metaDescription: `Ditt kaloribehov = BMR × aktivitetsfaktor. Mann, ${vaegt} kg, ${hoejde} cm, ${aar} år: BMR ${grund} kcal, TDEE ${forbrug} kcal. Beregn BMR, TDEE og makroer.`,
      ogTitle: "Hvor mange kalorier per dag? | Kalorikalkulator",
    };
  }

  return {
    description: `Hvor mange kalorier skal du have om dagen? Mand, ${vaegt} kg, ${hoejde} cm og ${aar} år: BMR ${grund} kcal og TDEE ${forbrug} kcal ved moderat aktivitet.`,
    metaTitle: `Kalorieberegner: ${vaegt} kg, ${hoejde} cm, ${aar} år, moderat = ${forbrug} kcal`,
    metaDescription: `Dit kaloriebehov = BMR × aktivitetsfaktor. Mand, ${vaegt} kg, ${hoejde} cm, ${aar} år: BMR ${grund} kcal, TDEE ${forbrug} kcal. Beregn BMR, TDEE og makroer.`,
    ogTitle: `Kalorieberegner: ${vaegt} kg, ${hoejde} cm, ${aar} år, moderat = ${forbrug} kcal`,
  };
}

/** One question and its answer, in the shape `page-data.ts` binds. */
export interface KalorierFaqItem {
  question: string;
  answer: string;
}

/**
 * The questions and answers `/kalorier` publishes, in one of the site's three
 * languages.
 *
 * These answers stayed behind in `page-data.ts` when the metadata moved, where
 * every figure was typed into the sentence — and `faqItems` is what
 * `FAQSchema` publishes as JSON-LD, so a Danish thousands separator here is a
 * Danish thousands separator in the search result too.
 *
 * So every number here is `formatBelob` over the same constants and the same
 * {@link kalorierEksempelTal} the calculator calls: the BMR and TDEE of the
 * example man and woman, the tool's own daily deficit and weight-loss target,
 * the protein ranges out of `PROTEIN_G_PER_KG`, and the kcal per kilo the rest
 * of the site reads. Danish is byte-identical to what it said before; Swedish
 * and Norwegian get the separator their language uses, and the values
 * themselves are unchanged.
 */
export function kalorierFaqItems(
  locale: Locale,
  eksempel: KalorierEksempel = KALORIER_EKSEMPEL,
): KalorierFaqItem[] {
  const { mandTdee, kvindeTdee, dagligtMaal } = kalorierEksempelTal(eksempel);
  const n = (vaerdi: number, dec = 0) => formatBelob(vaerdi, locale, dec);
  const vaegt = n(eksempel.vaegtKg);
  const hoejde = n(eksempel.hoejdeCm);
  const aar = n(eksempel.alder);
  const forbrug = n(mandTdee);
  const kvinde = n(kvindeTdee);
  const maal = n(dagligtMaal);
  const kilo = n(VAEGTTAB_KCAL_PR_KG);
  const dagUnderskud = n(KALORIE_UNDERSKUD);
  const prUge = n(KALORIER_KG_PR_UGE, 1);
  const usikkerMin = n(KALORIER_USIKKERHED_PCT.min);
  const usikkerMaks = n(KALORIER_USIKKERHED_PCT.maks);
  const protein = (maal: KalorieMaal) => {
    const interval = PROTEIN_G_PER_KG[maal];
    return `${n(interval.min, 1)}-${n(interval.max, 1)}g/kg`;
  };
  const vedligehold = protein("vedligehold");
  const tab = protein("tab");
  const opbyg = protein("opbyg");

  if (locale === "se") {
    return [
      {
        question: "Vad är skillnaden mellan BMR och TDEE?",
        answer: "BMR är kalorier i vila. TDEE är total daglig förbrukning inkl. aktivitet.",
      },
      {
        question: "Hur många kalorier för att gå ner i vikt?",
        answer: `Ät ca ${dagUnderskud} kcal under din TDEE, det ger ca ${prUge} kg minskning per vecka. Man, ${vaegt} kg, ${hoejde} cm och ${aar} år med måttlig aktivitet: ca ${maal} kcal per dag.`,
      },
      {
        question: "Hur mycket protein behöver jag?",
        answer: `Underhåll: ${vedligehold}. Viktminskning: ${tab}. Muskeluppbyggnad: ${opbyg}.`,
      },
      {
        question: "Är kalkylatorn korrekt?",
        answer: `Använder Mifflin-St Jeor-formeln. Individuella variationer kan vara ${usikkerMin}-${usikkerMaks}%.`,
      },
      {
        question: "Hur många kalorier behöver jag?",
        answer: `En man på ${vaegt} kg, ${hoejde} cm och ${aar} år med måttlig aktivitet har ett dagligt behov på ${forbrug} kcal. En kvinna med samma mått har ${kvinde} kcal. Skriv dina egna tal i verktyget för det exakta värdet.`,
      },
      {
        question: "Hur många kalorier behöver jag för att gå ner 1 kg?",
        answer: `Det går åt cirka ${kilo} kcal per kilo fett, så 1 kg kräver ett underskott på ${kilo} kcal som fördelas över en vecka. Det motsvarar ${dagUnderskud} kcal per dag.`,
      },
      {
        question: "Gäller kaloribehovet även barn?",
        answer:
          "Nej. Formeln är validerad för vuxna, och barn har ett helt annat behov per kilo. Använd en tabell för barn eller fråga en barnläkare. Kalorikalkylatorn räknar bara ut vuxnas behov.",
      },
      {
        question: "Är kalorikalkylatorn gratis?",
        answer:
          "Ja. Verktyget är en gratis webbplats — du behöver inte skapa ett konto, och det fungerar direkt i webbläsaren på dator och telefon.",
      },
    ];
  }

  if (locale === "no") {
    return [
      {
        question: "Hva er forskjellen på BMR og TDEE?",
        answer: "BMR er kalorier i hvile. TDEE er totalt daglig forbruk inkl. aktivitet.",
      },
      {
        question: "Hvor mange kalorier for å gå ned i vekt?",
        answer: `Spis ca ${dagUnderskud} kcal under din TDEE, det gir ca ${prUge} kg tap per uke. Mann, ${vaegt} kg, ${hoejde} cm og ${aar} år med moderat aktivitet: ca ${maal} kcal per dag.`,
      },
      {
        question: "Hvor mye protein trenger jeg?",
        answer: `Vedlikehold: ${vedligehold}. Vekttap: ${tab}. Muskelbygging: ${opbyg}.`,
      },
      {
        question: "Er kalkulatoren nøyaktig?",
        answer: `Bruker Mifflin-St Jeor-formelen. Individuelle variasjoner kan være ${usikkerMin}-${usikkerMaks}%.`,
      },
    ];
  }

  return [
    {
      question: "Hvad er forskellen på BMR og TDEE?",
      answer: "BMR er kalorier i hvile. TDEE er totalt dagligt forbrug inkl. aktivitet. TDEE = BMR × aktivitetsfaktor.",
    },
    {
      question: "Hvor mange kalorier for at tabe mig?",
      answer: `Spis ca. ${dagUnderskud} kcal under din TDEE, svarende til ca. ${prUge} kg tab pr. uge. Mand, ${vaegt} kg, ${hoejde} cm og ${aar} år med moderat aktivitet: ca. ${maal} kcal om dagen.`,
    },
    {
      question: "Hvad meget protein?",
      answer: `Vedligehold: ${vedligehold}. Vægttab: ${tab}. Muskelopbygning: ${opbyg}.`,
    },
    {
      question: "Er beregneren præcis?",
      answer: `Bruger Mifflin-St Jeor formlen. Individuelle variationer kan være ${usikkerMin}-${usikkerMaks}%.`,
    },
    {
      question: "Hvor mange kalorier skal jeg have?",
      answer: `En mand på ${vaegt} kg, ${hoejde} cm og ${aar} år med moderat aktivitet har et dagligt forbrug på ${forbrug} kcal. En kvinde på samme mål har ${kvinde} kcal. Skriv dine egne tal i værktøjet for det præcise tal.`,
    },
    {
      question: "Hvor mange kalorier skal jeg forbrænde for at tabe 1 kg?",
      answer: `Der skal bruges ca. ${kilo} kcal pr. kilo fedt, så 1 kg kræver et underskud på ${kilo} kcal fordelt over en uge. Det svarer til ${dagUnderskud} kcal om dagen.`,
    },
    {
      question: "Er kalorieberegneren gratis?",
      answer:
        "Ja. Værktøjet er en gratis hjemmeside — du skal ikke oprette en konto, og det virker direkte i browseren på computer og telefon.",
    },
  ];
}