/**
 * Jod i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget jod
 * er der i …» (målt 10/10 2026, `suggestqueries.google.com`, hl=da: ost, mælk,
 * salt, æg og tang) og «hvor meget jod må man indtage» — og jod er den eneste
 * på denne side, hele danske befolkning kender fra køleskabet som «jod». De
 * øvrige «i madvarer»-sider svarede på jern, calcium, magnesium, kalium, zink,
 * fiber, sukker, salt, protein, kulhydrat, fedt og kalorier — men ingen svarede
 * på jodindholdet.
 *
 * **Hvor tallene kommer fra — og hvorfor ikke fra samme sted som de andre.**
 * USDA *SR Legacy* (udgaven 2018-04), som alle de andre madvaresider læser,
 * har slet ingen jodrækker: datasættets `food_nutrient.csv` indeholder ingen
 * eneste række med næringsstof 1100 (Iodine, I). Jod er derimod målt i USDA
 * *Foundation Foods*, der er den samling, hvor USDA selv analyserer råvarer med
 * hele næringsstofprofilen. Tallene herunder er læst ud af datasættets
 * CSV-sampakke (`FoodData_Central_foundation_food_csv_2026-04-30.zip`) uden
 * nøgle, pr. 100 g, næringsstof **1100 — Iodine, I (µg)**. Hver værdi bærer sin
 * `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 *
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Tallene er amerikanske målinger.** Det betyder noget for jod: amerikansk
 * mælk og æg ligger højere end danske, fordi amerikanske malkeanlæg og
 * foderstofkæden behandles med jodholdige desinfektionsmidler. Sidens
 * «vejledende tal»-boks siger det samme, så læseren ikke regner dansk mælk om
 * med et amerikansk tal.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers 2023) fastsætter et anbefalet indtag (AI) på
 * **150 µg om dagen for voksne kvinder og mænd**, et gennemsnitsbehov (AR) på
 * 120 µg og en øvre sikkerhedsgrænse (UL) på 600 µg. Kilde: NNR2023's
 * jodafsnit, {{@link https://pub.norden.org/nord2023-003/iodine-.html}}.
 * Kilden skriver også, at de vigtigste kilder er mejeriprodukter, saltvandsfisk,
 * æg, joderet salt og brød, at det gennemsnitlige indtag i Norden ligger på
 * 30–270 µg om dagen, at veganere og vegetarer uden tilskud er risikogrupper,
 * og at for meget jod typisk kommer fra tang eller for store doser i tilskud.
 */

/** NNR2023's anbefalede indtagelse (AI) for voksne kvinder og mænd, i µg. */
export const JOD_AI_UG = 150;

/** NNR2023's gennemsnitsbehov (AR) for voksne, i µg. */
export const JOD_AR_UG = 120;

/** NNR2023's øvre sikkerhedsgrænse (UL), i µg. */
export const JOD_UL_UG = 600;

/**
 * Den anbefaling, andelskolonnen regner ud fra: voksnes AI, fordi det er det
 * tal, der gælder for både kvinder og mænd.
 */
export const JOD_ANBEFALING_UG = JOD_AI_UG;

/** Kilden til jodtallet pr. `fdcId`. */
export const JOD_KILDE = {
  database: "USDA FoodData Central",
  dataset: "Foundation Foods",
  udgave: "2026-04-30",
  naeringsstof: "1100 Iodine, I (µg)",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/iodine-.html",
  sampakke:
    "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2026-04-30.zip",
} as const;

/** En jodkilde pr. 100 g fra kilden. */
export interface Jodvare {
  navn: string;
  /** USDA FoodData Central-fdcId for kildens egen række. */
  fdcId: number;
  /** Jod pr. 100 g i µg. */
  jod100g: number;
  /**
   * En almindelig dansk portion. Vægten er valgt af os — ikke noget kilden
   * opgiver.
   */
  portionGram: number;
}

/**
 * Jod pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1100. Listen er
 * bevidst kun de madvarer, der rent faktisk indeholder jod: salt, fisk og
 * skaldyr, æg, mælk, ost og yoghurt, og de enkelte grøntsager. Frugt, kød,
 * korn og brød er ikke målt i datasættet, og dem springer vi over. To
 * kildeværdier er målt til 0 (smør og tun) og vises med «—» i andelskolonnen
 * i stedet for at skjule, at kilden har målt dem.
 */
export const JODVARER: readonly Jodvare[] = [
  { navn: "Joderet salt", fdcId: 746775, jod100g: 5080, portionGram: 6 },
  { navn: "Torsk, atlantic, rå", fdcId: 2684444, jod100g: 113.7, portionGram: 150 },
  { navn: "Æggeblomme", fdcId: 329596, jod100g: 177, portionGram: 17 },
  { navn: "Krabbe, blå, konserveret", fdcId: 2684446, jod100g: 44.48, portionGram: 100 },
  { navn: "Feta, helmælk", fdcId: 2259796, jod100g: 48.44, portionGram: 30 },
  { navn: "Hytteost", fdcId: 2346384, jod100g: 45.69, portionGram: 100 },
  { navn: "Yoghurt, græsk, naturlig", fdcId: 2259794, jod100g: 42.28, portionGram: 200 },
  { navn: "Mælk, letmælk", fdcId: 321359, jod100g: 39.6, portionGram: 250 },
  { navn: "Mælk, sødmælk", fdcId: 322892, jod100g: 37.9, portionGram: 250 },
  { navn: "Minimælk", fdcId: 322559, jod100g: 35.7, portionGram: 250 },
  { navn: "Smøreost", fdcId: 2346385, jod100g: 34.93, portionGram: 30 },
  { navn: "Kærnemælk", fdcId: 2259792, jod100g: 34.16, portionGram: 250 },
  { navn: "Yoghurt, naturlig", fdcId: 2259793, jod100g: 32.33, portionGram: 200 },
  { navn: "Fløde, piskefløde", fdcId: 2346386, jod100g: 19.38, portionGram: 30 },
  { navn: "Laks, sockeye, vild, rå", fdcId: 2684440, jod100g: 18.38, portionGram: 125 },
  { navn: "Rejer, opdrættede, rå", fdcId: 2684443, jod100g: 13.64, portionGram: 100 },
  { navn: "Æg, helt", fdcId: 748967, jod100g: 49.1, portionGram: 60 },
  { navn: "Spinat, moden", fdcId: 1999633, jod100g: 6.088, portionGram: 100 },
  { navn: "Laks, atlantic, opdrættet, rå", fdcId: 2684441, jod100g: 3.242, portionGram: 125 },
  { navn: "Smør, saltet", fdcId: 790508, jod100g: 0, portionGram: 15 },
  { navn: "Tun, lys, konserveret i vand", fdcId: 334194, jod100g: 0, portionGram: 100 },
];

/** Jod-tal, formateret på dansk. Heltal til at starte med. */
export function jodTal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Henter en vare pr. navn. */
export function vareMedNavn(navn: string): Jodvare | undefined {
  const soegt = navn.trim().toLocaleLowerCase("da-DK");
  return JODVARER.find((v) => v.navn.toLocaleLowerCase("da-DK") === soegt);
}

/** Jod pr. 100 g for en vare, i µg. */
export function jod100g(vare: Jodvare): number {
  return vare.jod100g;
}

/** Jod i en given mængde gram, i µg. */
export function jodIgram(vare: Jodvare, gram: number): number {
  return (vare.jod100g * Math.max(0, gram)) / 100;
}

/** Hvor mange procent af voksnes anbefaling en given mængde dækker. */
export function andelAfAnbefaling(vare: Jodvare, gram = vare.portionGram): number {
  return (jodIgram(vare, gram) / JOD_ANBEFALING_UG) * 100;
}

/** Hvor mange gram af varen, der skal til for at dække voksnes anbefaling. */
export function gramForAnbefaling(vare: Jodvare): number {
  if (vare.jod100g <= 0) return Number.POSITIVE_INFINITY;
  return (JOD_ANBEFALING_UG / vare.jod100g) * 100;
}

/** Sorteret listen: mest jod pr. 100 g først. */
export function rangliste(): readonly Jodvare[] {
  return [...JODVARER].sort((a, b) => b.jod100g - a.jod100g);
}

/** Finder de varer, hvis navn indeholder søgningen (tom søgning giver alle). */
export function soegJodvarer(soegning: string): readonly Jodvare[] {
  const soegt = soegning.trim().toLocaleLowerCase("da-DK");
  if (soegt === "") return JODVARER;
  return JODVARER.filter((v) => v.navn.toLocaleLowerCase("da-DK").includes(soegt));
}
