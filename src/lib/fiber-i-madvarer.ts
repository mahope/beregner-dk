/**
 * Fiber i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * fiber er der i havregryn», «… i gulerødder», «… i chiafrø», «… i et æble»
 * og «… i kartofler» (målt 9/10 2026, `suggestqueries.google.com`, hl=da:
 * 10 af de første ti forslag under «hvor meget fiber er der i» er madvarer).
 * `/kalorier` svarede på energien, `/protein-i-madvarer` på proteinet,
 * `/kulhydrater-i-madvarer` på kulhydraterne, `/fedt-i-madvarer` på fedtet,
 * `/sukker-i-madvarer` på sukkeret og `/salt-i-madvarer` på saltet, men ingen
 * side svarede på fiberindholdet.
 *
 * **Kilden er den samme som på de øvrige «i madvarer»-sider.** Navn, gruppe,
 * kcal, protein, fedt og kulhydrat læses fra `MADVARER` i
 * `kalorier-madvarer.ts`. Fiberindholdet er hentet fra USDA FoodData Central,
 * datasættet *SR Legacy*, udgaven 2018-04, næringsstof **1079 — Fiber, total
 * dietary (g)**, pr. 100 g. Hver værdi nedenfor bærer sin `fdcId`, så den kan
 * slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Anbefalingen er WHO's.** Verdenssundhedsorganisationen anbefaler voksne
 * mindst 25 g naturligt forekommende kostfibre om dagen — og for børn 15 g
 * (2-5 år), 21 g (6-9 år) og 25 g (10 år og opefter). Kilde: WHO's retningslinje
 * «Carbohydrate intake for adults and children», offentliggjort 17. juli 2023,
 * {{@link https://www.who.int/publications/i/item/9789240073593}}. Sidens tal
 * er alene beregnet fra USDA; de 25 g er den eneste ydre værdi, der bliver
 * blandt ind.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med fiber pr. 100 g fra kilden. */
export interface Fibervare extends Madvare {
  /** Fiber pr. 100 g i gram (USDA FoodData Central, næringsstof 1079). */
  fiber100g: number;
}

/** WHO's daglige anbefaling for voksne, i gram. */
export const FIBER_ANBEFALING_G = 25;

/** Kilden til fibertallet pr. `fdcId`. */
export const FIBER_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1079 Fiber, total dietary (g)",
  laest: "9/10 2026",
  anbefaling:
    "https://www.who.int/publications/i/item/9789240073593",
} as const;

/**
 * Fiber pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1079. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * fiberfelt i kilden.
 */
const FIBER_100G: readonly (readonly [number, number])[] = [
  [173944, 2.6], // Banan
  [168202, 2.4], // Æble
  [169118, 3.1], // Pære
  [174683, 0.9], // Vindrue
  [169097, 2.4], // Appelsin
  [167762, 2.0], // Jordbær
  [171711, 2.4], // Blåbær
  [171719, 2.1], // Kirsebær
  [167765, 0.4], // Vandmelon
  [169124, 1.4], // Ananas
  [169910, 1.6], // Mango
  [171705, 6.7], // Avocado
  [169949, 1.4], // Blomme
  [168164, 3.3], // Druer, tørrede
  [173945, 9.9], // Banan, tørret
  [170393, 2.8], // Gulerod
  [170026, 2.1], // Kartoffel, rå
  [170114, 2.0], // Kartoffel, kogt
  [170111, 2.2], // Kartoffel, bagt
  [168555, 1.5], // Kartoffel, mosset
  [170457, 1.2], // Tomat
  [168409, 0.5], // Agurk
  [170000, 1.7], // Løg
  [170379, 2.6], // Broccoli
  [169986, 2.0], // Blomkål
  [170108, 2.1], // Peberfrugt, rød
  [168462, 2.2], // Spinat
  [171052, 0.0], // Kylling, hel
  [168250, 0.0], // Svinekød, kotelet
  [167872, 0.0], // Skinke
  [168724, 0.0], // Oksekød, mørbrad
  [174924, 2.7], // Hvedebrød
  [172684, 5.8], // Rugbrød
  [172675, 2.2], // Franskbrød
  [169705, 10.6], // Havregryn, tørrede
  [168878, 0.4], // Ris, hvidt, kogt
  [168915, 10.1], // Nudler, tørrede
  [170688, 12.5], // Bulgur, tørret
  [168917, 2.8], // Quinoa, kogt
  [170872, 0.0], // Mælk, letmælk 1,5 %
  [171265, 0.0], // Mælk, sødmælk
  [170859, 0.0], // Fløde, 38 %
  [171284, 0.0], // Yoghurt, natur
  [172179, 0.0], // Hytteost
  [171241, 0.0], // Gouda
  [173420, 0.0], // Feta
  [173410, 0.0], // Smør
  [171413, 0.0], // Olivenolie
  [172336, 0.0], // Rapsolie
  [167587, 3.4], // Chokolade, mælke
  [169655, 0.0], // Sukker
  [171287, 0.0], // Æg, helt, råt
  [172184, 0.0], // Æggeblomme
];

const FIBER_VED_FDC = new Map<number, number>(FIBER_100G as [number, number][]);

/** Alle madvarer med fiber — altså hele tabellen — i samme rækkefølge. */
export const FIBER_MADVARER: readonly Fibervare[] = MADVARER.map((m) => ({
  ...m,
  fiber100g: FIBER_VED_FDC.get(m.fdcId) ?? 0,
}));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function fiberTal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Fiber pr. 100 g. Råvarer uden fiber i kilden (kød, mejeri, olie) giver 0. */
export function fiber100g(vare: Fibervare): number {
  return vare.fiber100g;
}

/**
 * Fiber i en given mængde af en madvare. 100 g giver nøjagtig `fiber100g`, så
 * tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function fiberIgram(vare: Fibervare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (fiber100g(vare) * gram) / 100;
}

/**
 * Fiber pr. 100 kcal — hvor fiberrig en madvare er målt på energien. Grønt og
 * fuldkorn ligger højt, mens chokolade og nødder ligger lavere. En madvare uden
 * kalorier giver 0.
 */
export function fiberPer100Kcal(vare: Fibervare): number {
  if (vare.kcal100g <= 0) return 0;
  return (fiber100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor mange gram af madvaren der svarer til hele dages fiber ifølge WHO's
 * anbefaling. Bruges til «Gram for 25 g»-kolonnen. En madvare uden fiber giver
 * 0, og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser «∞».
 */
export function gramForAnbefaling(
  vare: Fibervare,
  maalGram = FIBER_ANBEFALING_G
): number {
  const fiber = fiber100g(vare);
  if (!Number.isFinite(maalGram) || maalGram <= 0 || fiber <= 0) return 0;
  return (100 * maalGram) / fiber;
}

/**
 * Hvor stor en del af hele dages fiber 100 g af madvaren dækker, i procent.
 * En madvare uden fiber giver 0.
 */
export function andelAfAnbefaling(
  vare: Fibervare,
  maalGram = FIBER_ANBEFALING_G
): number {
  const fiber = fiber100g(vare);
  if (!Number.isFinite(maalGram) || maalGram <= 0 || fiber <= 0) return 0;
  return (100 * fiber) / maalGram;
}

/** Alle madvarer, sorteret efter fiber pr. 100 g, den højeste først. */
export function fiberRangliste(): Fibervare[] {
  return [...FIBER_MADVARER].sort((a, b) => b.fiber100g - a.fiber100g);
}

/**
 * De opslag danskerne faktisk laver (havregryn, gulerødder, æble, kartofler,
 * rugbrød og avocado), hentet fra samme tabel som resten af siden.
 * Rækkefølgen er den, FAQ'en læser.
 */
export const FIBER_EKSEMPEL_NAVNE = [
  "Havregryn, tørrede",
  "Gulerod",
  "Æble",
  "Kartoffel, kogt",
  "Rugbrød",
  "Avocado",
] as const;

/** Eksempel-madvarerne i {@link FIBER_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function fiberEksempler(): Fibervare[] {
  return FIBER_EKSEMPEL_NAVNE.map((navn) => fiberVareMedNavn(navn)).filter(
    (m): m is Fibervare => Boolean(m)
  );
}

/** Opslag i fiber-tabellen på dansk navn. */
export function fiberVareMedNavn(navn: string): Fibervare | undefined {
  return FIBER_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt fiber-rækkerne med den samme logik som /kalorier bruger, så
 * «rugbrod» og «roegbrod» kan findes med danske navne.
 */
export function soegFibervarer(tekst: string): Fibervare[] {
  return soegMadvarer(tekst)
    .map((m) => fiberVareMedNavn(m.navn))
    .filter((m): m is Fibervare => Boolean(m));
}

const HAVREGRYN = fiberVareMedNavn("Havregryn, tørrede")!;
const RUGBROD = fiberVareMedNavn("Rugbrød")!;
const GULEROD = fiberVareMedNavn("Gulerod")!;

/** Sidens titel. Tallene er havregryns og rugbrøds fiber pr. 100 g. */
export function fiberMetaTitel(): string {
  return `Fiber i madvarer: ${fiberTal(fiber100g(HAVREGRYN))} g i havregryn, ${fiberTal(fiber100g(RUGBROD))} g i rugbrød`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function fiberMetaBeskrivelse(): string {
  return `Se fiberindholdet i ${FIBER_MADVARER.length} madvarer pr. 100 g — ${fiberTal(fiber100g(HAVREGRYN))} g i havregryn, ${fiberTal(fiber100g(GULEROD))} g i gulerod og ${fiberTal(fiber100g(RUGBROD))} g i rugbrød. Skriv vægten, og regn fiber ud.`;
}
