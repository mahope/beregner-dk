/**
 * Kalium i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * kalium er der i …» og «kalium i …» (målt 10/10 2026,
 * `suggestqueries.google.com`, hl=da): banan, kartofler, vandmelon, mælk,
 * æbler, havregryn, æblejuice, tomater og grøntsager. Samme klynge som jern-,
 * calcium-, magnesium- og zink-siderne. `/kalorier` svarede på energien og de
 * øvrige «i madvarer»-sider på protein, kulhydrat, fedt, sukker, salt, fiber,
 * jern, calcium, magnesium og zink, men ingen side svarede på kaliumindholdet.
 *
 * **Kilden er den samme som på de øvrige «i madvarer»-sider.** Navn, gruppe,
 * kcal, protein, fedt og kulhydrat læses fra `MADVARER` i
 * `kalorier-madvarer.ts`. Kaliumindholdet er hentet fra USDA FoodData Central,
 * datasættet *SR Legacy*, udgaven 2018-04, næringsstof
 * **1092 — Potassium, K (mg)**, pr. 100 g. Hver værdi nedenfor bærer sin
 * `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Strand & Mathisen 2023) fastsætter et
 * tilstrækkeligt indtag (AI) på **3.500 mg for voksne kvinder og mænd** og et
 * foreløbigt gennemsnitsbehov (AR) på 2.800 mg. Der er ikke sat nogen øvre
 * sikkerhedsgrænse (UL), fordi der ikke findes et mål for skadelig effekt hos
 * raske. Kilde: NNR2023's kaliumafsnit,
 * {@link https://pub.norden.org/nord2023-003/potassium.html}. Kilden skriver
 * også, at kartofler, frugt, grøntsager, korn og kornprodukter, mælk og
 * mejeriprodukter samt kød er de vigtigste kaliumkilder, at ca. 90 % af
 * kaliumet optages, at det gennemsnitlige indtag ligger på 2.400–4.200 mg om
 * dagen, at et indtag over 3.500 mg hænger sammen med lavere risiko for
 * blodprop i hjernen og et lavere blodtryk hos personer med forhøjet
 * blodtryk, og at kaliummangel på grund af lavt indtag er sjælden — men at
 * personer med nedsat nyrefunktion kan få for højt kalium i blodet.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med kalium pr. 100 g fra kilden. */
export interface Kaliumvare extends Madvare {
  /** Kalium pr. 100 g i mg (USDA FoodData Central, næringsstof 1092). */
  kalium100g: number;
}

/** NNR2023's gennemsnitsbehov (AR) for voksne, i mg. */
export const KALIUM_AR_MG = 2800;

/** NNR2023's tilstrækkelige indtag (AI) for voksne kvinder og mænd, i mg. */
export const KALIUM_AI_MG = 3500;

/** NNR2023 sætter ingen øvre sikkerhedsgrænse (UL) for kalium fra kosten. */
export const KALIUM_UL_MG: number | null = null;

/**
 * Den anbefaling, andelskolonnen regner ud fra: det tilstrækkelige indtag på
 * 3.500 mg, som NNR2023 sætter ens for voksne kvinder og mænd.
 */
export const KALIUM_ANBEFALING_MG = KALIUM_AI_MG;

/** Kilden til kaliumtallet pr. `fdcId`. */
export const KALIUM_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1092 Potassium, K (mg)",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/potassium.html",
} as const;

/**
 * Kalium pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1092. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * kaliumfelt i kilden.
 */
const KALIUM_100G: readonly (readonly [number, number])[] = [
  [173944, 358], // Banan
  [168202, 100], // Æble
  [169118, 116], // Pære
  [174683, 191], // Vindrue
  [169097, 181], // Appelsin
  [167762, 153], // Jordbær
  [171711, 77], // Blåbær
  [171719, 222], // Kirsebær
  [167765, 112], // Vandmelon
  [169124, 109], // Ananas
  [169910, 168], // Mango
  [171705, 485], // Avocado
  [169949, 157], // Blomme
  [168164, 746], // Druer, tørrede
  [173945, 1491], // Banan, tørret
  [170393, 320], // Gulerod
  [170026, 425], // Kartoffel, rå
  [170114, 379], // Kartoffel, kogt
  [170111, 535], // Kartoffel, bagt
  [168555, 284], // Kartoffel, mosset
  [170457, 237], // Tomat
  [168409, 147], // Agurk
  [170000, 146], // Løg
  [170379, 316], // Broccoli
  [169986, 299], // Blomkål
  [170108, 211], // Peberfrugt, rød
  [168462, 558], // Spinat
  [171052, 229], // Kylling, hel
  [168250, 421], // Svinekød, kotelet
  [167872, 409], // Skinke
  [168724, 300], // Oksekød, mørbrad
  [174924, 126], // Hvedebrød
  [172684, 166], // Rugbrød
  [172675, 117], // Franskbrød
  [169705, 429], // Havregryn, tørrede
  [168878, 35], // Ris, hvidt, kogt
  [168915, 366], // Nudler, tørrede
  [170688, 410], // Bulgur, tørret
  [168917, 172], // Quinoa, kogt
  [170872, 150], // Mælk, letmælk 1,5 %
  [171265, 132], // Mælk, sødmælk
  [170859, 95], // Fløde, 38 %
  [171284, 155], // Yoghurt, natur
  [172179, 104], // Hytteost
  [171241, 121], // Gouda
  [173420, 62], // Feta
  [173410, 24], // Smør
  [171413, 1], // Olivenolie
  [172336, 0], // Rapsolie
  [167587, 372], // Chokolade, mælke
  [169655, 2], // Sukker
  [171287, 138], // Æg, helt, råt
  [172184, 109], // Æggeblomme
];

const KALIUM_VED_FDC = new Map<number, number>(KALIUM_100G as [number, number][]);

/** Alle madvarer med kalium — altså hele tabellen — i samme rækkefølge. */
export const KALIUM_MADVARER: readonly Kaliumvare[] = MADVARER.map((m) => ({
  ...m,
  kalium100g: KALIUM_VED_FDC.get(m.fdcId) ?? 0,
}));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function kaliumTal(tal: number, decimaler = 0): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Kalium pr. 100 g. Råvarer uden kalium i kilden (olie) giver 0. */
export function kalium100g(vare: Kaliumvare): number {
  return vare.kalium100g;
}

/**
 * Kalium i en given mængde af en madvare. 100 g giver nøjagtig `kalium100g`,
 * så tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function kaliumIgram(vare: Kaliumvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (kalium100g(vare) * gram) / 100;
}

/** Kalium pr. 100 kcal — hvor kaliumrig en madvare er målt på energien. En madvare uden kalorier giver 0. */
export function kaliumPer100Kcal(vare: Kaliumvare): number {
  if (vare.kcal100g <= 0) return 0;
  return (kalium100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor mange gram af madvaren der svarer til hele dages kalium ifølge
 * anbefalingen. Bruges til «Gram for 3.500 mg»-kolonnen. En madvare uden
 * kalium giver 0, og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig
 * viser «∞».
 */
export function gramForAnbefaling(
  vare: Kaliumvare,
  maalMg = KALIUM_ANBEFALING_MG
): number {
  const kalium = kalium100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || kalium <= 0) return 0;
  return (100 * maalMg) / kalium;
}

/**
 * Hvor stor en del af hele dages kalium 100 g af madvaren dækker, i procent. En
 * madvare uden kalium giver 0.
 */
export function andelAfAnbefaling(
  vare: Kaliumvare,
  maalMg = KALIUM_ANBEFALING_MG
): number {
  const kalium = kalium100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || kalium <= 0) return 0;
  return (100 * kalium) / maalMg;
}

/** Alle madvarer, sorteret efter kalium pr. 100 g, den højeste først. */
export function kaliumRangliste(): Kaliumvare[] {
  return [...KALIUM_MADVARER].sort((a, b) => b.kalium100g - a.kalium100g);
}

/**
 * De opslag danskerne faktisk laver (banan, kartoffel, avocado, spinat,
 * havregryn og tomat), hentet fra samme tabel som resten af siden.
 * Rækkefølgen er den, FAQ'en læser.
 */
export const KALIUM_EKSEMPEL_NAVNE = [
  "Banan",
  "Kartoffel, bagt",
  "Avocado",
  "Spinat",
  "Havregryn, tørrede",
  "Tomat",
] as const;

/** Eksempel-madvarerne i {@link KALIUM_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function kaliumEksempler(): Kaliumvare[] {
  return KALIUM_EKSEMPEL_NAVNE.map((navn) => kaliumVareMedNavn(navn)).filter(
    (m): m is Kaliumvare => Boolean(m)
  );
}

/** Opslag i kalium-tabellen på dansk navn. */
export function kaliumVareMedNavn(navn: string): Kaliumvare | undefined {
  return KALIUM_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt kalium-rækkerne med den samme logik som /kalorier bruger, så
 * «banan» og «kartoffel» kan findes med danske navne.
 */
export function soegKaliumvarer(tekst: string): Kaliumvare[] {
  return soegMadvarer(tekst)
    .map((m) => kaliumVareMedNavn(m.navn))
    .filter((m): m is Kaliumvare => Boolean(m));
}

const KARTOFFEL = kaliumVareMedNavn("Kartoffel, bagt")!;
const BANAN = kaliumVareMedNavn("Banan")!;

/** Sidens titel. Tallene er bagt kartoffels og banans kalium pr. 100 g. */
export function kaliumMetaTitel(): string {
  return `Kalium i madvarer: ${kaliumTal(kalium100g(KARTOFFEL))} mg i kartoffel, ${kaliumTal(kalium100g(BANAN))} mg i banan`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function kaliumMetaBeskrivelse(): string {
  return `Se kaliumindholdet i ${KALIUM_MADVARER.length} madvarer pr. 100 g — ${kaliumTal(kalium100g(BANAN))} mg i banan, ${kaliumTal(kalium100g(kaliumVareMedNavn("Avocado")!))} mg i avocado og ${kaliumTal(kalium100g(kaliumVareMedNavn("Havregryn, tørrede")!))} mg i havregryn. Skriv vægten, og regn kalium ud.`;
}
