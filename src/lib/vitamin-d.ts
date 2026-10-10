/**
 * D-vitamin: anbefaling og madkilder. Baggrunden er den danske
 * autocomplete-klynge «hvor meget vitamin d skal man have om dagen»,
 * «… om dagen», «hvor meget d vitamin» og «hvor meget vitamin d3 om dagen»
 * (målt 10/10 2026, `suggestqueries.google.com`, hl=da: otte af de første ti
 * forslag under «hvor meget vitamin» handler om D-vitamin). `/kalorier`
 * svarede på energien og de øvrige «i madvarer»-sider på jern, fiber,
 * protein, kulhydrater, fedt, sukker og salt — men ingen side svarede på,
 * hvor meget D-vitamin kroppen har brug for.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Lamberg-Allardt et al. 2023) angiver
 * anbefalet indtagelse (RI) på **10 µg om dagen for voksne kvinder og mænd**,
 * 20 µg for personer over 75 år og for personer med lidt eller ingen
 * soleksponering. Gennemsnitsbehovet (AR) er 7,5 µg, og den øvre
 * sikkerhedsgrænse (UL) er 100 µg/dag. Kilde: NNR2023's D-vitaminafsnit,
 * {{@link https://pub.norden.org/nord2023-003/vitamin-d-.html}}.
 *
 * **Madindholdet er USDA's.** Hvert tal pr. 100 g er læst af USDA FoodData
 * Central, datasættet *SR Legacy*, udgaven 2018-04, næringsstof **1114
 * (328) — Vitamin D (D2 + D3), µg**. Rækkerne er trukket fra sampakken
 * `FoodData_Central_sr_legacy_food_csv_2018-04.zip` på fdc.nal.usda.gov uden
 * nøgle, og hver værdi bærer sin `fdcId`, så den kan slås op:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 *
 * Listen er bevidst ikke alle 53 madvarer fra kaloriesiden. D-vitamin findes
 * kun i få fødevarer — fed fisk, æggeblomme og de mælkeprodukter, der er
 * beriget — og en tabel med 40 nuller fortæller læseren mindre end en med de
 * kilder, der faktisk tæller. De rækker, der alligevel ligger på kaloriesiden
 * (æg, mælk, smør, ost), bruger nøjagtig de samme `fdcId`-er, så de to sider
 * ikke kan blive uenige.
 */

/** NNR2023's anbefalede indtagelse (RI) for voksne kvinder og mænd, i µg. */
export const VITAMIN_D_RI_UG = 10;

/** NNR2023's anbefalede indtagelse for personer over 75 år, i µg. */
export const VITAMIN_D_RI_75_PLUS_UG = 20;

/** NNR2023's anbefalede indtagelse ved lidt eller ingen sol, i µg. */
export const VITAMIN_D_RI_UDEN_SOL_UG = 20;

/** NNR2023's gennemsnitsbehov (AR) for voksne, i µg. */
export const VITAMIN_D_AR_UG = 7.5;

/** NNR2023's øvre sikkerhedsgrænse (UL) for voksne, i µg. */
export const VITAMIN_D_UL_UG = 100;

/**
 * Den anbefaling, andelskolonnen regner ud fra: voksnes RI, fordi det er det
 * tal, der gælder for både kvinder og mænd.
 */
export const VITAMIN_D_ANBEFALING_UG = VITAMIN_D_RI_UG;

/** Kilden til D-vitamintallet pr. `fdcId`. */
export const VITAMIN_D_KILDE = {
  database: "USDA FoodData Central",
  dataset: "SR Legacy",
  udgave: "2018-04",
  naeringsstof: "1114 (328) Vitamin D (D2 + D3), µg",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/vitamin-d-.html",
} as const;

/** En D-vitaminkilde pr. 100 g fra kilden. */
export interface VitaminDVare {
  navn: string;
  /** USDA FoodData Central-fdcId for kildens egen række. */
  fdcId: number;
  /** D-vitamin pr. 100 g i µg. */
  d100g: number;
  /**
   * En portion, som siden bruger til andelskolonnen. Vægten er vores eget
   * valg af almindelig dansk servering — ikke noget kilden opgiver.
   */
  portionGram: number;
}

/**
 * D-vitamin pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1114. Tallene
 * er rå (stegt/beriget), hvor kilden adskiller: laks har 11,0 µg rå og 13,1
 * µg kogt, fordi vandet fordamper under stegen.
 */
export const VITAMIN_D_VARER: readonly VitaminDVare[] = [
  { navn: "Makrel, atlantic, rå", fdcId: 175119, d100g: 16.1, portionGram: 125 },
  { navn: "Ørred, regnbue, opdrættet, rå", fdcId: 173717, d100g: 15.9, portionGram: 125 },
  { navn: "Laks, atlantic, opdrættet, kogt", fdcId: 175168, d100g: 13.1, portionGram: 125 },
  { navn: "Laks, atlantic, opdrættet, rå", fdcId: 175167, d100g: 11.0, portionGram: 125 },
  { navn: "Torskeleverolie", fdcId: 173577, d100g: 250, portionGram: 5 },
  { navn: "Æggeblomme", fdcId: 172184, d100g: 5.4, portionGram: 20 },
  { navn: "Sild, atlantic, rå", fdcId: 175116, d100g: 4.2, portionGram: 125 },
  { navn: "Æg, helt, råt", fdcId: 171287, d100g: 2.0, portionGram: 60 },
  { navn: "Fløde, 38 %", fdcId: 170859, d100g: 1.6, portionGram: 15 },
  { navn: "Mælk, sødmælk, m. tilsat D-vitamin", fdcId: 171265, d100g: 1.3, portionGram: 250 },
  { navn: "Torsk, atlantic, rå", fdcId: 171955, d100g: 0.9, portionGram: 150 },
  { navn: "Gouda", fdcId: 171241, d100g: 0.5, portionGram: 30 },
  { navn: "Hytteost", fdcId: 172179, d100g: 0.1, portionGram: 100 },
  { navn: "Yoghurt, natur", fdcId: 171284, d100g: 0.1, portionGram: 200 },
  { navn: "Smør, saltet", fdcId: 173410, d100g: 0, portionGram: 15 },
];

/** D-vitamin-tal, formateret på dansk. Heltal til at starte med. */
export function vitaminDTal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Henter en vare pr. navn. */
export function vareMedNavn(navn: string): VitaminDVare | undefined {
  const soegt = navn.trim().toLocaleLowerCase("da-DK");
  return VITAMIN_D_VARER.find((v) => v.navn.toLocaleLowerCase("da-DK") === soegt);
}

/** D-vitamin pr. 100 g for en vare, i µg. */
export function d100g(vare: VitaminDVare): number {
  return vare.d100g;
}

/** D-vitamin i en given mængde gram, i µg. */
export function dIgram(vare: VitaminDVare, gram: number): number {
  return (vare.d100g * Math.max(0, gram)) / 100;
}

/** Hvor mange procent af voksnes RI en given mængde dækker. */
export function andelAfAnbefaling(vare: VitaminDVare, gram = vare.portionGram): number {
  return (dIgram(vare, gram) / VITAMIN_D_ANBEFALING_UG) * 100;
}

/** Hvor mange gram af varen, der skal til for at dække voksnes RI. */
export function gramForAnbefaling(vare: VitaminDVare): number {
  if (vare.d100g <= 0) return Number.POSITIVE_INFINITY;
  return (VITAMIN_D_ANBEFALING_UG / vare.d100g) * 100;
}

/** Sorteret listen: mest D-vitamin pr. 100 g først. */
export function rangliste(): readonly VitaminDVare[] {
  return [...VITAMIN_D_VARER].sort((a, b) => b.d100g - a.d100g);
}

/** Søg i listen på et stykke af navnet. */
export function soegVitaminDvarer(soegning: string): readonly VitaminDVare[] {
  const soegt = soegning.trim().toLocaleLowerCase("da-DK");
  if (soegt === "") return VITAMIN_D_VARER;
  return VITAMIN_D_VARER.filter((v) => v.navn.toLocaleLowerCase("da-DK").includes(soegt));
}
