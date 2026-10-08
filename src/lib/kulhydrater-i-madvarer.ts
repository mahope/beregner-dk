/**
 * Kulhydrater i madvarer. Tallene er de samme som på `/kalorier`: de kommer fra
 * `MADVARER` i `kalorier-madvarer.ts`, hvor hver række bærer sit `fdc_id` fra
 * USDA FoodData Central (SR Legacy 2018-04). Denne fil skriver derfor **ingen**
 * tal selv — den regner kun videre på dem, så kulhydrattallet på
 * `/kulhydrater-i-madvarer` ikke kan glide fra kalorie-tabellen.
 *
 * Baggrunden er den danske autocomplete-klynge «hvor mange kulhydrater er der
 * i en banan», «… i kartofler», «… i en øl» og «… i havregryn» (målt 8/10 2026,
 * `suggestqueries.google.com`, hl=da: 10 af 10 træffere under «hvor mange
 * kulhydrater er der i» er madvarer). Den svenske «kolhydrater i» gentager
 * mønstret. `/kalorier` svarede på energien og `/protein-i-madvarer` på
 * proteinet, men ingen side svarede på opslaget om kulhydrater.
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
export function kulhydratTal(tal: number, decimaler = 0): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/**
 * Kulhydrater i en given mængde af en madvare. 100 g giver nøjagtig
 * `kulhydrat100g`, så tallet i tabellen og tallet i feltet ikke kan komme i
 * strid. Negativt og ikke-tal giver 0 — en portion kan ikke have negativt
 * indhold.
 */
export function kulhydratIgram(madvare: Madvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (madvare.kulhydrat100g * gram) / 100;
}

/**
 * Hvor mange gram af madvaren der skal til for at nå `maalGram` kulhydrat.
 * Bruges til «gram for 50 g kulhydrat»-kolonnen. En madvare uden kulhydrat
 * (fx olie) giver 0, og et ikke-tal eller negativt mål giver 0, så kolonnen
 * aldrig viser «∞».
 */
export function gramForKulhydrat(madvare: Madvare, maalGram: number): number {
  if (!Number.isFinite(maalGram) || maalGram <= 0) return 0;
  if (madvare.kulhydrat100g <= 0) return 0;
  return (maalGram * 100) / madvare.kulhydrat100g;
}

/**
 * Kulhydrater pr. 100 kcal — hvor kulhydrattæt en madvare er. Sukker og
 * tørret frugt ligger højt, mens fedt og kød ligger på nul. En madvare uden
 * kalorier giver 0.
 */
export function kulhydratPer100Kcal(madvare: Madvare): number {
  if (madvare.kcal100g <= 0) return 0;
  return (madvare.kulhydrat100g / madvare.kcal100g) * 100;
}

/** Alle madvarer sorteret efter kulhydrat pr. 100 g, den højeste først. */
export function kulhydratRangliste(): Madvare[] {
  return [...MADVARER].sort((a, b) => b.kulhydrat100g - a.kulhydrat100g);
}

/**
 * De madvarer danskerne faktisk slår op (banan, kartoffel, havregryn, rugbrød,
 * æble, ris), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const KULHYDRAT_EKSEMPEL_NAVNE = [
  "Banan",
  "Kartoffel, kogt",
  "Havregryn, tørrede",
  "Rugbrød",
  "Æble",
  "Ris, hvidt, kogt",
] as const;

/** Eksempel-madvarerne i {@link KULHYDRAT_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function kulhydratEksempler(): Madvare[] {
  return KULHYDRAT_EKSEMPEL_NAVNE.map((navn) => madvareMedNavn(navn)).filter(
    (m): m is Madvare => Boolean(m)
  );
}

const BANAN = madvareMedNavn("Banan")!;
const KARTOFFEL = madvareMedNavn("Kartoffel, kogt")!;

/** Sidens titel. Tallene er bananens og kartoflens kulhydrat pr. 100 g. */
export const KULHYDRAT_META_TITEL = `Kulhydrater: banan ${kulhydratTal(BANAN.kulhydrat100g, 1)} g, kartoffel ${kulhydratTal(KARTOFFEL.kulhydrat100g, 1)} g pr. 100 g`;

/** Sidens metabeskrivelse. Antallet af madvarer læses fra tabellen. */
export const KULHYDRAT_META_BESKRIVELSE = `Se kulhydratindholdet i ${MADVARER.length} madvarer pr. 100 g. Søg efter banan, kartoffel eller havregryn, og se hvor mange gram du skal spise for 50 g kulhydrat.`;
