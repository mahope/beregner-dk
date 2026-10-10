/**
 * C-vitamin: anbefaling og madkilder. Baggrunden er den danske
 * autocomplete-klynge «hvor meget vitamin c skal man have om dagen»,
 * «… c vitamin om dagen» og «hvor meget c vitamin» (målt 10/10 2026,
 * `suggestqueries.google.com`, hl=da: C-vitamin er den næststørste klynge
 * under «hvor meget vitamin», lige efter D-vitamin). `/kalorier` svarede på
 * energien og de øvrige «i madvarer»-sider på jern, fiber, protein,
 * kulhydrater, fedt, sukker, salt og D-vitamin — men ingen side svarede på,
 * hvor meget C-vitamin kroppen har brug for.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Lykkesfeldt & Carr 2023) angiver anbefalet
 * indtagelse (RI) på **95 mg om dagen for voksne kvinder og 110 mg for voksne
 * mænd**, gennemsnitsbehovet (AR) er 75 mg for kvinder og 90 mg for mænd, og
 * personer, der ryger, skal have ca. 40 mg mere dagen fra kosten. NNR2023
 * sætter ingen øvre sikkerhedsgrænse (UL) for C-vitamin. Kilde: NNR2023's
 * C-vitaminafsnit, {{@link https://pub.norden.org/nord2023-003/vitamin-c.html}}.
 *
 * **Madindholdet er USDA's.** Hvert tal pr. 100 g er læst af USDA FoodData
 * Central, datasættet *SR Legacy*, udgaven 2018-04, næringsstof **1162
 * (401) — Vitamin C, total ascorbic acid, mg**. Rækkerne er trukket fra
 * sampakken `FoodData_Central_sr_legacy_food_csv_2018-04.zip` på
 * fdc.nal.usda.gov uden nøgle, og hver værdi bærer sin `fdcId`, så den kan
 * slås op: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 *
 * Listen dækker de kilder, der danskere rent faktisk spiser: nordenfrugt og
 * -grønt (solbær, jordbær, hindbær, kål, kartoffel), de grøntsager og krydderurter
 * med virkelig høje indhold (rød peberfrugt, grønkål, broccoli, rosenkål,
 * persille) og de importerede frugter, der gør det samme (kiwi, appelsin,
 * papaya, ananas, mango). Gulerod og pære er med, fordi de ofte nævnes som
 * C-kilder, men ikke holder — lige som vandmelon og agurk.
 *
 * De rækker, der også ligger på kaloriesiden, bruger nøjagtig de samme
 * `fdcId`-er, så de to sider ikke kan blive uenige. Undtagelsen er æble:
 * SR Legacy har ingen C-vitaminværdi for «Apples, raw, golden delicious»
 * (kaloriesidens række), så siden bruger kildens fælles æble-række, «Apples,
 * raw, with skin», til gengæld med dens egen fdcId.
 */

/** NNR2023's anbefalede indtagelse (RI) for voksne kvinder, i mg. */
export const VITAMIN_C_RI_KVINDE_MG = 95;

/** NNR2023's anbefalede indtagelse (RI) for voksne mænd, i mg. */
export const VITAMIN_C_RI_MAND_MG = 110;

/** NNR2023's gennemsnitsbehov (AR) for kvinder, i mg. */
export const VITAMIN_C_AR_KVINDE_MG = 75;

/** NNR2023's gennemsnitsbehov (AR) for mænd, i mg. */
export const VITAMIN_C_AR_MAND_MG = 90;

/**
 * Hvor meget mere fra kosten personer, der ryger, skal have ifølge NNR2023, i mg.
 */
export const VITAMIN_C_RYGENDE_EKSTRA_MG = 40;

/**
 * Den anbefaling, andelskolonnen regner ud fra: kvinders RI, fordi det er det
 * laveste af de to kønstal — så kan ingen andel blive overvurderet.
 */
export const VITAMIN_C_ANBEFALING_MG = VITAMIN_C_RI_KVINDE_MG;

/** Kilden til C-vitamintallet pr. `fdcId`. */
export const VITAMIN_C_KILDE = {
  database: "USDA FoodData Central",
  dataset: "SR Legacy",
  udgave: "2018-04",
  naeringsstof: "1162 (401) Vitamin C, total ascorbic acid, mg",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/vitamin-c.html",
} as const;

/** En C-vitaminkilde pr. 100 g fra kilden. */
export interface VitaminCVare {
  navn: string;
  /** USDA FoodData Central-fdcId for kildens egen række. */
  fdcId: number;
  /** C-vitamin pr. 100 g i mg. */
  c100g: number;
  /**
   * En portion, som siden bruger til andelskolonnen. Vægten er vores eget
   * valg af almindelig dansk servering — ikke noget kilden opgiver.
   */
  portionGram: number;
}

/**
 * C-vitamin pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1162. Tallene
 * er rå, hvor kilden adskiller: kartoffel har 19,7 mg rå og 13,0 mg kogt, fordi
 * vandtabske C-vitamin opløses i kogevandet.
 */
export const VITAMIN_C_VARER: readonly VitaminCVare[] = [
  { navn: "Solbær", fdcId: 173963, c100g: 181.0, portionGram: 100 },
  { navn: "Persille, frisk", fdcId: 170416, c100g: 133.0, portionGram: 5 },
  { navn: "Peberfrugt, rød, rå", fdcId: 170108, c100g: 127.7, portionGram: 80 },
  { navn: "Grønkål, rå", fdcId: 168421, c100g: 93.4, portionGram: 100 },
  { navn: "Kiwi, grøn, rå", fdcId: 168153, c100g: 92.7, portionGram: 75 },
  { navn: "Broccoli, rå", fdcId: 170379, c100g: 89.2, portionGram: 100 },
  { navn: "Rosenkål, rå", fdcId: 170383, c100g: 85.0, portionGram: 100 },
  { navn: "Kålrabi, rå", fdcId: 168424, c100g: 62.0, portionGram: 100 },
  { navn: "Papaya, rå", fdcId: 169926, c100g: 60.9, portionGram: 100 },
  { navn: "Jordbær, rå", fdcId: 167762, c100g: 58.8, portionGram: 150 },
  { navn: "Rødkål, rå", fdcId: 169977, c100g: 57.0, portionGram: 100 },
  { navn: "Appelsin, rå", fdcId: 169097, c100g: 53.2, portionGram: 130 },
  { navn: "Blomkål, rå", fdcId: 169986, c100g: 48.2, portionGram: 100 },
  { navn: "Ananas, rå", fdcId: 169124, c100g: 47.8, portionGram: 100 },
  { navn: "Hvidkål, rå", fdcId: 169975, c100g: 36.6, portionGram: 100 },
  { navn: "Mango, rå", fdcId: 169910, c100g: 36.4, portionGram: 100 },
  { navn: "Spinet, rå", fdcId: 168462, c100g: 28.1, portionGram: 50 },
  { navn: "Hindbær, rå", fdcId: 167755, c100g: 26.2, portionGram: 100 },
  { navn: "Kartoffel, rå", fdcId: 170026, c100g: 19.7, portionGram: 200 },
  { navn: "Tomat, rå", fdcId: 170457, c100g: 13.7, portionGram: 100 },
  { navn: "Banan, rå", fdcId: 173944, c100g: 8.7, portionGram: 120 },
  { navn: "Æble, rå", fdcId: 171688, c100g: 4.6, portionGram: 130 },
  { navn: "Gulerod, rå", fdcId: 170393, c100g: 5.9, portionGram: 75 },
];

/**
 * C-vitamin i kogt kartoffel uden salt, pr. 100 g, fra kildens række
 * «Potatoes, boiled, cooked in skin, flesh, with salt» (fdcId 170114).
 * Bruges til at vise, hvor meget taber ved kogning.
 */
export const KARTOFFEL_KOGT_C_MG_100G = 13.0;

/** C-vitamin-tal, formateret på dansk. Heltal til at starte med. */
export function vitaminCTal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Henter en vare pr. navn. */
export function vareMedNavn(navn: string): VitaminCVare | undefined {
  const soegt = navn.trim().toLocaleLowerCase("da-DK");
  return VITAMIN_C_VARER.find((v) => v.navn.toLocaleLowerCase("da-DK") === soegt);
}

/** C-vitamin pr. 100 g for en vare, i mg. */
export function c100g(vare: VitaminCVare): number {
  return vare.c100g;
}

/** C-vitamin i en given mængde gram, i mg. */
export function cIgram(vare: VitaminCVare, gram: number): number {
  return (vare.c100g * Math.max(0, gram)) / 100;
}

/** Hvor mange procent af kvinders RI en given mængde dækker. */
export function andelAfAnbefaling(vare: VitaminCVare, gram = vare.portionGram): number {
  return (cIgram(vare, gram) / VITAMIN_C_ANBEFALING_MG) * 100;
}

/** Hvor mange gram af varen, der skal til for at dække kvinders RI. */
export function gramForAnbefaling(vare: VitaminCVare): number {
  if (vare.c100g <= 0) return Number.POSITIVE_INFINITY;
  return (VITAMIN_C_ANBEFALING_MG / vare.c100g) * 100;
}

/** Sorteret listen: mest C-vitamin pr. 100 g først. */
export function rangliste(): readonly VitaminCVare[] {
  return [...VITAMIN_C_VARER].sort((a, b) => b.c100g - a.c100g);
}

/** Søg i listen på et stykke af navnet. */
export function soegCVarer(soegning: string): readonly VitaminCVare[] {
  const soegt = soegning.trim().toLocaleLowerCase("da-DK");
  if (soegt === "") return VITAMIN_C_VARER;
  return VITAMIN_C_VARER.filter((v) => v.navn.toLocaleLowerCase("da-DK").includes(soegt));
}
