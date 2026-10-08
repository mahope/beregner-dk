/**
 * Fedt i madvarer. Tallene er de samme som på `/kalorier`: de kommer fra
 * `MADVARER` i `kalorier-madvarer.ts`, hvor hver række bærer sit `fdc_id` fra
 * USDA FoodData Central (SR Legacy 2018-04). Denne fil skriver derfor **ingen**
 * tal selv — den regner kun videre på dem, så fedttallet på `/fedt-i-madvarer`
 * ikke kan glide fra kalorie-tabellen.
 *
 * Baggrunden er den danske autocomplete-klynge «hvor meget fedt er der i et
 * æg», «… i avocado», «… i sødmælk» og «… i fløde» (målt 8/10 2026,
 * `suggestqueries.google.com`, hl=da: 10 af 10 træffere under «hvor meget fedt
 * er der i» er madvarer). `/kalorier` svarede på energien,
 * `/protein-i-madvarer` på proteinet og `/kulhydrater-i-madvarer` på
 * kulhydraterne, men ingen side svarede på opslaget om fedt.
 *
 * **Kilden opgiver kun det samlede fedtindhold.** Tabellen har ingen opdeling i
 * mættet, enkeltumættet eller flerumættet fedt, så siden skriver heller ikke om
 * det. Det er et bevidst valg, jf. punkt 11: en påstand, kilden ikke bærer, må
 * ikke stå på siden.
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
export function fedtTal(tal: number, decimaler = 0): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/**
 * Fedt i en given mængde af en madvare. 100 g giver nøjagtig `fedt100g`, så
 * tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0 — en portion kan ikke have negativt indhold.
 */
export function fedtIgram(madvare: Madvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (madvare.fedt100g * gram) / 100;
}

/**
 * Hvor mange gram af madvaren der skal til for at nå `maalGram` fedt. Bruges
 * til «gram for 20 g fedt»-kolonnen. En madvare uden fedt (fx sukker) giver 0,
 * og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser «∞».
 */
export function gramForFedt(madvare: Madvare, maalGram: number): number {
  if (!Number.isFinite(maalGram) || maalGram <= 0) return 0;
  if (madvare.fedt100g <= 0) return 0;
  return (maalGram * 100) / madvare.fedt100g;
}

/**
 * Fedt pr. 100 kcal — hvor fedttæt en madvare er. Ren olie og smør ligger
 * højt, mens frugt og grønt ligger lavt, selv om de har fedt. En madvare uden
 * kalorier giver 0.
 */
export function fedtPer100Kcal(madvare: Madvare): number {
  if (madvare.kcal100g <= 0) return 0;
  return (madvare.fedt100g / madvare.kcal100g) * 100;
}

/** Alle madvarer sorteret efter fedt pr. 100 g, den højeste først. */
export function fedtRangliste(): Madvare[] {
  return [...MADVARER].sort((a, b) => b.fedt100g - a.fedt100g);
}

/**
 * De madvarer danskerne faktisk slår op (æg, avocado, sødmælk, fløde, smør,
 * banan), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const FEDT_EKSEMPEL_NAVNE = [
  "Æg, helt, råt",
  "Avocado",
  "Mælk, sødmælk",
  "Fløde, 38 %",
  "Smør",
  "Banan",
] as const;

/** Eksempel-madvarerne i {@link FEDT_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function fedtEksempler(): Madvare[] {
  return FEDT_EKSEMPEL_NAVNE.map((navn) => madvareMedNavn(navn)).filter(
    (m): m is Madvare => Boolean(m)
  );
}

const AEG = madvareMedNavn("Æg, helt, råt")!;
const SMOER = madvareMedNavn("Smør")!;

/** Sidens titel. Tallene er æggets og smørrets fedt pr. 100 g. */
export const FEDT_META_TITEL = `Fedt: æg ${fedtTal(AEG.fedt100g, 1)} g, smør ${fedtTal(SMOER.fedt100g, 1)} g pr. 100 g`;

/** Sidens metabeskrivelse. Antallet af madvarer læses fra tabellen. */
export const FEDT_META_BESKRIVELSE = `Se fedtindholdet i ${MADVARER.length} madvarer pr. 100 g. Søg efter æg, avocado eller fløde, og se hvor mange gram du skal spise for 20 g fedt.`;
