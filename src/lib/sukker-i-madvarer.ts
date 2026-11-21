/**
 * Sukker i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * sukker er der i en cola», «… i vandmelon», «… i en banan» og «… i øl»
 * (målt 8/10 2026, `suggestqueries.google.com`, hl=da: 10 af 10 træffere
 * under «hvor meget sukker er der i» er madvarer). `/kalorier` svarede på
 * energien, `/protein-i-madvarer` på proteinet, `/kulhydrater-i-madvarer` på
 * kulhydraterne og `/fedt-i-madvarer` på fedtet, men ingen side svarede på
 * opslaget om sukker.
 *
 * **Kilden er den samme som på /kalorier.** Navn, gruppe, kcal, protein,
 * fedt og kulhydrat læses fra `MADVARER` i `kalorier-madvarer.ts`, og
 * sukkerkomponenten er hentet fra USDA FoodData Central, datasættet *SR
 * Legacy*, udgaven 2018-04, næringsstof **2000 — Sugars, Total**, pr. 100 g.
 * Hver værdi nedenfor bærer sin `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Havregryn har intet sukkerfelt i kilden** (fdcId 169705 opgiver næringsstof
 * 2000 slet ikke), så de tørre gryn er udeladt af tabellen frem for at stå med
 * et opfundet tal (punkt 11). Det skriver siden også for læseren.
 *
 * **Sukkerangivelsen er det samlede sukkerindhold.** USDA-feltet 2000 omfatter
 * både naturligt sukker — fruktose i frugt og laktose i mælk — og tilsat
 * sukker, så siden opdeler det ikke (punkt 11).
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med sukker pr. 100 g fra kilden. */
export interface Sukkervare extends Madvare {
  /** Sukker pr. 100 g (USDA FoodData Central, næringsstof 2000). */
  sukker100g: number;
}

/**
 * Sukker pr. 100 g pr. `fdcId`, regnet af kildens næringsstof 2000. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og en fdcId uden sukkerfelt
 * findes ikke her — se havregryn-kommentaren.
 */
const SUKKER_100G: readonly (readonly [number, number])[] = [
  [173945, 47.3], // Banan, tørret
  [173944, 12.23], // Banan
  [168202, 10.04], // Æble
  [169118, 9.75], // Pære
  [169097, 9.35], // Appelsin
  [174683, 15.48], // Vindrue
  [168164, 65.7], // Druer, tørrede
  [167762, 4.89], // Jordbær
  [171711, 9.96], // Blåbær
  [169910, 13.66], // Mango
  [169124, 9.85], // Ananas
  [169949, 9.92], // Blomme
  [171719, 12.82], // Kirsebær
  [167765, 6.2], // Vandmelon
  [171705, 0.66], // Avocado
  [170393, 4.74], // Gulerod
  [170457, 2.63], // Tomat
  [168409, 1.67], // Agurk
  [168462, 0.42], // Spinat
  [170379, 1.7], // Broccoli
  [169986, 1.91], // Blomkål
  [170000, 4.24], // Løg
  [170108, 4.2], // Peberfrugt, rød
  [170026, 0.82], // Kartoffel, rå
  [170114, 0.91], // Kartoffel, kogt
  [170111, 1.18], // Kartoffel, bagt
  [168555, 1.43], // Kartoffel, mosset
  [171287, 0.37], // Æg, helt, råt
  [172184, 0.56], // Æggeblomme
  [171052, 0.0], // Kylling, hel
  [168250, 0.0], // Svinekød, kotelet
  [168724, 0.0], // Oksekød, mørbrad
  [167872, 0.0], // Skinke
  [171265, 5.05], // Mælk, sødmælk
  [170872, 5.2], // Mælk, letmælk 1,5 %
  [171284, 4.66], // Yoghurt, natur
  [170859, 2.92], // Fløde, 38 %
  [173410, 0.06], // Smør
  [172179, 2.67], // Hytteost
  [171241, 2.22], // Gouda
  [173420, 0.0], // Feta
  [172684, 3.85], // Rugbrød
  [174924, 5.67], // Hvedebrød
  [172675, 4.62], // Franskbrød
  [168915, 2.6], // Nudler, tørrede
  [168917, 0.87], // Quinoa, kogt
  [170688, 0.41], // Bulgur, tørret
  [168878, 0.05], // Ris, hvidt, kogt
  [169655, 99.8], // Sukker
  [167587, 51.5], // Chokolade, mælke
  [171413, 0.0], // Olivenolie
  [172336, 0.0], // Rapsolie
];

const SUKKER_VED_FDC = new Map<number, number>(SUKKER_100G as [number, number][]);

/** Navnet på den ene madvare i `MADVARER` uden sukkerfelt i kilden. */
export const SUKKER_UDEN_KILDE_NAVN = "Havregryn, tørrede";

/**
 * Alle madvarer kenden har et sukkerfelt for, i rækkefølgen fra
 * `kalorier-madvarer.ts`.
 */
export const SUKKER_MADVARER: readonly Sukkervare[] = MADVARER.filter(
  (m) => SUKKER_VED_FDC.has(m.fdcId)
).map((m) => ({ ...m, sukker100g: SUKKER_VED_FDC.get(m.fdcId)! }));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function sukkerTal(tal: number, decimaler = 0): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/**
 * Sukker i en given mængde af en madvare. 100 g giver nøjagtig `sukker100g`,
 * så tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function sukkerIgram(madvare: Sukkervare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (madvare.sukker100g * gram) / 100;
}

/**
 * Hvor mange gram af madvaren der skal til for at nå `maalGram` sukker. Bruges
 * til «gram for 20 g sukker»-kolonnen. En madvare uden sukker giver 0, og et
 * ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser «∞».
 */
export function gramForSukker(madvare: Sukkervare, maalGram: number): number {
  if (!Number.isFinite(maalGram) || maalGram <= 0) return 0;
  if (madvare.sukker100g <= 0) return 0;
  return (maalGram * 100) / madvare.sukker100g;
}

/**
 * Sukker pr. 100 kcal — hvor sukkerfyldt en madvare er målt på energien. Et
 * sukkerheldigt stykke chokolade ligger højt, mens en vandmelon ligger lavt.
 * En madvare uden kalorier giver 0.
 */
export function sukkerPer100Kcal(madvare: Sukkervare): number {
  if (madvare.kcal100g <= 0) return 0;
  return (madvare.sukker100g / madvare.kcal100g) * 100;
}

/** Alle madvarer med sukker, sorteret efter sukker pr. 100 g, den højeste først. */
export function sukkerRangliste(): Sukkervare[] {
  return [...SUKKER_MADVARER].sort((a, b) => b.sukker100g - a.sukker100g);
}

/**
 * De madvarer danskerne faktisk slår op (sukker, banan, æble, vandmelon,
 * vindrue og sødmælk), hentet fra samme tabel som resten af siden.
 * Rækkefølgen er den, FAQ'en læser.
 */
export const SUKKER_EKSEMPEL_NAVNE = [
  "Sukker",
  "Banan",
  "Æble",
  "Vandmelon",
  "Vindrue",
  "Mælk, sødmælk",
] as const;

/** Eksempel-madvarerne i {@link SUKKER_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function sukkerEksempler(): Sukkervare[] {
  return SUKKER_EKSEMPEL_NAVNE.map((navn) => sukkerVareMedNavn(navn)).filter(
    (m): m is Sukkervare => Boolean(m)
  );
}

/** Opslag i sukker-tabellen på dansk navn. */
export function sukkerVareMedNavn(navn: string): Sukkervare | undefined {
  return SUKKER_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt sukker-rækkerne med den samme logik som /kalorier bruger, så
 * «banan», «æg» og «aeg» finder det samme her. Madvarer uden sukkerfelt i
 * kilden — altså havregryn — dukker ikke op i resultatet.
 */
export function soegSukkervarer(tekst: string): Sukkervare[] {
  return soegMadvarer(tekst)
    .map((m) => sukkerVareMedNavn(m.navn))
    .filter((m): m is Sukkervare => Boolean(m));
}

const BANAN = sukkerVareMedNavn("Banan")!;
const CHOKOLADE = sukkerVareMedNavn("Chokolade, mælke")!;

/** Sidens titel. Tallene er bananens og chokoladens sukker pr. 100 g. */
export const SUKKER_META_TITEL = `Sukker i madvarer: banan ${sukkerTal(BANAN.sukker100g, 1)} g, chokolade ${sukkerTal(CHOKOLADE.sukker100g, 1)} g pr. 100 g`;

/** Sidens metabeskrivelse. Antallet af madvarer læses fra tabellen. */
export const SUKKER_META_BESKRIVELSE = `Se sukkerindholdet i ${SUKKER_MADVARER.length} madvarer pr. 100 g. Søg efter banan, æble eller chokolade, og se hvor mange gram du skal spise for 20 g sukker.`;
