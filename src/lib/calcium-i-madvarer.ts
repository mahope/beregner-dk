/**
 * Calcium i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * calcium er der i skyr», «… i et glas mælk», «… i havregryn», «… i ost»,
 * «… i kefir» og «… i hytteost» (målt 10/10 2026,
 * `suggestqueries.google.com`, hl=da: syv af de første ti forslag under «hvor
 * meget calcium» er madvarer, og resten er «hvor meget calcium skal man have om
 * dagen»). `/kalorier` svarede på energien og de øvrige «i madvarer»-sider på
 * protein, kulhydrat, fedt, sukker, salt, fiber og jern, men ingen side svarede
 * på calciumindholdet.
 *
 * **Kilden er den samme som på de øvrige «i madvarer»-sider.** Navn, gruppe,
 * kcal, protein, fedt og kulhydrat læses fra `MADVARER` i
 * `kalorier-madvarer.ts`. Calciumindholdet er hentet fra USDA FoodData
 * Central, datasættet *SR Legacy*, udgaven 2018-04, næringsstof
 * **1087 — Calcium, Ca (mg)**, pr. 100 g. Hver værdi nedenfor bærer sin
 * `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Uusi-Rasi & Torfadóttir 2023) angiver
 * anbefalet indtagelse (RI, 97,5 percentil) på **950 mg for voksne kvinder og
 * mænd**, gennemsnitsbehovet (AR) er 750 mg/dag, og den øvre
 * sikkerhedsgrænse (UL) er 2.500 mg/dag. Kilde: NNR2023's calciumafsnit,
 * {{@link https://pub.norden.org/nord2023-003/calcium.html}}. Kilden skriver
 * også, at mælk og mejeriprodukter er den største kilde i de nordiske lande,
 * efterfulgt af kålblomstler (broccoli, grønkål) og calciumberigede varer, og
 * at det gennemsnitlige indtag i Norden ligger på 550–1.200 mg/dag.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med calcium pr. 100 g fra kilden. */
export interface Calciumvare extends Madvare {
  /** Calcium pr. 100 g i mg (USDA FoodData Central, næringsstof 1087). */
  calcium100g: number;
}

/** NNR2023's anbefalede indtagelse (RI) for voksne kvinder og mænd, i mg. */
export const CALCIUM_RI_MG = 950;

/** NNR2023's gennemsnitsbehov (AR) for voksne kvinder og mænd, i mg. */
export const CALCIUM_AR_MG = 750;

/** NNR2023's øvre sikkerhedsgrænse (UL) for voksne, i mg. */
export const CALCIUM_UL_MG = 2500;

/**
 * Den anbefaling, andelskolonnen regner ud fra. NNR2023 bruger samme RI for
 * kvinder og mænd, så der er ingen højeste at vælge mellem.
 */
export const CALCIUM_ANBEFALING_MG = CALCIUM_RI_MG;

/** Kilden til calciumberegnet pr. `fdcId`. */
export const CALCIUM_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1087 Calcium, Ca (mg)",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/calcium.html",
} as const;

/**
 * Calcium pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1087. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * calciumfelt i kilden.
 */
const CALCIUM_100G: readonly (readonly [number, number])[] = [
  [173944, 5.0], // Banan
  [168202, 6.0], // Æble
  [169118, 9.0], // Pære
  [174683, 10.0], // Vindrue
  [169097, 40.0], // Appelsin
  [167762, 16.0], // Jordbær
  [171711, 6.0], // Blåbær
  [171719, 13.0], // Kirsebær
  [167765, 7.0], // Vandmelon
  [169124, 13.0], // Ananas
  [169910, 11.0], // Mango
  [171705, 12.0], // Avocado
  [169949, 6.0], // Blomme
  [168164, 64.0], // Druer, tørrede
  [173945, 22.0], // Banan, tørret
  [170393, 33.0], // Gulerod
  [170026, 12.0], // Kartoffel, rå
  [170114, 5.0], // Kartoffel, kogt
  [170111, 15.0], // Kartoffel, bagt
  [168555, 24.0], // Kartoffel, mosset
  [170457, 10.0], // Tomat
  [168409, 16.0], // Agurk
  [170000, 23.0], // Løg
  [170379, 47.0], // Broccoli
  [169986, 22.0], // Blomkål
  [170108, 7.0], // Peberfrugt, rød
  [168462, 99.0], // Spinat
  [171052, 12.0], // Kylling, hel
  [168250, 6.0], // Svinekød, kotelet
  [167872, 8.0], // Skinke
  [168724, 22.0], // Oksekød, mørbrad
  [174924, 144.0], // Hvedebrød
  [172684, 73.0], // Rugbrød
  [172675, 52.0], // Franskbrød
  [169705, 54.0], // Havregryn, tørrede
  [168878, 10.0], // Ris, hvidt, kogt
  [168915, 27.0], // Nudler, tørrede
  [170688, 35.0], // Bulgur, tørret
  [168917, 17.0], // Quinoa, kogt
  [170872, 125.0], // Mælk, letmælk 1,5 %
  [171265, 113.0], // Mælk, sødmælk
  [170859, 66.0], // Fløde, 38 %
  [171284, 121.0], // Yoghurt, natur
  [172179, 83.0], // Hytteost
  [171241, 700.0], // Gouda
  [173420, 493.0], // Feta
  [173410, 24.0], // Smør
  [171413, 1.0], // Olivenolie
  [172336, 0.0], // Rapsolie
  [167587, 189.0], // Chokolade, mælke
  [169655, 1.0], // Sukker
  [171287, 56.0], // Æg, helt, råt
  [172184, 129.0], // Æggeblomme
];

const CALCIUM_VED_FDC = new Map<number, number>(CALCIUM_100G as [number, number][]);

/** Alle madvarer med calcium — altså hele tabellen — i samme rækkefølge. */
export const CALCIUM_MADVARER: readonly Calciumvare[] = MADVARER.map((m) => ({
  ...m,
  calcium100g: CALCIUM_VED_FDC.get(m.fdcId) ?? 0,
}));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function calciumTal(tal: number, decimaler = 2): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Calcium pr. 100 g. Råvarer uden calcium i kilden (rapsolie, sukker) giver 0. */
export function calcium100g(vare: Calciumvare): number {
  return vare.calcium100g;
}

/**
 * Calcium i en given mængde af en madvare. 100 g giver nøjagtig `calcium100g`,
 * så tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function calciumIgram(vare: Calciumvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (calcium100g(vare) * gram) / 100;
}

/** Calcium pr. 100 kcal — hvor calciumrig en madvare er målt på energien. En madvare uden kalorier giver 0. */
export function calciumPer100Kcal(vare: Calciumvare): number {
  if (vare.kcal100g <= 0) return 0;
  return (calcium100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor mange gram af madvaren der svarer til hele dages calcium ifølge
 * anbefalingen. Bruges til «Gram for 950 mg»-kolonnen. En madvare uden calcium
 * giver 0, og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser
 * «∞».
 */
export function gramForAnbefaling(
  vare: Calciumvare,
  maalMg = CALCIUM_ANBEFALING_MG
): number {
  const calcium = calcium100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || calcium <= 0) return 0;
  return (100 * maalMg) / calcium;
}

/**
 * Hvor stor en del af hele dages calcium 100 g af madvaren dækker, i procent.
 * En madvare uden calcium giver 0.
 */
export function andelAfAnbefaling(
  vare: Calciumvare,
  maalMg = CALCIUM_ANBEFALING_MG
): number {
  const calcium = calcium100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || calcium <= 0) return 0;
  return (100 * calcium) / maalMg;
}

/** Alle madvarer, sorteret efter calcium pr. 100 g, den højeste først. */
export function calciumRangliste(): Calciumvare[] {
  return [...CALCIUM_MADVARER].sort((a, b) => b.calcium100g - a.calcium100g);
}

/**
 * De opslag danskerne faktisk laver (mælk, ost, yoghurt, rugbrød, broccoli og
 * havregryn), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const CALCIUM_EKSEMPEL_NAVNE = [
  "Mælk, letmælk 1,5 %",
  "Yoghurt, natur",
  "Gouda",
  "Rugbrød",
  "Broccoli",
  "Havregryn, tørrede",
] as const;

/** Eksempel-madvarerne i {@link CALCIUM_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function calciumEksempler(): Calciumvare[] {
  return CALCIUM_EKSEMPEL_NAVNE.map((navn) => calciumVareMedNavn(navn)).filter(
    (m): m is Calciumvare => Boolean(m)
  );
}

/** Opslag i calcium-tabellen på dansk navn. */
export function calciumVareMedNavn(navn: string): Calciumvare | undefined {
  return CALCIUM_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt calcium-rækkerne med den samme logik som /kalorier bruger, så
 * «maelk» og «havregryn» kan findes med danske navne.
 */
export function soegCalciumvarer(tekst: string): Calciumvare[] {
  return soegMadvarer(tekst)
    .map((m) => calciumVareMedNavn(m.navn))
    .filter((m): m is Calciumvare => Boolean(m));
}

const GOUDA = calciumVareMedNavn("Gouda")!;
const LETMAELK = calciumVareMedNavn("Mælk, letmælk 1,5 %")!;

/** Sidens titel. Tallene er goudas og letmælks calcium pr. 100 g. */
export function calciumMetaTitel(): string {
  return `Calcium i madvarer: ${calciumTal(calcium100g(GOUDA), 0)} mg i gouda, ${calciumTal(calcium100g(LETMAELK), 0)} mg i letmælk`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function calciumMetaBeskrivelse(): string {
  return `Se calciumindholdet i ${CALCIUM_MADVARER.length} madvarer pr. 100 g — ${calciumTal(calcium100g(LETMAELK), 0)} mg i letmælk, ${calciumTal(calcium100g(GOUDA), 0)} mg i gouda og ${calciumTal(calcium100g(calciumVareMedNavn("Yoghurt, natur")!), 0)} mg i yoghurt. Skriv vægten, og regn calcium ud.`;
}
