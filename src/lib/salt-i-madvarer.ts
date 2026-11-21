/**
 * Salt i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * salt er der i rugbrød», «… i smør» og «… i en bouillonterning» (målt 9/10
 * 2026, `suggestqueries.google.com`, hl=da: tre af de første ti forslag under
 * «hvor meget salt er der i» er madvarer — resten er hav og søer).
 * `/kalorier` svarede på energien, `/protein-i-madvarer` på proteinet,
 * `/kulhydrater-i-madvarer` på kulhydraterne, `/fedt-i-madvarer` på fedtet og
 * `/sukker-i-madvarer` på sukkeret, men ingen side svarede på saltindholdet.
 *
 * **Kilden er den samme som på /kalorier.** Navn, gruppe, kcal, protein, fedt
 * og kulhydrat læses fra `MADVARER` i `kalorier-madvarer.ts`. Natriumindholdet
 * er hentet fra USDA FoodData Central, datasættet *SR Legacy*, udgaven
 * 2018-04, næringsstof **1058 — Sodium, Na (mg)**, pr. 100 g. Hver værdi
 * nedenfor bærer sin `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Hvorfor siden regner salt ud af natrium.** Kilden opgiver natrium i
 * milligram, men danske fødevaremærkninger opgiver salt — og det er også det,
 * folk slår op. Natrium omregnes til salt med faktoren 2,5: et saltkorn
 * (kogesalt, NaCl) vejer 58,5 g pr. mol, og deraf er 23 g natrium, altså
 * 23 ÷ 58,5 = 0,393 g natrium pr. g salt. Omvendt er 1 g salt = 2,5 g
 * natrium, så `salt = natrium × 2,5 ÷ 1000`. Faktoren er ren kemi, ikke en
 * skønnet faktor.
 *
 * **Anbefalingen er WHO's.** Verdenssundhedsorganisationen anbefaler voksne
 * under 2.000 mg natrium om dagen, svarende til under 5 g salt — ca. en
 * teskefuld. Kilde: WHO's faktablad «Sodium reduction», opdateret 11. maj
 * 2026, {{@link https://www.who.int/news-room/fact-sheets/detail/salt-reduction}}.
 * Sidens tal er alene beregnet fra USDA; de 5 g er den eneste ydre værdi, der
 * bliver blandt ind.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med natrium pr. 100 g fra kilden. */
export interface Saltvare extends Madvare {
  /** Natrium pr. 100 g i milligram (USDA FoodData Central, næringsstof 1058). */
  natrium100g: number;
}

/** WHO's daglige anbefaling for voksne, i natrium — saltværdien er regnet. */
export const NATRIUM_ANBEFALING_MG = 2000;
export const SALT_ANBEFALING_G = (NATRIUM_ANBEFALING_MG * 2.5) / 1000;

/** Kilden til natriumtallet pr. `fdcId`. */
export const SALT_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1058 Sodium, Na (mg)",
  laest: "9/10 2026",
} as const;

/**
 * Natrium pr. 100 g pr. `fdcId`, regnet af kildens næringsstof 1058. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * natriumfelt i kilden.
 */
const NATRIUM_100G: readonly (readonly [number, number])[] = [
  [173944, 1], // Banan
  [168202, 2], // Æble
  [169118, 1], // Pære
  [174683, 2], // Vindrue
  [169097, 0], // Appelsin
  [167762, 1], // Jordbær
  [171711, 1], // Blåbær
  [171719, 0], // Kirsebær
  [167765, 1], // Vandmelon
  [169124, 1], // Ananas
  [169910, 1], // Mango
  [171705, 7], // Avocado
  [169949, 0], // Blomme
  [168164, 24], // Druer, tørrede
  [173945, 3], // Banan, tørret
  [170393, 69], // Gulerod
  [170026, 6], // Kartoffel, rå
  [170114, 240], // Kartoffel, kogt
  [170111, 10], // Kartoffel, bagt
  [168555, 317], // Kartoffel, mosset
  [170457, 5], // Tomat
  [168409, 2], // Agurk
  [170000, 4], // Løg
  [170379, 33], // Broccoli
  [169986, 30], // Blomkål
  [170108, 4], // Peberfrugt, rød
  [168462, 79], // Spinat
  [171052, 77], // Kylling, hel
  [168250, 57], // Svinekød, kotelet
  [167872, 1500], // Skinke
  [168724, 50], // Oksekød, mørbrad
  [174924, 490], // Hvedebrød
  [172684, 603], // Rugbrød
  [172675, 602], // Franskbrød
  [169705, 2], // Havregryn, tørrede
  [168878, 1], // Ris, hvidt, kogt
  [168915, 11], // Nudler, tørrede
  [170688, 17], // Bulgur, tørret
  [168917, 7], // Quinoa, kogt
  [170872, 44], // Mælk, letmælk 1,5 %
  [171265, 43], // Mælk, sødmælk
  [170859, 27], // Fløde, 38 %
  [171284, 46], // Yoghurt, natur
  [172179, 315], // Hytteost
  [171241, 819], // Gouda
  [173420, 1139], // Feta
  [173410, 643], // Smør
  [171413, 2], // Olivenolie
  [172336, 0], // Rapsolie
  [167587, 79], // Chokolade, mælke
  [169655, 1], // Sukker
  [171287, 142], // Æg, helt, råt
  [172184, 48], // Æggeblomme
];

const NATRIUM_VED_FDC = new Map<number, number>(NATRIUM_100G as [number, number][]);

/** Alle madvarer med natrium — altså hele tabellen — i samme rækkefølge. */
export const SALT_MADVARER: readonly Saltvare[] = MADVARER.map((m) => ({
  ...m,
  natrium100g: NATRIUM_VED_FDC.get(m.fdcId) ?? 0,
}));

/**
 * Salt pr. 100 g i gram, regnet af natriumtallet. 1 g salt svarer til 2,5 g
 * natrium, så `salt = natrium × 2,5 ÷ 1000`. Råvarer uden natrium i kilden
 * (rapsolie) giver 0.
 */
export function salt100g(vare: Saltvare): number {
  return (vare.natrium100g * 2.5) / 1000;
}

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function saltTal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/**
 * Salt i en given mængde af en madvare. 100 g giver nøjagtig `salt100g`, så
 * tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function saltIgram(vare: Saltvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (salt100g(vare) * gram) / 100;
}

/** Natrium i en given mængde af en madvare, i milligram. */
export function natriumIgram(vare: Saltvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (vare.natrium100g * gram) / 100;
}

/**
 * Salt pr. 100 kcal — hvor saltholdig en madvare er målt på energien. Ost og
 * skinke ligger højt, mens brød og grønt ligger lavere. En madvare uden
 * kalorier giver 0.
 */
export function saltPer100Kcal(vare: Saltvare): number {
  if (vare.kcal100g <= 0) return 0;
  return (salt100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor meget af madvaren der svarer til hele dages salt IFØLGE WHO's
 * anbefaling. Bruges til «andel af 5 g»-kolonnen. En madvare uden salt giver
 * 0, og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser «∞».
 */
export function andelAfAnbefaling(vare: Saltvare, maalGram = SALT_ANBEFALING_G): number {
  const salt = salt100g(vare);
  if (!Number.isFinite(maalGram) || maalGram <= 0 || salt <= 0) return 0;
  return (100 * salt) / maalGram;
}

/** Alle madvarer, sorteret efter natrium pr. 100 g, den højeste først. */
export function saltRangliste(): Saltvare[] {
  return [...SALT_MADVARER].sort((a, b) => b.natrium100g - a.natrium100g);
}

/**
 * De opslag danskerne faktisk laver (rugbrød, smør, skinke, feta, gouda og
 * hytteost), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const SALT_EKSEMPEL_NAVNE = [
  "Rugbrød",
  "Smør",
  "Skinke",
  "Feta",
  "Gouda",
  "Hytteost",
] as const;

/** Eksempel-madvarerne i {@link SALT_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function saltEksempler(): Saltvare[] {
  return SALT_EKSEMPEL_NAVNE.map((navn) => saltVareMedNavn(navn)).filter(
    (m): m is Saltvare => Boolean(m)
  );
}

/** Opslag i salt-tabellen på dansk navn. */
export function saltVareMedNavn(navn: string): Saltvare | undefined {
  return SALT_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt salt-rækkerne med den samme logik som /kalorier bruger, så
 * «rugbrod» og «roegbrod» kan findes med danske navne.
 */
export function soegSaltvarer(tekst: string): Saltvare[] {
  return soegMadvarer(tekst)
    .map((m) => saltVareMedNavn(m.navn))
    .filter((m): m is Saltvare => Boolean(m));
}

const RUGBROD = saltVareMedNavn("Rugbrød")!;
const SMOER = saltVareMedNavn("Smør")!;
const SKINKE = saltVareMedNavn("Skinke")!;

/** Sidens titel. Tallene er rugbrøds og smørs salt pr. 100 g. */
export function saltMetaTitel(): string {
  return `Salt i madvarer: ${saltTal(salt100g(RUGBROD))} g i rugbrød, ${saltTal(salt100g(SMOER))} g i smør`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function saltMetaBeskrivelse(): string {
  return `Se saltindholdet i ${SALT_MADVARER.length} madvarer pr. 100 g — ${saltTal(salt100g(RUGBROD))} g i rugbrød, ${saltTal(salt100g(SMOER))} g i smør og ${saltTal(salt100g(SKINKE))} g i skinke. Skriv vægten, og regn salt og natrium ud.`;
}
