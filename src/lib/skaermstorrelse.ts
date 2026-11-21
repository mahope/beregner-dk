/**
 * Skærmstørrelse — hvor mange centimeter er et tv på N tommer, og hvor bredt
 * og højt er det?
 *
 * Et tv opgives altid med sin **diagonale** i tommer. Fysikken er ren
 * geometri: én tomme er præcis 2,54 cm (den internationale tomme fra 1959), og
 * et skærmformat som 16:9 betyder at bredde og højde forholder sig som 16 til
 * 9. Kender man diagonalen og forholdet, er bredden og højden givet:
 *
 *   diagonalens faktor = √(bredde² + højde²)
 *   bredde = diagonal × bredde / faktor
 *   højde  = diagonal × højde / faktor
 *
 * Seerafstanden er ikke en fast kendsgerning, men en anbefaling. Den bygger på
 * den **vandrette synsvinkel**: hvor stor en del af synsfeltet skærmen fylder.
 * En synsvinkel på θ grader giver afstanden `bredde / 2 / tan(θ / 2)`, og
 * branchen anbefaler typisk mellem 30 og 40 grader. Modulet regner begge
 * grænser, så siden kan vise et interval i stedet for ét opfundet tal.
 *
 * Kilde og verificeringsdato: se `SKARM_KILDE` nederst.
 */

/** Den internationale tomme, eksakt: 1 tomme = 2,54 cm. */
export const TOMME_I_CM = 2.54;

/** De skærmformater værktøjet tilbyder. */
export type SkarmFormat = "16:9" | "21:9" | "4:3";

export interface SkarmFormatDef {
  id: SkarmFormat;
  /** Breddeforholdet, fx 16 i 16:9. */
  bredde: number;
  /** Højdeforholdet, fx 9 i 16:9. */
  hoejde: number;
  label: string;
}

export const SKARM_FORMATER: readonly SkarmFormatDef[] = [
  { id: "16:9", bredde: 16, hoejde: 9, label: "16:9 (almindeligt tv)" },
  { id: "21:9", bredde: 21, hoejde: 9, label: "21:9 (ultrawide)" },
  { id: "4:3", bredde: 4, hoejde: 3, label: "4:3 (ældre tv)" },
] as const;

/** Skærmformaterne som værktøjet viser, med 16:9 først. */
export const SKARM_STANDARD_FORMAT: SkarmFormat = "16:9";

/** Diagonalen værktøjet starter på, i tommer. */
export const SKARM_STANDARD_TOMMER = 55;

export interface SkarmMaal {
  /** Diagonalen i tommer, som læseren skrev den. */
  tommer: number;
  format: SkarmFormat;
  /** Diagonalen i centimeter. */
  diagonalCm: number;
  /** Skærmens bredde i centimeter. */
  breddeCm: number;
  /** Skærmens højde i centimeter. */
  hoejdeCm: number;
  /** Billedfladen i m². */
  arealM2: number;
}

/**
 * Regner bredde, højde og areal ud fra en diagonal i tommer og et format.
 *
 * Et 55-tommers tv i 16:9 har en diagonal på `55 × 2,54 = 139,7 cm`, en bredde
 * på `139,7 × 16 ÷ √(16² + 9²) = 121,8 cm` og en højde på `139,7 × 9 ÷ √337 =
 * 68,5 cm`.
 *
 * En diagonal der ikke er et positivt, endeligt tal giver `null`, så et tomt
 * felt viser intet svar frem for «NaN cm».
 */
export function beregnSkarmMaal(
  tommer: number,
  format: SkarmFormat = SKARM_STANDARD_FORMAT,
): SkarmMaal | null {
  if (typeof tommer !== "number" || !Number.isFinite(tommer) || tommer <= 0) {
    return null;
  }
  const def = SKARM_FORMATER.find((f) => f.id === format) ?? SKARM_FORMATER[0];
  const diagonalFaktor = Math.hypot(def.bredde, def.hoejde);
  const diagonalCm = tommer * TOMME_I_CM;
  const breddeCm = (diagonalCm * def.bredde) / diagonalFaktor;
  const hoejdeCm = (diagonalCm * def.hoejde) / diagonalFaktor;
  return {
    tommer,
    format: def.id,
    diagonalCm,
    breddeCm,
    hoejdeCm,
    arealM2: (breddeCm * hoejdeCm) / 10_000,
  };
}

/** Den tætteste anbefalede synsvinkel, i grader — skærmen fylder mest. */
export const SEERAFSTAND_NAER_GRAD = 40;

/** Den fjerneste anbefalede synsvinkel, i grader — mere afslappet. */
export const SEERAFSTAND_FJERN_GRAD = 30;

/**
 * Seerafstanden i centimeter for en given skærmbredde og vandret synsvinkel.
 *
 * `afstand = bredde ÷ 2 ÷ tan(vinkel ÷ 2)`. En 55-tommers skærm er 121,8 cm
 * bred; ved 40 grader skal man sidde 167 cm væk, ved 30 grader 227 cm.
 */
export function seerafstandCm(breddeCm: number, vinkelGrad: number): number {
  if (!Number.isFinite(breddeCm) || breddeCm <= 0) return 0;
  const halv = (vinkelGrad * Math.PI) / 180 / 2;
  return breddeCm / 2 / Math.tan(halv);
}

export interface Seerafstand {
  /** Den korte afstand: synsvinkel 40 grader. */
  naerCm: number;
  /** Den lange afstand: synsvinkel 30 grader. */
  fjernCm: number;
}

/** Seerafstanden som et interval, regnet fra skærmens bredde. */
export function beregnSeerafstand(breddeCm: number): Seerafstand {
  return {
    naerCm: seerafstandCm(breddeCm, SEERAFSTAND_NAER_GRAD),
    fjernCm: seerafstandCm(breddeCm, SEERAFSTAND_FJERN_GRAD),
  };
}

/** De størrelser eksempeltabellen på siden viser, i tommer. */
export const SKARM_TABEL_TOMMER: readonly number[] = [32, 40, 43, 50, 55, 65, 75, 85];

export const SKARM_KILDE = {
  tomme: "https://en.wikipedia.org/wiki/Inch",
  beskrivelse:
    "Den internationale tomme er defineret som præcis 2,54 cm (1959). Seerafstanden bygger på en anbefalet vandret synsvinkel på 30-40 grader, som er branchens gængse interval; afstanden er derfor et interval og ikke et facit.",
  verifiedAt: "2026-10-07",
} as const;
