/**
 * Magnesium i madvarer. Baggrunden er den danske autocomplete-klynge «hvor
 * meget magnesium er der i …» og «hvor meget magnesium skal man have om dagen»
 * (målt 10/10 2026, `suggestqueries.google.com`, hl=da). `/kalorier` svarede på
 * energien og de øvrige «i madvarer»-sider på protein, kulhydrat, fedt, sukker,
 * salt, fiber, jern og calcium, men ingen side svarede på magnesiumindholdet.
 *
 * **Kilden er den samme som på de øvrige «i madvarer»-sider.** Navn, gruppe,
 * kcal, protein, fedt og kulhydrat læses fra `MADVARER` i
 * `kalorier-madvarer.ts`. Magnesiumindholdet er hentet fra USDA FoodData
 * Central, datasættet *SR Legacy*, udgaven 2018-04, næringsstof
 * **1090 — Magnesium, Mg (mg)**, pr. 100 g. Hver værdi nedenfor bærer sin
 * `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Henriksen & Aaseth 2023) fastsætter et
 * tilstrækkeligt indtag (AI) på **300 mg for voksne kvinder** og **350 mg for
 * voksne mænd**, et foreløbigt gennemsnitsbehov (AR) på 240/280 mg og en øvre
 * sikkerhedsgrænse (UL) på 250 mg — men UL gælder **kun magnesium i
 * kosttilskud**, ikke magnesium fra mad. Kilde: NNR2023's magnesiumafsnit,
 * {{@link https://pub.norden.org/nord2023-003/magnesium.html}}. Kilden skriver
 * også, at mælk, fuldkorn, stivelsesholdige rødder, grøntsager og bælgfrugter
 * er de nordiske magnesiumkilder, at indholdet er særligt højt i kakao, nødder
 * og frø, og at det gennemsnitlige indtag ligger på 260–440 mg/dag.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med magnesium pr. 100 g fra kilden. */
export interface Magnesiumvare extends Madvare {
  /** Magnesium pr. 100 g i mg (USDA FoodData Central, næringsstof 1090). */
  magnesium100g: number;
}

/** NNR2023's tilstrækkelige indtag (AI) for voksne kvinder, i mg. */
export const MAGNESIUM_AI_KVINDE_MG = 300;

/** NNR2023's tilstrækkelige indtag (AI) for voksne mænd, i mg. */
export const MAGNESIUM_AI_MAND_MG = 350;

/** NNR2023's foreløbige gennemsnitsbehov (AR) for voksne kvinder, i mg. */
export const MAGNESIUM_AR_KVINDE_MG = 240;

/** NNR2023's foreløbige gennemsnitsbehov (AR) for voksne mænd, i mg. */
export const MAGNESIUM_AR_MAND_MG = 280;

/** NNR2023's øvre sikkerhedsgrænse (UL), i mg. Gælder kun magnesium i tilskud. */
export const MAGNESIUM_UL_MG = 250;

/**
 * Den anbefaling, andelskolonnen regner ud fra: mænds AI, fordi den er den
 * højeste af de to voksne tal — en kost, der dækker den, dækker også kvinders.
 */
export const MAGNESIUM_ANBEFALING_MG = MAGNESIUM_AI_MAND_MG;

/** Kilden til magnesiumtallet pr. `fdcId`. */
export const MAGNESIUM_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1090 Magnesium, Mg (mg)",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/magnesium.html",
} as const;

/**
 * Magnesium pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1090. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * magnesiumfelt i kilden.
 */
const MAGNESIUM_100G: readonly (readonly [number, number])[] = [
  [173944, 27], // Banan
  [168202, 5], // Æble
  [169118, 7], // Pære
  [174683, 7], // Vindrue
  [169097, 10], // Appelsin
  [167762, 13], // Jordbær
  [171711, 6], // Blåbær
  [171719, 11], // Kirsebær
  [167765, 10], // Vandmelon
  [169124, 12], // Ananas
  [169910, 10], // Mango
  [171705, 29], // Avocado
  [169949, 7], // Blomme
  [168164, 35], // Druer, tørrede
  [173945, 108], // Banan, tørret
  [170393, 12], // Gulerod
  [170026, 23], // Kartoffel, rå
  [170114, 22], // Kartoffel, kogt
  [170111, 28], // Kartoffel, bagt
  [168555, 18], // Kartoffel, mosset
  [170457, 11], // Tomat
  [168409, 13], // Agurk
  [170000, 10], // Løg
  [170379, 21], // Broccoli
  [169986, 15], // Blomkål
  [170108, 12], // Peberfrugt, rød
  [168462, 79], // Spinat
  [171052, 25], // Kylling, hel
  [168250, 29], // Svinekød, kotelet
  [167872, 22], // Skinke
  [168724, 20], // Oksekød, mørbrad
  [174924, 23], // Hvedebrød
  [172684, 40], // Rugbrød
  [172675, 32], // Franskbrød
  [169705, 177], // Havregryn, tørrede
  [168878, 12], // Ris, hvidt, kogt
  [168915, 104], // Nudler, tørrede
  [170688, 164], // Bulgur, tørret
  [168917, 64], // Quinoa, kogt
  [170872, 11], // Mælk, letmælk 1,5 %
  [171265, 10], // Mælk, sødmælk
  [170859, 7], // Fløde, 38 %
  [171284, 12], // Yoghurt, natur
  [172179, 8], // Hytteost
  [171241, 29], // Gouda
  [173420, 19], // Feta
  [173410, 2], // Smør
  [171413, 0], // Olivenolie
  [172336, 0], // Rapsolie
  [167587, 63], // Chokolade, mælke
  [169655, 0], // Sukker
  [171287, 12], // Æg, helt, råt
  [172184, 5], // Æggeblomme
];

const MAGNESIUM_VED_FDC = new Map<number, number>(
  MAGNESIUM_100G as [number, number][]
);

/** Alle madvarer med magnesium — altså hele tabellen — i samme rækkefølge. */
export const MAGNESIUM_MADVARER: readonly Magnesiumvare[] = MADVARER.map((m) => ({
  ...m,
  magnesium100g: MAGNESIUM_VED_FDC.get(m.fdcId) ?? 0,
}));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function magnesiumTal(tal: number, decimaler = 2): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Magnesium pr. 100 g. Råvarer uden magnesium i kilden (olie, sukker) giver 0. */
export function magnesium100g(vare: Magnesiumvare): number {
  return vare.magnesium100g;
}

/**
 * Magnesium i en given mængde af en madvare. 100 g giver nøjagtig
 * `magnesium100g`, så tallet i tabellen og tallet i feltet ikke kan komme i
 * strid. Negativt og ikke-tal giver 0.
 */
export function magnesiumIgram(vare: Magnesiumvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (magnesium100g(vare) * gram) / 100;
}

/** Magnesium pr. 100 kcal — hvor magnesiumrig en madvare er målt på energien. En madvare uden kalorier giver 0. */
export function magnesiumPer100Kcal(vare: Magnesiumvare): number {
  if (vare.kcal100g <= 0) return 0;
  return (magnesium100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor mange gram af madvaren der svarer til hele dages magnesium ifølge
 * anbefalingen. Bruges til «Gram for 350 mg»-kolonnen. En madvare uden
 * magnesium giver 0, og et ikke-tal eller negativt mål giver 0, så kolonnen
 * aldrig viser «∞».
 */
export function gramForAnbefaling(
  vare: Magnesiumvare,
  maalMg = MAGNESIUM_ANBEFALING_MG
): number {
  const magnesium = magnesium100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || magnesium <= 0) return 0;
  return (100 * maalMg) / magnesium;
}

/**
 * Hvor stor en del af hele dages magnesium 100 g af madvaren dækker, i procent.
 * En madvare uden magnesium giver 0.
 */
export function andelAfAnbefaling(
  vare: Magnesiumvare,
  maalMg = MAGNESIUM_ANBEFALING_MG
): number {
  const magnesium = magnesium100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || magnesium <= 0) return 0;
  return (100 * magnesium) / maalMg;
}

/** Alle madvarer, sorteret efter magnesium pr. 100 g, den højeste først. */
export function magnesiumRangliste(): Magnesiumvare[] {
  return [...MAGNESIUM_MADVARER].sort((a, b) => b.magnesium100g - a.magnesium100g);
}

/**
 * De opslag danskerne faktisk laver (havregryn, spinat, banan, avocado,
 * chokolade og rugbrød), hentet fra samme tabel som resten af siden.
 * Rækkefølgen er den, FAQ'en læser.
 */
export const MAGNESIUM_EKSEMPEL_NAVNE = [
  "Havregryn, tørrede",
  "Spinat",
  "Banan",
  "Avocado",
  "Chokolade, mælke",
  "Rugbrød",
] as const;

/** Eksempel-madvarerne i {@link MAGNESIUM_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function magnesiumEksempler(): Magnesiumvare[] {
  return MAGNESIUM_EKSEMPEL_NAVNE.map((navn) => magnesiumVareMedNavn(navn)).filter(
    (m): m is Magnesiumvare => Boolean(m)
  );
}

/** Opslag i magnesium-tabellen på dansk navn. */
export function magnesiumVareMedNavn(navn: string): Magnesiumvare | undefined {
  return MAGNESIUM_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt magnesium-rækkerne med den samme logik som /kalorier bruger,
 * så «banan» og «havregryn» kan findes med danske navne.
 */
export function soegMagnesiumvarer(tekst: string): Magnesiumvare[] {
  return soegMadvarer(tekst)
    .map((m) => magnesiumVareMedNavn(m.navn))
    .filter((m): m is Magnesiumvare => Boolean(m));
}

const HAVREGRYN = magnesiumVareMedNavn("Havregryn, tørrede")!;
const SPINAT = magnesiumVareMedNavn("Spinat")!;

/** Sidens titel. Tallene er havregryns og spinats magnesium pr. 100 g. */
export function magnesiumMetaTitel(): string {
  return `Magnesium i madvarer: ${magnesiumTal(magnesium100g(HAVREGRYN), 0)} mg i havregryn, ${magnesiumTal(magnesium100g(SPINAT), 0)} mg i spinat`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function magnesiumMetaBeskrivelse(): string {
  return `Se magnesiumindholdet i ${MAGNESIUM_MADVARER.length} madvarer pr. 100 g — ${magnesiumTal(magnesium100g(HAVREGRYN), 0)} mg i havregryn, ${magnesiumTal(magnesium100g(SPINAT), 0)} mg i spinat og ${magnesiumTal(magnesium100g(magnesiumVareMedNavn("Chokolade, mælke")!), 0)} mg i mælkechokolade. Skriv vægten, og regn magnesium ud.`;
}
