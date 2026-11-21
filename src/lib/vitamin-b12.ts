/**
 * B12-vitamin: anbefaling og madkilder. Baggrunden er den danske
 * autocomplete-klynge «hvor meget vitamin»: «hvor meget vitamin d om
 * dagen», «hvor meget c vitamin om dagen» og «hvor meget b12 om dagen»
 * (målt 10/10 2026, `suggestqueries.google.com`, hl=da). `/vitamin-d` og
 * `/vitamin-c` dækker klyngerne for D og C — men ingen side svarede på,
 * hvor meget B12 kroppen har brug for.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Bjørke Monsen & Lysne 2023) sætter et
 * **anbefalet indtagelse (AI) på 4,0 µg om dagen for voksne kvinder og
 * mænd** — afledt af det AI, EFSA (2015c) har fastsat. Det provisoriske
 * gennemsnitsbehov (AR) er 3,2 µg/dag. NNR2023 fandt **ingen kvalificeret
 * biomarkør for skadelig effekt og ingen kvalificeret skadevirkning ved
 * høje indtager**, så der sættes ingen øvre sikkerhedsgrænse (UL).
 * Kilde: NNR2023's B12-afsnit,
 * {{@link https://pub.norden.org/nord2023-003/vitamin-b12.html}}.
 *
 * **Madindholdet er USDA's.** Hvert tal pr. 100 g er læst af USDA FoodData
 * Central, datasættet *SR Legacy*, udgaven 2018-04, næringsstof **1178
 * — Vitamin B-12, µg**. Rækkerne er trukket fra sampakken
 * `FoodData_Central_sr_legacy_food_csv_2018-04.zip` på fdc.nal.usda.gov uden
 * nøgle, og hver værdi bærer sin `fdcId`, så den kan slås op:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 *
 * **B12 findes kun i animalske fødevarer.** NNR2023 skriver, at hovedkilderne
 * i de nordiske og baltiske koster er kød, lever, mejeriprodukter, fisk og
 * skaldyr. Derfor står havregryn, rugbrød og de andre plantefødevarer med 0
 * i tabellen — det er pointen med siden, fordi NNR2023 peger på vegetarianer
 * og veganere som risikogruppe, medmindre de spiser berigede fødevarer eller
 * tilskud. Rækker, der også ligger på kaloriesiden (æg, mælk, smør, ost,
 * kylling), bruger nøjagtig de samme `fdcId`-er, så de to sider ikke kan
 * blive uenige.
 */

/** NNR2023's anbefalede indtagelse (AI) for voksne kvinder og mænd, i µg. */
export const VITAMIN_B12_AI_UG = 4.0;

/** NNR2023's provisoriske gennemsnitsbehov (AR) for voksne, i µg. */
export const VITAMIN_B12_AR_UG = 3.2;

/**
 * Den anbefaling, andelskolonnen regner ud fra: voksnes AI, fordi det er det
 * tal, NNR2023 angiver for både kvinder og mænd.
 */
export const VITAMIN_B12_ANBEFALING_UG = VITAMIN_B12_AI_UG;

/**
 * NNR2023 sætter ingen øvre sikkerhedsgrænse (UL): kilden fandt hverken en
 * kvalificeret biomarkør for skadelig effekt eller en kvalificeret
 * skadevirkning ved høje indtager.
 */
export const VITAMIN_B12_UL_UG = null;

/**
 * Det gennemsnitlige nordiske B12-indtag, NNR2023 siterer Lemming & Pitsi
 * (2022) til 2,9–8,9 µg/dag.
 */
export const VITAMIN_B12_NORDISK_INDTAG = { lav: 2.9, hoej: 8.9 } as const;

/** Kilden til B12-tallet pr. `fdcId`. */
export const VITAMIN_B12_KILDE = {
  database: "USDA FoodData Central",
  dataset: "SR Legacy",
  udgave: "2018-04",
  naeringsstof: "1178 Vitamin B-12, µg",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/vitamin-b12.html",
} as const;

/** En B12-kilde pr. 100 g fra kilden. */
export interface VitaminB12Vare {
  navn: string;
  /** USDA FoodData Central-fdcId for kildens egen række. */
  fdcId: number;
  /** B12 pr. 100 g i µg. */
  b100g: number;
  /**
   * En portion, som siden bruger til andelskolonnen. Vægten er vores eget
   * valg af almindelig dansk servering — ikke noget kilden opgiver.
   */
  portionGram: number;
}

/**
 * B12 pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1178. Alle værdier
 * er rå, hvor kilden adskiller rå og tilberedt; de danske navne er vores
 * oversættelser af kildens egne rækker.
 */
export const VITAMIN_B12_VARER: readonly VitaminB12Vare[] = [
  { navn: "Okselever, rå", fdcId: 169451, b100g: 59.3, portionGram: 100 },
  { navn: "Hønsenelever, rå", fdcId: 171060, b100g: 16.58, portionGram: 100 },
  { navn: "Sild, atlantic, rå", fdcId: 175116, b100g: 13.67, portionGram: 125 },
  { navn: "Muslinger, blå, rå", fdcId: 174216, b100g: 12.0, portionGram: 150 },
  { navn: "Sardiner, dåse i olie", fdcId: 175139, b100g: 8.94, portionGram: 100 },
  { navn: "Østers, østamerikansk, rå", fdcId: 171978, b100g: 8.75, portionGram: 100 },
  { navn: "Makrel, atlantic, rå", fdcId: 175119, b100g: 8.71, portionGram: 125 },
  { navn: "Ørred, regnbue, rå", fdcId: 173717, b100g: 4.3, portionGram: 125 },
  { navn: "Laks, atlantic, opdrættet, rå", fdcId: 175167, b100g: 3.23, portionGram: 125 },
  { navn: "Tun, yellowfin, rå", fdcId: 175159, b100g: 2.08, portionGram: 125 },
  { navn: "Hakket oksekød, 85/15, rå", fdcId: 171796, b100g: 2.17, portionGram: 100 },
  { navn: "Æggeblomme", fdcId: 172184, b100g: 1.95, portionGram: 20 },
  { navn: "Feta", fdcId: 173420, b100g: 1.69, portionGram: 30 },
  { navn: "Gouda", fdcId: 171241, b100g: 1.54, portionGram: 30 },
  { navn: "Rejer, rå", fdcId: 174210, b100g: 1.11, portionGram: 100 },
  { navn: "Kalkun, hel, rå", fdcId: 171081, b100g: 1.22, portionGram: 125 },
  { navn: "Oksekød, mørbrad, rå", fdcId: 168724, b100g: 0.92, portionGram: 125 },
  { navn: "Torsk, atlantic, rå", fdcId: 171955, b100g: 0.91, portionGram: 150 },
  { navn: "Æg, helt, råt", fdcId: 171287, b100g: 0.89, portionGram: 60 },
  { navn: "Skinke, kogt", fdcId: 167872, b100g: 0.7, portionGram: 40 },
  { navn: "Mælk, letmælk 1,5 %", fdcId: 170872, b100g: 0.47, portionGram: 250 },
  { navn: "Mælk, sødmælk", fdcId: 171265, b100g: 0.45, portionGram: 250 },
  { navn: "Yoghurt, natur", fdcId: 171284, b100g: 0.37, portionGram: 200 },
  { navn: "Kylling, kød, rå", fdcId: 171052, b100g: 0.37, portionGram: 125 },
  { navn: "Smør, saltet", fdcId: 173410, b100g: 0.17, portionGram: 15 },
  { navn: "Havregryn, tørrede", fdcId: 169705, b100g: 0, portionGram: 50 },
  { navn: "Rugbrød", fdcId: 172684, b100g: 0, portionGram: 50 },
];

/** B12-tal, formateret på dansk. Heltal til at starte med. */
export function b12Tal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Henter en vare pr. navn. */
export function vareMedNavn(navn: string): VitaminB12Vare | undefined {
  const soegt = navn.trim().toLocaleLowerCase("da-DK");
  return VITAMIN_B12_VARER.find((v) => v.navn.toLocaleLowerCase("da-DK") === soegt);
}

/** B12 pr. 100 g for en vare, i µg. */
export function b100g(vare: VitaminB12Vare): number {
  return vare.b100g;
}

/** B12 i en given mængde gram, i µg. */
export function bIgram(vare: VitaminB12Vare, gram: number): number {
  return (vare.b100g * Math.max(0, gram)) / 100;
}

/** Hvor mange procent af voksnes AI en given mængde dækker. */
export function andelAfAnbefaling(vare: VitaminB12Vare, gram = vare.portionGram): number {
  return (bIgram(vare, gram) / VITAMIN_B12_ANBEFALING_UG) * 100;
}

/** Hvor mange gram af varen, der skal til for at dække voksnes AI. */
export function gramForAnbefaling(vare: VitaminB12Vare): number {
  if (vare.b100g <= 0) return Number.POSITIVE_INFINITY;
  return (VITAMIN_B12_ANBEFALING_UG / vare.b100g) * 100;
}

/** Sorteret listen: mest B12 pr. 100 g først. */
export function rangliste(): readonly VitaminB12Vare[] {
  return [...VITAMIN_B12_VARER].sort((a, b) => b.b100g - a.b100g);
}

/** Søg i listen på et stykke af navnet. */
export function soegB12varer(soegning: string): readonly VitaminB12Vare[] {
  const soegt = soegning.trim().toLocaleLowerCase("da-DK");
  if (soegt === "") return VITAMIN_B12_VARER;
  return VITAMIN_B12_VARER.filter((v) => v.navn.toLocaleLowerCase("da-DK").includes(soegt));
}
