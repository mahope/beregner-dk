/**
 * Jern i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * jern er der i æg», «… i havregryn», «… i spinat», «… i leverpostej», «… i
 * oksekød», «… i broccoli» og «… i rødbeder» (målt 10/10 2026,
 * `suggestqueries.google.com`, hl=da: otte af de første ti forslag under «hvor
 * meget jern er der i» er madvarer). `/kalorier` svarede på energien,
 * `/protein-i-madvarer` på proteinet, `/kulhydrater-i-madvarer` på
 * kulhydraterne, `/fedt-i-madvarer` på fedtet, `/sukker-i-madvarer` på
 * sukkeret, `/salt-i-madvarer` på saltet og `/fiber-i-madvarer` på fiberen, men
 * ingen side svarede på jernindholdet.
 *
 * **Kilden er den samme som på de øvrige «i madvarer»-sider.** Navn, gruppe,
 * kcal, protein, fedt og kulhydrat læses fra `MADVARER` i
 * `kalorier-madvarer.ts`. Jernindholdet er hentet fra USDA FoodData Central,
 * datasættet *SR Legacy*, udgaven 2018-04, næringsstof **1089 — Iron, Fe (mg)**,
 * pr. 100 g. Hver værdi nedenfor bærer sin `fdcId`, så den kan slås op i
 * kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Domellöf & Sjöberg 2023) angiver
 * anbefalet indtagelse (RI, 97,5 percentil) på **15 mg for voksne kvinder** og
 * **9 mg for voksne mænd** — kvinder behøver mere på grund af menstruationen.
 * Gennemsnitsbehovet (AR) er 9 mg (kvinder) og 7 mg (mænd), og den øvre
 * sikkerhedsgrænse (UL) er 60 mg/dag. Kilde: NNR2023's jernafsnit,
 * {{@link https://pub.norden.org/nord2023-003/iron.html}}. Sidens tal er
 * alene beregnet fra USDA; anbefalingerne er de eneste ydre værdier, der
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

/** En madvare med jern pr. 100 g fra kilden. */
export interface Jernvare extends Madvare {
  /** Jern pr. 100 g i mg (USDA FoodData Central, næringsstof 1089). */
  jern100g: number;
}

/** NNR2023's anbefalede indtagelse (RI) for voksne kvinder, i mg. */
export const JERN_RI_KVINDE_MG = 15;

/** NNR2023's anbefalede indtagelse (RI) for voksne mænd, i mg. */
export const JERN_RI_MAND_MG = 9;

/** NNR2023's gennemsnitsbehov (AR) for voksne kvinder, i mg. */
export const JERN_AR_KVINDE_MG = 9;

/** NNR2023's gennemsnitsbehov (AR) for voksne mænd, i mg. */
export const JERN_AR_MAND_MG = 7;

/** NNR2023's øvre sikkerhedsgrænse (UL) for voksne, i mg. */
export const JERN_UL_MG = 60;

/**
 * Den anbefaling, andelskolonnen regner ud fra: kvinders RI, fordi den er den
 * højeste af de to voksne tal — en kost, der dækker den, dækker også mænds.
 */
export const JERN_ANBEFALING_MG = JERN_RI_KVINDE_MG;

/** Kilden til jerntallet pr. `fdcId`. */
export const JERN_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1089 Iron, Fe (mg)",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/iron.html",
} as const;

/**
 * Jern pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1089. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * jernfelt i kilden.
 */
const JERN_100G: readonly (readonly [number, number])[] = [
  [173944, 0.26], // Banan
  [168202, 0.13], // Æble
  [169118, 0.18], // Pære
  [174683, 0.36], // Vindrue
  [169097, 0.1], // Appelsin
  [167762, 0.41], // Jordbær
  [171711, 0.28], // Blåbær
  [171719, 0.36], // Kirsebær
  [167765, 0.24], // Vandmelon
  [169124, 0.29], // Ananas
  [169910, 0.16], // Mango
  [171705, 0.55], // Avocado
  [169949, 0.17], // Blomme
  [168164, 0.98], // Druer, tørrede
  [173945, 1.15], // Banan, tørret
  [170393, 0.3], // Gulerod
  [170026, 0.81], // Kartoffel, rå
  [170114, 0.31], // Kartoffel, kogt
  [170111, 1.08], // Kartoffel, bagt
  [168555, 0.26], // Kartoffel, mosset
  [170457, 0.27], // Tomat
  [168409, 0.28], // Agurk
  [170000, 0.21], // Løg
  [170379, 0.73], // Broccoli
  [169986, 0.42], // Blomkål
  [170108, 0.43], // Peberfrugt, rød
  [168462, 2.71], // Spinat
  [171052, 0.89], // Kylling, hel
  [168250, 1.15], // Svinekød, kotelet
  [167872, 1.34], // Skinke
  [168724, 1.42], // Oksekød, mørbrad
  [174924, 3.61], // Hvedebrød
  [172684, 2.83], // Rugbrød
  [172675, 3.91], // Franskbrød
  [169705, 4.72], // Havregryn, tørrede
  [168878, 1.2], // Ris, hvidt, kogt
  [168915, 3.33], // Nudler, tørrede
  [170688, 2.46], // Bulgur, tørret
  [168917, 1.49], // Quinoa, kogt
  [170872, 0.03], // Mælk, letmælk 1,5 %
  [171265, 0.03], // Mælk, sødmælk
  [170859, 0.1], // Fløde, 38 %
  [171284, 0.05], // Yoghurt, natur
  [172179, 0.07], // Hytteost
  [171241, 0.24], // Gouda
  [173420, 0.65], // Feta
  [173410, 0.02], // Smør
  [171413, 0.56], // Olivenolie
  [172336, 0.0], // Rapsolie
  [167587, 2.35], // Chokolade, mælke
  [169655, 0.05], // Sukker
  [171287, 1.75], // Æg, helt, råt
  [172184, 2.73], // Æggeblomme
];

const JERN_VED_FDC = new Map<number, number>(JERN_100G as [number, number][]);

/** Alle madvarer med jern — altså hele tabellen — i samme rækkefølge. */
export const JERN_MADVARER: readonly Jernvare[] = MADVARER.map((m) => ({
  ...m,
  jern100g: JERN_VED_FDC.get(m.fdcId) ?? 0,
}));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function jernTal(tal: number, decimaler = 2): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Jern pr. 100 g. Råvarer uden jern i kilden (rapsolie, sukker) giver 0. */
export function jern100g(vare: Jernvare): number {
  return vare.jern100g;
}

/**
 * Jern i en given mængde af en madvare. 100 g giver nøjagtig `jern100g`, så
 * tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function jernIgram(vare: Jernvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (jern100g(vare) * gram) / 100;
}

/** Jern pr. 100 kcal — hvor jernrig en madvare er målt på energien. En madvare uden kalorier giver 0. */
export function jernPer100Kcal(vare: Jernvare): number {
  if (vare.kcal100g <= 0) return 0;
  return (jern100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor mange gram af madvaren der svarer til hele dages jern ifølge
 * anbefalingen. Bruges til «Gram for 15 mg»-kolonnen. En madvare uden jern
 * giver 0, og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser
 * «∞».
 */
export function gramForAnbefaling(
  vare: Jernvare,
  maalMg = JERN_ANBEFALING_MG
): number {
  const jern = jern100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || jern <= 0) return 0;
  return (100 * maalMg) / jern;
}

/**
 * Hvor stor en del af hele dages jern 100 g af madvaren dækker, i procent.
 * En madvare uden jern giver 0.
 */
export function andelAfAnbefaling(
  vare: Jernvare,
  maalMg = JERN_ANBEFALING_MG
): number {
  const jern = jern100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || jern <= 0) return 0;
  return (100 * jern) / maalMg;
}

/** Alle madvarer, sorteret efter jern pr. 100 g, den højeste først. */
export function jernRangliste(): Jernvare[] {
  return [...JERN_MADVARER].sort((a, b) => b.jern100g - a.jern100g);
}

/**
 * De opslag danskerne faktisk laver (havregryn, spinat, æg, rugbrød, broccoli
 * og oksekød), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const JERN_EKSEMPEL_NAVNE = [
  "Havregryn, tørrede",
  "Spinat",
  "Æg, helt, råt",
  "Rugbrød",
  "Broccoli",
  "Oksekød, mørbrad",
] as const;

/** Eksempel-madvarerne i {@link JERN_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function jernEksempler(): Jernvare[] {
  return JERN_EKSEMPEL_NAVNE.map((navn) => jernVareMedNavn(navn)).filter(
    (m): m is Jernvare => Boolean(m)
  );
}

/** Opslag i jern-tabellen på dansk navn. */
export function jernVareMedNavn(navn: string): Jernvare | undefined {
  return JERN_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt jern-rækkerne med den samme logik som /kalorier bruger, så
 * «roegbrod» og «havregryn» kan findes med danske navne.
 */
export function soegJernvarer(tekst: string): Jernvare[] {
  return soegMadvarer(tekst)
    .map((m) => jernVareMedNavn(m.navn))
    .filter((m): m is Jernvare => Boolean(m));
}

const HAVREGRYN = jernVareMedNavn("Havregryn, tørrede")!;
const SPINAT = jernVareMedNavn("Spinat")!;

/** Sidens titel. Tallene er havregryns og spinats jern pr. 100 g. */
export function jernMetaTitel(): string {
  return `Jern i madvarer: ${jernTal(jern100g(HAVREGRYN))} mg i havregryn, ${jernTal(jern100g(SPINAT))} mg i spinat`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function jernMetaBeskrivelse(): string {
  return `Se jernindholdet i ${JERN_MADVARER.length} madvarer pr. 100 g — ${jernTal(jern100g(HAVREGRYN))} mg i havregryn, ${jernTal(jern100g(SPINAT))} mg i spinat og ${jernTal(jern100g(jernVareMedNavn("Æg, helt, råt")!))} mg i æg. Skriv vægten, og regn jern ud.`;
}
