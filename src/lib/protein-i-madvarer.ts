/**
 * Protein i madvarer. Tallene er de samme som på `/kalorier`: de kommer fra
 * `MADVARER` i `kalorier-madvarer.ts`, hvor hver række bærer sit `fdc_id` fra
 * USDA FoodData Central (SR Legacy 2018-04). Denne fil skriver derfor **ingen**
 * tal selv — den regner kun videre på dem, så protein-tallet på `/proteinbehov`
 * og `/protein-i-madvarer` ikke kan glide fra kalorie-tabellen.
 *
 * Baggrunden er den danske autocomplete-klynge omkring «protein i æg», «protein
 * i kylling», «hvor meget protein er der i et æg» og «hvor mange gram protein
 * skal man have om dagen» (målt 8/10 2026, `suggestqueries.google.com`, hl=da).
 * Siden svarer på opslaget — menneskets daglige behov ligger på `/proteinbehov`.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function proteinTal(tal: number, decimaler = 0): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/**
 * Protein i en given mængde af en madvare. 100 g giver nøjagtig
 * `protein100g`, så tallet i tabellen og tallet i feltet ikke kan komme i
 * strid. Negativt og ikke-tal giver 0 — en portion kan ikke have negativt
 * indhold.
 */
export function proteinIgram(madvare: Madvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (madvare.protein100g * gram) / 100;
}

/**
 * Hvor mange gram af madvaren der skal til for at nå `maalGram` protein.
 * Bruges til «gram for 20 g protein»-kolonnen. En madvare uden protein giver 0,
 * og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser «∞».
 */
export function gramForProtein(madvare: Madvare, maalGram: number): number {
  if (!Number.isFinite(maalGram) || maalGram <= 0) return 0;
  if (madvare.protein100g <= 0) return 0;
  return (maalGram * 100) / madvare.protein100g;
}

/**
 * Protein pr. 100 kcal — hvor «proteintæt» en madvare er. Bruges til at skelne
 * magre kilder (hytteost, kylling) fra fede (gouda, nødder), som har meget
 * protein pr. 100 g men også mange kalorier. En madvare uden kalorier giver 0.
 */
export function proteinPer100Kcal(madvare: Madvare): number {
  if (madvare.kcal100g <= 0) return 0;
  return (madvare.protein100g / madvare.kcal100g) * 100;
}

/** Alle madvarer sorteret efter protein pr. 100 g, den højeste først. */
export function proteinRangliste(): Madvare[] {
  return [...MADVARER].sort((a, b) => b.protein100g - a.protein100g);
}

/**
 * De madvarer danskerne faktisk slår op (æg, kylling, havregryn, hytteost,
 * mælk, banan), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const PROTEIN_EKSEMPEL_NAVNE = [
  "Æg, helt, råt",
  "Kylling, hel",
  "Havregryn, tørrede",
  "Hytteost",
  "Mælk, sødmælk",
  "Banan",
] as const;

/** Eksempel-madvarerne i {@link PROTEIN_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function proteinEksempler(): Madvare[] {
  return PROTEIN_EKSEMPEL_NAVNE.map((navn) => madvareMedNavn(navn)).filter(
    (m): m is Madvare => Boolean(m)
  );
}

const AEG = madvareMedNavn("Æg, helt, råt")!;
const KYLLING = madvareMedNavn("Kylling, hel")!;

/** Sidens titel. Tallet er æggets proteinindhold pr. 100 g, læst fra tabellen. */
export const PROTEIN_META_TITEL = `Protein i madvarer: æg ${proteinTal(AEG.protein100g, 1)} g, kylling ${proteinTal(KYLLING.protein100g, 1)} g pr. 100 g`;

/** Sidens metabeskrivelse. Antallet af madvarer læses fra tabellen. */
export const PROTEIN_META_BESKRIVELSE = `Se proteinindholdet i ${MADVARER.length} madvarer pr. 100 g. Søg efter æg, kylling eller hytteost, og se hvor mange gram du skal spise for at få 20 g protein.`;
