/**
 * Zink i madvarer. Baggrunden er den danske autocomplete-klynge «hvor meget
 * zink er der i …» og «hvor meget zink skal man have om dagen» (målt 10/10
 * 2026, `suggestqueries.google.com`, hl=da) — samme klynge som jern-, calcium-
 * og magnesium-siderne. `/kalorier` svarede på energien og de øvrige «i
 * madvarer»-sider på protein, kulhydrat, fedt, sukker, salt, fiber, jern,
 * calcium og magnesium, men ingen side svarede på zinkindholdet.
 *
 * **Kilden er den samme som på de øvrige «i madvarer»-sider.** Navn, gruppe,
 * kcal, protein, fedt og kulhydrat læses fra `MADVARER` i
 * `kalorier-madvarer.ts`. Zinkindholdet er hentet fra USDA FoodData Central,
 * datasættet *SR Legacy*, udgaven 2018-04, næringsstof
 * **1095 — Zinc, Zn (mg)**, pr. 100 g. Hver værdi nedenfor bærer sin `fdcId`,
 * så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Anbefalingen er den nordiske.** Nordic Nutrition Recommendations 2023
 * (Nordic Council of Ministers, Strand & Mathisen 2023) fastsætter et
 * referenceindtag (RI) på **13 mg for voksne mænd** og **10 mg for voksne
 * kvinder**, et gennemsnitsbehov (AR) på 11/8 mg og en øvre sikkerhedsgrænse
 * (UL) på 25 mg. AR og RI er sat ud fra et fytatindtag på 600 mg/dag, der
 * svarer til en halvraffineret kost. Kilde: NNR2023's zinkafsnit,
 * {{@link https://pub.norden.org/nord2023-003/zinc.html}}. Kilden skriver
 * også, at kød, mælk og mejeriprodukter, bælgfrugter, æg og korn er de
 * nordiske zinkkilder, at fytinsyre og calcium nedsætter optagelsen, at en
 * mere plantebaseret kost derfor øger behovet, og at mennesker med få
 * animalske produkter i kosten — især veganere — er i risiko for manglende
 * zinktilførsel uden tilskud eller beriget mad.
 */

import {
  MADVARER,
  MADVARER_KILDE,
  madvareMedNavn,
  soegMadvarer,
  type Madvare,
} from "./kalorier-madvarer";

export { MADVARER, MADVARER_KILDE, madvareMedNavn, soegMadvarer, type Madvare };

/** En madvare med zink pr. 100 g fra kilden. */
export interface Zinkvare extends Madvare {
  /** Zink pr. 100 g i mg (USDA FoodData Central, næringsstof 1095). */
  zink100g: number;
}

/** NNR2023's gennemsnitsbehov (AR) for voksne kvinder, i mg. */
export const ZINK_AR_KVINDE_MG = 8;

/** NNR2023's gennemsnitsbehov (AR) for voksne mænd, i mg. */
export const ZINK_AR_MAND_MG = 11;

/** NNR2023's referenceindtag (RI) for voksne kvinder, i mg. */
export const ZINK_RI_KVINDE_MG = 10;

/** NNR2023's referenceindtag (RI) for voksne mænd, i mg. */
export const ZINK_RI_MAND_MG = 13;

/** NNR2023's øvre sikkerhedsgrænse (UL), i mg. Gælder zink fra kosttilskud. */
export const ZINK_UL_MG = 25;

/**
 * Den anbefaling, andelskolonnen regner ud fra: mænds RI, fordi den er den
 * højeste af de to voksne tal — en kost, der dækker den, dækker også kvinders.
 */
export const ZINK_ANBEFALING_MG = ZINK_RI_MAND_MG;

/** Kilden til zinktallet pr. `fdcId`. */
export const ZINK_KILDE = {
  database: MADVARER_KILDE.database,
  dataset: MADVARER_KILDE.dataset,
  udgave: MADVARER_KILDE.udgave,
  naeringsstof: "1095 Zinc, Zn (mg)",
  laest: "10/10 2026",
  anbefaling: "https://pub.norden.org/nord2023-003/zinc.html",
} as const;

/**
 * Zink pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1095. Rækkerne
 * følger rækkefølgen i `kalorier-madvarer.ts`, og alle 53 madvarer har et
 * zinkfelt i kilden.
 */
const ZINK_100G: readonly (readonly [number, number])[] = [
  [173944, 0.15], // Banan
  [168202, 0.04], // Æble
  [169118, 0.1], // Pære
  [174683, 0.07], // Vindrue
  [169097, 0.07], // Appelsin
  [167762, 0.14], // Jordbær
  [171711, 0.16], // Blåbær
  [171719, 0.07], // Kirsebær
  [167765, 0.1], // Vandmelon
  [169124, 0.12], // Ananas
  [169910, 0.09], // Mango
  [171705, 0.64], // Avocado
  [169949, 0.1], // Blomme
  [168164, 0.37], // Druer, tørrede
  [173945, 0.61], // Banan, tørret
  [170393, 0.24], // Gulerod
  [170026, 0.3], // Kartoffel, rå
  [170114, 0.3], // Kartoffel, kogt
  [170111, 0.36], // Kartoffel, bagt
  [168555, 0.27], // Kartoffel, mosset
  [170457, 0.17], // Tomat
  [168409, 0.2], // Agurk
  [170000, 0.17], // Løg
  [170379, 0.41], // Broccoli
  [169986, 0.27], // Blomkål
  [170108, 0.25], // Peberfrugt, rød
  [168462, 0.53], // Spinat
  [171052, 1.54], // Kylling, hel
  [168250, 2.42], // Svinekød, kotelet
  [167872, 2.47], // Skinke
  [168724, 3.32], // Oksekød, mørbrad
  [174924, 0.74], // Hvedebrød
  [172684, 1.14], // Rugbrød
  [172675, 1.04], // Franskbrød
  [169705, 3.97], // Havregryn, tørrede
  [168878, 0.49], // Ris, hvidt, kogt
  [168915, 2.4], // Nudler, tørrede
  [170688, 1.93], // Bulgur, tørret
  [168917, 1.09], // Quinoa, kogt
  [170872, 0.42], // Mælk, letmælk 1,5 %
  [171265, 0.37], // Mælk, sødmælk
  [170859, 0.24], // Fløde, 38 %
  [171284, 0.59], // Yoghurt, natur
  [172179, 0.4], // Hytteost
  [171241, 3.9], // Gouda
  [173420, 2.88], // Feta
  [173410, 0.09], // Smør
  [171413, 0], // Olivenolie
  [172336, 0], // Rapsolie
  [167587, 2.3], // Chokolade, mælke
  [169655, 0.01], // Sukker
  [171287, 1.29], // Æg, helt, råt
  [172184, 2.3], // Æggeblomme
];

const ZINK_VED_FDC = new Map<number, number>(ZINK_100G as [number, number][]);

/** Alle madvarer med zink — altså hele tabellen — i samme rækkefølge. */
export const ZINK_MADVARER: readonly Zinkvare[] = MADVARER.map((m) => ({
  ...m,
  zink100g: ZINK_VED_FDC.get(m.fdcId) ?? 0,
}));

/** Et tal skrevet som dansk læser det, så meta og FAQ ikke får engelske kommaer. */
export function zinkTal(tal: number, decimaler = 2): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Zink pr. 100 g. Råvarer uden zink i kilden (olie, sukker) giver 0. */
export function zink100g(vare: Zinkvare): number {
  return vare.zink100g;
}

/**
 * Zink i en given mængde af en madvare. 100 g giver nøjagtig `zink100g`, så
 * tallet i tabellen og tallet i feltet ikke kan komme i strid. Negativt og
 * ikke-tal giver 0.
 */
export function zinkIgram(vare: Zinkvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (zink100g(vare) * gram) / 100;
}

/** Zink pr. 100 kcal — hvor zinkrig en madvare er målt på energien. En madvare uden kalorier giver 0. */
export function zinkPer100Kcal(vare: Zinkvare): number {
  if (vare.kcal100g <= 0) return 0;
  return (zink100g(vare) / vare.kcal100g) * 100;
}

/**
 * Hvor mange gram af madvaren der svarer til hele dages zink ifølge
 * anbefalingen. Bruges til «Gram for 13 mg»-kolonnen. En madvare uden zink
 * giver 0, og et ikke-tal eller negativt mål giver 0, så kolonnen aldrig viser
 * «∞».
 */
export function gramForAnbefaling(
  vare: Zinkvare,
  maalMg = ZINK_ANBEFALING_MG
): number {
  const zink = zink100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || zink <= 0) return 0;
  return (100 * maalMg) / zink;
}

/**
 * Hvor stor en del af hele dages zink 100 g af madvaren dækker, i procent. En
 * madvare uden zink giver 0.
 */
export function andelAfAnbefaling(
  vare: Zinkvare,
  maalMg = ZINK_ANBEFALING_MG
): number {
  const zink = zink100g(vare);
  if (!Number.isFinite(maalMg) || maalMg <= 0 || zink <= 0) return 0;
  return (100 * zink) / maalMg;
}

/** Alle madvarer, sorteret efter zink pr. 100 g, den højeste først. */
export function zinkRangliste(): Zinkvare[] {
  return [...ZINK_MADVARER].sort((a, b) => b.zink100g - a.zink100g);
}

/**
 * De opslag danskerne faktisk laver (oksekød, havregryn, gouda, kylling, æg og
 * rugbrød), hentet fra samme tabel som resten af siden. Rækkefølgen er den,
 * FAQ'en læser.
 */
export const ZINK_EKSEMPEL_NAVNE = [
  "Oksekød, mørbrad",
  "Havregryn, tørrede",
  "Gouda",
  "Kylling, hel",
  "Æg, helt, råt",
  "Rugbrød",
] as const;

/** Eksempel-madvarerne i {@link ZINK_EKSEMPEL_NAVNE}, i samme rækkefølge. */
export function zinkEksempler(): Zinkvare[] {
  return ZINK_EKSEMPEL_NAVNE.map((navn) => zinkVareMedNavn(navn)).filter(
    (m): m is Zinkvare => Boolean(m)
  );
}

/** Opslag i zink-tabellen på dansk navn. */
export function zinkVareMedNavn(navn: string): Zinkvare | undefined {
  return ZINK_MADVARER.find((m) => m.navn === navn);
}

/**
 * Søgning blandt zink-rækkerne med den samme logik som /kalorier bruger, så
 * «oksekød» og «havregryn» kan findes med danske navne.
 */
export function soegZinkvarer(tekst: string): Zinkvare[] {
  return soegMadvarer(tekst)
    .map((m) => zinkVareMedNavn(m.navn))
    .filter((m): m is Zinkvare => Boolean(m));
}

const HAVREGRYN = zinkVareMedNavn("Havregryn, tørrede")!;
const OKSEKOD = zinkVareMedNavn("Oksekød, mørbrad")!;

/** Sidens titel. Tallene er havregryns og oksekøds zink pr. 100 g. */
export function zinkMetaTitel(): string {
  return `Zink i madvarer: ${zinkTal(zink100g(HAVREGRYN))} mg i havregryn, ${zinkTal(zink100g(OKSEKOD))} mg i oksekød`;
}

/** Sidens beskrivelse. Læser de samme tal som tabellen. */
export function zinkMetaBeskrivelse(): string {
  return `Se zinkindholdet i ${ZINK_MADVARER.length} madvarer pr. 100 g — ${zinkTal(zink100g(HAVREGRYN))} mg i havregryn, ${zinkTal(zink100g(OKSEKOD))} mg i oksekød og ${zinkTal(zink100g(zinkVareMedNavn("Gouda")!))} mg i gouda. Skriv vægten, og regn zink ud.`;
}
