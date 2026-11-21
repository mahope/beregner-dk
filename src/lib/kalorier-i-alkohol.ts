/**
 * Calories in alcohol — /kalorier-i-alkohol.
 *
 * Every row is a USDA FoodData Central (SR Legacy 2018-04) alcoholic-beverage
 * entry carrying its own `fdcId`, its kcal, ethanol and carbohydrate content
 * per 100 g, and its own density. The density is not a hand-written constant:
 * USDA's portion table weighs 1 fl oz of the drink, and 1 fl oz is 29.5735 ml,
 * so `gramPr100ml = portionGram / 29.5735 * 100`. That matters for spirits —
 * a 4 cl shot is 37.6 g, not 40 g.
 *
 * The standard serving sizes (33 cl øl, 12 cl vin, 4 cl sprits) are the same
 * ones /alkoholenheder uses, so the two pages cannot disagree about what a
 * glass is. No table or FAQ writes a number itself: it reads this module.
 */

/** Kcal per gram of ethanol — the value USDA's Atwater factors use. */
const KCAL_PR_GRAM_ALKOHOL = 6.93;

/** 1 Danish alcohol unit ("genstand") = 12 g pure ethanol (Sundhedsstyrelsen). */
export const GRAM_PR_GENSTAND = 12;

export interface AlkoholDrik {
  id: string;
  navn: string;
  /** The standard Danish serving, in ml. Matches /alkoholenheder. */
  ml: number;
  fdcId: number;
  /** USDA description, kept next to the row so every number has a source. */
  fdcNavn: string;
  /** Energy (nutrient 1008), kcal per 100 g. */
  kcal100g: number;
  /** Alcohol, ethyl (nutrient 1018), g per 100 g. */
  alkohol100g: number;
  /** Carbohydrate, by difference (nutrient 1005), g per 100 g. */
  kulhydrat100g: number;
  /** Density, g per 100 ml, from USDA's own 1 fl oz portion weight. */
  gramPr100ml: number;
}

export const ALKOHOL_DRIKKE: AlkoholDrik[] = [
  {
    id: "oel",
    navn: "Øl, almindelig",
    ml: 330,
    fdcId: 168746,
    fdcNavn: "Alcoholic beverage, beer, regular, all",
    kcal100g: 43,
    alkohol100g: 3.9,
    kulhydrat100g: 3.55,
    gramPr100ml: 100.43,
  },
  {
    id: "oel-let",
    navn: "Øl, let",
    ml: 330,
    fdcId: 168749,
    fdcNavn: "Alcoholic beverage, beer, light",
    kcal100g: 29,
    alkohol100g: 3.1,
    kulhydrat100g: 1.64,
    gramPr100ml: 99.75,
  },
  {
    id: "oel-staerk",
    navn: "Øl, stærk",
    ml: 330,
    fdcId: 171906,
    fdcNavn: "Alcoholic beverages, beer, higher alcohol",
    kcal100g: 58,
    alkohol100g: 7.7,
    kulhydrat100g: 0.27,
    gramPr100ml: 103.47,
  },
  {
    id: "cider",
    navn: "Cider",
    ml: 330,
    fdcId: 174146,
    fdcNavn: "Beverages, AMBER, hard cider",
    kcal100g: 56,
    alkohol100g: 4.0,
    kulhydrat100g: 5.9,
    gramPr100ml: 100.03,
  },
  {
    id: "alkoholfri-oel",
    navn: "Alkoholfri øl",
    ml: 330,
    fdcId: 174863,
    fdcNavn: "Malt beverage, includes non-alcoholic beer",
    kcal100g: 37,
    alkohol100g: 0.3,
    kulhydrat100g: 8.05,
    gramPr100ml: 100.09,
  },
  {
    id: "roedvin",
    navn: "Vin, rød",
    ml: 120,
    fdcId: 173190,
    fdcNavn: "Alcoholic beverage, wine, table, red",
    kcal100g: 85,
    alkohol100g: 10.6,
    kulhydrat100g: 2.61,
    gramPr100ml: 99.41,
  },
  {
    id: "hvidvin",
    navn: "Vin, hvid",
    ml: 120,
    fdcId: 174837,
    fdcNavn: "Alcoholic beverage, wine, table, white",
    kcal100g: 82,
    alkohol100g: 10.3,
    kulhydrat100g: 2.6,
    gramPr100ml: 99.41,
  },
  {
    id: "rosevin",
    navn: "Rosévin",
    ml: 120,
    fdcId: 171908,
    fdcNavn: "Alcoholic beverages, wine, rose",
    kcal100g: 83,
    alkohol100g: 9.6,
    kulhydrat100g: 3.8,
    gramPr100ml: 102.46,
  },
  {
    id: "spirit",
    navn: "Spirit, 40 % (vodka, gin, rom)",
    ml: 40,
    fdcId: 174815,
    fdcNavn: "Alcoholic beverage, distilled, all (gin, rum, vodka, whiskey) 80 proof",
    kcal100g: 231,
    alkohol100g: 33.4,
    kulhydrat100g: 0,
    gramPr100ml: 94.0,
  },
  {
    id: "whisky",
    navn: "Whisky, 43 %",
    ml: 40,
    fdcId: 171919,
    fdcNavn: "Alcoholic beverage, distilled, all (gin, rum, vodka, whiskey) 86 proof",
    kcal100g: 250,
    alkohol100g: 36.0,
    kulhydrat100g: 0.1,
    gramPr100ml: 94.0,
  },
  {
    id: "soedvin",
    navn: "Sødvin",
    ml: 60,
    fdcId: 173176,
    fdcNavn: "Alcoholic beverage, wine, dessert, sweet",
    kcal100g: 160,
    alkohol100g: 15.3,
    kulhydrat100g: 13.69,
    gramPr100ml: 99.75,
  },
];

export type AlkoholTyper = Record<string, number>;

export interface AlkoholRaekke {
  id: string;
  navn: string;
  ml: number;
  antal: number;
  /** Grams of one serving — not ml, because the numbers are per 100 g. */
  gramPrServering: number;
  kcalPrServering: number;
  kcalPr100ml: number;
  kcalTotal: number;
  alkoholGramPrServering: number;
  alkoholGramTotal: number;
  /** Kcal that come from the ethanol alone. */
  kcalFraAlkohol: number;
  /** Kcal from carbs, protein and fat — the rest of the drink. */
  kcalFraKulhydrat: number;
  genstandePrServering: number;
  genstandeTotal: number;
  fdcId: number;
}

export interface AlkoholTotal {
  kcal: number;
  alkoholGram: number;
  genstande: number;
  rækker: AlkoholRaekke[];
}

function antalFor(typer: AlkoholTyper, id: string): number {
  const v = typer[id];
  return Number.isFinite(v) && v && v > 0 ? Math.min(Math.floor(v), 99) : 0;
}

/** Rows with at least one drink, in the order the table shows them. */
export function alkoholRaekker(typer: AlkoholTyper): AlkoholRaekke[] {
  return ALKOHOL_DRIKKE.map((d) => {
    const antal = antalFor(typer, d.id);
    const gramPrServering = (d.ml * d.gramPr100ml) / 100;
    const kcalPrServering = (d.kcal100g * gramPrServering) / 100;
    return {
      id: d.id,
      navn: d.navn,
      ml: d.ml,
      antal,
      gramPrServering,
      kcalPrServering,
      kcalPr100ml: (d.kcal100g * d.gramPr100ml) / 100,
      kcalTotal: kcalPrServering * antal,
      alkoholGramPrServering: (d.alkohol100g * gramPrServering) / 100,
      alkoholGramTotal: (d.alkohol100g * gramPrServering) / 100 * antal,
      kcalFraAlkohol: (d.alkohol100g * gramPrServering) / 100 * KCAL_PR_GRAM_ALKOHOL,
      kcalFraKulhydrat: kcalPrServering - (d.alkohol100g * gramPrServering) / 100 * KCAL_PR_GRAM_ALKOHOL,
      genstandePrServering: (d.alkohol100g * gramPrServering) / 100 / GRAM_PR_GENSTAND,
      genstandeTotal: (d.alkohol100g * gramPrServering) / 100 / GRAM_PR_GENSTAND * antal,
      fdcId: d.fdcId,
    };
  });
}

export function beregnAlkoholKalorier(typer: AlkoholTyper): AlkoholTotal {
  const rækker = alkoholRaekker(typer);
  const valgte = rækker.filter((r) => r.antal > 0);
  return {
    kcal: valgte.reduce((sum, r) => sum + r.kcalTotal, 0),
    alkoholGram: valgte.reduce((sum, r) => sum + r.alkoholGramTotal, 0),
    genstande: valgte.reduce((sum, r) => sum + r.genstandeTotal, 0),
    rækker,
  };
}

/** One serving of one drink, for the sentences in the FAQ and the prose. */
export function drikMedNavn(navn: string): AlkoholDrik | undefined {
  return ALKOHOL_DRIKKE.find((d) => d.navn === navn);
}

export function kcalIServering(drik: AlkoholDrik): number {
  const gram = (drik.ml * drik.gramPr100ml) / 100;
  return (drik.kcal100g * gram) / 100;
}

export function alkoholGramIServering(drik: AlkoholDrik): number {
  const gram = (drik.ml * drik.gramPr100ml) / 100;
  return (drik.alkohol100g * gram) / 100;
}

/** The example sentence the metadata and the intro promise: one beer. */
export const ALKOHOL_EKSEMPEL = (() => {
  const drik = drikMedNavn("Øl, almindelig")!;
  return {
    navn: drik.navn,
    ml: drik.ml,
    kcal: kcalIServering(drik),
    genstande: alkoholGramIServering(drik) / GRAM_PR_GENSTAND,
  };
})();

export const ALKOHOL_KILDE = {
  database: "USDA FoodData Central",
  datasæt: "SR Legacy 2018-04",
  url: "https://fdc.nal.usda.gov",
};
